#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bringt den bearbeiteten 3D-Betrachter zurueck nach app/assets/3d-viewer.js.

Gegenstueck zu modell_auspacken.py. Liest muskelmodell_3d_vollstaendig.html und
schreibt es als JavaScript-Text (FW3D_HTML) nach app/assets/3d-viewer.js. Steht
dort noch die alte base64-Form, wird sie dabei umgestellt - auch ohne inhaltliche
Aenderung (--umstellen).

Vorher wird geprueft, ob der Betrachter in der App noch derselbe ist wie beim
Auspacken. Hat jemand anderes ihn inzwischen geaendert, bricht das Skript ab -
Einpacken wuerde dessen Arbeit einfach ueberschreiben.

Wichtig: vorher den neuesten Stand holen (git pull), sonst kann die Pruefung
eine fremde Aenderung gar nicht sehen.

Aufruf:
    python3 werkzeug/modell_einpacken.py --probe   (nur pruefen)
    python3 werkzeug/modell_einpacken.py
    python3 werkzeug/modell_einpacken.py --umstellen  (nur alte base64-Form umstellen)
"""
import os, re, sys, shutil, subprocess

from modell_auspacken import (VIEWER, MODELL, STAND, modell_lesen, viewer_schreiben,
                              fingerabdruck, stand_lesen, stand_schreiben)

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
    if "--umstellen" in sys.argv:
        umstellen(nur_pruefen)
        return
    for pfad in (VIEWER, MODELL):
        if not os.path.exists(pfad):
            sys.exit(os.path.basename(pfad) + " nicht gefunden.")
    stand = stand_lesen()
    if not stand:
        sys.exit("Kein Auspack-Stand gefunden. Erst ausfuehren:\n"
                 "  python3 werkzeug/modell_auspacken.py")

    in_app = modell_lesen()
    neu = open(MODELL, "rb").read()

    if fingerabdruck(in_app) != stand["modell_sha256"]:
        print("Abbruch - nichts geaendert:")
        print("  Der 3D-Betrachter in app/assets/3d-viewer.js wurde seit dem Auspacken")
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

    print("  in Ordnung. Modell: %d KB -> %d KB"
          % (len(in_app) // 1024, len(neu) // 1024))

    if nur_pruefen:
        print("\nProbe: Einpacken wuerde passen. Nichts geschrieben.")
        return

    shutil.copyfile(VIEWER, VIEWER + ".vorher")
    viewer_schreiben(neu)
    # Ab jetzt ist das eingepackte Modell der Ausgangsstand fuer die naechste Runde.
    stand_schreiben(neu)
    print("\nEingepackt. Sicherung: app/assets/3d-viewer.js.vorher")
    print("Die App ist damit noch nicht veroeffentlicht.")


def umstellen(nur_pruefen):
    """Alte base64-Form in Text umstellen, Inhalt unveraendert - beweisbar per Fingerabdruck."""
    js = open(VIEWER, encoding="utf-8").read()
    if "var FW3D_HTML_B64=" not in js:
        print("3d-viewer.js ist schon umgestellt.")
        return
    daten = modell_lesen()
    alt_kb = len(js.encode("utf-8")) // 1024
    if nur_pruefen:
        print("Probe: wuerde 3d-viewer.js umstellen (%d KB). Nichts geschrieben." % alt_kb)
        return
    viewer_schreiben(daten)
    if fingerabdruck(modell_lesen()) != fingerabdruck(daten):
        sys.exit("Abbruch: nach dem Umstellen weicht der Inhalt ab - bitte aus git wiederherstellen.")
    print("Umgestellt: 3d-viewer.js %d KB -> %d KB, Inhalt identisch."
          % (alt_kb, os.path.getsize(VIEWER) // 1024))


if __name__ == "__main__":
    main()
