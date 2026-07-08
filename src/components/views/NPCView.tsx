import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settingsStore';

import { KNOWN_NPCS_DATA, NPCInfo } from '../../data/npcs';
import { Search, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { useTrackerStore } from '../../store/trackerStore';
import { useTranslation } from '../../hooks/useTranslation';
import { useVirtualizer } from '@tanstack/react-virtual';

import { NPCCard } from './npc/NPCCard';

const getRawZoneName = (npcZoneKey: string): string => {
  const z = npcZoneKey.toLowerCase();
  if (z.includes('guild')) return 'Guild';
  if (z.includes('mine')) return 'Mines';
  if (z.includes('pond')) return 'Town';
  if (z.includes('marketplace')) return 'Marketplace';
  if (z.includes('tavern')) return 'Tavern';
  if (z.includes('alchemist')) return 'Alchemist';
  if (z.includes('blacksmith')) return 'BlackSmith';
  if (z.includes('easttown')) return 'East Town';
  return npcZoneKey;
};

export const NPCView: React.FC = () => {
  const { t } = useTranslation();
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isFocusedRef = React.useRef(false);

  React.useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // If the input is not focused, let the game have the key
      if (!isFocusedRef.current) return;
      
      // Stop the game from ever seeing this key!
      e.stopImmediatePropagation();
      e.stopPropagation();
      
      if (e.type === 'keydown') {
        if (e.key === 'Backspace') {
          e.preventDefault();
          setSearchTerm(prev => prev.slice(0, -1));
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setSearchTerm('');
          inputRef.current?.blur();
        } else if (e.key === ' ') {
          e.preventDefault();
          setSearchTerm(prev => prev + ' ');
        } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
          e.preventDefault();
          setSearchTerm(prev => prev + e.key);
        }
      }
    };

    // Attach to the VERY TOP of the window in the capture phase
    window.addEventListener('keydown', handleGlobalKey, true);
    window.addEventListener('keyup', handleGlobalKey, true);
    window.addEventListener('keypress', handleGlobalKey, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey, true);
      window.removeEventListener('keyup', handleGlobalKey, true);
      window.removeEventListener('keypress', handleGlobalKey, true);
    };
  }, []);
  const layoutMode = useSettingsStore(state => state.layoutMode);
  const tabDimensions = useSettingsStore(state => state.tabDimensions);
  const isHorizontal = layoutMode === 'horizontal';

  const activeWaypointName = useTrackerStore(state => state.activeWaypointName);

  const activeDimKey = isHorizontal ? `npcs_horizontal` : `npcs_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const hasCustomHeight = activeDim.height !== undefined;
  const compactHeightClass = !hasCustomHeight ? 'max-h-[250px]' : '';

  const [activeZone, setActiveZone] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  // By default, let's keep them collapsed (true). If false, they are expanded.
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  const toggleZone = (zone: string) => {
    setCollapsedZones(prev => ({ 
      ...prev, 
      // If it's undefined, it means it's currently collapsed (default).
      // So toggling it makes it false (expanded).
      [zone]: prev[zone] === undefined ? false : !prev[zone] 
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter by name or zone or location
  const filteredNpcs = KNOWN_NPCS_DATA.filter(npc => {
    const term = searchTerm.toLowerCase();
    const translatedZone = t(npc.zone as any).toLowerCase();
    const translatedLocation = t(npc.location as any).toLowerCase();
    return npc.name.toLowerCase().includes(term) || 
           translatedZone.includes(term) ||
           translatedLocation.includes(term);
  });

  // Group by zone
  const groupedNpcs = filteredNpcs.reduce((acc, npc) => {
    if (!acc[npc.zone]) acc[npc.zone] = [];
    acc[npc.zone].push(npc);
    return acc;
  }, {} as Record<string, NPCInfo[]>);

  // Sort each group: pinned first, then alphabetical
  Object.keys(groupedNpcs).forEach(zone => {
    groupedNpcs[zone].sort((a, b) => a.name.localeCompare(b.name));
  });

  const zones = Object.keys(groupedNpcs).sort();

  // Determine zones to show on right side in horizontal mode
  const isSearching = searchTerm.trim() !== '';
  let horizontalZonesToRender = zones;
  
  if (!isSearching) {
    if (activeZone && zones.includes(activeZone)) {
      horizontalZonesToRender = [activeZone];
    } else if (zones.length > 0) {
      horizontalZonesToRender = [zones[0]]; // Default to first
    }
  }

  // Flatten items for vertical virtualization
  const flatItems: Array<{ type: 'header', zone: string } | { type: 'item', npc: NPCInfo, zone: string }> = [];
  zones.forEach(zone => {
    flatItems.push({ type: 'header', zone });
    const isCollapsed = searchTerm.trim() !== '' ? false : (collapsedZones[zone] === undefined ? true : collapsedZones[zone]);
    if (!isCollapsed) {
      groupedNpcs[zone].forEach(npc => {
        flatItems.push({ type: 'item', npc, zone });
      });
    }
  });

  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: flatItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => flatItems[index].type === 'header' ? 24 : 58,
  });

  const renderSearch = () => (
    <div className="relative mb-2 shrink-0">
      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
        <Search size={14} className="text-[var(--text-muted)]" />
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        ref={inputRef}
        onFocus={() => { isFocusedRef.current = true; }}
        onBlur={() => { isFocusedRef.current = false; }}
        onKeyUp={(e) => e.stopPropagation()}
        onKeyPress={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
        placeholder={t('misc.searchNpcs')}
        className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] focus:border-[var(--border-accent)] text-[var(--text-primary)] text-xs rounded pl-8 pr-3 py-1.5 outline-none transition-colors"
      />
    </div>
  );

  return (
    <div className={`flex-1 flex flex-col p-2 overflow-hidden min-h-0 bg-[var(--bg-base)] w-full ${!isHorizontal ? 'min-w-[150px]' : ''}`}>
      {!isHorizontal && renderSearch()}

      {/* HORIZONTAL MODE */}
      {isHorizontal ? (
        <div className="flex flex-row gap-2 h-full items-start overflow-hidden">
          {zones.length > 0 ? (
            <>
              {/* Sidebar Navigation */}
              <div className="flex flex-col w-[160px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-subtle)] h-fit max-h-full overflow-hidden">
                {/* Compact Header & Search */}
                <div className="p-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] shrink-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                      <Search size={10} className="text-[var(--text-muted)]" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      ref={inputRef}
                      onFocus={() => { isFocusedRef.current = true; }}
                      onBlur={() => { isFocusedRef.current = false; }}
                      onKeyUp={(e) => e.stopPropagation()}
                      onKeyPress={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => { e.stopPropagation(); inputRef.current?.focus(); }}
                      placeholder={t('misc.searchNpcs')}
                      className="w-full bg-[var(--bg-card)] border border-white/5 focus:border-[var(--border-accent)] text-[var(--text-primary)] text-[9px] rounded pl-5 pr-2 py-1 outline-none transition-colors"
                    />
                  </div>
                </div>
                
                {/* Zone List */}
                <div className="flex flex-col gap-px overflow-y-auto custom-scrollbar p-1">
                  {zones.map(zone => {
                    const isActive = !isSearching && (activeZone === zone || (!activeZone && zone === zones[0]));
                    return (
                      <button
                        key={`nav-${zone}`}
                        onClick={() => setActiveZone(zone)}
                        className={`flex items-center justify-between text-[9px] font-black hover:text-white transition-colors uppercase tracking-widest px-1.5 py-1.5 rounded text-left leading-tight whitespace-normal ${
                          isActive ? 'bg-[var(--bg-hover)] text-white border border-[var(--border-accent)]' : 'text-[var(--accent-primary)] border border-transparent'
                        }`}
                      >
                        <span>{t(zone as any)}</span>
                        <ChevronRight size={10} className={isActive ? 'opacity-100' : 'opacity-0'} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Content Detail Panel */}
              <div className={`gap-2 overflow-y-auto custom-scrollbar flex-1 pb-2 h-full pr-1 ${isSearching ? 'grid grid-cols-3 items-start content-start' : 'flex flex-row items-start'}`}>
                {horizontalZonesToRender.map(zone => (
                  <div key={zone} id={`npc-${zone.replace(/\s+/g, '-')}`} className={`flex flex-col bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-subtle)] h-fit max-h-full ${isSearching ? 'w-full' : 'w-full min-w-[320px]'}`}>
                    {/* Zone Header */}
                    <div className="px-2 py-1.5 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] rounded-t-lg shrink-0">
                      <h3 className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest">{t(zone as any)}</h3>
                    </div>
                    {/* Card List (Grid) */}
                    <div className={`grid gap-2 overflow-y-auto custom-scrollbar p-2 ${isSearching ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
                      {groupedNpcs[zone].map(npc => {
                        const isTracked = activeWaypointName === npc.name;
                        return (
                          <NPCCard 
                            key={npc.name}
                            npc={npc}
                            isTracked={isTracked}
                            t={t}
                            onToggle={() => {
                              if (activeWaypointName === npc.name) {
                                useTrackerStore.getState().setActiveWaypoint(null, null);
                              } else if (npc.x !== undefined && npc.y !== undefined) {
                                // If the NPC has coordinates inside the Town's outer limits, their physical tracking zone is Town.
                                // Town bounds: x is roughly -80 to 40, y is roughly -50 to 80.
                                const isActuallyInTown = npc.x > -80 && npc.x < 40 && npc.y > -50 && npc.y < 80;
                                const targetZone = isActuallyInTown ? 'Town' : getRawZoneName(npc.zone);
                                useTrackerStore.getState().setActiveWaypoint({ x: npc.x!, y: npc.y! }, npc.name, targetZone);
                              }
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
             <div className="flex flex-col gap-0.5 w-[160px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-subtle)] h-fit overflow-hidden">
               <div className="p-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] shrink-0">
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                     <Search size={10} className="text-[var(--text-muted)]" />
                   </div>
                   <input
                     type="text"
                     value={searchTerm}
                     onChange={handleSearchChange}
                     ref={inputRef}
                     placeholder={t('misc.searchNpcs')}
                     className="w-full bg-[var(--bg-card)] border border-white/5 text-[var(--text-primary)] text-[9px] rounded pl-5 pr-2 py-1 outline-none transition-colors"
                   />
                 </div>
               </div>
               <div className="text-center py-4 text-[9px] text-[var(--text-muted)] italic w-full">
                 {t('misc.noNpcs')}
               </div>
            </div>
          )}
        </div>
      ) : (
        /* VERTICAL MODE */
        <>
          {zones.length > 0 && (
            <div className="hidden"></div>
          )}          <div ref={parentRef} className={`flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-2 pr-2 ${compactHeightClass}`}>
            {zones.length === 0 ? (
              <div className="text-center py-4 text-xs text-[var(--text-muted)] italic w-full">
                {t('misc.noNpcs')}
              </div>
            ) : (
              <div
                style={{
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  width: '100%',
                  position: 'relative',
                }}
              >
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const item = flatItems[virtualRow.index];
                  const isCollapsed = searchTerm.trim() !== '' ? false : (collapsedZones[item.zone] === undefined ? true : collapsedZones[item.zone]);
                  
                  return (
                    <div
                      key={virtualRow.index}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {item.type === 'header' ? (
                        <button 
                          onClick={() => toggleZone(item.zone)}
                          className="flex items-center gap-1.5 px-1 py-1 mb-1 text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider hover:bg-white/5 rounded transition-colors w-full text-left"
                        >
                          {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                          <MapPin size={12} />
                          {t(item.zone as any)}
                        </button>
                      ) : (
                        <div className="flex flex-col gap-1 pl-1 h-full justify-center">
                          <NPCCard 
                            npc={item.npc}
                            isTracked={activeWaypointName === item.npc.name}
                            t={t}
                            onToggle={() => {
                              if (activeWaypointName === item.npc.name) {
                                useTrackerStore.getState().setActiveWaypoint(null, null);
                              } else if (item.npc.x !== undefined && item.npc.y !== undefined) {
                                const isActuallyInTown = item.npc.x > -80 && item.npc.x < 40 && item.npc.y > -50 && item.npc.y < 80;
                                const targetZone = isActuallyInTown ? 'Town' : getRawZoneName(item.npc.zone);
                                useTrackerStore.getState().setActiveWaypoint({ x: item.npc.x!, y: item.npc.y! }, item.npc.name, targetZone);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
