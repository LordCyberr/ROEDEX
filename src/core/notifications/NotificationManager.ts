import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';

export class NotificationManager {
  private static lastDurabilityWarning: number = 0;

  static checkDurability(toolName: string, current: number, max: number) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.toolWarning) return;

    if (max <= 0) return;
    const pct = current / max;
    
    if (current === 0) {
      settingsStore.addNotification({
        type: 'combat',
        title: 'Weapon Broken!',
        message: `Your ${toolName} has broken! Check your inventory.`
      });
    } else if (pct <= 0.1 && current > 0) {
      const now = Date.now();
      if (now - this.lastDurabilityWarning > 60000) {
        this.lastDurabilityWarning = now;
        settingsStore.addNotification({
          type: 'combat',
          title: 'Durability Warning',
          message: `Your ${toolName} is about to break! (${current}/${max})`
        });
      }
    }
  }

  static onWeaponUnequipped(toolName: string) {
    const gameStore = useTrackerStore.getState();
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.toolWarning) return;
    
    const zone = gameStore.currentZone.toLowerCase();
    if (!zone.includes('town') && !zone.includes('bank') && !zone.includes('home')) {
       setTimeout(() => {
          const currentState = useTrackerStore.getState();
          if (!currentState.weapon) {
            settingsStore.addNotification({
              type: 'combat',
              title: 'Weapon Unequipped',
              message: `Your ${toolName} was unequipped! You are empty-handed.`
            });
          }
       }, 1500);
    }
  }

  private static hasGreeted: boolean = false;

  static resetGreeting() {
    this.hasGreeted = false;
  }

  static greetUser(username?: string) {
    if (this.hasGreeted) return;

    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts) return;
    
    // Do not show greet toast if the boot sequence (tutorialStep 0) is still running
    if (!settingsStore.notificationSettings.tutorialCompleted && settingsStore.notificationSettings.tutorialStep === 0) return;

    this.hasGreeted = true;

    // Send the First boot sequence toast
    settingsStore.addNotification({
      type: 'boot-sequence',
      title: 'SYSTEM BOOT',
      message: 'Initializing ROEDEX interface...'
    });

    // Wait 8 seconds (instead of 5) to let the loading animation loop smoothly before sending the connection established / welcome toast
    setTimeout(() => {
      settingsStore.addNotification({
        type: 'system-online',
        title: 'CONNECTION ESTABLISHED',
        message: username ? `Welcome, ${username}!` : `Welcome to ROEDEX!`
      });
    }, 8000);
  }
}
