export interface Vector2 {
  x: number;
  y: number;
}

export interface EnemyEntity {
  entityIndex: number;
  id: string;
  type: string;
  statsKey: string;
  hp: number;
  maxHp: number;
  pos: Vector2;
  patrolPath?: Vector2[];
  isDead: boolean;
  zone?: string;
}

export interface ResourceNode {
  idx: number;
  type: string;      // e.g., Bush, Tree
  resource: string;  // e.g., bloodrootvineflower
  rarity: string;
  hp: number;
  maxHp: number;
  pos: Vector2;
  weakness: string;
  gathered: boolean;
  zone?: string;
}

export interface LootDrop {
  dropId: string;
  itemName: string;
  quantity: number;
  pos: Vector2;
  spawnTime: number;
}

export interface SpawnStateEvent {
  zone: string;
  enemies: Array<Partial<EnemyEntity>>;
  resources: Array<Partial<ResourceNode>>;
}

export interface EnemyRespawnEvent {
  entityIndex: number;
  id: string;
  type: string;
  statsKey: string;
  pos: Vector2;
  hp: number;
  maxHp: number;
  patrolPath?: Vector2[];
}

export interface CombatHitEvent {
  enemyType: string;
  entityIndex: number;
  enemyPosition: Vector2;
  playerPosition: Vector2;
  clientDamage: number;
}

export interface ResourceRespawnEvent {
  idx: number;
  type: string;
  resource: string;
  rarity: string;
  pos: Vector2;
  hp: number;
  maxHp: number;
  weakness: string;
}

export interface GatherEvent {
  idx: number;
  resourceType: string;
  gathered: boolean;
  drops: number;
}

export interface DropSpawnEvent {
  dropId: string;
  itemName: string;
  quantity: number;
  pos: Vector2;
}

export interface RespawnTimer {
  id: string; // e.g. "mob-73" or "resource-255"
  name: string; // e.g. "Shadow Wolf" or "ironorenode"
  category: string; // "Mob", "Ore", "Tree", "Bush"
  expectedRespawnTime: number; // Epoch timestamp in ms
  pos: Vector2;
  zone?: string;
}

export interface WeaponState {
  name: string;
  durability: number;
  maxDurability: number;
  slot?: number;
}

export interface OverlayNotification {
  id: string;
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'rare' | 'mythic' | 'combat' | 'chat' | 'boot-sequence' | 'system-online' | string;
  emotion?: 'happy' | 'alert' | 'mining' | 'combat' | 'idle' | 'talking';
  timestamp: number;
}

export interface RunStats {
  id: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
  runes: number;
  chestValue: number;
  lootWorth: number; // calculated from drops
  loot: Record<string, number>;
  mobsKilled: number;
  treesCut: number;
  oresMined: number;
  plantsHarvested: number;
  zonesVisited: string[];
}
