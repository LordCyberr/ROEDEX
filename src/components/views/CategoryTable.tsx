import React, { memo, useState, useEffect } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, ChevronRight, Clock, Sword, Pickaxe, Leaf, Axe, Box, PawPrint } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export interface TableRowData {
  id: string;
  name: string;
  dist: number;
  nearestPos?: Vector2;
  counts?: { alive: number; dead: number };
  respawnTimesMs?: number[];
}

import { Vector2 } from '../../types/events';
import { getItemInfo } from '../../data/rarity';




// ── Rarity Colors ──────────────────────────────────────────────
export const getRarityColor = (name: string) => {
  const info = getItemInfo(name);
  if (!info) return 'text-[var(--text-primary)]'; // Common default

  switch (info.rarity) {
    case 'mythic': return 'text-[#e879f9]';     // Purple
    case 'rare': return 'text-[#4ade80]';       // Green
    case 'uncommon': return 'text-[#60a5fa]';   // Blue
    case 'common': return 'text-[var(--text-muted)]'; // Gray
    default: return 'text-[var(--text-primary)]';
  }
};

// ── Global Table Header (used by TrackingView) ─────────────────
export const GlobalTableHeader: React.FC = () => {
  const tableSettings = useTrackerStore((state) => state.tableSettings);
  const { t } = useTranslation();

  let gridCols = '1fr';
  if (tableSettings.showDistance) gridCols += ' 26px';
  if (tableSettings.showCount) gridCols += ' 32px';
  if (tableSettings.showTimer) gridCols += ' 28px';

  return (
    <div className={`grid gap-1 items-center px-1.5 py-0.5 text-[8.5px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)] uppercase tracking-wider bg-[var(--bg-panel)] font-[var(--font-heading)]`} style={{ gridTemplateColumns: gridCols }}>
      <div>{t('columns.name')}</div>
      {tableSettings.showDistance && <div className="text-right">{t('columns.dist')}</div>}
      {tableSettings.showCount && (
        <div className="text-right flex items-center justify-end gap-0.5 whitespace-nowrap">
          ❤️/💀
        </div>
      )}
      {tableSettings.showTimer && (
        <div className="text-right flex justify-end">
          <Clock size={9} className="text-gray-500" />
        </div>
      )}
    </div>
  );
};

// ── Timer Formatting ───────────────────────────────────────────
const formatCountdown = (targetMs: number, now: number, forceMMSS: boolean = false): string => {
  const diff = targetMs - now;
  if (diff <= 0) return '0:00';
  const totalSecs = Math.floor(diff / 1000);
  const totalM = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  
  if (!forceMMSS) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }
  
  return `${totalM}:${s.toString().padStart(2, '0')}`;
};

const getTimerColor = (targetMs: number, now: number): string => {
  const diff = targetMs - now;
  if (diff <= 0) return 'text-[#00ffff]'; // Ready Cyan
  const m = Math.floor((diff / 1000) / 60);
  if (m < 5) return 'text-[#00ff9d]'; // Green
  if (m < 15) return 'text-[#ffcc00]'; // Yellow
  return 'text-[#ff9900]'; // Orange
};

import { Tooltip } from '../ui/Tooltip';

const TimerDisplay = memo(({ targetMsArray, textSmall }: { targetMsArray: number[], textSmall: string }) => {
  const [now, setNow] = useState(Date.now());
  const maxTooltips = useTrackerStore(state => state.tableSettings.maxRespawnTooltips) || 5;
  const tutorialStep = useTrackerStore(state => state.notificationSettings.tutorialStep);

  useEffect(() => {
    // Only update if there's at least one active timer
    const hasActive = targetMsArray.some(t => t > Date.now());
    if (!hasActive) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetMsArray]);

  // Sort ascending and filter out past timers
  let validTimers = targetMsArray.filter(t => t > now).sort((a, b) => a - b);
  
  if (tutorialStep === 6) {
    // Inject fake timers for tutorial so the spotlight has a target and the tooltip looks populated
    validTimers = [now + 35000, now + 125000, now + 185000, now + 245000, now + 420000];
  }

  if (validTimers.length === 0) return <div id="tutorial-timer-row" className={`text-right ${textSmall} text-[var(--text-muted)]`}>--</div>;

  const targetMs = validTimers[0];
  const timerStr = formatCountdown(targetMs, now, true);
  const timerColor = getTimerColor(targetMs, now);
  
  const tooltipContent = (
    <div className="flex flex-col gap-0.5 w-fit min-w-[60px]">
      <div className="text-[9px] text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-0.5 mb-0.5 font-bold tracking-widest uppercase text-center leading-tight">
        Respawns
      </div>
      {validTimers.slice(0, maxTooltips).map((t, idx) => (
        <div key={idx} className="flex justify-between items-center text-[10px] font-mono gap-3">
          <span className="text-[var(--text-secondary)]">#{idx + 1}</span>
          <span className={getTimerColor(t, now)}>{formatCountdown(t, now)}</span>
        </div>
      ))}
      {validTimers.length > maxTooltips && (
        <div className="text-center text-[8px] text-[var(--text-muted)] italic mt-0.5">
          + {validTimers.length - maxTooltips} more
        </div>
      )}
    </div>
  );

  return (
    <Tooltip content={tooltipContent}>
      <div 
        id="tutorial-timer-row" 
        className={`text-right ${textSmall} ${timerColor} cursor-help`}
        onMouseEnter={() => useTrackerStore.getState().setHoveredTimerId('tutorial-timer-row')}
        onMouseLeave={() => useTrackerStore.getState().setHoveredTimerId(null)}
      >
        {timerStr}
      </div>
    </Tooltip>
  );
});


const getCategoryIcon = (categoryId: string | undefined, isCompact: boolean, isFav: boolean, toggleFav: () => void) => {
  if (!categoryId) return null;
  const sz = isCompact ? 10 : 12;
  const cls = `shrink-0 transition-all cursor-pointer ${isFav ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md' : 'text-[var(--text-muted)] opacity-70 hover:text-white hover:opacity-100'}`;
  const fill = isFav ? "currentColor" : "none";
  const id = categoryId.toLowerCase();

  const iconProps = { size: sz, className: cls, fill, onClick: (e: React.MouseEvent) => { e.stopPropagation(); toggleFav(); } };

  const parts = id.split('_');
  const cat = parts[parts.length - 1];

  if (cat.includes('mob') || cat.includes('hostile')) return <Sword {...iconProps} />;
  if (cat.includes('neutral')) return <PawPrint {...iconProps} />;
  if ((cat.includes('tree') || cat.includes('wood'))) return <Axe {...iconProps} />;
  if ((cat.includes('ore') || cat.includes('rock') || cat.includes('vein'))) return <Pickaxe {...iconProps} />;
  if ((cat.includes('plant') || cat.includes('herb'))) return <Leaf {...iconProps} />;
  return <Box {...iconProps} />;
};

// ── Single Data Row ────────────────────────────────────────────
const DataRow = memo(({ row, categoryId }: { row: TableRowData, categoryId?: string }) => {
  // Single useShallow call instead of 4 separate subscriptions — 4x fewer listeners
  const { toggleFavorite, isFav, density, tableSettings } = useTrackerStore(useShallow((state) => ({
    toggleFavorite: state.toggleFavorite,
    isFav: state.favorites.includes(row.name),
    density: state.displayDensity,
    tableSettings: state.tableSettings,
  })));

  const alive = row.counts?.alive ?? 0;
  const dead = row.counts?.dead ?? 0;

  const hasTimer = !!row.respawnTimesMs && row.respawnTimesMs.some(t => t > Date.now());

  const isCompact = density === 'compact';
  const textSmall = isCompact ? 'text-[8.5px]' : 'text-[10px]';

  let gridCols = '1fr';
  if (tableSettings.showDistance) gridCols += ' 26px';
  if (tableSettings.showCount) gridCols += ' 32px';
  if (tableSettings.showTimer) gridCols += ' 28px';

  let rowClasses = 'grid gap-1 items-center font-mono leading-[1.2] transition-all ';
  if (isCompact) {
    rowClasses += 'px-1.5 py-0 text-[9.5px] hover:bg-[var(--bg-hover)] border-b border-[var(--border-subtle)]';
  } else {
    rowClasses += 'px-1.5 py-1 mb-0.5 text-[10px] rounded-md bg-[var(--bg-panel)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] hover:shadow-sm hover:bg-[var(--bg-hover)]';
  }

  return (
    <div 
      id={`row-${row.name.replace(/\s+/g, '-')}`}
      data-category={categoryId} 
      className={rowClasses} 
      style={{ gridTemplateColumns: gridCols }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {getCategoryIcon(categoryId, isCompact, isFav, () => {
          if (!isFav) {
            import('../../core/companion/BobCompanion').then(({ BobCompanion }) => BobCompanion.onAddFavorite(row.name));
          }
          toggleFavorite(row.name);
        })}
        <span className={`truncate flex-1 min-w-0 ${getRarityColor(row.name)} ${isCompact ? '' : 'font-semibold drop-shadow-sm'}`} title={row.name}>
          {row.name}
        </span>
      </div>
      {tableSettings.showDistance && (
        <div className="text-right text-[var(--text-muted)]">
          {/* Use pre-calculated throttled distance — NO per-row playerPosition subscription */}
          {row.dist >= 0 ? `${row.dist}m` : '--'}
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
        hasTimer ? (
          <TimerDisplay targetMsArray={row.respawnTimesMs!} textSmall={textSmall} />
        ) : (
          <div className={`text-right ${textSmall} text-[var(--text-muted)]`}>--</div>
        )
      )}
    </div>
  );
});

// ── Shared Category List ─────────────────────────
const CategoryList: React.FC<{ data: TableRowData[]; collapsed: boolean; categoryId?: string }> = ({ data, collapsed, categoryId }) => {
  if (collapsed) return null;
  return (
    <>
      {data.map((row) => (
        <DataRow key={row.id} row={row} categoryId={categoryId} />
      ))}
    </>
  );
};

// ── Category Section (vertical flat mode) ──────────────────────
export const CategorySection: React.FC<{ categoryId: string; title: string; data: TableRowData[]; align?: 'left' | 'center' }> = ({ categoryId, title, data, align = 'center' }) => {
  const { toggleCategory, collapsed, density } = useTrackerStore(useShallow((state) => ({
    toggleCategory: state.toggleCategory,
    collapsed: state.collapsedCategories[categoryId],
    density: state.displayDensity,
  })));

  if (data.length === 0) return null;

  const py = density === 'compact' ? 'py-0.5' : 'py-1';
  const textSz = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  return (
    <div className="flex flex-col">
      {/* Category title — centered, collapsible */}
      <button
        onClick={() => toggleCategory(categoryId)}
        title={`Toggle ${title}`}
        className={`flex items-center ${align === 'left' ? 'justify-start pl-4 pr-4 mx-4' : 'justify-center mx-6'} gap-1 my-0.5 ${py} ${textSz} font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] select-none hover:text-white hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] rounded-full bg-black/30 shadow-none font-[var(--font-heading)] min-w-0 overflow-hidden`}
      >
        <div className="shrink-0">{collapsed ? <ChevronRight size={10} strokeWidth={3} /> : <ChevronDown size={10} strokeWidth={3} />}</div>
        <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">{title}</span>
      </button>

      {!collapsed && <CategoryList data={data} collapsed={collapsed} categoryId={categoryId} />}
    </div>
  );
};

// ── Category Card (horizontal card mode) ───────────────────────
export const CategoryCard: React.FC<{ categoryId: string; title: string; data: TableRowData[]; showHeader?: boolean }> = ({ categoryId, title, data, showHeader = false }) => {
  const { toggleCategory, collapsed, density } = useTrackerStore(useShallow((state) => ({
    toggleCategory: state.toggleCategory,
    collapsed: state.collapsedCategories[categoryId],
    density: state.displayDensity,
  })));

  if (data.length === 0) return null;

  const py = density === 'compact' ? 'py-0.5' : 'py-1';
  const textSz = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  return (
    <div className={`flex flex-col bg-[var(--bg-card)] rounded-lg overflow-hidden shrink-0 shadow-md border border-[var(--border-subtle)] w-fit min-w-fit h-fit max-h-full`}>
      <button
        onClick={() => toggleCategory(categoryId)}
        title={`Toggle ${title}`}
        className={`flex items-center justify-between px-2 ${py} bg-[var(--bg-base)] hover:bg-[var(--bg-panel)] transition-colors ${textSz} font-bold text-[var(--text-primary)] uppercase tracking-wider shrink-0 select-none border-b border-[var(--border-subtle)] font-[var(--font-heading)]`}
      >
        <div className="flex items-center gap-1">
          {collapsed ? <ChevronRight size={12} strokeWidth={2.5} /> : <ChevronDown size={12} strokeWidth={2.5} />}
          {title}
        </div>
      </button>

      {!collapsed && (
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {showHeader && <GlobalTableHeader />}
          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            <CategoryList data={data} collapsed={collapsed} categoryId={categoryId} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Legacy default export (keep backwards compat) ──────────────
export const CategoryTable = CategoryCard;
