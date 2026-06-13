import os
from PIL import Image

def remove_green_background(input_path, output_path, tolerance=80):
    if not os.path.exists(input_path):
        print(f"File {input_path} not found.")
        return

    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()

    new_data = []
    # Base green: 0, 255, 0
    for item in data:
        # item is (R, G, B, A)
        r, g, b, a = item
        # If green is dominant, make it transparent
        if g > r + tolerance and g > b + tolerance:
            # Maybe soften the edges using alpha based on how 'green' it is
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Save to output path
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, "PNG")
    print(f"Processed {input_path} -> {output_path}")

base_dir = r"C:\Users\Administrator\.gemini\antigravity-ide\brain\f52bd828-fe83-4d50-aa46-a124514aec25"
out_dir = r"C:\Users\Administrator\Desktop\ROEDEX\public\assets\companions"

images = {
    "bob": "bob_3d_1781279699769.png",
    "kaya": "kaya_3d_1781279714009.png",
    "lia": "lia_3d_1781279725846.png",
    "crash": "crash_3d_1781279736824.png"
}

for char, filename in images.items():
    in_path = os.path.join(base_dir, filename)
    out_path = os.path.join(out_dir, f"{char}_realistic.png")
    remove_green_background(in_path, out_path)
