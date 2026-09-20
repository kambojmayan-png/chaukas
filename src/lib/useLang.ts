'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Lang } from '@/engine/engine';

const STORAGE_KEY = 'chaukas_lang';
type Listener = (lang: Lang) => void;
const listeners = new Set<Listener>();

let currentLang: Lang = 'en';
let isInitialized = false;

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'en';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'hi' || urlLang === 'en') {
      localStorage.setItem(STORAGE_KEY, urlLang);
      return urlLang;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'hi' || saved === 'en') {
      return saved;
    }
  } catch {
    /* ignore */
  }
  return 'en';
}

export function setGlobalLang(newLang: Lang) {
  currentLang = newLang;
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      /* ignore */
    }
  }
  listeners.forEach(l => l(newLang));
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      currentLang = getInitialLang();
      isInitialized = true;
      document.documentElement.lang = currentLang;
    }
    return currentLang;
  });

  useEffect(() => {
    // Sync on mount if window is available
    if (typeof window !== 'undefined') {
      const initial = getInitialLang();
      if (initial !== lang) {
        currentLang = initial;
        document.documentElement.lang = initial;
        setLangState(initial);
      }
    }

    const handler: Listener = l => setLangState(l);
    listeners.add(handler);

    // Sync across tabs via storage event
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'en' || e.newValue === 'hi')) {
        currentLang = e.newValue;
        document.documentElement.lang = e.newValue;
        setLangState(e.newValue);
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      listeners.delete(handler);
      window.removeEventListener('storage', onStorage);
    };
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setGlobalLang(l);
  }, []);

  return [lang, setLang];
}
