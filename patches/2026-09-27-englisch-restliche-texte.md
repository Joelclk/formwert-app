## Englische Oberfläche: drei restliche deutsche Texte

Ein Rundgang in englischer Sprache nach dem Patch `2026-09-26-englische-oberflaeche`
hat noch drei deutsche Stellen gezeigt:

1. **Trendzeile im Heute-Tab** ohne Veränderung: „▬ stabil in 14 days“. Die allgemeine
   Regel für „Tagen“ griff, „stabil in“ blieb deutsch. Jetzt „▬ steady over 14 days“,
   und die Varianten mit Pfeil lauten „▲ +9 over 14 days“ statt „in 14 days“, was im
   Englischen wie eine Vorhersage klang. Das Muster steht vorne, damit es vor der
   allgemeinen „Tagen“-Regel greift.
2. **Knopf „+ Neue Übung erstellen“** in der Übungsauswahl.
3. **Platzhalter „Übung suchen…“** im Suchfeld der Übungsauswahl.

Beide Wörterbucheinträge haben eine englische Übersetzung, die sonst nirgends vergeben
ist, damit der Rückweg ins Deutsche eindeutig bleibt.

ALT:
```js
  for(var k in add)if(!(k in UI_EN))UI_EN[k]=add[k];
```

NEU:
```js
  for(var k in add)if(!(k in UI_EN))UI_EN[k]=add[k];
  // Nachtrag 27.09.: in der Übungsauswahl übersehen
  if(!("+ Neue Übung erstellen" in UI_EN))UI_EN["+ Neue Übung erstellen"]="+ Create new exercise";
  if(!("Übung suchen…" in UI_EN))UI_EN["Übung suchen…"]="Search exercise…";
```

ALT:
```js
    [/(\d+) von (\d+) Sätzen/g,"$1 of $2 sets"],
```

NEU:
```js
    [/(\d+) von (\d+) Sätzen/g,"$1 of $2 sets"],
    [/^▬ stabil in (\d+) Tagen$/g,"▬ steady over $1 days"],
    [/^([▲▼] \+?\d+) in (\d+) Tagen$/g,"$1 over $2 days"],
```
