import sys

def patch_npc():
    with open('src/components/views/NPCView.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove the "TRACK" header in Horizontal Mode
    content = content.replace("""<div className="grid grid-cols-[65px_1fr_30px] gap-1 px-2 py-1 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                      <div className="truncate">{t('columns.npc')}</div>
                      <div className="truncate">{t('columns.location')}</div>
                      <div className="text-center truncate">{t('columns.track')}</div>
                    </div>""", """<div className="grid grid-cols-[45px_1fr] gap-2 px-2 py-1 bg-[var(--bg-base)] border-b border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
                      <div className="truncate">{t('columns.npc')}</div>
                      <div className="truncate">{t('columns.location')}</div>
                    </div>""")

    # 2. Remove the "TRACK" button in Horizontal Mode
    content = content.replace("""<div 
                            key={npc.name}
                            className={`grid grid-cols-[65px_1fr_30px] gap-1 px-2 py-1.5 items-center rounded border transition-colors ${
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
                          </div>""", """<div 
                            key={npc.name}
                            className="grid grid-cols-[45px_1fr] gap-2 px-2 py-1.5 items-center rounded border transition-colors bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]"
                          >
                            <div className="text-[10px] font-bold text-[var(--text-primary)] truncate">{npc.name}</div>
                            <div 
                              className="text-[9px] text-[var(--text-secondary)] truncate hover:text-clip hover:whitespace-normal transition-all"
                              title={npc.location}
                            >
                              {npc.location}
                            </div>
                          </div>""")


    # 3. Remove the "TRACK" header in Vertical Mode
    content = content.replace("""<div className="grid grid-cols-[65px_1fr_30px] gap-1 px-3 py-1.5 mb-2 rounded bg-[var(--bg-panel)] border border-[var(--border-accent)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
              <div className="truncate">{t('columns.npc')}</div>
              <div className="truncate">{t('columns.location')}</div>
              <div className="text-center truncate">{t('columns.track')}</div>
            </div>""", """<div className="grid grid-cols-[45px_1fr] gap-2 px-3 py-1.5 mb-2 rounded bg-[var(--bg-panel)] border border-[var(--border-accent)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider shrink-0">
              <div className="truncate">{t('columns.npc')}</div>
              <div className="truncate">{t('columns.location')}</div>
            </div>""")

    # 4. Remove the "TRACK" button in Vertical Mode
    content = content.replace("""<div 
                              key={npc.name}
                              className={`grid grid-cols-[65px_1fr_30px] gap-1 px-2 py-2 items-center rounded border transition-colors ${
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
                            </div>""", """<div 
                              key={npc.name}
                              className="grid grid-cols-[45px_1fr] gap-2 px-2 py-2 items-center rounded border transition-colors bg-[var(--bg-hover)] border-transparent hover:border-[var(--border-subtle)]"
                            >
                              <div className="text-[11px] font-bold text-[var(--text-primary)] truncate">{npc.name}</div>
                              <div 
                                className="text-[10px] text-[var(--text-secondary)] truncate hover:text-clip hover:whitespace-normal transition-all"
                                title={npc.location}
                              >
                                {npc.location}
                              </div>
                            </div>""")

    with open('src/components/views/NPCView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch_npc()
