/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: fw_syncPullExtras() bis (Anweisung)
*/

// Beim Verbinden dieselben beiden Dokumente wieder einlesen. Was lokal schon vorhanden
// ist, hat Vorrang (das ist der zuletzt auf diesem Geraet bearbeitete Stand).
function fw_syncPullExtras(d){
  // Kein catch: Schlägt das Einlesen fehl, darf connect() nicht weitermachen und danach
  // den unvollständigen lokalen Stand als vollständig ins Konto schreiben.
  var gone=state.extrasGone||{};
  return d.doc("state/exoverrides").get().then(function(es){
    var v=es&&es.exists?cloneWritable(es.data()):null;v=v&&v.v;
    if(v&&typeof v==="object"){
      state.exOverrides=state.exOverrides||{};
      Object.keys(v).forEach(function(id){if(!state.exOverrides[id]&&!gone["ov:"+id])state.exOverrides[id]=v[id];});
    }
    return d.doc("state/customex").get();
  }).then(function(cs){
    var v=cs&&cs.exists?cloneWritable(cs.data()):null;v=v&&v.v;
    if(Array.isArray(v)){
      state.customEx=state.customEx||[];
      var have={};state.customEx.forEach(function(e){if(e&&e.id)have[e.id]=1;});
      v.forEach(function(e){if(e&&e.id&&!have[e.id]&&!gone["ex:"+e.id])state.customEx.push(e);});
    }
    applyCustomEx();applyExOverrides();
    secDirty.entdecken=true;secDirty.training=true;
  });
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
  // Gespeichert wird das eingetragene Gewicht; gewertet wird es später mit effectiveKg (bei
  // "pro Seite" verdoppelt). Die Vorschau muss genauso rechnen, sonst springt die Stufe nach dem
  // Abschluss.
  if(e.t==="load"){if(ob.mode[id]==="max")return effectiveKg(e,ob.kg[id]);return e1rm(effectiveKg(e,ob.kg[id]),ob.val[id]||0);}
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
      if(e.t==="load")grid.appendChild(nfield((isMax?"Einer-Maximum":"Gewicht")+(e.wt==="side"?" pro Seite":"")+" (kg)",ob.kg[id],"2.5",function(v){ob.kg[id]=v;}));
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
  // Das Assessment fragt nur Eckdaten, Hauptübungen und Ziele ab. Beim Wiederholen bleibt
  // alles andere am Profil erhalten: Cooper-Test, persönliche Korridore, Sprache, Startdatum
  // (daran hängen die Auswertungsfenster) und Bestwerte.
  var old=state.profile,neu=buildProfile();
  if(old&&old.version>=3){for(var k in old){if(!(k in neu)||k==="cooper"||k==="peaks"||k==="startedAt")neu[k]=old[k];}}
  state.profile=neu;var d=day(TODAY);
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
      if(touched){touch(d);changed=true;}
    }
    for(var rid2 in state.routines){
      var r=state.routines[rid2],touched2=false;
      (r.items||[]).forEach(function(it){if(it.ex===oldId){it.ex=newId;touched2=true;}});
      if(touched2){markRoutineDirty(rid2);changed=true;}
    }
    if(workout&&Array.isArray(workout.exercises)){
      var touched3=false;
      workout.exercises.forEach(function(we){if(we.ex===oldId){we.ex=newId;touched3=true;}});
      if(touched3){changed=true;saveWorkout();}
    }
    state.customEx=state.customEx.filter(function(x){return x.id!==oldId;});
    for(var i=EX.length-1;i>=0;i--)if(EX[i].id===oldId)EX.splice(i,1);
    if(EX_BY_ID)delete EX_BY_ID[oldId];
    markExtrasDirty();changed=true;
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
    db=d;
    // Eine offline begonnene Wiederherstellung muss VOR jedem Cloud-Download abgeschlossen
    // werden. Sonst würden gerade ersetzte lokale Daten wieder mit dem alten Kontostand vermischt.
    if(cloudReplacePending()){
      setSync("","Backup wird übertragen");
      return replaceCloudFromState(d).then(function(){
        markCloudReplacePending(false);connectTries=0;setSync("on","synchronisiert");connect();
      }).catch(function(){
        setSync("off","Backup nur lokal – Übertragung wird wiederholt");fwBootReady();setTimeout(connect,30000);
      });
    }
    setSync("on","synchronisiert");
    d.doc("state/profile").get().then(function(s){
      var sd=s.exists?cloneWritable(s.data()):null;
      if(sd&&sd.version>=3&&!state.profile)state.profile=sd;
      // Ab hier steht fest, ob es ein gespeichertes Profil gibt - der Startbildschirm
      // darf weg. Tage und Einheiten kommen gleich danach und rendern nochmal.
      fwBootReady();
      return d.collection("days").limit(400).get();
    }).then(function(qs){
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(!b)return;
        // Ein lokal geänderter Tag gewinnt, bis genau diese Version erfolgreich hochgeladen ist.
        if(state.dirty[doc.id])return;
        if(doc.id===TODAY&&state.days[TODAY]&&(state.days[TODAY].sets||[]).length)return;
        state.days[doc.id]={sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""};});
      return d.doc("state/workout").get().then(function(ws){if(ws.exists&&!workout){workout=validWorkout(cloneWritable(ws.data()));if(!workout)d.doc("state/workout").delete().catch(function(){});else{secDirty.training=true;if(tab==="tab-training")renderSession();renderBanner();}}}).catch(function(){}).then(function(){return fw_syncPullExtras(d);}).then(function(){return d.collection("routines").limit(100).get();});
    }).then(function(qs){
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(b&&b.id&&!state.dirtyRoutines[doc.id])state.routines[b.id]=b;});
      mergeDuplicateCustomEx();
      if(state.profile&&state.profile.version>=3)renderAll();persist();
      connectTries=0;
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

/* Brust und Schulter liegen obenauf - dort soll nie etwas durchsichtig werden. */
/* Muskeln, die ohnehin ganz aussen liegen. Fuer sie wird nichts durchsichtig gemacht -
   das Freilegen wuerde nur die Umgebung ausduennen, ohne dass man den Muskel dadurch
   besser saehe. Der Bizeps gehoert dazu: er liegt direkt unter der Haut. */
/* Blickwinkel je Muskelgruppe. Frontal ist nicht fuer jeden Muskel die beste Ansicht: eine
   gewoelbte Flaeche wie die Brust zeigt von vorn nur ihre Silhouette, der Saegemuskel liegt
   seitlich, der Latissimus faechert zur Seite auf. yaw dreht das Modell zusaetzlich (Grad),
   pitch hebt die Kamera an (positiv = Blick von leicht oben). Ohne Eintrag bleibt es bei der
   bisherigen, rein geometrischen Ausrichtung. */
// Leichte Schraege in Grad - eine Zahl, damit alle betroffenen Gruppen zusammen bleiben.
var MIN_TILT=14;

var FW3D_VIEW_TILT={
  // Gedreht nur dort, wo eine flache Ansicht die Form verschluckt: die gewoelbte Brust,
  // der seitlich liegende Saegemuskel, die seitliche/hintere Schulter, Adduktoren, Waden.
  tg_brust_ober:{yaw:30,pitch:14}, tg_brust_mitte:{yaw:30,pitch:8},
  tg_brust_unten:{yaw:30,pitch:-4}, tg_brust_serratus:{yaw:62,pitch:4},
  tg_schulter_seit:{yaw:MIN_TILT,pitch:8}, tg_schulter_hint:{yaw:MIN_TILT,pitch:8},
  tg_schulter_vorn:{yaw:MIN_TILT,pitch:8},
  tg_adduktoren:{yaw:22,pitch:0},
  tg_wade_gastro:{yaw:20,pitch:0}, tg_wade_soleus:{yaw:24,pitch:0},
  tg_gesaess_med:{yaw:44,pitch:6}, tg_gesaess_min:{yaw:46,pitch:6},
  // Hals und Nacken brauchen mehr Drehung als der Rest: von hinten sieht man nur den
  // Umriss, die Straenge verlaufen seitlich am Hals.
  tg_hals_nacken:{yaw:36,pitch:6}, tg_nacken:{yaw:36,pitch:6},
  tg_rueck_trapez_ob:{yaw:36,pitch:6},
  /* Flaechige Muskeln auf Vorder- bzw. Rueckseite bekommen nur eine leichte Schraege:
     gerade genug, dass die Figur plastisch wirkt, zu wenig, um die Symmetrie zu stoeren. */
  tg_rueck_lat:{yaw:MIN_TILT,pitch:4}, tg_rueck_teres_major:{yaw:MIN_TILT,pitch:6},
  tg_rueck_trapez_mit:{yaw:MIN_TILT,pitch:4}, tg_rueck_trapez_unt:{yaw:MIN_TILT,pitch:4},
  tg_rueck_rhomb:{yaw:MIN_TILT,pitch:4}, tg_rueck_strecker:{yaw:MIN_TILT,pitch:8},
  tg_trizeps_lang:{yaw:MIN_TILT,pitch:4}, tg_trizeps_lat:{yaw:MIN_TILT,pitch:4},
  tg_unterarm_beug:{yaw:MIN_TILT,pitch:2}, tg_unterarm_streck:{yaw:MIN_TILT,pitch:2},
  tg_quadrizeps:{yaw:MIN_TILT,pitch:0}, tg_kniesehnen:{yaw:MIN_TILT,pitch:0},
  tg_bauch_gerade:{yaw:MIN_TILT,pitch:4}, tg_bauch_schraeg:{yaw:MIN_TILT,pitch:4},
  tg_bauch_tief:{yaw:MIN_TILT,pitch:4}, tg_huefte:{yaw:MIN_TILT,pitch:2}
}
;

/* Bei mehreren gewaehlten Gruppen wird gemittelt - eine ganze Region soll EINEN Blickwinkel
   bekommen, nicht den der zufaellig ersten Gruppe. */
function fw3dTiltFor(sg){
  if(window.__fwTilt)return window.__fwTilt;   // Prueffenster fuer Winkel-Versuche
  var n=0,y=0,p=0;
  sg.forEach(function(g){var t=FW3D_VIEW_TILT[g];if(t){n++;y+=t.yaw||0;p+=t.pitch||0;}});
  if(!n)return null;
  return {yaw:y/n,pitch:p/n};
}

var FW3D_NOFADE=["tg_brust_ober","tg_brust_mitte","tg_brust_unten",
                 "tg_schulter_vorn","tg_schulter_seit","tg_schulter_hint",
                 "tg_bizeps","tg_brachialis","tg_brust_serratus"];

var fw3dReady=false,
 fw3dFrameCreated=false;

function fw3dEnsureFrame(){
  if(fw3dFrameCreated)return;
  fw3dFrameCreated=true;
  var frame=$("body3d-frame");
  if(!frame)return;
  try{
    var bin=atob(FW3D_HTML_B64);
    var bytes=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    var htmlTxt=new TextDecoder("utf-8").decode(bytes);
    frame.srcdoc=htmlTxt;frame.hidden=false;
  }catch(e){var ld=$("body3d-loading");if(ld)ld.textContent="3D-Modell konnte nicht geladen werden.";}
}

// Manche Feinmuskeln haben im 3D-Modell keine eigene Mesh (z. B. Tensor fasciae latae – im
// Scan nicht als separater Körper vorhanden). Damit sie beim Anklicken trotzdem sichtbar rot
// markiert werden und die Kamera dorthin schwenkt, wird beim Anwählen zusätzlich die Mesh eines
// anatomisch benachbarten Muskels aus derselben Gruppe markiert (TFL -> mittlerer Gesäßmuskel,
// direkt angrenzend an der seitlichen Hüfte).
var FW3D_FINE_PROXY={tfl:"gluteus_medius"}
;

function fw3dColorForGroup(g,fineKey,sg,ms){
  var m=muscleById(g);if(!m)return null;
  var v=ms[g]||0, z=zoneOf(v,m);
  var proxyHit = fineKey && selFine && FW3D_FINE_PROXY[selFine]===fineKey;
  var _ef=effFine(),_es=effSet();
  var isSelected = fineKey ? (_ef===fineKey||proxyHit||(_es&&_es.indexOf(fineKey)>=0)) : (sg.indexOf(g)>=0);
  return {z:z,sel:isSelected,v:v,m:m};
}

// Für diese Muskeln/Gruppen soll das 3D-Modell beim Anwählen immer die feste Vorderansicht
// zeigen statt die Kamera automatisch (geometrisch) auszurichten – z. B. weil sie ohnehin
// vorn liegen (Brust, vordere/seitliche Schulter) oder weil sie so tief liegen (Subscapularis),
// dass nur die Vorderansicht plus Transparenz der davorliegenden Strukturen sie sichtbar macht.
/* Die Kamera richtet sich sonst automatisch nach der Geometrie aus - beim Bizeps landete sie
   dadurch hinter dem Koerper, obwohl er vorn liegt (die Arme haengen seitlich, der Schwerpunkt
   der Mesh fuehrt die Automatik in die Irre). Diese Gruppen bekommen deshalb fest die Vorderansicht. */
var FW3D_FORCE_FRONT_GROUPS=["tg_brust_ober","tg_brust_mitte","tg_brust_unten","tg_brust_serratus",
                             "tg_schulter_vorn","tg_schulter_seit","tg_bizeps","tg_brachialis"];

var FW3D_FORCE_FRONT_FINE=["subscapularis"];

// Der Subscapularis liegt tief zwischen Schulterblatt und Rippen – ohne diese feste Liste an
// Strukturen, die beim Anwählen zusätzlich durchsichtig werden, bleibt er hinter Brust-, Sägemuskel-,
// Rippen- und Bizepsanteilen verborgen (die automatische, geometrienahe Verdeckungserkennung allein
// reicht dafür nicht aus).
// Ganze Gruppen koennen ebenfalls unter anderen Muskeln liegen: die Nackenmuskulatur
// verschwindet z.B. hinter dem absteigenden Teil des Trapezmuskels. Ist so eine Gruppe
// angewaehlt, werden die davorliegenden Strukturen durchsichtig geschaltet.
/* Ausloeser, bei denen auch ein mitausgewaehlter Muskel freigelegt werden darf.
   Der Nacken stand hier, damit die tiefe Nackenmuskulatur unter dem oberen Trapez sichtbar
   wird - das hat aber den Trapez selbst zum Schleier gemacht, obwohl er zur Auswahl gehoert.
   Zwischen beidem kann man nicht haben: entweder man sieht den deckenden Muskel oder den
   darunter. Die Entscheidung faellt fuer den sichtbaren Trapez; wer die Schicht darunter
   sehen will, waehlt die Nackenmuskulatur einzeln an - dann liegt sie frei. Liste bleibt
   leer, aber vorhanden: die Mechanik dahinter wird noch gebraucht. */
var FW3D_FT_OVERRIDE_SEL=[];

var FW3D_FORCE_TRANSPARENT_GROUPS={
  tg_nacken:["Descending part of trapezius muscle","Ascending part of trapezius muscle","Transverse part of trapezius muscle","Longissimus capitis muscle","Rhomboid major muscle","Rhomboid minor muscle","Serratus posterior superior muscle"],
  tg_bauch_gerade:["External abdominal oblique muscle","Internal abdominal oblique muscle"],
  /* Der Tractus iliotibialis ist eine Sehnenplatte, die seitlich ueber dem Gesaess liegt.
     Die automatische Verdeckungserkennung haengt am Blickwinkel - beim Drehen kippte er
     deshalb zwischen "weg" und "grosse gelbe Flaeche" hin und her. Als feste Liste bleibt
     er in jeder Stellung durchsichtig. */
  tg_gesaess_haupt:["Iliotibial tract"],
  tg_gesaess_med:["Iliotibial tract"],
  tg_gesaess_min:["Iliotibial tract"],
  // Derselbe Sehnenstreifen laeuft seitlich ueber den Oberschenkel - beim Quadrizeps kam er
  // deshalb mit Verzoegerung ins Bild, sobald die Verdeckererkennung nachrechnete.
  tg_quadrizeps:["Iliotibial tract"],
  tg_kniesehnen:["Iliotibial tract"],
  tg_adduktoren:["Iliotibial tract"],
  // Die Rhomboiden liegen komplett unter dem Trapezmuskel.
  tg_rueck_rhomb:["Descending part of trapezius muscle","Ascending part of trapezius muscle","Transverse part of trapezius muscle"],
  // Der Rueckenstrecker verlaeuft ueber die ganze Wirbelsaeule, ist aber grossteils
  // unter Trapezmuskel und Latissimus versteckt - nur ein kleiner Zipfel am unteren
  // Ruecken bleibt sonst sichtbar.
  tg_rueck_strecker:["Descending part of trapezius muscle","Ascending part of trapezius muscle","Transverse part of trapezius muscle","Latissimus dorsi muscle","Rhomboid major muscle","Rhomboid minor muscle"]
}
;

/* Gleiche Zuordnung wie in der interaktiven Ansicht, aber aus einer Beteiligungs-
   Map (Gruppe -> 0/0.5/1) abgeleitet, fuer die guenstige Standbild-Erzeugung
   (keine teure Laufzeit-Sichtbarkeitspruefung noetig). */
/* onlyTriggers: Liste der Gruppen, die ueberhaupt etwas ausblenden duerfen. Bei einer
   ganzen Trainingseinheit sind viele Muskeln beteiligt - dort wuerde jedes Ausblenden
   Information wegnehmen statt welche freizulegen. Deshalb gilt dort nur der eine Fall, in
   dem ohne Transparenz gar nichts zu sehen waere: die schraegen Bauchmuskeln liegen als
   durchgehende Flaeche ueber dem geraden Bauchmuskel. */
function fw3dForceTransparentForInv(inv,boostGroup,onlyTriggers){
  var sg=[];for(var g in inv){if((inv[g]||0)>0)sg.push(g);}
  if(!sg.length)return null;
  // Bei einer Uebung sind oft mehrere Gruppen beteiligt (Primaer- UND Sekundaermuskeln).
  // Jede "ausblendende" Gruppe (mit eigenem Eintrag in FW3D_FORCE_TRANSPARENT_GROUPS) darf
  // eine verdeckende Struktur nur dann wegblenden, wenn deren eigene Gruppe nicht mindestens
  // genauso stark beansprucht wird wie sie selbst - sonst wuerde z.B. ein nur sekundaer
  // beanspruchter schraeger Bauchmuskel den primaer trainierten geraden Bauchmuskel weiterhin
  // verdecken. boostGroup (ein per Muskel-Chip ausgewaehlter Fokus, z.B. "Rhomboiden" in
  // Entdecken) gewinnt bei einem Gleichstand mit einer anderen, ebenfalls primaeren Gruppe
  // derselben Uebung - ohne dass dadurch auch andere, unbeteiligte Ties beeinflusst werden.
  var acc=[];
  sg.forEach(function(triggerG){
    if(onlyTriggers&&onlyTriggers.indexOf(triggerG)<0)return;
    var l=FW3D_FORCE_TRANSPARENT_GROUPS[triggerG];if(!l)return;
    var triggerV=inv[triggerG]||0;
    if(boostGroup&&triggerG===boostGroup)triggerV+=0.01;
    l.forEach(function(nm){
      if(acc.indexOf(nm)>=0)return;
      var fk=FW3D_MESH2FINE[nm],gg=fk&&FINE[fk]&&FINE[fk].g;
      if(gg&&sg.indexOf(gg)>=0&&(inv[gg]||0)>=triggerV)return;
      acc.push(nm);
    });
  });
  return acc.length?acc:null;
}

var FW3D_FORCE_TRANSPARENT={
  /* Der Rabenschnabel-Armmuskel liegt an der Innenseite des Oberarms, direkt unter dem kurzen
     Bizepskopf und vorn verdeckt von Delta- und Brustmuskel. Ohne diese Liste markiert man ihn
     an und sieht nichts - die automatische Verdeckungserkennung greift hier nicht, weil er
     grossteils GENAU hinter dem Bizeps liegt, der selbst zur gleichen Gruppe gehoert. */
  coracobrachialis:["Short head of biceps brachii","Long head of biceps brachii",
    "Brachialis muscle","Clavicular part of deltoid muscle","Acromial part of deltoid muscle",
    "Clavicular head of pectoralis major muscle","Sternocostal head of pectoralis major muscle",
    "Pectoralis minor muscle"],
  subscapularis:["Sternocostal head of pectoralis major muscle","Pectoralis minor muscle",
    "External intercostal muscles","Internal intercostal muscles","Innermost intercostal muscles",
    "First rib","Second rib","Third rib","Fourth rib","Fifth rib","Sixth rib","Seventh rib",
    "Eighth rib","Ninth rib","Tenth rib","Eleventh rib","Twelfth rib",
    "Serratus anterior muscle","Clavicular head of pectoralis major muscle","Coracobrachialis muscle",
    "Serratus posterior superior muscle","Iliocostalis thoracis muscle","Iliocostalis colli muscle",
    "Clavicular part of deltoid muscle","Short head of biceps brachii","Long head of biceps brachii",
    "Transversus thoracis muscle","Body of sternum","Manubrium of sternum"]
}
;

/* === Figuren-Bilder aus dem 3D-Modell ====================================
   Die kleinen Vorder-/Rueckansichten (Uebungskarten, Muskelgruppen-Kacheln,
   Tagesansicht, Trainingsseite) kommen aus demselben 3D-Modell wie die grosse
   Koerperansicht: ein verstecktes zweites Modellfenster rendert auf Anfrage ein
   Standbild von vorne bzw. hinten mit den beanspruchten Muskeln eingefaerbt.
   So zeigen die Bildchen exakt dieselbe Anatomie wie das 3D-Modell (also z.B.
   auch langer vs. seitlicher Trizepskopf getrennt) statt einer vereinfachten
   Zeichnung. Jedes Motiv wird nur einmal gerendert und dann gemerkt. */
var fw3dSnapFrame=null,
 fw3dSnapReady=false,
 fw3dSnapQ=[],
 fw3dSnapBusy=null,
 fw3dSnapSeq=0,
 fw3dSnapCache={}
, fw3dSnapDead=false
var fw3dSnapOrder=[];

function fw3dSnapEnsure(){
  if(fw3dSnapFrame||fw3dSnapDead)return;
  try{
    fw3dSnapFrame=document.createElement("iframe");
    fw3dSnapFrame.id="body3d-snap";
    fw3dSnapFrame.setAttribute("aria-hidden","true");
    fw3dSnapFrame.setAttribute("title","3D-Vorschau");
    fw3dSnapFrame.tabIndex=-1;
    fw3dSnapFrame.style.cssText="position:fixed;left:-10000px;top:0;width:260px;height:520px;border:0;opacity:0;pointer-events:none;";
    document.body.appendChild(fw3dSnapFrame);
    var bin=atob(FW3D_HTML_B64);
    var bytes=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    fw3dSnapFrame.srcdoc=new TextDecoder("utf-8").decode(bytes);
  }catch(e){fw3dSnapDead=true;}
}

function fw3dSnapPump(){
  if(!fw3dSnapReady||fw3dSnapBusy||!fw3dSnapQ.length||!fw3dSnapFrame)return;
  var job=fw3dSnapQ.shift();
  if(fw3dSnapCache[job.key]){try{job.cb(fw3dSnapCache[job.key]);}catch(e){}return fw3dSnapPump();}
  fw3dSnapBusy=job;
  try{fw3dSnapFrame.contentWindow.postMessage({type:"fw3d-snapshot",colors:job.colors,view:job.view,reqId:job.id,ghost:!!job.ghost,forceTransparent:job.forceTransparent||null},"*");}
  catch(e){fw3dSnapBusy=null;}
  // Sicherheitsnetz: bleibt eine Antwort aus, haengt sonst die ganze Warteschlange.
  // Der Auftrag wird einmal wiederholt, danach aufgegeben.
  clearTimeout(fw3dSnapTO);fw3dSnapTO=setTimeout(function(){
    if(fw3dSnapBusy!==job)return;
    fw3dSnapBusy=null;
    if(!job.retried){job.retried=true;fw3dSnapQ.unshift(job);}
    fw3dSnapPump();
  },60000);
}

// Nur fuer Diagnose/Tests: sind gerade keine Bilder in Arbeit?
window.fw3dSnapIdle=function(){return !fw3dSnapBusy&&!fw3dSnapQ.length;}
;

var fw3dSnapTO=0;

function fw3dSnapRequest(key,colors,view,cb,ghost,forceTransparent,urgent){
  if(fw3dSnapCache[key]){cb(fw3dSnapCache[key]);return;}
  fw3dSnapEnsure();
  if(fw3dSnapDead)return;
  var job={id:++fw3dSnapSeq,key:key,colors:colors,view:view,cb:cb,ghost:!!ghost,forceTransparent:forceTransparent||null};
  /* Bilder, auf die jemand gerade sichtbar wartet (Vorschau im Uebungsformular), kommen nach
     vorn. Sonst stehen sie hinter dem ganzen Uebungskatalog - der rendert im Hintergrund
     weiter, waehrend man schon tippt, und die Vorschau erschiene erst viel spaeter. */
  if(urgent)fw3dSnapQ.unshift(job);else fw3dSnapQ.push(job);
  fw3dSnapPump();
}

function fw3dSnapResult(d){
  var job=fw3dSnapBusy;
  // Antwort strikt der Anfrage zuordnen: kommt ein Bild verspaetet (nach einem
  // Zeitueberlauf) an, gehoert es nicht mehr zum laufenden Auftrag - sonst bekaeme
  // eine Figur das Bild einer anderen Anfrage (z.B. falsche Farbe).
  if(!job||!d||d.reqId!==job.id)return;
  clearTimeout(fw3dSnapTO);
  fw3dSnapBusy=null;
  if(job&&d&&d.dataUrl){
    // Bilder sind gross (hohe Aufloesung fuer scharfe Darstellung) - aelteste
    // Eintraege verwerfen, damit der Speicher nicht unbegrenzt waechst.
    fw3dSnapOrder.push(job.key);
    fw3dSnapCache[job.key]=d.dataUrl;
    while(fw3dSnapOrder.length>90){var old=fw3dSnapOrder.shift();if(old!==job.key)delete fw3dSnapCache[old];}
    try{job.cb(d.dataUrl);}catch(e){}
  }
  fw3dSnapPump();
}

/* Einfaerbung fuer ein Standbild: alles, was die Uebung/der Tag beansprucht, wird
   markiert (primaer kraeftig, sekundaer schwaecher), der Rest bleibt in der neutralen
   Modellfarbe. Dieselbe Zuordnung Mesh -> Muskelgruppe wie in der grossen Ansicht. */
function fw3dColorsForInvolve(inv,ramp){
  var css=getComputedStyle(document.documentElement);
  function cvar(n){return css.getPropertyValue(n).trim()||"#888888";}
  var PRI=cvar("--ex-pri"), SEC=cvar("--ex-sec"), colors={};
  /* mode "step": die volle Stufenskala - fuer die grossen Figuren in der Uebung.
     mode "card": nur zwei Stufen (Hauptmuskel / beteiligt) - in den kleinen Kacheln der
       Uebungsliste ist das Bild rund 130 px gross, dort geht jede Nuance ohnehin verloren
       und wirkt nur unruhig.
     sonst: die alte Primaer/Sekundaer-Einteilung fuer Uebungen ohne Prozentwerte. */
  var CARD_ON=(ramp==="card")?exPctColorStep(0.5):null;
  function colFor(v){
    if(ramp==="card")return v>=EX_PCT_HOT?exPctColorStep(v):CARD_ON;
    if(ramp)return exPctColorStep(v);
    return v>=1?PRI:SEC;
  }
  function put(name,g){var v=inv[g]||0;if(v<=0)return;colors[name]=colFor(v);}
  for(var n1 in FW3D_MESH2FINE){var fk=FW3D_MESH2FINE[n1],g1=FINE[fk]&&FINE[fk].g;if(g1)put(n1,g1);}
  for(var n2 in FW3D_MESH2GROUP){if(FW3D_MESH2FINE[n2])continue;put(n2,FW3D_MESH2GROUP[n2]);}
  for(var n3 in FW3D_DUAL){var gs=FW3D_DUAL[n3],best=0;
    gs.forEach(function(g){if((inv[g]||0)>best)best=inv[g]||0;});
    if(best>0)colors[n3]=colFor(best);}
  return colors;
}

/* Setzt das fertige Standbild in ein vorhandenes <svg>-Feld der Karte. */
function fw3dSnapInto(svg,key,inv,view,ghost,boostGroup,ramp,ftOnly,urgent){
  if(svg.getAttribute("data-filled"))return;
  svg.setAttribute("data-filled","1");
  var _cols=fw3dColorsForInvolve(inv,ramp);
  var _ft=fw3dForceTransparentForInv(inv,boostGroup,ftOnly);
  fw3dSnapRequest(key+"|"+view+(ghost?"|x":"")+(_ft?"|ft":"")+(boostGroup?"|b:"+boostGroup:""),_cols,view,function(url){
    try{
      svg.innerHTML="";
      svg.setAttribute("viewBox",svg.getAttribute("data-crop")||"0 0 260 520");
      svg.setAttribute("preserveAspectRatio","xMidYMid meet");
      var im=document.createElementNS("http://www.w3.org/2000/svg","image");
      im.setAttribute("x","0");im.setAttribute("y","0");
      im.setAttribute("width","260");im.setAttribute("height","520");
      im.setAttribute("preserveAspectRatio","xMidYMid meet");
      im.setAttribute("href",url);
      im.setAttributeNS("http://www.w3.org/1999/xlink","href",url);
      svg.appendChild(im);
    }catch(e){}
  },ghost,_ft,urgent);
}

function fw3dSyncColors(ms){
  if(!fw3dFrameCreated)fw3dEnsureFrame();
  var frame=$("body3d-frame");
  if(!frame||!fw3dReady)return;
  var sg=selGroups();
  var css=getComputedStyle(document.documentElement);
  function cvar(n){return css.getPropertyValue(n).trim()||"#888888";}
  var SELCOL=cvar("--bad");
  var colors={}, selected=[];
  for(var name in FW3D_MESH2FINE){
    var fk=FW3D_MESH2FINE[name], g=FINE[fk]&&FINE[fk].g; if(!g)continue;
    var r=fw3dColorForGroup(g,fk,sg,ms); if(!r)continue;
    colors[name]=r.sel?SELCOL:volColor(r.v,r.m);
    if(r.sel)selected.push(name);
  }
  for(var name2 in FW3D_MESH2GROUP){
    if(FW3D_MESH2FINE[name2])continue;
    var g2=FW3D_MESH2GROUP[name2];
    var r2=fw3dColorForGroup(g2,null,sg,ms); if(!r2)continue;
    colors[name2]=r2.sel?SELCOL:volColor(r2.v,r2.m);
    if(r2.sel)selected.push(name2);
  }
  for(var name3 in FW3D_DUAL){
    var gs3=FW3D_DUAL[name3];
    var vAvg=0;gs3.forEach(function(gg){vAvg+=(ms[gg]||0);});vAvg/=gs3.length;
    var m3=muscleById(gs3[0]);
    var isSel3=gs3.some(function(gg){return sg.indexOf(gg)>=0;});
    colors[name3]=isSel3?SELCOL:(m3?volColor(vAvg,m3):cvar("--vol0"));
    if(isSel3)selected.push(name3);
  }
  var _ef2=effFine();
  var forceFront=(_ef2&&FW3D_FORCE_FRONT_FINE.indexOf(_ef2)>=0)||(sg.length>0&&sg.every(function(g){return FW3D_FORCE_FRONT_GROUPS.indexOf(g)>=0;}));
  var forceTransparent=(_ef2&&FW3D_FORCE_TRANSPARENT[_ef2])||null;
  if(!forceTransparent&&sg.length){
    var acc=[];
    sg.forEach(function(g){var l=FW3D_FORCE_TRANSPARENT_GROUPS[g];if(l)acc=acc.concat(l);});
    /* Eine Struktur, die selbst zur Auswahl gehoert, bleibt normalerweise stehen - sonst
       loest sich die eigene Auswahl auf. Ausnahme: liegt der deckende Muskel UND der
       verdeckte in derselben Auswahl (Nacken = oberer Trapez + tiefe Nackenmuskulatur),
       waere die Auswahl sonst zur Haelfte unsichtbar. Dann wird der deckende Muskel
       freigelegt; er bleibt als roter Schleier erkennbar. */
    /* Diese Ausnahme gilt NUR fuer ausdruecklich benannte Ausloeser. Als allgemeine Regel
       ("immer freilegen, wenn beide in der Auswahl sind") war sie zu grob: beim Rumpf haette
       sie die schraegen Bauchmuskeln durchsichtig gemacht, obwohl die dort selbst das Thema
       sind - das Bild wirkte dadurch unruhig und wechselhaft. */
    var keepSel=sg.every(function(g){return FW3D_FT_OVERRIDE_SEL.indexOf(g)<0;});
    if(keepSel)acc=acc.filter(function(nm){
      var fk=FW3D_MESH2FINE[nm],gg=fk&&FINE[fk]&&FINE[fk].g;
      return !(gg&&sg.indexOf(gg)>=0);
    });
    if(acc.length)forceTransparent=acc;
  }
  // "Nichts ausblenden" gilt fuer oberflaechliche Muskeln. Sobald fuer die konkrete Auswahl
  // eine Freilege-Liste existiert, waere es genau verkehrt herum - dann liegt der Muskel eben
  // nicht oben, und die Liste ist der einzige Weg, ihn ueberhaupt zu sehen.
  var noFade=!forceTransparent&&sg.length>0&&sg.every(function(g){return FW3D_NOFADE.indexOf(g)>=0;});
  var tilt=fw3dTiltFor(sg);
  try{frame.contentWindow.postMessage({type:"fw3d-colors",colors:colors,selected:selected.length?selected:null,noFade:noFade,forceFront:forceFront,forceTransparent:forceTransparent,tilt:tilt},"*");}catch(e){}
}

function fw3dHandleSelect(name){
  // Das 3D-Modell meldet auch "nichts ausgewaehlt" (name ist null/leer) sowie ein erneutes
  // Antippen derselben Struktur zum Abwaehlen -- beides muss die Formwert-Auswahl wirklich loeschen,
  // sonst bleibt die Markierung (rot) haengen.
  selReset();
  if(!name || selTapKey===name){
    selFine=null;selSet=null;selLabel=null;selMuscle=null;selTapKey=null;
    renderBodySel();
    return;
  }
  var fk=FW3D_MESH2FINE[name];
  // Antippen der Platzhalter-Mesh eines Feinmuskels ohne eigene 3D-Mesh (siehe FW3D_FINE_PROXY,
  // z. B. Tensor fasciae latae -> mittlerer Gesäßmuskel) darf die Auswahl nicht auf die Platzhalter-
  // Struktur umspringen lassen -- sonst wirkt es so, als würde man versehentlich den falschen
  // Muskel auswählen. Die ursprüngliche Auswahl bleibt in diesem Fall unverändert.
  if(fk && selFine && FW3D_FINE_PROXY[selFine]===fk){
    return;
  }
  if(fk){
    selFine=fk;selSet=null;selLabel=null;selMuscle=FINE[fk]?FINE[fk].g:null;
  } else {
    var dg=FW3D_DUAL[name];
    var g=dg?dg[0]:FW3D_MESH2GROUP[name];
    if(!g)return;
    var m=muscleById(g);if(!m)return;
    selFine=null;selSet=dg?fineIdsOfGroups(dg):fineIdsOfGroups([g]);selLabel=m.name;selMuscle=g;
  }
  selTapKey=name;
  renderBodySel();
}

function fw3dRevealFrame(){
  var ld=$("body3d-loading");if(ld&&!ld.hidden){ld.hidden=true;}
}

window.addEventListener("message",function(ev){
  var d=ev.data;if(!d||typeof d!=="object")return;
  var frame=$("body3d-frame");
  if(fw3dSnapFrame&&ev.source===fw3dSnapFrame.contentWindow){
    if(d.type==="fw3d-ready"){fw3dSnapReady=true;fw3dSnapPump();}
    else if(d.type==="fw3d-snapshot-result"){fw3dSnapResult(d);}
    return;
  }
  if(!frame||ev.source!==frame.contentWindow)return;
  if(d.type==="fw3d-ready"){
    fw3dReady=true;
    if(lastC)fw3dSyncColors(lastC.ms);
    // Modell erst sichtbar machen, sobald die berechneten Farben angewendet wurden
    // (verhindert kurzes Aufblitzen der Standard-Rohfarben, z. B. Bauchmuskeln in Rosa).
    setTimeout(fw3dRevealFrame,700);
  }
  else if(d.type==="fw3d-colors-applied"){fw3dRevealFrame();}
  else if(d.type==="fw3d-select"){fw3dHandleSelect(d.name);}
});

/* Der Brachialis war bis eben Teil der Bizepsgruppe und taucht deshalb in keiner Uebung
   eigenstaendig auf. Statt 35 Stellen von Hand nachzuziehen (und es bei der naechsten neuen
   Uebung wieder zu vergessen), wird er hier einmal aus dem Bizeps abgeleitet: Er ist ein
   reiner Ellenbogenbeuger ohne Drehfunktion, arbeitet also ueberall dort mit, wo der Bizeps
   den Ellenbogen beugt. Die griffabhaengigen Unterschiede (Hammer- und Langhantelcurls im
   Kammgriff betonen ihn staerker als supinierte Curls) sind darin noch NICHT abgebildet -
   das braeuchte eigene Werte je Uebung. */
(function brachialisAusBizeps(){
  EX.forEach(function(e){
    ["p","s","st"].forEach(function(t){
      if(e[t]&&e[t].indexOf("tg_bizeps")>=0&&e[t].indexOf("tg_brachialis")<0)e[t].push("tg_brachialis");
    });
  });
  for(var id in EX_PCT){
    var p=EX_PCT[id];
    if(p.tg_bizeps!=null&&p.tg_brachialis==null)p.tg_brachialis=p.tg_bizeps;
  }
})();

LANG=detectLang();
applyLangData();
document.documentElement.setAttribute("lang",LANG);

setTimeout(function(){applyUiLang(document.body);},0);

(function(){var a=$("btn-newex");if(a){
  a.innerHTML=svgIcon("M12 5v14M5 12h14",2.1);
  /* Neue Uebung anlegen - direkt aus der Kopfzeile, aber nur dort, wo es hingehoert:
     im Entdecken-Tab, wo der Uebungskatalog steht. Nach dem Anlegen wird die Liste
     aufgefrischt und die neue Uebung geoeffnet. */
  a.onclick=function(){
    sheetCreateExercise(null,function(created){
      closeSheet();
      secDirty.entdecken=true;
      renderSection("tab-entdecken");
      setTimeout(function(){sheetExerciseDetail(created);},180);
    });
  };
}})();

(function(){var g=$("btn-settings");if(!g)return;
  g.innerHTML=svgIcon("M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"+
    "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33"+
    " 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 008.6 19.4a1.65 1.65 0 00-1.82.33"+
    "l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 110-4h.09"+
    "A1.65 1.65 0 003.6 8.6a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33"+
    "H8a1.65 1.65 0 001-1.51V2a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06"+
    "a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V8a1.65 1.65 0 001.51 1H22a2 2 0 110 4h-.09"+
    "a1.65 1.65 0 00-1.51 1z",1.7);
  g.onclick=function(){openSettingsPage();};})();

fwBoot();

connect();
