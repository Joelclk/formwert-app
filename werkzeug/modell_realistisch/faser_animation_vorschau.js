/* Vorschau (29.09.2026): Faserverlauf der mittleren Brust im Bewegungsablauf (anim-viewer).
   NICHT eingebaut. Einhaengen im ausgepackten animation_viewer.html vor "async function nb(s){",
   Aufruf fwFaserAnim() nach Jg() in nb(). Benoetigt FWA_H (Hoehen-Textur als data-URL).
   Die Faserkoordinaten werden je Bildpunkt aus der Ruhelage berechnet - so bleibt der Faecher
   auch auf dem groben Netz des Animationsmodells glatt (vorher Schraffur an Dreieckskanten). */
/* VORSCHAU: Faserverlauf und glatte Oberflaeche fuer die mittlere Brust im Bewegungsablauf.
   Ursprungs-/Ansatzlinien wie im Koerpermodell (werkzeug/modell_realistisch), Blender-Koordinaten
   der rechten Seite (z = oben); die linke Seite wird gespiegelt. Alles wird aus der Ruhelage
   berechnet, damit die Fasern beim Bewegen mit dem Muskel mitgehen. */
var FWA_LINIEN={"Sternocostal head of pectoralis major muscle":{A0:[-0.023,-0.116,1.244],A1:[-0.011,-0.059,1.397],B0:[-0.174,-0.001,1.309],B1:[-0.166,-0.003,1.358]}};
var FWA_QUER=0.10,FWA_LAENGS=0.20,FWA_ANZ=90,FWA_TIEFE=2.0,FWA_GLAETTEN=0;
function fwaTex(src){var t=new Pt();var img=new Image();img.onload=function(){t.image=img;t.needsUpdate=true;};img.src=src;
  t.wrapS=t.wrapT=un;t.colorSpace=Yt;t.anisotropy=8;t.repeat.set(1/FWA_QUER,1/FWA_LAENGS);return t;}
function fwaAchsen(P,n){
  var m=[0,0,0],i,k,a,b;for(i=0;i<n;i++)for(k=0;k<3;k++)m[k]+=P[i*3+k]/n;
  var c=[[0,0,0],[0,0,0],[0,0,0]];
  for(i=0;i<n;i++){var d=[P[i*3]-m[0],P[i*3+1]-m[1],P[i*3+2]-m[2]];for(a=0;a<3;a++)for(b=0;b<3;b++)c[a][b]+=d[a]*d[b]/n;}
  var v=[[1,0,0],[0,1,0],[0,0,1]];
  for(var it=0;it<30;it++){var p=0,q=1,mx=0;
    for(a=0;a<3;a++)for(b=a+1;b<3;b++)if(Math.abs(c[a][b])>mx){mx=Math.abs(c[a][b]);p=a;q=b;}
    if(mx<1e-16)break;
    var th=0.5*Math.atan2(2*c[p][q],c[q][q]-c[p][p]),cs=Math.cos(th),sn=Math.sin(th),x,y;
    for(k=0;k<3;k++){x=c[k][p];y=c[k][q];c[k][p]=cs*x-sn*y;c[k][q]=sn*x+cs*y;}
    for(k=0;k<3;k++){x=c[p][k];y=c[q][k];c[p][k]=cs*x-sn*y;c[q][k]=sn*x+cs*y;}
    for(k=0;k<3;k++){x=v[k][p];y=v[k][q];v[k][p]=cs*x-sn*y;v[k][q]=sn*x+cs*y;}}
  var ev=[0,1,2].map(function(j){return {l:c[j][j],v:[v[0][j],v[1][j],v[2][j]]};}).sort(function(x,y){return y.l-x.l;});
  return {m:m,e1:ev[0].v,e2:ev[1].v};
}
function fwaFaser(e,L){
  var g=e.geometry,pa=g.attributes.position,n=pa.count,i,k,v=new R();
  var P=new Float32Array(n*3),cx=0;
  for(i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(e.bindMatrix);P[i*3]=v.x;P[i*3+1]=v.y;P[i*3+2]=v.z;cx+=v.x/n;}
  var sg=cx>0?-1:1;
  function bl(p){return [sg*p[0],p[2],-p[1]];}     // Blender (z oben) -> glTF (y oben), linke Seite gespiegelt
  var A0=bl(L.A0),A1=bl(L.A1),B0=bl(L.B0),B1=bl(L.B1);
  var ax=fwaAchsen(P,n),zc=ax.m,e1=ax.e1,e2=ax.e2;
  function p2(p){var x=p[0]-zc[0],y=p[1]-zc[1],z=p[2]-zc[2];return [x*e1[0]+y*e1[1]+z*e1[2],x*e2[0]+y*e2[1]+z*e2[2]];}
  function kr(a,b){return a[0]*b[1]-a[1]*b[0];}
  var a0=p2(A0),a1=p2(A1),b0=p2(B0),b1=p2(B1);
  var dA=[a1[0]-a0[0],a1[1]-a0[1]],E=[b0[0]-a0[0],b0[1]-a0[1]],F=[b1[0]-b0[0]-dA[0],b1[1]-b0[1]-dA[1]];
  var breite=Math.hypot(A1[0]-A0[0],A1[1]-A0[1],A1[2]-A0[2]);
  var uv=new Float32Array(n*2),smin=1e9;
  for(i=0;i<n;i++){
    var q=p2([P[i*3],P[i*3+1],P[i*3+2]]);q=[q[0]-a0[0],q[1]-a0[1]];
    var c2=-kr(dA,F),c1=kr(q,F)-kr(dA,E),c0=kr(q,E),u;
    if(Math.abs(c2)<1e-12)u=-c0/(Math.abs(c1)>1e-18?c1:1e-18);
    else{var dk=Math.sqrt(Math.max(c1*c1-4*c2*c0,0)),r1=(-c1+dk)/(2*c2),r2=(-c1-dk)/(2*c2);
      var d1=Math.abs(Math.min(Math.max(r1,0),1)-r1),d2=Math.abs(Math.min(Math.max(r2,0),1)-r2);u=d1<=d2?r1:r2;}
    if(!isFinite(u))u=0.5;u=Math.min(Math.max(u,-1.5),2.5);
    var D=[E[0]+u*F[0],E[1]+u*F[1]],w=[q[0]-u*dA[0],q[1]-u*dA[1]];
    var t=(w[0]*D[0]+w[1]*D[1])/(D[0]*D[0]+D[1]*D[1]+1e-18);t=Math.min(Math.max(t,-0.3),1.3);
    var L3=0;for(k=0;k<3;k++){var s1=(B0[k]+u*(B1[k]-B0[k]))-(A0[k]+u*(A1[k]-A0[k]));L3+=s1*s1;}
    uv[i*2]=(u+1.5)*breite;uv[i*2+1]=t*Math.sqrt(L3);if(uv[i*2+1]<smin)smin=uv[i*2+1];
  }
  for(i=0;i<n;i++)uv[i*2+1]-=smin;
  // Fuer die Berechnung je Bildpunkt: Ruhelage jedes Punktes und die Kenngroessen des Faechers
  g.setAttribute("fwP",new nt(P,3));
  e.userData.fwU={uFwZc:{value:zc},uFwE1:{value:e1},uFwE2:{value:e2},uFwa0:{value:a0},uFwdA:{value:dA},uFwE:{value:E},uFwF:{value:F},
    uFwA0:{value:A0},uFwAd:{value:[A1[0]-A0[0],A1[1]-A0[1],A1[2]-A0[2]]},uFwB0:{value:B0},uFwBd:{value:[B1[0]-B0[0],B1[1]-B0[1],B1[2]-B0[2]]},
    uFwBreite:{value:breite},uFwSmin:{value:smin},uFwRep:{value:[1/FWA_QUER,1/FWA_LAENGS]}};
  var idx=g.index?g.index.array:null;if(!idx){g.setAttribute("uv",new nt(uv,2));return;}
  var nb=[];for(i=0;i<n;i++)nb.push([]);
  for(i=0;i<idx.length;i+=3){var x0=idx[i],x1=idx[i+1],x2=idx[i+2];nb[x0].push(x1,x2);nb[x1].push(x0,x2);nb[x2].push(x0,x1);}
  // Faserverlauf glaetten: wo der Muskel stark gewoelbt ist, liegen die Fasern in der Abbildung
  // sonst stellenweise extrem dicht und zeigen eine Schraffur. Nachbar-Mitteln verteilt diese
  // einzelnen Spruenge, die Richtung bleibt.
  for(var itu=0;itu<FWA_GLAETTEN;itu++){var U2=new Float32Array(uv);
    for(i=0;i<n;i++){var lu=nb[i];if(!lu.length)continue;var su=0,sv=0;for(k=0;k<lu.length;k++){su+=uv[lu[k]*2];sv+=uv[lu[k]*2+1];}
      U2[i*2]=uv[i*2]+0.5*(su/lu.length-uv[i*2]);U2[i*2+1]=uv[i*2+1]+0.5*(sv/lu.length-uv[i*2+1]);}
    uv=U2;}
  g.setAttribute("uv",new nt(uv,2));
  // Glatte Schattierung: Normalen aus einer geglaetteten Kopie (Taubin), Punkte bleiben unveraendert
  var S=new Float32Array(n*3);for(i=0;i<n*3;i++)S[i]=pa.array?pa.getComponent?0:0:0;
  for(i=0;i<n;i++){S[i*3]=pa.getX(i);S[i*3+1]=pa.getY(i);S[i*3+2]=pa.getZ(i);}
  for(var itn=0;itn<40;itn++){var lam=itn%2===0?0.5:-0.53,T=new Float32Array(S);
    for(i=0;i<n;i++){var l=nb[i];if(!l.length)continue;var mx=0,my=0,mz=0;for(k=0;k<l.length;k++){mx+=S[l[k]*3];my+=S[l[k]*3+1];mz+=S[l[k]*3+2];}
      mx/=l.length;my/=l.length;mz/=l.length;T[i*3]=S[i*3]+lam*(mx-S[i*3]);T[i*3+1]=S[i*3+1]+lam*(my-S[i*3+1]);T[i*3+2]=S[i*3+2]+lam*(mz-S[i*3+2]);}
    S=T;}
  var N=new Float32Array(n*3);
  for(i=0;i<idx.length;i+=3){var ia=idx[i]*3,ib=idx[i+1]*3,ic=idx[i+2]*3;
    var ux=S[ib]-S[ia],uy=S[ib+1]-S[ia+1],uz=S[ib+2]-S[ia+2],vx=S[ic]-S[ia],vy=S[ic+1]-S[ia+1],vz=S[ic+2]-S[ia+2];
    var fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;
    for(var j of [ia,ib,ic]){N[j]+=fx;N[j+1]+=fy;N[j+2]+=fz;}}
  var na=g.attributes.normal;
  for(i=0;i<n;i++){var nx=N[i*3],ny=N[i*3+1],nz=N[i*3+2],ln=Math.hypot(nx,ny,nz)||1;nx/=ln;ny/=ln;nz/=ln;
    if(nx*na.getX(i)+ny*na.getY(i)+nz*na.getZ(i)<0){nx=-nx;ny=-ny;nz=-nz;}na.setXYZ(i,nx,ny,nz);}
  na.needsUpdate=true;
}
function fwaMaterial(mt,tH,tR,U){
  mt.bumpMap=tH;mt.bumpScale=FWA_TIEFE;mt.roughness=0.9;
  var alt=mt.onBeforeCompile,altKey=mt.customProgramCacheKey;
  mt.onBeforeCompile=function(sh,r){if(alt)alt.call(this,sh,r);
    for(var k in U)sh.uniforms[k]=U[k];
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nattribute vec3 fwP;\nvarying vec3 vFwP;")
      .replace("#include <begin_vertex>","#include <begin_vertex>\nvFwP=fwP;");
    // Faserkoordinaten je Bildpunkt aus der Ruhelage: exakter Faecher auch auf grobem Netz
    var fs="uniform vec3 uFwZc,uFwE1,uFwE2,uFwA0,uFwAd,uFwB0,uFwBd;uniform vec2 uFwa0,uFwdA,uFwE,uFwF,uFwRep;uniform float uFwBreite,uFwSmin;varying vec3 vFwP;\n"+
      "float fwKr(vec2 a,vec2 b){return a.x*b.y-a.y*b.x;}\n"+
      "vec2 fwUV(){vec3 d=vFwP-uFwZc;vec2 q=vec2(dot(d,uFwE1),dot(d,uFwE2))-uFwa0;"+
      "float c2=-fwKr(uFwdA,uFwF),c1=fwKr(q,uFwF)-fwKr(uFwdA,uFwE),c0=fwKr(q,uFwE);float u;"+
      "if(abs(c2)<1e-9){u=-c0/(abs(c1)>1e-12?c1:1e-12);}else{float dk=sqrt(max(c1*c1-4.0*c2*c0,0.0));float r1=(-c1+dk)/(2.0*c2),r2=(-c1-dk)/(2.0*c2);"+
      "float d1=abs(clamp(r1,0.0,1.0)-r1),d2=abs(clamp(r2,0.0,1.0)-r2);u=d1<=d2?r1:r2;}"+
      "u=clamp(u,-1.5,2.5);vec2 D=uFwE+u*uFwF;vec2 w=q-u*uFwdA;float t=clamp(dot(w,D)/(dot(D,D)+1e-12),-0.3,1.3);"+
      "float L3=length((uFwB0+u*uFwBd)-(uFwA0+u*uFwAd));return vec2((u+1.5)*uFwBreite,t*L3-uFwSmin)*uFwRep;}\n"+
      "#ifdef USE_BUMPMAP\nvec2 fwDH(){vec2 uv=fwUV();vec2 dx=dFdx(uv),dy=dFdy(uv);float Hll=bumpScale*texture2D(bumpMap,uv).x;"+
      "float dBx=bumpScale*texture2D(bumpMap,uv+dx).x-Hll;float dBy=bumpScale*texture2D(bumpMap,uv+dy).x-Hll;"+
      "vec2 wv=max(abs(dx),abs(dy));float f=max(wv.x,wv.y)*"+FWA_ANZ.toFixed(1)+";return vec2(dBx,dBy)*clamp((0.55-f)/0.3,0.0,1.0);}\n"+
      "#define dHdxy_fwd() fwDH()\n#endif";
    sh.fragmentShader=sh.fragmentShader.replace("#include <bumpmap_pars_fragment>","#include <bumpmap_pars_fragment>\n"+fs);};
  mt.customProgramCacheKey=function(){return (altKey?altKey.call(mt):"")+"|fwfaser2";};
  mt.needsUpdate=true;
}
function fwFaserAnim(){
  if(!Rt||typeof FWA_H==="undefined")return;
  Rt.updateMatrixWorld(true);var tH=fwaTex(FWA_H),tR=fwaTex(FWA_R),anz=0;
  Rt.traverse(function(e){if(!e.isSkinnedMesh)return;var t=e;for(;t&&!(t.userData&&t.userData.name)&&t.parent;)t=t.parent;
    var nm=(t&&t.userData.name||"").replace(/\.(l|r|j)(\.\d+)?$/i,"").trim(),L=FWA_LINIEN[nm];if(!L)return;
    fwaFaser(e,L);if(e.userData.fwU)fwaMaterial(e.material,tH,tR,e.userData.fwU);anz++;});
  self.__fwFaser=anz;
}
