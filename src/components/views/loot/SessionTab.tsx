import React, { useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { motion, AnimatePresence } from 'motion/react';
import { PackageOpen, Play, Square, Diamond, Trash2, History, ListPlus, Sparkles, Coins, Timer, ExternalLink, Settings } from 'lucide-react';
import { getResellValue } from '../../../data/prices';
import { useGlobalTick } from '../../../core/tick';
import { AICompanion } from '../../../core/companion/AICompanion';
import { Tooltip } from '../../ui/Tooltip';
import { formatDuration } from '../../../utils/formatters';
import { useTranslation } from '../../../hooks/useTranslation';
import { getRarityColor } from '../../../utils/rarity';

const RecentLootSettingsDropdown: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
        title="Recent Loot Settings"
      >
        <Settings size={10} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-max bg-[var(--bg-panel)] border border-[var(--border-accent)] rounded-lg shadow-xl z-[100] overflow-hidden flex flex-col p-1">
          <div className="px-2 py-1 text-[8px] font-black uppercase text-[var(--text-muted)] border-b border-[var(--border-subtle)] mb-1">Items to Show</div>
          {[5, 10, 15, 20].map((num) => (
            <div 
              key={num} 
              onClick={() => { onChange(num); setIsOpen(false); }}
              className={`px-3 py-1.5 text-[10px] cursor-pointer hover:bg-[var(--accent-primary)] hover:text-white transition-colors rounded ${value === num ? 'bg-[var(--bg-card)] text-[var(--accent-primary)] font-bold' : 'text-[var(--text-primary)] font-medium'}`}
            >
              {num} Items
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SessionTimer: React.FC<{ sessionActive: boolean; sessionStartTime: number | null }> = React.memo(({ sessionActive, sessionStartTime }) => {
  const now = useGlobalTick();
  const durationMs = sessionActive && sessionStartTime ? now - sessionStartTime : 0;
  return (
    <span className={`font-mono font-black tracking-widest text-sm ${sessionActive ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-[var(--text-muted)]'}`}>
      {formatDuration(durationMs)}
    </span>
  );
});

export const SessionTab: React.FC<{ isHorizontal: boolean; compactHeightClass: string }> = React.memo(({ isHorizontal: _isHorizontal, compactHeightClass }) => {
  const { t } = useTranslation();
  const { 
    sessionActive, setSessionActive, 
    sessionRunes, sessionLoot, recentLootLogs,
    clearSession, sessionStartTime, setSessionStartTime,
    endSession
  } = useTrackerStore(useShallow((state: any) => ({
    sessionActive: state.sessionActive,
    setSessionActive: state.setSessionActive,
    sessionRunes: state.sessionRunes,
    sessionLoot: state.sessionLoot,
    recentLootLogs: state.recentLootLogs,
    clearSession: state.clearSession,
    sessionStartTime: state.sessionStartTime,
    setSessionStartTime: state.setSessionStartTime,
    endSession: state.endSession,
  })));

  const tableSettings = useSettingsStore(useShallow((state: any) => state.tableSettings));
  const recentLootLength = tableSettings?.recentLootLength || 10;

  const sortedLoot = useMemo(() => Object.entries((sessionLoot || {}) as Record<string, number>).sort((a, b) => b[1] - a[1]), [sessionLoot]);
  const totalLootValue = useMemo(() => sortedLoot.reduce((acc, [name, qty]) => acc + getResellValue(name, qty), 0), [sortedLoot]);
  const totalCombined = sessionRunes + totalLootValue;
  
  const now = useGlobalTick();
  const durationMs = sessionActive && sessionStartTime ? now - sessionStartTime : 0;
  const durationHours = durationMs > 0 ? durationMs / (1000 * 60 * 60) : 0;
  const profitPerHour = durationHours > 0.016 ? Math.round(totalCombined / durationHours) : 0;
  
  const handleToggleSession = () => {
    if (sessionActive) {
      endSession(totalLootValue);
    } else {
      clearSession();
      setSessionStartTime(Date.now());
      setSessionActive(true);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="flex flex-col gap-2 h-full w-full"
    >
      {/* Sleek Vertical-Optimized Control Card */}
      <div className="flex flex-col gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-2.5 rounded-xl shrink-0 shadow-lg backdrop-blur-md">
        {/* Top Row: Timer & Quick Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg border ${sessionActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[var(--bg-panel)] border-[var(--border-subtle)] text-[var(--text-muted)]'}`}>
              <Timer size={13} className={sessionActive ? 'animate-pulse' : ''} />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-[var(--text-muted)] uppercase tracking-widest font-black leading-none mb-0.5">{t('sessionTab.sessionTime' as any) || 'Session Time'}</span>
              <SessionTimer sessionActive={sessionActive} sessionStartTime={sessionStartTime} />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Tooltip content={t('sessionTab.resetLoot' as any) as string || 'Reset'}>
              <button
                onClick={() => {
                  clearSession();
                  AICompanion.onClearLoot();
                }}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-panel)] hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 border border-[var(--border-subtle)] hover:border-red-500/30 transition-all cursor-pointer"
              >
                <Trash2 size={12} />
              </button>
            </Tooltip>
            
            <Tooltip content={t('sessionTab.viewPastRuns' as any) as string || 'History'}>
              <button
                onClick={() => useSettingsStore.getState().setIsRunHistoryOpen(true)}
                className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--bg-panel)] hover:bg-blue-500/20 text-[var(--text-muted)] hover:text-blue-400 border border-[var(--border-subtle)] hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <History size={12} />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Bottom Row: Full Width Action Button */}
        <button 
          onClick={handleToggleSession}
          className={`flex items-center justify-center gap-2 w-full py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shadow-md cursor-pointer select-none border ${
            sessionActive 
              ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/30 hover:border-red-500/50' 
              : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/30 hover:border-emerald-500/50'
          }`}
        >
          {sessionActive ? (
            <><Square size={11} fill="currentColor" /> {t('sessionTab.finishRun')}</>
          ) : (
            <><Play size={11} fill="currentColor" /> {t('sessionTab.startNewRun')}</>
          )}
        </button>
      </div>

      {/* Main Content Area - Single Column List */}
      <div className="flex flex-col flex-1 min-h-0 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-inner backdrop-blur-md">
         <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 min-w-0 pr-1">
              <ListPlus size={12} className="text-indigo-400 shrink-0" />
              <span className="text-[9px] uppercase tracking-widest font-black text-slate-300 truncate">
                {t('sessionTab.recentLoot' as any) || 'Recent Loot'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <RecentLootSettingsDropdown 
                value={recentLootLength} 
                onChange={(v) => useSettingsStore.getState().updateTableSettings({ recentLootLength: v as any })} 
              />
              <button 
                onClick={() => useSettingsStore.getState().popOutTab('recentLoot', window.innerWidth / 2 - 150, window.innerHeight / 2 - 200)}
                className="text-[var(--text-muted)] hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer"
                title="Pop Out Recent Loot"
              >
                <ExternalLink size={10} />
              </button>
              <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded-md border border-indigo-500/20 shrink-0">
                {recentLootLogs ? Math.min(recentLootLength, recentLootLogs.length) : 0}
              </span>
            </div>
         </div>
         <div className={`flex-1 overflow-y-auto custom-scrollbar p-1.5 ${compactHeightClass}`}>
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
                            <span data-item-id={item.name} className={`truncate text-[10px] font-bold cursor-pointer ${getRarityColor(item.name)} drop-shadow-sm`}>{item.name}</span>
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

      {/* Unified Bottom Totals Dashboard */}
      <div className="grid grid-cols-2 gap-1.5 shrink-0 bg-[var(--bg-base)] p-1.5 rounded-xl border border-[var(--border-subtle)] backdrop-blur-md shadow-lg">
         
         <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-cyan-900/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-1 text-cyan-400/80 mb-0.5 z-10">
              <PackageOpen size={10} />
              <span className="text-[8px] uppercase font-black tracking-widest">{t('sessionTab.lootWorth' as any) || 'Loot Worth'}</span>
            </div>
            <div className="text-[14px] font-mono font-black text-cyan-400 z-10 tracking-tight drop-shadow-sm">
               {totalLootValue.toLocaleString()}
            </div>
         </div>

         <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-2 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-amber-900/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-1 text-amber-400/80 mb-0.5 z-10">
              <Coins size={10} />
              <span className="text-[8px] uppercase font-black tracking-widest">{t('sessionTab.runesFound' as any) || 'Runes Found'}</span>
            </div>
            <div className="text-[14px] font-mono font-black text-amber-400 z-10 tracking-tight drop-shadow-sm">
               {sessionRunes.toLocaleString()}
            </div>
         </div>

         <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[inset_0_0_15px_rgba(168,85,247,0.15)] group hover:bg-purple-900/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 to-transparent pointer-events-none" />
            <div className="flex items-center gap-1 text-purple-300 mb-0.5 z-10">
              <Sparkles size={10} />
              <span className="text-[8px] uppercase font-black tracking-widest">{t('sessionTab.totalValue' as any) || 'Total Value'}</span>
            </div>
            <div className="text-[16px] font-mono font-black text-purple-400 z-10 leading-none tracking-tight drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
               {totalCombined.toLocaleString()}
            </div>
         </div>

         <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-2 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] group hover:bg-emerald-900/40 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="flex items-center gap-1 text-emerald-400 mb-0.5 z-10">
              <Timer size={10} />
              <span className="text-[8px] uppercase font-black tracking-widest">{t('sessionTab.profitPerHour' as any) || 'Profit / Hour'}</span>
            </div>
            <div className="text-[16px] font-mono font-black text-emerald-400 z-10 leading-none tracking-tight drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
               {profitPerHour > 0 ? profitPerHour.toLocaleString() : '---'}
            </div>
         </div>

      </div>
    </motion.div>
  );
});

