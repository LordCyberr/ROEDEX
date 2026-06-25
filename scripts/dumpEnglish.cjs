const fs = require('fs');

let tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
const typeIndex = tsContent.indexOf('export type TranslationKey');
let objCode = tsContent.substring(0, typeIndex).replace('export const translations =', 'return').replace(/as const;/g, '');
const translations = new Function(objCode)();

fs.writeFileSync('en.json', JSON.stringify(translations.en, null, 2), 'utf8');
console.log('en.json created');
