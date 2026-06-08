import React from 'react';
import { useTrackerStore } from '../../store/trackerStore';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronRight, CheckCircle2, Target, Hammer, Pickaxe, Leaf, Swords } from 'lucide-react';

export const QuestView: React.FC = () => {
  const quests = useTrackerStore((state) => state.quests);
  const layoutMode = useTrackerStore((state) => state.layoutMode);
  const isHorizontal = layoutMode === 'horizontal';
  const [expandedQuestId, setExpandedQuestId] = React.useState<string | null>(null);
  const [selectedGiver, setSelectedGiver] = React.useState<string | null>(null);

  // Group by quest giver
  const questsByGiver = quests.reduce((acc, quest) => {
    if (!acc[quest.quest_giver]) acc[quest.quest_giver] = [];
    acc[quest.quest_giver].push(quest);
    return acc;
  }, {} as Record<string, typeof quests>);

  const toggleQuest = (id: string) => {
    setExpandedQuestId(expandedQuestId === id ? null : id);
  };

  const getQuestIcon = (type: string) => {
    switch (type) {
      case 'Blacksmithing': return <Hammer className="w-4 h-4" />;
      case 'Mining': return <Pickaxe className="w-4 h-4" />;
      case 'Gathering': return <Leaf className="w-4 h-4" />;
      case 'Combat': return <Swords className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (quests.length === 0) {
    return (
      <div className={`p-4 text-center text-sm text-[var(--text-muted)] flex-1 overflow-hidden min-h-0 bg-[var(--bg-base)] ${isHorizontal ? 'w-[520px]' : 'w-full min-w-[150px]'}`}>
        No active quests found. Go talk to an NPC!
      </div>
    );
  }

  const renderQuestCard = (quest: any) => {
    const isExpanded = expandedQuestId === quest.id;
    const progress = Math.min(100, (quest.currentAmount / quest.quantity) * 100);
    const isComplete = progress >= 100;

    return (
      <div 
        key={quest.id} 
        className={`bg-[var(--bg-elevated)] border ${isComplete ? 'border-green-500/50' : 'border-[var(--border-subtle)]'} rounded overflow-hidden shrink-0`}
      >
        <button
          onClick={() => toggleQuest(quest.id)}
          className="w-full text-left p-2.5 hover:bg-[var(--bg-highlight)] transition-colors flex items-center justify-between group"
        >
          <div className="flex items-start gap-2 min-w-0">
            <div className={`p-1.5 rounded-md shrink-0 ${isComplete ? 'bg-green-500/20 text-green-400' : 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'}`}>
              {getQuestIcon(quest.quest_type)}
            </div>
            <div className="min-w-0 pr-2">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 truncate">
                {quest.title}
                {isComplete && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
              </div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                {quest.required_item} ({quest.currentAmount}/{quest.quantity})
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
          )}
        </button>

        {/* Progress Bar */}
        <div className="h-1 bg-[var(--bg-base)] w-full">
          <div 
            className={`h-full transition-all duration-500 ${isComplete ? 'bg-green-500' : 'bg-[var(--accent-primary)]'}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-[var(--border-subtle)]"
            >
              <div className="p-3 bg-[var(--bg-base)] space-y-3">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic">
                  "{quest.description}"
                </p>
                
                {/* Recipe Details if applicable */}
                {quest.recipe && quest.recipe.ingredients.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-semibold text-[var(--text-primary)] flex items-center gap-1 uppercase tracking-wider">
                      <Hammer className="w-3 h-3" /> Required Ingredients
                    </h4>
                    <div className="grid grid-cols-1 gap-1">
                      {quest.recipe.ingredients.map((ing: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[10px] items-center bg-[var(--bg-elevated)] p-1.5 rounded border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-secondary)] truncate pr-2">{ing.item}</span>
                          <span className="font-mono text-[var(--accent-primary)] shrink-0">x{ing.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reward */}
                {quest.reward > 0 && (
                  <div className="flex items-center justify-between text-[10px] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] p-1.5 rounded">
                    <span className="font-semibold uppercase tracking-wider">Reward</span>
                    <span className="font-mono">{quest.reward.toLocaleString()} {quest.reward_type}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const givers = Object.keys(questsByGiver);
  const activeGiver = selectedGiver && givers.includes(selectedGiver) ? selectedGiver : givers[0];

  return (
    <div className={`flex flex-row h-full w-full bg-[var(--bg-base)] ${isHorizontal ? 'min-w-[260px]' : 'min-w-[150px]'}`}>
      {/* Left Sidebar */}
      <div className={`flex flex-col gap-1 shrink-0 bg-[var(--bg-card)] rounded-lg shadow-md p-1 border border-[var(--border-subtle)] h-fit max-h-full overflow-y-auto custom-scrollbar m-1.5 ${isHorizontal ? 'w-[130px]' : 'w-[65px]'}`}>
        {givers.map(giver => (
          <button
            key={giver}
            onClick={() => setSelectedGiver(giver)}
            title={giver}
            className={`flex items-center text-left rounded transition-colors text-[10px] font-[var(--font-heading)] font-bold uppercase tracking-wider ${
              isHorizontal ? 'px-2 py-1.5' : 'px-1 py-1.5 justify-center'
            } ${
              activeGiver === giver
                ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-accent)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] border border-transparent'
            }`}
          >
            <span className="truncate max-w-full">{giver}</span>
          </button>
        ))}
      </div>

      {/* Right Content */}
      <div className={`flex-1 flex flex-col space-y-2 overflow-y-auto custom-scrollbar ${isHorizontal ? 'p-1.5' : 'p-1'}`}>
        {activeGiver && questsByGiver[activeGiver]?.map(renderQuestCard)}
      </div>
    </div>
  );
};
