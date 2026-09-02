/**
 * @file QuickStatsDrawer.tsx
 * @description Quick Stats slide-up drawer component for ROEDEX.
 * Displays live hourly efficiency stats (Runes/hr, Kills/hr, XP/hr, Gold/hr),
 * top collected session loot, and session timer in a glassmorphic bottom drawer.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettingsStore } from '../../store/settingsStore';
import { useTrackerStore } from '../../store/trackerStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Zap, Clock, Coins, ShieldAlert, Trophy, X, TrendingUp } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const QuickStatsDrawer: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const isQuickStatsOpen = useSettingsStore((s: any) => s.isQuickStatsOpen);
  const setIsQuickStatsOpen = useSettingsStore((s: any) => s.setIsQuickStatsOpen);
  const sessionStartTime = useTrackerStore(state => state.sessionStartTime);
  const sessionRunes = useTrackerStore(state => state.sessionRunes);
  const sessionMobsKilled = useTrackerStore(state => state.sessionMobsKilled);
  const sessionLoot = useTrackerStore(state => state.sessionLoot);

  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isQuickStatsOpen || !sessionStartTime) return;
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - sessionStartTime);
    }, 1000);
    setElapsedMs(Date.now() - sessionStartTime);

    return () => clearInterval(interval);
  }, [isQuickStatsOpen, sessionStartTime]);

  const elapsedHours = Math.max(elapsedMs / 3600000, 1 / 3600); // at least 1 sec
  const runesPerHour = Math.round(sessionRunes / elapsedHours);
  const killsPerHour = Math.round(sessionMobsKilled / elapsedHours);
  const xpHour = Math.round((sessionMobsKilled * 125 + sessionRunes * 2) / elapsedHours);
  const goldPerHour = Math.round(sessionRunes / elapsedHours);

  // Top 3 loot items by quantity
  const topLoot = Object.entries(sessionLoot || {})
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isQuickStatsOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl p-4 glass-panel border-t border-x border-[var(--border-accent)] rounded-t-2xl shadow-2xl backdrop-blur-xl bg-[var(--bg-panel)]/95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                <Zap size={16} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {t('stats.drawerTitle') || 'Quick Performance Stats'}
                </h3>
                <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                  <Clock size={10} />
                  {formatDuration(elapsedMs)} {t('stats.activeSession') || 'active session'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsQuickStatsOpen(false)}
              className="p-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <Coins size={10} className="text-amber-400" /> Runes/hr
              </span>
              <span className="text-sm font-bold text-amber-400 mt-0.5">
                {runesPerHour.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <ShieldAlert size={10} className="text-red-400" /> Kills/hr
              </span>
              <span className="text-sm font-bold text-red-400 mt-0.5">
                {killsPerHour.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <TrendingUp size={10} className="text-purple-400" /> XP/hr
              </span>
              <span className="text-sm font-bold text-purple-400 mt-0.5">
                {xpHour.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[9px] uppercase font-semibold text-[var(--text-muted)] flex items-center gap-1">
                <Trophy size={10} className="text-[var(--accent-primary)]" /> Gold/hr
              </span>
              <span className="text-sm font-bold text-[var(--accent-primary)] mt-0.5">
                {goldPerHour.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Top Session Loot */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
              {t('stats.topLoot') || 'Top Session Drops'}
            </span>
            {topLoot.length > 0 ? (
              <div className="flex items-center gap-2">
                {topLoot.map(([item, qty]) => (
                  <div
                    key={item}
                    className="flex-1 flex items-center justify-between px-2 py-1 rounded-lg bg-[var(--bg-card)] border border-white/5 text-[10px]"
                  >
                    <span className="truncate text-[var(--text-primary)] font-medium">
                      {item}
                    </span>
                    <span className="text-[var(--accent-primary)] font-bold ml-1">
                      x{qty}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-[var(--text-muted)] italic">
                {t('stats.noLootYet') || 'No items collected in this session yet.'}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
