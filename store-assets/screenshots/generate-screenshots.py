#!/usr/bin/env python3
"""
Generates 5 App Store screenshot mockups as PNG (1290x2796 — iPhone 6.7").
Run:  python3 store-assets/screenshots/generate-screenshots.py
Output: store-assets/screenshots/screenshot-{1..5}.png
"""

import math, os
from PIL import Image, ImageDraw

OUT = os.path.dirname(__file__)
W, H = 1290, 2796

# --- Brand colours ---
BG       = (8,   8,  16)
SURFACE  = (16,  14, 32)
BORDER   = (40,  36, 72)
PURPLE   = (124, 58, 237)
CYAN     = (0,  217, 255)
GREEN    = (0,  255, 136)
PINK     = (255, 45, 120)
WHITE    = (255, 255, 255)
MUTED    = (110, 108, 140)

def new_img():
    img = Image.new('RGB', (W, H), BG)
    # subtle radial bg
    px = img.load()
    cx, cy = W//2, H//3
    for y in range(H):
        for x in range(W):
            d = math.hypot(x-cx, y-cy)
            t = min(1.0, d/(H*0.6))
            bg = tuple(int(BG[i] + ((18,12,40)[i]-BG[i])*(1-t)) for i in range(3))
            px[x,y] = bg
    return img

def rounded_rect(draw, xy, radius, fill=None, outline=None, width=1):
    x0,y0,x1,y1 = xy
    r = radius
    if fill:
        draw.rectangle([x0+r,y0,x1-r,y1], fill=fill)
        draw.rectangle([x0,y0+r,x1,y1-r], fill=fill)
        draw.ellipse([x0,y0,x0+2*r,y0+2*r], fill=fill)
        draw.ellipse([x1-2*r,y0,x1,y0+2*r], fill=fill)
        draw.ellipse([x0,y1-2*r,x0+2*r,y1], fill=fill)
        draw.ellipse([x1-2*r,y1-2*r,x1,y1], fill=fill)
    if outline:
        draw.rounded_rectangle(xy, radius=r, outline=outline, width=width)

def draw_pill(draw, text, xy, bg, fg=WHITE, w=200, h=52):
    x,y = xy
    rounded_rect(draw, [x,y,x+w,y+h], 26, fill=bg)
    draw.text((x+w//2, y+h//2), text, fill=fg, anchor='mm')

def hex_pts(cx,cy,r,rot=0):
    return [(cx+r*math.cos(math.radians(60*i+rot)), cy+r*math.sin(math.radians(60*i+rot))) for i in range(6)]

# ── SCREENSHOT 1: Dashboard ──────────────────────────────────────────────────
def shot1():
    img = new_img(); d = ImageDraw.Draw(img)

    # Status bar
    d.text((80, 100), '09:41', fill=WHITE)
    d.text((W-80, 100), '●●●', fill=WHITE, anchor='ra')

    # Title
    d.text((80, 200), 'DASHBOARD', fill=WHITE)
    d.text((80, 270), 'Mercredi 18 Juin', fill=MUTED)

    # Calorie ring (SVG-style via ellipses)
    cx,cy,r = W//2, 680, 220
    d.ellipse([cx-r,cy-r,cx+r,cy+r], outline=SURFACE, width=28)
    # arc approximation — draw filled arcs
    for i in range(180):  # 75% filled → 270 degrees
        angle = math.radians(-90 + i*1.5)
        x0 = cx + (r-14)*math.cos(angle)
        y0 = cy + (r-14)*math.sin(angle)
        d.ellipse([x0-14,y0-14,x0+14,y0+14], fill=PURPLE)
    d.text((cx, cy-30), '1 847', fill=WHITE, anchor='mm')
    d.text((cx, cy+20), 'kcal', fill=MUTED, anchor='mm')
    d.text((cx, cy+80), '453 restantes', fill=GREEN, anchor='mm')

    # Macro gauges
    macros = [('PROTÉINES','127g','168g',GREEN,0.76), ('GLUCIDES','214g','254g',CYAN,0.84), ('LIPIDES','48g','57g',PINK,0.84)]
    gx = 80; gy = 980
    for label, cur, goal, col, pct in macros:
        d.text((gx, gy), label, fill=MUTED)
        d.text((gx, gy+50), cur, fill=col)
        d.text((gx+300, gy+50), f'/ {goal}', fill=MUTED)
        rounded_rect(d, [gx, gy+100, gx+380, gy+120], 8, fill=SURFACE)
        rounded_rect(d, [gx, gy+100, gx+int(380*pct), gy+120], 8, fill=col)
        gx += 420

    # Scan button
    bx, by, bw, bh = W//2-260, 1280, 520, 130
    rounded_rect(d, [bx,by,bx+bw,by+bh], 65, fill=PURPLE)
    d.text((bx+bw//2, by+bh//2), '⚡  SCANNER UN REPAS', fill=WHITE, anchor='mm')

    # Ad banner placeholder
    rounded_rect(d, [80, 1450, W-80, 1530], 12, outline=BORDER, width=2)
    d.text((W//2, 1490), 'Publicité', fill=MUTED, anchor='mm')

    img.save(f'{OUT}/screenshot-1.png')
    print('✓ screenshot-1.png  — Dashboard')

# ── SCREENSHOT 2: Résultat scan IA ──────────────────────────────────────────
def shot2():
    img = new_img(); d = ImageDraw.Draw(img)
    d.text((W//2, 120), 'ANALYSE IA', fill=WHITE, anchor='mm')

    # Food image placeholder
    rounded_rect(d, [80, 200, W-80, 750], 40, fill=SURFACE, outline=BORDER, width=2)
    d.text((W//2, 475), '🍝', fill=WHITE, anchor='mm')
    # scan line
    d.line([(80, 450),(W-80, 450)], fill=CYAN+(128,) if False else CYAN, width=3)
    d.text((W//2, 700), 'ANALYSE COMPLÈTE ✓', fill=GREEN, anchor='mm')

    # Food name card
    rounded_rect(d, [80, 800, W-80, 950], 30, fill=SURFACE, outline=BORDER, width=2)
    d.text((160, 850), 'Pâtes Carbonara +1', fill=WHITE)
    d.text((160, 910), '1 portion identifiée', fill=MUTED)
    d.text((W-120, 870), '72', fill=GREEN, anchor='ra')
    d.text((W-120, 920), 'SCORE', fill=MUTED, anchor='ra')

    # Macro cards
    cards = [('PROTÉINES','28g',GREEN), ('GLUCIDES','82g',CYAN), ('LIPIDES','34g',PINK)]
    cx = 80
    for label, val, col in cards:
        rounded_rect(d, [cx, 1000, cx+350, 1180], 24, fill=SURFACE, outline=col+(60,), width=2)
        d.text((cx+175, 1060), val, fill=col, anchor='mm')
        d.text((cx+175, 1130), label, fill=MUTED, anchor='mm')
        cx += 380

    # Calories banner
    rounded_rect(d, [80, 1230, W-80, 1380], 30, fill=SURFACE, outline=PURPLE+(60,), width=2)
    d.text((200, 1280), 'ÉNERGIE TOTALE', fill=MUTED)
    d.text((200, 1340), '742 kcal', fill=PURPLE)

    # CTA
    rounded_rect(d, [80, 1430, W-80, 1560], 65, fill=PURPLE)
    d.text((W//2, 1495), '+ AJOUTER AU JOURNAL', fill=WHITE, anchor='mm')

    img.save(f'{OUT}/screenshot-2.png')
    print('✓ screenshot-2.png  — Résultat scan')

# ── SCREENSHOT 3: Abonnement ─────────────────────────────────────────────────
def shot3():
    img = new_img(); d = ImageDraw.Draw(img)

    # Hero
    cx = W//2
    d.ellipse([cx-100, 180, cx+100, 380], fill=PURPLE)
    d.text((cx, 280), '⚡', fill=WHITE, anchor='mm')
    d.text((cx, 440), 'NUTRASCAN', fill=WHITE, anchor='mm')
    d.text((cx, 510), 'PREMIUM', fill=PURPLE, anchor='mm')

    # Plan cards
    # Monthly
    rounded_rect(d, [80, 600, 580, 860], 30, fill=SURFACE, outline=BORDER, width=2)
    d.text((330, 660), 'MENSUEL', fill=MUTED, anchor='mm')
    d.text((330, 750), '9,99€', fill=WHITE, anchor='mm')
    d.text((330, 820), '/mois', fill=MUTED, anchor='mm')

    # Yearly — selected
    rounded_rect(d, [620, 600, W-80, 860], 30, fill=SURFACE, outline=PURPLE, width=3)
    rounded_rect(d, [820, 600, 980, 660], 20, fill=GREEN)
    d.text((900, 630), '−33%', fill=BG, anchor='mm')
    d.text((955+80//2, 680), 'ANNUEL', fill=PURPLE, anchor='mm')
    d.text((955+80//2, 760), '79,99€', fill=PURPLE, anchor='mm')
    d.text((955+80//2, 820), '/an', fill=MUTED, anchor='mm')

    # Features
    feats = ['Scan repas illimité IA','Analyse masse grasse IA','Zéro publicité','Données privées & sécurisées','Projections avancées']
    fy = 920
    for feat in feats:
        d.text((120, fy), '✓', fill=GREEN)
        d.text((180, fy), feat, fill=WHITE)
        fy += 90

    # CTA
    rounded_rect(d, [80, 1420, W-80, 1560], 65, fill=PURPLE)
    d.text((W//2, 1490), "S'ABONNER · 79,99€/AN", fill=WHITE, anchor='mm')

    img.save(f'{OUT}/screenshot-3.png')
    print('✓ screenshot-3.png  — Abonnement')

# ── SCREENSHOT 4: Journal ────────────────────────────────────────────────────
def shot4():
    img = new_img(); d = ImageDraw.Draw(img)
    d.text((80, 150), 'JOURNAL', fill=WHITE)
    d.text((80, 230), "Aujourd'hui", fill=MUTED)

    # Totals card
    rounded_rect(d, [80, 300, W-80, 480], 30, fill=SURFACE, outline=BORDER, width=2)
    stats = [('1 847','kcal','CALORIES',PURPLE),('127','g','PROTÉINES',GREEN),('214','g','GLUCIDES',CYAN),('48','g','LIPIDES',PINK)]
    sx = 130
    for val,unit,label,col in stats:
        d.text((sx, 350), val, fill=col, anchor='mm')
        d.text((sx, 400), unit, fill=MUTED, anchor='mm')
        d.text((sx, 440), label, fill=MUTED, anchor='mm')
        sx += 270

    # Meal entries
    meals = [
        ('MATIN', [('🥚 Omelette','P:24g G:6g L:18g','320'),('☕ Café','P:0g G:1g L:0g','5')]),
        ('DÉJEUNER', [('🍝 Pâtes Carbonara','P:28g G:82g L:34g','742'),('🥗 Salade verte','P:3g G:8g L:2g','62')]),
        ('COLLATION', [('🥤 Shake protéiné','P:30g G:12g L:3g','195')]),
    ]
    my = 540
    for group, entries in meals:
        d.text((80, my), group, fill=MUTED); my += 70
        for icon_name, macros, kcal in entries:
            rounded_rect(d, [80, my, W-80, my+130], 20, fill=SURFACE, outline=BORDER, width=1)
            d.text((140, my+40), icon_name, fill=WHITE)
            d.text((140, my+90), macros, fill=MUTED)
            d.text((W-120, my+65), kcal, fill=PURPLE, anchor='ra')
            my += 150
        my += 20

    img.save(f'{OUT}/screenshot-4.png')
    print('✓ screenshot-4.png  — Journal')

# ── SCREENSHOT 5: Profil & objectifs ─────────────────────────────────────────
def shot5():
    img = new_img(); d = ImageDraw.Draw(img)
    d.text((80, 150), 'PROFIL', fill=WHITE)

    # Premium badge
    rounded_rect(d, [80, 260, W-80, 390], 30, fill=SURFACE, outline=GREEN+(60,), width=2)
    d.text((160, 325), '✓', fill=GREEN); d.text((220, 310), 'PREMIUM ACTIF', fill=GREEN); d.text((220, 360), 'Toutes les fonctionnalités déverrouillées', fill=MUTED)

    # Profile data
    rounded_rect(d, [80, 430, W-80, 800], 30, fill=SURFACE, outline=BORDER, width=2)
    d.text((120, 460), 'MES DONNÉES', fill=CYAN)
    rows = [('Sexe','Homme'),('Âge','28 ans'),('Taille','180 cm'),('Poids actuel','78 kg'),('Poids cible','74 kg')]
    ry = 530
    for label, val in rows:
        d.text((120, ry), label, fill=MUTED); d.text((W-120, ry), val, fill=WHITE, anchor='ra'); ry += 50

    # Goals
    rounded_rect(d, [80, 840, W-80, 1180], 30, fill=SURFACE, outline=BORDER, width=2)
    d.text((120, 870), 'OBJECTIFS JOURNALIERS', fill=PURPLE)
    goals = [('Calories','2 300 kcal',PURPLE),('Protéines','173g',GREEN),('Glucides','259g',CYAN),('Lipides','64g',PINK)]
    gy = 940
    for label, val, col in goals:
        d.text((120, gy), label, fill=MUTED); d.text((W-120, gy), val, fill=col, anchor='ra'); gy += 60

    # Modifier button
    rounded_rect(d, [80, 1220, W-80, 1360], 30, fill=SURFACE, outline=CYAN+(60,), width=2)
    d.text((W//2, 1290), '✏  Modifier le profil', fill=CYAN, anchor='mm')

    img.save(f'{OUT}/screenshot-5.png')
    print('✓ screenshot-5.png  — Profil')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    shot1(); shot2(); shot3(); shot4(); shot5()
    print(f'\n5 screenshots → {OUT}/')
