import re

def clean_file(path, replacements):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            modified = True
            
    if modified:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {path}")

# SidebarNav
clean_file('src/components/layout/SidebarNav.tsx', [
    (
"""  const { activeTab, setActiveTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab, setActiveTab: state.setActiveTab })));
  const { layoutMode, setLayoutMode } = useSettingsStore(useShallow((state: any) => ({
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
  })));
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
  })));""")
])

# CompanionGuideOverlay
clean_file('src/components/overlay/CompanionGuideOverlay.tsx', [
    ("import { useSettingsStore } from '../../store/settingsStore';\nimport { useSettingsStore } from '../../store/settingsStore';", "import { useSettingsStore } from '../../store/settingsStore';"),
    (
"""  const {
    tutorialStep,
    tutorialCompleted,
    setTutorialStep,
    setBobMood,
    companionPosition
  } = useTrackerStore(
    useShallow((state) => ({
      tutorialStep: state.notificationSettings.tutorialStep,
      tutorialCompleted: state.notificationSettings.tutorialCompleted,
      setTutorialStep: state.setTutorialStep,
      setBobMood: state.setBobMood,
      companionPosition: state.companionPosition
    }))
  );""",
"""  const { companionPosition } = useTrackerStore(useShallow((state: any) => ({ companionPosition: state.companionPosition })));
  const { tutorialStep, tutorialCompleted, setTutorialStep, setBobMood } = useSettingsStore(useShallow((state: any) => ({
      tutorialStep: state.notificationSettings?.tutorialStep,
      tutorialCompleted: state.notificationSettings?.tutorialCompleted,
      setTutorialStep: state.setTutorialStep,
      setBobMood: state.setBobMood,
  })));"""
    ),
    (
"""  const playerName = useTrackerStore(state => state.playerName?.name);
  const sessionPlayerName = useTrackerStore(state => state.playerName);
  const currentZone = useTrackerStore(state => state.currentZone);""",
"""  const playerName = useTrackerStore(state => state.playerName?.name);
  const sessionPlayerName = useTrackerStore(state => state.playerName);
  const currentZone = useTrackerStore(state => state.currentZone);"""
    ),
    ("currentState.sessionMobsKilled", "currentState.sessionKillCount"),
    ("currentState.sessionPlayerName", "currentState.playerName?.name"),
    ("currentState.playerProfile", "currentState.playerName"),
    ("useTrackerStore(useShallow(state => ({", "useTrackerStore(useShallow((state: any) => ({")
])

# FocusHighlight
clean_file('src/components/overlay/FocusHighlight.tsx', [
    ("import { useSettingsStore } from '../../store/settingsStore';\nimport { useSettingsStore } from '../../store/settingsStore';", "import { useSettingsStore } from '../../store/settingsStore';"),
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

# NPCTranslationBubble
clean_file('src/components/overlay/NPCTranslationBubble.tsx', [
    ("import { useSettingsStore } from '../../store/settingsStore';\nimport { useSettingsStore } from '../../store/settingsStore';", "import { useSettingsStore } from '../../store/settingsStore';"),
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

# TrackingView
clean_file('src/components/views/TrackingView.tsx', [
    (
"""  const { activeTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab })));
  const { favorites } = useSettingsStore(useShallow((state: any) => ({
    favorites: state.favorites
  })));
    activeTab: state.activeTab,
  })));""",
"""  const { activeTab } = useTrackerStore(useShallow((state: any) => ({ activeTab: state.activeTab })));
  const { favorites } = useSettingsStore(useShallow((state: any) => ({
    favorites: state.favorites
  })));"""
    ),
    (
"""  const { favorites } = useSettingsStore(useShallow((state: any) => ({
    favorites: state.favorites
  })));
    activeTab: state.activeTab,
  })));""",
"""  const { favorites } = useSettingsStore(useShallow((state: any) => ({
    favorites: state.favorites
  })));"""
    )
])

print("Finished strict cleanup")
