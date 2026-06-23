import { z } from 'zod';
import { useSettingsStore } from '../store/settingsStore';

const Vector2Schema = z.object({
  x: z.number(),
  y: z.number()
}).passthrough();

const EnemyRespawnSchema = z.object({
  entityIndex: z.number().optional(),
  type: z.string().optional(),
  hp: z.number().optional(),
  maxHp: z.number().optional(),
  pos: Vector2Schema.optional()
}).passthrough();

const CombatHitSchema = z.object({
  entityIndex: z.number().optional(),
  clientDamage: z.number().optional(),
  damage: z.number().optional()
}).passthrough();

const ResourceRespawnSchema = z.object({
  type: z.string().optional(),
  resource: z.string().optional(),
  pos: Vector2Schema.optional()
}).passthrough();

export class TrackerValidator {
  
  static validateEnemySpawn(payload: any): boolean {
    if (!payload) return false;
    const isDev = useSettingsStore.getState().developerMode;
    
    const result = EnemyRespawnSchema.safeParse(payload);
    if (!result.success) {
      if (isDev) console.warn("[Zod Validator] Enemy spawn schema mismatch:", result.error);
    }
    
    return true; // Fallback gracefully instead of dropping
  }

  static validateCombatHit(payload: any): boolean {
    if (!payload) return false;
    const data = payload.data || payload;
    const isDev = useSettingsStore.getState().developerMode;
    
    const result = CombatHitSchema.safeParse(data);
    if (!result.success) {
      if (isDev) console.warn("[Zod Validator] Combat hit schema mismatch:", result.error);
    }

    if (data.clientDamage !== undefined && data.clientDamage < 0) {
      if (isDev) console.warn("[Zod Validator] Negative damage detected:", payload);
    }

    return true;
  }

  static validateResourceSpawn(payload: any): boolean {
    if (!payload) return false;
    const isDev = useSettingsStore.getState().developerMode;
    
    const result = ResourceRespawnSchema.safeParse(payload);
    if (!result.success) {
      if (isDev) console.warn("[Zod Validator] Resource spawn schema mismatch:", result.error);
    }
    
    return true;
  }
  
  static validateTimer(respawnTimeMs: number | undefined): void {
    if (respawnTimeMs !== undefined && respawnTimeMs < Date.now()) {
      const isDev = useSettingsStore.getState().developerMode;
      if (isDev) console.warn("[Zod Validator] Negative or past respawn timer detected:", new Date(respawnTimeMs));
    }
  }

  static checkDuplicateEntity(entityId: string | number, existingSet: Set<string | number>): void {
    if (existingSet.has(entityId)) {
      const isDev = useSettingsStore.getState().developerMode;
      if (isDev) console.warn("[Zod Validator] Duplicate entity detected in state:", entityId);
    }
    existingSet.add(entityId);
  }
}
