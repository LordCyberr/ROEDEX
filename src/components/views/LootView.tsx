import React, { useState, useEffect } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen, Play, Square, Coins, Diamond, Activity, Sword, Pickaxe, Axe, Leaf, Trash2, User, ArrowUpRight } from 'lucide-react';

import { getResellValue } from '../../data/prices';
import { getItemInfo } from '../../data/rarity';
import { formatInternalName } from '../../utils/formatters';
import { CustomSelect } from '../ui/CustomSelect';

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

interface LootViewProps {
  forcedTab?: 'profile' | 'session' | 'chest';
  hideNavigation?: boolean;
}

export const LootView: React.FC<LootViewProps> = ({ forcedTab, hideNavigation }) => {
  const { 
    sessionActive, setSessionActive, 
    sessionRunes, sessionLoot, chestInventory,
    clearSession, sessionStartTime, setSessionStartTime,
    sessionMobsKilled, sessionTreesCut, sessionOresMined, sessionPlantsHarvested,
    sessionSettings, endSession,
    playerProfile, lifetimeStats, layoutMode,
    popOutTab, poppedOutWindows, tabDimensions
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
    lifetimeStats: state.lifetimeStats,
    layoutMode: state.layoutMode,
    popOutTab: state.popOutTab,
    poppedOutWindows: state.poppedOutWindows,
    tabDimensions: state.tabDimensions
  })));

  const isHorizontal = layoutMode === 'horizontal';

  const [activeTab, setActiveTab] = useState<'profile' | 'session' | 'chest'>(forcedTab || 'session');

  useEffect(() => {
    if (forcedTab) setActiveTab(forcedTab);
  }, [forcedTab]);
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

  const activeDimKey = isHorizontal ? `session_horizontal` : `session_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const hasCustomHeight = activeDim.height !== undefined;
  const compactHeightClass = !hasCustomHeight ? 'max-h-[250px]' : '';

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
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-2 h-full w-full`}>
        {/* Left Side: Profile Card */}
        <div className={`flex flex-col gap-2 ${isHorizontal ? 'w-[140px]' : 'w-full'} shrink-0 h-full`}>
          <div className="flex flex-col items-center justify-start gap-2 bg-black/30 border border-white/[0.05] p-3 rounded-lg relative overflow-hidden group shadow-inner h-full">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-blue-500/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0 drop-shadow-md mt-2">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-white/10" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-400" strokeWidth="3" strokeDasharray={`${pct}, 100`} />
               </svg>
               <div className="absolute flex flex-col items-center justify-center mt-1">
                  <span className="text-[7px] text-emerald-400/80 uppercase font-bold tracking-widest mb-0.5">LVL</span>
                  <span className="text-[18px] font-black text-white leading-none">{playerProfile.level}</span>
               </div>
            </div>
            
            <div className="flex flex-col items-center w-full z-10 mt-2">
               <div className="text-[12px] font-bold text-slate-200 uppercase tracking-widest mb-3 truncate text-center w-full">{playerProfile.name ? playerProfile.name.toUpperCase() : 'PLAYER PROFILE'}</div>
               <div className="flex flex-col items-center text-[9px] mt-1 w-full px-1">
                  <span className="text-slate-400 mb-1 tracking-wider uppercase font-bold text-center">Runes to Level Up</span>
                  <span className="text-emerald-400 font-mono font-black text-[10px] bg-black/40 px-2 py-1 rounded border border-emerald-500/20 whitespace-nowrap">{playerProfile.currentRunes.toLocaleString()} / {playerProfile.runesRequired.toLocaleString()}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Right Side: Lifetime Stats */}
        <div className="flex-1 flex flex-col bg-black/20 border border-white/[0.05] p-2 rounded-lg relative overflow-hidden">
          <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1.5">Lifetime Statistics</div>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto custom-scrollbar flex-1 pr-1">
            <div className="flex flex-col h-fit">
               <div className="flex justify-between items-center bg-black/40 border border-rose-500/20 px-2 py-1 rounded-t">
                 <span className="text-rose-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Sword size={10} /> Combat</span>
                 <span className="text-white font-mono text-[10px] font-black">{totalMobs.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-px text-[8px] text-slate-400 bg-black/20 border-b border-l border-r border-rose-500/10 px-2 py-1 rounded-b">
                  {Object.entries(lifetimeStats.mobsKilled).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                     <div key={k} className="flex justify-between hover:bg-white/5 px-1 rounded transition-colors">
                       <span className="truncate pr-1">{formatInternalName(k)}</span>
                       <span className="font-mono text-rose-300">{v}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col h-fit">
               <div className="flex justify-between items-center bg-black/40 border border-slate-500/20 px-2 py-1 rounded-t">
                 <span className="text-slate-400 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Pickaxe size={10} /> Mining</span>
                 <span className="text-white font-mono text-[10px] font-black">{totalOres.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-px text-[8px] text-slate-400 bg-black/20 border-b border-l border-r border-slate-500/10 px-2 py-1 rounded-b">
                  {Object.entries(lifetimeStats.oresMined).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                     <div key={k} className="flex justify-between hover:bg-white/5 px-1 rounded transition-colors">
                       <span className="truncate pr-1">{k}</span>
                       <span className="font-mono text-slate-300">{v}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col h-fit">
               <div className="flex justify-between items-center bg-black/40 border border-amber-500/20 px-2 py-1 rounded-t">
                 <span className="text-amber-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Axe size={10} /> Logging</span>
                 <span className="text-white font-mono text-[10px] font-black">{totalTrees.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-px text-[8px] text-slate-400 bg-black/20 border-b border-l border-r border-amber-500/10 px-2 py-1 rounded-b">
                  {Object.entries(lifetimeStats.treesCut).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                     <div key={k} className="flex justify-between hover:bg-white/5 px-1 rounded transition-colors">
                       <span className="truncate pr-1">{k}</span>
                       <span className="font-mono text-amber-300">{v}</span>
                     </div>
                  ))}
               </div>
            </div>

            <div className="flex flex-col h-fit">
               <div className="flex justify-between items-center bg-black/40 border border-emerald-500/20 px-2 py-1 rounded-t">
                 <span className="text-emerald-500 font-bold uppercase tracking-wider text-[8px] flex items-center gap-1"><Leaf size={10} /> Foraging</span>
                 <span className="text-white font-mono text-[10px] font-black">{totalPlants.toLocaleString()}</span>
               </div>
               <div className="flex flex-col gap-px text-[8px] text-slate-400 bg-black/20 border-b border-l border-r border-emerald-500/10 px-2 py-1 rounded-b">
                  {Object.entries(lifetimeStats.plantsHarvested).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v]) => (
                     <div key={k} className="flex justify-between hover:bg-white/5 px-1 rounded transition-colors">
                       <span className="truncate pr-1">{k}</span>
                       <span className="font-mono text-emerald-300">{v}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSession = () => (
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
            <button
              onClick={() => {
                clearSession();
                import('../../core/companion/BobCompanion').then(({ BobCompanion }) => {
                  BobCompanion.onClearLoot();
                });
              }}
              title="Reset Current Loot"
              className="flex items-center justify-center px-2 py-1.5 rounded bg-[var(--bg-panel)] hover:bg-[var(--bg-card)] text-[#cfd2d5] border border-[var(--border-subtle)] transition-all shadow-md"
            >
              <Trash2 size={10} />
            </button>
          </div>

          <div className="flex items-center justify-between px-2 py-1 bg-black/30 rounded border border-white/[0.04] shrink-0">
            <div className="text-[14px] font-mono font-black text-white tracking-widest drop-shadow">
              {formatDuration(durationMs)}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-end">
                <span className="text-[6px] text-slate-400 uppercase tracking-widest">Runes/Hr</span>
                <span className="text-yellow-400 font-mono font-bold text-[9px]">{runesPerHour.toLocaleString()}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[6px] text-slate-400 uppercase tracking-widest">Worth/Hr</span>
                <span className="text-cyan-400 font-mono font-bold text-[9px]">{valuePerHour.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 shrink-0">
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Sword size={12} className="text-rose-400" />
              <span className="text-white font-mono font-black text-[11px]">{sessionMobsKilled}</span>
            </div>
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Axe size={12} className="text-amber-600" />
              <span className="text-white font-mono font-black text-[11px]">{sessionTreesCut}</span>
            </div>
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Pickaxe size={12} className="text-slate-400" />
              <span className="text-white font-mono font-black text-[11px]">{sessionOresMined}</span>
            </div>
            <div className="bg-black/40 border border-white/[0.04] rounded flex items-center justify-between px-2 py-1.5 hover:bg-black/60 transition-colors">
              <Leaf size={12} className="text-emerald-500" />
              <span className="text-white font-mono font-black text-[11px]">{sessionPlantsHarvested}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-1 shrink-0 pt-0.5">
            <div className="bg-black/30 border border-[var(--border-accent)] rounded px-2 py-1.5 flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
              <span className="text-cyan-400/80 text-[7px] uppercase tracking-wider flex items-center gap-1 z-10 font-bold"><Diamond size={8} /> Total Worth</span>
              <span className="text-cyan-400 font-mono font-black text-[12px] z-10">{totalWorth.toLocaleString()}</span>
            </div>
            <div className="bg-black/30 border border-white/[0.04] rounded px-2 py-1 flex items-center justify-between">
              <span className="text-[#5a6270] text-[7px] uppercase tracking-wider flex items-center gap-1"><Coins size={8} className="text-yellow-500" /> Runes Added</span>
              <span className="text-yellow-400 font-mono font-black text-[10px]">{sessionRunes.toLocaleString()}</span>
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
                    <span className={`truncate pr-1 ${getRarityColor(name)}`} title={name}>{name}</span>
                    <div className="flex items-center gap-2 shrink-0" title={`Unit Value: ${unitPrice > 0 ? unitPrice : '-'}`}>
                      <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{quantity}</span>
                      <span className="text-[#5a6270] font-mono text-[9px] w-14 text-right" title={totalRunes.toLocaleString()}>{displayTotal}</span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderChest = () => {
    // Combine Backpack (chestInventory) and Bank (bankInventory)
    const combinedInventory: Record<string, number> = { ...chestInventory };
    for (const [key, qty] of Object.entries(useTrackerStore.getState().bankInventory || {})) {
       combinedInventory[key] = (combinedInventory[key] || 0) + qty;
    }

    // Consolidate any internal "runes_xxx" or "runes" into a single "Runes" key,
    // but only show it if includeRunesInChest is true.
    let actualRunesInChest = 0;
    for (const key of Object.keys(combinedInventory)) {
      if (key.toLowerCase() === 'runes' || key.toLowerCase().startsWith('runes_')) {
        actualRunesInChest += combinedInventory[key];
        delete combinedInventory[key];
      }
    }

    if (includeRunesInChest) {
       // Favor the profile's current runes, otherwise fallback to the physical chest runes
       const displayRunes = playerProfile.currentRunes > 0 ? playerProfile.currentRunes : actualRunesInChest;
       if (displayRunes > 0) {
         combinedInventory['Runes'] = displayRunes;
       }
    }

    const chestItemsListAll = Object.entries(combinedInventory).map(([name, count]) => {
       const unitVal = name === 'Runes' ? 1 : getResellValue(name, 1);
       const totVal = name === 'Runes' ? count : getResellValue(name, count);
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

    const displayTotalValue = chestItemsListAll.reduce((acc, item) => {
      return acc + (excludedItems.has(item.name) ? 0 : item.totVal);
    }, 0);
    const chestItemsListUI = chestItemsListAll;

    const isToolOrWeapon = (name: string) => {
       const n = name.toLowerCase();
       return n.includes('sword') || n.includes('pickaxe') || n.includes('axe') || n.includes('tool') || n.includes('weapon');
    };

    const inventoryLootValue = Object.entries(chestInventory).reduce((acc, [name, qty]) => {
      if (isToolOrWeapon(name)) return acc;
      if (name.toLowerCase() === 'runes' || name.toLowerCase() === 'runestone' || name.toLowerCase().startsWith('runes_')) return acc;
      return acc + getResellValue(name, qty);
    }, 0);

    return (
      <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-2 h-full w-full`}>
        {/* Summary Card */}
        {isHorizontal ? (
          <div className={`flex flex-col gap-1.5 w-[140px] shrink-0 h-full overflow-y-auto custom-scrollbar`}>
            {/* Horizontal Chest Header */}
            <div className="flex flex-col items-center justify-start bg-black/20 p-3 border border-white/5 rounded shrink-0 gap-3 h-full">
              <div className="flex flex-col items-center gap-3 w-full text-center mt-1">
                <div title="Total value of all items stored in your House Chest">
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help">Chest Worth</span>
                  <div className="text-cyan-400 font-mono font-black text-[12px] leading-none mt-1">{displayTotalValue.toLocaleString()}</div>
                </div>
                <div className="w-full h-px bg-white/10 my-1" />
                <div title="Total value of gathered resources in your Backpack (excluding tools)">
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help text-emerald-500/80">Inventory Loot Value</span>
                  <div className="text-emerald-400 font-mono font-black text-[12px] leading-none mt-1">{inventoryLootValue.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="w-full h-px bg-white/10 mt-1" />
              
              <div className="flex flex-col gap-1.5 w-full mt-1">
                <div className="w-full relative">
                  <CustomSelect 
                    value={chestSortBy} 
                    onChange={(v) => setChestSortBy(v as any)}
                    options={[
                      { label: 'Value', value: 'value' },
                      { label: 'Count', value: 'count' },
                      { label: 'Rarity', value: 'rarity' }
                    ]}
                    className="w-full h-[26px] bg-black/40 text-[9px] text-slate-300 uppercase tracking-widest font-bold px-2 rounded border border-white/5 hover:border-white/20 transition-colors flex items-center justify-center text-center"
                  />
                </div>
                <button 
                  onClick={() => setIncludeRunesInChest(!includeRunesInChest)} 
                  className={`w-full h-[26px] text-[9px] font-bold uppercase px-2 rounded border transition-colors flex items-center justify-center ${includeRunesInChest ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-inner' : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/20'}`}
                  title="Include your current Runes balance in the 'Total Worth' calculation"
                >
                  Runes
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 p-2 bg-black/20 border border-white/5 rounded shrink-0">
            <div className="flex justify-between items-center w-full">
              <div title="Total value of all items stored in your House Chest">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help">Chest Worth</span>
                <div className="text-cyan-400 font-mono font-black text-[14px] leading-none mt-0.5">{displayTotalValue.toLocaleString()}</div>
              </div>
              <div className="text-right" title="Total value of gathered resources in your Backpack (excluding tools)">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help text-emerald-500/80">Loot Value</span>
                <div className="text-emerald-400 font-mono font-black text-[12px] leading-none mt-0.5">{inventoryLootValue.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <div className="w-1/2 relative">
                <CustomSelect 
                  value={chestSortBy} 
                  onChange={(v) => setChestSortBy(v as any)}
                  options={[
                    { label: 'Value', value: 'value' },
                    { label: 'Count', value: 'count' },
                    { label: 'Rarity', value: 'rarity' }
                  ]}
                  className="w-full h-[22px] bg-black/40 text-[9px] text-slate-300 uppercase tracking-widest font-bold px-2 rounded border border-white/5 hover:border-white/20 transition-colors flex items-center justify-center text-center"
                />
              </div>
              <button 
                onClick={() => setIncludeRunesInChest(!includeRunesInChest)} 
                className={`w-1/2 h-[22px] text-[9px] font-bold uppercase px-2 rounded border transition-colors flex items-center justify-center ${includeRunesInChest ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-inner' : 'bg-black/40 text-slate-400 border-white/5 hover:border-white/20'}`}
                title="Include your current Runes balance in the 'Total Worth' calculation"
              >
                Runes
              </button>
            </div>
          </div>
        )}

        {/* Right Card: Chest List */}
        <div className="flex-1 flex flex-col gap-0.5 bg-black/20 border border-white/[0.05] p-2 rounded-lg overflow-hidden h-full">
          <div className={`flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 min-h-0 ${compactHeightClass}`}>
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
                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right">Count</span>
                    <span className="text-[8px] text-purple-400/80 font-bold uppercase tracking-widest w-14 text-right" title="Total Value">Total</span>
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
                          <span className={`truncate text-[10px] ${isExcluded ? 'text-slate-500 line-through' : getRarityColor(item.name)}`}>{formatInternalName(item.name)}</span>
                          {getItemInfo(item.name)?.rarity && (
                            <span className={`text-[7px] uppercase tracking-widest opacity-80 -mt-0.5 ${isExcluded ? 'text-slate-600' : getRarityColor(item.name)}`}>{getItemInfo(item.name)?.rarity}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0" title={`Unit Value: ${item.unitVal > 0 ? item.unitVal : '-'}`}>
                        <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{item.count}</span>
                        <span className={`${isExcluded ? 'text-slate-600' : 'text-purple-300'} font-mono font-bold text-[10px] w-14 text-right`} title={item.totVal.toLocaleString()}>
                          {item.totVal >= 1000 ? (item.totVal / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : item.totVal}
                        </span>
                      </div>
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

  return (
    <div className="flex flex-col h-full w-full min-w-[150px] text-[10px] bg-[var(--bg-base)]">

      {/* Tab Navigation */}
      {!hideNavigation && (
        <div className="flex p-1 gap-1 border-b border-white/[0.04] bg-black/20 shrink-0 pointer-events-auto">
          <div className="flex-1 flex relative">
            <button 
              onClick={() => !poppedOutWindows['session_profile'] && setActiveTab('profile')}
              disabled={!!poppedOutWindows['session_profile']}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${poppedOutWindows['session_profile'] ? 'opacity-30 cursor-not-allowed' : activeTab === 'profile' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <User size={12} /> Profile
            </button>
            {!poppedOutWindows['session_profile'] && (
              <button 
                onClick={(e) => { e.stopPropagation(); popOutTab('session_profile', e.clientX, e.clientY); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Pop out Profile tab"
              >
                <ArrowUpRight size={10} />
              </button>
            )}
          </div>
          <div className="flex-1 flex relative">
            <button 
              onClick={() => !poppedOutWindows['session_session'] && setActiveTab('session')}
              disabled={!!poppedOutWindows['session_session']}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${poppedOutWindows['session_session'] ? 'opacity-30 cursor-not-allowed' : activeTab === 'session' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <Activity size={12} /> Session
            </button>
            {!poppedOutWindows['session_session'] && (
              <button 
                onClick={(e) => { e.stopPropagation(); popOutTab('session_session', e.clientX, e.clientY); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Pop out Session tab"
              >
                <ArrowUpRight size={10} />
              </button>
            )}
          </div>
          <div className="flex-1 flex relative">
            <button 
              onClick={() => !poppedOutWindows['session_chest'] && setActiveTab('chest')}
              disabled={!!poppedOutWindows['session_chest']}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded transition-colors ${poppedOutWindows['session_chest'] ? 'opacity-30 cursor-not-allowed' : activeTab === 'chest' ? 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
            >
              <PackageOpen size={12} /> Chest
            </button>
            {!poppedOutWindows['session_chest'] && (
              <button 
                onClick={(e) => { e.stopPropagation(); popOutTab('session_chest', e.clientX, e.clientY); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Pop out Chest tab"
              >
                <ArrowUpRight size={10} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-2 relative">
        {activeTab === 'profile' && renderProfile()}
        {activeTab === 'session' && renderSession()}
        {activeTab === 'chest' && renderChest()}
      </div>
    </div>
  );
};
