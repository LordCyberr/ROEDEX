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

  private static weaponTimer: ReturnType<typeof setTimeout> | null = null;

  static onWeaponUnequipped(toolName: string) {
    const gameStore = useTrackerStore.getState();
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.toolWarning) return;
    
    const zone = gameStore.currentZone.toLowerCase();
    if (!zone.includes('town') && !zone.includes('bank') && !zone.includes('home')) {
       if (this.weaponTimer) clearTimeout(this.weaponTimer);
       this.weaponTimer = setTimeout(() => {
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
  private static bootSequenceFinished: boolean = false;

  static resetGreeting() {
    this.hasShownInitializing = false;
    this.hasGreeted = false;
    this.bootSequenceFinished = false;
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
      NotificationManager.bootSequenceFinished = true;
    }, 8000);
  }

  static showZoneLoadingToast(zoneName: string) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.zoneChange) return;
    
    // Ignore early initializations
    if (!zoneName || zoneName === 'Unknown') return;
    
    // Do not show zone toasts if the boot sequence or system-online toast is currently on screen
    const isBooting = settingsStore.notifications.some((n: any) => n.type === 'boot-sequence' || n.type === 'system-online');
    if (isBooting) return;

    // Do not show zone toasts if the boot sequence is still running
    if (!this.bootSequenceFinished) return;

    let title = 'LOADING DATA...';
    let message = 'Scanning new environment...';
    let specificType = 'zone-change';

    const lZone = zoneName.toLowerCase();
    
    if (lZone.includes('forest') || lZone.includes('woods')) {
      title = 'ENTERING WILDERNESS';
      message = 'Scanning for hostiles and mapping resource nodes...';
      specificType = 'zone-change-forest';
    } else if (lZone.includes('mine') || lZone.includes('cave') || lZone.includes('dungeon')) {
      title = 'ENTERING MINES';
      message = 'Calibrating dark-vision and surveying ore veins...';
      specificType = 'zone-change-cave';
    } else if (lZone.includes('home')) {
      title = 'ENTERING HOME';
      message = 'Syncing local inventory and safe-storage...';
      specificType = 'zone-change-home';
    } else if (lZone.includes('guild') || lZone.includes('tavern') || lZone.includes('city') || lZone.includes('town')) {
      title = 'ENTERING SOCIAL HUB';
      message = 'Refreshing multiplayer roster and guild status...';
      specificType = 'zone-change-social';
    } else if (lZone.includes('blacksmith') || lZone.includes('forge')) {
      title = 'ENTERING FORGE';
      message = 'Analyzing crafting schematics and gear metrics...';
      specificType = 'zone-change-forge';
    } else {
      title = `ENTERING ${zoneName.toUpperCase()}`;
      message = 'Syncing local coordinates...';
    }

    settingsStore.addNotification({
      type: specificType,
      title,
      message
    });
  }
}
