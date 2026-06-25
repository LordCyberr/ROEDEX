import { translations } from '../src/i18n/translations';

const language = 'en';
const key = 'companions.bob.name';
const keys = key.split('.');

const langDict = translations[language] || translations.en;
let current: any = langDict;
for (const k of keys) {
  if (current && current[k] !== undefined) {
    current = current[k];
  } else {
    current = undefined;
    break;
  }
}

if (current !== undefined && typeof current === 'string') {
  console.log("SUCCESS:", current);
} else {
  console.log("FAILED! typeof current =", typeof current, "value =", current);
}
