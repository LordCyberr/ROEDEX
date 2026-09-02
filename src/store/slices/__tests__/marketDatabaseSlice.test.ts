import { describe, it, expect, beforeEach } from 'vitest';
import { createMarketDatabaseSlice } from '../marketDatabaseSlice';
import { MarketListing } from '../../types/MarketSlice.types';

// Helper to create a store instance for testing
const createStore = () => {
  let state: any = {};
  const set = (fn: any) => { state = typeof fn === 'function' ? fn(state) : fn; };
  const get = () => state;
  state = createMarketDatabaseSlice(set, get, null as any);
  return { state, set, get };
};

describe('MarketDatabase Slice', () => {
  let store: any;

  beforeEach(() => {
    store = createStore();
  });

  describe('upsertDaySnapshot', () => {
    it('creates a new day snapshot if none exists', () => {
      const listing: MarketListing = { itemId: 'wood', priceWei: '1000000000000000000', qtyRemaining: 5, seller: '0x123' } as MarketListing;
      store.state.upsertDaySnapshot('2023-10-01', [listing]);
      
      const history = store.get().marketHistory['2023-10-01'];
      expect(history).toBeDefined();
      expect(history.items['wood']).toBeDefined();
      expect(history.items['wood'].minPrice).toBe(1); // 1 ETH
      expect(history.items['wood'].maxPrice).toBe(1);
      expect(history.items['wood'].volume).toBe(5);
      expect(history.items['wood'].listings).toBe(1);
    });

    it('takes min/max/rolling avg when duplicates exist', () => {
      const l1: MarketListing = { itemId: 'wood', priceWei: '1000000000000000000', qtyRemaining: 5, seller: '0x1' } as MarketListing;
      const l2: MarketListing = { itemId: 'wood', priceWei: '2000000000000000000', qtyRemaining: 10, seller: '0x2' } as MarketListing;
      const l3: MarketListing = { itemId: 'wood', priceWei: '1500000000000000000', qtyRemaining: 2, seller: '0x3' } as MarketListing;

      store.state.upsertDaySnapshot('2023-10-01', [l1]);
      store.state.upsertDaySnapshot('2023-10-01', [l2, l3]);

      const history = store.get().marketHistory['2023-10-01'];
      expect(history.items['wood'].minPrice).toBe(1);
      expect(history.items['wood'].maxPrice).toBe(2);
      expect(history.items['wood'].volume).toBe(17);
      expect(history.items['wood'].listings).toBe(3);
      expect(history.items['wood'].avgPrice).toBeCloseTo(1.5);
    });
  });

  describe('getMarketAnalysis', () => {
    it('returns null if less than 2 days of data', () => {
      store.state.upsertDaySnapshot('2023-10-01', [{ itemId: 'wood', priceWei: '1000000000000000000', qtyRemaining: 5 }]);
      expect(store.state.getMarketAnalysis('wood')).toBeNull();
    });

    it('calculates correct percentages with 7-day data', () => {
      // Day 1
      store.state.upsertDaySnapshot('2023-10-01', [{ itemId: 'wood', priceWei: '1000000000000000000', qtyRemaining: 5 }]);
      // Day 5
      store.state.upsertDaySnapshot('2023-10-05', [{ itemId: 'wood', priceWei: '1500000000000000000', qtyRemaining: 5 }]);
      // Day 8 (today)
      store.state.upsertDaySnapshot('2023-10-08', [{ itemId: 'wood', priceWei: '2000000000000000000', qtyRemaining: 5 }]);

      const analysis = store.state.getMarketAnalysis('wood');
      expect(analysis).not.toBeNull();
      // Price on 10-05 is 1.5. Today is 2.0.
      // (2.0 - 1.5) / 1.5 = 0.333 * 100 = 33.33%
      expect(analysis?.priceChange7d).toBeCloseTo(33.333, 2);
      
      // 30d baseline will be 10-01 (1.0).
      // (2.0 - 1.0) / 1.0 = 100%
      expect(analysis?.priceChange30d).toBe(100);
    });
  });

  describe('pruneOldSnapshots', () => {
    it('removes entries older than 30 days', () => {
      for (let i = 1; i <= 35; i++) {
        const day = i < 10 ? `0${i}` : `${i}`;
        store.state.upsertDaySnapshot(`2023-10-${day}`, [{ itemId: 'wood', priceWei: '1000000000000000000', qtyRemaining: 5 }]);
      }
      
      expect(Object.keys(store.get().marketHistory).length).toBe(35);
      
      store.state.pruneOldSnapshots();
      
      const historyKeys = Object.keys(store.get().marketHistory);
      expect(historyKeys.length).toBe(30);
      expect(historyKeys).not.toContain('2023-10-01');
      expect(historyKeys).not.toContain('2023-10-05');
      expect(historyKeys).toContain('2023-10-06');
      expect(historyKeys).toContain('2023-10-35');
    });
  });
});
