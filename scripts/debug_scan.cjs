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
const regex = /\bt\s*\(\s*(['"`])(.*?)\1/g;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedKeys.add(match[2]);
  }
}

console.log("Found keys in files: ", usedKeys.size);

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
console.log("English keys in dict: ", enKeys.size);

const missingEn = [];
for (const key of usedKeys) {
  if (!enKeys.has(key)) missingEn.push(key);
}

console.log("Missing keys:");
missingEn.sort().forEach(k => console.log(k));
