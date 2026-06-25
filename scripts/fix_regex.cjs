const fs = require('fs');

let c = fs.readFileSync('src/components/overlay/CompanionGuideOverlay.tsx', 'utf8');

c = c.replace(/import \{ BobCompanion \} from '\.\.\/\.\.\/core\/companion\/BobCompanion';/, "import { AICompanion } from '../../core/companion/AICompanion';");
c = c.replace(/BobCompanion\./g, "AICompanion.");

c = c.replace(/import \{ useTrackerStore \} from '\.\.\/\.\.\/store\/trackerStore';/, "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';");

c = c.replace(
  /const \{\s*tutorialStep,\s*tutorialCompleted,\s*setTutorialStep,\s*setBobMood,\s*bobPosition\s*\} = useTrackerStore\([\s\S]*?\}\)\)\s*\);/,
  `  const { 
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
  })));`
);

c = c.replace(
  /const activeCompanion = useTrackerStore\(state => state\.activeCompanion\);/,
  "const activeCompanion = useSettingsStore(state => state.activeCompanion);"
);

c = c.replace(
  /let bobX = bobPosition\.x;[\s\S]*?if\s*\(isOverlapping\)\s*\{[\s\S]*?bubbleOrigin === 'right'\s*\?\s*'left'\s*:\s*'right';\s*\}\s*\}/,
  `  let bobX = companionPosition?.x ?? 800;
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

  const bubblePosition = getBubblePosition(bobX, bobY);`
);

c = c.replace(
  /\{\/\*\s*Tutorial Chat Bubble\s*\*\/\}\s*<AnimatePresence>[\s\S]*?key="bob-tutorial-bubble"[\s\S]*?initial=\{\{\s*opacity:\s*0,\s*scale:\s*0\.8,\s*x:\s*bubbleOrigin\s*===\s*'right'\s*\?\s*20\s*:\s*-20\s*\}\}[\s\S]*?animate=\{\{\s*opacity:\s*1,\s*scale:\s*1,\s*x:\s*0\s*\}\}[\s\S]*?exit=\{\{\s*opacity:\s*0,\s*scale:\s*0\.8,\s*x:\s*bubbleOrigin\s*===\s*'right'\s*\?\s*20\s*:\s*-20\s*\}\}[\s\S]*?className=\{`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto`\}[\s\S]*?style=\{\{[\s\S]*?left:\s*bubbleOrigin\s*===\s*'right'\s*\?\s*bobX\s*-\s*370\s*:\s*bobX\s*\+\s*80,[\s\S]*?top:\s*bobY,[\s\S]*?\}\}\s*>/,
  `      {/* Tutorial Chat Bubble */}
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
        >`
);

// We find the FIRST closing </motion.div>\n      </AnimatePresence> which belongs to the bubble
c = c.replace(
  /<\/motion\.div>\s*<\/AnimatePresence>\s*<\/motion\.div>/,
  `        </motion.div>
      </AnimatePresence>
      </div>
      </motion.div>`
);

c = c.replace(/useTrackerStore\.getState\(\)\.setTutorialStep/g, "useSettingsStore.getState().setTutorialStep");
c = c.replace(/useTrackerStore\.getState\(\)\.updateNotificationSettings/g, "useSettingsStore.getState().updateNotificationSettings");
c = c.replace(/useTrackerStore\.getState\(\)\.notificationSettings/g, "useSettingsStore.getState().notificationSettings");
c = c.replace(/useTrackerStore\.getState\(\)\.setIsMinimized/g, "useSettingsStore.getState().setIsMinimized");
c = c.replace(/useTrackerStore\.getState\(\)\.isMinimized/g, "useSettingsStore.getState().isMinimized");
c = c.replace(/useTrackerStore\.getState\(\)\.setActiveTab/g, "useSettingsStore.getState().setActiveTab");
c = c.replace(/store\.setOverlayPosition/g, "store.setCompanionPosition");

fs.writeFileSync('src/components/overlay/CompanionGuideOverlay.tsx', c, 'utf8');
console.log('Fixed file');
