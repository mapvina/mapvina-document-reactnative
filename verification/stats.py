#!/usr/bin/env python3
import sys
from collections import Counter
from PIL import Image

def stats(path):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    region = img.crop((int(w*0.05), int(h*0.22), int(w*0.95), int(h*0.88))).resize((200,200))
    px = list(region.getdata())
    n = len(px)
    def q(c): return (c[0]>>3, c[1]>>3, c[2]>>3)
    counts = Counter(q(p) for p in px)
    uniq = len(counts)
    dom, domc = counts.most_common(1)[0]
    domrgb = (dom[0]<<3, dom[1]<<3, dom[2]<<3)
    white = sum(1 for p in px if p[0]>235 and p[1]>235 and p[2]>235)/n
    blue  = sum(1 for p in px if p[2]>p[0]+18 and p[2]>p[1]+8 and p[2]>110)/n
    dark  = sum(1 for p in px if max(p)<120)/n
    green = sum(1 for p in px if p[1]>p[0]+12 and p[1]>p[2]+12)/n
    red   = sum(1 for p in px if p[0]>150 and p[1]<90 and p[2]<90)/n
    print(f"{path.split('/')[-1]:16} uniq={uniq:4d} dom={str(domrgb):18} domfrac={domc/n:.2f} "
          f"white={white:.2f} blue={blue:.2f} dark={dark:.2f} green={green:.2f} red={red:.2f}")

for p in sys.argv[1:]:
    try:
        stats(p)
    except Exception as e:
        print(p, "ERR", e)
