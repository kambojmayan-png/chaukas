'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Lang } from '@/engine/engine';
import { stopSpeaking } from '@/lib/speak';

const STORAGE_KEY = 'chaukas_lang';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({
  lang: 'hi',
  setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  // Default 'hi' on every new visit
  const [lang, setLangState] = useState<Lang>('hi');

  useEffect(() => {
    try {
      // ?lang= overrides
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get('lang');
      if (urlLang === 'en' || urlLang === 'hi') {
        sessionStorage.setItem(STORAGE_KEY, urlLang);
        document.documentElement.lang = urlLang;
        setLangState(urlLang);
        return;
      }

      // stored in sessionStorage key chaukas_lang
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'hi') {
        document.documentElement.lang = saved;
        setLangState(saved);
        return;
      }

      // Default 'hi' on every new visit
      sessionStorage.setItem(STORAGE_KEY, 'hi');
      document.documentElement.lang = 'hi';
    } catch {
      /* ignore */
    }
  }, []);

  // Listen for navigation or query param changes if any
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlLang = params.get('lang');
        if (urlLang === 'en' || urlLang === 'hi') {
          sessionStorage.setItem(STORAGE_KEY, urlLang);
          document.documentElement.lang = urlLang;
          setLangState(urlLang);
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    stopSpeaking();
    setLangState(newLang);
    try {
      sessionStorage.setItem(STORAGE_KEY, newLang);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLang;
      }
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): [Lang, (lang: Lang) => void] {
  const context = useContext(LangContext);
  return [context.lang, context.setLang];
}
