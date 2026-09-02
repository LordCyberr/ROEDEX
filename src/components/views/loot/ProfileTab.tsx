import React, { useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { Sword, Award, Pickaxe, Axe, Leaf } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { motion } from 'motion/react';

export const ProfileTab: React.FC<{ isHorizontal: boolean }> = React.memo(({ isHorizontal }) => {
  const { t } = useTranslation();
  const { playerProfile, lifetimeStats } = useTrackerStore(useShallow((state: any) => ({
    playerProfile: state.playerProfile,
    lifetimeStats: state.lifetimeStats,
  })));
  
  const setIsLifetimeStatsOpen = useSettingsStore(state => state.setIsLifetimeStatsOpen);

  const rawPct = playerProfile.runesRequired > 0 ? (playerProfile.currentRunes / playerProfile.runesRequired) * 100 : 0;
  const pct = isNaN(rawPct) ? 0 : Math.min(100, Math.floor(rawPct));

  const totalMobs = useMemo(() => Object.values(lifetimeStats?.mobsKilled || {}).reduce((a: number, b: any) => a + b, 0) as number, [lifetimeStats]);
  const totalOres = useMemo(() => Object.values(lifetimeStats?.oresMined || {}).reduce((a: number, b: any) => a + b, 0) as number, [lifetimeStats]);
  const totalTrees = useMemo(() => Object.values(lifetimeStats?.treesCut || {}).reduce((a: number, b: any) => a + b, 0) as number, [lifetimeStats]);
  const totalPlants = useMemo(() => Object.values(lifetimeStats?.plantsHarvested || {}).reduce((a: number, b: any) => a + b, 0) as number, [lifetimeStats]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-3 h-fit w-full p-1 text-[10px] select-none`}
    >
      {/* Top Card: Profile Info */}
      <div className="flex flex-col items-center justify-center gap-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl relative overflow-hidden group shadow-2xl shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Centered Level Ring */}
        <div className="relative w-16 h-16 flex items-center justify-center shrink-0 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] my-1">
           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="2.5" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
           </svg>
           <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[6.5px] text-emerald-400 font-black tracking-widest leading-none uppercase">{t('loot.lvl')}</span>
              <span className="text-[18px] font-black text-white leading-none font-mono mt-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{playerProfile.level}</span>
           </div>
        </div>
        
        {/* Name & Runes Stacked */}
        <div className="flex flex-col items-center w-full z-10 text-center">
           <div className="text-[12px] font-black text-white uppercase tracking-widest truncate max-w-full font-mono drop-shadow-md">
             {playerProfile.name ? playerProfile.name.toUpperCase() : (t('ui.profile') || 'PLAYER PROFILE').toUpperCase()}
           </div>
           <div className="text-[8.5px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1.5">
             {t('loot.runesToLevel')}
           </div>
           <div className="text-emerald-400 font-mono font-black text-[10.5px] bg-black/50 px-3 py-1 rounded-xl border border-emerald-500/30 shadow-inner whitespace-nowrap mt-1.5">
             {playerProfile.currentRunes.toLocaleString()} / {playerProfile.runesRequired.toLocaleString()}
           </div>
        </div>
      </div>

      {/* Lifetime Stats Mini Cards */}
      <div className="grid grid-cols-2 gap-2 shrink-0">
        {[
          { icon: <Sword size={11} className="text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.5)]" />, label: t('categories.mobs') || 'Mobs', value: totalMobs },
          { icon: <Pickaxe size={11} className="text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />, label: t('categories.ores') || 'Ores', value: totalOres },
          { icon: <Axe size={11} className="text-amber-500 drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]" />, label: t('categories.trees') || 'Trees', value: totalTrees },
          { icon: <Leaf size={11} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />, label: t('categories.plants') || 'Plants', value: totalPlants },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-2 flex items-center justify-between hover:bg-[var(--bg-hover)] hover:border-[var(--border-accent)] transition-all duration-200 shadow-sm">
            {stat.icon}
            <div className="flex flex-col items-end">
              <span className="text-[7px] text-[var(--text-muted)] uppercase font-bold tracking-wider">{stat.label}</span>
              <span className="text-[10.5px] font-black text-slate-100 font-mono">{(stat.value as number).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Card: Lifetime Stats Action */}
      <div className="flex flex-col items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 rounded-2xl relative overflow-hidden group shadow-2xl shrink-0">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="text-center mb-3 z-10">
          <div className="flex items-center justify-center gap-1.5 text-[12px] font-black text-white tracking-wider uppercase drop-shadow-md">
            <Award size={15} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            {t('loot.lifetimeStats')}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-0.5">{t('loot.viewHistory')}</div>
        </div>
        <motion.button
          onClick={() => setIsLifetimeStatsOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full py-2.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-400/30 hover:border-indigo-300 rounded-xl transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          <span className="text-[10px] font-bold text-indigo-200 group-hover:text-white tracking-wider uppercase flex items-center justify-center gap-1.5 relative z-10 font-mono">
            {t('stats.openStatsWindow')} <Sword size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
});
