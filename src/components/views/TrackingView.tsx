import React, { useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useThrottledEntities } from '../../hooks/useThrottledEntities';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTranslation } from '../../hooks/useTranslation';
import { GlobalTableHeader, CategorySection, CategoryCard, TableRowData } from '../ui/table';
import { Tooltip } from '../ui/Tooltip';
import { Vector2 } from '../../types/events';

import { useShallow } from 'zustand/react/shallow';

const calculateDistance = (p1: Vector2 | null, p2: Vector2) => {
  if (!p1) return -1;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

import { formatInternalName as formatDisplayName } from '../../utils/formatters';
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

export const TrackingView: React.FC<TrackingViewProps> = ({ forcedTab }) => {
  const { t } = useTranslation();
  const { currentZone } = useTrackerStore(useShallow((state) => ({
    currentZone: state.currentZone
  })));
  
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
  
  const { enemies, resources, timers, throttledPlayerPosition } = useThrottledEntities(300);

  const effectiveTab = forcedTab || activeTab;
  const isHorizontal = layoutMode === 'horizontal';

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
      respawnTimeMs?: number
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
          row.counts!.alive++;
        } else {
          row.counts!.dead++;
        }
      } else {
        row.counts!.dead++;
      }

      if (respawnTimeMs && respawnTimeMs > now) {
        if (!row.respawnTimesMs) row.respawnTimesMs = [];
        row.respawnTimesMs.push(respawnTimeMs);
      }
    };

    const isFavorite = (name: string) => favorites.includes(name);
    
    // Process items based on filter mode
    const processItem = (
      nameRaw: string, 
      typeRaw: string, 
      zoneRaw: string | undefined, 
      pos: Vector2, 
      isAlive: boolean, 
      isResource: boolean,
      isTimerInjection: boolean,
      respawnTimeMs?: number
    ) => {
      const name = formatDisplayName(nameRaw);
      const zone = zoneRaw || 'Unknown';
      
      if (effectiveTab === 'favorites' && !isFavorite(name)) return;
      if (displayMode === 'current_zone' && zone !== currentZone) return;

      const dist = tableSettings.showDistance ? calculateDistance(throttledPlayerPosition, pos) : -1;
      const categoryKey = getCategoryName(typeRaw, isResource).toLowerCase();
      const categoryDisplayName = t(`categories.${categoryKey}`) || getCategoryName(typeRaw, isResource);
      addOrUpdate(zone, categoryKey, categoryDisplayName, name, dist, pos, isAlive, isTimerInjection, respawnTimeMs);
    };

    // 1. Process Enemies
    Object.values(enemies).forEach(enemy => {
      processItem(enemy.type, enemy.type, enemy.zone, enemy.pos, !enemy.isDead, false, false);
    });

    Object.values(timers).filter(t => t.category === 'Mob').forEach(t => {
      const zoneStr = t.zone || t.id.split('-')[1] || 'Unknown';
      processItem(t.name, t.category, zoneStr, t.pos, false, false, true, t.expectedRespawnTime);
    });

    // 2. Process Resources
    Object.values(resources).forEach(res => {
      processItem(res.resource, res.type, res.zone, res.pos, !res.gathered, true, false);
    });

    Object.values(timers).filter(t => t.category !== 'Mob').forEach(t => {
      const zoneStr = t.zone || t.id.split('-')[1] || 'Unknown';
      processItem(t.name, t.category, zoneStr, t.pos, false, true, true, t.expectedRespawnTime);
    });

    const sortByDist = (a: TableRowData, b: TableRowData) => {
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

    // Convert to sorted arrays
    const catOrderMap: Record<string, number> = { 'mobs': 1, 'ores': 2, 'trees': 3, 'plants': 4 };

    const sortedGroups = Object.values(groups).map(g => ({
      id: g.id,
      title: g.title,
      zone: g.zone,
      category: g.category,
      data: Object.values(g.items).sort(sortByDist)
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
  }, [enemies, resources, timers, throttledPlayerPosition, effectiveTab, favorites, displayMode, currentZone, tableSettings.showDistance, tableSettings.raritySortOrder, tutorialStep, tutorialCompleted]);

  if (effectiveTab !== 'global' && effectiveTab !== 'favorites') return null;

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
    <div className="flex flex-row gap-1.5 h-full items-start w-max min-w-full">
      {/* Sidebar Navigation */}
      {visibleCategories.length > 0 && (
        <div className="flex flex-col gap-2 w-[130px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md p-1 border border-[var(--border-subtle)] h-fit">
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
                    className="flex items-center justify-between text-[9px] font-black text-yellow-400 hover:text-yellow-300 transition-colors uppercase tracking-widest px-2 py-1 border-b border-[var(--border-subtle)] mb-0.5 min-w-0 overflow-hidden gap-1"
                  >
                    <span className="truncate block whitespace-nowrap overflow-hidden text-ellipsis">{zone}</span>
                    <div className="shrink-0">{isZoneCollapsed ? <ChevronRight size={10} strokeWidth={3} /> : <ChevronDown size={10} strokeWidth={3} />}</div>
                  </button>
                </Tooltip>
                {!isZoneCollapsed && cats.map(cat => {
                const isExpanded = !collapsedCategories[cat.id];
                return (
                  <Tooltip content={`${t('ui.toggle')} ${cat.category}`}>
                    <button
                      key={cat.id}
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

      {/* Expanded Cards */}
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
  );
};
