/* ==========================================================
   app/10-routinen.js - Einheiten (Routinen): Muskelfokus und Routine-Editor
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

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
  var list=el("div","card flush focus-list");list.style.margin="0";
  var rows=MUSCLES.slice().sort(function(a,b){return fo.sets[b.id]-fo.sets[a.id];}).filter(function(m){return fo.sets[m.id]>0;});
  // Zuerst nur die drei staerksten Muskeln - die ganze Liste erst auf Wunsch.
  var showAll=false,moreBtn=null;
  function drawList(){
    list.innerHTML="";
    (showAll?rows:rows.slice(0,3)).forEach(function(m){
      var v=fo.sets[m.id];
      var share=fo.max>0?v/fo.max:0,c=corr(m),vr=Math.round(v*10)/10;
      var r=el("div","row"),mn=el("div","main");
      mn.appendChild(el("b",null,m.name));
      // Die Wocheneinordnung steht direkt daneben - eine Zahl ohne Bezugsgroesse sagt nichts.
      // Bewusst in Saetzen und nicht in Prozent (Prozent ist fuer die Uebungswirkung reserviert).
      var offen=Math.round((c.mev-v)*10)/10;
      mn.appendChild(el("span",null,"Wochenminimum "+c.mev+" Sätze · "+
        (vr>=c.mev?"erreicht":("noch "+offen+" offen"))));
      r.appendChild(mn);
      var track=el("i","fbar");track.style.setProperty("--c",exPctColorStep(share));
      var fill=el("b");fill.style.width=Math.max(4,Math.round(share*100))+"%";
      track.appendChild(fill);r.appendChild(track);
      r.appendChild(el("span","val",vr));
      list.appendChild(r);
    });
    if(moreBtn)moreBtn.textContent=showAll?"Weniger anzeigen":"Alle "+rows.length+" Muskeln anzeigen";
  }
  wrap.appendChild(list);
  if(rows.length>3){
    moreBtn=el("button","btn ghost block focus-more");moreBtn.type="button";moreBtn.style.marginTop="8px";
    moreBtn.onclick=function(){showAll=!showAll;drawList();};
    wrap.appendChild(moreBtn);
  }
  drawList();
  var how=document.createElement("details");how.className="infobox";how.style.marginTop="8px";
  var sm=document.createElement("summary");sm.textContent="Wie wird gezählt?";how.appendChild(sm);
  how.appendChild(el("p","note","Gewichtete Sätze: je Satz zählt ein Muskel mit dem Anteil, "+
    "den diese Übung für ihn leistet (in der Übung als Prozent angegeben, 100 % = beste "+
    "verfügbare Übung), mal dem Faktor für die Wiederholungen in Reserve. "+
    "Balken und Farbe zeigen den Anteil am stärkst beanspruchten Muskel DIESER Einheit – "+
    "die Figur oben ist genauso eingefärbt. Sie sagen also, worauf die Einheit zielt, "+
    "nicht wie viel der Wochenmenge sie deckt; das steht als Satzzahl daneben."));
  wrap.appendChild(how);
  return wrap;
}

/* Die staerksten Muskeln einer Uebung, absteigend - fuer die Kurzanzeige im Editor. */
var edMusCollapseAll=function(){};
function openExFromEditor(ex){
  // Wer woanders hingeht und zurueckkommt, findet alle Listen wieder zugeklappt.
  try{edMusCollapseAll();}catch(e){}
  var sb=$("sheet"),y=sb?sb.scrollTop:0;
  sheetExerciseDetail(ex);
  var iv=setInterval(function(){
    var pg=$("exdpage");
    if(pg&&pg.hidden){clearInterval(iv);if(sb&&sb.classList.contains("open"))sb.scrollTop=y;}
  },150);
}
function exTopMuscles(ex){
  var w=exSetWeights(ex),out=[];
  for(var g in w){var m=muscleById(g);if(m&&w[g]>0)out.push({id:g,name:m.name,w:Math.min(1,w[g])});}
  out.sort(function(a,b){return b.w-a.w||a.name.localeCompare(b.name,"de");});
  return out;
}
/* ================= Routine-Editor ================= */
function sheetEditor(id,preset){
  var ed=preset?preset:(id?JSON.parse(JSON.stringify(state.routines[id])):{id:rid(),name:"",items:[]});
  openSheet(function(b){
    sheetTitle(b,id?"Einheit bearbeiten":"Neue Einheit");
    var nf=el("div","field");nf.appendChild(el("label",null,"Name"));
    var ni=document.createElement("input");ni.type="text";ni.value=ed.name;ni.placeholder="z. B. Oberkörper A";nf.appendChild(ni);b.appendChild(nf);
    // Eine Pausenzeit fuer die ganze Einheit statt fuer jede Uebung einzeln. Entspricht sie dem
    // Standard aus den Einstellungen, wird nichts eigenes gespeichert - dann wirkt eine spaetere
    // Aenderung des Standards auch hier.
    var rf=numField("Pause zwischen Sätzen (Sekunden)",routineRest(ed),"15",0);rf.style.marginTop="12px";b.appendChild(rf);
    var rNote=el("p","note",""),rUpd=function(){var v=parseFloat(rf.input.value);rNote.textContent=(isFinite(v)&&Math.round(v)===defaultRest())?"Standard aus den Einstellungen":"Gilt für alle Übungen dieser Einheit";};
    rf.input.addEventListener("input",rUpd);rUpd();rNote.style.margin="4px 2px 0";b.appendChild(rNote);
    function readRest(){var v=parseFloat(String(rf.input.value).replace(",","."));if(!isFinite(v))return ed.rest!=null?ed.rest:null;v=clamp(Math.round(v),0,600);return v===defaultRest()?null:v;}
    var list=el("div");list.style.margin="12px -16px 0";b.appendChild(list);
    var focusBox=el("div");
    // Immer nur EINE aufgeklappte Muskelliste: oeffnet man eine, klappen alle anderen zu.
    var musCtl=[];
    edMusCollapseAll=function(){musCtl.forEach(function(f){f(false);});};
    function draw(){
      list.innerHTML="";musCtl=[];
      if(!ed.items.length)list.appendChild(el("div","empty","Noch keine Übung."));
      ed.items.forEach(function(it,i){
        var ex=exById(it.ex),r=el("div","ed-row2");
        // Bild: was trainiert diese Uebung (vorne/hinten). Antippen klappt die volle Muskelliste auf.
        var figs=el("button","ed-figs");figs.type="button";
        if(ex){
          [["front","vorne"],["back","hinten"]].forEach(function(v){
            var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
            sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",v[0]);
            sv.setAttribute("aria-hidden","true");figs.appendChild(sv);
          });
        }
        var info=el("div","ed-info");
        info.appendChild(el("b",null,ex?ex.n:it.ex));
        var top=ex?exTopMuscles(ex):[],musBox=el("div","ed-mus");
        function drawMus(all){
          if(all)musCtl.forEach(function(f){if(f!==drawMus)f(false);});
          if(!all&&!musBox.classList.contains("all")&&musBox.childNodes.length)return;
          musBox.innerHTML="";musBox.classList.toggle("all",all);
          (all?top:top.slice(0,3)).forEach(function(m){
            var c=el("span","ed-m");
            var dot=el("i");dot.style.background=exPctColor(m.w);c.appendChild(dot);
            c.appendChild(el("span","ed-mn",m.name));
            if(all){var bar=el("i","fbar");bar.style.setProperty("--c",exPctColorStep(m.w));var bf=el("b");bf.style.width=Math.max(4,Math.round(m.w*100))+"%";bar.appendChild(bf);c.appendChild(bar);}
            musBox.appendChild(c);
          });
          // Link klappt die volle Muskelliste direkt hier auf; die ganze Uebung gibt es per Bild.
          if(top.length>3){
            var more=el("button","ed-more",all?"weniger":"alle "+top.length+" Muskeln");more.type="button";
            more.onclick=function(ev){ev.stopPropagation();drawMus(!all);};
            musBox.appendChild(more);
          }
        }
        musCtl.push(drawMus);drawMus(false);
        figs.setAttribute("aria-label","Übung ansehen: "+(ex?ex.n:it.ex));
        // Antippen fuehrt zur kompletten Uebungsseite (wie im Entdecken-Tab). Der Editor bleibt
        // dahinter offen und kommt mit "Zurueck" unveraendert wieder - samt Scrollposition.
        figs.onclick=function(){if(ex)openExFromEditor(ex);};
        var nameB=info.firstChild;if(ex&&nameB){nameB.classList.add("ed-name");nameB.setAttribute("role","button");nameB.tabIndex=0;
          nameB.onclick=function(){openExFromEditor(ex);};
          nameB.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openExFromEditor(ex);}};}
        info.appendChild(musBox);
        // Wiederholungen und Gewicht sind bewusst optional: leer heisst "erst im Training
        // eintragen". Nur was man hier ausdruecklich eintraegt, wird als Vorgabe uebernommen.
        function inp(val,step,cb,optional){var n=document.createElement("input");n.type="number";n.inputMode="decimal";n.step=step;n.min="0";
          n.value=(val==null||(optional&&!(val>0)))?"":String(val);
          if(optional)n.placeholder=(ex&&ex.t==="sec"&&step==="1")?"s":"–";
          n.onchange=function(){var raw=String(n.value).trim().replace(",",".");
            var v=raw===""?null:parseFloat(raw);if(v!=null&&!isFinite(v))v=null;
            var stored=cb(v);if(optional&&(v==null||!(v>0)))n.value="";else if(stored!=null&&String(stored)!==n.value)n.value=String(stored);
            focusBox.innerHTML="";focusBox.appendChild(focusPanel(ed.items));};return n;}
        function labeled(lab,input){var w=el("label","ed-in");w.appendChild(el("span",null,lab));w.appendChild(input);return w;}
        var ctl=el("div","ed-ctl");
        ctl.appendChild(labeled("Sätze",inp(it.sets,"1",function(v){return (it.sets=clamp(Math.round(v||0)||1,1,12));})));
        ctl.appendChild(labeled(ex&&ex.t==="sec"?"Sek.":"Wdh.",inp(it.reps,"1",function(v){return (it.reps=(v!=null&&v>0)?Math.max(1,Math.round(v)):null);},true)));
        if(ex&&ex.t==="load")ctl.appendChild(labeled("kg",inp(it.kg,"2.5",function(v){return (it.kg=(v!=null&&v>0)?v:null);},true)));
        // Reihenfolge aendern: bewusst zwei Pfeile statt Ziehen-und-Fallenlassen. Die Liste
        // steht in einem scrollbaren Blatt, dort ist Ziehen auf dem Telefon unzuverlaessig -
        // es kollidiert mit dem Scrollen des Blattes.
        var side=el("div","ed-side");
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
        // Uebung tauschen: Auswahl oeffnet gleich bei der Koerperregion der bisherigen Uebung,
        // Satzzahl bleibt, Wdh./kg werden geleert (andere Uebung, andere Zahlen).
        var sw=el("button","ed-mv ed-swap");sw.type="button";sw.setAttribute("aria-label","Übung tauschen");sw.title="Übung tauschen";
        sw.innerHTML=svgIcon("M7 7h11l-3-3M17 17H6l3 3",2);
        sw.onclick=function(ev){
          ev.preventDefault();ev.stopPropagation();
          ed.name=ni.value;ed.rest=readRest();closeSheet();
          var rg=null;if(ex&&ex.mob)rg=MOB_REGION;else if(ex){var p0=(ex.p||[])[0];rg=REGIONS.find(function(r){return r.ids&&r.ids.indexOf(p0)>=0;})||null;}
          setTimeout(function(){openSheet(function(bb){
            sheetTitle(bb,"Übung tauschen");
            if(ex)bb.appendChild(el("p","note","Statt „"+ex.n+"“ – "+it.sets+(it.sets===1?" Satz bleibt.":" Sätze bleiben.")));
            exPicker(bb,null,function(e){
              if(e.id!==it.ex){it.ex=e.id;it.reps=null;it.kg=null;}
              closeSheet();setTimeout(function(){sheetEditor(id,ed);},180);
            },{region:rg,mob:true});
          });},180);
        };
        side.appendChild(sw);
        side.appendChild(moveBtn(-1,"Nach oben","M6 14l6-6 6 6"));
        side.appendChild(moveBtn(1,"Nach unten","M6 10l6 6 6-6"));
        var del=el("button","iconbtn");del.setAttribute("aria-label","Entfernen");del.innerHTML=svgIcon(IC_TRASH,1.6);
        del.onclick=function(){ed.items.splice(i,1);draw();};side.appendChild(del);
        r.appendChild(figs);r.appendChild(info);r.appendChild(ctl);r.appendChild(side);
        list.appendChild(r);
      });
      // Figuren erst fuellen, wenn sie im Dokument haengen (Masse/Masken brauchen das).
      requestAnimationFrame(function(){Array.prototype.forEach.call(list.querySelectorAll("svg[data-ex]"),fillExFig);});
      focusBox.innerHTML="";focusBox.appendChild(focusPanel(ed.items));
    }
    draw();
    var addBtn=el("button","btn ghost block","+ Übung hinzufügen");addBtn.style.marginTop="12px";
    addBtn.onclick=function(){
      ed.name=ni.value;ed.rest=readRest();closeSheet();
      setTimeout(function(){openSheet(function(bb){sheetTitle(bb,"Übung hinzufügen");
        exPicker(bb,null,function(e){ed.items.push({ex:e.id,sets:e.mob?2:3,reps:null,kg:null});closeSheet();setTimeout(function(){sheetEditor(id,ed);},180);},{mob:true});});},180);
    };
    b.appendChild(addBtn);
    var fh=el("h2","sec","Welche Muskeln trainiert diese Einheit?");fh.style.margin="18px 0 8px";b.appendChild(fh);
    b.appendChild(focusBox);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){ed.name=(ni.value||"").trim()||"Einheit";if(!ed.items.length)return;
      ed.rest=readRest();
      // Alte Einzelwerte je Uebung gibt es im Editor nicht mehr - die Einheit hat eine Pause.
      ed.items.forEach(function(it){delete it.rest;});
      // Einheitlich speichern: leere Vorgaben als null (alte Vorlagen hatten 0 kg als Platzhalter).
      ed.items.forEach(function(it){it.kg=tplKg(it.kg);it.reps=tplReps(it.reps);});
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
    items.push({ex:c[0].id,sets:clamp(Math.ceil(g.d/2),2,4),reps:null,kg:null});
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
};
