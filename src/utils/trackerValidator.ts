import { EnemyRespawnEvent, CombatHitEvent, ResourceRespawnEvent } from '../types/events';
import { useTrackerStore } from '../store/trackerStore';

export class TrackerValidator {
  
  static validateEnemySpawn(payload: EnemyRespawnEvent): boolean {
    if (!payload) return false;
    
    const isDev = useTrackerStore.getState().developerMode;
    
    // Check missing HP
    if (typeof payload.hp !== 'number' || typeof payload.maxHp !== 'number') {
      if (isDev) console.warn(`[Validator] Enemy spawned without valid HP fields:`, payload);
      // We don't drop the packet, just warn
    }
    
    // Check broken categories
    if (!payload.type) {
      if (isDev) console.warn(`[Validator] Enemy spawned without a valid type:`, payload);
    }
    
    // Check invalid distances (positions)
    if (!payload.pos || typeof payload.pos.x !== 'number' || typeof payload.pos.y !== 'number') {
      if (isDev) console.warn(`[Validator] Enemy spawned with invalid position:`, payload);
    }

    return true;
  }

  static validateCombatHit(payload: CombatHitEvent | any): boolean {
    if (!payload) return false;
    
    const data = payload.data || payload;
    const isDev = useTrackerStore.getState().developerMode;
    
    // Check negative timers or HP logic (just general sanity)
    if (data.clientDamage < 0 || data.damage < 0) {
      if (isDev) console.warn(`[Validator] Negative damage detected:`, payload);
    }
    
    if (data.entityIndex === undefined) {
      if (isDev) console.warn(`[Validator] Combat hit missing entityIndex:`, payload);
    }

    return true;
  }

  static validateResourceSpawn(payload: ResourceRespawnEvent): boolean {
    if (!payload) return false;
    
    const isDev = useTrackerStore.getState().developerMode;
    
    if (!payload.type || !payload.resource) {
      if (isDev) console.warn(`[Validator] Resource spawned with broken category/type:`, payload);
    }
    
    if (!payload.pos || typeof payload.pos.x !== 'number' || typeof payload.pos.y !== 'number') {
      if (isDev) console.warn(`[Validator] Resource spawned with invalid position:`, payload);
    }
    
    return true;
  }
  
  static validateTimer(respawnTimeMs: number | undefined): void {
    if (respawnTimeMs !== undefined && respawnTimeMs < Date.now()) {
      const isDev = useTrackerStore.getState().developerMode;
      if (isDev) console.warn(`[Validator] Negative or past respawn timer detected:`, new Date(respawnTimeMs));
    }
  }

  static checkDuplicateEntity(entityId: string | number, existingSet: Set<string | number>): void {
    if (existingSet.has(entityId)) {
      const isDev = useTrackerStore.getState().developerMode;
      if (isDev) console.warn(`[Validator] Duplicate entity detected in state:`, entityId);
    }
    existingSet.add(entityId);
  }
}
