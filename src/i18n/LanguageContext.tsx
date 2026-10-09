'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SupportedLanguage, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from './config';
import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

const translations: Record<SupportedLanguage, any> = {
  en,
  pt,
  es,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (keyPath: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (path: string, defaultText?: string) => defaultText || path,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const saved = localStorage.getItem('career_lab_lang') as SupportedLanguage;
    if (saved && ['en', 'pt', 'es'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('career_lab_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  const t = (keyPath: string, defaultText?: string): string => {
    const keys = keyPath.split('.');
    let current = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation is missing in chosen language
        let fallback = translations.en;
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            return defaultText || keyPath;
          }
        }
        return typeof fallback === 'string' ? fallback : defaultText || keyPath;
      }
    }

    return typeof current === 'string' ? current : defaultText || keyPath;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useI18n = () => useContext(LanguageContext);
