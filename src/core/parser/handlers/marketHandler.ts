import { TrackerState } from '../../../store/storeTypes';
import { MarketListing, MarketSale } from '../../../store/types/MarketSlice.types';
import { NotificationManager } from '../../notifications/NotificationManager';

function marketItemTypeName(type: number | string | undefined | null): string {
  const map: Record<number, string> = {
    0: 'Tool', 1: 'Weapon', 2: 'Offhand', 3: 'Weapon',
    4: 'Wood', 5: 'Ore', 6: 'Consumable', 7: 'Material',
    8: 'Quest', 9: 'Gem', 10: 'Crafting', 11: 'Accessory',
    12: 'Armor', 13: 'Crafted', 14: 'Box'
  };
  const t = Number(type);
  return map[t] || `Type ${type ?? '?'}`;
}

function marketTotalWei(priceWei: string, qty: number): string {
  try { return (parseFloat(priceWei || '0') * Math.max(0, Number(qty) || 0)).toString(); }
  catch (e) { return '0'; }
}

function normalizeMarketItemId(value: string): string {
  if (!value) return '';
  let id = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (id.endsWith('item')) id = id.substring(0, id.length - 4);
  return id;
}

export function handleMarketplaceListingsResponse(payload: any, store: TrackerState) {
  if (!payload || payload.ok === false) return;
  const listingsRaw = Array.isArray(payload.data) ? payload.data : [];

  const parsedListings: MarketListing[] = listingsRaw.map((raw: any) => {
    const info = typeof raw.info === 'string' ? JSON.parse(raw.info) : (raw.info || {});
    const qtyRemaining = Number(raw.qtyRemaining ?? info.qty ?? raw.qtyTotal ?? 0) || 0;
    const qtyTotal = Number(raw.qtyTotal ?? info.qty ?? qtyRemaining) || qtyRemaining;
    const priceWei = String(raw.price ?? info.priceEth ?? '0');
    const itemName = info.ItemName || info.itemName || raw.itemName || raw.itemId || 'Unknown item';
    const itemId = normalizeMarketItemId(info.ItemId || info.itemId || raw.itemId || itemName);
    
    return {
      id: String(raw._id || raw.id || raw.listingId || `${itemId}:${raw.seller}:${raw.createdAt}:${priceWei}`),
      itemName,
      itemId,
      itemType: Number(info.itemType ?? raw.itemType ?? -1),
      itemTypeName: marketItemTypeName(info.itemType ?? raw.itemType),
      level: Number(info.level ?? 0) || 0,
      durability: Number(info.durability ?? 0) || 0,
      durabilityMax: Number(info.durabilityMax ?? 0) || 0,
      qtyRemaining,
      qtyTotal,
      priceWei,
      totalWei: String(marketTotalWei(priceWei, qtyRemaining)),
      seller: raw.seller || '',
      isActive: raw.isActive !== false && raw.exists !== false && qtyRemaining > 0,
      createdAt: raw.createdAt || raw.updatedAt || '',
      updatedAt: raw.updatedAt || raw.createdAt || '',
      tx: raw.lastEventTxHash || raw.createdAtTxHash || '',
      block: raw.lastEventBlock || raw.createdAtBlock || null,
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now()
    };
  });

  // Calculate current floor prices
  const currentListings = Object.values(store.marketListings);
  const floorPrices: Record<string, number> = {};
  currentListings.forEach(l => {
    const price = parseFloat(l.priceWei) / 1e18;
    if (price > 0 && (!floorPrices[l.itemId] || price < floorPrices[l.itemId])) {
      floorPrices[l.itemId] = price;
    }
  });

  // Snipe Alerts
  parsedListings.forEach(nl => {
    const priceEth = parseFloat(nl.priceWei) / 1e18;
    const floor = floorPrices[nl.itemId];
    if (floor && priceEth > 0 && priceEth < floor * 0.7) {
      const discount = 1 - (priceEth / floor);
      NotificationManager.marketSnipeAlert(nl.itemName, discount, priceEth);
      floorPrices[nl.itemId] = priceEth; // prevent spam
    }
  });

  store.setMarketListings(parsedListings);

  // Persist to history database for analytics
  import('../../../store/marketDatabaseStore').then(({ useMarketDatabaseStore }) => {
    const today = new Date().toISOString().split('T')[0];
    useMarketDatabaseStore.getState().upsertDaySnapshot(today, parsedListings);
  });

  // Write to Dexie for sparklines (aggregated daily price per item)
  import('../../../db/marketDb').then(({ marketDb }) => {
    const now = Date.now();
    // Round to nearest day (start of day UTC)
    const startOfDay = Math.floor(now / 86400000) * 86400000;
    
    // Process lowest price per item
    const lowestPrices: Record<string, { price: number; qty: number }> = {};
    parsedListings.forEach(l => {
      const priceEth = parseFloat(l.priceWei) / 1e18;
      if (priceEth > 0) {
        if (!lowestPrices[l.itemName] || priceEth < lowestPrices[l.itemName].price) {
          lowestPrices[l.itemName] = { price: priceEth, qty: l.qtyRemaining };
        }
      }
    });

    Object.entries(lowestPrices).forEach(([itemName, data]) => {
      // Find existing record for this item today, update it or insert new
      marketDb.marketHistory.where({ itemName }).filter(record => record.timestamp === startOfDay).first().then(record => {
        if (record) {
           if (data.price < record.priceEth) {
             marketDb.marketHistory.update(record.id!, { priceEth: data.price, quantity: data.qty });
           }
        } else {
           marketDb.marketHistory.add({
             itemName,
             priceEth: data.price,
             quantity: data.qty,
             timestamp: startOfDay
           });
        }
      });
    });
  });
}

export function handleMarketplaceSalesResponse(payload: any, store: TrackerState) {
  if (!payload || payload.ok === false) return;
  const salesRaw = Array.isArray(payload.data) ? payload.data : [];

  const parsedSales: MarketSale[] = salesRaw.map((raw: any) => {
    const info = typeof raw.info === 'string' ? JSON.parse(raw.info) : (raw.info || {});
    const qty = Number(info.qty ?? raw.qty ?? raw.qtyTotal ?? 0) || 0;
    const priceWei = String(raw.price ?? info.priceEth ?? '0');
    
    return {
      id: String(raw._id || raw.id || `${raw.seller}:${raw.buyer}:${raw.createdAt}:${priceWei}`),
      itemName: info.ItemName || info.itemName || raw.itemId || 'Unknown item',
      itemId: normalizeMarketItemId(info.ItemId || info.itemId || raw.itemId || ''),
      itemTypeName: marketItemTypeName(info.itemType ?? raw.itemType),
      qty,
      priceWei,
      totalWei: String(marketTotalWei(priceWei, qty || 1)),
      seller: raw.seller || '',
      buyer: raw.buyer || '',
      createdAt: raw.createdAt || raw.updatedAt || '',
      seenAt: Date.now()
    };
  });

  store.addMarketSales(parsedSales);
}

export function handleMarketEvent(eventName: string, payload: any, store: TrackerState) {
  const lowerName = eventName.toLowerCase();
  if (lowerName === 'marketplace:getalllistings') {
    handleMarketplaceListingsResponse(payload, store);
  } else if (lowerName === 'marketplace:getglobalsales') {
    handleMarketplaceSalesResponse(payload, store);
  }
}
