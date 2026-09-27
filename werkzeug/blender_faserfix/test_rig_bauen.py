# Nachbau des Fehlerbilds: Muskel folgt dem Knie, Faserpunkte nicht.
import bpy, bmesh, random, math, sys
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 300
# Armatur: Becken -> Oberschenkel -> Unterschenkel -> Fuss
ad = bpy.data.armatures.new("Rig"); arm = bpy.data.objects.new("Rig", ad); sc.collection.objects.link(arm)
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode='EDIT')
def kn(n, h, t, p=None):
    b = ad.edit_bones.new(n); b.head, b.tail = h, t
    if p: b.parent = ad.edit_bones[p]; b.use_connect = True
kn("Becken", (0,0,1.1), (0,0,1.0)); kn("Oberschenkel", (0,0,1.0), (0,0,0.55), "Becken")
kn("Unterschenkel", (0,0,0.55), (0,0,0.1), "Oberschenkel"); kn("Fuss", (0,0,0.1), (0,-0.15,0.05), "Unterschenkel")
bpy.ops.object.mode_set(mode='OBJECT')
# Muskel-Zylinder mit Gewichten nach Höhe
me = bpy.data.meshes.new("Muskel"); bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=32, radius1=0.08, radius2=0.08, depth=0.9)
bmesh.ops.translate(bm, verts=bm.verts, vec=(0,0,0.55))
bmesh.ops.subdivide_edges(bm, edges=[e for e in bm.edges if abs(e.verts[0].co.z-e.verts[1].co.z)>0.5], cuts=40, use_grid_fill=True)
bm.to_mesh(me); bm.free()
mu = bpy.data.objects.new("Muskel_Bein", me); sc.collection.objects.link(mu)
mu.parent = arm
def wz(z):  # Übergang am Knie
    t = min(1, max(0, (0.62 - z)/0.14)); return 1-t, t
go, gu = mu.vertex_groups.new(name="Oberschenkel"), mu.vertex_groups.new(name="Unterschenkel")
for v in me.vertices:
    a, b = wz(v.co.z)
    if a: go.add([v.index], a, 'REPLACE')
    if b: gu.add([v.index], b, 'REPLACE')
m = mu.modifiers.new("Armature", 'ARMATURE'); m.object = arm
# Faserpunkte im Inneren
random.seed(3)
def punkte(n, zmin):
    pts = []
    while len(pts) < n:
        x, y, z = random.uniform(-.07,.07), random.uniform(-.07,.07), random.uniform(zmin, .98)
        if x*x+y*y < .065**2: pts.append((x,y,z))
    return pts
def faser(name, pts):
    me = bpy.data.meshes.new(name); me.from_pydata(pts, [], []); ob = bpy.data.objects.new(name, me)
    sc.collection.objects.link(ob); return ob
fa = faser("FW_Faser_Alle", punkte(4000, .12))
fu = faser("FW_Faser_Unten", punkte(1500, .12))
fu.data.vertices.foreach_set("co", [c for v in fu.data.vertices for c in (v.co.x, v.co.y, min(v.co.z, .6))])
# Fehler 1 (Alle): ARMATURE-Parent + Armature-Modifier (doppelt) + zufällige Knochen
fa.parent = arm; fa.parent_type = 'ARMATURE'
for n in ("Becken","Oberschenkel","Unterschenkel","Fuss"): fa.vertex_groups.new(name=n)
for v in fa.data.vertices:
    fa.vertex_groups[random.choice(["Becken","Oberschenkel","Unterschenkel","Fuss"])].add([v.index], random.uniform(.5,1.5), 'REPLACE')
m = fa.modifiers.new("Armature", 'ARMATURE'); m.object = arm
# Fehler 2 (Unten): alte Arm-Rig-Gruppennamen + Envelopes, starr am Oberschenkel-Knochen
fu.parent = arm; fu.parent_type = 'BONE'; fu.parent_bone = "Oberschenkel"
bpy.context.view_layer.update(); fu.matrix_parent_inverse = fu.matrix_world.inverted()
g = fu.vertex_groups.new(name="upper_arm.L"); g.add(list(range(len(fu.data.vertices))), 1, 'REPLACE')
m = fu.modifiers.new("Armature", 'ARMATURE'); m.object = arm; m.use_bone_envelopes = True
bpy.context.view_layer.update()
# Knie beugen: Bild 1 gestreckt, Bild 273 ~110°
pb = arm.pose.bones["Unterschenkel"]; pb.rotation_mode = 'XYZ'
pb.rotation_euler = (0,0,0); pb.keyframe_insert("rotation_euler", frame=1)
pb.rotation_euler = (math.radians(-110),0,0); pb.keyframe_insert("rotation_euler", frame=273)
po = arm.pose.bones["Oberschenkel"]; po.rotation_mode = 'XYZ'
po.rotation_euler = (0,0,0); po.keyframe_insert("rotation_euler", frame=1)
po.rotation_euler = (math.radians(40),0,0); po.keyframe_insert("rotation_euler", frame=273)
# Anzeige als Punkte über Geometry Nodes, wie in der echten Datei vermutlich
ng = bpy.data.node_groups.new("FW_Punkte", 'GeometryNodeTree')
ng.interface.new_socket("Geometry", in_out='INPUT', socket_type='NodeSocketGeometry')
ng.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')
i, o, mp = ng.nodes.new('NodeGroupInput'), ng.nodes.new('NodeGroupOutput'), ng.nodes.new('GeometryNodeMeshToPoints')
ng.links.new(i.outputs[0], mp.inputs[0]); ng.links.new(mp.outputs[0], o.inputs[0])
for f in (fa, fu): f.modifiers.new("Punkte", 'NODES').node_group = ng
bpy.ops.wm.save_as_mainfile(filepath=sys.argv[-1])
print("OK", sys.argv[-1])
