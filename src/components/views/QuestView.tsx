import React, { useState, useMemo, useCallback } from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useShallow } from 'zustand/react/shallow';
import { ChevronDown, ChevronUp, Target, Hammer, Pickaxe, Leaf, Swords, Diamond, Clock, ScrollText } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getResellValue } from '../../data/prices';
import { Quest } from '../../store/storeTypes';

const getQuestIcon = (type: string) => {
  const cls = "w-3.5 h-3.5";
  const t = type.toLowerCase();
  if (t.includes('combat') || t.includes('kill')) return <Swords className={cls} />;
  if (t.includes('gather') || t.includes('mine')) return <Pickaxe className={cls} />;
  if (t.includes('craft') || t.includes('forge')) return <Hammer className={cls} />;
  if (t.includes('farm') || t.includes('plant')) return <Leaf className={cls} />;
  return <Target className={cls} />;
};

const getQuestTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('combat')) return 'text-red-400 border-red-500/30 bg-red-500/10';
  if (t.includes('cook') || t.includes('craft')) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  if (t.includes('gather')) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
};

const QuestCard = React.memo(({ 
  quest, 
  isExpanded, 
  inventoryAmount, 
  isActiveTab, 
  onToggle 
}: { 
  quest: Quest; 
  isExpanded: boolean; 
  inventoryAmount: number; 
  isActiveTab: boolean; 
  onToggle: (id: string) => void;
}) => {
  // Calculate total cost and profit
  let totalCost = 0;
  if (quest.recipe && quest.recipe.ingredients) {
    for (const ing of quest.recipe.ingredients) {
      totalCost += getResellValue(ing.item, ing.quantity);
    }
  }
  const profit = quest.reward - totalCost;
  const rawPct = (inventoryAmount / quest.quantity) * 100;
  const progressPct = isNaN(rawPct) ? 0 : Math.min(100, Math.floor(rawPct));
  const isComplete = inventoryAmount >= quest.quantity;

  return (
    <div 
      className={`bg-white/[0.02] border ${isExpanded ? 'border-white/20 shadow-md bg-white/[0.04]' : 'border-white/5 hover:border-white/10'} rounded-xl overflow-hidden shrink-0 flex flex-col transition-colors cursor-pointer`}
      onClick={() => onToggle(quest.quest_id)}
    >
      {/* Unexpanded (Compact) View */}
      <div className="w-full text-left p-2.5 flex items-center justify-between group">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 border ${getQuestTypeColor(quest.quest_type)}`}>
            {getQuestIcon(quest.quest_type)}
          </div>
          <div className="min-w-0 pr-2 flex-1">
            <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between gap-1.5 uppercase tracking-wide">
              <span className="truncate">{quest.quest_giver}</span>
              {isActiveTab && (
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded shrink-0 ${isComplete ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-400'}`}>
                  {progressPct}%
                </span>
              )}
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5 truncate flex items-center gap-1">
              <span className="font-medium text-slate-300 capitalize">Requires: {quest.quantity}x {quest.required_item}</span> 
            </div>
            
            {/* Progress Bar for Active Quests */}
            {isActiveTab && (
              <div className="w-full h-1 bg-black/40 rounded-full mt-1.5 overflow-hidden border border-white/5 shadow-inner relative">
                <div 
                  style={{ width: `${progressPct}%` }}
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-out ${isComplete ? 'bg-emerald-400' : 'bg-[#3b82f6]'}`} 
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className={`p-0.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ${isExpanded ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
            {isExpanded ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
          </div>
        </div>
      </div>

      {/* Expanded (Detailed) View */}
        {isExpanded && (
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-1 border-t border-white/5 bg-black/20">
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex flex-col bg-black/40 rounded-lg p-2 border border-white/5 shadow-inner">
                  <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Final Item</span>
                  <span className="text-[10px] font-bold text-white/90 truncate">
                    {quest.quantity}x {quest.required_item}
                  </span>
                </div>
                <div className="flex flex-col bg-black/40 rounded-lg p-2 border border-white/5 shadow-inner">
                  <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Reward</span>
                  <div className="flex items-center gap-1 text-[11px] font-black text-cyan-400">
                    <Diamond size={10} className="drop-shadow-md" />
                    {quest.reward}
                  </div>
                </div>
              </div>
              
              {/* Crafting Cost & Profit */}
              <div className="mt-2 flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-md border border-white/5">
                 <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Est. Profit:</span>
                 <span className={`text-[10px] font-black ${
                  profit > 0 ? 'text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]' : 
                  profit < 0 ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 
                  'text-zinc-400'
                }`}>
                  {profit > 0 ? '+' : ''}{profit} 
                  <span className="text-[8px] text-zinc-500 ml-1 font-normal tracking-wide">(Cost: {totalCost})</span>
                </span>
              </div>

              {/* Crafting Recipe */}
              {quest.recipe && quest.recipe.ingredients.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">Required Materials</span>
                  {quest.recipe.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[9px] bg-black/20 px-1.5 py-1 rounded border border-white/5">
                      <div className="flex items-center gap-1 font-bold text-zinc-300 capitalize">
                        {ing.item}
                      </div>
                      <span className="font-mono font-bold text-orange-400">
                        {ing.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
});

export const QuestViewComponent: React.FC = () => {
  const { t } = useTranslation();
  const { quests, chestInventory } = useTrackerStore(useShallow((state: any) => ({
    quests: state.quests,
    chestInventory: state.chestInventory
  })));
  const layoutMode = useSettingsStore((state) => state.layoutMode);
  const tabDimensions = useSettingsStore((state) => state.tabDimensions);
  const isHorizontal = layoutMode === 'horizontal';
  
  const activeDimKey = isHorizontal ? `quests_horizontal` : `quests_vertical`;
  const activeDim = tabDimensions[activeDimKey] || {};
  const hasCustomHeight = activeDim.height !== undefined;
  const compactHeightClass = !hasCustomHeight ? 'max-h-[350px]' : '';

  const [activeTab, setActiveTab] = useState<'available' | 'active'>('available');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // Filter quests
  const availableQuests = useMemo(() => quests.filter((q: Quest) => q.status === 'available'), [quests]);
  const activeQuests = useMemo(() => quests.filter((q: Quest) => q.status === 'accepted'), [quests]);

  const displayedQuests = activeTab === 'available' ? availableQuests : activeQuests;

  return (
    <div className={`flex flex-col h-full w-full bg-[var(--bg-base)] ${isHorizontal ? 'min-w-[260px]' : 'min-w-[150px]'} ${compactHeightClass}`}>
      {/* Top Tabs */}
      <div className="flex bg-black/40 backdrop-blur-md p-1.5 border-b border-white/10 gap-1.5 shrink-0 select-none">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'available' 
              ? 'bg-[var(--accent-primary)] text-white shadow-[0_2px_10px_rgba(249,115,22,0.35)] border border-white/20' 
              : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'
          }`}
        >
          <ScrollText size={12} /> {t('ui.noAvailableQuests') ? 'Available' : 'Available'}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'active' 
              ? 'bg-[var(--accent-primary)] text-white shadow-[0_2px_10px_rgba(249,115,22,0.35)] border border-white/20' 
              : 'text-[var(--text-muted)] hover:text-white hover:bg-white/10'
          }`}
        >
          <Clock size={12} /> {t('ui.noActiveQuests') ? 'Active' : 'Active'}
        </button>
      </div>

      {/* Main Content List */}
      <div className={`flex-1 flex flex-col space-y-2 overflow-y-auto overflow-x-hidden custom-scrollbar ${isHorizontal ? 'p-2' : 'p-1.5'}`}>
        {displayedQuests.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 py-8 min-h-[120px] select-none">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full animate-pulse" />
              <Target size={36} className="relative text-blue-500/40 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="font-black text-[12px] text-white uppercase tracking-widest">No {activeTab} Quests</p>
              <p className="text-[9px] opacity-60 text-center max-w-[180px]">
                {activeTab === 'available' ? 'Explore the world and talk to NPCs to find new quests.' : 'You have no active quests right now.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {displayedQuests.map((quest: Quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                isExpanded={expandedId === quest.quest_id}
                inventoryAmount={(chestInventory && chestInventory[quest.required_item]) ? chestInventory[quest.required_item] : 0}
                isActiveTab={activeTab === 'active'}
                onToggle={handleToggle}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export const QuestView = React.memo(QuestViewComponent);
