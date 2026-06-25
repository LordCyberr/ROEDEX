const fs = require('fs');

let c = fs.readFileSync('src/components/overlay/CompanionGuideOverlay.tsx', 'utf8');

c = c.replace(
  "import { BobCompanion } from '../../core/companion/BobCompanion';",
  "import { AICompanion } from '../../core/companion/AICompanion';"
);
c = c.replace(/BobCompanion\./g, 'AICompanion.');
c = c.replace(
  "import { useTrackerStore } from '../../store/trackerStore';",
  "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
);

let lines = c.split('\n');
let newLines = [];
let dropStore = false;
let dropBubble = false;
let dropEnd = false;

for (let i = 0; i < lines.length; i++) {
  let l = lines[i];

  if (l.includes('} = useTrackerStore(') && lines[i - 1].includes('bobPosition')) {
    dropStore = true;
    // Pop the previous lines belonging to this block
    newLines.pop();
    newLines.pop();
    newLines.pop();
    newLines.pop();
    newLines.pop();
    
    newLines.push('  const { ');
    newLines.push('    tutorialStep, ');
    newLines.push('    tutorialCompleted, ');
    newLines.push('    setTutorialStep, ');
    newLines.push('    setBobMood,');
    newLines.push('    notificationSettings');
    newLines.push('  } = useSettingsStore(');
    newLines.push('    useShallow((state: any) => ({');
    newLines.push('      tutorialStep: state.notificationSettings?.tutorialStep || 0,');
    newLines.push('      tutorialCompleted: state.notificationSettings?.tutorialCompleted || false,');
    newLines.push('      setTutorialStep: state.setTutorialStep,');
    newLines.push('      setBobMood: state.setBobMood,');
    newLines.push('      notificationSettings: state.notificationSettings');
    newLines.push('    }))');
    newLines.push('  );');
    newLines.push('');
    newLines.push('  const { companionPosition } = useSettingsStore(useShallow((state: any) => ({');
    newLines.push('    companionPosition: state.companionPosition');
    newLines.push('  })));');
    newLines.push('  const activeCompanion = useSettingsStore((state: any) => state.activeCompanion);');
  } else if (dropStore && l.includes(');')) {
    dropStore = false;
  } else if (dropStore) {
    // drop
  } else if (l.includes('const activeCompanion = useTrackerStore(state => state.activeCompanion);')) {
    // drop
  } else if (l.includes('let bobX = bobPosition.x;')) {
    dropBubble = true;
    newLines.push('  let bobX = companionPosition?.x ?? 800;');
    newLines.push('  let bobY = companionPosition?.y ?? 220;');
    newLines.push('');
    newLines.push("  const getBubblePosition = (bx: number, by: number): 'left' | 'right' | 'top' | 'bottom' => {");
    newLines.push("    if (typeof window === 'undefined') return 'right';");
    newLines.push('    const winW = window.innerWidth;');
    newLines.push('    const winH = window.innerHeight;');
    newLines.push("    if (by > winH * 0.8) return 'top';");
    newLines.push("    if (by < winH * 0.15 && bx > winW * 0.33 && bx < winW * 0.66) return 'bottom';");
    newLines.push("    if (bx > winW / 2) return 'left';");
    newLines.push("    return 'right';");
    newLines.push('  };');
    newLines.push('');
    newLines.push('  const bubblePosition = getBubblePosition(bobX, bobY);');
  } else if (dropBubble && l.includes('const handleNext = () => {')) {
    dropBubble = false;
    newLines.push(l);
  } else if (dropBubble) {
    // drop
  } else if (l.includes('{/* Tutorial Chat Bubble */}')) {
    dropEnd = true;
    newLines.push('      {/* Tutorial Chat Bubble */}');
    newLines.push('      <div className="absolute w-16 h-16 pointer-events-none z-[9999999]" style={{ left: bobX, top: bobY }}>');
    newLines.push('      <AnimatePresence>');
    newLines.push('        <motion.div');
    newLines.push('          key="bob-tutorial-bubble"');
    newLines.push("          initial={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}");
    newLines.push('          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}');
    newLines.push("          exit={{ opacity: 0, scale: 0.8, x: bubblePosition === 'right' ? -20 : bubblePosition === 'left' ? 20 : 0, y: bubblePosition === 'top' ? 20 : bubblePosition === 'bottom' ? -20 : 0 }}");
    newLines.push('          className={`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`}');
    newLines.push('          style={{');
    newLines.push("            left: bubblePosition === 'right' ? '100%' : bubblePosition === 'left' ? 'auto' : '50%',");
    newLines.push("            right: bubblePosition === 'left' ? '100%' : 'auto',");
    newLines.push("            top: bubblePosition === 'bottom' ? '100%' : bubblePosition === 'top' ? 'auto' : '50%',");
    newLines.push("            bottom: bubblePosition === 'top' ? '100%' : 'auto',");
    newLines.push("            transform: bubblePosition === 'left' ? `translate(calc(50px + ${-(notificationSettings?.companionBubbleDistance ?? 16)}px), calc(-50% + ${notificationSettings?.companionBubbleOffsetY ?? 0}px))`");
    newLines.push("                     : bubblePosition === 'right' ? `translate(calc(-50px + ${notificationSettings?.companionBubbleDistance ?? 16}px), calc(-50% + ${notificationSettings?.companionBubbleOffsetY ?? 0}px))`");
    newLines.push("                     : bubblePosition === 'top' ? `translate(calc(-50%), calc(50px + ${-(notificationSettings?.companionBubbleDistance ?? 16)}px))`");
    newLines.push("                     : `translate(calc(-50%), calc(-50px + ${notificationSettings?.companionBubbleDistance ?? 16}px))`");
    newLines.push('          }}');
    newLines.push('        >');
  } else if (dropEnd && l.includes('</motion.div>')) {
    dropEnd = false;
    newLines.push(l);
    newLines.push('      </AnimatePresence>');
    newLines.push('      </div>');
  } else if (dropEnd) {
    // drop
  } else {
    newLines.push(l);
  }
}

let out = newLines.join('\n');

// Clean up remaining references to tracker store that should be settings store
out = out.replace(/useTrackerStore\.getState\(\)\.setTutorialStep/g, 'useSettingsStore.getState().setTutorialStep');
out = out.replace(/useTrackerStore\.getState\(\)\.updateNotificationSettings/g, 'useSettingsStore.getState().updateNotificationSettings');
out = out.replace(/useTrackerStore\.getState\(\)\.notificationSettings/g, 'useSettingsStore.getState().notificationSettings');

fs.writeFileSync('src/components/overlay/CompanionGuideOverlay.tsx', out, 'utf8');
console.log('Fixed CompanionGuideOverlay.tsx');
