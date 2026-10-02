# Formwert – Arbeitsanweisung

Gilt für jede Claude-Sitzung und jeden anderen Assistenten. Stand 02.10.2026.

**Formwert** ist eine Trainings-App in Vanilla JavaScript (ES5-Stil, kein Build, kein
Framework). Sie läuft als Claude-Artifact:
https://claude.ai/artifact/2VEGYVStFNcZbz8fUsgXg5 – die aktuelle Versionsnummer steht in `VERSION`.

## 1. Wo was steht

Jeder Ort hat genau eine Aufgabe. Nichts doppelt führen.

| Was | Wo |
|---|---|
| **Was zu tun ist**, was fertig ist, Stand einer Aufgabe | To-Do-Artifact „Formwert Offene Punkte“: https://claude.ai/artifact/VKH7jhzqZusa8JakMewBAs |
| App-Code (= Live-Stand) | `app/` (`index.html`, `css/`, `js/data.js`, `js/app/01-…16-…js`, `assets/`) |
| Fachwissen, Entscheidungen, Messungen | `wissen/` (Index: `wissen/README.md`) |
| Weg zum App Store | `PLAN-app-veroeffentlichen.md` |
| Tests | `tests/formwert-tests.js` (laufen bei jedem Push) |
| Skripte | `werkzeug/` |
| Blender-Dateien, Filme, Übergaben | `~/Downloads/Formwert/` (nie lose in Downloads) |
| Claudes eigene Arbeitsnotizen (Werkzeuge, Fallen) | Memory – **kein Projektstand** |
| Alte Einzeldatei (Version 267) | `archiv/` – nur noch Geschichte, nicht verwenden |

Der **Stand einer Aufgabe** („bis wo gekommen, was als Nächstes“) wird im passenden Punkt
der To-Do-Liste festgehalten, nicht im Chat und nicht im Memory. Neue Ideen kommen sofort unter
„Noch einsortieren“.

## 2. Arbeitsbereiche und Sitzungen

Vier Bereiche, in der Seitenleiste als Gruppen:

| Gruppe | Was dazugehört |
|---|---|
| 📱 App | Funktionen, Design, Fehler, Daten in `app/` |
| 🦴 3D & Animation | Blender, Muskelmodell, Bewegungsclips, `app/assets/anim-*`, `3d-viewer.js` |
| 📚 Wissen & Arbeitsweise | Videos auswerten, `wissen/`, Abläufe, Werkzeuge, diese Datei |
| 📣 Marketing | Instagram, Werbeclip, Store-Texte und -Bilder |

Regeln:

- **Eine Sitzung = ein Punkt der To-Do-Liste.** Beginnen mit **`/start <Bereich>`**, beenden mit
  **`/fertig`**. Joel muss sich den Ablauf nicht merken. Startet er ohne `/start`, ordnet Claude
  die Sitzung trotzdem selbst ein (Titel, Gruppe, Punkt auf der Liste).
- **Höchstens eine laufende Sitzung je Bereich.** Im 3D-Bereich gilt das ausnahmslos, weil
  Blender-Dateien und Modell-Exporte nicht zusammenführbar sind.
- **Lange Sitzungen kosten bis 4× je Schritt** (`wissen/kontingent-2026-10-01.md`). Ist der Punkt
  fertig oder meldet der Hook 250.000 Tokens: `/fertig` vorschlagen und neu starten.

## 3. Arbeitsweise

- **Vor Arbeit an einem Thema** `wissen/` danach durchsehen (Übungstechnik, Design, Tools).
- **Neue Funktion: erst Kriterien.** 2–4 prüfbare Sätze („10 min Dehnen = 1 Einheit, höchstens 2
  pro Tag“). Sie stehen als „Fertig, wenn“ im To-Do-Punkt; fehlen sie, zuerst dort eintragen.
  Die wichtigsten werden ein Test. Gibt es mehrere sinnvolle Varianten, Joel fragen statt still
  entscheiden; die gewählte im Commit nennen (`wissen/erkenntnisse.md` E9).
- **Wer Verhalten bewusst ändert, passt den Test im selben Commit an.**
- **Mechanisches an `werkzeug-helfer`** (`.claude/agents/`, günstigeres Modell): Suchen,
  `ruck_messen.py`, `patch_uebertragen.py --probe`, Syntaxprüfung, Blender-Läufe mit Kennzahlen.
  Entscheidungen, 3D-Gestaltung, Zusammenführen und Veröffentlichen bleiben in der Hauptsitzung.
- **Ausgaben klein halten:** Blender-Skripte geben nur Kennzahlen aus, der Rest geht in eine
  Datei. Text lesen statt Screenshots; Screenshots verkleinert (`scale` 0.5).
- **Ergebnisse mit Zahlen melden** („41 von 41 Bildern ruckfrei“), nicht nur „erfolgreich“.
- **Antworten an Joel kurz und einfach:** 2–4 Sätze in Alltagssprache, ohne Dateinamen und interne Kürzel.
  Einzelheiten gehören in die To-Do-Liste oder die Übergabe, nicht in den Chat.
- **Keine großen Plugin-Pakete installieren.** Einzelne Agenten oder Skills nur gezielt.

## 4. Veröffentlichen

Mehrere Sitzungen arbeiten parallel, deshalb immer so:

1. Tests grün: `gh run list -w Tests -L 1`. Rot heißt: erst klären.
2. `/code-review` auf die geänderten Dateien. Bei Speicherung, Backup, Sync oder Eingaben
   zusätzlich `/security-review`.
3. Testdurchlauf auf 375 px Breite, hell und dunkel; die längsten Übungsnamen dürfen in Training,
   Banner, Routinenliste und Kopfzeile nichts aus dem Bild schieben.
4. **Live-Stand lesen.** Hat jemand inzwischen veröffentlicht, dessen Dateien holen und per
   `git merge-file` zusammenführen, nie überschreiben.
5. Nur die geänderten Dateien mitschicken. Danach `VERSION` nachziehen, committen, pushen.

Veröffentlichen und Pushen nur, wenn Joel es für diese Aufgabe freigegeben hat.

## 5. Am 3D-Modell arbeiten

Der große Anatomie-Betrachter steht in `app/assets/3d-viewer.js` als ein JavaScript-Text
(`FW3D_HTML`). Bearbeitet wird `muskelmodell_3d_vollstaendig.html`: mit
`werkzeug/modell_auspacken.py` frisch holen, mit `werkzeug/modell_einpacken.py --probe` und dann
ohne `--probe` zurückbringen. `3d-viewer.js` nie von Hand bearbeiten, nie an einer alten
ausgepackten Fassung weiterarbeiten.

Der kleine **Bewegungsablauf** auf der Übungsseite ist getrennt: `app/assets/anim-viewer.js`
(Betrachter) und `anim-modell.js` / `anim-modell-bein.js` (Modelle, gzip + base64). Ein- und
Auspacken mit `werkzeug/animation_einpacken.py`. Ablauf und Fallen stehen im Memory.

## 6. Regeln für den Code

- **Oberfläche und Kommentare auf Deutsch**; Englisch als zweite Sprache über `11-sprache.js`.
- **Keine externen Abhängigkeiten.** Kein CDN, kein npm, keine neue Bibliothek.
- **Kein Framework-Stil.** `function`, `var`, direkte DOM-Aufrufe, wie der Code drumherum.
- **Farben und Abstände** nur aus den Design-Variablen in `:root` (`var(--accent)` …).
- **Hell und dunkel** müssen beide funktionieren.
- **Gespeicherte Daten nicht brechen.** Trainingsdaten liegen in `localStorage` und in der
  Cloud-Datenbank. Wer Felder umbenennt, muss alte Stände weiter lesen können.
- **Kommentare erklären das Warum**, nicht das Was.
- Änderungen so klein wie möglich: die eine Funktion, die eine Zeile.

Nicht tun: die App neu schreiben oder auf ein Framework bzw. eine Build-Kette umstellen. Das
steht erst in Phase 5 des Plans an und wird dort von Joel entschieden.

## 7. Für Assistenten ohne Zugriff auf das Repo (z. B. ChatGPT)

Die Dateien unter `app/js/app/` sind klein genug, um sie einzeln zu laden:

```
https://raw.githubusercontent.com/Joelclk/formwert-app/main/app/js/app/08-training.js
```

Änderungen nicht als ganze Datei ausgeben, sondern als Änderungsdatei nach `patches/`
(`JJJJ-MM-TT-kurzer-name.md`) mit ALT/NEU-Blöcken:

    ## Was geändert wird und warum

    ALT:
    ```js
    <Text, der ersetzt wird – muss genau einmal unter app/js/ vorkommen>
    ```

    NEU:
    ```js
    <Text, der stattdessen dort stehen soll>
    ```

Angewendet wird das mit `python3 werkzeug/patch_uebertragen.py patches/X.md --probe` und danach
ohne `--probe`. Live geht es erst, wenn eine Claude-Sitzung es nach Abschnitt 4 veröffentlicht.
