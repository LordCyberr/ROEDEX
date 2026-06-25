import { translations } from './src/i18n/translations';
function getKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  for (let k in obj) {
    if (typeof obj[k] === 'object') {
      keys = keys.concat(getKeys(obj[k], prefix + k + '.'));
    } else {
      keys.push(prefix + k);
    }
  }
  return keys;
}

const en = getKeys(translations.en);
const es = getKeys(translations.es);
const ru = getKeys(translations.ru);
const ko = getKeys(translations.ko);

const missingEs = en.filter(k => !es.includes(k));
const missingRu = en.filter(k => !ru.includes(k));
const missingKo = en.filter(k => !ko.includes(k));

console.log('Missing ES:', missingEs);
console.log('Missing RU:', missingRu);
console.log('Missing KO:', missingKo);
