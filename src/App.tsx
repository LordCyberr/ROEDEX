import { useEffect, useState } from 'react';
import { connectWebSocket, disconnectWebSocket } from './core/websocket/connection';
import { BobCompanion } from './core/companion/BobCompanion';
import { OverlayContainer } from './components/overlay/OverlayContainer';
import { useTrackerStore } from './store/trackerStore';

function App() {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // Load persisted settings
    if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
      try {
        chrome.storage.local.get(['layoutMode', 'verticalGroupingMode', 'collapsedCategories', 'collapsedSidebarZones', 'isMinimized', 'minimizeHotkey'], (result) => {
          if (chrome.runtime.lastError) return; // Ignore errors
          if (result.layoutMode) {
            useTrackerStore.getState().setLayoutMode(result.layoutMode as 'vertical' | 'horizontal');
          }
          if (result.verticalGroupingMode) {
            useTrackerStore.getState().setVerticalGroupingMode(result.verticalGroupingMode as 'grouped' | 'flat');
          }
          if (result.collapsedCategories) {
            useTrackerStore.setState({ collapsedCategories: result.collapsedCategories as Record<string, boolean> });
          }
          if (result.collapsedSidebarZones) {
            useTrackerStore.setState({ collapsedSidebarZones: result.collapsedSidebarZones as Record<string, boolean> });
          }
          if (typeof result.isMinimized === 'boolean') {
            useTrackerStore.setState({ isMinimized: result.isMinimized });
          }
          if (result.minimizeHotkey) {
            useTrackerStore.setState({ minimizeHotkey: result.minimizeHotkey as string });
          }
        });
      } catch (err) {
        // Extension context invalidated
      }
    }

    // Subscribe to store changes to persist them
    const unsubscribe = useTrackerStore.subscribe((state, prevState) => {
      // Bob Tour Guide hook
      if (state.activeTab !== prevState.activeTab) {
        BobCompanion.onTabOpened(state.activeTab);
      }

      if (typeof chrome !== 'undefined' && chrome?.storage?.local) {
        if (state.layoutMode !== prevState.layoutMode || 
            state.verticalGroupingMode !== prevState.verticalGroupingMode ||
            state.collapsedCategories !== prevState.collapsedCategories ||
            state.collapsedSidebarZones !== prevState.collapsedSidebarZones ||
            state.isMinimized !== prevState.isMinimized ||
            state.minimizeHotkey !== prevState.minimizeHotkey) {
          try {
            chrome.storage.local.set({
              layoutMode: state.layoutMode,
              verticalGroupingMode: state.verticalGroupingMode,
              collapsedCategories: state.collapsedCategories,
              collapsedSidebarZones: state.collapsedSidebarZones,
              isMinimized: state.isMinimized,
              minimizeHotkey: state.minimizeHotkey
            }, () => {
              if (chrome.runtime.lastError) return; // Ignore errors
            });
          } catch (err) {
            // Extension context invalidated
          }
        }
      }
    });

    // Phase 1: Initialize connection
    connectWebSocket();

    // Hotkeys
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid triggering hotkeys when typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const store = useTrackerStore.getState();

      // Minimal Chest HUD: Close chest on E or Escape
      if (store.isChestOpen && (e.key === 'e' || e.key === 'E' || e.key === 'Escape')) {
        store.setIsChestOpen(false);
        return;
      }

      // Ctrl + Shift + D: Toggle Debug Panel (Requires Developer Mode)
      if (store.developerMode && e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        store.toggleDebugPanel();
        return;
      }

      // Alt + Shift + D: Reviewer Force Overlay (Bypass Login)
      if (!e.ctrlKey && e.altKey && e.shiftKey && e.code === 'KeyD') {
        e.preventDefault();
        const newState = !store.devForceOverlay;
        store.setDevForceOverlay(newState);
        
        if (newState) {
          store.setConnected(true);
          store.setIsMinimized(false); // Open the main UI immediately for the reviewer
          // Mark all tutorials as completed to bypass splashes
          store.setFirstTimeWizardCompleted(true);
          store.updateNotificationSettings({ tutorialCompleted: true, tutorialStep: -1 });
        }
        return;
      }
      
      // Ctrl + Shift + T: Mock Tessa Dialogue Translation
      if (store.developerMode && e.ctrlKey && e.shiftKey && e.code === 'KeyT') {
        e.preventDefault();
        store.setCurrentNpcDialogue({
          speaker: 'Tessa',
          originalText: "I swear, for every log I chop, two more show up behind me. Either someone's sneaking in extra work... or the forest is growing out of spite.",
          translatedText: "¡Lo juro, por cada tronco que corto, aparecen dos más detrás de mí. O alguien está haciendo trabajo extra a escondidas... o el bosque está creciendo por despecho!" // Spanish
        });
        // Clear after 6 seconds
        setTimeout(() => store.setCurrentNpcDialogue(null), 6000);
        return;
      }

      // Ctrl + Shift + Y: Mock Finn Dialogue Translation
      if (store.developerMode && e.ctrlKey && e.shiftKey && e.code === 'KeyY') {
        e.preventDefault();
        store.setCurrentNpcDialogue({
          speaker: 'Finn',
          originalText: "Shhh! I am hiding from the others. If they find me, I have to be the slime again!",
          translatedText: "¡Shhh! Me estoy escondiendo de los demás. ¡Si me encuentran, tendré que ser el limo de nuevo!" // Spanish
        });
        // Clear after 5 seconds
        setTimeout(() => store.setCurrentNpcDialogue(null), 5000);
        return;
      }
      
      const checkHotkey = (hotkeyStr: string | undefined, defaultKey: string) => {
        const str = hotkeyStr || defaultKey;
        const parts = str.toUpperCase().split('+');
        const needsCtrl = parts.includes('CTRL');
        const needsShift = parts.includes('SHIFT');
        const needsAlt = parts.includes('ALT');
        const needsMeta = parts.includes('META');
        const keyPart = parts[parts.length - 1]; // e.g. "M" or "SPACE" or "KEYM"

        let keyMatches = false;
        if (keyPart === 'SPACE') {
          keyMatches = e.code === 'Space';
        } else if (keyPart.length === 1) {
          const isDigit = /^[0-9]$/.test(keyPart);
          keyMatches = e.code === (isDigit ? `Digit${keyPart}` : `Key${keyPart}`) || e.key.toUpperCase() === keyPart;
        } else {
          keyMatches = e.code.toUpperCase() === keyPart || e.key.toUpperCase() === keyPart;
        }
        
        return e.ctrlKey === needsCtrl && e.shiftKey === needsShift && e.altKey === needsAlt && e.metaKey === needsMeta && keyMatches;
      };

      if (checkHotkey(store.minimizeHotkey, 'Ctrl+Shift+M')) {
        e.preventDefault();
        store.setIsMinimized(!store.isMinimized);
      }
      
      if (checkHotkey(store.toggleLayoutHotkey, 'Shift+H')) {
        e.preventDefault();
        store.setLayoutMode(store.layoutMode === 'vertical' ? 'horizontal' : 'vertical');
      }

      if (checkHotkey(store.resetSizeHotkey, 'Shift+R')) {
        e.preventDefault();
        // Reset everything
        store.setOverlayPosition({ x: 0, y: 0 });
        store.setOrbPosition({ x: 16, y: 16 });
        // Popped out windows positions
        Object.values(store.poppedOutWindows).forEach((win: any) => {
          store.updatePoppedOutWindow(win.id, { x: 50, y: 50, width: undefined, height: undefined });
        });
      }

      if (checkHotkey(store.lockUiHotkey, 'Shift+U')) {
        e.preventDefault();
        store.setIsUILocked(!store.isUILocked);
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown, true);
      disconnectWebSocket();
    };
  }, []);

  useEffect(() => {
    // Wait for Zustand persist hydration to finish before rendering UI
    const unsubHydrate = useTrackerStore.persist.onFinishHydration(() => setIsHydrated(true));
    setIsHydrated(useTrackerStore.persist.hasHydrated());
    return () => {
      unsubHydrate();
    };
  }, []);

  if (!isHydrated) return null;

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      <OverlayContainer />
    </div>
  );
}

export default App;
