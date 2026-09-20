import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

export const revalidate = 60;

interface InsightsRow {
  scenario_id: string;
  runs: number | null;
  first_runs: number | null;
  first_scammed: number | null;
  knew_rule_first: number | null;
  knew_but_fell: number | null;
  redrills: number | null;
  redrill_scammed: number | null;
  avg_duration_ms: number | null;
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ available: false });
    }

    const { data, error } = await supabase
      .from('insights')
      .select('*');

    if (error || !data) {
      if (error) {
        console.error('[insights]', error.message);
      }
      return NextResponse.json({ available: false });
    }

    const rows = data as unknown as InsightsRow[];

    let sumFirstRuns = 0;
    let sumFirstScammed = 0;
    let sumKnewRuleFirst = 0;
    let sumKnewButFell = 0;
    let sumRedrills = 0;
    let sumRedrillScammed = 0;

    const scenarios = rows.map(row => {
      const firstRuns = Number(row.first_runs || 0);
      const firstScammed = Number(row.first_scammed || 0);
      const knewRuleFirst = Number(row.knew_rule_first || 0);
      const knewButFell = Number(row.knew_but_fell || 0);
      const redrills = Number(row.redrills || 0);
      const redrillScammed = Number(row.redrill_scammed || 0);

      sumFirstRuns += firstRuns;
      sumFirstScammed += firstScammed;
      sumKnewRuleFirst += knewRuleFirst;
      sumKnewButFell += knewButFell;
      sumRedrills += redrills;
      sumRedrillScammed += redrillScammed;

      return {
        scenario_id: row.scenario_id,
        first_runs: firstRuns,
        fall_rate: firstRuns > 0 ? +(firstScammed / firstRuns).toFixed(2) : 0,
        knew_rule_first: knewRuleFirst,
        knew_but_fell: knewButFell,
        gap_pct:
          knewRuleFirst > 0
            ? Math.round((knewButFell / knewRuleFirst) * 100)
            : 0,
        redrills,
        redrill_fall_rate:
          redrills > 0 ? +(redrillScammed / redrills).toFixed(2) : 0,
      };
    });

    const totals = {
      first_runs: sumFirstRuns,
      fall_rate:
        sumFirstRuns > 0 ? +(sumFirstScammed / sumFirstRuns).toFixed(2) : 0,
      knew_rule_first: sumKnewRuleFirst,
      knew_but_fell: sumKnewButFell,
      gap_pct:
        sumKnewRuleFirst > 0
          ? Math.round((sumKnewButFell / sumKnewRuleFirst) * 100)
          : 0,
      redrills: sumRedrills,
      redrill_fall_rate:
        sumRedrills > 0 ? +(sumRedrillScammed / sumRedrills).toFixed(2) : 0,
    };

    return NextResponse.json({
      available: true,
      totals,
      scenarios,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[insights]', message);
    return NextResponse.json({ available: false });
  }
}
