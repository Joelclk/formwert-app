/* ==========================================================
   app/02-berechnung.js - Kraftstufen, Trainingsvolumen und Reizmodell, Ausdauer, Formwert-Berechnung
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

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
/* ---- Alterskurve Version 2 (fuer die neue Rangleiter, RANK_LADDER) -------------------------
   24-39 J. = 1,00 (kein Abschlag). Ab 40 eine glatte Kurve statt fester Stufen, damit es am
   Geburtstag keinen Sprung gibt (angelehnt an den McCulloch-Age-Koeffizienten, invertiert).
   Unter 24 J. ein grober Platzhalter - dafuer gibt es keine belegten Werte. */
function ageFactorV2(age){
  age=age||30;
  if(age>=24&&age<=39)return 1.0;
  if(age<24)return clamp(0.95+(age-18)/6*0.05,0.5,1.0);
  return Math.max(0.5,1/(1.01*Math.exp(0.0145*(age-40))));
}
/* ---- Neue Rangleiter (RANK_LADDER, ab 27.09.2026 zuerst fuer Brust) ------------------------
   Liefert 19 Werte: Eintritt zu Holz I ... Champion III, dann Legende. Koerpergewicht per
   Potenzgesetz (statt fest 90 kg / Exponent 0,67 fuer alle), getrennte Tabelle je Geschlecht
   (statt einer pauschalen SEX_FACTOR-Konstante), neue Alterskurve. Siehe js/data.js fuer die
   Werte-Herkunft und das Projektdoku "Kraftstandards und Legende Grenzen".
   Ausnahme "bw:false" (Rumpf: plank, legraise): fuer reine Zeit-/Wiederholungs-Standards gibt es
   keinen belegten positiven Zusammenhang mit dem Koerpergewicht (eher das Gegenteil), daher dort
   keine Koerpergewichts-Skalierung - nur Alter und der Uebungs-sf wirken, die Ladder-Werte selbst
   sind schon die absoluten Sekunden/Wiederholungen bei der Referenz. */
/* Welche Rangleiter gilt: eigene Leiter der Variante (LADDER_EX) oder die der Leituebung (std). */
function ladderKey(ex){return (ex&&typeof LADDER_EX!=="undefined"&&LADDER_EX[ex.id])||(ex&&ex.std);}
function ladderThresholds(ex,prof){
  var p=prof||state.profile;
  if(!ex||!ex.std||!p)return null;
  var lk=ladderKey(ex),ladder=RANK_LADDER[lk];if(!ladder)return null;
  var sex=(p.sex==="w")?"w":"m", ratios=ladder[sex];
  // Eigene Leiter einer Variante (LADDER_EX, data.js) ist schon auf die Uebung selbst geeicht - kein sf.
  var af=ageFactorV2(p.age||30), sc=(lk!==ex.std?1:(ex.sf!=null?ex.sf:1));
  if(ladder.bw===false){
    var noScale=af*sc;
    return ratios.map(function(r){return r*noScale;});
  }
  var ref=BW_REF[sex], b=BW_EXP[sex], cl=BW_CLAMP[sex];
  var bw=clamp(p.bodyweight||ref,cl[0],cl[1]);
  var bwScale=Math.pow(bw/ref,b)*af*sc;
  return ratios.map(function(r){return r*ref*bwScale;});
}
/* Kraftwertung ueber die 19-Punkte-Rangleiter - jede Stufe hat ihren eigenen, echten Wert statt
   der alten gleichmaessigen Streckung von 8 auf 19 Stufen. ladder[0]=Eintritt Holz I ...
   ladder[17]=Eintritt Champion III, ladder[18]=Legende. Score 0-100 ist so aufgeteilt, dass
   rankFromScore() (18 gleich grosse Stufen + Legende bei 100, 15e-raenge.js) exakt diese
   Schwellen trifft. */
function gradeLadder(ladder,val){
  if(!ladder||val==null)return null;
  var N=18,step=100/N;
  if(val>=ladder[18])return {idx:18,name:null,score:100,next:null,pct:1};
  if(val<ladder[0])return {idx:0,name:null,score:0,next:ladder[0],pct:0};
  var r=0;
  for(var i=N-1;i>=0;i--){if(val>=ladder[i]){r=i;break;}}
  var p=clamp((val-ladder[r])/(ladder[r+1]-ladder[r]),0,1);
  return {idx:r,name:null,score:clamp((r+p)*step,0,100),next:ladder[r+1],pct:p};
}
function grade(ex,val,prof){
  if(ex&&ex.std&&RANK_LADDER[ladderKey(ex)]){
    var lad=ladderThresholds(ex,prof);
    if(lad){var g=gradeLadder(lad,val);if(g)return g;}
    // Fallback auf die alte Tabelle, falls z. B. das Profil fehlt.
  }
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
var RIR_FULL=2, RIR_STEP=0.12, RIR_MIN=0.30;
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
var SESS_FLAT=6, SESS_TAU=3.5, SESS_FLOOR=0.15;
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
  // Vorher sank die Zahl uebers Limit hinaus wieder (bis auf 70). Dafuer gibt es aber
  // keine belastbare Evidenz - das Limit (MRV) heisst nur "zusaetzliches Volumen bringt
  // wahrscheinlich keinen weiteren Wachstumsreiz mehr, weil die Erholung nicht mehr
  // mithaelt", nicht "du baust dadurch messbar weniger Muskeln auf". Bleibt jetzt bei 100.
  return 100;
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

/* ================= Mobilität ================= */
/* Mobilität wird nicht abgehakt, sondern aus den eingetragenen Mobilitätsübungen gemessen –
   gehaltene Dehnungen und bewegte Übungen (Drehen, Kreisen, 90/90) zählen gleich. 10 Minuten
   an einem Tag sind eine volle Einheit. Mehr zählt am selben Tag nicht weiter: eine lange
   Sitzung soll eine Woche ohne Mobilität nicht aufwiegen, denn Beweglichkeit kommt aus
   Regelmäßigkeit. */
var MOB_UNIT_MIN=10;
// Übungen in Wiederholungen: geschätzte Sekunden je Wiederholung – neuere Übungen tragen das
// selbst (ex.sw), für die älteren steht es hier; sonst 4 s.
var MOB_SEK_WDH={mob_catcow:6,mob_wgs:15,mob_legswing:2,mob_9090:4,mob_wrist_circ:3};
// Einnehmen der Position und Seitenwechsel kosten Zeit, die zur Einheit gehört.
var MOB_WECHSEL_S=10;
// "je Seite" bzw. "je Richtung" in der Anleitung heißt: der eingetragene Wert gilt für jede
// Seite bzw. Richtung einzeln; "je Richtung und Seite" also viermal.
function mobSides(ex){var h=ex.how||"";
  return /je Richtung und Seite/.test(h)?4:(ex.uni||/je (Seite|Richtung)/.test(h))?2:1;}
function mobSetSec(ex,s){
  var n=(ex.uni&&s.repsL!=null&&s.repsR!=null)?(+s.repsL||0)+(+s.repsR||0):(+s.reps||0)*mobSides(ex);
  if(n<=0)return 0;
  return (ex.t==="sec"?n:n*(ex.sw||MOB_SEK_WDH[ex.id]||4))+MOB_WECHSEL_S*Math.min(mobSides(ex),2);
}
/* Mobilität eines Tages: Minuten, Anzahl Übungen, erreichter Anteil einer Einheit (0–1). */
function mobDay(dd){
  var o={min:0,exs:0,units:0,legacy:false},seen={},sec=0;
  if(!dd)return o;
  (dd.sets||[]).forEach(function(s){var ex=exById(s.ex);if(!ex||!ex.mob)return;
    sec+=mobSetSec(ex,s);if(!seen[ex.id]){seen[ex.id]=1;o.exs++;}});
  o.min=sec/60;o.units=Math.min(o.min/MOB_UNIT_MIN,1);
  // Ältere Stände kennen nur den Haken "Mobilität erledigt" – der zählt weiter als volle Einheit.
  if(dd.mobility){o.legacy=true;o.units=1;}
  return o;
}
/* Trainingstag nur mit mindestens einem Satz, der keine Mobilitätsübung ist – reines Dehnen
   zählt für Mobilität, nicht für Konstanz. */
function isTrainDay(dd){
  return !!dd&&(dd.sets||[]).some(function(s){var ex=exById(s.ex);return !ex||!ex.mob;});
}
function fmtMobUnits(u){return String(Math.round(u*10)/10).replace(".",",");}

/* ================= Formwert ================= */
function compute(asOf){
  var p=state.profile,win=windowDays(asOf),f=win/7;
  var from=shiftDays(asOf,-(win-1)),trainDays=0,mobDays=0,mobMin=0;
  for(var d in state.days){
    if(d<from||d>asOf)continue;
    var dd=state.days[d],md=mobDay(dd);
    if(isTrainDay(dd))trainDays++;
    mobDays+=md.units;mobMin+=md.min;
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
          trainDays:trainDays,mobDays:mobDays,mobMin:mobMin,recs:recs,cats:cats,ms:ms,cm:cm,vo2:vo2,vpct:vp,who:who,asOf:asOf};
}
