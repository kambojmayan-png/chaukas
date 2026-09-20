'use client';

import React from 'react';
import { useLang } from '@/lib/useLang';

interface LangToggleProps {
  className?: string;
}

export function LangToggle({ className = '' }: LangToggleProps) {
  const [lang, setLang] = useLang();

  return (
    <div role="group" aria-label="Language / भाषा" className={`flex items-center gap-1.5 min-w-0 ${className}`}>
      <span className="hidden sm:inline text-xs font-mono font-bold text-[#111111]/80 whitespace-nowrap">
        <span lang="en">Language</span> / <span lang="hi">भाषा</span>:
      </span>
      <div className="flex items-center border-2 border-[#111111] rounded-md overflow-hidden bg-white shadow-hard-sm">
        <button
          type="button"
          onClick={() => setLang('en')}
          lang="en"
          aria-label="Switch to English"
          aria-pressed={lang === 'en'}
          className={`min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            lang === 'en'
              ? 'bg-[#111111] text-white'
              : 'bg-white text-[#111111] hover:bg-[#F6F3EC]'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => setLang('hi')}
          lang="hi"
          aria-label="हिंदी में बदलें"
          aria-pressed={lang === 'hi'}
          className={`min-h-[40px] sm:min-h-[44px] px-2.5 sm:px-3.5 py-1 text-xs sm:text-sm font-bold transition-colors cursor-pointer leading-normal ${
            lang === 'hi'
              ? 'bg-[#111111] text-white'
              : 'bg-white text-[#111111] hover:bg-[#F6F3EC]'
          }`}
        >
          हिंदी
        </button>
      </div>
    </div>
  );
}
