import os
import numpy as np
from PIL import Image

def fade_edges(img_path, out_path, fade_width=40):
    print(f"Fading edges of {img_path}...")
    img = Image.open(img_path).convert("RGBA")
    data = np.array(img).astype(float)
    
    height, width, _ = data.shape
    
    # Create an alpha multiplier matrix
    alpha_mult = np.ones((height, width))
    
    # Left and Right edges
    for i in range(width):
        dist_to_edge = min(i, width - 1 - i)
        if dist_to_edge < fade_width:
            multiplier = dist_to_edge / fade_width
            # apply smoothstep or just linear
            # let's use linear
            alpha_mult[:, i] = np.minimum(alpha_mult[:, i], multiplier)
            
    # Top and Bottom edges
    for i in range(height):
        dist_to_edge = min(i, height - 1 - i)
        if dist_to_edge < fade_width:
            multiplier = dist_to_edge / fade_width
            alpha_mult[i, :] = np.minimum(alpha_mult[i, :], multiplier)
            
    # Apply multiplier to alpha channel
    data[:, :, 3] = data[:, :, 3] * alpha_mult
    
    img_faded = Image.fromarray(data.astype(np.uint8))
    img_faded.save(out_path)
    print(f"Saved to {out_path}")

if __name__ == "__main__":
    fade_edges('public/logo.png', 'public/logo.png', fade_width=20)
