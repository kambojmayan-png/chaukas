'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface ScenarioInsight {
  scenario_id: string;
  first_runs: number;
  fall_rate: number;
  knew_rule_first: number;
  knew_but_fell: number;
  gap_pct: number;
  redrills: number;
  redrill_fall_rate: number;
}

interface InsightsTotals {
  first_runs: number;
  fall_rate: number;
  knew_rule_first: number;
  knew_but_fell: number;
  gap_pct: number;
  redrills: number;
  redrill_fall_rate: number;
}

interface InsightsResponse {
  available: boolean;
  totals?: InsightsTotals;
  scenarios?: ScenarioInsight[];
}

const SCENARIO_LABELS: Record<string, string> = {
  'olx-qr': 'Drill 1 · QR / UPI Receive (Buyer who never bargains)',
  'bijli-remote': 'Drill 2 · Electricity KYC Remote App & OTP',
  'digital-arrest': 'Drill 3 · Digital Arrest Video Call',
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/insights')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setData({ available: false });
        setLoading(false);
      });
  }, []);

  const hasData =
    data?.available &&
    data.totals &&
    data.totals.knew_rule_first > 0;

  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] p-4 md:p-10 flex flex-col justify-between max-w-4xl mx-auto">
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
            / INSIGHTS
          </span>
        </div>
        <Link
          href="/drill"
          className="min-h-[40px] px-3.5 py-1.5 bg-[#FF5A1F] text-white font-bold text-xs uppercase font-mono tracking-wider border-2 border-[#111111] rounded shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span>Take the Drill</span>
          <span>→</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="my-auto py-6 space-y-8">
        {loading ? (
          <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-10 text-center space-y-3">
            <div className="w-8 h-8 mx-auto border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#111111]/70">
              Loading live numbers…
            </p>
          </div>
        ) : !hasData ? (
          /* Empty state: No data yet. Never show placeholder numbers. */
          <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-8 md:p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
              LIVE TELEMETRY
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#111111]">
              No data yet.
            </h1>
            <p className="text-sm md:text-base text-[#111111]/80 font-medium max-w-md mx-auto leading-relaxed">
              No completed drills with pre-check answers have been recorded yet. Complete the drill to publish the first live measurement.
            </p>
            <div className="pt-2">
              <Link
                href="/drill"
                className="inline-flex items-center justify-center min-h-[48px] px-6 py-3 bg-[#FF5A1F] text-white font-bold text-base border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                Start the 3-minute drill →
              </Link>
            </div>
            <div className="border-t border-[#111111]/15 pt-4 mt-6">
              <p className="text-xs text-[#111111]/60 italic font-mono">
                Self-selected sample collected during HACKDAY 1.0. Not a representative study.
              </p>
            </div>
          </div>
        ) : (
          /* Live Data Screen */
          <div className="space-y-8">
            {/* Big Headline Number */}
            <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 md:p-8 space-y-3 text-center md:text-left">
              <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                THE KNOWLEDGE–BEHAVIOUR GAP
              </div>

              <div className="text-5xl sm:text-7xl md:text-8xl font-black text-[#D92D20] tabular-nums tracking-tight">
                {data.totals!.gap_pct}%
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#111111] tracking-tight leading-snug">
                {data.totals!.gap_pct}% of people who knew the rule still fell for it (n = {data.totals!.knew_rule_first})
              </h1>

              <p className="text-xs md:text-sm font-mono text-[#111111]/70">
                {data.totals!.knew_but_fell} of {data.totals!.knew_rule_first} participants correctly identified the scam rule in the pre-check, yet still complied when pressured in the simulator.
              </p>
            </div>

            {/* Per-Drill Fall Rates (CSS Bars) */}
            <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 md:p-8 space-y-5">
              <div className="border-b-2 border-[#111111] pb-2">
                <h2 className="text-lg font-bold text-[#111111]">
                  Fall Rate by Scam Archetype
                </h2>
                <p className="text-xs font-mono text-[#111111]/60">
                  Percentage of first-time players who authorized payments or permissions
                </p>
              </div>

              <div className="space-y-4">
                {data.scenarios?.map(s => {
                  const pct = Math.round(s.fall_rate * 100);
                  const label = SCENARIO_LABELS[s.scenario_id] || s.scenario_id;

                  return (
                    <div key={s.scenario_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs md:text-sm font-semibold">
                        <span className="truncate pr-2">{label}</span>
                        <span className="font-mono font-bold tabular-nums shrink-0">
                          {pct}% ({s.first_runs} runs)
                        </span>
                      </div>

                      {/* CSS Bar */}
                      <div className="w-full h-5 bg-[#F6F3EC] border-2 border-[#111111] rounded-sm overflow-hidden p-0.5">
                        <div
                          className="h-full bg-[#FF5A1F] transition-all duration-700 rounded-xs"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      {s.knew_rule_first > 0 && (
                        <div className="text-[11px] font-mono text-[#111111]/70">
                          Knew-but-fell gap: <strong>{s.gap_pct}%</strong> ({s.knew_but_fell}/{s.knew_rule_first})
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Re-drill vs First-Attempt Fall Rate */}
            <div className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 md:p-8 space-y-4">
              <div className="border-b-2 border-[#111111] pb-2">
                <h2 className="text-lg font-bold text-[#111111]">
                  Learning Effect: First Attempt vs Re-drill
                </h2>
                <p className="text-xs font-mono text-[#111111]/60">
                  Comparing initial fall rate with repeated practice runs
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* First Attempt */}
                <div className="bg-[#F6F3EC] border-2 border-[#111111] p-4 rounded-md space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70">
                    First Attempt Fall Rate
                  </span>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#D92D20] tabular-nums">
                    {Math.round(data.totals!.fall_rate * 100)}%
                  </div>
                  <p className="text-[11px] font-mono text-[#111111]/60">
                    n = {data.totals!.first_runs} first runs
                  </p>
                </div>

                {/* Re-drills */}
                <div className="bg-[#F6F3EC] border-2 border-[#111111] p-4 rounded-md space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]/70">
                    Re-drill Fall Rate
                  </span>
                  <div className="text-3xl md:text-4xl font-extrabold text-[#12B76A] tabular-nums">
                    {data.totals!.redrills > 0
                      ? `${Math.round(data.totals!.redrill_fall_rate * 100)}%`
                      : 'N/A'}
                  </div>
                  <p className="text-[11px] font-mono text-[#111111]/60">
                    n = {data.totals!.redrills} re-drills
                  </p>
                </div>
              </div>
            </div>

            {/* Mandatory Caveat */}
            <div className="border-t-2 border-[#111111] pt-4 text-center">
              <p className="text-xs md:text-sm font-mono text-[#111111]/70 italic">
                Self-selected sample collected during HACKDAY 1.0. Not a representative study.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-2">
        <span>© 2026 Chaukas · Anonymous Telemetry</span>
        <Link href="/" className="hover:underline font-bold">
          ← Back to Home
        </Link>
      </footer>
    </main>
  );
}
