const fs = require('fs');
const path = require('path');

// Read translations.ts
const translationsContent = fs.readFileSync(path.join(__dirname, '../src/i18n/translations.ts'), 'utf-8');

// Parse the JSON-like object from translations.ts
let translationsObj;
try {
  const jsonStr = translationsContent
    .replace('export const translations = ', '')
    .replace(/;$/, '')
    .trim();
  translationsObj = new Function('return ' + jsonStr)();
} catch (e) {
  console.error("Failed to parse translations.ts", e);
  process.exit(1);
}

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enKeys = new Set(getAllKeys(translationsObj.en));
const esKeys = new Set(getAllKeys(translationsObj.es));

// Find all t('...') usages
function findUsages(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      findUsages(fullPath, fileList);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allFiles = findUsages(path.join(__dirname, '../src'));
const usedKeys = new Set();
const regex = /t\(['"]([^'"]+)['"]\)/g;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

console.log("Missing from English:");
for (const key of usedKeys) {
  if (!enKeys.has(key)) {
    console.log("  " + key);
  }
}

console.log("\nMissing from Spanish:");
for (const key of usedKeys) {
  if (!esKeys.has(key)) {
    console.log("  " + key);
  }
}
