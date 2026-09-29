import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationKey, getTranslation } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'operaviva_language';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Prova a recuperare la preferenza salvata in localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'it' || saved === 'en') {
      return saved;
    }
    // Rilevamento lingua di sistema del browser
    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('en')) {
      return 'en';
    }
    return 'it';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn('Impossibile salvare lingua in localStorage:', e);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'it' ? 'en' : 'it');
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return getTranslation(language, key, params);
  };

  // Mantieni aggiornato l'attributo lang di document.documentElement
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n deve essere usato all\'interno di I18nProvider');
  }
  return context;
};
