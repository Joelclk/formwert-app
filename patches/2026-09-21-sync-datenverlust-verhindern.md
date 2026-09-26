## Lokale Änderungen bei Sync-Fehlern und Neustarts erhalten

Die App hat offene Cloud-Änderungen bisher nur im Arbeitsspeicher markiert. Nach
einem Neustart waren diese Markierungen weg; beim Verbinden konnte ein älterer
Cloud-Stand lokale Tage oder Vorlagen überschreiben. Außerdem wurden Dirty-
Markierungen schon vor dem erfolgreichen Schreiben gelöscht und Schreibfehler
lautlos ignoriert. Dieser Patch speichert die Markierungen lokal, lässt lokale
offene Änderungen beim Cloud-Download gewinnen und entfernt sie erst nach einer
erfolgreichen, zusammengefassten Übertragung. Fehlgeschlagene Übertragungen
werden sichtbar und automatisch wiederholt.

**Überarbeitet am 26.09.2026** (vor dem ersten Anwenden – die Fassung vom 21.09.
war nie in der App):

- Eigene Übungen und Übungs-Anpassungen werden beim Verbinden wieder immer mit dem
  Cloud-Stand zusammengeführt. Die erste Fassung hat das Einlesen übersprungen,
  solange lokal etwas offen war, und danach die lokale Liste hochgeschrieben – damit
  wären eigene Übungen, die auf einem anderen Gerät angelegt wurden, aus dem Konto
  gelöscht worden. Damit gelöschte Übungen und zurückgesetzte Anpassungen beim
  Zusammenführen nicht wieder auftauchen, merkt sich die App sie
  (`state.extrasGone`), bis das Konto sie ebenfalls los ist.
- Beim Einspielen eines Backups werden auch diese neuen Markierungen geleert.

ALT:
```js
var state={profile:null,days:{},routines:{},dirty:{},dirtyRoutines:{},customEx:[],exOverrides:{}};
```

NEU:
```js
var state={profile:null,days:{},routines:{},dirty:{},dirtyRoutines:{},dirtyExtras:0,extrasGone:{},customEx:[],exOverrides:{}};
```

ALT:
```js
function setExOverride(id,patch){
  state.exOverrides=state.exOverrides||{};
  state.exOverrides[id]=patch;
  applyExOverrides();saveLocal();queueSave();secDirty.entdecken=true;
}
function resetExOverride(id){
  if(!state.exOverrides)return;
  delete state.exOverrides[id];
  var base=EX_BASE[id],ex=exById(id);
  if(base&&ex){Object.keys(ex).forEach(function(k){delete ex[k];});Object.assign(ex,base);}
  saveLocal();queueSave();secDirty.entdecken=true;
}
```

NEU:
```js
function setExOverride(id,patch){
  state.exOverrides=state.exOverrides||{};
  state.exOverrides[id]=patch;if(state.extrasGone)delete state.extrasGone["ov:"+id];markExtrasDirty();
  applyExOverrides();saveLocal();queueSave();secDirty.entdecken=true;
}
function resetExOverride(id){
  if(!state.exOverrides)return;
  delete state.exOverrides[id];markExtrasDirty("ov:"+id);
  var base=EX_BASE[id],ex=exById(id);
  if(base&&ex){Object.keys(ex).forEach(function(k){delete ex[k];});Object.assign(ex,base);}
  saveLocal();queueSave();secDirty.entdecken=true;
}
```

ALT:
```js
function loadLocal(){try{var r=localStorage.getItem(LSK)||localStorage.getItem("formwert-v2");
  if(r){var o=JSON.parse(r);if(o&&o.profile){state.profile=o.profile;state.days=o.days||{};state.routines=o.routines||{};state.customEx=o.customEx||[];state.exOverrides=o.exOverrides||{};}}}catch(e){}
  applyCustomEx();applyExOverrides();}
```

NEU:
```js
function loadLocal(){try{var r=localStorage.getItem(LSK)||localStorage.getItem("formwert-v2");
  if(r){var o=JSON.parse(r);if(o&&o.profile){state.profile=o.profile;state.days=o.days||{};state.routines=o.routines||{};state.customEx=o.customEx||[];state.exOverrides=o.exOverrides||{};state.dirty=o.dirty||{};state.dirtyRoutines=o.dirtyRoutines||{};state.dirtyExtras=o.dirtyExtras||0;state.extrasGone=o.extrasGone||{};}}}catch(e){}
  applyCustomEx();applyExOverrides();}
```

ALT:
```js
function saveLocal(){try{localStorage.setItem(LSK,JSON.stringify(
  {profile:state.profile,days:state.days,routines:state.routines,customEx:state.customEx,exOverrides:state.exOverrides}));}catch(e){warnSaveFailed();}}
```

NEU:
```js
function saveLocal(){try{localStorage.setItem(LSK,JSON.stringify(
  {profile:state.profile,days:state.days,routines:state.routines,customEx:state.customEx,exOverrides:state.exOverrides,
   dirty:state.dirty,dirtyRoutines:state.dirtyRoutines,dirtyExtras:state.dirtyExtras,extrasGone:state.extrasGone}));}catch(e){warnSaveFailed();}}
```

ALT:
```js
function addCustomExercise(ex){
  ex.id=uniqueExId();ex.custom=true;
  EX.push(ex);if(EX_BY_ID)EX_BY_ID[ex.id]=ex;state.customEx.push(ex);saveLocal();queueSave();secDirty.entdecken=true;
  return ex;
}
function removeCustomExercise(id){
  state.customEx=state.customEx.filter(function(e){return e.id!==id;});
  for(var i=0;i<EX.length;i++){if(EX[i].id===id){EX.splice(i,1);break;}}
  if(EX_BY_ID)delete EX_BY_ID[id];
  saveLocal();queueSave();secDirty.entdecken=true;
}
```

NEU:
```js
function addCustomExercise(ex){
  ex.id=uniqueExId();ex.custom=true;
  EX.push(ex);if(EX_BY_ID)EX_BY_ID[ex.id]=ex;state.customEx.push(ex);markExtrasDirty();saveLocal();queueSave();secDirty.entdecken=true;
  return ex;
}
function removeCustomExercise(id){
  state.customEx=state.customEx.filter(function(e){return e.id!==id;});
  for(var i=0;i<EX.length;i++){if(EX[i].id===id){EX.splice(i,1);break;}}
  if(EX_BY_ID)delete EX_BY_ID[id];
  markExtrasDirty("ex:"+id);saveLocal();queueSave();secDirty.entdecken=true;
}
```

ALT:
```js
        Object.assign(ex,patch);saveLocal();secDirty.entdecken=true;
```

NEU:
```js
        Object.assign(ex,patch);markExtrasDirty();saveLocal();queueSave();secDirty.entdecken=true;
```

ALT:
```js
    if(r.ord!==i){r.ord=i;state.dirtyRoutines[id]=true;changed=true;}
```

NEU:
```js
    if(r.ord!==i){r.ord=i;markRoutineDirty(id);changed=true;}
```

ALT:
```js
        rt.items=rtItems;state.routines[rt.id]=rt;state.dirtyRoutines[rt.id]=true;persist();
```

NEU:
```js
        rt.items=rtItems;state.routines[rt.id]=rt;markRoutineDirty(rt.id);persist();
```

ALT:
```js
      state.routines[ed.id]=ed;state.dirtyRoutines[ed.id]=true;closeSheet();persist();renderAll();};
```

NEU:
```js
      state.routines[ed.id]=ed;markRoutineDirty(ed.id);closeSheet();persist();renderAll();};
```

ALT:
```js
      del2.onclick=function(){closeSheet();setTimeout(function(){askConfirm("Einheit löschen?",ed.name,"Löschen",function(){delete state.routines[id];state.dirtyRoutines[id]=true;persist();renderAll();});},180);};
```

NEU:
```js
      del2.onclick=function(){closeSheet();setTimeout(function(){askConfirm("Einheit löschen?",ed.name,"Löschen",function(){delete state.routines[id];markRoutineDirty(id);persist();renderAll();});},180);};
```

ALT:
```js
/* ================= Persistenz ================= */
function touch(d){state.dirty[d]=true;queueSave();}
var stTimer=null;
function queueSave(){if(stTimer)clearTimeout(stTimer);stTimer=setTimeout(persist,700);}
function persist(){
  saveLocal();if(!db)return;
  var p=Object.keys(state.dirty);state.dirty={};
  p.forEach(function(d){var b=state.days[d];if(!b)return;
    db.doc("days/"+d).set({sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}).catch(function(){});});
  var r=Object.keys(state.dirtyRoutines);state.dirtyRoutines={};
  r.forEach(function(id){if(state.routines[id])db.doc("routines/"+id).set(state.routines[id]).catch(function(){});else db.doc("routines/"+id).delete().catch(function(){});});
  if(state.profile)db.doc("state/profile").set(state.profile).catch(function(){});
  // Eigene und geaenderte Uebungen gehoeren genauso zum Konto wie Profil, Tage und
  // Routinen - ohne sie waeren sie beim Oeffnen auf einem anderen Geraet oder in einer
  // neuen Fassung der App verloren.
  db.doc("state/exoverrides").set({v:state.exOverrides||{}}).catch(function(){});
  db.doc("state/customex").set({v:state.customEx||[]}).catch(function(){});
}
```

NEU:
```js
/* ================= Persistenz ================= */
// Jede Änderung bekommt eine laufende Nummer. Dadurch darf ein abgeschlossener älterer
// Schreibvorgang nur genau die Version als erledigt markieren, die er selbst übertragen hat.
var dirtySeq=Date.now(),persistRun=null,persistAgain=false,syncRetryT=null;

function nextDirty(){return ++dirtySeq;}

function touch(d){state.dirty[d]=nextDirty();saveLocal();queueSave();}

function markRoutineDirty(id){state.dirtyRoutines[id]=nextDirty();saveLocal();}

// Eigene Übungen und Anpassungen werden beim Verbinden mit dem Cloud-Stand zusammengeführt.
// Was hier gelöscht oder zurückgesetzt wurde, steht dort aber noch drin und käme so zurück –
// darum wird es gemerkt, bis der nächste erfolgreiche Upload es auch aus dem Konto entfernt.
function markExtrasDirty(gone){
  state.dirtyExtras=nextDirty();
  if(gone){state.extrasGone=state.extrasGone||{};state.extrasGone[gone]=1;}
  saveLocal();
}

var stTimer=null;

function queueSave(){if(stTimer)clearTimeout(stTimer);stTimer=setTimeout(persist,700);}

function persist(){
  saveLocal();if(!db)return Promise.resolve(false);
  // Cloud-Schreibvorgänge seriell ausführen. Sonst kann ein langsamer älterer Stand einen
  // neueren überholen und zuletzt in der Datenbank landen.
  if(persistRun){persistAgain=true;return persistRun;}
  var p=Object.keys(state.dirty),pv={},r=Object.keys(state.dirtyRoutines),rv={},ev=state.dirtyExtras,jobs=[];
  p.forEach(function(d){pv[d]=state.dirty[d];var b=state.days[d];if(!b)return;
    jobs.push(db.doc("days/"+d).set({sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}));});
  r.forEach(function(id){rv[id]=state.dirtyRoutines[id];
    jobs.push(state.routines[id]?db.doc("routines/"+id).set(state.routines[id]):db.doc("routines/"+id).delete());});
  if(state.profile)jobs.push(db.doc("state/profile").set(state.profile));
  jobs.push(db.doc("state/exoverrides").set({v:state.exOverrides||{}}));
  jobs.push(db.doc("state/customex").set({v:state.customEx||[]}));
  persistRun=Promise.all(jobs).then(function(){
    p.forEach(function(d){if(state.dirty[d]===pv[d])delete state.dirty[d];});
    r.forEach(function(id){if(state.dirtyRoutines[id]===rv[id])delete state.dirtyRoutines[id];});
    if(state.dirtyExtras===ev){state.dirtyExtras=0;state.extrasGone={};}
    if(syncRetryT){clearTimeout(syncRetryT);syncRetryT=null;}
    saveLocal();setSync("on","synchronisiert");return true;
  },function(){
    // Nichts als erledigt markieren: alle Versionen bleiben im localStorage und werden
    // beim nächsten Versuch oder sogar nach einem Neustart erneut übertragen.
    saveLocal();setSync("off","Sync gestört – lokal gespeichert");
    if(syncRetryT)clearTimeout(syncRetryT);
    syncRetryT=setTimeout(function(){syncRetryT=null;persist();},30000);
    return false;
  }).then(function(ok){
    persistRun=null;
    if(persistAgain){persistAgain=false;setTimeout(persist,0);}
    return ok;
  });
  return persistRun;
}
```

ALT:
```js
      if(touched){state.dirty[d]=true;changed=true;}
```

NEU:
```js
      if(touched){touch(d);changed=true;}
```

ALT:
```js
      if(touched2){state.dirtyRoutines[rid2]=true;changed=true;}
```

NEU:
```js
      if(touched2){markRoutineDirty(rid2);changed=true;}
```

ALT:
```js
    changed=true;
  });
  if(changed)saveLocal();
```

NEU:
```js
    markExtrasDirty();changed=true;
  });
  if(changed)saveLocal();
```

ALT:
```js
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(!b)return;
        if(doc.id===TODAY&&state.days[TODAY]&&(state.days[TODAY].sets||[]).length)return;
        state.days[doc.id]={sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""};});
```

NEU:
```js
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(!b)return;
        // Ein lokal geänderter Tag gewinnt, bis genau diese Version erfolgreich hochgeladen ist.
        if(state.dirty[doc.id])return;
        if(doc.id===TODAY&&state.days[TODAY]&&(state.days[TODAY].sets||[]).length)return;
        state.days[doc.id]={sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""};});
```

ALT:
```js
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(b&&b.id)state.routines[b.id]=b;});
```

NEU:
```js
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(b&&b.id&&!state.dirtyRoutines[doc.id])state.routines[b.id]=b;});
```

ALT:
```js
function fw_syncPullExtras(d){
  return d.doc("state/exoverrides").get().then(function(es){
    var v=es&&es.exists?cloneWritable(es.data()):null;v=v&&v.v;
    if(v&&typeof v==="object"){
      state.exOverrides=state.exOverrides||{};
      Object.keys(v).forEach(function(id){if(!state.exOverrides[id])state.exOverrides[id]=v[id];});
    }
    return d.doc("state/customex").get();
  }).then(function(cs){
    var v=cs&&cs.exists?cloneWritable(cs.data()):null;v=v&&v.v;
    if(Array.isArray(v)){
      state.customEx=state.customEx||[];
      var have={};state.customEx.forEach(function(e){if(e&&e.id)have[e.id]=1;});
      v.forEach(function(e){if(e&&e.id&&!have[e.id])state.customEx.push(e);});
    }
    applyCustomEx();applyExOverrides();
    secDirty.entdecken=true;secDirty.training=true;
  }).catch(function(){});
}
```

NEU:
```js
function fw_syncPullExtras(d){
  // Kein catch: Schlägt das Einlesen fehl, darf connect() nicht weitermachen und danach
  // den unvollständigen lokalen Stand als vollständig ins Konto schreiben.
  var gone=state.extrasGone||{};
  return d.doc("state/exoverrides").get().then(function(es){
    var v=es&&es.exists?cloneWritable(es.data()):null;v=v&&v.v;
    if(v&&typeof v==="object"){
      state.exOverrides=state.exOverrides||{};
      Object.keys(v).forEach(function(id){if(!state.exOverrides[id]&&!gone["ov:"+id])state.exOverrides[id]=v[id];});
    }
    return d.doc("state/customex").get();
  }).then(function(cs){
    var v=cs&&cs.exists?cloneWritable(cs.data()):null;v=v&&v.v;
    if(Array.isArray(v)){
      state.customEx=state.customEx||[];
      var have={};state.customEx.forEach(function(e){if(e&&e.id)have[e.id]=1;});
      v.forEach(function(e){if(e&&e.id&&!have[e.id]&&!gone["ex:"+e.id])state.customEx.push(e);});
    }
    applyCustomEx();applyExOverrides();
    secDirty.entdecken=true;secDirty.training=true;
  });
}
```

ALT:
```js
      mergeDuplicateCustomEx();
      if(state.profile&&state.profile.version>=3)renderAll();persist();
      connectTries=0;setSync("on","synchronisiert");
```

NEU:
```js
      mergeDuplicateCustomEx();
      if(state.profile&&state.profile.version>=3)renderAll();persist();
      connectTries=0;
```

ALT:
```js
  state.dirty={};state.dirtyRoutines={};
  markCloudReplacePending(true);
```

NEU:
```js
  state.dirty={};state.dirtyRoutines={};state.dirtyExtras=0;state.extrasGone={};
  markCloudReplacePending(true);
```
