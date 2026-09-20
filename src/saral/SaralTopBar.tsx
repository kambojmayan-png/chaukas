'use client';

import React from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface SaralTopBarProps {
  lang: Lang;
  onToggleLang: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  practiceNumber?: number | null;
  onLeavePractice?: () => void;
}

export function SaralTopBar({
  lang,
  onToggleLang,
  soundOn,
  onToggleSound,
  practiceNumber,
  onLeavePractice,
}: SaralTopBarProps) {
  return (
    <header className="w-full bg-[#FBF7F0] border-b-2 border-[#1A1A1A]/15 pb-2.5 pt-1">
      <div className="flex items-center justify-between gap-2 max-w-xl mx-auto">
        {/* Brand */}
        <div className="flex items-center shrink-0">
          <span
            lang="hi"
            className="text-2xl font-black text-[#1A1A1A] tracking-normal select-none"
          >
            चौकस
          </span>
        </div>

        {/* Persistent Reassurance Chip */}
        <div className="min-w-0 flex-1 flex justify-center px-1">
          <span className="bg-[#E6F3EE] text-[#0F6B4F] border border-[#0F6B4F]/30 text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full text-center leading-normal truncate">
            {t('practice_chip', lang)}
          </span>
        </div>

        {/* Right Controls: Language pill + Sound toggle (56px) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Pill: Shows "English" while in Hindi, and "हिंदी" while in English */}
          <button
            type="button"
            onClick={onToggleLang}
            className="min-h-[44px] px-3 py-1 rounded-full border-2 border-[#1A1A1A] bg-white text-xs sm:text-sm font-bold text-[#1A1A1A] hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer leading-normal"
            aria-label="Toggle language"
          >
            {lang === 'hi' ? 'English' : 'हिंदी'}
          </button>

          {/* Sound Button: 56px tap target, 🔊 / 🔇 */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? t('sound_on', lang) : t('sound_off', lang)}
            className="min-w-[56px] min-h-[56px] w-14 h-14 rounded-full border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] flex items-center justify-center text-2xl shadow-sm hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Inside practice: progress indicator and leave link */}
      {practiceNumber != null && (
        <div className="flex items-center justify-between text-sm sm:text-base font-bold text-[#1A1A1A]/80 pt-2 mt-2 border-t border-[#1A1A1A]/10 max-w-xl mx-auto">
          <span>{t('practice_n', lang, { n: practiceNumber })}</span>
          {onLeavePractice && (
            <button
              type="button"
              onClick={onLeavePractice}
              className="text-xs sm:text-sm text-[#C92A2A] hover:underline font-bold cursor-pointer py-1"
            >
              {t('leave_practice', lang)}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
