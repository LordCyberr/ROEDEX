import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TrackerState } from './storeTypes';
import { createSessionSlice } from './slices/sessionSlice';
import { createPlayerSlice } from './slices/playerSlice';
import { createEntitySlice } from './slices/entitySlice';

import { createErrorLogSlice } from './slices/errorLogSlice';
import { createMapSlice } from './slices/mapSlice';
import { createMarketSlice } from './slices/marketSlice';
import { createIndexedDBStorage } from './indexedDBStorage';

// Lazy-loaded from public/defaultTrails.json (removed from main bundle = ~97KB savings)
// Must use chrome.runtime.getURL in extension context — relative paths don't resolve.
let _cachedDefaultTrails: Record<string, string> = {};
void fetch(typeof chrome !== 'undefined' && chrome.runtime?.getURL
  ? chrome.runtime.getURL('defaultTrails.json')
  : '/defaultTrails.json')
  .then((r) => r.json())
  .then((data: Record<string, string>) => { _cachedDefaultTrails = data; })
  .catch(() => { console.warn('[ROEDEX] Could not load defaultTrails.json'); });

// Export the types for components to use
export * from './storeTypes';
export * from '../types/events';

const TRACKER_STORAGE_KEY = 'roedex-storage';

// Shared IndexedDB storage — same implementation as settingsStore and analyticsStore
const indexedDBStorage = createIndexedDBStorage('roedex-db', 5000, TRACKER_STORAGE_KEY);

// Flush pending write on tab close so we don't lose state to the 5s debounce
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    indexedDBStorage.flushPending();
  });
}

/** Wipes all persisted state from both stores and reloads. Used by the Reset button. */
export const clearAllStorageAndReload = async () => {
  // Clear localStorage fallbacks
  localStorage.removeItem(TRACKER_STORAGE_KEY);
  localStorage.removeItem('roedex-settings-storage');

  // Clear trackerStore IndexedDB
  try {
    await indexedDBStorage.removeItem(TRACKER_STORAGE_KEY);
  } catch (_) {}

  // Clear settingsStore IndexedDB (separate DB)
  try {
    await new Promise<void>((resolve) => {
      const req = indexedDB.open('roedex-settings-db', 1);
      req.onsuccess = () => {
        const del = req.result.transaction('keyval', 'readwrite')
          .objectStore('keyval').delete('roedex-settings-storage');
        del.onsuccess = () => resolve();
        del.onerror = () => resolve();
      };
      req.onerror = () => resolve();
    });
  } catch (_) {}

  setTimeout(() => window.location.reload(), 50);
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (...a) => ({
      ...createSessionSlice(...a),
      ...createPlayerSlice(...a),
      ...createEntitySlice(...a),
      ...createErrorLogSlice(...a),
      ...createMapSlice(...a),
      ...createMarketSlice(...a),
    }),
    {
      name: 'roedex-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      merge: (persistedState: any, currentState) => {
        // MIGRATION: Fix tree classification bug where trees were logged as plants
        if (persistedState?.lifetimeStats?.plantsHarvested) {
          const plants = persistedState.lifetimeStats.plantsHarvested;
          const trees = persistedState.lifetimeStats.treesCut || {};
          let modified = false;

          for (const [key, value] of Object.entries(plants)) {
            const kLow = key.toLowerCase();
            if (kLow.includes('tree') || kLow.includes('wood') || kLow.includes('log') || kLow.includes('oak') || kLow.includes('cinder') || kLow.includes('leaf') || kLow.includes('pine') || kLow.includes('palm')) {
              trees[key] = (trees[key] || 0) + (value as number);
              delete plants[key];
              modified = true;
            }
          }
          if (modified) {
            persistedState.lifetimeStats.treesCut = trees;
            persistedState.lifetimeStats.plantsHarvested = plants;
          }
        }

        // CRITICAL: Deep-merge lifetimeStats with defaults so any field added
        // in a newer version (e.g. itemsLooted) is never undefined after rehydration.
        // Without this, Object.values(undefined) throws and causes React Error #185.
        const defaultLifetimeStats = {
          mobsKilled: {},
          oresMined: {},
          treesCut: {},
          plantsHarvested: {},
          itemsLooted: {}
        };
        const mergedLifetimeStats = {
          ...defaultLifetimeStats,
          ...(persistedState?.lifetimeStats || {}),
        };

        const defaultMapSettings = {
          enabled: true,
          isRecordingTrail: false,
          isEraserMode: false,
          trails: {},
          borderless: false,
          mapSize: 200,
          edgeGlow: true,
          crtGlitch: true,
          showCommon: true,
          showUncommon: true,
          showRare: true,
          showMythical: true,
          showOres: true,
          showTrees: true,
          showPlants: true,
          showResources: true,
          showDrops: true,
          hiddenMobs: [],
          hiddenResources: [],
          autoRecenter: true,
          autoRecenterDelay: 10,
          mapRefreshRate: 'uncapped',
          mapTheme: 'glass',
          defaultZoom: 10.0,
        };
        let mergedMapSettings = {
          ...defaultMapSettings,
          ...(persistedState?.mapSettings || {}),
        };

        // MIGRATION v12: Reset broken {x:0, y:0} minimap position that caused the minimap
        // to spawn hidden behind the health bar on fresh installs and after the overflow-hidden
        // OverlayContainer bug was introduced. {0,0} is never a valid intentional position.
        if (!persistedState?.v12MinimapPositionMigrated &&
            mergedMapSettings.mapPosition?.x === 0 &&
            mergedMapSettings.mapPosition?.y === 0) {
          mergedMapSettings = {
            ...mergedMapSettings,
            mapPosition: { x: 700, y: 60 },
            mapSize: 200,
          };
        }

        // Use cached default trails (pre-fetched at module load time)
        const mergedTrails: Record<string, string> = { ..._cachedDefaultTrails };
        const userTrails = persistedState?.trails || {};
        
        // MIGRATION: Fix accidental mapping of Maze (30572 len) to Mines
        if (userTrails['Mines'] && userTrails['Mines'].length === 30572) {
          delete userTrails['Mines'];
        }

        for (const [zone, userTrailStr] of Object.entries(userTrails)) {
          // If the user's saved trail is longer than the default trail, it means they've added new points.
          // Otherwise, we keep the default (which is massive and pre-explored).
          // We cast userTrailStr to string to ensure we can check length.
          if (!mergedTrails[zone] || (typeof userTrailStr === 'string' && userTrailStr.length > mergedTrails[zone].length)) {
            mergedTrails[zone] = userTrailStr as string;
          }
        }

        return {
          ...currentState,
          ...persistedState,
          v12MinimapPositionMigrated: true,
          lifetimeStats: mergedLifetimeStats,
          mapSettings: mergedMapSettings,
          trails: mergedTrails,
        };
      },
      partialize: (state) => ({
        // Session state
        sessionActive: state.sessionActive,
        sessionPlayerName: state.sessionPlayerName,
        zoneGraph: state.zoneGraph,
        sessionStartTime: state.sessionStartTime,
        sessionRunes: state.sessionRunes,
        sessionLoot: state.sessionLoot,
        chestTotalValue: state.chestTotalValue,
        sessionMobsKilled: state.sessionMobsKilled,
        sessionTreesCut: state.sessionTreesCut,
        sessionOresMined: state.sessionOresMined,
        sessionPlantsHarvested: state.sessionPlantsHarvested,
        sessionZonesVisited: state.sessionZonesVisited,
        runHistory: state.runHistory,
        sessionSettings: state.sessionSettings,
        
        // Persist entities
        timers: state.timers,
        
        // Persist profile and stats
        playerProfile: state.playerProfile,
        
        // Persist lifetime stats
        lifetimeStats: state.lifetimeStats,
        mapSettings: state.mapSettings,
        trails: state.trails,
        v12MinimapPositionMigrated: (state as any).v12MinimapPositionMigrated,
        customZones: state.customZones,
        
        // Persist market data
        marketSales: state.marketSales,
        marketEthUsd: state.marketEthUsd,
        marketEthUsdUpdatedAt: state.marketEthUsdUpdatedAt,
      }),
    }
  )
);
