import { AICompanion } from '../companion/AICompanion';
import { useTrackerStore } from '../../store/trackerStore';
import { EnemyRespawnEvent, EnemyEntity } from '../../types/events';
import { DB_LOOKUP } from '../../data/gameDatabase';
import { useAnalyticsStore } from '../../store/analyticsStore';

export class MobTracker {
  static parseSpawn(event: any, zone: string): EnemyEntity {
    const store = useTrackerStore.getState();
    const key = `${zone}-${event.entityIndex}`;
    const existing = store.enemies[key];
    
    const hp = event.hp !== undefined ? event.hp : (existing ? existing.hp : 100);
    const maxHp = event.maxHp !== undefined ? event.maxHp : (existing ? existing.maxHp : 100);
    const rawType = event.type || event.name || event.rawName || event.enemyType || event.statsKey || event.id || existing?.type || 'Mob';

    return {
      entityIndex: event.entityIndex,
      id: event.id || existing?.id || '',
      type: rawType,
      statsKey: event.statsKey || existing?.statsKey || '',
      hp,
      maxHp,
      pos: event.pos || existing?.pos || { x: 0, y: 0 },
      patrolPath: event.patrolPath || existing?.patrolPath,
      isDead: hp <= 0,
      zone
    };
  }

  static handleSpawn(event: EnemyRespawnEvent, zone: string) {
    const enemy = this.parseSpawn(event, zone);
    if (enemy.isDead) return; // Prevent dead entities from entering the store on initial zone load
    const key = `${zone}-${event.entityIndex}`;
    const store = useTrackerStore.getState();
    store.setEnemy(key, enemy);
    if (store.timers[`mob-${key}`]) {
      store.removeTimer(`mob-${key}`);
    }
  }

  static handleDamage(payload: any, currentZone: string) {
    const store = useTrackerStore.getState();
    const data = payload?.data || payload;
    
    // `entityIndex`, `enemyHp`, `isDead`
    const entityIndex = data.entityIndex !== undefined ? data.entityIndex : data.id;
    if (entityIndex === undefined) return;
    
    const key = `${currentZone}-${entityIndex}`;
    const enemy = store.enemies[key];

    if (!enemy) return;

    // Use actual enemyHp from server if available
    const newHp = data.enemyHp !== undefined ? data.enemyHp : Math.max(0, enemy.hp - (data.damage || 0));
    const isDead = data.isDead === true || newHp <= 0;
    
    if (newHp > 0 && enemy.hp === enemy.maxHp) {
      AICompanion.onCombatStart();
    }
    
    if (isDead && !enemy.isDead) {
      AICompanion.onCombatWin(enemy.type);
    }

    // Single atomic update — avoids double render from calling setCurrentTarget + setState separately
    useTrackerStore.setState((state) => {
      // Normalize the enemy type before DB lookup:
      // The game server appends ' ai' or ' clone' to NPC names (e.g. 'CrystalBat ai').
      // Stripping these suffixes is required to get a valid DB_LOOKUP hit.
      const normalizedType = (enemy.type || '')
        .replace(/\s+ai\s*$/i, '')     // strip trailing ' ai'
        .replace(/\s+clone\s*$/i, '')  // strip trailing ' clone'
        .trim();
      const dbKey = normalizedType.toLowerCase().replace(/[^a-z0-9]/g, '');
      const dbEntry = DB_LOOKUP[dbKey];

      // ALWAYS update HP and death state — even for mobs not in the database.
      // Previously, a missing dbEntry caused a silent `return state` early-exit,
      // which meant HP was never updated, isDead was never set to true, and no
      // timer was ever created. That silent drop is now removed.
      const updates: any = {
        enemies: {
          ...state.enemies,
          [key]: { ...state.enemies[key], hp: newHp ?? 0, isDead }
        },
        currentTarget: {
          type: 'mob',
          key,
          name: dbEntry ? dbEntry.sanitizedName : (normalizedType || enemy.type),
          hp: newHp,
          maxHp: enemy.maxHp,
          lastHit: Date.now()
        }
      };

      const now = Date.now();
      const justDied = isDead && !enemy.isDead;
      const newTimers = { ...state.timers };

      if (justDied) {
        updates.sessionMobsKilled = state.sessionMobsKilled + 1;

        if (dbEntry) {
          // Create respawn timer only if we have cooldown data
          if (dbEntry.cooldown) {
            newTimers[`mob-${key}`] = {
              id: `mob-${key}`,
              name: dbEntry.sanitizedName,
              category: 'Mob' as const,
              expectedRespawnTime: now + (dbEntry.cooldown * 1000),
              pos: enemy.pos,
              zone: currentZone
            };
          }
          // Update lifetime stats only if we can attribute the kill
          const currentStats = state.lifetimeStats['mobsKilled'];
          updates.lifetimeStats = {
            ...state.lifetimeStats,
            mobsKilled: {
              ...currentStats,
              [dbEntry.sanitizedName]: (currentStats[dbEntry.sanitizedName] || 0) + 1
            }
          };
          
          // Use Analytics Store
          useAnalyticsStore.getState().recordMobKill(dbEntry.sanitizedName);
        } else {
          // Unknown mob — still count the kill but log so we can add it to the DB later
          console.warn(`[MobTracker] Killed unknown mob type: "${enemy.type}" (normalized: "${normalizedType}"). Add to gameDatabase.ts to enable respawn timers.`);
        }
      }

      updates.timers = newTimers;
      return updates;
    });
  }


  static clearAll() {
    useTrackerStore.getState().clearEnemies();
  }
}
