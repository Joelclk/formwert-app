## Fehler in Auswertung, Onboarding und Körper-Tab

1. **Körper- und Werte-Tab zeigten während eines Trainings veraltete Zahlen.** Abgehakte
   Sätze fehlten dort, bis man einmal den Heute-Tab öffnete.
2. **Onboarding „1RM bekannt“ bei Kurzhantel-Übungen („pro Seite“):** Die Vorschau
   wertete 30 kg, gespeichert und später gewertet wurden 60 kg – die Stufe sprang nach dem
   Abschluss. Das Gewichtsfeld sagt jetzt auch „pro Seite“.
3. **„Assessment neu machen“ löschte Profildaten:** Cooper-Test, persönliche
   Volumen-Korridore, Sprache, Startdatum und Bestwerte gingen verloren. Das Startdatum
   verkürzte dabei auch die Auswertungsfenster für Konstanz, Mobilität und Ausdauer.
4. **Muskel-Info im Körper-Tab brach ab**, wenn man einen Muskel antippte, der zu keiner
   gezählten Gruppe gehört (Hand, Fuß, Hals, tiefe Wade …). Die Anzeige blieb dann auf dem
   vorigen Muskel stehen.

### Körper und Werte rechnen während eines Trainings mit dem aktuellen Stand

ALT:
```js
  var c=lastC,pk=state.profile.peaks||{};if(!c)return;
  if(id==="tab-koerper")
```

NEU:
```js
  var c=lastC,pk=state.profile.peaks||{};
  // Während eines Trainings rechnet renderLight() bewusst nicht alles neu, sondern setzt nur
  // heuteDirty. Körper und Werte brauchen aber den aktuellen Stand – sonst fehlen dort die
  // gerade abgehakten Sätze, bis man einmal den Heute-Tab öffnet.
  if(heuteDirty&&id!=="tab-training")c=lastC=compute(TODAY);
  if(!c)return;
  if(id==="tab-koerper")
```

### Onboarding „1RM bekannt“: pro Seite genauso werten wie später gespeichert

ALT:
```js
  if(e.t==="load"){if(ob.mode[id]==="max")return ob.kg[id]||0;return e1rm(effectiveKg(e,ob.kg[id]),ob.val[id]||0);}
```

NEU:
```js
  // Gespeichert wird das eingetragene Gewicht; gewertet wird es später mit effectiveKg (bei
  // "pro Seite" verdoppelt). Die Vorschau muss genauso rechnen, sonst springt die Stufe nach dem
  // Abschluss.
  if(e.t==="load"){if(ob.mode[id]==="max")return effectiveKg(e,ob.kg[id]);return e1rm(effectiveKg(e,ob.kg[id]),ob.val[id]||0);}
```

### Onboarding: Gewichtsfeld sagt bei Kurzhantel-Übungen „pro Seite“

ALT:
```js
      if(e.t==="load")grid.appendChild(nfield(isMax?"Einer-Maximum (kg)":"Gewicht (kg)",ob.kg[id],"2.5",function(v){ob.kg[id]=v;}));
```

NEU:
```js
      if(e.t==="load")grid.appendChild(nfield((isMax?"Einer-Maximum":"Gewicht")+(e.wt==="side"?" pro Seite":"")+" (kg)",ob.kg[id],"2.5",function(v){ob.kg[id]=v;}));
```

### „Assessment neu machen“ behält Cooper-Test, Korridore, Sprache, Startdatum und Bestwerte

ALT:
```js
function finishOnboarding(){
  state.profile=buildProfile();var d=day(TODAY);
```

NEU:
```js
function finishOnboarding(){
  // Das Assessment fragt nur Eckdaten, Hauptübungen und Ziele ab. Beim Wiederholen bleibt
  // alles andere am Profil erhalten: Cooper-Test, persönliche Korridore, Sprache, Startdatum
  // (daran hängen die Auswertungsfenster) und Bestwerte.
  var old=state.profile,neu=buildProfile();
  if(old&&old.version>=3){for(var k in old){if(!(k in neu)||k==="cooper"||k==="peaks"||k==="startedAt")neu[k]=old[k];}}
  state.profile=neu;var d=day(TODAY);
```

### Muskel-Info im Körper-Tab bricht bei Hand, Fuß & Co. nicht mehr ab

ALT:
```js
  if(selFine&&FINE[selFine]){
    var f=FINE[selFine],m=muscleById(f.g),v=Math.round((ms[f.g]||0)*10)/10,z=zoneOf(v,m),em=emphasisSets(selFine,TODAY);
    co.innerHTML='<b>'+f.la+'</b><span>'+f.de+'</span><em class="z'+z+'">'+reizPct(v,m)+' % Reiz · '+v+' Sätze · '+zoneLabel(z)+(em!=null?' · '+em+' mit Betonung hier':'')+'</em>';
  } else {
    var ids=[];selSet.forEach(function(k){var g=FINE[k].g;if(ids.indexOf(g)<0)ids.push(g);});
    var tot=0,ok=0;ids.forEach(function(id){var mm=muscleById(id),vv=ms[id]||0;tot+=vv;var zz=zoneOf(vv,mm);if(zz===1)ok++;});
    var names=ids.map(function(id){return muscleById(id).name;}).join(" · ");
    co.innerHTML='<b>'+selLabel+'</b>'+(names!==selLabel?'<span>'+names+'</span>':'')+'<em class="'+(ok?"z1":"z0")+'">'+(Math.round(tot*10)/10)+' Sätze · '+ok+' von '+ids.length+' im Korridor</em>';
  }
}
```

NEU:
```js
  if(selFine&&FINE[selFine]){
    var f=FINE[selFine],m=muscleById(f.g);
    // Hand, Fuß, Hals, tiefe Wade usw. sind im 3D-Modell antippbar, gehören aber zu keiner
    // gezählten Muskelgruppe. Ohne diese Abfrage brach zoneOf() ab und die Anzeige blieb stehen.
    if(!m){co.innerHTML='<b>'+f.la+'</b><span>'+f.de+'</span><em>Wird im Training nicht eigens gezählt</em>';return;}
    var v=Math.round((ms[f.g]||0)*10)/10,z=zoneOf(v,m),em=emphasisSets(selFine,TODAY);
    co.innerHTML='<b>'+f.la+'</b><span>'+f.de+'</span><em class="z'+z+'">'+reizPct(v,m)+' % Reiz · '+v+' Sätze · '+zoneLabel(z)+(em!=null?' · '+em+' mit Betonung hier':'')+'</em>';
  } else {
    var ids=[];selSet.forEach(function(k){var g=FINE[k].g;if(ids.indexOf(g)<0&&muscleById(g))ids.push(g);});
    if(!ids.length){co.innerHTML='<b>'+selLabel+'</b><em>Wird im Training nicht eigens gezählt</em>';return;}
    var tot=0,ok=0;ids.forEach(function(id){var mm=muscleById(id),vv=ms[id]||0;tot+=vv;var zz=zoneOf(vv,mm);if(zz===1)ok++;});
    var names=ids.map(function(id){return muscleById(id).name;}).join(" · ");
    co.innerHTML='<b>'+selLabel+'</b>'+(names!==selLabel?'<span>'+names+'</span>':'')+'<em class="'+(ok?"z1":"z0")+'">'+(Math.round(tot*10)/10)+' Sätze · '+ok+' von '+ids.length+' im Korridor</em>';
  }
}
```
