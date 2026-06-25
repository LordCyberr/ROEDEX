const fs = require('fs');

let c = fs.readFileSync('src/components/overlay/CompanionGuideOverlay.tsx', 'utf8');

// 1. Fix AICompanion import
c = c.replace(
  "import { BobCompanion } from '../../core/companion/BobCompanion';",
  "import { AICompanion } from '../../core/companion/AICompanion';"
);
c = c.replace(/BobCompanion\./g, 'AICompanion.');

// 2. Add SettingsStore import
c = c.replace(
  "import { useTrackerStore } from '../../store/trackerStore';",
  "import { useTrackerStore } from '../../store/trackerStore';\nimport { useSettingsStore } from '../../store/settingsStore';"
);

// 3. Fix the top destructuring to useSettingsStore and useTrackerStore
c = c.replace(
  `  const { 
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
  
  const activeCompanion = useTrackerStore(state => state.activeCompanion);`,
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
  })));
  
  const activeCompanion = useSettingsStore(state => state.activeCompanion);`
);

// 4. Fix tracker state assignments everywhere!
c = c.replace(/const currentState = useTrackerStore\.getState\(\);/g, `const trackerState = useTrackerStore.getState() as any;
    const settingsState = useSettingsStore.getState() as any;
    const currentState = { ...trackerState, ...settingsState } as any;`);

c = c.replace(/currentState\.notificationSettings/g, `settingsState.notificationSettings`);
c = c.replace(/currentState\.setTutorialStep/g, `settingsState.setTutorialStep`);
c = c.replace(/currentState\.updateNotificationSettings/g, `settingsState.updateNotificationSettings`);

c = c.replace(/const store = useTrackerStore\.getState\(\);/g, `const store = useSettingsStore.getState() as any;`);

// 5. Fix bubble coordinates
c = c.replace(
  `  let bobX = bobPosition.x;
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
  }`,
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

// 6. Fix JSX wrapper
c = c.replace(
  `      {/* Tutorial Chat Bubble */}
      <AnimatePresence>
        <motion.div
          key="bob-tutorial-bubble"
          initial={{ opacity: 0, scale: 0.8, x: bubbleOrigin === 'right' ? 20 : -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: bubbleOrigin === 'right' ? 20 : -20 }}
          className={\`absolute flex flex-col items-start gap-4 transition-all duration-500 pointer-events-auto\`}
          style={{
            left: bubbleOrigin === 'right' ? bobX - 370 : bobX + 80,
            top: bobY,
          }}
        >`,
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

// 7. Fix the end closing tag
c = c.replace(
  `        </motion.div>
      </AnimatePresence>
      </motion.div>`,
  `        </motion.div>
      </AnimatePresence>
      </div>
      </motion.div>`
);

// Format Windows line endings uniformly just in case
c = c.replace(/\\r\\n/g, '\\n').replace(/\\n/g, '\\r\\n');

fs.writeFileSync('src/components/overlay/CompanionGuideOverlay.tsx', c, 'utf8');
console.log('Fixed file');
