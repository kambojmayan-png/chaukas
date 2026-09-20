'use client';

import React from 'react';
import type { Lang, Scenario, RunState, RunResult } from '@/engine/engine';
import { t, getFlagLabel } from '@/lib/i18n';

const FLAG_PRIORITY = [
  'pin_to_receive',
  'otp_request',
  'remote_app',
  'pay_to_verify',
  'screen_says_pay',
  'secrecy',
  'unofficial_contact',
  'authority',
  'fear',
  'urgency',
  'too_good',
];

export interface TrickCardData {
  flag: string;
  words: string;
  explanation: string;
  audioKey: string;
}

export function extractTrickCards(
  scenario: Scenario,
  state: RunState,
  lang: Lang
): TrickCardData[] {
  const flagMap = new Map<string, string>();

  for (const nodeId of state.path) {
    const node = scenario.nodes[nodeId];
    if (!node) continue;

    if (node.messages) {
      for (const msg of node.messages) {
        if (msg.flags) {
          for (const f of msg.flags) {
            if (!flagMap.has(f)) {
              flagMap.set(f, msg.text[lang] || msg.text.en);
            }
          }
        }
      }
    }

    if (node.input && node.input.flags) {
      for (const f of node.input.flags) {
        if (!flagMap.has(f)) {
          flagMap.set(f, node.input.detail[lang] || node.input.detail.en);
        }
      }
    }
  }

  // Sort flags by spec priority
  const sortedFlags = Array.from(flagMap.keys()).sort((a, b) => {
    const idxA = FLAG_PRIORITY.indexOf(a);
    const idxB = FLAG_PRIORITY.indexOf(b);
    return (idxA === -1 ? 999 : idxA) - (idxB === -1 ? 999 : idxB);
  });

  return sortedFlags.slice(0, 3).map(flag => ({
    flag,
    words: flagMap.get(flag)!,
    explanation: t(`flag_explain_${flag}`, lang),
    audioKey: `flag__${flag}`,
  }));
}

interface SaralLessonCardsProps {
  scenario: Scenario;
  cards: TrickCardData[];
  activeCardIndex: number | null; // index of card currently being explained
  showSummaryFallback: boolean;
  showHelpline: boolean;
  lang: Lang;
}

export function SaralLessonCards({
  scenario,
  cards,
  activeCardIndex,
  showSummaryFallback,
  showHelpline,
  lang,
}: SaralLessonCardsProps) {
  const sid = scenario.id;

  return (
    <div className="w-full space-y-4 text-left max-w-xl mx-auto">
      {/* Trick Cards: Up to 3 cards */}
      {!showSummaryFallback && cards.length >= 2 ? (
        <div className="space-y-3.5">
          {cards.map((card, idx) => {
            const isActive = activeCardIndex === idx;
            return (
              <div
                key={card.flag}
                className={`w-full bg-white border-2 rounded-[16px] p-4 sm:p-5 shadow-sm space-y-3 transition-all ${
                  isActive
                    ? 'border-[#E8590C] ring-4 ring-[#E8590C]/20 scale-[1.01]'
                    : 'border-[#1A1A1A]'
                }`}
              >
                {/* Scammer's Words in a bubble */}
                <div className="bg-[#FBF7F0] border border-[#1A1A1A]/30 rounded-[12px] p-3 text-base sm:text-lg font-semibold text-[#1A1A1A] leading-relaxed break-words [overflow-wrap:anywhere]">
                  "{card.words}"
                </div>

                {/* Red chip with flag label */}
                <div>
                  <span className="inline-block bg-red-100 text-[#C92A2A] border-2 border-[#C92A2A]/40 text-sm font-bold px-3 py-1 rounded-full leading-normal break-words">
                    🚩 {getFlagLabel(card.flag, lang)}
                  </span>
                </div>

                {/* Explanation sentence */}
                <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-[1.7] break-words [overflow-wrap:anywhere]">
                  {card.explanation}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        /* Fallback when < 2 flagged items seen */
        <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 sm:p-5 shadow-sm space-y-2">
          <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-[1.7] break-words [overflow-wrap:anywhere]">
            {t(`flags_summary_${sid.replace(/-/g, '_')}`, lang)}
          </p>
        </div>
      )}

      {/* The Rule in a Big Bordered Card under "याद रखिए" */}
      <div className="bg-[#E6F3EE] border-2 border-[#0F6B4F] rounded-[16px] p-4 sm:p-5 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">💡</span>
          <span className="text-base sm:text-lg font-bold text-[#0F6B4F] uppercase tracking-wide">
            {t('remember', lang)}
          </span>
        </div>
        <p className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] leading-[1.7] break-words [overflow-wrap:anywhere]">
          {scenario.rule[lang] || scenario.rule.en}
        </p>
      </div>

      {/* Helpline Card: shown first time user is scammed in this visit (NO tel: link per spec!) */}
      {showHelpline && (
        <div className="bg-amber-50 border-2 border-[#E67700] rounded-[16px] p-4 sm:p-5 shadow-sm space-y-1.5">
          <div className="flex items-center gap-2 text-[#E67700] font-bold text-base">
            <span aria-hidden="true">🚨</span>
            <span>1930</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-relaxed break-words [overflow-wrap:anywhere]">
            {t('helpline_card', lang)}
          </p>
        </div>
      )}
    </div>
  );
}
