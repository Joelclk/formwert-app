## Werte-Tab schneller: Bestwerte in einem Durchgang statt je Übung

**Ziel-Datei: `js/app/02-berechnung.js` der neuen Dateistruktur (Live-Stand vom 27.09.2026,
80 Dateien).** Nicht für die alte `formwert_app.html` – `werkzeug/patch_anwenden.py` greift
hier nicht, die ALT-Blöcke kommen je genau einmal in `02-berechnung.js` vor.

`compute()` rief für jede im Kraftfenster geloggte Übung `bestFor()` auf, und jeder Aufruf lief
erneut über alle gespeicherten Tage und Sätze. Der Werte-Tab ruft `compute()` rund 120-mal
auf (90 Tage Verlauf, 21 Tage Liste, Ränge, Vitrine). Mit einem Jahr Training (3.536 Sätze)
und Handy-Tempo (CPU 4× gedrosselt) kostete das allein in `bestFor()` rund 200 ms bei jedem
Öffnen nach einer Änderung – mit jeder Trainingswoche mehr.

Jetzt sammelt `compute()` die Sätze in einem Durchgang je Übung und gibt sie `bestFor()` als
optionalen vierten Parameter mit. Reihenfolge der Tage und Sätze bleibt dieselbe, daher auch
dieselben Ergebnisse bei Gleichstand. Alle anderen Aufrufer von `bestFor()` (Körper-Tab,
Übungsdetail, Animation) bleiben unverändert.

Gemessen (ein Jahr Testdaten, CPU 4× gedrosselt):
- Werte-Tab nach einer Änderung: 429 ms → 224 ms
- Zeit in `bestFor()`: 197 ms → 20 ms
- `compute()` für 120 Stichtage: Ergebnisse vorher/nachher identisch (120/120)

ALT:
```js
function bestFor(exid,asOf,win){
  var ex=exById(exid);if(!ex)return {best:null,last:null,bestSet:null};
  var from=shiftDays(asOf,-(win-1)),best=null,last=null,bestSet=null;
  for(var d in state.days){
```

NEU:
```js
// pool (optional): die Saetze dieser Uebung im Fenster als [{d,s}], in derselben Reihenfolge,
// in der die Schleife unten sie faende. compute() sammelt sie in einem Durchgang fuer alle
// Uebungen - sonst liefe jede Uebung erneut ueber alle Tage und Saetze, und der Werte-Tab
// (90 Tage Verlauf) wuerde mit jeder Trainingswoche spuerbar langsamer.
function bestFor(exid,asOf,win,pool){
  var ex=exById(exid);if(!ex)return {best:null,last:null,bestSet:null};
  var from=shiftDays(asOf,-(win-1)),best=null,last=null,bestSet=null;
  if(pool){
    for(var j=0;j<pool.length;j++){
      var ps=pool[j].s,pv=setValue(ex,ps);
      if(best==null||pv>best){best=pv;bestSet=ps;}
      if(last==null||pool[j].d>last)last=pool[j].d;
    }
    return {best:best,last:last,bestSet:bestSet};
  }
  for(var d in state.days){
```

ALT:
```js
  for(var dk in state.days){
    if(dk<fromS||dk>asOf)continue;
    (state.days[dk].sets||[]).forEach(function(s){
      if(seenEx[s.ex])return;
      var ex=exById(s.ex);if(!ex)return;
      var cid=catOfEx(ex);if(!cid)return;
      seenEx[s.ex]=true;
      if(!ex.std){unrated.push({ex:ex,cat:cid});return;}
      var r=bestFor(s.ex,asOf,WIN_STRENGTH),g=r.best!=null?grade(ex,r.best):null;
      recs.push({ex:ex,best:r.best,bestSet:r.bestSet,last:r.last,grade:g,score:g?g.score:0,cat:cid});
    });
  }
```

NEU:
```js
  // Ein Durchgang sammelt alle Saetze je Uebung, danach wird jede Uebung einmal bewertet
  // (Reihenfolge wie bisher: nach erstem Auftreten).
  var pools={},order=[];
  for(var dk in state.days){
    if(dk<fromS||dk>asOf)continue;
    (state.days[dk].sets||[]).forEach(function(s){
      if(!pools[s.ex]){pools[s.ex]=[];order.push(s.ex);}
      pools[s.ex].push({d:dk,s:s});
    });
  }
  order.forEach(function(exid){
    if(seenEx[exid])return;
    var ex=exById(exid);if(!ex)return;
    var cid=catOfEx(ex);if(!cid)return;
    seenEx[exid]=true;
    if(!ex.std){unrated.push({ex:ex,cat:cid});return;}
    var r=bestFor(exid,asOf,WIN_STRENGTH,pools[exid]),g=r.best!=null?grade(ex,r.best):null;
    recs.push({ex:ex,best:r.best,bestSet:r.bestSet,last:r.last,grade:g,score:g?g.score:0,cat:cid});
  });
```
