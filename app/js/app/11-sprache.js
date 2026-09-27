/* ==========================================================
   app/11-sprache.js - Deutsch/Englisch: Woerterbuch, Muster, Uebersetzungsschicht
   Teil der App-Logik; alle Dateien in js/app/ teilen sich einen Namensraum
   und werden in Nummernreihenfolge geladen (siehe index.html).
   ========================================================== */
"use strict";

/* ================= Sprache =================
   Umschaltbar zwischen Deutsch und Englisch. Die Namen (Regionen, Muskelgruppen, Uebungen)
   werden beim Wechsel IM DATENSATZ ausgetauscht statt an hunderten Stellen abgefragt - das
   Original bleibt unter einem Unterstrich-Feld liegen und wird beim Zurueckschalten
   wiederhergestellt. Die englischen Namen der Feinmuskeln stehen schon im 3D-Modell: dessen
   Schluessel SIND die englischen Bezeichnungen, nur mit Unterstrichen. */
var UI_EN={"Heute": "Today", "Entdecken": "Explore", "Training": "Training", "Körper": "Body", "Werte": "Stats", "Alle": "All", "Alle Übungen": "All exercises", "Alter": "Age", "Anmeldung & Sync": "Sign-in & sync", "Arme": "Arms", "Beine": "Legs", "Assessment neu machen": "Redo assessment", "Ausdauer": "Endurance", "Ausdauerminuten pro Woche": "Cardio minutes per week", "Backup einspielen": "Restore backup", "Backup speichern": "Save backup", "Beenden": "Finish", "Belastungsäquivalent": "Load equivalent", "Cooper-Test": "Cooper test", "Datei/Text": "File/text", "Deutsch": "German", "Englisch": "English", "Eigene Einheit zusammenstellen": "Build your own session", "Einstellungen": "Settings", "Eintragen": "Log", "Erholung": "Recovery", "Geschlecht": "Sex", "Grenze": "Limit", "Konstanz": "Consistency", "Konto & Daten": "Account & data", "Korridor für dich": "Your range", "Korridor · Sätze pro Woche": "Range · sets per week", "Kraftstufen": "Strength levels", "Körperdaten": "Body data", "Körpergewicht": "Body weight", "Körperillustration:": "Body illustration:", "Letzte Tage": "Recent days", "Maximalkraft": "Max strength", "Meine Einheiten": "My sessions", "Minimum": "Minimum", "Optimum": "Optimum", "Minuten pro Woche": "Minutes per week", "Mobilität": "Mobility", "Mobilität pro Woche": "Mobility sessions per week", "Muskelabdeckung": "Muscle coverage", "Muskelgruppen": "Muscle groups", "Nach Körperregion": "By body region", "Nach Übungen suchen…": "Search exercises…", "Neue Einheit": "New session", "Neues Training starten": "Start new workout", "Notiz": "Note", "Rechenweg": "How it is calculated", "Ruhepuls": "Resting heart rate", "Sprache": "Language", "Standard": "Standard", "Teilwerte": "Sub-scores", "Verlauf": "History", "Was noch mehr bringt": "What more would add", "Weiter": "Continue", "Wochenziele": "Weekly goals", "Woche vor": "Next week", "Woche zurück": "Previous week", "Zurück": "Back", "Ziele, Körperdaten, Sprache, Konto": "Goals, body data, language, account", "Trainingstage pro Woche": "Training days per week", "Tipp eine Muskelgruppe an.": "Tap a muscle group.", "Tipp einen Muskel an – oder wähl oben eine Region.": "Tap a muscle — or pick a region above.", "Tipp einen Muskel an – oder oben eine Region wie „Brust“, dann werden alle zugehörigen Muskeln markiert.": "Tap a muscle — or a region above such as “Chest” to highlight every muscle in it.", "Ziehen = drehen · Tippen = Muskel auswählen": "Drag = rotate · Tap = select muscle", "Die Richtwerte sind Gruppenmittelwerte mit großer Streuung. Wenn du für diesen Muskel erkennbar mehr oder weniger brauchst, verschieb den Korridor hier.": "These guide values are group averages with wide spread. If this muscle clearly needs more or less for you, shift the range here.", "Die Namen von Regionen, Muskeln und Übungen wechseln mit. Erklärtexte sind noch nicht vollständig übersetzt.": "Region, muscle and exercise names switch along. Explanatory texts are not fully translated yet.", "3D-Modell wird geladen…": "Loading 3D model…", "3D-Modell konnte nicht geladen werden.": "3D model could not be loaded.", "deutlich mehr": "much more", "deutlich weniger": "much less", "mehr": "more", "weniger": "less", "im Korridor": "in range", "zu wenig": "too little", "über Limit": "over limit", "männlich": "male", "weiblich": "female", "nicht gemacht": "not done", "nichts": "none", "noch nichts notiert": "nothing noted yet", "noch offen": "still open", "offen": "open", "nur dieses Gerät": "this device only", "verfallen": "expired", "unter F": "below F", "+ Erstellen": "+ Create", ", MIT-Lizenz.": ", MIT licence.", "Mo": "Mon", "Di": "Tue", "Mi": "Wed", "Do": "Thu", "Fr": "Fri", "Sa": "Sat", "So": "Sun", "Knorrenmuskel": "Anconeus", "Beanspruchte Muskeln": "Muscles worked", "Bewegungsablauf in 3D": "Movement in 3D", "3D-Modell wird geladen …": "Loading 3D model …", "Rechte Körperhälfte: Arm, Schulter, Brust und Rücken – Muskeln in den Farben von „Beanspruchte Muskeln“.": "Right side of the body: arm, shoulder, chest and back – muscles coloured as in “Muscles worked”.", "Die 3D-Animation braucht einen neueren Browser.": "The 3D animation needs a newer browser.", "3D-Animation konnte nicht geladen werden.": "The 3D animation could not be loaded.", "Reihenfolge geändert": "Order changed", "Karte gedrückt halten und zur Seite schieben, um die Reihenfolge zu ändern.": "Press and hold a card, then slide it sideways to change the order.", "Stärkt zusätzlich": "Also strengthens", "Wird gedehnt": "Stretched", "Wird bewegt": "Mobilised", "Statisch": "Static", "Dynamisch": "Dynamic", "Alles": "All", "Mobilität · Statisch": "Mobility · Static", "Mobilität · Dynamisch": "Mobility · Dynamic",
"Neue Übung":"New exercise","Vorschau":"Preview","keine gewählt":"none selected",
"Primärmuskeln":"Primary muscles","Sekundärmuskeln (halber Satz)":"Secondary muscles (half a set)","Übung anlegen":"Create exercise","Übung wählen":"Choose exercise",
"Übung angelegt":"Exercise created","Bitte einen Namen eingeben.":"Please enter a name.",
"Bitte mindestens einen Primärmuskel wählen.":"Please pick at least one primary muscle.",
"Sonstiges":"Other", "Vorne": "Front", "Hinten": "Back", "Satz speichern": "Save set", "Übung hinzufügen": "Add exercise", "Speichern": "Save", "Abbrechen": "Cancel", "Löschen": "Delete", "fertig": "done", "Sätze": "Sets", "Wdh": "reps", "Reserve": "Reserve", "Pause": "Rest", "verbinde": "connecting", "synchronisiert": "synced"};
var UI_RX=[
  [/Für einen nachweisbaren Unterschied bräuchtest du ab hier rund ([\d,.]+) Sätze\/Woche mehr\. Doppelte Satzzahl heißt \+(\d+) % Reiz, nicht \+100 %\./g,"To reach a detectable difference you would need about $1 more sets per week from here. Twice the sets means +$2 % stimulus, not +100 %."],
  [/Reiz (\d+) % vom Optimum · nächster Satz bringt noch (\d+) % von dem, was dein erster bringt/g,"Stimulus $1 % of optimum · the next set still adds $2 % of what your first one adds"],
  [/Richtwert (\d+) Std\., für ([\d,.]+) Sätze in der Einheit auf (\d+) Std\. angepasst/g,"Guide value $1 h, adjusted to $3 h for $2 sets in that session"],
  [/Dein Schnitt der letzten 8 Wochen: ([\d,.]+) Sätze\/Woche/g,"Your 8-week average: $1 sets/week"],
  [/seit mindestens drei Wochen nicht belastet/g,"not worked for at least three weeks"],
  [/vollständig erholt · zuletzt (.+?) belastet/g,"fully recovered · last worked $1"],
  [/noch (\d+) Std\. · zuletzt (.+?) belastet/g,"$1 h to go · last worked $2"],
  [/(\d+) % Reiz · ([\d,.]+) Sätze/g,"$1 % stimulus · $2 sets"],
  [/(\d+) von (\d+) Gruppen im Korridor/g,"$1 of $2 groups in range"],
  [/(\d+) von (\d+) im Korridor/g,"$1 of $2 in range"],
  [/alle zu wenig/g,"all too little"],
  [/(\d+) zu viel/g,"$1 over"],
  [/(\d+) von (\d+) Trainingstagen/g,"$1 of $2 training days"],
  [/(\d+) Muskelgruppen unter Minimum/g,"$1 muscle groups below minimum"],
  [/(\d+) von (\d+) Muskelgruppen über dem Minimum/g,"$1 of $2 muscle groups above minimum"],
  [/(\d+) von (\d+) Bereichen gemessen/g,"$1 of $2 areas measured"],
  [/(\d+) Übungen gewertet/g,"$1 exercises counted"],
  [/(\d+) Trainingstage in (\d+) Tagen/g,"$1 training days in $2 days"],
  [/(\d+) Einheiten in (\d+) Tagen/g,"$1 sessions in $2 days"],
  [/(\d+) Minuten in (\d+) Tagen/g,"$1 minutes in $2 days"],
  [/(\d+) Übungen gemacht/g,"$1 exercises done"],
  [/(\d+) Übung gemacht/g,"$1 exercise done"],
  [/Bestwert /g,"Best "],
  [/Rückansicht, beanspruchte Muskeln, /g,"Back view, muscles worked, "],
  [/Vorderansicht, beanspruchte Muskeln, /g,"Front view, muscles worked, "],
  [/Beispiele: /g,"Examples: "],
  [/antippen für Details/g,"tap for details"],
  [/Antippen für Details/g,"Tap for details"],
  [/Einzelmuskeln antippen für Details/g,"Tap individual muscles for details"],
  [/(\d+),(\d+) Sätze\/Woche/g,"$1.$2 sets/week"],
  [/([\d,.]+) Sätze\/Woche/g,"$1 sets/week"],
  [/(\d+),(\d+) Sätze(?!n)/g,"$1.$2 sets"],
  [/([\d,.]+) Sätze(?!n)/g,"$1 sets"],
  [/(^|[^\w])1 Satz([^\w]|$)/g,"$11 set$2"],
  [/Ziel ([\d,.]+)/g,"target $1"],
  [/(\d+) Gruppen/g,"$1 groups"],
  [/(\d+) Gruppe([^n]|$)/g,"$1 group$2"],
  [/\bTagen\b/g,"days"],
  [/\bTage\b/g,"days"],
  [/^Mo, /g,"Mon, "],
  [/^Di, /g,"Tue, "],
  [/^Mi, /g,"Wed, "],
  [/^Do, /g,"Thu, "],
  [/^Fr, /g,"Fri, "],
  [/^Sa, /g,"Sat, "],
  [/^So, /g,"Sun, "],
  [/(\d+) Jahre/g,"$1 years"],
  [/(\d+) Std\./g,"$1 h"],
  [/vor (\d+) Tagen/g,"$1 days ago"],
  [/vor (\d+) Std\./g,"$1 h ago"],
  [/vor 1 Tag/g,"1 day ago"],
  [/gerade eben/g,"just now"],
  [/Korridor von dir angepasst/g,"range adjusted by you"],
  [/Richtwert (\d+) Std\./g,"Guide value $1 h"],
  [/seit /g,"since "],
  [/Minimum (\d+) · Optimum (\d+) · Grenze (\d+)/g,"Minimum $1 · Optimum $2 · Limit $3"],
  [/Erholungszeit/g,"Recovery time"]
];

/* Uebersetzungsschicht. Die Oberflaechentexte stehen an mehreren hundert Stellen im Code
   verteilt; sie dort alle einzeln abzufragen waere ein Umbau mit viel Bruchgefahr. Stattdessen
   werden fertige Texte nach dem Rendern ersetzt: exakte Treffer aus dem Woerterbuch, und fuer
   zusammengesetzte Saetze ("3,7 Saetze · Ziel 7") eine Handvoll Muster. Ein Beobachter faengt
   alles ein, was die App spaeter nachbaut - Blaetter, Dialoge, Listen.
   Eigene Eingaben des Nutzers bleiben unberuehrt: sie stehen nicht im Woerterbuch. */
var _uiBusy=false;

/* Nachtrag zur englischen Oberfläche. Ein Rundgang durch alle Tabs und Dialoge in englischer
   Sprache hat diese Texte noch deutsch gezeigt. Eigener Block statt Einträgen mitten im
   Wörterbuch oben, damit er als Ganzes nachvollziehbar bleibt. Muster, die auf den deutschen
   Rohtext passen müssen, kommen VOR die vorhandenen – deren allgemeine Regeln machen z. B.
   "Tage" sonst schon vorher zu "days" oder "3 Sätzen" zu "3 setsn". Allgemeine Muster kommen
   hinten dran, damit die spezielleren zuerst greifen. Vorhandene Einträge bleiben
   unangetastet, und keine englische Übersetzung ist doppelt vergeben – sonst fiele der Rückweg
   ins Deutsche (UI_DE) für feste Beschriftungen weg. */
(function(){
  var add={"+ Satz": "+ Set", "+ Übung hinzufügen": "+ Add exercise", "/ 100 zum Start": "/ 100 to start", "0 = bis zum Muskelversagen. Ohne Angabe zählt der Satz voll; ab 3 in Reserve zählt er anteilig weniger.": "0 = to failure. Without a value the set counts in full; from 3 in reserve it counts proportionally less.", "1. Formwert im Handy-Browser öffnen (gleiches Konto).\n2. Teilen-Symbol → „Zum Home-Bildschirm“.\n3. Einmal anmelden – danach bleibst du in dieser Kachel angemeldet und startest ohne Umweg.": "1. Open Formwert in your phone's browser (same account).\n2. Share icon → “Add to Home Screen”.\n3. Sign in once – after that you stay signed in on this tile and start right away.", "100 % = die beste verfügbare Übung für diesen Muskel. Ein Satz zählt anteilig auf dein Wochenvolumen: 60 % sind 0,6 Sätze. Planungswerte auf Basis der EMG-Literatur – keine Messwerte.": "100 % = the best available exercise for this muscle. A set counts proportionally toward your weekly volume: 60 % is 0.6 sets. Planning values based on EMG literature – not measurements.", "100 % = die stärkste Übung dafür im ganzen Katalog. Wird nichts geändert, zählt Primär 100 %, Sekundär 50 %.": "100 % = the strongest exercise for it in the whole catalog. If nothing is changed, primary counts 100 %, secondary 50 %.", "Achillessehne": "Achilles tendon", "Adduktorensehnen": "Adductor tendons", "Aktivität": "Activity", "Alle Einträge dieses Tages löschen": "Delete all entries for this day", "Alles misst die letzten 30 Tage, die Muskelkarte die letzten 7. Eine gute Woche hebt den Wert, eine faule senkt ihn von allein – ohne Strafpunkte, das Fenster schiebt sich einfach weiter.": "Everything measures the last 30 days, the muscle map the last 7. A good week raises the score, a lazy one lowers it on its own – no penalty points, the window simply moves on.", "Alter, Geschlecht und Körpergewicht bestimmen, woran deine Kraft gemessen wird. Ziele trägst du nirgends ein – die ergeben sich daraus.": "Age, sex and body weight determine what your strength is measured against. You don't enter goals anywhere – they follow from this.", "Andere Übung": "Other exercise", "Ansatz an der Schambeinregion. Häufige Beschwerdestelle bei Sportarten mit schnellen Richtungswechseln - gezielte Kräftigung beugt vor.": "Attach at the pubic region. A common trouble spot in sports with quick changes of direction - targeted strengthening helps prevent it.", "Art": "Type", "Ausdauer (Minuten)": "Cardio (minutes)", "Ausdauer eintragen": "Log cardio", "Ausdauerleistung und Erholungsfähigkeit. Zeigt sich im Alltag oft früher als Kraftzuwachs.": "Endurance performance and ability to recover. In everyday life it often shows sooner than strength gains.", "Ausführung": "Execution", "Backup nur lokal – Übertragung wird wiederholt": "Backup only local – upload will be retried", "Backup wird übertragen": "Uploading backup", "Bauchroller": "Ab wheel", "Bearbeiten": "Edit", "Bei Kurzhanteln meist „Pro Seite“ (Gewicht je Hantel) – die Gesamtlast ist dann das Doppelte. Bei Maschine oder Langhantel „Gesamtgewicht“.": "With dumbbells usually “Per side” (weight per dumbbell) – the total load is then double. With a machine or barbell “Total weight”.", "Beidseitig": "Both sides", "Bereits abgehakte Sätze bleiben erhalten – verschoben wird nur die Reihenfolge, in der die Übungen angezeigt werden.": "Sets already checked off are kept – only the order in which the exercises are shown changes.", "Beweglichkeit": "Flexibility", "Beweglichkeit und Stabilität hier entscheiden mit, wie tief du hocken kannst und wie sicher du landest.": "Mobility and stability here help decide how deep you can squat and how safely you land.", "Bewegungsmuster": "Movement pattern", "Bezug für alle Kraftstufen": "Basis for all strength levels", "Brust": "Chest", "Das beweglichste große Gelenk. Seitliche Stabilität hier bestimmt, ob das Knie bei Belastung nach innen fällt.": "The most mobile large joint. Lateral stability here decides whether the knee caves in under load.", "Datei wählen": "Choose file", "Dehnen, Hüfte, Schulter": "Stretching, hips, shoulders", "Dehnen, Hüfte, Schulter für heute": "Stretching, hips, shoulders for today", "Deine Hauptübung für Rücken und Hüfte": "Your main exercise for back and hips", "Deine Hauptübung für den Rumpf": "Your main exercise for the core", "Deine Hauptübung für die Oberschenkel": "Your main exercise for the thighs", "Deine Hauptübung fürs Drücken über Kopf": "Your main exercise for overhead pushing", "Deine Hauptübung fürs Rudern": "Your main exercise for rowing", "Deine Hauptübung fürs Ziehen von oben": "Your main exercise for pulling from above", "Deine Hauptübung fürs waagerechte Drücken": "Your main exercise for horizontal pushing", "Deine Hauptübungen": "Your main exercises", "Deine Testwerte zählen als erster bestätigter Messpunkt. Konstanz, Abdeckung und Ausdauer bauen sich in den nächsten Wochen aus echten Einträgen auf – dass sie jetzt niedrig stehen, ist richtig so.": "Your test values count as the first confirmed data point. Consistency, coverage and endurance build up over the next weeks from real entries – that they are low right now is how it should be.", "Deine bevorzugte Ausdauerform": "Your preferred type of cardio", "Der Maßstab für Konstanz, Mobilität und Ausdauer. Nimm die normale Woche, nicht die Idealwoche – ein Ziel, das du zu 90 % erfüllst, trägt dich; eins, das du zu 40 % erfüllst, zermürbt.": "The yardstick for consistency, mobility and endurance. Take your normal week, not your ideal week – a goal you meet 90 % of the time carries you; one you meet 40 % of the time wears you down.", "Die Fähigkeit, den Oberkörper unter Last stabil zu halten. Sie begrenzt bei vielen Übungen, wie viel Gewicht sinnvoll bewegt werden kann.": "The ability to keep the upper body stable under load. In many exercises it limits how much weight can sensibly be moved.", "Die kräftigste Sehne des Körpers. Sie passt sich an Zug an, aber deutlich langsamer als der Muskel - nach langer Pause ist der Sprung in die alte Belastung der häufigste Auslöser für Beschwerden.": "The strongest tendon in the body. It adapts to tension, but much more slowly than the muscle - after a long break, jumping straight back to the old load is the most common cause of trouble.", "Die wichtigste Angabe der ganzen App. Trag einen schweren Arbeitssatz ein, den du bis nahe ans Limit geführt hast – daraus wird dein Einer-Maximum berechnet. Kennst du dein Einer-Maximum, trag es direkt ein.": "The most important input in the whole app. Enter a heavy working set that you took close to your limit – your one-rep max is calculated from it. If you know your one-rep max, enter it directly.", "Drücken waagerecht": "Horizontal push", "Drücken über Kopf": "Overhead push", "Ein Backup ist unabhängig vom Konto: eine Datei mit allem, was drin ist. Nimm sie, bevor du etwas Großes änderst.": "A backup is independent of your account: one file with everything in it. Make one before you change anything big.", "Einbeinige und freie Übungen fordern laufende Korrekturen aus Fuß, Hüfte und Rumpf - das trainiert man nicht an der Maschine.": "Single-leg and free exercises demand constant corrections from foot, hip and core - you don't train that on a machine.", "Einer-Maximum (kg)": "One-rep max (kg)", "Einer-Maximum pro Seite (kg)": "One-rep max per side (kg)", "Einheit bearbeiten": "Edit session", "Einheit löschen": "Delete session", "Einseitig (L/R getrennt)": "One side (L/R separately)", "Einzelnen Satz eintragen": "Log a single set", "Erst oben Muskeln auswählen.": "Select muscles above first.", "Faszie": "Fascia", "Fähigkeit": "Ability", "Für dein Alter": "For your age", "Für jedes Bewegungsmuster eine Übung als Startmessung. Nimm die, die du wirklich regelmäßig machst – später zählt ohnehin jede Übung mit Kraftstandard, die du einträgst.": "One exercise per movement pattern as a starting measurement. Pick the ones you really do regularly – later, every exercise with a strength standard that you log counts anyway.", "Gelenk": "Joint", "Gerade keine Verbindung zum Konto – alles wird lokal in diesem Browser gespeichert und beim nächsten Verbinden hochgeladen.": "No connection to your account right now – everything is saved locally in this browser and uploaded the next time you connect.", "Gesamtgewicht": "Total weight", "Geschätztes Einer-Maximum": "Estimated one-rep max", "Gewicht (kg)": "Weight (kg)", "Gewicht pro Seite (kg)": "Weight per side (kg)", "Gewicht zählt als": "Weight counts as", "Gewicht × Wdh": "Weight × reps", "Gewichtete Sätze: je Satz zählt ein Muskel mit dem Anteil, den diese Übung für ihn leistet (in der Übung als Prozent angegeben, 100 % = beste verfügbare Übung), mal dem Faktor für die Wiederholungen in Reserve. Balken und Farbe zeigen den Anteil am stärkst beanspruchten Muskel DIESER Einheit – die Figur oben ist genauso eingefärbt. Sie sagen also, worauf die Einheit zielt, nicht wie viel der Wochenmenge sie deckt; das steht als Satzzahl daneben.": "Weighted sets: per set, a muscle counts with the share this exercise contributes to it (given as a percentage on the exercise, 100 % = best available exercise), times the factor for reps in reserve. Bar and color show the share relative to the most-worked muscle of THIS session – the figure above is colored the same way. So they show what the session targets, not how much of the weekly amount it covers; that is the set count next to it.", "Gleichgewicht": "Balance", "Griffkraft": "Grip strength", "Große Bindegewebsplatte im unteren Rücken, an der Gesäß, Latissimus und Bauchmuskeln zusammenlaufen. Sie überträgt Kraft zwischen Ober- und Unterkörper.": "Large sheet of connective tissue in the lower back where glutes, lats and abs meet. It transfers force between upper and lower body.", "Handgelenk": "Wrist", "Hauptübungen": "Main exercises", "Herz-Kreislauf": "Cardiovascular fitness", "Höchstes Gewicht": "Heaviest weight", "Hüftgelenk": "Hip joint", "Hüftstreckung": "Hip hinge", "Ja, anpassen": "Yes, update", "Kabelzug": "Cable", "Keine Sätze.": "No sets.", "Keinen Ruhepuls zur Hand?": "No resting heart rate at hand?", "Klimmzugstange": "Pull-up bar", "Kniebeuge-Muster": "Squat pattern", "Kniegelenk": "Knee joint", "Knochen": "Bone", "Knochen bauen auf Druck und Zug auf. Schweres Heben und Belastung mit dem eigenen Körpergewicht wirken dabei deutlich besser als gelenkschonende Ausdauerformen.": "Bones build up from compression and tension. Heavy lifting and bodyweight loading work much better for this than joint-friendly forms of cardio.", "Knochendichte": "Bone density", "Konstanz und Abdeckung stehen noch niedrig": "Consistency and coverage are still low", "Kopfgeschirr": "Head harness", "Kraftstufen und Ausdauer sind altersgewichtet": "Strength levels and endurance are age-adjusted", "Krafttest": "Strength test", "Kräftige Muskeln rundherum halten das Gelenk zusammen - das Training wirkt mehr über die Führung als über das Gelenk selbst.": "Strong muscles all around hold the joint together - training works more through that guidance than through the joint itself.", "Kurzhantel": "Dumbbell", "Lange Bizepssehne": "Long biceps tendon", "Langhantel": "Barbell", "Lass 0 stehen – die Ausdauer zählt dann nur über deine Wochenminuten. Nachtragen geht jederzeit unter „Werte“.": "Leave it at 0 – endurance then only counts your weekly minutes. You can add it any time under “Stats”.", "Laufen, Rad, Rudern – zählt auf die Wochenminuten": "Running, cycling, rowing – counts toward your weekly minutes", "Leeres Training – Übungen fügst du unterwegs hinzu": "Empty workout – add exercises as you go", "Läuft durch das Schultergelenk hindurch. Sie wird bei tiefen Stützpositionen mit gestreckter Schulter stark auf Zug genommen.": "Runs through the shoulder joint. It is put under strong tension in deep support positions with the shoulder extended.", "Maschine": "Machine", "Meiste Wiederholungen": "Most reps", "Minuten": "Minutes", "Mobilität zurücknehmen": "Undo mobility", "Name des Trainings": "Workout name", "Nein, so lassen": "No, keep it", "Nicht ein Gelenk, sondern viele. Sie hält Last aus, wenn die Rumpfmuskulatur sie in Position hält - genau das wird hier mittrainiert.": "Not one joint but many. It handles load when the core muscles hold it in position - exactly what is trained along with it here.", "Noch kein Satz abgehakt. Beenden verwirft das Training.": "No set checked off yet. Finishing discards the workout.", "Noch kein Wert in den letzten 90 Tagen. Trag bei einer dieser Übungen einen schweren Satz ein, dann bekommt der Bereich eine Stufe.": "No value in the last 90 days yet. Log a heavy set for one of these exercises and the area gets a level.", "Noch keine Sätze für diese Übung eingetragen.": "No sets logged for this exercise yet.", "Noch nicht gemessen": "Not measured yet", "Noch nichts eingetragen – die Übung wird erst gewertet, wenn du sie das erste Mal einträgst.": "Nothing entered yet – the exercise is only rated once you log it for the first time.", "Notiz zum Tag": "Note for the day", "Nur auf diesem Gerät": "Only on this device", "Patellasehne": "Patellar tendon", "Pausenzeit ändern": "Change rest time", "Plantarfaszie": "Plantar fascia", "Primärmuskeln zählen 1,0 Sätze, Sekundärmuskeln 0,5. Brust (oben/mitte/unten) und Schulter (vorn/seitlich/hinten) werden einzeln erfasst und auf der Figur entlang ihres Faserverlaufs getrennt dargestellt – diese Liste zeigt jede Gruppe mit ihren Marken für Minimum, Optimum und Erholungsgrenze.": "Primary muscles count 1.0 sets, secondary muscles 0.5. Chest (upper/middle/lower) and shoulder (front/side/rear) are tracked separately and shown split along their fiber direction on the figure – this list shows each group with its marks for minimum, optimum and recovery limit.", "Primärmuskeln zählen mit vollem, Sekundärmuskeln mit halbem Satz fürs Wochenvolumen, sofern der Anteil oben nicht geändert wurde.": "Primary muscles count as a full set and secondary muscles as half a set toward weekly volume, unless the share above was changed.", "Pro Seite": "Per side", "Rad": "Bike", "Referenzwerte und Körperfigur": "Reference values and body figure", "Reihenfolge der Übungen ändern": "Change exercise order", "Reihenfolge ändern": "Change order", "Reiskübel": "Rice bucket", "Rhythmus": "Rhythm", "Rotatorenmanschette": "Rotator cuff", "Rumpf": "Core", "Rumpfspannung": "Core stability", "Rücken": "Back", "Rückenfaszie": "Thoracolumbar fascia", "Satz": "Set", "Satz abhaken": "Check off set", "Satz bearbeiten": "Edit set", "Satz löschen": "Delete set", "Satz zurücknehmen": "Undo set", "Schultergelenk": "Shoulder joint", "Sehne": "Tendon", "Sehnenansätze am Ellbogen": "Elbow tendon attachments", "Sehnenplatte an der Oberschenkelaußenseite, vom Becken bis unters Knie. Sie wird nicht selbst trainiert, sondern über die Muskeln, die an ihr ziehen - Gesäß und Hüftabspreizer. Schwache Hüftstabilität zeigt sich häufig hier.": "Tendon sheet on the outside of the thigh, from the pelvis to below the knee. It isn't trained itself but through the muscles that pull on it - glutes and hip abductors. Weak hip stability often shows up here.", "Sekunden": "Seconds", "Sekunden halten": "Hold for seconds", "Spannt das Längsgewölbe des Fußes und federt bei jedem Schritt.": "Tensions the longitudinal arch of the foot and cushions every step.", "Speichern & beenden": "Save & finish", "Springseil": "Jump rope", "Sprunggelenk": "Ankle", "Startwert": "Starting score", "Stufe": "Level", "Sync gestört – lokal gespeichert": "Sync problem – saved locally", "Sätze mit bis zu 15 Wiederholungen": "Sets of up to 15 reps", "Text einspielen": "Import text", "Tipp auf das Plus für die nächste Übung.": "Tap the plus for the next exercise.", "Tractus iliotibialis": "Iliotibial band", "Training beenden": "Finish workout", "Training löschen": "Delete workout", "Ursprung der Unterarmmuskeln an den Knochenvorsprüngen innen und außen - die Stellen, an denen Tennis- und Golferellenbogen entstehen. Sie profitieren von langsamen, kontrollierten Wiederholungen.": "Origin of the forearm muscles on the bony points inside and outside - where tennis and golfer's elbow develop. They benefit from slow, controlled reps.", "VO2max geschätzt": "Estimated VO2max", "Verbindet Kniescheibe und Schienbein. Regelmäßige Beugung unter Last macht sie belastbarer; plötzlich viel Sprung- und Landearbeit reizt sie.": "Connects the kneecap and shin. Regular bending under load makes it more resilient; a sudden lot of jumping and landing irritates it.", "Verwerfen": "Discard", "Viel Bewegungsumfang, wenig knöcherne Führung - die Stabilität kommt fast ausschließlich aus Muskeln und Sehnen.": "Lots of range of motion, little bony guidance - stability comes almost entirely from muscles and tendons.", "Vier Sehnen, die den Oberarmkopf in der Pfanne zentrieren. Sie arbeiten bei jedem Drücken und Ziehen mit, ohne dass man sie spürt - und sind der Grund, warum saubere Technik über Kopf wichtiger ist als Gewicht.": "Four tendons that keep the head of the upper arm centered in its socket. They work in every push and pull without you feeling it - and are the reason clean technique overhead matters more than weight.", "WHO empfiehlt 150 moderate Minuten": "WHO recommends 150 moderate minutes", "Was heute los war": "What happened today", "Was willst du tun?": "What do you want to do?", "Weiter trainieren": "Keep training", "Welche Muskeln trainiert diese Einheit?": "Which muscles does this session train?", "Welchen Rhythmus hältst du?": "What rhythm do you keep?", "Wie lange und wie fest du etwas halten kannst. Bei Zug- und Hebeübungen oft das erste, was nachgibt - und damit die Grenze, bevor der Zielmuskel wirklich ausbelastet ist.": "How long and how hard you can hold on to something. In pulling and lifting exercises it's often the first thing to give out - and so the limit before the target muscle is really worked.", "Wie lief es? Was war schwer, was ging leicht?": "How did it go? What was hard, what felt easy?", "Wie weit ein Gelenk bewegt werden kann, ohne auszuweichen. Wächst durch regelmäßige, nicht durch lange Einheiten.": "How far a joint can move without compensating. Grows through regular sessions, not long ones.", "Wie wird das gezählt?": "How is this counted?", "Wiederholungen": "Reps", "Wiederholungen in Reserve": "Reps in reserve", "Wiederholungen in Reserve für diesen Satz": "Reps in reserve for this set", "Wirbelsäule": "Spine", "Wird bei Stützpositionen in Streckung belastet. Mit der Zeit gewöhnt es sich daran; von null auf viel ist der übliche Fehler.": "Loaded in extension in support positions. It gets used to it over time; going from zero to a lot is the usual mistake.", "Wird im Training nicht eigens gezählt": "Not counted separately in training", "Wo stehst du heute?": "Where do you stand today?", "Wähl die Backup-Datei aus oder füg den Inhalt als Text ein. Das ersetzt deine aktuellen Daten.": "Choose the backup file or paste its contents as text. This replaces your current data.", "Ziehen senkrecht": "Vertical pull", "Ziehen waagerecht": "Horizontal pull", "Zählt als": "Counts as", "Zählt nicht ins Trainingsvolumen - diese Strukturen lassen sich nicht in Sätzen pro Woche messen. Sie werden trotzdem mitbelastet und brauchen meist länger, um sich anzupassen, als der Muskel.": "Not counted toward training volume - these structures can't be measured in sets per week. They are still loaded and usually take longer to adapt than the muscle.", "bis zum Muskelversagen": "to failure", "erledigt": "completed", "fünf oder mehr in Reserve": "five or more in reserve", "heute erledigt": "done today", "jeder Tag mit mindestens einem Satz": "every day with at least one set", "lassen sich gut umrechnen. Bei sehr langen Sätzen wird die Schätzung unsicher – dann lieber ein schwereres Gewicht mit weniger Wiederholungen eintragen.": "convert well. For very long sets the estimate becomes unreliable – better enter a heavier weight with fewer reps.", "morgens im Liegen – daraus wird die Ausdauer geschätzt": "in the morning, lying down – endurance is estimated from it", "z. B. Butterfly Maschine": "e.g. Butterfly machine", "z. B. Maschine": "e.g. Machine", "z. B. Oberkörper A": "e.g. Upper body A", "Über dich": "About you", "Übung": "Exercise", "Übung bearbeiten": "Edit exercise", "Übung entfernen": "Remove exercise", "Übungen": "Exercises", "– sie messen, was du in den letzten Tagen wirklich getan hast. Nach zwei Wochen Eintragen sind sie aussagekräftig.": "– they measure what you actually did in recent days. After two weeks of logging they are meaningful.", "…oder Backup-Text hier einfügen": "…or paste backup text here", "− Satz": "− Set"};
  for(var k in add)if(!(k in UI_EN))UI_EN[k]=add[k];
  var PAT_EN={"Drücken waagerecht": "Horizontal push", "Drücken über Kopf": "Overhead push", "Ziehen senkrecht": "Vertical pull", "Ziehen waagerecht": "Horizontal pull", "Kniebeuge-Muster": "Squat pattern", "Hüftstreckung": "Hip hinge", "Rumpf": "Core", "Ausdauer": "Cardio", "Isolation": "Isolation", "Mobilität": "Mobility"},EQ_EN={"Bauchroller": "Ab wheel", "Kabelzug": "Cable", "Klimmzugstange": "Pull-up bar", "Kopfgeschirr": "Head harness", "Kurzhantel": "Dumbbell", "Körpergewicht": "Body weight", "Langhantel": "Barbell", "Maschine": "Machine", "Rad": "Bike", "Reiskübel": "Rice bucket", "Springseil": "Jump rope", "Sonstiges": "Other"},OB_EN={"Über dich":"About you","Hauptübungen":"Main exercises","Krafttest":"Strength test","Rhythmus":"Rhythm","Startwert":"Starting score"};
  function alt(o){return Object.keys(o).map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}).join("|");}
  var vorne=[
    [/(\d+) von (\d+) Sätzen/g,"$1 of $2 sets"],
    [/Wochenminimum ([\d,.]+) Sätze · noch ([\d,.]+) offen/g,"Weekly minimum $1 sets · $2 to go"],
    [/Wochenminimum ([\d,.]+) Sätze · erreicht/g,"Weekly minimum $1 sets · reached"],
    [/^Übung (\d+) von (\d+) · /g,"Exercise $1 of $2 · "],
    [/ · neu · /g," · new · "],
    [/ · Pause (\d+) s$/g," · rest $1 s"],
    [/^(.+): (\d+) % Beanspruchung – allein in der Figur hervorheben$/g,"$1: $2 % load – show only this in the figure"],
    [/^(\d+) gewählt: /g,"$1 selected: "],
    [/^Beanspruchte Muskeln von (.+) gross anzeigen$/g,"Show muscles worked by $1 large"],
    [/^Beanspruchte Muskeln von (.+) anzeigen$/g,"Show muscles worked by $1"],
    [/^Kraft (Brust|Schultern|Rücken|Arme|Beine|Rumpf)$/g,function(m,c){return "Strength – "+({"Brust":"Chest","Schultern":"Shoulders","Rücken":"Back","Arme":"Arms","Beine":"Legs","Rumpf":"Core"})[c];}],
    [/^Aus dem Plan · /g,"From plan · "],
    [/nächste Stufe ab /g,"next level at "],
    [/· nächste ab /g,"· next at "],
    [/· Höchststufe/g,"· top level"],
    [/(\d+) Äquivalentminuten/g,"$1 equivalent minutes"],
    [/auf dein Wochenziel von (\d+) min\./g,"toward your weekly goal of $1 min."],
    [/^ab (\d+) % Top-Übung$/g,"from $1 % of the top exercise"],
    [/letzte (\d+) Tage · antippen für Details/g,"last $1 days · tap for details"],
    [/^(zu wenig|im Korridor|über Limit) · /g,function(m,z){return ({"zu wenig":"too little","im Korridor":"in range","über Limit":"over limit"})[z]+" · ";}],
    [/^Schritt (\d+) von (\d+) · (.+)$/g,function(m,a,b,c){return "Step "+a+" of "+b+" · "+(OB_EN[c]||c);}],
    [/^Stufe „(.+?)“ als Durchschnitt aus (\d+) bewerteten Übung(?:en)? in diesem Bereich\. Bester Einzelwert: (.+?) mit (.+?)\. „Richtwert“ heißt: Stufe aus einer verwandten Übung abgeleitet, nicht aus einer eigenen Normtabelle\.$/g,
      function(m,g,n,ex,val){return "Level “"+g+"” as the average of "+n+" rated exercise"+(n==="1"?"":"s")+" in this area. Best single value: "+ex+" with "+val+". “Guide value” means: level derived from a related exercise, not from its own standards table.";}],
    [new RegExp("^("+alt(PAT_EN)+") · ([^·]+)$","g"),function(m,p,e){return PAT_EN[p]+" · "+(EQ_EN[e]||e);}],
    // Die Formel-Erklärung im Werte-Tab ist ein einziger Textblock mit fester Spaltenbreite.
    [/Formwert = 30 % Maximalkraft\n(\s+)\+ 25 % Konstanz\n(\s+)\+ 20 % Muskelabdeckung\n(\s+)\+ 15 % Ausdauer\n(\s+)\+ 10 % Mobilität/g,
      "Formwert = 30 % max strength\n$1+ 25 % consistency\n$2+ 20 % muscle coverage\n$3+ 15 % endurance\n$4+ 10 % mobility"],
    [/Maximalkraft    Ø der (\d+) Kraft-Bereiche \((\d+) T\)\n(\s+)je Bereich zählt die stärkste Übung/g,"Max strength    avg of $1 strength areas ($2 d)\n$3per area the strongest exercise counts"],
    [/Konstanz        Trainingstage (\d+) T ÷ (\d+)/g,"Consistency     training days $1 d ÷ $2"],
    [/Muskelabdeckung Ø Sätze je Muskel gegen MEV\/MAV \((\d+) T\)/g,"Muscle coverage avg sets per muscle vs MEV/MAV ($1 d)"],
    [/Ausdauer        WHO-Minuten \+ VO2max-Perzentil/g,"Endurance       WHO minutes + VO2max percentile"],
    [/Mobilität       Einheiten (\d+) T ÷ (\d+)/g,"Mobility        sessions $1 d ÷ $2"],
    [/Epley \(1–3 Wdh\)/g,"Epley (1–3 reps)"],
    [/weich gemischt, aus dem besten Satz/g,"smoothly blended, from the best set"],
    [/\nFigur: /g,"\nFigure: "],
    [/\njetzt  /g,"\nnow    "]
  ];
  var hinten=[
    [/(\d+) Übungen\b/g,"$1 exercises"],
    [/^(\d+) Übung$/g,"$1 exercise"],
    [/(\d+) min Ausdauer/g,"$1 min cardio"],
    [/^(\d+) Minuten\b/g,"$1 minutes"],
    [/^(\d+) Einheiten$/g,"$1 sessions"],
    [/^(\d+) Einheit$/g,"$1 session"],
    [/ · Mobilität$/g," · Mobility"],
    [/ · Notiz$/g," · Note"],
    [/ · Ausdauer$/g," · cardio"]
  ];
  UI_RX.unshift.apply(UI_RX,vorne);
  UI_RX.push.apply(UI_RX,hinten);
})();
/* Rueckwaerts-Woerterbuch. Beim Zurueckschalten auf Deutsch muessen fest im Dokument stehende
   Beschriftungen (Navigation, Ringlegende, Sync-Anzeige) wieder deutsch werden - die werden
   beim Neuzeichnen naemlich NICHT neu erzeugt und waeren sonst dauerhaft englisch geblieben.
   Mehrdeutige Rueckwege werden weggelassen: "Back" waere sowohl "Zurueck" als auch "Hinten". */
var UI_DE=(function(){
  var back={},seen={},k;
  for(k in UI_EN){var v=UI_EN[k];seen[v]=(seen[v]||0)+1;}
  for(k in UI_EN){var v2=UI_EN[k];if(seen[v2]===1&&v2!==k)back[v2]=k;}
  return back;
})();
function trText(s){
  if(!s)return null;
  var lead=s.match(/^\s*/)[0], tail=s.match(/\s*$/)[0], t=s.trim();
  if(!t)return null;
  if(LANG!=="en"){
    // Zurueck nach Deutsch: nur eindeutige Einzelbegriffe, keine Muster.
    var d=UI_DE[t];
    return d!=null?lead+d+tail:null;
  }
  var hit=UI_EN[t];
  if(hit!=null)return lead+hit+tail;
  var o=t;
  // "Drücken waagerecht · Langhantel": jeden Teil einzeln im Woerterbuch suchen.
  if(o.indexOf(" · ")>0)o=o.split(" · ").map(function(pt){var h=UI_EN[pt];return h!=null?h:pt;}).join(" · ");
  for(var i=0;i<UI_RX.length;i++){UI_RX[i][0].lastIndex=0;o=o.replace(UI_RX[i][0],UI_RX[i][1]);}
  return o!==t?lead+o+tail:null;
}
function applyUiLang(root){
  if(!root)return;
  _uiBusy=true;
  try{
    if(root.nodeType===3){
      var pp=root.parentNode,bad=false;
      while(pp&&pp.nodeType===1){if({STYLE:1,SCRIPT:1,TEXTAREA:1,INPUT:1,CODE:1,PRE:1}[pp.nodeName]||pp.isContentEditable){bad=true;break;}pp=pp.parentNode;}
      if(!bad){var r0=trText(root.nodeValue);if(r0!=null)root.nodeValue=r0;}
    }
    else if(root.nodeType===1){
      /* Stil- und Skriptknoten NIE anfassen - dort stuende sonst uebersetztes CSS bzw.
         veraenderter Code. Ebenso Eingabefelder, damit Getipptes unberuehrt bleibt. */
      var skip={STYLE:1,SCRIPT:1,TEXTAREA:1,INPUT:1,CODE:1,PRE:1};
      var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{
        acceptNode:function(nd){
          var p=nd.parentNode;
          while(p&&p.nodeType===1){
            if(skip[p.nodeName])return NodeFilter.FILTER_REJECT;
            if(p.isContentEditable)return NodeFilter.FILTER_REJECT;
            p=p.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }}),n,jobs=[];
      while(n=w.nextNode()){var r=trText(n.nodeValue);if(r!=null&&r!==n.nodeValue)jobs.push([n,r]);}
      for(var i=0;i<jobs.length;i++)jobs[i][0].nodeValue=jobs[i][1];
      var els=root.querySelectorAll("[aria-label],[placeholder],[title]");
      for(var j=0;j<els.length;j++){
        ["aria-label","placeholder","title"].forEach(function(a){
          var v=els[j].getAttribute(a);if(!v)return;
          var rr=trText(v);if(rr!=null&&rr!==v)els[j].setAttribute(a,rr);
        });
      }
      ["aria-label","placeholder","title"].forEach(function(a){
        var v=root.getAttribute&&root.getAttribute(a);if(!v)return;
        var rr=trText(v);if(rr!=null&&rr!==v)root.setAttribute(a,rr);
      });
    }
  }catch(e){}finally{_uiBusy=false;}
}
(function(){
  if(typeof MutationObserver!=="function")return;
  /* Nicht pro eingefuegtem Knoten uebersetzen: beim Aufbau einer Liste kommen hunderte
     Einfuegungen, und jede Teilmenge wuerde mehrfach durchlaufen. Stattdessen wird EIN
     Durchlauf ueber die Seite gebuendelt und im naechsten Frame ausgefuehrt. */
  var pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    (window.requestAnimationFrame||setTimeout)(function(){
      pending=false;applyUiLang(document.body);
    },0);
  }
  var mo=new MutationObserver(function(){
    if(_uiBusy)return;
    schedule();
  });
  mo.observe(document.body,{childList:true,subtree:true,characterData:true});
})();
var LANG="de";
var REG_EN={"Brust": "Chest", "Schultern": "Shoulders", "Rücken": "Back", "Rückenstrecker": "Spinal erectors", "Bizeps": "Biceps", "Trizeps": "Triceps", "Unterarme": "Forearms", "Rumpf": "Core", "Gesäß": "Glutes", "Quadrizeps": "Quadriceps", "Beinbeuger": "Hamstrings", "Adduktoren": "Adductors", "Waden": "Calves", "Hals": "Neck (front)", "Nacken": "Neck (back)"};
var MUS_EN={"tg_brust_ober": "Upper chest", "tg_brust_mitte": "Mid chest", "tg_brust_unten": "Lower chest", "tg_brust_serratus": "Serratus anterior", "tg_bizeps": "Biceps", "tg_brachialis": "Brachialis", "tg_trizeps_lang": "Triceps long head", "tg_trizeps_lat": "Triceps lateral & medial", "tg_rueck_lat": "Latissimus dorsi", "tg_rueck_teres_major": "Teres major", "tg_rueck_trapez_ob": "Upper trapezius", "tg_rueck_trapez_mit": "Mid trapezius", "tg_rueck_trapez_unt": "Lower trapezius", "tg_rueck_rhomb": "Rhomboids", "tg_rueck_strecker": "Spinal erectors (deep)", "tg_schulter_vorn": "Front delt", "tg_schulter_seit": "Side delt", "tg_schulter_hint": "Rear delt", "tg_schulter_rot_infra": "Infraspinatus", "tg_schulter_rot_teres_min": "Teres minor", "tg_schulter_rot_sub": "Subscapularis", "tg_schulter_rot_supra": "Supraspinatus", "tg_bauch_gerade": "Rectus abdominis", "tg_bauch_schraeg": "Obliques", "tg_bauch_tief": "Deep core & breathing muscles", "tg_quadrizeps": "Quadriceps", "tg_huefte": "Hip flexors", "tg_adduktoren": "Adductors", "tg_kniesehnen": "Hamstrings", "tg_gesaess_haupt": "Gluteus maximus", "tg_gesaess_med": "Gluteus medius", "tg_gesaess_min": "Gluteus minimus", "tg_wade_gastro": "Calf (standing)", "tg_wade_soleus": "Calf (seated)", "tg_wade_fussheber": "Shin / dorsiflexors", "tg_unterarm_beug": "Wrist flexors & pronators", "tg_unterarm_streck": "Wrist extensors & supinators", "tg_nacken": "Neck (back)", "tg_hals_nacken": "Front/side neck muscles"};
var EX_EN={"bench": "Barbell bench press", "bench_db": "Dumbbell bench press", "bench_inc": "Incline bench press", "bench_inc_db": "Incline DB press", "bench_dec": "Decline bench press", "machine_press": "Chest press machine", "machine_press_lying": "Lying chest press", "pushup": "Push-ups", "pushup_diamond": "Diamond push-ups", "pushup_arch": "Archer push-ups", "pushup_dec": "Feet-elevated push-ups", "dips": "Dips", "fly_db": "Dumbbell fly", "cable_fly": "Cable fly", "fly_machine": "Pec deck", "pullover": "Pullovers", "ohp": "Barbell overhead press", "ohp_db": "Dumbbell overhead press", "push_press": "Push press", "arnold": "Arnold press", "pike_pushup": "Pike push-ups", "hspu": "Handstand push-ups", "handstand": "Wall handstand hold", "pullup": "Pull-ups (overhand)", "chinup": "Chin-ups", "pullup_wide": "Wide-grip pull-ups", "pullup_weight": "Weighted pull-ups", "latpull": "Lat pulldown", "latpull_close": "Close-grip pulldown", "pullup_neg": "Negative pull-ups", "deadhang": "Passive hang", "row_bb": "Barbell row", "row_db": "Dumbbell row", "row_pendlay": "Pendlay row", "row_tbar": "T-bar row", "row_cable": "Cable row", "row_machine": "Lever seated row", "row_inv": "Inverted rows", "row_band": "Band row", "facepull": "Face pulls", "shrug": "Shrugs", "shrug_db": "Dumbbell shrugs", "shrug_cable": "Cable shrugs (both sides)", "squat": "Barbell squat", "squat_front": "Front squat", "squat_goblet": "Goblet squat", "squat_bw": "Bodyweight squat", "squat_pistol": "Pistol squat", "squat_bulg": "Bulgarian split squat", "legpress": "Leg press", "hacksquat": "Hack squat", "lunge": "Lunges", "lunge_walk": "Walking lunges", "stepup": "Step-ups", "stepup_bw": "Bodyweight step-ups", "legext": "Leg extension", "sissy": "Sissy squat", "wallsit": "Wall sit", "deadlift": "Deadlift", "deadlift_rdl": "Romanian deadlift", "deadlift_sumo": "Sumo deadlift", "deadlift_sl": "Single-leg deadlift", "hipthrust": "Hip thrust", "goodmorning": "Good morning", "backext": "Back extension", "legcurl": "Leg curl", "nordic": "Nordic curl", "kb_swing": "Kettlebell swing", "plank": "Plank", "lsit": "L-sit", "sideplank": "Side plank", "hollow": "Hollow body hold", "legraise": "Hanging leg raise", "kneeraise": "Hanging knee raise", "crunch": "Crunches", "situp": "Sit-ups", "russian": "Russian twist", "abwheel": "Ab wheel", "cablecrunch": "Cable crunch", "torso_rot": "Torso rotation machine", "deadbug": "Dead bug", "birddog": "Bird dog", "pallof": "Pallof press", "dragonflag": "Dragon flag", "lateral": "Lateral raise", "lateral_cable": "Cable lateral raise", "frontraise": "Front raise", "reversefly": "Reverse fly", "upright_row": "Upright row", "cuban": "Cuban press", "bandpullapart": "Band pull-apart", "curl_bb": "Barbell curl", "curl_db": "Dumbbell curl", "curl_hammer": "Hammer curl", "curl_incline": "Incline curl", "curl_preacher": "Preacher curl", "curl_preacher_machine": "Preacher curl machine", "curl_cable": "Cable curl", "curl_cable_lying": "Lying cable curl", "tri_push": "Triceps pushdown", "tri_skull": "Skull crusher", "tri_over": "Overhead triceps extension", "tri_kick": "Triceps kickback", "dips_bench": "Bench dips", "wrist_curl": "Wrist curl", "wrist_curl_rev": "Reverse wrist curl", "farmers": "Farmer's walk", "ricebucket": "Rice bucket grip work", "fatgripz": "Fat-grip holds", "calf_stand": "Standing calf raise", "calf_seat": "Seated calf raise", "calf_bw": "Bodyweight calf raise", "adduct": "Adductor machine", "clamshell": "Clamshells", "sidelying_raise": "Side-lying leg raise", "bandwalk_lat": "Lateral band walk", "abduct": "Abductor machine", "copenhagen": "Copenhagen plank", "neck_curl": "Neck curl", "neck_ext_bw": "Neck extension", "neck_flex_bw": "Neck flexion", "neck_side_bw": "Lateral neck flexion", "neck_harness": "Head harness", "neck_bridge": "Neck bridge", "run": "Running", "run_interval": "Interval runs", "bike": "Cycling", "row_erg": "Rowing machine", "swim": "Swimming", "jumprope": "Jump rope", "walk": "Brisk walking", "hike": "Hiking", "stairs": "Stair climbing", "burpee": "Burpees", "elliptical": "Elliptical", "football": "Football / ball sports", "mob_hip": "Hip openers", "mob_shoulder": "Shoulder mobility", "mob_thoracic": "Thoracic spine", "mob_hamstring": "Hamstring stretch", "mob_ankle": "Ankle mobility", "mob_couch": "Couch stretch", "mob_deadhang": "Dead hang decompression", "mob_pancake": "Pancake / straddle", "mob_chest": "Pectoralis stretch", "mob_biceps": "Biceps stretch", "mob_cobra": "Prone press-up", "mob_reardelt": "Cross-body shoulder stretch", "mob_triceps": "Overhead triceps stretch", "mob_neck": "Upper trapezius stretch", "mob_lat": "Lat stretch", "mob_knee2chest": "Knee-to-chest", "mob_twist": "Supine spinal twist", "mob_wrist_flex": "Wrist flexor stretch", "mob_wrist_ext": "Wrist extensor stretch", "mob_hipflex": "Kneeling hip flexor stretch", "mob_pigeon": "Pigeon / figure-4", "mob_glutemed": "Gluteus medius stretch", "mob_quad": "Standing quad stretch", "mob_frog": "Frog stretch", "mob_calf_straight": "Gastrocnemius stretch", "mob_calf_bent": "Soleus stretch", "mob_tibialis": "Tibialis anterior stretch", "mob_catcow": "Cat-cow", "mob_wgs": "World's greatest stretch", "mob_legswing": "Leg swings", "mob_9090": "90/90 hip switch", "mob_wrist_circ": "Wrist mobilisation", "rot_internal": "Cable internal rotation", "emptycan": "Empty-can raise", "hipflex_cable": "Cable hip flexion"};
/* Ein paar Feinmuskel-Schluessel sind Kuerzel oder wuerden beim Umwandeln holprig lesen. */
var FINE_EN_FIX={tfl:"Tensor fasciae latae"};
function enFromKey(k){
  if(FINE_EN_FIX[k])return FINE_EN_FIX[k];
  var s=String(k).replace(/_/g," ");
  return s.charAt(0).toUpperCase()+s.slice(1);
}
function detectLang(){
  var st=state&&state.profile&&state.profile.lang;
  if(st==="de"||st==="en")return st;
  var n=((navigator.language||navigator.userLanguage||"de")+"").toLowerCase();
  return n.indexOf("de")===0?"de":"en";
}
function applyLangData(){
  var en=(LANG==="en"),k,f,i;
  for(k in FINE){f=FINE[k];
    if(f._de===undefined)f._de=f.de;
    f.de=en?enFromKey(k):f._de;}
  for(i=0;i<MUSCLES.length;i++){var m=MUSCLES[i];
    if(m._name===undefined)m._name=m.name;
    m.name=en?(MUS_EN[m.id]||m._name):m._name;}
  for(i=0;i<EX.length;i++){var e=EX[i];
    if(e._n===undefined)e._n=e.n;
    e.n=en?(EX_EN[e.id]||e._n):e._n;}
  for(i=0;i<REGIONS.length;i++){var r=REGIONS[i];
    if(r.key===undefined)r.key=r.name;
    r.name=en?(REG_EN[r.key]||r.key):r.key;}
}
(function(){
  var add={"Dein Formwert":"Your form score","Wochenfortschritt":"Weekly progress","Training starten":"Start workout","Satz nachtragen":"Log a set",
    "Heute noch kein Training":"No workout yet today","Noch keine Ausdauer":"No cardio yet","Ausdauer eintragen":"Log cardio",
    "Mobilität abhaken":"Tick off mobility","Zurück zu heute":"Back to today","Topform":"Peak form","Starke Form":"Strong form","Gute Form":"Good form",
    "Solide Basis":"Solid base","Im Aufbau":"Building up","Noch keine Daten":"No data yet","Bestform":"Best","erledigt":"done","heute erledigt":"done today",
    "✓ erledigt":"✓ done","✓ fertig":"✓ done","Kategorien":"Categories","Alle zurücksetzen":"Reset all","Eigene Übung":"Custom exercise","Angepasst":"Edited",
    "Zusatzgewicht":"Weighted","Wiederholungen":"Reps","Halten":"Hold","Dehnen":"Stretch","Mobilisieren":"Mobilise","Keine passende Übung":"No matching exercise",
    "Probier einen kürzeren Suchbegriff oder nimm einen Filter heraus.":"Try a shorter search term or remove a filter.",
    "Trainingsvolumen":"Training volume","Sätze je Muskel · letzte 7 Tage":"Sets per muscle · last 7 days","im Zielbereich":"in target range","hoch":"high",
    "Wie wird gezählt?":"How is it counted?","Formwert":"Form score","Kraft":"Strength","Ausdauer im Detail":"Endurance in detail","Verlauf · 90 Tage":"History · 90 days",
    "Muskeln im Körper-Tab ansehen":"View muscles in Body tab","Ohne Vorlage":"Without template","Freies Training":"Free workout",
    "Leer starten, Übungen fügst du unterwegs hinzu.":"Start empty and add exercises as you go.",
    "Starte eine deiner Einheiten – oder trainiere frei und füg Übungen unterwegs hinzu.":"Start one of your sessions – or train freely and add exercises as you go.",
    "Reihenfolge ändern":"Change order","Fertig":"Done","Noch nicht genutzt":"Not used yet","Noch keine Einheit":"No session yet","Pause":"Rest",
    "je Bereich · 90 Tage":"per area · 90 days","Training":"Training","Tagesnotiz":"Daily note"};
  for(var k in add)if(!UI_EN[k])UI_EN[k]=add[k];
})();
/* Nachtrag Uebersetzung (Sept. 2026): Texte, die im Englisch-Modus noch deutsch geblieben
   waren - Onboarding, Werte, Uebungsdetail, Training, Ausruestung, Bewegungsmuster. */
(function(){
  var add={
    // Onboarding
    "Alter, Geschlecht und Körpergewicht bestimmen, woran deine Kraft gemessen wird. Ziele trägst du nirgends ein – die ergeben sich daraus.":"Age, sex and body weight determine how your strength is measured. You never enter goals – they follow from this.",
    "Kraftstufen und Ausdauer sind altersgewichtet":"Strength levels and endurance are age-adjusted",
    "Referenzwerte und Körperfigur":"Reference values and body figure",
    "Bezug für alle Kraftstufen":"Basis for all strength levels",
    "morgens im Liegen – daraus wird die Ausdauer geschätzt":"in the morning, lying down – used to estimate endurance",
    "Keinen Ruhepuls zur Hand?":"No resting heart rate at hand?",
    "Lass 0 stehen – die Ausdauer zählt dann nur über deine Wochenminuten. Nachtragen geht jederzeit unter „Werte“.":"Leave it at 0 – endurance then counts only your weekly minutes. You can add it any time under “Stats”.",
    "Deine Hauptübungen":"Your main exercises",
    "Für jedes Bewegungsmuster eine Übung als Startmessung. Nimm die, die du wirklich regelmäßig machst – später zählt ohnehin jede Übung mit Kraftstandard, die du einträgst.":"One exercise per movement pattern as a starting measurement. Pick the ones you really do regularly – later, every exercise with a strength standard you log counts anyway.",
    "Wo stehst du heute?":"Where are you today?",
    "Die wichtigste Angabe der ganzen App. Trag einen schweren Arbeitssatz ein, den du bis nahe ans Limit geführt hast – daraus wird dein Einer-Maximum berechnet. Kennst du dein Einer-Maximum, trag es direkt ein.":"The most important input in the whole app. Enter a heavy working set you took close to your limit – your one-rep max is calculated from it. If you know your one-rep max, enter it directly.",
    "Noch nichts eingetragen – die Übung wird erst gewertet, wenn du sie das erste Mal einträgst.":"Nothing logged yet – the exercise only counts once you log it for the first time.",
    "Gewicht (kg)":"Weight (kg)",
    "Sätze mit bis zu 15 Wiederholungen":"Sets of up to 15 reps",
    "lassen sich gut umrechnen. Bei sehr langen Sätzen wird die Schätzung unsicher – dann lieber ein schwereres Gewicht mit weniger Wiederholungen eintragen.":"convert well. With very long sets the estimate becomes unreliable – better log a heavier weight with fewer reps.",
    "Welchen Rhythmus hältst du?":"What rhythm do you keep?",
    "Der Maßstab für Konstanz, Mobilität und Ausdauer. Nimm die normale Woche, nicht die Idealwoche – ein Ziel, das du zu 90 % erfüllst, trägt dich; eins, das du zu 40 % erfüllst, zermürbt.":"The yardstick for consistency, mobility and endurance. Take your normal week, not your ideal week – a goal you meet 90 % of the time carries you; one you meet 40 % of the time wears you down.",
    "jeder Tag mit mindestens einem Satz":"every day with at least one set",
    "Dehnen, Hüfte, Schulter":"Stretching, hips, shoulders",
    "WHO empfiehlt 150 moderate Minuten":"WHO recommends 150 moderate minutes",
    "Deine Testwerte zählen als erster bestätigter Messpunkt. Konstanz, Abdeckung und Ausdauer bauen sich in den nächsten Wochen aus echten Einträgen auf – dass sie jetzt niedrig stehen, ist richtig so.":"Your test values count as the first confirmed data point. Consistency, coverage and endurance build up over the next weeks from real entries – it's correct that they're low right now.",
    "/ 100 zum Start":"/ 100 to start",
    "Konstanz und Abdeckung stehen noch niedrig":"Consistency and coverage are still low",
    "Nächster Schritt: Training.":"Next step: Training.",
    "Starte eine deiner Einheiten oder trainiere frei – jeder Satz landet automatisch hier.":"Start one of your sessions or train freely – every set lands here automatically.",
    "Laufen, Rad oder Rudern zählt auf deine Wochenminuten.":"Running, cycling or rowing counts towards your weekly minutes.",
    "Leg deine erste Einheit an – etwa „Push“, „Pull“ oder „Ganzkörper“. Beim nächsten Mal startest du sie mit einem Tipp.":"Create your first session – e.g. “Push”, “Pull” or “Full body”. Next time you start it with one tap.",
    "Tipp auf das Plus und füge deine erste Übung hinzu.":"Tap the plus and add your first exercise.",
    "Tipp auf das Plus für die nächste Übung.":"Tap the plus for the next exercise.",
    // Training
    "Übungen":"Exercises","Übung":"Exercise","Satz":"Set","− Satz":"− Set","+ Satz":"+ Set",
    "Noch kein Satz abgehakt. Beenden verwirft das Training.":"No set ticked off yet. Finishing discards the workout.",
    "Dein Training läuft – abgehakte Sätze erscheinen hier.":"Your workout is running – ticked-off sets appear here.",
    "läuft – Zeit und Fortschritt siehst du direkt darunter.":"is running – time and progress are shown right below.",
    "+ Neue Übung erstellen":"+ Create new exercise","Übung suchen…":"Search exercise…",
    "Pausenzeit ändern":"Change rest time","Übung entfernen":"Remove exercise",
    "Wiederholungen in Reserve für diesen Satz":"Reps in reserve for this set","Satz abhaken":"Tick off set",
    "Aktivität":"Activity","Minuten":"Minutes","Zählt als":"Counts as",
    // Entdecken / Uebungsdetail
    "Ausrüstung":"Equipment","Alles löschen":"Clear all","Schließen":"Close","Filter":"Filter",
    "ab 80 % Top-Übung":"80 %+ top exercise",
    "100 % = die beste verfügbare Übung für diesen Muskel. Ein Satz zählt anteilig auf dein Wochenvolumen: 60 % sind 0,6 Sätze. Planungswerte auf Basis der EMG-Literatur – keine Messwerte.":"100 % = the best available exercise for this muscle. A set counts proportionally towards your weekly volume: 60 % is 0.6 sets. Planning values based on EMG literature – not measurements.",
    "Zählt nicht ins Trainingsvolumen - diese Strukturen lassen sich nicht in Sätzen pro Woche messen. Sie werden trotzdem mitbelastet und brauchen meist länger, um sich anzupassen, als der Muskel.":"Doesn't count towards training volume – these structures can't be measured in sets per week. They are still loaded and usually take longer to adapt than the muscle.",
    "Vier Sehnen, die den Oberarmkopf in der Pfanne zentrieren. Sie arbeiten bei jedem Drücken und Ziehen mit, ohne dass man sie spürt - und sind der Grund, warum saubere Technik über Kopf wichtiger ist als Gewicht.":"Four tendons that centre the head of the upper arm in its socket. They work in every press and pull without you feeling them – and are the reason clean overhead technique matters more than weight.",
    "Viel Bewegungsumfang, wenig knöcherne Führung - die Stabilität kommt fast ausschließlich aus Muskeln und Sehnen.":"Lots of range of motion, little bony guidance – stability comes almost entirely from muscles and tendons.",
    "Noch keine Sätze für diese Übung eingetragen.":"No sets logged for this exercise yet.",
    "Übung bearbeiten":"Edit exercise","Wie wird das gezählt?":"How is this counted?",
    "einseitig":"unilateral","Für alle Muskeln übernehmen":"Apply to all muscles","Richtwert aus der Literatur":"Guide value from the literature",
    // Ausruestung
    "Langhantel":"Barbell","Kurzhantel":"Dumbbell","Maschine":"Machine","Kabelzug":"Cable","Klimmzugstange":"Pull-up bar",
    "Band":"Band","Kettlebell":"Kettlebell","Springseil":"Jump rope","Ergometer":"Ergometer","Bauchroller":"Ab wheel",
    "Kopfgeschirr":"Head harness","Reiskübel":"Rice bucket","Parallettes":"Parallettes","Rad":"Bike",
    // Bewegungsmuster / Bereiche
    "Drücken waagerecht":"Horizontal push","Drücken über Kopf":"Overhead press","Ziehen senkrecht":"Vertical pull",
    "Ziehen waagerecht":"Horizontal pull","Kniebeuge-Muster":"Squat pattern","Hüftstreckung":"Hip extension",
    "Brust":"Chest","Rücken":"Back","Schultern":"Shoulders","Beine":"Legs","Arme":"Arms","Rumpf":"Core",
    // Werte
    "Anteil am Formwert":"Share of form score","Zusammensetzung des Formwerts":"Form score breakdown",
    "Noch keine Kraftstufe: Trag bei einer Grundübung wie Kniebeuge oder Bankdrücken einen schweren Satz ein – dann wird Kraft berechenbar.":"No strength level yet: log a heavy set of a basic lift like squat or bench press – then strength can be calculated.",
    "Trag eine Ausdauereinheit ein, etwa 20 Minuten Laufen oder Rad – dann zählt sie hier.":"Log a cardio session, e.g. 20 minutes of running or cycling – then it counts here.",
    "VO2max geschätzt":"VO2max estimated","Für dein Alter":"For your age",
    "Trainiere ein paar Sätze – jede Muskelgruppe über ihrem Minimum hebt diesen Wert.":"Do a few sets – every muscle group above its minimum raises this value.",
    "Jeder Trainingstag zählt hier – schon der erste bringt den Wert in Gang.":"Every training day counts here – even the first one gets the value going.",
    "Noch keine Einträge.":"No entries yet.",
    "Hak im Heute-Tab einmal Mobilität ab – dann steigt dieser Wert.":"Tick off mobility once in the Today tab – then this value rises.",
    "Gewicht im Formwert":"Weight in form score","Noch nicht gemessen":"Not measured yet",
    "Geschätztes Einer-Maximum":"Estimated one-rep max","Stufe":"Level","Wiederholungen in Reserve":"Reps in reserve",
    "0 = bis zum Muskelversagen. Ohne Angabe zählt der Satz voll; ab 3 in Reserve zählt er anteilig weniger.":"0 = to muscle failure. Without a value the set counts fully; from 3 in reserve it counts proportionally less.",
    "Andere Übung":"Other exercise","bis zum Muskelversagen":"to muscle failure","fünf oder mehr in Reserve":"five or more in reserve",
    "Bereiche":"Areas","Deine Daten werden geladen":"Loading your data","Einen Moment – die App holt dein Profil.":"One moment – the app is fetching your profile.",
    "3D-Muskelmodell":"3D muscle model","letzte 7 Tage · antippen für Details":"last 7 days · tap for details",
    "Primärmuskeln zählen 1,0 Sätze, Sekundärmuskeln 0,5. Brust (oben/mitte/unten) und Schulter (vorn/seitlich/hinten) werden einzeln erfasst und auf der Figur entlang ihres Faserverlaufs getrennt dargestellt – diese Liste zeigt jede Gruppe mit ihren Marken für Minimum, Optimum und Erholungsgrenze.":"Primary muscles count 1.0 sets, secondary muscles 0.5. Chest (upper/mid/lower) and shoulder (front/side/rear) are tracked separately and shown split along their fibre direction on the figure – this list shows each group with its marks for minimum, optimum and recovery limit."
  };
  for(var k in add)if(!UI_EN[k])UI_EN[k]=add[k];
  /* Konkrete Saetze mit Zahlen - stehen VOR den allgemeinen Mustern, sonst greift z.B.
     "Sätze" schon in "Sätzen" und es entsteht "setsn". */
  UI_RX.unshift(
    [/^Schritt (\d+) von (\d+) · (.+)$/g,function(_,a,b,c){var m={"Über dich":"About you","Hauptübungen":"Main exercises","Krafttest":"Strength test","Rhythmus":"Rhythm","Startwert":"Starting score"};return "Step "+a+" of "+b+" · "+(m[c]||c);}],
    [/(\d+) von (\d+) Sätzen · tippen zum Weitermachen/g,"$1 of $2 sets · tap to continue"],
    [/(\d+) von (\d+) Sätzen/g,"$1 of $2 sets"],
    [/^(.+) läuft$/g,"$1 in progress"],
    [/^Übung (\d+) von (\d+) · neu · Pause (\d+) s$/g,"Exercise $1 of $2 · new · rest $3 s"],
    [/^Übung (\d+) von (\d+)/g,"Exercise $1 of $2"],
    [/^(\d+) Übungen anzeigen$/g,"Show $1 exercises"],
    [/^(\d+) Übungen$/g,"$1 exercises"],
    [/^(\d+) Übung$/g,"$1 exercise"],
    [/: (\d+) % Beanspruchung – allein in der Figur hervorheben$/g,": $1 % involvement – highlight alone on the figure"],
    [/^Beanspruchte Muskeln von (.+) gross anzeigen$/g,"Show muscles worked by $1 large"],
    [/^Beanspruchte Muskeln von (.+) anzeigen$/g,"Show muscles worked by $1"],
    [/: kein Training$/g,": no training"],
    [/^Diese Woche (\d+) von (\d+) Trainingstagen\.$/g,"This week $1 of $2 training days."],
    [/^Alles misst die letzten (\d+) Tage, die Muskelkarte die letzten (\d+)\. Eine gute Woche hebt den Wert, eine faule senkt ihn von allein – ohne Strafpunkte, das Fenster schiebt sich einfach weiter\.$/g,"Everything measures the last $1 days, the muscle map the last $2. A good week raises the score, a lazy one lowers it by itself – no penalty points, the window simply moves on."],
    [/^– sie messen, was du in den letzten (?:(\d+) )?Tagen? wirklich getan hast\. Nach zwei Wochen Eintragen sind sie aussagekräftig\.$/g,function(_,n){return "– they measure what you actually did in the last "+(n?n+" ":"")+"days. After two weeks of logging they're meaningful.";}],
    [/^Noch kein Wert in den letzten (\d+) Tagen\. Trag bei einer dieser Übungen einen schweren Satz ein, dann bekommt der Bereich eine Stufe\.$/g,"No value in the last $1 days. Log a heavy set of one of these exercises and the area gets a level."],
    [/^· nächste ab ([\d.,]+) kg$/g,"· next from $1 kg"],
    [/^(\d+) Äquivalentminuten$/g,"$1 equivalent minutes"],
    [/^auf dein Wochenziel von (\d+) min\.$/g,"towards your weekly goal of $1 min."],
    [/ · zu wenig · (\d+) mit Betonung hier$/g," · too little · $1 with emphasis here"],
    [/^seit (\d+) Tagen nichts gemacht$/g,"nothing done for $1 days"],
    [/^▬ stabil in (\d+) (?:Tagen|days)$/g,"▬ steady over $1 days"],
    [/^([▲▼] [+]?\d+) in (\d+) (?:Tagen|days)$/g,"$1 in $2 days"],
    [/(\d+) mit Betonung hier/g,"$1 with emphasis here"],
    [/^Nicht übertragen – wird wiederholt$/g,"Not synced – retrying"],
    [/^Lokaler Speicherstand war beschädigt – eine Kopie wurde gesichert$/g,"Local save data was damaged – a copy has been kept"],
    [/^Speichern fehlgeschlagen – Speicher voll oder eingeschränkt$/g,"Saving failed – storage full or restricted"],
    [/^Filter entfernen: (.+)$/g,function(_,f){return "Remove filter: "+(UI_EN[f]||f);}],
    // Rechenweg im Werte-Tab: mehrzeiliger Formeltext, Begriffe einzeln ersetzen.
    [/^Formwert = [\s\S]*$/g,function(all){
      var m=[["Formwert","Form score"],["Maximalkraft","Max strength"],["Konstanz","Consistency"],["Muskelabdeckung","Muscle coverage"],
        ["Ausdauer","Endurance"],["Mobilität","Mobility"],["der 6 Kraft-Bereiche","of the 6 strength areas"],
        ["je Bereich zählt die stärkste Übung","the strongest exercise counts per area"],["Trainingstage","Training days"],
        ["Sätze je Muskel gegen","Sets per muscle vs."],["WHO-Minuten","WHO minutes"],["VO2max-Perzentil","VO2max percentile"],
        ["Einheiten","Sessions"],["Wdh","reps"],["weich gemischt, aus dem besten Satz","smoothly blended, from the best set"],
        ["Figur","Figure"],["jetzt","now"],[/(\d+) T\b/g,"$1 d"]];
      for(var i=0;i<m.length;i++)all=typeof m[i][0]==="string"?all.split(m[i][0]).join(m[i][1]):all.replace(m[i][0],m[i][1]);
      return all;}]
  );
})();

function setLang(l){
  if(l!==LANG){
    LANG=l;
    if(state.profile)state.profile.lang=l;
    applyLangData();
    document.documentElement.setAttribute("lang",l);
    // Standbilder tragen Namen im Bild nicht, koennen also bleiben; die Auswahl wird
    // zurueckgesetzt, weil sie auf Regionsnamen zeigt.
    selReset();selSet=null;selFine=null;selLabel=null;selTapKey=null;
    persist();renderAll();
    applyUiLang(document.body);
  }
}
function T(k){
  var d=I18N[k];
  if(!d)return k;
  return (LANG==="en"&&d.en!=null)?d.en:d.de;
}
