/**
 * merge_trails.cjs
 * Merges new_trails.json (mrsnorch/roe-tracker data) into defaultTrails.ts
 * Safe to run multiple times (idempotent — only adds missing zones)
 */
const fs = require('fs');
const path = require('path');

const newTrailsPath = 'C:\\Users\\Administrator\\Desktop\\new_trails.json';
const defaultTrailsPath = path.join(__dirname, '..', 'src', 'data', 'defaultTrails.ts');

// Read new trails JSON
const newTrails = JSON.parse(fs.readFileSync(newTrailsPath, 'utf8'));
console.log('Zones in new_trails.json:', Object.keys(newTrails));

// Read current defaultTrails.ts
let existing = fs.readFileSync(defaultTrailsPath, 'utf8');

// Extract existing zone names using simple string matching
const existingKeys = [];
const keyRegex = /"([^"]+)":\s*"/g;
let match;
while ((match = keyRegex.exec(existing)) !== null) {
  existingKeys.push(match[1]);
}
console.log('Existing zones in defaultTrails.ts:', existingKeys);

// Find zones that are NOT already in defaultTrails.ts
const newZones = Object.keys(newTrails).filter(k => !existingKeys.includes(k));
console.log('New zones to merge:', newZones);

if (newZones.length === 0) {
  console.log('✅ All zones already present — no changes needed.');
  process.exit(0);
}

// Insert new zones before the closing `};`
// Find the last `"` before `};`
const insertPoint = existing.lastIndexOf('};');
if (insertPoint === -1) {
  console.error('❌ Could not find closing `};` in defaultTrails.ts');
  process.exit(1);
}

let newEntries = '';
for (const zone of newZones) {
  const trailData = newTrails[zone];
  // Escape any backticks just in case
  const safeData = trailData.replace(/\\/g, '\\\\');
  newEntries += `  "${zone}": "${safeData}",\n`;
}

const updated =
  existing.slice(0, insertPoint) +
  newEntries +
  existing.slice(insertPoint);

fs.writeFileSync(defaultTrailsPath, updated, 'utf8');
console.log(`✅ Merged ${newZones.length} new zone(s) into defaultTrails.ts`);
console.log('Added zones:', newZones.join(', '));
