import { TrackerState } from '../../store/storeTypes';
import { useSettingsStore } from '../../store/settingsStore';
import { handleEntityEvent } from './handlers/entityHandler';
import { handleInventoryEvent } from './handlers/inventoryHandler';
import { handlePlayerEvent } from './handlers/playerHandler';
import { handleQuestData } from './handlers/questHandler';
import { handleMarketEvent } from './handlers/marketHandler';

type HandlerFn = (eventName: string, payload: any, store: TrackerState, parserState: any, rawParsed: any) => void;

const registry = new Map<string, HandlerFn[]>();

export const registerHandler = (eventName: string, fn: HandlerFn) => {
  const key = eventName.toLowerCase();
  if (!registry.has(key)) {
    registry.set(key, []);
  }
  registry.get(key)!.push(fn);
};

export const dispatch = (eventName: string, payload: any, store: TrackerState, parserState: any, rawParsed: any): boolean => {
  const key = eventName.toLowerCase();
  const handlers = registry.get(key);
  if (handlers && handlers.length > 0) {
    handlers.forEach(handler => {
      try {
        handler(eventName, payload, store, parserState, rawParsed);
      } catch (err) {
        console.error(`[ROEDEX Registry] Error in handler for event ${eventName}:`, err);
      }
    });
    return true;
  }
  
  if (useSettingsStore.getState().developerMode) {
    console.debug(`[ROEDEX Registry] Unhandled event: ${eventName}`);
  }
  return false;
};

// --- INITIALIZE REGISTRATIONS ---

// 1. Entity Handlers
const entityEvents = [
  'enemy_respawn', 'enemy_spawn',
  'combat_hit_ack',
  'resource_respawn', 'resource_spawn',
  'gather_hit_ack', 'resource_cooldown'
];
entityEvents.forEach(evt => {
  registerHandler(evt, (name, payload, store) => handleEntityEvent(name, payload, store));
});

// 2. Inventory Handlers
const inventoryEvents = [
  'chest_opened', 'chest_closed', 'chest',
  'inventory_update', 'inventory', 'loot_received',
  'blacksmith_opened', 'blacksmith_closed',
  'item_pickup', 'item_pickup_ack', 'pickup_death_drop_ack', 'game_loot',
  'loot_drop', 'drop_spawn', 'loot_spawn', 'loot_pickup'
];
inventoryEvents.forEach(evt => {
  registerHandler(evt, (name, payload, store, parserState) => handleInventoryEvent(name, payload, store, parserState));
});

// 3. Player/Zone Handlers
const playerEvents = [
  'user_online', 'spawn_state', 'state', 'player_death',
  'player:damage:taken', 'stats', 'player_state', 'move', 'move_ack', 'town:move',
  'tutorial_state_push', 'npcquest_all_result', 'zone_change', 'join_zone',
  'user_offline', 'town:roster', 'town:left', 'town:leave', 'town:joined',
  'level_up', 'achievement', 'milestone'
];
playerEvents.forEach(evt => {
  registerHandler(evt, (name, payload, store, parserState) => handlePlayerEvent(name, payload, store, parserState));
});

// 4. Quest Handlers
const questEvents = [
  'npcquest_all_result', 'npcquest_ack', 'npc_quest_generate_ack'
];
questEvents.forEach(evt => {
  registerHandler(evt, (_name, _payload, _store, _parserState, rawParsed) => handleQuestData(rawParsed));
});

// 5. Market Handlers
const marketEvents = [
  'marketplace:getalllistings', 'marketplace:getglobalsales'
];
marketEvents.forEach(evt => {
  registerHandler(evt, (name, payload, store) => handleMarketEvent(name, payload, store));
});

