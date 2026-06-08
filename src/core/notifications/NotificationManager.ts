import { useTrackerStore } from '../../store/trackerStore';

export class NotificationManager {
  private static lastDurabilityWarning: number = 0;

  static checkDurability(toolName: string, current: number, max: number) {
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts || !store.notificationSettings.toolWarning) return;

    if (max <= 0) return;
    const pct = current / max;
    
    if (current === 0) {
      store.addNotification({
        type: 'combat',
        title: 'Weapon Broken!',
        message: `Your ${toolName} has broken! Check your inventory.`
      });
    } else if (pct <= 0.1 && current > 0) {
      const now = Date.now();
      if (now - this.lastDurabilityWarning > 60000) {
        this.lastDurabilityWarning = now;
        store.addNotification({
          type: 'combat',
          title: 'Durability Warning',
          message: `Your ${toolName} is about to break! (${current}/${max})`
        });
      }
    }
  }

  static onWeaponUnequipped(toolName: string) {
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts || !store.notificationSettings.toolWarning) return;
    
    const zone = store.currentZone.toLowerCase();
    if (!zone.includes('town') && !zone.includes('bank') && !zone.includes('home')) {
       setTimeout(() => {
          const currentState = useTrackerStore.getState();
          if (!currentState.weapon) {
            store.addNotification({
              type: 'combat',
              title: 'Weapon Unequipped',
              message: `Your ${toolName} was unequipped! You are empty-handed.`
            });
          }
       }, 1500);
    }
  }

  private static hasGreeted: boolean = false;

  static greetUser(username?: string) {
    if (this.hasGreeted) return;
    this.hasGreeted = true;

    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts) return;

    // Use a generic system greeting
    store.addNotification({
      type: 'info',
      title: 'System',
      message: username ? `Welcome back, ${username}!` : `Welcome to ROEDEX!`
    });
  }
}
