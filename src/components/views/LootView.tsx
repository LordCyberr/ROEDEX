import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen, Play, Square, Coins, Diamond } from 'lucide-react';

import { getResellValue } from '../../data/prices';

const getRarityColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('god') || lower.includes('crystal') || lower.includes('gem')) return 'text-orange-400 font-bold';
  if (lower.includes('gold') || lower.includes('dino')) return 'text-fuchsia-400 font-bold';
  if (lower.includes('iron') || lower.includes('wolf') || lower.includes('spider')) return 'text-blue-400';
  if (lower.includes('copper') || lower.includes('slime') || lower.includes('boar')) return 'text-emerald-400';
  return 'text-slate-300';
};

export const LootView: React.FC = () => {
  const { 
    sessionActive, setSessionActive, 
    sessionRunes, sessionLoot, 
    chestTotalValue,
    clearSession, sessionStartTime, setSessionStartTime 
  } = useTrackerStore(useShallow(state => ({
    sessionActive: state.sessionActive,
    setSessionActive: state.setSessionActive,
    sessionRunes: state.sessionRunes,
    sessionLoot: state.sessionLoot,
    chestTotalValue: state.chestTotalValue,
    clearSession: state.clearSession,
    sessionStartTime: state.sessionStartTime,
    setSessionStartTime: state.setSessionStartTime
  })));

  const sortedLoot = Object.entries(sessionLoot).sort((a, b) => b[1] - a[1]);

  const totalLootValue = sortedLoot.reduce((acc, [name, qty]) => acc + getResellValue(name, qty), 0);
  const totalWorth = sessionRunes + totalLootValue;

  const handleToggleSession = () => {
    if (sessionActive) {
      setSessionActive(false);
    } else {
      clearSession();
      setSessionStartTime(Date.now());
      setSessionActive(true);
    }
  };

  const formatDuration = (start: number) => {
    const diff = Math.floor((Date.now() - start) / 1000);
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col gap-1 p-1.5 h-full text-[10px]">
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.04]">
        <div className="flex items-center gap-1 text-[#cfd2d5]">
          <PackageOpen size={12} className={sessionActive ? "text-emerald-400" : "text-[#5a6270]"} />
          <span className="font-bold uppercase tracking-wider">Session</span>
        </div>
        <button 
          onClick={handleToggleSession}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
            sessionActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
          }`}
        >
          {sessionActive ? <><Square size={10} /> End Run</> : <><Play size={10} /> Start Run</>}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1">
        <div className="bg-black/20 border border-white/[0.04] rounded p-1.5 flex flex-col items-center justify-center">
          <div className="text-[#5a6270] text-[8px] uppercase tracking-wider flex items-center gap-1">
            <Coins size={10} className="text-yellow-500" /> Runes
          </div>
          <div className="text-yellow-400 font-mono font-bold text-xs">
            {sessionRunes.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/20 border border-white/[0.04] rounded p-1.5 flex flex-col items-center justify-center">
          <div className="text-[#5a6270] text-[8px] uppercase tracking-wider flex items-center gap-1">
            <Diamond size={10} className="text-cyan-400" /> Session
          </div>
          <div className="text-cyan-400 font-mono font-bold text-xs">
            {totalWorth.toLocaleString()}
          </div>
        </div>
        <div className="bg-black/20 border border-[var(--border-accent)] rounded p-1.5 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
          <div className="text-amber-500/80 text-[8px] uppercase tracking-wider flex items-center gap-1 z-10 font-bold">
            <PackageOpen size={10} /> Chest
          </div>
          <div className="text-amber-400 font-mono font-bold text-xs z-10 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]">
            {chestTotalValue.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center px-1 text-[#5a6270] text-[8px] uppercase tracking-widest mt-0.5 mb-0.5">
        <span>Loot Log</span>
        {sessionStartTime && <span>{formatDuration(sessionStartTime)}</span>}
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 min-h-[60px]">
        {sortedLoot.length === 0 ? (
          <div className="text-center text-[#3a3f47] italic py-2 text-[9px]">No items gathered</div>
        ) : (
          sortedLoot.map(([name, quantity]) => (
            <div key={name} className="flex justify-between items-center bg-white/[0.02] px-1.5 py-[2px] rounded border border-white/[0.02]">
              <span className={`truncate pr-1 ${getRarityColor(name)}`}>{name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[#5a6270] font-mono text-[8px]">~{getResellValue(name, quantity)}c</span>
                <span className="font-mono text-emerald-400 font-bold">x{quantity}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

