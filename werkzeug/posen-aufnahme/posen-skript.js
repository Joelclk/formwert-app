/* Aufnahme der Übungskarten-Standbilder (app/assets/posen/<clip>.webp).
   Ablauf (02.10.2026, Version 528):
   1. app/ in einen Arbeitsordner kopieren, dort posen.html = index.html + <script src="posen-skript.js"></script> vor </body>.
   2. srv.py aus diesem Ordner danebenlegen und starten: python3 srv.py 8963 (liefert aus, speichert POSTs nach posen_neu/).
   3. http://localhost:8963/posen.html?clips=squat_lh,bench_lh öffnen; fertig, wenn posen_neu/fertig_posen.txt da ist.
   4. Bilder nach app/assets/posen/ kopieren. Immer mit dem Modell aufnehmen, das live ist.
   Bankclips: Arme oben (Zeit 0), Kamera wie im Viewer (FWB_PHI), 315 px hoch. */
/* Standbilder der 3D-Bewegungen für die Übungskarten (assets/posen/<clip>.webp), Version 485 (30.09.2026).
   Warum (Joel): Auf der Karte soll zuerst die Bewegung zu sehen sein, zur Seite gewischt die beanspruchten Muskeln.
   Nach jedem neuen App-Modell (anim-modell.js) neu aufnehmen, sonst passen Standbild und Animation nicht zusammen.
   Ablauf: App-Kopie lokal ausliefern mit einem Server, der POST /hochladen/<name> als Datei speichert
   (Vorlage: srv.py im Scratchpad der Sitzung vom 30.09.2026; liefert testapp/ aus, schreibt posen_roh/).
   Diese Datei in der Konsole der geöffneten App ausführen, dann posenAlle() aufrufen.
   Das Bild kommt direkt aus dem Viewer-Canvas (transparenter Hintergrund, Farben wie in der Übungsdetailseite),
   wird auf die Figur zugeschnitten (4 % Rand), auf 420 px Höhe (max. 560 px Breite) skaliert und als WebP 0,86 gespeichert.
   Gewählte Zeitpunkte (Anteil der Cliplänge) und Blickwinkel (theta in π, sonst Viewer-Standard je Clip): */
var POSEN_ZEIT={hipcircle:0.3,legswing:0.3,shouldercar:0.35,hipcar:0.2,legcircle:0.35,gate:0.3,catcow:0.25,armcircle:0.3};
var POSEN_THETA={deadlift:-0.3,rdl:-0.35,squat:-0.25,catcow:-0.5,hipcircle:-0.3};
var POSEN_H={bench_lh:315,incline_lh:315,bench_kh:315,incline_kh:315};   // Bankbilder wie bisher 315 px hoch
POSEN_ZEIT.bench_lh=POSEN_ZEIT.incline_lh=POSEN_ZEIT.bench_kh=POSEN_ZEIT.incline_kh=0.001;   // oben, Arme gestreckt
var POSEN_MOBIL={hipcircle:1,legswing:1,shouldercar:1,armcircle:1,hipcar:1,legcircle:1,gate:1,catcow:1};   // 8 s, sonst 4 s
function posenWarte(ms){return new Promise(function(r){setTimeout(r,ms);});}
async function posenBild(clip,exId,frac,theta){
  var ex=exById(exId),box=el("div","exanim-box");
  box.style.cssText="position:fixed;left:0;top:0;width:480px;height:480px;z-index:9999";
  var fr=document.createElement("iframe");fr.className="exanim-frame";fr.style.cssText="width:480px;height:480px;border:0";
  box.appendChild(el("span","exanim-load",""));box.appendChild(fr);document.body.appendChild(box);
  fr._fwAnim={clip:clip,modell:"arm",colors:fw3dColorsForInvolve(exPctInv(ex)||exInvolve(ex),"step")};
  await Promise.all([fwLoadAsset("anim-viewer"),fwLoadAsset("anim-modell")]);
  fr.srcdoc=fwAnimHtml||await fwAnimGunzip(fwAnimB64(FW_ANIM_V)).then(function(b){return (fwAnimHtml=new TextDecoder("utf-8").decode(b));});
  for(var i=0;i<200&&!box.classList.contains("ready");i++)await posenWarte(100);
  var POSEN_PHI={bench_lh:.36*Math.PI,bench_kh:.36*Math.PI,incline_lh:.40*Math.PI,incline_kh:.40*Math.PI};   // Kamera wie im Viewer (FWB_PHI)
  var msg={to:"fwanim",type:"seek",t:(POSEN_MOBIL[clip]?8:4)*frac,phi:POSEN_PHI[clip]||1.4};if(theta!=null)msg.theta=theta*Math.PI;
  fr.contentWindow.postMessage(msg,"*");await posenWarte(500);
  var url=await new Promise(function(res){fr.contentWindow.requestAnimationFrame(function(){fr.contentWindow.requestAnimationFrame(function(){res(fr.contentDocument.getElementById("c").toDataURL("image/png"));});});});
  box.remove();
  var img=new Image();img.src=url;await img.decode();
  var c=document.createElement("canvas");c.width=img.width;c.height=img.height;var g=c.getContext("2d");g.drawImage(img,0,0);
  var d=g.getImageData(0,0,c.width,c.height).data,x0=c.width,y0=c.height,x1=0,y1=0;
  for(var y=0;y<c.height;y++)for(var x=0;x<c.width;x++)if(d[(y*c.width+x)*4+3]>10){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  var p=Math.round(0.04*Math.max(x1-x0,y1-y0));x0=Math.max(0,x0-p);y0=Math.max(0,y0-p);x1=Math.min(c.width-1,x1+p);y1=Math.min(c.height-1,y1+p);
  var w=x1-x0+1,h=y1-y0+1,H=POSEN_H[clip]||420,W=Math.round(w*H/h);if(W>560){W=560;H=Math.round(h*W/w);}
  var o=document.createElement("canvas");o.width=W;o.height=H;o.getContext("2d").drawImage(c,x0,y0,w,h,0,0,W,H);
  await fetch("/hochladen/"+clip+".webp",{method:"POST",body:o.toDataURL("image/webp",0.86)});
  return clip+" "+W+"x"+H;
}
async function posenAlle(){
  var erst={};Object.keys(FW_ANIM_CLIP).forEach(function(k){var c=FW_ANIM_CLIP[k];if(!erst[c])erst[c]=k;});
  var aus=[];for(var c in erst)aus.push(await posenBild(c,erst[c],POSEN_ZEIT[c]||0.5,POSEN_THETA[c]));
  return aus;
}

(async function(){
  function w(ms){return new Promise(function(r){setTimeout(r,ms);});}
  for(var i=0;i<100&&typeof exById==='undefined';i++)await w(200);
  await w(3000); var ob=document.getElementById('ob'); if(ob)ob.style.display='none';
  var liste=(new URLSearchParams(location.search).get('clips')||'').split(',').filter(Boolean);   // z. B. posen.html?clips=squat_lh,deadlift
  var erst={};Object.keys(FW_ANIM_CLIP).forEach(function(k){var c=FW_ANIM_CLIP[k];if(!erst[c])erst[c]=k;});
  var aus=[];for(var i=0;i<liste.length;i++){var c=liste[i];try{aus.push(await posenBild(c,erst[c],POSEN_ZEIT[c]||0.5,POSEN_THETA[c]));}catch(e){aus.push(c+' FEHLER '+e);}}
  await fetch('/upload/fertig_posen.txt',{method:'POST',body:aus.join('\n')});
})();
