import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UISlice } from './storeTypes';
import { createUISlice } from './slices/uiSlice';
import { createIndexedDBStorage } from './indexedDBStorage';

const SETTINGS_KEY = 'roedex-settings-storage';

const indexedDBStorage = createIndexedDBStorage('roedex-settings-db', 1000, SETTINGS_KEY);



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

          // Clear fixed vertical heights so container auto-expands & auto-collapses naturally
          Object.keys(dims).forEach(key => {
            if (key.endsWith('_vertical')) {
              if (dims[key]?.width && dims[key].width >= 300) delete dims[key].width;
              if (dims[key]?.height) delete dims[key].height;
            }
          });
        }

        const notifSettings = {
          ...currentState.notificationSettings,
          ...(persistedState?.notificationSettings || {})
        };
        


        const weaponSettings = {
          ...currentState.weaponUISettings,
          ...(persistedState?.weaponUISettings || {})
        };



        const armorSettings = {
          ...currentState.armorUISettings,
          ...(persistedState?.armorUISettings || {})
        };

        const targetSettings = {
          ...currentState.targetUISettings,
          ...(persistedState?.targetUISettings || {})
        };

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

        const mergedMapSettings = {
          ...currentState.mapSettings,
          ...(persistedState?.mapSettings || {})
        };

        const mergedRecordingSettings = {
          ...currentState.recordingSettings,
          ...(persistedState?.recordingSettings || {})
        };

        return {
          ...currentState,
          ...persistedState,
          notificationSettings: notifSettings,
          weaponUISettings: weaponSettings,
          armorUISettings: armorSettings,
          targetUISettings: targetSettings,
          overlayPosition: mergedOverlayPosition,
          orbPosition: mergedOrbPosition,
          companionPosition: mergedCompanionPosition,
          mapSettings: mergedMapSettings,
          recordingSettings: mergedRecordingSettings,
        };
      }
    }
  )
);

// Sync companion theme to DOM whenever activeCompanion changes (or on initial hydration).
// This replaces the DOM side-effect that was previously inside setActiveCompanion's set() call.
if (typeof document !== 'undefined') {
  const applyTheme = (companion: string) => {
    document.documentElement.setAttribute('data-theme', `${companion}-theme`);
  };
  // Apply persisted theme immediately after hydration
  applyTheme(useSettingsStore.getState().activeCompanion);

  // Subscribe to changes — compare only the activeCompanion field to avoid extra work
  let _prevCompanion = useSettingsStore.getState().activeCompanion;
  useSettingsStore.subscribe((state) => {
    if (state.activeCompanion !== _prevCompanion) {
      _prevCompanion = state.activeCompanion;
      applyTheme(state.activeCompanion);
    }
  });
}
