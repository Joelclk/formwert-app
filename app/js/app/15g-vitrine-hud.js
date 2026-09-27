/* =========================================================================
   app/15g-vitrine-hud.js - Vitrine als eigene dunkle Seite (Stil wie die Arrow-App):
   Regal mit 3 Lieblingsplaetzen, Reiter Trophaeen / Abzeichen / Geheim, Detailseite je
   Reihe mit grosser Medaille, Stufenleiste und "Was fehlt noch". Rechnet mit den Funktionen
   aus 15f-vitrine.js (MILESTONES, vitrineData, msValue ...) und ersetzt dessen sheetVitrine().
   Gemerkt wird nur das Regal (state.profile.vitrinePins).
   ========================================================================= */
var VT_TITLES=[
 ["Discopumper","Oberkörper-Fan? Zeit für Beine"],["Beintier","Nie den Beintag skippen"],["Brustprotz","Montag ist Brusttag"],
 ["Lat-Lord","Der Rücken trägt die Show"],["Bizeps-Bürgermeister","Arme, Arme, Arme"],["Bauchladen","Sixpack im Angebot"],
 ["Schweizer Taschenmesser","Von allem etwas"],["Hahn","Früh aufstehen"],["Nachteule","Trainieren, wenn andere schlafen"],
 ["Wochenend-Krieger","Nur am Wochenende?"],["Uhrwerk","Immer dieselben Tage"],["Comeback-Kid","???"],
 ["Blitzeinschlag","Kurz und knackig"],["Marathon-Mann","???"],["Schwerlast-Sven","Wenige Wiederholungen, viel Eisen"],
 ["Pump-Hamster","Viele Wiederholungen"],["Ein-Trick-Pony","Eine Übung, immer wieder"],["Übungs-Tourist","Alles einmal probieren"],
 ["PR-Piranha","Rekorde am laufenden Band"],["Cardio-Verweigerer","Nur Eisen, kein Schweiß aus der Lunge"],
 ["Mobi-Mönch","Beweglichkeit ist Kraft"],["Ruhetag-Rebell","???"]
];
var VT_SETNAMES=["Bronze-Set","Silber-Set","Gold-Set","Diamant-Set","Champion-Set"];
var vt={tab:"tro",D:null,L:null,rows:null};

function vtData(){
  var D=vitrineData(),L=msList(D),rows=MILESTONES.map(function(m){
    var v=msValue(m,D),n=0;m.steps.forEach(function(s){if(v!=null&&v>=s)n++;});
    return {m:m,v:v,n:n};
  });
  vt.D=D;vt.L=L;vt.rows=rows;
}
function vtRow(id){for(var i=0;i<vt.rows.length;i++)if(vt.rows[i].m.id===id)return vt.rows[i];return null;}
function vtProg(r){
  if(r.n>=5)return 100;
  var m=r.m,lo=r.n?m.steps[r.n-1]:0,hi=m.steps[r.n],v=r.v||0;
  return Math.max(0,Math.min(99,Math.round((v-lo)/(hi-lo)*100)));
}
function vtPins(){var p=state.profile&&state.profile.vitrinePins;return Array.isArray(p)?p.slice(0,3).concat([null,null,null]).slice(0,3):[null,null,null];}
function vtSetPins(a){if(!state.profile)return;state.profile.vitrinePins=a;persist();}
function vtMedal(r,size){
  var i=Math.max(0,r.n-1),w=el("div","vt-medal");
  w.innerHTML=medalSvg(i,msShort(r.m,r.m.steps[i]),size||100,r.n===0,r.m);
  return w;
}
function vtRing(p,col){
  var w=el("div","vt-ring"),c=2*Math.PI*17;
  w.innerHTML='<svg viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="17" fill="none" stroke="#2a2e33" stroke-width="4"/><circle cx="21" cy="21" r="17" fill="none" stroke="'+(col||"#3fcf7f")+'" stroke-width="4" stroke-linecap="round" stroke-dasharray="'+(c*p/100).toFixed(1)+' '+c.toFixed(1)+'"/></svg><b>'+p+'%</b>';
  return w;
}
function vtReq(m,step){
  if(m.kind==="ex"){
    if(m.unit==="kg")return "Steigere dein Bestgewicht auf "+msStepLabel(m,step)+".";
    if(m.unit==="s")return "Halte "+msStepLabel(m,step)+" am Stück.";
    return "Schaffe "+step+" Wiederholungen in einem Satz.";
  }
  if(m.kind==="big3")return "Bring die Summe aus Bankdrücken, Kniebeuge und Kreuzheben auf "+msStepLabel(m,step)+".";
  if(m.kind==="days")return "Trainiere an insgesamt "+step+" Tagen.";
  if(m.kind==="streak")return "Erreiche dein Wochenziel "+step+" Wochen in Folge.";
  if(m.kind==="vol")return "Bewege insgesamt "+msStepLabel(m,step)+".";
  if(m.kind==="prs")return "Sammle "+step+" Rekorde.";
  if(m.kind==="balance")return "Bring alle 6 Kraftbereiche mindestens auf "+msStepLabel(m,step)+".";
  if(m.kind==="fit")return "Erreiche einen Formwert von "+step+".";
  if(m.kind==="rank")return "Bring deine Gesamtstärke auf "+msStepLabel(m,step)+".";
  return "";
}
function vtCounts(m){
  if(m.kind==="ex"){var l=m.ex.map(function(id){var e=exById(id);return e?e.n:null;}).filter(Boolean);return l.length?l:["Deine Übungen"];}
  return {big3:["Bankdrücken","Kniebeuge","Kreuzheben (jeweils Bestgewicht)"],days:["Jeder Tag mit mindestens einem Satz"],streak:["Wochen, in denen du dein Wochenziel an Trainingstagen erreichst (eine verfehlte Woche pro 8 Wochen wird verziehen)"],
    vol:["Alle Übungen mit Gewicht"],prs:["Rekorde, die du beim Abhaken bekommst"],balance:["Brust","Schultern","Rücken","Arme","Beine","Rumpf"],fit:["Dein Formwert (bester Stand zählt)"],rank:["Deine Gesamtstärke"]}[m.kind]||[];
}

/* ---------- Seite ---------- */
function sheetVitrine(tab){vtOpen(tab);}
function vtOpen(tab){
  var pg=$("vitpage");
  if(!pg){pg=el("div","vitpage");pg.id="vitpage";pg.setAttribute("role","dialog");pg.setAttribute("aria-label","Vitrine");document.body.appendChild(pg);}
  vtData();vt.tab=tab||"tro";pg.hidden=false;document.body.style.overflow="hidden";vtRender();
}
function vtClose(){var pg=$("vitpage");if(pg)pg.hidden=true;document.body.style.overflow="";try{renderErfolge();}catch(e){}}
function vtBackBtn(fn){
  var b=el("button","vt-rb");b.type="button";b.setAttribute("aria-label","Zurück");
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
  b.onclick=fn;return b;
}
function vtRender(){
  var pg=$("vitpage");pg.innerHTML="";
  var top=el("div","vt-top");top.appendChild(vtBackBtn(vtClose));top.appendChild(el("h1",null,"Deine Vitrine"));top.appendChild(el("span","vt-rb ghost"));pg.appendChild(top);
  var shelf=el("div","vt-shelf"),pins=vtPins();
  pins.forEach(function(id,i){
    var b=el("button","vt-slot"+(id?" filled":""));b.type="button";
    var r=id?vtRow(id):null;
    if(r&&r.n>0){b.appendChild(vtMedal(r,80));b.setAttribute("aria-label",r.m.name);}
    else{b.innerHTML='<span class="plus">+</span>';b.setAttribute("aria-label","Platz "+(i+1)+" belegen");}
    b.onclick=function(){vtPick(i);};shelf.appendChild(b);
  });
  pg.appendChild(shelf);
  var seg=el("div","vt-seg");seg.setAttribute("role","tablist");
  [["tro","Trophäen"],["bad","Abzeichen"],["geh","Geheim"]].forEach(function(t){
    var b=el("button",null,t[1]);b.type="button";b.setAttribute("role","tab");b.setAttribute("aria-selected",String(vt.tab===t[0]));
    b.onclick=function(){vt.tab=t[0];vtRender();};seg.appendChild(b);
  });
  pg.appendChild(seg);
  var body=el("div","vt-body");pg.appendChild(body);
  if(vt.tab==="tro")vtTrophies(body);else if(vt.tab==="bad")vtBadges(body);else vtSecret(body);
}
function vtTrophies(b){
  var tot=0;vt.rows.forEach(function(r){tot+=r.n;});
  b.appendChild(el("div","vt-lab",tot+" von "+MILESTONES.length*5+" freigeschaltet"));
  var g=el("div","vt-grid");
  vt.rows.slice().sort(function(a,c){return c.n-a.n;}).forEach(function(r){
    var t=el("button","vt-tile"+(r.n===0?" locked":"")+(r.n===5?" full":""));t.type="button";
    t.setAttribute("aria-label",r.m.name+", "+r.n+" von 5");
    t.appendChild(vtMedal(r,100));t.appendChild(el("span","cnt",r.n+"/5"));t.appendChild(el("span","nm",r.m.name));
    t.onclick=function(){vtDetail(r.m.id);};g.appendChild(t);
  });
  b.appendChild(g);
  // Rekorde je Uebung (Allzeit-Bestwerte)
  var D=vt.D,ids=Object.keys(D.best).filter(function(id){var ex=exById(id);return ex&&ex.t!=="cardio";});
  if(ids.length){
    b.appendChild(el("div","vt-lab","Rekorde je Übung"));
    var cnt={};D.prList.forEach(function(p){cnt[p.ex.id]=(cnt[p.ex.id]||0)+1;});
    ids.sort(function(a,c){return (cnt[c]||0)-(cnt[a]||0)||exById(a).n.localeCompare(exById(c).n);});
    ids.forEach(function(id){
      var ex=exById(id),r=el("button","vt-row");r.type="button";
      var tx=el("div","tx");tx.appendChild(el("b",null,ex.n));
      var bv=ex.t==="load"?fmtNum(D.bestKg[id]||0)+" kg"+(ex.wt==="side"?" pro Seite":"")+" · Maximum ≈ "+fmtNum(Math.round(rawKg(ex,D.bestE[id]||0)*2)/2)+" kg":D.best[id]+(ex.t==="sec"?" s":" Wdh.");
      tx.appendChild(el("span",null,bv+(cnt[id]?" · "+cnt[id]+(cnt[id]===1?" Rekord":" Rekorde"):"")));
      r.appendChild(tx);var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);
      r.onclick=function(){vtClose();setTimeout(function(){sheetExerciseDetail(ex);},120);};
      b.appendChild(r);
    });
  }
}
function vtBadges(b){
  var L=vt.L,tierGot=[0,0,0,0,0],got=0;
  L.forEach(function(x){if(x.got){tierGot[x.i]++;got++;}});
  b.appendChild(el("div","vt-lab","Sammlungen"));
  VT_SETNAMES.forEach(function(nm,i){
    var r=el("div","vt-row static"),ic=el("div","ic");ic.innerHTML=medalSvg(i,"",34,tierGot[i]===0);r.appendChild(ic);
    var tx=el("div","tx");tx.appendChild(el("b",null,nm));tx.appendChild(el("span",null,"Alle "+MILESTONES.length+" "+MEDAL_LV[i].n+"-Medaillen · "+tierGot[i]+" / "+MILESTONES.length));
    r.appendChild(tx);r.appendChild(vtRing(Math.floor(tierGot[i]/MILESTONES.length*100),MEDAL_LV[i].m));b.appendChild(r);
  });
  b.appendChild(el("div","vt-lab","Endziel"));
  var total=MILESTONES.length*5,r2=el("div","vt-row static"),ic2=el("div","ic","★");ic2.style.color="#ff6fa8";r2.appendChild(ic2);
  var tx2=el("div","tx");tx2.appendChild(el("b",null,"Legende-Trophäe"));tx2.appendChild(el("span",null,got>=total?"Geschafft – du bist eine Legende":"Alle "+total+" Medaillen sammeln · "+got+" / "+total));
  r2.appendChild(tx2);r2.appendChild(vtRing(got>=total?100:Math.min(99,Math.floor(got/total*100)),"#ff6fa8"));b.appendChild(r2);
}
function vtSecret(b){
  b.appendChild(el("div","vt-lab","Geheime Titel"));
  b.appendChild(el("p","vt-note","Diese Titel bekommst du für dein Trainingsverhalten – die Berechnung wird gerade gebaut. Hier siehst du schon, welche kommen."));
  VT_TITLES.forEach(function(t){
    var unknown=t[1]==="???",r=el("div","vt-row static"),ic=el("div","ic",unknown?"?":t[0][0]);r.appendChild(ic);
    var tx=el("div","tx");tx.appendChild(el("b",null,unknown?"???":t[0]));tx.appendChild(el("span",null,unknown?"???":"Hinweis: "+t[1]));
    r.appendChild(tx);r.appendChild(vtRing(0));b.appendChild(r);
  });
}

/* ---------- Regal belegen ---------- */
function vtPick(slot){
  var pg=$("vitpage"),old=pg.querySelector(".vt-sheet");if(old)old.remove();
  var sh=el("div","vt-sheet"),inn=el("div","in");sh.appendChild(inn);
  inn.appendChild(el("h3",null,"Trophäe fürs Regal wählen"));
  var have=vt.rows.filter(function(r){return r.n>0;});
  if(!have.length)inn.appendChild(el("p","vt-note","Noch keine Medaille – die erste holst du dir mit deinem nächsten Training."));
  var g=el("div","vt-grid");
  have.forEach(function(r){
    var t=el("button","vt-tile");t.type="button";t.appendChild(vtMedal(r,100));t.appendChild(el("span","nm",r.m.name));
    t.onclick=function(){var p=vtPins();p[slot]=r.m.id;vtSetPins(p);vtRender();};g.appendChild(t);
  });
  inn.appendChild(g);
  if(vtPins()[slot]){var rm=el("button","vt-btn","Platz leeren");rm.type="button";rm.onclick=function(){var p=vtPins();p[slot]=null;vtSetPins(p);vtRender();};inn.appendChild(rm);}
  sh.onclick=function(e){if(e.target===sh)sh.remove();};
  pg.appendChild(sh);
}

/* ---------- Detailseite ---------- */
function vtDetail(id){
  var r=vtRow(id),m=r.m,n=r.n,pg=$("vitpage");
  var old=pg.querySelector(".vt-detail");if(old)old.remove();
  var d=el("div","vt-detail"),top=el("div","vt-top");
  top.appendChild(vtBackBtn(function(){d.classList.remove("on");setTimeout(function(){d.remove();},280);}));
  top.appendChild(el("h1",null,m.name));top.appendChild(el("span","vt-rb ghost"));d.appendChild(top);
  d.appendChild(el("div","vt-dcount",n+"/5 freigeschaltet"));
  var stg=el("div","vt-stage"),gi=Math.max(0,n-1);stg.style.setProperty("--gc",MEDAL_LV[gi].m+"88");
  stg.appendChild(el("div","glow"));
  var big=el("div","big"+(n===0?" locked":""));big.innerHTML=medalSvg(gi,msShort(m,m.steps[gi]),190,n===0,m);stg.appendChild(big);d.appendChild(stg);
  var tr=el("div","vt-tiers");
  m.steps.forEach(function(s,i){
    var t=el("div","t"+(i<n?"":" off")+(i===n?" cur":""));
    t.innerHTML=medalSvg(i,msShort(m,s),52,false,m);t.appendChild(el("div",null,MEDAL_LV[i].n));
    if(i<n){var dt=msDate(m,vt.D,s);if(dt)t.appendChild(el("div","dt",shortDate(dt)));}
    tr.appendChild(t);
  });
  d.appendChild(tr);
  var c=el("div","vt-dcard"),h=el("div","vt-dhead"),tx=el("div","tx"),ni=n<5?n:4;
  tx.appendChild(el("b",null,m.name+(n<5?" · "+MEDAL_LV[ni].n:" · komplett")));
  tx.appendChild(el("span",null,n<5?vtReq(m,m.steps[ni])+" ("+msRemain(m,r.v,m.steps[ni])+")":"Alle Stufen geschafft."));
  h.appendChild(tx);h.appendChild(vtRing(vtProg(r),n<5?MEDAL_LV[ni].m:"#3fcf7f"));c.appendChild(h);
  var mo=el("div","vt-more"),bt=el("button");bt.type="button";
  bt.innerHTML='<span>Zählt aus</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>';
  bt.onclick=function(){mo.classList.toggle("open");};mo.appendChild(bt);
  var ul=el("ul");vtCounts(m).forEach(function(x){ul.appendChild(el("li",null,x));});mo.appendChild(ul);c.appendChild(mo);
  if(n>0){
    var pins=vtPins(),on=pins.indexOf(id)>=0,pn=el("button","vt-btn",on?"Aus dem Regal nehmen":"Ans Regal heften");pn.type="button";
    pn.onclick=function(){var p=vtPins(),k=p.indexOf(id);
      if(k>=0)p[k]=null;else{k=p.indexOf(null);if(k<0)k=0;p[k]=id;}
      vtSetPins(p);vtRender();};
    c.appendChild(pn);
  }
  d.appendChild(c);pg.appendChild(d);
  requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add("on");});});
}
