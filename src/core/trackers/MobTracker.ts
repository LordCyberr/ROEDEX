import { AICompanion } from '../companion/AICompanion';
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
    if (enemy.isDead) return; // Prevent dead entities from entering the store on initial zone load
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
      AICompanion.onCombatStart();
    }
    
    if (isDead && !enemy.isDead) {
      AICompanion.onCombatWin(enemy.type);
      if (store.isRecording) {
        store.addRoutePoint({
          action: 'kill',
          x: enemy.pos.x,
          y: enemy.pos.y,
          detail: enemy.type
        });
      }
    }

    useTrackerStore.setState((state) => {
      const updates: any = {};
      
      if (isDead) {
        const { [key]: _, ...remainingEnemies } = state.enemies;
        updates.enemies = remainingEnemies;
      } else {
        updates.enemies = {
          ...state.enemies,
          [key]: { ...state.enemies[key], hp: newHp || 0, isDead }
        };
      }

      if (isDead) {
        if (!enemy.isDead) {
          updates.sessionMobsKilled = state.sessionMobsKilled + 1;
          const currentStats = state.lifetimeStats['mobsKilled'];
          updates.lifetimeStats = {
            ...state.lifetimeStats,
            mobsKilled: {
              ...currentStats,
              [enemy.type]: (currentStats[enemy.type] || 0) + 1
            }
          };
        }
        
        const respawnTime = Date.now() + (getFallbackCooldown(enemy.type) * 1000);
        const newTimer = {
          id: `mob-${key}`,
          name: enemy.type,
          category: 'Mob' as const,
          expectedRespawnTime: respawnTime,
          pos: enemy.pos,
          zone: currentZone
        };
        updates.timers = { ...state.timers, [newTimer.id]: newTimer };
      }
      
      return updates;
    });
  }

  static clearAll() {
    useTrackerStore.getState().clearEnemies();
  }
}
