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

  const totals = data.totals;
  const scenarios = data.scenarios || [];

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
          /* Empty state: No data yet */
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
              <Button href="/" variant="primary">
                {t('start_drill_insights', lang)}
              </Button>
            </div>
          </Card>
        ) : (
          /* 8 Insights Sections */
          <div className="space-y-8">
            {/* Top Stat Banner: Total Runs Recorded */}
            <Card className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
              <span className="text-base font-bold text-[#1A1A1A]/75">
                {t('total_runs_recorded', lang)}
              </span>
              <span className="text-lg sm:text-2xl font-extrabold text-[#1A1A1A] tabular-nums break-words">
                {t('runs_stat_label', lang, {
                  runs: totals!.total_runs,
                  first_runs: totals!.first_runs,
                  redrill_part:
                    totals!.redrills > 0
                      ? t('redrill_part', lang, { n: totals!.redrills })
                      : '',
                })}
              </span>
            </Card>

            {/* SECTION 1: The Knowledge–Behaviour Gap */}
            <Card className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('the_gap_tag', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('gap_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.knew_rule_first < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.knew_rule_first})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.knew_rule_first}</Chip>
                  )}
                </div>
              </div>

              {totals!.knew_rule_first > 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="text-6xl sm:text-7xl md:text-8xl font-black text-[#C92A2A] tabular-nums tracking-tight">
                    {totals!.gap_pct}%
                  </div>

                  <p className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
                    {totals!.gap_pct}% {t('of_people_who_knew', lang)} ({totals!.knew_but_fell} of {totals!.knew_rule_first})
                  </p>

                  {/* Two-line "how this is measured" */}
                  <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] text-base text-[#1A1A1A]/85 space-y-1.5">
                    <p className="font-semibold text-[#1A1A1A]">
                      {t('gap_how_measured_line1', lang)}
                    </p>
                    <p>
                      {t('gap_how_measured_line2', lang)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="text-5xl font-black text-[#1A1A1A]/30">—</div>
                  <p className="text-base text-[#1A1A1A]/70">
                    {t('nobody_answered_note', lang)}
                  </p>
                </div>
              )}
            </Card>

            {/* SECTION 2: Fall rate per practice (first attempts) */}
            <Card className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('fall_rate_per_practice_title', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('fall_rate_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.first_runs < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.first_runs})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.first_runs}</Chip>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {scenarios.map((s: ScenarioInsight) => {
                  const pct = Math.round(s.fall_rate * 100);
                  const label = t('drill_label_' + s.scenario_id.replace(/-/g, '_'), lang);
                  const trapKey = 'trap_' + s.scenario_id.replace(/-/g, '_');

                  return (
                    <div key={s.scenario_id} className="space-y-2 bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base font-semibold gap-1">
                        <span className="font-bold text-[#1A1A1A]">{label}</span>
                        <div className="flex items-center gap-2 tabular-nums shrink-0 text-sm">
                          <span className="text-[#C92A2A] font-bold text-base">
                            {pct}%
                          </span>
                          {s.first_runs < 30 ? (
                            <Chip variant="amber" className="text-xs py-0.5">
                              {t('early_numbers', lang)} (n = {s.first_runs})
                            </Chip>
                          ) : (
                            <span className="text-[#1A1A1A]/60 font-normal">
                              (n = {s.first_runs})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Plain CSS Bar */}
                      <div className="w-full h-4 bg-white border border-[#1A1A1A]/15 rounded-full overflow-hidden p-0.5">
                        <div
                          className="h-full bg-[#E8590C] rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {/* One-line trap */}
                      <p className="text-sm text-[#1A1A1A]/80 italic pt-1">
                        {t(trapKey, lang)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* SECTION 3: What people did: scammed / escaped late / escaped */}
            <Card className="space-y-6 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('what_people_did_title', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('what_people_did_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.first_runs < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.first_runs})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.first_runs}</Chip>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {scenarios.map((s: ScenarioInsight) => {
                  if (s.first_runs === 0) {
                    return (
                      <div key={s.scenario_id} className="space-y-1">
                        <span className="font-bold text-[#1A1A1A]">
                          {t('drill_label_' + s.scenario_id.replace(/-/g, '_'), lang)}
                        </span>
                        <p className="text-sm text-[#1A1A1A]/60 italic">No data yet</p>
                      </div>
                    );
                  }

                  const pctScammed = Math.round((s.first_scammed / s.first_runs) * 100);
                  const pctEscapedLate = Math.round((s.first_escaped_late / s.first_runs) * 100);
                  const pctEscaped = Math.max(0, 100 - pctScammed - pctEscapedLate);
                  const label = t('drill_label_' + s.scenario_id.replace(/-/g, '_'), lang);

                  return (
                    <div key={s.scenario_id} className="space-y-2 bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px]">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-base font-semibold gap-1">
                        <span className="font-bold text-[#1A1A1A]">{label}</span>
                        <span className="text-sm text-[#1A1A1A]/70">n = {s.first_runs}</span>
                      </div>

                      {/* Stacked CSS Bar */}
                      <div className="w-full h-5 rounded-full overflow-hidden flex bg-white border border-[#1A1A1A]/15 p-0.5">
                        {pctScammed > 0 && (
                          <div
                            style={{ width: `${pctScammed}%` }}
                            className="bg-[#C92A2A] h-full rounded-l-full transition-all duration-500"
                            title={`Scammed: ${pctScammed}%`}
                          />
                        )}
                        {pctEscapedLate > 0 && (
                          <div
                            style={{ width: `${pctEscapedLate}%` }}
                            className="bg-[#E67700] h-full transition-all duration-500"
                            title={`Escaped late: ${pctEscapedLate}%`}
                          />
                        )}
                        {pctEscaped > 0 && (
                          <div
                            style={{ width: `${pctEscaped}%` }}
                            className="bg-[#2B8A3E] h-full rounded-r-full transition-all duration-500"
                            title={`Escaped: ${pctEscaped}%`}
                          />
                        )}
                      </div>

                      {/* Legend */}
                      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold pt-1">
                        <div className="flex items-center gap-1.5 text-[#C92A2A]">
                          <span className="w-3 h-3 rounded-full bg-[#C92A2A] shrink-0" />
                          <span>{t('scammed', lang)}: {pctScammed}% ({s.first_scammed})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#E67700]">
                          <span className="w-3 h-3 rounded-full bg-[#E67700] shrink-0" />
                          <span>{t('escaped_late', lang)}: {pctEscapedLate}% ({s.first_escaped_late})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[#2B8A3E]">
                          <span className="w-3 h-3 rounded-full bg-[#2B8A3E] shrink-0" />
                          <span>{t('escaped', lang)}: {pctEscaped}% ({s.first_escaped})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* SECTION 4: Hesitation: average pause at the keypad */}
            <Card className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('hesitation_title', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('hesitation_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.first_scammed < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.first_scammed})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.first_scammed}</Chip>
                  )}
                </div>
              </div>

              {totals!.avg_hesitation_ms_scammed !== null && totals!.first_scammed > 0 ? (
                <div className="space-y-3 pt-1">
                  <div className="text-5xl sm:text-6xl font-extrabold text-[#1A1A1A] tabular-nums">
                    {(totals!.avg_hesitation_ms_scammed / 1000).toFixed(1)} s
                  </div>
                  <p className="text-base text-[#1A1A1A]/80">
                    {t('hesitation_stat_desc', lang, {
                      sec: (totals!.avg_hesitation_ms_scammed / 1000).toFixed(1),
                    })}
                  </p>

                  {/* Per practice hesitation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    {scenarios.map((s: ScenarioInsight) => {
                      const sec =
                        s.avg_hesitation_ms_scammed !== null
                          ? (s.avg_hesitation_ms_scammed / 1000).toFixed(1) + ' s'
                          : '—';
                      const label = s.scenario_id === 'olx-qr' ? 'OLX QR' : s.scenario_id === 'bijli-remote' ? 'Electricity KYC' : 'Digital Arrest';

                      return (
                        <div key={s.scenario_id} className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-3.5 rounded-[12px]">
                          <span className="text-xs font-bold text-[#1A1A1A]/60 block">{label}</span>
                          <span className="text-xl font-bold text-[#1A1A1A] tabular-nums">{sec}</span>
                          <span className="text-xs text-[#1A1A1A]/60 block mt-0.5">n = {s.first_scammed}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-base text-[#1A1A1A]/60 italic pt-1">
                  No hesitation data recorded yet.
                </p>
              )}
            </Card>

            {/* SECTION 5: Red flags walked past */}
            <Card className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('flags_walked_past_title', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('flags_walked_past_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.first_runs < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.first_runs})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.first_runs}</Chip>
                  )}
                </div>
              </div>

              {totals!.avg_flags_walked_past !== null && totals!.first_runs > 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {scenarios.map((s: ScenarioInsight) => {
                      const avg = s.avg_flags_walked_past !== null ? s.avg_flags_walked_past : '—';
                      const pct =
                        s.avg_flags_walked_past !== null && s.flags_total > 0
                          ? Math.round((s.avg_flags_walked_past / s.flags_total) * 100)
                          : 0;
                      const label = s.scenario_id === 'olx-qr' ? 'OLX QR' : s.scenario_id === 'bijli-remote' ? 'Electricity KYC' : 'Digital Arrest';

                      return (
                        <div key={s.scenario_id} className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] space-y-2">
                          <div className="flex justify-between items-center text-sm font-semibold">
                            <span className="text-[#1A1A1A] font-bold">{label}</span>
                            <span className="text-[#1A1A1A]/70 text-xs">n = {s.first_runs}</span>
                          </div>
                          <div className="text-2xl font-extrabold text-[#E8590C] tabular-nums">
                            {avg} / {s.flags_total}
                          </div>
                          <div className="w-full h-3 bg-white border border-[#1A1A1A]/15 rounded-full overflow-hidden p-0.5">
                            <div
                              className="h-full bg-[#E8590C] rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-[#1A1A1A]/70">
                            {t('flags_stat_desc', lang, { avg, total: s.flags_total })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-base text-[#1A1A1A]/60 italic pt-1">
                  No red flag data recorded yet.
                </p>
              )}
            </Card>

            {/* SECTION 6: Does practice help: first-attempt vs re-try fall rate */}
            <Card className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('does_practice_help_title', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('does_practice_help_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.redrills < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.redrills})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.redrills}</Chip>
                  )}
                </div>
              </div>

              {totals!.redrills > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* First Attempt */}
                  <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-5 rounded-[16px] space-y-1.5">
                    <span className="text-sm font-bold text-[#1A1A1A]/75 block">
                      {t('first_attempt_label', lang)}
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-[#C92A2A] tabular-nums">
                      {Math.round(totals!.fall_rate * 100)}%
                    </div>
                    <p className="text-sm text-[#1A1A1A]/60">
                      {t('first_runs_count', lang, { n: totals!.first_runs })}
                    </p>
                  </div>

                  {/* Re-drills */}
                  <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-5 rounded-[16px] space-y-1.5">
                    <span className="text-sm font-bold text-[#1A1A1A]/75 block">
                      {t('retry_label', lang)}
                    </span>
                    <div className="text-4xl sm:text-5xl font-extrabold text-[#2B8A3E] tabular-nums">
                      {totals!.redrill_fall_rate !== null
                        ? `${Math.round(totals!.redrill_fall_rate * 100)}%`
                        : 'N/A'}
                    </div>
                    <p className="text-sm text-[#1A1A1A]/60">
                      {t('redrills_count', lang, { n: totals!.redrills })}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-base text-[#1A1A1A]/70 italic pt-1">
                  {t('no_retry_data', lang)}
                </p>
              )}

              <p className="text-sm font-medium text-[#1A1A1A]/70 pt-1">
                {t('attempt_note', lang)}
              </p>
            </Card>

            {/* SECTION 7: Who played */}
            <Card className="space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A]/10 pb-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                    {t('who_played_title', lang)}
                  </h2>
                  <p className="text-base text-[#1A1A1A]/75">
                    {t('who_played_meaning', lang)}
                  </p>
                </div>
                <div>
                  {totals!.first_runs < 30 ? (
                    <Chip variant="amber">
                      {t('early_numbers', lang)} (n = {totals!.first_runs})
                    </Chip>
                  ) : (
                    <Chip variant="neutral">n = {totals!.first_runs}</Chip>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Interface breakdown */}
                <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] space-y-1">
                  <span className="text-sm font-bold text-[#1A1A1A]/70 block">
                    {t('simple_ui_label', lang)} vs {t('detailed_ui_label', lang)}
                  </span>
                  <div className="text-2xl font-bold text-[#1A1A1A] tabular-nums">
                    {totals!.first_runs_simple_ui} / {Math.max(0, totals!.first_runs - totals!.first_runs_simple_ui)}
                  </div>
                  <p className="text-xs text-[#1A1A1A]/60">
                    {totals!.first_runs > 0 ? Math.round((totals!.first_runs_simple_ui / totals!.first_runs) * 100) : 0}% used simple interface
                  </p>
                </div>

                {/* Hindi share */}
                <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] space-y-1">
                  <span className="text-sm font-bold text-[#1A1A1A]/70 block">
                    {t('hindi_share_label', lang)}
                  </span>
                  <div className="text-2xl font-bold text-[#1A1A1A] tabular-nums">
                    {totals!.first_runs > 0 ? Math.round((totals!.first_runs_hindi / totals!.first_runs) * 100) : 0}%
                  </div>
                  <p className="text-xs text-[#1A1A1A]/60">
                    {totals!.first_runs_hindi} of {totals!.first_runs} players
                  </p>
                </div>

                {/* Family share */}
                <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] space-y-1">
                  <span className="text-sm font-bold text-[#1A1A1A]/70 block">
                    {t('family_share_label', lang)}
                  </span>
                  <div className="text-2xl font-bold text-[#1A1A1A] tabular-nums">
                    {totals!.first_runs > 0 ? Math.round((totals!.first_runs_family_link / totals!.first_runs) * 100) : 0}%
                  </div>
                  <p className="text-xs text-[#1A1A1A]/60">
                    {totals!.first_runs_family_link} of {totals!.first_runs} players
                  </p>
                </div>

                {/* Runs in last 24h */}
                <div className="bg-[#FBF7F0] border border-[#1A1A1A]/10 p-4 rounded-[14px] space-y-1">
                  <span className="text-sm font-bold text-[#1A1A1A]/70 block">
                    {t('last_24h_label', lang)}
                  </span>
                  <div className="text-2xl font-bold text-[#0F6B4F] tabular-nums">
                    {totals!.runs_last_24h}
                  </div>
                  <p className="text-xs text-[#1A1A1A]/60">
                    Active plays within the last 24 hours
                  </p>
                </div>
              </div>
            </Card>

            {/* SECTION 8: Method and limits */}
            <Card className="space-y-3 p-6 sm:p-8 bg-white border border-[#1A1A1A]/15">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] tracking-tight">
                {t('method_and_limits_title', lang)}
              </h2>
              <p className="text-base sm:text-lg text-[#1A1A1A]/85 leading-relaxed">
                {t('method_and_limits_desc', lang)}
              </p>
            </Card>
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
