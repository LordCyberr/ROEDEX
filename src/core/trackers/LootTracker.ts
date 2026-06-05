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
      const name = event.itemName.toLowerCase();
      if (name.includes('rare') || name.includes('core') || name.includes('heart') || name.includes('gem') || name.includes('recipe')) {
        import('../companion/BobCompanion').then(({ BobCompanion }) => {
          BobCompanion.onRareDrop();
        });
      }
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
