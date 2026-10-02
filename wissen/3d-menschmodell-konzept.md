# Formwert – Konzept: 3D-Menschmodell mit Muskeldarstellung

## 1. Analyse der 60 Referenzbilder

- Quelle: Screenshots/Recordings aus einer **bestehenden, kommerziellen Anatomie-App** (konsistentes UI: "?"-Icon, Zahnrad, Ebenen-Stack, VR-Brille unten rechts; ein Bild ist ein Screen-Recording-Frame mit Status-Leiste).
- Kein 360°-Rundgang, sondern ~8–10 feste Kamera-Presets (hintere/vordere Beine, vorderer Rumpf, Rücken, Schulter/Arm, Gesicht/Hals, Unterarm, Unterschenkel) mit Zoom-Varianten.
- Abgedeckt: Oberschenkel/Hüfte, Gesäß, Waden, Rumpf (Brust/Bauch/Rücken), Schulter, Ober-/Unterarm, Gesicht/Hals.
- **Lücken:** Hände (nur Handgelenkansätze), Füße (nur Zehenansätze), kein Skelett-Layer, kein Faszien-Layer.
- Immer die Muskelschicht (nicht Haut, nicht Knochen), gleiches Farbschema pro Muskel, Abkürzungs-Labels.
- Deine mitgeschickte Legende deckt sich exakt mit den Labels in den Bildern (BF, RA, PM, EO, Ga, GTe, Tr, D, Ste, Ma, ZMa, DAO usw. – vollständige Liste liegt vor).

**Rechtlich wichtig:** Diese Screenshots sind Aufnahmen einer fremden, lizenzierten App. Sie eignen sich als **visuelle/funktionale Referenz** (welche Ansichten, welche Muskeln beschriftet, welcher Detailgrad), aber **nicht als Textur- oder Geometrie-Quelle** für ein eigenes Modell – weder per Nachbau noch per Photogrammetrie (keine durchgängige Kamerageometrie zwischen den Bildern, und das Ausgangsmodell ist geschütztes Drittmaterial).

## 2. Empfohlene Modellquelle für ein echtes 3D-Menschmodell

**Z-Anatomy "Myology"** (Open-Source-Atlas, basiert auf BodyParts3D/Anatomography):

- Lizenz: **CC BY-SA 4.0** – kommerzielle Nutzung in der App erlaubt, Bedingungen: Namensnennung + Weitergabe abgeleiteter Werke unter gleicher Lizenz (Share-Alike gilt für das Modell, nicht für deinen App-Code).
- Einzeln benannte Muskeln (Deltoid, Pectoralis, Biceps Femoris etc.), passend zur Abkürzungs-Systematik deiner Referenzbilder.
- Kostenlos herunterladbar via Sketchfab ("Myology" von Z-Anatomy) oder z-anatomy.com / SimTK / GitHub (Z-Anatomy/Models-of-human-anatomy).
- Rohdaten: **5,7 Mio. Dreiecke** – für ein Fitness-App-UI viel zu hoch aufgelöst, braucht Nachbearbeitung (siehe Pipeline unten).

**Alternative:** Vorgefertigte, bereits mobil-optimierte Muskel-Assets kaufen (z. B. auf Sketchfab Store, RenderHub, Envato Elements – Stichwort "Muscular System" .glb). Spart die Decimation-Arbeit, kostet aber Lizenzgebühr und Share-Alike entfällt meist (klassische Royalty-Lizenz) – für eine App oft der pragmatischere Weg als Z-Anatomy.

## 3. Technische Pipeline (Ziel: .glb für Formwert)

1. **Beschaffen:** Z-Anatomy-Modell laden (Blender-Datei) oder gekauftes Sketchfab/RenderHub-Modell direkt als .glb exportieren.
2. **Aufräumen in Blender:** nur Muskelschicht behalten, pro Muskel(-gruppe) ein benanntes Mesh/eigene Material-ID (damit später einzeln anklick-/einfärbbar).
3. **Decimation/Retopology:** von Millionen Dreiecken auf ein App-taugliches Budget (Richtwert: 50–150k Dreiecke für ein interaktives Vollkörpermodell auf Mobilgeräten).
4. **Export:** glTF/GLB mit Draco-Kompression, PBR-Material pro Muskelgruppe.
5. **Einbindung:**
   - Flutter: `model_viewer_plus` oder `flutter_gl`/`three_dart` für echtes Material-Switching.
   - Web/Artifact-Vorschau: Three.js bzw. React Three Fiber (`useGLTF` aus `@react-three/drei`), Muskel-Highlighting über eine Datenstruktur `Übung → [Hauptmuskeln, Sekundärmuskeln]`, die pro Übung die Material-Farbe der passenden Mesh-Namen umschaltet (z. B. Primär rot, Sekundär orange, Rest neutral).
6. **Naming-Konvention:** Mesh-Namen 1:1 auf deine Abkürzungs-Legende mappen (BF, RA, PM, …), damit Trainingsdaten direkt referenzierbar sind.

## 4. Nächste konkrete Schritte

- Entscheidung: Z-Anatomy (kostenlos, Share-Alike) vs. gekauftes optimiertes Asset (kostenpflichtig, einfacher lizenzierbar).
- Falls Z-Anatomy: Blender-Datei besorgen, Decimation/Segmentierung durchführen (kann ich übernehmen, sobald die Datei vorliegt bzw. zugänglich ist).
- Mesh-Namen mit deiner Muskel-Legende abgleichen und Mapping-Tabelle für die App-Logik anlegen.
- Danach: .glb bauen und in einem Web-Viewer (Artifact) testen, bevor es in Formwert eingebaut wird.

---

### Quellen
- [Myology – Z-Anatomy (Sketchfab)](https://sketchfab.com/3d-models/myology-31b40fd809b14665b93773936d67c52c)
- [Z-Anatomy: Models-of-human-anatomy (GitHub)](https://github.com/Z-Anatomy/Models-of-human-anatomy)
- [Z-Anatomy: The-blend Template (GitHub)](https://github.com/Z-Anatomy/The-blend)
- [SimTK: Z-Anatomy Projekt](https://simtk.org/projects/z-anatomy)
- [BodyParts3D Clone (GitHub, CC BY-SA 2.1 JP)](https://github.com/Kevin-Mattheus-Moerman/BodyParts3D)
- [React Three Fiber Anatomie-Pipeline (Referenz-Implementierung)](https://www.wellally.tech/blog/react-three-fiber-3d-anatomy-model-fitness-app)
- [Muskel-3D-Modelle – Sketchfab Store](https://sketchfab.com/tags/muscular)
- [GLB-Anatomie-Modelle – RenderHub](https://www.renderhub.com/glb-3d-models/anatomy)
