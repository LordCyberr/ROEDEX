import re

files_to_clean = [
    'src/components/layout/Header.tsx',
    'src/components/overlay/FocusHighlight.tsx',
    'src/components/overlay/NPCTranslationBubble.tsx',
    'src/components/overlay/CompanionGuideOverlay.tsx'
]

for file in files_to_clean:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove duplicate useSettingsStore imports
    content = content.replace("import { useSettingsStore } from '../../store/settingsStore';\nimport { useSettingsStore } from '../../store/settingsStore';", "import { useSettingsStore } from '../../store/settingsStore';")
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Duplicates removed.")
