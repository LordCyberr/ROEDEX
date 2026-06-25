import re

with open("src/components/views/TrackingView.tsx", "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    'const category = t(`categories.${categoryKey}`) || getCategoryName(typeRaw, isResource);',
    'const categoryDisplayName = t(`categories.${categoryKey}`) || getCategoryName(typeRaw, isResource);'
)

with open("src/components/views/TrackingView.tsx", "w", encoding="utf-8") as f:
    f.write(c)

print("Done")
