"""
Generate icon.png, adaptive-icon.png, and splash.png for Autoshine Studio.
Run: python gen_assets.py
"""
import math
from PIL import Image, ImageDraw, ImageFilter

# ── colours ──────────────────────────────────────────────────────────────────
BG       = (10, 10, 10)          # #0A0A0A
BLUE     = (0, 212, 255)         # #00D4FF
BLUE_DIM = (0, 150, 180)
GOLD     = (201, 168, 76)        # #C9A84C
WHITE    = (255, 255, 255)
TRANS    = (0, 0, 0, 0)

# ─────────────────────────────────────────────────────────────────────────────
# Helper: draw a rounded rectangle (Pillow < 8.2 compatibility)
# ─────────────────────────────────────────────────────────────────────────────
def rrect(draw, xy, radius, fill):
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.ellipse([x0, y0, x0 + 2*radius, y0 + 2*radius], fill=fill)
    draw.ellipse([x1 - 2*radius, y0, x1, y0 + 2*radius], fill=fill)
    draw.ellipse([x0, y1 - 2*radius, x0 + 2*radius, y1], fill=fill)
    draw.ellipse([x1 - 2*radius, y1 - 2*radius, x1, y1], fill=fill)


# ─────────────────────────────────────────────────────────────────────────────
# Draw the "A" monogram mark on a canvas of given size.
# cx, cy = centre; r = outer ring radius
# ─────────────────────────────────────────────────────────────────────────────
def draw_mark(draw, cx, cy, r, bg_alpha=255):
    # outer glow ring
    glow_r = int(r * 1.08)
    for offset in range(8, 0, -1):
        a = int(18 * offset)
        draw.ellipse(
            [cx - glow_r - offset, cy - glow_r - offset,
             cx + glow_r + offset, cy + glow_r + offset],
            outline=(*BLUE, a),
            width=2,
        )

    # dark circle background
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*BG, bg_alpha))

    # thin gold ring
    ring_w = max(2, r // 40)
    draw.ellipse([cx - r, cy - r, cx + r, cy + r],
                 outline=(*GOLD, 200), width=ring_w)

    # ── "A" shape made from thick lines ──────────────────────────────────────
    lw   = max(3, r // 12)         # line width
    top  = cy - r * 0.52
    bot  = cy + r * 0.52
    mid  = cy + r * 0.06           # crossbar height

    # left leg
    lx0 = cx - r * 0.38
    draw.line([(cx, top), (lx0, bot)], fill=BLUE, width=lw)
    # right leg
    rx0 = cx + r * 0.38
    draw.line([(cx, top), (rx0, bot)], fill=BLUE, width=lw)
    # crossbar
    cl = cx - r * 0.20
    cr = cx + r * 0.20
    draw.line([(cl, mid), (cr, mid)], fill=GOLD, width=lw)

    # small blue dot at apex
    dot = max(4, r // 14)
    draw.ellipse([cx - dot, top - dot, cx + dot, top + dot], fill=BLUE)

    # "S" letter (small) below crossbar
    s_size = max(4, r // 6)
    s_cx   = cx
    s_cy   = cy + r * 0.30
    # top arc
    draw.arc([s_cx - s_size, s_cy - s_size, s_cx + s_size, s_cy],
             start=0, end=180, fill=GOLD, width=max(2, lw - 1))
    # bottom arc (reversed)
    draw.arc([s_cx - s_size, s_cy, s_cx + s_size, s_cy + s_size],
             start=180, end=360, fill=GOLD, width=max(2, lw - 1))


# ═══════════════════════════════════════════════════════════════════════════
# 1. icon.png  (1024 × 1024, opaque)
# ═══════════════════════════════════════════════════════════════════════════
SIZE = 1024
img  = Image.new("RGBA", (SIZE, SIZE), (*BG, 255))
d    = ImageDraw.Draw(img, "RGBA")

cx, cy = SIZE // 2, SIZE // 2
r = int(SIZE * 0.38)

draw_mark(d, cx, cy, r)

# Slight vignette
vign = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
vd   = ImageDraw.Draw(vign, "RGBA")
for i in range(80):
    a = int(90 * i / 80)
    vd.ellipse([i, i, SIZE - i, SIZE - i], outline=(0, 0, 0, a), width=1)
img = Image.alpha_composite(img, vign)

icon = img.convert("RGB")
icon.save("assets/icon.png", "PNG")
print("icon.png done")


# ═══════════════════════════════════════════════════════════════════════════
# 2. adaptive-icon.png  (1024 × 1024, RGBA transparent bg)
#    Android crops to circle/squircle; safe zone = centre 66%
# ═══════════════════════════════════════════════════════════════════════════
ai = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
d2 = ImageDraw.Draw(ai, "RGBA")

# Soft dark squircle as background
sq_r = int(SIZE * 0.42)
d2.ellipse([cx - sq_r, cy - sq_r, cx + sq_r, cy + sq_r], fill=(*BG, 255))

draw_mark(d2, cx, cy, r)
ai.save("assets/adaptive-icon.png", "PNG")
print("adaptive-icon.png done")


# ═══════════════════════════════════════════════════════════════════════════
# 3. splash.png  (2048 × 2048)
# ═══════════════════════════════════════════════════════════════════════════
SW = SH = 2048
splash = Image.new("RGB", (SW, SH), BG)
sd     = ImageDraw.Draw(splash, "RGBA")

scx, scy = SW // 2, SH // 2
sr = int(SW * 0.22)   # logo radius

draw_mark(sd, scx, scy - int(SH * 0.07), sr, bg_alpha=255)

# "AUTOSHINE" text — drawn as individual thin rectangle strokes (no font needed)
# Use a compact pixel-art approach: just render a label with a fallback font
try:
    from PIL import ImageFont
    fnt_big  = ImageFont.truetype("arial.ttf", size=90)
    fnt_sub  = ImageFont.truetype("arial.ttf", size=38)
except Exception:
    fnt_big  = ImageFont.load_default()
    fnt_sub  = fnt_big

ty = scy + int(SH * 0.16)

# brand name
txt1 = "AUTOSHINE"
bb1  = sd.textbbox((0, 0), txt1, font=fnt_big)
tw1  = bb1[2] - bb1[0]
sd.text((scx - tw1 // 2, ty), txt1, fill=WHITE, font=fnt_big)

# tagline
txt2 = "STUDIO"
bb2  = sd.textbbox((0, 0), txt2, font=fnt_sub)
tw2  = bb2[2] - bb2[0]
sd.text((scx - tw2 // 2, ty + 100), txt2, fill=GOLD, font=fnt_sub)

# gold underline
sd.rectangle([scx - 80, ty + 150, scx + 80, ty + 154], fill=GOLD)

splash.save("assets/splash.png", "PNG")
print("splash.png done")

print("\nAll assets generated successfully.")
