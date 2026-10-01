#!/usr/bin/env python3
"""Holt Titel, Kanal, Länge und Untertitel eines YouTube-Videos als Klartext.

Aufruf:  python3 transkript.py <url-oder-id> [zielordner] [sprache]
Sprache: "auto" (Standard) nimmt die Originalsprache des Videos.

Bricht früh ab (Ausgang 2), wenn YouTube ablehnt (429), statt weiterzuprobieren –
jeder weitere Versuch verlängert nur die Sperre.
"""
import json, os, re, subprocess, sys, glob

UVX = os.path.expanduser("~/.local/bin/uvx")


def vtt_zu_text(pfad):
    zeilen, letzte = [], None
    for z in open(pfad, encoding="utf-8"):
        z = z.strip()
        if not z or "-->" in z or z.startswith(("WEBVTT", "Kind:", "Language:")):
            continue
        z = re.sub(r"<[^>]+>", "", z).strip()
        # Automatische Untertitel wiederholen jede Zeile beim Weiterrollen
        if z and z != letzte:
            zeilen.append(z)
            letzte = z
    return " ".join(zeilen)


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    url = sys.argv[1]
    if not url.startswith("http"):
        url = "https://www.youtube.com/watch?v=" + url
    ziel = sys.argv[2] if len(sys.argv) > 2 else "."
    sprache = sys.argv[3] if len(sys.argv) > 3 else "auto"
    os.makedirs(ziel, exist_ok=True)

    info = subprocess.run([UVX, "yt-dlp", "-J", "--skip-download", url],
                          capture_output=True, text=True)
    if info.returncode != 0:
        print("FEHLER Metadaten:", info.stderr.strip().splitlines()[-1:])
        sys.exit(2 if "429" in info.stderr else 1)
    meta = json.loads(info.stdout)
    vid = meta["id"]
    if sprache == "auto":
        sprache = (meta.get("language") or "en").split("-")[0]

    # Erst die vom Kanal hochgeladenen Untertitel, sonst die automatischen
    lauf = subprocess.run([UVX, "yt-dlp", "--skip-download", "--write-subs", "--write-auto-subs",
                           "--sub-langs", sprache + "," + sprache + "-orig", "--sub-format", "vtt",
                           "-o", os.path.join(ziel, vid), url], capture_output=True, text=True)
    dateien = sorted(glob.glob(os.path.join(ziel, vid + ".*.vtt")))
    if not dateien:
        print("FEHLER keine Untertitel (%s):" % sprache, lauf.stderr.strip().splitlines()[-1:])
        sys.exit(2 if "429" in lauf.stderr else 1)

    text = vtt_zu_text(dateien[0])
    aus = os.path.join(ziel, vid + ".txt")
    with open(aus, "w", encoding="utf-8") as f:
        f.write("# %s\nKanal: %s | Länge: %s | Aufrufe: %s | Sprache: %s\nhttps://youtu.be/%s\n\n%s\n" % (
            meta.get("title"), meta.get("channel"), meta.get("duration_string"),
            meta.get("view_count"), sprache, vid, text))
    print("OK %s | %s | %s | %d Wörter -> %s" % (vid, meta.get("channel"), meta.get("title"),
                                                  len(text.split()), aus))


if __name__ == "__main__":
    main()
