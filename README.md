# Formwert

Trainings-App als eine einzige HTML-Datei. Kein Build, kein Server: Datei
oeffnen genuegt. Veroeffentlicht wird sie als Claude-Artifact.

## Dateien

| Datei | Inhalt |
|---|---|
| `formwert_app.html` | Die App. Immer der zuletzt veroeffentlichte Stand. |
| `VERSION` | Versionsnummer und Datum dieses Stands. |
| `muskelmodell_3d_vollstaendig.html` | Eigenstaendiger Betrachter fuer das 3D-Muskelmodell (Entwicklung). |
| `formwert-3d-menschmodell-konzept.md` | Konzept zum 3D-Menschmodell. |

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
