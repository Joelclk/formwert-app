/* ==========================================================
   app/16-app-start.js - Letzte Datenanpassungen, Sprache setzen, Kopfzeilen-Knoepfe, App starten
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* Der Brachialis war bis eben Teil der Bizepsgruppe und taucht deshalb in keiner Uebung
   eigenstaendig auf. Statt 35 Stellen von Hand nachzuziehen (und es bei der naechsten neuen
   Uebung wieder zu vergessen), wird er hier einmal aus dem Bizeps abgeleitet: Er ist ein
   reiner Ellenbogenbeuger ohne Drehfunktion, arbeitet also ueberall dort mit, wo der Bizeps
   den Ellenbogen beugt. Die griffabhaengigen Unterschiede (Hammer- und Langhantelcurls im
   Kammgriff betonen ihn staerker als supinierte Curls) sind darin noch NICHT abgebildet -
   das braeuchte eigene Werte je Uebung. */
(function brachialisAusBizeps(){
  EX.forEach(function(e){
    ["p","s","st"].forEach(function(t){
      if(e[t]&&e[t].indexOf("tg_bizeps")>=0&&e[t].indexOf("tg_brachialis")<0)e[t].push("tg_brachialis");
    });
  });
  for(var id in EX_PCT){
    var p=EX_PCT[id];
    if(p.tg_bizeps!=null&&p.tg_brachialis==null)p.tg_brachialis=p.tg_bizeps;
  }
})();
/* Englische Texte fuer die neue Satzpause und die leeren Satzfelder (Fahrplan Phase 1). */
(function(){
  var add={"Satzpause":"Rest","läuft":"running","angehalten":"paused","Angehalten":"Paused","vorbei":"over",
    "Anhalten":"Pause timer","Pause überspringen":"Skip rest","Pause vorbei – nächster Satz":"Rest over – next set",
    "Gewicht eintragen (0 = ohne Gewicht)":"Enter weight (0 = no weight)",
    "Pause nach jedem Satz":"Rest after each set","Sekunden":"Seconds","Für alle Übungen":"For all exercises",
    "Nur für diese Übung":"Only this exercise","Übernehmen":"Apply","Standard-Satzpause":"Default rest",
    "Pause zwischen Sätzen (Sekunden)":"Rest between sets (seconds)","Standard aus den Einstellungen":"Default from settings",
    "Gilt für alle Übungen dieser Einheit":"Applies to all exercises in this session",
    "Gilt für jede Einheit ohne eigene Pausenzeit und fürs freie Training.":"Applies to every session without its own rest time and to free workouts."};
  for(var k in add)if(!UI_EN[k])UI_EN[k]=add[k];
  // Rueckweg fuer das Zurueckschalten auf Deutsch - nur eindeutige Werte (UI_DE entsteht in
  // 11-sprache.js, bevor diese Eintraege existieren).
  var cnt={};for(var k1 in UI_EN){var v=UI_EN[k1];cnt[v]=(cnt[v]||0)+1;}
  for(var k2 in add){var v2=UI_EN[k2];if(cnt[v2]===1&&!UI_DE[v2])UI_DE[v2]=k2;}
  UI_RX.push([/Pause ist seit (.+) vorbei/g,"Rest ended $1 ago"]);
  UI_RX.push([/Pause (\d+) s für alle Übungen/g,"Rest $1 s for all exercises"]);
  UI_RX.push([/^alle (\d+) Muskeln$/g,"all $1 muscles"]);
  ["Vorschlag: ","Zielwerte vorschlagen","Zielbereich","an","aus","ändern","von","bis"].forEach(function(k){var m={"Vorschlag: ":"Suggestion: ","Zielwerte vorschlagen":"Suggest targets","Zielbereich":"Target range","an":"on","aus":"off","ändern":"change","von":"from","bis":"to"};if(!UI_EN[k])UI_EN[k]=m[k];});
  UI_RX.push([/^\+([\d,]+) kg – letztes Mal alle Sätze mit (\d+) Wdh\. geschafft/g,"+$1 kg – last time all sets hit $2 reps"]);
  UI_RX.push([/^\+(\d+) Wdh\. – gleiches Gewicht(, Reserve (\d+))?/g,function(m,a,b,c){return "+"+a+" reps – same weight"+(c!=null?", "+c+" in reserve":"");}]);
  UI_RX.push([/^\+(\d+) (s|Wdh\.) gegenüber letztem Mal/g,function(m,a,u){return "+"+a+(u==="s"?" s":" reps")+" vs. last time";}]);
  UI_RX.push([/^\+(\d+) (s|Wdh\.) – Obergrenze erreicht, weiter steigern/g,function(m,a,u){return "+"+a+(u==="s"?" s":" reps")+" – top of range reached, keep going";}]);
  UI_RX.push([/^Etwas leichter – letzte Einheit vor (\d+) Tagen/g,"A bit lighter – last session $1 days ago"]);
  UI_RX.push([/^Zweimal unter (\d+)( s)? – kurz leichter, dann neu anlaufen/g,"Twice below $1$2 – ease off briefly, then build up again"]);
  UI_RX.push([/Gleich wie letztes Mal – das war am Limit/g,"Same as last time – that was your limit"]);
  UI_RX.push([/^\+(\d+) (s|Wdh\.) im schwächsten Satz – letztes Mal am Limit/g,function(m,a,u){return "+"+a+(u==="s"?" s":" rep")+" in your weakest set – last time was at your limit";}]);
  UI_RX.push([/Gleich wie letztes Mal/g,"Same as last time"]);
  UI_RX.push([/ · du legst hier zu/g," · you are improving here"]);
  UI_RX.push([/^Satz ([\d und]+) wieder auf dein früheres Niveau(, sonst \+(\d+) (s|Wdh\.))?/g,function(m,a,b,c,u){return "Set "+a.replace(/ und /g," and ")+" back to your earlier level"+(c?", otherwise +"+c+(u==="s"?" s":" reps"):"");}]);
  UI_RX.push([/^\+(\d+) (s|Wdh\.) – dein Schnitt aus (\d+) Einheiten, umgerechnet auf (\d+) Tage/g,function(m,a,u,n,d){return "+"+a+(u==="s"?" s":" reps")+" – your average over "+n+" sessions, scaled to "+d+" days";}]);
  UI_RX.push([/ – Kraft \+(\d+) % \(dein Tempo \+([\d.,-]+) %\/Woche aus (\d+) Einheiten, letztes Mal vor (\d+) T\.\)/g," – strength +$1 % (your pace +$2 %/week over $3 sessions, last time $4 d ago)"]);
  UI_RX.push([/^Alle (\d+) Muskeln anzeigen$/g,"Show all $1 muscles"]);
  if(!UI_EN["Übung tauschen"])UI_EN["Übung tauschen"]="Swap exercise";
  (function(){var m={"Notiz hinzufügen":"Add note","Notiz löschen":"Delete note","Speichern":"Save","Aufwärmen":"Warm-up",
    "Aufwärmsätze anzeigen":"Show warm-up sets","Als Tabelle exportieren":"Export as spreadsheet","noch nie":"never","heute":"today","gestern":"yesterday",
    "Tabelle gespeichert":"Spreadsheet saved","Export fehlgeschlagen":"Export failed",
    "Steht bei jedem Training mit dieser Übung oben – z. B. Sitzhöhe, Griffbreite oder Einstellung am Gerät.":"Shown at the top every time you train this exercise – e.g. seat height, grip width or machine setting."};
    for(var k in m)if(!UI_EN[k])UI_EN[k]=m[k];})();
  UI_RX.push([/^Notiz zu „(.+)“$/g,"Note for “$1”"]);
  (function(){var m={"Holz":"Wood","Silber":"Silver","Platin":"Platinum","Diamant":"Diamond","King Kong":"King Kong","Legende":"Legend","Lauch":"Leek","Spargeltarzan":"Beanpole","Gym-Rookie":"Gym rookie","Hantelschubser":"Dumbbell pusher","Satzsammler":"Set collector","Pumpernickel":"Pumpernickel","Gym-Bro":"Gym bro","Eisenbieger":"Iron bender","Hantelheld":"Dumbbell hero","Gym-Rat":"Gym rat","Kraftpaket":"Powerhouse","Muskelberg":"Muscle mountain","Gorilla":"Gorilla","Wikinger":"Viking","Gladiator":"Gladiator","Spartaner":"Spartan","Champion":"Champion","Titan":"Titan","Weltenheber":"World lifter",
    "Dein Rang":"Your rank","Rangleiter":"Rank ladder","Höchster Rang erreicht":"Highest rank reached","Du":"You","Aufstieg":"Rank up","Erfolge":"Achievements","Vitrine":"Trophy case","Vitrine öffnen":"Open trophy case","Medaillen":"Medals","Rekorde":"Records","Trainingstage":"Training days",
    "Bewegte Last":"Weight moved","Dranbleiben":"Consistency","Körpergewicht":"Bodyweight","Kraft":"Strength","Noch nicht angefangen":"Not started yet","Rekorde je Übung":"Records per exercise","Alle Stufen geschafft":"All tiers done","Gesamtstärke":"Overall strength",
    "Bankdrücken":"Bench press","Kniebeuge":"Squat","Kreuzheben":"Deadlift","Schulterdrücken":"Overhead press","Klimmzüge":"Pull-ups","Dips":"Dips","Liegestütze":"Push-ups","Unterarmstütz":"Plank","Noch nie gemacht – schon ein Satz zählt als Start.":"Never done – one set gets you started."};for(var k in m)if(!UI_EN[k])UI_EN[k]=m[k];})();
  UI_RX.push([/^(Holz|Bronze|Silber|Gold|Diamant|Champion) (I{1,3})$/g,function(m,t,d){return ({Holz:"Wood",Silber:"Silver",Diamant:"Diamond"}[t]||t)+" "+d;}]);
  UI_RX.push([/^(\d+) von (\d+) Medaillen$/g,"$1 of $2 medals"]);
  UI_RX.push([/^Neuer Rang · (.+)$/g,"New rank · $1"]);
  UI_RX.push([/^Rangleiter · (.+)$/g,"Rank ladder · $1"]);
  UI_RX.push([/^Gesamtstärke (\d+) %( → (\d+) %)?$/g,function(m,a,b,c){return "Overall strength "+a+" %"+(c?" → "+c+" %":"");}]);
  UI_RX.push([/^(\d+) % bis (.+)$/g,"$1 % to $2"]);
  UI_RX.push([/^Nächste Medaille: /g,"Next medal: "]);
  // Nachtrag 27.09.: beim Rundgang in englischer Sprache noch deutsch
  (function(){var m={"Noch keine Medaille – die erste gibt es schon ab 10 Trainingstagen oder 5 Dips am Stück.":"No medal yet – the first one comes at 10 training days or 5 dips in a row.",
    "Noch keine Medaille – die erste holst du dir mit deinem nächsten Training.":"No medal yet – you earn the first one with your next workout.",
    "Pause: gilt für jede Einheit ohne eigene Pausenzeit und fürs freie Training. Vorschläge: Gewicht und Wiederholungen stehen im Training schon im Feld – aus deinem letzten Mal, leicht gesteigert.":"Rest: applies to every session without its own rest time and to free training. Suggestions: weight and reps are already filled in during training – from your last time, slightly increased.",
    "Notiz zur Übung hinzufügen":"Add note to exercise"};for(var k in m)if(!UI_EN[k])UI_EN[k]=m[k];})();
  UI_RX.push([/^Notiz bearbeiten: /g,"Edit note: "]);
  UI_RX.push([/bei Klimmzug\/(\s*)Dips bis (\d+) (?:Wdh|reps)\.?/g,"for pull-ups/$1dips up to $2 reps"]);
  // Rest hinter "Next medal: … – noch 46 Punkte"; allgemeine Regeln davor machen "Tage" evtl. schon zu "days"
  UI_RX.push([/^(Next medal: .+) – noch (.+?)(?: (Punkte?|Wochen?|Tage?|days?|Rekorde?))?$/g,function(m,a,z,e){
    var en={Punkt:"point",Punkte:"points",Woche:"week",Wochen:"weeks",Tag:"day",Tage:"days",day:"day",days:"days",Rekord:"record",Rekorde:"records"}[e];
    return a+" – "+z+(en?" "+en:"")+" to go";}]);
  UI_RX.push([/^(Bestwert|Stand) /g,function(m,a){return a==="Bestwert"?"Best ":"Now ";}]);
  (function(){var m={"Maximales Gewicht":"Heaviest weight","Geschätztes Maximum":"Estimated max","Bestes Satzvolumen":"Best set volume","Meiste Wdh.":"Most reps","Längste Zeit":"Longest time"};for(var k in m)if(!UI_EN[k])UI_EN[k]=m[k];})();
  UI_RX.push([/^Maximales Gewicht(: | – )/g,"Heaviest weight$1"]);
  UI_RX.push([/^Geschätztes Maximum(: | – )/g,"Estimated max$1"]);
  UI_RX.push([/^Bestes Satzvolumen(: | – )/g,"Best set volume$1"]);
  UI_RX.push([/^Meiste Wdh\. mit /g,"Most reps with "]);
  UI_RX.push([/^Meiste Wdh\.(: | – )/g,"Most reps$1"]);
  UI_RX.push([/^Längste Zeit(: | – )/g,"Longest time$1"]);
  UI_RX.push([/ Max\.( per side| pro Seite)?\)/g,function(m,sd){return " max"+(sd?" per side":"")+")";}]);
  if(!UI_EN["Neuer Rekord"])UI_EN["Neuer Rekord"]="New record";
  UI_RX.push([/ pro Seite/g," per side"]);
  UI_RX.push([/(\d+) Wdh\.$/g,"$1 reps"]);
  UI_RX.push([/^(\d+) von (\d+) Rekorden$/g,"$1 of $2 records"]);
  UI_RX.push([/^(\d+) Rekorde?$/g,function(m,n){return n+(n==="1"?" record":" records");}]);
  UI_RX.push([/^vor (\d+) Tagen$/g,"$1 days ago"]);
  UI_RX.push([/^Statt „(.+)“ – (\d+) (?:Satz|Sätze) (?:bleibt|bleiben)\.$/g,function(m,n,c){return "Instead of “"+n+"” – "+c+(c==="1"?" set stays.":" sets stay.");}]);
  UI_RX.push([/^Statt „(.+)“ – (?:dein abgehakter Satz bleibt|deine (\d+) abgehakten Sätze bleiben) dort gespeichert, die neue Übung bekommt (\d+) (?:Satz|Sätze)\.$/g,function(m,n,d,c){return "Instead of “"+n+"” – "+(d?"your "+d+" completed sets stay":"your completed set stays")+" saved there, the new exercise gets "+c+(c==="1"?" set.":" sets.");}]);
  UI_RX.push([/^„(.+)“ statt „(.+)“$/g,"“$1” instead of “$2”"]);
  if(!UI_EN["weniger"])UI_EN["weniger"]="less";if(!UI_EN["Weniger anzeigen"])UI_EN["Weniger anzeigen"]="Show less";
  UI_RX.push([/Satzpause (angehalten )?([\d:]+) – antippen zum Steuern/g,function(m,p,t){return "Rest "+(p?"paused ":"")+t+" – tap to control";}]);
})();
LANG=detectLang();applyLangData();document.documentElement.setAttribute("lang",LANG);
setTimeout(function(){applyUiLang(document.body);},0);
(function(){var a=$("btn-newex");if(a){
  a.innerHTML=svgIcon("M12 5v14M5 12h14",2.1);
  /* Neue Uebung anlegen - direkt aus der Kopfzeile, aber nur dort, wo es hingehoert:
     im Entdecken-Tab, wo der Uebungskatalog steht. Nach dem Anlegen wird die Liste
     aufgefrischt und die neue Uebung geoeffnet. */
  a.onclick=function(){
    sheetCreateExercise(null,function(created){
      closeSheet();
      secDirty.entdecken=true;
      renderSection("tab-entdecken");
      setTimeout(function(){sheetExerciseDetail(created);},180);
    });
  };
}})();
(function(){var g=$("btn-settings");if(!g)return;
  g.innerHTML=svgIcon("M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"+
    "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33"+
    " 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33"+
    "l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09"+
    "A1.65 1.65 0 003.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33"+
    "H8a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06"+
    "a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09"+
    "a1.65 1.65 0 00-1.51 1z",1.7);
  g.onclick=function(){openSettingsPage();};})();
/* Kein versehentliches Zoomen in der App (Fahrplan Phase 1). Safari ignoriert die CSS-Regel
   gegen Zwei-Finger-Zoom teilweise, deshalb hier zusaetzlich die Pinch-Geste abfangen. Die
   3D-Modelle laufen in eigenen iframes - deren Gesten kommen hier gar nicht an, dort bleibt
   Zoomen und Drehen moeglich. Doppeltipp-Zoom regelt touch-action:manipulation im CSS, so
   gehen schnelle Doppeltipps auf Knoepfe (z. B. +/−) nicht verloren. */
(function noZoom(){
  function stop(e){try{e.preventDefault();}catch(x){}}
  ["gesturestart","gesturechange","gestureend"].forEach(function(t){document.addEventListener(t,stop,{passive:false});});
  document.addEventListener("touchmove",function(e){if(e.touches&&e.touches.length>1)stop(e);},{passive:false});
  // Strg/Cmd + Mausrad bzw. Trackpad-Zoom am Rechner
  document.addEventListener("wheel",function(e){if(e.ctrlKey)stop(e);},{passive:false});
})();
fwBoot();
try{refreshWorkoutSuggestions();}catch(e){}
connect();
/* Die ersten Bildpakete (Kategorien + erste Uebungen im Entdecken-Tab) schon im Leerlauf nach
   dem Start laden - dann ist Entdecken beim ersten Oeffnen sofort komplett da. */
setTimeout(function(){
  var go=function(){
    ["fig-c0","fig-c1"].forEach(function(n){try{fwLoadAsset(n).catch(function(){});}catch(e){}});
    // Trainingsbereich vorwaermen: Figuren deiner Einheiten (werden einmal gerechnet und dann
    // auf dem Geraet gespeichert) und die grossen Uebungsbilder, die im Training erscheinen.
    setTimeout(warmTrainingFigs,1500);
  };
  if(window.requestIdleCallback)requestIdleCallback(go,{timeout:4000});else go();
},2500);

function warmTrainingFigs(){
  try{
    var box=document.createElement("div");box.setAttribute("aria-hidden","true");
    box.style.cssText="position:fixed;left:-9999px;top:0;width:60px;height:80px;overflow:hidden;pointer-events:none";
    document.body.appendChild(box);
    var exSeen={};
    Object.keys(state.routines||{}).forEach(function(id){
      var r=state.routines[id];if(!r||!r.items)return;
      var fo=routineFocus(r.items);
      if(fo.max>0)["front","back"].forEach(function(v){
        var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");sv.setAttribute("viewBox","0 0 800 1500");box.appendChild(sv);drawMini(sv,v,fo.sets);});
      r.items.forEach(function(it){
        var ex=exById(it.ex);if(!ex||exSeen[ex.id])return;exSeen[ex.id]=1;
        ["front","back"].forEach(function(v){
          var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
          sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",v);sv.setAttribute("data-mode","pd");box.appendChild(sv);fillExFig(sv);});
      });
    });
    // Aufraeumen, sobald alles im Speicher ist.
    setTimeout(function(){if(box.parentNode)box.parentNode.removeChild(box);},120000);
  }catch(e){}
}