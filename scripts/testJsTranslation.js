const translations = {
  en: {
    companions: {
      bob: { name: 'Bob' }
    }
  },
  es: {}
};

const language = 'es';
const key = 'companions.bob.name';
const keys = key.split('.');

const langDict = translations[language] || translations.en;
let current = langDict;
for (const k of keys) {
  if (current && current[k] !== undefined) {
    current = current[k];
  } else {
    current = undefined;
    break;
  }
}

if (current !== undefined && typeof current === 'string') {
  console.log("ES SUCCESS:", current);
} else {
  let fallback = translations.en;
  for (const k of keys) {
    if (fallback && fallback[k] !== undefined) {
      fallback = fallback[k];
    } else {
      fallback = undefined;
      break;
    }
  }
  
  if (fallback !== undefined && typeof fallback === 'string') {
    console.log("EN FALLBACK SUCCESS:", fallback);
  } else {
    console.log("FAILED!", key);
  }
}
