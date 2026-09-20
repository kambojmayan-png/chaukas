import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-static';

interface LedgerRow {
  component: string;
  label: string;
  badgeClass: string;
  simplification: string;
}

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
    simplification: 'Browser TTS, quality varies → recorded voice actors per language',
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
    label: 'Optional / may be absent',
    badgeClass: 'bg-neutral-200 text-[#111111]',
    simplification: 'Labelled in UI when off',
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
  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] p-4 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b-2 border-[#111111] pb-4">
        <div className="flex items-center space-x-2">
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
        <div className="flex items-center space-x-3 text-xs md:text-sm font-bold">
          <Link href="/drill" className="hover:underline">
            Drills
          </Link>
          <Link href="/check" className="hover:underline">
            Check
          </Link>
          <Link href="/insights" className="hover:underline">
            Insights
          </Link>
        </div>
      </header>

      {/* Guide Section */}
      <section className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 space-y-6">
        <div className="space-y-1">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
            EVALUATION GUIDE
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">
            Two minutes? Do this:
          </h1>
          <p className="text-sm text-[#111111]/70">
            A quick walkthrough to experience the behavioural gap, inspect real-time scoring, and verify deterministic rules.
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
                  Play Drill 1 & Comply
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                Play Drill 1 (OLX QR) and go along with the buyer. Enter the practice PIN (4827) and watch ₹4,500 leave your practice wallet. Observe the debrief and Glass Box event stream.
              </p>
            </div>
            <Link
              href="/drill?only=olx-qr"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-[#FF5A1F] text-white font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:opacity-95 transition-all"
            >
              Play Drill 1 →
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
                  Inspect a Suspicious Message
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                Paste a spam SMS from your own phone into /check, or try the 3 built-in examples. See deterministic red-flag tagging and targeted archetype advice with 100% client-side privacy.
              </p>
            </div>
            <Link
              href="/check"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-white text-[#111111] font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:bg-[#F6F3EC] transition-all"
            >
              Open /check →
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
                  Review Live Insights
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                Open /insights to see real aggregated participant data: total runs, first-attempt fall rates per scenario, and the knowledge–behaviour gap metric.
              </p>
            </div>
            <Link
              href="/insights"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-white text-[#111111] font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:bg-[#F6F3EC] transition-all"
            >
              Open /insights →
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
                  Verify Test Suite
                </span>
              </div>
              <p className="text-xs text-[#111111]/80 leading-relaxed">
                Open the GitHub repo and run <code className="bg-white px-1 py-0.5 rounded border border-[#111111]/30 font-mono text-[11px]">npm test</code> to verify scenario graphs, automated bot runs, scoring logic, and /check rules fixtures.
              </p>
            </div>
            <a
              href="https://github.com/kambojmayan-png/chaukas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[38px] px-3 py-1.5 bg-[#111111] text-[#F6F3EC] font-bold text-xs border border-[#111111] rounded shadow-hard-sm hover:opacity-90 transition-all"
            >
              View GitHub Repo ↗
            </a>
          </div>
        </div>
      </section>

      {/* Reality Ledger Section */}
      <section className="bg-white border-2 border-[#111111] rounded-md shadow-hard p-6 space-y-5">
        <div className="space-y-1">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
            DISCLOSURE & ARCHITECTURE
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#111111]">
            Reality Ledger
          </h2>
          <p className="text-xs md:text-sm text-[#111111]/70">
            Full disclosure of components, production readiness, and intentional MVP shortcuts.
          </p>
        </div>

        {/* HTML Table */}
        <div className="overflow-x-auto border-2 border-[#111111] rounded-md">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            <thead>
              <tr className="bg-[#111111] text-[#F6F3EC] font-mono text-xs uppercase tracking-wider">
                <th className="p-3 border-r border-white/20">Component</th>
                <th className="p-3 border-r border-white/20">Label</th>
                <th className="p-3">Simplification → upgrade</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#111111]">
              {REALITY_LEDGER.map((row, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F6F3EC]'}
                >
                  <td className="p-3 font-semibold text-[#111111] border-r-2 border-[#111111] align-top">
                    {row.component}
                  </td>
                  <td className="p-3 border-r-2 border-[#111111] align-top whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-mono font-bold rounded-sm ${row.badgeClass}`}
                    >
                      {row.label}
                    </span>
                  </td>
                  <td className="p-3 text-[#111111]/80 leading-relaxed align-top font-mono text-xs">
                    {row.simplification}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GitHub Link Card */}
        <div className="bg-[#F6F3EC] border-2 border-[#111111] rounded-md p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-hard-sm">
          <div className="space-y-0.5 text-center sm:text-left">
            <span className="text-xs font-mono font-bold uppercase text-[#FF5A1F]">
              Open Source Repository
            </span>
            <p className="text-sm font-bold text-[#111111]">
              github.com/kambojmayan-png/chaukas
            </p>
          </div>
          <a
            href="https://github.com/kambojmayan-png/chaukas"
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-6 py-2.5 bg-[#111111] text-[#F6F3EC] font-bold text-sm border-2 border-[#111111] rounded-md shadow-hard-sm hover:opacity-90 active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span>GitHub Repo</span>
            <span>↗</span>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-2">
        <span>© 2026 Chaukas · Tech for a Better Tomorrow</span>
        <Link href="/" className="hover:underline font-bold">
          ← Back to Home
        </Link>
      </footer>
    </main>
  );
}
