const fs = require('fs');
const path = require('path');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles(path.join(__dirname, '../src'));
const keysFound = new Set();
const regex = /t\(['"]([^'"]+)['"]\)/g;

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = regex.exec(content)) !== null) {
    keysFound.add(match[1]);
  }
});

let translationsCode = fs.readFileSync(path.join(__dirname, '../src/i18n/translations.ts'), 'utf8');

// Quick and dirty way: we'll just evaluate it (need to change export const translations to something we can eval)
let evalCode = translationsCode.replace('export const translations = ', 'global.translations = ');
eval(evalCode);

const en = global.translations.en;
const missing = {};

keysFound.forEach(key => {
  const parts = key.split('.');
  if (parts.length === 2) {
    const [cat, k] = parts;
    if (!en[cat]) en[cat] = {};
    if (en[cat][k] === undefined) {
      if (!missing[cat]) missing[cat] = {};
      missing[cat][k] = k; // just use the key as the english text
      
      // Update the JS object directly
      ['en', 'es', 'ru', 'ko'].forEach(lang => {
        if (!global.translations[lang]) global.translations[lang] = {};
        if (!global.translations[lang][cat]) global.translations[lang][cat] = {};
        global.translations[lang][cat][k] = k;
      });
    }
  }
});

const newCode = `export const translations = ${JSON.stringify(global.translations, null, 2)};\n\nexport type Language = 'en' | 'es' | 'ru' | 'ko';\nexport type TranslationKey = \n  | { [K in keyof typeof translations.en]: \`\${K}.\${keyof typeof translations.en[K]}\` }[keyof typeof translations.en];\n`;

fs.writeFileSync(path.join(__dirname, '../src/i18n/translations.ts'), newCode, 'utf8');
console.log('Fixed missing translations');
