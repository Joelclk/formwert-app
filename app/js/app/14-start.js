/* ==========================================================
   app/14-start.js - Start: lokale Daten laden, Verbindung zum Konto, 3D-Viewer (grosse Ansicht)
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Start ================= */
function autoCloseWorkout(w){
  if(!w||!Array.isArray(w.exercises))return;
  var dk=iso(new Date(w.startedAt)),d=day(dk);d.workouts=d.workouts||[];
  if(d.workouts.some(function(x){return x.id===w.id;}))return;
  var done=0,vol=0,exs=0,last=w.startedAt;
  w.exercises.forEach(function(we){var ex=exById(we.ex);if(!ex||!we.sets)return;var any=false;
    we.sets.forEach(function(st){if(!st.done)return;any=true;done++;if(st.rec&&st.rec.ts>last)last=st.rec.ts;
      if(ex.t==="load")vol+=effectiveKg(ex,st.kg)*(st.reps||0);});
    if(any)exs++;});
  // Letzten abgehakten Satz auch aus den gespeicherten Tagen suchen (Satz-Kopien im Training
  // haben nach dem Laden keinen Bezug mehr).
  for(var k in state.days){(state.days[k].sets||[]).forEach(function(st){if(st.wid===w.id&&st.ts>last)last=st.ts;});}
  var cardioMin=0;for(var k2 in state.days){(state.days[k2].cardio||[]).forEach(function(c){if(c.wid===w.id)cardioMin+=c.min||0;});}
  if(!done&&!cardioMin)return;
  d.workouts.push({id:w.id,name:w.name||"Training",start:w.startedAt,dur:Math.max(60,Math.round((last-w.startedAt)/1000)),
    sets:done,exs:exs,vol:Math.round(vol),cardioMin:Math.round(cardioMin),auto:true});
  touch(dk);
  setTimeout(function(){try{toast("„"+(w.name||"Training")+"“ war nicht beendet – nachträglich gespeichert");}catch(e){}},1800);
}
function validWorkout(w){
  if(!w||typeof w!=="object"||!Array.isArray(w.exercises)||!w.startedAt)return null;
  // Aelter als 12 h: offensichtlich vergessen zu beenden. Frueher wurde es dann still verworfen -
  // die abgehakten Saetze blieben zwar erhalten, aber das Training selbst (Dauer, Uebungen,
  // Volumen) fehlte im Tag. Jetzt wird es nachtraeglich als beendet eingetragen.
  if(Date.now()-w.startedAt>12*3600*1000){try{autoCloseWorkout(w);}catch(e){}return null;}
  if(!w.rest)w.rest={endAt:0,len:90};if(w.pausedMs==null)w.pausedMs=0;if(!w.id)w.id=rid();if(!w.name)w.name="Training";
  // Zwei gueltige Formen: Kraftuebung (sets-Array) und Ausdauer (cardioRec). Frueher wurde
  // hier nur auf sets geprueft - jede Ausdauer-Einheit fiel dadurch beim Laden aus dem
  // Training heraus und war nach einem Neustart weg.
  w.exercises=w.exercises.filter(function(e){
    return e&&exById(e.ex)&&(Array.isArray(e.sets)||(e.cardioRec&&typeof e.cardioRec==="object"));});
  relinkCardio(w);
  return w;
}
loadLocal();try{var lw=localStorage.getItem("formwert-workout");if(lw)workout=validWorkout(JSON.parse(lw));}catch(e){workout=null;}
/* Erst starten, wenn das ganze Skript durchgelaufen ist. Die Nachschlagetabellen des
   3D-Modells (FW3D_MESH2FINE, FW3D_FORCE_TRANSPARENT_GROUPS) werden weiter unten
   zugewiesen; wurde hier schon gerendert, liefen die Figuren des Heute-Tabs in ein noch
   undefiniertes Nachschlagewerk und blieben leer. Sichtbar wurde das nur, wenn fuer heute
   bereits Saetze eingetragen waren - deshalb ist es lange nicht aufgefallen. */
// Name der eigenen Uebung -> ID der jetzt eingebauten Entsprechung. Nur exakte Namens-
// treffer, damit nichts Falsches zusammengelegt wird.
var LEGACY_EX_MERGE={"Rotierende Torso Maschine":"torso_rot","Einbeiniges Balancieren":"balance_sl"};
function mergeDuplicateCustomEx(){
  var changed=false;
  (state.customEx||[]).slice().forEach(function(ce){
    var newId=LEGACY_EX_MERGE[ce.n];
    if(!newId||ce.id===newId||!exById(newId))return;
    var oldId=ce.id;
    for(var d in state.days){
      var dd=state.days[d],touched=false;
      (dd.sets||[]).forEach(function(s){if(s.ex===oldId){s.ex=newId;touched=true;}});
      (dd.cardio||[]).forEach(function(c){if(c.ex===oldId){c.ex=newId;touched=true;}});
      if(touched){state.dirty[d]=true;changed=true;}
    }
    for(var rid2 in state.routines){
      var r=state.routines[rid2],touched2=false;
      (r.items||[]).forEach(function(it){if(it.ex===oldId){it.ex=newId;touched2=true;}});
      if(touched2){state.dirtyRoutines[rid2]=true;changed=true;}
    }
    if(workout&&Array.isArray(workout.exercises)){
      var touched3=false;
      workout.exercises.forEach(function(we){if(we.ex===oldId){we.ex=newId;touched3=true;}});
      if(touched3){changed=true;saveWorkout();}
    }
    state.customEx=state.customEx.filter(function(x){return x.id!==oldId;});
    for(var i=EX.length-1;i>=0;i--)if(EX[i].id===oldId)EX.splice(i,1);
    if(EX_BY_ID)delete EX_BY_ID[oldId];
    changed=true;
  });
  if(changed)saveLocal();
  return changed;
}
// Einmalige Migration fuer built-in Uebungen, die zu einer anderen zusammengelegt wurden (anders
// als mergeDuplicateCustomEx oben geht es hier NICHT um eigene Uebungen, sondern um eine fest
// eingebaute Uebung, die es unter ihrer alten ID nicht mehr gibt - "Klimmzüge mit Zusatzgewicht"
// (pullup_weight) ist seit der Zusammenlegung Teil von "pullup" mit optionalem Zusatzgewicht-Feld.
// Die Feldstruktur (kg+reps) ist identisch, es muss also nur der ex-Bezug umbenannt werden - schon
// geloggte Saetze bleiben dadurch erhalten statt beim naechsten Laden ins Leere zu zeigen.
var LEGACY_BUILTIN_MERGE={"pullup_weight":"pullup"};
function mergeLegacyBuiltinEx(){
  var changed=false;
  for(var oldId in LEGACY_BUILTIN_MERGE){
    var newId=LEGACY_BUILTIN_MERGE[oldId];
    for(var d in state.days){
      var dd=state.days[d];
      (dd.sets||[]).forEach(function(s){if(s.ex===oldId){s.ex=newId;state.dirty[d]=true;changed=true;}});
    }
    for(var rid3 in state.routines){
      var r=state.routines[rid3];
      (r.items||[]).forEach(function(it){if(it.ex===oldId){it.ex=newId;state.dirtyRoutines[rid3]=true;changed=true;}});
    }
    if(workout&&Array.isArray(workout.exercises)){
      var touched4=false;
      workout.exercises.forEach(function(we){if(we.ex===oldId){we.ex=newId;touched4=true;}});
      if(touched4){changed=true;saveWorkout();}
    }
  }
  if(changed)saveLocal();
  return changed;
}
/* Wird genau einmal wirksam: entweder die App zeigen (Profil vorhanden) oder die
   Einrichtung starten (wirklich keins vorhanden - weder hier noch in der Cloud). */
var bootSettled=false;
function fwBootReady(){
  if(bootSettled)return;
  bootSettled=true;
  var bw=$("bootwait");if(bw)bw.hidden=true;
  document.body.style.overflow="";
  if(state.profile&&state.profile.version>=3)renderAll();
  else startOnboarding(state.profile&&state.profile.version>=2?state.profile:null);
}
function fwBoot(){
  selectTab("tab-heute");
  mergeDuplicateCustomEx();
  mergeLegacyBuiltinEx();
  // Liegt hier schon ein Profil, geht es sofort weiter - kein Warten, kein Flackern.
  if(state.profile&&state.profile.version>=3){fwBootReady();return;}
  // Sonst: nicht sofort nach den Eckdaten fragen. Erst muss feststehen, ob in der
  // Cloud eins liegt. connect() meldet sich; die Notbremse greift, falls gar nichts
  // antwortet (kein Netz, Capability nicht verfuegbar, haengende Verbindung).
  var bw=$("bootwait");if(bw)bw.hidden=false;
  document.body.style.overflow="hidden";
  setTimeout(fwBootReady,12000);
}
setSync("","nur dieses Gerät");
var connectTries=0;
function connect(){
  if(!window.claude||!window.claude.use){setSync("off","nur dieses Gerät");fwBootReady();return;}
  window.claude.use("db").then(function(d){
    if(!d){setSync("off","nur dieses Gerät");fwBootReady();return;}
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
      var sd=s.exists?cloneWritable(s.data()):null;
      if(sd&&sd.version>=3&&!state.profile)state.profile=sd;
      // Ab hier steht fest, ob es ein gespeichertes Profil gibt - der Startbildschirm
      // darf weg. Tage und Einheiten kommen gleich danach und rendern nochmal.
      fwBootReady();
      return fwLoadDays(d);
    }).then(function(qs){
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(!b)return;
        // Lokal geändert, aber noch nicht übertragen (z. B. offline): Der Cloud-Stand ist älter
        // und darf den Tag nicht überschreiben. persist() weiter unten lädt ihn hoch.
        if(state.dirty[doc.id])return;
        if(doc.id===TODAY&&state.days[TODAY]&&(state.days[TODAY].sets||[]).length)return;
        state.days[doc.id]={sets:b.sets||[],cardio:b.cardio||[],workouts:b.workouts||[],mobility:!!b.mobility,rest:!!b.rest,note:b.note||""};localTouchDay(doc.id);});
      return d.doc("state/workout").get().then(function(ws){if(ws.exists&&!workout){workout=validWorkout(cloneWritable(ws.data()));if(!workout)d.doc("state/workout").delete().catch(function(){});else{try{refreshWorkoutSuggestions();}catch(e){}secDirty.training=true;if(tab==="tab-training")renderSession();renderBanner();}}}).catch(function(){}).then(function(){return fw_syncPullExtras(d);}).then(function(){return d.collection("routines").limit(100).get();});
    }).then(function(qs){
      if(qs&&qs.docs)qs.docs.forEach(function(doc){var b=cloneWritable(doc.data());if(b&&b.id&&!state.dirtyRoutines[b.id])state.routines[b.id]=b;});
      mergeDuplicateCustomEx();
      mergeLegacyBuiltinEx();
      if(state.profile&&state.profile.version>=3)renderAll();persist();
      connectTries=0;setSync("on","synchronisiert");
    }).catch(function(){
      // Ein einzelner Netzwerk-Hänger (z. B. direkt beim App-Start, wenn parallel schon ein
      // Training gestartet wird) sollte die Sync-Anzeige nicht für immer auf "gestört" einfrieren:
      // ein paar Mal zügig erneut versuchen, danach im Hintergrund weiter alle 30 s, damit sich
      // die Verbindung von selbst erholt, sobald das Netz wieder mitspielt.
      connectTries++;
      if(connectTries<=3)setTimeout(connect,Math.min(1500*connectTries,6000));
      else{setSync("off","Sync gestört – lokal gespeichert");setTimeout(connect,30000);}
      // Nach einem Fehlversuch nicht ewig auf dem Startbildschirm stehen bleiben:
      // beim ersten Versuch noch kurz weiterwarten, danach freigeben.
      if(connectTries>1)fwBootReady();
    });
  }).catch(function(){setSync("off","nur dieses Gerät");fwBootReady();});
}
/* FW3D_HTML_B64: ausgelagert nach assets/3d-viewer.js */
var FW3D_MESH2FINE={"(Abdominal part of pectoralis major muscle)":"abdominal_part_of_pectoralis_major","(Adductor minimus)":"adductor_minimus","(Opponens digiti minimi muscle of foot)":"opponens_digiti_minimi_of_foot","Abductor digiti minimi of foot":"abductor_digiti_minimi_of_foot","Abductor digiti minimi of hand":"abductor_digiti_minimi_of_hand","Abductor hallucis":"abductor_hallucis","Abductor pollicis brevis":"abductor_pollicis_brevis","Abductor pollicis longus":"abductor_pollicis_longus","Acromial part of deltoid muscle":"acromial_part_of_deltoid","Adductor brevis":"adductor_brevis","Adductor longus":"adductor_longus","Adductor magnus":"adductor_magnus","Anconeus muscle":"anconeus","Anterior belly of digastric muscle":"anterior_belly_of_digastric","Ary-epiglottic part of oblique arytenoid muscle":"ary_epiglottic_part_of_oblique_arytenoid","Ascending part of trapezius muscle":"ascending_part_of_trapezius","Brachialis muscle":"brachialis","Brachioradialis muscle":"brachioradialis","Calcaneal tendon":"calcaneal_tendon","Clavicular head of pectoralis major muscle":"clavicular_head_of_pectoralis_major","Clavicular part of deltoid muscle":"clavicular_part_of_deltoid","Coccygeus muscle":"coccygeus","Common tendinous ring":"common_tendinous_ring","Coracobrachialis muscle":"coracobrachialis","Deep head of flexor pollicis brevis":"deep_head_of_flexor_pollicis_brevis","Deep head of pronator teres":"deep_head_of_pronator_teres","Descending part of trapezius muscle":"descending_part_of_trapezius","Diaphragm":"diaphragm","Dorsal interossei muscles of foot":"dorsal_interossei_of_foot","Dorsal interossei muscles of hand":"dorsal_interossei_of_hand","Dorsal parts of lateral intertransversarii lumborum muscles":"dorsal_parts_of_lateral_intertransversarii_lumborum","Extensor carpi radialis brevis":"extensor_carpi_radialis_brevis","Extensor carpi radialis longus":"extensor_carpi_radialis_longus","Extensor digiti minimi":"extensor_digiti_minimi","Extensor digitorum":"extensor_digitorum","Extensor digitorum brevis":"extensor_digitorum_brevis","Extensor digitorum longus":"extensor_digitorum_longus","Extensor hallucis brevis":"extensor_hallucis_brevis","Extensor hallucis longus":"extensor_hallucis_longus","Extensor indicis":"extensor_indicis","Extensor pollicis brevis":"extensor_pollicis_brevis","Extensor pollicis longus":"extensor_pollicis_longus","External abdominal oblique muscle":"external_abdominal_oblique","External intercostal muscles":"external_intercostal","External part of thyro-arytenoid muscle":"external_part_of_thyro_arytenoid","Fibularis brevis muscle":"fibularis_brevis","Fibularis longus muscle":"fibularis_longus","Fibularis tertius muscle":"fibularis_tertius","Flexor carpi radialis":"flexor_carpi_radialis","Flexor digiti minimi of foot":"flexor_digiti_minimi_of_foot","Flexor digiti minimi of hand":"flexor_digiti_minimi_of_hand","Flexor digitorum brevis":"flexor_digitorum_brevis","Flexor digitorum longus":"flexor_digitorum_longus","Flexor digitorum profundus":"flexor_digitorum_profundus","Flexor hallucis longus":"flexor_hallucis_longus","Flexor pollicis longus":"flexor_pollicis_longus","Genioglossus muscle":"genioglossus","Geniohyoid muscle":"geniohyoid","Gluteus maximus muscle":"gluteus_maximus","Gluteus medius muscle":"gluteus_medius","Gluteus minimus muscle":"gluteus_minimus","Gracilis muscle":"gracilis","Humeral head of extensor carpi ulnaris":"humeral_head_of_extensor_carpi_ulnaris","Humeral head of flexor carpi ulnaris":"humeral_head_of_flexor_carpi_ulnaris","Humero-ulnar head of flexor digitorum superficialis":"humero_ulnar_head_of_flexor_digitorum_superficialis","Hyoglossus muscle":"hyoglossus","Iliacus muscle":"iliacus","Iliococcygeus muscle":"iliococcygeus","Iliocostalis colli muscle":"iliocostalis_colli","Iliocostalis lumborum muscle":"iliocostalis_lumborum","Iliocostalis thoracis muscle":"iliocostalis_thoracis","Iliopectineal arch":"iliopectineal_arch","Iliotibial tract":"iliotibial_tract","Inferior gemellus muscle":"inferior_gemellus","Inferior pharyngeal constrictor":"inferior_pharyngeal_constrictor","Inferior tarsus":"inferior_tarsus","Infraspinatus muscle":"infraspinatus","Innermost intercostal muscles":"innermost_intercostal","Intermediate tendon of digastric muscle":"intermediate_tendon_of_digastric","Internal abdominal oblique muscle":"internal_abdominal_oblique","Internal intercostal muscles":"internal_intercostal","Lateral crico-arytenoid muscle":"lateral_crico_arytenoid","Lateral head of flexor hallucis brevis":"lateral_head_of_flexor_hallucis_brevis","Lateral head of gastrocnemius":"lateral_head_of_gastrocnemius","Lateral head of triceps brachii":"lateral_head_of_triceps_brachii","Latissimus dorsi muscle":"latissimus_dorsi","Levator scapulae":"levator_scapulae","Levatores breves costarum":"levatores_breves_costarum","Levatores longi costarum":"levatores_longi_costarum","Linea alba":"linea_alba","Long head of biceps brachii":"long_head_of_biceps_brachii","Long head of biceps femoris":"long_head_of_biceps_femoris","Long head of triceps brachii":"long_head_of_triceps_brachii","Longissimus capitis muscle":"longissimus_capitis","Longissimus colli muscle":"longissimus_colli","Longissimus thoracis muscle":"longissimus_thoracis","Longus capitis muscle":"longus_capitis","Longus colli muscle":"longus_colli","Lumbrical muscles of foot":"lumbrical_of_foot","Lumbrical muscles of hand":"lumbrical_of_hand","Medial head of flexor hallucis brevis":"medial_head_of_flexor_hallucis_brevis","Medial head of gastrocnemius":"medial_head_of_gastrocnemius","Medial head of triceps brachii":"medial_head_of_triceps_brachii","Middle pharyngeal constrictor":"middle_pharyngeal_constrictor","Multifidus colli muscle":"multifidus_colli","Multifidus lumborum muscle":"multifidus_lumborum","Multifidus thoracis muscle":"multifidus_thoracis","Mylohyoid muscle":"mylohyoid","Oblique head of adductor hallucis":"oblique_head_of_adductor_hallucis","Oblique head of adductor pollicis":"oblique_head_of_adductor_pollicis","Oblique part of cricothyroid muscle":"oblique_part_of_cricothyroid","Obliquus inferior capitis muscle":"obliquus_inferior_capitis","Obliquus superior capitis muscle":"obliquus_superior_capitis","Obturator externus":"obturator_externus","Obturator internus":"obturator_internus","Omohyoid muscle":"omohyoid","Opponens digiti minimi muscle of hand":"opponens_digiti_minimi_of_hand","Opponens pollicis muscle":"opponens_pollicis","Palatopharyngeus muscle":"palatopharyngeus","Palmar interossei muscles":"palmar_interossei","Palmaris longus muscle":"palmaris_longus","Pectineus muscle":"pectineus","Pectoralis minor muscle":"pectoralis_minor","Piriformis muscle":"piriformis","Plantar interossei muscles":"plantar_interossei","Plantaris muscle":"plantaris","Popliteus muscle":"popliteus","Posterior belly of digastric muscle":"posterior_belly_of_digastric","Posterior crico-arytenoid muscle":"posterior_crico_arytenoid","Pronator quadratus":"pronator_quadratus","Psoas major":"psoas_major","Pyramidalis muscle":"pyramidalis","Quadratus femoris muscle":"quadratus_femoris","Quadratus lumborum muscle":"quadratus_lumborum","Quadratus plantae muscle":"quadratus_plantae","Radial head of flexor digitorum superficialis":"radial_head_of_flexor_digitorum_superficialis","Rectus abdominis muscle":"rectus_abdominis","Rectus anterior capitis muscle":"rectus_anterior_capitis","Rectus femoris muscle":"rectus_femoris","Rectus lateralis capitis muscle":"rectus_lateralis_capitis","Rectus posterior major capitis muscle":"rectus_posterior_major_capitis","Rectus posterior minor capitis muscle":"rectus_posterior_minor_capitis","Rhomboid major muscle":"rhomboid_major","Rhomboid minor muscle":"rhomboid_minor","Rotatores":"rotatores","Sartorius muscle":"sartorius","Scalenus anterior muscle":"scalenus_anterior","Scalenus medius muscle":"scalenus_medius","Scalenus posterior muscle":"scalenus_posterior","Scapular spinal part of deltoid muscle":"scapular_spinal_part_of_deltoid","Semimembranosus muscle":"semimembranosus","Semitendinosus muscle":"semitendinosus","Serratus anterior muscle":"serratus_anterior","Serratus posterior inferior muscle":"serratus_posterior_inferior","Serratus posterior superior muscle":"serratus_posterior_superior","Short head of biceps brachii":"short_head_of_biceps_brachii","Short head of biceps femoris":"short_head_of_biceps_femoris","Soleus muscle":"soleus","Splenius capitis muscle":"splenius_capitis","Splenius colli muscle":"splenius_colli","Sternocleidomastoid muscle":"sternocleidomastoid","Sternocostal head of pectoralis major muscle":"sternocostal_head_of_pectoralis_major","Sternohyoid muscle":"sternohyoid","Sternothyroid muscle":"sternothyroid","Straight part of cricothyroid muscle":"straight_part_of_cricothyroid","Stylohyoid muscle":"stylohyoid","Stylopharyngeus muscle":"stylopharyngeus","Subclavius muscle":"subclavius","Subscapularis muscle":"subscapularis","Superficial head of flexor pollicis brevis":"superficial_head_of_flexor_pollicis_brevis","Superficial head of pronator teres":"superficial_head_of_pronator_teres","Superior gemellus muscle":"superior_gemellus","Superior pharyngeal constrictor":"superior_pharyngeal_constrictor","Superior tarsus":"superior_tarsus","Supraspinatus muscle":"supraspinatus","Tendinous arch of levator ani":"tendinous_arch_of_levator_ani","Tendon of extensor digitorum longus":"tendon_of_extensor_digitorum_longus","Teres major muscle":"teres_major","Teres minor muscle":"teres_minor","Thyro-epiglottic part of thyro-arytenoid muscle":"thyro_epiglottic_part_of_thyro_arytenoid","Thyrohyoid muscle":"thyrohyoid","Tibialis anterior muscle":"tibialis_anterior","Tibialis posterior muscle":"tibialis_posterior","Transverse arytenoid muscle":"transverse_arytenoid","Transverse head of adductor hallucis":"transverse_head_of_adductor_hallucis","Transverse head of adductor pollicis":"transverse_head_of_adductor_pollicis","Transverse part of trapezius muscle":"transverse_part_of_trapezius","Transversus abdominis muscle":"transversus_abdominis","Transversus thoracis muscle":"transversus_thoracis","Trochlea of superior oblique muscle":"trochlea_of_superior_oblique","Ulnar head of extensor carpi ulnaris":"ulnar_head_of_extensor_carpi_ulnaris","Ulnar head of flexor carpi ulnaris":"ulnar_head_of_flexor_carpi_ulnaris","Vastus intermedius muscle":"vastus_intermedius","Vastus lateralis muscle":"vastus_lateralis","Vastus medialis muscle":"vastus_medialis","Ventral parts of lateral intertransversarii lumborum muscles":"ventral_parts_of_lateral_intertransversarii_lumborum",};
var FW3D_MESH2GROUP={};  // alle 233 Muskeln haben jetzt eine eigene FINE/FW3D_MESH2FINE-Zuordnung, daher kein Gruppen-Fallback mehr noetig.
var FW3D_DUAL={};
/* Brust und Schulter liegen obenauf - dort soll nie etwas durchsichtig werden. */
/* Muskeln, die ohnehin ganz aussen liegen. Fuer sie wird nichts durchsichtig gemacht -
   das Freilegen wuerde nur die Umgebung ausduennen, ohne dass man den Muskel dadurch
   besser saehe. Der Bizeps gehoert dazu: er liegt direkt unter der Haut. */
/* Blickwinkel je Muskelgruppe. Frontal ist nicht fuer jeden Muskel die beste Ansicht: eine
   gewoelbte Flaeche wie die Brust zeigt von vorn nur ihre Silhouette, der Saegemuskel liegt
   seitlich, der Latissimus faechert zur Seite auf. yaw dreht das Modell zusaetzlich (Grad),
   pitch hebt die Kamera an (positiv = Blick von leicht oben). Ohne Eintrag bleibt es bei der
   bisherigen, rein geometrischen Ausrichtung. */
// Leichte Schraege in Grad - eine Zahl, damit alle betroffenen Gruppen zusammen bleiben.
var MIN_TILT=14;
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
};
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
var fw3dReady=false, fw3dFrameCreated=false;
function fw3dEnsureFrame(){
  if(fw3dFrameCreated)return;
  fw3dFrameCreated=true;
  var frame=$("body3d-frame");
  if(!frame)return;
  fw3dHtml().then(function(htmlTxt){frame.srcdoc=htmlTxt;frame.hidden=false;})
    .catch(function(){var ld=$("body3d-loading");if(ld)ld.textContent="3D-Modell konnte nicht geladen werden.";fw3dFrameCreated=false;});
}
// Manche Feinmuskeln haben im 3D-Modell keine eigene Mesh (z. B. Tensor fasciae latae – im
// Scan nicht als separater Körper vorhanden). Damit sie beim Anklicken trotzdem sichtbar rot
// markiert werden und die Kamera dorthin schwenkt, wird beim Anwählen zusätzlich die Mesh eines
// anatomisch benachbarten Muskels aus derselben Gruppe markiert (TFL -> mittlerer Gesäßmuskel,
// direkt angrenzend an der seitlichen Hüfte).
var FW3D_FINE_PROXY={tfl:"gluteus_medius"};
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
};
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
};
