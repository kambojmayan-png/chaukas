'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SCENARIOS, PRACTICE_PIN } from '@/scenarios';
import { useDrill } from '@/lib/useDrill';
import { useReveal } from '@/lib/useReveal';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';
import { TopBar, Card, Chip, Button } from '@/ui';
import {
  speak,
  playLine,
  stopSpeaking,
  playRingtone,
  stopRing,
  unlockAudio,
  preloadScenarioClips,
  type VoiceChoice,
} from '@/lib/speak';
import voiceDurations from '@/lib/voiceDurations.json';
import { sendRun } from '@/lib/telemetry';
import { step, result as computeResult, type RunState, type RunResult, type Lang, type Scenario, type Message, type Surface, type Action } from '@/engine/engine';
import { PhoneFrame } from '@/components/phone/PhoneFrame';
import { MessageList } from '@/components/phone/MessageList';
import { ChoiceBar } from '@/components/phone/ChoiceBar';
import { PinPad } from '@/components/phone/PinPad';
import { PressureTimer } from '@/components/phone/PressureTimer';
import { SystemDialog } from '@/components/phone/SystemDialog';
import { GlassBox, GlassBoxPanel } from '@/components/GlassBox';
import { Debrief } from '@/components/Debrief';
import { Report } from '@/components/Report';
import { getAttempt, nextAttempt } from '@/lib/attempts';

const INITIAL_WALLET = 60000;

interface PrecheckAnswer {
  knew: boolean | null;
  answeredAt: number;
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem('chaukas_session_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('chaukas_session_id', id);
    }
    return id;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2);
  }
}

function getSavedVoiceChoice(): VoiceChoice | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = sessionStorage.getItem('chaukas_voice_choice');
    if (val === 'hi' || val === 'en' || val === 'off') {
      return val;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getSavedWallet(): number {
  if (typeof window === 'undefined') return INITIAL_WALLET;
  try {
    const val = sessionStorage.getItem('chaukas_wallet_balance');
    return val ? parseInt(val, 10) : INITIAL_WALLET;
  } catch {
    return INITIAL_WALLET;
  }
}

function getSavedPrecheck(): Record<string, PrecheckAnswer> {
  if (typeof window === 'undefined') return {};
  try {
    const val = sessionStorage.getItem('chaukas_precheck_answers');
    return val ? JSON.parse(val) : {};
  } catch {
    return {};
  }
}

/** Hook to smoothly animate wallet balance countdowns (<= 1.2s, tabular-nums) */
function useAnimatedWallet(targetBalance: number) {
  const [displayBalance, setDisplayBalance] = useState(targetBalance);
  const prevRef = useRef(targetBalance);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (prevRef.current === targetBalance) return;
    const startVal = prevRef.current;
    const diff = targetBalance - startVal;
    const duration = 1000; // 1s <= 1.2s
    let animId: number;

    const stepFn = (time: number) => {
      if (!startTimeRef.current) startTimeRef.current = time;
      const elapsed = time - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuad
      const ease = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(startVal + diff * ease);
      setDisplayBalance(current);

      if (progress < 1) {
        animId = requestAnimationFrame(stepFn);
      } else {
        startTimeRef.current = null;
        prevRef.current = targetBalance;
      }
    };

    animId = requestAnimationFrame(stepFn);
    return () => {
      cancelAnimationFrame(animId);
      startTimeRef.current = null;
    };
  }, [targetBalance]);

  return displayBalance;
}

type DrillScreen = 'precheck' | 'intro' | 'runner' | 'debrief' | 'report';

export default function DrillPage() {
  const [scenarioIndex, setScenarioIndex] = useState<number>(0);
  const [onlyMode, setOnlyMode] = useState<boolean>(false);
  const [targetScenarioId, setTargetScenarioId] = useState<string | null>(null);
  const [lang] = useLang();
  const [voiceChoice, setVoiceChoice] = useState<VoiceChoice>('hi');
  const [muted, setMuted] = useState<boolean>(false);
  const [runKey, setRunKey] = useState<number>(0);
  const [source, setSource] = useState<string>('direct');

  // Wallet and Pre-check states
  const [walletBalance, setWalletBalance] = useState<number>(INITIAL_WALLET);
  const [knewAnswers, setKnewAnswers] = useState<Record<string, PrecheckAnswer>>({});
  const [precheckIndex, setPrecheckIndex] = useState<number>(0);
  const [screen, setScreen] = useState<DrillScreen>('intro');
  const [results, setResults] = useState<Record<string, RunResult>>({});
  const [currentResult, setCurrentResult] = useState<RunResult | null>(null);
  const [currentState, setCurrentState] = useState<RunState | null>(null);

  const animatedBalance = useAnimatedWallet(walletBalance);

  // Initialize from sessionStorage and URL query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);

      if (params.get('src') === 'family') {
        setSource('family_link');
      }

      const only = params.get('only');
      let isOnly = false;
      if (only) {
        const idx = SCENARIOS.findIndex(s => s.id === only);
        if (idx !== -1) {
          setScenarioIndex(idx);
          setOnlyMode(true);
          setTargetScenarioId(only);
          isOnly = true;
        }
      }

      // Load saved voice
      const savedVoice = getSavedVoiceChoice();
      if (savedVoice) {
        setVoiceChoice(savedVoice);
      }

      // Load saved wallet
      const savedWallet = getSavedWallet();
      setWalletBalance(savedWallet);

      // Load saved precheck answers
      const savedPrecheck = getSavedPrecheck();
      setKnewAnswers(savedPrecheck);

      // Determine initial screen:
      // If precheck has not been answered/skipped for target scenario(s), show precheck upfront
      const targetScenarios = isOnly
        ? SCENARIOS.filter(s => s.id === only)
        : SCENARIOS;

      const hasAllAnswers = targetScenarios.every(
        s => savedPrecheck[s.id] !== undefined
      );

      if (!hasAllAnswers) {
        setScreen('precheck');
      } else {
        setScreen('intro');
      }
    }
  }, []);

  const scenario = SCENARIOS[scenarioIndex];

  // Active list of scenarios for pre-check
  const precheckScenarios = useMemo(() => {
    if (onlyMode && targetScenarioId) {
      return SCENARIOS.filter(s => s.id === targetScenarioId);
    }
    return SCENARIOS;
  }, [onlyMode, targetScenarioId]);

  if (!scenario) {
    return (
      <main className="min-h-screen p-3 md:p-8 flex flex-col items-center justify-center">
        <p className="text-red-600 font-bold">{t('scenario_not_found', lang)}</p>
      </main>
    );
  }

  const handleVoiceChange = (choice: VoiceChoice) => {
    stopSpeaking();
    setVoiceChoice(choice);
    try {
      sessionStorage.setItem('chaukas_voice_choice', choice);
    } catch {
      /* ignore */
    }
  };

  // Pre-check answering logic
  const handlePrecheckAnswer = (answer: 'yes' | 'no') => {
    const currentScen = precheckScenarios[precheckIndex];
    if (!currentScen) return;

    const isCorrect = answer === currentScen.precheck.correct;
    const updated: Record<string, PrecheckAnswer> = {
      ...knewAnswers,
      [currentScen.id]: {
        knew: isCorrect,
        answeredAt: Date.now(),
      },
    };

    setKnewAnswers(updated);
    try {
      sessionStorage.setItem('chaukas_precheck_answers', JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    if (precheckIndex < precheckScenarios.length - 1) {
      setPrecheckIndex(i => i + 1);
    } else {
      // Done with pre-check questions -> show Drill Intro Card
      setScreen('intro');
    }
  };

  const handleSkipPrecheck = () => {
    const updated = { ...knewAnswers };
    const now = Date.now();
    precheckScenarios.forEach(s => {
      if (updated[s.id] === undefined) {
        updated[s.id] = { knew: null, answeredAt: now };
      }
    });

    setKnewAnswers(updated);
    try {
      sessionStorage.setItem('chaukas_precheck_answers', JSON.stringify(updated));
    } catch {
      /* ignore */
    }

    setScreen('intro');
  };

  const handleStartDrill = () => {
    unlockAudio();
    preloadScenarioClips(scenario.id, voiceChoice);
    setScreen('runner');
  };

  const handleRestart = () => {
    unlockAudio();
    stopSpeaking();
    stopRing();
    nextAttempt(scenario.id);
    preloadScenarioClips(scenario.id, voiceChoice);
    setRunKey(k => k + 1);
    setCurrentResult(null);
    setCurrentState(null);
    setScreen('runner');
  };

  const handleNextDrill = () => {
    stopSpeaking();
    stopRing();
    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex(i => i + 1);
      setCurrentResult(null);
      setCurrentState(null);
      setRunKey(k => k + 1);
      setScreen('intro');
    } else {
      // Last drill -> show final report
      setScreen('report');
    }
  };

  const handleStartOver = () => {
    stopSpeaking();
    stopRing();
    setScenarioIndex(0);
    setWalletBalance(INITIAL_WALLET);
    setResults({});
    setCurrentResult(null);
    setCurrentState(null);
    setRunKey(k => k + 1);
    try {
      sessionStorage.setItem('chaukas_wallet_balance', String(INITIAL_WALLET));
    } catch {
      /* ignore */
    }
    setScreen('intro');
  };

  // Called when runner completes a drill
  const handleDrillFinish = (res: RunResult, finalSt: RunState) => {
    setCurrentResult(res);
    setCurrentState(finalSt);
    setResults(prev => ({ ...prev, [scenario.id]: res }));

    // On a scammed result animate wallet balance down by lossInr
    if (res.outcome === 'scammed' && res.lossInr > 0) {
      setWalletBalance(prev => {
        const next = Math.max(0, prev - res.lossInr);
        try {
          sessionStorage.setItem('chaukas_wallet_balance', String(next));
        } catch {
          /* ignore */
        }
        return next;
      });
    }

    setScreen('debrief');
  };

  const currentAttempt = getAttempt(scenario.id);
  const currentKnew = knewAnswers[scenario.id]?.knew ?? null;

  return (
    <main className="min-h-screen bg-[#FBF7F0] text-[#1A1A1A] p-4 sm:p-6 md:p-8 flex flex-col items-center">
      {/* TopBar on every page except Home */}
      <div className="w-full max-w-4xl">
        <TopBar />
      </div>

      {/* Drill Chrome Controls: Wallet, Mute, Voice */}
      <div className="w-full max-w-[440px] flex flex-col gap-3 mb-6">
        <Card className="p-3 sm:p-4 flex items-center justify-between gap-2">
          {/* Wallet Balance */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FBF7F0] border border-[#1A1A1A]/15 rounded-[12px] font-bold text-sm sm:text-base">
            <span className="text-[#1A1A1A]/70">{t('wallet', lang)}</span>
            <span className="tabular-nums text-[#1A1A1A]">
              ₹{animatedBalance.toLocaleString('en-IN')}
            </span>
          </div>

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
            aria-label={muted ? t('sound_muted', lang) : t('sound_on', lang)}
            className="min-h-[48px] px-3.5 py-2 text-sm font-bold border border-[#1A1A1A]/15 rounded-[12px] bg-white hover:bg-[#FBF7F0] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-[0_2px_6px_rgba(26,26,26,0.04)]"
          >
            <span>{muted ? '🔇' : '🔊'}</span>
            <span className="text-xs">{muted ? t('sound_muted', lang) : t('sound_on', lang)}</span>
          </button>
        </Card>

        {/* Caller Voice Control */}
        <Card className="p-3 sm:p-4 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-[#1A1A1A]/80 whitespace-nowrap">
            {t('caller_voice', lang)}
          </span>
          <div className="flex items-center border border-[#1A1A1A]/15 rounded-[12px] overflow-hidden">
            <button
              type="button"
              onClick={() => handleVoiceChange('hi')}
              lang="hi"
              aria-pressed={voiceChoice === 'hi'}
              className={`min-h-[48px] px-3.5 py-2 text-sm font-bold transition-colors cursor-pointer leading-normal ${
                voiceChoice === 'hi'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#FBF7F0]'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => handleVoiceChange('en')}
              lang="en"
              aria-pressed={voiceChoice === 'en'}
              className={`min-h-[48px] px-3.5 py-2 text-sm font-bold transition-colors cursor-pointer border-l border-r border-[#1A1A1A]/15 ${
                voiceChoice === 'en'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#FBF7F0]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => handleVoiceChange('off')}
              aria-pressed={voiceChoice === 'off'}
              className={`min-h-[48px] px-3.5 py-2 text-sm font-bold transition-colors cursor-pointer ${
                voiceChoice === 'off'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-white text-[#1A1A1A] hover:bg-[#FBF7F0]'
              }`}
            >
              {t('off', lang)}
            </button>
          </div>
        </Card>
      </div>

      {/* SCREEN 1: PRE-CHECK UPFRONT */}
      {screen === 'precheck' && (
        <Card className="w-full max-w-[420px] my-auto space-y-5 text-center p-6">
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-3">
            <Chip variant="saffron">{t('precheck_title', lang)}</Chip>
            <span className="text-sm font-semibold text-[#1A1A1A]/70">
              {t('precheck_n_of_total', lang, { n: precheckIndex + 1, total: precheckScenarios.length })}
            </span>
          </div>

          <div className="py-2">
            <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
              {precheckScenarios[precheckIndex]?.precheck.q[lang] ||
                precheckScenarios[precheckIndex]?.precheck.q.en}
            </p>
          </div>

          {/* Two equal NEUTRAL buttons Yes / No */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handlePrecheckAnswer('yes')}
            >
              {t('yes', lang)}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => handlePrecheckAnswer('no')}
            >
              {t('no', lang)}
            </Button>
          </div>

          {/* Small text link "skip questions" */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSkipPrecheck}
              className="text-sm text-[#1A1A1A]/70 hover:text-[#1A1A1A] underline cursor-pointer min-h-[48px] inline-flex items-center justify-center"
            >
              {t('skip_questions', lang)}
            </button>
          </div>
        </Card>
      )}

      {/* SCREEN 2: DRILL INTRO CARD */}
      {screen === 'intro' && (
        <Card className="w-full max-w-[420px] my-auto space-y-5 p-6">
          <div className="flex items-center justify-between">
            <Chip variant="saffron">
              {onlyMode
                ? t('targeted_practice', lang)
                : t('drill_n_of_3', lang, {
                    n: scenarioIndex + 1,
                    total: SCENARIOS.length,
                  })}
            </Chip>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">
            {scenario.title[lang] || scenario.title.en}
          </h1>

          <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] text-base sm:text-lg text-[#1A1A1A] leading-relaxed">
            {scenario.setup[lang] || scenario.setup.en}
          </div>

          <div className="text-sm text-[#1A1A1A]/90 space-y-1 bg-[#FBF7F0] p-4 rounded-[14px] border border-[#1A1A1A]/10">
            <p className="font-bold text-[#1A1A1A] leading-relaxed">
              {t('drill_safety_notice', lang)}
            </p>
          </div>

          {/* ONE Start button */}
          <Button
            type="button"
            variant="primary"
            onClick={handleStartDrill}
            className="w-full text-lg"
          >
            <span>
              {onlyMode
                ? t('start_drill', lang)
                : t('start_drill_n', lang, { n: scenarioIndex + 1 })}
            </span>
            <span className="ml-2">→</span>
          </Button>
        </Card>
      )}

      {/* SCREEN 3: ACTIVE DRILL RUNNER */}
      {screen === 'runner' && (
        <DrillRunner
          key={`${scenario.id}-${runKey}`}
          scenario={scenario}
          scenarioIndex={scenarioIndex}
          totalScenarios={SCENARIOS.length}
          isOnlyMode={onlyMode}
          lang={lang}
          voiceChoice={voiceChoice}
          muted={muted}
          knewRule={currentKnew}
          attempt={currentAttempt}
          source={source}
          onFinish={handleDrillFinish}
        />
      )}

      {/* SCREEN 4: DEBRIEF (replaces outcome screen after each drill) */}
      {screen === 'debrief' && currentResult && currentState && (
        <Debrief
          scenario={scenario}
          state={currentState}
          result={currentResult}
          lang={lang}
          knewAnswer={knewAnswers[scenario.id]}
          isLastDrill={scenarioIndex === SCENARIOS.length - 1}
          isOnlyMode={onlyMode}
          scenarioIndex={scenarioIndex}
          totalScenarios={SCENARIOS.length}
          onNextDrill={handleNextDrill}
          onRestart={handleRestart}
          onShowReport={() => setScreen('report')}
        />
      )}

      {/* SCREEN 5: FINAL REPORT (after drill 3, not in ?only mode) */}
      {screen === 'report' && (
        <Report
          scenarios={SCENARIOS}
          knewAnswers={knewAnswers}
          results={results}
          lang={lang}
          onStartOver={handleStartOver}
        />
      )}
    </main>
  );
}

interface DrillRunnerProps {
  scenario: Scenario;
  scenarioIndex: number;
  totalScenarios: number;
  isOnlyMode: boolean;
  lang: Lang;
  voiceChoice: VoiceChoice;
  muted: boolean;
  knewRule: boolean | null;
  attempt: number;
  source: string;
  onFinish: (result: RunResult, state: RunState) => void;
}

function DrillRunner({
  scenario,
  scenarioIndex,
  totalScenarios,
  isOnlyMode,
  lang,
  voiceChoice,
  muted,
  knewRule,
  attempt,
  source,
  onFinish,
}: DrillRunnerProps) {
  const { node, state, act, result } = useDrill(scenario);
  const telemetrySentRef = useRef<boolean>(false);

  // Preload scenario clips on mount / change
  useEffect(() => {
    preloadScenarioClips(scenario.id, voiceChoice);
  }, [scenario.id, voiceChoice]);

  // When run completes, forward to parent onFinish
  useEffect(() => {
    if (result && state.done) {
      onFinish(result, state);
    }
  }, [result, state, onFinish]);

  // Safe action wrapper: stops speech & ring BEFORE dispatching,
  // and dispatches telemetry beacon at the exact moment a step finishes the run (StrictMode-safe)
  const safeAct = useCallback(
    (action: Action) => {
      stopSpeaking();
      stopRing();

      if (!state.done && !telemetrySentRef.current) {
        try {
          const now = Date.now();
          const nextSt = step(scenario, state, action, now);
          if (nextSt.done) {
            telemetrySentRef.current = true;
            const res = computeResult(scenario, nextSt, now);
            sendRun({
              session_id: getSessionId(),
              scenario_id: scenario.id,
              lang,
              outcome: res.outcome,
              loss_inr: res.lossInr,
              knew_rule: knewRule,
              risky_actions: res.riskyActions,
              flags_walked_past: res.flagsWalkedPast.length,
              flags_total: res.flagsTotal,
              duration_ms: Math.max(2000, res.durationMs),
              hesitation_ms: res.hesitationMs,
              attempt,
              source,
            });
            nextAttempt(scenario.id);
          }
        } catch {
          /* never block the drill */
        }
      }

      act(action);
    },
    [act, state, scenario, lang, knewRule, attempt, source]
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
    unlockAudio();
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
  // When a clip exists for message i-1 and sound is on, delay before message i = voiceDurations[key] * 1000 + 300 ms.
  // Otherwise keep the current rule: clamp(prevText.length * 60, 1500, 8000) when speak: true and sound is on, else delayMs ?? 900.
  const delays = useMemo(() => {
    if (!shouldReveal) return [];
    const msgs = node.messages ?? [];
    return msgs.map((m, i) => {
      if (i > 0 && msgs[i - 1]?.speak && !muted && voiceChoice !== 'off') {
        const prevKey = `${voiceChoice}/${scenario.id}__${node.id}__${i - 1}`;
        const durationSec = (voiceDurations as Record<string, number>)[prevKey];
        if (typeof durationSec === 'number') {
          return durationSec * 1000 + 300;
        }
        const prevText =
          msgs[i - 1].text[lang] || msgs[i - 1].text.en || '';
        return Math.min(Math.max(prevText.length * 60, 1500), 8000);
      }
      return m.delayMs ?? 900;
    });
  }, [node.messages, node.id, scenario.id, shouldReveal, muted, voiceChoice, lang]);

  const { shown, typing, done } = useReveal(visitKey, delays);

  // Play line (pre-recorded clip or TTS fallback) when messages with speak: true are revealed
  const lastSpokenRef = useRef<string | null>(null);
  useEffect(() => {
    if (shown > 0 && node.messages && node.messages[shown - 1]?.speak) {
      const msgIndex = shown - 1;
      const msg = node.messages[msgIndex];
      const voiceText =
        voiceChoice === 'hi'
          ? (msg.text.hi || msg.text.en)
          : (msg.text.en || msg.text.hi || '');
      const uiText = msg.text[lang] || msg.text.en;
      const key = `${node.id}-${shown}-${voiceChoice}-${lang}`;
      if (lastSpokenRef.current !== key) {
        lastSpokenRef.current = key;
        if (!muted && voiceChoice !== 'off') {
          playLine({
            scenarioId: scenario.id,
            nodeId: node.id,
            index: msgIndex,
            voiceLang: voiceChoice,
            text: voiceText,
            uiLang: lang,
            uiText,
          });
        }
      }
    }
  }, [shown, node.id, node.messages, muted, voiceChoice, lang, scenario.id]);

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

  // Drill in progress inside PhoneFrame
  return (
    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 md:gap-8 w-full max-w-5xl">
      <div className="w-full min-[480px]:max-w-[380px] flex flex-col items-center">
        <PhoneFrame from={node.from} surface={node.surface} lang={lang}>
          {/* Top SMS Notification Banner for any revealed message with via: 'sms' */}
          {smsBannerMessages.length > 0 && (
            <div className="absolute top-2 left-2 right-2 z-40 space-y-1.5 pointer-events-auto">
              {smsBannerMessages.map((sms, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-[#111111] shadow-hard-sm rounded-md p-2.5 text-left transition-all"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#FF5A1F] border-b border-[#111111]/10 pb-1 mb-1">
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{t('sms_banner_title', lang)}</span>
                    </span>
                    <span className="text-[10px] text-[#111111]/60">{t('now', lang)}</span>
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
            <div className="flex-1 flex flex-col justify-between p-4 min-[480px]:p-6 bg-[#0E0E10] text-[#F6F3EC] text-center">
              <div className="pt-4 min-[480px]:pt-8 space-y-2">
                <span className="text-xs font-mono text-[#FF5A1F] uppercase tracking-widest block animate-pulse">
                  {node.surface === 'videocall'
                    ? t('incoming_videocall', lang)
                    : t('incoming_call', lang)}
                </span>
                <h2 className="text-xl min-[480px]:text-2xl font-bold tracking-tight text-white">
                  {node.from || t('unknown_caller', lang)}
                </h2>
                <p className="text-xs font-mono text-white/60">
                  {node.surface === 'videocall'
                    ? t('camera_verification', lang)
                    : t('official_inquiry', lang)}
                </p>
              </div>

              {/* Pulsing Avatar */}
              <div className="flex flex-col items-center justify-center my-auto py-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 min-[480px]:w-24 min-[480px]:h-24 rounded-full bg-slate-800 border-2 border-white/40 flex items-center justify-center text-3xl min-[480px]:text-4xl shadow-xl z-10">
                    {node.surface === 'videocall' ? '👮‍♂️' : '📞'}
                  </div>
                  <div className="absolute w-28 h-28 min-[480px]:w-32 min-[480px]:h-32 rounded-full border border-green-500/40 animate-ping opacity-40 pointer-events-none" />
                  <div className="absolute w-36 h-36 min-[480px]:w-40 min-[480px]:h-40 rounded-full border border-green-500/20 animate-pulse pointer-events-none" />
                </div>
              </div>

              {/* Accept Call Button (Not a scored action) */}
              <div className="pb-4 min-[480px]:pb-6">
                <button
                  type="button"
                  onClick={handleAcceptCall}
                  className="w-full min-h-[48px] min-[480px]:min-h-[52px] py-3 bg-[#12B76A] text-white font-bold text-base min-[480px]:text-lg rounded-full shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>📞</span>
                  <span>{t('accept', lang)}</span>
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
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
              {/* MessageList: scrollable area */}
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <MessageList
                  messages={allMessages}
                  typing={typing}
                  lang={lang}
                  skin={node.surface}
                  from={node.from}
                  callSeconds={callSeconds}
                />
              </div>

              {/* Bottom Pinned Controls: Pressure Timer, ChoiceBar or PinPad */}
              <div className="shrink-0 mt-auto sticky bottom-0 z-20 bg-white">
                {/* Pressure Timer Countdown: starts only when done is true */}
                {node.timerSec && done && (
                  <div className="w-full">
                    <PressureTimer
                      seconds={node.timerSec}
                      lang={lang}
                      onTimeout={() => safeAct({ type: 'timeout' })}
                    />
                  </div>
                )}

                {node.input ? (
                  done && (
                    <PinPad
                      kind={node.input.kind}
                      prompt={node.input.prompt[lang] || node.input.prompt.en}
                      detail={node.input.detail[lang] || node.input.detail.en}
                      practicePin={PRACTICE_PIN}
                      expectedCode={expectedCode}
                      lang={lang}
                      onSubmit={(len, hesitationMs) =>
                        safeAct({ type: 'input_submit', len, hesitationMs })
                      }
                      onCancel={() => safeAct({ type: 'input_cancel' })}
                    />
                  )
                ) : (
                  done && node.choices && (
                    <ChoiceBar
                      choices={node.choices}
                      lang={lang}
                      onChoose={choiceId => safeAct({ type: 'choose', choiceId })}
                    />
                  )
                )}
              </div>
            </div>
          )}
        </PhoneFrame>

        {/* When UI is English and voice is Hindi, show small note under the phone */}
        {lang === 'en' && voiceChoice === 'hi' && (
          <p className="mt-2 text-sm text-[#1A1A1A]/75 text-center">
            {t('caller_speaks_hindi_note', lang)}
          </p>
        )}

        {/* On screens < 1024px: "Show engine log" toggle under the phone */}
        <div className="lg:hidden w-full mt-2">
          <GlassBox events={state.events} result={result} />
        </div>
      </div>

      {/* On screens >= 1024px: show panel to the right of the phone */}
      <div className="hidden lg:block w-96 shrink-0">
        <GlassBoxPanel events={state.events} result={result} />
      </div>
    </div>
  );
}
