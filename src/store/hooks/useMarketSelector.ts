/**
 * @file useMarketSelector.ts
 * @description Strongly-typed Zustand store selector hooks for MarketDatabaseSlice.
 * Provides optimized accessors for historical market snapshots and 7d/30d analytics.
 */

import { useMarketDatabaseStore } from '../marketDatabaseStore';
import { MarketDatabaseSlice } from '../types/MarketSlice.types';

export const useMarketHistory = () => useMarketDatabaseStore((s: MarketDatabaseSlice) => s.marketHistory);

/** Returns market analysis for a given item. Calls the store fn outside the selector to avoid
 *  producing a new object reference on every render (which would cause infinite re-renders). */
export const useMarketAnalysis = (itemId: string) => {
  const getAnalysis = useMarketDatabaseStore((s: MarketDatabaseSlice) => s.getMarketAnalysis);
  return getAnalysis(itemId);
};

export const useMarketPrune = () => useMarketDatabaseStore((s: MarketDatabaseSlice) => s.pruneOldSnapshots);
