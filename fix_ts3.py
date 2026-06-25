import re

def rewrite(path, target, replacement):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if target in content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content.replace(target, replacement))
        print(f"Replaced in {path}")
    else:
        print(f"NOT FOUND in {path}")


rewrite('src/components/layout/Header.tsx',
"""  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings } = useSettingsStore(useShallow((state) => ({
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
    addBobMessage: state.addBobMessage,
  })));""",
"""  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings } = useSettingsStore(useShallow((state: any) => ({
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
  })));""")

rewrite('src/components/layout/Header.tsx',
"""  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings, addBobMessage } = useTrackerStore(useShallow((state) => ({
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
    addBobMessage: state.addBobMessage,
  })));""",
"""  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings } = useSettingsStore(useShallow((state: any) => ({
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
  })));""")


rewrite('src/components/layout/SidebarNav.tsx',
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
  })));""")


rewrite('src/components/overlay/CompanionGuideOverlay.tsx',
"""  const { notificationSettings, setTutorialStep, setBobMood, companionPosition } = useTrackerStore(useShallow((state) => ({
    notificationSettings: state.notificationSettings,
    setTutorialStep: state.notificationSettings.setTutorialStep,
    setBobMood: state.notificationSettings.setBobMood,
    companionPosition: state.companionPosition,
  })));""",
"""  const { companionPosition } = useTrackerStore(useShallow((state: any) => ({
    companionPosition: state.companionPosition,
  })));
  const { notificationSettings, setTutorialStep, setBobMood } = useSettingsStore(useShallow((state: any) => ({
    notificationSettings: state.notificationSettings,
    setTutorialStep: state.setTutorialStep,
    setBobMood: state.setBobMood,
  })));""")


rewrite('src/components/overlay/CompanionGuideOverlay.tsx',
"""  const { sessionMobsKilled } = useTrackerStore(useShallow(state => ({
    sessionMobsKilled: state.sessionMobsKilled
  })));""",
"""  const { sessionMobsKilled } = useTrackerStore(useShallow((state: any) => ({
    sessionMobsKilled: state.sessionKillCount
  })));""")


rewrite('src/components/overlay/FocusHighlight.tsx',
"""  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useTrackerStore(useShallow((state) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));""",
"""  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useSettingsStore(useShallow((state: any) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));""")


rewrite('src/components/overlay/NPCTranslationBubble.tsx',
"""  const { currentNpcDialogue, language } = useTrackerStore(useShallow((state) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));""",
"""  const { currentNpcDialogue, language } = useSettingsStore(useShallow((state: any) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));""")


rewrite('src/components/views/TrackingView.tsx',
"""  const { activeTab, favorites } = useTrackerStore(useShallow((state) => ({
    activeTab: state.activeTab,
    favorites: state.favorites
  })));""",
"""  const { activeTab } = useTrackerStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
  })));
  const { favorites } = useSettingsStore(useShallow((state: any) => ({
    favorites: state.favorites
  })));""")


rewrite('src/components/overlay/OverlayContainer.tsx',
"""              return <BobOverlay key={`popped-${win.id}`} />;""",
"""              return <CompanionOverlay key={`popped-${win.id}`} constraintsRef={containerRef} />;""")
