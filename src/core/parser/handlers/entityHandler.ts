import { TrackerValidator } from '../../../utils/trackerValidator';
import { MobTracker } from '../../trackers/MobTracker';
import { ResourceTracker } from '../../trackers/ResourceTracker';
import { EnemyRespawnEvent, ResourceRespawnEvent } from '../../../types/events';
import { updateWeaponDurabilityState } from '../index';

export function handleEntityEvent(eventName: string, payload: any, store: any) {
  switch (eventName) {
    case 'enemy_respawn':
    case 'enemy_spawn': {
      if (TrackerValidator.validateEnemySpawn(payload as EnemyRespawnEvent)) {
        MobTracker.handleSpawn(payload as EnemyRespawnEvent, store.currentZone);
      }
      break;
    }

    case 'combat_hit_ack': {
      const d = payload?.data || payload;
      if (d?.weaponDurability !== undefined) {
         updateWeaponDurabilityState(d, 'weapon');
      }
      if (TrackerValidator.validateCombatHit(payload)) {
        MobTracker.handleDamage(payload, store.currentZone);
      }
      break;
    }

    case 'resource_respawn':
    case 'resource_spawn': {
      if (TrackerValidator.validateResourceSpawn(payload as ResourceRespawnEvent)) {
        ResourceTracker.handleSpawn(payload as ResourceRespawnEvent, store.currentZone);
      }
      break;
    }

    case 'gather_hit_ack':
    case 'resource_cooldown': {
      if (eventName === 'gather_hit_ack' && payload?.data) {
         const d = payload.data;
         if (d?.weaponDurability !== undefined) {
           updateWeaponDurabilityState(d, 'tool');
         }
         ResourceTracker.handleGather(payload, store.currentZone);
      } else if (eventName === 'resource_cooldown') {
         ResourceTracker.handleGather(payload, store.currentZone);
      }
      break;
    }
  }
}
