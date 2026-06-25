import re

def rewrite(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old in content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content.replace(old, new))
        print(f"Replaced in {path}")
    else:
        print(f"NOT FOUND in {path}")

# Header
rewrite('src/components/layout/Header.tsx',
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
  } = useTrackerStore(useShallow((state) => ({
    isMinimized: state.isMinimized,
    setIsMinimized: state.setIsMinimized,
    isUILocked: state.isUILocked,
    setIsUILocked: state.setIsUILocked,
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    popOutTab: state.popOutTab,
    poppedOutWindows: state.poppedOutWindows,
    mergeAllTabs: state.mergeAllTabs,
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    tutorialStep: state.notificationSettings.tutorialStep,
    tutorialCompleted: state.notificationSettings.tutorialCompleted,
    seenTabs: state.notificationSettings.seenTabs || {},
    updateNotificationSettings: state.updateNotificationSettings,
    addBobMessage: state.addBobMessage,
  })));""",
"""  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const {
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
  } = useSettingsStore(useShallow((state: any) => ({
    isMinimized: state.isMinimized,
    setIsMinimized: state.setIsMinimized,
    isUILocked: state.isUILocked,
    setIsUILocked: state.setIsUILocked,
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
    popOutTab: state.popOutTab,
    poppedOutWindows: state.poppedOutWindows,
    mergeAllTabs: state.mergeAllTabs,
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
    tutorialCompleted: state.notificationSettings?.tutorialCompleted || false,
    seenTabs: state.notificationSettings?.seenTabs || {},
    updateNotificationSettings: state.updateNotificationSettings,
  })));""")

# SidebarNav
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

# CompanionGuideOverlay
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

rewrite('src/components/overlay/CompanionGuideOverlay.tsx',
"""  const { playerName, playerProfile } = useTrackerStore(useShallow(state => ({
    playerName: state.sessionPlayerName,
    playerProfile: state.playerProfile
  })));""",
"""  const { playerName, playerProfile } = useTrackerStore(useShallow((state: any) => ({
    playerName: state.playerName,
    playerProfile: state.playerName
  })));""")

# FocusHighlight
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


# MinimizedOrb
rewrite('src/components/overlay/MinimizedOrb.tsx',
"""  const { 
    notifications, setIsMinimized, orbSize, orbBorderThickness, 
    orbPosition, setOrbPosition, minimizedIcon, minimizedIconUrl, isUILocked
  } = useTrackerStore(useShallow((state) => ({
    notifications: state.notifications,
    setIsMinimized: state.setIsMinimized,
    orbSize: state.orbSize,
    orbBorderThickness: state.orbBorderThickness,
    orbPosition: state.orbPosition,
    setOrbPosition: state.setOrbPosition,
    minimizedIcon: state.minimizedIcon,
    minimizedIconUrl: state.minimizedIconUrl,
    isUILocked: state.isUILocked
  })));""",
"""  const { 
    notifications, setIsMinimized, orbSize, orbBorderThickness, 
    orbPosition, setOrbPosition, minimizedIcon, minimizedIconUrl, isUILocked
  } = useSettingsStore(useShallow((state: any) => ({
    notifications: state.notifications,
    setIsMinimized: state.setIsMinimized,
    orbSize: state.orbSize,
    orbBorderThickness: state.orbBorderThickness,
    orbPosition: state.orbPosition,
    setOrbPosition: state.setOrbPosition,
    minimizedIcon: state.minimizedIcon,
    minimizedIconUrl: state.minimizedIconUrl,
    isUILocked: state.isUILocked
  })));""")


# NPCTranslationBubble
rewrite('src/components/overlay/NPCTranslationBubble.tsx',
"""  const { currentNpcDialogue, language } = useTrackerStore(useShallow((state) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));""",
"""  const { currentNpcDialogue, language } = useSettingsStore(useShallow((state: any) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));""")

# TrackingView
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


# OverlayContainer
rewrite('src/components/overlay/OverlayContainer.tsx',
"""              return <BobOverlay key={`popped-${win.id}`} />;""",
"""              return <CompanionOverlay key={`popped-${win.id}`} constraintsRef={containerRef} />;""")

print("Applied replacements")
