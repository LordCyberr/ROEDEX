import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { X, History, Clock, Coins, Package } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';

import { useSettingsStore } from '../../store/settingsStore';

export const RunHistoryWindow: React.FC = () => {
  const { t } = useTranslation();
  const { runHistory, clearRunHistory } = useTrackerStore(useShallow((state: any) => ({
    runHistory: state.runHistory,
    clearRunHistory: state.clearRunHistory,
  })));
  
  const isRunHistoryOpen = useSettingsStore((state: any) => state.isRunHistoryOpen);
  const setIsRunHistoryOpen = useSettingsStore((state: any) => state.setIsRunHistoryOpen);

  const dragConstraintsRef = useRef(null);

  return (
    <AnimatePresence>
      {isRunHistoryOpen && (
        <div ref={dragConstraintsRef} className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            drag
            dragConstraints={dragConstraintsRef}
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="pointer-events-auto w-full max-w-lg h-[500px] max-h-[80vh] flex flex-col bg-[var(--bg-panel)]/95 backdrop-blur-xl border border-[var(--border-accent)] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Header */}
            <div className="cursor-move flex items-center justify-between p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/50">
              <div className="flex items-center gap-2">
                <History size={16} className="text-emerald-400" />
                <h2 className="text-xs font-black tracking-widest text-white uppercase">ROEDEX // {t('overlay.pastRuns')}</h2>
              </div>
              <div className="flex items-center gap-2">
                {runHistory.length > 0 && (
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to clear your run history?')) {
                        clearRunHistory();
                      }
                    }}
                    className="text-[10px] uppercase font-bold text-[var(--text-muted)] hover:text-red-400 transition-colors px-2"
                  >
                    {t('stats.clearHistory')}
                  </button>
                )}
                <button 
                  onClick={() => setIsRunHistoryOpen(false)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden bg-[var(--bg-base)] p-3">
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2" onPointerDownCapture={(e) => e.stopPropagation()}>
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {runHistory.map((run: any) => {
                      const startDate = new Date(run.startTime).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      });
                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={run.id}
                          className="flex flex-col p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/30 transition-colors group"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                              {startDate}
                            </span>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-panel)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
                              <Clock size={12} className="text-emerald-500/70" /> {formatDuration(run.duration)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[var(--bg-hover)] rounded-lg p-3 flex flex-col items-center justify-center border border-[var(--border-subtle)]">
                              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Coins size={12} /> {t('stats.runes')}
                              </span>
                              <span className="text-yellow-400 font-mono font-black text-[15px]">
                                {run.runes.toLocaleString()}
                              </span>
                            </div>
                            <div className="bg-[var(--bg-hover)] rounded-lg p-3 flex flex-col items-center justify-center border border-[var(--border-subtle)]">
                              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                <Package size={12} /> {t('stats.lootWorth')}
                              </span>
                              <span className="text-cyan-400 font-mono font-black text-[15px]">
                                {run.lootWorth.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                    {runHistory.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-16 text-[var(--text-muted)] gap-3">
                        <History size={32} className="opacity-20 mb-2" />
                        <span className="text-[13px] font-bold tracking-widest uppercase">{t('overlay.noPastRuns')}</span>
                        <span className="text-[11px] opacity-70">{t('overlay.finishToSave')}</span>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Footer glow */}
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-50" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
