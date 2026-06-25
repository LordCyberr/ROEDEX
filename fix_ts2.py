import re
import os

def fix_file(path, replacements):
    if not os.path.exists(path): return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Add useSettingsStore import if useTrackerStore is imported but useSettingsStore is not
    if 'useTrackerStore' in content and 'useSettingsStore' not in content:
        content = content.replace(
            "import { useTrackerStore } from '../../store/trackerStore';",
            "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
        ).replace(
            "import { useTrackerStore } from '../../../store/trackerStore';",
            "import { useTrackerStore } from '../../../store/trackerStore';\nimport { useSettingsStore } from '../../../store/settingsStore';"
        )
        modified = True
        
    for target, replace in replacements:
        if target in content:
            content = content.replace(target, replace)
            modified = True
            
    # Also blindly replace useTrackerStore.getState() calls that should be settingsStore
    settings_state_props = ['notificationSettings', 'layoutMode', 'tabDimensions', 'setTabDimensions', 'updateNotificationSettings', 'setTutorialStep', 'setActiveCompanion', 'setTheme', 'minimalChestHud', 'minimalChestTutorialSeen', 'setMinimalChestTutorialSeen', 'currentNpcDialogue', 'language']
    
    for prop in settings_state_props:
        if f'useTrackerStore.getState().{prop}' in content:
            content = content.replace(f'useTrackerStore.getState().{prop}', f'useSettingsStore.getState().{prop}')
            modified = True
            
    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")

# Fix Header.tsx
fix_file('src/components/layout/Header.tsx', [
    (
        """  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings, addBobMessage } = useTrackerStore(useShallow((state) => ({""",
        """  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings } = useSettingsStore(useShallow((state: any) => ({"""
    )
])

# Fix SidebarNav.tsx
fix_file('src/components/layout/SidebarNav.tsx', [
    (
        """  const { activeTab, setActiveTab, layoutMode, setLayoutMode } = useTrackerStore(useShallow((state) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
  })));""",
        """  const { activeTab, setActiveTab } = useTrackerStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  })));
  const { layoutMode, setLayoutMode } = useSettingsStore(useShallow((state: any) => ({
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
  })));"""
    )
])

# Fix CompanionGuideOverlay.tsx
fix_file('src/components/overlay/CompanionGuideOverlay.tsx', [
    (
        """  const { notificationSettings, setTutorialStep, setBobMood, companionPosition } = useTrackerStore(useShallow((state) => ({
    notificationSettings: state.notificationSettings,
    setTutorialStep: state.notificationSettings.setTutorialStep,
    setBobMood: state.notificationSettings.setBobMood,
    companionPosition: state.companionPosition,
  })));""",
        """  const { companionPosition } = useTrackerStore(useShallow((state: any) => ({ companionPosition: state.companionPosition })));
  const { notificationSettings, setTutorialStep, setBobMood } = useSettingsStore(useShallow((state: any) => ({
    notificationSettings: state.notificationSettings,
    setTutorialStep: state.setTutorialStep,
    setBobMood: state.setBobMood,
  })));"""
    ),
    ("useTrackerStore.getState().notificationSettings", "useSettingsStore.getState().notificationSettings"),
    ("useTrackerStore.getState().setTutorialStep", "useSettingsStore.getState().setTutorialStep"),
    ("useTrackerStore.getState().updateNotificationSettings", "useSettingsStore.getState().updateNotificationSettings"),
    ("useTrackerStore.getState().setActiveCompanion", "useSettingsStore.getState().setActiveCompanion"),
    ("useTrackerStore.getState().setTheme", "useSettingsStore.getState().setTheme"),
    ("state.playerProfile", "state.playerName"),
    ("state.sessionPlayerName", "state.playerName"),
    ("state.sessionMobsKilled", "state.sessionKillCount")
])

# Fix FocusHighlight.tsx
fix_file('src/components/overlay/FocusHighlight.tsx', [
    (
        """  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useTrackerStore(useShallow((state) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));""",
        """  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useSettingsStore(useShallow((state: any) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));"""
    ),
    (
        """  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useTrackerStore(useShallow((state: any) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));""",
        """  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useSettingsStore(useShallow((state: any) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));"""
    )
])

# Fix MinimizedOrb.tsx
fix_file('src/components/overlay/MinimizedOrb.tsx', [
    (
        """  const { 
    notifications, setIsMinimized, orbSize, orbBorderThickness, 
    orbPosition, setOrbPosition, minimizedIcon, minimizedIconUrl, isUILocked
  } = useTrackerStore(useShallow((state) => ({""",
        """  const { 
    notifications, setIsMinimized, orbSize, orbBorderThickness, 
    orbPosition, setOrbPosition, minimizedIcon, minimizedIconUrl, isUILocked
  } = useSettingsStore(useShallow((state: any) => ({"""
    ),
    (
        """  const { 
    notifications, setIsMinimized, orbSize, orbBorderThickness, 
    orbPosition, setOrbPosition, minimizedIcon, minimizedIconUrl, isUILocked
  } = useTrackerStore(useShallow((state: any) => ({""",
        """  const { 
    notifications, setIsMinimized, orbSize, orbBorderThickness, 
    orbPosition, setOrbPosition, minimizedIcon, minimizedIconUrl, isUILocked
  } = useSettingsStore(useShallow((state: any) => ({"""
    )
])

# Fix NPCTranslationBubble.tsx
fix_file('src/components/overlay/NPCTranslationBubble.tsx', [
    (
        """  const { currentNpcDialogue, language } = useTrackerStore(useShallow((state: any) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));""",
        """  const { currentNpcDialogue, language } = useSettingsStore(useShallow((state: any) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));"""
    )
])

# Fix TrackingView.tsx (favorites are in settingsStore now!)
fix_file('src/components/views/TrackingView.tsx', [
    (
        """  const { toggleFavorite, isFav, density, tableSettings, tutorialStep } = useTrackerStore(useShallow((state) => ({""",
        """  const { toggleFavorite, isFav, density, tableSettings, tutorialStep } = useSettingsStore(useShallow((state: any) => ({"""
    ),
    (
        """  const { activeTab, favorites } = useTrackerStore(useShallow((state) => ({
    activeTab: state.activeTab,
    favorites: state.favorites
  })));""",
        """  const { activeTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab })));
  const { favorites } = useSettingsStore(useShallow((state: any) => ({ favorites: state.favorites })));"""
    ),
    (
        """  const { activeTab, favorites } = useTrackerStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
    favorites: state.favorites
  })));""",
        """  const { activeTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab })));
  const { favorites } = useSettingsStore(useShallow((state: any) => ({ favorites: state.favorites })));"""
    )
])

# OverlayContainer.tsx missing BobOverlay
fix_file('src/components/overlay/OverlayContainer.tsx', [
    ("<BobOverlay />", "<CompanionOverlay constraintsRef={containerRef} />"),
    ("<ErrorBoundary><BobOverlay /></ErrorBoundary>", "<ErrorBoundary><CompanionOverlay constraintsRef={containerRef} /></ErrorBoundary>"),
    ("useTrackerStore.getState().tabDimensions", "useSettingsStore.getState().tabDimensions")
])

print('Finished applying more TS fixes')
