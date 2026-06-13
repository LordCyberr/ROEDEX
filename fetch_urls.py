import urllib.request
import re
import os

url = "https://ruyui.com/gallery?folder=CharacterDesigns"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        
    links = re.findall(r'https://[^"]+\.png', html)
    # Filter for CharacterDesigns
    links = list(set([l for l in links if 'CharacterDesigns' in l]))
    print("Found links:")
    for link in links:
        print(link)
        filename = link.split('/')[-1]
        try:
            print(f"Downloading {filename}...")
            urllib.request.urlretrieve(link, f"C:/Users/Administrator/Desktop/ROEDEX/{filename}")
            print("Done")
        except Exception as e:
            print(f"Error downloading {link}: {e}")
except Exception as e:
    print(f"Error: {e}")
