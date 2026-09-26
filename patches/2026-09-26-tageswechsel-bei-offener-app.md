## Tageswechsel erkennen, wenn die App über Nacht offen bleibt

`TODAY` wurde nur einmal beim Laden der App bestimmt. Auf dem Handy bleibt die App
aber oft über Nacht oder tagelang im Hintergrund offen. Holt man sie am nächsten
Morgen zurück, zeigt „Heute“ weiter den Vortag, und alles, was man einträgt
(Sätze, Ausdauer, Mobilität, abgeschlossene Trainings), landet auf dem Vortag.
Ringe, Wochenstreifen und Serien stimmen dann ebenfalls nicht.

Jetzt wird das Datum geprüft, sobald die App wieder sichtbar wird (auch nach dem
Zurückholen aus dem Browser-Cache) und einmal pro Minute, falls sie über
Mitternacht im Vordergrund bleibt. Bei einem Wechsel springt „Heute“ auf den neuen
Tag, und die Oberfläche wird neu berechnet. Ein bewusst angesehener früherer Tag
bleibt dabei stehen.

Ein Training, das über Mitternacht läuft, verhält sich wie vorgesehen: Sätze nach
Mitternacht landen auf dem neuen Tag (darauf ist `deleteWorkout()` schon
ausgelegt).

ALT:
```js
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){flushWorkoutSave();flushLocalSave();}});
```

NEU:
```js
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){flushWorkoutSave();flushLocalSave();}else refreshToday();});

// TODAY wird beim Laden bestimmt. Auf dem Handy bleibt die App aber oft über Nacht offen –
// ohne diesen Abgleich landen Einträge vom nächsten Morgen auf dem Vortag. Geprüft wird beim
// Zurückholen der App und minütlich, falls sie über Mitternacht im Vordergrund bleibt.
function refreshToday(){
  var t=iso(new Date());
  if(t===TODAY)return;
  var alt=TODAY;TODAY=t;
  // Wer auf "heute" stand, landet auf dem neuen Tag; ein bewusst angesehener früherer Tag
  // bleibt stehen.
  if(heuteDate===alt)heuteDate=t;
  if(state.profile&&state.profile.version>=3)renderAll();
}

setInterval(refreshToday,60000);

addEventListener("pageshow",refreshToday);
```
