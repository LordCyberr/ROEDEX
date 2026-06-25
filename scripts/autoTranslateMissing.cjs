const fs = require('fs');

async function translateText(text, targetLang) {
  if (!text) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const json = await res.json();
    return json[0].map(x => x[0]).join('');
  } catch (e) {
    console.error("Translation failed for", text, e);
    return text; // fallback to English
  }
}

async function run() {
  const missingKeysData = require('../missing_translations.json');
  
  let tsContent = fs.readFileSync('src/i18n/translations.ts', 'utf8');
  const typeIndex = tsContent.indexOf('export type TranslationKey');
  const typesCode = tsContent.substring(typeIndex);
  let objCode = tsContent.substring(0, typeIndex);
  objCode = objCode.replace('export const translations =', 'return');
  objCode = objCode.replace(/as const;/g, '');
  const getObj = new Function(objCode);
  const translations = getObj();

  const en = translations.en;
  const es = translations.es || {};
  const ru = translations.ru || {};
  const ko = translations.ko || {};

  console.log("Translating missing keys...");
  
  for (const cat of Object.keys(missingKeysData)) {
    for (const key of Object.keys(missingKeysData[cat])) {
      const enText = missingKeysData[cat][key];
      
      if (!es[cat]) es[cat] = {};
      if (!ru[cat]) ru[cat] = {};
      if (!ko[cat]) ko[cat] = {};

      if (!es[cat][key] || es[cat][key] === enText) {
        es[cat][key] = await translateText(enText, 'es');
        console.log(`[ES] ${key} -> ${es[cat][key]}`);
      }
      if (!ru[cat][key] || ru[cat][key] === enText) {
        ru[cat][key] = await translateText(enText, 'ru');
      }
      if (!ko[cat][key] || ko[cat][key] === enText) {
        ko[cat][key] = await translateText(enText, 'ko');
      }
      
      // Delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 150));
    }
  }

  const newObjCode = `export const translations = ${JSON.stringify({en, es, ru, ko}, null, 2)} as const;\n\n`;
  fs.writeFileSync('src/i18n/translations.ts', newObjCode + typesCode);
  console.log('Finished translating and injecting all missing keys!');
}

run();
