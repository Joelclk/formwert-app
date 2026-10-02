/* Formwert - Lesekopie, nicht ausfuehrbar.
   Erzeugt aus formwert_app.html von werkzeug/zerlegen.py.
   Enthaelt: GROUPS bis (Anweisung)
*/

/* ============================================================
   DATEN: Muskeln, Übungskatalog, Kraftstandards, Körperkarte
   ============================================================ */

/* --- Muskelgruppen mit Volumen-Landmarks (Sätze/Woche, RP/Israetel) --- */
// "rec" = grobe Erholungszeit in Stunden bis zur nächsten Belastung (größere Muskelgruppen
// brauchen üblicherweise länger als kleine Stabilisatoren) – Richtwert, keine individuelle Messung.
var GROUPS={
 bones:{label:"Knochen",color:0xE4DCC3,tier:"C"},
 tg_adduktoren:{label:"Adduktoren",color:0x8A5FE0,tier:"A"},
 tg_bauch:{label:"Bauch (Abs)",color:0x4A9BD9,tier:"obergruppe"},
 tg_bauch_gerade:{label:"Gerade Bauchmuskeln",color:0x4A9BD9,tier:"A",parent:"tg_bauch"},
 tg_bauch_schraeg:{label:"Schräge Bauchmuskeln",color:0x83BFE6,tier:"A",parent:"tg_bauch"},
 tg_bauch_tief:{label:"Tiefe Rumpf- & Atemmuskulatur",color:0x2F6FA3,tier:"A",parent:"tg_bauch"},
 tg_beckenboden:{label:"Beckenboden",color:0xA8418F,tier:"C"},
 tg_bizeps:{label:"Bizeps",color:0xE0955F,tier:"A"},
 tg_brust:{label:"Brust",color:0xE0555F,tier:"obergruppe"},
 tg_brust_hilf:{label:"Hilfsmuskeln Brustkorb",color:0x93313A,tier:"B",parent:"tg_brust",faerbtMit:"tg_brust_serratus"},
 tg_brust_mitte:{label:"Brust Mitte",color:0xE0555F,tier:"A",parent:"tg_brust"},
 tg_brust_ober:{label:"Brust oben",color:0xF08088,tier:"A",parent:"tg_brust"},
 tg_brust_serratus:{label:"Serratus anterior",color:0xF7B6BA,tier:"A",parent:"tg_brust"},
 tg_brust_unten:{label:"Brust unten",color:0xBF424B,tier:"A",parent:"tg_brust"},
 tg_fuss:{label:"Fuß",color:0xC96F4A,tier:"B",faerbtMit:"tg_wade_gastro"},
 tg_gesaess:{label:"Gesäß",color:0xE05FC0,tier:"obergruppe"},
 tg_gesaess_haupt:{label:"Großer Gesäßmuskel",color:0xE05FC0,tier:"A",parent:"tg_gesaess"},
 tg_gesaess_med:{label:"Mittlerer Gesäßmuskel",color:0xC94FA8,tier:"A",parent:"tg_gesaess"},
 tg_gesaess_min:{label:"Kleiner Gesäßmuskel",color:0xF08FD4,tier:"A",parent:"tg_gesaess"},
 tg_hals:{label:"Hals",color:0x9B7FD9,tier:"C"},
 tg_hals_nacken:{label:"Vordere/seitliche Halsmuskulatur",color:0x7FA8D9,tier:"A"},
 tg_hand:{label:"Hand",color:0x4AB8C9,tier:"B",faerbtMit:"tg_unterarm_beug"},
 tg_huefte:{label:"Hüftbeuger",color:0xA8663F,tier:"A"},
 tg_huefte_rot:{label:"Tiefe Hüftrotatoren",color:0xEC93D5,tier:"B",parent:"tg_gesaess",faerbtMit:"tg_gesaess_haupt"},
 tg_keine:{label:"Keine Zuordnung",color:0x8A97A8,tier:"C"},
 tg_kniesehnen:{label:"Beinbeuger",color:0xB25FE0,tier:"A"},
 tg_kopf:{label:"Kopf & Gesicht",color:0xD97F9B,tier:"C"},
 tg_kopfform:{label:"Kopfform",color:0xB0ABA2,tier:"kopfform"},
 tg_nacken:{label:"Nacken",color:0x6F9BD9,tier:"A"},
 tg_quadrizeps:{label:"Quadrizeps",color:0x5F7FE0,tier:"A"},
 tg_rueck_lat:{label:"Latissimus dorsi",color:0x5FAE4A,tier:"A",parent:"tg_ruecken"},
 tg_rueck_teres_major:{label:"Teres major",color:0x4A9B6E,tier:"A",parent:"tg_ruecken"},
 tg_rueck_rhomb:{label:"Rhomboiden",color:0x7ABF66,tier:"A",parent:"tg_ruecken"},
 tg_rueck_strecker:{label:"Rückenstrecker (tief)",color:0x3C7A2E,tier:"A",parent:"tg_ruecken"},
 tg_rueck_trapez_ob:{label:"Trapez oben",color:0xB8E0A8,tier:"A",parent:"tg_nacken"},
 tg_rueck_trapez_mit:{label:"Trapez Mitte",color:0x9AD68A,tier:"A",parent:"tg_ruecken"},
 tg_rueck_trapez_unt:{label:"Trapez unten",color:0x7ABF66,tier:"A",parent:"tg_ruecken"},
 tg_ruecken:{label:"Rücken",color:0x5FAE4A,tier:"obergruppe"},
 tg_schulter_hint:{label:"Hintere Schulter",color:0x2F7A67,tier:"A",parent:"tg_schultern"},
 tg_schulter_rot_infra:{label:"Infraspinatus",color:0xA8DCCE,tier:"A",parent:"tg_schultern"},
 tg_schulter_rot_teres_min:{label:"Teres minor",color:0x8FCBB8,tier:"A",parent:"tg_schultern"},
 tg_schulter_rot_sub:{label:"Subscapularis",color:0xC2E8DC,tier:"A",parent:"tg_schultern"},
 tg_schulter_rot_supra:{label:"Supraspinatus",color:0x79B8A3,tier:"A",parent:"tg_schultern"},
 tg_schulter_seit:{label:"Seitliche Schulter",color:0x79C8B2,tier:"A",parent:"tg_schultern"},
 tg_schulter_vorn:{label:"Vordere Schulter",color:0x4AA88F,tier:"A",parent:"tg_schultern"},
 tg_schultern:{label:"Schultern",color:0x4AA88F,tier:"obergruppe"},
 tg_sehnen:{label:"Sehnen & Bindegewebe",color:0xD9A83F,tier:"C"},
 tg_trizeps:{label:"Trizeps",color:0xD9B34A,tier:"obergruppe"},
 tg_trizeps_lang:{label:"Trizeps langer Kopf",color:0xD9B34A,tier:"A",parent:"tg_trizeps"},
 tg_trizeps_lat:{label:"Trizeps lateral & medial",color:0xEDD394,tier:"A",parent:"tg_trizeps"},
 tg_unterarm_beug:{label:"Unterarmbeuger & Pronatoren",color:0x4AC9A0,tier:"A",parent:"tg_unterarme"},
 tg_unterarm_streck:{label:"Unterarmstrecker & Supinatoren",color:0x8FDEC4,tier:"A",parent:"tg_unterarme"},
 tg_unterarme:{label:"Unterarme",color:0x4AC9A0,tier:"obergruppe"},
 tg_wade_fussheber:{label:"Schienbein / Fußheber",color:0xF0A8C0,tier:"A",parent:"tg_waden"},
 tg_wade_gastro:{label:"Wadenheber stehend",color:0xE05F8A,tier:"A",parent:"tg_waden"},
 tg_wade_soleus:{label:"Wadenheber sitzend",color:0xB03A62,tier:"A",parent:"tg_waden"},
 tg_wade_tief:{label:"Tiefe Unterschenkelmuskulatur",color:0x8A2E4E,tier:"B",parent:"tg_waden",faerbtMit:"tg_wade_gastro"},
 tg_waden:{label:"Waden",color:0xB0B6BE,tier:"obergruppe"}
}
;

var MUSCLES=[
 {id:"tg_brust_ober",name:"Brust oben",mev:4, mav:7, mrv:11, view:"front", rec:48},
 {id:"tg_brust_mitte",name:"Brust Mitte",mev:6, mav:9, mrv:14, view:"front", rec:48},
 {id:"tg_brust_unten",name:"Brust unten",mev:3, mav:6, mrv:9, view:"front", rec:48},
 {id:"tg_brust_serratus",name:"Serratus anterior",mev:4, mav:8, mrv:12, view:"front", rec:24},
 {id:"tg_bizeps",name:"Bizeps",mev:6, mav:12, mrv:18, view:"front", rec:36},
 // Der Brachialis liegt unter dem Bizeps und ist ein reiner Ellenbogenbeuger - anders als der
 // Bizeps dreht er nicht mit und arbeitet deshalb in JEDER Beugebewegung, unabhaengig vom Griff.
 // Sein Korridor ist bewusst derselbe wie beim Bizeps: er wird von denselben Saetzen belastet,
 // und eine eigene Zahl waere erfunden - fuer den Brachialis gibt es keine eigenen Richtwerte.
 {id:"tg_brachialis",name:"Brachialis",mev:6, mav:12, mrv:18, view:"front", rec:36},
 {id:"tg_trizeps_lang",name:"Trizeps langer Kopf",mev:5, mav:10, mrv:16, view:"back", rec:36},
 {id:"tg_trizeps_lat",name:"Trizeps lateral & medial",mev:6, mav:12, mrv:18, view:"back", rec:36},
 {id:"tg_rueck_lat",name:"Latissimus dorsi",mev:10, mav:16, mrv:22, view:"back", rec:48},
 {id:"tg_rueck_teres_major",name:"Teres major",mev:3, mav:8, mrv:12, view:"back", rec:36},
 {id:"tg_rueck_trapez_ob",name:"Trapez oben",mev:3, mav:8, mrv:14, view:"back", rec:36},
 {id:"tg_rueck_trapez_mit",name:"Trapez Mitte",mev:4, mav:10, mrv:16, view:"back", rec:36},
 {id:"tg_rueck_trapez_unt",name:"Trapez unten",mev:3, mav:8, mrv:14, view:"back", rec:36},
 {id:"tg_rueck_rhomb",name:"Rhomboiden",mev:8, mav:14, mrv:20, view:"back", rec:36},
 {id:"tg_rueck_strecker",name:"Rückenstrecker (tief)",mev:4, mav:8, mrv:14, view:"back", rec:48},
 {id:"tg_schulter_vorn",name:"Vordere Schulter",mev:0, mav:6, mrv:12, view:"front", rec:36},
 {id:"tg_schulter_seit",name:"Seitliche Schulter",mev:8, mav:16, mrv:24, view:"front", rec:36},
 {id:"tg_schulter_hint",name:"Hintere Schulter",mev:6, mav:12, mrv:20, view:"back", rec:36},
 {id:"tg_schulter_rot_infra",name:"Infraspinatus",mev:3, mav:8, mrv:12, view:"back", rec:24},
 {id:"tg_schulter_rot_teres_min",name:"Teres minor",mev:2, mav:6, mrv:10, view:"back", rec:24},
 {id:"tg_schulter_rot_sub",name:"Subscapularis",mev:2, mav:6, mrv:10, view:"back", rec:24},
 {id:"tg_schulter_rot_supra",name:"Supraspinatus",mev:2, mav:5, mrv:8, view:"back", rec:24},
 {id:"tg_bauch_gerade",name:"Gerade Bauchmuskeln",mev:4, mav:9, mrv:15, view:"front", rec:24},
 {id:"tg_bauch_schraeg",name:"Schräge Bauchmuskeln",mev:4, mav:8, mrv:14, view:"front", rec:24},
 {id:"tg_bauch_tief",name:"Tiefe Rumpf- & Atemmuskulatur",mev:2, mav:6, mrv:10, view:"back", rec:24},
 {id:"tg_quadrizeps",name:"Quadrizeps",mev:8, mav:14, mrv:20, view:"front", rec:48},
 {id:"tg_huefte",name:"Hüftbeuger",mev:2, mav:6, mrv:10, view:"front", rec:36},
 {id:"tg_adduktoren",name:"Adduktoren",mev:4, mav:8, mrv:14, view:"front", rec:36},
 {id:"tg_kniesehnen",name:"Beinbeuger",mev:6, mav:11, mrv:16, view:"back", rec:48},
 {id:"tg_gesaess_haupt",name:"Großer Gesäßmuskel",mev:4, mav:12, mrv:18, view:"back", rec:48},
 {id:"tg_gesaess_med",name:"Mittlerer Gesäßmuskel",mev:4, mav:9, mrv:14, view:"back", rec:36},
 {id:"tg_gesaess_min",name:"Kleiner Gesäßmuskel",mev:2, mav:6, mrv:10, view:"back", rec:36},
 {id:"tg_wade_gastro",name:"Wadenheber stehend",mev:8, mav:14, mrv:20, view:"back", rec:36},
 {id:"tg_wade_soleus",name:"Wadenheber sitzend",mev:6, mav:12, mrv:18, view:"back", rec:36},
 {id:"tg_wade_fussheber",name:"Schienbein / Fußheber",mev:2, mav:4, mrv:8, view:"front", rec:24},
 {id:"tg_unterarm_beug",name:"Unterarmbeuger & Pronatoren",mev:4, mav:8, mrv:14, view:"front", rec:24},
 {id:"tg_unterarm_streck",name:"Unterarmstrecker & Supinatoren",mev:2, mav:6, mrv:10, view:"back", rec:24},
 {id:"tg_nacken",name:"Nacken",mev:3, mav:8, mrv:14, view:"back", rec:24},
 {id:"tg_hals_nacken",name:"Vordere/seitliche Halsmuskulatur",mev:2, mav:6, mrv:10, view:"front", rec:24}
];


/* --- Bewegungsmuster --- */
var PATTERNS=[
 {id:"push_h", name:"Drücken waagerecht", q:"Deine Hauptübung fürs waagerechte Drücken"},
 {id:"push_v", name:"Drücken über Kopf",  q:"Deine Hauptübung fürs Drücken über Kopf"},
 {id:"pull_v", name:"Ziehen senkrecht",   q:"Deine Hauptübung fürs Ziehen von oben"},
 {id:"pull_h", name:"Ziehen waagerecht",  q:"Deine Hauptübung fürs Rudern"},
 {id:"squat",  name:"Kniebeuge-Muster",   q:"Deine Hauptübung für die Oberschenkel"},
 {id:"hinge",  name:"Hüftstreckung",      q:"Deine Hauptübung für Rücken und Hüfte"},
 {id:"core",   name:"Rumpf",              q:"Deine Hauptübung für den Rumpf"},
 {id:"cardio", name:"Ausdauer",           q:"Deine bevorzugte Ausdauerform"}
];


/* --- Übungskatalog ---
   t: load = kg×Wdh | reps = Wiederholungen | sec = Sekunden | cardio = Zeit/Distanz
   p: Primärmuskeln (Faktor 1,0) · s: Sekundärmuskeln (Faktor 0,5)
   e: Equipment · std: Schlüssel der Kraftstandard-Tabelle                          */
var EX=[
/* --- Drücken waagerecht --- */
{id:"bench",       n:"Bankdrücken Langhantel",   t:"load", pat:"push_h", e:"Langhantel", p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_trizeps_lat","tg_schulter_vorn"], std:"bench", how:"Rückenlage auf der Flachbank, Griff etwas breiter als schulterbreit. Stange zur Brustmitte absenken, Schulterblätter dabei zusammengezogen lassen, dann explosiv nach oben drücken, ohne die Hüfte von der Bank zu heben."},
{id:"bench_db",    n:"Bankdrücken Kurzhantel",   t:"load", pat:"push_h", e:"Kurzhantel", p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_trizeps_lat","tg_schulter_vorn","tg_brust_serratus"], std:"bench",sf:0.90, wt:"side", how:"Wie Bankdrücken, aber mit einer Kurzhantel in jeder Hand. Die Hanteln erlauben einen etwas größeren Bewegungsradius und mehr Stabilisationsarbeit – Ellbogen nicht komplett durchdrücken, Handgelenke gerade halten."},
{id:"bench_inc",   n:"Schrägbankdrücken",        t:"load", pat:"push_h", e:"Langhantel", p:["tg_brust_ober","tg_schulter_vorn"], s:["tg_brust_mitte","tg_trizeps_lat"], std:"bench",sf:0.85, how:"Schrägbank auf 30–45°. Stange zur oberen Brust absenken, Ellbogen etwa 45° zum Körper, dann nach oben drücken. Je steiler die Bank, desto mehr Schulterbeteiligung."},
{id:"bench_inc_db",n:"Schrägbankdrücken Kurzhantel",t:"load", pat:"push_h", e:"Kurzhantel", p:["tg_brust_ober","tg_schulter_vorn"], s:["tg_brust_mitte","tg_trizeps_lat","tg_brust_serratus"], st:["tg_brust_unten","tg_trizeps_lang"], std:"bench",sf:0.78,est:true, wt:"side", how:"Wie Schrägbankdrücken, mit Kurzhanteln. Am Ende der Bewegung die Hanteln leicht zueinander führen, um die obere Brust stärker zu spannen."},
{id:"bench_dec",   n:"Negativbankdrücken",       t:"load", pat:"push_h", e:"Langhantel", p:["tg_brust_unten"], s:["tg_brust_mitte","tg_trizeps_lat"], std:"bench",sf:1.05,est:true, how:"Negativbank (Kopf tiefer als Becken). Stange zur unteren Brust führen und wieder hochdrücken – betont den unteren Brustmuskel stärker als klassisches Bankdrücken."},
{id:"machine_press",n:"Brustpresse Maschine",    t:"load", pat:"push_h", e:"Maschine",   p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_trizeps_lat","tg_schulter_vorn"], std:"bench",sf:0.90, how:"An der Brustpresse Griffe auf Brusthöhe fassen, Rücken an die Lehne. Nach vorne drücken, ohne die Ellbogen ganz durchzustrecken, dann kontrolliert zurückführen."},
{id:"machine_press_lying",n:"Brustpresse liegend",t:"load", pat:"push_h", e:"Maschine",   p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_trizeps_lat","tg_schulter_vorn"], st:["tg_trizeps_lang"], std:"bench",sf:0.95,est:true, how:"Liegende Variante der Brustpresse: Rücken flach auf der Bank, Griffe nach oben/vorne drücken, kontrolliert zurück zur Ausgangsposition."},
{id:"pushup",      n:"Liegestütze",              t:"reps", pat:"push_h", e:"Körpergewicht", p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_trizeps_lat","tg_schulter_vorn","tg_bauch_gerade","tg_brust_serratus"], std:"pushup", how:"Körper von Kopf bis Ferse eine gerade Linie, Hände etwas außerhalb der Schultern. Brust kontrolliert bis kurz über den Boden absenken, dann hochdrücken, ohne das Becken durchhängen zu lassen."},
{id:"pushup_diamond",n:"Diamant-Liegestütze",    t:"reps", pat:"push_h", e:"Körpergewicht", p:["tg_trizeps_lat"], s:["tg_brust_mitte","tg_schulter_vorn"], std:"pushup",sf:0.72,est:true, how:"Wie Liegestütze, aber Daumen und Zeigefinger beider Hände bilden eine Raute unter der Brust. Betont Trizeps und innere Brust stärker, Ellbogen bleiben nah am Körper."},
{id:"pushup_arch", n:"Archer-Liegestütze",       t:"reps", pat:"push_h", e:"Körpergewicht", p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_trizeps_lat","tg_schulter_vorn","tg_bauch_gerade"], std:"pushup",sf:0.4,est:true, how:"Einseitige Liegestütz-Variante: ein Arm bleibt gestreckt weit außen, der andere führt die Druckbewegung aus – deutlich mehr Last auf dem arbeitenden Arm."},
{id:"pushup_dec",  n:"Liegestütze Füße erhöht",  t:"reps", pat:"push_h", e:"Körpergewicht", p:["tg_brust_ober","tg_schulter_vorn"], s:["tg_brust_mitte","tg_trizeps_lat","tg_brust_serratus"], std:"pushup",sf:0.70, how:"Füße erhöht auf einer Bank oder Stufe, Hände am Boden. Erhöht den Anteil der oberen Brust und Schulter gegenüber der klassischen Liegestütze."},
{id:"dips",        n:"Dips",                     t:"reps", pat:"push_h", e:"Parallettes", p:["tg_brust_unten","tg_trizeps_lat"], s:["tg_brust_mitte","tg_schulter_vorn","tg_brust_serratus"], st:["tg_trizeps_lang"], std:"dips", how:"An den Parallettes/Barren mit gestreckten Armen abstützen, Oberkörper leicht nach vorne geneigt für mehr Brustbeteiligung. Absenken bis die Oberarme etwa parallel zum Boden sind, dann hochdrücken."},
{id:"fly_db",      n:"Fliegende Kurzhantel",     t:"load", pat:"push_h", e:"Kurzhantel", p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_schulter_vorn"], std:"bench",sf:0.45,est:true, wt:"side", how:"Rückenlage, Kurzhanteln über der Brust mit leicht gebeugten Ellbogen. Arme bogenförmig zur Seite absenken, bis eine Dehnung in der Brust spürbar ist, dann auf demselben Weg zurückführen."},
{id:"cable_fly",   n:"Fliegende am Kabelzug",       t:"load", pat:"push_h", e:"Kabelzug",   p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_schulter_vorn"], std:"bench",sf:0.5,est:true, how:"An zwei Kabelzügen stehend, Griffe vor dem Körper zusammenführen (bogenförmige Bewegung), Ellbogen leicht gebeugt. Kontrolliert zurück in die gedehnte Position."},
{id:"fly_machine", n:"Butterfly Maschine",       t:"load", pat:"push_h", e:"Maschine",   p:["tg_brust_mitte"], s:["tg_brust_ober","tg_brust_unten","tg_schulter_vorn"], std:"bench",sf:0.6,est:true, how:"Am Butterfly sitzend Polster/Griffe vor dem Körper zusammenführen, ohne den Rücken von der Lehne zu lösen, dann langsam wieder öffnen."},
{id:"pullover",    n:"Überzüge",                 t:"load", pat:"push_h", e:"Kurzhantel", p:["tg_rueck_lat","tg_brust_mitte"], s:["tg_brust_unten","tg_trizeps_lang","tg_brust_serratus","tg_rueck_teres_major"], std:"bench",sf:0.35,est:true, how:"Rückenlage (quer oder längs auf der Bank), Kurzhantel mit beiden Händen über der Brust halten. Mit leicht gebeugten Armen hinter den Kopf absenken, bis eine Dehnung im Lat/Brustkorb spürbar ist, dann zurückführen."},

/* --- Drücken über Kopf --- */
{id:"ohp",         n:"Schulterdrücken Langhantel",t:"load",pat:"push_v", e:"Langhantel", p:["tg_schulter_vorn"], s:["tg_trizeps_lat","tg_schulter_seit","tg_brust_serratus"], std:"ohp", how:"Langhantel auf Schulterhöhe, Griff schulterbreit. Aus dem Stand oder Sitz nach oben drücken, bis die Arme gestreckt sind, ohne stark ins Hohlkreuz zu gehen."},
{id:"ohp_db",      n:"Schulterdrücken Kurzhantel",t:"load",pat:"push_v", e:"Kurzhantel", p:["tg_schulter_vorn"], s:["tg_trizeps_lat","tg_schulter_seit","tg_brust_serratus"], std:"ohp",sf:0.90, wt:"side", how:"Wie Schulterdrücken, mit einer Kurzhantel in jeder Hand – erlaubt eine natürlichere Handgelenksposition und etwas mehr Bewegungsfreiheit."},
{id:"push_press",  n:"Push Press",               t:"load", pat:"push_v", e:"Langhantel", p:["tg_schulter_vorn"], s:["tg_trizeps_lat","tg_quadrizeps","tg_bauch_gerade","tg_brust_serratus"], std:"ohp",sf:1.20, how:"Wie Schulterdrücken, aber mit kurzem Kniebeuge-Impuls (Beine leicht beugen und strecken), um mehr Gewicht als beim reinen Schulterdrücken nach oben zu bringen."},
{id:"arnold",      n:"Arnold-Drücken",           t:"load", pat:"push_v", e:"Kurzhantel", p:["tg_schulter_vorn","tg_schulter_seit"], s:["tg_trizeps_lat"], std:"ohp",sf:0.85, wt:"side", how:"Kurzhanteln starten vor den Schultern mit Handflächen zum Körper. Während des Hochdrückens die Handflächen nach außen rotieren, oben zeigen sie nach vorne – kombiniert Druck- und Rotationsbewegung."},
{id:"pike_pushup", n:"Pike-Liegestütze",         t:"reps", pat:"push_v", e:"Körpergewicht", p:["tg_schulter_vorn"], s:["tg_trizeps_lat","tg_schulter_seit","tg_brust_serratus"], std:"pushup",sf:0.55,est:true, how:"Im umgekehrten V (Hüfte hoch, Hände und Füße am Boden) den Kopf zwischen den Händen absenken und wieder hochdrücken – Vorstufe zum Handstand-Drücken, betont die Schultern."},
{id:"hspu",        n:"Handstand-Liegestütze",    t:"reps", pat:"push_v", e:"Körpergewicht", p:["tg_schulter_vorn","tg_trizeps_lat"], s:["tg_schulter_seit","tg_rueck_trapez_ob","tg_brust_serratus"], std:"pushup",sf:0.2,est:true, how:"Im Handstand (idealerweise mit Rückenunterstützung an der Wand) den Kopf kontrolliert zum Boden absenken und wieder hochdrücken."},
{id:"handstand",   n:"Wand-Handstand halten",    t:"sec",  pat:"push_v", e:"Körpergewicht", p:["tg_schulter_vorn","tg_schulter_seit"], s:["tg_bauch_gerade","tg_trizeps_lat","tg_brust_serratus"], std:"handstand", how:"Handstand an der Wand aufbauen und die Position möglichst ruhig und mit angespanntem Rumpf halten – reine Haltezeit, keine Wiederholungen."},

/* --- Ziehen senkrecht --- */
{id:"pullup",      n:"Klimmzüge Obergriff",      t:"reps", pat:"pull_v", e:"Klimmzugstange", p:["tg_rueck_lat","tg_bizeps"], s:["tg_unterarm_beug","tg_unterarm_streck","tg_schulter_hint","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_rueck_teres_major","tg_rueck_rhomb"], std:"pullup", how:"Obergriff, schulterbreit bis etwas breiter. Aus dem Hang das Kinn über die Stange ziehen, Schulterblätter dabei nach unten ziehen, dann kontrolliert ablassen.", poseImgs:["__DATEN_ENTFERNT__image_png__46726_ZEICHEN__","__DATEN_ENTFERNT__image_png__40894_ZEICHEN__"], poseLabels:["Ausgangsposition","Endposition"]},
{id:"chinup",      n:"Klimmzüge Untergriff",     t:"reps", pat:"pull_v", e:"Klimmzugstange", p:["tg_rueck_lat","tg_bizeps"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_unterarm_beug","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_rueck_teres_major"], std:"pullup",sf:1.15, how:"Untergriff (Handflächen zum Gesicht), etwa schulterbreit. Zieht stärker den Bizeps mit ein als der Klimmzug im Obergriff, Bewegung sonst identisch."},
{id:"pullup_wide", n:"Klimmzüge weit",           t:"reps", pat:"pull_v", e:"Klimmzugstange", p:["tg_rueck_lat"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_bizeps","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_rueck_teres_major"], std:"pullup",sf:0.85, how:"Klimmzug mit deutlich breiterem Obergriff als schulterbreit – verkürzt den Bewegungsweg und betont den äußeren Latissimus stärker."},
{id:"pullup_weight",n:"Klimmzüge mit Zusatzgew.",t:"load", pat:"pull_v", e:"Klimmzugstange", p:["tg_rueck_lat"], s:["tg_bizeps","tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_rueck_teres_major"], std:"pullup_w",sf:1.0,est:true, how:"Klimmzug mit Zusatzgewicht (Gürtel oder Kurzhantel zwischen den Füßen) für alle, denen Körpergewicht allein nicht mehr genug Widerstand bietet."},
{id:"latpull",     n:"Latzug",                   t:"load", pat:"pull_v", e:"Kabelzug", p:["tg_rueck_lat"], s:["tg_bizeps","tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_rueck_teres_major"], std:"row",sf:0.95, how:"Am Kabelzug sitzend, Stange etwas breiter als schulterbreit greifen. Zur oberen Brust ziehen, Schulterblätter nach unten/hinten, dann kontrolliert zurückführen."},
{id:"latpull_close",n:"Latzug enger Griff",      t:"load", pat:"pull_v", e:"Kabelzug", p:["tg_rueck_lat","tg_bizeps"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_rueck_teres_major"], std:"row",sf:0.90,est:true, how:"Wie Latzug, mit engem (V-)Griff. Der geringere Griffabstand erhöht die Bewegungsamplitude und beteiligt den unteren Latissimus stärker."},
{id:"pullup_neg",  n:"Negativ-Klimmzüge",        t:"reps", pat:"pull_v", e:"Klimmzugstange", p:["tg_rueck_lat"], s:["tg_bizeps","tg_unterarm_beug","tg_rueck_teres_major"], std:"pullup",sf:1.8,est:true, how:"Auf die Stange steigen oder springen, Kinn über der Stange, dann so langsam wie möglich (3–5 Sekunden) ablassen – für alle, die noch keinen vollen Klimmzug schaffen."},
// pat "iso": Passives Hängen ist kein Zug-/Kraftmuster (kein "pull_v"), sondern hält primär
// den Unterarm-Griff (Primärmuskel wrist_flex) – zählt daher zur Kraftstufe "Arme", nicht "Rücken".
{id:"deadhang",    n:"Passives Hängen",          t:"sec",  pat:"iso", e:"Klimmzugstange", p:["tg_unterarm_beug"], s:["tg_rueck_lat","tg_rueck_trapez_unt","tg_rueck_rhomb","tg_rueck_teres_major"], std:"hang",sf:1.0,est:true, how:"Einfach entspannt an der Stange hängen, Schultern lang lassen (nicht aktiv hochziehen). Trainiert Griffkraft und dehnt die Wirbelsäule/Schultern."},

/* --- Ziehen waagerecht --- */
{id:"row_bb",      n:"Langhantel-Rudern",        t:"load", pat:"pull_h", e:"Langhantel", p:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_lat"], s:["tg_bizeps","tg_rueck_strecker","tg_schulter_hint","tg_rueck_teres_major"], std:"row", how:"Oberkörper vorgebeugt (ca. 45°), Langhantel mit geradem Rücken zum unteren Bauch/oberen Bauchnabel ziehen, Ellbogen nah am Körper, dann kontrolliert absenken."},
{id:"row_db",      n:"Kurzhantel-Rudern",        t:"load", pat:"pull_h", e:"Kurzhantel", p:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_lat"], s:["tg_bizeps","tg_schulter_hint","tg_rueck_teres_major"], std:"row",sf:0.90, uni:true, how:"Ein Knie und eine Hand auf der Bank abgestützt, mit der freien Hand die Kurzhantel seitlich am Oberkörper nach oben ziehen, Ellbogen nah am Körper führen."},
{id:"row_pendlay", n:"Pendlay-Rudern",           t:"load", pat:"pull_h", e:"Langhantel", p:["tg_rueck_rhomb","tg_rueck_trapez_mit"], s:["tg_rueck_lat","tg_bizeps","tg_rueck_strecker","tg_rueck_teres_major"], std:"row",sf:0.95, how:"Wie Langhantelrudern, aber die Stange kommt nach jeder Wiederholung zurück auf den Boden – jede Wiederholung startet explosiv aus der Ruhe, Rücken bleibt dabei parallel zum Boden."},
{id:"row_tbar",    n:"T-Bar-Rudern",             t:"load", pat:"pull_h", e:"Langhantel", p:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_lat"], s:["tg_bizeps","tg_schulter_hint","tg_rueck_teres_major"], std:"row",sf:1.00, how:"An der T-Bar-Rudermaschine (oder Langhantel in der Ecke) mit V-Griff oder breitem Griff zum Bauch ziehen, Oberkörper vorgebeugt und stabil halten."},
{id:"row_cable",   n:"Rudern am Kabelzug",       t:"load", pat:"pull_h", e:"Kabelzug",   p:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_lat"], s:["tg_bizeps","tg_schulter_hint","tg_rueck_teres_major"], std:"row",sf:0.95, how:"Sitzend am Kabelzug, Griff zum Bauch ziehen, Rücken dabei aufrecht und gerade halten, Schulterblätter am Ende zusammenziehen, dann kontrolliert zurückführen."},
{id:"row_machine", n:"Rudermaschine", t:"load", pat:"pull_h", e:"Maschine", p:["tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_rueck_lat","tg_rueck_trapez_mit"], s:["tg_bizeps","tg_unterarm_beug","tg_unterarm_streck","tg_schulter_hint","tg_rueck_teres_major","tg_rueck_rhomb","tg_rueck_trapez_unt"], std:"row",sf:0.95,est:true, how:"An der Rudermaschine (Hebel- bzw. Sitzruderer) Griffe zum Körper ziehen, Brust an die Polsterung gedrückt lassen, Schulterblätter aktiv zusammenführen."},
{id:"row_inv",     n:"Invertiertes Rudern",      t:"reps", pat:"pull_h", e:"Körpergewicht", p:["tg_rueck_rhomb","tg_rueck_trapez_mit"], s:["tg_rueck_lat","tg_bizeps","tg_schulter_hint","tg_rueck_teres_major"], std:"pushup",sf:0.55, how:"Unter einer niedrigen Stange oder an Ringen mit gestrecktem Körper hängen, Fersen am Boden. Brust zur Stange ziehen, Körper dabei als gerade Linie halten."},
{id:"row_band",    n:"Rudern Widerstandsband",   t:"reps", pat:"pull_h", e:"Band",       p:["tg_rueck_rhomb","tg_rueck_trapez_mit"], s:["tg_rueck_lat","tg_bizeps","tg_schulter_hint","tg_rueck_teres_major"], how:"Band vor dem Körper befestigen, mit beiden Enden zum Oberkörper ziehen, Ellbogen nah am Körper, Schulterblätter am Ende zusammenziehen."},
{id:"facepull",    n:"Face Pulls",               t:"load", pat:"pull_h", e:"Kabelzug",   p:["tg_schulter_hint"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_schulter_rot_infra","tg_schulter_rot_teres_min"], std:"row",sf:0.35,est:true, how:"Am Kabelzug mit Seil auf Gesichtshöhe, Seil zum Gesicht ziehen und die Enden am Ende der Bewegung auseinanderziehen (Außenrotation) – kräftigt die hintere Schulter und Rotatorenmanschette."},
{id:"shrug",       n:"Schulterheben",            t:"load", pat:"pull_h", e:"Langhantel", p:["tg_rueck_trapez_ob"], s:["tg_rueck_trapez_mit","tg_rueck_rhomb","tg_unterarm_beug","tg_nacken"], std:"deadlift",sf:0.7,est:true, how:"Langhantel oder Kurzhanteln vor dem Körper halten, Schultern gerade nach oben zu den Ohren ziehen (kein Rollen), kurz halten, dann kontrolliert absenken."},
{id:"shrug_db",    n:"Schulterheben Kurzhantel", t:"load", pat:"pull_h", e:"Kurzhantel", p:["tg_rueck_trapez_ob"], s:["tg_rueck_rhomb","tg_unterarm_beug","tg_nacken"], std:"deadlift",sf:0.55,est:true, wt:"side", how:"Wie Schulterheben, mit einer Kurzhantel in jeder Hand seitlich am Körper."},

/* --- Kniebeuge-Muster --- */
{id:"squat",       n:"Kniebeuge Langhantel",     t:"load", pat:"squat",  e:"Langhantel", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_rueck_strecker","tg_kniesehnen","tg_adduktoren","tg_bauch_tief"], std:"squat", how:"Langhantel im oberen Rücken (High- oder Low-Bar), Füße schulterbreit. In der Hüfte und den Knien beugen, bis die Oberschenkel mindestens parallel zum Boden sind, dann durch die Fersen zurück nach oben drücken."},
{id:"squat_front", n:"Frontkniebeuge",           t:"load", pat:"squat",  e:"Langhantel", p:["tg_quadrizeps"], s:["tg_gesaess_haupt","tg_bauch_gerade","tg_rueck_trapez_ob"], std:"squat",sf:0.85, how:"Langhantel vorne auf den Schultern (Frontrack), Ellbogen hoch. Aufrechter Oberkörper als bei der Kniebeuge, sonst gleiche Bewegung – betont die vordere Oberschenkelmuskulatur stärker."},
{id:"squat_goblet",n:"Goblet-Kniebeuge",         t:"load", pat:"squat",  e:"Kurzhantel", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_bauch_gerade","tg_adduktoren"], std:"squat",sf:0.50, how:"Eine Kurzhantel senkrecht vor der Brust halten, in die Hocke gehen, Ellbogen zwischen den Knien, dann zurück nach oben drücken – gute Einsteiger-Kniebeuge-Variante."},
{id:"squat_bw",    n:"Kniebeuge ohne Gewicht",   t:"reps", pat:"squat",  e:"Körpergewicht", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_adduktoren"], std:"bwsquat", how:"Kniebeuge ohne Zusatzgewicht: Füße schulterbreit, Arme zur Balance nach vorne strecken, tief in die Hocke gehen und wieder aufstehen."},
{id:"squat_pistol",n:"Pistol Squat",             t:"reps", pat:"squat",  e:"Körpergewicht", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_adduktoren","tg_bauch_gerade","tg_gesaess_med"], std:"bwsquat",sf:0.15,est:true, uni:true, how:"Einbeinige Kniebeuge: auf einem Bein stehend so tief wie möglich absenken, das andere Bein bleibt gestreckt nach vorne in der Luft, dann zurück nach oben drücken."},
{id:"squat_bulg",  n:"Bulgarischer Split Squat",    t:"load", pat:"squat",  e:"Kurzhantel", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_adduktoren","tg_kniesehnen","tg_gesaess_med"], std:"squat",sf:0.35,est:true, wt:"side", uni:true, how:"Hinterer Fuß erhöht auf einer Bank, vorderes Bein trägt die Hauptlast. In die Knie beugen, bis der hintere Knie fast den Boden berührt, dann über das vordere Bein zurück nach oben drücken."},
{id:"legpress",    n:"Beinpresse",               t:"load", pat:"squat",  e:"Maschine",   p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_kniesehnen","tg_adduktoren"], std:"squat",sf:2.00, how:"An der Beinpresse Füße schulterbreit auf der Plattform, Rücken flach an der Lehne. Knie zur Brust absenken, dann durch die Fersen nach oben drücken, ohne die Knie ganz durchzustrecken."},
{id:"hacksquat",   n:"Hackenschmidt-Kniebeuge",  t:"load", pat:"squat",  e:"Maschine",   p:["tg_quadrizeps"], s:["tg_gesaess_haupt"], std:"squat",sf:1.30, how:"An der Hackenschmidt-Maschine mit dem Rücken an der schrägen Lehne in die Knie gehen, bis die Oberschenkel etwa parallel sind, dann nach oben drücken."},
{id:"lunge",       n:"Ausfallschritte",          t:"load", pat:"squat",  e:"Kurzhantel", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_kniesehnen","tg_adduktoren","tg_gesaess_med"], std:"squat",sf:0.4,est:true, wt:"side", uni:true, how:"Kurzhanteln seitlich halten, großer Schritt nach vorne, hinteres Knie Richtung Boden absenken, dann kraftvoll zurück in den Stand drücken."},
{id:"lunge_walk",  n:"Gehende Ausfallschritte",  t:"load", pat:"squat",  e:"Kurzhantel", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_kniesehnen","tg_adduktoren","tg_gesaess_med"], std:"squat",sf:0.4,est:true, wt:"side", uni:true, how:"Wie Ausfallschritt, aber ohne zurückzutreten – nach dem Absenken direkt in den nächsten Schritt nach vorne übergehen, sodass man sich vorwärtsbewegt."},
{id:"stepup",      n:"Step-ups",                 t:"load", pat:"squat",  e:"Kurzhantel", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_kniesehnen","tg_wade_gastro","tg_bauch_gerade","tg_gesaess_med"], std:"squat",sf:0.35,est:true, wt:"side", uni:true, how:"Mit Kurzhanteln vor eine Erhöhung (Bank/Kiste) stellen, mit einem Bein hochsteigen, bis das Standbein gestreckt ist, dann kontrolliert wieder absteigen."},
{id:"stepup_bw",   n:"Step-ups ohne Gewicht",    t:"reps", pat:"squat",  e:"Körpergewicht", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_kniesehnen","tg_wade_gastro","tg_bauch_gerade","tg_gesaess_med"], std:"bwsquat",sf:0.40,est:true, uni:true, how:"Wie Step-ups, aber ohne Zusatzgewicht – reine Körpergewichtsvariante."},
{id:"legext",      n:"Beinstrecker",             t:"load", pat:"squat",  e:"Maschine",   p:["tg_quadrizeps"], s:[], std:"squat",sf:0.55,est:true, how:"Am Beinstrecker sitzend die Unterschenkel gegen das Polster nach oben strecken, bis die Beine fast gerade sind, dann langsam wieder absenken."},
{id:"sissy",       n:"Sissy Squat",              t:"reps", pat:"squat",  e:"Körpergewicht", p:["tg_quadrizeps"], s:["tg_bauch_gerade"], std:"bwsquat",sf:0.12,est:true, how:"Aus dem Stand, Fersen leicht angehoben oder an etwas festgehalten, den Oberkörper und die Knie nach vorne kippen und in die Knie absenken, dabei den Oberkörper gerade halten – starke Dehnung/Belastung vorne am Oberschenkel."},
{id:"wallsit",     n:"Wandsitzen",               t:"sec",  pat:"squat",  e:"Körpergewicht", p:["tg_quadrizeps"], s:["tg_gesaess_haupt"], std:"plank",sf:1.20, how:"Rücken flach an eine Wand lehnen, in die Hocke gehen, bis die Oberschenkel parallel zum Boden sind, und die Position halten."},
{id:"balance_sl",  n:"Einbeiniges Balancieren",  t:"sec",  pat:"squat",  e:"Körpergewicht", p:["tg_wade_gastro","tg_wade_soleus","tg_gesaess_med","tg_gesaess_min","tg_quadrizeps","tg_wade_fussheber"], s:[], std:"plank",sf:1.00,est:true, uni:true, how:"Auf einem Bein stehen und das Gleichgewicht möglichst lange halten, ohne den anderen Fuß abzusetzen – trainiert Stabilität in Knie und Sprunggelenk."},

/* --- Hüftstreckung --- */
{id:"deadlift",    n:"Kreuzheben",               t:"load", pat:"hinge",  e:"Langhantel", p:["tg_kniesehnen","tg_gesaess_haupt","tg_rueck_strecker"], s:["tg_rueck_trapez_ob","tg_rueck_lat","tg_unterarm_beug","tg_quadrizeps","tg_adduktoren","tg_bauch_tief","tg_rueck_teres_major"], st:["tg_wade_gastro","tg_bizeps"], std:"deadlift", how:"Langhantel dicht am Schienbein, Rücken gerade, Hüfte nach hinten. Über die Beine und den Rücken gleichzeitig aufrichten, Stange dabei nah am Körper führen, bis der Körper aufrecht steht."},
{id:"deadlift_rdl",n:"Rumänisches Kreuzheben",   t:"load", pat:"hinge",  e:"Langhantel", p:["tg_kniesehnen","tg_gesaess_haupt"], s:["tg_rueck_strecker","tg_unterarm_beug","tg_bauch_tief"], std:"deadlift",sf:0.85, how:"Mit fast gestreckten Beinen die Hüfte nach hinten schieben, Stange nah am Bein entlang bis knapp unter das Knie absenken (Rücken bleibt gerade), dann über die Hüfte wieder aufrichten – betont die Rückseite der Oberschenkel."},
{id:"deadlift_sumo",n:"Sumo-Kreuzheben",         t:"load", pat:"hinge",  e:"Langhantel", p:["tg_gesaess_haupt","tg_quadrizeps"], s:["tg_kniesehnen","tg_rueck_strecker","tg_adduktoren","tg_bauch_tief"], std:"deadlift",sf:1.00, how:"Breiter Stand, Zehen leicht nach außen, Griff innerhalb der Beine. Ähnlich wie klassisches Kreuzheben, aber aufrechterer Oberkörper und mehr Beteiligung der Oberschenkelinnenseite."},
{id:"deadlift_sl", n:"Einbeiniges Kreuzheben",   t:"load", pat:"hinge",  e:"Kurzhantel", p:["tg_kniesehnen","tg_gesaess_haupt"], s:["tg_rueck_strecker","tg_bauch_schraeg","tg_gesaess_med"], std:"deadlift",sf:0.35,est:true, wt:"side", uni:true, how:"Auf einem Bein stehend, mit einer Kurzhantel den Oberkörper nach vorne kippen, während das freie Bein nach hinten ausgestreckt wird, dann zurück in den Stand – trainiert Balance und die hintere Kette einseitig."},
{id:"hipthrust",   n:"Hip Thrust",               t:"load", pat:"hinge",  e:"Langhantel", p:["tg_gesaess_haupt"], s:["tg_kniesehnen"], std:"deadlift",sf:1.20, how:"Oberer Rücken an einer Bank abgestützt, Langhantel über der Hüfte. Hüfte nach oben drücken, bis Oberkörper und Oberschenkel eine Linie bilden, dabei das Gesäß fest anspannen, dann kontrolliert absenken."},
{id:"gluteBridge", n:"Beckenheben",              t:"reps", pat:"hinge",  e:"Körpergewicht", p:["tg_gesaess_haupt"], s:["tg_kniesehnen"], std:"bwsquat",sf:1.2,est:true, how:"Rückenlage, Knie aufgestellt. Hüfte nach oben drücken, bis Schultern-Hüfte-Knie eine Linie bilden, Gesäß oben anspannen, dann absenken – Körpergewichtsvariante des Hip Thrust."},
{id:"goodmorning", n:"Good Morning",             t:"load", pat:"hinge",  e:"Langhantel", p:["tg_kniesehnen","tg_rueck_strecker"], s:["tg_gesaess_haupt"], std:"deadlift",sf:0.45,est:true, how:"Langhantel im oberen Rücken wie bei der Kniebeuge, Beine fast gestreckt. Oberkörper mit geradem Rücken über die Hüfte nach vorne beugen, bis eine Dehnung im hinteren Oberschenkel spürbar ist, dann aufrichten."},
{id:"backext",     n:"Rückenstrecken",           t:"reps", pat:"hinge",  e:"Maschine",   p:["tg_rueck_strecker"], s:["tg_gesaess_haupt","tg_kniesehnen"], std:"bwsquat",sf:0.6,est:true, how:"Bauchlage an der Rückenstreckerbank, Hüfte am Polster. Oberkörper aus der Beuge nach oben strecken, bis Rücken und Beine eine Linie bilden, dann kontrolliert wieder absenken."},
{id:"legcurl",     n:"Beinbeuger",               t:"load", pat:"hinge",  e:"Maschine",   p:["tg_kniesehnen"], s:["tg_wade_soleus"], std:"deadlift",sf:0.45,est:true, how:"Am Beinbeuger (liegend oder sitzend) die Fersen gegen das Polster zum Gesäß heranziehen, dann langsam wieder strecken."},
{id:"nordic",      n:"Nordic Curl",              t:"reps", pat:"hinge",  e:"Körpergewicht", p:["tg_kniesehnen"], s:["tg_gesaess_haupt"], std:"bwsquat",sf:0.06,est:true, how:"Kniend, Füße fixiert (Partner oder Gerät), Oberkörper so langsam wie möglich nach vorne absenken, dabei den Körper von Knie bis Kopf gerade halten, mit den Armen den Fall abfangen."},
{id:"kb_swing",    n:"Kettlebell Swing",         t:"load", pat:"hinge",  e:"Kettlebell", p:["tg_gesaess_haupt","tg_kniesehnen"], s:["tg_rueck_strecker","tg_schulter_vorn","tg_bauch_tief"], std:"deadlift",sf:0.3,est:true, how:"Kettlebell zwischen den Beinen schwingen, mit einem kraftvollen Hüftstoß (nicht mit den Armen) nach vorne/oben schwingen, bis sie etwa Brusthöhe erreicht, dann durch die Beine zurückschwingen lassen."},

/* --- Rumpf --- */
{id:"plank",       n:"Unterarmstütz",            t:"sec",  pat:"core",   e:"Körpergewicht", p:["tg_bauch_gerade"], s:["tg_bauch_schraeg","tg_rueck_strecker","tg_bauch_tief"], std:"plank", how:"Unterarmstütz: Ellbogen unter den Schultern, Körper von Kopf bis Ferse eine gerade Linie, Bauch und Gesäß aktiv anspannen, Hüfte darf weder durchhängen noch nach oben stehen."},
{id:"lsit",        n:"L-Sit",                    t:"sec",  pat:"core",   e:"Parallettes", p:["tg_bauch_gerade"], s:["tg_quadrizeps","tg_trizeps_lat","tg_schulter_vorn"], std:"lsit", how:"An Parallettes/Barren mit gestreckten Armen abstützen und die gestreckten Beine parallel zum Boden nach vorne halten (L-Form) – starke Rumpf- und Hüftbeugerspannung."},
{id:"sideplank",   n:"Seitstütz",                t:"sec",  pat:"core",   e:"Körpergewicht", p:["tg_bauch_schraeg"], s:["tg_bauch_gerade"], std:"plank",sf:0.70, how:"Seitlich auf einen Unterarm gestützt, Körper von Kopf bis Fuß eine gerade Linie, Hüfte anheben und die Position halten, ohne durchzuhängen oder nach vorne/hinten zu kippen."},
{id:"hollow",      n:"Hollow Body Hold",         t:"sec",  pat:"core",   e:"Körpergewicht", p:["tg_bauch_gerade"], s:["tg_quadrizeps"], std:"plank",sf:0.60, how:"Rückenlage, unteren Rücken fest gegen den Boden drücken, Arme und Beine gestreckt leicht anheben, sodass der Körper eine leichte Bananenform bildet – Position halten."},
{id:"legraise",    n:"Beinheben hängend",        t:"reps", pat:"core",   e:"Klimmzugstange", p:["tg_bauch_gerade"], s:["tg_bauch_schraeg","tg_unterarm_beug","tg_huefte"], std:"legraise",sf:1.0,est:true, how:"An der Stange hängend die gestreckten (oder leicht gebeugten) Beine kontrolliert nach oben heben, mindestens bis zur Waagrechten, dann langsam absenken, ohne zu schwingen."},
{id:"kneeraise",   n:"Knieheben hängend",        t:"reps", pat:"core",   e:"Klimmzugstange", p:["tg_bauch_gerade"], s:["tg_bauch_schraeg","tg_huefte"], std:"legraise",sf:1.6,est:true, how:"An der Stange hängend die Knie kontrolliert Richtung Brust heranziehen, dann langsam wieder absenken – einfachere Variante des Beinhebens."},
{id:"crunch",      n:"Crunches",                 t:"reps", pat:"core",   e:"Körpergewicht", p:["tg_bauch_gerade"], s:[], std:"legraise",sf:3.0,est:true, how:"Rückenlage, Knie angewinkelt. Nur die Schulterblätter vom Boden abheben, indem die Bauchmuskulatur die Wirbelsäule einrollt, dann kontrolliert absenken – kein Schwung aus dem Nacken."},
{id:"situp",       n:"Sit-ups",                  t:"reps", pat:"core",   e:"Körpergewicht", p:["tg_bauch_gerade"], s:["tg_bauch_schraeg"], std:"legraise",sf:2.5,est:true, how:"Rückenlage, Knie angewinkelt, Füße fixiert. Den ganzen Oberkörper aufrichten, bis er senkrecht sitzt, dann kontrolliert zurück in die Rückenlage."},
{id:"russian",     n:"Russian Twist",            t:"reps", pat:"core",   e:"Körpergewicht", p:["tg_bauch_schraeg"], s:["tg_bauch_gerade"], std:"legraise",sf:3.0,est:true, how:"Im Sitzen leicht zurückgelehnt, Füße können den Boden berühren oder angehoben sein. Mit gestreckten Armen (ggf. mit Gewicht) abwechselnd von einer Seite zur anderen drehen."},
{id:"abwheel",     n:"Bauchroller",              t:"reps", pat:"core",   e:"Bauchroller", p:["tg_bauch_gerade"], s:["tg_rueck_lat","tg_rueck_strecker","tg_brust_serratus","tg_rueck_teres_major"], std:"legraise",sf:0.8,est:true, how:"Kniend mit dem Bauchroller vor dem Körper, Rad nach vorne rollen, so weit wie kontrollierbar, dabei den Rumpf fest anspannen, dann über die Bauchmuskulatur zurückziehen."},
{id:"cablecrunch", n:"Crunch am Kabelzug",       t:"load", pat:"core",   e:"Kabelzug",   p:["tg_bauch_gerade"], s:["tg_bauch_schraeg"], std:"row",sf:0.5,est:true, how:"Kniend vor dem Kabelzug, Seil hinter dem Kopf halten. Oberkörper einrollen, indem die Bauchmuskulatur arbeitet (nicht die Hüfte beugen), dann kontrolliert zurück."},
{id:"deadbug",     n:"Dead Bug",                 t:"reps", pat:"core",   e:"Körpergewicht", p:["tg_bauch_gerade"], s:["tg_bauch_schraeg"], std:"legraise",sf:3.0,est:true, how:"Rückenlage, Arme gestreckt nach oben, Knie 90° angewinkelt in der Luft. Abwechselnd einen Arm und das gegenüberliegende Bein Richtung Boden strecken, während der untere Rücken fest am Boden bleibt."},
{id:"birddog",     n:"Bird Dog",                 t:"reps", pat:"core",   e:"Körpergewicht", p:["tg_rueck_strecker"], s:["tg_gesaess_haupt","tg_bauch_gerade"], std:"legraise",sf:3.0,est:true, how:"Vierfüßlerstand. Abwechselnd einen Arm nach vorne und das gegenüberliegende Bein nach hinten strecken, Rumpf dabei ruhig und stabil halten, ohne ins Hohlkreuz zu fallen."},
{id:"pallof",      n:"Pallof Press",             t:"reps", pat:"core",   e:"Band",       p:["tg_bauch_schraeg"], s:["tg_bauch_gerade"], how:"Seitlich zum Kabelzug stehen, Griff vor der Brust halten. Arme gerade nach vorne drücken und wieder heranziehen, ohne dass sich der Oberkörper zur Seite drehen lässt – reine Anti-Rotations-Spannung."},
{id:"torso_rot",   n:"Torso-Rotationsmaschine",t:"load", pat:"core",   e:"Maschine",   p:["tg_bauch_schraeg"], s:["tg_bauch_gerade"], std:"row",sf:0.5,est:true, how:"An der Rotationsmaschine sitzen, Oberkörper kontrolliert von einer Seite zur anderen drehen, die Bewegung kommt aus der Bauch-/Rumpfmuskulatur, nicht aus den Armen."},
{id:"dragonflag",  n:"Dragon Flag",              t:"reps", pat:"core",   e:"Körpergewicht", p:["tg_bauch_gerade"], s:["tg_bauch_schraeg","tg_rueck_lat","tg_rueck_teres_major"], std:"legraise",sf:0.35,est:true, how:"Auf dem Rücken liegend, an einer festen Kante hinter dem Kopf festhalten, den ganzen Körper (bis auf die Schulterblätter) gestreckt anheben und langsam absenken, ohne dass sich die Hüfte einknickt."},

/* --- Schultern isoliert --- */
{id:"lateral",     n:"Seitheben",                t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_schulter_seit"], s:["tg_rueck_trapez_ob"], std:"ohp",sf:0.35,est:true, wt:"side", how:"Kurzhanteln seitlich am Körper, Arme mit leicht gebeugten Ellbogen seitlich bis auf Schulterhöhe anheben, dann kontrolliert absenken – nicht schwungvoll hochreißen."},
{id:"lateral_cable",n:"Seitheben am Kabelzug",      t:"load", pat:"iso",    e:"Kabelzug",   p:["tg_schulter_seit"], s:[], std:"ohp",sf:0.3,est:true, uni:true, how:"Am tief eingehängten Kabelzug seitlich stehend, den Griff mit leicht gebeugtem Arm seitlich bis Schulterhöhe anheben, dann kontrolliert absenken."},
{id:"frontraise",  n:"Frontheben",               t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_schulter_vorn"], s:[], std:"ohp",sf:0.35,est:true, wt:"side", how:"Kurzhanteln vor dem Körper, mit gestreckten oder leicht gebeugten Armen nach vorne bis auf Schulterhöhe anheben, dann kontrolliert absenken."},
// Kraftstufen-Faktor an die Maschine angepasst: an einer Maschine (Umlenkhebel/Kurvenscheibe)
// braucht es für dieselbe gefühlte Belastung meist mehr Stapelgewicht als an freien Kurzhanteln –
// dieselbe Anhebung zeigt sich im Katalog schon bei Fliegende Kurzhantel (sf 0.45) vs.
// Butterfly Maschine (sf 0.6, Faktor ×1,33), hier entsprechend von 0.3 auf 0.4 übertragen.
{id:"reversefly",  n:"Reverse Butterfly",             t:"load", pat:"iso",    e:"Maschine", p:["tg_schulter_hint"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_schulter_rot_infra","tg_schulter_rot_teres_min"], std:"ohp",sf:0.4,est:true, how:"Vorgebeugt oder auf einer Schrägbank liegend, Kurzhanteln mit leicht gebeugten Armen seitlich nach hinten/oben führen, Schulterblätter dabei zusammenziehen, dann kontrolliert absenken."},
{id:"upright_row", n:"Aufrechtes Rudern",        t:"load", pat:"iso",    e:"Langhantel", p:["tg_schulter_seit","tg_rueck_trapez_ob"], s:["tg_bizeps","tg_rueck_rhomb","tg_nacken"], std:"ohp",sf:0.55,est:true, how:"Langhantel oder Kurzhanteln vor dem Körper, mit den Ellbogen führend nach oben bis etwa Brusthöhe ziehen, dann kontrolliert absenken."},
{id:"cuban",       n:"Cuban Press",              t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_schulter_hint"], s:["tg_schulter_seit","tg_rueck_trapez_mit","tg_schulter_rot_infra","tg_schulter_rot_teres_min"], std:"ohp",sf:0.25,est:true, wt:"side", how:"Kurzhanteln seitlich anheben bis die Oberarme waagerecht sind, dann aus dieser Position die Unterarme nach oben rotieren (wie bei der Außenrotation), anschließend nach oben drücken – kombiniert Seitheben, Rotation und Drücken."},
{id:"bandpullapart",n:"Band Pull-Apart",         t:"reps", pat:"iso",    e:"Band",       p:["tg_schulter_hint"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_schulter_rot_infra","tg_schulter_rot_teres_min"], how:"Band mit beiden Händen schulterbreit vor der Brust halten, Arme gestreckt zur Seite auseinanderziehen, bis das Band die Brust berührt, dann kontrolliert zurückführen."},
{id:"rot_internal",n:"Innenrotation am Kabelzug", t:"load", pat:"iso",    e:"Kabelzug",   p:["tg_schulter_rot_sub"], s:["tg_brust_mitte"], std:"ohp",sf:0.18,est:true, uni:true, how:"Am tief eingehängten Kabelzug seitlich stehend, Oberarm am Körper fixiert, Ellbogen 90° gebeugt. Den Unterarm zum Bauch hin nach innen rotieren, dann kontrolliert zurückführen."},
{id:"emptycan",    n:"Empty-Can-Raise",          t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_schulter_rot_supra"], s:["tg_schulter_seit"], std:"ohp",sf:0.2,est:true, wt:"side", how:"Kurzhantel mit nach unten gedrehtem Daumen (wie beim Ausleeren einer Dose) seitlich und leicht nach vorne bis Schulterhöhe anheben – isoliert den Obergrätenmuskel der Rotatorenmanschette."},

/* --- Arme isoliert --- */
{id:"curl_bb",     n:"Langhantel-Curls",         t:"load", pat:"iso",    e:"Langhantel", p:["tg_bizeps"], s:["tg_unterarm_streck","tg_unterarm_beug"], std:"bench",sf:0.45,est:true, how:"Langhantel mit schulterbreitem Griff vor dem Körper, Ellbogen am Körper fixiert. Stange durch Beugen der Ellbogen nach oben zur Brust curlen, dann kontrolliert absenken."},
{id:"curl_db",     n:"Kurzhantel-Curls",         t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_bizeps"], s:["tg_unterarm_streck","tg_unterarm_beug"], std:"bench",sf:0.42,est:true, wt:"side", how:"Wie Langhantel-Curls, mit einer Kurzhantel in jeder Hand, wechselweise oder gleichzeitig."},
{id:"curl_hammer", n:"Hammer-Curls",             t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_unterarm_streck","tg_bizeps"], s:["tg_unterarm_beug"], std:"bench",sf:0.45,est:true, wt:"side", how:"Kurzhanteln mit neutralem Griff (Handflächen zeigen zueinander) seitlich am Körper nach oben curlen, ohne die Handgelenke zu drehen – beansprucht zusätzlich den Unterarm."},
{id:"curl_incline",n:"Schrägbank-Curls",         t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_bizeps"], s:["tg_unterarm_beug"], std:"bench",sf:0.33,est:true, wt:"side", how:"Auf einer Schrägbank liegend mit hängenden Armen curlen – die Rückenlage verhindert Schwung und dehnt den Bizeps am unteren Bewegungspunkt stärker."},
{id:"curl_preacher",n:"Preacher-Curls",          t:"load", pat:"iso",    e:"Langhantel", p:["tg_bizeps"], s:["tg_unterarm_beug"], std:"bench",sf:0.38,est:true, how:"Oberarme auf dem Preacher-Pult abgestützt, Langhantel oder EZ-Stange von der gestreckten Position nach oben curlen – isoliert den Bizeps, da kein Schwung aus der Schulter möglich ist."},
{id:"curl_preacher_machine",n:"Preacher-Curls Maschine", t:"load", pat:"iso",    e:"Maschine", p:["tg_bizeps"], s:["tg_unterarm_beug"], std:"bench",sf:0.38,est:true, how:"Oberarme auf der gepolsterten Preacher-Auflage der Maschine ablegen, Griffe aus der gestreckten Position nach oben curlen und kontrolliert wieder absenken – die Maschine führt die Bewegung, dadurch kein Schwung aus der Schulter möglich."},
{id:"curl_cable",  n:"Curls am Kabelzug",        t:"load", pat:"iso",    e:"Kabelzug",   p:["tg_bizeps"], s:["tg_unterarm_streck","tg_unterarm_beug"], std:"bench",sf:0.42,est:true, how:"Am tief eingehängten Kabelzug mit Griff oder Stange curlen, Ellbogen am Körper fixiert, gleichmäßiger Widerstand über die ganze Bewegung."},
{id:"curl_cable_lying", n:"Liegende Curls am Kabelzug", t:"load", pat:"iso",    e:"Kabelzug",   p:["tg_bizeps"], s:["tg_unterarm_beug"], std:"bench",sf:0.38,est:true, how:"Auf dem Rücken liegend, Kabel tief hinter dem Kopf eingehängt, Griff oder Stange in Richtung Brust curlen – die Rückenlage fixiert die Oberarme und verhindert Schwung, bei gleichmäßigem Kabelwiderstand über die ganze Bewegung."},
{id:"tri_push",    n:"Trizepsdrücken am Kabelzug",  t:"load", pat:"iso",    e:"Kabelzug",   p:["tg_trizeps_lat"], s:[], std:"bench",sf:0.55,est:true, how:"Am hoch eingehängten Kabelzug mit Stange oder Seil, Ellbogen am Körper fixiert, Unterarme nach unten strecken, bis die Arme fast gerade sind, dann kontrolliert zurückführen."},
{id:"tri_skull",   n:"French Press",             t:"load", pat:"iso",    e:"Langhantel", p:["tg_trizeps_lang"], s:[], std:"bench",sf:0.4,est:true, how:"Rückenlage, Langhantel (meist EZ-Stange) über der Stirn/dem Kopf mit gebeugten Ellbogen absenken, dann durch Strecken der Ellbogen wieder nach oben drücken – Oberarme bleiben dabei möglichst senkrecht."},
{id:"tri_over",    n:"Trizeps über Kopf",        t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_trizeps_lang"], s:[], std:"bench",sf:0.32,est:true, how:"Kurzhantel mit beiden Händen hinter dem Kopf halten, Ellbogen zeigen nach oben. Unterarme nach oben strecken, dann kontrolliert wieder hinter den Kopf absenken."},
{id:"tri_kick",    n:"Trizeps-Kickbacks",        t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_trizeps_lat"], s:[], std:"bench",sf:0.18,est:true, uni:true, how:"Oberkörper vorgebeugt, Oberarm parallel zum Rücken fixiert. Unterarm mit der Kurzhantel nach hinten strecken, bis der Arm ganz gerade ist, dann kontrolliert zurückführen."},
{id:"dips_bench",  n:"Bankdips",                 t:"reps", pat:"iso",    e:"Körpergewicht", p:["tg_trizeps_lat"], s:["tg_brust_unten","tg_schulter_vorn"], std:"dips",sf:1.60, how:"Hände auf einer Bank hinter dem Körper abstützen, Fersen auf dem Boden oder einer zweiten Bank. Gesäß vor der Bank absenken, bis die Ellbogen etwa 90° erreichen, dann hochdrücken."},
{id:"wrist_curl",  n:"Handgelenk-Curls",         t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_unterarm_beug"], s:[], std:"bench",sf:0.25,est:true, wt:"side", how:"Unterarme auf den Oberschenkeln oder einer Bank abstützen, Handflächen nach oben, Handgelenke mit der Kurzhantel nach oben curlen, dann kontrolliert absenken."},
{id:"wrist_curl_rev",n:"Reverse Handgelenk-Curls",t:"load", pat:"iso",    e:"Kurzhantel", p:["tg_unterarm_streck"], s:[], std:"bench",sf:0.2,est:true, wt:"side", how:"Wie Handgelenk-Curls, aber mit Handflächen nach unten – trainiert die Streckseite des Unterarms."},
{id:"farmers",     n:"Farmer's Walk",            t:"sec",  pat:"iso",    e:"Kurzhantel", p:["tg_unterarm_beug","tg_rueck_trapez_ob"], s:["tg_bauch_gerade","tg_bauch_schraeg","tg_rueck_rhomb","tg_nacken","tg_bauch_tief"], std:"plank",sf:0.6,est:true, wt:"side", how:"Schwere Kurzhanteln oder Trap-Bar in beiden Händen nehmen und mit aufrechtem Oberkörper und angespanntem Rumpf eine festgelegte Strecke oder Zeit gehen."},
{id:"ricebucket",  n:"Reiskübel-Griffkraft",     t:"sec",  pat:"iso",    e:"Reiskübel", p:["tg_unterarm_beug"], s:[], std:"plank",sf:0.5,est:true, how:"Hand wiederholt in einen Eimer mit Reis öffnen und schließen bzw. hinein- und herausstoßen – der Widerstand des Reises trainiert Griff- und Unterarmkraft schonend."},
{id:"fatgripz",    n:"Fat-Gripz-Halten",         t:"sec",  pat:"iso",    e:"Fat Gripz", p:["tg_unterarm_beug"], s:["tg_bizeps","tg_unterarm_streck"], std:"plank",sf:0.4,est:true, how:"Eine Hantel oder Stange mit dicken Griffaufsätzen möglichst lange in der Hand halten, bis der Griff nachlässt – reines Grifftraining durch den größeren Griffdurchmesser."},

/* --- Beine isoliert --- */
{id:"calf_stand",  n:"Wadenheben stehend",       t:"load", pat:"iso",    e:"Maschine",   p:["tg_wade_gastro"], s:[], std:"squat",sf:0.8,est:true, how:"Stehend (z. B. an der Wadenhebe-Maschine oder mit Kurzhanteln) auf die Fußballen stellen, so weit wie möglich nach oben, dann kontrolliert wieder absenken, bis die Fersen leicht unter Fußballenhöhe sind."},
{id:"calf_seat",   n:"Wadenheben sitzend",       t:"load", pat:"iso",    e:"Maschine",   p:["tg_wade_soleus"], s:[], std:"squat",sf:0.5,est:true, how:"Sitzend am Gerät, Knie unter dem Polster fixiert, auf die Fußballen drücken und die Waden anheben, dann kontrolliert absenken – betont durch die gebeugten Knie den unteren Wadenmuskel stärker."},
{id:"calf_bw",     n:"Wadenheben Körpergewicht", t:"reps", pat:"iso",    e:"Körpergewicht", p:["tg_wade_gastro"], s:[], std:"bwsquat",sf:1.5,est:true, how:"Wadenheben ohne Zusatzgewicht: auf einer Stufenkante oder ebenem Boden auf die Fußballen stellen und wieder absenken."},
{id:"adduct",      n:"Adduktoren-Maschine",      t:"load", pat:"iso",    e:"Maschine",   p:["tg_adduktoren"], s:[], std:"squat",sf:0.4,est:true, how:"An der Adduktorenmaschine sitzend die Beine gegen den Widerstand nach innen zusammenführen, dann kontrolliert wieder öffnen."},
{id:"hipflex_cable",n:"Hüftbeugen am Kabelzug",   t:"load", pat:"iso",    e:"Kabelzug",   p:["tg_huefte"], s:["tg_bauch_gerade"], std:"squat",sf:0.15,est:true, uni:true, how:"Fußschlaufe am tief eingehängten Kabelzug, seitlich stehend das Bein mit gestrecktem Knie nach vorne/oben anheben, dann kontrolliert absenken."},
/* Tractus-iliotibialis-Reha, Phase 2 */
{id:"clamshell",   n:"Clamshells",                t:"reps", pat:"iso", e:"Körpergewicht", p:["tg_gesaess_med"], s:["tg_gesaess_min","tg_bauch_schraeg"], how:"Seitlage, Knie angewinkelt übereinander, Füße bleiben zusammen. Das obere Knie wie eine Muschel nach oben öffnen, ohne das Becken mitzudrehen, dann kontrolliert schließen."},
{id:"sidelying_raise", n:"Seitliches Beinheben",  t:"reps", pat:"iso", e:"Körpergewicht", p:["tg_gesaess_med"], s:["tg_gesaess_min","tg_rueck_strecker","tg_bauch_schraeg"], how:"Seitlage, oberes Bein gestreckt seitlich anheben, ohne den Oberkörper nach hinten zu kippen, dann kontrolliert absenken."},
{id:"bandwalk_lat", n:"Seitliches Bandgehen",     t:"reps", pat:"iso", e:"Band", p:["tg_gesaess_med"], s:["tg_gesaess_min","tg_quadrizeps","tg_adduktoren","tg_bauch_gerade"], how:"Widerstandsband um beide Knöchel oder Knie, in leichter Hocke seitliche Schritte gegen den Bandwiderstand machen, Spannung im Band die ganze Zeit halten."},
{id:"abduct",      n:"Abduktoren-Maschine",      t:"load", pat:"iso",    e:"Maschine",   p:["tg_gesaess_med"], s:["tg_gesaess_min"], std:"squat",sf:0.4,est:true, how:"An der Abduktorenmaschine sitzend die Beine gegen den Widerstand nach außen öffnen, dann kontrolliert wieder schließen."},
{id:"copenhagen",  n:"Copenhagen Plank",         t:"sec",  pat:"iso",    e:"Körpergewicht", p:["tg_adduktoren"], s:["tg_bauch_schraeg"], std:"plank",sf:0.6,est:true, how:"Seitstütz, oberes Bein auf einer Bank abgelegt, unteres Bein schwebt frei in der Luft. Hüfte anheben und halten – starke Belastung für die Oberschenkelinnenseite."},
{id:"neck_curl",   n:"Neck Curls",           t:"reps", pat:"iso",    e:"Körpergewicht", p:["tg_nacken"], s:["tg_rueck_trapez_ob"], how:"Rückenlage, Kopf über die Bankkante hinausragend. Mit leichtem Handdruck oder Zusatzgewicht auf der Stirn das Kinn Richtung Brust curlen, dann kontrolliert zurückführen."},
{id:"neck_ext_bw", n:"Nackenstrecken",           t:"reps", pat:"iso",    e:"Körpergewicht", p:["tg_nacken"], s:["tg_rueck_trapez_ob"], how:"Bauchlage, Kopf über die Bankkante hinausragend. Kopf gegen leichten Handdruck nach oben/hinten strecken, dann kontrolliert absenken."},
{id:"neck_flex_bw",n:"Halsbeugen",               t:"reps", pat:"iso",    e:"Körpergewicht", p:["tg_hals_nacken"], s:["tg_nacken"], how:"Rückenlage oder aufrecht sitzend, mit der Hand leichten Gegendruck auf die Stirn geben und den Kopf dagegen nach vorne beugen."},
{id:"neck_side_bw",n:"Seitliche Halsneigung",    t:"reps", pat:"iso",    e:"Körpergewicht", p:["tg_hals_nacken"], s:["tg_nacken"], how:"Aufrecht sitzend, mit der Hand leichten Gegendruck seitlich am Kopf geben und den Kopf dagegen zur Seite neigen – beide Seiten gleichmäßig trainieren."},
{id:"neck_harness",n:"Kopfgeschirr",             t:"load", pat:"iso",    e:"Kopfgeschirr",  p:["tg_nacken"], s:["tg_rueck_trapez_ob"], how:"Kopfgeschirr mit Zusatzgewicht anlegen, Kopf gegen den Widerstand langsam nach oben/hinten oder vorne bewegen (je nach Ausrichtung des Geschirrs), dann kontrolliert zurückführen."},
{id:"neck_bridge", n:"Nackenbrücke",             t:"sec",  pat:"iso",    e:"Körpergewicht", p:["tg_nacken"], s:["tg_rueck_trapez_ob"], how:"Aus der Rückenlage mit dem Scheitel und den Füßen abstützen, die Hüfte anheben, sodass das Gewicht auf Kopf und Füßen ruht, und die Position vorsichtig halten – nur mit sauberer Technik und langsam steigern."},

/* --- Ausdauer --- */
{id:"run",         n:"Laufen",                   t:"cardio", pat:"cardio", e:"—", p:["tg_quadrizeps","tg_wade_gastro"], s:["tg_kniesehnen","tg_gesaess_haupt","tg_wade_fussheber"], intens:"mittel", how:"Gleichmäßiges Lauftempo über die geplante Zeit oder Distanz, Atmung und Puls im aeroben Bereich halten."},
{id:"run_interval",n:"Intervallläufe",           t:"cardio", pat:"cardio", e:"—", p:["tg_quadrizeps","tg_wade_gastro"], s:["tg_kniesehnen","tg_gesaess_haupt","tg_wade_fussheber"], intens:"hoch", how:"Wechsel aus kurzen, schnellen Belastungsphasen und langsameren Erholungsphasen im Lauf, z. B. 30 Sekunden schnell, 90 Sekunden locker – Zyklus wiederholen."},
{id:"bike",        n:"Radfahren",                t:"cardio", pat:"cardio", e:"Rad", p:["tg_quadrizeps"], s:["tg_gesaess_haupt","tg_wade_gastro"], intens:"mittel", how:"Gleichmäßiges oder wechselndes Tempo auf dem Fahrrad/Ergometer über die geplante Zeit oder Distanz."},
{id:"row_erg",     n:"Rudergerät",               t:"cardio", pat:"cardio", e:"Ergometer", p:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_quadrizeps"], s:["tg_rueck_lat","tg_kniesehnen","tg_bizeps","tg_rueck_teres_major"], intens:"hoch", how:"Am Rudergerät mit den Beinen starten, dann den Rücken und zuletzt die Arme einsetzen (Zugreihenfolge Beine–Rücken–Arme), auf dem Rückweg in umgekehrter Reihenfolge wieder lösen."},
{id:"swim",        n:"Schwimmen",                t:"cardio", pat:"cardio", e:"—", p:["tg_rueck_lat","tg_schulter_vorn"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_quadrizeps","tg_rueck_teres_major"], intens:"hoch", how:"Kontinuierliches Schwimmen über die geplante Zeit oder Distanz in einer beliebigen Schwimmart."},
{id:"jumprope",    n:"Seilspringen",             t:"cardio", pat:"cardio", e:"Springseil", p:["tg_wade_gastro"], s:["tg_quadrizeps","tg_wade_fussheber"], intens:"hoch", how:"Mit dem Springseil in gleichmäßigem Rhythmus springen, Sprünge klein und aus dem Sprunggelenk heraus, Landung auf dem Vorfuß."},
{id:"walk",        n:"Zügiges Gehen",            t:"cardio", pat:"cardio", e:"—", p:["tg_quadrizeps"], s:["tg_wade_gastro","tg_gesaess_haupt","tg_wade_fussheber"], intens:"leicht", how:"Zügiges Gehen in flottem Tempo über die geplante Zeit oder Distanz – deutlich schneller als gemütliches Spazierengehen."},
{id:"hike",        n:"Wandern",                  t:"cardio", pat:"cardio", e:"—", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_wade_gastro","tg_wade_fussheber"], intens:"mittel", how:"Wandern über unebenes Gelände über die geplante Zeit oder Distanz, Tempo dem Gelände anpassen."},
{id:"stairs",      n:"Treppenlauf",              t:"cardio", pat:"cardio", e:"—", p:["tg_quadrizeps","tg_gesaess_haupt"], s:["tg_wade_gastro","tg_wade_fussheber"], intens:"hoch", how:"Zügiges, kontinuierliches Treppensteigen über die geplante Zeit oder Anzahl Stockwerke."},
{id:"burpee",      n:"Burpees",                  t:"cardio", pat:"cardio", e:"Körpergewicht", p:["tg_quadrizeps","tg_brust_mitte"], s:["tg_schulter_vorn","tg_bauch_gerade"], intens:"hoch", how:"Aus dem Stand in die Liegestützposition fallen lassen, optional eine Liegestütze machen, dann die Füße wieder nach vorne springen und aus der Hocke hochspringen."},
{id:"elliptical",  n:"Crosstrainer",             t:"cardio", pat:"cardio", e:"Maschine", p:["tg_quadrizeps"], s:["tg_gesaess_haupt","tg_wade_gastro"], intens:"mittel", how:"Gleichmäßige oder wechselnde Belastung auf dem Crosstrainer über die geplante Zeit, Arme und Beine arbeiten dabei gemeinsam."},
{id:"football",    n:"Fußball / Ballsport",      t:"cardio", pat:"cardio", e:"—", p:["tg_quadrizeps","tg_wade_gastro"], s:["tg_kniesehnen","tg_gesaess_haupt"], intens:"hoch", how:"Ballsportliche Belastung mit wechselndem Tempo (Sprints, Stopps, Richtungswechsel) über die Spieldauer."},

/* --- Mobilität --- */
{id:"mob_hip",     n:"Hüftöffner",               t:"sec",  pat:"mob", e:"Körpergewicht", p:["tg_adduktoren"], s:["tg_gesaess_haupt"], mob:true, mk:"stat", how:"Dynamische oder gehaltene Dehn-/Mobilisationsübungen für die Hüfte (z. B. 90/90-Position, Hüftkreisen), die die Beweglichkeit in mehrere Richtungen verbessern."},
{id:"mob_shoulder",n:"Schultermobilität",        t:"sec",  pat:"mob", e:"Band",       p:["tg_schulter_hint"], s:["tg_rueck_rhomb","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_schulter_rot_infra","tg_schulter_rot_teres_min"], mob:true, mk:"dyn", how:"Mobilisationsübungen für die Schulter mit dem Band oder Körpergewicht (z. B. Schulterkreisen, Band-Pass-throughs), um den Bewegungsradius der Schulter zu vergrößern."},
{id:"mob_thoracic",n:"Brustwirbelsäule",         t:"sec",  pat:"mob", e:"Körpergewicht", p:["tg_rueck_rhomb","tg_rueck_trapez_mit"], s:["tg_rueck_strecker"], mob:true, mk:"dyn", how:"Übungen zur Mobilisation der Brustwirbelsäule (z. B. Rotationen im Vierfüßlerstand oder über eine Schaumstoffrolle), um die Rotations- und Streckfähigkeit im oberen Rücken zu verbessern."},
{id:"mob_hamstring",n:"Beinrückseite dehnen",    t:"sec",  pat:"mob", e:"Körpergewicht", p:["tg_kniesehnen"], s:["tg_rueck_strecker"], mob:true, mk:"stat", how:"Gehaltenes oder dynamisches Dehnen der hinteren Oberschenkelmuskulatur, z. B. im Sitzen oder Stehen mit gestrecktem Bein sanft nach vorne beugen, bis eine Dehnung spürbar ist."},
{id:"mob_ankle",   n:"Sprunggelenk",             t:"sec",  pat:"mob", e:"Körpergewicht", p:["tg_wade_gastro"], s:[], mob:true, mk:"dyn", how:"Mobilisationsübungen für das Sprunggelenk (z. B. Knie-zur-Wand-Dehnung), um die Beugefähigkeit des Sprunggelenks zu verbessern."},
{id:"mob_couch",   n:"Couch Stretch",            t:"sec",  pat:"mob", e:"Körpergewicht", p:["tg_quadrizeps"], s:["tg_gesaess_haupt"], mob:true, mk:"stat", how:"Ein Knie auf dem Boden, der Unterschenkel senkrecht an einer Wand oder Couch abgestützt, das andere Bein vorne aufgestellt. Oberkörper aufrichten und das Becken leicht nach vorne schieben, bis eine Dehnung im Hüftbeuger/Quadrizeps spürbar ist."},
{id:"mob_deadhang",n:"Hängen zur Dekompression", t:"sec",  pat:"mob", e:"Klimmzugstange", p:["tg_rueck_lat"], s:["tg_unterarm_beug","tg_rueck_trapez_unt","tg_rueck_teres_major"], mob:true, mk:"stat", how:"Entspannt an der Stange hängen und die Wirbelsäule und Schultern dabei bewusst dekomprimieren lassen, ähnlich wie beim reinen Hängen, hier mit Fokus auf Entspannung statt Kraft."},
{id:"mob_pancake", n:"Pancake / Grätsche",       t:"sec",  pat:"mob", e:"Körpergewicht", p:["tg_adduktoren"], s:["tg_kniesehnen"], mob:true, mk:"stat", how:"Sitzend mit weit gegrätschten, gestreckten Beinen den Oberkörper mit geradem Rücken nach vorne absenken, bis eine Dehnung in der Oberschenkelinnenseite/hinteren Oberschenkel spürbar ist."},
{id:"mob_chest", n:"Brustdehnung mit fixiertem Arm", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_brust_mitte","tg_brust_ober"], s:["tg_schulter_vorn","tg_bizeps"], mob:true, mk:"stat", how:"Unterarm auf Schulterhöhe an einer festen Senkrechten anlegen (Türrahmen, Pfosten, Balken, Rahmen einer Maschine), Ellbogen etwa rechtwinklig. Oberkörper langsam vom Arm wegdrehen, bis es vorne in der Brust zieht. Brustbein dabei angehoben lassen, nicht in die Schulter sacken. 2 × 40 Sekunden je Seite."},
{id:"mob_biceps", n:"Bizepsdehnung mit Arm nach hinten", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_bizeps"], s:["tg_schulter_vorn","tg_unterarm_beug"], mob:true, mk:"stat", how:"Hand hinter dem Körper auf Schulterhöhe fixieren, Handfläche nach hinten, Arm gestreckt. Oberkörper langsam vom Arm wegdrehen. Zieht deutlich anders als die Brustdehnung, weil der Arm gestreckt bleibt und der Bizeps über zwei Gelenke läuft. 2 × 30 Sekunden je Seite."},
{id:"mob_cobra", n:"Kobra", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_bauch_gerade"], s:["tg_huefte","tg_bauch_schraeg"], mob:true, mk:"stat", how:"Bauchlage, Hände neben der Brust. Oberkörper aufrichten, Becken bleibt am Boden. Nur so weit hoch, wie der untere Rücken entspannt bleibt – es soll vorne ziehen, nicht hinten drücken. 3 × 30 Sekunden."},
{id:"mob_reardelt", n:"Hintere Schulter über der Brust", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_schulter_hint"], s:["tg_rueck_trapez_mit","tg_schulter_rot_infra"], mob:true, mk:"stat", how:"Gestreckten Arm quer vor der Brust führen, mit dem anderen Arm am Oberarm (nicht am Ellbogengelenk) heranziehen. Schulter dabei unten lassen, nicht zum Ohr ziehen. 2 × 30 Sekunden je Seite."},
{id:"mob_triceps", n:"Trizepsdehnung über Kopf", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_trizeps_lang"], s:["tg_rueck_lat","tg_schulter_hint"], mob:true, mk:"stat", how:"Arm über Kopf, Hand zwischen die Schulterblätter, mit der anderen Hand den Ellbogen nach hinten führen. Trifft den langen Kopf, weil der über das Schultergelenk läuft – gebeugter Ellbogen allein reicht dafür nicht. 2 × 30 Sekunden je Seite."},
{id:"mob_neck", n:"Seitliche Nackendehnung", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_rueck_trapez_ob","tg_nacken"], s:["tg_hals_nacken"], mob:true, mk:"stat", how:"Im Sitzen eine Hand unter das Gesäß klemmen, damit die Schulter unten bleibt. Kopf zur Gegenseite neigen, Blick geradeaus. Kein Zug mit der Hand am Kopf – das Eigengewicht genügt. 2 × 30 Sekunden je Seite."},
{id:"mob_lat", n:"Lat-Dehnung mit Griff über Kopf", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_rueck_lat"], s:["tg_rueck_teres_major","tg_rueck_trapez_unt"], mob:true, mk:"stat", how:"An einem festen Griff über Kopfhöhe festhalten, Hüfte nach hinten schieben, Brust Richtung Boden sinken lassen. Arme gestreckt, Kopf zwischen den Armen. 2 × 40 Sekunden je Seite."},
{id:"mob_knee2chest", n:"Knie zur Brust", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_rueck_strecker"], s:["tg_gesaess_haupt"], mob:true, mk:"stat", how:"Rückenlage, beide Knie zur Brust ziehen und umfassen. Lendenwirbelsäule flach an den Boden bringen. Ruhig weiteratmen – die tiefe Rückenmuskulatur löst erst nach etwa 20 Sekunden. 2 × 40 Sekunden."},
{id:"mob_twist", n:"Liegende Drehung", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_bauch_schraeg","tg_rueck_strecker"], s:["tg_gesaess_haupt"], mob:true, mk:"stat", how:"Rückenlage, Arme seitlich ausgebreitet. Ein angewinkeltes Bein über die Körpermitte zur Gegenseite ablegen, beide Schultern bleiben am Boden. Kopf zur Gegenrichtung drehen. 2 × 45 Sekunden je Seite."},
{id:"mob_wrist_flex", n:"Unterarmbeuger dehnen", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_unterarm_beug"], s:["tg_bizeps"], mob:true, mk:"stat", how:"Arm gestreckt nach vorn, Handfläche nach oben, Finger mit der anderen Hand nach unten ziehen. Ellbogen durchgestreckt lassen, sonst entzieht sich der Muskel. 2 × 30 Sekunden je Seite."},
{id:"mob_wrist_ext", n:"Unterarmstrecker dehnen", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_unterarm_streck"], s:[], mob:true, mk:"stat", how:"Arm gestreckt nach vorn, Handrücken nach oben, Hand nach unten führen und mit der anderen Hand sanft nachhelfen. Gegenstück zur Beugerdehnung – gehört bei viel Greifarbeit immer dazu. 2 × 30 Sekunden je Seite."},
{id:"mob_hipflex", n:"Ausfallschritt tief", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_huefte"], s:["tg_quadrizeps"], mob:true, mk:"stat", how:"Halbkniender Ausfallschritt, hinteres Knie am Boden. Becken aktiv nach vorn unten schieben und dabei das Gesäß der hinteren Seite anspannen – erst dann zieht es wirklich im Hüftbeuger statt im unteren Rücken. 2 × 45 Sekunden je Seite."},
{id:"mob_pigeon", n:"Taube / Figur 4", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_gesaess_haupt","tg_gesaess_min"], s:["tg_gesaess_med"], mob:true, mk:"stat", how:"Vorderes Bein angewinkelt vor dem Körper ablegen, hinteres Bein lang nach hinten. Oberkörper über das vordere Bein senken. Wer nicht so tief kommt: in Rückenlage Fußknöchel auf das andere Knie legen (Figur 4) und den Oberschenkel heranziehen. 2 × 45 Sekunden je Seite."},
{id:"mob_glutemed", n:"Seitliche Hüftdehnung", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_gesaess_med"], s:["tg_gesaess_min"], mob:true, mk:"stat", how:"Im Stehen das zu dehnende Bein hinter das andere kreuzen, Hüfte zur Seite schieben, Oberkörper zur Gegenseite neigen. Zieht seitlich am Beckenkamm entlang. 2 × 40 Sekunden je Seite."},
{id:"mob_quad", n:"Quadrizeps im Stehen", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_quadrizeps"], s:["tg_huefte"], mob:true, mk:"stat", how:"Im Stand den Fuß zum Gesäß ziehen, Knie zeigt nach unten und bleibt neben dem Standbein. Becken leicht nach hinten kippen, dann geht die Dehnung in den Oberschenkel statt ins Knie. 2 × 30 Sekunden je Seite."},
{id:"mob_frog", n:"Frosch", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_adduktoren"], s:["tg_huefte"], mob:true, mk:"stat", how:"Vierfüßlerstand, Knie weit auseinander, Unterschenkel parallel, Fußinnenseiten am Boden. Becken langsam nach hinten schieben. Kräftige Dehnung – Bewegung sehr klein halten und lange bleiben. 2 × 60 Sekunden."},
{id:"mob_calf_straight", n:"Wade gestreckt, Vorfuß erhöht", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_wade_gastro"], s:["tg_kniesehnen"], mob:true, mk:"stat", how:"Vorfuß auf eine Kante stellen, Ferse absinken lassen, Knie gestreckt. Bei gestrecktem Knie trifft es den oberflächlichen Wadenmuskel, der über das Kniegelenk läuft. 2 × 40 Sekunden je Seite."},
{id:"mob_calf_bent", n:"Wade gebeugt, Vorfuß erhöht", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_wade_soleus"], s:[], mob:true, mk:"stat", how:"Dieselbe Position, aber mit deutlich gebeugtem Knie. Das nimmt den oberflächlichen Wadenmuskel aus der Spannung, sodass der darunterliegende gedehnt wird. Beide Varianten gehören zusammen. 2 × 40 Sekunden je Seite."},
{id:"mob_tibialis", n:"Schienbein dehnen", t:"sec", pat:"mob", e:"Körpergewicht", p:["tg_wade_fussheber"], s:[], mob:true, mk:"stat", how:"Im Knien die Fußrücken flach am Boden ablegen und sich langsam auf die Fersen setzen. Der Gegenspieler der Wade wird sonst nie gedehnt – bei Schienbeinbeschwerden nach dem Laufen die wichtigste Übung hier. 2 × 40 Sekunden."},
{id:"mob_catcow", n:"Katze-Kuh", t:"reps", pat:"mob", e:"Körpergewicht", p:["tg_rueck_strecker"], s:["tg_bauch_gerade"], mob:true, mk:"dyn", how:"Vierfüßlerstand. Im Wechsel Wirbel für Wirbel runden (Kopf und Becken einrollen) und strecken. Langsam, jede Richtung etwa drei Sekunden. Kein Dehnen, sondern Mobilisation – die Wirbelsäule wird Segment für Segment durchbewegt. 2 × 10 Durchgänge."},
{id:"mob_wgs", n:"World's Greatest Stretch", t:"reps", pat:"mob", e:"Körpergewicht", p:["tg_huefte","tg_adduktoren"], s:["tg_kniesehnen","tg_bauch_schraeg","tg_gesaess_haupt","tg_brust_mitte","tg_wade_gastro"], mob:true, mk:"dyn", how:"Eine Abfolge aus vier Schritten, keine Position: 1. tiefer Ausfallschritt. 2. Ellbogen zum Innenrist des vorderen Fußes senken. 3. Oberkörper aufdrehen, oberen Arm zur Decke führen, Blick folgt. 4. Vorderes Bein strecken, Hüfte zurückschieben, Fußspitze anziehen. Dann zurück und wechseln. 2 × 5 Durchgänge je Seite."},
{id:"mob_legswing", n:"Beinpendel", t:"reps", pat:"mob", e:"Körpergewicht", p:["tg_kniesehnen","tg_huefte"], s:["tg_adduktoren","tg_gesaess_med"], mob:true, mk:"dyn", how:"Seitlich an etwas Festem abstützen, ein Bein locker vor und zurück schwingen, danach seitlich vor dem Körper her. Oberkörper bleibt ruhig, der Schwung kommt aus der Hüfte. Bewegungsradius über die Wiederholungen langsam vergrößern. 2 × 12 je Richtung und Seite."},
{id:"mob_9090", n:"90/90-Hüftwechsel", t:"reps", pat:"mob", e:"Körpergewicht", p:["tg_gesaess_med","tg_adduktoren"], s:["tg_gesaess_haupt","tg_huefte"], mob:true, mk:"dyn", how:"Im Sitzen beide Beine im rechten Winkel, eines vor dem Körper, eines zur Seite. Knie kontrolliert auf die andere Seite kippen und zurück. Trainiert Innen- und Außendrehung der Hüfte im Wechsel. 2 × 10 Wechsel."},
{id:"mob_wrist_circ", n:"Handgelenk-Mobilisation", t:"reps", pat:"mob", e:"Körpergewicht", p:["tg_unterarm_beug"], s:["tg_unterarm_streck"], mob:true, mk:"dyn", how:"Im Vierfüßlerstand Gewicht auf die Hände geben und langsam vor, zurück und seitlich verlagern, Handflächen bleiben am Boden. Danach Handrücken auflegen und vorsichtig dasselbe. Vorbereitung für alles, was Stützen oder schweres Greifen verlangt. 2 × 15 Bewegungen."}
];

// Unveränderter Originalzustand jeder eingebauten Übung – bevor eigene Übungen angehängt oder
// Anpassungen (state.exOverrides) angewendet werden. Wird nur für "Auf Standard zurücksetzen"
// beim Bearbeiten einer eingebauten Übung gebraucht.
var EX_BASE={}
;

EX.forEach(function(e){EX_BASE[e.id]=Object.assign({},e);});


/* --- Kraftstandards ---
   load: Vielfaches des Körpergewichts bei 90 kg, allometrisch korrigiert
   reps/sec: absolute Werte bei ~82 kg
   Reihenfolge (8 Stufen): F · E · D · C · B · A · S · S+                    */
var STANDARDS={
  squat:    {kind:"load", v:[0.48,0.63,0.82,1.07,1.39,1.80,2.35,3.05]},
  deadlift: {kind:"load", v:[0.57,0.74,0.96,1.24,1.61,2.08,2.70,3.50]},
  bench:    {kind:"load", v:[0.36,0.47,0.60,0.78,1.01,1.31,1.70,2.20]},
  ohp:      {kind:"load", v:[0.21,0.28,0.37,0.49,0.65,0.86,1.14,1.50]},
  row:      {kind:"load", v:[0.31,0.41,0.53,0.70,0.92,1.21,1.58,2.08]},
  pullup:   {kind:"reps", v:[1,2,3,5,8,12,21,34]},
  pushup:   {kind:"reps", v:[3,5,8,13,22,37,61,100]},
  dips:     {kind:"reps", v:[2,3,5,8,13,20,32,50]},
  bwsquat:  {kind:"reps", v:[2,4,7,13,24,45,83,155]},
  plank:    {kind:"sec",  v:[8,13,22,37,62,104,174,290]},
  lsit:     {kind:"sec",  v:[2,3,5,8,12,19,30,48]},
  handstand:{kind:"sec",  v:[5,8,12,19,29,45,70,108]},
  pullup_w: {kind:"load", v:[0.00,0.17,0.34,0.51,0.69,0.86,1.03,1.20]},
  hang:     {kind:"sec",  v:[10,15,23,35,52,79,119,180]},
  legraise: {kind:"reps", v:[2,3,5,7,11,18,27,42]}
}
;

var LEVELS=["F","E","D","C","B","A","S","S+"];


/* --- Kraft-Bereiche ---
   Bewertbar ist jede Übung mit Kraftstandard. Der Bereich ergibt sich aus dem Bewegungsmuster;
   Isolations- und Sonderübungen (pat "iso") laufen über den Standard, an dem sie hängen.
   Pro Bereich zählt der beste gemessene Wert, der Kraftwert ist das Mittel der Bereiche. */
var KRAFT_CATS=[
  {id:"chest",    name:"Brust",     pats:["push_h"],          muscles:["tg_brust_ober","tg_brust_mitte","tg_brust_unten"]},
  {id:"shoulders",name:"Schultern", pats:["push_v"],          muscles:["tg_schulter_vorn","tg_schulter_seit","tg_schulter_hint"]},
  {id:"back",     name:"Rücken",    pats:["pull_v","pull_h"], muscles:["tg_rueck_lat","tg_rueck_teres_major","tg_schulter_rot_infra","tg_schulter_rot_teres_min","tg_schulter_rot_sub","tg_schulter_rot_supra","tg_rueck_rhomb","tg_rueck_trapez_ob","tg_rueck_trapez_mit","tg_rueck_trapez_unt","tg_rueck_strecker","tg_nacken","tg_hals_nacken"]},
  {id:"arms",     name:"Arme",      pats:[],                  muscles:["tg_bizeps","tg_unterarm_streck","tg_trizeps_lang","tg_trizeps_lat","tg_unterarm_beug"]},
  {id:"legs",     name:"Beine",     pats:["squat","hinge"],   muscles:["tg_gesaess_haupt","tg_gesaess_med","tg_gesaess_min","tg_quadrizeps","tg_kniesehnen","tg_adduktoren","tg_wade_gastro","tg_wade_soleus","tg_wade_fussheber","tg_huefte"]},
  {id:"core",     name:"Rumpf",     pats:["core"],            muscles:["tg_bauch_gerade","tg_bauch_schraeg","tg_bauch_tief","tg_brust_serratus"]}
];


/* VO2max-Perzentile (ml/kg/min), Cooper Institute / ACSM
   Schlüssel: Altersband → [5., 25., 50., 75., 95. Perzentil] */
var VO2NORM={
  m:{20:[29.0,40.1,48.0,55.2,66.3],30:[27.2,35.9,42.4,49.2,59.8],40:[24.2,31.9,37.8,45.0,55.6],
     50:[20.9,27.1,32.6,39.7,50.7],60:[17.4,23.7,28.2,34.5,43.0],70:[16.3,20.4,24.4,30.4,39.7]},
  w:{20:[21.7,30.5,37.6,44.7,56.0],30:[19.0,25.3,30.2,36.1,45.8],40:[17.0,22.1,26.7,32.4,41.7],
     50:[16.0,19.9,23.4,27.6,35.9],60:[13.4,17.2,20.0,23.8,29.4],70:[13.1,15.6,18.3,20.8,24.1]}
}
;

var AGE_FACTOR=[[29,1.00],[39,0.98],[49,0.92],[59,0.83],[200,0.72]];

var SEX_FACTOR={m:1.0,w:0.62}
;
