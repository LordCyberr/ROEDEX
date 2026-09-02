import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useGlobalTick } from '../../core/tick';
import { useShallow } from 'zustand/react/shallow';
import { motion, useDragControls, useMotionValue } from 'motion/react';
import { Timer, PackageOpen, Coins } from 'lucide-react';
import { getResellValue } from '../../data/prices';

export const EfficiencyHUD: React.FC = () => {
  const { sessionActive, sessionStartTime, sessionRunes, sessionLoot } = useTrackerStore(
    useShallow((state: any) => ({
      sessionActive: state.sessionActive,
      sessionStartTime: state.sessionStartTime,
      sessionRunes: state.sessionRunes,
      sessionLoot: state.sessionLoot,
    }))
  );
  
  const { isUILocked } = useSettingsStore(useShallow((state: any) => ({
      isUILocked: state.isUILocked
    }))
  );

  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const now = useGlobalTick();

  if (!sessionActive) return null;

  const durationMs = sessionStartTime ? now - sessionStartTime : 0;
  const totalLootValue = Object.entries(sessionLoot || {}).reduce((acc, [name, qty]) => acc + getResellValue(name, qty as number), 0);

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
      className={`absolute top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3.5 bg-black/85 backdrop-blur-md border border-[var(--border-accent)] rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(0,0,0,0.6)] ${isUILocked ? 'pointer-events-none' : 'pointer-events-auto cursor-grab active:cursor-grabbing'}`}
    >
      {/* Session Timer */}
      <div className="flex items-center gap-1.5 text-purple-300 font-bold tracking-wider uppercase text-[10px]" title="Session Duration">
        <Timer size={12} className="text-purple-400 shrink-0" />
        <span className="font-mono">{formatDuration(durationMs)}</span>
      </div>
      
      <div className="w-px h-3 bg-white/20" />
      
      {/* Mob Drops / Loot Worth */}
      <div className="flex items-center gap-1.5 text-purple-300 font-bold tracking-wider uppercase text-[10px]" title="Total Mob Loot Worth">
        <PackageOpen size={12} className="text-purple-400 shrink-0" />
        <span className="font-mono text-[11px] text-purple-300 font-black">{totalLootValue.toLocaleString()}</span>
      </div>

      <div className="w-px h-3 bg-white/20" />
      
      {/* Total Runes Collected */}
      <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wider uppercase text-[10px]" title="Total Runes Collected">
        <Coins size={12} className="text-emerald-400 shrink-0" />
        <span className="font-mono text-[11px] font-black">{(sessionRunes || 0).toLocaleString()}</span>
      </div>
    </motion.div>
  );
};
