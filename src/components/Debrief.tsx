'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { Scenario, RunState, RunResult, Lang } from '@/engine/engine';
import { getFlagLabel } from '@/lib/i18n';
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
      ? `${elapsedSec} ${lang === 'hi' ? 'सेकंड' : 'seconds'}`
      : `${Math.round(elapsedSec / 60)} ${lang === 'hi' ? 'मिनट' : 'minutes'}`;

  const showKnewBox = knewAnswer?.knew === true && result.outcome === 'scammed';

  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 w-full max-w-5xl my-auto">
      <div className="w-full max-w-[440px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-5 md:p-6 space-y-6">
        {/* 1. Headline and Amount */}
        <div className="space-y-2 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-[#111111]/60">
            {isOnlyMode
              ? 'Targeted Drill Debrief'
              : `Drill ${scenarioIndex + 1} of ${totalScenarios} Debrief`}
          </div>
          <div
            className={`text-4xl md:text-5xl font-extrabold tabular-nums tracking-tight ${
              isLoss ? 'text-[#D92D20]' : 'text-[#12B76A]'
            }`}
          >
            {isLoss
              ? `−₹${result.lossInr.toLocaleString('en-IN')}`
              : lang === 'hi'
              ? '₹0 का नुक़सान'
              : '₹0 lost'}
          </div>
          <p className="text-base font-semibold text-[#111111]">
            {result.headline[lang] || result.headline.en}
          </p>
        </div>

        {/* 2. "You answered this correctly N seconds/minutes ago: '<question>' — and still did it." */}
        {showKnewBox && (
          <div className="border-2 border-[#D92D20] bg-red-50 p-4 rounded-md shadow-hard-sm space-y-1.5 text-left">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-[#D92D20]">
              <span>⚠️</span>
              <span>
                {lang === 'hi'
                  ? 'ज्ञान और व्यवहार में अंतर'
                  : 'Knowledge–Behaviour Gap'}
              </span>
            </div>
            <p className="text-sm md:text-base font-bold text-[#D92D20] leading-snug">
              {lang === 'hi' ? (
                <>
                  आपने इसका सही जवाब {timeStr} पहले दिया था: &ldquo;
                  {scenario.precheck.q.hi || scenario.precheck.q.en}
                  &rdquo; — और फिर भी ऐसा किया।
                </>
              ) : (
                <>
                  You answered this correctly {timeStr} ago: &ldquo;
                  {scenario.precheck.q.en || scenario.precheck.q.hi}
                  &rdquo; — and still did it.
                </>
              )}
            </p>
          </div>
        )}

        {/* 3. Timeline: every message in state.path with red flag pills; input.detail highlighted */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 border-b border-[#111111]/20 pb-1">
            <span>{lang === 'hi' ? 'टाइमलाइन रीप्ले' : 'Timeline Replay'}</span>
            <span>{state.path.length} steps</span>
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
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-[#D92D20] border border-red-300"
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
                            ? 'UPI PIN Screen'
                            : 'OTP Verification Screen'}
                        </span>
                        <span>Keypad</span>
                      </div>
                      <p className="font-bold text-amber-950 text-xs md:text-sm">
                        {node.input.detail[lang] || node.input.detail.en}
                      </p>
                      {node.input.flags && node.input.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {node.input.flags.map(flag => (
                            <span
                              key={flag}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-[#D92D20] border border-red-300"
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
        <div className="bg-neutral-100 border border-[#111111]/30 rounded-md p-3 text-xs font-mono space-y-1 text-left">
          <p className="font-bold text-[#111111]">
            {lang === 'hi' ? 'लाल झंडे (Red Flags) अनदेखे किए:' : 'Red flags you walked past:'}{' '}
            <span className="text-[#D92D20]">
              {result.flagsWalkedPast.length} of {result.flagsTotal}
            </span>
          </p>
          {result.hesitationMs != null && (
            <p className="text-[#111111]/80">
              {lang === 'hi'
                ? `आपने कीपैड पर ${(result.hesitationMs / 1000).toFixed(1)} सेकंड का समय लिया`
                : `You paused ${(result.hesitationMs / 1000).toFixed(1)} s at the keypad`}
            </p>
          )}
        </div>

        {/* 5. The rule in a bordered box */}
        <div className="border-2 border-[#111111] bg-[#F6F3EC] p-4 rounded-md shadow-hard-sm space-y-1.5 text-left">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F]">
            {lang === 'hi' ? 'अहम नियम' : 'The Rule'}
          </div>
          <p className="text-sm md:text-base font-semibold text-[#111111] leading-snug">
            {scenario.rule[lang] || scenario.rule.en}
          </p>
        </div>

        {/* 6. Collapsible "If this happens for real" */}
        <details className="border-2 border-[#111111] bg-white rounded-md p-3 text-left group">
          <summary className="font-bold text-xs md:text-sm cursor-pointer select-none flex items-center justify-between">
            <span>
              {lang === 'hi'
                ? 'अगर यह असल में हो:'
                : 'If this happens for real:'}
            </span>
            <span className="text-xs font-mono text-[#111111]/60 group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <ul className="mt-2.5 space-y-1.5 text-xs text-[#111111]/90 border-t border-[#111111]/10 pt-2 list-disc pl-4 font-medium">
            <li>
              <span className="font-bold text-[#D92D20]">Call 1930</span>{' '}
              immediately (National Cyber Crime Helpline).
            </li>
            <li>
              Report at{' '}
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noreferrer"
                className="underline font-bold hover:text-[#FF5A1F]"
              >
                cybercrime.gov.in
              </a>
              .
            </li>
            <li>Call your bank&apos;s official helpline number immediately.</li>
            <li>
              Report the suspicious number or message on{' '}
              <span className="font-bold">Sanchar Saathi (Chakshu)</span>.
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
                className="w-full min-h-[48px] py-3.5 bg-[#FF5A1F] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Re-drill this one</span>
                <span>↺</span>
              </button>

              <Link
                href="/check"
                className="w-full min-h-[44px] py-2.5 bg-white text-[#111111] font-bold text-sm border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#F6F3EC] transition-all flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                <span>Check a suspicious message</span>
              </Link>

              <Link
                href="/drill"
                className="w-full min-h-[44px] py-2.5 bg-neutral-100 text-[#111111] font-bold text-sm border-2 border-[#111111]/30 rounded-md hover:bg-neutral-200 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Play full 3-drill simulation →</span>
              </Link>
            </>
          ) : (
            <>
              {isLastDrill ? (
                <button
                  type="button"
                  onClick={onShowReport}
                  className="w-full min-h-[48px] py-3.5 bg-[#12B76A] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>See my report</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNextDrill}
                  className="w-full min-h-[48px] py-3.5 bg-[#FF5A1F] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {lang === 'hi'
                      ? `अगली ड्रिल ${scenarioIndex + 2} पर जाएँ`
                      : `Next drill (${scenarioIndex + 2} of ${totalScenarios})`}
                  </span>
                  <span>→</span>
                </button>
              )}

              <button
                type="button"
                onClick={onRestart}
                className="w-full min-h-[44px] py-2.5 bg-white text-[#111111] font-bold text-sm border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                Re-drill this one
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
