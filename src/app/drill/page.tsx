'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SCENARIOS, PRACTICE_PIN } from '@/scenarios';
import { useDrill } from '@/lib/useDrill';
import { useReveal } from '@/lib/useReveal';
import { speak, stopSpeaking, playRingtone, stopRing } from '@/lib/speak';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { MessageList } from '@/components/phone/MessageList';
import { ChoiceBar } from '@/components/phone/ChoiceBar';
import { PinPad } from '@/components/phone/PinPad';
import { PressureTimer } from '@/components/phone/PressureTimer';
import { SystemDialog } from '@/components/phone/SystemDialog';
import type { Lang, Scenario, Message, Surface, Action } from '@/engine/engine';

export default function DrillPage() {
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [lang, setLang] = useState<Lang>('en');
  const [muted, setMuted] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(0);

  const scenario = SCENARIOS[scenarioIndex];

  if (!scenario) {
    return (
      <main className="min-h-screen p-6 flex flex-col items-center justify-center">
        <p className="text-red-600 font-bold">Scenario not found.</p>
      </main>
    );
  }

  const handleStartDrill = () => {
    setStarted(true);
  };

  const handleRestart = () => {
    stopSpeaking();
    stopRing();
    setRunKey(k => k + 1);
    setStarted(true);
  };

  const handleNextDrill = () => {
    stopSpeaking();
    stopRing();
    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex(i => i + 1);
      setStarted(false); // Shows interstitial for next drill
      setRunKey(k => k + 1);
    } else {
      // Finished all 3 drills, reset to first
      setScenarioIndex(0);
      setStarted(false);
      setRunKey(k => k + 1);
    }
  };

  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] p-4 md:p-8 flex flex-col items-center">
      {/* Top Header Bar with Breadcrumb, Mute Toggle, and Language Toggle */}
      <div className="w-full max-w-[420px] flex items-center justify-between mb-4">
        <Link
          href="/"
          onClick={() => {
            stopSpeaking();
            stopRing();
          }}
          className="text-sm font-bold text-[#111111] hover:underline flex items-center gap-1 min-h-[44px]"
        >
          <span>←</span>
          <span>Home</span>
        </Link>

        <div className="flex items-center space-x-2">
          {/* Mute Toggle */}
          <button
            type="button"
            onClick={() => {
              setMuted(m => {
                const next = !m;
                if (next) {
                  stopSpeaking();
                  stopRing();
                }
                return next;
              });
            }}
            aria-label={muted ? 'Unmute sound' : 'Mute sound'}
            className="min-h-[38px] px-2.5 py-1 text-xs font-mono font-bold border-2 border-[#111111] rounded-md bg-white shadow-hard-sm hover:bg-[#F6F3EC] transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{muted ? '🔇' : '🔊'}</span>
            <span>{muted ? 'Muted' : 'Sound'}</span>
          </button>

          {/* Language Toggle */}
          <div className="flex items-center border-2 border-[#111111] rounded-md overflow-hidden bg-white shadow-hard-sm">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
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
              className={`px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer ${
                lang === 'hi'
                  ? 'bg-[#111111] text-white'
                  : 'text-[#111111] hover:bg-[#F6F3EC]'
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>
      </div>

      {!started ? (
        /* Scenario Setup / Interstitial Card ("Drill X of 3") */
        <div className="w-full max-w-[400px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 my-auto space-y-5">
          <div className="flex items-center justify-between">
            <div className="inline-block bg-[#FF5A1F] text-white text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              Drill {scenarioIndex + 1} of {SCENARIOS.length}
            </div>
            <span className="text-xs font-mono text-[#111111]/70 font-semibold">
              {scenario.archetype}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
            {scenario.title[lang] || scenario.title.en}
          </h1>

          <div className="bg-[#F6F3EC] border border-[#111111] p-4 rounded-md text-sm md:text-base text-[#111111] leading-relaxed">
            {scenario.setup[lang] || scenario.setup.en}
          </div>

          <div className="text-xs text-[#111111]/70 font-mono space-y-1 bg-neutral-100 p-3 rounded border border-neutral-300">
            <p className="font-bold text-[#111111]">Safety Reminders:</p>
            <p>• Practice money: ₹60,000</p>
            <p>• Practice PIN: {PRACTICE_PIN}</p>
            <p>• Never enter your real credentials.</p>
          </div>

          <button
            type="button"
            onClick={handleStartDrill}
            className="w-full min-h-[48px] py-3.5 bg-[#FF5A1F] text-white font-bold text-lg border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Drill {scenarioIndex + 1}</span>
            <span>→</span>
          </button>
        </div>
      ) : (
        /* Active Drill Runner */
        <DrillRunner
          key={`${scenario.id}-${runKey}`}
          scenario={scenario}
          scenarioIndex={scenarioIndex}
          totalScenarios={SCENARIOS.length}
          lang={lang}
          muted={muted}
          onRestart={handleRestart}
          onNextDrill={handleNextDrill}
        />
      )}
    </main>
  );
}

interface DrillRunnerProps {
  scenario: Scenario;
  scenarioIndex: number;
  totalScenarios: number;
  lang: Lang;
  muted: boolean;
  onRestart: () => void;
  onNextDrill: () => void;
}

function DrillRunner({
  scenario,
  scenarioIndex,
  totalScenarios,
  lang,
  muted,
  onRestart,
  onNextDrill,
}: DrillRunnerProps) {
  const { node, state, act, result } = useDrill(scenario);

  // Safe action wrapper: stops speech & ring BEFORE dispatching any action
  const safeAct = useCallback(
    (action: Action) => {
      stopSpeaking();
      stopRing();
      act(action);
    },
    [act]
  );

  const isCallNode = node.surface === 'call' || node.surface === 'videocall';
  const prevSurfaceRef = useRef<Surface | null>(null);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const stopRingRef = useRef<(() => void) | null>(null);

  // Incoming call handling: ring on entering call/videocall from non-call node
  useEffect(() => {
    const prev = prevSurfaceRef.current;
    const enteringCallFromNonCall =
      isCallNode && prev !== 'call' && prev !== 'videocall';

    if (enteringCallFromNonCall) {
      setCallAccepted(false);
      setCallSeconds(0);
      if (!muted) {
        stopRingRef.current = playRingtone();
      }
    } else if (isCallNode) {
      // Continuing existing call
      setCallAccepted(true);
    } else {
      // Not a call node
      setCallAccepted(false);
      setCallSeconds(0);
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
    }

    prevSurfaceRef.current = node.surface;

    return () => {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
    };
  }, [node.id, node.surface, isCallNode, muted]);

  // Elapsed call timer
  useEffect(() => {
    if (!isCallNode || !callAccepted) return;

    const timer = setInterval(() => {
      setCallSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isCallNode, callAccepted]);

  const handleAcceptCall = () => {
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    stopRing();
    setCallAccepted(true);
  };

  // While incoming call is ringing and unaccepted, hold off revealing messages
  const shouldReveal = !isCallNode || callAccepted;
  const visitKey = shouldReveal
    ? `${state.path.length}:${node.id}`
    : `ringing:${state.path.length}:${node.id}`;

  // Audio cleanup on visitKey change
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRing();
    };
  }, [visitKey]);

  // Audio cleanup when muted switched on
  useEffect(() => {
    if (muted) {
      stopSpeaking();
      stopRing();
    }
  }, [muted]);

  // Audio cleanup on document visibilitychange -> hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        stopSpeaking();
        stopRing();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Audio cleanup when runner unmounts or result screen appears
  useEffect(() => {
    if (result) {
      stopSpeaking();
      stopRing();
    }
    return () => {
      stopSpeaking();
      stopRing();
    };
  }, [result]);

  // Pacing so captions don't run ahead of voice:
  // When message i-1 has speak: true and sound is on, delay before message i is clamp(prevText.length * 60, 1500, 8000)
  // When muted, keep delayMs ?? 900
  const delays = useMemo(() => {
    if (!shouldReveal) return [];
    const msgs = node.messages ?? [];
    return msgs.map((m, i) => {
      if (i > 0 && msgs[i - 1]?.speak && !muted) {
        const prevText =
          msgs[i - 1].text[lang] || msgs[i - 1].text.en || '';
        return Math.min(Math.max(prevText.length * 60, 1500), 8000);
      }
      return m.delayMs ?? 900;
    });
  }, [node.messages, shouldReveal, muted, lang]);

  const { shown, typing, done } = useReveal(visitKey, delays);

  // TTS speak when messages with speak: true are revealed
  const lastSpokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (shown > 0 && node.messages && node.messages[shown - 1]?.speak) {
      const msgText = node.messages[shown - 1].text[lang] || node.messages[shown - 1].text.en;
      const key = `${node.id}-${shown}-${msgText}`;
      if (lastSpokenRef.current !== key) {
        lastSpokenRef.current = key;
        if (!muted) {
          speak(msgText, lang);
        }
      }
    }
  }, [shown, node.id, node.messages, lang, muted]);

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
  const smsBannerMessages = allMessages.filter(m => m.via === 'sms');

  // Extract expectedCode for keypad validation
  const expectedCode = useMemo(() => {
    if (node.input?.kind === 'pin') {
      return PRACTICE_PIN;
    }
    if (node.input?.kind === 'otp') {
      // The first 6-digit number found in the current node's message whose via === 'sms'
      const currentSms = node.messages?.find(m => m.via === 'sms');
      if (currentSms) {
        const match =
          currentSms.text.en.match(/\b\d{6}\b/) ||
          currentSms.text.hi?.match(/\b\d{6}\b/);
        if (match) return match[0];
      }
      // Also check scrollback
      for (let i = state.path.length - 1; i >= 0; i--) {
        const pastNode = scenario.nodes[state.path[i]];
        const pastSms = pastNode?.messages?.find(m => m.via === 'sms');
        if (pastSms) {
          const match =
            pastSms.text.en.match(/\b\d{6}\b/) ||
            pastSms.text.hi?.match(/\b\d{6}\b/);
          if (match) return match[0];
        }
      }
    }
    return undefined;
  }, [node, scenario.nodes, state.path]);

  // Outcome Screen when drill finishes
  if (result) {
    const isLoss = result.lossInr > 0;
    const isLastDrill = scenarioIndex === totalScenarios - 1;

    return (
      <div className="w-full max-w-[400px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 my-auto space-y-6">
        <div className="space-y-2 text-center">
          <div className="text-xs font-mono uppercase tracking-widest text-[#111111]/60">
            Drill {scenarioIndex + 1} Outcome
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

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={onNextDrill}
            className="w-full min-h-[48px] py-3.5 bg-[#FF5A1F] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>
              {isLastDrill
                ? 'All 3 Completed · Start Over'
                : `Continue to Drill ${scenarioIndex + 2} of ${totalScenarios}`}
            </span>
            <span>→</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full min-h-[48px] py-3 bg-white text-[#111111] font-bold text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Replay this drill
          </button>
        </div>
      </div>
    );
  }

  // Drill in progress inside PhoneFrame
  return (
    <div className="w-full max-w-[380px] flex flex-col items-center">
      {/* Pressure Timer Countdown: starts only when done is true */}
      {node.timerSec && done && (
        <div className="w-full mb-2">
          <PressureTimer
            seconds={node.timerSec}
            onTimeout={() => safeAct({ type: 'timeout' })}
          />
        </div>
      )}

      <PhoneFrame from={node.from} surface={node.surface}>
        {/* Top SMS Notification Banner for any revealed message with via: 'sms' */}
        {smsBannerMessages.length > 0 && (
          <div className="absolute top-2 left-2 right-2 z-40 space-y-1.5 pointer-events-auto">
            {smsBannerMessages.map((sms, i) => (
              <div
                key={i}
                className="bg-white border-2 border-[#111111] shadow-hard rounded-md p-3 text-left transition-all"
              >
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#FF5A1F] border-b border-[#111111]/10 pb-1 mb-1">
                  <span className="flex items-center gap-1">
                    <span>💬</span>
                    <span>SMS · BANK ALERT</span>
                  </span>
                  <span className="text-[10px] text-[#111111]/60">NOW</span>
                </div>
                <p className="text-xs md:text-sm font-semibold text-[#111111] leading-tight select-all">
                  {sms.text[lang] || sms.text.en}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Incoming Call Screen (Non-call to Call transition) */}
        {isCallNode && !callAccepted ? (
          <div className="flex-1 flex flex-col justify-between p-6 bg-[#0E0E10] text-[#F6F3EC] select-none text-center">
            <div className="pt-8 space-y-2">
              <span className="text-xs font-mono text-[#FF5A1F] uppercase tracking-widest block animate-pulse">
                {node.surface === 'videocall' ? 'Incoming Video Call…' : 'Incoming Call…'}
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {node.from || 'Unknown Caller'}
              </h2>
              <p className="text-xs font-mono text-white/60">
                {node.surface === 'videocall' ? 'Camera verification requested' : 'Official inquiry'}
              </p>
            </div>

            {/* Pulsing Avatar */}
            <div className="flex flex-col items-center justify-center my-auto">
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/40 flex items-center justify-center text-4xl shadow-xl z-10">
                  {node.surface === 'videocall' ? '👮‍♂️' : '📞'}
                </div>
                <div className="absolute w-32 h-32 rounded-full border border-green-500/40 animate-ping opacity-40 pointer-events-none" />
                <div className="absolute w-40 h-40 rounded-full border border-green-500/20 animate-pulse pointer-events-none" />
              </div>
            </div>

            {/* Accept Call Button (Not a scored action) */}
            <div className="pb-6">
              <button
                type="button"
                onClick={handleAcceptCall}
                className="w-full min-h-[52px] py-3.5 bg-[#12B76A] text-white font-bold text-lg rounded-full shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>📞</span>
                <span>Accept</span>
              </button>
            </div>
          </div>
        ) : node.surface === 'system' && !node.end ? (
          /* System Permission Modal (e.g. bijli-remote n3 screen-share) */
          <SystemDialog
            title={node.from}
            messages={node.messages}
            choices={node.choices}
            lang={lang}
            done={done}
            onChoose={choiceId => safeAct({ type: 'choose', choiceId })}
          />
        ) : (
          /* Standard Surfaces: Chat, SMS, Call, VideoCall, UPI */
          <>
            {/* If node has input: show MessageList while !done, then show PinPad when done */}
            {node.input ? (
              done ? (
                <PinPad
                  kind={node.input.kind}
                  prompt={node.input.prompt[lang] || node.input.prompt.en}
                  detail={node.input.detail[lang] || node.input.detail.en}
                  practicePin={PRACTICE_PIN}
                  expectedCode={expectedCode}
                  onSubmit={(len, hesitationMs) =>
                    safeAct({ type: 'input_submit', len, hesitationMs })
                  }
                  onCancel={() => safeAct({ type: 'input_cancel' })}
                />
              ) : (
                <MessageList
                  messages={allMessages}
                  typing={typing}
                  lang={lang}
                  skin={node.surface}
                  from={node.from}
                  callSeconds={callSeconds}
                />
              )
            ) : (
              <>
                <MessageList
                  messages={allMessages}
                  typing={typing}
                  lang={lang}
                  skin={node.surface}
                  from={node.from}
                  callSeconds={callSeconds}
                />
                {done && node.choices && (
                  <ChoiceBar
                    choices={node.choices}
                    lang={lang}
                    onChoose={choiceId => safeAct({ type: 'choose', choiceId })}
                  />
                )}
              </>
            )}
          </>
        )}
      </PhoneFrame>
    </div>
  );
}
