import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MarketDatabaseSlice } from './types/MarketSlice.types';
import { marketHistoryDB } from './marketHistoryDB';
import { createMarketDatabaseSlice } from './slices/marketDatabaseSlice';

export const useMarketDatabaseStore = create<MarketDatabaseSlice>()(
  persist(
    (...a) => ({
      ...createMarketDatabaseSlice(...a)
    }),
    {
      name: 'market-backup', // localStorage fallback key
      storage: createJSONStorage(() => marketHistoryDB),
    }
  )
);
