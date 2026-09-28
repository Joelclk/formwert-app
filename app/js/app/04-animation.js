/* ==========================================================
   app/04-animation.js - 3D-Bewegungsablauf (animierter Arm) und Nachladen der grossen 3D-Dateien
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= 3D-Bewegungsablauf (animierter Arm) =================
   Ein eigenes, kleines 3D-Fenster nur fuer die Uebungsseite: der rechte Arm aus dem
   Anatomie-Rig (Blender), mit gebackener Bewegung und den Muskelfarben der Uebung.
   Viewer und Modell liegen gzip-komprimiert vor und werden erst beim Oeffnen entpackt. */
/* FW_ANIM_V: ausgelagert nach assets/anim-viewer.js */
/* FW_ANIM_G: ausgelagert nach assets/anim-modell.js */
var FW_ANIM_CLIP={curl_bb:"curl",curl_db:"curl",curl_cable:"curl",curl_hammer:"hammer",tri_push:"pushdown",
  tri_kick:"kickback",tri_over:"overhead",tri_skull:"skull",lateral:"lateral",lateral_cable:"lateral",
  frontraise:"frontraise",ohp:"press",ohp_db:"press",push_press:"press",arnold:"press",
  pike_pushup:"press",hspu:"press",bench:"bench",bench_db:"bench",machine_press:"bench",
  machine_press_lying:"bench",pushup:"bench",pushup_arch:"bench",bench_dec:"bench",bench_inc:"incline",
  bench_inc_db:"incline",pushup_dec:"incline",fly_db:"fly",cable_fly:"fly",fly_machine:"fly",
  reversefly:"reversefly",bandpullapart:"reversefly",facepull:"facepull",row_bb:"row",row_db:"row",
  row_pendlay:"row",row_tbar:"row",row_cable:"row",row_machine:"row",row_inv:"row",row_band:"row",
  latpull:"latpull",latpull_close:"latpull",pullup:"latpull",chinup:"latpull",pullup_wide:"latpull",
  pullup_weight:"latpull",pullup_neg:"latpull",shrug:"shrug",shrug_db:"shrug",shrug_cable:"shrug",pullover:"pullover",
  rot_internal:"rotint",mob_bandpullapart:"reversefly",
  /* Beine und Rumpf (Ganzkörper-Modell, Schritt E): ein Clip je Bewegungsmuster */
  squat:"squat",squat_front:"squat",squat_goblet:"squat",squat_bw:"squat",hacksquat:"squat",legpress:"squat",
  deadlift:"deadlift",deadlift_sumo:"deadlift",
  /* Rumänisches Kreuzheben: Hüftbeuge mit fast gestreckten Knien (bis 28.09.2026 als „deadlift“ gezeigt) */
  deadlift_rdl:"rdl",goodmorning:"rdl",deadlift_sl:"rdl",
  /* Hüftkreisen im Stand: Ganzkörper-Modell, weil Becken und Rumpf mitgehen */
  mob_hip:"hipcircle",
  calf_stand:"calfraise",calf_bw:"calfraise",
  // Bein und Hüfte: eigenes Modell (assets/anim-modell-bein.js), siehe FW_ANIM_MODELL.
  mob_hipcar_knee:"hipcar",mob_legraise_circ:"legcircle",mob_gate:"gate",mob_legswing:"legswing"};
/* Bildunterschrift im ersten Modell: Es zeigt inzwischen den ganzen Körper mit beiden Seiten. Beinübungen
   werden als ganzer Körper beschrieben, die Arm-Clips als Oberkörper. */
var FW_ANIM_CAP_BEINE={squat:1,deadlift:1,rdl:1,calfraise:1,hipcircle:1};
/* Welche Bewegung in welchem Modell steckt. Das erste Modell (anim-modell.js) ist das Ganzkörper-Modell;
   die Mobilitäts-Clips für Bein und Hüfte liegen getrennt in anim-modell-bein.js. */
var FW_ANIM_MODELL={hipcar:"bein",legcircle:"bein",gate:"bein",legswing:"bein"};
var FW_ANIM_MODELLE={
  // text:null = Bildunterschrift je Clip über FW_ANIM_CAP_BEINE
  arm:{asset:"anim-modell",daten:function(){return FW_ANIM_G;},text:null},
  bein:{asset:"anim-modell-bein",daten:function(){return FW_ANIM_G_BEIN;},
       text:"Rechte Körperhälfte: Bein, Hüfte und Becken – Muskeln in den Farben von „Beanspruchte Muskeln“."}};
// Wird von werkzeug/animation_einpacken.py auf true gesetzt, sobald das Beinmodell eingepackt ist.
// Vorher bekommen die Beinübungen keinen Animationsblock statt einer Fehlermeldung.
var FW_ANIM_BEIN=true;
var fwAnimGlbs={}, fwAnimHtml=null;
/* Grosse Datenbloecke (3D-Viewer, Animation) werden erst geladen, wenn sie gebraucht werden -
   vorher musste der Browser beim Start rund 12,5 MB Skript einlesen, bevor die App erschien. */
var fwAssetP={};
function fwLoadAsset(name){
  if(fwAssetP[name])return fwAssetP[name];
  fwAssetP[name]=new Promise(function(res,rej){
    var sc=document.createElement("script");sc.src="assets/"+name+".js";sc.async=true;
    sc.onload=function(){res();};
    sc.onerror=function(){delete fwAssetP[name];sc.remove();rej(new Error("asset "+name));};
    document.head.appendChild(sc);
  });
  return fwAssetP[name];
}
// Die Betrachter-Seite steht in assets/3d-viewer.js inzwischen direkt als Text (FW3D_HTML).
// Früher war sie zusätzlich base64-kodiert: 11 MB Zeichen für Zeichen auspacken kostete auf
// einem Mittelklasse-Handy rund eine Sekunde – und das bei jedem Aufruf (Körper-Tab und
// Figuren-Schnappschuss je einmal). Das Ergebnis wird deshalb einmal gemerkt. Die alte Form
// (FW3D_HTML_B64) wird weiter gelesen, falls nur eine der beiden Dateien neu ausgeliefert wird.
var fw3dHtmlP=null;
function fw3dHtml(){
  if(fw3dHtmlP)return fw3dHtmlP;
  fw3dHtmlP=fwLoadAsset("3d-viewer").then(function(){
    if(typeof FW3D_HTML==="string")return FW3D_HTML;
    var bin=atob(FW3D_HTML_B64),bytes=new Uint8Array(bin.length);
    for(var i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
    return new TextDecoder("utf-8").decode(bytes);
  });
  // Ein Ladefehler darf nicht für immer gemerkt bleiben – der nächste Aufruf versucht es neu.
  fw3dHtmlP.catch(function(){fw3dHtmlP=null;});
  return fw3dHtmlP;
}
function fwAnimB64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
function fwAnimGunzip(u){return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();}
function exAnimBlock(ex){
  var clip=FW_ANIM_CLIP[ex.id]; if(!clip)return null;
  var modell=FW_ANIM_MODELL[clip]||"arm",md=FW_ANIM_MODELLE[modell];
  if(modell==="bein"&&!FW_ANIM_BEIN)return null;
  var wrap=el("div","exanim");
  var box=el("div","exanim-box"); wrap.appendChild(box);
  box.appendChild(el("span","exanim-load","3D-Modell wird geladen …"));
  wrap.appendChild(el("p","note exanim-cap",md.text||(FW_ANIM_CAP_BEINE[clip]?"Ganzer Körper: Beine, Becken, Rumpf und Arme – Muskeln in den Farben von „Beanspruchte Muskeln“.":"Oberkörper mit beiden Armen, Schultern, Brust und Rücken – Muskeln in den Farben von „Beanspruchte Muskeln“.")));
  if(typeof DecompressionStream==="undefined"){box.firstChild.textContent="Die 3D-Animation braucht einen neueren Browser.";return wrap;}
  var fr=document.createElement("iframe"); fr.className="exanim-frame"; fr.title="3D-Bewegungsablauf";
  box.appendChild(fr);
  var inv=exPctInv(ex)||exInvolve(ex);
  fr._fwAnim={clip:clip,modell:modell,colors:fw3dColorsForInvolve(inv,"step")};
  Promise.all([fwLoadAsset("anim-viewer"),fwLoadAsset(md.asset)])
    .then(function(){return fwAnimHtml||fwAnimGunzip(fwAnimB64(FW_ANIM_V)).then(function(b){return (fwAnimHtml=new TextDecoder("utf-8").decode(b));});})
    .then(function(h){fr.srcdoc=h;})
    .catch(function(){box.firstChild.textContent="3D-Animation konnte nicht geladen werden.";});
  return wrap;
}
window.addEventListener("message",function(ev){
  var d=ev.data; if(!d||d.src!=="fwanim")return;
  var frs=document.querySelectorAll(".exanim-frame"),fr=null;
  for(var i=0;i<frs.length;i++){if(frs[i].contentWindow===ev.source){fr=frs[i];break;}}
  if(!fr)return;
  if(d.type==="boot"){
    var mk=fr._fwAnim.modell||"arm";
    if(!fwAnimGlbs[mk])fwAnimGlbs[mk]=fwAnimB64(FW_ANIM_MODELLE[mk].daten());
    var buf=fwAnimGlbs[mk].slice().buffer;
    try{fr.contentWindow.postMessage({to:"fwanim",type:"init",glb:buf,clip:fr._fwAnim.clip,colors:fr._fwAnim.colors,neutral:"#B0B6BE"},"*",[buf]);}catch(e){}
  }else if(d.type==="ready"){fr.parentNode.classList.add("ready");}
  else if(d.type==="error"){var bx=fr.parentNode;bx.firstChild.textContent="3D-Animation konnte nicht geladen werden.";fr.remove();}
});
function closeExPage(){
  var af=document.querySelector("#exdpage .exanim-frame");if(af)af.remove();
  var page=$("exdpage");if(!page||page.hidden)return;
  page.hidden=true;
  showHiddenSheets(exPageBack);exPageBack=[];
  syncScrollLock();
}
// Übungsdetail: eigene Vollbildseite (kein Sheet mehr) – alle Bereiche (Muskeln, Verlauf,
// Fortschritt, Rekorde) stehen der Reihe nach untereinander, man sieht alles durch Scrollen statt
// über Tabs umschalten zu müssen.
function sheetExerciseDetail(ex){
  var page=$("exdpage");
  if(page.hidden){
    // Von aussen geoeffnet: eine offene Auswahl darunter nur ausblenden, damit "Zurueck"
    // genau dorthin zurueckfuehrt - mit Suchbegriff, Filter und Scrollposition.
    exPageBack=hideOpenSheets();
  }else{
    // Aus der Detailseite heraus (nach dem Bearbeiten): das Bearbeiten-Sheet gehoert
    // wirklich zu - es wird geschlossen, der Rueckweg bleibt der von vorhin.
    closeSheet2();closeSheet();
  }
  var kamVonListe=exPageBack.length>0;
  page.hidden=false;syncScrollLock();
  var head=$("exdpage-head");head.innerHTML="";
  var back=el("button","iconbtn");back.type="button";back.setAttribute("aria-label","Zurück");
  back.innerHTML=svgIcon(IC_CHEVLEFT,2.1);back.onclick=closeExPage;
  head.appendChild(back);
  head.appendChild(el("div","exdpage-title",ex.n));
  var infoBoxD=exInfoBlock(ex,true);
  var infoBtn=exInfoBtn(infoBoxD);infoBtn.classList.add("iconbtn");
  head.appendChild(infoBtn);
  var body=$("exdpage-body");body.innerHTML="";
  var pat=PATTERNS.find(function(p){return p.id===ex.pat;});
  var meta=[pat?pat.name:null,ex.e].filter(Boolean).join(" · ");
  if(meta)body.appendChild(el("p","note exd-meta",meta));
  body.appendChild(infoBoxD);
  // Rang dieser Uebung (Wappen, Titel, naechster Schritt) - nur bei Uebungen mit Kraftstandard.
  try{var xrk=exRank(ex);
    if(xrk)body.appendChild(rankCard(xrk,{eyebrow:"Dein Rang",hint:exRankHint(ex,xrk),ladderTitle:"Rangleiter · "+ex.n,ex:ex}));
    else if(ex.std){
      body.appendChild(el("p","note rk-none","Noch kein Rang – ein Satz in den letzten 90 Tagen stuft dich ein."));
      var rkBtn=el("button","btn ghost small","Werte je Stufe ansehen");rkBtn.type="button";rkBtn.style.margin="-6px 0 10px";
      rkBtn.onclick=function(){sheetRankLadder(null,"Rangleiter · "+ex.n,null,ex);};
      body.appendChild(rkBtn);
    }}catch(e){}
  if(ex.t==="load"||ex.t==="reps"||ex.t==="sec"){
    var rg=sugRange(ex),rgr=el("button","exd-range");rgr.type="button";
    rgr.appendChild(el("span",null,"Zielbereich"));
    rgr.appendChild(el("b",null,rg[0]+"–"+rg[1]+(ex.t==="sec"?" s":" Wdh.")));
    rgr.appendChild(el("span","exd-range-edit","ändern"));
    rgr.onclick=function(){sheetSugRange(ex,function(){sheetExerciseDetail(ex);});};
    body.appendChild(rgr);
  }
  var anim=exAnimBlock(ex);
  if(anim){body.appendChild(el("h2","sec","Bewegungsablauf in 3D"));body.appendChild(anim);}
  function redraw(){
    Array.prototype.slice.call(body.querySelectorAll(".exd-section")).forEach(function(n){n.remove();});
    function section(title,content){
      var h=el("h2","sec exd-section",title);body.appendChild(h);
      var c=el("div","exd-section");c.appendChild(content);body.appendChild(c);
    }
    // Bei Mobilitaetsuebungen ist die Aussage eine andere: rot heisst nicht "trainiert",
    // sondern "wird gedehnt" - bei den dynamischen "wird bewegt".
    section(ex.mob?(ex.mk==="dyn"?"Wird bewegt":"Wird gedehnt"):"Beanspruchte Muskeln",exDetailInfo(ex));
    var plus=exDetailPlus(ex);
    if(plus)section("Stärkt zusätzlich",plus);
    section("Verlauf",exDetailHistory(ex,redraw));
    section("Fortschritt",exDetailProgress(ex));
    section("Rekorde",exDetailRecords(ex));
    Array.prototype.forEach.call(body.querySelectorAll("svg[data-ex]"),fillExFig);
  }
  redraw();
  var edit=el("button","btn ghost block","Übung bearbeiten");edit.style.marginTop="18px";
  edit.onclick=function(){sheetEditExercise(ex,function(e2){sheetExerciseDetail(e2);});};
  body.appendChild(edit);
  if(ex.custom){
    var del=el("button","btn ghost block","Übung löschen");del.style.marginTop="8px";
    del.onclick=function(){
      if(customExInUse(ex.id)){toast("Schon verwendet – kann nicht gelöscht werden");return;}
      askConfirm("Übung löschen?","„"+ex.n+"“ wird aus deinem Übungskatalog entfernt.","Löschen",function(){removeCustomExercise(ex.id);closeExPage();openExerciseCatalog();},true);
    };
    body.appendChild(del);
  }
  if(!kamVonListe){
    // Kam man aus einer Auswahl, fuehrt "Zurueck" oben schon dorthin - dann waere ein
    // zweiter Knopf mit demselben Ziel nur verwirrend.
    var toList=el("button","btn ghost block","Zur Liste");toList.style.marginTop="8px";
    toList.onclick=function(){closeExPage();openExerciseCatalog();};
    body.appendChild(toList);
  }
  page.querySelector(".exdpage-scroll").scrollTop=0;
}
// Einen einzelnen bereits geloggten Satz (auch aus vergangenen Trainingstagen) nachträglich
// bearbeiten oder löschen – direkt aus dem Verlauf der Übungsdetailseite heraus.
function sheetEditLoggedSet(ex,date,setIdx,onChange){
  openSheet(function(b){
    sheetTitle(b,"Satz bearbeiten");
    b.appendChild(el("p","note",deDate(date)));
    var s=(state.days[date]||{}).sets&&state.days[date].sets[setIdx];
    if(!s){closeSheet();return;}
    var grid=el("div","grid2");grid.style.marginTop="10px";
    var kgF=null;
    if(ex.t==="load"){kgF=numField("Gewicht (kg)",s.kg,"2.5",0);grid.appendChild(kgF);}
    var unitLab=ex.t==="sec"?"Sekunden":"Wiederholungen";
    var repF=null,repLF=null,repRF=null;
    if(ex.uni){
      repLF=numField(unitLab+" links",s.repsL!=null?s.repsL:s.reps,"1",0);
      repRF=numField(unitLab+" rechts",s.repsR!=null?s.repsR:s.reps,"1",0);
      grid.appendChild(repLF);grid.appendChild(repRF);
    } else {
      repF=numField(unitLab,s.reps,"1",0);
      grid.appendChild(repF);
    }
    b.appendChild(grid);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var reps=ex.uni?Math.min(parseInt(repLF.input.value,10)||0,parseInt(repRF.input.value,10)||0):(parseInt(repF.input.value,10)||0);
      if(reps<=0)return;
      s.kg=kgF?(parseFloat(kgF.input.value)||0):0;
      s.reps=reps;
      if(ex.uni){s.repsL=parseInt(repLF.input.value,10)||0;s.repsR=parseInt(repRF.input.value,10)||0;}
            syncWorkoutRec(s,false);touch(date);saveLocal();closeSheet();renderAll();onChange();
    };
    b.appendChild(save);
    var del=el("button","btn ghost block","Satz löschen");del.style.marginTop="8px";
    del.onclick=function(){
      askConfirm("Satz löschen?","Dieser Satz vom "+deDate(date)+" wird entfernt.","Löschen",function(){
                syncWorkoutRec(state.days[date].sets.splice(setIdx,1)[0],true);touch(date);saveLocal();closeSheet();renderAll();onChange();
      },true);
    };
    b.appendChild(del);
    var cancel=el("button","btn ghost block","Abbrechen");cancel.style.marginTop="8px";
    cancel.onclick=closeSheet;
    b.appendChild(cancel);
  });
}
/* Mobilität eintragen: dieselbe Übungsauswahl, gleich auf Mobilität gefiltert. Jeder Satz zählt
   mit seinen Sekunden bzw. Wiederholungen auf die Minuten des Tages (siehe mobDay). */
function sheetMob(){
  openSheet(function(b){
    sheetTitle(b,"Mobilität eintragen");
    b.appendChild(el("p","note","Gehaltene Dehnungen und bewegte Übungen zählen gleich. "+MOB_UNIT_MIN+" Minuten am Tag sind eine volle Einheit."));
    exPicker(b,null,function(e){closeSheet();setTimeout(function(){sheetAddSet(e);},180);},{region:MOB_REGION,mob:true});
  });
}
function sheetAddSet(preEx){
  openSheet(function(b){
    if(!preEx){
      sheetTitle(b,"Übung wählen");
      exPicker(b,null,function(e){closeSheet();setTimeout(function(){sheetAddSet(e);},180);},{mob:true});
      return;
    }
    var ex=preEx;
    var infoBoxA=exInfoBlock(ex);
    sheetTitle(b,ex.n,exInfoBtn(infoBoxA));
    b.appendChild(infoBoxA);
    var last=bestFor(ex.id,TODAY,WIN_STRENGTH),lastSet=null;
    (day(TODAY).sets||[]).forEach(function(s){if(s.ex===ex.id)lastSet=s;});
    var info=el("div","calcout");b.appendChild(info);
    var kgF=null,grid=el("div","grid2");grid.style.marginTop="10px";
    if(ex.t==="load"){kgF=numField("Gewicht (kg)",lastSet?lastSet.kg:suggestedKg(ex,last.best),"2.5",0);grid.appendChild(kgF);}
    var unitLab=ex.t==="sec"?"Sekunden":"Wiederholungen";
    // Einseitig: links/rechts getrennt erfassen – Wertung/Fortschritt zählt die schwächere Seite.
    var repF=null,repLF=null,repRF=null;
    if(ex.uni){
      repLF=numField(unitLab+" links",lastSet?(lastSet.repsL!=null?lastSet.repsL:lastSet.reps):suggestedReps(ex,last.best),"1",0);
      repRF=numField(unitLab+" rechts",lastSet?(lastSet.repsR!=null?lastSet.repsR:lastSet.reps):suggestedReps(ex,last.best),"1",0);
      grid.appendChild(repLF);grid.appendChild(repRF);
    } else {
      repF=numField(unitLab,lastSet?lastSet.reps:suggestedReps(ex,last.best),"1",0);
      grid.appendChild(repF);
    }
    b.appendChild(grid);
    function curReps(){
      if(ex.uni){var l=parseInt(repLF.input.value,10)||0,r=parseInt(repRF.input.value,10)||0;return Math.min(l,r);}
      return parseInt(repF.input.value,10)||0;
    }
    function upd(){
      var kg=kgF?(parseFloat(kgF.input.value)||0):0,reps=curReps();
      if(ex.t==="load"){var v=e1rm(effectiveKg(ex,kg),reps),g=grade(ex,v);
        info.innerHTML="Geschätztes Einer-Maximum <b>"+Math.round(v*2)/2+" kg</b>"+(g?"<br>Stufe <b>"+g.name+"</b>"+(g.next?" · nächste ab "+fmtVal(g.next,ex.t):""):"");
      }else{var g2=grade(ex,reps);
        info.innerHTML="<b>"+reps+" "+unitOf(ex.t)+"</b>"+(g2?"<br>Stufe <b>"+g2.name+"</b>"+(g2.next?" · nächste ab "+fmtVal(g2.next,ex.t):""):"");}
    }
    [kgF,repF,repLF,repRF].forEach(function(f){if(f)f.input.addEventListener("input",upd);});upd();
    // Reserve vorbelegen mit dem, was beim letzten Satz derselben Uebung gewaehlt war -
    // innerhalb einer Uebung bleibt die Anstrengung meist aehnlich.
    var curRir=(lastSet&&lastSet.rir!=null)?lastSet.rir:null;
    b.appendChild(rirField(curRir,function(v){curRir=v;}));
    var save=el("button","btn primary block","Satz speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var reps=curReps();if(reps<=0)return;
      var rec={ex:ex.id,kg:kgF?(parseFloat(kgF.input.value)||0):0,reps:reps,ts:Date.now()};
      if(curRir!=null)rec.rir=curRir;
      if(ex.uni){rec.repsL=parseInt(repLF.input.value,10)||0;rec.repsR=parseInt(repRF.input.value,10)||0;}
      day(TODAY).sets.push(rec);
      touch(TODAY);closeSheet();renderAll();
    };
    b.appendChild(save);
    var again=el("button","btn ghost block","Andere Übung");again.style.marginTop="8px";
    again.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(null);},180);};
    b.appendChild(again);
  });
}
function sheetCardio(wid,presetExId){
  openSheet(function(b){
    sheetTitle(b,"Ausdauer eintragen");
    var sel=document.createElement("select");
    EX.filter(function(e){return e.t==="cardio";}).forEach(function(e){
      var o=document.createElement("option");o.value=e.id;o.textContent=e.n+" · "+e.intens;sel.appendChild(o);});
    if(presetExId)sel.value=presetExId;else if(state.profile.cardioPick)sel.value=state.profile.cardioPick;
    var f=el("div","field");f.appendChild(el("label",null,"Aktivität"));f.appendChild(sel);b.appendChild(f);
    // Dieselbe Figur + Beanspruchungsliste wie bei einer Kraftuebung (exDetailInfo) - zeigt,
    // welche Muskeln diese Ausdaueraktivitaet trainiert. Aktualisiert sich beim Wechseln der
    // Aktivitaet mit (drawMus), statt fest auf die zuerst gewaehlte Uebung stehen zu bleiben.
    var musWrap=el("div");b.appendChild(musWrap);
    function drawMus(){
      musWrap.innerHTML="";
      var ex=exById(sel.value);if(!ex)return;
      var figs=woFigs(ex);figs.classList.add("exdetail-figs");musWrap.appendChild(figs);
      musWrap.appendChild(woMus(ex,figs));
      Array.prototype.forEach.call(musWrap.querySelectorAll("svg[data-ex]"),fillExFig);
    }
    drawMus();
    var grid=el("div","grid2");grid.style.marginTop="10px";
    var minF=numField("Minuten",30,"5",0),kmF=numField("Kilometer (optional)",0,"0.5",0);
    grid.appendChild(minF);grid.appendChild(kmF);b.appendChild(grid);
    var out=el("div","calcout");b.appendChild(out);
    function upd(){
      var ex=exById(sel.value),min=parseFloat(minF.input.value)||0,f2=INTENS[(ex&&ex.intens)||"mittel"];
      out.innerHTML="Zählt als <b>"+Math.round(min*f2)+" Äquivalentminuten</b> auf dein Wochenziel von "+state.profile.goals.cardio+" min.";
    }
    sel.onchange=function(){upd();drawMus();};minF.input.addEventListener("input",upd);upd();
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var min=parseFloat(minF.input.value)||0;if(min<=0)return;
      var rec={ex:sel.value,min:min,km:parseFloat(kmF.input.value)||0};
      if(wid)rec.wid=wid;
      day(TODAY).cardio.push(rec);
      state.profile.cardioPick=sel.value;touch(TODAY);closeSheet();renderAll();
    };
    b.appendChild(save);
  });
}
function sheetNote(dateKey){
  dateKey=dateKey||TODAY;
  openSheet(function(b){
    sheetTitle(b,dateKey===TODAY?"Notiz zum Tag":"Notiz zum "+deDate(dateKey));
    var ta=document.createElement("textarea");ta.value=day(dateKey).note||"";ta.placeholder="Wie lief es? Was war schwer, was ging leicht?";
    b.appendChild(ta);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="12px";
    save.onclick=function(){day(dateKey).note=ta.value;touch(dateKey);closeSheet();renderAll();};
    b.appendChild(save);
  });
}
function sheetActions(){
  openSheet(function(b){
    sheetTitle(b,"Was willst du tun?");
    var d=day(TODAY),list=el("div");list.style.margin="0 -16px";
    function row(title,sub,fn,primary){
      var r=el("div","row tap"),m=el("div","main");
      m.appendChild(el("b",null,title));if(sub)m.appendChild(el("span",null,sub));r.appendChild(m);
      var c=el("span","chev");c.innerHTML=svgIcon(IC_CHEV);r.appendChild(c);r.onclick=fn;
      if(primary)r.style.background="color-mix(in srgb,var(--accent) 8%,var(--surface))";
      list.appendChild(r);
    }
    if(workout){row("Zurück zum laufenden Training",workout.name+" · "+fmtDur(woElapsed()),function(){closeSheet();selectTab("tab-training");window.scrollTo(0,0);},true);}
    else{
      row("Training starten","Leeres Training – Übungen fügst du unterwegs hinzu",function(){closeSheet();startWorkout(null);},true);
      var ids=Object.keys(state.routines);
      ids.forEach(function(id){var r=state.routines[id];
        row(r.name,"Aus dem Plan · "+r.items.length+" Übungen",function(){closeSheet();startWorkout(id);});});
    }
    list.appendChild(el("div","sheet-sep"));
    row("Einzelnen Satz eintragen","Ohne Training, z. B. nachgetragen",function(){closeSheet();setTimeout(function(){sheetAddSet(null);},180);});
    row("Ausdauer","Laufen, Rad, Rudern – zählt auf die Wochenminuten",function(){closeSheet();setTimeout(sheetCardio,180);});
    row("Mobilität eintragen","Dehnen und Mobilisieren – "+MOB_UNIT_MIN+" min sind eine volle Einheit",function(){closeSheet();setTimeout(sheetMob,180);});
    row("Notiz","Was heute los war",function(){closeSheet();setTimeout(sheetNote,180);});
    b.appendChild(list);
  });
}
