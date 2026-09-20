'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { byId, PRACTICE_PIN } from '@/scenarios';
import { useDrill } from '@/lib/useDrill';
import { useReveal } from '@/lib/useReveal';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { MessageList } from '@/components/phone/MessageList';
import { ChoiceBar } from '@/components/phone/ChoiceBar';
import { PinPad } from '@/components/phone/PinPad';
import type { Lang, Scenario, Message } from '@/engine/engine';

export default function DrillPage() {
  const scenario = byId('olx-qr');
  const [lang, setLang] = useState<Lang>('en');
  const [started, setStarted] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(0);

  if (!scenario) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center">
        <p className="text-red-600 font-bold">Scenario not found.</p>
      </main>
    );
  }

  const handleRestart = () => {
    setRunKey(k => k + 1);
    setStarted(true);
  };

  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] p-4 md:p-8 flex flex-col items-center">
      {/* Top Bar with Language Toggle & Breadcrumb */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-4">
        <Link
          href="/"
          className="text-sm font-bold text-[#111111] hover:underline flex items-center gap-1 min-h-[44px]"
        >
          <span>←</span>
          <span>Chaukas Home</span>
        </Link>
        <div className="flex items-center space-x-1 border-2 border-[#111111] rounded-md overflow-hidden bg-white shadow-hard-sm">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              lang === 'en'
                ? 'bg-[#111111] text-white'
                : 'text-[#111111] hover:bg-[#F6F3EC]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-3 py-1 text-xs font-bold transition-colors ${
              lang === 'hi'
                ? 'bg-[#111111] text-white'
                : 'text-[#111111] hover:bg-[#F6F3EC]'
            }`}
          >
            हिंदी
          </button>
        </div>
      </div>

      {!started ? (
        /* Scenario Setup Card */
        <div className="w-full max-w-[400px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 my-auto space-y-5">
          <div className="inline-block bg-[#FF5A1F] text-white text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded">
            Drill 1 · {scenario.archetype}
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            {scenario.title[lang] || scenario.title.en}
          </h1>

          <div className="bg-[#F6F3EC] border border-[#111111] p-4 rounded-md text-sm md:text-base text-[#111111] leading-relaxed">
            {scenario.setup[lang] || scenario.setup.en}
          </div>

          <div className="text-xs text-[#111111]/70 font-mono space-y-1">
            <p>• Practice money: ₹60,000</p>
            <p>• Practice PIN: {PRACTICE_PIN}</p>
            <p>• Never enter your real PIN anywhere.</p>
          </div>

          <button
            type="button"
            onClick={() => setStarted(true)}
            className="w-full min-h-[48px] py-3.5 bg-[#FF5A1F] text-white font-bold text-lg border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start the drill</span>
            <span>→</span>
          </button>
        </div>
      ) : (
        /* Active Drill Runner */
        <DrillRunner
          key={runKey}
          scenario={scenario}
          lang={lang}
          onRestart={handleRestart}
        />
      )}
    </main>
  );
}

interface DrillRunnerProps {
  scenario: Scenario;
  lang: Lang;
  onRestart: () => void;
}

function DrillRunner({ scenario, lang, onRestart }: DrillRunnerProps) {
  const { node, state, act, result } = useDrill(scenario);

  const visitKey = `${state.path.length}:${node.id}`;
  const delays = useMemo(
    () => (node.messages ?? []).map(m => m.delayMs ?? 900),
    [node.messages]
  );
  const { shown, typing, done } = useReveal(visitKey, delays);

  // Messages from earlier nodes stay in scrollback, fully shown
  const scrollbackMessages = useMemo(() => {
    const past: Message[] = [];
    for (let i = 0; i < state.path.length - 1; i++) {
      const pastNode = scenario.nodes[state.path[i]];
      if (pastNode?.messages) {
        past.push(...pastNode.messages);
      }
    }
    return past;
  }, [scenario.nodes, state.path]);

  const currentVisibleMessages = (node.messages ?? []).slice(0, shown);
  const allMessages = [...scrollbackMessages, ...currentVisibleMessages];

  // When result exists, show plain outcome screen
  if (result) {
    const isLoss = result.lossInr > 0;

    return (
      <div className="w-full max-w-[400px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 my-auto space-y-6">
        <div className="space-y-2 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-[#111111]/60">
            Drill Outcome
          </div>
          <div
            className={`text-4xl md:text-5xl font-extrabold tabular-nums tracking-tight ${
              isLoss ? 'text-[#D92D20]' : 'text-[#12B76A]'
            }`}
          >
            {isLoss
              ? `−₹${result.lossInr.toLocaleString('en-IN')}`
              : '₹0 lost'}
          </div>
          <p className="text-base font-semibold text-[#111111]">
            {result.headline[lang] || result.headline.en}
          </p>
        </div>

        {/* Rule Box */}
        <div className="border-2 border-[#111111] bg-[#F6F3EC] p-4 rounded-md shadow-hard-sm space-y-1.5">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F]">
            The Rule
          </div>
          <p className="text-sm md:text-base font-semibold text-[#111111] leading-snug">
            {scenario.rule[lang] || scenario.rule.en}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onRestart}
            className="w-full min-h-[48px] py-3 bg-[#FF5A1F] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Replay drill
          </button>
          <Link
            href="/"
            className="w-full min-h-[48px] py-3 bg-white text-[#111111] font-bold text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center cursor-pointer"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Drill in progress inside PhoneFrame
  return (
    <PhoneFrame from={node.from} surface={node.surface}>
      {node.surface === 'upi' ? (
        done && node.input && (
          <PinPad
            kind={node.input.kind}
            prompt={node.input.prompt[lang] || node.input.prompt.en}
            detail={node.input.detail[lang] || node.input.detail.en}
            practicePin={PRACTICE_PIN}
            onSubmit={(len, hesitationMs) =>
              act({ type: 'input_submit', len, hesitationMs })
            }
            onCancel={() => act({ type: 'input_cancel' })}
          />
        )
      ) : (
        <>
          <MessageList
            messages={allMessages}
            typing={typing}
            lang={lang}
            skin={node.surface}
          />
          {done && node.choices && (
            <ChoiceBar
              choices={node.choices}
              lang={lang}
              onChoose={choiceId => act({ type: 'choose', choiceId })}
            />
          )}
          {done && node.input && (
            <PinPad
              kind={node.input.kind}
              prompt={node.input.prompt[lang] || node.input.prompt.en}
              detail={node.input.detail[lang] || node.input.detail.en}
              practicePin={PRACTICE_PIN}
              onSubmit={(len, hesitationMs) =>
                act({ type: 'input_submit', len, hesitationMs })
              }
              onCancel={() => act({ type: 'input_cancel' })}
            />
          )}
        </>
      )}
    </PhoneFrame>
  );
}
