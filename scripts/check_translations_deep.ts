import { translations } from '../src/i18n/translations';
import * as fs from 'fs';
import * as path from 'path';

function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const enKeys = new Set(getAllKeys(translations.en));
const esKeys = new Set(getAllKeys(translations.es));

function findUsages(dir: string, fileList: string[] = []): string[] {
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
const usedKeys = new Set<string>();
const regex = /t\(['"]([^'"]+)['"]\)/g;
const useTranslationRegex = /useTranslation\(['"]([^'"]+)['"]\)/g;

for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    usedKeys.add(match[1]);
  }
}

console.log("==========================================");
console.log("MISSING IN ENGLISH (en):");
const missingEn: string[] = [];
for (const key of usedKeys) {
  if (!enKeys.has(key)) {
    missingEn.push(key);
  }
}
missingEn.sort().forEach(k => console.log("  " + k));

console.log("\n==========================================");
console.log("MISSING IN SPANISH (es):");
const missingEs: string[] = [];
for (const key of usedKeys) {
  if (!esKeys.has(key)) {
    missingEs.push(key);
  }
}
missingEs.sort().forEach(k => console.log("  " + k));

console.log("\n==========================================");
console.log("MISSING IN KOREAN (ko):");
const koKeys = new Set(getAllKeys(translations.ko));
const missingKo: string[] = [];
for (const key of usedKeys) {
  if (!koKeys.has(key)) {
    missingKo.push(key);
  }
}
missingKo.sort().forEach(k => console.log("  " + k));
