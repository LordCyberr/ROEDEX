import re

with open('src/components/overlay/PoppedOutWindowComponent.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add useSettingsStore import if not exists
if 'useSettingsStore' not in content:
    content = content.replace(
        "import { useTrackerStore, PoppedOutWindow } from '../../store/trackerStore';",
        "import { useTrackerStore, PoppedOutWindow } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
    )

target = """  const {
    updatePoppedOutWindow, mergeTab,
    activeOpacity, idleOpacity, isUILocked,
    layoutMode, globalScale, tutorialStep
  } = useTrackerStore(useShallow((state) => ({
    updatePoppedOutWindow: state.updatePoppedOutWindow,
    mergeTab: state.mergeTab,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    layoutMode: state.layoutMode,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings.tutorialStep,
  })));"""

replace = """  const {
    updatePoppedOutWindow, mergeTab,
    activeOpacity, idleOpacity, isUILocked,
    layoutMode, globalScale, tutorialStep
  } = useSettingsStore(useShallow((state: any) => ({
    updatePoppedOutWindow: state.updatePoppedOutWindow,
    mergeTab: state.mergeTab,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    layoutMode: state.layoutMode,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
  })));"""

if target in content:
    content = content.replace(target, replace)
    with open('src/components/overlay/PoppedOutWindowComponent.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed PoppedOutWindowComponent.tsx')
else:
    print('Target not found in PoppedOutWindowComponent.tsx')
