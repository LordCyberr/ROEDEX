import os
import requests
import urllib.parse
from PIL import Image

def is_empty(img, threshold=5):
    img = img.convert("RGBA")
    colors = img.getcolors(maxcolors=2048)
    if colors:
        max_count = max([c[0] for c in colors])
        if max_count > (img.width * img.height * 0.95):
            return True
    return False

def crop_sheet(filename, prefix, cols, rows):
    if not os.path.exists(filename):
        print(f"File {filename} not found.")
        return

    img = Image.open(filename)
    width, height = img.size
    
    cell_w = width // cols
    cell_h = height // rows
    
    out_dir = "public/assets/companions"
    os.makedirs(out_dir, exist_ok=True)
    
    count = 1
    for r in range(rows):
        for c in range(cols):
            left = c * cell_w
            top = r * cell_h
            right = left + cell_w
            bottom = top + cell_h
            
            cell = img.crop((left, top, right, bottom))
            
            if not is_empty(cell):
                out_path = os.path.join(out_dir, f"{prefix}_exp_{count}.png")
                cell.save(out_path)
                print(f"Saved {out_path}")
                count += 1

def download_file(key, save_path):
    if os.path.exists(save_path):
        print(f"{save_path} already exists, skipping download.")
        return
    url = f"https://websitegallery.s3.eu-north-1.amazonaws.com/{urllib.parse.quote(key)}"
    print(f"Downloading {url}...")
    r = requests.get(url)
    if r.status_code == 200:
        with open(save_path, 'wb') as f:
            f.write(r.content)
        print(f"Saved to {save_path}")
    else:
        print(f"Failed to download {key}, status {r.status_code}")

download_file('CharacterDesigns/Crash_FaceExpressions_Shadow.png', 'Crash.png')
download_file('CharacterDesigns/Elf_expressions_Clrs.jpg', 'Elf.jpg')
download_file('CharacterDesigns/Demon_expressionstransp2.png', 'Demon.png')

# The sheets appear to be roughly 4 cols, 3 rows based on screenshots
crop_sheet("Crash.png", "crash", 4, 3)
crop_sheet("Elf.jpg", "lia", 4, 3)
crop_sheet("Demon.png", "kaya", 4, 3)
