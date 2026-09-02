import { useState, useEffect, useRef } from 'react';
import { useTrackerStore } from '../store/trackerStore';
import { useSettingsStore } from '../store/settingsStore';

export function useThrottledEntities(throttleMs = 100) {
  const [state, setState] = useState(() => {
    const { enemies, resources, timers, throttledPlayerPosition, loot } = useTrackerStore.getState();
    return { enemies, resources, timers, throttledPlayerPosition, loot };
  });

  // Use a ref to always have latest throttleMs without re-subscribing
  const throttleMsRef = useRef(throttleMs);
  throttleMsRef.current = throttleMs;

  useEffect(() => {
    let lastUpdate = 0; // Force first update immediately
    let timer: ReturnType<typeof setTimeout> | null = null;

    const doUpdate = () => {
      // Always read FRESH state at flush time, not stale closure
      const fresh = useTrackerStore.getState();
      setState({
        enemies: fresh.enemies,
        resources: fresh.resources,
        timers: fresh.timers,
        throttledPlayerPosition: fresh.throttledPlayerPosition,
        loot: fresh.loot,
      });
      lastUpdate = Date.now();
      timer = null;
    };

    const unsub = useTrackerStore.subscribe(() => {
      const now = Date.now();
      const activeTab = useSettingsStore.getState().activeTab;
      const isTrackingTab = activeTab === 'global' || activeTab === 'favorites';
      const ms = document.hidden
        ? 2000
        : isTrackingTab
        ? throttleMsRef.current
        : 1500;

      const elapsed = now - lastUpdate;

      if (elapsed >= ms) {
        // Ready to update now — cancel any pending deferred update
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        doUpdate();
      } else if (!timer) {
        // Schedule a flush for the remaining window
        timer = setTimeout(doUpdate, ms - elapsed);
      }
    });

    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, []); // No deps — uses refs for throttleMs

  return state;
}
