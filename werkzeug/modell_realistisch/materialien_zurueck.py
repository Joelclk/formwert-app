# Stellt nach dem Speichern durch Blender die Materialangaben des Originals wieder her
# (Namen ohne ".001", Ausschneide-Schwelle, Glanzwerte). Die Geometrie bleibt unberührt.
import json,struct,re,sys
def lesen(f):
    g=open(f,"rb").read(); cl=struct.unpack("<I",g[12:16])[0]
    j=json.loads(g[20:20+cl]); rest=g[20+cl:]; return j,rest
def schreiben(f,j,rest):
    js=json.dumps(j,separators=(",",":"),ensure_ascii=False).encode("utf-8"); js+=b" "*((4-len(js)%4)%4)
    body=struct.pack("<II",len(js),0x4E4F534A)+js+rest
    open(f,"wb").write(struct.pack("<III",0x46546C67,2,12+len(body))+body)
orig,_=lesen(sys.argv[1]); neu,rest=lesen(sys.argv[2])
vor={}
for m in orig["materials"]: vor.setdefault(m["name"],m)
n=0
for m in neu["materials"]:
    basis=re.sub(r"\.\d{3}$","",m["name"])
    o=vor.get(basis)
    if not o: print("kein Original fuer",m["name"]); continue
    for k in ("alphaMode","alphaCutoff","pbrMetallicRoughness","extensions","doubleSided"):
        if k in o: m[k]=json.loads(json.dumps(o[k]))
        elif k in m and k!="doubleSided": del m[k]
    m["name"]=basis; n+=1
ext=set(neu.get("extensionsUsed",[]))
for m in neu["materials"]: ext|=set(m.get("extensions",{}).keys())
neu["extensionsUsed"]=sorted(ext)
schreiben(sys.argv[2],neu,rest); print("Materialien angepasst:",n)
