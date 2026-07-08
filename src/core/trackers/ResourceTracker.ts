import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { ResourceRespawnEvent, ResourceNode } from '../../types/events';
import { getFallbackCooldown } from '../../data/cooldowns';
import { AICompanion } from '../companion/AICompanion';

export class ResourceTracker {
  static sanitizeResourceName(raw: string): string {
    let clean = raw.trim();
    
    // Format camelCase to Title Case if needed (e.g., bloodrootVine -> Bloodroot Vine)
    clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Capitalize the first letter of every word
    return clean.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  static parseSpawn(event: ResourceRespawnEvent, zone: string): ResourceNode {
    const store = useTrackerStore.getState();
    const key = `${zone}-${event.idx}`;
    const existing = store.resources[key];
    const rawResource = event.resource || existing?.resource || 'Unknown';
    
    return {
      idx: event.idx,
      type: event.type || existing?.type || 'Unknown',
      resource: rawResource,
      rarity: event.rarity || existing?.rarity || 'Common',
      hp: event.hp !== undefined ? event.hp : (existing ? existing.hp : 1),
      maxHp: event.maxHp !== undefined ? event.maxHp : (existing ? existing.maxHp : 1),
      pos: event.pos || existing?.pos || { x: 0, y: 0 },
      weakness: event.weakness || existing?.weakness || '',
      gathered: event.hp !== undefined ? event.hp <= 0 : false,
      zone
    };
  }

  static handleSpawn(event: ResourceRespawnEvent, zone: string) {
    const node = this.parseSpawn(event, zone);
    if (node.gathered) return; // Prevent dead entities from entering the store on initial zone load
    const key = `${zone}-${event.idx}`;
    const store = useTrackerStore.getState();
    const isNew = !store.resources[key];
    
    store.setResource(key, node);

    if (isNew && node.resource) {
      const name = node.resource.toLowerCase();
      const isRare = name.includes('rare') || name.includes('crystal') || name.includes('gem') || name.includes('titanium') || name.includes('goldleaf') || name.includes('moonpetal');
      
      const settings = useSettingsStore.getState();
      if (isRare) {
        AICompanion.onRareResource();
        
        if (settings.notificationSettings.enabled && settings.notificationSettings.toasts && settings.notificationSettings.rareDrop) {
          settings.addNotification({ 
            type: 'mythic', 
            title: 'Rare Node Spotted!', 
            message: `A highly valuable ${node.resource} has spawned in ${zone}!` 
          });
        }
      }
    }
  }

  static lastCooldowns: Record<string, number> = {};

  static handleGather(payload: any, currentZone: string) {
    const store = useTrackerStore.getState();
    const data = payload?.data || payload;

    const index = data.spawnIndex !== undefined ? data.spawnIndex : data.nodeIndex;
    if (data.cooldownSeconds !== undefined && index !== undefined) {
       const key = `${currentZone}-${index}`;
       this.lastCooldowns[key] = data.cooldownSeconds;
       return;
    }

    if (data.nodeIndex !== undefined) {
      const key = `${currentZone}-${data.nodeIndex}`;
      const resource = store.resources[key];
      
      if (data.isGathered === true && resource) {
        useTrackerStore.setState((state) => {
          const updates: any = {};
          
          if (!resource.gathered) {
            if (state.isRecording) {
              state.addRoutePoint({
                action: 'gather',
                x: resource.pos.x,
                y: resource.pos.y,
                detail: resource.resource
              });
            }

            const typeStr = (resource.type || '').toLowerCase();
            const resName = (resource.resource || '').toLowerCase();
            const isOre = typeStr.includes('ore') || typeStr.includes('rock') || resName.includes('ore') || resName.includes('rock') || resName.includes('copper') || resName.includes('iron') || resName.includes('gold') || resName.includes('silver') || resName.includes('crystal');
            const isTree = typeStr.includes('tree') || typeStr.includes('wood') || resName.includes('tree') || resName.includes('wood') || resName.includes('log') || resName.includes('oak') || resName.includes('pine') || resName.includes('palm');

            if (isOre) {
              updates.sessionOresMined = state.sessionOresMined + 1;
              updates.lifetimeStats = {
                ...state.lifetimeStats,
                oresMined: { ...state.lifetimeStats.oresMined, [resource.resource]: (state.lifetimeStats.oresMined[resource.resource] || 0) + 1 }
              };
            } else if (isTree) {
              updates.sessionTreesCut = state.sessionTreesCut + 1;
              updates.lifetimeStats = {
                ...state.lifetimeStats,
                treesCut: { ...state.lifetimeStats.treesCut, [resource.resource]: (state.lifetimeStats.treesCut[resource.resource] || 0) + 1 }
              };
            } else {
              updates.sessionPlantsHarvested = state.sessionPlantsHarvested + 1;
              updates.lifetimeStats = {
                ...state.lifetimeStats,
                plantsHarvested: { ...state.lifetimeStats.plantsHarvested, [resource.resource]: (state.lifetimeStats.plantsHarvested[resource.resource] || 0) + 1 }
              };
            }
          }

          const exactCooldown = this.lastCooldowns[key];
          let dbCooldown = getFallbackCooldown(resource.resource);
          
          // Use our local database as the absolute source of truth since the game server sometimes sends incorrect default 30m cooldowns.
          // Only use the server's cooldown if our database doesn't know the entity (returns default 300s).
          let cooldown = (dbCooldown !== 300) ? dbCooldown : (exactCooldown !== undefined ? exactCooldown : 300);

          const respawnTime = Date.now() + (cooldown * 1000);
          delete this.lastCooldowns[key];
    
          const newTimer = {
            id: `resource-${key}`,
            name: resource.resource,
            category: resource.type as 'Trees' | 'Ores' | 'Plants',
            expectedRespawnTime: respawnTime,
            pos: resource.pos,
            zone: currentZone
          };
          updates.timers = { ...state.timers, [newTimer.id]: newTimer };
          
          const { [key]: _, ...remainingResources } = state.resources;
          updates.resources = remainingResources;

          return updates;
        });
      } else if (resource && data.nodeHp !== undefined) {
        useTrackerStore.setState((state) => ({
          resources: {
            ...state.resources,
            [key]: { ...state.resources[key], hp: data.nodeHp, gathered: false }
          }
        }));
      }
    }
  }

  static clearAll() {
    useTrackerStore.getState().clearResources();
  }
}
