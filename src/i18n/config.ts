import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import itTranslations from './locales/it.json';

const LANGUAGE_STORAGE_KEY = 'docugenie-language-preference';

const resources = {
  en: {
    translation: enTranslations,
  },
  it: {
    translation: itTranslations,
  },
};

// Initialize i18n synchronously to prevent null reference errors
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged',
      bindI18nStore: '',
    },
  });

export default i18n; 