import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Target, Sword, PawPrint, Axe, Pickaxe, Leaf, Box, Heart, Skull, Timer } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { AICompanion } from '../../../core/companion/AICompanion';
import { ResourceTracker } from '../../../core/trackers/ResourceTracker';
import { getItemInfo } from '../../../data/rarity';
import { ThemeColors } from '../../../utils/theme';
import { Tooltip } from '../Tooltip';
import { DistanceDisplay } from './DistanceDisplay';
import { TimerDisplay } from './TimerDisplay';
import { TableRowData } from './types';
import { getRarityColor } from '../../../utils/rarity';

const getEntityDetails = (rowName: string) => {
  const info = getItemInfo(rowName);
  if (!info) return null;

  return {
    type: info.category.toUpperCase(),
    name: info.sanitizedName,
    hp: info.hp,
    maxHp: info.maxHp,
    respawnTime: `${Math.round(info.cooldown / 60)}m`,
    drops: info.drops.map(d => ({
      item: d.sanitizedName,
      rarity: d.rarity
    }))
  };
};

const getCategoryIcon = (categoryId: string | undefined, isCompact: boolean, isFav: boolean, toggleFav: () => void, rarityColorClass: string) => {
  if (!categoryId) return null;
  const sz = isCompact ? 10 : 12;
  const defaultCls = `opacity-70 hover:text-white hover:opacity-100 ${rarityColorClass}`;
  const cls = `shrink-0 transition-all cursor-pointer ${isFav ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md' : defaultCls}`;
  const fill = isFav ? "currentColor" : "none";
  const id = categoryId.toLowerCase();

  const iconProps = { id: 'tutorial-bookmark', size: sz, className: cls, fill, onClick: (e: React.MouseEvent) => { e.stopPropagation(); toggleFav(); } };

  const parts = id.split('_');
  const cat = parts[parts.length - 1];

  if (cat.includes('mob') || cat.includes('hostile')) return <Sword {...iconProps} />;
  if (cat.includes('neutral')) return <PawPrint {...iconProps} />;
  if ((cat.includes('tree') || cat.includes('wood'))) return <Axe {...iconProps} />;
  if ((cat.includes('ore') || cat.includes('rock') || cat.includes('vein'))) return <Pickaxe {...iconProps} />;
  if ((cat.includes('plant') || cat.includes('herb'))) return <Leaf {...iconProps} />;
  return <Box {...iconProps} />;
};

export const DataRow = memo(({ row, categoryId }: { row: TableRowData, categoryId?: string }) => {
  const { toggleFavorite, isFav, density, tableSettings, tutorialStep } = useSettingsStore(useShallow((state: any) => ({
    toggleFavorite: state.toggleFavorite,
    isFav: state.favorites.includes(row.name),
    density: state.displayDensity,
    tableSettings: state.tableSettings,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
  })));
  
  const activeName = useTrackerStore((state) => state.activeWaypointName);
  const isTracking = activeName === row.name;

  const alive = row.counts?.alive ?? 0;
  const dead = row.counts?.dead ?? 0;

  const hasTimer = !!row.respawnTimesMs && row.respawnTimesMs.some(t => t > Date.now());

  const isCompact = density === 'compact';
  const textSmall = isCompact ? 'text-[8.5px]' : 'text-[10px]';

  // Count update flash highlighting
  const [flashType, setFlashType] = React.useState<'alive' | 'dead' | null>(null);
  const prevCounts = React.useRef({ alive, dead });

  React.useEffect(() => {
    if (prevCounts.current.alive !== alive) {
      setFlashType('alive');
      prevCounts.current.alive = alive;
      const t = setTimeout(() => setFlashType(null), 1000);
      return () => clearTimeout(t);
    }
  }, [alive]);

  React.useEffect(() => {
    if (prevCounts.current.dead !== dead) {
      setFlashType('dead');
      prevCounts.current.dead = dead;
      const t = setTimeout(() => setFlashType(null), 1000);
      return () => clearTimeout(t);
    }
  }, [dead]);

  const info = getItemInfo(row.name);
  const rarity = info?.rarity;

  let gridCols = '1fr';
  if (tableSettings.showDistance) gridCols += ' 26px';
  if (tableSettings.showCount) gridCols += ' 32px';
  if (tableSettings.showTimer) gridCols += ' 28px';
  
  let rowClasses = 'group grid gap-1 items-center font-mono leading-[1.2] transition-all relative overflow-hidden ';
  
  if (isCompact) {
    rowClasses += 'px-1.5 py-0 text-[9.5px] border-b border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] ';
  } else {
    rowClasses += 'px-1.5 py-1 mb-0.5 text-[10px] rounded-lg bg-[var(--bg-panel)] border hover:shadow-sm hover:bg-[var(--bg-hover)] ';
  }

  if (flashType === 'alive') {
    rowClasses += 'shadow-[inset_0_0_20px_rgba(16,185,129,0.25)] border-emerald-400/60 z-10 ';
  } else if (flashType === 'dead') {
    rowClasses += 'shadow-[inset_0_0_20px_rgba(244,63,94,0.25)] border-rose-400/60 z-10 ';
  } else if (isTracking) {
    rowClasses += ' border-cyan-400/80 border-l-[3px] border-l-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.25)] bg-cyan-950/20 ';
  } else if (rarity === 'mythic' || rarity === 'mystical') {
    rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-mythic' : ''} ${ThemeColors.rarity.mythic.bg} border-purple-500/20 border-l-[3px] border-l-purple-500 `;
  } else if (rarity === 'rare') {
    rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-rare' : ''} ${ThemeColors.rarity.rare.bg} border-blue-500/20 border-l-[3px] border-l-blue-500 `;
  } else if (rarity === 'uncommon') {
    rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-uncommon' : ''} ${ThemeColors.rarity.uncommon.bg} border-emerald-500/20 border-l-[3px] border-l-emerald-500 `;
  } else {
    rowClasses += ' border-[var(--border-subtle)] hover:border-[var(--text-muted)] border-l-[3px] border-l-transparent ';
  }

  const entityDetails = getEntityDetails(row.name);
  
  const richTooltipContent = (
    <div className="flex flex-col gap-1.5 min-w-[160px] select-none text-left font-sans">
      <div className="flex justify-between items-center border-b border-white/15 pb-1">
        <span className="font-black text-[11px] uppercase tracking-widest text-white">{ResourceTracker.sanitizeResourceName(row.name)}</span>
        {entityDetails && (
          <span className="text-[7.5px] px-1.5 py-0.5 bg-white/10 rounded font-black text-slate-300 tracking-wider">{entityDetails.type}</span>
        )}
      </div>
      {entityDetails ? (
        <>
          <div className="flex gap-2.5 text-[8.5px] font-mono leading-none">
            <span className="text-red-400 font-bold flex items-center gap-1"><Heart size={9} className="fill-current" /> {entityDetails.hp} HP</span>
            <span className="text-blue-400 font-bold flex items-center gap-1"><Timer size={9} className="text-blue-400" /> {entityDetails.respawnTime || '30m'}</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-white/5 pt-1.5">
            <span className="text-[7.5px] text-slate-500 uppercase tracking-widest font-black leading-none mb-0.5">Known Drops:</span>
            <div className="flex flex-wrap gap-1">
              {entityDetails.drops.map((d: any) => (
                <span 
                  key={d.item}
                  className={`text-[7.5px] px-1.5 py-0.5 rounded-full border font-black capitalize tracking-wide whitespace-nowrap ${
                    (d.rarity === 'mythic' || d.rarity === 'mystical') ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' :
                    d.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    d.rarity === 'uncommon' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    'bg-slate-500/10 text-slate-400 border-slate-500/20'
                  }`}
                >
                  {d.item}
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        <span className="text-[8px] text-slate-400 italic">No additional entity details available.</span>
      )}
    </div>
  );

  return (
    <motion.div 
      layout
      whileHover={{ x: 2, scale: 1.002 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      id={`row-${row.name.replace(/\s+/g, '-')}`}
      data-category={categoryId} 
      className={rowClasses} 
      style={{ gridTemplateColumns: gridCols }}
    >
      <div className="flex items-center gap-1.5 min-w-0 relative">
        {isTracking && (
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute -left-1 shrink-0"></span>
        )}
        {getCategoryIcon(categoryId, isCompact, isFav, () => {
          if (!isFav) {
            AICompanion.onAddFavorite(row.name);
          }
          toggleFavorite(row.name);
        }, getRarityColor(row.name))}
        
        {row.nearestPos && (
          <button 
            onClick={(e) => {
               e.stopPropagation();
               if (isTracking) {
                 useTrackerStore.getState().setActiveWaypoint(null, null);
               } else {
                 useTrackerStore.getState().setActiveWaypoint({ x: row.nearestPos!.x, y: row.nearestPos!.y }, row.name, row.zone);
               }
            }}
            className={`p-0.5 rounded transition-all shrink-0 ${isTracking ? 'text-[#22d3ee] bg-[#22d3ee]/20 opacity-100' : 'opacity-0 group-hover:opacity-100 text-[#22d3ee] hover:bg-[#22d3ee]/20'}`}
            title={isTracking ? `Stop tracking ${row.name}` : `Track nearest ${row.name}`}
          >
            <Target size={isCompact ? 10 : 12} />
          </button>
        )}
        
        <Tooltip content={richTooltipContent}>
          <span className={`truncate flex-1 min-w-0 ${getRarityColor(row.name)} ${isCompact ? '' : 'font-bold [text-shadow:0_1px_1px_rgba(0,0,0,0.8)]'}`}>
            {ResourceTracker.sanitizeResourceName(row.name)}
          </span>
        </Tooltip>
      </div>
      {tableSettings.showDistance && (
        <div className="text-right text-[var(--text-muted)]">
          <DistanceDisplay targetPos={row.nearestPos} />
        </div>
      )}
      {tableSettings.showCount && (
        <div className="text-right flex items-center justify-end select-none">
          {alive > 0 ? (
            <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-black">
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></span>
              {alive}
            </span>
          ) : dead > 0 ? (
            <span className="inline-flex items-center gap-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded text-[8px] font-black">
              <span className="opacity-75"><Skull size={8} /></span>
              {dead}
            </span>
          ) : (
            <span className="text-[var(--text-muted)] font-mono text-[9px] opacity-50">--</span>
          )}
        </div>
      )}
      {tableSettings.showTimer && (
        (hasTimer || tutorialStep === 3) ? (
          <TimerDisplay targetMsArray={row.respawnTimesMs || []} textSmall={textSmall} />
        ) : (
          <div className={`text-right ${textSmall} text-[var(--text-muted)]`}>--</div>
        )
      )}
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom equality check since 'row' is recreated by TrackingView useMemo often
  if (prevProps.categoryId !== nextProps.categoryId) return false;
  
  const pRow = prevProps.row;
  const nRow = nextProps.row;
  
  if (pRow.id !== nRow.id) return false;
  if (pRow.dist !== nRow.dist) return false;
  if (pRow.counts?.alive !== nRow.counts?.alive) return false;
  if (pRow.counts?.dead !== nRow.counts?.dead) return false;
  
  // Timer array length check (shallow is usually fine since we push/clear timers)
  const pTimers = pRow.respawnTimesMs?.length || 0;
  const nTimers = nRow.respawnTimesMs?.length || 0;
  if (pTimers !== nTimers) return false;

  return true;
});
