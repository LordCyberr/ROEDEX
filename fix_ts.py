import re

files_to_fix = [
    'src/components/overlay/OverlayContainer.tsx',
    'src/components/overlay/CompanionGuideOverlay.tsx',
    'src/components/overlay/FocusHighlight.tsx',
    'src/components/overlay/MinimizedOrb.tsx',
    'src/components/overlay/NPCTranslationBubble.tsx',
    'src/components/views/settings/AdvancedSettings.tsx',
    'src/components/widgets/DebugPanel.tsx'
]

def apply_fixes():
    # 1. OverlayContainer.tsx
    with open('src/components/overlay/OverlayContainer.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useSettingsStore }' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../store/trackerStore';",
            "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
        )
    content = content.replace("import { BobOverlay } from '../widgets/BobOverlay';", "import { CompanionOverlay } from '../widgets/CompanionOverlay';")
    content = content.replace("useTrackerStore.getState().popOutTab", "useSettingsStore.getState().popOutTab")
    content = content.replace("useTrackerStore.getState().setTabDimensions", "useSettingsStore.getState().setTabDimensions")
    content = content.replace("useTrackerStore.getState().setOverlayPosition", "useSettingsStore.getState().setOverlayPosition")
    
    with open('src/components/overlay/OverlayContainer.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    # 2. CompanionGuideOverlay.tsx
    with open('src/components/overlay/CompanionGuideOverlay.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useSettingsStore }' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../store/trackerStore';",
            "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
        )
    
    content = content.replace("useTrackerStore(useShallow(state => ({", "useSettingsStore(useShallow((state: any) => ({")
    content = content.replace("useTrackerStore(useShallow((state) => ({", "useSettingsStore(useShallow((state: any) => ({")
    content = content.replace("useTrackerStore.getState()", "useSettingsStore.getState()")
    
    with open('src/components/overlay/CompanionGuideOverlay.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    # 3. FocusHighlight.tsx
    with open('src/components/overlay/FocusHighlight.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useSettingsStore }' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../store/trackerStore';",
            "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
        )
    
    content = content.replace("useTrackerStore(useShallow(state => ({", "useSettingsStore(useShallow((state: any) => ({")
    
    with open('src/components/overlay/FocusHighlight.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    # 4. MinimizedOrb.tsx
    with open('src/components/overlay/MinimizedOrb.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useSettingsStore }' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../store/trackerStore';",
            "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
        )
    
    content = content.replace("useTrackerStore(useShallow((state) => ({", "useSettingsStore(useShallow((state: any) => ({")
    content = content.replace("useTrackerStore.getState()", "useSettingsStore.getState()")
    
    with open('src/components/overlay/MinimizedOrb.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    # 5. NPCTranslationBubble.tsx
    with open('src/components/overlay/NPCTranslationBubble.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useSettingsStore }' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../store/trackerStore';",
            "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
        )
    
    content = content.replace("useTrackerStore(useShallow((state) => ({", "useTrackerStore(useShallow((state: any) => ({})));\n  const { currentNpcDialogue, language } = useSettingsStore(useShallow((state: any) => ({")
    
    with open('src/components/overlay/NPCTranslationBubble.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    # 6. AdvancedSettings.tsx
    with open('src/components/views/settings/AdvancedSettings.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { useSettingsStore }' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../../store/trackerStore';",
            "import { useTrackerStore } from '../../../store/trackerStore';\nimport { useSettingsStore } from '../../../store/settingsStore';"
        )
        
    content = content.replace("useTrackerStore.getState().addNotification", "useSettingsStore.getState().addNotification")
    
    with open('src/components/views/settings/AdvancedSettings.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

    # 7. DebugPanel.tsx
    with open('src/components/widgets/DebugPanel.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace("useTrackerStore.getState().setCurrentNpcDialogue", "useSettingsStore.getState().setCurrentNpcDialogue")
    
    with open('src/components/widgets/DebugPanel.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

apply_fixes()
print('Fixed more TS errors')
