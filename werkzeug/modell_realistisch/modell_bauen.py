# Berechnet für ausgewählte Muskeln, wie stark jeder Punkt von Nachbarn verdeckt ist
# (Umgebungsverdeckung), und speichert das als Punktfarbe. Namen und Aufbau bleiben unverändert.
import bpy, bmesh, numpy as np, sys, os, time, math
from mathutils.bvhtree import BVHTree
from mathutils import Vector
a=sys.argv[sys.argv.index("--")+1:]
MUSKEL, KNOCHEN, ZIEL = a[0], a[1], a[2]
NUR = set(a[3].split("|")) if len(a)>3 and a[3] else None      # Grundnamen; leer = alle Muskeln
RAYS=48; WEITE=0.05; ANHEB=0.0004
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=MUSKEL); mus=set(bpy.data.objects)
bpy.ops.import_scene.gltf(filepath=KNOCHEN); alle=set(bpy.data.objects)
dg=bpy.context.evaluated_depsgraph_get()
# Ein gemeinsamer Suchbaum über alle Dreiecke in Weltkoordinaten
V=[];P=[];off=0
import json,re
AUS=json.load(open(os.path.join(os.path.dirname(MUSKEL) or ".","ausgeblendet.json")))
AUS=set(AUS["FW3D_REMOVE_SET"])|set(AUS["FW3D_SKULL_SET"])
def sichtbar(o):
    # Nur was der Betrachter auch zeigt, darf Schatten werfen
    if re.match(r"(muscular|skeletal) system",o.name,re.I): return False
    return re.sub(r"\.(l|r|j)$","",o.name,flags=re.I).strip() not in AUS
weg=0
for o in alle:
    if o.type!="MESH": continue
    if not sichtbar(o): weg+=1; continue
    m=o.data; mw=o.matrix_world
    co=np.empty(len(m.vertices)*3,np.float32); m.vertices.foreach_get("co",co); co=co.reshape(-1,3)
    co=(np.c_[co,np.ones(len(co))]@np.array(mw).T)[:,:3]
    V.append(co)
    m.calc_loop_triangles()
    tri=np.empty(len(m.loop_triangles)*3,np.int32); m.loop_triangles.foreach_get("vertices",tri)
    P.append(tri.reshape(-1,3)+off); off+=len(co)
V=np.vstack(V); P=np.vstack(P)
sys.path.insert(0,os.path.dirname(os.path.abspath(MUSKEL)))
from faserfeld import faserfeld
KV=[];KP=[];KN=[];koff=0
for o in alle:
    if o in mus or o.type!="MESH" or not sichtbar(o): continue
    m=o.data; mw=o.matrix_world
    co=np.empty(len(m.vertices)*3,np.float32); m.vertices.foreach_get("co",co); co=co.reshape(-1,3)
    co=(np.c_[co,np.ones(len(co))]@np.array(mw).T)[:,:3]; KV.append(co)
    m.calc_loop_triangles(); tri=np.empty(len(m.loop_triangles)*3,np.int32); m.loop_triangles.foreach_get("vertices",tri)
    KP.append(tri.reshape(-1,3)+koff); KN+= [re.sub(r"\.(l|r|j)$","",o.name)]*len(m.loop_triangles); koff+=len(co)
kbvh=BVHTree.FromPolygons(np.vstack(KV).tolist(),np.vstack(KP).tolist(),all_triangles=True)
FASER=os.environ.get("FASER","1")=="1"
FCACHE=ZIEL+".faser.npz"; FVOR=dict(np.load(FCACHE,allow_pickle=True)) if os.path.exists(FCACHE) else {}; FNEU={}
t=time.time(); bvh=BVHTree.FromPolygons(V.tolist(),P.tolist(),all_triangles=True,epsilon=0.0)
print("ohne",weg,"ausgeblendete Objekte; Suchbaum", len(P), "Dreiecke,", round(time.time()-t,1),"s")
# Gleichmäßig verteilte Richtungen auf der Halbkugel (kosinusgewichtet), fest für Wiederholbarkeit
rng=np.random.default_rng(3)
u=(np.arange(RAYS)+rng.random(RAYS))/RAYS; phi=np.arange(RAYS)*2.399963
r=np.sqrt(u); H=np.stack([r*np.cos(phi),r*np.sin(phi),np.sqrt(1-u)],1)
def grund(n): 
    import re; return re.sub(r"\.(l|r|j)$","",n,flags=re.I).strip()
fertig=set(); t=time.time(); anz=0; CACHE={}
CACHEDATEI=ZIEL+'.ao.npz'
if os.path.exists(CACHEDATEI):
    VORHER=dict(np.load(CACHEDATEI))
else: VORHER={}
for o in sorted(mus,key=lambda o:o.name):
    if o.type!="MESH" or o.data.name in fertig: continue
    if NUR is not None and grund(o.name) not in NUR: continue
    if not o.name.endswith(".r") and any(x.data==o.data and x.name.endswith(".r") for x in mus if x.type=="MESH"): continue
    m=o.data; fertig.add(m.name); mw=o.matrix_world; nm=mw.to_3x3().inverted().transposed()
    n=len(m.vertices)
    co=np.empty(n*3,np.float32); m.vertices.foreach_get("co",co); co=co.reshape(-1,3)
    no=np.empty(n*3,np.float32); m.vertices.foreach_get("normal",no); no=no.reshape(-1,3)
    if m.name in VORHER and len(VORHER[m.name])==n:
        c=VORHER[m.name]
    else:
        ao=np.ones(n,np.float32)
        for i in range(n):
            p=mw@Vector(co[i]); nn=(nm@Vector(no[i])).normalized()
            tx=nn.orthogonal().normalized(); ty=nn.cross(tx)
            o0=p+nn*ANHEB; frei=0.0
            for h in H:
                d=tx*h[0]+ty*h[1]+nn*h[2]
                hit=bvh.ray_cast(o0,d,WEITE)
                if hit[0] is None: frei+=1
                else: frei+=min(1.0,hit[3]/WEITE)**2      # nahe Treffer dunkeln stärker
            ao[i]=frei/RAYS
        # Helligkeit: nie ganz schwarz, damit die App-Farbe sichtbar bleibt. In 16 Stufen,
        # das reicht fuers Auge und laesst sich viel kleiner speichern.
        c=np.round((0.42+0.58*np.power(ao,1.3))*16)/16
    CACHE[m.name]=c
    att=m.attributes.get("_AO") or m.attributes.new("_AO","FLOAT","POINT")
    att.data.foreach_set("value",c.astype(np.float32))
    anz+=n
    if FASER:
        if m.name in FVOR and len(FVOR[m.name])==n: uv=FVOR[m.name]
        else:
            cw=(np.c_[co,np.ones(n)]@np.array(mw).T)[:,:3]
            m.calc_loop_triangles(); tri=np.empty(len(m.loop_triangles)*3,np.int32); m.loop_triangles.foreach_get("vertices",tri); tri=tri.reshape(-1,3)
            kd=np.empty(n); kn=[None]*n
            for i in range(n):
                r=kbvh.find_nearest(Vector(cw[i])); kd[i]=r[3] if r[0] else 1.0; kn[i]=KN[r[2]] if r[0] else None
            sehne=np.zeros(n,bool)
            for pl in m.polygons:
                mt=o.material_slots[pl.material_index].material if pl.material_index<len(o.material_slots) else None
                if mt and mt.name.startswith("Tendon"): sehne[list(pl.vertices)]=True
            # Die Verdrehung der Brustmuskel-Sehne liegt in der Tiefe; an der Oberflaeche kreuzen sich
            # die Fasern nicht. Deshalb hier keine Verdrehung.
            VERDREHT=set()
            # Ansatz entlang eines Knochens: Name des Knochens und anatomische Breite der Ansatzlinie
            ANSATZ={"Sternocostal head of pectoralis major muscle":("Humerus",0.05),
                    "(Abdominal part of pectoralis major muscle)":("Humerus",0.05),
                    "Clavicular head of pectoralis major muscle":("Humerus",0.05)}
            achse=None; breite=0.0
            if grund(o.name) in ANSATZ:
                kname,breite=ANSATZ[grund(o.name)]; seite=o.name[-2:]
                ko=bpy.data.objects.get(kname+seite) or bpy.data.objects.get(kname)
                if ko:
                    kc=np.array([ko.matrix_world@v.co for v in ko.data.vertices]); achse=np.linalg.svd(kc-kc.mean(0),full_matrices=False)[2][0]
            uv,inf=faserfeld(cw,tri,kd,sehne,verdreht=grund(o.name) in VERDREHT,ansatz_achse=achse,ansatz_breite=breite)
            fmt=lambda v:"(%.3f %.3f %.3f)"%tuple(v)
            print("LINIEN",o.name,"Ursprung",fmt(inf["A"][0]),"->",fmt(inf["A"][1]),"Ansatz",fmt(inf["B"][0]),"->",fmt(inf["B"][1]),"Ansatzbreite %.3f m"%np.linalg.norm(inf["B"][1]-inf["B"][0]))
            def welche(f):
                import collections
                c=collections.Counter(kn[i] for i in f if kd[i]<0.004); return ", ".join("%s(%d)"%x for x in c.most_common(2)) or "Sehne"
            print("FASER",o.name,"| breit:",welche(inf["fa"]),"| schmal:",welche(inf["fb"]),"| L=%.3f m psi %.3f..%.3f Teile %d Naehte %d"%(inf["L"],uv[:,0].min(),uv[:,0].max(),inf["teile"],inf["weld"]),inf["info"])
        FNEU[m.name]=uv
        ul=m.uv_layers.get("UVMap") or m.uv_layers.new(name="UVMap")
        li=np.empty(len(m.loops),np.int32); m.loops.foreach_get("vertex_index",li)
        ul.data.foreach_set("uv",uv[li].astype(np.float32).ravel())
np.savez_compressed(CACHEDATEI,**CACHE)
if FASER: np.savez_compressed(FCACHE,**FNEU)
print("AO fertig:",anz,"Punkte in",round(time.time()-t,1),"s")
# Nur das Muskelmodell exportieren, gleiche Kompression wie beim Probelauf
for o in bpy.data.objects: o.select_set(o in mus)
bpy.ops.export_scene.gltf(filepath=ZIEL, export_format="GLB", use_selection=True, export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6, export_draco_position_quantization=14, export_draco_normal_quantization=10,
    export_draco_texcoord_quantization=12, export_draco_color_quantization=8, export_draco_generic_quantization=int(os.environ.get('AOQ','6')),
    export_yup=True, export_apply=False, export_materials="EXPORT", export_vertex_color="NONE", export_attributes=True,
    export_extras=False, export_cameras=False, export_lights=False, export_animations=False, export_skins=False, export_morph=False)
print("Export ->", os.path.getsize(ZIEL)//1024, "KB")
