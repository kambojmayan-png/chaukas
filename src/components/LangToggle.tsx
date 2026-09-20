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
      <span className="hidden min-[360px]:inline text-xs font-mono font-bold text-[#111111]/80 select-none whitespace-nowrap">
        Language / <span lang="hi">भाषा</span>:
      </span>
      <div className="flex items-center border-2 border-[#111111] rounded-md overflow-hidden bg-white shadow-hard-sm">
        <button
          type="button"
          onClick={() => setLang('en')}
          aria-label="English"
          className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
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
          aria-label="हिंदी"
          className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer leading-normal ${
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
