import { EnemyEntity, ResourceNode, LootDrop, RespawnTimer, Vector2, WeaponState, OverlayNotification, RunStats } from '../types/events';

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
  isMinimized: boolean;
  zIndex?: number;
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
  status: 'accepted' | 'completed';
  required_item: string;
  quantity: number;
  reward: number;
  reward_type: string;
  item_rarity: string;
  recipe?: {
    location: string;
    ingredients: QuestIngredient[];
  };
  quests_list: QuestStep[];
  currentAmount: number; // mapped from result.currentAmount
}

export interface UISlice {
  // UI State
  poppedOutWindows: Record<string, PoppedOutWindow>;
  popOutTab: (id: string, x: number, y: number) => void;
  mergeTab: (id: string) => void;
  updatePoppedOutWindow: (id: string, updates: Partial<PoppedOutWindow>) => void;
  
  language: Language;
  setLanguage: (lang: Language) => void;

  activeTab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs' | 'quests';
  setActiveTab: (tab: 'global' | 'favorites' | 'session' | 'settings' | 'npcs' | 'quests') => void;
  tabDimensions: Record<string, { width?: number, height?: number }>;
  setTabDimensions: (tab: string, width?: number, height?: number) => void;
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
  bobPosition: { x: number, y: number };
  setBobPosition: (pos: { x: number, y: number }) => void;
  developerMode: boolean;
  setDeveloperMode: (dev: boolean) => void;
  autoMinimizeOnChest: boolean;
  setAutoMinimizeOnChest: (val: boolean) => void;
  isUILocked: boolean;
  setIsUILocked: (locked: boolean) => void;
  
  // Display Modes
  displayDensity: 'compact' | 'standard';
  setDisplayDensity: (density: 'compact' | 'standard') => void;
  displayMode: 'session' | 'current_zone';
  setDisplayMode: (mode: 'session' | 'current_zone') => void;
  
  // Settings UI State
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
    bobMode: boolean;
    bobIconScale: number;
    bobTextScale: number;
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
    bobDuration: number;
    bobBubbleDistance: number;
    bobBubbleOffsetY: number;
    bobTheme: 'default' | 'cyberpunk' | 'fantasy' | 'minimal' | 'hologram';
    bobIcon: 'bot' | 'ghost' | 'cat' | 'wizard' | 'skull' | 'alien' | 'dog';
    neonGlow: boolean;
    glowColorTheme: 'theme' | 'rarity' | 'type';
    toastShape: 'square' | 'rectangle' | 'smooth' | 'pill';
    customPositionX: number;
    customPositionY: number;
    volume: number;
    animation: 'slide' | 'fade' | 'pop';
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
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'custom';
    customPositionX: number;
    customPositionY: number;
    layout: 'vertical' | 'horizontal';
    borderWidth: number;
    dynamicBorderColor: boolean;
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
  };
  updateTableSettings: (settings: Partial<UISlice['tableSettings']>) => void;

  orbSize: number;
  setOrbSize: (size: number) => void;
  orbBorderThickness: number;
  setOrbBorderThickness: (thickness: number) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  theme: string;
  setTheme: (theme: string) => void;
  minimizedIcon: 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx';
  setMinimizedIcon: (icon: 'pulse' | 'lightning' | 'sword' | 'pickaxe' | 'shield' | 'roedex' | 'rx') => void;

  notifications: OverlayNotification[];
  addNotification: (notification: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  bobMessages: OverlayNotification[];
  addBobMessage: (message: Omit<OverlayNotification, 'id' | 'timestamp'>) => void;
  removeBobMessage: (id: string) => void;
}

export interface SessionSlice {
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
  chestInventory: Record<string, number>;
  setChestInventory: (inventory: Record<string, number>) => void;
  
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

  lifetimeStats: {
    mobsKilled: Record<string, number>;
    oresMined: Record<string, number>;
    treesCut: Record<string, number>;
    plantsHarvested: Record<string, number>;
  };
  incrementLifetimeStat: (category: 'mobsKilled' | 'oresMined' | 'treesCut' | 'plantsHarvested', id: string, amount?: number) => void;

  playerPosition: Vector2 | null;
  throttledPlayerPosition: Vector2 | null;
  setPlayerPosition: (pos: Vector2) => void;
  
  weapon: WeaponState | null;
  setWeapon: (weapon: WeaponState | null) => void;
  slotDurabilities: Record<number, number>;
  updateSlotDurability: (slot: number, maxDur: number) => void;
  
  armor: Partial<Record<ArmorSlot, ArmorItem>>;
  setArmor: (slot: ArmorSlot, item: ArmorItem | null) => void;
  
  packetCounts: Record<string, number>;
  incrementPacketCount: (type: string) => void;
}

export interface EntitySlice {
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

  addTimer: (timer: RespawnTimer) => void;
  removeTimer: (id: string) => void;
  clearTimers: () => void;
}

export type TrackerState = UISlice & SessionSlice & PlayerSlice & EntitySlice;
