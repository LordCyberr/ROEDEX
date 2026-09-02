import { OverlayNotification } from '../../types/events';

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export interface PoppedOutWindow {
  id: string; // The tab id
  x: number;
  y: number;
  width?: number;
  height?: number;
  isMinimized?: boolean;
  isCollapsed?: boolean;
  zIndex?: number;
  isLocked?: boolean;
  isHeadless?: boolean;
}

export type Language = 'en' | 'es' | 'ru' | 'ko';

export interface NpcDialogueData {
  speaker: string;
  originalText: string;
  translatedText: string | null;
}

export interface UISlice {
  isQuickStatsOpen: boolean;
  setIsQuickStatsOpen: (open: boolean) => void;
  isChangelogOpen: boolean;
  setIsChangelogOpen: (open: boolean) => void;
  lastSeenVersion: string;
  dismissWhatsNew: () => void;
  showSniper: boolean;
  setShowSniper: (val: boolean) => void;
  
  isDebugPanelOpen: boolean;
  toggleDebugPanel: () => void;
  debugStats: { pps: number };
  updateDebugStats: (pps: number) => void;

  firstTimeWizardCompleted: boolean;
  setFirstTimeWizardCompleted: (completed: boolean) => void;
  isLifetimeStatsOpen: boolean;
  setIsLifetimeStatsOpen: (open: boolean) => void;
  isRunHistoryOpen: boolean;
  setIsRunHistoryOpen: (runHistoryOpen: boolean) => void;

  profilerMetrics: {
    parseTime: { average: number; max: number; lastSpike: number; totalEvents: number; droppedEvents: number };
    renderTime: { average: number; lastRender: number };
    memory: { enemiesCount: number; resourcesCount: number; poppedOutWindows: number; lastUpdate: number };
  };
  updateProfilerMetrics: (updates: DeepPartial<UISlice['profilerMetrics']>) => void;

  activeCompanion: import('../../data/companions').CompanionId;
  setActiveCompanion: (companion: import('../../data/companions').CompanionId) => void;

  // UI State
  poppedOutWindows: Record<string, PoppedOutWindow>;
  popOutTab: (id: string, x: number, y: number) => void;
  mergeTab: (id: string) => void;
  mergeAllTabs: () => void;
  updatePoppedOutWindow: (id: string, updates: Partial<PoppedOutWindow>) => void;
  minimizeAllPoppedOutWindows: (minimize?: boolean) => void;

  // NPC Dialogue
  currentNpcDialogue: NpcDialogueData | null;
  setCurrentNpcDialogue: (dialogue: NpcDialogueData | null) => void;

  language: Language;
  setLanguage: (lang: Language) => void;

  activeTab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs' | 'quests' | 'players' | 'roepedia' | 'profile' | 'chest' | 'recentLoot';
  setActiveTab: (tab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs' | 'quests' | 'players' | 'roepedia' | 'profile' | 'chest' | 'recentLoot') => void;
  isMarketplaceOpen: boolean;
  setIsMarketplaceOpen: (open: boolean) => void;
  tabDimensions: Record<string, { width?: number, height?: number }>;
  collapsedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  collapsedSidebarZones: Record<string, boolean>;
  toggleSidebarZone: (zone: string) => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  marketCurrencyPref: 'ETH' | 'USD';
  setMarketCurrencyPref: (pref: 'ETH' | 'USD') => void;
  globalScale: number;
  minimizeHotkey: string;
  toggleLayoutHotkey: string;
  resetSizeHotkey: string;
  lockUiHotkey: string;
  setMinimizeHotkey: (key: string) => void;
  setToggleLayoutHotkey: (key: string) => void;
  setResetSizeHotkey: (key: string) => void;
  setLockUiHotkey: (key: string) => void;

  layoutMode: 'vertical' | 'horizontal';
  setLayoutMode: (mode: 'vertical' | 'horizontal') => void;
  verticalGroupingMode: 'grouped' | 'flat';
  setVerticalGroupingMode: (mode: 'grouped' | 'flat') => void;
  setTabDimensions: (tab: string, width?: number, height?: number) => void;
  setGlobalScale: (val: number) => void;
  overlayPosition: { x: number, y: number };
  setOverlayPosition: (pos: { x: number, y: number }) => void;
  orbPosition: { x: number, y: number };
  setOrbPosition: (pos: { x: number, y: number }) => void;
  orbClickThrough: boolean;
  setOrbClickThrough: (val: boolean) => void;
  companionPosition: { x: number, y: number };
  setCompanionPosition: (pos: { x: number, y: number }) => void;
  developerMode: boolean;
  setDeveloperMode: (dev: boolean) => void;
  autoMinimizeOnChest: boolean;
  setAutoMinimizeOnChest: (val: boolean) => void;
  isUILocked: boolean;
  setIsUILocked: (locked: boolean) => void;
  visualQuality: 'high' | 'performance';
  setVisualQuality: (quality: 'high' | 'performance') => void;

  // Display Modes
  displayDensity: 'compact' | 'standard';
  setDisplayDensity: (density: 'compact' | 'standard') => void;
  displayMode: 'session' | 'current_zone';
  setDisplayMode: (mode: 'session' | 'current_zone') => void;


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
    toolWarning: boolean;
    socketStatus: boolean;
    trackerStatus: boolean;
    lootEvents: boolean;
    notifyItems: boolean;
    notifyResources: boolean;
    notifyLoot: boolean;
    notifyRareMobDrops?: boolean;
    notifyRareOres?: boolean;
    notifyRarePlants?: boolean;
    position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
    duration: number;
    opacity: number;
    scale: number;
    width: number;
    height: number;
    compactMode: boolean;
    companionMode: boolean;
    companionIconScale: number;
    companionTextScale: number;
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
    disabledTimers?: Record<string, boolean>; // Maps entity id to boolean (true = muted timer)
    companionDuration: number;
    companionBubbleDistance: number;
    companionBubbleOffsetY: number;
    bobIcon: 'portrait' | 'bot' | 'pixel_matrix' | 'realistic_3d' | 'ghost' | 'cat' | 'wizard' | 'skull' | 'alien' | 'dog' | 'custom' | 'mini-character';
    bobIconUrl?: string;
    companionBubbleTheme?: 'connected' | 'floating' | 'holographic';
    bobBubbleStyle?: 'glass' | 'pixel' | 'cyber' | 'fantasy' | 'minimal' | 'hologram';
    bobVoiceStyle?: 'wave' | 'eq' | 'pulse';
    v4PositionMigrated?: boolean;
    v5PositionMigrated?: boolean;
    v10PositionsMigrated?: boolean;
    v11PositionsMigrated?: boolean;
    v6ToastMigrated?: boolean;
    tutorialStep: number;
    tutorialCompleted: boolean;
    companionMood: 'idle' | 'happy' | 'angry' | 'talking' | 'thinking';
    roastLevel: 'off' | 'mild' | 'savage';
    neonGlow: boolean;
    glowColorTheme: 'theme' | 'rarity' | 'type';
    toastShape: 'square' | 'rectangle' | 'smooth' | 'pill';
    customPositionX: number;
    customPositionY: number;
    volume: number;
    animation: 'slide' | 'fade' | 'pop';
    seenTabs?: Record<string, boolean>;
    rareSpawnAlerts: boolean;
    disabledItems?: Record<string, boolean>;
    maxNotifications: number;
  };
  updateNotificationSettings: (settings: Partial<UISlice['notificationSettings']>) => void;

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
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right' | 'custom';
    customPositionX: number;
    customPositionY: number;
    layout: 'vertical' | 'horizontal';
    borderWidth: number;
    dynamicBorderColor: boolean;
    v7WeaponPositionMigrated?: boolean;
  };
  updateWeaponUISettings: (settings: Partial<UISlice['weaponUISettings']>) => void;

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
    borderWidth: number;
    dynamicBorderColor: boolean;
  };
  updateArmorUISettings: (settings: Partial<UISlice['armorUISettings']>) => void;

  targetUISettings: {
    showMobHealth: boolean;
    showOreHealth: boolean;
    showTreeHealth: boolean;
    position: 'top-center' | 'custom';
    customPositionX: number;
    customPositionY: number;
    locked: boolean;
    opacity: number;
    width: number;
    height: number;
    scale: number;
  };
  updateTargetUISettings: (settings: Partial<UISlice['targetUISettings']>) => void;

  tableSettings: {
    showDistance: boolean;
    showCount: boolean;
    showTimer: boolean;
    raritySortOrder: 'asc' | 'desc' | 'none';
    maxRespawnTooltips: 5 | 10 | 15 | 20;
    trackingStyle: 'center' | 'ring';
    itemGlow: boolean;
    recentLootLength?: 5 | 10 | 15;
  };
  updateTableSettings: (settings: Partial<UISlice['tableSettings']>) => void;

  orbSize: number;
  setOrbSize: (size: number) => void;
  orbBorderThickness: number;
  setOrbBorderThickness: (thickness: number) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  theme: string;
  setTheme: (t: string) => void;
  performanceMode: boolean;
  setPerformanceMode: (enabled: boolean) => void;
  minimizedIcon: 'logo' | 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx' | 'jarvis' | 'custom';
  minimizedIconUrl?: string;
  setMinimizedIconUrl: (url: string) => void;
  setMinimizedIcon: (icon: 'logo' | 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx' | 'jarvis' | 'custom') => void;

  devForceOverlay: boolean;
  setDevForceOverlay: (force: boolean) => void;

  notifications: OverlayNotification[];
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  companionMessages: OverlayNotification[];
  addBobMessage: (message: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeBobMessage: (id: string) => void;

  notifiedEntities: Record<string, boolean>;
  markEntityNotified: (name: string) => void;

  setTutorialStep: (step: number) => void;
  setBobMood: (mood: 'idle' | 'happy' | 'angry' | 'talking' | 'thinking') => void;
  hoveredTimerId: string | null;
  setHoveredTimerId: (id: string | null) => void;

  // Deprecated lootLogSettings removed

  mapSettings: {
    enabled: boolean;
    recordPaths: boolean;
    mapSize?: number;
    showMobs?: boolean;
    showMysticals?: boolean;
    showOres?: boolean;
    showTrees?: boolean;
    showPlants?: boolean;
    mapRefreshRate?: '60' | '144' | 'uncapped';
    autoRecenter?: boolean;
    autoRecenterDelay?: 5 | 10 | 15 | 30;
    mapTheme?: 'glass' | 'cyber' | 'tactical' | 'minimal';
    defaultZoom?: number;
  };
  updateMapSettings: (settings: Partial<UISlice['mapSettings']>) => void;

  recordingSettings: {
    intervalMs: number;
    minDistSq: number;
    teleportSq: number;
    smoothingLevel: 'off' | 'light' | 'heavy';
    autoCleanOnStop: boolean;
    dougPeuckerEpsilon: 'off' | 0.5 | 1.0 | 2.0;
  };
  updateRecordingSettings: (settings: Partial<UISlice['recordingSettings']>) => void;
}
