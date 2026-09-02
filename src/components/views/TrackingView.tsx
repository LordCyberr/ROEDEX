import React, { useMemo, useState } from 'react';
import { ChevronRight, ChevronDown, Star, Search, Database, Zap } from 'lucide-react';
import { useThrottledEntities } from '../../hooks/useThrottledEntities';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import { GlobalTableHeader, CategorySection, CategoryCard, TableRowData } from '../ui/table';
import { Tooltip } from '../ui/Tooltip';
import { IsolatedInput } from '../ui/IsolatedInput';
import { Vector2 } from '../../types/events';

import { useShallow } from 'zustand/react/shallow';

const calculateDistance = (p1: Vector2 | null, p2: Vector2, id: string, cache: Map<string, { dist: number, px: number, py: number, lastSeen: number }>) => {
  if (!p1) return -1;
  const px = p1.x;
  const py = p1.y;
  const cached = cache.get(id);
  if (cached && cached.px === px && cached.py === py) {
    return cached.dist;
  }
  const dx = px - p2.x;
  const dy = py - p2.y;
  const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
  cache.set(id, { dist, px, py, lastSeen: Date.now() });
  return dist;
};

import { ResourceTracker } from '../../core/trackers/ResourceTracker';
import { getItemInfo } from '../../data/rarity';

const rarityWeights: Record<string, number> = {
  'common': 1,
  'uncommon': 2,
  'rare': 3,
  'mythic': 4
};

const getCategoryName = (type: string, isResource: boolean): string => {
  const t = type.toLowerCase();
  if (isResource) {
    if (t.includes('tree') || t.includes('wood')) return 'Trees';
    if (t.includes('ore') || t.includes('vein') || t.includes('stone') || t.includes('bone') || t.includes('rock')) return 'Ores';
    return 'Plants';
  }
  return 'Mobs';
};

interface DynamicGroup {
  id: string;
  title: string;
  zone: string;
  category: string;
  items: Record<string, TableRowData>;
}

interface TrackingViewProps {
  forcedTab?: string;
}

const sortByDist = (a: TableRowData, b: TableRowData, tableSettings: any) => {
  if (a.dist === -1 && b.dist === -1) {
    if (tableSettings.raritySortOrder && tableSettings.raritySortOrder !== 'none') {
      const infoA = getItemInfo(a.name);
      const infoB = getItemInfo(b.name);
      const wA = infoA ? rarityWeights[infoA.rarity] || 0 : 0;
      const wB = infoB ? rarityWeights[infoB.rarity] || 0 : 0;
      
      if (wA !== wB) {
        return tableSettings.raritySortOrder === 'desc' ? wB - wA : wA - wB;
      }
    }
    return a.name.localeCompare(b.name);
  }
  if (a.dist === -1) return 1;
  if (b.dist === -1) return -1;
  return a.dist - b.dist;
};

const TrackingViewComponent: React.FC<TrackingViewProps> = ({ forcedTab }) => {
  const { t } = useTranslation();
  const { currentZone } = useTrackerStore(useShallow((state) => ({
    currentZone: state.currentZone
  })));

  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<'all' | 'rare' | 'nearby'>('all');
  const [subTab, setSubTab] = useState<'global' | 'favorites'>('global');
  
  const {
    activeTab, 
    favorites,
    layoutMode, displayMode,
    collapsedCategories, toggleCategory,
    collapsedSidebarZones, toggleSidebarZone,
    verticalGroupingMode, tableSettings,
    tutorialStep, tutorialCompleted
  } = useSettingsStore(useShallow((state: any) => ({
    activeTab: state.activeTab,
    favorites: state.favorites,
    layoutMode: state.layoutMode,
    verticalGroupingMode: state.verticalGroupingMode,
    displayMode: state.displayMode,
    collapsedCategories: state.collapsedCategories,
    toggleCategory: state.toggleCategory,
    collapsedSidebarZones: state.collapsedSidebarZones,
    toggleSidebarZone: state.toggleSidebarZone,
    tableSettings: state.tableSettings,
    tutorialStep: state.notificationSettings?.tutorialStep || 0,
    tutorialCompleted: state.notificationSettings?.tutorialCompleted || false
  })));
  
  const { enemies, resources, timers, throttledPlayerPosition, loot } = useThrottledEntities(100);

  const effectiveTab = forcedTab || activeTab;
  const isHorizontal = layoutMode === 'horizontal';
  const distanceCache = React.useRef(new Map<string, { dist: number; px: number; py: number; lastSeen: number }>());

  // Distance Hysteresis - Only re-render when player has moved a significant distance (e.g. 5 units)
  const [anchorPlayerPosition, setAnchorPlayerPosition] = useState<Vector2 | null>(null);

  React.useEffect(() => {
    if (!throttledPlayerPosition) return;
    if (!anchorPlayerPosition) {
      setAnchorPlayerPosition(throttledPlayerPosition);
      return;
    }
    
    const dx = throttledPlayerPosition.x - anchorPlayerPosition.x;
    const dy = throttledPlayerPosition.y - anchorPlayerPosition.y;
    const distSq = dx * dx + dy * dy;
    
    // 5 units squared = 25
    if (distSq > 25) {
      setAnchorPlayerPosition(throttledPlayerPosition);
    }
  }, [throttledPlayerPosition, anchorPlayerPosition]);

  // Garbage Collection for Distance Cache
  React.useEffect(() => {
    const gcInterval = setInterval(() => {
      const now = Date.now();
      const fiveMins = 5 * 60 * 1000;
      for (const [id, data] of distanceCache.current.entries()) {
        if (now - data.lastSeen > fiveMins) {
          distanceCache.current.delete(id);
        }
      }
    }, 60000); // Check every minute
    return () => clearInterval(gcInterval);
  }, []);

  const visibleCategories = useMemo(() => {
    const now = Date.now();
    const groups: Record<string, DynamicGroup> = {};

    const addOrUpdate = (
      zone: string,
      categoryKey: string,
      categoryDisplayName: string,
      name: string,
      dist: number,
      pos: Vector2,
      isAlive: boolean,
      isTimerInjection: boolean,
      respawnTimeMs?: number,
      quantityAmount?: number
    ) => {
      // Normalize zone name
      const zoneDisplay = zone.replace(/^./, (str) => str.toUpperCase());
      const groupId = `${zoneDisplay}_${categoryKey}`;

      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          title: `${zoneDisplay} ${categoryDisplayName}`,
          zone: zoneDisplay,
          category: categoryKey,
          items: {}
        };
      }
      
      const groupItems = groups[groupId].items;
      
      if (!groupItems[name]) {
        groupItems[name] = {
          id: name,
          name,
          zone: zoneDisplay,
          dist: dist,
          nearestPos: pos,
          counts: { alive: 0, dead: 0 }
        };
      }
      
      const row = groupItems[name];
      
      // Keep shortest distance
      if (dist >= 0 && (row.dist === -1 || dist < row.dist)) {
        row.dist = dist;
        row.nearestPos = pos;
      }
      
      if (!isTimerInjection) {
        if (isAlive) {
          row.counts!.alive += (quantityAmount || 1);
        } else {
          row.counts!.dead += (quantityAmount || 1);
        }
      } else {
        row.counts!.dead += (quantityAmount || 1);
      }

      if (respawnTimeMs && respawnTimeMs > now) {
        if (!row.respawnTimesMs) row.respawnTimesMs = [];
        row.respawnTimesMs.push(respawnTimeMs);
      }
    };

    const isFavorite = (name: string) => favorites.includes(name);
    
    // Process items based on filter mode
    const processItem = (
      id: string,
      nameRaw: string, 
      typeRaw: string, 
      zoneRaw: string | undefined, 
      pos: Vector2, 
      isAlive: boolean, 
      isResource: boolean,
      isTimerInjection: boolean,
      respawnTimeMs?: number
    ) => {
      // INSTANT CLEAR WHEN DIE: 
      // If it's a dead entity (not a timer), skip processing it and clear from cache.
      if (!isAlive && !isTimerInjection) {
        distanceCache.current.delete(id);
        return;
      }

      const name = ResourceTracker.sanitizeResourceName(nameRaw);
      const zone = zoneRaw || 'Unknown';
      
      if (subTab === 'favorites' && !isFavorite(name)) return;
      if (displayMode === 'current_zone' && zone !== currentZone) return;

      // Filter by Search Query
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        if (!name.toLowerCase().includes(term) && !zone.toLowerCase().includes(term)) {
          return;
        }
      }

      // Filter by Quick Filter settings
      const dist = tableSettings.showDistance ? calculateDistance(anchorPlayerPosition, pos, id, distanceCache.current) : -1;
      
      if (quickFilter === 'rare') {
        const info = getItemInfo(name);
        const rarity = info?.rarity || 'common';
        if (rarity === 'common') return;
      } else if (quickFilter === 'nearby') {
        if (dist === -1 || dist > 50) return;
      }

      const categoryKey = getCategoryName(typeRaw, isResource).toLowerCase();
      const categoryDisplayName = t(`categories.${categoryKey}`) || getCategoryName(typeRaw, isResource);
      addOrUpdate(zone, categoryKey, categoryDisplayName, name, dist, pos, isAlive, isTimerInjection, respawnTimeMs);
    };

    // 1. Process Enemies
    Object.entries(enemies).forEach(([id, enemy]) => {
      processItem(`enemy-${id}`, enemy.type, enemy.type, enemy.zone, enemy.pos, !enemy.isDead, false, false);
    });

    Object.entries(timers).filter(([_, t]) => t.category === 'Mob').forEach(([id, t]) => {
      const zoneStr = t.zone || t.id.split('-')[1] || 'Unknown';
      processItem(`timer-${id}`, t.name, t.category, zoneStr, t.pos, false, false, true, t.expectedRespawnTime);
    });

    // 2. Process Resources
    Object.entries(resources).forEach(([id, res]) => {
      processItem(`res-${id}`, res.resource, res.type, res.zone, res.pos, !res.gathered, true, false);
    });

    Object.entries(timers).filter(([_, t]) => t.category !== 'Mob').forEach(([id, t]) => {
      const zoneStr = t.zone || t.id.split('-')[1] || 'Unknown';
      processItem(`timer-${id}`, t.name, t.category, zoneStr, t.pos, false, true, true, t.expectedRespawnTime);
    });

    // 3. Process Loot
    if (loot) {
      Object.entries(loot).forEach(([id, drop]) => {
        const name = ResourceTracker.sanitizeResourceName(drop.itemName);
        const zone = currentZone || 'Unknown';
        
        if (subTab === 'favorites' && !isFavorite(name)) return;
        if (displayMode === 'current_zone' && zone !== currentZone) return;

        const dist = tableSettings.showDistance ? calculateDistance(anchorPlayerPosition, drop.pos, `loot-${id}`, distanceCache.current) : -1;
        const categoryKey = 'loot';
        const categoryDisplayName = t('categories.loot') || 'Loot';
        addOrUpdate(zone, categoryKey, categoryDisplayName, name, dist, drop.pos, true, false, undefined, drop.quantity);
      });
    }

    // Convert to sorted arrays
    const catOrderMap: Record<string, number> = { 'mobs': 1, 'ores': 2, 'trees': 3, 'plants': 4, 'loot': 5 };

    const sortedGroups = Object.values(groups).map(g => ({
      id: g.id,
      title: g.title,
      zone: g.zone,
      category: g.category,
      data: Object.values(g.items).sort((a, b) => sortByDist(a, b, tableSettings))
    })).sort((a, b) => {
      // 1. Current Zone first
      const aIsCurrent = a.zone === currentZone;
      const bIsCurrent = b.zone === currentZone;
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      // 2. Sort by Zone alphabetically
      const zoneCompare = a.zone.localeCompare(b.zone);
      if (zoneCompare !== 0) return zoneCompare;

      // 3. Sort by Category logically (Mobs, Ores, Trees, Plants)
      const aCat = catOrderMap[a.category] || 99;
      const bCat = catOrderMap[b.category] || 99;
      return aCat - bCat;
    });

    return sortedGroups;
  }, [enemies, resources, timers, loot, anchorPlayerPosition, subTab, favorites, displayMode, currentZone, tableSettings.showDistance, tableSettings.raritySortOrder, tutorialStep, tutorialCompleted, searchTerm, quickFilter]);

  if (effectiveTab !== 'global' && effectiveTab !== 'favorites') return null;

  const renderEmptyState = () => {
    if (subTab === 'favorites') {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-[var(--text-muted)] py-12 select-none animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
            <Star size={32} className="relative text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest">{t('misc.favoritesEmpty') || 'No Favorites'}</p>
            <p className="text-[9px] opacity-70 px-4 max-w-[200px] leading-relaxed">
              Click the star icon next to any entity to add it to your favorites list for quick tracking.
            </p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-[var(--text-muted)] py-12 select-none animate-in fade-in zoom-in duration-300">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--accent-primary)]/20 blur-xl rounded-full animate-pulse" />
          <Database size={32} className="relative text-[var(--accent-primary)] drop-shadow-[0_0_10px_rgba(var(--accent-primary-rgb),0.5)]" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-[12px] font-bold text-[var(--text-primary)] uppercase tracking-widest">No Entities Found</p>
          <p className="text-[9px] opacity-70 px-4 max-w-[200px] leading-relaxed">
            {searchTerm ? 'Try adjusting your search or filters.' : 'Waiting for game data... move around to discover entities.'}
          </p>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    // ── VERTICAL MODE: flat list with single global header ──
    if (!isHorizontal) {
      if (verticalGroupingMode === 'flat') {
        return (
          <div className="flex flex-col w-full min-w-[150px]">
            {visibleCategories.length > 0 && <GlobalTableHeader />}
            {visibleCategories.map(cat => (
              <CategorySection
                key={cat.id}
                categoryId={cat.id}
                title={cat.title}
                data={cat.data}
                align="center"
              />
            ))}
          </div>
        );
      }

      const groupedByZone = visibleCategories.reduce((acc, cat) => {
        if (!acc[cat.zone]) acc[cat.zone] = [];
        acc[cat.zone].push(cat);
        return acc;
      }, {} as Record<string, typeof visibleCategories>);

      return (
        <div className="flex flex-col w-full min-w-[150px]">
          {visibleCategories.length > 0 && <GlobalTableHeader />}
          {Object.entries(groupedByZone).map(([zone, cats]) => {
            const isZoneCollapsed = collapsedSidebarZones[zone];
            return (
              <div key={zone} className="flex flex-col">
                {/* Zone Header */}
                <Tooltip content={`${t('ui.toggle')} ${zone}`}>
                  <button
                    onClick={() => toggleSidebarZone(zone)}
                    className="flex items-center justify-start gap-1 py-1 px-3 mx-1.5 my-1 text-[11px] font-black text-yellow-400 uppercase tracking-[0.2em] select-none hover:text-yellow-300 hover:bg-[var(--bg-hover)] transition-all border border-[var(--border-accent)] rounded-full font-[var(--font-heading)] bg-[var(--bg-panel)] shadow-md min-w-0 overflow-hidden"
                  >
                    <div className="shrink-0">{isZoneCollapsed ? <ChevronRight size={13} strokeWidth={3} /> : <ChevronDown size={13} strokeWidth={3} />}</div>
                    <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">{zone}</span>
                  </button>
                </Tooltip>
                
                {/* Categories in Zone */}
                {!isZoneCollapsed && cats.map(cat => (
                  <CategorySection
                    key={cat.id}
                    categoryId={cat.id}
                    title={cat.category}
                    data={cat.data}
                    align="center"
                  />
                ))}
              </div>
            );
          })}
        </div>
      );
    }

    // ── HORIZONTAL MODE: card-based layout with sidebar ──
    return (
      <div className="flex flex-row gap-1.5 h-full items-start w-full min-w-full overflow-hidden">
        {/* Sidebar Navigation */}
        {visibleCategories.length > 0 && (
          <div className="flex flex-col gap-2 w-[130px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md p-1 border border-[var(--border-subtle)] h-full overflow-y-auto custom-scrollbar">
            {Object.entries(
              visibleCategories.reduce((acc, cat) => {
                if (!acc[cat.zone]) acc[cat.zone] = [];
                acc[cat.zone].push(cat);
                return acc;
              }, {} as Record<string, typeof visibleCategories>)
            ).map(([zone, cats]) => {
              const isZoneCollapsed = collapsedSidebarZones[zone];
              return (
                <div key={zone} className="flex flex-col gap-0.5">
                  <Tooltip content={`${t('ui.toggle')} ${zone}`}>
                    <button
                      onClick={() => toggleSidebarZone(zone)}
                      className="flex items-center justify-between text-left px-2 py-1 bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] rounded transition-colors text-[11px] font-[var(--font-heading)] font-black uppercase tracking-wider text-[var(--accent-primary)] border border-transparent hover:border-[var(--border-subtle)]"
                    >
                      <span className="truncate">{zone}</span>
                      {isZoneCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </Tooltip>
                  {!isZoneCollapsed && cats.map(cat => {
                  const isExpanded = !collapsedCategories[cat.id];
                  return (
                    <Tooltip key={cat.id} content={`${t('ui.toggle')} ${cat.category}`}>
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center justify-between text-left pl-5 pr-2 py-1 rounded transition-colors text-[10px] font-[var(--font-heading)] font-bold uppercase tracking-wider min-w-0 overflow-hidden gap-1 ${
                          isExpanded 
                            ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-accent)]' 
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] border border-transparent'
                        }`}
                      >
                        <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">{cat.category}</span>
                        {isExpanded && <div className="w-1.5 h-1.5 rounded-full bg-[#00ff55] shadow-[0_0_5px_#00ff55] shrink-0" />}
                      </button>
                    </Tooltip>
                  )
                })}
              </div>
              );
            })}
          </div>
        )}

        {/* Expanded Cards Area - Scrollable */}
        <div className="flex-1 flex flex-row flex-nowrap gap-2 h-full overflow-x-auto overflow-y-hidden pb-2 custom-scrollbar min-w-0 pr-2">
          {visibleCategories.map((cat) => {
            if (collapsedCategories[cat.id]) return null;
            return (
              <CategoryCard
                key={cat.id}
                categoryId={cat.id}
                title={cat.title}
                data={cat.data}
                showHeader={true}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-1.5 p-2 bg-[var(--bg-panel)]/80 border-b border-[var(--border-subtle)] shrink-0 select-none">
        
        <div className="flex gap-1.5 w-full items-center mb-1">
          <div className="relative flex-1">
            <IsolatedInput
              type="text"
              placeholder={t('stats.searchEntries') || 'Search...'}
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-base)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)]/60 rounded-xl pl-8 pr-7 py-1.5 text-[10.5px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition-all font-medium shadow-inner"
            />
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold select-none cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
          
          <button 
            onClick={() => setSubTab(subTab === 'global' ? 'favorites' : 'global')}
            title={subTab === 'favorites' ? 'Show All' : 'Show Favorites'}
            className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer shadow-inner ${
              subTab === 'favorites'
                ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]/20 text-[var(--bg-base)] shadow-[0_2px_10px_color-mix(in srgb,var(--accent-primary) 35%,transparent)]'
                : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Star size={14} className={subTab === 'favorites' ? 'fill-yellow-300' : ''} />
          </button>
        </div>
        
        <div className="flex gap-1.5">
          {(['all', 'rare', 'nearby'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setQuickFilter(filter)}
              className={`px-3 py-1 rounded-lg text-[8.5px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer select-none border ${
                quickFilter === filter
                  ? 'bg-[var(--accent-primary)]/25 text-[var(--accent-primary)] border-[var(--accent-primary)]/40 shadow-[0_0_10px_color-mix(in srgb,var(--accent-primary) 25%,transparent)]'
                  : 'bg-[var(--bg-base)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] backdrop-blur-sm'
              }`}
            >
              {filter === 'all' ? (t('filters.all') || 'All') : filter === 'rare' ? (t('filters.rare') || <span className="inline-flex items-center gap-0.5"><Star size={10} className="fill-current" /> RARE</span>) : (t('filters.nearby') || <span className="inline-flex items-center gap-0.5"><Zap size={10} className="fill-current" /> NEARBY</span>)}
            </button>
          ))}
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {visibleCategories.length === 0 ? renderEmptyState() : renderContent()}
      </div>
    </div>
  );
};

export const TrackingView = React.memo(TrackingViewComponent);
