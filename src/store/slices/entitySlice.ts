import { StateCreator } from 'zustand';
import { TrackerState, EntitySlice } from '../storeTypes';
import { EnemyEntity, ResourceNode, LootDrop, RespawnTimer } from '../../types/events';



export const createEntitySlice: StateCreator<TrackerState, [], [], EntitySlice> = (set) => ({
  activeWaypoint: null,
  activeWaypointName: null,
  activeWaypointZone: null,
  setActiveWaypoint: (pos, name = null, zone = null) => set({ activeWaypoint: pos, activeWaypointName: name, activeWaypointZone: zone }),

  currentTarget: null,
  setCurrentTarget: (target) => set({ currentTarget: target }),

  enemies: {},
  resources: {},
  loot: {},
  timers: {},

  setEnemy: (key: string, enemy: EnemyEntity) => 
    set((state) => {
      const newTimers = { ...state.timers };
      if (!enemy.isDead) {
        delete newTimers[`mob-${key}`];
      }
      return {
        enemies: { ...state.enemies, [key]: enemy },
        timers: newTimers
      };
    }),
  batchSetEnemies: (enemiesList: EnemyEntity[]) =>
    set((state) => {
      if (!enemiesList || enemiesList.length === 0) return state;
      const newTimers = { ...state.timers };
      const newEnemies = { ...state.enemies };
      enemiesList.forEach(enemy => {
        const key = `${enemy.zone || state.currentZone || 'Unknown'}-${enemy.entityIndex}`;
        if (!enemy.isDead) {
          delete newTimers[`mob-${key}`];
        }
        newEnemies[key] = enemy;
      });
      return { enemies: newEnemies, timers: newTimers };
    }),
  removeEnemy: (key: string) =>
    set((state) => {
      if (!state.enemies[key]) return state;
      const newEnemies = { ...state.enemies };
      delete newEnemies[key];
      return { enemies: newEnemies };
    }),
  clearEnemies: () => set((state) => {
    if (Object.keys(state.enemies).length === 0) return state;
    return { enemies: {} };
  }),

  setResource: (key: string, resource: ResourceNode) =>
    set((state) => {
      const newTimers = { ...state.timers };
      if (!resource.gathered) {
        delete newTimers[`resource-${key}`];
      }
      return {
        resources: { ...state.resources, [key]: resource },
        timers: newTimers
      };
    }),
  batchSetResources: (resourcesList: ResourceNode[]) =>
    set((state) => {
      if (!resourcesList || resourcesList.length === 0) return state;
      const newTimers = { ...state.timers };
      const newResources = { ...state.resources };
      resourcesList.forEach(res => {
        const key = `${res.zone || state.currentZone || 'Unknown'}-${res.idx}`;
        if (!res.gathered) {
          delete newTimers[`resource-${key}`];
        }
        newResources[key] = res;
      });
      return { resources: newResources, timers: newTimers };
    }),
  removeResource: (key: string) =>
    set((state) => {
      if (!state.resources[key]) return state;
      const newResources = { ...state.resources };
      delete newResources[key];
      return { resources: newResources };
    }),
  clearResources: () => set((state) => {
    if (Object.keys(state.resources).length === 0) return state;
    return { resources: {} };
  }),

  addLoot: (drop: LootDrop) =>
    set((state) => ({
      loot: { ...state.loot, [drop.dropId]: drop }
    })),
  removeLoot: (dropId: string) =>
    set((state) => {
      if (!state.loot[dropId]) return state;
      const newLoot = { ...state.loot };
      delete newLoot[dropId];
      return { loot: newLoot };
    }),
  clearLoot: () => set((state) => {
    if (Object.keys(state.loot).length === 0) return state;
    return { loot: {} };
  }),
  clearExpiredLoot: () => set((state) => {
    const now = Date.now();
    let changed = false;
    const newLoot = { ...state.loot };
    for (const dropId in newLoot) {
       if (now - newLoot[dropId].spawnTime > 60000) {
          delete newLoot[dropId];
          changed = true;
       }
    }
    if (changed) return { loot: newLoot };
    return state;
  }),
  clearExpiredEntities: (maxDist = 1500) => set((state) => {
    if (!state.playerPosition) return state;
    const px = state.playerPosition.x;
    const py = state.playerPosition.y;
    const maxDistSq = maxDist * maxDist;
    
    let changed = false;
    const newEnemies = { ...state.enemies };
    for (const key in newEnemies) {
       const e = newEnemies[key];
       if (e.pos && ((e.pos.x - px) ** 2 + (e.pos.y - py) ** 2 > maxDistSq)) {
          delete newEnemies[key];
          changed = true;
       }
    }
    
    const newResources = { ...state.resources };
    for (const key in newResources) {
       const r = newResources[key];
       if (r.pos && ((r.pos.x - px) ** 2 + (r.pos.y - py) ** 2 > maxDistSq)) {
          delete newResources[key];
          changed = true;
       }
    }
    
    if (changed) return { enemies: newEnemies, resources: newResources };
    return state;
  }),


  addTimer: (timer: RespawnTimer) =>
    set((state) => ({
      timers: { ...state.timers, [timer.id]: timer }
    })),
  removeTimer: (id: string) =>
    set((state) => {
      if (!state.timers[id]) return state;
      const newTimers = { ...state.timers };
      delete newTimers[id];
      return { timers: newTimers };
    }),
  clearTimers: () => set((state) => {
    if (Object.keys(state.timers).length === 0) return state;
    return { timers: {} };
  })
});
