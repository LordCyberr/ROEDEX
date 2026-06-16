import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { BootSequence } from './BootSequence';
import { COMPANIONS } from '../../data/companions';
import { WelcomeSplash } from './WelcomeSplash';
import { BobCompanion } from '../../core/companion/BobCompanion';
import { NotificationManager } from '../../core/notifications/NotificationManager';

type TutorialStep = {
  id: string;
  text: string;
  actionRequired?: boolean;
  autoAdvance?: boolean;
  allowGameInteraction?: boolean;
  checkCompletion?: (state: any) => boolean;
};

const steps: TutorialStep[] = [
  { 
    id: 'tutorial-intro', 
    text: "Welcome to ROEDEX! This tutorial will cover all overlay features in one go so you don't have to discover them on your own. Click 'NEXT' below to begin.",
  },
  { 
    id: 'tutorial-global-tab', 
    text: "This is the Global Tab. The header tracks Name, Distance, Alive & Dead counts, and Respawn Time for the current zone. Click 'NEXT' below to continue." 
  },
  { 
    id: 'tutorial-timer-row', 
    text: "Hover over the first item's respawn timer to see the respawn queue! Once you've seen it, click 'NEXT' below.",
    actionRequired: false
  },
  {
    id: 'tutorial-bookmark',
    text: "Great! Now, click the category icon (like the sword, leaf, or pickaxe) next to an item in the list to bookmark it.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.favorites.length > 0
  },
  {
    id: 'tutorial-favorites-tab',
    text: "Click the Favorites Tab (the star icon) at the top of the UI to view your bookmarks.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.activeTab === 'favorites'
  },
  {
    id: 'tutorial-bookmark',
    text: "See your bookmark? Now click the icon again to remove it from your favorites.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.favorites.length === 0
  },
  { 
    id: 'tutorial-session-tab', 
    text: "Click the Session Tab up top. This tab tracks your Player Profile, Session Stats (record runs and run history), and Chest Loot.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.activeTab === 'session'
  },
  { 
    id: 'tutorial-npcs-tab', 
    text: "Click the NPC Tab. This shows you the locations of all vendors, quest givers, and important characters.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.activeTab === 'npcs'
  },
  {
    id: 'tutorial-alchemist-category',
    text: "Click the 'Alchemist' category row to expand it, then hover over the first NPC row.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => !s.collapsedCategories['npcs_alchemist']
  },
  { 
    id: 'tutorial-settings-tab', 
    text: "Click the Settings tab (the gear icon). Everything is customizable here, from layout colors to notification behavior.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.activeTab === 'settings'
  },
  {
    id: 'tutorial-about-accordion',
    text: "Scroll down and click on 'ABOUT ROEDEX' to expand the section. Click 'NEXT' below after expanding.",
    actionRequired: false
  },
  {
    id: 'tutorial-changelog-btn',
    text: "Now click the 'Project Changelogs' button to read the latest updates.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.isChangelogOpen
  },
  {
    id: 'tutorial-close-changelog',
    text: "Great! Now close the changelog window by clicking the X in the top right corner.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => !s.isChangelogOpen
  },
  { 
    id: 'tutorial-popout-btn', 
    text: "Let's go back to the Global Tab. Click the Pop-out icon in the top right of the UI to separate it into its own mini-overlay!",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => Object.keys(s.poppedOutWindows).length > 0
  },
  { 
    id: 'tutorial-drag-popout', 
    text: "Grab the header of the popped-out window and drag it. You can drag windows anywhere on your screen! Click 'NEXT' below when you're done.",
  },
  { 
    id: 'tutorial-merge-btn', 
    text: "Click the 'Merge' button in the header (down arrow icon) to bring all popped-out windows back into the main view.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => Object.keys(s.poppedOutWindows).length === 0
  },
  { 
    id: 'tutorial-layout-toggle', 
    text: "Click the Layout button in the top right (panel icons) to switch to Horizontal View! It lets you see multiple pieces of info at a glance.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.layoutMode === 'horizontal'
  },
  {
    id: 'tutorial-layout-toggle-back',
    text: "Great! Now click it again to switch back to Vertical View.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.layoutMode === 'vertical'
  },
  { 
    id: 'tutorial-minimize-btn', 
    text: "Click the minimize button (dash icon) to shrink the window into a tiny floating orb! (Double-click the orb to bring it back)",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.isMinimized
  },
  { 
    id: 'tutorial-lock-btn', 
    text: "Double-tap the orb to reopen the UI, then click the Lock button! When locked, the UI becomes click-through.",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => s.isUILocked
  },
  { 
    id: 'tutorial-end', 
    text: "Great! Now click the lock button again to UNLOCK the UI, and you're ready to start playing!",
    actionRequired: true,
    autoAdvance: true,
    checkCompletion: (s) => !s.isUILocked
  }
];

export const CompanionGuideOverlay: React.FC = () => {
  const { 
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
  
  const activeCompanion = useTrackerStore(state => state.activeCompanion);
  const companionColor = COMPANIONS[activeCompanion as keyof typeof COMPANIONS]?.color || '#22d3ee';
  
  const playerName = useTrackerStore(state => state.playerProfile?.name);
  const sessionPlayerName = useTrackerStore(state => state.sessionPlayerName);
  const currentZone = useTrackerStore(state => state.currentZone);
  const isGameLoaded = !!sessionPlayerName && sessionPlayerName.toLowerCase() !== 'unknown';

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [kills, setKills] = useState(0);
  const [canShowBootSequence, setCanShowBootSequence] = useState(false);
  const [splashSeen, setSplashSeen] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  useEffect(() => {
    if (isGameLoaded && !canShowBootSequence && !splashSeen) {
      setCanShowBootSequence(true);
    }
  }, [isGameLoaded, canShowBootSequence, splashSeen]);

  const currentStepData = tutorialStep > 0 && tutorialStep <= steps.length ? steps[tutorialStep - 1] : null;

  // Auto-advance logic and state reset
  useEffect(() => {
    setActionCompleted(false);
    
    if (tutorialStep <= 0 || tutorialStep > steps.length) return;
    const stepData = steps[tutorialStep - 1];
    
    if (stepData.actionRequired && stepData.checkCompletion) {
      // Check immediately
      const currentState = useTrackerStore.getState();
      if (stepData.checkCompletion(currentState)) {
        setActionCompleted(true);
        if (stepData.autoAdvance) {
          const currentStep = currentState.notificationSettings.tutorialStep;
          if (currentStep >= steps.length) {
            currentState.setTutorialStep(0);
            currentState.updateNotificationSettings({ tutorialCompleted: true });
          } else {
            currentState.setTutorialStep(currentStep + 1);
          }
          return;
        }
      }

      // We set up a quick interval to check the store state directly
      const checker = setInterval(() => {
        const currentState = useTrackerStore.getState();
        if (stepData.id === 'tutorial-quest') {
          setKills(currentState.sessionMobsKilled);
        }
        if (stepData.checkCompletion!(currentState)) {
          setActionCompleted(true);
          if (stepData.autoAdvance) {
            clearInterval(checker);
            const currentStep = currentState.notificationSettings.tutorialStep;
            if (currentStep >= steps.length) {
              currentState.setTutorialStep(0);
              currentState.updateNotificationSettings({ tutorialCompleted: true });
            } else {
              currentState.setTutorialStep(currentStep + 1);
            }
          }
        } else {
          setActionCompleted(false);
        }
      }, 500);
      return () => clearInterval(checker);
    }
  }, [tutorialStep]);

  // Bring UI to intro position when tutorial starts
  useEffect(() => {
    if (tutorialStep === 1) {
      const store = useTrackerStore.getState();
      store.setIsMinimized(false);
      store.setActiveTab('global');
      // Position it beautifully on the left side below the health bar
      store.setOverlayPosition({ x: 20, y: 150 });
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (tutorialStep <= 0 || tutorialStep > steps.length) {
      setTargetRect(null);
      return;
    }

    setBobMood('talking');
    const timer = setTimeout(() => {
      setBobMood('idle');
    }, 3000);

    const updateRect = () => {
      const isMin = useTrackerStore.getState().isMinimized;
      let targetId = isMin && currentStepData!.id === 'tutorial-lock-btn' ? 'tutorial-minimized-orb' : currentStepData!.id;
      let el = document.getElementById(targetId);

      if (currentStepData!.id === 'tutorial-gather-flowers') {
        const plantRow = document.querySelector('[data-category*="plants" i]') as HTMLElement;
        if (plantRow) {
          el = plantRow;
        } else {
          el = null; // No plant found yet
        }
      }

      if (el) {
        setTargetRect(el.getBoundingClientRect());
      } else {
        // No target UI element = active game phase. Remove blackout!
        setTargetRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    const interval = setInterval(updateRect, 500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      clearInterval(interval);
    };
  }, [tutorialStep, currentStepData, setBobMood]);

  const spotlightPadding = 10;
  const sLeft = targetRect ? targetRect.left - spotlightPadding : 0;
  const sTop = targetRect ? targetRect.top - spotlightPadding : 0;
  const sWidth = targetRect ? targetRect.width + spotlightPadding * 2 : 0;
  const sHeight = targetRect ? targetRect.height + spotlightPadding * 2 : 0;

  let bobX = bobPosition.x;
  let bobY = bobPosition.y;
  let bubbleOrigin = bobX > window.innerWidth / 2 ? 'right' : 'left';

  if (targetRect && typeof window !== 'undefined') {
    // If the bubble is covering the spotlight, move Bob to the other side
    const bubbleWidth = 350;
    const bubbleHeight = 200;
    const padding = 20;
    
    // Check overlap
    const orbRect = { left: bobX, top: bobY, right: bobX + 64, bottom: bobY + 64 };
    const bubRect = {
      left: bubbleOrigin === 'right' ? orbRect.left - bubbleWidth - padding : orbRect.right + padding,
      top: orbRect.top,
      right: bubbleOrigin === 'right' ? orbRect.left - padding : orbRect.right + padding + bubbleWidth,
      bottom: orbRect.top + bubbleHeight
    };

    const isOverlapping = !(
      bubRect.right < targetRect.left || 
      bubRect.left > targetRect.right || 
      bubRect.bottom < targetRect.top || 
      bubRect.top > targetRect.bottom
    );

    if (isOverlapping) {
      if (bobX > window.innerWidth / 2) {
        bobX = sLeft - 100;
        bubbleOrigin = 'right';
      } else {
        bobX = sLeft + sWidth + 100;
        bubbleOrigin = 'left';
      }
    }
  }

  const handleNext = () => {
    const currentState = useTrackerStore.getState();
    const currentStep = currentState.notificationSettings.tutorialStep;
    if (currentStep >= steps.length) {
      currentState.setTutorialStep(0);
      currentState.updateNotificationSettings({ tutorialCompleted: true });
      // Trigger the greeting sequence now that the tutorial is finished
      BobCompanion.greetUser(currentState.sessionPlayerName || currentState.playerProfile?.name || undefined);
      NotificationManager.greetUser(currentState.sessionPlayerName || currentState.playerProfile?.name || undefined);
    } else {
      currentState.setTutorialStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    const currentState = useTrackerStore.getState();
    const currentStep = currentState.notificationSettings.tutorialStep;
    if (currentStep > 1) {
      currentState.setTutorialStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    const currentState = useTrackerStore.getState();
    currentState.setTutorialStep(0);
    currentState.updateNotificationSettings({ tutorialCompleted: true });
    // Trigger the greeting sequence now that the tutorial is skipped
    BobCompanion.greetUser(currentState.sessionPlayerName || currentState.playerProfile?.name || undefined);
    NotificationManager.greetUser(currentState.sessionPlayerName || currentState.playerProfile?.name || undefined);
  };

  const renderContent = () => {
    if (tutorialStep <= 0 || tutorialStep > steps.length) {
      if (tutorialCompleted) {
        return null;
      }

      if (!isGameLoaded) {
        return null;
      }

      if (canShowBootSequence) {
        return <BootSequence 
          key="boot-sequence"
          playerName={sessionPlayerName || playerName || 'UNKNOWN_USER'}
          currentZone={currentZone}
          onComplete={(compId) => {
            const store = useTrackerStore.getState();
            store.setActiveCompanion(compId);
            
            // Apply companion's theme
            const comp = COMPANIONS[compId as keyof typeof COMPANIONS];
            if (comp && comp.theme) {
              store.setTheme(comp.theme);
            }
            
            setTutorialStep(1);
          }} 
        />;
      }
      
      return null;
    }

    if (tutorialStep === 1 && !splashSeen) {
      return (
        <WelcomeSplash 
          key="welcome-splash"
          onStart={() => setSplashSeen(true)}
          onSkip={handleSkip}
        />
      );
    }

    return (
      <motion.div 
        key="tutorial-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999998] pointer-events-none"
      >
      {/* Dimmer built with 4 divs to leave a completely click-through hole in the center */}
      {targetRect && (
        <>
          <div className={`absolute top-0 left-0 right-0 ${currentStepData?.allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ height: sTop }} />
          <div className={`absolute bottom-0 left-0 right-0 ${currentStepData?.allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ top: sTop + sHeight }} />
          <div className={`absolute ${currentStepData?.allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ top: sTop, height: sHeight, left: 0, width: sLeft }} />
          <div className={`absolute ${currentStepData?.allowGameInteraction ? 'pointer-events-none bg-black/20' : 'pointer-events-auto bg-black/75'} transition-all duration-500`} style={{ top: sTop, height: sHeight, left: sLeft + sWidth, right: 0 }} />
        </>
      )}

      {/* Tutorial Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={handleSkip}
          className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white border border-red-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg"
        >
          Skip Tutorial
        </button>
        <button
          onClick={() => {
            const store = useTrackerStore.getState();
            store.setTutorialStep(0);
            store.updateNotificationSettings({ tutorialCompleted: false });
          }}
          className="pointer-events-auto bg-blue-500 hover:bg-blue-600 text-white border border-blue-500 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg"
        >
          Restart Intro
        </button>
      </div>
      
      {/* Pulsing border around the spotlight */}
      {targetRect && (
        <div 
          className="absolute animate-pulse pointer-events-none transition-all duration-500 ease-in-out"
          style={{
            left: sLeft,
            top: sTop,
            width: sWidth,
            height: sHeight,
            boxShadow: `0 0 30px ${companionColor}40, inset 0 0 20px ${companionColor}20`
          }}
        >
          {/* Scanning Reticle Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: companionColor }} />
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: companionColor }} />
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: companionColor }} />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: companionColor }} />
        </div>
      )}

      {/* Ring Pulse Zoom In for Action Required Target */}
      {targetRect && currentStepData?.actionRequired && !actionCompleted && (
        <div 
          className="absolute pointer-events-none z-[9999999] flex items-center justify-center rounded-full animate-ring-zoom-in"
          style={{
            left: sLeft + sWidth / 2 - 30,
            top: sTop + sHeight / 2 - 30,
            width: 60,
            height: 60,
            borderColor: companionColor
          }}
        />
      )}



      {/* Tutorial Chat Bubble */}
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
        >
          <div 
            className="relative bg-[rgba(10,15,25,0.85)] backdrop-blur-xl border-[1px] p-5 rounded-3xl max-w-[350px] w-max"
            style={{
              borderColor: companionColor,
              boxShadow: `0 0 20px ${companionColor}40, inset 0 0 10px ${companionColor}20`,
            }}
          >
            {/* Scanline effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.1) 51%)', backgroundSize: '100% 4px' }} />
            
            <div className="relative z-10 text-[13px] font-bold tracking-wide leading-relaxed drop-shadow-md mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
              {currentStepData?.text}
              {currentStepData?.id === 'tutorial-quest' && (
                <div className="mt-3 p-2 bg-black/40 rounded border border-white/10 text-center font-mono tracking-widest text-[10px]" style={{ color: companionColor }}>
                  MOBS KILLED: {kills} / 3
                </div>
              )}
            </div>
            
            <div className="relative z-10 flex justify-between items-center mt-2 pt-3 border-t" style={{ borderColor: `${companionColor}40` }}>
              <span className="text-[10px] uppercase font-mono tracking-widest" style={{ color: `${companionColor}aa` }}>Step {tutorialStep} / {steps.length}</span>
              <div className="flex gap-2 items-center">
                {tutorialStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-white"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors hover:text-white"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Skip
                </button>
                {(!currentStepData?.actionRequired || actionCompleted) ? (
                  <div className="relative">
                    <div className="absolute inset-[-6px] pointer-events-none rounded-xl animate-ring-zoom-in" style={{ borderColor: companionColor }} />
                    <button
                      onClick={handleNext}
                      className="relative px-5 py-1.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:brightness-125 animate-pulse z-10"
                      style={{
                        backgroundColor: `${companionColor}40`,
                        color: companionColor,
                        border: `1px solid ${companionColor}`,
                        boxShadow: `0 0 15px ${companionColor}80`
                      }}
                    >
                      Next
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-mono tracking-widest animate-pulse" style={{ color: companionColor }}>AWAITING INPUT...</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <AnimatePresence mode="wait">
      {renderContent()}
    </AnimatePresence>
  );
};
