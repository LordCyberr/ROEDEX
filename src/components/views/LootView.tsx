import React, { useState, useEffect } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen, Play, Square, Coins, Diamond, Activity, List, Settings2, Sword, Pickaxe, Axe, Leaf, Target, Map, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
    clearSession, sessionStartTime, setSessionStartTime,
    sessionMobsKilled, sessionTreesCut, sessionOresMined, sessionPlantsHarvested, sessionZonesVisited,
    runHistory, sessionSettings, updateSessionSettings, endSession, clearRunHistory
  } = useTrackerStore(useShallow(state => ({
    sessionActive: state.sessionActive,
    setSessionActive: state.setSessionActive,
    sessionRunes: state.sessionRunes,
    sessionLoot: state.sessionLoot,
    chestTotalValue: state.chestTotalValue,
    clearSession: state.clearSession,
    sessionStartTime: state.sessionStartTime,
    setSessionStartTime: state.setSessionStartTime,
    sessionMobsKilled: state.sessionMobsKilled,
    sessionTreesCut: state.sessionTreesCut,
    sessionOresMined: state.sessionOresMined,
    sessionPlantsHarvested: state.sessionPlantsHarvested,
    sessionZonesVisited: state.sessionZonesVisited,
    runHistory: state.runHistory,
    sessionSettings: state.sessionSettings,
    updateSessionSettings: state.updateSessionSettings,
    endSession: state.endSession,
    clearRunHistory: state.clearRunHistory
  })));

  const [activeTab, setActiveTab] = useState<'dashboard' | 'ledger' | 'settings'>('dashboard');
  const [now, setNow] = useState(Date.now());
  const [expandedRuns, setExpandedRuns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sessionActive) {
      setNow(Date.now());
      const interval = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(interval);
    }
  }, [sessionActive]);

  const sortedLoot = Object.entries(sessionLoot).sort((a, b) => b[1] - a[1]);
  const totalLootValue = sortedLoot.reduce((acc, [name, qty]) => acc + getResellValue(name, qty), 0);
  const totalWorth = sessionRunes + totalLootValue;

  const durationMs = sessionActive && sessionStartTime ? now - sessionStartTime : 0;
  const hours = durationMs / 3600000;
  const runesPerHour = sessionActive && hours > 0 ? Math.round(sessionRunes / hours) : 0;
  const valuePerHour = sessionActive && hours > 0 ? Math.round(totalWorth / hours) : 0;

  const formatDuration = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m ${s}s`;
    return `${m}m ${s}s`;
  };

  const handleToggleSession = () => {
    if (sessionActive) {
      endSession(totalLootValue);
    } else {
      clearSession();
      setSessionStartTime(Date.now());
      setSessionActive(true);
    }
  };

  const toggleRunDetails = (runId: string) => {
    setExpandedRuns(prev => ({ ...prev, [runId]: !prev[runId] }));
  };

  // Check goals
  const isTimeGoalMet = sessionSettings.timeAttackMinutes > 0 && durationMs >= sessionSettings.timeAttackMinutes * 60000;
  const isLootGoalMet = sessionSettings.lootValueGoal > 0 && totalWorth >= sessionSettings.lootValueGoal;

  const renderDashboard = () => (
    <div className="flex flex-col gap-1.5 h-full relative">
      {(isTimeGoalMet || isLootGoalMet) && sessionActive && (
        <div className="absolute inset-0 pointer-events-none rounded border-2 border-emerald-500/50 animate-pulse z-0"></div>
      )}
      
      <div className="flex items-center justify-between z-10">
        <button 
          onClick={handleToggleSession}
          className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded text-[11px] font-bold uppercase transition-all shadow-md ${
            sessionActive 
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
              : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
          }`}
        >
          {sessionActive ? <><Square size={12} fill="currentColor" /> Finish Run</> : <><Play size={12} fill="currentColor" /> Start New Run</>}
        </button>
      </div>

      <div className="flex items-center justify-between px-1.5 py-1 bg-black/20 rounded border border-white/[0.04] z-10">
        <div className="text-[14px] font-mono font-bold text-white tracking-widest">
          {formatDuration(durationMs)}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-slate-400 uppercase tracking-widest">Runes/Hr</span>
            <span className="text-yellow-400 font-mono text-[9px]">{runesPerHour.toLocaleString()}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-slate-400 uppercase tracking-widest">Worth/Hr</span>
            <span className="text-cyan-400 font-mono text-[9px]">{valuePerHour.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1 z-10">
        <div className="bg-black/30 border border-white/[0.04] rounded flex flex-col items-center justify-center py-1">
          <Sword size={10} className="text-rose-400 mb-0.5" />
          <span className="text-white font-mono font-bold text-[10px]">{sessionMobsKilled}</span>
        </div>
        <div className="bg-black/30 border border-white/[0.04] rounded flex flex-col items-center justify-center py-1">
          <Axe size={10} className="text-amber-600 mb-0.5" />
          <span className="text-white font-mono font-bold text-[10px]">{sessionTreesCut}</span>
        </div>
        <div className="bg-black/30 border border-white/[0.04] rounded flex flex-col items-center justify-center py-1">
          <Pickaxe size={10} className="text-slate-400 mb-0.5" />
          <span className="text-white font-mono font-bold text-[10px]">{sessionOresMined}</span>
        </div>
        <div className="bg-black/30 border border-white/[0.04] rounded flex flex-col items-center justify-center py-1">
          <Leaf size={10} className="text-emerald-500 mb-0.5" />
          <span className="text-white font-mono font-bold text-[10px]">{sessionPlantsHarvested}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1 z-10">
        <div className="bg-black/20 border border-white/[0.04] rounded p-1 flex flex-col items-center">
          <span className="text-[#5a6270] text-[7px] uppercase tracking-wider flex items-center gap-1"><Coins size={8} className="text-yellow-500" /> Runes</span>
          <span className="text-yellow-400 font-mono font-bold text-[11px]">{sessionRunes.toLocaleString()}</span>
        </div>
        <div className="bg-black/20 border border-[var(--border-accent)] rounded p-1 flex flex-col items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent"></div>
          <span className="text-cyan-400/80 text-[7px] uppercase tracking-wider flex items-center gap-1 z-10 font-bold"><Diamond size={8} /> Total Worth</span>
          <span className="text-cyan-400 font-mono font-bold text-[11px] z-10">{totalWorth.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 min-h-[60px] z-10">
        {sortedLoot.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#3a3f47] italic text-[9px] gap-1">
            <PackageOpen size={16} className="opacity-50" />
            No loot gathered yet
          </div>
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

  const renderLedger = () => {
    const totalHistoricalRunes = runHistory.reduce((acc, run) => acc + run.runes, 0);
    const totalHistoricalWorth = runHistory.reduce((acc, run) => acc + run.runes + run.lootWorth, 0);

    return (
      <div className="flex flex-col gap-1.5 h-full">
        <div className="bg-gradient-to-r from-[var(--bg-panel)] to-[var(--bg-base)] border border-[var(--border-subtle)] rounded p-1.5 flex justify-between items-center">
          <div>
            <div className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">All-Time Yield</div>
            <div className="text-yellow-400 font-mono text-[11px] font-black">{totalHistoricalRunes.toLocaleString()} Runes</div>
          </div>
          <div className="text-right">
            <div className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Total Worth</div>
            <div className="text-cyan-400 font-mono text-[11px] font-black">{totalHistoricalWorth.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-bold text-slate-300 tracking-wider">RUN HISTORY</span>
          {runHistory.length > 0 && (
            <button onClick={clearRunHistory} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-[8px] uppercase tracking-wider">
              <Trash2 size={10} /> Clear
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
          {runHistory.length === 0 ? (
            <div className="text-center text-[#3a3f47] italic py-4 text-[9px]">No completed runs yet</div>
          ) : (
            runHistory.map((run, index) => {
              const runWorth = run.runes + run.lootWorth;
              const isExpanded = !!expandedRuns[run.id];
              const runNumber = runHistory.length - index;

              return (
                <div key={run.id} className="bg-black/20 border border-white/[0.04] rounded flex flex-col">
                  <button 
                    onClick={() => toggleRunDetails(run.id)}
                    className="flex items-center justify-between p-1.5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-300">#{runNumber}</span>
                      <span className="text-[9px] font-mono text-slate-400">{formatDuration(run.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-mono text-[9px] font-bold">{runWorth.toLocaleString()}</span>
                      {isExpanded ? <ChevronUp size={12} className="text-slate-500" /> : <ChevronDown size={12} className="text-slate-500" />}
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="p-1.5 border-t border-white/[0.04] bg-black/40 flex flex-col gap-1">
                      <div className="flex justify-between text-[8px] text-slate-400">
                        <span>Runes: <span className="text-yellow-400">{run.runes.toLocaleString()}</span></span>
                        <span>Loot Worth: <span className="text-purple-400">{run.lootWorth.toLocaleString()}</span></span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center py-1 border-y border-white/[0.04]">
                        <span className="text-[8px] text-slate-400" title="Mobs Killed">⚔️ {run.mobsKilled}</span>
                        <span className="text-[8px] text-slate-400" title="Trees Cut">🪓 {run.treesCut}</span>
                        <span className="text-[8px] text-slate-400" title="Ores Mined">⛏️ {run.oresMined}</span>
                        <span className="text-[8px] text-slate-400" title="Plants Harvested">🌿 {run.plantsHarvested}</span>
                      </div>
                      {run.zonesVisited.length > 0 && (
                        <div className="text-[8px] text-slate-500 truncate" title={run.zonesVisited.join(' → ')}>
                          <Map size={8} className="inline mr-1" />
                          {run.zonesVisited.join(' → ')}
                        </div>
                      )}
                      
                      <div className="mt-1 flex flex-col gap-0.5">
                        <span className="text-[7px] uppercase tracking-widest text-slate-500 mb-0.5">Loot Breakdown</span>
                        {Object.entries(run.loot).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => (
                          <div key={name} className="flex justify-between text-[8px]">
                            <span className={`truncate ${getRarityColor(name)}`}>{name}</span>
                            <span className="font-mono text-emerald-400">x{qty}</span>
                          </div>
                        ))}
                        {Object.keys(run.loot).length > 5 && (
                          <div className="text-[7px] text-slate-500 text-center italic mt-0.5">
                            + {Object.keys(run.loot).length - 5} more items
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="flex flex-col gap-2 h-full p-1">
      <div className="text-[9px] font-bold text-slate-300 tracking-wider mb-1">RUN SETTINGS & GOALS</div>
      
      <div className="flex flex-col gap-1 bg-black/20 p-2 rounded border border-white/[0.04]">
        <label className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
            <Target size={12} className="text-rose-400" />
            Time Attack (Minutes)
          </div>
          <input 
            type="number" 
            min="0"
            max="1440"
            className="w-12 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white text-right font-mono focus:border-[var(--accent-primary)] focus:outline-none"
            value={sessionSettings.timeAttackMinutes || ''}
            placeholder="Off"
            onChange={(e) => updateSessionSettings({ timeAttackMinutes: parseInt(e.target.value) || 0 })}
          />
        </label>
        <div className="text-[8px] text-slate-500 leading-tight">
          Set a timer for your run. The dashboard will flash when you reach this time limit. Set to 0 to disable.
        </div>
      </div>

      <div className="flex flex-col gap-1 bg-black/20 p-2 rounded border border-white/[0.04]">
        <label className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
            <Diamond size={12} className="text-cyan-400" />
            Target Loot Worth
          </div>
          <input 
            type="number" 
            min="0"
            className="w-16 bg-black/50 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white text-right font-mono focus:border-[var(--accent-primary)] focus:outline-none"
            value={sessionSettings.lootValueGoal || ''}
            placeholder="Off"
            onChange={(e) => updateSessionSettings({ lootValueGoal: parseInt(e.target.value) || 0 })}
          />
        </label>
        <div className="text-[8px] text-slate-500 leading-tight">
          Set a combined total worth goal (Runes + Loot). The dashboard will flash when you reach this goal. Set to 0 to disable.
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full text-[10px]">
      {/* Tab Navigation */}
      <div className="flex p-1 gap-1 border-b border-white/[0.04] bg-black/20 shrink-0">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${activeTab === 'dashboard' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <Activity size={12} /> Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('ledger')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${activeTab === 'ledger' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <List size={12} /> Ledger
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`px-2 flex items-center justify-center py-1 rounded transition-colors ${activeTab === 'settings' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <Settings2 size={12} />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-1.5 relative">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'ledger' && renderLedger()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};
