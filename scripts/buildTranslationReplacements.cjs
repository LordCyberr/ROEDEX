const fs = require('fs');
const path = require('path');

// Extract translations map from strictTranslationsInjector.cjs
const fullSettingsTranslations = {
  settings: {
    title: "SETTINGS",
    general: "GENERAL",
    tracking: "TRACKING",
    armor: "ARMOR",
    weapons: "WEAPONS",
    notifications: "NOTIFICATIONS",
    companions: "COMPANIONS",
    advanced: "ADVANCED",
    trackingData: "Tracking Data",
    weaponOverlay: "Weapon Overlay",
    armorOverlay: "Armor Overlay",
    uiNotifications: "UI Notifications",
    language: "Language",
    aboutMe: "About ROEDEX",
    aboutMeDesc: "This project is passionately developed and maintained for the ROE player base. We rely on community support to keep updates flowing. Every contribution directly helps improve ROEDEX for everyone.",
    donate: "Back the Development",
    cryptoWallets: "Crypto Addresses",
    descGeneral: "Themes, UI scale, language, opacity, and window snapping settings.",
    descTracking: "Data management, session loot configs, and local storage clearing.",
    descWeapon: "Weapon durability tracking, overlay positions, and auto-swap alerts.",
    descArmor: "Armor slot durability monitoring and gear breaking warnings.",
    descNotifications: "Toast configurations, alert sounds, and UI popup positions.",
    descCompanion: "AI Companion persona settings, behaviors, and frequency.",
    descAdvanced: "Developer mode, debugging stats, and data import/export.",
    descAbout: "Info about the developer, changelogs, and donations.",
    uiTheme: "UI Theme",
    themeDark: "Dark Mode (Default)",
    themeBob: "Bob's Adventure (Premium)",
    displayDensity: "Display Density",
    densityCompact: "Compact Mode",
    densityStandard: "Standard Mode",
    verticalLayout: "Vertical Layout",
    layoutGrouped: "Grouped by Zone",
    layoutFlat: "Simple Titles",
    globalScale: "Global UI Scale (4K/2K Displays)",
    activeOpacity: "Active Opacity",
    idleOpacity: "Idle Opacity",
    minimizedOrbSize: "Minimized Orb Size",
    minimizedIcon: "Minimized Icon",
    iconPulse: "Tracking Pulse",
    iconLightning: "Lightning",
    iconSword: "Sword",
    iconPickaxe: "Pickaxe",
    iconShield: "Shield",
    iconRoedex: "ROEDEX",
    iconRx: "RX",
    iconCustom: "Custom Image URL",
    customIconUrl: "Custom Image URL",
    customIconPlaceholder: "https://example.com/icon.png",
    orbBorderThickness: "Orb Border Thickness",
    behavior: "BEHAVIOR",
    autoMinimizeOnChest: "Auto-Minimize on Chest Open",
    minimizeHotkey: "Minimize/Maximize Hotkey",
    toggleLayoutHotkey: "Toggle Layout Hotkey",
    resetSizeHotkey: "Reset Size/Position Hotkey",
    lockUiHotkey: "Lock/Unlock UI Hotkey",

    displayMode: "Display Mode",
    modeSession: "Session View",
    modeZone: "Current Zone",
    sessionViewDesc: "Session view retains all discovered data continuously until manually reset.",
    minimalChestHud: "Minimal Chest HUD",
    minimalChestHudDesc: "Hides all overlay panels and shows only the chest contents.",
    lockMinimalChestHud: "Lock Minimal Chest HUD",
    trackerColumns: "TRACKER COLUMNS",
    showDistance: "Show Distance Column", // Mapped to closest
    showCount: "Show Counts (Alive/Dead)",
    showTimer: "Show Respawn Timers",
    raritySortOrder: "Rarity Sort Order",
    sortDesc: "Descending (High to Low)",
    sortAsc: "Ascending (Low to High)",
    sortNone: "None (Chronological)",
    maxRespawnTooltips: "Upcoming Respawns Tooltip Limit", // Mapped to actual used string
    dataManagement: "DATA MANAGEMENT",
    clearSessionCache: "Clear Session Cache",
    resetLootSession: "Reset Loot Session",

    enableArmorOverlay: "Enable Armor Overlay",
    lockPosition: "Lock Position",
    displayAppearance: "DISPLAY & APPEARANCE",
    layout: "Layout",
    layoutHorizontal: "Horizontal",
    style: "Style",
    styleBarPercent: "Health Bar + %",
    styleBarDurability: "Health Bar + Durability",
    styleBar: "Health Bar Only",
    styleTextPercent: "Text Only (%)",
    styleTextDurability: "Text Only (Durability)",
    scale: "Scale",
    opacity: "Opacity",
    barWidth: "Bar Width",
    barHeight: "Bar Height",
    borderRadius: "Background Radius",
    borderWidth: "Border Thickness",
    dynamicBorderColor: "Dynamic Color (Match Health)",
    glassStrength: "Background Blur",
    enableAnimations: "Enable Animations",
    position: "Position",
    posTopLeft: "Top Left",
    posTopRight: "Top Right",
    posBottomLeft: "Bottom Left",
    posBottomRight: "Bottom Right",
    posCustom: "Custom",
    alerts: "ALERTS",
    enableDurabilityAlerts: "Enable Durability Alerts",
    alertThreshold: "Alert Threshold",

    enableWeaponOverlay: "Enable Weapon Overlay",
    posBottomCenter: "Bottom Center",

    toastNotifications: "TOAST NOTIFICATIONS",
    enableToasts: "Enable In-Game Toasts",
    enableAudio: "Enable Audio Alerts",
    toastEvents: "TOAST EVENTS",
    rareDrops: "Rare Drops (Blue+)",
    achievements: "Achievements & Milestones",
    zoneChanges: "Zone Changes",
    toolWarnings: "Tool Warnings (Low Durability)",
    socketStatus: "WebSocket Connection Status",
    trackerStatus: "Tracker Status (Paused/Resumed)",
    lootEvents: "All Loot Events (Spammy)",
    toastAppearance: "TOAST APPEARANCE",
    toastScale: "Toast Scale",
    toastWidth: "Max Width",
    toastHeight: "Height",
    compactMode: "Compact Mode (Minimalist)",
    toastShape: "Toast Shape",
    shapeRectangle: "Rectangle",
    shapeSmooth: "Smooth Rounded",
    shapePill: "Pill",
    enableNeonGlow: "Enable Neon Glow",
    glowColorTheme: "Glow Color Theme",
    themeRarity: "By Rarity (Loot)",
    themeType: "By Type (Alert, Info, Error)",
    toastAnimation: "Toast Animation",
    animSlide: "Slide In",
    animFade: "Fade",
    animPop: "Pop",
    audioVolume: "Audio Volume",
    toastDuration: "Toast Duration (Seconds)",

    aiCompanion: "AI COMPANION",
    enableCompanionMode: "Enable Companion Mode",
    descCompanion: "Your AI companion will dynamically react to your gameplay, providing tips, celebrating achievements, and warning you of danger.",
    activePersona: "Active Persona",
    bobDescription: "The Optimistic Explorer. Loves finding new loot and going on adventures.",
    kayaDescription: "The Fiery Warrior. Lives for the thrill of battle and slaying bosses.",
    liaDescription: "The Mystical Scholar. Fascinated by rare resources and magic.",
    crashDescription: "The Grumpy Veteran. Seen it all, unimpressed by your weak loot.",
    behaviorPersonality: "BEHAVIOR & PERSONALITY",
    chatterFrequency: "Chatter Frequency",
    freqRare: "Rare (Important only)",
    freqNormal: "Normal (Balanced)",
    freqChatty: "Chatty (Reacts to everything)",
    roastLevel: "Roast Level (Failure reactions)",
    roastOff: "Off (Supportive)",
    roastMild: "Mild (Light teasing)",
    roastSavage: "Savage (Emotional damage)",
    companionEvents: "COMPANION EVENTS",
    greetings: "Greetings & Farewells",
    jokes: "Jokes & Random Chatter",
    gameplayTips: "Gameplay Tips",
    miningWoodcutting: "Mining & Woodcutting",
    combatBosses: "Combat & Bosses",
    gatheringCrafting: "Gathering & Crafting",
    zoneExploration: "Zone Exploration",
    rareResourceSpawns: "Rare Resource Spawns",
    rareLootDrops: "Rare Loot Drops",
    secretDiscoveries: "Secret Discoveries",
    companionAppearance: "COMPANION APPEARANCE",
    companionIconScale: "Companion Icon Scale",
    speechBubbleTextScale: "Speech Bubble Text Scale",
    speechBubbleDuration: "Speech Bubble Duration (Seconds)",
    companionIconStyle: "Companion Icon Style",
    stylePortrait: "Character Portrait",
    styleBot: "Robot Head",
    stylePixel: "Pixel Matrix",
    style3D: "Realistic 3D",
    styleGhost: "Holographic Ghost",
    styleCat: "Cyber Cat",
    styleWizard: "Arcane Wizard",
    styleSkull: "Demonic Skull",
    styleAlien: "Alien Entity",
    styleDog: "Robo Dog",
    styleMini: "Mini-Character",
    speechBubbleTheme: "Speech Bubble Theme",
    themeConnected: "Connected to Icon",
    themeFloating: "Floating Above",
    themeHolographic: "Holographic Projection",
    speechBubbleStyle: "Speech Bubble Style",
    styleGlass: "Frosted Glass",
    styleCyber: "Cyberpunk",
    styleFantasy: "Fantasy Scroll",
    styleMinimal: "Minimalist",
    styleHologram: "Hologram",
    voiceVisualizerStyle: "Voice Visualizer Style",
    visWave: "Waveform",
    visEq: "Equalizer Bars",
    visPulse: "Energy Pulse",
    companionPosition: "Companion Position",

    devTools: "DEVELOPER TOOLS",
    enableDevMode: "Enable Developer Mode",
    devModeDesc: "Shows raw packet data, websocket stats, and memory usage profiling.",
    dataBackup: "DATA BACKUP & RESTORE",
    exportData: "Export ROEDEX Data",
    importData: "Import Data",
    importSuccess: "Data imported successfully! The UI will now reload.",
    dangerZone: "DANGER ZONE",
    dangerZoneDesc: "These actions are permanent and will completely wipe your locally saved data. This simulates a fresh install.",
    hardReset: "Hard Reset Database",
    hardResetConfirm: "Are you sure you want to permanently delete your ROEDEX database files? This cannot be undone."
  }
};

const valueToKeyMap = {};
for (const [key, value] of Object.entries(fullSettingsTranslations.settings)) {
  valueToKeyMap[value] = key;
}

// Add some manual fallbacks for variations that I see in findLabels.cjs
valueToKeyMap["Width"] = "barWidth";
valueToKeyMap["Min Height"] = "toastHeight";
valueToKeyMap["Scale"] = "scale";
valueToKeyMap["Enable Notifications"] = "enableToasts";
valueToKeyMap["Show Preview Dummy"] = "showPreviewDummy"; // Needs to be added
valueToKeyMap["Screen Position"] = "position";
valueToKeyMap["Display Duration"] = "toastDuration";
valueToKeyMap["Tool Durability Warnings"] = "toolWarnings";
valueToKeyMap["Loot Drops"] = "rareDrops";
valueToKeyMap["Rarity Sort (When Distance Off)"] = "raritySortOrder";
valueToKeyMap["Companion Icon Size"] = "companionIconScale";
valueToKeyMap["Companion Text Size"] = "speechBubbleTextScale";
valueToKeyMap["Toast Frequency"] = "chatterFrequency";
valueToKeyMap["Roast Level (Sassy Mode)"] = "roastLevel";
valueToKeyMap["Message Duration"] = "speechBubbleDuration";
valueToKeyMap["Jokes & Personality"] = "jokes";
valueToKeyMap["Helpful Tips"] = "gameplayTips";
valueToKeyMap["Mining & Nodes"] = "miningWoodcutting";
valueToKeyMap["Combat & Kills"] = "combatBosses";
valueToKeyMap["Gathering (Wood/Plants)"] = "gatheringCrafting";
valueToKeyMap["Rare Drops & Loot"] = "rareLootDrops";
valueToKeyMap["Enable Alerts"] = "enableDurabilityAlerts";
valueToKeyMap["Anchor Position"] = "position";
valueToKeyMap["Enable AI Companion"] = "enableCompanionMode";
valueToKeyMap["Active Companion"] = "activePersona";
valueToKeyMap["Bubble Distance"] = "bubbleDistance"; // Needs to be added
valueToKeyMap["Bubble Offset"] = "bubbleOffset"; // Needs to be added
valueToKeyMap["Quick Preset"] = "quickPreset"; // Needs to be added
valueToKeyMap["Greetings"] = "greetings";

const dir = 'src/components/views/settings/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;

  // Replace label="..."
  content = content.replace(/label=\"([^\"]+)\"/g, (match, labelString) => {
    const key = valueToKeyMap[labelString];
    if (key) {
      changed = true;
      return `label={t('settings.${key}')}`;
    }
    console.log(`Could not find key for label: "${labelString}" in ${file}`);
    return match;
  });

  // Replace text blocks
  content = content.replace(/>([^<]+)<\/div>/g, (match, textString) => {
    const trimmed = textString.trim();
    const key = valueToKeyMap[trimmed];
    if (key && trimmed.length > 3) {
      changed = true;
      return `>{t('settings.${key}')}</div>`;
    }
    // Also try case-insensitive mapping for uppercase titles
    const keyUpper = Object.keys(valueToKeyMap).find(k => k.toUpperCase() === trimmed);
    if (keyUpper) {
      changed = true;
      return `>{t('settings.${valueToKeyMap[keyUpper]}')}</div>`;
    }

    return match;
  });

  if (changed) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
