# Wohin das Claude-Kontingent geht

Auswertung vom 01.10.2026 über alle Claude-Code-Protokolle des Formwert-Projekts.
Zeitraum 22.09.–01.10.2026: 9 Sitzungen und 22 Helfer-Agenten.
Skript: `werkzeug/kontingent_auswerten.py`.

Gewichtet wie die Kosten:
- normale Eingabe: 1×
- aus dem Zwischenspeicher gelesen: 0,1×
- neu in den Zwischenspeicher geschrieben: 2×
- Ausgabe: 5×

Die Verteilung auf Gruppen ist eine Schätzung (nach Textmenge im Gespräch).

## Nach Art der Arbeit

```
Grundanweisungen + Zusammenfassungen  ████████████████████████████████████▉ 37 %
Gespräch (Antworten, Denken, Joel)    ███████████████████                   19 %
Blender-Befehle und deren Ausgaben    █████████████▋                        14 %
Bilder und Screenshots                ███████████▊                          12 %
Sonstige Befehle (Git, Python …)      ████████                               8 %
Helfer-Agenten (Kritik-Prüfer)        ████                                   4 %
Dateien lesen und schreiben           ███▌                                   4 %
Browser, Artifact, Web, Rest          ███                                    3 %
```

## Der eigentliche Treiber: lange Sitzungen

| Gesprächslänge beim Schritt | Schritte | Anteil am Kontingent | Kosten je Schritt |
|---|---|---|---|
| unter 150.000 Tokens | 1.132 | 7 % | ~22.000 |
| 150.000–300.000 | 1.165 | 11 % | ~36.000 |
| 300.000–500.000 | 1.587 | 25 % | ~61.000 |
| über 500.000 | 2.479 | **57 %** | ~87.000 |

Jeder Schritt liest das ganze bisherige Gespräch neu. In einer frischen Sitzung kostet ein
Schritt etwa ein Viertel dessen, was er in einer sehr langen Sitzung kostet.

Die größten Sitzungen:
- die Rig-/Anatomie-Sitzung (1.813 Schritte)
- die Muskel-Verformung (849 Schritte)
- „Körper und Bewegungen“ (1.011 Schritte)
- Arm-Rig (1.060 Schritte)

Alle liefen im Schnitt mit 430.000–490.000 Tokens Gesprächslänge.

## Nach Modell

Opus 5.5 71 %, Fable 5.1 13 %, Sonnet 5 10 %, Opus 5 7 %.

## Folgerungen

1. **Eine Aufgabe = eine Sitzung.** Ist ein Abschnitt fertig (z. B. ein Muskel, ein Clip),
   den Stand in Memory/Plan festhalten und eine neue Sitzung beginnen. Größter Hebel:
   geschätzt 40–60 % weniger Verbrauch.
2. **Blender-Ausgaben kürzen.** Skripte sollen nur Kennzahlen ausgeben, keine langen
   Listen. Bei Bedarf in eine Datei schreiben und gezielt nachlesen.
3. **Weniger Screenshots.** Wo möglich Text lesen (`get_page_text`, Kennzahlen) statt Bilder.
   Bilder in kleiner Größe anfordern.
4. **Grundanweisungen schlank halten.** Keine großen Plugin-Pakete installieren,
   ungenutzte Connectoren abschalten.
5. **Helfer-Agenten sind günstig** (4 % für 22 Kritik-Runden). Sie arbeiten in eigenem,
   kurzem Gespräch. Mechanische Aufgaben dorthin auslagern entlastet die Hauptsitzung.
