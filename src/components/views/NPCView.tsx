import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { KNOWN_NPCS } from '../../data/npcs';
import { Users, Crosshair } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';

export const NPCView: React.FC = () => {
  const { pinnedEntities, togglePin } = useTrackerStore(useShallow((state) => ({
    pinnedEntities: state.favorites, // we'll use favorites for pinned NPCs too
    togglePin: state.toggleFavorite // we'll use favorite functionality to pin NPCs
  })));

  // Sort: pinned first, then alphabetical
  const sortedNpcs = [...KNOWN_NPCS].sort((a, b) => {
    const aPinned = pinnedEntities.includes(a);
    const bPinned = pinnedEntities.includes(b);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="flex-1 w-full flex flex-col p-4 overflow-y-auto custom-scrollbar min-h-0 bg-[var(--bg-base)]">
      <div className="flex items-center gap-2 mb-4 border-b border-[var(--border-subtle)] pb-2 shrink-0">
        <Users size={16} className="text-[#00ffcc]" />
        <h2 className="text-sm font-bold text-[var(--text-primary)] font-[var(--font-heading)] tracking-wide">
          NPC Tracker
        </h2>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_60px_40px] gap-2 px-3 py-1.5 rounded bg-[var(--bg-panel)] border border-[var(--border-accent)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
          <div className="truncate">NPC</div>
          <div className="text-right truncate">Dist</div>
          <div className="text-center truncate">Track</div>
        </div>

        <div className="flex flex-col gap-1">
          {sortedNpcs.map(npc => {
            const isPinned = pinnedEntities.includes(npc);
            return (
              <div 
                key={npc}
                className={`grid grid-cols-[1fr_60px_40px] gap-2 px-3 py-2 items-center rounded border transition-colors ${
                  isPinned 
                    ? 'bg-amber-500/10 border-amber-500/30' 
                    : 'bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]'
                }`}
              >
                <div className="text-xs font-medium text-[var(--text-primary)]">{npc}</div>
                <div className="text-right text-[11px] font-mono text-[var(--text-secondary)]">N/A</div>
                <div className="flex justify-center">
                  <button
                    onClick={() => togglePin(npc)}
                    className={`p-1 rounded transition-colors ${
                      isPinned 
                        ? 'text-amber-400 bg-amber-400/20 hover:bg-amber-400/30' 
                        : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'
                    }`}
                    title={isPinned ? "Untrack NPC" : "Track NPC"}
                  >
                    <Crosshair size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
