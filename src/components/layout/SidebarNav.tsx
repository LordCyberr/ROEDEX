import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { PanelTop, PanelLeft, Settings, Lock, Unlock } from 'lucide-react';

export const SidebarNav: React.FC = () => {
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const setLayoutMode = useTrackerStore((state) => state.setLayoutMode);
  const isUILocked = useTrackerStore((state) => state.isUILocked);
  const setIsUILocked = useTrackerStore((state) => state.setIsUILocked);

  const toggleLayout = () => {
    setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical');
  };

  return (
    <div className="flex flex-col items-center py-2 px-1 gap-2 bg-[#0F141E]/80 backdrop-blur-md border-r border-white/5 w-12 shrink-0">
      <div className="text-white/50 mb-2 -rotate-90 text-[10px] tracking-[0.2em] font-bold whitespace-nowrap mt-8">
        ROEDEX V4
      </div>
      
      <div className="flex-1" />

      <button 
        onClick={() => setIsUILocked(!isUILocked)}
        className={`p-2 rounded-lg transition-colors pointer-events-auto ${isUILocked ? 'text-red-400 hover:text-red-300 bg-red-500/10' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
        title={isUILocked ? "Unlock UI" : "Lock UI (Click-Through Mode)"}
      >
        {isUILocked ? <Lock size={18} /> : <Unlock size={18} />}
      </button>

      <button 
        onClick={toggleLayout}
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors pointer-events-auto"
        title="Toggle Layout"
      >
        {layoutMode === 'vertical' ? <PanelTop size={18} /> : <PanelLeft size={18} />}
      </button>

      <button 
        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors pointer-events-auto"
        title="Settings"
      >
        <Settings size={18} />
      </button>
    </div>
  );
};
