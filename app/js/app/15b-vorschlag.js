/* ==========================================================
   app/15b-vorschlag.js - Zielwerte vorschlagen (Fahrplan Phase 2)
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).

   Idee: Fuer jeden Satz den naechsten kleinen Schritt vorschlagen - auf Basis dessen,
   was man bei dieser Uebung zuletzt geschafft hat. Grundregel ist die "doppelte
   Progression" (erst Wiederholungen bis zur Obergrenze, dann Gewicht rauf und wieder
   unten anfangen). Darueber lernt die App aus dem eigenen Verlauf:
   - wie stark man von Satz zu Satz nachlaesst (Ermuedung),
   - wie schnell man sich bei dieser Uebung steigert (Tempo),
   - wie verlaesslich die angegebene Reserve ist,
   - ob man feststeckt oder laenger pausiert hat.
   Alles laeuft lokal, ohne Server, und jeder Vorschlag hat eine kurze Begruendung.
   ========================================================== */
"use strict";

/* ---- Einstellungen ---- */
function sugEnabled(){return !(state.profile&&state.profile.suggest===false);}
function sugDefaultRange(ex){
  if(ex.t==="sec")return [20,45];
  if(ex.pat==="iso")return [10,15];
  return [8,12];
}
function sugRange(ex){
  var r=state.profile&&state.profile.repRange&&state.profile.repRange[ex.id];
  if(r&&r.length===2&&r[0]>0&&r[1]>=r[0])return [r[0],r[1]];
  return sugDefaultRange(ex);
}
function setSugRange(ex,lo,hi){
  if(!state.profile.repRange)state.profile.repRange={};
  var d=sugDefaultRange(ex);
  if(lo===d[0]&&hi===d[1])delete state.profile.repRange[ex.id];
  else state.profile.repRange[ex.id]=[lo,hi];
  persist();
}
/* Gewichtssprung je Ausruestung (Rohgewicht, also bei "pro Seite" je Seite). */
function sugStep(ex){
  var e=String(ex.e||"");
  if(e==="Kurzhantel")return 2;
  if(e==="Maschine")return 5;
  if(e==="Kettlebell")return 4;
  return 2.5;
}
function sugRound(kg,step){var v=Math.round(kg/step)*step;return Math.max(0,Math.round(v*100)/100);}

/* ---- Verlauf einer Uebung: Einheiten (neueste zuerst), je Einheit die Saetze in Reihenfolge ---- */
function sugHistory(exid,skipWid){
  var out=[],keys=Object.keys(state.days).sort().reverse();
  for(var i=0;i<keys.length&&out.length<400;i++){
    var k=keys[i],sets=(state.days[k].sets||[]).filter(function(s){return s.ex===exid&&!(skipWid&&s.wid===skipWid);});
    if(!sets.length)continue;
    // Innerhalb eines Tages nach Training trennen (zwei Einheiten am selben Tag = zwei Eintraege).
    var byW={},order=[];
    sets.forEach(function(s){var w=s.wid||"_";if(!byW[w]){byW[w]=[];order.push(w);}byW[w].push(s);});
    order.map(function(w){var l=byW[w].slice().sort(function(a,b){return (a.ts||0)-(b.ts||0);});return {day:k,sets:l,t:l[l.length-1].ts||0};})
      .sort(function(a,b){return b.t-a.t;}).forEach(function(x){out.push(x);});
  }
  return out;
}
function sugReps(ex,s){return ex.uni&&s.repsL!=null&&s.repsR!=null?Math.min(s.repsL,s.repsR):(s.reps||0);}

/* ---- Gelerntes aus dem Verlauf ----
   Betrachtet den GESAMTEN Verlauf der Uebung. Juengere Einheiten zaehlen staerker (Gewicht
   halbiert sich alle 6 Einheiten), aeltere fliessen aber immer mit ein - so bestimmt dein ganzer
   Verlauf das Tempo, und ein einzelner Ausreisser kippt den Vorschlag nicht. */
function sugWMean(vals){ // vals: [{v,age}] age=0 fuer die juengste Einheit
  var sw=0,sv=0;vals.forEach(function(x){var w=Math.pow(0.5,x.age/6);sw+=w;sv+=w*x.v;});
  return sw>0?sv/sw:null;
}
function sugLearn(ex,hist){
  var L={fatigue:1,rirBias:0,rate:0,sessions:hist.length};
  // Ermuedung: durchschnittlicher Verlust an Wiederholungen je weiterem Satz bei gleichem Gewicht.
  var drops=[];
  hist.forEach(function(h,age){
    for(var i=1;i<h.sets.length;i++){
      if((h.sets[i].kg||0)===(h.sets[0].kg||0))drops.push({v:(sugReps(ex,h.sets[0])-sugReps(ex,h.sets[i]))/i,age:age});
    }
  });
  if(drops.length>=3){var m=sugWMean(drops);L.fatigue=Math.max(0,Math.min(3,m));}
  else L.fatigue=ex.pat==="iso"?1:0.7;
  // Reserve-Verlaesslichkeit: Wer "2 in Reserve" angibt und beim naechsten Mal mit demselben
  // Gewicht deutlich mehr schafft, schaetzt sich vorsichtig ein (positiver Wert).
  var bias=[];
  for(var j=1;j<hist.length;j++){
    var prev=hist[j].sets[0],next=hist[j-1].sets[0];
    if(prev&&next&&prev.rir!=null&&(prev.kg||0)===(next.kg||0)){
      bias.push({v:(sugReps(ex,next)-sugReps(ex,prev))-prev.rir,age:j-1});
    }
  }
  if(bias.length>=2)L.rirBias=sugWMean(bias);
  // Tempo: Anstieg des besten Satzes (geschaetztes Maximum bzw. Wdh.) pro Woche.
  var pts=hist.map(function(h){
    var best=0;h.sets.forEach(function(s){var v=setValue(ex,s);if(v>best)best=v;});
    return {t:parseIso(h.day).getTime()/864e5/7,v:best};
  }).reverse();
  if(pts.length>=3){
    var n=pts.length,mx=0,my=0;pts.forEach(function(p){mx+=p.t;my+=p.v;});mx/=n;my/=n;
    var num=0,den=0;pts.forEach(function(p){num+=(p.t-mx)*(p.v-my);den+=(p.t-mx)*(p.t-mx);});
    L.rate=den>0?num/den:0;
    L.rateRel=my>0?L.rate/my:0;
  }
  // Tempo in Wiederholungen: um wie viel wuchs die Wdh.-Zahl je Satz von Einheit zu Einheit
  // bei gleichem Gewicht? (Gewichtswechsel werden uebersprungen.)
  var gains=[];
  for(var g=1;g<hist.length;g++){
    var nw=hist[g-1].sets,od=hist[g].sets;
    if(ex.t==="load"&&(nw[0].kg||0)!==(od[0].kg||0))continue;
    if(daysBetween(hist[g].day,hist[g-1].day)>28)continue;
    var m2=Math.min(nw.length,od.length);if(!m2)continue;
    var sum=0;for(var j2=0;j2<m2;j2++)sum+=sugReps(ex,nw[j2])-sugReps(ex,od[j2]);
    gains.push({v:(sum/m2)/(Math.max(2,daysBetween(hist[g].day,hist[g-1].day))/7),age:g-1});   // je Woche
  }
  // Kraft-Tempo: relative Veraenderung des geschaetzten Einer-Maximums (bester Satz) von Einheit
  // zu Einheit - zaehlt auch, wenn das Gewicht gewechselt hat. Lange Pausen (>21 Tage) zaehlen nicht.
  L.eRate=null;
  if(ex.t==="load"){
    var er=[];
    // Alle Einheitenpaare des Verlaufs; Pausen ueber 4 Wochen zaehlen nicht (Wiedereinstieg
    // verfaelscht das Tempo), einzelne Spruenge werden auf +-15 % begrenzt.
    for(var e=1;e<hist.length;e++){
      var bn=0,bo=0;
      hist[e-1].sets.forEach(function(x){bn=Math.max(bn,setValue(ex,x));});
      hist[e].sets.forEach(function(x){bo=Math.max(bo,setValue(ex,x));});
      var dd=daysBetween(hist[e].day,hist[e-1].day);
      if(bn>0&&bo>0&&dd<=28)er.push({v:Math.max(-0.15,Math.min(0.15,bn/bo-1))/(Math.max(2,dd)/7),age:e-1});   // je Woche
    }
    if(er.length)L.eRate=sugWMean(er);
    L.eRateN=er.length;
  }
  L.gain=0;L.gainN=gains.length;
  if(gains.length>=2){
    // Gewichteter Schnitt ueber ALLE Einheiten - Rueckschritte zaehlen mit, damit das Tempo
    // nicht geschoent wird. Ist der Schnitt nicht positiv, bleibt es beim kleinsten Schritt.
    // Tempo je Woche, umgerechnet auf den Abstand seit der letzten Einheit (2-21 Tage).
    var avg=sugWMean(gains),st=ex.t==="sec"?5:1;
    L.gainWeek=avg;L.gainDays=Math.min(21,Math.max(2,daysBetween(hist[0].day,TODAY)));
    var avgS=avg*L.gainDays/7;
    if(avgS>0)L.gain=Math.max(st,Math.min(3*st,Math.round(avgS/st)*st));
  }
  return L;
}

/* ---- Vorschlag fuer eine Uebung ----
   nSets: wie viele Saetze geplant sind. Ergebnis: {sets:[{kg,reps}], why:"..."} oder null. */
function suggestFor(ex,nSets,skipWid){
  if(!ex||ex.t==="cardio")return null;
  var hist=sugHistory(ex.id,skipWid);if(!hist.length)return null;
  var last=hist[0],L=sugLearn(ex,hist),range=sugRange(ex),lo=range[0],hi=range[1];
  var isLoad=ex.t==="load",step=sugStep(ex),unit=ex.t==="sec"?" s":"";
  var repStep=ex.t==="sec"?5:1;
  var lastSets=last.sets,W=0;
  // Arbeitsgewicht = das schwerste Gewicht mit mindestens zwei Saetzen, sonst das schwerste
  // ueberhaupt. So zaehlen Aufwaermsaetze (leichter, oft zahlreicher) nicht als Arbeitssaetze.
  if(isLoad){
    var cnt={},heavy=0;
    lastSets.forEach(function(s){var k=+(s.kg||0);if(!isFinite(k))k=0;cnt[k]=(cnt[k]||0)+1;if(k>heavy)heavy=k;});
    W=heavy;var best2=-1;for(var k in cnt){if(cnt[k]>=2&&+k>best2)best2=+k;}
    if(best2>0)W=best2;
    // Nur 0 kg im Verlauf (z. B. Uebung frueher ohne Gewicht gefuehrt): kein Gewicht vorschlagen.
    if(!(W>0))return null;
  }
  var work=lastSets.filter(function(s){return !isLoad||(s.kg||0)===W;});
  var repsLast=work.map(function(s){return sugReps(ex,s);});
  var minR=Math.min.apply(null,repsLast),rirs=work.map(function(s){return s.rir;}).filter(function(v){return v!=null;});
  var avgRir=rirs.length?rirs.reduce(function(a,b){return a+b;},0)/rirs.length:null;
  // Reserve um die gelernte Verzerrung korrigieren (wer sich unterschaetzt, hat mehr Luft).
  var effRir=avgRir!=null?avgRir+Math.max(-1,Math.min(2,L.rirBias)):null;
  var daysOff=daysBetween(last.day,TODAY);
  // Festgefahren: die letzten zwei Einheiten mit diesem Gewicht jeweils unter der Untergrenze.
  var stuck=false;
  // Nur bei Gewichtsuebungen: ohne Gewicht gibt es nichts "leichter" zu machen - dort gilt die
  // normale Steigerung ab dem eigenen letzten Stand.
  // Zusaetzlich muss der Fortschritt stehen: bester Satz in drei Einheiten nicht besser geworden.
  if(isLoad&&hist.length>=3&&(function(){
      var b=hist.slice(0,3).map(function(h){var m=0;h.sets.forEach(function(x){if((x.kg||0)===W)m=Math.max(m,sugReps(ex,x));});return m;});
      return b[0]<=b[1]&&b[1]<=b[2];})()){
    stuck=hist.slice(0,2).every(function(h){
      var ws=h.sets.filter(function(s){return !isLoad||(s.kg||0)===W;});
      // Festgefahren heisst: schon der BESTE Satz lag unter der Untergrenze. Ein letzter Satz,
      // der muede unter die Grenze faellt, ist normal und kein Grund, leichter zu werden.
      return ws.length&&Math.max.apply(null,ws.map(function(s){return sugReps(ex,s);}))<lo;
    });
  }
  var baseW=W,firstReps,why,limitStep=false,perSet=null;
  if(daysOff>=14){
    // Laengere Pause: einen Schritt zurueck, damit der Wiedereinstieg sauber gelingt.
    var r0=repsLast[0]||minR;
    if(isLoad&&W>step){baseW=sugRound(W-step,step);firstReps=Math.min(hi,r0);}
    else if(isLoad)firstReps=Math.max(1,r0-1);
    else firstReps=Math.max(ex.t==="sec"?5:1,r0-repStep);
    why="Etwas leichter – letzte Einheit vor "+daysOff+" Tagen";
  }else if(stuck){
    if(isLoad&&W>step){baseW=sugRound(W*0.9,step);if(baseW>=W)baseW=sugRound(W-step,step);firstReps=lo+Math.round((hi-lo)/2);}
    else firstReps=Math.max(1,minR);
    why="Zweimal unter "+lo+unit+" – kurz leichter, dann neu anlaufen";
  }else if(minR>=hi){
    // Obergrenze in allen Saetzen geschafft -> Gewicht rauf (bzw. Wdh./Sek. weiter steigern).
    if(isLoad){
      var jumps=1;
      if(effRir!=null&&effRir>=3&&(L.rateRel||0)>=0)jumps=2;   // klar zu leicht und im Aufwaertstrend
      baseW=sugRound(W+step*jumps,step);firstReps=lo;
      why="+"+fmtNum(baseW-W)+" kg – letztes Mal alle Sätze mit "+hi+" Wdh. geschafft";
    }else{
      firstReps=minR+repStep;
      why="+"+repStep+(ex.t==="sec"?" s":" Wdh.")+" – Obergrenze erreicht, weiter steigern";
    }
  }else{
    /* Normalfall: gleiches Gewicht, Wiederholungen rauf - Satz fuer Satz geplant.
       1) Rueckschritt aufholen: War ein Satz schlechter als in einer der beiden Einheiten davor
          (gleiches Gewicht), ist mindestens der fruehere Wert das Ziel - aber hoechstens 2 ueber
          dem letzten Mal, damit es realistisch bleibt.
       2) Sonst so viel steigern, wie du dich bei dieser Uebung im Schnitt pro Einheit steigerst
          (gelernt aus dem Verlauf, 1 bis 3 Wdh.; bei viel Reserve eine mehr).
       3) Am Limit (Reserve 0): nur der schwaechste Satz bekommt den kleinsten Schritt. */
    var gain=L.gain>0?L.gain:repStep;
    if(effRir!=null&&effRir>=3)gain+=repStep;
    if(effRir!=null&&effRir<=0)limitStep=true;
    perSet=[];var recovered=[];
    for(var ps=0;ps<nSets;ps++){
      var lastR=repsLast[ps]!=null?repsLast[ps]:null;
      if(lastR==null){
        // Mehr Saetze als beim letzten Mal: vom vorherigen Satz aus mit der gelernten Ermuedung.
        // Mehr Saetze als beim letzten Mal: wird nach der Verteilung vom Vorsatz abgeleitet.
        perSet.push(perSet[ps-1]?{extra:true,last:null,t:0,rec:true}:null);continue;}
      var prevBest=0;
      hist.slice(1,3).forEach(function(h){
        var ws=h.sets.filter(function(x){return !isLoad||(x.kg||0)===W;});
        if(ws[ps])prevBest=Math.max(prevBest,sugReps(ex,ws[ps]));
      });
      var target=lastR;
      if(prevBest>lastR){target=Math.min(prevBest,lastR+2*repStep);recovered.push(ps+1);}
      perSet.push({last:lastR,t:target,rec:target>lastR});
    }
    // Gewichtsuebungen mit bekanntem Kraft-Tempo: Ziel je Satz = geschaetztes Maximum dieses
    // Satzes x (1 + dein Tempo). Daraus die noetigen Wdh. beim Gewicht; waeren das mehr als die
    // Obergrenze, geht stattdessen das Gewicht hoch.
    var rateUsed=null;
    if(isLoad&&L.eRate!=null){
      var gDays=Math.min(21,Math.max(2,daysOff));
      var g=Math.max(0.01,Math.min(0.08,L.eRate*gDays/7));   // Tempo je Woche x Wochen seit letztem Mal
      if(effRir!=null&&effRir<=0)g*=0.75;       // am Limit: etwas zurueckhaltender
      if(effRir!=null&&effRir>=3)g=Math.min(0.1,g+0.02);
      rateUsed=g;
      var effW=function(kg){return effectiveKg(ex,kg);};
      var repsAt=function(kg,E){var best=1,bd=1e9;for(var rr=1;rr<=20;rr++){var d=Math.abs(e1rm(effW(kg),Math.min(rr,15))-E);if(rr>15)d+= (rr-15);if(d<bd){bd=d;best=rr;}}return best;};
      var targetE=perSet.map(function(p){return p&&p.last!=null?e1rm(effW(W),p.last)*(1+g):null;});
      var planW=W,firstNeed=targetE[0]!=null?repsAt(W,targetE[0]):null;
      if(firstNeed!=null&&firstNeed>hi){
        for(var st=1;st<=4;st++){var w2=sugRound(W+step*st,step);planW=w2;if(repsAt(w2,targetE[0])<=hi)break;}
      }
      baseW=planW;
      perSet.forEach(function(p,ix){
        if(!p||p.extra||targetE[ix]==null)return;
        var need=repsAt(planW,targetE[ix]);
        if(planW===W)need=Math.min(need,p.last+3*repStep);        // hoechstens +3 je Satz
        need=Math.max(need,planW===W?p.last:Math.min(lo,need));    // nie schlechter als letztes Mal
        p.t=Math.max(p.t,need);p.rec=true;                          // Ziel steht - keine Extra-Steigerung
      });
      // Nie stillstehen: ergibt das Tempo (z. B. kurz nach der letzten Einheit) keine einzige
      // Wdh. mehr, gibt es mindestens +1 - am Limit nur im schwaechsten Satz, sonst in jedem.
      if(planW===W&&!perSet.some(function(p){return p&&!p.extra&&p.last!=null&&p.t>p.last;})){
        var cand=[];perSet.forEach(function(p,ix){if(p&&!p.extra&&p.last!=null)cand.push(ix);});
        if(effRir!=null&&effRir<=0){if(cand.length){var wk0=cand[0];cand.forEach(function(ix){if(perSet[ix].last<perSet[wk0].last)wk0=ix;});perSet[wk0].t+=repStep;}}
        else cand.forEach(function(ix){perSet[ix].t+=repStep;});
      }
    }
    // Steigerung auf die Saetze verteilen, die nicht schon "aufholen".
    var open=[];perSet.forEach(function(p,ix){if(p&&!p.rec&&!p.extra)open.push(ix);});
    if(limitStep){
      if(!recovered.length&&open.length){var wk=open[0];open.forEach(function(ix){if(perSet[ix].last<perSet[wk].last)wk=ix;});perSet[wk].t+=repStep;}
    }else open.forEach(function(ix){perSet[ix].t+=gain;});
    var fd=Math.max(1,Math.round(L.fatigue*(ex.t==="sec"?3:1)));
    perSet.forEach(function(p,ix){if(p&&p.extra)p.t=Math.max(1,perSet[ix-1].t-fd);});
    if(isLoad)perSet.forEach(function(p){if(p)p.t=Math.min(p.t,hi);});
    firstReps=perSet[0]?perSet[0].t:minR;
    var u=ex.t==="sec"?" s":" Wdh.";
    if(rateUsed!=null){
      var pc=Math.round(rateUsed*100);
      why=(baseW>W?"+"+fmtNum(baseW-W)+" kg":"gleiches Gewicht")+" – Kraft +"+pc+" % (dein Tempo +"+fmtNum(Math.round(L.eRate*1000)/10)+" %/Woche aus "+(L.eRateN+1)+" Einheiten, letztes Mal vor "+daysOff+" T.)"+(effRir!=null&&effRir<=0?" (etwas vorsichtiger, da am Limit)":"");
    }
    else if(recovered.length)why="Satz "+recovered.join(" und ")+" wieder auf dein früheres Niveau"+(limitStep||!open.length?"":", sonst +"+gain+u);
    else if(limitStep)why="+"+repStep+u+" im schwächsten Satz – letztes Mal am Limit";
    else if(L.gain>repStep&&gain===L.gain)why="+"+gain+u+" – dein Schnitt aus "+(L.gainN+1)+" Einheiten, umgerechnet auf "+L.gainDays+" Tage";
    else why="+"+gain+u+(isLoad?" – gleiches Gewicht"+(avgRir!=null?", Reserve "+Math.round(avgRir):""):" gegenüber letztem Mal");
  }
  // Saetze planen: gelernte Ermuedung abziehen, aber nie unter die Untergrenze bzw. 1.
  var sets=[];
  for(var i=0;i<nSets;i++){
    var r=firstReps;
    if(i>0){
      var lr=repsLast[i];
      if(!stuck&&daysOff<14&&minR<hi&&lr!=null){r=Math.min(firstReps,lr+(firstReps-(repsLast[0]||firstReps)));}
      else r=Math.round(firstReps-L.fatigue*i*(ex.t==="sec"?3:1));
    }
    r=Math.max(ex.t==="sec"?5:1,Math.round(r));
    if(isLoad)r=Math.min(r,Math.max(hi,firstReps));
    sets.push({kg:isLoad?baseW:null,reps:r});
  }
  if(perSet){
    for(var q=0;q<nSets;q++){if(perSet[q])sets[q].reps=Math.max(ex.t==="sec"?5:1,perSet[q].t);}
  }
  if(L.sessions>=4&&(L.rateRel||0)>0.01)why+=" · du legst hier zu";
  return {sets:sets,why:why};
}
function fmtNum(v){v=Math.round(v*100)/100;return String(v).replace(".",",");}

/* Vorschlaege in eine Trainings-Uebung eintragen: nur in leere Felder, nie ueber
   bewusst gesetzte Vorgaben aus der Einheit. Markiert mit st.sug, bis man selbst tippt. */
function applySuggestion(we,ex){
  if(!sugEnabled()||!we||!we.sets||!we.sets.length)return;
  var s=suggestFor(ex,we.sets.length,workout&&workout.id);
  if(!s)return;
  we.sugWhy=s.why;
  we.sets.forEach(function(st,i){
    if(st.done)return;
    var p=s.sets[i]||s.sets[s.sets.length-1];
    var used=false;
    if(ex.t==="load"&&st.kg==null&&p.kg!=null){st.kg=p.kg;used=true;}
    // Wiederholungen nur, wenn sie zum Gewicht passen: steht in der Einheit bewusst ein anderes
    // Gewicht, waeren die fuer das Arbeitsgewicht geplanten Wdh. dort nicht sinnvoll.
    var kgOk=ex.t!=="load"||st.kg==null||p.kg==null||+st.kg===+p.kg;
    if(st.reps==null&&p.reps!=null&&kgOk){st.reps=p.reps;used=true;if(ex.uni){st.repsL=p.reps;st.repsR=p.reps;}}
    if(used)st.sug=true;
  });
}

/* Zielbereich einer Uebung aendern (auf der Uebungsseite). */
function sheetSugRange(ex,after){
  var r=sugRange(ex),unit=ex.t==="sec"?"Sekunden":"Wiederholungen";
  openSheet2(function(b){
    b.appendChild(el("h3",null,"Zielbereich"));
    b.appendChild(el("p","note","Die Vorschläge steigern erst die "+unit+" bis zur Obergrenze, dann das Gewicht – und fangen wieder unten an."));
    var g=el("div","grid2");g.style.marginTop="10px";
    var a=numField("von",r[0],ex.t==="sec"?"5":"1",1),z=numField("bis",r[1],ex.t==="sec"?"5":"1",1);
    g.appendChild(a);g.appendChild(z);b.appendChild(g);
    var ok=el("button","btn primary block","Übernehmen");ok.style.marginTop="14px";
    ok.onclick=function(){
      var va=parseFloat(a.input.value),vz=parseFloat(z.input.value);
      var lo=Math.round(isNaN(va)?r[0]:va),hi=Math.round(isNaN(vz)?r[1]:vz);
      if(hi<lo){var t=lo;lo=hi;hi=t;}lo=Math.max(1,lo);hi=Math.max(lo,hi);
      setSugRange(ex,lo,hi);closeSheet2();if(after)after();};
    b.appendChild(ok);
    var d=sugDefaultRange(ex);
    var rs=el("button","btn ghost block","Standard ("+d[0]+"–"+d[1]+")");rs.style.marginTop="8px";
    rs.onclick=function(){setSugRange(ex,d[0],d[1]);closeSheet2();if(after)after();};
    b.appendChild(rs);
  });
}

/* Regeln verbessert? Dann in einem laufenden Training die noch unberuehrten Vorschlaege neu
   berechnen (nur Felder, die noch als Vorschlag markiert und nicht abgehakt sind). */
var SUG_VERSION=6;
function refreshWorkoutSuggestions(){
  if(!workout||workout.sugV===SUG_VERSION)return;
  workout.sugV=SUG_VERSION;
  workout.exercises.forEach(function(we){
    var ex=exById(we.ex);if(!ex||!we.sets)return;
    var any=false;
    we.sets.forEach(function(st){if(st.sug&&!st.done){st.kg=null;st.reps=null;delete st.repsL;delete st.repsR;st.sug=false;any=true;}});
    if(any){try{applySuggestion(we,ex);}catch(e){}}
  });
  try{saveWorkout();woShape=null;if(tab==="tab-training")renderSession();}catch(e){}
}
