/* ==========================================================
   app/09-uebungsdetail.js - Uebungsdetail (Info, Verlauf, Fortschritt, Rekorde), Trainingsseite, Training beenden/loeschen, Tagesansicht
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Was eine Uebung ausser Muskeln noch staerkt =================
   Sehnen, Baender, Faszien, Gelenke, Knochen und Faehigkeiten. Bewusst getrennt von
   den Muskeln gehalten: diese Strukturen lassen sich nicht in Saetzen pro Woche
   messen, und sie gehen NICHT ins Trainingsvolumen ein. Die Angabe ist eine
   Einordnung, keine Dosierung - deshalb steht bei jedem Eintrag, worum es geht,
   statt einer Zahl. */
var STRUCT={
 griff:{n:"Griffkraft",k:"Fähigkeit",t:"Wie lange und wie fest du etwas halten kannst. Bei Zug- und Hebeübungen oft das erste, was nachgibt - und damit die Grenze, bevor der Zielmuskel wirklich ausbelastet ist."},
 achilles:{n:"Achillessehne",k:"Sehne",t:"Die kräftigste Sehne des Körpers. Sie passt sich an Zug an, aber deutlich langsamer als der Muskel - nach langer Pause ist der Sprung in die alte Belastung der häufigste Auslöser für Beschwerden."},
 patella:{n:"Patellasehne",k:"Sehne",t:"Verbindet Kniescheibe und Schienbein. Regelmäßige Beugung unter Last macht sie belastbarer; plötzlich viel Sprung- und Landearbeit reizt sie."},
 tractus:{n:"Tractus iliotibialis",k:"Faszie",t:"Sehnenplatte an der Oberschenkelaußenseite, vom Becken bis unters Knie. Sie wird nicht selbst trainiert, sondern über die Muskeln, die an ihr ziehen - Gesäß und Hüftabspreizer. Schwache Hüftstabilität zeigt sich häufig hier."},
 rotator_sehnen:{n:"Rotatorenmanschette",k:"Sehne",t:"Vier Sehnen, die den Oberarmkopf in der Pfanne zentrieren. Sie arbeiten bei jedem Drücken und Ziehen mit, ohne dass man sie spürt - und sind der Grund, warum saubere Technik über Kopf wichtiger ist als Gewicht."},
 bizepssehne:{n:"Lange Bizepssehne",k:"Sehne",t:"Läuft durch das Schultergelenk hindurch. Sie wird bei tiefen Stützpositionen mit gestreckter Schulter stark auf Zug genommen."},
 ellbogen:{n:"Sehnenansätze am Ellbogen",k:"Sehne",t:"Ursprung der Unterarmmuskeln an den Knochenvorsprüngen innen und außen - die Stellen, an denen Tennis- und Golferellenbogen entstehen. Sie profitieren von langsamen, kontrollierten Wiederholungen."},
 adduktorensehnen:{n:"Adduktorensehnen",k:"Sehne",t:"Ansatz an der Schambeinregion. Häufige Beschwerdestelle bei Sportarten mit schnellen Richtungswechseln - gezielte Kräftigung beugt vor."},
 rueckenfaszie:{n:"Rückenfaszie",k:"Faszie",t:"Große Bindegewebsplatte im unteren Rücken, an der Gesäß, Latissimus und Bauchmuskeln zusammenlaufen. Sie überträgt Kraft zwischen Ober- und Unterkörper."},
 plantar:{n:"Plantarfaszie",k:"Faszie",t:"Spannt das Längsgewölbe des Fußes und federt bei jedem Schritt."},
 g_sprunggelenk:{n:"Sprunggelenk",k:"Gelenk",t:"Beweglichkeit und Stabilität hier entscheiden mit, wie tief du hocken kannst und wie sicher du landest."},
 g_knie:{n:"Kniegelenk",k:"Gelenk",t:"Kräftige Muskeln rundherum halten das Gelenk zusammen - das Training wirkt mehr über die Führung als über das Gelenk selbst."},
 g_huefte:{n:"Hüftgelenk",k:"Gelenk",t:"Das beweglichste große Gelenk. Seitliche Stabilität hier bestimmt, ob das Knie bei Belastung nach innen fällt."},
 g_schulter:{n:"Schultergelenk",k:"Gelenk",t:"Viel Bewegungsumfang, wenig knöcherne Führung - die Stabilität kommt fast ausschließlich aus Muskeln und Sehnen."},
 g_handgelenk:{n:"Handgelenk",k:"Gelenk",t:"Wird bei Stützpositionen in Streckung belastet. Mit der Zeit gewöhnt es sich daran; von null auf viel ist der übliche Fehler."},
 g_wirbelsaeule:{n:"Wirbelsäule",k:"Gelenk",t:"Nicht ein Gelenk, sondern viele. Sie hält Last aus, wenn die Rumpfmuskulatur sie in Position hält - genau das wird hier mittrainiert."},
 knochen:{n:"Knochendichte",k:"Knochen",t:"Knochen bauen auf Druck und Zug auf. Schweres Heben und Belastung mit dem eigenen Körpergewicht wirken dabei deutlich besser als gelenkschonende Ausdauerformen."},
 rumpf:{n:"Rumpfspannung",k:"Fähigkeit",t:"Die Fähigkeit, den Oberkörper unter Last stabil zu halten. Sie begrenzt bei vielen Übungen, wie viel Gewicht sinnvoll bewegt werden kann."},
 balance:{n:"Gleichgewicht",k:"Fähigkeit",t:"Einbeinige und freie Übungen fordern laufende Korrekturen aus Fuß, Hüfte und Rumpf - das trainiert man nicht an der Maschine."},
 beweglichkeit:{n:"Beweglichkeit",k:"Fähigkeit",t:"Wie weit ein Gelenk bewegt werden kann, ohne auszuweichen. Wächst durch regelmäßige, nicht durch lange Einheiten."},
 kondition:{n:"Herz-Kreislauf",k:"Fähigkeit",t:"Ausdauerleistung und Erholungsfähigkeit. Zeigt sich im Alltag oft früher als Kraftzuwachs."}
};
var EX_PLUS={"bench":["rotator_sehnen", "g_schulter"],
  "bench_db":["rotator_sehnen", "g_schulter"],
  "bench_inc":["rotator_sehnen", "g_schulter"],
  "bench_inc_db":["rotator_sehnen", "g_schulter"],
  "bench_dec":["rotator_sehnen", "g_schulter"],
  "machine_press":["rotator_sehnen", "g_schulter"],
  "machine_press_lying":["rotator_sehnen", "g_schulter"],
  "pushup":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "pushup_diamond":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "pushup_arch":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "pushup_dec":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "dips":["rotator_sehnen", "bizepssehne", "g_schulter", "g_handgelenk"],
  "fly_db":["rotator_sehnen", "g_schulter"],
  "cable_fly":["rotator_sehnen", "g_schulter"],
  "fly_machine":["rotator_sehnen", "g_schulter"],
  "pullover":["rotator_sehnen", "g_schulter"],
  "ohp":["rotator_sehnen", "g_schulter", "rumpf"],
  "ohp_db":["rotator_sehnen", "g_schulter", "rumpf"],
  "push_press":["rotator_sehnen", "g_schulter", "rumpf"],
  "arnold":["rotator_sehnen", "g_schulter", "rumpf"],
  "pike_pushup":["rotator_sehnen", "g_schulter", "g_handgelenk", "rumpf"],
  "hspu":["rotator_sehnen", "g_schulter", "g_handgelenk", "rumpf"],
  "handstand":["rotator_sehnen", "g_schulter", "g_handgelenk", "rumpf"],
  "pullup":["griff", "ellbogen", "g_schulter"],
  "chinup":["griff", "ellbogen", "g_schulter"],
  "pullup_wide":["griff", "ellbogen", "g_schulter"],
  "pullup_weight":["griff", "ellbogen", "g_schulter"],
  "latpull":["griff", "ellbogen", "g_schulter"],
  "latpull_close":["griff", "ellbogen", "g_schulter"],
  "pullup_neg":["griff", "ellbogen", "g_schulter"],
  "deadhang":["griff", "ellbogen", "g_handgelenk"],
  "row_bb":["griff", "g_schulter", "rumpf"],
  "row_db":["griff", "g_schulter", "rumpf", "balance"],
  "row_pendlay":["griff", "g_schulter", "rumpf"],
  "row_tbar":["griff", "g_schulter", "rumpf"],
  "row_cable":["g_schulter", "rumpf"],
  "row_machine":["g_schulter", "rumpf"],
  "row_inv":["g_schulter", "rumpf"],
  "row_band":["g_schulter", "rumpf"],
  "facepull":["g_schulter", "rumpf"],
  "shrug":["griff", "g_schulter", "rumpf"],
  "shrug_db":["griff", "g_schulter", "rumpf"],
  "shrug_cable":["griff", "g_schulter", "rumpf"],
  "squat":["patella", "g_knie", "knochen", "rumpf"],
  "squat_front":["patella", "g_knie", "knochen", "rumpf"],
  "squat_goblet":["patella", "g_knie", "rumpf"],
  "squat_bw":["patella", "g_knie", "rumpf"],
  "squat_pistol":["patella", "g_knie", "g_huefte", "rumpf"],
  "squat_bulg":["patella", "g_knie", "g_huefte", "rumpf"],
  "legpress":["patella", "g_knie", "knochen", "rumpf"],
  "hacksquat":["patella", "g_knie", "knochen", "rumpf"],
  "lunge":["patella", "g_knie", "g_huefte", "rumpf"],
  "lunge_walk":["patella", "g_knie", "g_huefte", "rumpf"],
  "stepup":["patella", "g_knie", "g_huefte", "rumpf"],
  "stepup_bw":["patella", "g_knie", "g_huefte", "rumpf"],
  "legext":["patella", "g_knie", "knochen", "rumpf"],
  "sissy":["patella", "g_knie", "rumpf"],
  "wallsit":["patella", "g_knie", "rumpf"],
  "balance_sl":["patella", "g_knie", "g_huefte", "rumpf"],
  "deadlift":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "deadlift_rdl":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "deadlift_sumo":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "deadlift_sl":["griff", "rueckenfaszie", "g_huefte", "g_wirbelsaeule"],
  "hipthrust":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "gluteBridge":["rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "goodmorning":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "backext":["rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "legcurl":["g_knie"],
  "nordic":["rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "kb_swing":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "plank":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "lsit":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "sideplank":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "hollow":["g_wirbelsaeule", "rumpf"],
  "legraise":["griff", "g_wirbelsaeule", "rumpf"],
  "kneeraise":["griff", "g_wirbelsaeule", "rumpf"],
  "crunch":["g_wirbelsaeule", "rumpf"],
  "situp":["g_wirbelsaeule", "rumpf"],
  "russian":["g_wirbelsaeule", "rumpf"],
  "abwheel":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "cablecrunch":["g_wirbelsaeule", "rumpf"],
  "deadbug":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "birddog":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "pallof":["g_wirbelsaeule", "rumpf"],
  "torso_rot":["g_wirbelsaeule", "rumpf"],
  "dragonflag":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "lateral":["g_schulter"],
  "lateral_cable":["g_schulter", "balance"],
  "frontraise":["g_schulter"],
  "reversefly":["g_schulter"],
  "upright_row":["g_schulter"],
  "cuban":["g_schulter"],
  "bandpullapart":["g_schulter"],
  "rot_internal":["rotator_sehnen", "g_schulter", "balance"],
  "emptycan":["rotator_sehnen", "g_schulter"],
  "curl_bb":["ellbogen"],
  "curl_db":["ellbogen"],
  "curl_hammer":["griff", "ellbogen", "g_handgelenk"],
  "curl_incline":["ellbogen"],
  "curl_preacher":["ellbogen"],
  "curl_preacher_machine":["ellbogen"],
  "curl_cable":["ellbogen"],
  "curl_cable_lying":["ellbogen"],
  "tri_push":["ellbogen"],
  "tri_skull":["ellbogen"],
  "tri_over":["ellbogen"],
  "tri_kick":["ellbogen", "balance"],
  "dips_bench":["ellbogen", "bizepssehne"],
  "wrist_curl":["griff", "ellbogen", "g_handgelenk"],
  "wrist_curl_rev":["griff", "ellbogen", "g_handgelenk"],
  "farmers":["griff", "ellbogen", "g_handgelenk"],
  "ricebucket":["griff", "ellbogen", "g_handgelenk"],
  "fatgripz":["griff", "ellbogen", "g_handgelenk"],
  "calf_stand":["achilles", "g_sprunggelenk"],
  "calf_seat":["achilles", "g_sprunggelenk"],
  "calf_bw":["achilles", "g_sprunggelenk"],
  "adduct":["adduktorensehnen", "g_huefte"],
  "hipflex_cable":["balance"],
  "clamshell":["tractus", "g_huefte"],
  "sidelying_raise":["tractus", "g_huefte"],
  "bandwalk_lat":["tractus", "g_huefte"],
  "abduct":["tractus", "g_huefte"],
  "copenhagen":["adduktorensehnen", "g_huefte"],
  "neck_curl":["g_wirbelsaeule"],
  "neck_ext_bw":["g_wirbelsaeule"],
  "neck_flex_bw":["g_wirbelsaeule"],
  "neck_side_bw":["g_wirbelsaeule"],
  "neck_harness":["g_wirbelsaeule"],
  "neck_bridge":["g_wirbelsaeule"],
  "run":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "run_interval":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "bike":["kondition"],
  "row_erg":["kondition", "griff", "rueckenfaszie"],
  "swim":["kondition", "rotator_sehnen", "g_schulter"],
  "jumprope":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "walk":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "hike":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "stairs":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "burpee":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "elliptical":["kondition"],
  "football":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "mob_hip":["beweglichkeit", "g_huefte"],
  "mob_shoulder":["beweglichkeit", "g_schulter", "g_wirbelsaeule"],
  "mob_thoracic":["beweglichkeit", "g_wirbelsaeule"],
  "mob_hamstring":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_ankle":["beweglichkeit", "g_sprunggelenk"],
  "mob_couch":["beweglichkeit", "g_huefte"],
  "mob_deadhang":["beweglichkeit", "griff", "g_schulter", "g_handgelenk"],
  "mob_pancake":["beweglichkeit", "g_huefte"],
  "mob_chest":["beweglichkeit", "g_schulter"],
  "mob_biceps":["beweglichkeit", "g_schulter", "g_handgelenk"],
  "mob_cobra":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_reardelt":["beweglichkeit", "g_schulter"],
  "mob_triceps":["beweglichkeit", "g_schulter"],
  "mob_neck":["beweglichkeit"],
  "mob_lat":["beweglichkeit", "g_schulter"],
  "mob_knee2chest":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_twist":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_wrist_flex":["beweglichkeit", "g_handgelenk"],
  "mob_wrist_ext":["beweglichkeit", "g_handgelenk"],
  "mob_hipflex":["beweglichkeit", "g_huefte"],
  "mob_pigeon":["beweglichkeit", "g_huefte"],
  "mob_glutemed":["beweglichkeit", "g_huefte"],
  "mob_quad":["beweglichkeit", "g_huefte"],
  "mob_frog":["beweglichkeit", "g_huefte"],
  "mob_calf_straight":["beweglichkeit", "g_sprunggelenk", "g_huefte"],
  "mob_calf_bent":["beweglichkeit", "g_sprunggelenk"],
  "mob_tibialis":["beweglichkeit", "g_sprunggelenk"],
  "mob_catcow":["beweglichkeit", "g_wirbelsaeule"],
  "mob_wgs":["beweglichkeit", "g_sprunggelenk", "g_huefte", "g_wirbelsaeule"],
  "mob_legswing":["beweglichkeit", "g_huefte"],
  "mob_9090":["beweglichkeit", "g_huefte"],
  "mob_wrist_circ":["beweglichkeit", "g_handgelenk"]};
function exPlusList(ex){
  var ids=EX_PLUS[ex&&ex.id]||[];
  return ids.filter(function(id){return !!STRUCT[id];});
}
/* ================= Übungsdetail: Tabs Info/Verlauf/Fortschritt/Rekorde ================= */
function exDetailPlus(ex){
  var ids=exPlusList(ex);
  if(!ids.length)return null;
  var wrap=el("div","pluslist");
  ids.forEach(function(id){
    var st=STRUCT[id];
    var row=el("div","plusrow");
    var head=el("div","plushead");
    head.appendChild(el("b",null,st.n));
    head.appendChild(el("span","pluskind",st.k));
    row.appendChild(head);
    row.appendChild(el("p",null,st.t));
    wrap.appendChild(row);
  });
  var note=el("p","note pluslead",
    "Zählt nicht ins Trainingsvolumen - diese Strukturen lassen sich nicht in Sätzen pro Woche messen. Sie werden trotzdem mitbelastet und brauchen meist länger, um sich anzupassen, als der Muskel.");
  wrap.insertBefore(note,wrap.firstChild);
  return wrap;
}
function exDetailInfo(ex){
  var wrap=el("div");
  var figs=woFigs(ex);figs.classList.add("exdetail-figs");wrap.appendChild(figs);
  wrap.appendChild(woMus(ex,figs));
  return wrap;
}
// onChange wird nach dem Bearbeiten/Löschen eines vergangenen Satzes aufgerufen, damit die
// gesamte Detailseite (Verlauf/Fortschritt/Rekorde hängen alle an denselben Daten) neu gezeichnet wird.
function exDetailHistory(ex,onChange){
  var wrap=el("div"),rows=exSetsByDay(ex.id).slice().reverse();
  if(!rows.length){wrap.appendChild(el("p","note","Noch keine Sätze für diese Übung eingetragen."));return wrap;}
  rows.forEach(function(r){
    var row=el("div","exd-hrow");
    row.appendChild(el("b",null,deDate(r.date)));
    var line=el("div","exd-hsets");
    r.sets.forEach(function(s){
      var idx=state.days[r.date].sets.indexOf(s);
      var chip=el("button","exd-hset",setLabel(ex,s));chip.type="button";
      chip.setAttribute("aria-label","Satz bearbeiten");
      chip.onclick=function(){sheetEditLoggedSet(ex,r.date,idx,onChange);};
      line.appendChild(chip);
    });
    row.appendChild(line);
    wrap.appendChild(row);
  });
  return wrap;
}
// Schlichter SVG-Linienchart ohne externe Bibliothek – reicht für eine Kennzahl über die Zeit.
function svgLineChart(points){
  if(points.length<2)return el("p","note","Für einen Verlauf braucht es mindestens 2 Trainingstage mit dieser Übung.");
  var w=320,h=120,pad=6,padB=4,n=points.length;
  var vals=points.map(function(p){return p.val;});
  var minV=Math.min.apply(null,vals),maxV=Math.max.apply(null,vals);
  if(minV===maxV){minV-=1;maxV+=1;}
  function X(i){return pad+i/(n-1)*(w-2*pad);}
  function Y(v){return h-padB-(v-minV)/(maxV-minV)*(h-2*padB);}
  var d="M"+points.map(function(p,i){return X(i)+","+Y(p.val);}).join(" L");
  var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 "+w+" "+h);svg.setAttribute("class","exd-chart");svg.setAttribute("preserveAspectRatio","none");
  var path=document.createElementNS(svg.namespaceURI,"path");path.setAttribute("d",d);path.setAttribute("class","exd-chart-line");
  svg.appendChild(path);
  points.forEach(function(p,i){
    var c=document.createElementNS(svg.namespaceURI,"circle");
    c.setAttribute("cx",X(i));c.setAttribute("cy",Y(p.val));c.setAttribute("r",i===n-1?4:2.2);
    c.setAttribute("class","exd-chart-dot"+(i===n-1?" last":""));
    svg.appendChild(c);
  });
  var wrap=el("div","exd-chart-wrap");wrap.appendChild(svg);
  var lab=el("div","exd-chart-labels");
  lab.appendChild(el("span",null,shortDate(points[0].date)));
  lab.appendChild(el("span",null,shortDate(points[n-1].date)));
  wrap.appendChild(lab);
  return wrap;
}
function exDetailProgress(ex){
  var wrap=el("div"),pts=exBestByDay(ex);
  if(!pts.length){wrap.appendChild(el("p","note","Noch keine Sätze für diese Übung eingetragen."));return wrap;}
  var last=pts[pts.length-1];
  var head=el("div","exd-nowval");
  head.appendChild(el("b",null,fmtBestVal(ex,last.val,last.set)));
  head.appendChild(el("span",null,"Letzter Bestwert · "+deDate(last.date)));
  wrap.appendChild(head);
  wrap.appendChild(svgLineChart(pts));
  // Vergleich mit dem ältesten Wert, der mindestens ~3 Wochen zurückliegt – zeigt die Richtung,
  // ohne bei sehr dichtem Training nur den direkten Vorwert zu vergleichen.
  var cmpIdx=-1;
  for(var i=pts.length-2;i>=0;i--){if(daysBetween(pts[i].date,last.date)>=21){cmpIdx=i;break;}}
  if(cmpIdx>=0){
    var before=pts[cmpIdx],diff=last.val-before.val,pct=before.val>0?Math.round(diff/before.val*100):null;
    wrap.appendChild(el("p","note",
      (diff>=0?"+":"")+(ex.t==="load"?Math.round(diff*2)/2:Math.round(diff))+" "+unitOf(ex.t)+
      (pct!=null?" ("+(pct>=0?"+":"")+pct+"%)":"")+" seit "+deDate(before.date)));
  }
  return wrap;
}
function exDetailRecords(ex){
  var wrap=el("div"),rows=exSetsByDay(ex.id);
  if(!rows.length){wrap.appendChild(el("p","note","Noch keine Sätze für diese Übung eingetragen."));return wrap;}
  var bestVal=null,bestValDate=null,bestKg=null,bestKgSet=null,bestKgDate=null;
  var bestValSet=null,bestReps=null,bestRepsDate=null,bestRepsSet=null,totalSets=0;
  rows.forEach(function(r){
    r.sets.forEach(function(s){
      totalSets++;
      var v=setValue(ex,s);
      if(bestVal==null||v>bestVal){bestVal=v;bestValDate=r.date;bestValSet=s;}
      if(ex.t==="load"&&(bestKg==null||s.kg>bestKg)){bestKg=s.kg;bestKgSet=s;bestKgDate=r.date;}
      var reps=(ex.uni&&s.repsL!=null&&s.repsR!=null)?Math.min(s.repsL,s.repsR):s.reps;
      if(reps!=null&&(bestReps==null||reps>bestReps)){bestReps=reps;bestRepsDate=r.date;bestRepsSet=s;}
    });
  });
  function card(lab,val,sub){
    var c=el("div","exd-rec");
    c.appendChild(el("span","exd-rec-lab",lab));
    c.appendChild(el("b",null,val));
    if(sub)c.appendChild(el("span","exd-rec-sub",sub));
    return c;
  }
  var grid=el("div","exd-recgrid");
  grid.appendChild(card(ex.t==="load"?"Bester e1RM":"Bestwert",fmtBestVal(ex,bestVal,bestValSet),deDate(bestValDate)));
  if(ex.t==="load")grid.appendChild(card("Höchstes Gewicht",bestKg+" kg",setLabel(ex,bestKgSet)+" · "+deDate(bestKgDate)));
  grid.appendChild(card(ex.t==="sec"?"Längste Haltezeit":"Meiste Wiederholungen",bestReps+(ex.t==="sec"?" s":" Wdh"),(ex.uni&&bestRepsSet&&bestRepsSet.repsL!=null&&bestRepsSet.repsR!=null?setLabel(ex,bestRepsSet)+" · ":"")+deDate(bestRepsDate)));
  grid.appendChild(card("Trainiert",rows.length+" Tage",totalSets+" Sätze insgesamt"));
  grid.appendChild(card("Zuletzt trainiert",deDate(rows[rows.length-1].date)));
  var g=grade(ex,bestVal);
  if(g)grid.appendChild(card("Aktuelle Kraftstufe",g.name,g.next?"nächste Stufe ab "+fmtVal(g.next,ex.t):"höchste Stufe erreicht"));
  wrap.appendChild(grid);
  return wrap;
}
/* ---- Reihenfolge der Uebungen im laufenden Training ----
   Die Position in workout.exercises ist reine Anzeige: geloggte Saetze haengen an ihrem
   eigenen Datensatz (st.rec), Ausdauer an we.cardioRec - beide kennen ihre Uebung selbst.
   Verschieben kann also nichts loeschen und keine Eintraege verschieben.
   Die gerade angesehene Uebung bleibt sichtbar, auch wenn sie dabei die Position wechselt. */
function woMoveEx(from,to){
  if(!workout)return false;
  var n=workout.exercises.length;
  if(from<0||from>=n||to<0||to>=n||from===to)return false;
  var seen=workout.exercises[woPage]||null;
  var it=workout.exercises.splice(from,1)[0];
  workout.exercises.splice(to,0,it);
  if(seen){var ni=workout.exercises.indexOf(seen);if(ni>=0)woPage=ni;}
    // Zwei gleiche Übungen zu tauschen ergibt denselben woShapeKey. Ohne erzwungenen Neuaufbau
  // blieben Eingabefelder und Knöpfe an der alten Reihenfolge hängen, und "Übung entfernen"
  // träfe die falsche Übung.
  woShape=null;
  saveWorkout();renderSession();
  return true;
}
function openReorderSheet(){
  if(!workout||workout.exercises.length<2)return;
  openSheet(function(b){
    sheetTitle(b,"Reihenfolge ändern");
    var list=el("div","card flush");list.style.marginTop="2px";
    function draw(){
      list.innerHTML="";
      workout.exercises.forEach(function(we,i){
        var ex=exById(we.ex);
        var row=el("div","row wo-ordrow"+(i===woPage?" cur":""));
        row.appendChild(el("span","wo-ordnum num",String(i+1)));
        var mn=el("div","main");
        mn.appendChild(el("b",null,ex?ex.n:"Übung"));
        var sub;
        if(we.sets){
          var dn2=0;we.sets.forEach(function(st){if(st.done)dn2++;});
          sub=dn2+" von "+we.sets.length+" Sätzen";
        }else sub="Ausdauer";
        mn.appendChild(el("span",null,sub));
        row.appendChild(mn);
        var up=el("button","iconbtn");up.setAttribute("aria-label","Nach oben schieben");
        up.innerHTML=svgIcon("M12 19V5M5 12l7-7 7 7",2.1);
        up.disabled=(i===0);
        var dw=el("button","iconbtn");dw.setAttribute("aria-label","Nach unten schieben");
        dw.innerHTML=svgIcon("M12 5v14M5 12l7 7 7-7",2.1);
        dw.disabled=(i===workout.exercises.length-1);
        (function(k){
          up.onclick=function(){if(woMoveEx(k,k-1))draw();};
          dw.onclick=function(){if(woMoveEx(k,k+1))draw();};
        })(i);
        row.appendChild(up);row.appendChild(dw);
        list.appendChild(row);
      });
    }
    draw();
    b.appendChild(list);
    b.appendChild(el("p","setpage-note","Bereits abgehakte Sätze bleiben erhalten – verschoben wird nur die Reihenfolge, in der die Übungen angezeigt werden."));
    var ok=el("button","btn primary block","Fertig");ok.style.marginTop="14px";
    ok.onclick=closeSheet;b.appendChild(ok);
  });
}
/* Uebung im laufenden Training tauschen (z. B. Geraet belegt). Noch nichts abgehakt: die Uebung
   wird an Ort und Stelle ersetzt, gleiche Satzzahl, frische Vorschlaege. Schon Saetze abgehakt:
   die bleiben bei der alten Uebung gespeichert, die neue kommt direkt dahinter mit den
   restlichen Saetzen. */
function woSwapEx(ei){
  var we=workout&&workout.exercises[ei];if(!we||!we.sets)return;
  var old=exById(we.ex);if(!old)return;
  var done=we.sets.filter(function(x){return x.done;}).length,open=we.sets.length-done;
  var rg=null,p0=(old.p||[])[0];if(p0)rg=REGIONS.find(function(r){return r.ids&&r.ids.indexOf(p0)>=0;})||null;
  openSheet(function(bb){
    sheetTitle(bb,"Übung tauschen");
    bb.appendChild(el("p","note",done
      ?"Statt „"+old.n+"“ – "+(done===1?"dein abgehakter Satz bleibt":"deine "+done+" abgehakten Sätze bleiben")+" dort gespeichert, die neue Übung bekommt "+Math.max(1,open)+(Math.max(1,open)===1?" Satz.":" Sätze.")
      :"Statt „"+old.n+"“ – "+we.sets.length+(we.sets.length===1?" Satz bleibt.":" Sätze bleiben.")));
    exPicker(bb,null,function(e){
      closeSheet();
      if(e.id===we.ex)return;
      if(!done){
        var n=we.sets.length,sets=[];for(var i=0;i<n;i++)sets.push({kg:null,reps:null,done:false});
        we.ex=e.id;we.sets=sets;delete we.sugWhy;delete we.warm;
        try{applySuggestion(we,e);}catch(x){}
        woPage=ei;
      }else{
        we.sets=we.sets.filter(function(x){return x.done;});
        var ns=[];for(var j=0;j<Math.max(1,open);j++)ns.push({kg:null,reps:null,done:false});
        var nw={ex:e.id,restSec:we.restSec,sets:ns};
        try{applySuggestion(nw,e);}catch(x){}
        workout.exercises.splice(ei+1,0,nw);
        woPage=ei+1;
      }
      saveWorkout();renderSession();
      toast("„"+e.n+"“ statt „"+old.n+"“");
    },{region:rg});
  });
}
function woAddPage(){
  var pg=el("article","wo-page wo-addpage");pg.setAttribute("data-i",String(workout.exercises.length));
  var b=el("button","wo-plus");b.setAttribute("aria-label","Übung hinzufügen");
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  b.onclick=function(){openSheet(function(bb){sheetTitle(bb,"Übung hinzufügen");
    exPicker(bb,null,function(e){
      closeSheet();
      // Cardio passt nicht in das Satz-Schema (Minuten/km statt Gewicht/Wdh) - dafuer oeffnet
      // sich der Ausdauer-Dialog statt einer neuen Uebungsseite, mit dieser Aktivitaet schon
      // vorausgewaehlt, und dem laufenden Training zugeordnet (wid), genau wie ein Satz.
      if(e.t==="cardio")addWorkoutCardio(e);
      else addWorkoutExercise(e);
    },{cardio:true});
  });};
  pg.appendChild(b);
  pg.appendChild(el("p",null,workout.exercises.length?"Tipp auf das Plus für die nächste Übung.":"Tipp auf das Plus und füge deine erste Übung hinzu."));
  return pg;
}
function renderSessionInner(){
  startTick();
  var box=$("session-body");box.innerHTML="";
  // Kopf: Name, Uhr, Pause
  var head=el("div","wo-head");
  var nm=document.createElement("input");nm.type="text";nm.value=workout.name;nm.className="wo-name";nm.setAttribute("aria-label","Name des Trainings");
  nm.onchange=function(){workout.name=nm.value.trim()||"Training";saveWorkout();};
  head.appendChild(nm);
  var resting=isResting();
  var tm=el("div","wo-timer"+(workout.paused?" paused":""));tm.id="wo-timer-wrap";tm.hidden=resting;
  tm.innerHTML='<b id="wo-timer" class="num">'+fmtDur(woElapsed())+'</b>'+(workout.paused?'<span>pausiert</span>':'');
  head.appendChild(tm);
  // Ersetzt waehrend der Satzpause den Zeit-Anzeigeplatz, statt einen eigenen Bereich zu
  // brauchen - so kann die Pausenanzeige nie etwas verdecken oder das Layout verschieben.
  var rp=el("div","wo-rest-pill");rp.id="wo-rest-pill";rp.hidden=!resting;
  rp.setAttribute("role","button");rp.setAttribute("tabindex","0");rp.setAttribute("aria-label","Satzpause steuern");
  rp.innerHTML=svgIcon("M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z")+'<span>'+(restPaused()?"Angehalten":"Pause")+'</span><b id="wo-rest-left" class="num">'+fmtDur(Math.ceil(restLeftMs()/1000))+'</b>';
  rp.onclick=function(){
    if(!workout)return;
    // Gegen doppelt ausgeloeste Taps (wie beim Haken): nur einmal oeffnen.
    if(rp.dataset.busy)return;rp.dataset.busy="1";setTimeout(function(){rp.dataset.busy="";},500);
    restAudioUnlock();sheetRest();};
  rp.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();rp.onclick();}};
  head.appendChild(rp);
  var pb=el("button","iconbtn");pb.setAttribute("aria-label",workout.paused?"Training fortsetzen":"Training pausieren");
  pb.innerHTML=workout.paused?svgIcon("M7 4.5v15l13-7.5z",1.9):svgIcon("M9 5v14M15 5v14",2.2);
  pb.onclick=function(){if(workout.paused){workout.pausedMs+=Date.now()-workout.pauseStart;workout.paused=false;}else{workout.paused=true;workout.pauseStart=Date.now();}restFollowWorkoutPause(workout.paused);saveWorkout();renderSession();};
  head.appendChild(pb);
  // Fortschritt und Beenden wandern in die Kopfzeile – so bleibt unten kein Balken stehen
  // und die Satztabelle behält ihren Platz.
  var pr=el("span","wo-prog num");pr.id="wo-prog";head.appendChild(pr);
  try{head.appendChild(prCounterEl());}catch(e){}
  var endB=el("button","btn primary small","Beenden");endB.onclick=finishWorkout;head.appendChild(endB);
  box.appendChild(head);
  var pbar=el("div","wo-progbar");pbar.setAttribute("aria-hidden","true");pbar.innerHTML='<i id="wo-progfill"></i>';box.appendChild(pbar);
  // Duenne, staendig reservierte Linie fuer den Pausen-Fortschritt - getrennt vom gruenen
  // Balken oben, der ausschliesslich den Trainingsfortschritt zeigt.
  var rbar=el("div","wo-restline");rbar.setAttribute("aria-hidden","true");rbar.innerHTML='<i id="wo-restfill"></i>';box.appendChild(rbar);

  var dots=el("div","wo-dots");dots.id="wo-dots";box.appendChild(dots);
  var pager=el("div","wo-pager");pager.id="wo-pager";
  workout.exercises.forEach(function(we,ei){
    var ex=exById(we.ex);if(!ex)return;
    var w=el("article","wo-page");w.setAttribute("data-i",String(ei));
        // Nur mit Ausdauer-Datensatz als Ausdauer zeigen: Ein gespeichertes Training kann aus
    // derselben Zeit noch Sätze für eine Ausdauer-Übung enthalten.
    var isCardio=ex.t==="cardio"&&!!we.cardioRec;
    var h=el("div","wo-pagehead");
    var title=el("div","main");title.appendChild(el("b",null,ex.n));
    if(isCardio){
      title.appendChild(el("span",null,"Übung "+(ei+1)+" von "+workout.exercises.length+" · Ausdauer"));
    }else{
      var best=bestFor(ex.id,TODAY,WIN_STRENGTH);
      var sub=el("span",null,"Übung "+(ei+1)+" von "+workout.exercises.length+" · "+(best.best!=null?"Best "+fmtVal(best.best,ex.t):"neu")+" · Pause "+we.restSec+" s");
      try{var wrk=exRank(ex);if(wrk){var rc=rankChip(wrk,18,function(){sheetRankLadder(exRank(ex),"Rangleiter · "+ex.n,exRankHint(ex,exRank(ex)));});rc.setAttribute("data-ex",ex.id);sub.insertBefore(rc,sub.firstChild);}}catch(e){}
      title.appendChild(sub);
    }
    h.appendChild(title);
    var infoBoxS=exInfoBlock(ex);
    h.appendChild(exInfoBtn(infoBoxS));
    // Reihenfolge aendern - nur sinnvoll, wenn es ueberhaupt etwas zu sortieren gibt.
    if(workout.exercises.length>1){
      var ord=el("button","iconbtn");ord.title="Reihenfolge";ord.setAttribute("aria-label","Reihenfolge der Übungen ändern");
      ord.innerHTML=svgIcon("M7 20V4M4 7l3-3 3 3M17 4v16M14 17l3 3 3-3",2.1);
      ord.onclick=openReorderSheet;
      h.appendChild(ord);
    }
    if(!isCardio){
      var rs=el("button","iconbtn");rs.title="Pausenzeit";rs.setAttribute("aria-label","Pausenzeit ändern");
      rs.innerHTML=svgIcon("M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z");
      rs.onclick=function(){sheetRestSec(we);};
      h.appendChild(rs);
    }
    if(!isCardio){
      var swb=el("button","iconbtn");swb.title="Übung tauschen";swb.setAttribute("aria-label","Übung tauschen");
      swb.innerHTML=svgIcon("M7 7h11l-3-3M17 17H6l3 3",2);
      swb.onclick=function(){woSwapEx(ei);};
      h.appendChild(swb);
    }
    var del=el("button","iconbtn");del.setAttribute("aria-label","Übung entfernen");del.innerHTML=svgIcon(IC_TRASH);
    del.onclick=function(){
      function doIt(){
        if(isCardio){var ck=cardioDayOf(we.cardioRec);
          if(ck){var lst=state.days[ck].cardio;lst.splice(lst.indexOf(we.cardioRec),1);touch(ck);}}
        else we.sets.forEach(function(st){if(st.rec)removeRec(st.rec);});
        workout.exercises.splice(ei,1);
        if(woPage>workout.exercises.length)woPage=workout.exercises.length;
        saveWorkout();renderLight();}
      var hasData=isCardio?(we.cardioRec.min>0):we.sets.some(function(x){return x.done;});
      if(hasData)askConfirm("Übung entfernen?",isCardio?"Der eingetragene Ausdauer-Datensatz wird mit gelöscht.":"Die bereits abgehakten Sätze werden mit gelöscht.","Entfernen",doIt);else doIt();};
    h.appendChild(del);w.appendChild(h);
    w.appendChild(infoBoxS);
    if(isCardio){
      var grid=el("div","grid2");grid.style.marginTop="4px";
            // Sollte der Datensatz nicht (mehr) in einem Tag stehen - etwa weil der Tag
      // zwischendurch aus der Cloud neu geschrieben wurde -, erst die Kopie im Tag suchen
      // (gleiche Uebung, gleiches Training) und nur ohne Treffer neu eintragen. Blindes
      // Eintragen setzte ihn neben die Cloud-Kopie und zaehlte die Minuten doppelt.
      if(!cardioDayOf(we.cardioRec))relinkCardio(workout);
      var touchCardio=function(){touch(cardioDayOf(we.cardioRec)||TODAY);};
      var minF=numField("Minuten",we.cardioRec.min,"5",0),kmF=numField("Kilometer (optional)",we.cardioRec.km,"0.5",0);
      grid.appendChild(minF);grid.appendChild(kmF);w.appendChild(grid);
      var cout=el("div","calcout");w.appendChild(cout);
      function updCardioOut(){
        var f2=INTENS[ex.intens||"mittel"];
        cout.innerHTML="Zählt als <b>"+Math.round(we.cardioRec.min*f2)+" Äquivalentminuten</b> auf dein Wochenziel von "+state.profile.goals.cardio+" min.";
      }
      minF.input.addEventListener("input",function(){we.cardioRec.min=parseFloat(minF.input.value)||0;touchCardio();saveWorkoutSoon();updCardioOut();});
      kmF.input.addEventListener("input",function(){we.cardioRec.km=parseFloat(kmF.input.value)||0;touchCardio();saveWorkoutSoon();});
      updCardioOut();
      var wfigsC=woFigs(ex);
      wfigsC.classList.add("tap");
      wfigsC.setAttribute("role","button");wfigsC.setAttribute("tabindex","0");
      wfigsC.setAttribute("aria-label","Beanspruchte Muskeln von "+ex.n+" gross anzeigen");
      wfigsC.onclick=function(){pageExMuscles(ex);};
      w.appendChild(wfigsC);
      w.appendChild(woMusLive(ex,wfigsC));
      pager.appendChild(w);
      return;
    }
    // Notiz je Uebung und Aufwaermsaetze (15c-alltag.js)
    w.appendChild(woNoteEl(ex));
    var warmEl=woWarmEl(we,ex,ei);if(warmEl)w.appendChild(warmEl);
    // Tabelle
    var tblCls="wo-table";
    if(ex.uni)tblCls+=ex.t==="load"?" uni-load":" uni-plain";
    else if(ex.t==="load")tblCls+=" has-kg";
    var tbl=el("div",tblCls);
    var unitLab2=ex.t==="sec"?"Sek.":"Wdh.";
    var hd=el("div","wo-row head");
    hd.appendChild(el("span",null,"Satz"));hd.appendChild(el("span",null,"Vorher"));
    if(ex.t==="load")hd.appendChild(el("span",null,ex.wt==="body"?"+kg":"kg"));
    if(ex.uni){hd.appendChild(el("span",null,unitLab2+" L"));hd.appendChild(el("span",null,unitLab2+" R"));}
    else hd.appendChild(el("span",null,unitLab2));
    hd.appendChild(el("span",null,"Reserve"));
    hd.appendChild(el("span",null,""));
    tbl.appendChild(hd);
    var rowsWrap=el("div","wo-rows");tbl.appendChild(rowsWrap);
    var prevSets=prevSetsFor(ex.id);
    function rirText(v){return v!=null?rirLabel(v):"–";}
    we.sets.forEach(function(st,si){
      var r=el("div","wo-row"+(st.done?" done":"")+(st.done&&st.pr&&st.pr.length?" pr":""));r.setAttribute("data-s",String(si));
      r.appendChild(el("span","wo-n",String(si+1)));
      var pv=prevSets[si],pvUni=(ex.uni&&pv&&pv.repsL!=null&&pv.repsR!=null)?(pv.repsL+"/"+pv.repsR):null;
      r.appendChild(el("span","wo-prev",pv?(ex.t==="load"?(ex.wt==="body"&&!pv.kg?(pvUni||pv.reps):(ex.wt==="body"?"+":"")+pv.kg+"×"+(pvUni||pv.reps)):(pvUni||pv.reps)+(ex.t==="sec"?" s":"")):"–"));
      var kgI=null;
      // Leere Felder bleiben leer (null) - als Orientierung steht der Wert vom letzten Mal als
      // blasser Platzhalter darin, uebernommen wird er aber erst, wenn man ihn eintippt.
      if(ex.t==="load"){kgI=document.createElement("input");kgI.type="number";kgI.inputMode="decimal";kgI.step="2.5";kgI.value=fieldVal(st.kg);kgI.placeholder=pv&&pv.kg!=null?String(pv.kg):"–";kgI.disabled=st.done;kgI.dataset.k=ei+":"+si+":kg";kgI.setAttribute("data-f","kg");
        if(st.sug&&!st.done)kgI.classList.add("sug");
        kgI.oninput=function(){st.kg=parseField(kgI.value,false);sugTouched();saveWorkoutSoon();};r.appendChild(kgI);}
      // Sobald man selbst tippt, ist der Satz kein Vorschlag mehr (Farbe weg).
      function sugTouched(){if(!st.sug)return;st.sug=false;Array.prototype.forEach.call(r.querySelectorAll("input.sug"),function(x){x.classList.remove("sug");});}
      var rpI=null,rpLI=null,rpRI=null;
      function syncUniReps(){var l=parseField(rpLI.value,true),rr=parseField(rpRI.value,true);st.reps=(l==null||rr==null)?null:Math.min(l,rr);saveWorkoutSoon();}
      var pvRepsHint=pv&&pv.reps!=null?String(pv.reps):"–";
      if(ex.uni){
        rpLI=document.createElement("input");rpLI.type="number";rpLI.inputMode="numeric";rpLI.step="1";rpLI.value=fieldVal(st.repsL!=null?st.repsL:st.reps);rpLI.placeholder=pv?String(pv.repsL!=null?pv.repsL:pv.reps):"–";rpLI.disabled=st.done;rpLI.dataset.k=ei+":"+si+":repsL";rpLI.setAttribute("data-f","repsL");
        if(st.sug&&!st.done)rpLI.classList.add("sug");
        rpLI.oninput=function(){st.repsL=parseField(rpLI.value,true);sugTouched();syncUniReps();};r.appendChild(rpLI);
        rpRI=document.createElement("input");rpRI.type="number";rpRI.inputMode="numeric";rpRI.step="1";rpRI.value=fieldVal(st.repsR!=null?st.repsR:st.reps);rpRI.placeholder=pv?String(pv.repsR!=null?pv.repsR:pv.reps):"–";rpRI.disabled=st.done;rpRI.dataset.k=ei+":"+si+":repsR";rpRI.setAttribute("data-f","repsR");
        if(st.sug&&!st.done)rpRI.classList.add("sug");
        rpRI.oninput=function(){st.repsR=parseField(rpRI.value,true);sugTouched();syncUniReps();};r.appendChild(rpRI);
      } else {
        rpI=document.createElement("input");rpI.type="number";rpI.inputMode="numeric";rpI.step="1";rpI.value=fieldVal(st.reps);rpI.placeholder=pvRepsHint;rpI.disabled=st.done;rpI.dataset.k=ei+":"+si+":reps";rpI.setAttribute("data-f","reps");
        if(st.sug&&!st.done)rpI.classList.add("sug");
        rpI.oninput=function(){st.reps=parseField(rpI.value,true);sugTouched();saveWorkoutSoon();};r.appendChild(rpI);
      }
      var rirBtn=el("button","wo-rir"+(st.done?" done":""));rirBtn.type="button";
      rirBtn.innerHTML='<b>'+rirText(st.rir!=null?st.rir:null)+'</b>';
      rirBtn.setAttribute("aria-label","Wiederholungen in Reserve für diesen Satz");
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
      r.appendChild(rirBtn);
      var ck=el("button","wo-check"+(st.done?" on":""));ck.type="button";ck.setAttribute("aria-label",st.done?"Satz zurücknehmen":"Satz abhaken");
      ck.innerHTML='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8.5 6 12l7.5-8"/></svg>';
      ck.onclick=function(ev){
        if(ev&&ev.preventDefault)ev.preventDefault();
        // Schutz gegen doppelt ausgelöste Tap-Events auf manchen Touchscreens/Webviews (z. B.
        // ghost click + echtes click-Event auf denselben Button) – ohne diese Sperre kann ein
        // einzelnes Antippen den Satz zweimal umschalten und Häkchen/Zähler auseinanderlaufen lassen.
        if(ck.dataset.busy)return;ck.dataset.busy="1";setTimeout(function(){ck.dataset.busy="";},400);
        try{var ae=document.activeElement;if(ae&&ae.tagName==="INPUT")ae.blur();}catch(e){}
        if(st.done){st.done=false;if(st.rec){removeRec(st.rec);st.rec=null;}ck.classList.remove("on");try{prOnUntick(st,r);}catch(e){}
          rirBtn.disabled=false;rirBtn.classList.remove("done");
          saveWorkout();renderLight();return;}
        var kg=kgI?(parseFloat(String(kgI.value).replace(",","."))||0):0;
        var repsL=ex.uni?(parseInt(rpLI.value,10)||0):null,repsR=ex.uni?(parseInt(rpRI.value,10)||0):null;
        var reps=ex.uni?Math.min(repsL,repsR):(parseInt(rpI.value,10)||0);
        // Ein leeres Gewichtsfeld wird nicht stillschweigend als 0 kg gespeichert - wer ohne
        // Zusatzgewicht trainiert, traegt bewusst 0 ein.
        if(kgI&&String(kgI.value).trim()===""){toast(ex.wt==="body"?"Zusatzgewicht eintragen (0 = ohne)":"Gewicht eintragen (0 = ohne Gewicht)");try{kgI.focus();}catch(e){}return;}
        if(reps<=0){toast(ex.t==="sec"?"Sekunden eintragen":"Wiederholungen eintragen");try{(ex.uni?rpLI:rpI).focus();}catch(e){}return;}
        ck.classList.add("on");
        st.kg=kg;st.reps=reps;st.done=true;if(ex.uni){st.repsL=repsL;st.repsR=repsR;}
        if(st.sug){st.sug=false;Array.prototype.forEach.call(r.querySelectorAll("input.sug"),function(x){x.classList.remove("sug");});}
        var rec={ex:ex.id,kg:kg,reps:reps,wid:workout.id,ts:Date.now()};if(ex.uni){rec.repsL=repsL;rec.repsR=repsR;}
        // Die Reserve steht schon vorher pro Satz fest (eigene Spalte) - beim Abhaken wird sie
        // nur noch in den gespeicherten Datensatz uebernommen, nicht mehr neu gesetzt.
        if(st.rir!=null)rec.rir=st.rir;
        rirBtn.disabled=true;rirBtn.classList.add("done");
        st.rec=rec;day(TODAY).sets.push(rec);touch(TODAY);
        try{prOnTick(ex,st,rec,r);}catch(e){}
        try{rankOnTick(ex,rec);}catch(e){}
        restAudioUnlock();
        if(we.restSec>0)restStart(we.restSec);
        saveWorkout();renderLight();tickWorkout();
      };
      r.appendChild(ck);rowsWrap.appendChild(r);
    });
    w.appendChild(tbl);
    // Begruendung des Vorschlags - solange noch vorgeschlagene Werte offen sind.
    if(we.sugWhy&&we.sets.some(function(x){return x.sug&&!x.done;})){
      var sw=el("p","wo-sugwhy");sw.appendChild(el("b",null,"Vorschlag: "));sw.appendChild(document.createTextNode(we.sugWhy));
      sw.title=we.sugWhy;sw.onclick=function(){toast(we.sugWhy);};w.appendChild(sw);
    }
    var btns=el("div","wo-setbtns");
    var rem=el("button","btn ghost","− Satz");
    rem.disabled=we.sets.length<2;
    rem.onclick=function(){
      var last=we.sets[we.sets.length-1];
      function doIt(){if(last&&last.done&&last.rec)removeRec(last.rec);
        we.sets.pop();saveWorkout();renderLight();}
      // Ein bereits abgehakter (gespeicherter) Satz enthält echte Trainingsdaten – der
      // versehentliche Verlust genau solcher Daten war der häufigste Kritikpunkt an
      // Konkurrenz-Apps. Ein leerer/offener letzter Satz kann dagegen gefahrlos sofort
      // entfernt werden, das braucht keine Rückfrage.
      if(last&&last.done)askConfirm("Letzten Satz entfernen?","Dieser Satz ist bereits abgehakt und gespeichert. Er wird unwiderruflich gelöscht.","Entfernen",doIt,true);
      else doIt();};
    var add=el("button","btn primary","+ Satz");
    add.onclick=function(){var last=we.sets[we.sets.length-1];
      var ns={kg:last?last.kg:0,reps:last?last.reps:8,done:false,rir:last&&last.rir!=null?last.rir:null};
      if(last&&last.sug)ns.sug=true;
      if(ex.uni){ns.repsL=last&&last.repsL!=null?last.repsL:ns.reps;ns.repsR=last&&last.repsR!=null?last.repsR:ns.reps;}
      we.sets.push(ns);saveWorkout();renderSession();};
    btns.appendChild(rem);btns.appendChild(add);w.appendChild(btns);
    // Was diese Übung trainiert – Figur plus Anteil je Muskel
    var wfigs=woFigs(ex);
    wfigs.classList.add("tap");
    wfigs.setAttribute("role","button");
    wfigs.setAttribute("tabindex","0");
    wfigs.setAttribute("aria-label","Beanspruchte Muskeln von "+ex.n+" gross anzeigen");
    wfigs.onclick=function(){pageExMuscles(ex);};
    w.appendChild(wfigs);
    w.appendChild(woMusLive(ex,wfigs));
    pager.appendChild(w);
  });
  pager.appendChild(woAddPage());
  box.appendChild(pager);

  if(woPage>workout.exercises.length)woPage=workout.exercises.length;
  if(woPage<0)woPage=0;
  var sT=null;
  pager.addEventListener("scroll",function(){
    woScrollT=Date.now();
    if(sT)return;
    sT=setTimeout(function(){sT=null;
      var wdt=pager.clientWidth||1,i=Math.round(pager.scrollLeft/wdt);
      if(i!==woPage){woPage=i;woDots();}
      woFillFigs();
    },90);
  },{passive:true});
  woGoto(woPage,false);woDots();woUpdate();
  requestAnimationFrame(function(){woGoto(woPage,false);woFillFigs();});
}
function prevSetsFor(exid){
  var days=Object.keys(state.days).filter(function(d){return d<TODAY;}).sort().reverse();
  for(var i=0;i<days.length;i++){var s=(state.days[days[i]].sets||[]).filter(function(x){return x.ex===exid;});if(s.length)return s;}
  return [];
}
/* ---- Trainings löschen ----
   Ein abgeschlossenes Training besteht aus dem Eintrag in day.workouts und den Sätzen,
   die während des Trainings geloggt wurden (sie tragen dessen wid). Beides wird entfernt –
   auch Sätze, die nach Mitternacht auf dem Folgetag gelandet sind. */
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
// Vorne/Hinten-Figur mit den an diesem Tag tatsächlich trainierten Muskeln (Primär kräftig,
// Sekundär heller) – dieselbe Einfärbung wie bei einer einzelnen Übung, nur über den ganzen Tag
// summiert. Nur sinnvoll, wenn an dem Tag überhaupt eine (nicht-Cardio-)Übung geloggt ist.
function dayFigs(dateKey){
  var wrap=el("div","day-figs");
  [["front","Vorne"],["back","Hinten"]].forEach(function(v){
    var col=el("div","day-fig");
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-day",dateKey);sv.setAttribute("data-view",v[0]);
    sv.setAttribute("role","img");sv.setAttribute("aria-label","Trainierte Muskeln, "+v[1]);
    col.appendChild(sv);col.appendChild(el("span",null,v[1]));
    wrap.appendChild(col);
  });
  return wrap;
}
function fillWorkoutFig(svg){
  if(svg.getAttribute("data-filled"))return;
  var dateKey=svg.getAttribute("data-day"),wid=svg.getAttribute("data-wid"),view=svg.getAttribute("data-view");
  if(!dateKey||!wid)return;
  var winv=setsInvolve(((state.days[dateKey]||{}).sets||[]).filter(function(s){return s.wid===wid;}));
  fw3dSnapInto(svg,"wo:"+dateKey+":"+wid+"|"+fw3dInvKey(winv),winv,view,false,null,"step",FT_SESSION);
}
function workoutFigs(dateKey,wid){
  var wrap=el("div","day-figs");
  [["front","Vorne"],["back","Hinten"]].forEach(function(v){
    var col=el("div","day-fig");
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-day",dateKey);sv.setAttribute("data-wid",wid);sv.setAttribute("data-view",v[0]);
    sv.setAttribute("role","img");sv.setAttribute("aria-label","Trainierte Muskeln, "+v[1]);
    col.appendChild(sv);col.appendChild(el("span",null,v[1]));
    wrap.appendChild(col);
  });
  return wrap;
}
function sheetWorkoutDetail(dateKey,wo){
  closeSheet(); // ersetzt den Bildschirm statt sich draufzustapeln, wie bei der Übungsdetailseite
  var page=$("exdpage");page.hidden=false;syncScrollLock();
  var head=$("exdpage-head");head.innerHTML="";
  var back=el("button","iconbtn");back.type="button";back.setAttribute("aria-label","Zurück");
  back.innerHTML=svgIcon(IC_CHEVLEFT,2.1);back.onclick=closeExPage;
  head.appendChild(back);
  head.appendChild(el("div","exdpage-title",wo.name));
  var hdel=el("button","iconbtn");hdel.setAttribute("aria-label","Training löschen");hdel.innerHTML=svgIcon(IC_TRASH,1.6);
  hdel.onclick=function(){closeExPage();confirmDeleteWorkout(dateKey,wo);};
  head.appendChild(hdel);
  var body=$("exdpage-body");body.innerHTML="";
  body.appendChild(el("p","note exd-meta",deDate(dateKey)));
  var g=el("div","wo-sum");
  [["Dauer",fmtDur(wo.dur)],["Übungen",wo.exs],["Sätze",wo.sets],["Volumen",(wo.vol||0)+" kg"]].forEach(function(pp){
    var c=el("div");c.innerHTML='<b class="num">'+pp[1]+'</b><span>'+pp[0]+'</span>';g.appendChild(c);
  });
  body.appendChild(g);
  var d=day(dateKey);
  var hasStrength=(d.sets||[]).some(function(s){return s.wid===wo.id&&exById(s.ex)&&exById(s.ex).t!=="cardio";});
  if(hasStrength){
    var figs=workoutFigs(dateKey,wo.id);
    body.appendChild(figs);
    Array.prototype.forEach.call(figs.querySelectorAll("svg[data-wid]"),fillWorkoutFig);
  }
  var list=el("div","card flush");
  var groups={},order=[];
  d.sets.forEach(function(s,i){if(s.wid!==wo.id)return;if(!groups[s.ex]){groups[s.ex]=[];order.push(s.ex);}groups[s.ex].push({s:s,i:i});});
  order.forEach(function(exid){
    var ex=exById(exid);if(!ex)return;
    var arr=groups[exid],r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,ex.n));
    var line=el("div","exd-hsets");
    arr.forEach(function(o){
      var chip=el("button","exd-hset",setLabel(ex,o.s));chip.type="button";
      chip.setAttribute("aria-label","Satz bearbeiten");
      chip.onclick=function(ev){ev.stopPropagation();
        sheetEditLoggedSet(ex,dateKey,o.i,function(){setTimeout(function(){sheetWorkoutDetail(dateKey,wo);},180);});
      };
      line.appendChild(chip);
    });
    m.appendChild(line);r.appendChild(m);
    var best=bestFor(exid,dateKey,WIN_STRENGTH);
    var tb=Math.max.apply(null,arr.map(function(o){return setValue(ex,o.s);}));
    if(best.best!=null&&tb>=best.best-0.01)r.appendChild(el("span","pill pr","Best"));
    list.appendChild(r);
  });
  (d.cardio||[]).forEach(function(c){if(c.wid!==wo.id)return;
    var ex=exById(c.ex),r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,ex?ex.n:c.ex));m.appendChild(el("span",null,c.min+" Minuten"+(c.km?" · "+c.km+" km":"")));
    r.appendChild(m);list.appendChild(r);
  });
  if(!list.children.length)list.appendChild(el("div","empty","Keine Sätze."));
  body.appendChild(list);
  page.querySelector(".exdpage-scroll").scrollTop=0;
}
/* Tages-Detail aus der Verlaufsliste: zeigt Trainings und Sätze des Tages, mit Löschen. */
function sheetDay(dateKey){
  openSheet(function(b){
    var d=day(dateKey);
    sheetTitle(b,dateKey===TODAY?"Heute":deDate(dateKey));
    var hasStrength=(d.sets||[]).some(function(s){var ex=exById(s.ex);return ex&&ex.t!=="cardio";});
    if(hasStrength){
      b.appendChild(dayFigs(dateKey));
      Array.prototype.forEach.call(b.querySelectorAll("svg[data-day]"),fillDayFig);
    }
    var list=el("div","card flush");list.style.margin="0 -16px";
    (d.workouts||[]).forEach(function(wo){
      var r=el("div","row"),m=el("div","main");
      m.appendChild(el("b",null,wo.name));m.appendChild(el("span",null,fmtDur(wo.dur)+" · "+wo.exs+" Übungen · "+wo.sets+" Sätze"+(wo.vol?" · "+wo.vol+" kg":"")));
      r.appendChild(m);
      var del=el("button","iconbtn");del.setAttribute("aria-label","Training löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      del.onclick=function(){closeSheet();confirmDeleteWorkout(dateKey,wo);};r.appendChild(del);list.appendChild(r);
    });
    var groups={},order=[];
    (d.sets||[]).forEach(function(st){if(!groups[st.ex]){groups[st.ex]=[];order.push(st.ex);}groups[st.ex].push(st);});
    // Jeder Satz ist antippbar – so lassen sich Gewicht/Wdh. auch für vergangene Trainingstage
    // direkt hier nachträglich korrigieren, ohne über den Übungskatalog gehen zu müssen.
    order.forEach(function(exid){var ex=exById(exid);if(!ex)return;
      var r=el("div","row"),m=el("div","main");m.appendChild(el("b",null,ex.n));
      var line=el("div","exd-hsets");
      groups[exid].forEach(function(st){
        var idx=(d.sets||[]).indexOf(st);
        var chip=el("button","exd-hset",setLabel(ex,st));chip.type="button";
        chip.setAttribute("aria-label","Satz bearbeiten");
        chip.onclick=function(ev){ev.stopPropagation();
          sheetEditLoggedSet(ex,dateKey,idx,function(){setTimeout(function(){sheetDay(dateKey);},180);});
        };
        line.appendChild(chip);
      });
      m.appendChild(line);
      r.appendChild(m);list.appendChild(r);});
    (d.cardio||[]).forEach(function(c){var ex=exById(c.ex),r=el("div","row"),m=el("div","main");
      m.appendChild(el("b",null,ex?ex.n:c.ex));m.appendChild(el("span",null,c.min+" Minuten"+(c.km?" · "+c.km+" km":"")));r.appendChild(m);list.appendChild(r);});
    if(!list.children.length)list.appendChild(el("div","empty","Keine Einträge."));
    b.appendChild(list);
    if((d.sets||[]).length||(d.cardio||[]).length||(d.workouts||[]).length){
      var all=el("button","btn ghost block","Alle Einträge dieses Tages löschen");all.style.marginTop="14px";
      all.onclick=function(){closeSheet();askConfirm("Tag leeren?","Alle Sätze, Ausdauer-Einträge und Trainings vom "+deDate(dateKey)+" werden entfernt. Die Notiz bleibt.","Alles löschen",function(){deleteDay(dateKey);},true);};
      b.appendChild(all);
    }
  });
}
function removeRec(rec){var sets=day(TODAY).sets;for(var k=sets.length-1;k>=0;k--){if(sets[k]===rec||(rec.ts&&sets[k].ts===rec.ts)){sets.splice(k,1);break;}}touch(TODAY);}
/* Die Vorlage so beschreiben, wie das Training tatsaechlich gelaufen ist: Reihenfolge und
   Uebungen aus dem Training, Saetze aus der Anzahl der Zeilen, Wiederholungen/Gewicht aus
   dem zuletzt abgehakten Satz (sonst aus dem letzten eingetragenen). Ausdauer bleibt aussen
   vor - eine Vorlage kennt nur Uebung/Saetze/Wdh./kg. */
/* Pausenzeit im Training aendern - fuer diese eine Uebung oder gleich fuer alle. "Fuer alle"
   gilt auch fuer Uebungen, die spaeter noch dazukommen (workout.restDefault). */
function sheetRestSec(we){
  openSheet(function(b){
    sheetTitle(b,"Pause nach jedem Satz");
    var f=numField("Sekunden",we.restSec,"15",0);b.appendChild(f);
    function val(){var v=parseFloat(String(f.input.value).replace(",","."));if(!isFinite(v))v=we.restSec;return clamp(Math.round(v),0,600);}
    var multi=workout.exercises.filter(function(x){return x.sets;}).length>1;
    var all=el("button","btn primary block",multi?"Für alle Übungen":"Übernehmen");all.type="button";all.style.marginTop="14px";
    all.onclick=function(){var v=val();
      workout.exercises.forEach(function(x){if(x.sets)x.restSec=v;});workout.restDefault=v;
      closeSheet();saveWorkout();renderSession();if(multi)toast("Pause "+v+" s für alle Übungen");};
    b.appendChild(all);
    if(multi){
      var one=el("button","btn ghost block","Nur für diese Übung");one.type="button";one.style.marginTop="8px";
      one.onclick=function(){we.restSec=val();closeSheet();saveWorkout();renderSession();};
      b.appendChild(one);
    }
  });
}
function workoutRoutine(){
  if(!workout||!state.routines)return null;
  if(workout.routineId&&state.routines[workout.routineId])return state.routines[workout.routineId];
  var nm=String(workout.name||"").trim().toLowerCase();
  if(!nm)return null;
  for(var k in state.routines){
    var r=state.routines[k];
    if(r&&String(r.name||"").trim().toLowerCase()===nm){workout.routineId=r.id||k;return r;}
  }
  return null;
}
function routineItemsFromWorkout(){
  var items=[],tpl=workoutRoutine(),usedTpl=[];
  // Passender Eintrag in der bisherigen Vorlage (gleiche Uebung, jeder nur einmal).
  function tplItem(exId){
    if(!tpl||!Array.isArray(tpl.items))return null;
    for(var i=0;i<tpl.items.length;i++){var t=tpl.items[i];if(t&&t.ex===exId&&usedTpl.indexOf(i)<0){usedTpl.push(i);return t;}}
    return null;
  }
  workout.exercises.forEach(function(we){
    if(!we.sets||!we.sets.length)return;
    var ex=exById(we.ex);if(!ex)return;
    var src=null;
    for(var i=we.sets.length-1;i>=0&&!src;i--)if(we.sets[i].done)src=we.sets[i];
    if(!src)src=we.sets[we.sets.length-1];
    // Vorgaben bleiben, was sie waren: War Wdh./Gewicht in der Vorlage leer (oder kam die Uebung
    // erst im Training dazu), bleibt es leer - sonst stuenden nach dem ersten "Ja, anpassen"
    // wieder feste Zahlen in der Vorlage, die man nie bewusst eingetragen hat.
    var t=tplItem(we.ex);
    items.push({ex:we.ex,
      sets:clamp(we.sets.length,1,12),
      reps:(t&&tplReps(t.reps)!=null&&tplReps(src.reps)!=null)?tplReps(src.reps):null,
      kg:(ex.t==="load"&&t&&tplKg(t.kg)!=null&&tplKg(src.kg)!=null)?tplKg(src.kg):null});
  });
  return items;
}
function routineDiffers(r,items){
  if(!r||!Array.isArray(r.items)||r.items.length!==items.length)return true;
  if(workout&&workout.restDefault!=null&&workout.restDefault!==routineRest(r))return true;
  for(var i=0;i<items.length;i++){
    var a=r.items[i],b=items[i];
    if(!a||a.ex!==b.ex||(a.sets|0)!==(b.sets|0)||tplReps(a.reps)!==tplReps(b.reps)||tplKg(a.kg)!==tplKg(b.kg))return true;
  }
  return false;
}
/* Kurz benennen, was sich geaendert hat - ohne das muesste man die Vorlage erst oeffnen,
   um zu sehen, worauf man sich da einlaesst. */
function routineChangeSummary(r,items){
  var out=[],oldIds=r.items.map(function(i){return i.ex;}),newIds=items.map(function(i){return i.ex;});
  var added=newIds.filter(function(x){return oldIds.indexOf(x)<0;}).length;
  var removed=oldIds.filter(function(x){return newIds.indexOf(x)<0;}).length;
  if(added)out.push(added===1?"1 Übung dazu":added+" Übungen dazu");
  if(removed)out.push(removed===1?"1 Übung weniger":removed+" Übungen weniger");
  var keptOld=oldIds.filter(function(x){return newIds.indexOf(x)>=0;}).join(",");
  var keptNew=newIds.filter(function(x){return oldIds.indexOf(x)>=0;}).join(",");
  if(keptOld!==keptNew)out.push("andere Reihenfolge");
  var nSets=0,nVals=0;
  items.forEach(function(it){
    var o=null;
    for(var i=0;i<r.items.length&&!o;i++)if(r.items[i].ex===it.ex)o=r.items[i];
    if(!o)return;
    if((o.sets|0)!==(it.sets|0))nSets++;
    if(tplReps(o.reps)!==tplReps(it.reps)||tplKg(o.kg)!==tplKg(it.kg))nVals++;
  });
  if(nSets)out.push(nSets===1?"1× andere Satzzahl":nSets+"× andere Satzzahl");
  if(workout&&workout.restDefault!=null&&workout.restDefault!==routineRest(r))out.push("Pause "+workout.restDefault+" s");
  if(nVals)out.push(nVals===1?"1× andere Vorgabe":nVals+"× andere Vorgaben");
  return out.join(" · ");
}
function finishWorkout(){
  if(!workout)return;
  var done=0,vol=0,exs=0,prs=[];
  workout.exercises.forEach(function(we){var ex=exById(we.ex),any=false;
    if(!we.sets)return;
    we.sets.forEach(function(st){if(!st.done)return;any=true;done++;if(ex.t==="load")vol+=effectiveKg(ex,st.kg)*st.reps;});
    if(any)exs++;
  });
  var dur=woElapsed();
  var cardioMin=0;(day(TODAY).cardio||[]).forEach(function(c){if(c.wid===workout.id)cardioMin+=c.min;});
  openSheet(function(b){
    sheetTitle(b,"Training beenden");
    var g=el("div","wo-sum");
    var stats=[["Dauer",fmtDur(dur)],["Übungen",exs],["Sätze",done],["Volumen",Math.round(vol)+" kg"]];
    if(cardioMin>0)stats.push(["Ausdauer",Math.round(cardioMin)+" min"]);
    stats.forEach(function(p){
      var c=el("div");c.innerHTML='<b class="num">'+p[1]+'</b><span>'+p[0]+'</span>';g.appendChild(c);});
    b.appendChild(g);
    prs=workoutPrs();
    if(prs.length){
      var pr=el("div","wo-prsum");
      var nRec=0;prs.forEach(function(x){nRec+=x.list.length;});
      var hd=el("div","wo-prsum-h");hd.innerHTML=IC_MEDAL;hd.appendChild(el("b",null,nRec===1?"1 Rekord":nRec+" Rekorde"));pr.appendChild(hd);
      var ul=el("ul");prs.forEach(function(x){var li=el("li");li.appendChild(el("b",null,x.ex.n));
        x.list.forEach(function(p){var ln=el("span","wo-prsum-l");ln.setAttribute("data-t",p.t);ln.appendChild(el("span",null,p.txt));if(p.delta)ln.appendChild(el("i","pr-chip",p.delta));li.appendChild(ln);});
        ul.appendChild(li);});
      pr.appendChild(ul);b.appendChild(pr);
    }
    if(!done&&!cardioMin)b.appendChild(el("p","note","Noch kein Satz abgehakt. Beenden verwirft das Training."));
    // Kam das Training aus einer Vorlage und sieht es am Ende anders aus als die Vorlage,
    // wird gefragt, ob die Vorlage diesen Stand uebernehmen soll. Voreinstellung ist "Nein":
    // eine Vorlage ungefragt umzuschreiben waere die unangenehmere Ueberraschung.
    var rtUpd=false,rt=workoutRoutine();
    var rtItems=rt?routineItemsFromWorkout():null;
    if(rt&&rtItems&&rtItems.length&&routineDiffers(rt,rtItems)&&(done||cardioMin)){
      var box=el("div","rt-ask");
      box.appendChild(el("b",null,"Vorlage „"+rt.name+"“ anpassen?"));
      var chg=routineChangeSummary(rt,rtItems);
      box.appendChild(el("span",null,"Dieses Training weicht von der Vorlage ab"+(chg?": "+chg:"")+
        ". Soll die Vorlage künftig so aussehen wie dieses Training?"));
      var row=el("div","rt-ask-row");
      var yes=el("button","fchip","Ja, anpassen"),no=el("button","fchip","Nein, so lassen");
      function pick(v){rtUpd=v;yes.setAttribute("aria-pressed",v?"true":"false");no.setAttribute("aria-pressed",v?"false":"true");}
      yes.onclick=function(){pick(true);};no.onclick=function(){pick(false);};
      pick(false);
      row.appendChild(yes);row.appendChild(no);box.appendChild(row);
      b.appendChild(box);
    }
    var ok=el("button","btn primary block",(done||cardioMin)?"Speichern & beenden":"Verwerfen");ok.style.marginTop="14px";
    ok.onclick=function(){
      if(done||cardioMin){var d=day(TODAY);d.workouts=d.workouts||[];
        d.workouts.push({id:workout.id,name:workout.name,start:workout.startedAt,dur:Math.round(dur),sets:done,exs:exs,vol:Math.round(vol),cardioMin:Math.round(cardioMin)});touch(TODAY);}
      if(rtUpd&&rt&&rtItems&&rtItems.length){
        rt.items=rtItems;
        if(workout.restDefault!=null&&workout.restDefault!==routineRest(rt))rt.rest=(workout.restDefault===defaultRest())?null:workout.restDefault;
        state.routines[rt.id]=rt;state.dirtyRoutines[rt.id]=true;persist();
        toast("Vorlage „"+rt.name+"“ angepasst");
      }
      workout=null;saveWorkout();closeSheet();renderAll();
    };
    b.appendChild(ok);
    var back=el("button","btn ghost block","Weiter trainieren");back.style.marginTop="8px";back.onclick=closeSheet;b.appendChild(back);
  });
}
function bestExcludingWorkout(ex){
  var best=null;
  for(var d in state.days){(state.days[d].sets||[]).forEach(function(s){if(s.ex!==ex.id||s.wid===workout.id)return;var v=setValue(ex,s);if(best==null||v>best)best=v;});}
  return best;
}
function startSession(id){startWorkout(id);}
$("btn-session-end").addEventListener("click",finishWorkout);
