import { parsePacket, resetParserState } from '../parser';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

import { NotificationManager } from '../notifications/NotificationManager';
import { AICompanion } from '../companion/AICompanion';

let packetInterval: ReturnType<typeof setInterval> | null = null;
let messageListener: ((event: MessageEvent) => void) | null = null;

export function connectWebSocket() {
  console.log('[ROEDEX] Content Script listening for Interceptor data...');
  let packetCount = 0;
  
  // Clear any existing connections to prevent duplicates
  disconnectWebSocket();

  // Always minimize on reload/restart
  setTimeout(() => {
    const settings = useSettingsStore.getState();
    settings.setIsMinimized(true);
    Object.keys(settings.poppedOutWindows).forEach(id => {
      settings.updatePoppedOutWindow(id, { isMinimized: true });
    });
  }, 100);
  
  messageListener = (event: MessageEvent) => {
    // Only accept messages from the interceptor
    if (event.data?.source !== 'ROEDEX_INTERCEPTOR') return;

    if (event.data.type === 'WS_OPEN') {
      const state = useTrackerStore.getState();
      const settings = useSettingsStore.getState();
      
      state.setConnected(true);
      settings.setIsMinimized(true);

      Object.keys(settings.poppedOutWindows).forEach(id => {
        settings.updatePoppedOutWindow(id, { isMinimized: true });
      });

      // Reset greeting flags so the next player packet triggers the boot sequence
      AICompanion.resetGreeting();
      NotificationManager.resetGreeting();
      resetParserState();
    } 
    else if (event.data.type === 'WS_CLOSE') {
      const state = useTrackerStore.getState();
      const settings = useSettingsStore.getState();
      state.setConnected(false);
      settings.setIsMinimized(true);
      Object.keys(settings.poppedOutWindows).forEach(id => {
        settings.updatePoppedOutWindow(id, { isMinimized: true });
      });
    }
    else if (event.data.type === 'WS_MESSAGE' || event.data.type === 'WS_MESSAGE_SEND') {
      const rawMessage = event.data.data;
      
      packetCount++;

      // If we are still connected, assume yes if we get a message
      if (!useTrackerStore.getState().connected) {
        useTrackerStore.getState().setConnected(true);
        const sessionName = useTrackerStore.getState().sessionPlayerName;
        if (sessionName && sessionName !== 'unknown') {
           AICompanion.greetUser(sessionName);
           NotificationManager.greetUser(sessionName);
        }
      }

      parsePacket(rawMessage);
    }
  };

  window.addEventListener('message', messageListener);

  // Track Packets Per Second
  packetInterval = setInterval(() => {
    // Only update the store if the debug panel is open to avoid unnecessary re-renders
    if (useSettingsStore.getState().isDebugPanelOpen) {
      useSettingsStore.getState().updateDebugStats(packetCount);
    }
    packetCount = 0;
  }, 1000);
}

export function disconnectWebSocket() {
  if (messageListener) {
    window.removeEventListener('message', messageListener);
    messageListener = null;
  }
  
  if (packetInterval) {
    clearInterval(packetInterval);
    packetInterval = null;
  }

  const state = useTrackerStore.getState();
  const settings = useSettingsStore.getState();
  state.setConnected(false);
  settings.setIsMinimized(true);
  Object.keys(settings.poppedOutWindows).forEach(id => {
    settings.updatePoppedOutWindow(id, { isMinimized: true });
  });
}
