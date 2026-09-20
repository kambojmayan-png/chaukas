'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { checkMessage, type CheckResult, type Flag, type Finding } from '@/check/rules';
import { useLang } from '@/lib/useLang';
import { t, getFlagLabel } from '@/lib/i18n';
import { AppShell, Card, Chip, Button, PageTitle } from '@/ui';
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
          className="bg-[#FFF2EB] text-[#E8590C] border-b-2 border-[#E8590C] px-1.5 py-0.5 rounded font-semibold inline"
        >
          {highlighted}
          <span className="ml-1.5 text-xs font-semibold bg-[#E8590C] text-white px-2 py-0.5 rounded-full inline-block align-middle leading-normal">
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
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Page Title */}
        <PageTitle
          tag={<Chip variant="green">/check</Chip>}
          title={t('check_page_title', lang)}
          subtitle={t('check_page_desc', lang)}
        />

        {/* Try an Example Chips */}
        <div className="space-y-2.5">
          <span className="text-sm font-bold text-[#1A1A1A]/75 block">
            {t('try_an_example', lang)}:
          </span>
          <div className="flex flex-wrap gap-2.5">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex.text)}
                className="text-sm font-semibold bg-white text-[#1A1A1A] border border-[#1A1A1A]/15 rounded-[12px] shadow-[0_2px_6px_rgba(26,26,26,0.04)] px-4 py-2.5 min-h-[48px] hover:bg-[#FBF7F0] hover:border-[#1A1A1A]/30 active:scale-[0.98] transition-all cursor-pointer text-left"
              >
                {t(ex.labelKey, lang)}
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
              className="w-full bg-white text-[#1A1A1A] border border-[#1A1A1A]/20 rounded-[16px] shadow-[0_2px_10px_rgba(26,26,26,0.04)] p-4 sm:p-5 text-base sm:text-lg resize-y focus:outline-hidden focus:border-[#0F6B4F] focus:ring-2 focus:ring-[#0F6B4F]/20 transition-all"
            />
            <div className="absolute bottom-3 right-3 text-xs text-[#1A1A1A]/50 bg-white/90 px-2 py-0.5 rounded-md">
              {text.length}/1000
            </div>
          </div>

          {/* Privacy Notice under the box */}
          <p className="text-sm text-[#1A1A1A]/70">
            {t('check_privacy_notice', lang)}
          </p>
        </div>

        {/* Check Button */}
        <div>
          <Button
            type="button"
            onClick={handleCheck}
            disabled={!text.trim()}
            variant="primary"
            className="w-full text-lg"
          >
            <span>{t('check_message_button', lang)}</span>
            <span className="ml-2">🔍</span>
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <Card className="space-y-5 animate-in fade-in duration-300">
            {/* Verdict */}
            <div className="space-y-2">
              <span className="text-sm font-bold text-[#1A1A1A]/75 block">
                {t('verdict', lang)}
              </span>

              {result.verdict === 'likely_scam' && (
                <Chip variant="red" className="text-base sm:text-lg px-4 py-1.5 font-bold">
                  {t('likely_scam', lang)}
                </Chip>
              )}

              {result.verdict === 'suspicious' && (
                <Chip variant="saffron" className="text-base sm:text-lg px-4 py-1.5 font-bold">
                  {t('suspicious', lang)}
                </Chip>
              )}

              {result.verdict === 'no_red_flags_found' && (
                <Chip variant="guide" className="text-base sm:text-lg px-4 py-1.5 font-bold">
                  {t('no_red_flags_found', lang)}
                </Chip>
              )}

              {/* Advice Line by Archetype */}
              {advice && (
                <p className="text-base sm:text-lg font-semibold text-[#1A1A1A] bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] mt-3 leading-relaxed">
                  {advice}
                </p>
              )}
            </div>

            {/* Highlighted Findings in Text */}
            <div className="space-y-2">
              <span className="text-sm font-bold text-[#1A1A1A]/75 block">
                {t('analysis_red_flags', lang)}
              </span>
              <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 sm:p-5 rounded-[14px] text-base leading-relaxed break-words whitespace-pre-wrap">
                {renderHighlightedText()}
              </div>
            </div>

            {/* Drill Action Button */}
            <div className="pt-3 border-t border-[#1A1A1A]/10">
              {result.drillId ? (
                <Button
                  href={`/drill?only=${result.drillId}`}
                  variant="secondary"
                  className="w-full text-base sm:text-lg"
                >
                  <span>{t('practise_exact_scam', lang)}</span>
                  <span className="ml-2">→</span>
                </Button>
              ) : (
                <Button
                  href="/drill"
                  variant="primary"
                  className="w-full text-base sm:text-lg"
                >
                  <span>{t('try_full_3min_drill', lang)}</span>
                  <span className="ml-2">→</span>
                </Button>
              )}
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
