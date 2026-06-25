const fs = require('fs');
const path = require('path');

const applyReplacements = (file, replacements) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  for (const [target, replacement] of replacements) {
    if (content.includes(target)) {
      content = content.replace(target, replacement);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
};

// GeneralSettings
applyReplacements('src/components/views/settings/GeneralSettings.tsx', [
  ['label="Global UI Scale (4K/2K Displays)"', 'label={t(\'settingsUI.general.globalScale\') || "Global UI Scale (4K/2K Displays)"}'],
  ['label="Orb Border Thickness"', 'label={t(\'settingsUI.general.orbBorderThickness\') || "Orb Border Thickness"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">BEHAVIOR</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t(\'settingsUI.general.behavior\') || "BEHAVIOR"}</div>'],
  ['label="Auto-Minimize on Chest Open"', 'label={t(\'settingsUI.general.autoMinimizeChest\') || "Auto-Minimize on Chest Open"}'],
  ['label="Minimize/Maximize Hotkey"', 'label={t(\'settingsUI.general.minimizeHotkey\') || "Minimize/Maximize Hotkey"}'],
  ['label="Toggle Layout Hotkey"', 'label={t(\'settingsUI.general.layoutHotkey\') || "Toggle Layout Hotkey"}'],
  ['label="Reset Size/Position Hotkey"', 'label={t(\'settingsUI.general.resetHotkey\') || "Reset Size/Position Hotkey"}'],
  ['label="Lock/Unlock UI Hotkey"', 'label={t(\'settingsUI.general.lockHotkey\') || "Lock/Unlock UI Hotkey"}'],
  ['{ label: \'Dark Mode (Default)\', value: \'default\' }', '{ label: t(\'settingsUI.general.themeDark\') || \'Dark Mode (Default)\', value: \'default\' }'],
  ['{ label: "Bob\'s Adventure (Premium)", value: \'ruyui\' }', '{ label: t(\'settingsUI.general.themeBob\') || "Bob\'s Adventure (Premium)", value: \'ruyui\' }'],
  ['{ label: \'Compact Mode\', value: \'compact\' }', '{ label: t(\'settingsUI.general.compactMode\') || \'Compact Mode\', value: \'compact\' }'],
  ['{ label: \'Standard Mode\', value: \'standard\' }', '{ label: t(\'settingsUI.general.standardMode\') || \'Standard Mode\', value: \'standard\' }'],
]);

// TrackingSettings
applyReplacements('src/components/views/settings/TrackingSettings.tsx', [
  ['{ label: \'Session View\', value: \'session\' }', '{ label: t(\'settingsUI.tracking.viewOptions.session\') || \'Session View\', value: \'session\' }'],
  ['{ label: \'Current Zone\', value: \'current_zone\' }', '{ label: t(\'settingsUI.tracking.viewOptions.currentZone\') || \'Current Zone\', value: \'current_zone\' }'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">Minimal Chest HUD</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">{t(\'settingsUI.tracking.minimalChestHud\') || "Minimal Chest HUD"}</div>'],
  ['label="Enable Minimal Chest HUD"', 'label={t(\'settingsUI.tracking.enableMinimalChest\') || "Enable Minimal Chest HUD"}'],
  ['label="Lock Minimal Chest HUD"', 'label={t(\'settingsUI.tracking.lockMinimalChest\') || "Lock Minimal Chest HUD"}'],
  ['Reset HUD Tutorial', '{t(\'settingsUI.tracking.resetHudTutorial\') || "Reset HUD Tutorial"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1 uppercase tracking-wider">Global Data Table</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1 uppercase tracking-wider">{t(\'settingsUI.tracking.globalDataTable\') || "Global Data Table"}</div>'],
  ['label="Show Distance Column"', 'label={t(\'settingsUI.tracking.showDistance\') || "Show Distance Column"}'],
  ['label="Show Counts (Alive/Dead)"', 'label={t(\'settingsUI.tracking.showCounts\') || "Show Counts (Alive/Dead)"}'],
  ['label="Show Respawn Timers"', 'label={t(\'settingsUI.tracking.showTimers\') || "Show Respawn Timers"}'],
  ['label="Rarity Sort (When Distance Off)"', 'label={t(\'settingsUI.tracking.raritySort\') || "Rarity Sort (When Distance Off)"}'],
  ['{ label: \'Alphabetical Only\', value: \'none\' }', '{ label: t(\'settingsUI.tracking.rarityAlpha\') || \'Alphabetical Only\', value: \'none\' }'],
  ['label="Upcoming Respawns Tooltip Limit"', 'label={t(\'settingsUI.tracking.tooltipLimit\') || "Upcoming Respawns Tooltip Limit"}'],
]);

// ArmorSettings
applyReplacements('src/components/views/settings/ArmorSettings.tsx', [
  ['label="Enable Armor Overlay"', 'label={t(\'settingsUI.overlay.enableArmor\') || "Enable Armor Overlay"}'],
  ['label="Lock Position"', 'label={t(\'settingsUI.overlay.lockPosition\') || "Lock Position"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">DISPLAY & APPEARANCE</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">{t(\'settingsUI.overlay.displayAppearance\') || "DISPLAY & APPEARANCE"}</div>'],
  ['label="Layout"', 'label={t(\'settingsUI.overlay.layout\') || "Layout"}'],
  ['{label: \'Vertical Stack\', value: \'vertical\'}', '{label: t(\'settingsUI.overlay.layoutOptions.vertical\') || \'Vertical Stack\', value: \'vertical\'}'],
  ['{label: \'Horizontal Row\', value: \'horizontal\'}', '{label: t(\'settingsUI.overlay.layoutOptions.horizontal\') || \'Horizontal Row\', value: \'horizontal\'}'],
  ['label="Style"', 'label={t(\'settingsUI.overlay.style\') || "Style"}'],
  ['{label: \'Bar Only\', value: \'bar\'}', '{label: t(\'settingsUI.overlay.styleOptions.bar\') || \'Bar Only\', value: \'bar\'}'],
  ['{label: \'Text (Percentage)\', value: \'text_percent\'}', '{label: t(\'settingsUI.overlay.styleOptions.text_percent\') || \'Text (Percentage)\', value: \'text_percent\'}'],
  ['{label: \'Text (Durability)\', value: \'text_durability\'}', '{label: t(\'settingsUI.overlay.styleOptions.text_durability\') || \'Text (Durability)\', value: \'text_durability\'}'],
  ['{label: \'Bar + Percentage\', value: \'bar_percent\'}', '{label: t(\'settingsUI.overlay.styleOptions.bar_percent\') || \'Bar + Percentage\', value: \'bar_percent\'}'],
  ['{label: \'Bar + Durability\', value: \'bar_durability\'}', '{label: t(\'settingsUI.overlay.styleOptions.bar_durability\') || \'Bar + Durability\', value: \'bar_durability\'}'],
  ['label="Enable Animations"', 'label={t(\'settingsUI.overlay.enableAnimations\') || "Enable Animations"}'],
  ['label="Width"', 'label={t(\'settingsUI.overlay.width\') || "Width"}'],
  ['label="Height (Bar)"', 'label={t(\'settingsUI.overlay.height\') || "Height (Bar)"}'],
  ['label="Scale"', 'label={t(\'settingsUI.overlay.scale\') || "Scale"}'],
  ['label="Opacity"', 'label={t(\'settingsUI.overlay.opacity\') || "Opacity"}'],
  ['label="Background Radius"', 'label={t(\'settingsUI.overlay.bgRadius\') || "Background Radius"}'],
  ['label="Background Blur"', 'label={t(\'settingsUI.overlay.bgBlur\') || "Background Blur"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">BORDER SETTINGS</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t(\'settingsUI.overlay.borderSettings\') || "BORDER SETTINGS"}</div>'],
  ['label="Border Thickness"', 'label={t(\'settingsUI.overlay.borderThickness\') || "Border Thickness"}'],
  ['label="Dynamic Color (Match Health)"', 'label={t(\'settingsUI.overlay.dynamicColor\') || "Dynamic Color (Match Health)"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">ALERTS & ANCHOR</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t(\'settingsUI.overlay.alertsAnchor\') || "ALERTS & ANCHOR"}</div>'],
  ['label="Enable Alerts"', 'label={t(\'settingsUI.overlay.enableAlerts\') || "Enable Alerts"}'],
  ['label="Alert Threshold"', 'label={t(\'settingsUI.overlay.alertThreshold\') || "Alert Threshold"}'],
  ['label="Anchor Position"', 'label={t(\'settingsUI.overlay.anchorPosition\') || "Anchor Position"}'],
  ['{label: \'Top Left\', value: \'top-left\'}', '{label: t(\'settingsUI.overlay.anchorOptions.topLeft\') || \'Top Left\', value: \'top-left\'}'],
  ['{label: \'Top Right\', value: \'top-right\'}', '{label: t(\'settingsUI.overlay.anchorOptions.topRight\') || \'Top Right\', value: \'top-right\'}'],
  ['{label: \'Bottom Left\', value: \'bottom-left\'}', '{label: t(\'settingsUI.overlay.anchorOptions.bottomLeft\') || \'Bottom Left\', value: \'bottom-left\'}'],
  ['{label: \'Bottom Right\', value: \'bottom-right\'}', '{label: t(\'settingsUI.overlay.anchorOptions.bottomRight\') || \'Bottom Right\', value: \'bottom-right\'}'],
  ['{label: \'Custom Dragged\', value: \'custom\'}', '{label: t(\'settingsUI.overlay.anchorOptions.custom\') || \'Custom Dragged\', value: \'custom\'}'],
  ['export const ArmorSettings: React.FC = () => {', 'import { useTranslation } from \'../../../hooks/useTranslation\';\n\nexport const ArmorSettings: React.FC = () => {\n  const { t } = useTranslation();']
]);

// WeaponSettings
applyReplacements('src/components/views/settings/WeaponSettings.tsx', [
  ['label="Enable Weapon Overlay"', 'label={t(\'settingsUI.overlay.enableWeapon\') || "Enable Weapon Overlay"}'],
  ['label="Lock Position"', 'label={t(\'settingsUI.overlay.lockPosition\') || "Lock Position"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">DISPLAY & APPEARANCE</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1">{t(\'settingsUI.overlay.displayAppearance\') || "DISPLAY & APPEARANCE"}</div>'],
  ['label="Layout"', 'label={t(\'settingsUI.overlay.layout\') || "Layout"}'],
  ['{label: \'Vertical Stack\', value: \'vertical\'}', '{label: t(\'settingsUI.overlay.layoutOptions.vertical\') || \'Vertical Stack\', value: \'vertical\'}'],
  ['{label: \'Horizontal Row\', value: \'horizontal\'}', '{label: t(\'settingsUI.overlay.layoutOptions.horizontal\') || \'Horizontal Row\', value: \'horizontal\'}'],
  ['label="Style"', 'label={t(\'settingsUI.overlay.style\') || "Style"}'],
  ['{label: \'Bar Only\', value: \'bar\'}', '{label: t(\'settingsUI.overlay.styleOptions.bar\') || \'Bar Only\', value: \'bar\'}'],
  ['{label: \'Text (Percentage)\', value: \'text_percent\'}', '{label: t(\'settingsUI.overlay.styleOptions.text_percent\') || \'Text (Percentage)\', value: \'text_percent\'}'],
  ['{label: \'Text (Durability)\', value: \'text_durability\'}', '{label: t(\'settingsUI.overlay.styleOptions.text_durability\') || \'Text (Durability)\', value: \'text_durability\'}'],
  ['{label: \'Bar + Percentage\', value: \'bar_percent\'}', '{label: t(\'settingsUI.overlay.styleOptions.bar_percent\') || \'Bar + Percentage\', value: \'bar_percent\'}'],
  ['{label: \'Bar + Durability\', value: \'bar_durability\'}', '{label: t(\'settingsUI.overlay.styleOptions.bar_durability\') || \'Bar + Durability\', value: \'bar_durability\'}'],
  ['label="Enable Animations"', 'label={t(\'settingsUI.overlay.enableAnimations\') || "Enable Animations"}'],
  ['label="Width"', 'label={t(\'settingsUI.overlay.width\') || "Width"}'],
  ['label="Height (Bar)"', 'label={t(\'settingsUI.overlay.height\') || "Height (Bar)"}'],
  ['label="Scale"', 'label={t(\'settingsUI.overlay.scale\') || "Scale"}'],
  ['label="Opacity"', 'label={t(\'settingsUI.overlay.opacity\') || "Opacity"}'],
  ['label="Background Radius"', 'label={t(\'settingsUI.overlay.bgRadius\') || "Background Radius"}'],
  ['label="Background Blur"', 'label={t(\'settingsUI.overlay.bgBlur\') || "Background Blur"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">BORDER SETTINGS</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t(\'settingsUI.overlay.borderSettings\') || "BORDER SETTINGS"}</div>'],
  ['label="Border Thickness"', 'label={t(\'settingsUI.overlay.borderThickness\') || "Border Thickness"}'],
  ['label="Dynamic Color (Match Health)"', 'label={t(\'settingsUI.overlay.dynamicColor\') || "Dynamic Color (Match Health)"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">ALERTS & ANCHOR</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1">{t(\'settingsUI.overlay.alertsAnchor\') || "ALERTS & ANCHOR"}</div>'],
  ['label="Enable Alerts"', 'label={t(\'settingsUI.overlay.enableAlerts\') || "Enable Alerts"}'],
  ['label="Alert Threshold"', 'label={t(\'settingsUI.overlay.alertThreshold\') || "Alert Threshold"}'],
  ['label="Anchor Position"', 'label={t(\'settingsUI.overlay.anchorPosition\') || "Anchor Position"}'],
  ['{label: \'Top Left\', value: \'top-left\'}', '{label: t(\'settingsUI.overlay.anchorOptions.topLeft\') || \'Top Left\', value: \'top-left\'}'],
  ['{label: \'Top Right\', value: \'top-right\'}', '{label: t(\'settingsUI.overlay.anchorOptions.topRight\') || \'Top Right\', value: \'top-right\'}'],
  ['{label: \'Bottom Left\', value: \'bottom-left\'}', '{label: t(\'settingsUI.overlay.anchorOptions.bottomLeft\') || \'Bottom Left\', value: \'bottom-left\'}'],
  ['{label: \'Bottom Right\', value: \'bottom-right\'}', '{label: t(\'settingsUI.overlay.anchorOptions.bottomRight\') || \'Bottom Right\', value: \'bottom-right\'}'],
  ['{label: \'Custom Dragged\', value: \'custom\'}', '{label: t(\'settingsUI.overlay.anchorOptions.custom\') || \'Custom Dragged\', value: \'custom\'}'],
  ['export const WeaponSettings: React.FC = () => {', 'import { useTranslation } from \'../../../hooks/useTranslation\';\n\nexport const WeaponSettings: React.FC = () => {\n  const { t } = useTranslation();']
]);

// NotificationSettings
applyReplacements('src/components/views/settings/NotificationSettings.tsx', [
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1 uppercase tracking-wider">Toast Notifications</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-2 mb-1 pl-1 uppercase tracking-wider">{t(\'settingsUI.notifications.toastNotifications\') || "Toast Notifications"}</div>'],
  ['label="Enable Toasts"', 'label={t(\'settingsUI.notifications.enableToasts\') || "Enable Toasts"}'],
  ['label="Toast Position"', 'label={t(\'settingsUI.notifications.toastPosition\') || "Toast Position"}'],
  ['label="Toast Duration"', 'label={t(\'settingsUI.notifications.toastDuration\') || "Toast Duration"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">Sound Alerts</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">{t(\'settingsUI.notifications.soundAlerts\') || "Sound Alerts"}</div>'],
  ['label="Enable Sounds"', 'label={t(\'settingsUI.notifications.enableSounds\') || "Enable Sounds"}'],
  ['label="Volume"', 'label={t(\'settingsUI.notifications.volume\') || "Volume"}'],
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">UI Popups</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">{t(\'settingsUI.notifications.uiPopups\') || "UI Popups"}</div>'],
  ['label="Show Level Up Popups"', 'label={t(\'settingsUI.notifications.showLevelUp\') || "Show Level Up Popups"}'],
  ['label="Show Rare Drop Popups"', 'label={t(\'settingsUI.notifications.showRareDrop\') || "Show Rare Drop Popups"}'],
  ['{ label: \'Top Left\', value: \'top-left\' }', '{ label: t(\'settingsUI.notifications.toastPositionOptions.topLeft\') || \'Top Left\', value: \'top-left\' }'],
  ['{ label: \'Top Center\', value: \'top-center\' }', '{ label: t(\'settingsUI.notifications.toastPositionOptions.topCenter\') || \'Top Center\', value: \'top-center\' }'],
  ['{ label: \'Top Right\', value: \'top-right\' }', '{ label: t(\'settingsUI.notifications.toastPositionOptions.topRight\') || \'Top Right\', value: \'top-right\' }'],
  ['{ label: \'Bottom Left\', value: \'bottom-left\' }', '{ label: t(\'settingsUI.notifications.toastPositionOptions.bottomLeft\') || \'Bottom Left\', value: \'bottom-left\' }'],
  ['{ label: \'Bottom Center\', value: \'bottom-center\' }', '{ label: t(\'settingsUI.notifications.toastPositionOptions.bottomCenter\') || \'Bottom Center\', value: \'bottom-center\' }'],
  ['{ label: \'Bottom Right\', value: \'bottom-right\' }', '{ label: t(\'settingsUI.notifications.toastPositionOptions.bottomRight\') || \'Bottom Right\', value: \'bottom-right\' }'],
]);

// BobSettings (Companion)
applyReplacements('src/components/views/settings/CompanionSettings.tsx', [
  ['<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">Personality & Behavior</div>', '<div className="text-[9px] font-bold text-[var(--text-muted)] mt-4 mb-1 pl-1 uppercase tracking-wider">{t(\'settingsUI.companion.personalityBehavior\') || "Personality & Behavior"}</div>'],
  ['label="Chat Frequency"', 'label={t(\'settingsUI.companion.chatFrequency\') || "Chat Frequency"}'],
  ['label="Personality Mode"', 'label={t(\'settingsUI.companion.personalityMode\') || "Personality Mode"}'],
  ['label="Show Face Cam"', 'label={t(\'settingsUI.companion.showFaceCam\') || "Show Face Cam"}'],
  ['label="Enable Voice Lines"', 'label={t(\'settingsUI.companion.enableVoiceLines\') || "Enable Voice Lines"}'],
  ['{ label: \'Silent\', value: \'silent\' }', '{ label: t(\'settingsUI.companion.frequencyOptions.silent\') || \'Silent\', value: \'silent\' }'],
  ['{ label: \'Rare\', value: \'rare\' }', '{ label: t(\'settingsUI.companion.frequencyOptions.rare\') || \'Rare\', value: \'rare\' }'],
  ['{ label: \'Normal\', value: \'normal\' }', '{ label: t(\'settingsUI.companion.frequencyOptions.normal\') || \'Normal\', value: \'normal\' }'],
  ['{ label: \'Frequent\', value: \'frequent\' }', '{ label: t(\'settingsUI.companion.frequencyOptions.frequent\') || \'Frequent\', value: \'frequent\' }'],
  ['{ label: \'Non-stop\', value: \'nonstop\' }', '{ label: t(\'settingsUI.companion.frequencyOptions.nonstop\') || \'Non-stop\', value: \'nonstop\' }'],
  ['{ label: \'Helpful (Default)\', value: \'helpful\' }', '{ label: t(\'settingsUI.companion.modeOptions.helpful\') || \'Helpful (Default)\', value: \'helpful\' }'],
  ['{ label: \'Sarcastic & Witty\', value: \'sarcastic\' }', '{ label: t(\'settingsUI.companion.modeOptions.sarcastic\') || \'Sarcastic & Witty\', value: \'sarcastic\' }'],
  ['{ label: \'Aggressive/Battle-Focused\', value: \'aggressive\' }', '{ label: t(\'settingsUI.companion.modeOptions.aggressive\') || \'Aggressive/Battle-Focused\', value: \'aggressive\' }'],
  ['{ label: \'Mystical/Lore-Focused\', value: \'mystical\' }', '{ label: t(\'settingsUI.companion.modeOptions.mystical\') || \'Mystical/Lore-Focused\', value: \'mystical\' }'],
]);

console.log('All component strings successfully patched to use useTranslation.');
