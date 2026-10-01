# Arbeitsanweisung für Chat-Assistenten

## Stand ab 27.09.2026 – bitte zuerst lesen

Die App ist **aufgeteilt** und liegt unter **`app/`** (`index.html`, `css/`, `js/data.js`,
`js/app/01-…16-…js`, `assets/`). Das ist dieselbe Fassung wie im Artifact (Version 408).
Die Einzeldatei `formwert_app.html` und `quelltext/` weiter unten sind **veraltet** (Version 267).

- Änderungen direkt in den Dateien unter `app/` machen, so klein wie möglich.
- **Vor dem Veröffentlichen immer den Live-Stand lesen.** Mehrere Sitzungen arbeiten
  parallel. Hat jemand inzwischen veröffentlicht, dessen Dateien holen und per
  `git merge-file` zusammenführen, nie einfach überschreiben.
- Beim Veröffentlichen nur die geänderten Dateien mitschicken.
- Alte Patches (für die Einzeldatei) lassen sich mit `werkzeug/patch_uebertragen.py`
  auf `app/` übertragen.
- Plan und offene Punkte: `PLAN-app-veroeffentlichen.md`.

Die Regeln für den Code weiter unten gelten unverändert.

## Arbeitsweise ab 01.10.2026 – von selbst anwenden, Joel nicht erinnern lassen

Hintergrund: `wissen/kontingent-2026-10-01.md` (lange Sitzungen kosten bis 4× je Schritt)
und `wissen/erkenntnisse.md`.

- **Eine Aufgabe pro Sitzung.** Ist ein Abschnitt fertig (Muskel, Clip, Funktion), Stand in
  Memory/Plan festhalten und Joel eine neue Sitzung vorschlagen. Ein Hook
  (`.claude/hooks/kontext_hinweis.py`) meldet sich ab 250.000 Tokens – dann ansprechen.
- **Mechanisches an `werkzeug-helfer`** (`.claude/agents/`, günstigeres Modell): Suchen,
  `ruck_messen.py`, `patch_anwenden.py --probe`, Syntaxprüfung, Blender-Läufe mit Kennzahlen.
  Entscheidungen, 3D-Gestaltung, Zusammenführen und Veröffentlichen bleiben in der Hauptsitzung.
- **Ausgaben klein halten:** Blender-Skripte geben nur Kennzahlen aus, der Rest geht in eine
  Datei. Text lesen statt Screenshots; Screenshots verkleinert (`scale` 0.5).
- **Vor jedem Veröffentlichen** zusätzlich zum Testdurchlauf: `/code-review` auf die geänderten
  Dateien. Wenn Speicherung, Backup, Sync oder Eingaben betroffen sind, außerdem
  `/security-review`. Im Testdurchlauf auf 375 px Breite die längsten Übungsnamen
  ansehen (Training, Banner, Routinenliste, Kopfzeile). Sie dürfen nichts aus dem Bild schieben.
- **Tests müssen grün sein** (`tests/formwert-tests.js`, läuft bei jedem Push). Vor dem
  Veröffentlichen `gh run list -w Tests -L 1` ansehen. Rot heißt: erst klären, dann weiter.
  Der SessionStart-Hook `.claude/hooks/tests_status.py` meldet Rot von selbst.
- **Wer Verhalten bewusst ändert, passt den Test im selben Commit an.** Neue Funktion: vorher
  2–4 prüfbare Kriterien aufschreiben („10 min Dehnen = 1 Einheit, höchstens 2 pro Tag“). Die
  wichtigsten davon kommen als Test dazu. Keine Entscheidung still treffen: Gibt es mehrere
  sinnvolle Varianten, die gewählte im Commit nennen (Hintergrund: `wissen/erkenntnisse.md` E9).
- **Vor Arbeit an einem Thema** `wissen/` danach durchsehen (Übungstechnik, Design, Tools).
- **Keine großen Plugin-Pakete installieren.** Sie verlängern die Grundanweisungen jedes
  Schritts. Einzelne Agenten oder Skills nur gezielt übernehmen.
- **Offene Aufgaben** gehören auf die To-Do-Liste (Artifact „Formwert Offene Punkte“,
  https://claude.ai/artifact/VKH7jhzqZusa8JakMewBAs), nicht nur in den Chat.

---

Diese Datei richtet sich an ChatGPT, Claude oder jeden anderen Assistenten,
der an dieser App arbeiten soll. Bitte vollständig lesen, bevor du etwas
vorschlägst.

## Was das hier ist

**Formwert** ist eine Trainings-App. Sie besteht aus **einer einzigen
HTML-Datei**: `formwert_app.html`, rund 13 MB. Kein Build, kein Framework,
kein Server. Vanilla JavaScript, im Stil von ES5 gehalten.

Von den 13 MB sind über 11 MB eingebettete Daten (ein 3D-Anatomiemodell,
Körperbilder, Icons) als base64. Der eigentliche Quelltext sind rund 700 KB.

## So liest du den Quelltext

**Lade niemals `formwert_app.html` direkt** – die Datei ist zu groß, du
bekommst nur die ersten paar Tausend Zeichen und damit nichts Brauchbares.

Nimm stattdessen die Lesefassung unter `quelltext/`:

1. Zuerst **`quelltext/INDEX.md`** laden. Dort steht in einer Tabelle, welche
   Funktion in welcher Datei steht.
2. Dann gezielt die eine Datei laden, die du brauchst (jede unter 110 KB).

Die Rohadressen, falls du sie brauchst:

```
https://raw.githubusercontent.com/Joelclk/formwert-app/main/quelltext/INDEX.md
https://raw.githubusercontent.com/Joelclk/formwert-app/main/quelltext/code/c03.js
```

Die Dateien unter `quelltext/` sind **Lesekopien**. Sie werden nicht
ausgeführt und sind einzeln nicht lauffähig. Lange Datenblöcke stehen dort
nur als Platzhalter `"__DATEN_ENTFERNT__..."`.

## So schlägst du eine Änderung vor

**Gib nie die geänderte Gesamtdatei aus.** Bei 13 MB ist das unmöglich, und
jeder Versuch zerstört die eingebetteten Daten.

Schreibe stattdessen eine Änderungsdatei nach `patches/`, benannt
`JJJJ-MM-TT-kurzer-name.md`, in genau diesem Aufbau:

    ## Was geändert wird und warum

    ALT:
    ```js
    <Text, der ersetzt wird>
    ```

    NEU:
    ```js
    <Text, der stattdessen dort stehen soll>
    ```

Mehrere ALT/NEU-Paare pro Datei sind erlaubt. Regeln dafür:

- Der **ALT-Block muss buchstabengetreu** in `formwert_app.html` vorkommen,
  samt Leerzeichen und Zeilenumbrüchen – **genau einmal**. Ist er zu kurz und
  kommt mehrfach vor, nimm ein paar Zeilen mehr drumherum dazu.
- Kopiere den ALT-Block aus den Dateien unter `quelltext/` – der Text dort ist
  bis auf die Platzhalter identisch mit dem Original.
- Kein ALT-Block darf einen Platzhalter `__DATEN_ENTFERNT__` enthalten.
- Halte die Blöcke klein: die eine Funktion, die eine Zeile. Nicht 500 Zeilen
  ersetzen, wenn sich drei ändern.

Angewendet wird das dann mit:

```
python3 werkzeug/patch_anwenden.py patches/2026-09-18-mein-name.md --probe
python3 werkzeug/patch_anwenden.py patches/2026-09-18-mein-name.md
python3 werkzeug/zerlegen.py
```

Das Skript bricht ab und ändert nichts, wenn ein ALT-Block nicht genau einmal
vorkommt.

## Änderungen am 3D-Modell

Der 3D-Anatomie-Betrachter steht in `app/assets/3d-viewer.js` als ein einziger
JavaScript-Text (`FW3D_HTML`, eine komplette HTML-Seite). Daran wird in
`muskelmodell_3d_vollstaendig.html` gearbeitet, das mit
`werkzeug/modell_auspacken.py` aus der App geholt und mit
`werkzeug/modell_einpacken.py` zurückgebracht wird (Ablauf im `README.md`).
`3d-viewer.js` nie von Hand bearbeiten.
Nie an einer alten Fassung dieser Datei weiterarbeiten – immer erst frisch
auspacken. Am Modell arbeitet nur eine Sitzung gleichzeitig.

Der kleine **3D-Bewegungsablauf** auf der Übungsseite ist davon getrennt:
`app/assets/anim-viewer.js` (Betrachter) und `anim-modell.js` / `anim-modell-bein.js`
(Modelle, gzip + base64). Aus- und Einpacken mit `werkzeug/animation_einpacken.py`;
neue Bein-Bewegungen entstehen in Blender mit `werkzeug/bein_animation_blender.py`.

## Regeln für den Code

- **Sprache der Oberfläche ist Deutsch.** Auch Kommentare auf Deutsch.
- **Keine externen Abhängigkeiten.** Kein CDN, kein npm, keine neue Bibliothek.
  Die App muss offline aus einer Datei laufen.
- **Kein Framework-Stil.** Kein JSX, keine Klassen-Komponenten. So schreiben
  wie der Code drumherum: `function`, `var`, direkte DOM-Aufrufe.
- **Farben und Abstände** kommen aus den Design-Variablen in `:root`
  (`var(--accent)`, `var(--ink-2)` …). Keine Farbwerte hart eintragen.
- **Hell und dunkel** müssen beide funktionieren – es gibt einen Dunkelmodus.
- **Gespeicherte Daten nicht brechen.** Trainingsdaten liegen in
  `localStorage` und in einer Cloud-Datenbank. Wer Datenfelder umbenennt,
  muss alte Stände weiter lesen können.
- **Kommentare erklären das Warum**, nicht das Was. Kein `// Schleife über
  Übungen`.

## Was du nicht tun sollst

- Die App neu schreiben, aufteilen oder auf ein Framework umstellen.
- Eine Build-Kette vorschlagen (Webpack, Vite, npm). Es gibt keine.
- Dateien unter `quelltext/` ändern – die werden aus `formwert_app.html`
  erzeugt und bei der nächsten Veröffentlichung überschrieben.
- `formwert_app.html` von Hand bearbeiten.

## Wie eine Änderung live geht

`formwert_app.html` in diesem Repo ist eine **Kopie** des zuletzt
veröffentlichten Stands. Die laufende App ist ein Claude-Artifact. Der Weg
einer Änderung:

1. Du schreibst die Änderungsdatei nach `patches/`.
2. Joel gibt sie an Claude weiter (oder wendet sie selbst mit dem Skript an).
3. Claude wendet sie an, prüft die Syntax, lässt einen Testdurchlauf durch
   alle vier Tabs laufen und veröffentlicht die neue Version.
4. `formwert_app.html`, `VERSION` und `quelltext/` werden neu erzeugt.

Ohne Schritt 3 ist nichts live. Eine Änderung nur im Repo ändert die App
nicht.
