## Fehler im laufenden Training und beim Löschen von Trainings

Fünf Fehler rund um das Training-Tab, alle mit Datenfolgen:

1. **Satz außerhalb des Trainings gelöscht oder bearbeitet** (Heute-Tab, „Satz
   bearbeiten“, „Tag leeren“): Das laufende Training zeigte ihn weiter als abgehakt,
   „Beenden“ zählte ihn in Satzzahl und Volumen mit, gespeichert wurde also mehr, als
   im Tag steht. Bearbeitete kg/Wdh. blieben im Training auf dem alten Wert.
2. **Ausdauer des laufenden Trainings im Heute-Tab gelöscht:** Beim nächsten Aufbau der
   Trainingsseite trug das Training den Eintrag wieder in den Tag ein. Und wenn der Tag
   zwischendurch aus der Cloud neu kam, stand der Eintrag danach doppelt im Tag
   (doppelte Minuten aufs Wochenziel).
3. **Reserve-Knopf ohne Funktion:** Nach dem Zurücknehmen eines Satzes, der beim letzten
   Seitenaufbau schon abgehakt war, sah der Knopf aktiv aus, reagierte aber nicht.
4. **Training löschen ließ seine Ausdauer stehen:** Die Minuten zählten weiter aufs
   Wochenziel, obwohl die Trainingsansicht sie als Teil des Trainings zeigt. Die
   Rückfrage nennt jetzt auch die Ausdauer-Einträge.
5. **Reihenfolge ändern mit derselben Übung zweimal im Training:** Die Seiten blieben an
   der alten Reihenfolge hängen; Eingaben landeten bei der anderen Übung, „Übung
   entfernen“ traf die falsche.

### Training löschen nimmt seine Ausdauer mit; Einträge des laufenden Trainings abgleichen

ALT:
```js
function workoutSetCount(wo){var n=0;for(var k in state.days){(state.days[k].sets||[]).forEach(function(st){if(st.wid===wo.id)n++;});}return n;}
function deleteWorkout(dateKey,wo){
  for(var k in state.days){var dd=state.days[k],before=(dd.sets||[]).length;
    dd.sets=(dd.sets||[]).filter(function(st){return st.wid!==wo.id;});
    if(dd.sets.length!==before)touch(k);}
  var d=day(dateKey);d.workouts=(d.workouts||[]).filter(function(w){return w.id!==wo.id;});touch(dateKey);
  renderAll();toast("Training gelöscht");
}
function confirmDeleteWorkout(dateKey,wo){
  var n=workoutSetCount(wo);
  askConfirm("Training löschen?","„"+wo.name+"“ vom "+deDate(dateKey)+(n?" samt "+(n===1?"einem geloggten Satz":n+" geloggten Sätzen"):"")+" wird dauerhaft entfernt.","Löschen",function(){deleteWorkout(dateKey,wo);},true);
}
function deleteDay(dateKey){
  var d=day(dateKey);d.sets=[];d.cardio=[];d.workouts=[];d.mobility=false;touch(dateKey);renderAll();toast("Tag geleert");
}
```

NEU:
```js
function workoutSetCount(wo){var n=0;for(var k in state.days){(state.days[k].sets||[]).forEach(function(st){if(st.wid===wo.id)n++;});}return n;}
function workoutCardioCount(wo){var n=0;for(var k in state.days){(state.days[k].cardio||[]).forEach(function(c){if(c.wid===wo.id)n++;});}return n;}
// Ausdauer gehört genauso zum Training wie die Sätze – die Trainingsansicht zeigt sie mit an.
// Bliebe sie beim Löschen stehen, zählte ein gelöschtes Training weiter aufs Ausdauer-Wochenziel.
function deleteWorkout(dateKey,wo){
  for(var k in state.days){var dd=state.days[k],before=(dd.sets||[]).length,beforeC=(dd.cardio||[]).length;
    dd.sets=(dd.sets||[]).filter(function(st){return st.wid!==wo.id;});
    dd.cardio=(dd.cardio||[]).filter(function(c){return c.wid!==wo.id;});
    if(dd.sets.length!==before||dd.cardio.length!==beforeC)touch(k);}
  var d=day(dateKey);d.workouts=(d.workouts||[]).filter(function(w){return w.id!==wo.id;});touch(dateKey);
  renderAll();toast("Training gelöscht");
}
function confirmDeleteWorkout(dateKey,wo){
  var n=workoutSetCount(wo),c=workoutCardioCount(wo),teile=[];
  if(n)teile.push(n===1?"einem geloggten Satz":n+" geloggten Sätzen");
  if(c)teile.push(c===1?"einem Ausdauer-Eintrag":c+" Ausdauer-Einträgen");
  askConfirm("Training löschen?","„"+wo.name+"“ vom "+deDate(dateKey)+(teile.length?" samt "+teile.join(" und "):"")+" wird dauerhaft entfernt.","Löschen",function(){deleteWorkout(dateKey,wo);},true);
}
/* Ein Satz aus dem laufenden Training steht zweimal: als Datensatz im Tag (day.sets) und im
   Training (st.rec). Wird er außerhalb des Trainings gelöscht oder bearbeitet (Heute-Tab,
   Satz bearbeiten, Tag leeren), muss das Training nachziehen – sonst zeigt es den Satz weiter
   als abgehakt und "Beenden" zählt ihn mit den alten Werten. Nach einem Neuladen ist st.rec
   nur eine Kopie, darum wird zusätzlich über den Zeitstempel verglichen. */
function syncWorkoutRec(rec,removed){
  if(!workout||!rec||rec.wid!==workout.id)return;
  var hit=false;
  workout.exercises.forEach(function(we){(we.sets||[]).forEach(function(st){
    if(!st.rec||!(st.rec===rec||(rec.ts&&st.rec.ts===rec.ts)))return;
    hit=true;
    if(removed){st.done=false;st.rec=null;}
    else{st.kg=rec.kg;st.reps=rec.reps;if(rec.repsL!=null){st.repsL=rec.repsL;st.repsR=rec.repsR;}st.rec=rec;}
  });});
  if(hit)saveWorkout();
}
// Dasselbe für Ausdauer: Wird der Eintrag außerhalb des Trainings gelöscht, fliegt auch die
// Übung aus dem Training. Sonst trüge das Training ihn beim nächsten Aufbau wieder in den Tag ein.
function dropWorkoutCardio(rec){
  if(!workout||!rec||rec.wid!==workout.id)return;
  var n=workout.exercises.length;
  workout.exercises=workout.exercises.filter(function(we){return we.cardioRec!==rec;});
  if(workout.exercises.length===n)return;
  if(woPage>workout.exercises.length)woPage=workout.exercises.length;
  saveWorkout();
}
function deleteDay(dateKey){
  var d=day(dateKey);
  (d.sets||[]).forEach(function(st){syncWorkoutRec(st,true);});
  (d.cardio||[]).forEach(function(c){dropWorkoutCardio(c);});
  d.sets=[];d.cardio=[];d.workouts=[];d.mobility=false;touch(dateKey);renderAll();toast("Tag geleert");
}
```

### Satz im Heute-Tab löschen: laufendes Training nachziehen

ALT:
```js
          d.sets.splice(idx,1);touch(dateKey);renderAll();
```

NEU:
```js
          syncWorkoutRec(d.sets.splice(idx,1)[0],true);touch(dateKey);renderAll();
```

### Ausdauer im Heute-Tab löschen: laufendes Training nachziehen

ALT:
```js
          d.cardio.splice(i,1);touch(dateKey);renderAll();
```

NEU:
```js
          dropWorkoutCardio(d.cardio.splice(i,1)[0]);touch(dateKey);renderAll();
```

### Satz bearbeiten: laufendes Training nachziehen

ALT:
```js
      touch(date);saveLocal();closeSheet();renderAll();onChange();
    };
```

NEU:
```js
      syncWorkoutRec(s,false);touch(date);saveLocal();closeSheet();renderAll();onChange();
    };
```

### Satz bearbeiten → löschen: laufendes Training nachziehen

ALT:
```js
        state.days[date].sets.splice(setIdx,1);touch(date);saveLocal();closeSheet();renderAll();onChange();
```

NEU:
```js
        syncWorkoutRec(state.days[date].sets.splice(setIdx,1)[0],true);touch(date);saveLocal();closeSheet();renderAll();onChange();
```

### Ausdauer im Training: verlorene Verbindung zum Tag wiederherstellen statt doppelt eintragen

ALT:
```js
      // Sollte der Datensatz nicht (mehr) in einem Tag stehen - etwa weil der Tag
      // zwischendurch aus der Cloud neu geschrieben wurde -, wieder eintragen: sonst
      // laufen die Minuten ins Leere und zaehlen auf kein Wochenziel.
      if(!cardioDayOf(we.cardioRec)){day(TODAY).cardio.push(we.cardioRec);touch(TODAY);}
```

NEU:
```js
      // Sollte der Datensatz nicht (mehr) in einem Tag stehen - etwa weil der Tag
      // zwischendurch aus der Cloud neu geschrieben wurde -, erst die Kopie im Tag suchen
      // (gleiche Uebung, gleiches Training) und nur ohne Treffer neu eintragen. Blindes
      // Eintragen setzte ihn neben die Cloud-Kopie und zaehlte die Minuten doppelt.
      if(!cardioDayOf(we.cardioRec))relinkCardio(workout);
```

### Reserve-Knopf funktioniert nach dem Zurücknehmen eines Satzes

ALT:
```js
      if(st.done){
        rirBtn.disabled=true;
      }else{
        rirBtn.onclick=function(ev){
          ev.preventDefault();ev.stopPropagation();
          var cur=st.rir!=null?st.rir:null;
          st.rir=(cur==null)?0:(cur>=5?null:cur+1);
          saveWorkoutSoon();
          rirBtn.querySelector("b").textContent=rirText(st.rir);
        };
      }
```

NEU:
```js
      if(st.done)rirBtn.disabled=true;
      // Der Handler hängt immer, auch an abgehakten Sätzen: Wird ein Satz zurückgenommen,
      // gibt woUpdate() den Knopf nur wieder frei, ohne die Zeile neu aufzubauen.
      rirBtn.onclick=function(ev){
        ev.preventDefault();ev.stopPropagation();
        if(st.done)return;
        var cur=st.rir!=null?st.rir:null;
        st.rir=(cur==null)?0:(cur>=5?null:cur+1);
        saveWorkoutSoon();
        rirBtn.querySelector("b").textContent=rirText(st.rir);
      };
```

### In-place-Aktualisierung schaltet auch den Reserve-Knopf

ALT:
```js
      var ck=r.querySelector(".wo-check");if(ck){if(st.done)ck.classList.add("on");else ck.classList.remove("on");}
```

NEU:
```js
      var ck=r.querySelector(".wo-check");if(ck){if(st.done)ck.classList.add("on");else ck.classList.remove("on");}
      var rb=r.querySelector(".wo-rir");if(rb){rb.disabled=!!st.done;if(st.done)rb.classList.add("done");else rb.classList.remove("done");}
```

### Reihenfolge ändern baut die Trainingsseiten immer neu auf

ALT:
```js
  saveWorkout();renderSession();
  return true;
}
```

NEU:
```js
  // Zwei gleiche Übungen zu tauschen ergibt denselben woShapeKey. Ohne erzwungenen Neuaufbau
  // blieben Eingabefelder und Knöpfe an der alten Reihenfolge hängen, und "Übung entfernen"
  // träfe die falsche Übung.
  woShape=null;
  saveWorkout();renderSession();
  return true;
}
```
