import { parsePacket, resetParserState, parseTimeAggregator, initParserWorkerPort } from '../parser';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

import { NotificationManager } from '../notifications/NotificationManager';
import { AICompanion } from '../companion/AICompanion';

let packetInterval: ReturnType<typeof setInterval> | null = null;
let profilerInterval: ReturnType<typeof setInterval> | null = null;
let messageListener: ((event: MessageEvent) => void) | null = null;

export function connectWebSocket() {
  if (Boolean((import.meta as any).env?.DEV)) {
    console.log('[ROEDEX] Content Script listening for Interceptor data...');
  }
  let packetCount = 0;
  
  // Clear any existing connections to prevent duplicates
  disconnectWebSocket();

  // Create zero-latency pipeline between interceptor and parser worker
  const channel = new MessageChannel();
  initParserWorkerPort(channel.port2);
  window.postMessage({ type: 'ROEDEX_INIT_PORT', source: 'ROEDEX_EXTENSION' }, '*', [channel.port1]);

  // Always minimize on reload/restart
  setTimeout(() => {
    const settings = useSettingsStore.getState();
    settings.setIsMinimized(true);
    settings.minimizeAllPoppedOutWindows(true);
  }, 100);
  
  messageListener = (event: MessageEvent) => {
    // Only accept messages from the interceptor
    if (event.data?.source !== 'ROEDEX_INTERCEPTOR') return;

    if (event.data.type === 'WS_OPEN') {
      const state = useTrackerStore.getState();
      const settings = useSettingsStore.getState();
      
      state.setConnected(true);
      state.setIsLoadingZone(true);
      setTimeout(() => useTrackerStore.getState().setIsLoadingZone(false), 5000); // Wait 5 seconds for initial load
      
      settings.setIsMinimized(true);

      settings.minimizeAllPoppedOutWindows(true);

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
      settings.minimizeAllPoppedOutWindows(true);
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
    else if (event.data.type === 'WS_DROPPED_METRIC') {
      const currentMetrics = useSettingsStore.getState().profilerMetrics;
      useSettingsStore.getState().updateProfilerMetrics({
        parseTime: {
          ...currentMetrics.parseTime,
          droppedEvents: currentMetrics.parseTime.droppedEvents + event.data.count
        }
      });
    }
  };

  window.addEventListener('message', messageListener);

  // Track Packets Per Second
  packetInterval = setInterval(() => {
    if (packetCount > 70) {
      AICompanion.onPpsSpike(packetCount);
    }

    // Only update the store if the debug panel is open to avoid unnecessary re-renders
    if (useSettingsStore.getState().isDebugPanelOpen) {
      useSettingsStore.getState().updateDebugStats(packetCount);
    }
    packetCount = 0;
  }, 1000);

  // Sync profiler metrics every second, outside the hot parse path
  profilerInterval = setInterval(() => {
    const settings = useSettingsStore.getState();
    if (settings.isDebugPanelOpen && parseTimeAggregator.count > 0) {
      const avg = parseTimeAggregator.totalTime / parseTimeAggregator.count;
      settings.updateProfilerMetrics({
        parseTime: {
          average: Number(avg.toFixed(3)),
          max: Number(parseTimeAggregator.maxTime.toFixed(3)),
          lastSpike: Number(parseTimeAggregator.lastSpike.toFixed(3)),
          totalEvents: settings.profilerMetrics.parseTime.totalEvents + parseTimeAggregator.count,
          droppedEvents: settings.profilerMetrics.parseTime.droppedEvents
        }
      });
      parseTimeAggregator.count = 0;
      parseTimeAggregator.totalTime = 0;
      parseTimeAggregator.lastSpike = 0;
      parseTimeAggregator.maxTime = 0;
      parseTimeAggregator.lastSync = Date.now();
    }
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
  
  if (profilerInterval) {
    clearInterval(profilerInterval);
    profilerInterval = null;
  }

  const state = useTrackerStore.getState();
  const settings = useSettingsStore.getState();
  state.setConnected(false);
  settings.setIsMinimized(true);
  settings.minimizeAllPoppedOutWindows(true);
}
