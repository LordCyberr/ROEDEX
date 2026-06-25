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

  const extraKeys = {
    playersInZone: 'Players In Zone',
    nodesTracked: 'Nodes Tracked',
    mobsTracked: 'Mobs Tracked',
    active: 'Active',
    offline: 'Offline',
    spawnTessa: 'Spawn Tessa',
    spawnFinn: 'Spawn Finn'
  };

  const en = translations.en;
  const es = translations.es || {};
  const ru = translations.ru || {};
  const ko = translations.ko || {};

  if (!en.debug) en.debug = {};
  if (!es.debug) es.debug = {};
  if (!ru.debug) ru.debug = {};
  if (!ko.debug) ko.debug = {};

  for (const [key, text] of Object.entries(extraKeys)) {
    en.debug[key] = text;
    es.debug[key] = await translateText(text, 'es');
    ru.debug[key] = await translateText(text, 'ru');
    ko.debug[key] = await translateText(text, 'ko');
    await new Promise(r => setTimeout(r, 150));
  }

  const newObjCode = `export const translations = ${JSON.stringify({en, es, ru, ko}, null, 2)} as const;\n\n`;
  fs.writeFileSync('src/i18n/translations.ts', newObjCode + typesCode);
  console.log('Finished translating new debug keys!');
}

run();
