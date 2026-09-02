import { create } from 'zustand';

export interface MarketSale {
  id: string;
  itemId: string;
  qty: number;
  priceWei: string;
  priceEth: number;
  txnDateTime: string;
}

export interface MarketListing {
  id: string; // instanceid or listing id
  itemId: string;
  qty: number;
  priceWei: string;
  priceEth: number;
}

export interface MarketState {
  sales: MarketSale[];
  listings: MarketListing[];
  floorPrices: Record<string, number>; // item text id -> lowest priceEth
  recentVolumes: Record<string, number>; // item text id -> qty sold in recent history
  ethUsdRate: number;
  lastUpdate: number;

  setSales: (sales: MarketSale[]) => void;
  setListings: (listings: MarketListing[]) => void;
  updateEthUsdRate: (rate: number) => void;
  getFloorPrice: (itemId: string) => number | undefined;
  getPortfolioValue: (inventory: { itemId: string, qty: number }[]) => number;
}

export const useMarketStore = create<MarketState>((set, get) => {
  // Load from local storage
  let initialSales: MarketSale[] = [];
  let initialListings: MarketListing[] = [];
  let initialFloorPrices: Record<string, number> = {};
  
  try {
    const raw = localStorage.getItem('roe_marketSnapshot');
    if (raw) {
      const parsed = JSON.parse(raw);
      initialSales = parsed.sales || [];
      initialListings = parsed.listings || [];
      initialFloorPrices = parsed.floorPrices || {};
    }
  } catch(e) {}

  return {
    sales: initialSales,
    listings: initialListings,
    floorPrices: initialFloorPrices,
    recentVolumes: {},
    ethUsdRate: 0,
    lastUpdate: Date.now(),

    setSales: (sales) => set((state) => {
      const newState = { ...state, sales, lastUpdate: Date.now() };
      localStorage.setItem('roe_marketSnapshot', JSON.stringify({
        sales: newState.sales,
        listings: newState.listings,
        floorPrices: newState.floorPrices
      }));
      return newState;
    }),

    setListings: (listings) => set((state) => {
      const floorPrices: Record<string, number> = {};
      listings.forEach(listing => {
        if (!floorPrices[listing.itemId] || listing.priceEth < floorPrices[listing.itemId]) {
          floorPrices[listing.itemId] = listing.priceEth;
        }
      });
      const newState = { ...state, listings, floorPrices, lastUpdate: Date.now() };
      localStorage.setItem('roe_marketSnapshot', JSON.stringify({
        sales: newState.sales,
        listings: newState.listings,
        floorPrices: newState.floorPrices
      }));
      return newState;
    }),

    updateEthUsdRate: (rate) => set({ ethUsdRate: rate }),

    getFloorPrice: (itemId) => {
      return get().floorPrices[itemId];
    },

    getPortfolioValue: (inventory) => {
      const state = get();
      let totalEth = 0;
      inventory.forEach(item => {
        const floor = state.floorPrices[item.itemId];
        if (floor) {
          totalEth += floor * item.qty;
        }
      });
      return totalEth * state.ethUsdRate;
    }
  };
});
