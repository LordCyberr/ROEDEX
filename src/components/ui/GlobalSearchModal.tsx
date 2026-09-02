import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Shield, Package, MapPin, ExternalLink } from 'lucide-react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { getDisplayName } from '../../utils/displayName';
import { IsolatedInput } from './IsolatedInput';

export const GlobalSearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const marketListings = useTrackerStore((s: any) => s.marketListings);
  const chestInventory = useTrackerStore((s: any) => s.chestInventory);
  const setActiveTab = useSettingsStore((s: any) => s.setActiveTab);
  const setIsMarketplaceOpen = useSettingsStore((s: any) => s.setIsMarketplaceOpen);

  const modalRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [isOpen]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const results: Array<{ id: string; name: string; type: 'item' | 'market' | 'tab'; category: string; action: () => void }> = [];

    // Search Chest items
    Object.keys(chestInventory || {}).forEach(name => {
      const displayName = getDisplayName(name);
      if (name.toLowerCase().includes(q) || displayName.toLowerCase().includes(q)) {
        results.push({
          id: `chest-${name}`,
          name: displayName,
          type: 'item',
          category: 'Chest Inventory',
          action: () => {
            setActiveTab('chest');
            setIsOpen(false);
          }
        });
      }
    });

    // Search Market items
    Object.values(marketListings || {}).forEach((listing: any, index) => {
      if (listing.itemName?.toLowerCase().includes(q)) {
        results.push({
          id: `market-${listing.id || index}`,
          name: listing.itemName,
          type: 'market',
          category: `Market Listing (${Number(listing.priceWei || 0) / 1e18} ETH)`,
          action: () => {
            setIsMarketplaceOpen(true);
            setIsOpen(false);
          }
        });
      }
    });

    // Quick Tab Shortcuts
    const tabs: Array<{ id: 'chest' | 'session' | 'settings' | 'profile'; label: string }> = [
      { id: 'chest', label: 'Chest & Inventory' },
      { id: 'session', label: 'Loot & Session Tracking' },
      { id: 'profile', label: 'Player Profile & Stats' },
      { id: 'settings', label: 'Extension Settings' }
    ];

    tabs.forEach(t => {
      if (t.label.toLowerCase().includes(q)) {
        results.push({
          id: `tab-${t.id}`,
          name: t.label,
          type: 'tab',
          category: 'Navigation Tab',
          action: () => {
            setActiveTab(t.id);
            setIsOpen(false);
          }
        });
      }
    });

    return results.slice(0, 10);
  }, [query, chestInventory, marketListings, setActiveTab, setIsMarketplaceOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm pointer-events-auto">
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-label="Global Quick Search (Ctrl+K)"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="w-[500px] max-w-[90vw] bg-slate-950/90 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Header */}
            <div className="flex items-center px-4 py-3 border-b border-white/10 gap-3 bg-slate-900/50">
              <Search size={18} className="text-cyan-400 shrink-0" />
              <IsolatedInput
                type="text"
                autoFocus
                aria-label="Global Search Query"
                placeholder="Search items, market listings, tabs... (Ctrl+K)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
              />
              <button
                onClick={() => setIsOpen(false)}
                title="Close (ESC)"
                aria-label="Close search (ESC)"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-[350px] overflow-y-auto custom-scrollbar flex flex-col gap-1">
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 italic">
                  {query.trim() ? 'No results found' : 'Type to search across items, tabs, and market...'}
                </div>
              ) : (
                searchResults.map(item => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/30 border border-transparent transition-all group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {item.type === 'item' && <Package size={16} className="text-purple-400 shrink-0" />}
                      {item.type === 'market' && <Shield size={16} className="text-amber-400 shrink-0" />}
                      {item.type === 'tab' && <MapPin size={16} className="text-cyan-400 shrink-0" />}
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
