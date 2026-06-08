import { StateCreator } from 'zustand';
import { TrackerState, UISlice } from '../storeTypes';
import { OverlayNotification } from '../../types/events';

export const createUISlice: StateCreator<TrackerState, [], [], UISlice> = (set) => ({
  isDebugPanelOpen: false,
  toggleDebugPanel: () => set((state) => ({ isDebugPanelOpen: !state.isDebugPanelOpen })),
  debugStats: { pps: 0 },
  updateDebugStats: (pps: number) => set({ debugStats: { pps } }),
  
  poppedOutWindows: {},
  popOutTab: (id: string, x: number, y: number) => set((state) => ({
    poppedOutWindows: {
      ...state.poppedOutWindows,
      [id]: { id, x, y, isMinimized: false }
    }
  })),
  mergeTab: (id: string) => set((state) => {
    const newWindows = { ...state.poppedOutWindows };
    delete newWindows[id];
    return { poppedOutWindows: newWindows };
  }),
  updatePoppedOutWindow: (id, updates) => set((state) => {
    const win = state.poppedOutWindows[id];
    if (!win) return state;
    return {
      poppedOutWindows: {
        ...state.poppedOutWindows,
        [id]: { ...win, ...updates }
      }
    };
  }),

  language: 'en',
  setLanguage: (lang) => set({ language: lang }),

  activeTab: 'global',
  setActiveTab: (tab) => set({ activeTab: tab }),
  tabDimensions: {},
  setTabDimensions: (tab, width, height) => set((state) => ({
    tabDimensions: { ...state.tabDimensions, [tab]: { width, height } }
  })),
  collapsedCategories: {},
  toggleCategory: (categoryId: string) => set((state) => ({
    collapsedCategories: {
      ...state.collapsedCategories,
      [categoryId]: !state.collapsedCategories[categoryId]
    }
  })),
  collapsedSidebarZones: {},
  toggleSidebarZone: (zone: string) => set((state) => ({
    collapsedSidebarZones: {
      ...state.collapsedSidebarZones,
      [zone]: !state.collapsedSidebarZones[zone]
    }
  })),
  isMinimized: true,
  setIsMinimized: (isMinimized: boolean) => set({ isMinimized }),
  layoutMode: 'vertical',
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  verticalGroupingMode: 'grouped',
  setVerticalGroupingMode: (mode) => set({ verticalGroupingMode: mode }),
  overlayPosition: { x: 50, y: 50 },
  setOverlayPosition: (pos) => set({ overlayPosition: pos }),
  orbPosition: { x: 16, y: 16 },
  setOrbPosition: (pos) => set({ orbPosition: pos }),
  bobPosition: { x: 20, y: 200 },
  setBobPosition: (pos) => set({ bobPosition: pos }),
  developerMode: false,
  setDeveloperMode: (dev: boolean) => set({ developerMode: dev }),
  autoMinimizeOnChest: true,
  setAutoMinimizeOnChest: (val: boolean) => set({ autoMinimizeOnChest: val }),
  isUILocked: false,
  setIsUILocked: (locked: boolean) => set({ isUILocked: locked }),
  
  displayDensity: 'compact',
  setDisplayDensity: (density) => set({ displayDensity: density }),
  displayMode: 'session',
  setDisplayMode: (mode) => set({ displayMode: mode }),
  
  categoryOrder: ['mobsForest', 'mobsCave', 'ores', 'trees', 'plants'],
  setCategoryOrder: (order: string[]) => set({ categoryOrder: order }),
  
  activeOpacity: 1.0,
  setActiveOpacity: (opacity: number) => set({ activeOpacity: opacity }),
  idleOpacity: 0.8,
  setIdleOpacity: (opacity: number) => set({ idleOpacity: opacity }),
  lootOpacity: 0.95,
  setLootOpacity: (opacity: number) => set({ lootOpacity: opacity }),
  
  notificationSettings: {
    enabled: true,
    audio: false,
    toasts: true,
    rareDrop: true,
    achievement: true,
    zoneChange: true,
    toolWarning: true,
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
    bobIconScale: 1.0,
    bobTextScale: 1.0,
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
    bobDuration: 5000,
    bobBubbleDistance: 16,
    bobBubbleOffsetY: 0,
    bobTheme: 'default',
    bobIcon: 'bot',
    neonGlow: true,
    glowColorTheme: 'theme',
    toastShape: 'rectangle',
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
    layout: 'horizontal',
    borderWidth: 1,
    dynamicBorderColor: true
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
    layout: 'vertical',
    borderWidth: 1,
    dynamicBorderColor: true
  },
  updateArmorUISettings: (settings) => set((state) => ({
    armorUISettings: { ...state.armorUISettings, ...settings }
  })),

  tableSettings: {
    showDistance: true,
    showCount: true,
    showTimer: true
  },
  updateTableSettings: (settings) => set((state) => ({
    tableSettings: { ...state.tableSettings, ...settings }
  })),

  orbSize: 56,
  setOrbSize: (size: number) => set({ orbSize: size }),
  orbBorderThickness: 2,
  setOrbBorderThickness: (thickness: number) => set({ orbBorderThickness: thickness }),
  favorites: [],
  toggleFavorite: (id: string) => set((state) => ({
    favorites: state.favorites.includes(id) 
      ? state.favorites.filter(f => f !== id) 
      : [...state.favorites, id]
  })),
  theme: 'default',
  setTheme: (theme: string) => set({ theme }),
  minimizedIcon: 'pulse',
  setMinimizedIcon: (icon) => set({ minimizedIcon: icon }),

  notifications: [],
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now().toString(), timestamp: Date.now() }].slice(-5)
  })),
  removeNotification: (id: string) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  bobMessages: [],
  addBobMessage: (message: Omit<OverlayNotification, 'id' | 'timestamp'>) => set((state) => ({
    bobMessages: [...state.bobMessages, { ...message, id: Date.now().toString(), timestamp: Date.now() }].slice(-3)
  })),
  removeBobMessage: (id: string) => set((state) => ({
    bobMessages: state.bobMessages.filter(n => n.id !== id)
  }))
});
