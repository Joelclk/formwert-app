#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Werkzeug fuer den 3D-Bewegungsablauf (die kleine Animation auf der Uebungsseite).

Die Animation besteht aus zwei Teilen, beide gzip-komprimiert und base64-kodiert in
app/assets/:
  anim-viewer.js        FW_ANIM_V       die Betrachter-Seite (three.js + eigener Code)
  anim-modell.js        FW_ANIM_G       das Modell des rechten Arms mit Schultern und Rumpf (GLB)
  anim-modell-bein.js   FW_ANIM_G_BEIN  das Modell des rechten Beins mit Becken (GLB)

Aufrufe:
  python3 werkzeug/animation_einpacken.py viewer-auspacken
      schreibt animation_viewer.html ins Repo-Verzeichnis (dort bearbeiten)
  python3 werkzeug/animation_einpacken.py viewer-einpacken
      bringt animation_viewer.html zurueck nach app/assets/anim-viewer.js
  python3 werkzeug/animation_einpacken.py modell DATEI.glb KENNUNG
      packt eine GLB-Datei ein. KENNUNG "arm" -> anim-modell.js (FW_ANIM_G),
      "bein" -> anim-modell-bein.js (FW_ANIM_G_BEIN). Vorher mit gltfpack verkleinern:
          gltfpack -i roh.glb -o klein.glb -kn -c
      (-kn behaelt die Objektnamen, an denen der Betrachter die Muskeln erkennt.)
  python3 werkzeug/animation_einpacken.py zeigen [KENNUNG]
      listet Bewegungen, Knochen und Objektnamen eines eingepackten Modells
"""
import base64, gzip, json, os, re, struct, sys

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HIER)
ASSETS = os.path.join(REPO, "app", "assets")
VIEWER_JS = os.path.join(ASSETS, "anim-viewer.js")
VIEWER_HTML = os.path.join(REPO, "animation_viewer.html")
MODELLE = {"arm": ("anim-modell.js", "FW_ANIM_G", "Modell GLB"),
           "bein": ("anim-modell-bein.js", "FW_ANIM_G_BEIN", "Modell Bein GLB")}


def lesen(pfad, var):
    js = open(pfad, encoding="utf-8").read()
    m = re.search(r'var ' + var + r'="([A-Za-z0-9+/=]*)"', js)
    if not m:
        sys.exit("Abbruch: %s nicht in %s gefunden." % (var, pfad))
    return gzip.decompress(base64.b64decode(m.group(1)))


def schreiben(pfad, var, daten, titel):
    b64 = base64.b64encode(gzip.compress(daten, 9)).decode("ascii")
    kopf = ("/* 3D-Bewegungsablauf: %s (gzip + base64)\n"
            "   Automatisch eingebetteter Datenblock - nicht von Hand bearbeiten"
            " (werkzeug/animation_einpacken.py). */\n" % titel)
    with open(pfad, "w", encoding="utf-8") as f:
        f.write(kopf + "var " + var + '="' + b64 + '";\n')
    print("geschrieben: %s (%d KB, entpackt %d KB)" % (os.path.relpath(pfad, REPO), len(b64) // 1024, len(daten) // 1024))


def glb_json(glb):
    if glb[:4] != b"glTF":
        sys.exit("Abbruch: keine GLB-Datei.")
    clen = struct.unpack("<I", glb[12:16])[0]
    return json.loads(glb[20:20 + clen])


def zeigen(kennung):
    datei, var, _ = MODELLE[kennung]
    glb = lesen(os.path.join(ASSETS, datei), var)
    j = glb_json(glb)
    print("GLB %d KB, erzeugt von %s" % (len(glb) // 1024, j.get("asset", {}).get("generator")))
    for a in j.get("animations", []):
        dauer = max(j["accessors"][s["input"]]["max"][0] for s in a["samplers"])
        print("  Bewegung %-12s %.2f s, %d Kanaele" % (a["name"], dauer, len(a["channels"])))
    eltern = {}
    for i, n in enumerate(j["nodes"]):
        for c in n.get("children", []):
            eltern[c] = i
    namen = set()
    for i, n in enumerate(j["nodes"]):
        if "mesh" in n:
            k = i
            while k is not None and not j["nodes"][k].get("name"):
                k = eltern.get(k)
            namen.add(j["nodes"][k].get("name") if k is not None else "?")
    print("  %d benannte Objekte, z. B.:" % len(namen))
    for nm in sorted(namen)[:400]:
        print("    " + str(nm))
    if j.get("skins"):
        print("  Skelett mit %d Knochen" % len(j["skins"][0]["joints"]))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    was = sys.argv[1]
    if was == "viewer-auspacken":
        daten = lesen(VIEWER_JS, "FW_ANIM_V")
        open(VIEWER_HTML, "wb").write(daten)
        print("geschrieben: %s (%d KB)" % (os.path.relpath(VIEWER_HTML, REPO), len(daten) // 1024))
    elif was == "viewer-einpacken":
        daten = open(VIEWER_HTML, "rb").read()
        if b"fwanim" not in daten:
            sys.exit("Abbruch: das sieht nicht nach der Betrachter-Seite aus (kein 'fwanim').")
        schreiben(VIEWER_JS, "FW_ANIM_V", daten, "Viewer-HTML")
    elif was == "modell":
        if len(sys.argv) != 4 or sys.argv[3] not in MODELLE:
            sys.exit("Aufruf: modell DATEI.glb arm|bein")
        glb = open(sys.argv[2], "rb").read()
        j = glb_json(glb)
        namen = [a["name"] for a in j.get("animations", [])]
        if not namen:
            sys.exit("Abbruch: die GLB-Datei enthaelt keine Bewegungen.")
        if not j.get("skins"):
            sys.exit("Abbruch: die GLB-Datei enthaelt kein Skelett (Skin).")
        if "EXT_meshopt_compression" not in j.get("extensionsUsed", []):
            print("Hinweis: nicht mit gltfpack verkleinert - die Datei wird unnoetig gross.")
        datei, var, titel = MODELLE[sys.argv[3]]
        schreiben(os.path.join(ASSETS, datei), var, glb, titel)
        print("Bewegungen: " + ", ".join(namen))
        if sys.argv[3] == "bein":
            # Erst mit eingepacktem Modell zeigt die App die Beinuebungen mit Animation.
            anim = os.path.join(REPO, "app", "js", "app", "04-animation.js")
            js = open(anim, encoding="utf-8").read()
            if "var FW_ANIM_BEIN=false;" in js:
                open(anim, "w", encoding="utf-8").write(js.replace("var FW_ANIM_BEIN=false;", "var FW_ANIM_BEIN=true;"))
                print("04-animation.js: FW_ANIM_BEIN auf true gesetzt.")
            erwartet = ["hipcar", "legcircle", "gate", "legswing"]
            fehlt = [n for n in erwartet if n not in namen]
            if fehlt:
                print("Achtung, Bewegungen fehlen im Modell: " + ", ".join(fehlt))
    elif was == "zeigen":
        zeigen(sys.argv[2] if len(sys.argv) > 2 else "arm")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
