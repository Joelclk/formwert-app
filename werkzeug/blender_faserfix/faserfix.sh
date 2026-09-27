#!/bin/bash
# Gesamtablauf: Diagnose → Render vorher → Fix (mit Sicherheitskopie) →
# Render nachher → Diagnose nachher. Bricht beim ersten Fehler ab, damit
# nie ein halber Fix gespeichert wird.
#
#   ./faserfix.sh /Pfad/zu/arm-rig-130-oberschenkel.blend [weitere Optionen]
#
# Weitere Optionen gehen an faserfix.py, z. B. --muskeln M1,M2 --armatur Rig
set -euo pipefail
# ${@+"$@"} statt "$@": Bash 3.2 (macOS) meldet sonst bei set -u ohne
# Zusatzoptionen "unbound variable".

BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
DATEI="${1:?Pfad zur .blend-Datei angeben}"
shift
SKRIPT="$(cd "$(dirname "$0")" && pwd)/faserfix.py"
AUS="$(cd "$(dirname "$DATEI")" && pwd)/faserfix_ergebnis"
mkdir -p "$AUS"

lauf() {
  local log="$1"; shift
  "$BLENDER" --background "$DATEI" --python-exit-code 1 --python "$SKRIPT" -- \
    "$@" --aus "$AUS" 2>&1 | tee "$AUS/$log"
}

lauf 1_diagnose_vorher.log  diagnose --tag vorher ${@+"$@"}
lauf 2_render_vorher.log    render   --tag vorher ${@+"$@"}
lauf 3_fix.log              fix                   ${@+"$@"}
lauf 4_render_nachher.log   render   --tag nachher ${@+"$@"}
lauf 5_diagnose_nachher.log diagnose --tag nachher ${@+"$@"}

echo
echo "Fertig. Ergebnisse in: $AUS"
echo "  vergleich.png     oben vorher, unten nachher (Bild 1 vorne/Seite, Bild 273 vorne/Seite)"
echo "  3_fix.log         Messung vor/nach dem Fix, Pfad der Sicherheitskopie"
