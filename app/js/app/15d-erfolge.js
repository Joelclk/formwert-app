/* =========================================================================
   app/15d-erfolge.js - Erfolge: Rekorde beim Abhaken (weitere folgen:
   Medaillen, Meilensteine, naechstes Ziel)
   ========================================================================= */

/* ---------- Rekorde ----------
   Je Satz bis zu vier Arten, jede mit eigener Farbe:
     kg   Maximales Gewicht                         (gold)
     e1rm Geschaetztes Maximum (1RM aus dem Satz)   (gruen)
     reps Meiste Wdh. (bei Gewichtsuebungen: mit diesem oder hoeherem Gewicht)  (rot)
     vol  Bestes Satzvolumen (kg x Wdh.)             (blau)
   Verglichen wird mit allen frueheren Saetzen der Uebung, auch den schon abgehakten dieses
   Trainings. Beim allerersten Training einer Uebung gibt es keinen Rekord - da waere jeder
   Satz einer. */
var PR_ORDER=["kg","e1rm","reps","vol"];
var IC_MEDAL='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h4l1.6 5.2L11 8 7 2zM17 2h-4l-1.6 5.2L13 8l4-6z" fill="var(--red)"/><circle cx="12" cy="14.5" r="7" fill="var(--gold)"/><circle cx="12" cy="14.5" r="5.2" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1"/><text x="12" y="16.9" text-anchor="middle" font-size="6.4" font-weight="800" font-family="system-ui,sans-serif" fill="#fff">PR</text></svg>';
function prPrior(ex,rec){
  var list=[],older=false;
  Object.keys(state.days).forEach(function(d){
    (state.days[d].sets||[]).forEach(function(s){
      if(s.ex!==ex.id||s===rec||(rec.ts&&s.ts===rec.ts))return;
      list.push(s);
      if(d<TODAY||!rec.wid||s.wid!==rec.wid)older=true;
    });
  });
  return older?list:null;
}
function prKg(v){return fmtNum(Math.round(v*100)/100)+" kg";}
function prCheck(ex,rec){
  if(!ex||!rec||!(rec.reps>0))return [];
  var prior=prPrior(ex,rec);if(!prior||!prior.length)return [];
  var out=[],side=ex.wt==="side"?" pro Seite":"";
  if(ex.t==="load"){
    var kg=effectiveKg(ex,rec.kg),reps=rec.reps,maxKg=0,maxE=0,maxRepsAt=0,maxVol=0;
    prior.forEach(function(s){
      var k=effectiveKg(ex,s.kg),r=s.reps||0;if(r<=0)return;
      if(k>maxKg)maxKg=k;
      var v=setValue(ex,s);if(v>maxE)maxE=v;
      if(k>=kg-1e-9&&r>maxRepsAt)maxRepsAt=r;
      if(k*r>maxVol)maxVol=k*r;
    });
    if(rec.kg>0&&kg>maxKg+1e-9)
      out.push({t:"kg",lab:"Maximales Gewicht",val:prKg(rec.kg)+side,delta:"+"+prKg(rawKg(ex,kg-maxKg))});
    var e=setValue(ex,rec);
    if(maxE>0&&e>maxE*1.001)
      out.push({t:"e1rm",lab:"Geschätztes Maximum",val:prKg(Math.round(rawKg(ex,e)*2)/2)+side,delta:"+"+prKg(Math.max(0.5,Math.round(rawKg(ex,e-maxE)*2)/2))});
    if(kg<=maxKg+1e-9&&maxRepsAt>0&&reps>maxRepsAt)
      out.push({t:"reps",lab:"Meiste Wdh. mit "+prKg(rec.kg)+side,val:reps+" Wdh.",delta:"+"+(reps-maxRepsAt)});
    var vol=kg*reps;
    if(kg>0&&maxVol>0&&vol>maxVol+1e-9)
      out.push({t:"vol",lab:"Bestes Satzvolumen",val:prKg(Math.round(vol)),delta:"+"+prKg(Math.round(vol-maxVol))});
  }else{
    var m=0;prior.forEach(function(s){if((s.reps||0)>m)m=s.reps||0;});
    if(m>0&&rec.reps>m){
      var sec=ex.t==="sec";
      out.push({t:"reps",lab:sec?"Längste Zeit":"Meiste Wdh.",val:rec.reps+(sec?" s":" Wdh."),delta:"+"+(rec.reps-m)+(sec?" s":"")});
    }
  }
  out.forEach(function(p){p.txt=p.lab+": "+p.val;});
  out.sort(function(a,b){return PR_ORDER.indexOf(a.t)-PR_ORDER.indexOf(b.t);});
  return out;
}

/* ---------- Anzeige ----------
   Karte oben mit Bild, Name, Rekordart und farbigem Zuwachs. Mehrere Rekorde laufen nacheinander
   durch ("2 von 3 Rekorden"), danach fliegt eine Medaille in den Rekord-Zaehler der Kopfzeile. */
function prFigView(ex){
  var p0=(ex.p||[])[0],m=null;
  for(var i=0;i<MUSCLES.length;i++)if(MUSCLES[i].id===p0){m=MUSCLES[i];break;}
  return m&&m.view==="back"?"back":"front";
}
function prThumb(ex){
  var t=el("div","pr-thumb");
  var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
  sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",prFigView(ex));
  sv.setAttribute("aria-hidden","true");t.appendChild(sv);
  try{fillExFig(sv);}catch(e){}
  return t;
}
var prQ=[],prBusy=false,prTimer=null;
function prBurst(ex,list){
  prQ.push({ex:ex,list:list});
  if(!prBusy)prNext();
}
function prNext(){
  var job=prQ.shift();
  if(!job){prBusy=false;return;}
  prBusy=true;
  var b=$("pr-burst");
  if(!b){b=el("div","pr-burst");b.id="pr-burst";b.setAttribute("role","status");b.setAttribute("aria-live","polite");document.body.appendChild(b);}
  b.innerHTML="";
  // Rang-Aufstieg (15e-raenge.js) laeuft durch dieselbe Karte, nur mit Wappen statt Figur.
  var isRank=!!job.rank;
  if(isRank){
    var kt=(job.kb!=null&&job.ka!=null&&Math.round(job.ka)>Math.round(job.kb))?"Gesamtstärke "+Math.round(job.kb)+" % → "+Math.round(job.ka)+" %":job.to.title;
    job.list=[{t:"rank",lab:job.from.title+" → "+job.to.title,val:job.to.name,delta:"Aufstieg",cnt:kt}];
    b.style.setProperty("--rkc",job.to.t.leg?"#C04C9A":job.to.t.m);
    var th=el("div","pr-thumb rk");th.innerHTML=rankBadge(job.to,48);b.appendChild(th);
  }else b.appendChild(prThumb(job.ex));
  var tx=el("div","pr-txt");
  var nm=el("b",null,isRank?"Neuer Rang · "+job.ex.n:job.ex.n),lab=el("span","pr-lab"),cnt=el("span","pr-cnt");
  tx.appendChild(nm);tx.appendChild(lab);tx.appendChild(cnt);
  b.appendChild(tx);
  var chip=el("span","pr-chip");b.appendChild(chip);
  var i=0,n=job.list.length;
  function fill(){
    var p=job.list[i];
    b.setAttribute("data-t",p.t);
    lab.textContent=p.lab+" – "+p.val;
    chip.textContent=p.delta;
    cnt.textContent=p.cnt||(n>1?(i+1)+" von "+n+" Rekorden":"Neuer Rekord");
    chip.classList.remove("pop");void chip.offsetWidth;chip.classList.add("pop");
  }
  // Wechsel zwischen zwei Rekorden: Text und Chip gleiten nach oben weg, der naechste kommt
  // von unten nach (Rahmenfarbe blendet per CSS mit). Ohne Web Animations: direkt tauschen.
  function show(swap){
    var parts=[lab,cnt,chip];
    if(!swap||prReduce()||!chip.animate){fill();return;}
    var outs=parts.map(function(e){return e.animate([{transform:"translateY(0)",opacity:1},{transform:"translateY(-10px)",opacity:0}],{duration:170,easing:"ease-in",fill:"forwards"});});
    outs[0].onfinish=function(){
      fill();
      parts.forEach(function(e,k){var a=e.animate([{transform:"translateY(12px)",opacity:0},{transform:"translateY(0)",opacity:1}],{duration:260,delay:k*40,easing:"cubic-bezier(.2,1.2,.4,1)",fill:"backwards"});
        a.onfinish=function(){outs[k].cancel();};});
    };
  }
  show(false);
  try{if(navigator.vibrate)navigator.vibrate([25,40,70]);}catch(e){}
  // Auftakt: die Karte faellt als runde Medaille (mit Strahlen) herein und zieht sich dann
  // in die Breite zur Rekord-Karte auf - Bild, Text und Zuwachs blenden dabei ein.
  var reduce=prReduce();
  b.appendChild(isRank?prRankIntro(job):prMedalBadge());
  // Ohne Uebergang in den Ausgangszustand springen (sonst schrumpft die alte Karte sichtbar).
  b.style.transition="none";b.style.opacity="";
  b.classList.remove("on","off","intro","outro");
  if(!reduce)b.classList.add("intro");
  void b.offsetWidth;
  b.style.transition="";
  b.classList.add("on");
  prTimer=setTimeout(function(){
    b.classList.remove("intro");
    b.onclick=function(){if(prTimer){clearTimeout(prTimer);prTimer=null;}i=n-1;step();};
    prTimer=setTimeout(step,reduce?1900:2300);
  },reduce?0:950);
  function step(){
    i++;
    if(i<n){show(true);prTimer=setTimeout(step,1900);return;}
    prTimer=null;b.onclick=null;
    // Ende: die Karte zieht sich wieder zur Medaille zusammen, die dann in den Zaehler fliegt.
    if(reduce||!document.body.animate){b.classList.remove("on");b.classList.add("off");if(!isRank)prFly(null);setTimeout(prNext,520);return;}
    b.classList.add("outro");
    if(isRank){setTimeout(function(){b.classList.remove("on","outro");b.classList.add("off");setTimeout(prNext,420);},900);return;}
    setTimeout(function(){
      var mm=b.querySelector(".pr-bm-m"),r=mm?mm.getBoundingClientRect():b.getBoundingClientRect();
      b.style.transition="none";b.style.opacity="0";
      b.classList.remove("on","outro");b.classList.add("off");
      void b.offsetWidth;b.style.transition="";
      var dur=prFly(r);
      setTimeout(prNext,(dur||0)+250);
    },560);
  }
  b.onclick=null;
}
/* Auftakt beim Rang-Aufstieg: altes Wappen im Kreis, das zum neuen wird. */
function prRankIntro(job){
  var m=prMedalBadge(),in_=m.querySelector(".pr-bm-m");
  in_.innerHTML=rankBadge(job.from,52);in_.classList.add("rk");
  setTimeout(function(){in_.innerHTML=rankBadge(job.to,52);in_.classList.remove("rkpop");void in_.offsetWidth;in_.classList.add("rkpop");},480);
  return m;
}
/* Medaille mit Strahlen fuer den Auftakt der Karte (liegt mittig in der Karte, solange sie
   noch rund ist). */
var PR_RAYS=null;
function prMedalBadge(){
  if(!PR_RAYS){var r="";for(var k=0;k<12;k++){var a=k*30*Math.PI/180,r1=31,r2=k%2?40:45;
    r+='<line x1="'+(50+r1*Math.sin(a)).toFixed(1)+'" y1="'+(50-r1*Math.cos(a)).toFixed(1)+'" x2="'+(50+r2*Math.sin(a)).toFixed(1)+'" y2="'+(50-r2*Math.cos(a)).toFixed(1)+'"/>';}
    PR_RAYS=r;}
  var m=el("div","pr-bm");m.setAttribute("aria-hidden","true");
  m.innerHTML='<svg class="pr-rays" viewBox="0 0 100 100">'+PR_RAYS+'</svg><span class="pr-bm-m">'+IC_MEDAL+'</span>';
  return m;
}
/* Medaille von der Karte in den Zaehler fliegen lassen; ohne Zaehler (oder bei reduzierter
   Bewegung) wird er nur aufgefrischt. */
function prReduce(){try{return window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){return false;}}
function prFly(fr){
  var to=$("wo-rec");
  if(!to)return 0;
  // Zaehler schon einblenden (damit das Ziel feststeht), die neue Zahl aber erst zeigen,
  // wenn die Medaille ankommt.
  if(!workoutPrCount()){prCountUpdate();return 0;}
  // Beim ersten Rekord ist der Zaehler noch aus: Platz schon belegen (fuer das Flugziel),
  // aber erst sichtbar machen, wenn die Medaille ankommt.
  var first=to.hidden;
  to.hidden=false;if(first)to.style.visibility="hidden";
  function bump(){
    to.style.visibility="";
    prCountUpdate();to.classList.remove("bump");void to.offsetWidth;to.classList.add("bump");
    try{if(navigator.vibrate)navigator.vibrate(15);}catch(e){}
  }
  var tr=to.getBoundingClientRect();
  if(!fr||prReduce()||!tr.width||!document.body.animate){bump();return 0;}
  // Medaille in Originalgroesse an der Stelle, an der sie in der Karte lag; Flug auf einem
  // leichten Bogen nach oben, mit einer Umdrehung, und zum Schluss klein in den Zaehler.
  var S=56,m=el("div","pr-fly");m.innerHTML=IC_MEDAL;document.body.appendChild(m);
  var s0=fr.width/S,sx=fr.left+fr.width/2-S/2,sy=fr.top+fr.height/2-S/2;
  var ic=to.querySelector("svg"),ir=ic?ic.getBoundingClientRect():tr;
  var ex=ir.left+ir.width/2-S/2,ey=ir.top+ir.height/2-S/2,s1=ir.width/S;
  var mx=(sx+ex)/2,my=Math.max(sy,ey)+54;   // Bogen nach unten - oben ist kein Platz
  var D=720;
  var an=m.animate([
    {transform:"translate("+sx+"px,"+sy+"px) scale("+s0+") rotate(0deg)"},
    {transform:"translate("+sx+"px,"+(sy-6)+"px) scale("+(s0*1.12)+") rotate(0deg)",offset:.15},
    {transform:"translate("+mx+"px,"+my+"px) scale("+((s0+s1)/2*1.1)+") rotate(200deg)",offset:.55},
    {transform:"translate("+ex+"px,"+ey+"px) scale("+s1+") rotate(360deg)"}
  ],{duration:D,easing:"cubic-bezier(.45,.05,.35,1)",fill:"forwards"});
  an.onfinish=function(){m.remove();bump();prSparks(ir);};
  return D;
}
/* Kleiner Funkenkranz am Zaehler, wenn die Medaille ankommt. */
function prSparks(r){
  var cx=r.left+r.width/2,cy=r.top+r.height/2;
  for(var k=0;k<10;k++){
    var a=k/10*Math.PI*2+Math.random()*.3,d=16+Math.random()*10;
    var p=el("i","pr-spark");p.style.left=cx+"px";p.style.top=cy+"px";
    if(k%3===1)p.style.background="var(--red)";
    document.body.appendChild(p);
    var an=p.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:"translate(calc(-50% + "+(Math.cos(a)*d).toFixed(1)+"px),calc(-50% + "+(Math.sin(a)*d).toFixed(1)+"px)) scale(.2)",opacity:0}],{duration:520+Math.random()*160,easing:"cubic-bezier(.2,.8,.3,1)"});
    an.onfinish=(function(e){return function(){e.remove();};})(p);
  }
}
function workoutPrCount(){
  var c=0;(workout&&workout.exercises||[]).forEach(function(we){(we.sets||[]).forEach(function(st){if(st.done&&st.pr)c+=st.pr.length;});});
  return c;
}
function prCountUpdate(){
  var to=$("wo-rec");if(!to)return;
  var c=workoutPrCount();
  to.hidden=!c;
  var b=to.querySelector("b");if(b)b.textContent=String(c);
  to.setAttribute("aria-label",c===1?"1 Rekord in diesem Training":c+" Rekorde in diesem Training");
}
/* Zaehler fuer die Kopfzeile des Trainings (09-uebungsdetail.js). */
function prCounterEl(){
  var s=el("span","wo-rec");s.id="wo-rec";s.setAttribute("role","img");
  s.innerHTML=IC_MEDAL+"<b class=\"num\">0</b>";
  var c=workoutPrCount();s.hidden=!c;s.querySelector("b").textContent=String(c);
  s.setAttribute("aria-label",c===1?"1 Rekord in diesem Training":c+" Rekorde in diesem Training");
  return s;
}
/* Beim Abhaken aufgerufen (09-uebungsdetail.js): merkt sich die Rekorde am Satz des laufenden
   Trainings (nicht im gespeicherten Datensatz) und zeigt sie. Der Zaehler zaehlt erst, wenn
   die Medaille ankommt (prFly). */
function prOnTick(ex,st,rec,row){
  var list=[];try{list=prCheck(ex,rec);}catch(e){}
  st.pr=list.length?list.map(function(p){return p.t;}):null;
  st.prL=list.length?list.map(function(p){return {t:p.t,txt:p.txt,delta:p.delta};}):null;
  st.prTxt=list.length?list[0].txt:null;
  if(row)row.classList.toggle("pr",!!list.length);
  if(list.length)prBurst(ex,list);
  return list;
}
function prOnUntick(st,row){st.pr=null;st.prL=null;st.prTxt=null;if(row)row.classList.remove("pr");prCountUpdate();}
/* Fuer die Zusammenfassung beim Beenden: je Uebung die Rekorde (je Art der letzte Satz). */
function workoutPrs(){
  var out=[];
  (workout&&workout.exercises||[]).forEach(function(we){
    var ex=exById(we.ex);if(!ex||!we.sets)return;
    var byT={};
    we.sets.forEach(function(st){if(!st.done||!st.pr)return;
      (st.prL||[{t:st.pr[0],txt:st.prTxt,delta:""}]).forEach(function(p){byT[p.t]=p;});});
    var l=PR_ORDER.filter(function(t){return byT[t];}).map(function(t){return byT[t];});
    if(l.length)out.push({ex:ex,list:l,txt:l[0].txt});
  });
  return out;
}
