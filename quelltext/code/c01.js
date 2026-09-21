/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: (Anweisung) bis BRACHIORAD_FRONT_F
*/

"use strict";


/* ================= Gewichte ================= */
var W={kraft:0.30, konst:0.25, deckung:0.20, ausdauer:0.15, mob:0.10}
;

var WIN_STATE=30,
 WIN_STRENGTH=90,
 WIN_BODY=7;

var CORE_MUSCLES=["tg_brust_ober","tg_brust_mitte","tg_brust_unten","tg_rueck_lat","tg_rueck_rhomb","tg_rueck_trapez_mit","tg_schulter_seit","tg_schulter_hint","tg_bizeps","tg_trizeps_lat","tg_bauch_gerade","tg_gesaess_haupt","tg_quadrizeps","tg_kniesehnen","tg_wade_gastro"];

var SKILLDEF=[
 {key:"kraft",   name:"Maximalkraft",    color:"var(--red)",    w:W.kraft},
 {key:"konst",   name:"Konstanz",        color:"var(--blue)",   w:W.konst},
 {key:"deckung", name:"Muskelabdeckung", color:"var(--violet)", w:W.deckung},
 {key:"ausdauer",name:"Ausdauer",        color:"var(--yellow)", w:W.ausdauer},
 {key:"mob",     name:"Mobilität",       color:"var(--green)",  w:W.mob}
];

var INTENS={leicht:0.5, mittel:1, hoch:2}
;


/* ================= Hilfen ================= */
function pad(n){return n<10?"0"+n:""+n;}

function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}

function parseIso(s){var p=s.split("-");return new Date(+p[0],+p[1]-1,+p[2]);}

function shiftDays(s,n){var d=parseIso(s);d.setDate(d.getDate()+n);return iso(d);}

function daysBetween(a,b){return Math.round((parseIso(b)-parseIso(a))/86400000);}

var WD=["So","Mo","Di","Mi","Do","Fr","Sa"];

function deDate(s){var d=parseIso(s);return WD[d.getDay()]+", "+pad(d.getDate())+"."+pad(d.getMonth()+1)+"."+d.getFullYear();}

function shortDate(s){var d=parseIso(s);return pad(d.getDate())+"."+pad(d.getMonth()+1)+".";}

function clamp(v,a,b){return v<a?a:v>b?b:v;}

function $(id){return document.getElementById(id);}

function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}

function rid(){return Math.random().toString(36).slice(2,9);}

// exById() wird sehr häufig während jedes Renderings aufgerufen (Körperkarte, Werte,
// Trainingslisten …). Ein linearer Scan über den gesamten Übungskatalog bei jedem einzelnen
// Aufruf summiert sich über viele Aufrufe hinweg zu spürbarer Zusatzarbeit – deshalb hier ein
// einmalig aufgebauter id->Objekt-Index (O(1) statt O(n)). Der Index wird an den wenigen Stellen,
// die EX verändern (neue/gelöschte eigene Übungen, Backup-Wiederherstellung), direkt mitgepflegt
// bzw. bei größeren Umbauten einfach verworfen und beim nächsten Zugriff neu aufgebaut.
var EX_BY_ID=null;

function buildExIndex(){EX_BY_ID={};for(var i=0;i<EX.length;i++)EX_BY_ID[EX[i].id]=EX[i];}

function exById(id){if(!EX_BY_ID)buildExIndex();return EX_BY_ID[id]||null;}

// Kraft-Bereich einer Übung: zuerst das Bewegungsmuster (damit z. B. Australian Pull-ups
// beim Rücken landen, obwohl sie am Liegestütz-Standard hängen), sonst über den Primärmuskel
// (so kommen Curls zu den Armen, Seitheben zu den Schultern, Waden zu den Beinen).
function catOfEx(ex){
  if(!ex||ex.mob||ex.t==="cardio")return null;
  var i;
  for(i=0;i<KRAFT_CATS.length;i++)if((KRAFT_CATS[i].pats||[]).indexOf(ex.pat)>=0)return KRAFT_CATS[i].id;
  var pm=(ex.p||[])[0];
  if(pm)for(i=0;i<KRAFT_CATS.length;i++)if((KRAFT_CATS[i].muscles||[]).indexOf(pm)>=0)return KRAFT_CATS[i].id;
  return null;
}

function catById(id){for(var i=0;i<KRAFT_CATS.length;i++)if(KRAFT_CATS[i].id===id)return KRAFT_CATS[i];return null;}

function muscleById(id){for(var i=0;i<MUSCLES.length;i++)if(MUSCLES[i].id===id)return MUSCLES[i];return null;}

function unitOf(t){return t==="sec"?"s":t==="reps"?"Wdh":"kg";}

function fmtVal(v,t){if(v==null)return "–";return (t==="load"?Math.round(v*2)/2:Math.round(v))+" "+unitOf(t);}

function svgIcon(d,sw){return '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round"><path d="'+d+'"/></svg>';}

var IC_TRASH="M4 6h16M9.5 6V4.2h5V6M6.5 6l.9 13.5h9.2L17.5 6";

var IC_CHEV="M9 5l7 7-7 7";

var IC_CHEVLEFT="M15 5l-7 7 7 7";

var IC_INFO="M12 16.3v-5.6M12 8.3v.01M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z";

var IC_FILTER="M4 5h16l-6.5 7.5v5.3l-3 1.7v-7L4 5z";

var IC_X="M6 6L18 18M18 6L6 18";

var EQUIP_ICONS={
  "Körpergewicht":'<circle cx="12" cy="5" r="2.1"/><path d="M12 7.3v6M8.6 10h6.8M9 20l3-6.7 3 6.7"/>',
  "Kurzhantel":'<path d="M5 8v8M7 6v12M17 6v12M19 8v8M7 12h10"/>',
  "Langhantel":'<path d="M2 12h20M5 8v8M7 9v6M17 9v6M19 8v8"/>',
  "Maschine":'<path d="M4 20V5h3M4 5h16M20 5v15M8 9h8M8 13h5"/>',
  "Kabelzug":'<circle cx="12" cy="4.3" r="2"/><path d="M12 6.3v9M8.3 19.5l3.7-3 3.7 3"/>',
  "Klimmzugstange":'<path d="M3 5h18M6 5v3M18 5v3M12 8v6M9 18.5l3-4.5 3 4.5"/>',
  "Band":'<path d="M4.5 8.5c3 6 12 6 15 0M4.5 15.5c3-6 12-6 15 0"/>',
  "Parallettes":'<path d="M3 16.5v-3.3h5v3.3M16 16.5v-3.3h5v3.3"/>',
  "Kettlebell":'<circle cx="12" cy="15" r="6"/><path d="M9 9a3 3 0 0 1 6 0v2H9V9z"/>',
  "Bauchroller":'<circle cx="12" cy="13.5" r="5"/><path d="M2.7 13.5h4M17.3 13.5h4"/>',
  "Reiskübel":'<path d="M7 8h10l-1.3 12H8.3L7 8z"/><path d="M9 8V6.2a3 3 0 0 1 6 0V8"/>',
  "Fat Gripz":'<rect x="2.5" y="9.5" width="19" height="5" rx="2.5"/>',
  "Kopfgeschirr":'<circle cx="12" cy="8" r="4"/><path d="M8.3 16h7.4M8.7 16l-1 4.3M15.3 16l1 4.3"/>',
  __default:'<path d="M5 8v8M7 6v12M17 6v12M19 8v8M7 12h10"/>'
}
;

function equipIcon(eq){
  var m=EQUIP_ICONS[eq]||EQUIP_ICONS.__default;
  return '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+m+'</svg>';
}


/* ================= Übungs-Info ("wie wird das gezählt?") ================= */
// Erklärt in Klartext, wie Gewicht/Wdh. bei DIESER Übung gezählt werden (Gesamtgewicht vs. pro
// Seite, beidseitig vs. einseitig) – als aufklappbarer Hinweis statt fest eingeblendetem Text,
// damit er überall (Training, Einzelsatz, Übungskatalog) gleich aussieht und nicht stört.
function wtInfoText(ex){
  var lines=[];
  if(ex.t==="load"){
    lines.push(ex.wt==="side"
      ? "Gewicht zählt pro Seite: Trag das Gewicht EINER Hantel ein (z. B. 10 kg pro Kurzhantel). Für Bestwert und Kraftstufe wird automatisch die Gesamtlast verwendet – hier also 20 kg."
      : "Gewicht zählt als Gesamtgewicht: Trag die komplette bewegte Last ein, so wie sie an Langhantel oder Maschine eingestellt ist.");
  } else if(ex.t==="sec"){
    lines.push("Gezählt werden die gehaltenen Sekunden.");
  } else {
    lines.push("Gezählt werden die geschafften Wiederholungen.");
  }
  lines.push(ex.uni
    ? "Einseitig: Links und rechts werden getrennt eingetragen. Gewertet wird jeweils die schwächere Seite."
    : "Beidseitig: eine gemeinsame Zahl gilt für beide Seiten.");
  return lines;
}

function exInfoBlock(ex){
  var box=el("div","ex-info");box.hidden=true;
  if(ex.poseImgs&&ex.poseImgs.length){
    var row=el("div","ex-info-poses");
    ex.poseImgs.forEach(function(src,i){
      var cell=el("div","ex-info-pose");
      var img=document.createElement("img");img.src=src;img.alt=(ex.poseLabels&&ex.poseLabels[i])||"";
      cell.appendChild(img);
      if(ex.poseLabels&&ex.poseLabels[i])cell.appendChild(el("div","ex-info-pose-cap",ex.poseLabels[i]));
      row.appendChild(cell);
    });
    box.appendChild(row);
  }
  if(ex.how){
    box.appendChild(el("p","ex-info-how",ex.how));
  }
  wtInfoText(ex).forEach(function(t){box.appendChild(el("p",null,t));});
  return box;
}

function exInfoBtn(box){
  var btn=el("button","iconbtn");btn.type="button";btn.setAttribute("aria-label","Wie wird das gezählt?");
  btn.innerHTML=svgIcon(IC_INFO,1.7);
  btn.onclick=function(ev){if(ev)ev.stopPropagation();box.hidden=!box.hidden;};
  return btn;
}


/* ---- 1RM: drei Formeln, jede in ihrem validierten Bereich, weich gemischt ---- */
function e1rm(kg,reps){
  var r=(reps||0);
  if(kg<=0)return 0;
  if(r<=1)return kg;
  if(r>15)r=15;
  var epley  = kg*(1+r/30);
  var brzycki= kg*36/(37-r);
  var wathen = 100*kg/(48.8+53.8*Math.exp(-0.075*r));
  var we=Math.max(0,1-Math.abs(r-2)/4.5);
  var wb=Math.max(0,1-Math.abs(r-5)/4.5);
  var ww=Math.max(0,1-Math.abs(r-10)/7);
  var s=we+wb+ww;
  if(s<=0)return wathen;
  return (epley*we+brzycki*wb+wathen*ww)/s;
}

// Bei "pro Seite" geloggten Übungen (typischerweise Kurzhanteln) hält man zwei Gewichte
// gleichzeitig – die tatsächlich bewegte Last fürs Einer-Maximum ist dann das Doppelte des
// eingetragenen (Einzel-)Gewichts. Bei "Gesamtgewicht" (Langhantel, Maschine) bleibt es unverändert.
function effectiveKg(ex,kg){return (ex.wt==="side")?(kg||0)*2:(kg||0);}

// Kehrt effectiveKg um: aus einem Gesamtwert (z. B. dem gespeicherten Bestwert/e1RM, der bei
// "pro Seite" schon verdoppelt ist) wieder das einzutragende Einzel-/Rohgewicht schätzen.
function rawKg(ex,effKg){return (ex.wt==="side")?(effKg||0)/2:(effKg||0);}

// Vorschlag fürs Eintragen eines neuen Satzes: ~80 % des zuletzt erreichten Bestwerts, auf
// 2,5 kg gerundet. Der Bestwert ist immer die Gesamtlast (e1RM) – bei "pro Seite" muss der
// Vorschlag also erst zurückgerechnet werden, sonst wäre er doppelt so schwer wie beabsichtigt.
function suggestedKg(ex,bestVal){return bestVal?Math.round(rawKg(ex,bestVal)*0.8/2.5)*2.5:20;}

// Dasselbe Prinzip wie suggestedKg, nur für Wdh./Sek.-Übungen: ohne das gab es beim Eintragen
// immer nur einen festen Startwert (30 s bzw. 8 Wdh) – unabhängig vom tatsächlichen Bestwert,
// wodurch die Live-Vorschau (Stufe für den Vorschlagswert) nichts mit der echten Kraftstufe zu
// tun hatte. bestVal ist bei uni:true Übungen bereits die schwächere Seite.
function suggestedReps(ex,bestVal){
  var dflt=ex.t==="sec"?30:8;
  // Bei Gewichtsübungen (auch uni:true, z. B. Kurzhantel-Rudern) ist "best" ein e1RM-Wert,
  // keine Wdh.-Zahl – da bleibt es beim festen Standard-Wdh.-Vorschlag. Sonst (reine Wdh./Sek.-
  // Übungen wie Klimmzüge, Passives Hängen) wird direkt der tatsächlich erreichte Bestwert
  // vorgeschlagen, kein Abschlag – anders als beim Gewicht (dort macht ein etwas leichterer
  // Arbeitssatz Sinn), will man bei Wdh./Haltezeit meist genau seinen bisherigen Rekord anpeilen.
  if(bestVal==null||ex.t==="load")return dflt;
  return Math.max(1,Math.round(bestVal));
}

function setValue(ex,s){
  if(ex.t==="load")return e1rm(effectiveKg(ex,s.kg),s.reps||1);
  return (s.reps||0);
}

// Lesbare Kurzform eines geloggten Satzes für Listen (Heute, Verlauf, "Vorher"-Spalte im
// Training). Bei einseitigen Übungen wird links/rechts getrennt angezeigt, sofern erfasst.
function setLabel(ex,s){
  var uniPart=(ex.uni&&s.repsL!=null&&s.repsR!=null)?(s.repsL+"/"+s.repsR+(ex.t==="sec"?" s":" Wdh")):null;
  if(ex.t==="load")return s.kg+"×"+(uniPart||s.reps);
  return uniPart||(s.reps+(ex.t==="sec"?" s":" Wdh"));
}


/* ================= State ================= */
var TODAY=iso(new Date());

var state={profile:null,days:{},routines:{},dirty:{},dirtyRoutines:{},customEx:[],exOverrides:{}}
;

var session=null,
 db=null,
 selMuscle=null,
 tab="tab-heute";

// Der Tag, der gerade im "Heute"-Tab angezeigt wird (per Wischgeste änderbar) – getrennt von
// TODAY (dem echten Kalendertag), damit ein Blick auf einen früheren Tag nicht versehentlich
// die an TODAY hängende Bestwert-/Peak-Logik verfälscht.
var heuteDate=TODAY;

var LSK="formwert-v3";


function emptyDay(){return {sets:[],cardio:[],workouts:[],mobility:false,rest:false,note:""};}

function day(d){if(!state.days[d])state.days[d]=emptyDay();var x=state.days[d];
  if(!x.sets)x.sets=[];if(!x.cardio)x.cardio=[];return x;}

// Vom Nutzer selbst angelegte Übungen (state.customEx) werden beim Laden in den globalen
// EX-Katalog eingehängt, damit sie überall wie eingebaute Übungen behandelt werden
// (Auswahl, Sätze loggen, Volumen-Berechnung, Körperkarte …).
function applyCustomEx(){
  (state.customEx||[]).forEach(function(ex){if(!exById(ex.id)){EX.push(ex);if(EX_BY_ID)EX_BY_ID[ex.id]=ex;}});
}

// Anpassungen an EINGEBAUTEN Übungen (state.exOverrides: id -> geänderte Felder) werden hier auf
// die jeweilige EX-Objekt-Referenz übertragen – das Objekt bleibt dasselbe (wichtig, falls andere
// Stellen es schon gecacht haben), nur seine Felder werden ausgetauscht. std/sf/est (Kraftstufen-
// interne Werte) bleiben dabei immer aus dem Original erhalten, nicht editierbar.
function applyExOverrides(){
  Object.keys(state.exOverrides||{}).forEach(function(id){
    var base=EX_BASE[id],ex=exById(id);if(!base||!ex)return;
    var merged=Object.assign({},base);
    delete merged.mob;delete merged.wt;delete merged.uni;
    Object.assign(merged,state.exOverrides[id]);
    Object.keys(ex).forEach(function(k){delete ex[k];});
    Object.assign(ex,merged);
  });
}

function setExOverride(id,patch){
  state.exOverrides=state.exOverrides||{};
  state.exOverrides[id]=patch;
  applyExOverrides();saveLocal();queueSave();secDirty.entdecken=true;
}

function resetExOverride(id){
  if(!state.exOverrides)return;
  delete state.exOverrides[id];
  var base=EX_BASE[id],ex=exById(id);
  if(base&&ex){Object.keys(ex).forEach(function(k){delete ex[k];});Object.assign(ex,base);}
  saveLocal();queueSave();secDirty.entdecken=true;
}

function loadLocal(){try{var r=localStorage.getItem(LSK)||localStorage.getItem("formwert-v2");
  if(r){var o=JSON.parse(r);if(o&&o.profile){state.profile=o.profile;state.days=o.days||{};state.routines=o.routines||{};state.customEx=o.customEx||[];state.exOverrides=o.exOverrides||{};}}}catch(e){}
  applyCustomEx();applyExOverrides();}

// Dokumente, die aus der Cloud-Datenbank kommen, können vom Capability-Wrapper eingefroren
// (Object.freeze) zurückgegeben werden. Werden sie unverändert in den lokalen, veränderbaren
// Zustand übernommen, wirft jeder spätere Schreibzugriff (z. B. arr.push(...)) in Safari/WebKit
// "Attempted to assign to readonly property." – lautlos abgefangen wirkt das dann wie "tut nichts".
// Deshalb hier immer eine echte, beschreibbare Kopie anlegen, bevor Daten aus der DB gespeichert werden.
function cloneWritable(x){try{return x==null?x:JSON.parse(JSON.stringify(x));}catch(e){return x;}}

var saveFailWarned=false;

function warnSaveFailed(){
  // Ohne diese Meldung würde ein fehlgeschlagenes Speichern (z. B. voller Speicher,
  // privater Modus/eingeschränktes localStorage) komplett lautlos passieren – die
  // Person geht weiter davon aus, dass ihre Eingaben gesichert sind, bis sie beim
  // nächsten Öffnen der App merkt, dass Daten fehlen. Einmal pro Sitzung reicht als
  // Hinweis, damit es nicht bei jeder Eingabe erneut aufploppt.
  if(saveFailWarned)return;saveFailWarned=true;
  try{toast("Speichern fehlgeschlagen – Speicher voll oder eingeschränkt");}catch(e){}
}

function saveLocal(){try{localStorage.setItem(LSK,JSON.stringify(
  {profile:state.profile,days:state.days,routines:state.routines,customEx:state.customEx,exOverrides:state.exOverrides}));}catch(e){warnSaveFailed();}}

// renderAll()/renderLight() laufen nach praktisch jeder Nutzer-Interaktion (jeder Satz, jedes
// Tab-Wechseln, jeder Eintrag) – riefen bisher aber direkt saveLocal() auf, das bei jedem Aufruf
// den KOMPLETTEN App-Zustand (alle Tage, Routinen, Übungs-Anpassungen …) per JSON.stringify neu
// serialisiert und synchron in den localStorage schreibt. Je mehr Trainingshistorie sich ansammelt,
// desto größer und spürbarer wird das bei jeder einzelnen Interaktion – ein klassischer, mit der Zeit
// wachsender Ruckler. Hier deshalb entkoppelt wie schon beim Workout-Autosave: kurz debouncen
// (mehrere renderAll()/renderLight() kurz hintereinander → nur eine tatsächliche Schreibaktion),
// aber sofort erzwingen, sobald die Seite versteckt/verlassen wird, damit nichts verloren geht.
var slT=null;

function saveLocalSoon(){if(slT)clearTimeout(slT);slT=setTimeout(function(){slT=null;saveLocal();},400);}

function flushLocalSave(){if(slT){clearTimeout(slT);slT=null;saveLocal();}}

function uniqueExId(){var id;do{id="custom_"+rid();}while(exById(id));return id;}

function addCustomExercise(ex){
  ex.id=uniqueExId();ex.custom=true;
  EX.push(ex);if(EX_BY_ID)EX_BY_ID[ex.id]=ex;state.customEx.push(ex);saveLocal();queueSave();secDirty.entdecken=true;
  return ex;
}

function removeCustomExercise(id){
  state.customEx=state.customEx.filter(function(e){return e.id!==id;});
  for(var i=0;i<EX.length;i++){if(EX[i].id===id){EX.splice(i,1);break;}}
  if(EX_BY_ID)delete EX_BY_ID[id];
  saveLocal();queueSave();secDirty.entdecken=true;
}


/* ================= Kraftstufen ================= */
function ageFactor(age){for(var i=0;i<AGE_FACTOR.length;i++)if(age<=AGE_FACTOR[i][0])return AGE_FACTOR[i][1];return 0.72;}

function thresholds(ex,prof){
  var p=prof||state.profile;
  if(!ex||!ex.std||!p)return null;
  var st=STANDARDS[ex.std];if(!st)return null;
  var bw=p.bodyweight||80, af=ageFactor(p.age||30), sf=SEX_FACTOR[p.sex]||1, sc=(ex.sf||1);
  return st.v.map(function(v){
    if(st.kind==="load")return v*90*Math.pow(bw/90,0.67)*af*sf*sc;
    return v*af*sf*sc;
  });
}

function grade(ex,val,prof){
  var th=thresholds(ex,prof);
  if(!th||val==null)return null;
  // Score bleibt 0–100 unabhängig von der Stufenanzahl – jede Stufe ist ein gleich großer
  // Anteil (100/th.length), damit die Anzahl der Stufen (aktuell 8: F…S+) den Formwert nicht
  // verschiebt, wenn sie sich mal wieder ändert.
  var step=100/th.length;
  if(val<th[0])return {idx:-1,name:"unter "+LEVELS[0],score:clamp(val/th[0]*step,0,step),next:th[0],pct:val/th[0]};
  for(var i=th.length-1;i>=0;i--){
    if(val>=th[i]){
      if(i===th.length-1)return {idx:i,name:LEVELS[i],score:100,next:null,pct:1};
      var p=(val-th[i])/(th[i+1]-th[i]);
      return {idx:i,name:LEVELS[i],score:clamp((i+1+p)*step,0,100),next:th[i+1],pct:p};
    }
  }
  return null;
}

// Ordnet einen bereits gemittelten 0–100-Score (z. B. den Durchschnitt mehrerer Übungen eines
// Kraft-Bereichs) derselben Stufenleiter zu, die grade() für eine einzelne Übung verwendet – die
// Score-Skala ist dafür extra unabhängig von der Stufenanzahl gehalten (siehe Kommentar oben).
// Anders als grade() gibt es hier kein "next" in kg, da mehrere Übungen mit unterschiedlichen
// Einheiten/Standards einfließen können – der Balken zeigt stattdessen den Fortschritt innerhalb
// der aktuellen Stufe.
function levelFromScore(score){
  if(score==null)return null;
  var n=LEVELS.length,step=100/n,s=clamp(score,0,100);
  var idx=Math.floor(s/step)-1;
  if(idx>=n-1)return {idx:n-1,name:LEVELS[n-1],score:100,next:null,pct:1};
  if(idx<0)return {idx:-1,name:"unter "+LEVELS[0],score:s,next:null,pct:clamp(s/step,0,1)};
  return {idx:idx,name:LEVELS[idx],score:s,next:null,pct:clamp((s-(idx+1)*step)/step,0,1)};
}

function bestFor(exid,asOf,win){
  var ex=exById(exid);if(!ex)return {best:null,last:null,bestSet:null};
  var from=shiftDays(asOf,-(win-1)),best=null,last=null,bestSet=null;
  for(var d in state.days){
    if(d<from||d>asOf)continue;
    var sets=state.days[d].sets||[];
    for(var i=0;i<sets.length;i++){
      var s=sets[i];if(s.ex!==exid)continue;
      var v=setValue(ex,s);
      if(best==null||v>best){best=v;bestSet=s;}
      if(last==null||d>last)last=d;
    }
  }
  return {best:best,last:last,bestSet:bestSet};
}

// Bestwerte (Kraftstufe, Fortschritt, Rekorde) sind bei "pro Seite"-Übungen immer die
// GESAMTLAST bzw. bei einseitigen Wdh./Sek.-Übungen die schwächere Seite – nachvollziehbarer,
// wenn direkt danebensteht, was das für die einzelne Hantel/Seite bedeutet. Die Umrechnung für
// "pro Seite"-Gewichte ist exakt (effectiveKg/e1RM sind linear in kg), fürs L/R-Wdh.-Detail wird
// der jeweilige Satz gebraucht (falls bekannt), da sich links/rechts nicht aus dem Minimum rekonstruieren lässt.
function fmtBestVal(ex,val,set){
  var base=fmtVal(val,ex.t);
  if(val==null)return base;
  if(ex.t==="load"&&ex.wt==="side")return base+" ("+fmtVal(rawKg(ex,val),ex.t)+" pro Seite)";
  if(ex.uni&&set&&set.repsL!=null&&set.repsR!=null)return base+" ("+set.repsL+"/"+set.repsR+(ex.t==="sec"?" s":" Wdh")+")";
  return base;
}

// Alle geloggten Sätze einer Übung, gruppiert nach Tag und aufsteigend sortiert – Grundlage für
// Verlauf/Fortschritt/Rekorde in der Übungsdetailansicht (sheetExerciseDetail).
function exSetsByDay(exid){
  var out=[];
  Object.keys(state.days).sort().forEach(function(d){
    var sets=(state.days[d].sets||[]).filter(function(s){return s.ex===exid;});
    if(sets.length)out.push({date:d,sets:sets});
  });
  return out;
}

// Bestwert (setValue: e1RM bei Gewichtsübungen, sonst Wdh./Sek.) je Trainingstag – die Datenreihe
// für den Fortschritts-Chart.
function exBestByDay(ex){
  return exSetsByDay(ex.id).map(function(r){
    var best=null,bestSet=null;
    r.sets.forEach(function(s){var v=setValue(ex,s);if(best==null||v>best){best=v;bestSet=s;}});
    return {date:r.date,val:best,set:bestSet};
  });
}


/* ================= Volumen ================= */
/* Wie viel ein Satz dieser Uebung jedem Muskel aufs Wochenkonto schreibt.
   Liegen Prozentwerte vor, zaehlt der Anteil direkt: 60 % sind 0,6 Saetze. Das ist nur
   deshalb zulaessig, weil die Prozente den Bezug "beste verfuegbare Uebung fuer diesen
   Muskel" haben - ein Satz Kreuzheben ist fuer den Quadrizeps eben nur ein knappes Drittel
   dessen, was ein Satz Kniebeuge waere. Ohne Prozentwerte bleibt es bei der groben
   Einteilung Primaer 1,0 / Sekundaer 0,5 / Stabilisator 0,25. */
/* Wie stark ein einzelner Satz zaehlt, je nachdem wie nah er am Muskelversagen war
   (RiR = Wiederholungen in Reserve). Bis etwa zwei Wiederholungen Reserve ist der Reiz
   nach heutigem Kenntnisstand praktisch gleich gross, darueber faellt er ab. Der Abfall
   ist bewusst flach und hat einen Boden - auch ein lockerer Satz ist nicht wirkungslos.
   Ohne Angabe zaehlt ein Satz voll: sonst wuerden alte Eintraege und alle, die das Feld
   weglassen, nachtraeglich abgewertet. */
var RIR_FULL=2,
 RIR_STEP=0.12,
 RIR_MIN=0.30;

function rirFactor(rir){
  if(rir==null||rir==="")return 1;
  var r=Number(rir);
  if(!isFinite(r)||r<0)return 1;
  if(r<=RIR_FULL)return 1;
  return Math.max(RIR_MIN,1-(r-RIR_FULL)*RIR_STEP);
}

function rirLabel(rir){
  if(rir==null||rir==="")return "";
  var r=Number(rir);
  return r>=5?"5+":String(r);
}

/* Auswahlreihe fuer die Reserve. Optional - nichts angetippt heisst "zaehlt voll".
   Erneutes Antippen derselben Zahl hebt die Auswahl wieder auf. */
function rirField(cur,onChange,compact){
  var wrap=el("div","rir"+(compact?" compact":""));
  if(!compact)wrap.appendChild(el("em",null,"Wiederholungen in Reserve"));
  var row=el("div","rir-chips"),btns=[];
  function paint(){btns.forEach(function(b){b.setAttribute("aria-pressed",String(cur!=null&&String(b.dataset.v)===String(cur)));});}
  [0,1,2,3,4,5].forEach(function(v){
    var b=el("button","rir-chip",v===5?"5+":String(v));
    b.type="button";b.dataset.v=String(v);
    b.title=v===0?"bis zum Muskelversagen":(v===5?"fünf oder mehr in Reserve":v+" in Reserve");
    b.onclick=function(ev){
      ev.preventDefault();ev.stopPropagation();
      cur=(cur!=null&&String(cur)===String(v))?null:v;
      paint();onChange(cur);
    };
    btns.push(b);row.appendChild(b);
  });
  wrap.appendChild(row);
  if(!compact)wrap.appendChild(el("span","rir-hint","0 = bis zum Muskelversagen. Ohne Angabe zählt der Satz voll; ab 3 in Reserve zählt er anteilig weniger."));
  paint();
  return wrap;
}

/* Beanspruchungs-Karte fuer eine ganze Einheit: erst zaehlen wie in der Wochenrechnung
   (Prozentwerte je Uebung, Reserve je Satz), dann ins Verhaeltnis zum am staerksten
   beanspruchten Muskel der Einheit setzen. Die Figur beantwortet damit "worauf zielt diese
   Einheit" - eine Frage, die von sich aus relativ ist. Auf 1/100 gerundet, damit der
   Zwischenspeicher der Standbilder stabile Schluessel bekommt. */
// Bei Einheiten bleibt alles sichtbar - nur der gerade Bauchmuskel braucht Transparenz,
// weil ihn die schraegen Bauchmuskeln sonst vollstaendig verdecken.
var FT_SESSION=["tg_bauch_gerade"];

function normInv(g){
  var mx=0,m,out={};
  for(m in g)if(g[m]>mx)mx=g[m];
  if(mx<=0)return out;
  for(m in g)if(g[m]>0)out[m]=Math.round(g[m]/mx*100)/100;
  return out;
}

function setsInvolve(list){
  var g={};
  (list||[]).forEach(function(s){
    var ex=exById(s.ex);if(!ex||ex.t==="cardio"||ex.mob)return;
    var w=exSetWeights(ex),f=rirFactor(s.rir),m;
    for(m in w)g[m]=(g[m]||0)+w[m]*f;
  });
  return normInv(g);
}

function exSetWeights(ex){
  var w={},pct=exPct(ex),g;
  if(pct){for(g in pct)w[g]=pct[g]/100;return w;}
  (ex.p||[]).forEach(function(m){w[m]=1;});
  (ex.s||[]).forEach(function(m){if(!(w[m]>=1))w[m]=0.5;});
  (ex.st||[]).forEach(function(m){if(!(w[m]>=0.5))w[m]=0.25;});
  return w;
}

/* Volumen INNERHALB einer Einheit.

   Hier stossen zwei Befunde aufeinander, und die Kurve muss beide aushalten:

   1. Die Meta-Regression zum Volumen pro Einheit findet ein Linear-Log-Modell als besten Fit
      und einen "point of undetectable outcome superiority" bei etwa 11 fraktionellen Saetzen:
      ab dort traegt ein weiterer Satz in derselben Einheit nichts Nachweisbares mehr bei.
   2. Die Meta-Regression zur Frequenz findet bei gleichem Wochenvolumen KEINEN verlaesslichen
      Effekt auf Hypertrophie - die Wahrscheinlichkeit, dass die Steigung ueber null liegt,
      blieb unter 100 %. Dieselbe Wochenzahl auf mehr Einheiten zu verteilen bringt also
      nachweisbar nichts, solange die einzelne Einheit nicht ueberladen ist.

   Ein reines Log von null an (eine fruehere Fassung hier) widerspricht Punkt 2: es bestraft
   schon den dritten und vierten Satz einer Einheit und belohnt damit jedes Aufteilen. Ein
   harter Knick bei 11 (die Fassung davor) widerspricht Punkt 1: er behandelt den 11. Satz
   wie den ersten. Beides war zu grob.

   Diese Kurve laeuft deshalb bis SESS_FLAT Saetze eins zu eins mit und biegt erst danach ab -
   exponentiell abklingend, mit einem Restwert SESS_FLOOR, damit ein Satz nie voellig wertlos
   wird. Bei 11 Saetzen ist die Steigung auf etwa 0,24 gefallen, die Kurve dort also praktisch
   flach. Wo genau der Knick liegt, gibt die Datenlage nicht her; 6 ist eine Setzung innerhalb
   der Unsicherheit und bewusst so gewaehlt, dass normale Einheiten unberuehrt bleiben. */
var SESS_FLAT=6,
 SESS_TAU=3.5,
 SESS_FLOOR=0.15;

var _sessU=SESS_TAU*Math.log(1/SESS_FLOOR);

var _sessE=SESS_FLAT+SESS_TAU*(1-SESS_FLOOR);

function capSession(s){
  if(!(s>0))return 0;
  if(s<=SESS_FLAT)return s;
  var u=s-SESS_FLAT;
  if(u<=_sessU)return SESS_FLAT+SESS_TAU*(1-Math.exp(-u/SESS_TAU));
  return _sessE+SESS_FLOOR*(u-_sessU);
}

function muscleSets(asOf,win){
  var from=shiftDays(asOf,-(win-1)),out={},m;
  MUSCLES.forEach(function(mm){out[mm.id]=0;});
  for(var d in state.days){
    if(d<from||d>asOf)continue;
    var day={};
    (state.days[d].sets||[]).forEach(function(s){
      var ex=exById(s.ex);if(!ex||ex.mob)return;
      var w=exSetWeights(ex),f=rirFactor(s.rir);
      for(var k in w)if(out[k]!=null)day[k]=(day[k]||0)+w[k]*f;
    });
    for(m in day)out[m]+=capSession(day[m]);
  }
  return out;
}

/* Persoenlicher Korridor. Die Richtwerte aus der Literatur sind Gruppenmittelwerte mit
   grosser Streuung - als Startpunkt brauchbar, als Messlatte nicht. Wer fuer einen Muskel
   erkennbar mehr oder weniger braucht, verschiebt den Korridor hier dauerhaft. Gespeichert
   wird ein Faktor je Muskel, damit Minimum, Optimum und Grenze gemeinsam wandern und ihr
   Verhaeltnis zueinander erhalten bleibt. */
var VOL_STEPS=[{f:0.70,l:"deutlich weniger"},{f:0.85,l:"weniger"},{f:1,l:"Standard"},
               {f:1.15,l:"mehr"},{f:1.30,l:"deutlich mehr"}];

function volFactor(id){
  var v=state&&state.profile&&state.profile.vol,f=v&&v[id];
  return (typeof f==="number"&&isFinite(f)&&f>0)?f:1;
}

function setVolFactor(id,f){
  if(!state.profile)return;
  if(!state.profile.vol)state.profile.vol={};
  if(f===1)delete state.profile.vol[id];else state.profile.vol[id]=f;
  saveLocal();queueSave();
}

function setVolFactorAll(f){
  if(!state.profile)return;
  if(!state.profile.vol)state.profile.vol={};
  MUSCLES.forEach(function(m){
    if(f===1)delete state.profile.vol[m.id];else state.profile.vol[m.id]=f;
  });
  saveLocal();queueSave();
}

/* Wie viele Muskeln stehen gerade NICHT auf diesem Wert? Nur die wuerde ein
   "fuer alle uebernehmen" veraendern - die Zahl steht in der Rueckfrage. */
function volOthersCount(f){
  var n=0;MUSCLES.forEach(function(m){if(volFactor(m.id)!==f)n++;});return n;
}

/* Liefert den fuer diesen Nutzer gueltigen Korridor. Alle Bewertungen laufen hierueber,
   damit nirgends mehr direkt m.mev/m.mav/m.mrv gelesen wird. */
function corr(m){
  var f=m?volFactor(m.id):1;
  if(!m||f===1)return m;
  var c={};for(var k in m)c[k]=m[k];
  c.mev=Math.max(1,Math.round(m.mev*f));
  c.mav=Math.max(c.mev+1,Math.round(m.mav*f));
  c.mrv=Math.max(c.mav+1,Math.round(m.mrv*f));
  return c;
}

/* Korridor persoenlich verschieben. Bewusst grobe Stufen statt freier Zahlen: alles
   Feinere waere Scheingenauigkeit, denn die Richtwerte sind selbst nur Groessenordnungen. */
function volField(m){
  var wrap=el("div","volset");
  wrap.appendChild(el("em",null,"Korridor für dich"));
  var row=el("div","volset-chips"),cur=volFactor(m.id),btns=[];
  function paint(){btns.forEach(function(b){b.setAttribute("aria-pressed",String(Number(b.dataset.f)===cur));});}
  VOL_STEPS.forEach(function(s){
    var b=el("button","volset-chip",s.l);
    b.type="button";b.dataset.f=String(s.f);
    b.title=s.f===1?"Richtwert aus der Literatur":Math.round(s.f*100)+" % des Richtwerts";
    b.onclick=function(ev){
      ev.preventDefault();ev.stopPropagation();
      cur=s.f;setVolFactor(m.id,s.f);renderSection("tab-koerper");
    };
    btns.push(b);row.appendChild(b);
  });
  wrap.appendChild(row);
  wrap.appendChild(el("span","volset-hint","Die Richtwerte sind Gruppenmittelwerte mit großer Streuung. Wenn du für diesen Muskel erkennbar mehr oder weniger brauchst, verschieb den Korridor hier."));
  // Dieselbe Stufe fuer alle Muskeln. Bewusst mit Rueckfrage: wer einzelne Muskeln schon
  // von Hand verschoben hat, wuerde die Arbeit sonst mit einem Fingertipp verlieren.
  var all=el("button","volset-all","Für alle Muskeln übernehmen");
  all.type="button";
  all.onclick=function(ev){
    ev.preventDefault();ev.stopPropagation();
    var lab="";VOL_STEPS.forEach(function(s){if(s.f===cur)lab=s.l;});
    var others=volOthersCount(cur);
    if(!others){toast("Alle Muskeln stehen schon auf „"+lab+"“");return;}
    askConfirm("Korridor für alle Muskeln?",
      "„"+lab+"“ gilt dann für alle "+MUSCLES.length+" Muskelgruppen. "+others+
      (others===1?" Gruppe steht":" Gruppen stehen")+" gerade anders und "+
      (others===1?"wird":"werden")+" überschrieben.",
      "Für alle übernehmen",
      function(){setVolFactorAll(cur);renderSection("tab-koerper");
        toast("Korridor für alle: "+lab);});
  };
  wrap.appendChild(all);
  paint();
  return wrap;
}

/* ---- Reizmodell -----------------------------------------------------------
   Saetze zaehlen nicht linear. In der groessten Meta-Regression zum Thema (Pelland
   et al., Sports Medicine 2025) war fuer Hypertrophie ein Wurzelmodell der beste Fit:
   der Zuwachs waechst mit der Wurzel des Wochenvolumens. Praktische Folge - doppelt so
   viele Saetze sind nicht doppelt so viel Ergebnis, sondern rund 41 % mehr.
   Bezugspunkt ist das persoenliche Optimum (MAV): dort ist der Reiz per Definition 100 %.
   Die Kurve ist ein Gruppenmittel mit weiter Unsicherheit (marginales R^2 ~ 22 %) und am
   ganz unteren Ende moeglicherweise steiler als die Wurzel - als Massstab fuers Verhaeltnis
   zwischen zwei Satzzahlen taugt sie, als Versprechen ueber den eigenen Zuwachs nicht. */
var REIZ_MAX=1.45;

function reizOf(v,m){var c=corr(m);return Math.sqrt(Math.max(0,v)/Math.max(.001,c.mav));}

function reizPct(v,m){return Math.round(reizOf(v,m)*100);}

// Was ein weiterer Satz noch bringt - gemessen am allerersten Satz der Woche (= 1,00).
function reizMarginal(v){v=Math.max(0,v);return Math.sqrt(v+1)-Math.sqrt(v);}

/* Wie viele Saetze es ab hier braucht, bis der Unterschied ueberhaupt nachweisbar waere.
   Stufen aus derselben Arbeit (Tabelle "efficiency tiers", fraktionelle Saetze/Woche). */
function reizNextStep(v){
  if(v<11)return 6;
  if(v<19)return 8.5;
  if(v<30)return 10.75;
  return 12.5;
}

function zoneOf(v,m){
  var c=corr(m);
  if(v<c.mev)return 0;
  if(v<=c.mrv)return 1;
  return 2;
}

function muscleScore(v,m){
  if(v<=0)return 0;
  var c=corr(m);
  if(v<c.mev)return v/c.mev*70;
  if(v<c.mav)return 70+30*(v-c.mev)/(c.mav-c.mev);
  if(v<=c.mrv)return 100;
  return Math.max(70,100-(v-c.mrv)*5);
}

function windowDays(asOf){
  var st=(state.profile&&state.profile.startedAt)||asOf;
  return clamp(daysBetween(st,asOf)+1,7,WIN_STATE);
}


/* ================= Ausdauer ================= */
function vo2Estimate(p){
  p=p||state.profile;if(!p)return null;
  if(p.cooper>0)return (p.cooper-504.9)/44.73;
  if(p.restHr>0)return 15.3*((208-0.7*(p.age||30))/p.restHr);
  return null;
}

function vo2Percentile(v,p){
  p=p||state.profile;
  if(v==null||!p)return null;
  var band=clamp(Math.floor((p.age||30)/10)*10,20,70);
  var row=(VO2NORM[p.sex]||VO2NORM.m)[band];if(!row)return null;
  var pc=[5,25,50,75,95];
  if(v<=row[0])return clamp(v/row[0]*5,0,5);
  for(var i=0;i<row.length-1;i++)if(v<=row[i+1])return pc[i]+(pc[i+1]-pc[i])*(v-row[i])/(row[i+1]-row[i]);
  return clamp(95+(v-row[4])/row[4]*20,95,100);
}

function cardioMinutes(asOf,win){
  var from=shiftDays(asOf,-(win-1)),eq=0,raw=0;
  for(var d in state.days){
    if(d<from||d>asOf)continue;
    (state.days[d].cardio||[]).forEach(function(c){
      var ex=exById(c.ex),f=INTENS[(ex&&ex.intens)||"mittel"]||1;
      eq+=(c.min||0)*f;raw+=(c.min||0);
    });
  }
  return {eq:eq,raw:raw};
}


/* ================= Formwert ================= */
function compute(asOf){
  var p=state.profile,win=windowDays(asOf),f=win/7;
  var from=shiftDays(asOf,-(win-1)),trainDays=0,mobDays=0;
  for(var d in state.days){
    if(d<from||d>asOf)continue;
    var dd=state.days[d];
    if((dd.sets||[]).length>0)trainDays++;
    if(dd.mobility)mobDays++;
  }
  var konst=p.goals.days>0?clamp(trainDays/(p.goals.days*f)*100,0,100):0;
  var mob=p.goals.mob>0?clamp(mobDays/(p.goals.mob*f)*100,0,100):100;
  var ms=muscleSets(asOf,WIN_BODY),sum=0;
  CORE_MUSCLES.forEach(function(id){sum+=muscleScore(ms[id]||0,muscleById(id));});
  var deckung=sum/CORE_MUSCLES.length;
  // Kraftwertung nach Bereichen (Brust, Rücken, …): jede Übung mit hinterlegtem Kraftstandard
  // zählt mit, sobald sie im Kraftfenster geloggt wurde. Pro Bereich zählt der beste Wert –
  // eine zusätzlich ausgeführte Übung kann einen Bereich also anheben, aber nie abwerten.
  var recs=[],unrated=[],seenEx={};
  var fromS=shiftDays(asOf,-(WIN_STRENGTH-1));
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
  recs.sort(function(a,b){return b.score-a.score;});
  // Pro Bereich zählt jetzt der Durchschnitt ALLER dort geloggten, bewertbaren Übungen (nicht
  // mehr nur die stärkste) – eine zusätzliche schwache Übung kann den Bereich also auch senken.
  // "top" (die stärkste Übung) wird weiterhin separat mitgeführt, nur um in der Übersicht
  // anzuzeigen, welcher Bestwert im Bereich am höchsten war.
  var cats=KRAFT_CATS.map(function(cat){
    var list=recs.filter(function(r){return r.cat===cat.id;});
    var top=list.length?list[0]:null;
    var avgScore=list.length?list.reduce(function(s,r){return s+r.score;},0)/list.length:0;
    return {id:cat.id,name:cat.name,exs:list,top:top,
            unr:unrated.filter(function(u){return u.cat===cat.id;}),
            score:avgScore,grade:list.length?levelFromScore(avgScore):null,best:top?top.best:null};
  });
  var ks=0;cats.forEach(function(ct){ks+=ct.score;});
  var kraft=cats.length?ks/cats.length:0;
  var cm=cardioMinutes(asOf,win);
  var who=p.goals.cardio>0?clamp(cm.eq/(p.goals.cardio*f)*100,0,100):100;
  var vo2=vo2Estimate(),vp=vo2Percentile(vo2);
  var ausdauer=vp!=null?0.5*who+0.5*vp:who;
  var fitness=Math.round(W.kraft*kraft+W.konst*konst+W.deckung*deckung+W.ausdauer*ausdauer+W.mob*mob);
  return {fitness:fitness,kraft:kraft,konst:konst,deckung:deckung,ausdauer:ausdauer,mob:mob,win:win,
          trainDays:trainDays,mobDays:mobDays,recs:recs,cats:cats,ms:ms,cm:cm,vo2:vo2,vpct:vp,who:who,asOf:asOf};
}


/* ================= Sheet ================= */
function openSheet(build){
  var b=$("sheet-body");b.innerHTML="";build(b);
  $("scrim").classList.add("open");$("sheet").classList.add("open");
  syncScrollLock();
}

function closeSheet(){
  $("scrim").classList.remove("open");$("sheet").classList.remove("open");
  syncScrollLock();
  // Eine Übung kann direkt aus einem offenen Tab heraus bearbeitet werden (z.B. Entdecken).
  // selectTab wird dabei nicht erneut aufgerufen, also muss der sichtbare Abschnitt hier
  // selbst auf sein dirty-Flag prüfen, sonst bleibt er mit alten Daten stehen.
  if(tab!=="tab-heute"&&secDirty[tab.replace("tab-","")])renderSection(tab);
}

$("scrim").addEventListener("click",closeSheet);

function sheetTitle(b,txt,trailing){
  if(!trailing){b.appendChild(el("h3",null,txt));return;}
  var row=el("div","sheet-title-row");
  row.appendChild(el("h3",null,txt));row.appendChild(trailing);
  b.appendChild(row);
}

function askNumber(title,val,step,min,max,unit,cb){
  openSheet(function(b){
    sheetTitle(b,title);
    var f=numField(unit||"",val,step,min);b.appendChild(f);
    var ok=el("button","btn primary block","Übernehmen");ok.style.marginTop="14px";
    ok.onclick=function(){var v=parseFloat(String(f.input.value).replace(",","."));if(isNaN(v))v=val;if(max!=null)v=Math.min(max,v);if(min!=null)v=Math.max(min,v);closeSheet();cb(v);};
    b.appendChild(ok);setTimeout(function(){try{f.input.focus();f.input.select();}catch(e){}},250);
  });
}

function askConfirm(title,text,okLabel,cb,danger){
  openSheet(function(b){
    sheetTitle(b,title);if(text)b.appendChild(el("p","note",text));
    var ok=el("button","btn "+(danger?"danger":"primary")+" block",okLabel||"Ja");ok.style.marginTop="14px";ok.onclick=function(){closeSheet();cb();};b.appendChild(ok);
    var no=el("button","btn ghost block","Abbrechen");no.style.marginTop="8px";no.onclick=closeSheet;b.appendChild(no);
  });
}

var toastT=null;

function toast(msg){
  var t=$("toast");if(!t){t=el("div","toast");t.id="toast";document.body.appendChild(t);}
  t.textContent=msg;t.classList.add("on");if(toastT)clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove("on");},2200);
}

function numField(labelTxt,val,step,min){
  var f=el("div","field");f.appendChild(el("label",null,labelTxt));
  var st=el("div","stepper");
  var minus=el("button",null,"−");minus.type="button";
  var inp=document.createElement("input");inp.type="number";inp.inputMode="decimal";
  inp.value=val;inp.step=step;if(min!=null)inp.min=min;
  var plus=el("button",null,"+");plus.type="button";
  minus.onclick=function(){inp.value=Math.max(min!=null?min:0,(parseFloat(inp.value)||0)-parseFloat(step));inp.dispatchEvent(new Event("input"));};
  plus.onclick=function(){inp.value=(parseFloat(inp.value)||0)+parseFloat(step);inp.dispatchEvent(new Event("input"));};
  st.appendChild(minus);st.appendChild(inp);st.appendChild(plus);
  f.appendChild(st);f.input=inp;return f;
}

function customExInUse(id){
  for(var k in state.days){if((state.days[k].sets||[]).some(function(s){return s.ex===id;}))return true;}
  for(var rid2 in state.routines){if(((state.routines[rid2]||{}).items||[]).some(function(it){return it.ex===id;}))return true;}
  return false;
}

function movementGroups(){
  return PATTERNS.filter(function(p){return p.id!=="cardio";}).map(function(p){return {id:p.id,name:p.name};})
    .concat([{id:"iso",name:"Isolation"},{id:"mob",name:"Mobilität"}]);
}

// Eine Zeile der Prozent-Liste: Muskelname links, Stepper (-, Zahl, +) rechts. Nutzt dieselbe
// .stepper-Optik wie die Gewichts-/Wiederholungsfelder beim Satz-Eintragen, nur kompakter.
function pctRow(name,val,onChange){
  var row=el("div","pctrow");
  row.appendChild(el("span","pctname",name));
  var st=el("div","stepper");
  var minus=el("button",null,"−");minus.type="button";
  var inp=document.createElement("input");inp.type="number";inp.inputMode="numeric";
  inp.min="1";inp.max="100";inp.step="5";inp.value=val;
  var plus=el("button",null,"+");plus.type="button";
  function clamp(v){v=Math.round(v);if(!isFinite(v))v=1;return Math.max(1,Math.min(100,v));}
  function commit(v){v=clamp(v);inp.value=v;onChange(v);}
  minus.onclick=function(){commit((parseFloat(inp.value)||1)-5);};
  plus.onclick=function(){commit((parseFloat(inp.value)||0)+5);};
  inp.addEventListener("change",function(){commit(parseFloat(inp.value)||1);});
  st.appendChild(minus);st.appendChild(inp);st.appendChild(plus);
  row.appendChild(st);row.appendChild(el("span","pctsuffix","%"));
  return row;
}

// Liste aller aktuell gewählten Muskeln mit je einem eigenen Prozentwert (100 % = die stärkste
// Übung dafür im ganzen Katalog - dieselbe Skala wie EX_PCT). Ergänzt die grobe Primär-/
// Sekundär-Auswahl darüber um eine feinere, selbst gesetzte Gewichtung je Muskel.
function pctListField(getIds,pctById,onChange){
  var f=el("div","field msel-pct");
  f.appendChild(el("label",null,"Anteil pro Muskel"));
  var list=el("div","pctlist");f.appendChild(list);
  f.appendChild(el("p","note","100 % = die stärkste Übung dafür im ganzen Katalog. Wird nichts geändert, zählt Primär 100 %, Sekundär 50 %."));
  function render(){
    list.innerHTML="";
    var ids=getIds();
    if(!ids.length){list.appendChild(el("div","empty","Erst oben Muskeln auswählen."));return;}
    ids.forEach(function(id){
      var m=muscleById(id);if(!m)return;
      list.appendChild(pctRow(m.name,pctById[id]!=null?pctById[id]:100,function(v){pctById[id]=v;}));
    });
  }
  f.render=render;render();
  return f;
}

/* Zwei kleine Figuren, die zeigen, was die gerade gewaehlten Muskeln auf dem Koerper
   bedeuten. Wird beim Tippen nicht sofort neu gerendert, sondern kurz gesammelt - ein
   Standbild kostet Rechenzeit, und beim Durchklicken mehrerer Chips waere jedes einzelne
   Zwischenbild verschwendet. */
function exFormFigs(getInv){
  var wrap=el("div","wo-figwrap exform-figs"),box=el("div","wo-figs"),svgs={};
  [["front","Vorne"],["back","Hinten"]].forEach(function(v){
    var fig=document.createElement("figure");
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());
    sv.setAttribute("role","img");sv.setAttribute("aria-label","Beanspruchte Muskeln, "+v[1]);
    fig.appendChild(sv);fig.appendChild(el("figcaption",null,v[1]));
    box.appendChild(fig);svgs[v[0]]=sv;
  });
  wrap.appendChild(box);
  var t=null;
  wrap.refresh=function(){
    if(t)clearTimeout(t);
    t=setTimeout(function(){
      t=null;
      var inv=getInv()||{},keys=[],g;
      for(g in inv)keys.push(g+":"+inv[g]);
      keys.sort();
      var key="exform:"+keys.join(",");
      ["front","back"].forEach(function(v){
        var sv=svgs[v];
        sv.removeAttribute("data-filled");
        fw3dSnapInto(sv,key,inv,v,false,null,"step",null,true);
      });
    },280);
  };
  return wrap;
}

/* Aufklappbare Mehrfachauswahl. Die Kopfzeile zeigt, was gewaehlt ist, ohne dass man
   die ganze Liste aufklappen muss. */
function muscleSelectField(label,items,selected,onToggle,onChange){
  var f=el("div","field msel");
  f.appendChild(el("label",null,label));
  var head=el("button","msel-head");head.type="button";head.setAttribute("aria-expanded","false");
  var val=el("span","msel-val");
  var chev=el("span","chev");chev.innerHTML=svgIcon(IC_CHEV);
  head.appendChild(val);head.appendChild(chev);
  var bar=el("div","chipbar wrap msel-list");bar.hidden=true;
  var chipsById={};
  function paintHead(){
    if(!selected.length){val.textContent="keine gewählt";return;}
    var names=selected.map(function(id){var m=muscleById(id);return m?m.name:id;});
    val.textContent=names.length<=2?names.join(" · "):(names.length+" gewählt: "+names.slice(0,2).join(" · ")+" …");
  }
  head.onclick=function(){bar.hidden=!bar.hidden;head.setAttribute("aria-expanded",String(!bar.hidden));};
  items.forEach(function(m){
    var c=el("button","fchip",m.name);c.type="button";
    c.setAttribute("aria-pressed",String(selected.indexOf(m.id)>=0));
    c.onclick=function(){
      var i=selected.indexOf(m.id);
      if(i>=0)selected.splice(i,1);else selected.push(m.id);
      c.setAttribute("aria-pressed",String(selected.indexOf(m.id)>=0));
      onToggle&&onToggle(m.id,selected.indexOf(m.id)>=0);
      paintHead();onChange&&onChange();
    };
    chipsById[m.id]=c;bar.appendChild(c);
  });
  f.appendChild(head);f.appendChild(bar);
  f.chipsById=chipsById;
  f.setPressed=function(id,v){if(chipsById[id])chipsById[id].setAttribute("aria-pressed",String(!!v));paintHead();};
  f.paintHead=paintHead;
  paintHead();
  return f;
}

function muscleChipField(label,items,selected,onToggle){
  var f=el("div","field");f.appendChild(el("label",null,label));
  var bar=el("div","chipbar wrap");
  var chipsById={};
  items.forEach(function(m){
    var c=el("button","fchip",m.name);c.type="button";
    c.setAttribute("aria-pressed",String(selected.indexOf(m.id)>=0));
    c.onclick=function(){
      var i=selected.indexOf(m.id);
      if(i>=0)selected.splice(i,1);else selected.push(m.id);
      c.setAttribute("aria-pressed",String(selected.indexOf(m.id)>=0));
      onToggle&&onToggle(m.id,selected.indexOf(m.id)>=0);
    };
    chipsById[m.id]=c;bar.appendChild(c);
  });
  f.appendChild(bar);f.chipsById=chipsById;
  f.setPressed=function(id,val){if(chipsById[id])chipsById[id].setAttribute("aria-pressed",String(!!val));};
  return f;
}

// Gemeinsames Formular fürs Anlegen UND spätere Bearbeiten einer Übung (jede Übung soll sich
// anpassen lassen, nicht nur selbst angelegte – eingebaute Übungen laufen dafür über
// state.exOverrides statt direkter Mutation der EX-Grunddaten, siehe applyExOverrides()).
// `existing` (optional) liefert die Vorbelegung beim Bearbeiten.
function exerciseForm(b,existing){
  var nameF=el("div","field");nameF.appendChild(el("label",null,"Name"));
  var nameI=document.createElement("input");nameI.type="text";nameI.autocomplete="off";nameI.placeholder="z. B. Butterfly Maschine";
  if(existing)nameI.value=existing.n;
  nameF.appendChild(nameI);b.appendChild(nameF);

  var eqF=el("div","field");eqF.appendChild(el("label",null,"Equipment"));
  var eqI=document.createElement("input");eqI.type="text";eqI.autocomplete="off";eqI.placeholder="z. B. Maschine";
  if(existing)eqI.value=existing.e||"";
  eqF.appendChild(eqI);b.appendChild(eqF);

  var grid=el("div","grid2");grid.style.marginTop="10px";
  var typeF=el("div","field");typeF.appendChild(el("label",null,"Art"));
  var typeSel=document.createElement("select");
  [["load","Gewicht × Wdh"],["reps","Wiederholungen"],["sec","Sekunden halten"]].forEach(function(o){
    var op=document.createElement("option");op.value=o[0];op.textContent=o[1];typeSel.appendChild(op);
  });
  if(existing)typeSel.value=existing.t;
  typeF.appendChild(typeSel);grid.appendChild(typeF);

  var patF=el("div","field");patF.appendChild(el("label",null,"Bewegungsmuster"));
  var patSel=document.createElement("select");
  movementGroups().forEach(function(p){var op=document.createElement("option");op.value=p.id;op.textContent=p.name;patSel.appendChild(op);});
  if(existing)patSel.value=existing.pat;
  patF.appendChild(patSel);grid.appendChild(patF);
  b.appendChild(grid);

  // Zählt das eingetragene Gewicht als Gesamtgewicht (Langhantel, Maschine) oder als Gewicht
  // pro Seite (Kurzhanteln – man hält ja zwei mit demselben Gewicht)? Nur relevant bei "Gewicht
  // × Wdh", deshalb ein-/ausgeblendet je nach gewählter Art.
  var wtMode=(existing&&existing.wt==="side")?"side":"total";
  var wtWrap=el("div");wtWrap.appendChild(el("label",null,"Gewicht zählt als"));
  var wtSeg=el("div","segbtn");
  [["total","Gesamtgewicht"],["side","Pro Seite"]].forEach(function(o){
    var bb=el("button",null,o[1]);bb.type="button";bb.setAttribute("aria-selected",String(wtMode===o[0]));
    bb.onclick=function(){wtMode=o[0];Array.prototype.forEach.call(wtSeg.children,function(c){c.setAttribute("aria-selected",String(c===bb));});};
    wtSeg.appendChild(bb);
  });
  wtWrap.appendChild(wtSeg);
  wtWrap.appendChild(el("p","note","Bei Kurzhanteln meist „Pro Seite“ (Gewicht je Hantel) – die Gesamtlast ist dann das Doppelte. Bei Maschine oder Langhantel „Gesamtgewicht“."));
  b.appendChild(wtWrap);
  function syncWtVisibility(){wtWrap.hidden=typeSel.value!=="load";}
  typeSel.addEventListener("change",syncWtVisibility);syncWtVisibility();

  // Einseitig (z. B. einarmig/einbeinig) – dann werden links/rechts beim Eintragen getrennt erfasst.
  var uniMode=!!(existing&&existing.uni);
  var uniWrap=el("div");uniWrap.appendChild(el("label",null,"Ausführung"));
  var uniSeg=el("div","segbtn");
  [[false,"Beidseitig"],[true,"Einseitig (L/R getrennt)"]].forEach(function(o){
    var bb=el("button",null,o[1]);bb.type="button";bb.setAttribute("aria-selected",String(uniMode===o[0]));
    bb.onclick=function(){uniMode=o[0];Array.prototype.forEach.call(uniSeg.children,function(c){c.setAttribute("aria-selected",String(c===bb));});};
    uniSeg.appendChild(bb);
  });
  uniWrap.appendChild(uniSeg);
  b.appendChild(uniWrap);

  // Manche eingebauten Uebungen (z.B. Ueberzuege) fuehren denselben Muskel historisch in
  // p UND s - exInvolve/exHits werten das schon immer als "primaer" (p gewinnt), aber ohne
  // diesen Filter wuerde die neue Prozent-Liste unten die Zeile doppelt anzeigen.
  var pri=existing?(existing.p||[]).slice():[],
      sec=existing?(existing.s||[]).slice().filter(function(id){return pri.indexOf(id)<0;}):[];
  var existingPct=existing?exPctInv(existing):null;
  var pctById={};
  pri.forEach(function(id){pctById[id]=existingPct&&existingPct[id]!=null?Math.round(existingPct[id]*100):100;});
  sec.forEach(function(id){pctById[id]=existingPct&&existingPct[id]!=null?Math.round(existingPct[id]*100):50;});
  var figs=exFormFigs(function(){
    var inv={};
    pri.forEach(function(g){inv[g]=1;});
    sec.forEach(function(g){if(!(inv[g]>=1))inv[g]=0.5;});
    return inv;
  });
  function refreshFigs(){figs.refresh();pctField.render();}
  var priField=muscleSelectField("Primärmuskeln",MUSCLES,pri,
    function(id,on){if(on){var i=sec.indexOf(id);if(i>=0){sec.splice(i,1);secField.setPressed(id,false);}if(pctById[id]==null)pctById[id]=100;}},refreshFigs);
  var secField=muscleSelectField("Sekundärmuskeln (halber Satz)",MUSCLES,sec,
    function(id,on){if(on){var i=pri.indexOf(id);if(i>=0){pri.splice(i,1);priField.setPressed(id,false);}if(pctById[id]==null)pctById[id]=50;}},refreshFigs);
  var pctField=pctListField(function(){return pri.concat(sec);},pctById);
  b.appendChild(el("label",null,"Vorschau"));
  b.appendChild(figs);
  b.appendChild(priField);b.appendChild(secField);
  b.appendChild(pctField);
  refreshFigs();
  b.appendChild(el("p","note","Primärmuskeln zählen mit vollem, Sekundärmuskeln mit halbem Satz fürs Wochenvolumen, sofern der Anteil oben nicht geändert wurde."));

  var err=el("p","note","");err.style.color="var(--red)";err.hidden=true;b.appendChild(err);

  return {
    nameI:nameI,
    getPatch:function(){
      var name=nameI.value.trim();
      if(!name){err.textContent="Bitte einen Namen eingeben.";err.hidden=false;nameI.focus();return null;}
      if(!pri.length){err.textContent="Bitte mindestens einen Primärmuskel wählen.";err.hidden=false;return null;}
      var patch={n:name,t:typeSel.value,pat:patSel.value,e:eqI.value.trim()||"Sonstiges",p:pri.slice(),s:sec.slice()};
      var pctOut={};
      pri.concat(sec).forEach(function(id){pctOut[id]=pctById[id]!=null?pctById[id]:(pri.indexOf(id)>=0?100:50);});
      patch.pct=pctOut;
      if(patSel.value==="mob")patch.mob=true;
      if(typeSel.value==="load"&&wtMode==="side")patch.wt="side";
      if(uniMode)patch.uni=true;
      return patch;
    }
  };
}

function sheetCreateExercise(kinds,onPick){
  openSheet(function(b){
    sheetTitle(b,"Neue Übung");
    var form=exerciseForm(b,null);
    var save=el("button","btn primary block","Übung anlegen");save.style.marginTop="14px";
    save.onclick=function(){
      var patch=form.getPatch();if(!patch)return;
      var created=addCustomExercise(patch);
      toast("Übung angelegt");
      onPick(created);
    };
    b.appendChild(save);
    var cancel=el("button","btn ghost block","Abbrechen");cancel.style.marginTop="8px";
    cancel.onclick=function(){openSheet(function(bb){sheetTitle(bb,"Übung wählen");exPicker(bb,kinds,onPick);});};
    b.appendChild(cancel);
    setTimeout(function(){try{form.nameI.focus();}catch(e){}},250);
  });
}

// Jede Übung lässt sich anpassen – eigene wie eingebaute. Bei eingebauten Übungen wird die
// Änderung als Override gespeichert (state.exOverrides), nicht die EX-Grunddaten selbst, damit
// sich das jederzeit wieder auf den Originalzustand zurücksetzen lässt.
function sheetEditExercise(ex,onDone){
  openSheet(function(b){
    sheetTitle(b,"Übung bearbeiten");
    var form=exerciseForm(b,ex);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var patch=form.getPatch();if(!patch)return;
      if(ex.custom){
        Object.keys(ex).forEach(function(k){if(k!=="id"&&k!=="custom")delete ex[k];});
        Object.assign(ex,patch);saveLocal();secDirty.entdecken=true;
      } else {
        setExOverride(ex.id,patch);
      }
      toast("Übung aktualisiert");
      onDone(ex);
    };
    b.appendChild(save);
    if(!ex.custom&&state.exOverrides&&state.exOverrides[ex.id]){
      var reset=el("button","btn ghost block","Auf Standard zurücksetzen");reset.style.marginTop="8px";
      reset.onclick=function(){
        askConfirm("Auf Standard zurücksetzen?","Deine Änderungen an „"+ex.n+"“ werden verworfen.","Zurücksetzen",function(){
          resetExOverride(ex.id);toast("Zurückgesetzt");onDone(exById(ex.id));
        },true);
      };
      b.appendChild(reset);
    }
    var cancel=el("button","btn ghost block","Abbrechen");cancel.style.marginTop="8px";
    cancel.onclick=function(){onDone(ex);};
    b.appendChild(cancel);
    setTimeout(function(){try{form.nameI.focus();}catch(e){}},250);
  });
}

/* Wie stark trifft eine Übung die genannten Muskeln? 1 = Primärmuskel (starker Fokus),
   0,5 = Sekundärmuskel (wird mittrainiert), 0 = gar nicht. */
function exHits(e,ids){
  var v=0;
  ids.forEach(function(g){
    if((e.p||[]).indexOf(g)>=0){if(v<1)v=1;}
    else if((e.s||[]).indexOf(g)>=0){if(v<0.5)v=0.5;}
    else if((e.st||[]).indexOf(g)>=0){if(v<0.25)v=0.25;}
  });
  return v;
}

/* Wie stark trifft eine Uebung einen Muskel WIRKLICH - fein abgestuft ueber EX_PCT (100 % =
   die beste Uebung dafuer im ganzen Katalog), statt nur grob ueber Primaer-/Sekundaermuskel.
   Der Ueberzug zaehlt fuer den Latissimus z.B. als Primaermuskel (steht in ex.p), liegt aber
   bei nur 22 % - ohne diese feinere Sortierung stuende er trotzdem vor dem Klimmzug (100 %).
   Faellt auf exHits zurueck, wenn fuer die Uebung noch kein Prozentwert hinterlegt ist. */
function exFocusScore(e,ids){
  var pct=exPctInv(e),v=0;
  ids.forEach(function(g){
    var s=pct?(pct[g]||0):0;
    if(s>v)v=s;
  });
  return pct?v:exHits(e,ids);
}

// Gewählten Chip in die Mitte der Leiste holen – sonst steht die Auswahl außerhalb des Bildes.
function centerChip(bar){
  var c=bar.querySelector('.fchip[aria-pressed="true"]');if(!c)return;
  bar.scrollLeft=Math.max(0,c.offsetLeft-bar.clientWidth/2+c.offsetWidth/2);
}

/* Übungsauswahl: gefiltert nach Muskeln – oben die großen Regionen (Brust, Rücken …),
   darunter deren einzelne Muskeln (obere/mittlere/untere Brust …). Getrennt gelistet nach
   „starker Fokus“ (Primärmuskel) und „wird mittrainiert“ (Sekundärmuskel). */
function equipOptions(){
  var counts={};
  EX.forEach(function(e){
    if(e.t==="cardio"||!e.e||e.e==="—")return;
    counts[e.e]=(counts[e.e]||0)+1;
  });
  return Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];});
}

function exPicker(b,kinds,onPick,opts){
  opts=opts||{};
  var q="",reg=null,fine=null,mk=null;
  var equip=[];
  var searchRow=el("div","searchrow");
  var search=document.createElement("input");
  search.type="search";search.placeholder="Übung suchen…";search.autocomplete="off";
  searchRow.appendChild(search);
  var filterBtn=el("button","filterbtn");filterBtn.type="button";filterBtn.setAttribute("aria-label","Filter");
  filterBtn.innerHTML=svgIcon(IC_FILTER,1.8);
  var filterBadge=el("span","badge");filterBadge.hidden=true;filterBtn.appendChild(filterBadge);
  function updateFilterBadge(){
    filterBadge.hidden=!equip.length;
    if(equip.length)filterBadge.textContent=String(equip.length);
    filterBtn.setAttribute("data-active",String(!!equip.length));
  }
  filterBtn.onclick=function(){
    openEquipFilterMenu(equip,function(){draw();updateFilterBadge();},function(){return filteredArr().length;});
  };
  searchRow.appendChild(filterBtn);
  b.appendChild(searchRow);
  // Dieselbe Kachel-Optik wie im Entdecken-Tab (renderDiscMuscleGrid): eine Kachel pro Region
  // mit der markierten Muskelflaeche auf der Koerperfigur, plus die Cardio-Kachel mit dem
  // Laufband, statt einer reinen Text-Chip-Leiste. Erneutes Antippen einer bereits gewaehlten
  // Kachel hebt die Auswahl wieder auf (kein extra "Alle"-Element - genau wie bei Entdecken).
  var chips=el("div","disc-mgrid"),sub=el("div","chipbar sub");
  function regionChips(){
    chips.innerHTML="";
    REGIONS.concat(opts.cardio?[CARDIO_REGION,MOB_REGION]:[]).forEach(function(rg){
      var card=el("button","disc-mcard");card.type="button";
      card.setAttribute("aria-pressed",String(reg===rg));
      if(rg.cardio){
        card.appendChild(cardioTreadmillIcon());
      }else if(rg.mobility){
        card.appendChild(mobBandIcon());
      }else{
        var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
        sv.setAttribute("viewBox",regionCropCache[rg.key||rg.name]||CROP_DEFAULT);
        sv.setAttribute("data-region",rg.key||rg.name);
        sv.setAttribute("role","img");sv.setAttribute("aria-label",rg.name);
        card.appendChild(sv);
      }
      card.appendChild(el("span",null,rg.name));
      card.onclick=function(){reg=(reg===rg?null:rg);fine=null;mk=null;regionChips();subChips();draw();};
      chips.appendChild(card);
    });
    discLazyObserve(chips);
  }
  function subChips(){
    sub.innerHTML="";sub.hidden=!reg;
    if(!reg)return;
    if(reg.mobility){
      MOB_KINDS.forEach(function(k){
        var c=el("button","fchip",k[1]);c.type="button";
        c.setAttribute("aria-pressed",String(mk===k[0]));
        c.onclick=function(){mk=k[0];subChips();draw();};
        sub.appendChild(c);
      });
      centerChip(sub);
      return;
    }
    var all=el("button","fchip","Ganze Region");all.type="button";all.setAttribute("aria-pressed",String(!fine));
    all.onclick=function(){fine=null;subChips();draw();};
    sub.appendChild(all);
    reg.ids.forEach(function(id){
      var m=muscleById(id);if(!m)return;
      var c=el("button","fchip",m.name);c.type="button";c.setAttribute("aria-pressed",String(fine===id));
      c.onclick=function(){fine=id;subChips();draw();};
      sub.appendChild(c);
    });
    centerChip(sub);
  }
  if(!kinds){regionChips();subChips();b.appendChild(chips);b.appendChild(sub);}
  var addBtn=el("div","exadd");addBtn.appendChild(el("b",null,"+ Neue Übung erstellen"));
  addBtn.onclick=function(){sheetCreateExercise(kinds,onPick);};
  b.appendChild(addBtn);
  var list=el("div","exlist exlist-cards");b.appendChild(list);
  function item(e){
    return discExCard(e,onPick,function(){draw();});
  }
  function filteredArr(){
    var mobMode=!!(reg&&reg.mobility);
    var qq=q.toLowerCase(),ids=mobMode?null:(fine?[fine]:(reg?reg.ids:null));
    var cardioMode=!!(reg&&reg.cardio);
    return EX.filter(function(e){
      if(kinds){if(kinds.indexOf(e.t)<0)return false;}
      else if(mobMode){if(!e.mob)return false;if(mk&&e.mk!==mk)return false;}
      else if(e.mob)return false;
      else if(cardioMode){if(e.t!=="cardio")return false;}
      else if(e.t==="cardio")return false;
      if(qq&&e.n.toLowerCase().indexOf(qq)<0&&(e.e||"").toLowerCase().indexOf(qq)<0)return false;
      if(equip.length&&equip.indexOf(e.e)<0)return false;
      if(ids&&!exHits(e,ids))return false;
      return true;
    });
  }
  function draw(){
    list.innerHTML="";
    var ids=(reg&&reg.mobility)?null:(fine?[fine]:(reg?reg.ids:null));
    var arr=filteredArr();
    if(!arr.length){list.appendChild(el("div","empty","Nichts gefunden."));return;}
    // Großzügige Obergrenzen statt einer harten Kappung – der Katalog soll wirklich ALLE
    // Übungen zeigen können, nicht nur die ersten paar (früher 90/60, das reichte bei
    // wachsendem Katalog nicht mehr für die ungefilterte "Alle"-Ansicht).
    if(!ids){arr.slice(0,600).forEach(function(e){list.appendChild(item(e));});discLazyObserve(list);return;}
    var pri=arr.filter(function(e){return exHits(e,ids)>=1;}).slice(0,300);
    var sec=arr.filter(function(e){return exHits(e,ids)<1;}).slice(0,300);
    pri.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
    sec.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
    var name=fine?muscleById(fine).name:reg.name;
    if(pri.length){
      list.appendChild(el("div","grouplab","Starker Fokus · "+name));
      pri.forEach(function(e){list.appendChild(item(e));});
    }
    if(sec.length){
      list.appendChild(el("div","grouplab","Wird mittrainiert"));
      sec.forEach(function(e){list.appendChild(item(e));});
    }
    discLazyObserve(list);
  }
  search.addEventListener("input",function(){q=this.value;draw();});
  draw();
}

/* ================= Übungskatalog (eigenständig ansehen/anlegen) ================= */
// Nutzt exPicker unverändert (Suche, Regionfilter, "+ Neue Übung erstellen", Löschen eigener
// Übungen) – bisher nur innerhalb der Trainings-/Einheiten-Erstellung erreichbar. Hier als
// eigener Einstiegspunkt: Antippen zeigt Details statt die Übung irgendwo einzutragen.
function openExerciseCatalog(){
  openSheet(function(b){sheetTitle(b,"Übungskatalog");exPicker(b,null,sheetExerciseDetail);});
}

// Body-Scroll bleibt gesperrt, solange entweder das Bottom-Sheet ODER die Übungsdetail-Vollbild-
// seite offen ist – beide können unabhängig voneinander (auf-)geschlossen werden (Bearbeiten
// öffnet z. B. ein Sheet OBEN AUF der Detailseite).
function syncScrollLock(){
  var sheetOpen=($("sheet")&&$("sheet").classList.contains("open"))||($("sheet2")&&$("sheet2").classList.contains("open"));
  var pageOpen=$("exdpage")&&!$("exdpage").hidden;
  document.body.style.overflow=(sheetOpen||pageOpen)?"hidden":"";
}

function openSheet2(build){
  var b=$("sheet2-body");b.innerHTML="";build(b);
  $("scrim2").classList.add("open");$("sheet2").classList.add("open");
  syncScrollLock();
}

function closeSheet2(){
  $("scrim2").classList.remove("open");$("sheet2").classList.remove("open");
  syncScrollLock();
}

$("scrim2").addEventListener("click",closeSheet2);

// Gemeinsames Filter-Menu (Ausruestung) fuer Uebungs-Picker und Entdecken-Tab: "selected" ist
// das Auswahl-Array des Aufrufers (wird direkt mutiert), "onChange" aktualisiert dessen Liste
// live bei jedem Klick, "countFn" liefert die aktuelle Trefferzahl fuer den Anwenden-Knopf.
function openEquipFilterMenu(selected,onChange,countFn){
  openSheet2(function(b){
    var head=el("div","sheet-title-row");
    head.appendChild(el("h3",null,"Filter"));
    var close=el("button","iconbtn");close.type="button";close.setAttribute("aria-label","Schließen");
    close.innerHTML=svgIcon(IC_X,2);close.onclick=closeSheet2;
    head.appendChild(close);
    b.appendChild(head);
    b.appendChild(el("h2","sec","Ausrüstung"));
    var grid=el("div","equip-grid");
    var applyBtn=el("button","btn primary block","");applyBtn.type="button";
    function refreshCount(){
      var n=countFn();
      applyBtn.textContent=n+" Übung"+(n===1?"":"en")+" anzeigen";
    }
    equipOptions().forEach(function(eq){
      var card=el("button","equip-card");card.type="button";
      card.setAttribute("aria-pressed",String(selected.indexOf(eq)>=0));
      card.innerHTML=equipIcon(eq);
      card.appendChild(el("span",null,eq));
      card.onclick=function(){
        var i=selected.indexOf(eq);
        if(i>=0)selected.splice(i,1);else selected.push(eq);
        card.setAttribute("aria-pressed",String(i<0));
        onChange();refreshCount();
      };
      grid.appendChild(card);
    });
    b.appendChild(grid);
    var foot=el("div","equip-sheet-foot");
    var clearBtn=el("button","linkbtn","Alles löschen");clearBtn.type="button";
    clearBtn.onclick=function(){
      selected.length=0;
      Array.prototype.forEach.call(grid.children,function(c){c.setAttribute("aria-pressed","false");});
      onChange();refreshCount();
    };
    foot.appendChild(clearBtn);foot.appendChild(applyBtn);
    b.appendChild(foot);
    applyBtn.onclick=closeSheet2;
    refreshCount();
  });
}

// Sheets, die beim Oeffnen der Detailseite offen waren. Sie werden nur unsichtbar
// gemacht, nicht geschlossen - ihr Inhalt bleibt genau so stehen, wie er war.
var exPageBack=[];

function hideOpenSheets(){
  var out=[];
  ["scrim","sheet","scrim2","sheet2"].forEach(function(id){
    var n=$(id);
    if(n&&n.classList.contains("open")){n.style.display="none";out.push(n);}
  });
  return out;
}

function showHiddenSheets(list){
  (list||[]).forEach(function(n){if(n)n.style.display="";});
}

/* ================= 3D-Bewegungsablauf (animierter Arm) =================
   Ein eigenes, kleines 3D-Fenster nur fuer die Uebungsseite: der rechte Arm aus dem
   Anatomie-Rig (Blender), mit gebackener Bewegung und den Muskelfarben der Uebung.
   Viewer und Modell liegen gzip-komprimiert vor und werden erst beim Oeffnen entpackt. */
var FW_ANIM_V="__DATEN_ENTFERNT__base64__202092_ZEICHEN__";

var FW_ANIM_G="__DATEN_ENTFERNT__base64__454724_ZEICHEN__";

var FW_ANIM_CLIP={curl_bb:"curl",curl_db:"curl",curl_cable:"curl",curl_hammer:"hammer"}
;

var fwAnimGlb=null,
 fwAnimHtml=null;

function fwAnimB64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}

function fwAnimGunzip(u){return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();}

function exAnimBlock(ex){
  var clip=FW_ANIM_CLIP[ex.id]; if(!clip)return null;
  var wrap=el("div","exanim");
  var box=el("div","exanim-box"); wrap.appendChild(box);
  box.appendChild(el("span","exanim-load","3D-Modell wird geladen …"));
  wrap.appendChild(el("p","note exanim-cap","Rechter Arm, Muskeln in den Farben von „Beanspruchte Muskeln“."));
  if(typeof DecompressionStream==="undefined"){box.firstChild.textContent="Die 3D-Animation braucht einen neueren Browser.";return wrap;}
  var fr=document.createElement("iframe"); fr.className="exanim-frame"; fr.id="exanim-frame"; fr.title="3D-Bewegungsablauf";
  box.appendChild(fr);
  var inv=exPctInv(ex)||exInvolve(ex);
  fr._fwAnim={clip:clip,colors:fw3dColorsForInvolve(inv,"step")};
  (fwAnimHtml?Promise.resolve(fwAnimHtml):fwAnimGunzip(fwAnimB64(FW_ANIM_V)).then(function(b){return (fwAnimHtml=new TextDecoder("utf-8").decode(b));}))
    .then(function(h){fr.srcdoc=h;})
    .catch(function(){box.firstChild.textContent="3D-Animation konnte nicht geladen werden.";});
  return wrap;
}

window.addEventListener("message",function(ev){
  var d=ev.data; if(!d||d.src!=="fwanim")return;
  var fr=$("exanim-frame"); if(!fr||ev.source!==fr.contentWindow)return;
  if(d.type==="boot"){
    if(!fwAnimGlb)fwAnimGlb=fwAnimB64(FW_ANIM_G);
    var buf=fwAnimGlb.slice().buffer;
    try{fr.contentWindow.postMessage({to:"fwanim",type:"init",glb:buf,clip:fr._fwAnim.clip,colors:fr._fwAnim.colors,neutral:"#B0B6BE"},"*",[buf]);}catch(e){}
  }else if(d.type==="ready"){fr.parentNode.classList.add("ready");}
  else if(d.type==="error"){var bx=fr.parentNode;bx.firstChild.textContent="3D-Animation konnte nicht geladen werden.";fr.remove();}
});

function closeExPage(){
  var af=$("exanim-frame");if(af)af.remove();
  var page=$("exdpage");if(!page||page.hidden)return;
  page.hidden=true;
  showHiddenSheets(exPageBack);exPageBack=[];
  syncScrollLock();
}

// Übungsdetail: eigene Vollbildseite (kein Sheet mehr) – alle Bereiche (Muskeln, Verlauf,
// Fortschritt, Rekorde) stehen der Reihe nach untereinander, man sieht alles durch Scrollen statt
// über Tabs umschalten zu müssen.
function sheetExerciseDetail(ex){
  var page=$("exdpage");
  if(page.hidden){
    // Von aussen geoeffnet: eine offene Auswahl darunter nur ausblenden, damit "Zurueck"
    // genau dorthin zurueckfuehrt - mit Suchbegriff, Filter und Scrollposition.
    exPageBack=hideOpenSheets();
  }else{
    // Aus der Detailseite heraus (nach dem Bearbeiten): das Bearbeiten-Sheet gehoert
    // wirklich zu - es wird geschlossen, der Rueckweg bleibt der von vorhin.
    closeSheet2();closeSheet();
  }
  var kamVonListe=exPageBack.length>0;
  page.hidden=false;syncScrollLock();
  var head=$("exdpage-head");head.innerHTML="";
  var back=el("button","iconbtn");back.type="button";back.setAttribute("aria-label","Zurück");
  back.innerHTML=svgIcon(IC_CHEVLEFT,2.1);back.onclick=closeExPage;
  head.appendChild(back);
  head.appendChild(el("div","exdpage-title",ex.n));
  var infoBoxD=exInfoBlock(ex);
  var infoBtn=exInfoBtn(infoBoxD);infoBtn.classList.add("iconbtn");
  head.appendChild(infoBtn);
  var body=$("exdpage-body");body.innerHTML="";
  var pat=PATTERNS.find(function(p){return p.id===ex.pat;});
  var meta=[pat?pat.name:null,ex.e].filter(Boolean).join(" · ");
  if(meta)body.appendChild(el("p","note exd-meta",meta));
  body.appendChild(infoBoxD);
  var anim=exAnimBlock(ex);
  if(anim){body.appendChild(el("h2","sec","Bewegungsablauf in 3D"));body.appendChild(anim);}
  function redraw(){
    Array.prototype.slice.call(body.querySelectorAll(".exd-section")).forEach(function(n){n.remove();});
    function section(title,content){
      var h=el("h2","sec exd-section",title);body.appendChild(h);
      var c=el("div","exd-section");c.appendChild(content);body.appendChild(c);
    }
    // Bei Mobilitaetsuebungen ist die Aussage eine andere: rot heisst nicht "trainiert",
    // sondern "wird gedehnt" - bei den dynamischen "wird bewegt".
    section(ex.mob?(ex.mk==="dyn"?"Wird bewegt":"Wird gedehnt"):"Beanspruchte Muskeln",exDetailInfo(ex));
    var plus=exDetailPlus(ex);
    if(plus)section("Stärkt zusätzlich",plus);
    section("Verlauf",exDetailHistory(ex,redraw));
    section("Fortschritt",exDetailProgress(ex));
    section("Rekorde",exDetailRecords(ex));
    Array.prototype.forEach.call(body.querySelectorAll("svg[data-ex]"),fillExFig);
  }
  redraw();
  var edit=el("button","btn ghost block","Übung bearbeiten");edit.style.marginTop="18px";
  edit.onclick=function(){sheetEditExercise(ex,function(e2){sheetExerciseDetail(e2);});};
  body.appendChild(edit);
  if(ex.custom){
    var del=el("button","btn ghost block","Übung löschen");del.style.marginTop="8px";
    del.onclick=function(){
      if(customExInUse(ex.id)){toast("Schon verwendet – kann nicht gelöscht werden");return;}
      askConfirm("Übung löschen?","„"+ex.n+"“ wird aus deinem Übungskatalog entfernt.","Löschen",function(){removeCustomExercise(ex.id);closeExPage();openExerciseCatalog();},true);
    };
    body.appendChild(del);
  }
  if(!kamVonListe){
    // Kam man aus einer Auswahl, fuehrt "Zurueck" oben schon dorthin - dann waere ein
    // zweiter Knopf mit demselben Ziel nur verwirrend.
    var toList=el("button","btn ghost block","Zur Liste");toList.style.marginTop="8px";
    toList.onclick=function(){closeExPage();openExerciseCatalog();};
    body.appendChild(toList);
  }
  page.querySelector(".exdpage-scroll").scrollTop=0;
}

// Einen einzelnen bereits geloggten Satz (auch aus vergangenen Trainingstagen) nachträglich
// bearbeiten oder löschen – direkt aus dem Verlauf der Übungsdetailseite heraus.
function sheetEditLoggedSet(ex,date,setIdx,onChange){
  openSheet(function(b){
    sheetTitle(b,"Satz bearbeiten");
    b.appendChild(el("p","note",deDate(date)));
    var s=(state.days[date]||{}).sets&&state.days[date].sets[setIdx];
    if(!s){closeSheet();return;}
    var grid=el("div","grid2");grid.style.marginTop="10px";
    var kgF=null;
    if(ex.t==="load"){kgF=numField("Gewicht (kg)",s.kg,"2.5",0);grid.appendChild(kgF);}
    var unitLab=ex.t==="sec"?"Sekunden":"Wiederholungen";
    var repF=null,repLF=null,repRF=null;
    if(ex.uni){
      repLF=numField(unitLab+" links",s.repsL!=null?s.repsL:s.reps,"1",0);
      repRF=numField(unitLab+" rechts",s.repsR!=null?s.repsR:s.reps,"1",0);
      grid.appendChild(repLF);grid.appendChild(repRF);
    } else {
      repF=numField(unitLab,s.reps,"1",0);
      grid.appendChild(repF);
    }
    b.appendChild(grid);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var reps=ex.uni?Math.min(parseInt(repLF.input.value,10)||0,parseInt(repRF.input.value,10)||0):(parseInt(repF.input.value,10)||0);
      if(reps<=0)return;
      s.kg=kgF?(parseFloat(kgF.input.value)||0):0;
      s.reps=reps;
      if(ex.uni){s.repsL=parseInt(repLF.input.value,10)||0;s.repsR=parseInt(repRF.input.value,10)||0;}
      touch(date);saveLocal();closeSheet();renderAll();onChange();
    };
    b.appendChild(save);
    var del=el("button","btn ghost block","Satz löschen");del.style.marginTop="8px";
    del.onclick=function(){
      askConfirm("Satz löschen?","Dieser Satz vom "+deDate(date)+" wird entfernt.","Löschen",function(){
        state.days[date].sets.splice(setIdx,1);touch(date);saveLocal();closeSheet();renderAll();onChange();
      },true);
    };
    b.appendChild(del);
    var cancel=el("button","btn ghost block","Abbrechen");cancel.style.marginTop="8px";
    cancel.onclick=closeSheet;
    b.appendChild(cancel);
  });
}

function sheetAddSet(preEx){
  openSheet(function(b){
    if(!preEx){
      sheetTitle(b,"Übung wählen");
      exPicker(b,null,function(e){closeSheet();setTimeout(function(){sheetAddSet(e);},180);});
      return;
    }
    var ex=preEx;
    var infoBoxA=exInfoBlock(ex);
    sheetTitle(b,ex.n,exInfoBtn(infoBoxA));
    b.appendChild(infoBoxA);
    var last=bestFor(ex.id,TODAY,WIN_STRENGTH),lastSet=null;
    (day(TODAY).sets||[]).forEach(function(s){if(s.ex===ex.id)lastSet=s;});
    var info=el("div","calcout");b.appendChild(info);
    var kgF=null,grid=el("div","grid2");grid.style.marginTop="10px";
    if(ex.t==="load"){kgF=numField("Gewicht (kg)",lastSet?lastSet.kg:suggestedKg(ex,last.best),"2.5",0);grid.appendChild(kgF);}
    var unitLab=ex.t==="sec"?"Sekunden":"Wiederholungen";
    // Einseitig: links/rechts getrennt erfassen – Wertung/Fortschritt zählt die schwächere Seite.
    var repF=null,repLF=null,repRF=null;
    if(ex.uni){
      repLF=numField(unitLab+" links",lastSet?(lastSet.repsL!=null?lastSet.repsL:lastSet.reps):suggestedReps(ex,last.best),"1",0);
      repRF=numField(unitLab+" rechts",lastSet?(lastSet.repsR!=null?lastSet.repsR:lastSet.reps):suggestedReps(ex,last.best),"1",0);
      grid.appendChild(repLF);grid.appendChild(repRF);
    } else {
      repF=numField(unitLab,lastSet?lastSet.reps:suggestedReps(ex,last.best),"1",0);
      grid.appendChild(repF);
    }
    b.appendChild(grid);
    function curReps(){
      if(ex.uni){var l=parseInt(repLF.input.value,10)||0,r=parseInt(repRF.input.value,10)||0;return Math.min(l,r);}
      return parseInt(repF.input.value,10)||0;
    }
    function upd(){
      var kg=kgF?(parseFloat(kgF.input.value)||0):0,reps=curReps();
      if(ex.t==="load"){var v=e1rm(effectiveKg(ex,kg),reps),g=grade(ex,v);
        info.innerHTML="Geschätztes Einer-Maximum <b>"+Math.round(v*2)/2+" kg</b>"+(g?"<br>Stufe <b>"+g.name+"</b>"+(g.next?" · nächste ab "+fmtVal(g.next,ex.t):""):"");
      }else{var g2=grade(ex,reps);
        info.innerHTML="<b>"+reps+" "+unitOf(ex.t)+"</b>"+(g2?"<br>Stufe <b>"+g2.name+"</b>"+(g2.next?" · nächste ab "+fmtVal(g2.next,ex.t):""):"");}
    }
    [kgF,repF,repLF,repRF].forEach(function(f){if(f)f.input.addEventListener("input",upd);});upd();
    // Reserve vorbelegen mit dem, was beim letzten Satz derselben Uebung gewaehlt war -
    // innerhalb einer Uebung bleibt die Anstrengung meist aehnlich.
    var curRir=(lastSet&&lastSet.rir!=null)?lastSet.rir:null;
    b.appendChild(rirField(curRir,function(v){curRir=v;}));
    var save=el("button","btn primary block","Satz speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var reps=curReps();if(reps<=0)return;
      var rec={ex:ex.id,kg:kgF?(parseFloat(kgF.input.value)||0):0,reps:reps,ts:Date.now()};
      if(curRir!=null)rec.rir=curRir;
      if(ex.uni){rec.repsL=parseInt(repLF.input.value,10)||0;rec.repsR=parseInt(repRF.input.value,10)||0;}
      day(TODAY).sets.push(rec);
      touch(TODAY);closeSheet();renderAll();
    };
    b.appendChild(save);
    var again=el("button","btn ghost block","Andere Übung");again.style.marginTop="8px";
    again.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(null);},180);};
    b.appendChild(again);
  });
}

function sheetCardio(wid,presetExId){
  openSheet(function(b){
    sheetTitle(b,"Ausdauer eintragen");
    var sel=document.createElement("select");
    EX.filter(function(e){return e.t==="cardio";}).forEach(function(e){
      var o=document.createElement("option");o.value=e.id;o.textContent=e.n+" · "+e.intens;sel.appendChild(o);});
    if(presetExId)sel.value=presetExId;else if(state.profile.cardioPick)sel.value=state.profile.cardioPick;
    var f=el("div","field");f.appendChild(el("label",null,"Aktivität"));f.appendChild(sel);b.appendChild(f);
    // Dieselbe Figur + Beanspruchungsliste wie bei einer Kraftuebung (exDetailInfo) - zeigt,
    // welche Muskeln diese Ausdaueraktivitaet trainiert. Aktualisiert sich beim Wechseln der
    // Aktivitaet mit (drawMus), statt fest auf die zuerst gewaehlte Uebung stehen zu bleiben.
    var musWrap=el("div");b.appendChild(musWrap);
    function drawMus(){
      musWrap.innerHTML="";
      var ex=exById(sel.value);if(!ex)return;
      var figs=woFigs(ex);figs.classList.add("exdetail-figs");musWrap.appendChild(figs);
      musWrap.appendChild(woMus(ex,figs));
      Array.prototype.forEach.call(musWrap.querySelectorAll("svg[data-ex]"),fillExFig);
    }
    drawMus();
    var grid=el("div","grid2");grid.style.marginTop="10px";
    var minF=numField("Minuten",30,"5",0),kmF=numField("Kilometer (optional)",0,"0.5",0);
    grid.appendChild(minF);grid.appendChild(kmF);b.appendChild(grid);
    var out=el("div","calcout");b.appendChild(out);
    function upd(){
      var ex=exById(sel.value),min=parseFloat(minF.input.value)||0,f2=INTENS[(ex&&ex.intens)||"mittel"];
      out.innerHTML="Zählt als <b>"+Math.round(min*f2)+" Äquivalentminuten</b> auf dein Wochenziel von "+state.profile.goals.cardio+" min.";
    }
    sel.onchange=function(){upd();drawMus();};minF.input.addEventListener("input",upd);upd();
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var min=parseFloat(minF.input.value)||0;if(min<=0)return;
      var rec={ex:sel.value,min:min,km:parseFloat(kmF.input.value)||0};
      if(wid)rec.wid=wid;
      day(TODAY).cardio.push(rec);
      state.profile.cardioPick=sel.value;touch(TODAY);closeSheet();renderAll();
    };
    b.appendChild(save);
  });
}

function sheetNote(dateKey){
  dateKey=dateKey||TODAY;
  openSheet(function(b){
    sheetTitle(b,dateKey===TODAY?"Notiz zum Tag":"Notiz zum "+deDate(dateKey));
    var ta=document.createElement("textarea");ta.value=day(dateKey).note||"";ta.placeholder="Wie lief es? Was war schwer, was ging leicht?";
    b.appendChild(ta);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="12px";
    save.onclick=function(){day(dateKey).note=ta.value;touch(dateKey);closeSheet();renderAll();};
    b.appendChild(save);
  });
}

function sheetActions(){
  openSheet(function(b){
    sheetTitle(b,"Was willst du tun?");
    var d=day(TODAY),list=el("div");list.style.margin="0 -16px";
    function row(title,sub,fn,primary){
      var r=el("div","row tap"),m=el("div","main");
      m.appendChild(el("b",null,title));if(sub)m.appendChild(el("span",null,sub));r.appendChild(m);
      var c=el("span","chev");c.innerHTML=svgIcon(IC_CHEV);r.appendChild(c);r.onclick=fn;
      if(primary)r.style.background="color-mix(in srgb,var(--accent) 8%,var(--surface))";
      list.appendChild(r);
    }
    if(workout){row("Zurück zum laufenden Training",workout.name+" · "+fmtDur(woElapsed()),function(){closeSheet();selectTab("tab-training");window.scrollTo(0,0);},true);}
    else{
      row("Training starten","Leeres Training – Übungen fügst du unterwegs hinzu",function(){closeSheet();startWorkout(null);},true);
      var ids=Object.keys(state.routines);
      ids.forEach(function(id){var r=state.routines[id];
        row(r.name,"Aus dem Plan · "+r.items.length+" Übungen",function(){closeSheet();startWorkout(id);});});
    }
    list.appendChild(el("div","sheet-sep"));
    row("Einzelnen Satz eintragen","Ohne Training, z. B. nachgetragen",function(){closeSheet();setTimeout(function(){sheetAddSet(null);},180);});
    row("Ausdauer","Laufen, Rad, Rudern – zählt auf die Wochenminuten",function(){closeSheet();setTimeout(sheetCardio,180);});
    row(d.mobility?"Mobilität zurücknehmen":"Mobilität abhaken","Dehnen, Hüfte, Schulter für heute",function(){d.mobility=!d.mobility;touch(TODAY);closeSheet();renderAll();});
    row("Notiz","Was heute los war",function(){closeSheet();setTimeout(sheetNote,180);});
    b.appendChild(list);
  });
}


/* ================= Rendering ================= */
function renderRing(c,peak){
  var R=48,C=2*Math.PI*R,cx=60,cy=60;
  var s='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--sunken)" stroke-width="11"/>';
  // Statt eines einfarbigen Bogens: ein Segment je Bereich (Kraft/Konstanz/Abdeckung/Ausdauer/
  // Mobilität), Länge = tatsächlicher gewichteter Beitrag zum Formwert – macht auf einen Blick
  // sichtbar, woraus sich die aktuelle Form zusammensetzt, statt nur die Summe zu zeigen.
  var offset=0;
  SKILLDEF.forEach(function(sk){
    var contrib=clamp(sk.w*(c[sk.key]||0),0,100);
    if(contrib<=0.05)return;
    var len=C*contrib/100;
    s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+sk.color+'" stroke-width="11" stroke-dasharray="'+len.toFixed(1)+' '+C.toFixed(1)+'" stroke-dashoffset="'+(-offset).toFixed(1)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
    offset+=len;
  });
  if(peak>2){
    var a=(peak/100)*2*Math.PI-Math.PI/2;
    s+='<line x1="'+(cx+(R-8)*Math.cos(a)).toFixed(1)+'" y1="'+(cy+(R-8)*Math.sin(a)).toFixed(1)+'" x2="'+(cx+(R+8)*Math.cos(a)).toFixed(1)+'" y2="'+(cy+(R+8)*Math.sin(a)).toFixed(1)+'" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" opacity="0.6"/>';
  }
  $("ring").innerHTML=s;
}

/* Sprung auf einen bestimmten Tag. In die Zukunft geht es nicht - dort gibt es nichts zu
   sehen, und ein leerer Tag waere nur verwirrend. */
function gotoHeuteDate(d){
  if(d>TODAY)d=TODAY;
  if(d===heuteDate)return;
  heuteDate=d;
  renderHero(heuteDate===TODAY?lastC:compute(heuteDate),state.profile.peaks||{});
  renderWeek();renderToday();
  $("fab").hidden=(tab!=="tab-heute")||(heuteDate!==TODAY);
}

function renderWeek(){
  var box=$("weekstrip");box.innerHTML="";
  var pv=$("wkprev"),nx=$("wknext");
  if(pv&&!pv.dataset.wired){
    pv.dataset.wired="1";pv.innerHTML=svgIcon(IC_CHEVLEFT);
    pv.onclick=function(){gotoHeuteDate(shiftDays(heuteDate,-7));};
    nx.innerHTML=svgIcon(IC_CHEV);
    nx.onclick=function(){gotoHeuteDate(shiftDays(heuteDate,7));};
  }
  if(nx)nx.disabled=(shiftDays(heuteDate,7)>TODAY);
  // Der Streifen zeigt immer die Woche des gerade angezeigten Tages (heuteDate) – wischt man ein
  // paar Tage zurück in die Vorwoche, wandert der Streifen mit, statt den Tag zu verlieren.
  // Der echte Kalendertag bleibt zusätzlich per eigener Markierung erkennbar.
  var off=(parseIso(heuteDate).getDay()+6)%7;
  for(var i=0;i<7;i++){
    var d=shiftDays(heuteDate,i-off),dd=state.days[d];
    var sets=dd?(dd.sets||[]).length:0,mobd=dd&&dd.mobility,cardio=dd?(dd.cardio||[]).length:0;
    var w=el("div","wd"+(sets?" done":"")+(mobd?" mob":"")+(d===TODAY?" today":"")+(d===heuteDate?" viewing":""));
    w.appendChild(el("b",null,WD[parseIso(d).getDay()]));
    var pip=el("div","pip");pip.textContent=sets?sets:(cardio?"◷":(mobd?"·":""));
    w.appendChild(pip);
    (function(dd2,w2){
      if(dd2>TODAY){w2.style.opacity=".45";w2.style.cursor="default";return;}
      w2.onclick=function(){gotoHeuteDate(dd2);};
    })(d,w);
    box.appendChild(w);
  }
}

function renderToday(){
  // Zeigt den gerade per Wischgeste ausgewählten Tag (heuteDate), nicht zwingend den echten
  // Kalendertag. Für den echten heutigen Tag bleibt alles editierbar wie gewohnt (Satz
  // ergänzen/löschen per Icon, "Training starten" über den FAB); an einem früheren Tag gibt es
  // keinen FAB und einzelne Sätze werden – wie im Tages-Detail – per Antippen bearbeitet, damit
  // nichts aus Versehen dem falschen Tag zugeordnet wird.
  var viewingToday=(heuteDate===TODAY);
  var dateKey=heuteDate,d=day(dateKey),box=$("todaylist");box.innerHTML="";
  // Sätze, die zu einem geloggten Training gehören, werden hier NICHT mehr einzeln aufgelistet –
  // die Trainingskarte fasst sie zusammen, Details gibt's per Antippen auf der eigenen Seite.
  // Nur "lose" (ohne Training) protokollierte Sätze erscheinen weiterhin direkt in der Liste.
  var wIds={};(d.workouts||[]).forEach(function(wo){wIds[wo.id]=true;});
  var groups={},order=[];
  d.sets.forEach(function(s,i){if(s.wid&&wIds[s.wid])return;if(!groups[s.ex]){groups[s.ex]=[];order.push(s.ex);}groups[s.ex].push({s:s,i:i});});
  order.forEach(function(exid){
    var ex=exById(exid);if(!ex)return;
    var arr=groups[exid],r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,ex.n));
    if(viewingToday){
      m.appendChild(el("span",null,arr.map(function(o){return setLabel(ex,o.s);}).join("  ·  ")));
    } else {
      var line=el("div","exd-hsets");
      arr.forEach(function(o){
        var chip=el("button","exd-hset",setLabel(ex,o.s));chip.type="button";
        chip.setAttribute("aria-label","Satz bearbeiten");
        chip.onclick=function(ev){ev.stopPropagation();
          sheetEditLoggedSet(ex,dateKey,o.i,function(){setTimeout(function(){renderToday();},180);});
        };
        line.appendChild(chip);
      });
      m.appendChild(line);
    }
    r.appendChild(m);
    var best=bestFor(exid,dateKey,WIN_STRENGTH);
    var tb=Math.max.apply(null,arr.map(function(o){return setValue(ex,o.s);}));
    if(best.best!=null&&tb>=best.best-0.01)r.appendChild(el("span","pill pr","Best"));
    if(viewingToday){
      var add=el("button","iconbtn");add.setAttribute("aria-label","Satz ergänzen");add.innerHTML=svgIcon("M12 5v14M5 12h14",2);
      add.onclick=function(){sheetAddSet(ex);};r.appendChild(add);
      var del=el("button","iconbtn");del.setAttribute("aria-label","Letzten Satz löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      // Dieser Papierkorb sitzt direkt neben dem "+"-Button zum Ergänzen eines Satzes – ohne
      // Rückfrage wäre ein Vertipper hier ein echter, sofortiger Verlust eines bereits geloggten
      // Satzes (derselbe Fehler, den wir beim "− Satz"-Button im laufenden Training schon behoben
      // haben, nur hier im Tages-Log).
      del.onclick=function(){var idx=arr[arr.length-1].i;
        askConfirm("Letzten Satz löschen?",ex.n+" · "+setLabel(ex,d.sets[idx])+" wird entfernt.","Löschen",function(){
          d.sets.splice(idx,1);touch(dateKey);renderAll();
        },true);};r.appendChild(del);
    }
    box.appendChild(r);
  });
  d.cardio.forEach(function(c,i){
    var ex=exById(c.ex),r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,ex?ex.n:c.ex));m.appendChild(el("span",null,c.min+" Minuten"+(c.km?" · "+c.km+" km":"")));
    r.appendChild(m);
    if(viewingToday){
      var del=el("button","iconbtn");del.setAttribute("aria-label","Löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      del.onclick=function(){
        askConfirm("Eintrag löschen?",(ex?ex.n:c.ex)+" · "+c.min+" Minuten wird entfernt.","Löschen",function(){
          d.cardio.splice(i,1);touch(dateKey);renderAll();
        },true);};r.appendChild(del);
    }
    box.appendChild(r);
  });
  var mr=el("div","row tap"),mm=el("div","main");
  mm.appendChild(el("b",null,"Mobilität"));mm.appendChild(el("span",null,d.mobility?(viewingToday?"heute erledigt":"erledigt"):"noch offen"));
  mr.appendChild(mm);mr.appendChild(el("span","pill "+(d.mobility?"l2":"l0"),d.mobility?"✓ erledigt":"offen"));
  mr.onclick=function(){d.mobility=!d.mobility;touch(dateKey);renderAll();};box.appendChild(mr);
  (d.workouts||[]).forEach(function(wo){
    var wr=el("div","row tap"),wm=el("div","main");
    wm.appendChild(el("b",null,wo.name));wm.appendChild(el("span",null,fmtDur(wo.dur)+" · "+wo.exs+" Übungen · "+wo.sets+" Sätze"+(wo.vol?" · "+wo.vol+" kg":"")+(wo.cardioMin?" · "+wo.cardioMin+" min Ausdauer":"")));
    wr.appendChild(wm);wr.appendChild(el("span","pill l2","fertig"));
    var wdel=el("button","iconbtn");wdel.setAttribute("aria-label","Training löschen");wdel.innerHTML=svgIcon(IC_TRASH,1.6);
    wdel.onclick=function(ev){ev.stopPropagation();confirmDeleteWorkout(dateKey,wo);};wr.appendChild(wdel);
    var ch2=el("span","chev");ch2.innerHTML=svgIcon(IC_CHEV);wr.appendChild(ch2);
    wr.onclick=function(){sheetWorkoutDetail(dateKey,wo);};
    box.insertBefore(wr,box.firstChild);
  });
  // Zeigt – ganz oben in der (per Wisch ausgewählten) Tagesansicht – dieselbe Vorder-/Rückfigur
  // wie früher im separaten Tages-Detail-Sheet: alle an diesem Tag trainierten Muskeln auf einen Blick.
  var hasStrength=d.sets.some(function(s){var ex=exById(s.ex);return ex&&ex.t!=="cardio";});
  if(hasStrength){
    var figs=dayFigs(dateKey);
    box.insertBefore(figs,box.firstChild);
    Array.prototype.forEach.call(figs.querySelectorAll("svg[data-day]"),fillDayFig);
  }
  var nr=el("div","row tap"),nm=el("div","main");
  nm.appendChild(el("b",null,"Notiz"));nm.appendChild(el("span",null,(d.note||"").trim()||"noch nichts notiert"));
  nr.appendChild(nm);var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);nr.appendChild(ch);
  nr.onclick=function(){sheetNote(dateKey);};box.appendChild(nr);
  var mins=0;d.cardio.forEach(function(c){mins+=c.min||0;});
  $("todaysum").textContent=d.sets.length+" Sätze"+(mins?" · "+mins+" min":"");
  var lbl=$("todaylabel");if(lbl)lbl.textContent=viewingToday?"Heute":deDate(dateKey);
  $("fab").hidden=(tab!=="tab-heute")||!viewingToday;
}

var selFine=null,
 selSet=null,
 selLabel=null;
   // selSet: Liste von Feinmuskeln (Region/Gruppe), selFine: einzelner Muskel
var selTapKey=null;
   // merkt sich den zuletzt im 3D-Modell angetippten Mesh-Namen, fuer zuverlaessiges Ab-/Anwaehlen

/* Betonung: welche Übungen einen bestimmten Muskelanteil besonders treffen */
var EMPH={
 clavicular_head_of_pectoralis_major:["bench_inc","bench_inc_db","pushup_dec","pike_pushup"],
 sternocostal_head_of_pectoralis_major:["bench","bench_db","pushup","machine_press","fly_db","cable_fly","pushup_arch"],
 abdominal_part_of_pectoralis_major:["bench_dec","dips","dips_bench"],
 long_head_of_triceps_brachii:["tri_over","tri_skull","dips","pullover"],
 lateral_head_of_triceps_brachii:["tri_push","tri_kick","pushup_diamond"],
 medial_head_of_triceps_brachii:["bench","ohp","tri_push","pushup_diamond"],
 vastus_medialis:["squat","squat_front","legext","squat_pistol"],
 vastus_lateralis:["legpress","hacksquat","squat","squat_bulg"],
 rectus_femoris:["legext","sissy","lunge","stepup","stepup_bw"],
 long_head_of_biceps_femoris:["legcurl","nordic","deadlift_rdl"],
 semitendinosus:["deadlift_rdl","goodmorning","deadlift_sl"],
 semimembranosus:["deadlift_rdl","goodmorning","legcurl"],
 medial_head_of_gastrocnemius:["calf_stand","calf_bw","jumprope"],
 lateral_head_of_gastrocnemius:["calf_stand","calf_bw"],
 soleus:["calf_seat"],
 gluteus_maximus:["hipthrust","squat","deadlift","gluteBridge","deadlift_sumo"],
 gluteus_medius:["abduct","squat_bulg","deadlift_sl","lunge","clamshell","sidelying_raise","bandwalk_lat","stepup","stepup_bw"],
 gluteus_minimus:["clamshell","sidelying_raise","bandwalk_lat"],
 tfl:["sidelying_raise","bandwalk_lat"],
 piriformis:["clamshell"],
 rectus_abdominis:["crunch","cablecrunch","situp","abwheel","legraise","kneeraise","lsit","hollow","dragonflag","deadbug"],
 transversus_abdominis:["plank","sideplank","hollow","deadbug","pallof"],
 sternocleidomastoid:["neck_flex_bw","neck_side_bw"],
 splenius_capitis:["neck_ext_bw","neck_harness","neck_bridge","neck_curl"],
 infraspinatus:["facepull","cuban","bandpullapart","reversefly"],
 teres_major:["pullup","latpull","pullup_wide"],
 clavicular_part_of_deltoid:["ohp","ohp_db","frontraise","bench_inc"],
 flexor_carpi_radialis:["wrist_curl","farmers"],
 ulnar_head_of_flexor_carpi_ulnaris:["deadhang","farmers","ricebucket"],
 brachioradialis:["curl_hammer","row_bb","fatgripz"],
 extensor_carpi_radialis_longus:["fatgripz","wrist_curl"],
 iliacus:["hipflex_cable","legraise","kneeraise"],
 psoas_major:["hipflex_cable","legraise","kneeraise"],
 sartorius:["hipflex_cable"],
 subscapularis:["rot_internal"],
 supraspinatus:["emptycan"]
}
;

function emphasisSets(fineId,asOf){
  var list=EMPH[fineId];if(!list)return null;
  var from=shiftDays(asOf,-(WIN_BODY-1)),n=0;
  for(var d in state.days){if(d<from||d>asOf)continue;
    (state.days[d].sets||[]).forEach(function(st){if(list.indexOf(st.ex)>=0)n++;});}
  return n;
}

function zoneLabel(z){return z===0?"zu wenig":z===1?"im Korridor":"über Limit";}

function zonePill(z){return z===0?"v0":z===1?"v1":"v2";}

function fineIdsOfGroups(ids){var out=[];for(var k in FINE){var f=FINE[k];
  if(ids.indexOf(f.g)>=0||(f.g2&&f.g2.some(function(g){return ids.indexOf(g)>=0;})))out.push(k);}
  return out;}

/* Verlauf der Auswahl, damit man aus einer Detailebene wieder herauskommt. Gespeichert wird
   der komplette Auswahlzustand, nicht nur ein Name - sonst laesst er sich nicht exakt
   wiederherstellen. Einstiegspunkte (Chip, Regionszeile, Tippen auf die Figur) leeren den
   Verlauf: von dort beginnt ein neuer Weg. */
var selHistory=[];

/* Welche Gruppe / welcher Feinmuskel im Detailkasten aufgeklappt ist. Getrennt von der
   eigentlichen Auswahl, damit die Liste stehen bleibt - die Figur zeigt trotzdem die
   tiefste offene Ebene, sonst wuerde das Aufklappen am Modell nichts bewirken. */
var expGroup=null,
 expFine=null;

function effFine(){return expFine||selFine;}

function effSet(){
  if(expFine)return [expFine];
  if(expGroup&&selSet)return selSet.filter(function(k){return FINE[k]&&FINE[k].g===expGroup;});
  return selSet;
}

function selSnapshot(){return {f:selFine,s:selSet,l:selLabel,m:selMuscle,t:selTapKey};}

function selPush(){selHistory.push(selSnapshot());if(selHistory.length>16)selHistory.shift();}

function selReset(){selHistory=[];expGroup=null;expFine=null;}

function selNameOf(x){
  if(x.f&&FINE[x.f])return FINE[x.f].la;
  return x.l||"Übersicht";
}

function renderBodySel(){
  if(!lastC)return;
  renderBody(lastC.ms);
}

function selBack(){
  if(!selHistory.length)return;
  var x=selHistory.pop();
  selFine=x.f;selSet=x.s;selLabel=x.l;selMuscle=x.m;selTapKey=x.t;
  renderBodySel();
}

function backBar(){
  if(!selHistory.length)return null;
  var b=el("button","backbar");b.type="button";
  b.innerHTML=svgIcon(IC_CHEVLEFT);
  b.appendChild(el("span",null,selNameOf(selHistory[selHistory.length-1])));
  b.onclick=function(ev){ev.stopPropagation();selBack();};
  return b;
}

function selectRegion(rg){selFine=null;selSet=fineIdsOfGroups(rg.ids);selLabel=rg.name;selMuscle=rg.ids[0];selTapKey=null;}

function selectGroup(m){selFine=null;selSet=fineIdsOfGroups([m.id]);selLabel=m.name;selMuscle=m.id;selTapKey=null;}

function isSel(f){return selFine===f||(selSet&&selSet.indexOf(f)>=0);}


// Zeigt in der Legende, wo der ausgewaehlte Muskel aktuell auf der Skala steht.
function updateVolLegend(ms){
  var selFine=effFine(),selSet=effSet();   // lokale Sicht auf die offene Ebene
  var pins=$("vlpins"),lab=$("vlsel");
  if(!pins||!lab)return;
  pins.innerHTML="";lab.innerHTML="";lab.hidden=true;
  var ids=[];
  if(selFine&&FINE[selFine])ids=[FINE[selFine].g];
  else if(selSet)selSet.forEach(function(k){var g=FINE[k]&&FINE[k].g;if(g&&ids.indexOf(g)<0)ids.push(g);});
  if(!ids.length)return;
  var pos=[],reiz=[];
  ids.forEach(function(id){
    var m=muscleById(id);if(!m)return;
    pos.push(clamp(volLegendPos(ms[id]||0,m),0,100));
    reiz.push(reizOf(ms[id]||0,m));
  });
  if(!pos.length)return;
  var single=pos.length===1,text,mark;
  if(single){
    var m1=muscleById(ids[0]),v1=Math.round((ms[ids[0]]||0)*10)/10;
    mark=pos[0];text=reizPct(v1,m1)+" % · "+v1+" Sätze";
  }else{
    var sum=0;pos.forEach(function(p){sum+=p;});
    mark=sum/pos.length;
    var rs=0;reiz.forEach(function(r){rs+=r;});
    text="Ø "+Math.round(rs/reiz.length*100)+" % · "+pos.length+" Gruppen";
  }
  var i=el("i");i.style.left=clamp(mark,0,100)+"%";pins.appendChild(i);
  var s=el("span",null,text);
  if(mark<16){s.style.left="0";s.style.transform="none";}
  else if(mark>84){s.style.left="auto";s.style.right="0";s.style.transform="none";}
  else s.style.left=mark+"%";
  lab.appendChild(s);lab.hidden=false;
}

function placeCallout(ms){
  var co=$("callout");
  var selFine=effFine(),selSet=effSet();   // lokale Sicht auf die offene Ebene
  if(!selFine&&!selSet){co.innerHTML='<span class="co-hint">Tipp einen Muskel an – oder wähl oben eine Region.</span>';return;}
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

/* ---------- Körperfigur: Illustration + Muskelmasken ----------
   Die Masken der Illustration sind gröber als unser Datenmodell (21 Muskeln).
   Hier wird jede Maske auf die Muskeln abgebildet, die sie tatsächlich zeigt.
   Erster Eintrag = Hauptmuskel der Fläche.                                     */
var MASKMAP={
  pectoralis:["tg_brust_mitte","tg_brust_ober","tg_brust_unten"], rectus_abdominis:["tg_bauch_gerade"], obliques:["tg_bauch_schraeg"],
  deltoids:["tg_schulter_vorn","tg_schulter_seit"], biceps:["tg_bizeps"], forearms:["tg_unterarm_beug","tg_unterarm_streck"],
  trapezius:["tg_rueck_trapez","tg_rueck_rhomb"], neck_front:["tg_nacken"],
  quadriceps:["tg_quadrizeps","tg_adduktoren"], calves:["tg_wade_gastro","tg_wade_soleus"], tibialis_front:["tg_wade_fussheber"],
  calves_back:["tg_wade_gastro","tg_wade_soleus"], hamstrings:["tg_kniesehnen"], glutes:["tg_gesaess_haupt","tg_gesaess_med","tg_gesaess_min"],
  lower_back:["tg_rueck_strecker"], obliques_back:["tg_bauch_schraeg"], lats:["tg_rueck_lat","tg_brust_serratus","tg_schulter_rot"],
  upper_back:["tg_rueck_trapez","tg_rueck_rhomb","tg_nacken"],
  deltoids_back:["tg_schulter_hint","tg_schulter_seit"], triceps:["tg_trizeps_lang","tg_trizeps_lat"], forearms_back:["tg_unterarm_streck"]
}
;

function figSex(){return (state.profile&&state.profile.sex==="w")?"female":"male";}

function maskGroups(id){return MASKMAP[id.replace(/_female$/,"")]||[];}

function maskLabel(id){return maskGroups(id).map(function(g){var m=muscleById(g);return m?m.name:g;}).join(" & ");}

function masksFor(view){var sx=figSex();
  return FIGMASKS.filter(function(m){return m.g===sx&&m.v===view;});}

// Manche Flächen der Illustration fassen mehrere, einzeln trainierbare Muskeln zusammen
// (z. B. ein Brust-Umriss für alle drei Anteile, ein Schulter-Umriss für vorderen/seitlichen/
// hinteren Kopf). Für eine bessere Unterscheidbarkeit teilen wir genau diese Flächen anhand
// ihrer tatsächlich gerenderten Geometrie in einzeln antippbare, eigenständig eingefärbte
// Teilflächen auf – jede referenziert einen echten Feinmuskel aus FINE.
// Grenzfasern der Brust, aus der Illustration abgenommen: [u,v] mit u = 0 Achsel … 1
// Brustbein, v = 0 oben … 1 unten (Anteile der Muskelfläche).
var PEC_LINE_TOP=[[0.0, 0.502], [0.025, 0.483], [0.05, 0.465], [0.075, 0.449], [0.1, 0.433], [0.125, 0.417], [0.15, 0.403], [0.175, 0.389], [0.2, 0.376], [0.225, 0.363], [0.25, 0.351], [0.275, 0.34], [0.3, 0.329], [0.325, 0.318], [0.35, 0.309], [0.375, 0.299], [0.4, 0.29], [0.425, 0.281], [0.45, 0.273], [0.475, 0.265], [0.5, 0.258], [0.525, 0.251], [0.55, 0.245], [0.575, 0.238], [0.6, 0.233], [0.625, 0.227], [0.65, 0.222], [0.675, 0.218], [0.7, 0.213], [0.725, 0.21], [0.75, 0.206], [0.775, 0.204], [0.8, 0.201], [0.825, 0.199], [0.85, 0.198], [0.875, 0.197], [0.9, 0.197], [0.925, 0.198], [0.95, 0.199], [0.975, 0.201], [1.0, 0.203]];
  // obere ↔ mittlere Brust
var PEC_LINE_BOT=[[0.0, 0.564], [0.025, 0.57], [0.05, 0.575], [0.075, 0.58], [0.1, 0.584], [0.125, 0.587], [0.15, 0.59], [0.175, 0.592], [0.2, 0.594], [0.225, 0.596], [0.25, 0.597], [0.275, 0.599], [0.3, 0.6], [0.325, 0.602], [0.35, 0.603], [0.375, 0.605], [0.4, 0.606], [0.425, 0.608], [0.45, 0.61], [0.475, 0.613], [0.5, 0.615], [0.525, 0.618], [0.55, 0.621], [0.575, 0.625], [0.6, 0.628], [0.625, 0.632], [0.65, 0.637], [0.675, 0.641], [0.7, 0.646], [0.725, 0.651], [0.75, 0.656], [0.775, 0.661], [0.8, 0.667], [0.825, 0.672], [0.85, 0.677], [0.875, 0.683], [0.9, 0.688], [0.925, 0.693], [0.95, 0.697], [0.975, 0.702], [1.0, 0.706]];
  // mittlere ↔ untere Brust
// Umriss des vorderen Sägemuskels (Achsel-/Flankenbereich direkt unter dem Brustmuskel-Ansatz):
// vom Nutzer anhand eines Referenzfotos (Punktmarkierung auf dem Rohbild) exakt nachgezeichnet.
// Die Fläche reicht oben ÜBER die eigentliche Obliquus-Maskenkontur hinaus (ein bislang
// unmaskierter Keil direkt unter dem Brustmuskel, der anatomisch schon zum Sägemuskel gehört),
// deshalb kein einfacher Schnitt der Obliquus-Fläche (wie zuvor SERRATUS_LINE) mehr, sondern ein
// eigenständiges, absolut positioniertes Polygon (wie bei Bizeps/Unterarm mit "polyabs") – die drei
// sichtbaren "Zacken" (Zähne der Verzahnung) plus der Keil bilden zusammen eine einzige
// zusammenhängende Fläche. Koordinaten: lokales Blob-Koordinatensystem der Obliquus-Maske (gleiche
// Basis wie deren "d", vor ox/oy), rechte Körperseite; wird per "axis" auf die linke gespiegelt.
var SERRATUS_POLY=[[55.21,92.54],[53.19,96.98],[53.69,103.73],[52.17,104.03],[52.78,104.63],[53.49,112.39],[57.24,123.18],[60.89,128.52],[62.61,133.05],[63.53,133.46],[64.84,130.43],[66.87,130.23],[67.5,121.46],[67.38,120.56],[67.58,118.74],[68.3,114.41],[68.1,112.8],[67.9,110.78],[67.6,106.35],[67.4,104.13],[70.83,102.01],[66.57,101.21],[62.01,99.29],[58.66,95.36],[56.53,95.26],[56.63,93.65]];

var SERRATUS_POLY_AXIS=105.44;

// Rechte Körperseite (Bildrechts): an dieser Stelle schließt die einfache Spiegelung der linken
// Kontur die Lücke zum oberen Bauchmuskel-Segment nicht ganz so sauber – auf Nutzerwunsch hier
// eigenständig (nicht nur gespiegelt) mit etwas mehr Überlappung Richtung Rippenbogen nachgezogen.
// Werte bereits in der gespiegelten (Bildrechts-)Koordinate, nicht nochmal automatisch gespiegelt.
var SERRATUS_POLY_R=SERRATUS_POLY.map(function(p){return [2*SERRATUS_POLY_AXIS-p[0],p[1]];});

(function(){
  var adj={17:142.68,18:142.88,19:142.88,21:142.38};
  Object.keys(adj).forEach(function(i){SERRATUS_POLY_R[+i][0]=adj[i];});
})();

// Grenze seitliche ↔ vordere/hintere Schulter: die Faserrille der Illustration, die der
// markierten Linie am nächsten liegt (verläuft zwischen zwei Faserbündeln, kreuzt keine Faser).
// [v,u] mit v = 0 oben … 1 unten, u = 0 Außenkante (Arm) … 1 Innenkante (Rumpf).
var DELT_LINE_FRONT=[[0.054,0.466],[0.077,0.449],[0.101,0.421],[0.125,0.392],[0.149,0.367],[0.172,0.343],[0.196,0.32],[0.22,0.299],[0.244,0.281],[0.267,0.264],[0.291,0.248],[0.315,0.232],[0.339,0.219],[0.362,0.206],[0.386,0.195],[0.41,0.184],[0.434,0.175],[0.458,0.166],[0.481,0.156],[0.505,0.145],[0.529,0.136],[0.553,0.13],[0.576,0.124],[0.6,0.118],[0.624,0.112],[0.648,0.107],[0.671,0.104],[0.695,0.101],[0.719,0.095],[0.743,0.091],[0.766,0.091],[0.79,0.091],[0.814,0.091],[0.838,0.091],[0.861,0.09],[0.885,0.086]];

var DELT_LINE_BACK=[[0.028,0.574],[0.055,0.549],[0.081,0.507],[0.107,0.467],[0.133,0.431],[0.16,0.399],[0.186,0.371],[0.212,0.348],[0.238,0.326],[0.265,0.303],[0.291,0.285],[0.317,0.269],[0.343,0.251],[0.37,0.235],[0.396,0.221],[0.422,0.207],[0.448,0.195],[0.475,0.185],[0.501,0.175],[0.527,0.166],[0.554,0.159],[0.58,0.153],[0.606,0.146],[0.632,0.138],[0.659,0.133],[0.685,0.13],[0.711,0.129],[0.737,0.127],[0.764,0.121],[0.79,0.116],[0.816,0.113],[0.842,0.108]];

// Schulterblatt (Rückansicht), vom Nutzer auf der Figur eingezeichnet und aus dem Bild
// übernommen: Flächen in Koordinaten der Lat-Fläche, u = 0 Achsel … 1 Wirbelsäule,
// v = 0 oben … 1 unten. Gilt gespiegelt für beide Körperseiten.
var SCAP_INFRA=[[0.393,0.002],[0.423,0.006],[0.446,0.015],[0.466,0.021],[0.547,0.073],[0.625,0.174],[0.643,0.198],[0.657,0.22],[0.671,0.243],[0.672,0.26],[0.664,0.279],[0.657,0.298],[0.651,0.315],[0.644,0.334],[0.64,0.348],[0.632,0.356],[0.618,0.357],[0.601,0.357],[0.353,0.2],[0.21,0.083],[0.205,0.074],[0.301,0.025],[0.321,0.015],[0.34,0.009],[0.361,0.005],[0.382,0.003]];
   // Untergrätenmuskel
var SCAP_TMIN=[[0.09,0.124],[0.176,0.09],[0.26,0.151],[0.283,0.17],[0.269,0.175]];
     // kleiner Rundmuskel
// Der Umriss der "lats"-Maske besteht oben aus einem eigenen, separat gezeichneten Teilpfad (neben
// dem großen Lat-Dreieck) – er deckt Untergräten- und kleinen Rundmuskel ab, reicht aber medial
// (zur Wirbelsäule hin) noch etwas über SCAP_INFRA/SCAP_TMIN hinaus: ein schmaler Zwickel direkt an
// der Nahtlinie zum Trapezius, der zu keinem der beiden Muskeln gehört. Direkt aus diesem Teilpfad
// übernommen (nicht neu geschätzt), damit die Kontur exakt passt. Per "exclude" aus der Lat-Restfläche
// herausgeschnitten, ohne einem Muskel zugeordnet zu sein – sichtbares Ergebnis: an dieser Stelle
// bleibt die Grundzeichnung ungefärbt statt fälschlich als Lat-Fläche eingefärbt zu werden.
var LATS_UPPER_SHAPE=[[0.584,0.357],[0.6,0.356],[0.353,0.2],[0.21,0.083],[0.205,0.074],[0.199,0.077],[0.146,0.1],[0.1,0.12],[0.176,0.09],[0.26,0.151],[0.283,0.17],[0.269,0.175],[0.091,0.124],[0.084,0.127],[0.057,0.139],[0.238,0.182],[0.301,0.2],[0.367,0.23],[0.471,0.289],[0.56,0.357]];

var SCAP_TMAJ=[[-0.001,0.174],[0.01,0.204],[0.054,0.26],[0.125,0.294],[0.167,0.309],[0.226,0.326],[0.317,0.342],[0.447,0.354],[0.56,0.357],[0.471,0.289],[0.367,0.23],[0.301,0.2],[0.238,0.182],[0.048,0.137],[0.006,0.155]];
         // großer Rundmuskel
// Unterarm vorn: der Oberarmspeichenmuskel ist hier nicht als eigener Umriss gezeichnet (anders
// als am Rücken, siehe "bysize" unten). Die Außenkante folgt der Speichenseiten-Kontur der Maske,
// die Innenkante der in der Illustration selbst durchgezeichneten Furche zwischen der radialen
// Muskelsäule und der Beugergruppe – aus einem hochskalierten Rendering abgemessen (Helligkeits-
// profil quer über den Unterarm bei vielen Höhen, wobei die Silhouettenkanten selbst ausgenommen
// wurden, sonst misst man die Armkontur statt der Furche). Zum Handgelenk hin läuft der Streifen
// spitz aus, weil der Muskelbauch dort in die Sehne übergeht. Wie beim Brachialis liegt die
// Kontur vollständig innerhalb BEIDER Arm-Silhouetten der jeweiligen Figur, damit beide Seiten
// exakt gleich aussehen und nicht je Seite anders von der Maskenkante beschnitten werden.
var BRACHIORAD_FRONT=[[11.172,115.624],[9.139,119.328],[7.419,123.033],[5.82,126.737],[4.725,130.441],[3.982,134.145],[3.394,137.849],[2.958,141.553],[2.633,145.258],[2.014,156.37],[1.019,163.779],[-0.263,171.187],[3.475,171.187],[5.433,167.483],[7.726,163.779],[9.578,160.074],[14.341,148.962],[15.84,145.258],[18.61,137.849],[19.844,134.145],[20.074,130.441],[20.603,126.737],[20.527,123.55],[19.465,120.316],[18.775,117.713],[17.971,112.157],[17.825,111.92],[13.527,111.92]];

var BRACHIORAD_FRONT_F=[[32.405,118.27],[30.394,121.445],[28.838,124.62],[27.514,127.795],[26.402,130.97],[25.481,134.145],[24.629,137.32],[23.265,143.67],[21.825,153.195],[20.644,159.545],[18.908,165.895],[17.719,169.599],[20.973,169.599],[21.132,169.07],[22.578,165.895],[24.219,162.72],[25.912,159.545],[27.941,156.37],[29.387,153.195],[36.178,137.32],[37.025,134.145],[37.554,130.97],[38.207,127.795],[37.589,124.62],[37.06,118.27],[36.46,115.095],[34.974,115.095]];
