import { BobCompanion } from '../companion/BobCompanion';
import { useTrackerStore } from '../../store/trackerStore';
import { EnemyRespawnEvent, EnemyEntity } from '../../types/events';
import { getFallbackCooldown } from '../../data/cooldowns';

export class MobTracker {
  static parseSpawn(event: EnemyRespawnEvent, zone: string): EnemyEntity {
    const store = useTrackerStore.getState();
    const key = `${zone}-${event.entityIndex}`;
    const existing = store.enemies[key];
    
    const hp = event.hp !== undefined ? event.hp : (existing ? existing.hp : 100);
    const maxHp = event.maxHp !== undefined ? event.maxHp : (existing ? existing.maxHp : 100);

    return {
      entityIndex: event.entityIndex,
      id: event.id || existing?.id || '',
      type: event.type || existing?.type || 'Unknown',
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
    const key = `${zone}-${event.entityIndex}`;
    useTrackerStore.getState().setEnemy(key, enemy);
  }

  static handleDamage(payload: any, currentZone: string) {
    const store = useTrackerStore.getState();
    const data = payload?.data || payload;
    
    // `entityIndex`, `enemyHp`, `isDead`
    if (data.entityIndex === undefined) return;
    
    const key = `${currentZone}-${data.entityIndex}`;
    const enemy = store.enemies[key];

    if (!enemy) return;

    // Use actual enemyHp from server if available
    const newHp = data.enemyHp !== undefined ? data.enemyHp : Math.max(0, enemy.hp - (data.damage || 0));
    const isDead = data.isDead === true || newHp <= 0;
    
    if (newHp > 0 && enemy.hp === enemy.maxHp) {
      BobCompanion.onCombatStart();
    }
    
    if (isDead && !enemy.isDead) {
      BobCompanion.onCombatWin(enemy.type);
    }

    store.updateEnemyHp(key, newHp || 0, isDead);
    
    if (isDead) {
      if (!enemy.isDead) {
        store.incrementMobsKilled();
        store.incrementLifetimeStat('mobsKilled', enemy.type, 1);
      }
      
      // Prefer exact timestamp if provided in future packet updates, else fallback
      const respawnTime = Date.now() + (getFallbackCooldown(enemy.type) * 1000);

      // Add timer
      store.addTimer({
        id: `mob-${key}`,
        name: enemy.type,
        category: 'Mob',
        expectedRespawnTime: respawnTime,
        pos: enemy.pos
      });

      // We DO NOT remove the enemy from the active list. It stays as "isDead: true" for session tracking.
    }
  }

  static clearAll() {
    useTrackerStore.getState().clearEnemies();
  }
}
