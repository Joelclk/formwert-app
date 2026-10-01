# Erkenntnisse aus den Videos

Nach Themen gebündelt. Jeder Abschnitt: was die Videos sagen, was davon stimmt,
was wir konkret machen. Quellen siehe `videos.md`.

**Allgemein:** 14 von 16 Videos verlangen „Kommentiere X, dann schick ich dir …“. Das ist
nur ein Trick für mehr Reichweite. Die genannten Tools sind fast immer frei auf GitHub zu
finden. Kommentieren ist nie nötig.

---

## E1 Kontingent und Limits (Video 1)

- **Behauptung:** OmniRoute hängt „90 Gratis-Anbieter“ an Claude Code, kein Warten mehr.
- **Stimmt:** Das Tool gibt es (github.com/diegosouzapw/OmniRoute, MIT). Es schaltet sich
  über `ANTHROPIC_BASE_URL` zwischen Claude Code und die Modelle.
- **Haken:**
  - schwächere Modelle übernehmen unbemerkt
  - der Code geht an viele fremde Anbieter
  - Abo-Anmeldungen weiterzuverwenden kann gegen Nutzungsbedingungen verstoßen
- **Für uns:** Nicht für die Hauptarbeit (3D-Modell, Zusammenführen, Veröffentlichen).
- **Brauchbarer Kern:** Mit dem besten Modell anfangen, nur gezielt herunterschalten.
  - Rein mechanische Aufgaben gehen an günstigere Helfer-Agenten, zum Beispiel:
    - Dateien durchsuchen
    - `ruck_messen.py` laufen lassen
    - `patch_anwenden.py --probe`
  - Wenn eine Prüfung (wie bei OmniRoute) überhaupt, dann mit `auto/coding`, nicht `auto` und nicht `auto/cheap`.
- **Wichtiger als jedes Tool:** Die eigene Auswertung (`kontingent-2026-10-01.md`) zeigt:
  82 % des Kontingents fließen in Arbeitsschritte, bei denen schon über 300.000 Tokens
  im Gespräch liegen. → **Kurze Sitzungen, eine Aufgabe pro Sitzung.**

## E2 Befehle, die Kontingent sparen (Video 6)

- `/clear` – Gespräch leeren, wenn eine Aufgabe fertig ist. Das wirksamste Mittel überhaupt.
- `/compact` – Gespräch zusammenfassen, wenn man im selben Thema weitermacht.
- `/usage` – Verbrauch ansehen.
- `/rewind` – zu einem früheren Stand zurück, statt Fehler im Gespräch mitzuschleppen.
- `/effort`, `/model` – Denktiefe und Modell an die Aufgabe anpassen.
- Im Desktop-Programm stehen nicht alle davon zur Verfügung. Eine neue Sitzung starten
  wirkt dort wie `/clear`.

## E3 Erweiterungen und Plugins (Videos 4, 5, 6)

- **ECC (Everything Claude Code):** großes Paket mit 63–68 Agenten und 249 Skills.
- **Haken:** Jede installierte Erweiterung verlängert die Grundanweisungen, die bei
  *jedem* Schritt neu gelesen werden. Die machen bei uns schon 37 % aus.
  249 Skills auf einen Schlag würden jeden Schritt teurer machen.
- **Für uns:** Nicht komplett installieren. Höchstens einzelne Agenten übernehmen, die wir
  wirklich brauchen, und dann als eigene Datei unter `.claude/agents/`.
  Das Muster „Planer → Bauer → Prüfer“ nutzen wir schon (Kritik-Agent beim 3D-Modell).
- **Haben wir schon:**
  - Browser-Steuerung (eingebauter Browser, Chrome)
  - Gedächtnis (Memory-Ordner)
  - Code-Review (`/code-review`)
  - Sicherheitsprüfung (`/security-review`)

## E4 Recht und Sicherheit vor dem Veröffentlichen (Video 2)

- **Datenbank-Schlüssel im Frontend:** Bei Formwert kein Problem. Die App nutzt die
  Datenbank der Artifact-Umgebung (`window.claude.use("db")`, `07-konto-sync.js`,
  `14-start.js`). Es steht kein Schlüssel im Code (geprüft 01.10.2026).
- **Meldefrist 72 Stunden bei Datenpannen:** Die Frist stimmt (DSGVO Art. 33).
  Die Aussage im Video „ab dem Vorfall, nicht ab dem Bemerken“ ist **falsch**. Die Frist
  läuft ab dem Bekanntwerden.
- **KI-Kennzeichnung (AI Act Art. 50, ab 02.08.2026):** Wer Menschen mit einer KI
  sprechen lässt, muss das erkennbar machen. Formwert hat derzeit keinen KI-Chat.
  **Falls einer dazukommt:** vor der ersten Nachricht sagen, dass es eine KI ist.
- **Wenn die App außerhalb des Artifacts öffentlich wird** (siehe
  `PLAN-app-veroeffentlichen.md`): Impressum und Datenschutzerklärung nötig, weil
  Trainingsdaten Gesundheitsdaten nahekommen. Dann rechtlich prüfen lassen, nicht nur
  per Checkliste aus einem Video.

## E5 Persönlicher Assistent („Jarvis“) (Videos 9–15)

- **Alle Videos beschreiben dasselbe Muster:** Claude als Kern, dazu
  - Mail und Kalender über MCP
  - Browser
  - Helfer-Agenten
  - wiederkehrende Aufgaben (Routines)
  - Gedächtnis
  - Morgen-Briefing
  - Stimme (ElevenLabs) und Telegram/Slack als Eingang
- **Haben wir schon:**
  - Gmail- und Kalender-Connector
  - geplante Aufgaben
  - Skill `morning` (Morgen-Briefing)
  - Memory
  - Browser
  - Helfer-Agenten
- **Was fehlt:** nur Stimme und Messenger-Eingang. Das wäre ein eigenes Projekt außerhalb
  von Formwert und kostet laufend (ElevenLabs-Guthaben).
- **Prüfen:** Morgen-Briefing einrichten (Kalender + Mails + Stand der Formwert-Arbeit).

## E6 Videos mit Claude schneiden (Video 3)

- Claude + Remotion (Videos aus Code) + optional HyperFrames für Grafiken.
- Ablauf: Material in einen Ordner, Wunsch beschreiben, Claude baut den Schnitt.
- **Für Formwert denkbar:** Werbeclips oder Vorstellungsvideos der App. Keine Priorität.
- **Achtung:** Remotion braucht Node/npm. Das betrifft nur ein separates Projekt, nie die
  App selbst (Regel: keine Build-Kette in der App).

## E7 Lernen mit Claude (Video 16)

- Tutor-Prompts: Feynman-Methode (in eigenen Worten erklären lassen), Fehlersimulator,
  Lernpfad. Claude fragt nach, statt nur zu erklären.
- Die Aussage „jede Fähigkeit in 4 Stunden“ ist übertrieben.
- **Haben wir ähnlich:** Skill `priming`.
- **Prüfen:** Für Anatomie-Wissen (Muskelverläufe beim 3D-Modell) könnte ein Prüf-Modus
  helfen. Dabei erklärt Claude einen Muskel, und der Kritik-Agent fragt Lücken ab.

## E8 Apps mit Claude Code bauen (Videos 17, 18)

Beide Videos zeigen, wie eine App von null an Schritt für Schritt per Prompt entsteht.
Video 17 ist vor allem Werbung für eine bezahlte Community („Klon einer 400.000-$-App“).
Video 18 ist ein echter Bauablauf einer Trainings-App und darum der nützlichere Vergleich.
Grundlage: Transkripte. Was nur im Bild zu sehen war (Bildschirmaufbau, Farben), fehlt.

**Was die Videos zeigen und wie Formwert dasteht:**

| Punkt aus dem Video | Formwert | Stelle |
|---|---|---|
| Banner „laufende Übung“ auf dem Startbildschirm, tippen = zurück ins Training (18) | haben wir | `app/js/app/08-training.js:1481` (`renderBanner`) |
| Timer läuft weiter, wenn die App geschlossen wird; nach dem Neustart ging bei ihm sofort Meldung + Countdown los (18) | haben wir, der Fehler ist bei uns abgefangen: Pausenende wird aus `endAt` berechnet, über 10 min verspätet = kein Ton | `08-training.js:309` (`restSignal`) |
| Daten gingen beim Schließen verloren, erst am Ende auf lokale Speicherung umgestellt (18) | haben wir: Speichern bei `pagehide`/`visibilitychange`, dazu Cloud | `08-training.js:95`, `:113` |
| Dunkelmodus: Symbole weiß auf weiß, Tab-Leiste in falscher Farbe (18) | Regel „nur Design-Variablen“ gilt. Prüfung 01.10.2026: feste `#fff`/`white` nur in Erfolge/Ränge/Vitrine (46 Stellen, gewollte Glanzlichter und Symbole auf farbigen Plaketten), keine in Training/Übungen/Routinen | `15d`–`15g` |
| Zu langer Text („Intermediate“) zerschießt die Kopfzeile → durch Symbol ersetzt (18) | Gefahr bei uns größer, deutsche Namen sind lang: längster Übungsname hat 37 Zeichen („Schulter-Durchzüge mit Band oder Stab“) | Prüfschritt unten |
| Übungsbibliothek aus fremdem Datensatz mit GIFs (Kaggle/GitHub) (18) | **nein**: eigene 3D-Clips. GIF-Sammlungen haben oft unklare Lizenzen und einen anderen Stil | – |
| Onboarding fragt Ziel, Level, Minuten pro Einheit, Tage pro Woche, Ausrüstung → App baut Plan (18) | bewusst anders: „Ziele ergeben sich“ aus Alter, Geschlecht, Gewicht | `13-onboarding.js:32` |
| Apple Health, echte Push-Mitteilungen (18) | **geht nicht**: Web-App im Artifact, kein HealthKit, Mitteilungen im Hintergrund nicht verlässlich | – |
| Lernbereich + Quiz mit Erklärung der richtigen Antwort (17) | fehlt. Die Übungsdetailseite zeigt Figuren und Muskeln, aber keine Technikhinweise | `09-uebungsdetail.js:241` (`exDetailInfo`) |
| Schlüssel nie in den Code, `.env` + `.gitignore` (17) | haben wir, kein Schlüssel im Code (siehe E4) | – |
| Am Ende die App einmal als Nutzer komplett durchklicken (17, 18) | haben wir: Testdurchlauf durch alle vier Tabs vor jeder Veröffentlichung | `AGENTS.md` |

**Für uns brauchbar (nach Nutzen sortiert):**

1. **Technikhinweise pro Übung** (aus 17, „Lernen“). Kein eigener Lernbereich und kein
   Quiz, das passt nicht zu einer Trainings-App. Stattdessen auf der Übungsdetailseite ein
   kurzer Abschnitt „Darauf achten“ mit 3–4 Punkten und „Häufige Fehler“. Der Inhalt liegt
   für die Kniebeuge schon vor (`wissen/kniebeuge.md`, Abschnitt „Was das für Formwert
   heißt“). Ausbaufähig mit dem Skill `video-lernen` für Bankdrücken, Kreuzheben usw.
   **Bewertung: übernehmen**, Übung für Übung, beginnend mit der Kniebeuge.
2. **Prüfschritt „lange Texte“** (aus 18). Beim Testdurchlauf auf 375 px Breite die
   längsten Übungsnamen in Trainingsseite, Banner, Routinenliste und Kopfzeile ansehen.
   Sie dürfen umbrechen oder gekürzt werden, aber nichts aus dem Bild schieben.
   **Bewertung: übernehmen** (Prüfschritt, kein Code).
3. **Ausrüstung im Onboarding** (aus 18). Eine Frage „Wo trainierst du? Studio / zu Hause
   mit Kurzhanteln / ohne Geräte“ würde die Übungsauswahl in Schritt 2 vorfiltern. Das
   widerspricht nicht dem Grundsatz „keine Ziele eintragen“. Tage pro Woche und Minuten
   pro Einheit dagegen nicht abfragen: Daraus würde ein Plan entstehen, und den baut
   Formwert bewusst nicht vor.
   **Bewertung: prüfen.** Gespeichert würde das als neues Profilfeld. Alte Stände ohne
   das Feld gelten als „Studio“.
4. **Referenzbild statt Beschreibung** bei Wünschen zur Oberfläche (18: das Ergebnis wurde
   erst mit Bild gut). Gilt schon für das 3D-Modell (Referenzvideos), gilt genauso für
   Bildschirme. **Bewertung: haben wir als Arbeitsweise.**

**Nicht übernehmen:** Bauen ab Null mit React Native/Expo/SwiftUI, Node, npm (Regel: keine
Build-Kette), fremde GIF-Datensätze, KI-Auswertung von Fotos (bräuchte einen
Schlüssel und einen Server, dazu KI-Kennzeichnung nach E4).

## E9 „Vibe Coding ist eine Falle“ (Video 19)

- **Behauptung:** Coding-Agenten machen Projekte über die Zeit kaputt. Sie treffen
  Entscheidungen still und bauen unnötige Komplexität ein. Irgendwann drehen sie sich im
  Kreis und machen Bestehendes wieder kaputt.
- **Gegenmittel laut Video:**
  - Anforderungen mit prüfbaren Kriterien, bevor Code entsteht
  - geordneter Kontext, damit der Agent nicht raten muss
  - automatische Tests, die jede Änderung prüfen
- **Stimmt.** Der Rest des Videos ist ein Lockmittel („Kommentiere Vibe“).
- **Stand bei Formwert (Prüfung 01.10.2026):**
  - Kontext haben wir: `AGENTS.md`, Memory, `wissen/`, Plan-Datei.
  - Tests haben wir auch: `tests/formwert-tests.js`, 14 Prüfungen, laufen auf GitHub bei
    jedem Push.
  - **Aber:** Seit 30.09. abends waren sie rot, bei über 25 Pushes, und niemand hat es
    bemerkt.
- **Ursache:** Beim Live-Abgleich am 30.09. kam die Regel „über 10 min zählt jede Minute
  halb, höchstens 2 Einheiten pro Tag“ (`mobUnitsFromMin`). Der Test erwartete weiter genau
  1 Einheit. Die Änderung war gewollt, aber die Prüfkriterien wurden nicht mitgezogen.
  Genau das beschreibt das Video.
- **Was wir gemacht haben:**
  - Test an die neue Regel angepasst, dazu eine Prüfung der Obergrenze.
  - SessionStart-Hook `.claude/hooks/tests_status.py` meldet rote Tests. Bei Grün sagt
    er nichts.
  - In `AGENTS.md` steht jetzt: Tests vor dem Veröffentlichen grün. Wer Verhalten ändert,
    passt den Test im selben Commit an. Neue Funktionen bekommen vorher 2–4 prüfbare
    Kriterien.
- **Bewusst nicht:** Kein großes „Framework“ und keine Anforderungsdokumente pro
  Kleinigkeit. Für eine Ein-Personen-App reichen ein paar Kriterien im Plan und ein Test.
