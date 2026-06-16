import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { TrackerState } from './storeTypes';
import { createUISlice } from './slices/uiSlice';
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
      ...createUISlice(...a),
      ...createSessionSlice(...a),
      ...createPlayerSlice(...a),
      ...createEntitySlice(...a),
    }),
    {
      name: 'roedex-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      merge: (persistedState: any, currentState) => {
        // MIGRATION: Remove old hardcoded horizontal height defaults if they exactly match the old seeded values.
        // This ensures existing users get the new smart 250px scrollbar natively without having to clear cache.
        if (persistedState?.tabDimensions) {
          const dims = persistedState.tabDimensions;
          if (dims['session_horizontal']?.height === 450) delete dims['session_horizontal'].height;
          if (dims['settings_horizontal']?.height === 500) delete dims['settings_horizontal'].height;
          if (dims['npcs_horizontal']?.height === 450) delete dims['npcs_horizontal'].height;
          if (dims['quests_horizontal']?.height === 400) delete dims['quests_horizontal'].height;
        }

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

        // Ensure default positions are separated
        const notifSettings = {
          ...currentState.notificationSettings,
          ...(persistedState?.notificationSettings || {})
        };
        
        if (!notifSettings.v4PositionMigrated) {
          notifSettings.position = 'top-left';
          notifSettings.v4PositionMigrated = true;
          if (persistedState) {
            persistedState.overlayPosition = { x: 20, y: 80 };
            persistedState.orbPosition = { x: 50, y: 16 };
            persistedState.bobPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 80 : 800, y: 220 };
          }
        }
        
        if (!notifSettings.v5PositionMigrated) {
          notifSettings.v5PositionMigrated = true;
          if (persistedState) {
            persistedState.overlayPosition = { x: 20, y: 80 };
          }
        }
        
        if (!notifSettings.v10PositionsMigrated) {
          notifSettings.v10PositionsMigrated = true;
          if (persistedState) {
            persistedState.overlayPosition = { x: 20, y: 150 };
            persistedState.orbPosition = { x: 20, y: 100 };
            persistedState.bobPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 320 : 800, y: 30 };
          }
        }
        
        if (!notifSettings.v11PositionsMigrated) {
          notifSettings.v11PositionsMigrated = true;
          if (persistedState) {
            persistedState.bobPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 320 : 800, y: 120 };
          }
        }
        
        if (!notifSettings.v6ToastMigrated) {
          notifSettings.v6ToastMigrated = true;
          notifSettings.position = 'top-center';
          notifSettings.scale = 0.9;
        }

        if (!notifSettings.v8ToastTopCenter) {
          notifSettings.v8ToastTopCenter = true;
          notifSettings.position = 'top-center';
        }

        const weaponSettings = {
          ...currentState.weaponUISettings,
          ...(persistedState?.weaponUISettings || {})
        };

        if (!weaponSettings.v7WeaponPositionMigrated) {
          weaponSettings.v7WeaponPositionMigrated = true;
          weaponSettings.position = 'bottom-center';
        }

        if (!weaponSettings.v9WeaponLayoutMigrated) {
          weaponSettings.v9WeaponLayoutMigrated = true;
          weaponSettings.layout = 'vertical';
          weaponSettings.width = 20;
          weaponSettings.height = 100;
        }

        const armorSettings = {
          ...currentState.armorUISettings,
          ...(persistedState?.armorUISettings || {})
        };

        if (!armorSettings.v9ArmorLayoutMigrated) {
          armorSettings.v9ArmorLayoutMigrated = true;
          armorSettings.layout = 'vertical';
          armorSettings.width = 20;
          armorSettings.height = 100;
        }

        return {
          ...currentState,
          ...persistedState,
          notificationSettings: notifSettings,
          weaponUISettings: weaponSettings,
          armorUISettings: armorSettings,
          tableSettings: {
            ...currentState.tableSettings,
            ...(persistedState?.tableSettings || {})
          },
          chestWidgetPositions: {
            ...currentState.chestWidgetPositions,
            ...(persistedState?.chestWidgetPositions || {})
          }
        };
      },
      partialize: (state) => ({
        // UI settings
        activeCompanion: state.activeCompanion,
        poppedOutWindows: state.poppedOutWindows,
        activeTab: state.activeTab,
        tabDimensions: state.tabDimensions,
        collapsedCategories: state.collapsedCategories,
        collapsedSidebarZones: state.collapsedSidebarZones,
        isMinimized: state.isMinimized,
        layoutMode: state.layoutMode,
        verticalGroupingMode: state.verticalGroupingMode,
        overlayPosition: state.overlayPosition,
        orbPosition: state.orbPosition,
        bobPosition: state.bobPosition,
        orbBorderThickness: state.orbBorderThickness,
        developerMode: state.developerMode,
        autoMinimizeOnChest: state.autoMinimizeOnChest,
        displayDensity: state.displayDensity,
        displayMode: state.displayMode,
        categoryOrder: state.categoryOrder,
        tableSettings: state.tableSettings,
        activeOpacity: state.activeOpacity,
        idleOpacity: state.idleOpacity,
        lootOpacity: state.lootOpacity,
        notificationSettings: state.notificationSettings,
        weaponUISettings: state.weaponUISettings,
        armorUISettings: state.armorUISettings,
        orbSize: state.orbSize,
        favorites: state.favorites,
        theme: state.theme,
        minimizedIcon: state.minimizedIcon,
        minimizedIconUrl: state.minimizedIconUrl,
        minimizeHotkey: state.minimizeHotkey,
        language: state.language,
        minimalChestHud: state.minimalChestHud,
        minimalChestHudLocked: state.minimalChestHudLocked,
        minimalChestTutorialSeen: state.minimalChestTutorialSeen,
        globalScale: state.globalScale,
        chestWidgetPositions: state.chestWidgetPositions,
        firstTimeWizardCompleted: state.firstTimeWizardCompleted,
        
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
        playerProfile: state.playerProfile,
        lifetimeStats: state.lifetimeStats
      }),
    }
  )
);
