import os
import re

file_path = "src/components/overlay/CompanionGuideOverlay.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix BobCompanion import
content = re.sub(r'import \{ BobCompanion \} from \'../../core/companion/BobCompanion\';', 'import { AICompanion } from \'../../core/companion/AICompanion\';', content)
content = content.replace("BobCompanion.", "AICompanion.")

# Fix store usage
content = re.sub(
    r'import \{ useTrackerStore \} from \'../../store/trackerStore\';',
    'import { useTrackerStore } from \'../../store/trackerStore\';\nimport { useSettingsStore } from \'../../store/settingsStore\';',
    content
)

# Replace useTrackerStore blocks for tutorial
content = re.sub(
    r'const \{\s*tutorialStep,\s*tutorialCompleted,\s*setTutorialStep,\s*setBobMood,\s*bobPosition\s*\} = useTrackerStore\(\s*useShallow\(\(state\) => \(\{\s*tutorialStep: state\.notificationSettings\.tutorialStep,\s*tutorialCompleted: state\.notificationSettings\.tutorialCompleted,\s*setTutorialStep: state\.setTutorialStep,\s*setBobMood: state\.setBobMood,\s*bobPosition: state\.bobPosition\s*\}\)\)\s*\);',
    '''  const { 
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
  })));''',
    content
)

content = re.sub(
    r'const activeCompanion = useTrackerStore\(state => state\.activeCompanion\);',
    'const activeCompanion = useSettingsStore(state => state.activeCompanion);',
    content
)

content = re.sub(r'useTrackerStore\.getState\(\)\.setTutorialStep', 'useSettingsStore.getState().setTutorialStep', content)
content = re.sub(r'useTrackerStore\.getState\(\)\.updateNotificationSettings', 'useSettingsStore.getState().updateNotificationSettings', content)
content = re.sub(r'useTrackerStore\.getState\(\)\.notificationSettings', 'useSettingsStore.getState().notificationSettings', content)
content = re.sub(r'useTrackerStore\.getState\(\)\.setIsMinimized', 'useSettingsStore.getState().setIsMinimized', content)
content = re.sub(r'useTrackerStore\.getState\(\)\.isMinimized', 'useSettingsStore.getState().isMinimized', content)
content = re.sub(r'useTrackerStore\.getState\(\)\.setActiveTab', 'useSettingsStore.getState().setActiveTab', content)
content = re.sub(r'store\.setOverlayPosition', 'store.setCompanionPosition', content)

# Fix bubble logic
bubble_regex = r'let bobX = bobPosition\.x;[\s\S]*?bubbleOrigin === \'right\' \? \'left\' : \'right\';\s*\}\s*\}'
bubble_replacement = '''let bobX = companionPosition?.x ?? 800;
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

  const bubblePosition = getBubblePosition(bobX, bobY);'''
content = re.sub(bubble_regex, bubble_replacement, content)

# Fix absolute positioning wrapper
bubble_jsx_regex = r'\{\/\* Tutorial Chat Bubble \*\/\}\s*<AnimatePresence>\s*<motion\.div\s*key="bob-tutorial-bubble"\s*initial=\{\{ opacity: 0, scale: 0\.8, x: bubbleOrigin === \'right\' \? 20 : -20 \}\}\s*animate=\{\{ opacity: 1, scale: 1, x: 0 \}\}\s*exit=\{\{ opacity: 0, scale: 0\.8, x: bubbleOrigin === \'right\' \? 20 : -20 \}\}\s*className=\{`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`\}\s*style=\{\{\s*left: bubbleOrigin === \'right\' \? bobX - 370 : bobX \+ 80,\s*top: bobY,\s*\}\}\s*>'
bubble_jsx_replacement = '''{/* Tutorial Chat Bubble */}
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
        >'''
content = re.sub(bubble_jsx_regex, bubble_jsx_replacement, content)

bubble_close_1 = r'</motion\.div>\s*</AnimatePresence>'
bubble_close_2 = '''</motion.div>
      </AnimatePresence>
      </div>'''

idx = content.rfind("</AnimatePresence>")
if idx != -1:
    content = content[:idx] + bubble_close_2 + content[idx+len("</AnimatePresence>"):]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Done")
