import { useState, useEffect } from 'react';
import { useTrackerStore } from '../store/trackerStore';
import { useSettingsStore } from '../store/settingsStore';

export function useThrottledEntities(throttleMs = 300) {
  const [state, setState] = useState(() => {
    const { enemies, resources, timers, throttledPlayerPosition, loot } = useTrackerStore.getState();
    return { enemies, resources, timers, throttledPlayerPosition, loot };
  });

  useEffect(() => {
    let lastUpdate = Date.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsub = useTrackerStore.subscribe((currentState) => {
      const now = Date.now();
      const activeTab = useSettingsStore.getState().activeTab;
      const isTrackingTab = activeTab === 'global' || activeTab === 'favorites';
      const currentThrottleMs = document.hidden ? 2000 : (isTrackingTab ? throttleMs : 1500);
      
      const updateState = () => {
        setState({
          enemies: currentState.enemies,
          resources: currentState.resources,
          timers: currentState.timers,
          throttledPlayerPosition: currentState.throttledPlayerPosition,
          loot: currentState.loot
        });
        lastUpdate = Date.now();
      };

      if (now - lastUpdate > currentThrottleMs) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        updateState();
      } else {
        if (!timer) {
          timer = setTimeout(() => {
            updateState();
            timer = null;
          }, currentThrottleMs - (now - lastUpdate));
        }
      }
    });

    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, [throttleMs]);

  return state;
}
