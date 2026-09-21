/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: BRACHIORAD_BACK bis addWorkoutExercise()
*/

// Unterarm hinten: Brachioradialis-Streifen von der linken Armseite abgenommen (aus der bereits
// als eigener Teilpfad gezeichneten Kontur), dann mit der echten Seitenachse gespiegelt. Vorher
// wurden hier einfach die beiden hand-gezeichneten Teilpfade pro Seite direkt übernommen ("bysize")
// – die waren aber nie exakt gleich groß (Illustration ~3-5 % seitenungleich), das gab die
// wahrgenommene Asymmetrie. Für Überlappung wurde die Kontur vorab mit der echten Silhouette
// beider Arme verschnitten, damit die gespiegelte Fläche auf keiner Seite über den Unterarm hinausragt.
var BRACHIORAD_BACK=[[5.309,174.836],[6.974,166.879],[8.363,158.544],[12.212,138.407],[12.939,133.281],[13.336,128.904],[13.535,125.025],[13.436,122.638],[13.734,112.095],[13.337,111.3],[12.143,110.802],[11.701,111.097],[10.402,112.82],[8.761,115.576],[6.374,120.351],[4.484,125.125],[3.191,129.998],[2.214,135.169],[1.873,138.103],[1.202,148.996],[1.202,154.366],[1.089,158.237],[0.605,164.512],[-0.091,169.485],[-1.085,174.458],[-2.083,178.266],[-2.375,181.01],[-2.329,181.977],[-2.065,182.622],[-1.534,183.057],[-0.688,183.399],[2.144,184.26],[2.466,184.055],[3.067,182.875],[3.788,180.923]];

var BRACHIORAD_BACK_F=[[18.383,181.106],[19.79,179.277],[21.042,176.031],[24.932,163.527],[26.761,156.213],[28.589,150.868],[29.405,148.045],[30.199,144.394],[32.027,137.783],[33.653,130.753],[34.559,125.544],[34.559,118.231],[33.856,115.277],[33.293,114.292],[32.027,114.574],[30.902,116.121],[28.792,119.356],[26.682,124.279],[25.276,128.499],[23.869,133.563],[22.884,138.627],[22.682,141.443],[22.364,143.311],[20.774,156.631],[19.79,161.414],[16.555,171.26],[15.429,175.198],[14.383,177.874],[14.664,179.14],[15.558,180.034]];

// Brachialis-Streifen (Oberarm vorn, außen neben dem Bizeps-Bauch sichtbar). In der männlichen
// Figur ist er zwar je Arm als eigener Teilpfad vorgezeichnet, die beiden Teilpfade sind im
// Rohbild aber NICHT spiegelgleich (rechts deutlich kürzer); die weibliche Figur hat gar keine
// eigene Kontur dafür. Beides ergibt eine einzige, in Blob-Koordinaten normierte Kontur je Figur,
// die auf beide Armseiten gespiegelt angewendet wird. Wichtig: die Kontur liegt vollständig
// INNERHALB beider Arm-Silhouetten dieser Figur (per Verschnitt mit beiden Umrissen berechnet) –
// sonst würde sie an der Maskenkante je Seite unterschiedlich abgeschnitten und die Seiten sähen
// trotz identischer Kontur wieder verschieden aus.
// Vom Nutzer direkt auf der Illustration nachgezeichnete Brachialis-Kontur (Fotoauswertung: Punkte
// digitalisiert, per Bildabgleich in Maskenkoordinaten übertragen) – ersetzt die frühere, zu knapp
// geschätzte Fläche. Dadurch wird nichts vom Bizeps (blau) mehr am Innenrand mit eingefärbt.
var BRACHIALIS_FRONT=[[24.774,128.838],[25.637,130.417],[26.428,132.95],[23.48,141.551],[20.682,151.236],[18.365,162.163],[18.014,162.69],[16.634,162.891],[16.308,161.963],[16.293,160.659],[17.387,145.187],[17.892,142.54],[19.167,138.04],[22.201,131.37],[23.029,130.066]];

var BRACHIALIS_FRONT_F=[[47.911,129.382],[46.334,131.763],[44.927,134.145],[43.815,136.526],[43.06,138.907],[40.591,148.432],[40.183,150.814],[39.906,153.195],[39.257,160.339],[39.158,162.72],[39.238,165.895],[44.098,165.895],[44.98,162.72],[47.238,155.576],[49.037,148.432],[50.395,143.67],[52.635,136.526],[54.258,129.382],[54.699,127.001],[50.367,127.001]];

// Zwickel genau an der Nahtstelle Trapezius/hintere Schulter (rechte Körperseite, aus der
// Zeichnung abgenommen) – gehört zu keinem der beiden Muskeln, wird per excludeMirror aus
// beiden Bändern herausgeschnitten und bleibt so ungefärbt, egal welcher Trainingsstand.
var NOTCH_TRAP_DELT=[[153.561,137.644],[135.758,142.126],[135.568,142.874],[137.083,145.115],[148.447,145.115],[147.879,143.621],[148.258,142.126],[149.583,140.632],[153.939,138.391],[156.97,137.644]];

// Derselbe Zwickel, aber in die lokalen Koordinaten der Schulter-Maske (deltoids_back) umgerechnet:
// Trapez- und Schultermaske überlappen sich an dieser Nahtstelle beide (eigene, unabhängige
// Rohkonturen), darum bekam die hintere Schulter (delt_post) dort weiterhin Farbe, obwohl die
// Trapez-Seite schon ausgeschnitten war. Offset = Differenz der ox/oy beider Rohmasken
// (ox 76.7292/-33.3375 bei upper_back vs. 76.2/-24.6062 bei deltoids_back).
var NOTCH_TRAP_DELT_SHOULDER=[[154.09,128.913],[136.287,133.395],[136.097,134.143],[137.612,136.384],[148.976,136.384],[148.408,134.89],[148.787,133.395],[150.112,131.901],[154.468,129.66],[157.499,128.913]];

// Kleiner Keil oben am inneren Lat-Rand (zwischen zwei Furchen, direkt unter dem Schulterblatt,
// neben dem Trapez) – vom Nutzer als "kein Muskel" festgelegt. Aus der gerenderten Lat-Fläche
// beider Seiten abgenommen (Vereinigung beider Seiten, leicht gepolstert) und in lokalen
// Koordinaten der lats-Maske hinterlegt; wird per excludeMirror aus allen Lat-Bändern entfernt.
var NOTCH_LAT_TOP=[[130.258,121.878],[129.796,122.233],[128.525,126.049],[127.965,130.667],[128.031,131.742],[128.578,132.841],[129.259,133.51],[130.051,133.823],[132.132,134.101],[132.387,133.891],[132.407,133.411],[130.601,122.16]];

// Dieselbe Stelle auf der Frauenfigur (andere Illustration, gleiche Maske): der Keil sitzt dort
// etwas weiter innen und höher – eigene Kontur und eigene Achse, sonst würde die Männer-Kontur
// in die Lat-Oberkante der Frauenfigur schneiden.
var NOTCH_LAT_TOP_F=[[122.717,121.819],[122.393,122.035],[121.548,124.567],[120.656,127.345],[120.509,128.488],[120.839,129.169],[121.028,129.31],[123.457,129.74],[124.254,129.735],[124.456,129.614],[124.534,129.357],[123.556,123.628],[123.179,122.035],[122.99,121.845]];

var SPLIT_MASKS={
  // Trapez/oberer Rücken: absteigender Teil oben (mit Nacken und Schulterblattheber),
  // querer Teil in der Mitte (darunter die Rhomboiden), aufsteigender Teil unten.
  upper_back:{kind:"y",excludeMirror:{axis:104.849,poly:NOTCH_TRAP_DELT},bands:[
    {fine:"descending_part_of_trapezius", frac:[0,0.44]},
    {fine:"transverse_part_of_trapezius",frac:[0.44,0.74]},
    {fine:"ascending_part_of_trapezius",  frac:[0.74,1]}
  ]},
  // Latissimus-Fläche: oben das Schulterblatt mit dem Untergrätenmuskel, darunter als schräges
  // Band der große Rundmuskel (entlang der gezeichneten Bogenlinie zur Achsel), dann der Lat.
  lats:{kind:"poly",vScaleFemale:0.86,exclude:[LATS_UPPER_SHAPE],excludeMirror:{axis:105.355,poly:NOTCH_LAT_TOP,female:{axis:104.282,poly:NOTCH_LAT_TOP_F}},bands:[
    {fine:"infraspinatus",poly:SCAP_INFRA},
    {fine:"teres_minor",poly:SCAP_TMIN},
    {fine:"teres_major",    poly:SCAP_TMAJ},
    {fine:"latissimus_dorsi",     rest:true}
  ]},
  // Wade: die Zwillingsbäuche oben, der Schollenmuskel schaut darunter hervor.
  calves_back:{kind:"y",bands:[
    {fine:"medial_head_of_gastrocnemius",frac:[0,0.60]},
    {fine:"soleus",    frac:[0.60,1]}
  ]},
  // Gerader Bauchmuskel: waagerechte Trennung auf Nabelhöhe (60 % der Muskelhöhe).
  rectus_abdominis:{kind:"y",bands:[
    {fine:"rectus_abdominis", frac:[0,1]}
  ]},
  // Die Grenzen zwischen oberer/mittlerer/unterer Brust sind zwei Faserlinien der
  // Illustration (PEC_LINE_TOP/BOT); "above"/"below" = alles darüber/darunter.
  pectoralis:{kind:"yfan",bands:[
    {fine:"clavicular_head_of_pectoralis_major", top:"above",      bottom:PEC_LINE_TOP},
    {fine:"sternocostal_head_of_pectoralis_major",top:PEC_LINE_TOP, bottom:PEC_LINE_BOT},
    {fine:"abdominal_part_of_pectoralis_major",  top:PEC_LINE_BOT, bottom:"below"}
  ]},
  // Vorderansicht der Flanke: der Bereich direkt unter dem Brustmuskel-Ansatz und der Achsel
  // (Keil plus die drei sichtbaren "Zacken", mit denen der Sägemuskel in den äußeren schrägen
  // Bauchmuskel greift) gehört anatomisch zum vorderen Sägemuskel. Die Fläche reicht dabei über
  // die eigentliche Obliquus-Maskenkontur hinaus (siehe SERRATUS_POLY) – deshalb "polyabs" statt
  // eines reinen Schnitts der Obliquus-Fläche (wie bei Bizeps/Unterarm: eigenständiges Polygon in
  // absoluten Blob-Koordinaten, per Achse auf die andere Körperseite gespiegelt). Die Restfläche
  // ("rest") bleibt die ursprüngliche Obliquus-Kontur minus dieses Polygons = äußerer schräger
  // Bauchmuskel. Gilt automatisch auch für die Frauenfigur (obliques_female, siehe splitDefFor).
  obliques:{kind:"polyabs",axis:SERRATUS_POLY_AXIS,bands:[
    {fine:"serratus_anterior",poly:SERRATUS_POLY,polyR:SERRATUS_POLY_R},
    {fine:"external_abdominal_oblique", rest:true}
  ]},
  // Seitliche Schulter (außen) gegen vordere bzw. hintere Schulter: Grenzlinie vom Nutzer auf
  // der Figur nachgezeichnet (DELT_LINE_FRONT/BACK), gleiche Normierung wie bei der Brust.
  deltoids:{kind:"xcurve",line:DELT_LINE_FRONT,bands:[
    {fine:"clavicular_part_of_deltoid",side:"medial"},
    {fine:"acromial_part_of_deltoid",side:"lateral"}
  ]},
  deltoids_back:{kind:"xcurve",line:DELT_LINE_BACK,excludeMirror:{axis:105.3782,poly:NOTCH_TRAP_DELT_SHOULDER},bands:[
    {fine:"scapular_spinal_part_of_deltoid",side:"medial"},
    {fine:"acromial_part_of_deltoid", side:"lateral"}
  ]},
  // Bizeps-Fläche: die außen sichtbare Brachialis-Kontur wird aus der Restfläche herausgeschnitten
  // – dieselbe normierte Kontur für beide Armseiten, dadurch beide Seiten exakt gleich. Männer-
  // und Frauenfigur haben unterschiedlich geformte Oberarm-Umrisse und deshalb je eine eigene,
  // auf ihre beiden Arme passende Kontur.
  biceps:{kind:"polyabs",axis:105.438,bands:[
    {fine:"brachialis",poly:BRACHIALIS_FRONT},
    {fine:"long_head_of_biceps_brachii", rest:true}
  ]},
  biceps_female:{kind:"polyabs",axis:104.908,bands:[
    {fine:"brachialis",poly:BRACHIALIS_FRONT_F},
    {fine:"long_head_of_biceps_brachii", rest:true}
  ]},
  // Unterarm vorn: radiale Muskelsäule an der Daumenseite (siehe BRACHIORAD_FRONT), der Rest gilt
  // als Handgelenkbeuger-Masse (von vorn sichtbar überwiegend Beuger). Eigene Kontur je Figur,
  // weil die Unterarm-Umrisse von Männer- und Frauenfigur unterschiedlich geformt sind.
  forearms:{kind:"polyabs",axis:104.379,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_FRONT},
    {fine:"flexor_carpi_radialis", rest:true}
  ]},
  forearms_female:{kind:"polyabs",axis:104.908,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_FRONT_F},
    {fine:"flexor_carpi_radialis", rest:true}
  ]},
  // Unterarm hinten: wie vorne wird die Brachioradialis-Kontur von einer Armseite übernommen und
  // gespiegelt, damit beide Seiten exakt gleich aussehen (die zwei hand-gezeichneten Teilpfade
  // waren nie pixelgleich groß). Der Rest der Fläche gilt als Handgelenkstrecker-Masse.
  forearms_back:{kind:"polyabs",axis:104.647,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_BACK},
    {fine:"extensor_carpi_radialis_longus", rest:true}
  ]},
  forearms_back_female:{kind:"polyabs",axis:104.997,bands:[
    {fine:"brachioradialis",poly:BRACHIORAD_BACK_F},
    {fine:"extensor_carpi_radialis_longus", rest:true}
  ]}
}
;

// Hinten sind Nacken und Trapez eine gemeinsame Fläche (upper_back); vorne bekommt der Hals
// dort ein Loch, wo die Trapez-Zipfel liegen.
var MASK_CUT={}
;

// Die Halsfläche reicht vorne bis zum Schlüsselbein und würde die Trapez-Zipfel überdecken.
// Die bleiben aber eigenständig (Nacken/Trapez): der Hals bekommt dort ein Loch
// (evenodd in der Clip-Form), damit sich keine Farben überlagern.
var MASK_HOLE={neck_front:"trapezius", neck_front_female:"trapezius_female"}
;

function holeMask(pth,holeId){
  var hole=null;for(var i=0;i<FIGMASKS.length;i++)if(FIGMASKS[i].id===holeId)hole=FIGMASKS[i];
  if(!hole)return;
  var ox=+pth.getAttribute("data-ox")||0,oy=+pth.getAttribute("data-oy")||0;
  var svgId=(pth.ownerSVGElement&&pth.ownerSVGElement.id)||"fig";
  var defs=pth.ownerSVGElement.querySelector(".msklayer > defs");
  if(!defs){defs=document.createElementNS("http://www.w3.org/2000/svg","defs");pth.parentNode.insertBefore(defs,pth.parentNode.firstChild);}
  var id="hole-"+svgId+"-"+pth.getAttribute("data-mk");
  var cp=document.createElementNS("http://www.w3.org/2000/svg","clipPath");cp.setAttribute("id",id);
  var p=document.createElementNS("http://www.w3.org/2000/svg","path");
  p.setAttribute("d","M-9999 -9999H9999V9999H-9999Z "+hole.d);
  p.setAttribute("clip-rule","evenodd");
  p.setAttribute("transform","translate("+(hole.ox-ox)+","+(hole.oy-oy)+")");
  cp.appendChild(p);defs.appendChild(cp);
  pth.setAttribute("clip-path","url(#"+id+")");
}

function cutMaskTop(pth,frac){
  var b=pth.getBBox(),svgId=(pth.ownerSVGElement&&pth.ownerSVGElement.id)||"fig";
  var defs=pth.ownerSVGElement.querySelector(".msklayer > defs");
  if(!defs){defs=document.createElementNS("http://www.w3.org/2000/svg","defs");pth.parentNode.insertBefore(defs,pth.parentNode.firstChild);}
  var id="cut-"+svgId+"-"+pth.getAttribute("data-mk");
  var cp=document.createElementNS("http://www.w3.org/2000/svg","clipPath");cp.setAttribute("id",id);
  var pad=(b.width+b.height)*2,y=b.y+b.height*frac;
  var rc=document.createElementNS("http://www.w3.org/2000/svg","rect");
  rc.setAttribute("x",b.x-pad);rc.setAttribute("y",y);
  rc.setAttribute("width",b.width+pad*2);rc.setAttribute("height",b.height+pad);
  cp.appendChild(rc);defs.appendChild(cp);
  pth.setAttribute("clip-path","url(#"+id+")");
  pth.setAttribute("data-clip",b.x+","+y+","+b.width+","+Math.max(b.y+b.height-y,0));
}

function splitDefFor(id){return SPLIT_MASKS[id]||SPLIT_MASKS[id.replace(/_female$/,"")];}

// Eine Teilfläche kann mehrere Muskeln zeigen (z. B. mittlerer Trapez + darunterliegende Rhomboiden).
function fineGroups(fine){var f=FINE[fine];if(!f)return [];return [f.g].concat(f.g2||[]);}

// Zerlegt eine kombinierte Bounding-Box in gleich breite horizontale Bänder.
function bandRectsY(bbox,frac){
  return [{type:"rect",x:bbox.x,y:bbox.y+bbox.height*frac[0],w:bbox.width,h:bbox.height*(frac[1]-frac[0])}];
}

// Manche Flächen bestehen aus zwei getrennten "Blobs" (z. B. linke und rechte Körperhälfte im
// selben Pfad). Wir samplen den gerenderten Pfad entlang seiner Länge, ordnen jeden Punkt
// anhand der Bildmitte einem der beiden Blobs zu und liefern je Blob seine Bounding-Box.
function detectBlobs(pathEl){
  var bbox=pathEl.getBBox(),cx=bbox.x+bbox.width/2;
  var len=pathEl.getTotalLength(),L=[],R=[],N=720;
  for(var i=0;i<=N;i++){var p=pathEl.getPointAtLength(len*i/N);(p.x<cx?L:R).push({x:p.x,y:p.y});}
  function blobBox(pts){
    if(!pts.length)return null;
    var x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
    pts.forEach(function(p){if(p.x<x0)x0=p.x;if(p.x>x1)x1=p.x;if(p.y<y0)y0=p.y;if(p.y>y1)y1=p.y;});
    return {x:x0,y:y0,w:x1-x0,h:y1-y0,cx:(x0+x1)/2,pts:pts};
  }
  return {center:cx,blobs:[blobBox(L),blobBox(R)].filter(Boolean)};
}

// Teilt jeden Blob an seiner eigenen medial/lateral-Grenze (dem Rand, der näher an bzw.
// weiter weg von der Körpermitte liegt). Nur die Trennlinie selbst ist maßgeblich – nach
// außen und nach oben/unten laufen die Rechtecke bewusst weit über den Muskel hinaus, damit
// allein die echte Muskelkontur die Ränder bestimmt und keine geraden Schnittkanten entstehen.
// Zur Körpermitte hin ist bei der Mittellinie Schluss, sonst würde ein Rechteck in die
// gespiegelte Fläche der anderen Körperhälfte hineinragen.
function splitBilateral(pathEl,medialFrac){
  var det=detectBlobs(pathEl),cx=det.center;
  var medial=[],lateral=[];
  det.blobs.forEach(function(b){
    var pad=(b.w+b.h)*4,y0=b.y-pad,hh=b.h+pad*2;
    if(b.cx<cx){ // Blob links der Mitte -> medialer Rand ist der rechte Rand des Blobs
      var sx=b.x+b.w-b.w*medialFrac;
      medial.push({type:"rect",x:sx,y:y0,w:Math.max(cx-sx,0),h:hh});
      lateral.push({type:"rect",x:sx-pad,y:y0,w:pad,h:hh});
    } else {
      var sx2=b.x+b.w*medialFrac;
      medial.push({type:"rect",x:cx,y:y0,w:Math.max(sx2-cx,0),h:hh});
      lateral.push({type:"rect",x:sx2,y:y0,w:pad,h:hh});
    }
  });
  return {medial:medial,lateral:lateral};
}

// Teilt eine Fläche entlang von vorgegebenen Faserlinien. Jede Grenze ist eine Polylinie in
// normierten Koordinaten der Muskelfläche: u = 0 an der Achsel (Sehnenansatz) bis 1 am
// Brustbein, v = 0 oben bis 1 unten – jeweils bezogen auf die tatsächlich gerenderte
// Kontur. Die Linien wurden aus der Illustration übernommen (Faserstriche des M. pectoralis),
// sitzen dadurch für beide Körperseiten und beide Figuren an derselben Stelle des Muskels und
// folgen exakt dem gezeichneten Verlauf. Die Muskelkontur schneidet die Bänder zu.
function bandPolysFan(pathEl,def){
  var det=detectBlobs(pathEl),cx=det.center;
  var out={};def.bands.forEach(function(b){out[b.fine]=[];});
  det.blobs.forEach(function(b){
    var u=(b.cx<cx)?1:-1;                 // Richtung von der Achsel zur Körpermitte
    var latX=(u>0)?b.x:(b.x+b.w);          // Achselseite der Fläche
    var BIG=(b.w+b.h)*4;
    function P(uu,vv){return {x:latX+u*uu*b.w,y:b.y+vv*b.h};}
    function curve(bd){ // → Punkte lateral→medial
      var pts=[];
      if(bd==="above"||bd==="below"){
        var vv=bd==="above"?-BIG/b.h:1+BIG/b.h;
        pts=[P(-0.6,vv),P(1.6,vv)];
      } else {
        pts.push(P(-0.6,bd[0][1]));         // über den Ansatz hinaus
        bd.forEach(function(q){pts.push(P(q[0],q[1]));});
        pts.push(P(1.6,bd[bd.length-1][1]));  // bis über das Brustbein hinaus
      }
      // medial nicht über die Körpermitte hinaus (sonst Überlappung mit der anderen Seite)
      pts.forEach(function(q){if((q.x-cx)*u>0)q.x=cx;});
      return pts;
    }
    def.bands.forEach(function(band){
      var top=curve(band.top),bot=curve(band.bottom).reverse();
      out[band.fine].push({type:"poly",points:top.concat(bot)});
    });
  });
  return out;
}

// Teilt eine Fläche links/rechts entlang einer nachgezeichneten Linie (def.line, [v,u]).
// Außen (zum Arm) liegt das laterale Band, innen das mediale – bis zur Körpermitte, damit
// nichts in die gespiegelte Fläche der anderen Seite hineinragt. Oben/unten/außen läuft das
// Polygon weit über den Muskel hinaus; die Kontur selbst schneidet es zu.
function bandPolysXCurve(pathEl,def){
  var det=detectBlobs(pathEl),cx=det.center;
  var out={medial:[],lateral:[]};
  det.blobs.forEach(function(b){
    var u=(b.cx<cx)?1:-1;
    var latX=(u>0)?b.x:(b.x+b.w);
    var BIG=(b.w+b.h)*4;
    function P(uu,vv){return {x:latX+u*uu*b.w,y:b.y+vv*b.h};}
    var ln=def.line,curve=[];
    curve.push(P(ln[0][1],-BIG/b.h));
    ln.forEach(function(q){curve.push(P(q[1],q[0]));});
    curve.push(P(ln[ln.length-1][1],1+BIG/b.h));
    curve.forEach(function(q){if((q.x-cx)*u>0)q.x=cx;});
    var lat=curve.slice();lat.push(P(-BIG/b.w,1+BIG/b.h));lat.push(P(-BIG/b.w,-BIG/b.h));
    var med=curve.slice();med.push({x:cx,y:b.y+b.h+BIG});med.push({x:cx,y:b.y-BIG});
    out.lateral.push({type:"poly",points:lat});out.medial.push({type:"poly",points:med});
  });
  return out;
}

// Frei eingezeichnete Teilflächen in Blob-Koordinaten ([u,v] wie bei den Faserlinien); die
// Restfläche ("rest") ist alles außerhalb dieser Polygone (evenodd-Loch in einem Rechteck um
// genau diesen Blob – NICHT größer: ein Rechteck über die ganze Figur würde die Löcher der
// jeweils anderen Körperseite wieder mit abdecken, weil sich die Clip-Flächen aller Blobs
// vereinigen; die ausgeschnittene Teilfläche würde dann von der Restfarbe übermalt).
// def.exclude (optional): weitere Flächen in denselben [u,v]-Koordinaten, die zusätzlich aus der
// Restfläche herausgeschnitten werden, aber keinem Muskel zugeordnet sind (bleiben ungefärbt) –
// für Falten/Nahtstellen der Zeichnung, die zwar innerhalb der Maskenkontur liegen, aber zu keinem
// der abgebildeten Muskeln gehören.
function bandPolysU(pathEl,def){
  var det=detectBlobs(pathEl),cx=det.center,out={};
  def.bands.forEach(function(b){out[b.fine]=[];});
  det.blobs.forEach(function(b){
    var u=(b.cx<cx)?1:-1,latX=(u>0)?b.x:(b.x+b.w),BIG=(b.w+b.h)*2;
    // Kleiner Zuschlag auf die Blob-Box (Abtastungenauigkeit), aber deutlich kleiner als der
    // Abstand zur anderen Körperseite.
    var PAD=Math.min(b.w,b.h)*0.05;
    // Eingezeichnet auf der Männerfigur; die Frauenfigur hat ein kürzeres Schulterblatt
    // relativ zur Lat-Höhe – Höhenanteil entsprechend stauchen.
    var vs=(figSex()==="female"&&def.vScaleFemale)?def.vScaleFemale:1;
    function P(uu,vv){return {x:latX+u*uu*b.w,y:b.y+vv*vs*b.h};}
    var polys=[];
    def.bands.forEach(function(band){
      if(!band.poly)return;
      var pts=band.poly.map(function(q){return P(q[0],q[1]);});
      polys.push(pts);out[band.fine].push({type:"poly",points:pts});
    });
    if(def.exclude){
      def.exclude.forEach(function(poly){
        polys.push(poly.map(function(q){return P(q[0],q[1]);}));
      });
    }
    def.bands.forEach(function(band){
      if(!band.rest)return;
      out[band.fine].push({type:"holes",outer:{x:b.x-PAD,y:b.y-PAD,w:b.w+2*PAD,h:b.h+2*PAD},polys:polys});
    });
  });
  return out;
}

// Zerlegt ein "d" (M/L/H/V/C/S/Z, wie bei den Bizeps- und Unterarm-Masken) in seine einzelnen
// Teilpfade als Punktlisten in lokalen Pfadkoordinaten – damit lassen sich bereits getrennt
// gezeichnete Teilflächen (z.B. Bizeps-Bauch + Brachialis-Streifen, oder die beiden Unterarm-
// Teilflächen am Rücken) direkt als Klipp-Polygone weiterverwenden, ohne sie über u/v-Normierung
// neu nachbilden zu müssen. Kurven (C/S) werden für die Punktliste in kleine Sehnen zerlegt
// (ausreichend genau für Fläche/Bounding-Box), der tatsächliche Kontrollpunkt wird für die
// "S"-Spiegelung mitgeführt, damit auch verkettete Kurvenzüge (Ellenbogen/Handgelenk-Rundungen)
// nicht driften.
function parseLinearSubpaths(d){
  var toks=d.match(/[MLHVCSZmlhvcsz]|-?\d*\.?\d+(?:e-?\d+)?/g)||[];
  var subs=[],cur=null,cmd=null,cx=0,cy=0,i=0,lastCtrl=null;
  function bez(p0,p1,p2,p3){
    var pts=[],n=8;
    for(var k=1;k<=n;k++){
      var t=k/n,mt=1-t,a=mt*mt*mt,b=3*mt*mt*t,c=3*mt*t*t,e=t*t*t;
      pts.push({x:a*p0.x+b*p1.x+c*p2.x+e*p3.x,y:a*p0.y+b*p1.y+c*p2.y+e*p3.y});
    }
    return pts;
  }
  while(i<toks.length){
    var t=toks[i];
    if(/^[MLHVCSZmlhvcsz]$/.test(t)){
      cmd=t;i++;
      if(cmd==="M"||cmd==="m"){
        var x=parseFloat(toks[i]),y=parseFloat(toks[i+1]);i+=2;
        if(cmd==="m"&&cur){x+=cx;y+=cy;}
        cx=x;cy=y;lastCtrl=null;
        if(cur)subs.push(cur);
        cur=[{x:cx,y:cy}];
        cmd=(cmd==="m")?"l":"L";
      } else if(cmd==="Z"||cmd==="z"){
        lastCtrl=null;
        if(cur&&cur.length){cx=cur[0].x;cy=cur[0].y;}
      }
    } else {
      if(cmd==="l"||cmd==="L"){
        var dx=parseFloat(toks[i]),dy=parseFloat(toks[i+1]);i+=2;
        if(cmd==="l"){cx+=dx;cy+=dy;}else{cx=dx;cy=dy;}
        if(cur)cur.push({x:cx,y:cy});
        lastCtrl=null;
      } else if(cmd==="h"||cmd==="H"){
        var ddx=parseFloat(toks[i]);i++;
        cx=(cmd==="h")?cx+ddx:ddx;
        if(cur)cur.push({x:cx,y:cy});
        lastCtrl=null;
      } else if(cmd==="v"||cmd==="V"){
        var ddy=parseFloat(toks[i]);i++;
        cy=(cmd==="v")?cy+ddy:ddy;
        if(cur)cur.push({x:cx,y:cy});
        lastCtrl=null;
      } else if(cmd==="c"||cmd==="C"){
        var x1=parseFloat(toks[i]),y1=parseFloat(toks[i+1]),x2=parseFloat(toks[i+2]),y2=parseFloat(toks[i+3]),ex=parseFloat(toks[i+4]),ey=parseFloat(toks[i+5]);i+=6;
        var p0={x:cx,y:cy},p1,p2,p3;
        if(cmd==="c"){p1={x:cx+x1,y:cy+y1};p2={x:cx+x2,y:cy+y2};p3={x:cx+ex,y:cy+ey};}
        else {p1={x:x1,y:y1};p2={x:x2,y:y2};p3={x:ex,y:ey};}
        if(cur)bez(p0,p1,p2,p3).forEach(function(pp){cur.push(pp);});
        cx=p3.x;cy=p3.y;lastCtrl=p2;
      } else if(cmd==="s"||cmd==="S"){
        var sx2=parseFloat(toks[i]),sy2=parseFloat(toks[i+1]),sex=parseFloat(toks[i+2]),sey=parseFloat(toks[i+3]);i+=4;
        var sp0={x:cx,y:cy},sp2,sp3;
        if(cmd==="s"){sp2={x:cx+sx2,y:cy+sy2};sp3={x:cx+sex,y:cy+sey};}
        else {sp2={x:sx2,y:sy2};sp3={x:sex,y:sey};}
        var sp1=lastCtrl?{x:2*cx-lastCtrl.x,y:2*cy-lastCtrl.y}:{x:cx,y:cy};
        if(cur)bez(sp0,sp1,sp2,sp3).forEach(function(pp){cur.push(pp);});
        cx=sp3.x;cy=sp3.y;lastCtrl=sp2;
      } else {i++;}
    }
  }
  if(cur)subs.push(cur);
  return subs;
}

function polyAreaAbs(pts){
  var a=0,n=pts.length;
  for(var i=0;i<n;i++){var p1=pts[i],p2=pts[(i+1)%n];a+=p1.x*p2.y-p2.x*p1.y;}
  return Math.abs(a/2);
}

function shapeBBox(s){
  if(s.type==="holes")return {x:s.outer.x,y:s.outer.y,w:s.outer.w,h:s.outer.h};
  if(s.type==="poly"){
    var x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
    s.points.forEach(function(p){x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y);});
    return {x:x0,y:y0,w:x1-x0,h:y1-y0};
  }
  return {x:s.x,y:s.y,w:s.w,h:s.h};
}

function unionRect(shapes){
  var x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  shapes.forEach(function(s){var b=shapeBBox(s);x0=Math.min(x0,b.x);y0=Math.min(y0,b.y);x1=Math.max(x1,b.x+b.w);y1=Math.max(y1,b.y+b.h);});
  return {x:x0,y:y0,w:x1-x0,h:y1-y0};
}

// Ersetzt eine einzelne Maskenfläche durch mehrere, individuell eingefärbte und antippbare
// Teilflächen (siehe SPLIT_MASKS). Wird direkt nach dem ersten Render-Durchlauf aufgerufen,
// sobald der Original-Pfad im DOM steht und seine echte Geometrie gemessen werden kann.
function splitMaskPath(pth,def,ms,dim,paint){
  var ox=pth.getAttribute("data-ox"),oy=pth.getAttribute("data-oy");
  var d=pth.getAttribute("d");
  var rectsByFine={},dByFine={};
  if(def.kind==="y"){
    var bbox=pth.getBBox();
    def.bands.forEach(function(b){rectsByFine[b.fine]=bandRectsY(bbox,b.frac);});
  } else if(def.kind==="yx"){
    var bb=pth.getBBox(),spx=splitBilateral(pth,def.medialFrac||0.5);
    def.bands.forEach(function(b){
      var y0=bb.y+bb.height*b.frac[0],y1=bb.y+bb.height*b.frac[1];
      if(!b.side){rectsByFine[b.fine]=[{type:"rect",x:bb.x,y:y0,w:bb.width,h:y1-y0}];return;}
      rectsByFine[b.fine]=(spx[b.side]||[]).map(function(r){return {type:"rect",x:r.x,y:y0,w:r.w,h:y1-y0};});
    });
  } else if(def.kind==="polyabs"){
    // Teilfläche direkt in Maskenkoordinaten (aus der Illustration abgenommen, also exakt auf der
    // gezeichneten Muskelgrenze) – die zweite Körperseite entsteht durch Spiegelung an der
    // Symmetrieachse der Zeichnung. Die Zeichnung selbst ist seitengleich; nur die hinterlegten
    // Umrisse waren es nicht. Über die Spiegelung sind beide Seiten zwangsläufig identisch.
    var bbA=pth.getBBox(),ax=def.axis,cut=[];
    def.bands.forEach(function(b){
      if(!b.poly)return;
      var L=b.poly.map(function(q){return {x:q[0],y:q[1]};});
      // Normalerweise beide Körperseiten spiegelgleich (an "axis" gespiegelt). Ein optionales
      // "polyR" erlaubt eine EIGENSTÄNDIGE Kontur für die zweite Seite, falls sich die beiden
      // Körperhälften der Illustration an dieser Stelle leicht unterscheiden (auf Nutzerwunsch
      // getrennt nachgezeichnet statt automatisch gespiegelt).
      var R=(b.polyR||b.poly.map(function(q){return [2*ax-q[0],q[1]];})).map(function(q){return {x:q[0],y:q[1]};});
      cut.push(L,R);
      rectsByFine[b.fine]=[{type:"poly",points:L},{type:"poly",points:R}];
      // Eigener Pfad statt der Maskenkontur: einzelne Maskenumrisse sind stellenweise etwas zu
      // knapp nachgezeichnet und würden die Fläche auf einer Seite beschneiden – die Kontur
      // selbst stammt aus der Zeichnung und liegt ohnehin innerhalb des Arms.
      dByFine[b.fine]=[L,R].map(function(pts){
        return "M"+pts.map(function(p){return p.x+" "+p.y;}).join("L")+"Z";
      }).join(" ");
    });
    def.bands.forEach(function(b){
      if(!b.rest)return;
      rectsByFine[b.fine]=[{type:"holes",outer:{x:bbA.x-1,y:bbA.y-1,w:bbA.width+2,h:bbA.height+2},polys:cut}];
    });
  } else if(def.kind==="xbi"){
    var sp=splitBilateral(pth,def.medialFrac);
    def.bands.forEach(function(b){rectsByFine[b.fine]=sp[b.side]||[];});
  } else if(def.kind==="yfan"){
    var polys=bandPolysFan(pth,def);
    def.bands.forEach(function(b){rectsByFine[b.fine]=polys[b.fine]||[];});
  } else if(def.kind==="xcurve"){
    var sp2=bandPolysXCurve(pth,def);
    def.bands.forEach(function(b){rectsByFine[b.fine]=sp2[b.side]||[];});
  } else if(def.kind==="poly"){
    var pu=bandPolysU(pth,def);
    def.bands.forEach(function(b){rectsByFine[b.fine]=pu[b.fine]||[];});
  } else if(def.kind==="bysize"){
    var subs=parseLinearSubpaths(d).map(function(pts){
      var xs=pts.map(function(p){return p.x;});
      return {pts:pts,area:polyAreaAbs(pts),cx:(Math.min.apply(null,xs)+Math.max.apply(null,xs))/2};
    });
    var midX=pth.getBBox().x+pth.getBBox().width/2;
    var leftSubs=subs.filter(function(s){return s.cx<midX;}).sort(function(a,b){return b.area-a.area;});
    var rightSubs=subs.filter(function(s){return s.cx>=midX;}).sort(function(a,b){return b.area-a.area;});
    def.bands.forEach(function(b){
      var rank=b.rank||0,polys=[];
      if(leftSubs[rank])polys.push(leftSubs[rank].pts);
      if(rightSubs[rank])polys.push(rightSubs[rank].pts);
      rectsByFine[b.fine]=polys.map(function(pts){return {type:"poly",points:pts};});
    });
  }
  var svgId=(pth.ownerSVGElement&&pth.ownerSVGElement.id)||"fig";
  var defs=pth.ownerSVGElement.querySelector(".msklayer > defs");
  if(!defs){defs=document.createElementNS("http://www.w3.org/2000/svg","defs");pth.parentNode.insertBefore(defs,pth.parentNode.firstChild);}
  // excludeMirror (optional, unabhängig von "kind"): schneidet eine an einer Körperseite
  // abgenommene Fläche gespiegelt aus JEDEM Band dieser Maske heraus – für Nahtstellen, die zu
  // keinem der aufgeteilten Muskeln gehören. Technisch ein zweiter, unabhängiger Clip-Pfad um
  // die eigentliche Bandfläche herum (Schnittmenge zweier Clips statt eines gemeinsamen Pfads),
  // damit die Bandgeometrie selbst (Rechteck, Polygon, Loch-Pfad …) unverändert bleibt.
  var exclClipId=null;
  // Optional eigene Kontur/Achse für die Frauenfigur (gleiche Maske, andere Illustration).
  var exm=def.excludeMirror;
  if(exm&&figSex()==="female"&&exm.female)exm=exm.female;
  if(exm){
    exclClipId="exclmirror-"+svgId+"-"+pth.getAttribute("data-mk")+"-"+figSex();
    if(!pth.ownerSVGElement.querySelector("#"+CSS.escape(exclClipId))){
      var eb=pth.getBBox(),PADX=(eb.width+eb.height)*2;
      var ax=exm.axis;
      var L=exm.poly.map(function(q){return {x:q[0],y:q[1]};});
      var R=exm.poly.map(function(q){return {x:2*ax-q[0],y:q[1]};});
      var ecp=document.createElementNS("http://www.w3.org/2000/svg","clipPath");ecp.setAttribute("id",exclClipId);
      var ep=document.createElementNS("http://www.w3.org/2000/svg","path");
      var edd="M"+(eb.x-PADX)+" "+(eb.y-PADX)+"h"+(eb.width+2*PADX)+"v"+(eb.height+2*PADX)+"h"+(-(eb.width+2*PADX))+"Z";
      [L,R].forEach(function(pts){edd+=" M"+pts.map(function(p){return p.x+" "+p.y;}).join(" L")+"Z";});
      ep.setAttribute("d",edd);ep.setAttribute("clip-rule","evenodd");ecp.appendChild(ep);
      defs.appendChild(ecp);
    }
  }
  def.bands.forEach(function(b){
    var rects=rectsByFine[b.fine]||[];
    var clipId="clip-"+svgId+"-"+b.fine;
    var cp=document.createElementNS("http://www.w3.org/2000/svg","clipPath");cp.setAttribute("id",clipId);
    rects.forEach(function(r){
      if(r.type==="poly"){
        var pg=document.createElementNS("http://www.w3.org/2000/svg","polygon");
        pg.setAttribute("points",r.points.map(function(p){return p.x+","+p.y;}).join(" "));
        cp.appendChild(pg);
      } else if(r.type==="holes"){
        var hp=document.createElementNS("http://www.w3.org/2000/svg","path"),o=r.outer;
        var dd="M"+o.x+" "+o.y+"h"+o.w+"v"+o.h+"h"+(-o.w)+"Z";
        r.polys.forEach(function(pts){dd+=" M"+pts.map(function(p){return p.x+" "+p.y;}).join(" L")+"Z";});
        hp.setAttribute("d",dd);hp.setAttribute("clip-rule","evenodd");cp.appendChild(hp);
      } else {
        var rc=document.createElementNS("http://www.w3.org/2000/svg","rect");
        rc.setAttribute("x",r.x);rc.setAttribute("y",r.y);rc.setAttribute("width",Math.max(r.w,0));rc.setAttribute("height",Math.max(r.h,0));cp.appendChild(rc);
      }
    });
    defs.appendChild(cp);
    var fEntry=FINE[b.fine];
    var pt=(paint||zonePaint)(fineGroups(b.fine),b.fine,ms,dim);
    var cls=pt.cls,fill=pt.fill,op=pt.op;
    var np=document.createElementNS("http://www.w3.org/2000/svg","path");
    np.setAttribute("class",cls);np.setAttribute("data-fine",b.fine);
    np.setAttribute("data-ox",ox);np.setAttribute("data-oy",oy);
    // Für den Zoom zählt der sichtbare Ausschnitt: die Clip-Form kann (bei Sektoren) weit über
    // den Muskel hinausragen, gemalt wird aber nur die Schnittmenge mit der Muskelkontur.
    if(rects.length){
      var u=unionRect(rects),pb=pth.getBBox();
      if(rects.some(function(r){return r.type==="holes";}))u={x:pb.x,y:pb.y,w:pb.width,h:pb.height};
      var cx0=Math.max(u.x,pb.x),cy0=Math.max(u.y,pb.y);
      var cx1=Math.min(u.x+u.w,pb.x+pb.width),cy1=Math.min(u.y+u.h,pb.y+pb.height);
      np.setAttribute("data-clip",cx0+","+cy0+","+Math.max(cx1-cx0,0)+","+Math.max(cy1-cy0,0));
    }
    np.setAttribute("d",dByFine[b.fine]||d);
    np.setAttribute("clip-path","url(#"+clipId+")");
    np.setAttribute("fill",fill);np.setAttribute("style","opacity:"+op);
    // Bei "polyabs" grenzen zwei aus der Zeichnung abgenommene Polygone direkt aneinander
    // (z. B. Bizeps/Brachialis, Unterarm-Beuger/Brachioradialis) – durch Rundungsfehler beim
    // Rastern kann zwischen ihnen ein hauchdünner, farbloser Spalt entstehen, in dem die
    // darunterliegende Illustration durchscheint und wie ein falscher Farbsaum wirkt. Ein
    // minimaler, fließend gefärbter Rahmen lässt jede Fläche hauchdünn über die eigene Kontur
    // hinauswachsen und schließt genau diesen Spalt, ohne den sichtbaren Umriss zu verändern.
    if(def.kind==="polyabs"){np.setAttribute("stroke",fill);np.setAttribute("stroke-width","0.6");np.setAttribute("stroke-linejoin","round");}
    var title=document.createElementNS("http://www.w3.org/2000/svg","title");
    title.textContent=fEntry?fEntry.de:b.fine;np.appendChild(title);
    if(exclClipId){
      // Die Verschiebung wandert auf die Hüllgruppe, damit Band-Clip (auf np) UND Ausschluss-Clip
      // (auf der Hüllgruppe) im selben lokalen Koordinatensystem ausgewertet werden – genau wie
      // "d" und der eigene Clip eines Elements immer dieselbe lokale Basis teilen.
      var wrap=document.createElementNS("http://www.w3.org/2000/svg","g");
      wrap.setAttribute("transform","translate("+ox+","+oy+")");
      wrap.setAttribute("clip-path","url(#"+exclClipId+")");
      wrap.appendChild(np);
      pth.parentNode.insertBefore(wrap,pth);
    } else {
      np.setAttribute("transform","translate("+ox+","+oy+")");
      pth.parentNode.insertBefore(np,pth);
    }
  });
  pth.parentNode.removeChild(pth);
}

function attachMaskHandlers(svg){
  Array.prototype.forEach.call(svg.querySelectorAll(".msk[data-mk]"),function(pth){
    pth.addEventListener("click",function(){
      var gs=maskGroups(pth.getAttribute("data-mk"));if(!gs.length)return;
      var lab=maskLabel(pth.getAttribute("data-mk"));
      if(selLabel===lab&&!selFine){selSet=null;selLabel=null;selMuscle=null;}
      else {selFine=null;selSet=fineIdsOfGroups(gs);selLabel=lab;selMuscle=gs[0];}
      selTapKey=null;
      renderBodySel();});
  });
  Array.prototype.forEach.call(svg.querySelectorAll(".msk[data-fine]"),function(pth){
    pth.addEventListener("click",function(){
      var f=pth.getAttribute("data-fine");
      if(selFine===f){selFine=null;selMuscle=null;}
      else {selFine=f;selSet=null;selLabel=null;selMuscle=FINE[f]?FINE[f].g:null;}
      selTapKey=null;
      renderBodySel();});
  });
}

// Deckt eine Fläche mehrere Muskeln ab, zählt der Mittelwert ihrer Zonen –
// so beeinflusst jeder erfasste Muskel das Bild, auch ohne eigene Fläche.
function maskZone(gs,ms){var t=0,n=0,any=false;gs.forEach(function(g){var m=muscleById(g);if(!m)return;var v=ms[g]||0;if(v>0)any=true;t+=zoneOf(v,m);n++;});
  return {z:n?Math.round(t/n):0,any:any};}

function selGroups(){
  var ef=effFine();
  if(ef&&FINE[ef])return [FINE[ef].g];
  var ss=effSet();
  if(!ss)return [];
  var out=[];ss.forEach(function(k){var g=FINE[k]&&FINE[k].g;if(g&&out.indexOf(g)<0)out.push(g);});return out;}

function maskSel(gs){var sg=selGroups();if(!sg.length)return false;
  for(var i=0;i<gs.length;i++)if(sg.indexOf(gs[i])>=0)return true;return false;}

function figImages(view){
  var k=figSex()+"-"+view;
  return '<image class="figbase figlight" x="0" y="0" width="'+FIGW+'" height="'+FIGH+'" preserveAspectRatio="xMidYMid meet" href="'+FIGIMG[k+"-light"]+'"/>'+
         '<image class="figbase figdark" x="0" y="0" width="'+FIGW+'" height="'+FIGH+'" preserveAspectRatio="xMidYMid meet" href="'+FIGIMG[k+"-dark"]+'"/>';
}

function renderRegionChips(){
  var bar=$("regionchips");if(!bar)return;bar.innerHTML="";
  var all=el("button","fchip","Alle");all.setAttribute("aria-pressed",String(!selSet&&!selFine));
  all.onclick=function(){selReset();selSet=null;selFine=null;selLabel=null;selTapKey=null;renderBodySel();renderRegionChips();};bar.appendChild(all);
  REGIONS.forEach(function(rg){
    var b=el("button","fchip",rg.name);b.setAttribute("aria-pressed",String(selLabel===rg.name&&!selFine));
    b.onclick=function(){selReset();selectRegion(rg);renderBodySel();};bar.appendChild(b);
  });
}

// Standard-Einfärbung: Wochenzonen (Körper-Tab). "paint" kann das überschreiben – z. B. im
// Training, wo eine Fläche nicht die Wochenlast, sondern den Anteil der aktuellen Übung zeigt.
function zonePaint(gs,fine,ms,dim){
  var r,sel;
  if(fine){r=maskZone(fineGroups(fine),ms||{});sel=isSel(fine);}
  else {r=maskZone(gs,ms||{});sel=maskSel(gs);}
  return {cls:"msk"+(sel?" sel":"")+(dim&&!sel?" dim":""),fill:sel?"var(--bad)":"var(--z"+r.z+")",op:sel?0.6:(r.any?0.9:0)};
}

function renderFigure(svg,view,ms,dim,paint){
  // Die Figur wird bei jeder Auswahl komplett neu aufgebaut (frische DOM-Knoten) – ohne
  // Kniff würde die Zoom-Transition also nie animieren, weil das neue <g> keinen "alten"
  // Wert zum Überblenden hat. Deshalb: alte Transform vor dem Neuaufbau merken, dem neuen
  // <g> erst denselben Wert geben, einen Reflow erzwingen, und danach erst das Ziel setzen.
  var oldG=svg.querySelector(".figzoom"),oldT=oldG?oldG.getAttribute("transform"):null;
  var s='<g class="figzoom"'+(oldT?' transform="'+oldT+'"':'')+'>'+figImages(view)+'<g class="msklayer">';
  masksFor(view).forEach(function(mk){
    var gs=maskGroups(mk.id);if(!gs.length)return;
    // Angetippter Bereich wird immer klar rot markiert, unabhängig vom Trainingsstand –
    // so sieht man sofort, was ausgewählt ist. Ohne Auswahl zeigt die Fläche ihre Zonenfarbe;
    // Zone 0 (nichts trainiert) bleibt dann unbemalt, es wirkt nur die Illustration.
    var pt=(paint||zonePaint)(gs,null,ms,dim);
    s+='<path class="'+pt.cls+'" data-mk="'+mk.id+'" data-ox="'+mk.ox+'" data-oy="'+mk.oy+'" d="'+mk.d+'" transform="translate('+mk.ox+','+mk.oy+')" fill="'+pt.fill+'" style="opacity:'+pt.op+'"><title>'+maskLabel(mk.id)+'</title></path>';
  });
  s+='</g></g>';
  svg.innerHTML=s;
  svg.setAttribute("viewBox",FIGVB);
  // Zweiter Durchlauf: Flächen mit einer Feinaufteilung (Brust, Schulter) werden anhand ihrer
  // jetzt tatsächlich im DOM stehenden Geometrie in einzelne Teilflächen zerlegt (siehe
  // SPLIT_MASKS/splitMaskPath) – muss nach dem innerHTML-Aufbau laufen, damit getBBox()/
  // getPointAtLength() echte Werte liefern.
  Array.prototype.forEach.call(svg.querySelectorAll(".msklayer > .msk[data-mk]"),function(pth){
    var mid=pth.getAttribute("data-mk");
    if(MASK_CUT[mid]!=null)cutMaskTop(pth,MASK_CUT[mid]);
    if(MASK_HOLE[mid])holeMask(pth,MASK_HOLE[mid]);
    var def=splitDefFor(mid);
    if(def)splitMaskPath(pth,def,ms,dim,paint);
  });
  if(paint)return;   // Übungs-/Fokusfiguren sind reine Anzeige: nicht antippbar, kein Zoom
  attachMaskHandlers(svg);
  var newG=svg.querySelector(".figzoom");
  void newG.getBoundingClientRect(); // Reflow erzwingen, damit die Transition greift
  applyFigureZoom(svg);
}

// Zoomt sanft auf den ausgewählten Bereich, damit man Details besser erkennt. Fehlt die
// Auswahl in dieser Ansicht (z. B. Brust nur vorne), bleibt die Ansicht im Vollbild.
function applyFigureZoom(svg){
  var g=svg.querySelector(".figzoom");if(!g)return;
  var sels=svg.querySelectorAll(".msk.sel");
  if(!sels.length){g.setAttribute("transform","translate(0,0) scale(1)");return;}
  var x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  Array.prototype.forEach.call(sels,function(p){
    try{
      var ox=parseFloat(p.getAttribute("data-ox"))||0,oy=parseFloat(p.getAttribute("data-oy"))||0;
      // Eine aufgeteilte Teilfläche (Brust-Band, Schulterkopf) ist per clip-path beschnitten;
      // getBBox() ignoriert das und würde die volle (unbeschnittene) Fläche liefern. Für einen
      // treffenden Zoom nehmen wir dann die beim Aufteilen gemerkte, tatsächlich sichtbare Box.
      var cb=p.getAttribute("data-clip"),b;
      if(cb){var pr=cb.split(",").map(Number);b={x:pr[0],y:pr[1],width:pr[2],height:pr[3]};}
      else b=p.getBBox();
      x0=Math.min(x0,b.x+ox);y0=Math.min(y0,b.y+oy);
      x1=Math.max(x1,b.x+b.width+ox);y1=Math.max(y1,b.y+b.height+oy);
    }catch(e){}
  });
  if(!isFinite(x0)){g.setAttribute("transform","translate(0,0) scale(1)");return;}
  var pad=0.35,bw=x1-x0,bh=y1-y0,cx=x0+bw/2,cy=y0+bh/2;
  bw*= (1+pad);bh*=(1+pad);
  var scale=Math.min(FIGW/Math.max(bw,1),FIGH/Math.max(bh,1));
  scale=clamp(scale,1,2.6);
  var tx=FIGW/2-scale*cx, ty=FIGH/2-scale*cy;
  g.setAttribute("transform","translate("+tx+","+ty+") scale("+scale+")");
}

/* Erklaert am konkreten Muskel, was ein weiterer Satz noch bringt. Genau das ist die
   Frage, die eine Satzzahl allein nicht beantwortet. */
function reizBlock(v,m){
  var r=reizPct(v,m),mg=reizMarginal(v),nx=reizNextStep(v),
      dbl=Math.round((Math.sqrt(2)-1)*100);
  return '<div class="dim">Reiz '+r+' % vom Optimum · nächster Satz bringt noch '+
    Math.round(mg*100)+' % von dem, was dein erster bringt</div>'+
    '<div class="dim" style="margin-top:3px">Für einen nachweisbaren Unterschied bräuchtest du ab hier rund '+
    String(nx).replace(".",",")+' Sätze/Woche mehr. Doppelte Satzzahl heißt +'+dbl+' % Reiz, nicht +100 %.</div>';
}

/* Der Detailblock eines einzelnen Muskels - einmal gebaut, an zwei Stellen benutzt: als
   ganzer Kasten (Auswahl ueber Liste oder Figur) und aufgeklappt unter einer Gruppenkarte. */
function muscleDetail(fk,ms,compact){
  var f2=FINE[fk],m2=muscleById(f2.g),wrap=el("div","mdetailblock");
  if(!m2)return wrap;
  var emList=(EMPH[fk]||[]).map(function(id){var e=exById(id);return e?e.n:null;}).filter(Boolean);
  var hits=(emList.length?emList:EX.filter(function(e){return e.t!=="cardio"&&!e.mob&&((e.p||[]).indexOf(f2.g)>=0);}).map(function(e){return e.n;})).slice(0,3);
  var recH=m2.rec||36,c2=corr(m2),angepasst=volFactor(m2.id)!==1;
  var rv=recoveryOf(m2);
  // Der eigene Schnitt macht die Entscheidung ueber den Korridor ueberpruefbar: man sieht,
  // was man tatsaechlich ueber laengere Zeit gemacht hat, statt nur den Literaturwert.
  var avg8=Math.round((muscleSets(TODAY,56)[m2.id]||0)/8*10)/10;
  var full=!rv||rv.pct>=100;
  var recCol=full?"var(--accent)":"var(--warn)";
  var recTxt=!rv?"seit mindestens drei Wochen nicht belastet"
    :(full?"vollständig erholt · zuletzt "+humanSince(rv.h)+" belastet"
          :"noch "+Math.max(1,Math.round(rv.left))+" Std. · zuletzt "+humanSince(rv.h)+" belastet");
  var recNote=rv?("Richtwert "+recH+" Std., für "+String(Math.round(rv.dose*10)/10).replace(".",",")+
    " Sätze in der Einheit auf "+Math.round(rv.rec)+" Std. angepasst"):("Richtwert "+recH+" Std.");
  wrap.innerHTML=(compact?'<div class="mdname">'+f2.la+'<span>'+f2.de+'</span></div>'
                         :'<b>'+f2.la+'</b><span class="de">'+f2.de+'</span>')+
    '<div class="mdblock"><div class="mdlab">Erholung</div>'+
      '<div class="recrow"><div class="recbar"><i style="width:'+(rv?Math.round(rv.pct):100)+
        '%;background:'+recCol+'"></i></div>'+
        '<span class="recval" style="color:'+recCol+'">'+(rv?Math.round(rv.pct):100)+' %</span></div>'+
      '<div class="dim" style="margin-top:5px">'+recTxt+'</div>'+
      '<div class="dim" style="margin-top:2px">'+recNote+'</div></div>'+
    '<div class="mdblock"><div class="mdlab">Korridor · Sätze pro Woche</div>'+
      '<div class="kchips">'+
        '<span class="kchip" style="--c:'+volColor(c2.mev,m2)+'"><em>Minimum</em><b>'+c2.mev+'</b></span>'+
        '<span class="kchip" style="--c:'+volColor(c2.mav,m2)+'"><em>Optimum</em><b>'+c2.mav+'</b></span>'+
        '<span class="kchip" style="--c:'+volStops()[4]+'"><em>Grenze</em><b>'+c2.mrv+'</b></span>'+
      '</div>'+
      '<div class="dim" style="margin-top:6px">Dein Schnitt der letzten 8 Wochen: '+
        String(avg8).replace(".",",")+' Sätze/Woche'+
        (angepasst?' · Korridor von dir angepasst':'')+'</div></div>'+
    '<div class="mdblock"><div class="mdlab">Was noch mehr bringt</div>'+
      reizBlock(ms[m2.id]||0,m2)+'</div>'+
    (hits.length?'<div class="dim" style="margin-top:10px">Beispiele: '+hits.join(", ")+'</div>':'');
  wrap.appendChild(volField(m2));
  return wrap;
}

function renderBody(ms){
  fw3dSyncColors(ms);
  renderRegionChips();
  placeCallout(ms);
  updateVolLegend(ms);
  var box=$("mdetail");
  var _bb=backBar();
  box.innerHTML="";
  if(selFine&&FINE[selFine]){
    if(_bb)box.appendChild(_bb);
    box.appendChild(muscleDetail(selFine,ms,true));
  } else if(selSet){
    var ids=[];selSet.forEach(function(k){var g=FINE[k].g;if(ids.indexOf(g)<0)ids.push(g);});
    if(_bb)box.appendChild(_bb);
    box.appendChild(el("b",null,selLabel));
    box.appendChild(el("span","de",ids.length===1?"Antippen für Details"
      :ids.length+" Gruppen · antippen für Details"));
    /* Auswahl ersetzt die Liste nicht mehr, sie klappt darunter auf. Vorher sprang man mit
       jedem Tipp eine Ebene tiefer und verlor die Nachbarn aus dem Blick - gerade beim
       Vergleichen ("welcher der vier ist der schwaechste?") war das hinderlich. */
    ids.forEach(function(id){
      var mm=muscleById(id);if(!mm)return;
      var vv=Math.round((ms[id]||0)*10)/10;
      var keys=selSet.filter(function(k){return FINE[k].g===id;});
      var open=(expGroup===id);
      // Der tiefe Rueckenstrecker allein hat 17 Feinmuskeln - vollstaendig ausgeschrieben
      // sprengt das die Karte. Drei Namen reichen zur Einordnung, der Rest wird gezaehlt.
      var las=keys.map(function(k){return FINE[k].la;}),
          sub=las.slice(0,3).join(" · ")+(las.length>3?" · +"+(las.length-3)+" weitere":"");
      var card=el("button","gcard"+(open?" open":""));card.type="button";
      card.setAttribute("aria-expanded",String(open));
      card.appendChild(volRowMain(mm.name,vv,mm,sub));
      card.onclick=function(ev){
        ev.stopPropagation();
        expGroup=open?null:id;expFine=null;
        renderBodySel();
      };
      box.appendChild(card);
      if(!open)return;
      var panel=el("div","gpanel");
      if(keys.length>1){
        var fc=el("div","finechips");
        keys.forEach(function(k){
          var bt=el("button",null,FINE[k].la);bt.type="button";bt.title=FINE[k].de||"";
          bt.setAttribute("aria-pressed",String(expFine===k));
          bt.onclick=function(ev){ev.stopPropagation();
            expFine=(expFine===k?null:k);renderBodySel();};
          fc.appendChild(bt);
        });
        panel.appendChild(fc);
      }
      // Eine Gruppe mit genau einem Feinmuskel zeigt ihr Detail sofort - eine Chip-Reihe
      // mit einem einzigen Chip waere ein Klick ohne Information.
      var fk=keys.length===1?keys[0]:expFine;
      if(fk)panel.appendChild(muscleDetail(fk,ms,keys.length>1));
      box.appendChild(panel);
    });
  } else box.innerHTML='Tipp einen Muskel an – oder oben eine Region wie „Brust“, dann werden alle zugehörigen Muskeln markiert.';
}

/* Arme und Beine waren als Sammelgruppen zu grob: "Arme" hat Bizeps, Trizeps und Unterarme
   in eine Kachel geworfen, obwohl man sie getrennt plant und getrennt anschaut. Jetzt ist
   jede trainierbare Einheit ihre eigene Gruppe - dadurch zeigt auch jede Kachel genau die
   Stelle, um die es geht. */
var REGIONS=[
 {name:"Brust",ids:["tg_brust_ober","tg_brust_mitte","tg_brust_unten","tg_brust_serratus"]},
 {name:"Schultern",ids:["tg_schulter_vorn","tg_schulter_seit","tg_schulter_hint","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_schulter_rot_sub","tg_schulter_rot_supra"]},
 {name:"Rücken",ids:["tg_rueck_lat","tg_rueck_teres_major","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_rueck_rhomb"]},
 // Der Rueckenstrecker steht eigenstaendig: er wird ueber ganz andere Uebungen belastet
 // (Kreuzheben, Hyperextension, Good Morning) als die ziehenden Rueckenmuskeln daneben.
 {name:"Rückenstrecker",ids:["tg_rueck_strecker"]},
 // Der Brachialis steht unter dem Bizeps - in derselben Region, aber als eigene Gruppe:
 // beim Antippen von "Bizeps" erscheint er als eigene Karte darunter.
 {name:"Bizeps",ids:["tg_bizeps","tg_brachialis"]},
 {name:"Trizeps",ids:["tg_trizeps_lang","tg_trizeps_lat"]},
 {name:"Unterarme",ids:["tg_unterarm_beug","tg_unterarm_streck"]},
 // Der Hueftbeuger (M. iliacus, M. psoas major, M. sartorius) sitzt hier statt bei den
 // Beinen: der Psoas entspringt an den Lendenwirbeln und ist damit anatomisch ein tiefer
 // Rumpfmuskel, und trainiert wird er ueber Uebungen, die man ohnehin als Bauchtraining
 // fuehrt - Beinheben, Knieheben im Hang.
 {name:"Rumpf",ids:["tg_bauch_gerade","tg_bauch_schraeg","tg_bauch_tief","tg_huefte"]},
 {name:"Gesäß",ids:["tg_gesaess_haupt","tg_gesaess_med","tg_gesaess_min"]},
 {name:"Quadrizeps",ids:["tg_quadrizeps"]},
 {name:"Beinbeuger",ids:["tg_kniesehnen"]},
 {name:"Adduktoren",ids:["tg_adduktoren"]},
 {name:"Waden",ids:["tg_wade_gastro","tg_wade_soleus","tg_wade_fussheber"]},
 {name:"Hals",ids:["tg_hals_nacken"]},
 {name:"Nacken",ids:["tg_nacken","tg_rueck_trapez_ob"]}
];


// Cardio ist keine Muskelregion, sondern ein Übungstyp - bekommt trotzdem eine eigene
// Kachel im Entdecken-Tab. Absichtlich NICHT Teil von REGIONS: sonst würde "Cardio" auch
// in Werte/Körper als trainierbare Muskelgruppe auftauchen, wo es nicht hingehört.
// Die ids sind die Vereinigung aller Muskeln, die irgendeine Cardio-Übung referenziert -
// darüber funktionieren Feinfilter-Chips (z.B. "Rücken" -> Rudergerät/Schwimmen) genau wie
// bei echten Regionen, ganz ohne eigenen Filter-Code.
var CARDIO_REGION={name:"Cardio",cardio:true,
  ids:["tg_quadrizeps","tg_wade_gastro","tg_gesaess_haupt","tg_kniesehnen","tg_wade_fussheber",
       "tg_rueck_lat","tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_teres_major",
       "tg_schulter_vorn","tg_brust_mitte","tg_bauch_gerade","tg_bizeps"]}
;


// Mobilitaet bekommt aus demselben Grund wie Cardio eine eigene Kachel: es ist kein
// Koerperteil, sondern eine Art zu trainieren. Gefiltert wird ueber ex.mob und die gewaehlte
// Art (statisch/dynamisch), nicht ueber Muskeln - deshalb bleibt die Liste hier leer.
var MOB_REGION={name:"Mobilität",mobility:true,ids:[]}
;

/* ================= Entdecken (Übungskatalog zum Durchstöbern) ================= */
// Eigener Tab: Muskelgruppen-Kacheln (jede mit einer Körperfigur, bei der die ganze Region
// hervorgehoben ist) zum Filtern, darunter eine Kartenliste aller Übungen – jede Karte mit
// einer kleinen Figur, die zeigt, welche Muskeln sie trainiert (Vorderansicht reicht fürs
// schnelle Durchstöbern; Details/Rückansicht gibt's weiter per Tap im Übungskatalog-Sheet).
// discMk: bei der Mobilitaets-Kachel steht hier "stat" oder "dyn" statt eines Muskels -
// die beiden Arten schliessen sich gegenseitig aus, deshalb ein eigener Zustand.
var discRegion=null,
 discQuery="",
 discFine=null,
 discMk=null,
 discObserver=null,
 discEquip=[];

// Die beiden Arten von Mobilitaetsarbeit. null = beide zusammen.
var MOB_KINDS=[[null,"Alles"],["stat","Statisch"],["dyn","Dynamisch"]];

function mobKindLabel(mk){return mk==="dyn"?"Dynamisch":mk==="stat"?"Statisch":"";}

function regionInvolve(region){
  var inv={};region.ids.forEach(function(id){inv[id]=1;});
  return inv;
}

// Regionen, deren Muskeln überwiegend/ganz auf der Rückseite liegen, sollen als
// Rückansicht dargestellt werden – von vorn wären sie auf der Figur nicht zu sehen.
var REGION_VIEW={"Rücken":"back","Rückenstrecker":"back","Gesäß":"back","Nacken":"back",
                 "Trizeps":"back","Beinbeuger":"back","Waden":"back"}
;

/* Die Gruppenkacheln zeigten bisher die ganze Figur in voller Hoehe - die markierte Stelle
   war dadurch winzig, bei den Waden praktisch nicht zu erkennen. Jetzt wird in jede Kachel
   ein Ausschnitt gleicher Groesse gelegt, zentriert auf die markierte (rote) Flaeche.
   Die Lage wird aus dem fertigen Bild gemessen statt in einer Tabelle gepflegt: eine neue
   oder umbenannte Gruppe bekommt damit automatisch den richtigen Ausschnitt. */
var CROP_W=200,
 CROP_H=250,
 SNAP_W=260,
 SNAP_H=520;

var regionCropCache={}
;

function cropBox(cx,cy){
  var x=clamp(cx*SNAP_W-CROP_W/2,0,SNAP_W-CROP_W),
      y=clamp(cy*SNAP_H-CROP_H/2,0,SNAP_H-CROP_H);
  return x+" "+y+" "+CROP_W+" "+CROP_H;
}

var CROP_DEFAULT=cropBox(0.5,0.42);

// Schwerpunkt der markierten Flaeche. Gemessen wird auf einem stark verkleinerten Abzug -
// fuer die Mitte eines Bereichs reicht das und kostet praktisch nichts.
function fw3dHotCenter(url,cb){
  var img=new Image();
  img.onload=function(){
    try{
      var W=64,H=128,cv=document.createElement("canvas");cv.width=W;cv.height=H;
      var ctx=cv.getContext("2d",{willReadFrequently:true});
      ctx.drawImage(img,0,0,W,H);
      var d=ctx.getImageData(0,0,W,H).data,x0=W,y0=H,x1=-1,y1=-1,x,y,i;
      for(y=0;y<H;y++)for(x=0;x<W;x++){
        i=(y*W+x)*4;
        if(d[i+3]>40&&d[i]>110&&d[i]>d[i+1]+45&&d[i]>d[i+2]+45){
          if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
      }
      cb(x1<0?null:[(x0+x1+1)/2/W,(y0+y1+1)/2/H]);
    }catch(e){cb(null);}
  };
  img.onerror=function(){cb(null);};
  img.src=url;
}

var regionFigCache={}
;

/* Das fertige Standbild je Region wird gemerkt. Vorher hing jede Kachel und jede Listenzeile
   an der Standbild-Warteschlange: die Liste wird bei jedem Tipp neu aufgebaut, dabei entstehen
   15 neue SVGs, die 15 neue Auftraege stellen - und die alten, noch laufenden Auftraege
   schreiben danach in Elemente, die es nicht mehr gibt. Die Warteschlange kam so nie zur Ruhe.
   Jetzt wird ein Bild genau einmal gerendert; alle spaeteren Zeilen bekommen es sofort, und
   mehrere Wartende auf dasselbe Bild teilen sich EINEN Auftrag. */
var regionFigUrl={}
, regionFigWait={}
;

function fw3dPutImage(svg,url,crop){
  try{
    svg.innerHTML="";
    svg.setAttribute("viewBox",crop||"0 0 260 520");
    svg.setAttribute("preserveAspectRatio","xMidYMid meet");
    var im=document.createElementNS("http://www.w3.org/2000/svg","image");
    im.setAttribute("x","0");im.setAttribute("y","0");
    im.setAttribute("width","260");im.setAttribute("height","520");
    im.setAttribute("preserveAspectRatio","xMidYMid meet");
    im.setAttribute("href",url);
    im.setAttributeNS("http://www.w3.org/1999/xlink","href",url);
    svg.appendChild(im);
  }catch(e){}
}

function fillRegionFig(svg){
  if(svg.getAttribute("data-filled"))return;
  var name=svg.getAttribute("data-region"),region=REGIONS.find(function(r){return (r.key||r.name)===name;});
  if(!region)return;
  svg.setAttribute("data-filled","1");
  var crop=regionCropCache[name]||CROP_DEFAULT;
  svg.setAttribute("data-crop",crop);
  if(regionFigUrl[name]){fw3dPutImage(svg,regionFigUrl[name],crop);return;}
  if(regionFigWait[name]){regionFigWait[name].push(svg);return;}
  regionFigWait[name]=[svg];
  var view=REGION_VIEW[name]||"front",inv=regionInvolve(region);
  var cols=fw3dColorsForInvolve(inv,null),ft=fw3dForceTransparentForInv(inv,null,null);
  // Schluessel exakt wie in fw3dSnapInto, damit beide denselben Zwischenspeicher nutzen.
  fw3dSnapRequest("rg:"+name+"|"+view+(ft?"|ft":""),cols,view,function(url){
    regionFigUrl[name]=url;
    var waiting=regionFigWait[name]||[];regionFigWait[name]=null;
    function paintAll(){
      var cr=regionCropCache[name]||CROP_DEFAULT;
      waiting.forEach(function(s){if(s&&s.parentNode)fw3dPutImage(s,url,cr);});
      document.querySelectorAll('svg[data-region="'+name+'"]').forEach(function(s){
        s.setAttribute("data-crop",cr);
        if(s.querySelector("image"))s.setAttribute("viewBox",cr);
      });
    }
    if(regionCropCache[name]){paintAll();return;}
    // Ausschnitt einmal aus dem fertigen Bild messen - kein Warte-Ticker mehr noetig.
    fw3dHotCenter(url,function(c){
      if(c)regionCropCache[name]=cropBox(c[0],c[1]);
      paintAll();
    });
  },false,ft);
}

// Figuren erst füllen, wenn die Karte wirklich im sichtbaren Bereich ist – bei 150+ Übungen
// spart das beim Öffnen des Tabs unnötiges Rendern weit außerhalb des Bildschirms.
function discLazyObserve(root){
  if(!discObserver){
    discObserver=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting)return;
        var svg=en.target;
        if(svg.hasAttribute("data-region"))fillRegionFig(svg);else fillExFig(svg);
        discObserver.unobserve(svg);
      });
    },{rootMargin:"200px"});
  }
  Array.prototype.forEach.call(root.querySelectorAll("svg[data-ex],svg[data-region]"),function(svg){discObserver.observe(svg);});
}

function renderDiscEquipChips(){
  var btn=$("disc-filterbtn");if(!btn)return;
  if(!btn.dataset.init){
    btn.innerHTML=svgIcon(IC_FILTER,1.8)+'<span class="badge" hidden></span>';
    btn.dataset.init="1";
  }
  var badge=btn.querySelector(".badge");
  badge.hidden=!discEquip.length;
  if(discEquip.length)badge.textContent=String(discEquip.length);
  btn.setAttribute("data-active",String(!!discEquip.length));
  btn.onclick=function(){
    openEquipFilterMenu(discEquip,function(){renderDiscExGrid();renderDiscEquipChips();},function(){return discExList().length;});
  };
}

function discExList(){
  var q=discQuery.trim().toLowerCase();
  var cardioMode=!!(discRegion&&discRegion.cardio);
  var mobMode=!!(discRegion&&discRegion.mobility);
  // Bei Mobilitaet wird nicht nach Muskeln gefiltert (fast jede Dehnung trifft mehrere
  // Regionen), sondern ueber ex.mob und die gewaehlte Art.
  var ids=mobMode?null:(discFine?[discFine]:(discRegion?discRegion.ids:null));
  return EX.filter(function(e){
    if(mobMode){if(!e.mob)return false;if(discMk&&e.mk!==discMk)return false;}
    else if(e.mob)return false;
    else if(cardioMode){if(e.t!=="cardio")return false;}
    else if(e.t==="cardio")return false;
    if(q&&e.n.toLowerCase().indexOf(q)<0&&(e.e||"").toLowerCase().indexOf(q)<0)return false;
    if(discEquip.length&&discEquip.indexOf(e.e)<0)return false;
    if(ids&&!exHits(e,ids))return false;
    return true;
  });
}

// Laufband-Bild fuer die Cardio-Kachel: neues Referenzbild des Nutzers. Es kam bereits mit
// Transparenz, hatte aber einen halbtransparenten Schleier rund um das Geraet - der faellt auf
// dunklem Grund als grauer Hof auf. Darum harte Kante (Alpha unter 90 raus, Rest voll deckend),
// auf den Inhalt zugeschnitten und auf 256 Farben reduziert: sieht bei Kachelgroesse identisch
// aus, braucht aber ein Drittel des Platzes des vorherigen Bildes.
var CARDIO_ICON_B64="__DATEN_ENTFERNT__base64__28040_ZEICHEN__";

function cardioTreadmillIcon(){
  var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
  // Gleiches Seitenverhaeltnis wie CROP_W/CROP_H (200x250), damit die Kachel genau so hoch
  // wird wie alle anderen Muskel-Kacheln im Raster.
  sv.setAttribute("viewBox","0 0 200 250");
  sv.setAttribute("role","img");sv.setAttribute("aria-label","Cardio");
  var im=document.createElementNS("http://www.w3.org/2000/svg","image");
  // Bild ist 400x379 - komplett ohne Beschnitt einpassen, damit nichts vom Laufband
  // (Konsole, Griffe, Standfuss) abgeschnitten wird.
  // Skalierung = min(200/400, 250/379) = 0.5 -> Breite 200, Hoehe 189,5, Rand oben/unten 30,25.
  im.setAttribute("x","0");im.setAttribute("y","30.25");
  im.setAttribute("width","200");im.setAttribute("height","189.5");
  im.setAttribute("preserveAspectRatio","xMidYMid meet");
  im.setAttribute("href","data:image/png;base64,"+CARDIO_ICON_B64);
  im.setAttributeNS("http://www.w3.org/1999/xlink","href","data:image/png;base64,"+CARDIO_ICON_B64);
  sv.appendChild(im);
  return sv;
}

// Bild der Mobilitaets-Kachel: das vom Nutzer vorgegebene Foto eines Gummibandsatzes.
// Vorgehen wie beim Laufband, damit die beiden Sonderkacheln zusammenpassen: Hintergrund
// freigestellt (die zusammenhaengende helle Flaeche vom Rand her entfernt, danach den Saum
// um zwei Pixel abgetragen - sonst bleibt auf dunklem Grund ein heller Hof stehen), auf den
// Inhalt zugeschnitten, auf 340 Pixel Breite verkleinert, 128 Farben.
var MOB_ICON_B64="__DATEN_ENTFERNT__base64__78440_ZEICHEN__";

function mobBandIcon(){
  var NS="http://www.w3.org/2000/svg";
  var sv=document.createElementNS(NS,"svg");
  // Gleiches Seitenverhaeltnis wie die uebrigen Kacheln (200x250).
  sv.setAttribute("viewBox","0 0 200 250");
  sv.setAttribute("role","img");sv.setAttribute("aria-label","Mobilität");
  var im=document.createElementNS(NS,"image");
  // Bild ist 340x342 - vollstaendig einpassen, nichts abschneiden.
  // Skalierung = min(200/340, 250/342) = 0,588 -> Breite 200, Hoehe 201,2, Rand oben/unten 24,4.
  im.setAttribute("x","0");im.setAttribute("y","24.4");
  im.setAttribute("width","200");im.setAttribute("height","201.2");
  im.setAttribute("preserveAspectRatio","xMidYMid meet");
  im.setAttribute("href","data:image/png;base64,"+MOB_ICON_B64);
  im.setAttributeNS("http://www.w3.org/1999/xlink","href","data:image/png;base64,"+MOB_ICON_B64);
  sv.appendChild(im);
  return sv;
}

function renderDiscMuscleGrid(){
  var mgrid=$("disc-mgrid");mgrid.innerHTML="";
  REGIONS.concat([CARDIO_REGION,MOB_REGION]).forEach(function(rg){
    var card=el("button","disc-mcard");card.type="button";
    card.setAttribute("aria-pressed",String(discRegion===rg));
    if(rg.cardio){
      card.appendChild(cardioTreadmillIcon());
    }else if(rg.mobility){
      card.appendChild(mobBandIcon());
    }else{
      var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
      sv.setAttribute("viewBox",regionCropCache[rg.key||rg.name]||CROP_DEFAULT);
      sv.setAttribute("data-region",rg.key||rg.name);
      sv.setAttribute("role","img");sv.setAttribute("aria-label",rg.name);
      card.appendChild(sv);
    }
    card.appendChild(el("span",null,rg.name));
    card.onclick=function(){discRegion=(discRegion===rg?null:rg);discFine=null;discMk=null;renderDiscMuscleGrid();renderDiscSubChips();renderDiscExGrid();};
    mgrid.appendChild(card);
  });
  discLazyObserve(mgrid);
}

// Feinfilter: nach Wahl einer Muskelgruppe erscheinen darunter Chips für ihre Einzelmuskeln
// (z.B. Brust → Obere/Mittlere/Untere Brust), damit man gezielter als nach grober Region suchen kann.
function renderDiscSubChips(){
  var sub=$("disc-subchips");sub.innerHTML="";sub.hidden=!discRegion;
  if(!discRegion)return;
  // Unter der Mobilitaets-Kachel stehen keine Einzelmuskeln, sondern die zwei Arten:
  // gehalten (Dehnen) und bewegt (Mobilisieren). Das ist der eigentliche Unterschied -
  // nach Muskeln sortiert waere hier fast jede Uebung ueberall dabei.
  if(discRegion.mobility){
    MOB_KINDS.forEach(function(k){
      var c=el("button","fchip",k[1]);c.type="button";
      c.setAttribute("aria-pressed",String(discMk===k[0]));
      c.onclick=function(){discMk=k[0];renderDiscSubChips();renderDiscExGrid();};
      sub.appendChild(c);
    });
    centerChip(sub);
    return;
  }
  var all=el("button","fchip","Ganze Region");all.type="button";all.setAttribute("aria-pressed",String(!discFine));
  all.onclick=function(){discFine=null;renderDiscSubChips();renderDiscExGrid();};
  sub.appendChild(all);
  discRegion.ids.forEach(function(id){
    var m=muscleById(id);if(!m)return;
    var c=el("button","fchip",m.name);c.type="button";c.setAttribute("aria-pressed",String(discFine===id));
    c.onclick=function(){discFine=id;renderDiscSubChips();renderDiscExGrid();};
    sub.appendChild(c);
  });
  centerChip(sub);
}

// Grobe Region(en) der Primärmuskeln einer Übung – als unauffällige Unterzeile unter dem
// Namen, damit man auf einen Blick sieht, worauf die Übung hauptsächlich zielt.
function exPrimaryRegionLabel(ex){
  var names=[];
  (ex.p||[]).forEach(function(id){
    var rg=REGIONS.find(function(r){return r.ids.indexOf(id)>=0;});
    if(rg&&names.indexOf(rg.name)<0)names.push(rg.name);
  });
  return names.join(" · ");
}

function discExCard(ex,onPick,onDelete){
  var card=el("div","disc-excard tap");
  var thumbs=el("div","disc-thumbs");
  [["front","Vorderansicht"],["back","Rückansicht"]].forEach(function(vv){
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",vv[0]);
    sv.setAttribute("role","img");sv.setAttribute("aria-label",vv[1]+", beanspruchte Muskeln, "+ex.n);
    var thumb=el("div","disc-thumb");thumb.appendChild(sv);
    thumbs.appendChild(thumb);
  });
  card.appendChild(thumbs);
  card.appendChild(el("b",null,ex.n));
  card.appendChild(el("span","disc-muscle",exPrimaryRegionLabel(ex)));
  if(onPick){
    // In der Auswahl ist Auswaehlen die Hauptsache, im Entdecken-Tab das Nachschlagen.
    // Deshalb waehlt hier die Karte aus, und die Details liegen auf dem "i" daneben.
    card.onclick=function(){onPick(ex);};
    if(onPick!==sheetExerciseDetail){
      var info=el("button","iconbtn disc-cardbtn info");info.type="button";
      info.setAttribute("aria-label","Details zu "+ex.n);
      info.innerHTML=svgIcon(IC_INFO,1.9);
      info.onclick=function(ev){ev.stopPropagation();sheetExerciseDetail(ex);};
      card.appendChild(info);
    }
    if(ex.custom&&onDelete){
      var del=el("button","iconbtn disc-cardbtn del");del.type="button";
      del.setAttribute("aria-label","Übung löschen");del.innerHTML=svgIcon(IC_TRASH,1.6);
      del.onclick=function(ev){
        ev.stopPropagation();
        if(customExInUse(ex.id)){toast("Schon verwendet – kann nicht gelöscht werden");return;}
        askConfirm("Übung löschen?","„"+ex.n+"“ wird aus deinem Übungskatalog entfernt.","Löschen",
          function(){removeCustomExercise(ex.id);onDelete();},true);
      };
      card.appendChild(del);
    }
  }else{
    card.onclick=function(){sheetExerciseDetail(ex);};
  }
  return card;
}

function renderDiscExGrid(){
  var exgrid=$("disc-exgrid");exgrid.innerHTML="";
  var name=discFine?muscleById(discFine).name:(discRegion?discRegion.name:null);
  if(discRegion&&discRegion.mobility&&discMk)name=discRegion.name+" · "+mobKindLabel(discMk);
  $("disc-exheading").textContent=name||"Alle Übungen";
  var list=discExList();
  if(!list.length){exgrid.appendChild(el("div","empty","Nichts gefunden."));return;}
  var ids=(discRegion&&discRegion.mobility)?null:(discFine?[discFine]:(discRegion?discRegion.ids:null));
  if(!ids){list.forEach(function(ex){exgrid.appendChild(discExCard(ex));});discLazyObserve(exgrid);return;}
  // Bei aktivem Muskel-/Regionsfilter zuerst die Übungen mit starkem Fokus zeigen (Primärmuskel
  // trifft), danach die, die den Bereich nur mittrainieren – sonst müsste man sich die relevanten
  // Übungen aus der ungeordneten Liste heraussuchen.
  var pri=list.filter(function(e){return exHits(e,ids)>=1;});
  var sec=list.filter(function(e){return exHits(e,ids)<1;});
  // Innerhalb jeder Gruppe absteigend nach tatsaechlicher Staerke sortieren, damit die Uebung
  // mit dem hoechsten Anteil fuer den gewaehlten Muskel ganz oben steht.
  pri.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
  sec.sort(function(a,b){return exFocusScore(b,ids)-exFocusScore(a,ids);});
  if(pri.length){
    var lab1=el("div","grouplab","Starker Fokus · "+name);
    exgrid.appendChild(lab1);
    pri.forEach(function(ex){exgrid.appendChild(discExCard(ex));});
  }
  if(sec.length){
    var lab2=el("div","grouplab","Wird mittrainiert");
    exgrid.appendChild(lab2);
    sec.forEach(function(ex){exgrid.appendChild(discExCard(ex));});
  }
  discLazyObserve(exgrid);
}

function renderEntdecken(){renderDiscMuscleGrid();renderDiscEquipChips();renderDiscSubChips();renderDiscExGrid();}

/* Ziehharmonika: immer nur eine Region offen, und darin immer nur eine Untergruppe.
   Statt einer Menge offener Namen wird deshalb nur der jeweils offene gemerkt - damit
   kann gar kein Zustand entstehen, in dem zwei gleichzeitig offen sind. */
var openRegion=null,
 openSub=null;

/* Untergliederung der Regionen. Ueberschriften bleiben deutsch, die Muskeln darunter
   werden lateinisch benannt. Regionen ohne Eintrag haben nur eine Ebene. */
/* Untergruppen gab es nur, weil "Arme" und "Beine" zu grosse Toepfe waren. Seit jede
   Einheit eine eigene Gruppe ist, braucht es die Zwischenebene nicht mehr. */
var SUBREGIONS={}
;

function subsOf(rg){return SUBREGIONS[rg.name]||[{name:null,ids:rg.ids}];}

/* Ein Bauplan fuer alle Muskel-/Gruppenzeilen: Name und Reiz oben, darunter der Balken mit
   der Korridorschiene, darunter Saetze und Status. Vorher gab es dafuer zwei Stellen mit
   unterschiedlicher Darstellung - im Detailkasten eine Pille mit Zahl, in der Liste ein
   Balken. Dasselbe soll ueberall gleich aussehen. */
/* Zeitpunkt der letzten Belastung eines Muskels. Aeltere Eintraege haben keinen Zeitstempel -
   fuer die faellt die Rechnung auf den fruehen Abend dieses Tages zurueck, weil ein exakter
   Nullpunkt dort nicht mehr rekonstruierbar ist. */
function lastLoad(gid){
  var bestDay=null,best=null,from=shiftDays(TODAY,-21);
  for(var d in state.days){
    if(d<from)continue;
    (state.days[d].sets||[]).forEach(function(s){
      var ex=exById(s.ex);if(!ex||ex.mob||ex.t==="cardio")return;
      var w=exSetWeights(ex);
      if(!(w[gid]>0))return;
      var t=s.ts;
      if(!t){var p=d.split("-");t=new Date(+p[0],+p[1]-1,+p[2],18,0,0).getTime();}
      if(best==null||t>best){best=t;bestDay=d;}
    });
  }
  if(best==null)return null;
  // Dosis der letzten Einheit - dieselbe Rechnung wie beim Wochenvolumen, inklusive
  // Trefferanteil der Uebung und Reserve: zwei lockere Nebensaetze sind eben nicht dasselbe
  // wie sechs harte Saetze.
  var dose=0;
  (state.days[bestDay].sets||[]).forEach(function(s){
    var ex=exById(s.ex);if(!ex||ex.mob||ex.t==="cardio")return;
    var w=exSetWeights(ex);
    if(w[gid]>0)dose+=w[gid]*rirFactor(s.rir);
  });
  return {ts:best,dose:dose};
}

/* Erholungsstand: wie weit der Muskel seit der letzten Belastung wieder da ist. "rec" ist ein
   grober Richtwert in Stunden, kein gemessener Wert - entsprechend grob ist auch die Anzeige. */
/* Die Erholungszeit haengt nicht nur vom Muskel ab, sondern davon, was man ihm zugemutet hat.
   Der Richtwert "rec" gilt fuer eine normale Einheit; das ist hier die halbe Optimum-Dosis,
   weil man das Wochenoptimum ueblicherweise auf etwa zwei Einheiten verteilt. Weniger als das
   verkuerzt die Erholung, mehr verlaengert sie - mit Wurzel, also gedaempft, denn Erholung
   skaliert nicht eins zu eins mit dem Volumen. Die Grenzen (0,4 bis 1,3) verhindern, dass ein
   einzelner Nebensatz die Zeit gegen null zieht oder eine Marathon-Einheit sie verdoppelt.
   Alle diese Zahlen sind Setzungen, keine Messwerte - "rec" ist es selbst schon. */
function recoveryDoseFactor(dose,m){
  var ref=Math.max(2,corr(m).mav/2);
  if(!(dose>0))return 0.4;
  return clamp(Math.sqrt(dose/ref),0.4,1.3);
}

function recoveryOf(m){
  var ll=lastLoad(m.id);
  if(!ll)return null;
  var base=m.rec||36,f=recoveryDoseFactor(ll.dose,m),rec=base*f;
  var h=(Date.now()-ll.ts)/3600000;
  return {h:h,rec:rec,base:base,dose:ll.dose,
          pct:clamp(h/rec*100,0,100),left:Math.max(0,rec-h)};
}

function humanSince(h){
  if(h<1)return "gerade eben";
  if(h<24)return "vor "+Math.round(h)+" Std.";
  var d=Math.round(h/24);
  return d===1?"vor 1 Tag":"vor "+d+" Tagen";
}

function volRowMain(title,v,m,subline){
  var cm=corr(m),z=zoneOf(v,m);
  function px(x){return clamp(reizOf(x,m)/REIZ_MAX*100,0,100);}
  var main=el("div","main"),top=el("div","mrow-top");
  top.appendChild(el("b",null,title));
  var val=el("span","mrow-val",String(reizPct(v,m)));val.appendChild(el("em",null,"%"));
  top.appendChild(val);main.appendChild(top);
  var tr=el("div","mtrack");
  tr.appendChild(el("div","tbg"));
  var fi=el("i","tfill");fi.style.width=px(v)+"%";fi.style.background=volColor(v,m);tr.appendChild(fi);
  var a=px(cm.mev),bn=px(cm.mrv);
  var rail=el("div","trail");rail.style.left=a+"%";rail.style.width=Math.max(0,bn-a)+"%";
  var notch=el("u");notch.style.left=(bn>a?(px(cm.mav)-a)/(bn-a)*100:0)+"%";
  rail.appendChild(notch);tr.appendChild(rail);main.appendChild(tr);
  var meta=el("div","mrow-meta");
  meta.appendChild(el("span",null,String(v).replace(".",",")+" Sätze · Ziel "+cm.mav));
  meta.appendChild(el("span","st "+zonePill(z),zoneLabel(z)));
  main.appendChild(meta);
  if(subline)main.appendChild(el("div","mrow-fines",subline));
  return main;
}

function scrollToBody(){
  var stg=document.querySelector(".bodystage");
  if(stg)stg.scrollIntoView({behavior:"smooth",block:"center"});
}

function fineKeysOfGroup(gid){var out=[];for(var k in FINE)if(FINE[k].g===gid)out.push(k);return out;}

function renderMuscleList(ms){
  var box=$("mlist");box.innerHTML="";
  function statsOf(ids){
    var groups=ids.map(function(id){return muscleById(id);}).filter(Boolean);
    var tot=0,ok=0,low=0,high=0,scoreSum=0,reizSum=0;
    groups.forEach(function(m){var v=ms[m.id]||0,z=zoneOf(v,m);tot+=v;scoreSum+=muscleScore(v,m);
      reizSum+=reizOf(v,m);
      if(z===1)ok++;else if(z===2)high++;else low++;});
    var n=groups.length||1;
    return {groups:groups,tot:tot,ok:ok,low:low,high:high,
            score:Math.round(scoreSum/n),reiz:reizSum/n};
  }
  function headRow(label,ids,open,cls,figName){
    var s=statsOf(ids);
    var r=el("div","row tap"+(cls?" "+cls:"")),main=el("div","main");
    if(figName){
      var fw=el("div","rfig");
      var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
      sv.setAttribute("viewBox",regionCropCache[figName]||CROP_DEFAULT);
      sv.setAttribute("data-region",figName);sv.setAttribute("aria-hidden","true");
      fw.appendChild(sv);r.appendChild(fw);
      fillRegionFig(sv);
    }
    main.appendChild(el("b",null,label));
    var bar=el("div","minibar");bar.style.marginTop="7px";
    var fi=el("i");fi.style.width=clamp(s.reiz/REIZ_MAX*100,0,100)+"%";
    fi.style.background=volColorScore(s.score,s.high>0);bar.appendChild(fi);
    var uo=el("u");uo.style.left=(1/REIZ_MAX*100)+"%";bar.appendChild(uo);
    main.appendChild(bar);
    // Bei einer Gruppe waere "1 von 1 Gruppen im Korridor" nur Fuellwerk - dann steht dort
    // direkt der Status.
    var sets1=String(Math.round(s.tot*10)/10).replace(".",",")+" Sätze";
    main.appendChild(el("span",null, s.groups.length===1
      ? zoneLabel(s.high?2:(s.ok?1:0))+" \u00b7 "+sets1
      : s.ok+" von "+s.groups.length+" Gruppen im Korridor \u00b7 "+sets1
        +(s.high?" \u00b7 "+s.high+" zu viel":"")+(s.low&&!s.ok?" \u00b7 alle zu wenig":"")));
    r.appendChild(main);
    var hv=el("div","val hval",String(Math.round(s.reiz*100)));
    hv.appendChild(el("em",null,"%"));
    r.appendChild(hv);
    var ch=el("span","chev");ch.innerHTML=svgIcon(open?"M5 9l7 7 7-7":IC_CHEV);r.appendChild(ch);
    return r;
  }
  function muscleRow(k){
    var f=FINE[k],m=muscleById(f.g);if(!m)return null;
    var v=Math.round((ms[f.g]||0)*10)/10,z=zoneOf(v,m),cm=corr(m);
    var row=el("div","row tap sub mrow");
    row.appendChild(volRowMain(f.la,v,m));
    row.onclick=function(ev){ev.stopPropagation();
      selReset();
      selFine=k;selSet=null;selLabel=null;selMuscle=f.g;selTapKey=null;
      renderBodySel();
      // "bodystage" ist eine Klasse, kein id - $() lieferte hier immer null und der Griff
      // ist beim Antippen eines Muskels jedes Mal in einen Fehler gelaufen (und es wurde
      // nie gescrollt).
      scrollToBody();};
    return row;
  }
  REGIONS.forEach(function(rg){
    var subs=subsOf(rg);
    var rr=headRow(rg.name,rg.ids,openRegion===(rg.key||rg.name),null,rg.key||rg.name);
    // Eine Regionszeile hat bisher nur auf- und zugeklappt, aber nichts ausgewaehlt - Figur,
    // Kurzinfo und Detailkasten blieben leer, obwohl man eindeutig auf "Brust" getippt hat.
    // Antippen waehlt die Region jetzt zusaetzlich aus, genau wie der Chip oben.
    rr.onclick=function(){
      var wasOpen=openRegion===(rg.key||rg.name);
      openRegion=wasOpen?null:(rg.key||rg.name);
      openSub=null;
      selReset();selectRegion(rg);
      renderSection("tab-koerper");
      if(!wasOpen)scrollToBody();
    };
    box.appendChild(rr);
    if(openRegion!==(rg.key||rg.name))return;
    subs.forEach(function(sb){
      var ids=sb.ids,showHead=subs.length>1&&sb.name;
      var sk=rg.name+"|"+sb.name,open=showHead?(openSub===sk):true;
      if(showHead){
        var hr=headRow(sb.name,ids,open,"sub");
        hr.onclick=function(ev){ev.stopPropagation();
          var wasOpen=openSub===sk;
          openSub=wasOpen?null:sk;
          selectRegion({name:sb.name,ids:ids});
          renderSection("tab-koerper");
          if(!wasOpen)scrollToBody();
        };
        box.appendChild(hr);
      }
      if(!open)return;
      ids.forEach(function(gid){
        fineKeysOfGroup(gid).forEach(function(k){
          var row=muscleRow(k);
          if(row){if(showHead)row.classList.add("sub2");box.appendChild(row);}
        });
      });
    });
  });
}

function renderSkills(c,pk){
  var box=$("skills");box.innerHTML="";
  var det={
    kraft:(c.cats||[]).filter(function(ct){return !!ct.top;}).length+" von "+(c.cats||[]).length+" Bereichen gemessen · "+c.recs.length+" Übungen gewertet",
    konst:c.trainDays+" Trainingstage in "+c.win+" Tagen · Ziel "+Math.round(state.profile.goals.days*c.win/7),
    deckung:CORE_MUSCLES.filter(function(id){return (c.ms[id]||0)>=corr(muscleById(id)).mev;}).length+" von "+CORE_MUSCLES.length+" Muskelgruppen über dem Minimum",
    ausdauer:Math.round(c.cm.raw)+" Minuten in "+c.win+" Tagen"+(c.vo2!=null?" · VO2max ≈ "+Math.round(c.vo2):""),
    mob:c.mobDays+" Einheiten in "+c.win+" Tagen · Ziel "+Math.round(state.profile.goals.mob*c.win/7)
  };
  SKILLDEF.forEach(function(sd){
    var v=c[sd.key],p=(pk&&pk[sd.key])||0;
    var m=el("div","meter"),top=el("div","meter-top"),nm=el("div","meter-name");
    var sw=el("span","sw");sw.style.background=sd.color;nm.appendChild(sw);nm.appendChild(document.createTextNode(sd.name));
    var val=el("div","meter-val");val.innerHTML='<span class="num">'+Math.round(v)+'</span><em>'+Math.round(sd.w*100)+' %</em>';
    top.appendChild(nm);top.appendChild(val);
    var bar=el("div","bar"),fi=el("i");fi.style.background=sd.color;fi.style.width=clamp(v,0,100)+"%";bar.appendChild(fi);
    if(p>2){var pm=el("span","peak");pm.style.left=clamp(p,0,100)+"%";pm.title="Bestform "+Math.round(p);bar.appendChild(pm);}
    m.appendChild(top);m.appendChild(bar);m.appendChild(el("div","meter-sub",det[sd.key]));box.appendChild(m);
  });
}

// Alle bewertbaren Übungen eines Kraft-Bereichs – auch die, die noch nie geloggt wurden.
function exsOfCat(catId){
  return EX.filter(function(e){return !!e.std&&catOfEx(e)===catId;});
}

function sheetKraftCat(catId,c){
  var cat=catById(catId);if(!cat)return;
  var ct=null;(c.cats||[]).forEach(function(x){if(x.id===catId)ct=x;});
  openSheet(function(b){
    sheetTitle(b,"Kraft "+cat.name);
    b.appendChild(el("p","note",ct&&ct.top
      ? "Stufe „"+ct.grade.name+"“ als Durchschnitt aus "+ct.exs.length+(ct.exs.length===1?" bewerteten Übung":" bewerteten Übungen")+" in diesem Bereich. Bester Einzelwert: "+ct.top.ex.n+" mit "+fmtBestVal(ct.top.ex,ct.top.best,ct.top.bestSet)+". „Richtwert“ heißt: Stufe aus einer verwandten Übung abgeleitet, nicht aus einer eigenen Normtabelle."
      : "Noch kein Wert in den letzten 90 Tagen. Trag bei einer dieser Übungen einen schweren Satz ein, dann bekommt der Bereich eine Stufe."));
    var measured={},list=el("div","exlist");b.appendChild(list);
    (ct?ct.exs:[]).forEach(function(r){
      measured[r.ex.id]=true;
      var it=el("div","exitem");
      var main=el("div","main");
      main.appendChild(el("b",null,r.ex.n));
      main.appendChild(el("span",null,"Bestwert "+fmtBestVal(r.ex,r.best,r.bestSet)+(r.grade&&r.grade.next?" · nächste Stufe ab "+fmtVal(r.grade.next,r.ex.t):" · Höchststufe")+(r.ex.est?" · Richtwert":"")));
      if(r.grade&&r.grade.next){var bar=el("div","minibar");bar.style.marginTop="7px";
        var fi=el("i");fi.style.width=clamp(r.grade.pct*100,0,100)+"%";fi.style.background="var(--red)";bar.appendChild(fi);main.appendChild(bar);}
      it.appendChild(main);
      it.appendChild(el("span","pill "+(r.grade?"g"+clamp(r.grade.idx,0,LEVELS.length-1):"gnone"),r.grade?r.grade.name:"verfallen"));
      it.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(r.ex);},180);};
      list.appendChild(it);
    });
    var unr=(ct?ct.unr:[]);
    if(unr.length){
      b.appendChild(el("div","grouplab","Gemacht, ohne Kraftstufe"));
      var listU=el("div","exlist");b.appendChild(listU);
      unr.forEach(function(u){
        measured[u.ex.id]=true;
        var it=el("div","exitem");
        var main=el("div","main");main.appendChild(el("b",null,u.ex.n));
        main.appendChild(el("span",null,u.ex.e+" · kein Kraftstandard vergleichbar"));
        it.appendChild(main);
        it.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(u.ex);},180);};
        listU.appendChild(it);
      });
    }
    var rest=exsOfCat(catId).filter(function(e){return !measured[e.id];});
    if(rest.length){
      b.appendChild(el("div","grouplab","Noch nicht gemessen"));
      var list2=el("div","exlist");b.appendChild(list2);
      rest.forEach(function(e){
        var it=el("div","exitem");
        var main=el("div","main");main.appendChild(el("b",null,e.n));main.appendChild(el("span",null,e.e));
        it.appendChild(main);
        it.onclick=function(){closeSheet();setTimeout(function(){sheetAddSet(e);},180);};
        list2.appendChild(it);
      });
    }
  });
}

function renderStrength(c){
  var box=$("strengthlist");box.innerHTML="";
  (c.cats||[]).forEach(function(ct){
    var row=el("div","row tap"),m=el("div","main");
    m.appendChild(el("b",null,ct.name));
    var n=ct.exs.length+ct.unr.length;
    m.appendChild(el("span",null,ct.top
      ? (n+(n===1?" Übung":" Übungen")+" gemacht · Bestwert "+ct.top.ex.n+" "+fmtBestVal(ct.top.ex,ct.top.best,ct.top.bestSet))
      : (n?n+(n===1?" Übung":" Übungen")+" gemacht · keine davon bewertbar":"seit 90 Tagen nichts gemacht")));
    // ct.grade ist jetzt ein Durchschnitts-Level (levelFromScore) ohne "next" in kg – der Balken
    // zeigt stattdessen immer den Fortschritt innerhalb der aktuellen Stufe.
    if(ct.grade){var bar=el("div","minibar");bar.style.marginTop="7px";
      var fi=el("i");fi.style.width=clamp(ct.grade.pct*100,0,100)+"%";fi.style.background="var(--red)";bar.appendChild(fi);m.appendChild(bar);}
    row.appendChild(m);
    row.appendChild(el("span","pill "+(ct.grade?"g"+clamp(ct.grade.idx,0,LEVELS.length-1):"gnone"),ct.grade?ct.grade.name:"verfallen"));
    var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);row.appendChild(ch);
    row.onclick=function(){sheetKraftCat(ct.id,c);};
    box.appendChild(row);
  });
}

function renderCardio(c){
  var box=$("cardiolist");box.innerHTML="";
  function row(a,bv,tap){
    var r=el("div","row"+(tap?" tap":"")),m=el("div","main");m.appendChild(el("b",null,a));r.appendChild(m);
    r.appendChild(el("div","val",bv));
    if(tap){r.onclick=tap;var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);}
    box.appendChild(r);
  }
  row("Minuten pro Woche",Math.round(c.cm.raw/(c.win/7))+" / "+state.profile.goals.cardio);
  row("Belastungsäquivalent",Math.round(c.cm.eq/(c.win/7))+" min");
  if(c.vo2!=null){
    row("VO2max geschätzt",(Math.round(c.vo2*10)/10)+"");
    var p=Math.round(c.vpct),lab=p<20?"schwach":p<40?"unterdurchschnittlich":p<60?"durchschnittlich":p<80?"gut":p<95?"sehr gut":"herausragend";
    row("Für dein Alter",p+". Perzentil · "+lab);
  }
  row("Ruhepuls",(state.profile.restHr||"–")+" bpm",function(){
    askNumber("Ruhepuls, morgens im Liegen",state.profile.restHr||60,"1",0,140,"Schläge pro Minute",function(v){state.profile.restHr=Math.round(v);persist();renderAll();});});
  row("Cooper-Test",(state.profile.cooper?state.profile.cooper+" m":"nicht gemacht"),function(){
    askNumber("Cooper-Test: Meter in 12 Minuten",state.profile.cooper||2400,"50",0,6000,"Meter",function(v){state.profile.cooper=Math.round(v);persist();renderAll();});});
}

/* Baut die Einstellungsliste in einen beliebigen Behaelter - benutzt von der eigenen Seite
   und (als kurzer Verweis) vom Werte-Tab. */
function settingsBody(box){
  box.innerHTML="";var p=state.profile;
  function group(t){box.appendChild(el("div","setpage-group",t));}
  function card(){var c=el("div","card flush");box.appendChild(c);return c;}
  function row(into,lab,val,fn){
    var r=el("div","row tap"),m=el("div","main");m.appendChild(el("b",null,lab));r.appendChild(m);
    r.appendChild(el("div","val",val));
    var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);
    r.onclick=fn;into.appendChild(r);
  }
  group(T("set.gGoals"));
  var g1=card();
  [["days","Tage",1,7,T("set.days"),T("unit.days")],
   ["mob","×",0,7,T("set.mob"),"×"],
   ["cardio","min",0,900,T("set.cardio"),"min"]].forEach(function(dd){
    var d=[null,dd[0],dd[5],dd[2],dd[3],dd[4]];
    row(g1,d[5],p.goals[d[1]]+" "+d[2],function(){
      askNumber(d[5],p.goals[d[1]],d[1]==="cardio"?"15":"1",d[3],d[4],d[2],
        function(v){p.goals[d[1]]=Math.round(v);persist();renderAll();openSettingsPage(true);});});});

  group(T("set.gBody"));
  var g2=card();
  [["bodyweight","kg",30,250,T("set.weight")],["age",T("unit.years"),12,99,T("set.age")]].forEach(function(d){
    row(g2,d[4],p[d[0]]+" "+d[1],function(){
      askNumber(d[4],p[d[0]],d[0]==="age"?"1":"0.5",d[2],d[3],d[1],
        function(v){p[d[0]]=v;persist();renderAll();openSettingsPage(true);});});});
  row(g2,T("set.sex"),p.sex==="w"?T("set.female"):T("set.male"),
      function(){p.sex=p.sex==="w"?"m":"w";persist();renderAll();openSettingsPage(true);});

  group(T("set.gLang"));
  var g3=card();
  row(g3,T("set.lang"),LANG==="en"?T("set.langEn"):T("set.langDe"),
      function(){setLang(LANG==="en"?"de":"en");openSettingsPage(true);});
  box.appendChild(el("p","setpage-note",T("set.langNote")));

  group(T("set.account"));
  var g4=card();
  row(g4,T("set.sync"),syncState.t,sheetAccount);
  row(g4,T("set.backupSave"),"JSON",saveBackup);
  row(g4,T("set.backupLoad"),T("set.fileOrText"),sheetRestore);
}

/* Eigene Seite. "keep" heisst: nur den Inhalt auffrischen, ohne Ein-/Ausblenden - damit ein
   geaenderter Wert nicht die ganze Seite neu aufpoppen laesst. */
function openSettingsPage(keep){
  var page=$("exdpage");
  if(!keep){closeSheet();page.hidden=false;syncScrollLock();}
  var head=$("exdpage-head");head.innerHTML="";
  var back=el("button","iconbtn");back.type="button";back.setAttribute("aria-label",T("gen.back"));
  back.innerHTML=svgIcon(IC_CHEVLEFT,2.1);back.onclick=closeExPage;
  head.appendChild(back);
  head.appendChild(el("div","exdpage-title",T("set.title")));
  settingsBody($("exdpage-body"));
}

function renderSettings(){
  var box=$("settings");box.innerHTML="";
  var r=el("div","row tap"),m=el("div","main");
  m.appendChild(el("b",null,T("set.title")));
  m.appendChild(el("span",null,T("set.rowSub")));
  r.appendChild(m);
  var ch=el("span","chev");ch.innerHTML=svgIcon(IC_CHEV);r.appendChild(ch);
  r.onclick=function(){openSettingsPage();};
  box.appendChild(r);
}

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
    return dl.save({filename:"formwert-backup-"+TODAY+".json",data:json}).then(function(){toast("Backup gespeichert");});
  }).catch(function(e){
    if(e&&e.code==="declined")return;
    toast("Backup fehlgeschlagen");
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
  for(var k in state.days)state.dirty[k]=true;
  for(var r in state.routines)state.dirtyRoutines[r]=true;
  saveLocal();persist();closeSheet();renderAll();toast("Backup eingespielt");
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
  var s="";[25,50,75].forEach(function(g){s+='<line x1="'+pd+'" y1="'+ys(g).toFixed(1)+'" x2="'+(W2-pd)+'" y2="'+ys(g).toFixed(1)+'" stroke="var(--rule)" stroke-width="1" stroke-dasharray="3 5"/>';});
  s+='<path d="'+da+'" fill="var(--red)" fill-opacity="0.11"/><path d="'+dl+'" fill="none" stroke="var(--red)" stroke-width="2.2" stroke-linejoin="round"/>';
  s+='<circle cx="'+xs(n-1).toFixed(1)+'" cy="'+ys(ser[n-1].v).toFixed(1)+'" r="3.5" fill="var(--red)"/>';
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

function rcGoto(i,smooth){
  var p=$("rc-pager");if(!p)return;
  var x=i*(p.clientWidth||p.offsetWidth||0);
  try{p.scrollTo({left:x,behavior:smooth?"smooth":"auto"});}catch(e){p.scrollLeft=x;}
}

function renderRoutines(){
  var box=$("routine-list");box.className="rc-list";box.innerHTML="";var ids=routineIds();
  // Alle Mini-Figuren (front/back je Karte) erst zeichnen, nachdem die Karten im Dokument stehen –
  // siehe Kommentar in focusPanel(): getBBox()/getTotalLength() liefern auf einem noch nicht
  // eingehängten <svg> nur Nullen.
  var pendingDraws=[];
  var pager=el("div","rc-pager");pager.id="rc-pager";
  ids.forEach(function(id){
    var r=state.routines[id],card=el("div","card routine-card");
    var top=el("div","rc-top");
    top.appendChild(el("b",null,r.name));
    var ed=el("button","iconbtn");ed.setAttribute("aria-label","Bearbeiten");ed.innerHTML=svgIcon("M4 20h4L19 9l-4-4L4 16z");
    ed.onclick=function(){sheetEditor(id);};top.appendChild(ed);
    card.appendChild(top);
    var fo=routineFocus(r.items);
    if(fo.max>0){
      var figs=el("div","rc-figs");
      ["front","back"].forEach(function(v){var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");sv.setAttribute("viewBox","0 0 800 1500");figs.appendChild(sv);pendingDraws.push({sv:sv,v:v,sets:fo.sets});});
      card.appendChild(figs);
    }
    var tags=el("div","rc-tags");
    r.items.slice(0,3).forEach(function(it){var ex=exById(it.ex);if(ex)tags.appendChild(el("span","tagpill",ex.n));});
    if(r.items.length>3)tags.appendChild(el("span","tagpill","+"+(r.items.length-3)+" mehr"));
    card.appendChild(tags);
    card.appendChild(el("p","note",r.items.length+" Übungen · "+r.items.reduce(function(a,i){return a+i.sets;},0)+" Sätze"));
    var st=el("button","btn primary block","Training starten");st.onclick=function(){startSession(id);};card.appendChild(st);
    if(ids.length>1)rcDragEnable(card,id,ids,pager);
    pager.appendChild(card);
  });
  var add=el("div","card routine-card rc-add");add.setAttribute("role","button");add.setAttribute("tabindex","0");
  var ic=el("div","rc-add-ic");ic.innerHTML=svgIcon("M12 5v14M5 12h14",2.2);add.appendChild(ic);
  add.appendChild(el("b",null,"Neue Einheit"));
  add.appendChild(el("p","note","Eigene Einheit zusammenstellen"));
  var mk=el("button","btn ghost","+ Erstellen");mk.onclick=function(ev){if(ev)ev.stopPropagation();sheetEditor(null);};add.appendChild(mk);
  add.onclick=function(){sheetEditor(null);};
  add.onkeydown=function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();sheetEditor(null);}};
  pager.appendChild(add);
  box.appendChild(pager);
  var dots=el("div","rc-dots");dots.id="rc-dots";box.appendChild(dots);
  if(ids.length>1)box.appendChild(el("p","rc-hint","Karte gedrückt halten und zur Seite schieben, um die Reihenfolge zu ändern."));
  if(pendingDraws.length)requestAnimationFrame(function(){pendingDraws.forEach(function(o){drawMini(o.sv,o.v,o.sets);});});
  $("routine-count").textContent=ids.length+(ids.length===1?" Einheit":" Einheiten");
  function rcDots(){
    dots.innerHTML="";
    var n=ids.length+1;
    for(var i=0;i<n;i++){
      var cls=(i===n-1?"plus":"")+(i===rcPage?" on":"");
      var x=el("i",cls.trim());
      (function(k){x.onclick=function(){rcPage=k;rcGoto(k,true);rcDots();};})(i);
      dots.appendChild(x);
    }
  }
  if(rcPage>ids.length)rcPage=ids.length;
  var sT=null;
  pager.addEventListener("scroll",function(){
    if(sT)return;
    sT=setTimeout(function(){sT=null;
      var wdt=pager.clientWidth||1,i=Math.round(pager.scrollLeft/wdt);
      if(i!==rcPage){rcPage=i;rcDots();}
    },90);
  },{passive:true});
  rcDots();
  requestAnimationFrame(function(){rcGoto(rcPage,false);});
}


/* Karte gedrueckt halten und schieben. Bewusst erst nach einer kurzen Haltezeit: der
   Pager wird sonst seitlich gewischt, und genau diese Geste braucht man weiterhin zum
   Blaettern. Waehrend des Ziehens wird das Blaettern angehalten, die Karte folgt dem
   Finger, und oben steht, auf welchen Platz sie faellt. Verschoben wird erst beim
   Loslassen - so kann man es sich bis zuletzt anders ueberlegen. */
function rcDragEnable(card,id,ids,pager){
  var halten=null,sx=0,sy=0,zieht=false,von=ids.indexOf(id),ziel=von,breite=0,schild=null;
  function punkte(){
    // Die Punktreihe zeigt waehrend des Ziehens den Zielplatz - dasselbe Bild,
    // das sie sonst fuer die aktuelle Seite zeigt.
    var d=$("rc-dots");if(!d)return;
    Array.prototype.forEach.call(d.children,function(x,i){
      x.classList.toggle("on",i===ziel);
      x.classList.toggle("ghost",zieht&&i===von&&i!==ziel);
    });
  }
  function schildText(){
    if(schild)schild.textContent="Platz "+(ziel+1)+" von "+ids.length;
    punkte();
  }
  function stoppen(){
    if(halten){clearTimeout(halten);halten=null;}
    if(!zieht)return;
    zieht=false;
    card.classList.remove("rc-drag");
    card.style.transform="";
    if(schild&&schild.parentNode)schild.parentNode.removeChild(schild);
    schild=null;
    punkte();
  }
  function starten(){
    halten=null;zieht=true;ziel=von;
    breite=pager.clientWidth||card.offsetWidth||1;
    card.classList.add("rc-drag");
    schild=el("div","rc-droplab");card.appendChild(schild);
    schildText();
    if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}
  }
  card.addEventListener("pointerdown",function(e){
    if(e.button&&e.button!==0)return;
    var t=e.target;
    while(t&&t!==card){if(t.tagName==="BUTTON")return;t=t.parentNode;}
    sx=e.clientX;sy=e.clientY;
    try{card.setPointerCapture(e.pointerId);}catch(err){}
    halten=setTimeout(starten,380);
  });
  card.addEventListener("pointermove",function(e){
    if(!zieht){
      // Wer sofort wischt, will blaettern - dann kein Ziehen starten.
      if(halten&&(Math.abs(e.clientX-sx)>8||Math.abs(e.clientY-sy)>8)){clearTimeout(halten);halten=null;}
      return;
    }
    var dx=e.clientX-sx;
    // Gedaempft und begrenzt: die Karte zeigt die Richtung an, verlaesst aber nie
    // den sichtbaren Bereich. Alles darueber hinaus wuerde der Pager abschneiden.
    var weg=Math.max(-46,Math.min(46,dx*0.28));
    card.style.transform="translateX("+weg.toFixed(1)+"px) scale(.955)";
    // Ein halber Kartenbreiten-Schritt je Platz: so erreicht man auch den dritten
    // Platz, ohne dreimal ueber den ganzen Bildschirm ziehen zu muessen.
    var neu2=Math.max(0,Math.min(ids.length-1,von+Math.round(dx/(breite*0.5))));
    if(neu2!==ziel){ziel=neu2;schildText();if(navigator.vibrate)try{navigator.vibrate(8);}catch(e2){}}
  });
  // Auf dem Handy verhindert nur ein nicht-passives touchmove das Mitscrollen.
  card.addEventListener("touchmove",function(e){if(zieht)e.preventDefault();},{passive:false});
  card.addEventListener("pointerup",function(){
    var ablegen=zieht&&ziel!==von;
    var neuerPlatz=ziel;
    stoppen();
    if(!ablegen)return;
    var liste=ids.slice();
    liste.splice(liste.indexOf(id),1);
    liste.splice(neuerPlatz,0,id);
    setRoutineOrder(liste);
    rcPage=neuerPlatz;
    renderRoutines();
    toast("Reihenfolge geändert");
  });
  card.addEventListener("pointercancel",stoppen);
}

/* ================= Live-Training ================= */
var workout=null,
 woTick=null;

function fmtDur(sec){sec=Math.max(0,Math.round(sec));var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),x=sec%60;
  return (h?h+":":"")+(h?pad(m):m)+":"+pad(x);}

function woElapsed(){if(!workout)return 0;var base=(workout.paused?workout.pauseStart:Date.now())-workout.startedAt-workout.pausedMs;return base/1000;}

function defaultSet(ex,prev){
  if(prev)return {kg:prev.kg,reps:prev.reps,done:false};
  var b=bestFor(ex.id,TODAY,WIN_STRENGTH);
  if(ex.t==="load")return {kg:suggestedKg(ex,b.best),reps:8,done:false};
  return {kg:0,reps:suggestedReps(ex,b.best),done:false};
}

/* In welchem Tag steht dieser Ausdauer-Datensatz? (Objektvergleich, nicht Inhalt.) */
function cardioDayOf(rec){
  if(!rec)return null;
  for(var k in state.days){if((state.days[k].cardio||[]).indexOf(rec)>=0)return k;}
  return null;
}

/* Ein Ausdauer-Eintrag im Training zeigt auf DENSELBEN Datensatz wie der Tag (day.cardio) -
   die Minuten werden direkt darin geaendert, dadurch zaehlen sie aufs Wochenziel. Beim
   Speichern (localStorage/Cloud) wird daraus zwangslaeufig eine eigene Kopie: nach dem Laden
   zeigen Training und Tag auf zwei verschiedene Objekte, und Aenderungen im Training kaemen
   nirgends mehr an. Hier wird die Verbindung wieder hergestellt - passender Datensatz im Tag
   (gleiche Uebung, gleiches Training), sonst wird die mitgespeicherte Kopie wieder eingetragen.
   Verworfen wird nichts: der Eintrag im Training ist der Beleg, dass es die Einheit gibt. */
function relinkCardio(w){
  var used=[];
  w.exercises.forEach(function(e){
    if(!e||!e.cardioRec)return;
    if(cardioDayOf(e.cardioRec)){used.push(e.cardioRec);return;}
    var hit=null;
    for(var k in state.days){
      var list=state.days[k].cardio||[];
      for(var i=0;i<list.length&&!hit;i++){
        var r=list[i];
        if(r&&r.ex===e.ex&&r.wid===w.id&&used.indexOf(r)<0)hit=r;
      }
      if(hit)break;
    }
    if(hit){e.cardioRec=hit;used.push(hit);return;}
    var rec=e.cardioRec;
    if(!rec.ex)rec.ex=e.ex;
    if(!rec.wid)rec.wid=w.id;
    if(rec.min==null)rec.min=0;
    if(rec.km==null)rec.km=0;
    day(TODAY).cardio.push(rec);touch(TODAY);used.push(rec);
  });
}

function startWorkout(routineId){
  var r=routineId?state.routines[routineId]:null;
  workout={id:rid(),name:r?r.name:"Training",routineId:r?routineId:null,startedAt:Date.now(),pausedMs:0,paused:false,pauseStart:0,rest:{endAt:0,len:90},exercises:[]};
  if(r)r.items.forEach(function(it){var ex=exById(it.ex);if(!ex)return;
    var sets=[];for(var i=0;i<it.sets;i++)sets.push({kg:it.kg||0,reps:it.reps,done:false});
    workout.exercises.push({ex:it.ex,restSec:90,sets:sets});});
  woPage=0;woShape=null;
  saveWorkout();selectTab("tab-training");renderAll();window.scrollTo({top:0,behavior:"smooth"});
  startTick();
}

var swT=null;

function saveWorkoutSoon(){if(swT)clearTimeout(swT);swT=setTimeout(function(){swT=null;saveWorkout();},500);}

function flushWorkoutSave(){if(swT){clearTimeout(swT);swT=null;saveWorkout();}}

// Schutz gegen Datenverlust: wird z. B. während des Eintippens eines Gewichts die App in den
// Hintergrund geschickt oder der Tab geschlossen, bevor die 500ms-Verzögerung von
// saveWorkoutSoon() abgelaufen ist, würde dieser letzte Tastendruck sonst verloren gehen.
// Bei jedem Sichtbarkeits-/Fokuswechsel und beim Schließen sofort speichern.
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){flushWorkoutSave();flushLocalSave();}});

addEventListener("pagehide",function(){flushWorkoutSave();flushLocalSave();});

addEventListener("beforeunload",function(){flushWorkoutSave();flushLocalSave();});

function saveWorkout(){
  try{localStorage.setItem("formwert-workout",workout?JSON.stringify(workout):"");}catch(e){warnSaveFailed();}
  if(db){if(workout)db.doc("state/workout").set(workout).catch(function(){});else db.doc("state/workout").delete().catch(function(){});}
}

function startTick(){if(woTick)return;woTick=setInterval(tickWorkout,1000);}

function tickWorkout(){
  if(!workout){clearInterval(woTick);woTick=null;return;}
  try{tickInner();}catch(e){}
}

function restbarSpace(rb){
  try{document.body.style.setProperty("--restbar-h",(rb&&!rb.hidden?rb.offsetHeight:0)+"px");}catch(e){}
}

function tickInner(){
  var t=$("wo-timer");if(t)t.textContent=fmtDur(woElapsed());var bt=$("wo-banner-t");if(bt)bt.textContent=fmtDur(woElapsed());
  woAlign();woFillFigs();
  var rb=$("restbar");if(!rb)return;
  var left=Math.ceil((workout.rest.endAt-Date.now())/1000);
  if(workout.rest.endAt&&left>0){
    var wasHidden=rb.hidden;
    rb.hidden=false;$("rest-left").textContent=fmtDur(left);
    $("rest-fill").style.width=clamp(100*left/workout.rest.len,0,100)+"%";
    // Die Pausenleiste sitzt ueber der Seite - ihre Hoehe muss die Trainingsseite
    // freihalten, sonst verdeckt sie die Muskelzeile darunter.
    if(wasHidden)restbarSpace(rb);
  }
  else{ if(workout.rest.endAt&&!rb.hidden){try{if(navigator.vibrate)navigator.vibrate([120,60,120]);}catch(e){}}
    if(!rb.hidden){rb.hidden=true;restbarSpace(rb);}
    workout.rest.endAt=0;}
}

function addWorkoutExercise(ex){
  workout.exercises.push({ex:ex.id,restSec:90,sets:[defaultSet(ex,null)]});
  woPage=workout.exercises.length-1;   // direkt auf die neue Übungsseite wischen
  saveWorkout();renderSession();
}
