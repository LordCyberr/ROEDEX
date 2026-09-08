import { useTrackerStore } from '../../store/trackerStore';
import { DROP_LOOKUP, LOOT_LOOKUP } from '../../data/gameDatabase';
import { getResellValue } from '../../data/prices';
import { AICompanion } from '../companion/AICompanion';
import { useSettingsStore } from '../../store/settingsStore';
import { DropSpawnEvent, LootDrop } from '../../types/events';
import { NotificationManager } from '../notifications/NotificationManager';

export class LootTracker {
  private static cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private static lootNotificationBatch: Map<string, { name: string; qty: number; rarity: string }> = new Map();
  private static lootNotificationTimer: ReturnType<typeof setTimeout> | null = null;

  static initCleanup() {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
    this.cleanupInterval = setInterval(() => {
      useTrackerStore.getState().clearExpiredLoot();
    }, 5000);
  }

  static notifyLoot(itemId: string, quantity: number) {
    const settingsStore = useSettingsStore.getState();
    if (!itemId) return;

    const dbKey = itemId.toLowerCase().replace(/[^a-z0-9]/g, '');
    let dropInfo = DROP_LOOKUP[dbKey];
    if (!dropInfo) {
      // Check the flat LOOT_ITEMS registry (weapons, tools, currencies, loot boxes, etc.)
      const lootItem = LOOT_LOOKUP[dbKey];
      if (lootItem) {
        dropInfo = {
          itemId: lootItem.itemId,
          sanitizedName: lootItem.sanitizedName,
          rarity: lootItem.rarity
        };
      } else {
        const hasResellValue = getResellValue(itemId, 1) > 0;
        if (!hasResellValue) {
          // Genuine unknown — log warning and generate last-resort fallback
          if ((import.meta as any).env?.DEV) console.warn(`[LootTracker] Unknown loot item detected: ${itemId}, generating fallback.`);
        }
        dropInfo = {
          itemId: itemId,
          sanitizedName: itemId.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()),
          rarity: 'common'
        };
      }
    }
    
    // If we don't know what the item is, assume it's common.
    let rarity: string = dropInfo.rarity;
    let sanitizedName: string = dropInfo.sanitizedName;

    // Trigger AI Companion audio / voice reactions
    if (rarity === 'mystical') AICompanion.onMythicDrop(sanitizedName, quantity);
    else if (rarity === 'rare') AICompanion.onRareDrop(sanitizedName, quantity);

    if (rarity === 'common') return; // Skip common drops for toast notifications
    
    // Ensure all flags are true (assume we will add enableLootNotifications to settingsStore soon)
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.lootEvents || !(settingsStore.notificationSettings as any).notifyLoot) return;

    // Check if already notified this session to prevent spam
    if (settingsStore.notifiedEntities[`loot_${dbKey}`]) return;
    settingsStore.markEntityNotified(`loot_${dbKey}`);

    const existing = this.lootNotificationBatch.get(dbKey);
    if (existing) {
      existing.qty += quantity;
    } else {
      this.lootNotificationBatch.set(dbKey, { name: sanitizedName, qty: quantity, rarity });
    }

    // Debounce batch dispatch by 200ms so rapid/simultaneous drops are combined
    if (!this.lootNotificationTimer) {
      this.lootNotificationTimer = setTimeout(() => {
        this.flushLootNotifications();
      }, 200);
    }
  }

  private static flushLootNotifications() {
    this.lootNotificationTimer = null;
    const settingsStore = useSettingsStore.getState();

    this.lootNotificationBatch.forEach((item) => {
      const qtyStr = item.qty > 1 ? `${item.qty}x ` : '';
      const message = `${qtyStr}${item.name} (${item.rarity})`;
      
      let title = `${item.rarity.toUpperCase()} DROP!`;

      settingsStore.addNotification({
        type: item.rarity,
        title,
        message,
        tag: `loot-${item.name.toLowerCase()}`,
        qty: item.qty
      } as any);
    });

    this.lootNotificationBatch.clear();
  }

  static handleSpawn(event: DropSpawnEvent) {
    const store = useTrackerStore.getState();
    const drop: LootDrop = {
      dropId: event.dropId,
      itemName: event.itemName,
      quantity: event.quantity,
      pos: event.pos,
      spawnTime: Date.now(),
      zone: store.currentZone
    };
    store.addLoot(drop);

    if (event.itemName) {
        this.notifyLoot(event.itemName, event.quantity || 1);
    }
  }

  static handlePickup(dropId: string) {
    const store = useTrackerStore.getState();
    const drop = store.loot[dropId];
    if (drop && drop.itemName) {
      const dbKey = drop.itemName.toLowerCase().replace(/[^a-z0-9]/g, '');
      let dropInfo = DROP_LOOKUP[dbKey];
      if (!dropInfo) {
        const lootItem = LOOT_LOOKUP[dbKey];
        if (lootItem) {
          dropInfo = {
            itemId: lootItem.itemId,
            sanitizedName: lootItem.sanitizedName,
            rarity: lootItem.rarity
          };
        } else {
          const hasResellValue = getResellValue(drop.itemName, 1) > 0;
          if (!hasResellValue) {
            if ((import.meta as any).env?.DEV) console.warn(`[LootTracker] Unknown loot item detected: ${drop.itemName}, generating fallback.`);
          }
          dropInfo = {
            itemId: drop.itemName,
            sanitizedName: drop.itemName.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()),
            rarity: 'common'
          };
        }
      }
      if (dropInfo) {
        const sanitizedName = dropInfo.sanitizedName;
        const isRune = drop.itemName.toLowerCase().includes('rune');
        NotificationManager.queueLootToast(sanitizedName, drop.quantity || 1, isRune);

        // Clear death recovery mode when runestones are recovered
        if (isRune) {
          useTrackerStore.getState().setDeathRecoveryMode(false);
          useTrackerStore.getState().setPendingDeathDrop(null);
        }
      }
    }
    store.removeLoot(dropId);
  }

  static clearAll() {
    useTrackerStore.getState().clearLoot();
  }
}
