import React, { useState } from 'react';
import { useTrackerStore } from '../../../store/trackerStore';
import { useSettingsStore } from '../../../store/settingsStore';
import { useTranslation } from '../../../hooks/useTranslation';

import { 
  ScrollText, 
  Coins, 
  Swords, 
  Pickaxe, 
  ChefHat, 
  Hammer, 
  Sprout, 
  CheckCircle2, 
  Clock, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Quest } from '../../../store/storeTypes';

const getQuestIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('combat') || t.includes('kill')) return <Swords size={12} />;
  if (t.includes('gather') || t.includes('mine')) return <Pickaxe size={12} />;
  if (t.includes('cook') || t.includes('culinary')) return <ChefHat size={12} />;
  if (t.includes('craft') || t.includes('forge')) return <Hammer size={12} />;
  if (t.includes('farm') || t.includes('plant')) return <Sprout size={12} />;
  return <ScrollText size={12} />;
};

const getQuestTypeColor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('combat')) return 'text-red-400 border-red-500/30 bg-red-500/10';
  if (t.includes('cook') || t.includes('craft')) return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
  if (t.includes('gather')) return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
  return 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10';
};

const CompactQuestCard = ({ quest, inventory, isExpanded, onToggle }: { quest: Quest, inventory: Record<string, number>, isExpanded: boolean, onToggle: () => void }) => {
  const { t } = useTranslation();
  const profit = quest.reward_cost_difference || 0;
  const isAccepted = quest.status === 'accepted';
  const hasRecipe = !!quest.recipe && quest.recipe.ingredients.length > 0;
  
  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border bg-gradient-to-r shadow-sm transition-all duration-200 hover:shadow-md ${isAccepted ? 'from-blue-500/10 to-[var(--bg-panel)] border-blue-500/30' : 'from-[var(--bg-panel)] to-[var(--bg-base)] border-white/5 hover:border-white/10'}`}>
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 transition-all group"
        onClick={onToggle}
      >
        <div className="flex flex-col gap-0.5 overflow-hidden">
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] font-black text-white/90 truncate group-hover:text-white transition-colors">{quest.quest_giver}</span>
            <div className={`group/icon relative flex items-center justify-center p-1 rounded-sm ${getQuestTypeColor(quest.quest_type)}`}>
              {getQuestIcon(quest.quest_type)}
              <div className="absolute -top-6 opacity-0 group-hover/icon:opacity-100 transition-opacity bg-black/90 px-1.5 py-0.5 rounded text-[8px] font-bold text-white whitespace-nowrap pointer-events-none border border-white/10 z-10 shadow-lg">
                {quest.quest_type.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="text-[10px] text-zinc-400 font-medium truncate max-w-[200px]">{quest.title}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {quest.status !== 'available' && (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm ${
              quest.status === 'accepted' ? 'bg-blue-500 text-white' : 
              quest.status === 'completed' ? 'bg-green-500 text-white' : 
              'bg-zinc-500 text-white'
            }`}>
              {quest.status}
            </span>
          )}
          <div className={`p-0.5 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors ${isExpanded ? 'bg-white/10 text-white' : 'text-zinc-500'}`}>
            {isExpanded ? <ChevronUp size={12} strokeWidth={3} /> : <ChevronDown size={12} strokeWidth={3} />}
          </div>
        </div>
      </div>
        
      {isExpanded && (
        <div className="px-3 pb-3 animate-in slide-in-from-top-1 fade-in duration-200">
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="flex flex-col bg-black/40 rounded-lg p-2 border border-white/5 shadow-inner">
              <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">{t('ui.required')}</span>
              <span className="text-[10px] font-bold text-white/90 flex items-center gap-1.5 truncate">
                <span className={`shrink-0 w-1.5 h-1.5 rounded-full shadow-sm ${
                  quest.item_rarity === 'uncommon' ? 'bg-green-400 shadow-green-400/50' :
                  quest.item_rarity === 'rare' ? 'bg-blue-400 shadow-blue-400/50' :
                  quest.item_rarity === 'mythic' ? 'bg-purple-400 shadow-purple-400/50' : 'bg-zinc-400 shadow-zinc-400/50'
                }`} />
                {quest.quantity}x {quest.required_item}
              </span>
            </div>
            <div className="flex flex-col bg-black/40 rounded-lg p-2 border border-white/5 shadow-inner">
              <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">{t('ui.reward')}</span>
              <div className="flex items-center gap-1 text-[11px] font-black text-yellow-400">
                <Coins size={12} className="drop-shadow-md" />
                {quest.reward}
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex items-center justify-between px-2 py-1.5 bg-white/5 rounded-md border border-white/5">
             <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Est. Profit:</span>
             <span className={`text-[10px] font-black ${
              profit > 0 ? 'text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]' : 
              profit < 0 ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 
              'text-zinc-400'
            }`}>{profit > 0 ? '+' : ''}{profit} Coins</span>
          </div>

          {isAccepted && hasRecipe && (
            <div className="mt-1.5 space-y-1">
              <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider block">{t('ui.recipe')}</span>
              {quest.recipe!.ingredients.map((ing, idx) => {
                const have = inventory[ing.item] || 0;
                const need = ing.quantity;
                const isComplete = have >= need;
                
                return (
                  <div key={idx} className="flex items-center justify-between text-[9px] bg-black/20 px-1.5 py-1 rounded border border-white/5">
                    <div className={`flex items-center gap-1 font-bold ${isComplete ? 'text-green-400' : 'text-zinc-300'}`}>
                      {isComplete ? <CheckCircle2 size={10} /> : <Clock size={10} className="text-zinc-500" />}
                      {ing.item}
                    </div>
                    <span className={`font-mono font-bold ${isComplete ? 'text-green-500' : 'text-orange-400'}`}>
                      {have}/{need}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FullQuestDetails = ({ quest, inventory }: { quest: Quest, inventory: Record<string, number> }) => {
  const { t } = useTranslation();
  const profit = quest.reward_cost_difference || 0;
  const isAccepted = quest.status === 'accepted';
  const hasRecipe = !!quest.recipe && quest.recipe.ingredients.length > 0;

  return (
    <div className={`flex flex-col rounded-xl overflow-hidden border bg-gradient-to-r shadow-lg h-full ${isAccepted ? 'from-blue-500/10 to-[var(--bg-panel)] border-blue-500/30' : 'from-[var(--bg-panel)] to-[var(--bg-base)] border-white/10'}`}>
      <div className="p-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${getQuestTypeColor(quest.quest_type)}`}>
              {getQuestIcon(quest.quest_type)}
            </div>
            <span className="text-sm font-black text-white/90">{quest.quest_giver}</span>
          </div>
          {quest.status !== 'available' && (
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm ${
              quest.status === 'accepted' ? 'bg-blue-500 text-white' : 
              quest.status === 'completed' ? 'bg-green-500 text-white' : 
              'bg-zinc-500 text-white'
            }`}>
              {quest.status}
            </span>
          )}
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{quest.title}</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">{quest.description}</p>
      </div>

      <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">{t('ui.required')}</span>
            <span className="text-xs font-bold text-white/90 flex items-center gap-2">
              <span className={`shrink-0 w-2 h-2 rounded-full shadow-sm ${
                quest.item_rarity === 'uncommon' ? 'bg-green-400 shadow-green-400/50' :
                quest.item_rarity === 'rare' ? 'bg-blue-400 shadow-blue-400/50' :
                quest.item_rarity === 'mythic' ? 'bg-purple-400 shadow-purple-400/50' : 'bg-zinc-400 shadow-zinc-400/50'
              }`} />
              {quest.quantity}x {quest.required_item}
            </span>
          </div>
          <div className="flex flex-col bg-black/40 rounded-lg p-3 border border-white/5 shadow-inner">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1.5">{t('ui.reward')}</span>
            <div className="flex items-center gap-1.5 text-sm font-black text-yellow-400">
              <Coins size={14} className="drop-shadow-md" />
              {quest.reward}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 bg-white/5 rounded-lg border border-white/5">
           <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Estimated Profit:</span>
           <span className={`text-xs font-black ${
            profit > 0 ? 'text-green-400 drop-shadow-[0_0_4px_rgba(74,222,128,0.5)]' : 
            profit < 0 ? 'text-red-400 drop-shadow-[0_0_4px_rgba(248,113,113,0.5)]' : 
            'text-zinc-400'
          }`}>{profit > 0 ? '+' : ''}{profit} Coins</span>
        </div>

        {isAccepted && hasRecipe && (
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">{t('ui.craftingRecipe')}</span>
            <div className="grid gap-2">
              {quest.recipe!.ingredients.map((ing, idx) => {
                const have = inventory[ing.item] || 0;
                const need = ing.quantity;
                const isComplete = have >= need;
                
                return (
                  <div key={idx} className="flex items-center justify-between text-xs bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                    <div className={`flex items-center gap-2 font-bold ${isComplete ? 'text-green-400' : 'text-zinc-300'}`}>
                      {isComplete ? <CheckCircle2 size={14} /> : <Clock size={14} className="text-zinc-500" />}
                      {ing.item}
                    </div>
                    <span className={`font-mono font-bold ${isComplete ? 'text-green-500' : 'text-orange-400'}`}>
                      {have} / {need}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const QuestBoard: React.FC = () => {
  const { t } = useTranslation();
  const layoutMode = useSettingsStore(state => state.layoutMode);
  const isHorizontal = layoutMode === 'horizontal';

  const quests = useTrackerStore(state => state.quests || []);
  const inventory = useTrackerStore(state => state.chestInventory || {});
  const isGuildPassActive = useTrackerStore(state => state.isGuildPassActive);
  
  const dailyLimit = isGuildPassActive ? 15 : 5;
  const completedToday = quests.filter(q => q.status === 'completed').length;
  const hasActiveQuests = quests.some(q => q.status === 'accepted' || q.status === 'completed');
  const [filter, setFilter] = useState<'available' | 'active'>(hasActiveQuests ? 'active' : 'available');

  const availableQuests = quests.filter(q => q.status === 'available').sort((a, b) => (b.reward_cost_difference || 0) - (a.reward_cost_difference || 0));
  const activeQuests = quests.filter(q => q.status === 'accepted' || q.status === 'completed').sort((a, b) => {
    if (a.status === 'accepted' && b.status !== 'accepted') return -1;
    if (b.status === 'accepted' && a.status !== 'accepted') return 1;
    return (b.reward_cost_difference || 0) - (a.reward_cost_difference || 0);
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className={`flex flex-col h-full bg-[var(--bg-base)] w-full`}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-panel)] shrink-0 ${isHorizontal ? 'px-4 py-3' : 'px-3 py-2'}`}>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-[#3b82f6]/20 rounded-md">
            <ScrollText className="text-[#3b82f6]" size={isHorizontal ? 18 : 14} />
          </div>
          <div className="flex flex-col">
            <h2 className={`font-black text-[var(--text-primary)] tracking-wider flex items-center gap-2 ${isHorizontal ? 'text-base' : 'text-xs'}`}>
              QUEST BOARD
            </h2>
          </div>
        </div>
        
        <div className="text-[10px] md:text-xs font-mono font-bold bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/30 px-2 py-1 rounded shadow-sm">
          {completedToday}/{dailyLimit} DAILY
        </div>
      </div>

      {/* Main Content Area */}
      {isHorizontal ? (
        <div className="flex-1 flex min-h-0 bg-[var(--bg-base)] p-2 gap-2">
          {/* Left Sidebar */}
          <div className="w-[200px] shrink-0 flex flex-col min-h-0 border border-white/5 bg-[var(--bg-panel)] rounded-xl overflow-hidden shadow-lg">
             <div className="flex bg-black/40 p-1.5 border-b border-white/5 gap-1 shrink-0">
               <button
                 onClick={() => setFilter('available')}
                 className={`flex-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                   filter === 'available' 
                     ? 'bg-zinc-700 text-white shadow-md' 
                     : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                 }`}
               >
                 <ScrollText size={10} /> Available ({availableQuests.length})
               </button>
               <button
                 onClick={() => setFilter('active')}
                 className={`flex-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                   filter === 'active' 
                     ? 'bg-[#3b82f6] text-white shadow-md' 
                     : 'text-[var(--text-muted)] hover:text-white hover:bg-white/5'
                 }`}
               >
                 <Clock size={10} /> Active ({activeQuests.length})
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5">
               {(filter === 'available' ? availableQuests : activeQuests).length === 0 ? (
                 <div className="p-4 text-center text-xs text-[var(--text-muted)] italic">No {filter} quests</div>
               ) : (
                 <div className="flex flex-col gap-1">
                   {(filter === 'available' ? availableQuests : activeQuests).map((quest) => {
                     const isSelected = expandedId === quest.quest_id;
                     return (
                       <div 
                         key={quest.quest_id}
                         onClick={() => setExpandedId(quest.quest_id)}
                         className={`flex flex-col p-2 rounded-lg cursor-pointer transition-all border ${
                           isSelected 
                             ? 'bg-white/10 border-white/20 shadow-md' 
                             : 'bg-black/20 border-transparent hover:bg-white/5 hover:border-white/10'
                         }`}
                       >
                         <div className="flex items-center gap-1.5 mb-1">
                           <div className={`p-0.5 rounded-sm ${getQuestTypeColor(quest.quest_type)}`}>
                             {getQuestIcon(quest.quest_type)}
                           </div>
                           <span className="text-[10px] font-black text-white/90 truncate">{quest.quest_giver}</span>
                         </div>
                         <div className="text-[9px] text-zinc-400 font-medium truncate">{quest.title}</div>
                       </div>
                     );
                   })}
                 </div>
               )}
             </div>
          </div>
          
          {/* Right Detail Panel */}
          <div className="flex-1 min-w-[300px] min-h-0 bg-[var(--bg-base)]">
             {expandedId ? (
               <FullQuestDetails 
                 quest={quests.find(q => q.quest_id === expandedId)!} 
                 inventory={inventory} 
               />
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] space-y-3 bg-[var(--bg-panel)] rounded-xl border border-white/5">
                 <ScrollText size={32} className="opacity-20" />
                 <p className="font-bold text-xs uppercase tracking-widest opacity-50">{t('ui.selectAQuestToViewDetails')}</p>
               </div>
             )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-base)]">
          {/* Tabs for Vertical Mode */}
          <div className="flex bg-[var(--bg-panel)] p-2 border-b border-white/5 gap-2 shrink-0">
            <button
              onClick={() => setFilter('available')}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                filter === 'available' 
                  ? 'bg-zinc-700 text-white shadow-md' 
                  : 'bg-black/20 text-[var(--text-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              <ScrollText size={11} /> Available
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`flex-1 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                filter === 'active' 
                  ? 'bg-[#3b82f6] text-white shadow-md' 
                  : 'bg-black/20 text-[var(--text-muted)] hover:text-white hover:bg-white/5'
              }`}
            >
              <Clock size={11} /> Active
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 max-h-[350px]">
            {filter === 'available' ? (
              availableQuests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] space-y-2 py-8">
                  <ScrollText size={24} className="opacity-20" />
                  <p className="font-bold text-[10px]">{t('ui.noAvailableQuests')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {availableQuests.map((quest) => (
                    <CompactQuestCard 
                      key={quest.quest_id} 
                      quest={quest} 
                      inventory={inventory} 
                      isExpanded={expandedId === quest.quest_id}
                      onToggle={() => setExpandedId(expandedId === quest.quest_id ? null : quest.quest_id)}
                    />
                  ))}
                </div>
              )
            ) : (
              activeQuests.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] space-y-2 py-8">
                  <ScrollText size={24} className="opacity-20" />
                  <p className="font-bold text-[10px]">{t('ui.noActiveQuests')}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {activeQuests.map((quest) => (
                    <CompactQuestCard 
                      key={quest.quest_id} 
                      quest={quest} 
                      inventory={inventory} 
                      isExpanded={expandedId === quest.quest_id}
                      onToggle={() => setExpandedId(expandedId === quest.quest_id ? null : quest.quest_id)}
                    />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
