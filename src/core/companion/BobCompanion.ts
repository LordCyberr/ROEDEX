import { useTrackerStore } from '../../store/trackerStore';

export class BobCompanion {
  private static lastZone: string = '';
  private static warnedTools: Set<string> = new Set();
  private static hasGreeted: boolean = false;
  
  // Cooldowns
  private static lastMessageTimes: Record<string, number> = {};
  private static lastMessageContent: Set<string> = new Set();
  
  // Timers
  private static idleTimer: any = null;

  // Quotes
  private static readonly QUOTES = {
    login: [
      "Hey! Ready for another adventure?",
      "Welcome back!",
      "Good to see you again!",
      "Adventure awaits!",
      "Ready when you are!",
      "Let's see what we discover today!",
      "I kept an eye on things while you were away.",
      "The world looks different today.",
      "Ready to explore?",
      "Let's go break some rocks!",
      "I have a good feeling about today.",
      "Time for another journey!",
      "Welcome back, friend.",
      "I've been waiting!",
      "The forest missed you."
    ],
    idle: [
      "I wonder where all these ores come from.",
      "Do wolves have favorite wolves?",
      "Imagine being a tree for 500 years.",
      "I forgot what I was thinking about.",
      "This place feels different today.",
      "I think we're being watched.",
      "Nothing suspicious happening. Probably.",
      "One day I'm going to count every rock.",
      "I wonder if mushrooms get lonely.",
      "Still no candy clouds.",
      "The caves are quieter than usual.",
      "I should start a journal.",
      "Today feels lucky.",
      "I have questions. Many questions."
    ],
    mining: [
      "That ore won't mine itself.",
      "Nice swing!",
      "Rock acquired.",
      "That ore looked expensive.",
      "Mining is treasure hunting with extra steps.",
      "I would help, but I forgot my pickaxe.",
      "That rock never stood a chance.",
      "The cave is getting lighter.",
      "More ore! More shiny things!",
      "You can never have enough ore.",
      "That one looked valuable.",
      "The miners would be proud.",
      "A productive day underground.",
      "Keep swinging!"
    ],
    chopping: [
      "Sorry tree.",
      "Another one falls.",
      "The forest won't be happy.",
      "That tree fought bravely.",
      "Wood collected!",
      "Trees take years to grow. You take seconds to cut them.",
      "I heard that tree complaining earlier.",
      "That's a sturdy one.",
      "Good thing trees don't run away.",
      "More wood for future projects.",
      "The lumberjacks approve.",
      "That's a big trunk.",
      "Nice chop!",
      "Timber!"
    ],
    gathering: [
      "That plant smelled nice.",
      "Nature provides.",
      "Careful with the rare ones.",
      "I don't know what that plant does.",
      "Looks useful.",
      "That's a healthy harvest.",
      "The alchemists would love that.",
      "Another plant saved from boredom.",
      "Fresh ingredients!",
      "Nice find.",
      "That one looks rare.",
      "The herbalists would be jealous.",
      "A fine collection.",
      "Plants everywhere!"
    ],
    combatStart: [
      "Uh oh.",
      "Looks angry.",
      "Incoming trouble.",
      "Let's not get hit.",
      "Combat mode activated.",
      "That thing definitely noticed us.",
      "I believe in you.",
      "Good luck! No pressure.",
      "This could get interesting.",
      "Time to fight.",
      "Stay sharp!",
      "Weapons ready!",
      "Let's do this."
    ],
    combatWin: [
      "Victory!",
      "Good fight.",
      "We survived.",
      "That went well.",
      "You made that look easy.",
      "Another enemy defeated.",
      "Nice work.",
      "That was impressive.",
      "One less threat.",
      "The loot better be worth it.",
      "A clean victory.",
      "Nicely done.",
      "That enemy picked the wrong fight."
    ],
    lowDurability: [
      "Your weapon looks tired.",
      "Might want to repair soon.",
      "That durability is dropping fast.",
      "Your weapon is asking for help.",
      "Maybe stop hitting things. Just kidding.",
      "Repair time soon.",
      "The weapon sounds unhappy.",
      "Warning: Durability getting low.",
      "I think it's falling apart.",
      "Let's not break it.",
      "Maybe visit a blacksmith soon.",
      "Your weapon has seen better days."
    ],
    rareResource: [
      "Rare resource detected!",
      "Now that's valuable.",
      "You might want this one.",
      "I marked something special.",
      "Lucky find!",
      "That's not an everyday resource.",
      "Nice spot!",
      "Rare material nearby.",
      "This could be worth collecting.",
      "Don't miss this one.",
      "That's a good one.",
      "A collector's dream."
    ],
    rareDrop: [
      "Whoa!",
      "That looks rare.",
      "Nice drop!",
      "Lucky!",
      "Today's your day.",
      "Now that's treasure.",
      "Big find!",
      "Save that one.",
      "I like shiny things.",
      "Excellent drop.",
      "That's worth celebrating.",
      "Very nice.",
      "Great luck today."
    ],
    achievement: [
      "Congratulations!",
      "Nice progress.",
      "You're getting stronger.",
      "That deserves a celebration.",
      "Another milestone reached.",
      "Great work.",
      "Look at you go!",
      "Impressive.",
      "Achievement unlocked!",
      "You're on a roll.",
      "Keep it up!",
      "Outstanding work."
    ],
    zoneForest: [
      "The forest feels alive.",
      "Watch your surroundings.",
      "Fresh air!",
      "Nice place for gathering.",
      "The trees seem friendly.",
      "Lots of resources nearby.",
      "I like this place.",
      "The forest is peaceful today."
    ],
    zoneCave: [
      "It's darker down here.",
      "I hear something moving.",
      "Stay alert.",
      "Perfect place for mining.",
      "The cave never sleeps.",
      "Keep your eyes open.",
      "Something feels different.",
      "Watch your step."
    ],
    zoneTown: [
      "Civilization!",
      "Time to relax.",
      "The town feels busy today.",
      "A safe place at last.",
      "Maybe somebody sells candy clouds.",
      "Friendly faces everywhere.",
      "Good place to rest."
    ],
    funny: [
      "I once tried mining with a spoon. Didn't work.",
      "I still don't know what candy clouds are. One day I'll find one.",
      "If a tree falls and nobody hears it... we still get the wood.",
      "I think that ore was looking at me.",
      "I have several questions. No answers.",
      "I should start a rock collection. Actually, you already did.",
      "Sometimes I wonder who tracks the trackers. That would be weird.",
      "The mushrooms know something. I'm sure of it.",
      "I tried counting trees. I lost count."
    ],
    ultraRare: [
      "I found the meaning of life. I forgot it.",
      "I think we're inside a game. Don't tell anyone.",
      "The mushrooms know something.",
      "For legal reasons, I cannot fight bosses.",
      "One day we'll find candy clouds. Today is not that day.",
      "If you're reading this, Bob is working correctly.",
      "I saw a tree move. Maybe.",
      "The cave whispered my name. I'm pretending that didn't happen."
    ]
  };

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
    
    // 1% chance for ultra rare
    if (Math.random() < 0.01 && store.notificationSettings.bobSecret) {
      this.triggerCategory('ultraRare', this.QUOTES.ultraRare, 0, 'bobSecret');
      return;
    }

    // 20% chance for funny if enabled
    if (Math.random() < 0.20 && store.notificationSettings.bobJokes) {
      this.triggerCategory('funny', this.QUOTES.funny, 0, 'bobJokes');
      return;
    }

    // Default to normal idle
    this.triggerCategory('idle', this.QUOTES.idle, 0, 'bobTips');
  }

  static greetUser(username?: string) {
    if (this.hasGreeted) return;
    this.hasGreeted = true;
    
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts || !store.notificationSettings.bobMode || !store.notificationSettings.bobGreetings) {
      this.startTimers();
      return;
    }

    let line = this.pickRandom(this.QUOTES.login);
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
    this.triggerCategory('mining', this.QUOTES.mining, 60000, 'bobMining');
    this.onActivity();
  }

  static onChop() {
    this.triggerCategory('chopping', this.QUOTES.chopping, 60000, 'bobGathering');
    this.onActivity();
  }

  static onGather() {
    this.triggerCategory('gathering', this.QUOTES.gathering, 60000, 'bobGathering');
    this.onActivity();
  }

  static onCombatStart() {
    this.triggerCategory('combatStart', this.QUOTES.combatStart, 120000, 'bobCombat');
    this.onActivity();
  }

  static onCombatWin() {
    this.triggerCategory('combatWin', this.QUOTES.combatWin, 60000, 'bobCombat');
    this.onActivity();
  }

  static onRareResource() {
    this.triggerCategory('rareResource', this.QUOTES.rareResource, 10000, 'bobRareResource', true);
    this.onActivity();
  }

  static onRareDrop() {
    this.triggerCategory('rareDrop', this.QUOTES.rareDrop, 5000, 'bobRareDrop', true);
    this.onActivity();
  }

  static onLevelUp() {
    this.triggerCategory('achievement', this.QUOTES.achievement, 5000, 'bobAchievement', true);
    this.onActivity();
  }

  static zoneChange(zoneName: string) {
    this.onActivity();
    if (this.lastZone === zoneName) return;
    this.lastZone = zoneName;

    const store = useTrackerStore.getState();
    const lowerZone = zoneName.toLowerCase();

    if (!store.notificationSettings.bobMode) {
      if (store.notificationSettings.enabled && store.notificationSettings.zoneChange) {
        this.sendGenericMessage('info', 'System', `Entered Zone: ${zoneName}`);
      }
      return;
    }

    if (lowerZone.includes('forest')) {
      this.triggerCategory('zone', this.QUOTES.zoneForest, 60000, 'bobZone');
    } else if (lowerZone.includes('town') || lowerZone.includes('home') || lowerZone.includes('bank')) {
      this.triggerCategory('zone', this.QUOTES.zoneTown, 60000, 'bobZone');
    } else if (lowerZone.includes('mine') || lowerZone.includes('cave')) {
      this.triggerCategory('zone', this.QUOTES.zoneCave, 60000, 'bobZone');
    } else {
      if (store.notificationSettings.bobZone) {
         this.sendBobMessage('zone', `We've entered ${zoneName}! Keep your eyes peeled.`);
      }
    }
  }

  static checkDurability(toolName: string, current: number, max: number) {
    this.onActivity();
    if (max <= 0) return;
    const percentage = current / max;
    
    if (percentage < 0.1) {
      if (!this.warnedTools.has(toolName)) {
        this.warnedTools.add(toolName);
        this.triggerCategory('lowDurability', this.QUOTES.lowDurability, 60000, 'bobTips', true);
      }
    } else {
      this.warnedTools.delete(toolName);
    }
  }

  private static triggerCategory(categoryKey: string, lines: string[], cooldownMs: number, settingKey: string, bypassCooldownCheck = false) {
    const store = useTrackerStore.getState();
    if (!store.notificationSettings.enabled || !store.notificationSettings.toasts) return;
    
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
    store.addNotification({
      title: 'Bob',
      message: message,
      type: type as any
    });
  }

  private static sendGenericMessage(type: string, title: string, message: string) {
    const store = useTrackerStore.getState();
    store.addNotification({
      title: title,
      message: message,
      type: type as any
    });
  }
}
