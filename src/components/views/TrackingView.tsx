import React, { useMemo } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useTrackerStore } from '../../store/trackerStore';
import { GlobalTableHeader, CategorySection, CategoryCard, TableRowData } from './CategoryTable';
import { Vector2 } from '../../types/events';

import { useShallow } from 'zustand/react/shallow';

const calculateDistance = (p1: Vector2 | null, p2: Vector2) => {
  if (!p1) return -1;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.round(Math.sqrt(dx * dx + dy * dy));
};

const formatDisplayName = (raw: string) => {
  let clean = raw.trim();
  if (clean.toLowerCase() === 'crystalrock') return 'Crystal';
  if (clean.toLowerCase() === 'dinobones') return 'Dino Bone';
  
  // Strip common suffixes case-insensitively
  clean = clean.replace(/\s*(ore|node|flower|tree|ai)$/i, '').trim();
  
  // Format camelCase to Title Case if needed
  clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
  
  return clean.replace(/^./, (str) => str.toUpperCase());
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

export const TrackingView: React.FC = () => {
  const {
    enemies, resources, timers, throttledPlayerPosition, activeTab, 
    favorites, layoutMode, displayMode, currentZone,
    collapsedCategories, toggleCategory,
    collapsedSidebarZones, toggleSidebarZone,
    verticalGroupingMode
  } = useTrackerStore(useShallow((state) => ({
    enemies: state.enemies,
    resources: state.resources,
    timers: state.timers,
    throttledPlayerPosition: state.throttledPlayerPosition,
    activeTab: state.activeTab,
    favorites: state.favorites,
    layoutMode: state.layoutMode,
    verticalGroupingMode: state.verticalGroupingMode,
    displayMode: state.displayMode,
    currentZone: state.currentZone,
    collapsedCategories: state.collapsedCategories,
    toggleCategory: state.toggleCategory,
    collapsedSidebarZones: state.collapsedSidebarZones,
    toggleSidebarZone: state.toggleSidebarZone
  })));
  
  const isHorizontal = layoutMode === 'horizontal';

  const visibleCategories = useMemo(() => {
    const now = Date.now();
    const groups: Record<string, DynamicGroup> = {};

    const addOrUpdate = (
      zone: string,
      category: string,
      name: string,
      dist: number,
      isAlive: boolean,
      isTimerInjection: boolean,
      respawnTimeMs?: number
    ) => {
      // Normalize zone name
      const zoneDisplay = zone.replace(/^./, (str) => str.toUpperCase());
      const groupId = `${zoneDisplay}_${category}`;

      if (!groups[groupId]) {
        groups[groupId] = {
          id: groupId,
          title: `${zoneDisplay} ${category}`,
          zone: zoneDisplay,
          category,
          items: {}
        };
      }
      
      const groupItems = groups[groupId].items;
      
      if (!groupItems[name]) {
        groupItems[name] = {
          id: name,
          name,
          dist: dist,
          counts: { alive: 0, dead: 0 }
        };
      }
      
      const row = groupItems[name];
      
      // Keep shortest distance
      if (dist >= 0 && (row.dist === -1 || dist < row.dist)) {
        row.dist = dist;
      }
      
      if (!isTimerInjection) {
        if (isAlive) {
          row.counts!.alive++;
        } else {
          row.counts!.dead++;
        }
      }

      if (respawnTimeMs && respawnTimeMs > now) {
        if (!row.respawnTimeMs || respawnTimeMs < row.respawnTimeMs) {
          row.respawnTimeMs = respawnTimeMs;
        }
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
      
      if (activeTab === 'favorites' && !isFavorite(name)) return;
      if (displayMode === 'current_zone' && zone !== currentZone) return;

      const dist = calculateDistance(throttledPlayerPosition, pos);
      const category = getCategoryName(typeRaw, isResource);
      addOrUpdate(zone, category, name, dist, isAlive, isTimerInjection, respawnTimeMs);
    };

    // 1. Process Enemies
    Object.values(enemies).forEach(enemy => {
      processItem(enemy.type, enemy.type, enemy.zone, enemy.pos, !enemy.isDead, false, false);
    });

    Object.values(timers).filter(t => t.category === 'Mob').forEach(t => {
      const zoneStr = t.id.split('-')[1] || 'Unknown';
      processItem(t.name, t.category, zoneStr, t.pos, false, false, true, t.expectedRespawnTime);
    });

    // 2. Process Resources
    Object.values(resources).forEach(res => {
      processItem(res.resource, res.type, res.zone, res.pos, !res.gathered, true, false);
    });

    Object.values(timers).filter(t => t.category !== 'Mob').forEach(t => {
      const zoneStr = t.id.split('-')[1] || 'Unknown';
      processItem(t.name, t.category, zoneStr, t.pos, false, true, true, t.expectedRespawnTime);
    });

    const sortByDist = (a: TableRowData, b: TableRowData) => {
      if (a.dist === -1) return 1;
      if (b.dist === -1) return -1;
      return a.dist - b.dist;
    };

    // Convert to sorted arrays
    const catOrderMap: Record<string, number> = { 'Mobs': 1, 'Ores': 2, 'Trees': 3, 'Plants': 4 };

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
  }, [enemies, resources, timers, throttledPlayerPosition, activeTab, favorites, displayMode, currentZone]);

  if (activeTab !== 'global' && activeTab !== 'favorites') return null;

  // ── VERTICAL MODE: flat list with single global header ──
  if (!isHorizontal) {
    if (verticalGroupingMode === 'flat') {
      return (
        <div className="flex flex-col">
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
      <div className="flex flex-col">
        {visibleCategories.length > 0 && <GlobalTableHeader />}
        {Object.entries(groupedByZone).map(([zone, cats]) => {
          const isZoneCollapsed = collapsedSidebarZones[zone];
          return (
            <div key={zone} className="flex flex-col">
              {/* Zone Header */}
              <button
                onClick={() => toggleSidebarZone(zone)}
                title={`Toggle ${zone}`}
                className="flex items-center justify-start gap-1 py-1 px-3 mx-1.5 my-1 text-[11px] font-black text-yellow-400 uppercase tracking-[0.2em] select-none hover:text-yellow-300 hover:bg-[var(--bg-hover)] transition-all border border-[var(--border-accent)] rounded-full font-[var(--font-heading)] bg-[var(--bg-panel)] shadow-md"
              >
                {isZoneCollapsed ? <ChevronRight size={13} strokeWidth={3} /> : <ChevronDown size={13} strokeWidth={3} />}
                {zone}
              </button>
              
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
    <div className="flex flex-row gap-1.5 h-full items-start">
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
                <button 
                  onClick={() => toggleSidebarZone(zone)}
                  title={`Toggle ${zone}`}
                  className="flex items-center justify-between text-[9px] font-black text-yellow-400 hover:text-yellow-300 transition-colors uppercase tracking-widest px-2 py-1 border-b border-[var(--border-subtle)] mb-0.5"
                >
                  {zone}
                  {isZoneCollapsed ? <ChevronRight size={10} strokeWidth={3} /> : <ChevronDown size={10} strokeWidth={3} />}
                </button>
                {!isZoneCollapsed && cats.map(cat => {
                const isExpanded = !collapsedCategories[cat.id];
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    title={`Toggle ${cat.category}`}
                    className={`flex items-center justify-between text-left pl-5 pr-2 py-1 rounded transition-colors text-[10px] font-[var(--font-heading)] font-bold uppercase tracking-wider ${
                      isExpanded 
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-accent)]' 
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] border border-transparent'
                    }`}
                  >
                    <span className="truncate">{cat.category}</span>
                    {isExpanded && <div className="w-1.5 h-1.5 rounded-full bg-[#00ff55] shadow-[0_0_5px_#00ff55] shrink-0 ml-1" />}
                  </button>
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
