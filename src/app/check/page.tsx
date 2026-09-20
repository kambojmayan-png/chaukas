'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { checkMessage, type CheckResult, type Flag, type Finding } from '@/check/rules';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t, getFlagLabel } from '@/lib/i18n';
import type { Lang } from '@/engine/engine';

function getAdvice(result: CheckResult, lang: Lang): string | null {
  if (result.verdict === 'no_red_flags_found' || result.flags.length === 0) {
    return null;
  }
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

const EXAMPLES = [
  {
    label: { en: '⚡ Electricity Disconnection SMS', hi: '⚡ बिजली कटने का SMS' },
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9.30 pm because your previous month bill was not updated. Please immediately contact our electricity officer 8240471159. Thank you.',
  },
  {
    label: { en: '🏦 SBI KYC Link SMS', hi: '🏦 SBI KYC लिंक SMS' },
    text: 'Dear customer your SBI account will be blocked today. Update your KYC immediately: http://sbi-kyc-update.top/login',
  },
  {
    label: { en: '🛡️ Genuine Bank OTP SMS', hi: '🛡️ असली बैंक OTP SMS' },
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
  const [lang] = useLang();

  const handleCheck = () => {
    if (!text.trim()) return;
    const res = checkMessage(text);
    setResult(res);
  };

  const handleExampleClick = (exampleText: string) => {
    setText(exampleText);
    const res = checkMessage(exampleText);
    setResult(res);
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
          className="bg-[#FF5A1F]/20 text-[#111111] border-b-2 border-[#FF5A1F] px-1 py-0.5 rounded-xs font-semibold inline"
        >
          {highlighted}
          <span className="ml-1.5 text-[10px] font-mono font-bold uppercase bg-[#FF5A1F] text-white px-1.5 py-0.5 rounded tracking-wider inline-block align-middle">
            {span.flags.map(f => getFlagLabel(f, lang)).join(', ')}
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
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] p-4 md:p-10 flex flex-col justify-between max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between border-b-2 border-[#111111] pb-4 mb-6 gap-3">
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="font-mono font-bold tracking-tight text-xl bg-[#111111] text-[#F6F3EC] px-2 py-0.5 rounded-sm hover:opacity-90"
          >
            CHAUKAS
          </Link>
          <span className="font-mono text-sm text-[#111111]/70 font-semibold">
            / CHECK
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LangToggle />
          <Link
            href="/drill"
            className="text-sm font-bold text-[#111111] hover:underline whitespace-nowrap"
          >
            {t('start_3min_drill', lang)} →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="my-auto py-4 space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
            {t('message_inspector_tag', lang)}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111111]">
            {t('check_page_title', lang)}
          </h1>
          <p className="text-sm text-[#111111]/70">
            {t('check_page_desc', lang)}
          </p>
        </div>

        {/* Try an Example Chips */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
            {t('try_an_example', lang)}:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex.text)}
                className="text-xs font-semibold bg-white text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm px-3 py-1.5 hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-left"
              >
                {ex.label[lang] || ex.label.en}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input Box */}
        <div className="space-y-2">
          <div className="relative">
            <textarea
              value={text}
              maxLength={1000}
              onChange={e => {
                setText(e.target.value);
                if (result) setResult(null); // Clear previous result on edit
              }}
              placeholder={t('paste_message_placeholder', lang)}
              rows={5}
              className="w-full bg-white text-[#111111] border-2 border-[#111111] rounded-md shadow-hard p-4 text-sm md:text-base font-mono resize-y focus:outline-hidden"
            />
            <div className="absolute bottom-3 right-3 text-xs font-mono text-[#111111]/60 bg-white/90 px-1 rounded">
              {text.length}/1000
            </div>
          </div>

          {/* Privacy Notice under the box */}
          <p className="text-xs text-[#111111]/70 font-mono">
            {t('check_privacy_notice', lang)}
          </p>
        </div>

        {/* Check Button */}
        <div>
          <button
            type="button"
            onClick={handleCheck}
            disabled={!text.trim()}
            className={`w-full min-h-[48px] py-3 px-6 text-base font-bold border-2 border-[#111111] rounded-md shadow-hard flex items-center justify-center gap-2 transition-all ${
              text.trim()
                ? 'bg-[#FF5A1F] text-white hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none'
            }`}
          >
            <span>{t('check_message_button', lang)}</span>
            <span>🔍</span>
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 space-y-5 animate-in fade-in duration-300">
            {/* Verdict Chip */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
                {t('verdict', lang)}
              </span>

              {result.verdict === 'likely_scam' && (
                <div className="inline-block bg-[#D92D20] text-white font-bold text-sm md:text-base px-3.5 py-1.5 rounded-md border-2 border-[#111111] shadow-hard-sm">
                  {t('likely_scam', lang)}
                </div>
              )}

              {result.verdict === 'suspicious' && (
                <div className="inline-block bg-[#FF5A1F] text-white font-bold text-sm md:text-base px-3.5 py-1.5 rounded-md border-2 border-[#111111] shadow-hard-sm">
                  {t('suspicious', lang)}
                </div>
              )}

              {result.verdict === 'no_red_flags_found' && (
                <div className="inline-block bg-neutral-200 text-[#111111] font-bold text-sm md:text-base px-3.5 py-1.5 rounded-md border-2 border-[#111111] shadow-hard-sm">
                  {t('no_red_flags_found', lang)}
                </div>
              )}

              {/* Advice Line by Archetype */}
              {advice && (
                <p className="text-sm md:text-base font-semibold text-[#111111] bg-[#F6F3EC] border-2 border-[#111111] p-3 rounded-md shadow-hard-sm mt-2">
                  {advice}
                </p>
              )}
            </div>

            {/* Highlighted Findings in Text */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
                {t('analysis_red_flags', lang)}
              </span>
              <div className="bg-[#F6F3EC] border-2 border-[#111111] p-4 rounded-md text-sm md:text-base font-mono leading-relaxed break-words whitespace-pre-wrap">
                {renderHighlightedText()}
              </div>
            </div>

            {/* Drill Action Button */}
            <div className="pt-2 border-t-2 border-[#111111]/10">
              {result.drillId ? (
                <Link
                  href={`/drill?only=${result.drillId}`}
                  className="w-full min-h-[48px] py-3 px-4 bg-[#111111] text-[#F6F3EC] font-bold text-sm md:text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:bg-[#222222] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('practise_exact_scam', lang)}</span>
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  href="/drill"
                  className="w-full min-h-[48px] py-3 px-4 bg-[#FF5A1F] text-white font-bold text-sm md:text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>{t('try_full_3min_drill', lang)}</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-2">
        <span>{t('check_footer_rules', lang)}</span>
        <Link href="/" className="hover:underline font-bold">
          {t('back_to_home', lang)}
        </Link>
      </footer>
    </main>
  );
}
