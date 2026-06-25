const fs = require('fs');

const missingKeysData = require('../missing_translations.json');
let tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');

// Find where "export type TranslationKey = " starts
const typeIndex = tsContent.indexOf('export type TranslationKey');
const typesCode = tsContent.substring(typeIndex);

// Everything before that is the translations object
let objCode = tsContent.substring(0, typeIndex);

// Make it evaluable
objCode = objCode.replace('export const translations =', 'return');
objCode = objCode.replace(/as const;/g, '');

const getObj = new Function(objCode);
const translations = getObj();

const en = translations.en;
const es = translations.es || {};
const ru = translations.ru || {};
const ko = translations.ko || {};

function mergeObj(target, source) {
  for (const [key, val] of Object.entries(source)) {
    if (!target[key]) {
      target[key] = {};
    }
    for (const [subKey, subVal] of Object.entries(val)) {
      if (!target[key][subKey]) {
        target[key][subKey] = subVal;
      }
    }
  }
}

mergeObj(en, missingKeysData);
mergeObj(es, missingKeysData);
mergeObj(ru, missingKeysData);
mergeObj(ko, missingKeysData);

const newObjCode = `export const translations = ${JSON.stringify({en, es, ru, ko}, null, 2)} as const;\n\n`;

fs.writeFileSync('src/i18n/translations.ts', newObjCode + typesCode);

console.log('Successfully deep merged translations without type errors!');
