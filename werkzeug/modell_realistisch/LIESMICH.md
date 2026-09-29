# Realistischere Muskeloberfläche (Zweig 3d-modell-realistisch)

Stand 29.09.2026: Test mit drei Muskeln (Brust, vorderer Deltamuskel, Bizeps), wartet auf Joels OK.
Noch nichts davon ist in `app/` eingebaut.

Idee: Form und Namen des Z-Anatomy-Modells bleiben, nur die Oberfläche wird realistischer.

- `textur.py` (in Blender): erzeugt die gemeinsame, nahtlos kachelbare Faser-Textur
  (`faser_normal.png` 1024², `faser_rauheit.png` 512²). Danach mit `sips` nach JPEG.
- `ao_backen.py` (in Blender): berechnet je Punkt, wie stark Nachbarmuskeln und Knochen ihn
  verdecken, und speichert das als ein Wert `_AO` im Muskelmodell. Ausgeblendete Teile
  (`ausgeblendet.json`, aus `FW3D_REMOVE_SET`/`FW3D_SKULL_SET` im Betrachter) werfen keinen Schatten.
  Aufruf: `Blender --background --factory-startup --python ao_backen.py -- muskeln.glb knochen.glb ziel.glb "Name1|Name2"`
  (leerer Namensfilter = alle Muskeln, etwa 2–3 Minuten).
- `materialien_zurueck.py`: Blender verändert beim Speichern Materialnamen („.001“) und lässt die
  Ausschneide-Schwelle weg. Das Skript schreibt beides aus dem Original zurück.
- `faser_code.js`: Ergänzung für den Betrachter. Berechnet Texturkoordinaten je Muskel aus seiner
  Hauptachse, legt die Faser-Textur auf und wendet `_AO` an. Die Grundfarbe bleibt unverändert.

Gemessen: Muskelmodell 3.539.672 Byte, mit `_AO` für alle Muskeln 3.857.660 Byte (unter 4 MB).
