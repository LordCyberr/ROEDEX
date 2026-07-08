import React, { memo } from 'react';
import { motion } from 'motion/react';
import { Target, Sword, PawPrint, Axe, Pickaxe, Leaf, Box } from 'lucide-react';
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

// ── Rarity Colors ──────────────────────────────────────────────
export const getRarityColor = (name: string) => {
  const info = getItemInfo(name);
  if (!info) return 'text-[var(--text-primary)]'; // Common default

  switch (info.rarity) {
    case 'mythic': return ThemeColors.rarity.mythic.text;
    case 'rare': return ThemeColors.rarity.rare.text;
    case 'uncommon': return ThemeColors.rarity.uncommon.text;
    case 'common': return ThemeColors.rarity.common.text;
    default: return 'text-[var(--text-primary)]';
  }
};

const getCategoryIcon = (categoryId: string | undefined, isCompact: boolean, isFav: boolean, toggleFav: () => void) => {
  if (!categoryId) return null;
  const sz = isCompact ? 10 : 12;
  const cls = `shrink-0 transition-all cursor-pointer ${isFav ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md' : 'text-[var(--text-muted)] opacity-70 hover:text-white hover:opacity-100'}`;
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
  
  let rowClasses = 'group grid gap-1 items-center font-mono leading-[1.2] transition-all relative ';
  
  if (flashType === 'alive') {
    rowClasses += 'px-1.5 text-[9.5px] py-1 bg-emerald-500/20 shadow-[0_0_12px_rgba(74,222,128,0.3)] border-emerald-400/60 rounded-md z-10';
  } else if (flashType === 'dead') {
    rowClasses += 'px-1.5 text-[9.5px] py-1 bg-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.3)] border-rose-400/60 rounded-md z-10';
  } else if (isCompact) {
    rowClasses += 'px-1.5 py-0 text-[9.5px] hover:bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]';
    if (rarity === 'mythic') rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-mythic' : ''} ${ThemeColors.rarity.mythic.bg} ${ThemeColors.rarity.mythic.border}`;
    else if (rarity === 'rare') rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-rare' : ''} ${ThemeColors.rarity.rare.bg} ${ThemeColors.rarity.rare.border}`;
  } else {
    rowClasses += 'px-1.5 py-1 mb-0.5 text-[10px] rounded-md bg-[var(--bg-panel)] border hover:shadow-sm hover:bg-[var(--bg-hover)]';
    if (rarity === 'mythic') {
      rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-mythic' : ''} ${ThemeColors.rarity.mythic.bg}`;
    } else if (rarity === 'rare') {
      rowClasses += ` ${tableSettings.itemGlow ? 'animate-rarity-rare' : ''} ${ThemeColors.rarity.rare.bg}`;
    } else {
      rowClasses += ' border-[var(--border-subtle)] hover:border-[var(--text-muted)]';
    }
  }

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
      <div className="flex items-center gap-1.5 min-w-0">
        {getCategoryIcon(categoryId, isCompact, isFav, () => {
          if (!isFav) {
            AICompanion.onAddFavorite(row.name);
          }
          toggleFavorite(row.name);
        })}
        
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
        
        <Tooltip content={ResourceTracker.sanitizeResourceName(row.name)}>
          <span className={`truncate flex-1 min-w-0 ${getRarityColor(row.name)} ${isCompact ? '' : 'font-semibold drop-shadow-sm'}`}>
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
        <div className="text-right">
          <span className={alive > 0 ? 'text-[#00ff55]' : 'text-[var(--text-muted)]'}>{alive}</span>
          <span className="text-[var(--text-muted)] mx-px">/</span>
          <span className={dead > 0 ? 'text-red-500' : 'text-[var(--text-muted)]'}>{dead}</span>
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
});
