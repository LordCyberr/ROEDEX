const fs = require('fs');

function replaceFileContent(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (const [target, replacement] of replacements) {
    content = content.replace(target, replacement);
  }
  fs.writeFileSync(file, content, 'utf8');
}

replaceFileContent('src/components/widgets/DebugPanel.tsx', [
  ['PLAYERS IN ZONE:', '{t(\'debug.playersInZone\') || \'PLAYERS IN ZONE:\'}'],
  ['NODES TRACKED:', '{t(\'debug.nodesTracked\') || \'NODES TRACKED:\'}'],
  ['MOBS TRACKED:', '{t(\'debug.mobsTracked\') || \'MOBS TRACKED:\'}'],
  ['ACTIVE', '{t(\'debug.active\') || \'ACTIVE\'}'],
  ['OFFLINE', '{t(\'debug.offline\') || \'OFFLINE\'}'],
  ['SPAWN TESSA', '{t(\'debug.spawnTessa\') || \'SPAWN TESSA\'}'],
  ['SPAWN FINN', '{t(\'debug.spawnFinn\') || \'SPAWN FINN\'}']
]);

console.log('Patched DebugPanel.tsx');
