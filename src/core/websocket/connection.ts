import { parsePacket } from '../parser';
import { useTrackerStore } from '../../store/trackerStore';

export function connectWebSocket() {
  console.log('[ROEDEX] Content Script listening for Interceptor data...');
  
  window.addEventListener('message', (event) => {
    // Only accept messages from the interceptor
    if (event.data?.source !== 'ROEDEX_INTERCEPTOR') return;

    if (event.data.type === 'WS_OPEN') {
      useTrackerStore.getState().setConnected(true);
    } 
    else if (event.data.type === 'WS_CLOSE') {
      useTrackerStore.getState().setConnected(false);
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
  // Not much to do here since we rely on the interceptor, 
  // but we could set connected to false
  useTrackerStore.getState().setConnected(false);
}
