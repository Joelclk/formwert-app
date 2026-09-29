# Anatomischer Faserverlauf: Fasern laufen vom Ursprung zum Ansatz eines Muskels.
# 1. Ansatzflaechen finden: Punkte, die einen Knochen beruehren (<3 mm) oder zur Sehne gehoeren,
#    zu zusammenhaengenden Flecken gruppiert; die zwei weit auseinanderliegenden, grossen Flecken
#    sind Ursprung und Ansatz.
# 2. Zwischen beiden eine glatte "Laengs"-Groesse phi auf der Oberflaeche loesen (Laplace-Gleichung,
#    wie Waermeausbreitung): ihr Gefaelle zeigt ueberall in Faserrichtung.
# 3. Eine "Quer"-Groesse psi entlang der Fasern vom breiteren Ansatz aus mitfuehren: sie ist entlang
#    jeder Faser konstant. (psi, Laengsweg) werden die Texturkoordinaten.
import numpy as np, os
GLAETTEN=int(os.environ.get('GLAETTEN','40'))
GLATT_FORM=int(os.environ.get('GLATT_FORM','60'))
WEICH=float(os.environ.get('WEICH','0.004'))
from mathutils import Vector

def _cotan_gewichte(co,tri):
    i,j,k=tri[:,0],tri[:,1],tri[:,2]
    def cot(a,b,c):
        u=co[b]-co[a]; v=co[c]-co[a]
        cr=np.linalg.norm(np.cross(u,v),axis=1)+1e-12
        return np.clip(np.sum(u*v,1)/cr,0,5)      # stumpfe Winkel nicht negativ werten
    ca,cb,cc=cot(i,j,k),cot(j,k,i),cot(k,i,j)
    E=np.concatenate([np.stack([j,k],1),np.stack([k,i],1),np.stack([i,j],1)])
    W=np.concatenate([ca,cb,cc])*0.5+1e-6
    return E,W

def _loesen(n,E,W,fest,wert,iters=600):
    # CG fuer das Laplace-Problem mit festen Werten an den Ansaetzen
    frei=~fest; x=np.where(fest,wert,0.5)
    deg=np.bincount(E[:,0],W,n)+np.bincount(E[:,1],W,n)
    def A(v):
        s=np.bincount(E[:,0],W*v[E[:,1]],n)+np.bincount(E[:,1],W*v[E[:,0]],n)
        return deg*v-s
    b=-A(np.where(fest,wert,0.0)); b[fest]=0
    x0=np.where(fest,0.0,0.5); r=b-A(x0); r[fest]=0; p=r.copy(); rs=r@r; x=x0
    for _ in range(iters):
        Ap=A(p); Ap[fest]=0; a=rs/(p@Ap+1e-30); x=x+a*p; r=r-a*Ap; rn=r@r
        if rn<1e-14*n: break
        p=r+(rn/rs)*p; rs=rn
    return np.where(fest,wert,x)

def _komponenten(n,E,maske):
    par=np.arange(n)
    def f(a):
        while par[a]!=a: par[a]=par[par[a]]; a=par[a]
        return a
    for a,b in E:
        if maske[a] and maske[b]:
            ra,rb=f(a),f(b)
            if ra!=rb: par[ra]=rb
    lab=np.full(n,-1)
    for v in np.nonzero(maske)[0]: lab[v]=f(v)
    return lab

def faserfeld(co,tri,knochen_dist,sehne):
    """co: Weltkoordinaten (n,3); tri: Dreiecke; knochen_dist: Abstand zum naechsten Knochen;
       sehne: bool je Punkt. Rueckgabe: uv (n,2) in Metern (quer, laengs) und Infos."""
    n=len(co)
    co_echt=co
    # Die Oberflaeche ist fein gerunzelt (modellierte Riefen). Der Faserverlauf wird auf einer
    # geglaetteten Kopie berechnet, sonst folgt er jeder Runzel und bekommt ein Zickzack.
    Et=np.concatenate([tri[:,[0,1]],tri[:,[1,2]],tri[:,[2,0]]]); Et=np.unique(np.sort(Et,1),axis=0)
    dg=np.maximum(np.bincount(Et[:,0],minlength=n)+np.bincount(Et[:,1],minlength=n),1)
    cs=co.copy()
    for it in range(GLATT_FORM):
        lam=0.5 if it%2==0 else -0.53          # Taubin: glaetten ohne zu schrumpfen
        nbm=np.stack([np.bincount(Et[:,0],cs[Et[:,1],k],n)+np.bincount(Et[:,1],cs[Et[:,0],k],n) for k in range(3)],1)/dg[:,None]
        cs=cs+lam*(nbm-cs)
    co=cs
    E,W=_cotan_gewichte(co,tri)
    Eu=np.unique(np.sort(E,1),axis=0)
    # Muskelbauch und Sehne sind getrennte Flaechenstuecke, die sich nur beruehren. Fuer die
    # Rechnung werden beruehrende Punkte (<1,5 mm) verbunden, sonst kaeme der Verlauf nicht an.
    from mathutils.kdtree import KDTree
    lab0=_komponenten(n,Eu,np.ones(n,bool))
    kd=KDTree(n)
    for i,p_ in enumerate(co): kd.insert(p_,i)
    kd.balance()
    weld=[]
    # deckungsgleiche Punkte (Naehte im Netz, <0,2 mm) immer verbinden; zwischen getrennten
    # Stuecken (Bauch/Sehne) auch etwas groessere Abstaende
    kanten=set(map(tuple,Eu.tolist()))
    for i,p_ in enumerate(co):
        for (_,j,dd) in kd.find_range(p_,0.0015):
            if j<=i or (i,j) in kanten: continue
            if dd<0.0002 or lab0[j]!=lab0[i]: weld.append((i,j))
    weld=np.array(weld,dtype=np.int64).reshape(-1,2)
    if len(weld):
        wmed=float(np.median(W))*4
        E=np.concatenate([E,weld]); W=np.concatenate([W,np.full(len(weld),wmed)])
        Eu=np.unique(np.concatenate([Eu,np.sort(weld,1)]),axis=0)
    teile=len(np.unique(_komponenten(n,Eu,np.ones(n,bool))))
    ausd=np.linalg.norm(co.max(0)-co.min(0))
    min_gr=max(4,int(0.004*n))
    def flecken_von(maske):
        lab=_komponenten(n,Eu,maske)
        f=[np.nonzero(lab==l)[0] for l in np.unique(lab) if l>=0]
        return [x for x in f if len(x)>=min_gr]
    def bestes_paar(fl):
        best=None
        for i in range(len(fl)):
            for j in range(i+1,len(fl)):
                d=np.linalg.norm(co[fl[i]].mean(0)-co[fl[j]].mean(0))
                if d<0.3*ausd: continue
                sc=np.sqrt(min(len(fl[i]),len(fl[j])))*d
                if best is None or sc>best[0]: best=(sc,fl[i],fl[j])
        return best
    def fernster_teil(kandidaten,gegen,anteil=0.75):
        # nur der Teil, der am weitesten vom anderen Ansatz weg liegt (das echte Muskelende)
        d=np.linalg.norm(co-co[gegen].mean(0),axis=1); dm=d.max()
        k=kandidaten[d[kandidaten]>anteil*dm]
        return k if len(k)>=min_gr else np.nonzero(d>0.92*dm)[0]
    knochen=knochen_dist<0.003
    sfl=flecken_von(sehne); info=""
    bp=bestes_paar(sfl)
    if bp: fa,fb=bp[1],bp[2]; info="Sehne-Sehne"
    elif sfl:
        fb=max(sfl,key=len); fa=fernster_teil(np.nonzero(knochen&~sehne)[0],fb); info="Sehne-Knochen"
    else:
        kfl=flecken_von(knochen); bp=bestes_paar(kfl)
        if bp:
            fa=fernster_teil(bp[1],bp[2],0.6); fb=fernster_teil(bp[2],bp[1],0.6); info="Knochen-Knochen"
        else:
            c=co.mean(0); u_,s_,vt=np.linalg.svd(co-c,full_matrices=False); t_=(co-c)@vt[0]
            fa=np.nonzero(t_<np.percentile(t_,4))[0]; fb=np.nonzero(t_>np.percentile(t_,96))[0]; info="Enden geschaetzt"
    flecken=sfl
    fest=np.zeros(n,bool); fest[fa]=True; fest[fb]=True
    # Ursprung und Ansatz als Linien (Hauptrichtung der Ansatzflaeche). Jede Faser verbindet den
    # Punkt bei Anteil u auf der Ursprungslinie mit dem Punkt bei u auf der Ansatzlinie - so
    # entsteht der Faecher. Ein Oberflaechenpunkt gehoert zur naechstgelegenen Faser. Das Ergebnis
    # ist von sich aus glatt: gerade Fasern, die nur der Woelbung des Muskels folgen.
    ce=co_echt
    def linie(f):
        q=ce[f]; c=q.mean(0); ax=np.linalg.svd(q-c,full_matrices=False)[2][0]; t=(q-c)@ax
        return c+ax*np.percentile(t,3), c+ax*np.percentile(t,97)
    A0,A1=linie(fa); B0,B1=linie(fb)
    if (A1-A0)@(B1-B0)<0: B0,B1=B1,B0
    K=96; U=np.linspace(0,1,K)
    PA=A0+U[:,None]*(A1-A0); PB=B0+U[:,None]*(B1-B0); D=PB-PA; DD=np.sum(D*D,1)+1e-12
    best_u=np.zeros(n); best_t=np.zeros(n)
    for s0 in range(0,n,4096):
        p=ce[s0:s0+4096]; w=p[:,None,:]-PA[None]; t=np.clip(np.einsum("nkc,kc->nk",w,D)/DD,0,1)
        d2=np.sum((w-t[...,None]*D[None])**2,2)
        # weiche Zuordnung: nahe Fasern gewichtet mitteln statt hart die naechste nehmen. Wo viele
        # Fasern fast gleich nah sind (am Ansatz, auf stark gewoelbten Muskeln), springt sonst die
        # Zuordnung und es entstehen Stufen.
        dmin=d2.min(1,keepdims=True); tau=dmin+WEICH**2
        g=np.exp(-(d2-dmin)/tau); uu=np.clip((g*U[None]).sum(1)/g.sum(1),0,1)
        pa=A0+uu[:,None]*(A1-A0); dv=(B0+uu[:,None]*(B1-B0))-pa
        tt=np.clip(np.sum((p-pa)*dv,1)/(np.sum(dv*dv,1)+1e-12),0,1)
        best_u[s0:s0+4096]=uu; best_t[s0:s0+4096]=tt*np.sqrt(np.sum(dv*dv,1))
    breite_a=float(np.linalg.norm(A1-A0)); breite_b=float(np.linalg.norm(B1-B0))
    # Wo die Fasern zum schmalen Ansatz zusammenlaufen, werden die Linien enger. Damit sie dort nicht
    # flimmern und am breiten Ursprung nicht zu fein sind, gilt als Querbreite das geometrische Mittel.
    w_eff=float(np.sqrt(max(breite_a,1e-4)*max(breite_b,0.25*breite_a)))
    psi=best_u*w_eff; s=best_t
    L=float(np.median(np.linalg.norm(D,axis=1)))
    gl=np.ones(len(tri)); a,b,c=tri[:,0],tri[:,1],tri[:,2]
    return np.stack([psi,s],1), dict(L=L,teile=teile,weld=len(weld),ursprung=len(fa),ansatz=len(fb),flecken=len(flecken),info=info,phi=best_t,fa=fa,fb=fb)
