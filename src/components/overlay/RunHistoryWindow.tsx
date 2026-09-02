import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { X, History, Clock, Coins, Package, MapPin, Trash2, ChevronDown, ChevronUp, Sword, Pickaxe, Axe, Leaf } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettingsStore } from '../../store/settingsStore';

export const RunHistoryWindow: React.FC = () => {
  const { t } = useTranslation();
  const { runHistory, clearRunHistory, deleteRun } = useTrackerStore(useShallow((state: any) => ({
    runHistory: state.runHistory,
    clearRunHistory: state.clearRunHistory,
    deleteRun: state.deleteRun,
  })));
  
  const isRunHistoryOpen = useSettingsStore((state: any) => state.isRunHistoryOpen);
  const setIsRunHistoryOpen = useSettingsStore((state: any) => state.setIsRunHistoryOpen);

  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  const dragConstraintsRef = useRef(null);

  // Close on Escape
  React.useEffect(() => {
    if (!isRunHistoryOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsRunHistoryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunHistoryOpen, setIsRunHistoryOpen]);

  const toggleExpand = (id: string) => {
    setExpandedRunId(expandedRunId === id ? null : id);
  };

  return (
    <AnimatePresence>
      {isRunHistoryOpen && (
        <div ref={dragConstraintsRef} className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            role="dialog"
            aria-label={`ROEDEX ${t('overlay.pastRuns') || 'Past Runs History'}`}
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
                  isConfirmingClear ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          clearRunHistory();
                          setIsConfirmingClear(false);
                        }}
                        className="text-[10px] uppercase font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-0.5 rounded cursor-pointer transition-colors"
                      >
                        Confirm?
                      </button>
                      <button
                        onClick={() => setIsConfirmingClear(false)}
                        className="text-[10px] uppercase font-bold text-slate-400 hover:text-white px-1.5 py-0.5 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setIsConfirmingClear(true)}
                      className="text-[10px] uppercase font-bold text-[var(--text-muted)] hover:text-red-400 transition-colors px-2 cursor-pointer"
                    >
                      {t('stats.clearHistory')}
                    </button>
                  )
                )}
                <button 
                  onClick={() => setIsRunHistoryOpen(false)}
                  title="Close (ESC)"
                  aria-label="Close Past Runs (ESC)"
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer"
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
                      const runesPerHour = run.duration > 0 ? Math.round(run.runes / (run.duration / 3600000)) : 0;
                      const isExpanded = expandedRunId === run.id;

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          key={run.id}
                          className="flex flex-col p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-emerald-500/30 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                {startDate}
                              </span>
                              <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-bold">
                                <MapPin size={10} className="text-emerald-500" />
                                {run.zone || 'Unknown Zone'}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-panel)] px-2 py-1 rounded-md border border-[var(--border-subtle)]">
                                <Clock size={12} className="text-emerald-500/70" /> {formatDuration(run.duration)}
                              </div>
                              <button 
                                onClick={() => deleteRun(run.id)}
                                className="p-1 text-[var(--text-muted)] hover:text-red-400 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                                title="Delete run record"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div className="bg-[var(--bg-hover)] rounded-lg p-2.5 flex flex-col border border-[var(--border-subtle)]">
                              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Coins size={12} className="text-yellow-500" /> {t('stats.runes')}
                              </span>
                              <div className="flex items-baseline justify-between">
                                <span className="text-yellow-400 font-mono font-black text-[14px]">
                                  {run.runes.toLocaleString()}
                                </span>
                                <span className="text-[8px] text-[var(--text-muted)] font-bold">
                                  {runesPerHour.toLocaleString()}/hr
                                </span>
                              </div>
                            </div>
                            <div className="bg-[var(--bg-hover)] rounded-lg p-2.5 flex flex-col border border-[var(--border-subtle)]">
                              <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest mb-1 flex items-center gap-1">
                                <Package size={12} className="text-cyan-500" /> {t('stats.lootWorth')}
                              </span>
                              <span className="text-cyan-400 font-mono font-black text-[14px]">
                                {run.lootWorth.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          {/* Expand/Collapse Trigger */}
                          <button
                            onClick={() => toggleExpand(run.id)}
                            className="flex items-center justify-center gap-1 w-full py-1 mt-1 text-[10px] uppercase font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border-t border-[var(--border-subtle)]/50 pt-2"
                          >
                            {isExpanded ? (
                              <>
                                Hide details <ChevronUp size={12} />
                              </>
                            ) : (
                              <>
                                View details <ChevronDown size={12} />
                              </>
                            )}
                          </button>

                          {/* Details Panel */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="flex flex-col gap-3 pt-3 border-t border-[var(--border-subtle)] mt-2">
                                  {/* Activities Grid */}
                                  <div className="grid grid-cols-4 gap-1.5 text-center">
                                    <div className="bg-[var(--bg-panel)] rounded p-1.5 flex flex-col items-center justify-center border border-[var(--border-subtle)]/30">
                                      <Sword size={11} className="text-red-400 mb-0.5" />
                                      <span className="text-[8px] text-[var(--text-muted)] uppercase">Kills</span>
                                      <span className="text-[10px] font-mono font-bold text-white">{run.mobsKilled || 0}</span>
                                    </div>
                                    <div className="bg-[var(--bg-panel)] rounded p-1.5 flex flex-col items-center justify-center border border-[var(--border-subtle)]/30">
                                      <Axe size={11} className="text-orange-400 mb-0.5" />
                                      <span className="text-[8px] text-[var(--text-muted)] uppercase">Wood</span>
                                      <span className="text-[10px] font-mono font-bold text-white">{run.treesCut || 0}</span>
                                    </div>
                                    <div className="bg-[var(--bg-panel)] rounded p-1.5 flex flex-col items-center justify-center border border-[var(--border-subtle)]/30">
                                      <Pickaxe size={11} className="text-yellow-400 mb-0.5" />
                                      <span className="text-[8px] text-[var(--text-muted)] uppercase">Ores</span>
                                      <span className="text-[10px] font-mono font-bold text-white">{run.oresMined || 0}</span>
                                    </div>
                                    <div className="bg-[var(--bg-panel)] rounded p-1.5 flex flex-col items-center justify-center border border-[var(--border-subtle)]/30">
                                      <Leaf size={11} className="text-green-400 mb-0.5" />
                                      <span className="text-[8px] text-[var(--text-muted)] uppercase">Herbs</span>
                                      <span className="text-[10px] font-mono font-bold text-white">{run.plantsHarvested || 0}</span>
                                    </div>
                                  </div>

                                  {/* Top Loot */}
                                  <div>
                                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-wider block mb-1.5">Top Loot Items</span>
                                    {run.topLoot && run.topLoot.length > 0 ? (
                                      <div className="flex flex-col gap-1">
                                        {run.topLoot.map((item: any, idx: number) => (
                                          <div key={idx} className="flex justify-between items-center text-[10px] px-2 py-1 bg-[var(--bg-panel)] border border-[var(--border-subtle)]/20 rounded">
                                            <span className="text-[var(--text-secondary)] font-medium">
                                              {item.qty}x {item.name.replace(/^./, (str: string) => str.toUpperCase())}
                                            </span>
                                            <span className="text-cyan-400 font-mono font-bold">
                                              {item.value.toLocaleString()} resell
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-[9px] text-[var(--text-muted)] italic text-center py-2 bg-[var(--bg-panel)] rounded border border-[var(--border-subtle)]/10">
                                        No loot recorded
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
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
