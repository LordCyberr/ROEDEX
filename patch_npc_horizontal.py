import sys

def patch_npc():
    with open('src/components/views/NPCView.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We will replace the entire return block of NPCView.
    # Find the start of `return (`
    start_idx = content.find('return (')
    if start_idx == -1:
        print("Could not find return in NPCView")
        return
    
    pre_return = content[:start_idx]
    
    new_return = """return (
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
          onChange={handleSearchChange}
          onKeyDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          onKeyUp={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
          onKeyPress={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
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
              <div className="flex flex-col gap-0.5 w-[140px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md p-1.5 border border-[var(--border-subtle)] h-fit max-h-full overflow-y-auto custom-scrollbar">
                {zones.map(zone => (
                  <a
                    key={`nav-${zone}`}
                    href={`#npc-${zone.replace(/\s+/g, '-')}`}
                    className="flex items-center justify-between text-[9px] font-black text-[var(--accent-primary)] hover:text-white transition-colors uppercase tracking-widest px-2 py-1.5 border-b border-[var(--border-subtle)] mb-0.5"
                  >
                    <span>{zone}</span>
                    <ChevronRight size={10} />
                  </a>
                ))}
              </div>

              {/* Main Content Columns */}
              <div className="flex flex-row gap-2 overflow-x-auto custom-scrollbar flex-1 pb-2 h-full items-start">
                {zones.map(zone => (
                  <div key={zone} id={`npc-${zone.replace(/\s+/g, '-')}`} className="flex flex-col w-[260px] shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md border border-[var(--border-subtle)] h-fit max-h-full">
                    {/* Zone Header */}
                    <div className="px-2 py-1.5 bg-[var(--bg-panel)] border-b border-[var(--border-subtle)] rounded-t-lg">
                      <h3 className="text-[10px] font-black text-[var(--accent-primary)] uppercase tracking-widest">{zone}</h3>
                    </div>
                    {/* Embedded Table Header */}
                    <div className="grid grid-cols-[55px_1fr_30px] gap-1 px-2 py-1 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                      <div className="truncate">{t('columns.npc')}</div>
                      <div className="truncate">{t('columns.location')}</div>
                      <div className="text-center truncate">{t('columns.track')}</div>
                    </div>
                    {/* Card List */}
                    <div className="flex flex-col overflow-y-auto custom-scrollbar p-1 gap-1">
                      {groupedNpcs[zone].map(npc => {
                        const isPinned = pinnedEntities.includes(npc.name);
                        return (
                          <div 
                            key={npc.name}
                            className={`grid grid-cols-[55px_1fr_30px] gap-1 px-1 py-1.5 items-center rounded border transition-colors ${
                              isPinned 
                                ? 'bg-amber-500/10 border-amber-500/30' 
                                : 'bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]'
                            }`}
                          >
                            <div className="text-[10px] font-bold text-[var(--text-primary)] truncate">{npc.name}</div>
                            <div 
                              className="text-[9px] text-[var(--text-secondary)] truncate hover:text-clip hover:whitespace-normal transition-all"
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
                                <Crosshair size={12} />
                              </button>
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
            <div className="grid grid-cols-[55px_1fr_30px] gap-1 px-3 py-1.5 mb-2 rounded bg-[var(--bg-panel)] border border-[var(--border-accent)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
              <div className="truncate">{t('columns.npc')}</div>
              <div className="truncate">{t('columns.location')}</div>
              <div className="text-center truncate">{t('columns.track')}</div>
            </div>
          )}

          <div className="flex flex-col flex-1 min-h-0 overflow-y-auto gap-2 max-h-[250px] custom-scrollbar pb-2 pr-2">
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
                      {zone}
                    </button>

                    {!isCollapsed && (
                      <div className="flex flex-col gap-1 pl-1">
                        {groupedNpcs[zone].map(npc => {
                          const isPinned = pinnedEntities.includes(npc.name);
                          return (
                            <div 
                              key={npc.name}
                              className={`grid grid-cols-[55px_1fr_30px] gap-1 px-2 py-2 items-center rounded border transition-colors ${
                                isPinned 
                                  ? 'bg-amber-500/10 border-amber-500/30' 
                                  : 'bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]'
                              }`}
                            >
                              <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{npc.name}</div>
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
                                  <Crosshair size={13} />
                                </button>
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
"""
    
    with open('src/components/views/NPCView.tsx', 'w', encoding='utf-8') as f:
        f.write(pre_return + new_return)

patch_npc()
