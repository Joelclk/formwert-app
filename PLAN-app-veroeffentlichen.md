# Formwert: Plan für flüssige App und Veröffentlichung im App Store

Stand 27.09.2026. Geschrieben für Joel und für jede Claude-Sitzung, die an der App arbeitet.
Grundlage ist der **Live-Stand** (Artifact, 80 Dateien), nicht die alte `formwert_app.html`
in diesem Repo.

## 1. Wo wir stehen

| Thema | Stand |
|---|---|
| Aufbau | Live schon aufgeteilt: `index.html`, 5 CSS-Dateien, `js/data.js`, 20 Dateien unter `js/app/`, große Daten unter `assets/` (werden teils erst bei Bedarf geladen). |
| Code-Stil | Alle `js/app/`-Dateien teilen sich **einen globalen Namensraum** und müssen in genau dieser Reihenfolge geladen werden. Welche Datei was von welcher braucht, steht nirgends. |
| Repo | **Veraltet.** Hier liegt noch die Einzeldatei von Version 267. Die aktuelle Fassung existiert nur im Artifact. |
| Cloud | Sync und Backup-Download laufen über die Claude-Artifact-Laufzeit (`window.claude.use("db")`, `"downloads"`). **Außerhalb von claude.ai gibt es keine Cloud.** |
| Schriften | Kommen von Google Fonts (externer Server). |
| Tests | Keine automatischen Tests im Repo. |

## 2. Framework: Empfehlung

**Kein Neuschreiben in React, Flutter o. Ä.** Die App hat rund 750 KB funktionierenden Code.
Ein Neuschreiben kostet Monate und bringt alte Fehler zurück. Die gemessene Trägheit liegt an
Rechenwegen, nicht am fehlenden Framework (siehe Abschnitt 4).

Stattdessen in Schritten, jeder für sich lauffähig:

1. **Repo wird die Quelle.** (Erledigt: `app/`, siehe `AGENTS.md`.) Die 80 Live-Dateien kommen ins Repo, veröffentlicht wird nur
   noch aus dem Repo. Dann sehen alle Sitzungen denselben Stand, und jede Änderung ist
   nachvollziehbar. `AGENTS.md` muss dafür angepasst werden, denn sie verbietet bisher
   Aufteilen und Build-Werkzeuge.
2. **ES-Module + Vite.** Jede Datei sagt mit `import`/`export`, was sie braucht und liefert,
   statt eines globalen Namensraums. Vite bündelt, verkleinert und teilt die 3D-Teile ab.
   Die Umstellung geht Datei für Datei, die App läuft nach jedem Schritt.
3. **Capacitor für iOS und Android.** Derselbe Web-Code wird zur echten Store-App. Dazu
   kommen Plugins für Haptik, Benachrichtigungen (Pausen-Timer), Teilen/Dateien (Backup)
   und später Apple Health / Health Connect.
4. **Eigenes Backend statt Artifact-Datenbank.** Empfehlung: **Supabase in der Region
   Frankfurt** (Postgres, Anmeldung, DSGVO-tauglich). Firebase ginge auch. Der Sync-Code nutzt
   schon eine Firestore-ähnliche Schnittstelle (`db.doc(...).set/get`). Ein kleiner Adapter
   reicht, der Rest der App bleibt.
5. **Tests und CI.** Der Browser-Rundgang aus dieser Sitzung (Einrichtung, alle Tabs,
   Training mit Satz, Neuladen, Tageswechsel, deutsch + englisch) läuft als GitHub Action bei
   jeder Änderung.

Ein UI-Framework (z. B. Preact oder Svelte) kann später für **neue** Bildschirme dazukommen.
Für den Store ist es nicht nötig.

## 3. Pflichten für den Store

- **Konto löschen in der App** (Apple verlangt das, sobald es Konten gibt).
- **Sign in with Apple**, falls andere Anmeldungen wie Google angeboten werden.
- Datenschutzerklärung und Impressum, Datenschutz-Angaben in App Store und Play Store.
- ~~**Google Fonts lokal einbinden.**~~ Erledigt, live seit Version 422: `app/fonts/` +
  `fonts/schriften.js` (per `fetch` + `FontFace`, weil die Artifact-CSP Schriftdateien nur von
  Google oder als data:-URI erlaubt).
- **Lizenzen nennen:** Z-Anatomy (CC BY-SA 4.0, Weitergabe des Modells unter gleicher
  Lizenz), js-rich-body-highlighter (MIT), three.js (MIT).
- Hinweis, dass die App keine medizinische Beratung ist.

## 4. Flüssiger: gemessen, nicht geraten

Messung am Live-Stand: ein Jahr Testdaten (365 Tage, 3.536 Sätze), CPU 4× gedrosselt
(ungefähr Mittelklasse-Handy):

| Stelle | Zeit | Ursache |
|---|---|---|
| Kaltstart bis Formwert sichtbar | 0,5 s | ok |
| Werte-Tab nach jeder Änderung | **0,43 s** | `compute()` läuft 120-mal. Jeder Lauf ging für jede Übung erneut über alle Sätze (`bestFor`). |
| Entdecken, erstes Öffnen | **0,65–0,8 s** | 2.019 DOM-Elemente: alle Übungskarten mit Figuren auf einmal |
| Tabs erneut öffnen | 35–130 ms | ok |

**Erledigt, live seit Version 408:** Werte-Tab 472 → 236 ms, `bestFor` 225 → 20 ms,
Ergebnisse identisch (120 von 120 Stichtagen).

**Als Nächstes:**
1. Entdecken: nur sichtbare Übungskarten aufbauen, den Rest beim Scrollen
   (oder `content-visibility:auto` als schneller erster Schritt).
2. `compute()` innerhalb eines Render-Durchgangs je Stichtag nur einmal rechnen
   (Verlauf und „Letzte Tage“ überschneiden sich).
3. Große Daten als echte Binärdateien (`.glb`, `.webp`) statt base64 in JavaScript:
   rund ein Viertel kleiner, kein Dekodieren beim Start. Betrifft `assets/3d-viewer.js`
   (11 MB) und `assets/fig-*.js` (17 MB).
   **Erster Schritt erledigt, live seit Version 421:** `3d-viewer.js`
   hatte eine überflüssige äußere base64-Schicht um die ganze Betrachter-Seite. Die ist weg
   (11,2 → 8,4 MB), und `fw3dHtml()` merkt sich das Ergebnis. Vorher wurde die Seite bei
   jedem Aufruf neu ausgepackt – Körper-Tab und Figuren je einmal, bei 4× gedrosselter CPU
   je 0,75–1,3 s. Jetzt 0 ms, nur noch das Laden der Datei (~0,2 s). Beide Dateien
   (`04-animation.js`, `assets/3d-viewer.js`) müssen zusammen veröffentlicht werden; jede
   funktioniert zur Not auch mit der alten Fassung der anderen (getestet).
   **Offen:** In der Seite stecken noch 7,7 MB base64 (Modell 4,7 MB, Knochen 2,2 MB,
   Draco-Decoder 0,7 MB). Als echte Binärdateien wären das rund 5,8 MB. Dafür müsste der
   Betrachter die Daten per `fetch` oder `postMessage` bekommen – vorher klären, ob die
   Artifact-Umgebung `.glb`/`.bin` ausliefert und `fetch` erlaubt.

## 5. Fehler im Live-Stand – erledigt mit Version 408 (27.09.2026)

Alles unten ist behoben und live. Dazu kam ein neuer Fehler aus der Klimmzug-Umstellung:
Die Einrichtung trug bei „0 Wdh.“ einen erfundenen Satz „Klimmzug 0 kg × 1“ ein.



1. **Cloud lädt höchstens 400 Tage** (`collection("days").limit(400)`, unsortiert, in
   `js/app/14-start.js`). Wer mehr gespeicherte Tage hat, verliert auf einem neuen Gerät
   zufällig ältere Tage.
2. **Folgende Patches sind im Live-Stand nicht enthalten.** Sie sind für die alte Einzeldatei
   geschrieben und müssen auf die neuen Dateien übertragen werden:
   - `2026-09-26-tageswechsel-bei-offener-app.md`: „Heute“ bleibt über Nacht auf dem Vortag
     (`TODAY` wird nur beim Start gesetzt).
   - `2026-09-26-training-fehler.md`: fünf Fehler im laufenden Training.
   - `2026-09-26-auswertung-fehler.md`: vier Fehler in Werte, Einrichtung, Körper-Tab.
   - `2026-09-26-ausdauer-uebung-bearbeiten.md`: Ausdauer-Übung wird beim Speichern zur
     Kraftübung.
   - `2026-09-26-englische-oberflaeche.md`: live etwa 355 Übersetzungen, der Patch bringt
     etwa 600.
   Schon live, in eigener Fassung: Sync-Datenverlust und die restlichen englischen Texte.

**Nach Version 408 im Repo korrigiert, noch nicht veröffentlicht (27.09.2026):**
Die Live-Fassung des Sync-Schutzes wiederholte fehlgeschlagene Übertragungen nur innerhalb
einer Sitzung. Nach einem Neustart überschrieb der ältere Cloud-Stand einen offline
geänderten früheren Tag oder eine Einheit – die Änderung war weg, lokal wie im Konto.
Jetzt werden die Markierungen `dirty`/`dirtyRoutines` im Hauptschlüssel mitgespeichert,
und `connect()` überschreibt markierte Tage und Einheiten nicht mehr
(`01-grundlagen.js`, `12-navigation.js`, `14-start.js`). Im Browser geprüft: vorher
verloren, nachher erhalten; eine neuere Änderung von einem anderen Gerät kommt weiterhin an.

## 6. Zusammenarbeit zwischen Sitzungen

- **Nur eine Sitzung veröffentlicht** das Artifact. Die anderen liefern Patches.
- Vor jeder Arbeit den Live-Stand lesen, nicht die Repo-Kopie, solange Schritt 1 nicht
  erledigt ist.
- Jeder Patch nennt seine Ziel-Datei in der neuen Struktur.
