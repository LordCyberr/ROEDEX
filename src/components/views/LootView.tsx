import React, { useState, useEffect } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen, Play, Square, Coins, Diamond, Activity, Sword, Pickaxe, Axe, Leaf, Trash2, User } from 'lucide-react';

import { getResellValue } from '../../data/prices';
import { getItemInfo } from '../../data/rarity';

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

const getRarityWeight = (name: string) => {
  const info = getItemInfo(name);
  if (!info) return 0;
  switch (info.rarity) {
    case 'mythic': return 3;
    case 'rare': return 2;
    case 'uncommon': return 1;
    case 'common':
    default: return 0;
  }
};

export const LootView: React.FC = () => {
  const { 
    sessionActive, setSessionActive, 
    sessionRunes, sessionLoot, chestInventory,
    clearSession, sessionStartTime, setSessionStartTime,
    sessionMobsKilled, sessionTreesCut, sessionOresMined, sessionPlantsHarvested,
    sessionSettings, endSession,
    playerProfile, lifetimeStats
  } = useTrackerStore(useShallow(state => ({
    sessionActive: state.sessionActive,
    setSessionActive: state.setSessionActive,
    sessionRunes: state.sessionRunes,
    sessionLoot: state.sessionLoot,
    chestTotalValue: state.chestTotalValue,
    chestInventory: state.chestInventory,
    clearSession: state.clearSession,
    sessionStartTime: state.sessionStartTime,
    setSessionStartTime: state.setSessionStartTime,
    sessionMobsKilled: state.sessionMobsKilled,
    sessionTreesCut: state.sessionTreesCut,
    sessionOresMined: state.sessionOresMined,
    sessionPlantsHarvested: state.sessionPlantsHarvested,
    sessionZonesVisited: state.sessionZonesVisited,
    sessionSettings: state.sessionSettings,
    endSession: state.endSession,
    playerProfile: state.playerProfile,
    lifetimeStats: state.lifetimeStats
  })));


  const [activeTab, setActiveTab] = useState<'profile' | 'session' | 'chest'>('profile');
  const [now, setNow] = useState(Date.now());

  // Chest Tab State
  const [includeRunesInChest, setIncludeRunesInChest] = useState(false);
  const [chestSortBy, setChestSortBy] = useState<'value' | 'count' | 'rarity'>('value');
  const [excludedItems, setExcludedItems] = useState<Set<string>>(new Set());

  const toggleExclude = (name: string) => {
    setExcludedItems(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

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

  // Check goals
  const isTimeGoalMet = sessionSettings.timeAttackMinutes > 0 && durationMs >= sessionSettings.timeAttackMinutes * 60000;
  const isLootGoalMet = sessionSettings.lootValueGoal > 0 && totalWorth >= sessionSettings.lootValueGoal;

  const renderProfile = () => {
    const pct = playerProfile.runesRequired > 0 ? Math.min(100, Math.floor((playerProfile.currentRunes / playerProfile.runesRequired) * 100)) : 0;
    
    const getTotal = (record: Record<string, number>) => Object.values(record).reduce((a, b) => a + b, 0);
    const totalMobs = getTotal(lifetimeStats.mobsKilled);
    const totalOres = getTotal(lifetimeStats.oresMined);
    const totalTrees = getTotal(lifetimeStats.treesCut);
    const totalPlants = getTotal(lifetimeStats.plantsHarvested);

    return (
      <div className="flex flex-col gap-2 h-full relative overflow-y-auto custom-scrollbar pr-1">
        
        {/* Profile Header */}
        <div className="flex items-center gap-3 bg-black/30 border border-white/[0.05] p-2 rounded-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="3" strokeDasharray={`${pct}, 100`} />
             </svg>
             <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[7px] text-emerald-400/80 uppercase font-bold tracking-widest -mb-1">LVL</span>
                <span className="text-[14px] font-black text-white">{playerProfile.level}</span>
             </div>
          </div>
          
          <div className="flex flex-col flex-1 z-10">
             <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-0.5 truncate">{playerProfile.name || 'Player Profile'}</div>
             <div className="flex items-center justify-between text-[9px] mb-1 gap-2">
                <span className="text-slate-400 truncate">Runes to Level Up</span>
                <span className="text-emerald-400 font-mono font-bold shrink-0">{playerProfile.currentRunes.toLocaleString()} / {playerProfile.runesRequired.toLocaleString()}</span>
             </div>
             <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-400/80 rounded-full" style={{ width: `${pct}%` }}></div>
             </div>
          </div>
        </div>

        {/* Lifetime Stats */}
        <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mt-1 mb-0.5 px-1">Lifetime Statistics</div>
        <div className="grid grid-cols-2 gap-1.5">
          <div className="bg-gradient-to-br from-black/40 to-rose-900/10 border border-rose-500/20 p-2 rounded flex flex-col hover:border-rose-500/40 transition-colors">
             <div className="flex justify-between items-center mb-1">
               <span className="text-rose-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Sword size={10} /> Combat</span>
               <span className="text-white font-mono text-[11px] font-black">{totalMobs.toLocaleString()}</span>
             </div>
             <div className="flex flex-col gap-0.5 text-[8px] text-slate-400 mt-1">
                {Object.entries(lifetimeStats.mobsKilled).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                   <div key={k} className="flex justify-between">
                     <span className="truncate pr-1">{k}</span>
                     <span className="font-mono text-rose-300">{v}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-black/40 to-slate-800/20 border border-slate-500/20 p-2 rounded flex flex-col hover:border-slate-500/40 transition-colors">
             <div className="flex justify-between items-center mb-1">
               <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Pickaxe size={10} /> Mining</span>
               <span className="text-white font-mono text-[11px] font-black">{totalOres.toLocaleString()}</span>
             </div>
             <div className="flex flex-col gap-0.5 text-[8px] text-slate-400 mt-1">
                {Object.entries(lifetimeStats.oresMined).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                   <div key={k} className="flex justify-between">
                     <span className="truncate pr-1">{k}</span>
                     <span className="font-mono text-slate-300">{v}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-black/40 to-amber-900/10 border border-amber-500/20 p-2 rounded flex flex-col hover:border-amber-500/40 transition-colors">
             <div className="flex justify-between items-center mb-1">
               <span className="text-amber-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Axe size={10} /> Logging</span>
               <span className="text-white font-mono text-[11px] font-black">{totalTrees.toLocaleString()}</span>
             </div>
             <div className="flex flex-col gap-0.5 text-[8px] text-slate-400 mt-1">
                {Object.entries(lifetimeStats.treesCut).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                   <div key={k} className="flex justify-between">
                     <span className="truncate pr-1">{k}</span>
                     <span className="font-mono text-amber-300">{v}</span>
                   </div>
                ))}
             </div>
          </div>

          <div className="bg-gradient-to-br from-black/40 to-emerald-900/10 border border-emerald-500/20 p-2 rounded flex flex-col hover:border-emerald-500/40 transition-colors">
             <div className="flex justify-between items-center mb-1">
               <span className="text-emerald-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Leaf size={10} /> Foraging</span>
               <span className="text-white font-mono text-[11px] font-black">{totalPlants.toLocaleString()}</span>
             </div>
             <div className="flex flex-col gap-0.5 text-[8px] text-slate-400 mt-1">
                {Object.entries(lifetimeStats.plantsHarvested).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                   <div key={k} className="flex justify-between">
                     <span className="truncate pr-1">{k}</span>
                     <span className="font-mono text-emerald-300">{v}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    );
  };

  const renderSession = () => (
    <div className="flex flex-col gap-1.5 h-full relative">
      {(isTimeGoalMet || isLootGoalMet) && sessionActive && (
        <div className="absolute inset-0 pointer-events-none rounded border-2 border-emerald-500/50 animate-pulse z-0"></div>
      )}
      
      <div className="flex items-center gap-1.5 z-10">
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
        <button
          onClick={clearSession}
          title="Reset Current Loot"
          className="flex items-center justify-center px-2 py-1.5 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] border border-[var(--border-subtle)] transition-all shadow-md"
        >
          <Trash2 size={12} />
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
          <>
            <div className="flex justify-between items-center px-1.5 py-0.5 mt-1 border-b border-white/5">
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Item</span>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-16 text-right">Total Runes</span>
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right">Count</span>
              </div>
            </div>
            {sortedLoot.map(([name, quantity]) => (
              <div key={name} className="flex justify-between items-center bg-white/[0.02] px-1.5 py-[2px] rounded border border-white/[0.02]">
                <span className={`truncate pr-1 ${getRarityColor(name)}`}>{name}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-[#5a6270] font-mono text-[9px] w-16 text-right">{getResellValue(name, quantity)}</span>
                  <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{quantity}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );

  const renderChest = () => {
    const combinedInventory: Record<string, number> = { ...chestInventory };

    if (includeRunesInChest && playerProfile.currentRunes > 0) {
       combinedInventory['Runes'] = (combinedInventory['Runes'] || 0) + playerProfile.currentRunes;
    }

    const chestItemsListAll = Object.entries(combinedInventory).map(([name, count]) => {
       const unitVal = getResellValue(name, 1);
       const totVal = getResellValue(name, count);
       return { name, count, unitVal, totVal };
    }).filter(i => i.count > 0);

    chestItemsListAll.sort((a, b) => {
       if (chestSortBy === 'value') return b.totVal - a.totVal;
       if (chestSortBy === 'count') return b.count - a.count;
       if (chestSortBy === 'rarity') {
          const wA = getRarityWeight(a.name);
          const wB = getRarityWeight(b.name);
          if (wA !== wB) return wB - wA;
          return b.totVal - a.totVal;
       }
       return 0;
    });

    const displayTotalValue = chestItemsListAll.reduce((acc, i) => acc + (excludedItems.has(i.name) ? 0 : i.totVal), 0);
    const chestItemsListUI = chestItemsListAll;

    const isToolOrWeapon = (name: string) => {
       const n = name.toLowerCase();
       return n.includes('sword') || n.includes('pickaxe') || n.includes('axe') || n.includes('tool') || n.includes('weapon');
    };

    const inventoryLootValue = Object.entries(chestInventory).reduce((acc, [name, qty]) => {
      if (isToolOrWeapon(name)) return acc;
      if (name.toLowerCase() === 'runes' || name.toLowerCase() === 'runestone') return acc;
      return acc + getResellValue(name, qty);
    }, 0);

    return (
      <div className="flex flex-col gap-1.5 h-full relative">
        
        {/* Simplified Chest Header */}
        <div className="flex items-center justify-between bg-black/20 p-2 border border-white/5 rounded shrink-0">
          <div className="flex items-center gap-4">
            <div title="Total value of all items in your inventory, including tools and weapons">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help">Total Worth</span>
              <div className="text-white font-mono font-black text-[12px] leading-none mt-0.5">{displayTotalValue.toLocaleString()}</div>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div title="Total value of gathered resources and materials, excluding tools and weapons">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help text-emerald-500/80">Loot Value</span>
              <div className="text-emerald-400 font-mono font-black text-[12px] leading-none mt-0.5">{inventoryLootValue.toLocaleString()}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={chestSortBy} 
              onChange={(e) => setChestSortBy(e.target.value as any)}
              className="bg-black/40 text-[8px] text-slate-300 outline-none uppercase tracking-widest font-bold cursor-pointer p-1 rounded border border-white/5"
              title="Sort the inventory list below"
            >
              <option value="value">Value</option>
              <option value="count">Count</option>
              <option value="rarity">Rarity</option>
            </select>
            <button 
              onClick={() => setIncludeRunesInChest(!includeRunesInChest)} 
              className={`text-[8px] font-bold uppercase p-1 rounded border transition-colors ${includeRunesInChest ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-black/40 text-slate-400 border-white/5'}`}
              title="Include your current Runes balance in the 'Total Worth' calculation"
            >
              Runes
            </button>
          </div>
        </div>

        {/* Chest List */}
        <div className="flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {chestItemsListUI.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#3a3f47] italic text-[9px] gap-1 py-4">
              <PackageOpen size={16} className="opacity-50" />
              Inventory is empty
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-1.5 py-0.5 mt-1 border-b border-white/5">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest pl-5">Item</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right" title="Unit Value">Unit</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right">Count</span>
                  <span className="text-[8px] text-purple-400/80 font-bold uppercase tracking-widest w-16 text-right" title="Total Value">Total</span>
                </div>
              </div>
              {chestItemsListUI.map((item) => {
                const isExcluded = excludedItems.has(item.name);
                return (
                  <div key={item.name} className={`flex justify-between items-center px-1.5 py-1 rounded border hover:bg-white/[0.04] transition-colors ${isExcluded ? 'bg-white/[0.01] border-transparent opacity-50' : 'bg-white/[0.02] border-white/[0.02]'}`}>
                    <div className="flex items-center gap-1.5 overflow-hidden pr-1 flex-1">
                      <button onClick={() => toggleExclude(item.name)} className="shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded bg-black/40 border border-white/10 hover:border-white/30 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full ${isExcluded ? 'bg-transparent' : 'bg-emerald-500'}`}></div>
                      </button>
                      <div className="flex flex-col truncate">
                        <span className={`truncate text-[10px] ${isExcluded ? 'text-slate-500 line-through' : getRarityColor(item.name)}`}>{item.name}</span>
                        {getItemInfo(item.name)?.rarity && (
                          <span className={`text-[7px] uppercase tracking-widest opacity-80 -mt-0.5 ${isExcluded ? 'text-slate-600' : getRarityColor(item.name)}`}>{getItemInfo(item.name)?.rarity}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[#5a6270] font-mono text-[9px] w-12 text-right">{item.unitVal > 0 ? item.unitVal : '-'}</span>
                      <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{item.count}</span>
                      <span className={`${isExcluded ? 'text-slate-600' : 'text-purple-300'} font-mono font-bold text-[10px] w-16 text-right`}>{item.totVal}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full min-w-[150px] text-[10px] bg-[var(--bg-base)]">

      {/* Tab Navigation */}
      <div className="flex p-1 gap-1 border-b border-white/[0.04] bg-black/20 shrink-0">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${activeTab === 'profile' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <User size={12} /> Profile
        </button>
        <button 
          onClick={() => setActiveTab('session')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${activeTab === 'session' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <Activity size={12} /> Session
        </button>
        <button 
          onClick={() => setActiveTab('chest')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${activeTab === 'chest' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
        >
          <PackageOpen size={12} /> Chest
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-1.5 relative">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'session' && renderSession()}
        {activeTab === 'chest' && renderChest()}
      </div>
    </div>
  );
};
