'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language } from '@/types/diagnosis';

interface LangCtx {
  lang: Language;
  setLang: (l: Language) => void;
}

export const LanguageContext = createContext<LangCtx | null>(null);

function getInitialLang(): Language {
  if (typeof window === 'undefined') return 'ur';
  const saved = localStorage.getItem('zaraat_lang');
  return saved === 'ur' || saved === 'en' ? saved : 'ur';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ur');

  useEffect(() => {
    const saved = getInitialLang();
    setLangState(saved);
    document.dir = saved === 'ur' ? 'rtl' : 'ltr';
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.dir = lang === 'ur' ? 'rtl' : 'ltr';
    }
  }, [lang]);

  function setLang(l: Language) {
    setLangState(l);
    try {
      localStorage.setItem('zaraat_lang', l);
    } catch {
      // localStorage unavailable (private browsing) — ignore
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LangCtx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
