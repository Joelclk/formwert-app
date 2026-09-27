#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Holt den 3D-Anatomie-Betrachter aus app/assets/3d-viewer.js als bearbeitbare
HTML-Datei.

Warum: Die Betrachter-Seite steht dort als ein einziger JavaScript-Text (FW3D_HTML,
frueher zusaetzlich base64-kodiert als FW3D_HTML_B64). Darin sucht und aendert man
schlecht. Dieses Skript packt sie aus nach muskelmodell_3d_vollstaendig.html. Dort
wird gearbeitet, danach bringt modell_einpacken.py die Datei zurueck.

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
VIEWER = os.path.join(REPO, "app", "assets", "3d-viewer.js")
MODELL = os.path.join(REPO, "muskelmodell_3d_vollstaendig.html")
STAND = os.path.join(REPO, "muskelmodell_3d_vollstaendig.stand.json")

KOPF = ("/* 3D-Anatomie-Viewer (komplette HTML-Seite als Text)\n"
        "   Automatisch erzeugt von werkzeug/modell_einpacken.py - nicht von Hand bearbeiten.\n"
        "   Frueher base64-kodiert (FW3D_HTML_B64); als Text entfaellt das Auspacken beim Oeffnen. */\n")


# Rueckweg fuer einen alten 04-animation.js, falls beim Veroeffentlichen nur diese Datei neu
# ankommt: Er liest FW3D_HTML_B64. Das wird erst beim Zugriff berechnet, kostet also nichts,
# solange der neue Code FW3D_HTML direkt nimmt.
ALTER_NAME = ('try{Object.defineProperty(window,"FW3D_HTML_B64",{configurable:true,get:function(){'
              'return btoa(unescape(encodeURIComponent(FW3D_HTML)));}});}catch(e){}\n')


def modell_lesen():
    """Betrachter-Seite aus 3d-viewer.js als UTF-8-Bytes. Liest beide Formen, damit das
    Werkzeug auch mit einem noch nicht umgestellten Stand funktioniert."""
    if not os.path.exists(VIEWER):
        sys.exit("app/assets/3d-viewer.js nicht gefunden.")
    js = open(VIEWER, encoding="utf-8").read()
    m = re.search(r'var FW3D_HTML=("(?:[^"\\]|\\.)*");', js, re.S)
    if m:
        return json.loads(m.group(1)).encode("utf-8")
    m = re.search(r'var FW3D_HTML_B64="([A-Za-z0-9+/=]*)"', js)
    if m:
        return base64.b64decode(m.group(1))
    sys.exit("Abbruch: weder FW3D_HTML noch FW3D_HTML_B64 in 3d-viewer.js gefunden.")


def viewer_schreiben(daten):
    """Schreibt die Seite als JavaScript-Text. U+2028/U+2029 werden maskiert, weil aeltere
    JavaScript-Engines sie in Zeichenketten nicht erlauben."""
    text = json.dumps(daten.decode("utf-8"), ensure_ascii=False)
    text = text.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
    with open(VIEWER, "w", encoding="utf-8", newline="") as f:
        f.write(KOPF + "var FW3D_HTML=" + text + ";\n" + ALTER_NAME)


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
                       "des 3D-Betrachters, wie er zuletzt in app/assets/3d-viewer.js stand. "
                       "Nicht von Hand aendern.",
            "modell_sha256": fingerabdruck(daten),
            "app_version": version,
            "datum": datetime.date.today().isoformat(),
        }, f, ensure_ascii=False, indent=2)
        f.write("\n")


def main():
    ueberschreiben = "--ueberschreiben" in sys.argv
    daten = modell_lesen()
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
