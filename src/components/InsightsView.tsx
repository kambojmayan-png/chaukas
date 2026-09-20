'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';
import { spaceGrotesk } from '@/lib/fonts';
import type { InsightsData, ScenarioInsight } from '@/lib/supabaseAdmin';

interface InsightsViewProps {
  data: InsightsData;
}

export function InsightsView({ data }: InsightsViewProps) {
  const [lang] = useLang();

  // Show "No data yet" ONLY when total first-attempt runs is 0 or data is unavailable
  const noData = !data.available || (data.totals?.first_runs ?? 0) === 0;

  return (
    <main className={`min-h-screen bg-[#F6F3EC] text-[#111111] p-3 min-[400px]:p-4 md:p-10 flex flex-col justify-between max-w-4xl mx-auto ${spaceGrotesk.variable}`}>
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between border-b-2 border-[#111111] pb-4 mb-6 gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <Link
            href="/"
            className="font-mono font-bold tracking-tight text-xl bg-[#111111] text-[#F6F3EC] px-2 py-0.5 rounded-sm hover:opacity-90"
          >
            <span lang="en">CHAUKAS</span>
          </Link>
          <span lang="en" className="font-mono text-sm text-[#111111]/70 font-semibold">
            / INSIGHTS
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/about"
            className="text-xs md:text-sm font-bold text-[#111111] hover:underline"
          >
            {t('about_nav', lang)}
          </Link>
          <LangToggle />
          <Link
            href="/drill"
            className="min-h-[40px] px-3.5 py-1.5 bg-[#FF5A1F] text-white font-bold text-xs uppercase font-mono tracking-wider border-2 border-[#111111] rounded shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>{t('start_3min_drill', lang)}</span>
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="my-auto py-6 space-y-8">
        {noData ? (
          /* Empty state: No data yet. Only when first_runs is 0 or data unavailable. */
          <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-5 min-[400px]:p-8 md:p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm leading-normal">
              {t('insights_tag', lang)}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111]">
              {t('no_data_yet', lang)}
            </h1>
            <p className="text-sm md:text-base text-[#111111]/80 font-medium max-w-md mx-auto leading-relaxed">
              {t('no_data_desc', lang)}
            </p>
            <div className="pt-2">
              <Link
                href="/drill"
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-[#FF5A1F] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                {t('start_drill_insights', lang)}
              </Link>
            </div>
            <div className="border-t border-[#111111]/15 pt-4 mt-6">
              <p className="text-xs text-[#111111]/60 italic font-mono">
                {t('insights_caveat', lang)}
              </p>
            </div>
          </div>
        ) : (
          /* Live Data Screen */
          <div className="space-y-8">
            {/* Top Stat Banner: Total Runs */}
            <div className="flex flex-wrap items-center justify-between bg-white border-2 border-[#111111] rounded-md shadow-hard-sm px-5 py-3 gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70">
                {t('total_runs_recorded', lang)}
              </span>
              <span className="text-lg md:text-xl font-mono font-extrabold text-[#111111] tabular-nums">
                {t('runs_stat_label', lang, {
                  runs: data.totals!.total_runs,
                  first_runs: data.totals!.first_runs,
                  redrill_part:
                    data.totals!.redrills > 0
                      ? t('redrill_part', lang, { n: data.totals!.redrills })
                      : '',
                })}
              </span>
            </div>

            {/* Big Headline Card: Knowledge-Behaviour Gap */}
            <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 md:p-8 space-y-3 text-center md:text-left">
              <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm leading-normal">
                {t('the_gap_tag', lang)}
              </div>

              {data.totals!.knew_rule_first > 0 ? (
                <>
                  <div className="text-5xl sm:text-7xl md:text-8xl font-black text-[#D92D20] tabular-nums tracking-tight">
                    {data.totals!.gap_pct}%
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111111] tracking-tight leading-snug">
                    {data.totals!.gap_pct}% {t('of_people_who_knew', lang)} (n = {data.totals!.knew_rule_first})
                  </h1>

                  <p className="text-xs md:text-sm font-mono text-[#111111]/70">
                    {t('knew_but_fell_desc', lang, {
                      fell: data.totals!.knew_but_fell,
                      total: data.totals!.knew_rule_first,
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-5xl sm:text-7xl md:text-8xl font-black text-[#111111]/40 tabular-nums tracking-tight">
                    —
                  </div>

                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111111] tracking-tight leading-snug">
                    — {t('of_people_who_knew', lang)}
                  </h1>

                  <p className="text-xs md:text-sm font-mono text-[#111111]/70">
                    {t('nobody_answered_note', lang)}
                  </p>
                </>
              )}
            </div>

            {/* Per-Drill Fall Rates (CSS Bars) */}
            <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 md:p-8 space-y-5">
              <div className="border-b-2 border-[#111111] pb-2">
                <h2 className="text-lg font-bold text-[#111111]">
                  {t('fall_rate_by_archetype', lang)}
                </h2>
                <p className="text-xs font-mono text-[#111111]/60">
                  {t('fall_rate_desc', lang)}
                </p>
              </div>

              <div className="space-y-6">
                {data.scenarios?.map((s: ScenarioInsight) => {
                  const pct = Math.round(s.fall_rate * 100);
                  const redrillPct =
                    s.redrill_fall_rate !== null
                      ? Math.round(s.redrill_fall_rate * 100)
                      : null;
                  const label = t('drill_label_' + s.scenario_id.replace(/-/g, '_'), lang);

                  return (
                    <div key={s.scenario_id} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs md:text-sm font-semibold gap-1">
                        <span className="font-bold">{label}</span>
                        <div className="flex items-center gap-2 font-mono tabular-nums shrink-0 text-xs">
                          <span className="text-[#D92D20] font-bold">
                            {t('first_try', lang)}: {pct}% (n = {s.first_runs})
                          </span>
                          {s.redrills > 0 && redrillPct !== null && (
                            <span className="text-[#12B76A] font-bold border-l-2 border-[#111111]/20 pl-2">
                              {t('redrill', lang)}: {redrillPct}% (n = {s.redrills})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CSS Bar for First-Attempt Fall Rate */}
                      <div className="w-full h-5 bg-[#F6F3EC] border-2 border-[#111111] rounded-sm overflow-hidden p-0.5">
                        <div
                          className="h-full bg-[#FF5A1F] transition-all duration-700 rounded-xs"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Subtext info */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-[#111111]/70 gap-1">
                        <span>
                          {t('fell_on_first_attempt', lang, {
                            fell: s.first_scammed,
                            total: s.first_runs,
                          })}
                        </span>
                        {s.knew_rule_first > 0 && s.gap_pct !== null && (
                          <span>
                            {t('knew_but_fell_stat', lang)} <strong>{s.gap_pct}%</strong> ({s.knew_but_fell}/{s.knew_rule_first})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Re-drill vs First-Attempt Fall Rate Summary */}
            {data.totals!.redrills > 0 && (
              <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-4 sm:p-6 md:p-8 space-y-4">
                <div className="border-b-2 border-[#111111] pb-2">
                  <h2 className="text-lg font-bold text-[#111111]">
                    {t('learning_effect_title', lang)}
                  </h2>
                  <p className="text-xs font-mono text-[#111111]/60">
                    {t('learning_effect_desc', lang)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* First Attempt */}
                  <div className="bg-[#F6F3EC] border-2 border-[#111111] p-4 rounded-md space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70">
                      {t('first_attempt_fall_rate', lang)}
                    </span>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#D92D20] tabular-nums">
                      {Math.round(data.totals!.fall_rate * 100)}%
                    </div>
                    <p className="text-[11px] font-mono text-[#111111]/60">
                      {t('first_runs_count', lang, { n: data.totals!.first_runs })}
                    </p>
                  </div>

                  {/* Re-drills */}
                  <div className="bg-[#F6F3EC] border-2 border-[#111111] p-4 rounded-md space-y-1">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70">
                      {t('redrill_fall_rate_title', lang)}
                    </span>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#12B76A] tabular-nums">
                      {data.totals!.redrill_fall_rate !== null
                        ? `${Math.round(data.totals!.redrill_fall_rate * 100)}%`
                        : 'N/A'}
                    </div>
                    <p className="text-[11px] font-mono text-[#111111]/60">
                      {t('redrills_count', lang, { n: data.totals!.redrills })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mandatory Caveat */}
            <div className="border-t-2 border-[#111111] pt-4 text-center">
              <p className="text-xs md:text-sm font-mono text-[#111111]/70 italic">
                {t('insights_caveat', lang)}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-2">
        <span>{t('insights_footer', lang)}</span>
        <Link href="/" className="hover:underline font-bold">
          {t('back_to_home', lang)}
        </Link>
      </footer>
    </main>
  );
}
