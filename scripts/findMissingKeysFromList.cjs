const fs = require('fs');

const transContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

const getKeys = (lang) => {
  const match = transContent.match(new RegExp(`${lang}:\\s*\\{([\\s\\S]*?)(?=\\n\\s*[a-z]{2,}:|\\n\\s*}$)`, 'm'));
  if (!match) return [];
  // crude parsing
  const block = match[1];
  const keys = [];
  
  // parse something like:
  // category: {
  //   key1: 'val',
  //   key2: 'val'
  // }
  const lines = block.split('\n');
  let currentGroup = '';
  for (let line of lines) {
    if (line.includes(': {')) {
      currentGroup = line.split(':')[0].trim();
    } else if (line.includes('}') && !line.includes('{')) {
      currentGroup = '';
    } else if (line.includes(':') && currentGroup) {
      let key = line.split(':')[0].trim();
      if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
      keys.push(`${currentGroup}.${key}`);
    }
  }
  return keys;
};

const enKeys = new Set(getKeys('en'));

const usedKeysList = [
  'about.lordCyberr', 'about.mrSnorch', 'bootSequence.back', 'bootSequence.biometric',
  'bootSequence.calibrating', 'bootSequence.chooseCompanion', 'bootSequence.hoverToPreview',
  'bootSequence.initializing', 'bootSequence.online', 'bootSequence.skipStep',
  'bootSequence.systemBoot', 'bootSequence.welcome', 'columns.dist', 'columns.location',
  'columns.name', 'columns.npc', 'debug.armorUi', 'debug.companion', 'debug.exportReport',
  'debug.fps', 'debug.mainOverlay', 'debug.minimizedOrb', 'debug.mockUiTests',
  'debug.network', 'debug.overlayPositions', 'debug.packetsSec', 'debug.parseAvg',
  'debug.parseMax', 'debug.ram', 'debug.renderAvg', 'debug.socketStatus', 'debug.storeMemory',
  'debug.systemUsage', 'debug.title', 'debug.weaponUi', 'errors.fixesImprovements',
  'loot.chestWorth', 'loot.count', 'loot.inventoryLootValue', 'loot.item', 'loot.lifetimeStats',
  'loot.lootValue', 'loot.lvl', 'loot.runesToLevel', 'loot.total', 'loot.viewHistory',
  'misc.maximize', 'misc.minimize', 'misc.noNpcs', 'misc.popOutTab', 'misc.resetAutoSize',
  'misc.searchNpcs', 'misc.toggleLayout', 'overlay.backpackValue', 'overlay.chestValue',
  'overlay.finishToSave', 'overlay.noPastRuns', 'overlay.pastRuns', 'settings.aboutMe',
  'settings.aboutRoedexDesc', 'settings.achievements', 'settings.activeOpacity',
  'settings.activePersona', 'settings.advanced', 'settings.aiCompanion', 'settings.alertThreshold',
  'settings.alertsAndAnchor', 'settings.armorOverlay', 'settings.autoMinimizeOnChest',
  'settings.barHeight', 'settings.barWidth', 'settings.behavior', 'settings.borderRadius',
  'settings.borderSettings', 'settings.borderWidth', 'settings.bubbleDistance',
  'settings.bubbleOffset', 'settings.chatterFrequency', 'settings.clearSessionCache',
  'settings.combatBosses', 'settings.companionIconScale', 'settings.confirmHardReset',
  'settings.credits', 'settings.customImageUrl', 'settings.dangerZone', 'settings.dangerZoneDesc',
  'settings.descAbout', 'settings.descAdvanced', 'settings.descArmor', 'settings.descCompanion',
  'settings.descGeneral', 'settings.descNotifications', 'settings.descTracking',
  'settings.descWeapon', 'settings.devModeDesc', 'settings.devModeEnabled',
  'settings.devModeWarning', 'settings.displayAppearance', 'settings.displayDensity',
  'settings.displayMode', 'settings.donationDesc', 'settings.dynamicBorderColor',
  'settings.enableAnimations', 'settings.enableArmorOverlay', 'settings.enableCompanionMode',
  'settings.enableDevMode', 'settings.enableDurabilityAlerts', 'settings.enableNeonGlow',
  'settings.enableToasts', 'settings.enableWeaponOverlay', 'settings.eventTriggers',
  'settings.gameplayTips', 'settings.gatheringCrafting', 'settings.general', 'settings.glassStrength',
  'settings.globalDataTable', 'settings.globalScale', 'settings.greetings',
  'settings.guidanceContributions', 'settings.hardResetBtn', 'settings.idleOpacity',
  'settings.jokes', 'settings.language', 'settings.layout', 'settings.leadDeveloper',
  'settings.lockMinimalChestHud', 'settings.lockPosition', 'settings.lockUiHotkey',
  'settings.maxRespawnTooltips', 'settings.minimalChestHud', 'settings.minimizeHotkey',
  'settings.minimizedIcon', 'settings.minimizedOrbSize', 'settings.miningWoodcutting',
  'settings.opacity', 'settings.orbBorderThickness', 'settings.position',
  'settings.positionAnimation', 'settings.quickPreset', 'settings.rareDrops',
  'settings.rareLootDrops', 'settings.raritySortOrder', 'settings.readMore',
  'settings.resetLootSession', 'settings.resetSizeHotkey', 'settings.roastLevel',
  'settings.scale', 'settings.sessionViewDesc', 'settings.showCount', 'settings.showDistance',
  'settings.showPreviewDummy', 'settings.showTimer', 'settings.speechBubbleDuration',
  'settings.speechBubbleTextScale', 'settings.speechBubbleTheme', 'settings.style',
  'settings.supportDevelopment', 'settings.toastDuration', 'settings.toastHeight',
  'settings.toastShape', 'settings.toggleLayoutHotkey', 'settings.toolWarnings',
  'settings.trackingData', 'settings.uiDesign', 'settings.uiNotifications', 'settings.uiTheme',
  'settings.verifyNetwork', 'settings.verticalLayout', 'settings.viewChangelog',
  'settings.weaponOverlay', 'settings.zoneChanges', 'tabs.favorites', 'tabs.global',
  'tabs.npcTracker', 'tabs.npcs', 'tabs.session', 'tabs.settings', 'welcome.feature1Desc',
  'welcome.feature1Title', 'welcome.feature2Desc', 'welcome.feature2Title',
  'welcome.feature3Desc', 'welcome.feature3Title', 'welcome.skip', 'welcome.start',
  'welcome.subtitle', 'welcome.title', 'wizard.calibrationComplete', 'wizard.guide1_mid',
  'wizard.guide2_mid', 'wizard.guide3_mid', 'wizard.guide4', 'wizard.init', 'wizard.quickGuide'
];

const missing = [];
usedKeysList.forEach(k => {
  if (!enKeys.has(k)) missing.push(k);
});

console.log('Missing Keys:');
console.log(missing.join('\n'));

