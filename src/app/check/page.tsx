'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { checkMessage, type CheckResult, type Flag, type Finding } from '@/check/rules';
import { useLang } from '@/lib/useLang';
import { t, getFlagLabel } from '@/lib/i18n';
import { AppShell, Card, Chip, PageTitle } from '@/ui';
import { playClip, stopSpeaking } from '@/lib/speak';
import type { Lang } from '@/engine/engine';

function getAdvice(result: CheckResult, lang: Lang): string {
  switch (result.archetype) {
    case 'money_request':
      return t('advice_money_request', lang);
    case 'digital_arrest':
      return t('advice_digital_arrest', lang);
    case 'utility_kyc_remote':
      return t('advice_utility_kyc_remote', lang);
    case 'receive_money_pin':
    case 'reward_refund':
      return t('advice_receive_money_pin', lang);
    default:
      return t('advice_other', lang);
  }
}

function getAudioClips(result: CheckResult, lang: Lang): {
  verdictClip: string;
  verdictFallback: string;
  adviceClip: string;
  adviceFallback: string;
} {
  const verdictClip =
    result.verdict === 'likely_scam'
      ? 'check__likely_scam'
      : result.verdict === 'suspicious'
      ? 'check__suspicious'
      : 'check__none';

  const verdictFallback =
    result.verdict === 'likely_scam'
      ? t('likely_scam', lang)
      : result.verdict === 'suspicious'
      ? t('suspicious', lang)
      : t('no_red_flags_found', lang);

  let adviceClip = 'check__advice_other';
  let adviceFallback = t('advice_other', lang);

  if (result.archetype === 'money_request') {
    adviceClip = 'check__advice_money_request';
    adviceFallback = t('advice_money_request', lang);
  } else if (result.archetype === 'digital_arrest') {
    adviceClip = 'check__advice_digital_arrest';
    adviceFallback = t('advice_digital_arrest', lang);
  } else if (result.archetype === 'utility_kyc_remote') {
    adviceClip = 'check__advice_utility_kyc_remote';
    adviceFallback = t('advice_utility_kyc_remote', lang);
  } else if (result.archetype === 'receive_money_pin' || result.archetype === 'reward_refund') {
    adviceClip = 'check__advice_receive_money_pin';
    adviceFallback = t('advice_receive_money_pin', lang);
  }

  return { verdictClip, verdictFallback, adviceClip, adviceFallback };
}

const EXAMPLES = [
  {
    labelKey: 'example_electricity_sms',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9.30 pm because your previous month bill was not updated. Please immediately contact our electricity officer 8240471159. Thank you.',
  },
  {
    labelKey: 'example_sbi_kyc_sms',
    text: 'Dear customer your SBI account will be blocked today. Update your KYC immediately: http://sbi-kyc-update.top/login',
  },
  {
    labelKey: 'example_bank_otp_sms',
    text: '482913 is your OTP for txn of INR 1,250.00 at AMAZON. Do not share it with anyone. -HDFC Bank',
  },
];

interface MergedSpan {
  start: number;
  end: number;
  flags: Flag[];
}

function mergeSpans(findings: Finding[]): MergedSpan[] {
  if (findings.length === 0) return [];
  const sorted = [...findings].sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: MergedSpan[] = [];

  for (const f of sorted) {
    if (merged.length === 0) {
      merged.push({ start: f.start, end: f.end, flags: [f.flag] });
      continue;
    }
    const last = merged[merged.length - 1];
    if (f.start < last.end) {
      // Overlapping
      last.end = Math.max(last.end, f.end);
      if (!last.flags.includes(f.flag)) {
        last.flags.push(f.flag);
      }
    } else {
      merged.push({ start: f.start, end: f.end, flags: [f.flag] });
    }
  }

  return merged;
}

export default function CheckPage() {
  const [text, setText] = useState<string>('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showPasteHelp, setShowPasteHelp] = useState<boolean>(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [lang] = useLang();

  const playbackTokenRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const runCheck = async (textToCheck: string) => {
    setShowPasteHelp(false);
    if (!textToCheck.trim()) {
      setShowEmptyWarning(true);
      if (soundOn) {
        playbackTokenRef.current++;
        await playClip('check__empty', t('check_empty', lang), lang, soundOn);
      }
      return;
    }

    setShowEmptyWarning(false);
    const res = checkMessage(textToCheck);
    setResult(res);

    if (soundOn) {
      const { verdictClip, verdictFallback, adviceClip, adviceFallback } = getAudioClips(res, lang);
      const token = ++playbackTokenRef.current;
      await playClip(verdictClip, verdictFallback, lang, soundOn);
      if (playbackTokenRef.current !== token) return;
      await playClip(adviceClip, adviceFallback, lang, soundOn);
    }
  };

  const handlePaste = async () => {
    setShowPasteHelp(false);
    setShowEmptyWarning(false);
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        setShowPasteHelp(true);
        return;
      }
      const clipText = await navigator.clipboard.readText();
      if (clipText && clipText.trim()) {
        setText(clipText);
        setResult(null);
      } else {
        setShowPasteHelp(true);
      }
    } catch {
      setShowPasteHelp(true);
    }
  };

  const handleIntro = () => {
    playbackTokenRef.current++;
    playClip('check__intro', t('check_page_desc', lang), lang, true);
  };

  const handleReplay = async () => {
    if (!result) return;
    const { verdictClip, verdictFallback, adviceClip, adviceFallback } = getAudioClips(result, lang);
    const token = ++playbackTokenRef.current;
    await playClip(verdictClip, verdictFallback, lang, true);
    if (playbackTokenRef.current !== token) return;
    await playClip(adviceClip, adviceFallback, lang, true);
  };

  const handleExampleClick = (exampleText: string) => {
    setText(exampleText);
    runCheck(exampleText);
  };

  const mergedSpans = result ? mergeSpans(result.findings) : [];
  const advice = result ? getAdvice(result, lang) : null;

  // Render highlighted text with merged spans
  const renderHighlightedText = () => {
    if (!result || mergedSpans.length === 0) {
      return <span>{text}</span>;
    }

    let lastIdx = 0;
    const parts: React.ReactNode[] = [];

    mergedSpans.forEach((span, i) => {
      if (span.start > lastIdx) {
        parts.push(
          <span key={`text-${lastIdx}`}>{text.slice(lastIdx, span.start)}</span>
        );
      }
      const highlighted = text.slice(span.start, span.end);
      parts.push(
        <mark
          key={`mark-${i}`}
          className="bg-[#FFF2EB] text-[#1A1A1A] border-b-2 border-[#E8590C] px-1.5 py-0.5 rounded font-semibold inline"
        >
          {highlighted}
          <span className="ml-1.5 text-xs sm:text-sm font-bold bg-[#E8590C] text-white px-2 py-0.5 rounded-full inline-block align-middle leading-normal">
            🚩 {span.flags.map(f => getFlagLabel(f, lang)).join(', ')}
          </span>
        </mark>
      );
      lastIdx = span.end;
    });

    if (lastIdx < text.length) {
      parts.push(<span key={`text-${lastIdx}`}>{text.slice(lastIdx)}</span>);
    }

    return parts;
  };

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Page Title + Intro audio button */}
        <div className="space-y-4">
          <PageTitle
            tag={<Chip variant="green">/check</Chip>}
            title={t('check_page_title', lang)}
            subtitle={t('check_page_desc', lang)}
          />

          {/* Intro button: "🔊 यह पेज क्या करता है" / "🔊 What does this page do?" (never autoplay) */}
          <div>
            <button
              type="button"
              onClick={handleIntro}
              className="min-h-[48px] px-4 py-2.5 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A]/20 rounded-[14px] font-bold text-base sm:text-lg shadow-2xs hover:bg-[#FBF7F0] active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>{t('check_page_intro_btn', lang)}</span>
            </button>
          </div>
        </div>

        {/* Try an Example Chips */}
        <div className="space-y-2.5">
          <span className="text-sm sm:text-base font-bold text-[#1A1A1A]/75 block">
            {t('try_an_example', lang)}:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex.text)}
                className="text-sm sm:text-base font-semibold bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-[12px] shadow-[0_2px_6px_rgba(26,26,26,0.04)] px-4 py-2.5 min-h-[48px] hover:bg-[#FBF7F0] hover:border-[#1A1A1A]/30 active:scale-[0.98] transition-all cursor-pointer text-left max-w-full break-words"
              >
                {t(ex.labelKey, lang)}
              </button>
            ))}
          </div>
        </div>

        {/* Paste Button + Sound Toggle + Input Box */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Big paste_button above the box */}
            <button
              type="button"
              onClick={handlePaste}
              className="min-h-[56px] px-6 py-3 bg-white text-[#1A1A1A] text-lg sm:text-xl font-black rounded-[16px] border-2 border-[#1A1A1A] shadow-xs hover:bg-[#FBF7F0] active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {t('paste_button', lang)}
            </button>

            {/* Sound toggle button */}
            <button
              type="button"
              onClick={() => {
                const next = !soundOn;
                setSoundOn(next);
                if (!next) stopSpeaking();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm sm:text-base font-bold text-[#1A1A1A]/80 hover:text-[#1A1A1A] cursor-pointer self-start sm:self-auto min-h-[48px]"
            >
              <span>{soundOn ? '🔊' : '🔇'}</span>
              <span>{soundOn ? t('sound_on', lang) : t('sound_off', lang)}</span>
            </button>
          </div>

          {/* If browser refuses paste, show paste_help */}
          {showPasteHelp && (
            <div
              role="status"
              className="bg-[#FFF2EB] border-2 border-[#E8590C] text-[#E8590C] p-3.5 rounded-[14px] text-base sm:text-lg font-bold flex items-center gap-2 animate-in fade-in"
            >
              <span className="text-xl shrink-0">💡</span>
              <span>{t('paste_help', lang)}</span>
            </div>
          )}

          {/* Large text box */}
          <div className="relative">
            <textarea
              value={text}
              maxLength={1000}
              onChange={(e) => {
                setText(e.target.value);
                setShowEmptyWarning(false);
              }}
              placeholder={t('paste_message_placeholder', lang)}
              rows={6}
              className="w-full bg-white text-[#1A1A1A] border-2 border-[#1A1A1A]/30 rounded-[16px] shadow-xs p-4 sm:p-5 text-lg sm:text-xl leading-relaxed resize-y focus:outline-hidden focus:border-[#0F6B4F] focus:ring-2 focus:ring-[#0F6B4F]/20 transition-all font-sans"
            />
            <div className="absolute bottom-3 right-3 text-xs sm:text-sm font-semibold text-[#1A1A1A]/50 bg-white/90 px-2 py-0.5 rounded-md border border-[#1A1A1A]/10">
              {text.length}/1000
            </div>
          </div>

          {/* Privacy Notice under the box */}
          <p className="text-sm sm:text-base text-[#1A1A1A]/70 font-medium">
            {t('check_privacy_notice', lang)}
          </p>
        </div>

        {/* Check Button (ALWAYS ENABLED) + Empty Warning */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => runCheck(text)}
            className="min-h-[58px] px-8 py-3.5 bg-[#0F6B4F] text-white text-xl font-black rounded-[16px] border-2 border-[#1A1A1A] shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>{t('check_message_button', lang)}</span>
            <span>🔍</span>
          </button>

          {showEmptyWarning && (
            <div
              role="alert"
              className="flex-1 bg-[#FFF5F5] border-2 border-[#C92A2A] text-[#C92A2A] p-3.5 rounded-[14px] text-base sm:text-lg font-bold flex items-center gap-2 animate-in fade-in"
            >
              <span className="text-xl shrink-0">⚠️</span>
              <span>{t('check_empty', lang)}</span>
            </div>
          )}
        </div>

        {/* Result: ONE BIG CARD */}
        {result && (
          <Card
            role="region"
            aria-live="polite"
            aria-label={t('verdict', lang)}
            className={`space-y-6 border-2 shadow-md animate-in fade-in duration-300 ${
              result.verdict === 'likely_scam'
                ? 'border-[#C92A2A] bg-[#FFF5F5]/40'
                : result.verdict === 'suspicious'
                ? 'border-[#E8590C] bg-[#FFF2EB]/40'
                : 'border-[#0F6B4F] bg-[#E6F3EE]/40'
            }`}
          >
            {/* Verdict Header: Icon + Colour + Verdict + Replay Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1A1A1A]/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl sm:text-4xl shrink-0" aria-hidden="true">
                  {result.verdict === 'likely_scam'
                    ? '🚨'
                    : result.verdict === 'suspicious'
                    ? '⚠️'
                    : '🛡️'}
                </span>
                <div>
                  <span className="text-xs sm:text-sm font-black text-[#1A1A1A]/60 uppercase tracking-wider block">
                    {t('verdict', lang)}
                  </span>
                  <div className="pt-0.5">
                    {result.verdict === 'likely_scam' && (
                      <Chip variant="red" className="text-lg sm:text-xl px-4 py-1.5 font-black">
                        {t('likely_scam', lang)}
                      </Chip>
                    )}
                    {result.verdict === 'suspicious' && (
                      <Chip variant="saffron" className="text-lg sm:text-xl px-4 py-1.5 font-black">
                        {t('suspicious', lang)}
                      </Chip>
                    )}
                    {result.verdict === 'no_red_flags_found' && (
                      <Chip variant="guide" className="text-lg sm:text-xl px-4 py-1.5 font-black">
                        {t('no_red_flags_found', lang)}
                      </Chip>
                    )}
                  </div>
                </div>
              </div>

              {/* Replay Button */}
              <button
                type="button"
                onClick={handleReplay}
                className="min-h-[48px] px-4 py-2 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A]/20 rounded-[12px] font-bold text-base sm:text-lg hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>{t('replay_advice', lang)}</span>
              </button>
            </div>

            {/* Highlighted Findings in Text */}
            <div className="space-y-2">
              <span className="text-sm sm:text-base font-bold text-[#1A1A1A]/75 block">
                {t('analysis_red_flags', lang)}:
              </span>
              <div className="bg-white border-2 border-[#1A1A1A]/10 p-4 sm:p-5 rounded-[14px] text-lg leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap font-sans">
                {renderHighlightedText()}
              </div>
            </div>

            {/* Advice Line */}
            {advice && (
              <div className="p-4 sm:p-5 bg-white border-2 border-[#1A1A1A]/15 rounded-[14px] space-y-1">
                <span className="text-xs sm:text-sm font-black text-[#1A1A1A]/60 uppercase tracking-wider block">
                  {lang === 'hi' ? 'सलाह' : 'Advice'}:
                </span>
                <p className="text-lg sm:text-xl font-extrabold text-[#1A1A1A] leading-relaxed">
                  {advice}
                </p>
              </div>
            )}

            {/* Practise this scam -> /?practice=<scenarioId> */}
            <div className="pt-2">
              <Link
                href={`/?practice=${result.drillId || 'olx-qr'}`}
                className="w-full min-h-[58px] py-3.5 px-6 bg-[#E8590C] text-white text-xl sm:text-2xl font-black rounded-[16px] border-2 border-[#1A1A1A] shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <span>{t('practise_this_scam', lang)}</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Card>
        )}

        {/* Footer */}
        <footer className="border-t border-[#1A1A1A]/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-base text-[#1A1A1A]/70 gap-3">
          <span>{t('check_footer_rules', lang)}</span>
          <Link href="/" className="hover:underline font-bold text-[#0F6B4F]">
            {t('back_to_practice', lang)}
          </Link>
        </footer>
      </div>
    </AppShell>
  );
}
