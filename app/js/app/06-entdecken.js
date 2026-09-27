/* ==========================================================
   app/06-entdecken.js - Entdecken-Tab: Suche, Filter, Ausruestung, Muskelgruppen-Kacheln, Uebungskarten
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Entdecken (Übungskatalog zum Durchstöbern) ================= */
// Eigener Tab: Muskelgruppen-Kacheln (jede mit einer Körperfigur, bei der die ganze Region
// hervorgehoben ist) zum Filtern, darunter eine Kartenliste aller Übungen – jede Karte mit
// einer kleinen Figur, die zeigt, welche Muskeln sie trainiert (Vorderansicht reicht fürs
// schnelle Durchstöbern; Details/Rückansicht gibt's weiter per Tap im Übungskatalog-Sheet).
// discMk: bei der Mobilitaets-Kachel steht hier "stat" oder "dyn" statt eines Muskels -
// die beiden Arten schliessen sich gegenseitig aus, deshalb ein eigener Zustand.
// discMobArea: bei Mobilität zusätzlich ein Körperbereich (MOB_AREAS), sonst null.
var discRegion=null, discQuery="", discFine=null, discMk=null, discMobArea=null, discObserver=null, discEquip=[];
// Die beiden Arten von Mobilitaetsarbeit. null = beide zusammen.
// "Gehalten" (Dehnen) und "bewegt" (Kreisen, Drehen, Pendeln) - dieselben Worte wie in der
// Mobilitätsansicht des Körper-Tabs.
var MOB_KINDS=[[null,"Alles"],["stat","Gehalten"],["dyn","Bewegt"]];
function mobKindLabel(mk){return mk==="dyn"?"Bewegt":mk==="stat"?"Gehalten":"";}
function regionInvolve(region){
  var inv={};region.ids.forEach(function(id){inv[id]=1;});
  return inv;
}
// Regionen, deren Muskeln überwiegend/ganz auf der Rückseite liegen, sollen als
// Rückansicht dargestellt werden – von vorn wären sie auf der Figur nicht zu sehen.
var REGION_VIEW={"Rücken":"back","Rückenstrecker":"back","Gesäß":"back","Nacken":"back",
                 "Trizeps":"back","Beinbeuger":"back","Waden":"back"};
/* Die Gruppenkacheln zeigten bisher die ganze Figur in voller Hoehe - die markierte Stelle
   war dadurch winzig, bei den Waden praktisch nicht zu erkennen. Jetzt wird in jede Kachel
   ein Ausschnitt gleicher Groesse gelegt, zentriert auf die markierte (rote) Flaeche.
   Die Lage wird aus dem fertigen Bild gemessen statt in einer Tabelle gepflegt: eine neue
   oder umbenannte Gruppe bekommt damit automatisch den richtigen Ausschnitt. */
var CROP_W=200, CROP_H=250, SNAP_W=260, SNAP_H=520;
var regionCropCache={};
function cropBox(cx,cy){
  var x=clamp(cx*SNAP_W-CROP_W/2,0,SNAP_W-CROP_W),
      y=clamp(cy*SNAP_H-CROP_H/2,0,SNAP_H-CROP_H);
  return x+" "+y+" "+CROP_W+" "+CROP_H;
}
var CROP_DEFAULT=cropBox(0.5,0.42);
// Schwerpunkt der markierten Flaeche. Gemessen wird auf einem stark verkleinerten Abzug -
// fuer die Mitte eines Bereichs reicht das und kostet praktisch nichts.
function fw3dHotCenter(url,cb){
  var img=new Image();
  img.onload=function(){
    try{
      var W=64,H=128,cv=document.createElement("canvas");cv.width=W;cv.height=H;
      var ctx=cv.getContext("2d",{willReadFrequently:true});
      ctx.drawImage(img,0,0,W,H);
      var d=ctx.getImageData(0,0,W,H).data,x0=W,y0=H,x1=-1,y1=-1,x,y,i;
      for(y=0;y<H;y++)for(x=0;x<W;x++){
        i=(y*W+x)*4;
        if(d[i+3]>40&&d[i]>110&&d[i]>d[i+1]+45&&d[i]>d[i+2]+45){
          if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
      }
      cb(x1<0?null:[(x0+x1+1)/2/W,(y0+y1+1)/2/H]);
    }catch(e){cb(null);}
  };
  img.onerror=function(){cb(null);};
  img.src=url;
}
var regionFigCache={};
/* Das fertige Standbild je Region wird gemerkt. Vorher hing jede Kachel und jede Listenzeile
   an der Standbild-Warteschlange: die Liste wird bei jedem Tipp neu aufgebaut, dabei entstehen
   15 neue SVGs, die 15 neue Auftraege stellen - und die alten, noch laufenden Auftraege
   schreiben danach in Elemente, die es nicht mehr gibt. Die Warteschlange kam so nie zur Ruhe.
   Jetzt wird ein Bild genau einmal gerendert; alle spaeteren Zeilen bekommen es sofort, und
   mehrere Wartende auf dasselbe Bild teilen sich EINEN Auftrag. */
var regionFigUrl={}, regionFigWait={};
function fw3dPutImage(svg,url,crop){
  try{
    svg.innerHTML="";
    svg.setAttribute("viewBox",crop||"0 0 260 520");
    svg.setAttribute("preserveAspectRatio","xMidYMid meet");
    var im=document.createElementNS("http://www.w3.org/2000/svg","image");
    im.setAttribute("class","fw-fig-in");im.setAttribute("x","0");im.setAttribute("y","0");
    im.setAttribute("width","260");im.setAttribute("height","520");
    im.setAttribute("preserveAspectRatio","xMidYMid meet");
    im.setAttribute("href",url);
    im.setAttributeNS("http://www.w3.org/1999/xlink","href",url);
    svg.appendChild(im);
  }catch(e){}
}
function fillRegionFig(svg){
  if(svg.getAttribute("data-filled"))return;
  var name=svg.getAttribute("data-region"),region=REGIONS.find(function(r){return (r.key||r.name)===name;});
  if(!region)return;
  svg.setAttribute("data-filled","1");
  var crop=regionCropCache[name]||CROP_DEFAULT;
  svg.setAttribute("data-crop",crop);
  if(regionFigUrl[name]){fw3dPutImage(svg,regionFigUrl[name],crop);return;}
  if(regionFigWait[name]){regionFigWait[name].push(svg);return;}
  regionFigWait[name]=[svg];
  var view=REGION_VIEW[name]||"front",inv=regionInvolve(region);
  var cols=fw3dColorsForInvolve(inv,null),ft=fw3dForceTransparentForInv(inv,null,null);
  // Schluessel exakt wie in fw3dSnapInto, damit beide denselben Zwischenspeicher nutzen.
  fw3dSnapRequest("rg:"+name+"|"+view+(ft?"|ft":""),cols,view,function(url){
    regionFigUrl[name]=url;
    var waiting=regionFigWait[name]||[];regionFigWait[name]=null;
    function paintAll(){
      var cr=regionCropCache[name]||CROP_DEFAULT;
      waiting.forEach(function(s){if(s&&s.parentNode)fw3dPutImage(s,url,cr);});
      document.querySelectorAll('svg[data-region="'+name+'"]').forEach(function(s){
        s.setAttribute("data-crop",cr);
        if(s.querySelector("image"))s.setAttribute("viewBox",cr);
      });
    }
    if(regionCropCache[name]){paintAll();return;}
    // Ausschnitt einmal aus dem fertigen Bild messen - kein Warte-Ticker mehr noetig.
    fw3dHotCenter(url,function(c){
      if(c)regionCropCache[name]=cropBox(c[0],c[1]);
      paintAll();
    });
  },false,ft);
}
// Figuren erst füllen, wenn die Karte wirklich im sichtbaren Bereich ist – bei 150+ Übungen
// spart das beim Öffnen des Tabs unnötiges Rendern weit außerhalb des Bildschirms.
function discLazyObserve(root){
  if(!discObserver){
    discObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        var svg=en.target;
        if(svg.hasAttribute("data-region"))fillRegionFig(svg);else fillExFig(svg);
        discObserver.unobserve(svg);
      });
    },{rootMargin:"200px"});
  }
  Array.prototype.forEach.call(root.querySelectorAll("svg[data-ex],svg[data-region]"),function(svg){discObserver.observe(svg);});
}
function renderDiscEquipChips(){
  var btn=$("disc-filterbtn");if(!btn)return;
  if(!btn.dataset.init){
    btn.innerHTML=svgIcon(IC_FILTER,1.8)+'<span class="badge" hidden></span>';
    btn.dataset.init="1";
  }
  var badge=btn.querySelector(".badge");
  badge.hidden=!discEquip.length;
  if(discEquip.length)badge.textContent=String(discEquip.length);
  btn.setAttribute("data-active",String(!!discEquip.length));
  btn.onclick=function(){
    openEquipFilterMenu(discEquip,function(){renderDiscExGrid();renderDiscEquipChips();},function(){return discExList().length;});
  };
}
function discExList(){
  var q=discQuery.trim().toLowerCase();
  var cardioMode=!!(discRegion&&discRegion.cardio);
  var mobMode=!!(discRegion&&discRegion.mobility);
  // Bei Mobilitaet wird nicht nach Muskeln gefiltert (fast jede Dehnung trifft mehrere
  // Regionen), sondern ueber ex.mob und die gewaehlte Art.
  var ids=mobMode?null:(discFine?[discFine]:(discRegion?discRegion.ids:null));
  return EX.filter(function(e){
    if(mobMode){if(!e.mob)return false;if(discMk&&e.mk!==discMk)return false;if(discMobArea&&mobAreaWeight(e,discMobArea)!==1)return false;}
    else if(e.mob)return false;
    else if(cardioMode){if(e.t!=="cardio")return false;}
    else if(e.t==="cardio")return false;
    if(q&&e.n.toLowerCase().indexOf(q)<0&&(e.e||"").toLowerCase().indexOf(q)<0)return false;
    if(discEquip.length&&discEquip.indexOf(e.e)<0)return false;
    if(ids&&!exHits(e,ids))return false;
    return true;
  });
}
// Laufband-Bild fuer die Cardio-Kachel: neues Referenzbild des Nutzers. Es kam bereits mit
// Transparenz, hatte aber einen halbtransparenten Schleier rund um das Geraet - der faellt auf
// dunklem Grund als grauer Hof auf. Darum harte Kante (Alpha unter 90 raus, Rest voll deckend),
// auf den Inhalt zugeschnitten und auf 256 Farben reduziert: sieht bei Kachelgroesse identisch
// aus, braucht aber ein Drittel des Platzes des vorherigen Bildes.
/* CARDIO_ICON_B64: ausgelagert nach assets/icon-ausdauer.js */
function cardioTreadmillIcon(){
  var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
  // Gleiches Seitenverhaeltnis wie CROP_W/CROP_H (200x250), damit die Kachel genau so hoch
  // wird wie alle anderen Muskel-Kacheln im Raster.
  sv.setAttribute("viewBox","0 0 200 250");
  sv.setAttribute("role","img");sv.setAttribute("aria-label","Cardio");
  var im=document.createElementNS("http://www.w3.org/2000/svg","image");
  // Bild ist 400x379 - komplett ohne Beschnitt einpassen, damit nichts vom Laufband
  // (Konsole, Griffe, Standfuss) abgeschnitten wird.
  // Skalierung = min(200/400, 250/379) = 0.5 -> Breite 200, Hoehe 189,5, Rand oben/unten 30,25.
  im.setAttribute("x","0");im.setAttribute("y","30.25");
  im.setAttribute("width","200");im.setAttribute("height","189.5");
  im.setAttribute("preserveAspectRatio","xMidYMid meet");
  im.setAttribute("href","data:image/png;base64,"+CARDIO_ICON_B64);
  im.setAttributeNS("http://www.w3.org/1999/xlink","href","data:image/png;base64,"+CARDIO_ICON_B64);
  sv.appendChild(im);
  return sv;
}
// Bild der Mobilitaets-Kachel: das vom Nutzer vorgegebene Foto eines Gummibandsatzes.
// Vorgehen wie beim Laufband, damit die beiden Sonderkacheln zusammenpassen: Hintergrund
// freigestellt (die zusammenhaengende helle Flaeche vom Rand her entfernt, danach den Saum
// um zwei Pixel abgetragen - sonst bleibt auf dunklem Grund ein heller Hof stehen), auf den
// Inhalt zugeschnitten, auf 340 Pixel Breite verkleinert, 128 Farben.
/* MOB_ICON_B64: ausgelagert nach assets/icon-mobilitaet.js */
function mobBandIcon(){
  var NS="http://www.w3.org/2000/svg";
  var sv=document.createElementNS(NS,"svg");
  // Gleiches Seitenverhaeltnis wie die uebrigen Kacheln (200x250).
  sv.setAttribute("viewBox","0 0 200 250");
  sv.setAttribute("role","img");sv.setAttribute("aria-label","Mobilität");
  var im=document.createElementNS(NS,"image");
  // Bild ist 340x342 - vollstaendig einpassen, nichts abschneiden.
  // Skalierung = min(200/340, 250/342) = 0,588 -> Breite 200, Hoehe 201,2, Rand oben/unten 24,4.
  im.setAttribute("x","0");im.setAttribute("y","24.4");
  im.setAttribute("width","200");im.setAttribute("height","201.2");
  im.setAttribute("preserveAspectRatio","xMidYMid meet");
  im.setAttribute("href","data:image/png;base64,"+MOB_ICON_B64);
  im.setAttributeNS("http://www.w3.org/1999/xlink","href","data:image/png;base64,"+MOB_ICON_B64);
  sv.appendChild(im);
  return sv;
}
function renderDiscMuscleGrid(){
  var mgrid=$("disc-mgrid");mgrid.innerHTML="";
  REGIONS.concat([CARDIO_REGION,MOB_REGION]).forEach(function(rg){
    var card=el("button","disc-mcard");card.type="button";
    card.setAttribute("aria-pressed",String(discRegion===rg));
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
    card.onclick=function(){discRegion=(discRegion===rg?null:rg);discFine=null;discMk=null;discMobArea=null;renderDiscMuscleGrid();renderDiscSubChips();renderDiscExGrid();};
    mgrid.appendChild(card);
  });
  discLazyObserve(mgrid);
}
// Feinfilter: nach Wahl einer Muskelgruppe erscheinen darunter Chips für ihre Einzelmuskeln
// (z.B. Brust → Obere/Mittlere/Untere Brust), damit man gezielter als nach grober Region suchen kann.
function renderDiscSubChips(){
  var sub=$("disc-subchips");sub.innerHTML="";sub.hidden=!discRegion;
  // Zweite Zeile nur bei Mobilität: Körperbereiche. Wird bei Bedarf einmal angelegt.
  var sub2=$("disc-mobareas");
  if(!sub2){sub2=el("div","chipbar sub");sub2.id="disc-mobareas";sub.parentNode.insertBefore(sub2,sub.nextSibling);}
  sub2.innerHTML="";sub2.hidden=!(discRegion&&discRegion.mobility);
  if(!discRegion)return;
  if(discRegion.mobility)mobAreaChips(sub2,discMobArea,function(a){discMobArea=a;renderDiscSubChips();renderDiscExGrid();});
  // Unter der Mobilitaets-Kachel stehen keine Einzelmuskeln, sondern die zwei Arten:
  // gehalten (Dehnen) und bewegt (Mobilisieren). Das ist der eigentliche Unterschied -
  // nach Muskeln sortiert waere hier fast jede Uebung ueberall dabei.
  if(discRegion.mobility){
    MOB_KINDS.forEach(function(k){
      var c=el("button","fchip",k[1]);c.type="button";
      c.setAttribute("aria-pressed",String(discMk===k[0]));
      c.onclick=function(){discMk=k[0];renderDiscSubChips();renderDiscExGrid();};
      sub.appendChild(c);
    });
    centerChip(sub);
    return;
  }
  var all=el("button","fchip","Ganze Region");all.type="button";all.setAttribute("aria-pressed",String(!discFine));
  all.onclick=function(){discFine=null;renderDiscSubChips();renderDiscExGrid();};
  sub.appendChild(all);
  discRegion.ids.forEach(function(id){
    var m=muscleById(id);if(!m)return;
    var c=el("button","fchip",m.name);c.type="button";c.setAttribute("aria-pressed",String(discFine===id));
    c.onclick=function(){discFine=id;renderDiscSubChips();renderDiscExGrid();};
    sub.appendChild(c);
  });
  centerChip(sub);
}
// Grobe Region(en) der Primärmuskeln einer Übung – als unauffällige Unterzeile unter dem
// Namen, damit man auf einen Blick sieht, worauf die Übung hauptsächlich zielt.
function exPrimaryRegionLabel(ex){
  var names=[];
  (ex.p||[]).forEach(function(id){
    var rg=REGIONS.find(function(r){return r.ids.indexOf(id)>=0;});
    if(rg&&names.indexOf(rg.name)<0)names.push(rg.name);
  });
  return names.join(" · ");
}
function discExCard(ex,onPick,onDelete){
  var card=el("div","disc-excard tap");
  var thumbs=el("div","disc-thumbs");
  [["front","Vorderansicht"],["back","Rückansicht"]].forEach(function(vv){
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",vv[0]);
    sv.setAttribute("role","img");sv.setAttribute("aria-label",vv[1]+", beanspruchte Muskeln, "+ex.n);
    var thumb=el("div","disc-thumb");thumb.appendChild(sv);
    thumbs.appendChild(thumb);
  });
  card.appendChild(thumbs);
  var txt=el("div","disc-extxt");
  txt.appendChild(el("b",null,ex.n));
  txt.appendChild(el("span","disc-muscle",exPrimaryRegionLabel(ex)||exTypeLabel(ex)));
  var tags=el("div","disc-tags");
  if(ex.e)tags.appendChild(el("span","chip-s",ex.e));
  var tl=exTypeLabel(ex);if(tl)tags.appendChild(el("span","chip-s",tl+(ex.uni?" · einseitig":"")));
  if(ex.custom)tags.appendChild(el("span","chip-s acc","Eigene Übung"));
  else if(state.exOverrides&&state.exOverrides[ex.id])tags.appendChild(el("span","chip-s acc","Angepasst"));
  txt.appendChild(tags);
  card.appendChild(txt);
  if(!onPick){var cv=el("span","disc-chev");cv.innerHTML=svgIcon(IC_CHEV);card.appendChild(cv);}
  if(onPick){
    // In der Auswahl ist Auswaehlen die Hauptsache, im Entdecken-Tab das Nachschlagen.
    // Deshalb waehlt hier die Karte aus, und die Details liegen auf dem "i" daneben.
    card.onclick=function(){onPick(ex);};
    if(onPick!==sheetExerciseDetail){
      var info=el("button","iconbtn disc-cardbtn info");info.type="button";
      info.setAttribute("aria-label","Details zu "+ex.n);
      info.innerHTML=svgIcon(IC_INFO,1.9);
      info.onclick=function(ev){ev.stopPropagation();sheetExerciseDetail(ex);};
      card.appendChild(info);
    }
    if(ex.custom&&onDelete){
      var del=el("button","iconbtn disc-cardbtn del");del.type="button";
      del.setAttribute("aria-label","Übung löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      del.onclick=function(ev){
        ev.stopPropagation();
        if(customExInUse(ex.id)){toast("Schon verwendet – kann nicht gelöscht werden");return;}
        askConfirm("Übung löschen?","„"+ex.n+"“ wird aus deinem Übungskatalog entfernt.","Löschen",
          function(){removeCustomExercise(ex.id);onDelete();},true);
      };
      card.appendChild(del);
    }
  }else{
    card.onclick=function(){sheetExerciseDetail(ex);};
  }
  return card;
}
function renderDiscExGrid(){
  var exgrid=$("disc-exgrid");exgrid.innerHTML="";
  var name=discFine?muscleById(discFine).name:(discRegion?discRegion.name:null);
  if(discRegion&&discRegion.mobility&&(discMk||discMobArea))name=[discRegion.name,discMobArea&&discMobArea.name,discMk&&mobKindLabel(discMk)].filter(Boolean).join(" · ");
  var list=discExList();
  var hd=$("disc-exheading");hd.textContent="";
  hd.appendChild(el("span","sec-t",name||"Alle Übungen"));
  hd.appendChild(document.createTextNode(" "));
  hd.appendChild(el("span",null,list.length+(list.length===1?" Übung":" Übungen")));
  renderDiscActive();
  if(!list.length){
    var e=el("div","card estate");
    e.appendChild(el("b",null,"Keine passende Übung"));
    e.appendChild(el("p",null,"Probier einen kürzeren Suchbegriff oder nimm einen Filter heraus."));
    exgrid.appendChild(e);return;
  }
  var ids=(discRegion&&discRegion.mobility)?null:(discFine?[discFine]:(discRegion?discRegion.ids:null));
  // Mobilität ohne gewählten Bereich: nach Bereichen gegliedert, damit die lange Liste lesbar bleibt.
  if(discRegion&&discRegion.mobility&&!discMobArea){mobGrouped(list,exgrid,function(ex){return discExCard(ex);});discLazyObserve(exgrid);return;}
  if(!ids){list.forEach(function(ex){exgrid.appendChild(discExCard(ex));});discLazyObserve(exgrid);return;}
  // Bei aktivem Muskel-/Regionsfilter zuerst die Übungen mit starkem Fokus zeigen (Primärmuskel
  // trifft), danach die, die den Bereich nur mittrainieren.
  var pri=list.filter(function(e){return exHits(e,ids)>=1;});
  var sec=list.filter(function(e){return exHits(e,ids)<1;});
  // Innerhalb jeder Gruppe absteigend nach tatsaechlicher Staerke sortieren, damit die Uebung
  // mit dem hoechsten Anteil fuer den gewaehlten Muskel ganz oben steht.
  pri.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
  sec.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
  if(pri.length){
    var lab1=el("div","grouplab","Starker Fokus · "+name);
    exgrid.appendChild(lab1);
    pri.forEach(function(ex){exgrid.appendChild(discExCard(ex));});
  }
  if(sec.length){
    var lab2=el("div","grouplab","Wird mittrainiert");
    exgrid.appendChild(lab2);
    sec.forEach(function(ex){exgrid.appendChild(discExCard(ex));});
  }
  discLazyObserve(exgrid);
}

/* Aktive Filter als entfernbare Chips direkt unter der Suche - man sieht jederzeit, warum die
   Liste kürzer ist, und nimmt einen Filter mit einem Tipp wieder heraus. */
function renderDiscActive(){
  var box=$("disc-active");if(!box)return;box.innerHTML="";
  var X='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
  function chip(label,fn){var b=el("button","achip");b.type="button";b.setAttribute("aria-label","Filter entfernen: "+label);
    b.appendChild(el("span",null,label));b.insertAdjacentHTML("beforeend",X);b.onclick=fn;box.appendChild(b);}
  function all(){renderDiscMuscleGrid();renderDiscSubChips();renderDiscExGrid();renderDiscEquipChips();}
  var n=0;
  if(discRegion){n++;chip(discRegion.name,function(){discRegion=null;discFine=null;discMk=null;discMobArea=null;all();});}
  if(discFine&&muscleById(discFine)){n++;chip(muscleById(discFine).name,function(){discFine=null;all();});}
  if(discMk){n++;chip(mobKindLabel(discMk),function(){discMk=null;all();});}
  if(discMobArea){n++;chip(discMobArea.name,function(){discMobArea=null;all();});}
  discEquip.slice().forEach(function(eq){n++;chip(eq,function(){var i=discEquip.indexOf(eq);if(i>=0)discEquip.splice(i,1);all();});});
  if(n>1){var c=el("button","achip clear","Alle zurücksetzen");c.type="button";
    c.onclick=function(){discRegion=null;discFine=null;discMk=null;discMobArea=null;discEquip.length=0;all();};box.appendChild(c);}
}

/* Übungsart in Worten - für die Kurzinfo auf der Karte. */
function exTypeLabel(ex){
  if(ex.mob)return ex.mk==="dyn"?"Mobilisieren":ex.mk==="stat"?"Dehnen":"Mobilität";
  return ex.t==="load"?"Zusatzgewicht":ex.t==="reps"?"Wiederholungen":ex.t==="sec"?"Halten":ex.t==="cardio"?"Ausdauer":"";
}
function renderEntdecken(){renderDiscMuscleGrid();renderDiscEquipChips();renderDiscSubChips();renderDiscExGrid();}
/* Ziehharmonika: immer nur eine Region offen, und darin immer nur eine Untergruppe.
   Statt einer Menge offener Namen wird deshalb nur der jeweils offene gemerkt - damit
   kann gar kein Zustand entstehen, in dem zwei gleichzeitig offen sind. */
var openRegion=null, openSub=null;
/* Untergliederung der Regionen. Ueberschriften bleiben deutsch, die Muskeln darunter
   werden lateinisch benannt. Regionen ohne Eintrag haben nur eine Ebene. */
/* Untergruppen gab es nur, weil "Arme" und "Beine" zu grosse Toepfe waren. Seit jede
   Einheit eine eigene Gruppe ist, braucht es die Zwischenebene nicht mehr. */
var SUBREGIONS={};
function subsOf(rg){return SUBREGIONS[rg.name]||[{name:null,ids:rg.ids}];}
/* Ein Bauplan fuer alle Muskel-/Gruppenzeilen: Name und Reiz oben, darunter der Balken mit
   der Korridorschiene, darunter Saetze und Status. Vorher gab es dafuer zwei Stellen mit
   unterschiedlicher Darstellung - im Detailkasten eine Pille mit Zahl, in der Liste ein
   Balken. Dasselbe soll ueberall gleich aussehen. */
/* Zeitpunkt der letzten Belastung eines Muskels. Aeltere Eintraege haben keinen Zeitstempel -
   fuer die faellt die Rechnung auf den fruehen Abend dieses Tages zurueck, weil ein exakter
   Nullpunkt dort nicht mehr rekonstruierbar ist. */
function lastLoad(gid){
  var bestDay=null,best=null,from=shiftDays(TODAY,-21);
  for(var d in state.days){
    if(d<from)continue;
    (state.days[d].sets||[]).forEach(function(s){
      var ex=exById(s.ex);if(!ex||ex.mob||ex.t==="cardio")return;
      var w=exSetWeights(ex);
      if(!(w[gid]>0))return;
      var t=s.ts;
      if(!t){var p=d.split("-");t=new Date(+p[0],+p[1]-1,+p[2],18,0,0).getTime();}
      if(best==null||t>best){best=t;bestDay=d;}
    });
  }
  if(best==null)return null;
  // Dosis der letzten Einheit - dieselbe Rechnung wie beim Wochenvolumen, inklusive
  // Trefferanteil der Uebung und Reserve: zwei lockere Nebensaetze sind eben nicht dasselbe
  // wie sechs harte Saetze.
  var dose=0;
  (state.days[bestDay].sets||[]).forEach(function(s){
    var ex=exById(s.ex);if(!ex||ex.mob||ex.t==="cardio")return;
    var w=exSetWeights(ex);
    if(w[gid]>0)dose+=w[gid]*rirFactor(s.rir);
  });
  return {ts:best,dose:dose};
}
/* Erholungsstand: wie weit der Muskel seit der letzten Belastung wieder da ist. "rec" ist ein
   grober Richtwert in Stunden, kein gemessener Wert - entsprechend grob ist auch die Anzeige. */
/* Die Erholungszeit haengt nicht nur vom Muskel ab, sondern davon, was man ihm zugemutet hat.
   Der Richtwert "rec" gilt fuer eine normale Einheit; das ist hier die halbe Optimum-Dosis,
   weil man das Wochenoptimum ueblicherweise auf etwa zwei Einheiten verteilt. Weniger als das
   verkuerzt die Erholung, mehr verlaengert sie - mit Wurzel, also gedaempft, denn Erholung
   skaliert nicht eins zu eins mit dem Volumen. Die Grenzen (0,4 bis 1,3) verhindern, dass ein
   einzelner Nebensatz die Zeit gegen null zieht oder eine Marathon-Einheit sie verdoppelt.
   Alle diese Zahlen sind Setzungen, keine Messwerte - "rec" ist es selbst schon. */
function recoveryDoseFactor(dose,m){
  var ref=Math.max(2,corr(m).mav/2);
  if(!(dose>0))return 0.4;
  return clamp(Math.sqrt(dose/ref),0.4,1.3);
}
function recoveryOf(m){
  var ll=lastLoad(m.id);
  if(!ll)return null;
  var base=m.rec||36,f=recoveryDoseFactor(ll.dose,m),rec=base*f;
  var h=(Date.now()-ll.ts)/3600000;
  return {h:h,rec:rec,base:base,dose:ll.dose,
          pct:clamp(h/rec*100,0,100),left:Math.max(0,rec-h)};
}
function humanSince(h){
  if(h<1)return "gerade eben";
  if(h<24)return "vor "+Math.round(h)+" Std.";
  var d=Math.round(h/24);
  return d===1?"vor 1 Tag":"vor "+d+" Tagen";
}
function volRowMain(title,v,m,subline){
  var cm=corr(m),z=zoneOf(v,m);
  function px(x){return clamp(reizOf(x,m)/REIZ_MAX*100,0,100);}
  var main=el("div","main"),top=el("div","mrow-top");
  top.appendChild(el("b",null,title));
  var val=el("span","mrow-val",String(reizPct(v,m)));val.appendChild(el("em",null,"%"));
  top.appendChild(val);main.appendChild(top);
  var tr=el("div","mtrack");
  tr.appendChild(el("div","tbg"));
  var fi=el("i","tfill");fi.style.width=px(v)+"%";fi.style.background=volColor(v,m);tr.appendChild(fi);
  var a=px(cm.mev),bn=px(cm.mrv);
  var rail=el("div","trail");rail.style.left=a+"%";rail.style.width=Math.max(0,bn-a)+"%";
  var notch=el("u");notch.style.left=(bn>a?(px(cm.mav)-a)/(bn-a)*100:0)+"%";
  rail.appendChild(notch);tr.appendChild(rail);main.appendChild(tr);
  var meta=el("div","mrow-meta");
  meta.appendChild(el("span",null,String(v).replace(".",",")+" Sätze · Ziel "+cm.mav));
  meta.appendChild(el("span","st "+zonePill(z),zoneLabel(z)));
  main.appendChild(meta);
  if(subline)main.appendChild(el("div","mrow-fines",subline));
  return main;
}
function scrollToBody(){
  var stg=document.querySelector(".bodystage");
  if(stg)stg.scrollIntoView({behavior:"smooth",block:"center"});
}
function fineKeysOfGroup(gid){var out=[];for(var k in FINE)if(FINE[k].g===gid)out.push(k);return out;}
function renderMuscleList(ms){
  var box=$("mlist");box.innerHTML="";
  function statsOf(ids){
    var groups=ids.map(function(id){return muscleById(id);}).filter(Boolean);
    var tot=0,ok=0,low=0,high=0,scoreSum=0,reizSum=0;
    groups.forEach(function(m){var v=ms[m.id]||0,z=zoneOf(v,m);tot+=v;scoreSum+=muscleScore(v,m);
      reizSum+=reizOf(v,m);
      if(z===1)ok++;else if(z===2)high++;else low++;});
    var n=groups.length||1;
    return {groups:groups,tot:tot,ok:ok,low:low,high:high,
            score:Math.round(scoreSum/n),reiz:reizSum/n};
  }
  function headRow(label,ids,open,cls,figName){
    var s=statsOf(ids);
    var r=el("div","row tap"+(cls?" "+cls:"")),main=el("div","main");
    if(figName){
      var fw=el("div","rfig");
      var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
      sv.setAttribute("viewBox",regionCropCache[figName]||CROP_DEFAULT);
      sv.setAttribute("data-region",figName);sv.setAttribute("aria-hidden","true");
      fw.appendChild(sv);r.appendChild(fw);
      fillRegionFig(sv);
    }
    main.appendChild(el("b",null,label));
    var bar=el("div","minibar");bar.style.marginTop="7px";
    var fi=el("i");fi.style.width=clamp(s.reiz/REIZ_MAX*100,0,100)+"%";
    fi.style.background=volColorScore(s.score,s.high>0);bar.appendChild(fi);
    var uo=el("u");uo.style.left=(1/REIZ_MAX*100)+"%";bar.appendChild(uo);
    main.appendChild(bar);
    // Bei einer Gruppe waere "1 von 1 Gruppen im Korridor" nur Fuellwerk - dann steht dort
    // direkt der Status.
    var sets1=String(Math.round(s.tot*10)/10).replace(".",",")+" Sätze";
    main.appendChild(el("span",null, s.groups.length===1
      ? zoneLabel(s.high?2:(s.ok?1:0))+" \u00b7 "+sets1
      : s.ok+" von "+s.groups.length+" Gruppen im Korridor \u00b7 "+sets1
        +(s.high?" \u00b7 "+s.high+" zu viel":"")+(s.low&&!s.ok?" \u00b7 alle zu wenig":"")));
    r.appendChild(main);
    var hv=el("div","val hval",String(Math.round(s.reiz*100)));
    hv.appendChild(el("em",null,"%"));
    r.appendChild(hv);
    var ch=el("span","chev");ch.innerHTML=svgIcon(open?"M5 9l7 7 7-7":IC_CHEV);r.appendChild(ch);
    return r;
  }
  function muscleRow(k){
    var f=FINE[k],m=muscleById(f.g);if(!m)return null;
    var v=Math.round((ms[f.g]||0)*10)/10,z=zoneOf(v,m),cm=corr(m);
    var row=el("div","row tap sub mrow");
    row.appendChild(volRowMain(f.la,v,m));
    row.onclick=function(ev){ev.stopPropagation();
      selReset();
      selFine=k;selSet=null;selLabel=null;selMuscle=f.g;selTapKey=null;
      renderBodySel();
      // "bodystage" ist eine Klasse, kein id - $() lieferte hier immer null und der Griff
      // ist beim Antippen eines Muskels jedes Mal in einen Fehler gelaufen (und es wurde
      // nie gescrollt).
      scrollToBody();};
    return row;
  }
  REGIONS.forEach(function(rg){
    var subs=subsOf(rg);
    var rr=headRow(rg.name,rg.ids,openRegion===(rg.key||rg.name),null,rg.key||rg.name);
    // Eine Regionszeile hat bisher nur auf- und zugeklappt, aber nichts ausgewaehlt - Figur,
    // Kurzinfo und Detailkasten blieben leer, obwohl man eindeutig auf "Brust" getippt hat.
    // Antippen waehlt die Region jetzt zusaetzlich aus, genau wie der Chip oben.
    rr.onclick=function(){
      var wasOpen=openRegion===(rg.key||rg.name);
      openRegion=wasOpen?null:(rg.key||rg.name);
      openSub=null;
      selReset();selectRegion(rg);
      renderSection("tab-koerper");
      if(!wasOpen)scrollToBody();
    };
    box.appendChild(rr);
    if(openRegion!==(rg.key||rg.name))return;
    subs.forEach(function(sb){
      var ids=sb.ids,showHead=subs.length>1&&sb.name;
      var sk=rg.name+"|"+sb.name,open=showHead?(openSub===sk):true;
      if(showHead){
        var hr=headRow(sb.name,ids,open,"sub");
        hr.onclick=function(ev){ev.stopPropagation();
          var wasOpen=openSub===sk;
          openSub=wasOpen?null:sk;
          selectRegion({name:sb.name,ids:ids});
          renderSection("tab-koerper");
          if(!wasOpen)scrollToBody();
        };
        box.appendChild(hr);
      }
      if(!open)return;
      ids.forEach(function(gid){
        fineKeysOfGroup(gid).forEach(function(k){
          var row=muscleRow(k);
          if(row){if(showHead)row.classList.add("sub2");box.appendChild(row);}
        });
      });
    });
  });
}
function renderSkills(c,pk){
  var box=$("skills");box.innerHTML="";
  var det={
    kraft:(c.cats||[]).filter(function(ct){return !!ct.top;}).length+" von "+(c.cats||[]).length+" Bereichen gemessen · "+c.recs.length+" Übungen gewertet",
    konst:c.trainDays+" Trainingstage in "+c.win+" Tagen · Ziel "+Math.round(state.profile.goals.days*c.win/7),
    deckung:CORE_MUSCLES.filter(function(id){return (c.ms[id]||0)>=corr(muscleById(id)).mev;}).length+" von "+CORE_MUSCLES.length+" Muskelgruppen über dem Minimum",
    ausdauer:Math.round(c.cm.raw)+" Minuten in "+c.win+" Tagen"+(c.vo2!=null?" · VO2max ≈ "+Math.round(c.vo2):""),
    mob:fmtMobUnits(c.mobDays)+" Einheiten ("+Math.round(c.mobMin||0)+" min) in "+c.win+" Tagen · Ziel "+Math.round(state.profile.goals.mob*c.win/7)
  };
  // Fehlt ein Wert, steht dort, mit welcher Handlung er zum ersten Mal berechenbar wird -
  // statt einer leeren Null, die nichts erklärt.
  var hint={
    kraft:(c.cats||[]).some(function(ct){return !!ct.top;})?null:"Noch keine Kraftstufe: Trag bei einer Grundübung wie Kniebeuge oder Bankdrücken einen schweren Satz ein – dann wird Kraft berechenbar.",
    konst:c.trainDays?null:"Jeder Trainingstag zählt hier – schon der erste bringt den Wert in Gang.",
    deckung:c.deckung>0?null:"Trainiere ein paar Sätze – jede Muskelgruppe über ihrem Minimum hebt diesen Wert.",
    ausdauer:c.cm.raw>0?null:"Trag eine Ausdauereinheit ein, etwa 20 Minuten Laufen oder Rad – dann zählt sie hier.",
    mob:c.mobDays?null:"Trag im Heute-Tab eine Mobilitätsübung ein – "+MOB_UNIT_MIN+" Minuten am Tag sind eine volle Einheit."
  };
  SKILLDEF.forEach(function(sd){
    var v=c[sd.key],p=(pk&&pk[sd.key])||0;
    var m=el("div","meter"),top=el("div","meter-top"),nm=el("div","meter-name");
    var sw=el("span","sw");sw.style.background=sd.color;nm.appendChild(sw);nm.appendChild(document.createTextNode(sd.name));
    var val=el("div","meter-val");val.innerHTML='<span class="num">'+Math.round(v)+'</span><em>'+Math.round(sd.w*100)+' %</em>';
    val.title="Gewicht im Formwert";
    top.appendChild(nm);top.appendChild(val);
    var bar=el("div","bar"),fi=el("i");fi.style.background=sd.color;fi.style.width=clamp(v,0,100)+"%";bar.appendChild(fi);
    bar.setAttribute("role","progressbar");bar.setAttribute("aria-label",sd.name);bar.setAttribute("aria-valuemin","0");bar.setAttribute("aria-valuemax","100");bar.setAttribute("aria-valuenow",String(Math.round(v)));
    if(p>2){var pm=el("span","peak");pm.style.left=clamp(p,0,100)+"%";pm.title="Bestform "+Math.round(p);bar.appendChild(pm);}
    m.appendChild(top);m.appendChild(bar);m.appendChild(el("div","meter-sub",det[sd.key]));
    if(hint[sd.key])m.appendChild(el("div","meter-hint",hint[sd.key]));
    if(sd.key==="deckung"){
      var lk=el("button","btn ghost small meter-link","Muskeln im Körper-Tab ansehen");lk.type="button";
      lk.onclick=function(){selectTab("tab-koerper");window.scrollTo(0,0);};m.appendChild(lk);
    }
    var slot=$("sk-"+sd.key);
    if(slot){slot.innerHTML="";slot.appendChild(m);}else box.appendChild(m);
  });
  // Gesamtstaerke als Rang (Wappen + Titel) direkt ueber dem Kraft-Bereich.
  try{var slotK=$("sk-kraft"),grp=slotK&&slotK.parentNode,old=$("rk-overall");if(old)old.remove();
    if(grp&&(c.cats||[]).some(function(ct){return !!ct.top;})){var ork=rankFromScore(c.kraft);
      var oc=rankCard(ork,{eyebrow:"Gesamtstärke "+Math.round(c.kraft)+" %",ladderTitle:"Rangleiter · Gesamtstärke"});oc.id="rk-overall";grp.insertBefore(oc,grp.firstChild);}}catch(e){}
  var sv=$("wsumval");
  if(sv){
    sv.innerHTML='<span class="num">'+c.fitness+'</span><i>/ 100</i>';
    var prev=compute(shiftDays(TODAY,-14)).fitness,df=c.fitness-prev,tr=$("wsumtrend");
    if(tr){tr.className="trend "+(df>1?"up":df<-1?"down":"");
      tr.textContent=(df>0?"▲ +"+df:df<0?"▼ "+Math.abs(df):"▬ stabil")+" in 14 Tagen";}
  }
}
// Alle bewertbaren Übungen eines Kraft-Bereichs – auch die, die noch nie geloggt wurden.
function exsOfCat(catId){
  return EX.filter(function(e){return !!e.std&&catOfEx(e)===catId;});
}
function sheetKraftCat(catId,c){
  var cat=catById(catId);if(!cat)return;
  var ct=null;(c.cats||[]).forEach(function(x){if(x.id===catId)ct=x;});
  openSheet(function(b){
    sheetTitle(b,"Kraft "+cat.name);
    b.appendChild(el("p","note",ct&&ct.top
      ? "Stufe „"+ct.grade.name+"“ als Durchschnitt aus "+ct.exs.length+(ct.exs.length===1?" bewerteten Übung":" bewerteten Übungen")+" in diesem Bereich. Bester Einzelwert: "+ct.top.ex.n+" mit "+fmtBestVal(ct.top.ex,ct.top.best,ct.top.bestSet)+". „Richtwert“ heißt: Stufe aus einer verwandten Übung abgeleitet, nicht aus einer eigenen Normtabelle."
      : "Noch kein Wert in den letzten 90 Tagen. Trag bei einer dieser Übungen einen schweren Satz ein, dann bekommt der Bereich eine Stufe."));
    var measured={},list=el("div","exlist");b.appendChild(list);
    (ct?ct.exs:[]).forEach(function(r){
      measured[r.ex.id]=true;
      var it=el("div","exitem");
      var main=el("div","main");
      main.appendChild(el("b",null,r.ex.n));
      main.appendChild(el("span",null,"Bestwert "+fmtBestVal(r.ex,r.best,r.bestSet)+(r.grade&&r.grade.next?(function(){var h=exRankHint(r.ex,rankFromScore(r.score));return h?" · "+h:"";})():" · Höchster Rang")+(r.ex.est?" · Richtwert":"")));
      if(r.grade&&r.grade.next){var bar=el("div","minibar");bar.style.marginTop="7px";
        var xrk=rankFromScore(r.score),fi=el("i");fi.style.width=clamp(xrk.pct*100,0,100)+"%";fi.style.background=xrk.t.leg?"#C04C9A":xrk.t.m;bar.appendChild(fi);main.appendChild(bar);}
      it.appendChild(main);
      if(r.grade){
        var xrk=rankFromScore(r.score);xrk.best=r.best;xrk.bestSet=r.bestSet;
        it.appendChild(rankChip(xrk,20,function(){sheetRankLadder(xrk,"Rangleiter · "+r.ex.n,exRankHint(r.ex,xrk),r.ex);}));
      }else it.appendChild(el("span","pill gnone","verfallen"));
      it.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(r.ex);},180);};
      list.appendChild(it);
    });
    var unr=(ct?ct.unr:[]);
    if(unr.length){
      b.appendChild(el("div","grouplab","Gemacht, ohne Kraftstufe"));
      var listU=el("div","exlist");b.appendChild(listU);
      unr.forEach(function(u){
        measured[u.ex.id]=true;
        var it=el("div","exitem");
        var main=el("div","main");main.appendChild(el("b",null,u.ex.n));
        main.appendChild(el("span",null,u.ex.e+" · kein Kraftstandard vergleichbar"));
        it.appendChild(main);
        it.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(u.ex);},180);};
        listU.appendChild(it);
      });
    }
    var rest=exsOfCat(catId).filter(function(e){return !measured[e.id];});
    if(rest.length){
      b.appendChild(el("div","grouplab","Noch nicht gemessen"));
      var list2=el("div","exlist");b.appendChild(list2);
      rest.forEach(function(e){
        var it=el("div","exitem");
        var main=el("div","main");main.appendChild(el("b",null,e.n));main.appendChild(el("span",null,e.e));
        it.appendChild(main);
        it.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(e);},180);};
        list2.appendChild(it);
      });
    }
  });
}
function renderStrength(c){
  var box=$("strengthlist");box.innerHTML="";
  (c.cats||[]).forEach(function(ct){
    var row=el("div","row tap"),m=el("div","main");
    m.appendChild(el("b",null,ct.name));
    var n=ct.exs.length+ct.unr.length;
    m.appendChild(el("span",null,ct.top
      ? (n+(n===1?" Übung":" Übungen")+" gemacht · Bestwert "+ct.top.ex.n+" "+fmtBestVal(ct.top.ex,ct.top.best,ct.top.bestSet))
      : (n?n+(n===1?" Übung":" Übungen")+" gemacht · keine davon bewertbar":"seit 90 Tagen nichts gemacht")));
    // ct.grade ist jetzt ein Durchschnitts-Level (levelFromScore) ohne "next" in kg – der Balken
    // zeigt stattdessen immer den Fortschritt innerhalb der aktuellen Stufe.
    if(ct.grade){var bar=el("div","minibar");bar.style.marginTop="7px";
      var crk=rankFromScore(ct.score),fi=el("i");fi.style.width=clamp(crk.pct*100,0,100)+"%";fi.style.background=crk.t.leg?"#C04C9A":crk.t.m;bar.appendChild(fi);m.appendChild(bar);}
    row.appendChild(m);
    row.appendChild(ct.grade?rankChip(rankFromScore(ct.score),20):el("span","pill gnone","verfallen"));
    var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);row.appendChild(ch);
    row.onclick=function(){sheetKraftCat(ct.id,c);};
    box.appendChild(row);
  });
}
function renderCardio(c){
  var box=$("cardiolist");box.innerHTML="";
  function row(a,bv,tap){
    var r=el("div","row"+(tap?" tap":"")),m=el("div","main");m.appendChild(el("b",null,a));r.appendChild(m);
    r.appendChild(el("div","val",bv));
    if(tap){r.onclick=tap;var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);}
    box.appendChild(r);
  }
  row("Minuten pro Woche",Math.round(c.cm.raw/(c.win/7))+" / "+state.profile.goals.cardio);
  row("Belastungsäquivalent",Math.round(c.cm.eq/(c.win/7))+" min");
  if(c.vo2!=null){
    row("VO2max geschätzt",(Math.round(c.vo2*10)/10)+"");
    var p=Math.round(c.vpct),lab=p<20?"schwach":p<40?"unterdurchschnittlich":p<60?"durchschnittlich":p<80?"gut":p<95?"sehr gut":"herausragend";
    row("Für dein Alter",p+". Perzentil · "+lab);
  }
  row("Ruhepuls",(state.profile.restHr||"–")+" bpm",function(){
    askNumber("Ruhepuls, morgens im Liegen",state.profile.restHr||60,"1",0,140,"Schläge pro Minute",function(v){state.profile.restHr=Math.round(v);persist();renderAll();});});
  row("Cooper-Test",(state.profile.cooper?state.profile.cooper+" m":"nicht gemacht"),function(){
    askNumber("Cooper-Test: Meter in 12 Minuten",state.profile.cooper||2400,"50",0,6000,"Meter",function(v){state.profile.cooper=Math.round(v);persist();renderAll();});});
}
/* Baut die Einstellungsliste in einen beliebigen Behaelter - benutzt von der eigenen Seite
   und (als kurzer Verweis) vom Werte-Tab. */
function settingsBody(box){
  box.innerHTML="";var p=state.profile;
  function group(t){box.appendChild(el("div","setpage-group",t));}
  function card(){var c=el("div","card flush");box.appendChild(c);return c;}
  function row(into,lab,val,fn){
    var r=el("div","row tap"),m=el("div","main");m.appendChild(el("b",null,lab));r.appendChild(m);
    r.appendChild(el("div","val",val));
    var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);
    r.onclick=fn;into.appendChild(r);
  }
  group(T("set.gGoals"));
  var g1=card();
  [["days","Tage",1,7,T("set.days"),T("unit.days")],
   ["mob","×",0,7,T("set.mob"),"×"],
   ["cardio","min",0,900,T("set.cardio"),"min"]].forEach(function(dd){
    var d=[null,dd[0],dd[5],dd[2],dd[3],dd[4]];
    row(g1,d[5],p.goals[d[1]]+" "+d[2],function(){
      askNumber(d[5],p.goals[d[1]],d[1]==="cardio"?"15":"1",d[3],d[4],d[2],
        function(v){p.goals[d[1]]=Math.round(v);persist();renderAll();openSettingsPage(true);});});});

  group("Training");
  var gT=card();
  row(gT,"Standard-Satzpause",defaultRest()+" s",function(){
    askNumber("Standard-Satzpause",defaultRest(),"15",0,600,"Sekunden",
      function(v){p.restSec=clamp(Math.round(v),0,600);persist();renderAll();openSettingsPage(true);});});
  row(gT,"Zielwerte vorschlagen",sugEnabled()?"an":"aus",function(){
    state.profile.suggest=!sugEnabled();persist();renderAll();openSettingsPage(true);});
  row(gT,"Aufwärmsätze anzeigen",warmEnabled()?"an":"aus",function(){
    state.profile.warmup=!warmEnabled();persist();renderAll();openSettingsPage(true);});
  box.appendChild(el("p","setpage-note","Pause: gilt für jede Einheit ohne eigene Pausenzeit und fürs freie Training. Vorschläge: Gewicht und Wiederholungen stehen im Training schon im Feld – aus deinem letzten Mal, leicht gesteigert."));

  group(T("set.gBody"));
  var g2=card();
  [["bodyweight","kg",30,250,T("set.weight")],["age",T("unit.years"),12,99,T("set.age")]].forEach(function(d){
    row(g2,d[4],p[d[0]]+" "+d[1],function(){
      askNumber(d[4],p[d[0]],d[0]==="age"?"1":"0.5",d[2],d[3],d[1],
        function(v){p[d[0]]=v;persist();renderAll();openSettingsPage(true);});});});
  row(g2,T("set.sex"),p.sex==="w"?T("set.female"):T("set.male"),
      function(){p.sex=p.sex==="w"?"m":"w";persist();renderAll();openSettingsPage(true);});

  group(T("set.gLang"));
  var g3=card();
  row(g3,T("set.lang"),LANG==="en"?T("set.langEn"):T("set.langDe"),
      function(){setLang(LANG==="en"?"de":"en");openSettingsPage(true);});
  box.appendChild(el("p","setpage-note",T("set.langNote")));

  group(T("set.account"));
  var g4=card();
  row(g4,T("set.sync"),syncState.t,sheetAccount);
  row(g4,T("set.backupSave"),backupAgeText(),function(){saveBackup();});
  row(g4,"Als Tabelle exportieren","CSV",saveCsv);
  row(g4,T("set.backupLoad"),T("set.fileOrText"),sheetRestore);
}
/* Eigene Seite. "keep" heisst: nur den Inhalt auffrischen, ohne Ein-/Ausblenden - damit ein
   geaenderter Wert nicht die ganze Seite neu aufpoppen laesst. */
function openSettingsPage(keep){
  var page=$("exdpage");
  if(!keep){closeSheet();page.hidden=false;syncScrollLock();}
  var head=$("exdpage-head");head.innerHTML="";
  var back=el("button","iconbtn");back.type="button";back.setAttribute("aria-label",T("gen.back"));
  back.innerHTML=svgIcon(IC_CHEVLEFT,2.1);back.onclick=closeExPage;
  head.appendChild(back);
  head.appendChild(el("div","exdpage-title",T("set.title")));
  settingsBody($("exdpage-body"));
}
function renderSettings(){
  var box=$("settings");box.innerHTML="";
  var r=el("div","row tap"),m=el("div","main");
  m.appendChild(el("b",null,T("set.title")));
  m.appendChild(el("span",null,T("set.rowSub")));
  r.appendChild(m);
  var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);
  r.onclick=function(){openSettingsPage();};
  box.appendChild(r);
}

/* ================= Körper-Tab: was du mobilisiert hast ================= */
/* Gegenstück zur Muskel-Übersicht. Mobilität denkt in Gelenken und Zonen statt in einzelnen
   Muskeln, deshalb eigene, gröbere Bereiche. Eine Übung zählt mit ihrer vollen Zeit für jeden
   Bereich ihrer Hauptmuskeln und mit halber Zeit für Bereiche, die sie nur mitnimmt – der
   World's Greatest Stretch bewegt eben Hüfte, Wirbelsäule und Schulter zugleich. */
var MOB_AREAS=[
 {name:"Hüfte",ids:["tg_huefte","tg_adduktoren","tg_gesaess_haupt","tg_gesaess_med","tg_gesaess_min"]},
 {name:"Wirbelsäule",ids:["tg_rueck_strecker","tg_bauch_schraeg","tg_bauch_gerade","tg_bauch_tief","tg_rueck_rhomb","tg_rueck_trapez_mit"]},
 {name:"Schultern & Brust",ids:["tg_schulter_vorn","tg_schulter_seit","tg_schulter_hint","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_schulter_rot_sub","tg_schulter_rot_supra","tg_brust_ober","tg_brust_mitte","tg_brust_unten","tg_brust_serratus","tg_rueck_lat","tg_rueck_teres_major","tg_rueck_trapez_unt"]},
 {name:"Oberschenkel",ids:["tg_quadrizeps","tg_kniesehnen"]},
 {name:"Waden & Sprunggelenk",ids:["tg_wade_gastro","tg_wade_soleus","tg_wade_fussheber"]},
 {name:"Nacken",ids:["tg_nacken","tg_rueck_trapez_ob","tg_hals_nacken"]},
 {name:"Arme & Handgelenke",ids:["tg_bizeps","tg_brachialis","tg_trizeps_lang","tg_trizeps_lat","tg_unterarm_beug","tg_unterarm_streck"]}
];
var MOB_WIN=30,bodyListMode="train",mobOpen=null;
function mobAreaWeight(ex,area){
  var hit=function(l){return (l||[]).some(function(id){return area.ids.indexOf(id)>=0;});};
  return hit(ex.p)?1:hit(ex.s)?0.5:0;
}
function mobAreaStats(asOf){
  var from=shiftDays(asOf,-(MOB_WIN-1)),out=MOB_AREAS.map(function(a){return {a:a,min:0,stat:0,dyn:0,last:null,exs:{}};});
  var tot={min:0,units:0,days:0};
  for(var d in state.days){
    if(d<from||d>asOf)continue;
    var dd=state.days[d],md=mobDay(dd);
    tot.min+=md.min;tot.units+=md.units;if(md.units>0)tot.days++;
    (dd.sets||[]).forEach(function(s){var ex=exById(s.ex);if(!ex||!ex.mob)return;
      var m=mobSetSec(ex,s)/60;if(!m)return;
      out.forEach(function(o){var w=mobAreaWeight(ex,o.a);if(!w)return;
        o.min+=m*w;if(ex.mk==="dyn")o.dyn+=m*w;else o.stat+=m*w;
        if(!o.last||d>o.last)o.last=d;
        o.exs[ex.id]=(o.exs[ex.id]||0)+m;});
    });
  }
  return {areas:out,tot:tot};
}
function fmtMin(m){return m>0&&m<1?"<1":String(Math.round(m));}
function renderBodyListMode(){
  var bar=$("mlistmode");if(!bar)return;
  Array.prototype.forEach.call(bar.querySelectorAll("button"),function(b){
    b.setAttribute("aria-pressed",String(b.getAttribute("data-m")===bodyListMode));
    b.onclick=function(){bodyListMode=b.getAttribute("data-m");renderBodyListMode();};
  });
  var mob=bodyListMode==="mob";
  $("mlist").hidden=mob;$("moblist").hidden=!mob;
  var hs=$("mlisthead");if(hs)hs.textContent=mob?"letzte "+MOB_WIN+" Tage · antippen für Übungen":"letzte 7 Tage · antippen für Details";
  if(mob)renderMobView();
}
function renderMobView(){
  var box=$("moblist");if(!box)return;box.innerHTML="";
  var st=mobAreaStats(TODAY),goal=(state.profile.goals.mob||0)*MOB_WIN/7;
  if(!st.tot.min&&!st.tot.units){
    var e=el("div","estate");e.appendChild(el("b",null,"Noch keine Mobilität"));
    e.appendChild(el("p",null,"Trag Dehn- oder Mobilisationsübungen ein – hier siehst du dann, welche Bereiche du bewegt hast und welche lange nicht dran waren."));
    var br=el("div","btnrow"),bt=el("button","btn small primary","Mobilität eintragen");bt.type="button";bt.onclick=function(){sheetMob();};
    br.appendChild(bt);e.appendChild(br);box.appendChild(e);return;
  }
  var head=el("div","row mobsum"),hm=el("div","main");
  hm.appendChild(el("b",null,fmtMin(st.tot.min)+" min an "+st.tot.days+(st.tot.days===1?" Tag":" Tagen")));
  hm.appendChild(el("span",null,fmtMobUnits(st.tot.units)+" von "+Math.round(goal)+" Einheiten · "+MOB_UNIT_MIN+" min am Tag sind eine volle"));
  head.appendChild(hm);box.appendChild(head);
  var max=0;st.areas.forEach(function(o){if(o.min>max)max=o.min;});
  var stale=[];
  st.areas.forEach(function(o){
    var ago=o.last?daysBetween(o.last,TODAY):null,isOpen=mobOpen===o.a.name;
    if(ago==null||ago>14)stale.push(o.a.name);
    var r=el("div","row tap"),m=el("div","main");
    m.appendChild(el("b",null,o.a.name));
    var bar=el("div","minibar mobbar");bar.style.marginTop="7px";
    // Zwei Teile in einem Balken: gehalten (Dehnen) und bewegt (Drehen, Kreisen, Pendeln).
    var fs=el("i","st"),fd=el("i","dy");
    fs.style.width=(max?o.stat/max*100:0)+"%";fd.style.left=fs.style.width;fd.style.width=(max?o.dyn/max*100:0)+"%";
    bar.appendChild(fs);bar.appendChild(fd);m.appendChild(bar);
    var parts=[];
    if(o.min>0){if(o.stat>0.05)parts.push(fmtMin(o.stat)+" min gedehnt");if(o.dyn>0.05)parts.push(fmtMin(o.dyn)+" min bewegt");}
    parts.push(ago==null?"seit "+MOB_WIN+" Tagen nicht":ago===0?"zuletzt heute":ago===1?"zuletzt gestern":"zuletzt vor "+ago+" Tagen");
    m.appendChild(el("span",null,parts.join(" · ")));
    r.appendChild(m);
    var v=el("div","val",fmtMin(o.min));v.appendChild(el("em",null," min"));r.appendChild(v);
    var ch=el("span","chev");ch.innerHTML=svgIcon(isOpen?"M5 9l7 7 7-7":IC_CHEV);r.appendChild(ch);
    r.setAttribute("aria-expanded",String(isOpen));
    r.onclick=function(){mobOpen=isOpen?null:o.a.name;renderMobView();};
    box.appendChild(r);
    if(isOpen)box.appendChild(mobAreaDetail(o));
  });
  if(stale.length&&stale.length<MOB_AREAS.length){
    box.appendChild(el("p","note mobhint","Länger nicht dran: "+stale.join(", ")+". Tipp einen Bereich an – dort stehen passende Übungen."));
  }
}
function mobAreaDetail(o){
  var w=el("div","mobdet");
  var done=Object.keys(o.exs).sort(function(a,b){return o.exs[b]-o.exs[a];});
  if(done.length){
    w.appendChild(el("div","grouplab","Gemacht"));
    done.forEach(function(id){var ex=exById(id);if(!ex)return;
      var r=el("div","mobdet-row");r.appendChild(el("span",null,ex.n));r.appendChild(el("b",null,fmtMin(o.exs[id])+" min"));w.appendChild(r);});
  }
  // Vorschläge: Übungen mit diesem Bereich als Hauptziel, die du hier noch nicht gemacht hast –
  // bewegte zuerst, falls bisher nur gedehnt wurde, und umgekehrt.
  var wantDyn=o.dyn<o.stat;
  var sug=EX.filter(function(ex){return ex.mob&&!o.exs[ex.id]&&mobAreaWeight(ex,o.a)===1;})
    .sort(function(a,b){return ((b.mk==="dyn")===wantDyn)-((a.mk==="dyn")===wantDyn);}).slice(0,4);
  if(sug.length){
    w.appendChild(el("div","grouplab","Passt dazu"));
    var cb=el("div","chipbar wrap");
    sug.forEach(function(ex){var c=el("button","fchip",ex.n+(ex.mk==="dyn"?" · bewegt":" · gehalten"));c.type="button";
      c.onclick=function(){sheetAddSet(ex);};cb.appendChild(c);});
    w.appendChild(cb);
  }
  return w;
}

/* Bereich, unter dem eine Mobilitätsübung in Listen steht: der erste, den ihre Hauptmuskeln
   treffen. Im Filter taucht sie dagegen unter jedem Bereich ihrer Hauptmuskeln auf. */
function mobAreaOf(ex){
  var p=ex.p||[];
  for(var i=0;i<p.length;i++)for(var j=0;j<MOB_AREAS.length;j++)if(MOB_AREAS[j].ids.indexOf(p[i])>=0)return MOB_AREAS[j];
  return null;
}
function mobAreaChips(box,cur,onPick){
  var all=el("button","fchip","Alle Bereiche");all.type="button";all.setAttribute("aria-pressed",String(!cur));
  all.onclick=function(){onPick(null);};box.appendChild(all);
  MOB_AREAS.forEach(function(a){
    var n=EX.filter(function(e){return e.mob&&mobAreaWeight(e,a)===1;}).length;if(!n)return;
    var c=el("button","fchip",a.name);c.type="button";c.setAttribute("aria-pressed",String(cur===a));
    c.onclick=function(){onPick(cur===a?null:a);};box.appendChild(c);
  });
  centerChip(box);
}
function mobGrouped(list,target,mkItem){
  var groups=MOB_AREAS.map(function(a){return {a:a,items:[]};}),rest=[];
  list.forEach(function(ex){var a=mobAreaOf(ex),g=null;
    for(var i=0;i<groups.length;i++)if(groups[i].a===a)g=groups[i];
    (g?g.items:rest).push(ex);});
  groups.push({a:{name:"Sonstiges"},items:rest});
  groups.forEach(function(g){
    if(!g.items.length)return;
    target.appendChild(el("div","grouplab",g.a.name+" · "+g.items.length));
    g.items.forEach(function(ex){target.appendChild(mkItem(ex));});
  });
}
