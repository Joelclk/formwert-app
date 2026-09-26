# Formwert

Trainings-App als eine einzige HTML-Datei. Kein Build, kein Server: Datei
oeffnen genuegt. Veroeffentlicht wird sie als Claude-Artifact.

## Dateien

| Datei | Inhalt |
|---|---|
| `formwert_app.html` | Die App. Immer der zuletzt veroeffentlichte Stand. |
| `VERSION` | Versionsnummer und Datum dieses Stands. |
| `muskelmodell_3d_vollstaendig.html` | Das 3D-Muskelmodell als eigene Datei, ausgepackt aus der App. Hier wird am Modell gearbeitet. |
| `muskelmodell_3d_vollstaendig.stand.json` | Fingerabdruck des Modells beim letzten Auspacken. Nicht von Hand aendern. |
| `formwert-3d-menschmodell-konzept.md` | Konzept zum 3D-Menschmodell. |
| `quelltext/` | Lesefassung der App, in Dateien unter 110 KB geschnitten. Nicht ausfuehrbar. |
| `patches/` | Aenderungsvorschlaege als ALT/NEU-Bloecke. |
| `werkzeug/` | Kleine Skripte: zerlegen, Aenderung anwenden, 3D-Modell aus- und einpacken. |
| `AGENTS.md` | Arbeitsanweisung fuer Chat-Assistenten. Erst lesen, dann vorschlagen. |

## Zur Groesse

`formwert_app.html` ist rund 12,9 MB gross. Davon sind etwa 11,2 MB
eingebettete Daten (base64): das 3D-Anatomiemodell, Schriften und Bilder.
Der eigentliche Quelltext sind rund 1,6 MB. Jede neue Version legt eine
vollstaendige Kopie im Git-Verlauf ab - das Repo waechst also pro
Veroeffentlichung um etwa diese Groesse.

## Arbeitsweise

Geaendert wird nie von Hand in der grossen Datei, sondern ueber kleine
Patch-Skripte, die genau definierte Textstellen ersetzen und abbrechen,
wenn eine Stelle nicht genau einmal vorkommt. Danach: Syntaxpruefung,
automatischer Durchlauf durch alle vier Tabs, dann Veroeffentlichung.

## Fuer Chat-Assistenten

`formwert_app.html` ist zu gross, um sie am Stueck zu laden. Einstieg ist
immer `quelltext/INDEX.md` - dort steht, welche Funktion in welcher Datei
liegt. Wie eine Aenderung vorgeschlagen wird, steht in `AGENTS.md`.

## Die Skripte

    python3 werkzeug/zerlegen.py                    # quelltext/ neu erzeugen
    python3 werkzeug/patch_anwenden.py patches/X.md # Aenderung anwenden

`zerlegen.py` prueft dabei selbst nach, dass der Inhalt aller erzeugten
Dateien - ohne Leerraum - genau dem Original entspricht. Geht beim Schneiden
etwas verloren, bricht es ab.

## Am 3D-Modell arbeiten

Das Modell steckt als ein base64-Block (`FW3D_HTML_B64`) in der App und laesst
sich deshalb nicht ueber `patches/` aendern. Stattdessen:

    git pull                                         # neuesten Stand holen
    python3 werkzeug/modell_auspacken.py             # -> muskelmodell_3d_vollstaendig.html
    # ... Datei bearbeiten, im Browser pruefen ...
    git pull                                         # nochmal, kurz vor dem Einpacken
    python3 werkzeug/modell_einpacken.py --probe
    python3 werkzeug/modell_einpacken.py             # -> zurueck in formwert_app.html
    python3 werkzeug/zerlegen.py

`modell_einpacken.py` bricht ab, wenn das Modell in der App seit dem Auspacken
von jemand anderem geaendert wurde - base64 laesst sich nicht zusammenfuehren,
Einpacken wuerde dessen Arbeit ueberschreiben. Aenderungen am uebrigen
App-Code stoeren nicht. Ausserdem prueft es, dass die Datei vollstaendig ist,
und (falls `node` installiert ist) die Syntax aller Skripte darin.

Am Modell arbeitet immer nur eine Person oder Sitzung gleichzeitig.
