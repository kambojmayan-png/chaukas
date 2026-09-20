'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { t } from '@/lib/i18n';
import { AppShell, Card, Chip, Button } from '@/ui';
import type { InsightsData } from '@/lib/supabaseAdmin';

interface ProofData {
  runs: number;
  gap: number | null;
  n: number;
}

export default function AboutPage() {
  const [lang] = useLang();
  const [proof, setProof] = useState<ProofData | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/insights')
      .then(res => {
        if (!res.ok) return null;
        return res.json() as Promise<InsightsData>;
      })
      .then(data => {
        if (!isMounted || !data || !data.available || !data.totals) return;
        const firstRuns = data.totals.first_runs ?? 0;
        if (firstRuns < 10) return;
        const totalRuns = data.totals.total_runs ?? firstRuns;
        const gap = data.totals.gap_pct;
        const n = data.totals.knew_rule_first ?? 0;
        setProof({ runs: totalRuns, gap, n });
      })
      .catch(() => {
        // never throw, do nothing
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppShell>
      <div className="space-y-10 pb-12">
        {/* 1. About Lead */}
        <section className="bg-white rounded-[16px] border border-[#1A1A1A]/10 shadow-[0_2px_12px_rgba(26,26,26,0.06)] p-6 sm:p-8">
          <p className="text-xl sm:text-2xl md:text-[26px] font-bold text-[#1A1A1A] leading-relaxed">
            {t('about_lead', lang)}
          </p>
        </section>

        {/* 2. How it works in three short steps */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {t('how_it_works_title', lang)}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <Card className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#E6F3EE] text-[#0F6B4F] font-bold text-lg flex items-center justify-center">
                  1
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  {t('how_it_works_step1_title', lang)}
                </h3>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('how_it_works_step1_desc', lang)}
                </p>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#FFF2EB] text-[#E8590C] font-bold text-lg flex items-center justify-center">
                  2
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  {t('how_it_works_step2_title', lang)}
                </h3>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('how_it_works_step2_desc', lang)}
                </p>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#EBFBEE] text-[#2B8A3E] font-bold text-lg flex items-center justify-center">
                  3
                </div>
                <h3 className="text-lg font-bold text-[#1A1A1A] leading-snug">
                  {t('how_it_works_step3_title', lang)}
                </h3>
                <p className="text-base text-[#1A1A1A]/80 leading-relaxed">
                  {t('how_it_works_step3_desc', lang)}
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* 3. Why practise */}
        <section className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
            {t('why_practise_title', lang)}
          </h2>
          <Card className="space-y-4">
            <div className="space-y-2">
              <p className="text-lg sm:text-xl font-bold text-[#C92A2A] leading-snug">
                {t('landing_stat_line', lang)}{' '}
                <a
                  href="https://the420.in/india-upi-fraud-data-fy26-parliament-digital-payments/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-base text-[#0F6B4F] underline hover:text-[#1A1A1A] inline font-semibold"
                >
                  ({t('landing_stat_source', lang)})
                </a>
              </p>
              <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-relaxed pt-1">
                {t('landing_root_cause', lang)}
              </p>
            </div>

            {/* Live proof chip */}
            {proof && (
              <div className="pt-2">
                <Link
                  href="/insights"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#FBF7F0] border border-[#1A1A1A]/15 rounded-[16px] text-sm font-bold text-[#1A1A1A] hover:bg-white shadow-[0_2px_8px_rgba(26,26,26,0.04)] active:scale-[0.98] transition-all min-h-[48px] max-w-full break-words [overflow-wrap:anywhere]"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2B8A3E] animate-pulse shrink-0" />
                  <span className="break-words [overflow-wrap:anywhere]">
                    {proof.n > 0 && proof.gap !== null
                      ? t('proof_gap_line', lang, {
                          runs: proof.runs,
                          gap: proof.gap,
                          n: proof.n,
                        })
                      : t('proof_drills_played', lang, { runs: proof.runs })}
                  </span>
                </Link>
              </div>
            )}
          </Card>
        </section>

        {/* 4. For judges & developers */}
        <section className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              {t('for_judges_devs_title', lang)}
            </h2>
            <p className="text-base sm:text-lg text-[#1A1A1A]/75">
              {t('for_judges_devs_desc', lang)}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Judge Link */}
            <Card hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    {t('judge_card_title', lang)}
                  </h3>
                  <Chip variant="guide">/judge</Chip>
                </div>
                <p className="text-base text-[#1A1A1A]/80">
                  {t('judge_card_desc', lang)}
                </p>
              </div>
              <Button href="/judge?lang=en" variant="secondary" className="w-full text-base">
                {t('judging_link', lang)}
              </Button>
            </Card>

            {/* Drill Link */}
            <Card hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    {t('drill_card_title', lang)}
                  </h3>
                  <Chip variant="saffron">/drill</Chip>
                </div>
                <p className="text-base text-[#1A1A1A]/80">
                  {t('drill_card_desc', lang)}
                </p>
              </div>
              <Button href="/drill" variant="secondary" className="w-full text-base">
                {t('start_3min_drill', lang)} →
              </Button>
            </Card>

            {/* Insights Link */}
            <Card hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    {t('insights_card_title', lang)}
                  </h3>
                  <Chip variant="amber">/insights</Chip>
                </div>
                <p className="text-base text-[#1A1A1A]/80">
                  {t('insights_card_desc', lang)}
                </p>
              </div>
              <Button href="/insights" variant="secondary" className="w-full text-base">
                {t('live_insights_nav', lang)} →
              </Button>
            </Card>

            {/* Check Link */}
            <Card hoverEffect className="flex flex-col justify-between space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    {t('check_card_title', lang)}
                  </h3>
                  <Chip variant="green">/check</Chip>
                </div>
                <p className="text-base text-[#1A1A1A]/80">
                  {t('check_card_desc', lang)}
                </p>
              </div>
              <Button href="/check" variant="secondary" className="w-full text-base">
                {t('check_a_message', lang)}
              </Button>
            </Card>

            {/* GitHub Link */}
            <Card hoverEffect className="flex flex-col justify-between space-y-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#1A1A1A]">
                    {t('github_card_title', lang)}
                  </h3>
                  <p className="text-base text-[#1A1A1A]/80">
                    {t('github_card_desc', lang)}
                  </p>
                </div>
                <a
                  href="https://github.com/kambojmayan-png/chaukas"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center min-h-[48px] px-5 py-2.5 bg-[#1A1A1A] text-white font-bold text-xs sm:text-base rounded-[14px] shadow-[0_2px_8px_rgba(26,26,26,0.15)] hover:bg-[#333333] active:scale-[0.98] transition-all max-w-full break-all text-center"
                >
                  <span>github.com/kambojmayan-png/chaukas</span>
                  <span className="ml-2 shrink-0">↗</span>
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#1A1A1A]/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-base text-[#1A1A1A]/70 gap-3">
          <span>{t('footer_copy', lang)}</span>
          <span className="text-sm">{t('landing_footer', lang)}</span>
        </footer>
      </div>
    </AppShell>
  );
}
