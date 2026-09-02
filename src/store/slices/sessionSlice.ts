import { StateCreator } from 'zustand';
import { TrackerState, SessionSlice } from '../storeTypes';
import { useSettingsStore } from '../settingsStore';
import { getResellValue } from '../../data/prices';
import { getItemInfo } from '../../data/rarity';

export const createSessionSlice: StateCreator<TrackerState, [], [], SessionSlice> = (set, get) => ({
  currentZone: 'Unknown',
  setCurrentZone: (zone: string) => {
    const state = get();
    if (state.currentZone !== zone && zone !== 'Unknown') {
      const settings = useSettingsStore.getState();
      const newCollapsedZones = { ...settings.collapsedSidebarZones };
      if (settings.layoutMode === 'vertical') {
        Object.keys(newCollapsedZones).forEach(k => {
          newCollapsedZones[k] = true;
        });
        newCollapsedZones[zone] = false;
      }
      useSettingsStore.setState({ collapsedSidebarZones: newCollapsedZones });
      set({ currentZone: zone });
    } else {
      set({ currentZone: zone });
    }
  },
  sessionActive: true,
  setSessionActive: (active: boolean) => set({ sessionActive: active }),
  isChestOpen: false,
  setIsChestOpen: (open: boolean) => set({ isChestOpen: open }),
  sessionPlayerName: null,
  setSessionPlayerName: (name: string) => set({ sessionPlayerName: name }),
  sessionStartTime: 0,
  setSessionStartTime: (time: number | null) => set({ sessionStartTime: time }),
  pendingDeathDrop: null,
  setPendingDeathDrop: (drop: any) => set({ pendingDeathDrop: drop }),
  isDeathRecoveryMode: false,
  setDeathRecoveryMode: (active: boolean) => set({ isDeathRecoveryMode: active }),
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
  sessionRuneDrops: [],
  addSessionRuneDrop: (qty: number) => set((state) => {
    if (!state.sessionActive) return state;
    const drop = { id: Math.random().toString(36).substring(7), qty, timestamp: Date.now() };
    return {
      sessionRuneDrops: [drop, ...state.sessionRuneDrops].slice(0, 50)
    };
  }),
  recentLootLogs: [],
  addLootLogEntry: (name: string, qty: number, isRunestone = false) => set((state) => {
    const info = getItemInfo(name);
    const now = Date.now();
    let updatedLogs = [...state.recentLootLogs];
    
    // Check if the topmost event happened within 300ms
    if (updatedLogs.length > 0 && (now - updatedLogs[0].timestamp < 300)) {
      const topEvent = { ...updatedLogs[0], items: [...updatedLogs[0].items] };
      
      if (isRunestone) {
        topEvent.runes += qty;
      } else {
        const existingIndex = topEvent.items.findIndex(i => i.name === name);
        if (existingIndex !== -1) {
          topEvent.items[existingIndex] = {
            ...topEvent.items[existingIndex],
            qty: topEvent.items[existingIndex].qty + qty
          };
        } else {
          topEvent.items.push({ name, qty, rarity: info?.rarity || 'common' });
        }
      }
      topEvent.timestamp = now; // keep the window open for sequential fast drops
      updatedLogs[0] = topEvent;
    } else {
      updatedLogs.unshift({
        id: Math.random().toString(36).substring(7),
        timestamp: now,
        runes: isRunestone ? qty : 0,
        items: isRunestone ? [] : [{ name, qty, rarity: info?.rarity || 'common' }]
      });
    }

    return {
      recentLootLogs: updatedLogs.slice(0, 100)
    };
  }),
  clearLootLogs: () => set({ recentLootLogs: [] }),
  chestTotalValue: 0,
  setChestTotalValue: (val: number | ((prev: number) => number)) => set((state) => ({
    chestTotalValue: typeof val === 'function' ? val(state.chestTotalValue) : val
  })),
  chestInventory: {},
  setChestInventory: (inventory) => set({ chestInventory: inventory }),
  bankTotalValue: 0,
  setBankTotalValue: (val: number | ((prev: number) => number)) => set((state) => ({
    bankTotalValue: typeof val === 'function' ? val(state.bankTotalValue) : val
  })),
  bankInventory: {},
  setBankInventory: (inventory) => set({ bankInventory: inventory }),

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

    // Calculate top loot
    const lootArray = Object.entries(state.sessionLoot).map(([name, qty]) => {
      const value = getResellValue(name, qty);
      return { name, qty, value };
    });
    const topLoot = lootArray.sort((a, b) => b.value - a.value).slice(0, 5);

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
      zonesVisited: [...state.sessionZonesVisited],
      zone: state.currentZone,
      topLoot
    };
    return {
      runHistory: [newRun, ...state.runHistory].slice(0, 50),
      sessionActive: false,
      sessionStartTime: null
    };
  }),
  clearRunHistory: () => set({ runHistory: [] }),
  deleteRun: (id: string) => set((state) => ({
    runHistory: state.runHistory.filter((run) => run.id !== id)
  })),

  clearSession: () => set({
    sessionRunes: 0,
    sessionLoot: {},
    sessionRuneDrops: [],
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
