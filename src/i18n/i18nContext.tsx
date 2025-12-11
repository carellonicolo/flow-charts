import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import itTranslations from '../locales/it.json';
import enTranslations from '../locales/en.json';

export type Language = 'it' | 'en';

type Translations = typeof itTranslations;

interface I18nContextType {
  language: Language;
  t: (key: string, params?: Record<string, string | number>) => string;
  changeLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  it: itTranslations,
  en: enTranslations,
};

// Helper function to get nested translation
function getNestedTranslation(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// Helper function to interpolate variables in translation strings
function interpolate(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key] !== undefined ? String(params[key]) : match;
  });
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const savedLang = localStorage.getItem('flowchart_language');
    return (savedLang === 'en' || savedLang === 'it') ? savedLang : 'it';
  });

  useEffect(() => {
    localStorage.setItem('flowchart_language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedTranslation(translations[language], key);

    if (params) {
      return interpolate(translation, params);
    }

    return translation;
  };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}
