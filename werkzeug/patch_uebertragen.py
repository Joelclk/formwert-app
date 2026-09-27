#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Überträgt eine Änderungsdatei aus patches/ auf die aufgeteilte App unter app/.

Die Patches bis 27.09.2026 sind für die alte Einzeldatei formwert_app.html geschrieben.
In der aufgeteilten Fassung steht derselbe Code, aber teils mit anderen Zeilenumbrüchen
und Einrückungen. Dieses Skript sucht jeden ALT-Block daher ohne Rücksicht auf
Leerraum in allen Dateien unter app/js/ und ersetzt ihn durch den NEU-Block.

Wie patch_anwenden.py gilt: Jeder ALT-Block muss insgesamt genau einmal vorkommen,
sonst wird nichts geschrieben.

Aufruf:
    python3 werkzeug/patch_uebertragen.py patches/X.md --probe
    python3 werkzeug/patch_uebertragen.py patches/X.md
"""
import glob, os, re, sys

HIER = os.path.dirname(os.path.abspath(__file__))
APP = os.path.join(os.path.dirname(HIER), "app")


def bloecke(text):
    return re.findall(r"ALT:\s*```[a-z]*\n(.*?)```\s*NEU:\s*```[a-z]*\n(.*?)```", text, re.S)


def muster(alt):
    # Jeder Leerraum-Lauf darf beliebig (auch gar nicht) vorhanden sein; zwischen zwei
    # Zeichen ohne Leerraum darf ebenfalls ein Umbruch eingefügt worden sein.
    teile = [re.escape(z) for z in re.sub(r"\s+", "", alt)]
    return re.compile(r"\s*".join(teile))


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    probe = "--probe" in sys.argv
    if len(args) != 1:
        sys.exit(__doc__)
    paare = bloecke(open(args[0], encoding="utf-8").read())
    dateien = sorted(glob.glob(os.path.join(APP, "js", "**", "*.js"), recursive=True))
    inhalt = {p: open(p, encoding="utf-8").read() for p in dateien}
    fehler, plan = [], []
    for i, (alt, neu) in enumerate(paare, 1):
        rx = muster(alt)
        treffer = [(p, m) for p in dateien for m in rx.finditer(inhalt[p])]
        if len(treffer) != 1:
            fehler.append("  Block %d: kommt %d-mal vor (erwartet: genau 1)" % (i, len(treffer)))
            continue
        plan.append((i, treffer[0][0], treffer[0][1], neu))
    for i, p, m, neu in plan:
        print("  Block %d -> %s" % (i, os.path.relpath(p, APP)))
    if fehler:
        print("Abbruch - nichts geaendert:\n" + "\n".join(fehler))
        sys.exit(1)
    if probe:
        print("Probe: alle %d Bloecke passen. Nichts geschrieben." % len(plan))
        return
    # Von hinten ersetzen, damit frühere Positionen in derselben Datei gültig bleiben
    for i, p, m, neu in sorted(plan, key=lambda x: (x[1], -x[2].start())):
        s = inhalt[p]
        inhalt[p] = s[:m.start()] + neu.rstrip("\n") + s[m.end():]
    for p in {x[1] for x in plan}:
        open(p, "w", encoding="utf-8").write(inhalt[p])
    print("%d Bloecke geschrieben." % len(plan))


if __name__ == "__main__":
    main()
