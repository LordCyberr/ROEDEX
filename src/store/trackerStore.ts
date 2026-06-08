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

const chromeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return localStorage.getItem(name);
    }
    return new Promise((resolve) => {
      chrome.storage.local.get([name], (result) => {
        resolve((result[name] as string) || null);
      });
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return localStorage.setItem(name, value);
    }
    return new Promise((resolve) => {
      chrome.storage.local.set({ [name]: value }, () => resolve());
    });
  },
  removeItem: async (name: string): Promise<void> => {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      return localStorage.removeItem(name);
    }
    return new Promise((resolve) => {
      chrome.storage.local.remove(name, () => resolve());
    });
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
      storage: createJSONStorage(() => chromeStorage),
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          notificationSettings: {
            ...currentState.notificationSettings,
            ...(persistedState?.notificationSettings || {})
          },
          weaponUISettings: {
            ...currentState.weaponUISettings,
            ...(persistedState?.weaponUISettings || {})
          },
          tableSettings: {
            ...currentState.tableSettings,
            ...(persistedState?.tableSettings || {})
          }
        };
      },
      partialize: (state) => ({
        // UI settings
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
        language: state.language,
        
        // Session state
        sessionActive: state.sessionActive,
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
        timers: state.timers
      }),
    }
  )
);
