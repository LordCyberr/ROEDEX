const fs = require('fs');
const path = require('path');

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

const allFiles = findUsages(path.join(process.cwd(), 'src'));
const usedKeys = new Set();

// Match t('key') or t("key") or t(`key`) with optional whitespace and `as any` etc.
// This regex specifically looks for t( followed by optional whitespace and a quote, captures the text until next matching quote
const regex = /\bt\s*\(\s*(['"`])(.*?)\1/g;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedKeys.add(match[2]);
  }
}

const tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const typeIndex = tsContent.indexOf('export type TranslationKey');
let objCode = tsContent.substring(0, typeIndex);
objCode = objCode.replace('export const translations =', 'return');
objCode = objCode.replace(/as const;/g, '');
const getObj = new Function(objCode);
const translationsObj = getObj();

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

const enKeys = new Set(getAllKeys(translationsObj.en || {}));
const esKeys = new Set(getAllKeys(translationsObj.es || {}));
const koKeys = new Set(getAllKeys(translationsObj.ko || {}));

const missingEn = [];
const missingEs = [];
const missingKo = [];

for (const key of usedKeys) {
  if (!enKeys.has(key)) missingEn.push(key);
  if (!esKeys.has(key)) missingEs.push(key);
  if (!koKeys.has(key)) missingKo.push(key);
}

console.log("=== MISSING IN ENGLISH ===");
missingEn.sort().forEach(k => console.log(k));

console.log("\n=== MISSING IN SPANISH ===");
missingEs.sort().forEach(k => console.log(k));

console.log("\n=== MISSING IN KOREAN ===");
missingKo.sort().forEach(k => console.log(k));
