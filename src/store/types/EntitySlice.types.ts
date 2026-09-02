import { EnemyEntity, ResourceNode, LootDrop, RespawnTimer, Vector2 } from '../../types/events';

export interface EntitySlice {
  activeWaypoint: Vector2 | null;
  activeWaypointName: string | null;
  activeWaypointZone: string | null;
  setActiveWaypoint: (pos: Vector2 | null, name?: string | null, zone?: string | null) => void;

  currentTarget: { type: 'mob' | 'resource'; key: string; name: string; hp: number; maxHp: number; lastHit: number } | null;
  setCurrentTarget: (target: EntitySlice['currentTarget']) => void;

  enemies: Record<string, EnemyEntity>;
  resources: Record<string, ResourceNode>;
  loot: Record<string, LootDrop>;
  timers: Record<string, RespawnTimer>;

  setEnemy: (key: string, enemy: EnemyEntity) => void;
  batchSetEnemies: (enemies: EnemyEntity[]) => void;
  removeEnemy: (key: string) => void;
  clearEnemies: () => void;

  setResource: (key: string, resource: ResourceNode) => void;
  batchSetResources: (resources: ResourceNode[]) => void;
  removeResource: (key: string) => void;
  clearResources: () => void;

  addLoot: (drop: LootDrop) => void;
  removeLoot: (dropId: string) => void;
  clearLoot: () => void;
  clearExpiredLoot: () => void;

  addTimer: (timer: RespawnTimer) => void;
  removeTimer: (id: string) => void;
  clearTimers: () => void;
}
