# Realistischere Muskeloberfläche (Zweig 3d-modell-realistisch)

Stand 29.09.2026: Test mit drei Muskeln (Brust, vorderer Deltamuskel, Bizeps), wartet auf Joels OK.
Noch nichts davon ist in `app/` eingebaut.

Idee: Form und Namen des Z-Anatomy-Modells bleiben, nur die Oberfläche wird realistischer.

- `textur.py` (in Blender): erzeugt die gemeinsame, nahtlos kachelbare Faser-Textur: feine, schnurgerade
  Fasern ohne Welle (`faser_hoehe.png` 1024², `faser_rauheit.png` 512²). Danach mit `sips` nach JPEG.
- `modell_bauen.py` (in Blender): baut das Muskelmodell neu, mit
  - `_AO`: je Punkt, wie stark Nachbarmuskeln und Knochen ihn verdecken (Fugen-Verschattung).
    Ausgeblendete Teile (`ausgeblendet.json`, aus `FW3D_REMOVE_SET`/`FW3D_SKULL_SET`) werfen keinen Schatten.
  - Texturkoordinaten = anatomischer Faserverlauf (`faserfeld.py`): Ursprung und Ansatz werden aus
    Sehnen-Teilen und Knochenkontakt am Muskelende erkannt und als Linien beschrieben; jede Faser
    verbindet den Punkt bei Anteil u auf der Ursprungslinie mit dem bei u auf der Ansatzlinie (Faecher).
    Jeder Oberflaechenpunkt wird den nahen Fasern weich zugeordnet – dadurch glatt, ohne Zickzack.
    Das Skript meldet je Muskel, an welchen Knochen es Ursprung und Ansatz erkannt hat (zum Pruefen).
  Aufruf: `Blender --background --factory-startup --python modell_bauen.py -- muskeln.glb knochen.glb ziel.glb "Name1|Name2"`
  (leerer Namensfilter = alle Muskeln). Zwischenergebnisse liegen in `ziel.glb.ao.npz` / `.faser.npz`.
- `materialien_zurueck.py`: Blender verändert beim Speichern Materialnamen („.001“) und lässt die
  Ausschneide-Schwelle weg. Das Skript schreibt beides aus dem Original zurück.
- `faser_code.js`: Ergänzung für den Betrachter. Legt die Faser-Textur als Höhen-Textur auf (glatt über
  Dreieckskanten), blendet sie aus, wo eine Faser schmaler als ~3 Bildpunkte würde, und wendet `_AO` an.
  Die Grundfarbe bleibt unverändert, die Einfärbung nach Trainingsvolumen wirkt voll.

Gemessen: Muskelmodell 3.539.672 Byte, mit `_AO` für alle Muskeln 3.857.660 Byte (unter 4 MB).
