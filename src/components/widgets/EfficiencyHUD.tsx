import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useGlobalTick } from '../../core/tick';
import { useShallow } from 'zustand/react/shallow';
import { motion, useDragControls, useMotionValue } from 'motion/react';
import { Timer, TrendingUp, Coins } from 'lucide-react';
import { getResellValue } from '../../data/prices';

export const EfficiencyHUD: React.FC = () => {
  const { sessionActive, sessionStartTime, sessionRunes, sessionLoot, isUILocked } = useTrackerStore(
    useShallow((state) => ({
      sessionActive: state.sessionActive,
      sessionStartTime: state.sessionStartTime,
      sessionRunes: state.sessionRunes,
      sessionLoot: state.sessionLoot,
      isUILocked: state.isUILocked
    }))
  );

  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const now = useGlobalTick();

  if (!sessionActive) return null;

  const durationMs = sessionStartTime ? now - sessionStartTime : 0;
  const hours = durationMs / 3600000;
  
  const totalLootValue = Object.entries(sessionLoot).reduce((acc, [name, qty]) => acc + getResellValue(name, qty), 0);
  const totalWorth = sessionRunes + totalLootValue;

  const runesPerHour = hours > 0 ? Math.round(sessionRunes / hours) : 0;
  const valuePerHour = hours > 0 ? Math.round(totalWorth / hours) : 0;

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m ${s}s`;
    return `${m}m ${s}s`;
  };

  return (
    <motion.div
      style={{ x, y, willChange: 'transform' }}
      drag
      dragMomentum={false}
      dragListener={!isUILocked}
      dragControls={dragControls}
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-black/80 backdrop-blur-md border border-[var(--border-accent)] rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex items-center gap-1.5 text-[var(--accent-primary)] font-bold tracking-widest uppercase text-[10px]">
        <Timer size={12} />
        <span className="font-mono">{formatDuration(durationMs)}</span>
      </div>
      
      <div className="w-px h-3 bg-white/20" />
      
      <div className="flex items-center gap-1.5 text-purple-400 font-bold tracking-widest uppercase text-[10px]">
        <Coins size={12} />
        <span className="font-mono">{runesPerHour.toLocaleString()}/h</span>
      </div>

      <div className="w-px h-3 bg-white/20" />
      
      <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-widest uppercase text-[10px]">
        <TrendingUp size={12} />
        <span className="font-mono text-[11px]">{valuePerHour.toLocaleString()}/h</span>
      </div>
    </motion.div>
  );
};
