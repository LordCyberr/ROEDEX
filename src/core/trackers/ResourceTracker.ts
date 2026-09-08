import { useTrackerStore } from '../../store/trackerStore';
import { ResourceRespawnEvent, ResourceNode } from '../../types/events';
import { AICompanion } from '../companion/AICompanion';
import { DB_LOOKUP } from '../../data/gameDatabase';
import { StringCache } from '../../utils/stringCache';
import { formatInternalName } from '../../utils/formatters';

export class ResourceTracker {
  private static nameCache = new Map<string, string>();

  static sanitizeResourceName(raw: string): string {
    if (!raw) return 'Unknown';
    let cached = this.nameCache.get(raw);
    if (cached) return cached;

    const key = StringCache.sanitize(raw);
    let entry = DB_LOOKUP[key];
    // Suffix-strip fallback: 'witchbaneflower' → 'witchbane' → DB hit
    if (!entry) {
      const stripped = key.replace(/(flower|node|tree|vine|plant|leafy)$/, '');
      if (stripped !== key) entry = DB_LOOKUP[stripped];
    }
    const result = entry ? entry.sanitizedName : formatInternalName(raw);

    if (this.nameCache.size > 2000) this.nameCache.clear();
    this.nameCache.set(raw, result);
    return result;
  }

  static parseSpawn(event: ResourceRespawnEvent, zone: string): ResourceNode {
    const store = useTrackerStore.getState();
    const key = `${zone}-${event.idx}`;
    const existing = store.resources[key];
    const rawResource = event.resource || existing?.resource || 'Unknown';
    
    const dbKey = StringCache.sanitize(rawResource);
    let dbEntry = DB_LOOKUP[dbKey];
    // Fallback: strip common game entity suffixes (flower, node, tree, vine, leafy, plant)
    // to match DB keys that were pre-indexed without these suffixes.
    // e.g. 'witchbaneflower' → 'witchbane' → found in DB_LOOKUP
    if (!dbEntry) {
      const strippedKey = dbKey.replace(/(flower|node|tree|vine|plant|leafy)$/, '');
      if (strippedKey !== dbKey) dbEntry = DB_LOOKUP[strippedKey];
    }
    if (!dbEntry && rawResource !== 'Unknown') {
      if ((import.meta as any).env?.DEV) console.warn(`[ResourceTracker] Unknown resource entity detected: ${rawResource}`);
    }

    return {
      idx: event.idx,
      type: event.type || existing?.type || 'Unknown',
      resource: rawResource,
      rarity: event.rarity || existing?.rarity || (dbEntry ? dbEntry.rarity : 'common'),
      hp: event.hp !== undefined ? event.hp : (existing ? existing.hp : (dbEntry ? dbEntry.maxHp : 1)),
      maxHp: event.maxHp !== undefined ? event.maxHp : (existing ? existing.maxHp : (dbEntry ? dbEntry.maxHp : 1)),
      pos: event.pos || existing?.pos || { x: 0, y: 0 },
      weakness: event.weakness || existing?.weakness || '',
      gathered: event.hp !== undefined ? event.hp <= 0 : false,
      zone
    };
  }

  static handleSpawn(event: ResourceRespawnEvent, zone: string) {
    const node = this.parseSpawn(event, zone);
    if (node.gathered) return; 
    
    const key = `${zone}-${event.idx}`;
    const store = useTrackerStore.getState();
    const isNew = !store.resources[key];
    
    store.setResource(key, node);
    if (store.timers[`resource-${key}`]) {
      store.removeTimer(`resource-${key}`);
    }

    if (isNew && node.resource) {
      const dbKey = StringCache.sanitize(node.resource);
      let dbEntry = DB_LOOKUP[dbKey];
      if (!dbEntry) {
        const stripped = dbKey.replace(/(flower|node|tree|vine|plant|leafy)$/, '');
        if (stripped !== dbKey) dbEntry = DB_LOOKUP[stripped];
      }
      
      if (dbEntry) {
        const isRare = dbEntry.rarity === 'rare' || dbEntry.rarity === 'mystical' || dbEntry.rarity === 'uncommon';
        
        if (dbEntry.rarity === 'mystical' || dbEntry.rarity === 'rare') {
          // The user explicitly requested to "remove respawn alerts"
          // We are disabling both the rareSpawn log and the toast popup.
          /*
          if (settings.notificationSettings.notifyResources && !settings.notifiedEntities[`resource_${dbKey}`]) {
            settings.markEntityNotified(`resource_${dbKey}`);
            NotificationManager.rareSpawn(dbEntry.sanitizedName, node.pos, distanceToPlayer);
          }
          */
          AICompanion.onRareSpawn(dbEntry.sanitizedName);
        } else if (isRare) {
          AICompanion.onRareResource();
          
          /*
          if (settings.notificationSettings.enabled && settings.notificationSettings.toasts && settings.notificationSettings.notifyResources && !settings.notifiedEntities[`resource_${dbKey}`]) {
            settings.markEntityNotified(`resource_${dbKey}`);
            settings.addNotification({ 
              type: dbEntry.rarity, 
              title: 'Rare Node Spotted!', 
              message: `A highly valuable ${dbEntry.sanitizedName} has spawned in ${zone}!` 
            } as any);
          }
          */
        }
      }
    }
  }

  static lastCooldowns: Record<string, number> = {};

  static handleGather(payload: any, currentZone: string) {
    const store = useTrackerStore.getState();
    const data = payload?.data || payload;

    const index = data.spawnIndex !== undefined ? data.spawnIndex : (data.nodeIndex !== undefined ? data.nodeIndex : data.id);
    if (data.cooldownSeconds !== undefined && index !== undefined) {
       const key = `${currentZone}-${index}`;
       this.lastCooldowns[key] = data.cooldownSeconds;
       return;
    }

    if (index !== undefined) {
      const key = `${currentZone}-${index}`;
      const resource = store.resources[key];
      
      if (data.isGathered === true && resource) {
        useTrackerStore.setState((state) => {
          const updates: any = {};
          
          if (!resource.gathered) {
            const dbKey = (resource.resource || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const dbEntry = DB_LOOKUP[dbKey];
            
            if (dbEntry) {
              if (dbEntry.category === 'ore') {
                updates.sessionOresMined = state.sessionOresMined + 1;
                updates.lifetimeStats = {
                  ...state.lifetimeStats,
                  oresMined: { ...state.lifetimeStats.oresMined, [dbEntry.sanitizedName]: (state.lifetimeStats.oresMined[dbEntry.sanitizedName] || 0) + 1 }
                };
              } else if (dbEntry.category === 'tree') {
                updates.sessionTreesCut = state.sessionTreesCut + 1;
                updates.lifetimeStats = {
                  ...state.lifetimeStats,
                  treesCut: { ...state.lifetimeStats.treesCut, [dbEntry.sanitizedName]: (state.lifetimeStats.treesCut[dbEntry.sanitizedName] || 0) + 1 }
                };
              } else {
                updates.sessionPlantsHarvested = state.sessionPlantsHarvested + 1;
                updates.lifetimeStats = {
                  ...state.lifetimeStats,
                  plantsHarvested: { ...state.lifetimeStats.plantsHarvested, [dbEntry.sanitizedName]: (state.lifetimeStats.plantsHarvested[dbEntry.sanitizedName] || 0) + 1 }
                };
              }
            }
          }

          const exactCooldown = this.lastCooldowns[key];
          const dbKey = (resource.resource || '').toLowerCase().replace(/[^a-z0-9]/g, '');
          const dbEntry = DB_LOOKUP[dbKey];
          
          let cooldown = exactCooldown !== undefined ? exactCooldown : (dbEntry ? dbEntry.cooldown : undefined);

          delete this.lastCooldowns[key];
          
          if (cooldown !== undefined && dbEntry) {
            const respawnTime = Date.now() + (cooldown * 1000);
            const newTimer = {
              id: `resource-${key}`,
              name: dbEntry.sanitizedName,
              category: (dbEntry && dbEntry.category === 'ore') ? 'Ores' : (dbEntry && dbEntry.category === 'tree') ? 'Trees' : 'Plants',
              expectedRespawnTime: respawnTime,
              pos: resource.pos,
              zone: currentZone
            };
            updates.timers = { ...state.timers, [newTimer.id]: newTimer };
          }
          
          updates.resources = {
            ...state.resources,
            [key]: { ...resource, gathered: true, hp: 0 }
          };

          return updates;
        });

        const dbKey = (resource.resource || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const dbEntry = DB_LOOKUP[dbKey];

        if (dbEntry) {
          useTrackerStore.getState().setCurrentTarget({
            type: 'resource',
            key,
            name: dbEntry.sanitizedName,
            hp: 0,
            maxHp: resource.maxHp,
            lastHit: Date.now()
          });
        }
      } else if (resource && data.nodeHp !== undefined) {
        useTrackerStore.setState((state) => ({
          resources: {
            ...state.resources,
            [key]: { ...state.resources[key], hp: data.nodeHp, gathered: false }
          }
        }));
        
        const dbKey = (resource.resource || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const dbEntry = DB_LOOKUP[dbKey];

        if (dbEntry) {
          useTrackerStore.getState().setCurrentTarget({
            type: 'resource',
            key,
            name: dbEntry.sanitizedName,
            hp: data.nodeHp,
            maxHp: resource.maxHp,
            lastHit: Date.now()
          });
        }
      }
    }
  }

  static clearAll() {
    useTrackerStore.getState().clearResources();
  }
}
