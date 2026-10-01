# Wissenssammlung aus Videos

Joel schickt Videos (Instagram, YouTube). Claude wertet sie aus und hält hier fest,
was davon für uns brauchbar ist. Ziel: Wissen nachträglich anwenden können, ohne die
Videos noch einmal ansehen zu müssen.

## Dateien

- `videos.md` – jedes Video in einer Zeile: Quelle, Thema, Kern, Bewertung, Stand.
- `erkenntnisse.md` – das Gelernte nach Themen gebündelt, mit konkreten Schritten für uns.
- `kontingent-2026-10-01.md` – Auswertung, wohin das Claude-Kontingent geht.

## Ablauf für neue Videos

1. Beschreibungstext lesen (im Browser per JavaScript, nicht per Screenshot – spart Kontingent).
2. Nur wenn die Beschreibung dünn ist: Einzelbilder ansehen. Ton kann Claude im Browser
   nicht hören. Für gesprochene Inhalte braucht es eine lokale Abschrift (offener Punkt).
3. Zeile in `videos.md` ergänzen, Erkenntnis unter dem passenden Thema in `erkenntnisse.md`
   eintragen oder bestehenden Punkt ergänzen – keine Dopplungen.
4. Behauptungen aus Videos prüfen, bevor sie als Wissen gelten (Zahlen, Gesetze, Tools).

## Bewertung

- **übernehmen** – passt zu uns, umsetzen.
- **prüfen** – könnte passen, vorher testen.
- **haben wir** – gibt es bei uns schon.
- **nein** – passt nicht oder schadet (Grund steht dabei).
