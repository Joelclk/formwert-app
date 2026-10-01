# Design-Werkzeuge für Claude Code

Recherche vom 01.10.2026. Frage: Welche Agenten, Skills oder Plugins verbessern Design,
Aufteilung und Bedienung von Formwert spürbar, ohne gegen die Regeln aus `AGENTS.md`
zu verstoßen und ohne die Grundanweisungen dauerhaft aufzublähen (E3 in `erkenntnisse.md`)?
Installiert wurde nichts. Videos wurden nicht ausgewertet. Die Quellen sind Texte und
Dateien auf GitHub.

## Was wir schon haben

- **Lokal installiert:** keine Plugins, keine Design-Skills. Der Plugin- und Skill-Katalog
  des Kontos liefert zu „Design“, „UX“ und „Barrierefreiheit“ nichts.
- **`artifact-design`** (Anthropic, mitgeliefert): Gestaltungsregeln für *neue*
  Artifact-Seiten (Titel, Farbvariablen, hell/dunkel, 375 px). Für eine Überprüfung der App
  ist er nicht gedacht.
- **`/code-review`, `/security-review`**, der eingebaute Browser (`Claude_Browser`:
  `resize_window` für 375 px und hell/dunkel, `read_page` für den Barrierefreiheitsbaum),
  der Helfer-Agent `werkzeug-helfer`.
- **Die App selbst ist schon weit.** Zählung in `app/` vom 01.10.2026:
  - 115 × `aria-label`
  - 16 × `prefers-reduced-motion`
  - 33 × `safe-area-inset`
  - 26 × `tabular-nums`
  - 23 × `touch-action`
  - 6 × `:focus-visible`
  - kein `transition: all`

  Ein Review muss also gezielt suchen. Grundregeln aufzählen reicht nicht.

## Was eine Erweiterung dauerhaft kostet

Das entscheidet die Bewertung:

| Art | was bei *jedem* Schritt mitgelesen wird | was erst bei Gebrauch geladen wird |
|---|---|---|
| Skill (`.claude/skills/x/SKILL.md`) | nur Name + Beschreibung (~50–150 Tokens) | der ganze Text |
| Agent (`.claude/agents/x.md`) | Name + Beschreibung in der Agentenliste | Anweisungen, nur im eigenen Gespräch des Agenten |
| Plugin | Beschreibungen *aller* enthaltenen Skills, Agenten, Befehle, dazu ggf. Hooks und MCP-Werkzeuge | Rest |
| Prüfliste als Datei in `wissen/` | nichts | nur wenn eine Sitzung sie liest |

Ein einzelner Skill mit kurzer Beschreibung ist billig. Teuer wird es durch Pakete mit
vielen Teilen, durch MCP-Server mit vielen Werkzeugen und durch Hooks, die nach jeder
Bearbeitung laufen.

## Kandidaten

### 1. design-review-Agent von OneRedOak — **übernehmen (angepasst, als eigene Datei)**

- Quelle: github.com/OneRedOak/claude-code-workflows, Ordner `design-review/`
- MIT, ~3.900 Sterne, gepflegt (letzte Änderung 29.09.2026)
- Inhalt: ein Agent (~6 KB) mit festem Ablauf:
  - Bedienung durchspielen
  - responsiv (1440/768/**375 px**)
  - Optik
  - Barrierefreiheit (WCAG 2.1 AA)
  - Robustheit (Überlauf, leere Zustände, Fehler)
  - Code (Design-Tokens statt fester Werte)
  - Texte und Konsole

  Befunde werden gewichtet (Blocker / hoch / mittel / Kleinigkeit) und mit Beleg
  gemeldet. Dazu kommt eine Beispiel-Prüfliste „S-Tier SaaS Dashboard“.
- **Passt:** Der Ablauf ist unabhängig vom Framework. Er arbeitet mit dem Browser, nicht
  mit Code-Generierung. Die Prüfung „Design-Tokens statt fester Werte“ entspricht unserer
  Regel „nur `var(--…)`“. Das Muster „frischer Prüfer ohne Wissen über den Code“ nutzen
  wir beim 3D-Modell schon (Kritik-Agent).
- **Passt nicht ohne Anpassung:**
  - verlangt den Playwright-MCP (bei uns: eingebauter Browser)
  - englisch
  - die Beispiel-Prüfliste ist auf SaaS-Dashboards und Inter/8-px-Raster zugeschnitten
  - erlaubt sich `Edit`/`Write` (ein Prüfer soll nichts ändern)
  - lange Beschreibung (~150 Tokens)
- **Für uns:** Nicht installieren. Den Ablauf auf Deutsch in eine eigene, kurze
  Prüfanweisung übertragen (siehe Empfehlung): Browser-Werkzeuge statt Playwright, nur
  lesen, Formwert-Regeln eingebaut.

### 2. Web Interface Guidelines von Vercel — **übernehmen (als Prüfliste, nicht installiert)**

- Quelle: github.com/vercel-labs/web-interface-guidelines
- MIT, ~900 Sterne, gepflegt (August 2026)
- Wird auch als Skill/Befehl angeboten. Wir brauchen nur den Text (~19 KB).
- Inhalt: rund 100 knappe, prüfbare Regeln zu Bedienung, Animation, Aufteilung, Inhalt,
  Formularen und Leistung. Beispiele:
  - Trefferfläche mobil ≥ 44 px
  - `<input>` ≥ 16 px, sonst zoomt iOS beim Antippen
  - Zoom nie sperren
  - Zerstörendes nur mit Bestätigung oder Rückgängig
  - Leer-/Fehler-/Vielzustände gestalten
  - Status nie nur über Farbe
  - Layout hält kurze und sehr lange Inhalte aus
  - `…` statt `...`
  - Ungespeicherte Änderungen warnen
- **Passt:** großteils unabhängig vom Framework. Die React-/Next.js-Punkte (Hydration,
  nuqs, URL als Zustand, React Scan) sind leicht zu streichen. Viele Regeln treffen genau
  unsere Gefahrenstellen: lange deutsche Übungsnamen, Eingabefelder für Gewicht und
  Wiederholungen, Löschen von Sätzen, Wischgesten im 3D-Betrachter („Gesten haben
  Alternativen“).
- **Für uns:** Die passenden Regeln (geschätzt 50–60) beim Einrichten des Reviews auf
  Deutsch in die Prüfanweisung übernehmen, mit Quellenangabe. Den Rest weglassen.

### 3. frontend-design (Anthropic) — **nein für das Review, prüfen für neue Bildschirme**

- Quelle: github.com/anthropics/skills (`skills/frontend-design`), dasselbe als Plugin im
  claude-code-Repo. Apache 2.0, offiziell, gepflegt.
- Eine Datei, ~9 KB.
- Inhalt: Anleitung für *neue, eigenständige* Gestaltung:
  - eigene Schriften
  - mutige Paletten
  - „Hero“-Bereich
  - Liste typischer KI-Design-Merkmale, die man meiden soll
  - kurzer, guter Teil zu Oberflächentexten (aktiv, konkret, Fehler sagen, was zu tun ist)
- **Passt nicht als Prüfer:** Er ist auf Neugestaltung und „ästhetisches Risiko“ angelegt.
  Bei Formwert steht das Design. Ein Review soll Fehler finden, nicht die Optik neu
  erfinden. Er empfiehlt markante Schriften, die meist von außen geladen werden
  (Regel: offline, keine externen Abhängigkeiten).
- **Brauchbar:** der Abschnitt zu Oberflächentexten als Maßstab für Beschriftungen und
  Fehlermeldungen. Falls einmal ein ganz neuer Bildschirm entsteht (z. B. Technikhinweise
  „Darauf achten“, E8), kann man den Skill für diese eine Sitzung lesen lassen.

### 4. Impeccable (Paul Bakaus) — **nein (Installation), prüfen (einmal als Lesevorlage)**

- Quelle: github.com/pbakaus/impeccable
- Apache 2.0, ~73.000 Sterne, sehr aktiv (Version 4.4, Änderung 01.10.2026)
- Inhalt: ein Skill mit über 20 Unterbefehlen, darunter:
  - `critique` (UX-Review mit Heuristik-Punkten, kognitive Last, Persona-Tests)
  - `audit` (Barrierefreiheit, Leistung, Theming, responsiv)
  - `polish`, `clarify`, `adapt`
- **Haken:**
  - sehr groß (SKILL.md 12 KB, `critique.md` 43 KB, `new-work.md` 58 KB)
  - führt beim Start ein mitgeliefertes Programm aus (`scripts/impeccable context`)
  - legt `PRODUCT.md`/`DESIGN.md` im Projekt an
  - bietet einen Hook, der nach *jeder* UI-Bearbeitung einen Design-Detektor laufen lässt

  Das ist genau die Art Dauerlast, die E3 vermeiden will. Fremde Programme im Repo
  auszuführen ist außerdem ein Sicherheitsrisiko.
- **Brauchbar:** Die Heuristik-Bewertung aus `reference/critique.md` (Nielsen-Heuristiken
  mit Punkten, Abschnitt zur kognitiven Last, Persona-Durchlauf) ist der gründlichste
  Review-Maßstab, der gefunden wurde. Man kann ihn im UX-Review einmal *lesen* lassen
  (Rohtext von GitHub, nichts ausführen) und die Befunde danach ordnen.

### 5. Barrierefreiheits-Skills — **nein**

- **Community-Access/accessibility-agents** (MIT, ~400 Sterne): 11 Agenten plus
  MCP-Server mit 39 Werkzeugen (axe-core, Playwright). Für eine Web-App dieser Größe zu
  viel Dauerlast und eine Node-Kette.
- **humbleteam/accessibility-audit** (MIT, 2 Sterne, neu): sauber aufgebaut. 18
  WCAG-2.2-Kriterien, Befunde P0/P1/P2 mit Kriteriumsnummer. Zu jung und zu wenig
  verbreitet, um ihm zu vertrauen. Die Kriterienliste deckt sich weitgehend mit Phase 4
  von OneRedOak und den Vercel-Regeln.
- **Für uns:** WCAG-Prüfung über die eigene Prüfanweisung. Wichtig für Formwert sind
  2.5.8 (Zielgröße), 1.4.3/1.4.11 (Kontrast, *in beiden Modi*), 2.4.7/2.4.11 (Fokus
  sichtbar und nicht verdeckt, z. B. vom Banner) und 1.4.10 (Umfließen bei 320–375 px).

### Kurz angesehen und verworfen

- **ui-ux-pro-max** (MIT, ~130.000 Sterne): Python-Suchskript über eine CSV-Datenbank mit
  Stilen und Paletten für 22 Frameworks, Installation per npm-CLI. Erzeugt
  Framework-/Tailwind-Vorschläge. Passt nicht zu Vanilla-JS ohne Build.
- **VoltAgent awesome-claude-code-subagents / ui-designer** und ähnliche Sammlungen:
  allgemeine Rollenbeschreibungen ohne festen Prüfablauf. Kein Mehrwert gegenüber 1.
- **Figma-Connector** (im Konto vorhanden): nur sinnvoll, wenn Bildschirme erst in Figma
  entworfen werden. Das tun wir nicht.

## Empfehlung

**Höchstens zwei Werkzeuge, beide als eigene Textdatei, nichts installieren:**

1. **Eigene Prüfanweisung „UX-Prüfer“** nach dem Ablauf von OneRedOak (Kandidat 1),
   gefüllt mit den passenden Vercel-Regeln (Kandidat 2) und den Formwert-Regeln:
   - 375 px
   - hell *und* dunkel
   - nur `var(--…)`
   - längste Übungsnamen (37 Zeichen) in Training, Banner, Routinenliste, Kopfzeile
   - Deutsch
   - offline
   - nichts ändern, nur melden

   Ablage als `werkzeug/ux-pruefer.md`, **nicht** unter `.claude/agents/`. Dann kostet sie
   bei normalen Schritten null Tokens.
2. **Impeccable `critique.md` nur einmal lesen** (Kandidat 4) als Bewertungsmaßstab für
   das erste große UX-Review. Kein Skill, kein Skript, kein Hook.

## So wird das UX-Review gezielt eingesetzt

1. **Eigene, frische Sitzung** nur für das Review (eine Aufgabe pro Sitzung).
2. Beim ersten Mal `werkzeug/ux-pruefer.md` anlegen (Schritt 1 der Empfehlung,
   ca. 150–200 Zeilen).
3. Einen **Helfer-Agenten** (`general-purpose`, Modell Sonnet) starten mit dem Auftrag:
   „Lies `werkzeug/ux-pruefer.md` und prüfe Tab X.“
   - Ein Agent pro Tab (Heute, Training, Körper, Übungen/Routinen) hält jedes Gespräch
     kurz. Laut `kontingent-2026-10-01.md` sind Helfer-Agenten der billigste Weg.
   - Der Agent nutzt den eingebauten Browser: `read_page`/`get_page_text` vor Screenshots,
     Screenshots mit `scale` 0.5, `resize_window` mobil + hell/dunkel.
4. Die Agenten liefern nur Befundlisten (Blocker / hoch / mittel / Kleinigkeit, je mit
   Stelle `datei:zeile` oder Bildschirm). Die Hauptsitzung sortiert, entscheidet und trägt
   die Punkte in die To-Do-Liste ein. Behoben wird in **späteren** Sitzungen, ein Thema
   pro Sitzung.
5. Erst wenn sich die Prüfanweisung zwei-, dreimal bewährt hat: überlegen, ob sie ein
   Projekt-Agent unter `.claude/agents/` wird. Mit einer Beschreibung von einer Zeile
   kostet das ~50 Tokens je Schritt.

## Quellen

- https://github.com/OneRedOak/claude-code-workflows/tree/main/design-review
- https://github.com/vercel-labs/web-interface-guidelines
- https://github.com/anthropics/skills/tree/main/skills/frontend-design
- https://github.com/pbakaus/impeccable
- https://github.com/Community-Access/accessibility-agents
- https://github.com/humbleteam/accessibility-audit
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
