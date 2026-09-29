/* Realistischere Muskeloberflaeche: eine gemeinsame, kachelbare Faser-Textur (Relief + Rauheit)
   fuer alle Muskeln. Das Modell hat keine Texturkoordinaten; sie werden hier je Muskel aus seiner
   Form berechnet, damit die Fasern entlang der Laengsachse des Muskels laufen. Die Grundfarbe bleibt
   unangetastet, damit die Einfaerbung nach Trainingsvolumen weiter voll wirkt. */
var FW3D_FASER=null;
function fw3d_faserTex(){
  if(FW3D_FASER)return FW3D_FASER;
  var ld=new Fr();
  function mk(src){var t=ld.load(src);t.wrapS=t.wrapT=ai;t.colorSpace=Fn;t.anisotropy=4;return t;}
  FW3D_FASER={n:mk(FW3D_FASER_N),r:mk(FW3D_FASER_R)};
  return FW3D_FASER;
}
/* Hauptachsen einer Punktwolke (Jacobi-Verfahren fuer die 3x3-Kovarianz) */
function fw3d_achsen(p){
  var n=p.length/3,m=[0,0,0],i,k;
  for(i=0;i<n;i++)for(k=0;k<3;k++)m[k]+=p[i*3+k]/n;
  var c=[[0,0,0],[0,0,0],[0,0,0]];
  for(i=0;i<n;i++){var d=[p[i*3]-m[0],p[i*3+1]-m[1],p[i*3+2]-m[2]];
    for(var a=0;a<3;a++)for(var b=0;b<3;b++)c[a][b]+=d[a]*d[b]/n;}
  var v=[[1,0,0],[0,1,0],[0,0,1]];
  for(var it=0;it<24;it++){
    var pp=0,q=1,mx=0;
    for(a=0;a<3;a++)for(b=a+1;b<3;b++)if(Math.abs(c[a][b])>mx){mx=Math.abs(c[a][b]);pp=a;q=b;}
    if(mx<1e-14)break;
    var th=0.5*Math.atan2(2*c[pp][q],c[q][q]-c[pp][pp]),cs=Math.cos(th),sn=Math.sin(th);
    for(k=0;k<3;k++){var x=c[k][pp],y=c[k][q];c[k][pp]=cs*x-sn*y;c[k][q]=sn*x+cs*y;}
    for(k=0;k<3;k++){x=c[pp][k];y=c[q][k];c[pp][k]=cs*x-sn*y;c[q][k]=sn*x+cs*y;}
    for(k=0;k<3;k++){x=v[k][pp];y=v[k][q];v[k][pp]=cs*x-sn*y;v[k][q]=sn*x+cs*y;}
  }
  var ev=[0,1,2].map(function(j){return {l:c[j][j],v:[v[0][j],v[1][j],v[2][j]]};}).sort(function(x,y){return y.l-x.l;});
  return {m:m,e:ev};
}
var FW3D_FASER_QUER=0.10, FW3D_FASER_LAENGS=0.20;  /* Kachelgroesse in Metern: ~9 mm breite Faserbuendel */
function fw3d_faserUV(g){
  if(!g||g.userData.fwUV||!g.attributes.position)return;
  var pa=g.attributes.position,n=pa.count,p=new Float32Array(n*3),i;
  for(i=0;i<n;i++){p[i*3]=pa.getX(i);p[i*3+1]=pa.getY(i);p[i*3+2]=pa.getZ(i);}
  var A=fw3d_achsen(p),m=A.m,a1=A.e[0].v,a2=A.e[1].v,a3=A.e[2].v;
  // Flache Muskeln (Brust, breiter Ruecken) eben abbilden, rundliche (Bizeps) rundherum
  var flach=A.e[2].l<0.3*A.e[1].l,uv=new Float32Array(n*2),rm=0;
  function dot(a,j){return (p[j*3]-m[0])*a[0]+(p[j*3+1]-m[1])*a[1]+(p[j*3+2]-m[2])*a[2];}
  if(!flach){for(i=0;i<n;i++){var x2=dot(a2,i),x3=dot(a3,i);rm+=Math.sqrt(x2*x2+x3*x3)/n;}}
  var kreis=Math.max(1,Math.round(2*Math.PI*rm/FW3D_FASER_QUER));
  for(i=0;i<n;i++){
    uv[i*2+1]=dot(a1,i)/FW3D_FASER_LAENGS;
    uv[i*2]=flach?dot(a2,i)/FW3D_FASER_QUER:(Math.atan2(dot(a3,i),dot(a2,i))/(2*Math.PI))*kreis;
  }
  g.setAttribute("uv",new at(uv,2));g.userData.fwUV=1;
}
/* Verschattung in den Fugen zwischen Muskeln: in Blender vorberechnet und je Punkt als ein Wert
   (_AO) im Modell gespeichert. Sie dunkelt nur die Grundfarbe ab, die Einfaerbung bleibt erkennbar
   und die Grenzen zwischen Nachbarmuskeln treten hervor. */
function fw3d_fugen(mt){
  mt.onBeforeCompile=function(sh){
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nattribute float _ao;\nvarying float vFwAo;")
      .replace("#include <begin_vertex>","#include <begin_vertex>\nvFwAo=_ao;");
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\nvarying float vFwAo;")
      .replace("#include <color_fragment>","#include <color_fragment>\ndiffuseColor.rgb*=vFwAo;");
  };
  mt.customProgramCacheKey=function(){return "fwao";};
}
function fw3d_faser(o,sehne){
  if(o.geometry&&o.geometry.attributes._ao)fw3d_fugen(o.material);
  if(typeof FW3D_FASER_NUR!=="undefined"&&FW3D_FASER_NUR&&!FW3D_FASER_NUR[o.userData.fwBase]){o.material.needsUpdate=true;return;}
  fw3d_faserUV(o.geometry);
  var t=fw3d_faserTex(),mt=o.material;
  mt.normalMap=t.n;
  // Sehnen: feiner und glaenzender als Muskelfleisch
  if(sehne){mt.normalScale.set(0.35,-0.35);mt.roughness=0.75;}
  else{mt.normalScale.set(0.6,-0.6);mt.roughness=1.0;mt.roughnessMap=t.r;}
  mt.needsUpdate=true;
}
