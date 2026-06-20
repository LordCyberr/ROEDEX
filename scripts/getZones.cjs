const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\Administrator\\Desktop\\ROEDEX_DEV\\dev\\old_reference\\Consollog_wesocketlog';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.log'));

const zones = new Set();

files.forEach(file => {
  const content = fs.readFileSync(path.join(dir, file), 'utf-8');
  const lines = content.split('\n');
  lines.forEach(line => {
    // try to match zone change logs. Not just SpawnState.
    // e.g. "Entered Zone: "
    let match = line.match(/\[SpawnState\] Zone:\s*(.*?)\s*\|/);
    if (match) {
      zones.add(match[1].trim());
    }
    
    // Also let's check for any raw websocket payloads like "zone":"something"
    let wsMatch = line.match(/"zone"\s*:\s*"([^"]+)"/i);
    if (wsMatch) {
      zones.add(wsMatch[1].trim());
    }
  });
});

console.log("UNIQUE ZONES FOUND:", Array.from(zones).join(", "));
