import { StateCreator } from 'zustand';
import { TrackerState, PlayerSlice, ArmorSlot, ArmorItem } from '../storeTypes';
import { Vector2, WeaponState } from '../../types/events';
import { useAnalyticsStore } from '../analyticsStore';

let lastPositionUpdateTime = 0;
const sessionBootTime = Date.now();

// ── Spatial dedup grid for fog-of-war explored points ────────────────────────
// Maps "zone|cellX|cellY" → true. A cell = 5×5 game-unit block.
// This is a module-level Set so it persists across renders without touching Zustand.
// When a player walks somewhere new, the cell is marked. Re-visiting the same
// cell is a no-op: we never add a duplicate point to exploredPoints[].
// ── Spatial dedup grid for fog-of-war explored points ────────────────────────
export const GRID_CELL = 4; // Aligned to FOG_UNITS=7 (seamless precise fog pathing)
const exploredCells = new Set<string>();

// Module-level cache of last known position per zone (survives zone transitions)
const lastZonePositions: Record<string, Vector2> = {};
const lastValidZonePositions: Record<string, Vector2> = {};

export function getLastKnownZonePos(zone: string): Vector2 | null {
  return lastValidZonePositions[zone] || lastZonePositions[zone] || null;
}

export function purgeExploredCellsCache(zone?: string) {
  if (zone) {
    const prefix = `${zone}|`;
    for (const key of Array.from(exploredCells)) {
      if (key.startsWith(prefix)) exploredCells.delete(key);
    }
  } else {
    exploredCells.clear();
  }
}

function cellKey(zone: string, x: number, y: number): string {
  return `${zone}|${Math.floor(x / GRID_CELL)}|${Math.floor(y / GRID_CELL)}`;
}

export function seedExploredCells(exploredPoints: Record<string, {x: number, y: number}[]>) {
  for (const [zone, points] of Object.entries(exploredPoints || {})) {
    if (Array.isArray(points)) {
      for (const pt of points) {
        if (pt && typeof pt.x === 'number' && typeof pt.y === 'number') {
          exploredCells.add(cellKey(zone, pt.x, pt.y));
        }
      }
    }
  }
}

// -- removed inference state --

export function simplifyZoneName(z: string): string {
  if (!z) return '';
  let clean = z
    .replace(/^Entrance to\s+/i, '')
    .replace(/^Exit to\s+/i, '')
    .replace(/\s+Entrance$/i, '')
    .replace(/\s+Exit$/i, '')
    .replace(/^Entrance\s+/i, '')
    .trim();

  const lower = clean.toLowerCase();
  if (lower === 'mineslower' || lower === 'lower mines' || lower === 'lowermines') return 'Lower Mines';
  if (lower === 'easttown' || lower === 'east town') return 'East Town';
  if (lower === 'blacksmith') return 'Blacksmith';
  if (lower === 'marketplace' || lower === 'mainland_marketplace_a' || lower === 'marketplace_a') return 'Marketplace';
  if (lower === 'alchemist' || lower === 'mainland_alchemist') return 'Alchemist';
  if (lower === 'tavern') return 'Tavern';
  if (lower === 'bank') return 'Bank';
  if (lower === 'house' || lower === 'home' || lower === 'mainland_house_a') return 'Home';
  if (lower === 'guild' || lower === 'mainland_guild_a') return 'Guild';
  if (lower === 'mines' || lower === 'mine') return 'Mines';
  if (lower === 'forest') return 'Forest';
  if (lower === 'town' || lower === 'mainland_town_a') return 'Town';
  if (lower === 'filburt' || lower === 'mainland_filburt') return 'Filburt';

  return clean;
}

// --- Helpers for setPlayerPosition ---

function handlePendingEntrance(state: any, pos: Vector2, targetZone: string) {
  const pendingEntrance = state.pendingZoneEntrance;
  if (pendingEntrance && pos) {
    const entranceZone = pendingEntrance.toZone || targetZone;
    const fromZone = pendingEntrance.fromZone;
    if (entranceZone && fromZone && entranceZone !== fromZone) {
      if (typeof state.recordZonePortal === 'function') state.recordZonePortal(entranceZone, fromZone, pos);
      // Route tracking removed
    }
    if (typeof state.setPendingZoneEntrance === 'function') state.setPendingZoneEntrance(null);
  }
}

function updateZoneGraph(state: any, capturedPrevZone: string, zone: string, capturedPrevPos: Vector2, capturedNewPos: Vector2) {
  const graph = { ...state.zoneGraph };
  if (!graph[zone]) graph[zone] = {};
  graph[zone] = { ...graph[zone], [capturedPrevZone]: capturedNewPos };
  if (capturedPrevPos && capturedPrevZone !== 'Unknown') {
    if (!graph[capturedPrevZone]) graph[capturedPrevZone] = {};
    graph[capturedPrevZone] = { ...graph[capturedPrevZone], [zone]: { x: capturedPrevPos.x, y: capturedPrevPos.y } };
  }
  return graph;
}

function autoPlaceZoneMarker(state: any, capturedPrevZone: string, capturedPrevPos: Vector2, markerLabel: string) {
  const existingMarkers = state.customMarkers || [];
  const isDuplicate = existingMarkers.some((m: any) => 
    m.zone === capturedPrevZone && 
    (m.label === markerLabel || m.label === `Entrance to ${markerLabel}`) &&
    Math.hypot(m.x - capturedPrevPos.x, m.y - capturedPrevPos.y) < 25
  );

  if (!isDuplicate && capturedPrevPos) {
    return [...state.customMarkers, {
      id: crypto.randomUUID(),
      zone: capturedPrevZone,
      x: capturedPrevPos.x,
      y: capturedPrevPos.y,
      label: markerLabel,
      color: '#38bdf8', // Sky blue
      presetIndex: 0,
    }];
  }
  return state.customMarkers;
}

function trackFogOfWar(state: any, currentZone: string, pos: Vector2) {
  const key = cellKey(currentZone, pos.x, pos.y);
  if (!exploredCells.has(key)) {
    exploredCells.add(key);
    // Store the quantized cell center, not the raw position.
    // This reduces stored points 4-10x (one per GRID_CELL block) and eliminates
    // sub-cell jitter that causes the trail to look noisy/dotted.
    const cellX = Math.floor(pos.x / GRID_CELL) * GRID_CELL + GRID_CELL / 2;
    const cellY = Math.floor(pos.y / GRID_CELL) * GRID_CELL + GRID_CELL / 2;
    const quantizedPos: Vector2 = { x: cellX, y: cellY };
    const zonePoints = state.exploredPoints[currentZone] || [];
    return { ...state.exploredPoints, [currentZone]: [...zonePoints, quantizedPos] };
  }
  return undefined;
}

// Barrier inference route point logging removed
// Jump route tracking removed

export const createPlayerSlice: StateCreator<TrackerState, [], [], PlayerSlice> = (set, get) => ({
  connected: false,
  setConnected: (status: boolean) => set((state) => {
    if (status && !state.connected) useAnalyticsStore.getState().startSession();
    if (!status && state.connected) useAnalyticsStore.getState().endSession();
    return { connected: status };
  }),
  
  sessionPlayerName: null,
  setSessionPlayerName: (name: string) => set({ sessionPlayerName: name }),
  
  isLoadingZone: false,
  setIsLoadingZone: (loading: boolean) => set({ isLoadingZone: loading }),
  
  zoneGraph: {},
  quickBarInstances: Array(10).fill(null),
  setQuickBarInstances: (instances) => set({ quickBarInstances: instances }),
  updateQuickBarInstance: (slot, instanceId) => set((state) => {
    const newInstances = [...state.quickBarInstances];
    newInstances[slot] = instanceId;
    return { quickBarInstances: newInstances };
  }),
  inventoryInstances: {},
  setInventoryInstances: (mapping) => set({ inventoryInstances: mapping }),
  
  playerProfile: {
    level: 1,
    currentRunes: 0,
    runesRequired: 1000,
    name: '',
    hp: 0,
    maxHp: 0
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
    
    const updated = { ...state.playerProfile, ...profile };

    // Analytics: Track Runestone Flow
    if (profile.currentRunes !== undefined && state.playerProfile.currentRunes !== undefined) {
      const delta = profile.currentRunes - state.playerProfile.currentRunes;
      if (delta > 0) {
        useAnalyticsStore.getState().addRunestonesEarned(delta);
      } else if (delta < 0) {
        useAnalyticsStore.getState().addRunestonesLost(Math.abs(delta));
      }
    }

    if (profile.level !== undefined && state.playerProfile.level !== undefined) {
      if (profile.level > state.playerProfile.level) {
        useAnalyticsStore.getState().recordLevelUp();
      }
    }

    if (profile.hp === 0 && state.playerProfile.hp !== undefined && state.playerProfile.hp > 0) {
      useAnalyticsStore.getState().recordDeath();
    }

    // Auto-heal/initialize hp to maxHp if maxHp is set and hp was uninitialized (0)
    if (updated.maxHp && updated.maxHp > 0 && updated.hp === 0 && profile.hp === undefined && state.playerProfile.hp === 0) {
      updated.hp = updated.maxHp;
    }

    return {
      playerProfile: updated
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
  
  exploredPoints: {},
  addExploredPoint: (point: {x: number, y: number}, zone: string) => set((state) => {
    const key = cellKey(zone, point.x, point.y);
    if (exploredCells.has(key)) return state;
    exploredCells.add(key);
    const zonePoints = state.exploredPoints[zone] || [];
    return {
      exploredPoints: {
        ...state.exploredPoints,
        [zone]: [...zonePoints, point]
      }
    };
  }),

  appendExploredPoints: (zone: string, points: {x: number, y: number}[]) => set((state) => {
    if (!zone || !points.length) return state;
    const zonePoints = state.exploredPoints[zone] || [];
    const newPoints: {x: number, y: number}[] = [];
    for (const p of points) {
      const key = cellKey(zone, p.x, p.y);
      if (!exploredCells.has(key)) {
        exploredCells.add(key);
        newPoints.push(p);
      }
    }
    if (newPoints.length === 0) return state;
    return {
      exploredPoints: {
        ...state.exploredPoints,
        [zone]: [...zonePoints, ...newPoints]
      }
    };
  }),

  setExploredPointsForZone: (zone: string, points: {x: number, y: number}[]) => set((state) => {
    // Seed the cache to avoid duplicates later
    points.forEach(p => exploredCells.add(cellKey(zone, p.x, p.y)));
    return {
      exploredPoints: {
        ...state.exploredPoints,
        [zone]: points
      }
    };
  }),

  clearExploredForZone: (zone: string) => set((state) => {
    purgeExploredCellsCache(zone);
    return {
      exploredPoints: { ...state.exploredPoints, [zone]: [] }
    };
  }),
  
  customMarkers: [],
  addCustomMarker: (marker) => set((state) => ({
    customMarkers: [...state.customMarkers, { ...marker, id: crypto.randomUUID() }]
  })),
  removeCustomMarker: (id: string) => set((state) => ({
    customMarkers: state.customMarkers.filter(m => m.id !== id)
  })),
  updateCustomMarker: (id: string, patch: { label?: string; color?: string }) => set((state) => ({
    customMarkers: state.customMarkers.map(m => m.id === id ? { ...m, ...patch } : m)
  })),
  


  playerPosition: null,
  playerZone: 'Unknown',
  throttledPlayerPosition: null,
  setPlayerPosition: (pos: Vector2 | null, zone?: string) => {
    const state = get();
    const now = Date.now();
    const prevPos = state.playerPosition;
    const moveDist = (pos && prevPos) ? Math.hypot(pos.x - prevPos.x, pos.y - prevPos.y) : 0;
    const isInitialBoot = (now - sessionBootTime < 5000) || lastPositionUpdateTime === 0 || !state.playerZone || state.playerZone === 'Unknown';
    const isFarTeleport = moveDist > 65;
    const targetZone = zone || state.playerZone || 'Unknown';
    const currentZoneClean = simplifyZoneName(targetZone);
    const prevZoneClean = simplifyZoneName(state.playerZone);
    const isActuallySameZone = currentZoneClean && prevZoneClean ? currentZoneClean === prevZoneClean : false;
    const isTeleportOrGlitch = isActuallySameZone && isFarTeleport;

    if (pos && targetZone && targetZone !== 'Unknown') {
      lastZonePositions[targetZone] = { x: pos.x, y: pos.y };
      if (!isFarTeleport) lastValidZonePositions[targetZone] = { x: pos.x, y: pos.y };
    }

    handlePendingEntrance(state, pos!, targetZone);

    if (!isInitialBoot && zone && currentZoneClean !== 'Unknown' && prevZoneClean !== 'Unknown' && !isActuallySameZone && !isTeleportOrGlitch && pos) {
      let markerLabel = currentZoneClean === 'Lower Mines' ? 'Lower Floor' : currentZoneClean;
      set((s) => ({
        zoneGraph: updateZoneGraph(s, state.playerZone, zone, prevPos || pos, { x: pos.x, y: pos.y }),
        customMarkers: autoPlaceZoneMarker(s, state.playerZone, prevPos || pos, markerLabel)
      }));
    }

    if (!pos) {
      set({ playerPosition: null, throttledPlayerPosition: null, ...(zone ? { playerZone: zone } : {}) });
      return;
    }
    
    lastPositionUpdateTime = now;
    if (!state.throttledPlayerPosition) {
      set({ playerPosition: pos, throttledPlayerPosition: pos, playerZone: targetZone });
      return;
    }

    const newExploredPoints = trackFogOfWar(state, targetZone, pos);
    // isRecordingBarrier removed
    
    const distSq = (pos.x - state.throttledPlayerPosition.x) ** 2 + (pos.y - state.throttledPlayerPosition.y) ** 2;
    set({
      playerPosition: pos,
      ...(zone ? { playerZone: zone } : {}),
      ...(distSq > 225 ? { throttledPlayerPosition: pos } : {}),
      ...(newExploredPoints ? { exploredPoints: newExploredPoints } : {})
    });
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
          zone: player.zone || existing?.zone || state.playerZone || 'Town',
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
