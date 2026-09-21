## Backup-Wiederherstellung ersetzt den Cloud-Stand vollständig

Eine Wiederherstellung hat bisher nur die Dokumente aus dem Backup hochgeladen.
Ältere Tage und Vorlagen, die nicht im Backup vorkamen, blieben in der Cloud und
konnten beim nächsten Start wieder auftauchen. Jetzt wird der gewünschte Stand
explizit abgeglichen: nicht mehr vorhandene Cloud-Dokumente werden gelöscht,
alle Backup-Dokumente geschrieben und ein eventuell laufendes Training verworfen.
Wird das Backup ohne Cloud-Verbindung eingespielt, bleibt ein lokaler Auftrag
gespeichert und wird vor dem nächsten Herunterladen von Cloud-Daten ausgeführt.

ALT:
```js
var LSK="formwert-v3";
```

NEU:
```js
var LSK="formwert-v3";
var CLOUD_REPLACE_KEY="formwert-cloud-replace-pending";

function cloudReplacePending(){try{return localStorage.getItem(CLOUD_REPLACE_KEY)==="1";}catch(e){return false;}}

function markCloudReplacePending(on){try{
  if(on)localStorage.setItem(CLOUD_REPLACE_KEY,"1");else localStorage.removeItem(CLOUD_REPLACE_KEY);
}catch(e){warnSaveFailed();}}
```

ALT:
```js
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
  for(var k in state.days)state.dirty[k]=true;
  for(var r in state.routines)state.dirtyRoutines[r]=true;
  saveLocal();persist();closeSheet();renderAll();toast("Backup eingespielt");
}
```

NEU:
```js
// Anders als persist() bildet diese Funktion keinen Teilstand ab, sondern ersetzt den
// Konto-Inhalt bewusst vollständig. Das ist für eine Backup-Wiederherstellung wichtig:
// Dokumente, die im Backup fehlen, dürfen beim nächsten Start nicht wieder auftauchen.
function replaceCloudFromState(d){
  if(!d)return Promise.reject(new Error("keine Cloud-Verbindung"));
  var days=state.days||{},routines=state.routines||{};
  return Promise.all([d.collection("days").get(),d.collection("routines").get()]).then(function(q){
    var jobs=[];
    (q[0]&&q[0].docs||[]).forEach(function(doc){if(!days[doc.id])jobs.push(d.doc("days/"+doc.id).delete());});
    (q[1]&&q[1].docs||[]).forEach(function(doc){if(!routines[doc.id])jobs.push(d.doc("routines/"+doc.id).delete());});
    Object.keys(days).forEach(function(id){var b=days[id]||{};
      jobs.push(d.doc("days/"+id).set({sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""}));});
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
```

ALT:
```js
    db=d;setSync("on","synchronisiert");
    d.doc("state/profile").get().then(function(s){
```

NEU:
```js
    db=d;
    // Eine offline begonnene Wiederherstellung muss VOR jedem Cloud-Download abgeschlossen
    // werden. Sonst würden gerade ersetzte lokale Daten wieder mit dem alten Kontostand vermischt.
    if(cloudReplacePending()){
      setSync("","Backup wird übertragen");
      return replaceCloudFromState(d).then(function(){
        markCloudReplacePending(false);connectTries=0;setSync("on","synchronisiert");connect();
      }).catch(function(){
        setSync("off","Backup nur lokal – Übertragung wird wiederholt");fwBootReady();setTimeout(connect,30000);
      });
    }
    setSync("on","synchronisiert");
    d.doc("state/profile").get().then(function(s){
```
