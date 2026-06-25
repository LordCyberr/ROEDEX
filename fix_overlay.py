import re

with open('src/components/overlay/OverlayContainer.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

target = """  const {
    activeTab, isMinimized, layoutMode, poppedOutWindows,
    mergeTab, overlayPosition, setOverlayPosition,
    activeOpacity, idleOpacity, isUILocked, globalScale,
    tabDimensions, theme, tutorialStep, tutorialCompleted, currentZone, devForceOverlay
  } = useTrackerStore(useShallow((state) => ({
    activeTab: state.activeTab,
    isMinimized: state.isMinimized,
    layoutMode: state.layoutMode,
    poppedOutWindows: state.poppedOutWindows,
    mergeTab: state.mergeTab,
    overlayPosition: state.overlayPosition,
    setOverlayPosition: state.setOverlayPosition,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    tabDimensions: state.tabDimensions,
    theme: state.theme,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings.tutorialStep,
    tutorialCompleted: state.notificationSettings.tutorialCompleted,
    currentZone: state.currentZone,
    devForceOverlay: state.devForceOverlay
  })));"""

replace = """  const { currentZone, devForceOverlay } = useTrackerStore(useShallow((state: any) => ({
    currentZone: state.currentZone,
    devForceOverlay: state.devForceOverlay
  })));

  const {
    activeTab, isMinimized, layoutMode, poppedOutWindows,
    mergeTab, overlayPosition, setOverlayPosition,
    activeOpacity, idleOpacity, isUILocked, globalScale,
    tabDimensions, theme, tutorialStep, tutorialCompleted
  } = useSettingsStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
    isMinimized: state.isMinimized,
    layoutMode: state.layoutMode,
    poppedOutWindows: state.poppedOutWindows,
    mergeTab: state.mergeTab,
    overlayPosition: state.overlayPosition,
    setOverlayPosition: state.setOverlayPosition,
    activeOpacity: state.activeOpacity,
    idleOpacity: state.idleOpacity,
    isUILocked: state.isUILocked,
    tabDimensions: state.tabDimensions,
    theme: state.theme,
    globalScale: state.globalScale,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
    tutorialCompleted: state.notificationSettings?.tutorialCompleted || false
  })));"""

if target in content:
    content = content.replace(target, replace)
    
    # Also fix profilerMetrics missing
    content = content.replace(
        """  const onRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
    const state = useTrackerStore.getState();
    const currentAvg = state.profilerMetrics.renderTime.average;""",
        """  const onRender: ProfilerOnRenderCallback = (_id, _phase, actualDuration) => {
    const state = useSettingsStore.getState();
    const currentAvg = state.profilerMetrics.renderTime.average;"""
    )
    
    with open('src/components/overlay/OverlayContainer.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed OverlayContainer')
else:
    print('Target not found')
