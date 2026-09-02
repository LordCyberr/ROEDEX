import { TrackerValidator } from '../../../utils/trackerValidator';
import { MobTracker } from '../../trackers/MobTracker';
import { ResourceTracker } from '../../trackers/ResourceTracker';
import { EnemyRespawnEvent, ResourceRespawnEvent } from '../../../types/events';
import { updateWeaponDurabilityState } from '../index';

export function handleEntityEvent(eventName: string, payload: any, store: any) {
  switch (eventName) {
    // Dedicated death events — force isDead:true through the same MobTracker path
    // so kill counter, timers, and UI all update correctly.
    case 'enemy_death':
    case 'mob_die':
    case 'entity_dead': {
      const data = payload?.data || payload;
      if (data?.entityIndex !== undefined || data?.id !== undefined) {
        MobTracker.handleDamage(
          { ...payload, data: { ...(payload?.data || payload), isDead: true, enemyHp: 0 } },
          store.currentZone
        );
      }
      break;
    }

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
      if (Array.isArray(d?.drops)) {
        d.drops.forEach((drop: any) => {
          if (drop.itemName || drop.itemId) {
            store.addLoot({
              dropId: drop.dropId || Math.random().toString(36).substring(7),
              itemName: drop.itemName || drop.itemId,
              quantity: drop.quantity || 1,
              pos: payload?.enemyPosition || store.playerPosition || { x: 0, y: 0 },
              spawnTime: Date.now()
            });
          }
        });
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
