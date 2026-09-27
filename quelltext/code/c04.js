/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: renderSessionInner() bis persist()
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
    // Nur mit Ausdauer-Datensatz als Ausdauer zeigen: Ein gespeichertes Training kann aus
    // derselben Zeit noch Sätze für eine Ausdauer-Übung enthalten.
    var isCardio=ex.t==="cardio"&&!!we.cardioRec;
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
        rt.items=rtItems;state.routines[rt.id]=rt;markRoutineDirty(rt.id);persist();
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
      state.routines[ed.id]=ed;markRoutineDirty(ed.id);closeSheet();persist();renderAll();};
    b.appendChild(save);
    if(id){var del2=el("button","btn ghost block","Einheit löschen");del2.style.marginTop="8px";
      del2.onclick=function(){closeSheet();setTimeout(function(){askConfirm("Einheit löschen?",ed.name,"Löschen",function(){delete state.routines[id];markRoutineDirty(id);persist();renderAll();});},180);};
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
var UI_EN={"Heute": "Today", "Entdecken": "Explore", "Training": "Training", "Körper": "Body", "Werte": "Stats", "Alle": "All", "Alle Übungen": "All exercises", "Alter": "Age", "Anmeldung & Sync": "Sign-in & sync", "Arme": "Arms", "Beine": "Legs", "Assessment neu machen": "Redo assessment", "Ausdauer": "Endurance", "Ausdauerminuten pro Woche": "Cardio minutes per week", "Backup einspielen": "Restore backup", "Backup speichern": "Save backup", "Beenden": "Finish", "Belastungsäquivalent": "Load equivalent", "Cooper-Test": "Cooper test", "Datei/Text": "File/text", "Deutsch": "German", "Englisch": "English", "Eigene Einheit zusammenstellen": "Build your own session", "Einstellungen": "Settings", "Eintragen": "Log", "Erholung": "Recovery", "Geschlecht": "Sex", "Grenze": "Limit", "Konstanz": "Consistency", "Konto & Daten": "Account & data", "Korridor für dich": "Your range", "Korridor · Sätze pro Woche": "Range · sets per week", "Kraftstufen": "Strength levels", "Körperdaten": "Body data", "Körpergewicht": "Body weight", "Körperillustration:": "Body illustration:", "Letzte Tage": "Recent days", "Maximalkraft": "Max strength", "Meine Einheiten": "My sessions", "Minimum": "Minimum", "Optimum": "Optimum", "Minuten pro Woche": "Minutes per week", "Mobilität": "Mobility", "Mobilität pro Woche": "Mobility sessions per week", "Muskelabdeckung": "Muscle coverage", "Muskelgruppen": "Muscle groups", "Nach Körperregion": "By body region", "Nach Übungen suchen…": "Search exercises…", "Neue Einheit": "New session", "Neues Training starten": "Start new workout", "Notiz": "Note", "Rechenweg": "How it is calculated", "Ruhepuls": "Resting heart rate", "Sprache": "Language", "Standard": "Standard", "Teilwerte": "Sub-scores", "Verlauf": "History", "Was noch mehr bringt": "What more would add", "Weiter": "Continue", "Wochenziele": "Weekly goals", "Woche vor": "Next week", "Woche zurück": "Previous week", "Zurück": "Back", "Ziele, Körperdaten, Sprache, Konto": "Goals, body data, language, account", "Trainingstage pro Woche": "Training days per week", "Tipp eine Muskelgruppe an.": "Tap a muscle group.", "Tipp einen Muskel an – oder wähl oben eine Region.": "Tap a muscle — or pick a region above.", "Tipp einen Muskel an – oder oben eine Region wie „Brust“, dann werden alle zugehörigen Muskeln markiert.": "Tap a muscle — or a region above such as “Chest” to highlight every muscle in it.", "Ziehen = drehen · Tippen = Muskel auswählen": "Drag = rotate · Tap = select muscle", "Die Richtwerte sind Gruppenmittelwerte mit großer Streuung. Wenn du für diesen Muskel erkennbar mehr oder weniger brauchst, verschieb den Korridor hier.": "These guide values are group averages with wide spread. If this muscle clearly needs more or less for you, shift the range here.", "Die Namen von Regionen, Muskeln und Übungen wechseln mit. Erklärtexte sind noch nicht vollständig übersetzt.": "Region, muscle and exercise names switch along. Explanatory texts are not fully translated yet.", "3D-Modell wird geladen…": "Loading 3D model…", "3D-Modell konnte nicht geladen werden.": "3D model could not be loaded.", "deutlich mehr": "much more", "deutlich weniger": "much less", "mehr": "more", "weniger": "less", "im Korridor": "in range", "zu wenig": "too little", "über Limit": "over limit", "männlich": "male", "weiblich": "female", "nicht gemacht": "not done", "nichts": "none", "noch nichts notiert": "nothing noted yet", "noch offen": "still open", "offen": "open", "nur dieses Gerät": "this device only", "verfallen": "expired", "unter F": "below F", "+ Erstellen": "+ Create", ", MIT-Lizenz.": ", MIT licence.", "Mo": "Mon", "Di": "Tue", "Mi": "Wed", "Do": "Thu", "Fr": "Fri", "Sa": "Sat", "So": "Sun", "Knorrenmuskel": "Anconeus", "Beanspruchte Muskeln": "Muscles worked", "Bewegungsablauf in 3D": "Movement in 3D", "3D-Modell wird geladen …": "Loading 3D model …", "Rechte Körperhälfte: Arm, Schulter, Brust und Rücken – Muskeln in den Farben von „Beanspruchte Muskeln“.": "Right side of the body: arm, shoulder, chest and back – muscles coloured as in “Muscles worked”.", "Die 3D-Animation braucht einen neueren Browser.": "The 3D animation needs a newer browser.", "3D-Animation konnte nicht geladen werden.": "The 3D animation could not be loaded.", "Reihenfolge geändert": "Order changed", "Karte gedrückt halten und zur Seite schieben, um die Reihenfolge zu ändern.": "Press and hold a card, then slide it sideways to change the order.", "Stärkt zusätzlich": "Also strengthens", "Wird gedehnt": "Stretched", "Wird bewegt": "Mobilised", "Statisch": "Static", "Dynamisch": "Dynamic", "Alles": "All", "Mobilität · Statisch": "Mobility · Static", "Mobilität · Dynamisch": "Mobility · Dynamic",
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


/* Nachtrag zur englischen Oberfläche. Ein Rundgang durch alle Tabs und Dialoge in englischer
   Sprache hat diese Texte noch deutsch gezeigt. Eigener Block statt Einträgen mitten im
   Wörterbuch oben, damit er als Ganzes nachvollziehbar bleibt. Muster, die auf den deutschen
   Rohtext passen müssen, kommen VOR die vorhandenen – deren allgemeine Regeln machen z. B.
   "Tage" sonst schon vorher zu "days" oder "3 Sätzen" zu "3 setsn". Allgemeine Muster kommen
   hinten dran, damit die spezielleren zuerst greifen. Vorhandene Einträge bleiben
   unangetastet, und keine englische Übersetzung ist doppelt vergeben – sonst fiele der Rückweg
   ins Deutsche (UI_DE) für feste Beschriftungen weg. */
(function(){
  var add={"+ Satz": "+ Set", "+ Übung hinzufügen": "+ Add exercise", "/ 100 zum Start": "/ 100 to start", "0 = bis zum Muskelversagen. Ohne Angabe zählt der Satz voll; ab 3 in Reserve zählt er anteilig weniger.": "0 = to failure. Without a value the set counts in full; from 3 in reserve it counts proportionally less.", "1. Formwert im Handy-Browser öffnen (gleiches Konto).\n2. Teilen-Symbol → „Zum Home-Bildschirm“.\n3. Einmal anmelden – danach bleibst du in dieser Kachel angemeldet und startest ohne Umweg.": "1. Open Formwert in your phone's browser (same account).\n2. Share icon → “Add to Home Screen”.\n3. Sign in once – after that you stay signed in on this tile and start right away.", "100 % = die beste verfügbare Übung für diesen Muskel. Ein Satz zählt anteilig auf dein Wochenvolumen: 60 % sind 0,6 Sätze. Planungswerte auf Basis der EMG-Literatur – keine Messwerte.": "100 % = the best available exercise for this muscle. A set counts proportionally toward your weekly volume: 60 % is 0.6 sets. Planning values based on EMG literature – not measurements.", "100 % = die stärkste Übung dafür im ganzen Katalog. Wird nichts geändert, zählt Primär 100 %, Sekundär 50 %.": "100 % = the strongest exercise for it in the whole catalog. If nothing is changed, primary counts 100 %, secondary 50 %.", "Achillessehne": "Achilles tendon", "Adduktorensehnen": "Adductor tendons", "Aktivität": "Activity", "Alle Einträge dieses Tages löschen": "Delete all entries for this day", "Alles misst die letzten 30 Tage, die Muskelkarte die letzten 7. Eine gute Woche hebt den Wert, eine faule senkt ihn von allein – ohne Strafpunkte, das Fenster schiebt sich einfach weiter.": "Everything measures the last 30 days, the muscle map the last 7. A good week raises the score, a lazy one lowers it on its own – no penalty points, the window simply moves on.", "Alter, Geschlecht und Körpergewicht bestimmen, woran deine Kraft gemessen wird. Ziele trägst du nirgends ein – die ergeben sich daraus.": "Age, sex and body weight determine what your strength is measured against. You don't enter goals anywhere – they follow from this.", "Andere Übung": "Other exercise", "Ansatz an der Schambeinregion. Häufige Beschwerdestelle bei Sportarten mit schnellen Richtungswechseln - gezielte Kräftigung beugt vor.": "Attach at the pubic region. A common trouble spot in sports with quick changes of direction - targeted strengthening helps prevent it.", "Art": "Type", "Ausdauer (Minuten)": "Cardio (minutes)", "Ausdauer eintragen": "Log cardio", "Ausdauerleistung und Erholungsfähigkeit. Zeigt sich im Alltag oft früher als Kraftzuwachs.": "Endurance performance and ability to recover. In everyday life it often shows sooner than strength gains.", "Ausführung": "Execution", "Backup nur lokal – Übertragung wird wiederholt": "Backup only local – upload will be retried", "Backup wird übertragen": "Uploading backup", "Bauchroller": "Ab wheel", "Bearbeiten": "Edit", "Bei Kurzhanteln meist „Pro Seite“ (Gewicht je Hantel) – die Gesamtlast ist dann das Doppelte. Bei Maschine oder Langhantel „Gesamtgewicht“.": "With dumbbells usually “Per side” (weight per dumbbell) – the total load is then double. With a machine or barbell “Total weight”.", "Beidseitig": "Both sides", "Bereits abgehakte Sätze bleiben erhalten – verschoben wird nur die Reihenfolge, in der die Übungen angezeigt werden.": "Sets already checked off are kept – only the order in which the exercises are shown changes.", "Beweglichkeit": "Flexibility", "Beweglichkeit und Stabilität hier entscheiden mit, wie tief du hocken kannst und wie sicher du landest.": "Mobility and stability here help decide how deep you can squat and how safely you land.", "Bewegungsmuster": "Movement pattern", "Bezug für alle Kraftstufen": "Basis for all strength levels", "Brust": "Chest", "Das beweglichste große Gelenk. Seitliche Stabilität hier bestimmt, ob das Knie bei Belastung nach innen fällt.": "The most mobile large joint. Lateral stability here decides whether the knee caves in under load.", "Datei wählen": "Choose file", "Dehnen, Hüfte, Schulter": "Stretching, hips, shoulders", "Dehnen, Hüfte, Schulter für heute": "Stretching, hips, shoulders for today", "Deine Hauptübung für Rücken und Hüfte": "Your main exercise for back and hips", "Deine Hauptübung für den Rumpf": "Your main exercise for the core", "Deine Hauptübung für die Oberschenkel": "Your main exercise for the thighs", "Deine Hauptübung fürs Drücken über Kopf": "Your main exercise for overhead pushing", "Deine Hauptübung fürs Rudern": "Your main exercise for rowing", "Deine Hauptübung fürs Ziehen von oben": "Your main exercise for pulling from above", "Deine Hauptübung fürs waagerechte Drücken": "Your main exercise for horizontal pushing", "Deine Hauptübungen": "Your main exercises", "Deine Testwerte zählen als erster bestätigter Messpunkt. Konstanz, Abdeckung und Ausdauer bauen sich in den nächsten Wochen aus echten Einträgen auf – dass sie jetzt niedrig stehen, ist richtig so.": "Your test values count as the first confirmed data point. Consistency, coverage and endurance build up over the next weeks from real entries – that they are low right now is how it should be.", "Deine bevorzugte Ausdauerform": "Your preferred type of cardio", "Der Maßstab für Konstanz, Mobilität und Ausdauer. Nimm die normale Woche, nicht die Idealwoche – ein Ziel, das du zu 90 % erfüllst, trägt dich; eins, das du zu 40 % erfüllst, zermürbt.": "The yardstick for consistency, mobility and endurance. Take your normal week, not your ideal week – a goal you meet 90 % of the time carries you; one you meet 40 % of the time wears you down.", "Die Fähigkeit, den Oberkörper unter Last stabil zu halten. Sie begrenzt bei vielen Übungen, wie viel Gewicht sinnvoll bewegt werden kann.": "The ability to keep the upper body stable under load. In many exercises it limits how much weight can sensibly be moved.", "Die kräftigste Sehne des Körpers. Sie passt sich an Zug an, aber deutlich langsamer als der Muskel - nach langer Pause ist der Sprung in die alte Belastung der häufigste Auslöser für Beschwerden.": "The strongest tendon in the body. It adapts to tension, but much more slowly than the muscle - after a long break, jumping straight back to the old load is the most common cause of trouble.", "Die wichtigste Angabe der ganzen App. Trag einen schweren Arbeitssatz ein, den du bis nahe ans Limit geführt hast – daraus wird dein Einer-Maximum berechnet. Kennst du dein Einer-Maximum, trag es direkt ein.": "The most important input in the whole app. Enter a heavy working set that you took close to your limit – your one-rep max is calculated from it. If you know your one-rep max, enter it directly.", "Drücken waagerecht": "Horizontal push", "Drücken über Kopf": "Overhead push", "Ein Backup ist unabhängig vom Konto: eine Datei mit allem, was drin ist. Nimm sie, bevor du etwas Großes änderst.": "A backup is independent of your account: one file with everything in it. Make one before you change anything big.", "Einbeinige und freie Übungen fordern laufende Korrekturen aus Fuß, Hüfte und Rumpf - das trainiert man nicht an der Maschine.": "Single-leg and free exercises demand constant corrections from foot, hip and core - you don't train that on a machine.", "Einer-Maximum (kg)": "One-rep max (kg)", "Einer-Maximum pro Seite (kg)": "One-rep max per side (kg)", "Einheit bearbeiten": "Edit session", "Einheit löschen": "Delete session", "Einseitig (L/R getrennt)": "One side (L/R separately)", "Einzelnen Satz eintragen": "Log a single set", "Erst oben Muskeln auswählen.": "Select muscles above first.", "Faszie": "Fascia", "Fähigkeit": "Ability", "Für dein Alter": "For your age", "Für jedes Bewegungsmuster eine Übung als Startmessung. Nimm die, die du wirklich regelmäßig machst – später zählt ohnehin jede Übung mit Kraftstandard, die du einträgst.": "One exercise per movement pattern as a starting measurement. Pick the ones you really do regularly – later, every exercise with a strength standard that you log counts anyway.", "Gelenk": "Joint", "Gerade keine Verbindung zum Konto – alles wird lokal in diesem Browser gespeichert und beim nächsten Verbinden hochgeladen.": "No connection to your account right now – everything is saved locally in this browser and uploaded the next time you connect.", "Gesamtgewicht": "Total weight", "Geschätztes Einer-Maximum": "Estimated one-rep max", "Gewicht (kg)": "Weight (kg)", "Gewicht pro Seite (kg)": "Weight per side (kg)", "Gewicht zählt als": "Weight counts as", "Gewicht × Wdh": "Weight × reps", "Gewichtete Sätze: je Satz zählt ein Muskel mit dem Anteil, den diese Übung für ihn leistet (in der Übung als Prozent angegeben, 100 % = beste verfügbare Übung), mal dem Faktor für die Wiederholungen in Reserve. Balken und Farbe zeigen den Anteil am stärkst beanspruchten Muskel DIESER Einheit – die Figur oben ist genauso eingefärbt. Sie sagen also, worauf die Einheit zielt, nicht wie viel der Wochenmenge sie deckt; das steht als Satzzahl daneben.": "Weighted sets: per set, a muscle counts with the share this exercise contributes to it (given as a percentage on the exercise, 100 % = best available exercise), times the factor for reps in reserve. Bar and color show the share relative to the most-worked muscle of THIS session – the figure above is colored the same way. So they show what the session targets, not how much of the weekly amount it covers; that is the set count next to it.", "Gleichgewicht": "Balance", "Griffkraft": "Grip strength", "Große Bindegewebsplatte im unteren Rücken, an der Gesäß, Latissimus und Bauchmuskeln zusammenlaufen. Sie überträgt Kraft zwischen Ober- und Unterkörper.": "Large sheet of connective tissue in the lower back where glutes, lats and abs meet. It transfers force between upper and lower body.", "Handgelenk": "Wrist", "Hauptübungen": "Main exercises", "Herz-Kreislauf": "Cardiovascular fitness", "Höchstes Gewicht": "Heaviest weight", "Hüftgelenk": "Hip joint", "Hüftstreckung": "Hip hinge", "Ja, anpassen": "Yes, update", "Kabelzug": "Cable", "Keine Sätze.": "No sets.", "Keinen Ruhepuls zur Hand?": "No resting heart rate at hand?", "Klimmzugstange": "Pull-up bar", "Kniebeuge-Muster": "Squat pattern", "Kniegelenk": "Knee joint", "Knochen": "Bone", "Knochen bauen auf Druck und Zug auf. Schweres Heben und Belastung mit dem eigenen Körpergewicht wirken dabei deutlich besser als gelenkschonende Ausdauerformen.": "Bones build up from compression and tension. Heavy lifting and bodyweight loading work much better for this than joint-friendly forms of cardio.", "Knochendichte": "Bone density", "Konstanz und Abdeckung stehen noch niedrig": "Consistency and coverage are still low", "Kopfgeschirr": "Head harness", "Kraftstufen und Ausdauer sind altersgewichtet": "Strength levels and endurance are age-adjusted", "Krafttest": "Strength test", "Kräftige Muskeln rundherum halten das Gelenk zusammen - das Training wirkt mehr über die Führung als über das Gelenk selbst.": "Strong muscles all around hold the joint together - training works more through that guidance than through the joint itself.", "Kurzhantel": "Dumbbell", "Lange Bizepssehne": "Long biceps tendon", "Langhantel": "Barbell", "Lass 0 stehen – die Ausdauer zählt dann nur über deine Wochenminuten. Nachtragen geht jederzeit unter „Werte“.": "Leave it at 0 – endurance then only counts your weekly minutes. You can add it any time under “Stats”.", "Laufen, Rad, Rudern – zählt auf die Wochenminuten": "Running, cycling, rowing – counts toward your weekly minutes", "Leeres Training – Übungen fügst du unterwegs hinzu": "Empty workout – add exercises as you go", "Läuft durch das Schultergelenk hindurch. Sie wird bei tiefen Stützpositionen mit gestreckter Schulter stark auf Zug genommen.": "Runs through the shoulder joint. It is put under strong tension in deep support positions with the shoulder extended.", "Maschine": "Machine", "Meiste Wiederholungen": "Most reps", "Minuten": "Minutes", "Mobilität zurücknehmen": "Undo mobility", "Name des Trainings": "Workout name", "Nein, so lassen": "No, keep it", "Nicht ein Gelenk, sondern viele. Sie hält Last aus, wenn die Rumpfmuskulatur sie in Position hält - genau das wird hier mittrainiert.": "Not one joint but many. It handles load when the core muscles hold it in position - exactly what is trained along with it here.", "Noch kein Satz abgehakt. Beenden verwirft das Training.": "No set checked off yet. Finishing discards the workout.", "Noch kein Wert in den letzten 90 Tagen. Trag bei einer dieser Übungen einen schweren Satz ein, dann bekommt der Bereich eine Stufe.": "No value in the last 90 days yet. Log a heavy set for one of these exercises and the area gets a level.", "Noch keine Sätze für diese Übung eingetragen.": "No sets logged for this exercise yet.", "Noch nicht gemessen": "Not measured yet", "Noch nichts eingetragen – die Übung wird erst gewertet, wenn du sie das erste Mal einträgst.": "Nothing entered yet – the exercise is only rated once you log it for the first time.", "Notiz zum Tag": "Note for the day", "Nur auf diesem Gerät": "Only on this device", "Patellasehne": "Patellar tendon", "Pausenzeit ändern": "Change rest time", "Plantarfaszie": "Plantar fascia", "Primärmuskeln zählen 1,0 Sätze, Sekundärmuskeln 0,5. Brust (oben/mitte/unten) und Schulter (vorn/seitlich/hinten) werden einzeln erfasst und auf der Figur entlang ihres Faserverlaufs getrennt dargestellt – diese Liste zeigt jede Gruppe mit ihren Marken für Minimum, Optimum und Erholungsgrenze.": "Primary muscles count 1.0 sets, secondary muscles 0.5. Chest (upper/middle/lower) and shoulder (front/side/rear) are tracked separately and shown split along their fiber direction on the figure – this list shows each group with its marks for minimum, optimum and recovery limit.", "Primärmuskeln zählen mit vollem, Sekundärmuskeln mit halbem Satz fürs Wochenvolumen, sofern der Anteil oben nicht geändert wurde.": "Primary muscles count as a full set and secondary muscles as half a set toward weekly volume, unless the share above was changed.", "Pro Seite": "Per side", "Rad": "Bike", "Referenzwerte und Körperfigur": "Reference values and body figure", "Reihenfolge der Übungen ändern": "Change exercise order", "Reihenfolge ändern": "Change order", "Reiskübel": "Rice bucket", "Rhythmus": "Rhythm", "Rotatorenmanschette": "Rotator cuff", "Rumpf": "Core", "Rumpfspannung": "Core stability", "Rücken": "Back", "Rückenfaszie": "Thoracolumbar fascia", "Satz": "Set", "Satz abhaken": "Check off set", "Satz bearbeiten": "Edit set", "Satz löschen": "Delete set", "Satz zurücknehmen": "Undo set", "Schultergelenk": "Shoulder joint", "Sehne": "Tendon", "Sehnenansätze am Ellbogen": "Elbow tendon attachments", "Sehnenplatte an der Oberschenkelaußenseite, vom Becken bis unters Knie. Sie wird nicht selbst trainiert, sondern über die Muskeln, die an ihr ziehen - Gesäß und Hüftabspreizer. Schwache Hüftstabilität zeigt sich häufig hier.": "Tendon sheet on the outside of the thigh, from the pelvis to below the knee. It isn't trained itself but through the muscles that pull on it - glutes and hip abductors. Weak hip stability often shows up here.", "Sekunden": "Seconds", "Sekunden halten": "Hold for seconds", "Spannt das Längsgewölbe des Fußes und federt bei jedem Schritt.": "Tensions the longitudinal arch of the foot and cushions every step.", "Speichern & beenden": "Save & finish", "Springseil": "Jump rope", "Sprunggelenk": "Ankle", "Startwert": "Starting score", "Stufe": "Level", "Sync gestört – lokal gespeichert": "Sync problem – saved locally", "Sätze mit bis zu 15 Wiederholungen": "Sets of up to 15 reps", "Text einspielen": "Import text", "Tipp auf das Plus für die nächste Übung.": "Tap the plus for the next exercise.", "Tractus iliotibialis": "Iliotibial band", "Training beenden": "Finish workout", "Training löschen": "Delete workout", "Ursprung der Unterarmmuskeln an den Knochenvorsprüngen innen und außen - die Stellen, an denen Tennis- und Golferellenbogen entstehen. Sie profitieren von langsamen, kontrollierten Wiederholungen.": "Origin of the forearm muscles on the bony points inside and outside - where tennis and golfer's elbow develop. They benefit from slow, controlled reps.", "VO2max geschätzt": "Estimated VO2max", "Verbindet Kniescheibe und Schienbein. Regelmäßige Beugung unter Last macht sie belastbarer; plötzlich viel Sprung- und Landearbeit reizt sie.": "Connects the kneecap and shin. Regular bending under load makes it more resilient; a sudden lot of jumping and landing irritates it.", "Verwerfen": "Discard", "Viel Bewegungsumfang, wenig knöcherne Führung - die Stabilität kommt fast ausschließlich aus Muskeln und Sehnen.": "Lots of range of motion, little bony guidance - stability comes almost entirely from muscles and tendons.", "Vier Sehnen, die den Oberarmkopf in der Pfanne zentrieren. Sie arbeiten bei jedem Drücken und Ziehen mit, ohne dass man sie spürt - und sind der Grund, warum saubere Technik über Kopf wichtiger ist als Gewicht.": "Four tendons that keep the head of the upper arm centered in its socket. They work in every push and pull without you feeling it - and are the reason clean technique overhead matters more than weight.", "WHO empfiehlt 150 moderate Minuten": "WHO recommends 150 moderate minutes", "Was heute los war": "What happened today", "Was willst du tun?": "What do you want to do?", "Weiter trainieren": "Keep training", "Welche Muskeln trainiert diese Einheit?": "Which muscles does this session train?", "Welchen Rhythmus hältst du?": "What rhythm do you keep?", "Wie lange und wie fest du etwas halten kannst. Bei Zug- und Hebeübungen oft das erste, was nachgibt - und damit die Grenze, bevor der Zielmuskel wirklich ausbelastet ist.": "How long and how hard you can hold on to something. In pulling and lifting exercises it's often the first thing to give out - and so the limit before the target muscle is really worked.", "Wie lief es? Was war schwer, was ging leicht?": "How did it go? What was hard, what felt easy?", "Wie weit ein Gelenk bewegt werden kann, ohne auszuweichen. Wächst durch regelmäßige, nicht durch lange Einheiten.": "How far a joint can move without compensating. Grows through regular sessions, not long ones.", "Wie wird das gezählt?": "How is this counted?", "Wiederholungen": "Reps", "Wiederholungen in Reserve": "Reps in reserve", "Wiederholungen in Reserve für diesen Satz": "Reps in reserve for this set", "Wirbelsäule": "Spine", "Wird bei Stützpositionen in Streckung belastet. Mit der Zeit gewöhnt es sich daran; von null auf viel ist der übliche Fehler.": "Loaded in extension in support positions. It gets used to it over time; going from zero to a lot is the usual mistake.", "Wird im Training nicht eigens gezählt": "Not counted separately in training", "Wo stehst du heute?": "Where do you stand today?", "Wähl die Backup-Datei aus oder füg den Inhalt als Text ein. Das ersetzt deine aktuellen Daten.": "Choose the backup file or paste its contents as text. This replaces your current data.", "Ziehen senkrecht": "Vertical pull", "Ziehen waagerecht": "Horizontal pull", "Zählt als": "Counts as", "Zählt nicht ins Trainingsvolumen - diese Strukturen lassen sich nicht in Sätzen pro Woche messen. Sie werden trotzdem mitbelastet und brauchen meist länger, um sich anzupassen, als der Muskel.": "Not counted toward training volume - these structures can't be measured in sets per week. They are still loaded and usually take longer to adapt than the muscle.", "bis zum Muskelversagen": "to failure", "erledigt": "completed", "fünf oder mehr in Reserve": "five or more in reserve", "heute erledigt": "done today", "jeder Tag mit mindestens einem Satz": "every day with at least one set", "lassen sich gut umrechnen. Bei sehr langen Sätzen wird die Schätzung unsicher – dann lieber ein schwereres Gewicht mit weniger Wiederholungen eintragen.": "convert well. For very long sets the estimate becomes unreliable – better enter a heavier weight with fewer reps.", "morgens im Liegen – daraus wird die Ausdauer geschätzt": "in the morning, lying down – endurance is estimated from it", "z. B. Butterfly Maschine": "e.g. Butterfly machine", "z. B. Maschine": "e.g. Machine", "z. B. Oberkörper A": "e.g. Upper body A", "Über dich": "About you", "Übung": "Exercise", "Übung bearbeiten": "Edit exercise", "Übung entfernen": "Remove exercise", "Übungen": "Exercises", "– sie messen, was du in den letzten Tagen wirklich getan hast. Nach zwei Wochen Eintragen sind sie aussagekräftig.": "– they measure what you actually did in recent days. After two weeks of logging they are meaningful.", "…oder Backup-Text hier einfügen": "…or paste backup text here", "− Satz": "− Set"};
  for(var k in add)if(!(k in UI_EN))UI_EN[k]=add[k];
  // Nachtrag 27.09.: in der Übungsauswahl übersehen
  if(!("+ Neue Übung erstellen" in UI_EN))UI_EN["+ Neue Übung erstellen"]="+ Create new exercise";
  if(!("Übung suchen…" in UI_EN))UI_EN["Übung suchen…"]="Search exercise…";
  var PAT_EN={"Drücken waagerecht": "Horizontal push", "Drücken über Kopf": "Overhead push", "Ziehen senkrecht": "Vertical pull", "Ziehen waagerecht": "Horizontal pull", "Kniebeuge-Muster": "Squat pattern", "Hüftstreckung": "Hip hinge", "Rumpf": "Core", "Ausdauer": "Cardio", "Isolation": "Isolation", "Mobilität": "Mobility"},EQ_EN={"Bauchroller": "Ab wheel", "Kabelzug": "Cable", "Klimmzugstange": "Pull-up bar", "Kopfgeschirr": "Head harness", "Kurzhantel": "Dumbbell", "Körpergewicht": "Body weight", "Langhantel": "Barbell", "Maschine": "Machine", "Rad": "Bike", "Reiskübel": "Rice bucket", "Springseil": "Jump rope", "Sonstiges": "Other"},OB_EN={"Über dich":"About you","Hauptübungen":"Main exercises","Krafttest":"Strength test","Rhythmus":"Rhythm","Startwert":"Starting score"};
  function alt(o){return Object.keys(o).map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|");}
  var vorne=[
    [/(\d+) von (\d+) Sätzen/g,"$1 of $2 sets"],
    [/^▬ stabil in (\d+) Tagen$/g,"▬ steady over $1 days"],
    [/^([▲▼] \+?\d+) in (\d+) Tagen$/g,"$1 over $2 days"],
    [/Wochenminimum ([\d,.]+) Sätze · noch ([\d,.]+) offen/g,"Weekly minimum $1 sets · $2 to go"],
    [/Wochenminimum ([\d,.]+) Sätze · erreicht/g,"Weekly minimum $1 sets · reached"],
    [/^Übung (\d+) von (\d+) · /g,"Exercise $1 of $2 · "],
    [/ · neu · /g," · new · "],
    [/ · Pause (\d+) s$/g," · rest $1 s"],
    [/^(.+): (\d+) % Beanspruchung – allein in der Figur hervorheben$/g,"$1: $2 % load – show only this in the figure"],
    [/^(\d+) gewählt: /g,"$1 selected: "],
    [/^Beanspruchte Muskeln von (.+) gross anzeigen$/g,"Show muscles worked by $1 large"],
    [/^Beanspruchte Muskeln von (.+) anzeigen$/g,"Show muscles worked by $1"],
    [/^Kraft (Brust|Schultern|Rücken|Arme|Beine|Rumpf)$/g,function(m,c){return "Strength – "+({"Brust":"Chest","Schultern":"Shoulders","Rücken":"Back","Arme":"Arms","Beine":"Legs","Rumpf":"Core"})[c];}],
    [/^Aus dem Plan · /g,"From plan · "],
    [/nächste Stufe ab /g,"next level at "],
    [/· nächste ab /g,"· next at "],
    [/· Höchststufe/g,"· top level"],
    [/(\d+) Äquivalentminuten/g,"$1 equivalent minutes"],
    [/auf dein Wochenziel von (\d+) min\./g,"toward your weekly goal of $1 min."],
    [/^ab (\d+) % Top-Übung$/g,"from $1 % of the top exercise"],
    [/letzte (\d+) Tage · antippen für Details/g,"last $1 days · tap for details"],
    [/^(zu wenig|im Korridor|über Limit) · /g,function(m,z){return ({"zu wenig":"too little","im Korridor":"in range","über Limit":"over limit"})[z]+" · ";}],
    [/^Schritt (\d+) von (\d+) · (.+)$/g,function(m,a,b,c){return "Step "+a+" of "+b+" · "+(OB_EN[c]||c);}],
    [/^Stufe „(.+?)“ als Durchschnitt aus (\d+) bewerteten Übung(?:en)? in diesem Bereich\. Bester Einzelwert: (.+?) mit (.+?)\. „Richtwert“ heißt: Stufe aus einer verwandten Übung abgeleitet, nicht aus einer eigenen Normtabelle\.$/g,
      function(m,g,n,ex,val){return "Level “"+g+"” as the average of "+n+" rated exercise"+(n==="1"?"":"s")+" in this area. Best single value: "+ex+" with "+val+". “Guide value” means: level derived from a related exercise, not from its own standards table.";}],
    [new RegExp("^("+alt(PAT_EN)+") · ([^·]+)$","g"),function(m,p,e){return PAT_EN[p]+" · "+(EQ_EN[e]||e);}],
    // Die Formel-Erklärung im Werte-Tab ist ein einziger Textblock mit fester Spaltenbreite.
    [/Formwert = 30 % Maximalkraft\n(\s+)\+ 25 % Konstanz\n(\s+)\+ 20 % Muskelabdeckung\n(\s+)\+ 15 % Ausdauer\n(\s+)\+ 10 % Mobilität/g,
      "Formwert = 30 % max strength\n$1+ 25 % consistency\n$2+ 20 % muscle coverage\n$3+ 15 % endurance\n$4+ 10 % mobility"],
    [/Maximalkraft    Ø der (\d+) Kraft-Bereiche \((\d+) T\)\n(\s+)je Bereich zählt die stärkste Übung/g,"Max strength    avg of $1 strength areas ($2 d)\n$3per area the strongest exercise counts"],
    [/Konstanz        Trainingstage (\d+) T ÷ (\d+)/g,"Consistency     training days $1 d ÷ $2"],
    [/Muskelabdeckung Ø Sätze je Muskel gegen MEV\/MAV \((\d+) T\)/g,"Muscle coverage avg sets per muscle vs MEV/MAV ($1 d)"],
    [/Ausdauer        WHO-Minuten \+ VO2max-Perzentil/g,"Endurance       WHO minutes + VO2max percentile"],
    [/Mobilität       Einheiten (\d+) T ÷ (\d+)/g,"Mobility        sessions $1 d ÷ $2"],
    [/Epley \(1–3 Wdh\)/g,"Epley (1–3 reps)"],
    [/weich gemischt, aus dem besten Satz/g,"smoothly blended, from the best set"],
    [/\nFigur: /g,"\nFigure: "],
    [/\njetzt  /g,"\nnow    "]
  ];
  var hinten=[
    [/(\d+) Übungen\b/g,"$1 exercises"],
    [/^(\d+) Übung$/g,"$1 exercise"],
    [/(\d+) min Ausdauer/g,"$1 min cardio"],
    [/^(\d+) Minuten\b/g,"$1 minutes"],
    [/^(\d+) Einheiten$/g,"$1 sessions"],
    [/^(\d+) Einheit$/g,"$1 session"],
    [/ · Mobilität$/g," · Mobility"],
    [/ · Notiz$/g," · Note"],
    [/ · Ausdauer$/g," · cardio"]
  ];
  UI_RX.unshift.apply(UI_RX,vorne);
  UI_RX.push.apply(UI_RX,hinten);
})();

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
  var c=lastC,pk=state.profile.peaks||{};
  // Während eines Trainings rechnet renderLight() bewusst nicht alles neu, sondern setzt nur
  // heuteDirty. Körper und Werte brauchen aber den aktuellen Stand – sonst fehlen dort die
  // gerade abgehakten Sätze, bis man einmal den Heute-Tab öffnet.
  if(heuteDirty&&id!=="tab-training")c=lastC=compute(TODAY);
  if(!c)return;
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
// Jede Änderung bekommt eine laufende Nummer. Dadurch darf ein abgeschlossener älterer
// Schreibvorgang nur genau die Version als erledigt markieren, die er selbst übertragen hat.
var dirtySeq=Date.now(),
persistRun=null,
persistAgain=false,
syncRetryT=null;


function nextDirty(){return ++dirtySeq;}


function touch(d){state.dirty[d]=nextDirty();saveLocal();queueSave();}


function markRoutineDirty(id){state.dirtyRoutines[id]=nextDirty();saveLocal();}


// Eigene Übungen und Anpassungen werden beim Verbinden mit dem Cloud-Stand zusammengeführt.
// Was hier gelöscht oder zurückgesetzt wurde, steht dort aber noch drin und käme so zurück –
// darum wird es gemerkt, bis der nächste erfolgreiche Upload es auch aus dem Konto entfernt.
function markExtrasDirty(gone){
  state.dirtyExtras=nextDirty();
  if(gone){state.extrasGone=state.extrasGone||{};state.extrasGone[gone]=1;}
  saveLocal();
}


var stTimer=null;


function queueSave(){if(stTimer)clearTimeout(stTimer);stTimer=setTimeout(persist,700);}


function persist(){
  saveLocal();if(!db)return Promise.resolve(false);
  // Cloud-Schreibvorgänge seriell ausführen. Sonst kann ein langsamer älterer Stand einen
  // neueren überholen und zuletzt in der Datenbank landen.
  if(persistRun){persistAgain=true;return persistRun;}
  var p=Object.keys(state.dirty),pv={},r=Object.keys(state.dirtyRoutines),rv={},ev=state.dirtyExtras,jobs=[];
  p.forEach(function(d){pv[d]=state.dirty[d];var b=state.days[d];if(!b)return;
    jobs.push(db.doc("days/"+d).set({sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}));});
  r.forEach(function(id){rv[id]=state.dirtyRoutines[id];
    jobs.push(state.routines[id]?db.doc("routines/"+id).set(state.routines[id]):db.doc("routines/"+id).delete());});
  if(state.profile)jobs.push(db.doc("state/profile").set(state.profile));
  jobs.push(db.doc("state/exoverrides").set({v:state.exOverrides||{}}));
  jobs.push(db.doc("state/customex").set({v:state.customEx||[]}));
  persistRun=Promise.all(jobs).then(function(){
    p.forEach(function(d){if(state.dirty[d]===pv[d])delete state.dirty[d];});
    r.forEach(function(id){if(state.dirtyRoutines[id]===rv[id])delete state.dirtyRoutines[id];});
    if(state.dirtyExtras===ev){state.dirtyExtras=0;state.extrasGone={};}
    if(syncRetryT){clearTimeout(syncRetryT);syncRetryT=null;}
    saveLocal();setSync("on","synchronisiert");return true;
  },function(){
    // Nichts als erledigt markieren: alle Versionen bleiben im localStorage und werden
    // beim nächsten Versuch oder sogar nach einem Neustart erneut übertragen.
    saveLocal();setSync("off","Sync gestört – lokal gespeichert");
    if(syncRetryT)clearTimeout(syncRetryT);
    syncRetryT=setTimeout(function(){syncRetryT=null;persist();},30000);
    return false;
  }).then(function(ok){
    persistRun=null;
    if(persistAgain){persistAgain=false;setTimeout(persist,0);}
    return ok;
  });
  return persistRun;
}
