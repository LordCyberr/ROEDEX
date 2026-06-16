import { useTrackerStore } from '../../store/trackerStore';
import { bobTranslations } from '../../i18n/bobTranslations';
import { companionTranslations } from '../../i18n/companionTranslations';
import { formatInternalName } from '../../utils/formatters';
import { playSound } from '../../utils/sound';

export class BobCompanion {
  private static lastZone: string = '';
  private static warnedTools: Set<string> = new Set();
  private static hasGreeted: boolean = false;
  
  // Cooldowns
  private static lastMessageTimes: Record<string, number> = {};
  private static lastMessageContent: Set<string> = new Set();
  
  // Slayer Tracking
  private static lastKilledMonster: string = '';
  private static consecutiveKills: number = 0;
  
  // Level Up Tracking
  private static lastNotifiedLevel: number = 0;
  
  // Timers
  private static idleTimer: any = null;

  private static getQuotes() {
    const store = useTrackerStore.getState();
    const lang = store.language || 'en';
    const baseQuotes = (bobTranslations as any)[lang] || bobTranslations.en;
    
    const activeCompId = store.activeCompanion || 'bob';
    if (activeCompId === 'bob') return baseQuotes;
    
    const premiumQuotes = (companionTranslations as any)[lang] || companionTranslations.en;
    const activePremium = premiumQuotes[activeCompId];
    
    if (activePremium) {
      return {
        ...baseQuotes,
        ...activePremium
      };
    }
    return baseQuotes;
  }
  
  public static getAlerts() {
    const store = useTrackerStore.getState();
    const lang = store.language || 'en';
    
    // The alerts are shared across all companions and are defined in companionTranslations
    const premiumQuotes = (companionTranslations as any)[lang] || companionTranslations.en;
    return premiumQuotes.alerts || companionTranslations.en.alerts;
  }

  private static getFrequencyMs() {
    const store = useTrackerStore.getState();
    const freq = store.notificationSettings.bobFrequency;
    if (freq === 'rare') return this.randomBetween(15 * 60000, 25 * 60000);
    if (freq === 'chatty') return this.randomBetween(3 * 60000, 8 * 60000);
    return this.randomBetween(8 * 60000, 15 * 60000);
  }

  private static randomBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  static startTimers() {
    this.resetIdleTimer();
  }

  static onActivity() {
    // Left empty since AFK was removed, but it's called from many hooks so keeping it empty is safe
  }

  private static resetIdleTimer() {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const nextMs = this.getFrequencyMs();
    this.idleTimer = setTimeout(() => {
      this.fireRandomIdleMessage();
      this.resetIdleTimer();
    }, nextMs);
  }

  private static fireRandomIdleMessage() {
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.bobMode) return;
    if (store.notificationSettings.tutorialStep > 0 && !store.notificationSettings.tutorialCompleted) return;
    
    // 1% chance for ultra rare
    if (Math.random() < 0.01 && store.notificationSettings.bobSecret) {
      this.triggerCategory('ultraRare', this.getQuotes().ultraRare, 0, 'bobSecret');
      return;
    }

    // 20% chance for funny if enabled
    if (Math.random() < 0.20 && store.notificationSettings.bobJokes) {
      this.triggerCategory('funny', this.getQuotes().funny, 0, 'bobJokes');
      return;
    }

    const currentZone = store.currentZone.toLowerCase();
    const quotes = this.getQuotes();
    
    // Check if there are zone specific quotes
    if (currentZone.includes('forest') && quotes.zoneForest) {
       this.triggerCategory('zoneForest', quotes.zoneForest, 0, 'bobTips');
       return;
    }
    if ((currentZone.includes('home') || currentZone.includes('house')) && quotes.zoneHome) {
       this.triggerCategory('zoneHome', quotes.zoneHome, 0, 'bobTips');
       return;
    }
    if ((currentZone.includes('cave') || currentZone.includes('mine') || currentZone.includes('dungeon')) && quotes.zoneCave) {
       this.triggerCategory('zoneCave', quotes.zoneCave, 0, 'bobTips');
       return;
    }
    if ((currentZone.includes('town') || currentZone.includes('bank')) && quotes.zoneTown) {
       this.triggerCategory('zoneTown', quotes.zoneTown, 0, 'bobTips');
       return;
    }

    // Default to normal idle
    this.triggerCategory('idle', quotes.idle, 0, 'bobTips');
  }

  static greetUser(username?: string) {
    if (this.hasGreeted) return;
    this.hasGreeted = true;
    
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts || !store.notificationSettings.bobMode || !store.notificationSettings.bobGreetings) {
      this.startTimers();
      return;
    }

    let line = this.pickRandom(this.getQuotes().login);
    if (username) {
      // Pick specific quotes that work well with names, or just prepend/append
      if (line.includes("Welcome back!")) {
        line = `Welcome back, ${username}!`;
      } else if (line.includes("Good to see you again!")) {
        line = `Good to see you again, ${username}!`;
      } else if (line.includes("Ready when you are!")) {
        line = `Ready when you are, ${username}!`;
      } else {
        line = `Hey ${username}! ${line}`;
      }
    }
    
    this.lastMessageContent.add(line);
    this.lastMessageTimes['login'] = Date.now();
    this.sendBobMessage('chat', line);
    
    this.startTimers();
  }

  static onMine() {
    this.triggerCategory('mining', this.getQuotes().mining, 60000, 'bobMining');
    this.onActivity();
  }

  static onChop() {
    this.triggerCategory('chopping', this.getQuotes().chopping, 60000, 'bobGathering');
    this.onActivity();
  }

  static onGather() {
    this.triggerCategory('gathering', this.getQuotes().gathering, 60000, 'bobGathering');
    this.onActivity();
  }

  static onCombatStart() {
    this.triggerCategory('combatStart', this.getQuotes().combatStart, 120000, 'bobCombat');
    this.onActivity();
  }

  static onCombatWin(monsterName?: string) {
    if (monsterName) {
      const cleanName = formatInternalName(monsterName);
      if (this.lastKilledMonster === monsterName) {
        this.consecutiveKills++;
        if (this.consecutiveKills >= 10 && this.consecutiveKills % 10 === 0) {
          this.sendBobMessage('chat', this.getAlerts().slayerMilestone.replace('{monster}', cleanName));
        }
      } else {
        this.lastKilledMonster = monsterName;
        this.consecutiveKills = 1;
      }
    }
    this.triggerCategory('combatWin', this.getQuotes().combatWin, 60000, 'bobCombat');
    this.onActivity();
  }

  static onRareResource() {
    this.triggerCategory('rareResource', this.getQuotes().rareResource, 10000, 'bobRareResource', true);
    this.onActivity();
  }

  static onRareDrop() {
    this.triggerCategory('rareDrop', this.getQuotes().rareDrop, 5000, 'bobRareDrop', true);
    this.onActivity();
    const store = useTrackerStore.getState();
    if (store.notificationSettings.audio) playSound('rare');
  }

  static onMythicDrop() {
    this.triggerCategory('mythicDrop', this.getQuotes().mythicDrop, 5000, 'bobRareDrop', true);
    this.onActivity();
    const store = useTrackerStore.getState();
    if (store.notificationSettings.audio) playSound('mythic');
  }

  static onLevelUp() {
    this.triggerCategory('achievement', this.getQuotes().achievement, 5000, 'bobAchievement', true);
    this.onActivity();
  }

  static onLevelUpReady(level: number) {
    if (this.lastNotifiedLevel === level) return;
    this.lastNotifiedLevel = level;
    
    // Check if quotes exist (for backward compatibility if missing in some languages)
    const quotes = this.getQuotes();
    if (quotes.levelUpReady) {
       this.triggerCategory('levelUpReady', quotes.levelUpReady, 10000, 'bobAchievement', true);
    } else {
       this.sendBobMessage('chat', this.getAlerts().levelUpReady);
    }
    this.onActivity();
  }

  static zoneChange(zoneName: string) {
    this.onActivity();
    if (this.lastZone === zoneName) return;
    this.lastZone = zoneName;

    const store = useTrackerStore.getState();
    const lowerZone = zoneName.toLowerCase();

    if (!store.notificationSettings.bobMode) {
      return;
    }

    if (lowerZone.includes('forest')) {
      this.triggerCategory('zone', this.getQuotes().zoneForest || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone.includes('home') || lowerZone.includes('house') || lowerZone.includes('hut')) {
      this.triggerCategory('zone', this.getQuotes().zoneHome || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone.includes('town') || lowerZone.includes('bank') || lowerZone.includes('city')) {
      this.triggerCategory('zone', this.getQuotes().zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone.includes('mine') || lowerZone.includes('cave') || lowerZone.includes('dungeon')) {
      this.triggerCategory('zone', this.getQuotes().zoneCave || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else {
      if (store.notificationSettings.bobZone) {
         this.sendBobMessage('zone', this.getAlerts().zoneEnter.replace('{zone}', zoneName));
      }
    }
  }

  static checkDurability(toolName: string, current: number, max: number) {
    this.onActivity();
    if (max <= 0) return;
    const percentage = current / max;
    
    if (current === 0) {
      // Check if it's a sword
      const isSword = toolName.toLowerCase().includes('sword');
      if (isSword) {
         this.sendBobMessage('chat', `Your sword broke! Check your inventory for another SWORD, not a tool!`);
      } else {
         this.sendBobMessage('chat', `Your ${toolName} broke! Equip another one from your bag.`);
      }
      this.warnedTools.add(toolName);
    } else if (percentage < 0.1 && current < 50) {
      if (!this.warnedTools.has(toolName)) {
        this.warnedTools.add(toolName);
        this.triggerCategory('lowDurability', this.getQuotes().lowDurability, 60000, 'bobTips', true);
      }
    } else if (current > 50 || percentage > 0.1) {
      this.warnedTools.delete(toolName);
    }
  }

  static onWeaponUnequipped(toolName: string) {
    const zone = useTrackerStore.getState().currentZone.toLowerCase();
    // Only warn if they are NOT in a safe zone like town/bank/home
    if (!zone.includes('town') && !zone.includes('bank') && !zone.includes('home')) {
       // Wait a tiny bit to see if they instantly equip something else. If not, they might have bug-dropped it.
       setTimeout(() => {
          const currentState = useTrackerStore.getState();
          if (!currentState.weapon) {
             this.sendBobMessage('chat', `Hey! I think I accidentally put ${toolName} back in the backpack. Can you put it back in my hand or hotbar? If you die with it in your inventory, you'll lose it!`);
          }
       }, 1500); // 1.5 seconds grace period for weapon swapping
    }
  }

  private static triggerCategory(categoryKey: string, lines: string[], cooldownMs: number, settingKey: string, bypassCooldownCheck = false) {
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts) return;
    if (store.notificationSettings.tutorialStep > 0 && !store.notificationSettings.tutorialCompleted) return;
    
    // Check if Bob is enabled globally and for this category
    if (!store.notificationSettings.bobMode) return;
    const settingValue = store.notificationSettings[settingKey as keyof typeof store.notificationSettings];
    if (settingValue === false) return; // Note: using explicit false check in case it's undefined
    
    const now = Date.now();
    const lastTime = this.lastMessageTimes[categoryKey] || 0;
    
    if (!bypassCooldownCheck && now - lastTime < cooldownMs) return;
    
    let line = this.pickRandom(lines);
    // Anti-duplicate loop (up to 5 tries)
    for (let i = 0; i < 5; i++) {
        if (!this.lastMessageContent.has(line)) break;
        line = this.pickRandom(lines);
    }

    this.lastMessageContent.add(line);
    // Clear old contents to avoid memory leak and allow eventually repeating
    if (this.lastMessageContent.size > 20) {
        const iter = this.lastMessageContent.values();
        this.lastMessageContent.delete(iter.next().value!);
    }

    this.lastMessageTimes[categoryKey] = now;
    this.sendBobMessage('chat', line);
  }

  private static pickRandom(arr: string[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private static sendBobMessage(type: string, message: string) {
    const store = useTrackerStore.getState();
    store.addBobMessage({
      title: 'Bob',
      message: message,
      type: type as any
    });
  }

  static onTabOpened(_tabId: string) {
    this.triggerCategory('idle', this.getQuotes().idle, 5000, 'bobTips');
  }

  static onAddFavorite(_npcId: string) {
    const quotes = this.getQuotes() as any;
    this.triggerCategory('achievement', quotes.achievement || quotes.idle, 5000, 'bobTips');
  }

  static onClearLoot() {
    const quotes = this.getQuotes() as any;
    this.triggerCategory('achievement', quotes.achievement || quotes.idle, 5000, 'bobTips');
  }

  static wakeUp(_reason?: string) {
    this.onActivity();
    this.triggerCategory('login', this.getQuotes().login, 5000, 'bobGreetings', true);
  }

  static onCheatDetected() {
    const alerts = this.getAlerts();
    this.sendBobMessage('chat', alerts.cheatDetected || "Cheat detected!");
  }

  static onParry() {
    const quotes = this.getQuotes() as any;
    this.triggerCategory('combatWin', quotes.parry || quotes.combatWin || quotes.idle, 5000, 'bobCombat');
  }

  static onChestOpen() {
    const quotes = this.getQuotes() as any;
    this.triggerCategory('chest', quotes.chest || quotes.achievement || quotes.idle, 5000, 'bobAchievement');
  }

  static onPriorityDrop(itemName: string, quantity: number) {
    const alertStr = this.getAlerts().mythicDrop || "HURRAY! You finally got {qty}x {item}!";
    this.sendBobMessage('chat', alertStr.replace('{qty}', quantity.toString()).replace('{item}', itemName));
  }
}
