const fs = require('fs');

async function translateText(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();
    return json[0].map(x => x[0]).join('');
  } catch (e) {
    return text;
  }
}

async function run() {
  let tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
  const typeIndex = tsContent.indexOf('export type TranslationKey');
  const typesCode = tsContent.substring(typeIndex);
  let objCode = tsContent.substring(0, typeIndex).replace('export const translations =', 'return').replace(/as const;/g, '');
  const translations = new Function(objCode)();

  const categories = {
    trees: 'Trees',
    ores: 'Ores',
    plants: 'Plants',
    mobs: 'Mobs',
    respawns: 'Respawns'
  };

  const en = translations.en;
  const es = translations.es || {};
  const ru = translations.ru || {};
  const ko = translations.ko || {};

  if (!en.categories) en.categories = {};
  if (!es.categories) es.categories = {};
  if (!ru.categories) ru.categories = {};
  if (!ko.categories) ko.categories = {};

  for (const [key, text] of Object.entries(categories)) {
    en.categories[key] = text;
    es.categories[key] = await translateText(text, 'es');
    ru.categories[key] = await translateText(text, 'ru');
    ko.categories[key] = await translateText(text, 'ko');
    await new Promise(r => setTimeout(r, 150));
  }

  const newObjCode = `export const translations = ${JSON.stringify({en, es, ru, ko}, null, 2)} as const;\n\n`;
  fs.writeFileSync('src/i18n/translations.ts', newObjCode + typesCode);
  
  // Patch CategoryTable.tsx
  let cTable = fs.readFileSync('src/components/ui/CategoryTable.tsx', 'utf8');
  cTable = cTable.replace('Respawns', '{t(\'categories.respawns\')}');
  fs.writeFileSync('src/components/ui/CategoryTable.tsx', cTable, 'utf8');

  console.log('Finished translating categories!');
}

run();
