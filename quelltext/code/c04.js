/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: renderSessionInner() bis (Anweisung)
*/

function renderSessionInner(){
  startTick();
  var box=$("session-body");box.innerHTML="";
  // Kopf: Name, Uhr, Pause
  var head=el("div","wo-head");
  var nm=document.createElement("input");nm.type="text";nm.value=workout.name;nm.className="wo-name";nm.setAttribute("aria-label","Name des Trainings");
  nm.onchange=function(){workout.name=nm.value.trim()||"Training";saveWorkout();};
  head.appendChild(nm);
  var tm=el("div","wo-timer"+(workout.paused?" paused":""));
  tm.innerHTML='<b id="wo-timer" class="num">'+fmtDur(woElapsed())+'</b>'+(workout.paused?'<span>pausiert</span>':'');
  head.appendChild(tm);
  var pb=el("button","iconbtn");pb.setAttribute("aria-label",workout.paused?"Training fortsetzen":"Training pausieren");
  pb.innerHTML=workout.paused?svgIcon("M7 4.5v15l13-7.5z",1.9):svgIcon("M9 5v14M15 5v14",2.2);
  pb.onclick=function(){if(workout.paused){workout.pausedMs+=Date.now()-workout.pauseStart;workout.paused=false;}else{workout.paused=true;workout.pauseStart=Date.now();}saveWorkout();renderSession();};
  head.appendChild(pb);
  // Fortschritt und Beenden wandern in die Kopfzeile – so bleibt unten kein Balken stehen
  // und die Satztabelle behält ihren Platz.
  var pr=el("span","wo-prog num");pr.id="wo-prog";head.appendChild(pr);
  var endB=el("button","btn primary small","Beenden");endB.onclick=finishWorkout;head.appendChild(endB);
  box.appendChild(head);

  var dots=el("div","wo-dots");dots.id="wo-dots";box.appendChild(dots);
  var pager=el("div","wo-pager");pager.id="wo-pager";
  workout.exercises.forEach(function(we,ei){
    var ex=exById(we.ex);if(!ex)return;
    var w=el("article","wo-page");w.setAttribute("data-i",String(ei));
    var isCardio=ex.t==="cardio";
    var h=el("div","wo-pagehead");
    var title=el("div","main");title.appendChild(el("b",null,ex.n));
    if(isCardio){
      title.appendChild(el("span",null,"Übung "+(ei+1)+" von "+workout.exercises.length+" · Ausdauer"));
    }else{
      var best=bestFor(ex.id,TODAY,WIN_STRENGTH);
      title.appendChild(el("span",null,"Übung "+(ei+1)+" von "+workout.exercises.length+" · "+(best.best!=null?"Best "+fmtVal(best.best,ex.t):"neu")+" · Pause "+we.restSec+" s"));
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
      rs.onclick=function(){askNumber("Pause nach jedem Satz",we.restSec,"15",0,600,"Sekunden",function(v){we.restSec=Math.round(v);saveWorkout();renderSession();});};
      h.appendChild(rs);
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
      // zwischendurch aus der Cloud neu geschrieben wurde -, wieder eintragen: sonst
      // laufen die Minuten ins Leere und zaehlen auf kein Wochenziel.
      if(!cardioDayOf(we.cardioRec)){day(TODAY).cardio.push(we.cardioRec);touch(TODAY);}
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
    // Tabelle
    var tblCls="wo-table";
    if(ex.uni)tblCls+=ex.t==="load"?" uni-load":" uni-plain";
    else if(ex.t==="load")tblCls+=" has-kg";
    var tbl=el("div",tblCls);
    var unitLab2=ex.t==="sec"?"Sek.":"Wdh.";
    var hd=el("div","wo-row head");
    hd.appendChild(el("span",null,"Satz"));hd.appendChild(el("span",null,"Vorher"));
    if(ex.t==="load")hd.appendChild(el("span",null,"kg"));
    if(ex.uni){hd.appendChild(el("span",null,unitLab2+" L"));hd.appendChild(el("span",null,unitLab2+" R"));}
    else hd.appendChild(el("span",null,unitLab2));
    hd.appendChild(el("span",null,"Reserve"));
    hd.appendChild(el("span",null,""));
    tbl.appendChild(hd);
    var prevSets=prevSetsFor(ex.id);
    function rirText(v){return v!=null?rirLabel(v):"–";}
    we.sets.forEach(function(st,si){
      var r=el("div","wo-row"+(st.done?" done":""));r.setAttribute("data-s",String(si));
      r.appendChild(el("span","wo-n",String(si+1)));
      var pv=prevSets[si],pvUni=(ex.uni&&pv&&pv.repsL!=null&&pv.repsR!=null)?(pv.repsL+"/"+pv.repsR):null;
      r.appendChild(el("span","wo-prev",pv?(ex.t==="load"?pv.kg+"×"+(pvUni||pv.reps):(pvUni||pv.reps)+(ex.t==="sec"?" s":"")):"–"));
      var kgI=null;
      if(ex.t==="load"){kgI=document.createElement("input");kgI.type="number";kgI.inputMode="decimal";kgI.step="2.5";kgI.value=st.kg;kgI.disabled=st.done;kgI.dataset.k=ei+":"+si+":kg";kgI.setAttribute("data-f","kg");
        kgI.oninput=function(){st.kg=parseFloat(String(kgI.value).replace(",","."))||0;saveWorkoutSoon();};r.appendChild(kgI);}
      var rpI=null,rpLI=null,rpRI=null;
      function syncUniReps(){st.reps=Math.min(parseInt(rpLI.value,10)||0,parseInt(rpRI.value,10)||0);saveWorkoutSoon();}
      if(ex.uni){
        rpLI=document.createElement("input");rpLI.type="number";rpLI.inputMode="numeric";rpLI.step="1";rpLI.value=st.repsL!=null?st.repsL:st.reps;rpLI.disabled=st.done;rpLI.dataset.k=ei+":"+si+":repsL";rpLI.setAttribute("data-f","repsL");
        rpLI.oninput=function(){st.repsL=parseInt(rpLI.value,10)||0;syncUniReps();};r.appendChild(rpLI);
        rpRI=document.createElement("input");rpRI.type="number";rpRI.inputMode="numeric";rpRI.step="1";rpRI.value=st.repsR!=null?st.repsR:st.reps;rpRI.disabled=st.done;rpRI.dataset.k=ei+":"+si+":repsR";rpRI.setAttribute("data-f","repsR");
        rpRI.oninput=function(){st.repsR=parseInt(rpRI.value,10)||0;syncUniReps();};r.appendChild(rpRI);
      } else {
        rpI=document.createElement("input");rpI.type="number";rpI.inputMode="numeric";rpI.step="1";rpI.value=st.reps;rpI.disabled=st.done;rpI.dataset.k=ei+":"+si+":reps";rpI.setAttribute("data-f","reps");
        rpI.oninput=function(){st.reps=parseInt(rpI.value,10)||0;saveWorkoutSoon();};r.appendChild(rpI);
      }
      var rirBtn=el("button","wo-rir"+(st.done?" done":""));rirBtn.type="button";
      rirBtn.innerHTML='<b>'+rirText(st.rir!=null?st.rir:null)+'</b>';
      rirBtn.setAttribute("aria-label","Wiederholungen in Reserve für diesen Satz");
      if(st.done){
        rirBtn.disabled=true;
      }else{
        rirBtn.onclick=function(ev){
          ev.preventDefault();ev.stopPropagation();
          var cur=st.rir!=null?st.rir:null;
          st.rir=(cur==null)?0:(cur>=5?null:cur+1);
          saveWorkoutSoon();
          rirBtn.querySelector("b").textContent=rirText(st.rir);
        };
      }
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
        if(st.done){st.done=false;if(st.rec){removeRec(st.rec);st.rec=null;}ck.classList.remove("on");
          rirBtn.disabled=false;rirBtn.classList.remove("done");
          saveWorkout();renderLight();return;}
        var kg=kgI?(parseFloat(String(kgI.value).replace(",","."))||0):0;
        var repsL=ex.uni?(parseInt(rpLI.value,10)||0):null,repsR=ex.uni?(parseInt(rpRI.value,10)||0):null;
        var reps=ex.uni?Math.min(repsL,repsR):(parseInt(rpI.value,10)||0);
        if(reps<=0){toast(ex.t==="sec"?"Sekunden eintragen":"Wiederholungen eintragen");try{(ex.uni?rpLI:rpI).focus();}catch(e){}return;}
        ck.classList.add("on");
        st.kg=kg;st.reps=reps;st.done=true;if(ex.uni){st.repsL=repsL;st.repsR=repsR;}
        var rec={ex:ex.id,kg:kg,reps:reps,wid:workout.id,ts:Date.now()};if(ex.uni){rec.repsL=repsL;rec.repsR=repsR;}
        // Die Reserve steht schon vorher pro Satz fest (eigene Spalte) - beim Abhaken wird sie
        // nur noch in den gespeicherten Datensatz uebernommen, nicht mehr neu gesetzt.
        if(st.rir!=null)rec.rir=st.rir;
        rirBtn.disabled=true;rirBtn.classList.add("done");
        st.rec=rec;day(TODAY).sets.push(rec);touch(TODAY);
        if(we.restSec>0){workout.rest.endAt=Date.now()+we.restSec*1000;workout.rest.len=we.restSec;}
        saveWorkout();renderLight();tickWorkout();
      };
      r.appendChild(ck);tbl.appendChild(r);
    });
    w.appendChild(tbl);
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

function deleteWorkout(dateKey,wo){
  for(var k in state.days){var dd=state.days[k],before=(dd.sets||[]).length;
    dd.sets=(dd.sets||[]).filter(function(st){return st.wid!==wo.id;});
    if(dd.sets.length!==before)touch(k);}
  var d=day(dateKey);d.workouts=(d.workouts||[]).filter(function(w){return w.id!==wo.id;});touch(dateKey);
  renderAll();toast("Training gelöscht");
}

function confirmDeleteWorkout(dateKey,wo){
  var n=workoutSetCount(wo);
  askConfirm("Training löschen?","„"+wo.name+"“ vom "+deDate(dateKey)+(n?" samt "+(n===1?"einem geloggten Satz":n+" geloggten Sätzen"):"")+" wird dauerhaft entfernt.","Löschen",function(){deleteWorkout(dateKey,wo);},true);
}

function deleteDay(dateKey){
  var d=day(dateKey);d.sets=[];d.cardio=[];d.workouts=[];d.mobility=false;touch(dateKey);renderAll();toast("Tag geleert");
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

/* Trainings-Detailseite: eigene Vollbildseite (dieselbe wie für Übungen), zeigt nur die Sätze
   EINES bestimmten Trainings mit kleiner Kennzahlen-Übersicht ("HUD") und Muskelfigur. */
function workoutInvolve(dateKey,wid){
  var inv={},d=state.days[dateKey];if(!d)return inv;
  var seen={};
  (d.sets||[]).forEach(function(s){if(s.wid===wid)seen[s.ex]=true;});
  Object.keys(seen).forEach(function(exid){
    var ex=exById(exid);if(!ex||ex.t==="cardio")return;
    var i2=exInvolve(ex);
    Object.keys(i2).forEach(function(g){if((inv[g]||0)<i2[g])inv[g]=i2[g];});
  });
  return inv;
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
  var items=[];
  workout.exercises.forEach(function(we){
    if(!we.sets||!we.sets.length)return;
    var ex=exById(we.ex);if(!ex)return;
    var src=null;
    for(var i=we.sets.length-1;i>=0&&!src;i--)if(we.sets[i].done)src=we.sets[i];
    if(!src)src=we.sets[we.sets.length-1];
    items.push({ex:we.ex,
      sets:clamp(we.sets.length,1,12),
      reps:Math.max(1,Math.round(src.reps||(ex.t==="sec"?30:8))),
      kg:ex.t==="load"?(src.kg||0):0});
  });
  return items;
}

function routineDiffers(r,items){
  if(!r||!Array.isArray(r.items)||r.items.length!==items.length)return true;
  for(var i=0;i<items.length;i++){
    var a=r.items[i],b=items[i];
    if(!a||a.ex!==b.ex||(a.sets|0)!==(b.sets|0)||(a.reps|0)!==(b.reps|0)||(+(a.kg||0))!==(+(b.kg||0)))return true;
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
    if((o.reps|0)!==(it.reps|0)||(+(o.kg||0))!==(+(it.kg||0)))nVals++;
  });
  if(nSets)out.push(nSets===1?"1× andere Satzzahl":nSets+"× andere Satzzahl");
  if(nVals)out.push(nVals===1?"1× andere Vorgabe":nVals+"× andere Vorgaben");
  return out.join(" · ");
}

function finishWorkout(){
  if(!workout)return;
  var done=0,vol=0,exs=0,prs=[];
  workout.exercises.forEach(function(we){var ex=exById(we.ex),any=false;
    if(!we.sets)return;
    we.sets.forEach(function(st){if(!st.done)return;any=true;done++;if(ex.t==="load")vol+=effectiveKg(ex,st.kg)*st.reps;});
    if(any){exs++;var best=null;we.sets.forEach(function(st){if(st.done){var v=setValue(ex,st);if(best==null||v>best)best=v;}});
      var prior=bestExcludingWorkout(ex);if(best!=null&&(prior==null||best>prior))prs.push(ex.n);}
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
    if(prs.length){var pr=el("div","calcout");pr.innerHTML="<b>Neue Bestwerte:</b> "+prs.join(", ");b.appendChild(pr);}
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
        rt.items=rtItems;state.routines[rt.id]=rt;state.dirtyRoutines[rt.id]=true;persist();
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


$("rest-plus").addEventListener("click",function(){if(!workout)return;workout.rest.endAt+=30000;workout.rest.len+=30;saveWorkout();tickWorkout();});

$("rest-skip").addEventListener("click",function(){if(!workout)return;workout.rest.endAt=0;saveWorkout();tickWorkout();});


/* ================= Routine: Muskelfokus ================= */
function routineFocus(items){
  var g={};MUSCLES.forEach(function(m){g[m.id]=0;});
  items.forEach(function(it){var ex=exById(it.ex);if(!ex||ex.t==="cardio"||ex.mob)return;
    var w=exSetWeights(ex);
    for(var m in w)if(g[m]!=null)g[m]+=it.sets*w[m];});
  var max=0;for(var k in g)if(g[k]>max)max=g[k];
  var lvl={};for(var k2 in g){var v=g[k2];lvl[k2]=v<=0?0:v>=max*0.55?3:v>=max*0.25?2:1;}
  return {sets:g,max:max,lvl:lvl};
}

function focusLabel(l){return l===3?"Fokus":l===2?"Mittel":l===1?"Hintergrund":"";}

function focusColor(l){return l===3?"var(--accent)":l===2?"var(--yellow)":l===1?"var(--blue)":"var(--body-fill)";}

// Malt wie involvePaint (Übungs-Mini-Figur), nur mit drei Stufen statt zwei: nimmt pro Fläche
// den stärksten Fokus-Level ihrer Feinmuskeln. Läuft über renderFigure/splitMaskPath, damit
// auch hier jede Feinaufteilung (Trapez-Bänder, Bizeps/Brachialis, Lat/Rundmuskeln …) einzeln
// eingefärbt wird – vorher hat drawMini nur die groben, ungeteilten Rohflächen gemalt und dabei
// z.B. den ganzen "lats"-Rohpfad (Lat + Rundmuskeln + Untergrätenmuskel in einer Fläche) auf den
// stärksten Wert darin gehoben, auch wenn nur der Lat selbst wirklich "Fokus" war.
function routineFocusPaint(lvl){
  return function(gs){
    var l=0;(gs||[]).forEach(function(g){if(g&&(lvl[g]||0)>l)l=lvl[g];});
    if(l<=0)return {cls:"msk",fill:"var(--body-fill)",op:0};
    return {cls:"msk",fill:focusColor(l),op:0.9};
  };
}

function drawMini(svg,view,sets){
  // Dieselbe Stufenskala wie bei den Uebungen: der am staerksten beanspruchte Muskel der
  // Einheit ist rot, alles andere faellt anteilig ab.
  var inv=normInv(sets||{});
  svg.removeAttribute("data-filled");
  fw3dSnapInto(svg,"fo:"+fw3dInvKey(inv),inv,view,false,null,"step",FT_SESSION);
}

// Kurzschluessel fuer eine Beanspruchungs-Karte, damit gleiche Motive denselben
// zwischengespeicherten Schnappschuss benutzen.
function fw3dInvKey(inv){
  var ks=[];for(var g in inv)if(inv[g]>0)ks.push(g+":"+inv[g]);
  return ks.sort().join(",");
}

function focusPanel(items){
  var fo=routineFocus(items),wrap=el("div");
  if(fo.max<=0){wrap.appendChild(el("p","note","Füg Übungen hinzu – dann siehst du hier, welche Muskeln wie stark trainiert werden."));return wrap;}
  var maps=el("div","focusmap");
  var svsFP=["front","back"].map(function(v){var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");sv.setAttribute("viewBox","0 0 800 1500");maps.appendChild(sv);return {sv:sv,v:v};});
  wrap.appendChild(maps);
  // getBBox()/getTotalLength() (für die Feinaufteilung, siehe splitMaskPath) liefern auf einem noch
  // nicht ins Dokument eingehängten <svg> nur Nullen – die Figuren hier werden aber synchron gebaut,
  // bevor "wrap" beim Aufrufer angehängt wird. Einen Frame warten, dann ist "wrap" garantiert im
  // Dokument (der Aufruf hier und das appendChild beim Aufrufer laufen im selben Tick).
  requestAnimationFrame(function(){svsFP.forEach(function(o){drawMini(o.sv,o.v,fo.sets);});});
  var lg=el("div","focus-legend");
  lg.innerHTML='<span><i style="background:'+exPctColor(1)+'"></i>Schwerpunkt</span>'+
               '<span><i style="background:'+exPctColor(0.65)+'"></i>deutlich</span>'+
               '<span><i style="background:'+exPctColor(0.3)+'"></i>mitbeansprucht</span>';
  wrap.appendChild(lg);
  var list=el("div","card flush");list.style.margin="0";
  MUSCLES.slice().sort(function(a,b){return fo.sets[b.id]-fo.sets[a.id];}).forEach(function(m){
    var v=fo.sets[m.id];if(v<=0)return;
    var share=fo.max>0?v/fo.max:0,c=corr(m),vr=Math.round(v*10)/10;
    var r=el("div","row"),mn=el("div","main");
    mn.appendChild(el("b",null,m.name));
    // Die Wocheneinordnung steht direkt daneben - eine Zahl ohne Bezugsgroesse sagt nichts.
    // Bewusst in Saetzen und nicht in Prozent: das Prozentzeichen ist in dieser App fuer
    // genau eine Bedeutung reserviert, naemlich die Trainingswirkung einer Uebung fuer
    // einen Muskel (100 % = beste verfuegbare Uebung). Stuende hier auch ein Prozentwert,
    // haette dasselbe Zeichen zwei Bedeutungen auf benachbarten Bildschirmen.
    var offen=Math.round((c.mev-v)*10)/10;
    mn.appendChild(el("span",null,"Wochenminimum "+c.mev+" Sätze · "+
      (vr>=c.mev?"erreicht":("noch "+offen+" offen"))));
    r.appendChild(mn);
    // Balken = Anteil am staerkst beanspruchten Muskel dieser Einheit, gleiche Farbe wie
    // in der Figur daneben. Die Zahl daneben ist die gewichtete Satzzahl.
    var track=el("i","fbar");track.style.setProperty("--c",exPctColorStep(share));
    var fill=el("b");fill.style.width=Math.max(4,Math.round(share*100))+"%";
    track.appendChild(fill);r.appendChild(track);
    r.appendChild(el("span","val",vr));
    list.appendChild(r);
  });
  wrap.appendChild(list);
  wrap.appendChild(el("p","note","Gewichtete Sätze: je Satz zählt ein Muskel mit dem Anteil, "+
    "den diese Übung für ihn leistet (in der Übung als Prozent angegeben, 100 % = beste "+
    "verfügbare Übung), mal dem Faktor für die Wiederholungen in Reserve. "+
    "Balken und Farbe zeigen den Anteil am stärkst beanspruchten Muskel DIESER Einheit – "+
    "die Figur oben ist genauso eingefärbt. Sie sagen also, worauf die Einheit zielt, "+
    "nicht wie viel der Wochenmenge sie deckt; das steht als Satzzahl daneben."));
  return wrap;
}


/* ================= Routine-Editor ================= */
function sheetEditor(id,preset){
  var ed=preset?preset:(id?JSON.parse(JSON.stringify(state.routines[id])):{id:rid(),name:"",items:[]});
  openSheet(function(b){
    sheetTitle(b,id?"Einheit bearbeiten":"Neue Einheit");
    var nf=el("div","field");nf.appendChild(el("label",null,"Name"));
    var ni=document.createElement("input");ni.type="text";ni.value=ed.name;ni.placeholder="z. B. Oberkörper A";nf.appendChild(ni);b.appendChild(nf);
    var list=el("div");list.style.margin="12px -16px 0";b.appendChild(list);
    var focusBox=el("div");
    function draw(){
      list.innerHTML="";
      if(!ed.items.length)list.appendChild(el("div","empty","Noch keine Übung."));
      else{var hd=el("div","ed-head");["Übung","Sätze","Wdh.","kg","",""].forEach(function(t){hd.appendChild(el("span",null,t));});list.appendChild(hd);}
      ed.items.forEach(function(it,i){
        var ex=exById(it.ex),r=el("div","ed-row");
        var nm=el("div");nm.appendChild(el("b",null,ex?ex.n:it.ex));
        var sub=el("span","lab",ex?(ex.p||[]).map(function(m){var mm=muscleById(m);return mm?mm.name:m;}).join(", "):"");sub.style.textAlign="left";nm.appendChild(sub);r.appendChild(nm);
        function inp(val,step,cb){var n=document.createElement("input");n.type="number";n.inputMode="decimal";n.step=step;n.min="0";n.value=val;
          n.onchange=function(){cb(parseFloat(String(n.value).replace(",","."))||0);focusBox.innerHTML="";focusBox.appendChild(focusPanel(ed.items));};return n;}
        r.appendChild(inp(it.sets,"1",function(v){it.sets=clamp(Math.round(v)||1,1,12);}));
        var ri=inp(it.reps,"1",function(v){it.reps=Math.max(1,Math.round(v)||8);});if(ex&&ex.t==="sec")ri.placeholder="s";r.appendChild(ri);
        if(ex&&ex.t==="load")r.appendChild(inp(it.kg||0,"2.5",function(v){it.kg=v;}));else r.appendChild(el("span","lab",ex&&ex.t==="sec"?"Sek.":"KG"));
        // Reihenfolge aendern: bewusst zwei Pfeile statt Ziehen-und-Fallenlassen. Die Liste
        // steht in einem scrollbaren Blatt, dort ist Ziehen auf dem Telefon unzuverlaessig -
        // es kollidiert mit dem Scrollen des Blattes.
        var mv=el("div","ed-move");
        function moveBtn(dir,lab,path){
          var b=el("button","ed-mv");b.type="button";b.setAttribute("aria-label",lab);
          b.innerHTML=svgIcon(path,2.2);
          b.disabled=(dir<0&&i===0)||(dir>0&&i===ed.items.length-1);
          b.onclick=function(ev){
            ev.preventDefault();ev.stopPropagation();
            var j=i+dir;if(j<0||j>=ed.items.length)return;
            var tmp=ed.items[i];ed.items[i]=ed.items[j];ed.items[j]=tmp;
            draw();
          };
          return b;
        }
        mv.appendChild(moveBtn(-1,"Nach oben","M6 14l6-6 6 6"));
        mv.appendChild(moveBtn(1,"Nach unten","M6 10l6 6 6-6"));
        r.appendChild(mv);
        var del=el("button","iconbtn");del.setAttribute("aria-label","Entfernen");del.innerHTML=svgIcon(IC_TRASH,1.6);
        del.onclick=function(){ed.items.splice(i,1);draw();};r.appendChild(del);list.appendChild(r);
      });
      focusBox.innerHTML="";focusBox.appendChild(focusPanel(ed.items));
    }
    draw();
    var addBtn=el("button","btn ghost block","+ Übung hinzufügen");addBtn.style.marginTop="12px";
    addBtn.onclick=function(){
      ed.name=ni.value;closeSheet();
      setTimeout(function(){openSheet(function(bb){sheetTitle(bb,"Übung hinzufügen");
        exPicker(bb,null,function(e){ed.items.push({ex:e.id,sets:3,reps:e.t==="sec"?30:8,kg:0});closeSheet();setTimeout(function(){sheetEditor(id,ed);},180);});});},180);
    };
    b.appendChild(addBtn);
    var fh=el("h2","sec","Welche Muskeln trainiert diese Einheit?");fh.style.margin="18px 0 8px";b.appendChild(fh);
    b.appendChild(focusBox);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){ed.name=(ni.value||"").trim()||"Einheit";if(!ed.items.length)return;
      state.routines[ed.id]=ed;state.dirtyRoutines[ed.id]=true;closeSheet();persist();renderAll();};
    b.appendChild(save);
    if(id){var del2=el("button","btn ghost block","Einheit löschen");del2.style.marginTop="8px";
      del2.onclick=function(){closeSheet();setTimeout(function(){askConfirm("Einheit löschen?",ed.name,"Löschen",function(){delete state.routines[id];state.dirtyRoutines[id]=true;persist();renderAll();});},180);};
      b.appendChild(del2);}
  });
}

function suggestRoutine(){
  var ms=muscleSets(TODAY,WIN_BODY);
  var gaps=CORE_MUSCLES.map(function(id){return {id:id,d:corr(muscleById(id)).mev-(ms[id]||0)};}).filter(function(g){return g.d>0;}).sort(function(a,b){return b.d-a.d;}).slice(0,5);
  if(!gaps.length){toast("Diese Woche liegt jede Hauptmuskelgruppe über dem Minimum.");return;}
  var items=[],used={};
  gaps.forEach(function(g){
    var c=EX.filter(function(e){return !e.mob&&e.t!=="cardio"&&(e.p||[]).indexOf(g.id)>=0&&!used[e.id];});
    c.sort(function(a,b){return (a.p.length+a.s.length)-(b.p.length+b.s.length);});
    if(!c[0])return;used[c[0].id]=1;
    items.push({ex:c[0].id,sets:clamp(Math.ceil(g.d/2),2,4),reps:c[0].t==="sec"?30:8,kg:0});
  });
  sheetEditor(null,{id:rid(),name:"Lücken schließen",items:items});
}

$("btn-start-empty").addEventListener("click",function(){startWorkout(null);});

// Die früheren Buttons "Neue Einheit"/"Lücken schließen"/"Übungskatalog" unter den Karten
// wurden entfernt – "Neue Einheit" erreicht man jetzt über die zusätzliche "+"-Karte am Ende
// des Einheiten-Pagers (siehe renderRoutines), die anderen beiden nur noch verdrahten, falls
// die Elemente doch existieren (schadet nicht, verhindert aber keinen Fehler, falls nicht).
if($("btn-new-routine"))$("btn-new-routine").addEventListener("click",function(){sheetEditor(null);});

if($("btn-suggest"))$("btn-suggest").addEventListener("click",suggestRoutine);

if($("btn-catalog"))$("btn-catalog").addEventListener("click",openExerciseCatalog);


var I18N={
  "nav.heute":{de:"Heute",en:"Today"},
  "nav.entdecken":{de:"Entdecken",en:"Explore"},
  "nav.training":{de:"Training",en:"Training"},
  "nav.koerper":{de:"Körper",en:"Body"},
  "nav.werte":{de:"Werte",en:"Stats"},
  "body.hint":{de:"Tipp einen Muskel an – oder wähl oben eine Region.",en:"Tap a muscle — or pick a region above."},
  "body.hintLong":{de:"Tipp einen Muskel an – oder oben eine Region wie „Brust“, dann werden alle zugehörigen Muskeln markiert.",en:"Tap a muscle — or a region above such as “Chest” to highlight every muscle in it."},
  "body.all":{de:"Alle",en:"All"},
  "leg.none":{de:"nichts",en:"none"},
  "leg.min":{de:"Minimum",en:"Minimum"},
  "leg.opt":{de:"Optimum",en:"Optimum"},
  "leg.over":{de:"über Limit",en:"over limit"},
  "zone.low":{de:"zu wenig",en:"too little"},
  "zone.ok":{de:"im Korridor",en:"in range"},
  "zone.high":{de:"über Limit",en:"over limit"},
  "sec.byRegion":{de:"Nach Körperregion",en:"By body region"},
  "sec.byRegionSub":{de:"letzte 7 Tage · antippen für Details",en:"last 7 days · tap for details"},
  "row.sets":{de:"Sätze",en:"sets"},
  "row.goal":{de:"Ziel",en:"target"},
  "det.tapDetails":{de:"antippen für Details",en:"tap for details"},
  "det.tapDetailsOne":{de:"Antippen für Details",en:"Tap for details"},
  "det.groups":{de:"Gruppen",en:"groups"},
  "det.recovery":{de:"Erholung",en:"Recovery"},
  "det.corridor":{de:"Korridor · Sätze pro Woche",en:"Range · sets per week"},
  "det.more":{de:"Was noch mehr bringt",en:"What more would add"},
  "det.minimum":{de:"Minimum",en:"Minimum"},
  "det.optimum":{de:"Optimum",en:"Optimum"},
  "det.limit":{de:"Grenze",en:"Limit"},
  "det.examples":{de:"Beispiele",en:"Examples"},
  "det.avg8":{de:"Dein Schnitt der letzten 8 Wochen",en:"Your 8-week average"},
  "det.perWeek":{de:"Sätze/Woche",en:"sets/week"},
  "det.adjusted":{de:"Korridor von dir angepasst",en:"range adjusted by you"},
  "det.recFull":{de:"vollständig erholt",en:"fully recovered"},
  "det.recLast":{de:"zuletzt",en:"last worked"},
  "det.recNone":{de:"seit mindestens drei Wochen nicht belastet",en:"not worked for at least three weeks"},
  "det.recGuide":{de:"Richtwert",en:"Guide value"},
  "det.hours":{de:"Std.",en:"h"},
  "set.lang":{de:"Sprache",en:"Language"},
  "set.langDe":{de:"Deutsch",en:"German"},
  "set.langEn":{de:"Englisch",en:"English"},
  "set.account":{de:"Konto & Daten",en:"Account & data"},
  "set.title":{de:"Einstellungen",en:"Settings"},
  "set.rowSub":{de:"Ziele, Körperdaten, Sprache, Konto","en":"Goals, body data, language, account"},
  "set.gGoals":{de:"Wochenziele",en:"Weekly goals"},
  "set.gBody":{de:"Körperdaten",en:"Body data"},
  "set.gLang":{de:"Sprache",en:"Language"},
  "set.days":{de:"Trainingstage pro Woche",en:"Training days per week"},
  "set.mob":{de:"Mobilität pro Woche",en:"Mobility sessions per week"},
  "set.cardio":{de:"Ausdauerminuten pro Woche",en:"Cardio minutes per week"},
  "set.weight":{de:"Körpergewicht",en:"Body weight"},
  "set.age":{de:"Alter",en:"Age"},
  "set.sex":{de:"Geschlecht",en:"Sex"},
  "set.female":{de:"weiblich",en:"female"},
  "set.male":{de:"männlich",en:"male"},
  "set.sync":{de:"Anmeldung & Sync",en:"Sign-in & sync"},
  "set.backupSave":{de:"Backup speichern",en:"Save backup"},
  "set.backupLoad":{de:"Backup einspielen",en:"Restore backup"},
  "set.fileOrText":{de:"Datei/Text",en:"File/text"},
  "set.langNote":{de:"Die Namen von Regionen, Muskeln und Übungen wechseln mit. Erklärtexte sind noch nicht vollständig übersetzt.",
                  en:"Region, muscle and exercise names switch along. Explanatory texts are not fully translated yet."},
  "gen.back":{de:"Zurück",en:"Back"},
  "unit.days":{de:"Tage",en:"days"},
  "unit.years":{de:"Jahre",en:"years"},
  "sync.local":{de:"nur dieses Gerät",en:"this device only"}
}
;


/* ================= Sprache =================
   Umschaltbar zwischen Deutsch und Englisch. Die Namen (Regionen, Muskelgruppen, Uebungen)
   werden beim Wechsel IM DATENSATZ ausgetauscht statt an hunderten Stellen abgefragt - das
   Original bleibt unter einem Unterstrich-Feld liegen und wird beim Zurueckschalten
   wiederhergestellt. Die englischen Namen der Feinmuskeln stehen schon im 3D-Modell: dessen
   Schluessel SIND die englischen Bezeichnungen, nur mit Unterstrichen. */
var UI_EN={"Heute": "Today", "Entdecken": "Explore", "Training": "Training", "Körper": "Body", "Werte": "Stats", "Alle": "All", "Alle Übungen": "All exercises", "Alter": "Age", "Anmeldung & Sync": "Sign-in & sync", "Arme": "Arms", "Beine": "Legs", "Assessment neu machen": "Redo assessment", "Ausdauer": "Endurance", "Ausdauerminuten pro Woche": "Cardio minutes per week", "Backup einspielen": "Restore backup", "Backup speichern": "Save backup", "Beenden": "Finish", "Belastungsäquivalent": "Load equivalent", "Cooper-Test": "Cooper test", "Datei/Text": "File/text", "Deutsch": "German", "Englisch": "English", "Eigene Einheit zusammenstellen": "Build your own session", "Einstellungen": "Settings", "Eintragen": "Log", "Erholung": "Recovery", "Geschlecht": "Sex", "Grenze": "Limit", "Konstanz": "Consistency", "Konto & Daten": "Account & data", "Korridor für dich": "Your range", "Korridor · Sätze pro Woche": "Range · sets per week", "Kraftstufen": "Strength levels", "Körperdaten": "Body data", "Körpergewicht": "Body weight", "Körperillustration:": "Body illustration:", "Letzte Tage": "Recent days", "Maximalkraft": "Max strength", "Meine Einheiten": "My sessions", "Minimum": "Minimum", "Optimum": "Optimum", "Minuten pro Woche": "Minutes per week", "Mobilität": "Mobility", "Mobilität pro Woche": "Mobility sessions per week", "Muskelabdeckung": "Muscle coverage", "Muskelgruppen": "Muscle groups", "Nach Körperregion": "By body region", "Nach Übungen suchen…": "Search exercises…", "Neue Einheit": "New session", "Neues Training starten": "Start new workout", "Notiz": "Note", "Rechenweg": "How it is calculated", "Ruhepuls": "Resting heart rate", "Sprache": "Language", "Standard": "Standard", "Teilwerte": "Sub-scores", "Verlauf": "History", "Was noch mehr bringt": "What more would add", "Weiter": "Continue", "Wochenziele": "Weekly goals", "Woche vor": "Next week", "Woche zurück": "Previous week", "Zurück": "Back", "Ziele, Körperdaten, Sprache, Konto": "Goals, body data, language, account", "Trainingstage pro Woche": "Training days per week", "Tipp eine Muskelgruppe an.": "Tap a muscle group.", "Tipp einen Muskel an – oder wähl oben eine Region.": "Tap a muscle — or pick a region above.", "Tipp einen Muskel an – oder oben eine Region wie „Brust“, dann werden alle zugehörigen Muskeln markiert.": "Tap a muscle — or a region above such as “Chest” to highlight every muscle in it.", "Ziehen = drehen · Tippen = Muskel auswählen": "Drag = rotate · Tap = select muscle", "Die Richtwerte sind Gruppenmittelwerte mit großer Streuung. Wenn du für diesen Muskel erkennbar mehr oder weniger brauchst, verschieb den Korridor hier.": "These guide values are group averages with wide spread. If this muscle clearly needs more or less for you, shift the range here.", "Die Namen von Regionen, Muskeln und Übungen wechseln mit. Erklärtexte sind noch nicht vollständig übersetzt.": "Region, muscle and exercise names switch along. Explanatory texts are not fully translated yet.", "3D-Modell wird geladen…": "Loading 3D model…", "3D-Modell konnte nicht geladen werden.": "3D model could not be loaded.", "deutlich mehr": "much more", "deutlich weniger": "much less", "mehr": "more", "weniger": "less", "im Korridor": "in range", "zu wenig": "too little", "über Limit": "over limit", "männlich": "male", "weiblich": "female", "nicht gemacht": "not done", "nichts": "none", "noch nichts notiert": "nothing noted yet", "noch offen": "still open", "offen": "open", "nur dieses Gerät": "this device only", "verfallen": "expired", "unter F": "below F", "+ Erstellen": "+ Create", ", MIT-Lizenz.": ", MIT licence.", "Mo": "Mon", "Di": "Tue", "Mi": "Wed", "Do": "Thu", "Fr": "Fri", "Sa": "Sat", "So": "Sun", "Knorrenmuskel": "Anconeus", "Beanspruchte Muskeln": "Muscles worked", "Bewegungsablauf in 3D": "Movement in 3D", "3D-Modell wird geladen …": "Loading 3D model …", "Rechter Arm, Muskeln in den Farben von „Beanspruchte Muskeln“.": "Right arm, muscles coloured as in “Muscles worked”.", "Die 3D-Animation braucht einen neueren Browser.": "The 3D animation needs a newer browser.", "3D-Animation konnte nicht geladen werden.": "The 3D animation could not be loaded.", "Reihenfolge geändert": "Order changed", "Karte gedrückt halten und zur Seite schieben, um die Reihenfolge zu ändern.": "Press and hold a card, then slide it sideways to change the order.", "Stärkt zusätzlich": "Also strengthens", "Wird gedehnt": "Stretched", "Wird bewegt": "Mobilised", "Statisch": "Static", "Dynamisch": "Dynamic", "Alles": "All", "Mobilität · Statisch": "Mobility · Static", "Mobilität · Dynamisch": "Mobility · Dynamic",
"Neue Übung":"New exercise","Vorschau":"Preview","keine gewählt":"none selected",
"Primärmuskeln":"Primary muscles","Sekundärmuskeln (halber Satz)":"Secondary muscles (half a set)","Übung anlegen":"Create exercise","Übung wählen":"Choose exercise",
"Übung angelegt":"Exercise created","Bitte einen Namen eingeben.":"Please enter a name.",
"Bitte mindestens einen Primärmuskel wählen.":"Please pick at least one primary muscle.",
"Sonstiges":"Other", "Vorne": "Front", "Hinten": "Back", "Satz speichern": "Save set", "Übung hinzufügen": "Add exercise", "Speichern": "Save", "Abbrechen": "Cancel", "Löschen": "Delete", "fertig": "done", "Sätze": "Sets", "Wdh": "reps", "Reserve": "Reserve", "Pause": "Rest", "verbinde": "connecting", "synchronisiert": "synced"}
;

var UI_RX=[
  [/Für einen nachweisbaren Unterschied bräuchtest du ab hier rund ([\d,.]+) Sätze\/Woche mehr\. Doppelte Satzzahl heißt \+(\d+) % Reiz, nicht \+100 %\./g,"To reach a detectable difference you would need about $1 more sets per week from here. Twice the sets means +$2 % stimulus, not +100 %."],
  [/Reiz (\d+) % vom Optimum · nächster Satz bringt noch (\d+) % von dem, was dein erster bringt/g,"Stimulus $1 % of optimum · the next set still adds $2 % of what your first one adds"],
  [/Richtwert (\d+) Std\., für ([\d,.]+) Sätze in der Einheit auf (\d+) Std\. angepasst/g,"Guide value $1 h, adjusted to $3 h for $2 sets in that session"],
  [/Dein Schnitt der letzten 8 Wochen: ([\d,.]+) Sätze\/Woche/g,"Your 8-week average: $1 sets/week"],
  [/seit mindestens drei Wochen nicht belastet/g,"not worked for at least three weeks"],
  [/vollständig erholt · zuletzt (.+?) belastet/g,"fully recovered · last worked $1"],
  [/noch (\d+) Std\. · zuletzt (.+?) belastet/g,"$1 h to go · last worked $2"],
  [/(\d+) % Reiz · ([\d,.]+) Sätze/g,"$1 % stimulus · $2 sets"],
  [/(\d+) von (\d+) Gruppen im Korridor/g,"$1 of $2 groups in range"],
  [/(\d+) von (\d+) im Korridor/g,"$1 of $2 in range"],
  [/alle zu wenig/g,"all too little"],
  [/(\d+) zu viel/g,"$1 over"],
  [/(\d+) von (\d+) Trainingstagen/g,"$1 of $2 training days"],
  [/(\d+) Muskelgruppen unter Minimum/g,"$1 muscle groups below minimum"],
  [/(\d+) von (\d+) Muskelgruppen über dem Minimum/g,"$1 of $2 muscle groups above minimum"],
  [/(\d+) von (\d+) Bereichen gemessen/g,"$1 of $2 areas measured"],
  [/(\d+) Übungen gewertet/g,"$1 exercises counted"],
  [/(\d+) Trainingstage in (\d+) Tagen/g,"$1 training days in $2 days"],
  [/(\d+) Einheiten in (\d+) Tagen/g,"$1 sessions in $2 days"],
  [/(\d+) Minuten in (\d+) Tagen/g,"$1 minutes in $2 days"],
  [/(\d+) Übungen gemacht/g,"$1 exercises done"],
  [/(\d+) Übung gemacht/g,"$1 exercise done"],
  [/Bestwert /g,"Best "],
  [/Rückansicht, beanspruchte Muskeln, /g,"Back view, muscles worked, "],
  [/Vorderansicht, beanspruchte Muskeln, /g,"Front view, muscles worked, "],
  [/Beispiele: /g,"Examples: "],
  [/antippen für Details/g,"tap for details"],
  [/Antippen für Details/g,"Tap for details"],
  [/Einzelmuskeln antippen für Details/g,"Tap individual muscles for details"],
  [/(\d+),(\d+) Sätze\/Woche/g,"$1.$2 sets/week"],
  [/([\d,.]+) Sätze\/Woche/g,"$1 sets/week"],
  [/(\d+),(\d+) Sätze/g,"$1.$2 sets"],
  [/([\d,.]+) Sätze/g,"$1 sets"],
  [/(^|[^\w])1 Satz([^\w]|$)/g,"$11 set$2"],
  [/Ziel ([\d,.]+)/g,"target $1"],
  [/(\d+) Gruppen/g,"$1 groups"],
  [/(\d+) Gruppe([^n]|$)/g,"$1 group$2"],
  [/\bTagen\b/g,"days"],
  [/\bTage\b/g,"days"],
  [/^Mo, /g,"Mon, "],
  [/^Di, /g,"Tue, "],
  [/^Mi, /g,"Wed, "],
  [/^Do, /g,"Thu, "],
  [/^Fr, /g,"Fri, "],
  [/^Sa, /g,"Sat, "],
  [/^So, /g,"Sun, "],
  [/(\d+) Jahre/g,"$1 years"],
  [/(\d+) Std\./g,"$1 h"],
  [/vor (\d+) Tagen/g,"$1 days ago"],
  [/vor (\d+) Std\./g,"$1 h ago"],
  [/vor 1 Tag/g,"1 day ago"],
  [/gerade eben/g,"just now"],
  [/Korridor von dir angepasst/g,"range adjusted by you"],
  [/Richtwert (\d+) Std\./g,"Guide value $1 h"],
  [/seit /g,"since "],
  [/Minimum (\d+) · Optimum (\d+) · Grenze (\d+)/g,"Minimum $1 · Optimum $2 · Limit $3"],
  [/Erholungszeit/g,"Recovery time"]
];


/* Uebersetzungsschicht. Die Oberflaechentexte stehen an mehreren hundert Stellen im Code
   verteilt; sie dort alle einzeln abzufragen waere ein Umbau mit viel Bruchgefahr. Stattdessen
   werden fertige Texte nach dem Rendern ersetzt: exakte Treffer aus dem Woerterbuch, und fuer
   zusammengesetzte Saetze ("3,7 Saetze · Ziel 7") eine Handvoll Muster. Ein Beobachter faengt
   alles ein, was die App spaeter nachbaut - Blaetter, Dialoge, Listen.
   Eigene Eingaben des Nutzers bleiben unberuehrt: sie stehen nicht im Woerterbuch. */
var _uiBusy=false;

/* Rueckwaerts-Woerterbuch. Beim Zurueckschalten auf Deutsch muessen fest im Dokument stehende
   Beschriftungen (Navigation, Ringlegende, Sync-Anzeige) wieder deutsch werden - die werden
   beim Neuzeichnen naemlich NICHT neu erzeugt und waeren sonst dauerhaft englisch geblieben.
   Mehrdeutige Rueckwege werden weggelassen: "Back" waere sowohl "Zurueck" als auch "Hinten". */
var UI_DE=(function(){
  var back={},seen={},k;
  for(k in UI_EN){var v=UI_EN[k];seen[v]=(seen[v]||0)+1;}
  for(k in UI_EN){var v2=UI_EN[k];if(seen[v2]===1&&v2!==k)back[v2]=k;}
  return back;
})();

function trText(s){
  if(!s)return null;
  var lead=s.match(/^\s*/)[0], tail=s.match(/\s*$/)[0], t=s.trim();
  if(!t)return null;
  if(LANG!=="en"){
    // Zurueck nach Deutsch: nur eindeutige Einzelbegriffe, keine Muster.
    var d=UI_DE[t];
    return d!=null?lead+d+tail:null;
  }
  var hit=UI_EN[t];
  if(hit!=null)return lead+hit+tail;
  var o=t;
  for(var i=0;i<UI_RX.length;i++){UI_RX[i][0].lastIndex=0;o=o.replace(UI_RX[i][0],UI_RX[i][1]);}
  return o!==t?lead+o+tail:null;
}

function applyUiLang(root){
  if(!root)return;
  _uiBusy=true;
  try{
    if(root.nodeType===3){
      var pp=root.parentNode,bad=false;
      while(pp&&pp.nodeType===1){if({STYLE:1,SCRIPT:1,TEXTAREA:1,INPUT:1,CODE:1,PRE:1}[pp.nodeName]||pp.isContentEditable){bad=true;break;}pp=pp.parentNode;}
      if(!bad){var r0=trText(root.nodeValue);if(r0!=null)root.nodeValue=r0;}
    }
    else if(root.nodeType===1){
      /* Stil- und Skriptknoten NIE anfassen - dort stuende sonst uebersetztes CSS bzw.
         veraenderter Code. Ebenso Eingabefelder, damit Getipptes unberuehrt bleibt. */
      var skip={STYLE:1,SCRIPT:1,TEXTAREA:1,INPUT:1,CODE:1,PRE:1};
      var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
        acceptNode:function(nd){
          var p=nd.parentNode;
          while(p&&p.nodeType===1){
            if(skip[p.nodeName])return NodeFilter.FILTER_REJECT;
            if(p.isContentEditable)return NodeFilter.FILTER_REJECT;
            p=p.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }}),n,jobs=[];
      while(n=w.nextNode()){var r=trText(n.nodeValue);if(r!=null&&r!==n.nodeValue)jobs.push([n,r]);}
      for(var i=0;i<jobs.length;i++)jobs[i][0].nodeValue=jobs[i][1];
      var els=root.querySelectorAll("[aria-label],[placeholder],[title]");
      for(var j=0;j<els.length;j++){
        ["aria-label","placeholder","title"].forEach(function(a){
          var v=els[j].getAttribute(a);if(!v)return;
          var rr=trText(v);if(rr!=null&&rr!==v)els[j].setAttribute(a,rr);
        });
      }
      ["aria-label","placeholder","title"].forEach(function(a){
        var v=root.getAttribute&&root.getAttribute(a);if(!v)return;
        var rr=trText(v);if(rr!=null&&rr!==v)root.setAttribute(a,rr);
      });
    }
  }catch(e){}finally{_uiBusy=false;}
}

(function(){
  if(typeof MutationObserver!=="function")return;
  /* Nicht pro eingefuegtem Knoten uebersetzen: beim Aufbau einer Liste kommen hunderte
     Einfuegungen, und jede Teilmenge wuerde mehrfach durchlaufen. Stattdessen wird EIN
     Durchlauf ueber die Seite gebuendelt und im naechsten Frame ausgefuehrt. */
  var pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    (window.requestAnimationFrame||setTimeout)(function(){
      pending=false;applyUiLang(document.body);
    },0);
  }
  var mo=new MutationObserver(function(){
    if(_uiBusy)return;
    schedule();
  });
  mo.observe(document.body,{childList:true,subtree:true,characterData:true});
})();

var LANG="de";

var REG_EN={"Brust": "Chest", "Schultern": "Shoulders", "Rücken": "Back", "Rückenstrecker": "Spinal erectors", "Bizeps": "Biceps", "Trizeps": "Triceps", "Unterarme": "Forearms", "Rumpf": "Core", "Gesäß": "Glutes", "Quadrizeps": "Quadriceps", "Beinbeuger": "Hamstrings", "Adduktoren": "Adductors", "Waden": "Calves", "Hals": "Neck (front)", "Nacken": "Neck (back)"}
;

var MUS_EN={"tg_brust_ober": "Upper chest", "tg_brust_mitte": "Mid chest", "tg_brust_unten": "Lower chest", "tg_brust_serratus": "Serratus anterior", "tg_bizeps": "Biceps", "tg_brachialis": "Brachialis", "tg_trizeps_lang": "Triceps long head", "tg_trizeps_lat": "Triceps lateral & medial", "tg_rueck_lat": "Latissimus dorsi", "tg_rueck_teres_major": "Teres major", "tg_rueck_trapez_ob": "Upper trapezius", "tg_rueck_trapez_mit": "Mid trapezius", "tg_rueck_trapez_unt": "Lower trapezius", "tg_rueck_rhomb": "Rhomboids", "tg_rueck_strecker": "Spinal erectors (deep)", "tg_schulter_vorn": "Front delt", "tg_schulter_seit": "Side delt", "tg_schulter_hint": "Rear delt", "tg_schulter_rot_infra": "Infraspinatus", "tg_schulter_rot_teres_min": "Teres minor", "tg_schulter_rot_sub": "Subscapularis", "tg_schulter_rot_supra": "Supraspinatus", "tg_bauch_gerade": "Rectus abdominis", "tg_bauch_schraeg": "Obliques", "tg_bauch_tief": "Deep core & breathing muscles", "tg_quadrizeps": "Quadriceps", "tg_huefte": "Hip flexors", "tg_adduktoren": "Adductors", "tg_kniesehnen": "Hamstrings", "tg_gesaess_haupt": "Gluteus maximus", "tg_gesaess_med": "Gluteus medius", "tg_gesaess_min": "Gluteus minimus", "tg_wade_gastro": "Calf (standing)", "tg_wade_soleus": "Calf (seated)", "tg_wade_fussheber": "Shin / dorsiflexors", "tg_unterarm_beug": "Wrist flexors & pronators", "tg_unterarm_streck": "Wrist extensors & supinators", "tg_nacken": "Neck (back)", "tg_hals_nacken": "Front/side neck muscles"}
;

var EX_EN={"bench": "Barbell bench press", "bench_db": "Dumbbell bench press", "bench_inc": "Incline bench press", "bench_inc_db": "Incline DB press", "bench_dec": "Decline bench press", "machine_press": "Chest press machine", "machine_press_lying": "Lying chest press", "pushup": "Push-ups", "pushup_diamond": "Diamond push-ups", "pushup_arch": "Archer push-ups", "pushup_dec": "Feet-elevated push-ups", "dips": "Dips", "fly_db": "Dumbbell fly", "cable_fly": "Cable fly", "fly_machine": "Pec deck", "pullover": "Pullovers", "ohp": "Barbell overhead press", "ohp_db": "Dumbbell overhead press", "push_press": "Push press", "arnold": "Arnold press", "pike_pushup": "Pike push-ups", "hspu": "Handstand push-ups", "handstand": "Wall handstand hold", "pullup": "Pull-ups (overhand)", "chinup": "Chin-ups", "pullup_wide": "Wide-grip pull-ups", "pullup_weight": "Weighted pull-ups", "latpull": "Lat pulldown", "latpull_close": "Close-grip pulldown", "pullup_neg": "Negative pull-ups", "deadhang": "Passive hang", "row_bb": "Barbell row", "row_db": "Dumbbell row", "row_pendlay": "Pendlay row", "row_tbar": "T-bar row", "row_cable": "Cable row", "row_machine": "Lever seated row", "row_inv": "Inverted rows", "row_band": "Band row", "facepull": "Face pulls", "shrug": "Shrugs", "shrug_db": "Dumbbell shrugs", "squat": "Barbell squat", "squat_front": "Front squat", "squat_goblet": "Goblet squat", "squat_bw": "Bodyweight squat", "squat_pistol": "Pistol squat", "squat_bulg": "Bulgarian split squat", "legpress": "Leg press", "hacksquat": "Hack squat", "lunge": "Lunges", "lunge_walk": "Walking lunges", "stepup": "Step-ups", "stepup_bw": "Bodyweight step-ups", "legext": "Leg extension", "sissy": "Sissy squat", "wallsit": "Wall sit", "deadlift": "Deadlift", "deadlift_rdl": "Romanian deadlift", "deadlift_sumo": "Sumo deadlift", "deadlift_sl": "Single-leg deadlift", "hipthrust": "Hip thrust", "goodmorning": "Good morning", "backext": "Back extension", "legcurl": "Leg curl", "nordic": "Nordic curl", "kb_swing": "Kettlebell swing", "plank": "Plank", "lsit": "L-sit", "sideplank": "Side plank", "hollow": "Hollow body hold", "legraise": "Hanging leg raise", "kneeraise": "Hanging knee raise", "crunch": "Crunches", "situp": "Sit-ups", "russian": "Russian twist", "abwheel": "Ab wheel", "cablecrunch": "Cable crunch", "torso_rot": "Torso rotation machine", "deadbug": "Dead bug", "birddog": "Bird dog", "pallof": "Pallof press", "dragonflag": "Dragon flag", "lateral": "Lateral raise", "lateral_cable": "Cable lateral raise", "frontraise": "Front raise", "reversefly": "Reverse fly", "upright_row": "Upright row", "cuban": "Cuban press", "bandpullapart": "Band pull-apart", "curl_bb": "Barbell curl", "curl_db": "Dumbbell curl", "curl_hammer": "Hammer curl", "curl_incline": "Incline curl", "curl_preacher": "Preacher curl", "curl_preacher_machine": "Preacher curl machine", "curl_cable": "Cable curl", "curl_cable_lying": "Lying cable curl", "tri_push": "Triceps pushdown", "tri_skull": "Skull crusher", "tri_over": "Overhead triceps extension", "tri_kick": "Triceps kickback", "dips_bench": "Bench dips", "wrist_curl": "Wrist curl", "wrist_curl_rev": "Reverse wrist curl", "farmers": "Farmer's walk", "ricebucket": "Rice bucket grip work", "fatgripz": "Fat-grip holds", "calf_stand": "Standing calf raise", "calf_seat": "Seated calf raise", "calf_bw": "Bodyweight calf raise", "adduct": "Adductor machine", "clamshell": "Clamshells", "sidelying_raise": "Side-lying leg raise", "bandwalk_lat": "Lateral band walk", "abduct": "Abductor machine", "copenhagen": "Copenhagen plank", "neck_curl": "Neck curl", "neck_ext_bw": "Neck extension", "neck_flex_bw": "Neck flexion", "neck_side_bw": "Lateral neck flexion", "neck_harness": "Head harness", "neck_bridge": "Neck bridge", "run": "Running", "run_interval": "Interval runs", "bike": "Cycling", "row_erg": "Rowing machine", "swim": "Swimming", "jumprope": "Jump rope", "walk": "Brisk walking", "hike": "Hiking", "stairs": "Stair climbing", "burpee": "Burpees", "elliptical": "Elliptical", "football": "Football / ball sports", "mob_hip": "Hip openers", "mob_shoulder": "Shoulder mobility", "mob_thoracic": "Thoracic spine", "mob_hamstring": "Hamstring stretch", "mob_ankle": "Ankle mobility", "mob_couch": "Couch stretch", "mob_deadhang": "Dead hang decompression", "mob_pancake": "Pancake / straddle", "mob_chest": "Pectoralis stretch", "mob_biceps": "Biceps stretch", "mob_cobra": "Prone press-up", "mob_reardelt": "Cross-body shoulder stretch", "mob_triceps": "Overhead triceps stretch", "mob_neck": "Upper trapezius stretch", "mob_lat": "Lat stretch", "mob_knee2chest": "Knee-to-chest", "mob_twist": "Supine spinal twist", "mob_wrist_flex": "Wrist flexor stretch", "mob_wrist_ext": "Wrist extensor stretch", "mob_hipflex": "Kneeling hip flexor stretch", "mob_pigeon": "Pigeon / figure-4", "mob_glutemed": "Gluteus medius stretch", "mob_quad": "Standing quad stretch", "mob_frog": "Frog stretch", "mob_calf_straight": "Gastrocnemius stretch", "mob_calf_bent": "Soleus stretch", "mob_tibialis": "Tibialis anterior stretch", "mob_catcow": "Cat-cow", "mob_wgs": "World's greatest stretch", "mob_legswing": "Leg swings", "mob_9090": "90/90 hip switch", "mob_wrist_circ": "Wrist mobilisation", "rot_internal": "Cable internal rotation", "emptycan": "Empty-can raise", "hipflex_cable": "Cable hip flexion"}
;

/* Ein paar Feinmuskel-Schluessel sind Kuerzel oder wuerden beim Umwandeln holprig lesen. */
var FINE_EN_FIX={tfl:"Tensor fasciae latae"}
;

function enFromKey(k){
  if(FINE_EN_FIX[k])return FINE_EN_FIX[k];
  var s=String(k).replace(/_/g," ");
  return s.charAt(0).toUpperCase()+s.slice(1);
}

function detectLang(){
  var st=state&&state.profile&&state.profile.lang;
  if(st==="de"||st==="en")return st;
  var n=((navigator.language||navigator.userLanguage||"de")+"").toLowerCase();
  return n.indexOf("de")===0?"de":"en";
}

function applyLangData(){
  var en=(LANG==="en"),k,f,i;
  for(k in FINE){f=FINE[k];
    if(f._de===undefined)f._de=f.de;
    f.de=en?enFromKey(k):f._de;}
  for(i=0;i<MUSCLES.length;i++){var m=MUSCLES[i];
    if(m._name===undefined)m._name=m.name;
    m.name=en?(MUS_EN[m.id]||m._name):m._name;}
  for(i=0;i<EX.length;i++){var e=EX[i];
    if(e._n===undefined)e._n=e.n;
    e.n=en?(EX_EN[e.id]||e._n):e._n;}
  for(i=0;i<REGIONS.length;i++){var r=REGIONS[i];
    if(r.key===undefined)r.key=r.name;
    r.name=en?(REG_EN[r.key]||r.key):r.key;}
}

function setLang(l){
  if(l!==LANG){
    LANG=l;
    if(state.profile)state.profile.lang=l;
    applyLangData();
    document.documentElement.setAttribute("lang",l);
    // Standbilder tragen Namen im Bild nicht, koennen also bleiben; die Auswahl wird
    // zurueckgesetzt, weil sie auf Regionsnamen zeigt.
    selReset();selSet=null;selFine=null;selLabel=null;selTapKey=null;
    persist();renderAll();
    applyUiLang(document.body);
  }
}

function T(k){
  var d=I18N[k];
  if(!d)return k;
  return (LANG==="en"&&d.en!=null)?d.en:d.de;
}

/* ================= Navigation ================= */
var TABS=[["tab-heute","p-heute","Heute"],["tab-entdecken","p-entdecken","Entdecken"],["tab-training","p-training","Training"],["tab-koerper","p-koerper","Körper"],["tab-werte","p-werte","Werte"]];

function selectTab(id){
  tab=id;
  // Sichtbarkeit zuerst umschalten: die Körper-Figur misst ihre Brust-Clip-Rechtecke per
  // getBBox(), was in einem noch [hidden] Abschnitt 0×0 liefert (Brust "verschwindet" dann zufällig).
  TABS.forEach(function(t){$(t[0]).setAttribute("aria-selected",String(t[0]===id));$(t[1]).hidden=t[0]!==id;if(t[0]===id)$("apptitle").textContent=t[2];});
  woLive();
  $("fab").hidden=(id!=="tab-heute")||(heuteDate!==TODAY);
  var nx=$("btn-newex");if(nx)nx.hidden=(id!=="tab-entdecken");
  if(id==="tab-heute"&&heuteDirty){heuteDirty=false;renderAll();}
  else if(id!=="tab-heute"&&secDirty[id.replace("tab-","")])renderSection(id);
  // Ein laufendes Training tickt/ändert sich per Definition ständig (auch durch asynchrone
  // Hintergrund-Syncs) – beim Wechsel auf den Tab deshalb IMMER frisch rendern, statt auf das
  // dirty-Flag zu vertrauen. Sonst können Häkchen/Zähler eine veraltete Momentaufnahme zeigen.
  else if(id==="tab-training"&&workout){
    // Solange der Abschnitt ausgeblendet war, hatte der Wischer keine Breite: Seite und
    // Muskelfiguren erst jetzt, im sichtbaren Zustand, richtig setzen.
    renderSession();woGoto(woPage,false);woFillFigs();
    requestAnimationFrame(function(){woGoto(woPage,false);woFillFigs();});
  }
}

TABS.forEach(function(t){$(t[0]).addEventListener("click",function(){selectTab(t[0]);window.scrollTo(0,0);});});

$("disc-search").addEventListener("input",function(){discQuery=this.value;renderDiscExGrid();});

$("fab").addEventListener("click",sheetActions);

$("btn-redo").addEventListener("click",function(){startOnboarding(state.profile);});


/* ================= Heute: Tageswechsel per Wischgeste =================
   Wischt man auf dem Heute-Inhalt (Hero-Ring, Wochenstreifen, Tagesliste) seitlich, wechselt
   der angezeigte Tag (heuteDate) – Kopfzeile und untere Navigation bleiben unangetastet, die
   sitzen außerhalb von #p-heute. Nach rechts wischen = ein Tag zurück (wie im Kalender),
   nach links = ein Tag vor, aber nie über den echten heutigen Tag hinaus in die Zukunft. */
function shiftHeuteDate(delta){
  var nd=shiftDays(heuteDate,delta);
  if(nd>TODAY)nd=TODAY;
  if(nd===heuteDate)return false;
  heuteDate=nd;
  renderHero(heuteDate===TODAY?lastC:compute(heuteDate),state.profile.peaks||{});
  renderWeek();renderToday();
  return true;
}

(function(){
  // Wischen, um zum vorherigen/nächsten Tag zu wechseln – funktioniert überall auf der Heute-Seite
  // (nicht nur innerhalb der Karten, auch im leeren Bereich darunter), folgt dabei live dem Finger
  // und geht danach in einen weichen Rein-/Raus-Übergang über statt hart umzuschalten.
  var sx=0,sy=0,tracking=false,swiped=false,dragging=false,suppressClick=false,curDx=0;
  var sec=$("p-heute");if(!sec)return;
  function blocked(t){
    if($("scrim").classList.contains("open"))return true;         // Sheet offen
    if(!$("exdpage").hidden)return true;                          // Übungsseite offen
    if(t&&t.closest&&(t.closest("nav.bottom")||t.closest(".fab")))return true;
    return false;
  }
  function settle(x,op,dur,cb){
    sec.style.transition=dur?"transform "+dur+"s ease-out, opacity "+dur+"s ease-out":"none";
    sec.style.transform="translateX("+x+"px)";sec.style.opacity=String(op);
    if(cb)setTimeout(cb,dur*1000);
  }
  document.addEventListener("touchstart",function(e){
    if(tab!=="tab-heute"||e.touches.length!==1||blocked(e.target)){tracking=false;return;}
    sx=e.touches[0].clientX;sy=e.touches[0].clientY;tracking=true;swiped=false;dragging=false;curDx=0;
  },{passive:true});
  document.addEventListener("touchmove",function(e){
    if(!tracking||e.touches.length!==1)return;
    var dx=e.touches[0].clientX-sx,dy=e.touches[0].clientY-sy;
    if(!swiped){
      if(Math.abs(dx)>10&&Math.abs(dx)>Math.abs(dy)*1.5){swiped=true;dragging=true;sec.style.transition="none";}
      else if(Math.abs(dy)>10){tracking=false;return;} // eindeutig vertikales Scrollen: nicht als Wisch werten
    }
    if(dragging){
      if(e.cancelable)e.preventDefault(); // während des Ziehens nicht zusätzlich die Seite vertikal scrollen
      var atEdge=(heuteDate===TODAY&&dx<0); // am heutigen Tag geht es nicht weiter in die Zukunft
      curDx=atEdge?dx*0.25:dx;
      var clamped=Math.max(-70,Math.min(70,curDx*0.35));
      sec.style.transform="translateX("+clamped+"px)";
      sec.style.opacity=String(1-Math.min(Math.abs(clamped)/70,1)*0.3);
    }
  },{passive:false});
  document.addEventListener("touchend",function(e){
    if(!tracking)return;tracking=false;if(!swiped)return;
    // Jede erkannte seitliche Wischbewegung unterdrückt den danach vom Browser simulierten
    // Klick auf das darunterliegende Element (z.B. einen Wochentag) – sonst poppt beim
    // Wischen zusätzlich ungewollt ein Sheet auf.
    suppressClick=true;
    setTimeout(function(){suppressClick=false;},400);
    var rawDx=e.changedTouches[0].clientX-sx;
    var delta=rawDx<0?1:-1,willMove=Math.abs(rawDx)>=50&&!(heuteDate===TODAY&&delta===1);
    if(willMove){
      settle(delta===1?-70:70,0,0.16,function(){
        shiftHeuteDate(delta);
        settle(delta===1?36:-36,0,0);
        void sec.offsetWidth;
        settle(0,1,0.2);
      });
    } else {
      settle(0,1,0.2);
    }
  },{passive:true});
  document.addEventListener("click",function(e){
    if(suppressClick){suppressClick=false;e.stopPropagation();e.preventDefault();}
  },true);
})();


/* ================= Gesamt ================= */
var lastC=null,
 secDirty={koerper:true,werte:true,training:true,entdecken:true}
;

function renderHero(c,pk){
  $("todaydate").textContent=deDate(heuteDate);
  $("fitval").textContent=c.fitness;renderRing(c,pk.fitness);
  var lg=$("ringlegend");
  if(lg&&!lg.childElementCount){
    lg.innerHTML=SKILLDEF.map(function(sk){return '<span><i style="background:'+sk.color+'"></i>'+sk.name+'</span>';}).join("");
  }
  var prev=compute(shiftDays(heuteDate,-14)).fitness,df=c.fitness-prev,tr=$("fittrend");
  tr.className="trend "+(df>1?"up":df<-1?"down":"");
  tr.textContent=(df>0?"▲ +"+df:df<0?"▼ "+Math.abs(df):"▬ stabil")+" in 14 Tagen";
  var below=CORE_MUSCLES.filter(function(id){return (c.ms[id]||0)<corr(muscleById(id)).mev;}).length,note=[];
  note.push(c.trainDays+" von "+Math.round(state.profile.goals.days*c.win/7)+" Trainingstagen");
  if(below)note.push(below+" Muskelgruppen unter Minimum");
  if(pk.fitness-c.fitness>2)note.push(Math.round(pk.fitness-c.fitness)+" unter Bestform");
  $("fitnote").textContent=note.join(" · ");
}

function renderSection(id){
  // Entdecken hängt an keinen Tageswerten (c) – unabhängig davon rendern, damit ein noch
  // fehlendes lastC (z. B. ganz am Anfang) den Übungskatalog nicht blockiert.
  if(id==="tab-entdecken"){renderEntdecken();secDirty.entdecken=false;return;}
  var c=lastC,pk=state.profile.peaks||{};if(!c)return;
  if(id==="tab-koerper"){renderBody(c.ms);renderMuscleList(c.ms);secDirty.koerper=false;}
  else if(id==="tab-werte"){renderSkills(c,pk);renderStrength(c);renderCardio(c);renderFormula(c);renderSpark();renderHistory();renderSettings();secDirty.werte=false;}
  else if(id==="tab-training"){renderRoutines();renderSession();secDirty.training=false;}
}

function renderAll(){
  if(!state.profile)return;
  var c=compute(TODAY),pk=state.profile.peaks||{};
  ["fitness","kraft","konst","deckung","ausdauer","mob"].forEach(function(k){var v=k==="fitness"?c.fitness:c[k];if(!(pk[k]>=v))pk[k]=v;});
  state.profile.peaks=pk;lastC=c;heuteDirty=false;
  // Der Hero-Ring zeigt den Tag, den man sich gerade ansieht (heuteDate) – die Peak-/
  // Bestwert-Fortschreibung oben bleibt aber immer an TODAY gebunden, unabhängig davon, welcher
  // Tag gerade angeschaut wird.
  renderHero(heuteDate===TODAY?c:compute(heuteDate),pk);
  renderWeek();renderToday();renderBanner();
  // "entdecken" hängt an keinen Tageswerten – dessen dirty-Status hier NICHT mit überschreiben,
  // sonst geht das anfängliche entdecken:true beim ersten renderAll() sofort wieder verloren und
  // der Katalog bliebe beim ersten Öffnen leer.
  secDirty.koerper=true;secDirty.werte=true;secDirty.training=true;
  if(tab!=="tab-heute")renderSection(tab);
  saveLocalSoon();
}

// Leichtes Update während des Trainings: nur Trainingskarte + Tagesliste sofort, Rest verzögert
var heuteDirty=false;

function renderLight(){
  renderSession();renderBanner();saveLocalSoon();
  heuteDirty=true;secDirty.koerper=true;secDirty.werte=true;
}


/* ================= Persistenz ================= */
function touch(d){state.dirty[d]=true;queueSave();}

var stTimer=null;

function queueSave(){if(stTimer)clearTimeout(stTimer);stTimer=setTimeout(persist,700);}

function persist(){
  saveLocal();if(!db)return;
  var p=Object.keys(state.dirty);state.dirty={};
  p.forEach(function(d){var b=state.days[d];if(!b)return;
    db.doc("days/"+d).set({sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}).catch(function(){});});
  var r=Object.keys(state.dirtyRoutines);state.dirtyRoutines={};
  r.forEach(function(id){if(state.routines[id])db.doc("routines/"+id).set(state.routines[id]).catch(function(){});else db.doc("routines/"+id).delete().catch(function(){});});
  if(state.profile)db.doc("state/profile").set(state.profile).catch(function(){});
  // Eigene und geaenderte Uebungen gehoeren genauso zum Konto wie Profil, Tage und
  // Routinen - ohne sie waeren sie beim Oeffnen auf einem anderen Geraet oder in einer
  // neuen Fassung der App verloren.
  db.doc("state/exoverrides").set({v:state.exOverrides||{}}).catch(function(){});
  db.doc("state/customex").set({v:state.customEx||[]}).catch(function(){});
}

// Beim Verbinden dieselben beiden Dokumente wieder einlesen. Was lokal schon vorhanden
// ist, hat Vorrang (das ist der zuletzt auf diesem Geraet bearbeitete Stand).
function fw_syncPullExtras(d){
  return d.doc("state/exoverrides").get().then(function(es){
    var v=es&&es.exists?cloneWritable(es.data()):null;v=v&&v.v;
    if(v&&typeof v==="object"){
      state.exOverrides=state.exOverrides||{};
      Object.keys(v).forEach(function(id){if(!state.exOverrides[id])state.exOverrides[id]=v[id];});
    }
    return d.doc("state/customex").get();
  }).then(function(cs){
    var v=cs&&cs.exists?cloneWritable(cs.data()):null;v=v&&v.v;
    if(Array.isArray(v)){
      state.customEx=state.customEx||[];
      var have={};state.customEx.forEach(function(e){if(e&&e.id)have[e.id]=1;});
      v.forEach(function(e){if(e&&e.id&&!have[e.id])state.customEx.push(e);});
    }
    applyCustomEx();applyExOverrides();
    secDirty.entdecken=true;secDirty.training=true;
  }).catch(function(){});
}

var syncState={k:"",t:"nur dieses Gerät"}
;

function setSync(k,t){
  syncState={k:k,t:t};
  $("syncdot").className="dot"+(k?" "+k:"");$("synctxt").textContent=t;
  secDirty.werte=true;
}


/* ================= Onboarding ================= */
var ob=null,
obStep=0,
OB=["Über dich","Hauptübungen","Krafttest","Rhythmus","Startwert"];

function candidatesFor(pat){return EX.filter(function(e){return e.pat===pat&&e.std;});}

function startOnboarding(old){
  ob={age:old?old.age:28,sex:old?old.sex:"m",bw:old?old.bodyweight:78,hr:old?old.restHr:60,main:{},val:{},kg:{},mode:{},
      goals:old?{days:old.goals.days,mob:old.goals.mob,cardio:old.goals.cardio}:{days:4,mob:3,cardio:150},cardioPick:(old&&old.cardioPick)||"run"};
  if(old&&old.mainEx)old.mainEx.forEach(function(id){var e=exById(id);if(e)ob.main[e.pat]=id;});
  else ob.main={push_h:"pushup",push_v:"ohp",pull_v:"pullup",pull_h:"row_bb",squat:"squat",hinge:"deadlift",core:"plank"};
  obStep=0;$("ob").hidden=false;document.body.style.overflow="hidden";drawOb();
}

function mainList(){var o=[];for(var k in ob.main)if(ob.main[k])o.push(ob.main[k]);return o;}

function obProfile(){return {age:ob.age,sex:ob.sex,bodyweight:ob.bw,restHr:ob.hr,cooper:0};}

function baseValue(id){
  var e=exById(id);if(!e)return 0;
  if(e.t==="load"){if(ob.mode[id]==="max")return ob.kg[id]||0;return e1rm(effectiveKg(e,ob.kg[id]),ob.val[id]||0);}
  return (ob.val[id]||0);
}

function drawOb(){
  var w=$("ob-inner");w.innerHTML="";
  w.appendChild(el("div","ob-step","Schritt "+(obStep+1)+" von "+OB.length+" · "+OB[obStep]));
  var prog=el("div","progress");for(var i=0;i<OB.length;i++){var b=el("i");if(i<=obStep)b.className="done";prog.appendChild(b);}

  if(obStep===0){
    w.appendChild(el("h2","","Ein paar Eckdaten"));
    w.appendChild(el("p","intro","Alter, Geschlecht und Körpergewicht bestimmen, woran deine Kraft gemessen wird. Ziele trägst du nirgends ein – die ergeben sich daraus."));
    w.appendChild(prog);
    function qr(lab,sub,node){var r=el("div","qrow"),q=el("div","q");q.innerHTML="<b>"+lab+"</b><span>"+sub+"</span>";var qi=el("div","qin");qi.appendChild(node);r.appendChild(q);r.appendChild(qi);w.appendChild(r);return qi;}
    function ni(v,mn,mx,st,cb){var n=document.createElement("input");n.type="number";n.inputMode="decimal";n.min=mn;n.max=mx;n.step=st;n.value=v;n.oninput=function(){cb(parseFloat(n.value.replace(",","."))||0);};return n;}
    qr("Alter","Kraftstufen und Ausdauer sind altersgewichtet",ni(ob.age,12,99,1,function(v){ob.age=v;})).appendChild(el("span","unit","J."));
    var sx=document.createElement("select");sx.style.width="130px";
    [["m","männlich"],["w","weiblich"]].forEach(function(o){var e=document.createElement("option");e.value=o[0];e.textContent=o[1];sx.appendChild(e);});
    sx.value=ob.sex;sx.onchange=function(){ob.sex=sx.value;};
    qr("Geschlecht","Referenzwerte und Körperfigur",sx);
    qr("Körpergewicht","Bezug für alle Kraftstufen",ni(ob.bw,30,250,0.5,function(v){ob.bw=v;})).appendChild(el("span","unit","kg"));
    qr("Ruhepuls","morgens im Liegen – daraus wird die Ausdauer geschätzt",ni(ob.hr,0,140,1,function(v){ob.hr=v;})).appendChild(el("span","unit","bpm"));
    var h=el("div","hint");h.innerHTML="<b>Keinen Ruhepuls zur Hand?</b> Lass 0 stehen – die Ausdauer zählt dann nur über deine Wochenminuten. Nachtragen geht jederzeit unter „Werte“.";w.appendChild(h);
  }
  if(obStep===1){
    w.appendChild(el("h2","","Deine Hauptübungen"));
    w.appendChild(el("p","intro","Für jedes Bewegungsmuster eine Übung als Startmessung. Nimm die, die du wirklich regelmäßig machst – später zählt ohnehin jede Übung mit Kraftstandard, die du einträgst."));
    w.appendChild(prog);
    PATTERNS.filter(function(p){return p.id!=="cardio";}).forEach(function(pt){
      w.appendChild(el("div","grouplab",pt.name));var g=el("div","pickgrid");
      candidatesFor(pt.id).forEach(function(e){
        var b=el("button","pick");b.type="button";b.innerHTML=e.n+"<small>"+e.e+"</small>";
        b.setAttribute("aria-pressed",String(ob.main[pt.id]===e.id));
        b.onclick=function(){ob.main[pt.id]=(ob.main[pt.id]===e.id?null:e.id);
          Array.prototype.forEach.call(g.children,function(c){c.setAttribute("aria-pressed","false");});
          if(ob.main[pt.id]===e.id)b.setAttribute("aria-pressed","true");};
        g.appendChild(b);});
      w.appendChild(g);});
    w.appendChild(el("div","grouplab","Ausdauer"));var g2=el("div","pickgrid");
    EX.filter(function(e){return e.t==="cardio";}).slice(0,8).forEach(function(e){
      var b=el("button","pick");b.type="button";b.innerHTML=e.n+"<small>"+e.intens+" intensiv</small>";
      b.setAttribute("aria-pressed",String(ob.cardioPick===e.id));
      b.onclick=function(){ob.cardioPick=e.id;Array.prototype.forEach.call(g2.children,function(c){c.setAttribute("aria-pressed","false");});b.setAttribute("aria-pressed","true");};
      g2.appendChild(b);});
    w.appendChild(g2);
  }
  if(obStep===2){
    w.appendChild(el("h2","","Wo stehst du heute?"));
    w.appendChild(el("p","intro","Die wichtigste Angabe der ganzen App. Trag einen schweren Arbeitssatz ein, den du bis nahe ans Limit geführt hast – daraus wird dein Einer-Maximum berechnet. Kennst du dein Einer-Maximum, trag es direkt ein."));
    w.appendChild(prog);
    mainList().forEach(function(id){
      var e=exById(id),pr=obProfile(),card=el("div","card");card.style.marginBottom="10px";
      card.appendChild(el("h3",null,e.n));
      if(e.t==="load"){
        var seg=el("div","segbtn");
        [["set","Arbeitssatz"],["max","1RM bekannt"]].forEach(function(o){
          var bb=el("button",null,o[1]);bb.type="button";bb.setAttribute("aria-selected",String((ob.mode[id]||"set")===o[0]));
          bb.onclick=function(){ob.mode[id]=o[0];var y=window.scrollY;drawOb();window.scrollTo(0,y);};seg.appendChild(bb);});
        card.appendChild(seg);
      }
      var isMax=e.t==="load"&&ob.mode[id]==="max",grid=el("div","grid2");
      function nfield(lab,val,step,cb){var f=el("div","field");f.appendChild(el("label",null,lab));
        var n=document.createElement("input");n.type="number";n.inputMode="decimal";n.step=step;n.min="0";n.value=val||"";n.placeholder="0";
        n.oninput=function(){cb(parseFloat(n.value.replace(",","."))||0);upd();};f.appendChild(n);return f;}
      if(e.t==="load")grid.appendChild(nfield(isMax?"Einer-Maximum (kg)":"Gewicht (kg)",ob.kg[id],"2.5",function(v){ob.kg[id]=v;}));
      if(!isMax)grid.appendChild(nfield(e.t==="sec"?"Sekunden":"Wiederholungen",ob.val[id],"1",function(v){ob.val[id]=v;}));
      card.appendChild(grid);
      var out=el("div","calcout");card.appendChild(out);
      function upd(){
        var v=baseValue(id);
        if(v<=0){out.textContent="Noch nichts eingetragen – die Übung wird erst gewertet, wenn du sie das erste Mal einträgst.";return;}
        var g=grade(e,v,pr),th=thresholds(e,pr);
        var txt=(e.t==="load"&&ob.mode[id]!=="max")?"Einer-Maximum <b>"+(Math.round(v*2)/2)+" kg</b>":"Gewertet als <b>"+fmtVal(v,e.t)+"</b>";
        if(g)txt+="<br>Stufe <b>"+g.name+"</b>"+(g.next?" · nächste ab "+fmtVal(g.next,e.t):" · Höchststufe");
        else if(th)txt+="<br>Stufe „"+LEVELS[0]+"“ ab "+fmtVal(th[0],e.t);
        out.innerHTML=txt;
      }
      upd();w.appendChild(card);
    });
    var h2=el("div","hint");h2.innerHTML="<b>Sätze mit bis zu 15 Wiederholungen</b> lassen sich gut umrechnen. Bei sehr langen Sätzen wird die Schätzung unsicher – dann lieber ein schwereres Gewicht mit weniger Wiederholungen eintragen.";w.appendChild(h2);
  }
  if(obStep===3){
    w.appendChild(el("h2","","Welchen Rhythmus hältst du?"));
    w.appendChild(el("p","intro","Der Maßstab für Konstanz, Mobilität und Ausdauer. Nimm die normale Woche, nicht die Idealwoche – ein Ziel, das du zu 90 % erfüllst, trägt dich; eins, das du zu 40 % erfüllst, zermürbt."));
    w.appendChild(prog);
    [["days","Trainingstage pro Woche","Tage","jeder Tag mit mindestens einem Satz",1,7,"1"],["mob","Mobilität pro Woche","×","Dehnen, Hüfte, Schulter",0,7,"1"],["cardio","Ausdauerminuten pro Woche","min","WHO empfiehlt 150 moderate Minuten",0,600,"15"]].forEach(function(g){
      var r=el("div","qrow"),q=el("div","q");q.innerHTML="<b>"+g[1]+"</b><span>"+g[3]+"</span>";var qi=el("div","qin");
      var n=document.createElement("input");n.type="number";n.inputMode="numeric";n.min=g[4];n.max=g[5];n.step=g[6];n.value=ob.goals[g[0]];n.oninput=function(){ob.goals[g[0]]=parseInt(n.value,10)||0;};
      qi.appendChild(n);qi.appendChild(el("span","unit",g[2]));r.appendChild(q);r.appendChild(qi);w.appendChild(r);});
    var h=el("div","hint");h.innerHTML="<b>Warum rollierend?</b> Alles misst die letzten 30 Tage, die Muskelkarte die letzten 7. Eine gute Woche hebt den Wert, eine faule senkt ihn von allein – ohne Strafpunkte, das Fenster schiebt sich einfach weiter.";w.appendChild(h);
  }
  if(obStep===4){
    var pv=preview();
    w.appendChild(el("h2","","Dein Startwert"));
    w.appendChild(el("p","intro","Deine Testwerte zählen als erster bestätigter Messpunkt. Konstanz, Abdeckung und Ausdauer bauen sich in den nächsten Wochen aus echten Einträgen auf – dass sie jetzt niedrig stehen, ist richtig so."));
    w.appendChild(prog);
    var card=el("div","card"),big=el("div","hero-val");big.innerHTML='<b class="num">'+pv.fitness+'</b><i>/ 100 zum Start</i>';card.appendChild(big);
    SKILLDEF.forEach(function(sd){
      var v=pv[sd.key],m=el("div","meter");m.style.padding="9px 0";m.style.borderBottom="0";
      var top=el("div","meter-top"),nm=el("div","meter-name"),sw=el("span","sw");sw.style.background=sd.color;nm.appendChild(sw);nm.appendChild(document.createTextNode(sd.name));
      var val=el("div","meter-val");val.innerHTML='<span class="num">'+Math.round(v)+'</span>';top.appendChild(nm);top.appendChild(val);
      var bar=el("div","bar"),fi=el("i");fi.style.background=sd.color;fi.style.width=clamp(v,0,100)+"%";bar.appendChild(fi);
      m.appendChild(top);m.appendChild(bar);card.appendChild(m);});
    w.appendChild(card);
    if(pv.grades.length){var c2=el("div","card flush");
      pv.grades.forEach(function(g){var r=el("div","row"),m=el("div","main");m.appendChild(el("b",null,g.name));
        m.appendChild(el("span",null,g.val+(g.next!=="max"?" · nächste Stufe ab "+g.next:"")));r.appendChild(m);
        r.appendChild(el("span","pill g"+clamp(g.idx,0,LEVELS.length-1),g.lvl));c2.appendChild(r);});
      w.appendChild(c2);}
    var h=el("div","hint");h.innerHTML="<b>Konstanz und Abdeckung stehen noch niedrig</b> – sie messen, was du in den letzten Tagen wirklich getan hast. Nach zwei Wochen Eintragen sind sie aussagekräftig.";w.appendChild(h);
  }
  var nav=el("div","ob-nav");
  var back=el("button","btn ghost",obStep===0?"Abbrechen":"Zurück");back.type="button";
  back.onclick=function(){
    try{if(obStep===0){if(state.profile){$("ob").hidden=true;document.body.style.overflow="";}return;}obStep--;drawOb();}
    catch(e){try{console.error("onboarding-back error",e);}catch(e2){}toast("Fehler: "+(e&&e.message?e.message:"unbekannt"));}
  };
  if(obStep===0&&!state.profile)back.style.visibility="hidden";
  var next=el("button","btn primary",obStep===4?"Los geht's":"Weiter");next.type="button";
  next.onclick=function(){
    // Absicherung: falls beim Abschluss (Profil bauen, Sätze eintragen, rendern) irgendwo ein
    // unerwarteter Fehler auftritt, blieb die Oberfläche bisher stumm hängen ("nichts passiert").
    // Jetzt wird der Fehler sichtbar gemacht, statt die Aktion lautlos zu verschlucken.
    try{
      if(obStep===1&&!mainList().length){toast("Wähl mindestens eine Hauptübung.");return;}
      if(obStep===4){finishOnboarding();return;}
      obStep++;drawOb();
    }catch(e){
      try{console.error("onboarding-next error",e);}catch(e2){}
      toast("Fehler beim Fortfahren: "+(e&&e.message?e.message:"unbekannt"));
    }
  };
  nav.appendChild(back);nav.appendChild(next);
  var navWrap=$("ob-navwrap");navWrap.innerHTML="";navWrap.appendChild(nav);
  $("ob-scroll") /* no-op guard if missing */;
  var scroller=document.querySelector(".ob-scroll");if(scroller)scroller.scrollTop=0;
}

function buildProfile(){
  return {version:3,age:ob.age,sex:ob.sex,bodyweight:ob.bw,restHr:ob.hr,cooper:0,mainEx:mainList(),cardioPick:ob.cardioPick,
    goals:{days:ob.goals.days,mob:ob.goals.mob,cardio:ob.goals.cardio},peaks:{},startedAt:TODAY};
}

function preview(){
  var old=state.profile;state.profile=buildProfile();
  var grades=[],sum=0,n=0;
  mainList().forEach(function(id){var e=exById(id),v=baseValue(id),g=v>0?grade(e,v):null;sum+=g?g.score:0;n++;
    if(g)grades.push({name:e.n,val:fmtVal(v,e.t),lvl:g.name,idx:g.idx,next:g.next?fmtVal(g.next,e.t):"max"});});
  var kraft=n?sum/n:0,c=compute(TODAY);state.profile=old;
  c.kraft=kraft;c.fitness=Math.round(W.kraft*kraft+W.konst*c.konst+W.deckung*c.deckung+W.ausdauer*c.ausdauer+W.mob*c.mob);c.grades=grades;return c;
}

function finishOnboarding(){
  state.profile=buildProfile();var d=day(TODAY);
  mainList().forEach(function(id){
    var e=exById(id),v=baseValue(id);if(v<=0)return;
    if(d.sets.some(function(s){return s.ex===id;}))return;
    if(e.t==="load"){if(ob.mode[id]==="max")d.sets.push({ex:id,kg:ob.kg[id]||0,reps:1});else d.sets.push({ex:id,kg:ob.kg[id]||0,reps:ob.val[id]||1});}
    else d.sets.push({ex:id,kg:0,reps:ob.val[id]||0});
  });
  touch(TODAY);$("ob").hidden=true;document.body.style.overflow="";persist();renderAll();
}


/* ================= Start ================= */
function validWorkout(w){
  if(!w||typeof w!=="object"||!Array.isArray(w.exercises)||!w.startedAt)return null;
  if(Date.now()-w.startedAt>12*3600*1000)return null;           // älter als 12 h: vergessen → verwerfen
  if(!w.rest)w.rest={endAt:0,len:90};if(w.pausedMs==null)w.pausedMs=0;if(!w.id)w.id=rid();if(!w.name)w.name="Training";
  // Zwei gueltige Formen: Kraftuebung (sets-Array) und Ausdauer (cardioRec). Frueher wurde
  // hier nur auf sets geprueft - jede Ausdauer-Einheit fiel dadurch beim Laden aus dem
  // Training heraus und war nach einem Neustart weg.
  w.exercises=w.exercises.filter(function(e){
    return e&&exById(e.ex)&&(Array.isArray(e.sets)||(e.cardioRec&&typeof e.cardioRec==="object"));});
  relinkCardio(w);
  return w;
}

loadLocal();
try{var lw=localStorage.getItem("formwert-workout");if(lw)workout=validWorkout(JSON.parse(lw));}
catch(e){workout=null;}

/* Erst starten, wenn das ganze Skript durchgelaufen ist. Die Nachschlagetabellen des
   3D-Modells (FW3D_MESH2FINE, FW3D_FORCE_TRANSPARENT_GROUPS) werden weiter unten
   zugewiesen; wurde hier schon gerendert, liefen die Figuren des Heute-Tabs in ein noch
   undefiniertes Nachschlagewerk und blieben leer. Sichtbar wurde das nur, wenn fuer heute
   bereits Saetze eingetragen waren - deshalb ist es lange nicht aufgefallen. */
// Name der eigenen Uebung -> ID der jetzt eingebauten Entsprechung. Nur exakte Namens-
// treffer, damit nichts Falsches zusammengelegt wird.
var LEGACY_EX_MERGE={"Rotierende Torso Maschine":"torso_rot","Einbeiniges Balancieren":"balance_sl"}
;

function mergeDuplicateCustomEx(){
  var changed=false;
  (state.customEx||[]).slice().forEach(function(ce){
    var newId=LEGACY_EX_MERGE[ce.n];
    if(!newId||ce.id===newId||!exById(newId))return;
    var oldId=ce.id;
    for(var d in state.days){
      var dd=state.days[d],touched=false;
      (dd.sets||[]).forEach(function(s){if(s.ex===oldId){s.ex=newId;touched=true;}});
      (dd.cardio||[]).forEach(function(c){if(c.ex===oldId){c.ex=newId;touched=true;}});
      if(touched){state.dirty[d]=true;changed=true;}
    }
    for(var rid2 in state.routines){
      var r=state.routines[rid2],touched2=false;
      (r.items||[]).forEach(function(it){if(it.ex===oldId){it.ex=newId;touched2=true;}});
      if(touched2){state.dirtyRoutines[rid2]=true;changed=true;}
    }
    if(workout&&Array.isArray(workout.exercises)){
      var touched3=false;
      workout.exercises.forEach(function(we){if(we.ex===oldId){we.ex=newId;touched3=true;}});
      if(touched3){changed=true;saveWorkout();}
    }
    state.customEx=state.customEx.filter(function(x){return x.id!==oldId;});
    for(var i=EX.length-1;i>=0;i--)if(EX[i].id===oldId)EX.splice(i,1);
    if(EX_BY_ID)delete EX_BY_ID[oldId];
    changed=true;
  });
  if(changed)saveLocal();
  return changed;
}

/* Wird genau einmal wirksam: entweder die App zeigen (Profil vorhanden) oder die
   Einrichtung starten (wirklich keins vorhanden - weder hier noch in der Cloud). */
var bootSettled=false;

function fwBootReady(){
  if(bootSettled)return;
  bootSettled=true;
  var bw=$("bootwait");if(bw)bw.hidden=true;
  document.body.style.overflow="";
  if(state.profile&&state.profile.version>=3)renderAll();
  else startOnboarding(state.profile&&state.profile.version>=2?state.profile:null);
}

function fwBoot(){
  selectTab("tab-heute");
  mergeDuplicateCustomEx();
  // Liegt hier schon ein Profil, geht es sofort weiter - kein Warten, kein Flackern.
  if(state.profile&&state.profile.version>=3){fwBootReady();return;}
  // Sonst: nicht sofort nach den Eckdaten fragen. Erst muss feststehen, ob in der
  // Cloud eins liegt. connect() meldet sich; die Notbremse greift, falls gar nichts
  // antwortet (kein Netz, Capability nicht verfuegbar, haengende Verbindung).
  var bw=$("bootwait");if(bw)bw.hidden=false;
  document.body.style.overflow="hidden";
  setTimeout(fwBootReady,12000);
}

setSync("","nur dieses Gerät");

var connectTries=0;

function connect(){
  if(!window.claude||!window.claude.use){setSync("off","nur dieses Gerät");fwBootReady();return;}
  window.claude.use("db").then(function(d){
    if(!d){setSync("off","nur dieses Gerät");fwBootReady();return;}
    db=d;setSync("on","synchronisiert");
    d.doc("state/profile").get().then(function(s){
      var sd=s.exists?cloneWritable(s.data()):null;
      if(sd&&sd.version>=3&&!state.profile)state.profile=sd;
      // Ab hier steht fest, ob es ein gespeichertes Profil gibt - der Startbildschirm
      // darf weg. Tage und Einheiten kommen gleich danach und rendern nochmal.
      fwBootReady();
      return d.collection("days").limit(400).get();
    }).then(function(qs){
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(!b)return;
        if(doc.id===TODAY&&state.days[TODAY]&&(state.days[TODAY].sets||[]).length)return;
        state.days[doc.id]={sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""};});
      return d.doc("state/workout").get().then(function(ws){if(ws.exists&&!workout){workout=validWorkout(cloneWritable(ws.data()));if(!workout)d.doc("state/workout").delete().catch(function(){});else{secDirty.training=true;if(tab==="tab-training")renderSession();renderBanner();}}}).catch(function(){}).then(function(){return fw_syncPullExtras(d);}).then(function(){return d.collection("routines").limit(100).get();});
    }).then(function(qs){
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(b&&b.id)state.routines[b.id]=b;});
      mergeDuplicateCustomEx();
      if(state.profile&&state.profile.version>=3)renderAll();persist();
      connectTries=0;setSync("on","synchronisiert");
    }).catch(function(){
      // Ein einzelner Netzwerk-Hänger (z. B. direkt beim App-Start, wenn parallel schon ein
      // Training gestartet wird) sollte die Sync-Anzeige nicht für immer auf "gestört" einfrieren:
      // ein paar Mal zügig erneut versuchen, danach im Hintergrund weiter alle 30 s, damit sich
      // die Verbindung von selbst erholt, sobald das Netz wieder mitspielt.
      connectTries++;
      if(connectTries<=3)setTimeout(connect,Math.min(1500*connectTries,6000));
      else{setSync("off","Sync gestört – lokal gespeichert");setTimeout(connect,30000);}
      // Nach einem Fehlversuch nicht ewig auf dem Startbildschirm stehen bleiben:
      // beim ersten Versuch noch kurz weiterwarten, danach freigeben.
      if(connectTries>1)fwBootReady();
    });
  }).catch(function(){setSync("off","nur dieses Gerät");fwBootReady();});
}

var FW3D_HTML_B64="__DATEN_ENTFERNT__base64__11174024_ZEICHEN__";

var FW3D_MESH2FINE={"(Abdominal part of pectoralis major muscle)":"abdominal_part_of_pectoralis_major","(Adductor minimus)":"adductor_minimus","(Opponens digiti minimi muscle of foot)":"opponens_digiti_minimi_of_foot","Abductor digiti minimi of foot":"abductor_digiti_minimi_of_foot","Abductor digiti minimi of hand":"abductor_digiti_minimi_of_hand","Abductor hallucis":"abductor_hallucis","Abductor pollicis brevis":"abductor_pollicis_brevis","Abductor pollicis longus":"abductor_pollicis_longus","Acromial part of deltoid muscle":"acromial_part_of_deltoid","Adductor brevis":"adductor_brevis","Adductor longus":"adductor_longus","Adductor magnus":"adductor_magnus","Anconeus muscle":"anconeus","Anterior belly of digastric muscle":"anterior_belly_of_digastric","Ary-epiglottic part of oblique arytenoid muscle":"ary_epiglottic_part_of_oblique_arytenoid","Ascending part of trapezius muscle":"ascending_part_of_trapezius","Brachialis muscle":"brachialis","Brachioradialis muscle":"brachioradialis","Calcaneal tendon":"calcaneal_tendon","Clavicular head of pectoralis major muscle":"clavicular_head_of_pectoralis_major","Clavicular part of deltoid muscle":"clavicular_part_of_deltoid","Coccygeus muscle":"coccygeus","Common tendinous ring":"common_tendinous_ring","Coracobrachialis muscle":"coracobrachialis","Deep head of flexor pollicis brevis":"deep_head_of_flexor_pollicis_brevis","Deep head of pronator teres":"deep_head_of_pronator_teres","Descending part of trapezius muscle":"descending_part_of_trapezius","Diaphragm":"diaphragm","Dorsal interossei muscles of foot":"dorsal_interossei_of_foot","Dorsal interossei muscles of hand":"dorsal_interossei_of_hand","Dorsal parts of lateral intertransversarii lumborum muscles":"dorsal_parts_of_lateral_intertransversarii_lumborum","Extensor carpi radialis brevis":"extensor_carpi_radialis_brevis","Extensor carpi radialis longus":"extensor_carpi_radialis_longus","Extensor digiti minimi":"extensor_digiti_minimi","Extensor digitorum":"extensor_digitorum","Extensor digitorum brevis":"extensor_digitorum_brevis","Extensor digitorum longus":"extensor_digitorum_longus","Extensor hallucis brevis":"extensor_hallucis_brevis","Extensor hallucis longus":"extensor_hallucis_longus","Extensor indicis":"extensor_indicis","Extensor pollicis brevis":"extensor_pollicis_brevis","Extensor pollicis longus":"extensor_pollicis_longus","External abdominal oblique muscle":"external_abdominal_oblique","External intercostal muscles":"external_intercostal","External part of thyro-arytenoid muscle":"external_part_of_thyro_arytenoid","Fibularis brevis muscle":"fibularis_brevis","Fibularis longus muscle":"fibularis_longus","Fibularis tertius muscle":"fibularis_tertius","Flexor carpi radialis":"flexor_carpi_radialis","Flexor digiti minimi of foot":"flexor_digiti_minimi_of_foot","Flexor digiti minimi of hand":"flexor_digiti_minimi_of_hand","Flexor digitorum brevis":"flexor_digitorum_brevis","Flexor digitorum longus":"flexor_digitorum_longus","Flexor digitorum profundus":"flexor_digitorum_profundus","Flexor hallucis longus":"flexor_hallucis_longus","Flexor pollicis longus":"flexor_pollicis_longus","Genioglossus muscle":"genioglossus","Geniohyoid muscle":"geniohyoid","Gluteus maximus muscle":"gluteus_maximus","Gluteus medius muscle":"gluteus_medius","Gluteus minimus muscle":"gluteus_minimus","Gracilis muscle":"gracilis","Humeral head of extensor carpi ulnaris":"humeral_head_of_extensor_carpi_ulnaris","Humeral head of flexor carpi ulnaris":"humeral_head_of_flexor_carpi_ulnaris","Humero-ulnar head of flexor digitorum superficialis":"humero_ulnar_head_of_flexor_digitorum_superficialis","Hyoglossus muscle":"hyoglossus","Iliacus muscle":"iliacus","Iliococcygeus muscle":"iliococcygeus","Iliocostalis colli muscle":"iliocostalis_colli","Iliocostalis lumborum muscle":"iliocostalis_lumborum","Iliocostalis thoracis muscle":"iliocostalis_thoracis","Iliopectineal arch":"iliopectineal_arch","Iliotibial tract":"iliotibial_tract","Inferior gemellus muscle":"inferior_gemellus","Inferior pharyngeal constrictor":"inferior_pharyngeal_constrictor","Inferior tarsus":"inferior_tarsus","Infraspinatus muscle":"infraspinatus","Innermost intercostal muscles":"innermost_intercostal","Intermediate tendon of digastric muscle":"intermediate_tendon_of_digastric","Internal abdominal oblique muscle":"internal_abdominal_oblique","Internal intercostal muscles":"internal_intercostal","Lateral crico-arytenoid muscle":"lateral_crico_arytenoid","Lateral head of flexor hallucis brevis":"lateral_head_of_flexor_hallucis_brevis","Lateral head of gastrocnemius":"lateral_head_of_gastrocnemius","Lateral head of triceps brachii":"lateral_head_of_triceps_brachii","Latissimus dorsi muscle":"latissimus_dorsi","Levator scapulae":"levator_scapulae","Levatores breves costarum":"levatores_breves_costarum","Levatores longi costarum":"levatores_longi_costarum","Linea alba":"linea_alba","Long head of biceps brachii":"long_head_of_biceps_brachii","Long head of biceps femoris":"long_head_of_biceps_femoris","Long head of triceps brachii":"long_head_of_triceps_brachii","Longissimus capitis muscle":"longissimus_capitis","Longissimus colli muscle":"longissimus_colli","Longissimus thoracis muscle":"longissimus_thoracis","Longus capitis muscle":"longus_capitis","Longus colli muscle":"longus_colli","Lumbrical muscles of foot":"lumbrical_of_foot","Lumbrical muscles of hand":"lumbrical_of_hand","Medial head of flexor hallucis brevis":"medial_head_of_flexor_hallucis_brevis","Medial head of gastrocnemius":"medial_head_of_gastrocnemius","Medial head of triceps brachii":"medial_head_of_triceps_brachii","Middle pharyngeal constrictor":"middle_pharyngeal_constrictor","Multifidus colli muscle":"multifidus_colli","Multifidus lumborum muscle":"multifidus_lumborum","Multifidus thoracis muscle":"multifidus_thoracis","Mylohyoid muscle":"mylohyoid","Oblique head of adductor hallucis":"oblique_head_of_adductor_hallucis","Oblique head of adductor pollicis":"oblique_head_of_adductor_pollicis","Oblique part of cricothyroid muscle":"oblique_part_of_cricothyroid","Obliquus inferior capitis muscle":"obliquus_inferior_capitis","Obliquus superior capitis muscle":"obliquus_superior_capitis","Obturator externus":"obturator_externus","Obturator internus":"obturator_internus","Omohyoid muscle":"omohyoid","Opponens digiti minimi muscle of hand":"opponens_digiti_minimi_of_hand","Opponens pollicis muscle":"opponens_pollicis","Palatopharyngeus muscle":"palatopharyngeus","Palmar interossei muscles":"palmar_interossei","Palmaris longus muscle":"palmaris_longus","Pectineus muscle":"pectineus","Pectoralis minor muscle":"pectoralis_minor","Piriformis muscle":"piriformis","Plantar interossei muscles":"plantar_interossei","Plantaris muscle":"plantaris","Popliteus muscle":"popliteus","Posterior belly of digastric muscle":"posterior_belly_of_digastric","Posterior crico-arytenoid muscle":"posterior_crico_arytenoid","Pronator quadratus":"pronator_quadratus","Psoas major":"psoas_major","Pyramidalis muscle":"pyramidalis","Quadratus femoris muscle":"quadratus_femoris","Quadratus lumborum muscle":"quadratus_lumborum","Quadratus plantae muscle":"quadratus_plantae","Radial head of flexor digitorum superficialis":"radial_head_of_flexor_digitorum_superficialis","Rectus abdominis muscle":"rectus_abdominis","Rectus anterior capitis muscle":"rectus_anterior_capitis","Rectus femoris muscle":"rectus_femoris","Rectus lateralis capitis muscle":"rectus_lateralis_capitis","Rectus posterior major capitis muscle":"rectus_posterior_major_capitis","Rectus posterior minor capitis muscle":"rectus_posterior_minor_capitis","Rhomboid major muscle":"rhomboid_major","Rhomboid minor muscle":"rhomboid_minor","Rotatores":"rotatores","Sartorius muscle":"sartorius","Scalenus anterior muscle":"scalenus_anterior","Scalenus medius muscle":"scalenus_medius","Scalenus posterior muscle":"scalenus_posterior","Scapular spinal part of deltoid muscle":"scapular_spinal_part_of_deltoid","Semimembranosus muscle":"semimembranosus","Semitendinosus muscle":"semitendinosus","Serratus anterior muscle":"serratus_anterior","Serratus posterior inferior muscle":"serratus_posterior_inferior","Serratus posterior superior muscle":"serratus_posterior_superior","Short head of biceps brachii":"short_head_of_biceps_brachii","Short head of biceps femoris":"short_head_of_biceps_femoris","Soleus muscle":"soleus","Splenius capitis muscle":"splenius_capitis","Splenius colli muscle":"splenius_colli","Sternocleidomastoid muscle":"sternocleidomastoid","Sternocostal head of pectoralis major muscle":"sternocostal_head_of_pectoralis_major","Sternohyoid muscle":"sternohyoid","Sternothyroid muscle":"sternothyroid","Straight part of cricothyroid muscle":"straight_part_of_cricothyroid","Stylohyoid muscle":"stylohyoid","Stylopharyngeus muscle":"stylopharyngeus","Subclavius muscle":"subclavius","Subscapularis muscle":"subscapularis","Superficial head of flexor pollicis brevis":"superficial_head_of_flexor_pollicis_brevis","Superficial head of pronator teres":"superficial_head_of_pronator_teres","Superior gemellus muscle":"superior_gemellus","Superior pharyngeal constrictor":"superior_pharyngeal_constrictor","Superior tarsus":"superior_tarsus","Supraspinatus muscle":"supraspinatus","Tendinous arch of levator ani":"tendinous_arch_of_levator_ani","Tendon of extensor digitorum longus":"tendon_of_extensor_digitorum_longus","Teres major muscle":"teres_major","Teres minor muscle":"teres_minor","Thyro-epiglottic part of thyro-arytenoid muscle":"thyro_epiglottic_part_of_thyro_arytenoid","Thyrohyoid muscle":"thyrohyoid","Tibialis anterior muscle":"tibialis_anterior","Tibialis posterior muscle":"tibialis_posterior","Transverse arytenoid muscle":"transverse_arytenoid","Transverse head of adductor hallucis":"transverse_head_of_adductor_hallucis","Transverse head of adductor pollicis":"transverse_head_of_adductor_pollicis","Transverse part of trapezius muscle":"transverse_part_of_trapezius","Transversus abdominis muscle":"transversus_abdominis","Transversus thoracis muscle":"transversus_thoracis","Trochlea of superior oblique muscle":"trochlea_of_superior_oblique","Ulnar head of extensor carpi ulnaris":"ulnar_head_of_extensor_carpi_ulnaris","Ulnar head of flexor carpi ulnaris":"ulnar_head_of_flexor_carpi_ulnaris","Vastus intermedius muscle":"vastus_intermedius","Vastus lateralis muscle":"vastus_lateralis","Vastus medialis muscle":"vastus_medialis","Ventral parts of lateral intertransversarii lumborum muscles":"ventral_parts_of_lateral_intertransversarii_lumborum",}
;

var FW3D_MESH2GROUP={}
;
  // alle 233 Muskeln haben jetzt eine eigene FINE/FW3D_MESH2FINE-Zuordnung, daher kein Gruppen-Fallback mehr noetig.
var FW3D_DUAL={}
;
