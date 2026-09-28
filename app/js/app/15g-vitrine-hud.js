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
/* Abzeichen: je Stufe eine Sammlung (alle 17 Medaillen dieser Stufe) als Karte mit
   aufgefaecherten echten Medaillen-Bildern, Balken und Liste zum Antippen; oben drueber das
   Endziel (alle 85). */
var VT_FAN_PREF=["bench","streak","records","pullup","big3","days","squat","fit","rank","deadlift","volume","balance","row","ohp","dips","pushup","plank"];
function vtFanPick(i,k){
  var got=[],rest=[];
  VT_FAN_PREF.forEach(function(id){var r=vtRow(id);if(!r)return;(r.n>i?got:rest).push(r);});
  vt.rows.forEach(function(r){if(VT_FAN_PREF.indexOf(r.m.id)<0)(r.n>i?got:rest).push(r);});
  return got.concat(rest).slice(0,k).map(function(r){return {r:r,got:r.n>i};});
}
function vtFan(items,size){
  var f=el("div","vt-fan"),n=items.length;f.style.setProperty("--n",n);
  items.forEach(function(it,j){
    var w=el("div","fm");w.innerHTML=medalSvg(it.i,"",size,!it.got,it.m);
    w.style.setProperty("--rot",((j-(n-1)/2)*11).toFixed(1)+"deg");w.style.zIndex=String(j===Math.floor(n/2)?9:j);
    f.appendChild(w);
  });
  return f;
}
function vtBar(p,col){var b=el("div","vt-bar"),i=el("i");i.style.width=Math.max(p>0?3:0,p)+"%";i.style.background=col;b.appendChild(i);return b;}
function vtBadges(b){
  var L=vt.L,tierGot=[0,0,0,0,0],got=0,N=MILESTONES.length,total=N*5;
  L.forEach(function(x){if(x.got){tierGot[x.i]++;got++;}});
  // Endziel
  b.appendChild(el("div","vt-lab","Endziel"));
  var lg=el("div","vt-set legend"+(got>=total?" done":""));
  var fanL=[0,1,2,3,4].map(function(i){var r=vtRow(VT_FAN_PREF[i*3%VT_FAN_PREF.length])||vt.rows[0];return {i:i,m:r.m,got:tierGot[i]>0};});
  lg.appendChild(vtFan(fanL,54));
  var lt=el("div","tx");lt.appendChild(el("b",null,"Legende-Trophäe"));
  lt.appendChild(el("span",null,got>=total?"Geschafft – du bist eine Legende":"Alle "+total+" Medaillen sammeln"));
  lt.appendChild(vtBar(Math.floor(got/total*100),"linear-gradient(90deg,#FFD84A,#FF6FA8,#7A6BFF)"));
  lt.appendChild(el("span","ct",got+" / "+total));
  lg.appendChild(lt);b.appendChild(lg);
  // Sammlungen
  b.appendChild(el("div","vt-lab","Sammlungen"));
  VT_SETNAMES.forEach(function(nm,i){
    var c=MEDAL_LV[i],k=tierGot[i],card=el("button","vt-set"+(k?" on":"")+(k>=N?" full":""));card.type="button";
    card.style.setProperty("--tc",c.m);card.setAttribute("aria-label",nm+", "+k+" von "+N);
    card.appendChild(vtFan(vtFanPick(i,3).map(function(x){return {i:i,m:x.r.m,got:x.got};}),50));
    var tx=el("div","tx");tx.appendChild(el("b",null,nm));
    tx.appendChild(el("span",null,k>=N?"Komplett – alle "+N+" "+c.n+"-Medaillen":"Alle "+N+" "+c.n+"-Medaillen"));
    tx.appendChild(vtBar(Math.floor(k/N*100),c.m));tx.appendChild(el("span","ct",k+" / "+N));
    card.appendChild(tx);
    var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);card.appendChild(ch);
    card.onclick=function(){vtSetSheet(i);};
    b.appendChild(card);
  });
}
/* Liste aller Medaillen einer Stufe: geholte farbig, fehlende grau mit Fortschritt; Antippen oeffnet die Reihe. */
function vtSetSheet(i){
  var pg=$("vitpage"),old=pg.querySelector(".vt-sheet");if(old)old.remove();
  var sh=el("div","vt-sheet"),inn=el("div","in");sh.appendChild(inn);
  var k=vt.rows.filter(function(r){return r.n>i;}).length;
  inn.appendChild(el("h3",null,VT_SETNAMES[i]+" · "+k+" / "+vt.rows.length));
  var g=el("div","vt-grid");
  vt.rows.slice().sort(function(a,c){return (c.n>i)-(a.n>i)||c.n-a.n;}).forEach(function(r){
    var has=r.n>i,t=el("button","vt-tile"+(has?"":" locked"));t.type="button";
    var md=el("div","vt-medal");md.innerHTML=medalSvg(i,msShort(r.m,r.m.steps[i]),100,!has,r.m);t.appendChild(md);
    t.appendChild(el("span","cnt",has?"✓":msShort(r.m,r.m.steps[i])));t.appendChild(el("span","nm",r.m.name));
    t.setAttribute("aria-label",r.m.name+" "+MEDAL_LV[i].n+(has?", geschafft":""));
    t.onclick=function(){sh.remove();vtDetail(r.m.id,i);};g.appendChild(t);
  });
  inn.appendChild(g);
  sh.onclick=function(e){if(e.target===sh)sh.remove();};
  pg.appendChild(sh);
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

/* ---------- Detailseite ----------
   Jede der 5 Stufen ist antippbar: die Karte zeigt dann, was man fuer genau diese Stufe braucht,
   wie weit man ist (Ring) und unter "Dein Stand" jeden einzelnen Bereich/Wert mit Haken. */
function vtRkScore(step){return step>=RANK_N?100:step*100/RANK_N;}
function vtPctFor(m,v,step){
  if(v==null)return 0;
  if(m.kind==="rank"){var o=overallRank();return o?Math.floor(Math.min(1,o.score/vtRkScore(step))*100):0;}
  if(m.kind==="balance"){var c=compute(TODAY),mn=100;(c.cats||[]).forEach(function(ct){mn=Math.min(mn,ct.exs&&ct.exs.length?ct.score:0);});
    return Math.floor(Math.min(1,mn/vtRkScore(step))*100);}
  return Math.floor(Math.min(1,Math.max(0,v/step))*100);
}
/* Zeilen fuer "Dein Stand": {l:Bezeichnung, v:aktueller Wert, ok:true/false/null (null = nur Info)} */
function vtStand(m,step){
  var D=vt.D,out=[];
  function fmtEx(ex,v){return ex.t==="load"?fmtNum(v)+" kg"+(ex.wt==="side"?" pro Seite":""):ex.t==="sec"?fmtSec(v):v+" Wdh.";}
  if(m.kind==="ex"){
    m.ex.forEach(function(id){var ex=exById(id);if(!ex)return;var v=D.best[id];
      out.push({l:ex.n,v:v!=null?fmtEx(ex,v):"noch nicht gemacht",ok:v!=null?v>=step:false});});
    if(m.ex.length>1)out.push({note:"Es zählt die beste der Varianten."});
  }else if(m.kind==="big3"){
    [["bench","Bankdrücken"],["squat","Kniebeuge"],["deadlift","Kreuzheben"]].forEach(function(p){
      var v=D.best[p[0]];out.push({l:p[1],v:v!=null?fmtNum(v)+" kg":"noch nicht gemacht",ok:null});});
    out.push({l:"Summe",v:fmtNum(D.big3||0)+" kg",ok:(D.big3||0)>=step,sum:true});
  }else if(m.kind==="balance"||m.kind==="rank"){
    var c=compute(TODAY);
    (c.cats||[]).forEach(function(ct){
      var has=ct.exs&&ct.exs.length,rk=has?rankFromScore(ct.score):null;
      out.push({l:ct.name,v:rk?rk.name:"noch keine Übung",ok:m.kind==="balance"?(rk?rk.r>=step:false):null});});
    if(m.kind==="rank"){var o=overallRank();out.push({l:"Gesamtstärke (Schnitt)",v:o?o.name:"–",ok:o?o.r>=step:false,sum:true});}
  }else if(m.kind==="fit"){
    var now=compute(TODAY).fitness,pk=(state.profile&&state.profile.peaks&&state.profile.peaks.fitness)||0;
    out.push({l:"Formwert heute",v:String(now),ok:null});
    out.push({l:"Dein bester Formwert",v:String(Math.max(now,pk)),ok:Math.max(now,pk)>=step,sum:true});
  }else if(m.kind==="streak"){
    var g=(state.profile&&state.profile.goals&&state.profile.goals.days)||0;
    out.push({l:"Wochenziel",v:g?g+" Trainingstage pro Woche":"nicht gesetzt",ok:null});
    out.push({l:"Längste Serie",v:(D.streak||0)+((D.streak||0)===1?" Woche":" Wochen"),ok:(D.streak||0)>=step,sum:true});
  }else if(m.kind==="days"){
    out.push({l:"Trainingstage bisher",v:String(D.trainDays.length),ok:D.trainDays.length>=step,sum:true});
  }else if(m.kind==="vol"){
    out.push({l:"Bewegt bisher",v:fmtNum(Math.round(D.vol*10)/10)+" t",ok:D.vol>=step,sum:true});
  }else if(m.kind==="prs"){
    out.push({l:"Rekorde bisher",v:String(D.prs),ok:D.prs>=step,sum:true});
  }
  return out;
}
/* "Was fehlt noch" - bei Ausgewogen/Gesamtstaerke konkreter als der allgemeine Text. */
function vtRemain(m,v,step){
  if(m.kind==="balance"){var c=compute(TODAY),k=0;(c.cats||[]).forEach(function(ct){var rk=ct.exs&&ct.exs.length?rankFromScore(ct.score):null;if(!rk||rk.r<step)k++;});
    return "noch "+k+" von "+(c.cats||[]).length+" Bereichen darunter";}
  if(m.kind==="rank"){var o=overallRank();if(!o)return "noch keine Kraftwerte";var d=step-o.r;
    return "noch "+d+(d===1?" Stufe":" Stufen")+" ("+o.name+" → "+rankByIndex(step).name+")";}
  return msRemain(m,v,step);
}
function vtDetail(id,sel,keep){
  var r=vtRow(id),m=r.m,n=r.n,pg=$("vitpage");
  if(sel==null)sel=n<5?n:4;
  var old=pg.querySelector(".vt-detail"),d;
  if(keep&&old){d=old;d.innerHTML="";}
  else{if(old)old.remove();d=el("div","vt-detail");}
  var top=el("div","vt-top");
  top.appendChild(vtBackBtn(function(){d.classList.remove("on");setTimeout(function(){d.remove();},280);}));
  top.appendChild(el("h1",null,m.name));top.appendChild(el("span","vt-rb ghost"));d.appendChild(top);
  d.appendChild(el("div","vt-dcount",n+"/5 freigeschaltet"));
  var got=sel<n,step=m.steps[sel];
  var stg=el("div","vt-stage");stg.style.setProperty("--gc",MEDAL_LV[sel].m+"88");
  stg.appendChild(el("div","glow"));
  var big=el("div","big"+(got?"":" locked"));big.innerHTML=medalSvg(sel,msShort(m,step),190,!got,m);stg.appendChild(big);d.appendChild(stg);
  var tr=el("div","vt-tiers");tr.setAttribute("role","tablist");
  m.steps.forEach(function(s,i){
    var t=el("button","t"+(i<n?"":" off")+(i===sel?" sel":""));t.type="button";t.setAttribute("role","tab");
    t.setAttribute("aria-selected",String(i===sel));t.setAttribute("aria-label",MEDAL_LV[i].n+": "+msStepLabel(m,s)+(i<n?", geschafft":""));
    t.innerHTML=medalSvg(i,msShort(m,s),52,false,m);
    t.appendChild(el("div","nm",MEDAL_LV[i].n));t.appendChild(el("div","lv",msStepLabel(m,s)));
    t.onclick=function(){vtDetail(id,i,true);};
    tr.appendChild(t);
  });
  d.appendChild(tr);
  var scr=el("div","vt-dscroll"),c=el("div","vt-dcard"),h=el("div","vt-dhead"),tx=el("div","tx");
  tx.appendChild(el("b",null,m.name+" · "+MEDAL_LV[sel].n));
  var dt=got?msDate(m,vt.D,step):null;
  tx.appendChild(el("span",null,vtReq(m,step)));
  tx.appendChild(el("span","st"+(got?" ok":""),got?"✓ Geschafft"+(dt?" am "+shortDate(dt):""):vtRemain(m,r.v,step)));
  h.appendChild(tx);h.appendChild(vtRing(got?100:Math.min(99,vtPctFor(m,r.v,step)),MEDAL_LV[sel].m));c.appendChild(h);
  var rows=vtStand(m,step);
  if(rows.length){
    var sd=el("div","vt-stand");sd.appendChild(el("div","hd","Dein Stand"));
    rows.forEach(function(x){
      if(x.note){sd.appendChild(el("div","nt",x.note));return;}
      var rw=el("div","rw"+(x.sum?" sum":"")+(x.ok===true?" ok":x.ok===false?" no":""));
      rw.appendChild(el("span","l",x.l));rw.appendChild(el("span","v",x.v));
      rw.appendChild(el("span","ck",x.ok===true?"✓":x.ok===false?"–":""));
      sd.appendChild(rw);
    });
    c.appendChild(sd);
  }
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
  scr.appendChild(c);d.appendChild(scr);
  if(!(keep&&old)){pg.appendChild(d);requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add("on");});});}
}
