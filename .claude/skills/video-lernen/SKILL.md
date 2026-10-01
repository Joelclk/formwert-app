---
name: video-lernen
description: Joel schickt einen YouTube-Link oder nennt ein Thema, aus dem gelernt werden soll. Transkript holen, Inhalt auswerten, Wissen dauerhaft speichern und sofort anwenden. Auslöser: YouTube-Link, „guck dir das Video an“, „lern das“, „eigne dir Wissen an zu …“.
---

# Aus Videos lernen

Ziel: Was Joel schickt, soll künftige Sitzungen besser machen. Wissen, das nicht in
einer Datei landet, ist nach der Sitzung weg.

## Ablauf

1. **Transkript holen** (eine Quelle pro Aufruf, 4 s Pause zwischen mehreren):
   ```bash
   python3 "<repo>/.claude/skills/video-lernen/transkript.py" <url-oder-id> <scratchpad>/videos
   ```
   Bei einem Thema statt eines Links: Suche mit
   `~/.local/bin/uvx yt-dlp --flat-playlist --print "%(id)s | %(channel)s | %(duration_string)s | %(view_count)s | %(title)s" "ytsearch8:<suchbegriff>"`.
   Fachkanäle vor Massenkanälen, mindestens eine deutsche Quelle. **Höchstens 10 Videos pro Lauf.**
2. **Ganz lesen**, nicht nur den Anfang. Werbeblöcke überspringen.
3. **Einordnen und speichern:**
   - **Fachwissen** (Übungstechnik, Anatomie, Blender …) → `wissen/<thema>.md` im Repo:
     Quellentabelle mit Kürzeln, Konsens, Widersprüche mit beiden Seiten,
     Fehler/Korrektur, Abschnitt „Was das für Formwert heißt“ mit Datei:Zeile.
     Vorhandene Datei ergänzen statt neu anlegen.
   - **Arbeitsweise** (wie wir zusammenarbeiten, wie ich arbeiten soll) → Gedächtnis
     (`feedback`-Eintrag mit **Why/How to apply**) und in `MEMORY.md` verlinken.
     Erst prüfen, ob ein vorhandener Eintrag das schon abdeckt.
4. **Anwenden:** Benennen, was sich ab jetzt konkret ändert. Was sofort umsetzbar ist
   (Skill, Werkzeug, Prüfschritt), gleich umsetzen; Veröffentlichen der App nur nach Rückfrage.
5. **Bericht mit Zahlen:** „x von y Transkripten geholt, z ohne Untertitel“, welche
   Dateien geschrieben wurden, was nur aus dem Ton stammt.

## Stolperfallen

- **429 von YouTube** → `transkript.py` endet mit Code 2. Sofort aufhören, nicht
  wiederholen; melden, welche Videos fehlen.
- Deutsche Auto-Übersetzung wird oft gesperrt → Originalsprache nehmen (Standard „auto“).
- **Bilder fehlen.** Das Transkript enthält nur, was gesagt wird. Videodownload für
  Einzelbilder hat YouTube am 01.10.2026 verweigert (auch mit deno). Ungetesteter Ausweg: Video im
  eingebauten Browser mit `&t=<sekunden>` öffnen und Bildschirmfoto machen. Bei
  Bewegungs-/Verformungsfragen (Muscle&Motion) klar sagen, dass Bilder fehlen.
- Inhalte zusammenfassen, keine langen wörtlichen Zitate speichern.
- Werbung („Sponsor“, Gewinnspiele) und Eigenwerbung nicht als Wissen übernehmen.
