---
name: start
description: Startet eine Formwert-Arbeitssitzung für genau einen Punkt der To-Do-Liste. Aufruf „/start App“, „/start 3D“, „/start Wissen“, „/start Marketing“, optional mit dem Punkt („/start App Technikhinweise“). Auch nutzen, wenn Joel eine neue Sitzung ohne /start beginnt und sagt, woran er arbeiten will.
---

# Sitzung starten

Ziel: Joel muss nichts sortieren. Am Ende dieses Ablaufs ist klar, **welcher Punkt** bearbeitet
wird, **wann er fertig ist** und dass **keine andere Sitzung** im selben Bereich dazwischenfunkt.
Regeln dahinter: `AGENTS.md`, Abschnitte 1–3.

## 1. Bereich bestimmen

Aus dem Argument oder Joels Satz. Kürzel für Titel und Gruppe:

| Kürzel | Gruppe in der Seitenleiste | To-Do-Phasen |
|---|---|---|
| App | 📱 App | p1, p2, pm, p4, p5 und App-Punkte aus „Noch einsortieren“ |
| 3D | 🦴 3D & Animation | p3 und 3D-/Clip-Punkte aus „Noch einsortieren“ |
| Wissen | 📚 Wissen & Arbeitsweise | Video-, Werkzeug- und Arbeitsweise-Punkte |
| Marketing | 📣 Marketing | Werbeclip, Store-Eintrag, Social Media |

Unklar → eine kurze Frage, sonst nicht fragen.

## 2. Andere Sitzungen prüfen

`list_sessions` (ccd_session_mgmt) mit `group` = Gruppenname. Läuft dort eine andere Sitzung
(`isRunning: true`):
- **3D:** nicht anfangen. Joel sagen, welche Sitzung läuft, und fragen, ob diese erst fertig
  werden soll.
- **Sonst:** Joel kurz nennen, welche läuft. Weiterarbeiten nur an anderen Dateien.

Sitzungen ohne Gruppe, die zum Bereich passen, bei der Gelegenheit einsortieren
(`move_sessions`).

## 3. Repo auf Stand bringen

```bash
git status --short && git fetch -q origin && git log --oneline HEAD..origin/main | wc -l
```

Liegen neue Commits vor und gibt es keine lokalen Änderungen an denselben Dateien:
`git pull --ff-only`. Fremde, nicht committete Änderungen nie anfassen, nur erwähnen.

## 4. Punkt wählen

To-Do-Liste lesen: `Artifact` `action: "read"`,
`url: https://claude.ai/artifact/VKH7jhzqZusa8JakMewBAs`. Die Punkte stehen als JSON im Block
`itemsData` (`phase`, `text`, `done`, `details`, `doneWhen`).

- Hat Joel einen Punkt genannt: diesen nehmen.
- Sonst: den ersten offenen Punkt der frühesten noch offenen Phase, der zum Bereich passt.
  Passen zwei, drei Punkte gleich gut: mit `AskUserQuestion` wählen lassen (höchstens 3).
- Steht der Wunsch noch nicht auf der Liste: trotzdem anfangen, bei `/fertig` wird er eingetragen.

## 5. Sitzung einordnen

- `set_session_title` mit `session_id: "self"`, Titel `<Kürzel>: <Punkt kurz>`, z. B.
  „App: Technikhinweise pro Übung“.
- `list_groups`, dann `move_sessions` mit `["self"]` in die Gruppe des Bereichs.

## 6. Vorbereiten

- `wissen/README.md` ansehen und die Datei zum Thema lesen, falls es eine gibt.
- **Fertig, wenn:** Die `doneWhen`-Sätze des Punkts sind die Abnahmekriterien. Fehlen sie (neue
  Funktion), 2–4 prüfbare Kriterien formulieren. Gibt es offene Entscheidungen mit mehreren
  sinnvollen Varianten, diese **vor** dem Bauen mit `AskUserQuestion` klären, nicht still
  entscheiden.
- Der letzte „Stand …“-Eintrag in `details` sagt, wo die vorige Sitzung aufgehört hat.

## 7. Startmeldung

Höchstens fünf Zeilen, dann sofort mit der Arbeit beginnen:

> **Punkt:** Technikhinweise pro Übung (App)
> **Fertig, wenn:** 20 häufigste Übungen zeigen Hinweise · kurz genug für die Satzpause
> **Stand:** Inhalt für die Kniebeuge liegt in `wissen/kniebeuge.md`
> **Erster Schritt:** Hinweis-Block auf der Übungsseite für die Kniebeuge
> Andere Sitzungen im Bereich: keine
