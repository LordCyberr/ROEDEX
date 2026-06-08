import { StateCreator } from 'zustand';
import { TrackerState, EntitySlice } from '../storeTypes';
import { EnemyEntity, ResourceNode, LootDrop, RespawnTimer } from '../../types/events';

export const createEntitySlice: StateCreator<TrackerState, [], [], EntitySlice> = (set) => ({
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
        const key = `${enemy.zone || state.currentZone}-${enemy.entityIndex}`;
        if (!enemy.isDead) {
          delete newTimers[`mob-${key}`];
        }
        newEnemies[key] = enemy;
      });
      return { enemies: newEnemies, timers: newTimers };
    }),
  updateEnemyHp: (key: string, hp: number, isDead: boolean) =>
    set((state) => {
      const enemy = state.enemies[key];
      if (!enemy) return state;
      
      let newMobsKilled = state.sessionMobsKilled;
      if (isDead && !enemy.isDead && state.sessionActive) {
        newMobsKilled += 1;
      }

      return {
        sessionMobsKilled: newMobsKilled,
        enemies: {
          ...state.enemies,
          [key]: { ...enemy, hp, isDead }
        }
      };
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
        const key = `${res.zone || state.currentZone}-${res.idx}`;
        if (!res.gathered) {
          delete newTimers[`resource-${key}`];
        }
        newResources[key] = res;
      });
      return { resources: newResources, timers: newTimers };
    }),
  updateResourceHp: (key: string, hp: number, gathered?: boolean) =>
    set((state) => {
      const res = state.resources[key];
      if (!res) return state;
      
      let { sessionTreesCut, sessionOresMined, sessionPlantsHarvested } = state;
      
      if (gathered && !res.gathered && state.sessionActive) {
        if (res.type === 'Trees') {
          sessionTreesCut += 1;
        } else if (res.type === 'Ores') {
          sessionOresMined += 1;
        } else {
          sessionPlantsHarvested += 1;
        }
      }

      return {
        sessionTreesCut,
        sessionOresMined,
        sessionPlantsHarvested,
        resources: {
          ...state.resources,
          [key]: { ...res, hp, gathered: gathered !== undefined ? gathered : res.gathered }
        }
      };
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
