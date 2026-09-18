/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: FW3D_VIEW_TILT bis (Anweisung)
*/

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
