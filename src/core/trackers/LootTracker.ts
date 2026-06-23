import { useTrackerStore } from '../../store/trackerStore';
import { getItemInfo } from '../../data/rarity';
import { AICompanion } from '../companion/AICompanion';
import { useSettingsStore } from '../../store/settingsStore';
import { DropSpawnEvent, LootDrop } from '../../types/events';

const PRIORITY_DROPS = [
  'Pure Essence',
  'Fungal Crown',
  'Alpha Wolf Heart',
  'Living Wood Core',
  'Echo Crystal',
  'Geode Core',
  'Crawler Eye',
  'Primordial Core'
];

export class LootTracker {
  static notifyLoot(itemName: string, quantity: number) {
    const settingsStore = useSettingsStore.getState();
    if (!itemName) return;

    // Check for Priority Drops first
    const isPriority = PRIORITY_DROPS.some(d => itemName.toLowerCase().includes(d.toLowerCase()));
    
    if (isPriority) {
      AICompanion.onPriorityDrop(itemName, quantity);
      if (settingsStore.notificationSettings.enabled && settingsStore.notificationSettings.toasts && settingsStore.notificationSettings.lootEvents) {
        const qtyStr = quantity > 1 ? `${quantity}x ` : '';
        settingsStore.addNotification({ 
          type: 'mythic', 
          title: 'PRIORITY DROP!', 
          message: `HURRAY! You found ${qtyStr}${itemName}!` 
        });
      }
    } else {
      // Standard Rarity check
      const info = getItemInfo(itemName);
      if (info && info.source === 'monster') {
        if (info.rarity === 'rare') {
          AICompanion.onRareDrop();
          if (settingsStore.notificationSettings.enabled && settingsStore.notificationSettings.toasts && settingsStore.notificationSettings.lootEvents) {
            settingsStore.addNotification({ type: 'rare', title: 'Rare Drop', message: `You found a ${itemName}!` });
          }
        } else if (info.rarity === 'mythic') {
          AICompanion.onMythicDrop();
          if (settingsStore.notificationSettings.enabled && settingsStore.notificationSettings.toasts && settingsStore.notificationSettings.lootEvents) {
            settingsStore.addNotification({ type: 'mythic', title: 'Mythic Drop', message: `You found a ${itemName}!` });
          }
        }
      }
    }
  }

  static handleSpawn(event: DropSpawnEvent) {
    const store = useTrackerStore.getState();
    const drop: LootDrop = {
      dropId: event.dropId,
      itemName: event.itemName,
      quantity: event.quantity,
      pos: event.pos,
      spawnTime: Date.now()
    };
    store.addLoot(drop);

    if (event.itemName) {
        this.notifyLoot(event.itemName, event.quantity || 1);
    }
    
    // Loot despawns after some time (usually 60 seconds in many MMOs)
    setTimeout(() => {
      useTrackerStore.getState().removeLoot(drop.dropId);
    }, 60000);
  }

  static handlePickup(dropId: string) {
    useTrackerStore.getState().removeLoot(dropId);
  }

  static clearAll() {
    useTrackerStore.getState().clearLoot();
  }
}
