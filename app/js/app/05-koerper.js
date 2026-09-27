/* ==========================================================
   app/05-koerper.js - Heute-Tab (Ring, Woche, Tagesliste) und Koerper-Tab (Auswahl, Volumen-Legende, Muskel-Details)
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Rendering ================= */
function renderRing(c,peak){
  var R=50,C=2*Math.PI*R,cx=60,cy=60,SW=9;
  var s='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="var(--sunken)" stroke-width="'+SW+'"/>';
  // Ein Segment je Bereich (Kraft/Konstanz/Abdeckung/Ausdauer/Mobilität), Länge = tatsächlicher
  // gewichteter Beitrag zum Formwert. Kleine Lücken zwischen den Segmenten lassen den Ring ruhiger
  // wirken und machen die Anteile lesbar, ohne dass eine Legende nötig wäre.
  var offset=0,GAP=2.2;
  SKILLDEF.forEach(function(sk){
    var contrib=clamp(sk.w*(c[sk.key]||0),0,100);
    if(contrib<=0.05)return;
    var len=C*contrib/100,draw=Math.max(len-GAP,0.6);
    s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+R+'" fill="none" stroke="'+sk.color+'" stroke-width="'+SW+'" stroke-dasharray="'+draw.toFixed(1)+' '+C.toFixed(1)+'" stroke-dashoffset="'+(-offset).toFixed(1)+'" transform="rotate(-90 '+cx+' '+cy+')"/>';
    offset+=len;
  });
  // Bestform als feine Marke auf dem Ring
  if(peak>2){
    var a=(peak/100)*2*Math.PI-Math.PI/2;
    s+='<line x1="'+(cx+(R-7)*Math.cos(a)).toFixed(1)+'" y1="'+(cy+(R-7)*Math.sin(a)).toFixed(1)+'" x2="'+(cx+(R+7)*Math.cos(a)).toFixed(1)+'" y2="'+(cy+(R+7)*Math.sin(a)).toFixed(1)+'" stroke="var(--ink)" stroke-width="2" stroke-linecap="round" opacity="0.55"/>';
  }
  s+='<text x="60" y="57" text-anchor="middle" font-family="var(--f-body)" font-size="10.5" font-weight="600" fill="var(--ink-3)">Bestform</text>';
  s+='<text x="60" y="73" text-anchor="middle" font-family="var(--f-mono)" font-size="14" font-weight="600" fill="var(--ink)">'+(peak>0?Math.round(peak):"–")+'</text>';
  $("ring").innerHTML=s;
}
/* Sprung auf einen bestimmten Tag. In die Zukunft geht es nicht - dort gibt es nichts zu
   sehen, und ein leerer Tag waere nur verwirrend. */
function gotoHeuteDate(d){
  if(d>TODAY)d=TODAY;
  if(d===heuteDate)return;
  heuteDate=d;
  renderHeuteDay();
}
/* Einen anderen Tag anzeigen, ohne dass die Seite springt. Frueher wurde die Tagesliste
   geleert und neu aufgebaut - die Seite war dabei kurz kuerzer, der Browser hat die
   Scrollposition nach oben korrigiert, und man landete woanders als vorher. Jetzt:
   1) die Liste behaelt kurz ihre bisherige Hoehe (min-height), bis der neue Inhalt steht,
   2) der Wochenstreifen bleibt genau an derselben Stelle auf dem Bildschirm (Anker),
   3) der Fokus bleibt auf dem Wochenstreifen statt irgendwo im Dokument. */
var dayHoldT=null;
function heuteScrollBy(dy){
  if(Math.abs(dy)<0.5)return;
  try{window.scrollBy({top:dy,left:0,behavior:"instant"});}catch(e){window.scrollBy(0,dy);}
}
function renderHeuteDay(){
  var ws=$("weekstrip"),lst=$("todaylist");
  var a0=ws?ws.getBoundingClientRect().top:0;
  var hadFocus=!!(ws&&document.activeElement&&ws.contains(document.activeElement));
  if(dayHoldT){clearTimeout(dayHoldT);dayHoldT=null;}
  if(lst&&!lst.style.minHeight)lst.style.minHeight=lst.offsetHeight+"px";
  renderHero(heuteDate===TODAY?lastC:compute(heuteDate),state.profile.peaks||{});
  renderWeek();renderToday();
  $("fab").hidden=(tab!=="tab-heute")||(heuteDate!==TODAY);
  if(ws)heuteScrollBy(ws.getBoundingClientRect().top-a0);
  if(hadFocus){var v=ws.querySelector(".wd.viewing");if(v){try{v.focus({preventScroll:true});}catch(e){}}}
  // Sobald der neue Tag steht (Figuren nachgeladen), die Platzhalter-Hoehe wieder freigeben -
  // auch dabei den Wochenstreifen an seiner Stelle halten.
  dayHoldT=setTimeout(function(){
    dayHoldT=null;if(!lst)return;
    var a1=ws?ws.getBoundingClientRect().top:0;
    lst.style.minHeight="";
    if(ws)heuteScrollBy(ws.getBoundingClientRect().top-a1);
  },1500);
}
function renderWeek(){
  var box=$("weekstrip");box.innerHTML="";
  var pv=$("wkprev"),nx=$("wknext");
  if(pv&&!pv.dataset.wired){
    pv.dataset.wired="1";pv.innerHTML=svgIcon(IC_CHEVLEFT);
    pv.onclick=function(){gotoHeuteDate(shiftDays(heuteDate,-7));};
    nx.innerHTML=svgIcon(IC_CHEV);
    nx.onclick=function(){gotoHeuteDate(shiftDays(heuteDate,7));};
  }
  if(nx)nx.disabled=(shiftDays(heuteDate,7)>TODAY);
  // Der Streifen zeigt immer die Woche des gerade angezeigten Tages (heuteDate) – wischt man ein
  // paar Tage zurück in die Vorwoche, wandert der Streifen mit, statt den Tag zu verlieren.
  // Der echte Kalendertag bleibt zusätzlich per eigener Markierung erkennbar.
  var off=(parseIso(heuteDate).getDay()+6)%7;
  for(var i=0;i<7;i++){
    var d=shiftDays(heuteDate,i-off),dd=state.days[d];
    // Im Kreis stehen nur Kraftsätze; Mobilitätsübungen zeigt der grüne Punkt darunter.
    var sets=dd?(dd.sets||[]).filter(function(s){var e=exById(s.ex);return !e||!e.mob;}).length:0,
        mobd=mobDay(dd).units>0,cardio=dd?(dd.cardio||[]).length:0;
    var w=el("button","wd"+(sets?" done":"")+(mobd?" mob":"")+(d===TODAY?" today":"")+(d===heuteDate?" viewing":""));
    w.type="button";
    w.appendChild(el("b",null,WD[parseIso(d).getDay()]));
    // Im Kreis steht die Satzzahl, ohne Training das Datum - so bleibt jeder Tag lesbar,
    // und Training ist nicht nur an der Farbe erkennbar.
    var pip=el("div","pip");pip.textContent=sets?sets:String(parseIso(d).getDate());
    if(!sets)pip.classList.add("wd-date");
    w.appendChild(pip);
    var mk=el("div","wd-marks");
    if(mobd)mk.appendChild(el("i","m"));
    if(cardio)mk.appendChild(el("i","c"));
    w.appendChild(mk);
    var lab=deDate(d)+": "+(sets?sets+" Sätze":"kein Training")+(mobd?", Mobilität":"")+(cardio?", Ausdauer":"");
    w.setAttribute("aria-label",lab);
    if(d===heuteDate)w.setAttribute("aria-current","date");
    (function(dd2,w2){
      if(dd2>TODAY){w2.disabled=true;w2.style.opacity=".4";w2.style.cursor="default";return;}
      w2.onclick=function(){gotoHeuteDate(dd2);};
    })(d,w);
    box.appendChild(w);
  }
  renderWeekGoals();
}

/* Wochenziele der angezeigten Woche (Mo–So): Trainingstage, Mobilität, Ausdauerminuten.
   Dieselben Ziele wie in den Einstellungen - nur als Fortschritt statt als Zahl. */
function weekStats(ref){
  var off=(parseIso(ref).getDay()+6)%7,o={train:0,mob:0,cardio:0,start:shiftDays(ref,-off)};
  o.end=shiftDays(o.start,6);
  for(var i=0;i<7;i++){var k=shiftDays(o.start,i),dd=state.days[k];if(!dd)continue;
    if(isTrainDay(dd))o.train++;
    o.mob+=mobDay(dd).units;
    (dd.cardio||[]).forEach(function(cc){o.cardio+=cc.min||0;});
  }
  return o;
}

function renderWeekGoals(){
  var box=$("weekgoals");if(!box||!state.profile)return;box.innerHTML="";
  var w=weekStats(heuteDate),g=state.profile.goals||{};
  var ws=$("weeksum");if(ws)ws.textContent=shortDate(w.start)+" – "+shortDate(w.end);
  // Mobilität in Einheiten mit einer Nachkommastelle: 5 Minuten sind eine halbe Einheit.
  var mobU=Math.round(w.mob*10)/10;
  [["Training",w.train,g.days||0," Tage"],["Mobilität",mobU,g.mob||0,"×"],["Ausdauer",Math.round(w.cardio),g.cardio||0," min"]].forEach(function(r){
    var row=el("div","wg"),ok=r[2]>0&&r[1]>=r[2];
    row.appendChild(el("b",null,r[0]));
    var v=el("span",ok?"ok":null,(ok?"✓ ":"")+String(r[1]).replace(".",",")+" / "+r[2]+r[3]);row.appendChild(v);
    var bar=el("div","pbar"+(ok?" good":"")),fi=el("i");
    fi.style.width=(r[2]>0?clamp(100*r[1]/r[2],0,100):0)+"%";bar.appendChild(fi);
    bar.setAttribute("role","progressbar");bar.setAttribute("aria-label",r[0]);
    bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax",String(r[2]));bar.setAttribute("aria-valuenow",String(r[1]));
    row.appendChild(bar);box.appendChild(row);
  });
}
function renderToday(){
  // Zeigt den gerade per Wischgeste ausgewählten Tag (heuteDate), nicht zwingend den echten
  // Kalendertag. Für den echten heutigen Tag bleibt alles editierbar wie gewohnt (Satz
  // ergänzen/löschen per Icon, "Training starten" über den FAB); an einem früheren Tag gibt es
  // keinen FAB und einzelne Sätze werden – wie im Tages-Detail – per Antippen bearbeitet, damit
  // nichts aus Versehen dem falschen Tag zugeordnet wird.
  // Aufbau: je Tagesbereich eine eigene Karte (Training, Ausdauer, Mobilität, Notiz), damit man
  // auf einen Blick sieht, was erledigt ist und was noch fehlt.
  var viewingToday=(heuteDate===TODAY);
  var dateKey=heuteDate,d=day(dateKey),box=$("todaylist");box.innerHTML="";
  function secCard(key,title,meta,icon){
    var c=el("div","card dsec dsec-"+key),h=el("div","dsec-head");
    var ic=el("span","dsec-ic");ic.innerHTML=svgIcon(icon,1.9);h.appendChild(ic);
    h.appendChild(el("b",null,title));
    if(meta)h.appendChild(el("span","dsec-meta",meta));
    c.appendChild(h);var body=el("div","dsec-body");c.appendChild(body);box.appendChild(c);
    return body;
  }
  function estate(title,text,btns){
    var e=el("div","estate");e.appendChild(el("b",null,title));if(text)e.appendChild(el("p",null,text));
    if(btns&&btns.length){var br=el("div","btnrow");
      btns.forEach(function(bd){var b=el("button","btn small "+(bd[2]?"primary":"ghost"),bd[0]);b.type="button";b.onclick=bd[1];br.appendChild(b);});
      e.appendChild(br);}
    return e;
  }
  // Sätze, die zu einem geloggten Training gehören, werden hier NICHT mehr einzeln aufgelistet –
  // die Trainingskarte fasst sie zusammen, Details gibt's per Antippen auf der eigenen Seite.
  // Nur "lose" (ohne Training) protokollierte Sätze erscheinen weiterhin direkt in der Liste.
  var wIds={};(d.workouts||[]).forEach(function(wo){wIds[wo.id]=true;});
  // Lose Mobilitätsübungen stehen in der Mobilitätskarte, nicht beim Training.
  var groups={},order=[],mobOrder=[];
  d.sets.forEach(function(s,i){if(s.wid&&wIds[s.wid])return;if(!groups[s.ex]){groups[s.ex]=[];var ex0=exById(s.ex);(ex0&&ex0.mob?mobOrder:order).push(s.ex);}groups[s.ex].push({s:s,i:i});});

  /* ---- Training ---- */
  var nWo=(d.workouts||[]).length,nSets=d.sets.filter(function(s){var e=exById(s.ex);return !e||!e.mob||(s.wid&&wIds[s.wid]);}).length;
  var tb=secCard("training","Training",nSets?(nSets+" Sätze"+(nWo?" · "+nWo+(nWo===1?" Einheit":" Einheiten"):"")):null,"M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12");
  // Dieselbe Vorder-/Rückfigur wie früher im separaten Tages-Detail-Sheet: alle an diesem Tag
  // trainierten Muskeln auf einen Blick.
  var hasStrength=d.sets.some(function(s){var ex=exById(s.ex);return ex&&ex.t!=="cardio"&&!ex.mob;});
  var figs=null;
  if(hasStrength){figs=dayFigs(dateKey);tb.appendChild(figs);}
  (d.workouts||[]).slice().reverse().forEach(function(wo){
    var wr=el("div","row tap"),wm=el("div","main");
    wm.appendChild(el("b",null,wo.name));wm.appendChild(el("span",null,fmtDur(wo.dur)+" · "+wo.exs+" Übungen · "+wo.sets+" Sätze"+(wo.vol?" · "+wo.vol+" kg":"")+(wo.cardioMin?" · "+wo.cardioMin+" min Ausdauer":"")));
    wr.appendChild(wm);wr.appendChild(el("span","pill l2","✓ fertig"));
    var wdel=el("button","iconbtn");wdel.setAttribute("aria-label","Training löschen");wdel.innerHTML=svgIcon(IC_TRASH,1.6);
    wdel.onclick=function(ev){ev.stopPropagation();confirmDeleteWorkout(dateKey,wo);};wr.appendChild(wdel);
    var ch2=el("span","chev");ch2.innerHTML=svgIcon(IC_CHEV);wr.appendChild(ch2);
    wr.onclick=function(){sheetWorkoutDetail(dateKey,wo);};
    tb.appendChild(wr);
  });
  function exRows(ord,target){ord.forEach(function(exid){
    var ex=exById(exid);if(!ex)return;
    var arr=groups[exid],r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,ex.n));
    if(viewingToday){
      m.appendChild(el("span",null,arr.map(function(o){return setLabel(ex,o.s);}).join("  ·  ")));
    } else {
      var line=el("div","exd-hsets");
      arr.forEach(function(o){
        var chip=el("button","exd-hset",setLabel(ex,o.s));chip.type="button";
        chip.setAttribute("aria-label","Satz bearbeiten");
        chip.onclick=function(ev){ev.stopPropagation();
          sheetEditLoggedSet(ex,dateKey,o.i,function(){setTimeout(function(){renderToday();},180);});
        };
        line.appendChild(chip);
      });
      m.appendChild(line);
    }
    r.appendChild(m);
    var best=bestFor(exid,dateKey,WIN_STRENGTH);
    var tbv=Math.max.apply(null,arr.map(function(o){return setValue(ex,o.s);}));
    // Bei Dehnungen ist längeres Halten kein Rekord, den man feiern müsste.
    if(!ex.mob&&best.best!=null&&tbv>=best.best-0.01)r.appendChild(el("span","pill pr","Best"));
    if(viewingToday){
      var add=el("button","iconbtn");add.setAttribute("aria-label","Satz ergänzen");add.innerHTML=svgIcon("M12 5v14M5 12h14",2);
      add.onclick=function(){sheetAddSet(ex);};r.appendChild(add);
      var del=el("button","iconbtn");del.setAttribute("aria-label","Letzten Satz löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      // Dieser Papierkorb sitzt direkt neben dem "+"-Button zum Ergänzen eines Satzes – ohne
      // Rückfrage wäre ein Vertipper hier ein echter, sofortiger Verlust eines bereits geloggten
      // Satzes.
      del.onclick=function(){var idx=arr[arr.length-1].i;
        askConfirm("Letzten Satz löschen?",ex.n+" · "+setLabel(ex,d.sets[idx])+" wird entfernt.","Löschen",function(){
                    syncWorkoutRec(d.sets.splice(idx,1)[0],true);touch(dateKey);renderAll();
        },true);};r.appendChild(del);
    }
    target.appendChild(r);
  });}
  exRows(order,tb);
  if(!nWo&&!order.length){
    if(viewingToday&&!workout){
      tb.appendChild(estate("Heute noch kein Training","Starte eine deiner Einheiten oder trainiere frei – jeder Satz landet automatisch hier.",
        [["Training starten",function(){selectTab("tab-training");window.scrollTo(0,0);},true],
         ["Satz nachtragen",function(){sheetAddSet(null);},false]]));
    } else if(viewingToday){
      tb.appendChild(el("p","estate-quiet","Dein Training läuft – abgehakte Sätze erscheinen hier."));
    } else {
      tb.appendChild(el("p","estate-quiet","An diesem Tag kein Krafttraining eingetragen."));
    }
  }
  if(figs)Array.prototype.forEach.call(figs.querySelectorAll("svg[data-day]"),fillDayFig);

  /* ---- Ausdauer ---- */
  var mins=0;d.cardio.forEach(function(c){mins+=c.min||0;});
  var cb=secCard("cardio","Ausdauer",mins?mins+" min":null,"M12 8v4l3 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z");
  d.cardio.forEach(function(c,i){
    var ex=exById(c.ex),r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,ex?ex.n:c.ex));m.appendChild(el("span",null,c.min+" Minuten"+(c.km?" · "+c.km+" km":"")));
    r.appendChild(m);
    if(viewingToday){
      var del=el("button","iconbtn");del.setAttribute("aria-label","Löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      del.onclick=function(){
        askConfirm("Eintrag löschen?",(ex?ex.n:c.ex)+" · "+c.min+" Minuten wird entfernt.","Löschen",function(){
                    dropWorkoutCardio(d.cardio.splice(i,1)[0]);touch(dateKey);renderAll();
        },true);};r.appendChild(del);
    }
    cb.appendChild(r);
  });
  if(!d.cardio.length){
    if(viewingToday)cb.appendChild(estate("Noch keine Ausdauer","Laufen, Rad oder Rudern zählt auf deine Wochenminuten.",
      [["Ausdauer eintragen",function(){sheetCardio();},false]]));
    else cb.appendChild(el("p","estate-quiet","Keine Ausdauer an diesem Tag."));
  }

  /* ---- Mobilität: kein Schalter mehr, sondern gemessen aus den eingetragenen Übungen ---- */
  var md=mobDay(d),mfull=md.units>=1;
  var MOB_IC="M4 17c4-8 12-8 16 0M8 13.5V10M16 13.5V10M12 12V7";
  var mtxt=md.exs?Math.round(md.min)+" min · "+md.exs+(md.exs===1?" Übung":" Übungen"):md.legacy?"abgehakt":null;
  if(mobOrder.length){
    // Mit eingetragenen Übungen: Karte wie beim Training, darunter die Übungen selbst.
    var mb0=secCard("mob","Mobilität",mtxt,MOB_IC);
    if(md.units>0)mb0.parentNode.classList.add("on");
    var pr=el("div","mobprog"),pb=el("div","minibar"),pbi=el("i");
    pbi.style.width=Math.round(md.units*100)+"%";pbi.style.background="var(--good)";pb.appendChild(pbi);
    pr.appendChild(pb);pr.appendChild(el("span",null,mfull?"✓ volle Einheit":Math.round(md.units*100)+" % einer Einheit · noch "+Math.max(1,Math.ceil(MOB_UNIT_MIN-md.min))+" min"));
    mb0.appendChild(pr);
    exRows(mobOrder,mb0);
    if(viewingToday){var mob2=el("button","btn ghost small mobmore","+ Mobilität eintragen");mob2.type="button";mob2.onclick=function(){sheetMob();};mb0.appendChild(mob2);}
  } else {
    var mr=el("div","card dsec dsec-inline dsec-mob"+(md.units>0?" on":""));
    var mic=el("span","dsec-ic");mic.innerHTML=svgIcon(MOB_IC,1.9);mr.appendChild(mic);
    var mm=el("div","main");
    mm.appendChild(el("b",null,"Mobilität"));
    mm.appendChild(el("span",null,mtxt||(viewingToday?"noch nichts – "+MOB_UNIT_MIN+" min sind eine volle Einheit":"keine Mobilität")));
    mr.appendChild(mm);
    if(viewingToday){
      mr.setAttribute("role","button");mr.tabIndex=0;mr.setAttribute("aria-label","Mobilität eintragen");
      var madd=el("span","chev");madd.innerHTML=svgIcon("M12 5v14M5 12h14",2);mr.appendChild(madd);
      mr.onclick=function(){sheetMob();};
      mr.onkeydown=function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();mr.onclick();}};
    }
    box.appendChild(mr);
  }

  /* ---- Tagesnotiz ---- */
  var nr=el("div","card dsec dsec-inline dsec-note");nr.setAttribute("role","button");nr.tabIndex=0;
  var nic=el("span","dsec-ic");nic.innerHTML=svgIcon("M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h5",1.8);nr.appendChild(nic);
  var nm=el("div","main");
  nm.appendChild(el("b",null,"Notiz"));nm.appendChild(el("span",null,(d.note||"").trim()||"noch nichts notiert"));
  nr.appendChild(nm);var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);nr.appendChild(ch);
  nr.onclick=function(){sheetNote(dateKey);};
  nr.onkeydown=function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();sheetNote(dateKey);}};
  box.appendChild(nr);

  var sumParts=[];if(nSets||!(mins||md.min>=1))sumParts.push(nSets+" Sätze");if(mins)sumParts.push(mins+" min");
  if(md.min>=1)sumParts.push(Math.round(md.min)+" min Mobilität");
  $("todaysum").textContent=sumParts.join(" · ");
  var lbl=$("todaylabel");if(lbl)lbl.textContent=viewingToday?"Heute":deDate(dateKey);
  $("fab").hidden=(tab!=="tab-heute")||!viewingToday;
}
var selFine=null, selSet=null, selLabel=null;   // selSet: Liste von Feinmuskeln (Region/Gruppe), selFine: einzelner Muskel
var selTapKey=null;   // merkt sich den zuletzt im 3D-Modell angetippten Mesh-Namen, fuer zuverlaessiges Ab-/Anwaehlen

/* Betonung: welche Übungen einen bestimmten Muskelanteil besonders treffen */
var EMPH={
 clavicular_head_of_pectoralis_major:["bench_inc","bench_inc_db","pushup_dec","pike_pushup"],
 sternocostal_head_of_pectoralis_major:["bench","bench_db","pushup","machine_press","fly_db","cable_fly","pushup_arch"],
 abdominal_part_of_pectoralis_major:["bench_dec","dips","dips_bench"],
 long_head_of_triceps_brachii:["tri_over","tri_skull","dips","pullover"],
 lateral_head_of_triceps_brachii:["tri_push","tri_kick","pushup_diamond"],
 medial_head_of_triceps_brachii:["bench","ohp","tri_push","pushup_diamond"],
 vastus_medialis:["squat","squat_front","legext","squat_pistol"],
 vastus_lateralis:["legpress","hacksquat","squat","squat_bulg"],
 rectus_femoris:["legext","sissy","lunge","stepup","stepup_bw"],
 long_head_of_biceps_femoris:["legcurl","nordic","deadlift_rdl"],
 semitendinosus:["deadlift_rdl","goodmorning","deadlift_sl"],
 semimembranosus:["deadlift_rdl","goodmorning","legcurl"],
 medial_head_of_gastrocnemius:["calf_stand","calf_bw","jumprope"],
 lateral_head_of_gastrocnemius:["calf_stand","calf_bw"],
 soleus:["calf_seat"],
 gluteus_maximus:["hipthrust","squat","deadlift","gluteBridge","deadlift_sumo"],
 gluteus_medius:["abduct","squat_bulg","deadlift_sl","lunge","clamshell","sidelying_raise","bandwalk_lat","stepup","stepup_bw"],
 gluteus_minimus:["clamshell","sidelying_raise","bandwalk_lat"],
 tfl:["sidelying_raise","bandwalk_lat"],
 piriformis:["clamshell"],
 rectus_abdominis:["crunch","cablecrunch","situp","abwheel","legraise","kneeraise","lsit","hollow","dragonflag","deadbug"],
 transversus_abdominis:["plank","sideplank","hollow","deadbug","pallof"],
 sternocleidomastoid:["neck_flex_bw","neck_side_bw"],
 splenius_capitis:["neck_ext_bw","neck_harness","neck_bridge","neck_curl"],
 infraspinatus:["facepull","cuban","bandpullapart","reversefly"],
 teres_major:["pullup","latpull","pullup_wide"],
 clavicular_part_of_deltoid:["ohp","ohp_db","frontraise","bench_inc"],
 flexor_carpi_radialis:["wrist_curl","farmers"],
 ulnar_head_of_flexor_carpi_ulnaris:["deadhang","farmers","ricebucket"],
 brachioradialis:["curl_hammer","row_bb","fatgripz"],
 extensor_carpi_radialis_longus:["fatgripz","wrist_curl"],
 iliacus:["hipflex_cable","legraise","kneeraise"],
 psoas_major:["hipflex_cable","legraise","kneeraise"],
 sartorius:["hipflex_cable"],
 subscapularis:["rot_internal"],
 supraspinatus:["emptycan"]
};
function emphasisSets(fineId,asOf){
  var list=EMPH[fineId];if(!list)return null;
  var from=shiftDays(asOf,-(WIN_BODY-1)),n=0;
  for(var d in state.days){if(d<from||d>asOf)continue;
    (state.days[d].sets||[]).forEach(function(st){if(list.indexOf(st.ex)>=0)n++;});}
  return n;
}
function zoneLabel(z){return z===0?"zu wenig":z===1?"im Korridor":"über Limit";}
function zonePill(z){return z===0?"v0":z===1?"v1":"v2";}
function fineIdsOfGroups(ids){var out=[];for(var k in FINE){var f=FINE[k];
  if(ids.indexOf(f.g)>=0||(f.g2&&f.g2.some(function(g){return ids.indexOf(g)>=0;})))out.push(k);}
  return out;}
/* Verlauf der Auswahl, damit man aus einer Detailebene wieder herauskommt. Gespeichert wird
   der komplette Auswahlzustand, nicht nur ein Name - sonst laesst er sich nicht exakt
   wiederherstellen. Einstiegspunkte (Chip, Regionszeile, Tippen auf die Figur) leeren den
   Verlauf: von dort beginnt ein neuer Weg. */
var selHistory=[];
/* Welche Gruppe / welcher Feinmuskel im Detailkasten aufgeklappt ist. Getrennt von der
   eigentlichen Auswahl, damit die Liste stehen bleibt - die Figur zeigt trotzdem die
   tiefste offene Ebene, sonst wuerde das Aufklappen am Modell nichts bewirken. */
var expGroup=null, expFine=null;
function effFine(){return expFine||selFine;}
function effSet(){
  if(expFine)return [expFine];
  if(expGroup&&selSet)return selSet.filter(function(k){return FINE[k]&&FINE[k].g===expGroup;});
  return selSet;
}
function selReset(){selHistory=[];expGroup=null;expFine=null;}
function selNameOf(x){
  if(x.f&&FINE[x.f])return FINE[x.f].la;
  return x.l||"Übersicht";
}
function renderBodySel(){
  if(!lastC)return;
  renderBody(lastC.ms);
}
function selBack(){
  if(!selHistory.length)return;
  var x=selHistory.pop();
  selFine=x.f;selSet=x.s;selLabel=x.l;selMuscle=x.m;selTapKey=x.t;
  renderBodySel();
}
function backBar(){
  if(!selHistory.length)return null;
  var b=el("button","backbar");b.type="button";
  b.innerHTML=svgIcon(IC_CHEVLEFT);
  b.appendChild(el("span",null,selNameOf(selHistory[selHistory.length-1])));
  b.onclick=function(ev){ev.stopPropagation();selBack();};
  return b;
}
function selectRegion(rg){selFine=null;selSet=fineIdsOfGroups(rg.ids);selLabel=rg.name;selMuscle=rg.ids[0];selTapKey=null;}

// Zeigt in der Legende, wo der ausgewaehlte Muskel aktuell auf der Skala steht.
function updateVolLegend(ms){
  var selFine=effFine(),selSet=effSet();   // lokale Sicht auf die offene Ebene
  var pins=$("vlpins"),lab=$("vlsel");
  if(!pins||!lab)return;
  pins.innerHTML="";lab.innerHTML="";lab.hidden=true;
  var ids=[];
  if(selFine&&FINE[selFine])ids=[FINE[selFine].g];
  else if(selSet)selSet.forEach(function(k){var g=FINE[k]&&FINE[k].g;if(g&&ids.indexOf(g)<0)ids.push(g);});
  if(!ids.length)return;
  var pos=[],reiz=[];
  ids.forEach(function(id){
    var m=muscleById(id);if(!m)return;
    pos.push(clamp(volLegendPos(ms[id]||0,m),0,100));
    reiz.push(reizOf(ms[id]||0,m));
  });
  if(!pos.length)return;
  var single=pos.length===1,text,mark;
  if(single){
    var m1=muscleById(ids[0]),v1=Math.round((ms[ids[0]]||0)*10)/10;
    mark=pos[0];text=reizPct(v1,m1)+" % · "+v1+" Sätze";
  }else{
    var sum=0;pos.forEach(function(p){sum+=p;});
    mark=sum/pos.length;
    var rs=0;reiz.forEach(function(r){rs+=r;});
    text="Ø "+Math.round(rs/reiz.length*100)+" % · "+pos.length+" Gruppen";
  }
  var i=el("i");i.style.left=clamp(mark,0,100)+"%";pins.appendChild(i);
  var s=el("span",null,text);
  if(mark<16){s.style.left="0";s.style.transform="none";}
  else if(mark>84){s.style.left="auto";s.style.right="0";s.style.transform="none";}
  else s.style.left=mark+"%";
  lab.appendChild(s);lab.hidden=false;
}
function placeCallout(ms){
  var co=$("callout");
  var selFine=effFine(),selSet=effSet();   // lokale Sicht auf die offene Ebene
  if(!selFine&&!selSet){co.innerHTML='<span class="co-hint">Tipp einen Muskel an – oder wähl oben eine Region.</span>';return;}
    if(selFine&&FINE[selFine]){
    var f=FINE[selFine],m=muscleById(f.g);
    // Hand, Fuß, Hals, tiefe Wade usw. sind im 3D-Modell antippbar, gehören aber zu keiner
    // gezählten Muskelgruppe. Ohne diese Abfrage brach zoneOf() ab und die Anzeige blieb stehen.
    if(!m){co.innerHTML='<b>'+f.la+'</b><span>'+f.de+'</span><em>Wird im Training nicht eigens gezählt</em>';return;}
    var v=Math.round((ms[f.g]||0)*10)/10,z=zoneOf(v,m),em=emphasisSets(selFine,TODAY);
    co.innerHTML='<b>'+f.la+'</b><span>'+f.de+'</span><em class="z'+z+'">'+reizPct(v,m)+' % Reiz · '+v+' Sätze · '+zoneLabel(z)+(em!=null?' · '+em+' mit Betonung hier':'')+'</em>';
  } else {
    var ids=[];selSet.forEach(function(k){var g=FINE[k].g;if(ids.indexOf(g)<0&&muscleById(g))ids.push(g);});
    if(!ids.length){co.innerHTML='<b>'+selLabel+'</b><em>Wird im Training nicht eigens gezählt</em>';return;}
    var tot=0,ok=0;ids.forEach(function(id){var mm=muscleById(id),vv=ms[id]||0;tot+=vv;var zz=zoneOf(vv,mm);if(zz===1)ok++;});
    var names=ids.map(function(id){return muscleById(id).name;}).join(" · ");
    co.innerHTML='<b>'+selLabel+'</b>'+(names!==selLabel?'<span>'+names+'</span>':'')+'<em class="'+(ok?"z1":"z0")+'">'+(Math.round(tot*10)/10)+' Sätze · '+ok+' von '+ids.length+' im Korridor</em>';
  }
}
/* ---------- Körperfigur: Illustration + Muskelmasken ----------
   Die Masken der Illustration sind gröber als unser Datenmodell (21 Muskeln).
   Hier wird jede Maske auf die Muskeln abgebildet, die sie tatsächlich zeigt.
   Erster Eintrag = Hauptmuskel der Fläche.                                     */
var MASKMAP={
  pectoralis:["tg_brust_mitte","tg_brust_ober","tg_brust_unten"], rectus_abdominis:["tg_bauch_gerade"], obliques:["tg_bauch_schraeg"],
  deltoids:["tg_schulter_vorn","tg_schulter_seit"], biceps:["tg_bizeps"], forearms:["tg_unterarm_beug","tg_unterarm_streck"],
  trapezius:["tg_rueck_trapez","tg_rueck_rhomb"], neck_front:["tg_nacken"],
  quadriceps:["tg_quadrizeps","tg_adduktoren"], calves:["tg_wade_gastro","tg_wade_soleus"], tibialis_front:["tg_wade_fussheber"],
  calves_back:["tg_wade_gastro","tg_wade_soleus"], hamstrings:["tg_kniesehnen"], glutes:["tg_gesaess_haupt","tg_gesaess_med","tg_gesaess_min"],
  lower_back:["tg_rueck_strecker"], obliques_back:["tg_bauch_schraeg"], lats:["tg_rueck_lat","tg_brust_serratus","tg_schulter_rot"],
  upper_back:["tg_rueck_trapez","tg_rueck_rhomb","tg_nacken"],
  deltoids_back:["tg_schulter_hint","tg_schulter_seit"], triceps:["tg_trizeps_lang","tg_trizeps_lat"], forearms_back:["tg_unterarm_streck"]
};
function figSex(){return (state.profile&&state.profile.sex==="w")?"female":"male";}
// Manche Flächen der Illustration fassen mehrere, einzeln trainierbare Muskeln zusammen
// (z. B. ein Brust-Umriss für alle drei Anteile, ein Schulter-Umriss für vorderen/seitlichen/
// hinteren Kopf). Für eine bessere Unterscheidbarkeit teilen wir genau diese Flächen anhand
// ihrer tatsächlich gerenderten Geometrie in einzeln antippbare, eigenständig eingefärbte
// Teilflächen auf – jede referenziert einen echten Feinmuskel aus FINE.
// Grenzfasern der Brust, aus der Illustration abgenommen: [u,v] mit u = 0 Achsel … 1
// Brustbein, v = 0 oben … 1 unten (Anteile der Muskelfläche).
var PEC_LINE_TOP=[[0.0, 0.502], [0.025, 0.483], [0.05, 0.465], [0.075, 0.449], [0.1, 0.433], [0.125, 0.417], [0.15, 0.403], [0.175, 0.389], [0.2, 0.376], [0.225, 0.363], [0.25, 0.351], [0.275, 0.34], [0.3, 0.329], [0.325, 0.318], [0.35, 0.309], [0.375, 0.299], [0.4, 0.29], [0.425, 0.281], [0.45, 0.273], [0.475, 0.265], [0.5, 0.258], [0.525, 0.251], [0.55, 0.245], [0.575, 0.238], [0.6, 0.233], [0.625, 0.227], [0.65, 0.222], [0.675, 0.218], [0.7, 0.213], [0.725, 0.21], [0.75, 0.206], [0.775, 0.204], [0.8, 0.201], [0.825, 0.199], [0.85, 0.198], [0.875, 0.197], [0.9, 0.197], [0.925, 0.198], [0.95, 0.199], [0.975, 0.201], [1.0, 0.203]];  // obere ↔ mittlere Brust
var PEC_LINE_BOT=[[0.0, 0.564], [0.025, 0.57], [0.05, 0.575], [0.075, 0.58], [0.1, 0.584], [0.125, 0.587], [0.15, 0.59], [0.175, 0.592], [0.2, 0.594], [0.225, 0.596], [0.25, 0.597], [0.275, 0.599], [0.3, 0.6], [0.325, 0.602], [0.35, 0.603], [0.375, 0.605], [0.4, 0.606], [0.425, 0.608], [0.45, 0.61], [0.475, 0.613], [0.5, 0.615], [0.525, 0.618], [0.55, 0.621], [0.575, 0.625], [0.6, 0.628], [0.625, 0.632], [0.65, 0.637], [0.675, 0.641], [0.7, 0.646], [0.725, 0.651], [0.75, 0.656], [0.775, 0.661], [0.8, 0.667], [0.825, 0.672], [0.85, 0.677], [0.875, 0.683], [0.9, 0.688], [0.925, 0.693], [0.95, 0.697], [0.975, 0.702], [1.0, 0.706]];  // mittlere ↔ untere Brust
// Umriss des vorderen Sägemuskels (Achsel-/Flankenbereich direkt unter dem Brustmuskel-Ansatz):
// vom Nutzer anhand eines Referenzfotos (Punktmarkierung auf dem Rohbild) exakt nachgezeichnet.
// Die Fläche reicht oben ÜBER die eigentliche Obliquus-Maskenkontur hinaus (ein bislang
// unmaskierter Keil direkt unter dem Brustmuskel, der anatomisch schon zum Sägemuskel gehört),
// deshalb kein einfacher Schnitt der Obliquus-Fläche (wie zuvor SERRATUS_LINE) mehr, sondern ein
// eigenständiges, absolut positioniertes Polygon (wie bei Bizeps/Unterarm mit "polyabs") – die drei
// sichtbaren "Zacken" (Zähne der Verzahnung) plus der Keil bilden zusammen eine einzige
// zusammenhängende Fläche. Koordinaten: lokales Blob-Koordinatensystem der Obliquus-Maske (gleiche
// Basis wie deren "d", vor ox/oy), rechte Körperseite; wird per "axis" auf die linke gespiegelt.
var SERRATUS_POLY=[[55.21,92.54],[53.19,96.98],[53.69,103.73],[52.17,104.03],[52.78,104.63],[53.49,112.39],[57.24,123.18],[60.89,128.52],[62.61,133.05],[63.53,133.46],[64.84,130.43],[66.87,130.23],[67.5,121.46],[67.38,120.56],[67.58,118.74],[68.3,114.41],[68.1,112.8],[67.9,110.78],[67.6,106.35],[67.4,104.13],[70.83,102.01],[66.57,101.21],[62.01,99.29],[58.66,95.36],[56.53,95.26],[56.63,93.65]];
var SERRATUS_POLY_AXIS=105.44;
// Rechte Körperseite (Bildrechts): an dieser Stelle schließt die einfache Spiegelung der linken
// Kontur die Lücke zum oberen Bauchmuskel-Segment nicht ganz so sauber – auf Nutzerwunsch hier
// eigenständig (nicht nur gespiegelt) mit etwas mehr Überlappung Richtung Rippenbogen nachgezogen.
// Werte bereits in der gespiegelten (Bildrechts-)Koordinate, nicht nochmal automatisch gespiegelt.
var SERRATUS_POLY_R=SERRATUS_POLY.map(function(p){return [2*SERRATUS_POLY_AXIS-p[0],p[1]];});
(function(){
  var adj={17:142.68,18:142.88,19:142.88,21:142.38};
  Object.keys(adj).forEach(function(i){SERRATUS_POLY_R[+i][0]=adj[i];});
})();
// Grenze seitliche ↔ vordere/hintere Schulter: die Faserrille der Illustration, die der
// markierten Linie am nächsten liegt (verläuft zwischen zwei Faserbündeln, kreuzt keine Faser).
// [v,u] mit v = 0 oben … 1 unten, u = 0 Außenkante (Arm) … 1 Innenkante (Rumpf).
var DELT_LINE_FRONT=[[0.054,0.466],[0.077,0.449],[0.101,0.421],[0.125,0.392],[0.149,0.367],[0.172,0.343],[0.196,0.32],[0.22,0.299],[0.244,0.281],[0.267,0.264],[0.291,0.248],[0.315,0.232],[0.339,0.219],[0.362,0.206],[0.386,0.195],[0.41,0.184],[0.434,0.175],[0.458,0.166],[0.481,0.156],[0.505,0.145],[0.529,0.136],[0.553,0.13],[0.576,0.124],[0.6,0.118],[0.624,0.112],[0.648,0.107],[0.671,0.104],[0.695,0.101],[0.719,0.095],[0.743,0.091],[0.766,0.091],[0.79,0.091],[0.814,0.091],[0.838,0.091],[0.861,0.09],[0.885,0.086]];
var DELT_LINE_BACK=[[0.028,0.574],[0.055,0.549],[0.081,0.507],[0.107,0.467],[0.133,0.431],[0.16,0.399],[0.186,0.371],[0.212,0.348],[0.238,0.326],[0.265,0.303],[0.291,0.285],[0.317,0.269],[0.343,0.251],[0.37,0.235],[0.396,0.221],[0.422,0.207],[0.448,0.195],[0.475,0.185],[0.501,0.175],[0.527,0.166],[0.554,0.159],[0.58,0.153],[0.606,0.146],[0.632,0.138],[0.659,0.133],[0.685,0.13],[0.711,0.129],[0.737,0.127],[0.764,0.121],[0.79,0.116],[0.816,0.113],[0.842,0.108]];
// Schulterblatt (Rückansicht), vom Nutzer auf der Figur eingezeichnet und aus dem Bild
// übernommen: Flächen in Koordinaten der Lat-Fläche, u = 0 Achsel … 1 Wirbelsäule,
// v = 0 oben … 1 unten. Gilt gespiegelt für beide Körperseiten.
var SCAP_INFRA=[[0.393,0.002],[0.423,0.006],[0.446,0.015],[0.466,0.021],[0.547,0.073],[0.625,0.174],[0.643,0.198],[0.657,0.22],[0.671,0.243],[0.672,0.26],[0.664,0.279],[0.657,0.298],[0.651,0.315],[0.644,0.334],[0.64,0.348],[0.632,0.356],[0.618,0.357],[0.601,0.357],[0.353,0.2],[0.21,0.083],[0.205,0.074],[0.301,0.025],[0.321,0.015],[0.34,0.009],[0.361,0.005],[0.382,0.003]];   // Untergrätenmuskel
var SCAP_TMIN=[[0.09,0.124],[0.176,0.09],[0.26,0.151],[0.283,0.17],[0.269,0.175]];     // kleiner Rundmuskel
// Der Umriss der "lats"-Maske besteht oben aus einem eigenen, separat gezeichneten Teilpfad (neben
// dem großen Lat-Dreieck) – er deckt Untergräten- und kleinen Rundmuskel ab, reicht aber medial
// (zur Wirbelsäule hin) noch etwas über SCAP_INFRA/SCAP_TMIN hinaus: ein schmaler Zwickel direkt an
// der Nahtlinie zum Trapezius, der zu keinem der beiden Muskeln gehört. Direkt aus diesem Teilpfad
// übernommen (nicht neu geschätzt), damit die Kontur exakt passt. Per "exclude" aus der Lat-Restfläche
// herausgeschnitten, ohne einem Muskel zugeordnet zu sein – sichtbares Ergebnis: an dieser Stelle
// bleibt die Grundzeichnung ungefärbt statt fälschlich als Lat-Fläche eingefärbt zu werden.
var LATS_UPPER_SHAPE=[[0.584,0.357],[0.6,0.356],[0.353,0.2],[0.21,0.083],[0.205,0.074],[0.199,0.077],[0.146,0.1],[0.1,0.12],[0.176,0.09],[0.26,0.151],[0.283,0.17],[0.269,0.175],[0.091,0.124],[0.084,0.127],[0.057,0.139],[0.238,0.182],[0.301,0.2],[0.367,0.23],[0.471,0.289],[0.56,0.357]];
var SCAP_TMAJ=[[-0.001,0.174],[0.01,0.204],[0.054,0.26],[0.125,0.294],[0.167,0.309],[0.226,0.326],[0.317,0.342],[0.447,0.354],[0.56,0.357],[0.471,0.289],[0.367,0.23],[0.301,0.2],[0.238,0.182],[0.048,0.137],[0.006,0.155]];         // großer Rundmuskel
// Unterarm vorn: der Oberarmspeichenmuskel ist hier nicht als eigener Umriss gezeichnet (anders
// als am Rücken, siehe "bysize" unten). Die Außenkante folgt der Speichenseiten-Kontur der Maske,
// die Innenkante der in der Illustration selbst durchgezeichneten Furche zwischen der radialen
// Muskelsäule und der Beugergruppe – aus einem hochskalierten Rendering abgemessen (Helligkeits-
// profil quer über den Unterarm bei vielen Höhen, wobei die Silhouettenkanten selbst ausgenommen
// wurden, sonst misst man die Armkontur statt der Furche). Zum Handgelenk hin läuft der Streifen
// spitz aus, weil der Muskelbauch dort in die Sehne übergeht. Wie beim Brachialis liegt die
// Kontur vollständig innerhalb BEIDER Arm-Silhouetten der jeweiligen Figur, damit beide Seiten
// exakt gleich aussehen und nicht je Seite anders von der Maskenkante beschnitten werden.
var BRACHIORAD_FRONT=[[11.172,115.624],[9.139,119.328],[7.419,123.033],[5.82,126.737],[4.725,130.441],[3.982,134.145],[3.394,137.849],[2.958,141.553],[2.633,145.258],[2.014,156.37],[1.019,163.779],[-0.263,171.187],[3.475,171.187],[5.433,167.483],[7.726,163.779],[9.578,160.074],[14.341,148.962],[15.84,145.258],[18.61,137.849],[19.844,134.145],[20.074,130.441],[20.603,126.737],[20.527,123.55],[19.465,120.316],[18.775,117.713],[17.971,112.157],[17.825,111.92],[13.527,111.92]];
var BRACHIORAD_FRONT_F=[[32.405,118.27],[30.394,121.445],[28.838,124.62],[27.514,127.795],[26.402,130.97],[25.481,134.145],[24.629,137.32],[23.265,143.67],[21.825,153.195],[20.644,159.545],[18.908,165.895],[17.719,169.599],[20.973,169.599],[21.132,169.07],[22.578,165.895],[24.219,162.72],[25.912,159.545],[27.941,156.37],[29.387,153.195],[36.178,137.32],[37.025,134.145],[37.554,130.97],[38.207,127.795],[37.589,124.62],[37.06,118.27],[36.46,115.095],[34.974,115.095]];
// Unterarm hinten: Brachioradialis-Streifen von der linken Armseite abgenommen (aus der bereits
// als eigener Teilpfad gezeichneten Kontur), dann mit der echten Seitenachse gespiegelt. Vorher
// wurden hier einfach die beiden hand-gezeichneten Teilpfade pro Seite direkt übernommen ("bysize")
// – die waren aber nie exakt gleich groß (Illustration ~3-5 % seitenungleich), das gab die
// wahrgenommene Asymmetrie. Für Überlappung wurde die Kontur vorab mit der echten Silhouette
// beider Arme verschnitten, damit die gespiegelte Fläche auf keiner Seite über den Unterarm hinausragt.
var BRACHIORAD_BACK=[[5.309,174.836],[6.974,166.879],[8.363,158.544],[12.212,138.407],[12.939,133.281],[13.336,128.904],[13.535,125.025],[13.436,122.638],[13.734,112.095],[13.337,111.3],[12.143,110.802],[11.701,111.097],[10.402,112.82],[8.761,115.576],[6.374,120.351],[4.484,125.125],[3.191,129.998],[2.214,135.169],[1.873,138.103],[1.202,148.996],[1.202,154.366],[1.089,158.237],[0.605,164.512],[-0.091,169.485],[-1.085,174.458],[-2.083,178.266],[-2.375,181.01],[-2.329,181.977],[-2.065,182.622],[-1.534,183.057],[-0.688,183.399],[2.144,184.26],[2.466,184.055],[3.067,182.875],[3.788,180.923]];
var BRACHIORAD_BACK_F=[[18.383,181.106],[19.79,179.277],[21.042,176.031],[24.932,163.527],[26.761,156.213],[28.589,150.868],[29.405,148.045],[30.199,144.394],[32.027,137.783],[33.653,130.753],[34.559,125.544],[34.559,118.231],[33.856,115.277],[33.293,114.292],[32.027,114.574],[30.902,116.121],[28.792,119.356],[26.682,124.279],[25.276,128.499],[23.869,133.563],[22.884,138.627],[22.682,141.443],[22.364,143.311],[20.774,156.631],[19.79,161.414],[16.555,171.26],[15.429,175.198],[14.383,177.874],[14.664,179.14],[15.558,180.034]];
// Brachialis-Streifen (Oberarm vorn, außen neben dem Bizeps-Bauch sichtbar). In der männlichen
// Figur ist er zwar je Arm als eigener Teilpfad vorgezeichnet, die beiden Teilpfade sind im
// Rohbild aber NICHT spiegelgleich (rechts deutlich kürzer); die weibliche Figur hat gar keine
// eigene Kontur dafür. Beides ergibt eine einzige, in Blob-Koordinaten normierte Kontur je Figur,
// die auf beide Armseiten gespiegelt angewendet wird. Wichtig: die Kontur liegt vollständig
// INNERHALB beider Arm-Silhouetten dieser Figur (per Verschnitt mit beiden Umrissen berechnet) –
// sonst würde sie an der Maskenkante je Seite unterschiedlich abgeschnitten und die Seiten sähen
// trotz identischer Kontur wieder verschieden aus.
// Vom Nutzer direkt auf der Illustration nachgezeichnete Brachialis-Kontur (Fotoauswertung: Punkte
// digitalisiert, per Bildabgleich in Maskenkoordinaten übertragen) – ersetzt die frühere, zu knapp
// geschätzte Fläche. Dadurch wird nichts vom Bizeps (blau) mehr am Innenrand mit eingefärbt.
var BRACHIALIS_FRONT=[[24.774,128.838],[25.637,130.417],[26.428,132.95],[23.48,141.551],[20.682,151.236],[18.365,162.163],[18.014,162.69],[16.634,162.891],[16.308,161.963],[16.293,160.659],[17.387,145.187],[17.892,142.54],[19.167,138.04],[22.201,131.37],[23.029,130.066]];
var BRACHIALIS_FRONT_F=[[47.911,129.382],[46.334,131.763],[44.927,134.145],[43.815,136.526],[43.06,138.907],[40.591,148.432],[40.183,150.814],[39.906,153.195],[39.257,160.339],[39.158,162.72],[39.238,165.895],[44.098,165.895],[44.98,162.72],[47.238,155.576],[49.037,148.432],[50.395,143.67],[52.635,136.526],[54.258,129.382],[54.699,127.001],[50.367,127.001]];
// Zwickel genau an der Nahtstelle Trapezius/hintere Schulter (rechte Körperseite, aus der
// Zeichnung abgenommen) – gehört zu keinem der beiden Muskeln, wird per excludeMirror aus
// beiden Bändern herausgeschnitten und bleibt so ungefärbt, egal welcher Trainingsstand.
var NOTCH_TRAP_DELT=[[153.561,137.644],[135.758,142.126],[135.568,142.874],[137.083,145.115],[148.447,145.115],[147.879,143.621],[148.258,142.126],[149.583,140.632],[153.939,138.391],[156.97,137.644]];
// Derselbe Zwickel, aber in die lokalen Koordinaten der Schulter-Maske (deltoids_back) umgerechnet:
// Trapez- und Schultermaske überlappen sich an dieser Nahtstelle beide (eigene, unabhängige
// Rohkonturen), darum bekam die hintere Schulter (delt_post) dort weiterhin Farbe, obwohl die
// Trapez-Seite schon ausgeschnitten war. Offset = Differenz der ox/oy beider Rohmasken
// (ox 76.7292/-33.3375 bei upper_back vs. 76.2/-24.6062 bei deltoids_back).
var NOTCH_TRAP_DELT_SHOULDER=[[154.09,128.913],[136.287,133.395],[136.097,134.143],[137.612,136.384],[148.976,136.384],[148.408,134.89],[148.787,133.395],[150.112,131.901],[154.468,129.66],[157.499,128.913]];
// Kleiner Keil oben am inneren Lat-Rand (zwischen zwei Furchen, direkt unter dem Schulterblatt,
// neben dem Trapez) – vom Nutzer als "kein Muskel" festgelegt. Aus der gerenderten Lat-Fläche
// beider Seiten abgenommen (Vereinigung beider Seiten, leicht gepolstert) und in lokalen
// Koordinaten der lats-Maske hinterlegt; wird per excludeMirror aus allen Lat-Bändern entfernt.
var NOTCH_LAT_TOP=[[130.258,121.878],[129.796,122.233],[128.525,126.049],[127.965,130.667],[128.031,131.742],[128.578,132.841],[129.259,133.51],[130.051,133.823],[132.132,134.101],[132.387,133.891],[132.407,133.411],[130.601,122.16]];
// Dieselbe Stelle auf der Frauenfigur (andere Illustration, gleiche Maske): der Keil sitzt dort
// etwas weiter innen und höher – eigene Kontur und eigene Achse, sonst würde die Männer-Kontur
// in die Lat-Oberkante der Frauenfigur schneiden.
var NOTCH_LAT_TOP_F=[[122.717,121.819],[122.393,122.035],[121.548,124.567],[120.656,127.345],[120.509,128.488],[120.839,129.169],[121.028,129.31],[123.457,129.74],[124.254,129.735],[124.456,129.614],[124.534,129.357],[123.556,123.628],[123.179,122.035],[122.99,121.845]];
var SPLIT_MASKS={
  // Trapez/oberer Rücken: absteigender Teil oben (mit Nacken und Schulterblattheber),
  // querer Teil in der Mitte (darunter die Rhomboiden), aufsteigender Teil unten.
  upper_back:{kind:"y",excludeMirror:{axis:104.849,poly:NOTCH_TRAP_DELT},bands:[
    {fine:"descending_part_of_trapezius", frac:[0,0.44]},
    {fine:"transverse_part_of_trapezius",frac:[0.44,0.74]},
    {fine:"ascending_part_of_trapezius",  frac:[0.74,1]}
  ]},
  // Latissimus-Fläche: oben das Schulterblatt mit dem Untergrätenmuskel, darunter als schräges
  // Band der große Rundmuskel (entlang der gezeichneten Bogenlinie zur Achsel), dann der Lat.
  lats:{kind:"poly",vScaleFemale:0.86,exclude:[LATS_UPPER_SHAPE],excludeMirror:{axis:105.355,poly:NOTCH_LAT_TOP,female:{axis:104.282,poly:NOTCH_LAT_TOP_F}},bands:[
    {fine:"infraspinatus",poly:SCAP_INFRA},
    {fine:"teres_minor",poly:SCAP_TMIN},
    {fine:"teres_major",    poly:SCAP_TMAJ},
    {fine:"latissimus_dorsi",     rest:true}
  ]},
  // Wade: die Zwillingsbäuche oben, der Schollenmuskel schaut darunter hervor.
  calves_back:{kind:"y",bands:[
    {fine:"medial_head_of_gastrocnemius",frac:[0,0.60]},
    {fine:"soleus",    frac:[0.60,1]}
  ]},
  // Gerader Bauchmuskel: waagerechte Trennung auf Nabelhöhe (60 % der Muskelhöhe).
  rectus_abdominis:{kind:"y",bands:[
    {fine:"rectus_abdominis", frac:[0,1]}
  ]},
  // Die Grenzen zwischen oberer/mittlerer/unterer Brust sind zwei Faserlinien der
  // Illustration (PEC_LINE_TOP/BOT); "above"/"below" = alles darüber/darunter.
  pectoralis:{kind:"yfan",bands:[
    {fine:"clavicular_head_of_pectoralis_major", top:"above",      bottom:PEC_LINE_TOP},
    {fine:"sternocostal_head_of_pectoralis_major",top:PEC_LINE_TOP, bottom:PEC_LINE_BOT},
    {fine:"abdominal_part_of_pectoralis_major",  top:PEC_LINE_BOT, bottom:"below"}
  ]},
  // Vorderansicht der Flanke: der Bereich direkt unter dem Brustmuskel-Ansatz und der Achsel
  // (Keil plus die drei sichtbaren "Zacken", mit denen der Sägemuskel in den äußeren schrägen
  // Bauchmuskel greift) gehört anatomisch zum vorderen Sägemuskel. Die Fläche reicht dabei über
  // die eigentliche Obliquus-Maskenkontur hinaus (siehe SERRATUS_POLY) – deshalb "polyabs" statt
  // eines reinen Schnitts der Obliquus-Fläche (wie bei Bizeps/Unterarm: eigenständiges Polygon in
  // absoluten Blob-Koordinaten, per Achse auf die andere Körperseite gespiegelt). Die Restfläche
  // ("rest") bleibt die ursprüngliche Obliquus-Kontur minus dieses Polygons = äußerer schräger
  // Bauchmuskel. Gilt automatisch auch für die Frauenfigur (obliques_female, siehe splitDefFor).
  obliques:{kind:"polyabs",axis:SERRATUS_POLY_AXIS,bands:[
    {fine:"serratus_anterior",poly:SERRATUS_POLY,polyR:SERRATUS_POLY_R},
    {fine:"external_abdominal_oblique", rest:true}
  ]},
  // Seitliche Schulter (außen) gegen vordere bzw. hintere Schulter: Grenzlinie vom Nutzer auf
  // der Figur nachgezeichnet (DELT_LINE_FRONT/BACK), gleiche Normierung wie bei der Brust.
  deltoids:{kind:"xcurve",line:DELT_LINE_FRONT,bands:[
    {fine:"clavicular_part_of_deltoid",side:"medial"},
    {fine:"acromial_part_of_deltoid",side:"lateral"}
  ]},
  deltoids_back:{kind:"xcurve",line:DELT_LINE_BACK,excludeMirror:{axis:105.3782,poly:NOTCH_TRAP_DELT_SHOULDER},bands:[
    {fine:"scapular_spinal_part_of_deltoid",side:"medial"},
    {fine:"acromial_part_of_deltoid", side:"lateral"}
  ]},
  // Bizeps-Fläche: die außen sichtbare Brachialis-Kontur wird aus der Restfläche herausgeschnitten
  // – dieselbe normierte Kontur für beide Armseiten, dadurch beide Seiten exakt gleich. Männer-
  // und Frauenfigur haben unterschiedlich geformte Oberarm-Umrisse und deshalb je eine eigene,
  // auf ihre beiden Arme passende Kontur.
  biceps:{kind:"polyabs",axis:105.438,bands:[
    {fine:"brachialis",poly:BRACHIALIS_FRONT},
    {fine:"long_head_of_biceps_brachii", rest:true}
  ]},
  biceps_female:{kind:"polyabs",axis:104.908,bands:[
    {fine:"brachialis",poly:BRACHIALIS_FRONT_F},
    {fine:"long_head_of_biceps_brachii", rest:true}
  ]},
  // Unterarm vorn: radiale Muskelsäule an der Daumenseite (siehe BRACHIORAD_FRONT), der Rest gilt
  // als Handgelenkbeuger-Masse (von vorn sichtbar überwiegend Beuger). Eigene Kontur je Figur,
  // weil die Unterarm-Umrisse von Männer- und Frauenfigur unterschiedlich geformt sind.
  forearms:{kind:"polyabs",axis:104.379,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_FRONT},
    {fine:"flexor_carpi_radialis", rest:true}
  ]},
  forearms_female:{kind:"polyabs",axis:104.908,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_FRONT_F},
    {fine:"flexor_carpi_radialis", rest:true}
  ]},
  // Unterarm hinten: wie vorne wird die Brachioradialis-Kontur von einer Armseite übernommen und
  // gespiegelt, damit beide Seiten exakt gleich aussehen (die zwei hand-gezeichneten Teilpfade
  // waren nie pixelgleich groß). Der Rest der Fläche gilt als Handgelenkstrecker-Masse.
  forearms_back:{kind:"polyabs",axis:104.647,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_BACK},
    {fine:"extensor_carpi_radialis_longus", rest:true}
  ]},
  forearms_back_female:{kind:"polyabs",axis:104.997,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_BACK_F},
    {fine:"extensor_carpi_radialis_longus", rest:true}
  ]}
};
// Hinten sind Nacken und Trapez eine gemeinsame Fläche (upper_back); vorne bekommt der Hals
// dort ein Loch, wo die Trapez-Zipfel liegen.
var MASK_CUT={};
// Die Halsfläche reicht vorne bis zum Schlüsselbein und würde die Trapez-Zipfel überdecken.
// Die bleiben aber eigenständig (Nacken/Trapez): der Hals bekommt dort ein Loch
// (evenodd in der Clip-Form), damit sich keine Farben überlagern.
var MASK_HOLE={neck_front:"trapezius", neck_front_female:"trapezius_female"};
function selGroups(){
  var ef=effFine();
  if(ef&&FINE[ef])return [FINE[ef].g];
  var ss=effSet();
  if(!ss)return [];
  var out=[];ss.forEach(function(k){var g=FINE[k]&&FINE[k].g;if(g&&out.indexOf(g)<0)out.push(g);});return out;}
function renderRegionChips(){
  var bar=$("regionchips");if(!bar)return;bar.innerHTML="";
  var all=el("button","fchip","Alle");all.setAttribute("aria-pressed",String(!selSet&&!selFine));
  all.onclick=function(){selReset();selSet=null;selFine=null;selLabel=null;selTapKey=null;renderBodySel();renderRegionChips();};bar.appendChild(all);
  REGIONS.forEach(function(rg){
    var b=el("button","fchip",rg.name);b.setAttribute("aria-pressed",String(selLabel===rg.name&&!selFine));
    b.onclick=function(){selReset();selectRegion(rg);renderBodySel();};bar.appendChild(b);
  });
}
/* Erklaert am konkreten Muskel, was ein weiterer Satz noch bringt. Genau das ist die
   Frage, die eine Satzzahl allein nicht beantwortet. */
function reizBlock(v,m){
  var r=reizPct(v,m),mg=reizMarginal(v),nx=reizNextStep(v),
      dbl=Math.round((Math.sqrt(2)-1)*100);
  return '<div class="dim">Reiz '+r+' % vom Optimum · nächster Satz bringt noch '+
    Math.round(mg*100)+' % von dem, was dein erster bringt</div>'+
    '<div class="dim" style="margin-top:3px">Für einen nachweisbaren Unterschied bräuchtest du ab hier rund '+
    String(nx).replace(".",",")+' Sätze/Woche mehr. Doppelte Satzzahl heißt +'+dbl+' % Reiz, nicht +100 %.</div>';
}
/* Der Detailblock eines einzelnen Muskels - einmal gebaut, an zwei Stellen benutzt: als
   ganzer Kasten (Auswahl ueber Liste oder Figur) und aufgeklappt unter einer Gruppenkarte. */
function muscleDetail(fk,ms,compact){
  var f2=FINE[fk],m2=muscleById(f2.g),wrap=el("div","mdetailblock");
  if(!m2)return wrap;
  var emList=(EMPH[fk]||[]).map(function(id){var e=exById(id);return e?e.n:null;}).filter(Boolean);
  var hits=(emList.length?emList:EX.filter(function(e){return e.t!=="cardio"&&!e.mob&&((e.p||[]).indexOf(f2.g)>=0);}).map(function(e){return e.n;})).slice(0,3);
  var recH=m2.rec||36,c2=corr(m2),angepasst=volFactor(m2.id)!==1;
  var rv=recoveryOf(m2);
  // Der eigene Schnitt macht die Entscheidung ueber den Korridor ueberpruefbar: man sieht,
  // was man tatsaechlich ueber laengere Zeit gemacht hat, statt nur den Literaturwert.
  var avg8=Math.round((muscleSets(TODAY,56)[m2.id]||0)/8*10)/10;
  var full=!rv||rv.pct>=100;
  var recCol=full?"var(--accent)":"var(--warn)";
  var recTxt=!rv?"seit mindestens drei Wochen nicht belastet"
    :(full?"vollständig erholt · zuletzt "+humanSince(rv.h)+" belastet"
          :"noch "+Math.max(1,Math.round(rv.left))+" Std. · zuletzt "+humanSince(rv.h)+" belastet");
  var recNote=rv?("Richtwert "+recH+" Std., für "+String(Math.round(rv.dose*10)/10).replace(".",",")+
    " Sätze in der Einheit auf "+Math.round(rv.rec)+" Std. angepasst"):("Richtwert "+recH+" Std.");
  wrap.innerHTML=(compact?'<div class="mdname">'+f2.la+'<span>'+f2.de+'</span></div>'
                         :'<b>'+f2.la+'</b><span class="de">'+f2.de+'</span>')+
    '<div class="mdblock"><div class="mdlab">Erholung</div>'+
      '<div class="recrow"><div class="recbar"><i style="width:'+(rv?Math.round(rv.pct):100)+
        '%;background:'+recCol+'"></i></div>'+
        '<span class="recval" style="color:'+recCol+'">'+(rv?Math.round(rv.pct):100)+' %</span></div>'+
      '<div class="dim" style="margin-top:5px">'+recTxt+'</div>'+
      '<div class="dim" style="margin-top:2px">'+recNote+'</div></div>'+
    '<div class="mdblock"><div class="mdlab">Korridor · Sätze pro Woche</div>'+
      '<div class="kchips">'+
        '<span class="kchip" style="--c:'+volColor(c2.mev,m2)+'"><em>Minimum</em><b>'+c2.mev+'</b></span>'+
        '<span class="kchip" style="--c:'+volColor(c2.mav,m2)+'"><em>Optimum</em><b>'+c2.mav+'</b></span>'+
        '<span class="kchip" style="--c:'+volStops()[4]+'"><em>Grenze</em><b>'+c2.mrv+'</b></span>'+
      '</div>'+
      '<div class="dim" style="margin-top:6px">Dein Schnitt der letzten 8 Wochen: '+
        String(avg8).replace(".",",")+' Sätze/Woche'+
        (angepasst?' · Korridor von dir angepasst':'')+'</div></div>'+
    '<div class="mdblock"><div class="mdlab">Was noch mehr bringt</div>'+
      reizBlock(ms[m2.id]||0,m2)+'</div>'+
    (hits.length?'<div class="dim" style="margin-top:10px">Beispiele: '+hits.join(", ")+'</div>':'');
  wrap.appendChild(volField(m2));
  return wrap;
}
function renderBody(ms){
  fw3dSyncColors(ms);
  renderRegionChips();
  placeCallout(ms);
  updateVolLegend(ms);
  var box=$("mdetail");
  var _bb=backBar();
  box.innerHTML="";
  if(selFine&&FINE[selFine]){
    if(_bb)box.appendChild(_bb);
    box.appendChild(muscleDetail(selFine,ms,true));
  } else if(selSet){
    var ids=[];selSet.forEach(function(k){var g=FINE[k].g;if(ids.indexOf(g)<0)ids.push(g);});
    if(_bb)box.appendChild(_bb);
    box.appendChild(el("b",null,selLabel));
    box.appendChild(el("span","de",ids.length===1?"Antippen für Details"
      :ids.length+" Gruppen · antippen für Details"));
    /* Auswahl ersetzt die Liste nicht mehr, sie klappt darunter auf. Vorher sprang man mit
       jedem Tipp eine Ebene tiefer und verlor die Nachbarn aus dem Blick - gerade beim
       Vergleichen ("welcher der vier ist der schwaechste?") war das hinderlich. */
    ids.forEach(function(id){
      var mm=muscleById(id);if(!mm)return;
      var vv=Math.round((ms[id]||0)*10)/10;
      var keys=selSet.filter(function(k){return FINE[k].g===id;});
      var open=(expGroup===id);
      // Der tiefe Rueckenstrecker allein hat 17 Feinmuskeln - vollstaendig ausgeschrieben
      // sprengt das die Karte. Drei Namen reichen zur Einordnung, der Rest wird gezaehlt.
      var las=keys.map(function(k){return FINE[k].la;}),
          sub=las.slice(0,3).join(" · ")+(las.length>3?" · +"+(las.length-3)+" weitere":"");
      var card=el("button","gcard"+(open?" open":""));card.type="button";
      card.setAttribute("aria-expanded",String(open));
      card.appendChild(volRowMain(mm.name,vv,mm,sub));
      card.onclick=function(ev){
        ev.stopPropagation();
        expGroup=open?null:id;expFine=null;
        renderBodySel();
      };
      box.appendChild(card);
      if(!open)return;
      var panel=el("div","gpanel");
      if(keys.length>1){
        var fc=el("div","finechips");
        keys.forEach(function(k){
          var bt=el("button",null,FINE[k].la);bt.type="button";bt.title=FINE[k].de||"";
          bt.setAttribute("aria-pressed",String(expFine===k));
          bt.onclick=function(ev){ev.stopPropagation();
            expFine=(expFine===k?null:k);renderBodySel();};
          fc.appendChild(bt);
        });
        panel.appendChild(fc);
      }
      // Eine Gruppe mit genau einem Feinmuskel zeigt ihr Detail sofort - eine Chip-Reihe
      // mit einem einzigen Chip waere ein Klick ohne Information.
      var fk=keys.length===1?keys[0]:expFine;
      if(fk)panel.appendChild(muscleDetail(fk,ms,keys.length>1));
      box.appendChild(panel);
    });
  } else box.innerHTML='Tipp einen Muskel an – oder oben eine Region wie „Brust“, dann werden alle zugehörigen Muskeln markiert.';
}
/* Arme und Beine waren als Sammelgruppen zu grob: "Arme" hat Bizeps, Trizeps und Unterarme
   in eine Kachel geworfen, obwohl man sie getrennt plant und getrennt anschaut. Jetzt ist
   jede trainierbare Einheit ihre eigene Gruppe - dadurch zeigt auch jede Kachel genau die
   Stelle, um die es geht. */
var REGIONS=[
 {name:"Brust",ids:["tg_brust_ober","tg_brust_mitte","tg_brust_unten","tg_brust_serratus"]},
 {name:"Schultern",ids:["tg_schulter_vorn","tg_schulter_seit","tg_schulter_hint","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_schulter_rot_sub","tg_schulter_rot_supra"]},
 {name:"Rücken",ids:["tg_rueck_lat","tg_rueck_teres_major","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_rueck_rhomb"]},
 // Der Rueckenstrecker steht eigenstaendig: er wird ueber ganz andere Uebungen belastet
 // (Kreuzheben, Hyperextension, Good Morning) als die ziehenden Rueckenmuskeln daneben.
 {name:"Rückenstrecker",ids:["tg_rueck_strecker"]},
 // Der Brachialis steht unter dem Bizeps - in derselben Region, aber als eigene Gruppe:
 // beim Antippen von "Bizeps" erscheint er als eigene Karte darunter.
 {name:"Bizeps",ids:["tg_bizeps","tg_brachialis"]},
 {name:"Trizeps",ids:["tg_trizeps_lang","tg_trizeps_lat"]},
 {name:"Unterarme",ids:["tg_unterarm_beug","tg_unterarm_streck"]},
 // Der Hueftbeuger (M. iliacus, M. psoas major, M. sartorius) sitzt hier statt bei den
 // Beinen: der Psoas entspringt an den Lendenwirbeln und ist damit anatomisch ein tiefer
 // Rumpfmuskel, und trainiert wird er ueber Uebungen, die man ohnehin als Bauchtraining
 // fuehrt - Beinheben, Knieheben im Hang.
 {name:"Rumpf",ids:["tg_bauch_gerade","tg_bauch_schraeg","tg_bauch_tief","tg_huefte"]},
 {name:"Gesäß",ids:["tg_gesaess_haupt","tg_gesaess_med","tg_gesaess_min"]},
 {name:"Quadrizeps",ids:["tg_quadrizeps"]},
 {name:"Beinbeuger",ids:["tg_kniesehnen"]},
 {name:"Adduktoren",ids:["tg_adduktoren"]},
 {name:"Waden",ids:["tg_wade_gastro","tg_wade_soleus","tg_wade_fussheber"]},
 {name:"Hals",ids:["tg_hals_nacken"]},
 {name:"Nacken",ids:["tg_nacken","tg_rueck_trapez_ob"]}
];

// Cardio ist keine Muskelregion, sondern ein Übungstyp - bekommt trotzdem eine eigene
// Kachel im Entdecken-Tab. Absichtlich NICHT Teil von REGIONS: sonst würde "Cardio" auch
// in Werte/Körper als trainierbare Muskelgruppe auftauchen, wo es nicht hingehört.
// Die ids sind die Vereinigung aller Muskeln, die irgendeine Cardio-Übung referenziert -
// darüber funktionieren Feinfilter-Chips (z.B. "Rücken" -> Rudergerät/Schwimmen) genau wie
// bei echten Regionen, ganz ohne eigenen Filter-Code.
var CARDIO_REGION={name:"Cardio",cardio:true,
  ids:["tg_quadrizeps","tg_wade_gastro","tg_gesaess_haupt","tg_kniesehnen","tg_wade_fussheber",
       "tg_rueck_lat","tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_teres_major",
       "tg_schulter_vorn","tg_brust_mitte","tg_bauch_gerade","tg_bizeps"]};

// Mobilitaet bekommt aus demselben Grund wie Cardio eine eigene Kachel: es ist kein
// Koerperteil, sondern eine Art zu trainieren. Gefiltert wird ueber ex.mob und die gewaehlte
// Art (statisch/dynamisch), nicht ueber Muskeln - deshalb bleibt die Liste hier leer.
var MOB_REGION={name:"Mobilität",mobility:true,ids:[]};
