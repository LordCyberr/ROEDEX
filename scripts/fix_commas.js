const fs = require('fs');
let code = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const keys = ['tabs', 'settings', 'npcTracker', 'debug', 'errors', 'companions', 'bootSequence', 'loot', 'overlay', 'about'];
keys.forEach(k => {
  code = code.replace(new RegExp('}(\\s+)' + k + ':', 'g'), '},$1' + k + ':');
});
fs.writeFileSync('src/i18n/translations.ts', code);
console.log('Fixed commas');
