/* ==========================================================
   app/13-onboarding.js - Onboarding (5 Schritte)
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Onboarding ================= */
var ob=null,obStep=0,OB=["Über dich","Hauptübungen","Krafttest","Rhythmus","Startwert"];
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
  // Bei Körpergewichts-Übungen (Klimmzüge, Dips) zählt das Körpergewicht immer mit. Ohne
  // Wiederholungen hieße das sonst "1 Wdh. mit Körpergewicht" - die Einrichtung trüge dann für
  // jeden, der hier 0 lässt, einen erfundenen Satz ein. 0 Wdh. heißt wie früher: keine Angabe.
  if(e.t==="load"&&e.wt==="body"&&ob.mode[id]!=="max"&&!(ob.val[id]>0))return 0;
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
        var b=el("button","pick");b.type="button";b.innerHTML=esc(e.n)+"<small>"+esc(e.e)+"</small>";
        b.setAttribute("aria-pressed",String(ob.main[pt.id]===e.id));
        b.onclick=function(){ob.main[pt.id]=(ob.main[pt.id]===e.id?null:e.id);
          Array.prototype.forEach.call(g.children,function(c){c.setAttribute("aria-pressed","false");});
          if(ob.main[pt.id]===e.id)b.setAttribute("aria-pressed","true");};
        g.appendChild(b);});
      w.appendChild(g);});
    w.appendChild(el("div","grouplab","Ausdauer"));var g2=el("div","pickgrid");
    EX.filter(function(e){return e.t==="cardio";}).slice(0,8).forEach(function(e){
      var b=el("button","pick");b.type="button";b.innerHTML=esc(e.n)+"<small>"+esc(e.intens)+" intensiv</small>";
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
    [["days","Trainingstage pro Woche","Tage","jeder Tag mit mindestens einem Satz",1,7,"1"],["mob","Mobilität pro Woche","×","je 10 Minuten Dehnen oder Mobilisieren",0,7,"1"],["cardio","Ausdauerminuten pro Woche","min","WHO empfiehlt 150 moderate Minuten",0,600,"15"]].forEach(function(g){
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
