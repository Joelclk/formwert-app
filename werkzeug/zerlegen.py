#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Zerlegt formwert_app.html in lesbare Einzelteile unter quelltext/.

Warum: Die App ist eine einzige HTML-Datei von rund 13 MB. Davon sind ueber
11 MB eingebettete Daten (3D-Modell, Bilder) - kein Mensch und kein Chat liest
das am Stueck. Dieses Skript legt daneben eine Lesefassung ab: gleicher Code,
nur in handliche Dateien geschnitten, grosse Datenbloecke durch Platzhalter
ersetzt, plus ein Verzeichnis, das sagt, welche Funktion in welcher Datei steht.

Die Dateien unter quelltext/ sind Lesekopien. Sie werden nicht ausgefuehrt und
sind einzeln nicht lauffaehig - die App bleibt formwert_app.html.

Aufruf:  python3 werkzeug/zerlegen.py
"""
import os, re, sys

HIER = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HIER)
QUELLE = os.path.join(REPO, "formwert_app.html")
ZIEL = os.path.join(REPO, "quelltext")

MAX_TEIL = 110000      # Zielgroesse einer Datei in Zeichen
B64_MIN = 2000         # ab dieser Laenge gilt eine Zeichenkette als Datenblock


# ---------------------------------------------------------------- Hilfsmittel

def platzhalter(hinweis, laenge):
    h = ("__" + hinweis) if hinweis else ""
    return '"__DATEN_ENTFERNT%s__%d_ZEICHEN__"' % (h, laenge)


def daten_ersetzen(code):
    """Sehr lange Zeichenketten (base64, data:-URIs) durch Platzhalter ersetzen."""
    ersetzt = []

    def einer(m):
        roh = m.group(1)
        dm = re.match(r'data:([\w/+.-]+);base64', roh)
        if dm:
            hinweis = dm.group(1).replace("/", "_")
        elif re.match(r'^[A-Za-z0-9+/=]+$', roh[:80]):
            hinweis = "base64"
        else:
            return m.group(0)
        ersetzt.append((hinweis, len(roh)))
        return platzhalter(hinweis, len(roh))

    muster = '"([^"\\\\\n]{%d,})"' % B64_MIN
    return re.sub(muster, einer, code), ersetzt


class Scanner(object):
    """Findet die Grenzen der obersten Anweisungen in einem JS-Text.
    Beachtet Zeichenketten, Vorlagen, beide Kommentararten und regulaere
    Ausdruecke, damit geschweifte Klammern darin nicht mitzaehlen."""

    def __init__(self, s):
        self.s = s

    def anweisungen(self, von, bis, tiefe_soll=0):
        s = self.s
        i = von
        tiefe = 0
        start = None
        raus = []
        vorher = ""
        while i < bis:
            c = s[i]
            if c == "/" and i + 1 < bis and s[i + 1] == "/":
                e = s.find("\n", i)
                i = bis if e < 0 else e
                continue
            if c == "/" and i + 1 < bis and s[i + 1] == "*":
                e = s.find("*/", i + 2)
                i = bis if e < 0 else e + 2
                continue
            if c in "\"'`":
                if start is None and tiefe == tiefe_soll:
                    start = i
                q = c
                i += 1
                while i < bis:
                    if s[i] == "\\":
                        i += 2
                        continue
                    if s[i] == q:
                        i += 1
                        break
                    i += 1
                vorher = "x"
                continue
            if c == "/" and vorher not in ("x", ")", "]"):
                if start is None and tiefe == tiefe_soll:
                    start = i
                i += 1
                in_klasse = False
                while i < bis:
                    if s[i] == "\\":
                        i += 2
                        continue
                    if s[i] == "[":
                        in_klasse = True
                    elif s[i] == "]":
                        in_klasse = False
                    elif s[i] == "/" and not in_klasse:
                        i += 1
                        break
                    elif s[i] == "\n":
                        break
                    i += 1
                vorher = "x"
                continue
            if c in "{([":
                if tiefe == tiefe_soll and start is None:
                    start = i
                tiefe += 1
                vorher = c
            elif c in "})]":
                tiefe -= 1
                vorher = "}" if c == "}" else ")"
                if tiefe == tiefe_soll and start is not None and c == "}":
                    raus.append((start, i + 1))
                    start = None
            elif c == ";":
                if tiefe == tiefe_soll:
                    if start is None:
                        start = i
                    raus.append((start, i + 1))
                    start = None
                vorher = ";"
            elif c == "," and tiefe == tiefe_soll and start is not None:
                raus.append((start, i + 1))
                start = None
                vorher = ","
            elif not c.isspace():
                if start is None and tiefe == tiefe_soll:
                    start = i
                vorher = "x" if (c.isalnum() or c in "_$") else c
            i += 1
        if start is not None and start < bis and s[start:bis].strip():
            raus.append((start, bis))
        return raus


def name_von(stueck):
    kopf = stueck.lstrip()[:200]
    m = re.match(r'function\s+([A-Za-z_$][\w$]*)', kopf)
    if m:
        return m.group(1) + "()"
    m = re.match(r'(?:var|let|const)\s+([\w$, ]+?)\s*[=;]', kopf)
    if m:
        return m.group(1).strip()
    m = re.match(r'(?:var|let|const)\s+([A-Za-z_$][\w$]*)', kopf)
    if m:
        return m.group(1)
    m = re.match(r'([A-Za-z_$][\w$.]*)\s*=\s*function', kopf)
    if m:
        return m.group(1) + "()"
    m = re.match(r'(?:window|document)\.[\w.]+', kopf)
    if m:
        return m.group(0)
    return "(Anweisung)"


def schreibe(pfad, text):
    ordner = os.path.dirname(pfad)
    if ordner:
        os.makedirs(ordner, exist_ok=True)
    with open(pfad, "w", encoding="utf-8") as f:
        f.write(text)
    return len(text.encode("utf-8"))


def kopfzeile(was, ersetzt):
    k = ("/* Formwert - Lesekopie, nicht ausfuehrbar.\n"
         "   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.\n"
         "   Enthaelt: %s\n" % was)
    if ersetzt:
        k += "   Gekuerzt: " + ", ".join("%s (%d Zeichen)" % e for e in ersetzt) + "\n"
    return k + "*/\n\n"


def grob_teilen(text, ziel_gr):
    """Einen zu grossen Block an den Grenzen seiner obersten Elemente teilen -
    gedacht fuer lange Listen wie die Uebungsliste EX."""
    auf = text.find("[")
    zu = text.rfind("]")
    if auf < 0 or zu < 0 or zu <= auf:
        zeilen = text.splitlines(True)
        raus, puf, ln = [], [], 0
        for z in zeilen:
            puf.append(z)
            ln += len(z)
            if ln >= ziel_gr:
                raus.append("".join(puf))
                puf, ln = [], 0
        if puf:
            raus.append("".join(puf))
        return raus
    elemente = Scanner(text).anweisungen(auf + 1, zu)
    if not elemente:
        return [text]
    raus, puf, ln = [], [], 0
    for a, b in elemente:
        st = text[a:b]
        if ln and ln + len(st) > ziel_gr:
            raus.append("".join(puf))
            puf, ln = [], 0
        puf.append(st)
        ln += len(st)
    if puf:
        raus.append("".join(puf))
    return raus


# ------------------------------------------------------------------ Hauptteil

def packe(src, bloecke, ordner, praefix, teile, gesammelt, von=0, bis=None):
    """Die Bloecke zu Dateien buendeln. Geschnitten wird luckenlos: jedes
    Stueck reicht vom Ende des vorigen bis zum Ende des eigenen Blocks, damit
    die Kommentare zwischen den Anweisungen nicht verloren gehen."""
    if bis is None:
        bis = len(src)
    zustand = {"nr": 0, "puffer": [], "inhalt": [], "laenge": 0}

    def ablegen():
        if not zustand["puffer"]:
            return
        zustand["nr"] += 1
        text = "".join(zustand["puffer"])
        ersetzt = []
        erste = zustand["inhalt"][0][0]
        letzte = zustand["inhalt"][-1][0]
        was = erste if erste == letzte else ("%s bis %s" % (erste, letzte))
        rel = "%s/%s%02d.js" % (ordner, praefix, zustand["nr"])
        schreibe(os.path.join(ZIEL, rel), kopfzeile(was, ersetzt) + text.strip() + "\n")
        teile.append((rel, was, list(zustand["inhalt"])))
        gesammelt.append(text)
        zustand["puffer"], zustand["inhalt"], zustand["laenge"] = [], [], 0

    pos = von
    for a, b in bloecke:
        stueck = src[pos:b]
        pos = b
        if not stueck.strip():
            continue
        nm = name_von(src[a:b])
        gr = len(stueck)
        if gr > MAX_TEIL * 1.3:
            ablegen()
            stuecke = grob_teilen(stueck, MAX_TEIL)
            for k, st in enumerate(stuecke):
                zustand["nr"] += 1
                was = "%s, Teil %d von %d" % (nm, k + 1, len(stuecke))
                rel = "%s/%s%02d.js" % (ordner, praefix, zustand["nr"])
                schreibe(os.path.join(ZIEL, rel), kopfzeile(was, []) + st.strip() + "\n")
                teile.append((rel, was, [(was, len(st))]))
                gesammelt.append(st)
            continue
        if zustand["laenge"] and zustand["laenge"] + gr > MAX_TEIL:
            ablegen()
        zustand["puffer"].append(stueck if stueck.endswith("\n") else stueck + "\n")
        zustand["inhalt"].append((nm, gr))
        zustand["laenge"] += gr
        if zustand["laenge"] > MAX_TEIL:
            ablegen()
    rest = src[pos:bis]
    if rest.strip():
        zustand["puffer"].append(rest)
        zustand["inhalt"].append(("(Schluss)", len(rest)))
    ablegen()


def index_text(version, teile, gekuerzt):
    z = ["# Quelltext-Verzeichnis", ""]
    z.append("Lesefassung von `formwert_app.html` (Version %s), erzeugt von" % version)
    z.append("`werkzeug/zerlegen.py`. **Diese Dateien werden nicht ausgefuehrt.**")
    z.append("Die App selbst ist und bleibt die eine Datei `formwert_app.html`.")
    z.append("")
    z.append("Sehr lange eingebettete Datenbloecke (3D-Modell, Koerperbilder,")
    z.append("Schriften) sind durch `\"__DATEN_ENTFERNT...\"` ersetzt - sonst waere")
    z.append("die Lesefassung genauso unlesbar wie das Original.")
    z.append("")
    if gekuerzt:
        z.append("Ersetzt wurden %d Datenbloecke mit zusammen %.1f MB." %
                 (len(gekuerzt), sum(g[1] for g in gekuerzt) / 1048576.0))
        z.append("")
    z.append("## Dateien")
    z.append("")
    z.append("| Datei | Groesse | Inhalt |")
    z.append("|---|---:|---|")
    for p, was, inh in teile:
        gr = os.path.getsize(os.path.join(ZIEL, p))
        z.append("| `%s` | %d KB | %s |" % (p, max(1, round(gr / 1024.0)), was))
    z.append("")
    z.append("## Wo steht was")
    z.append("")
    z.append("Alphabetisch nach Name. Die Zahl ist die Groesse in Zeichen.")
    z.append("")
    z.append("| Name | Datei | Zeichen |")
    z.append("|---|---|---:|")
    alle = []
    for p, was, inh in teile:
        for nm, gr in inh:
            if nm == "(Anweisung)":
                continue
            alle.append((nm, p, gr))
    alle.sort(key=lambda x: x[0].lower())
    for nm, p, gr in alle:
        z.append("| `%s` | `%s` | %d |" % (nm, p, gr))
    z.append("")
    return "\n".join(z)


def pruefe(original, stuecke, was):
    """Sicherstellen, dass beim Schneiden nichts verloren ging: der Inhalt
    aller erzeugten Dateien muss - ohne Leerraum - genau dem Original
    entsprechen."""
    ohne = lambda t: re.sub(r"\s+", "", t)
    a = ohne(original)
    b = ohne("".join(stuecke))
    if a != b:
        i = 0
        while i < min(len(a), len(b)) and a[i] == b[i]:
            i += 1
        sys.exit("%s: Inhalt stimmt nicht ueberein (ab Zeichen %d, %d gegen %d)"
                 % (was, i, len(a), len(b)))
    return True


def main():
    if not os.path.exists(QUELLE):
        sys.exit("formwert_app.html nicht gefunden in " + REPO)
    html = open(QUELLE, encoding="utf-8").read()

    stile = [(m.start(1), m.end(1)) for m in re.finditer(r"<style>(.*?)</style>", html, re.S)]
    skripte = [(m.start(1), m.end(1)) for m in re.finditer(r"<script>(.*?)</script>", html, re.S)]
    if len(skripte) < 2 or not stile:
        sys.exit("unerwarteter Aufbau der HTML-Datei")

    version = "unbekannt"
    vpfad = os.path.join(REPO, "VERSION")
    if os.path.exists(vpfad):
        m = re.search(r"Version\s+(\d+)", open(vpfad, encoding="utf-8").read())
        if m:
            version = m.group(1)

    teile = []

    markup = html[stile[-1][1] + len("</style>"):skripte[0][0] - len("<script>")]
    schreibe(os.path.join(ZIEL, "00_grundgeruest.html"), markup.strip() + "\n")
    teile.append(("00_grundgeruest.html", "HTML-Grundgeruest: Tab-Leiste, Seiten, Overlays", []))

    css = html[stile[-1][0]:stile[-1][1]]
    schreibe(os.path.join(ZIEL, "01_gestaltung.css"), css.strip() + "\n")
    teile.append(("01_gestaltung.css", "Farben, Schriften, alle Bausteine der Oberflaeche", []))

    # Datenbloecke zuerst kuerzen - danach wird geschnitten. So steht in der
    # Kopfzeile jeder Datei die richtige Groesse, und die Pruefung unten
    # vergleicht Gleiches mit Gleichem.
    s1, ers1 = daten_ersetzen(html[skripte[0][0]:skripte[0][1]])
    g1 = []
    packe(s1, Scanner(s1).anweisungen(0, len(s1)), "daten", "d", teile, g1, 0, len(s1))
    pruefe(s1, g1, "Datenteil")

    s2, ers2 = daten_ersetzen(html[skripte[1][0]:skripte[1][1]])
    auf = s2.index("{")
    zu = s2.rindex("}")
    g2 = []
    packe(s2, Scanner(s2).anweisungen(auf + 1, zu), "code", "c", teile, g2, auf + 1, zu)
    pruefe(s2[auf + 1:zu], g2, "Programmteil")

    gekuerzt = ers1 + ers2

    schreibe(os.path.join(ZIEL, "INDEX.md"), index_text(version, teile, gekuerzt))
    print("fertig:", ZIEL)
    for p, was, inh in teile:
        gr = os.path.getsize(os.path.join(ZIEL, p))
        print("  %-24s %6d KB  %s" % (p, round(gr / 1024.0), was))


if __name__ == "__main__":
    main()
