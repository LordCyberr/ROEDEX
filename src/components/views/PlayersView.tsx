import React, { useMemo } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import { User } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

export const PlayersView: React.FC = () => {
  const { t } = useTranslation();
  
  const onlinePlayers = useTrackerStore(state => state.onlinePlayers);

  const { layoutMode, tabDimensions } = useSettingsStore(useShallow((state: any) => ({
    layoutMode: state.layoutMode,
    tabDimensions: state.tabDimensions
  })));

  const isHorizontal = layoutMode === 'horizontal';
  const activeDimKey = isHorizontal ? `players_horizontal` : `players_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const hasCustomHeight = activeDim.height !== undefined;
  const compactHeightClass = !hasCustomHeight ? 'max-h-[300px]' : '';

  const sortedPlayers = useMemo(() => {
    return Object.values(onlinePlayers).sort((a, b) => a.username.localeCompare(b.username));
  }, [onlinePlayers]);

  return (
    <div className={`flex flex-col flex-1 p-2 bg-[var(--bg-base)] h-full overflow-hidden ${!isHorizontal ? 'min-w-[150px]' : 'min-w-[250px]'}`}>
      <div className="px-1 mb-2 shrink-0 flex items-center justify-between">
         <h3 className="text-[11px] font-black text-[var(--accent-primary)] uppercase tracking-widest whitespace-nowrap">
           {t('tabs.players' as any) || 'Online Players'}
         </h3>
         <span className="text-[10px] text-zinc-400 font-bold bg-white/5 px-2 py-0.5 rounded-full whitespace-nowrap ml-2">
           {sortedPlayers.length} in Zone
         </span>
      </div>

      <div className={`flex flex-col gap-1.5 overflow-y-auto custom-scrollbar pr-1 flex-1 ${compactHeightClass}`}>
        {sortedPlayers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-zinc-500 opacity-70">
             <User size={24} className="mb-2 opacity-50" />
             <div className="text-[10px] uppercase tracking-wider font-bold">{t('ui.noPlayersNearby')}</div>
          </div>
        ) : (
          sortedPlayers.map(player => (
            <div 
              key={player.id}
              className="flex items-center justify-between p-3 rounded border bg-gradient-to-r from-[var(--bg-panel)] to-[var(--bg-base)] border-white/5 shadow-sm"
            >
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                 <div className="text-[11px] font-bold text-white tracking-wide">
                   {player.username}
                 </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
