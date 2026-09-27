# Faser-Punktwolken an die Muskelverformung binden

Für `arm-rig-130-oberschenkel.blend`: Beim Beugen des Knies (z. B. Bild 273)
lösen sich `FW_Faser_Alle` / `FW_Faser_Unten` vom Muskel.

## Ausführen (Mac)

```
cd werkzeug/blender_faserfix
./faserfix.sh /Pfad/zu/arm-rig-130-oberschenkel.blend
```

Der Ablauf bricht beim ersten Fehler ab:

1. `diagnose` – Modifier, Parent, Constraints, Vertex-Gruppen, Bindung; Befundliste
2. `render --tag vorher` – Bild 1 und 273, vorne und seitlich
3. `fix` – **legt zuerst `…vor-faserfix-DATUM.blend` als Sicherheitskopie an**, bindet neu, speichert
4. `render --tag nachher` – danach entsteht `vergleich.png` (oben vorher, unten nachher)
5. `diagnose --tag nachher`

Ergebnisse liegen in `faserfix_ergebnis/` neben der .blend-Datei.
Ein anderer Blender-Pfad geht über `BLENDER=/…/Blender ./faserfix.sh …`.
Findet das Skript die Muskeln oder die Armatur nicht selbst:
`--muskeln Name1,Name2 --armatur Rig`.

## Was der Fix macht

- Die alten Verformer der Fasern (Armature, Surface/Mesh Deform, Hook …) werden
  abgeschaltet und bekommen das Präfix `ALT_`. Constraints und Transform-Animation
  der Fasern werden stummgeschaltet. Gelöscht wird nichts.
- Die Fasern hängen danach wie der Muskel am selben Parent (Typ OBJECT). Ein
  Knochen- oder ARMATURE-Parent würde zusätzlich bewegen.
- Jeder Faserpunkt übernimmt in Ruhelage die Knochengewichte der nächsten Stelle
  der Muskeloberfläche (baryzentrisch, höchstens 4 Knochen).
- Die Fasern bekommen einen Armature-Modifier `FW_Armatur` an erster Stelle,
  mit derselben Armatur wie der Muskel. Geometry Nodes zur Anzeige bleiben dahinter.
- Zur Kontrolle muss die Abweichung in Ruhelage 0 sein. Gemessen wird bei Bild 1
  und 273, wie viele Punkte außerhalb des Muskels liegen.

## Test

`test_rig_bauen.py` baut ein Bein mit denselben Fehlern nach (ARMATURE-Parent
und Modifier doppelt, falsche Knochen, alte Arm-Gruppennamen, Envelopes,
Knochen-Parent). Ergebnis mit Blender 4.5 und 5.0: Bei Bild 273 lagen vorher
78 % bzw. 99 % der Punkte außerhalb des Muskels, nachher 0 %. Siehe
`test_vergleich.png`.

Nicht abgedeckt: Werden die Punkte erst in Geometry Nodes erzeugt (Objekt
ohne eigene Vertices, z. B. „Distribute Points in Volume"), bricht `fix` ab.
Die Diagnose meldet diesen Fall.
