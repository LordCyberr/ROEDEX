import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { EnemyEntity, ResourceNode, LootDrop, RespawnTimer, Vector2, WeaponState, OverlayNotification } from '../types/events';

export type ArmorSlot = 'Helmet' | 'Torso' | 'Pants' | 'Gloves' | 'Boots';
export interface ArmorItem {
  name: string;
  durability: number;
  maxDurability: number;
  instanceId: string;
}

interface TrackerState {
  // UI State
  activeTab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs';
  setActiveTab: (tab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs') => void;
  collapsedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  collapsedSidebarZones: Record<string, boolean>;
  toggleSidebarZone: (zone: string) => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  layoutMode: 'vertical' | 'horizontal';
  setLayoutMode: (mode: 'vertical' | 'horizontal') => void;
  verticalGroupingMode: 'grouped' | 'flat';
  setVerticalGroupingMode: (mode: 'grouped' | 'flat') => void;
  overlayPosition: { x: number, y: number };
  setOverlayPosition: (pos: { x: number, y: number }) => void;
  orbPosition: { x: number, y: number };
  setOrbPosition: (pos: { x: number, y: number }) => void;
  developerMode: boolean;
  setDeveloperMode: (dev: boolean) => void;
  
  // Display Modes
  displayDensity: 'compact' | 'standard';
  setDisplayDensity: (density: 'compact' | 'standard') => void;
  displayMode: 'session' | 'current_zone';
  setDisplayMode: (mode: 'session' | 'current_zone') => void;
  
  // New Settings UI State
  categoryOrder: string[];
  setCategoryOrder: (order: string[]) => void;
  
  activeOpacity: number;
  setActiveOpacity: (opacity: number) => void;
  idleOpacity: number;
  setIdleOpacity: (opacity: number) => void;
  lootOpacity: number;
  setLootOpacity: (opacity: number) => void;
  
  notificationSettings: {
    enabled: boolean;
    audio: boolean;
    toasts: boolean;
    rareDrop: boolean;
    achievement: boolean;
    zoneChange: boolean;
    socketStatus: boolean;
    trackerStatus: boolean;
    lootEvents: boolean;
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
    duration: number;
    opacity: number;
    scale: number;
    width: number;
    height: number;
    compactMode: boolean;
    bobMode: boolean;
    bobFrequency: 'rare' | 'normal' | 'chatty';
    bobGreetings: boolean;
    bobJokes: boolean;
    bobTips: boolean;
    bobMining: boolean;
    bobCombat: boolean;
    bobGathering: boolean;
    bobZone: boolean;
    bobAchievement: boolean;
    bobRareResource: boolean;
    bobRareDrop: boolean;
    bobSecret: boolean;
    neonGlow: boolean;
    glowColorTheme: string;
    customPositionX: number;
    customPositionY: number;
    volume: number;
    animation: 'slide' | 'fade' | 'pop';
  };
  updateNotificationSettings: (settings: Partial<TrackerState['notificationSettings']>) => void;
  
  weaponUISettings: {
    show: boolean;
    locked: boolean;
    style: 'bar' | 'text_percent' | 'text_durability' | 'bar_percent' | 'bar_durability';
    enableAlerts: boolean;
    alertThreshold: number;
    scale: number;
    opacity: number;
    width: number;
    height: number;
    borderRadius: number;
    glassStrength: number;
    enableAnimations: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
    customPositionX: number;
    customPositionY: number;
    layout: 'vertical' | 'horizontal';
  };
  updateWeaponUISettings: (settings: Partial<TrackerState['weaponUISettings']>) => void;

  armorUISettings: {
    show: boolean;
    locked: boolean;
    style: 'bar' | 'text_percent' | 'text_durability' | 'bar_percent' | 'bar_durability';
    enableAlerts: boolean;
    alertThreshold: number;
    scale: number;
    opacity: number;
    width: number;
    height: number;
    borderRadius: number;
    glassStrength: number;
    enableAnimations: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
    customPositionX: number;
    customPositionY: number;
    layout: 'vertical' | 'horizontal';
  };
  updateArmorUISettings: (settings: Partial<TrackerState['armorUISettings']>) => void;

  orbSize: number;
  setOrbSize: (size: number) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  minimizedIcon: 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx';
  setMinimizedIcon: (icon: TrackerState['minimizedIcon']) => void;

  // Session State
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  sessionActive: boolean;
  setSessionActive: (active: boolean) => void;
  sessionStartTime: number | null;
  setSessionStartTime: (time: number | null) => void;
  sessionRunes: number;
  setSessionRunes: (runes: number | ((prev: number) => number)) => void;
  sessionLoot: Record<string, number>;
  addSessionLoot: (itemName: string, quantity: number) => void;
  chestTotalValue: number;
  setChestTotalValue: (val: number | ((prev: number) => number)) => void;
  clearSession: () => void;
  clearSessionCache: () => void; // New action to clear entities/resources

  // Connection state
  connected: boolean;
  setConnected: (status: boolean) => void;
  
  // Player State
  playerPosition: Vector2 | null;
  throttledPlayerPosition: Vector2 | null;
  setPlayerPosition: (pos: Vector2) => void;
  weapon: WeaponState | null;
  setWeapon: (weapon: WeaponState | null) => void;
  slotDurabilities: Record<number, number>;
  updateSlotDurability: (slot: number, maxDur: number) => void;
  
  armor: Partial<Record<ArmorSlot, ArmorItem>>;
  setArmor: (slot: ArmorSlot, item: ArmorItem | null) => void;

  // Notifications
  notifications: OverlayNotification[];
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;

  // Debug / Stats
  packetCounts: Record<string, number>;
  incrementPacketCount: (type: string) => void;

  // Entities Maps (String keys for composite zone-id)
  enemies: Record<string, EnemyEntity>;
  resources: Record<string, ResourceNode>;
  loot: Record<string, LootDrop>;
  timers: Record<string, RespawnTimer>;

  // Actions - Enemies
  setEnemy: (key: string, enemy: EnemyEntity) => void;
  batchSetEnemies: (enemies: EnemyEntity[]) => void;
  updateEnemyHp: (key: string, hp: number, isDead: boolean) => void;
  removeEnemy: (key: string) => void;
  clearEnemies: () => void;

  // Actions - Resources
  setResource: (key: string, resource: ResourceNode) => void;
  batchSetResources: (resources: ResourceNode[]) => void;
  updateResourceHp: (key: string, hp: number, gathered?: boolean) => void;
  removeResource: (key: string) => void;
  clearResources: () => void;

  // Actions - Loot
  addLoot: (drop: LootDrop) => void;
  removeLoot: (dropId: string) => void;
  clearLoot: () => void;

  // Actions - Timers
  addTimer: (timer: RespawnTimer) => void;
  removeTimer: (id: string) => void;
  clearTimers: () => void;
}

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
    (set, get) => ({
      // UI State
      activeTab: 'global',
      setActiveTab: (tab) => set({ activeTab: tab }),
      collapsedCategories: {},
      toggleCategory: (categoryId) => set((state) => ({
        collapsedCategories: {
          ...state.collapsedCategories,
          [categoryId]: !state.collapsedCategories[categoryId]
        }
      })),
      collapsedSidebarZones: {},
      toggleSidebarZone: (zone) => set((state) => ({
        collapsedSidebarZones: {
          ...state.collapsedSidebarZones,
          [zone]: !state.collapsedSidebarZones[zone]
        }
      })),
      isMinimized: true,
      setIsMinimized: (isMinimized) => set({ isMinimized }),
      layoutMode: 'vertical',
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      verticalGroupingMode: 'grouped',
      setVerticalGroupingMode: (mode) => set({ verticalGroupingMode: mode }),
      overlayPosition: { x: 50, y: 50 },
      setOverlayPosition: (pos) => set({ overlayPosition: pos }),
      orbPosition: { x: 16, y: 16 },
      setOrbPosition: (pos) => set({ orbPosition: pos }),
      developerMode: false,
      setDeveloperMode: (dev) => set({ developerMode: dev }),
      
      displayDensity: 'compact',
      setDisplayDensity: (density) => set({ displayDensity: density }),
      displayMode: 'session',
      setDisplayMode: (mode) => set({ displayMode: mode }),
      
      categoryOrder: ['mobsForest', 'mobsCave', 'ores', 'trees', 'plants'],
      setCategoryOrder: (order) => set({ categoryOrder: order }),
      
      activeOpacity: 1.0,
      setActiveOpacity: (opacity) => set({ activeOpacity: opacity }),
      idleOpacity: 0.8,
      setIdleOpacity: (opacity) => set({ idleOpacity: opacity }),
      lootOpacity: 0.95,
      setLootOpacity: (opacity) => set({ lootOpacity: opacity }),
      
      notificationSettings: {
        enabled: true,
        audio: false,
        toasts: true,
        rareDrop: true,
        achievement: true,
        zoneChange: true,
        socketStatus: true,
        trackerStatus: true,
        lootEvents: true,
        position: 'top-center',
        duration: 5000,
        opacity: 1.0,
        scale: 1.5,
        width: 280,
        height: 60,
        compactMode: false,
        bobMode: true,
        bobFrequency: 'normal',
        bobGreetings: true,
        bobJokes: true,
        bobTips: true,
        bobMining: true,
        bobCombat: true,
        bobGathering: true,
        bobZone: true,
        bobAchievement: true,
        bobRareResource: true,
        bobRareDrop: true,
        bobSecret: true,
        neonGlow: true,
        glowColorTheme: 'theme',
        customPositionX: typeof window !== 'undefined' ? window.innerWidth - 300 : 0,
        customPositionY: 20,
        volume: 0.5,
        animation: 'slide'
      },
      updateNotificationSettings: (settings) => set((state) => ({
        notificationSettings: { ...state.notificationSettings, ...settings }
      })),
      
      weaponUISettings: {
        show: true,
        locked: true,
        style: 'bar_percent',
        enableAlerts: true,
        alertThreshold: 20,
        scale: 1,
        opacity: 1,
        width: 180,
        height: 6,
        borderRadius: 8,
        glassStrength: 10,
        enableAnimations: true,
        position: 'bottom-right',
        customPositionX: 0,
        customPositionY: 0,
        layout: 'horizontal'
      },
      updateWeaponUISettings: (settings) => set((state) => ({
        weaponUISettings: { ...state.weaponUISettings, ...settings }
      })),

      armorUISettings: {
        show: true,
        locked: true,
        style: 'bar_percent',
        enableAlerts: true,
        alertThreshold: 20,
        scale: 1,
        opacity: 1,
        width: 160,
        height: 4,
        borderRadius: 8,
        glassStrength: 10,
        enableAnimations: true,
        position: 'bottom-left',
        customPositionX: 0,
        customPositionY: 0,
        layout: 'vertical'
      },
      updateArmorUISettings: (settings) => set((state) => ({
        armorUISettings: { ...state.armorUISettings, ...settings }
      })),

      orbSize: 56,
      setOrbSize: (size) => set({ orbSize: size }),
      favorites: [],
      toggleFavorite: (id) => set((state) => ({
        favorites: state.favorites.includes(id) 
          ? state.favorites.filter(f => f !== id) 
          : [...state.favorites, id]
      })),
      theme: 'default',
      setTheme: (theme) => set({ theme }),
      minimizedIcon: 'pulse',
      setMinimizedIcon: (icon) => set({ minimizedIcon: icon }),
      
      currentZone: 'Unknown',
      setCurrentZone: (zone) => {
        const state = get();
        if (state.currentZone !== zone && zone !== 'Unknown') {
          // Toast notifications for zone change are handled in BobCompanion.zoneChange
          const newCollapsedZones = { ...state.collapsedSidebarZones };
          
          if (state.layoutMode === 'vertical') {
            // Collapse all existing tracked zones
            Object.keys(newCollapsedZones).forEach(k => {
              newCollapsedZones[k] = true;
            });
            // Uncollapse the new zone
            newCollapsedZones[zone] = false;
          }

          set({ 
            currentZone: zone,
            collapsedSidebarZones: newCollapsedZones
          });
        }
      },
      sessionActive: false,
      setSessionActive: (active) => set({ sessionActive: active }),
      sessionStartTime: null,
      setSessionStartTime: (time) => set({ sessionStartTime: time }),
      sessionRunes: 0,
      setSessionRunes: (val) => set((state) => ({ 
        sessionRunes: typeof val === 'function' ? val(state.sessionRunes) : val 
      })),
      sessionLoot: {},
      addSessionLoot: (item, qty) => set((state) => ({
        sessionLoot: {
          ...state.sessionLoot,
          [item]: (state.sessionLoot[item] || 0) + qty
        }
      })),
      chestTotalValue: 0,
      setChestTotalValue: (val) => set((state) => ({ 
        chestTotalValue: typeof val === 'function' ? val(state.chestTotalValue) : val 
      })),
      clearSession: () => set({ 
        sessionActive: false, 
        sessionStartTime: null, 
        sessionRunes: 0, 
        sessionLoot: {} 
      }),
      clearSessionCache: () => set({
        enemies: {},
        resources: {},
        timers: {},
        loot: {}
      }),

      connected: false,
      setConnected: (status) => set({ connected: status }),
      
      playerPosition: null,
      throttledPlayerPosition: null,
      setPlayerPosition: (pos) => set((state) => {
        const updates: any = { playerPosition: pos };
        if (!state.throttledPlayerPosition) {
          updates.throttledPlayerPosition = pos;
        } else {
          const dx = pos.x - state.throttledPlayerPosition.x;
          const dy = pos.y - state.throttledPlayerPosition.y;
          if (dx * dx + dy * dy > 25) { // 5 units squared
            updates.throttledPlayerPosition = pos;
          }
        }
        return updates;
      }),
      weapon: { name: 'Current Weapon', durability: 100, maxDurability: 100 },
      setWeapon: (w) => set({ weapon: w }),
      slotDurabilities: {},
      updateSlotDurability: (slot, maxDur) => set((state) => ({
        slotDurabilities: { ...state.slotDurabilities, [slot]: maxDur }
      })),
      
      armor: {},
      setArmor: (slot, item) => set((state) => {
        const newArmor = { ...state.armor };
        if (item) {
          newArmor[slot] = item;
        } else {
          delete newArmor[slot];
        }
        return { armor: newArmor };
      }),

      notifications: [],
      addNotification: (notif) => set((state) => {
        if (!state.notificationSettings.enabled || !state.notificationSettings.toasts) return state;
        
        // Check per-type enabled state
        if (notif.type === 'rare' && !state.notificationSettings.rareDrop) return state;
        if (notif.title.toLowerCase().includes('zone') && !state.notificationSettings.zoneChange) return state;
        if (notif.title.toLowerCase().includes('achievement') && !state.notificationSettings.achievement) return state;
        if (notif.title.toLowerCase().includes('socket') && !state.notificationSettings.socketStatus) return state;

        if (state.notificationSettings.audio) {
            // A small chime could be played here
        }

        const newNotif: OverlayNotification = {
          ...notif,
          id: Math.random().toString(36).substring(7),
          timestamp: Date.now()
        };
        return { notifications: [...state.notifications, newNotif] };
      }),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      packetCounts: {},
      incrementPacketCount: (type) => 
        set((state) => ({
          packetCounts: {
            ...state.packetCounts,
            [type]: (state.packetCounts[type] || 0) + 1
          }
        })),

      // Initial State
      enemies: {},
      resources: {},
      loot: {},
      timers: {},

      // Enemies
      setEnemy: (key, enemy) => 
        set((state) => {
          const newTimers = { ...state.timers };
          delete newTimers[`mob-${key}`];
          return {
            enemies: { ...state.enemies, [key]: enemy },
            timers: newTimers
          };
        }),
      batchSetEnemies: (enemiesList) =>
        set((state) => {
          if (!enemiesList || enemiesList.length === 0) return state;
          const newTimers = { ...state.timers };
          const newEnemies = { ...state.enemies };
          enemiesList.forEach(enemy => {
            const key = `${enemy.zone || state.currentZone}-${enemy.entityIndex}`;
            delete newTimers[`mob-${key}`];
            newEnemies[key] = enemy;
          });
          return { enemies: newEnemies, timers: newTimers };
        }),
      updateEnemyHp: (key, hp, isDead) =>
        set((state) => {
          const enemy = state.enemies[key];
          if (!enemy) return state;
          return {
            enemies: {
              ...state.enemies,
              [key]: { ...enemy, hp, isDead }
            }
          };
        }),
      removeEnemy: (key) =>
        set((state) => {
          if (!state.enemies[key]) return state;
          const newEnemies = { ...state.enemies };
          delete newEnemies[key];
          return { enemies: newEnemies };
        }),
      clearEnemies: () => set((state) => {
        if (Object.keys(state.enemies).length === 0) return state;
        return { enemies: {} };
      }),

      // Resources
      setResource: (key, resource) =>
        set((state) => {
          const newTimers = { ...state.timers };
          delete newTimers[`resource-${key}`];
          return {
            resources: { ...state.resources, [key]: resource },
            timers: newTimers
          };
        }),
      batchSetResources: (resourcesList) =>
        set((state) => {
          if (!resourcesList || resourcesList.length === 0) return state;
          const newTimers = { ...state.timers };
          const newResources = { ...state.resources };
          resourcesList.forEach(res => {
            const key = `${res.zone || state.currentZone}-${res.idx}`;
            delete newTimers[`resource-${key}`];
            newResources[key] = res;
          });
          return { resources: newResources, timers: newTimers };
        }),
      updateResourceHp: (key, hp, gathered?: boolean) =>
        set((state) => {
          const res = state.resources[key];
          if (!res) return state;
          return {
            resources: {
              ...state.resources,
              [key]: { ...res, hp, gathered: gathered !== undefined ? gathered : res.gathered }
            }
          };
        }),
      removeResource: (key) =>
        set((state) => {
          if (!state.resources[key]) return state;
          const newRes = { ...state.resources };
          delete newRes[key];
          return { resources: newRes };
        }),
      clearResources: () => set((state) => {
        if (Object.keys(state.resources).length === 0) return state;
        return { resources: {} };
      }),

      // Loot
      addLoot: (drop) =>
        set((state) => ({
          loot: { ...state.loot, [drop.dropId]: drop }
        })),
      removeLoot: (dropId) =>
        set((state) => {
          if (!state.loot[dropId]) return state;
          const newLoot = { ...state.loot };
          delete newLoot[dropId];
          return { loot: newLoot };
        }),
      clearLoot: () => set((state) => {
        if (Object.keys(state.loot).length === 0) return state;
        return { loot: {} };
      }),

      // Timers
      addTimer: (timer) =>
        set((state) => ({
          timers: { ...state.timers, [timer.id]: timer }
        })),
      removeTimer: (id) =>
        set((state) => {
          if (!state.timers[id]) return state;
          const newTimers = { ...state.timers };
          delete newTimers[id];
          return { timers: newTimers };
        }),
      clearTimers: () => set((state) => {
        if (Object.keys(state.timers).length === 0) return state;
        return { timers: {} };
      })
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
          }
        };
      },
      partialize: (state) => ({
        activeTab: state.activeTab,
        layoutMode: state.layoutMode,
        verticalGroupingMode: state.verticalGroupingMode,
        collapsedCategories: state.collapsedCategories,
        collapsedSidebarZones: state.collapsedSidebarZones,
        overlayPosition: state.overlayPosition,
        orbPosition: state.orbPosition,
        developerMode: state.developerMode,
        displayDensity: state.displayDensity,
        displayMode: state.displayMode,
        categoryOrder: state.categoryOrder,
        activeOpacity: state.activeOpacity,
        idleOpacity: state.idleOpacity,
        lootOpacity: state.lootOpacity,
        notificationSettings: state.notificationSettings,
        weaponUISettings: state.weaponUISettings,
        orbSize: state.orbSize,
        favorites: state.favorites,
        theme: state.theme,
        currentZone: state.currentZone,
        sessionActive: state.sessionActive,
        sessionStartTime: state.sessionStartTime,
        sessionRunes: state.sessionRunes,
        sessionLoot: state.sessionLoot,
        enemies: state.enemies,
        resources: state.resources,
        timers: state.timers,
        slotDurabilities: state.slotDurabilities
      }),
    }
  )
);
