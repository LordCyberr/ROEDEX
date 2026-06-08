import { useTrackerStore } from '../store/trackerStore';
import { translations, TranslationKey } from '../i18n/translations';

export const useTranslation = () => {
  const language = useTrackerStore(state => state.language);
  
  const t = (key: TranslationKey): string => {
    const keys = key.split('.') as [keyof typeof translations.en, string];
    const category = keys[0];
    const item = keys[1];
    
    // Safely get translation
    const langDict = translations[language] || translations.en;
    const catDict = langDict[category] as any;
    
    if (catDict && catDict[item]) {
      return catDict[item];
    }
    
    // Fallback to English
    const fallbackCatDict = translations.en[category] as any;
    if (fallbackCatDict && fallbackCatDict[item]) {
      return fallbackCatDict[item];
    }
    
    return key; // Fallback to key if not found
  };
  
  return { t, language };
};
