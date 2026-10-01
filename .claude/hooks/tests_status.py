#!/usr/bin/env python3
# SessionStart-Hook: meldet, wenn die automatischen Tests auf main rot sind.
# Grund (wissen/erkenntnisse.md, E9): Vom 30.09. abends bis 01.10. waren die Tests bei
# über 25 Pushes rot, ohne dass es jemand gemerkt hat. Ein Test, den keiner ansieht,
# schützt nicht. Bei Grün bleibt der Hook still, damit er keinen Kontext kostet.
import json, os, subprocess

GH = os.path.expanduser('~/.local/bin/gh')

def main():
    try:
        aus = subprocess.run(
            [GH if os.path.exists(GH) else 'gh', 'run', 'list', '-w', 'Tests', '-b', 'main', '-L', '5',
             '--json', 'conclusion,status,displayTitle,createdAt,databaseId'],
            capture_output=True, text=True, timeout=8, cwd=os.environ.get('CLAUDE_PROJECT_DIR') or None)
        laeufe = json.loads(aus.stdout or '[]')
    except (OSError, ValueError, subprocess.TimeoutExpired):
        return
    fertig = [l for l in laeufe if l.get('status') == 'completed']
    if not fertig or fertig[0].get('conclusion') == 'success':
        return
    l = fertig[0]
    print('Achtung: Die automatischen Tests auf main sind rot (Lauf %s, %s, „%s“). '
          'Vor neuen Änderungen oder dem Veröffentlichen erst die Ursache klären: '
          'gh run view %s --log-failed | grep -A2 FEHLER'
          % (l.get('databaseId'), (l.get('createdAt') or '')[:16].replace('T', ' '),
             (l.get('displayTitle') or '')[:60], l.get('databaseId')))

main()
