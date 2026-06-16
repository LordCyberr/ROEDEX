import React, { useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen, Play, Square, Coins, Diamond, Sword, Pickaxe, Axe, Leaf, Trash2, History } from 'lucide-react';

import { getResellValue } from '../../../data/prices';
import { getItemInfo } from '../../../data/rarity';
import { useGlobalTick } from '../../../core/tick';
import { BobCompanion } from '../../../core/companion/BobCompanion';
import { Tooltip } from '../../ui/Tooltip';
import { formatDuration } from '../../../utils/formatters';

const getRarityColor = (name: string) => {
  const info = getItemInfo(name);
  if (!info) return 'text-slate-300';
  switch (info.rarity) {
    case 'uncommon': return 'text-blue-400 font-medium';
    case 'rare': return 'text-green-400 font-bold';
    case 'mythic': return 'text-purple-400 font-black';
    case 'common':
    default: return 'text-slate-300';
  }
};

const isResource = (name: string) => {
  const lowerName = name.toLowerCase();
  const keywords = ['ore', 'rock', 'copper', 'iron', 'gold', 'tree', 'wood', 'log', 'leaf', 'weed', 'vine', 'petal', 'lily', 'spore', 'flower', 'mushroom'];
  return keywords.some(kw => lowerName.includes(kw));
};

export const SessionTab: React.FC<{ isHorizontal: boolean; compactHeightClass: string }> = ({ isHorizontal, compactHeightClass }) => {
  const { 
    sessionActive, setSessionActive, 
    sessionRunes, sessionLoot, 
    clearSession, sessionStartTime, setSessionStartTime,
    sessionMobsKilled, sessionTreesCut, sessionOresMined, sessionPlantsHarvested,
    sessionSettings, endSession
  } = useTrackerStore(useShallow((state: any) => ({
    sessionActive: state.sessionActive,
    setSessionActive: state.setSessionActive,
    sessionRunes: state.sessionRunes,
    sessionLoot: state.sessionLoot,
    clearSession: state.clearSession,
    setIsRunHistoryOpen: state.setIsRunHistoryOpen,
    sessionStartTime: state.sessionStartTime,
    setSessionStartTime: state.setSessionStartTime,
    sessionMobsKilled: state.sessionMobsKilled,
    sessionTreesCut: state.sessionTreesCut,
    sessionOresMined: state.sessionOresMined,
    sessionPlantsHarvested: state.sessionPlantsHarvested,
    sessionSettings: state.sessionSettings,
    endSession: state.endSession,
  })));

  const now = useGlobalTick();
  
  const sortedLoot = useMemo(() => Object.entries(sessionLoot as Record<string, number>).sort((a, b) => b[1] - a[1]), [sessionLoot]);
  const totalLootValue = useMemo(() => sortedLoot.reduce((acc, [name, qty]) => acc + getResellValue(name, qty), 0), [sortedLoot]);
  const totalWorth = sessionRunes + totalLootValue;

  const durationMs = sessionActive && sessionStartTime ? now - sessionStartTime : 0;
  
  const mobDropsValue = useMemo(() => sortedLoot.reduce((acc, [name, qty]) => {
    if (!isResource(name)) return acc + getResellValue(name, qty);
    return acc;
  }, 0), [sortedLoot]);

  const handleToggleSession = () => {
    if (sessionActive) {
      endSession(totalLootValue);
    } else {
      clearSession();
      setSessionStartTime(Date.now());
      setSessionActive(true);
    }
  };

  const isTimeGoalMet = sessionSettings.timeAttackMinutes > 0 && durationMs >= sessionSettings.timeAttackMinutes * 60000;
  const isLootGoalMet = sessionSettings.lootValueGoal > 0 && totalWorth >= sessionSettings.lootValueGoal;

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-2 h-full w-full`}>
      {/* Left Card: Session Controls */}
      <div className={`flex flex-col gap-2 ${isHorizontal ? 'w-[180px]' : 'w-full'} shrink-0 h-fit bg-black/20 border border-white/[0.05] p-2 rounded-lg relative overflow-y-auto custom-scrollbar`}>
        {(isTimeGoalMet || isLootGoalMet) && sessionActive && (
          <div className="absolute inset-0 pointer-events-none rounded border-2 border-emerald-500/50 animate-pulse z-0"></div>
        )}
        
        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              onClick={handleToggleSession}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[10px] font-bold uppercase transition-all shadow-md ${
                sessionActive 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                  : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
              }`}
            >
              {sessionActive ? <><Square size={10} fill="currentColor" /> Finish Run</> : <><Play size={10} fill="currentColor" /> Start New Run</>}
            </button>
            <Tooltip content="Reset Current Loot">
              <button
                onClick={() => {
                  clearSession();
                  BobCompanion.onClearLoot();
                }}
                className="flex items-center justify-center px-2 py-1.5 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] border border-[var(--border-subtle)] transition-all shadow-md"
              >
                <Trash2 size={10} />
              </button>
            </Tooltip>
            <Tooltip content="View Past Runs">
              <button
                onClick={() => useTrackerStore.getState().setIsRunHistoryOpen(true)}
                className="flex items-center justify-center px-2 py-1.5 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] border border-[var(--border-subtle)] transition-all shadow-md"
              >
                <History size={10} />
              </button>
            </Tooltip>
          </div>

          <div className="flex items-center justify-between px-2 py-1 bg-black/30 rounded border border-white/[0.04] shrink-0">
            <div className="text-[14px] font-mono font-black text-white tracking-widest drop-shadow">
              {formatDuration(durationMs)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 shrink-0">
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Sword size={12} className="text-rose-400" />
              <span className="text-white font-mono font-black text-[11px]">{sessionMobsKilled as number}</span>
            </div>
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Axe size={12} className="text-amber-600" />
              <span className="text-white font-mono font-black text-[11px]">{sessionTreesCut as number}</span>
            </div>
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Pickaxe size={12} className="text-slate-400" />
              <span className="text-white font-mono font-black text-[11px]">{sessionOresMined as number}</span>
            </div>
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Leaf size={12} className="text-emerald-500" />
              <span className="text-white font-mono font-black text-[11px]">{sessionPlantsHarvested as number}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 shrink-0 pt-0.5">
            <div className="bg-black/30 border border-[var(--border-accent)] rounded px-2 py-1.5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
              <span className="text-cyan-400/80 text-[7px] uppercase tracking-wider flex items-center gap-1 z-10 font-bold"><Diamond size={8} /> Total Worth</span>
              <span className="text-cyan-400 font-mono font-black text-[12px] z-10">{totalWorth.toLocaleString()}</span>
            </div>
            <div className="bg-black/30 border border-white/[0.04] rounded px-2 py-1 flex items-center justify-between">
              <span className="text-[#5a6270] text-[7px] uppercase tracking-wider flex items-center gap-1"><Coins size={8} className="text-yellow-500" /> Runes Drop By Mobs</span>
              <span className="text-yellow-400 font-mono font-black text-[10px]">{sessionRunes.toLocaleString()}</span>
            </div>
            <div className="bg-black/30 border border-white/[0.04] rounded px-2 py-1 flex items-center justify-between">
              <span className="text-[#5a6270] text-[7px] uppercase tracking-wider flex items-center gap-1"><Sword size={8} className="text-rose-400" /> Value of Mob Drops</span>
              <span className="text-rose-400 font-mono font-black text-[10px]">{mobDropsValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-0.5 bg-black/20 border border-white/[0.05] p-2 rounded-lg overflow-hidden h-full z-10">
        <div className={`flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 min-h-[60px] ${compactHeightClass}`}>
          {sortedLoot.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#3a3f47] italic text-[9px] gap-1">
              <PackageOpen size={16} className="opacity-50" />
              No loot gathered yet
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-1.5 py-0.5 mt-1 border-b border-white/5">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Item</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right">Count</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-14 text-right">Total</span>
                </div>
              </div>
              {sortedLoot.map(([name, quantity]) => {
                const totalRunes = getResellValue(name, quantity);
                const unitPrice = getResellValue(name, 1);
                const displayTotal = totalRunes >= 1000 ? (totalRunes / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : totalRunes;
                return (
                  <div key={name} className="flex justify-between items-center bg-white/[0.02] px-1.5 py-[2px] rounded border border-white/[0.02]">
                    <Tooltip content={name}><span className={`truncate pr-1 ${getRarityColor(name)}`}>{name}</span></Tooltip>
                    <Tooltip content={`Unit Value: ${unitPrice > 0 ? unitPrice : '-'}`}>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{quantity}</span>
                        <Tooltip content={totalRunes.toLocaleString()}><span className="text-[#5a6270] font-mono text-[9px] w-14 text-right">{displayTotal}</span></Tooltip>
                      </div>
                    </Tooltip>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
