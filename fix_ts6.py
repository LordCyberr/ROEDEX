import re
import os

def replace_all(file_path, replacements):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            modified = True
        else:
            # Fallback regex if whitespace differs
            pattern = re.escape(old).replace(r'\ ', r'\s+')
            new_content = re.sub(pattern, new, content)
            if new_content != content:
                content = new_content
                modified = True
                
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

replace_all('src/App.tsx', [
    (
        "    overlayPosition, setOverlayPosition, orbPosition, setOrbPosition,\n    poppedOutWindows, updatePoppedOutWindow,\n    isUILocked, setIsUILocked, resetSizeHotkey, lockUiHotkey",
        ""
    ),
    (
        "    isMinimized: state.isMinimized,",
        "    isMinimized: state.isMinimized,"
    )
])

# App.tsx is importing useTrackerStore. Let's make it import useSettingsStore and pull UI settings from there
with open('src/App.tsx', 'r', encoding='utf-8') as f:
    app_content = f.read()
    
if 'useSettingsStore' not in app_content:
    app_content = app_content.replace(
        "import { useTrackerStore } from './store/trackerStore';",
        "import { useTrackerStore } from './store/trackerStore';\nimport { useSettingsStore } from './store/settingsStore';"
    )
    
app_content = app_content.replace(
    """  const {
    isMinimized, setIsMinimized,
    overlayPosition, setOverlayPosition, orbPosition, setOrbPosition,
    poppedOutWindows, updatePoppedOutWindow,
    isUILocked, setIsUILocked, resetSizeHotkey, lockUiHotkey
  } = useTrackerStore(useShallow((state) => ({
    isMinimized: state.isMinimized,
    setIsMinimized: state.setIsMinimized,
    overlayPosition: state.overlayPosition,
    setOverlayPosition: state.setOverlayPosition,
    orbPosition: state.orbPosition,
    setOrbPosition: state.setOrbPosition,
    poppedOutWindows: state.poppedOutWindows,
    updatePoppedOutWindow: state.updatePoppedOutWindow,
    isUILocked: state.isUILocked,
    setIsUILocked: state.setIsUILocked,
    resetSizeHotkey: state.advancedSettings?.resetSizeHotkey || 'Ctrl+Alt+R',
    lockUiHotkey: state.advancedSettings?.lockUiHotkey || 'Ctrl+Alt+L'
  })));""",
    """  const {
    isMinimized, setIsMinimized,
    overlayPosition, setOverlayPosition, orbPosition, setOrbPosition,
    poppedOutWindows, updatePoppedOutWindow,
    isUILocked, setIsUILocked, resetSizeHotkey, lockUiHotkey
  } = useSettingsStore(useShallow((state: any) => ({
    isMinimized: state.isMinimized,
    setIsMinimized: state.setIsMinimized,
    overlayPosition: state.overlayPosition,
    setOverlayPosition: state.setOverlayPosition,
    orbPosition: state.orbPosition,
    setOrbPosition: state.setOrbPosition,
    poppedOutWindows: state.poppedOutWindows,
    updatePoppedOutWindow: state.updatePoppedOutWindow,
    isUILocked: state.isUILocked,
    setIsUILocked: state.setIsUILocked,
    resetSizeHotkey: state.advancedSettings?.resetSizeHotkey || 'Ctrl+Alt+R',
    lockUiHotkey: state.advancedSettings?.lockUiHotkey || 'Ctrl+Alt+L'
  })));"""
)

with open('src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(app_content)


replace_all('src/components/layout/Header.tsx', [
    (
        "import { useTrackerStore } from '../../store/trackerStore';",
        "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
    ),
    (
        "} = useTrackerStore(useShallow((state) => ({",
        "} = useSettingsStore(useShallow((state: any) => ({"
    ),
    (
        "} = useTrackerStore(useShallow((state: any) => ({",
        "} = useSettingsStore(useShallow((state: any) => ({"
    ),
    (
        "addBobMessage: state.addBobMessage,",
        ""
    )
])

# For Header we need to extract addBobMessage
with open('src/components/layout/Header.tsx', 'r', encoding='utf-8') as f:
    h_content = f.read()

h_content = h_content.replace(
    """  const {
    isMinimized, setIsMinimized,
    isUILocked, setIsUILocked,
    layoutMode, setLayoutMode,
    activeTab, setActiveTab,
    popOutTab, poppedOutWindows,
    mergeAllTabs,
    tabDimensions, setTabDimensions,
    tutorialStep,
    tutorialCompleted,
    seenTabs,
    updateNotificationSettings,
    addBobMessage,
  } = useSettingsStore(useShallow((state: any) => ({""",
    """  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));\n  const {
    isMinimized, setIsMinimized,
    isUILocked, setIsUILocked,
    layoutMode, setLayoutMode,
    activeTab, setActiveTab,
    popOutTab, poppedOutWindows,
    mergeAllTabs,
    tabDimensions, setTabDimensions,
    tutorialStep,
    tutorialCompleted,
    seenTabs,
    updateNotificationSettings,
  } = useSettingsStore(useShallow((state: any) => ({"""
)

with open('src/components/layout/Header.tsx', 'w', encoding='utf-8') as f:
    f.write(h_content)


replace_all('src/components/layout/SidebarNav.tsx', [
    (
        "  const { activeTab, setActiveTab, layoutMode, setLayoutMode } = useTrackerStore(useShallow((state) => ({",
        "  const { activeTab, setActiveTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab, setActiveTab: state.setActiveTab })));\n  const { layoutMode, setLayoutMode } = useSettingsStore(useShallow((state: any) => ({"
    ),
    (
        "    activeTab: state.activeTab,\n    setActiveTab: state.setActiveTab,\n",
        ""
    )
])


replace_all('src/components/overlay/CompanionGuideOverlay.tsx', [
    (
        "import { useTrackerStore } from '../../store/trackerStore';",
        "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
    ),
    (
        "  const { notificationSettings, setTutorialStep, setBobMood, companionPosition } = useTrackerStore(useShallow((state) => ({",
        "  const { companionPosition } = useTrackerStore(useShallow((state: any) => ({ companionPosition: state.companionPosition })));\n  const { notificationSettings, setTutorialStep, setBobMood } = useSettingsStore(useShallow((state: any) => ({"
    ),
    (
        "    companionPosition: state.companionPosition,\n",
        ""
    ),
    (
        "  const { sessionMobsKilled } = useTrackerStore(useShallow(state => ({",
        "  const { sessionMobsKilled } = useTrackerStore(useShallow((state: any) => ({"
    ),
    ("sessionMobsKilled: state.sessionMobsKilled", "sessionMobsKilled: state.sessionKillCount"),
    ("playerName: state.sessionPlayerName", "playerName: state.playerName"),
    ("playerProfile: state.playerProfile", "playerProfile: state.playerName"),
    (
        "  const { playerName, playerProfile } = useTrackerStore(useShallow(state => ({",
        "  const { playerName, playerProfile } = useTrackerStore(useShallow((state: any) => ({"
    )
])


replace_all('src/components/overlay/FocusHighlight.tsx', [
    (
        "import { useTrackerStore } from '../../store/trackerStore';",
        "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
    ),
    (
        "} = useTrackerStore(useShallow((state) => ({",
        "} = useSettingsStore(useShallow((state: any) => ({"
    )
])

replace_all('src/components/overlay/NPCTranslationBubble.tsx', [
    (
        "import { useTrackerStore } from '../../store/trackerStore';",
        "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
    ),
    (
        "} = useTrackerStore(useShallow((state) => ({",
        "} = useSettingsStore(useShallow((state: any) => ({"
    )
])

replace_all('src/components/views/TrackingView.tsx', [
    (
        "  const { activeTab, favorites } = useTrackerStore(useShallow((state) => ({",
        "  const { activeTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab })));\n  const { favorites } = useSettingsStore(useShallow((state: any) => ({"
    ),
    (
        "    activeTab: state.activeTab,\n",
        ""
    )
])


replace_all('src/components/overlay/OverlayContainer.tsx', [
    ("<BobOverlay key={`popped-${win.id}`} />", "<CompanionOverlay key={`popped-${win.id}`} constraintsRef={containerRef} />")
])

print("Done fixing TS 6")
