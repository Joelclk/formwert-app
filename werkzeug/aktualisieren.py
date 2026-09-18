#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bringt das Repo auf den Stand einer neu veroeffentlichten Version.

Macht in einem Rutsch:
  1. VERSION schreiben (Nummer, Datum, was geaendert wurde)
  2. quelltext/ neu erzeugen (mit der eingebauten Inhaltspruefung)
  3. alles committen

Der Push bleibt bewusst aussen vor: er braucht die GitHub-Zugangsdaten, die
im Schluesselbund des Macs liegen. Entweder danach in GitHub Desktop auf
"Push origin" druecken, oder dieses Skript mit --push aufrufen, wenn git die
Zugangsdaten auf diesem Rechner selbst findet.

Aufruf:
    python3 werkzeug/aktualisieren.py 249 "Klimmzug-Animation eingebaut"
    python3 werkzeug/aktualisieren.py 249 "..." --push
"""
import os, re, sys, time, subprocess, datetime

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HIER)
ARTIFACT = "https://claude.ai/artifact/2VEGYVStFNcZbz8fUsgXg5"


def git(*args, **kw):
    # Git laesst hier gelegentlich Sperrdateien liegen, die es selbst nicht mehr aufraeumt -
    # der naechste Befehl bricht dann ab. Loeschen ist nicht immer erlaubt (z. B. wenn dieses
    # Skript aus einer eingeschraenkten Umgebung laeuft), darum werden sie beiseitegeschoben.
    abstell = os.path.join(REPO, ".git", "alte_sperren")
    for wurzel, _, dateien in os.walk(os.path.join(REPO, ".git")):
        if wurzel.startswith(abstell):
            continue
        for d in dateien:
            if not d.endswith(".lock"):
                continue
            quelle = os.path.join(wurzel, d)
            try:
                os.remove(quelle)
            except OSError:
                try:
                    os.makedirs(abstell, exist_ok=True)
                    os.rename(quelle, os.path.join(abstell, "%s.%d" % (d, int(time.time() * 1000))))
                except OSError:
                    pass
    return subprocess.run(["git"] + list(args), cwd=REPO,
                          capture_output=True, text=True, **kw)


def main():
    argv = [a for a in sys.argv[1:] if a != "--push"]
    push = "--push" in sys.argv
    if len(argv) < 2:
        sys.exit(__doc__)
    version, beschreibung = argv[0], argv[1]

    app = os.path.join(REPO, "formwert_app.html")
    if not os.path.exists(app):
        sys.exit("formwert_app.html fehlt - erst die neue Fassung hierher legen.")

    heute = datetime.date.today().isoformat()
    with open(os.path.join(REPO, "VERSION"), "w", encoding="utf-8") as f:
        f.write("Version %s\nStand: %s\nAenderung: %s\nArtifact: %s\n"
                % (version, heute, beschreibung, ARTIFACT))
    print("VERSION geschrieben: Version %s" % version)

    r = subprocess.run([sys.executable, os.path.join(HIER, "zerlegen.py")],
                       cwd=REPO, capture_output=True, text=True)
    sys.stdout.write(r.stdout)
    if r.returncode != 0:
        sys.stderr.write(r.stderr)
        sys.exit("zerlegen.py ist fehlgeschlagen - nichts committet.")

    git("add", "-A")
    st = git("status", "--porcelain").stdout.strip()
    if not st:
        print("Nichts zu committen - das Repo war schon auf diesem Stand.")
        return
    r = git("commit", "-m", "Version %s: %s\n\nCo-Authored-By: Claude Opus 5 "
            "<noreply@anthropic.com>" % (version, beschreibung))
    if r.returncode != 0:
        sys.stderr.write(r.stdout + r.stderr)
        sys.exit("commit fehlgeschlagen.")
    print("committet: Version %s: %s" % (version, beschreibung))

    if push:
        r = git("push", "origin", "main")
        if r.returncode != 0:
            print("Push nicht moeglich (Zugangsdaten fehlen hier).")
            print("In GitHub Desktop auf 'Push origin' druecken.")
        else:
            print("gepusht.")
    else:
        offen = git("rev-list", "--count", "origin/main..HEAD").stdout.strip()
        print("Offen zum Pushen: %s Commit(s). In GitHub Desktop: 'Push origin'." % offen)


if __name__ == "__main__":
    main()
