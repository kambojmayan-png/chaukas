'use client';

import React, { useEffect, useState, useRef } from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface PressureTimerProps {
  seconds: number;
  lang?: Lang;
  onTimeout: () => void;
}

export function PressureTimer({ seconds, lang = 'en', onTimeout }: PressureTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(seconds);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    setTimeLeft(seconds);

    const timer = setInterval(() => {
      // Pause countdown when document is hidden
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const percentage = Math.max(0, Math.min(100, (timeLeft / seconds) * 100));

  return (
    <div className="w-full bg-[#FF5A1F] text-white border-b-2 border-[#111111] px-3 py-1.5 flex items-center justify-between text-xs font-mono font-bold shadow-sm select-none">
      <div className="flex items-center space-x-1.5">
        <span className="animate-pulse">⏱</span>
        <span className="uppercase tracking-wider">{t('hurry', lang)}</span>
        <span className="tabular-nums text-sm bg-[#111111] text-white px-1.5 py-0.5 rounded">
          {timeLeft}s
        </span>
      </div>

      <div className="w-24 h-2 bg-[#111111]/30 rounded-full overflow-hidden border border-white/30">
        <div
          className="h-full bg-white transition-all duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
