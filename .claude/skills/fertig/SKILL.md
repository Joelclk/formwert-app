---
name: fertig
description: Schließt eine Formwert-Arbeitssitzung sauber ab – Stand auf die To-Do-Liste, Commit, kurze Übergabe, neue Sitzung vorschlagen. Aufruf „/fertig“. Auch nutzen, wenn Joel „wir hören auf“, „mach Schluss“, „Übergabe“ sagt oder der Hook 250.000 Tokens meldet und Joel zustimmt.
---

# Sitzung abschließen

Ziel: Die nächste Sitzung kann ohne diesen Chat weitermachen. Alles, was zählt, steht danach
auf der To-Do-Liste oder im Repo, nicht nur hier.

## 1. Arbeit sichern

- Laufen noch Hintergrundjobs (Blender, Export)? Dann Joel sagen, was läuft und wo das Ergebnis
  landet; der Stand in Schritt 2 nennt das.
- Geänderte Dateien mit `git status --short` ansehen. **Nur die eigenen** mit Pfad hinzufügen
  (`git add <pfad> …`, nie `git add -A`). Fremde Änderungen anderer Sitzungen nicht mitnehmen.
- Commit auf Deutsch, eine Zeile Was + Warum, Varianten-Entscheidungen nennen.
- Push:
  - Wissen, Doku, Werkzeuge, Tests: pushen (vorher `git pull --rebase`, kein Live-Effekt).
  - App-Code unter `app/`: nur zusammen mit einer Veröffentlichung, die Joel für diese Aufgabe
    freigegeben hat (Ablauf `AGENTS.md` Abschnitt 4). Sonst nur committen und in der
    Schlussmeldung sagen, dass Veröffentlichen noch aussteht.

## 2. To-Do-Liste nachziehen

Lesen mit `Artifact` `action: "read"`, `url: https://claude.ai/artifact/VKH7jhzqZusa8JakMewBAs`.
Die gespeicherte Datei vollständig mit `Read` lesen (Pflicht vor dem Veröffentlichen), dann im
JSON-Block `itemsData` per kleinem Python-Skript ändern:

- **Fertig:** `done: true`, in `details` eine Zeile „Erledigt (TT.MM., Version N): …“.
- **Nicht fertig:** in `details` eine Zeile anhängen:
  „Stand TT.MM.: <was geschafft, mit Zahlen> · Nächster Schritt: <konkret> · Dateien: <Pfade>“.
  Ältere „Stand“-Zeilen desselben Punkts dabei löschen, nur der neueste bleibt.
- **Neue Ideen oder Befunde** aus der Sitzung als eigene Punkte unter `phase: "inbox"`.
- Neuer Punkt, der in dieser Sitzung bearbeitet wurde: mit passender Phase anlegen.

Dann `Artifact` publish mit `url` und `file_path` der geänderten Datei. Wird die Veröffentlichung
wegen eines neueren Stands abgelehnt (Joel hat in der Liste etwas abgehakt): auf den neuen Stand
dieselbe Änderung anwenden und erneut veröffentlichen, nie überschreiben.

## 3. Memory nur für Arbeitslehren

Ins Memory kommt nur, was die Arbeitsweise betrifft: ein Werkzeug-Trick, eine Falle, eine
Vorliebe von Joel. **Kein Projektstand**, keine Versionsnummern als „aktueller Stand“; das steht
auf der Liste. Bestehende Notiz ergänzen statt neue anlegen.

## 4. Schlussmeldung

Höchstens sechs Zeilen:

> **Erledigt:** … (mit Zahlen)
> **Auf der Liste:** Punkt „…“ abgehakt / Stand eingetragen
> **Noch offen:** Veröffentlichen steht aus / Blender-Export läuft bis ca. …
> **Weiter mit:** neue Sitzung, `/start <Bereich>`; dort wird beim Punkt „…“ weitergemacht.
> Du kannst diese Sitzung jetzt archivieren.

Nicht selbst archivieren, außer Joel sagt es ausdrücklich.
