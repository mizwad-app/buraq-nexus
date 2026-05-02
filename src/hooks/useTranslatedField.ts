import { useTranslation } from 'react-i18next';

type LanguageCode = 'uz' | 'en' | 'ru' | 'ar' | 'fr' | 'zh';

// Generic interface for translatable items
interface TranslatableItem {
  [key: string]: unknown;
}

/**
 * Hook to get translated field value from an object with language-specific fields
 * Falls back to the base field if translation is not available
 */
export const useTranslatedField = () => {
  const { i18n } = useTranslation();
  
  const getField = <T extends TranslatableItem>(
    item: T,
    fieldName: string
  ): string => {
    const lang = i18n.language as LanguageCode;
    // Fallback chain: current lang -> en -> uz -> base
    const fallbackOrder: LanguageCode[] = [lang, 'en', 'uz'];
    const seen = new Set<string>();

    for (const code of fallbackOrder) {
      const key = `${fieldName}_${code}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const value = item[key];
      if (value && typeof value === 'string') return value;
    }

    const baseValue = item[fieldName];
    if (baseValue && typeof baseValue === 'string') return baseValue;

    return '';
  };

  return { getField, currentLanguage: i18n.language };
};
