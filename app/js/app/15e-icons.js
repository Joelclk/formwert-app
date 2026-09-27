/* =========================================================================
   app/15e-icons.js - Eigenes Motiv fuer jede der 19 Rangstufen (passend zum
   Titel). Zeichenflaeche 100x100, Mitte 50/50, Motiv etwa 34..66.
   Wird von rankBadge() (15e-raenge.js) in die Mitte des Wappens gesetzt.
   ========================================================================= */
var RK_OL="rgba(30,22,14,.72)";   // Umrisslinie der Motive
function rkIcon(r){
  var o=RK_OL,sw=' stroke="'+o+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"';
  r=[0,1,2,3,4,5,6,7,8,9,10,11,13,14,15,12,16,16,18][r];   // Motiv-Reihenfolge an neue Titel angepasst
  switch(r){
  case 0: // Lauch: weisser Schaft, gruene Blaetter
    return '<path d="M46 66 L46 50 C46 47 54 47 54 50 L54 66 C54 69 46 69 46 66Z" fill="#F4F1E4"'+sw+'/>'+
      '<path d="M47 50 C44 42 40 38 36 34 C42 35 47 40 49 47Z M53 50 C56 42 60 38 64 34 C58 35 53 40 51 47Z M49 49 C48 42 49 37 50 32 C51 37 52 42 51 49Z" fill="#6DB24A"'+sw+'/>'+
      '<path d="M47.5 62 h5 M48 58 h4" stroke="#C9C3AD" stroke-width="1"/>';
  case 1: // Spargeltarzan: Spargel mit Liane
    return '<path d="M36 36 C44 44 44 56 36 66" fill="none" stroke="#5E8F32" stroke-width="2.4" stroke-linecap="round"/><circle cx="36" cy="36" r="2" fill="#5E8F32"/>'+
      '<path d="M50 68 L50 40 C50 36 56 36 56 40 L56 68Z" fill="#8CC05A"'+sw+'/>'+
      '<path d="M53 30 C49 34 49 40 50 42 L56 42 C57 40 57 34 53 30Z" fill="#7A5AA0"'+sw+'/>'+
      '<path d="M50 50 l3 -3 3 3 M50 58 l3 -3 3 3" fill="none" stroke="#4E7A2A" stroke-width="1.3"/>';
  case 2: // Gym-Rookie: Anfaenger-L-Schild
    return '<rect x="36" y="36" width="28" height="28" rx="4" fill="#FFFFFF"'+sw+'/><path d="M45 42 V58 H56" fill="none" stroke="#D2342C" stroke-width="5" stroke-linecap="square"/>';
  case 3: // Hantelschubser: kleine Kurzhantel
    return '<rect x="40" y="48" width="20" height="4" rx="1.5" fill="#D8DDE3"'+sw+'/>'+
      '<rect x="34" y="42" width="6" height="16" rx="2" fill="#4A4F57"'+sw+'/><rect x="60" y="42" width="6" height="16" rx="2" fill="#4A4F57"'+sw+'/>'+
      '<rect x="31" y="45" width="3" height="10" rx="1" fill="#4A4F57"'+sw+'/><rect x="66" y="45" width="3" height="10" rx="1" fill="#4A4F57"'+sw+'/>';
  case 4: // Satzsammler: Stapel Hantelscheiben
    return [60,53,46].map(function(y,i){var w=[15,13,11][i];return '<ellipse cx="50" cy="'+(y+3)+'" rx="'+w+'" ry="4.5" fill="#3E434A"'+sw+'/><ellipse cx="50" cy="'+y+'" rx="'+w+'" ry="4.5" fill="#60666F"'+sw+'/><ellipse cx="50" cy="'+y+'" rx="2.4" ry="1.2" fill="#2A2D32"/>';}).join("")+
      '<path d="M58 34 l2.5 2.5 5 -5" fill="none" stroke="#3E9A4A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>';
  case 5: // Pumpernickel: Brotlaib mit Bizeps
    return '<path d="M35 62 C33 48 40 40 50 40 C60 40 67 48 65 62Z" fill="#6B4226"'+sw+'/>'+
      '<path d="M40 46 l4 4 M47 43 l4 4 M54 43 l4 4" stroke="#A9744A" stroke-width="1.6" stroke-linecap="round"/>'+
      '<path d="M44 58 C44 53 48 51 51 53 C52 49 57 49 58 53 C60 55 58 59 55 59 L44 59Z" fill="#E8B48A"'+sw+'/>';
  case 6: // Gym-Bro: Faust-Check
    return '<path d="M33 46 h11 c3 0 4 2 4 4 v6 c0 2 -2 4 -4 4 h-11Z" fill="#F0C39A"'+sw+'/><path d="M67 46 h-11 c-3 0 -4 2 -4 4 v6 c0 2 2 4 4 4 h11Z" fill="#C98E5E"'+sw+'/>'+
      '<path d="M44 49 v10 M40 49 v10 M56 49 v10 M60 49 v10" stroke="'+o+'" stroke-width="1"/>'+
      '<path d="M50 38 v-4 M44 40 l-2 -3 M56 40 l2 -3" stroke="#FFD84A" stroke-width="2" stroke-linecap="round"/>';
  case 7: // Eisenbieger: gebogene Langhantel
    return '<path d="M36 56 Q50 34 64 56" fill="none" stroke="#C9CED6" stroke-width="3.2" stroke-linecap="round"/><path d="M36 56 Q50 34 64 56" fill="none" stroke="'+o+'" stroke-width="1" stroke-linecap="round"/>'+
      '<rect x="29" y="52" width="7" height="14" rx="2" transform="rotate(-35 32.5 59)" fill="#3E434A"'+sw+'/><rect x="64" y="52" width="7" height="14" rx="2" transform="rotate(35 67.5 59)" fill="#3E434A"'+sw+'/>'+
      '<path d="M47 38 l-2 -4 M53 38 l2 -4 M50 37 v-5" stroke="#FFD84A" stroke-width="1.8" stroke-linecap="round"/>';
  case 8: // Hantelheld: Hantel mit Umhang
    return '<path d="M42 44 L58 44 L64 66 L50 60 L36 66Z" fill="#D2342C"'+sw+'/>'+
      '<rect x="40" y="46" width="20" height="4" rx="1.5" fill="#D8DDE3"'+sw+'/>'+
      '<rect x="34" y="40" width="6" height="16" rx="2" fill="#2F5F8F"'+sw+'/><rect x="60" y="40" width="6" height="16" rx="2" fill="#2F5F8F"'+sw+'/>'+
      '<path d="M50 30 l1.8 3.8 4.2 .5 -3.1 2.9 .8 4.1 -3.7 -2 -3.7 2 .8 -4.1 -3.1 -2.9 4.2 -.5Z" fill="#FFD84A"'+sw+'/>';
  case 9: // Gym-Rat: Ratte mit Stirnband
    return '<circle cx="39" cy="40" r="6" fill="#B9B4BE"'+sw+'/><circle cx="61" cy="40" r="6" fill="#B9B4BE"'+sw+'/><circle cx="39" cy="40" r="3" fill="#F2A7B5"/><circle cx="61" cy="40" r="3" fill="#F2A7B5"/>'+
      '<path d="M38 50 C38 42 62 42 62 50 C62 58 55 66 50 66 C45 66 38 58 38 50Z" fill="#9A94A0"'+sw+'/>'+
      '<path d="M38.5 47 C44 44 56 44 61.5 47 L61 51 C55 48 45 48 39 51Z" fill="#D2342C"'+sw+'/>'+
      '<circle cx="45" cy="54" r="1.8" fill="#1E1A22"/><circle cx="55" cy="54" r="1.8" fill="#1E1A22"/><ellipse cx="50" cy="61" rx="2.4" ry="1.8" fill="#E57A90"/>'+
      '<path d="M44 61 l-7 -1 M44 63 l-7 2 M56 61 l7 -1 M56 63 l7 2" stroke="'+o+'" stroke-width=".9"/>';
  case 10: // Kraftpaket: Paket mit Blitz
    return '<path d="M34 44 L50 36 L66 44 L66 60 L50 68 L34 60Z" fill="#C8955A"'+sw+'/><path d="M34 44 L50 52 L66 44 M50 52 V68" fill="none"'+sw+'/>'+
      '<path d="M43 40 L59 48" stroke="#E9CDA2" stroke-width="3"/>'+
      '<path d="M53 49 L46 58 H51 L48 66 L57 55 H52 L55 49Z" fill="#FFD84A"'+sw+'/>';
  case 11: // Muskelberg: Berg mit Bizeps-Gipfel
    return '<path d="M31 66 L44 44 L50 52 L56 40 L69 66Z" fill="#6E7A86"'+sw+'/><path d="M52 47 L56 40 L60 47 L57 45 L55 47Z" fill="#FFFFFF"/>'+
      '<path d="M40 38 C40 32 45 30 48 33 C49 29 55 29 56 33 C58 35 56 39 53 39 L40 39Z" fill="#F0C39A"'+sw+'/>';
  case 12: // Gorilla: Gorillakopf
    return '<path d="M36 50 C34 38 42 32 50 32 C58 32 66 38 64 50 C64 60 58 67 50 67 C42 67 36 60 36 50Z" fill="#3A3538"'+sw+'/>'+
      '<path d="M41 49 C41 44 59 44 59 49 C60 57 56 63 50 63 C44 63 40 57 41 49Z" fill="#8C7A72"/>'+
      '<path d="M40 44 C44 41 56 41 60 44" fill="none" stroke="#1E1A1C" stroke-width="2.4" stroke-linecap="round"/>'+
      '<circle cx="45" cy="48" r="1.8" fill="#FFF"/><circle cx="55" cy="48" r="1.8" fill="#FFF"/><circle cx="45" cy="48" r=".9" fill="#111"/><circle cx="55" cy="48" r=".9" fill="#111"/>'+
      '<path d="M46 55 h8 M47 59 c2 1.5 4 1.5 6 0" fill="none" stroke="#3A3538" stroke-width="1.4" stroke-linecap="round"/>';
  case 13: // Wikinger: Helm mit Hoernern
    return '<path d="M38 50 C32 48 29 40 31 32 C34 38 38 41 42 42Z M62 50 C68 48 71 40 69 32 C66 38 62 41 58 42Z" fill="#F2E6CC"'+sw+'/>'+
      '<path d="M37 56 C37 44 42 38 50 38 C58 38 63 44 63 56Z" fill="#9AA3AD"'+sw+'/>'+
      '<path d="M36 56 H64 V60 H36Z" fill="#8C6A3A"'+sw+'/><path d="M50 38 V56" stroke="'+o+'" stroke-width="1.4"/><path d="M47.5 56 h5 v8 h-5Z" fill="#9AA3AD"'+sw+'/>';
  case 14: // Gladiator: Dreizack vor Netz
    return '<circle cx="50" cy="52" r="14" fill="#E6D3A8"'+sw+'/>'+
      '<path d="M40 42 L60 62 M36 52 L50 66 M40 62 L60 42 M50 38 L64 52 M50 66 L64 52 M36 52 L50 38" stroke="rgba(90,70,40,.5)" stroke-width="1"/>'+
      '<path d="M50 70 V36" stroke="#7A6A5A" stroke-width="2.6" stroke-linecap="round"/>'+
      '<path d="M42 38 V32 M58 38 V32 M42 38 C42 42 58 42 58 38 M50 36 V29" fill="none" stroke="#C9CED6" stroke-width="2.4" stroke-linecap="round"/>'+
      '<path d="M42 32 l-1.8 3 M42 32 l1.8 3 M58 32 l-1.8 3 M58 32 l1.8 3 M50 29 l-2 3.4 M50 29 l2 3.4" stroke="#C9CED6" stroke-width="1.8" stroke-linecap="round"/>';
  case 15: // Spartaner: Helm mit Kamm
    return '<path d="M34 42 C38 30 62 30 66 42 C62 36 58 34 50 34 C42 34 38 36 34 42Z" fill="#D2342C"'+sw+'/>'+
      '<path d="M38 66 L38 50 C38 42 44 38 50 38 C56 38 62 42 62 50 L62 66 L55 66 L55 56 L52 52 L52 66 L48 66 L48 52 L45 56 L45 66Z" fill="#E4AE1C"'+sw+'/>'+
      '<path d="M42 50 h6 M52 50 h6" stroke="#8C5E00" stroke-width="1.6" stroke-linecap="round"/>';
  case 16: // Titan: geballte Faust
    return '<path d="M38 50 C38 44 42 42 45 42 L60 42 C64 42 66 45 66 49 L66 56 C66 62 61 66 55 66 L46 66 C41 66 38 62 38 57Z" fill="#E3B089"'+sw+'/>'+
      '<path d="M45 42 V50 M52 42 V50 M59 42 V50" stroke="'+o+'" stroke-width="1.2"/>'+
      '<path d="M38 52 C42 50 48 51 50 55 C47 56 43 57 38 57" fill="#D39A70"'+sw+'/>'+
      '<path d="M44 36 l-2 -4 M52 35 v-5 M60 36 l2 -4" stroke="#FFD84A" stroke-width="2" stroke-linecap="round"/>';
  case 17: // King Kong: grosser Affe mit Krone, Faeuste auf der Brust
    return '<path d="M40 36 L42 28 L46 33 L50 26 L54 33 L58 28 L60 36Z" fill="#FFD84A"'+sw+'/>'+
      '<path d="M34 54 C32 42 40 36 50 36 C60 36 68 42 66 54 C66 62 60 68 50 68 C40 68 34 62 34 54Z" fill="#2E2A2C"'+sw+'/>'+
      '<path d="M41 52 C41 46 59 46 59 52 C60 59 56 64 50 64 C44 64 40 59 41 52Z" fill="#7C6A62"/>'+
      '<path d="M40 47 C45 44 55 44 60 47" fill="none" stroke="#141112" stroke-width="2.6" stroke-linecap="round"/>'+
      '<circle cx="45" cy="51" r="1.8" fill="#FFB020"/><circle cx="55" cy="51" r="1.8" fill="#FFB020"/>'+
      '<path d="M45 59 C47 56 53 56 55 59 C53 61 47 61 45 59Z" fill="#fff"'+sw+'/>';
  default: // Weltenheber: Figur stemmt die Weltkugel
    return '<circle cx="50" cy="40" r="11" fill="#4A93F2"'+sw+'/>'+
      '<path d="M41 36 C45 38 48 34 52 36 C55 38 58 35 60 37 M42 45 C46 43 50 47 55 44 C57 43 59 45 59 45" fill="none" stroke="#6DB24A" stroke-width="3" stroke-linecap="round"/>'+
      '<circle cx="50" cy="40" r="11" fill="none"'+sw+'/>'+
      '<path d="M40 48 C38 52 40 55 44 56 M60 48 C62 52 60 55 56 56" fill="none" stroke="#FFF" stroke-width="3.2" stroke-linecap="round"/>'+
      '<circle cx="50" cy="56" r="3" fill="#FFF"/><path d="M50 59 V64 M50 64 L46 70 M50 64 L54 70" stroke="#FFF" stroke-width="3.2" stroke-linecap="round"/>';
  }
}
