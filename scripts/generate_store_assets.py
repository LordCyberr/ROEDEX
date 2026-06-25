import os
from PIL import Image

def create_banner(bg_color, size, logo_path, out_path, logo_scale=0.6):
    print(f"Creating {out_path} ({size[0]}x{size[1]})...")
    
    # Create background
    banner = Image.new('RGBA', size, bg_color)
    
    # Open logo
    logo = Image.open(logo_path).convert("RGBA")
    
    # Calculate target size for logo
    target_height = int(size[1] * logo_scale)
    aspect_ratio = logo.width / logo.height
    target_width = int(target_height * aspect_ratio)
    
    # Resize logo
    logo_resized = logo.resize((target_width, target_height), Image.Resampling.LANCZOS)
    
    # Calculate position (center)
    x = (size[0] - target_width) // 2
    y = (size[1] - target_height) // 2
    
    # Paste logo onto banner
    banner.paste(logo_resized, (x, y), logo_resized)
    
    # Save
    banner.convert('RGB').save(out_path, format="PNG")

if __name__ == "__main__":
    os.makedirs('public/store_assets', exist_ok=True)
    
    logo_file = 'public/logo.png'
    bg = (5, 11, 20) # #050B14
    
    # 440x280 - Small Promo Tile
    create_banner(bg, (440, 280), logo_file, 'public/store_assets/promo_440x280.png', 0.7)
    
    # 920x680 - Large Promo Tile
    create_banner(bg, (920, 680), logo_file, 'public/store_assets/promo_920x680.png', 0.6)
    
    # 1400x560 - Marquee Promo Tile
    create_banner(bg, (1400, 560), logo_file, 'public/store_assets/promo_1400x560.png', 0.6)
    
    print("All store assets generated in public/store_assets/ directory!")
