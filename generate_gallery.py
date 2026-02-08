import os
import shutil
from PIL import Image
import json

# složky
input_dir = "images_original"  # originální fotky
output_dir = "images"          # zmenšené fotky pro web
output_file = "gallery_list.js"
max_width = 1000               # šířka zmenšeného obrázku

# 1️⃣ vymažeme staré zmenšené obrázky
if os.path.exists(output_dir):
    shutil.rmtree(output_dir)
os.makedirs(output_dir, exist_ok=True)

# 2️⃣ projdeme všechny soubory v originálních fotkách (včetně podsložek)
gallery = {}
for root, _, files in os.walk(input_dir):
    folder_name = os.path.relpath(root, input_dir)
    images_list = []
    for f in files:
        if f.lower().endswith((".jpg", ".jpeg", ".png")):
            # otevření obrázku
            img = Image.open(os.path.join(root, f))
            # zachování poměru stran
            w_percent = max_width / float(img.width)
            h_size = int(img.height * w_percent)
            img = img.resize((max_width, h_size), Image.LANCZOS)
            # uložení do složky images/
            out_path = os.path.join(output_dir, f)
            img.save(out_path)
            images_list.append(f"{output_dir}/{f}")
    if images_list:
        gallery[folder_name] = images_list

# 3️⃣ vytvoření gallery_list.js
with open(output_file, "w", encoding="utf-8") as f:
    f.write("const images = " + json.dumps(gallery, indent=2) + ";")

total_images = sum(len(v) for v in gallery.values())
print(f"OK: Vygenerovano {total_images} obrazku do '{output_dir}' a vytvoren '{output_file}'")
