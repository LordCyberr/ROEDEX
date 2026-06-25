const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '../src/components/views/settings');
const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.tsx') && f !== 'SettingsControls.tsx');

const replacements = {
  'label="Compact Mode"': 'label={t(\'settings.compactMode\')}',
  'label="Standard Mode"': 'label={t(\'settings.standardMode\')}',
  'label="Grouped by Zone"': 'label={t(\'settings.groupedByZone\')}',
  'label="Simple Titles"': 'label={t(\'settings.simpleTitles\')}',
  'label="Global UI Scale (4K/2K Displays)"': 'label={t(\'settings.globalUiScale\')}',
  'Custom Image URL': '{t(\'settings.customImageUrl\')}',
  'label="Orb Border Thickness"': 'label={t(\'settings.orbBorderThickness\')}',
  'label="Auto-Minimize on Chest Open"': 'label={t(\'settings.autoMinimizeChest\')}',
  'label="Minimize Hotkey"': 'label={t(\'settings.minimizeHotkey\')}',
  'label="Layout Hotkey"': 'label={t(\'settings.toggleLayoutHotkey\')}',
  'label="Reset Hotkey"': 'label={t(\'settings.resetSizeHotkey\')}',
  'label="Lock Overlay Hotkey"': 'label={t(\'settings.lockUiHotkey\')}',
  
  'label="Enable Weapon Overlay"': 'label={t(\'settings.enableWeaponOverlay\')}',
  'label="Enable Armor Overlay"': 'label={t(\'settings.enableArmorOverlay\')}',
  'label="Lock Position"': 'label={t(\'settings.lockPosition\')}',
  'DISPLAY & APPEARANCE': '{t(\'settings.displayAppearance\')}',
  'label="Layout"': 'label={t(\'settings.layout\')}',
  'label: \'Horizontal\'': 'label: t(\'settings.horizontal\')',
  'label: \'Vertical\'': 'label: t(\'settings.vertical\')',
  'label="Style"': 'label={t(\'settings.style\')}',
  'label: \'Bar Only\'': 'label: t(\'settings.barOnly\')',
  'label: \'Text (Percentage)\'': 'label: t(\'settings.textPercent\')',
  'label: \'Text (Durability)\'': 'label: t(\'settings.textDurability\')',
  'label: \'Bar + Percentage\'': 'label: t(\'settings.barPercent\')',
  'label: \'Bar + Durability\'': 'label: t(\'settings.barDurability\')',
  'label="Enable Animations"': 'label={t(\'settings.enableAnimations\')}',
  'label="Width"': 'label={t(\'settings.width\')}',
  'label="Height (Bar)"': 'label={t(\'settings.heightBar\')}',
  'label="Scale"': 'label={t(\'settings.scale\')}',
  'label="Opacity"': 'label={t(\'settings.opacity\')}',
  'label="Background Radius"': 'label={t(\'settings.bgRadius\')}',
  'label="Background Blur"': 'label={t(\'settings.bgBlur\')}',
  'BORDER SETTINGS': '{t(\'settings.borderSettings\')}',
  'label="Border Thickness"': 'label={t(\'settings.borderThickness\')}',
  'label="Dynamic Color (Match Health)"': 'label={t(\'settings.dynamicColor\')}',
  'ALERTS & ANCHOR': '{t(\'settings.alertsAnchor\')}',
  'label="Enable Alerts"': 'label={t(\'settings.enableAlerts\')}',
  'label="Alert Threshold"': 'label={t(\'settings.alertThreshold\')}',
  'label="Anchor Position"': 'label={t(\'settings.anchorPosition\')}',
  'label: \'Top Left\'': 'label: t(\'settings.topLeft\')',
  'label: \'Top Right\'': 'label: t(\'settings.topRight\')',
  'label: \'Bottom Left\'': 'label: t(\'settings.bottomLeft\')',
  'label: \'Bottom Right\'': 'label: t(\'settings.bottomRight\')',
  'label: \'Custom Dragged\'': 'label: t(\'settings.customDragged\')',

  'label="Session"': 'label={t(\'settings.session\')}',
  'label="Profile"': 'label={t(\'settings.profile\')}',
  'label="Current Zone"': 'label={t(\'settings.currentZone\')}',
  'MINIMAL CHEST HUD': '{t(\'settings.minimalChestHud\')}',
  'label="Enable Minimal Chest HUD"': 'label={t(\'settings.enableMinimalChestHud\')}',
  'label="Lock Minimal Chest"': 'label={t(\'settings.lockMinimalChest\')}',
  'GLOBAL DATA TABLE': '{t(\'settings.globalDataTable\')}',
  'label="Show Distance Column"': 'label={t(\'settings.showDistanceColumn\')}',
  'label="Show Counts (Alive/Dead)"': 'label={t(\'settings.showCountsAliveDead\')}',
  'label="Show Respawn Timers"': 'label={t(\'settings.showRespawnTimers\')}',
  'label="Rarity Sort (When Distance Off)"': 'label={t(\'settings.raritySort\')}',
  'label="Rarity Alpha (Opacity)"': 'label={t(\'settings.rarityAlpha\')}',
  'label="Upcoming Respawns Tooltip Limit"': 'label={t(\'settings.upcomingRespawnsLimit\')}',
  'label: \'Show 3\'': 'label: t(\'settings.show3\')',
  'label: \'Show 5\'': 'label: t(\'settings.show5\')',
  'label: \'Show 10\'': 'label: t(\'settings.show10\')',
  'label: \'Show All\'': 'label: t(\'settings.showAll\')',
  'label="Reset HUD Tutorial"': 'label={t(\'settings.resetHudTutorial\')}',

  'TOAST NOTIFICATIONS': '{t(\'settings.toastNotifications\')}',
  'label="Enable Toasts"': 'label={t(\'settings.enableToasts\')}',
  'label="Toast Position"': 'label={t(\'settings.toastPosition\')}',
  'label="Toast Duration"': 'label={t(\'settings.toastDuration\')}',
  'SOUND ALERTS': '{t(\'settings.soundAlerts\')}',
  'label="Enable Sounds"': 'label={t(\'settings.enableSounds\')}',
  'label="Volume"': 'label={t(\'settings.volume\')}',
  'UI POPUPS': '{t(\'settings.uiPopups\')}',
  'label="Show Level Up Popups"': 'label={t(\'settings.showLevelUp\')}',
  'label: \'Top Center\'': 'label: t(\'settings.topCenter\')',
  'label: \'Bottom Center\'': 'label: t(\'settings.bottomCenter\')',
  
  'View Project Changelogs': '{t(\'settings.viewChangelog\')}',
  'Read More': '{t(\'settings.readMore\')}',
  'Support Development': '{t(\'settings.supportDevelopment\')}',
  'ROEDEX is an open-source project maintained by the community. If you would like to support ongoing development and server costs, you can do so via the addresses below. Contributions are strictly optional but greatly appreciated.': '{t(\'settings.donationDesc\')}',
  'Note: Please verify the network before sending any crypto': '{t(\'settings.verifyNetwork\')}',
  'Credits & Acknowledgements': '{t(\'settings.credits\')}',
  'Lead Developer & Creator': '{t(\'settings.dev\')}'
};

files.forEach(file => {
  if (file === 'AdvancedSettings.tsx' || file === 'BobSettings.tsx') return;
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Add import { useTranslation } from '../../../hooks/useTranslation'; if not present
  if (!content.includes('useTranslation') && !content.includes('SettingsControls')) {
    content = content.replace(/import React/, 'import React from \'react\';\nimport { useTranslation } from \'../../../hooks/useTranslation\';\nimport');
  } else if (!content.includes('useTranslation')) {
    content = content.replace(/(import .* from '\.\/SettingsControls';)/, '$1\nimport { useTranslation } from \'../../../hooks/useTranslation\';');
  }

  // Ensure const { t } = useTranslation(); is inside the component
  if (content.includes('useTranslation') && !content.includes('const { t } = useTranslation();')) {
    content = content.replace(/(const store = useTrackerStore[^\n]*\n)/, '$1  const { t } = useTranslation();\n');
  }

  for (const [key, value] of Object.entries(replacements)) {
    content = content.replaceAll(key, value);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
