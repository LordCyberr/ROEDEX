import urllib.request
import re
import json

url = "https://ruyui.com/gallery?folder=CharacterDesigns"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8')

# Find the next data chunk
match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
if match:
    data = json.loads(match.group(1))
    print(json.dumps(data, indent=2))
else:
    # Just print all image paths found
    links = re.findall(r'/[^"\']+\.png', html)
    print("Found png links:")
    for l in list(set(links)):
        print(l)
    links = re.findall(r'https://[^"\']+\.png', html)
    for l in list(set(links)):
        print(l)
