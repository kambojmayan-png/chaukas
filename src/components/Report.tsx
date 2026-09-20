'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Scenario, RunResult, Lang, Outcome } from '@/engine/engine';
import { knowledgeBehaviourGap } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface ReportProps {
  scenarios: Scenario[];
  knewAnswers: Record<string, { knew: boolean | null; answeredAt: number }>;
  results: Record<string, RunResult>;
  lang: Lang;
  onStartOver: () => void;
}

export function Report({
  scenarios,
  knewAnswers,
  results,
  lang,
  onStartOver,
}: ReportProps) {
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const knewArray = scenarios.map(s => knewAnswers[s.id]?.knew === true);
  const resultsArray = scenarios.map(s => results[s.id]).filter(Boolean);

  const gapData = knowledgeBehaviourGap(knewArray, resultsArray);

  const totalLost = resultsArray.reduce((acc, r) => acc + (r?.lossInr || 0), 0);
  const isLoss = totalLost > 0;

  const knewCount = knewArray.filter(Boolean).length;
  const behaviourSum = resultsArray.reduce(
    (acc, r) => acc + (r?.behaviourScore || 0),
    0
  );

  // Identify scenarios where player knew the rule but still fell for it
  const fallenScenarios = scenarios.filter(
    (s, i) => knewArray[i] && results[s.id]?.outcome === 'scammed'
  );

  const shareText = `3 minute ka scam drill — ek baar zaroor karo: ${origin}/drill?src=family&lang=hi`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const getOutcomeBadge = (outcome: Outcome) => {
    switch (outcome) {
      case 'scammed':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-red-100 text-[#D92D20] border border-red-300">
            {t('scammed', lang)}
          </span>
        );
      case 'escaped_late':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-orange-100 text-[#FF5A1F] border border-orange-300">
            {t('escaped_late', lang)}
          </span>
        );
      case 'escaped':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-green-100 text-[#12B76A] border border-green-300">
            {t('escaped', lang)}
          </span>
        );
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 my-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
          {t('final_report_tag', lang)}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111111]">
          {t('scorecard_title', lang)}
        </h1>
        <p className="text-xs text-[#111111]/70 font-mono">
          {t('knowledge_vs_behaviour', lang)}
        </p>
      </div>

      {/* "You knew the rule. You still did it." Callout */}
      {gapData.knewButFell > 0 && (
        <div className="border-2 border-[#D92D20] bg-red-50 p-4 rounded-md shadow-hard-sm space-y-3 text-left">
          <h2 className="text-xl md:text-2xl font-black text-[#D92D20] tracking-tight leading-tight">
            {t('you_knew_the_rule', lang)}
          </h2>
          <div className="space-y-2">
            <p className="text-xs font-mono font-bold uppercase text-[#D92D20]">
              {t('rules_you_knew_broke', lang)}
            </p>
            {fallenScenarios.map(s => (
              <div
                key={s.id}
                className="bg-white border border-[#D92D20]/40 p-2.5 rounded text-xs md:text-sm font-medium text-[#111111] shadow-sm"
              >
                <div className="font-bold text-[#D92D20] text-xs mb-0.5">
                  {s.title[lang] || s.title.en}:
                </div>
                {s.rule[lang] || s.rule.en}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Plain Bars: Knowledge k/3 and Behaviour b/3 */}
      <div className="space-y-4 bg-[#F6F3EC] border-2 border-[#111111] p-4 rounded-md shadow-hard-sm">
        {/* Knowledge Bar */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#111111]">
            <span>{t('knowledge', lang)}</span>
            <span>
              {knewCount}/{scenarios.length}
            </span>
          </div>
          <div className="w-full bg-white border-2 border-[#111111] h-4 rounded-full overflow-hidden">
            <div
              className="bg-[#111111] h-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((knewCount / scenarios.length) * 100)
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Behaviour Bar */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#111111]">
            <span>{t('behaviour', lang)}</span>
            <span>
              {behaviourSum}/{scenarios.length}
            </span>
          </div>
          <div className="w-full bg-white border-2 border-[#111111] h-4 rounded-full overflow-hidden">
            <div
              className="bg-[#FF5A1F] h-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round((behaviourSum / scenarios.length) * 100)
                )}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Total Practice Money Lost */}
      <div className="bg-white border-2 border-[#111111] rounded-md p-4 text-center space-y-1 shadow-hard-sm">
        <div className="text-xs font-mono uppercase tracking-wider text-[#111111]/70">
          {t('total_practice_money_lost', lang)}
        </div>
        <div
          className={`text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight ${
            isLoss ? 'text-[#D92D20]' : 'text-[#12B76A]'
          }`}
        >
          {isLoss
            ? `−₹${totalLost.toLocaleString('en-IN')}`
            : t('zero_lost', lang)}
        </div>
      </div>

      {/* One Chip per Drill */}
      <div className="space-y-2 text-left">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70">
          {t('drill_results', lang)}
        </div>
        <div className="space-y-2">
          {scenarios.map((s, idx) => {
            const res = results[s.id];
            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-2.5 bg-[#F6F3EC] border border-[#111111]/30 rounded text-xs md:text-sm"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[#111111]">
                    {t('drill_n_of_3', lang, { n: idx + 1, total: scenarios.length })}: {s.title[lang] || s.title.en}
                  </div>
                  <div className="text-[11px] text-[#111111]/70 font-mono">
                    {res?.lossInr
                      ? `−₹${res.lossInr.toLocaleString('en-IN')}`
                      : t('zero_lost', lang)}
                  </div>
                </div>
                <div>{res ? getOutcomeBadge(res.outcome) : '—'}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 pt-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full min-h-[48px] py-3.5 bg-[#12B76A] text-white font-bold text-sm md:text-base border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 text-center"
        >
          <span>📲</span>
          <span>{t('send_drill_to_mummy_papa', lang)}</span>
        </a>

        <Link
          href="/check"
          className="w-full min-h-[44px] py-2.5 bg-white text-[#111111] font-bold text-sm border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#F6F3EC] transition-all flex items-center justify-center gap-2"
        >
          <span>🔍</span>
          <span>{t('check_suspicious_message', lang)}</span>
        </Link>

        <Link
          href="/insights"
          className="w-full min-h-[44px] py-2.5 bg-[#F6F3EC] text-[#111111] font-bold text-sm border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>{t('live_numbers', lang)}</span>
        </Link>

        <button
          type="button"
          onClick={onStartOver}
          className="w-full min-h-[44px] py-2.5 bg-neutral-100 text-[#111111] font-bold text-sm border-2 border-[#111111]/30 rounded-md hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>↺</span>
          <span>{t('start_over', lang)}</span>
        </button>
      </div>
    </div>
  );
}
