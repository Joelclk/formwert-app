# Baut Faser-Oberflaeche (nur mittlere Brust) in die Arbeitsdatei des Betrachters ein.
import base64,sys
ziel=sys.argv[1]; glb=sys.argv[2]
h=open(ziel,encoding="utf-8").read()
assert "FW3D_FASER" not in h, "schon eingebaut"
alt_glb=base64.b64encode(open("modell_0.glb","rb").read()).decode(); assert h.count(alt_glb)==1
h=h.replace(alt_glb,base64.b64encode(open(glb,"rb").read()).decode())
hb="data:image/jpeg;base64,"+base64.b64encode(open("faser_hoehe.jpg","rb").read()).decode()
rb="data:image/jpeg;base64,"+base64.b64encode(open("faser_rauheit.jpg","rb").read()).decode()
code=("var FW3D_FASER_H=\""+hb+"\",FW3D_FASER_R=\""+rb+"\";\n"
      "/* Vorerst nur die mittlere Brust (Brustbeinteil des grossen Brustmuskels), siehe werkzeug/modell_realistisch */\n"
      "var FW3D_FASER_NUR={\"Sternocostal head of pectoralis major muscle\":1};\n"
      +open("faser_code.js",encoding="utf-8").read())
anker="var FW3D_REMOVE_SET="; assert h.count(anker)==1; h=h.replace(anker,code+anker)
alt="o.material=o.material.clone(),o.material.color.setHex(fw_groupColors[fw_muscleGroup(bs)]||0xB9C2CC),o.material.roughness=.55,o.material.metalness=.02,pi.push(o)"
assert h.count(alt)==1
h=h.replace(alt,"var _sehne=/^tendon/i.test(o.material.name||\"\");"+alt.replace(",pi.push(o)",",fw3d_faser(o,_sehne),pi.push(o)"))
open(ziel,"w",encoding="utf-8").write(h); print("eingebaut, Datei", len(h)//1024, "KB")
