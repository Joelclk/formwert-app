/* Vorschau (29.09.2026): Faserverlauf der mittleren Brust im Bewegungsablauf (anim-viewer).
   NICHT eingebaut. Einhaengen im ausgepackten animation_viewer.html vor "async function nb(s){",
   Aufruf fwFaserAnim() nach Jg() in nb(). Braucht keine Bild-Textur mehr.
   Stand 2: Faecher je Bild zwischen Brustkorb und Oberarm (keine Knicke), Relief ohne Textur in
   drei Feinheitsstufen, umgeklappte Falten-Dreiecke nicht mehr dunkel. */
/* VORSCHAU: Faserverlauf und glatte Oberflaeche fuer die mittlere Brust im Bewegungsablauf.
   Ursprungs-/Ansatzlinien wie im Koerpermodell (werkzeug/modell_realistisch), Blender-Koordinaten
   der rechten Seite (z = oben); die linke Seite wird gespiegelt.
   Der Faecher wird in jedem Bild neu zwischen Brustbein (Knochen "chest") und Oberarm
   ("upper_arm") aufgespannt und je Bildpunkt ausgewertet. So bleiben die Fasern in jeder Phase
   gerade und zeigen immer zum Oberarm - auch dort, wo das grobe Animationsnetz beim Bewegen an
   den Dreieckskanten abknickt. */
var FWA_LINIEN={"Sternocostal head of pectoralis major muscle":{A0:[-0.023,-0.116,1.244],A1:[-0.011,-0.059,1.397],B0:[-0.174,-0.001,1.309],B1:[-0.166,-0.003,1.358]}};
var FWA_QUER=0.10,FWA_LAENGS=0.20,FWA_ANZ=90,FWA_BUND=9,FWA_F0=0.16,FWA_F1=0.26,FWA_RELIEF=2.5e-4;
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
// Knochen mit dem groessten Gewichtsanteil, dessen Name mit vorn beginnt
function fwaKnochen(e,vorn){
  var g=e.geometry,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,bs=e.skeleton&&e.skeleton.bones,acc={},best=-1,bw=0,i,k;
  if(!si||!sw||!bs)return -1;
  for(i=0;i<si.count;i++)for(k=0;k<4;k++){var b=si.getComponent(i,k),w=sw.getComponent(i,k);if(w>0&&bs[b]&&bs[b].name.indexOf(vorn)===0)acc[b]=(acc[b]||0)+w;}
  for(k in acc)if(acc[k]>bw){bw=acc[k];best=+k;}
  return best;
}
function fwaFaser(e,L){
  var g=e.geometry,pa=g.attributes.position,n=pa.count,i,k,v=new R();
  var ic=fwaKnochen(e,"chest"),ih=fwaKnochen(e,"upper_arm");
  if(ic<0||ih<0)return false;
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
  var breite=Math.hypot(A1[0]-A0[0],A1[1]-A0[1],A1[2]-A0[2]),smin=1e9;
  // Laengs-Nullpunkt aus der Ruhelage, damit die Laengsmuster nicht mit der Bewegung wandern
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
    smin=Math.min(smin,t*Math.sqrt(L3));
  }
  var U={uFwRef:{value:new e.matrixWorld.constructor()},uFwZc:{value:zc},uFwE1:{value:e1},uFwE2:{value:e2},uFwE1v:{value:new R()},uFwE2v:{value:new R()},
    uFwa0:{value:a0},uFwdA:{value:dA},uFwE:{value:E.slice()},uFwF:{value:F.slice()},
    uFwA0:{value:A0},uFwAd:{value:[A1[0]-A0[0],A1[1]-A0[1],A1[2]-A0[2]]},uFwB0:{value:B0.slice()},uFwBd:{value:[B1[0]-B0[0],B1[1]-B0[1],B1[2]-B0[2]]},
    uFwBreite:{value:breite},uFwSmin:{value:smin},uFwRep:{value:[1/FWA_QUER,1/FWA_LAENGS]},uFwPix:{value:0.001}};
  e.userData.fwU=U;
  // In jedem Bild: Bezugsraum = Brustkorb in Ruhelage; Ansatzlinie wandert mit dem Oberarm
  var M4=e.matrixWorld.constructor,K=new M4(),H=new M4(),T=new M4(),VK=new M4(),N3=new e.normalMatrix.constructor(),bv=new R(),altOBR=e.onBeforeRender;
  e.onBeforeRender=function(rd,sc,ca){if(altOBR)altOBR.apply(this,arguments);
    var bs=e.skeleton.bones,bi=e.skeleton.boneInverses;
    K.multiplyMatrices(e.matrixWorld,e.bindMatrixInverse).multiply(bs[ic].matrixWorld).multiply(bi[ic]);
    U.uFwRef.value.copy(K).invert();
    T.multiplyMatrices(bs[ic].matrixWorld,bi[ic]).invert();H.multiplyMatrices(T,bs[ih].matrixWorld).multiply(bi[ih]);
    bv.set(B0[0],B0[1],B0[2]).applyMatrix4(H);var c0=[bv.x,bv.y,bv.z];bv.set(B1[0],B1[1],B1[2]).applyMatrix4(H);var c1=[bv.x,bv.y,bv.z];
    var q0=p2(c0),q1=p2(c1);
    U.uFwE.value[0]=q0[0]-a0[0];U.uFwE.value[1]=q0[1]-a0[1];U.uFwF.value[0]=q1[0]-q0[0]-dA[0];U.uFwF.value[1]=q1[1]-q0[1]-dA[1];
    for(k=0;k<3;k++){U.uFwB0.value[k]=c0[k];U.uFwBd.value[k]=c1[k]-c0[k];}
    // Richtungen fuer Steigungen: invers-transponiert, damit auch eine Skalierung richtig bleibt
    VK.multiplyMatrices(ca.matrixWorldInverse,K);N3.getNormalMatrix(VK);
    U.uFwE1v.value.set(e1[0],e1[1],e1[2]).applyMatrix3(N3);U.uFwE2v.value.set(e2[0],e2[1],e2[2]).applyMatrix3(N3);
    // Groesse eines Bildpunkts je Meter Abstand, fuer die Feinheit der Fasern
    U.uFwPix.value=ca.isPerspectiveCamera?2*Math.tan(ca.fov*Math.PI/360)/Math.max(rd.domElement.height,1):0.001;};
  // Glatte Schattierung: Normalen aus einer geglaetteten Kopie (Taubin), Punkte bleiben unveraendert
  var idx=g.index?g.index.array:null;if(!idx)return true;
  var nb=[];for(i=0;i<n;i++)nb.push([]);
  for(i=0;i<idx.length;i+=3){var x0=idx[i],x1=idx[i+1],x2=idx[i+2];nb[x0].push(x1,x2);nb[x1].push(x0,x2);nb[x2].push(x0,x1);}
  var S=new Float32Array(n*3);
  for(i=0;i<n;i++){S[i*3]=pa.getX(i);S[i*3+1]=pa.getY(i);S[i*3+2]=pa.getZ(i);}
  for(var itn=0;itn<40;itn++){var lam=itn%2===0?0.5:-0.53,S2=new Float32Array(S);
    for(i=0;i<n;i++){var l=nb[i];if(!l.length)continue;var mx=0,my=0,mz=0;for(k=0;k<l.length;k++){mx+=S[l[k]*3];my+=S[l[k]*3+1];mz+=S[l[k]*3+2];}
      mx/=l.length;my/=l.length;mz/=l.length;S2[i*3]=S[i*3]+lam*(mx-S[i*3]);S2[i*3+1]=S[i*3+1]+lam*(my-S[i*3+1]);S2[i*3+2]=S[i*3+2]+lam*(mz-S[i*3+2]);}
    S=S2;}
  var N=new Float32Array(n*3);
  for(i=0;i<idx.length;i+=3){var ia=idx[i]*3,ib=idx[i+1]*3,ic3=idx[i+2]*3;
    var ux=S[ib]-S[ia],uy=S[ib+1]-S[ia+1],uz=S[ib+2]-S[ia+2],vx=S[ic3]-S[ia],vy=S[ic3+1]-S[ia+1],vz=S[ic3+2]-S[ia+2];
    var fx=uy*vz-uz*vy,fy=uz*vx-ux*vz,fz=ux*vy-uy*vx;
    for(var j of [ia,ib,ic3]){N[j]+=fx;N[j+1]+=fy;N[j+2]+=fz;}}
  var na=g.attributes.normal;
  for(i=0;i<n;i++){var nx=N[i*3],ny=N[i*3+1],nz=N[i*3+2],ln=Math.hypot(nx,ny,nz)||1;nx/=ln;ny/=ln;nz/=ln;
    if(nx*na.getX(i)+ny*na.getY(i)+nz*na.getZ(i)<0){nx=-nx;ny=-ny;nz=-nz;}na.setXYZ(i,nx,ny,nz);}
  na.needsUpdate=true;
  return true;
}
function fwaMaterial(mt,U){
  mt.roughness=0.9;
  var alt=mt.onBeforeCompile,altKey=mt.customProgramCacheKey;
  mt.onBeforeCompile=function(sh,r){if(alt)alt.call(this,sh,r);
    for(var k in U)sh.uniforms[k]=U[k];
    // Lage jedes Bildpunkts im Bezugsraum des Brustkorbs (nach dem Mitbewegen)
    sh.vertexShader=sh.vertexShader.replace("#include <common>","#include <common>\nuniform mat4 uFwRef;\nvarying vec3 vFwP;")
      .replace("#include <skinning_vertex>","#include <skinning_vertex>\nvFwP=(uFwRef*(modelMatrix*vec4(transformed,1.0))).xyz;");
    // Das Relief wird ohne Bild-Textur berechnet: keine Kompressions-Kloetzchen und saubere Linien.
    var fs="#define FWA_ANZ "+FWA_ANZ.toFixed(1)+"\n#define FWA_BUND "+FWA_BUND.toFixed(1)+"\n#define FWA_F0 "+FWA_F0.toFixed(3)+"\n#define FWA_F1 "+FWA_F1.toFixed(3)+"\n#define FWA_RELIEF "+FWA_RELIEF.toExponential(3)+"\n"+
      "uniform vec3 uFwZc,uFwE1,uFwE2,uFwE1v,uFwE2v,uFwA0,uFwAd,uFwB0,uFwBd;uniform vec2 uFwa0,uFwdA,uFwE,uFwF,uFwRep;uniform float uFwBreite,uFwSmin,uFwPix;varying vec3 vFwP;\n"+
      "float fwKr(vec2 a,vec2 b){return a.x*b.y-a.y*b.x;}\n"+
      // Faser durch den Punkt: gerade Linie von Ursprung(u) zu Ansatz(u); quer = u, laengs = t
      "vec2 fwUVq(vec2 q){"+
      "float c2=-fwKr(uFwdA,uFwF),c1=fwKr(q,uFwF)-fwKr(uFwdA,uFwE),c0=fwKr(q,uFwE);float u;"+
      "if(abs(c2)<1e-9){u=-c0/(abs(c1)>1e-12?c1:1e-12);}else{float dk=sqrt(max(c1*c1-4.0*c2*c0,0.0));float r1=(-c1+dk)/(2.0*c2),r2=(-c1-dk)/(2.0*c2);"+
      "float d1=abs(clamp(r1,0.0,1.0)-r1),d2=abs(clamp(r2,0.0,1.0)-r2);u=d1<=d2?r1:r2;}"+
      "u=clamp(u,-1.5,2.5);vec2 D=uFwE+u*uFwF;vec2 w=q-u*uFwdA;float t=clamp(dot(w,D)/(dot(D,D)+1e-12),-0.3,1.3);"+
      "float L3=length((uFwB0+u*uFwBd)-(uFwA0+u*uFwAd));return vec2((u+1.5)*uFwBreite,t*L3-uFwSmin)*uFwRep;}\n"+
      "float fwZuf(float n){return fract(sin(n*12.9898+4.1414)*43758.5453);}\n"+
      // Hoehe und ihre Ableitungen (quer, laengs) je Kachel: weiches Wellenprofil, jede Faser eigene Hoehe
      "vec3 fwProfil(vec2 uv,float anz){float tf=uv.x*anz,i=floor(tf),fr=tf-i,hi=0.55+0.45*fwZuf(i+anz),ph=6.2832*(uv.y+fwZuf(i+anz+71.3));"+
      "float la=1.0+0.08*sin(ph),p=0.5-0.5*cos(6.2832*fr);return vec3(hi*p*la,hi*3.14159*sin(6.2832*fr)*anz*la,hi*p*0.08*6.2832*cos(ph));}\n"+
      "vec3 fwNormal(vec3 N){vec3 d=vFwP-uFwZc;vec2 q=vec2(dot(d,uFwE1),dot(d,uFwE2))-uFwa0;"+
      "vec2 uv=fwUVq(q);vec2 ga=(fwUVq(q+vec2(0.002,0.0))-uv)*500.0,gb=(fwUVq(q+vec2(0.0,0.002))-uv)*500.0;"+
      "vec3 gx=ga.x*uFwE1v+gb.x*uFwE2v,gy=ga.y*uFwE1v+gb.y*uFwE2v;gx-=dot(gx,N)*N;gy-=dot(gy,N)*N;"+
      // Feinheit (Fasern je Bildpunkt) aus Blickabstand, Blickwinkel und glatter Normale statt aus
      // dFdx: dessen Wert springt an jeder Dreieckskante und ergab sichtbare Dreiecksflecken.
      "vec3 Vr=normalize(-vViewPosition);float nv=dot(N,Vr);nv=nv<0.0?min(nv,-0.2):max(nv,0.2);float px=uFwPix*length(vViewPosition);"+
      "vec3 sx=px*(vec3(1.0,0.0,0.0)-Vr*(N.x/nv)),sy=px*(vec3(0.0,1.0,0.0)-Vr*(N.y/nv));"+
      "float f=max(abs(dot(gx,sx)),abs(dot(gx,sy)))*FWA_ANZ;"+
      // Drei Stufen (Einzelfaser, kleines Buendel, grosses Buendel) mit gleicher Neigung: so ist der
      // Verlauf aus jeder Entfernung gleich deutlich. Jede Stufe blendet aus, bevor ihre Linien
      // enger als ~4 Bildpunkte liegen (sonst Moire).
      "vec2 H=vec2(0.0);vec3 P;float wl;"+
      "wl=clamp((FWA_F1-f)/(FWA_F1-FWA_F0),0.0,1.0);if(wl>0.0){P=fwProfil(uv,FWA_ANZ);H+=wl*vec2(0.50*P.y,0.5*P.z);}"+
      "wl=clamp((FWA_F1-f/3.0)/(FWA_F1-FWA_F0),0.0,1.0);if(wl>0.0){P=fwProfil(uv,FWA_ANZ/3.0);H+=wl*vec2(0.40*3.0*P.y,0.3*P.z);}"+
      "wl=clamp((FWA_F1-f/FWA_BUND)/(FWA_F1-FWA_F0),0.0,1.0);if(wl>0.0){P=fwProfil(uv,FWA_ANZ/FWA_BUND);H+=wl*vec2(0.35*FWA_BUND*P.y,0.2*P.z);}"+
      // Umgeklappte Falten-Dreiecke ohne Relief, sonst erscheint dort ein gespiegeltes Muster
      "if(!gl_FrontFacing)H=vec2(0.0);"+
      "return normalize(N-FWA_RELIEF*(H.x*gx+H.y*gy));}\n";
    // Beim Bewegen klappt das grobe Netz an einzelnen Stellen um; deren Rueckseite waere dunkel
    // und saehe aus wie ein Loch. Die geglaettete Normale zeigt dort ohnehin nach aussen.
    sh.fragmentShader=sh.fragmentShader.replace("#include <common>","#include <common>\n"+fs)
      .replace("#include <normal_fragment_begin>","#include <normal_fragment_begin>\n#ifdef DOUBLE_SIDED\nnormal*=faceDirection;nonPerturbedNormal=normal;faceDirection=1.0;\n#endif")
      .replace("#include <normal_fragment_maps>","#include <normal_fragment_maps>\nnormal=fwNormal(normal);");};
  mt.customProgramCacheKey=function(){return (altKey?altKey.call(mt):"")+"|fwfaser7";};
  mt.needsUpdate=true;
}
function fwFaserAnim(){
  if(!Rt)return;
  Rt.updateMatrixWorld(true);var anz=0;
  Rt.traverse(function(e){if(!e.isSkinnedMesh)return;var t=e;for(;t&&!(t.userData&&t.userData.name)&&t.parent;)t=t.parent;
    var nm=(t&&t.userData.name||"").replace(/\.(l|r|j)(\.\d+)?$/i,"").trim(),L=FWA_LINIEN[nm];if(!L)return;
    if(fwaFaser(e,L)){fwaMaterial(e.material,e.userData.fwU);anz++;}});
  self.__fwFaser=anz;
}
