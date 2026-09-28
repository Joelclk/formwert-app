/* ==========================================================
   app/03-sheet.js - Bottom-Sheets und Dialoge, Uebungsformular (anlegen/bearbeiten), Uebungsauswahl, Ausruestungsfilter
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Sheet ================= */
function openSheet(build){
  var b=$("sheet-body");b.innerHTML="";build(b);
  $("scrim").classList.add("open");$("sheet").classList.add("open");
  syncScrollLock();
}
function closeSheet(){
  $("scrim").classList.remove("open");$("sheet").classList.remove("open");
  syncScrollLock();
  // Eine Übung kann direkt aus einem offenen Tab heraus bearbeitet werden (z.B. Entdecken).
  // selectTab wird dabei nicht erneut aufgerufen, also muss der sichtbare Abschnitt hier
  // selbst auf sein dirty-Flag prüfen, sonst bleibt er mit alten Daten stehen.
  if(tab!=="tab-heute"&&secDirty[tab.replace("tab-","")])renderSection(tab);
}
$("scrim").addEventListener("click",closeSheet);
function sheetTitle(b,txt,trailing){
  if(!trailing){b.appendChild(el("h3",null,txt));return;}
  var row=el("div","sheet-title-row");
  row.appendChild(el("h3",null,txt));row.appendChild(trailing);
  b.appendChild(row);
}
function askNumber(title,val,step,min,max,unit,cb){
  openSheet(function(b){
    sheetTitle(b,title);
    var f=numField(unit||"",val,step,min);b.appendChild(f);
    var ok=el("button","btn primary block","Übernehmen");ok.style.marginTop="14px";
    ok.onclick=function(){var v=parseFloat(String(f.input.value).replace(",","."));if(isNaN(v))v=val;if(max!=null)v=Math.min(max,v);if(min!=null)v=Math.max(min,v);closeSheet();cb(v);};
    b.appendChild(ok);setTimeout(function(){try{f.input.focus();f.input.select();}catch(e){}},250);
  });
}
function askConfirm(title,text,okLabel,cb,danger){
  openSheet(function(b){
    sheetTitle(b,title);if(text)b.appendChild(el("p","note",text));
    var ok=el("button","btn "+(danger?"danger":"primary")+" block",okLabel||"Ja");ok.style.marginTop="14px";ok.onclick=function(){closeSheet();cb();};b.appendChild(ok);
    var no=el("button","btn ghost block","Abbrechen");no.style.marginTop="8px";no.onclick=closeSheet;b.appendChild(no);
  });
}
var toastT=null;
function toast(msg){
  var t=$("toast");if(!t){t=el("div","toast");t.id="toast";t.setAttribute("role","status");t.setAttribute("aria-live","polite");document.body.appendChild(t);}
  t.textContent=msg;t.classList.add("on");if(toastT)clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove("on");},2200);
}
function numField(labelTxt,val,step,min){
  var f=el("div","field");f.appendChild(el("label",null,labelTxt));
  var st=el("div","stepper");
  var minus=el("button",null,"−");minus.type="button";
  var inp=document.createElement("input");inp.type="number";inp.inputMode="decimal";
  inp.value=val;inp.step=step;if(min!=null)inp.min=min;
  var plus=el("button",null,"+");plus.type="button";
  minus.onclick=function(){inp.value=Math.max(min!=null?min:0,(parseFloat(inp.value)||0)-parseFloat(step));inp.dispatchEvent(new Event("input"));};
  plus.onclick=function(){inp.value=(parseFloat(inp.value)||0)+parseFloat(step);inp.dispatchEvent(new Event("input"));};
  st.appendChild(minus);st.appendChild(inp);st.appendChild(plus);
  f.appendChild(st);f.input=inp;return f;
}
function customExInUse(id){
  for(var k in state.days){if((state.days[k].sets||[]).some(function(s){return s.ex===id;}))return true;}
  for(var rid2 in state.routines){if(((state.routines[rid2]||{}).items||[]).some(function(it){return it.ex===id;}))return true;}
  return false;
}
function movementGroups(){
  return PATTERNS.filter(function(p){return p.id!=="cardio";}).map(function(p){return {id:p.id,name:p.name};})
    .concat([{id:"iso",name:"Isolation"},{id:"mob",name:"Mobilität"}]);
}
// Eine Zeile der Prozent-Liste: Muskelname links, Stepper (-, Zahl, +) rechts. Nutzt dieselbe
// .stepper-Optik wie die Gewichts-/Wiederholungsfelder beim Satz-Eintragen, nur kompakter.
function pctRow(name,val,onChange){
  var row=el("div","pctrow");
  row.appendChild(el("span","pctname",name));
  var st=el("div","stepper");
  var minus=el("button",null,"−");minus.type="button";
  var inp=document.createElement("input");inp.type="number";inp.inputMode="numeric";
  inp.min="1";inp.max="100";inp.step="5";inp.value=val;
  var plus=el("button",null,"+");plus.type="button";
  function clamp(v){v=Math.round(v);if(!isFinite(v))v=1;return Math.max(1,Math.min(100,v));}
  function commit(v){v=clamp(v);inp.value=v;onChange(v);}
  minus.onclick=function(){commit((parseFloat(inp.value)||1)-5);};
  plus.onclick=function(){commit((parseFloat(inp.value)||0)+5);};
  inp.addEventListener("change",function(){commit(parseFloat(inp.value)||1);});
  st.appendChild(minus);st.appendChild(inp);st.appendChild(plus);
  row.appendChild(st);row.appendChild(el("span","pctsuffix","%"));
  return row;
}
// Liste aller aktuell gewählten Muskeln mit je einem eigenen Prozentwert (100 % = die stärkste
// Übung dafür im ganzen Katalog - dieselbe Skala wie EX_PCT). Ergänzt die grobe Primär-/
// Sekundär-Auswahl darüber um eine feinere, selbst gesetzte Gewichtung je Muskel.
function pctListField(getIds,pctById,onChange){
  var f=el("div","field msel-pct");
  f.appendChild(el("label",null,"Anteil pro Muskel"));
  var list=el("div","pctlist");f.appendChild(list);
  f.appendChild(el("p","note","100 % = die stärkste Übung dafür im ganzen Katalog. Wird nichts geändert, zählt Primär 100 %, Sekundär 50 %."));
  function render(){
    list.innerHTML="";
    var ids=getIds();
    if(!ids.length){list.appendChild(el("div","empty","Erst oben Muskeln auswählen."));return;}
    ids.forEach(function(id){
      var m=muscleById(id);if(!m)return;
      list.appendChild(pctRow(m.name,pctById[id]!=null?pctById[id]:100,function(v){pctById[id]=v;}));
    });
  }
  f.render=render;render();
  return f;
}
/* Zwei kleine Figuren, die zeigen, was die gerade gewaehlten Muskeln auf dem Koerper
   bedeuten. Wird beim Tippen nicht sofort neu gerendert, sondern kurz gesammelt - ein
   Standbild kostet Rechenzeit, und beim Durchklicken mehrerer Chips waere jedes einzelne
   Zwischenbild verschwendet. */
function exFormFigs(getInv){
  var wrap=el("div","wo-figwrap exform-figs"),box=el("div","wo-figs"),svgs={};
  [["front","Vorne"],["back","Hinten"]].forEach(function(v){
    var fig=document.createElement("figure");
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());
    sv.setAttribute("role","img");sv.setAttribute("aria-label","Beanspruchte Muskeln, "+v[1]);
    fig.appendChild(sv);fig.appendChild(el("figcaption",null,v[1]));
    box.appendChild(fig);svgs[v[0]]=sv;
  });
  wrap.appendChild(box);
  var t=null;
  wrap.refresh=function(){
    if(t)clearTimeout(t);
    t=setTimeout(function(){
      t=null;
      var inv=getInv()||{},keys=[],g;
      for(g in inv)keys.push(g+":"+inv[g]);
      keys.sort();
      var key="exform:"+keys.join(",");
      ["front","back"].forEach(function(v){
        var sv=svgs[v];
        sv.removeAttribute("data-filled");
        fw3dSnapInto(sv,key,inv,v,false,null,"step",null,true);
      });
    },280);
  };
  return wrap;
}
/* Aufklappbare Mehrfachauswahl. Die Kopfzeile zeigt, was gewaehlt ist, ohne dass man
   die ganze Liste aufklappen muss. */
function muscleSelectField(label,items,selected,onToggle,onChange){
  var f=el("div","field msel");
  f.appendChild(el("label",null,label));
  var head=el("button","msel-head");head.type="button";head.setAttribute("aria-expanded","false");
  var val=el("span","msel-val");
  var chev=el("span","chev");chev.innerHTML=svgIcon(IC_CHEV);
  head.appendChild(val);head.appendChild(chev);
  var bar=el("div","chipbar wrap msel-list");bar.hidden=true;
  var chipsById={};
  function paintHead(){
    if(!selected.length){val.textContent="keine gewählt";return;}
    var names=selected.map(function(id){var m=muscleById(id);return m?m.name:id;});
    val.textContent=names.length<=2?names.join(" · "):(names.length+" gewählt: "+names.slice(0,2).join(" · ")+" …");
  }
  head.onclick=function(){bar.hidden=!bar.hidden;head.setAttribute("aria-expanded",String(!bar.hidden));};
  items.forEach(function(m){
    var c=el("button","fchip",m.name);c.type="button";
    c.setAttribute("aria-pressed",String(selected.indexOf(m.id)>=0));
    c.onclick=function(){
      var i=selected.indexOf(m.id);
      if(i>=0)selected.splice(i,1);else selected.push(m.id);
      c.setAttribute("aria-pressed",String(selected.indexOf(m.id)>=0));
      onToggle&&onToggle(m.id,selected.indexOf(m.id)>=0);
      paintHead();onChange&&onChange();
    };
    chipsById[m.id]=c;bar.appendChild(c);
  });
  f.appendChild(head);f.appendChild(bar);
  f.chipsById=chipsById;
  f.setPressed=function(id,v){if(chipsById[id])chipsById[id].setAttribute("aria-pressed",String(!!v));paintHead();};
  f.paintHead=paintHead;
  paintHead();
  return f;
}
// Gemeinsames Formular fürs Anlegen UND spätere Bearbeiten einer Übung (jede Übung soll sich
// anpassen lassen, nicht nur selbst angelegte – eingebaute Übungen laufen dafür über
// state.exOverrides statt direkter Mutation der EX-Grunddaten, siehe applyExOverrides()).
// `existing` (optional) liefert die Vorbelegung beim Bearbeiten.
function exerciseForm(b,existing){
  var nameF=el("div","field");nameF.appendChild(el("label",null,"Name"));
  var nameI=document.createElement("input");nameI.type="text";nameI.autocomplete="off";nameI.placeholder="z. B. Butterfly Maschine";
  if(existing)nameI.value=existing.n;
  nameF.appendChild(nameI);b.appendChild(nameF);

  var eqF=el("div","field");eqF.appendChild(el("label",null,"Equipment"));
  var eqI=document.createElement("input");eqI.type="text";eqI.autocomplete="off";eqI.placeholder="z. B. Maschine";
  if(existing)eqI.value=existing.e||"";
  eqF.appendChild(eqI);b.appendChild(eqF);

  var grid=el("div","grid2");grid.style.marginTop="10px";
  var typeF=el("div","field");typeF.appendChild(el("label",null,"Art"));
  var typeSel=document.createElement("select");
  [["load","Gewicht × Wdh"],["reps","Wiederholungen"],["sec","Sekunden halten"]].forEach(function(o){
    var op=document.createElement("option");op.value=o[0];op.textContent=o[1];typeSel.appendChild(op);
  });
    // Ausdauer-Übungen lassen sich bearbeiten, aber nicht neu anlegen – darum fehlt die Option
  // sonst. Ohne sie würde das Feld leer, und die Übung verlöre beim Speichern ihre Art: Sie
  // verschwand aus der Ausdauer-Auswahl und wurde wie eine Kraftübung behandelt.
  if(existing&&existing.t==="cardio"){var opT=document.createElement("option");opT.value="cardio";opT.textContent="Ausdauer (Minuten)";typeSel.appendChild(opT);}
  if(existing)typeSel.value=existing.t;
  typeF.appendChild(typeSel);grid.appendChild(typeF);

  var patF=el("div","field");patF.appendChild(el("label",null,"Bewegungsmuster"));
  var patSel=document.createElement("select");
  movementGroups().forEach(function(p){var op=document.createElement("option");op.value=p.id;op.textContent=p.name;patSel.appendChild(op);});
    if(existing&&existing.pat==="cardio"){var opP=document.createElement("option");opP.value="cardio";opP.textContent="Ausdauer";patSel.appendChild(opP);}
  if(existing)patSel.value=existing.pat;
  patF.appendChild(patSel);grid.appendChild(patF);
  b.appendChild(grid);

  // Zählt das eingetragene Gewicht als Gesamtgewicht (Langhantel, Maschine) oder als Gewicht
  // pro Seite (Kurzhanteln – man hält ja zwei mit demselben Gewicht)? Nur relevant bei "Gewicht
  // × Wdh", deshalb ein-/ausgeblendet je nach gewählter Art.
  var wtMode=(existing&&existing.wt==="side")?"side":"total";
  var wtWrap=el("div");wtWrap.appendChild(el("label",null,"Gewicht zählt als"));
  var wtSeg=el("div","segbtn");
  [["total","Gesamtgewicht"],["side","Pro Seite"]].forEach(function(o){
    var bb=el("button",null,o[1]);bb.type="button";bb.setAttribute("aria-selected",String(wtMode===o[0]));
    bb.onclick=function(){wtMode=o[0];Array.prototype.forEach.call(wtSeg.children,function(c){c.setAttribute("aria-selected",String(c===bb));});};
    wtSeg.appendChild(bb);
  });
  wtWrap.appendChild(wtSeg);
  wtWrap.appendChild(el("p","note","Bei Kurzhanteln meist „Pro Seite“ (Gewicht je Hantel) – die Gesamtlast ist dann das Doppelte. Bei Maschine oder Langhantel „Gesamtgewicht“."));
  b.appendChild(wtWrap);
  function syncWtVisibility(){wtWrap.hidden=typeSel.value!=="load";}
  typeSel.addEventListener("change",syncWtVisibility);syncWtVisibility();

  // Einseitig (z. B. einarmig/einbeinig) – dann werden links/rechts beim Eintragen getrennt erfasst.
  var uniMode=!!(existing&&existing.uni);
  var uniWrap=el("div");uniWrap.appendChild(el("label",null,"Ausführung"));
  var uniSeg=el("div","segbtn");
  [[false,"Beidseitig"],[true,"Einseitig (L/R getrennt)"]].forEach(function(o){
    var bb=el("button",null,o[1]);bb.type="button";bb.setAttribute("aria-selected",String(uniMode===o[0]));
    bb.onclick=function(){uniMode=o[0];Array.prototype.forEach.call(uniSeg.children,function(c){c.setAttribute("aria-selected",String(c===bb));});};
    uniSeg.appendChild(bb);
  });
  uniWrap.appendChild(uniSeg);
  b.appendChild(uniWrap);

  // Manche eingebauten Uebungen (z.B. Ueberzuege) fuehren denselben Muskel historisch in
  // p UND s - exInvolve/exHits werten das schon immer als "primaer" (p gewinnt), aber ohne
  // diesen Filter wuerde die neue Prozent-Liste unten die Zeile doppelt anzeigen.
  var pri=existing?(existing.p||[]).slice():[],
      sec=existing?(existing.s||[]).slice().filter(function(id){return pri.indexOf(id)<0;}):[];
  var existingPct=existing?exPctInv(existing):null;
  var pctById={};
  pri.forEach(function(id){pctById[id]=existingPct&&existingPct[id]!=null?Math.round(existingPct[id]*100):100;});
  sec.forEach(function(id){pctById[id]=existingPct&&existingPct[id]!=null?Math.round(existingPct[id]*100):50;});
  var figs=exFormFigs(function(){
    var inv={};
    pri.forEach(function(g){inv[g]=1;});
    sec.forEach(function(g){if(!(inv[g]>=1))inv[g]=0.5;});
    return inv;
  });
  function refreshFigs(){figs.refresh();pctField.render();}
  var priField=muscleSelectField("Primärmuskeln",MUSCLES,pri,
    function(id,on){if(on){var i=sec.indexOf(id);if(i>=0){sec.splice(i,1);secField.setPressed(id,false);}if(pctById[id]==null)pctById[id]=100;}},refreshFigs);
  var secField=muscleSelectField("Sekundärmuskeln (halber Satz)",MUSCLES,sec,
    function(id,on){if(on){var i=pri.indexOf(id);if(i>=0){pri.splice(i,1);priField.setPressed(id,false);}if(pctById[id]==null)pctById[id]=50;}},refreshFigs);
  var pctField=pctListField(function(){return pri.concat(sec);},pctById);
  b.appendChild(el("label",null,"Vorschau"));
  b.appendChild(figs);
  b.appendChild(priField);b.appendChild(secField);
  b.appendChild(pctField);
  refreshFigs();
  b.appendChild(el("p","note","Primärmuskeln zählen mit vollem, Sekundärmuskeln mit halbem Satz fürs Wochenvolumen, sofern der Anteil oben nicht geändert wurde."));

  var err=el("p","note","");err.style.color="var(--red)";err.hidden=true;b.appendChild(err);

  return {
    nameI:nameI,
    getPatch:function(){
      var name=nameI.value.trim();
      if(!name){err.textContent="Bitte einen Namen eingeben.";err.hidden=false;nameI.focus();return null;}
      if(!pri.length){err.textContent="Bitte mindestens einen Primärmuskel wählen.";err.hidden=false;return null;}
      var patch={n:name,t:typeSel.value,pat:patSel.value,e:eqI.value.trim()||"Sonstiges",p:pri.slice(),s:sec.slice()};
      var pctOut={};
      pri.concat(sec).forEach(function(id){pctOut[id]=pctById[id]!=null?pctById[id]:(pri.indexOf(id)>=0?100:50);});
      patch.pct=pctOut;
      if(patSel.value==="mob")patch.mob=true;
      if(typeSel.value==="load"&&wtMode==="side")patch.wt="side";
      if(uniMode)patch.uni=true;
      return patch;
    }
  };
}
function sheetCreateExercise(kinds,onPick){
  openSheet(function(b){
    sheetTitle(b,"Neue Übung");
    var form=exerciseForm(b,null);
    var save=el("button","btn primary block","Übung anlegen");save.style.marginTop="14px";
    save.onclick=function(){
      var patch=form.getPatch();if(!patch)return;
      var created=addCustomExercise(patch);
      toast("Übung angelegt");
      onPick(created);
    };
    b.appendChild(save);
    var cancel=el("button","btn ghost block","Abbrechen");cancel.style.marginTop="8px";
    cancel.onclick=function(){openSheet(function(bb){sheetTitle(bb,"Übung wählen");exPicker(bb,kinds,onPick);});};
    b.appendChild(cancel);
    setTimeout(function(){try{form.nameI.focus();}catch(e){}},250);
  });
}
// Jede Übung lässt sich anpassen – eigene wie eingebaute. Bei eingebauten Übungen wird die
// Änderung als Override gespeichert (state.exOverrides), nicht die EX-Grunddaten selbst, damit
// sich das jederzeit wieder auf den Originalzustand zurücksetzen lässt.
function sheetEditExercise(ex,onDone){
  openSheet(function(b){
    sheetTitle(b,"Übung bearbeiten");
    var form=exerciseForm(b,ex);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="14px";
    save.onclick=function(){
      var patch=form.getPatch();if(!patch)return;
      if(ex.custom){
        Object.keys(ex).forEach(function(k){if(k!=="id"&&k!=="custom")delete ex[k];});
        Object.assign(ex,patch);saveLocal();secDirty.entdecken=true;
      } else {
        setExOverride(ex.id,patch);
      }
      toast("Übung aktualisiert");
      onDone(ex);
    };
    b.appendChild(save);
    if(!ex.custom&&state.exOverrides&&state.exOverrides[ex.id]){
      var reset=el("button","btn ghost block","Auf Standard zurücksetzen");reset.style.marginTop="8px";
      reset.onclick=function(){
        askConfirm("Auf Standard zurücksetzen?","Deine Änderungen an „"+ex.n+"“ werden verworfen.","Zurücksetzen",function(){
          resetExOverride(ex.id);toast("Zurückgesetzt");onDone(exById(ex.id));
        },true);
      };
      b.appendChild(reset);
    }
    var cancel=el("button","btn ghost block","Abbrechen");cancel.style.marginTop="8px";
    cancel.onclick=function(){onDone(ex);};
    b.appendChild(cancel);
    setTimeout(function(){try{form.nameI.focus();}catch(e){}},250);
  });
}
/* Wie stark trifft eine Übung die genannten Muskeln? 1 = Primärmuskel (starker Fokus),
   0,5 = Sekundärmuskel (wird mittrainiert), 0 = gar nicht. */
function exHits(e,ids){
  var v=0;
  ids.forEach(function(g){
    if((e.p||[]).indexOf(g)>=0){if(v<1)v=1;}
    else if((e.s||[]).indexOf(g)>=0){if(v<0.5)v=0.5;}
    else if((e.st||[]).indexOf(g)>=0){if(v<0.25)v=0.25;}
  });
  return v;
}
/* Wie stark trifft eine Uebung einen Muskel WIRKLICH - fein abgestuft ueber EX_PCT (100 % =
   die beste Uebung dafuer im ganzen Katalog), statt nur grob ueber Primaer-/Sekundaermuskel.
   Der Ueberzug zaehlt fuer den Latissimus z.B. als Primaermuskel (steht in ex.p), liegt aber
   bei nur 22 % - ohne diese feinere Sortierung stuende er trotzdem vor dem Klimmzug (100 %).
   Faellt auf exHits zurueck, wenn fuer die Uebung noch kein Prozentwert hinterlegt ist. */
function exFocusScore(e,ids){
  var pct=exPctInv(e),v=0;
  ids.forEach(function(g){
    var s=pct?(pct[g]||0):0;
    if(s>v)v=s;
  });
  return pct?v:exHits(e,ids);
}
// Gewählten Chip in die Mitte der Leiste holen – sonst steht die Auswahl außerhalb des Bildes.
function centerChip(bar){
  var c=bar.querySelector('.fchip[aria-pressed="true"]');if(!c)return;
  bar.scrollLeft=Math.max(0,c.offsetLeft-bar.clientWidth/2+c.offsetWidth/2);
}
/* Übungsauswahl: gefiltert nach Muskeln – oben die großen Regionen (Brust, Rücken …),
   darunter deren einzelne Muskeln (obere/mittlere/untere Brust …). Getrennt gelistet nach
   „starker Fokus“ (Primärmuskel) und „wird mittrainiert“ (Sekundärmuskel). */
function equipOptions(){
  var counts={};
  EX.forEach(function(e){
    if(e.t==="cardio"||!e.e||e.e==="—")return;
    counts[e.e]=(counts[e.e]||0)+1;
  });
  return Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];});
}
function exPicker(b,kinds,onPick,opts){
  opts=opts||{};
  var q="",reg=opts.region||null,fine=null,mk=null,mArea=null;
  var equip=[];
  var searchRow=el("div","searchrow");
  var search=document.createElement("input");
  search.type="search";search.placeholder="Übung suchen…";search.autocomplete="off";
  searchRow.appendChild(search);
  var filterBtn=el("button","filterbtn");filterBtn.type="button";filterBtn.setAttribute("aria-label","Filter");
  filterBtn.innerHTML=svgIcon(IC_FILTER,1.8);
  var filterBadge=el("span","badge");filterBadge.hidden=true;filterBtn.appendChild(filterBadge);
  function updateFilterBadge(){
    filterBadge.hidden=!equip.length;
    if(equip.length)filterBadge.textContent=String(equip.length);
    filterBtn.setAttribute("data-active",String(!!equip.length));
  }
  filterBtn.onclick=function(){
    openEquipFilterMenu(equip,function(){draw();updateFilterBadge();},function(){return filteredArr().length;});
  };
  searchRow.appendChild(filterBtn);
  b.appendChild(searchRow);
  // Dieselbe Kachel-Optik wie im Entdecken-Tab (renderDiscMuscleGrid): eine Kachel pro Region
  // mit der markierten Muskelflaeche auf der Koerperfigur, plus die Cardio-Kachel mit dem
  // Laufband, statt einer reinen Text-Chip-Leiste. Erneutes Antippen einer bereits gewaehlten
  // Kachel hebt die Auswahl wieder auf (kein extra "Alle"-Element - genau wie bei Entdecken).
  var chips=el("div","disc-mgrid"),sub=el("div","chipbar sub"),sub2=el("div","chipbar sub");
  function regionChips(){
    chips.innerHTML="";
    // opts.mob: Mobilitätsübungen gehören auch ins Training und in Einheiten, Ausdauer nicht.
    REGIONS.concat(opts.cardio?[CARDIO_REGION,MOB_REGION]:opts.mob?[MOB_REGION]:[]).forEach(function(rg){
      var card=el("button","disc-mcard");card.type="button";
      card.setAttribute("aria-pressed",String(reg===rg));
      if(rg.cardio){
        card.appendChild(cardioTreadmillIcon());
      }else if(rg.mobility){
        card.appendChild(mobBandIcon());
      }else{
        var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
        sv.setAttribute("viewBox",regionCropCache[rg.key||rg.name]||CROP_DEFAULT);
        sv.setAttribute("data-region",rg.key||rg.name);
        sv.setAttribute("role","img");sv.setAttribute("aria-label",rg.name);
        card.appendChild(sv);
      }
      card.appendChild(el("span",null,rg.name));
      card.onclick=function(){reg=(reg===rg?null:rg);fine=null;mk=null;mArea=null;regionChips();subChips();draw();};
      chips.appendChild(card);
    });
    discLazyObserve(chips);
  }
  function subChips(){
    sub.innerHTML="";sub.hidden=!reg;sub2.innerHTML="";sub2.hidden=!(reg&&reg.mobility);
    if(!reg)return;
    if(reg.mobility){
      mobAreaChips(sub2,mArea,function(a){mArea=a;subChips();draw();});
      MOB_KINDS.forEach(function(k){
        var c=el("button","fchip",k[1]);c.type="button";
        c.setAttribute("aria-pressed",String(mk===k[0]));
        c.onclick=function(){mk=k[0];subChips();draw();};
        sub.appendChild(c);
      });
      centerChip(sub);
      return;
    }
    var all=el("button","fchip","Ganze Region");all.type="button";all.setAttribute("aria-pressed",String(!fine));
    all.onclick=function(){fine=null;subChips();draw();};
    sub.appendChild(all);
    reg.ids.forEach(function(id){
      var m=muscleById(id);if(!m)return;
      var c=el("button","fchip",m.name);c.type="button";c.setAttribute("aria-pressed",String(fine===id));
      c.onclick=function(){fine=id;subChips();draw();};
      sub.appendChild(c);
    });
    centerChip(sub);
  }
  if(!kinds){regionChips();subChips();b.appendChild(chips);b.appendChild(sub);b.appendChild(sub2);}
  var addBtn=el("div","exadd");addBtn.appendChild(el("b",null,"+ Neue Übung erstellen"));
  addBtn.onclick=function(){sheetCreateExercise(kinds,onPick);};
  b.appendChild(addBtn);
  var list=el("div","exlist exlist-cards");b.appendChild(list);
  function item(e){
    return discExCard(e,onPick,function(){draw();});
  }
  function filteredArr(){
    var mobMode=!!(reg&&reg.mobility);
    var qq=q.toLowerCase(),ids=mobMode?null:(fine?[fine]:(reg?reg.ids:null));
    var cardioMode=!!(reg&&reg.cardio);
    return EX.filter(function(e){
      if(kinds){if(kinds.indexOf(e.t)<0)return false;}
      else if(mobMode){if(!e.mob)return false;if(mk&&e.mk!==mk)return false;if(mArea&&mobAreaWeight(e,mArea)!==1)return false;}
      else if(e.mob)return false;
      else if(cardioMode){if(e.t!=="cardio")return false;}
      else if(e.t==="cardio")return false;
      if(qq&&e.n.toLowerCase().indexOf(qq)<0&&(e.e||"").toLowerCase().indexOf(qq)<0)return false;
      if(equip.length&&equip.indexOf(e.e)<0)return false;
      if(ids&&!exHits(e,ids))return false;
      return true;
    });
  }
  function draw(){
    list.innerHTML="";
    var ids=(reg&&reg.mobility)?null:(fine?[fine]:(reg?reg.ids:null));
    var arr=filteredArr();
    if(!arr.length){list.appendChild(el("div","empty","Nichts gefunden."));return;}
    // Großzügige Obergrenzen statt einer harten Kappung – der Katalog soll wirklich ALLE
    // Übungen zeigen können, nicht nur die ersten paar (früher 90/60, das reichte bei
    // wachsendem Katalog nicht mehr für die ungefilterte "Alle"-Ansicht).
    if(reg&&reg.mobility&&!mArea&&!q){mobGrouped(arr,list,item);discLazyObserve(list);return;}
    if(!ids){arr.slice(0,600).forEach(function(e){list.appendChild(item(e));});discLazyObserve(list);return;}
    var pri=arr.filter(function(e){return exHits(e,ids)>=1;}).slice(0,300);
    var sec=arr.filter(function(e){return exHits(e,ids)<1;}).slice(0,300);
    pri.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
    sec.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
    var name=fine?muscleById(fine).name:reg.name;
    if(pri.length){
      list.appendChild(el("div","grouplab","Starker Fokus · "+name));
      pri.forEach(function(e){list.appendChild(item(e));});
    }
    if(sec.length){
      list.appendChild(el("div","grouplab","Wird mittrainiert"));
      sec.forEach(function(e){list.appendChild(item(e));});
    }
    discLazyObserve(list);
  }
  search.addEventListener("input",function(){q=this.value;draw();});
  draw();
}
/* ================= Übungskatalog (eigenständig ansehen/anlegen) ================= */
// Nutzt exPicker unverändert (Suche, Regionfilter, "+ Neue Übung erstellen", Löschen eigener
// Übungen) – bisher nur innerhalb der Trainings-/Einheiten-Erstellung erreichbar. Hier als
// eigener Einstiegspunkt: Antippen zeigt Details statt die Übung irgendwo einzutragen.
function openExerciseCatalog(){
  openSheet(function(b){sheetTitle(b,"Übungskatalog");exPicker(b,null,sheetExerciseDetail);});
}
// Body-Scroll bleibt gesperrt, solange entweder das Bottom-Sheet ODER die Übungsdetail-Vollbild-
// seite offen ist – beide können unabhängig voneinander (auf-)geschlossen werden (Bearbeiten
// öffnet z. B. ein Sheet OBEN AUF der Detailseite).
function syncScrollLock(){
  var sheetOpen=($("sheet")&&$("sheet").classList.contains("open"))||($("sheet2")&&$("sheet2").classList.contains("open"));
  var pageOpen=$("exdpage")&&!$("exdpage").hidden;
  document.body.style.overflow=(sheetOpen||pageOpen)?"hidden":"";
}
function openSheet2(build){
  var b=$("sheet2-body");b.innerHTML="";build(b);
  $("scrim2").classList.add("open");$("sheet2").classList.add("open");
  syncScrollLock();
}
function closeSheet2(){
  $("scrim2").classList.remove("open");$("sheet2").classList.remove("open");
  syncScrollLock();
}
$("scrim2").addEventListener("click",closeSheet2);
function openEquipFilterMenu(selected,onChange,countFn){
  openSheet2(function(b){
    var head=el("div","sheet-title-row");
    head.appendChild(el("h3",null,"Filter"));
    var close=el("button","iconbtn");close.type="button";close.setAttribute("aria-label","Schließen");
    close.innerHTML=svgIcon(IC_X,2);close.onclick=closeSheet2;
    head.appendChild(close);
    b.appendChild(head);
    b.appendChild(el("h2","sec","Ausrüstung"));
    var grid=el("div","equip-grid");
    var applyBtn=el("button","btn primary block","");applyBtn.type="button";
    function refreshCount(){
      var n=countFn();
      applyBtn.textContent=n+" Übung"+(n===1?"":"en")+" anzeigen";
    }
    equipOptions().forEach(function(eq){
      var card=el("button","equip-card");card.type="button";
      card.setAttribute("aria-pressed",String(selected.indexOf(eq)>=0));
      card.innerHTML=equipIcon(eq);
      card.appendChild(el("span",null,eq));
      card.onclick=function(){
        var i=selected.indexOf(eq);
        if(i>=0)selected.splice(i,1);else selected.push(eq);
        card.setAttribute("aria-pressed",String(i<0));
        onChange();refreshCount();
      };
      grid.appendChild(card);
    });
    b.appendChild(grid);
    var foot=el("div","equip-sheet-foot");
    var clearBtn=el("button","linkbtn","Alles löschen");clearBtn.type="button";
    clearBtn.onclick=function(){
      selected.length=0;
      Array.prototype.forEach.call(grid.children,function(c){c.setAttribute("aria-pressed","false");});
      onChange();refreshCount();
    };
    foot.appendChild(clearBtn);foot.appendChild(applyBtn);
    b.appendChild(foot);
    applyBtn.onclick=closeSheet2;
    refreshCount();
  });
}
// Sheets, die beim Oeffnen der Detailseite offen waren. Sie werden nur unsichtbar
// gemacht, nicht geschlossen - ihr Inhalt bleibt genau so stehen, wie er war.
var exPageBack=[];
function hideOpenSheets(){
  var out=[];
  ["scrim","sheet","scrim2","sheet2"].forEach(function(id){
    var n=$(id);
    if(n&&n.classList.contains("open")){n.style.display="none";out.push(n);}
  });
  return out;
}
function showHiddenSheets(list){
  (list||[]).forEach(function(n){if(n)n.style.display="";});
}
