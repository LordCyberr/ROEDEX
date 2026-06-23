import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TrackerState } from './storeTypes';
import { createSessionSlice } from './slices/sessionSlice';
import { createPlayerSlice } from './slices/playerSlice';
import { createEntitySlice } from './slices/entitySlice';

// Export the types for components to use
export * from './storeTypes';
export * from '../types/events';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('roedex-db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('keyval');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

let writeTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingValue: string | null = null;
let isErasing = false;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (isErasing) return;
    if (pendingValue) {
      try { localStorage.setItem('roedex-storage', pendingValue); } catch(e) {}
    }
  });
}

export const clearAllStorageAndReload = async () => {
  isErasing = true;
  pendingValue = null;
  localStorage.removeItem('roedex-storage');
  try {
    indexedDB.deleteDatabase('roedex-db');
  } catch(e) {}
  window.location.reload();
};

const originalSetItem = async (name: string, value: string): Promise<void> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('keyval', 'readwrite');
      const store = transaction.objectStore('keyval');
      const request = store.put(value, name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn('[ROEDEX] IndexedDB set failed, falling back to localStorage', e);
    localStorage.setItem(name, value);
  }
};

const debouncedSetItem = async (name: string, value: string): Promise<void> => {
  pendingValue = value;
  if (writeTimeout) return;
  writeTimeout = setTimeout(async () => {
    writeTimeout = null;
    if (pendingValue) {
      await originalSetItem(name, pendingValue);
      pendingValue = null;
    }
  }, 5000);
};

const indexedDBStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('keyval', 'readonly');
        const store = transaction.objectStore('keyval');
        const request = store.get(name);
        request.onsuccess = () => {
          const result = (request.result as string) || null;
          const lsValue = localStorage.getItem(name);
          
          // If there's a recent emergency save in localStorage from beforeunload, prioritize it
          if (lsValue) {
            localStorage.removeItem(name); // Clear it so we don't accidentally use it on later loads
            resolve(lsValue);
          } else {
            resolve(result);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('[ROEDEX] IndexedDB get failed, falling back to localStorage', e);
      return localStorage.getItem(name);
    }
  },
  setItem: debouncedSetItem,
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('keyval', 'readwrite');
        const store = transaction.objectStore('keyval');
        const request = store.delete(name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('[ROEDEX] IndexedDB remove failed, falling back to localStorage', e);
      localStorage.removeItem(name);
    }
  },
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (...a) => ({
      ...createSessionSlice(...a),
      ...createPlayerSlice(...a),
      ...createEntitySlice(...a),
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
            if (kLow.includes('tree') || kLow.includes('wood') || kLow.includes('log') || kLow.includes('oak') || kLow.includes('pine') || kLow.includes('palm')) {
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

        return {
          ...currentState,
          ...persistedState,
        };
      },
      partialize: (state) => ({
        // Session state
        sessionActive: state.sessionActive,
        sessionPlayerName: state.sessionPlayerName,
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
        playerProfile: state.playerProfile
      }),
    }
  )
);
