'use client';

import React from 'react';
import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { t } from '@/lib/i18n';
import { AppShell, Card, Chip, Button, PageTitle } from '@/ui';
import type { InsightsData, ScenarioInsight } from '@/lib/supabaseAdmin';

interface InsightsViewProps {
  data: InsightsData;
}

export function InsightsView({ data }: InsightsViewProps) {
  const [lang] = useLang();

  // Show "No data yet" ONLY when total first-attempt runs is 0 or data is unavailable
  const noData = !data.available || (data.totals?.first_runs ?? 0) === 0;

  return (
    <AppShell>
      <div className="space-y-8 pb-12">
        {/* Page Title */}
        <PageTitle
          tag={<Chip variant="amber">/insights</Chip>}
          title={t('live_insights_nav', lang)}
          subtitle={t('insights_caveat', lang)}
        />

        {noData ? (
          /* Empty state */
          <Card className="text-center space-y-5 max-w-xl mx-auto py-10">
            <div className="flex justify-center">
              <Chip variant="neutral">{t('insights_tag', lang)}</Chip>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              {t('no_data_yet', lang)}
            </h2>
            <p className="text-base sm:text-lg text-[#1A1A1A]/80 max-w-md mx-auto leading-relaxed">
              {t('no_data_desc', lang)}
            </p>
            <div className="pt-2">
              <Button href="/drill" variant="primary">
                {t('start_drill_insights', lang)}
              </Button>
            </div>
          </Card>
        ) : (
          /* Live Data Screen */
          <div className="space-y-8">
            {/* Top Stat Banner: Total Runs */}
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <span className="text-sm sm:text-base font-bold text-[#1A1A1A]/75">
                {t('total_runs_recorded', lang)}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums">
                {t('runs_stat_label', lang, {
                  runs: data.totals!.total_runs,
                  first_runs: data.totals!.first_runs,
                  redrill_part:
                    data.totals!.redrills > 0
                      ? t('redrill_part', lang, { n: data.totals!.redrills })
                      : '',
                })}
              </span>
            </Card>

            {/* Big Headline Card: Knowledge-Behaviour Gap */}
            <Card className="space-y-4 text-center md:text-left p-6 sm:p-8">
              <div className="inline-block">
                <Chip variant="red">{t('the_gap_tag', lang)}</Chip>
              </div>

              {data.totals!.knew_rule_first > 0 ? (
                <>
                  <div className="text-6xl sm:text-7xl md:text-8xl font-black text-[#C92A2A] tabular-nums tracking-tight">
                    {data.totals!.gap_pct}%
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight leading-snug">
                    {data.totals!.gap_pct}% {t('of_people_who_knew', lang)} (n = {data.totals!.knew_rule_first})
                  </h2>

                  <p className="text-base text-[#1A1A1A]/75">
                    {t('knew_but_fell_desc', lang, {
                      fell: data.totals!.knew_but_fell,
                      total: data.totals!.knew_rule_first,
                    })}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-6xl sm:text-7xl md:text-8xl font-black text-[#1A1A1A]/30 tabular-nums tracking-tight">
                    —
                  </div>

                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1A1A1A] tracking-tight leading-snug">
                    — {t('of_people_who_knew', lang)}
                  </h2>

                  <p className="text-base text-[#1A1A1A]/75">
                    {t('nobody_answered_note', lang)}
                  </p>
                </>
              )}
            </Card>

            {/* Per-Drill Fall Rates (CSS Bars) */}
            <Card className="space-y-6 p-6 sm:p-8">
              <div className="border-b border-[#1A1A1A]/10 pb-3">
                <h3 className="text-xl font-bold text-[#1A1A1A]">
                  {t('fall_rate_by_archetype', lang)}
                </h3>
                <p className="text-base text-[#1A1A1A]/70">
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
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base font-semibold gap-1">
                        <span className="font-bold text-[#1A1A1A]">{label}</span>
                        <div className="flex items-center gap-3 tabular-nums shrink-0 text-sm">
                          <span className="text-[#C92A2A] font-bold">
                            {t('first_try', lang)}: {pct}% (n = {s.first_runs})
                          </span>
                          {s.redrills > 0 && redrillPct !== null && (
                            <span className="text-[#2B8A3E] font-bold border-l border-[#1A1A1A]/20 pl-3">
                              {t('redrill', lang)}: {redrillPct}% (n = {s.redrills})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CSS Bar for First-Attempt Fall Rate */}
                      <div className="w-full h-4 bg-[#FBF7F0] border border-[#1A1A1A]/15 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-[#E8590C] rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* Subtext info */}
                      <div className="flex flex-wrap items-center justify-between text-sm text-[#1A1A1A]/70 gap-1">
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
            </Card>

            {/* Re-drill vs First-Attempt Fall Rate Summary */}
            {data.totals!.redrills > 0 && (
              <Card className="space-y-5 p-6 sm:p-8">
                <div className="border-b border-[#1A1A1A]/10 pb-3">
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {t('learning_effect_title', lang)}
                  </h3>
                  <p className="text-base text-[#1A1A1A]/70">
                    {t('learning_effect_desc', lang)}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* First Attempt */}
                  <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-5 rounded-[16px] space-y-1">
                    <span className="text-sm font-bold text-[#1A1A1A]/75">
                      {t('first_attempt_fall_rate', lang)}
                    </span>
                    <div className="text-4xl font-extrabold text-[#C92A2A] tabular-nums">
                      {Math.round(data.totals!.fall_rate * 100)}%
                    </div>
                    <p className="text-sm text-[#1A1A1A]/60">
                      {t('first_runs_count', lang, { n: data.totals!.first_runs })}
                    </p>
                  </div>

                  {/* Re-drills */}
                  <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-5 rounded-[16px] space-y-1">
                    <span className="text-sm font-bold text-[#1A1A1A]/75">
                      {t('redrill_fall_rate_title', lang)}
                    </span>
                    <div className="text-4xl font-extrabold text-[#2B8A3E] tabular-nums">
                      {data.totals!.redrill_fall_rate !== null
                        ? `${Math.round(data.totals!.redrill_fall_rate * 100)}%`
                        : 'N/A'}
                    </div>
                    <p className="text-sm text-[#1A1A1A]/60">
                      {t('redrills_count', lang, { n: data.totals!.redrills })}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Mandatory Caveat */}
            <div className="border-t border-[#1A1A1A]/10 pt-4 text-center">
              <p className="text-sm sm:text-base text-[#1A1A1A]/70 italic">
                {t('insights_caveat', lang)}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="border-t border-[#1A1A1A]/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-base text-[#1A1A1A]/70 gap-3">
          <span>{t('insights_footer', lang)}</span>
          <Link href="/" className="hover:underline font-bold text-[#0F6B4F]">
            {t('back_to_practice', lang)}
          </Link>
        </footer>
      </div>
    </AppShell>
  );
}
