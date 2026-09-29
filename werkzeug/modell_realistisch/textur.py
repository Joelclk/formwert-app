# Erzeugt die gemeinsame, nahtlos kachelbare Faser-Textur (Normal-Map + Rauheit).
# Fasern laufen senkrecht (entlang V). Alles periodisch aufgebaut, damit keine Naht entsteht.
import bpy, numpy as np, os
N=1024; rng=np.random.default_rng(7)
y=np.arange(N)/N; x=np.arange(N)/N
X,Y=np.meshgrid(x,y)            # Zeile=y (entlang Faser), Spalte=x (quer)
def pnoise(X,Y,terms,fx,fy,amp):
    s=np.zeros_like(X)
    for _ in range(terms):
        kx=rng.integers(0,fx+1); ky=rng.integers(1,fy+1); ph=rng.uniform(0,2*np.pi)
        s+=np.sin(2*np.pi*(kx*X+ky*Y)+ph)*rng.uniform(.3,1)
    return s/terms*amp
# Bündelgrenzen: 18 Bündel ungleicher Breite, Grenzen wellen leicht entlang der Faser
nb=11; w=rng.uniform(.5,1.6,nb); edges=np.concatenate([[0],np.cumsum(w)/w.sum()])
warp=pnoise(X,Y,10,3,4,0.018)      # seitliches Ausweichen der Bündel
xs=(X+warp)%1.0
idx=np.searchsorted(edges,xs,side="right")-1
lo=edges[idx]; hi=edges[idx+1]; t=(xs-lo)/(hi-lo)            # 0..1 quer im Bündel
hb=rng.uniform(.7,1.0,nb)[idx]                                 # jedes Bündel etwas anders hoch
bundle=hb*np.sin(np.pi*t)**0.8                                   # gewölbtes Bündel, Furche am Rand
# feine Fasern im Bündel: 7 je Bündel, schwach
nf=rng.integers(4,8,nb)[idx]
fine=0.5+0.5*np.cos(2*np.pi*t*nf+pnoise(X,Y,8,3,8,2.5))
# Längsverlauf: sehr sanfte Wellen und leichte Unregelmäßigkeit je Bündel
seed=(idx*37%11)/11.0
along=pnoise(X,Y,12,6,10,0.25)+0.15*np.sin(2*np.pi*(3*Y+seed))
H=0.80*bundle+0.06*fine+0.14*along
# Normal aus dem Gefälle (periodisch mit np.roll)
dx=(np.roll(H,-1,1)-np.roll(H,1,1))*N/2; dy=(np.roll(H,-1,0)-np.roll(H,1,0))*N/2
s=0.010
nx=-dx*s; ny=-dy*s; nz=np.ones_like(H)
l=np.sqrt(nx*nx+ny*ny+nz*nz); nx/=l; ny/=l; nz/=l
nrm=np.stack([nx*.5+.5,ny*.5+.5,nz*.5+.5,np.ones_like(H)],-1)
# Rauheit: Furchen matter, Bündelrücken etwas glänzender (Muskelhaut)
R=0.62-0.20*bundle+0.05*(fine-0.5)
rough=np.stack([R,R,R,np.ones_like(R)],-1)
def save(arr,name,size):
    img=bpy.data.images.new(name,size,size,alpha=False,float_buffer=False)
    img.colorspace_settings.name="Non-Color"
    a=arr if arr.shape[0]==size else arr[::arr.shape[0]//size,::arr.shape[0]//size]
    img.pixels.foreach_set(np.clip(a[::-1],0,1).astype(np.float32).ravel())   # Blender-Bilder beginnen unten
    img.filepath_raw=os.path.join(os.getcwd(),name+".png"); img.file_format="PNG"; img.save()
save(nrm,"faser_normal",1024); save(rough,"faser_rauheit",512)
print("Höhe min/max",H.min(),H.max(),"Neigung max",float(np.max(np.abs(nx))))
