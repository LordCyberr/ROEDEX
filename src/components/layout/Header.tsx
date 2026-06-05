import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { Activity, Minus, Maximize2, PanelLeft, PanelTop, Globe2, Star, PackageOpen, Settings, Users } from 'lucide-react';

export interface HeaderProps {
  onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({ onPointerDown }) => {
  const connected = useTrackerStore((state) => state.connected);
  const isMinimized = useTrackerStore((state) => state.isMinimized);
  const setIsMinimized = useTrackerStore((state) => state.setIsMinimized);
  
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const activeTab = useTrackerStore((state) => state.activeTab);
  const setActiveTab = useTrackerStore((state) => state.setActiveTab);
  const setLayoutMode = useTrackerStore((state) => state.setLayoutMode);

  const tabs = [
    { id: 'global', icon: Globe2, label: 'Global Data' },
    { id: 'favorites', icon: Star, label: 'Favorites' },
    { id: 'session', icon: PackageOpen, label: 'Session & Loot' },
    { id: 'npcs', icon: Users, label: 'NPCs & Players' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ] as const;

  return (
    <div 
      onPointerDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onPointerDown?.(e);
      }}
      className={`flex items-center justify-between bg-[var(--bg-base)] border-b border-[var(--border-subtle)] shrink-0 select-none cursor-grab active:cursor-grabbing relative z-50 overflow-hidden ${
        layoutMode === 'horizontal' ? 'px-4 py-1' : 'px-3 py-1'
      }`}
    >
      <div className="flex items-center shrink-0 group relative">
        <Activity size={layoutMode === 'horizontal' ? 16 : 14} strokeWidth={2.5} className={connected ? "text-[#00ffcc]" : "text-rose-500"} />
        <div className="absolute top-full mt-2 left-0 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl">
          {connected ? 'Connected to ROE' : 'Disconnected'}
        </div>
      </div>
      
      <div className={`flex items-center mx-auto justify-center bg-[var(--bg-panel)]/50 rounded-full border border-[var(--border-subtle)] shadow-inner ${
        layoutMode === 'horizontal' ? 'gap-4 px-4 py-0.5' : 'gap-1 px-2 py-0.5 ml-2 mr-2'
      }`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`group relative transition-all duration-200 flex items-center justify-center ${
              layoutMode === 'horizontal' ? 'p-1.5 rounded-xl' : 'p-1 rounded-lg'
            } ${
              activeTab === tab.id 
                ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] shadow-[0_0_8px_rgba(0,0,0,0)] shadow-[var(--accent-primary)]/10 ring-1 ring-[var(--accent-primary)]/50' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
            }`}
          >
            <tab.icon size={layoutMode === 'horizontal' ? 16 : 13} strokeWidth={2} />
            <div className={`absolute top-full left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl ${
              layoutMode === 'horizontal' ? 'mt-3' : 'mt-2'
            }`}>
              {tab.label}
            </div>
          </button>
        ))}
      </div>

      <div className={`flex items-center shrink-0 ${layoutMode === 'horizontal' ? 'gap-2' : 'gap-1'}`}>
        <button 
          onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
          className={`group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center ${
            layoutMode === 'horizontal' ? 'p-1.5' : 'p-1'
          }`}
        >
          {layoutMode === 'vertical' ? <PanelTop size={14} /> : <PanelLeft size={16} />}
          <div className="absolute top-full mt-2 right-0 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl">
            Toggle Layout
          </div>
        </button>
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className={`group relative rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all duration-200 flex items-center justify-center ${
            layoutMode === 'horizontal' ? 'p-1.5' : 'p-1'
          }`}
        >
          {isMinimized ? <Maximize2 size={layoutMode === 'horizontal' ? 16 : 14} /> : <Minus size={layoutMode === 'horizontal' ? 16 : 14} />}
          <div className="absolute top-full mt-2 right-0 px-2 py-1 bg-black/90 border border-[var(--border-subtle)] text-[var(--text-primary)] text-[10px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-[100] font-bold tracking-wider uppercase shadow-xl">
            {isMinimized ? "Maximize" : "Minimize"}
          </div>
        </button>
      </div>
    </div>
  );
};
