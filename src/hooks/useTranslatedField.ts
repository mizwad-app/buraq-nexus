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
    const translatedKey = `${fieldName}_${lang}`;
    const englishKey = `${fieldName}_en`;
    
    // Try to get translated value first
    const translatedValue = item[translatedKey];
    if (translatedValue && typeof translatedValue === 'string') {
      return translatedValue;
    }
    
    // Fall back to English translation
    const englishValue = item[englishKey];
    if (englishValue && typeof englishValue === 'string') {
      return englishValue;
    }
    
    // Fall back to base field
    const baseValue = item[fieldName];
    if (baseValue && typeof baseValue === 'string') {
      return baseValue;
    }
    
    return '';
  };

  return { getField, currentLanguage: i18n.language };
};
