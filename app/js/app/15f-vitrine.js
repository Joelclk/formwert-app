/* =========================================================================
   app/15f-vitrine.js - Erfolge-Bereich im Werte-Tab und Vitrine:
   Meilenstein-Medaillen (z. B. 100 kg Bankdruecken, 10 Klimmzuege), Rekorde
   je Uebung. Alles wird aus dem Verlauf berechnet - nichts extra gespeichert.
   ========================================================================= */
var MEDAL_LV=[
 {n:"Bronze",  l:"#FFC18F",m:"#C0692C",d:"#6E3410"},
 {n:"Silber",  l:"#FFFFFF",m:"#AEB9C4",d:"#56616C"},
 {n:"Gold",    l:"#FFF0A0",m:"#E4AE1C",d:"#8C5E00"},
 {n:"Diamant", l:"#DCEBFF",m:"#4A86F2",d:"#15389C"},
 {n:"Champion",l:"#FFC9C0",m:"#D93A3A",d:"#7A0E1C"}
];
/* Meilensteine. kind: "ex" = bestes Einzelergebnis der Uebung(en) ueber den ganzen Verlauf
   (Gewicht bei Gewichtsuebungen, sonst Wdh./Sek.), sonst eine Gesamtzahl. */
var MILESTONES=[
 {id:"bench",   grp:"Kraft",   name:"Bankdrücken",  kind:"ex", ex:["bench"],                    unit:"kg", steps:[60,80,100,120,140]},
 {id:"squat",   grp:"Kraft",   name:"Kniebeuge",    kind:"ex", ex:["squat"],                    unit:"kg", steps:[60,100,140,180,220]},
 {id:"deadlift",grp:"Kraft",   name:"Kreuzheben",   kind:"ex", ex:["deadlift"],                 unit:"kg", steps:[100,140,180,220,260]},
 {id:"ohp",     grp:"Kraft",   name:"Schulterdrücken",kind:"ex",ex:["ohp"],                     unit:"kg", steps:[40,50,60,80,100]},
 {id:"row",     grp:"Kraft",   name:"Rudern",       kind:"ex", ex:["row_bb","row_pendlay","row_tbar"],unit:"kg",steps:[40,60,80,100,120]},
 {id:"big3",    grp:"Kraft",   name:"Big-3-Summe",  kind:"big3",unit:"kg",                         steps:[200,300,400,500,600]},
 {id:"pullup",  grp:"Körpergewicht",name:"Klimmzüge",kind:"ex",ex:["pullup","chinup","pullup_wide"],unit:"Wdh.",steps:[1,5,10,15,20]},
 {id:"dips",    grp:"Körpergewicht",name:"Dips",     kind:"ex",ex:["dips"],                     unit:"Wdh.",steps:[5,10,20,30,40]},
 {id:"pushup",  grp:"Körpergewicht",name:"Liegestütze",kind:"ex",ex:["pushup"],                 unit:"Wdh.",steps:[10,20,40,60,80]},
 {id:"plank",   grp:"Körpergewicht",name:"Unterarmstütz",kind:"ex",ex:["plank"],                unit:"s",  steps:[60,90,120,180,300]},
 {id:"days",    grp:"Dranbleiben",name:"Trainingstage",kind:"days",unit:"",   steps:[10,25,50,100,250]},
 {id:"streak",  grp:"Dranbleiben",name:"Serie",       kind:"streak",unit:"Wochen",steps:[4,8,12,26,52]},
 {id:"volume",  grp:"Dranbleiben",name:"Bewegte Last", kind:"vol", unit:"t",  steps:[25,100,500,1500,5000]},
 {id:"records", grp:"Dranbleiben",name:"Rekorde",      kind:"prs", unit:"",   steps:[10,25,50,100,250]},
 {id:"balance", grp:"Gesamt",  name:"Ausgewogen",   kind:"balance",unit:"",   steps:[3,6,9,12,15]},
 {id:"fit",     grp:"Gesamt",  name:"Formwert",     kind:"fit", unit:"",       steps:[50,60,70,80,90]},
 {id:"rank",    grp:"Gesamt",  name:"Gesamtstärke", kind:"rank",unit:"",   steps:[6,9,12,15,18]}
];
/* Serie: eine Woche (Mo-So) zaehlt, wenn dein Wochenziel an Trainingstagen erreicht ist. Eine
   verfehlte Woche wird alle 8 Wochen einmal verziehen (zaehlt nicht mit, bricht die Serie
   aber nicht). Die laufende, noch offene Woche bricht nie etwas. Die Medaille zaehlt die
   laengste Serie, die du je hattest. */
function weekStartOf(d){var off=(parseIso(d).getDay()+6)%7;return shiftDays(d,-off);}
function streakCalc(trainDays){
  var goal=(state.profile&&state.profile.goals&&state.profile.goals.days)||0;
  var out={best:null,hist:[]};
  if(!(goal>0)||!trainDays.length)return out;
  var wk={};trainDays.forEach(function(d){var k=weekStartOf(d);wk[k]=(wk[k]||0)+1;});
  var cur=weekStartOf(TODAY),w=weekStartOf(trainDays[0]),s=0,best=0,joker=-99,idx=0;
  while(w<=cur){
    if((wk[w]||0)>=goal){s++;if(s>best){best=s;var ed=shiftDays(w,6);out.hist.push({d:ed>TODAY?TODAY:ed,v:s});}}
    else if(w===cur){/* laufende Woche: noch offen */}
    else if(s>0&&idx-joker>=8){joker=idx;}
    else s=0;
    w=shiftDays(w,7);idx++;
  }
  out.best=best;return out;
}
/* Ein Durchlauf durch den ganzen Verlauf: je Uebung chronologische Bestwerte, Rekordanzahl,
   Trainingstage und Volumen - daraus werden alle Medaillen abgeleitet (mit Datum). */
function vitrineData(){
  var days=Object.keys(state.days).filter(function(k){return k<=TODAY;}).sort();
  var best={},firstDay={},hist={},prs=0,prList=[],trainDays=[],volCum=[],vol=0;
  var bestE={},bestKg={},big3Last=0,big3Hist=[];
  days.forEach(function(k){
    var sets=state.days[k].sets||[];if(!sets.length)return;
    trainDays.push(k);
    var seenToday={};
    sets.forEach(function(s){
      var ex=exById(s.ex);if(!ex)return;
      var r=s.reps||0;if(r<=0)return;
      if(ex.t==="load")vol+=effectiveKg(ex,s.kg)*r;
      var v=ex.t==="load"?(s.kg||0):r;
      if(best[s.ex]==null||v>best[s.ex]){best[s.ex]=v;(hist[s.ex]=hist[s.ex]||[]).push({d:k,v:v});}
      // Rekorde wie im Training: nicht am ersten Tag einer Uebung
      var e=setValue(ex,s);
      if(firstDay[s.ex]&&firstDay[s.ex]!==k){
        var isPr=(ex.t==="load"&&s.kg>0&&s.kg>(bestKg[s.ex]||0))||(e>(bestE[s.ex]||0)*1.001);
        if(isPr&&!seenToday[s.ex]){prs++;seenToday[s.ex]=1;prList.push({d:k,ex:ex,s:s});}
      }
      if(!firstDay[s.ex])firstDay[s.ex]=k;
      if(ex.t==="load"&&(s.kg||0)>(bestKg[s.ex]||0))bestKg[s.ex]=s.kg||0;
      if(e>(bestE[s.ex]||0))bestE[s.ex]=e;
    });
    var b3=(best.bench||0)+(best.squat||0)+(best.deadlift||0);
    if(b3>big3Last){big3Last=b3;big3Hist.push({d:k,v:b3});}
    volCum.push({d:k,v:vol/1000});
  });
  var st=streakCalc(trainDays);
  return {best:best,hist:hist,prs:prs,prList:prList,trainDays:trainDays,volCum:volCum,vol:vol/1000,bestE:bestE,bestKg:bestKg,big3:big3Last,big3Hist:big3Hist,streak:st.best,streakHist:st.hist};
}
function msValue(m,D){
  if(m.kind==="ex"){var v=null;m.ex.forEach(function(id){if(D.best[id]!=null&&(v==null||D.best[id]>v))v=D.best[id];});return v;}
  if(m.kind==="days")return D.trainDays.length;
  if(m.kind==="vol")return D.vol;
  if(m.kind==="prs")return D.prs;
  if(m.kind==="rank"){var o=overallRank();return o?o.r:null;}
  if(m.kind==="big3")return D.big3>0?D.big3:null;
  if(m.kind==="streak")return D.streak;
  if(m.kind==="balance"){
    var c=compute(TODAY),rs=[],any=false;
    (c.cats||[]).forEach(function(ct){if(ct.exs&&ct.exs.length){any=true;rs.push(rankFromScore(ct.score).r);}else rs.push(0);});
    return any&&rs.length?Math.min.apply(null,rs):null;
  }
  if(m.kind==="fit"){var pk=(state.profile&&state.profile.peaks&&state.profile.peaks.fitness)||0;return Math.max(compute(TODAY).fitness,pk);}
  return null;
}
function msDate(m,D,step){
  if(m.kind==="ex"){var d=null;m.ex.forEach(function(id){(D.hist[id]||[]).some(function(h){if(h.v>=step){if(!d||h.d<d)d=h.d;return true;}return false;});});return d;}
  if(m.kind==="days")return D.trainDays[step-1]||null;
  if(m.kind==="vol"){var x=null;D.volCum.some(function(h){if(h.v>=step){x=h.d;return true;}return false;});return x;}
  if(m.kind==="prs")return D.prList[step-1]?D.prList[step-1].d:null;
  if(m.kind==="big3"||m.kind==="streak"){var hh=m.kind==="big3"?D.big3Hist:D.streakHist,y=null;hh.some(function(h){if(h.v>=step){y=h.d;return true;}return false;});return y;}
  return null;
}
function fmtSec(s){return s>=60?Math.floor(s/60)+":"+pad(s%60):s+" s";}
function msStepLabel(m,step){
  if(m.kind==="rank")return rankByIndex(step).t.n;
  if(m.kind==="balance")return rankByIndex(step).name;
  if(m.kind==="vol")return fmtNum(step)+" t";
  if(m.kind==="streak")return step+" Wo.";
  if(m.kind==="fit")return String(Math.round(step));
  if(m.unit==="s")return fmtSec(Math.round(step));
  return fmtNum(step)+(m.unit?" "+m.unit:"");
}
function msList(D){
  var out=[];
  MILESTONES.forEach(function(m){
    var v=msValue(m,D);
    m.steps.forEach(function(step,i){
      var got=v!=null&&v>=step;
      out.push({m:m,i:i,step:step,got:got,date:got?msDate(m,D,step):null,val:v});
    });
  });
  return out;
}
/* ---------- Motive: jede Reihe hat ihr eigenes Zeichen, jede Gruppe ihre eigene Muenzform ----------
   Zeichenflaeche 24x24. fill="#fff" = gefuellte Form, alles andere Linie (fill="none"). */
var MEDAL_ICON={
 bench:'<path d="M3 9h18"/><rect x="3.5" y="5" width="3" height="8" rx="1" fill="#fff"/><rect x="17.5" y="5" width="3" height="8" rx="1" fill="#fff"/><path d="M5 16h14M7 16v4M17 16v4"/>',
 squat:'<path d="M2.5 7h19"/><rect x="2.5" y="4" width="2.6" height="6" rx="1" fill="#fff"/><rect x="18.9" y="4" width="2.6" height="6" rx="1" fill="#fff"/><circle cx="12" cy="10.5" r="2" fill="#fff"/><path d="M12 12.5v3.5M12 16l-3.5 4.5M12 16l3.5 4.5"/>',
 deadlift:'<path d="M1.5 20.5h21"/><rect x="3" y="8" width="3.4" height="12" rx="1.2" fill="#fff"/><rect x="17.6" y="8" width="3.4" height="12" rx="1.2" fill="#fff"/><rect x="6.4" y="10.5" width="2.2" height="7" rx=".8" fill="#fff"/><rect x="15.4" y="10.5" width="2.2" height="7" rx=".8" fill="#fff"/><path d="M8.6 14h6.8"/>',
 ohp:'<path d="M2.5 4h19"/><rect x="2.5" y="1.5" width="2.6" height="5" rx="1" fill="#fff"/><rect x="18.9" y="1.5" width="2.6" height="5" rx="1" fill="#fff"/><path d="M8 4l4 6 4-6"/><circle cx="12" cy="11.5" r="1.8" fill="#fff"/><path d="M12 13.5v4M12 17.5l-3 4M12 17.5l3 4"/>',
 row:'<circle cx="4.5" cy="8" r="2" fill="#fff"/><path d="M6 9.5l8 3.5M14 13l-1.5 7M14 13l4 7"/><path d="M9 11.5v6"/><rect x="6.5" y="16.5" width="5" height="2.6" rx="1" fill="#fff"/><rect x="5" y="15.5" width="1.8" height="4.6" rx=".8" fill="#fff"/><rect x="11.2" y="15.5" width="1.8" height="4.6" rx=".8" fill="#fff"/>',
 big3:'<rect x="3" y="10" width="5" height="10" rx="1.2" fill="#fff"/><rect x="9.5" y="3.5" width="5" height="16.5" rx="1.2" fill="#fff"/><rect x="16" y="7.5" width="5" height="12.5" rx="1.2" fill="#fff"/>',
 pullup:'<path d="M2.5 9h19"/><circle cx="12" cy="5.5" r="2.2" fill="#fff"/><path d="M7.5 9l4.5 3 4.5-3M12 12v7M12 19l-2.5 3M12 19l2.5 3"/>',
 dips:'<path d="M2 12h6M16 12h6"/><circle cx="12" cy="5" r="2" fill="#fff"/><path d="M5 12l5-3.5h4L19 12M12 8.5v7M12 15.5l-2.5 4.5M12 15.5l2.5 4.5"/>',
 pushup:'<circle cx="19.5" cy="9" r="2" fill="#fff"/><path d="M3 15l14-4.5M7 14v5M2 20h20"/>',
 plank:'<path d="M2 17h12"/><path d="M4 17v3M14 17l1.5-4.5"/><circle cx="17.5" cy="8.5" r="4.5" fill="#fff"/><path class="d" d="M17.5 8.5V6M17.5 8.5l2 1.2"/><path d="M15.5 3.2h4"/>',
 days:'<rect x="3.5" y="5" width="17" height="15" rx="2.5" fill="#fff"/><path class="d" d="M3.5 10h17"/><path d="M8 3v4M16 3v4"/><path class="d" d="M8.2 15.2l2.8 2.8 5-5.5" stroke-width="2.2"/>',
 streak:'<path d="M12.5 2c.6 4 5.5 6 5.5 12a6 6 0 0 1-12 0c0-3 1.8-4.5 3-6.5.2 2 1 3 2 3 .5-3-.6-5.5 1.5-8.5z" fill="#fff"/><path class="d" d="M12 19a3 3 0 0 1-3-3c0-1.6 1.5-2.5 2-3.7.5 1 3.9 1.8 4 3.7a3 3 0 0 1-3 3z"/>',
 volume:'<rect x="2.5" y="16" width="19" height="4.5" rx="1.2" fill="#fff"/><rect x="5.5" y="11" width="13" height="4.5" rx="1.2" fill="#fff"/><rect x="8.5" y="6" width="7" height="4.5" rx="1.2" fill="#fff"/><path d="M12 2v2.5"/>',
 records:'<path d="M7 3.5h10v5.5a5 5 0 0 1-10 0z" fill="#fff"/><path d="M7 5.5H3.8v2a3.2 3.2 0 0 0 3.2 3.2M17 5.5h3.2v2a3.2 3.2 0 0 1-3.2 3.2M12 14v4M8 21h8M9 18h6"/>',
 balance:'<path d="M12 3.5v16M6 20h12M4 7.5h16"/><path d="M4 7.5L1.5 14h5zM20 7.5L17.5 14h5z" fill="#fff"/><path d="M1.5 14a2.5 2.5 0 0 0 5 0M17.5 14a2.5 2.5 0 0 0 5 0"/>',
 fit:'<path d="M12 20.5s-8.5-5-8.5-11a4.6 4.6 0 0 1 8.5-2.4 4.6 4.6 0 0 1 8.5 2.4c0 6-8.5 11-8.5 11z" fill="#fff"/><path class="d" d="M3.5 12.5H8l1.8-3 3 6 1.7-3H20.5" stroke-width="1.7"/>',
 rank:'<path d="M12 2.5l8 3v6.2c0 5-3.6 8.2-8 9.8-4.4-1.6-8-4.8-8-9.8V5.5z" fill="#fff"/><path class="d" d="M12 7.5l1.3 2.7 3 .4-2.2 2.1.6 3L12 14.3l-2.7 1.4.6-3-2.2-2.1 3-.4z" stroke-width="1.3"/>'
};
var MEDAL_SHAPE={Kraft:"circle","Körpergewicht":"shield",Dranbleiben:"octagon",Gesamt:"seal"};
function medalShapePath(shape){
  if(shape==="shield")return "M9 22H51V42C51 54 41 61 30 65C19 61 9 54 9 42Z";
  var pts=[],cx=30,cy=42,k;
  if(shape==="octagon"){for(k=0;k<8;k++){var a=(k*45+22.5)*Math.PI/180;pts.push((cx+23*Math.sin(a)).toFixed(1)+" "+(cy-23*Math.cos(a)).toFixed(1));}}
  else if(shape==="seal"){for(k=0;k<24;k++){var b=k*15*Math.PI/180,r=k%2?19.5:24;pts.push((cx+r*Math.sin(b)).toFixed(1)+" "+(cy-r*Math.cos(b)).toFixed(1));}}
  else return null;
  return "M"+pts.join("L")+"Z";
}
/* Zeichen in Muenzmitte: erst dunkler Rand, dann helle Fuellung (bleibt so auch bei kleiner Groesse lesbar). */
function medalEmblem(m,c,locked,small){
  var ic=MEDAL_ICON[m.id];if(!ic)return "";
  var sc=small?1.3:1.02,cx=30,cy=small?42:36.8,tx=(cx-12*sc).toFixed(2),ty=(cy-12*sc).toFixed(2);
  var g='<g transform="translate('+tx+' '+ty+') scale('+sc+')" stroke-linecap="round" stroke-linejoin="round" ';
  var plain=ic.replace(/ class="d"/g,"");
  if(locked)return g+'fill="none" stroke="#8C867C" stroke-width="1.8">'+plain.replace(/fill="#fff"/g,'fill="#B9B4AB"')+'</g>';
  var dark=c.d;
  return g+'fill="none" stroke="'+dark+'" stroke-width="4.2">'+plain.replace(/fill="#fff"/g,'fill="'+dark+'"')+'</g>'+
         g+'fill="none" stroke="#fff" stroke-width="1.7">'+ic.replace(/ class="d"/g,' stroke="'+dark+'"')+'</g>';
}

var mdUid=0;
/* Medaille als SVG: Band oben, Muenze in der Farbe der Stufe. Mit m (Meilenstein) bekommt jede
   Reihe ihr eigenes Zeichen und jede Gruppe ihre eigene Muenzform; ohne m die schlichte Zahlen-Muenze. */
/* Fertige Medaillen-Bilder: assets/medals/<id>-<stufe>.webp (Stufen: bronze, silber, gold, diamant, champion).
   Welche es gibt, steht in assets/medal-manifest.js (MEDAL_IMG.<id> = "11111", Stelle = Stufe).
   Fehlt ein Bild, bleibt die gezeichnete Medaille stehen. */
var MEDAL_TIER_FILE=["bronze","silber","gold","diamant","champion"];
function medalHasImg(m,i){return !!(m&&window.MEDAL_IMG&&MEDAL_IMG[m.id]&&MEDAL_IMG[m.id].charAt(i)==="1");}
function medalSvgImg(i,size,locked,m){
  var src="assets/medals/"+m.id+"-"+MEDAL_TIER_FILE[i]+".webp";
  return '<svg class="md md-img" viewBox="0 0 100 100" width="'+size+'" height="'+size+'" aria-hidden="true">'+
    '<image href="'+src+'" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"'+(locked?' style="filter:grayscale(1) brightness(.55)"':'')+'/></svg>';
}
function medalSvg(i,txt,size,locked,m){
  if(medalHasImg(m,i))return medalSvgImg(i,size,locked,m);
  if(m&&MEDAL_ICON[m.id])return medalSvgIcon(i,txt,size,locked,m);
  return medalSvgPlain(i,txt,size,locked);
}
function medalSvgIcon(i,txt,size,locked,m){
  var c=MEDAL_LV[i],id="md"+(++mdUid),small=size<48;
  var g=locked?'<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4E1DB"/><stop offset="1" stop-color="#B9B4AB"/></linearGradient>'
                :'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c.l+'"/><stop offset=".55" stop-color="'+c.m+'"/><stop offset="1" stop-color="'+c.d+'"/></linearGradient>';
  var rib=locked?"#CFCAC1":["#C0392B","#2F5F8F","#C0392B","#6A3FC4","#E4AE1C"][i];
  var sp=medalShapePath(MEDAL_SHAPE[m.grp]||"circle"),edge=locked?"#A9A39A":c.d,ring="rgba(255,255,255,"+(locked?.5:.55)+")";
  var coin=sp?'<path d="'+sp+'" fill="url(#'+id+')" stroke="'+edge+'" stroke-width="2" stroke-linejoin="round"/>'+
              '<path d="'+sp+'" transform="translate(30 42) scale(.78) translate(-30 -42)" fill="none" stroke="'+ring+'" stroke-width="1.2" stroke-linejoin="round"/>'
             :'<circle cx="30" cy="42" r="22" fill="url(#'+id+')" stroke="'+edge+'" stroke-width="2"/><circle cx="30" cy="42" r="17" fill="none" stroke="'+ring+'" stroke-width="1.2"/>';
  var tx=(!small&&!locked&&txt)?'<text x="30" y="'+(MEDAL_SHAPE[m.grp]==="shield"?57:57.5)+'" text-anchor="middle" font-size="'+(txt.length>3?7:8.5)+'" font-weight="800" fill="#fff" stroke="'+c.d+'" stroke-width=".7" paint-order="stroke" font-family="system-ui,sans-serif">'+txt+'</text>':"";
  return '<svg class="md" viewBox="0 0 60 70" width="'+size+'" height="'+Math.round(size*70/60)+'" aria-hidden="true"><defs>'+g+'</defs>'+
    '<path d="M18 2h10l4 14-6 4zM42 2H32l-4 14 6 4z" fill="'+rib+'"/>'+coin+medalEmblem(m,c,locked,small||locked||!txt)+tx+'</svg>';
}
function medalSvgPlain(i,txt,size,locked){
  var c=MEDAL_LV[i],id="md"+(++mdUid);
  var g=locked?'<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4E1DB"/><stop offset="1" stop-color="#B9B4AB"/></linearGradient>'
                :'<linearGradient id="'+id+'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+c.l+'"/><stop offset=".55" stop-color="'+c.m+'"/><stop offset="1" stop-color="'+c.d+'"/></linearGradient>';
  var rib=locked?"#CFCAC1":["#C0392B","#2F5F8F","#C0392B","#6A3FC4","#E4AE1C"][i];
  var fs=txt.length>4?11:txt.length>3?13:15;
  return '<svg class="md" viewBox="0 0 60 70" width="'+size+'" height="'+Math.round(size*70/60)+'" aria-hidden="true"><defs>'+g+'</defs>'+
    '<path d="M18 2h10l4 14-6 4zM42 2H32l-4 14 6 4z" fill="'+rib+'"/>'+
    '<circle cx="30" cy="42" r="22" fill="url(#'+id+')" stroke="'+(locked?"#A9A39A":c.d)+'" stroke-width="2"/>'+
    '<circle cx="30" cy="42" r="17" fill="none" stroke="rgba(255,255,255,'+(locked?.5:.55)+')" stroke-width="1.2"/>'+
    (locked?'<path d="M25 41v-3a5 5 0 0 1 10 0v3M23.5 41h13v9h-13z" fill="none" stroke="#8C867C" stroke-width="2" stroke-linejoin="round"/>'
           :'<text x="30" y="'+(46+ (fs<15?0:1))+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="#fff" stroke="'+c.d+'" stroke-width=".8" paint-order="stroke" font-family="system-ui,sans-serif">'+txt+'</text>')+
    '</svg>';
}
function msShort(m,step){
  if(m.kind==="rank"||m.kind==="balance")return rankByIndex(step).t.n.slice(0,3).toUpperCase();
  if(m.unit==="s")return fmtSec(step);
  if(m.kind==="streak")return step+"W";
  return String(step>=1000?(Math.round(step/100)/10+"k").replace(".",","):step);
}
function msMedalEl(x,size){
  var w=el("div","md-item"+(x.got?"":" off"));
  w.innerHTML=medalSvg(x.i,msShort(x.m,x.step),size||44,!x.got,x.m);
  w.appendChild(el("b",null,msStepLabel(x.m,x.step)));
  return w;
}

/* ---------- Werte-Tab: Bereich "Erfolge" ---------- */
function renderErfolge(){
  var box=$("erfolge");if(!box)return;
  box.innerHTML="";
  var D=vitrineData(),L=msList(D),got=L.filter(function(x){return x.got;});
  got.sort(function(a,b){return (b.date||"").localeCompare(a.date||"")||b.i-a.i;});
  var sum=$("erf-sum");if(sum)sum.textContent=got.length+" von "+L.length+" Medaillen";
  var top=el("div","erf-top");
  var st=el("div","erf-stats");
  [[got.length,"Medaillen"],[D.prs,"Rekorde"],[D.trainDays.length,"Trainingstage"]].forEach(function(p){
    var c=el("div");c.innerHTML='<b class="num">'+p[0]+'</b><span>'+p[1]+'</span>';st.appendChild(c);});
  top.appendChild(st);box.appendChild(top);
  var row=el("div","erf-row");
  if(got.length)got.slice(0,5).forEach(function(x){var it=msMedalEl(x,40);it.appendChild(el("span",null,x.m.name));row.appendChild(it);});
  else row.appendChild(el("p","note","Noch keine Medaille – die erste gibt es schon ab 10 Trainingstagen oder 5 Dips am Stück."));
  box.appendChild(row);
  // Naechste erreichbare Medaille (die, der du prozentual am naechsten bist)
  var nx=null;MILESTONES.forEach(function(m){var v=msValue(m,D);if(v==null&&m.kind!=="days")return;
    var s=null;for(var i=0;i<m.steps.length;i++){if(!(v>=m.steps[i])){s={m:m,i:i,step:m.steps[i],v:v||0};break;}}
    if(!s)return;var base=s.i?m.steps[s.i-1]:0,p=(s.v-base)/(s.step-base);if(!nx||p>nx.p){s.p=p;nx=s;}});
  if(nx){var n=el("div","erf-next");n.innerHTML=medalSvg(nx.i,msShort(nx.m,nx.step),28,false,nx.m);
    n.appendChild(el("span",null,"Nächste Medaille: "+nx.m.name+" "+msStepLabel(nx.m,nx.step)+" – "+msRemain(nx.m,nx.v,nx.step)));box.appendChild(n);}
  var btn=el("button","btn ghost block","Vitrine öffnen");btn.type="button";btn.style.marginTop="10px";
  btn.onclick=function(){sheetVitrine();};box.appendChild(btn);
}
function msRemain(m,v,step){
  if(m.kind==="rank")return "Gesamtstärke auf "+rankByIndex(step).t.n;
  if(m.kind==="balance")return "alle 6 Kraftbereiche auf "+rankByIndex(step).name;
  if(m.kind==="streak"){var ds=step-(v||0);return "noch "+ds+(ds===1?" Woche":" Wochen");}
  if(m.kind==="fit"){var df=Math.ceil(step-(v||0));return "noch "+df+(df===1?" Punkt":" Punkte");}
  if(m.unit==="s")return "noch "+fmtSec(Math.max(1,Math.round(step-(v||0))));
  var d=step-(v||0);
  if(m.kind==="vol")return "noch "+fmtNum(Math.round(d*10)/10)+" t";
  if(m.kind==="days")return "noch "+d+(d===1?" Tag":" Tage");
  if(m.kind==="prs")return "noch "+d+(d===1?" Rekord":" Rekorde");
  return "noch "+fmtNum(Math.round(d*10)/10)+(m.unit?" "+m.unit:"");
}

/* ---------- Vitrine (Sheet) ---------- */
function sheetVitrine(){
  openSheet(function(b){
    sheetTitle(b,"Vitrine");
    var D=vitrineData(),L=msList(D);
    b.appendChild(el("p","note",L.filter(function(x){return x.got;}).length+" von "+L.length+" Medaillen · "+D.prs+" Rekorde insgesamt. Medaillen gibt es für echte Meilensteine – "+MILESTONES.length+" Reihen mit je fünf Stufen von Bronze bis Champion. Medaillen bleiben für immer – auch wenn dein Rang später wieder sinkt."));
    // Reihenfolge: Dranbleiben zuerst, dann Uebungen, die du schon machst, zuletzt nie gemachte.
    var GO={"Dranbleiben":0,"Gesamt":1,"Körpergewicht":2,"Kraft":3};
    var ms=MILESTONES.slice().map(function(m){var v=msValue(m,D);return {m:m,v:v,has:v!=null&&(m.kind!=="ex"||v>0)};});
    ms.sort(function(a,c){return (c.has-a.has)||(GO[a.m.grp]-GO[c.m.grp]);});
    var grp=null;
    ms.forEach(function(o){var m=o.m;var head=o.has?m.grp:"Noch nicht angefangen";
      if(head!==grp){grp=head;b.appendChild(el("div","grouplab",grp));}
      var v=msValue(m,D),line=el("div","md-line");
      var hd=el("div","md-head");hd.appendChild(el("b",null,m.name));
      var cur=(m.kind==="rank"||m.kind==="balance")?(v!=null?rankByIndex(v).name:"–"):(v!=null?msStepLabel(m,Math.round(v*10)/10):"–");
      hd.appendChild(el("span",null,(m.kind==="ex"?"Bestwert ":"Stand ")+cur));line.appendChild(hd);
      var g=el("div","md-grid");
      m.steps.forEach(function(step,i){var got=v!=null&&v>=step;var it=msMedalEl({m:m,i:i,step:step,got:got},40);
        if(got){var dt=msDate(m,D,step);if(dt)it.appendChild(el("span",null,shortDate(dt)));}
        g.appendChild(it);});
      line.appendChild(g);
      var nextI=-1;for(var i=0;i<m.steps.length;i++)if(!(v>=m.steps[i])){nextI=i;break;}
      if(!o.has)line.appendChild(el("div","md-rem","Noch nie gemacht – schon ein Satz zählt als Start."));
      else if(nextI>=0)line.appendChild(el("div","md-rem",msRemain(m,v,m.steps[nextI])+" bis "+MEDAL_LV[nextI].n));
      else line.appendChild(el("div","md-rem","Alle Stufen geschafft"));
      b.appendChild(line);
    });
    // Rekorde je Uebung (Allzeit-Bestwerte)
    var ids=Object.keys(D.best).filter(function(id){var ex=exById(id);return ex&&ex.t!=="cardio";});
    if(ids.length){
      b.appendChild(el("div","grouplab","Rekorde je Übung"));
      var cnt={};D.prList.forEach(function(p){cnt[p.ex.id]=(cnt[p.ex.id]||0)+1;});
      ids.sort(function(a,c){return (cnt[c]||0)-(cnt[a]||0)||exById(a).n.localeCompare(exById(c).n);});
      var list=el("div","exlist");
      ids.forEach(function(id){var ex=exById(id),it=el("div","exitem tap"),mn=el("div","main");
        mn.appendChild(el("b",null,ex.n));
        var bv=ex.t==="load"?fmtNum(D.bestKg[id]||0)+" kg"+(ex.wt==="side"?" pro Seite":"")+" · Maximum ≈ "+fmtNum(Math.round(rawKg(ex,D.bestE[id]||0)*2)/2)+" kg":D.best[id]+(ex.t==="sec"?" s":" Wdh.");
        mn.appendChild(el("span",null,bv+(cnt[id]?" · "+cnt[id]+(cnt[id]===1?" Rekord":" Rekorde"):"")));
        it.appendChild(mn);
        var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);it.appendChild(ch);
        it.onclick=function(){closeSheet();setTimeout(function(){sheetExerciseDetail(ex);},180);};
        list.appendChild(it);});
      b.appendChild(list);
    }
  });
}
