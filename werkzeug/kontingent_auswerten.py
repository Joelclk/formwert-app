#!/usr/bin/env python3
# Wertet die Claude-Code-Protokolle aus: wohin geht das Kontingent?
# Aufruf: python3 werkzeug/kontingent_auswerten.py  (Ergebnis siehe wissen/kontingent-*.md)
# Gewichtung: Eingabe 1x, Cache-Lesen 0.1x, Cache-Schreiben 2x, Ausgabe 5x.
import json, glob, os, re, sys, collections

BASE = os.path.expanduser('~/.claude/projects/-Users-joelcelik-Documents-GitHub-formwert-app')
W_IN, W_CR, W_CW, W_OUT = 1.0, 0.1, 2.0, 5.0
IMG_TOK = 1500  # grobe Schätzung pro Bild

def bash_kat(cmd):
    c = cmd.lower()
    if 'blender' in c: return 'Bash: Blender'
    if re.search(r'gltfpack|einpacken|auspacken|clip_tauschen|ruck_messen', c): return 'Bash: Einpacken/Messen'
    if re.search(r'\bgit\b|\bgh\b', c): return 'Bash: Git'
    if 'python' in c: return 'Bash: Python-Skripte'
    if re.search(r'\bnode\b', c): return 'Bash: Node-Prüfungen'
    return 'Bash: Sonstiges'

def tool_kat(name, inp):
    if name == 'Bash': return bash_kat(inp.get('command', ''))
    if name.startswith('mcp__Claude_Browser__'): return 'Eingebauter Browser'
    if name.startswith('mcp__claude-in-chrome__'): return 'Chrome'
    if name.startswith('mcp__computer-use__'): return 'Bildschirmsteuerung'
    if name in ('Read',): return 'Dateien lesen'
    if name in ('Edit', 'Write', 'NotebookEdit'): return 'Dateien schreiben'
    if name in ('Grep', 'Glob'): return 'Dateien suchen'
    if name in ('WebSearch', 'WebFetch'): return 'Web-Recherche'
    if name.startswith('Artifact'): return 'Artifact veröffentlichen'
    if name in ('Agent', 'Task', 'SendMessage'): return 'Helfer-Agenten (Auftrag/Antwort)'
    if name.startswith('mcp__'): return 'Andere Connectoren'
    return 'Sonstige Werkzeuge'

def groesse(content):
    """Geschätzte Tokens eines Inhalts; Bilder getrennt."""
    txt, img = 0, 0
    if isinstance(content, str):
        return len(content) / 3.5, 0
    if isinstance(content, list):
        for b in content:
            if not isinstance(b, dict): continue
            t = b.get('type')
            if t == 'text': txt += len(b.get('text', '')) / 3.5
            elif t == 'image': img += IMG_TOK
            elif t == 'tool_result':
                a, b2 = groesse(b.get('content'))
                txt += a; img += b2
    return txt, img

def werte_datei(pfad):
    kosten = collections.Counter()      # Kategorie -> effektive Tokens
    roh = collections.Counter()
    modelle = collections.Counter()
    tage = collections.Counter()
    kontext = collections.Counter()     # Kategorie -> geschätzte Tokens im Kontext
    tool_namen = {}                     # tool_use_id -> Kategorie
    gesehen = set()
    letzter_cr = 0
    pending_neu = collections.Counter() # neuer Inhalt seit letztem Aufruf
    aufrufe = 0
    with open(pfad, errors='replace') as f:
        for zeile in f:
            try: e = json.loads(zeile)
            except Exception: continue
            typ = e.get('type')
            msg = e.get('message') or {}
            if typ == 'user':
                c = msg.get('content')
                if isinstance(c, list):
                    for b in c:
                        if isinstance(b, dict) and b.get('type') == 'tool_result':
                            kat = tool_namen.get(b.get('tool_use_id'), 'Sonstige Werkzeuge')
                            t, i = groesse(b.get('content'))
                            pending_neu[kat] += t
                            pending_neu['Bilder/Screenshots'] += i
                        elif isinstance(b, dict):
                            t, i = groesse([b])
                            pending_neu['Unterhaltung'] += t
                            pending_neu['Bilder/Screenshots'] += i
                elif isinstance(c, str):
                    pending_neu['Unterhaltung'] += len(c) / 3.5
            elif typ == 'attachment' or typ == 'system':
                pending_neu['Grundanweisungen'] += len(zeile) / 3.5 * 0.3
            elif typ == 'assistant':
                u = msg.get('usage') or {}
                mid = msg.get('id')
                # Werkzeugaufrufe merken (auch bei Teilzeilen derselben Nachricht)
                outkat = collections.Counter()
                for b in msg.get('content') or []:
                    if not isinstance(b, dict): continue
                    if b.get('type') == 'tool_use':
                        kat = tool_kat(b.get('name', ''), b.get('input') or {})
                        tool_namen[b.get('id')] = kat
                        n = len(json.dumps(b.get('input') or {})) / 3.5
                        outkat[kat] += n
                        pending_neu[kat] += n
                    elif b.get('type') in ('text', 'thinking'):
                        n = len(b.get('text') or b.get('thinking') or '') / 3.5
                        outkat['Unterhaltung'] += n
                        pending_neu['Unterhaltung'] += n
                if not mid or mid in gesehen or not u: continue
                gesehen.add(mid)
                aufrufe += 1
                inp = u.get('input_tokens', 0); cr = u.get('cache_read_input_tokens', 0)
                cw = u.get('cache_creation_input_tokens', 0); out = u.get('output_tokens', 0)
                modelle[msg.get('model', '?')] += inp*W_IN + cr*W_CR + cw*W_CW + out*W_OUT
                tag = (e.get('timestamp') or '')[:10]
                tage[tag] += inp*W_IN + cr*W_CR + cw*W_CW + out*W_OUT
                for k, v in (('Eingabe', inp), ('Cache lesen', cr), ('Cache schreiben', cw), ('Ausgabe', out)):
                    roh[k] += v
                # Verdichtung/neuer Cache: Kontext beginnt neu
                if cr < letzter_cr * 0.5:
                    kontext = collections.Counter()
                    if cr > 0: kontext['Grundanweisungen'] += cr
                letzter_cr = cr
                if not kontext:
                    # erster Aufruf: alles, was schon da ist, sind Grundanweisungen
                    kontext['Grundanweisungen'] += cr + cw + inp
                    pending_neu.clear()
                # Neu geschriebener Cache = Inhalt seit dem letzten Aufruf
                neu_sum = sum(pending_neu.values())
                schreib = cw + inp
                if neu_sum > 0:
                    for k, v in pending_neu.items():
                        anteil = schreib * v / neu_sum
                        kosten[k] += anteil * W_CW
                else:
                    kosten['Grundanweisungen'] += schreib * W_CW
                # Gelesener Cache = gesamter bisheriger Kontext, anteilig
                ksum = sum(kontext.values())
                if ksum > 0:
                    for k, v in kontext.items():
                        kosten[k] += cr * W_CR * v / ksum
                # Ausgabe nach Art der Antwort
                osum = sum(outkat.values())
                if osum > 0:
                    for k, v in outkat.items(): kosten[k] += out * W_OUT * v / osum
                else:
                    kosten['Unterhaltung'] += out * W_OUT
                # Kontext fortschreiben, skaliert auf die echten Cache-Zahlen
                if neu_sum > 0:
                    for k, v in pending_neu.items(): kontext[k] += schreib * v / neu_sum
                else:
                    kontext['Grundanweisungen'] += schreib
                pending_neu.clear()
    return dict(kosten=kosten, roh=roh, modelle=modelle, tage=tage, aufrufe=aufrufe)

def erster_auftrag(pfad):
    with open(pfad, errors='replace') as f:
        for zeile in f:
            try: e = json.loads(zeile)
            except Exception: continue
            if e.get('type') == 'user':
                c = (e.get('message') or {}).get('content')
                if isinstance(c, str) and not c.startswith('<'): return c[:110].replace('\n', ' ')
                if isinstance(c, list):
                    for b in c:
                        if isinstance(b, dict) and b.get('type') == 'text' and not b['text'].startswith('<'):
                            return b['text'][:110].replace('\n', ' ')
    return '?'

ergebnis = {'sitzungen': [], 'gesamt': collections.Counter(), 'modelle': collections.Counter(),
            'tage': collections.Counter(), 'agenten': []}
for pfad in sorted(glob.glob(BASE + '/*.jsonl')):
    sid = os.path.basename(pfad)[:8]
    r = werte_datei(pfad)
    summe = sum(r['kosten'].values())
    agent_summe = 0
    for ap in glob.glob(BASE + '/' + os.path.basename(pfad)[:-6] + '/subagents/*.jsonl'):
        ra = werte_datei(ap)
        s = sum(ra['kosten'].values())
        agent_summe += s
        ergebnis['agenten'].append((sid, os.path.basename(ap), s, list(ra['modelle'].keys()), erster_auftrag(ap)))
        ergebnis['modelle'] += ra['modelle']; ergebnis['tage'] += ra['tage']
    ergebnis['gesamt'] += r['kosten']
    ergebnis['gesamt']['Helfer-Agenten (eigene Arbeit)'] += agent_summe
    ergebnis['modelle'] += r['modelle']; ergebnis['tage'] += r['tage']
    ergebnis['sitzungen'].append((sid, summe, agent_summe, r['aufrufe'], dict(r['roh']), erster_auftrag(pfad),
                                  r['kosten'].most_common(5)))

ges = sum(ergebnis['gesamt'].values())
print('GESAMT effektiv (Mio):', round(ges/1e6, 1))
for k, v in ergebnis['gesamt'].most_common():
    print(f'  {k:38s} {v/1e6:8.1f}  {100*v/ges:5.1f}%')
print('\nMODELLE')
for k, v in ergebnis['modelle'].most_common(): print(f'  {k:30s} {v/1e6:8.1f}')
print('\nTAGE')
for k, v in sorted(ergebnis['tage'].items()): print(f'  {k} {v/1e6:8.1f}')
print('\nSITZUNGEN')
for s in sorted(ergebnis['sitzungen'], key=lambda x: -(x[1]+x[2])):
    print(f'  {s[0]} haupt {s[1]/1e6:7.1f} agenten {s[2]/1e6:6.1f} aufrufe {s[3]:5d}  | {s[5]}')
    print('      roh:', {k: round(v/1e6, 1) for k, v in s[4].items()})
    print('      top:', [(k, round(v/1e6, 1)) for k, v in s[6]])
print('\nAGENTEN')
for a in sorted(ergebnis['agenten'], key=lambda x: -x[2]):
    print(f'  {a[0]} {a[2]/1e6:6.1f} {a[3]} | {a[4]}')
