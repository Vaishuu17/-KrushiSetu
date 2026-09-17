import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

// Helper to normalize keys (e.g. 'nav_market_prices' -> 'navMarketPrices')
function normalizeKey(k) {
  if (!k || typeof k !== 'string') return '';
  return k.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function LanguageProvider({ children }) {
  // Default language preference from localStorage or fallback to English/Marathi
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem('km_lang') || 'mr';
  });

  const setLang = (newLang) => {
    if (translations[newLang]) {
      setLangState(newLang);
      localStorage.setItem('km_lang', newLang);
    }
  };

  const t = (key, fallback = '') => {
    if (!key) return fallback || '';
    const norm = normalizeKey(key);

    const currentDict = translations[lang] || translations.en || {};
    if (currentDict[key] !== undefined) return currentDict[key];
    if (currentDict[norm] !== undefined) return currentDict[norm];

    const enDict = translations.en || {};
    if (enDict[key] !== undefined) return enDict[key];
    if (enDict[norm] !== undefined) return enDict[norm];

    // If fallback is provided, return it; otherwise humanize the key
    if (fallback) return fallback;

    // Convert snake_case or camelCase key to readable text if all lookups fail
    return key
      .replace(/^nav_?/, '')
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const contextValue = useMemo(() => ({
    lang,
    setLang,
    t,
    languages: ['en', 'hi', 'mr']
  }), [lang]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (k, fb = '') => fb || k,
      languages: ['en', 'hi', 'mr']
    };
  }
  return ctx;
};

