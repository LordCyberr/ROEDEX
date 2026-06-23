import { useSettingsStore } from '../store/settingsStore';

import { translations, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const language = useSettingsStore(state => state.language);
  
  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    
    // Safely get translation from current language
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
      return current;
    }
    
    // Fallback to English
    let fallback: any = translations.en;
    for (const k of keys) {
      if (fallback && fallback[k] !== undefined) {
        fallback = fallback[k];
      } else {
        fallback = undefined;
        break;
      }
    }
    
    if (fallback !== undefined && typeof fallback === 'string') {
      return fallback;
    }
    
    return key; // Fallback to key if not found
  };
  
  return { t, language };
};
