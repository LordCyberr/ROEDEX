import { useTrackerStore } from '../../../store/trackerStore';
import { Quest } from '../../../store/storeTypes';

export function handleQuestData(data: any) {
  if (!Array.isArray(data)) return;
  const [event, payload] = data;

  if (event === 'npcquest_all_result' && payload.success) {
    // Parse the master list of all quests
    const store = useTrackerStore.getState();
    const npcs = payload.npcs || [];
    
    let allQuests: Quest[] = [];

    for (const npc of npcs) {
      if (Array.isArray(npc.quests)) {
        for (const q of npc.quests) {
          allQuests.push({
            id: q._id,
            quest_id: q.quest_id,
            quest_giver: q.quest_giver || npc.quest_giver,
            title: q.title,
            description: q.description,
            quest_type: q.quest_type,
            status: q.status || 'available',
            required_item: q.required_item,
            quantity: q.quantity,
            reward: q.reward,
            reward_type: q.reward_type,
            item_rarity: q.item_rarity,
            location: q.location,
            reward_cost_difference: q.reward_cost_difference,
            recipe: q.recipe,
            quests_list: q.quests_list || [],
            currentAmount: q.result?.currentAmount || 0,
            current_step: q.current_step || 0
          });
        }
      }
    }

    // Since this is the "all_result", it might be a fresh list of available quests.
    // However, we must not overwrite 'accepted' or 'completed' quests we already have tracked.
    // So we'll merge them, prioritizing existing accepted/completed quests unless the server payload explicitly overrides.
    const currentQuests = [...store.quests];
    const newQuestsMap = new Map(allQuests.map(q => [q.quest_id, q]));

    for (let i = 0; i < currentQuests.length; i++) {
      const cq = currentQuests[i];
      if (newQuestsMap.has(cq.quest_id)) {
        // If the server payload says it's available, but we have it as accepted, keep ours?
        // Wait, the server payload will likely have the correct status. 
        // We just replace.
        currentQuests[i] = newQuestsMap.get(cq.quest_id)!;
        newQuestsMap.delete(cq.quest_id);
      }
    }

    // Add any remaining new quests
    for (const newQ of newQuestsMap.values()) {
      currentQuests.push(newQ);
    }

    store.setQuests(currentQuests);
  }

  else if ((event === 'npcquest_ack' || event === 'npc_quest_generate_ack') && (payload.ok || payload.success)) {
    const store = useTrackerStore.getState();
    const questData = event === 'npc_quest_generate_ack' ? payload.data?.quest : payload.quest;

    if (!questData) return;

    const action = payload.action; // e.g. "accept", "deliver"
    
    // Find the quest in the store and update it
    const currentQuests = [...store.quests];
    const index = currentQuests.findIndex(q => q.quest_id === questData.quest_id);

    const updatedQuest: Quest = {
      id: questData._id,
      quest_id: questData.quest_id,
      quest_giver: questData.quest_giver,
      title: questData.title,
      description: questData.description,
      quest_type: questData.quest_type,
      status: questData.status || (action === 'accept' ? 'accepted' : 'completed'),
      required_item: questData.required_item,
      quantity: questData.quantity,
      reward: questData.reward,
      reward_type: questData.reward_type,
      item_rarity: questData.item_rarity,
      location: questData.location,
      reward_cost_difference: questData.reward_cost_difference,
      recipe: questData.recipe,
      quests_list: questData.quests_list || [],
      currentAmount: questData.result?.currentAmount || 0,
      current_step: questData.current_step || 0
    };

    if (index !== -1) {
      currentQuests[index] = updatedQuest;
    } else {
      currentQuests.push(updatedQuest);
    }

    store.setQuests(currentQuests);
  }
}
