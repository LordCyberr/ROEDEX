import { useState, useEffect } from 'react';
import { useTrackerStore } from '../store/trackerStore';

export function useThrottledEntities(throttleMs = 300) {
  const [state, setState] = useState(() => {
    const { enemies, resources, timers, throttledPlayerPosition } = useTrackerStore.getState();
    return { enemies, resources, timers, throttledPlayerPosition };
  });

  useEffect(() => {
    let lastUpdate = Date.now();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const unsub = useTrackerStore.subscribe((currentState) => {
      const now = Date.now();
      
      const updateState = () => {
        setState({
          enemies: currentState.enemies,
          resources: currentState.resources,
          timers: currentState.timers,
          throttledPlayerPosition: currentState.throttledPlayerPosition
        });
        lastUpdate = Date.now();
      };

      if (now - lastUpdate > throttleMs) {
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
          }, throttleMs - (now - lastUpdate));
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
