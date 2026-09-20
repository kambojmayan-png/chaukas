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

  const shareText = `3 minute ka scam drill — ek baar zaroor karo: ${origin}/?src=family`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const getOutcomeBadge = (outcome: Outcome) => {
    switch (outcome) {
      case 'scammed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FDF2F2] text-[#C92A2A] border border-[#C92A2A]/20 leading-normal">
            {t('scammed', lang)}
          </span>
        );
      case 'escaped_late':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF9DB] text-[#E67700] border border-[#E67700]/20 leading-normal">
            {t('escaped_late', lang)}
          </span>
        );
      case 'escaped':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EBFBEE] text-[#2B8A3E] border border-[#2B8A3E]/20 leading-normal">
            {t('escaped', lang)}
          </span>
        );
    }
  };

  return (
    <div role="region" aria-live="polite" className="w-full max-w-[480px] bg-white border border-[#1A1A1A]/15 rounded-[16px] shadow-[0_2px_12px_rgba(26,26,26,0.06)] p-5 sm:p-6 my-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="space-y-1 text-center">
        <div className="inline-block bg-[#1A1A1A] text-[#FBF7F0] text-xs font-bold px-3 py-1 rounded-full leading-normal">
          {t('final_report_tag', lang)}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#1A1A1A]">
          {t('scorecard_title', lang)}
        </h1>
        <p className="text-sm text-[#1A1A1A]/70">
          {t('knowledge_vs_behaviour', lang)}
        </p>
      </div>

      {/* "You knew the rule. You still did it." Callout */}
      {gapData.knewButFell > 0 && (
        <div className="border border-[#C92A2A]/30 bg-[#FDF2F2] p-4 rounded-[14px] shadow-[0_2px_8px_rgba(201,42,42,0.06)] space-y-3 text-left">
          <h2 className="text-xl md:text-2xl font-black text-[#C92A2A] tracking-tight leading-tight">
            {t('you_knew_the_rule', lang)}
          </h2>
          <div className="space-y-2">
            <p className="text-xs font-bold text-[#C92A2A]">
              {t('rules_you_knew_broke', lang)}
            </p>
            {fallenScenarios.map(s => (
              <div
                key={s.id}
                className="bg-white border border-[#C92A2A]/20 p-3 rounded-[12px] text-sm font-medium text-[#1A1A1A] shadow-xs"
              >
                <div className="font-bold text-[#C92A2A] text-xs mb-0.5">
                  {s.title[lang] || s.title.en}:
                </div>
                {s.rule[lang] || s.rule.en}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Plain Bars: Knowledge k/3 and Behaviour b/3 */}
      <div className="space-y-4 bg-[#FBF7F0] border border-[#1A1A1A]/15 p-4 rounded-[14px] shadow-[0_2px_8px_rgba(26,26,26,0.04)]">
        {/* Knowledge Bar */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-center justify-between text-sm font-bold text-[#1A1A1A]">
            <span>{t('knowledge', lang)}</span>
            <span>
              {knewCount}/{scenarios.length}
            </span>
          </div>
          <div className="w-full bg-white border border-[#1A1A1A]/20 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-[#1A1A1A] h-full rounded-full transition-all duration-500"
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
          <div className="flex items-center justify-between text-sm font-bold text-[#1A1A1A]">
            <span>{t('behaviour', lang)}</span>
            <span>
              {behaviourSum}/{scenarios.length}
            </span>
          </div>
          <div className="w-full bg-white border border-[#1A1A1A]/20 h-4 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-[#E8590C] h-full rounded-full transition-all duration-500"
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
      <div className="bg-white border border-[#1A1A1A]/15 rounded-[14px] p-4 text-center space-y-1 shadow-[0_2px_8px_rgba(26,26,26,0.04)]">
        <div className="text-sm font-semibold text-[#1A1A1A]/70">
          {t('total_practice_money_lost', lang)}
        </div>
        <div
          className={`text-3xl md:text-4xl font-extrabold tabular-nums tracking-tight ${
            isLoss ? 'text-[#C92A2A]' : 'text-[#2B8A3E]'
          }`}
        >
          {isLoss
            ? `−₹${totalLost.toLocaleString('en-IN')}`
            : t('zero_lost', lang)}
        </div>
      </div>

      {/* One Chip per Drill */}
      <div className="space-y-2 text-left">
        <div className="text-sm font-bold text-[#1A1A1A]/75">
          {t('drill_results', lang)}
        </div>
        <div className="space-y-2">
          {scenarios.map((s, idx) => {
            const res = results[s.id];
            return (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-[#FBF7F0] border border-[#1A1A1A]/15 rounded-[12px] text-sm"
              >
                <div className="space-y-0.5 min-w-0 flex-1 pr-2 break-words">
                  <div className="font-bold text-[#1A1A1A] break-words">
                    {t('drill_n_of_3', lang, { n: idx + 1, total: scenarios.length })}: {s.title[lang] || s.title.en}
                  </div>
                  <div className="text-xs text-[#1A1A1A]/70">
                    {res?.lossInr
                      ? `−₹${res.lossInr.toLocaleString('en-IN')}`
                      : t('zero_lost', lang)}
                  </div>
                </div>
                <div className="shrink-0">{res ? getOutcomeBadge(res.outcome) : '—'}</div>
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
          className="w-full min-h-[48px] py-3 px-5 bg-[#0F6B4F] text-white font-bold text-base rounded-[14px] shadow-[0_2px_10px_rgba(15,107,79,0.25)] hover:bg-[#0F6B4F]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center"
        >
          <span>📲</span>
          <span>{t('send_drill_to_mummy_papa', lang)}</span>
        </a>

        <Link
          href="/check"
          className="w-full min-h-[48px] py-2.5 px-4 bg-white text-[#1A1A1A] font-bold text-base border-2 border-[#1A1A1A]/15 rounded-[14px] shadow-[0_2px_6px_rgba(26,26,26,0.04)] hover:bg-[#FBF7F0] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>🔍</span>
          <span>{t('check_suspicious_message', lang)}</span>
        </Link>


        <button
          type="button"
          onClick={onStartOver}
          className="w-full min-h-[48px] py-2.5 px-4 bg-white text-[#1A1A1A] font-bold text-base border border-[#1A1A1A]/15 rounded-[14px] hover:bg-[#FBF7F0] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>↺</span>
          <span>{t('start_over', lang)}</span>
        </button>
      </div>
    </div>
  );
}
