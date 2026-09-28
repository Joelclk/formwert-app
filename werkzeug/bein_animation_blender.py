# -*- coding: utf-8 -*-
# Formwert – Bein- und Hüftbewegungen aus dem Anatomie-Rig exportieren (Blender 3.6 oder 4.x)
#
# Was das Skript macht:
#   1. findet das Rig ("FORMWERT Production Anatomy Rig", Knochen thigh.R, shin.R, …),
#   2. sucht die Muskeln und Knochen des rechten Beins, der Hüfte und des Beckens,
#   3. legt vier Bewegungen als Aktionen an und stellt sie in NLA-Spuren:
#        hipcar     Hüftkreisen im Stand, Knie gebeugt (Hip CAR)
#        legcircle  gestrecktes Bein heben und kreisen
#        gate       Tor öffnen (Knie vorn hoch, nach außen führen, absetzen)
#        legswing   Beinpendel vor und zurück
#   4. exportiert alles als GLB neben die .blend-Datei: formwert_anim_bein.glb,
#   5. lädt die gespeicherte Datei wieder, damit nichts davon in der .blend bleibt.
#
# Ablauf in Blender: Datei SPEICHERN (das Skript bricht sonst ab), dann Tab "Scripting" ->
# "+ New" -> dieses Skript einfügen -> "Run Script" (▶). Der Bericht steht danach in der
# Datei formwert_anim_bein_bericht.txt neben der .blend und in der Systemkonsole. Durch das
# Neuladen am Ende verschwindet der eingefügte Skripttext wieder – bei Bedarf neu einfügen.
# Alternativ ohne Oberfläche:
#   /Applications/Blender.app/Contents/MacOS/Blender --background DATEI.blend --python werkzeug/bein_animation_blender.py
#
# NUR_VORSCHAU = True: baut nur die Bewegungen zum Anschauen (Leertaste in der Timeline,
# Aktion im Dope Sheet / Action Editor wechseln), exportiert nichts und lädt nichts neu.
# Danach die Datei einfach NICHT speichern (oder "File > Revert").
#
# Danach im Repo: gltfpack -i formwert_anim_bein.glb -o bein.glb -kn -c
#                 python3 werkzeug/animation_einpacken.py modell bein.glb bein

import bpy, math, os, re
from mathutils import Vector, Quaternion, Matrix

NUR_VORSCHAU = False
MIT_FUSSMUSKELN = True      # kleine Fußmuskeln mitnehmen (etwas größer, aber der Fuß sieht voll aus)
FPS = 30
DAUER_S = 4.0                # jede Bewegung ist eine Schleife von 4 Sekunden
DATEINAME = "formwert_anim_bein.glb"

zeilen = []


def out(*t):
    z = " ".join(str(x) for x in t)
    print(z)
    zeilen.append(z)


def bericht_schreiben():
    txt = bpy.data.texts.get("Bein_Export_Bericht") or bpy.data.texts.new("Bein_Export_Bericht")
    txt.clear()
    txt.write("\n".join(zeilen))
    # Auch als Datei: das Neuladen am Ende wirft alle Textblöcke weg, die nicht in der .blend stehen.
    if bpy.data.filepath:
        with open(os.path.join(os.path.dirname(bpy.data.filepath), "formwert_anim_bein_bericht.txt"), "w", encoding="utf-8") as f:
            f.write("\n".join(zeilen))


# ------------------------------------------------------------------ Objekte finden
def seite_ab(name):
    return re.sub(r"\.(r|l|R|L)$", "", name)


def ist_rechts(name):
    return bool(re.search(r"\.(r|R)$", name))


def ist_links(name):
    return bool(re.search(r"\.(l|L)$", name))


# Muskeln des rechten Beins (Regex auf den Namen ohne Seitenkürzel, Groß-/Kleinschreibung egal).
MUSKELN = [
    r"^Gluteus (maximus|medius|minimus)", r"^Tensor (of )?fascia", r"^Iliotibial tract",
    r"^Iliacus", r"^Psoas (major|minor)", r"^Sartorius",
    r"^Rectus femoris", r"^Vastus (lateralis|medialis|intermedius)",
    r"^(Long|Short) head of biceps femoris", r"^Semimembranosus", r"^Semitendinosus",
    r"^\(?Adductor (magnus|longus|brevis|minimus)", r"^Gracilis", r"^Pectineus",
    r"^Piriformis", r"^(Superior|Inferior) gemellus", r"^Obturator (internus|externus)", r"^Quadratus femoris",
    r"^(Medial|Lateral) head of gastrocnemius", r"^Soleus", r"^Plantaris", r"^Popliteus",
    r"^Tibialis (anterior|posterior)", r"^Extensor (digitorum|hallucis) longus",
    r"^(Fibularis|Peroneus) (longus|brevis|tertius)", r"^Flexor (digitorum|hallucis) longus",
]
FUSSMUSKELN = [
    r"^Extensor (digitorum|hallucis) brevis", r"^Abductor hallucis", r"^Flexor digitorum brevis",
    r"^(Medial|Lateral) head of flexor hallucis brevis", r"^(Oblique|Transverse) head of adductor hallucis",
    r"^Quadratus plantae", r"^Lumbrical muscles of (the )?foot", r"^(Plantar|Dorsal) interossei( muscles)?( of (the )?foot)?$",
    r"^Abductor digiti minimi of (the )?foot", r"^Flexor digiti minimi brevis( of (the )?foot)?$",
    r"^Opponens digiti minimi( muscle)? of (the )?foot",
]
# Knochen: rechtes Bein und Fuß, dazu Becken und Lendenwirbel (beide Seiten bzw. Mitte).
KNOCHEN_RECHTS = [r"^(Femur|Patella|Tibia|Fibula|Calcaneus|Talus)( bone)?$", r"^(Navicular|Cuboid)( bone)?$",
                  r"cuneiform", r"metatarsal", r"phalanx .*toe", r"^Sesamoid"]
KNOCHEN_BEIDE = [r"^Hip bone$"]
KNOCHEN_MITTE = [r"^Sacrum$", r"^Coccyx$", r"^Vertebra L[1-5]$"]
# Was nie mitkommt: Faser-Punktwolken, Hilfsobjekte, Handmuskeln mit ähnlichen Namen.
AUSSCHLUSS = [r"^FW_", r"of hand", r"pollicis", r"carpi", r"indicis", r"\.\d{3}$"]


def passt(name, muster):
    return any(re.search(m, name, re.I) for m in muster)


def objekte_sammeln():
    muskeln, knochen, fehlend = [], [], []
    gefunden = set()
    for o in bpy.data.objects:
        if o.type != "MESH" or passt(o.name, AUSSCHLUSS):
            continue
        kern = seite_ab(o.name)
        if ist_rechts(o.name) and (passt(kern, MUSKELN) or (MIT_FUSSMUSKELN and passt(kern, FUSSMUSKELN))):
            muskeln.append(o); gefunden.add(kern)
        elif ist_rechts(o.name) and passt(kern, KNOCHEN_RECHTS):
            knochen.append(o); gefunden.add(kern)
        elif (ist_rechts(o.name) or ist_links(o.name)) and passt(kern, KNOCHEN_BEIDE):
            knochen.append(o); gefunden.add(kern)
        elif not ist_rechts(o.name) and not ist_links(o.name) and passt(o.name, KNOCHEN_MITTE):
            knochen.append(o); gefunden.add(o.name)
    for m in MUSKELN + KNOCHEN_RECHTS + KNOCHEN_BEIDE + KNOCHEN_MITTE:
        if not any(re.search(m, g, re.I) for g in gefunden):
            fehlend.append(m)
    return muskeln, knochen, fehlend


# ------------------------------------------------------------------ Rig und Achsen
def rig_finden():
    for o in bpy.data.objects:
        if o.type == "ARMATURE" and "thigh.R" in o.data.bones and "shin.R" in o.data.bones:
            return o
    return None


class Achsen:
    """Körperachsen im Raum des Rigs: up (oben), fwd (vorn), out (nach rechts außen)."""

    def __init__(self, arm):
        Mi = arm.matrix_world.inverted().to_3x3()
        b = arm.data.bones
        self.up = (Mi @ Vector((0, 0, 1))).normalized()
        hr, hl = b["hip_socket.R"].head_local, b["hip_socket.L"].head_local
        o = hr - hl
        o = (o - o.project(self.up)).normalized()
        self.out = o
        self.fwd = self.up.cross(self.out).normalized()
        # Gegenprobe mit den Zehen: die zeigen nach vorn.
        zeh = b.get("toe_3_metatarsal_01.R") or b.get("foot.R")
        if zeh is not None:
            z = zeh.tail_local - zeh.head_local
            z = (z - z.project(self.up))
            if z.length > 1e-6 and z.normalized().dot(self.fwd) < 0:
                out("Hinweis: Vorn-Achse aus den Zehen widerspricht der Hüftachse – nehme die Zehenrichtung.")
                self.fwd = z.normalized()
                self.out = self.fwd.cross(self.up).normalized()

    def richtung(self, theta_deg, phi_deg):
        """Oberschenkelrichtung: theta = Hebung aus dem Lot (0 hängt, 90 waagerecht),
        phi = 0 nach vorn, 90 nach außen, 180 nach hinten."""
        th, ph = math.radians(theta_deg), math.radians(phi_deg)
        return (-self.up * math.cos(th) + (self.fwd * math.cos(ph) + self.out * math.sin(ph)) * math.sin(th)).normalized()


class Beinpose:
    def __init__(self, arm, ax):
        self.arm, self.ax = arm, ax
        self.pb = arm.pose.bones
        for n in ("thigh.R", "shin.R", "foot.R"):
            self.pb[n].rotation_mode = "QUATERNION"
        self.B0_thigh = arm.data.bones["thigh.R"].matrix_local.to_3x3()
        self.d0 = (arm.data.bones["thigh.R"].tail_local - arm.data.bones["thigh.R"].head_local).normalized()
        self.B0_shin = arm.data.bones["shin.R"].matrix_local.to_3x3()
        # Kniebeugeachse im Knochenraum des Unterschenkels: die Achse, die quer (nach außen) zeigt.
        self.knie_achse = (self.B0_shin.inverted() @ ax.out).normalized()
        self.knie_vorz = 1.0
        self.dreh_vorz = 1.0
        self._vorzeichen_bestimmen()

    def pose_loeschen(self):
        for pb in self.arm.pose.bones:
            pb.matrix_basis = Matrix.Identity(4)

    def oberschenkel(self, d, dreh_deg=0.0):
        q_dir = self.d0.rotation_difference(d)
        q_tw = Quaternion(d, math.radians(dreh_deg) * self.dreh_vorz)
        Rw = (q_tw @ q_dir).to_matrix()
        lok = self.B0_thigh.inverted() @ Rw @ self.B0_thigh
        self.pb["thigh.R"].rotation_quaternion = lok.to_quaternion()

    def knie(self, grad):
        self.pb["shin.R"].rotation_quaternion = Quaternion(self.knie_achse, math.radians(grad) * self.knie_vorz)

    def _vorzeichen_bestimmen(self):
        vl = bpy.context.view_layer
        ax = self.ax
        # Knie: Beugen muss den Unterschenkel nach hinten schwingen.
        self.pose_loeschen(); vl.update()
        vorher = self.pb["shin.R"].tail.copy()
        self.knie(60); vl.update()
        nachher = self.pb["shin.R"].tail
        if (nachher - vorher).dot(ax.fwd) > 0:
            self.knie_vorz = -1.0
        # Drehung um die Oberschenkelachse: "innen" heißt, bei gebeugtem Knie wandert der Fuß nach außen.
        self.pose_loeschen(); self.knie(90); vl.update()
        vorher = self.pb["shin.R"].tail.copy()
        self.oberschenkel(self.d0, 30); vl.update()
        nachher = self.pb["shin.R"].tail
        if (nachher - vorher).dot(ax.out) < 0:
            self.dreh_vorz = -1.0
        self.pose_loeschen(); vl.update()
        out("Vorzeichen: Knie", self.knie_vorz, "| Innendrehung", self.dreh_vorz)


# ------------------------------------------------------------------ die Bewegungen
def glatt(u):
    """0..1 -> 0..1 mit weichem Anfang und Ende."""
    u = max(0.0, min(1.0, u))
    return u * u * (3 - 2 * u)


def stuetz(phi, punkte):
    """Periodische Interpolation (Kosinus) zwischen Stützstellen (phi -> wert), phi in 0..360."""
    phi %= 360
    for (p0, w0), (p1, w1) in zip(punkte, punkte[1:]):
        if p0 <= phi <= p1:
            u = (phi - p0) / (p1 - p0)
            return w0 + (w1 - w0) * (1 - math.cos(u * math.pi)) / 2
    return punkte[-1][1]


def hipcar(t):
    """Hüftkreisen, Knie 90° gebeugt: vorn hoch -> außen -> hinten -> unter den Körper -> vorn."""
    phi = 360 * t
    theta = stuetz(phi, [(0, 85), (90, 80), (180, 28), (270, 8), (360, 85)])
    dreh = stuetz(phi, [(0, 0), (60, 0), (150, 30), (240, 0), (360, 0)])
    return theta, phi, dreh, 90


def legcircle(t):
    """Gestrecktes Bein nach vorn oben heben (1 s), zwei kleine Kreise (2 s), senken (1 s)."""
    heb, r = 70.0, 9.0
    # Heben endet genau dort, wo der Kreis beginnt (heb + r, vorn), sonst springt das Bein.
    if t < 0.25:
        return (heb + r) * glatt(t / 0.25), 0, 0, 5
    if t > 0.75:
        return (heb + r) * glatt((1 - t) / 0.25), 0, 0, 5
    w = (t - 0.25) / 0.5 * 2 * 2 * math.pi
    return heb + r * math.cos(w), 12.0 * math.sin(w), 0, 5


def gate(t):
    """Tor öffnen: Knie vorn hoch, im Bogen nach außen, absetzen, zurück zum Start."""
    if t < 0.25:
        return 80 * glatt(t / 0.25), 0, 0, 90 * glatt(t / 0.25)
    if t < 0.55:
        u = glatt((t - 0.25) / 0.3)
        return 80 - 8 * u, 90 * u, 0, 90
    if t < 0.8:
        u = glatt((t - 0.55) / 0.25)
        return 72 * (1 - u), 90 - 30 * u, 0, 90 * (1 - u)
    return 0, 0, 0, 0


def legswing(t):
    """Beinpendel: zwei Schwünge, vorn bis 50°, hinten bis 25°."""
    a = 12.5 + 37.5 * math.sin(2 * math.pi * 2 * t)
    knie = 5 + 7 * max(0.0, -a) / 25      # hinten beugt das Knie ein wenig mit
    if a >= 0:
        return a, 0, 0, knie
    return -a, 180, 0, knie


BEWEGUNGEN = [("hipcar", hipcar), ("legcircle", legcircle), ("gate", gate), ("legswing", legswing)]


def aktion_bauen(name, fn, pose, ax):
    arm = pose.arm
    alt = bpy.data.actions.get(name)
    if alt:
        bpy.data.actions.remove(alt)
    act = bpy.data.actions.new(name)
    arm.animation_data.action = act
    n = int(round(DAUER_S * FPS))
    for i in range(n + 1):                    # letztes Bild = erstes Bild, damit die Schleife glatt ist
        t = (i % n) / n
        theta, phi, dreh, knie = fn(t)
        pose.pose_loeschen()
        pose.oberschenkel(ax.richtung(theta, phi), dreh)
        pose.knie(knie)
        f = i + 1
        pose.pb["thigh.R"].keyframe_insert("rotation_quaternion", frame=f)
        pose.pb["shin.R"].keyframe_insert("rotation_quaternion", frame=f)
    for fc in alle_fcurves(act):
        for kp in fc.keyframe_points:
            kp.interpolation = "LINEAR"
    act.use_fake_user = True
    return act


def alle_fcurves(act):
    """Bis Blender 4.x liegen die Kurven direkt an der Aktion, ab 5.0 in Ebene/Streifen/Kanalkorb."""
    if hasattr(act, "fcurves"):
        return list(act.fcurves)
    kurven = []
    for layer in act.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                kurven.extend(cb.fcurves)
    return kurven


# ------------------------------------------------------------------ Export
def export_kwargs(ziel):
    kw = dict(filepath=ziel, export_format="GLB", use_selection=True, export_apply=True,
              export_materials="NONE", export_texcoords=False, export_normals=True,
              export_colors=False, export_vertex_color="NONE",
              export_skins=True, export_all_influences=False, export_def_bones=False,
              export_morph=False, export_animations=True, export_animation_mode="NLA_TRACKS",
              export_nla_strips=True, export_force_sampling=True, export_frame_range=False,
              export_frame_step=1, export_yup=True, export_extras=False, export_cameras=False,
              export_lights=False, export_rest_position_armature=True, export_leaf_bone=False,
              export_optimize_animation_size=True, export_optimize_animation_keep_anim_armature=True)
    props = bpy.ops.export_scene.gltf.get_rna_type().properties.keys()
    weg = [k for k in kw if k not in props]
    for k in weg:
        del kw[k]
    if weg:
        out("Exportoptionen, die diese Blender-Version nicht kennt (übersprungen):", ", ".join(weg))
    return kw


def sichtbar_machen(objs):
    """Objekte müssen sichtbar und auswählbar sein, sonst nimmt der Export sie nicht mit.
    Erst die Sammlungen freigeben, dann die Objekte (sonst sind sie in der Ansicht nicht da)."""
    namen = set(o.name for o in objs)
    def coll_frei(layer):
        for ch in layer.children:
            coll_frei(ch)
        if any(n in layer.collection.objects for n in namen):
            layer.exclude = False
            layer.hide_viewport = False
    coll_frei(bpy.context.view_layer.layer_collection)
    bpy.context.view_layer.update()
    for o in objs:
        o.hide_viewport = False
        o.hide_select = False
        try:
            o.hide_set(False)
        except RuntimeError:
            out("  Achtung: nicht in der Ansicht, wird wohl nicht exportiert:", o.name)


def main():
    out("=== Formwert Bein-Animationen ===", "Blender", bpy.app.version_string)
    if not NUR_VORSCHAU:
        if not bpy.data.filepath:
            out("ABBRUCH: Datei zuerst speichern (das Skript lädt sie am Ende neu).")
            return
        # Im Hintergrundbetrieb (--background, bpy-Modul) gibt es keine ungesicherte Arbeit;
        # dort gilt die Datei auf der Platte. Blender meldet sie direkt nach dem Laden oft als geändert.
        if bpy.data.is_dirty and not bpy.app.background:
            out("ABBRUCH: ungespeicherte Änderungen – bitte erst speichern (Strg/Cmd+S), dann erneut starten.")
            return
    arm = rig_finden()
    if not arm:
        out("ABBRUCH: kein Rig mit thigh.R/shin.R gefunden.")
        return
    out("Rig:", arm.name, "| Knochen:", len(arm.data.bones))
    fehlt = [b for b in ("hip_socket.R", "hip_socket.L", "thigh.R", "knee_pivot.R", "shin.R", "ankle_pivot.R", "foot.R") if b not in arm.data.bones]
    if fehlt:
        out("ABBRUCH: Knochen fehlen:", fehlt)
        return
    for bn in ("thigh.R", "knee_pivot.R", "shin.R", "ankle_pivot.R", "foot.R"):
        for c in arm.pose.bones[bn].constraints:
            out("  Constraint an", bn + ":", c.type, "'" + c.name + "'", "→", getattr(c, "subtarget", ""))
            if c.type == "IK":
                c.mute = True
                out("    (IK für den Export stummgeschaltet)")

    muskeln, knochen, fehlend = objekte_sammeln()
    out("Muskeln:", len(muskeln), "| Knochen:", len(knochen))
    out("  Muskeln:", ", ".join(sorted(o.name for o in muskeln)))
    out("  Knochen:", ", ".join(sorted(o.name for o in knochen)))
    if fehlend:
        out("  Nicht gefunden (bitte Namen prüfen):", ", ".join(fehlend))
    ohne_rig = [o.name for o in muskeln if not any(m.type == "ARMATURE" and m.object == arm for m in o.modifiers)]
    if ohne_rig:
        out("  Achtung, Muskeln ohne Armature-Modifier (bewegen sich nicht mit):", ", ".join(ohne_rig))
    if not muskeln:
        out("ABBRUCH: keine Muskeln gefunden.")
        return

    sz = bpy.context.scene
    sz.render.fps = FPS
    sz.frame_start, sz.frame_end = 1, int(round(DAUER_S * FPS)) + 1
    if bpy.context.mode != "OBJECT":
        bpy.ops.object.mode_set(mode="OBJECT")
    arm.animation_data_create()
    ad = arm.animation_data
    alte_spuren = len(ad.nla_tracks)
    for tr in list(ad.nla_tracks):
        ad.nla_tracks.remove(tr)
    if alte_spuren:
        out("NLA-Spuren des Rigs vorübergehend entfernt:", alte_spuren, "(kommen mit dem Neuladen zurück)")

    ax = Achsen(arm)
    out("Achsen im Rig-Raum: oben", tuple(round(v, 2) for v in ax.up), "| vorn", tuple(round(v, 2) for v in ax.fwd), "| außen", tuple(round(v, 2) for v in ax.out))
    pose = Beinpose(arm, ax)
    aktionen = []
    for name, fn in BEWEGUNGEN:
        aktionen.append((name, aktion_bauen(name, fn, pose, ax)))
        out("Bewegung angelegt:", name)
    pose.pose_loeschen()
    ad.action = None
    for name, act in aktionen:
        tr = ad.nla_tracks.new(); tr.name = name
        st = tr.strips.new(name, 1, act); st.name = name
        # Ab Blender 4.4 haben Aktionen "Slots"; der Streifen braucht den passenden.
        if hasattr(st, "action_slot") and getattr(act, "slots", None) and len(act.slots) and not st.action_slot:
            st.action_slot = act.slots[0]
        tr.mute = False
    if NUR_VORSCHAU:
        # Zum Anschauen: erste Bewegung als aktive Aktion, die Spuren stumm (sonst doppelt).
        for tr in ad.nla_tracks:
            tr.mute = True
        ad.action = aktionen[0][1]
        sz.frame_set(1)
        out("VORSCHAU: Aktion", aktionen[0][0], "ist aktiv. Andere im Action Editor wählen. Datei danach nicht speichern.")
        bericht_schreiben()
        return

    ziel = os.path.join(os.path.dirname(bpy.data.filepath), DATEINAME)
    objs = muskeln + knochen + [arm]
    sichtbar_machen(objs)
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = arm
    kw = export_kwargs(ziel)
    bpy.ops.export_scene.gltf(**kw)
    groesse = os.path.getsize(ziel) // 1024
    out("Exportiert:", ziel, "(%d KB)" % groesse)
    out("Weiter im Repo: gltfpack -i", DATEINAME, "-o bein.glb -kn -c  &&  python3 werkzeug/animation_einpacken.py modell bein.glb bein")
    bericht_schreiben()
    bpy.ops.wm.revert_mainfile()
    print("\n".join(zeilen))


main()
