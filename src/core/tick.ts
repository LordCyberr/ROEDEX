import { useState, useEffect } from 'react';
import { useTrackerStore } from '../store/trackerStore';
import { useSettingsStore } from '../store/settingsStore';

type TickCallback = (now: number) => void;
const listeners = new Set<TickCallback>();
let tickInterval: ReturnType<typeof setInterval> | null = null;

let tickCount = 0;

export function onTick(cb: TickCallback) {
  listeners.add(cb);
  if (!tickInterval) {
    tickInterval = setInterval(() => {
      const now = Date.now();
      listeners.forEach(cb => cb(now));
      
      tickCount++;
      if (tickCount >= 5) {
        tickCount = 0;
        const state = useTrackerStore.getState();
        const settings = useSettingsStore.getState();
        settings.updateProfilerMetrics({
          memory: {
            enemiesCount: Object.keys(state.enemies || {}).length,
            resourcesCount: Object.keys(state.resources || {}).length,
            poppedOutWindows: Object.keys(settings.poppedOutWindows || {}).length,
            lastUpdate: now
          }
        });
      }
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };
}

export function useGlobalTick() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    return onTick(setNow);
  }, []);
  return now;
}
