import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';
import { PackageOpen, Diamond, Coins } from 'lucide-react';
import { getRarityColor } from '../../../utils/rarity';
import { useTranslation } from '../../../hooks/useTranslation';

export const RecentLootView: React.FC = () => {
  const { t } = useTranslation();
  
  const {
    recentLootLogs,
  } = useTrackerStore(useShallow(state => ({
    recentLootLogs: state.recentLootLogs,
  })));

  const tableSettings = useSettingsStore(useShallow((state: any) => state.tableSettings));
  const recentLootLength = tableSettings?.recentLootLength || 10;

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[var(--bg-base)]">
       <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
          {(!recentLootLogs || recentLootLogs.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)]/70 italic text-[10px] gap-1.5">
              <PackageOpen size={20} className="opacity-20" />
              <span>{t('stats.noLoot' as any) || 'No recent loot.'}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 pr-0.5 relative">
              <AnimatePresence>
                {recentLootLogs.slice(0, recentLootLength).map((entry: any, idx: number) => (
                  <motion.div 
                    initial={{ opacity: 0, y: -15, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)', transition: { duration: 0.2 } }}
                    key={entry.id || idx} 
                    className="flex justify-between items-stretch bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] transition-colors rounded border border-[var(--border-subtle)] shrink-0 overflow-hidden origin-top"
                  >
                    {/* Left Side (Items) */}
                    {entry.items && entry.items.length > 0 && (
                      <div className="flex flex-col gap-1 flex-1 p-1.5 min-w-0 justify-center">
                        {entry.items.map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center gap-1">
                            <span className={`truncate text-[10px] font-bold ${getRarityColor(item.name)} drop-shadow-sm`}>{item.name}</span>
                            <div className="flex items-center gap-1 shrink-0 select-none bg-[var(--bg-base)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] shadow-sm">
                              <span className="text-[9px] font-mono font-black text-cyan-400">x{item.qty}</span>
                              <Diamond size={8} className="text-cyan-500" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Right Side (Runestones) */}
                    {entry.runes > 0 && (
                      <div className={`flex items-center justify-center p-1.5 shrink-0 ${(entry.items && entry.items.length > 0) ? 'min-w-[50px]' : 'flex-1'}`}>
                        <div className="flex items-center gap-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 shadow-inner">
                          <span className="text-[10px] font-mono font-black text-amber-400">+{entry.runes}</span>
                          <Coins size={9} className="text-amber-500 drop-shadow-sm" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
       </div>
    </div>
  );
};
