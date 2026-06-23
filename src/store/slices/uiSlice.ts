import { StateCreator } from 'zustand';
import { UISlice } from '../storeTypes';
import { OverlayNotification } from '../../types/events';
export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  isChangelogOpen: false,
  setIsChangelogOpen: (open) => set({ isChangelogOpen: open }),
  isDebugPanelOpen: false,
  toggleDebugPanel: () => set((state) => ({ isDebugPanelOpen: !state.isDebugPanelOpen })),
  debugStats: { pps: 0 },
  updateDebugStats: (pps: number) => set({ debugStats: { pps } }),
  
  profilerMetrics: {
    parseTime: { average: 0, max: 0, lastSpike: 0, totalEvents: 0 },
    renderTime: { average: 0, lastRender: 0 },
    memory: { enemiesCount: 0, resourcesCount: 0, poppedOutWindows: 0, lastUpdate: 0 }
  },
  updateProfilerMetrics: (updates) => set((state) => ({
    profilerMetrics: {
      ...state.profilerMetrics,
      ...updates,
      parseTime: { ...state.profilerMetrics.parseTime, ...(updates.parseTime || {}) },
      renderTime: { ...state.profilerMetrics.renderTime, ...(updates.renderTime || {}) },
      memory: { ...state.profilerMetrics.memory, ...(updates.memory || {}) },
    }
  })),


  activeCompanion: 'bob',
  setActiveCompanion: (companion) => set({ activeCompanion: companion }),

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
  mergeAllTabs: () => set({ poppedOutWindows: {} }),
  updatePoppedOutWindow: (id: string, updates: any) =>
    set((state) => ({
      poppedOutWindows: {
        ...state.poppedOutWindows,
        [id]: { ...state.poppedOutWindows[id], ...updates }
      }
    })),
    
  currentNpcDialogue: null,
  setCurrentNpcDialogue: (dialogue) => set({ currentNpcDialogue: dialogue }),
  
  language: 'en',
  setLanguage: (lang) => set({ language: lang }),
  firstTimeWizardCompleted: false,
  setFirstTimeWizardCompleted: (completed) => set({ firstTimeWizardCompleted: completed }),
  isLifetimeStatsOpen: false,
  setIsLifetimeStatsOpen: (open) => set({ isLifetimeStatsOpen: open }),
  isRunHistoryOpen: false,
  setIsRunHistoryOpen: (open: boolean) => set({ isRunHistoryOpen: open }),

  activeTab: 'global',
  setActiveTab: (tab) => set({ activeTab: tab }),
  tabDimensions: {
    // We only need default widths for vertical mode. 
    // Horizontal height is now natively handled by the smart max-h-[250px] scroll containers!
    'session_vertical': { width: 300 },
    'settings_vertical': { width: 340 },
    'npcs_vertical': { width: 300 },
    'quests_vertical': { width: 300 },
  },
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
  overlayPosition: { x: 103, y: 116 },
  setOverlayPosition: (pos) => set({ overlayPosition: pos }),
  orbPosition: { x: 91, y: 102 },
  setOrbPosition: (pos) => set({ orbPosition: pos }),
  companionPosition: { x: 1636, y: 170 },
  setCompanionPosition: (pos) => set({ companionPosition: pos }),
  developerMode: false,
  setDeveloperMode: (dev: boolean) => set({ developerMode: dev }),
  autoMinimizeOnChest: true,
  setAutoMinimizeOnChest: (val: boolean) => set({ autoMinimizeOnChest: val }),
  isUILocked: false,
  setIsUILocked: (locked: boolean) => set({ isUILocked: locked }),
  globalScale: 1.0,
  setGlobalScale: (val: number) => set({ globalScale: val }),
  minimizeHotkey: 'Ctrl+Shift+M',
  toggleLayoutHotkey: 'Shift+H',
  resetSizeHotkey: 'Shift+R',
  lockUiHotkey: 'Shift+U',
  setMinimizeHotkey: (key: string) => set({ minimizeHotkey: key }),
  setToggleLayoutHotkey: (key: string) => set({ toggleLayoutHotkey: key }),
  setResetSizeHotkey: (key: string) => set({ resetSizeHotkey: key }),
  setLockUiHotkey: (key: string) => set({ lockUiHotkey: key }),
  
  displayDensity: 'standard',
  setDisplayDensity: (density) => set({ displayDensity: density }),
  displayMode: 'session',
  setDisplayMode: (mode) => set({ displayMode: mode }),
  
  minimalChestHud: false,
  setMinimalChestHud: (val) => set({ minimalChestHud: val }),
  minimalChestHudLocked: false,
  setMinimalChestHudLocked: (val) => set({ minimalChestHudLocked: val }),
  minimalChestTutorialSeen: false,
  setMinimalChestTutorialSeen: (val) => set({ minimalChestTutorialSeen: val }),
  chestWidgetPositions: {
    chest: { x: 50, y: 50 },
    inventory: { x: 50, y: 100 },
    closeZone: { x: 50, y: 150 }
  },
  setChestWidgetPosition: (key, pos) => set((state) => ({
    chestWidgetPositions: {
      ...state.chestWidgetPositions,
      [key]: pos
    }
  })),
  
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
    scale: 0.9,
    width: 280,
    height: 60,
    compactMode: false,
    companionMode: true,
    companionIconScale: 1.0,
    bobIcon: 'bot',
    companionTextScale: 1.0,
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
    companionDuration: 5000,
    companionBubbleDistance: 16,
    companionBubbleOffsetY: 0,
    bobTheme: 'default',
    companionBubbleTheme: 'connected',
    bobBubbleStyle: 'glass',
    bobVoiceStyle: 'wave',
    tutorialStep: 0,
    tutorialCompleted: false,
    companionMood: 'idle',
    roastLevel: 'mild',
    neonGlow: true,
    glowColorTheme: 'theme',
    toastShape: 'rectangle',
    customPositionX: typeof window !== 'undefined' ? window.innerWidth - 300 : 0,
    customPositionY: 20,
    volume: 0.5,
    animation: 'slide',
    seenTabs: {}
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
    width: 20,
    height: 100,
    borderRadius: 8,
    glassStrength: 10,
    enableAnimations: true,
    position: 'bottom-center',
    customPositionX: 0,
    customPositionY: 0,
    layout: 'vertical',
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
    width: 20,
    height: 100,
    borderRadius: 8,
    glassStrength: 10,
    enableAnimations: true,
    position: 'custom',
    customPositionX: 1519,
    customPositionY: 882,
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
    showTimer: true,
    raritySortOrder: 'desc',
    maxRespawnTooltips: 5
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

  // Developer Force Overlay
  devForceOverlay: false,
  setDevForceOverlay: (force: boolean) => set({ devForceOverlay: force }),
  
  minimizedIcon: 'rx',
  minimizedIconUrl: '',
  setMinimizedIconUrl: (url) => set({ minimizedIconUrl: url }),
  setMinimizedIcon: (icon) => set({ minimizedIcon: icon }),

  notifications: [],
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => set((state) => ({
    notifications: [...state.notifications, { ...notification, id: Date.now().toString(), timestamp: Date.now() }].slice(-5)
  })),
  removeNotification: (id: string) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  companionMessages: [],
  addBobMessage: (message: Omit<OverlayNotification, 'id' | 'timestamp'>) => set((state) => ({
    companionMessages: [...state.companionMessages, { ...message, id: Date.now().toString(), timestamp: Date.now() }].slice(-3)
  })),
  removeBobMessage: (id: string) => set((state) => ({
    companionMessages: state.companionMessages.filter(n => n.id !== id)
  })),

  setTutorialStep: (step) => set((state) => ({
    notificationSettings: { ...state.notificationSettings, tutorialStep: step }
  })),
  setBobMood: (mood) => set((state) => ({
    notificationSettings: { ...state.notificationSettings, companionMood: mood }
  })),
  hoveredTimerId: null,
  setHoveredTimerId: (id) => set({ hoveredTimerId: id })
});
