/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: addWorkoutCardio() bis woAddPage()
*/

// Cardio hat keine Saetze zum Abhaken - der Datensatz existiert also sofort (nicht erst nach
// einem Haekchen), damit er wie ein Satz laufend in day(TODAY).cardio steht und beim Beenden
// des Trainings schon in der cardioMin-Summe (finishWorkout) auftaucht.
function addWorkoutCardio(ex){
  var rec={ex:ex.id,min:20,km:0,wid:workout.id};
  day(TODAY).cardio.push(rec);touch(TODAY);
  workout.exercises.push({ex:ex.id,cardioRec:rec});
  woPage=workout.exercises.length-1;
  saveWorkout();renderSession();
}

/* Anteil einer Übung an den einzelnen Muskeln – dieselbe Gewichtung, mit der die Sätze auch in
   die Wochenauslastung eingehen: Primärmuskel 1,0 · Sekundärmuskel 0,5 Sätze je Satz. */
/* Prozentuale Beanspruchung je Muskel: 100 % = der am staerksten beanspruchte Muskel
   dieser Uebung, alle anderen relativ dazu. Nur fuer Uebungen hinterlegt, die schon
   einzeln durchgegangen wurden - alle uebrigen behalten die grobe Primaer-/Sekundaer-
   Einteilung, damit nirgends eine Genauigkeit vorgetaeuscht wird, die es nicht gibt. */
/* Bezugsgroesse: 100 % = die beste verfuegbare Uebung FUER DIESEN MUSKEL - nicht der am
   staerksten beanspruchte Muskel dieser Uebung. Nur so sind die Werte ueber Uebungen hinweg
   vergleichbar und damit addierbar: "Kreuzheben -> Rueckenstrecker 100 %" heisst, es gibt
   keine bessere Rueckenstrecker-Uebung; "Quadrizeps 30 %" heisst, ein Satz Kreuzheben
   bringt dem Quadrizeps knapp ein Drittel dessen, was ein Satz Kniebeuge bringt.
   Folge davon: Eine Verbundübung sieht ausserhalb ihrer Spezialitaet bewusst schwach aus.
   Planungswerte auf Basis der EMG- und biomechanischen Literatur, keine Messwerte. */
var EX_PCT={
  // Kreuzheben, konventionell. Referenz je Muskel in Klammern.
  deadlift:{tg_rueck_strecker:65,    // gegen Rueckenstrecken (Hyperextension), das echte
                                     // dynamische Streckung ueber volle Amplitude bietet -
                                     // beim Kreuzheben haelt der Ruecken nur isometrisch
            tg_unterarm_beug:75,     // gegen schweres Halten (Farmer's Walk)
            tg_gesaess_haupt:70,     // gegen Hip Thrust
            tg_kniesehnen:60,        // nur Hueftstreckung, keine Kniebeugung (gegen Beinbeuger/Nordic)
            tg_rueck_trapez_ob:55,   // gegen Schulterheben
            tg_bauch_tief:50,        // starke Rumpfspannung, aber gegen Carries/Anti-Rotation
            tg_adduktoren:35,        // gegen Sumo/breite Kniebeuge
            tg_quadrizeps:30,        // gegen Kniebeuge
            tg_rueck_lat:25,         // nur isometrisch, gegen Klimmzug
            tg_rueck_teres_major:20,
            tg_wade_gastro:10,       // gegen Wadenheben
            tg_bizeps:8},            // reines Halten, gegen Curl
  // Brustpresse liegend an der Maschine (engl. Lever Lying Chest Press).
  machine_press_lying:{
            tg_brust_mitte:90,       // fast auf Hoehe des Kurzhantel-Bankdrueckens; die
                                     // gefuehrte Bahn erlaubt sicheres Arbeiten bis nah ans
                                     // Versagen, kostet aber etwas Dehnung am Umkehrpunkt
            tg_brust_unten:50,       // gegen Dips/Negativbankdruecken
            tg_brust_ober:45,        // gegen Schraegbankdruecken
            tg_trizeps_lat:45,       // Mitarbeit beim Druecken, gegen gezielte Trizepsuebung
            tg_schulter_vorn:45,     // gegen Schulterdruecken
            tg_trizeps_lang:20},     // im Druecken kaum gedehnt, gegen Ueberkopf-Trizeps
  // Schraegbankdruecken mit Kurzhanteln.
  bench_inc_db:{
            tg_brust_ober:100,       // die beste Uebung fuer die obere Brust - Kurzhanteln
                                     // geben mehr Weg und Dehnung als die Stange
            tg_brust_mitte:60,       // arbeitet deutlich mit, gegen flaches Bankdruecken
            tg_schulter_vorn:60,     // die Schraeglage fordert sie mehr als flach, gegen
                                     // Schulterdruecken bleibt aber Luft
            tg_trizeps_lat:40,       // gegen gezielte Trizepsuebung
            tg_brust_serratus:25,    // Schulterblatt-Stabilisierung beim freien Druecken
            tg_brust_unten:20,       // kaum beteiligt, gegen Dips
            tg_trizeps_lang:18},     // nicht gedehnt, gegen Ueberkopf-Trizeps
  // Klimmzuege Obergriff. Setzt die Referenz fuer den Latissimus.
  pullup:{  tg_rueck_lat:100,        // es gibt keine bessere Latissimus-Uebung
            tg_rueck_teres_major:90, // arbeitet mit dem Latissimus, gleiche Bewegung
            tg_unterarm_beug:70,     // Haengen am Griff, gegen schweres Halten
            tg_rueck_trapez_unt:55,  // zieht das Schulterblatt nach unten
            tg_bizeps:55,            // Obergriff, gegen Curl/Kammgriff
            tg_rueck_trapez_mit:45,  // Schulterblatt-Rueckzug am oberen Ende
            tg_rueck_rhomb:40,       // gegen waagerechtes Rudern
            tg_schulter_rot_infra:35,
            tg_schulter_rot_teres_min:35,
            tg_schulter_hint:30,
            tg_unterarm_streck:25},
  // Rudermaschine. Setzt die Referenz fuer mittleren Trapez und Rhomboiden: die
  // Brustauflage erzwingt sauberes Ziehen ohne Schwung.
  row_machine:{
            tg_rueck_trapez_mit:95,
            tg_rueck_rhomb:90,
            tg_rueck_lat:70,         // gut, aber senkrechtes Ziehen trifft ihn besser
            tg_schulter_hint:60,     // gegen Reverse Flys/Face Pulls
            tg_rueck_teres_major:55,
            tg_bizeps:55,
            tg_schulter_rot_infra:50,
            tg_schulter_rot_teres_min:50,
            tg_rueck_trapez_unt:45,
            tg_unterarm_beug:45,     // Griffe, aber kein Haengen am eigenen Gewicht
            tg_unterarm_streck:25},
  // Butterfly Maschine.
  fly_machine:{
            tg_brust_mitte:70,       // gute Dehnung, aber weniger Last als Druecken
            tg_brust_ober:40,
            tg_brust_unten:40,
            tg_schulter_vorn:25},
  // Schulterheben. Setzt die Referenz fuer den oberen Trapez.
  shrug:{   tg_rueck_trapez_ob:100,  // die gezielteste Uebung fuer den oberen Trapez
            tg_unterarm_beug:65,     // schweres Halten, gegen Farmer's Walk
            tg_nacken:30,
            tg_rueck_trapez_mit:30,
            tg_rueck_rhomb:25},
  // Dips. Setzt die Referenz fuer die untere Brust.
  dips:{    tg_brust_unten:100,      // keine Uebung trifft die untere Brust besser
            tg_trizeps_lat:75,       // stark beteiligt, gegen gezielte Trizepsuebung
            tg_brust_mitte:55,
            tg_schulter_vorn:45,
            tg_trizeps_lang:40,      // Oberarm hinter dem Rumpf, dadurch mehr gedehnt
            tg_brust_serratus:35},
  // Bankdruecken Langhantel. Der Klassiker, aber die Stange zwingt beide Arme auf eine
  // gemeinsame Bahn und erlaubt dadurch etwas weniger Dehnung am unteren Punkt als Kurzhanteln.
  bench:{   tg_brust_mitte:85,       // nahezu gleichwertig zur Kurzhantel, siehe dort
            tg_brust_ober:35,
            tg_brust_unten:35,
            tg_trizeps_lat:45,
            tg_schulter_vorn:40},
  // Bankdruecken Kurzhantel. Setzt die Referenz fuer die mittlere Brust: freie Fuehrung
  // erlaubt die tiefste Dehnung am unteren Punkt aller Druecken-Varianten.
  bench_db:{tg_brust_mitte:100,      // groesster Bewegungsradius aller Druecken-Varianten
            tg_brust_ober:35,
            tg_brust_unten:35,
            tg_trizeps_lat:45,
            tg_schulter_vorn:40,
            tg_brust_serratus:20},   // Schulterblaetter frei beweglich statt an der Stange fixiert
  // Schraegbankdruecken mit der Langhantel.
  bench_inc:{
            tg_brust_ober:80,        // gegen Schraegbankdruecken mit Kurzhanteln, das mehr
                                     // Weg und Dehnung bietet
            tg_schulter_vorn:55,
            tg_brust_mitte:50,
            tg_trizeps_lat:40},
  // Negativbankdruecken (Decline Bench).
  bench_dec:{
            tg_brust_unten:75,       // gegen Dips, die den unteren Anteil noch staerker dehnen
            tg_brust_mitte:45,
            tg_trizeps_lat:40},
  // Brustpresse Maschine, sitzend/aufrecht (nicht liegend). Kuerzerer Hebel und etwas
  // weniger Dehnung am unteren Punkt als die liegende Variante.
  machine_press:{
            tg_brust_mitte:75,       // gegen die liegende Maschine, die mehr Dehnung erlaubt
            tg_brust_ober:35,
            tg_brust_unten:35,
            tg_trizeps_lat:45,
            tg_schulter_vorn:40},
  // Liegestuetze. Koerpergewicht, aber mechanisch dem Bankdruecken sehr aehnlich.
  pushup:{  tg_brust_mitte:70,       // gegen Bankdruecken mit freien Gewichten, wo die Last
                                     // gezielt bis nah ans Versagen gesteigert werden kann
            tg_brust_serratus:30,    // Schulterblatt-Protraktion am oberen Punkt der Bewegung
            tg_trizeps_lat:40,
            tg_schulter_vorn:35,
            tg_brust_ober:30,
            tg_brust_unten:30,
            tg_bauch_gerade:15},     // haelt den Rumpf gerade, aber keine gezielte Bauchuebung
  // Diamant-Liegestuetze. Der enge Handstand verschiebt die Betonung Richtung Trizeps.
  pushup_diamond:{
            tg_trizeps_lat:65,       // gezielteste Trizeps-Druckvariante hier, aber gegen Dips
                                     // (Oberarm bleibt naeher am Koerper, weniger Dehnung) bleibt Luft
            tg_brust_mitte:45,
            tg_schulter_vorn:30},
  // Archer-Liegestuetze. Verschiebt fast das gesamte Koerpergewicht auf einen Arm.
  pushup_arch:{
            tg_brust_mitte:55,       // hohe Intensitaet pro Arm, aber schwer zu dosieren und
                                     // selten sauber bis ans echte Versagen gefuehrt
            tg_trizeps_lat:32,
            tg_schulter_vorn:28,
            tg_brust_ober:22,
            tg_brust_unten:22,
            tg_bauch_gerade:15},
  // Liegestuetze mit erhoehten Fuessen. Verschiebt den Winkel Richtung obere Brust.
  pushup_dec:{
            tg_brust_ober:60,        // gegen Schraegbankdruecken, das schwerer belastet werden kann
            tg_schulter_vorn:45,
            tg_brust_mitte:40,
            tg_trizeps_lat:35,
            tg_brust_serratus:20},
  // Fliegende mit Kurzhanteln. Reine Dehnuebung ohne Ellbogenstreckung; am oberen Punkt
  // zieht die Schwerkraft kaum noch an den Armen, dort geht Spannung verloren.
  fly_db:{  tg_brust_mitte:45,
            tg_brust_ober:22,
            tg_brust_unten:22,
            tg_schulter_vorn:15},
  // Kabelzug Fliegende. Wie Kurzhantel-Fliegende, aber der Zug haelt die Spannung auch am
  // Endpunkt der Bewegung aufrecht, wo die Kurzhantel sie verliert.
  cable_fly:{
            tg_brust_mitte:52,       // mehr Spannung ueber die ganze Bahn, gegen KH-Fliegende
            tg_brust_ober:25,
            tg_brust_unten:25,
            tg_schulter_vorn:15},
  // Ueberzuege (Pullover). Trainiert den Latissimus ueber Schulterstreckung in gedehnter
  // Position, aber mit deutlich weniger Last als ein Klimmzug moeglich ist.
  pullover:{
            tg_rueck_lat:22,         // gegen Klimmzug, der um ein Vielfaches schwerer wird
            tg_brust_mitte:35,
            tg_brust_unten:30,
            tg_trizeps_lang:20,
            tg_brust_serratus:18,
            tg_rueck_teres_major:15},
  // Klimmzuege Untergriff. Fast gleich zum Obergriff, aber die Supination bindet den
  // Bizeps deutlich staerker ein.
  chinup:{  tg_rueck_lat:95,         // minimal weniger Weite als Obergriff, dafuer mehr Bizeps
            tg_bizeps:75,            // Untergriff nimmt viel vom Bizeps mit, gegen gezielten Curl
            tg_rueck_teres_major:88,
            tg_rueck_trapez_unt:50,
            tg_unterarm_beug:65,
            tg_rueck_trapez_mit:42,
            tg_rueck_rhomb:38,
            tg_schulter_rot_infra:33,
            tg_schulter_rot_teres_min:33},
  // Klimmzuege weit. Der breite Griff verkuerzt den Weg im Ellbogen und nimmt dem Bizeps
  // Hebelwirkung, ohne die Brust in der Breite spuerbar mehr zu fordern.
  pullup_wide:{
            tg_rueck_lat:90,         // etwas weniger Weg als beim schulterbreiten Griff
            tg_rueck_teres_major:80,
            tg_rueck_trapez_unt:45,
            tg_rueck_trapez_mit:40,
            tg_bizeps:35,            // wenig Ellbogenbeugung noetig, gegen Klimmzug Untergriff
            tg_rueck_rhomb:35,
            tg_schulter_rot_infra:30,
            tg_schulter_rot_teres_min:30},
  // Klimmzuege mit Zusatzgewicht. Mechanisch identisch zum normalen Klimmzug, nur schwerer -
  // gleiche Verteilung.
  pullup_weight:{
            tg_rueck_lat:100,
            tg_rueck_teres_major:90,
            tg_bizeps:55,
            tg_rueck_trapez_unt:55,
            tg_rueck_trapez_mit:45,
            tg_rueck_rhomb:40,
            tg_schulter_rot_infra:35,
            tg_schulter_rot_teres_min:35},
  // Latzug. Guter Ersatz fuer Klimmzuege, aber die Fixierung am Sitz nimmt etwas von der
  // Stabilisationsarbeit, die den Klimmzug so wirksam macht.
  latpull:{ tg_rueck_lat:85,         // gegen Klimmzug, der den ganzen Koerper einbindet
            tg_rueck_teres_major:75,
            tg_bizeps:45,
            tg_rueck_rhomb:45,
            tg_rueck_trapez_mit:45,
            tg_rueck_trapez_unt:35,
            tg_schulter_rot_infra:30,
            tg_schulter_rot_teres_min:30},
  // Latzug enger Griff. Engerer, oft neutraler Griff verlaengert die Dehnung am oberen Punkt
  // und bindet mehr Bizeps ein als der breite Latzug.
  latpull_close:{
            tg_rueck_lat:88,
            tg_bizeps:60,
            tg_rueck_teres_major:78,
            tg_rueck_rhomb:45,
            tg_rueck_trapez_mit:45,
            tg_rueck_trapez_unt:35},
  // Negativ-Klimmzuege. Nur die exzentrische Phase - kein Zug nach oben, dafuer laenger
  // unter Spannung pro Wiederholung, aber ohne den konzentrischen Anteil insgesamt schwaecher.
  pullup_neg:{
            tg_rueck_lat:75,
            tg_rueck_teres_major:65,
            tg_unterarm_beug:60,
            tg_bizeps:40},
  // Passives Haengen. Setzt die Referenz fuer den Unterarm-Beuger: das gesamte Koerpergewicht
  // haengt ausschliesslich am Griff, laenger als es jede andere Uebung hier verlangt.
  deadhang:{tg_unterarm_beug:100,    // schwereres, laengeres Halten gibt es in diesem Katalog nicht
            tg_rueck_lat:15,         // rein passive Dehnung, keine aktive Kontraktion
            tg_rueck_trapez_unt:15,
            tg_rueck_teres_major:12,
            tg_rueck_rhomb:10},
  // Langhantel-Rudern, vorgebeugt. Freie Uebung, daher anfaellig fuer Schwung - gegen die
  // Rudermaschine mit ihrer Brustauflage bleibt Luft.
  row_bb:{  tg_rueck_rhomb:70,
            tg_rueck_trapez_mit:70,
            tg_rueck_lat:55,
            tg_bizeps:45,
            tg_schulter_hint:45,
            tg_rueck_teres_major:40,
            tg_rueck_strecker:30},   // haelt den vorgebeugten Ruecken isometrisch, gegen Kreuzheben
  // Kurzhantel-Rudern. Einarmig oder beidarmig mit Bankabstuetzung - etwas kontrollierter
  // als die Langhantel, aber ohne deren Maximallast.
  row_db:{  tg_rueck_rhomb:72,
            tg_rueck_trapez_mit:72,
            tg_rueck_lat:55,
            tg_bizeps:48,
            tg_schulter_hint:48,
            tg_rueck_teres_major:42},
  // Pendlay-Rudern. Jede Wiederholung startet vom Boden, ohne Dehnungsreflex - das erzwingt
  // strikte Technik und kommt der Rudermaschine am naechsten.
  row_pendlay:{
            tg_rueck_rhomb:85,
            tg_rueck_trapez_mit:85,
            tg_rueck_lat:55,
            tg_bizeps:42,
            tg_rueck_teres_major:38,
            tg_rueck_strecker:25},
  // T-Bar-Rudern. Meist im Stehen, damit etwas mehr Spielraum fuer Schwung als am
  // Pendlay- oder Maschinen-Rudern.
  row_tbar:{tg_rueck_rhomb:75,
            tg_rueck_trapez_mit:75,
            tg_rueck_lat:55,
            tg_bizeps:45,
            tg_schulter_hint:45,
            tg_rueck_teres_major:40},
  // Rudern am Kabelzug, sitzend. Die Fussstuetze bremst Schwung fast so gut wie eine
  // Brustauflage, deshalb nah an der Rudermaschine.
  row_cable:{
            tg_rueck_rhomb:78,
            tg_rueck_trapez_mit:80,
            tg_rueck_lat:55,
            tg_bizeps:45,
            tg_schulter_hint:48,
            tg_rueck_teres_major:40},
  // Australian Pull-ups (Inverted Rows). Koerpergewicht mit gutem Rueckzug der Schulterblaetter,
  // aber die Last laesst sich kaum ueber das eigene Gewicht hinaus steigern.
  row_inv:{ tg_rueck_rhomb:58,
            tg_rueck_trapez_mit:55,
            tg_rueck_lat:45,
            tg_schulter_hint:42,
            tg_bizeps:40,
            tg_rueck_teres_major:32},
  // Rudern mit Widerstandsband. Die Bandspannung waechst zum Ende der Bewegung, ist aber
  // insgesamt kaum progressiv steigerbar - die schwaechste Rudervariante hier.
  row_band:{tg_rueck_rhomb:45,
            tg_rueck_trapez_mit:40,
            tg_rueck_lat:35,
            tg_schulter_hint:35,
            tg_bizeps:30,
            tg_rueck_teres_major:25},
  // Face Pulls. Setzt die Referenz fuer die Rotatorenmanschette - der Zug zum Gesicht mit
  // hohen Ellbogen dreht aktiv nach aussen. Fuer den hinteren Deltamuskel selbst siehe
  // Reverse Flys weiter unten, die dort minimal isolierter arbeiten.
  facepull:{tg_schulter_hint:90,
            tg_schulter_rot_infra:55,  // gezielteste Aussenrotation hier im Katalog
            tg_schulter_rot_teres_min:55,
            tg_rueck_trapez_unt:40,
            tg_rueck_rhomb:35,
            tg_rueck_trapez_mit:35},
  // Schulterheben Kurzhantel. Freiere Bahn als die Langhantel, aber seitlich am Koerper
  // schwerer maximal zu belasten.
  shrug_db:{tg_rueck_trapez_ob:85,   // gegen Langhantel-Schulterheben, das mehr Last erlaubt
            tg_unterarm_beug:55,
            tg_nacken:25,
            tg_rueck_rhomb:20},
  // Schulterdruecken Langhantel. Setzt die Referenz fuer den vorderen Deltamuskel: die
  // vertikale Druckbahn ohne Ausweichmoeglichkeit trifft ihn direkter als jede Druckvariante
  // aus der Brust-Familie.
  ohp:{     tg_schulter_vorn:100,
            tg_schulter_seit:55,     // deutliche Mitarbeit, aber gegen gezieltes Seitheben
            tg_trizeps_lat:50,       // lange Ellbogenstreckung im Lockout
            tg_brust_serratus:30},
  // Schulterdruecken Kurzhantel. Nahezu gleichwertig zur Langhantel.
  ohp_db:{  tg_schulter_vorn:98,
            tg_schulter_seit:55,
            tg_trizeps_lat:50,
            tg_brust_serratus:30},
  // Push Press. Der Beinschwung nimmt der Schulter einen Teil der Arbeit ab, obwohl die
  // bewegte Last hoeher ist als beim strengen Druecken.
  push_press:{
            tg_schulter_vorn:65,
            tg_trizeps_lat:45,
            tg_brust_serratus:25,
            tg_quadrizeps:20,        // kurzer Dip-and-Drive, keine gezielte Beinuebung
            tg_bauch_gerade:15},
  // Arnold-Drücken. Die Rotation waehrend der Bewegung bindet den seitlichen Delt staerker
  // ein als das gerade Druecken, kostet dafuer etwas durchgehende Spannung vorne.
  arnold:{  tg_schulter_vorn:85,
            tg_schulter_seit:55,
            tg_trizeps_lat:45},
  // Pike-Liegestütze. Koerpergewicht in Klappmesser-Position, moderate Ueberkopf-Intensitaet.
  pike_pushup:{
            tg_schulter_vorn:55,
            tg_trizeps_lat:35,
            tg_schulter_seit:30,
            tg_brust_serratus:20},
  // Handstand-Liegestütze. Fast das komplette Koerpergewicht ueber Kopf - hohe Intensitaet,
  // aber schwerer sauber zu dosieren und zu steigern als freie Gewichte.
  hspu:{    tg_schulter_vorn:80,
            tg_trizeps_lat:65,
            tg_schulter_seit:40,
            tg_brust_serratus:30,
            tg_rueck_trapez_ob:25},
  // Wand-Handstand halten. Isometrisch - haelt die Position, ohne die Muskulatur durch den
  // vollen Bewegungsweg zu fordern.
  handstand:{
            tg_schulter_vorn:40,
            tg_schulter_seit:35,
            tg_trizeps_lat:25,
            tg_brust_serratus:20,
            tg_bauch_gerade:20},
  // Seitheben Kurzhantel.
  lateral:{ tg_schulter_seit:90,     // gegen die Kabelvariante, die auch unten Spannung haelt
            tg_rueck_trapez_ob:15},
  // Seitheben Kabelzug. Setzt die Referenz fuer den seitlichen Deltamuskel: der Zug haelt
  // auch am unteren Punkt Spannung, wo die Kurzhantel sie durch die Schwerkraft verliert.
  lateral_cable:{
            tg_schulter_seit:100},
  // Aufrechtes Rudern. Trifft seitlichen Delt und oberen Trapez gemeinsam, aber weniger
  // isoliert als die gezielten Einzeluebungen fuer jeden von beiden.
  upright_row:{
            tg_schulter_seit:55,
            tg_rueck_trapez_ob:45,
            tg_bizeps:30,
            tg_rueck_rhomb:25,
            tg_nacken:20},
  // Cuban Press. Kombiniert Aussenrotation mit Druecken - trifft die Rotatorenmanschette
  // fast so gezielt wie Face Pulls, den hinteren Delt aber weniger pur als Reverse Flys.
  cuban:{   tg_schulter_hint:55,
            tg_schulter_rot_infra:50,
            tg_schulter_rot_teres_min:50,
            tg_schulter_seit:35,
            tg_rueck_trapez_mit:30},
  // Reverse Flys. Setzt die Referenz fuer den hinteren Deltamuskel: reine Abduktion im
  // Schultergelenk, ohne dass Rudern oder Face Pulls noch andere Muskeln mittragen muessen.
  reversefly:{
            tg_schulter_hint:100,
            tg_schulter_rot_infra:45,
            tg_schulter_rot_teres_min:45,
            tg_rueck_trapez_unt:40,
            tg_rueck_rhomb:40,
            tg_rueck_trapez_mit:40},
  // Band Pull-Apart. Wie Reverse Flys, aber die Bandspannung laesst sich kaum ueber leichte
  // Lasten hinaus steigern - eher Aufwaerm- und Ergaenzungsuebung.
  bandpullapart:{
            tg_schulter_hint:35,
            tg_rueck_rhomb:28,
            tg_rueck_trapez_mit:25,
            tg_rueck_trapez_unt:25,
            tg_schulter_rot_infra:30,
            tg_schulter_rot_teres_min:30},
  // Innenrotation am Kabelzug. Einzige Uebung, die den Subscapularis gezielt isoliert -
  // setzt damit zwangslaeufig die Referenz (100%). Die Brust wirkt bei der Innenrotation
  // nur schwach unterstuetzend mit.
  rot_internal:{
            tg_schulter_rot_sub:100,
            tg_brust_mitte:15},
  // Empty-Can-Raise. Die Armhaltung (Daumen nach unten, in der Skapularebene) isoliert den
  // Supraspinatus so gezielt wie sonst keine Katalog-Uebung - Referenz. Der seitliche Delt
  // uebernimmt oberhalb der ersten 30 Grad einen spuerbaren Anteil.
  emptycan:{
            tg_schulter_rot_supra:100,
            tg_schulter_seit:40},
  // Schrägbank-Curls. Der Arm haengt hinter dem Rumpf - das dehnt den Bizeps am unteren
  // Punkt staerker als jede andere Curl-Variante. Setzt die Referenz.
  curl_incline:{
            tg_bizeps:100,
            tg_unterarm_beug:25},
  // Scott-Curls (Preacher Curls). Die Bank fixiert den Oberarm und schliesst Schwung aus,
  // begrenzt aber den Winkel hinter dem Rumpf - etwas weniger Dehnung als frei haengend.
  curl_preacher:{
            tg_bizeps:90,
            tg_unterarm_beug:20},
  // Scott-Curls an der Maschine. Gleiche Fixierung des Oberarms wie am Scott-Pult,
  // die Maschine fuehrt nur die Bewegungsbahn - biomechanisch identisch zur
  // Langhantel-Variante.
  curl_preacher_machine:{
            tg_bizeps:90,
            tg_unterarm_beug:20},
  // Curls am Kabelzug. Haelt Spannung auch am oberen Punkt, wo Lang- und Kurzhantel sie
  // durch die Schwerkraft verlieren.
  curl_cable:{
            tg_bizeps:85,
            tg_unterarm_streck:25,
            tg_unterarm_beug:30},
  // Liegende Curls am Kabelzug. Gleicher gleichmaessiger Kabelwiderstand, aber ohne
  // Handgelenksarbeit gegen die Stange (kein Unterarmstrecker-Anteil).
  curl_cable_lying:{
            tg_bizeps:85,
            tg_unterarm_beug:30},
  // Kurzhantel-Curls. Freie Supination erlaubt etwas mehr Bizeps-Kontraktion am oberen
  // Punkt als die Langhantel.
  curl_db:{ tg_bizeps:78,
            tg_unterarm_streck:25,
            tg_unterarm_beug:30},
  // Langhantel-Curls. Der Klassiker, aber die feste Stange erzwingt eine Kompromiss-Drehung
  // der Handgelenke und erlaubt etwas mehr Schwung als die gefuehrten Varianten.
  curl_bb:{ tg_bizeps:75,
            tg_unterarm_streck:25,
            tg_unterarm_beug:30},
  // Hammer-Curls. Der neutrale Griff nimmt dem Bizeps Kontraktionskraft, setzt dafuer die
  // Referenz fuer den Musculus brachioradialis - kein anderer Griff belastet ihn so gezielt.
  curl_hammer:{
            tg_unterarm_streck:100,
            tg_bizeps:55,
            tg_unterarm_beug:40},
  // Trizepsdrücken am Kabelzug. Setzt die Referenz fuer den lateralen Trizepskopf: reine
  // Isolation mit durchgehender Spannung ueber die ganze Bahn.
  tri_push:{tg_trizeps_lat:100},
  // Trizeps über Kopf (Kurzhantel, ein- oder beidarmig). Die Schulterbeugung dehnt den
  // langen Trizepskopf staerker als jede andere Variante - setzt dafuer die Referenz.
  tri_over:{tg_trizeps_lang:100},
  // French Press (Skull Crusher), liegend. Guter langer Kopf, aber die Schulter bleibt nah
  // am Rumpf statt ueber Kopf gestreckt - etwas weniger Dehnung als Trizeps ueber Kopf.
  tri_skull:{tg_trizeps_lang:85},
  // Trizeps-Kickbacks. Die Spannung sitzt fast nur am Ende der Streckung, am Anfang der
  // Bewegung traegt die Schwerkraft kaum bei - eine der schwaecheren Isolationsuebungen.
  tri_kick:{tg_trizeps_lat:35},
  // Bankdips. Fuesse und Haende abgestuetzt statt frei haengend wie bei echten Dips - das
  // verkuerzt den Weg und begrenzt, wie viel Zusatzgewicht sich sauber anhaengen laesst.
  dips_bench:{
            tg_trizeps_lat:60,
            tg_brust_unten:40,
            tg_schulter_vorn:35},
  // Hängen zur Dekompression. Bewusst entspannt statt unter Spannung gehalten - noch
  // deutlich sanfter als das Passive Hängen, das schon fast ohne Muskelarbeit auskommt.
  // Zaehlt ohnehin nicht zum Trainingsvolumen (mob:true), bekommt aber trotzdem einen
  // realistischen Wert, damit es in der Übungsliste nicht faelschlich ganz oben landet.
  mob_deadhang:{
            tg_rueck_lat:8,
            tg_unterarm_beug:10,
            tg_rueck_trapez_unt:8,
            tg_rueck_teres_major:6},
  // Bauchroller (Ab Wheel Rollout). Setzt die Referenz fuer die gerade Bauchmuskulatur: der
  // lange Hebel unter exzentrischer Kontrolle gilt als eine der wirksamsten Bauchuebungen
  // ueberhaupt, mehr Zug als jede Crunch-Variante.
  abwheel:{ tg_bauch_gerade:100,
            tg_rueck_strecker:35,   // bremst das Durchhaengen im unteren Ruecken
            tg_brust_serratus:20,
            tg_rueck_lat:15,        // haelt den Oberkoerper stabil, keine gezielte Ruecken-Uebung
            tg_rueck_teres_major:10},
  // Dragon Flag. Fast so fordernd wie die Bauchrolle - der ganze Koerper wirkt als Hebel,
  // nur schwerer in feinen Schritten zu steigern.
  dragonflag:{
            tg_bauch_gerade:95,
            tg_bauch_schraeg:40,
            tg_rueck_lat:20,
            tg_rueck_teres_major:15},
  // Crunch am Kabelzug. Geführte, ladbare Bewegung mit vollem Bewegungsweg - deutlich mehr
  // Widerstand steigerbar als bei jeder Koerpergewichts-Variante.
  cablecrunch:{
            tg_bauch_gerade:90,
            tg_bauch_schraeg:30},
  // Beinheben hängend. Das Koerpergewicht der gestreckten Beine als langer Hebel trifft vor
  // allem den unteren Anteil der geraden Bauchmuskulatur.
  legraise:{tg_bauch_gerade:70,
            tg_bauch_schraeg:35,
            tg_unterarm_beug:20,
            tg_huefte:55},
  // Russian Twist. Dynamische Rotation gegen Widerstand, aber nur mit Koerpergewicht/leichtem
  // Zusatzgewicht steigerbar - die Torso-Maschine (siehe unten) bietet mehr kontrollierten,
  // progressiv steigerbaren Widerstand ueber dieselbe Bewegung und ist jetzt die Referenz.
  russian:{ tg_bauch_schraeg:85,
            tg_bauch_gerade:45},
  // Pallof Press. Anti-Rotation statt Rotation - haelt die Spannung isometrisch, ohne die
  // Wirbelsaeule selbst zu drehen, kommt aber nicht ganz an die dynamische Belastung heran.
  pallof:{  tg_bauch_schraeg:75,
            tg_bauch_gerade:30},
  // Rotierende Torso Maschine. Setzt jetzt die Referenz fuer die schraege Bauchmuskulatur:
  // gefuehrter, ladbarer Widerstand direkt gegen die Rotation ueber die volle Amplitude -
  // progressiv steigerbar wie keine Koerpergewichts-Variante.
  torso_rot:{
            tg_bauch_schraeg:100,
            tg_bauch_gerade:25},
  // Einbeiniges Balancieren. Staendige kleine Stabilisationsarbeit ueber sechs Muskeln
  // gleichzeitig (Sprunggelenk, Huefte, Oberschenkel) - aber bei keinem davon so konzentriert
  // wie eine dedizierte Uebung dafuer, darum ueberall deutlich unter der jeweiligen Referenz.
  balance_sl:{
            tg_gesaess_med:35,
            tg_gesaess_min:30,
            tg_wade_fussheber:30,
            tg_wade_gastro:25,
            tg_quadrizeps:20,
            tg_wade_soleus:20},
  // Knieheben hängend. Wie das Beinheben, aber der kürzere Hebel durch die gebeugten Knie
  // nimmt der geraden Bauchmuskulatur einen Teil der Last.
  kneeraise:{
            tg_bauch_gerade:55,
            tg_bauch_schraeg:25,
            tg_huefte:40},
  // Crunches. Kurzer Bewegungsweg, kaum ueber das eigene Koerpergewicht hinaus steigerbar.
  crunch:{  tg_bauch_gerade:55},
  // Unterarmstütz (Plank). Setzt die Referenz fuer die tiefe Rumpfmuskulatur: isometrisches
  // Halten der Spannung ist genau die Aufgabe dieser Muskeln.
  plank:{   tg_bauch_tief:100,
            tg_bauch_gerade:45,
            tg_bauch_schraeg:25,
            tg_rueck_strecker:25},
  // Sit-ups. Volle Rumpfbeuge, aber die Hüftbeuger übernehmen einen guten Teil der Arbeit
  // von der geraden Bauchmuskulatur.
  situp:{   tg_bauch_gerade:50,
            tg_bauch_schraeg:25},
  // Seitstütz (Side Plank). Isometrisch und nur mit dem eigenen Koerpergewicht zu steigern.
  sideplank:{
            tg_bauch_schraeg:55,
            tg_bauch_gerade:25},
  // Dead Bug. Kontrolliert und Rumpf-stabilisierend, aber mit wenig äußerem Widerstand.
  deadbug:{ tg_bauch_gerade:40,
            tg_bauch_schraeg:20},
  // ===== Cardio (Ausdauer statt Kraft - insgesamt geringere Reizhoehe pro Muskel, aber
  //        fuer die Feinfilter-Sortierung innerhalb der Cardio-Kachel trotzdem gebraucht) =====
  // Intervalllaufen. Setzt die Referenz fuer den Schienbeinmuskel: die hohe Schrittfrequenz
  // verlangt die schnellste und haeufigste Fussheber-Kontrolle im ganzen Katalog.
  run_interval:{
            tg_wade_fussheber:100,
            tg_wade_gastro:42,
            tg_quadrizeps:38,
            tg_gesaess_haupt:28,
            tg_kniesehnen:20},
  // Laufen (gleichmaessiges Tempo). Gleiche Muskeln wie Intervalllaufen, aber weniger
  // Schrittfrequenz und Bodenkontaktkraft.
  run:{     tg_wade_fussheber:80,
            tg_wade_gastro:35,
            tg_quadrizeps:30,
            tg_gesaess_haupt:20,
            tg_kniesehnen:15},
  // Seilspringen. Wiederholtes schnelles Abfedern - bringt die Wade nah an die
  // Referenzuebung (Wadenheben stehend) heran, mehr als jede andere Cardio-Form hier.
  jumprope:{tg_wade_gastro:55,
            tg_wade_fussheber:60,
            tg_quadrizeps:15},
  // Treppenlauf. Staendiges Anheben des Koerpergewichts pro Stufe - mehr Quadrizeps- und
  // Gesaessarbeit als Wandern oder normales Gehen.
  stairs:{  tg_quadrizeps:40,
            tg_gesaess_haupt:30,
            tg_wade_gastro:30,
            tg_wade_fussheber:35},
  // Fußball / Ballsport. Sprints, Antritte und Schuesse - deutliche Bein- und
  // Gesaessbeteiligung, aber unregelmaessig statt konstant wie reines Ausdauertraining.
  football:{tg_quadrizeps:35,
            tg_wade_gastro:30,
            tg_kniesehnen:25,
            tg_gesaess_haupt:25},
  // Wandern. Unebenes/ansteigendes Gelaende fordert Quadrizeps, Gesaess und Wade mehr als
  // zuegiges Gehen auf flachem Untergrund.
  hike:{    tg_quadrizeps:30,
            tg_gesaess_haupt:25,
            tg_wade_gastro:25,
            tg_wade_fussheber:40},
  // Rudergerät. Kombiniert Beinantritt mit einer echten Ruderzugbewegung - trifft Ruecken und
  // Bizeps spuerbar, aber mit weniger Last und Kontrolle als die gezielte Ruder-Maschine.
  row_erg:{ tg_rueck_rhomb:55,
            tg_rueck_trapez_mit:55,
            tg_rueck_lat:45,
            tg_rueck_teres_major:40,
            tg_quadrizeps:25,
            tg_bizeps:25,
            tg_kniesehnen:15},
  // Schwimmen (Kraul/Freistil). Der Armzug beansprucht den Latissimus deutlich, dazu
  // konstante Schulterarbeit beim Ausholen - insgesamt der oberkoerperlastigste Cardio-Reiz.
  swim:{    tg_rueck_lat:55,
            tg_schulter_vorn:40,
            tg_rueck_rhomb:35,
            tg_rueck_trapez_mit:35,
            tg_rueck_teres_major:35,
            tg_quadrizeps:15},
  // Radfahren. Fast reine Quadrizeps-Ausdauerarbeit, Gesaess und Wade nur am oberen bzw.
  // unteren Punkt des Tritts mit dabei.
  bike:{    tg_quadrizeps:35,
            tg_gesaess_haupt:15,
            tg_wade_gastro:12},
  // Crosstrainer. Aehnlich wie Radfahren, aber durch die Armbewegung minimal weniger
  // Quadrizeps-fokussiert.
  elliptical:{
            tg_quadrizeps:25,
            tg_gesaess_haupt:15,
            tg_wade_gastro:12},
  // Zügiges Gehen. Deutlich geringere Belastung als Laufen - gleiche Muskeln, viel sanfter.
  walk:{    tg_wade_fussheber:30,
            tg_quadrizeps:15,
            tg_wade_gastro:15,
            tg_gesaess_haupt:12},
  // Burpees. Kurzer Liegestuetz- und Strecksprung-Wechsel - von allem etwas, aber durch das
  // hohe Tempo nichts davon so gezielt wie eine dedizierte Kraftuebung.
  burpee:{  tg_bauch_gerade:20,
            tg_quadrizeps:20,
            tg_brust_mitte:15,
            tg_schulter_vorn:15},
  // ===== Beine: Kniebeuge- und Kniestreck-Familie =====
  // Beinstrecker. Setzt die Referenz fuer den Quadrizeps: reine Isolation ohne jede
  // Mitarbeit der Hueftstrecker, ueber die volle Kniestreckung hinweg unter Spannung.
  legext:{  tg_quadrizeps:100},
  // Hackenschmidt-Kniebeuge. Die gefuehrte, nach hinten geneigte Bahn nimmt dem Rumpf die
  // Stabilisierung ab und verlagert fast alles auf den Quadrizeps.
  hacksquat:{
            tg_quadrizeps:90,
            tg_gesaess_haupt:30},
  // Beinpresse. Aehnlich isoliert wie Hackenschmidt, aber der groessere Hüftwinkel-Bereich
  // nimmt die Gesaessmuskulatur staerker mit.
  legpress:{
            tg_quadrizeps:80,
            tg_gesaess_haupt:45,
            tg_kniesehnen:20,
            tg_adduktoren:25},
  // Frontkniebeuge. Die aufrechte Haltung verlangt mehr vom Quadrizeps und weniger von der
  // Hueftstreckung als die Kniebeuge mit Langhantel im Nacken.
  squat_front:{
            tg_quadrizeps:80,
            tg_gesaess_haupt:35,
            tg_bauch_gerade:25,      // haelt den Oberkoerper gegen die Frontlast aufrecht
            tg_rueck_trapez_ob:20},  // traegt die Stange in der Frontablage
  // Kniebeuge mit Langhantel. Der Klassiker - Quadrizeps und Gesaess praktisch gleich
  // gefordert, dazu deutliche Mitarbeit von Ruecken, Beinbeugern, Adduktoren und Rumpf.
  squat:{   tg_quadrizeps:75,
            tg_gesaess_haupt:60,
            tg_rueck_strecker:30,    // haelt die Wirbelsaeule unter der Last neutral
            tg_kniesehnen:25,
            tg_adduktoren:30,
            tg_bauch_tief:30},
  // Bulgarian Split Squat. Einbeinig mit Zusatzgewicht - fast so viel Last pro Bein wie die
  // beidbeinige Kniebeuge, dazu deutlich mehr Ausgleichsarbeit vom Gesaess medius.
  squat_bulg:{
            tg_quadrizeps:65,
            tg_gesaess_haupt:55,
            tg_adduktoren:25,
            tg_kniesehnen:20,
            tg_gesaess_med:40},      // haelt das Becken einbeinig stabil
  // Ausfallschritte gehend. Minimal mehr Balancearbeit als der stehende Ausfallschritt durch
  // den staendigen Übergang zwischen den Schritten.
  lunge_walk:{
            tg_quadrizeps:60,
            tg_gesaess_haupt:52,
            tg_kniesehnen:22,
            tg_adduktoren:25,
            tg_gesaess_med:42},
  // Ausfallschritte mit Kurzhantel. Einbeinig, moderates Zusatzgewicht.
  lunge:{   tg_quadrizeps:60,
            tg_gesaess_haupt:50,
            tg_kniesehnen:20,
            tg_adduktoren:25,
            tg_gesaess_med:40},
  // Pistol Squat. Nur Koerpergewicht, aber einbeinig durch die volle Amplitude - fordert
  // durch den fehlenden Ausgleich des zweiten Beins deutlich mehr als eine normale Kniebeuge.
  squat_pistol:{
            tg_quadrizeps:55,
            tg_gesaess_haupt:40,
            tg_adduktoren:20,
            tg_bauch_gerade:15,      // haelt den Oberkoerper im Gleichgewicht
            tg_gesaess_med:35},
  // Step-ups mit Kurzhantel. Einbeiniger Antritt nach oben, dazu Zusatzgewicht.
  stepup:{  tg_quadrizeps:55,
            tg_gesaess_haupt:48,
            tg_kniesehnen:18,
            tg_wade_gastro:15,       // Abdruck der oberen Fussspitze auf der Stufe
            tg_bauch_gerade:12,
            tg_gesaess_med:38},
  // Sissy Squat. Reine Kniestreckung mit Koerpergewicht, aber die Hebelverhaeltnisse machen
  // sie ueberraschend intensiv fuer den Quadrizeps.
  sissy:{   tg_quadrizeps:50,
            tg_bauch_gerade:15},
  // Goblet-Kniebeuge. Leichtes Einsteiger-Geraet - trainiert Technik mehr als Kraft.
  squat_goblet:{
            tg_quadrizeps:45,
            tg_gesaess_haupt:35,
            tg_bauch_gerade:15,
            tg_adduktoren:20},       // die gedrehte Kniefuehrung in der Grifthaltung
  // Step-ups ohne Gewicht. Gleiche Bewegung wie mit Kurzhantel, aber ohne Zusatzlast.
  stepup_bw:{
            tg_quadrizeps:35,
            tg_gesaess_haupt:30,
            tg_kniesehnen:12,
            tg_wade_gastro:12,
            tg_bauch_gerade:10,
            tg_gesaess_med:25},
  // Wandsitzen. Rein isometrisch - haelt Spannung, ohne die Muskulatur durch Bewegung zu
  // ueberladen.
  wallsit:{ tg_quadrizeps:35,
            tg_gesaess_haupt:15},
  // Kniebeuge ohne Gewicht. Nur das eigene Koerpergewicht als Widerstand.
  squat_bw:{tg_quadrizeps:30,
            tg_gesaess_haupt:25,
            tg_adduktoren:12},

  // ===== Beine: Hueftstreck- und Beinbeuger-Familie =====
  // Hip Thrust. Setzt die Referenz fuer das grosse Gesaess: die groesste Amplitude in reiner
  // Hueftstreckung mit voller Kontrolle ueber die Last, ohne dass die Beine mittragen muessen.
  hipthrust:{
            tg_gesaess_haupt:100,
            tg_kniesehnen:20},
  // Rueckenstrecken (Hyperextension). Setzt die Referenz fuer den Rueckenstrecker (siehe
  // Korrektur oben bei Kreuzheben).
  backext:{ tg_rueck_strecker:100,
            tg_gesaess_haupt:30,
            tg_kniesehnen:20},
  // Nordic Curl. Setzt die Referenz fuer die Beinbeuger: exzentrische Kontrolle des ganzen
  // Koerpergewichts ueber die volle Kniestreckung - keine Maschine verlangt das so gezielt.
  nordic:{  tg_kniesehnen:100,
            tg_gesaess_haupt:15},
  // Beinbeuger an der Maschine. Fast so gezielt wie Nordic Curl, dafuer mit sauber
  // steigerbarem Zusatzgewicht statt reiner Koerpergewichts-Exzentrik.
  legcurl:{ tg_kniesehnen:90,
            tg_wade_soleus:15},      // Wade unterstuetzt am Ende der Kniebeugung mit
  // Rumaenisches Kreuzheben. Der laengste, am staerksten gedehnte Reiz fuer die Beinbeuger
  // unter schwerer Last, den es in diesem Katalog gibt.
  deadlift_rdl:{
            tg_kniesehnen:85,
            tg_gesaess_haupt:55,
            tg_rueck_strecker:40,
            tg_unterarm_beug:55,     // schweres Halten, aber leichter als klassisches Kreuzheben
            tg_bauch_tief:35},
  // Sumo-Kreuzheben. Der breite Stand und aufrechtere Ruecken verschieben die Arbeit staerker
  // auf Gesaess und Adduktoren, dafuer etwas weniger Ruecken und Beinbeuger als konventionell.
  deadlift_sumo:{
            tg_gesaess_haupt:75,
            tg_quadrizeps:40,
            tg_kniesehnen:45,
            tg_rueck_strecker:35,
            tg_adduktoren:55,        // die breite Fussstellung fordert sie deutlich mehr
            tg_bauch_tief:35},
  // Good Morning. Reiner Hueftschwung mit Langhantel im Nacken - viel Ruecken- und
  // Beinbeugerarbeit, aber weniger Gesaessbeteiligung als ein echter Hip Thrust.
  goodmorning:{
            tg_kniesehnen:45,
            tg_rueck_strecker:65,
            tg_gesaess_haupt:35},
  // Kettlebell Swing. Ballistischer Hueftschwung - guter Reiz fuer Gesaess und Beinbeuger,
  // aber die Schwungbewegung liefert weniger kontrollierte Spannung als schwere Grundlagen.
  kb_swing:{tg_gesaess_haupt:45,
            tg_kniesehnen:35,
            tg_rueck_strecker:25,    // haelt den Ruecken flach waehrend des Schwungs
            tg_schulter_vorn:10,     // Schwungmoment der Arme
            tg_bauch_tief:30},
  // Einbeiniges Kreuzheben. Wie RDL, aber einbeinig - weniger Last moeglich, dafuer mehr
  // Ausgleichsarbeit von Rumpf und Gesaess medius.
  deadlift_sl:{
            tg_kniesehnen:55,
            tg_gesaess_haupt:40,
            tg_rueck_strecker:30,
            tg_bauch_schraeg:30,     // verhindert das Verdrehen des Beckens einbeinig
            tg_gesaess_med:40},
  // Beckenheben. Die Koerpergewichts-Vorstufe zum Hip Thrust - kuerzere Amplitude, keine
  // erhoehte Schulterablage.
  gluteBridge:{
            tg_gesaess_haupt:45,
            tg_kniesehnen:15},

  // ===== Beine: Gesaess medius/minimus, Adduktoren, Waden =====
  // Abduktoren-Maschine. Setzt die Referenz fuer Gesaess medius/minimus: gefuehrte Bahn mit
  // sauber steigerbarem Widerstand ueber die volle Abduktion.
  abduct:{  tg_gesaess_med:100,
            tg_gesaess_min:85},
  // Adduktoren-Maschine. Setzt die Referenz fuer die Adduktoren aus dem gleichen Grund.
  adduct:{  tg_adduktoren:100},
  // Hueftbeugen am Kabelzug. Einzige Uebung im Katalog, die den Hueftbeuger als Hauptbewegung
  // isoliert (die haengenden Bein-/Knieheben belasten ihn nur sekundaer) - Referenz. Die
  // gerade Bauchmuskulatur stabilisiert das Becken waehrend der Bewegung mit.
  hipflex_cable:{
            tg_huefte:100,
            tg_bauch_gerade:20},
  // Wadenheben stehend. Setzt die Referenz fuer den Gastrocnemius: gestrecktes Knie nimmt
  // den zweigelenkigen Wadenmuskel ueber die volle Dehnung mit.
  calf_stand:{
            tg_wade_gastro:100},
  // Wadenheben sitzend. Setzt die Referenz fuer den Soleus: das gebeugte Knie schaltet den
  // Gastrocnemius weitgehend aus und isoliert den darunterliegenden Muskel.
  calf_seat:{
            tg_wade_soleus:100},
  // Copenhagen Plank. Seitliche Stuetzposition mit dem oberen Bein auf einer Bank - eine der
  // intensivsten Koerpergewichts-Uebungen fuer die Adduktoren.
  copenhagen:{
            tg_adduktoren:55,
            tg_bauch_schraeg:30},
  // Seitliches Beinheben. Freies Bein gegen die Schwerkraft - mehr Bewegungsreiz als
  // Clamshells, aber ohne Zusatzwiderstand.
  sidelying_raise:{
            tg_gesaess_med:45,
            tg_gesaess_min:35,
            tg_rueck_strecker:15,    // stabilisiert das Becken in Seitlage
            tg_bauch_schraeg:15},
  // Seitliches Bandgehen. Staendige Spannung durch das Band waehrend der Bewegung, dazu
  // Standbein-Stabilisierung.
  bandwalk_lat:{
            tg_gesaess_med:40,
            tg_gesaess_min:30,
            tg_quadrizeps:10,
            tg_adduktoren:15,
            tg_bauch_gerade:10},
  // Wadenheben Koerpergewicht. Gleiche Bewegung wie stehend an der Maschine, aber ohne
  // Zusatzgewicht limitiert.
  calf_bw:{ tg_wade_gastro:35},
  // Clamshells. Kleine Amplitude, meist nur Koerpergewicht oder leichtes Band - die sanfteste
  // Uebung in dieser Gruppe.
  clamshell:{
            tg_gesaess_med:35,
            tg_gesaess_min:30,
            tg_bauch_schraeg:10},

  // ===== Rumpf-Restposten: statische Halteuebungen mit Mitarbeit anderer Muskeln =====
  // Hollow Body Hold. Isometrisch, etwas mehr gerade Bauchspannung als der L-Sit, aber ohne
  // dessen zusaetzliche Schulter- und Trizepsarbeit.
  hollow:{  tg_bauch_gerade:60,
            tg_quadrizeps:10},       // gestreckte Beine werden angehoben gehalten
  // L-Sit. Haelt den Rumpf gebeugt in der Luft - fordert nebenbei die gestreckten Beine,
  // die stuetzenden Trizeps und die nach unten gedrueckten Schultern deutlich mit.
  lsit:{    tg_bauch_gerade:55,
            tg_schulter_vorn:25,     // drueckt die Schultern nach unten/vorn in die Stuetzstuetze
            tg_trizeps_lat:20,       // Ellbogenstreckung im Stuetz
            tg_quadrizeps:15},
  // Bird Dog. Kontrollierte Extremitaeten-Bewegung im Vierfuesslerstand - vor allem eine
  // Ruckenstrecker- und Anti-Rotations-Uebung mit wenig aeusserem Widerstand.
  birddog:{ tg_rueck_strecker:35,
            tg_gesaess_haupt:20,
            tg_bauch_gerade:15},

  // ===== Schultern-Nachzuegler =====
  // Frontheben. Isoliert den vorderen Delt sehr gezielt, aber mit deutlich weniger Last
  // moeglich als beim Schulterdruecken, das die Referenz haelt.
  frontraise:{
            tg_schulter_vorn:75},

  // ===== Unterarme & Griffkraft =====
  // Handgelenk-Curls Reverse. Direkte, gezielte Streckung des Handgelenks gegen Widerstand -
  // sehr isoliert, aber mit kuerzerem Hebel und weniger ueblichem Zusatzgewicht als der
  // Hammer-Curl-Griff, der die Referenz haelt.
  wrist_curl_rev:{
            tg_unterarm_streck:90},
  // Farmer's Walk. Fast so schwer zu halten wie das passive Haengen, dazu goes das
  // Tragen ueber Distanz mit deutlicher Mitarbeit von Trapez, Rumpf und Nacken einher.
  farmers:{ tg_unterarm_beug:95,
            tg_rueck_trapez_ob:45,   // haelt die Schultern unter dem Gewicht oben
            tg_bauch_schraeg:25,     // verhindert seitliches Wegkippen beim Gehen
            tg_bauch_tief:30,
            tg_bauch_gerade:20,
            tg_rueck_rhomb:20,
            tg_nacken:15},
  // Fat-Gripz-Halten. Dickerer Griffdurchmesser erhoeht die Unterarmbeuger-Anforderung
  // deutlich, bleibt aber ein reines Zusatz-Halten ohne eigene Zugbewegung.
  fatgripz:{tg_unterarm_beug:55,
            tg_unterarm_streck:20,
            tg_bizeps:15},
  // Handgelenk-Curls. Direkte Handgelenkbeugung mit Zusatzgewicht, aber kuerzere Amplitude
  // und weniger Last als ein Klimmzug/Haengen ueber das ganze Koerpergewicht.
  wrist_curl:{
            tg_unterarm_beug:60},
  // Reiskübel-Griffkraft. Wiederholtes Oeffnen/Schliessen der Hand im Reis - spuerbar, aber
  // ohne echtes Zusatzgewicht.
  ricebucket:{
            tg_unterarm_beug:50},

  // ===== Nacken =====
  // Kopfgeschirr. Setzt die Referenz fuer den Nacken: einzige Uebung hier mit echtem,
  // sauber steigerbarem Zusatzgewicht ueber Kette und Gewichtsscheibe.
  neck_harness:{
            tg_nacken:100,
            tg_rueck_trapez_ob:20},
  // Halsbeugen. Setzt die Referenz fuer die seitliche/vordere Halsmuskulatur: manueller
  // Widerstand direkt gegen die Beugerichtung.
  neck_flex_bw:{
            tg_hals_nacken:100,
            tg_nacken:20},
  // Seitliche Halsneigung. Gleiches Prinzip wie Halsbeugen, nur in der seitlichen Ebene.
  neck_side_bw:{
            tg_hals_nacken:90,
            tg_nacken:20},
  // Nackenbrücke. Traegt einen Teil des Koerpergewichts ueber den Nacken ab - intensiv, aber
  // rein isometrisch und riskanter zu dosieren als ein Kopfgeschirr.
  neck_bridge:{
            tg_nacken:60,
            tg_rueck_trapez_ob:20},
  // Nackenstrecken. Bodyweight/manueller Widerstand gegen die Streckung.
  neck_ext_bw:{
            tg_nacken:55,
            tg_rueck_trapez_ob:15},
  // Nackentraining. Allgemeine Bezeichnung fuer leichtes manuelles Nackentraining - am
  // wenigsten gezielt in dieser Gruppe.
  neck_curl:{
            tg_nacken:45,
            tg_rueck_trapez_ob:15},

  // ===== Mobility (mob:true, zaehlt nicht zum Trainingsvolumen, siehe mob_deadhang oben) =====
  // Bekommen niedrige, aber realistische Werte, damit sie in der Übungsliste nicht
  // faelschlich ganz oben landen (gleiches Prinzip wie bei mob_deadhang).
  mob_shoulder:{
            tg_schulter_hint:10,
            tg_rueck_rhomb:8,
            tg_rueck_trapez_mit:8,
            tg_rueck_trapez_unt:8,
            tg_schulter_rot_infra:8,
            tg_schulter_rot_teres_min:8},
  mob_thoracic:{
            tg_rueck_rhomb:8,
            tg_rueck_trapez_mit:8,
            tg_rueck_strecker:8},
  mob_pancake:{
            tg_adduktoren:8,
            tg_kniesehnen:6},
  mob_ankle:{
            tg_wade_gastro:8},
  mob_couch:{
            tg_quadrizeps:8,
            tg_gesaess_haupt:5},
  mob_hip:{ tg_adduktoren:8,
            tg_gesaess_haupt:6},
  mob_hamstring:{
            tg_kniesehnen:6,
            tg_rueck_strecker:6}
}
;

function exPct(ex){return (ex&&(ex.pct||EX_PCT[ex.id]))||null;}

/* Gleiche Form wie exInvolve (Gruppe -> 0..1), nur feiner abgestuft. */
function exPctInv(ex){var p=exPct(ex);if(!p)return null;var inv={};for(var g in p)inv[g]=p[g]/100;return inv;}

function _fwHexToRgb(h){h=String(h).replace("#","");if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  var n=parseInt(h,16);if(isNaN(n))n=0x808080;return [(n>>16)&255,(n>>8)&255,n&255];}

function _fwRgbToHsl(r,g,b){r/=255;g/=255;b/=255;
  var mx=Math.max(r,g,b),mn=Math.min(r,g,b),h=0,s=0,l=(mx+mn)/2,d=mx-mn;
  if(d){s=l>0.5?d/(2-mx-mn):d/(mx+mn);
    if(mx===r)h=(g-b)/d+(g<b?6:0);else if(mx===g)h=(b-r)/d+2;else h=(r-g)/d+4;h*=60;}
  return [h,s,l];}

function _fwHslToHex(h,s,l){h=((h%360)+360)%360;
  var c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs((h/60)%2-1)),m=l-c/2,r,g,b;
  if(h<60){r=c;g=x;b=0;}else if(h<120){r=x;g=c;b=0;}else if(h<180){r=0;g=c;b=x;}
  else if(h<240){r=0;g=x;b=c;}else if(h<300){r=x;g=0;b=c;}else{r=c;g=0;b=x;}
  function q(v){var n=Math.round((v+m)*255);n=Math.max(0,Math.min(255,n));return (n<16?"0":"")+n.toString(16);}
  return "#"+q(r)+q(g)+q(b);}

/* Farbskala der Beanspruchung: Gelb -> Orange -> Rot, in festen Stufen.
   Der Farbton steigt UND die Farbe wird dunkler - beides zusammen macht die Reihenfolge
   auch auf der beschatteten 3D-Geometrie lesbar, wo ein reiner Helligkeitsverlauf durch
   Licht und Schatten verfaelscht wird.
   Ab der Schwelle (Top-Uebung fuer diesen Muskel) wird es eindeutig rot, darunter orange,
   ganz unten gelb. Der Sprung von Orange auf Rot ist bewusst hart: "Top-Uebung" ist keine
   Abstufung, sondern eine Aussage. Innerhalb von Rot gibt es noch eine dunklere Stufe ab
   90 %, damit die staerkste Wirkung sichtbar bleibt. */
var EX_PCT_HOT=0.80;
                  // ab hier rot
var EX_PCT_STEPS=[
  {min:0,          col:"#FBE674"},    // unter 20 % - hellgelb
  {min:0.20,       col:"#F6C353"},    // 20-39 %
  {min:0.40,       col:"#F1A246"},    // 40-59 % - orange
  {min:0.60,       col:"#DD7537"},    // 60-79 % - kraeftiges Orange
  {min:EX_PCT_HOT, col:"#CB3F2C"},    // 80-89 % - rot
  {min:0.90,       col:"#A3281C"}     // ab 90 % - dunkelrot
];

function exPctStep(v){
  v=Math.max(0,Math.min(1,v||0));
  var s=EX_PCT_STEPS[0];
  for(var i=0;i<EX_PCT_STEPS.length;i++)if(v>=EX_PCT_STEPS[i].min)s=EX_PCT_STEPS[i];
  return s;
}

function exPctColor(v){return exPctStep(v).col;}

function exPctColorStep(v){return exPctColor(v);}

/* Dunklere Variante derselben Stufe - fuer Flaechen, auf denen weisse Schrift steht
   (auf dem hellen Gelb der unteren Stufen waere sie nicht lesbar). */
// ---- Fuellstand-Skala fuer das Wochenvolumen -------------------------------
// Statt drei harter Zonen (zu wenig / Optimum / zu viel) wird der Farbwert stufenlos
// zwischen den Korridor-Marken interpoliert: ruhiges Grau bei null, ueber Petrol zum
// Gruen im Korridor, darueber dunkles Rotbraun.
var _volStops=null,
_volStopsKey=null;

function volStops(){
  var key=(document.documentElement.getAttribute("data-theme")||"")+"|"+
          (window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"d":"l");
  if(_volStops&&_volStopsKey===key)return _volStops;
  var css=getComputedStyle(document.documentElement);
  function cv(n,fb){var s=css.getPropertyValue(n).trim();return s||fb;}
  _volStops=[cv("--vol0","#B4BAC1"),cv("--vol1","#3E8C9B"),cv("--vol2","#2F8355"),
             cv("--vol3","#1C5F3C"),cv("--vol4","#7A3121")];
  _volStopsKey=key;
  return _volStops;
}

/* Ueber der Grenze wird in RGB gemischt, nicht in HSL. Der Weg von Dunkelgruen (Farbton ~150)
   zu dunklem Rotbraun (~15) fuehrt auf dem kuerzeren Bogen durch Gelb - ein leicht ueberzogener
   Muskel waere dadurch gelbgruen erschienen statt langsam ins Braune zu kippen. */
function _fwMixRgbHex(a,b,t){
  t=clamp(t,0,1);
  var A=_fwHexToRgb(a),B=_fwHexToRgb(b),o="#",i,v;
  for(i=0;i<3;i++){
    v=Math.round(A[i]+(B[i]-A[i])*t);
    o+=("0"+Math.max(0,Math.min(255,v)).toString(16)).slice(-2);
  }
  return o;
}

function _fwMixHex(a,b,t){
  t=clamp(t,0,1);
  var A=_fwRgbToHsl.apply(null,_fwHexToRgb(a)),B=_fwRgbToHsl.apply(null,_fwHexToRgb(b));
  var d=B[0]-A[0];if(d>180)d-=360;if(d<-180)d+=360;
  return _fwHslToHex(A[0]+d*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t);
}

// Skalenende des Balkens: Limit plus 35 % Luft, damit eine Ueberschreitung sichtbar bleibt.
function volScale(m){return corr(m).mrv*1.35;}

function volFill(v,m){return clamp(v/volScale(m)*100,0,100);}

/* Mehrere hundert Meshes pro Einfaerbung, und jede Farbe entsteht ueber HSL-Umrechnungen.
   Gleiche Gruppe + gleicher Wert ergibt immer dieselbe Farbe - also einmal rechnen, merken.
   Der Schluessel enthaelt das Thema und den persoenlichen Korridor-Faktor, damit ein Wechsel
   dort nicht alte Farben stehen laesst. */
var _volColMemo={}
;

function volColor(v,m){
  var id=m&&m.id;
  volStops();   // stellt sicher, dass der Themenschluessel gesetzt ist
  if(id){
    var k=id+"|"+Math.round(v*8)+"|"+volFactor(id)+"|"+(_volStopsKey||"");
    var hit=_volColMemo[k];
    if(hit)return hit;
    return (_volColMemo[k]=volColorRaw(v,m));
  }
  return volColorRaw(v,m);
}

function volColorRaw(v,m){
  var c=corr(m),S=volStops();
  if(!(v>0))return S[0];
  // Interpoliert wird in Reiz-, nicht in Satzabstaenden - sonst zeigt die Farbe einen
  // Unterschied an, den es in dieser Groesse gar nicht gibt.
  var q=Math.sqrt(v),q0=Math.sqrt(c.mev),q1=Math.sqrt(c.mav),q2=Math.sqrt(c.mrv);
  if(v<c.mev)return _fwMixHex(S[0],S[1],q/Math.max(.001,q0));
  if(v<c.mav)return _fwMixHex(S[1],S[2],(q-q0)/Math.max(.001,q1-q0));
  if(v<=c.mrv)return _fwMixHex(S[2],S[3],(q-q1)/Math.max(.001,q2-q1));
  return _fwMixRgbHex(S[3],S[4],(q-q2)/Math.max(.001,Math.sqrt(c.mrv*1.30)-q2));
}

// Position eines Satzwerts auf der Legendenskala (in Prozent der Balkenbreite).
// Die Stuetzstellen entsprechen den Marken im Verlaufsbalken: 0 / Minimum / Optimum /
// Limit / Skalenende.
var VOL_LEG_P=[0,26.5,48.4,78,100];

function volLegendPos(v,m){
  var c=corr(m),P=VOL_LEG_P;
  if(!(v>0))return P[0];
  var q=Math.sqrt(v),q0=Math.sqrt(c.mev),q1=Math.sqrt(c.mav),q2=Math.sqrt(c.mrv),
      q3=Math.sqrt(c.mrv*1.35);
  if(v<c.mev)return P[1]*(q/Math.max(.001,q0));
  if(v<c.mav)return P[1]+(P[2]-P[1])*(q-q0)/Math.max(.001,q1-q0);
  if(v<=c.mrv)return P[2]+(P[3]-P[2])*(q-q1)/Math.max(.001,q2-q1);
  return Math.min(P[4],P[3]+(P[4]-P[3])*(q-q2)/Math.max(.001,q3-q2));
}

// Aggregat fuer Regions-/Gruppenzeilen: 0..100 Punkte entlang derselben Skala.
function volColorScore(score,over){
  var S=volStops();
  if(over)return S[4];
  var t=clamp(score,0,100)/100;
  if(t<0.70)return _fwMixHex(S[0],S[1],t/0.70);
  return _fwMixHex(S[1],S[3],(t-0.70)/0.30);
}

function exPctColorInk(v){
  var h=_fwRgbToHsl.apply(null,_fwHexToRgb(exPctColor(v)));
  return _fwHslToHex(h[0],Math.max(h[1],0.45),Math.min(h[2],0.36));
}

function exPctColorStepInk(v){return exPctColorInk(v);}

function exInvolve(ex){
  var inv={};
  (ex.p||[]).forEach(function(g){inv[g]=1;});
  (ex.s||[]).forEach(function(g){if(!(inv[g]>=1))inv[g]=0.5;});(ex.st||[]).forEach(function(g){if(!(inv[g]>=0.5))inv[g]=0.25;});
  return inv;
}

function involvePaint(inv){
  return function(gs){
    var v=0;(gs||[]).forEach(function(g){if(g&&(inv[g]||0)>v)v=inv[g];});
    if(v<=0)return {cls:"msk",fill:"var(--z0)",op:0};
    // Primär: kräftiges Grün, sofort erkennbar. Sekundär: helleres Grün, klar schwächer.
    return {cls:"msk",fill:v>=1?"var(--ex-pri)":"var(--ex-sec)",op:v>=1?1:0.92};
  };
}

// Wie exInvolve, aber für einen ganzen Trainingstag: alle an diesem Tag geloggten Übungen
// (unabhängig davon, ob einzeln eingetragen oder über eine Trainingseinheit abgehakt – beides
// landet in day.sets) fließen mit ihrer eigenen Primär-/Sekundärgewichtung ein; trifft eine
// Übung einen Muskel nur sekundär, eine andere Übung desselben Tages aber primär, zählt primär.
function dayInvolve(dateKey){
  var inv={},d=state.days[dateKey];if(!d)return inv;
  var seen={};
  (d.sets||[]).forEach(function(s){seen[s.ex]=true;});
  Object.keys(seen).forEach(function(exid){
    var ex=exById(exid);if(!ex||ex.t==="cardio")return;
    var i2=exInvolve(ex);
    Object.keys(i2).forEach(function(g){if((inv[g]||0)<i2[g])inv[g]=i2[g];});
  });
  return inv;
}

// Die Figuren sind teuer (Feinaufteilungen messen echte Geometrie) – für einen Tag lohnt sich
// kein dauerhafter Cache wie bei Übungen (der Tag kann sich durch Nachbearbeiten ändern),
// aber "data-filled" verhindert immerhin einen doppelten Aufbau bei jedem Sheet-Redraw.
function fillDayFig(svg){
  if(svg.getAttribute("data-filled"))return;
  var dateKey=svg.getAttribute("data-day"),view=svg.getAttribute("data-view");
  if(!dateKey)return;
  var inv=setsInvolve((state.days[dateKey]||{}).sets);
  fw3dSnapInto(svg,"day:"+dateKey+"|"+fw3dInvKey(inv),inv,view,false,null,"step",FT_SESSION);
}

// Die Figuren sind teuer (Feinaufteilungen messen echte Geometrie), ändern sich pro Übung aber
// nie – deshalb einmal bauen, als Markup merken und bei jedem Neuaufbau wiederverwenden.
var exFigCache={}
;

function fillExFig(svg){
  if(svg.getAttribute("data-filled"))return;
  var ex=exById(svg.getAttribute("data-ex")),view=svg.getAttribute("data-view");
  if(!ex)return;
  var pinv=exPctInv(ex);
  // Zwei Darstellungen mit eigenem Schluessel: die kleine Kachel in der Uebungsliste zeigt
  // nur zwei Stufen (bei 130 px geht jede Nuance verloren), alles Groessere die volle Skala.
  // Gleicher Schluessel heisst gleiches Standbild - deshalb ist die Vollbildansicht sofort da.
  var detail=svg.getAttribute("data-mode")==="pd";
  fw3dSnapInto(svg,"ex:"+ex.id+(pinv?(detail?"|pd":"|pc"):""),pinv||exInvolve(ex),view,false,
               detail?null:(discFine||null),pinv?(detail?"step":"card"):null);
}

function renderBanner(){
  var bn=$("wo-banner");if(!bn)return;bn.hidden=!workout;if(!workout)return;
  var done=0,tot=0;workout.exercises.forEach(function(we){if(!we.sets)return;we.sets.forEach(function(st){tot++;if(st.done)done++;});});
  bn.innerHTML='<div><b>'+workout.name+' läuft</b><span>'+done+' von '+tot+' Sätzen · tippen zum Weitermachen</span></div><span class="num" id="wo-banner-t">'+fmtDur(woElapsed())+'</span>';
  bn.onclick=function(){selectTab("tab-training");window.scrollTo(0,0);};
}

var woPage=0,
 woShape=null,
 woScrollT=0;

function woShapeKey(){
  return workout.exercises.map(function(we){return we.ex+"#"+(we.sets?we.sets.length:"c"+we.cardioRec.min+":"+we.cardioRec.km)+"#"+we.restSec;}).join(",")+"|"+(workout.paused?"p":"r");
}

// Während eines laufenden Trainings bekommt der Bildschirm ein festes Layout (siehe CSS):
// Die Übungsseite füllt genau die Höhe, gescrollt wird nicht. Dieselbe Idee gilt auch für die
// Trainingsseite VOR dem Start (kein Workout aktiv): auch dort volle Bildschirmhöhe, kein
// Scrollen – nur das Layout dahinter ist ein anderes (Einheiten-Liste statt Satztabelle).
function woLive(){
  try{document.body.classList.toggle("wo-live",!!workout&&tab==="tab-training");
    document.body.classList.toggle("tr-idle-fixed",!workout&&tab==="tab-training");}catch(e){}
}

function renderSession(){
  $("session-wrap").hidden=!workout;$("start-wrap").hidden=!!workout;
  woLive();
  if(!workout){woShape=null;return;}
  // Haben sich nur Häkchen/Zahlen geändert, wird in-place aktualisiert: ein kompletter Neuaufbau
  // würde bei jedem abgehakten Satz die Wischposition und die Muskelfiguren wegwerfen.
  if(woShape===woShapeKey()&&$("wo-pager")){woUpdate();return;}
  var ae=document.activeElement,keepKey=null,keepPos=0;
  if(ae&&ae.tagName==="INPUT"&&ae.dataset&&ae.dataset.k&&$("session-body").contains(ae)){keepKey=ae.dataset.k;try{keepPos=ae.selectionStart;}catch(e){}}
  renderSessionInner();
  woShape=woShapeKey();
  if(keepKey){var again=$("session-body").querySelector('input[data-k="'+keepKey+'"]');
    if(again){try{again.focus({preventScroll:true});if(keepPos!=null)again.setSelectionRange(keepPos,keepPos);}catch(e){}}}
}

/* Eine Übung pro Seite: horizontal wischen, ganz hinten das große Plus für die nächste Übung. */
function woGoto(i,smooth){
  var p=$("wo-pager");if(!p)return;
  var x=i*(p.clientWidth||p.offsetWidth||0);
  try{p.scrollTo({left:x,behavior:smooth?"smooth":"auto"});}catch(e){p.scrollLeft=x;}
}

function woDots(){
  var d=$("wo-dots");if(!d||!workout)return;d.innerHTML="";
  var n=workout.exercises.length+1;
  for(var i=0;i<n;i++){
    var cls=(i===n-1?"plus":"")+(i===woPage?" on":"");
    var x=el("i",cls.trim());
    (function(k){x.onclick=function(){woPage=k;woGoto(k,true);woDots();woFillFigs();};})(i);
    d.appendChild(x);
  }
}

// Layout-Änderungen (Pausenleiste, Tastatur, nachgeladene Figuren) können den Wischer zwischen
// zwei Seiten stehen lassen. Kurz nach einer echten Wischbewegung nie eingreifen.
function woAlign(){
  var p=$("wo-pager");if(!p||!p.getClientRects().length)return;
  if(Date.now()-woScrollT<700)return;
  var w=p.clientWidth||0;if(!w)return;
  if(Math.abs(p.scrollLeft-woPage*w)>6)woGoto(woPage,false);
}

// Die Muskelzeile braucht je nach Uebung ein bis drei Reihen. Ihre tatsaechliche
// Hoehe wird gemessen und im Layout freigehalten, damit unten nichts abgeschnitten
// wird - die Figur darueber nutzt den restlichen Platz.
function woMusSpace(){
  var p=$("wo-pager");if(!p)return;
  var pg=p.querySelector('.wo-page[data-i="'+woPage+'"]');if(!pg)return;
  var m=pg.querySelector(".wo-mus");if(!m)return;
  var cap=Math.round(window.innerHeight*0.30);
  var h=Math.min(m.scrollHeight,cap);
  if(Math.abs((parseInt(document.body.style.getPropertyValue("--mus-h"),10)||0)-h)>2)
    document.body.style.setProperty("--mus-h",h+"px");
}

function woFillFigs(){
  var p=$("wo-pager");if(!p||!p.getClientRects().length)return;
  woMusSpace();
  [woPage-1,woPage,woPage+1].forEach(function(i){
    var pg=p.querySelector('.wo-page[data-i="'+i+'"]');if(!pg)return;
    Array.prototype.forEach.call(pg.querySelectorAll("svg[data-ex]"),fillExFig);
  });
}

// Leichtes Update ohne Neuaufbau: Häkchen, gesperrte Felder, Zähler.
function woUpdate(){
  var p=$("wo-pager");if(!p||!workout)return;
  workout.exercises.forEach(function(we,ei){
    var pg=p.querySelector('.wo-page[data-i="'+ei+'"]');if(!pg)return;
    if(!we.sets)return;
    we.sets.forEach(function(st,si){
      var r=pg.querySelector('.wo-row[data-s="'+si+'"]');if(!r)return;
      if(st.done)r.classList.add("done");else r.classList.remove("done");
      var ck=r.querySelector(".wo-check");if(ck){if(st.done)ck.classList.add("on");else ck.classList.remove("on");}
      Array.prototype.forEach.call(r.querySelectorAll("input"),function(inp){
        inp.disabled=!!st.done;
        if(document.activeElement!==inp){
          var f=inp.getAttribute("data-f"),raw=st[f];
          // Alte Sätze (vor "einseitig") haben kein repsL/repsR – dann wie beim Aufbau der Zeile
          // auf den gemeinsamen reps-Wert zurückfallen statt auf 0.
          if(raw==null&&(f==="repsL"||f==="repsR"))raw=st.reps;
          var want=String(raw!=null?raw:0);
          if(inp.value!==want)inp.value=want;
        }
      });
    });
  });
  var done=0,tot=0;workout.exercises.forEach(function(we){if(!we.sets)return;we.sets.forEach(function(st){tot++;if(st.done)done++;});});
  $("session-meta").textContent=done+" von "+tot+" Sätzen";
  var pr=$("wo-prog");if(pr)pr.textContent=done+"/"+tot;
  tickWorkout();
}

// Die Illustration hat viel Rand. Für die Trainingsansicht wird auf die Figur zugeschnitten –
// dieselben Koordinaten für Masken und Bild, deshalb reicht ein engerer viewBox-Ausschnitt.
var FIGCROP={male:[0.123,0.016,0.877,0.989], female:[0.178,0.046,0.826,0.989]}
;

function figViewBoxTight(){
  var c=FIGCROP[figSex()==="female"?"female":"male"];
  return (c[0]*FIGW)+" "+(c[1]*FIGH)+" "+((c[2]-c[0])*FIGW)+" "+((c[3]-c[1])*FIGH);
}

function woFigs(ex){
  var wrap=el("div","wo-figwrap"),box=el("div","wo-figs");
  [["front","Vorne"],["back","Hinten"]].forEach(function(v){
    var fig=document.createElement("figure");
    var sv=document.createElementNS("http://www.w3.org/2000/svg","svg");
    sv.setAttribute("viewBox",figViewBoxTight());sv.setAttribute("data-ex",ex.id);sv.setAttribute("data-view",v[0]);
    // Diese Figuren (Trainingsseite, Uebungsdetail, Vollbild-Muskelansicht) zeigen alle die
    // volle Stufenskala. Dadurch teilen sie sich EIN Standbild je Uebung und Ansicht - die
    // Vollbildseite oeffnet sofort, statt dieselbe Figur ein zweites Mal zu rendern.
    sv.setAttribute("data-mode","pd");
    sv.setAttribute("role","img");sv.setAttribute("aria-label","Beanspruchte Muskeln, "+v[1]);
    fig.appendChild(sv);fig.appendChild(el("figcaption",null,v[1]));
    box.appendChild(fig);
  });
  wrap.appendChild(box);
  return wrap;
}

/* Einzelnen Muskel hervorheben: nur er bleibt farbig und undurchsichtig, alles andere
   wird durchscheinend. Nur so sieht man Muskeln, die von anderen verdeckt werden –
   etwa die tiefe Bauchmuskulatur unter dem geraden Bauchmuskel. */
function woFigsShow(figsEl,ex,focusG){
  if(!figsEl)return;
  figsEl.dataset.focusGroup=focusG||"";
  Array.prototype.forEach.call(figsEl.querySelectorAll("svg[data-ex]"),function(sv){
    var view=sv.getAttribute("data-view");
    sv.removeAttribute("data-filled");
    var pinv=exPctInv(ex);
    if(focusG){
      var inv=pinv||exInvolve(ex),lvl=inv[focusG]||1,one={};
      one[focusG]=lvl;
      var mm=muscleById(focusG);
      sv.setAttribute("aria-label",(mm?mm.name:"Muskel")+" hervorgehoben, "+(view==="back"?"Rückansicht":"Vorderansicht"));
      // Die Stufe gehoert in den Schluessel: sonst wird ein zuvor mit anderer Farbe
      // gemerktes Bild wiederverwendet (frueher rot/blau, jetzt zusaetzlich der Prozentwert).
      fw3dSnapInto(sv,"foc:"+focusG+":"+(pinv?Math.round(lvl*100):(lvl>=1?"p":"s")),one,view,true,null,pinv?"step":null);
    }else{
      sv.setAttribute("aria-label","Beanspruchte Muskeln, "+(view==="back"?"Hinten":"Vorne"));
      fw3dSnapInto(sv,"ex:"+ex.id+(pinv?"|pd":""),pinv||exInvolve(ex),view,false,null,pinv?"step":null);
    }
  });
}

/* Prozent-Darstellung: ein Chip je Muskel, absteigend nach Beanspruchung, eingefaerbt
   mit derselben Blau-Rot-Skala wie die Figur daneben - so gehoeren Zahl und Bild sichtbar
   zusammen. Tippen hebt den einzelnen Muskel in der Figur hervor (wie bisher). */
function woPctScale(){
  // Der Balken zeigt die Stufen als harte Bloecke - genau dort, wo die Farbe umspringt.
  var hot=Math.round(EX_PCT_HOT*100),stops=[],i;
  for(i=0;i<EX_PCT_STEPS.length;i++){
    var c=EX_PCT_STEPS[i].col;
    var from=Math.round(EX_PCT_STEPS[i].min*100);
    var to=Math.round((i+1<EX_PCT_STEPS.length?EX_PCT_STEPS[i+1].min:1)*100);
    stops.push(c+" "+from+"%",c+" "+to+"%");
  }
  var w=el("div","wo-scale");
  w.appendChild(el("em",null,"Beanspruchung"));
  var bar=el("i");bar.style.background="linear-gradient(90deg,"+stops.join(",")+")";
  w.appendChild(bar);
  w.appendChild(el("b",null,"ab "+hot+" % Top-Übung"));
  return w;
}

/* Woher die Zahlen kommen - gehoert sichtbar dazu, damit die Werte nicht fuer Messwerte
   gehalten werden. */
function woPctNote(){
  var n=el("p","wo-pctnote","100 % = die beste verfügbare Übung für diesen Muskel. "+
    "Ein Satz zählt anteilig auf dein Wochenvolumen: 60 % sind 0,6 Sätze. "+
    "Planungswerte auf Basis der EMG-Literatur – keine Messwerte.");
  return n;
}

function woMusPct(ex,figsEl,pct,box){
  var items=[];
  Object.keys(pct).forEach(function(g){var m=muscleById(g);if(!m)return;items.push({id:g,name:m.name,v:pct[g]});});
  if(!items.length){box.appendChild(el("p","note","Für diese Übung sind keine Muskeln hinterlegt."));return box;}
  items.sort(function(a,b){return b.v-a.v||a.name.localeCompare(b.name,"de");});
  var chips=[];
  function setFocus(g){
    woFigsShow(figsEl,ex,g);
    chips.forEach(function(c){c.setAttribute("aria-pressed",String(c.dataset.g===g));});
  }
  var row=el("div","wo-mline q"),sp=el("span");
  items.forEach(function(it){
    var b=el("button","wo-mchip");
    b.type="button";b.dataset.g=it.id;b.setAttribute("aria-pressed","false");
    // Farbe = Stufe (dieselbe wie in der Figur), Balkenlaenge = der genaue Wert.
    // Der Balken hat in jedem Chip dieselbe Spurbreite, sonst waeren die Laengen
    // zwischen verschieden breiten Chips nicht vergleichbar.
    b.style.setProperty("--c",exPctColorStep(it.v/100));
    b.style.setProperty("--c-ink",exPctColorStepInk(it.v/100));
    var track=el("i","mbar"),fill=el("b");
    fill.style.width=Math.max(4,it.v)+"%";
    track.appendChild(fill);b.appendChild(track);
    b.appendChild(document.createTextNode(it.name));
    b.appendChild(el("span","mpct",it.v+" %"));
    b.title=it.name+": "+it.v+" % Beanspruchung – allein in der Figur hervorheben";
    b.onclick=function(ev){
      ev.stopPropagation();
      setFocus(figsEl&&figsEl.dataset.focusGroup===it.id?null:it.id);
    };
    chips.push(b);sp.appendChild(b);
  });
  row.appendChild(sp);
  box.appendChild(woPctScale());
  box.appendChild(row);
  box.appendChild(woPctNote());
  return box;
}

/* Auf der laufenden Trainingsseite ist Hoehe das knappste Gut. Die volle Muskelliste steht
   deshalb nicht dauerhaft da, sondern als eine Zeile mit den drei staerksten Muskeln, die
   sich aufklappen laesst - und zusaetzlich hinter der Figur, die als Ganzes antippbar ist. */
function woMusLive(ex,figsEl){
  var box=el("div","wo-mus live"),pct=exPct(ex);
  var head=el("button","wo-musbar");head.type="button";
  var lab=el("em",null,"Beanspruchung");head.appendChild(lab);
  var sum=el("span","wo-musum");
  if(pct){
    Object.keys(pct).map(function(g){var m=muscleById(g);return m?{id:g,name:m.name,v:pct[g]}:null;})
      .filter(Boolean).sort(function(a,b){return b.v-a.v;}).slice(0,3)
      .forEach(function(it){
        var t=el("span","wo-musum-i");
        var d=el("i");d.style.background=exPctColorStep(it.v/100);
        t.appendChild(d);t.appendChild(document.createTextNode(it.name+" "+it.v+" %"));
        sum.appendChild(t);
      });
  }else{
    var inv0=exInvolve(ex),pri0=[];
    Object.keys(inv0).forEach(function(g){if(inv0[g]>=1){var m=muscleById(g);if(m)pri0.push(m.name);}});
    sum.appendChild(document.createTextNode(pri0.slice(0,3).join(" · ")));
  }
  head.appendChild(sum);
  var chev=el("span","wo-muschev");chev.innerHTML=svgIcon(IC_CHEV,2.2);head.appendChild(chev);
  box.appendChild(head);
  // Fuehrt auf dieselbe Vollbildseite wie das Antippen der Figur - ein Ziel statt zweier
  // verschiedener Darstellungen fuer dieselbe Information.
  head.setAttribute("aria-label","Beanspruchte Muskeln von "+ex.n+" anzeigen");
  head.onclick=function(ev){ev.preventDefault();pageExMuscles(ex);};
  return box;
}

/* Grosse Ansicht: eigene Vollbildseite mit moeglichst grossen Figuren plus vollstaendiger
   Liste - erreichbar durch Antippen der Figur auf der Trainingsseite. Nutzt dieselbe
   Vollbild-Huelle wie das Uebungsdetail, damit Zuruecknavigieren sich gleich anfuehlt. */
function pageExMuscles(ex){
  closeSheet();
  var page=$("exdpage");page.hidden=false;syncScrollLock();
  var head=$("exdpage-head");head.innerHTML="";
  var back=el("button","iconbtn");back.type="button";back.setAttribute("aria-label","Zurück");
  back.innerHTML=svgIcon(IC_CHEVLEFT,2.1);back.onclick=closeExPage;
  head.appendChild(back);
  head.appendChild(el("div","exdpage-title",ex.n));
  var body=$("exdpage-body");body.innerHTML="";
  var figs=woFigs(ex);figs.classList.add("muspage-figs");
  body.appendChild(figs);
  body.appendChild(woMus(ex,figs));
  woFigsShow(figs,ex,null);
}

function woMus(ex,figsEl){
  var box=el("div","wo-mus"),pct=exPct(ex);
  if(pct)return woMusPct(ex,figsEl,pct,box);
  var inv=exInvolve(ex),pri=[],sec=[];
  Object.keys(inv).forEach(function(g){var m=muscleById(g);if(!m)return;(inv[g]>=1?pri:sec).push({id:g,name:m.name});});
  if(!pri.length&&!sec.length){box.appendChild(el("p","note","Für diese Übung sind keine Muskeln hinterlegt."));return box;}
  function byName(a,b){return a.name.localeCompare(b.name,"de");}
  pri.sort(byName);sec.sort(byName);
  var chips=[];
  function setFocus(g){
    woFigsShow(figsEl,ex,g);
    chips.forEach(function(c){c.setAttribute("aria-pressed",String(c.dataset.g===g));});
  }
  function line(cls,lab,items){
    var r=el("div","wo-mline"+cls);
    r.appendChild(el("i"));r.appendChild(el("em",null,lab));
    var sp=el("span");
    items.forEach(function(it,i){
      var b=el("button","wo-mchip",it.name);
      b.type="button";b.dataset.g=it.id;b.setAttribute("aria-pressed","false");
      b.title=it.name+" allein hervorheben";
      b.onclick=function(ev){
        ev.stopPropagation();
        setFocus(figsEl&&figsEl.dataset.focusGroup===it.id?null:it.id);
      };
      chips.push(b);sp.appendChild(b);
    });
    r.appendChild(sp);
    return r;
  }
  if(pri.length)box.appendChild(line(" p","Primär",pri));
  if(sec.length)box.appendChild(line(" s","Sekundär",sec));
  return box;
}

/* ================= Was eine Uebung ausser Muskeln noch staerkt =================
   Sehnen, Baender, Faszien, Gelenke, Knochen und Faehigkeiten. Bewusst getrennt von
   den Muskeln gehalten: diese Strukturen lassen sich nicht in Saetzen pro Woche
   messen, und sie gehen NICHT ins Trainingsvolumen ein. Die Angabe ist eine
   Einordnung, keine Dosierung - deshalb steht bei jedem Eintrag, worum es geht,
   statt einer Zahl. */
var STRUCT={
 griff:{n:"Griffkraft",k:"Fähigkeit",t:"Wie lange und wie fest du etwas halten kannst. Bei Zug- und Hebeübungen oft das erste, was nachgibt - und damit die Grenze, bevor der Zielmuskel wirklich ausbelastet ist."},
 achilles:{n:"Achillessehne",k:"Sehne",t:"Die kräftigste Sehne des Körpers. Sie passt sich an Zug an, aber deutlich langsamer als der Muskel - nach langer Pause ist der Sprung in die alte Belastung der häufigste Auslöser für Beschwerden."},
 patella:{n:"Patellasehne",k:"Sehne",t:"Verbindet Kniescheibe und Schienbein. Regelmäßige Beugung unter Last macht sie belastbarer; plötzlich viel Sprung- und Landearbeit reizt sie."},
 tractus:{n:"Tractus iliotibialis",k:"Faszie",t:"Sehnenplatte an der Oberschenkelaußenseite, vom Becken bis unters Knie. Sie wird nicht selbst trainiert, sondern über die Muskeln, die an ihr ziehen - Gesäß und Hüftabspreizer. Schwache Hüftstabilität zeigt sich häufig hier."},
 rotator_sehnen:{n:"Rotatorenmanschette",k:"Sehne",t:"Vier Sehnen, die den Oberarmkopf in der Pfanne zentrieren. Sie arbeiten bei jedem Drücken und Ziehen mit, ohne dass man sie spürt - und sind der Grund, warum saubere Technik über Kopf wichtiger ist als Gewicht."},
 bizepssehne:{n:"Lange Bizepssehne",k:"Sehne",t:"Läuft durch das Schultergelenk hindurch. Sie wird bei tiefen Stützpositionen mit gestreckter Schulter stark auf Zug genommen."},
 ellbogen:{n:"Sehnenansätze am Ellbogen",k:"Sehne",t:"Ursprung der Unterarmmuskeln an den Knochenvorsprüngen innen und außen - die Stellen, an denen Tennis- und Golferellenbogen entstehen. Sie profitieren von langsamen, kontrollierten Wiederholungen."},
 adduktorensehnen:{n:"Adduktorensehnen",k:"Sehne",t:"Ansatz an der Schambeinregion. Häufige Beschwerdestelle bei Sportarten mit schnellen Richtungswechseln - gezielte Kräftigung beugt vor."},
 rueckenfaszie:{n:"Rückenfaszie",k:"Faszie",t:"Große Bindegewebsplatte im unteren Rücken, an der Gesäß, Latissimus und Bauchmuskeln zusammenlaufen. Sie überträgt Kraft zwischen Ober- und Unterkörper."},
 plantar:{n:"Plantarfaszie",k:"Faszie",t:"Spannt das Längsgewölbe des Fußes und federt bei jedem Schritt."},
 g_sprunggelenk:{n:"Sprunggelenk",k:"Gelenk",t:"Beweglichkeit und Stabilität hier entscheiden mit, wie tief du hocken kannst und wie sicher du landest."},
 g_knie:{n:"Kniegelenk",k:"Gelenk",t:"Kräftige Muskeln rundherum halten das Gelenk zusammen - das Training wirkt mehr über die Führung als über das Gelenk selbst."},
 g_huefte:{n:"Hüftgelenk",k:"Gelenk",t:"Das beweglichste große Gelenk. Seitliche Stabilität hier bestimmt, ob das Knie bei Belastung nach innen fällt."},
 g_schulter:{n:"Schultergelenk",k:"Gelenk",t:"Viel Bewegungsumfang, wenig knöcherne Führung - die Stabilität kommt fast ausschließlich aus Muskeln und Sehnen."},
 g_handgelenk:{n:"Handgelenk",k:"Gelenk",t:"Wird bei Stützpositionen in Streckung belastet. Mit der Zeit gewöhnt es sich daran; von null auf viel ist der übliche Fehler."},
 g_wirbelsaeule:{n:"Wirbelsäule",k:"Gelenk",t:"Nicht ein Gelenk, sondern viele. Sie hält Last aus, wenn die Rumpfmuskulatur sie in Position hält - genau das wird hier mittrainiert."},
 knochen:{n:"Knochendichte",k:"Knochen",t:"Knochen bauen auf Druck und Zug auf. Schweres Heben und Belastung mit dem eigenen Körpergewicht wirken dabei deutlich besser als gelenkschonende Ausdauerformen."},
 rumpf:{n:"Rumpfspannung",k:"Fähigkeit",t:"Die Fähigkeit, den Oberkörper unter Last stabil zu halten. Sie begrenzt bei vielen Übungen, wie viel Gewicht sinnvoll bewegt werden kann."},
 balance:{n:"Gleichgewicht",k:"Fähigkeit",t:"Einbeinige und freie Übungen fordern laufende Korrekturen aus Fuß, Hüfte und Rumpf - das trainiert man nicht an der Maschine."},
 beweglichkeit:{n:"Beweglichkeit",k:"Fähigkeit",t:"Wie weit ein Gelenk bewegt werden kann, ohne auszuweichen. Wächst durch regelmäßige, nicht durch lange Einheiten."},
 kondition:{n:"Herz-Kreislauf",k:"Fähigkeit",t:"Ausdauerleistung und Erholungsfähigkeit. Zeigt sich im Alltag oft früher als Kraftzuwachs."}
}
;

var EX_PLUS={"bench":["rotator_sehnen", "g_schulter"],
  "bench_db":["rotator_sehnen", "g_schulter"],
  "bench_inc":["rotator_sehnen", "g_schulter"],
  "bench_inc_db":["rotator_sehnen", "g_schulter"],
  "bench_dec":["rotator_sehnen", "g_schulter"],
  "machine_press":["rotator_sehnen", "g_schulter"],
  "machine_press_lying":["rotator_sehnen", "g_schulter"],
  "pushup":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "pushup_diamond":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "pushup_arch":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "pushup_dec":["rotator_sehnen", "g_schulter", "g_handgelenk"],
  "dips":["rotator_sehnen", "bizepssehne", "g_schulter", "g_handgelenk"],
  "fly_db":["rotator_sehnen", "g_schulter"],
  "cable_fly":["rotator_sehnen", "g_schulter"],
  "fly_machine":["rotator_sehnen", "g_schulter"],
  "pullover":["rotator_sehnen", "g_schulter"],
  "ohp":["rotator_sehnen", "g_schulter", "rumpf"],
  "ohp_db":["rotator_sehnen", "g_schulter", "rumpf"],
  "push_press":["rotator_sehnen", "g_schulter", "rumpf"],
  "arnold":["rotator_sehnen", "g_schulter", "rumpf"],
  "pike_pushup":["rotator_sehnen", "g_schulter", "g_handgelenk", "rumpf"],
  "hspu":["rotator_sehnen", "g_schulter", "g_handgelenk", "rumpf"],
  "handstand":["rotator_sehnen", "g_schulter", "g_handgelenk", "rumpf"],
  "pullup":["griff", "ellbogen", "g_schulter"],
  "chinup":["griff", "ellbogen", "g_schulter"],
  "pullup_wide":["griff", "ellbogen", "g_schulter"],
  "pullup_weight":["griff", "ellbogen", "g_schulter"],
  "latpull":["griff", "ellbogen", "g_schulter"],
  "latpull_close":["griff", "ellbogen", "g_schulter"],
  "pullup_neg":["griff", "ellbogen", "g_schulter"],
  "deadhang":["griff", "ellbogen", "g_handgelenk"],
  "row_bb":["griff", "g_schulter", "rumpf"],
  "row_db":["griff", "g_schulter", "rumpf", "balance"],
  "row_pendlay":["griff", "g_schulter", "rumpf"],
  "row_tbar":["griff", "g_schulter", "rumpf"],
  "row_cable":["g_schulter", "rumpf"],
  "row_machine":["g_schulter", "rumpf"],
  "row_inv":["g_schulter", "rumpf"],
  "row_band":["g_schulter", "rumpf"],
  "facepull":["g_schulter", "rumpf"],
  "shrug":["griff", "g_schulter", "rumpf"],
  "shrug_db":["griff", "g_schulter", "rumpf"],
  "squat":["patella", "g_knie", "knochen", "rumpf"],
  "squat_front":["patella", "g_knie", "knochen", "rumpf"],
  "squat_goblet":["patella", "g_knie", "rumpf"],
  "squat_bw":["patella", "g_knie", "rumpf"],
  "squat_pistol":["patella", "g_knie", "g_huefte", "rumpf"],
  "squat_bulg":["patella", "g_knie", "g_huefte", "rumpf"],
  "legpress":["patella", "g_knie", "knochen", "rumpf"],
  "hacksquat":["patella", "g_knie", "knochen", "rumpf"],
  "lunge":["patella", "g_knie", "g_huefte", "rumpf"],
  "lunge_walk":["patella", "g_knie", "g_huefte", "rumpf"],
  "stepup":["patella", "g_knie", "g_huefte", "rumpf"],
  "stepup_bw":["patella", "g_knie", "g_huefte", "rumpf"],
  "legext":["patella", "g_knie", "knochen", "rumpf"],
  "sissy":["patella", "g_knie", "rumpf"],
  "wallsit":["patella", "g_knie", "rumpf"],
  "balance_sl":["patella", "g_knie", "g_huefte", "rumpf"],
  "deadlift":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "deadlift_rdl":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "deadlift_sumo":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "deadlift_sl":["griff", "rueckenfaszie", "g_huefte", "g_wirbelsaeule"],
  "hipthrust":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "gluteBridge":["rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "goodmorning":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "backext":["rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "legcurl":["g_knie"],
  "nordic":["rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "kb_swing":["griff", "rueckenfaszie", "g_wirbelsaeule", "knochen"],
  "plank":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "lsit":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "sideplank":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "hollow":["g_wirbelsaeule", "rumpf"],
  "legraise":["griff", "g_wirbelsaeule", "rumpf"],
  "kneeraise":["griff", "g_wirbelsaeule", "rumpf"],
  "crunch":["g_wirbelsaeule", "rumpf"],
  "situp":["g_wirbelsaeule", "rumpf"],
  "russian":["g_wirbelsaeule", "rumpf"],
  "abwheel":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "cablecrunch":["g_wirbelsaeule", "rumpf"],
  "deadbug":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "birddog":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "pallof":["g_wirbelsaeule", "rumpf"],
  "torso_rot":["g_wirbelsaeule", "rumpf"],
  "dragonflag":["g_handgelenk", "g_wirbelsaeule", "rumpf"],
  "lateral":["g_schulter"],
  "lateral_cable":["g_schulter", "balance"],
  "frontraise":["g_schulter"],
  "reversefly":["g_schulter"],
  "upright_row":["g_schulter"],
  "cuban":["g_schulter"],
  "bandpullapart":["g_schulter"],
  "rot_internal":["rotator_sehnen", "g_schulter", "balance"],
  "emptycan":["rotator_sehnen", "g_schulter"],
  "curl_bb":["ellbogen"],
  "curl_db":["ellbogen"],
  "curl_hammer":["griff", "ellbogen", "g_handgelenk"],
  "curl_incline":["ellbogen"],
  "curl_preacher":["ellbogen"],
  "curl_preacher_machine":["ellbogen"],
  "curl_cable":["ellbogen"],
  "curl_cable_lying":["ellbogen"],
  "tri_push":["ellbogen"],
  "tri_skull":["ellbogen"],
  "tri_over":["ellbogen"],
  "tri_kick":["ellbogen", "balance"],
  "dips_bench":["ellbogen", "bizepssehne"],
  "wrist_curl":["griff", "ellbogen", "g_handgelenk"],
  "wrist_curl_rev":["griff", "ellbogen", "g_handgelenk"],
  "farmers":["griff", "ellbogen", "g_handgelenk"],
  "ricebucket":["griff", "ellbogen", "g_handgelenk"],
  "fatgripz":["griff", "ellbogen", "g_handgelenk"],
  "calf_stand":["achilles", "g_sprunggelenk"],
  "calf_seat":["achilles", "g_sprunggelenk"],
  "calf_bw":["achilles", "g_sprunggelenk"],
  "adduct":["adduktorensehnen", "g_huefte"],
  "hipflex_cable":["balance"],
  "clamshell":["tractus", "g_huefte"],
  "sidelying_raise":["tractus", "g_huefte"],
  "bandwalk_lat":["tractus", "g_huefte"],
  "abduct":["tractus", "g_huefte"],
  "copenhagen":["adduktorensehnen", "g_huefte"],
  "neck_curl":["g_wirbelsaeule"],
  "neck_ext_bw":["g_wirbelsaeule"],
  "neck_flex_bw":["g_wirbelsaeule"],
  "neck_side_bw":["g_wirbelsaeule"],
  "neck_harness":["g_wirbelsaeule"],
  "neck_bridge":["g_wirbelsaeule"],
  "run":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "run_interval":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "bike":["kondition"],
  "row_erg":["kondition", "griff", "rueckenfaszie"],
  "swim":["kondition", "rotator_sehnen", "g_schulter"],
  "jumprope":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "walk":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "hike":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "stairs":["kondition", "achilles", "tractus", "g_sprunggelenk"],
  "burpee":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "elliptical":["kondition"],
  "football":["kondition", "achilles", "g_sprunggelenk", "knochen"],
  "mob_hip":["beweglichkeit", "g_huefte"],
  "mob_shoulder":["beweglichkeit", "g_schulter", "g_wirbelsaeule"],
  "mob_thoracic":["beweglichkeit", "g_wirbelsaeule"],
  "mob_hamstring":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_ankle":["beweglichkeit", "g_sprunggelenk"],
  "mob_couch":["beweglichkeit", "g_huefte"],
  "mob_deadhang":["beweglichkeit", "griff", "g_schulter", "g_handgelenk"],
  "mob_pancake":["beweglichkeit", "g_huefte"],
  "mob_chest":["beweglichkeit", "g_schulter"],
  "mob_biceps":["beweglichkeit", "g_schulter", "g_handgelenk"],
  "mob_cobra":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_reardelt":["beweglichkeit", "g_schulter"],
  "mob_triceps":["beweglichkeit", "g_schulter"],
  "mob_neck":["beweglichkeit"],
  "mob_lat":["beweglichkeit", "g_schulter"],
  "mob_knee2chest":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_twist":["beweglichkeit", "g_huefte", "g_wirbelsaeule"],
  "mob_wrist_flex":["beweglichkeit", "g_handgelenk"],
  "mob_wrist_ext":["beweglichkeit", "g_handgelenk"],
  "mob_hipflex":["beweglichkeit", "g_huefte"],
  "mob_pigeon":["beweglichkeit", "g_huefte"],
  "mob_glutemed":["beweglichkeit", "g_huefte"],
  "mob_quad":["beweglichkeit", "g_huefte"],
  "mob_frog":["beweglichkeit", "g_huefte"],
  "mob_calf_straight":["beweglichkeit", "g_sprunggelenk", "g_huefte"],
  "mob_calf_bent":["beweglichkeit", "g_sprunggelenk"],
  "mob_tibialis":["beweglichkeit", "g_sprunggelenk"],
  "mob_catcow":["beweglichkeit", "g_wirbelsaeule"],
  "mob_wgs":["beweglichkeit", "g_sprunggelenk", "g_huefte", "g_wirbelsaeule"],
  "mob_legswing":["beweglichkeit", "g_huefte"],
  "mob_9090":["beweglichkeit", "g_huefte"],
  "mob_wrist_circ":["beweglichkeit", "g_handgelenk"]}
;

function exPlusList(ex){
  var ids=EX_PLUS[ex&&ex.id]||[];
  return ids.filter(function(id){return !!STRUCT[id];});
}

/* ================= Übungsdetail: Tabs Info/Verlauf/Fortschritt/Rekorde ================= */
function exDetailPlus(ex){
  var ids=exPlusList(ex);
  if(!ids.length)return null;
  var wrap=el("div","pluslist");
  ids.forEach(function(id){
    var st=STRUCT[id];
    var row=el("div","plusrow");
    var head=el("div","plushead");
    head.appendChild(el("b",null,st.n));
    head.appendChild(el("span","pluskind",st.k));
    row.appendChild(head);
    row.appendChild(el("p",null,st.t));
    wrap.appendChild(row);
  });
  var note=el("p","note pluslead",
    "Zählt nicht ins Trainingsvolumen - diese Strukturen lassen sich nicht in Sätzen pro Woche messen. Sie werden trotzdem mitbelastet und brauchen meist länger, um sich anzupassen, als der Muskel.");
  wrap.insertBefore(note,wrap.firstChild);
  return wrap;
}

function exDetailInfo(ex){
  var wrap=el("div");
  var figs=woFigs(ex);figs.classList.add("exdetail-figs");wrap.appendChild(figs);
  wrap.appendChild(woMus(ex,figs));
  return wrap;
}

// onChange wird nach dem Bearbeiten/Löschen eines vergangenen Satzes aufgerufen, damit die
// gesamte Detailseite (Verlauf/Fortschritt/Rekorde hängen alle an denselben Daten) neu gezeichnet wird.
function exDetailHistory(ex,onChange){
  var wrap=el("div"),rows=exSetsByDay(ex.id).slice().reverse();
  if(!rows.length){wrap.appendChild(el("p","note","Noch keine Sätze für diese Übung eingetragen."));return wrap;}
  rows.forEach(function(r){
    var row=el("div","exd-hrow");
    row.appendChild(el("b",null,deDate(r.date)));
    var line=el("div","exd-hsets");
    r.sets.forEach(function(s){
      var idx=state.days[r.date].sets.indexOf(s);
      var chip=el("button","exd-hset",setLabel(ex,s));chip.type="button";
      chip.setAttribute("aria-label","Satz bearbeiten");
      chip.onclick=function(){sheetEditLoggedSet(ex,r.date,idx,onChange);};
      line.appendChild(chip);
    });
    row.appendChild(line);
    wrap.appendChild(row);
  });
  return wrap;
}

// Schlichter SVG-Linienchart ohne externe Bibliothek – reicht für eine Kennzahl über die Zeit.
function svgLineChart(points){
  if(points.length<2)return el("p","note","Für einen Verlauf braucht es mindestens 2 Trainingstage mit dieser Übung.");
  var w=320,h=120,pad=6,padB=4,n=points.length;
  var vals=points.map(function(p){return p.val;});
  var minV=Math.min.apply(null,vals),maxV=Math.max.apply(null,vals);
  if(minV===maxV){minV-=1;maxV+=1;}
  function X(i){return pad+i/(n-1)*(w-2*pad);}
  function Y(v){return h-padB-(v-minV)/(maxV-minV)*(h-2*padB);}
  var d="M"+points.map(function(p,i){return X(i)+","+Y(p.val);}).join(" L");
  var svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
  svg.setAttribute("viewBox","0 0 "+w+" "+h);svg.setAttribute("class","exd-chart");svg.setAttribute("preserveAspectRatio","none");
  var path=document.createElementNS(svg.namespaceURI,"path");path.setAttribute("d",d);path.setAttribute("class","exd-chart-line");
  svg.appendChild(path);
  points.forEach(function(p,i){
    var c=document.createElementNS(svg.namespaceURI,"circle");
    c.setAttribute("cx",X(i));c.setAttribute("cy",Y(p.val));c.setAttribute("r",i===n-1?4:2.2);
    c.setAttribute("class","exd-chart-dot"+(i===n-1?" last":""));
    svg.appendChild(c);
  });
  var wrap=el("div","exd-chart-wrap");wrap.appendChild(svg);
  var lab=el("div","exd-chart-labels");
  lab.appendChild(el("span",null,shortDate(points[0].date)));
  lab.appendChild(el("span",null,shortDate(points[n-1].date)));
  wrap.appendChild(lab);
  return wrap;
}

function exDetailProgress(ex){
  var wrap=el("div"),pts=exBestByDay(ex);
  if(!pts.length){wrap.appendChild(el("p","note","Noch keine Sätze für diese Übung eingetragen."));return wrap;}
  var last=pts[pts.length-1];
  var head=el("div","exd-nowval");
  head.appendChild(el("b",null,fmtBestVal(ex,last.val,last.set)));
  head.appendChild(el("span",null,"Letzter Bestwert · "+deDate(last.date)));
  wrap.appendChild(head);
  wrap.appendChild(svgLineChart(pts));
  // Vergleich mit dem ältesten Wert, der mindestens ~3 Wochen zurückliegt – zeigt die Richtung,
  // ohne bei sehr dichtem Training nur den direkten Vorwert zu vergleichen.
  var cmpIdx=-1;
  for(var i=pts.length-2;i>=0;i--){if(daysBetween(pts[i].date,last.date)>=21){cmpIdx=i;break;}}
  if(cmpIdx>=0){
    var before=pts[cmpIdx],diff=last.val-before.val,pct=before.val>0?Math.round(diff/before.val*100):null;
    wrap.appendChild(el("p","note",
      (diff>=0?"+":"")+(ex.t==="load"?Math.round(diff*2)/2:Math.round(diff))+" "+unitOf(ex.t)+
      (pct!=null?" ("+(pct>=0?"+":"")+pct+"%)":"")+" seit "+deDate(before.date)));
  }
  return wrap;
}

function exDetailRecords(ex){
  var wrap=el("div"),rows=exSetsByDay(ex.id);
  if(!rows.length){wrap.appendChild(el("p","note","Noch keine Sätze für diese Übung eingetragen."));return wrap;}
  var bestVal=null,bestValDate=null,bestKg=null,bestKgSet=null,bestKgDate=null;
  var bestValSet=null,bestReps=null,bestRepsDate=null,bestRepsSet=null,totalSets=0;
  rows.forEach(function(r){
    r.sets.forEach(function(s){
      totalSets++;
      var v=setValue(ex,s);
      if(bestVal==null||v>bestVal){bestVal=v;bestValDate=r.date;bestValSet=s;}
      if(ex.t==="load"&&(bestKg==null||s.kg>bestKg)){bestKg=s.kg;bestKgSet=s;bestKgDate=r.date;}
      var reps=(ex.uni&&s.repsL!=null&&s.repsR!=null)?Math.min(s.repsL,s.repsR):s.reps;
      if(reps!=null&&(bestReps==null||reps>bestReps)){bestReps=reps;bestRepsDate=r.date;bestRepsSet=s;}
    });
  });
  function card(lab,val,sub){
    var c=el("div","exd-rec");
    c.appendChild(el("span","exd-rec-lab",lab));
    c.appendChild(el("b",null,val));
    if(sub)c.appendChild(el("span","exd-rec-sub",sub));
    return c;
  }
  var grid=el("div","exd-recgrid");
  grid.appendChild(card(ex.t==="load"?"Bester e1RM":"Bestwert",fmtBestVal(ex,bestVal,bestValSet),deDate(bestValDate)));
  if(ex.t==="load")grid.appendChild(card("Höchstes Gewicht",bestKg+" kg",setLabel(ex,bestKgSet)+" · "+deDate(bestKgDate)));
  grid.appendChild(card(ex.t==="sec"?"Längste Haltezeit":"Meiste Wiederholungen",bestReps+(ex.t==="sec"?" s":" Wdh"),(ex.uni&&bestRepsSet&&bestRepsSet.repsL!=null&&bestRepsSet.repsR!=null?setLabel(ex,bestRepsSet)+" · ":"")+deDate(bestRepsDate)));
  grid.appendChild(card("Trainiert",rows.length+" Tage",totalSets+" Sätze insgesamt"));
  grid.appendChild(card("Zuletzt trainiert",deDate(rows[rows.length-1].date)));
  var g=grade(ex,bestVal);
  if(g)grid.appendChild(card("Aktuelle Kraftstufe",g.name,g.next?"nächste Stufe ab "+fmtVal(g.next,ex.t):"höchste Stufe erreicht"));
  wrap.appendChild(grid);
  return wrap;
}

/* ---- Reihenfolge der Uebungen im laufenden Training ----
   Die Position in workout.exercises ist reine Anzeige: geloggte Saetze haengen an ihrem
   eigenen Datensatz (st.rec), Ausdauer an we.cardioRec - beide kennen ihre Uebung selbst.
   Verschieben kann also nichts loeschen und keine Eintraege verschieben.
   Die gerade angesehene Uebung bleibt sichtbar, auch wenn sie dabei die Position wechselt. */
function woMoveEx(from,to){
  if(!workout)return false;
  var n=workout.exercises.length;
  if(from<0||from>=n||to<0||to>=n||from===to)return false;
  var seen=workout.exercises[woPage]||null;
  var it=workout.exercises.splice(from,1)[0];
  workout.exercises.splice(to,0,it);
  if(seen){var ni=workout.exercises.indexOf(seen);if(ni>=0)woPage=ni;}
  saveWorkout();renderSession();
  return true;
}

function openReorderSheet(){
  if(!workout||workout.exercises.length<2)return;
  openSheet(function(b){
    sheetTitle(b,"Reihenfolge ändern");
    var list=el("div","card flush");list.style.marginTop="2px";
    function draw(){
      list.innerHTML="";
      workout.exercises.forEach(function(we,i){
        var ex=exById(we.ex);
        var row=el("div","row wo-ordrow"+(i===woPage?" cur":""));
        row.appendChild(el("span","wo-ordnum num",String(i+1)));
        var mn=el("div","main");
        mn.appendChild(el("b",null,ex?ex.n:"Übung"));
        var sub;
        if(we.sets){
          var dn2=0;we.sets.forEach(function(st){if(st.done)dn2++;});
          sub=dn2+" von "+we.sets.length+" Sätzen";
        }else sub="Ausdauer";
        mn.appendChild(el("span",null,sub));
        row.appendChild(mn);
        var up=el("button","iconbtn");up.setAttribute("aria-label","Nach oben schieben");
        up.innerHTML=svgIcon("M12 19V5M5 12l7-7 7 7",2.1);
        up.disabled=(i===0);
        var dw=el("button","iconbtn");dw.setAttribute("aria-label","Nach unten schieben");
        dw.innerHTML=svgIcon("M12 5v14M5 12l7 7 7-7",2.1);
        dw.disabled=(i===workout.exercises.length-1);
        (function(k){
          up.onclick=function(){if(woMoveEx(k,k-1))draw();};
          dw.onclick=function(){if(woMoveEx(k,k+1))draw();};
        })(i);
        row.appendChild(up);row.appendChild(dw);
        list.appendChild(row);
      });
    }
    draw();
    b.appendChild(list);
    b.appendChild(el("p","setpage-note","Bereits abgehakte Sätze bleiben erhalten – verschoben wird nur die Reihenfolge, in der die Übungen angezeigt werden."));
    var ok=el("button","btn primary block","Fertig");ok.style.marginTop="14px";
    ok.onclick=closeSheet;b.appendChild(ok);
  });
}

function woAddPage(){
  var pg=el("article","wo-page wo-addpage");pg.setAttribute("data-i",String(workout.exercises.length));
  var b=el("button","wo-plus");b.setAttribute("aria-label","Übung hinzufügen");
  b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';
  b.onclick=function(){openSheet(function(bb){sheetTitle(bb,"Übung hinzufügen");
    exPicker(bb,null,function(e){
      closeSheet();
      // Cardio passt nicht in das Satz-Schema (Minuten/km statt Gewicht/Wdh) - dafuer oeffnet
      // sich der Ausdauer-Dialog statt einer neuen Uebungsseite, mit dieser Aktivitaet schon
      // vorausgewaehlt, und dem laufenden Training zugeordnet (wid), genau wie ein Satz.
      if(e.t==="cardio")addWorkoutCardio(e);
      else addWorkoutExercise(e);
    },{cardio:true});
  });};
  pg.appendChild(b);
  pg.appendChild(el("p",null,workout.exercises.length?"Tipp auf das Plus für die nächste Übung.":"Tipp auf das Plus und füge deine erste Übung hinzu."));
  return pg;
}
