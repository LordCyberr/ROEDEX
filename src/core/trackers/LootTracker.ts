import { useTrackerStore } from '../../store/trackerStore';
import { DropSpawnEvent, LootDrop } from '../../types/events';

export class LootTracker {
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
      import('../../data/rarity').then(({ getItemInfo }) => {
        const info = getItemInfo(event.itemName);
        if (info && info.source === 'monster') {
          if (info.rarity === 'rare') {
            import('../companion/BobCompanion').then(({ BobCompanion }) => BobCompanion.onRareDrop());
            if (store.notificationSettings.enabled && store.notificationSettings.toasts && store.notificationSettings.lootEvents) {
              store.addNotification({ type: 'rare', title: 'Rare Drop', message: `You found a ${event.itemName}!` });
            }
          } else if (info.rarity === 'mythic') {
            import('../companion/BobCompanion').then(({ BobCompanion }) => BobCompanion.onMythicDrop());
            if (store.notificationSettings.enabled && store.notificationSettings.toasts && store.notificationSettings.lootEvents) {
              store.addNotification({ type: 'mythic', title: 'Mythic Drop', message: `You found a ${event.itemName}!` });
            }
          }
        }
      });
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
