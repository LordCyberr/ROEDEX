import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from './core/websocket/connection';
import { OverlayContainer } from './components/overlay/OverlayContainer';
import { useTrackerStore } from './store/trackerStore';

function App() {
  useEffect(() => {
    // Load persisted settings
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['layoutMode', 'verticalGroupingMode', 'collapsedCategories', 'collapsedSidebarZones', 'isMinimized'], (result) => {
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
      });
    }

    // Subscribe to store changes to persist them
    const unsubscribe = useTrackerStore.subscribe((state, prevState) => {
      if (chrome?.storage?.local) {
        if (state.layoutMode !== prevState.layoutMode || 
            state.verticalGroupingMode !== prevState.verticalGroupingMode ||
            state.collapsedCategories !== prevState.collapsedCategories ||
            state.collapsedSidebarZones !== prevState.collapsedSidebarZones ||
            state.isMinimized !== prevState.isMinimized) {
          chrome.storage.local.set({
            layoutMode: state.layoutMode,
            verticalGroupingMode: state.verticalGroupingMode,
            collapsedCategories: state.collapsedCategories,
            collapsedSidebarZones: state.collapsedSidebarZones,
            isMinimized: state.isMinimized
          });
        }
      }
    });

    // Phase 1: Initialize connection
    connectWebSocket();

    // Hotkey for Debug Panel (Ctrl + Shift + D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        useTrackerStore.getState().toggleDebugPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
      disconnectWebSocket();
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden">
      <OverlayContainer />
    </div>
  );
}

export default App;
