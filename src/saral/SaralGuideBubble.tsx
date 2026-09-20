'use client';

import React from 'react';
import { useLang } from '@/lib/useLang';
import { t } from '@/lib/i18n';

interface SaralGuideBubbleProps {
  text: string;
  className?: string;
}

export function SaralGuideBubble({ text, className = '' }: SaralGuideBubbleProps) {
  const [lang] = useLang();
  const guideName = t('guide_name', lang);

  return (
    <div
      className={`w-full bg-[#E6F3EE] border-2 border-[#0F6B4F]/30 rounded-[16px] p-3 sm:p-5 shadow-sm text-left ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 mb-1.5 sm:mb-2 pb-1 sm:pb-1.5 border-b border-[#0F6B4F]/20">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0F6B4F] text-white flex items-center justify-center text-base sm:text-xl shrink-0" aria-hidden="true">
          👩
        </div>
        <div className="min-w-0">
          <span lang={lang} className="font-bold text-sm sm:text-lg text-[#0F6B4F] leading-tight block">
            {guideName}
          </span>
        </div>
      </div>
      <p className="text-base sm:text-xl md:text-2xl font-semibold text-[#1A1A1A] leading-[1.6] break-words" aria-live="polite">
        {text}
      </p>
    </div>
  );
}
