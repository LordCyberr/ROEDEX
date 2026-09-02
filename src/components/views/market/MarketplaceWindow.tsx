import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { ShoppingCart, X, Search, Layers, TrendingUp, Flame, Zap } from 'lucide-react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useMarketCurrencyPref } from '../../../store/hooks/useSettingsSelector';
import { MarketplaceAnalyticsTab } from './MarketplaceAnalyticsTab';
import { GAME_DATABASE } from '../../../data/gameDatabase';
import { RESELL_VALUES } from '../../../data/prices';
import { getRarityClass } from '../../../utils/rarity';
import { useTranslation } from '../../../hooks/useTranslation';

export const MarketplaceWindow: React.FC = () => {
  const { t } = useTranslation();
  const isMarketplaceOpen = useSettingsStore(s => s.isMarketplaceOpen);
  const setIsMarketplaceOpen = useSettingsStore(s => s.setIsMarketplaceOpen);
  
  const { marketListings, marketSales, marketShopPrices, marketEthUsd, marketEthUsdUpdatedAt, setMarketEthUsd } = useTrackerStore();
  const marketCurrencyPref = useMarketCurrencyPref();
  const setMarketCurrencyPref = useSettingsStore(s => s.setMarketCurrencyPref);

  const formatPrice = (ethValue: number) => {
    if (marketCurrencyPref === 'USD') {
      const usdValue = ethValue * marketEthUsd;
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(usdValue);
    }
    return `Ξ ${ethValue.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
  };

  useEffect(() => {
    // Fetch ETH price if older than 5 minutes
    if (Date.now() - marketEthUsdUpdatedAt > 5 * 60 * 1000) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
        signal: controller.signal
      })
        .then(res => res.json())
        .then(data => {
          clearTimeout(timeoutId);
          if (data?.ethereum?.usd) {
            setMarketEthUsd(data.ethereum.usd);
          }
        })
        .catch(err => {
          clearTimeout(timeoutId);
          if (err.name !== 'AbortError') {
            console.error('Failed to fetch ETH price', err);
          }
        });

      return () => clearTimeout(timeoutId);
    }
  }, [marketEthUsdUpdatedAt, setMarketEthUsd]);
  
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bazaar' | 'dashboard' | 'analytics'>('bazaar');

  // Close on Escape
  useEffect(() => {
    if (!isMarketplaceOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMarketplaceOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMarketplaceOpen, setIsMarketplaceOpen]);

  const windowRef = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();

  // Group active listings by item
  const groupedItems = useMemo(() => {
    const map = new Map<string, any>();
    
    Object.values(marketListings).forEach(listing => {
      if (!listing.isActive) return;
      
      const pEth = Number(listing.priceWei) / 1e18;

      let entry = map.get(listing.itemId);
      if (!entry) {
        entry = {
          itemId: listing.itemId,
          itemName: listing.itemName,
          itemTypeName: listing.itemTypeName,
          floorPriceEth: pEth,
          totalListed: listing.qtyRemaining,
          totalWorthEth: pEth * listing.qtyRemaining,
          listingsCount: 1,
          lastSalePriceEth: null,
          shopSellPrice: marketShopPrices[listing.itemId]?.sellPrice || 0
        };
        map.set(listing.itemId, entry);
      } else {
        if (pEth < entry.floorPriceEth) entry.floorPriceEth = pEth;
        entry.totalListed += listing.qtyRemaining;
        entry.totalWorthEth += pEth * listing.qtyRemaining;
        entry.listingsCount++;
      }
    });

    // Attach last sale price
    marketSales.forEach(sale => {
      const entry = map.get(sale.itemId);
      if (entry && !entry.lastSalePriceEth) {
        entry.lastSalePriceEth = Number(sale.priceWei) / 1e18;
      }
    });

    return Array.from(map.values());
  }, [marketListings, marketSales, marketShopPrices]);

  const categories = useMemo(() => {
    return ['All', ...Array.from(new Set(groupedItems.map(i => i.itemTypeName))).sort()];
  }, [groupedItems]);

  const filteredItems = useMemo(() => {
    return groupedItems.filter(item => {
      if (filterCategory !== 'All' && item.itemTypeName !== filterCategory) return false;
      if (searchQuery && !item.itemName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    }).sort((a, b) => a.floorPriceEth - b.floorPriceEth);
  }, [groupedItems, filterCategory, searchQuery]);

  // Selected Item details
  const activeSelectedItem = selectedItemId ? (groupedItems.find(i => i.itemId === selectedItemId) || null) : (filteredItems[0] || null);

  const selectedListings = useMemo(() => {
    if (!activeSelectedItem) return [];
    return Object.values(marketListings)
      .filter(l => l.itemId === activeSelectedItem.itemId && l.isActive)
      .sort((a, b) => Number(a.priceWei) - Number(b.priceWei));
  }, [marketListings, activeSelectedItem]);

  // unused selectedSalesHistory block removed

  if (!isMarketplaceOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          onClick={() => setIsMarketplaceOpen(false)}
        />

        {/* Floating Modal Window */}
        <motion.div
          ref={windowRef}
          role="dialog"
          aria-label={`ROEDEX ${t('bazaar.title') || 'Marketplace'}`}
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          drag
          dragListener={false}
          dragControls={dragControls}
          dragMomentum={false}
          className="relative w-[950px] max-w-[95vw] h-[680px] max-h-[90vh] bg-slate-950/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.2)] flex flex-col overflow-hidden pointer-events-auto z-10 select-none ring-1 ring-cyan-500/30"
        >
          {/* Header Bar */}
          <div 
            onPointerDown={(e) => dragControls.start(e)}
            className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900/90 via-indigo-950/80 to-slate-900/90 border-b border-white/10 cursor-grab active:cursor-grabbing shrink-0 shadow-lg relative overflow-hidden"
          >
            {/* Subtle light streak across header */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center text-cyan-400">
                  <ShoppingCart size={20} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 tracking-wider drop-shadow-sm">{t('bazaar.title')}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse" />
                    LIVE
                  </span>
                </div>
                <span className="text-[11px] text-cyan-200/50 font-medium tracking-wide">{t('bazaar.subtitle')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 relative z-10">
              <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 shadow-inner mr-2">
                <button
                  aria-label="Display prices in ETH"
                  onClick={() => setMarketCurrencyPref('ETH')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all duration-300 ${
                    marketCurrencyPref === 'ETH' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  ETH
                </button>
                <button
                  aria-label="Display prices in USD"
                  onClick={() => setMarketCurrencyPref('USD')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all duration-300 ${
                    marketCurrencyPref === 'USD' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  USD
                </button>
              </div>

              {/* Tab Switcher */}
              <div role="tablist" aria-label="Marketplace Views" className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 shadow-inner">
                <button
                  role="tab"
                  aria-selected={activeTab === 'bazaar'}
                  aria-label={t('bazaar.tabBazaar') || 'Bazaar'}
                  onClick={() => setActiveTab('bazaar')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'bazaar' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('bazaar.tabBazaar')}
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'dashboard'}
                  aria-label={t('bazaar.tabGlobalTrades') || 'Global Trades'}
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'dashboard' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('bazaar.tabGlobalTrades')}
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === 'analytics'}
                  aria-label={t('bazaar.tabAnalytics') || 'Analytics'}
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${
                    activeTab === 'analytics' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t('bazaar.tabAnalytics')}
                </button>
              </div>

              <div className="w-[1px] h-6 bg-white/10 mx-1" />

              <button 
                onClick={() => setIsMarketplaceOpen(false)}
                title="Close (ESC)"
                aria-label="Close Marketplace (ESC)"
                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-rose-500/30 hover:border-rose-500/50 hover:text-rose-200 transition-all flex items-center justify-center text-slate-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.4)] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Main Body */}
          {activeTab === 'bazaar' ? (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Items List & Filters */}
              <div className="w-[360px] border-r border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col overflow-hidden shrink-0">
                {/* Search & Category Header */}
                <div className="p-3 border-b border-white/10 flex flex-col gap-2.5 bg-slate-950/60">
                  <div className="relative w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      aria-label="Search marketplace items"
                      placeholder={t('bazaar.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    />
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg whitespace-nowrap transition-all duration-200 ${
                          filterCategory === cat
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                            : 'bg-black/30 text-slate-400 hover:text-white border border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-1">
                  {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-[10px] text-slate-500 italic">
                      {t('bazaar.noItemsFound')}
                    </div>
                  ) : (
                    filteredItems.map(item => {
                      const isSelected = activeSelectedItem?.itemId === item.itemId;
                      return (
                        <div
                          key={item.itemId}
                          onClick={() => setSelectedItemId(item.itemId)}
                          className={`px-3 py-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected 
                              ? 'bg-cyan-500/10 border-cyan-500/40 shadow-inner'
                              : 'bg-transparent border-transparent hover:bg-slate-800/40 hover:border-white/5'
                          }`}
                        >
                          <span className={`text-[11px] font-bold truncate transition-colors ${isSelected ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'text-slate-300 group-hover:text-white'}`}>
                            {item.itemName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono opacity-60">
                            {item.totalListed.toLocaleString()}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Selected Item Order Book & Trade Details */}
              <div className="flex-1 flex flex-col bg-gradient-to-b from-slate-900/50 to-transparent overflow-hidden relative">
                {/* Accent line top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                
                {activeSelectedItem ? (
                  (() => {
                    const internalName = activeSelectedItem.itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const roepediaData = GAME_DATABASE.find(e => 
                      e.sanitizedName.toLowerCase() === activeSelectedItem.itemName.toLowerCase() || 
                      e.rawName.toLowerCase() === internalName
                    );
                    const resellValue = RESELL_VALUES[internalName] || 0;
                    
                    return (
                      <div className="flex-1 flex flex-col overflow-hidden p-5 gap-5">
                        {/* Item Header & Information Card */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden shrink-0">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 drop-shadow-sm">{activeSelectedItem.itemTypeName}</span>
                              <h3 className={`text-2xl font-black truncate mt-1 ${roepediaData ? getRarityClass(roepediaData.rarity) : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300'}`}>
                                {activeSelectedItem.itemName}
                              </h3>
                              {roepediaData && (
                                <span className={`text-[9px] w-fit mt-1.5 px-2 py-0.5 rounded border font-black uppercase tracking-wider ${
                                  roepediaData.rarity.toLowerCase() === 'mystical' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                                  roepediaData.rarity.toLowerCase() === 'rare' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                  roepediaData.rarity.toLowerCase() === 'uncommon' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                  'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                }`}>
                                  {roepediaData.rarity}
                                </span>
                              )}
                            </div>
                            
                            <div className="text-right flex flex-col gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                               <div className="text-[10px] font-black uppercase text-slate-400">{t('bazaar.totalListed')}</div>
                               <div className="text-xl font-mono font-black text-white">{activeSelectedItem.totalListed.toLocaleString()} units</div>
                            </div>
                          </div>

                          {/* Quick Stats Grid */}
                          <div className="grid grid-cols-4 gap-3 pt-3 border-t border-white/10 relative z-10">
                            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col hover:border-emerald-500/30 transition-colors shadow-inner">
                              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">{t('bazaar.unitPrice')} ({marketCurrencyPref})</span>
                              <span className="text-sm font-mono font-bold text-emerald-400 mt-0.5 drop-shadow-sm">{formatPrice(activeSelectedItem.floorPriceEth)}</span>
                            </div>
                            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col hover:border-blue-500/30 transition-colors shadow-inner">
                              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">{t('bazaar.lastSale')} ({marketCurrencyPref})</span>
                              <span className="text-sm font-mono font-bold text-blue-400 mt-0.5 drop-shadow-sm">
                                {activeSelectedItem.lastSalePriceEth ? formatPrice(activeSelectedItem.lastSalePriceEth) : 'N/A'}
                              </span>
                            </div>
                            <div className="bg-slate-950/60 border border-white/5 rounded-xl p-3 flex flex-col hover:border-amber-500/30 transition-colors shadow-inner">
                              <span className="text-[9px] uppercase font-bold text-amber-500/80 tracking-wider">{t('bazaar.resellValue')}</span>
                              <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 drop-shadow-sm">
                                {resellValue > 0 ? resellValue.toLocaleString() : '?'} Runes
                              </span>
                            </div>
                            <div className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3 flex flex-col hover:border-amber-500/40 transition-colors shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                              <span className="text-[9px] uppercase font-bold text-amber-500 tracking-wider">{t('bazaar.totalMarketWorth')}</span>
                              <span className="text-sm font-mono font-bold text-amber-400 mt-0.5 drop-shadow-sm">
                                {(activeSelectedItem.totalListed * resellValue).toLocaleString()} Runes
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Order Book & Active Listings */}
                        <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-lg min-h-0">
                          <div className="px-4 py-3 bg-slate-950/60 border-b border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-2">
                              <Layers size={14} className="text-cyan-400" />
                              {t('bazaar.activeOrders')}
                            </span>
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar p-2.5">
                            <table className="w-full text-left text-xs">
                              <thead className="text-[9px] uppercase text-slate-500 border-b border-white/10">
                                <tr className="text-[9px] uppercase text-slate-500 border-b border-white/10">
                                  <th className="pb-2 font-bold px-1">{t('bazaar.unitPrice')} ({marketCurrencyPref})</th>
                                  <th className="pb-2 font-bold text-right px-1">Listed Qty</th>
                                  <th className="pb-2 font-bold text-right px-1">Total Value ({marketCurrencyPref})</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedListings.length === 0 ? (
                                  <tr><td colSpan={3} className="text-center py-8 text-slate-500 italic">{t('bazaar.noActiveListings')}</td></tr>
                                ) : (
                                  selectedListings.map(l => {
                                    const pEth = Number(l.priceWei) / 1e18;
                                    const tEth = pEth * l.qtyRemaining;
                                    return (
                                      <tr key={l.id} className="border-b border-white/5 hover:bg-slate-800/40 transition-colors group">
                                        <td className="py-2.5 px-1 font-mono font-bold text-emerald-400 drop-shadow-sm">{formatPrice(pEth)}</td>
                                        <td className="py-2.5 px-1 font-mono text-slate-300 text-right group-hover:text-white transition-colors">x{l.qtyRemaining.toLocaleString()}</td>
                                        <td className="py-2.5 px-1 font-mono text-amber-400/80 text-right">{formatPrice(tEth)}</td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] italic text-sm p-8">
                    Select an item from the left list to view order book & trade statistics.
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'dashboard' ? (
            /* Global Trades Dashboard View */
            <div className="flex-1 flex p-5 gap-5 overflow-hidden bg-gradient-to-b from-slate-900/50 to-transparent">
              {/* Top 10 Volume */}
              <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                {/* Accent line top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
                
                <div className="px-5 py-4 bg-slate-950/60 border-b border-white/10 font-bold text-sm text-white flex items-center gap-3">
                  <Flame size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] fill-amber-400/20" /> 
                  <span className="tracking-wide">{t('bazaar.topVolume')}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
                  {marketSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-500 italic p-8">
                      <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4">
                        <TrendingUp size={24} className="text-slate-600" />
                      </div>
                      No trade volume recorded yet. Wait for bazaar sync.
                    </div>
                  ) : (
                    groupedItems.slice(0, 10).map((item, idx) => (
                      <div key={item.itemId} className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-white/5 hover:border-amber-500/30 flex items-center justify-between transition-all group">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-sm font-black w-6 text-center ${idx < 3 ? 'text-amber-400 drop-shadow-sm' : 'text-slate-500'}`}>#{idx + 1}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{item.itemName}</div>
                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.itemTypeName}</div>
                          </div>
                        </div>
                          <div className="text-right flex flex-col items-end min-w-[70px]">
                            <span className="font-mono text-emerald-400 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                              {formatPrice(item.floorPriceEth)}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400/80">Vol: {item.totalListed.toLocaleString()}</span>
                          </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Global Recent Sales Feed */}
              <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
                {/* Accent line top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

                <div className="px-5 py-4 bg-slate-950/60 border-b border-white/10 font-bold text-sm text-white flex items-center gap-3">
                  <Zap size={18} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] fill-cyan-400/20" /> 
                  <span className="tracking-wide">{t('bazaar.globalTradesFeed')}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-2">
                  {marketSales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-500 italic p-8">
                      <div className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center mb-4">
                        <ShoppingCart size={24} className="text-slate-600" />
                      </div>
                      Waiting for live marketplace trade packets...
                    </div>
                  ) : (
                    marketSales.map(sale => (
                      <div key={sale.id} className="p-3 rounded-xl bg-slate-800/40 hover:bg-slate-700/50 border border-white/5 hover:border-cyan-500/30 flex items-center justify-between transition-all group">
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{sale.itemName}</div>
                          <div className="text-[10px] text-emerald-400 font-bold tracking-wide mt-0.5">Qty: {sale.qty}</div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <div className="font-mono text-xs font-black text-white">{formatPrice(Number(sale.priceWei) / 1e18)}</div>
                          <div className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">{new Date(sale.seenAt).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'analytics' ? (
            <MarketplaceAnalyticsTab />
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
