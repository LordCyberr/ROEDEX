import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { BootSequence } from './BootSequence';
import { COMPANIONS } from '../../data/companions';
import { bobTranslations } from '../../i18n/bobTranslations';
import { companionTranslations } from '../../i18n/companionTranslations';
import { WelcomeSplash } from './WelcomeSplash';

type TutorialStep = {
  id: string;
  text: string;
  actionRequired?: boolean;
  checkCompletion?: (state: any) => boolean;
};

const steps: TutorialStep[] = [
  {
    id: 'tutorial-gather-flowers',
    text: "See that flower highlighted? Look at its name, distance, and how many are alive. Pick the exact same flower twice so we can track its respawn!",
    actionRequired: true,
    checkCompletion: (s) => {
      const counts: Record<string, number> = {};
      Object.values(s.timers).forEach((t: any) => {
        counts[t.name] = (counts[t.name] || 0) + 1;
      });
      return Object.values(counts).some((c: number) => c >= 2);
    }
  },
  { 
    id: 'tutorial-global-tab', 
    text: "Welcome to the Global Tab! Here you can see every mob, tree, and plant in your zone. It even shows the exact distance from where you are right now!" 
  },
  { 
    id: 'tutorial-timer-row', 
    text: "Now hover your mouse over the timer! It will show you the exact respawn queue so you know when it's coming back. (Click Next)" 
  },
  { 
    id: 'tutorial-session-tab', 
    text: "Click the Session Tab up top. This is where we calculate how rich you're getting per hour. Start a run, and I'll track your XP and Runestone efficiency!",
    actionRequired: true,
    checkCompletion: (s) => s.activeTab === 'session'
  },
  { 
    id: 'tutorial-popout-btn', 
    text: "Got a messy screen? Click this icon to pop tabs out into their own mini-overlays anywhere on your screen!",
    actionRequired: true,
    checkCompletion: (s) => Object.keys(s.poppedOutWindows).length > 0
  },
  { 
    id: 'tutorial-merge-btn', 
    text: "Want to close all those popped-out windows at once? Hit this merge button to bring them all back into the main view!",
    actionRequired: true,
    checkCompletion: (s) => Object.keys(s.poppedOutWindows).length === 0
  },
  { 
    id: 'tutorial-minimize-btn', 
    text: "Need to hide the app quickly? Click the minimize button to shrink the window into a tiny floating orb! (You can double-click the orb to bring it back)",
    actionRequired: true,
    checkCompletion: (s) => s.isMinimized
  },
  { 
    id: 'tutorial-lock-btn', 
    text: "Double-tap the orb to reopen the UI, then click the Lock button! When locked, the UI becomes click-through so you can play the game.",
    actionRequired: true,
    checkCompletion: (s) => s.isUILocked
  },
  { 
    id: 'tutorial-lock-btn', 
    text: "Great! Now click the lock button again to UNLOCK the UI. If you don't unlock it, you can't click any tabs!",
    actionRequired: true,
    checkCompletion: (s) => !s.isUILocked
  },
  { 
    id: 'tutorial-settings-tab', 
    text: "You can tweak my settings or shut me up in the Settings tab. Click it to finish the tutorial!",
    actionRequired: true,
    checkCompletion: (s) => s.activeTab === 'settings'
  },
  {
    id: 'tutorial-end',
    text: "One last thing: The ROEDEX only tracks what it sees. Run into the Cave and the Forest in-game to calibrate the trackers!",
    actionRequired: false
  }
];

export const BobTutorialOverlay: React.FC = () => {
  const { 
    tutorialStep, 
    tutorialCompleted, 
    setTutorialStep, 
    setBobMood,
    bobPosition,
    language
  } = useTrackerStore(
    useShallow((state) => ({
      tutorialStep: state.notificationSettings.tutorialStep,
      tutorialCompleted: state.notificationSettings.tutorialCompleted,
      setTutorialStep: state.setTutorialStep,
      setBobMood: state.setBobMood,
      bobPosition: state.bobPosition,
      language: state.language || 'en'
    }))
  );
  
  const activeCompanion = useTrackerStore(state => state.activeCompanion);
  const companionColor = COMPANIONS[activeCompanion as keyof typeof COMPANIONS]?.color || '#22d3ee';
  
  const playerName = useTrackerStore(state => state.playerProfile?.name);
  const currentZone = useTrackerStore(state => state.currentZone);
  const isGameLoaded = !!currentZone && currentZone !== 'Unknown';

  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [kills, setKills] = useState(0);
  const [canShowBootSequence, setCanShowBootSequence] = useState(false);
  const [splashSeen, setSplashSeen] = useState(false);

  useEffect(() => {
    if (isGameLoaded) {
      const timer = setTimeout(() => {
        setCanShowBootSequence(true);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isGameLoaded]);

  const currentStepData = tutorialStep > 0 && tutorialStep <= steps.length ? steps[tutorialStep - 1] : null;

  // Auto-advance logic
  useEffect(() => {
    if (tutorialStep === 0 || tutorialStep > steps.length) return;
    const stepData = steps[tutorialStep - 1];
    
    if (stepData.actionRequired && stepData.checkCompletion) {
      // We set up a quick interval to check the store state directly
      const checker = setInterval(() => {
        const currentState = useTrackerStore.getState();
        if (stepData.id === 'tutorial-quest') {
          setKills(currentState.sessionMobsKilled);
        }
        if (stepData.checkCompletion!(currentState)) {
          handleNext();
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
      // Position it beautifully in the upper-middle of the screen
      store.setOverlayPosition({ x: window.innerWidth / 2 - 250, y: window.innerHeight / 2 - 200 });
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (tutorialStep === 0 || tutorialStep > steps.length) {
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
    } else {
      currentState.setTutorialStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    const currentState = useTrackerStore.getState();
    currentState.setTutorialStep(0);
    currentState.updateNotificationSettings({ tutorialCompleted: true });
  };

  const renderContent = () => {
    if (tutorialStep === 0 || tutorialStep > steps.length) {
      if (!tutorialCompleted && tutorialStep === 0) {
        if (!isGameLoaded || !canShowBootSequence) {
          return null;
        }

        return <BootSequence 
          key="boot-sequence"
          playerName={playerName}
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
          <div className="absolute top-0 left-0 right-0 pointer-events-auto bg-black/75 transition-all duration-500" style={{ height: sTop }} />
          <div className="absolute bottom-0 left-0 right-0 pointer-events-auto bg-black/75 transition-all duration-500" style={{ top: sTop + sHeight }} />
          <div className="absolute pointer-events-auto bg-black/75 transition-all duration-500" style={{ top: sTop, height: sHeight, left: 0, width: sLeft }} />
          <div className="absolute pointer-events-auto bg-black/75 transition-all duration-500" style={{ top: sTop, height: sHeight, left: sLeft + sWidth, right: 0 }} />
        </>
      )}

      {/* Tutorial Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
        <button
          onClick={handleSkip}
          className="pointer-events-auto bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg"
        >
          Skip Tutorial
        </button>
        <button
          onClick={() => {
            const store = useTrackerStore.getState();
            store.setTutorialStep(0);
            store.updateNotificationSettings({ tutorialCompleted: false });
          }}
          className="pointer-events-auto bg-blue-500/20 hover:bg-blue-500/40 text-blue-200 border border-blue-500/30 px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg"
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
              {(() => {
                 const compId = activeCompanion || 'bob';
                 let tutorialArr;
                 if (compId === 'bob') {
                   tutorialArr = (bobTranslations as any)[language]?.tourGuide || bobTranslations.en.tourGuide;
                 } else {
                   const premiumQuotes = (companionTranslations as any)[language] || companionTranslations.en;
                   tutorialArr = premiumQuotes[compId]?.tutorial || companionTranslations.en.kaya.tutorial;
                 }
                 return tutorialArr[tutorialStep - 1] || currentStepData?.text;
              })()}
              {currentStepData?.id === 'tutorial-quest' && (
                <div className="mt-3 p-2 bg-black/40 rounded border border-white/10 text-center font-mono tracking-widest text-[10px]" style={{ color: companionColor }}>
                  MOBS KILLED: {kills} / 3
                </div>
              )}
            </div>
            
            <div className="relative z-10 flex justify-between items-center mt-2 pt-3 border-t" style={{ borderColor: `${companionColor}40` }}>
              <span className="text-[10px] uppercase font-mono tracking-widest" style={{ color: `${companionColor}aa` }}>Step {tutorialStep} / {steps.length}</span>
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleNext}
                  className="px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Skip
                </button>
                {!currentStepData?.actionRequired ? (
                  <button
                    onClick={handleNext}
                    className="px-5 py-1.5 rounded-lg text-[11px] font-black tracking-widest uppercase transition-colors shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:brightness-125 animate-pulse"
                    style={{
                      backgroundColor: `${companionColor}40`,
                      color: companionColor,
                      border: `1px solid ${companionColor}`,
                      boxShadow: `0 0 15px ${companionColor}80`
                    }}
                  >
                    Next
                  </button>
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
