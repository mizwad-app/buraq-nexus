import { useTranslation } from 'react-i18next';

type LanguageCode = 'uz' | 'en' | 'ru' | 'ar';

/**
 * Hook to get translated field value from an object with language-specific fields
 * Falls back to the base field if translation is not available
 */
export const useTranslatedField = () => {
  const { i18n } = useTranslation();
  
  const getField = <T extends Record<string, unknown>>(
    item: T,
    fieldName: string
  ): string => {
    const lang = i18n.language as LanguageCode;
    const translatedKey = `${fieldName}_${lang}` as keyof T;
    const baseKey = fieldName as keyof T;
    
    // Try to get translated value first
    const translatedValue = item[translatedKey];
    if (translatedValue && typeof translatedValue === 'string') {
      return translatedValue;
    }
    
    // Fall back to English translation
    const englishKey = `${fieldName}_en` as keyof T;
    const englishValue = item[englishKey];
    if (englishValue && typeof englishValue === 'string') {
      return englishValue;
    }
    
    // Fall back to base field
    const baseValue = item[baseKey];
    if (baseValue && typeof baseValue === 'string') {
      return baseValue;
    }
    
    return '';
  };

  return { getField, currentLanguage: i18n.language };
};
