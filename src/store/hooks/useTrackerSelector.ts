/**
 * @file useTrackerSelector.ts
 * @description Strongly-typed Zustand store selector hooks for TrackerState.
 * Prevents unnecessary component re-renders by selecting isolated state properties.
 */

import { useTrackerStore } from '../trackerStore';
import { TrackerState } from '../types';
import { useShallow } from 'zustand/react/shallow';

export const usePlayerPosition = () => useTrackerStore(useShallow((s: TrackerState) => s.playerPosition));
export const usePlayerZone = () => useTrackerStore((s: TrackerState) => s.playerZone);
export const useEnemies = () => useTrackerStore(useShallow((s: TrackerState) => s.enemies));
export const useTimers = () => useTrackerStore(useShallow((s: TrackerState) => s.timers));
export const useResources = () => useTrackerStore(useShallow((s: TrackerState) => s.resources));
export const useChestInventory = () => useTrackerStore(useShallow((s: TrackerState) => s.chestInventory));
export const useRunHistory = () => useTrackerStore(useShallow((s: TrackerState) => s.runHistory));
export const useLifetimeStats = () => useTrackerStore(useShallow((s: TrackerState) => s.lifetimeStats));
export const useQuests = () => useTrackerStore(useShallow((s: TrackerState) => s.quests));
export const useWeapon = () => useTrackerStore(useShallow((s: TrackerState) => s.weapon));
export const useArmor = () => useTrackerStore(useShallow((s: TrackerState) => s.armor));
export const useCustomMarkers = () => useTrackerStore(useShallow((s: TrackerState) => s.customMarkers));
export const useExploredPoints = () => useTrackerStore(useShallow((s: TrackerState) => s.exploredPoints));
export const useActiveWaypoint = () => useTrackerStore(useShallow((s: TrackerState) => s.activeWaypoint));
export const useLoot = () => useTrackerStore(useShallow((s: TrackerState) => s.loot));
export const useOnlinePlayers = () => useTrackerStore(useShallow((s: TrackerState) => s.onlinePlayers));
export const usePlayerProfile = () => useTrackerStore(useShallow((s: TrackerState) => s.playerProfile));
export const usePendingDeathDrop = () => useTrackerStore(useShallow((s: TrackerState) => s.pendingDeathDrop));
export const useCurrentZone = () => useTrackerStore((s: TrackerState) => s.currentZone);
export const useIsChestOpen = () => useTrackerStore((s: TrackerState) => s.isChestOpen);
export const useSessionActive = () => useTrackerStore((s: TrackerState) => s.sessionActive);
export const useChestTotalValue = () => useTrackerStore((s: TrackerState) => s.chestTotalValue);
export const useSessionRunes = () => useTrackerStore(useShallow((s: TrackerState) => s.sessionRunes));
export const useSlotDurabilities = () => useTrackerStore(useShallow((s: TrackerState) => s.slotDurabilities));
