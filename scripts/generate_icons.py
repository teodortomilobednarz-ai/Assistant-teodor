#!/usr/bin/env python3
"""Generates all Nutrascan icon assets."""

import math
import os
from PIL import Image, ImageDraw, ImageFilter

ASSETS = os.path.join(os.path.dirname(__file__), '..', 'assets')

# Brand colours
BG       = (8,   8,  16)
PURPLE   = (124, 58, 237)
CYAN     = (0,  217, 255)
GREEN    = (0,  255, 136)
WHITE    = (255, 255, 255)

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))

def radial_bg(img, cx, cy, r_inner, r_outer, c_inner, c_outer):
    px = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy)
            t = max(0.0, min(1.0, (d - r_inner) / max(1, r_outer - r_inner)))
            px[x, y] = lerp(c_inner, c_outer, t)

def glow(draw, cx, cy, r, color, steps=8):
    for i in range(steps, 0, -1):
        alpha = int(180 * (i / steps) ** 2)
        rad   = r + (steps - i) * 6
        rgba  = color + (alpha,)
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], outline=rgba, width=2)

def draw_scan_lines(draw, cx, cy, size, color, n=4):
    """Horizontal scan lines through the icon area."""
    for i in range(n):
        y = cy - size // 3 + i * (size // (n * 2 + 1)) * 2
        alpha = 60 - i * 10
        draw.line([(cx - size // 3, y), (cx + size // 3, y)],
                  fill=color + (alpha,), width=1)

def hex_points(cx, cy, r, rotation=0):
    pts = []
    for i in range(6):
        angle = math.radians(60 * i + rotation)
        pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
    return pts

def make_icon_1024():
    """Main App Store icon — 1024×1024, solid (no alpha)."""
    size = 1024
    img  = Image.new('RGB', (size, size), BG)

    # --- radial background glow ---
    cx, cy = size // 2, size // 2
    px = img.load()
    for y in range(size):
        for x in range(size):
            d  = math.hypot(x - cx, y - cy)
            t  = max(0.0, min(1.0, d / (size * 0.65)))
            bg = lerp((18, 12, 40), BG, t)
            px[x, y] = bg

    # --- overlay layer for glow ---
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)

    # outer hex ring
    for offset, alpha in [(0, 30), (8, 18), (16, 8)]:
        pts = hex_points(cx, cy, 380 + offset, rotation=30)
        od.polygon(pts, outline=PURPLE + (alpha,))

    # main hex background
    pts = hex_points(cx, cy, 360, rotation=30)
    od.polygon(pts, fill=(20, 10, 50, 220), outline=PURPLE + (180,))

    # glow ring
    for r, a in [(340, 40), (320, 25), (300, 12)]:
        od.ellipse([cx-r, cy-r, cx+r, cy+r], outline=CYAN + (a,), width=3)

    # inner circle backdrop
    od.ellipse([cx-260, cy-260, cx+260, cy+260], fill=(10, 6, 28, 230))
    od.ellipse([cx-264, cy-264, cx+264, cy+264], outline=CYAN + (160,), width=3)

    # scan line decorations
    for i, y_off in enumerate([-90, -30, 30, 90]):
        a = 50 - abs(y_off) // 4
        od.line([(cx - 200, cy + y_off), (cx + 200, cy + y_off)],
                fill=CYAN + (a,), width=1)

    # ---- Letter "N" ----
    nw, nh = 200, 280
    nx, ny = cx - nw // 2, cy - nh // 2
    lw = 42  # stroke width

    n_pts_left  = [(nx,      ny + nh), (nx,      ny)]
    n_pts_right = [(nx + nw, ny),      (nx + nw, ny + nh)]
    n_diag      = [(nx,      ny),      (nx + nw, ny + nh)]

    for pts in [n_pts_left, n_pts_right, n_diag]:
        od.line(pts, fill=WHITE + (255,), width=lw)
        od.line(pts, fill=PURPLE + (120,), width=lw + 8)  # glow behind

    # redraw sharp strokes on top
    for pts in [n_pts_left, n_pts_right, n_diag]:
        od.line(pts, fill=WHITE + (255,), width=lw)

    # cyan accent dots at N corners
    for pt in [(nx, ny), (nx + nw, ny), (nx, ny + nh), (nx + nw, ny + nh)]:
        od.ellipse([pt[0]-8, pt[1]-8, pt[0]+8, pt[1]+8], fill=CYAN + (220,))

    # bottom label
    # (skipped — font loading unreliable; the "N" reads clearly)

    # small scan chevron below N
    chev_y = cy + 175
    for dx in range(-50, 51, 10):
        a = max(0, 180 - abs(dx) * 2)
        od.ellipse([cx + dx - 3, chev_y - 3, cx + dx + 3, chev_y + 3],
                   fill=GREEN + (a,))

    img.paste(Image.alpha_composite(Image.new('RGBA', (size, size), (0,0,0,0)), overlay), mask=overlay)

    # slight blur on a copy for atmosphere then blend
    blurred = img.filter(ImageFilter.GaussianBlur(radius=1))
    img = Image.blend(img, blurred, 0.15)

    out = os.path.join(ASSETS, 'icon.png')
    img.save(out, 'PNG')
    print(f'✓ icon.png  ({size}x{size})')
    return img

def make_adaptive_icon():
    """Android adaptive icon foreground — 1024×1024 with transparent background."""
    size = 1024
    img  = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    od   = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2

    # outer hex
    pts = hex_points(cx, cy, 400, rotation=30)
    od.polygon(pts, fill=(20, 10, 50, 240), outline=PURPLE + (220,))

    # inner circle
    od.ellipse([cx-300, cy-300, cx+300, cy+300], fill=(10, 6, 28, 230))
    od.ellipse([cx-302, cy-302, cx+302, cy+302], outline=CYAN + (200,), width=3)

    # N letter
    nw, nh = 220, 310
    nx, ny = cx - nw // 2, cy - nh // 2
    lw = 48

    for pts in [[(nx, ny+nh),(nx,ny)], [(nx+nw,ny),(nx+nw,ny+nh)], [(nx,ny),(nx+nw,ny+nh)]]:
        od.line(pts, fill=WHITE + (255,), width=lw)

    for pt in [(nx, ny),(nx+nw,ny),(nx,ny+nh),(nx+nw,ny+nh)]:
        od.ellipse([pt[0]-9,pt[1]-9,pt[0]+9,pt[1]+9], fill=CYAN+(220,))

    out = os.path.join(ASSETS, 'adaptive-icon.png')
    img.save(out, 'PNG')
    print(f'✓ adaptive-icon.png  ({size}x{size})')

def make_splash():
    """Splash screen — 1242×2436 (iPhone max), dark bg + centered icon."""
    w, h = 1242, 2436
    img  = Image.new('RGB', (w, h), BG)
    cx, cy = w // 2, h // 2

    # subtle radial glow
    px = img.load()
    for y in range(h):
        for x in range(w):
            d = math.hypot(x - cx, y - cy)
            t = max(0.0, min(1.0, d / (h * 0.55)))
            px[x, y] = lerp((18, 12, 40), BG, t)

    overlay = Image.new('RGBA', (w, h), (0,0,0,0))
    od = ImageDraw.Draw(overlay)

    # center hex
    pts = hex_points(cx, cy, 220, rotation=30)
    od.polygon(pts, fill=(20, 10, 50, 230), outline=PURPLE + (200,))
    od.ellipse([cx-175, cy-175, cx+175, cy+175], fill=(10,6,28,220))
    od.ellipse([cx-178, cy-178, cx+178, cy+178], outline=CYAN+(180,), width=2)

    # N letter (smaller)
    nw, nh = 120, 170
    nx, ny = cx - nw // 2, cy - nh // 2
    lw = 28
    for pts in [[(nx,ny+nh),(nx,ny)],[(nx+nw,ny),(nx+nw,ny+nh)],[(nx,ny),(nx+nw,ny+nh)]]:
        od.line(pts, fill=WHITE+(255,), width=lw)
    for pt in [(nx,ny),(nx+nw,ny),(nx,ny+nh),(nx+nw,ny+nh)]:
        od.ellipse([pt[0]-5,pt[1]-5,pt[0]+5,pt[1]+5], fill=CYAN+(220,))

    img.paste(Image.alpha_composite(Image.new('RGBA',(w,h),(0,0,0,0)), overlay), mask=overlay)
    out = os.path.join(ASSETS, 'splash-icon.png')
    img.save(out, 'PNG')
    print(f'✓ splash-icon.png  ({w}x{h})')

def make_favicon():
    size = 64
    img  = Image.new('RGBA', (size, size), (0,0,0,0))
    od   = ImageDraw.Draw(img)
    od.ellipse([0,0,size-1,size-1], fill=(20,10,50,255))
    nw,nh = 28,40
    nx,ny = size//2-nw//2, size//2-nh//2
    lw=6
    for pts in [[(nx,ny+nh),(nx,ny)],[(nx+nw,ny),(nx+nw,ny+nh)],[(nx,ny),(nx+nw,ny+nh)]]:
        od.line(pts,fill=WHITE+(255,),width=lw)
    out = os.path.join(ASSETS, 'favicon.png')
    img.save(out,'PNG')
    print(f'✓ favicon.png  ({size}x{size})')

if __name__ == '__main__':
    os.makedirs(ASSETS, exist_ok=True)
    make_icon_1024()
    make_adaptive_icon()
    make_splash()
    make_favicon()
    print('\nAll assets generated.')
