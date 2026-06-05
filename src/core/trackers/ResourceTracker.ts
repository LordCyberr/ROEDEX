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

  static lastCooldownSeconds: number | null = null;

  static handleGather(payload: any, currentZone: string) {
    const store = useTrackerStore.getState();
    const data = payload?.data || payload;

    // We can receive two types of events here: gather_hit_ack and resource_cooldown
    // gather_hit_ack: { nodeIndex, damage, nodeHp, isGathered }
    // resource_cooldown: { spawnIndex, cooldownSeconds }
    
    if (data.cooldownSeconds !== undefined) {
       // Server sent exact cooldown before the gather hit ack
       this.lastCooldownSeconds = data.cooldownSeconds;
       return;
    }

    if (data.nodeIndex !== undefined) {
      const key = `${currentZone}-${data.nodeIndex}`;
      const resource = store.resources[key];
      
      // Node is dead when gathered = true
      if (data.isGathered === true && resource) {
        // Use the exact cooldown if we got it recently, else fallback
        const cooldown = this.lastCooldownSeconds !== null ? this.lastCooldownSeconds : getFallbackCooldown(resource.resource);
        const respawnTime = Date.now() + (cooldown * 1000);
        
        // Reset cache
        this.lastCooldownSeconds = null;
  
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
