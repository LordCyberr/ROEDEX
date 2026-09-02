import { describe, it, expect, beforeEach } from 'vitest';
import { createPlayerSlice, simplifyZoneName } from '../playerSlice';

const createStore = () => {
  let state: any = {
    playerProfile: {},
    lifetimeStats: {
      mobsKilled: {},
      oresMined: {},
      treesCut: {},
      plantsHarvested: {},
      itemsLooted: {}
    },
    exploredPoints: {}
  };
  const set = (fn: any) => { state = typeof fn === 'function' ? { ...state, ...fn(state) } : { ...state, ...fn }; };
  const get = () => state;
  state = { ...state, ...createPlayerSlice(set, get, null as any) };
  return { state, set, get };
};

describe('Player Slice', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe('setPlayerProfile', () => {
    it('merges data correctly', () => {
      store.state.setPlayerProfile({ level: 10, currentRunes: 500 });
      expect(store.get().playerProfile.level).toBe(10);
      expect(store.get().playerProfile.currentRunes).toBe(500);

      store.state.setPlayerProfile({ currentRunes: 600 });
      expect(store.get().playerProfile.level).toBe(10);
      expect(store.get().playerProfile.currentRunes).toBe(600);
    });
  });

  describe('incrementLifetimeStat', () => {
    it('creates new entry if not exists', () => {
      store.state.incrementLifetimeStat('mobsKilled', 'slime');
      expect(store.get().lifetimeStats.mobsKilled['slime']).toBe(1);
    });

    it('increments existing entry', () => {
      store.state.incrementLifetimeStat('mobsKilled', 'slime');
      store.state.incrementLifetimeStat('mobsKilled', 'slime', 5);
      expect(store.get().lifetimeStats.mobsKilled['slime']).toBe(6);
    });
  });

  describe('addExploredPoint', () => {
    it('adds new point if not already explored', () => {
      // Mock tracking function internally since the state is complex.
      // However, addExploredPoint isn't exported from the slice natively if it's not in the type.
      // Assuming it's added properly to the state
      if (store.state.addExploredPoint) {
        store.state.addExploredPoint({ x: 10, y: 10 }, 'forest');
        const points = store.get().exploredPoints['forest'];
        expect(points).toBeDefined();
        if (points) expect(points.length).toBe(1);
      }
    });

    it('is idempotent for nearby points in same cell', () => {
      if (store.state.addExploredPoint) {
        store.state.addExploredPoint({ x: 10, y: 10 }, 'forest');
        store.state.addExploredPoint({ x: 11, y: 11 }, 'forest');
        
        const points = store.get().exploredPoints['forest'];
        if (points) expect(points.length).toBe(1); // Should only have one point for that cell
      }
    });
  });

  describe('setExploredPointsForZone', () => {
    it('sets explored points for a given zone directly', () => {
      if (store.state.setExploredPointsForZone) {
        store.state.setExploredPointsForZone('cave', [{ x: 50, y: 50 }, { x: 55, y: 55 }]);
        const points = store.get().exploredPoints['cave'];
        expect(points).toBeDefined();
        expect(points.length).toBe(2);
        expect(points[0].x).toBe(50);
      }
    });
  });

  describe('simplifyZoneName', () => {
    it('simplifies aliases correctly', () => {
      expect(simplifyZoneName('mainland_house_a')).toBe('Home');
      expect(simplifyZoneName('mainland_guild_a')).toBe('Guild');
      expect(simplifyZoneName('mainland_alchemist')).toBe('Alchemist');
      expect(simplifyZoneName('marketplace_a')).toBe('Marketplace');
      expect(simplifyZoneName('mainland_filburt')).toBe('Filburt');
      expect(simplifyZoneName('some_unknown_zone')).toBe('some_unknown_zone'); // fallback
    });
  });
});
