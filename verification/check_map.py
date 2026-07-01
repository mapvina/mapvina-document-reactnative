#!/usr/bin/env python3
"""Classify a MapVina app screenshot into RENDERED / BLANK / ERROR.

Calibrated against the repo reference images (images/android_*, ios_*, error_*):
  * ERROR  -> RN redbox / crashed / black surface: dominant dark, dark_frac high,
             or large red_frac (redbox).
  * BLANK  -> pure flat white with no map features at all (needs log evidence to
             decide pass/fail; a very low-zoom valid map can look like this).
  * RENDERED -> light map surface, usually with water(blue)/green/road(dark) detail.

Pixel state alone is not conclusive for BLANK vs sparse-valid map; always
corroborate with runtime logs (style loaded, tiles requested, no SIGABRT).

Usage: check_map.py <image> [--label NAME]
Exit: 0 RENDERED, 1 BLANK, 2 ERROR, 3 usage/read error.
"""
import sys
from collections import Counter
from PIL import Image


def analyze(path):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    region = img.crop((int(w * 0.05), int(h * 0.22),
                       int(w * 0.95), int(h * 0.88))).resize((200, 200))
    px = list(region.getdata())
    n = len(px)

    def q(c):
        return (c[0] >> 3, c[1] >> 3, c[2] >> 3)

    counts = Counter(q(p) for p in px)
    uniq = len(counts)
    dom, domc = counts.most_common(1)[0]
    domrgb = (dom[0] << 3, dom[1] << 3, dom[2] << 3)
    dom_frac = domc / n
    white = sum(1 for p in px if p[0] > 235 and p[1] > 235 and p[2] > 235) / n
    blue = sum(1 for p in px if p[2] > p[0] + 18 and p[2] > p[1] + 8 and p[2] > 110) / n
    dark = sum(1 for p in px if max(p) < 120) / n
    green = sum(1 for p in px if p[1] > p[0] + 12 and p[1] > p[2] + 12) / n
    red = sum(1 for p in px if p[0] > 150 and p[1] < 90 and p[2] < 90) / n

    if red > 0.35:
        state = "ERROR"          # React Native redbox
    elif dark > 0.4:
        state = "ERROR"          # black / crashed surface
    elif white > 0.90 and uniq < 40 and dark < 0.01 and blue < 0.01:
        state = "BLANK"          # flat white, no features (verify via logs)
    else:
        state = "RENDERED"       # light map surface with detail

    return dict(size=(w, h), uniq=uniq, dom=domrgb, dom_frac=round(dom_frac, 2),
                white=round(white, 2), blue=round(blue, 2), dark=round(dark, 2),
                green=round(green, 2), red=round(red, 2), state=state)


def main():
    if len(sys.argv) < 2:
        print("usage: check_map.py <image> [--label NAME]")
        sys.exit(3)
    path = sys.argv[1]
    label = sys.argv[sys.argv.index("--label") + 1] if "--label" in sys.argv else path
    try:
        r = analyze(path)
    except Exception as e:
        print(f"[{label}] READ-ERROR {e}")
        sys.exit(3)
    print(f"[{label}] {r['state']}")
    print(f"  size={r['size']} uniq={r['uniq']} dom={r['dom']} dom_frac={r['dom_frac']} "
          f"white={r['white']} blue={r['blue']} green={r['green']} dark={r['dark']} red={r['red']}")
    sys.exit({"RENDERED": 0, "BLANK": 1, "ERROR": 2}[r["state"]])


if __name__ == "__main__":
    main()
