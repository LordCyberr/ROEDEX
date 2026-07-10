import { StateCreator } from 'zustand';
import { TrackerState, PlayerSlice, ArmorSlot, ArmorItem } from '../storeTypes';
import { Vector2, WeaponState } from '../../types/events';

let lastPositionUpdateTime = 0;

export const createPlayerSlice: StateCreator<TrackerState, [], [], PlayerSlice> = (set, get) => ({
  connected: false,
  setConnected: (status: boolean) => set({ connected: status }),
  
  sessionPlayerName: null,
  setSessionPlayerName: (name: string) => set({ sessionPlayerName: name }),
  
  zoneGraph: {},
  
  playerProfile: {
    level: 1,
    currentRunes: 0,
    runesRequired: 1000,
    name: ''
  },
  setPlayerProfile: (profile: Partial<PlayerSlice['playerProfile']>) => set((state) => {
    let hasChanges = false;
    for (const key in profile) {
      const k = key as keyof typeof profile;
      if (profile[k] !== undefined && profile[k] !== state.playerProfile[k]) {
        hasChanges = true;
        break;
      }
    }
    if (!hasChanges) return state;
    
    return {
      playerProfile: { ...state.playerProfile, ...profile }
    };
  }),

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
    
    // Dynamic Zone Graph Mapping
    if (zone && zone !== 'Unknown' && state.playerZone && state.playerZone !== 'Unknown' && zone !== state.playerZone) {
       // Only record if we actually have a position and it's not a respawn (Town jump from far away)
       // A valid transition usually means the player is close to the door. We don't have door coordinates easily,
       // but we know the FIRST position in the new zone is the entrance of the new zone.
       // The LAST position in the old zone is the entrance of the old zone.
       // We can just record the first position we see in the new zone as the target door for the old zone!
       // Actually, to get to NEW ZONE from OLD ZONE, you need to go to OLD ZONE's door. We don't have it right now.
       // But to get to OLD ZONE from NEW ZONE, you need to go to NEW ZONE's door (which is pos).
       if (pos) {
          set((s) => {
             const graph = { ...s.zoneGraph };
             if (!graph[zone]) graph[zone] = {};
             // We just entered `zone` from `state.playerZone` at `pos`.
             // So if we are ever in `zone` and want to go back to `state.playerZone`, we go to `pos`.
             graph[zone] = { ...graph[zone], [state.playerZone]: { x: pos.x, y: pos.y } };
             
             // What about going from state.playerZone to zone? We need the LAST position in state.playerZone.
             if (state.playerPosition) {
                if (!graph[state.playerZone]) graph[state.playerZone] = {};
                graph[state.playerZone] = { ...graph[state.playerZone], [zone]: { x: state.playerPosition.x, y: state.playerPosition.y } };
             }
             return { zoneGraph: graph };
          });
       }
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
  setWeapon: (weapon: WeaponState | null) => set((state) => {
    if (!weapon && !state.weapon) return state;
    if (weapon && state.weapon) {
      if (
        weapon.name === state.weapon.name &&
        weapon.durability === state.weapon.durability &&
        weapon.maxDurability === state.weapon.maxDurability &&
        weapon.slot === state.weapon.slot
      ) {
        return state; // No changes
      }
    }
    return { weapon };
  }),
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
