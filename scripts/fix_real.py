import os

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix BobCompanion import
content = content.replace("import { BobCompanion } from '../../core/companion/BobCompanion';", "import { AICompanion } from '../../core/companion/AICompanion';")
content = content.replace("BobCompanion.", "AICompanion.")

# Fix TrackerStore
content = content.replace("import { useTrackerStore } from '../../store/trackerStore';", "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';")

old_store_1 = """  const { 
    tutorialStep, 
    tutorialCompleted, 
    setTutorialStep, 
    setBobMood,
    bobPosition
  } = useTrackerStore(
    useShallow((state) => ({
      tutorialStep: state.notificationSettings.tutorialStep,
      tutorialCompleted: state.notificationSettings.tutorialCompleted,
      setTutorialStep: state.setTutorialStep,
      setBobMood: state.setBobMood,
      bobPosition: state.bobPosition
    }))
  );
  
  const activeCompanion = useTrackerStore(state => state.activeCompanion);"""

new_store_1 = """  const { 
    tutorialStep, 
    tutorialCompleted, 
    setTutorialStep, 
    setBobMood,
    notificationSettings
  } = useSettingsStore(
    useShallow((state: any) => ({
      tutorialStep: state.notificationSettings?.tutorialStep || 0,
      tutorialCompleted: state.notificationSettings?.tutorialCompleted || false,
      setTutorialStep: state.setTutorialStep,
      setBobMood: state.setBobMood,
      notificationSettings: state.notificationSettings
    }))
  );

  const { companionPosition } = useSettingsStore(useShallow((state: any) => ({
    companionPosition: state.companionPosition
  })));
  
  const activeCompanion = useSettingsStore(state => state.activeCompanion);"""

content = content.replace(old_store_1, new_store_1)

# Now fix bubble
old_bubble = """  let bobX = bobPosition.x;
  let bobY = bobPosition.y;
  
  let bubbleOrigin = bobX > window.innerWidth / 2 ? 'right' : 'left';
  
  // If the tutorial bubble would overlap with the target element, move it
  if (targetRect && typeof window !== 'undefined') {
    const bubbleWidth = 350;
    const bubbleHeight = 150;
    
    const bubbleLeft = bubbleOrigin === 'right' ? bobX - 370 : bobX + 80;
    const bubbleRight = bubbleLeft + bubbleWidth;
    const bubbleTop = bobY;
    const bubbleBottom = bubbleTop + bubbleHeight;
    
    // Check intersection
    const isOverlapping = !(
      bubbleRight < targetRect.left || 
      bubbleLeft > targetRect.right || 
      bubbleBottom < targetRect.top || 
      bubbleTop > targetRect.bottom
    );
    
    if (isOverlapping) {
      // Move to the other side
      bubbleOrigin = bubbleOrigin === 'right' ? 'left' : 'right';
    }
  }"""

new_bubble = """  let bobX = companionPosition?.x ?? 800;
  let bobY = companionPosition?.y ?? 220;

  const getBubblePosition = (bx: number, by: number): 'left' | 'right' | 'top' | 'bottom' => {
    if (typeof window === 'undefined') return 'right';
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    if (by > winH * 0.8) return 'top';
    if (by < winH * 0.15 && bx > winW * 0.33 && bx < winW * 0.66) return 'bottom';
    if (bx > winW / 2) return 'left';
    return 'right';
  };

  const bubblePosition = getBubblePosition(bobX, bobY);"""

content = content.replace(old_bubble, new_bubble)

old_jsx = """      {/* Tutorial Chat Bubble */}
      <AnimatePresence>
        <motion.div
          key="bob-tutorial-bubble"
          initial={{ opacity: 0, scale: 0.8, x: bubbleOrigin === 'right' ? 20 : -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: bubbleOrigin === 'right' ? 20 : -20 }}
          className={`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`}
          style={{
            left: bubbleOrigin === 'right' ? bobX - 370 : bobX + 80,
            top: bobY,
          }}
        >"""

new_jsx = """      {/* Tutorial Chat Bubble */}
      <div className="absolute w-16 h-16 pointer-events-none z-[9999999]" style={{ left: bobX, top: bobY }}>
      <AnimatePresence>
        <motion.div
          key="bob-tutorial-bubble"
          initial={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          className={`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`}
          style={{
            left: bubblePosition === 'right' ? '100%' : bubblePosition === 'left' ? 'auto' : '50%',
            right: bubblePosition === 'left' ? '100%' : 'auto',
            top: bubblePosition === 'bottom' ? '100%' : bubblePosition === 'top' ? 'auto' : '50%',
            bottom: bubblePosition === 'top' ? '100%' : 'auto',
            transform: bubblePosition === 'left' ? `translate(calc(50px + ${-(notificationSettings?.companionBubbleDistance ?? 16)}px), calc(-50% + ${notificationSettings?.companionBubbleOffsetY ?? 0}px))` 
                     : bubblePosition === 'right' ? `translate(calc(-50px + ${notificationSettings?.companionBubbleDistance ?? 16}px), calc(-50% + ${notificationSettings?.companionBubbleOffsetY ?? 0}px))`
                     : bubblePosition === 'top' ? `translate(calc(-50%), calc(50px + ${-(notificationSettings?.companionBubbleDistance ?? 16)}px))`
                     : `translate(calc(-50%), calc(-50px + ${notificationSettings?.companionBubbleDistance ?? 16}px))`
          }}
        >"""

content = content.replace(old_jsx, new_jsx)

# We have to close the new wrapper div at the correct location
# We look for the closing of `bob-tutorial-bubble` motion.div
old_close = """        </motion.div>
      </AnimatePresence>
    );"""

new_close = """        </motion.div>
      </AnimatePresence>
      </div>
    );"""

content = content.replace(old_close, new_close)

# Targeted settings usage fixes
content = content.replace("useTrackerStore.getState().setTutorialStep", "useSettingsStore.getState().setTutorialStep")
content = content.replace("useTrackerStore.getState().updateNotificationSettings", "useSettingsStore.getState().updateNotificationSettings")
content = content.replace("useTrackerStore.getState().notificationSettings", "useSettingsStore.getState().notificationSettings")
content = content.replace("useTrackerStore.getState().setIsMinimized", "useSettingsStore.getState().setIsMinimized")
content = content.replace("useTrackerStore.getState().isMinimized", "useSettingsStore.getState().isMinimized")
content = content.replace("useTrackerStore.getState().setActiveTab", "useSettingsStore.getState().setActiveTab")
content = content.replace("store.setOverlayPosition", "store.setCompanionPosition")


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
