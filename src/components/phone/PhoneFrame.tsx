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
    <div className="w-full min-[480px]:max-w-[380px] mx-auto h-[calc(100dvh-175px)] min-[480px]:h-auto flex flex-col min-h-0">
      {/* Phone Outer Shell: Below 480px no bezel, no padding, no rounded border. From 480px up: phone frame. */}
      <div className="relative flex-1 flex flex-col min-h-0 bg-transparent min-[480px]:bg-[#0E0E10] min-[480px]:p-3 min-[480px]:rounded-[36px] min-[480px]:border-2 min-[480px]:border-[#111111] min-[480px]:shadow-hard">
        {/* SIMULATION Watermark on desktop phone frame (>= 480px) */}
        <div className="hidden min-[480px]:block absolute top-5 right-6 z-50 pointer-events-none">
          <span className="bg-[#111111]/85 text-[#F6F3EC] text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded border border-white/20 uppercase shadow-sm">
            {t('simulation', lang)}
          </span>
        </div>

        {/* Inner Phone Screen */}
        <div className="relative bg-[#F6F3EC] text-[#111111] rounded-md min-[480px]:rounded-[24px] overflow-hidden flex flex-col flex-1 min-h-0 border-2 border-[#111111] min-[480px]:border-black/30 min-[480px]:aspect-[9/19] min-[480px]:min-h-[600px] shadow-hard-sm min-[480px]:shadow-none">
          {/* Status Bar (shown only from 480px up) */}
          <div className="hidden min-[480px]:flex h-7 bg-[#0E0E10] text-[#F6F3EC] px-4 items-center justify-between text-xs font-mono select-none shrink-0">
            <span>9:41</span>
            <div className="flex items-center space-x-1.5">
              <span>5G</span>
              <span className="w-4 h-2 border border-[#F6F3EC] rounded-xs inline-block relative after:content-[''] after:absolute after:inset-0.5 after:bg-[#F6F3EC]"></span>
            </div>
          </div>

          {/* Slim Top Bar:
              Below 480px: caller name + SIMULATION watermark.
              From 480px up: full app header with SBI/active now subtext. */}
          <header className="bg-white border-b-2 border-[#111111] px-3 py-2 min-[480px]:py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5 min-w-0 flex-1 mr-2">
              <div className="w-7 h-7 min-[480px]:w-8 min-[480px]:h-8 rounded-full bg-[#0E0E10] text-white flex items-center justify-center font-bold text-xs min-[480px]:text-sm shrink-0">
                {isUpi ? '₹' : headerTitle.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs min-[480px]:text-sm font-bold text-[#111111] truncate">
                  {headerTitle}
                </div>
                <div className="hidden min-[480px]:block text-[11px] text-[#111111]/70 truncate">
                  {isUpi ? 'State Bank of India (•••4210)' : t('active_now', lang)}
                </div>
              </div>
            </div>

            {/* Mobile SIMULATION watermark in the slim top bar (< 480px) */}
            <div className="min-[480px]:hidden shrink-0">
              <span className="bg-[#111111] text-[#F6F3EC] text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded border border-white/20 uppercase">
                {t('simulation', lang)}
              </span>
            </div>
          </header>

          {/* Screen Content: fills space, scrolls internally, bottom controls pinned */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
