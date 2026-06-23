import React, { useState, useMemo } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useShallow } from 'zustand/react/shallow';
import { PackageOpen } from 'lucide-react';
import { getResellValue } from '../../../data/prices';
import { getItemInfo } from '../../../data/rarity';
import { formatInternalName } from '../../../utils/formatters';
import { CustomSelect } from '../../ui/CustomSelect';
import { Tooltip } from '../../ui/Tooltip';
import { useTranslation } from '../../../hooks/useTranslation';

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

export const ChestTab: React.FC<{ isHorizontal: boolean; compactHeightClass: string }> = ({ isHorizontal, compactHeightClass }) => {
  const { t } = useTranslation();
  const { chestInventory, playerProfile } = useTrackerStore(useShallow((state: any) => ({
    chestInventory: state.chestInventory,
    playerProfile: state.playerProfile
  })));

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

  const chestItemsListUI = useMemo(() => {
    const combinedInventory: Record<string, number> = { ...chestInventory };
    for (const [key, qty] of Object.entries(useTrackerStore.getState().bankInventory || {})) {
       combinedInventory[key] = (combinedInventory[key] || 0) + qty;
    }

    let actualRunesInChest = 0;
    for (const key of Object.keys(combinedInventory)) {
      if (key.toLowerCase() === 'runes' || key.toLowerCase().startsWith('runes_')) {
        actualRunesInChest += combinedInventory[key];
        delete combinedInventory[key];
      }
    }

    if (includeRunesInChest) {
       const displayRunes = playerProfile.currentRunes > 0 ? playerProfile.currentRunes : actualRunesInChest;
       if (displayRunes > 0) {
         combinedInventory['Runes'] = displayRunes;
       }
    }

    const list = Object.entries(combinedInventory).map(([name, count]) => {
       const unitVal = name === 'Runes' ? 1 : getResellValue(name, 1);
       const totVal = name === 'Runes' ? count : getResellValue(name, count);
       return { name, count, unitVal, totVal };
    }).filter(i => i.count > 0);

    list.sort((a, b) => {
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
    return list;
  }, [chestInventory, includeRunesInChest, playerProfile.currentRunes, chestSortBy]);

  const displayTotalValue = useMemo(() => chestItemsListUI.reduce((acc, item) => {
    return acc + (excludedItems.has(item.name) ? 0 : item.totVal);
  }, 0) as number, [chestItemsListUI, excludedItems]);

  const inventoryLootValue = useMemo(() => {
    const isToolOrWeapon = (name: string) => {
       const n = name.toLowerCase();
       return n.includes('sword') || n.includes('pickaxe') || n.includes('axe') || n.includes('tool') || n.includes('weapon');
    };

    return Object.entries(chestInventory as Record<string, number>).reduce((acc, [name, qty]) => {
      if (isToolOrWeapon(name)) return acc;
      if (name.toLowerCase() === 'runes' || name.toLowerCase() === 'runestone' || name.toLowerCase().startsWith('runes_')) return acc;
      return acc + getResellValue(name, qty);
    }, 0) as number;
  }, [chestInventory]);

  return (
    <div className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} gap-2 h-full w-full`}>
      {/* Summary Card */}
      {isHorizontal ? (
        <div className={`flex flex-col gap-1.5 w-[140px] shrink-0 h-full overflow-y-auto custom-scrollbar`}>
          <div className="flex flex-col items-center justify-start bg-[var(--bg-panel)] p-3 border border-[var(--border-subtle)] rounded shrink-0 gap-3 h-full">
            <div className="flex flex-col items-center gap-3 w-full text-center mt-1">
              <Tooltip content="Total value of all items stored in your House Chest">
                <div>
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help">{t('loot.chestWorth')}</span>
                  <div className="text-cyan-400 font-mono font-black text-[12px] leading-none mt-1">{(displayTotalValue as number).toLocaleString()}</div>
                </div>
              </Tooltip>
              <div className="w-full h-px bg-white/10 my-1" />
              <Tooltip content={t('loot.chestValueTooltip')}>
                <div>
                  <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help text-emerald-500/80">{t('loot.inventoryLootValue')}</span>
                  <div className="text-emerald-400 font-mono font-black text-[12px] leading-none mt-1">{(inventoryLootValue as number).toLocaleString()}</div>
                </div>
              </Tooltip>
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
                  className="w-full h-[26px] bg-[var(--bg-card)] text-[9px] text-slate-300 uppercase tracking-widest font-bold px-2 rounded border border-[var(--border-subtle)] hover:border-white/20 transition-colors flex items-center justify-center text-center"
                />
              </div>
              <Tooltip content="Include your current Runes balance in the 'Total Worth' calculation">
                <button 
                  onClick={() => setIncludeRunesInChest(!includeRunesInChest)} 
                  className={`w-full h-[26px] text-[9px] font-bold uppercase px-2 rounded border transition-colors flex items-center justify-center ${includeRunesInChest ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-inner' : 'bg-[var(--bg-card)] text-slate-400 border-white/5 hover:border-white/20'}`}
                >
                  Runes
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-1 p-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded shrink-0">
          <div className="flex justify-between items-center w-full">
            <Tooltip content="Total value of all items stored in your House Chest">
              <div>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help">{t('loot.chestWorth')}</span>
                <div className="text-cyan-400 font-mono font-black text-[14px] leading-none mt-0.5">{(displayTotalValue as number).toLocaleString()}</div>
              </div>
            </Tooltip>
            <Tooltip content={t('loot.chestValueTooltip')}>
              <div className="text-right">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold cursor-help text-emerald-500/80">{t('loot.lootValue')}</span>
                <div className="text-emerald-400 font-mono font-black text-[12px] leading-none mt-0.5">{(inventoryLootValue as number).toLocaleString()}</div>
              </div>
            </Tooltip>
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
                className="w-full h-[22px] bg-[var(--bg-card)] text-[9px] text-slate-300 uppercase tracking-widest font-bold px-2 rounded border border-[var(--border-subtle)] hover:border-white/20 transition-colors flex items-center justify-center text-center"
              />
            </div>
            <Tooltip content="Include your current Runes balance in the 'Total Worth' calculation">
              <button 
                onClick={() => setIncludeRunesInChest(!includeRunesInChest)} 
                className={`w-1/2 h-[22px] text-[9px] font-bold uppercase px-2 rounded border transition-colors flex items-center justify-center ${includeRunesInChest ? 'bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-inner' : 'bg-[var(--bg-card)] text-slate-400 border-white/5 hover:border-white/20'}`}
              >
                Runes
              </button>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Right Card: Chest List */}
      <div className="flex-1 flex flex-col gap-0.5 bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-2 rounded-lg overflow-hidden h-full">
        <div className={`flex flex-col gap-0.5 overflow-y-auto custom-scrollbar flex-1 min-h-0 ${compactHeightClass}`}>
          {chestItemsListUI.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#3a3f47] italic text-[9px] gap-1 py-4">
              <PackageOpen size={16} className="opacity-50" />
              Inventory is empty
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center px-1.5 py-0.5 mt-1 border-b border-white/5">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest pl-5">{t('loot.item')}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest w-12 text-right">{t('loot.count')}</span>
                  <Tooltip content="Total Value"><span className="text-[8px] text-purple-400/80 font-bold uppercase tracking-widest w-14 text-right">{t('loot.total')}</span></Tooltip>
                </div>
              </div>
              {chestItemsListUI.map((item) => {
                const isExcluded = excludedItems.has(item.name);
                return (
                  <div key={item.name} className={`flex justify-between items-center px-1.5 py-1 rounded border hover:bg-white/[0.04] transition-colors ${isExcluded ? 'bg-white/[0.01] border-transparent opacity-50' : 'bg-[var(--bg-hover)] border-[var(--border-subtle)]'}`}>
                    <div className="flex items-center gap-1.5 overflow-hidden pr-1 flex-1">
                      <button onClick={() => toggleExclude(item.name)} className="shrink-0 w-3.5 h-3.5 flex items-center justify-center rounded bg-[var(--bg-card)] border border-white/10 hover:border-white/30 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full ${isExcluded ? 'bg-transparent' : 'bg-emerald-500'}`}></div>
                      </button>
                      <div className="flex flex-col truncate">
                        <span className={`truncate text-[10px] ${isExcluded ? 'text-slate-500 line-through' : getRarityColor(item.name)}`}>{formatInternalName(item.name)}</span>
                        {getItemInfo(item.name)?.rarity && (
                          <span className={`text-[7px] uppercase tracking-widest opacity-80 -mt-0.5 ${isExcluded ? 'text-slate-600' : getRarityColor(item.name)}`}>{getItemInfo(item.name)?.rarity}</span>
                        )}
                      </div>
                    </div>
                    <Tooltip content={`Unit Value: ${item.unitVal > 0 ? item.unitVal : '-'}`}>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-emerald-400 font-bold text-[10px] w-12 text-right">x{item.count}</span>
                        <Tooltip content={item.totVal.toLocaleString()}>
                          <span className={`${isExcluded ? 'text-slate-600' : 'text-purple-300'} font-mono font-bold text-[10px] w-14 text-right`}>
                            {item.totVal >= 1000 ? (item.totVal / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : item.totVal}
                          </span>
                        </Tooltip>
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
