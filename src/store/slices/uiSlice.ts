import { StateCreator } from 'zustand';
import { UISlice } from '../storeTypes';
import { OverlayNotification } from '../../types/events';
import { CHANGELOG_DATA } from '../../data/changelog';

const LATEST_VERSION = CHANGELOG_DATA[0]?.version ?? '0.0.5';

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  isQuickStatsOpen: false,
  setIsQuickStatsOpen: (open) => set({ isQuickStatsOpen: open }),
  isChangelogOpen: false,
  setIsChangelogOpen: (open) => set({ isChangelogOpen: open }),
  lastSeenVersion: '',
  dismissWhatsNew: () => set({ lastSeenVersion: LATEST_VERSION }),
  isMarketplaceOpen: false,
  setIsMarketplaceOpen: (open) => set({ isMarketplaceOpen: open }),
  showSniper: false,
  setShowSniper: (val) => set({ showSniper: val }),
  isDebugPanelOpen: false,
  toggleDebugPanel: () => set((state) => ({ isDebugPanelOpen: !state.isDebugPanelOpen })),
  debugStats: { pps: 0 },
  updateDebugStats: (pps: number) => set({ debugStats: { pps } }),
  
  profilerMetrics: {
    parseTime: { average: 0, max: 0, lastSpike: 0, totalEvents: 0, droppedEvents: 0 },
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
    set((state) => {
      if (!state.poppedOutWindows[id]) return state;
      return {
        poppedOutWindows: {
          ...state.poppedOutWindows,
          [id]: { ...state.poppedOutWindows[id], ...updates }
        }
      };
    }),
  minimizeAllPoppedOutWindows: (minimize: boolean = true) => 
    set((state) => {
      const newWindows: Record<string, any> = {};
      Object.keys(state.poppedOutWindows).forEach(id => {
        newWindows[id] = { ...state.poppedOutWindows[id], isMinimized: minimize };
      });
      return { poppedOutWindows: newWindows };
    }),
    
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
  tabDimensions: {},
  setTabDimensions: (tab, width, height) => set((state) => {
    if (width === undefined && height === undefined) {
      const newDims = { ...state.tabDimensions };
      delete newDims[tab];
      return { tabDimensions: newDims };
    }
    return { tabDimensions: { ...state.tabDimensions, [tab]: { width, height } } };
  }),
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
  marketCurrencyPref: 'ETH',
  setMarketCurrencyPref: (pref: 'ETH' | 'USD') => set({ marketCurrencyPref: pref }),
  layoutMode: 'vertical',
  setLayoutMode: (mode) => set({ layoutMode: mode }),
  verticalGroupingMode: 'grouped',
  setVerticalGroupingMode: (mode) => set({ verticalGroupingMode: mode }),
  overlayPosition: { x: 103, y: 116 },
  setOverlayPosition: (pos) => set({ overlayPosition: pos }),
  orbPosition: { x: 91, y: 102 },
  setOrbPosition: (pos) => set({ orbPosition: pos }),
  orbClickThrough: false,
  setOrbClickThrough: (val) => set({ orbClickThrough: val }),
  companionPosition: { x: 1636, y: 170 },
  setCompanionPosition: (pos) => set({ companionPosition: pos }),
  developerMode: false,
  setDeveloperMode: (dev: boolean) => set({ developerMode: dev }),
  autoMinimizeOnChest: true,
  setAutoMinimizeOnChest: (val: boolean) => set({ autoMinimizeOnChest: val }),
  isUILocked: false,
  setIsUILocked: (locked: boolean) => set({ isUILocked: locked }),
  visualQuality: 'high',
  setVisualQuality: (quality) => set({ visualQuality: quality }),
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
    notifyItems: true,
    notifyResources: true,
    notifyLoot: true,
    notifyRareMobDrops: true,
    notifyRareOres: true,
    notifyRarePlants: true,
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
    customPositionX: 1600, // Static SSR safe default
    customPositionY: 20,
    volume: 0.5,
    animation: 'slide',
    seenTabs: {},
    rareSpawnAlerts: true,
    maxNotifications: 5
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
    width: 174,
    height: 24,
    borderRadius: 8,
    glassStrength: 10,
    enableAnimations: true,
    position: 'bottom-center',
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

  targetUISettings: {
    showMobHealth: true,
    showOreHealth: true,
    showTreeHealth: true,
    position: 'top-center',
    customPositionX: 1600, // Static SSR safe default. Component will hydrate via useEffect.
    customPositionY: 50,
    locked: false,
    opacity: 1.0,
    width: 300,
    height: 16,
    scale: 1.0,
  },
  updateTargetUISettings: (settings) => set((state) => ({
    targetUISettings: { ...state.targetUISettings, ...settings }
  })),

  tableSettings: {
    showDistance: true,
    showCount: true,
    showTimer: true,
    raritySortOrder: 'desc',
    maxRespawnTooltips: 5,
    trackingStyle: 'center',
    itemGlow: true
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
  setTheme: (theme: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement?.setAttribute('data-theme', theme || 'default');
      document.body?.setAttribute('data-theme', theme || 'default');
    }
    set({ theme });
  },
  performanceMode: false,
  setPerformanceMode: (enabled: boolean) => set({ performanceMode: enabled }),

  // Developer Force Overlay
  devForceOverlay: false,
  setDevForceOverlay: (force: boolean) => set({ devForceOverlay: force }),
  
  minimizedIcon: 'rx',
  minimizedIconUrl: '',
  setMinimizedIconUrl: (url) => set({ minimizedIconUrl: url }),
  setMinimizedIcon: (icon) => set({ minimizedIcon: icon }),

  notifications: [],
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => set((state) => {
    const now = Date.now();
    if (notification.tag) {
      const existingIdx = state.notifications.findIndex(n => n.tag === notification.tag);
      if (existingIdx >= 0) {
        const updated = [...state.notifications];
        updated[existingIdx] = {
          ...updated[existingIdx],
          message: notification.message,
          title: notification.title || updated[existingIdx].title,
          timestamp: now,
          qty: notification.qty ?? updated[existingIdx].qty
        };
        return { notifications: updated };
      }
    }
    const max = state.notificationSettings.maxNotifications || 5;
    return {
      notifications: [...state.notifications, { ...notification, id: now.toString(), timestamp: now }].slice(-max)
    };
  }),
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

  notifiedEntities: {},
  markEntityNotified: (name: string) => set((state) => ({
    notifiedEntities: { ...state.notifiedEntities, [name]: true }
  })),

  setTutorialStep: (step) => set((state) => ({
    notificationSettings: { ...state.notificationSettings, tutorialStep: step }
  })),
  setBobMood: (mood) => set((state) => ({
    notificationSettings: { ...state.notificationSettings, companionMood: mood }
  })),
  hoveredTimerId: null,
  setHoveredTimerId: (id) => set({ hoveredTimerId: id }),

  mapSettings: {
    enabled: true,
    recordPaths: false,
    mapRefreshRate: 'uncapped',
    autoRecenter: true,
    autoRecenterDelay: 10,
    mapTheme: 'glass',
    defaultZoom: 10.0,
    // Size & position (persisted)
    mapSize: 200,
    mapPosition: { x: 700, y: 60 },
    // Visual style
    borderless: false,
    opacity: 1.0,
    edgeGlow: false,
    crtGlitch: false,
    // Icon style
    iconStyle: 'vector' as 'vector' | 'emoji' | 'dot',
    iconScaleMultiplier: 1.0,
    dimmedOpacity: 0.35,
    // Entity layer visibility
    showCommon: true,
    showUncommon: true,
    showRare: true,
    showMythical: true,
    showOres: true,
    showTrees: true,
    showPlants: true,
    showMobs: true,
    showDrops: true,
    showPortals: true,
    // Custom entity colors (keyed by entityId or type)
    customColors: {} as Record<string, string>,
    // Overlay features
    showCompass: true,
    showGrid: false,
    showScaleBar: false,
    showCoordinates: true,
    // ── AAA Map v2 Features ──────────────────────────────────────────────────
    fogOfWar: true,
    showDiscoveryBar: true,
    discoveryBeam: true,
    showOffScreenRadar: true,
    radarMinRarity: 'rare' as 'uncommon' | 'rare' | 'mystical',
    borderGlowStyle: 'pulse' as 'pulse' | 'static' | 'off',
    trailColor: '#facc15',
    trailGradient: true,
  },
  updateMapSettings: (settings) => set((state) => ({
    mapSettings: { ...state.mapSettings, ...settings }
  })),

  recordingSettings: {
    intervalMs: 250,
    minDistSq: 0.25,
    teleportSq: 3600,
    smoothingLevel: 'light',
    autoCleanOnStop: true,
    dougPeuckerEpsilon: 0.5,
  },
  updateRecordingSettings: (settings) => set((state) => ({
    recordingSettings: { ...state.recordingSettings, ...settings }
  }))
});
