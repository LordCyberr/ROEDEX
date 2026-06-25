const fs = require('fs');
const path = require('path');
const valueToKeyMap = {
  'Developer Mode': 'enableDevMode',
  'Height (Bar)': 'barHeight',
  'Chat Bubble Theme': 'speechBubbleTheme',
  'Achievements': 'achievements',
  'Neon Glowing Border': 'enableNeonGlow',
  'Enable Minimal Chest HUD': 'minimalChestHud',
  'Width': 'barWidth',
  'Min Height': 'toastHeight',
  'Scale': 'scale'
};
const dir = 'src/components/views/settings/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
for (const file of files) {
  let content = fs.readFileSync(path.join(dir, file), 'utf8');
  let changed = false;
  content = content.replace(/label=\"([^\"]+)\"/g, (match, labelString) => {
    const key = valueToKeyMap[labelString];
    if (key) {
      changed = true;
      return "label={t('settings." + key + "')}";
    }
    return match;
  });
  if (changed) {
    fs.writeFileSync(path.join(dir, file), content, 'utf8');
    console.log('Updated ' + file);
  }
}
