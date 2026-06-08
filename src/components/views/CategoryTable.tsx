import React, { memo, useState, useEffect } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { Star, ChevronDown, ChevronRight, Clock } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export interface TableRowData {
  id: string;
  name: string;
  dist: number;
  nearestPos?: Vector2;
  counts?: { alive: number; dead: number };
  respawnTimeMs?: number;
}

import { Vector2 } from '../../types/events';
import { getItemInfo } from '../../data/rarity';

const calculateDistance = (p1: Vector2 | null, p2: Vector2 | undefined) => {
  if (!p1 || !p2) return -1;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

const RealtimeDistance: React.FC<{ targetPos?: Vector2, fallbackDist: number }> = ({ targetPos, fallbackDist }) => {
  const playerPosition = useTrackerStore(state => state.playerPosition);
  
  if (!targetPos) {
    return <>{fallbackDist >= 0 ? `${fallbackDist}m` : '--'}</>;
  }

  const dist = calculateDistance(playerPosition, targetPos);
  return <>{dist >= 0 ? `${dist}m` : '--'}</>;
};

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
  if (tableSettings.showDistance) gridCols += ' 24px';
  if (tableSettings.showCount) gridCols += ' 38px';
  if (tableSettings.showTimer) gridCols += ' 24px';

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
const formatCountdown = (targetMs: number, now: number): string => {
  const diff = targetMs - now;
  if (diff <= 0) return '0:00';
  const totalSecs = Math.floor(diff / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const getTimerColor = (targetMs: number, now: number): string => {
  const diff = targetMs - now;
  if (diff <= 0) return 'text-[#00ffff]'; // Ready Cyan
  const m = Math.floor((diff / 1000) / 60);
  if (m < 5) return 'text-[#00ff9d]'; // Green
  if (m < 15) return 'text-[#ffcc00]'; // Yellow
  return 'text-[#ff9900]'; // Orange
};

const TimerDisplay = memo(({ targetMs, textSmall }: { targetMs: number, textSmall: string }) => {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    if (targetMs <= now) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [targetMs, now]);

  const timerStr = formatCountdown(targetMs, now);
  const timerColor = getTimerColor(targetMs, now);

  return (
    <div className={`text-right ${textSmall} ${timerColor}`}>
      {timerStr}
    </div>
  );
});

// ── Single Data Row ────────────────────────────────────────────
const DataRow = memo(({ row }: { row: TableRowData }) => {
  const toggleFavorite = useTrackerStore((state) => state.toggleFavorite);
  const isFav = useTrackerStore((state) => state.favorites.includes(row.name));
  const density = useTrackerStore((state) => state.displayDensity);
  const tableSettings = useTrackerStore((state) => state.tableSettings);

  const alive = row.counts?.alive ?? 0;
  const dead = row.counts?.dead ?? 0;

  const hasTimer = !!row.respawnTimeMs && row.respawnTimeMs > Date.now();

  const py = density === 'compact' ? 'py-0' : 'py-1';
  const textBase = density === 'compact' ? 'text-[9.5px]' : 'text-[11px]';
  const textSmall = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  let gridCols = '1fr';
  if (tableSettings.showDistance) gridCols += ' 24px';
  if (tableSettings.showCount) gridCols += ' 38px';
  if (tableSettings.showTimer) gridCols += ' 24px';

  return (
    <div className={`grid gap-1 items-center px-1.5 ${py} hover:bg-[var(--bg-hover)] ${textBase} font-mono leading-[1.2]`} style={{ gridTemplateColumns: gridCols }}>
      <div className="flex items-center gap-1 min-w-0">
        <Star
          size={10}
          strokeWidth={isFav ? 0 : 2}
          className={`cursor-pointer shrink-0 transition-colors ${isFav ? 'text-yellow-400 fill-yellow-400' : 'text-[var(--text-muted)] hover:text-[var(--text-muted)]'}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(row.name); }}
        />
        <span className={`truncate ${getRarityColor(row.name)}`} title={row.name}>
          {row.name}
        </span>
      </div>
      {tableSettings.showDistance && <div className="text-right text-[var(--text-muted)]"><RealtimeDistance targetPos={row.nearestPos} fallbackDist={row.dist} /></div>}
      {tableSettings.showCount && (
        <div className="text-right">
          <span className={alive > 0 ? 'text-[#00ff55]' : 'text-[var(--text-muted)]'}>{alive}</span>
          <span className="text-[var(--text-muted)] mx-px">/</span>
          <span className={dead > 0 ? 'text-red-500' : 'text-[var(--text-muted)]'}>{dead}</span>
        </div>
      )}
      {tableSettings.showTimer && (
        hasTimer ? (
          <TimerDisplay targetMs={row.respawnTimeMs!} textSmall={textSmall} />
        ) : (
          <div className={`text-right ${textSmall} text-[var(--text-muted)]`}>--</div>
        )
      )}
    </div>
  );
});

// ── Shared Category List ─────────────────────────
const CategoryList: React.FC<{ data: TableRowData[]; collapsed: boolean }> = ({ data, collapsed }) => {
  if (collapsed) return null;
  return (
    <>
      {data.map((row) => (
        <DataRow key={row.id} row={row} />
      ))}
    </>
  );
};

// ── Category Section (vertical flat mode) ──────────────────────
export const CategorySection: React.FC<{ categoryId: string; title: string; data: TableRowData[]; align?: 'left' | 'center' }> = ({ categoryId, title, data, align = 'center' }) => {
  const toggleCategory = useTrackerStore((state) => state.toggleCategory);
  const collapsed = useTrackerStore((state) => state.collapsedCategories[categoryId]);
  const density = useTrackerStore((state) => state.displayDensity);

  if (data.length === 0) return null;

  const py = density === 'compact' ? 'py-0.5' : 'py-1';
  const textSz = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  return (
    <div className="flex flex-col">
      {/* Category title — centered, collapsible */}
      <button
        onClick={() => toggleCategory(categoryId)}
        title={`Toggle ${title}`}
        className={`flex items-center ${align === 'left' ? 'justify-start pl-4 pr-4 mx-4' : 'justify-center mx-6'} gap-1 my-0.5 ${py} ${textSz} font-bold text-[var(--text-secondary)] uppercase tracking-[0.15em] select-none hover:text-white hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] rounded-full bg-black/30 shadow-none font-[var(--font-heading)]`}
      >
        {collapsed ? <ChevronRight size={10} strokeWidth={3} /> : <ChevronDown size={10} strokeWidth={3} />}
        {title}
      </button>

      {!collapsed && <CategoryList data={data} collapsed={collapsed} />}
    </div>
  );
};

// ── Category Card (horizontal card mode) ───────────────────────
export const CategoryCard: React.FC<{ categoryId: string; title: string; data: TableRowData[]; showHeader?: boolean }> = ({ categoryId, title, data, showHeader = false }) => {
  const toggleCategory = useTrackerStore((state) => state.toggleCategory);
  const collapsed = useTrackerStore((state) => state.collapsedCategories[categoryId]);
  const density = useTrackerStore((state) => state.displayDensity);

  if (data.length === 0) return null;

  const py = density === 'compact' ? 'py-0.5' : 'py-1';
  const textSz = density === 'compact' ? 'text-[8.5px]' : 'text-[10px]';

  return (
    <div className={`flex flex-col bg-[var(--bg-card)] rounded-2xl overflow-hidden shrink-0 shadow-md border border-[var(--border-subtle)] w-fit min-w-fit h-fit max-h-full`}>
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
            <CategoryList data={data} collapsed={collapsed} />
          </div>
        </div>
      )}
    </div>
  );
};

// ── Legacy default export (keep backwards compat) ──────────────
export const CategoryTable = CategoryCard;
