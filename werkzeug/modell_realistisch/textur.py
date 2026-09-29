# Gemeinsame, nahtlos kachelbare Faser-Textur (Relief + Rauheit), wie im anatomischen Lehrbild:
# feine, dichte, schnurgerade Fasern entlang V. Keine seitliche Welle - Kruemmung entsteht
# allein durch den berechneten Faserverlauf auf dem Muskel.
import bpy, numpy as np, os
N=1024; rng=np.random.default_rng(11)
x=(np.arange(N)+0.5)/N
FEIN=40                                   # feine Fasern je Kachelbreite (~3 mm bei 12 cm)
# jede feine Faser eigene Hoehe und Breite, aber exakt gerade
tf=x*FEIN; idx=np.floor(tf).astype(int)%FEIN; fr=tf-np.floor(tf)
hoehe=rng.uniform(0.55,1.0,FEIN)[idx]; breit=rng.uniform(0.55,0.9,FEIN)[idx]
# weiches Profil (reine Wellenform): bleibt auch bei wenigen Bildpunkten ohne Treppenstufen
fein=hoehe*(0.5-0.5*np.cos(2*np.pi*fr))
# Buendel: 7 Gruppen, sehr flache Woelbung, betont die Gruppierung ohne Wellen
nb=7; edges=np.concatenate([[0],np.cumsum(rng.uniform(.7,1.3,nb))]); edges/=edges[-1]
bi=np.searchsorted(edges,x,side="right")-1; tb=(x-edges[bi])/(edges[bi+1]-edges[bi])
buendel=np.sin(np.pi*tb)**0.5*rng.uniform(.8,1.0,nb)[bi]
h_quer=0.65*fein+0.35*buendel             # nur quer veraenderlich -> Fasern gerade
# entlang der Faser nur sanfte Helligkeitsschwankung der Tiefe (periodisch, kein Versatz)
y=(np.arange(N)+0.5)/N
lang=1.0+0.08*np.sin(2*np.pi*(y[:,None]*1+rng.uniform(0,1,FEIN)[idx][None,:]))
H=h_quer[None,:]*lang
dx=(np.roll(H,-1,1)-np.roll(H,1,1))*N/2; dy=(np.roll(H,-1,0)-np.roll(H,1,0))*N/2
st=0.0060
nx=-dx*st; ny=-dy*st; nz=np.ones_like(H); l=np.sqrt(nx*nx+ny*ny+nz*nz)
nrm=np.stack([nx/l*.5+.5,ny/l*.5+.5,nz/l*.5+.5,np.ones_like(H)],-1)
R=np.broadcast_to(0.66-0.18*h_quer[None,:],H.shape)
rough=np.stack([R,R,R,np.ones_like(H)],-1)
def save(arr,name,size):
    img=bpy.data.images.new(name,size,size,alpha=False); img.colorspace_settings.name="Non-Color"
    a=arr if arr.shape[0]==size else arr[::arr.shape[0]//size,::arr.shape[0]//size]
    img.pixels.foreach_set(np.ascontiguousarray(np.clip(a[::-1],0,1)).astype(np.float32).ravel())
    img.filepath_raw=os.path.join(os.getcwd(),name+".png"); img.file_format="PNG"; img.save()
Hn=(H-H.min())/(H.max()-H.min())
save(np.stack([Hn,Hn,Hn,np.ones_like(Hn)],-1),"faser_hoehe",1024)
save(nrm,"faser_normal",1024); save(rough,"faser_rauheit",512)
print("ok, Neigung max",float(np.abs(nx/l).max()))
