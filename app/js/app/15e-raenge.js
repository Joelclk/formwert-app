/* =========================================================================
   app/15e-raenge.js - Raenge: Wappen (Holz bis Legende, je I-III) mit Titel
   (Lauch bis Weltenheber, je Stufe ein eigener Titel), fuer jede Uebung und fuer die Gesamtstaerke.
   Grundlage ist die bestehende Kraftwertung (grade(), 0-100): die 18 Stufen
   Holz I ... Diamant III teilen die Skala gleichmaessig, Legende ist das Maximum.
   ========================================================================= */
var RANK_TIERS=[
 {n:"Holz",    title:"Spargeltarzan",       l:"#E2B98A",m:"#9A6636",d:"#4E3016",acc:"#6FA84A",gem:"#8BC46A"},
 {n:"Bronze",  title:"Lauch",        l:"#FFC18F",m:"#C0692C",d:"#6E3410",acc:"#C0692C",gem:"#FF9A5A"},
 {n:"Silber",  title:"Gymrat",       l:"#FFFFFF",m:"#AEB9C4",d:"#56616C",acc:"#4E6BD8",gem:"#E8F0FF"},
 {n:"Gold",    title:"Gorilla", l:"#FFF0A0",m:"#E4AE1C",d:"#8C5E00",acc:"#D2342C",gem:"#FFD84A"},
 {n:"Diamant", title:"",  l:"#DCEBFF",m:"#4A86F2",d:"#15389C",acc:"#7A4BE0",gem:"#CFE6FF"},
 {n:"Champion",title:"",  l:"#FFC9C0",m:"#D93A3A",d:"#7A0E1C",acc:"#FFD84A",gem:"#FF8A80"},
 {n:"Legende", title:"Halbgott",     l:"#FFF3B0",m:"#FF6FA8",d:"#4B3BD6",acc:"#FFD84A",gem:"#FFFFFF",leg:true}
];
/* Eigener Titel fuer jede der 19 Stufen (Holz I ... Legende). */
var RANK_TITLES=["Lauch","Spargeltarzan","Gym-Rookie","Hantelschubser","Satzsammler","Pumpernickel",
  "Gym-Bro","Eisenbieger","Hantelheld","Gym-Rat","Kraftpaket","Muskelberg",
  "Wikinger","Gladiator","Spartaner","Gorilla","Muskelmonster","Titan","Weltenheber"];
var RANK_N=18;                 // Stufen unterhalb von Legende
var RANK_ROM=["I","II","III"];
/* Rang aus einem 0-100-Score. r = 0 (Holz I) ... 17 (Diamant III), 18 = Legende. */
function rankFromScore(score){
  if(score==null||!isFinite(score))return null;
  var s=clamp(score,0,100),r=s>=100?RANK_N:Math.min(RANK_N-1,Math.floor(s*RANK_N/100));
  var tier=r>=RANK_N?6:Math.floor(r/3),div=r>=RANK_N?0:r%3,t=RANK_TIERS[tier];
  var lo=r*100/RANK_N,hi=r>=RANK_N-1?100:(r+1)*100/RANK_N;
  return {r:r,tier:tier,div:div,t:t,score:s,
    name:t.leg?t.n:t.n+" "+RANK_ROM[div],title:RANK_TITLES[r],
    next:r>=RANK_N?null:hi,pct:r>=RANK_N?1:clamp((s-lo)/(hi-lo),0,1)};
}
function rankByIndex(r){return rankFromScore(r>=RANK_N?100:(r+.5)*100/RANK_N);}
function rankLabel(rk){return rk?rk.name+" · "+rk.title:"";}

/* ---------- Wappen (SVG) ---------- */
var rkUid=0;
function rkGrad(a,b,c,diag){var id="rk"+(++rkUid);return {id:id,def:'<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(diag?1:0)+'" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset=".55" stop-color="'+b+'"/><stop offset="1" stop-color="'+c+'"/></linearGradient>'};}
function rkHex(cx,cy,R){var p=[];for(var k=0;k<6;k++){var a=(k*60-90)*Math.PI/180;p.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]);}return p;}
function rkP(pts){return pts.map(function(p){return p[0].toFixed(1)+","+p[1].toFixed(1);}).join(" ");}
function rkSym(tier,t){var c=t.gem,e=t.d;
  switch(tier){
   case 0:return '<path d="M50 64 C50 56 50 50 50 42 M50 52 C44 50 41 45 41 39 C47 40 50 44 50 50 M50 47 C55 44 59 40 59 34 C53 35 50 40 50 45" fill="'+c+'" stroke="#2E5A1E" stroke-width="2" stroke-linecap="round"/>';
   case 1:return '<circle cx="50" cy="50" r="10" fill="'+c+'" stroke="'+e+'" stroke-width="2"/><circle cx="46.5" cy="46.5" r="3.2" fill="rgba(255,255,255,.75)"/>';
   case 2:return '<path d="M50 36 C58 44 60 50 60 54 A10 10 0 0 1 40 54 C40 50 42 44 50 36Z" fill="'+c+'" stroke="'+e+'" stroke-width="2"/><path d="M46 52 C46 48 48 45 50 43" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/>';
   case 3:return '<path d="M37 41 L63 41 L50 63Z" fill="'+c+'" stroke="'+e+'" stroke-width="2" stroke-linejoin="round"/><path d="M37 41 L50 48 L63 41 M50 48 L50 63" stroke="rgba(140,94,0,.55)" stroke-width="1.4" fill="none"/>';
   case 4:return '<path d="M39 44 L44 37 L56 37 L61 44 L50 63Z" fill="'+c+'" stroke="'+e+'" stroke-width="2" stroke-linejoin="round"/><path d="M39 44 L61 44 M44 37 L47 44 L50 63 L53 44 L56 37 M47 44 L50 37 L53 44" fill="none" stroke="rgba(21,56,156,.45)" stroke-width="1.1"/>';
   case 5:return '<path d="M44 36 L56 36 L63 43 L63 55 L56 62 L44 62 L37 55 L37 43Z" fill="'+c+'" stroke="'+e+'" stroke-width="2" stroke-linejoin="round"/><path d="M45 42 L55 42 L58 45 L58 53 L55 56 L45 56 L42 53 L42 45Z" fill="rgba(255,255,255,.3)" stroke="rgba(122,14,28,.45)" stroke-width="1"/><path d="M44 36 L45 42 M56 36 L55 42 M63 43 L58 45 M63 55 L58 53 M56 62 L55 56 M44 62 L45 56 M37 55 L42 53 M37 43 L42 45" stroke="rgba(122,14,28,.45)" stroke-width="1"/><path d="M46 44 L50 44 L47 50Z" fill="rgba(255,255,255,.7)"/>';
   default:return '<path d="M50 34 l5 10.5 11.5 1.4 -8.5 7.9 2.3 11.3 L50 59.4 39.7 65.1 42 53.8 33.5 45.9 45 44.5Z" fill="#fff" stroke="rgba(75,59,214,.5)" stroke-width="1.2"/>';}}
function rkWings(tier,t){
  if(tier<2)return "";
  var n=Math.min(4,tier-1),g=t.leg?rkGrad("#FFF3B0","#FFD84A","#C8860A"):rkGrad(t.l,t.m,t.d),s='<defs>'+g.def+'</defs>',ed=t.leg?"#8C5E00":t.d;
  [1,-1].forEach(function(k){var tr=k<0?' transform="translate(100,0) scale(-1,1)"':'',f="";
    for(var i=0;i<n;i++){var y=38+i*7,len=12+(n-i)*4+(tier>=5?4:0);
      f+='<path d="M24 '+(y-4)+' L'+(24-len)+' '+(y-8+i*1.5)+' L'+(24-len+5)+' '+(y+1)+' L24 '+(y+5)+'Z" fill="url(#'+g.id+')" stroke="'+ed+'" stroke-width="1.1" stroke-linejoin="round"/>';}
    s+='<g'+tr+'>'+f+'</g>';});
  return s;}
function rankBadge(r,size,cls){
  var rk=typeof r==="number"?rankByIndex(r):r;if(!rk)return "";
  // Fertiges Bild fuer diese Stufe (assets/rank-img.js)? Dann das statt der Zeichnung.
  if(window.RANK_IMG&&RANK_IMG[rk.r])return '<svg class="rk-badge'+(cls?" "+cls:"")+'" viewBox="0 0 100 100" width="'+size+'" height="'+size+'" role="img" aria-label="'+rk.name+'"><image href="'+RANK_IMG[rk.r]+'" x="0" y="0" width="100" height="100" preserveAspectRatio="xMidYMid meet"/></svg>';
  var tier=rk.tier,div=rk.div,t=rk.t,g=rkGrad(t.l,t.m,t.d),gi=rkGrad(t.l,t.m,t.d,true),e=t.leg?"#3A2A9E":t.d,s="",defs=g.def+gi.def;
  if(t.leg){var gl=rkGrad("#FFD84A","#FF5FA0","#5B5BFF",true);defs+=gl.def;g=gl;
    for(var q=0;q<16;q++){var a=q*22.5*Math.PI/180,r1=40,r2=q%2?50:55;
      s+='<line x1="'+(50+r1*Math.cos(a)).toFixed(1)+'" y1="'+(50+r1*Math.sin(a)).toFixed(1)+'" x2="'+(50+r2*Math.cos(a)).toFixed(1)+'" y2="'+(50+r2*Math.sin(a)).toFixed(1)+'" stroke="#FFD84A" stroke-width="2.6" stroke-linecap="round" opacity=".85"/>';}}
  s+=rkWings(tier,t);
  // Kein Band mehr fuer I-III: jede Stufe hat ihr eigenes Motiv (15e-icons.js).
  var H=rkHex(50,50,30),Hi=rkHex(50,50,22);
  s+='<polygon points="'+rkP(H)+'" fill="url(#'+g.id+')" stroke="'+e+'" stroke-width="2.6" stroke-linejoin="round"/>';
  var sh=[.45,.2,-.12,-.28,-.12,.28];
  for(var f=0;f<6;f++){var v=sh[f];s+='<polygon points="'+rkP([H[f],H[(f+1)%6],Hi[(f+1)%6],Hi[f]])+'" fill="'+(v>0?"rgba(255,255,255,"+v+")":"rgba(0,0,0,"+(-v)+")")+'"/>';}
  s+='<polygon points="'+rkP(Hi)+'" fill="url(#'+gi.id+')" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/>';
  if(tier===0)s+='<path d="M33 40 C41 43 46 42 54 45 S64 48 68 44 M32 56 C40 59 47 53 56 57 S65 59 68 56" fill="none" stroke="rgba(60,30,10,.28)" stroke-width="1.3"/>';
  s+=rkIcon(rk.r);
  if(tier>=5)s+='<path d="M44 20 L50 11 L56 20 L50 23Z" fill="'+(t.leg?"#FFD84A":"#FFC9C0")+'" stroke="'+e+'" stroke-width="1.3"/>';
  return '<svg class="rk-badge'+(cls?" "+cls:"")+'" viewBox="-10 -8 120 106" width="'+size+'" height="'+size+'" role="img" aria-label="'+rk.name+'"><defs>'+defs+'</defs>'+s+'</svg>';
}

/* ---------- Rang je Uebung und Gesamtstaerke ---------- */
function exBestSet(ex,excludeRec){
  var from=shiftDays(TODAY,-(WIN_STRENGTH-1)),best=null,bestSet=null;
  for(var d in state.days){if(d<from||d>TODAY)continue;
    (state.days[d].sets||[]).forEach(function(s){
      if(s.ex!==ex.id||(excludeRec&&(s===excludeRec||(excludeRec.ts&&s.ts===excludeRec.ts))))return;
      var v=setValue(ex,s);if(best==null||v>best){best=v;bestSet=s;}});}
  return {best:best,set:bestSet};
}
function exRank(ex,excludeRec){
  if(!ex||!ex.std)return null;
  var b=exBestSet(ex,excludeRec);if(b.best==null)return null;
  var g=grade(ex,b.best);if(!g)return null;
  var rk=rankFromScore(g.score);rk.best=b.best;rk.bestSet=b.set;return rk;
}
function overallRank(){var c=compute(TODAY);var any=(c.cats||[]).some(function(ct){return !!ct.top;});return any?rankFromScore(c.kraft):null;}
/* Wert der 19-Punkte-Rangleiter zu einem Score - Umkehrung von gradeLadder() (02-berechnung.js). */
function valueForScoreLadder(ladder,score){
  if(!ladder)return null;
  var N=18,step=100/N,s=clamp(score,0,100);
  if(s>=100)return ladder[18];
  var r=Math.min(N-1,Math.floor(s/step)),p=s/step-r;
  return ladder[r]+p*(ladder[r+1]-ladder[r]);
}
/* Wert (e1RM bzw. Wdh./Sek.) zu einem Score - Umkehrung von grade(). */
function valueForScore(ex,score){
  if(ex&&ex.std&&RANK_LADDER[ex.std]){
    var lad=ladderThresholds(ex);
    if(lad)return valueForScoreLadder(lad,score);
  }
  var th=thresholds(ex);if(!th)return null;
  var n=th.length,step=100/n;
  if(score<step)return th[0]*score/step;
  var i=Math.floor(score/step)-1;if(i>=n-1)return th[n-1];
  var p=score/step-(i+1);return th[i]+p*(th[i+1]-th[i]);
}
/* Konkreter naechster Schritt bis zum naechsten Rang, z. B. "62,5 kg × 9". */
function rankNextHint(ex,rk){
  if(!rk||rk.next==null)return null;
  var need=valueForScore(ex,rk.next+0.01);if(need==null)return null;
  var nxt=rankFromScore(rk.next+0.01);
  if(ex.t==="load"){
    var bs=rk.bestSet,kg=bs&&bs.kg>0?bs.kg:null;if(!kg)return {rank:nxt,txt:null};
    var step=sugStep(ex);
    for(var k=0;k<6;k++){var w=sugRound(kg+k*step,step);
      for(var r=1;r<=12;r++){if(setValue(ex,{kg:w,reps:r})>=need)return {rank:nxt,txt:fmtNum(w)+" kg × "+r+(ex.wt==="side"?" pro Seite":"")};}}
    return {rank:nxt,txt:null};
  }
  var u=ex.t==="sec"?" s":" Wdh.";
  return {rank:nxt,txt:Math.ceil(need)+u};
}

/* ---------- Anzeige-Bausteine ---------- */
function rankChip(rk,size,onTap){
  var c=el(onTap?"button":"span","rk-chip");if(onTap){c.type="button";c.onclick=function(ev){if(ev)ev.stopPropagation();onTap();};}
  c.style.setProperty("--rkc",rk.t.leg?"#C04C9A":rk.t.m);
  c.innerHTML=rankBadge(rk,size||18);c.appendChild(el("span",null,rk.name));
  c.setAttribute("aria-label","Rang "+rankLabel(rk));
  return c;
}
/* Karte: Wappen, Rang, Titel, Balken und naechster Schritt (Uebungsseite, Werte-Tab). */
function rankCard(rk,opts){
  opts=opts||{};
  var card=el("button","rk-card");card.type="button";card.style.setProperty("--rkc",rk.t.leg?"#C04C9A":rk.t.m);
  var bd=el("div","rk-card-b");bd.innerHTML=rankBadge(rk,64);card.appendChild(bd);
  var tx=el("div","rk-card-t");
  if(opts.eyebrow)tx.appendChild(el("span","rk-eb",opts.eyebrow));
  var nm=el("b",null,rk.name);tx.appendChild(nm);
  tx.appendChild(el("span","rk-title",rk.title));
  if(rk.next!=null){
    var bar=el("div","rk-bar"),fi=el("i");fi.style.width=Math.round(rk.pct*100)+"%";bar.appendChild(fi);tx.appendChild(bar);
    var nx=rankByIndex(rk.r+1);
    tx.appendChild(el("span","rk-next",opts.hint?opts.hint:(Math.round(rk.pct*100)+" % bis "+nx.name)));
  }else tx.appendChild(el("span","rk-next","Höchster Rang erreicht"));
  card.appendChild(tx);
  var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);card.appendChild(ch);
  card.onclick=function(){sheetRankLadder(rk,opts.ladderTitle||"Rangleiter",opts.hint);};
  return card;
}
/* Rangleiter: alle Raenge von oben (Legende) nach unten (Holz I), eigener Rang hervorgehoben. */
function sheetRankLadder(rk,title,hint){
  openSheet(function(b){
    sheetTitle(b,title||"Rangleiter");
    var list=el("div","rk-ladder"),cur=null;
    for(var r=RANK_N;r>=0;r--){
      var x=rankByIndex(r),row=el("div","rk-row"+(rk&&r===rk.r?" cur":"")+(rk&&r>rk.r?" above":""));
      row.style.setProperty("--rkc",x.t.leg?"#C04C9A":x.t.m);
      var lab=el("div","rk-row-l");lab.appendChild(el("b",null,x.name));lab.appendChild(el("span",null,x.title));row.appendChild(lab);
      var bw=el("div","rk-row-b");bw.innerHTML=rankBadge(x,rk&&r===rk.r?68:52);row.appendChild(bw);
      var you=el("div","rk-row-y");if(rk&&r===rk.r){you.appendChild(el("span","rk-you","Du"));you.appendChild(el("span","rk-you-p",Math.round(rk.pct*100)+" %"));}
      row.appendChild(you);
      if(rk&&r===rk.r)cur=row;
      list.appendChild(row);
    }
    b.appendChild(list);
    if(rk&&rk.next!=null){var nx=rankByIndex(rk.r+1);
      b.appendChild(el("p","note rk-ladder-foot","Nächster Rang: "+nx.name+" · "+nx.title+(hint?" – "+hint:"")));}
    b.appendChild(el("p","note","Jede Stufe hat ihren eigenen Titel – von Lauch bis Weltenheber. Grundlage ist deine Kraft im Verhältnis zu Körpergewicht, Alter und Geschlecht (beste Sätze der letzten 90 Tage)."));
    if(cur)setTimeout(function(){try{cur.scrollIntoView({block:"center"});}catch(e){}},60);
  });
}
function exRankHint(ex,rk){var h=rankNextHint(ex,rk);return h&&h.txt?"z. B. "+h.txt+" für "+h.rank.name:null;}

/* ---------- Aufstieg beim Abhaken ---------- */
function rankOnTick(ex,rec){
  if(!ex||!ex.std)return;
  var before=exRank(ex,rec),after=exRank(ex);
  if(!before||!after||after.r<=before.r)return;
  // Gesamtstaerke vorher/nachher: den Satz kurz herausnehmen und neu rechnen.
  var kb=null,ka=null;
  try{var sets=day(TODAY).sets,ix=sets.indexOf(rec);
    if(ix>=0){sets.splice(ix,1);kb=compute(TODAY).kraft;sets.splice(ix,0,rec);}
    ka=compute(TODAY).kraft;}catch(e){}
  // Rang-Chip auf der Uebungsseite im Training gleich auffrischen.
  try{Array.prototype.forEach.call(document.querySelectorAll('.wo-page .rk-chip[data-ex="'+ex.id+'"]'),function(old){
    var nc=rankChip(after,18,function(){sheetRankLadder(exRank(ex),"Rangleiter · "+ex.n,exRankHint(ex,exRank(ex)));});nc.setAttribute("data-ex",ex.id);old.parentNode.replaceChild(nc,old);});}catch(e){}
  prQ.push({rank:true,ex:ex,from:before,to:after,kb:kb,ka:ka});
  if(!prBusy)prNext();
}
