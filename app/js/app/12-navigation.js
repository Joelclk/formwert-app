/* ==========================================================
   app/12-navigation.js - Tabs, Wischgeste im Heute-Tab, Gesamt-Rendering, Speichern ins Konto, Sync-Anzeige
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Navigation ================= */
/* Untere Leiste: Heute · Körper · [Training, runder Start-Knopf in der Mitte] · Ränge · Du.
   Entdecken hat keinen eigenen Platz mehr unten, sondern sitzt als Lupe in der Kopfzeile
   (gleiche id, damit alle bisherigen selectTab("tab-entdecken")-Aufrufe weiter funktionieren). */
var TABS=[["tab-heute","p-heute","Heute"],["tab-entdecken","p-entdecken","Übungen"],["tab-training","p-training","Training"],["tab-koerper","p-koerper","Körper"],["tab-raenge","p-raenge","Ränge"],["tab-werte","p-werte","Du"]];
function selectTab(id){
  tab=id;
  // Sichtbarkeit zuerst umschalten: die Körper-Figur misst ihre Brust-Clip-Rechtecke per
  // getBBox(), was in einem noch [hidden] Abschnitt 0×0 liefert (Brust "verschwindet" dann zufällig).
  TABS.forEach(function(t){$(t[0]).setAttribute("aria-selected",String(t[0]===id));$(t[1]).hidden=t[0]!==id;if(t[0]===id)$("apptitle").textContent=t[2];});
  woLive();
  $("fab").hidden=(id!=="tab-heute")||(heuteDate!==TODAY);
  var nx=$("btn-newex");if(nx)nx.hidden=(id!=="tab-entdecken");
  try{fwMiniUpdate();}catch(e){}
  if(id==="tab-heute"&&heuteDirty){heuteDirty=false;renderAll();}
  else if(id!=="tab-heute"&&secDirty[id.replace("tab-","")])renderSection(id);
  // Ein laufendes Training tickt/ändert sich per Definition ständig (auch durch asynchrone
  // Hintergrund-Syncs) – beim Wechsel auf den Tab deshalb IMMER frisch rendern, statt auf das
  // dirty-Flag zu vertrauen. Sonst können Häkchen/Zähler eine veraltete Momentaufnahme zeigen.
  else if(id==="tab-training"&&workout){
    // Solange der Abschnitt ausgeblendet war, hatte der Wischer keine Breite: Seite und
    // Muskelfiguren erst jetzt, im sichtbaren Zustand, richtig setzen.
    renderSession();woGoto(woPage,false);woFillFigs();
    requestAnimationFrame(function(){woGoto(woPage,false);woFillFigs();});
  }
}
TABS.forEach(function(t){$(t[0]).addEventListener("click",function(){selectTab(t[0]);window.scrollTo(0,0);});});
$("disc-search").addEventListener("input",function(){discQuery=this.value;renderDiscExGrid();});
$("fab").addEventListener("click",sheetActions);
$("btn-redo").addEventListener("click",function(){startOnboarding(state.profile);});

/* ================= Heute: Tageswechsel per Wischgeste =================
   Wischt man auf dem Heute-Inhalt (Hero-Ring, Wochenstreifen, Tagesliste) seitlich, wechselt
   der angezeigte Tag (heuteDate) – Kopfzeile und untere Navigation bleiben unangetastet, die
   sitzen außerhalb von #p-heute. Nach rechts wischen = ein Tag zurück (wie im Kalender),
   nach links = ein Tag vor, aber nie über den echten heutigen Tag hinaus in die Zukunft. */
function shiftHeuteDate(delta){
  var nd=shiftDays(heuteDate,delta);
  if(nd>TODAY)nd=TODAY;
  if(nd===heuteDate)return false;
  heuteDate=nd;
  renderHeuteDay();
  return true;
}
(function(){
  // Wischen, um zum vorherigen/nächsten Tag zu wechseln – funktioniert überall auf der Heute-Seite
  // (nicht nur innerhalb der Karten, auch im leeren Bereich darunter). Bewusst ohne jede eigene
  // Optik: weder ein Mitlaufen mit dem Finger waehrend des Ziehens noch ein Uebergang danach -
  // der Tag wechselt exakt so hart wie beim Antippen der Wochenpfeile oder eines Tages in der
  // Woche. Die Geste selbst (touchstart/-move/-end) bleibt nur zur Erkennung bestehen.
  var sx=0,sy=0,tracking=false,swiped=false,dragging=false,suppressClick=false;
  var sec=$("p-heute");if(!sec)return;
  function blocked(t){
    if($("scrim").classList.contains("open"))return true;         // Sheet offen
    if(!$("exdpage").hidden)return true;                          // Übungsseite offen
    if(t&&t.closest&&(t.closest("nav.bottom")||t.closest(".fab")))return true;
    return false;
  }
  document.addEventListener("touchstart",function(e){
    if(tab!=="tab-heute"||e.touches.length!==1||blocked(e.target)){tracking=false;return;}
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;tracking=true;swiped=false;dragging=false;
  },{passive:true});
  document.addEventListener("touchmove",function(e){
    if(!tracking||e.touches.length!==1)return;
    var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(!swiped){
      if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;dragging=true;}
      else if(Math.abs(dy)>10){tracking=false;return;} // eindeutig vertikales Scrollen: nicht als Wisch werten
    }
    if(dragging&&e.cancelable)e.preventDefault(); // während des Ziehens nicht zusätzlich die Seite vertikal scrollen
  },{passive:false});
  document.addEventListener("touchend",function(e){
    if(!tracking)return;tracking=false;if(!swiped)return;
    // Jede erkannte seitliche Wischbewegung unterdrückt den danach vom Browser simulierten
    // Klick auf das darunterliegende Element (z.B. einen Wochentag) – sonst poppt beim
    // Wischen zusätzlich ungewollt ein Sheet auf.
    suppressClick=true;
    setTimeout(function(){suppressClick=false;},400);
    var rawDx=e.changedTouches[0].clientX-sx;
    var delta=rawDx<0?1:-1,willMove=Math.abs(rawDx)>=50&&!(heuteDate===TODAY&&delta===1);
    if(willMove)shiftHeuteDate(delta);
  },{passive:true});
  document.addEventListener("click",function(e){
    if(suppressClick){suppressClick=false;e.stopPropagation();e.preventDefault();}
  },true);
})();

/* ================= Gesamt ================= */
var lastC=null, secDirty={koerper:true,werte:true,training:true,entdecken:true,raenge:true};
function renderHero(c,pk){
  $("todaydate").textContent=deDate(heuteDate);
  $("fitval").textContent=c.fitness;renderRing(c,pk.fitness);
  // Legende mit dem jeweiligen Teilwert: erklärt die Ringfarben und zeigt zugleich, woraus sich
  // der Formwert gerade zusammensetzt.
  var lg=$("ringlegend");
  if(lg){
    lg.innerHTML="";
    SKILLDEF.forEach(function(sk){
      var s=el("span"),i=el("i");i.style.background=sk.color;s.appendChild(i);
      s.appendChild(el("em",null,sk.name));s.appendChild(el("b","num",String(Math.round(c[sk.key]||0))));
      lg.appendChild(s);
    });
  }
  var prev=compute(shiftDays(heuteDate,-14)).fitness,df=c.fitness-prev,tr=$("fittrend");
  tr.className="trend "+(df>1?"up":df<-1?"down":"");
  tr.textContent=(df>0?"▲ +"+df:df<0?"▼ "+Math.abs(df):"▬ stabil")+" in 14 Tagen";
  var lv=$("fitlevel");if(lv)lv.textContent=fitLevel(c.fitness);
  var below=CORE_MUSCLES.filter(function(id){return (c.ms[id]||0)<corr(muscleById(id)).mev;}).length,note=[];
  note.push(c.trainDays+" von "+Math.round(state.profile.goals.days*c.win/7)+" Trainingstagen");
  if(below)note.push(below+" Muskelgruppen unter Minimum");
  if(pk.fitness-c.fitness>2)note.push(Math.round(pk.fitness-c.fitness)+" unter Bestform");
  $("fitnote").textContent=note.join(" · ");
  renderHeroNext();
}

/* Kurze Einordnung des Formwerts - ein Wort statt einer Zahl, die man erst deuten muss. */
function fitLevel(v){
  return v>=85?"Topform":v>=70?"Starke Form":v>=50?"Gute Form":v>=30?"Solide Basis":v>0?"Im Aufbau":"Noch keine Daten";
}

/* Der wichtigste nächste Schritt für den angezeigten Tag. Genau eine Empfehlung, damit der
   Einstieg eine klare Richtung hat statt einer Liste von Möglichkeiten. */
function renderHeroNext(){
  var box=$("fitnext");if(!box||!state.profile)return;box.innerHTML="";box.className="hero-next";
  var viewingToday=heuteDate===TODAY,d=state.days[heuteDate]||emptyDay();
  // Ein Training nur aus Mobilitätsübungen ist kein Trainingstag; eines ohne Sätze (nur Ausdauer) schon.
  var trained=isTrainDay(d)||(d.workouts||[]).some(function(wo){return !(d.sets||[]).some(function(s){return s.wid===wo.id;});});
  var mobDone=mobDay(d).units>=1;
  var w=weekStats(heuteDate),goal=state.profile.goals.days||0,txt="",btn=null;
  if(workout){
    txt="<b>"+esc(workout.name)+"</b> läuft – Zeit und Fortschritt siehst du direkt darunter.";
  } else if(!viewingToday){
    txt="Du siehst einen vergangenen Tag.";
    btn=["Zurück zu heute",function(){gotoHeuteDate(TODAY);},false];
  } else if(!trained){
    txt=w.train<goal?"<b>Nächster Schritt: Training.</b> Diese Woche "+w.train+" von "+goal+" Trainingstagen.":
      "<b>Wochenziel erreicht.</b> Heute ist Raum für ein Zusatztraining – oder für Erholung.";
    btn=["Training starten",function(){selectTab("tab-training");window.scrollTo(0,0);},w.train<goal];
  } else if(!mobDone){
    txt="<b>Training erledigt.</b> Zum Abschluss ein paar Minuten Mobilität.";
    btn=["Mobilität eintragen",function(){sheetMob();},false];
  } else {
    box.className="hero-next done";
    txt="<span><b>Alles erledigt für heute.</b> Training und Mobilität sind drin – gute Arbeit.</span>";
  }
  var p=el("p");p.innerHTML=txt;box.appendChild(p);
  if(btn){var b=el("button","btn "+(btn[2]?"primary":"ghost"),btn[0]);b.type="button";b.onclick=btn[1];box.appendChild(b);}
}

function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(ch){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch];});}
function renderSection(id){
  // Entdecken hängt an keinen Tageswerten (c) – unabhängig davon rendern, damit ein noch
  // fehlendes lastC (z. B. ganz am Anfang) den Übungskatalog nicht blockiert.
  if(id==="tab-entdecken"){renderEntdecken();secDirty.entdecken=false;return;}
    var c=lastC,pk=state.profile.peaks||{};
  // Während eines Trainings rechnet renderLight() bewusst nicht alles neu, sondern setzt nur
  // heuteDirty. Körper und Werte brauchen aber den aktuellen Stand – sonst fehlen dort die
  // gerade abgehakten Sätze, bis man einmal den Heute-Tab öffnet.
  if(heuteDirty&&id!=="tab-training")c=lastC=compute(TODAY);
  if(!c)return;
  if(id==="tab-koerper"){renderBody(c.ms);renderMuscleList(c.ms);renderBodyListMode();secDirty.koerper=false;}
  else if(id==="tab-raenge"){try{renderRaenge();}catch(e){}try{renderErfolge();}catch(e){}secDirty.raenge=false;}
  else if(id==="tab-werte"){renderSkills(c,pk);renderStrength(c);renderCardio(c);renderFormula(c);renderSpark();renderHistory();renderSettings();secDirty.werte=false;}
  else if(id==="tab-training"){renderRoutines();renderSession();secDirty.training=false;}
}
function renderAll(){
  if(!state.profile)return;
  var c=compute(TODAY),pk=state.profile.peaks||{};
  ["fitness","kraft","konst","deckung","ausdauer","mob"].forEach(function(k){var v=k==="fitness"?c.fitness:c[k];if(!(pk[k]>=v))pk[k]=v;});
  state.profile.peaks=pk;lastC=c;heuteDirty=false;
  // Der Hero-Ring zeigt den Tag, den man sich gerade ansieht (heuteDate) – die Peak-/
  // Bestwert-Fortschreibung oben bleibt aber immer an TODAY gebunden, unabhängig davon, welcher
  // Tag gerade angeschaut wird.
  renderHero(heuteDate===TODAY?c:compute(heuteDate),pk);
  renderWeek();try{renderNextGoal();}catch(e){}renderToday();renderBanner();
  // "entdecken" hängt an keinen Tageswerten – dessen dirty-Status hier NICHT mit überschreiben,
  // sonst geht das anfängliche entdecken:true beim ersten renderAll() sofort wieder verloren und
  // der Katalog bliebe beim ersten Öffnen leer.
  secDirty.koerper=true;secDirty.werte=true;secDirty.training=true;secDirty.raenge=true;
  try{renderHeuteKarte();}catch(e){}
  if(tab!=="tab-heute")renderSection(tab);
  saveLocalSoon();
}
// Leichtes Update während des Trainings: nur Trainingskarte + Tagesliste sofort, Rest verzögert
var heuteDirty=false;
function renderLight(){
  renderSession();renderBanner();saveLocalSoon();
  heuteDirty=true;secDirty.koerper=true;secDirty.werte=true;secDirty.raenge=true;
}

/* ================= Persistenz ================= */
// Jede Aenderung bekommt eine neue Nummer: so erkennt persist(), ob ein Tag nach dem Absenden
// noch einmal geaendert wurde und weiter als "offen" gelten muss.
var fwDirtySeq=0;
function touch(d){state.dirty[d]=++fwDirtySeq;localTouchDay(d);queueSave();}
var stTimer=null;
function queueSave(){if(stTimer)clearTimeout(stTimer);stTimer=setTimeout(persist,700);}
/* Schlaegt die Uebertragung ins Konto fehl (offline, Verbindung weg), wurde das frueher
   lautlos verschluckt - die Anzeige oben blieb auf "synchronisiert", obwohl nichts ankam.
   Jetzt: betroffene Tage/Einheiten bleiben als "offen" markiert, die Anzeige zeigt es an,
   und nach kurzer Zeit wird automatisch erneut gesendet. */
var cloudFailT=null,cloudFailed=false;
function cloudFail(){
  cloudFailed=true;
  setSync("off","Nicht übertragen – wird wiederholt");
  if(!cloudFailT)cloudFailT=setTimeout(function(){cloudFailT=null;queueSave();},15000);
  // Die wieder gesetzte Markierung muss auch einen Neustart überleben.
  saveLocalSoon();
}
function cloudOk(){
  if(cloudFailed&&!cloudFailT){cloudFailed=false;setSync("on","synchronisiert");}
  // Übertragene Tage aus der gespeicherten Markierung streichen - eine liegengebliebene
  // Markierung würde beim nächsten Start eine neuere Änderung von einem anderen Gerät verdrängen.
  saveLocalSoon();
}
function persist(){
  saveLocal();if(!db)return;
  // Ein Tag bleibt als "offen" markiert, bis die Cloud den Empfang bestaetigt. Frueher wurde die
  // Markierung schon beim Absenden geloescht: wurde die App genau dann beendet (iOS), galt der
  // Tag als uebertragen, und beim naechsten Start ueberschrieb der aeltere Cloud-Stand ihn.
  var p=Object.keys(state.dirty);
  p.forEach(function(d){var b=state.days[d],tok=state.dirty[d];if(!b){delete state.dirty[d];return;}
    db.doc("days/"+d).set({d:d,sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}).then(function(){
      if(state.dirty[d]===tok)delete state.dirty[d];cloudOk();},function(){cloudFail();});});
  var r=Object.keys(state.dirtyRoutines);state.dirtyRoutines={};
  r.forEach(function(id){var redo=function(){state.dirtyRoutines[id]=true;cloudFail();};
    if(state.routines[id])db.doc("routines/"+id).set(state.routines[id]).then(cloudOk,redo);else db.doc("routines/"+id).delete().then(cloudOk,redo);});
  // Profil und eigene Uebungen erst hochladen, nachdem der Cloud-Stand einmal vollstaendig
  // geladen wurde (cloudPulled, 14-start.js). Sonst koennte ein neues Geraet mit haengender
  // Verbindung ein frisch eingerichtetes Profil und eine LEERE Uebungsliste ueber den
  // Kontostand schreiben - eigene Uebungen waeren danach ueberall weg.
  if(!cloudPulled)return;
  if(state.profile)db.doc("state/profile").set(state.profile).then(cloudOk,cloudFail);
  // Eigene und geaenderte Uebungen gehoeren genauso zum Konto wie Profil, Tage und
  // Routinen - ohne sie waeren sie beim Oeffnen auf einem anderen Geraet oder in einer
  // neuen Fassung der App verloren.
  db.doc("state/exoverrides").set({v:state.exOverrides||{}}).then(cloudOk,cloudFail);
  db.doc("state/customex").set({v:state.customEx||[]}).then(cloudOk,cloudFail);
}
// Beim Verbinden dieselben beiden Dokumente wieder einlesen. Was lokal schon vorhanden
// ist, hat Vorrang (das ist der zuletzt auf diesem Geraet bearbeitete Stand).
function fw_syncPullExtras(d){
  return d.doc("state/exoverrides").get().then(function(es){
    var v=es&&es.exists?cloneWritable(es.data()):null;v=v&&v.v;
    if(v&&typeof v==="object"){
      state.exOverrides=state.exOverrides||{};
      Object.keys(v).forEach(function(id){if(!state.exOverrides[id])state.exOverrides[id]=v[id];});
    }
    return d.doc("state/customex").get();
  }).then(function(cs){
    var v=cs&&cs.exists?cloneWritable(cs.data()):null;v=v&&v.v;
    if(Array.isArray(v)){
      state.customEx=state.customEx||[];
      var have={};state.customEx.forEach(function(e){if(e&&e.id)have[e.id]=1;});
      v.forEach(function(e){if(e&&e.id&&!have[e.id])state.customEx.push(e);});
    }
    applyCustomEx();applyExOverrides();
    secDirty.entdecken=true;secDirty.training=true;
  }).catch(function(){});
}
var syncState={k:"",t:"nur dieses Gerät"};
function setSync(k,t){
  syncState={k:k,t:t};
  $("syncdot").className="dot"+(k?" "+k:"");$("synctxt").textContent=t;
  secDirty.werte=true;
}
