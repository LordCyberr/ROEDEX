import { useTrackerStore } from '../../store/trackerStore';
import { useSettingsStore } from '../../store/settingsStore';
import { companionTranslations } from '../../i18n/companionTranslations';
import { formatInternalName } from '../../utils/formatters';
import { playSound } from '../../utils/sound';

export class AICompanion {
  private static lastZone: string = '';
  private static warnedTools: Set<string> = new Set();
  private static hasGreeted: boolean = false;
  
  static resetGreeting() {
    this.hasGreeted = false;
  }

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
    const settings = useSettingsStore.getState();
    const lang = settings.language || 'en';
    const baseQuotes = (companionTranslations as any)[lang] || companionTranslations.en;
    
    const activeCompId = settings.activeCompanion || 'bob';
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
    const settings = useSettingsStore.getState();
    const lang = settings.language || 'en';
    
    // The alerts are shared across all companions and are defined in companionTranslations
    const premiumQuotes = (companionTranslations as any)[lang] || companionTranslations.en;
    return premiumQuotes.alerts || companionTranslations.en.alerts;
  }

  private static getFrequencyMs() {
    const settings = useSettingsStore.getState();
    const freq = settings.notificationSettings.bobFrequency;
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
      this.checkGrindingFatigue();
      this.fireRandomIdleMessage();
      this.resetIdleTimer();
    }, nextMs);
  }

  private static checkGrindingFatigue() {
    const store = useTrackerStore.getState();
    if (!store.sessionActive || !store.sessionStartTime) return;
    const hoursElapsed = (Date.now() - store.sessionStartTime) / (1000 * 60 * 60);
    if (hoursElapsed > 2) {
      this.triggerCategory('fatigue', [
        "You've been grinding for over 2 hours straight! Don't forget to hydrate!",
        "Take a quick break, champion. Even the best need to rest their eyes.",
        "Your dedication is insane, but maybe stretch your legs for a minute?",
        "Two hours of non-stop action! Grab some water!"
      ], 3600000, 'bobTips', true); // 1 hour cooldown for fatigue
    }
  }

  private static fireRandomIdleMessage() {
    const store = useTrackerStore.getState();
    const settings = useSettingsStore.getState();
    if (!settings.notificationSettings.companionMode) return;
    if (settings.notificationSettings.tutorialStep > 0 && !settings.notificationSettings.tutorialCompleted) return;
    
    // 1% chance for ultra rare
    if (Math.random() < 0.01 && settings.notificationSettings.bobSecret) {
      this.triggerCategory('ultraRare', this.getQuotes().ultraRare, 0, 'bobSecret');
      return;
    }

    // 20% chance for funny if enabled
    if (Math.random() < 0.20 && settings.notificationSettings.bobJokes) {
      this.triggerCategory('funny', this.getQuotes().funny, 0, 'bobJokes');
      return;
    }

    const currentZone = store.currentZone.toLowerCase();
    const quotes = this.getQuotes();
    
    // 15% chance for Zone Lore
    if (Math.random() < 0.15 && quotes.zoneLore) {
      if (currentZone.includes('forest') && quotes.zoneLore.forest) {
         this.triggerCategory('zoneLore', quotes.zoneLore.forest, 0, 'bobTips');
         return;
      }
      if ((currentZone.includes('cave') || currentZone.includes('mine')) && quotes.zoneLore.cave) {
         this.triggerCategory('zoneLore', quotes.zoneLore.cave, 0, 'bobTips');
         return;
      }
      if ((currentZone.includes('town') || currentZone.includes('bank')) && quotes.zoneLore.town) {
         this.triggerCategory('zoneLore', quotes.zoneLore.town, 0, 'bobTips');
         return;
      }
      if (currentZone.includes('guild') && quotes.zoneLore.guild) {
         this.triggerCategory('zoneLore', quotes.zoneLore.guild, 0, 'bobTips');
         return;
      }
    }

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
    
    const settings = useSettingsStore.getState();
    if (!settings.notificationSettings.enabled || !settings.notificationSettings.toasts || !settings.notificationSettings.companionMode || !settings.notificationSettings.bobGreetings) {
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
    let specificMonsterQuoteKey: string | undefined;

    if (monsterName) {
      const cleanName = formatInternalName(monsterName);
      const lowerName = monsterName.toLowerCase();
      
      if (lowerName.includes('shadow wolf') || lowerName.includes('wolf')) {
         specificMonsterQuoteKey = 'monsterShadowWolf';
      } else if (lowerName.includes('wooden golem')) {
         specificMonsterQuoteKey = 'monsterWoodenGolem';
      } else if (lowerName.includes('golem')) {
         specificMonsterQuoteKey = 'monsterGolem';
      } else if (lowerName.includes('slime')) {
         specificMonsterQuoteKey = 'monsterSlime';
      }

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
    
    const quotes = this.getQuotes();
    let linesToUse = quotes.combatWin;
    if (specificMonsterQuoteKey && quotes[specificMonsterQuoteKey]) {
       linesToUse = quotes[specificMonsterQuoteKey];
    }
    
    this.triggerCategory('combatWin', linesToUse, 60000, 'bobCombat');
    this.onActivity();
  }

  static onRareResource() {
    this.triggerCategory('rareResource', this.getQuotes().rareResource, 10000, 'bobRareResource', true);
    this.onActivity();
  }

  static onRareDrop() {
    this.triggerCategory('rareDrop', this.getQuotes().rareDrop, 5000, 'bobRareDrop', true);
    this.onActivity();
    const settings = useSettingsStore.getState();
    if (settings.notificationSettings.audio) playSound('rare');
  }

  static onMythicDrop() {
    this.triggerCategory('mythicDrop', this.getQuotes().mythicDrop, 5000, 'bobRareDrop', true);
    this.onActivity();
    const settings = useSettingsStore.getState();
    if (settings.notificationSettings.audio) playSound('mythic');
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

  static onLevelUpNear() {
    this.triggerCategory('levelUpNear', [
      "You're almost there! Just a few more to level up!",
      "I can feel the power growing! So close to the next level!",
      "Push it! You're about to level up!",
      "Just a tiny bit more XP to go!",
      "Level up incoming! Keep grinding!"
    ], 300000, 'bobAchievement', false); // 5 minutes cooldown
  }

  // Roasting Tracking
  private static deathTimestamps: number[] = [];

  static onPlayerDeath() {
    this.onActivity();
    const settings = useSettingsStore.getState();
    const roastLevel = settings.notificationSettings.roastLevel || 'mild';
    if (roastLevel === 'off') return;

    const now = Date.now();
    this.deathTimestamps.push(now);
    // Keep deaths within the last 10 minutes
    this.deathTimestamps = this.deathTimestamps.filter(t => now - t < 10 * 60000);

    const quotes = this.getQuotes() as any;

    if (this.deathTimestamps.length >= 3) {
      const lines = roastLevel === 'savage' ? quotes.deathRoastsSavage : quotes.deathRoastsMild;
      if (lines) {
        this.triggerCategory('deathRoast', lines, 60000, 'bobTips', true);
      }
    }
  }

  static onPlayerDamage(sourceName: string, damageAmount: number, isBoss: boolean = false) {
    this.onActivity();
    const settings = useSettingsStore.getState();
    const roastLevel = settings.notificationSettings.roastLevel || 'mild';
    if (roastLevel === 'off') return;

    const quotes = this.getQuotes() as any;
    const lowerSource = sourceName.toLowerCase();

    if (isBoss && damageAmount >= 50) {
      const lines = roastLevel === 'savage' ? quotes.bossRoastsSavage : quotes.bossRoastsMild;
      if (lines) {
        this.triggerCategory('bossRoast', lines, 60000, 'bobCombat', false);
      }
    } else if (lowerSource.includes('slime') || lowerSource.includes('mushroom')) {
      const lines = roastLevel === 'savage' ? quotes.slimeRoastsSavage : quotes.slimeRoastsMild;
      if (lines) {
        this.triggerCategory('slimeRoast', lines, 60000, 'bobCombat', false);
      }
    }
  }

  static zoneChange(zoneName: string) {
    this.onActivity();
    if (this.lastZone === zoneName) return;
    this.lastZone = zoneName;

    const settings = useSettingsStore.getState();

    if (!settings.notificationSettings.companionMode) {
      return;
    }

    const quotes = this.getQuotes();

    const lowerZone = zoneName.toLowerCase();

    if (lowerZone === 'guild') {
      this.triggerCategory('zone', quotes.zoneGuild || quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'alchemist') {
      this.triggerCategory('zone', quotes.zoneAlchemist || quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'blacksmith' || lowerZone === 'smith') {
      this.triggerCategory('zone', quotes.zoneSmith || quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'marketplace' || lowerZone === 'filburt') {
      this.triggerCategory('zone', quotes.zoneFilburt || quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'bank') {
      this.triggerCategory('zone', quotes.zoneBank || quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'forest') {
      this.triggerCategory('zone', quotes.zoneForest || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'house' || lowerZone === 'home' || lowerZone === "player's house") {
      this.triggerCategory('zone', quotes.zoneHome || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'town') {
      this.triggerCategory('zone', quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'mines' || lowerZone === 'mine' || lowerZone === 'cave') {
      this.triggerCategory('zone', quotes.zoneCave || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else if (lowerZone === 'tavern') {
      this.triggerCategory('zone', quotes.zoneTavern || quotes.zoneTown || [this.getAlerts().zoneEnter.replace('{zone}', zoneName)], 60000, 'bobZone');
    } else {
      if (settings.notificationSettings.bobZone) {
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
      // Contextual Crisis Mode
      useSettingsStore.getState().setBobMood('angry');
      setTimeout(() => useSettingsStore.getState().setBobMood('idle'), 15000);
    } else if (percentage < 0.1 && current < 50) {
      if (!this.warnedTools.has(toolName)) {
        this.warnedTools.add(toolName);
        this.triggerCategory('lowDurability', this.getQuotes().lowDurability, 60000, 'bobTips', true);
        // Contextual Crisis Mode
        useSettingsStore.getState().setBobMood('angry');
        setTimeout(() => useSettingsStore.getState().setBobMood('idle'), 15000);
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
    const settings = useSettingsStore.getState();
    if (!settings.notificationSettings.enabled || !settings.notificationSettings.toasts) return;
    if (settings.notificationSettings.tutorialStep > 0 && !settings.notificationSettings.tutorialCompleted) return;
    
    // Check if Bob is enabled globally and for this category
    if (!settings.notificationSettings.companionMode) return;
    const settingValue = settings.notificationSettings[settingKey as keyof typeof settings.notificationSettings];
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

    if (store.sessionPlayerName) {
      line = line.replace(/\{name\}/g, store.sessionPlayerName).replace(/\{username\}/g, store.sessionPlayerName);
    } else {
      line = line.replace(/\{name\}/g, 'friend').replace(/\{username\}/g, 'friend');
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
    const settingsStore = useSettingsStore.getState();
    settingsStore.addBobMessage({
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
