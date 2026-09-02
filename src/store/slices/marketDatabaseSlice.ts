import { StateCreator } from 'zustand';
import { MarketDatabaseSlice, MarketListing } from '../types/MarketSlice.types';

export const createMarketDatabaseSlice: StateCreator<
  MarketDatabaseSlice,
  [],
  [],
  MarketDatabaseSlice
> = (set, get) => ({
  marketHistory: {},

  upsertDaySnapshot: (dateKey: string, listings: MarketListing[]) => {
    set((state) => {
      const history = { ...state.marketHistory };
      const currentDay = history[dateKey] || { date: dateKey, items: {} };
      
      const newItems = { ...currentDay.items };
      
      listings.forEach(listing => {
        const priceEth = parseFloat(listing.priceWei) / 1e18;
        if (priceEth <= 0 || !listing.itemId) return;
        
        const existing = newItems[listing.itemId];
        if (!existing) {
          newItems[listing.itemId] = {
            minPrice: priceEth,
            maxPrice: priceEth,
            avgPrice: priceEth,
            volume: listing.qtyRemaining,
            listings: 1
          };
        } else {
          existing.minPrice = Math.min(existing.minPrice, priceEth);
          existing.maxPrice = Math.max(existing.maxPrice, priceEth);
          // Rolling average approximation
          existing.avgPrice = (existing.avgPrice * existing.listings + priceEth) / (existing.listings + 1);
          existing.volume += listing.qtyRemaining;
          existing.listings += 1;
        }
      });
      
      history[dateKey] = { ...currentDay, items: newItems };
      return { marketHistory: history };
    });
  },

  getMarketAnalysis: (itemId: string) => {
    const { marketHistory } = get();
    const days = Object.keys(marketHistory).sort(); // YYYY-MM-DD string sort works
    if (days.length < 2) return null;
    
    // Find today (or most recent) and 7 days ago
    const todayKey = days[days.length - 1];
    const todayData = marketHistory[todayKey]?.items[itemId];
    
    let price7d = 0;
    // Walk back up to 7 days
    for (let i = days.length - 2; i >= Math.max(0, days.length - 8); i--) {
      const pastData = marketHistory[days[i]]?.items[itemId];
      if (pastData) {
        price7d = pastData.avgPrice;
        break; // found the nearest past data point within 7 days
      }
    }
    
    let price30d = 0;
    // Walk back up to 30 days
    for (let i = Math.max(0, days.length - 8); i >= Math.max(0, days.length - 31); i--) {
       const pastData = marketHistory[days[i]]?.items[itemId];
       if (pastData) {
         price30d = pastData.avgPrice;
         break;
       }
    }

    if (!todayData) return null;

    const todayVolume = todayData.volume;
    let pastVolume = 0;
    for (let i = days.length - 2; i >= Math.max(0, days.length - 8); i--) {
      const pastData = marketHistory[days[i]]?.items[itemId];
      if (pastData) {
        pastVolume = pastData.volume;
        break;
      }
    }
    
    let volumeTrend: 'up' | 'down' | 'flat' = 'flat';
    if (pastVolume > 0) {
      if (todayVolume > pastVolume * 1.05) volumeTrend = 'up';
      else if (todayVolume < pastVolume * 0.95) volumeTrend = 'down';
    }

    return {
      priceChange7d: price7d > 0 ? ((todayData.avgPrice - price7d) / price7d) * 100 : 0,
      priceChange30d: price30d > 0 ? ((todayData.avgPrice - price30d) / price30d) * 100 : 0,
      volumeTrend
    };
  },

  pruneOldSnapshots: () => {
    set((state) => {
      const history = { ...state.marketHistory };
      const days = Object.keys(history).sort();
      // Keep only last 30 days
      if (days.length > 30) {
        const toDelete = days.slice(0, days.length - 30);
        toDelete.forEach(d => delete history[d]);
        return { marketHistory: history };
      }
      return state;
    });
  }
});
