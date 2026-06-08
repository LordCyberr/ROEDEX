import { useTrackerStore } from '../../store/trackerStore';
import { ResourceRespawnEvent, ResourceNode } from '../../types/events';
import { getFallbackCooldown } from '../../data/cooldowns';

export class ResourceTracker {
  static sanitizeResourceName(raw: string): string {
    let clean = raw.trim();
    if (clean.toLowerCase() === 'crystalrock') return 'Crystal';
    if (clean.toLowerCase() === 'dinobones') return 'Dino Bone';
    
    // Remove common suffixes case-insensitively (handles "Silverore" or "Silver ore")
    clean = clean.replace(/\s*(ore|node|flower|tree)$/i, '').trim();
    
    // Format camelCase to Title Case if needed
    clean = clean.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    return clean.replace(/^./, (str) => str.toUpperCase());
  }

  static parseSpawn(event: ResourceRespawnEvent, zone: string): ResourceNode {
    const store = useTrackerStore.getState();
    const key = `${zone}-${event.idx}`;
    const existing = store.resources[key];
    const rawResource = event.resource || existing?.resource || 'Unknown';
    
    return {
      idx: event.idx,
      type: event.type || existing?.type || 'Unknown',
      resource: this.sanitizeResourceName(rawResource),
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
    const key = `${zone}-${event.idx}`;
    const store = useTrackerStore.getState();
    const isNew = !store.resources[key];
    
    store.setResource(key, node);

    if (isNew && node.resource) {
      const name = node.resource.toLowerCase();
      if (name.includes('rare') || name.includes('crystal') || name.includes('gem')) {
        import('../companion/BobCompanion').then(({ BobCompanion }) => {
          BobCompanion.onRareResource();
        });
      }
    }
  }

  static lastCooldowns: Record<string, number> = {};

  static handleGather(payload: any, currentZone: string) {
    const store = useTrackerStore.getState();
    const data = payload?.data || payload;

    // We can receive two types of events here: gather_hit_ack and resource_cooldown
    // gather_hit_ack: { nodeIndex, damage, nodeHp, isGathered }
    // resource_cooldown: { spawnIndex, cooldownSeconds }
    
    const index = data.spawnIndex !== undefined ? data.spawnIndex : data.nodeIndex;
    if (data.cooldownSeconds !== undefined && index !== undefined) {
       // Server sent exact cooldown before the gather hit ack
       const key = `${currentZone}-${index}`;
       this.lastCooldowns[key] = data.cooldownSeconds;
       return;
    }

    if (data.nodeIndex !== undefined) {
      const key = `${currentZone}-${data.nodeIndex}`;
      const resource = store.resources[key];
      
      // Node is dead when gathered = true
      if (data.isGathered === true && resource) {
        if (!resource.gathered) {
          const name = resource.resource.toLowerCase();
          if (name.includes('ore') || name.includes('rock') || name.includes('copper') || name.includes('iron') || name.includes('gold') || name.includes('silver') || name.includes('titanium') || name.includes('crystal') || name.includes('dino bone')) {
             store.incrementOresMined();
             store.incrementLifetimeStat('oresMined', resource.resource, 1);
          } else if (name.includes('tree') || name.includes('wood') || name.includes('log') || name.includes('oak') || name.includes('heart')) {
             store.incrementTreesCut();
             store.incrementLifetimeStat('treesCut', resource.resource, 1);
          } else {
             store.incrementPlantsHarvested();
             store.incrementLifetimeStat('plantsHarvested', resource.resource, 1);
          }
        }

        // Use the exact cooldown if we got it recently, else fallback
        const exactCooldown = this.lastCooldowns[key];
        let cooldown = exactCooldown !== undefined ? exactCooldown : getFallbackCooldown(resource.resource);
        
        // Force Witchbane to exactly 90 minutes regardless of server response
        if (resource.resource.toLowerCase().includes('witchbane')) {
           cooldown = 5400;
        }

        const respawnTime = Date.now() + (cooldown * 1000);
        
        // Reset cache for this node
        delete this.lastCooldowns[key];
  
        // Add timer
        store.addTimer({
          id: `resource-${key}`,
          name: resource.resource,
          category: resource.type,
          expectedRespawnTime: respawnTime,
          pos: resource.pos
        });
  
        store.updateResourceHp(key, 0, true);
      } else if (resource && data.nodeHp !== undefined) {
        store.updateResourceHp(key, data.nodeHp, false);
      }
    }
  }

  static clearAll() {
    useTrackerStore.getState().clearResources();
  }
}
