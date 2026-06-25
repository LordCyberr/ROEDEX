from PIL import Image

img = Image.open('public/logo.png').convert('RGBA')
data = img.getdata()
new_data = []
bg = (16, 21, 25)

for r, g, b, a in data:
    dist = ((r-bg[0])**2 + (g-bg[1])**2 + (b-bg[2])**2)**0.5
    if dist < 8:
        alpha = 0
    else:
        alpha = min(255, int((dist-8)*10))
    if dist > 30:
        alpha = 255
    new_data.append((r, g, b, alpha))

img.putdata(new_data)
img.save('public/logo.png')
img.resize((128, 128)).save('public/icon128.png')
img.resize((48, 48)).save('public/icon48.png')
img.resize((16, 16)).save('public/icon16.png')
print('Images processed successfully.')
