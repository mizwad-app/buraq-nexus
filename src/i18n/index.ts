import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uz from './locales/uz.json';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ar from './locales/ar.json';
import fr from './locales/fr.json';
import zh from './locales/zh.json';

const resources = {
  uz: { translation: uz },
  en: { translation: en },
  ru: { translation: ru },
  ar: { translation: ar },
  fr: { translation: fr },
  zh: { translation: zh },
};

const supportedLngs = ['uz', 'en', 'ru', 'ar', 'fr', 'zh'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs,
    fallbackLng: 'uz',
    nonExplicitSupportedLngs: true, // maps zh-CN, zh-TW, zh-HK -> zh
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
