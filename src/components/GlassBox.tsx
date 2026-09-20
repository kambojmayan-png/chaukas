'use client';

import React, { useState } from 'react';
import type { RunEvent, RunResult } from '@/engine/engine';
import { useLang } from '@/lib/useLang';
import { t } from '@/lib/i18n';

export interface GlassBoxProps {
  events: RunEvent[];
  result?: RunResult | null;
  className?: string;
}

export function GlassBoxPanel({
  events,
  result,
}: {
  events: RunEvent[];
  result?: RunResult | null;
}) {
  const [lang] = useLang();

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'safe':
        return 'text-[#12B76A] font-bold';
      case 'risky':
        return 'text-[#FF5A1F] font-bold';
      case 'compromise':
        return 'text-[#D92D20] font-bold';
      default:
        return 'font-bold';
    }
  };

  return (
    <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 font-mono text-xs w-full">
      <div className="flex items-center justify-between border-b-2 border-[#111111] pb-2 mb-3">
        <span className="font-bold uppercase tracking-wider text-xs text-[#111111]">
          {t('engine_recording_title', lang)}
        </span>
        <span lang="en" className="text-[10px] bg-[#111111] text-white px-1.5 py-0.5 rounded font-bold">
          GLASS BOX
        </span>
      </div>

      {/* Events log stream - log lines remain in English per specification */}
      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-xs text-[#111111]/50 italic">
            {t('waiting_first_action', lang)}
          </div>
        ) : (
          events.map((e, idx) => (
            <div
              key={idx}
              lang="en"
              className="text-xs leading-relaxed text-[#111111] flex items-center gap-1.5 flex-wrap keep-mono font-mono"
            >
              <span>t={(e.t / 1000).toFixed(1)}s</span>
              <span className="text-[#111111]/40">·</span>
              <span className="font-medium">{e.tag || e.kind}</span>
              <span className="text-[#111111]/40">·</span>
              <span className={getRiskColor(e.risk)}>{e.risk}</span>
            </div>
          ))
        )}
      </div>

      {/* Formatted RunResult JSON on finish */}
      {result && (
        <div className="mt-4 pt-3 border-t-2 border-[#111111]/10">
          <div lang="en" className="text-[11px] font-bold uppercase tracking-wider text-[#111111]/70 mb-1.5">
            RunResult
          </div>
          <pre lang="en" className="bg-[#111111] text-[#F6F3EC] p-3 rounded text-[11px] max-w-full overflow-x-auto leading-tight keep-mono font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Footnote */}
      <p className="mt-3 text-[11px] text-[#111111]/70 border-t border-[#111111]/10 pt-2 leading-tight">
        {t('glassbox_footnote', lang)}
      </p>
    </div>
  );
}

export function GlassBox({ events, result, className = '' }: GlassBoxProps) {
  const [lang] = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop View (>= 1024px): Panel to the right of the phone */}
      <div className={`hidden lg:block w-96 shrink-0 ${className}`}>
        <GlassBoxPanel events={events} result={result} />
      </div>

      {/* Mobile View (< 1024px): "Show engine log" toggle under the phone */}
      <div className="lg:hidden w-full mt-3">
        <button
          type="button"
          onClick={() => setMobileOpen(o => !o)}
          className="w-full min-h-[40px] py-2 px-3 text-xs font-mono font-bold bg-white text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-between cursor-pointer"
        >
          <span>
            {mobileOpen
              ? t('hide_engine_log', lang)
              : t('show_engine_log', lang)}
          </span>
          <span className="text-[10px] text-[#111111]/60">
            {events.length} {events.length === 1 ? t('event', lang) : t('events', lang)}
          </span>
        </button>
        {mobileOpen && (
          <div className="mt-2 animate-in fade-in duration-200">
            <GlassBoxPanel events={events} result={result} />
          </div>
        )}
      </div>
    </>
  );
}
