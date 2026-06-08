import sys

file_path = 'src/components/views/NPCView.tsx'

content = """import React, { useState } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { KNOWN_NPCS_DATA, NPCInfo } from '../../data/npcs';
import { Users, Crosshair, Search, MapPin } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from '../../hooks/useTranslation';

export const NPCView: React.FC = () => {
  const { t } = useTranslation();
  const { pinnedEntities, togglePin } = useTrackerStore(useShallow((state) => ({
    pinnedEntities: state.favorites,
    togglePin: state.toggleFavorite
  })));

  const layoutMode = useTrackerStore(state => state.layoutMode);
  const isHorizontal = layoutMode === 'horizontal';

  const [searchTerm, setSearchTerm] = useState('');

  // Filter by name or zone
  const filteredNpcs = KNOWN_NPCS_DATA.filter(npc => 
    npc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    npc.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by zone
  const groupedNpcs = filteredNpcs.reduce((acc, npc) => {
    if (!acc[npc.zone]) acc[npc.zone] = [];
    acc[npc.zone].push(npc);
    return acc;
  }, {} as Record<string, NPCInfo[]>);

  // Sort each group: pinned first, then alphabetical
  Object.keys(groupedNpcs).forEach(zone => {
    groupedNpcs[zone].sort((a, b) => {
      const aPinned = pinnedEntities.includes(a.name);
      const bPinned = pinnedEntities.includes(b.name);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return a.name.localeCompare(b.name);
    });
  });

  const zones = Object.keys(groupedNpcs).sort();

  return (
    <div className="flex-1 w-full flex flex-col p-4 overflow-hidden min-h-0 bg-[var(--bg-base)]">
      <div className="flex items-center justify-between mb-3 border-b border-[var(--border-subtle)] pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-[#00ffcc]" />
          <h2 className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-heading)] tracking-wide">
            {t('tabs.npcTracker')}
          </h2>
        </div>
      </div>

      <div className="relative mb-3 shrink-0">
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <Search size={14} className="text-[var(--text-muted)]" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          onKeyUp={(e) => e.stopPropagation()}
          onKeyPress={(e) => e.stopPropagation()}
          placeholder={t('misc.searchNpcs')}
          className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] focus:border-[var(--border-accent)] text-[var(--text-primary)] text-xs rounded pl-8 pr-3 py-1.5 outline-none transition-colors"
        />
      </div>

      <div className={`flex flex-1 min-h-0 ${isHorizontal ? 'flex-row overflow-x-auto gap-4' : 'flex-col overflow-y-auto gap-4 max-h-[250px]'} custom-scrollbar pb-2 pr-2`}>
        {zones.length === 0 ? (
          <div className="text-center py-4 text-xs text-[var(--text-muted)] italic w-full">
            {t('misc.noNpcs')}
          </div>
        ) : (
          zones.map((zone, idx) => (
            <div key={idx} className={`flex flex-col gap-1 ${isHorizontal ? 'w-[300px] shrink-0' : 'w-full'}`}>
              <div className="flex items-center gap-1.5 px-1 py-0.5 mb-1 text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">
                <MapPin size={12} />
                {zone}
              </div>
              <div className="grid grid-cols-[80px_1fr_40px] gap-2 px-3 py-1.5 rounded bg-[var(--bg-panel)] border border-[var(--border-accent)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                <div className="truncate">{t('columns.npc')}</div>
                <div className="truncate">{t('columns.location')}</div>
                <div className="text-center truncate">{t('columns.track')}</div>
              </div>

              <div className="flex flex-col gap-1">
                {groupedNpcs[zone].map(npc => {
                  const isPinned = pinnedEntities.includes(npc.name);
                  return (
                    <div 
                      key={npc.name}
                      className={`grid grid-cols-[80px_1fr_40px] gap-2 px-3 py-2 items-center rounded border transition-colors ${
                        isPinned 
                          ? 'bg-amber-500/10 border-amber-500/30' 
                          : 'bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]'
                      }`}
                    >
                      <div className="text-xs font-medium text-[var(--text-primary)] truncate">{npc.name}</div>
                      <div 
                        className="text-[10px] text-[var(--text-secondary)] truncate hover:text-clip hover:whitespace-normal transition-all"
                        title={npc.location}
                      >
                        {npc.location}
                      </div>
                      <div className="flex justify-center">
                        <button
                          onClick={() => togglePin(npc.name)}
                          className={`p-1 rounded transition-colors ${
                            isPinned 
                              ? 'text-amber-400 bg-amber-400/20 hover:bg-amber-400/30' 
                              : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'
                          }`}
                          title={isPinned ? t('misc.untrackNpc') : t('misc.trackNpc')}
                        >
                          <Crosshair size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
"""

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated NPCView.tsx")
