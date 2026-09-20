'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';

export function TopBar() {
  const [lang] = useLang();

  return (
    <header className="w-full flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#1A1A1A]/15 mb-6 sm:mb-8">
      {/* Brand -> / */}
      <Link
        href="/"
        className="inline-flex items-center gap-2.5 min-h-[48px] py-1 text-decoration-none group"
        aria-label="Chaukas Home"
      >
        <span
          lang={lang}
          className={`text-2xl sm:text-3xl font-black text-[#1A1A1A] tracking-tight ${lang === 'hi' ? 'font-hindi' : ''}`}
        >
          {t('brand_word', lang)}
        </span>
        {lang === 'hi' && (
          <span
            lang="en"
            className="text-xs sm:text-sm font-bold text-[#1A1A1A]/60 px-2 py-0.5 bg-[#1A1A1A]/5 rounded-md"
          >
            CHAUKAS
          </span>
        )}
      </Link>

      {/* Actions: Large back_to_practice button + LangToggle */}
      <div className="flex flex-wrap items-center gap-3 min-w-0">
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[48px] px-4 sm:px-6 py-2.5 bg-[#0F6B4F] text-white font-bold text-base sm:text-lg rounded-[14px] shadow-[0_2px_10px_rgba(15,107,79,0.25)] hover:bg-[#0F6B4F]/90 active:scale-[0.98] transition-all text-center"
        >
          {t('back_to_practice', lang)}
        </Link>
        <div className="flex items-center min-h-[48px]">
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
