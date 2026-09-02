import { RunStats } from '../../types/events';

export interface LootLogEntry {
  id: string;
  timestamp: number;
  runes: number;
  items: { name: string; qty: number; rarity?: string }[];
}

export interface SessionSlice {
  currentZone: string;
  setCurrentZone: (zone: string) => void;
  sessionActive: boolean;
  setSessionActive: (active: boolean) => void;
  sessionPlayerName: string | null;
  setSessionPlayerName: (name: string) => void;
  isChestOpen: boolean;
  setIsChestOpen: (open: boolean) => void;
  sessionStartTime: number | null;
  setSessionStartTime: (time: number | null) => void;
  pendingDeathDrop: { dropId: string, quantity: number, pos: { x: number, y: number }, zone: string } | null;
  setPendingDeathDrop: (drop: { dropId: string, quantity: number, pos: { x: number, y: number }, zone: string } | null) => void;
  isDeathRecoveryMode: boolean;
  setDeathRecoveryMode: (active: boolean) => void;
  sessionRunes: number;
  setSessionRunes: (runes: number | ((prev: number) => number)) => void;
  sessionLoot: Record<string, number>;
  addSessionLoot: (itemName: string, quantity: number) => void;
  sessionRuneDrops: { id: string; qty: number; timestamp: number }[];
  addSessionRuneDrop: (qty: number) => void;

  recentLootLogs: LootLogEntry[];
  addLootLogEntry: (name: string, qty: number, isRunestone?: boolean) => void;
  clearLootLogs: () => void;
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
  deleteRun: (id: string) => void;

  clearSession: () => void;
  clearSessionCache: () => void;
}
