import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { translations } from '../../i18n/translations';
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

  private static hasShownInitializing: boolean = false;
  private static hasGreeted: boolean = false;

  static resetGreeting() {
    this.hasShownInitializing = false;
    this.hasGreeted = false;
  }
  
  static showInitializingToast() {
    if (this.hasShownInitializing) return;

    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts) return;
    
    // Do not show greet toast if the boot sequence (tutorialStep 0) is still running
    if (!settingsStore.notificationSettings.tutorialCompleted && settingsStore.notificationSettings.tutorialStep === 0) return;

    this.hasShownInitializing = true;

    const lang = settingsStore.language || 'en';
    const t = (translations as any)[lang] || translations.en;

    // Send the First boot sequence toast immediately
    settingsStore.addNotification({
      type: 'boot-sequence',
      title: t.bootSequence?.systemBoot || 'SYSTEM BOOT',
      message: t.bootSequence?.initializing || 'Initializing ROEDEX interface...'
    });
  }

  static greetUser(username?: string) {
    if (this.hasGreeted) return;

    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts) return;
    
    // Do not show greet toast if the boot sequence (tutorialStep 0) is still running
    if (!settingsStore.notificationSettings.tutorialCompleted && settingsStore.notificationSettings.tutorialStep === 0) return;

    this.hasGreeted = true;

    const lang = settingsStore.language || 'en';
    const t = (translations as any)[lang] || translations.en;

    // Wait 8 seconds to let the game load and animation loop smoothly before sending the connection established / welcome toast
    setTimeout(() => {
      let welcomeMsg = t.bootSequence?.welcome || 'Welcome';
      let fullMessage = username ? `${welcomeMsg}, ${username}!` : `${welcomeMsg} to ROEDEX!`;
      
      // Fallback adjustments for non-English spacing
      if (lang === 'ko' && username) {
        fullMessage = `${username}님, 환영합니다!`; // specific natural Korean greeting
      } else if (lang === 'ko') {
        fullMessage = `ROEDEX에 오신 것을 환영합니다!`;
      }
      
      settingsStore.addNotification({
        type: 'system-online',
        title: t.bootSequence?.online || 'CONNECTION ESTABLISHED',
        message: fullMessage
      });
    }, 8000);
  }
}
