# -*- coding: utf-8 -*-
"""
faserfix.py – Faser-Punktwolken (FW_Faser_*) wieder an die Muskelverformung binden.

Läuft in Blender im Hintergrund. Vier Modi:

  diagnose   Modifier, Parent, Constraints, Vertex-Gruppen und Bindung der
             Fasern ausgeben, Ablösung bei Bild 1 und 273 messen. Ändert nichts.
  render     Workbench-Render (vorne + Seite) bei Bild 1 und 273 nach
             <aus>/<tag>_bildNNNN_<ansicht>.png. Speichert die .blend NICHT.
             Liegen vorher- und nachher-Bilder vor, entsteht vergleich.png.
  fix        Sicherheitskopie anlegen, Fasern neu binden, Datei speichern.

Aufruf (macOS), am einfachsten über faserfix.sh:

  B=/Applications/Blender.app/Contents/MacOS/Blender
  $B --background DATEI.blend --python-exit-code 1 --python faserfix.py -- diagnose

Warum der Fix über übertragene Gewichte läuft: Die Fasern liegen im Inneren
der Muskeln. Bekommt jeder Faserpunkt genau die Knochengewichte der nächsten
Stelle der Muskeloberfläche (in Ruhelage, baryzentrisch interpoliert) und
denselben Armature-Modifier wie der Muskel, verformt er sich zwangsläufig
wie das umgebende Gewebe – ohne Bindungsdaten, die bei Topologie- oder
Posenwechsel ungültig werden können (Surface/Mesh Deform).
"""
import bpy
import sys
import os
import json
import math
import time
import shutil
import argparse
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
from mathutils.interpolate import poly_3d_calc

# Modifier, die Faserpunkte relativ zu Knochen/Muskel bewegen. Genau diese
# werden beim Fix abgeschaltet, damit nur noch die neue Bindung wirkt.
ERSETZEN_TYPEN = {
    'ARMATURE', 'SURFACE_DEFORM', 'MESH_DEFORM', 'LAPLACIANDEFORM', 'HOOK',
    'LATTICE', 'MESH_CACHE', 'MESH_SEQUENCE_CACHE', 'DATA_TRANSFER',
}
# Weitere verformende Modifier – werden nur gemeldet, nicht angefasst.
AUCH_VERFORMEND = {
    'SHRINKWRAP', 'CORRECTIVE_SMOOTH', 'SMOOTH', 'LAPLACIANSMOOTH', 'CAST',
    'SIMPLE_DEFORM', 'WARP', 'WAVE', 'DISPLACE',
}
TRANSFORM_PFADE = {
    'location', 'rotation_euler', 'rotation_quaternion', 'rotation_axis_angle',
    'scale', 'delta_location', 'delta_rotation_euler',
    'delta_rotation_quaternion', 'delta_scale',
}
STRAHLEN = [Vector(v) for v in ((1, 0, 0), (-1, 0, 0), (0, 1, 0), (0, -1, 0), (0, 0, 1), (0, 0, -1))]
MAX_EINFLUSS = 4          # Knochen pro Punkt, wie bei üblichem Skinning
MIN_GEWICHT = 0.005
ABLOESE_ANTEIL = 0.01     # außerhalb des Muskels um > 1 % seiner Diagonale = abgelöst


def P(*a):
    print("[faserfix]", *a, flush=True)


# ---------------------------------------------------------------- Argumente

def lies_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser(prog="faserfix.py")
    p.add_argument("modus", choices=["diagnose", "render", "fix"])
    p.add_argument("--tag", default="vorher")
    p.add_argument("--aus", default="")
    p.add_argument("--fasern", default="FW_Faser_Alle,FW_Faser_Unten")
    p.add_argument("--muskeln", default="",
                   help="Kommaliste; leer = alle armaturgesteuerten Meshes")
    p.add_argument("--armatur", default="")
    p.add_argument("--bilder", default="1,273")
    p.add_argument("--verfahren", choices=["gewichte", "surface"], default="gewichte")
    a = p.parse_args(argv)
    liste = lambda s: [x.strip() for x in s.split(",") if x.strip()]
    a.fasern, a.muskeln = liste(a.fasern), liste(a.muskeln)
    a.bilder = [int(x) for x in liste(a.bilder)]
    if not a.aus:
        a.aus = os.path.join(os.path.dirname(bpy.data.filepath) or ".", "faserfix_ergebnis")
    os.makedirs(a.aus, exist_ok=True)
    return a


# ---------------------------------------------------------------- Szene

def objekt(name):
    ob = bpy.data.objects.get(name)
    if ob is None:
        fw = ", ".join(o.name for o in bpy.data.objects if o.name.startswith("FW_"))
        raise RuntimeError("Objekt '%s' nicht gefunden. Objekte mit FW_: %s" % (name, fw or "-"))
    return ob


def armatur_gesteuert(ob, arm):
    if ob.parent == arm and ob.parent_type == 'ARMATURE':
        return True
    return any(m.type == 'ARMATURE' and m.object == arm and m.show_viewport
               for m in ob.modifiers)


def finde_armatur(a):
    if a.armatur:
        return objekt(a.armatur)
    szene = bpy.context.scene
    zaehler = {}
    for ob in szene.objects:
        if ob.name.startswith("FW_Faser"):
            continue  # die Fasern selbst können auf eine falsche Armatur zeigen
        for m in getattr(ob, "modifiers", []):
            if m.type == 'ARMATURE' and m.object:
                zaehler[m.object] = zaehler.get(m.object, 0) + 1
    if zaehler:
        return max(zaehler, key=zaehler.get)
    arms = [o for o in szene.objects if o.type == 'ARMATURE']
    if arms:
        return arms[0]
    raise RuntimeError("Keine Armatur gefunden – bitte --armatur NAME angeben.")


def finde_muskeln(a, arm, fasern):
    if a.muskeln:
        return [objekt(n) for n in a.muskeln]
    namen = {f.name for f in fasern}
    return [o for o in bpy.context.scene.objects
            if o.type == 'MESH' and o.name not in namen
            and not o.name.startswith("FW_Faser")
            and len(o.data.polygons) > 0 and armatur_gesteuert(o, arm)]


class Ruhelage:
    """Armatur in Ruheposition. Bild wird gesetzt, weil Objekt-Animation
    (z. B. der Armatur selbst) auch in Ruhelage wirkt."""

    def __init__(self, arm, bild):
        self.arm, self.bild = arm, bild

    def __enter__(self):
        bpy.context.scene.frame_set(self.bild)
        self.alt = self.arm.data.pose_position
        self.arm.data.pose_position = 'REST'
        bpy.context.view_layer.update()
        return bpy.context.evaluated_depsgraph_get()

    def __exit__(self, *x):
        self.arm.data.pose_position = self.alt
        bpy.context.view_layer.update()


class OhneNodes:
    """Geometry-Nodes-Anzeige (Punkte, Instanzen) aus, damit die Messung
    dieselben Vertices sieht, die verformt werden."""

    def __init__(self, obs, aktiv=True):
        self.obs, self.aktiv = obs, aktiv

    def __enter__(self):
        self.alt = []
        if self.aktiv:
            for ob in self.obs:
                for m in ob.modifiers:
                    if m.type == 'NODES' and m.show_viewport:
                        m.show_viewport = False
                        self.alt.append(m)
            bpy.context.view_layer.update()

    def __exit__(self, *x):
        for m in self.alt:
            m.show_viewport = True
        bpy.context.view_layer.update()


def fcurves_von(ob):
    ad = ob.animation_data
    if not ad or not ad.action:
        return []
    act = ad.action
    try:
        return list(act.fcurves)          # bis Blender 4.x
    except Exception:
        pass
    aus, slot = [], getattr(ad, "action_slot", None)
    for layer in getattr(act, "layers", []):  # geschichtete Actions ab 4.4/5.0
        for strip in layer.strips:
            try:
                cb = strip.channelbag(slot) if slot else None
            except Exception:
                cb = None
            if cb:
                aus.extend(cb.fcurves)
    return aus


# ---------------------------------------------------------------- Geometrie

def muskel_geometrie(muskeln, dg, knochen=None):
    """Weltkoordinaten, Dreiecke, Besitzer-Index je Dreieck und – falls
    knochen gegeben – Knochengewichte je Vertex aller Muskeln zusammen."""
    verts, tris, besitzer, gew = [], [], [], []
    for mi, ob in enumerate(muskeln):
        ev = ob.evaluated_get(dg)
        me = ev.to_mesh()
        mw = ev.matrix_world.copy()
        off = len(verts)
        verts.extend(mw @ v.co for v in me.vertices)
        if hasattr(me, "calc_loop_triangles"):
            me.calc_loop_triangles()
        for t in me.loop_triangles:
            tris.append((t.vertices[0] + off, t.vertices[1] + off, t.vertices[2] + off))
            besitzer.append(mi)
        if knochen is not None:
            namen = [g.name for g in ob.vertex_groups]
            leer = 0
            for v in me.vertices:
                d = {}
                for g in v.groups:
                    if g.group < len(namen) and g.weight > 0 and namen[g.group] in knochen:
                        d[namen[g.group]] = g.weight
                if not d:
                    leer += 1
                gew.append(d)
            if leer == len(me.vertices) and len(me.vertices):
                P("WARNUNG: Muskel '%s' hat im ausgewerteten Mesh keine Knochengewichte." % ob.name)
        ev.to_mesh_clear()
    return verts, tris, besitzer, gew


def normiere(d):
    paare = sorted(((w, n) for n, w in d.items() if w >= MIN_GEWICHT), reverse=True)[:MAX_EINFLUSS]
    s = sum(w for w, _ in paare)
    return {n: w / s for w, n in paare} if s > 0 else {}


def uebertragung(fasern, muskeln, arm, bild):
    """Für jeden Faserpunkt in Ruhelage: nächste Muskeloberfläche suchen und
    deren Knochengewichte übernehmen."""
    knochen = {b.name for b in arm.data.bones if b.use_deform}
    with Ruhelage(arm, bild) as dg:
        verts, tris, besitzer, gew = muskel_geometrie(muskeln, dg, knochen)
        daten = {}
        for f in fasern:
            mw = f.evaluated_get(dg).matrix_world.copy()
            daten[f.name] = dict(mrest=mw, ruhe=[mw @ v.co for v in f.data.vertices])
    if not tris:
        raise RuntimeError("Muskeln haben keine Flächen – falsche --muskeln?")
    bvh = BVHTree.FromPolygons(verts, tris)
    for f in fasern:
        dd = daten[f.name]
        liste, abst, genutzt = [], [], {}
        for p in dd["ruhe"]:
            loc, _nor, idx, dist = bvh.find_nearest(p)
            if idx is None:
                liste.append({}); abst.append(float("inf")); continue
            a, b, c = tris[idx]
            d = {}
            for vi, wi in zip((a, b, c), poly_3d_calc([verts[a], verts[b], verts[c]], loc)):
                for n, g in gew[vi].items():
                    d[n] = d.get(n, 0.0) + wi * g
            liste.append(normiere(d))
            abst.append(dist)
            m = muskeln[besitzer[idx]].name
            genutzt[m] = genutzt.get(m, 0) + 1
        dd.update(gewichte=liste, abstand=abst, genutzt=genutzt)
    return daten, knochen


def genutzte_muskeln(daten, muskeln):
    """Muskeln, zu denen die Fasern tatsächlich gehören (≥ 0,5 % der Punkte),
    meistgenutzter zuerst. Grundlage für Messung und Kameraausschnitt."""
    summe = {}
    for dd in daten.values():
        for n, k in dd["genutzt"].items():
            summe[n] = summe.get(n, 0) + k
    gesamt = sum(summe.values()) or 1
    namen = sorted((n for n, k in summe.items() if k / gesamt >= 0.005), key=lambda n: -summe[n])
    return [bpy.data.objects[n] for n in namen] or muskeln


def huelle(muskeln, bilder):
    lo = Vector((math.inf,) * 3)
    hi = Vector((-math.inf,) * 3)
    for b in bilder:
        bpy.context.scene.frame_set(b)
        dg = bpy.context.evaluated_depsgraph_get()
        for v in muskel_geometrie(muskeln, dg)[0]:
            lo = Vector(map(min, lo, v))
            hi = Vector(map(max, hi, v))
    return lo, hi


def faser_punkte(f, dg):
    ev = f.evaluated_get(dg)
    me = ev.to_mesh()
    mw = ev.matrix_world
    pts = [mw @ v.co for v in me.vertices]
    ev.to_mesh_clear()
    return pts


def messung(fasern, muskeln, bilder):
    """Abstand jedes Faserpunkts zur Muskeloberfläche je Bild. Zuerst so, wie
    die Fasern angezeigt werden; liefern die Geometry Nodes keine vergleichbaren
    Vertices (Punktwolke, wechselnde Anzahl), ohne sie."""
    lo, hi = huelle(muskeln, bilder[:1])
    diag = (hi - lo).length
    ergebnis = {}
    for f in fasern:
        for mit_nodes in (True, False):
            werte = {}
            with OhneNodes([f], aktiv=not mit_nodes):
                for b in bilder:
                    bpy.context.scene.frame_set(b)
                    dg = bpy.context.evaluated_depsgraph_get()
                    verts, tris, _, _ = muskel_geometrie(muskeln, dg)
                    bvh = BVHTree.FromPolygons(verts, tris)
                    werte[b] = [aussen_abstand(bvh, p) for p in faser_punkte(f, dg)]
            anzahl = {len(v) for v in werte.values()}
            if len(anzahl) == 1 and 0 not in anzahl:
                break
        ergebnis[f.name] = dict(werte=werte, mit_nodes=mit_nodes)
    return ergebnis, diag


def aussen_abstand(bvh, p):
    """Abstand zur Muskeloberfläche, negativ im Inneren. Der reine Abstand
    taugt nicht als Maß: innenliegende Punkte ändern ihn beim Beugen
    zwangsläufig, abgelöst ist erst, wer den Muskel verlässt."""
    loc, nor, _idx, dist = bvh.find_nearest(p)
    if loc is None:
        return None
    if (p - loc).dot(nor) <= 0:
        return -dist
    # In der Kniekehle überlappen die Muskelflächen; die nächste Fläche kann
    # dann zur Gegenseite gehören. Strahlparität in sechs Richtungen entscheidet.
    innen = 0
    for r in STRAHLEN:
        n, q = 0, p
        while n < 64:
            hit = bvh.ray_cast(q + r * 1e-5, r)[0]
            if hit is None:
                break
            n, q = n + 1, hit
        innen += n % 2
    return -dist if innen >= 3 else dist


def quantil(xs, q):
    xs = sorted(x for x in xs if x is not None)
    if not xs:
        return float("nan")
    return xs[min(len(xs) - 1, int(q * (len(xs) - 1) + 0.5))]


def auswerten(messwerte, diag, bilder, titel):
    schwelle = ABLOESE_ANTEIL * diag
    bericht = {"titel": titel, "muskeldiagonale": diag, "schwelle": schwelle, "fasern": {}}
    P("--- Messung: %s  (abgelöst = mehr als %.4f außerhalb des Muskels, 1 %% der Diagonale %.4f;"
      " Abstand negativ = innen)" % (titel, schwelle, diag))
    for name, m in messwerte.items():
        eintrag = {"mit_geometry_nodes": m["mit_nodes"]}
        for b in bilder:
            d = [x for x in m["werte"][b] if x is not None]
            abgeloest = sum(1 for x in d if x > schwelle)
            e = dict(punkte=len(d), median=quantil(d, .5), p95=quantil(d, .95),
                     max=quantil(d, 1.0), abgeloest=abgeloest,
                     abgeloest_prozent=100.0 * abgeloest / max(1, len(d)))
            eintrag["bild_%d" % b] = e
            P("  %-18s Bild %4d: %6d Pkt  Abstand Median %+.4f  p95 %+.4f  max %+.4f  abgelöst %6d (%.1f %%)%s"
              % (name, b, e["punkte"], e["median"], e["p95"], e["max"], abgeloest,
                 e["abgeloest_prozent"], "" if m["mit_nodes"] else "  [ohne GN gemessen]"))
        bericht["fasern"][name] = eintrag
    return bericht


# ---------------------------------------------------------------- Diagnose

def eigenschaften(x):
    aus = {}
    for p in x.bl_rna.properties:
        k = p.identifier
        if k in ("rna_type", "name", "type") or p.type == 'COLLECTION':
            continue
        try:
            v = getattr(x, k)
        except Exception:
            continue
        if p.type == 'POINTER':
            v = getattr(v, "name", None) if v is not None else None
        elif isinstance(v, set):
            v = sorted(v)
        elif hasattr(v, "__len__") and not isinstance(v, str):
            try:
                v = [round(i, 4) if isinstance(i, float) else i for i in v]
            except Exception:
                v = str(v)
            if len(v) > 16:
                continue
        elif isinstance(v, float):
            v = round(v, 5)
        aus[k] = v
    return aus


def knoten_info(ng, tiefe=0):
    if ng is None or tiefe > 3:
        return []
    zeilen = []
    typen = {}
    for n in ng.nodes:
        typen[n.bl_idname] = typen.get(n.bl_idname, 0) + 1
        if n.bl_idname == 'GeometryNodeObjectInfo':
            ob = n.inputs[0].default_value if not n.inputs[0].is_linked else "<verknüpft>"
            zeilen.append("    ObjectInfo: Objekt=%s transform_space=%s"
                          % (getattr(ob, "name", ob), n.transform_space))
        if n.bl_idname == 'GeometryNodeGroup':
            zeilen += knoten_info(n.node_tree, tiefe + 1)
    zeilen.insert(0, "    Knoten in '%s': %s" % (ng.name, ", ".join("%s×%d" % kv for kv in sorted(typen.items()))))
    if 'GeometryNodeDistributePointsInVolume' in typen:
        zeilen.append("    ACHTUNG: 'Distribute Points in Volume' verteilt bei jeder Verformung neu –"
                      " Punkte springen dann zwangsläufig.")
    return zeilen


def diagnose(a):
    P("Blender", bpy.app.version_string, "| Datei", bpy.data.filepath)
    if getattr(bpy.app, "autoexec_fail", False):
        P("WARNUNG: Python-Treiber sind im Hintergrund gesperrt (%s) – die Pose kann"
          " von der Oberfläche abweichen." % bpy.app.autoexec_fail_message)
    fasern = [objekt(n) for n in a.fasern]
    arm = finde_armatur(a)
    muskeln = finde_muskeln(a, arm, fasern)
    knochen_alle = {b.name for b in arm.data.bones}
    knochen_def = {b.name for b in arm.data.bones if b.use_deform}
    P("Armatur: %s  (%d Knochen, %d deformierend), pose_position=%s"
      % (arm.name, len(knochen_alle), len(knochen_def), arm.data.pose_position))
    P("Armaturgesteuerte Muskel-Meshes: %d" % len(muskeln))
    for m in muskeln:
        P("  %s: %d Vertices, Parent=%s/%s, Modifier: %s" % (
            m.name, len(m.data.vertices), getattr(m.parent, "name", None), m.parent_type,
            ", ".join("%s(%s)" % (x.name, x.type) for x in m.modifiers)))
    if not muskeln:
        raise RuntimeError("Keine armaturgesteuerten Muskeln gefunden – bitte --muskeln angeben.")

    daten, _ = uebertragung(fasern, muskeln, arm, a.bilder[0])
    genutzte = genutzte_muskeln(daten, muskeln)
    P("Fasern gehören zu: " + ", ".join(m.name for m in genutzte))

    befunde = []
    for f in fasern:
        P("")
        P("=== %s  (Typ %s, Mesh '%s', %d Benutzer)" % (f.name, f.type, f.data.name, f.data.users))
        if f.type != 'MESH':
            befunde.append("%s ist kein Mesh (%s) – Armature/Vertex-Gruppen greifen nicht." % (f.name, f.type))
            continue
        me = f.data
        P("  Vertices %d, Kanten %d, Flächen %d, Shape Keys: %s" % (
            len(me.vertices), len(me.edges), len(me.polygons),
            [k.name for k in me.shape_keys.key_blocks] if me.shape_keys else "-"))
        if len(me.vertices) == 0:
            befunde.append("%s hat keine eigenen Vertices – die Punkte entstehen erst in Geometry Nodes."
                           " Gewichte können dort nicht haften." % f.name)
        P("  Parent: %s  Typ %s  Knochen '%s'  Parent-Inverse=Einheit:%s" % (
            getattr(f.parent, "name", None), f.parent_type, f.parent_bone,
            f.matrix_parent_inverse == Matrix.Identity(4)))
        for c in f.constraints:
            P("  Constraint %s (%s): %s" % (c.name, c.type, json.dumps(eigenschaften(c), default=str)))
        fcs = fcurves_von(f)
        tr = [fc.data_path for fc in fcs if fc.data_path in TRANSFORM_PFADE]
        if tr:
            P("  Objekt-Animation auf Transformation: %s" % sorted(set(tr)))
            befunde.append("%s: eigene Transform-Animation (%s) bewegt das Objekt zusätzlich." % (f.name, sorted(set(tr))))
        if f.animation_data:
            for fc in f.animation_data.drivers:
                P("  Treiber: %s[%d]" % (fc.data_path, fc.array_index))

        erster_nodes = None
        for i, m in enumerate(f.modifiers):
            P("  Modifier %d: %s (%s) viewport=%s render=%s" % (i, m.name, m.type, m.show_viewport, m.show_render))
            P("    " + json.dumps(eigenschaften(m), default=str, ensure_ascii=False))
            if m.type == 'NODES':
                for z in knoten_info(m.node_group):
                    P(z)
                if erster_nodes is None and m.show_viewport:
                    erster_nodes = i
                if m.node_group and any(n.bl_idname == 'GeometryNodeDistributePointsInVolume'
                                        for n in m.node_group.nodes):
                    befunde.append("%s: '%s' verteilt Punkte im Volumen neu – springt bei jeder Verformung." % (f.name, m.name))
            if not m.show_viewport:
                continue
            if m.type in ERSETZEN_TYPEN | AUCH_VERFORMEND and erster_nodes is not None:
                befunde.append("%s: Verformer '%s' steht HINTER Geometry Nodes '%s' – er verformt die"
                               " erzeugte Geometrie, die keine Gruppen/Bindung mehr hat."
                               % (f.name, m.name, f.modifiers[erster_nodes].name))
            if m.type == 'ARMATURE':
                if m.object is None:
                    befunde.append("%s: Armature-Modifier '%s' ohne Armatur." % (f.name, m.name))
                elif m.object != arm:
                    befunde.append("%s: Armature-Modifier '%s' zeigt auf '%s', die Muskeln auf '%s'."
                                   % (f.name, m.name, m.object.name, arm.name))
                if f.parent == m.object and f.parent_type == 'ARMATURE':
                    befunde.append("%s: Parent-Typ ARMATURE UND Armature-Modifier – doppelte Verformung,"
                                   " Punkte schießen beim Beugen weg." % f.name)
                if m.use_bone_envelopes:
                    befunde.append("%s: '%s' nutzt Knochen-Hüllen (Envelopes) – Punkte werden von"
                                   " nahen Knochen mitgerissen." % (f.name, m.name))
                if not m.use_vertex_groups:
                    befunde.append("%s: '%s' ignoriert Vertex-Gruppen." % (f.name, m.name))
                if m.vertex_group:
                    befunde.append("%s: '%s' ist auf Gruppe '%s' beschränkt." % (f.name, m.name, m.vertex_group))
            if m.type in ('SURFACE_DEFORM', 'MESH_DEFORM') and not m.is_bound:
                befunde.append("%s: '%s' ist nicht gebunden." % (f.name, m.name))
            if m.type == 'SURFACE_DEFORM' and m.target and m.target not in genutzte:
                befunde.append("%s: Surface Deform '%s' zielt auf '%s', die Fasern liegen aber in %s."
                               % (f.name, m.name, m.target.name, [x.name for x in genutzte]))
            if m.type == 'MESH_DEFORM':
                befunde.append("%s: Mesh Deform '%s' (Käfig %s, precision %d) – Punkte außerhalb"
                               " oder nahe am Käfig fliegen bei starker Beugung."
                               % (f.name, m.name, getattr(m.object, "name", None), m.precision))
        if f.parent_type in ('BONE', 'VERTEX', 'VERTEX_3'):
            befunde.append("%s: starr an %s '%s' gehängt – Punkte folgen nur einem Teil der Beugung."
                           % (f.name, f.parent_type, f.parent_bone or getattr(f.parent, "name", "")))
        if f.parent == arm and f.parent_type == 'ARMATURE' and not any(m.type == 'ARMATURE' for m in f.modifiers):
            P("  (Verformung über Parent-Typ ARMATURE)")
        verformer = [m for m in f.modifiers if m.show_viewport and m.type in ERSETZEN_TYPEN | AUCH_VERFORMEND]
        if not verformer and not (f.parent_type == 'ARMATURE'):
            befunde.append("%s: kein aktiver Verformer – Punkte bleiben stehen, der Muskel geht weg." % f.name)

        # Vertex-Gruppen gegen Knochen und gegen die Muskelbindung prüfen
        namen = [g.name for g in f.vertex_groups]
        P("  Vertex-Gruppen (%d): %s" % (len(namen), ", ".join(
            "%s%s" % (n, "" if n in knochen_def else (" [Knochen nicht deformierend]" if n in knochen_alle else " [kein Knochen]"))
            for n in namen)))
        ohne, ueber, fremd, abweichend, summen = 0, 0, set(), 0, []
        soll = daten[f.name]["gewichte"]
        for i, v in enumerate(me.vertices):
            d = {}
            for g in v.groups:
                n = namen[g.group] if g.group < len(namen) else "?"
                if n in knochen_def and g.weight > 0:
                    d[n] = g.weight
                elif n not in knochen_alle and g.weight > 0 and n != "?":
                    fremd.add(n)
            s = sum(d.values())
            summen.append(s)
            if s <= 0:
                ohne += 1
            if s > 1.01:
                ueber += 1
            if d and soll[i] and max(d, key=d.get) != max(soll[i], key=soll[i].get):
                abweichend += 1
        n = max(1, len(me.vertices))
        P("  Punkte ohne Gewicht auf deformierendem Knochen: %d (%.1f %%)" % (ohne, 100.0 * ohne / n))
        P("  Punkte mit Gewichtssumme > 1: %d, Summe Median %.3f" % (ueber, quantil(summen, .5)))
        P("  Punkte, deren Hauptknochen vom umgebenden Muskel abweicht: %d (%.1f %%)" % (abweichend, 100.0 * abweichend / n))
        P("  Abstand Ruhelage→Muskeloberfläche: Median %.4f, max %.4f" % (
            quantil(daten[f.name]["abstand"], .5), quantil(daten[f.name]["abstand"], 1.0)))
        if ohne and any(m.type == 'ARMATURE' for m in f.modifiers):
            befunde.append("%s: %.1f %% der Punkte ohne Knochengewicht – sie bleiben beim Beugen stehen."
                           % (f.name, 100.0 * ohne / n))
        if fremd:
            befunde.append("%s: Gruppen ohne passenden Knochen (alte Rig-Namen?): %s" % (f.name, sorted(fremd)))
        if abweichend > 0.02 * n:
            befunde.append("%s: %.1f %% der Punkte hängen an einem anderen Knochen als der Muskel an"
                           " derselben Stelle – falsche Bindung." % (f.name, 100.0 * abweichend / n))

    P("")
    mw, diag = messung(fasern, genutzte, a.bilder)
    bericht = auswerten(mw, diag, a.bilder, "Diagnose")
    P("")
    P("=== BEFUNDE")
    for b in befunde or ["keine offensichtlichen Einstellungsfehler gefunden"]:
        P("  - " + b)
    bericht["befunde"] = befunde
    with open(os.path.join(a.aus, "diagnose_%s.json" % a.tag), "w", encoding="utf-8") as fh:
        json.dump(bericht, fh, indent=1, ensure_ascii=False, default=str)


# ---------------------------------------------------------------- Fix

def nach_oben(ob, m):
    i = [x.name for x in ob.modifiers].index(m.name)
    if i == 0:
        return
    try:
        ob.modifiers.move(i, 0)
    except AttributeError:
        with bpy.context.temp_override(object=ob, active_object=ob):
            bpy.ops.object.modifier_move_to_index(modifier=m.name, index=0)


def alte_verformung_aus(f):
    for m in list(f.modifiers):
        if m.type in ERSETZEN_TYPEN and (m.show_viewport or m.show_render):
            m.show_viewport = m.show_render = False
            if not m.name.startswith("ALT_"):
                m.name = ("ALT_" + m.name)[:63]
            P("  %s: Modifier '%s' (%s) abgeschaltet" % (f.name, m.name, m.type))
    for c in f.constraints:
        if not c.mute:
            c.mute = True
            P("  %s: Constraint '%s' (%s) stummgeschaltet" % (f.name, c.name, c.type))
    for fc in fcurves_von(f):
        if fc.data_path in TRANSFORM_PFADE and not fc.mute:
            fc.mute = True
            P("  %s: Animationskurve %s[%d] stummgeschaltet" % (f.name, fc.data_path, fc.array_index))
    if f.animation_data:
        for fc in f.animation_data.drivers:
            if fc.data_path in TRANSFORM_PFADE and not fc.mute:
                fc.mute = True
                P("  %s: Treiber %s[%d] stummgeschaltet" % (f.name, fc.data_path, fc.array_index))


def wie_muskel_haengen(f, haupt, m_rest, bild):
    """Faser genau so hängen wie den Muskel (Objekt-Parent), Lage aus der
    Ruhelage beibehalten. Ein Knochen- oder ARMATURE-Parent würde zusätzlich
    zum Armature-Modifier bewegen."""
    bpy.context.scene.frame_set(bild)
    eltern = haupt.parent
    if eltern is not None:
        f.parent = eltern
        f.parent_type = 'OBJECT'
        f.parent_bone = ""
        f.matrix_parent_inverse = eltern.matrix_world.inverted()
    else:
        f.parent = None
        f.matrix_parent_inverse = Matrix.Identity(4)
    f.matrix_basis = m_rest
    bpy.context.view_layer.update()
    P("  %s: Parent = %s (OBJECT)" % (f.name, getattr(eltern, "name", "keiner")))


def gewichte_setzen(f, gewichte, knochen_alle):
    n = len(f.data.vertices)
    alle = list(range(n))
    for vg in f.vertex_groups:
        if vg.name in knochen_alle:
            vg.remove(alle)  # keine alte Bindung stehen lassen
    gruppen = {}
    for d in gewichte:
        for name in d:
            if name not in gruppen:
                gruppen[name] = f.vertex_groups.get(name) or f.vertex_groups.new(name=name)
    for i, d in enumerate(gewichte):
        for name, w in d.items():
            gruppen[name].add([i], w, 'REPLACE')
    leer = sum(1 for d in gewichte if not d)
    P("  %s: %d Punkte neu gewichtet auf %s%s" % (
        f.name, n, sorted(gruppen), (", %d ohne Gewicht" % leer) if leer else ""))


def fix(a):
    quelle = bpy.data.filepath
    if not quelle:
        raise RuntimeError("Keine .blend-Datei geladen.")
    sicherung = "%s.vor-faserfix-%s.blend" % (os.path.splitext(quelle)[0], time.strftime("%Y%m%d-%H%M%S"))
    shutil.copy2(quelle, sicherung)
    if os.path.getsize(sicherung) != os.path.getsize(quelle):
        raise RuntimeError("Sicherheitskopie unvollständig – Abbruch, nichts geändert.")
    P("Sicherheitskopie:", sicherung)

    fasern = [objekt(n) for n in a.fasern]
    for f in fasern:
        if f.type != 'MESH' or len(f.data.vertices) == 0:
            raise RuntimeError("%s hat keine Mesh-Vertices (Typ %s) – dieser Fall braucht einen"
                               " anderen Fix, siehe Diagnose." % (f.name, f.type))
    arm = finde_armatur(a)
    muskeln = finde_muskeln(a, arm, fasern)
    if not muskeln:
        raise RuntimeError("Keine armaturgesteuerten Muskeln – bitte --muskeln angeben.")
    daten, _ = uebertragung(fasern, muskeln, arm, a.bilder[0])
    genutzte = genutzte_muskeln(daten, muskeln)
    haupt = genutzte[0]
    knochen_alle = {b.name for b in arm.data.bones}
    P("Armatur %s, Fasern gehören zu %s" % (arm.name, [m.name for m in genutzte]))

    mw, diag = messung(fasern, genutzte, a.bilder)
    vorher = auswerten(mw, diag, a.bilder, "vor dem Fix")

    ref = next((m for m in haupt.modifiers if m.type == 'ARMATURE' and m.object == arm), None)
    for f in fasern:
        P("")
        P("=== %s" % f.name)
        alte_verformung_aus(f)
        wie_muskel_haengen(f, haupt, daten[f.name]["mrest"], a.bilder[0])
        if a.verfahren == "gewichte":
            gewichte_setzen(f, daten[f.name]["gewichte"], knochen_alle)
            am = f.modifiers.new("FW_Armatur", 'ARMATURE')
            am.object = arm
            am.use_vertex_groups = True
            am.use_bone_envelopes = False
            if ref is not None:
                am.use_deform_preserve_volume = ref.use_deform_preserve_volume
            nach_oben(f, am)
            P("  %s: Armature-Modifier 'FW_Armatur' → %s an Position 0" % (f.name, arm.name))
        else:
            ziel = objekt(a.muskeln[0]) if a.muskeln else haupt
            sd = f.modifiers.new("FW_SurfaceDeform", 'SURFACE_DEFORM')
            sd.target = ziel
            nach_oben(f, sd)
            with Ruhelage(arm, a.bilder[0]):
                with bpy.context.temp_override(object=f, active_object=f):
                    bpy.ops.object.surfacedeform_bind(modifier=sd.name)
                bpy.context.view_layer.update()
            if not sd.is_bound:
                raise RuntimeError("Surface Deform ließ sich nicht binden.")
            P("  %s: Surface Deform an %s gebunden" % (f.name, ziel.name))

    # Kontrolle: in Ruhelage müssen die Punkte exakt dort bleiben, wo sie waren
    with Ruhelage(arm, a.bilder[0]) as dg, OhneNodes(fasern):
        for f in fasern:
            dg = bpy.context.evaluated_depsgraph_get()
            jetzt = faser_punkte(f, dg)
            abw = max(((p - q).length for p, q in zip(jetzt, daten[f.name]["ruhe"])), default=0.0)
            P("  %s: Abweichung in Ruhelage max %.6f" % (f.name, abw))

    mw, diag = messung(fasern, genutzte, a.bilder)
    nachher = auswerten(mw, diag, a.bilder, "nach dem Fix")
    with open(os.path.join(a.aus, "fix_messung.json"), "w", encoding="utf-8") as fh:
        json.dump({"vorher": vorher, "nachher": nachher, "sicherung": sicherung},
                  fh, indent=1, ensure_ascii=False, default=str)
    bpy.ops.wm.save_mainfile(filepath=quelle)
    P("Gespeichert:", quelle)


# ---------------------------------------------------------------- Render

def punkt_hilfe(radius):
    ng = bpy.data.node_groups.new("FW_Render_Punkte", 'GeometryNodeTree')
    if hasattr(ng, "interface"):
        ng.interface.new_socket("Geometry", in_out='INPUT', socket_type='NodeSocketGeometry')
        ng.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')
    else:
        ng.inputs.new('NodeSocketGeometry', "Geometry")
        ng.outputs.new('NodeSocketGeometry', "Geometry")
    n, l = ng.nodes, ng.links
    ein, aus = n.new('NodeGroupInput'), n.new('NodeGroupOutput')
    r1, r2 = n.new('GeometryNodeRealizeInstances'), n.new('GeometryNodeRealizeInstances')
    inst = n.new('GeometryNodeInstanceOnPoints')
    ico = n.new('GeometryNodeMeshIcoSphere')
    ico.inputs['Radius'].default_value = radius
    ico.inputs['Subdivisions'].default_value = 1
    l.new(ein.outputs[0], r1.inputs[0])
    l.new(r1.outputs[0], inst.inputs['Points'])
    l.new(ico.outputs['Mesh'], inst.inputs['Instance'])
    l.new(inst.outputs['Instances'], r2.inputs[0])
    l.new(r2.outputs[0], aus.inputs[0])
    return ng


def lade_pixel(pfad):
    import numpy as np
    im = bpy.data.images.load(pfad, check_existing=False)
    w, h = im.size
    px = np.empty(w * h * 4, dtype=np.float32)
    im.pixels.foreach_get(px)
    bpy.data.images.remove(im)
    return px.reshape(h, w, 4)


def vergleich(a):
    import numpy as np
    spalten = [(b, n) for b in a.bilder for n in ("vorne", "seite")]
    zeilen = []
    for tag in ("vorher", "nachher"):
        pfade = [os.path.join(a.aus, "%s_bild%04d_%s.png" % (tag, b, n)) for b, n in spalten]
        if not all(os.path.exists(p) for p in pfade):
            return
        bilder = [lade_pixel(p) for p in pfade]
        luecke = np.ones((bilder[0].shape[0], 8, 4), np.float32)
        teile = []
        for i, im in enumerate(bilder):
            teile += ([luecke] if i else []) + [im]
        zeilen.append(np.hstack(teile))
    trenn = np.ones((8, zeilen[0].shape[1], 4), np.float32)
    gitter = np.vstack([zeilen[1], trenn, zeilen[0]])  # Blender-Pixel laufen von unten nach oben
    h, w = gitter.shape[:2]
    im = bpy.data.images.new("FW_Vergleich", w, h, alpha=True)
    im.pixels.foreach_set(gitter.ravel())
    im.filepath_raw = os.path.join(a.aus, "vergleich.png")
    im.file_format = 'PNG'
    im.save()
    P("Vergleichsbild:", im.filepath_raw, "(oben vorher, unten nachher; Spalten:",
      ", ".join("Bild %d %s" % s for s in spalten) + ")")


def render(a):
    szene = bpy.context.scene
    fasern = [objekt(n) for n in a.fasern]
    arm = finde_armatur(a)
    muskeln = finde_muskeln(a, arm, fasern)
    daten, _ = uebertragung(fasern, muskeln, arm, a.bilder[0])
    genutzte = genutzte_muskeln(daten, muskeln)

    mw, diag = messung(fasern, genutzte, a.bilder)
    bericht = auswerten(mw, diag, a.bilder, "Render %s" % a.tag)
    with open(os.path.join(a.aus, "messung_%s.json" % a.tag), "w", encoding="utf-8") as fh:
        json.dump(bericht, fh, indent=1, ensure_ascii=False, default=str)

    # Ausschnitt nur aus den Muskeln – die sind vor und nach dem Fix gleich,
    # damit beide Bildreihen exakt dieselbe Kamera haben.
    lo, hi = huelle(genutzte, a.bilder)
    mitte, ausdehnung = (lo + hi) / 2, hi - lo
    diag = ausdehnung.length

    samm = bpy.data.collections.new("FW_Render_Hilfe")
    szene.collection.children.link(samm)
    zeigen = set(fasern) | set(genutzte)
    for ob in szene.objects:
        ob.hide_render = ob not in zeigen
    for ob in zeigen:
        if samm not in ob.users_collection:
            samm.objects.link(ob)  # holt Objekte aus ausgeschlossenen Sammlungen herein
        ob.hide_render = False
    for f in fasern:
        f.color = (0.85, 0.08, 0.08, 1.0)
    for m in genutzte:
        m.color = (0.62, 0.66, 0.72, 1.0)

    szene.frame_set(a.bilder[0])
    dg = bpy.context.evaluated_depsgraph_get()
    hilfe = None
    for f in fasern:
        ev = f.evaluated_get(dg)
        me = ev.to_mesh()
        flaechen = len(me.polygons)
        ev.to_mesh_clear()
        if flaechen == 0:  # lose Punkte rendert keine Engine – als Kügelchen darstellen
            hilfe = hilfe or punkt_hilfe(diag * 0.0035)
            f.modifiers.new("FW_Render_Punkte", 'NODES').node_group = hilfe

    szene.render.engine = 'BLENDER_WORKBENCH'
    sh = szene.display.shading
    sh.light = 'STUDIO'
    sh.color_type = 'OBJECT'
    sh.show_xray = True
    sh.xray_alpha = 0.35
    sh.show_shadows = False
    sh.show_cavity = False
    try:
        szene.display.render_aa = '8'
        szene.view_settings.view_transform = 'Standard'
    except Exception:
        pass
    szene.render.resolution_x = szene.render.resolution_y = 800
    szene.render.resolution_percentage = 100
    szene.render.film_transparent = False
    szene.render.image_settings.file_format = 'PNG'
    if szene.world is None:
        szene.world = bpy.data.worlds.new("FW_Welt")
    szene.world.color = (1.0, 1.0, 1.0)

    kd = bpy.data.cameras.new("FW_Kamera")
    kd.type = 'ORTHO'
    kd.clip_start, kd.clip_end = diag * 0.01, diag * 50
    kam = bpy.data.objects.new("FW_Kamera", kd)
    samm.objects.link(kam)
    szene.camera = kam
    td = bpy.data.curves.new("FW_Beschriftung", 'FONT')
    txt = bpy.data.objects.new("FW_Beschriftung", td)
    samm.objects.link(txt)
    txt.parent = kam
    txt.color = (0.05, 0.05, 0.05, 1.0)

    ansichten = [
        ("vorne", Vector((0, -1, 0)), (math.pi / 2, 0, 0), max(ausdehnung.x, ausdehnung.z)),
        ("seite", Vector((1, 0, 0)), (math.pi / 2, 0, math.pi / 2), max(ausdehnung.y, ausdehnung.z)),
    ]
    for b in a.bilder:
        szene.frame_set(b)
        for name, richtung, rot, groesse in ansichten:
            s = groesse * 1.2
            kam.location = mitte + richtung * diag * 10
            kam.rotation_euler = rot
            kd.ortho_scale = s
            td.body = "%s  -  Bild %d  -  %s" % (a.tag.upper(), b, name)
            td.size = s * 0.035
            txt.location = (-s / 2 + s * 0.03, s / 2 - s * 0.03 - s * 0.035, -diag * 2)
            pfad = os.path.join(a.aus, "%s_bild%04d_%s.png" % (a.tag, b, name))
            szene.render.filepath = pfad
            bpy.ops.render.render(write_still=True)
            P("Render:", pfad)
    vergleich(a)


# ---------------------------------------------------------------- Start

def main():
    a = lies_args()
    {"diagnose": diagnose, "render": render, "fix": fix}[a.modus](a)


if __name__ == "__main__":
    main()
