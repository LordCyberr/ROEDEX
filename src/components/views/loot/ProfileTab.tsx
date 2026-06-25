import React from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { Sword } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export const ProfileTab: React.FC<{ isHorizontal: boolean }> = ({ isHorizontal }) => {
  const { t } = useTranslation();
  const { playerProfile } = useTrackerStore(useShallow((state: any) => ({
    playerProfile: state.playerProfile,
  })));
  
  const setIsLifetimeStatsOpen = useSettingsStore(state => state.setIsLifetimeStatsOpen);

  const pct = playerProfile.runesRequired > 0 
    ? Math.min(100, Math.floor((playerProfile.currentRunes / playerProfile.runesRequired) * 100)) 
    : 0;

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-2 h-full w-full`}>
      {/* Left Side: Profile Card */}
      <div className={`flex flex-col gap-2 ${isHorizontal ? 'w-[140px]' : 'w-full'} shrink-0 h-full`}>
        <div className="flex flex-col items-center justify-start gap-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-3 rounded-lg relative overflow-hidden group shadow-inner h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0 drop-shadow-md mt-2">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="3" strokeDasharray={`${pct}, 100`} />
             </svg>
             <div className="absolute flex flex-col items-center justify-center mt-1">
                <span className="text-[7px] text-emerald-400/80 uppercase font-bold tracking-widest mb-0.5">{t('loot.lvl')}</span>
                <span className="text-[18px] font-black text-white leading-none">{playerProfile.level}</span>
             </div>
          </div>
          
          <div className="flex flex-col items-center w-full z-10 mt-2">
             <div className="text-[12px] font-bold text-slate-200 uppercase tracking-widest mb-3 truncate text-center w-full">{playerProfile.name ? playerProfile.name.toUpperCase() : 'PLAYER PROFILE'}</div>
             <div className="flex flex-col items-center text-[9px] mt-1 w-full px-1">
                <span className="text-slate-400 mb-1 tracking-wider uppercase font-bold text-center">{t('loot.runesToLevel')}</span>
                <span className="text-emerald-400 font-mono font-black text-[10px] bg-[var(--bg-card)] px-2 py-1 rounded border border-emerald-500/20 whitespace-nowrap">{playerProfile.currentRunes.toLocaleString()} / {playerProfile.runesRequired.toLocaleString()}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Lifetime Stats Button */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-4 rounded-lg relative overflow-hidden">
        <div className="text-center mb-4">
          <div className="text-[14px] font-black text-white tracking-widest uppercase mb-1">{t('loot.lifetimeStats')}</div>
          <div className="text-[9px] text-slate-400">{t('loot.viewHistory')}</div>
        </div>
        <button
          onClick={() => setIsLifetimeStatsOpen(true)}
          className="group relative px-6 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 hover:border-indigo-400 rounded-lg transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
          <span className="text-[10px] font-bold text-indigo-300 group-hover:text-white tracking-wider uppercase flex items-center gap-2 relative z-10">
            {t('stats.openStatsWindow')} <Sword size={12} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      </div>
    </div>
  );
};
