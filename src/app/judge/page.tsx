'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { t } from '@/lib/i18n';
import { AppShell, Card, Chip, Button, PageTitle } from '@/ui';

interface LedgerRow {
  component: string;
  label: string;
  badgeVariant: 'green' | 'neutral' | 'saffron' | 'amber';
  simplification: string;
}

// Reality Ledger table remains in English per specification:
// "Only these may stay English: the brand CHAUKAS, URLs, "1930", GlassBox log lines, and the /judge Reality Ledger table."
const REALITY_LEDGER: LedgerRow[] = [
  {
    component: 'Engine, linter, scoring, tests',
    label: 'Production-grade',
    badgeVariant: 'green',
    simplification: '—',
  },
  {
    component: '3 scenarios',
    label: 'MVP',
    badgeVariant: 'neutral',
    simplification: 'Scripts follow public advisories; need review by a cyber-cell or bank fraud team',
  },
  {
    component: 'Phone surfaces',
    label: 'MVP shortcut',
    badgeVariant: 'saffron',
    simplification: 'Generic skins, one frame → device-accurate variants, richer call UI',
  },
  {
    component: 'Voice',
    label: 'MVP shortcut',
    badgeVariant: 'saffron',
    simplification: 'Pre-generated synthetic Hindi clips (non-commercial voices) with browser TTS fallback → replace with voice actors',
  },
  {
    component: 'Telemetry + /insights',
    label: 'MVP shortcut',
    badgeVariant: 'saffron',
    simplification: 'In-memory rate limit, self-selected sample → durable limiter, consented cohorts',
  },
  {
    component: '/check rules',
    label: 'MVP shortcut',
    badgeVariant: 'saffron',
    simplification: '~12 patterns, 16 fixtures → 200+ labelled messages, reported precision/recall',
  },
  {
    component: 'LLM explanation',
    label: 'Not built',
    badgeVariant: 'neutral',
    simplification: '/check is rules-only in this version',
  },
  {
    component: '"Videocall"',
    label: 'Demo mock',
    badgeVariant: 'amber',
    simplification: 'Avatar + backdrop, no video. Disclosed on /judge',
  },
  {
    component: 'Long-term fraud reduction',
    label: 'Not claimed',
    badgeVariant: 'neutral',
    simplification: 'Needs a follow-up study (§14)',
  },
];

export default function JudgePage() {
  const [lang] = useLang();

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Page Title */}
        <PageTitle
          tag={<Chip variant="guide">/judge</Chip>}
          title={t('two_minutes_title', lang)}
          subtitle={t('two_minutes_desc', lang)}
        />

        {/* Update notice */}
        <Card className="bg-[#FFF9DB] border-amber-200 space-y-1">
          <p className="text-sm font-bold text-[#E67700]">
            UPDATE · 2:00 PM
          </p>
          <p className="text-base sm:text-lg font-semibold text-[#1A1A1A] leading-relaxed">
            {t('judge_change_notice', lang)}
          </p>
        </Card>

        {/* 2-Minute Evaluation Guide Steps */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
            {t('evaluation_guide_tag', lang)}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 0 */}
            <Card className="md:col-span-2 flex flex-col justify-between space-y-4 bg-[#FFF9DB]/40 border-amber-200">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white font-bold text-sm flex items-center justify-center">
                    0
                  </span>
                  <span className="font-bold text-lg text-[#1A1A1A]">
                    {t('step0_title', lang)}
                  </span>
                </div>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('step0_desc', lang)}
                </p>
              </div>
              <Button href="/" variant="primary" className="self-start text-base">
                {t('step0_btn', lang)}
              </Button>
            </Card>

            {/* Step 1 */}
            <Card className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#E8590C] text-white font-bold text-sm flex items-center justify-center">
                    1
                  </span>
                  <span className="font-bold text-lg text-[#1A1A1A]">
                    {t('step1_title', lang)}
                  </span>
                </div>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('step1_desc', lang)}
                </p>
              </div>
              <Button href="/drill?only=olx-qr" variant="secondary" className="w-full text-base">
                {t('step1_btn', lang)}
              </Button>
            </Card>

            {/* Step 2 */}
            <Card className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#E8590C] text-white font-bold text-sm flex items-center justify-center">
                    2
                  </span>
                  <span className="font-bold text-lg text-[#1A1A1A]">
                    {t('step2_title', lang)}
                  </span>
                </div>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('step2_desc', lang)}
                </p>
              </div>
              <Button href="/check" variant="secondary" className="w-full text-base">
                {t('step2_btn', lang)}
              </Button>
            </Card>

            {/* Step 3 */}
            <Card className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#E8590C] text-white font-bold text-sm flex items-center justify-center">
                    3
                  </span>
                  <span className="font-bold text-lg text-[#1A1A1A]">
                    {t('step3_title', lang)}
                  </span>
                </div>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('step3_desc', lang)}
                </p>
              </div>
              <Button href="/insights" variant="secondary" className="w-full text-base">
                {t('step3_btn', lang)}
              </Button>
            </Card>

            {/* Step 4 */}
            <Card className="flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-[#E8590C] text-white font-bold text-sm flex items-center justify-center">
                    4
                  </span>
                  <span className="font-bold text-lg text-[#1A1A1A]">
                    {t('step4_title', lang)}
                  </span>
                </div>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('step4_desc', lang)}
                </p>
              </div>
              <a
                href="https://github.com/kambojmayan-png/chaukas"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center min-h-[48px] px-5 py-2.5 bg-[#1A1A1A] text-white font-bold text-xs sm:text-base rounded-[14px] shadow-[0_2px_8px_rgba(26,26,26,0.15)] hover:bg-[#333333] active:scale-[0.98] transition-all w-full max-w-full break-all text-center"
              >
                {t('step4_btn', lang)}
              </a>
            </Card>
          </div>
        </section>

        {/* Reality Ledger Section */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#1A1A1A] tracking-tight">
              {t('reality_ledger_title', lang)}
            </h2>
            <p className="text-base text-[#1A1A1A]/75">
              {t('reality_ledger_desc', lang)}
            </p>
          </div>

          {/* Reality Ledger Table in clean Card */}
          <Card className="p-0 overflow-hidden">
            <div lang="en" className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#FBF7F0] text-[#1A1A1A] border-b border-[#1A1A1A]/15 font-bold">
                    <th className="p-4 border-r border-[#1A1A1A]/10">Component</th>
                    <th className="p-4 border-r border-[#1A1A1A]/10 w-36">Status</th>
                    <th className="p-4">Simplification & Upgrade Path</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/10">
                  {REALITY_LEDGER.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-white' : 'bg-[#FBF7F0]/50'}
                    >
                      <td className="p-4 font-bold text-[#1A1A1A] border-r border-[#1A1A1A]/10">
                        {row.component}
                      </td>
                      <td className="p-4 border-r border-[#1A1A1A]/10 whitespace-nowrap">
                        <Chip variant={row.badgeVariant}>{row.label}</Chip>
                      </td>
                      <td className="p-4 text-[#1A1A1A]/85 leading-relaxed">
                        {row.simplification}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* GitHub Repository Card */}
        <Card hoverEffect className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#1A1A1A]">
                {t('repo_card_title', lang)}
              </h3>
              <p className="text-base text-[#1A1A1A]/75">
                {t('repo_card_desc', lang)}
              </p>
            </div>
            <a
              href="https://github.com/kambojmayan-png/chaukas"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center min-h-[48px] px-5 py-2.5 bg-[#E8590C] text-white font-bold text-xs sm:text-base rounded-[14px] shadow-[0_2px_10px_rgba(232,89,12,0.2)] hover:bg-[#D44F0A] active:scale-[0.98] transition-all break-all text-center max-w-full"
            >
              <span>github.com/kambojmayan-png/chaukas</span>
              <span className="ml-2 shrink-0">↗</span>
            </a>
          </div>
        </Card>

        {/* Footer */}
        <footer className="border-t border-[#1A1A1A]/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-base text-[#1A1A1A]/70 gap-3">
          <span>{t('judge_footer', lang)}</span>
          <Link href="/" className="hover:underline font-bold text-[#0F6B4F]">
            {t('back_to_practice', lang)}
          </Link>
        </footer>
      </div>
    </AppShell>
  );
}
