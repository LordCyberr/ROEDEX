import { parsePacket } from '../parser';
import { useTrackerStore } from '../../store/trackerStore';

export function connectWebSocket() {
  console.log('[ROEDEX] Content Script listening for Interceptor data...');
  
  // Always minimize on reload/restart
  setTimeout(() => {
    const state = useTrackerStore.getState();
    state.setIsMinimized(true);
    Object.keys(state.poppedOutWindows).forEach(id => {
      state.updatePoppedOutWindow(id, { isMinimized: true });
    });
  }, 100);
  
  window.addEventListener('message', (event) => {
    // Only accept messages from the interceptor
    if (event.data?.source !== 'ROEDEX_INTERCEPTOR') return;

    if (event.data.type === 'WS_OPEN') {
      const state = useTrackerStore.getState();
      state.setConnected(true);
      state.setIsMinimized(true);
      Object.keys(state.poppedOutWindows).forEach(id => {
        state.updatePoppedOutWindow(id, { isMinimized: true });
      });
    } 
    else if (event.data.type === 'WS_CLOSE') {
      const state = useTrackerStore.getState();
      state.setConnected(false);
      state.setIsMinimized(true);
      Object.keys(state.poppedOutWindows).forEach(id => {
        state.updatePoppedOutWindow(id, { isMinimized: true });
      });
    }
    else if (event.data.type === 'WS_MESSAGE' || event.data.type === 'WS_MESSAGE_SEND') {
      const rawMessage = event.data.data;
      
      // If we are still connected, assume yes if we get a message
      if (!useTrackerStore.getState().connected) {
        useTrackerStore.getState().setConnected(true);
      }

      parsePacket(rawMessage);
    }
  });
}

export function disconnectWebSocket() {
  const state = useTrackerStore.getState();
  state.setConnected(false);
  state.setIsMinimized(true);
  Object.keys(state.poppedOutWindows).forEach(id => {
    state.updatePoppedOutWindow(id, { isMinimized: true });
  });
}
