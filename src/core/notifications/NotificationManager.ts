import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { translations } from '../../i18n/translations';
import { SAFE_ZONES } from '../constants';
import { ResourceTracker } from '../trackers/ResourceTracker';
export class NotificationManager {
  private static lastDurabilityWarning: number = 0;

  static showLootToast(_items: Array<{ name: string; qty: number; rarity?: string }>, _runestones = 0) {
    // Old duplicate loot popup toasts disabled — loot is now exclusively recorded in the Loot Log HUD Widget
    return;
  }

  private static lootBatchItems: Array<{ name: string; qty: number; rarity?: string }> = [];
  private static lootBatchRunestones = 0;
  private static lootBatchTimer: ReturnType<typeof setTimeout> | null = null;

  static queueLootToast(itemName: string, qty: number, isRunestone = false) {
    if (isRunestone) {
      this.lootBatchRunestones += qty;
    } else {
      const existing = this.lootBatchItems.find(i => i.name === itemName);
      if (existing) {
        existing.qty += qty;
      } else {
        this.lootBatchItems.push({ name: itemName, qty });
      }
    }

    // Non-resetting immediate 30ms batch window:
    // Fires instantly within 30ms of first item pickup without delaying for subsequent pickups
    if (!this.lootBatchTimer) {
      this.lootBatchTimer = setTimeout(() => {
        this.showLootToast([...this.lootBatchItems], this.lootBatchRunestones);
        this.lootBatchItems = [];
        this.lootBatchRunestones = 0;
        this.lootBatchTimer = null;
      }, 30);
    }
  }

  static timerPing(entityName: string) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts) return;
    
    settingsStore.addNotification({
      type: 'info',
      title: 'Respawn Soon',
      message: `${entityName} is respawning in 10 seconds!`,
      duration: 10000,
    });
  }

  static showDeathDropToast(runeCount: number, zone: string, pos: {x: number, y: number}) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts) return;
    
    settingsStore.addNotification({
      type: 'death_drop',
      title: 'You Died!',
      message: `Dropped ${runeCount} Runes in ${zone}. Tracker active.`,
      persistent: true,
      data: { runeCount, zone, pos }
    } as any);
  }

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
    const isSafeZone = SAFE_ZONES.some(z => zone.includes(z));
    if (!isSafeZone) {
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

  static showToolWarningToast(toolName: string) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.toolWarning) return;
    
    // Check if warning already exists to avoid spam
    const hasWarning = settingsStore.notifications.some(n => n.tag === 'tool_warning');
    if (hasWarning) return;

    settingsStore.addNotification({
      type: 'combat', // Using combat type for red/warning style
      title: 'Tool Not Equipped!',
      message: `You have a ${toolName} in your inventory but it is not equipped. Put it in your hotbar to use it!`,
      tag: 'tool_warning',
      persistent: true
    } as any);
  }

  static dismissToolWarningToast() {
    const settingsStore = useSettingsStore.getState();
    const warning = settingsStore.notifications.find(n => n.tag === 'tool_warning');
    if (warning) {
      settingsStore.removeNotification(warning.id);
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

  static rareSpawn(itemName: string, _pos: { x: number; y: number }, distance: number) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts || !settingsStore.notificationSettings.rareSpawnAlerts) return;

    const lang = settingsStore.language || 'en';
    const t = (translations as any)[lang] || translations.en;
    
    const sanitizedName = ResourceTracker.sanitizeResourceName(itemName);
    
    let message = t.alerts?.rareSpawn || "⭐ [{item}] spawned {dist}m away!";
    message = message.replace('{item}', sanitizedName).replace('{dist}', distance.toString());

    settingsStore.addNotification({
      type: 'rare',
      title: 'Rare Resource Spawned!',
      message: message
    });
  }

  static marketSnipeAlert(itemName: string, discountPct: number, priceEth: number) {
    const settingsStore = useSettingsStore.getState();
    if (!settingsStore.notificationSettings.enabled || !settingsStore.notificationSettings.toasts) return;

    settingsStore.addNotification({
      type: 'market', 
      title: '🎯 Snipe Alert!',
      message: `${itemName} listed at ${priceEth.toFixed(5)} ETH (${Math.round(discountPct * 100)}% discount)!`
    });
  }
}

