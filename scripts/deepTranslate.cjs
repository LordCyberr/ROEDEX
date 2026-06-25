const fs = require('fs');
const path = require('path');

// Target files
const settingsDir = path.join(__dirname, '../src/components/views/settings');
const translationsFile = path.join(__dirname, '../src/i18n/translations.ts');

const newTranslations = {
  pressAnyKey: 'PRESS ANY KEY...',
  themeDark: 'Dark Mode (Default)',
  themeBob: "Bob's Adventure (Premium)",
  themeKaya: "Kaya's Flame (Premium)",
  themeLia: "Lia's Magic (Premium)",
  themeCrash: "Crash's Resolve (Premium)",
  themeAbstract: 'Abstract Chain (Premium)',
  themeObsidian: 'Obsidian Gold (Premium)',
  themeCyberpunk: 'Neon Cyberpunk (Premium)',
  themeHologram: 'Holographic Blue (Premium)',
  themeAmethyst: 'Amethyst Violet (Premium)',
  themeRuby: 'Ruby Glass (Premium)',
  themeOcean: 'Ocean Blue',
  themeCrimson: 'Crimson Red',
  themeMidnight: 'Midnight Black',
  themeTokyo: 'Tokyo Night',
  themeLight: 'Light Mode',
  iconPulse: 'Tracking Pulse',
  iconLightning: 'Lightning',
  iconSword: 'Sword',
  iconPickaxe: 'Pickaxe',
  iconShield: 'Shield',
  iconRoedex: 'ROEDEX',
  iconRx: 'RX',
  behavior: 'BEHAVIOR',
  bobEnableDesc: 'Turns the on-screen companion on or off entirely.',
  bobChattyDesc: 'How often Bob makes comments. Spammy = reacts to everything.',
  bobVoiceDesc: 'Which TTS voice Bob uses. Requires Enable Sounds in Notifications.',
  bobPitchDesc: 'Adjust the vocal pitch (high/low) of the selected voice.',
  bobSpeedDesc: 'Adjust how fast Bob speaks.',
  bobPositionDesc: 'Where Bob renders on the screen.',
  chatSpammy: 'Spammy',
  chatNormal: 'Normal',
  chatQuiet: 'Quiet',
  voiceRobot: 'Robotic (Default)',
  voiceDeep: 'Deep Male',
  voiceHigh: 'High Female',
  voiceChipmunk: 'Chipmunk',
  personality: 'PERSONALITY & VOICE',
  appearance: 'APPEARANCE'
};

// 1. Inject into translations.ts
let tContent = fs.readFileSync(translationsFile, 'utf8');
let injectionBlock = Object.entries(newTranslations).map(([k, v]) => `      ${k}: '${v.replace(/'/g, "\\'")}',`).join('\n');

// Inject into English
tContent = tContent.replace(/uiPopups: 'UI POPUPS',/g, `uiPopups: 'UI POPUPS',\n${injectionBlock}`);

fs.writeFileSync(translationsFile, tContent);
console.log('Updated translations.ts');

// 2. Replace in UI files
const replacements = {
  "'Dark Mode (Default)'": "t('settings.themeDark')",
  "\"Bob's Adventure (Premium)\"": "t('settings.themeBob')",
  "\"Kaya's Flame (Premium)\"": "t('settings.themeKaya')",
  "\"Lia's Magic (Premium)\"": "t('settings.themeLia')",
  "\"Crash's Resolve (Premium)\"": "t('settings.themeCrash')",
  "'Abstract Chain (Premium)'": "t('settings.themeAbstract')",
  "'Obsidian Gold (Premium)'": "t('settings.themeObsidian')",
  "'Neon Cyberpunk (Premium)'": "t('settings.themeCyberpunk')",
  "'Holographic Blue (Premium)'": "t('settings.themeHologram')",
  "'Amethyst Violet (Premium)'": "t('settings.themeAmethyst')",
  "'Ruby Glass (Premium)'": "t('settings.themeRuby')",
  "'Ocean Blue'": "t('settings.themeOcean')",
  "'Crimson Red'": "t('settings.themeCrimson')",
  "'Midnight Black'": "t('settings.themeMidnight')",
  "'Tokyo Night'": "t('settings.themeTokyo')",
  "'Light Mode'": "t('settings.themeLight')",
  "'Tracking Pulse'": "t('settings.iconPulse')",
  "'Lightning'": "t('settings.iconLightning')",
  "'Sword'": "t('settings.iconSword')",
  "'Pickaxe'": "t('settings.iconPickaxe')",
  "'Shield'": "t('settings.iconShield')",
  "'ROEDEX'": "t('settings.iconRoedex')",
  "'RX'": "t('settings.iconRx')",
  "BEHAVIOR": "{t('settings.behavior')}",
  "\"Turns the on-screen companion on or off entirely.\"": "t('settings.bobEnableDesc')",
  "\"How often Bob makes comments. Spammy = reacts to everything.\"": "t('settings.bobChattyDesc')",
  "\"Which TTS voice Bob uses. Requires Enable Sounds in Notifications.\"": "t('settings.bobVoiceDesc')",
  "\"Adjust the vocal pitch (high/low) of the selected voice.\"": "t('settings.bobPitchDesc')",
  "\"Adjust how fast Bob speaks.\"": "t('settings.bobSpeedDesc')",
  "\"Where Bob renders on the screen.\"": "t('settings.bobPositionDesc')",
  "'Spammy'": "t('settings.chatSpammy')",
  "'Normal'": "t('settings.chatNormal')",
  "'Quiet'": "t('settings.chatQuiet')",
  "'Robotic (Default)'": "t('settings.voiceRobot')",
  "'Deep Male'": "t('settings.voiceDeep')",
  "'High Female'": "t('settings.voiceHigh')",
  "'Chipmunk'": "t('settings.voiceChipmunk')",
  "PERSONALITY & VOICE": "{t('settings.personality')}",
  "APPEARANCE": "{t('settings.appearance')}"
};

const files = fs.readdirSync(settingsDir).filter(f => f.endsWith('.tsx'));
files.forEach(file => {
  const filePath = path.join(settingsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const [key, value] of Object.entries(replacements)) {
    content = content.split(key).join(value);
  }

  content = content.replace(/\{ label: 'Compact Mode', value: 'compact' \}/g, "{ label: t('settings.compactMode'), value: 'compact' }");
  content = content.replace(/\{ label: 'Standard Mode', value: 'standard' \}/g, "{ label: t('settings.standardMode'), value: 'standard' }");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
