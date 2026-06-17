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
      }

      // Ctrl + Shift + D: Toggle Debug Panel (Requires Developer Mode)
      if (store.developerMode && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        store.toggleDebugPanel();
      }

      // Ctrl + Shift + C: Developer Force Overlay (Bypass Login) (Requires Developer Mode)
      if (store.developerMode && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        const newState = !store.devForceOverlay;
        store.setDevForceOverlay(newState);
        
        if (newState) {
          store.setConnected(true);
          store.setIsMinimized(true);
          // Mark all tutorials as completed to bypass splashes
          store.setFirstTimeWizardCompleted(true);
          store.updateNotificationSettings({ tutorialCompleted: true, tutorialStep: -1 });
        }
      }
      
      // Parse the custom hotkey (e.g., 'Shift+Alt+C' or 'Ctrl+Shift+M')
      const hotkeyStr = store.minimizeHotkey || 'Ctrl+Shift+M';
      const parts = hotkeyStr.toLowerCase().split('+');
      const needsCtrl = parts.includes('ctrl');
      const needsShift = parts.includes('shift');
      const needsAlt = parts.includes('alt');
      const needsMeta = parts.includes('meta');
      const keyPart = parts[parts.length - 1];

      const keyMatches = e.key.toLowerCase() === keyPart || (e.key === ' ' && keyPart === 'space');

      // Check if Toggle Minimize/Maximize Hotkey is pressed
      if (e.ctrlKey === needsCtrl && e.shiftKey === needsShift && e.altKey === needsAlt && e.metaKey === needsMeta && keyMatches) {
        e.preventDefault();
        store.setIsMinimized(!store.isMinimized);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
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
