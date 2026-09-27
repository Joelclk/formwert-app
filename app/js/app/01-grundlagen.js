/* ==========================================================
   app/01-grundlagen.js - Gewichtung des Formwerts, Hilfsfunktionen (Datum, Formatierung, DOM), Uebungs-Info, App-Zustand
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Gewichte ================= */
var W={kraft:0.30, konst:0.25, deckung:0.20, ausdauer:0.15, mob:0.10};
var WIN_STATE=30, WIN_STRENGTH=90, WIN_BODY=7;
var CORE_MUSCLES=["tg_brust_ober","tg_brust_mitte","tg_brust_unten","tg_rueck_lat","tg_rueck_rhomb","tg_rueck_trapez_mit","tg_schulter_seit","tg_schulter_hint","tg_bizeps","tg_trizeps_lat","tg_bauch_gerade","tg_gesaess_haupt","tg_quadrizeps","tg_kniesehnen","tg_wade_gastro"];
var SKILLDEF=[
 {key:"kraft",   name:"Maximalkraft",    color:"var(--red)",    w:W.kraft},
 {key:"konst",   name:"Konstanz",        color:"var(--blue)",   w:W.konst},
 {key:"deckung", name:"Muskelabdeckung", color:"var(--violet)", w:W.deckung},
 {key:"ausdauer",name:"Ausdauer",        color:"var(--yellow)", w:W.ausdauer},
 {key:"mob",     name:"Mobilität",       color:"var(--green)",  w:W.mob}
];
var INTENS={leicht:0.5, mittel:1, hoch:2};

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
};
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
      : ex.wt==="body"
      ? "Zusatzgewicht ist optional: Trag nur das zusätzliche Gewicht ein (Gürtel, Kurzhantel o. Ä.) – ohne Zusatzgewicht einfach 0 lassen. Dein Körpergewicht wird für Bestwert und Kraftstufe automatisch mit eingerechnet."
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
function exInfoBlock(ex,noAnim){
  var box=el("div","ex-info");box.hidden=true;
  if(!noAnim&&FW_ANIM_CLIP[ex.id]){
    // Wird erst beim ersten Aufklappen (siehe exInfoBtn) tatsaechlich befuellt -
    // sonst laedt jede Uebung im Trainings-Pager sofort ihre eigene 3D-Szene mit.
    var animSlot=el("div");box.appendChild(animSlot);
    box._exAnimLoad=function(){
      if(box._exAnimLoaded)return;box._exAnimLoaded=true;
      var anim=exAnimBlock(ex);if(anim)animSlot.appendChild(anim);
    };
  }else if(ex.poseImgs&&ex.poseImgs.length){
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
  btn.onclick=function(ev){if(ev)ev.stopPropagation();box.hidden=!box.hidden;if(!box.hidden&&box._exAnimLoad)box._exAnimLoad();};
  return btn;
}

/* ---- 1RM: drei Formeln, jede in ihrem validierten Bereich, weich gemischt ----
   capR begrenzt, bis zu welcher Wiederholungszahl noch geglättet/hochgerechnet wird - Standard
   15 (unveraendert fuer alle Langhantel-/Maschinen-Uebungen). Koerpergewichts-Uebungen mit
   optionalem Zusatzgewicht (wt:"body": Klimmzuege, Dips) erreichen im unbelasteten Bereich
   deutlich hoehere, durchaus reale Wiederholungszahlen (Elite-Werte laut Strength Level: 29
   Klimmzuege, 42 Dips) - mit dem alten Deckel bei 15 waeren solche Saetze nicht von einem Satz
   mit nur 15 Wdh. zu unterscheiden gewesen, obwohl die Rangleiter-Anker selbst aus ungedeckelten
   Perzentil-Daten stammen. Ein hoeherer Deckel nur fuer diese Uebungen behebt das, ohne
   bestehende Gewichts-Uebungen zu beruehren (deren Aufrufe lassen capR weg -> weiterhin 15).
   Rechnerisch unbedenklich: ab r>~17 sind we/wb/ww ohnehin schon 0 (die Epley-/Brzycki-Anteile
   fallen laengst raus), die Funktion läuft dann automatisch rein auf die Wathen-Formel hinaus,
   die auch bei sehr hohen Wiederholungszahlen glatt bleibt (keine Division durch 0 möglich,
   da s<=0 vorher abfängt). */
function e1rm(kg,reps,capR){
  var r=(reps||0);
  if(kg<=0)return 0;
  if(r<=1)return kg;
  var cap=capR||15;
  if(r>cap)r=cap;
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
// Bei wt:"body" (Klimmzüge, Dips) ist das eingetragene Gewicht nur das ZUSÄTZLICHE Gewicht -
// die tatsächlich bewegte Last ist das eigene Körpergewicht plus dieses Zusatzgewicht (auch bei
// 0 kg Zusatzgewicht, also reinen Körpergewichts-Sätzen). Ohne Profil/Körpergewicht (sollte nach
// Einrichtung nicht vorkommen) wird mit 80 kg als Rückfallwert gerechnet.
function effectiveKg(ex,kg){
  if(ex.wt==="side")return (kg||0)*2;
  if(ex.wt==="body"){var bw=(state.profile&&state.profile.bodyweight)||80;return bw+(kg||0);}
  return (kg||0);
}
// Kehrt effectiveKg um: aus einem Gesamtwert (z. B. dem gespeicherten Bestwert/e1RM, der bei
// "pro Seite" schon verdoppelt ist) wieder das einzutragende Einzel-/Rohgewicht schätzen.
// Bei wt:"body" wird das Körpergewicht wieder abgezogen, damit das Ergebnis (wie beim Eintragen)
// nur das Zusatzgewicht ist.
function rawKg(ex,effKg){
  if(ex.wt==="side")return (effKg||0)/2;
  if(ex.wt==="body"){var bw=(state.profile&&state.profile.bodyweight)||80;return (effKg||0)-bw;}
  return (effKg||0);
}
// Vorschlag fürs Eintragen eines neuen Satzes: ~80 % des zuletzt erreichten Bestwerts, auf
// 2,5 kg gerundet. Der Bestwert ist immer die Gesamtlast (e1RM) – bei "pro Seite" muss der
// Vorschlag also erst zurückgerechnet werden, sonst wäre er doppelt so schwer wie beabsichtigt.
// Bei wt:"body" ohne bisherigen Bestwert ist 0 (kein Zusatzgewicht) der richtige Start - anders
// als bei echten Gewichts-Übungen, wo 20 kg ein sinnvoller erster Vorschlag ist, wäre "20 kg
// Zusatzgewicht" für den allerersten geloggten Klimmzug/Dip fast immer zu viel.
function suggestedKg(ex,bestVal){
  if(ex.wt==="body")return bestVal?Math.max(0,Math.round(rawKg(ex,bestVal)*0.8/2.5)*2.5):0;
  return bestVal?Math.round(rawKg(ex,bestVal)*0.8/2.5)*2.5:20;
}
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
  if(ex.t==="load")return e1rm(effectiveKg(ex,s.kg),s.reps||1,ex.wt==="body"?40:15);
  return (s.reps||0);
}
// Lesbare Kurzform eines geloggten Satzes für Listen (Heute, Verlauf, "Vorher"-Spalte im
// Training). Bei einseitigen Übungen wird links/rechts getrennt angezeigt, sofern erfasst.
// Bei wt:"body" ohne Zusatzgewicht (kg 0/leer) wirkt "0×8" wie "mit 0 kg", dabei wurde ja das
// volle Körpergewicht bewegt - dort stattdessen nur die Wdh. zeigen; mit Zusatzgewicht ein "+"
// davor, damit klar bleibt: das ist nur das Zusätzliche, nicht die Gesamtlast.
function setLabel(ex,s){
  var uniPart=(ex.uni&&s.repsL!=null&&s.repsR!=null)?(s.repsL+"/"+s.repsR+(ex.t==="sec"?" s":" Wdh")):null;
  if(ex.t==="load"){
    if(ex.wt==="body"&&!s.kg)return uniPart||(s.reps+" Wdh");
    return (ex.wt==="body"?"+":"")+s.kg+"×"+(uniPart||s.reps);
  }
  return uniPart||(s.reps+(ex.t==="sec"?" s":" Wdh"));
}

/* ================= State ================= */
var TODAY=iso(new Date());
var state={profile:null,days:{},routines:{},dirty:{},dirtyRoutines:{},customEx:[],exOverrides:{}};
var session=null, db=null, selMuscle=null, tab="tab-heute";
// Der Tag, der gerade im "Heute"-Tab angezeigt wird (per Wischgeste änderbar) – getrennt von
// TODAY (dem echten Kalendertag), damit ein Blick auf einen früheren Tag nicht versehentlich
// die an TODAY hängende Bestwert-/Peak-Logik verfälscht.
var heuteDate=TODAY;
var LSK="formwert-v3";
var CLOUD_REPLACE_KEY="formwert-cloud-replace-pending";

function cloudReplacePending(){try{return localStorage.getItem(CLOUD_REPLACE_KEY)==="1";}catch(e){return false;}}

function markCloudReplacePending(on){try{
  if(on)localStorage.setItem(CLOUD_REPLACE_KEY,"1");else localStorage.removeItem(CLOUD_REPLACE_KEY);
}catch(e){warnSaveFailed();}}

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
    // Ältere Fassungen des Formulars haben bei Ausdauer-Übungen Art und Bewegungsmuster leer
    // gespeichert. Leer ist nie gewollt – dann gilt wieder das Original.
    if(!merged.t)merged.t=base.t;
    if(!merged.pat)merged.pat=base.pat;
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
/* Lokales Speichern, aufgeteilt nach Monaten:
   formwert-v3            -> Profil, Einheiten, eigene/angepasste Uebungen (klein)
   formwert-v3-m-JJJJ-MM  -> die Trainingstage eines Monats
   Frueher stand alles in einem Schluessel und wurde bei jeder Aenderung komplett neu
   geschrieben - nach drei Jahren rund 1 MB pro Speichern. Jetzt wird nur der Monat
   geschrieben, der sich geaendert hat. Das alte Format wird weiterhin gelesen und beim
   ersten Speichern automatisch umgestellt. */
var LSK_M=LSK+"-m-";
var lsMonthStr={},lsMetaStr=null,lsHot={},lsLastFull=0,lsDaysRef=null;
function loadLocalMonths(days){
  var keys=[];
  try{for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(LSK_M)===0)keys.push(k);}}catch(e){return;}
  keys.forEach(function(k){
    var raw=localStorage.getItem(k),m=k.slice(LSK_M.length);
    try{var o=JSON.parse(raw);Object.keys(o).forEach(function(d){days[d]=o[d];});lsMonthStr[m]=raw;}
    catch(e){try{localStorage.setItem(k+"-defekt-"+Date.now(),raw);}catch(e2){}}
  });
}
function loadLocal(){try{var r=localStorage.getItem(LSK)||localStorage.getItem("formwert-v2");
  if(r){var o=JSON.parse(r);if(o&&o.profile){state.profile=o.profile;state.days=o.days||{};state.routines=o.routines||{};state.customEx=o.customEx||[];state.exOverrides=o.exOverrides||{};
    loadLocalMonths(state.days);
    if(!o.days&&localStorage.getItem(LSK))lsMetaStr=r;
    lsDaysRef=state.days;}}}
  catch(e){
    // Nicht lesbarer Speicherstand: Rohdaten beiseitelegen, bevor sie beim naechsten
    // Speichern ueberschrieben werden - sonst waeren sie endgueltig weg.
    try{var raw=localStorage.getItem(LSK);if(raw)localStorage.setItem(LSK+"-defekt-"+Date.now(),raw);}catch(e2){}
    setTimeout(function(){try{toast("Lokaler Speicherstand war beschädigt – eine Kopie wurde gesichert");}catch(e3){}},1500);
  }
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
function localTouchDay(d){lsHot[String(d).slice(0,7)]=1;}
function saveLocal(full){try{
  // Voller Abgleich aller Monate: beim ersten Speichern, nach einem kompletten Austausch der
  // Tage (Backup), spaetestens jede Minute und beim Verlassen der Seite. Dazwischen nur die
  // Monate, in denen gerade etwas geaendert wurde, plus der aktuelle Monat.
  full=full||!lsLastFull||state.days!==lsDaysRef||Date.now()-lsLastFull>60000;
  var months={},k,m;
  if(full){for(k in state.days)months[k.slice(0,7)]=1;for(m in lsMonthStr)months[m]=1;}
  else{for(m in lsHot)months[m]=1;months[TODAY.slice(0,7)]=1;}
  for(m in months){
    var o={},any=false;
    for(k in state.days)if(k.slice(0,7)===m){o[k]=state.days[k];any=true;}
    if(!any){if(lsMonthStr[m]!=null){localStorage.removeItem(LSK_M+m);delete lsMonthStr[m];}continue;}
    var str=JSON.stringify(o);
    if(str!==lsMonthStr[m]){localStorage.setItem(LSK_M+m,str);lsMonthStr[m]=str;}
  }
  // Erst wenn alle Monate sicher geschrieben sind, den Hauptschluessel (ohne Tage) ersetzen -
  // beim Umstieg vom alten Format steht der Verlauf so nie nur halb gespeichert da.
  var meta=JSON.stringify({profile:state.profile,routines:state.routines,customEx:state.customEx,exOverrides:state.exOverrides,split:1});
  if(meta!==lsMetaStr){localStorage.setItem(LSK,meta);lsMetaStr=meta;}
  lsHot={};if(full){lsLastFull=Date.now();lsDaysRef=state.days;}
}catch(e){warnSaveFailed();}}
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
function flushLocalSave(){if(slT){clearTimeout(slT);slT=null;}saveLocal(true);}
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
