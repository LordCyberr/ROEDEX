import React, { useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { KNOWN_NPCS_DATA, NPCInfo } from '../../data/npcs';
import { Users, Search, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

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
  const layoutMode = useTrackerStore(state => state.layoutMode);
  const isHorizontal = layoutMode === 'horizontal';

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

  return (
    <div className={`flex-1 flex flex-col p-2 overflow-hidden min-h-0 bg-[var(--bg-base)] ${isHorizontal ? 'w-[520px]' : 'w-full min-w-[150px]'}`}>
      <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#00ffcc]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-heading)] tracking-wide">
            {t('tabs.npcTracker')}
          </h2>
        </div>
      </div>

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

      {/* HORIZONTAL MODE */}
      {isHorizontal ? (
        <div className="flex flex-row gap-2 h-full items-start overflow-hidden">
          {zones.length > 0 ? (
            <>
              {/* Sidebar Navigation */}
              <div className="flex flex-col gap-0.5 w-[160px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md p-1.5 border border-[var(--border-subtle)] h-fit max-h-full overflow-y-auto custom-scrollbar">
                {zones.map(zone => {
                  const isActive = !isSearching && (activeZone === zone || (!activeZone && zone === zones[0]));
                  return (
                    <button
                      key={`nav-${zone}`}
                      onClick={() => setActiveZone(zone)}
                      className={`flex items-center justify-between text-[9px] font-black hover:text-white transition-colors uppercase tracking-widest px-2 py-1.5 border-b border-[var(--border-subtle)] mb-0.5 text-left leading-tight whitespace-normal ${
                        isActive ? 'bg-[var(--bg-hover)] text-white border-b-transparent rounded' : 'text-[var(--accent-primary)]'
                      }`}
                    >
                      <span>{t(zone as any)}</span>
                      <ChevronRight size={10} className={isActive ? 'opacity-100' : 'opacity-50'} />
                    </button>
                  );
                })}
              </div>

              {/* Main Content Detail Panel */}
              <div className="flex flex-row gap-2 overflow-x-auto custom-scrollbar flex-1 pb-2 h-full items-start">
                {horizontalZonesToRender.map(zone => (
                  <div key={zone} id={`npc-${zone.replace(/\s+/g, '-')}`} className="flex flex-col w-[320px] max-w-full shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-subtle)] h-fit max-h-full">
                    {/* Zone Header */}
                    <div className="px-2 py-1.5 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] rounded-t-lg">
                      <h3 className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest">{t(zone as any)}</h3>
                    </div>
                    {/* Embedded Table Header */}
                    <div className="grid grid-cols-[45px_1fr] gap-2 px-2 py-1 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                      <div className="truncate">{t('columns.npc')}</div>
                      <div className="truncate">{t('columns.location')}</div>
                    </div>
                    {/* Card List */}
                    <div className="flex flex-col overflow-y-auto custom-scrollbar p-1 gap-1">
                      {groupedNpcs[zone].map(npc => {
                        return (
                          <div 
                            key={npc.name}
                            className="grid grid-cols-[45px_1fr] gap-2 px-2 py-1.5 items-center rounded border transition-colors bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]"
                          >
                            <div className="text-[10px] font-bold text-[var(--text-primary)] truncate">{npc.name}</div>
                            <div 
                              className="text-[9px] text-[var(--text-secondary)] truncate hover:text-clip hover:whitespace-normal transition-all"
                              title={t(npc.location as any)}
                            >
                              {t(npc.location as any)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-xs text-[var(--text-muted)] italic w-full">
              {t('misc.noNpcs')}
            </div>
          )}
        </div>
      ) : (
        /* VERTICAL MODE */
        <>
          {zones.length > 0 && (
            <div className="grid grid-cols-[45px_1fr] gap-2 px-2 ml-1 py-1 mb-1 bg-[var(--bg-panel)] border border-[var(--border-accent)] rounded text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
              <div className="truncate">{t('columns.npc')}</div>
              <div className="truncate">{t('columns.location')}</div>
            </div>
          )}          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-2 max-h-[250px] custom-scrollbar pb-2 pr-2">
            {zones.length === 0 ? (
              <div className="text-center py-4 text-xs text-[var(--text-muted)] italic w-full">
                {t('misc.noNpcs')}
              </div>
            ) : (
              zones.map((zone, idx) => {
                const isCollapsed = searchTerm.trim() !== '' ? false : (collapsedZones[zone] === undefined ? true : collapsedZones[zone]);
                return (
                  <div key={idx} className="flex flex-col w-full">
                    <button 
                      onClick={() => toggleZone(zone)}
                      className="flex items-center gap-1.5 px-1 py-1 mb-1 text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider hover:bg-white/5 rounded transition-colors w-full text-left"
                    >
                      {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                      <MapPin size={12} />
                      {t(zone as any)}
                    </button>

                    {!isCollapsed && (
                      <div className="flex flex-col gap-1 pl-1">
                        {groupedNpcs[zone].map(npc => {
                          return (
                            <div 
                              key={npc.name}
                              className="grid grid-cols-[45px_1fr] gap-2 px-2 py-2 items-center rounded border transition-colors bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]"
                            >
                              <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{npc.name}</div>
                              <div 
                                className="text-[10px] text-[var(--text-secondary)] truncate hover:text-clip hover:whitespace-normal transition-all"
                                title={t(npc.location as any)}
                              >
                                {t(npc.location as any)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
};
