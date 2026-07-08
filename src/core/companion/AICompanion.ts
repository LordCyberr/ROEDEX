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
  private static lastActivityTime: number = Date.now();
  private static isBored: boolean = false;
  private static activityCheckInterval: any = null;
  private static lastExcitedTime: number = 0;

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
    this.initActivityChecks();
  }

  static onActivity() {
    const wasBored = this.isBored;
    this.lastActivityTime = Date.now();
    this.isBored = false;
    
    if (wasBored) {
      useSettingsStore.getState().setBobMood('idle');
      
      const lang = useSettingsStore.getState().language || 'en';
      let backMsg = "Welcome back! Ready to get back to the grind?";
      if (lang === 'es') backMsg = "¡Bienvenido de vuelta! ¿Listo para volver al trabajo?";
      if (lang === 'ru') backMsg = "С возвращением! Готов вернуться к гринду?";
      if (lang === 'ko') backMsg = "돌아온 걸 환영해요! 다시 파밍을 시작해볼까요?";
      
      this.sendBobMessage('chat', backMsg);
    }
  }

  static initActivityChecks() {
    if (this.activityCheckInterval) clearInterval(this.activityCheckInterval);
    this.activityCheckInterval = setInterval(() => {
      const now = Date.now();
      const settings = useSettingsStore.getState();
      if (!settings.notificationSettings.companionMode) return;
      
      // Trigger bored message if AFK for 10 minutes (600,000ms)
      if (!this.isBored && now - this.lastActivityTime >= 600000) {
        this.isBored = true;
        useSettingsStore.getState().setBobMood('thinking');
        
        const lang = settings.language || 'en';
        let boredMsg = "Are we just standing here? I'm getting a bit bored...";
        if (lang === 'es') boredMsg = "¿Nos vamos a quedar aquí parados? Me estoy aburriendo un poco...";
        if (lang === 'ru') boredMsg = "Мы просто стоим здесь? Мне становится скучновато...";
        if (lang === 'ko') boredMsg = "우리 그냥 여기 서 있는 건가요? 조금 지루해지네요...";
        
        this.sendBobMessage('chat', boredMsg);
      }
    }, 30000); // Check every 30 seconds
  }

  static onPpsSpike(pps: number) {
    const now = Date.now();
    // Cooldown of 2 minutes for excitement messages so he doesn't spam
    if (now - this.lastExcitedTime < 120000) return;
    this.lastExcitedTime = now;

    useSettingsStore.getState().setBobMood('happy');
    setTimeout(() => {
      // Return to idle mood after some time if not bored
      if (!this.isBored) {
        useSettingsStore.getState().setBobMood('idle');
      }
    }, 10000);

    const lang = useSettingsStore.getState().language || 'en';
    let excitedMsg = `Whoa! ${pps} packets/sec! Combat is getting intense, stay focused!`;
    if (lang === 'es') excitedMsg = `¡Guau! ¡${pps} paquetes/seg! ¡El combate se está poniendo tenso, mantén la concentración!`;
    if (lang === 'ru') excitedMsg = `Ого! ${pps} пак/сек! Бой становится жарким, сосредоточься!`;
    if (lang === 'ko') excitedMsg = `와우! 초당 ${pps} 패킷! 전투가 치열해지고 있어요. 집중하세요!`;

    this.sendBobMessage('chat', excitedMsg);
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
      // Replace {username} or {name} if it exists in the localized string
      if (line.includes('{username}') || line.includes('{name}')) {
        line = line.replace(/\{name\}/g, username).replace(/\{username\}/g, username);
      } else {
        // Fallback for strings that don't have the template yet
        const settings = useSettingsStore.getState();
        const lang = settings.language || 'en';
        
        if (lang === 'ko') {
          line = `${username}님! ${line}`;
        } else if (lang === 'es') {
          line = `¡Hola ${username}! ${line}`;
        } else if (lang === 'ru') {
          line = `Эй, ${username}! ${line}`;
        } else {
          line = `Hey ${username}! ${line}`;
        }
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

  private static getContextualLootCommentary(itemName: string, quantity: number, rarity: string): string {
    const cleanName = itemName.replace(/^./, str => str.toUpperCase());
    const qtyStr = quantity > 1 ? `${quantity}x ` : '';
    const isSword = cleanName.toLowerCase().includes('sword') || cleanName.toLowerCase().includes('blade') || cleanName.toLowerCase().includes('dagger') || cleanName.toLowerCase().includes('staff') || cleanName.toLowerCase().includes('bow');
    const isMaterial = cleanName.toLowerCase().includes('core') || cleanName.toLowerCase().includes('crystal') || cleanName.toLowerCase().includes('essence') || cleanName.toLowerCase().includes('ore') || cleanName.toLowerCase().includes('crown') || cleanName.toLowerCase().includes('heart');

    const lang = useSettingsStore.getState().language || 'en';

    if (lang === 'es') {
      if (rarity === 'mythic' || rarity === 'priority') {
        if (isSword) return `¡¿Guau! ¡¿Un ${cleanName}?! ¿Vas a equiparlo o a vendérselo al herrero?`;
        if (isMaterial) return `¡¿Un ${cleanName}?! ¡Ese material mítico vale una fortuna, no lo pierdas!`;
        return `¡Cielos, un ${cleanName}! ¡Eso es increíblemente raro!`;
      }
      return `¡Mira eso! Encontraste ${qtyStr}${cleanName}. ¡Un botín genial!`;
    }
    if (lang === 'ru') {
      if (rarity === 'mythic' || rarity === 'priority') {
        if (isSword) return `ОГО! ${cleanName}?! Собираешься экипировать его или продашь кузнецу?`;
        if (isMaterial) return `${cleanName}?! Этот мифический материал стоит целое состояние, не потеряй его!`;
        return `Ого, ${cleanName}! Это невероятно редко!`;
      }
      return `Посмотри на это! Ты нашел ${qtyStr}${cleanName}. Отличный лут!`;
    }
    if (lang === 'ko') {
      if (rarity === 'mythic' || rarity === 'priority') {
        if (isSword) return `와우! ${cleanName}?! 장착하실 건가요, 아니면 대장장이에게 파실 건가요?`;
        if (isMaterial) return `${cleanName}?! 이 신화적인 재료는 어마어마한 가치가 있어요. 절대 잃어버리지 마세요!`;
        return `세상에, ${cleanName}이라니! 정말 엄청나게 희귀하네요!`;
      }
      return `이것 좀 보세요! ${qtyStr}${cleanName}을(를) 찾았어요. 멋진 전리품이네요!`;
    }
    // Default to English
    if (rarity === 'mythic' || rarity === 'priority') {
      if (isSword) return `WHOA! A ${cleanName}?! Are you going to equip that or sell it to the Blacksmith?`;
      if (isMaterial) return `A ${cleanName}?! That mythic material is worth a fortune, don't lose it!`;
      return `Holy moly, a ${cleanName}! That is incredibly rare!`;
    }
    return `Look at that! You found ${qtyStr}${cleanName}. Nice loot!`;
  }

  static onRareDrop(itemName?: string, quantity: number = 1) {
    this.onActivity();
    const settings = useSettingsStore.getState();
    if (settings.notificationSettings.companionMode && settings.notificationSettings.bobRareDrop) {
      if (itemName) {
        const line = this.getContextualLootCommentary(itemName, quantity, 'rare');
        this.sendBobMessage('chat', line);
      } else {
        this.triggerCategory('rareDrop', this.getQuotes().rareDrop, 5000, 'bobRareDrop', true);
      }
    }
    if (settings.notificationSettings.audio) playSound('rare');
  }

  static onMythicDrop(itemName?: string, quantity: number = 1) {
    this.onActivity();
    const settings = useSettingsStore.getState();
    if (settings.notificationSettings.companionMode && settings.notificationSettings.bobRareDrop) {
      if (itemName) {
        const line = this.getContextualLootCommentary(itemName, quantity, 'mythic');
        this.sendBobMessage('chat', line);
      } else {
        this.triggerCategory('mythicDrop', this.getQuotes().mythicDrop, 5000, 'bobRareDrop', true);
      }
    }
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
    this.onActivity();
    const settings = useSettingsStore.getState();
    if (settings.notificationSettings.companionMode && settings.notificationSettings.bobRareDrop) {
      const line = this.getContextualLootCommentary(itemName, quantity, 'priority');
      this.sendBobMessage('chat', line);
    } else {
      const alertStr = this.getAlerts().mythicDrop || "HURRAY! You finally got {qty}x {item}!";
      this.sendBobMessage('chat', alertStr.replace('{qty}', quantity.toString()).replace('{item}', itemName));
    }
  }
}
