'use client';

import React from 'react';
import Link from 'next/link';
import type { Scenario, RunState, RunResult, Lang } from '@/engine/engine';
import { getFlagLabel, t } from '@/lib/i18n';
import { GlassBox, GlassBoxPanel } from '@/components/GlassBox';

interface DebriefProps {
  scenario: Scenario;
  state: RunState;
  result: RunResult;
  lang: Lang;
  knewAnswer?: { knew: boolean | null; answeredAt: number };
  isLastDrill: boolean;
  isOnlyMode: boolean;
  scenarioIndex: number;
  totalScenarios: number;
  onNextDrill: () => void;
  onRestart: () => void;
  onShowReport: () => void;
}

export function Debrief({
  scenario,
  state,
  result,
  lang,
  knewAnswer,
  isLastDrill,
  isOnlyMode,
  scenarioIndex,
  totalScenarios,
  onNextDrill,
  onRestart,
  onShowReport,
}: DebriefProps) {
  const isLoss = result.lossInr > 0;

  // Calculate elapsed time since pre-check answer
  const now = Date.now();
  const elapsedSec = Math.max(
    1,
    Math.round((now - (knewAnswer?.answeredAt || now)) / 1000)
  );
  const timeStr =
    elapsedSec < 60
      ? `${elapsedSec} ${t('seconds', lang)}`
      : `${Math.round(elapsedSec / 60)} ${t('minutes', lang)}`;

  const showKnewBox = knewAnswer?.knew === true && result.outcome === 'scammed';

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 md:gap-8 w-full max-w-5xl my-auto">
      <div className="w-full max-w-[440px] bg-white border border-[#1A1A1A]/15 rounded-[16px] shadow-[0_2px_12px_rgba(26,26,26,0.06)] p-5 sm:p-6 space-y-5 sm:space-y-6">
        {/* 1. Headline and Amount */}
        <div className="space-y-2 text-center">
          <div className="text-sm font-semibold text-[#1A1A1A]/60">
            {isOnlyMode
              ? t('targeted_debrief', lang)
              : t('drill_debrief_n', lang, {
                  n: scenarioIndex + 1,
                  total: totalScenarios,
                })}
          </div>
          <div
            className={`text-4xl md:text-5xl font-extrabold tabular-nums tracking-tight ${
              isLoss ? 'text-[#C92A2A]' : 'text-[#2B8A3E]'
            }`}
          >
            {isLoss
              ? `−₹${result.lossInr.toLocaleString('en-IN')}`
              : t('zero_lost', lang)}
          </div>
          <p className="text-lg font-bold text-[#1A1A1A] leading-snug">
            {result.headline[lang] || result.headline.en}
          </p>
        </div>

        {/* 2. "You answered this correctly N seconds/minutes ago: '<question>' — and still did it." */}
        {showKnewBox && (
          <div className="border border-[#C92A2A]/30 bg-[#FDF2F2] p-4 rounded-[14px] shadow-[0_2px_8px_rgba(201,42,42,0.06)] space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-sm font-bold text-[#C92A2A]">
              <span>⚠️</span>
              <span>{t('knowledge_behaviour_gap_label', lang)}</span>
            </div>
            <p className="text-base font-bold text-[#C92A2A] leading-snug">
              {t('you_answered_correctly', lang, {
                t: timeStr,
                q: scenario.precheck.q[lang] || scenario.precheck.q.en,
              })}
            </p>
          </div>
        )}

        {/* 3. Timeline: every message in state.path with red flag pills; input.detail highlighted */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 border-b border-[#111111]/20 pb-1">
            <span>{t('timeline_replay', lang)}</span>
            <span>
              {state.path.length}{' '}
              {state.path.length === 1 ? t('step', lang) : t('steps', lang)}
            </span>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {state.path.map((nodeId, pathIdx) => {
              const node = scenario.nodes[nodeId];
              if (!node) return null;

              return (
                <div key={`${nodeId}-${pathIdx}`} className="space-y-2">
                  {/* Messages in this node */}
                  {node.messages?.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className="bg-[#F6F3EC] border border-[#111111]/30 rounded p-2.5 text-xs md:text-sm space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-[#111111]/60">
                        <span>{node.from || 'Scammer'}</span>
                        {msg.via && (
                          <span className="uppercase font-bold text-[#FF5A1F]">
                            via {msg.via}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-[#111111]">
                        {msg.text[lang] || msg.text.en}
                      </p>
                      {msg.flags && msg.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {msg.flags.map(flag => (
                            <span
                              key={flag}
                              className="inline-flex items-center px-1.5 py-1 rounded text-[10px] font-mono font-bold bg-red-100 text-[#D92D20] border border-red-300 leading-normal"
                            >
                              🚩 {getFlagLabel(flag, lang)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Input node highlighted detail with its flags */}
                  {node.input && (
                    <div className="bg-amber-50 border-2 border-amber-500 rounded p-2.5 text-xs md:text-sm space-y-1.5 text-left shadow-sm">
                      <div className="flex items-center justify-between text-[10px] font-mono text-amber-900 font-bold uppercase tracking-wider">
                        <span>
                          ⚠️{' '}
                          {node.input.kind === 'pin'
                            ? t('upi_pin_screen', lang)
                            : t('otp_verification_screen', lang)}
                        </span>
                        <span>{t('keypad_label', lang)}</span>
                      </div>
                      <p className="font-bold text-amber-950 text-xs md:text-sm">
                        {node.input.detail[lang] || node.input.detail.en}
                      </p>
                      {node.input.flags && node.input.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {node.input.flags.map(flag => (
                            <span
                              key={flag}
                              className="inline-flex items-center px-1.5 py-1 rounded text-[10px] font-mono font-bold bg-red-100 text-[#D92D20] border border-red-300 leading-normal"
                            >
                              🚩 {getFlagLabel(flag, lang)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. "Red flags you walked past: n of N" and keypad pause */}
        <div className="bg-[#FBF7F0] border border-[#1A1A1A]/15 rounded-[12px] p-3.5 text-sm space-y-1 text-left">
          <p className="font-bold text-[#1A1A1A]">
            {t('red_flags_walked_past', lang, {
              n: result.flagsWalkedPast.length,
              total: result.flagsTotal,
            })}
          </p>
          {result.hesitationMs != null && (
            <p className="text-[#1A1A1A]/75">
              {t('you_paused_keypad', lang, {
                x: (result.hesitationMs / 1000).toFixed(1),
              })}
            </p>
          )}
        </div>

        {/* 5. The rule in a bordered box */}
        <div className="border border-[#1A1A1A]/15 bg-[#FBF7F0] p-4 rounded-[14px] shadow-[0_2px_8px_rgba(26,26,26,0.04)] space-y-1.5 text-left">
          <div className="text-sm font-bold text-[#E8590C]">
            {t('the_rule', lang)}
          </div>
          <p className="text-base font-semibold text-[#1A1A1A] leading-snug">
            {scenario.rule[lang] || scenario.rule.en}
          </p>
        </div>

        {/* 6. Collapsible "If this happens for real" */}
        <details className="border border-[#1A1A1A]/15 bg-white rounded-[14px] p-4 text-left group">
          <summary className="font-bold text-sm md:text-base cursor-pointer flex items-center justify-between">
            <span>{t('if_this_happens_for_real', lang)}:</span>
            <span className="text-xs text-[#1A1A1A]/60 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <ul className="mt-2.5 space-y-1.5 text-sm text-[#1A1A1A]/90 border-t border-[#1A1A1A]/10 pt-2.5 list-disc pl-4 font-medium leading-relaxed">
            <li>
              <span className="font-bold text-[#C92A2A]">
                {t('call_1930_immediately', lang)}
              </span>{' '}
              {t('call_1930_helpline_desc', lang)}
            </li>
            <li>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold text-[#0F6B4F] hover:text-[#1A1A1A]"
              >
                {t('report_cybercrime', lang)}
              </a>
              .
            </li>
            <li>{t('call_bank_official_desc', lang)}</li>
            <li>
              <span className="font-bold">
                {t('report_sanchar_saathi', lang)}
              </span>
              .
            </li>
          </ul>
        </details>

        {/* 7. Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {isOnlyMode ? (
            <>
              <button
                type="button"
                onClick={onRestart}
                className="w-full min-h-[48px] py-3 px-5 bg-[#E8590C] text-white font-bold text-base sm:text-lg rounded-[14px] shadow-[0_2px_10px_rgba(232,89,12,0.25)] hover:bg-[#D44F0A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t('redrill_this_one', lang)}</span>
                <span>↺</span>
              </button>

              <Link
                href="/check"
                className="w-full min-h-[48px] py-2.5 px-4 bg-white text-[#1A1A1A] font-bold text-base border-2 border-[#1A1A1A]/15 rounded-[14px] shadow-[0_2px_6px_rgba(26,26,26,0.04)] hover:bg-[#FBF7F0] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>{t('check_suspicious_message', lang)}</span>
              </Link>

              <Link
                href="/drill"
                className="w-full min-h-[48px] py-2.5 px-4 bg-[#FBF7F0] text-[#1A1A1A] font-bold text-base border border-[#1A1A1A]/15 rounded-[14px] hover:bg-[#F0EBE1] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <span>{t('play_full_drill_cta', lang)}</span>
              </Link>
            </>
          ) : (
            <>
              {isLastDrill ? (
                <button
                  type="button"
                  onClick={onShowReport}
                  className="w-full min-h-[48px] py-3 px-5 bg-[#0F6B4F] text-white font-bold text-base sm:text-lg rounded-[14px] shadow-[0_2px_10px_rgba(15,107,79,0.25)] hover:bg-[#0F6B4F]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('see_my_report', lang)}</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNextDrill}
                  className="w-full min-h-[48px] py-3 px-5 bg-[#E8590C] text-white font-bold text-base sm:text-lg rounded-[14px] shadow-[0_2px_10px_rgba(232,89,12,0.25)] hover:bg-[#D44F0A] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {t('next_drill_n', lang, {
                      n: scenarioIndex + 2,
                      total: totalScenarios,
                    })}
                  </span>
                  <span>→</span>
                </button>
              )}

              <button
                type="button"
                onClick={onRestart}
                className="w-full min-h-[48px] py-2.5 px-4 bg-white text-[#1A1A1A] font-bold text-base border-2 border-[#1A1A1A]/15 rounded-[14px] shadow-[0_2px_6px_rgba(26,26,26,0.04)] hover:bg-[#FBF7F0] active:scale-[0.98] transition-all cursor-pointer"
              >
                {t('redrill_this_one', lang)}
              </button>
            </>
          )}
        </div>
      </div>

      {/* GlassBox on Debrief screen */}
      <div className="w-full max-w-[440px] lg:w-96 shrink-0">
        <div className="hidden lg:block">
          <GlassBoxPanel events={state.events} result={result} />
        </div>
        <div className="lg:hidden">
          <GlassBox events={state.events} result={result} />
        </div>
      </div>
    </div>
  );
}
