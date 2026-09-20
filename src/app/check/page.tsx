'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { checkMessage, type CheckResult, type Flag, type Finding } from '@/check/rules';
import type { Lang } from '@/engine/engine';

const FLAG_LABELS: Record<Flag, { en: string; hi: string }> = {
  urgency: { en: 'Urgency', hi: 'जल्दबाज़ी' },
  fear: { en: 'Fear / Threat', hi: 'डर / धमकी' },
  authority: { en: 'Fake Authority', hi: 'फ़र्ज़ी अधिकारी' },
  secrecy: { en: 'Secrecy', hi: 'गोपनीयता' },
  too_good: { en: 'Too Good to Be True', hi: 'लुभावना ऑफ़र' },
  pin_to_receive: { en: 'PIN to Receive', hi: 'पैसे पाने के लिए PIN' },
  otp_request: { en: 'OTP Request', hi: 'OTP माँगना' },
  remote_app: { en: 'Remote Access App', hi: 'रिमोट एक्सेस ऐप' },
  unofficial_contact: { en: 'Unofficial Number', hi: 'अनौपचारिक नंबर' },
  pay_to_verify: { en: 'Pay to Verify', hi: 'वेरिफिकेशन के लिए भुगतान' },
  bad_link: { en: 'Suspicious Link', hi: 'संदिग्ध लिंक' },
  money_request: { en: 'Asks you to send money', hi: 'पैसे भेजने को कहता है' },
  new_number: { en: 'Claims a new number or broken phone', hi: 'नया नंबर या फ़ोन ख़राब होने का दावा' },
};

function getAdvice(result: CheckResult): string | null {
  if (result.verdict === 'no_red_flags_found' || result.flags.length === 0) {
    return null;
  }
  switch (result.archetype) {
    case 'money_request':
      return 'Before sending anything, call the person on a number you ALREADY have saved. Never pay because a message told you to.';
    case 'digital_arrest':
      return 'No agency arrests or questions anyone over a call. Cut the call and dial 1930.';
    case 'utility_kyc_remote':
      return 'Check only in the official app or office. Never install an app or share an OTP for a \'bill update\' or KYC.';
    case 'receive_money_pin':
    case 'reward_refund':
      return 'You never need a PIN, a QR scan or an \'Approve\' tap to RECEIVE money.';
    default:
      return 'Do not reply, click or pay. Verify through an official channel you look up yourself.';
  }
}

const EXAMPLES = [
  {
    label: '⚡ Electricity Disconnection SMS',
    text: 'Dear Consumer, your electricity power will be disconnected tonight at 9.30 pm because your previous month bill was not updated. Please immediately contact our electricity officer 8240471159. Thank you.',
  },
  {
    label: '🏦 SBI KYC Link SMS',
    text: 'Dear customer your SBI account will be blocked today. Update your KYC immediately: http://sbi-kyc-update.top/login',
  },
  {
    label: '🛡️ Genuine Bank OTP SMS',
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
  const [lang, setLang] = useState<Lang>('en');

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
  const advice = result ? getAdvice(result) : null;

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
            {span.flags.map(f => FLAG_LABELS[f]?.[lang] || FLAG_LABELS[f]?.en || f).join(', ')}
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
      <header className="flex items-center justify-between border-b-2 border-[#111111] pb-4 mb-6">
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
          <Link
            href="/drill"
            className="text-sm font-bold text-[#111111] hover:underline"
          >
            Take the Drill →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="my-auto py-4 space-y-6">
        {/* Title */}
        <div className="space-y-1">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
            MESSAGE INSPECTOR
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#111111]">
            Check a suspicious message
          </h1>
          <p className="text-sm text-[#111111]/70">
            Paste an SMS, WhatsApp message, or email to detect social engineering pressure tactics.
          </p>
        </div>

        {/* Try an Example Chips */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
            Try an example:
          </span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleExampleClick(ex.text)}
                className="text-xs font-semibold bg-white text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm px-3 py-1.5 hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer text-left"
              >
                {ex.label}
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
              placeholder="Paste suspicious SMS or WhatsApp message here..."
              rows={5}
              className="w-full bg-white text-[#111111] border-2 border-[#111111] rounded-md shadow-hard p-4 text-sm md:text-base font-mono resize-y focus:outline-hidden"
            />
            <div className="absolute bottom-3 right-3 text-xs font-mono text-[#111111]/60 bg-white/90 px-1 rounded">
              {text.length}/1000
            </div>
          </div>

          {/* Privacy Notice under the box */}
          <p className="text-xs text-[#111111]/70 font-mono">
            Pasted text is checked locally in your browser. Nothing you paste is sent anywhere.
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
            <span>Check Message</span>
            <span>🔍</span>
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 space-y-5 animate-in fade-in duration-300">
            {/* Verdict Chip */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70 block">
                Verdict
              </span>

              {result.verdict === 'likely_scam' && (
                <div className="inline-block bg-[#D92D20] text-white font-bold text-sm md:text-base px-3.5 py-1.5 rounded-md border-2 border-[#111111] shadow-hard-sm">
                  Likely a scam
                </div>
              )}

              {result.verdict === 'suspicious' && (
                <div className="inline-block bg-[#FF5A1F] text-white font-bold text-sm md:text-base px-3.5 py-1.5 rounded-md border-2 border-[#111111] shadow-hard-sm">
                  Suspicious
                </div>
              )}

              {result.verdict === 'no_red_flags_found' && (
                <div className="inline-block bg-neutral-200 text-[#111111] font-bold text-sm md:text-base px-3.5 py-1.5 rounded-md border-2 border-[#111111] shadow-hard-sm">
                  No red flags found — that is not the same as safe
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
                Analysis & Red Flags
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
                  <span>Practise this exact scam</span>
                  <span>→</span>
                </Link>
              ) : (
                <Link
                  href="/drill"
                  className="w-full min-h-[48px] py-3 px-4 bg-[#FF5A1F] text-white font-bold text-sm md:text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <span>Try the full 3-minute drill</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-2">
        <span>© 2026 Chaukas · 100% Client-Side Rules Engine</span>
        <Link href="/" className="hover:underline font-bold">
          ← Back to Home
        </Link>
      </footer>
    </main>
  );
}
