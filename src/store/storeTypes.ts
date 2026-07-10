import { EnemyEntity, ResourceNode, LootDrop, RespawnTimer, Vector2, WeaponState, OverlayNotification, RunStats } from '../types/events';

export interface OnlinePlayer {
  id: string;
  username: string;
  position?: Vector2;
  zone?: string;
  lastSeen: number;
}
export type ArmorSlot = 'Helmet' | 'Torso' | 'Pants' | 'Gloves' | 'Boots';
export interface ArmorItem {
  name: string;
  durability: number;
  maxDurability: number;
  instanceId: string;
}

export interface PoppedOutWindow {
  id: string; // The tab id
  x: number;
  y: number;
  width?: number;
  height?: number;
  isMinimized?: boolean;
  zIndex?: number;
  isLocked?: boolean;
}

export type Language = 'en' | 'es' | 'ru' | 'ko';

export interface QuestIngredient {
  item: string;
  quantity: number;
}

export interface QuestStep {
  step_number: number;
  quest_title: string;
  description: string;
  completed: boolean;
}

export interface Quest {
  id: string; // _id
  quest_id: string;
  quest_giver: string;
  title: string;
  description: string;
  quest_type: string;
  status: 'available' | 'accepted' | 'completed';
  required_item: string;
  quantity: number;
  reward: number;
  reward_type: string;
  item_rarity: string;
  location?: string;
  reward_cost_difference?: number;
  recipe?: {
    location: string;
    ingredients: QuestIngredient[];
  };
  quests_list: QuestStep[];
  currentAmount: number; // mapped from result.currentAmount
  current_step: number;
}

export interface NpcDialogueData {
  speaker: string;
  originalText: string;
  translatedText: string | null;
}

export interface UISlice {
  isChangelogOpen: boolean;
  setIsChangelogOpen: (open: boolean) => void;
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
  updateProfilerMetrics: (updates: any) => void;

  activeCompanion: import('../data/companions').CompanionId;
  setActiveCompanion: (companion: import('../data/companions').CompanionId) => void;

  // UI State
  poppedOutWindows: Record<string, PoppedOutWindow>;
  popOutTab: (id: string, x: number, y: number) => void;
  mergeTab: (id: string) => void;
  mergeAllTabs: () => void;
  updatePoppedOutWindow: (id: string, updates: Partial<PoppedOutWindow>) => void;
  
  // NPC Dialogue
  currentNpcDialogue: NpcDialogueData | null;
  setCurrentNpcDialogue: (dialogue: NpcDialogueData | null) => void;
  
  language: Language;
  setLanguage: (lang: Language) => void;

  activeTab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs' | 'quests' | 'players' | 'roepedia';
  setActiveTab: (tab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs' | 'quests' | 'players' | 'roepedia') => void;
  tabDimensions: Record<string, { width?: number, height?: number }>;
  collapsedCategories: Record<string, boolean>;
  toggleCategory: (category: string) => void;
  collapsedSidebarZones: Record<string, boolean>;
  toggleSidebarZone: (zone: string) => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  globalScale: number; // Global UI Scale for 4K displays
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
  
  // Minimal Chest HUD
  minimalChestHud: boolean;
  setMinimalChestHud: (val: boolean) => void;
  minimalChestHudLocked: boolean;
  setMinimalChestHudLocked: (val: boolean) => void;
  minimalChestTutorialSeen: boolean;
  setMinimalChestTutorialSeen: (val: boolean) => void;
  minimalChestHudOpacity: number;
  setMinimalChestHudOpacity: (val: number) => void;
  chestWidgetPositions: {
    chest: { x: number, y: number };
    inventory: { x: number, y: number };
    closeZone: { x: number, y: number };
  };
  setChestWidgetPosition: (key: 'chest' | 'inventory' | 'closeZone', pos: { x: number, y: number }) => void;
  
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
    
    // Tutorial & Mood State
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

  tableSettings: {
    showDistance: boolean;
    showCount: boolean;
    showTimer: boolean;
    raritySortOrder: 'asc' | 'desc' | 'none';
    maxRespawnTooltips: 5 | 10 | 15 | 20;
    trackingStyle: 'center' | 'ring';
    itemGlow: boolean;
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
  minimizedIcon: 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx' | 'custom';
  minimizedIconUrl?: string;
  setMinimizedIconUrl: (url: string) => void;
  setMinimizedIcon: (icon: 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx' | 'custom') => void;

  // Developer Force Overlay
  devForceOverlay: boolean;
  setDevForceOverlay: (force: boolean) => void;

  notifications: OverlayNotification[];
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  companionMessages: OverlayNotification[];
  addBobMessage: (message: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeBobMessage: (id: string) => void;
  
  // Tutorial & Mood Actions
  setTutorialStep: (step: number) => void;
  setBobMood: (mood: 'idle' | 'happy' | 'angry' | 'talking' | 'thinking') => void;
  hoveredTimerId: string | null;
  setHoveredTimerId: (id: string | null) => void;
}

export interface SessionSlice {
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  sessionActive: boolean;
  setSessionActive: (active: boolean) => void;
  isChestOpen: boolean;
  setIsChestOpen: (open: boolean) => void;
  sessionStartTime: number | null;
  setSessionStartTime: (time: number | null) => void;
  sessionRunes: number;
  setSessionRunes: (runes: number | ((prev: number) => number)) => void;
  sessionLoot: Record<string, number>;
  addSessionLoot: (itemName: string, quantity: number) => void;
  chestTotalValue: number;
  setChestTotalValue: (val: number | ((prev: number) => number)) => void;
  chestInventory: Record<string, number>;
  setChestInventory: (inventory: Record<string, number>) => void;
  bankTotalValue: number;
  setBankTotalValue: (val: number | ((prev: number) => number)) => void;
  bankInventory: Record<string, number>;
  setBankInventory: (inventory: Record<string, number>) => void;
  
  sessionMobsKilled: number;
  sessionTreesCut: number;
  sessionOresMined: number;
  sessionPlantsHarvested: number;
  sessionZonesVisited: string[];
  
  incrementMobsKilled: () => void;
  incrementTreesCut: () => void;
  incrementOresMined: () => void;
  incrementPlantsHarvested: () => void;
  
  runHistory: RunStats[];
  sessionSettings: {
    timeAttackMinutes: number;
    lootValueGoal: number;
  };
  updateSessionSettings: (settings: Partial<SessionSlice['sessionSettings']>) => void;
  endSession: (lootWorth: number) => void;
  clearRunHistory: () => void;

  clearSession: () => void;
  clearSessionCache: () => void;
}

export interface PlayerSlice {
  // Connection state
  connected: boolean;
  setConnected: (status: boolean) => void;
  
  sessionPlayerName: string | null;
  setSessionPlayerName: (name: string) => void;
  // Quests
  quests: Quest[];
  setQuests: (quests: Quest[]) => void;
  
  playerProfile: {
    level: number;
    currentRunes: number;
    runesRequired: number;
    name?: string;
  };
  setPlayerProfile: (profile: Partial<PlayerSlice['playerProfile']>) => void;
  
  isGuildPassActive: boolean;
  setIsGuildPassActive: (active: boolean) => void;

  lifetimeStats: {
    mobsKilled: Record<string, number>;
    oresMined: Record<string, number>;
    treesCut: Record<string, number>;
    plantsHarvested: Record<string, number>;
    itemsLooted: Record<string, number>;
  };
  setLifetimeStats: (stats: {
    mobsKilled: Record<string, number>;
    oresMined: Record<string, number>;
    treesCut: Record<string, number>;
    plantsHarvested: Record<string, number>;
    itemsLooted: Record<string, number>;
  }) => void;
  incrementLifetimeStat: (category: 'mobsKilled' | 'oresMined' | 'treesCut' | 'plantsHarvested' | 'itemsLooted', id: string, amount?: number) => void;

  playerPosition: Vector2 | null;
  playerZone: string;
  setPlayerPosition: (pos: Vector2 | null, zone?: string) => void;
  throttledPlayerPosition: Vector2 | null;
  
  weapon: WeaponState | null;
  setWeapon: (weapon: WeaponState | null) => void;
  slotDurabilities: Record<number, number>;
  updateSlotDurability: (slot: number, maxDur: number) => void;
  
  armor: Partial<Record<ArmorSlot, ArmorItem>>;
  setArmor: (slot: ArmorSlot, item: ArmorItem | null) => void;
  
  packetCounts: Record<string, number>;
  incrementPacketCount: (type: string) => void;

  onlinePlayers: Record<string, OnlinePlayer>;
  setOnlinePlayer: (id: string, player: Partial<OnlinePlayer>) => void;
  removeOnlinePlayer: (id: string) => void;
  clearOnlinePlayers: () => void;
  
  // Dynamic Zone Graph: { "Town": { "Mines": {x: -6, y: 59} } }
  zoneGraph: Record<string, Record<string, Vector2>>;
}

export interface EntitySlice {
  activeWaypoint: Vector2 | null;
  activeWaypointName: string | null;
  activeWaypointZone: string | null;
  setActiveWaypoint: (pos: Vector2 | null, name?: string | null, zone?: string | null) => void;

  enemies: Record<string, EnemyEntity>;
  resources: Record<string, ResourceNode>;
  loot: Record<string, LootDrop>;
  timers: Record<string, RespawnTimer>;

  setEnemy: (key: string, enemy: EnemyEntity) => void;
  batchSetEnemies: (enemies: EnemyEntity[]) => void;
  updateEnemyHp: (key: string, hp: number, isDead: boolean) => void;
  removeEnemy: (key: string) => void;
  clearEnemies: () => void;

  setResource: (key: string, resource: ResourceNode) => void;
  batchSetResources: (resources: ResourceNode[]) => void;
  updateResourceHp: (key: string, hp: number, gathered?: boolean) => void;
  removeResource: (key: string) => void;
  clearResources: () => void;

  addLoot: (drop: LootDrop) => void;
  removeLoot: (dropId: string) => void;
  clearLoot: () => void;
  clearExpiredLoot: () => void;

  addTimer: (timer: RespawnTimer) => void;
  removeTimer: (id: string) => void;
  clearTimers: () => void;
}

export interface RoutePoint {
  timestamp: number;
  action: 'move' | 'kill' | 'gather' | 'enter_zone' | 'custom_marker';
  x: number;
  y: number;
  detail?: string; // e.g., mob name, resource type, zone name
}

export interface RouteRecorderSlice {
  isRecording: boolean;
  recordedRoute: RoutePoint[];
  lastRecordedMoveTime: number;
  
  startRecording: () => void;
  stopRecording: () => void;
  addRoutePoint: (point: Omit<RoutePoint, 'timestamp'>) => void;
  exportRoute: () => void;
  clearRoute: () => void;
}

export interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  zone: string | null;
}

export interface ErrorLogSlice {
  errorLogs: ErrorLog[];
  logError: (message: string, stack?: string) => void;
  clearErrors: () => void;
}

export type TrackerState = SessionSlice & PlayerSlice & EntitySlice & RouteRecorderSlice & ErrorLogSlice;
