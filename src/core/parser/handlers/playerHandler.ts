/**
 * playerHandler.ts — Event dispatcher for player-related WebSocket packets.
 *
 * This file is a thin router. All logic lives in the sub-handlers:
 *   zoneHandler.ts   — spawn_state, zone_change, join_zone, move, state
 *   statsHandler.ts  — stats, player_state, player:damage:taken, player_death
 *   rosterHandler.ts — town:roster, user_online/offline, quests, level_up
 */
import { handleSpawnState, handleZoneChange, handleMove, handleState } from './zoneHandler';
import { handlePlayerDeath, handleDamageTaken, handleStatsOrPlayerState } from './statsHandler';
import {
  handleUserOnline,
  handleUserOffline,
  handleTownRoster,
  handleTownJoined,
  handleTownLeft,
  handleQuestAll,
  handleTutorialQuests,
  handleLevelUpOrAchievement,
} from './rosterHandler';

export function handlePlayerEvent(eventName: string, payload: any, store: any, parserState: any) {
  switch (eventName) {
    case 'user_online':          return handleUserOnline(payload, parserState);
    case 'spawn_state':          return handleSpawnState(payload, store);
    case 'state':                return handleState(payload, store);
    case 'player_death':         return handlePlayerDeath(payload, parserState);
    case 'player:damage:taken':  return handleDamageTaken(payload);
    case 'stats':
    case 'player_state':         return handleStatsOrPlayerState(payload, parserState);
    case 'move':
    case 'move_ack':
    case 'town:move':           return handleMove(payload, store, parserState);
    case 'tutorial_state_push':  return handleTutorialQuests(payload);
    case 'npcquest_all_result':  return handleQuestAll(payload);
    case 'zone_change':
    case 'join_zone':            return handleZoneChange(payload);
    case 'user_offline':         return handleUserOffline(payload);
    case 'town:roster':          return handleTownRoster(payload);
    case 'town:left':
    case 'town:leave':           return handleTownLeft(payload);
    case 'town:joined':          return handleTownJoined(payload);
    case 'level_up':
    case 'achievement':
    case 'milestone':            return handleLevelUpOrAchievement();
  }
}
