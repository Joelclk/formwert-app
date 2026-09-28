/* =========================================================================
   app/15g-vitrine-hud.js - Vitrine als eigene dunkle Seite (Stil wie die Arrow-App):
   Regal mit 3 Lieblingsplaetzen, Reiter Trophaeen / Abzeichen / Geheim, Detailseite je
   Reihe mit grosser Medaille, Stufenleiste und "Was fehlt noch". Rechnet mit den Funktionen
   aus 15f-vitrine.js (MILESTONES, vitrineData, msValue ...) und ersetzt dessen sheetVitrine().
   Gemerkt wird nur das Regal (state.profile.vitrinePins).
   ========================================================================= */
/* Geheime Titel (Aufnaeher). Einmal verdient = fuer immer (state.profile.titles {id: Datum}),
   einer davon tragbar (state.profile.titleWorn). h = Raetsel-Hinweis auf der verdeckten Karte,
   how = Erklaerung nach dem Freischalten. Hinweis "???" = ganz geheim. */
var VT_TITLES=[
 {id:"disco",   n:"Discopumper",            h:"Oberkörper-Fan? Zeit für Beine",   how:"4 Wochen lang über 80 % deiner Kraftsätze für den Oberkörper."},
 {id:"beintier",n:"Beintier",               h:"Nie den Beintag skippen",          how:"4 Wochen lang mindestens 35 % deiner Kraftsätze für die Beine."},
 {id:"brust",   n:"Brustprotz",             h:"Montag ist Brusttag",              how:"An 4 verschiedenen Montagen Brust trainiert."},
 {id:"lat",     n:"Lat-Lord",               h:"Der Rücken trägt die Show",        how:"4 Wochen lang mindestens 30 % deiner Kraftsätze für den Rücken."},
 {id:"bizeps",  n:"Bizeps-Bürgermeister",   h:"Arme, Arme, Arme",                 how:"4 Wochen lang mindestens 25 % deiner Kraftsätze für die Arme."},
 {id:"bauch",   n:"Panzerbauch",            h:"Hart wie ein Panzer",              how:"4 Wochen lang mindestens 20 % deiner Kraftsätze für den Rumpf."},
 {id:"messer",  n:"Schweizer Taschenmesser",h:"Von allem etwas",                  how:"In einer Woche alle 6 Kraftbereiche, Ausdauer und Mobilität."},
 {id:"hahn",    n:"Hahn",                   h:"Früh aufstehen",                   how:"10 Trainings vor 7 Uhr begonnen."},
 {id:"eule",    n:"Nachteule",              h:"Trainieren, wenn andere schlafen", how:"10 Trainings nach 21 Uhr begonnen."},
 {id:"wochenende",n:"Wochenend-Krieger",    h:"Nur am Wochenende?",               how:"6 Wochen, in denen du nur samstags oder sonntags trainiert hast."},
 {id:"uhrwerk", n:"Uhrwerk",                h:"Immer dieselben Tage",             how:"6 Wochen in Folge an genau denselben Wochentagen trainiert."},
 {id:"comeback",n:"Comeback-Kid",           h:"???",                              how:"Nach mindestens 3 Wochen Pause wieder eingestiegen."},
 {id:"blitz",   n:"Blitzeinschlag",         h:"Kurz und knackig",                 how:"5 Trainings unter 30 Minuten mit mindestens 10 Sätzen."},
 {id:"marathon",n:"Marathon-Mann",          h:"???",                              how:"Ein Training über 2 Stunden."},
 {id:"schwer",  n:"Schwerlast-Sven",        h:"Wenige Wiederholungen, viel Eisen",how:"50 Sätze mit Gewicht und höchstens 5 Wiederholungen."},
 {id:"pump",    n:"Pump-Hamster",           h:"Viele Wiederholungen",             how:"50 Sätze mit Gewicht und mindestens 15 Wiederholungen."},
 {id:"pony",    n:"Ein-Trick-Pony",         h:"Eine Übung, immer wieder",         how:"Dieselbe Übung an 10 Trainingstagen in Folge."},
 {id:"tourist", n:"Übungs-Tourist",         h:"Alles einmal probieren",           how:"40 verschiedene Übungen gemacht."},
 {id:"piranha", n:"PR-Piranha",             h:"Rekorde am laufenden Band",        how:"5 Rekorde an einem einzigen Tag."},
 {id:"cardiono",n:"Cardio-Verweigerer",     h:"Nur Eisen, kein Schweiß aus der Lunge",how:"6 Wochen mit mindestens 12 Trainingstagen und keiner Minute Ausdauer."},
 {id:"mobi",    n:"Mobi-Mönch",             h:"Beweglichkeit ist Kraft",          how:"An 30 Tagen Mobilität gemacht."},
 {id:"rebell",  n:"Ruhetag-Rebell",         h:"???",                              how:"7 Tage am Stück trainiert."}
];
function vtTitleById(id){for(var i=0;i<VT_TITLES.length;i++)if(VT_TITLES[i].id===id)return VT_TITLES[i];return null;}
/* Rechnet aus dem ganzen Verlauf, wann jeder Titel zum ersten Mal erfuellt war (Datum oder null). */
function vtTitleEval(){
  var days=Object.keys(state.days).filter(function(k){return k<=TODAY;}).sort(),out={};
  var td=[],info={},CATS=["chest","shoulders","back","arms","legs","core"];
  function hit(id,d){if(!out[id])out[id]=d;}
  var exSeen={},exFirst=0,wkHour=[],heavy=0,pump=0;
  days.forEach(function(k){
    var dd=state.days[k],c={chest:0,shoulders:0,back:0,arms:0,legs:0,core:0},n=0,exs={},minTs=null;
    (dd.sets||[]).forEach(function(s){var ex=exById(s.ex);if(!ex||ex.mob||!(s.reps>0))return;
      var cid=catOfEx(ex);if(cid&&c[cid]!=null){c[cid]++;n++;}exs[ex.id]=1;
      if(!exSeen[ex.id]){exSeen[ex.id]=1;exFirst++;if(exFirst>=40)hit("tourist",k);}
      if(ex.t==="load"&&(s.kg||0)>0){if(s.reps<=5){heavy++;if(heavy>=50)hit("schwer",k);}if(s.reps>=15){pump++;if(pump>=50)hit("pump",k);}}
      if(s.ts&&(minTs==null||s.ts<minTs))minTs=s.ts;});
    var cardio=(dd.cardio||[]).reduce(function(a,x){return a+(x.min||0);},0),mob=mobDay(dd).units>=1,train=isTrainDay(dd);
    (dd.workouts||[]).forEach(function(w){if(w.start&&(minTs==null||w.start<minTs))minTs=w.start;
      if(w.dur>=7200)hit("marathon",k);
      if(w.dur>0&&w.dur<1800&&(w.sets||0)>=10){info.blitz=(info.blitz||0)+1;if(info.blitz>=5)hit("blitz",k);}});
    if(train&&minTs){var hr=new Date(minTs).getHours();
      if(hr<7){info.hahn=(info.hahn||0)+1;if(info.hahn>=10)hit("hahn",k);}
      if(hr>=21){info.eule=(info.eule||0)+1;if(info.eule>=10)hit("eule",k);}}
    if(mob){info.mobi=(info.mobi||0)+1;if(info.mobi>=30)hit("mobi",k);}
    if(train&&c.chest>0&&parseIso(k).getDay()===1){info.brust=(info.brust||0)+1;if(info.brust>=4)hit("brust",k);}
    td.push({d:k,c:c,n:n,exs:exs,cardio:cardio,mob:mob,train:train});
  });
  var T=td.filter(function(x){return x.train;});
  // Serien: 7 Tage am Stueck, Comeback nach 21 Tagen Pause (mit mindestens 5 Trainingstagen davor)
  var run=0,runEx={},prev=null;
  T.forEach(function(x,i){
    run=prev&&daysBetween(prev.d,x.d)===1?run+1:1;if(run>=7)hit("rebell",x.d);
    if(prev&&i>=5&&daysBetween(prev.d,x.d)>=22)hit("comeback",x.d);
    var nr={};Object.keys(x.exs).forEach(function(id){nr[id]=(runEx[id]||0)+1;if(nr[id]>=10)hit("pony",x.d);});runEx=nr;
    prev=x;
  });
  // Rollende 4-Wochen-Fenster fuer die Anteils-Titel (mindestens 8 Trainingstage, 40 Kraftsaetze)
  T.forEach(function(x){
    var from=shiftDays(x.d,-27),w=T.filter(function(y){return y.d>=from&&y.d<=x.d;});
    if(w.length<8)return;
    var c={chest:0,shoulders:0,back:0,arms:0,legs:0,core:0},n=0;
    w.forEach(function(y){CATS.forEach(function(k){c[k]+=y.c[k];});n+=y.n;});
    if(n<40)return;
    if((c.chest+c.shoulders+c.back+c.arms)/n>=0.8)hit("disco",x.d);
    if(c.legs/n>=0.35)hit("beintier",x.d);
    if(c.back/n>=0.30)hit("lat",x.d);
    if(c.arms/n>=0.25)hit("bizeps",x.d);
    if(c.core/n>=0.20)hit("bauch",x.d);
    var from6=shiftDays(x.d,-41),w6=td.filter(function(y){return y.d>=from6&&y.d<=x.d;});
    if(w6.filter(function(y){return y.train;}).length>=12&&!w6.some(function(y){return y.cardio>0;}))hit("cardiono",x.d);
  });
  // Wochen (Mo-So): alles in einer Woche, nur Wochenende, gleiche Wochentage
  var wk={},order=[];
  td.forEach(function(x){var ws=weekStartOf(x.d);if(!wk[ws]){wk[ws]={c:{},cardio:0,mob:false,dow:[],end:x.d};order.push(ws);}var W=wk[ws];
    CATS.forEach(function(k){if(x.c[k])W.c[k]=1;});W.cardio+=x.cardio;if(x.mob)W.mob=true;W.end=x.d;
    if(x.train)W.dow.push(parseIso(x.d).getDay());});
  var wkEnd=0,same=0,lastKey=null,lastWs=null;
  order.forEach(function(ws){var W=wk[ws];
    if(Object.keys(W.c).length===6&&W.cardio>0&&W.mob)hit("messer",W.end);
    if(W.dow.length&&W.dow.every(function(g){return g===0||g===6;})){wkEnd++;if(wkEnd>=6)hit("wochenende",W.end);}
    var key=W.dow.slice().sort().join(",");
    if(W.dow.length>=2&&key===lastKey&&lastWs&&daysBetween(lastWs,ws)===7)same++;else same=W.dow.length>=2?1:0;
    if(same>=6)hit("uhrwerk",W.end);
    lastKey=key;lastWs=ws;
  });
  // Rekorde an einem Tag
  var D=vt.D||vitrineData(),perDay={};
  (D.prList||[]).forEach(function(p){perDay[p.d]=(perDay[p.d]||0)+1;if(perDay[p.d]>=5)hit("piranha",p.d);});
  return out;
}
/* Neu verdiente Titel dauerhaft merken - einmal verdient bleibt verdient. */
function vtTitleSync(){
  if(!state.profile)return {};
  var have=state.profile.titles||{},ev={},changed=false;
  try{ev=vtTitleEval();}catch(e){ev={};}
  Object.keys(ev).forEach(function(id){if(!have[id]){have[id]=ev[id];changed=true;}});
  if(changed||!state.profile.titles){state.profile.titles=have;try{persist();}catch(e){}}
  return have;
}
function vtPatch(t,size,locked){
  var w=el("div","vt-patch"+(locked?" locked":""));w.style.width=w.style.height=size+"px";
  if(!locked&&window.TITLE_IMG&&TITLE_IMG.indexOf(t.id)>=0){w.innerHTML='<img src="assets/titles/'+t.id+'.webp" alt="" loading="lazy">';w.classList.add("img");}
  else{var i=el("span",null,locked?"?":t.n.charAt(0));i.style.fontSize=Math.round(size*.4)+"px";w.appendChild(i);}
  return w;
}
var VT_SETNAMES=["Bronze-Set","Silber-Set","Gold-Set","Diamant-Set","Champion-Set"];
var vt={tab:"tro",D:null,L:null,rows:null};

function vtData(){
  var D=vitrineData(),L=msList(D),rows=MILESTONES.map(function(m){
    var v=msValue(m,D),n=0;m.steps.forEach(function(s){if(v!=null&&v>=s)n++;});
    return {m:m,v:v,n:n};
  });
  vt.D=D;vt.L=L;vt.rows=rows;vt.titles=vtTitleSync();
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
  var top=el("div","vt-top");top.appendChild(vtBackBtn(vtClose));var hh=el("div","vt-h");hh.appendChild(el("h1",null,"Deine Vitrine"));
  var wid=state.profile&&state.profile.titleWorn,wt=wid&&vt.titles&&vt.titles[wid]?vtTitleById(wid):null;
  if(wt)hh.appendChild(el("span","vt-wt",wt.n));top.appendChild(hh);top.appendChild(el("span","vt-rb ghost"));pg.appendChild(top);
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
  // Endziel: die Legende-Trophaee (gesperrt grau, Ringe fuellen sich je fertiger Sammlung)
  b.appendChild(el("div","vt-lab","Endziel"));
  var done=got>=total,lg=el("button","vt-set legend"+(done?" done":""));lg.type="button";
  lg.setAttribute("aria-label","Legende-Trophäe, "+got+" von "+total+" Medaillen");
  var tw=el("div","vt-trophy");tw.innerHTML=trophySvg({size:84,done:done,anim:done,lit:tierGot.map(function(k){return k>=N;})});lg.appendChild(tw);
  var lt=el("div","tx");lt.appendChild(el("b",null,"Legende-Trophäe"));
  lt.appendChild(el("span",null,done?"Geschafft – du bist eine Legende":"Alle "+total+" Medaillen sammeln"));
  lt.appendChild(vtBar(Math.floor(got/total*100),"linear-gradient(90deg,#FFD84A,#FF6FA8,#7A6BFF)"));
  lt.appendChild(el("span","ct",got+" / "+total));
  var la=state.profile&&state.profile.legendAt;
  if(done&&la)lt.appendChild(el("span","dt","seit "+shortDate(la)));
  lg.appendChild(lt);
  var lch=el("span","chev");lch.innerHTML=svgIcon(IC_CHEV);lg.appendChild(lch);
  lg.onclick=function(){vtLegendSheet();};
  b.appendChild(lg);
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
  var have=vt.titles||{},got=VT_TITLES.filter(function(t){return have[t.id];}).length,worn=state.profile&&state.profile.titleWorn;
  var wt=worn&&have[worn]?vtTitleById(worn):null;
  if(wt){var wc=el("button","vt-worn");wc.type="button";wc.appendChild(vtPatch(wt,52));
    var tx=el("div","tx");tx.appendChild(el("span",null,"Dein Titel"));tx.appendChild(el("b",null,wt.n));wc.appendChild(tx);
    wc.onclick=function(){vtTitleSheet(wt);};b.appendChild(wc);}
  b.appendChild(el("div","vt-lab",got+" von "+VT_TITLES.length+" entdeckt"));
  if(!got)b.appendChild(el("p","vt-note","Geheime Titel bekommst du für deine Art zu trainieren. Was genau zählt, erfährst du erst, wenn du einen hast."));
  var g=el("div","vt-tgrid");
  VT_TITLES.slice().sort(function(a,c){return (have[c.id]?1:0)-(have[a.id]?1:0);}).forEach(function(t){
    var on=!!have[t.id],c=el("button","vt-tcard"+(on?" on":"")+(worn===t.id?" worn":""));c.type="button";
    c.appendChild(vtPatch(t,64,!on));
    c.appendChild(el("b",null,on?t.n:"???"));
    c.appendChild(el("span",null,on?"seit "+shortDate(have[t.id]):(t.h==="???"?"Ganz geheim":t.h+"…")));
    c.onclick=function(){vtTitleSheet(t);};g.appendChild(c);
  });
  b.appendChild(g);
}
function vtTitleSheet(t){
  var pg=$("vitpage"),old=pg.querySelector(".vt-sheet");if(old)old.remove();
  var have=vt.titles||{},on=!!have[t.id],sh=el("div","vt-sheet"),inn=el("div","in tsheet");sh.appendChild(inn);
  inn.appendChild(vtPatch(t,140,!on));
  inn.appendChild(el("h3",null,on?t.n:"???"));
  if(on){
    inn.appendChild(el("p","vt-note","Verdient am "+shortDate(have[t.id])+" · "+t.how));
    var worn=state.profile.titleWorn===t.id,bt=el("button","vt-btn primary",worn?"Titel ablegen":"Als Titel tragen");bt.type="button";
    bt.onclick=function(){state.profile.titleWorn=worn?null:t.id;try{persist();}catch(e){}sh.remove();vtRender();};inn.appendChild(bt);
  }else{
    inn.appendChild(el("p","vt-note",t.h==="???"?"Zu diesem Titel gibt es keinen Hinweis. Trainier einfach – vielleicht stolperst du drüber.":"Hinweis: „"+t.h+"“. Was genau zählt, bleibt geheim, bis du ihn hast."));
  }
  sh.onclick=function(e){if(e.target===sh)sh.remove();};
  pg.appendChild(sh);
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

/* =========================================================================
   Legende-Trophaee: Endziel der Vitrine (alle 85 Medaillen).
   Pokal im Stil der Legende-Stufe (Gold, Lila/Pink/Blau, Strahlen, Stern) auf einem Sockel
   mit 5 Ringen - je Ring eine Sammlung (Bronze ... Champion), der leuchtet, sobald alle 17
   Medaillen dieser Stufe da sind. Als SVG gezeichnet statt als Bild: so koennen die Ringe
   einzeln an- und ausgehen, und der Pokal bleibt auch bei 60 px scharf.
   Gemerkt wird nur, WANN etwas zum ersten Mal komplett war (state.profile.setsAt,
   state.profile.legendAt) - damit jede Feier genau einmal kommt. Ob etwas komplett ist,
   wird wie alle Medaillen immer aus dem Verlauf berechnet.
   ========================================================================= */
var LG_TIER_KEY=["bronze","silber","gold","diamant","champion"];
var lgUid=0;
/* Bild: assets/legende-trophaee.webp (farbig) und -grau.webp (gesperrte Silhouette), 576x720,
   Zeichenflaeche 988x1236. Die 5 Ringe des Sockels als Trapeze (Index 0 = Bronze unten ...
   4 = Champion oben): [oben, unten, linker Rand oben, linker Rand unten]; rechts gespiegelt. */
var LG_W=988,LG_H=1236,LG_MID=496;
var LG_BANDS=[[1096,1176,229,203],[1046,1098,249,235],[996,1048,266,256],[936,998,286,271],[874,938,309,297]];
function lgBandPts(i){var b=LG_BANDS[i];
  return [[b[2],b[0]],[2*LG_MID-b[2],b[0]],[2*LG_MID-b[3],b[1]],[b[3],b[1]]].map(function(p){return p[0]+","+p[1];}).join(" ");}
/* o: {size (Hoehe in px), lit:[5 x bool], done:bool, anim:bool} */
function trophySvg(o){
  o=o||{};
  var u="lt"+(++lgUid),lit=o.lit||[],done=!!o.done,H=o.size||120,W=Math.round(H*LG_W/LG_H);
  var img=function(f,cp,cls){return '<image'+(cls?' class="'+cls+'"':'')+' href="assets/'+f+'.webp" x="0" y="0" width="'+LG_W+'" height="'+LG_H+'"'+(cp?' clip-path="url(#'+u+cp+')"':'')+'/>';};
  var d='<defs>',rest='M0 0H'+LG_W+'V'+LG_H+'H0Z';
  for(var i=0;i<5;i++){d+='<clipPath id="'+u+'b'+i+'"><polygon points="'+lgBandPts(i)+'"/></clipPath>';rest+='M'+lgBandPts(i).replace(/ /g,"L")+'Z';}
  // Alles ausser den Ringen: bei freigeschalteter Trophaee farbig, die Ringe entscheiden selbst.
  d+='<clipPath id="'+u+'rest"><path clip-rule="evenodd" d="'+rest+'"/></clipPath>';
  if(done){
    d+='<clipPath id="'+u+'cup"><path d="M240 250H750L700 560L600 700H390L290 560Z"/><polygon points="'+lgBandPts(4).split(" ")[0]+" "+lgBandPts(4).split(" ")[1]+" "+lgBandPts(0).split(" ")[2]+" "+lgBandPts(0).split(" ")[3]+'"/></clipPath>';
    d+='<linearGradient id="'+u+'sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
  }
  d+='</defs>';
  var s='<svg class="lt'+(done?" done":" locked")+(o.anim&&done?" anim":"")+'" viewBox="0 0 '+LG_W+' '+LG_H+'" width="'+W+'" height="'+H+'" aria-hidden="true">'+d;
  s+=img("legende-trophaee-grau");
  if(done)s+=img("legende-trophaee","rest");
  for(var j=0;j<5;j++){var bb=LG_BANDS[j];
    s+='<g class="lt-ring'+(lit[j]?" on":"")+'" data-i="'+j+'" style="transform-origin:'+LG_MID+'px '+((bb[0]+bb[1])/2)+'px">'+
      '<polygon class="off" points="'+lgBandPts(j)+'" fill="transparent"/>'+img("legende-trophaee","b"+j,"lit")+'</g>';}
  if(done){
    s+='<g clip-path="url(#'+u+'cup)"><rect class="lt-sheen" x="-300" y="0" width="260" height="'+LG_H+'" fill="url(#'+u+'sheen)" transform="skewX(-18)"/></g>';
    s+='<g class="lt-tw"><path d="M880 150l14 38 38 14-38 14-14 38-14-38-38-14 38-14z" fill="#fff"/><path d="M90 560l10 28 28 10-28 10-10 28-10-28-28-10 28-10z" fill="#FFF3B0"/><path d="M860 820l8 22 22 8-22 8-8 22-8-22-22-8 22-8z" fill="#CFE6FF"/></g>';
  }
  return s+'</svg>';
}
/* Stand der Sammlung: je Stufe wie viele der 17 Medaillen da sind. */
function lgState(D,L){
  L=L||msList(D||vitrineData());var t=[0,0,0,0,0],got=0;
  L.forEach(function(x){if(x.got){t[x.i]++;got++;}});
  var N=MILESTONES.length;
  return {t:t,got:got,N:N,total:L.length,lit:t.map(function(k){return k>=N;}),done:got>=L.length&&L.length>0};
}
/* Blatt zur Trophaee: gross, mit den 5 Sammlungen als Ring-Legende. */
function vtLegendSheet(){
  var pg=$("vitpage"),old=pg.querySelector(".vt-sheet");if(old)old.remove();
  var st=lgState(vt.D),sh=el("div","vt-sheet"),inn=el("div","in vt-lgsheet");sh.appendChild(inn);
  var tw=el("div");tw.innerHTML=trophySvg({size:170,done:st.done,anim:st.done,lit:st.lit});inn.appendChild(tw);
  inn.appendChild(el("h3",null,"Legende-Trophäe"));
  var la=state.profile&&state.profile.legendAt;
  inn.appendChild(el("p","vt-note",st.done?"Alle "+st.total+" Medaillen gesammelt"+(la?" – seit "+shortDate(la):""):
    "Die Trophäe gehört dir, sobald du alle "+st.total+" Medaillen hast. Jeder Ring im Sockel leuchtet, wenn eine Sammlung komplett ist."));
  var box=el("div","in2"),rl=el("div","vt-lgrings"),sa=(state.profile&&state.profile.setsAt)||{};
  VT_SETNAMES.forEach(function(nm,i){
    var ok=st.lit[i],rw=el("div","rw"+(ok?" ok":"")),dot=el("span","dot");
    if(ok){dot.style.borderColor=MEDAL_LV[i].m;dot.style.background=MEDAL_LV[i].m+"66";dot.style.boxShadow="0 0 8px "+MEDAL_LV[i].m;}
    rw.appendChild(dot);rw.appendChild(el("span","l",nm));
    rw.appendChild(el("span","v",ok?"✓"+(sa[LG_TIER_KEY[i]]?" "+shortDate(sa[LG_TIER_KEY[i]]):""):st.t[i]+" / "+st.N));
    rl.appendChild(rw);
  });
  box.appendChild(rl);inn.appendChild(box);
  if(st.done){var rp=el("button","vt-btn","Feier noch einmal ansehen");rp.type="button";
    rp.onclick=function(){sh.remove();lgShowLegend({replay:true});};inn.appendChild(rp);}
  sh.onclick=function(e){if(e.target===sh)sh.remove();};
  pg.appendChild(sh);
}

/* ---------- Feiern beim Abhaken ----------
   Aufgerufen nach jedem abgehakten Satz (09-uebungsdetail.js). Vergleicht den Stand ohne und mit
   dem neuen Satz - gefeiert wird nur, was genau dieser Satz komplett gemacht hat. Zusaetzlich
   wird das Datum gespeichert, damit auch Haken-weg-Haken-dran nicht noch einmal feiert. Wer die
   Sammlung schon vor dieser Funktion komplett hatte, bekommt das Datum still nachgetragen.
   Leicht verzoegert, damit Rekord- und Rang-Karte (gleicher Haken) zuerst in der Warteschlange
   stehen und das Abhaken selbst nicht auf die Rechnung wartet. */
function lgOnTick(rec){
  setTimeout(function(){try{lgCheck(rec);}catch(e){}},60);
}
function lgCheck(rec){
  var p=state.profile;if(!p)return;
  var La=msList(vitrineData()),after=lgState(null,La),before=null,Lb=null;
  var sets=rec&&state.days[TODAY]?state.days[TODAY].sets:null,ix=sets?sets.indexOf(rec):-1;
  if(ix>=0){sets.splice(ix,1);try{Lb=msList(vitrineData());before=lgState(null,Lb);}finally{sets.splice(ix,0,rec);}}
  var sa=p.setsAt||{},ma=p.medalsAt||{},changed=!p.setsAt||!p.medalsAt,newSets=[],newMedals=[],legendNew=false;
  // Neue Medaillen: jetzt da, ohne diesen Satz nicht, und noch nie gefeiert (medalsAt, Schluessel
  // "bench-2" = Reihe-Stufe). Schon vorhandene Medaillen werden still eingetragen.
  La.forEach(function(x,k){
    if(!x.got)return;var key=x.m.id+"-"+x.i;if(ma[key])return;
    ma[key]=TODAY;changed=true;
    if(Lb&&!Lb[k].got)newMedals.push(x);
  });
  for(var i=0;i<5;i++){
    var k=LG_TIER_KEY[i];
    if(after.lit[i]&&!sa[k]){sa[k]=TODAY;changed=true;if(before&&!before.lit[i])newSets.push(i);}
  }
  p.setsAt=sa;p.medalsAt=ma;
  if(after.done&&!p.legendAt){p.legendAt=TODAY;changed=true;if(before&&!before.done)legendNew=true;}
  if(changed){try{persist();}catch(e){}}
  // Reihenfolge: erst die Medaille(n), dann die Sammlung, zuletzt die Legende. Die 85. Medaille
  // macht immer auch eine Sammlung voll - dann nur die grosse Feier, die ohnehin alle 5 Ringe
  // nacheinander aufleuchten laesst.
  // Mehrere Stufen derselben Reihe auf einmal (z. B. Bronze bis Gold): nur die hoechste zeigen.
  var byRow={},rows=[];
  newMedals.forEach(function(x){var g=byRow[x.m.id];
    if(!g){byRow[x.m.id]={x:x,also:[]};rows.push(byRow[x.m.id]);return;}
    if(x.i>g.x.i){g.also.push(g.x.i);g.x=x;}else g.also.push(x.i);});
  rows.sort(function(a,b){return b.x.i-a.x.i;});
  rows.forEach(function(g,j){prQ.push({fn:lgShowMedal,x:g.x,also:g.also.sort(),k:j+1,n:rows.length});});
  if(legendNew)prQ.push({fn:lgShowLegend});
  else newSets.forEach(function(i){prQ.push({fn:lgShowSet,i:i,lit:after.lit});});
  if((legendNew||newSets.length||newMedals.length)&&!prBusy)prNext();
}
function lgVibrate(p){try{if(navigator.vibrate)navigator.vibrate(p);}catch(e){}}
/* Funkenregen aus einem Punkt (Farben der Legende-Stufe). */
function lgSparks(host,cx,cy,n,dist){
  if(prReduce()||!document.body.animate)return;
  var cols=["#FFD84A","#FF6FA8","#7A6BFF","#fff","#FFF3B0","#4B3BD6"];
  for(var k=0;k<n;k++){
    var a=Math.random()*Math.PI*2,d=dist*(.45+Math.random()*.7),sz=3+Math.random()*5;
    var s=el("i","lg-spark");s.style.left=cx+"px";s.style.top=cy+"px";s.style.width=s.style.height=sz.toFixed(1)+"px";
    s.style.background=cols[k%cols.length];if(k%4===0)s.style.borderRadius="1px";
    host.appendChild(s);
    var dx=Math.cos(a)*d,dy=Math.sin(a)*d;
    var an=s.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},
      {transform:"translate(calc(-50% + "+(dx*.8).toFixed(1)+"px),calc(-50% + "+(dy*.8).toFixed(1)+"px)) scale(1)",opacity:1,offset:.6},
      {transform:"translate(calc(-50% + "+dx.toFixed(1)+"px),calc(-50% + "+(dy+40).toFixed(1)+"px)) scale(.3)",opacity:0}],
      {duration:900+Math.random()*700,delay:Math.random()*120,easing:"cubic-bezier(.15,.7,.3,1)",fill:"backwards"});
    an.onfinish=(function(e){return function(){e.remove();};})(s);
  }
}
function lgRingCenter(svg,i){
  var g=svg&&svg.querySelector('.lt-ring[data-i="'+i+'"] .off');if(!g)return null;
  var r=g.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};
}
function lgOverlay(cls){
  var o=el("div","lg-ov "+cls);o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
  if(prReduce())o.classList.add("still");
  document.body.appendChild(o);
  return o;
}
function lgClose(o,job){
  if(o.dataset.closing)return;o.dataset.closing="1";
  o.classList.add("out");
  setTimeout(function(){o.remove();if(!job||!job.replay)prNext();},prReduce()?0:320);
}
/* Kleine Feier: eine Sammlung ist komplett - der passende Ring leuchtet auf. */
function lgShowSet(job){
  var i=job.i,c=MEDAL_LV[i],N=MILESTONES.length,o=lgOverlay("set"),reduce=prReduce();
  o.setAttribute("aria-label",VT_SETNAMES[i]+" komplett");
  o.style.setProperty("--tc",c.m);
  var card=el("div","lg-card"),tw=el("div","lg-tro");
  var lit=(job.lit||[]).slice();lit[i]=!!reduce;
  tw.innerHTML=trophySvg({size:150,done:false,lit:lit});card.appendChild(tw);
  var h=el("b","lg-h",VT_SETNAMES[i]+" komplett");h.style.color=c.l;card.appendChild(h);
  card.appendChild(el("span","lg-s","Alle "+N+" "+c.n+"-Medaillen gesammelt · Ring "+(i+1)+" von 5 leuchtet"));
  o.appendChild(card);
  lgVibrate([30,50,90]);
  requestAnimationFrame(function(){o.classList.add("on");});
  var t1=setTimeout(function(){
    var g=tw.querySelector('.lt-ring[data-i="'+i+'"]');if(!g)return;
    g.classList.add("on","pop");
    var pc=lgRingCenter(tw.querySelector("svg"),i);if(pc)lgSparks(o,pc.x,pc.y,18,60);
    lgVibrate(40);
  },reduce?0:650);
  var t2=setTimeout(function(){lgClose(o,job);},reduce?3200:3800);
  o.onclick=function(){clearTimeout(t1);clearTimeout(t2);lgClose(o,job);};
}
/* Neue Medaille: faellt drehend herein, Strahlen in der Stufenfarbe, Funken beim Landen.
   Mehrere Medaillen aus einem Satz laufen nacheinander ("2 von 3"). */
function lgShowMedal(job){
  var x=job.x,m=x.m,i=x.i,c=MEDAL_LV[i],o=lgOverlay("medal"),reduce=prReduce();
  o.setAttribute("aria-label","Neue Medaille: "+m.name+" "+c.n);
  o.style.setProperty("--tc",c.m);
  var card=el("div","lg-card"),st=el("div","md-stage");
  st.appendChild(el("div","md-rays"));
  var md=el("div","md-coin");md.innerHTML=medalSvg(i,msShort(m,x.step),150,false,m);st.appendChild(md);
  card.appendChild(st);
  card.appendChild(el("span","md-eye",job.n>1?job.k+" von "+job.n+" neuen Medaillen":"Neue Medaille"));
  card.appendChild(el("b","lg-h",m.name));
  var chip=el("span","md-chip",c.n+" · "+msStepLabel(m,x.step));chip.style.color=c.l;chip.style.borderColor=c.m;card.appendChild(chip);
  if(job.also&&job.also.length)card.appendChild(el("span","lg-s","Zusammen mit "+job.also.map(function(k){return MEDAL_LV[k].n;}).join(" und ")));
  var v=msValue(m,vitrineData());
  card.appendChild(el("span","lg-s",i<4?"Nächste Stufe: "+MEDAL_LV[i+1].n+" – "+msRemain(m,v,m.steps[i+1]):"Alle 5 Stufen geschafft"));
  o.appendChild(card);
  lgVibrate([30,40,80]);
  requestAnimationFrame(function(){o.classList.add("on");});
  var t1=setTimeout(function(){
    var r=md.getBoundingClientRect();lgSparks(o,r.left+r.width/2,r.top+r.height*.55,22,90);lgVibrate(35);
  },reduce?0:720);
  var t2=setTimeout(function(){lgClose(o,job);},reduce?2600:job.n>1?2900:3400);
  o.onclick=function(){clearTimeout(t1);clearTimeout(t2);lgClose(o,job);};
}
/* Grosse Feier: alle 85 Medaillen. Pokal steigt auf, die 5 Ringe leuchten nacheinander auf,
   dann Strahlen, Funken und Schrift. Bleibt stehen, bis man tippt. */
function lgShowLegend(job){
  job=job||{};
  var st=lgState(),o=lgOverlay("legend"),reduce=prReduce();
  o.setAttribute("aria-label","Legende – alle "+st.total+" Medaillen");
  o.appendChild(el("div","lg-bg"));
  var rays=el("div","lg-rays");o.appendChild(rays);
  var stage=el("div","lg-stage"),tw=el("div","lg-tro");
  tw.innerHTML=trophySvg({size:Math.min(340,Math.round(window.innerHeight*.44)),done:true,anim:true,lit:reduce?[1,1,1,1,1]:[0,0,0,0,0]});
  stage.appendChild(tw);
  var tx=el("div","lg-txt");tx.appendChild(el("b",null,"Legende"));tx.appendChild(el("span",null,"alle "+st.total+" Medaillen"));
  stage.appendChild(tx);o.appendChild(stage);
  var hint=el("div","lg-hint","Tippen zum Schließen");o.appendChild(hint);
  var ts=[],canClose=false;
  requestAnimationFrame(function(){o.classList.add("on");});
  lgVibrate([40,60,40]);
  if(reduce){o.classList.add("final");canClose=true;}
  else{
    var svg=tw.querySelector("svg");
    for(var i=0;i<5;i++)(function(i){ts.push(setTimeout(function(){
      var g=svg.querySelector('.lt-ring[data-i="'+i+'"]');if(g){g.classList.add("on","pop");}
      var pc=lgRingCenter(svg,i);if(pc)lgSparks(o,pc.x,pc.y,10,42);
      lgVibrate(25+i*8);
    },1250+i*330));})(i);
    ts.push(setTimeout(function(){
      o.classList.add("final");
      var r=svg.getBoundingClientRect();
      lgSparks(o,r.left+r.width/2,r.top+r.height*.35,70,Math.min(window.innerWidth*.55,260));
      lgVibrate([80,50,80,50,240]);
    },1250+5*330+150));
    ts.push(setTimeout(function(){
      var r=svg.getBoundingClientRect();lgSparks(o,r.left+r.width/2,r.top+r.height*.3,40,Math.min(window.innerWidth*.45,200));
      canClose=true;
    },3600));
  }
  o.onclick=function(){if(!canClose)return;ts.forEach(clearTimeout);lgClose(o,job);};
  // Datum speichern (falls diese Feier ueber einen anderen Weg als lgCheck kam)
  if(!job.replay&&state.profile&&!state.profile.legendAt){state.profile.legendAt=TODAY;try{persist();}catch(e){}}
}
