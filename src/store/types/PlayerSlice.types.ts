import { WeaponState, Vector2 } from '../../types/events';

export interface CustomMarker {
  id: string;
  zone: string;
  x: number;
  y: number;
  label: string;
  color?: string;
  presetIndex: number;
}

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
  id: string;
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
  currentAmount: number;
  current_step: number;
}

export interface PlayerSlice {
  connected: boolean;
  setConnected: (status: boolean) => void;

  sessionPlayerName: string | null;
  setSessionPlayerName: (name: string) => void;
  isLoadingZone: boolean;
  setIsLoadingZone: (loading: boolean) => void;

  quests: Quest[];
  setQuests: (quests: Quest[]) => void;

  playerProfile: {
    level: number;
    currentRunes: number;
    runesRequired: number;
    name?: string;
    walletAddress?: string;
    ethBalance?: number;
    hp?: number;
    maxHp?: number;
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

  exploredPoints: Record<string, {x: number, y: number}[]>;
  addExploredPoint: (point: {x: number, y: number}, zone: string) => void;
  appendExploredPoints: (zone: string, points: {x: number, y: number}[]) => void;
  setExploredPointsForZone: (zone: string, points: {x: number, y: number}[]) => void;
  clearExploredForZone: (zone: string) => void;
  customMarkers: CustomMarker[];
  addCustomMarker: (marker: Omit<CustomMarker, 'id'>) => void;
  removeCustomMarker: (id: string) => void;
  updateCustomMarker: (id: string, patch: { label?: string; color?: string }) => void;

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

  zoneGraph: Record<string, Record<string, Vector2>>;
  quickBarInstances: (string | null)[];
  setQuickBarInstances: (instances: (string | null)[]) => void;
  updateQuickBarInstance: (slot: number, instanceId: string | null) => void;
  inventoryInstances: Record<string, string>;
  setInventoryInstances: (mapping: Record<string, string>) => void;
}
