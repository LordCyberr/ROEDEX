import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { X, Sword, Pickaxe, Axe, Leaf, Search, Package } from 'lucide-react';
import { formatInternalName } from '../../utils/formatters';
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

  if (!isLifetimeStatsOpen) return null;

  const categories = {
    combat: { icon: Sword, color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/10', data: lifetimeStats.mobsKilled },
    mining: { icon: Pickaxe, color: 'text-slate-400', border: 'border-slate-500/20', bg: 'bg-slate-500/10', data: lifetimeStats.oresMined },
    logging: { icon: Axe, color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/10', data: lifetimeStats.treesCut },
    plants: { icon: Leaf, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10', data: lifetimeStats.plantsHarvested },
    mobDrops: { icon: Package, color: 'text-purple-400', border: 'border-purple-500/20', bg: 'bg-purple-500/10', data: lifetimeStats.itemsLooted },
  };

  const currentData = categories[activeCategory].data || {};
  const sortedData = Object.entries(currentData as Record<string, number>)
    .filter(([k]) => k.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => b[1] - a[1]);

  const getTotal = (record: Record<string, number>) => Object.values(record).reduce((a, b) => a + b, 0);

  return (
    <AnimatePresence>
      {isLifetimeStatsOpen && (
        <div ref={dragConstraintsRef} className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            drag
            dragConstraints={dragConstraintsRef}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="pointer-events-auto w-full max-w-2xl h-[600px] max-h-[80vh] flex flex-col bg-[var(--bg-panel)]/95 backdrop-blur-xl border border-[var(--border-accent)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="cursor-move flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <h2 className="text-xs font-black tracking-widest text-white uppercase">ROEDEX // {t('lifetimeStats.title')}</h2>
              </div>
              <button 
                onClick={() => setIsLifetimeStatsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-[var(--bg-hover)] rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Navigation */}
              <div className="w-32 flex flex-col gap-1 p-2 border-r border-[var(--border-subtle)] bg-[var(--bg-card)]">
                {(Object.keys(categories) as Array<keyof typeof categories>).map((cat) => {
                  const { icon: Icon, color, bg } = categories[cat];
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all border ${
                        isActive ? `${bg} border-white/20 shadow-inner` : 'border-transparent hover:bg-white/5 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Icon size={20} className={`mb-2 ${color}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                        {cat}
                      </span>
                      <span className="text-[9px] font-mono mt-1 opacity-50">
                        {getTotal(categories[cat].data).toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col bg-[var(--bg-base)]">
                {/* Search Bar */}
                <div className="p-3 border-b border-[var(--border-subtle)]">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder={t('stats.searchEntries') as string}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-md py-2 pl-9 pr-3 text-[12px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                </div>

                {/* List */}
                <div className="flex-1 p-2 relative overflow-hidden min-h-0" onPointerDownCapture={(e) => e.stopPropagation()}>
                  <ul className="absolute inset-0 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1 pr-3">
                    {sortedData.map(([key, value]) => (
                      <motion.li layout key={key} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-colors group shrink-0">
                        <span className="text-[13px] font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                          {formatInternalName(key)}
                        </span>
                        <span className={`font-mono text-[14px] font-black ${categories[activeCategory].color}`}>
                          {value.toLocaleString()}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                  {sortedData.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center py-10 text-[var(--text-muted)] pointer-events-none">
                      <span className="text-[13px] font-medium">{t('lifetimeStats.noRecords')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer glow */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
