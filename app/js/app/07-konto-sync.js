/* ==========================================================
   app/07-konto-sync.js - Konto und Backup (exportieren/einspielen), Werte-Tab (Rechenweg, Verlauf), Einheiten-Liste
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ---------- Konto, Sync, Backup ---------- */
function backupData(){
  return {app:"formwert",version:3,exported:new Date().toISOString(),
          profile:state.profile,days:state.days,routines:state.routines,customEx:state.customEx,exOverrides:state.exOverrides};
}
function backupStats(o){
  var d=Object.keys(o.days||{}).length,r=Object.keys(o.routines||{}).length,c=(o.customEx||[]).length;
  return d+(d===1?" Tag":" Tage")+" · "+r+(r===1?" Einheit":" Einheiten")+" · "+c+(c===1?" eigene Übung":" eigene Übungen");
}
function saveBackup(){
  var json=JSON.stringify(backupData());
  if(!window.claude||!window.claude.use){toast("Hier nicht möglich – nutz „Backup einspielen“ zum Kopieren");return;}
  window.claude.use("downloads").then(function(dl){
    if(!dl){toast("Speichern hier nicht möglich");return;}
    return dl.save({filename:"formwert-backup-"+TODAY+".json",data:json}).then(function(){markBackupDone();toast("Backup gespeichert");});
  }).catch(function(e){
    if(e&&e.code==="declined")return;
    toast("Backup fehlgeschlagen");
  });
}
// Anders als persist() bildet diese Funktion keinen Teilstand ab, sondern ersetzt den
// Konto-Inhalt bewusst vollständig. Das ist für eine Backup-Wiederherstellung wichtig:
/* Alle Tage aus der Cloud laden. Ohne Sortierung liefert die Datenbank nach Dokument-ID,
   also nach Datum aufsteigend, und eine Abfrage bringt höchstens 1000 Dokumente. Früher
   stand hier fest limit(400): ab dem 401. gespeicherten Tag fehlten auf einem neuen Gerät
   ausgerechnet die neuesten Tage. Weitere Seiten laufen über das Feld "d" (Datum), das jeder
   Tag beim Speichern mitbekommt. Ältere Dokumente ohne "d" sind die ältesten und liegen
   deshalb immer auf der ersten Seite. */
function fwLoadDays(d){
  var alle=[],SEITE=1000;
  function weiter(qs){
    var docs=(qs&&qs.docs)||[];
    alle=alle.concat(docs);
    if(docs.length<SEITE)return {docs:alle};
    var letzte=docs[docs.length-1].id;
    return d.collection("days").where("d",">",letzte).orderBy("d").limit(SEITE).get().then(weiter);
  }
  return d.collection("days").limit(SEITE).get().then(weiter);
}
// Dokumente, die im Backup fehlen, dürfen beim nächsten Start nicht wieder auftauchen.
function replaceCloudFromState(d){
  if(!d)return Promise.reject(new Error("keine Cloud-Verbindung"));
  var days=state.days||{},routines=state.routines||{};
  return Promise.all([fwLoadDays(d),d.collection("routines").get()]).then(function(q){
    var jobs=[];
    (q[0]&&q[0].docs||[]).forEach(function(doc){if(!days[doc.id])jobs.push(d.doc("days/"+doc.id).delete());});
    (q[1]&&q[1].docs||[]).forEach(function(doc){if(!routines[doc.id])jobs.push(d.doc("routines/"+doc.id).delete());});
    Object.keys(days).forEach(function(id){var b=days[id]||{};
      jobs.push(d.doc("days/"+id).set({d:id,sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}));});
    Object.keys(routines).forEach(function(id){jobs.push(d.doc("routines/"+id).set(routines[id]));});
    jobs.push(d.doc("state/profile").set(state.profile));
    jobs.push(d.doc("state/exoverrides").set({v:state.exOverrides||{}}));
    jobs.push(d.doc("state/customex").set({v:state.customEx||[]}));
    jobs.push(d.doc("state/workout").delete());
    return Promise.all(jobs);
  });
}

function applyBackup(o){
  state.profile=o.profile;state.days=o.days||{};state.routines=o.routines||{};state.customEx=o.customEx||[];
  for(var i=EX.length-1;i>=0;i--)if(EX[i].custom)EX.splice(i,1);
  EX_BY_ID=null;
  // Zuerst alle bisher angepassten eingebauten Übungen auf den Originalzustand zurücksetzen,
  // bevor die Anpassungen aus dem eingespielten Backup übernommen werden – sonst blieben
  // Änderungen aus dem alten Zustand hängen, die im Backup gar nicht mehr enthalten sind.
  Object.keys(EX_BASE).forEach(function(id){var ex=exById(id);if(ex){Object.keys(ex).forEach(function(k){delete ex[k];});Object.assign(ex,EX_BASE[id]);}});
  state.exOverrides=o.exOverrides||{};
  applyCustomEx();applyExOverrides();
  // Ein Backup enthält keinen halbfertigen Trainingszustand. Der alte darf weder lokal noch
  // im Konto neben dem wiederhergestellten Stand weiterleben.
  workout=null;try{localStorage.removeItem("formwert-workout");}catch(e){warnSaveFailed();}
  if(stTimer){clearTimeout(stTimer);stTimer=null;}
  state.dirty={};state.dirtyRoutines={};
  markCloudReplacePending(true);saveLocal();closeSheet();renderAll();
  if(!db){toast("Backup lokal eingespielt – Konto folgt beim nächsten Verbinden");return;}
  setSync("","Backup wird übertragen");
  replaceCloudFromState(db).then(function(){
    markCloudReplacePending(false);setSync("on","synchronisiert");toast("Backup vollständig eingespielt");
  }).catch(function(){
    setSync("off","Backup nur lokal – Übertragung wird wiederholt");
    toast("Backup lokal eingespielt – Konto folgt beim nächsten Verbinden");setTimeout(connect,30000);
  });
}
function readBackupText(txt){
  var o=null;try{o=JSON.parse(txt);}catch(e){}
  if(!o||!o.profile||typeof o.days!=="object"){toast("Datei nicht lesbar");return;}
  askConfirm("Backup einspielen?","Ersetzt alles auf diesem Gerät und im Konto durch: "+backupStats(o)+".","Einspielen",function(){applyBackup(o);},true);
}
function sheetRestore(){
  openSheet(function(b){
    sheetTitle(b,"Backup einspielen");
    b.appendChild(el("p","note","Wähl die Backup-Datei aus oder füg den Inhalt als Text ein. Das ersetzt deine aktuellen Daten."));
    var pick=el("button","btn primary block","Datei wählen");pick.style.marginTop="12px";
    var inp=document.createElement("input");inp.type="file";inp.accept="application/json,.json,text/plain";inp.style.display="none";
    inp.onchange=function(){
      var f=inp.files&&inp.files[0];if(!f)return;
      var rd=new FileReader();rd.onload=function(){readBackupText(String(rd.result));};rd.readAsText(f);
    };
    pick.onclick=function(){inp.click();};
    b.appendChild(pick);b.appendChild(inp);
    var ta=document.createElement("textarea");ta.placeholder="…oder Backup-Text hier einfügen";ta.style.marginTop="12px";
    b.appendChild(ta);
    var ok=el("button","btn ghost block","Text einspielen");ok.style.marginTop="8px";
    ok.onclick=function(){var v=ta.value.trim();if(!v){toast("Nichts eingefügt");return;}readBackupText(v);};
    b.appendChild(ok);
  });
}
function sheetAccount(){
  openSheet(function(b){
    sheetTitle(b,"Anmeldung & Sync");
    var on=syncState.k==="on";
    var st=el("div","card");st.style.margin="0 0 12px";
    st.appendChild(el("b",null,on?"Mit deinem Konto verbunden":"Nur auf diesem Gerät"));
    st.appendChild(el("p","note",on
      ? "Deine Trainings liegen in deinem Claude-Konto, nicht nur im Browser. Öffnest du Formwert auf einem anderen Gerät mit demselben Konto, sind alle Daten da."
      : "Gerade keine Verbindung zum Konto – alles wird lokal in diesem Browser gespeichert und beim nächsten Verbinden hochgeladen."));
    b.appendChild(st);
    b.appendChild(el("div","grouplab","Aufs Handy holen"));
    var steps=el("p","note","1. Formwert im Handy-Browser öffnen (gleiches Konto).\n2. Teilen-Symbol → „Zum Home-Bildschirm“.\n3. Einmal anmelden – danach bleibst du in dieser Kachel angemeldet und startest ohne Umweg.");
    steps.style.whiteSpace="pre-line";b.appendChild(steps);
    b.appendChild(el("div","grouplab","Sicherheitskopie"));
    b.appendChild(el("p","note","Ein Backup ist unabhängig vom Konto: eine Datei mit allem, was drin ist. Nimm sie, bevor du etwas Großes änderst."));
    var s=el("button","btn primary block","Backup speichern");s.style.marginTop="12px";
    s.onclick=function(){saveBackup();};b.appendChild(s);
    var r=el("button","btn ghost block","Backup einspielen");r.style.marginTop="8px";
    r.onclick=function(){closeSheet();setTimeout(sheetRestore,180);};b.appendChild(r);
  });
}
function renderFormula(c){
  var p=state.profile;
  $("formulabox").textContent=
   "Formwert = 30 % Maximalkraft\n         + 25 % Konstanz\n         + 20 % Muskelabdeckung\n         + 15 % Ausdauer\n         + 10 % Mobilität\n\n"+
   "Maximalkraft    Ø der "+KRAFT_CATS.length+" Kraft-Bereiche (90 T)\n                je Bereich zählt die stärkste Übung\n"+
   "Konstanz        Trainingstage "+c.win+" T ÷ "+Math.round(p.goals.days*c.win/7)+"\n"+
   "Muskelabdeckung Ø Sätze je Muskel gegen MEV/MAV (7 T)\n"+
   "Ausdauer        WHO-Minuten + VO2max-Perzentil\n"+
   "Mobilität       Einheiten "+c.win+" T ÷ "+Math.round(p.goals.mob*c.win/7)+"\n\n"+
   "1RM   Epley (1–3 Wdh) · Brzycki (4–6) · Wathen (7–15)\n      weich gemischt, aus dem besten Satz\n\n"+
   "Figur: react-native-body-highlighter (MIT)\n\n"+"jetzt  "+Math.round(c.kraft)+" / "+Math.round(c.konst)+" / "+Math.round(c.deckung)+" / "+Math.round(c.ausdauer)+" / "+Math.round(c.mob)+"   →   "+c.fitness;
}
function renderSpark(){
  var n=90,ser=[];
  for(var i=n-1;i>=0;i--){var d=shiftDays(TODAY,-i);ser.push({d:d,v:compute(d).fitness});}
  var W2=720,H=88,pd=7,xs=function(i){return pd+(W2-2*pd)*(i/(n-1));},ys=function(v){return H-pd-(H-2*pd)*(v/100);};
  var dl="";for(var j=0;j<n;j++)dl+=(j?"L":"M")+xs(j).toFixed(1)+" "+ys(ser[j].v).toFixed(1)+" ";
  var da="M"+xs(0).toFixed(1)+" "+(H-pd)+" "+dl.replace(/^M/,"L")+"L"+xs(n-1).toFixed(1)+" "+(H-pd)+" Z";
  var s="";[25,50,75].forEach(function(g){s+='<line x1="'+pd+'" y1="'+ys(g).toFixed(1)+'" x2="'+(W2-pd)+'" y2="'+ys(g).toFixed(1)+'" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 5" vector-effect="non-scaling-stroke"/>';});
  s+='<path d="'+da+'" fill="var(--accent)" fill-opacity="0.1"/><path d="'+dl+'" fill="none" stroke="var(--accent)" stroke-width="2.2" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>';
  s+='<circle cx="'+xs(n-1).toFixed(1)+'" cy="'+ys(ser[n-1].v).toFixed(1)+'" r="3.5" fill="var(--accent)"/>';
  $("spark").innerHTML=s;
  var df=ser[n-1].v-ser[0].v;$("sparkmeta").textContent=(df>=0?"+":"")+df+" seit "+shortDate(ser[0].d);
}
function renderHistory(){
  var box=$("history");box.innerHTML="";
  Object.keys(state.days).filter(function(d){return d<=TODAY;}).sort().reverse().slice(0,21).forEach(function(d){
    var dd=state.days[d],ns=(dd.sets||[]).length,nc=(dd.cardio||[]).length;
    if(!ns&&!nc&&!dd.mobility&&!(dd.note||"").trim())return;
    var r=el("div","row"),m=el("div","main");
    m.appendChild(el("b",null,d===TODAY?"Heute":deDate(d)));
    var parts=[];if(ns)parts.push(ns+" Sätze");
    if(nc){var mins=0;dd.cardio.forEach(function(c){mins+=c.min||0;});parts.push(mins+" min Ausdauer");}
    if(dd.mobility)parts.push("Mobilität");if((dd.note||"").trim())parts.push("Notiz");
    m.appendChild(el("span",null,parts.join(" · ")));r.appendChild(m);
    r.appendChild(el("div","val",compute(d).fitness));
    var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);
    r.className="row tap";r.onclick=function(){sheetDay(d);};box.appendChild(r);
  });
  if(!box.children.length)box.appendChild(el("div","empty","Noch keine Einträge."));
}
// Ganze Einheiten-Liste als horizontaler Wisch-Pager statt vertikal gestapelter Karten – eine
// Karte füllt die volle verfügbare Höhe (nie abgeschnitten), die nächste Einheit erreicht man
// per Wisch. Ganz hinten (letzte Seite) ein eigenständiges "+"-Karte für eine neue Einheit,
// analog zum "+" am Ende des Übungs-Pagers im laufenden Training (siehe woAddPage()).
var rcPage=0;
function routineIds(){
  var ids=Object.keys(state.routines),pos={};
  ids.forEach(function(id,i){
    var r=state.routines[id];
    // Einheiten ohne gespeicherte Position (alle bisherigen) behalten ihre
    // bisherige Reihenfolge und stehen hinter den einsortierten.
    pos[id]=(r&&typeof r.ord==="number")?r.ord:1000+i;
  });
  ids.sort(function(a,b){return pos[a]-pos[b];});
  return ids;
}
function setRoutineOrder(ids){
  var changed=false;
  ids.forEach(function(id,i){
    var r=state.routines[id];if(!r)return;
    if(r.ord!==i){r.ord=i;state.dirtyRoutines[id]=true;changed=true;}
  });
  if(changed)persist();
}
function renderRoutines(){
  // Einheiten als ruhige, scannbare Liste: Name, Umfang, Dauer, zuletzt genutzt - und genau
  // eine Hauptaktion je Zeile (Starten). Die Reihenfolge ändert man in einem eigenen Modus
  // mit Pfeilen, statt per Gedrückthalten: das ist auffindbar und auch ohne Wischgeste bedienbar.
  var box=$("routine-list");box.className="rc-list";box.innerHTML="";var ids=routineIds();
  var pendingDraws=[],last=routineLastUse();
  ids.forEach(function(id,idx){
    var r=state.routines[id],card=el("div","card rc-item"+(rcSort?" sorting":""));
    var fo=routineFocus(r.items);
    var fig=el("div","rc-fig");fig.setAttribute("aria-hidden","true");
    if(fo.max>0){
      ["front","back"].forEach(function(v){var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");sv.setAttribute("viewBox","0 0 800 1500");fig.appendChild(sv);pendingDraws.push({sv:sv,v:v,sets:fo.sets});});
    }
    card.appendChild(fig);
    var tx=el("div","rc-txt");
    tx.appendChild(el("b",null,r.name));
    var nSets=r.items.reduce(function(a,i){return a+(i.sets||0);},0),lu=last[r.name];
    var mins=lu&&lu.dur?Math.round(lu.dur/60):Math.round(nSets*2.5);
    tx.appendChild(el("span","rc-meta",r.items.length+" Übungen · "+nSets+" Sätze · "+(lu&&lu.dur?"":"ca. ")+mins+"\u00a0min"));
    tx.appendChild(el("span","rc-exs",r.items.map(function(it){var ex=exById(it.ex);return ex?ex.n:"";}).filter(Boolean).join(" · ")));
    tx.appendChild(el("span","rc-last",lu?("Zuletzt "+(lu.d===TODAY?"heute":humanSince(daysBetween(lu.d,TODAY)*24))):"Noch nicht genutzt"));
    card.appendChild(tx);
    var act=el("div","rc-act");
    if(rcSort){
      var up=el("button","iconbtn");up.type="button";up.setAttribute("aria-label",r.name+" nach oben");up.innerHTML=svgIcon("M12 19V5M5 12l7-7 7 7",2);
      up.disabled=idx===0;up.onclick=function(){moveRoutine(ids,idx,-1);};
      var dn=el("button","iconbtn");dn.type="button";dn.setAttribute("aria-label",r.name+" nach unten");dn.innerHTML=svgIcon("M12 5v14M5 12l7 7 7-7",2);
      dn.disabled=idx===ids.length-1;dn.onclick=function(){moveRoutine(ids,idx,1);};
      act.appendChild(up);act.appendChild(dn);
    }else{
      var ed=el("button","iconbtn");ed.type="button";ed.setAttribute("aria-label","Bearbeiten");ed.innerHTML=svgIcon("M4 20h4L19 9l-4-4L4 16z");
      ed.onclick=function(){sheetEditor(id);};act.appendChild(ed);
      var st=el("button","btn primary rc-go");st.type="button";st.setAttribute("aria-label",r.name+" starten");
      st.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8v14.4a.8.8 0 0 0 1.2.7l11.3-7.2a.8.8 0 0 0 0-1.4L8.2 4.1A.8.8 0 0 0 7 4.8z"/></svg>';
      st.onclick=function(){startSession(id);};act.appendChild(st);
    }
    card.appendChild(act);
    box.appendChild(card);
  });
  if(!ids.length){
    var e=el("div","card estate");
    e.appendChild(el("b",null,"Noch keine Einheit"));
    e.appendChild(el("p",null,"Leg deine erste Einheit an – etwa „Push“, „Pull“ oder „Ganzkörper“. Beim nächsten Mal startest du sie mit einem Tipp."));
    box.appendChild(e);
  }
  var add=el("button","rc-add-row");add.type="button";
  var ic=el("span","rc-add-ic");ic.innerHTML=svgIcon("M12 5v14M5 12h14",2.2);add.appendChild(ic);
  add.appendChild(el("span",null,"Neue Einheit"));
  add.onclick=function(){sheetEditor(null);};
  if(!rcSort)box.appendChild(add);
  if(ids.length>1){
    var tools=el("div","rc-tools");
    var so=el("button","linkbtn",rcSort?"Fertig":"Reihenfolge ändern");so.type="button";
    so.onclick=function(){rcSort=!rcSort;renderRoutines();};
    tools.appendChild(so);box.appendChild(tools);
  }
  if(pendingDraws.length)requestAnimationFrame(function(){pendingDraws.forEach(function(o){drawMini(o.sv,o.v,o.sets);});});
  $("routine-count").textContent=ids.length+(ids.length===1?" Einheit":" Einheiten");
  // Ohne eigene Einheit ist das freie Training der naheliegende Start - dann wird es zur Hauptaktion.
  // Immer in Akzentfarbe, damit der Einstieg ins freie Training sofort ins Auge faellt.
  var sb=$("btn-start-empty");if(sb)sb.className="btn primary block wo-start";
}

var rcSort=false;

function moveRoutine(ids,i,dir){
  var j=i+dir;if(j<0||j>=ids.length)return;
  var a=ids.slice(),t=a[i];a[i]=a[j];a[j]=t;
  setRoutineOrder(a);renderRoutines();
  toast("Reihenfolge geändert");
}

/* Letzte Nutzung je Einheit. Gespeicherte Trainings kennen nur ihren Namen, nicht die Vorlage -
   der Name ist beim Start aus der Vorlage übernommen und reicht als Zuordnung. */
function routineLastUse(){
  var out={};
  Object.keys(state.days).filter(function(k){return k<=TODAY;}).sort().forEach(function(k){
    (state.days[k].workouts||[]).forEach(function(wo){if(wo&&wo.name)out[wo.name]={d:k,dur:wo.dur||0};});
  });
  return out;
}
