import React, { useMemo, useState } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { motion, AnimatePresence } from 'motion/react';

export const BazaarGrid: React.FC<{ onSelectItem: (id: string) => void }> = ({ onSelectItem }) => {
  const { marketListings, marketSales, marketShopPrices } = useTrackerStore();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Group listings by itemId
  const groupedItems = useMemo(() => {
    const map = new Map<string, any>();
    
    // Process active listings
    Object.values(marketListings).forEach(listing => {
      if (!listing.isActive) return;
      
      let entry = map.get(listing.itemId);
      if (!entry) {
        entry = {
          itemId: listing.itemId,
          itemName: listing.itemName,
          itemTypeName: listing.itemTypeName,
          floorPrice: BigInt(listing.priceWei),
          totalListed: listing.qtyRemaining,
          listingsCount: 1,
          lastSalePrice: null,
          shopSellPrice: marketShopPrices[listing.itemId]?.sellPrice || 0
        };
        map.set(listing.itemId, entry);
      } else {
        const pWei = BigInt(listing.priceWei);
        if (pWei < entry.floorPrice) entry.floorPrice = pWei;
        entry.totalListed += listing.qtyRemaining;
        entry.listingsCount++;
      }
    });

    // Attach last sale price
    marketSales.forEach(sale => {
      const entry = map.get(sale.itemId);
      if (entry && !entry.lastSalePrice) {
        // Since sales are chronological (newest first usually, but let's assume we just grab the first match)
        entry.lastSalePrice = sale.priceWei;
      }
    });

    return Array.from(map.values());
  }, [marketListings, marketSales, marketShopPrices]);

  const categories = ['All', ...Array.from(new Set(groupedItems.map(i => i.itemTypeName))).sort()];

  const filteredItems = useMemo(() => {
    return groupedItems.filter(item => {
      if (filterCategory !== 'All' && item.itemTypeName !== filterCategory) return false;
      if (searchQuery && !item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => Number(a.floorPrice - b.floorPrice));
  }, [groupedItems, filterCategory, searchQuery]);

  return (
    <div className="flex h-full w-full">
      {/* Sidebar Filters */}
      <div className="w-48 border-r border-[var(--border-subtle)] bg-[var(--bg-panel-secondary)] flex flex-col p-3 overflow-y-auto shrink-0">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Categories</h3>
        <div className="flex flex-col gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                filterCategory === cat 
                  ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] font-bold'
                  : 'text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden relative bg-[var(--bg-base)]">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm px-3 py-2 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg text-sm focus:outline-none focus:border-[var(--accent-primary)] text-[var(--text-primary)]"
          />
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <AnimatePresence>
              {filteredItems.map(item => (
                <motion.div
                  key={item.itemId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => onSelectItem(item.itemId)}
                  className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl p-3 cursor-pointer hover:border-[var(--accent-primary)]/50 hover:shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.15)] transition-all group relative overflow-hidden"
                >
                  {/* Subtle gradient background like spellborne */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[var(--bg-panel-secondary)] opacity-50 pointer-events-none" />
                  
                  <div className="flex flex-col h-full relative z-10">
                    <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 truncate">
                      {item.itemTypeName}
                    </div>
                    <div className="text-sm font-black text-white mb-3 truncate group-hover:text-[var(--accent-primary)] transition-colors">
                      {item.itemName}
                    </div>
                    
                    <div className="mt-auto flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-muted)]">Floor</span>
                        <span className="font-mono text-emerald-400 font-bold">{Number(item.floorPrice).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[var(--text-muted)]">Listed</span>
                        <span className="font-mono text-white">{item.totalListed.toLocaleString()}</span>
                      </div>
                      {item.lastSalePrice && (
                        <div className="flex justify-between items-center text-[10px] pt-1 mt-1 border-t border-[var(--border-subtle)]/50">
                          <span className="text-[var(--text-muted)]/70">Last Sale</span>
                          <span className="font-mono text-[var(--text-muted)]">{Number(item.lastSalePrice).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
