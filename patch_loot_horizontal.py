import sys

def patch_loot():
    with open('src/components/views/LootView.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where to insert layoutMode
    # export const LootView: React.FC = () => {
    #   const { ... } = useTrackerStore(...)
    
    # We need to add `layoutMode` to the destructured store or just use it directly
    if 'const layoutMode =' not in content:
        insert_idx = content.find('const [activeTab, setActiveTab]')
        if insert_idx != -1:
            content = content[:insert_idx] + "const layoutMode = useTrackerStore(state => state.layoutMode);\n  const isHorizontal = layoutMode === 'horizontal';\n\n  " + content[insert_idx:]

    start_idx = content.find('return (\n    <div className="flex flex-col h-full text-[10px]">')
    if start_idx == -1:
        print("Could not find return in LootView")
        return
    
    pre_return = content[:start_idx]
    
    new_return = """if (isHorizontal) {
    return (
      <div className="flex flex-col h-full text-[10px] bg-[var(--bg-base)]">
        <div className="flex items-center justify-between p-2 border-b border-[var(--border-subtle)] shrink-0">
          <h2 className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)] font-[var(--font-heading)] tracking-wide uppercase">
            <PackageOpen size={14} className="text-[#00ffcc]" />
            SESSION & LOOT
          </h2>
          <button 
            onClick={() => setActiveTab(activeTab === 'settings' ? 'dashboard' : 'settings')}
            className={`px-2 flex items-center justify-center py-1 rounded transition-colors ${activeTab === 'settings' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
          >
            <Settings2 size={12} /> {activeTab === 'settings' ? 'Close Settings' : 'Settings'}
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-2 relative">
          {activeTab === 'settings' ? renderSettings() : (
            <div className="flex flex-row h-full gap-3">
              <div className="w-[200px] shrink-0 h-full overflow-y-auto custom-scrollbar border-r border-[var(--border-subtle)] pr-3">
                {renderDashboard()}
              </div>
              <div className="flex-1 h-full overflow-y-auto custom-scrollbar pl-1">
                {renderLedger()}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-[10px]">
"""
    
    content = pre_return + new_return + content[start_idx + len('return (\n    <div className="flex flex-col h-full text-[10px]">'):]
    
    with open('src/components/views/LootView.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

patch_loot()
