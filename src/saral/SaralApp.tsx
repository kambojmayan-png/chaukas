'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { SCENARIOS, PRACTICE_PIN } from '@/scenarios';
import {
  start as engineStart,
  step as engineStep,
  result as engineResult,
  knowledgeBehaviourGap,
  type Lang,
  type Scenario,
  type RunState,
  type RunResult,
  type Action,
} from '@/engine/engine';
import { t, getFlagLabel } from '@/lib/i18n';
import {
  playClip,
  stopSpeaking,
  playRingtone,
  stopRing,
  unlockAudio,
  preloadScenarioClips,
} from '@/lib/speak';
import { sendRun } from '@/lib/telemetry';
import { SaralTopBar } from './SaralTopBar';
import { SaralGuideBubble } from './SaralGuideBubble';
import { SaralKeypad } from './SaralKeypad';
import { SaralCallScreen } from './SaralCallScreen';
import { SaralConversation, type DisplayMessage } from './SaralConversation';
import { SaralLessonCards, extractTrickCards } from './SaralLessonCards';

type SaralScreen =
  | 'home' // 0
  | 'soundcheck' // 1
  | 'welcome' // 2
  | 'howto' // 3
  | 'practice_pin' // 4
  | 'precheck' // 5
  | 'setup' // 6
  | 'conversation' // 7
  | 'result' // 8
  | 'lesson' // 9
  | 'another' // 10
  | 'final'; // 11

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'hi';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang === 'en' || urlLang === 'hi') {
      sessionStorage.setItem('chaukas_saral_lang', urlLang);
      return urlLang;
    }
    const saved = sessionStorage.getItem('chaukas_saral_lang');
    if (saved === 'en' || saved === 'hi') return saved;
  } catch {
    /* ignore */
  }
  return 'hi';
}

function getDonePractices(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem('chaukas_saral_done');
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

function markPracticeDone(sid: string) {
  if (typeof window === 'undefined') return;
  try {
    const done = getDonePractices();
    if (!done.includes(sid)) {
      done.push(sid);
      localStorage.setItem('chaukas_saral_done', JSON.stringify(done));
    }
  } catch {
    /* ignore */
  }
}

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem('chaukas_saral_session_id');
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem('chaukas_saral_session_id', id);
    }
    return id;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2);
  }
}

export function SaralApp() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [screen, setScreen] = useState<SaralScreen>('home');
  const [practiceIdx, setPracticeIdx] = useState<number>(0);
  const [donePractices, setDonePractices] = useState<string[]>([]);
  const [isFamily, setIsFamily] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('');

  // Audio / Narration state
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [currentCaption, setCurrentCaption] = useState<string>('');
  const playSeqIdRef = useRef<number>(0);

  // Sound check help card visibility
  const [showSoundHelp, setShowSoundHelp] = useState<boolean>(false);

  // Leave confirm modal
  const [showLeaveConfirm, setShowLeaveConfirm] = useState<boolean>(false);

  // Pre-check & Run state for practices
  const [knewAnswers, setKnewAnswers] = useState<Record<string, { knew: boolean | null; answeredAt: number }>>({});
  const [runResults, setRunResults] = useState<Record<string, RunResult>>({});
  const [hasEverBeenScammed, setHasEverBeenScammed] = useState<boolean>(false);
  const [userStoppedEarly, setUserStoppedEarly] = useState<boolean>(false);

  // Active conversation state (Screen 7)
  const [drillState, setDrillState] = useState<RunState | null>(null);
  const [callPickedUp, setCallPickedUp] = useState<boolean>(false);
  const [revealedMsgIndex, setRevealedMsgIndex] = useState<number>(0);
  const [pastMessages, setPastMessages] = useState<DisplayMessage[]>([]);
  const [showingChoices, setShowingChoices] = useState<boolean>(false);

  // Lesson cards state (Screen 9)
  const [activeTrickIndex, setActiveTrickIndex] = useState<number | null>(null);

  // Initialize URL parameters and document lang
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
      const params = new URLSearchParams(window.location.search);
      if (params.get('src') === 'family') {
        setIsFamily(true);
      }
      setDonePractices(getDonePractices());
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const toggleLang = () => {
    stopSpeaking();
    const nextLang = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
    try {
      sessionStorage.setItem('chaukas_saral_lang', nextLang);
    } catch {
      /* ignore */
    }
  };

  const toggleSound = () => {
    const next = !soundOn;
    if (!next) {
      stopSpeaking();
      stopRing();
    }
    setSoundOn(next);
  };

  // Safe play helper: stops previous, tracks sequence ID, sets caption and speaking state
  const playSequence = useCallback(
    async (items: { key: string; text: string }[]) => {
      stopSpeaking();
      playSeqIdRef.current += 1;
      const seqId = playSeqIdRef.current;

      setSpeaking(true);

      for (let i = 0; i < items.length; i++) {
        if (playSeqIdRef.current !== seqId) break;
        setCurrentCaption(items[i].text);
        await playClip(items[i].key, items[i].text, lang, soundOn);
      }

      if (playSeqIdRef.current === seqId) {
        setSpeaking(false);
      }
    },
    [lang, soundOn]
  );

  // Current scenario
  const currentScenario: Scenario | undefined = SCENARIOS[practiceIdx];
  const sid = currentScenario?.id || 'olx-qr';

  // Preload clips on scenario change
  useEffect(() => {
    if (currentScenario && soundOn) {
      preloadScenarioClips(currentScenario.id, 'hi');
    }
  }, [currentScenario, soundOn]);

  // Clean up speech and ring on unmount or screen transition
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRing();
    };
  }, [screen, practiceIdx]);

  // SCREEN 1: Sound Check narration
  useEffect(() => {
    if (screen === 'soundcheck') {
      playSequence([
        { key: 'narr__soundcheck', text: t('soundcheck_text', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 2: What this is narration
  useEffect(() => {
    if (screen === 'welcome') {
      playSequence([
        { key: 'narr__welcome', text: t('welcome_text', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 3: How it works narration
  useEffect(() => {
    if (screen === 'howto') {
      playSequence([
        { key: 'narr__howto', text: t('howto_text', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 4: Practice PIN narration
  useEffect(() => {
    if (screen === 'practice_pin') {
      playSequence([
        { key: 'narr__practice_pin', text: `${t('practice_pin_title', lang)}: ${PRACTICE_PIN}` },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 5: Pre-check question narration
  useEffect(() => {
    if (screen === 'precheck' && currentScenario) {
      const qText = currentScenario.precheck.q[lang] || currentScenario.precheck.q.en;
      playSequence([
        { key: 'narr__one_question', text: qText },
        { key: `${sid}__precheck`, text: qText },
      ]);
    }
  }, [screen, currentScenario, sid, lang, playSequence]);

  // SCREEN 6: Situation (setup) narration
  useEffect(() => {
    if (screen === 'setup' && currentScenario) {
      const setupText = currentScenario.setup[lang] || currentScenario.setup.en;
      playSequence([
        { key: `${sid}__setup`, text: setupText },
      ]);
    }
  }, [screen, currentScenario, sid, lang, playSequence]);

  // SCREEN 8: Result narration
  useEffect(() => {
    if (screen === 'result' && currentScenario) {
      const res = runResults[sid];
      if (res) {
        let key = `${sid}__end_escaped`;
        let text = t('result_escaped', lang);
        if (res.outcome === 'scammed') {
          key = `${sid}__end_scammed`;
          text = `${t('result_scammed', lang)}. ${t('lost_amount', lang, { x: res.lossInr })}`;
        } else if (res.outcome === 'escaped_late') {
          key = `${sid}__end_late`;
          text = t('result_late', lang);
        }
        playSequence([{ key, text }]);
      }
    }
  }, [screen, currentScenario, sid, runResults, lang, playSequence]);

  // SCREEN 9: Lesson narration
  useEffect(() => {
    if (screen === 'lesson' && currentScenario && drillState) {
      const res = runResults[sid];
      const isScammed = res?.outcome === 'scammed';
      const lessonTitleKey = isScammed ? 'narr__lesson_fell' : 'narr__lesson_safe';
      const lessonTitleText = isScammed ? t('lesson_fell', lang) : t('lesson_safe', lang);

      const cards = extractTrickCards(currentScenario, drillState, lang);
      const items: { key: string; text: string }[] = [];

      items.push({ key: lessonTitleKey, text: lessonTitleText });

      if (cards.length >= 2) {
        cards.forEach(c => {
          items.push({ key: c.audioKey, text: c.explanation });
        });
      } else {
        items.push({
          key: `${sid}__flags`,
          text: t(`flags_summary_${sid.replace(/-/g, '_')}`, lang),
        });
      }

      // Rule card
      items.push({
        key: `${sid}__rule`,
        text: `${t('remember', lang)}: ${currentScenario.rule[lang] || currentScenario.rule.en}`,
      });

      // Helpline card (first time scammed in this visit)
      if (isScammed && !hasEverBeenScammed) {
        items.push({
          key: 'narr__if_real',
          text: t('helpline_card', lang),
        });
      }

      playSequence(items);
    }
  }, [screen, currentScenario, sid, drillState, runResults, hasEverBeenScammed, lang, playSequence]);

  // SCREEN 10: Another one? narration
  useEffect(() => {
    if (screen === 'another') {
      playSequence([
        { key: 'narr__another_or_stop', text: t('another_yes', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 11: Final scorecard narration
  useEffect(() => {
    if (screen === 'final') {
      const totalDone = Object.keys(runResults).length;
      const notScammed = Object.values(runResults).filter(r => r.outcome !== 'scammed').length;
      const knewArray = SCENARIOS.slice(0, totalDone).map(s => knewAnswers[s.id]?.knew === true);
      const resultsArray = SCENARIOS.slice(0, totalDone).map(s => runResults[s.id]).filter(Boolean);
      const gap = knowledgeBehaviourGap(knewArray, resultsArray);

      const items: { key: string; text: string }[] = [];

      if (gap.knewButFell > 0) {
        items.push({
          key: 'narr__knew_but_fell',
          text: t('you_knew_the_rule', lang),
        });
      }

      if (userStoppedEarly) {
        items.push({ key: 'narr__bye', text: t('final_title', lang, { x: notScammed, y: totalDone }) });
      } else if (notScammed === 3 && totalDone === 3) {
        items.push({ key: 'narr__final_all_safe', text: t('final_title', lang, { x: notScammed, y: totalDone }) });
      } else {
        items.push({ key: 'narr__final_some', text: t('final_title', lang, { x: notScammed, y: totalDone }) });
      }

      playSequence(items);
    }
  }, [screen, runResults, knewAnswers, userStoppedEarly, lang, playSequence]);

  // SCREEN 7: Active Conversation runner logic
  const startConversation = () => {
    if (!currentScenario) return;
    const initialSt = engineStart(currentScenario, Date.now());
    setDrillState(initialSt);
    setPastMessages([]);
    setRevealedMsgIndex(0);
    setShowingChoices(false);

    const firstNode = currentScenario.nodes[initialSt.nodeId];
    const isCall = firstNode?.surface === 'call' || firstNode?.surface === 'videocall';
    setCallPickedUp(!isCall);

    if (isCall) {
      if (soundOn) {
        playClip('narr__call_incoming', t('incoming_call', lang), lang, soundOn);
        playRingtone();
      }
    }
    setScreen('conversation');
  };

  // When call is picked up or non-call node starts: sequence through messages
  useEffect(() => {
    if (screen !== 'conversation' || !drillState || !currentScenario) return;

    const currNode = currentScenario.nodes[drillState.nodeId];
    if (!currNode) return;

    const isCall = currNode.surface === 'call' || currNode.surface === 'videocall';
    if (isCall && !callPickedUp) return;

    const msgs = currNode.messages ?? [];

    let active = true;

    async function runMessages() {
      for (let i = revealedMsgIndex; i < msgs.length; i++) {
        if (!active) break;
        setRevealedMsgIndex(i);
        setShowingChoices(false);

        const msg = msgs[i];
        const msgText = msg.text[lang] || msg.text.en;
        const clipKey = `${sid}__${currNode.id}__${i}`;

        await playClip(clipKey, msgText, lang, soundOn);

        if (!active) break;
        // Add to past messages before moving forward
        if (i < msgs.length - 1) {
          const displayLabel = getMessageLabel(msg, currNode.surface, currNode.from, lang);
          setPastMessages(prev => [
            ...prev,
            {
              from: currNode.from || 'Scammer',
              text: msgText,
              label: displayLabel,
              surface: currNode.surface,
              via: msg.via,
              isOnCall: isCall,
            },
          ]);
        }
      }

      if (active) {
        // All messages revealed
        setShowingChoices(true);

        // If choices exist, read them aloud
        if (currNode.choices && currNode.choices.length > 0) {
          const choicesClip = `${sid}__${currNode.id}__choices`;
          const choicesText = currNode.choices.map((c, idx) => `${idx + 1}. ${c.label[lang] || c.label.en}`).join('. ');
          await playClip(choicesClip, choicesText, lang, soundOn);

          // If node has timerSec: after audio ends, 30s with no tap -> dispatch timeout
          if (currNode.timerSec) {
            const timer = setTimeout(() => {
              if (active) {
                dispatchAction({ type: 'timeout' });
              }
            }, 30000);
            return () => clearTimeout(timer);
          }
        } else if (currNode.input) {
          // Play keypad guide clip once
          const keypadClip = currNode.input.kind === 'pin' ? 'narr__keypad_pin' : 'narr__keypad_otp';
          playClip(keypadClip, currNode.input.prompt[lang] || currNode.input.prompt.en, lang, soundOn);
        }
      }
    }

    runMessages();

    return () => {
      active = false;
    };
  }, [screen, drillState?.nodeId, callPickedUp, currentScenario, sid, lang, soundOn]);

  const getMessageLabel = (msg: any, surface: any, from: string | undefined, currentLang: Lang): string => {
    if (surface === 'call' || surface === 'videocall') {
      return t('label_call', currentLang);
    }
    if (msg.via === 'sms') {
      return t('label_bank_sms', currentLang);
    }
    if (surface === 'sms') {
      return t('label_sms', currentLang);
    }
    if (surface === 'system') {
      return t('label_system', currentLang);
    }
    return from || 'Chat';
  };

  const dispatchAction = (action: Action) => {
    if (!currentScenario || !drillState) return;
    stopSpeaking();
    stopRing();

    const now = Date.now();
    const nextSt = engineStep(currentScenario, drillState, action, now);
    setDrillState(nextSt);

    if (nextSt.done) {
      // Finished drill
      const res = engineResult(currentScenario, nextSt, now);
      setRunResults(prev => ({ ...prev, [sid]: res }));
      if (res.outcome === 'scammed') {
        setHasEverBeenScammed(true);
      }
      markPracticeDone(sid);

      // Telemetry dispatch
      try {
        const knewVal = knewAnswers[sid]?.knew ?? null;
        sendRun({
          session_id: getSessionId(),
          scenario_id: sid,
          lang,
          outcome: res.outcome,
          loss_inr: res.lossInr,
          knew_rule: knewVal,
          risky_actions: res.riskyActions,
          flags_walked_past: res.flagsWalkedPast.length,
          flags_total: res.flagsTotal,
          duration_ms: Math.max(2000, res.durationMs),
          hesitation_ms: res.hesitationMs,
          attempt: 1,
          source: isFamily ? 'saral_family' : 'saral',
        });
      } catch {
        /* telemetry is best-effort */
      }

      setScreen('result');
      return;
    }

    // Move to next node
    const nextNode = currentScenario.nodes[nextSt.nodeId];
    const isCall = nextNode?.surface === 'call' || nextNode?.surface === 'videocall';
    const prevNode = currentScenario.nodes[drillState.nodeId];
    const prevWasCall = prevNode?.surface === 'call' || prevNode?.surface === 'videocall';

    // Incoming call check
    if (isCall && !prevWasCall) {
      setCallPickedUp(false);
      if (soundOn) {
        playClip('narr__call_incoming', t('incoming_call', lang), lang, soundOn);
        playRingtone();
      }
    } else {
      setCallPickedUp(true);
    }

    // Add previous current message to past messages
    const currMsg = prevNode?.messages?.[revealedMsgIndex];
    if (currMsg) {
      const displayLabel = getMessageLabel(currMsg, prevNode.surface, prevNode.from, lang);
      setPastMessages(prev => [
        ...prev,
        {
          from: prevNode.from || 'Scammer',
          text: currMsg.text[lang] || currMsg.text.en,
          label: displayLabel,
          surface: prevNode.surface,
          via: currMsg.via,
          isOnCall: prevWasCall,
        },
      ]);
    }

    setRevealedMsgIndex(0);
    setShowingChoices(false);
  };

  // Expected code for keypad in Screen 7
  const currentExpectedCode = (): string => {
    if (!currentScenario || !drillState) return '';
    const node = currentScenario.nodes[drillState.nodeId];
    if (node?.input?.kind === 'pin') return PRACTICE_PIN;
    if (node?.input?.kind === 'otp') {
      const match = node.messages?.find(m => m.via === 'sms');
      if (match) {
        const found = match.text.en.match(/\b\d{6}\b/) || match.text.hi?.match(/\b\d{6}\b/);
        if (found) return found[0];
      }
      for (let i = drillState.path.length - 1; i >= 0; i--) {
        const past = currentScenario.nodes[drillState.path[i]];
        const sms = past?.messages?.find(m => m.via === 'sms');
        if (sms) {
          const found = sms.text.en.match(/\b\d{6}\b/) || sms.text.hi?.match(/\b\d{6}\b/);
          if (found) return found[0];
        }
      }
    }
    return '';
  };

  // Navigation handlers
  const handleStartHome = () => {
    unlockAudio();
    stopSpeaking();
    // Find first unfinished practice or 0
    const done = getDonePractices();
    let startIdx = 0;
    const nextUnfinished = SCENARIOS.findIndex(s => !done.includes(s.id));
    if (nextUnfinished !== -1) {
      startIdx = nextUnfinished;
    }
    setPracticeIdx(startIdx);
    setScreen('soundcheck');
  };

  const handlePrecheckAnswer = (answer: 'yes' | 'no') => {
    if (!currentScenario) return;
    stopSpeaking();
    const isCorrect = answer === currentScenario.precheck.correct;
    const updated = {
      ...knewAnswers,
      [sid]: { knew: isCorrect, answeredAt: Date.now() },
    };
    setKnewAnswers(updated);
    try {
      sessionStorage.setItem('chaukas_precheck_answers', JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    setScreen('setup');
  };

  const handleSkipPrecheck = () => {
    if (!currentScenario) return;
    stopSpeaking();
    const updated = {
      ...knewAnswers,
      [sid]: { knew: null, answeredAt: Date.now() },
    };
    setKnewAnswers(updated);
    try {
      sessionStorage.setItem('chaukas_precheck_answers', JSON.stringify(updated));
    } catch {
      /* ignore */
    }
    setScreen('setup');
  };

  const handleLeaveConfirm = () => {
    stopSpeaking();
    stopRing();
    setShowLeaveConfirm(false);
    setScreen('home');
  };

  const handleNextFromLesson = () => {
    stopSpeaking();
    if (practiceIdx < SCENARIOS.length - 1) {
      setScreen('another');
    } else {
      setScreen('final');
    }
  };

  const handleAnotherYes = async () => {
    stopSpeaking();
    await playClip('narr__next_drill', t('another_yes', lang), lang, soundOn);
    setPracticeIdx(i => i + 1);
    setScreen('precheck');
  };

  const handleAnotherNo = () => {
    stopSpeaking();
    setUserStoppedEarly(true);
    setScreen('final');
  };

  const currNode = currentScenario && drillState ? currentScenario.nodes[drillState.nodeId] : null;
  const isCallNode = currNode?.surface === 'call' || currNode?.surface === 'videocall';
  const currMsg = currNode?.messages?.[revealedMsgIndex];
  const currMsgText = currMsg ? (currMsg.text[lang] || currMsg.text.en) : '';

  return (
    <main className="min-h-screen bg-[#FBF7F0] text-[#1A1A1A] flex flex-col justify-between p-3 sm:p-5 max-w-xl mx-auto select-none antialiased">
      {/* Top Bar on all screens except Home */}
      {screen !== 'home' && (
        <SaralTopBar
          lang={lang}
          onToggleLang={toggleLang}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          practiceNumber={
            ['precheck', 'setup', 'conversation', 'result', 'lesson'].includes(screen)
              ? practiceIdx + 1
              : null
          }
          onLeavePractice={() => setShowLeaveConfirm(true)}
        />
      )}

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-6 max-w-sm w-full space-y-4 text-center shadow-xl">
            <h3 className="text-xl font-bold text-[#1A1A1A]">
              {t('leave_confirm', lang)}
            </h3>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="min-h-[56px] py-2 px-4 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-lg font-bold hover:bg-neutral-100 cursor-pointer"
              >
                {t('no', lang)}
              </button>
              <button
                type="button"
                onClick={handleLeaveConfirm}
                className="min-h-[56px] py-2 px-4 bg-[#C92A2A] text-white border-2 border-[#1A1A1A] rounded-[14px] text-lg font-bold hover:opacity-95 cursor-pointer"
              >
                {t('yes', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 0: HOME */}
      {screen === 'home' && (
        <div className="flex-1 flex flex-col justify-between items-center py-8 sm:py-12 text-center space-y-8 my-auto">
          {/* Top Brand & Language Pill */}
          <div className="w-full flex items-center justify-between border-b-2 border-[#1A1A1A]/15 pb-3">
            <span lang="hi" className="text-3xl sm:text-4xl font-black text-[#1A1A1A]">
              चौकस
            </span>
            <button
              type="button"
              onClick={toggleLang}
              className="min-h-[44px] px-4 py-1 rounded-full border-2 border-[#1A1A1A] bg-white text-sm font-bold text-[#1A1A1A] hover:bg-neutral-100 active:scale-95 cursor-pointer leading-normal"
            >
              {lang === 'hi' ? 'English' : 'हिंदी'}
            </button>
          </div>

          {/* Main Title & Tagline */}
          <div className="my-auto space-y-5 max-w-md">
            <h1
              lang="hi"
              className="text-6xl sm:text-7xl font-black tracking-tight text-[#1A1A1A]"
            >
              चौकस
            </h1>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-[1.6]">
              {t('home_tagline', lang)}
            </p>
          </div>

          {/* Huge Saffron Button & Hint */}
          <div className="w-full max-w-md space-y-4 pt-2">
            <button
              type="button"
              onClick={handleStartHome}
              className="w-full min-h-[68px] py-4 px-6 bg-[#E8590C] text-white text-2xl sm:text-3xl font-extrabold rounded-[16px] border-2 border-[#1A1A1A] shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t('home_start', lang)}</span>
            </button>
            <p className="text-base sm:text-lg font-bold text-[#1A1A1A]/80 leading-snug">
              {t('home_hint', lang)}
            </p>

            {/* Returning visitor 3 rows */}
            {donePractices.length > 0 && (
              <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-3 text-left space-y-1.5 shadow-2xs mt-4">
                {SCENARIOS.map((s, idx) => {
                  const isDone = donePractices.includes(s.id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between text-sm sm:text-base font-bold py-1 border-b border-[#1A1A1A]/10 last:border-none"
                    >
                      <span className={isDone ? 'text-[#0F6B4F]' : 'text-[#1A1A1A]/70'}>
                        {t('practice_n', lang, { n: idx + 1 })}: {s.title[lang] || s.title.en}
                      </span>
                      <span>{isDone ? '✓' : '—'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tiny Links at the Very Bottom */}
          <div className="w-full pt-6 border-t-2 border-[#1A1A1A]/15 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-bold text-[#1A1A1A]/70">
            <Link href="/judge" className="hover:underline">
              {t('for_judges', lang)}
            </Link>
            <Link href="/drill" className="hover:underline">
              {t('detailed_view', lang)}
            </Link>
            <Link href="/about" className="hover:underline">
              {t('about_project', lang)}
            </Link>
          </div>
        </div>
      )}

      {/* SCREEN 1: SOUND CHECK */}
      {screen === 'soundcheck' && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <SaralGuideBubble text={t('soundcheck_text', lang)} />

          {!showSoundHelp ? (
            <div className="w-full space-y-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setScreen('welcome');
                }}
                className="w-full min-h-[64px] py-3.5 px-4 bg-[#2B8A3E] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                {t('sound_yes', lang)}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setShowSoundHelp(true);
                }}
                className="w-full min-h-[64px] py-3.5 px-4 bg-white text-[#1A1A1A] text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
              >
                {t('sound_no', lang)}
              </button>
            </div>
          ) : (
            <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-5 space-y-4 text-center shadow-sm">
              <p className="text-xl font-bold text-[#1A1A1A] leading-relaxed">
                {t('sound_help', lang)}
              </p>
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playSequence([
                      { key: 'narr__soundcheck', text: t('soundcheck_text', lang) },
                    ]);
                  }}
                  className="w-full min-h-[64px] py-3.5 px-4 bg-white text-[#1A1A1A] text-xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                >
                  {t('replay', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setSoundOn(false);
                    setScreen('welcome');
                  }}
                  className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
                >
                  {t('continue_without_sound', lang)}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCREEN 2: WHAT THIS IS */}
      {screen === 'welcome' && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <SaralGuideBubble text={t('welcome_text', lang)} />

          <div className="w-full space-y-3 pt-4">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setScreen('howto');
              }}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('next', lang)}
            </button>
            <button
              type="button"
              onClick={() => {
                playSequence([{ key: 'narr__welcome', text: t('welcome_text', lang) }]);
              }}
              className="w-full min-h-[56px] py-2 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {t('replay', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: HOW IT WORKS */}
      {screen === 'howto' && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <SaralGuideBubble text={t('howto_text', lang)} />

          {/* Tiny static illustration of two numbered buttons & hear again */}
          <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 space-y-2.5 shadow-2xs">
            <div className="w-full p-2.5 bg-white border-2 border-[#1A1A1A] rounded-[12px] flex items-center gap-3 text-sm font-bold">
              <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              <span>{lang === 'hi' ? 'पहला विकल्प' : 'First option'}</span>
            </div>
            <div className="w-full p-2.5 bg-white border-2 border-[#1A1A1A] rounded-[12px] flex items-center gap-3 text-sm font-bold">
              <span className="w-7 h-7 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <span>{lang === 'hi' ? 'दूसरा विकल्प' : 'Second option'}</span>
            </div>
            <div className="w-full p-2 bg-[#FBF7F0] border border-[#1A1A1A]/30 rounded-[12px] text-center text-xs font-bold text-[#1A1A1A]/80">
              {t('replay', lang)}
            </div>
          </div>

          <div className="w-full space-y-3 pt-2">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setScreen('practice_pin');
              }}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('next', lang)}
            </button>
            <button
              type="button"
              onClick={() => {
                playSequence([{ key: 'narr__howto', text: t('howto_text', lang) }]);
              }}
              className="w-full min-h-[56px] py-2 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {t('replay', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: PRACTICE PIN */}
      {screen === 'practice_pin' && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-6 sm:p-8 text-center space-y-4 shadow-sm my-auto">
            <span className="text-xl sm:text-2xl font-bold text-[#1A1A1A]/80 block">
              {t('practice_pin_title', lang)}
            </span>
            <div className="text-6xl sm:text-7xl font-black tracking-widest text-[#E8590C] py-2">
              4 8 2 7
            </div>
          </div>

          <div className="w-full space-y-3 pt-4">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setScreen('precheck');
              }}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('next', lang)}
            </button>
            <button
              type="button"
              onClick={() => {
                playSequence([{ key: 'narr__practice_pin', text: `${t('practice_pin_title', lang)}: ${PRACTICE_PIN}` }]);
              }}
              className="w-full min-h-[56px] py-2 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {t('replay', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: ONE QUESTION (Pre-check) */}
      {screen === 'precheck' && currentScenario && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-5 sm:p-7 text-center shadow-sm space-y-3 my-auto">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-[1.6]">
              {currentScenario.precheck.q[lang] || currentScenario.precheck.q.en}
            </p>
          </div>

          {/* Two Equal Neutral Buttons: हाँ / नहीं (min-height 72px) */}
          <div className="w-full space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3 w-full">
              <button
                type="button"
                onClick={() => handlePrecheckAnswer('yes')}
                className="min-h-[72px] py-4 px-4 bg-white text-[#1A1A1A] text-2xl sm:text-3xl font-black rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer text-center"
              >
                {t('yes', lang)}
              </button>
              <button
                type="button"
                onClick={() => handlePrecheckAnswer('no')}
                className="min-h-[72px] py-4 px-4 bg-white text-[#1A1A1A] text-2xl sm:text-3xl font-black rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer text-center"
              >
                {t('no', lang)}
              </button>
            </div>

            {/* Tiny link: skip_question */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleSkipPrecheck}
                className="text-sm font-bold text-[#1A1A1A]/70 hover:underline cursor-pointer py-1"
              >
                {t('skip_question', lang)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 6: THE SITUATION (Setup) */}
      {screen === 'setup' && currentScenario && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <SaralGuideBubble
            text={currentScenario.setup[lang] || currentScenario.setup.en}
          />

          <div className="w-full space-y-3 pt-4">
            <button
              type="button"
              onClick={startConversation}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('next', lang)}
            </button>
            <button
              type="button"
              onClick={() => {
                const setupText = currentScenario.setup[lang] || currentScenario.setup.en;
                playSequence([{ key: `${sid}__setup`, text: setupText }]);
              }}
              className="w-full min-h-[56px] py-2 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {t('replay', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 7: THE CONVERSATION */}
      {screen === 'conversation' && currentScenario && drillState && (
        <div className="flex-1 flex flex-col justify-between w-full max-w-md mx-auto min-h-0 overflow-hidden py-2 space-y-4">
          {isCallNode && !callPickedUp ? (
            /* Incoming Call Screen */
            <SaralCallScreen
              callerName={currNode?.from || 'Unknown Caller'}
              lang={lang}
              onPickUp={() => {
                stopRing();
                stopSpeaking();
                setCallPickedUp(true);
              }}
            />
          ) : currNode?.input ? (
            /* Keypad Input Node */
            <div className="my-auto w-full">
              <SaralKeypad
                kind={currNode.input.kind}
                prompt={currNode.input.prompt[lang] || currNode.input.prompt.en}
                detail={currNode.input.detail[lang] || currNode.input.detail.en}
                practicePin={PRACTICE_PIN}
                expectedCode={currentExpectedCode()}
                lang={lang}
                onSubmit={(len, hesitationMs) =>
                  dispatchAction({ type: 'input_submit', len, hesitationMs })
                }
                onCancel={() => dispatchAction({ type: 'input_cancel' })}
                onWrongEntry={() => {
                  playClip('narr__wrong_pin', t('wrong_pin_text', lang), lang, soundOn);
                }}
              />
            </div>
          ) : (
            /* Chat / SMS / Active Call Conversation */
            <SaralConversation
              pastMessages={pastMessages}
              currentMessage={
                currMsg
                  ? {
                      from: currNode?.from || 'Scammer',
                      text: currMsgText,
                      label: getMessageLabel(currMsg, currNode?.surface, currNode?.from, lang),
                      surface: currNode?.surface,
                      via: currMsg.via,
                      isOnCall: isCallNode,
                    }
                  : null
              }
              showingChoices={showingChoices}
              choices={currNode?.choices}
              lang={lang}
              onChoose={choiceId => dispatchAction({ type: 'choose', choiceId })}
              canSkip={!showingChoices && currMsg != null}
              onSkipMessage={() => {
                stopSpeaking();
                setRevealedMsgIndex(i => i + 1);
              }}
            />
          )}
        </div>
      )}

      {/* SCREEN 8: RESULT */}
      {screen === 'result' && currentScenario && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6 text-center">
          {(() => {
            const res = runResults[sid];
            const isScammed = res?.outcome === 'scammed';
            const isLate = res?.outcome === 'escaped_late';

            let bgClass = 'bg-[#2B8A3E] text-white';
            let icon = '✓';
            let titleText = t('result_escaped', lang);

            if (isScammed) {
              bgClass = 'bg-[#C92A2A] text-white';
              icon = '⚠️';
              titleText = t('result_scammed', lang);
            } else if (isLate) {
              bgClass = 'bg-[#E67700] text-white';
              icon = '⏱';
              titleText = t('result_late', lang);
            }

            return (
              <div className="w-full space-y-5 my-auto">
                {/* Full-width colour band */}
                <div
                  className={`w-full ${bgClass} rounded-[16px] p-6 sm:p-8 shadow-md space-y-3`}
                >
                  <div className="text-6xl sm:text-7xl font-black">{icon}</div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                    {titleText}
                  </h2>
                  {isScammed && res.lossInr > 0 && (
                    <div className="text-2xl sm:text-3xl font-extrabold bg-white/20 px-4 py-2 rounded-full inline-block">
                      {t('lost_amount', lang, { x: res.lossInr })}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Button: see_how */}
          <div className="w-full pt-4">
            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                setScreen('lesson');
              }}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('see_how', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 9: THE LESSON, EXPLAINED */}
      {screen === 'lesson' && currentScenario && drillState && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
          <div className="w-full space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] text-center">
              {runResults[sid]?.outcome === 'scammed' ? t('lesson_fell', lang) : t('lesson_safe', lang)}
            </h2>

            <SaralLessonCards
              scenario={currentScenario}
              cards={extractTrickCards(currentScenario, drillState, lang)}
              activeCardIndex={activeTrickIndex}
              showSummaryFallback={extractTrickCards(currentScenario, drillState, lang).length < 2}
              showHelpline={runResults[sid]?.outcome === 'scammed' && !hasEverBeenScammed}
              lang={lang}
            />
          </div>

          <div className="w-full space-y-3 pt-4">
            <button
              type="button"
              onClick={handleNextFromLesson}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('next', lang)}
            </button>
            <button
              type="button"
              onClick={() => {
                // Replay lesson narration
                const isScammed = runResults[sid]?.outcome === 'scammed';
                const cards = extractTrickCards(currentScenario, drillState, lang);
                const items: { key: string; text: string }[] = [];
                items.push({
                  key: isScammed ? 'narr__lesson_fell' : 'narr__lesson_safe',
                  text: isScammed ? t('lesson_fell', lang) : t('lesson_safe', lang),
                });
                if (cards.length >= 2) {
                  cards.forEach(c => items.push({ key: c.audioKey, text: c.explanation }));
                } else {
                  items.push({
                    key: `${sid}__flags`,
                    text: t(`flags_summary_${sid.replace(/-/g, '_')}`, lang),
                  });
                }
                items.push({
                  key: `${sid}__rule`,
                  text: `${t('remember', lang)}: ${currentScenario.rule[lang] || currentScenario.rule.en}`,
                });
                playSequence(items);
              }}
              className="w-full min-h-[56px] py-2 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {t('replay', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 10: ANOTHER ONE? */}
      {screen === 'another' && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6 text-center">
          <SaralGuideBubble text={t('another_yes', lang)} />

          <div className="w-full space-y-3 pt-6">
            <button
              type="button"
              onClick={handleAnotherYes}
              className="w-full min-h-[64px] py-3.5 px-4 bg-[#E8590C] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('another_yes', lang)}
            </button>
            <button
              type="button"
              onClick={handleAnotherNo}
              className="w-full min-h-[64px] py-3.5 px-4 bg-white text-[#1A1A1A] text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
            >
              {t('another_no', lang)}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 11: THE END */}
      {screen === 'final' && (
        <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6 text-center">
          {(() => {
            const totalDone = Object.keys(runResults).length;
            const notScammed = Object.values(runResults).filter(r => r.outcome !== 'scammed').length;
            const knewArray = SCENARIOS.slice(0, totalDone).map(s => knewAnswers[s.id]?.knew === true);
            const resultsArray = SCENARIOS.slice(0, totalDone).map(s => runResults[s.id]).filter(Boolean);
            const gap = knowledgeBehaviourGap(knewArray, resultsArray);

            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
              `${t('share_text', lang)} ${origin}/?src=family`
            )}`;

            return (
              <div className="w-full space-y-5 my-auto">
                <h1 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] leading-snug">
                  {t('final_title', lang, { x: notScammed, y: totalDone })}
                </h1>

                {/* You knew the rule callout if gap > 0 */}
                {gap.knewButFell > 0 && (
                  <div className="bg-red-50 border-2 border-[#C92A2A] rounded-[16px] p-4 text-left space-y-2 shadow-sm">
                    <h3 className="text-xl font-black text-[#C92A2A]">
                      {t('you_knew_the_rule', lang)}
                    </h3>
                    <p className="text-base font-bold text-[#1A1A1A]/80">
                      {t('rules_you_knew_broke', lang)}
                    </p>
                  </div>
                )}

                {/* Always show Helpline Card (NO tel: link per spec!) */}
                <div className="bg-amber-50 border-2 border-[#E67700] rounded-[16px] p-4 text-left space-y-1.5 shadow-sm">
                  <div className="flex items-center gap-2 text-[#E67700] font-bold text-base">
                    <span>🚨</span>
                    <span>1930</span>
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-relaxed">
                    {t('helpline_card', lang)}
                  </p>
                </div>

                {/* Buttons: Send to Family on WhatsApp & Practise Again */}
                <div className="space-y-3 pt-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full min-h-[64px] py-3.5 px-4 bg-[#2B8A3E] text-white text-xl sm:text-2xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <span>📲</span>
                    <span>{t('send_family', lang)}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setScreen('home');
                    }}
                    className="w-full min-h-[64px] py-3.5 px-4 bg-white text-[#1A1A1A] text-xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                  >
                    {t('practice_again', lang)}
                  </button>
                </div>

                {/* Small links at bottom */}
                <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-bold text-[#1A1A1A]/70">
                  <Link href="/drill" className="hover:underline">
                    {t('detailed_view', lang)}
                  </Link>
                  <span>·</span>
                  <Link href="/check" className="hover:underline">
                    {t('check_msg_link', lang)}
                  </Link>
                  <span>·</span>
                  <Link href="/about" className="hover:underline">
                    {t('about_project', lang)}
                  </Link>
                  <span>·</span>
                  <Link href="/judge" className="hover:underline">
                    {t('for_judges', lang)}
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </main>
  );
}
