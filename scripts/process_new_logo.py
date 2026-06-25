import os
import shutil
import numpy as np
from PIL import Image, ImageDraw

def create_circular_mask(h, w, center=None, radius=None):
    if center is None: # use the middle of the image
        center = (int(w/2), int(h/2))
    if radius is None: # use the smallest distance between the center and image walls
        radius = min(center[0], center[1], w-center[0], h-center[1])

    Y, X = np.ogrid[:h, :w]
    dist_from_center = np.sqrt((X - center[0])**2 + (Y-center[1])**2)

    # We want mask to be 1 in center, 0 at edges
    # Fade out between radius*0.5 and radius
    inner_radius = radius * 0.6
    mask = 1.0 - np.clip((dist_from_center - inner_radius) / (radius - inner_radius), 0, 1)
    return mask

def process_new_logo(src_path):
    print("Processing new AI logo...")
    img = Image.open(src_path).convert("RGBA")
    
    # 1. Blend background into exact #050B14 using radial mask
    data = np.array(img).astype(float)
    h, w, _ = data.shape
    
    mask = create_circular_mask(h, w)
    
    # target bg color
    bg_r, bg_g, bg_b = 5, 11, 20
    
    # blend
    for i in range(3):
        data[:, :, i] = data[:, :, i] * mask + [bg_r, bg_g, bg_b][i] * (1.0 - mask)
        
    data[:, :, 3] = 255 # fully opaque
    
    final_img = Image.fromarray(data.astype(np.uint8))
    
    # save as public/logo.png
    final_img.save('public/logo.png')
    
    # create icons
    print("Generating extension icons...")
    final_img.resize((128, 128), Image.Resampling.LANCZOS).save('public/icon128.png')
    final_img.resize((48, 48), Image.Resampling.LANCZOS).save('public/icon48.png')
    final_img.resize((16, 16), Image.Resampling.LANCZOS).save('public/icon16.png')
    
    return final_img

def create_banner(logo_img, bg_color, size, out_path, logo_scale=0.6):
    print(f"Creating {out_path} ({size[0]}x{size[1]})...")
    banner = Image.new('RGB', size, bg_color)
    
    target_height = int(size[1] * logo_scale)
    aspect_ratio = logo_img.width / logo_img.height
    target_width = int(target_height * aspect_ratio)
    
    logo_resized = logo_img.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    x = (size[0] - target_width) // 2
    y = (size[1] - target_height) // 2
    
    banner.paste(logo_resized, (x, y))
    banner.save(out_path, format="PNG")

if __name__ == "__main__":
    src_img = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\21808151-3582-431a-8e40-829903862da0\roedex_new_logo_1782234587775.png"
    
    os.makedirs('public/store_assets', exist_ok=True)
    
    logo = process_new_logo(src_img)
    bg = (5, 11, 20)
    
    create_banner(logo, bg, (440, 280), 'public/store_assets/promo_440x280.png', 0.8)
    create_banner(logo, bg, (920, 680), 'public/store_assets/promo_920x680.png', 0.7)
    create_banner(logo, bg, (1400, 560), 'public/store_assets/promo_1400x560.png', 0.7)
    
    print("All assets successfully generated!")
