import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'docugenie-language-preference';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return savedLang || i18n.language;
  });

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    i18n.changeLanguage(currentLanguage);
  }, [currentLanguage, i18n]);

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 