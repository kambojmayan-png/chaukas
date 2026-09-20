'use client';

import React from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface PhoneFrameProps {
  from?: string;
  surface?: string;
  lang?: Lang;
  children: React.ReactNode;
}

export function PhoneFrame({ from, surface, lang = 'en', children }: PhoneFrameProps) {
  // Format header title based on surface and from
  const isUpi = surface === 'upi';
  const headerTitle = isUpi
    ? t('payapp_upi', lang)
    : from || 'ChatApp';

  return (
    <div className="w-full max-w-[380px] mx-auto">
      {/* Phone Outer Shell */}
      <div className="relative bg-[#0E0E10] p-3 rounded-[36px] border-2 border-[#111111] shadow-hard">
        {/* SIMULATION Watermark - fixed inside phone */}
        <div className="absolute top-5 right-6 z-50 pointer-events-none">
          <span className="bg-[#111111]/85 text-[#F6F3EC] text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-white/20 uppercase shadow-sm">
            {t('simulation', lang)}
          </span>
        </div>

        {/* Inner Phone Screen */}
        <div className="relative bg-[#F6F3EC] text-[#111111] rounded-[24px] overflow-hidden flex flex-col aspect-[9/19] min-h-[600px] border border-black/30">
          {/* Status Bar */}
          <div className="h-7 bg-[#0E0E10] text-[#F6F3EC] px-4 flex items-center justify-between text-xs font-mono select-none">
            <span>9:41</span>
            <div className="flex items-center space-x-1.5">
              <span>5G</span>
              <span className="w-4 h-2 border border-[#F6F3EC] rounded-xs inline-block relative after:content-[''] after:absolute after:inset-0.5 after:bg-[#F6F3EC]"></span>
            </div>
          </div>

          {/* App Header */}
          <header className="bg-white border-b-2 border-[#111111] px-3 py-2.5 flex items-center space-x-3 shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#0E0E10] text-white flex items-center justify-center font-bold text-sm shrink-0">
              {isUpi ? '₹' : headerTitle.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-[#111111] truncate">
                {headerTitle}
              </div>
              <div className="text-[11px] text-[#111111]/70 truncate">
                {isUpi ? 'State Bank of India (•••4210)' : t('active_now', lang)}
              </div>
            </div>
          </header>

          {/* Screen Content */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
