import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { X, History, Clock, Coins, Package } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';

export const RunHistoryWindow: React.FC = () => {
  const { t } = useTranslation();
  const { runHistory, isRunHistoryOpen, setIsRunHistoryOpen, clearRunHistory } = useTrackerStore(useShallow((state: any) => ({
    runHistory: state.runHistory,
    isRunHistoryOpen: state.isRunHistoryOpen,
    setIsRunHistoryOpen: state.setIsRunHistoryOpen,
    clearRunHistory: state.clearRunHistory,
  })));

  const dragConstraintsRef = useRef(null);

  if (!isRunHistoryOpen) return null;

  return (
    <>
      {/* Full screen constraints for dragging */}
      <div ref={dragConstraintsRef} className="fixed inset-0 pointer-events-none z-[999]" />
      
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={dragConstraintsRef}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed z-[1000] flex flex-col pointer-events-auto bg-[var(--bg-panel)] glass-panel border border-[var(--border-accent)] shadow-2xl rounded-xl overflow-hidden"
        style={{ width: 450, height: 500, top: 'calc(50% - 250px)', left: 'calc(50% - 225px)' }}
      >
        {/* Header - Draggable */}
        <div className="flex items-center justify-between p-3 border-b border-white/10 bg-white/[0.02] cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-2">
            <History size={14} className="text-emerald-400" />
            <h2 className="text-xs font-black tracking-widest text-white uppercase">{t('overlay.pastRuns')}</h2>
          </div>
          <div className="flex items-center gap-2">
            {runHistory.length > 0 && (
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to clear your run history?')) {
                    clearRunHistory();
                  }
                }}
                className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-400 transition-colors px-2"
              >
                Clear History
              </button>
            )}
            <button 
              onClick={() => setIsRunHistoryOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-[var(--bg-hover)] rounded transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden bg-[var(--bg-card)] p-2">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-2">
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
                      className="flex flex-col p-3 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {startDate}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-slate-300">
                          <Clock size={10} className="text-slate-500" /> {formatDuration(run.duration)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[var(--bg-card)] rounded p-2 flex flex-col items-center justify-center border border-[var(--border-subtle)]">
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Coins size={10} /> Runes
                          </span>
                          <span className="text-yellow-400 font-mono font-black text-[13px]">
                            {run.runes.toLocaleString()}
                          </span>
                        </div>
                        <div className="bg-[var(--bg-card)] rounded p-2 flex flex-col items-center justify-center border border-[var(--border-subtle)]">
                          <span className="text-[8px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <Package size={10} /> Loot Worth
                          </span>
                          <span className="text-cyan-400 font-mono font-black text-[13px]">
                            {run.lootWorth.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                {runHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-2">
                    <History size={24} className="opacity-20" />
                    <span className="text-[11px] font-bold tracking-widest uppercase">{t('overlay.noPastRuns')}</span>
                    <span className="text-[9px]">{t('overlay.finishToSave')}</span>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};
