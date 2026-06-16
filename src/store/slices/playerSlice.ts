import { StateCreator } from 'zustand';
import { TrackerState, PlayerSlice, ArmorSlot, ArmorItem } from '../storeTypes';
import { Vector2, WeaponState } from '../../types/events';

let lastPositionUpdateTime = 0;

export const createPlayerSlice: StateCreator<TrackerState, [], [], PlayerSlice> = (set) => ({
  connected: false,
  setConnected: (status: boolean) => set({ connected: status }),
  
  sessionPlayerName: null,
  setSessionPlayerName: (name: string) => set({ sessionPlayerName: name }),
  
  playerProfile: {
    level: 1,
    currentRunes: 0,
    runesRequired: 1000,
    name: ''
  },
  setPlayerProfile: (profile: Partial<PlayerSlice['playerProfile']>) => set((state) => ({
    playerProfile: { ...state.playerProfile, ...profile }
  })),

  lifetimeStats: {
    mobsKilled: {},
    oresMined: {},
    treesCut: {},
    plantsHarvested: {},
    itemsLooted: {}
  },
  setLifetimeStats: (stats) => set({ lifetimeStats: stats }),
  incrementLifetimeStat: (category: 'mobsKilled' | 'oresMined' | 'treesCut' | 'plantsHarvested' | 'itemsLooted', id: string, amount = 1) => set((state) => {
    const currentStats = state.lifetimeStats[category];
    return {
      lifetimeStats: {
        ...state.lifetimeStats,
        [category]: {
          ...currentStats,
          [id]: (currentStats[id] || 0) + amount
        }
      }
    };
  }),

  quests: [],
  setQuests: (quests) => set({ quests }),
  
  playerPosition: null,
  throttledPlayerPosition: null,
  setPlayerPosition: (pos: Vector2) => set((state) => {
    const now = Date.now();
    if (now - lastPositionUpdateTime < 100) {
      return state; // Skip — too soon
    }
    lastPositionUpdateTime = now;
    if (!state.throttledPlayerPosition) {
      return { playerPosition: pos, throttledPlayerPosition: pos };
    }
    const dx = pos.x - state.throttledPlayerPosition.x;
    const dy = pos.y - state.throttledPlayerPosition.y;
    const distSq = dx * dx + dy * dy;
    
    // Throttle to 15 units of distance (225 sq) to prevent massive React re-renders of lists
    if (distSq > 225) {
      return { playerPosition: pos, throttledPlayerPosition: pos };
    }
    return { playerPosition: pos };
  }),
  
  weapon: null,
  setWeapon: (weapon: WeaponState | null) => set({ weapon }),
  slotDurabilities: {},
  updateSlotDurability: (slot: number, maxDur: number) => set((state) => ({
    slotDurabilities: { ...state.slotDurabilities, [slot]: maxDur }
  })),
  
  armor: {},
  setArmor: (slot: ArmorSlot, item: ArmorItem | null) => set((state) => {
    if (!item) {
      const newArmor = { ...state.armor };
      delete newArmor[slot];
      return { armor: newArmor };
    }
    return {
      armor: {
        ...state.armor,
        [slot]: item
      }
    };
  }),

  packetCounts: {},
  incrementPacketCount: (type: string) => set((state) => ({
    packetCounts: { ...state.packetCounts, [type]: (state.packetCounts[type] || 0) + 1 }
  })),
});
