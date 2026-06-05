import { EnemyRespawnEvent, CombatHitEvent, ResourceRespawnEvent } from '../types/events';

export class TrackerValidator {
  
  static validateEnemySpawn(payload: EnemyRespawnEvent): boolean {
    if (!payload) return false;
    
    // Check missing HP
    if (typeof payload.hp !== 'number' || typeof payload.maxHp !== 'number') {
      console.warn(`[Validator] Enemy spawned without valid HP fields:`, payload);
      // We don't drop the packet, just warn
    }
    
    // Check broken categories
    if (!payload.type) {
      console.warn(`[Validator] Enemy spawned without a valid type:`, payload);
    }
    
    // Check invalid distances (positions)
    if (!payload.pos || typeof payload.pos.x !== 'number' || typeof payload.pos.y !== 'number') {
      console.warn(`[Validator] Enemy spawned with invalid position:`, payload);
    }

    return true;
  }

  static validateCombatHit(payload: CombatHitEvent | any): boolean {
    if (!payload) return false;
    
    const data = payload.data || payload;
    
    // Check negative timers or HP logic (just general sanity)
    if (data.clientDamage < 0 || data.damage < 0) {
      console.warn(`[Validator] Negative damage detected:`, payload);
    }
    
    if (data.entityIndex === undefined) {
      console.warn(`[Validator] Combat hit missing entityIndex:`, payload);
    }

    return true;

    return true;
  }

  static validateResourceSpawn(payload: ResourceRespawnEvent): boolean {
    if (!payload) return false;
    
    if (!payload.type || !payload.resource) {
      console.warn(`[Validator] Resource spawned with broken category/type:`, payload);
    }
    
    if (!payload.pos || typeof payload.pos.x !== 'number' || typeof payload.pos.y !== 'number') {
      console.warn(`[Validator] Resource spawned with invalid position:`, payload);
    }
    
    return true;
  }
  
  static validateTimer(respawnTimeMs: number | undefined): void {
    if (respawnTimeMs !== undefined && respawnTimeMs < Date.now()) {
      console.warn(`[Validator] Negative or past respawn timer detected:`, new Date(respawnTimeMs));
    }
  }

  static checkDuplicateEntity(entityId: string | number, existingSet: Set<string | number>): void {
    if (existingSet.has(entityId)) {
      console.warn(`[Validator] Duplicate entity detected in state:`, entityId);
    }
    existingSet.add(entityId);
  }
}
