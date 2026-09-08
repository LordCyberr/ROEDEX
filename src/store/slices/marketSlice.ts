import { StateCreator } from 'zustand';
import { TrackerState } from '../types';
import { MarketSlice } from '../types/MarketSlice.types';

export const createMarketSlice: StateCreator<
  TrackerState,
  [],
  [],
  MarketSlice
> = (set) => ({
  marketListings: {},
  marketSales: [],
  marketShopPrices: {},
  marketEthUsd: 0,
  marketEthUsdUpdatedAt: 0,

  setMarketListings: (listings) =>
    set((state) => {
      const newMap = { ...state.marketListings };
      listings.forEach((l) => {
        newMap[l.id] = l;
      });
      
      const keys = Object.keys(newMap);
      if (keys.length > 2000) {
        // Sort by firstSeenAt (oldest first) to evict oldest
        keys.sort((a, b) => (newMap[a].firstSeenAt || 0) - (newMap[b].firstSeenAt || 0));
        const toDelete = keys.slice(0, keys.length - 2000);
        toDelete.forEach(k => delete newMap[k]);
      }
      
      return { marketListings: newMap };
    }),

  updateMarketListing: (listing) =>
    set((state) => ({
      marketListings: {
        ...state.marketListings,
        [listing.id]: listing,
      },
    })),

  removeMarketListing: (id) =>
    set((state) => {
      const newMap = { ...state.marketListings };
      delete newMap[id];
      return { marketListings: newMap };
    }),

  addMarketSales: (sales) =>
    set((state) => {
      const newSales = [...sales, ...state.marketSales];
      // Keep last 500 sales for history
      if (newSales.length > 500) {
        newSales.length = 500;
      }
      return { marketSales: newSales };
    }),

  setMarketShopPrices: (prices) =>
    set((state) => {
      const newMap = { ...state.marketShopPrices };
      prices.forEach((p) => {
        newMap[p.itemId] = p;
      });
      return { marketShopPrices: newMap };
    }),

  setMarketEthUsd: (price) =>
    set({ marketEthUsd: price, marketEthUsdUpdatedAt: Date.now() }),
});
