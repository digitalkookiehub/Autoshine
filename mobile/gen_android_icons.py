"""
Copies generated assets into Android mipmap directories at correct densities.
Run from: D:\Saas_builder\Authoshine Studio\mobile
"""
import os
from PIL import Image

RES = r"android\app\src\main\res"

DENSITIES = {
    "mipmap-mdpi":     48,
    "mipmap-hdpi":     72,
    "mipmap-xhdpi":    96,
    "mipmap-xxhdpi":  144,
    "mipmap-xxxhdpi": 192,
}

# Load source images
icon      = Image.open("assets/icon.png").convert("RGBA")
adaptive  = Image.open("assets/adaptive-icon.png").convert("RGBA")

for folder, size in DENSITIES.items():
    path = os.path.join(RES, folder)
    os.makedirs(path, exist_ok=True)

    # ic_launcher.webp  — full icon with background
    launcher = icon.resize((size, size), Image.LANCZOS).convert("RGB")
    launcher.save(os.path.join(path, "ic_launcher.webp"), "WEBP", quality=95)

    # ic_launcher_round.webp  — same image (already circular)
    launcher.save(os.path.join(path, "ic_launcher_round.webp"), "WEBP", quality=95)

    # ic_launcher_foreground.webp  — foreground layer (RGBA, larger canvas for adaptive)
    fg_size = int(size * 1.5)   # adaptive foreground = 1.5x to account for safe zone
    fg = adaptive.resize((fg_size, fg_size), Image.LANCZOS)
    # centre on a fg_size canvas
    canvas = Image.new("RGBA", (fg_size, fg_size), (0, 0, 0, 0))
    canvas.paste(fg, (0, 0))
    canvas.save(os.path.join(path, "ic_launcher_foreground.webp"), "WEBP", quality=95)

    print(f"{folder} ({size}px) done")

print("\nAll Android mipmap icons updated.")
