import os
from PIL import Image

def apply_matrix_filter(input_path, output_path, target_color, pixel_size=8):
    """
    Downscales and upscales an image to pixelate it, then colorizes it 
    to a monochromatic neon color while preserving alpha.
    """
    if not os.path.exists(input_path):
        print(f"File {input_path} not found.")
        return

    # Open image and ensure it's RGBA
    img = Image.open(input_path).convert("RGBA")
    width, height = img.size

    # Extract alpha channel
    alpha = img.split()[3]

    # Convert RGB to grayscale
    grayscale = img.convert("L")

    # Downscale
    small_width = width // pixel_size
    small_height = height // pixel_size
    small_img = grayscale.resize((small_width, small_height), resample=Image.Resampling.BILINEAR)

    # Upscale back to original size with NEAREST to create sharp pixels
    pixelated = small_img.resize((width, height), resample=Image.Resampling.NEAREST)

    # Colorize
    # Create new image
    neon_img = Image.new("RGBA", (width, height))
    
    pixelated_data = pixelated.getdata()
    alpha_data = alpha.getdata()
    
    new_data = []
    
    tr, tg, tb = target_color
    
    for y in range(height):
        # Scanline effect: darken every Nth row
        is_scanline = (y // (pixel_size // 2)) % 2 == 0
        scanline_multiplier = 0.7 if is_scanline else 1.0
        
        for x in range(width):
            idx = y * width + x
            lum = pixelated_data[idx] / 255.0
            a = alpha_data[idx]
            
            if a > 0:
                # Multiply luminance by target color and scanline multiplier
                r = int(lum * tr * scanline_multiplier)
                g = int(lum * tg * scanline_multiplier)
                b = int(lum * tb * scanline_multiplier)
                
                # Boost brightness slightly to compensate for darkening
                r = min(255, int(r * 1.5))
                g = min(255, int(g * 1.5))
                b = min(255, int(b * 1.5))
                
                new_data.append((r, g, b, a))
            else:
                new_data.append((0, 0, 0, 0))
                
    neon_img.putdata(new_data)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    neon_img.save(output_path, "PNG")
    print(f"Saved {output_path}")

if __name__ == "__main__":
    assets_dir = r"C:\Users\Administrator\Desktop\ROEDEX\public\assets\companions"
    
    companions = {
        "bob": (255, 102, 0),    # Neon Orange
        "kaya": (255, 0, 102),   # Neon Pink/Red
        "lia": (0, 191, 255),    # Sky Blue
        "crash": (0, 255, 0),    # Neon Green
    }
    
    for name, color in companions.items():
        input_file = os.path.join(assets_dir, f"{name}_realistic.png")
        output_file = os.path.join(assets_dir, f"{name}_matrix.png")
        
        # Using a slightly larger pixel size for that retro look
        apply_matrix_filter(input_file, output_file, color, pixel_size=6)
        
    print("Done generating matrix avatars.")
