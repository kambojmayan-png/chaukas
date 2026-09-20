'use client';

import React from 'react';

interface SaralGuideBubbleProps {
  text: string;
  className?: string;
}

export function SaralGuideBubble({ text, className = '' }: SaralGuideBubbleProps) {
  return (
    <div
      className={`w-full bg-[#E6F3EE] border-2 border-[#0F6B4F]/30 rounded-[16px] p-4 sm:p-5 shadow-sm text-left ${className}`}
    >
      <div className="flex items-center gap-2.5 mb-2 pb-1.5 border-b border-[#0F6B4F]/20">
        <div className="w-10 h-10 rounded-full bg-[#0F6B4F] text-white flex items-center justify-center text-xl shrink-0" aria-hidden="true">
          👩
        </div>
        <div className="min-w-0">
          <span lang="hi" className="font-bold text-base sm:text-lg text-[#0F6B4F] leading-tight block">
            चौकस दीदी
          </span>
        </div>
      </div>
      <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#1A1A1A] leading-[1.7]" aria-live="polite">
        {text}
      </p>
    </div>
  );
}
