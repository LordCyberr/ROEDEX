const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/overlay/CompanionGuideOverlay.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace BobCompanion with AICompanion
content = content.replace(/import \{ BobCompanion \} from '\.\.\/\.\.\/core\/companion\/BobCompanion';/g, "import { AICompanion } from '../../core/companion/AICompanion';");
content = content.replace(/BobCompanion/g, "AICompanion");

// 2. Add useSettingsStore import if missing
if (!content.includes('import { useSettingsStore }')) {
  content = content.replace(/import \{ useTrackerStore \} from '\.\.\/\.\.\/store\/trackerStore';/, "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';");
}

// 3. Fix the state extraction from useTrackerStore that belongs to useSettingsStore
// Find `const { ... } = useTrackerStore(`
// This part is tricky because the destructuring might span multiple lines.

// Let's just do a big regex replacement for the top level hooks
content = content.replace(/const \{\s*tutorialStep,\s*tutorialCompleted,\s*setTutorialStep,\s*setBobMood,\s*bobPosition\s*\} = useTrackerStore\([\s\S]*?\)\)\);/, `const { 
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
  const activeCompanion = useSettingsStore(state => state.activeCompanion);`);

// 4. Fix any other stray uses of `useTrackerStore.getState().notificationSettings` etc
content = content.replace(/useTrackerStore\.getState\(\)\.setTutorialStep/g, 'useSettingsStore.getState().setTutorialStep');
content = content.replace(/useTrackerStore\.getState\(\)\.updateNotificationSettings/g, 'useSettingsStore.getState().updateNotificationSettings');
content = content.replace(/useTrackerStore\.getState\(\)\.notificationSettings/g, 'useSettingsStore.getState().notificationSettings');
content = content.replace(/useTrackerStore\.getState\(\)\.setIsMinimized/g, 'useSettingsStore.getState().setIsMinimized');
content = content.replace(/useTrackerStore\.getState\(\)\.isMinimized/g, 'useSettingsStore.getState().isMinimized');
content = content.replace(/useTrackerStore\.getState\(\)\.setActiveTab/g, 'useSettingsStore.getState().setActiveTab');

// Also activeCompanion in the file
content = content.replace(/const activeCompanion = useTrackerStore\(state => state\.activeCompanion\);/, ''); // Handled above
content = content.replace(/store\.setOverlayPosition/g, 'store.setCompanionPosition');

// Fix bobPosition variables
content = content.replace(/let bobX = bobPosition\.x;/g, 'let bobX = companionPosition?.x ?? 800;');
content = content.replace(/let bobY = bobPosition\.y;/g, 'let bobY = companionPosition?.y ?? 220;');

// 5. Fix bubble positioning logic
const overlapLogicRegex = /let bobX = companionPosition\?\\.x \\?\\? 800;[\\s\\S]*?if \\(targetRect && typeof window !== \'undefined\'\\) \{[\\s\\S]*?if \\(isOverlapping\\) \{[\\s\\S]*?\}[\\s\\S]*?\}[\\s\\S]*?\}/;
const getBubbleLogic = `let bobX = companionPosition?.x ?? 800;
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

  const bubblePosition = getBubblePosition(bobX, bobY);`;

content = content.replace(overlapLogicRegex, getBubbleLogic);
// Also need to fallback if the regex fails because bobX = bobPosition.x is original
content = content.replace(/let bobX = companionPosition\?\.x \?\? 800;\s*let bobY = companionPosition\?\.y \?\? 220;\s*let bubbleOrigin = bobX > window\.innerWidth \/ 2 \? 'right' : 'left';[\s\S]*?if \(targetRect && typeof window !== 'undefined'\) \{[\s\S]*?if \(isOverlapping\) \{[\s\S]*?\}[\s\S]*?\}[\s\S]*?\}/, getBubbleLogic);


// 6. Fix bubble absolute positioning and animation
const bubbleRegex = /\{\/\* Tutorial Chat Bubble \*\/\}\s*<AnimatePresence>\s*<motion\.div[\s\S]*?className=\{`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`\}\s*style=\{\{\s*left: bubbleOrigin === 'right' \? bobX - 370 : bobX \+ 80,\s*top: bobY,\s*\}\}\s*>/;

const newBubble = `{/* Tutorial Chat Bubble */}
      <div className="absolute w-16 h-16 pointer-events-none z-[9999999]" style={{ left: bobX, top: bobY }}>
      <AnimatePresence>
        <motion.div
          key="bob-tutorial-bubble"
          initial={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}
          className={\`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto\`}
          style={{
            left: bubblePosition === 'right' ? '100%' : bubblePosition === 'left' ? 'auto' : '50%',
            right: bubblePosition === 'left' ? '100%' : 'auto',
            top: bubblePosition === 'bottom' ? '100%' : bubblePosition === 'top' ? 'auto' : '50%',
            bottom: bubblePosition === 'top' ? '100%' : 'auto',
            transform: bubblePosition === 'left' ? \`translate(calc(50px + \${-(notificationSettings?.companionBubbleDistance ?? 16)}px), calc(-50% + \${notificationSettings?.companionBubbleOffsetY ?? 0}px))\` 
                     : bubblePosition === 'right' ? \`translate(calc(-50px + \${notificationSettings?.companionBubbleDistance ?? 16}px), calc(-50% + \${notificationSettings?.companionBubbleOffsetY ?? 0}px))\`
                     : bubblePosition === 'top' ? \`translate(calc(-50%), calc(50px + \${-(notificationSettings?.companionBubbleDistance ?? 16)}px))\`
                     : \`translate(calc(-50%), calc(-50px + \${notificationSettings?.companionBubbleDistance ?? 16}px))\`
          }}
        >`;

content = content.replace(bubbleRegex, newBubble);

// Close the div
content = content.replace(/<\/motion\.div>\s*<\/AnimatePresence>/, "</motion.div>\n      </AnimatePresence>\n      </div>");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed CompanionGuideOverlay.tsx completely!');
