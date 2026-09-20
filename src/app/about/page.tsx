'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';
import { spaceGrotesk } from '@/lib/fonts';
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
    <main className={`min-h-screen bg-[#F6F3EC] text-[#111111] flex flex-col justify-between p-4 min-[400px]:p-6 md:p-12 max-w-4xl mx-auto ${spaceGrotesk.variable}`}>
      {/* Top Notice: Detailed view for judges and developers */}
      <div className="w-full bg-[#E6F3EE] border-2 border-[#0F6B4F]/30 rounded-md p-2.5 text-center mb-4">
        <p className="text-xs sm:text-sm font-bold text-[#0F6B4F]">
          {t('detailed_view_banner', lang)}
        </p>
      </div>

      {/* Brand Header */}
      <header className="flex flex-wrap items-center justify-between border-b-2 border-[#111111] pb-4 gap-3">
        <Link href="/" className="flex items-center space-x-2 min-w-0 hover:opacity-90">
          <span lang="en" className="font-mono font-bold tracking-tight text-xl bg-[#111111] text-[#F6F3EC] px-2 py-0.5 rounded-sm">
            CHAUKAS
          </span>
          <span lang="hi" className="font-hindi text-sm font-semibold text-[#111111]/70 leading-normal">
            चौकस
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/judge"
            className="text-xs md:text-sm font-bold text-[#FF5A1F] hover:underline whitespace-nowrap"
          >
            {t('judging_nav_link', lang)}
          </Link>
          <LangToggle />
          <Link
            href="/check"
            className="text-xs md:text-sm font-bold text-[#111111] hover:underline"
          >
            {t('check_message_nav', lang)}
          </Link>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F] border border-[#FF5A1F] px-2 py-1 rounded leading-normal">
            {t('fire_drill_1_badge', lang)}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="my-auto py-8 min-[400px]:py-12 flex flex-col items-start space-y-6 min-[400px]:space-y-8 max-w-2xl">
        <div className="space-y-3 min-[400px]:space-y-4">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm leading-normal">
            {t('hero_tag', lang)}
          </div>
          <h1 className="text-3xl min-[400px]:text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1]">
            {t('hero_title', lang)}
          </h1>
          {/* Stat line & Root-cause line */}
          <div className="space-y-2 pt-1 max-w-xl">
            <p className="text-xs min-[400px]:text-sm md:text-base font-semibold text-[#111111]/90 leading-snug">
              {t('landing_stat_line', lang)}{' '}
              <a
                href="https://the420.in/india-upi-fraud-data-fy26-parliament-digital-payments/"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-[#FF5A1F] underline hover:text-[#111111] inline"
              >
                ({t('landing_stat_source', lang)})
              </a>
            </p>
            <p className="text-sm min-[400px]:text-base md:text-lg font-bold text-[#111111] leading-snug">
              {t('landing_root_cause', lang)}
            </p>
          </div>
        </div>

        {/* CTA Buttons & Live Proof Chip */}
        <div className="space-y-3 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/drill"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] px-8 py-4 bg-[#FF5A1F] text-white text-lg md:text-xl font-bold border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-center"
            >
              {t('start_3min_drill', lang)}
            </Link>
            <Link
              href="/check"
              className="w-full sm:w-auto inline-flex items-center justify-center min-h-[56px] px-6 py-4 bg-white text-[#111111] text-base md:text-lg font-bold border-2 border-[#111111] rounded-md shadow-hard hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-center"
            >
              {t('check_a_message', lang)}
            </Link>
          </div>

          {/* Live proof chip under CTA */}
          {proof && (
            <div>
              <Link
                href="/insights"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border-2 border-[#111111] rounded-full text-xs font-mono font-bold text-[#111111] shadow-hard-sm hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 transition-all max-w-full leading-normal"
              >
                <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse shrink-0" />
                <span className="truncate">
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
        </div>

        {/* Security / Privacy line */}
        <p className="text-sm md:text-base text-[#111111]/80 font-medium max-w-lg border-l-2 border-[#111111] pl-3">
          {t('hero_disclaimer', lang)}
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-3">
        <span>{t('footer_copy', lang)}</span>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/judge" className="hover:underline font-bold text-[#FF5A1F]">
            {t('judging_link', lang)}
          </Link>
          <Link href="/check" className="hover:underline font-bold">
            {t('message_checker_nav', lang)}
          </Link>
          <Link href="/insights" className="hover:underline font-bold">
            {t('live_insights_nav', lang)}
          </Link>
          <span>{t('landing_footer', lang)}</span>
        </div>
      </footer>
    </main>
  );
}
