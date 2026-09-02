export const EVENT_ROUTES: Record<string, string[]> = {
  entity: [
    'enemy_death', 'mob_die', 'entity_dead', 'enemy_respawn', 'enemy_spawn',
    'combat_hit_ack', 'resource_respawn', 'resource_spawn', 'gather_hit_ack',
    'resource_cooldown'
  ],
  inventory: [
    'chest_opened', 'blacksmith_opened', 'blacksmith_closed', 'chest_closed',
    'chest', 'inventory', 'game_loot', 'loot_drop', 'loot_spawn', 'drop_spawn',
    'pickup_death_drop_ack', 'item_pickup_ack', 'item_pickup', 'loot_pickup',
    'inventory_equip', 'inventory_unequip', 'quickbar_set', 'quickbar_set_ack'
  ],
  player: [
    'user_online', 'spawn_state', 'state', 'player_death', 'player:damage:taken',
    'stats', 'player_state', 'move', 'move_ack', 'town:move', 'tutorial_state_push',
    'npcquest_all_result', 'zone_change', 'join_zone', 'user_offline', 'town:roster',
    'town:left', 'town:leave', 'town:joined', 'level_up', 'achievement', 'milestone'
  ],
  quest: [
    'npcquest_all_result', 'npcquest_ack', 'npc_quest_generate_ack'
  ],
  market: [
    'marketplace:getalllistings', 'marketplace:getglobalsales'
  ]
};

export const routerMap = new Map<string, string[]>();

for (const [handlerName, events] of Object.entries(EVENT_ROUTES)) {
  for (const event of events) {
    const lowerEvent = event.toLowerCase();
    const existing = routerMap.get(lowerEvent) || [];
    existing.push(handlerName);
    routerMap.set(lowerEvent, existing);
  }
}

