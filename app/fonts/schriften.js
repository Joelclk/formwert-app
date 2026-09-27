/* IBM Plex lokal statt von Google Fonts.
   Das Laden von Google-Servern gibt die IP-Adresse der Nutzer an Google weiter und ist in
   Deutschland ohne Einwilligung abmahnfaehig. Die Dateien sind die "latin"-Teilmengen, wie
   Google Fonts sie ausliefert (enthalten Umlaute, ß, Gedankenstriche, €); unicode-range
   ist dieselbe, alles andere faellt wie vorher auf die Ersatzschriften der CSS zurueck.
   Warum per fetch + FontFace statt @font-face url(...): Die Artifact-Umgebung laesst
   Schriftdateien nur von fonts.gstatic.com oder als data:-URI zu, fetch() auf eigene Dateien
   aber schon. Aus einem ArrayBuffer erzeugte Schriften laden keine URL und fallen damit
   nicht unter diese Sperre. Schlaegt etwas fehl, bleibt es bei den Ersatzschriften.
   Lizenz: SIL Open Font License 1.1, siehe fonts/OFL.txt. */
(function(){
  if(!window.fetch||!window.FontFace||!document.fonts)return;
  var BEREICH="U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
  [["IBM Plex Sans","400 600","ibm-plex-sans-latin"],
   ["IBM Plex Sans Condensed","500","ibm-plex-sans-condensed-500-latin"],
   ["IBM Plex Sans Condensed","600","ibm-plex-sans-condensed-600-latin"],
   ["IBM Plex Sans Condensed","700","ibm-plex-sans-condensed-700-latin"],
   ["IBM Plex Mono","400","ibm-plex-mono-400-latin"],
   ["IBM Plex Mono","500","ibm-plex-mono-500-latin"],
   ["IBM Plex Mono","600","ibm-plex-mono-600-latin"]].forEach(function(s){
    fetch("fonts/"+s[2]+".woff2").then(function(r){if(!r.ok)throw new Error(r.status);return r.arrayBuffer();})
      .then(function(buf){
        var f=new FontFace(s[0],buf,{weight:s[1],style:"normal",unicodeRange:BEREICH,display:"swap"});
        document.fonts.add(f);return f.load();
      }).catch(function(){});
  });
})();
