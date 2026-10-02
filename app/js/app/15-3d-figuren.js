/* ==========================================================
   app/15-3d-figuren.js - Figurenbilder aus dem 3D-Modell, Farben und Auswahl im 3D-Viewer
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* === Figuren-Bilder aus dem 3D-Modell ====================================
   Die kleinen Vorder-/Rueckansichten (Uebungskarten, Muskelgruppen-Kacheln,
   Tagesansicht, Trainingsseite) kommen aus demselben 3D-Modell wie die grosse
   Koerperansicht: ein verstecktes zweites Modellfenster rendert auf Anfrage ein
   Standbild von vorne bzw. hinten mit den beanspruchten Muskeln eingefaerbt.
   So zeigen die Bildchen exakt dieselbe Anatomie wie das 3D-Modell (also z.B.
   auch langer vs. seitlicher Trizepskopf getrennt) statt einer vereinfachten
   Zeichnung. Jedes Motiv wird nur einmal gerendert und dann gemerkt. */
var fw3dSnapFrame=null, fw3dSnapReady=false, fw3dSnapQ=[], fw3dSnapBusy=null, fw3dSnapSeq=0, fw3dSnapCache={}, fw3dSnapDead=false
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
    fw3dHtml().then(function(h){fw3dSnapFrame.srcdoc=h;}).catch(function(){fw3dSnapDead=true;});
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
window.fw3dSnapIdle=function(){return !fw3dSnapBusy&&!fw3dSnapQ.length;};
var fw3dSnapTO=0;
/* Fingerabdruck eines Standbilds: gleiche Farben + Ansicht + Optionen = gleiches Bild.
   Darueber werden die vorab erzeugten Bilder gefunden (assets/fig-*.js). Weicht irgendetwas
   ab - eigene Uebung, angepasste Muskeln, spaeter geaenderte Farben -, gibt es keinen Treffer
   und das Bild wird wie bisher live im 3D-Modell erzeugt. */
function fw3dSig(colors,view,ghost,ft){
  var s=view+"|"+(ghost?1:0)+"|"+(ft?JSON.stringify(ft):"")+"|"+JSON.stringify(colors||{});
  var h1=0x811c9dc5,h2=5381;
  for(var i=0;i<s.length;i++){var c=s.charCodeAt(i);h1^=c;h1=Math.imul(h1,16777619);h2=(Math.imul(h2,33)^c)|0;}
  return (h1>>>0).toString(36)+"."+(h2>>>0).toString(36);
}
function fw3dSnapRequest(key,colors,view,cb,ghost,forceTransparent,urgent){
  if(fw3dSnapCache[key]){cb(fw3dSnapCache[key]);return;}
  // Vorab erzeugtes Bild vorhanden? Dann ohne 3D-Modell sofort anzeigen.
  var sig=null,pk=null;
  try{sig=fw3dSig(colors,view,ghost,forceTransparent);pk=window.FW_FIG_INDEX&&window.FW_FIG_INDEX[sig];}catch(e){pk=null;}
  if(pk){
    var live=function(){fw3dSnapLive(key,colors,view,cb,ghost,forceTransparent,urgent);};
    fwLoadAsset("fig-"+pk).then(function(){
      // Eintrag: [Bild, x, y, Breite, Hoehe] - das Bild ist auf die Figur zugeschnitten, die
      // Zahlen sagen, wo es im gewohnten 260x520-Rahmen sitzt.
      var pack=window["FW_FIG_"+pk],e=pack&&pack[sig];
      if(e){cb(e[0],e.slice(1));}else live();
    },live);
    return;
  }
  // Schon einmal live erzeugt (z. B. Einheiten-Figur, Tagesfigur)? Dann liegt das Bild
  // dauerhaft auf dem Geraet und erscheint ohne 3D-Modell.
  fw3dDiskGet(sig,function(u){
    if(u){fw3dSnapCache[key]=u;cb(u);return;}
    fw3dSnapLive(key,colors,view,function(url){cb(url);fw3dDiskPut(sig,url);},ghost,forceTransparent,urgent);
  });
}
/* ---- Dauerhafter Bildspeicher auf dem Geraet (IndexedDB) ----
   Fuer alles, was nicht vorab erzeugt werden kann, weil es von deinen Daten abhaengt
   (Figuren deiner Einheiten, Tagesfiguren). Einmal gerechnet, danach sofort da - auch nach
   einem Neustart. Bilder werden verkleinert gespeichert; es bleiben die 200 zuletzt
   benutzten. Geht etwas schief (privater Modus o. ae.), wird einfach live gerechnet. */
var fw3dDb=null,fw3dDbP=null;
function fw3dDbOpen(){
  if(fw3dDbP)return fw3dDbP;
  fw3dDbP=new Promise(function(res){
    try{
      if(!window.indexedDB){res(null);return;}
      var rq=indexedDB.open("formwert-figuren",1);
      rq.onupgradeneeded=function(){var d=rq.result;if(!d.objectStoreNames.contains("img")){var st=d.createObjectStore("img",{keyPath:"k"});st.createIndex("t","t");}};
      rq.onsuccess=function(){fw3dDb=rq.result;res(fw3dDb);};
      rq.onerror=function(){res(null);};rq.onblocked=function(){res(null);};
    }catch(e){res(null);}
    setTimeout(function(){res(null);},1500);
  });
  return fw3dDbP;
}
function fw3dDiskGet(sig,cb){
  var done=false;function fin(u){if(done)return;done=true;cb(u||null);}
  if(!sig){fin(null);return;}
  fw3dDbOpen().then(function(d){
    if(!d){fin(null);return;}
    try{
      var tx=d.transaction("img","readwrite"),st=tx.objectStore("img"),g=st.get(sig);
      g.onsuccess=function(){var r=g.result;if(r){fin(r.u);try{r.t=Date.now();st.put(r);}catch(e){}}else fin(null);};
      g.onerror=function(){fin(null);};
    }catch(e){fin(null);}
  });
  setTimeout(function(){fin(null);},800);
}
function fw3dDiskPut(sig,url){
  if(!sig||!url)return;
  fw3dDbOpen().then(function(d){
    if(!d)return;
    // Verkleinern: 260x520 reicht fuer alle Figurengroessen in der App.
    var im=new Image();
    im.onload=function(){
      try{
        var c=document.createElement("canvas");c.width=260;c.height=520;
        c.getContext("2d").drawImage(im,0,0,260,520);
        var small=c.toDataURL("image/webp",0.8);
        if(small.indexOf("data:image/webp")!==0)small=c.toDataURL("image/png");
        var tx=d.transaction("img","readwrite"),st=tx.objectStore("img");
        st.put({k:sig,u:small,t:Date.now()});
        var cnt=st.count();cnt.onsuccess=function(){
          var extra=cnt.result-200;if(extra<=0)return;
          var cur=st.index("t").openCursor();
          cur.onsuccess=function(){var cr=cur.result;if(!cr||extra<=0)return;cr.delete();extra--;cr.continue();};
        };
      }catch(e){}
    };
    im.src=url;
  });
}
function fw3dSnapLive(key,colors,view,cb,ghost,forceTransparent,urgent){
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
  fw3dSnapRequest(key+"|"+view+(ghost?"|x":"")+(_ft?"|ft":"")+(boostGroup?"|b:"+boostGroup:""),_cols,view,function(url,crop){
    try{
      svg.innerHTML="";
      svg.setAttribute("viewBox",svg.getAttribute("data-crop")||"0 0 260 520");
      svg.setAttribute("preserveAspectRatio","xMidYMid meet");
      var im=document.createElementNS("http://www.w3.org/2000/svg","image");
      var cr=(crop&&crop.length===4)?crop:[0,0,260,520];
      im.setAttribute("x",String(cr[0]));im.setAttribute("y",String(cr[1]));
      im.setAttribute("width",String(cr[2]));im.setAttribute("height",String(cr[3]));
      im.setAttribute("preserveAspectRatio","xMidYMid meet");
      im.setAttribute("href",url);
      im.setAttributeNS("http://www.w3.org/1999/xlink","href",url);
      im.setAttribute("class","fw-fig-in");
      svg.appendChild(im);
    }catch(e){}
  },ghost,_ft,urgent);
}
function fw3dBoost(hex){
  // Die Beleuchtung im 3D-Viewer hellt jede Farbe sichtbar auf - hier vorab dunkler
  // und etwas saettigter machen, damit das Ergebnis auf dem Modell der flachen
  // Legende darunter aehnelt statt blass/verwaschen zu wirken.
  var hsl=_fwRgbToHsl.apply(null,_fwHexToRgb(hex));
  return _fwHslToHex(hsl[0],clamp(hsl[1]*1.15,0,1),clamp(hsl[2]*0.74,0,1));
}
function fw3dSyncColors(ms){
  if(!fw3dFrameCreated)fw3dEnsureFrame();
  var frame=$("body3d-frame");
  if(!frame||!fw3dReady)return;
  var sg=selGroups();
  var css=getComputedStyle(document.documentElement);
  function cvar(n){return css.getPropertyValue(n).trim()||"#888888";}
  var SELCOL=cvar("--bad");
  var colors={}, selected=[], colOf=bodyColorFn();
  for(var name in FW3D_MESH2FINE){
    var fk=FW3D_MESH2FINE[name], g=FINE[fk]&&FINE[fk].g; if(!g)continue;
    var r=fw3dColorForGroup(g,fk,sg,ms); if(!r)continue;
    colors[name]=r.sel?SELCOL:fw3dBoost(colOf(r.v,r.m));
    if(r.sel)selected.push(name);
  }
  for(var name2 in FW3D_MESH2GROUP){
    if(FW3D_MESH2FINE[name2])continue;
    var g2=FW3D_MESH2GROUP[name2];
    var r2=fw3dColorForGroup(g2,null,sg,ms); if(!r2)continue;
    colors[name2]=r2.sel?SELCOL:fw3dBoost(colOf(r2.v,r2.m));
    if(r2.sel)selected.push(name2);
  }
  for(var name3 in FW3D_DUAL){
    var gs3=FW3D_DUAL[name3];
    var vAvg=0;gs3.forEach(function(gg){vAvg+=(ms[gg]||0);});vAvg/=gs3.length;
    var m3=muscleById(gs3[0]);
    var isSel3=gs3.some(function(gg){return sg.indexOf(gg)>=0;});
    colors[name3]=isSel3?SELCOL:fw3dBoost(m3?colOf(vAvg,m3):cvar("--m3d0"));
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
  // Mausrad neben der Figur: der Betrachter reicht es durch, damit die Seite scrollt statt zu zoomen.
  else if(d.type==="fw3d-wheel"&&typeof d.dy==="number"&&isFinite(d.dy)){window.scrollBy(0,d.dy);}
  else if(d.type==="fw3d-pan-pos"&&typeof d.t==="number"){var ps=$("fw-pan");if(ps&&ps.fwSet)ps.fwSet(d.t);}
});
