'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';

interface LedgerRow {
  component: string;
  label: string;
  badgeClass: string;
  simplification: string;
}

// Reality Ledger table remains in English per specification:
// "Only these may stay English: the brand CHAUKAS, URLs, "1930", GlassBox log lines, and the /judge Reality Ledger table."
const REALITY_LEDGER: LedgerRow[] = [
  {
    component: 'Engine, linter, scoring, tests',
    label: 'Production-grade',
    badgeClass: 'bg-[#12B76A] text-white',
    simplification: '—',
  },
  {
    component: '3 scenarios',
    label: 'MVP',
    badgeClass: 'bg-[#111111] text-white',
    simplification: 'Scripts follow public advisories; need review by a cyber-cell or bank fraud team',
  },
  {
    component: 'Phone surfaces',
    label: 'MVP shortcut',
    badgeClass: 'bg-[#FF5A1F] text-white',
    simplification: 'Generic skins, one frame → device-accurate variants, richer call UI',
  },
  {
    component: 'Voice',
    label: 'MVP shortcut',
    badgeClass: 'bg-[#FF5A1F] text-white',
    simplification: 'Pre-generated synthetic Hindi clips (non-commercial voices) with browser TTS fallback → replace with voice actors',
  },
  {
    component: 'Telemetry + /insights',
    label: 'MVP shortcut',
    badgeClass: 'bg-[#FF5A1F] text-white',
    simplification: 'In-memory rate limit, self-selected sample → durable limiter, consented cohorts',
  },
  {
    component: '/check rules',
    label: 'MVP shortcut',
    badgeClass: 'bg-[#FF5A1F] text-white',
    simplification: '~12 patterns, 16 fixtures → 200+ labelled messages, reported precision/recall',
  },
  {
    component: 'LLM explanation',
    label: 'Not built',
    badgeClass: 'bg-neutral-200 text-[#111111]',
    simplification: '/check is rules-only in this version',
  },
  {
    component: '"Videocall"',
    label: 'Demo mock',
    badgeClass: 'bg-amber-100 text-amber-900 border border-amber-400',
    simplification: 'Avatar + backdrop, no video. Disclosed on /judge',
  },
  {
    component: 'Long-term fraud reduction',
    label: 'Not claimed',
    badgeClass: 'bg-neutral-100 text-neutral-600 border border-neutral-300',
    simplification: 'Needs a follow-up study (§14)',
  },
];

export default function JudgePage() {
  const [lang] = useLang();

  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] p-3 min-[400px]:p-4 md:p-10 max-w-4xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between border-b-2 border-[#111111] pb-4 gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <Link
            href="/"
            className="font-mono font-bold tracking-tight text-xl bg-[#111111] text-[#F6F3EC] px-2 py-0.5 rounded-sm hover:opacity-90"
          >
            CHAUKAS
          </Link>
          <span className="font-mono text-sm text-[#111111]/70 font-semibold">
            / JUDGE
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0 text-xs md:text-sm font-bold">
          <LangToggle />
          <Link href="/drill" className="hover:underline">
            {t('drills_nav', lang)}
          </Link>
          <Link href="/check" className="hover:underline">
            {t('message_checker_nav', lang)}
          </Link>
          <Link href="/insights" className="hover:underline">
            {t('live_insights_nav', lang)}
          </Link>
        </div>
      </header>

      {/* Guide Section */}
      <section className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 space-y-5 sm:space-y-6">
        <div className="space-y-1">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm leading-normal">
            {t('evaluation_guide_tag', lang)}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
            {t('two_minutes_title', lang)}
          </h1>
          <p className="text-sm text-[#111111]/70">
            {t('two_minutes_desc', lang)}
          </p>
        </div>

        {/* 4 Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1 */}
          <div className="bg-[#F6F3EC] border-2 border-[#111111] rounded-md p-4 shadow-hard-sm space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white font-mono font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-sm text-[#111111]">
                  {t('step1_title', lang)}
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                {t('step1_desc', lang)}
              </p>
            </div>
            <Link
              href="/drill?only=olx-qr"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-[#FF5A1F] text-white font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:opacity-95 transition-all"
            >
              {t('step1_btn', lang)}
            </Link>
          </div>

          {/* Step 2 */}
          <div className="bg-[#F6F3EC] border-2 border-[#111111] rounded-md p-4 shadow-hard-sm space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white font-mono font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-sm text-[#111111]">
                  {t('step2_title', lang)}
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                {t('step2_desc', lang)}
              </p>
            </div>
            <Link
              href="/check"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-white text-[#111111] font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:bg-[#F6F3EC] transition-all"
            >
              {t('step2_btn', lang)}
            </Link>
          </div>

          {/* Step 3 */}
          <div className="bg-[#F6F3EC] border-2 border-[#111111] rounded-md p-4 shadow-hard-sm space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white font-mono font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-sm text-[#111111]">
                  {t('step3_title', lang)}
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                {t('step3_desc', lang)}
              </p>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-white text-[#111111] font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:bg-[#F6F3EC] transition-all"
            >
              {t('step3_btn', lang)}
            </Link>
          </div>

          {/* Step 4 */}
          <div className="bg-[#F6F3EC] border-2 border-[#111111] rounded-md p-4 shadow-hard-sm space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FF5A1F] text-white font-mono font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <span className="font-bold text-sm text-[#111111]">
                  {t('step4_title', lang)}
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                {t('step4_desc', lang)}
              </p>
            </div>
            <a
              href="https://github.com/kambojmayan-png/chaukas"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-[#111111] text-[#F6F3EC] font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:bg-[#222222] transition-all"
            >
              {t('step4_btn', lang)}
            </a>
          </div>
        </div>
      </section>

      {/* Reality Ledger Section */}
      <section className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 space-y-5 sm:space-y-6">
        <div className="space-y-1">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
            SECTION 12
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111111]">
            {t('reality_ledger_title', lang)}
          </h2>
          <p className="text-xs text-[#111111]/70 font-mono">
            {t('reality_ledger_desc', lang)}
          </p>
        </div>

        {/* Reality Ledger Table */}
        <div className="overflow-x-auto border-2 border-[#111111] rounded-md">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[#F6F3EC] font-mono uppercase tracking-wider">
                <th className="p-3 border-r border-[#111111]/40">Component</th>
                <th className="p-3 border-r border-[#111111]/40 w-36">Status</th>
                <th className="p-3">Simplification & Upgrade Path</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111]/15 font-mono">
              {REALITY_LEDGER.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F6F3EC]'}
                >
                  <td className="p-3 font-bold text-[#111111] border-r border-[#111111]/15">
                    {row.component}
                  </td>
                  <td className="p-3 border-r border-[#111111]/15">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${row.badgeClass}`}
                    >
                      {row.label}
                    </span>
                  </td>
                  <td className="p-3 text-[#111111]/90 leading-relaxed">
                    {row.simplification}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GitHub Repository Card */}
      <section className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#111111]">
              {t('repo_card_title', lang)}
            </h3>
            <p className="text-xs text-[#111111]/70 font-mono">
              {t('repo_card_desc', lang)}
            </p>
          </div>
          <a
            href="https://github.com/kambojmayan-png/chaukas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 bg-[#FF5A1F] text-white font-bold text-xs sm:text-sm border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all break-all text-center"
          >
            <span>github.com/kambojmayan-png/chaukas</span>
            <span className="ml-1.5 shrink-0">↗</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-2">
        <span>{t('judge_footer', lang)}</span>
        <Link href="/" className="hover:underline font-bold">
          {t('back_to_home', lang)}
        </Link>
      </footer>
    </main>
  );
}
