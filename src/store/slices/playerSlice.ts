import { StateCreator } from 'zustand';
import { TrackerState, PlayerSlice, ArmorSlot, ArmorItem } from '../storeTypes';
import { Vector2, WeaponState } from '../../types/events';

let lastPositionUpdateTime = 0;

export const createPlayerSlice: StateCreator<TrackerState, [], [], PlayerSlice> = (set, get) => ({
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

  isGuildPassActive: false,
  setIsGuildPassActive: (active: boolean) => set({ isGuildPassActive: active }),

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
  playerZone: 'Town',
  throttledPlayerPosition: null,
  setPlayerPosition: (pos: Vector2 | null, zone?: string) => {
    const state = get();
    if (zone && zone !== state.playerZone && state.isRecording) {
      // Record zone entry
      state.addRoutePoint({
        action: 'enter_zone',
        x: pos?.x || 0,
        y: pos?.y || 0,
        detail: zone
      });
    }

    if (!pos) {
      const updates: any = { playerPosition: null, throttledPlayerPosition: null };
      if (zone) updates.playerZone = zone;
      set(updates);
      return;
    }
    
    const now = Date.now();
    if (now - lastPositionUpdateTime < 100) {
      return; // Skip — too soon
    }
    lastPositionUpdateTime = now;
    if (!state.throttledPlayerPosition) {
      set({ playerPosition: pos, throttledPlayerPosition: pos, playerZone: zone || state.playerZone });
      return;
    }
    const dx = pos.x - state.throttledPlayerPosition.x;
    const dy = pos.y - state.throttledPlayerPosition.y;
    const distSq = dx * dx + dy * dy;
    
    // Throttle to 15 units of distance (225 sq) to prevent massive React re-renders of lists
    if (distSq > 225) {
      const updates: any = { playerPosition: pos, throttledPlayerPosition: pos };
      if (zone) updates.playerZone = zone;
      set(updates);
      return;
    }
    const updates: any = { playerPosition: pos };
    if (zone) updates.playerZone = zone;
    set(updates);
  },
  
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

  onlinePlayers: {},
  setOnlinePlayer: (id: string, player: Partial<import('../storeTypes').OnlinePlayer>) => set((state) => {
    const existing = state.onlinePlayers[id];
    return {
      onlinePlayers: {
        ...state.onlinePlayers,
        [id]: {
          id,
          username: player.username || existing?.username || 'Unknown',
          position: player.position || existing?.position,
          zone: player.zone || existing?.zone || state.currentZone,
          lastSeen: player.lastSeen || Date.now()
        }
      }
    };
  }),
  removeOnlinePlayer: (id: string) => set((state) => {
    const newPlayers = { ...state.onlinePlayers };
    delete newPlayers[id];
    return { onlinePlayers: newPlayers };
  }),
  clearOnlinePlayers: () => set({ onlinePlayers: {} })
});
