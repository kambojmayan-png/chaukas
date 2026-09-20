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
import { t } from '@/lib/i18n';
import { useLang } from '@/lib/useLang';
import {
  playClip,
  stopSpeaking,
  playRingtone,
  stopRing,
  preloadClips,
  subscribeAudioState,
  type AudioPlaybackState,
} from '@/lib/speak';
import { sendRun } from '@/lib/telemetry';
import { SaralTopBar } from './SaralTopBar';
import { SaralGuideBubble } from './SaralGuideBubble';
import { SaralKeypad } from './SaralKeypad';
import { SaralCallScreen } from './SaralCallScreen';
import { SaralConversation, type DisplayMessage } from './SaralConversation';
import { SaralLessonCards, extractTrickCards } from './SaralLessonCards';
import { SaralErrorBoundary } from './SaralErrorBoundary';

type FlowScreen =
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

export interface SaralFlowProps {
  initialPracticeIdx?: number;
  initialLang?: Lang;
  initialSoundOn?: boolean;
  isFamily?: boolean;
  onReturnHome: () => void;
  initialScreen?: FlowScreen;
}

function markPracticeDone(sid: string) {
  if (typeof window === 'undefined') return;
  try {
    const val = localStorage.getItem('chaukas_saral_done');
    const done: string[] = val ? JSON.parse(val) : [];
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

export function SaralFlow({
  initialPracticeIdx = 0,
  initialSoundOn = true,
  isFamily = false,
  onReturnHome,
  initialScreen = 'soundcheck',
}: SaralFlowProps) {
  const [lang] = useLang();
  const [soundOn, setSoundOn] = useState<boolean>(initialSoundOn);
  const [screen, setScreen] = useState<FlowScreen>(initialScreen);
  const [practiceIdx, setPracticeIdx] = useState<number>(initialPracticeIdx);
  const [origin, setOrigin] = useState<string>('');

  // Audio playback state subscription (for sound check)
  const [audioState, setAudioState] = useState<AudioPlaybackState>('idle');

  useEffect(() => {
    const unsub = subscribeAudioState((st) => {
      setAudioState(st);
    });
    return unsub;
  }, []);

  // Global navigation lock (600 ms after any screen or node change)
  const navLockUntilRef = useRef<number>(0);
  const isNavLocked = () => Date.now() < navLockUntilRef.current;
  const lockNav = () => {
    navLockUntilRef.current = Date.now() + 600;
  };

  // Node entered timestamp & 30s timer ref
  const nodeEnteredAtRef = useRef<number>(0);
  const timerSecRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimerSec = () => {
    if (timerSecRef.current) {
      clearTimeout(timerSecRef.current);
      timerSecRef.current = null;
    }
  };

  // Audio / Narration state
  const playSeqIdRef = useRef<number>(0);
  const playbackTokenRef = useRef<number>(0);

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
  const [convPhase, setConvPhase] = useState<'messages' | 'choices' | 'input'>('messages');
  const [msgIndex, setMsgIndex] = useState<number>(0);
  const [pastMessages, setPastMessages] = useState<DisplayMessage[]>([]);

  // Current scenario
  const currentScenario: Scenario | undefined = SCENARIOS[practiceIdx];
  const sid = currentScenario?.id || 'olx-qr';

  // VisitKey & node change synchronization
  const currentVisitKey = drillState ? `${drillState.path.length}:${drillState.nodeId}` : '0:none';
  const [prevVisitKey, setPrevVisitKey] = useState<string>(currentVisitKey);
  if (prevVisitKey !== currentVisitKey) {
    setPrevVisitKey(currentVisitKey);
    nodeEnteredAtRef.current = Date.now();
    clearTimerSec();
    const currNodeForInit = currentScenario && drillState ? currentScenario.nodes[drillState.nodeId] : null;
    const msgsForInit = currNodeForInit?.messages ?? [];
    const initialPhase = msgsForInit.length > 0
      ? 'messages'
      : currNodeForInit?.choices && currNodeForInit.choices.length > 0
      ? 'choices'
      : 'input';
    setConvPhase(initialPhase);
    setMsgIndex(0);
  }

  // Lesson cards state (Screen 9)
  const [activeTrickIndex, setActiveTrickIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    if (!next) {
      stopSpeaking();
      stopRing();
    }
    setSoundOn(next);
  };

  // Safe play helper: stops previous, tracks sequence ID
  const playSequence = useCallback(
    async (items: { key: string; text: string }[]) => {
      stopSpeaking();
      playSeqIdRef.current += 1;
      const seqId = playSeqIdRef.current;

      for (let i = 0; i < items.length; i++) {
        if (playSeqIdRef.current !== seqId) break;
        await playClip(items[i].key, items[i].text, lang, soundOn);
      }
    },
    [lang, soundOn]
  );

  // Clean up speech, ring, and timer on unmount or screen transition
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRing();
      clearTimerSec();
    };
  }, [screen, practiceIdx]);

  // SCREEN 1: Sound Check narration & preload next two clips
  useEffect(() => {
    if (screen === 'soundcheck') {
      preloadClips(['narr__soundcheck', 'narr__welcome'], lang);
      playSequence([
        { key: 'narr__soundcheck', text: t('soundcheck_text', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 2: What this is narration & preload next two clips
  useEffect(() => {
    if (screen === 'welcome') {
      preloadClips(['narr__howto', 'narr__practice_pin'], lang);
      playSequence([
        { key: 'narr__welcome', text: t('welcome_text', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 3: How it works narration & preload next two clips
  useEffect(() => {
    if (screen === 'howto') {
      preloadClips(['narr__practice_pin', 'narr__keypad_pin'], lang);
      playSequence([
        { key: 'narr__howto', text: t('howto_text', lang) },
      ]);
    }
  }, [screen, lang, playSequence]);

  // SCREEN 4: Practice PIN narration & preload next two clips
  useEffect(() => {
    if (screen === 'practice_pin' && currentScenario) {
      preloadClips([`${currentScenario.id}__precheck`, `${currentScenario.id}__setup`], lang);
      playSequence([
        { key: 'narr__practice_pin', text: `${t('practice_pin_title', lang)}: ${PRACTICE_PIN}` },
      ]);
    }
  }, [screen, currentScenario, lang, playSequence]);

  // SCREEN 5: Pre-check question narration & preload next two clips
  useEffect(() => {
    if (screen === 'precheck' && currentScenario) {
      preloadClips([`${sid}__setup`, `${sid}__n1__0`], lang);
      const qText = currentScenario.precheck.q[lang] || currentScenario.precheck.q.en;
      const items: { key: string; text: string }[] = [];
      if (practiceIdx > 0) {
        items.push({ key: 'narr__next_drill', text: t('another_yes', lang) });
      }
      items.push({ key: 'narr__one_question', text: qText });
      items.push({ key: `${sid}__precheck`, text: qText });
      playSequence(items);
    }
  }, [screen, currentScenario, sid, practiceIdx, lang, playSequence]);

  // SCREEN 6: Situation (setup) narration & preload next two clips
  useEffect(() => {
    if (screen === 'setup' && currentScenario) {
      preloadClips([`${sid}__n1__0`, `${sid}__n1__choices`], lang);
      const setupText = currentScenario.setup[lang] || currentScenario.setup.en;
      playSequence([
        { key: `${sid}__setup`, text: setupText },
      ]);
    }
  }, [screen, currentScenario, sid, lang, playSequence]);

  // SCREEN 8: Result narration & preload next two clips
  useEffect(() => {
    if (screen === 'result' && currentScenario) {
      const res = runResults[sid];
      const isScammed = res?.outcome === 'scammed';
      preloadClips([isScammed ? 'narr__lesson_fell' : 'narr__lesson_safe', `${sid}__rule`], lang);
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

  // SCREEN 9: Lesson narration & preload next two clips
  useEffect(() => {
    if (screen === 'lesson' && currentScenario && drillState) {
      preloadClips(['narr__another_or_stop', 'narr__next_drill'], lang);
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

  // SCREEN 10: Another one? narration & preload next scenario clips
  useEffect(() => {
    if (screen === 'another') {
      const nextSid = SCENARIOS[practiceIdx + 1]?.id || sid;
      preloadClips(['narr__next_drill', `${nextSid}__precheck`], lang);
      playSequence([
        { key: 'narr__another_or_stop', text: t('another_yes', lang) },
      ]);
    }
  }, [screen, practiceIdx, sid, lang, playSequence]);

  // SCREEN 11: Final scorecard narration
  useEffect(() => {
    if (screen === 'final') {
      preloadClips(['narr__final_all_safe', 'narr__bye'], lang);
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
    if (isNavLocked()) return;
    lockNav();
    if (!currentScenario) return;
    stopSpeaking();
    stopRing();
    clearTimerSec();

    const initialSt = engineStart(currentScenario, Date.now());
    setDrillState(initialSt);
    setPastMessages([]);

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

  // SCREEN 7: Deterministic conversation audio player
  useEffect(() => {
    if (screen !== 'conversation' || !drillState || !currentScenario) return;

    const node = currentScenario.nodes[drillState.nodeId];
    if (!node) return;

    const isCall = node.surface === 'call' || node.surface === 'videocall';
    if (isCall && !callPickedUp) return;

    playbackTokenRef.current += 1;
    const token = playbackTokenRef.current;
    let active = true;

    async function stepPlayer() {
      if (!node) return;
      if (convPhase === 'messages') {
        const msgs = node.messages ?? [];
        if (msgIndex < msgs.length) {
          const msg = msgs[msgIndex];
          const clipKey = `${sid}__${node.id}__${msgIndex}`;
          const msgText = msg.text[lang] || msg.text.en;

          // Preload next message and choices clip
          if (msgIndex + 1 < msgs.length) {
            preloadClips([`${sid}__${node.id}__${msgIndex + 1}`, `${sid}__${node.id}__choices`], lang);
          }

          await playClip(clipKey, msgText, lang, soundOn);

          // Guard against stale continuation
          if (!active || playbackTokenRef.current !== token) return;

          // Advance once
          if (msgIndex < msgs.length - 1) {
            setMsgIndex(msgIndex + 1);
          } else {
            // Last message finished
            if (node.choices && node.choices.length > 0) {
              setConvPhase('choices');
            } else if (node.input) {
              setConvPhase('input');
            }
          }
        }
      } else if (convPhase === 'choices') {
        // The options clip <sid>__<nodeId>__choices plays after the last message ends
        if (node.choices && node.choices.length > 0) {
          const choicesClip = `${sid}__${node.id}__choices`;
          const choicesText = node.choices
            .map((c, idx) => `${idx + 1}. ${c.label[lang] || c.label.en}`)
            .join('. ');

          await playClip(choicesClip, choicesText, lang, soundOn);

          if (!active || playbackTokenRef.current !== token) return;

          // If node has timerSec: start 30s timer after choices clip ends
          if (node.timerSec) {
            clearTimerSec();
            timerSecRef.current = setTimeout(() => {
              if (playbackTokenRef.current === token) {
                dispatchAction({ type: 'timeout' });
              }
            }, 30000);
          }
        }
      } else if (convPhase === 'input') {
        if (node.input) {
          const keypadClip = node.input.kind === 'pin' ? 'narr__keypad_pin' : 'narr__keypad_otp';
          const keypadText = node.input.prompt[lang] || node.input.prompt.en;

          await playClip(keypadClip, keypadText, lang, soundOn);

          if (!active || playbackTokenRef.current !== token) return;
        }
      }
    }

    stepPlayer();

    return () => {
      active = false;
    };
  }, [currentVisitKey, convPhase, msgIndex, lang, soundOn, screen, callPickedUp]);

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

  const dispatchAction = (action: Action, actionVisitKey?: string) => {
    if (!currentScenario || !drillState) return;
    if (isNavLocked()) return;
    if (actionVisitKey && actionVisitKey !== currentVisitKey) return;
    if (Date.now() - nodeEnteredAtRef.current < 600) return;

    lockNav();
    stopSpeaking();
    stopRing();
    clearTimerSec();

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

    // Append previous node's messages to past messages
    const prevMsgs = prevNode?.messages ?? [];
    if (prevMsgs.length > 0) {
      const formatted = prevMsgs.map(m => ({
        from: prevNode.from || 'Scammer',
        text: m.text[lang] || m.text.en,
        label: getMessageLabel(m, prevNode.surface, prevNode.from, lang),
        surface: prevNode.surface,
        via: m.via,
        isOnCall: prevWasCall,
      }));
      setPastMessages(prev => [...prev, ...formatted]);
    }
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

  const handlePrecheckAnswer = (answer: 'yes' | 'no') => {
    if (isNavLocked()) return;
    lockNav();
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
    if (isNavLocked()) return;
    lockNav();
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
    if (isNavLocked()) return;
    lockNav();
    stopSpeaking();
    stopRing();
    clearTimerSec();
    setShowLeaveConfirm(false);
    onReturnHome();
  };

  const handleNextFromLesson = () => {
    if (isNavLocked()) return;
    lockNav();
    stopSpeaking();
    if (practiceIdx < SCENARIOS.length - 1) {
      setScreen('another');
    } else {
      setScreen('final');
    }
  };

  const handleAnotherYes = () => {
    if (isNavLocked()) return;
    lockNav();
    stopSpeaking();
    const next = practiceIdx + 1;
    setPracticeIdx(next);
    setScreen('precheck');
  };

  const handleAnotherNo = () => {
    if (isNavLocked()) return;
    lockNav();
    stopSpeaking();
    setUserStoppedEarly(true);
    setScreen('final');
  };

  const currNode = currentScenario && drillState ? currentScenario.nodes[drillState.nodeId] : null;
  const isCallNode = currNode?.surface === 'call' || currNode?.surface === 'videocall';
  const nodeMsgs = currNode?.messages ?? [];
  const activeCurrentMessage =
    convPhase === 'messages' && nodeMsgs[msgIndex]
      ? {
          from: currNode?.from || 'Scammer',
          text: nodeMsgs[msgIndex].text[lang] || nodeMsgs[msgIndex].text.en,
          label: getMessageLabel(nodeMsgs[msgIndex], currNode?.surface, currNode?.from, lang),
          surface: currNode?.surface,
          via: nodeMsgs[msgIndex].via,
          isOnCall: isCallNode,
        }
      : convPhase === 'choices' && nodeMsgs.length > 0
      ? {
          from: currNode?.from || 'Scammer',
          text: nodeMsgs[nodeMsgs.length - 1].text[lang] || nodeMsgs[nodeMsgs.length - 1].text.en,
          label: getMessageLabel(nodeMsgs[nodeMsgs.length - 1], currNode?.surface, currNode?.from, lang),
          surface: currNode?.surface,
          via: nodeMsgs[nodeMsgs.length - 1].via,
          isOnCall: isCallNode,
        }
      : null;

  const activePastMessages =
    convPhase === 'messages'
      ? [
          ...pastMessages,
          ...nodeMsgs.slice(0, msgIndex).map(m => ({
            from: currNode?.from || 'Scammer',
            text: m.text[lang] || m.text.en,
            label: getMessageLabel(m, currNode?.surface, currNode?.from, lang),
            surface: currNode?.surface,
            via: m.via,
            isOnCall: isCallNode,
          })),
        ]
      : convPhase === 'choices'
      ? [
          ...pastMessages,
          ...nodeMsgs.slice(0, Math.max(0, nodeMsgs.length - 1)).map(m => ({
            from: currNode?.from || 'Scammer',
            text: m.text[lang] || m.text.en,
            label: getMessageLabel(m, currNode?.surface, currNode?.from, lang),
            surface: currNode?.surface,
            via: m.via,
            isOnCall: isCallNode,
          })),
        ]
      : pastMessages;

  const showingChoices = Boolean(
    currNode?.choices &&
    currNode.choices.length > 0 &&
    (convPhase === 'choices' || (convPhase === 'messages' && msgIndex === nodeMsgs.length - 1))
  );

  return (
    <SaralErrorBoundary lang={lang} soundOn={soundOn}>
      <main className="min-h-screen bg-[#FBF7F0] text-[#1A1A1A] flex flex-col justify-between p-3 sm:p-5 max-w-xl mx-auto antialiased">
        {/* Top Bar on all screens */}
        <SaralTopBar
          lang={lang}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          practiceNumber={
            ['precheck', 'setup', 'conversation', 'result', 'lesson'].includes(screen)
              ? practiceIdx + 1
              : null
          }
          onLeavePractice={() => setShowLeaveConfirm(true)}
        />

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

        {/* SCREEN 1: SOUND CHECK (P2 2.4) */}
        {screen === 'soundcheck' && (
          <div className="flex-1 flex flex-col justify-between items-center py-6 max-w-md mx-auto w-full my-auto space-y-6">
            <div className="w-full space-y-4">
              {/* Question */}
              <SaralGuideBubble text={t('soundcheck_text', lang)} />

              {/* sound_help shown under question from the start */}
              <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 text-center shadow-xs">
                <p className="text-base sm:text-lg font-bold text-[#1A1A1A] leading-relaxed">
                  {t('sound_help', lang)}
                </p>
              </div>

              {/* Animated equaliser bars + sound_playing while audio element is playing */}
              {audioState === 'playing' && (
                <div className="flex items-center justify-center gap-2.5 p-3 bg-[#E6F3EE] border-2 border-[#0F6B4F]/30 rounded-[14px] text-[#0F6B4F]">
                  <div className="flex items-end gap-1 h-5 w-6 pb-0.5" aria-hidden="true">
                    <span className="w-1 bg-[#0F6B4F] rounded-full animate-eq-1 inline-block" />
                    <span className="w-1 bg-[#0F6B4F] rounded-full animate-eq-2 inline-block" />
                    <span className="w-1 bg-[#0F6B4F] rounded-full animate-eq-3 inline-block" />
                    <span className="w-1 bg-[#0F6B4F] rounded-full animate-eq-4 inline-block" />
                  </div>
                  <span className="text-base font-bold">{t('sound_playing', lang)}</span>
                </div>
              )}

              {/* sound_blocked if audio play was rejected */}
              {audioState === 'blocked' && (
                <div className="p-3 bg-amber-50 border-2 border-[#E67700] rounded-[14px] text-center">
                  <p className="text-base font-bold text-[#1A1A1A]">
                    {t('sound_blocked', lang)}
                  </p>
                </div>
              )}
            </div>

            {/* Buttons: sound_yes / continue_without_sound */}
            <div className="w-full space-y-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (isNavLocked()) return;
                  lockNav();
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
                  if (isNavLocked()) return;
                  lockNav();
                  stopSpeaking();
                  setSoundOn(false);
                  setScreen('welcome');
                }}
                className="w-full min-h-[56px] py-3 px-4 bg-[#FBF7F0] text-[#1A1A1A] text-lg sm:text-xl font-bold rounded-[16px] border-2 border-[#1A1A1A] hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
              >
                {t('continue_without_sound', lang)}
              </button>
            </div>
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
                  if (isNavLocked()) return;
                  lockNav();
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
                  if (isNavLocked()) return;
                  lockNav();
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
                {PRACTICE_PIN.split('').join(' ')}
              </div>
            </div>

            <div className="w-full space-y-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  if (isNavLocked()) return;
                  lockNav();
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
              <SaralCallScreen
                callerName={currNode?.from || 'Unknown Caller'}
                lang={lang}
                onPickUp={() => {
                  if (isNavLocked()) return;
                  lockNav();
                  stopRing();
                  stopSpeaking();
                  setCallPickedUp(true);
                }}
              />
            ) : currNode?.input && (convPhase === 'input' || (currNode.messages?.length ?? 0) === 0) ? (
              <div className="my-auto w-full">
                <SaralKeypad
                  kind={currNode.input.kind}
                  prompt={currNode.input.prompt[lang] || currNode.input.prompt.en}
                  detail={currNode.input.detail[lang] || currNode.input.detail.en}
                  practicePin={PRACTICE_PIN}
                  expectedCode={currentExpectedCode()}
                  lang={lang}
                  onSubmit={(len, hesitationMs) =>
                    dispatchAction({ type: 'input_submit', len, hesitationMs }, currentVisitKey)
                  }
                  onCancel={() => dispatchAction({ type: 'input_cancel' }, currentVisitKey)}
                  onWrongEntry={() => {
                    stopSpeaking();
                    playClip('narr__wrong_pin', t('wrong_pin_text', lang), lang, soundOn);
                  }}
                />
              </div>
            ) : (
              <SaralConversation
                visitKey={currentVisitKey}
                pastMessages={activePastMessages}
                currentMessage={activeCurrentMessage}
                showingChoices={showingChoices}
                choices={currNode?.choices}
                lang={lang}
                onChoose={(choiceId, vKey) =>
                  dispatchAction({ type: 'choose', choiceId }, vKey)
                }
                canSkip={!showingChoices && activeCurrentMessage != null}
                onSkipMessage={() => {
                  stopSpeaking();
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
                  <div className={`w-full ${bgClass} rounded-[16px] p-6 sm:p-8 shadow-md space-y-3`}>
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

            <div className="w-full pt-4">
              <button
                type="button"
                onClick={() => {
                  if (isNavLocked()) return;
                  lockNav();
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

                  <div className="bg-amber-50 border-2 border-[#E67700] rounded-[16px] p-4 text-left space-y-1.5 shadow-sm">
                    <div className="flex items-center gap-2 text-[#E67700] font-bold text-base">
                      <span>🚨</span>
                      <span>1930</span>
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-relaxed">
                      {t('helpline_card', lang)}
                    </p>
                  </div>

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
                        if (isNavLocked()) return;
                        lockNav();
                        stopSpeaking();
                        onReturnHome();
                      }}
                      className="w-full min-h-[64px] py-3.5 px-4 bg-white text-[#1A1A1A] text-xl font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer"
                    >
                      {t('practice_again', lang)}
                    </button>
                  </div>

                  <div className="pt-4 border-t border-[#1A1A1A]/10 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-bold text-[#1A1A1A]/70">
                    <Link href="/drill?lang=en" className="hover:underline">
                      {t('detailed_view', lang)}
                    </Link>
                    <span>·</span>
                    <Link href="/check?lang=en" className="hover:underline">
                      {t('check_msg_link', lang)}
                    </Link>
                    <span>·</span>
                    <Link href="/about?lang=en" className="hover:underline">
                      {t('about_project', lang)}
                    </Link>
                    <span>·</span>
                    <Link href="/judge?lang=en" className="hover:underline">
                      {t('for_judges', lang)}
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>
    </SaralErrorBoundary>
  );
}
