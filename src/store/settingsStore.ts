import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UISlice } from './storeTypes';
import { createUISlice } from './slices/uiSlice';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('roedex-settings-db', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('keyval');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
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
    console.warn('[ROEDEX] Settings IndexedDB set failed, falling back to localStorage', e);
    localStorage.setItem(name, value);
  }
};

let writeTimeout: ReturnType<typeof setTimeout> | null = null;
let pendingValue: string | null = null;

const debouncedSetItem = async (name: string, value: string): Promise<void> => {
  pendingValue = value;
  if (writeTimeout) return;
  writeTimeout = setTimeout(async () => {
    writeTimeout = null;
    if (pendingValue) {
      await originalSetItem(name, pendingValue);
      pendingValue = null;
    }
  }, 1000);
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
          resolve(result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
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
      localStorage.removeItem(name);
    }
  },
};

export const useSettingsStore = create<UISlice>()(
  persist(
    (...a: any[]) => ({
      ...createUISlice(...(a as [any, any, any])),
    }),
    {
      name: 'roedex-settings-storage',
      storage: createJSONStorage(() => indexedDBStorage),
      merge: (persistedState: any, currentState) => {
        if (persistedState?.tabDimensions) {
          const dims = persistedState.tabDimensions;
          if (dims['session_horizontal']?.height === 450) delete dims['session_horizontal'].height;
          if (dims['settings_horizontal']?.height === 500) delete dims['settings_horizontal'].height;
          if (dims['npcs_horizontal']?.height === 450) delete dims['npcs_horizontal'].height;
          if (dims['quests_horizontal']?.height === 400) delete dims['quests_horizontal'].height;

          // Clear old vertical default widths so users get the new 220px default
          if (dims['session_vertical']?.width === 300) delete dims['session_vertical'].width;
          if (dims['settings_vertical']?.width === 340) delete dims['settings_vertical'].width;
          if (dims['npcs_vertical']?.width === 300) delete dims['npcs_vertical'].width;
          if (dims['quests_vertical']?.width === 300) delete dims['quests_vertical'].width;
        }

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
            persistedState.companionPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 80 : 800, y: 220 };
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
            persistedState.companionPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 320 : 800, y: 30 };
          }
        }
        
        if (!notifSettings.v11PositionsMigrated) {
          notifSettings.v11PositionsMigrated = true;
          if (persistedState) {
            persistedState.companionPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 320 : 800, y: 120 };
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

        if (!notifSettings.v12NotifDefaultsMigrated) {
          notifSettings.v12NotifDefaultsMigrated = true;
          notifSettings.toastShape = 'rectangle';
          notifSettings.neonGlow = true;
          notifSettings.width = 300;
          notifSettings.height = 70;
          notifSettings.scale = 1.0;
          notifSettings.opacity = 1.0;
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

        if (!weaponSettings.v12WeaponDefaultsMigrated) {
          weaponSettings.v12WeaponDefaultsMigrated = true;
          weaponSettings.position = 'bottom-center';
          weaponSettings.layout = 'horizontal';
          weaponSettings.width = 174;
          weaponSettings.height = 7;
          weaponSettings.style = 'bar_percent';
        }

        if (!weaponSettings.v13WeaponDefaultsMigrated) {
          weaponSettings.v13WeaponDefaultsMigrated = true;
          weaponSettings.height = 24;
        }

        const armorSettings = {
          ...currentState.armorUISettings,
          ...(persistedState?.armorUISettings || {})
        };

        if (!armorSettings.v12ArmorDefaultsMigrated) {
          armorSettings.v12ArmorDefaultsMigrated = true;
          armorSettings.position = 'bottom-right';
          armorSettings.layout = 'vertical';
          armorSettings.width = 7;
          armorSettings.height = 174;
          armorSettings.style = 'bar_percent';
        }

        if (!armorSettings.v13ArmorDefaultsMigrated) {
          armorSettings.v13ArmorDefaultsMigrated = true;
          armorSettings.width = 50;
          armorSettings.height = 38;
        }

        const mergedChestWidgetPositions = {
          ...currentState.chestWidgetPositions,
          ...(persistedState?.chestWidgetPositions || {})
        };
        
        if (persistedState?.chestWidgetPositions) {
          mergedChestWidgetPositions.inventory = {
            ...currentState.chestWidgetPositions.inventory,
            ...(persistedState.chestWidgetPositions.inventory || {})
          };
          mergedChestWidgetPositions.chest = {
            ...currentState.chestWidgetPositions.chest,
            ...(persistedState.chestWidgetPositions.chest || {})
          };
          mergedChestWidgetPositions.closeZone = {
            ...currentState.chestWidgetPositions.closeZone,
            ...(persistedState.chestWidgetPositions.closeZone || {})
          };
        }

        const mergedOverlayPosition = {
          ...currentState.overlayPosition,
          ...(persistedState?.overlayPosition || {})
        };

        const mergedOrbPosition = {
          ...currentState.orbPosition,
          ...(persistedState?.orbPosition || {})
        };

        const mergedCompanionPosition = {
          ...currentState.companionPosition,
          ...(persistedState?.companionPosition || {})
        };

        return {
          ...currentState,
          ...persistedState,
          notificationSettings: notifSettings,
          weaponUISettings: weaponSettings,
          armorUISettings: armorSettings,
          chestWidgetPositions: mergedChestWidgetPositions,
          overlayPosition: mergedOverlayPosition,
          orbPosition: mergedOrbPosition,
          companionPosition: mergedCompanionPosition,
        };
      }
    }
  )
);
