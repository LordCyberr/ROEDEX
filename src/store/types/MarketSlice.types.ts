export interface MarketListing {
  id: string;
  itemName: string;
  itemId: string;
  itemType: number;
  itemTypeName: string;
  level: number;
  durability: number;
  durabilityMax: number;
  qtyRemaining: number;
  qtyTotal: number;
  priceWei: string;
  totalWei: string;
  seller: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tx: string;
  block: number | null;
  firstSeenAt: number;
  lastSeenAt: number;
}

export interface MarketSale {
  id: string;
  itemName: string;
  itemId: string;
  itemTypeName: string;
  qty: number;
  priceWei: string;
  totalWei: string;
  seller: string;
  buyer: string;
  createdAt: string;
  seenAt: number;
}

export interface MarketShopPrice {
  itemId: string;
  buyPrice: number;
  sellPrice: number;
}

export interface MarketDaySnapshot {
  date: string; // YYYY-MM-DD format
  items: Record<string, {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    volume: number;
    listings: number;
  }>;
}

export interface MarketAnalysis {
  priceChange7d: number;
  priceChange30d: number;
  volumeTrend: 'up' | 'down' | 'flat';
}

export type MarketAnalysisResult = MarketAnalysis;

export interface MarketSlice {
  marketListings: Record<string, MarketListing>;
  marketSales: MarketSale[];
  marketShopPrices: Record<string, MarketShopPrice>;
  marketEthUsd: number;
  marketEthUsdUpdatedAt: number;
  
  // Actions
  setMarketListings: (listings: MarketListing[]) => void;
  updateMarketListing: (listing: MarketListing) => void;
  removeMarketListing: (id: string) => void;
  addMarketSales: (sales: MarketSale[]) => void;
  setMarketShopPrices: (prices: MarketShopPrice[]) => void;
  setMarketEthUsd: (price: number) => void;
  // new Database slice methods will be added via marketDatabaseSlice
}

export interface MarketDatabaseSlice {
  marketHistory: Record<string, MarketDaySnapshot>;
  upsertDaySnapshot: (dateKey: string, listings: MarketListing[]) => void;
  getMarketAnalysis: (itemId: string) => MarketAnalysis | null;
  pruneOldSnapshots: () => void;
}
