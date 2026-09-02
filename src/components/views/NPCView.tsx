import React, { useState, useMemo } from 'react';
import { KNOWN_NPCS_DATA, NPCInfo } from '../../data/npcs';
import { Search, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { useTrackerStore } from '../../store/trackerStore';
import { useTranslation } from '../../hooks/useTranslation';
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

const StaticNPCTab: React.FC<{
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isFocusedRef: React.MutableRefObject<boolean>;
}> = React.memo(({ searchTerm, setSearchTerm, inputRef, isFocusedRef }) => {
  const { t } = useTranslation();
  const activeWaypointName = useTrackerStore(state => state.activeWaypointName);
  
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  const toggleZone = (zone: string) => {
    setCollapsedZones(prev => ({ 
      ...prev, 
      [zone]: prev[zone] === undefined ? false : !prev[zone] 
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredNpcs = useMemo(() => KNOWN_NPCS_DATA.filter(npc => {
    const term = searchTerm.toLowerCase();
    const translatedZone = t(npc.zone as any).toLowerCase();
    const translatedLocation = t(npc.location as any).toLowerCase();
    return npc.name.toLowerCase().includes(term) || 
           translatedZone.includes(term) ||
           translatedLocation.includes(term);
  }), [searchTerm, t]);

  const groupedNpcs = useMemo(() => {
    const grouped = filteredNpcs.reduce((acc, npc) => {
      if (!acc[npc.zone]) acc[npc.zone] = [];
      acc[npc.zone].push(npc);
      return acc;
    }, {} as Record<string, NPCInfo[]>);

    Object.keys(grouped).forEach(zone => {
      grouped[zone].sort((a, b) => a.name.localeCompare(b.name));
    });
    return grouped;
  }, [filteredNpcs]);

  const zones = Object.keys(groupedNpcs).sort();

  return (
    <>
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
          placeholder={t('misc.searchNpcs') || "Search NPCs..."}
          className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] focus:border-[var(--border-accent)] text-[var(--text-primary)] text-xs rounded pl-8 pr-3 py-1.5 outline-none transition-colors"
        />
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-2 pr-1">
        {zones.length === 0 ? (
          <div className="text-center py-6 text-[10px] text-[var(--text-muted)] italic w-full">
            {t('misc.noNpcs') || "No NPCs found"}
          </div>
        ) : (
          zones.map(zone => {
            const isCollapsed = searchTerm.trim() !== '' ? false : (collapsedZones[zone] === undefined ? true : collapsedZones[zone]);
            return (
              <div key={zone} className="mb-2">
                <button 
                  onClick={() => toggleZone(zone)}
                  className="flex items-center gap-1.5 px-2 py-1.5 mb-1 text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded hover:bg-[var(--bg-hover)] transition-colors w-full text-left"
                >
                  {isCollapsed ? <ChevronRight size={12} className="opacity-70" /> : <ChevronDown size={12} className="opacity-70" />}
                  <MapPin size={12} className="shrink-0 text-[var(--accent-primary)]" />
                  {t(zone as any)}
                </button>
                {!isCollapsed && (
                  <div className="flex flex-col gap-1.5 px-1 py-1">
                    {groupedNpcs[zone].map(npc => (
                      <NPCCard 
                        key={npc.name}
                        npc={npc}
                        isTracked={activeWaypointName === npc.name}
                        t={t}
                        onToggle={() => {
                          if (activeWaypointName === npc.name) {
                            useTrackerStore.getState().setActiveWaypoint(null, null);
                          } else if (npc.x !== undefined && npc.y !== undefined) {
                            const isActuallyInTown = npc.x > -80 && npc.x < 40 && npc.y > -50 && npc.y < 80;
                            const targetZone = isActuallyInTown ? 'Town' : getRawZoneName(npc.zone);
                            useTrackerStore.getState().setActiveWaypoint({ x: npc.x!, y: npc.y! }, npc.name, targetZone);
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
});

export const NPCViewComponent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isFocusedRef = React.useRef(false);

  React.useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if (!isFocusedRef.current) return;
      
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

    window.addEventListener('keydown', handleGlobalKey, true);
    window.addEventListener('keyup', handleGlobalKey, true);
    window.addEventListener('keypress', handleGlobalKey, true);

    return () => {
      window.removeEventListener('keydown', handleGlobalKey, true);
      window.removeEventListener('keyup', handleGlobalKey, true);
      window.removeEventListener('keypress', handleGlobalKey, true);
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col p-2 overflow-hidden min-h-0 bg-[var(--bg-base)] w-full">
      <StaticNPCTab 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        inputRef={inputRef} 
        isFocusedRef={isFocusedRef} 
      />
    </div>
  );
};

export const NPCView = React.memo(NPCViewComponent);
