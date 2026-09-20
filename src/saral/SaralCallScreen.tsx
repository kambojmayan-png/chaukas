'use client';

import React from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface SaralCallScreenProps {
  callerName: string;
  lang: Lang;
  onPickUp: () => void;
}

export function SaralCallScreen({ callerName, lang, onPickUp }: SaralCallScreenProps) {
  const initial = callerName.trim().charAt(0).toUpperCase() || '📞';

  return (
    <div className="w-full flex-1 flex flex-col justify-between items-center py-6 px-4 bg-white border-2 border-[#1A1A1A] rounded-[16px] shadow-md my-auto max-w-md mx-auto text-center space-y-6">
      {/* Top Status */}
      <div className="space-y-2 pt-2" role="status" aria-live="polite">
        <span className="inline-block text-lg sm:text-xl font-bold text-[#E8590C] animate-pulse">
          {t('incoming_call', lang)}
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-tight">
          {callerName}
        </h2>
      </div>

      {/* Large Round Avatar */}
      <div className="my-auto py-4" aria-hidden="true">
        <div className="relative flex items-center justify-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#E6F3EE] border-4 border-[#0F6B4F] text-[#0F6B4F] flex items-center justify-center text-4xl sm:text-5xl font-black shadow-lg z-10">
            {initial}
          </div>
          <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border-2 border-[#0F6B4F]/40 animate-ping pointer-events-none" />
          <div className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-[#0F6B4F]/20 animate-pulse pointer-events-none" />
        </div>
      </div>

      {/* ONE Green Button: Pick Up */}
      <div className="w-full pt-4">
        <button
          type="button"
          onClick={onPickUp}
          className="w-full min-h-[64px] py-4 px-6 bg-[#2B8A3E] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <span>{t('pick_up', lang)}</span>
        </button>
      </div>
    </div>
  );
}
