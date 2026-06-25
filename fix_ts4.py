import re

def rewrite_regex(path, pattern, replacement):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    new_content = re.sub(pattern, replacement, content, flags=re.MULTILINE)
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Replaced in {path}")
    else:
        print(f"NOT FOUND in {path}")

# Fix Header.tsx
rewrite_regex('src/components/layout/Header.tsx',
r"  const \{.*?tabDimensions.*?\} = useTrackerStore\(useShallow\(\(state(?:.*?)?\) => \(\{(.*?)\}\)\)\);",
"""  const { addBobMessage } = useTrackerStore(useShallow((state: any) => ({ addBobMessage: state.addBobMessage })));
  const { tabDimensions, setTabDimensions, notificationSettings, updateNotificationSettings } = useSettingsStore(useShallow((state: any) => ({
    tabDimensions: state.tabDimensions,
    setTabDimensions: state.setTabDimensions,
    notificationSettings: state.notificationSettings,
    updateNotificationSettings: state.updateNotificationSettings,
  })));"""
)

# Fix SidebarNav.tsx
rewrite_regex('src/components/layout/SidebarNav.tsx',
r"  const \{.*?activeTab.*?layoutMode.*?\} = useTrackerStore\(useShallow\(\(state(?:.*?)?\) => \(\{(.*?)\}\)\)\);",
"""  const { activeTab, setActiveTab } = useTrackerStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  })));
  const { layoutMode, setLayoutMode } = useSettingsStore(useShallow((state: any) => ({
    layoutMode: state.layoutMode,
    setLayoutMode: state.setLayoutMode,
  })));"""
)

# Fix CompanionGuideOverlay.tsx
rewrite_regex('src/components/overlay/CompanionGuideOverlay.tsx',
r"  const \{.*?notificationSettings.*?companionPosition.*?\} = useTrackerStore\(useShallow\(\(state(?:.*?)?\) => \(\{(.*?)\}\)\)\);",
"""  const { companionPosition } = useTrackerStore(useShallow((state: any) => ({
    companionPosition: state.companionPosition,
  })));
  const { notificationSettings, setTutorialStep, setBobMood } = useSettingsStore(useShallow((state: any) => ({
    notificationSettings: state.notificationSettings,
    setTutorialStep: state.setTutorialStep,
    setBobMood: state.setBobMood,
  })));"""
)

rewrite_regex('src/components/overlay/CompanionGuideOverlay.tsx',
r"  const \{ sessionMobsKilled \} = useTrackerStore\(useShallow\((?:state(?:.*?)? =>|.*?\(state(?:.*?)?\) =>) \(\{\n.*?sessionMobsKilled.*?\}\)\)\);",
"""  const { sessionMobsKilled } = useTrackerStore(useShallow((state: any) => ({
    sessionMobsKilled: state.sessionKillCount
  })));"""
)

# Fix FocusHighlight.tsx
rewrite_regex('src/components/overlay/FocusHighlight.tsx',
r"  const \{.*?minimalChestHud.*?\} = useTrackerStore\(useShallow\(\(state(?:.*?)?\) => \(\{(.*?)\}\)\)\);",
"""  const { minimalChestHud, minimalChestTutorialSeen, setMinimalChestTutorialSeen } = useSettingsStore(useShallow((state: any) => ({
    minimalChestHud: state.minimalChestHud,
    minimalChestTutorialSeen: state.minimalChestTutorialSeen,
    setMinimalChestTutorialSeen: state.setMinimalChestTutorialSeen
  })));"""
)

# Fix NPCTranslationBubble.tsx
rewrite_regex('src/components/overlay/NPCTranslationBubble.tsx',
r"  const \{.*?currentNpcDialogue.*?\} = useTrackerStore\(useShallow\(\(state(?:.*?)?\) => \(\{(.*?)\}\)\)\);",
"""  const { currentNpcDialogue, language } = useSettingsStore(useShallow((state: any) => ({
    currentNpcDialogue: state.currentNpcDialogue,
    language: state.language
  })));"""
)

# Fix TrackingView.tsx
rewrite_regex('src/components/views/TrackingView.tsx',
r"  const \{ activeTab, favorites \} = useTrackerStore\(useShallow\(\(state(?:.*?)?\) => \(\{(.*?)\}\)\)\);",
"""  const { activeTab } = useTrackerStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
  })));
  const { favorites } = useSettingsStore(useShallow((state: any) => ({
    favorites: state.favorites
  })));"""
)

rewrite_regex('src/components/overlay/OverlayContainer.tsx',
r"return <BobOverlay key=\{`popped-\$\{win\.id\}`\} />;",
r"return <CompanionOverlay key={`popped-${win.id}`} constraintsRef={containerRef} />;"
)
