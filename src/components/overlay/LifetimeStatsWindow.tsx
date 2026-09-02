import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { X, Sword, Pickaxe, Axe, Leaf, Search, Package } from 'lucide-react';
import { getDisplayName } from '../../utils/displayName';
import { useTranslation } from '../../hooks/useTranslation';

export const LifetimeStatsWindow: React.FC = () => {
  const { lifetimeStats } = useTrackerStore(useShallow((state: any) => ({
    lifetimeStats: state.lifetimeStats,
  })));
  
  const isLifetimeStatsOpen = useSettingsStore((state: any) => state.isLifetimeStatsOpen);
  const setIsLifetimeStatsOpen = useSettingsStore((state: any) => state.setIsLifetimeStatsOpen);

  const dragConstraintsRef = useRef(null);
  const [activeCategory, setActiveCategory] = useState<'combat' | 'mining' | 'logging' | 'plants' | 'mobDrops'>('combat');
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape
  React.useEffect(() => {
    if (!isLifetimeStatsOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLifetimeStatsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLifetimeStatsOpen, setIsLifetimeStatsOpen]);

  if (!isLifetimeStatsOpen) return null;

  // Guard: ensure lifetimeStats exists and all sub-fields are objects (not undefined)
  // This prevents Object.values(undefined) → React Error #185 on stale persisted state
  const safeStats = {
    mobsKilled: lifetimeStats?.mobsKilled || {},
    oresMined: lifetimeStats?.oresMined || {},
    treesCut: lifetimeStats?.treesCut || {},
    plantsHarvested: lifetimeStats?.plantsHarvested || {},
    itemsLooted: lifetimeStats?.itemsLooted || {},
  };

  const categories = {
    combat: { icon: Sword, color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', glow: 'shadow-rose-500/10', data: safeStats.mobsKilled, label: t('categories.mobs') },
    mining: { icon: Pickaxe, color: 'text-cyan-400', border: 'border-cyan-500/20', bg: 'bg-cyan-500/10', glow: 'shadow-cyan-500/10', data: safeStats.oresMined, label: t('categories.ores') },
    logging: { icon: Axe, color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10', glow: 'shadow-amber-500/10', data: safeStats.treesCut, label: t('categories.trees') },
    plants: { icon: Leaf, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', glow: 'shadow-emerald-500/10', data: safeStats.plantsHarvested, label: t('categories.plants') },
    mobDrops: { icon: Package, color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', glow: 'shadow-purple-500/10', data: safeStats.itemsLooted, label: t('categories.mobDrops') },
  };

  const currentData = categories[activeCategory].data || {};
  
  const aggregatedData: Record<string, number> = {};
  Object.entries(currentData as Record<string, number>).forEach(([key, value]) => {
    // Always resolve through DB_LOOKUP first — ensures the display name matches the main overlay
    const displayName = getDisplayName(key);
    aggregatedData[displayName] = (aggregatedData[displayName] || 0) + value;
  });

  const sortedData = Object.entries(aggregatedData)
    .filter(([k]) => k.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);

  const getTotal = (record: Record<string, number>) => Object.values(record).reduce((a, b) => a + b, 0);

  return (
    <AnimatePresence>
      {isLifetimeStatsOpen && (
        <div ref={dragConstraintsRef} className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            role="dialog"
            aria-label={`ROEDEX ${t('lifetimeStats.title') || 'Lifetime Stats'}`}
            drag
            dragConstraints={dragConstraintsRef}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="pointer-events-auto w-full max-w-2xl h-[560px] max-h-[75vh] flex flex-col bg-[var(--bg-base)]/95 backdrop-blur-xl border border-[var(--border-subtle)] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Header */}
            <div className="cursor-move flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)]/40">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="text-[11px] font-black tracking-widest text-[var(--text-primary)]/80 uppercase font-sans">ROEDEX // {t('lifetimeStats.title')}</h2>
              </div>
              <button 
                onClick={() => setIsLifetimeStatsOpen(false)}
                title="Close (ESC)"
                aria-label="Close Lifetime Stats (ESC)"
                className="p-1.5 text-[var(--text-secondary)] hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <div role="tablist" aria-label="Lifetime Stats Categories" className="w-[140px] shrink-0 flex flex-col gap-1.5 p-2.5 border-r border-[var(--border-subtle)]/50 bg-[var(--bg-panel)]/40">
                {(Object.keys(categories) as Array<keyof typeof categories>).map((cat) => {
                  const { icon: Icon, color, bg, glow } = categories[cat];
                  const isActive = activeCategory === cat;
                  const count = getTotal(categories[cat].data);
                  return (
                    <motion.button
                      key={cat}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`${categories[cat].label} statistics`}
                      onClick={() => setActiveCategory(cat)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex flex-col items-center justify-center p-3.5 rounded-xl transition-colors border select-none group cursor-pointer ${
                        isActive 
                          ? `${bg} ${glow} border-[var(--border-subtle)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.3)]` 
                          : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <motion.div 
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-500 rounded-r-md" 
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      <Icon size={18} className={`mb-1.5 transition-transform duration-300 group-hover:scale-110 ${color}`} />
                      <span className={`text-[8.5px] font-black uppercase tracking-widest ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                        {categories[cat].label}
                      </span>
                      <span className="text-[8px] font-mono mt-1 text-[var(--text-muted)] group-hover:text-white/60 transition-colors">
                        {count.toLocaleString()}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col bg-[var(--bg-base)]/50">
                {/* Search Bar */}
                <div className="p-3 border-b border-[var(--border-subtle)]/50 bg-black/20">
                  <div className="relative">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                    <input
                      type="text"
                      aria-label="Search Lifetime Stats entries"
                      placeholder={t('stats.searchEntries') as string || 'Search...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)]/40 rounded-lg py-1.5 pl-8 pr-3 text-[11px] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 p-3 relative overflow-hidden min-h-0" onPointerDownCapture={(e) => e.stopPropagation()}>
                  <AnimatePresence mode="popLayout">
                    <ul className="absolute inset-0 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1.5 pr-4">
                      {sortedData.map(([key, value]) => {
                        const Icon = categories[activeCategory].icon;
                        return (
                          <motion.li 
                            layout 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            whileHover={{ scale: 1.01, x: 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            key={key} 
                            className="flex items-center justify-between p-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-indigo-500/20 hover:shadow-[0_2px_8px_rgba(99,102,241,0.05)] transition-colors duration-300 group shrink-0"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-black/40 rounded-lg border border-white/5 shadow-inner">
                                <Icon size={12} className={categories[activeCategory].color} />
                              </div>
                              <span className="text-[11px] font-bold text-slate-300 group-hover:text-white transition-colors">
                                {key}
                              </span>
                            </div>
                            <span className={`font-mono text-[11px] font-black ${categories[activeCategory].color}`}>
                              {value.toLocaleString()}
                            </span>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </AnimatePresence>
                  {sortedData.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center py-10 text-slate-500 pointer-events-none">
                      <span className="text-[11px] font-medium">{t('lifetimeStats.noRecords') || 'No records found.'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer glow */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
