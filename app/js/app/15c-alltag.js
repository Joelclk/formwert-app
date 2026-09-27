/* =========================================================================
   app/15c-alltag.js - Kleine Alltagshelfer im Training
   - Notiz je Uebung (Sitzhoehe, Griffbreite ...), erscheint bei jedem Training
   - Aufwaermsaetze aus dem Arbeitsgewicht (zaehlen nicht zur Statistik)
   - Backup: "zuletzt gesichert" und Export als Tabelle (CSV)
   ========================================================================= */

/* ---------- Notiz je Uebung ---------- */
var IC_PEN="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4";
function exNote(id){var n=state.profile&&state.profile.exNotes;return n&&n[id]?String(n[id]):"";}
function setExNote(id,v){
  var p=state.profile;if(!p)return;
  p.exNotes=p.exNotes||{};
  v=String(v||"").trim().slice(0,300);
  if(v)p.exNotes[id]=v;else delete p.exNotes[id];
  persist();
}
function sheetExNote(ex,after){
  openSheet(function(b){
    sheetTitle(b,"Notiz zu „"+ex.n+"“");
    b.appendChild(el("p","note","Steht bei jedem Training mit dieser Übung oben – z. B. Sitzhöhe, Griffbreite oder Einstellung am Gerät."));
    var ta=document.createElement("textarea");ta.value=exNote(ex.id);ta.placeholder="z. B. Sitz Stufe 4, Griff eng";ta.maxLength=300;ta.rows=3;
    ta.setAttribute("aria-label","Notiz");
    b.appendChild(ta);
    var save=el("button","btn primary block","Speichern");save.style.marginTop="12px";
    save.onclick=function(){setExNote(ex.id,ta.value);closeSheet();if(after)after();};
    b.appendChild(save);
    if(exNote(ex.id)){
      var del=el("button","btn ghost block","Notiz löschen");del.style.marginTop="8px";
      del.onclick=function(){setExNote(ex.id,"");closeSheet();if(after)after();};
      b.appendChild(del);
    }
    setTimeout(function(){try{ta.focus();}catch(e){}},250);
  });
}
function woNoteEl(ex){
  var t=exNote(ex.id);
  var b=el("button","wo-note"+(t?"":" empty"));b.type="button";
  b.setAttribute("aria-label",t?"Notiz bearbeiten: "+t:"Notiz zur Übung hinzufügen");
  b.innerHTML=svgIcon(IC_PEN,1.8);
  b.appendChild(el("span",null,t||"Notiz hinzufügen"));
  b.onclick=function(){sheetExNote(ex,function(){var nb=woNoteEl(ex);if(b.parentNode)b.parentNode.replaceChild(nb,b);});};
  return b;
}

/* ---------- Aufwaermsaetze ----------
   Aus dem Arbeitsgewicht (hoechstes eingetragenes Gewicht der Uebung): bei der ersten Uebung
   fuer einen Muskel eine kleine Rampe, bei weiteren Uebungen fuer denselben Muskel nur noch ein
   Einstiegssatz - der Muskel ist dann schon warm. Leichte Gewichte (unter 10 kg) brauchen
   kein eigenes Aufwaermen. Nur zur Orientierung: wird nicht gespeichert und zaehlt nirgends. */
function warmEnabled(){return !(state.profile&&state.profile.warmup===false);}
function warmupSets(ex,W,first){
  if(!ex||ex.t!=="load"||!(W>=10))return [];
  var step=sugStep(ex),bar=ex.e==="Langhantel"?20:0,out=[];
  if(W<2*step)return [];
  var plan=first?(W>=60?[[0.5,8],[0.7,5],[0.85,3]]:W>=30?[[0.5,8],[0.75,4]]:[[0.6,6]]):[[0.7,4]];
  if(first&&bar&&W>=50)plan.unshift([bar/W,10]);   // leere Stange zum Einstieg
  plan.forEach(function(p){
    var kg=sugRound(W*p[0],step);if(bar)kg=Math.max(bar,kg);
    if(kg<=0||kg>=W)return;
    if(out.length&&out[out.length-1].kg>=kg)return;
    out.push({kg:kg,reps:p[1]});
  });
  return out;
}
function woWorkKg(we){var m=0;(we.sets||[]).forEach(function(s){if(s.kg>m)m=s.kg;});return m;}
function woFirstForMuscle(ei){
  var ex=exById(workout.exercises[ei].ex);if(!ex)return true;
  var mine=ex.p||[];
  for(var i=0;i<ei;i++){var o=exById(workout.exercises[i].ex);
    if(o&&(o.p||[]).some(function(m){return mine.indexOf(m)>=0;}))return false;}
  return true;
}
function woWarmEl(we,ex,ei){
  if(!warmEnabled()||ex.t!=="load"||!we.sets||we.sets.some(function(s){return s.done;}))return null;
  var list=warmupSets(ex,woWorkKg(we),woFirstForMuscle(ei));
  if(!list.length)return null;
  if(!Array.isArray(we.warm))we.warm=[];
  var box=el("div","wo-warm");
  box.appendChild(el("span","wo-warm-lab","Aufwärmen"));
  var chips=el("div","wo-warm-chips");
  list.forEach(function(s,i){
    var on=!!we.warm[i];
    var c=el("button","wo-warm-chip"+(on?" on":""));c.type="button";
    c.innerHTML='<b class="num">'+fmtNum(s.kg)+'</b> kg × <b class="num">'+s.reps+'</b>';
    c.setAttribute("aria-pressed",String(on));
    c.setAttribute("aria-label","Aufwärmsatz "+fmtNum(s.kg)+" kg mal "+s.reps+(on?", erledigt":""));
    c.onclick=function(){we.warm[i]=!we.warm[i];c.classList.toggle("on",!!we.warm[i]);c.setAttribute("aria-pressed",String(!!we.warm[i]));saveWorkoutSoon();};
    chips.appendChild(c);
  });
  box.appendChild(chips);
  return box;
}

// Beim In-place-Update (Haken gesetzt, kein Neuaufbau) die Aufwaermzeile auffrischen:
// verschwindet mit dem ersten Arbeitssatz, erscheint wieder, wenn der Haken zurueckgenommen wird.
function woWarmRefresh(pg,we,ei){
  var ex=exById(we.ex);if(!ex||!we.sets)return;
  var old=pg.querySelector(".wo-warm"),nw=woWarmEl(we,ex,ei);
  if(old&&nw)old.parentNode.replaceChild(nw,old);
  else if(old)old.parentNode.removeChild(old);
  else if(nw){var t=pg.querySelector(".wo-table");if(t)t.parentNode.insertBefore(nw,t);}
}

/* ---------- Backup: zuletzt gesichert, Export als Tabelle ---------- */
function backupAgeText(){
  var d=state.profile&&state.profile.lastBackup;
  if(!d)return "noch nie";
  var n=daysBetween(d,TODAY);
  return n<=0?"heute":n===1?"gestern":"vor "+n+" Tagen";
}
function backupOverdue(){var d=state.profile&&state.profile.lastBackup;return !d||daysBetween(d,TODAY)>30;}
function markBackupDone(){if(state.profile){state.profile.lastBackup=TODAY;persist();}}
function csvCell(v){v=v==null?"":String(v);return /[;"\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function csvNum(v){return v==null||v===""?"":String(Math.round(v*100)/100).replace(".",",");}
function trainingCsv(){
  var rows=[["Datum","Art","Übung","kg","Wdh. / Sek.","Wdh. links","Wdh. rechts","Reserve","Minuten","km","Training"]];
  var wname={};
  Object.keys(state.days).forEach(function(k){(state.days[k].workouts||[]).forEach(function(w){if(w&&w.id)wname[w.id]=w.name||"";});});
  Object.keys(state.days).sort().forEach(function(k){
    var d=state.days[k];
    (d.sets||[]).forEach(function(s){var ex=exById(s.ex);
      rows.push([k,"Kraft",ex?ex.n:s.ex,ex&&ex.t==="load"?csvNum(s.kg):"",csvNum(s.reps),csvNum(s.repsL),csvNum(s.repsR),s.rir!=null?s.rir:"","","",wname[s.wid]||""]);});
    (d.cardio||[]).forEach(function(c){var ex=exById(c.ex);
      rows.push([k,"Ausdauer",ex?ex.n:c.ex,"","","","","",csvNum(c.min),csvNum(c.km),wname[c.wid]||""]);});
  });
  return "﻿"+rows.map(function(r){return r.map(csvCell).join(";");}).join("\r\n")+"\r\n";
}
function saveCsv(){
  if(!window.claude||!window.claude.use){toast("Hier nicht möglich");return;}
  window.claude.use("downloads").then(function(dl){
    if(!dl){toast("Speichern hier nicht möglich");return;}
    return dl.save({filename:"formwert-training-"+TODAY+".csv",data:trainingCsv()}).then(function(){toast("Tabelle gespeichert");});
  }).catch(function(e){if(e&&e.code==="declined")return;toast("Export fehlgeschlagen");});
}
