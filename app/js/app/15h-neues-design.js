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

/* ================= Heute-Karte =================
   Ganz oben auf "Heute": genau eine Sache, die jetzt dran ist, mit einem großen Knopf.
   Reihenfolge der Fälle wie bei renderHeroNext(): laufendes Training > Training > Mobilität > fertig.
   Die nächste Einheit ist die, die in deiner Reihenfolge auf die zuletzt gemachte folgt. */
function fwNextRoutine(){
  var ids=routineIds();if(!ids.length)return null;
  var last=routineLastUse(),best=-1,bestD="";
  ids.forEach(function(id,i){var r=state.routines[id],lu=r&&last[r.name];if(lu&&lu.d>=bestD){bestD=lu.d;best=i;}});
  return ids[(best+1)%ids.length];
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
    eye=w.train<goal?"Heute dran · "+w.train+" von "+goal+" Tagen":"Wochenziel erreicht";
    if(r){
      title=r.name;
      var nSets=r.items.reduce(function(a,i){return a+(i.sets||0);},0);
      sub=r.items.length+" Übungen · "+nSets+" Sätze";
      chips=fwRegionsOf(r.items);
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
  if(chips.length){var cw=el("div","hk-chips");chips.forEach(function(c){cw.appendChild(el("span","hk-chip",c));});tx.appendChild(cw);}
  top.appendChild(tx);
  if(fig){var fw=el("div","hk-fig");fw.setAttribute("aria-hidden","true");fw.appendChild(fig);top.appendChild(fw);}
  box.appendChild(top);
  if(btn){
    var b=el("button","btn primary block fw-go");b.type="button";
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l10.4-6.8c.6-.4.6-1.3 0-1.7L9.6 4.4C8.9 3.9 8 4.4 8 5.2z" fill="currentColor"/></svg>';
    b.appendChild(document.createTextNode(btn[0]));b.onclick=btn[1];box.appendChild(b);
  }
  if(fig)requestAnimationFrame(function(){try{drawMini(fig,"front",fig._sets);}catch(e){}});
}

/* ================= Schwebende Leiste: laufendes Training =================
   Wie ein Musik-Miniplayer: solange ein Training läuft, ist es von jedem Tab aus einen Tipp
   entfernt. Auf dem Trainings-Tab selbst und auf "Heute" (dort zeigt es die Heute-Karte) nicht. */
function fwMiniUpdate(){
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
    var free=sw.querySelector(".free-card");
    if(free&&sw.firstElementChild!==free){
      var h=free.previousElementSibling;if(h&&h.classList.contains("sec"))h.remove();
      var intro=sw.querySelector(".tr-intro");if(intro)intro.remove();
      sw.insertBefore(free,sw.firstChild);
    }
    var top=$("rc-top");
    if(!top){top=el("div","rc-top");top.id="rc-top";sw.insertBefore(top,free?free.nextSibling:sw.firstChild);}
    top.innerHTML="";
    Array.prototype.slice.call(list.querySelectorAll(".rc-add-row")).forEach(function(b){top.appendChild(b);});
    top.hidden=!top.children.length;
  };
})();

/* Englische Beschriftungen der neuen Teile (Übersetzung über den Text, siehe 11-sprache.js). */
(function(){
  if(typeof UI_EN!=="object")return;
  var add={"Ränge":"Ranks","Du":"You","Übungen":"Exercises","Deine Rangkarten":"Your rank cards","Gesamtstärke":"Overall strength",
    "Noch kein Rang":"No rank yet","Erscheinungsbild":"Appearance","Gilt nur auf diesem Gerät":"Only on this device",
    "Dunkel":"Dark","Hell":"Light","System":"System","Training läuft":"Workout running","Weitermachen":"Continue",
    "Training starten":"Start workout","Zeit fürs Training":"Time to train","Wochenziel erreicht":"Weekly goal reached",
    "Training erledigt":"Workout done","Noch ein paar Minuten Mobilität":"A few minutes of mobility","Mobilität eintragen":"Log mobility",
    "Alles erledigt":"All done","Stark gemacht heute":"Great work today","Höchster Rang erreicht":"Highest rank reached",
    "Übungen entdecken":"Explore exercises","Rang":"Rank","Ränge auf dem Körper":"Ranks on the body","Was steht an?":"What's next?","Frei trainieren":"Train freely","Deine Einheiten":"Your sessions","Als Nächstes":"Up next","Schnell eintragen":"Quick log","nachtragen":"log later","Notiz":"Note","bearbeiten":"edit","Wie lief der Tag?":"How was the day?","heute erledigt ✓":"done today ✓","Leer starten – Übungen fügst du unterwegs hinzu":"Start empty – add exercises as you go","Volumen":"Volume","Rang je Muskel":"Rank per muscle","beste Übung als Hauptmuskel":"best exercise as primary muscle","ohne Rang":"no rank","Zusatztraining oder Erholung":"Extra session or recovery"};
  for(var k in add)if(!UI_EN[k])UI_EN[k]=add[k];
})();
