#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Wendet eine Aenderungsdatei aus patches/ auf formwert_app.html an.

Eine Aenderungsdatei besteht aus Paaren von Textbloecken: ALT und NEU.
Jeder ALT-Block muss in formwert_app.html **genau einmal** vorkommen.
Kommt er keinmal oder mehrfach vor, bricht das Skript ab und aendert nichts -
lieber ein klarer Abbruch als eine Aenderung an der falschen Stelle.

Aufbau einer Aenderungsdatei (Markdown):

    ## Beschreibung der Aenderung

    ALT:
    ```js
    var x = 1;
    ```

    NEU:
    ```js
    var x = 2;
    ```

Aufruf:
    python3 werkzeug/patch_anwenden.py patches/2026-09-18-beispiel.md
    python3 werkzeug/patch_anwenden.py patches/... --probe   (nur pruefen)
"""
import os, re, sys, shutil, datetime

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HIER)
ZIEL = os.path.join(REPO, "formwert_app.html")


def bloecke_lesen(text):
    """Gibt eine Liste von (ueberschrift, alt, neu) zurueck."""
    # Ueberschriften merken, um in Meldungen sagen zu koennen, worum es ging
    teile = []
    muster = re.compile(
        r'ALT:\s*```[\w]*\n(.*?)\n```\s*NEU:\s*```[\w]*\n(.*?)\n```',
        re.S)
    letzte_ueber = ""
    pos = 0
    for m in muster.finditer(text):
        vorspann = text[pos:m.start()]
        ueber = re.findall(r'^#{1,6}\s*(.+)$', vorspann, re.M)
        if ueber:
            letzte_ueber = ueber[-1].strip()
        teile.append((letzte_ueber or "ohne Ueberschrift", m.group(1), m.group(2)))
        pos = m.end()
    return teile


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pfad = sys.argv[1]
    nur_pruefen = "--probe" in sys.argv
    if not os.path.exists(pfad):
        sys.exit("Aenderungsdatei nicht gefunden: " + pfad)
    if not os.path.exists(ZIEL):
        sys.exit("formwert_app.html nicht gefunden in " + REPO)

    aenderungen = bloecke_lesen(open(pfad, encoding="utf-8").read())
    if not aenderungen:
        sys.exit("keine ALT/NEU-Bloecke in " + pfad + " gefunden")

    html = open(ZIEL, encoding="utf-8").read()
    fehler = []
    for i, (ueber, alt, neu) in enumerate(aenderungen, 1):
        n = html.count(alt)
        if n != 1:
            fehler.append("%d. %s: ALT-Block kommt %d mal vor (erwartet: genau 1)"
                          % (i, ueber, n))

    if fehler:
        print("Abbruch - nichts geaendert:")
        for f in fehler:
            print("  " + f)
        print("\nHinweis: der ALT-Block muss buchstabengetreu aus formwert_app.html")
        print("stammen, samt Leerzeichen. Die Lesekopien unter quelltext/ sind")
        print("gekuerzt - lange Datenbloecke stehen dort nur als Platzhalter.")
        sys.exit(1)

    for i, (ueber, alt, neu) in enumerate(aenderungen, 1):
        html = html.replace(alt, neu, 1)
        print("%d. %s - angewendet (%d -> %d Zeichen)" % (i, ueber, len(alt), len(neu)))

    if nur_pruefen:
        print("\nProbe: alle %d Aenderungen wuerden passen. Nichts geschrieben."
              % len(aenderungen))
        return

    sicherung = ZIEL + ".vorher"
    shutil.copyfile(ZIEL, sicherung)
    with open(ZIEL, "w", encoding="utf-8") as f:
        f.write(html)
    print("\n%d Aenderungen geschrieben. Sicherung: %s"
          % (len(aenderungen), os.path.basename(sicherung)))
    print("Danach:  python3 werkzeug/zerlegen.py")
    print("Die App ist damit noch nicht veroeffentlicht - das macht Claude.")


if __name__ == "__main__":
    main()
