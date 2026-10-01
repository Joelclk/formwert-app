#!/usr/bin/env python3
# UserPromptSubmit-Hook: meldet sich, sobald das Gespräch lang wird.
# Grund (wissen/kontingent-2026-10-01.md): 57 % des Kontingents fielen in Schritte mit
# über 500.000 Tokens Gesprächslänge, ein Schritt kostet dort etwa 4× so viel wie frisch.
# Jede Stufe wird pro Sitzung nur einmal gemeldet, damit der Hinweis nicht nervt.
import json, os, sys

STUFEN = [250000, 400000, 600000, 800000]

def gespraechslaenge(pfad):
    """Tokens im Gespräch laut letzter Antwort der Hauptsitzung."""
    try:
        with open(pfad, 'rb') as f:
            f.seek(0, 2)
            f.seek(max(0, f.tell() - 3000000))
            zeilen = f.read().decode('utf-8', 'replace').splitlines()
    except OSError:
        return 0
    for z in reversed(zeilen):
        if '"usage"' not in z:
            continue
        try:
            e = json.loads(z)
        except ValueError:
            continue
        if e.get('isSidechain'):
            continue
        u = (e.get('message') or {}).get('usage') or {}
        n = u.get('input_tokens', 0) + u.get('cache_read_input_tokens', 0) + u.get('cache_creation_input_tokens', 0)
        if n:
            return n
    return 0

def main():
    try:
        daten = json.load(sys.stdin)
    except ValueError:
        return
    n = gespraechslaenge(daten.get('transcript_path') or '')
    stufe = max([s for s in STUFEN if n >= s] or [0])
    if not stufe:
        return
    ordner = os.path.expanduser('~/.claude/kontext-hinweis')
    os.makedirs(ordner, exist_ok=True)
    merk = os.path.join(ordner, (daten.get('session_id') or 'x') + '.txt')
    try:
        alt = int(open(merk).read().strip() or 0)
    except (OSError, ValueError):
        alt = 0
    if stufe <= alt:
        return
    open(merk, 'w').write(str(stufe))
    faktor = max(1.5, round(n / 120000.0, 1))
    print(json.dumps({
        'systemMessage': 'Langes Gespräch: ~%d.000 Tokens. Jeder Schritt kostet jetzt etwa %s× so viel wie in einer frischen Sitzung.' % (n // 1000, faktor),
        'hookSpecificOutput': {
            'hookEventName': 'UserPromptSubmit',
            'additionalContext': (
                'Hinweis Kontingent: Das Gespräch hat ~%d.000 Tokens. Sag Joel am Anfang deiner Antwort in einem Satz, '
                'dass jetzt ein guter Zeitpunkt für eine neue Sitzung ist, sobald die laufende Aufgabe abgeschlossen ist. '
                'Biete an, vorher den Stand in Memory/Plan festzuhalten (Übergabe in wenigen Zeilen). '
                'Die aktuelle Bitte trotzdem normal bearbeiten.' % (n // 1000))
        }
    }, ensure_ascii=False))

if __name__ == '__main__':
    main()
