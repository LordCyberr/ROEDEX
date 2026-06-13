import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';

export const BlackoutTutorial: React.FC = () => {
  const store = useTrackerStore();

  // Show if HUD enabled, chest is open, and tutorial not seen
  if (!store.minimalChestHud || !store.isChestOpen || store.minimalChestTutorialSeen) {
    return null;
  }

  const finishTutorial = () => {
    store.setMinimalChestTutorialSeen(true);
  };

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-auto bg-black/80 flex items-center justify-center">
      <div className="bg-[#1a1c23] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-xl font-black text-emerald-400 mb-2 uppercase tracking-widest">Minimal HUD Setup</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Welcome to the Minimal Chest HUD! I have extracted your values into draggable widgets.
          Follow these steps to set them up:
        </p>
        
        <div className="flex flex-col gap-4 text-left w-full mb-8">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">1</div>
            <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Drag the Backpack Value</strong> and place it above your inventory on the left side.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold shrink-0">2</div>
            <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Drag the Chest Value</strong> and place it above the house chest on the right side.</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0">3</div>
            <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-white">Drag the Red 'X' Zone</strong> directly over the game's X button. Click it to close the chest!</p>
          </div>
        </div>

        <button 
          onClick={finishTutorial}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-sm rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          Got it, I'm ready!
        </button>
      </div>
    </div>
  );
};
