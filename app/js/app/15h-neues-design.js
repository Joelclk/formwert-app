/* ==========================================================
   app/15h-neues-design.js - Neues Design (Oktober 2026): Heute-Karte, Ränge-Tab mit Rangkarten,
   schwebende Leiste für ein laufendes Training, Formwert-Leiste, Erscheinungsbild-Schalter.
   Vorbild: Klarheit von Arrow, Anatomie-Qualität von Lyfta, Rang-Emotion von Liftoff
   (siehe Projekt-Doku "Formwert_Design_Referenzen.md").
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Erscheinungsbild =================
   Standard ist dunkel: die Muskelfigur, die Rangwappen und der Kupfer-Akzent wirken auf
   dunklem Grund am stärksten. Wer hell will, stellt es in "Du" um. Gespeichert nur auf diesem
   Gerät (localStorage), weil es eine Geräte-Vorliebe ist und nicht zum Trainingskonto gehört. */
function fwTheme(){try{return localStorage.getItem("fw-theme")||"dark";}catch(e){return "dark";}}
function fwSetTheme(v){
  try{localStorage.setItem("fw-theme",v);}catch(e){}
  var r=document.documentElement;
  if(v==="dark"||v==="light")r.setAttribute("data-theme",v);else r.removeAttribute("data-theme");
  // Figuren und Balken lesen ihre Farben beim Zeichnen aus den CSS-Variablen – neu zeichnen.
  try{secDirty.koerper=true;secDirty.werte=true;secDirty.training=true;secDirty.raenge=true;renderAll();}catch(e){}
  try{renderSettings();}catch(e){}
}
(function(){
  var orig=renderSettings;
  renderSettings=function(){
    orig();
    var box=$("settings");if(!box)return;
    var row=el("div","row fw-theme-row"),m=el("div","main");
    m.appendChild(el("b",null,"Erscheinungsbild"));
    m.appendChild(el("span",null,"Gilt nur auf diesem Gerät"));
    row.appendChild(m);
    var seg=el("div","fw-seg");seg.setAttribute("role","group");seg.setAttribute("aria-label","Erscheinungsbild");
    var cur=fwTheme();
    [["dark","Dunkel"],["light","Hell"],["auto","System"]].forEach(function(o){
      var b=el("button",null,o[1]);b.type="button";b.setAttribute("aria-pressed",String(cur===o[0]));
      b.onclick=function(){fwSetTheme(o[0]);};seg.appendChild(b);
    });
    row.appendChild(seg);
    box.insertBefore(row,box.firstChild);
  };
})();

/* ================= Formwert-Leiste =================
   Erkennungszeichen der App: schräge Striche statt eines glatten Balkens, der letzte gefüllte
   Strich leuchtet. Wird überall dort benutzt, wo Fortschritt zu einem Ziel gezeigt wird. */
function fwTicks(p,n,col){
  var w=el("div","fw-ticks");w.setAttribute("aria-hidden","true");
  n=n||20;var f=Math.round(clamp(p,0,1)*n);
  if(col)w.style.setProperty("--tc",col);
  for(var i=0;i<n;i++){w.appendChild(el("i",i<f?(i===f-1?"on lead":"on"):null));}
  return w;
}
(function(){
  var orig=renderHero;
  renderHero=function(c,pk){
    orig(c,pk);
    var hv=document.querySelector("#hero .hero-main");if(!hv)return;
    var old=hv.querySelector(".fw-ticks");if(old)old.remove();
    var t=fwTicks((c.fitness||0)/100,24);
    var meta=hv.querySelector(".hero-meta");
    if(meta)hv.insertBefore(t,meta);else hv.appendChild(t);
  };
})();

/* Geschätzte Dauer einer Einheit: je Satz Arbeitszeit plus Pause. Arbeitszeit 1 min je Satz,
   bei einseitigen Übungen (links und rechts nacheinander) 2 min. Die Pause ist die eingestellte
   Satzpause der Übung, sonst die der Einheit, sonst die aus den Einstellungen - dieselbe
   Reihenfolge wie beim Starten (startWorkout). Nach dem allerletzten Satz keine Pause mehr. */
function fwRoutineMinutes(r){
  var sec=0,lastRest=0;
  (r.items||[]).forEach(function(it){
    var ex=exById(it.ex);if(!ex)return;
    if(ex.t==="cardio"){sec+=((it.min!=null&&it.min>0)?it.min:20)*60;lastRest=0;return;}
    var n=it.sets||0,rest=(it.rest!=null&&it.rest>=0)?it.rest:routineRest(r),work=ex.uni?120:60;
    sec+=n*(work+rest);if(n)lastRest=rest;
  });
  sec-=lastRest;
  return Math.max(1,Math.round(sec/60));
}
/* Erholung der Muskelgruppen, die die Einheit trifft: je Region der langsamste Muskel zählt.
   Alles erholt -> grüner Haken "Brust erholt", sonst Uhr mit Restzeit "Rücken in 18 Std.". */
function fwRecoveryChips(items){
  var fo=routineFocus(items),out=[];
  fwRegionsOf(items).forEach(function(name){
    var rg=REGIONS.filter(function(x){return x.name===name;})[0];if(!rg)return;
    var left=0;
    (rg.ids||[]).forEach(function(id){if(!(fo.sets[id]>0))return;var m=muscleById(id),rv=m&&recoveryOf(m);if(rv&&rv.left>left)left=rv.left;});
    out.push(left>0.5?{ok:false,t:name+" in "+recHours(left)}:{ok:true,t:name+" erholt"});
  });
  return out;
}

/* ================= Heute-Karte =================
   Ganz oben auf "Heute": genau eine Sache, die jetzt dran ist, mit einem großen Knopf.
   Reihenfolge der Fälle wie bei renderHeroNext(): laufendes Training > Training > Mobilität > fertig.
   Die nächste Einheit ist die, die in deiner Reihenfolge auf die zuletzt gemachte folgt. */
/* ================= Mein Plan =================
   Nicht jede angelegte Einheit gehört in die Reihenfolge - viele sind alte Vorlagen oder kommen
   nur selten dran. Der Plan sind die 3-4 Einheiten, die man wirklich im Wechsel trainiert, in
   fester Reihenfolge. Gespeichert direkt an der Einheit (routine.plan = Platz 0, 1, 2 ...), damit
   er mit den Einheiten in die Cloud geht. "Überspringen" merkt sich die übersprungene Einheit im
   Profil (profile.planSkip), bis wieder eine Plan-Einheit trainiert wurde. */
function fwPlanIds(){
  return Object.keys(state.routines||{}).filter(function(id){var r=state.routines[id];return r&&typeof r.plan==="number";})
    .sort(function(a,b){return state.routines[a].plan-state.routines[b].plan;});
}
function fwPlanLast(plan){
  // Zuletzt trainierte Plan-Einheit (Datum) - andere Einheiten dazwischen zählen nicht.
  var last=routineLastUse(),best=-1,bestD="";
  plan.forEach(function(id,i){var r=state.routines[id],lu=r&&last[r.name];if(lu&&lu.d>=bestD){bestD=lu.d;best=i;}});
  return {i:best,d:bestD};
}
function fwNextRoutine(){
  var plan=fwPlanIds();
  if(plan.length){
    var L=fwPlanLast(plan),nx=plan[(L.i+1)%plan.length];
    var sk=state.profile&&state.profile.planSkip;
    // Übersprungen wird ab der zuletzt trainierten Plan-Einheit; nach dem nächsten Training gilt wieder die Reihenfolge.
    if(sk&&sk.after===L.d&&sk.n>0)nx=plan[(L.i+1+sk.n)%plan.length];
    return nx;
  }
  // Ohne Plan: nur Einheiten der letzten 4 Wochen im Wechsel, sonst die erste.
  var ids=routineIds();if(!ids.length)return null;
  var rec=fwPlanSuggest();if(rec.length)ids=rec;
  var last=routineLastUse(),best=-1,bestD="";
  ids.forEach(function(id,i){var r=state.routines[id],lu=r&&last[r.name];if(lu&&lu.d>=bestD){bestD=lu.d;best=i;}});
  return ids[(best+1)%ids.length];
}
function fwPlanSkip(){
  var plan=fwPlanIds();if(!plan.length||!state.profile)return;
  var L=fwPlanLast(plan),sk=state.profile.planSkip;
  var n=(sk&&sk.after===L.d?sk.n:0)+1;if(n>=plan.length)n=0;
  state.profile.planSkip={after:L.d,n:n};persist();renderAll();
}
/* Vorschlag für einen Plan: die Einheiten, die in den letzten 4 Wochen trainiert wurden, in der
   Reihenfolge, in der sie zuletzt drankamen (älteste zuerst) - höchstens fünf. */
function fwPlanSuggest(){
  var from=shiftDays(TODAY,-27),seen={},order=[];
  Object.keys(state.days).filter(function(k){return k>=from&&k<=TODAY;}).sort().forEach(function(k){
    (state.days[k].workouts||[]).forEach(function(wo){if(wo&&wo.name)seen[wo.name]=k;});});
  Object.keys(state.routines||{}).forEach(function(id){var r=state.routines[id];if(r&&seen[r.name])order.push(id);});
  order.sort(function(a,b){var x=seen[state.routines[a].name],y=seen[state.routines[b].name];return x<y?-1:x>y?1:0;});
  return order.slice(-5);
}
function fwSetPlan(ids){
  Object.keys(state.routines).forEach(function(id){
    var r=state.routines[id],want=ids.indexOf(id);
    if(want>=0){if(r.plan!==want){r.plan=want;state.dirtyRoutines[id]=true;}}
    else if(typeof r.plan==="number"){delete r.plan;state.dirtyRoutines[id]=true;}
  });
  if(state.profile&&state.profile.planSkip){delete state.profile.planSkip;}
  persist();secDirty.training=true;renderAll();try{renderRoutines();}catch(e){}
}
function sheetPlan(){
  var plan=fwPlanIds();if(!plan.length)plan=fwPlanSuggest();
  var sel=plan.slice();
  openSheet(function(b){
    sheetTitle(b,"Mein Plan");
    b.appendChild(el("p","note","Wähl die Einheiten, die du im Wechsel trainierst, und bring sie in deine Reihenfolge. Alles andere steht unter „Weitere Einheiten“ und lässt sich trotzdem jederzeit starten."));
    var list=el("div","fw-plan-list");b.appendChild(list);
    function draw(){
      list.innerHTML="";
      var all=sel.concat(routineIds().filter(function(id){return sel.indexOf(id)<0;}));
      all.forEach(function(id,ai){
        var r=state.routines[id];if(!r)return;var k=sel.indexOf(id),on=k>=0;
        if(ai===0&&on)list.appendChild(el("div","fw-plan-h","Im Plan · in dieser Reihenfolge"));
        if(!on&&(ai===0||sel.indexOf(all[ai-1])>=0))list.appendChild(el("div","fw-plan-h","Nicht im Plan"));
        var row=el("div","fw-plan-row"+(on?" on":""));
        var tg=el("button","fw-plan-tg");tg.type="button";tg.setAttribute("aria-pressed",String(on));
        tg.innerHTML=on?'<b>'+(k+1)+'</b>':svgIcon("M12 5v14M5 12h14",2.2);
        tg.setAttribute("aria-label",on?r.name+" aus dem Plan nehmen":r.name+" in den Plan");
        tg.onclick=function(){if(on)sel.splice(k,1);else sel.push(id);draw();};
        row.appendChild(tg);
        var tx=el("div","fw-plan-tx");tx.appendChild(el("b",null,r.name));tx.appendChild(el("span",null,r.items.length+" Übungen"));row.appendChild(tx);
        if(on){
          var up=el("button","iconbtn");up.type="button";up.setAttribute("aria-label",r.name+" nach oben");up.innerHTML=svgIcon("M12 19V5M5 12l7-7 7 7",2);up.disabled=k===0;
          up.onclick=function(){var t=sel[k-1];sel[k-1]=id;sel[k]=t;draw();};
          var dn=el("button","iconbtn");dn.type="button";dn.setAttribute("aria-label",r.name+" nach unten");dn.innerHTML=svgIcon("M12 5v14M5 12l7 7 7-7",2);dn.disabled=k===sel.length-1;
          dn.onclick=function(){var t=sel[k+1];sel[k+1]=id;sel[k]=t;draw();};
          var rm=el("button","iconbtn fw-plan-rm");rm.type="button";rm.setAttribute("aria-label",r.name+" aus dem Plan nehmen");rm.innerHTML=svgIcon("M6 6l12 12M18 6L6 18",2.2);
          rm.onclick=function(){sel.splice(k,1);draw();};
          row.appendChild(up);row.appendChild(dn);row.appendChild(rm);
        }else{
          var ad=el("button","fw-plan-add","Aufnehmen");ad.type="button";ad.onclick=function(){sel.push(id);draw();};row.appendChild(ad);
        }
        list.appendChild(row);
      });
    }
    draw();
    var save=el("button","btn primary block","Plan speichern");save.style.marginTop="14px";
    save.onclick=function(){fwSetPlan(sel);closeSheet();toast(sel.length?"Plan gespeichert":"Plan entfernt");};
    b.appendChild(save);
  });
}
function fwRegionsOf(items){
  // Die zwei bis drei am stärksten beanspruchten Körperregionen einer Einheit, als kurze Überschrift.
  var fo=routineFocus(items),reg={};
  REGIONS.forEach(function(rg){var v=0;(rg.ids||[]).forEach(function(id){v+=fo.sets[id]||0;});if(v>0)reg[rg.name]=v;});
  return Object.keys(reg).sort(function(a,b){return reg[b]-reg[a];}).slice(0,3);
}
function renderHeuteKarte(){
  var box=$("heute-karte");if(!box||!state.profile)return;
  box.innerHTML="";box.className="heute-karte";
  var viewingToday=heuteDate===TODAY;
  if(!viewingToday&&!workout){box.hidden=true;return;}
  box.hidden=false;
  var d=state.days[TODAY]||emptyDay();
  var trained=isTrainDay(d)||(d.workouts||[]).some(function(wo){return !(d.sets||[]).some(function(s){return s.wid===wo.id;});});
  var mobDone=mobDay(d).units>=1,w=weekStats(TODAY),goal=state.profile.goals.days||0;
  var eye="",title="",sub="",btn=null,fig=null,chips=[];
  if(workout){
    var done=0,tot=0;workout.exercises.forEach(function(we){(we.sets||[]).forEach(function(st){tot++;if(st.done)done++;});});
    box.classList.add("live");
    eye="Training läuft";title=workout.name;sub=done+" von "+tot+" Sätzen";
    btn=["Weitermachen",function(){selectTab("tab-training");window.scrollTo(0,0);}];
  }else if(!trained){
    var rid=fwNextRoutine(),r=rid?state.routines[rid]:null;
    eye=w.train<goal?"Heute dran":"Wochenziel erreicht";
    if(r){
      // Wie in der Vorschau: oben der Name der Einheit, groß die Muskeln, die sie trifft.
      eye+=" · "+r.name;
      var pl=fwPlanIds(),pidx=pl.indexOf(rid);if(pidx>=0&&pl.length>1)eye+=" · "+(pidx+1)+"/"+pl.length;
      var regs=fwRegionsOf(r.items);
      title=regs.length?regs.join(", "):r.name;
      var nSets=r.items.reduce(function(a,i){return a+(i.sets||0);},0);
      sub=r.items.length+" Übungen · "+nSets+" Sätze · ca.\u00a0"+fwRoutineMinutes(r)+"\u00a0min";
      chips=fwRecoveryChips(r.items);
      var fo=routineFocus(r.items);
      if(fo.max>0){fig=document.createElementNS("http://www.w3.org/2000/svg","svg");fig.setAttribute("viewBox","0 0 800 1500");fig._sets=fo.sets;}
      btn=["Training starten",function(){startSession(rid);}];
    }else{
      title=w.train<goal?"Zeit fürs Training":"Zusatztraining oder Erholung";
      sub="Leg eine Einheit an oder trainiere frei – jeder Satz zählt.";
      btn=["Training starten",function(){selectTab("tab-training");window.scrollTo(0,0);}];
    }
  }else if(!mobDone){
    eye="Training erledigt";title="Noch ein paar Minuten Mobilität";sub="Rundet den Tag ab und zählt für deinen Formwert.";
    btn=["Mobilität eintragen",function(){sheetMob();}];box.classList.add("calm");
  }else{
    eye="Alles erledigt";title="Stark gemacht heute";sub="Training und Mobilität sind drin. Morgen geht’s weiter.";
    box.classList.add("done");
  }
  var top=el("div","hk-top"),tx=el("div","hk-tx");
  tx.appendChild(el("span","hk-eye",eye));
  tx.appendChild(el("h2","hk-title",title));
  if(sub){var sp=el("span","hk-sub",sub);if(workout){var t=el("b","num hk-time",fmtDur(woElapsed()));t.id="hk-time";sp.appendChild(document.createTextNode(" · "));sp.appendChild(t);}tx.appendChild(sp);}
  if(chips.length){var cw=el("div","hk-chips");chips.forEach(function(c){
    if(typeof c==="string"){cw.appendChild(el("span","hk-chip",c));return;}
    var ch=el("span","hk-rec"+(c.ok?" ok":" wait"));ch.innerHTML=c.ok?svgIcon("M5 12.5l4.5 4.5L19 7.5",2.6):svgIcon("M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",2.2);
    ch.appendChild(document.createTextNode(c.t));cw.appendChild(ch);});tx.appendChild(cw);}
  top.appendChild(tx);
  if(fig){var fw=el("div","hk-fig");fw.setAttribute("aria-hidden","true");fw.appendChild(fig);top.appendChild(fw);}
  box.appendChild(top);
  if(btn){
    var b=el("button","btn primary block fw-go");b.type="button";
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.4-6.8c.6-.4.6-1.3 0-1.7L9.6 4.4C8.9 3.9 8 4.4 8 5.2z" fill="currentColor"/></svg>';
    b.appendChild(document.createTextNode(btn[0]));b.onclick=btn[1];box.appendChild(b);
  }
  // Nicht nach Plan heute? Eine Einheit weiterspringen, ohne die Reihenfolge zu verändern.
  if(!workout&&!trained&&viewingToday&&fwPlanIds().length>1){
    var sk=el("button","hk-skip","Überspringen – nächste Einheit im Plan");sk.type="button";sk.onclick=fwPlanSkip;box.appendChild(sk);}
  if(fig)requestAnimationFrame(function(){try{drawMini(fig,"front",fig._sets);}catch(e){}});
}

/* ================= Heute: zwei kleine Karten unter der Heute-Karte =================
   Wie in der Vorschau: links der Formwert (Zahl, Trend, Formwert-Leiste, Punkte bis zur
   nächsten Stufe), rechts die Woche als Ring. Darunter die bestehende "Nächstes Ziel"-Karte.
   Die große Formwert-Karte mit Ring und Teilwerten und der Wochenkalender-Block entfallen auf
   "Heute" - die Teilwerte stehen ausführlich in "Du", die Woche steht oben als Leiste. */
var FW_LEVELS=[30,50,70,85,100];
function fwHeuteCards(){
  var sec=$("p-heute");if(!sec||!state.profile)return;
  var box=$("fw-hcards");
  if(!box){box=el("div","fw-hcards");box.id="fw-hcards";var hk=$("heute-karte");sec.insertBefore(box,hk?hk.nextSibling:sec.firstChild);}
  box.innerHTML="";
  var c=heuteDate===TODAY&&lastC?lastC:compute(heuteDate),v=Math.round(c.fitness||0);
  var prev=0;try{prev=Math.round(compute(shiftDays(heuteDate,-14)).fitness||0);}catch(e){}
  var df=v-prev;
  // Formwert
  var a=el("button","fw-hc fw-hc-fit");a.type="button";a.setAttribute("aria-label","Dein Formwert "+v+" von 100, Details in Du");
  a.appendChild(el("span","fw-hc-eye","Dein Formwert"));
  var row=el("div","fw-hc-val");row.appendChild(el("b","num",String(v)));
  if(df)row.appendChild(el("span","fw-hc-tr "+(df>0?"up":"down"),(df>0?"▲ ":"▼ ")+Math.abs(df)));
  a.appendChild(row);a.appendChild(fwTicks(v/100,18));
  var nx=FW_LEVELS.filter(function(x){return x>v;})[0];
  a.appendChild(el("span","fw-hc-sub",nx?(nx-v)+(nx-v===1?" Punkt":" Punkte")+" bis "+nx:"Topform erreicht"));
  a.onclick=function(){selectTab("tab-werte");window.scrollTo(0,0);};
  box.appendChild(a);
  // Woche
  var w=weekStats(heuteDate),g=state.profile.goals||{},gd=g.days||0,p=gd?clamp(w.train/gd,0,1):0;
  var b=el("div","fw-hc fw-hc-week");
  b.appendChild(el("span","fw-hc-eye","Diese Woche"));
  var wr=el("div","fw-hc-wrow"),ring=el("div","fw-ring");ring.style.setProperty("--p",Math.round(p*100)+"%");
  ring.appendChild(el("b",null,w.train+"/"+gd));wr.appendChild(ring);
  wr.appendChild(el("span",null,"Trainings­tage geschafft"));b.appendChild(wr);
  var extra=[];if(g.mob)extra.push("Mobilität "+fmtMobUnits(w.mob)+"/"+g.mob);if(g.cardio)extra.push("Ausdauer "+Math.round(w.cardio)+"/"+g.cardio+" min");
  if(extra.length)b.appendChild(el("span","fw-hc-sub",extra.join(" · ")));
  box.appendChild(b);
  // "Nächstes Ziel" direkt darunter
  var ng=$("nextgoal");if(ng&&ng.previousElementSibling!==box)box.parentNode.insertBefore(ng,box.nextSibling);
}
(function(){
  var orig=renderHeuteKarte;
  renderHeuteKarte=function(){orig();try{fwHeuteCards();}catch(e){}};
  var og=renderNextGoal;
  renderNextGoal=function(){og();var ng=$("nextgoal"),box=$("fw-hcards");if(ng&&box&&ng.previousElementSibling!==box)box.parentNode.insertBefore(ng,box.nextSibling);};
})();

/* ================= Schwebende Leiste: laufendes Training =================
   Wie ein Musik-Miniplayer: solange ein Training läuft, ist es von jedem Tab aus einen Tipp
   entfernt. Auf dem Trainings-Tab selbst und auf "Heute" (dort zeigt es die Heute-Karte) nicht. */
function fwMiniUpdate(){
  try{document.body.setAttribute("data-tab",tab);fwHeadAction();}catch(e){}
  var m=$("wo-mini");if(!m)return;
  var show=!!workout&&tab!=="tab-training"&&tab!=="tab-heute";
  m.hidden=!show;document.body.classList.toggle("has-mini",show);
  if(!show)return;
  var done=0,tot=0;workout.exercises.forEach(function(we){(we.sets||[]).forEach(function(st){tot++;if(st.done)done++;});});
  m.innerHTML="";
  m.appendChild(el("i","wm-dot"));
  var tx=el("span","wm-tx");tx.appendChild(el("b",null,"Training läuft · "+workout.name));tx.appendChild(el("span",null,done+" von "+tot+" Sätzen"));m.appendChild(tx);
  var t=el("span","num wm-time",fmtDur(woElapsed()));t.id="wm-time";m.appendChild(t);
  var go=el("span","wm-go");go.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.4-6.8c.6-.4.6-1.3 0-1.7L9.6 4.4C8.9 3.9 8 4.4 8 5.2z" fill="currentColor"/></svg>';m.appendChild(go);
  m.setAttribute("aria-label","Laufendes Training öffnen: "+workout.name);
  m.onclick=function(){selectTab("tab-training");window.scrollTo(0,0);};
}
(function(){
  var orig=renderBanner;
  renderBanner=function(){orig();try{fwMiniUpdate();}catch(e){}if(tab==="tab-heute"){try{renderHeuteKarte();}catch(e){}}};
  // Uhrzeit in Miniplayer und Heute-Karte weiterzählen, ohne alles neu aufzubauen.
  setInterval(function(){
    if(!workout||document.visibilityState==="hidden")return;
    var s=fmtDur(woElapsed()),a=$("wm-time"),b=$("hk-time");
    if(a&&!$("wo-mini").hidden)a.textContent=s;if(b)b.textContent=s;
  },1000);
})();

/* ================= Ränge-Tab =================
   Oben die Gesamtstärke, darunter eine Sammelkarte je Übung mit Rang – sortiert vom höchsten
   Rang abwärts. Farbe der Karte = Farbe der Rangstufe; Antippen öffnet die Rangleiter. */
function fwRankColor(rk){return rk.t.leg?"#C04C9A":rk.t.m;}
function fwSetLabel(ex,s){
  if(!s)return "";
  if(ex.t==="sec")return (s.reps||0)+" s";
  if(ex.t!=="load")return (s.reps||0)+" Wdh.";
  var kg=s.kg||0,w=ex.wt==="body"?(kg>0?"+"+fmtNum(kg)+" kg":"Körpergew."):fmtNum(kg)+" kg";
  return w;
}
function fwRankedExercises(){
  var from=shiftDays(TODAY,-(WIN_STRENGTH-1)),seen={},out=[];
  for(var d in state.days){if(d<from||d>TODAY)continue;(state.days[d].sets||[]).forEach(function(s){seen[s.ex]=1;});}
  Object.keys(seen).forEach(function(id){var ex=exById(id);if(!ex||!ex.std||ex.mob)return;
    var rk=null;try{rk=exRank(ex);}catch(e){}if(rk)out.push({ex:ex,rk:rk});});
  out.sort(function(a,b){return b.rk.score-a.rk.score;});
  return out;
}
function renderRaenge(){
  var hero=$("rg-hero"),grid=$("rg-grid"),off=$("rg-offen");if(!hero||!grid||!state.profile)return;
  hero.innerHTML="";grid.innerHTML="";if(off)off.innerHTML="";
  var all=fwRankedExercises(),ov=null;try{ov=overallRank();}catch(e){}
  // Gesamtstärke als große Karte
  var h=el("button","rg-hero");h.type="button";
  if(ov){
    h.style.setProperty("--rkc",fwRankColor(ov));
    var hb=el("div","rg-hero-b");hb.innerHTML=rankBadge(ov,96);h.appendChild(hb);
    var ht=el("div","rg-hero-t");
    ht.appendChild(el("span","rg-eye","Gesamtstärke"));
    ht.appendChild(el("b",null,ov.name));
    ht.appendChild(el("span","rg-title",ov.title));
    ht.appendChild(fwTicks(ov.pct,18,fwRankColor(ov)));
    ht.appendChild(el("span","rg-next",ov.next!=null?Math.round(ov.pct*100)+" % bis "+rankByIndex(ov.r+1).name:"Höchster Rang erreicht"));
    h.appendChild(ht);
    h.onclick=function(){sheetRankLadder(ov,"Rangleiter · Gesamtstärke");};
  }else{
    h.classList.add("empty");
    var he=el("div","rg-hero-t");he.appendChild(el("span","rg-eye","Gesamtstärke"));
    he.appendChild(el("b",null,"Noch kein Rang"));
    he.appendChild(el("span","rg-title","Trag schwere Sätze bei deinen Grundübungen ein – daraus entstehen deine Ränge."));
    h.appendChild(he);h.onclick=function(){selectTab("tab-training");window.scrollTo(0,0);};
  }
  hero.appendChild(h);
  var sum=$("rg-sum");if(sum)sum.textContent=all.length?all.length+(all.length===1?" Rang":" Ränge"):"";
  all.forEach(function(o,i){
    var rk=o.rk,ex=o.ex,col=fwRankColor(rk);
    var c=el("button","rg-card");c.type="button";c.style.setProperty("--rkc",col);
    c.style.setProperty("--d",(i*0.05).toFixed(2)+"s");
    c.appendChild(el("i","rg-shine"));
    c.appendChild(el("span","rg-tier",rk.name));
    var b=el("div","rg-badge");b.innerHTML=rankBadge(rk,76);c.appendChild(b);
    c.appendChild(el("b","rg-ex",ex.n));
    var pills=el("div","rg-pills"),bs=rk.bestSet;
    pills.appendChild(el("span","num rg-p",fwSetLabel(ex,bs)));
    if(ex.t==="load"&&bs&&bs.reps)pills.appendChild(el("span","num rg-p rg-p2","× "+bs.reps));
    c.appendChild(pills);
    var bar=el("div","rg-bar"),bi=el("i");bi.style.width=Math.round(rk.pct*100)+"%";bar.appendChild(bi);c.appendChild(bar);
    c.setAttribute("aria-label",ex.n+": "+rankLabel(rk));
    c.onclick=function(){sheetRankLadder(exRank(ex),"Rangleiter · "+ex.n,exRankHint(ex,exRank(ex)),ex);};
    grid.appendChild(c);
  });
  // Grundübungen aus dem Profil ohne Rang: kurzer Hinweis, wie man ihn bekommt.
  var have={};all.forEach(function(o){have[o.ex.id]=1;});
  var open=(state.profile.mainEx||[]).map(exById).filter(function(ex){return ex&&ex.std&&!have[ex.id];});
  if(off&&(open.length||!all.length)){
    var oc=el("div","rg-open");
    var ic=el("span","rg-lock");ic.innerHTML=svgIcon("M5 10.5h14v10H5zM8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5",1.9);oc.appendChild(ic);
    var names=open.map(function(e){return e.n;});
    oc.appendChild(el("span",null,names.length?"Noch ohne Rang: "+names.join(", ")+". Ein schwerer Satz genügt – dann bekommst du deine Karte.":"Jede Grundübung, die du mit Gewicht trainierst, bekommt hier eine eigene Rangkarte."));
    off.appendChild(oc);
  }
}

/* ================= Körper-Tab: Ansicht "Rang" =================
   Eigener Knopf unter dem Umschalter Trainingsvolumen/Erholung: jeder Muskel leuchtet in der Farbe
   des besten Rangs, den eine Übung mit ihm als Hauptmuskel erreicht hat. Nebenmuskeln zählen
   nicht – sonst stünde der Trizeps nach gutem Bankdrücken schon auf Gold, ohne je gezielt
   trainiert worden zu sein. Muskeln ohne Rang bleiben grau. */
var fwMuscleRankMemo=null;
function fwMuscleRanks(){
  if(fwMuscleRankMemo)return fwMuscleRankMemo;
  var out={};
  fwRankedExercises().forEach(function(o){
    (o.ex.p||[]).forEach(function(mid){if(!out[mid]||o.rk.score>out[mid].score)out[mid]=o.rk;});
  });
  fwMuscleRankMemo=out;
  // Nur für einen Zeichendurchgang merken: Ränge ändern sich mit jedem eingetragenen Satz.
  setTimeout(function(){fwMuscleRankMemo=null;},0);
  return out;
}
(function(){
  var origColor=bodyColorFn;
  bodyColorFn=function(){
    if(bodyMode!=="rank")return origColor();
    var rk=fwMuscleRanks(),none=getComputedStyle(document.documentElement).getPropertyValue("--rule-2").trim()||"#3c3834";
    return function(v,m){var r=m&&rk[m.id];return r?r.t.m:none;};
  };
  var origMode=renderBodyMode,lastBase="vol";
  renderBodyMode=function(){
    ensureRecDom();
    var bar=$("bodymode");
    // "Rang" ist bewusst kein dritter Reiter neben Volumen und Erholung, sondern ein eigener
    // Knopf unter der Figur: Volumen und Erholung sind die Alltagsansichten, der Rang ist ein Extra-Blick.
    var rb=$("rkmode");
    if(bar&&!rb){
      rb=el("button","rkmode-btn");rb.id="rkmode";rb.type="button";
      rb.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.8l7.5 3v6.1c0 4.4-3.1 7.7-7.5 9.3-4.4-1.6-7.5-4.9-7.5-9.3V5.8z"/><path d="M12 7.6l1.4 2.8 3.1.4-2.3 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.3-2.1 3.1-.4z"/></svg>';
      rb.appendChild(el("span",null,"Ränge auf dem Körper"));
      rb.onclick=function(){bodyMode=bodyMode==="rank"?lastBase:"rank";renderBodySel();};
      // Unter der Figur und ihrer Legende: der Rang kommt als Letztes, nicht vor den Alltagsansichten.
      var md=$("mdetail");if(md&&md.parentNode)md.parentNode.insertBefore(rb,md);else bar.parentNode.appendChild(rb);
    }
    if(bodyMode!=="rank")lastBase=bodyMode;
    if(rb)rb.setAttribute("aria-pressed",String(bodyMode==="rank"));
    origMode();
    if(bar&&bodyMode==="rank")Array.prototype.forEach.call(bar.querySelectorAll("button"),function(x){x.setAttribute("aria-selected","false");});
    var rank=bodyMode==="rank",vl=document.querySelector("#p-koerper .vollegend"),lg=$("rklegend");
    if(!lg&&vl){
      lg=el("div","rklegend");lg.id="rklegend";
      var cap=el("div","vol-cap");cap.appendChild(el("b",null,"Rang je Muskel"));cap.appendChild(el("span",null,"beste Übung als Hauptmuskel"));lg.appendChild(cap);
      var row=el("div","rkl-row");
      RANK_TIERS.forEach(function(t){var s=el("span","rkl");var d=el("i");d.style.background=t.m;s.appendChild(d);s.appendChild(document.createTextNode(t.n));row.appendChild(s);});
      var s0=el("span","rkl none");s0.appendChild(el("i"));s0.appendChild(document.createTextNode("ohne Rang"));row.appendChild(s0);
      lg.appendChild(row);vl.parentNode.insertBefore(lg,vl.nextSibling);
    }
    if(vl&&rank)vl.hidden=true;
    if(lg)lg.hidden=!rank;
  };
})();

/* ================= Aktions-Sheet (+) =================
   Vorher eine lange Textliste, in der Training starten, Einheiten und Nachtragen gleich aussahen.
   Jetzt drei Ebenen: oben EINE große Startfläche, darunter die Einheiten als Kacheln mit ihrer
   Muskelfigur (die nächste in der Reihenfolge ist markiert), unten vier kleine Kacheln zum
   Nachtragen. So sieht man auf einen Blick, was die Hauptsache ist. */
var FW_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.4-6.8c.6-.4.6-1.3 0-1.7L9.6 4.4C8.9 3.9 8 4.4 8 5.2z" fill="currentColor"/></svg>';
var FW_QICONS={
  set:"M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11",
  cardio:"M3 12h4l2.5-6 4 12 2.5-6H21",
  mob:"M12 4.6a1.8 1.8 0 1 0 0 .01M5 9.5l7 1.5 7-1.5M12 11v4.5M12 15.5l-4 5M12 15.5l4 5",
  note:"M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"
};
function sheetActions(){
  openSheet(function(b){
    sheetTitle(b,"Was steht an?");
    b.classList.add("fw-act");
    var d=day(TODAY),close=function(fn,delay){return function(){closeSheet();if(delay)setTimeout(fn,180);else fn();};};
    // 1) Hauptfläche
    var hero=el("button","fa-hero");hero.type="button";
    var hi=el("span","fa-hero-go");hi.innerHTML=FW_PLAY;
    var ht=el("span","fa-hero-tx");
    if(workout){
      hero.classList.add("live");
      ht.appendChild(el("span","fa-eye","Training läuft"));
      ht.appendChild(el("b",null,"Zurück zu "+workout.name));
      var t=el("span","num",fmtDur(woElapsed()));ht.appendChild(t);
      hero.onclick=close(function(){selectTab("tab-training");window.scrollTo(0,0);});
    }else{
      ht.appendChild(el("span","fa-eye","Frei trainieren"));
      ht.appendChild(el("b",null,"Training starten"));
      ht.appendChild(el("span",null,"Leer starten – Übungen fügst du unterwegs hinzu"));
      hero.onclick=close(function(){startWorkout(null);});
    }
    hero.appendChild(ht);hero.appendChild(hi);hero.appendChild(el("i","fa-shine"));
    b.appendChild(hero);
    // 2) Einheiten als Kacheln
    var ids=workout?[]:routineIds();
    if(ids.length){
      var next=fwNextRoutine();
      var h=el("div","fa-h");h.appendChild(el("b",null,"Deine Einheiten"));h.appendChild(el("span",null,ids.length+(ids.length===1?" Einheit":" Einheiten")));b.appendChild(h);
      var g=el("div","fa-grid");
      ids.forEach(function(id,i){
        var r=state.routines[id];if(!r)return;
        var c=el("button","fa-rt"+(id===next?" next":""));c.type="button";c.style.setProperty("--d",(i*0.04).toFixed(2)+"s");
        if(id===next)c.appendChild(el("span","fa-badge","Als Nächstes"));
        var fo=routineFocus(r.items),fw=el("span","fa-fig");fw.setAttribute("aria-hidden","true");
        if(fo.max>0){var fig=document.createElementNS("http://www.w3.org/2000/svg","svg");fig.setAttribute("viewBox","0 0 800 1500");fw.appendChild(fig);
          (function(f,sets){requestAnimationFrame(function(){try{drawMini(f,"front",sets);}catch(e){}});})(fig,fo.sets);}
        c.appendChild(fw);
        var nSets=r.items.reduce(function(a,it){return a+(it.sets||0);},0);
        var tx=el("span","fa-rt-tx");tx.appendChild(el("b",null,r.name));
        tx.appendChild(el("span",null,r.items.length+" Übungen"+(nSets?" · "+nSets+" Sätze":"")));c.appendChild(tx);
        var go=el("span","fa-rt-go");go.innerHTML=FW_PLAY;c.appendChild(go);
        c.setAttribute("aria-label",r.name+" starten");
        c.onclick=close(function(){startWorkout(id);});
        g.appendChild(c);
      });
      b.appendChild(g);
    }
    // 3) Nachtragen
    var h2=el("div","fa-h");h2.appendChild(el("b",null,"Schnell eintragen"));b.appendChild(h2);
    var q=el("div","fa-quick");
    var mobDone=false;try{mobDone=mobDay(d).units>=1;}catch(e){}
    var cmin=(d.cardio||[]).reduce(function(a,c){return a+(c.min||0);},0);
    [["set","Satz","nachtragen",function(){sheetAddSet(null);},"--accent"],
     ["cardio","Ausdauer",cmin?cmin+" min heute":"Laufen, Rad, Rudern",sheetCardio,"--yellow"],
     ["mob","Mobilität",mobDone?"heute erledigt ✓":MOB_UNIT_MIN+" min = 1 Einheit",sheetMob,"--good"],
     ["note","Notiz",d.note?"bearbeiten":"Wie lief der Tag?",function(){sheetNote();},"--violet"]
    ].forEach(function(o){
      var k=el("button","fa-q");k.type="button";k.style.setProperty("--qc","var("+o[4]+")");
      var ic=el("span","fa-q-ic");ic.innerHTML=svgIcon(FW_QICONS[o[0]],2);k.appendChild(ic);
      var tx=el("span","fa-q-tx");tx.appendChild(el("b",null,o[1]));tx.appendChild(el("span",null,o[2]));k.appendChild(tx);
      k.onclick=close(o[3],true);q.appendChild(k);
    });
    b.appendChild(q);
  });
}

/* ================= Farbe je Einheit =================
   Jede Einheit bekommt eine eigene Farbe, damit man sie überall wiedererkennt: Karte im
   Training-Tab, Wochenkalender auf "Heute". Die Farbe folgt dem Schwerpunkt der Einheit
   (Brust/Trizeps blau, Rücken violett, Schultern/Arme gold, Beine/Rumpf grün); ist sie schon an
   eine frühere Einheit vergeben, nimmt die nächste die erste freie - zwei Einheiten sollen sich
   nie eine Farbe teilen. Kupfer bleibt den Aktionen vorbehalten. */
var FW_UNIT_PAL=["--blue","--green","--violet","--gold","--red","--yellow"];
var FW_UNIT_PREF={"Brust":"--blue","Trizeps":"--blue","Rücken":"--violet","Rückenstrecker":"--violet","Nacken":"--violet","Hals":"--violet",
  "Schultern":"--gold","Bizeps":"--gold","Unterarme":"--gold","Quadrizeps":"--green","Beinbeuger":"--green","Waden":"--green",
  "Adduktoren":"--green","Gesäß":"--green","Rumpf":"--green"};
function fwUnitColors(){
  var out={},used={},pl=fwPlanIds();
  pl.concat(routineIds().filter(function(id){return pl.indexOf(id)<0;})).forEach(function(id){
    var r=state.routines[id];if(!r)return;
    var top=fwRegionsOf(r.items)[0],c=FW_UNIT_PREF[top];
    if(!c||used[c])c=FW_UNIT_PAL.filter(function(x){return !used[x];})[0]||FW_UNIT_PAL[Object.keys(out).length%FW_UNIT_PAL.length];
    used[c]=1;out[id]="var("+c+")";
  });
  return out;
}
(function(){
  // Wochenkalender: ein Trainingstag trägt die Farbe der Einheit, die an dem Tag gemacht wurde.
  var orig=renderWeek;
  renderWeek=function(){
    orig();
    try{fwWeekTop();}catch(e){}
    var box=$("weekstrip");if(!box||!state.routines)return;
    var cols=fwUnitColors(),byName={};
    Object.keys(state.routines).forEach(function(id){var r=state.routines[id];if(r&&cols[id])byName[r.name]=cols[id];});
    var off=(parseIso(heuteDate).getDay()+6)%7;
    Array.prototype.forEach.call(box.querySelectorAll(".wd"),function(w,i){
      var dd=state.days[shiftDays(heuteDate,i-off)];if(!dd)return;
      var c=null;(dd.workouts||[]).some(function(wo){c=wo&&byName[wo.name];return !!c;});
      if(c){w.classList.add("wd-unit");w.style.setProperty("--uc",c);}
    });
  };
})();

/* ================= Wochenleiste oben auf "Heute" =================
   Wie in der Design-Vorschau: gleich unter dem Titel die sieben Tage der Woche. Erledigt = Haken
   (in der Farbe der Einheit, falls bekannt), Ruhetag = "Ruhe", heute = kupferner Ring mit Datum,
   kommende Tage leer. Antippen springt zu dem Tag, wie im Wochenkalender weiter unten. */
function fwWeekTop(){
  var sec=$("p-heute");if(!sec||!state.profile)return;
  var box=$("fw-weektop");
  if(!box){box=el("div","fw-weektop");box.id="fw-weektop";box.setAttribute("role","group");box.setAttribute("aria-label","Diese Woche");
    var hk=$("heute-karte");sec.insertBefore(box,hk||sec.firstChild);}
  box.innerHTML="";
  var cols=state.routines?fwUnitColors():{},byName={};
  Object.keys(state.routines||{}).forEach(function(id){var r=state.routines[id];if(r&&cols[id])byName[r.name]=cols[id];});
  var off=(parseIso(heuteDate).getDay()+6)%7;
  for(var i=0;i<7;i++){
    var d=shiftDays(heuteDate,i-off),dd=state.days[d],fut=d>TODAY;
    var trained=isTrainDay(dd)||!!(dd&&(dd.workouts||[]).length);
    var b=el("button","wt-d"+(d===TODAY?" today":"")+(d===heuteDate?" viewing":""));b.type="button";
    b.appendChild(el("span","wt-l",WD[parseIso(d).getDay()]));
    var c=el("span","wt-c");
    if(trained){
      c.classList.add("done");var uc=null;(dd.workouts||[]).some(function(wo){uc=wo&&byName[wo.name];return !!uc;});
      if(uc){c.classList.add("unit");c.style.setProperty("--uc",uc);}
      c.innerHTML=svgIcon("M5 12.5l4.5 4.5L19 7.5",2.6);
    }else if(dd&&dd.rest){c.classList.add("rest");c.textContent="Ruhe";}
    else if(d===TODAY||d===heuteDate){c.textContent=String(parseIso(d).getDate());}
    b.appendChild(c);
    b.setAttribute("aria-label",deDate(d)+(trained?": trainiert":dd&&dd.rest?": Ruhetag":""));
    if(fut)b.disabled=true;
    else (function(dk){b.onclick=function(){gotoHeuteDate(dk);};})(d);
    box.appendChild(b);
  }
}

/* ================= Einheiten-Karten zum Durchwischen =================
   Vorher ein kleines Figürchen und eine Textzeile mit Übungsnamen. Jetzt oben in jeder Karte
   ein Streifen zum Wischen: erst der Überblick (ganzer Körper vorn und hinten, welche Muskeln
   die Einheit trifft, mit festem Leuchten), dann jede Übung einzeln mit Bewegungsbild oder
   Muskelfigur und Sätzen. So sieht man vor dem Start, was drankommt. */
function fwSvgFig(view){var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");sv.setAttribute("viewBox","0 0 800 1500");sv.setAttribute("data-v",view);return sv;}
function fwItemLabel(ex,it){
  var p=[];if(it.sets)p.push(it.sets+" Sätze");
  if(ex.t==="sec"){if(it.reps)p.push(it.reps+" s");}
  else{if(it.reps)p.push(it.reps+" Wdh.");if(ex.t==="load"&&it.kg)p.push(fmtNum(it.kg)+" kg");}
  return p.join(" · ");
}
function fwRichRoutineCards(list){
  if(rcSort)return;
  var ids=routineIds(),cards=list.querySelectorAll(".rc-item"),draws=[],cols=fwUnitColors(),next=fwNextRoutine(),plan=fwPlanIds();
  Array.prototype.forEach.call(cards,function(card,i){
    var r=state.routines[ids[i]];if(!r)return;
    card.classList.add("rc-rich");card.style.setProperty("--uc",cols[ids[i]]||"var(--accent)");
    card.setAttribute("data-rid",ids[i]);
    if(ids[i]===next&&ids.length>1)card.classList.add("rc-next");
    // Nummer = Platz im Plan, in der Farbe der Einheit. Einheiten außerhalb des Plans haben keine Nummer.
    var pn=plan.indexOf(ids[i]);
    if(pn<0&&plan.length)card.classList.add("rc-extra");
    var tx0=card.querySelector(".rc-txt");if(tx0&&pn>=0){var num=el("span","rc-num",String(pn+1));num.setAttribute("aria-hidden","true");card.insertBefore(num,tx0);}
    var old=card.querySelector(".rc-fig");if(old)old.remove();
    var fo=routineFocus(r.items);
    var wrap=el("div","rs-wrap"),strip=el("div","rs-strip"),dots=el("div","rs-dots");dots.setAttribute("aria-hidden","true");
    // Überblick
    var ov=el("div","rs-slide rs-ov");
    var figs=el("div","rs-ov-figs");figs.setAttribute("aria-hidden","true");
    if(fo.max>0)["front","back"].forEach(function(v){var sv=fwSvgFig(v);figs.appendChild(sv);draws.push({sv:sv,v:v,sets:fo.sets});});
    ov.appendChild(figs);
    var ot=el("div","rs-ov-tx");ot.appendChild(el("span","rs-eye","Das trainierst du"));
    var chips=el("div","rs-chips");fwRegionsOf(r.items).forEach(function(c){chips.appendChild(el("span","rs-chip",c));});ot.appendChild(chips);
    if(r.items.length)ot.appendChild(el("span","rs-hint","Wischen für alle "+r.items.length+" Übungen"));
    ov.appendChild(ot);strip.appendChild(ov);dots.appendChild(el("i","on"));
    // Übungen
    r.items.forEach(function(it,k){
      var ex=exById(it.ex);if(!ex)return;
      var sl=el("div","rs-slide rs-ex"),pic=el("div","rs-pic");pic.setAttribute("aria-hidden","true");
      var clip=typeof FW_ANIM_CLIP!=="undefined"&&FW_ANIM_CLIP[ex.id];
      if(clip&&!ex.custom){var im=el("img");im.src="assets/posen/"+clip+".webp";im.alt="";im.loading="lazy";im.decoding="async";pic.appendChild(im);pic.classList.add("pose");
        im.onerror=function(){im.remove();pic.classList.remove("pose");fwExFigs(pic,ex);};}
      else fwExFigs(pic,ex);
      sl.appendChild(pic);
      var tx=el("div","rs-ex-tx");tx.appendChild(el("span","rs-n",(k+1)+" / "+r.items.length));
      tx.appendChild(el("b",null,ex.n));var lb=fwItemLabel(ex,it);if(lb)tx.appendChild(el("span","num rs-sets",lb));
      var reg=exPrimaryRegionLabel(ex);if(reg)tx.appendChild(el("span","rs-reg",reg));
      sl.appendChild(tx);strip.appendChild(sl);dots.appendChild(el("i"));
    });
    strip.addEventListener("scroll",function(){
      var n=Math.round(strip.scrollLeft/Math.max(1,strip.clientWidth));
      Array.prototype.forEach.call(dots.children,function(d,j){d.classList.toggle("on",j===n);});
      // Muskelfiguren der Übungen erst beim Hereinwischen zeichnen – spart den Aufbau aller auf einmal.
      Array.prototype.forEach.call(strip.querySelectorAll("svg[data-ex]:not([data-filled])"),function(sv){try{fillExFig(sv);}catch(e){}});
    },{passive:true});
    wrap.appendChild(strip);if(dots.children.length>1)wrap.appendChild(dots);
    if(card.classList.contains("rc-next"))wrap.appendChild(el("span","rs-next","Als Nächstes"));
    card.insertBefore(wrap,card.firstChild);
  });
  if(draws.length)requestAnimationFrame(function(){draws.forEach(function(o){try{drawMini(o.sv,o.v,o.sets);}catch(e){}});});
}
function fwExFigs(pic,ex){
  ["front","back"].forEach(function(v){
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",v);pic.appendChild(sv);
  });
}

/* Training-Tab: oben die Übungssuche, dann "Mein Plan" (nummeriert, in Reihenfolge), darunter
   eingeklappt "Weitere Einheiten". Ohne Plan ein Vorschlag aus den letzten vier Wochen. */
function fwPlanSections(sw,list){
  if(rcSort)return;
  // Übungssuche: großer Balken ganz oben, zeigt, wie viele Übungen es gibt.
  var sb=$("fw-exsearch");
  if(!sb){sb=el("button","fw-exsearch");sb.id="fw-exsearch";sb.type="button";sw.insertBefore(sb,sw.firstChild);
    sb.onclick=function(){selectTab("tab-entdecken");window.scrollTo(0,0);setTimeout(function(){var i=$("disc-search");if(i)try{i.focus();}catch(e){}},250);};}
  else if(sw.firstChild!==sb)sw.insertBefore(sb,sw.firstChild);
  // Dieselbe Zählung wie "Alle Übungen" in der Übersicht: ohne Mobilität und Ausdauer.
  var nEx=EX.filter(function(e){return !e.mob&&e.t!=="cardio";}).length;
  sb.innerHTML=svgIcon("M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3",2);
  sb.appendChild(el("span","fw-exs-t","Übung suchen"));sb.appendChild(el("span","fw-exs-n",nEx+" Übungen"));
  var plan=fwPlanIds(),head=list.previousElementSibling;
  // Kopf "Meine Einheiten" wird zu "Mein Plan" mit Bearbeiten-Knopf
  var cnt=$("routine-count"),hh=cnt&&cnt.closest("h2");
  if(hh){var t=hh.querySelector(".sec-t");if(t)t.textContent=plan.length?"Mein Plan":"Meine Einheiten";
    var pe=$("fw-planedit");if(!pe){pe=el("button","fw-planedit");pe.id="fw-planedit";pe.type="button";hh.appendChild(pe);pe.onclick=sheetPlan;}
    pe.textContent=plan.length?"Plan bearbeiten":"Plan festlegen";
    if(cnt)cnt.textContent=plan.length?String(plan.length):cnt.textContent;}
  var tools=list.querySelector(".rc-tools");if(tools)tools.remove();
  var old=$("fw-more");if(old)old.remove();var hint=$("fw-planhint");if(hint)hint.remove();
  if(!plan.length){
    var sug=fwPlanSuggest();
    if(sug.length>1){
      var h=el("div","fw-planhint");h.id="fw-planhint";
      h.appendChild(el("b",null,"Leg deinen Plan fest"));
      h.appendChild(el("span",null,"Vorschlag aus den letzten 4 Wochen – tipp an, was nicht in den Plan soll:"));
      // Jede vorgeschlagene Einheit als Schalter: angetippt fliegt sie raus (z. B. eine seltene Reha-Einheit).
      var pick=sug.slice(),chips=el("div","fw-planchips");
      sug.forEach(function(id){
        var c=el("button","fw-planchip on");c.type="button";c.setAttribute("aria-pressed","true");
        c.innerHTML=svgIcon("M5 12.5l4.5 4.5L19 7.5",2.6);c.appendChild(document.createTextNode(state.routines[id].name));
        c.onclick=function(){var k=pick.indexOf(id),on=k<0;if(on)pick.push(id);else pick.splice(k,1);
          pick.sort(function(a,b){return sug.indexOf(a)-sug.indexOf(b);});
          c.classList.toggle("on",on);c.setAttribute("aria-pressed",String(on));
          c.innerHTML=on?svgIcon("M5 12.5l4.5 4.5L19 7.5",2.6):svgIcon("M6 6l12 12M18 6L6 18",2.4);c.appendChild(document.createTextNode(state.routines[id].name));
          ok.disabled=!pick.length;};
        chips.appendChild(c);});
      h.appendChild(chips);
      var row=el("div","fw-planhint-btns"),ok=el("button","btn primary small","Übernehmen"),ed=el("button","btn ghost small","Mehr anpassen");
      ok.onclick=function(){fwSetPlan(pick);toast("Plan gespeichert");};ed.onclick=sheetPlan;
      row.appendChild(ok);row.appendChild(ed);h.appendChild(row);
      list.parentNode.insertBefore(h,list);
    }
    return;
  }
  // Plan-Karten in Plan-Reihenfolge, der Rest eingeklappt darunter.
  var cards={};Array.prototype.forEach.call(list.querySelectorAll(".rc-item[data-rid]"),function(c){cards[c.getAttribute("data-rid")]=c;});
  plan.forEach(function(id){if(cards[id])list.appendChild(cards[id]);});
  var rest=Object.keys(cards).filter(function(id){return plan.indexOf(id)<0;});
  if(rest.length){
    var d=document.createElement("details");d.className="fw-more";d.id="fw-more";
    var sm=document.createElement("summary");sm.appendChild(el("span",null,"Weitere Einheiten"));sm.appendChild(el("b","rc-count",String(rest.length)));d.appendChild(sm);
    var inner=el("div","rc-list");rest.forEach(function(id){inner.appendChild(cards[id]);});d.appendChild(inner);
    list.parentNode.insertBefore(d,list.nextSibling);
  }
}

/* ================= Training-Tab: Starten zuerst =================
   Wer den Tab öffnet, will meistens loslegen. Deshalb stehen ganz oben das freie Training und
   daneben "Neue Einheit" / "Aus Vorlage", erst darunter die Liste der eigenen Einheiten.
   Umgestellt wird im DOM statt in index.html, damit ein älterer index.html-Stand aus einer
   parallelen Sitzung die Reihenfolge nicht wieder zurückdreht. */
(function(){
  var orig=renderRoutines;
  renderRoutines=function(){
    orig();
    var sw=$("start-wrap"),list=$("routine-list");if(!sw||!list)return;
    try{fwRichRoutineCards(list);}catch(e){}
    // Klare Grenze zwischen "Starten" oben und der Liste: große Überschrift mit Zahl.
    var cnt=$("routine-count");if(cnt){var n=routineIds().length;cnt.textContent=n?String(n):"";cnt.className="rc-count";
      var hh=cnt.closest("h2");if(hh)hh.classList.add("rc-head");}
    var free=sw.querySelector(".free-card");
    if(free&&!free.dataset.fw){free.dataset.fw="1";
      var h=free.previousElementSibling;if(h&&h.classList.contains("sec"))h.remove();
      var intro=sw.querySelector(".tr-intro");if(intro)intro.remove();}
    var top=$("rc-top");
    if(!top){top=el("div","rc-top");top.id="rc-top";}
    top.innerHTML="";
    Array.prototype.slice.call(list.querySelectorAll(".rc-add-row")).forEach(function(b){top.appendChild(b);});
    top.hidden=!top.children.length;
    try{fwPlanSections(sw,list);}catch(e){}
    // Reihenfolge oben: Übungssuche, freies Training, Neue Einheit / Vorlage.
    var sb=$("fw-exsearch"),anchor=sb||null;
    if(sb&&sw.firstChild!==sb)sw.insertBefore(sb,sw.firstChild);
    if(free){sw.insertBefore(free,anchor?anchor.nextSibling:sw.firstChild);anchor=free;}
    sw.insertBefore(top,anchor?anchor.nextSibling:sw.firstChild);
  };
})();

/* ================= Kopfzeile: Serie und Konto =================
   Wie in der Design-Vorschau: über dem Titel das Datum als kleine Überzeile, rechts die Serie
   (Wochen in Folge mit erreichtem Wochenziel, dieselbe Zählung wie die Serien-Medaille) und
   ein runder Konto-Knopf, dessen Ring Farbe und Fortschritt der Gesamtstärke zeigt. Der Knopf
   öffnet die Einstellungen - das Zahnrad entfällt dafür. */
function fwStreakNow(){
  var goal=(state.profile&&state.profile.goals&&state.profile.goals.days)||0;if(!(goal>0))return 0;
  var wk={},first=null;
  Object.keys(state.days).forEach(function(d){if(d>TODAY||!isTrainDay(state.days[d]))return;var k=weekStartOf(d);wk[k]=(wk[k]||0)+1;if(!first||d<first)first=d;});
  if(!first)return 0;
  var cur=weekStartOf(TODAY),w=weekStartOf(first),s=0,joker=-99,idx=0;
  while(w<=cur){
    if((wk[w]||0)>=goal)s++;
    else if(w===cur){/* laufende Woche zählt erst, wenn das Ziel erreicht ist */}
    else if(s>0&&idx-joker>=8)joker=idx;   // eine verpasste Woche pro 8 wird verziehen, wie bei der Medaille
    else s=0;
    w=shiftDays(w,7);idx++;
  }
  return s;
}
function fwAppbar(){
  var bar=document.querySelector(".appbar");if(!bar)return;
  var gear=$("btn-settings"),st=$("fw-streak"),me=$("fw-me");
  if(!st){st=el("span","fw-streak");st.id="fw-streak";bar.insertBefore(st,gear||null);}
  if(!me){me=el("button","fw-me");me.id="fw-me";me.type="button";me.setAttribute("aria-label","Konto und Einstellungen");
    me.onclick=function(){try{openSettingsPage();}catch(e){selectTab("tab-werte");}};bar.insertBefore(me,gear||null);}
  var n=0;try{n=fwStreakNow();}catch(e){}
  st.innerHTML=svgIcon("M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.3 2.4-5.3 3.6-7.9.4 1.9 1.5 3 2.6 3.5-.2-3 1-5.8 3.3-7.4-.2 3.3 3.5 5.6 3.5 10.6 0 4.3-2.6 7.4-6.5 7.4z",1.9);
  st.classList.toggle("off",!n);
  st.appendChild(el("b",null,n+(n===1?" Woche":" Wochen")));
  st.setAttribute("aria-label","Serie: "+n+(n===1?" Woche":" Wochen")+" in Folge");
  var ov=null;try{ov=overallRank();}catch(e){}
  me.style.setProperty("--rkc",ov?fwRankColor(ov):"var(--rule-2)");
  me.style.setProperty("--p",ov?Math.round(ov.pct*100)+"%":"0%");
  var nm=state.profile&&state.profile.name,ini=nm?nm.trim().split(/\s+/).map(function(w){return w[0];}).join("").slice(0,2).toUpperCase():"";
  me.innerHTML="";var inner=el("span","fw-me-i");
  if(ini)inner.textContent=ini;else inner.innerHTML=svgIcon("M12 12.3a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6zM4.5 20.5c1.4-3.6 4.2-5.3 7.5-5.3s6.1 1.7 7.5 5.3",1.9);
  me.appendChild(inner);
}
(function(){
  var orig=renderHero;
  renderHero=function(c,pk){
    orig(c,pk);
    try{var dt=parseIso(heuteDate);$("todaydate").textContent=dt.toLocaleDateString(LANG==="en"?"en-US":"de-DE",{weekday:"long",day:"numeric",month:"long"});}catch(e){}
    try{fwAppbar();}catch(e){}
  };
})();

/* ================= Laufendes Training wie in der Vorschau =================
   Kopf: links Einklappen, in der Mitte Name und große Uhr, rechts "Fertig". Darunter drei
   Kacheln (Volumen, Sätze, Übung). Je Übung ein Bewegungsbild, das Rangwappen und - wenn der
   nächste Rang greifbar ist - eine Zeile "30 kg × 8 = Platin I". Unten ein großer Knopf, der den
   Satz abhakt, der gerade dran ist. Die Reserve-Spalte entfällt (per CSS ausgeblendet; alte
   Sätze mit Reserve bleiben unverändert gespeichert). Umgebaut wird nach dem Aufbau im DOM,
   damit die ganze Satzlogik in 09-uebungsdetail.js unangetastet bleibt. */
var FW_BOLT="M13 2.8L5.5 13.5h6l-1 7.7 8-11h-6z";
function fwWoDecorate(){
  var box=$("session-body");if(!box||!workout)return;
  var head=box.querySelector(".wo-head");
  if(head&&!head.classList.contains("fw")){
    head.classList.add("fw");
    var nm=head.querySelector(".wo-name"),tm=$("wo-timer-wrap"),rp=$("wo-rest-pill"),pb=head.querySelector(".iconbtn"),endB=head.querySelector(".btn");
    var mn=el("button","iconbtn fw-wo-min");mn.type="button";mn.setAttribute("aria-label","Training einklappen");mn.innerHTML=svgIcon("M5 9l7 7 7-7",2.2);
    mn.onclick=function(){selectTab("tab-heute");window.scrollTo(0,0);};
    var ctr=el("div","fw-wo-center");if(nm)ctr.appendChild(nm);if(tm)ctr.appendChild(tm);if(rp)ctr.appendChild(rp);
    var right=el("div","fw-wo-right");if(pb)right.appendChild(pb);
    Array.prototype.slice.call(head.children).forEach(function(c){if(c!==endB&&!c.classList.contains("wo-prog"))right.appendChild(c);});
    if(endB){endB.textContent="Fertig";endB.className="btn small fw-fertig";right.appendChild(endB);}
    head.innerHTML="";head.appendChild(mn);head.appendChild(ctr);head.appendChild(right);
    var st=el("div","fw-wo-stats");
    [["fw-ws-vol","Volumen"],["fw-ws-sets","Sätze"],["fw-ws-ex","Übung"]].forEach(function(o){var t=el("div","fw-ws");t.appendChild(el("span",null,o[1]));var b=el("b","num","–");b.id=o[0];t.appendChild(b);st.appendChild(t);});
    head.parentNode.insertBefore(st,head.nextSibling);
  }
  Array.prototype.forEach.call(box.querySelectorAll(".wo-page[data-i]"),function(pg){
    if(pg.dataset.fw)return;pg.dataset.fw="1";
    var we=workout.exercises[+pg.getAttribute("data-i")],ex=we&&exById(we.ex);if(!ex||!we.sets)return;
    var ph=pg.querySelector(".wo-pagehead");if(!ph)return;
    var clip=typeof FW_ANIM_CLIP!=="undefined"&&FW_ANIM_CLIP[ex.id];
    if(clip&&!ex.custom){var th=el("div","fw-wo-thumb"),im=el("img");im.src="assets/posen/"+clip+".webp";im.alt="";im.decoding="async";im.onerror=function(){th.remove();};th.appendChild(im);ph.insertBefore(th,ph.firstChild);}
    // Die kleinen Werkzeug-Knöpfe (Info, Reihenfolge, Pause, Tauschen, Löschen) in eine eigene
    // Zeile darunter, damit Bild, Name und Wappen oben nebeneinander Platz haben.
    var tools=el("div","fw-wo-tools");
    Array.prototype.slice.call(ph.children).forEach(function(c){if(c.classList.contains("iconbtn"))tools.appendChild(c);});
    if(tools.children.length)ph.parentNode.insertBefore(tools,ph.nextSibling);
    var rk=null;try{rk=exRank(ex);}catch(e){}
    if(rk){var cr=el("span","fw-wo-crest");cr.innerHTML=rankBadge(rk,40);cr.setAttribute("aria-hidden","true");var mainEl=ph.querySelector(".main");ph.insertBefore(cr,mainEl?mainEl.nextSibling:null);
      var h=null;try{h=rankNextHint(ex,rk);}catch(e){}
      if(h&&h.txt){var hi=el("button","fw-wo-hint");hi.type="button";hi.style.setProperty("--rkc",fwRankColor(h.rank));
        var l=el("span","fw-wo-hint-l");l.innerHTML=svgIcon(FW_BOLT,2);l.appendChild(el("b",null,h.txt+" = "+h.rank.name));hi.appendChild(l);
        hi.appendChild(el("span","fw-wo-hint-r",rk.name+" → "+h.rank.name));
        hi.onclick=function(){sheetRankLadder(exRank(ex),"Rangleiter · "+ex.n,exRankHint(ex,exRank(ex)),ex);};
        (tools.parentNode?tools:ph).parentNode.insertBefore(hi,(tools.parentNode?tools:ph).nextSibling);}
    }
  });
  var go=$("fw-wo-go");
  if(!go){go=el("button","btn primary fw-wo-go");go.id="fw-wo-go";go.type="button";document.body.appendChild(go);
    go.onclick=function(){
      var p=$("wo-pager");if(!p||!workout)return;
      var we=workout.exercises[woPage];if(!we||!we.sets)return;
      var cur=-1;for(var k=0;k<we.sets.length;k++){if(!we.sets[k].done){cur=k;break;}}
      if(cur>=0){var ck=p.querySelector('.wo-page[data-i="'+woPage+'"] .wo-row[data-s="'+cur+'"] .wo-check');if(ck)ck.click();}
      else{woPage=Math.min(woPage+1,workout.exercises.length);woGoto(woPage,true);woDots();woFillFigs();}
    };}
  fwWoStats();
}
function fwWoStats(){
  var go=$("fw-wo-go");
  var live=!!workout&&tab==="tab-training"&&document.body.classList.contains("wo-live");
  if(go)go.hidden=true;document.body.classList.remove("fw-go-on");
  if(!workout)return;
  var vol=0,done=0,tot=0;
  workout.exercises.forEach(function(we){if(!we.sets)return;var ex=exById(we.ex);we.sets.forEach(function(st){tot++;if(!st.done)return;done++;
    if(ex&&ex.t==="load"){var r=ex.uni&&st.repsL!=null&&st.repsR!=null?(+st.repsL||0)+(+st.repsR||0):(+st.reps||0);vol+=(+st.kg||0)*r;}});});
  var a=$("fw-ws-vol"),b=$("fw-ws-sets"),c=$("fw-ws-ex"),n=workout.exercises.length;
  if(a)a.textContent=fmtNum(Math.round(vol))+" kg";if(b)b.textContent=done+"/"+tot;
  if(c)c.textContent=n?Math.min(woPage+1,n)+"/"+n:"–";
  if(!go||!live)return;
  var we=workout.exercises[woPage];if(!we||!we.sets)return;
  var cur=-1;for(var k=0;k<we.sets.length;k++){if(!we.sets[k].done){cur=k;break;}}
  go.innerHTML="";
  if(cur>=0){go.innerHTML=svgIcon("M5 12.5l4.5 4.5L19 7.5",2.6);go.appendChild(document.createTextNode("Satz "+(cur+1)+" abschließen"));}
  else if(woPage<n-1){go.appendChild(document.createTextNode("Nächste Übung"));go.insertAdjacentHTML("beforeend",svgIcon("M9 5l7 7-7 7",2.4));}
  else return;
  go.hidden=false;document.body.classList.add("fw-go-on");
}
(function(){
  var oR=renderSessionInner;renderSessionInner=function(){oR();try{fwWoDecorate();}catch(e){}};
  var oU=woUpdate;woUpdate=function(){oU();try{fwWoStats();}catch(e){}};
  var oD=woDots;woDots=function(){oD();try{fwWoStats();}catch(e){}};
  var oS=selectTab;selectTab=function(id){oS(id);try{fwWoStats();}catch(e){}};
  var oF=renderSession;renderSession=function(){oF();try{fwWoStats();}catch(e){}};
})();

/* Rechts in der Kopfzeile je Seite die passende Schnellaktion (neben dem Konto-Knopf):
   Heute die Serie, Körper die Rang-Ansicht, Ränge die Vitrine, Du die Einstellungen.
   Training bewusst ohne - der Plan hat dort seinen Knopf über der Liste. */
function fwHeadAction(){
  var bar=document.querySelector(".appbar"),me=$("fw-me");if(!bar||!me)return;
  var b=$("fw-hact");if(!b){b=el("button","fw-hact");b.id="fw-hact";b.type="button";bar.insertBefore(b,me);}
  var cfg={
    "tab-koerper":["M12 2.8l7.5 3v6.1c0 4.4-3.1 7.7-7.5 9.3-4.4-1.6-7.5-4.9-7.5-9.3V5.8zM12 7.6l1.4 2.8 3.1.4-2.3 2.1.6 3-2.8-1.5-2.8 1.5.6-3-2.3-2.1 3.1-.4z","Ränge",function(){var rb=$("rkmode");if(rb)rb.click();setTimeout(fwHeadAction,50);}],
    "tab-raenge":["M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8.5 20h7M10 17h4","Vitrine",function(){try{vtOpen("tro");}catch(e){}}],
    "tab-werte":["M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 8.6 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8.6a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.6.78 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z","Einstellungen",function(){try{openSettingsPage();}catch(e){}}]
  }[tab];
  if(!cfg){b.hidden=true;return;}
  b.hidden=false;b.innerHTML=svgIcon(cfg[0],1.9);b.appendChild(el("span",null,cfg[1]));b.setAttribute("aria-label",cfg[1]);b.onclick=cfg[2];
  b.classList.toggle("on",tab==="tab-koerper"&&bodyMode==="rank");
}

/* Englische Beschriftungen der neuen Teile (Übersetzung über den Text, siehe 11-sprache.js). */
(function(){
  if(typeof UI_EN!=="object")return;
  var add={"Ränge":"Ranks","Du":"You","Übungen":"Exercises","Deine Rangkarten":"Your rank cards","Gesamtstärke":"Overall strength",
    "Noch kein Rang":"No rank yet","Erscheinungsbild":"Appearance","Gilt nur auf diesem Gerät":"Only on this device",
    "Dunkel":"Dark","Hell":"Light","System":"System","Training läuft":"Workout running","Weitermachen":"Continue",
    "Training starten":"Start workout","Zeit fürs Training":"Time to train","Wochenziel erreicht":"Weekly goal reached",
    "Training erledigt":"Workout done","Noch ein paar Minuten Mobilität":"A few minutes of mobility","Mobilität eintragen":"Log mobility",
    "Alles erledigt":"All done","Stark gemacht heute":"Great work today","Höchster Rang erreicht":"Highest rank reached",
    "Übungen entdecken":"Explore exercises","Rang":"Rank","Aufnehmen":"Add","Mehr anpassen":"Adjust more","Im Plan · in dieser Reihenfolge":"In plan · in this order","Nicht im Plan":"Not in plan","Mein Plan":"My plan","Plan bearbeiten":"Edit plan","Plan festlegen":"Set plan","Weitere Einheiten":"More sessions","Übung suchen":"Search exercises","Plan":"Plan","Vitrine":"Trophy case","Plan speichern":"Save plan","Leg deinen Plan fest":"Set your plan","Übernehmen":"Use it","Anpassen":"Adjust","Überspringen – nächste Einheit im Plan":"Skip – next session in plan","Ränge auf dem Körper":"Ranks on the body","Fertig":"Done","Sätze":"Sets","Nächste Übung":"Next exercise","Training einklappen":"Minimize workout","Dein Formwert":"Your Formwert","Diese Woche":"This week","Trainings­tage geschafft":"training days done","Topform erreicht":"Top form reached","Konto und Einstellungen":"Account and settings","Ruhe":"Rest","Das trainierst du":"What you train","Ränge auf dem Körper":"Ranks on the body","Was steht an?":"What's next?","Frei trainieren":"Train freely","Deine Einheiten":"Your sessions","Als Nächstes":"Up next","Schnell eintragen":"Quick log","nachtragen":"log later","Notiz":"Note","bearbeiten":"edit","Wie lief der Tag?":"How was the day?","heute erledigt ✓":"done today ✓","Leer starten – Übungen fügst du unterwegs hinzu":"Start empty – add exercises as you go","Volumen":"Volume","Rang je Muskel":"Rank per muscle","beste Übung als Hauptmuskel":"best exercise as primary muscle","ohne Rang":"no rank","Zusatztraining oder Erholung":"Extra session or recovery"};
  for(var k in add)if(!UI_EN[k])UI_EN[k]=add[k];
})();
