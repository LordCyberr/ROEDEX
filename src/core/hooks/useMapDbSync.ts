import { useEffect, useRef } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { mapDb } from '../../db/mapDb';
import { flushTrailBuffer } from '../parser/handlers/statsHandler';

export function useMapDbSync() {
  const lastSavedZoneRef = useRef<string | null>(null);

  // Initial load — restore all zone trails from IndexedDB
  useEffect(() => {
    const loadFromDb = async () => {
      try {
        const records = await mapDb.exploredPaths.toArray();
        const store = useTrackerStore.getState();
        for (const record of records) {
          store.setExploredPointsForZone(record.zoneName, record.points);
        }
      } catch (err) {
        console.error('Failed to load map data from mapDb:', err);
      }
    };
    loadFromDb();
  }, []);

  // Sync to IndexedDB on changes — debounced 2s (was 5s)
  useEffect(() => {
    let timeout: number | null = null;

    const unsubscribe = useTrackerStore.subscribe((state, prevState) => {
      const currentZone = state.playerZone;
      if (!currentZone || currentZone === 'Unknown') return;

      const currentPoints = state.exploredPoints[currentZone];
      const prevPoints = prevState.exploredPoints[currentZone];

      if (currentPoints && currentPoints !== prevPoints) {
        if (timeout) clearTimeout(timeout);

        timeout = setTimeout(async () => {
          try {
            await mapDb.exploredPaths.put({
              zoneName: currentZone,
              points: currentPoints
            });
            lastSavedZoneRef.current = currentZone;
          } catch (err) {
            console.error('Failed to save map data to mapDb:', err);
          }
        }, 2000); // reduced from 5s to 2s
      }
    });

    // Flush on tab close to avoid losing the last 2 seconds of trail
    const handleUnload = () => {
      flushTrailBuffer();
      const state = useTrackerStore.getState();
      const zone = state.playerZone;
      if (!zone || zone === 'Unknown') return;
      const points = state.exploredPoints[zone];
      if (points && points.length > 0) {
        mapDb.exploredPaths.put({ zoneName: zone, points }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      unsubscribe();
      if (timeout) clearTimeout(timeout);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);
}

