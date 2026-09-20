'use client';

import React from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';
import { useLang } from '@/lib/useLang';

interface SaralTopBarProps {
  lang: Lang;
  onToggleLang?: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  practiceNumber?: number | null;
  totalPractices?: number;
  onLeavePractice?: () => void;
}

export function SaralTopBar({
  lang,
  soundOn,
  onToggleSound,
  practiceNumber,
  totalPractices,
  onLeavePractice,
}: SaralTopBarProps) {
  const [, setLang] = useLang();

  return (
    <header className="w-full bg-[#FBF7F0] border-b-2 border-[#1A1A1A]/15 pb-2 pt-1 shrink-0 min-w-0">
      <div className="flex flex-wrap min-[480px]:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 w-full min-w-0">
        {/* Row 1 Left: Brand */}
        <div className="order-1 flex items-center shrink-0 min-w-0">
          <span
            lang={lang}
            className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-normal"
          >
            {t('brand_word', lang)}
          </span>
        </div>

        {/* Reassurance Chip: Row 2 below 480px (order-3, w-full), Centred middle item above 480px (order-2, w-auto, flex-1) */}
        <div className="order-3 min-[480px]:order-2 w-full min-[480px]:w-auto min-[480px]:flex-1 flex justify-center min-w-0 px-1">
          <span className="inline-block bg-[#E6F3EE] text-[#0F6B4F] border border-[#0F6B4F]/30 text-xs sm:text-sm font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-center leading-normal break-words max-w-full min-w-0">
            {t('practice_chip', lang)}
          </span>
        </div>

        {/* Row 1 Right: Controls (order-2 below 480px, order-3 above 480px) */}
        <div className="order-2 min-[480px]:order-3 flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          {/* ONE language pill */}
          <button
            type="button"
            onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
            aria-label="Language / भाषा"
            className="min-h-[44px] px-3 py-1 text-xs sm:text-sm font-bold border-2 border-[#1A1A1A] rounded-full bg-white text-[#1A1A1A] hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer shrink-0 min-w-0"
          >
            {lang === 'hi' ? 'English' : 'हिंदी'}
          </button>

          {/* 56px sound button */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundOn ? t('sound_on', lang) : t('sound_off', lang)}
            className="w-14 h-14 min-w-[56px] min-h-[56px] rounded-full border-2 border-[#1A1A1A] bg-white text-[#1A1A1A] flex items-center justify-center text-2xl shadow-sm hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer shrink-0 min-w-0"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
        </div>
      </div>

      {/* Inside practice: progress indicator and leave link */}
      {practiceNumber != null && (
        <div className="flex items-center justify-between text-xs sm:text-base font-bold text-[#1A1A1A]/80 pt-1.5 mt-1.5 border-t border-[#1A1A1A]/10 w-full min-w-0">
          <span className="min-w-0">{t('practice_n', lang, { n: practiceNumber, total: totalPractices ?? 3 })}</span>
          {onLeavePractice && (
            <button
              type="button"
              onClick={onLeavePractice}
              className="text-xs sm:text-sm text-[#C92A2A] hover:underline font-bold cursor-pointer py-0.5 min-w-0"
            >
              {t('leave_practice', lang)}
            </button>
          )}
        </div>
      )}
    </header>
  );
}
