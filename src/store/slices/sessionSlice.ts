import { StateCreator } from 'zustand';
import { TrackerState, SessionSlice } from '../storeTypes';

export const createSessionSlice: StateCreator<TrackerState, [], [], SessionSlice> = (set, get) => ({
  currentZone: 'Unknown',
  setCurrentZone: (zone: string) => {
    const state = get();
    if (state.currentZone !== zone && zone !== 'Unknown') {
      const newCollapsedZones = { ...state.collapsedSidebarZones };
      if (state.layoutMode === 'vertical') {
        Object.keys(newCollapsedZones).forEach(k => {
          newCollapsedZones[k] = true;
        });
        newCollapsedZones[zone] = false;
      }
      set({ currentZone: zone, collapsedSidebarZones: newCollapsedZones });
    } else {
      set({ currentZone: zone });
    }
  },
  sessionActive: false,
  setSessionActive: (active: boolean) => set({ sessionActive: active }),
  sessionStartTime: null,
  setSessionStartTime: (time: number | null) => set({ sessionStartTime: time }),
  sessionRunes: 0,
  setSessionRunes: (val: number | ((prev: number) => number)) => set((state) => ({ 
    sessionRunes: typeof val === 'function' ? val(state.sessionRunes) : val 
  })),
  sessionLoot: {},
  addSessionLoot: (itemName: string, quantity: number) => set((state) => {
    if (!state.sessionActive) return state;
    return {
      sessionLoot: {
        ...state.sessionLoot,
        [itemName]: (state.sessionLoot[itemName] || 0) + quantity
      }
    };
  }),
  chestTotalValue: 0,
  setChestTotalValue: (val: number | ((prev: number) => number)) => set((state) => ({
    chestTotalValue: typeof val === 'function' ? val(state.chestTotalValue) : val
  })),
  chestInventory: {},
  setChestInventory: (inventory) => set({ chestInventory: inventory }),
  
  sessionMobsKilled: 0,
  sessionTreesCut: 0,
  sessionOresMined: 0,
  sessionPlantsHarvested: 0,
  sessionZonesVisited: [],
  
  incrementMobsKilled: () => set((state) => ({ sessionMobsKilled: state.sessionMobsKilled + 1 })),
  incrementTreesCut: () => set((state) => ({ sessionTreesCut: state.sessionTreesCut + 1 })),
  incrementOresMined: () => set((state) => ({ sessionOresMined: state.sessionOresMined + 1 })),
  incrementPlantsHarvested: () => set((state) => ({ sessionPlantsHarvested: state.sessionPlantsHarvested + 1 })),
  
  runHistory: [],
  sessionSettings: {
    timeAttackMinutes: 30,
    lootValueGoal: 1000
  },
  updateSessionSettings: (settings: Partial<SessionSlice['sessionSettings']>) => set((state) => ({
    sessionSettings: { ...state.sessionSettings, ...settings }
  })),
  endSession: (lootWorth: number) => set((state) => {
    if (!state.sessionActive || !state.sessionStartTime) return state;
    const duration = Date.now() - state.sessionStartTime;
    const newRun = {
      id: Date.now().toString(),
      startTime: state.sessionStartTime,
      endTime: Date.now(),
      duration: duration,
      runes: state.sessionRunes,
      chestValue: state.chestTotalValue,
      lootWorth,
      loot: { ...state.sessionLoot },
      mobsKilled: state.sessionMobsKilled,
      treesCut: state.sessionTreesCut,
      oresMined: state.sessionOresMined,
      plantsHarvested: state.sessionPlantsHarvested,
      zonesVisited: [...state.sessionZonesVisited]
    };
    return {
      runHistory: [newRun, ...state.runHistory].slice(0, 50),
      sessionActive: false,
      sessionStartTime: null
    };
  }),
  clearRunHistory: () => set({ runHistory: [] }),

  clearSession: () => set({
    sessionRunes: 0,
    sessionLoot: {},
    chestTotalValue: 0,
    sessionStartTime: Date.now(),
    sessionMobsKilled: 0,
    sessionTreesCut: 0,
    sessionOresMined: 0,
    sessionPlantsHarvested: 0,
    sessionZonesVisited: []
  }),
  clearSessionCache: () => set({
    enemies: {},
    resources: {},
    timers: {}
  })
});
