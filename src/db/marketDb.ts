import Dexie, { Table } from 'dexie';

export interface MarketPriceRecord {
  id?: number;
  itemName: string;
  priceEth: number;
  quantity: number;
  timestamp: number;
}

export class MarketDatabase extends Dexie {
  marketHistory!: Table<MarketPriceRecord>;

  constructor() {
    super('RoedexMarketDB');
    this.version(1).stores({
      marketHistory: '++id, itemName, timestamp' // Indexed by itemName and timestamp
    });
  }
}

export const marketDb = new MarketDatabase();
