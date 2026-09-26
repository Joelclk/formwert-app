#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bringt das bearbeitete 3D-Muskelmodell zurueck in formwert_app.html.

Gegenstueck zu modell_auspacken.py. Liest muskelmodell_3d_vollstaendig.html,
kodiert es als base64 und ersetzt damit den Block FW3D_HTML_B64 in der App.

Vorher wird geprueft, ob das Modell in der App noch dasselbe ist wie beim
Auspacken. Hat jemand anderes es inzwischen geaendert und veroeffentlicht,
bricht das Skript ab - base64 laesst sich nicht zusammenfuehren, Einpacken
wuerde dessen Arbeit einfach ueberschreiben. Aenderungen am uebrigen App-Code
stoeren dagegen nicht: geprueft wird nur der Modell-Block.

Wichtig: vorher den neuesten Stand von formwert_app.html holen (git pull),
sonst kann die Pruefung eine fremde Aenderung gar nicht sehen.

Aufruf:
    python3 werkzeug/modell_einpacken.py --probe   (nur pruefen)
    python3 werkzeug/modell_einpacken.py
"""
import os, re, sys, base64, shutil, subprocess

from modell_auspacken import (APP, MODELL, STAND, modell_finden, fingerabdruck,
                              stand_lesen, stand_schreiben)

SKRIPT = re.compile(r'<script(\s[^>]*)?>(.*?)</script>', re.S | re.I)

# vm.Script prueft wie ein Browser ein klassisches <script> - ohne es auszufuehren.
JS_PRUEFUNG = ("var vm=require('vm'),fs=require('fs');"
               "try{new vm.Script(fs.readFileSync(0,'utf8'),{filename:process.argv[1]})}"
               "catch(e){console.log(String(e));process.exit(1)}")


def form_pruefen(text):
    """Grobe Pruefung, ob die Datei noch eine vollstaendige HTML-Seite ist -
    eine halb gespeicherte Datei soll nicht in der App landen."""
    fehler = []
    if not text.lstrip().lower().startswith("<!doctype html"):
        fehler.append("beginnt nicht mit <!DOCTYPE html>")
    if not text.rstrip().lower().endswith("</html>"):
        fehler.append("endet nicht mit </html> (Datei unvollstaendig?)")
    return fehler


def skripte_pruefen(text):
    """Syntaxpruefung aller eingebetteten Skripte mit node, falls vorhanden.
    Ein Syntaxfehler im Modell faellt sonst erst in der App auf - als leere
    3D-Ansicht ohne Fehlermeldung."""
    if not shutil.which("node"):
        print("  (node nicht gefunden - Syntaxpruefung der Skripte uebersprungen)")
        return []
    fehler = []
    for i, m in enumerate(SKRIPT.finditer(text), 1):
        attr = (m.group(1) or "").lower()
        if "src=" in attr or ("type=" in attr and "javascript" not in attr):
            continue
        r = subprocess.run(["node", "-e", JS_PRUEFUNG, "script-%d" % i],
                           input=m.group(2), capture_output=True, text=True)
        if r.returncode != 0:
            zeile = text.count("\n", 0, m.start(2)) + 1
            fehler.append("Skript %d (ab Zeile %d): %s"
                          % (i, zeile, (r.stdout or r.stderr).strip().splitlines()[0]))
    return fehler


def main():
    nur_pruefen = "--probe" in sys.argv
    for pfad in (APP, MODELL):
        if not os.path.exists(pfad):
            sys.exit(os.path.basename(pfad) + " nicht gefunden.")
    stand = stand_lesen()
    if not stand:
        sys.exit("Kein Auspack-Stand gefunden. Erst ausfuehren:\n"
                 "  python3 werkzeug/modell_auspacken.py")

    html = open(APP, encoding="utf-8").read()
    treffer = modell_finden(html)
    in_app = base64.b64decode(treffer.group(1))
    neu = open(MODELL, "rb").read()

    if fingerabdruck(in_app) != stand["modell_sha256"]:
        print("Abbruch - nichts geaendert:")
        print("  Das 3D-Modell in formwert_app.html wurde seit dem Auspacken")
        print("  (%s, %s) von jemand anderem geaendert." % (stand["app_version"], stand["datum"]))
        print("  Einpacken wuerde diese Aenderungen ueberschreiben.")
        print("\n  So weiter:")
        print("  1. eigene Datei sichern:  cp muskelmodell_3d_vollstaendig.html mein_modell.html")
        print("  2. neuen Stand auspacken: python3 werkzeug/modell_auspacken.py --ueberschreiben")
        print("  3. eigene Aenderungen dort nachziehen (diff mein_modell.html"
              " muskelmodell_3d_vollstaendig.html)")
        sys.exit(1)

    if neu == in_app:
        print("Nichts zu tun: muskelmodell_3d_vollstaendig.html ist unveraendert.")
        return

    try:
        text = neu.decode("utf-8")
    except UnicodeDecodeError as e:
        sys.exit("Abbruch: muskelmodell_3d_vollstaendig.html ist kein gueltiges "
                 "UTF-8 (%s). Nichts geaendert." % e)

    print("Pruefe muskelmodell_3d_vollstaendig.html ...")
    fehler = form_pruefen(text) + skripte_pruefen(text)
    if fehler:
        print("Abbruch - nichts geaendert:")
        for f in fehler:
            print("  " + f)
        sys.exit(1)

    kodiert = base64.b64encode(neu).decode("ascii")
    html_neu = html[:treffer.start(1)] + kodiert + html[treffer.end(1):]
    print("  in Ordnung. Modell: %d KB -> %d KB"
          % (len(in_app) // 1024, len(neu) // 1024))

    if nur_pruefen:
        print("\nProbe: Einpacken wuerde passen. Nichts geschrieben.")
        return

    shutil.copyfile(APP, APP + ".vorher")
    with open(APP, "w", encoding="utf-8", newline="") as f:
        f.write(html_neu)
    # Ab jetzt ist das eingepackte Modell der Ausgangsstand fuer die naechste Runde.
    stand_schreiben(neu)
    print("\nEingepackt. Sicherung: formwert_app.html.vorher")
    print("Danach:  python3 werkzeug/zerlegen.py")
    print("Die App ist damit noch nicht veroeffentlicht - das macht Claude.")


if __name__ == "__main__":
    main()
