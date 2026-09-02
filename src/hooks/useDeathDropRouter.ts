import { useEffect, useRef } from 'react';
import { useTrackerStore } from '../store/trackerStore';
import { ZoneEntrances } from '../data/routing';

export function useDeathDropRouter() {
  const pendingDeathDrop = useTrackerStore(state => state.pendingDeathDrop);
  const currentZone = useTrackerStore(state => state.currentZone);
  const setActiveWaypoint = useTrackerStore(state => state.setActiveWaypoint);
  const activeWaypointName = useTrackerStore(state => state.activeWaypointName);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doRoute = (zone: string) => {
    if (!pendingDeathDrop) return;

    const deathZone = pendingDeathDrop.zone;

    const updateWaypoint = (pos: {x: number, y: number}, label: string, zoneName: string) => {
      if (activeWaypointName !== label) {
        setActiveWaypoint(pos, label, zoneName);
      }
    };

    if (zone === deathZone) {
      // Player is in the same zone as the death drop.
      const playerPos = useTrackerStore.getState().playerPosition;
      if (playerPos) {
        const dist = Math.hypot(playerPos.x - pendingDeathDrop.pos.x, playerPos.y - pendingDeathDrop.pos.y);
        if (dist < 15) {
          useTrackerStore.getState().setPendingDeathDrop(null);
          useTrackerStore.getState().setActiveWaypoint(null, null);
          return;
        }
      }
      updateWaypoint(
        pendingDeathDrop.pos,
        `Recover ${pendingDeathDrop.quantity} Runes`,
        zone
      );
    } else if (zone === 'House') {
      updateWaypoint(ZoneEntrances['House'].insideSide, 'Exit to Town', 'House');
    } else if (zone === 'Town') {
      if (deathZone === 'Mines' || deathZone === 'Lower Mines' || deathZone === 'MinesLower') {
        updateWaypoint(ZoneEntrances['Mines'].townSide, 'Enter Mines', 'Town');
      } else if (deathZone === 'Forest') {
        updateWaypoint(ZoneEntrances['Forest'].townSide, 'Enter Forest', 'Town');
      }
    } else if (zone === 'Mines' && deathZone === 'Forest') {
      updateWaypoint(ZoneEntrances['Mines'].insideSide, 'Return to Town', 'Mines');
    } else if (zone === 'Forest' && deathZone === 'Mines') {
      updateWaypoint(ZoneEntrances['Forest'].insideSide, 'Return to Town', 'Forest');
    } else {
      // Fallback: Unknown spawn zone — try to guide back to Town via any known exit
      const knownExit = ZoneEntrances[zone as keyof typeof ZoneEntrances];
      if (knownExit?.insideSide) {
        updateWaypoint(knownExit.insideSide, 'Return to Town', zone);
      }
    }
  };

  useEffect(() => {
    if (!pendingDeathDrop) return;
    doRoute(currentZone);
  }, [pendingDeathDrop, currentZone]);

  // Delayed retry: on death, the zone-change packet may arrive 200-500ms after the death event.
  // The first effect fire sees the OLD zone. This retry fires after the transition completes.
  useEffect(() => {
    if (!pendingDeathDrop) return;

    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    retryTimerRef.current = setTimeout(() => {
      const latestZone = useTrackerStore.getState().currentZone;
      doRoute(latestZone);
    }, 500);

    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [pendingDeathDrop]);
}
