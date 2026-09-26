#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Holt das 3D-Muskelmodell aus formwert_app.html als bearbeitbare HTML-Datei.

Warum: Das Modell steckt als ein einziger base64-Block (FW3D_HTML_B64) in der
App. Den kann man weder lesen noch ueber patches/ aendern - ALT-Bloecke duerfen
keine Datenbloecke enthalten. Dieses Skript packt ihn aus nach
muskelmodell_3d_vollstaendig.html. Dort wird gearbeitet, danach bringt
modell_einpacken.py die Datei zurueck in die App.

Zusaetzlich wird muskelmodell_3d_vollstaendig.stand.json geschrieben: ein
Fingerabdruck des Modells, wie es beim Auspacken in der App war. Daran merkt
modell_einpacken.py, ob inzwischen jemand anderes das Modell in der App
geaendert hat - dann wuerde Einpacken dessen Arbeit ueberschreiben.

Aufruf:
    python3 werkzeug/modell_auspacken.py
    python3 werkzeug/modell_auspacken.py --ueberschreiben   (eigene, noch nicht
                                           eingepackte Aenderungen verwerfen)
"""
import os, re, sys, json, base64, hashlib, shutil, datetime

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HIER)
APP = os.path.join(REPO, "formwert_app.html")
MODELL = os.path.join(REPO, "muskelmodell_3d_vollstaendig.html")
STAND = os.path.join(REPO, "muskelmodell_3d_vollstaendig.stand.json")

MUSTER = re.compile(r'var FW3D_HTML_B64="([A-Za-z0-9+/=]*)"')


def modell_finden(html):
    """Gibt den Treffer fuer den Modell-Block zurueck. Bricht ab, wenn er nicht
    genau einmal vorkommt - sonst waere unklar, welcher Block gemeint ist."""
    treffer = list(MUSTER.finditer(html))
    if len(treffer) != 1:
        sys.exit("Abbruch: 'var FW3D_HTML_B64=\"...\"' kommt %d mal in "
                 "formwert_app.html vor (erwartet: genau 1). Nichts geaendert."
                 % len(treffer))
    return treffer[0]


def fingerabdruck(daten):
    return hashlib.sha256(daten).hexdigest()


def stand_lesen():
    if not os.path.exists(STAND):
        return None
    with open(STAND, encoding="utf-8") as f:
        return json.load(f)


def stand_schreiben(daten):
    version = ""
    vpfad = os.path.join(REPO, "VERSION")
    if os.path.exists(vpfad):
        version = open(vpfad, encoding="utf-8").readline().strip()
    with open(STAND, "w", encoding="utf-8") as f:
        json.dump({
            "hinweis": "Von werkzeug/modell_auspacken.py erzeugt. Fingerabdruck "
                       "des 3D-Modells, wie es zuletzt in formwert_app.html stand. "
                       "Nicht von Hand aendern.",
            "modell_sha256": fingerabdruck(daten),
            "app_version": version,
            "datum": datetime.date.today().isoformat(),
        }, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    ueberschreiben = "--ueberschreiben" in sys.argv
    if not os.path.exists(APP):
        sys.exit("formwert_app.html nicht gefunden in " + REPO)

    html = open(APP, encoding="utf-8").read()
    daten = base64.b64decode(modell_finden(html).group(1))
    try:
        daten.decode("utf-8")
    except UnicodeDecodeError:
        sys.exit("Abbruch: das eingebettete Modell ist kein gueltiges UTF-8.")

    if os.path.exists(MODELL):
        vorhanden = open(MODELL, "rb").read()
        if vorhanden == daten:
            stand_schreiben(daten)
            print("muskelmodell_3d_vollstaendig.html ist schon auf dem Stand der App.")
            return
        stand = stand_lesen()
        # Weicht die Datei vom letzten ausgepackten Stand ab, liegt dort Arbeit,
        # die noch nicht eingepackt wurde - die darf nicht stillschweigend weg.
        if stand and fingerabdruck(vorhanden) != stand["modell_sha256"] \
                and not ueberschreiben:
            print("Abbruch - nichts geaendert:")
            print("  muskelmodell_3d_vollstaendig.html enthaelt Aenderungen, die noch")
            print("  nicht mit modell_einpacken.py in die App gebracht wurden.")
            print("\n  Erst einpacken, oder die Aenderungen bewusst verwerfen mit:")
            print("  python3 werkzeug/modell_auspacken.py --ueberschreiben")
            sys.exit(1)
        if not stand:
            # Die Datei stammt aus der Zeit vor diesem Skript - Sicherung, falls
            # darin doch etwas steckt, das in der App fehlt.
            shutil.copyfile(MODELL, MODELL + ".vorher")
            print("Alte Fassung gesichert: muskelmodell_3d_vollstaendig.html.vorher")

    with open(MODELL, "wb") as f:
        f.write(daten)
    stand_schreiben(daten)
    print("Ausgepackt: muskelmodell_3d_vollstaendig.html (%d KB)" % (len(daten) // 1024))
    print("Fingerabdruck gemerkt in muskelmodell_3d_vollstaendig.stand.json")
    print("\nDie Datei laesst sich direkt im Browser oeffnen. Danach:")
    print("  python3 werkzeug/modell_einpacken.py --probe")
    print("  python3 werkzeug/modell_einpacken.py")


if __name__ == "__main__":
    main()
