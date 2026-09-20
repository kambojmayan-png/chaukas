import { createClient, SupabaseClient } from '@supabase/supabase-js';

let adminClient: SupabaseClient | null = null;

/**
 * Server-only Supabase admin client initialized with SUPABASE_SERVICE_ROLE_KEY.
 * Returns null if either SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing.
 * Never throws. Never logs secret keys, headers, or request bodies.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return null;
  }

  if (!adminClient) {
    adminClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return adminClient;
}

export interface InsightsRow {
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

export interface ScenarioInsight {
  scenario_id: string;
  first_runs: number;
  first_scammed: number;
  fall_rate: number;
  knew_rule_first: number;
  knew_but_fell: number;
  gap_pct: number | null;
  redrills: number;
  redrill_scammed: number;
  redrill_fall_rate: number | null;
}

export interface InsightsTotals {
  total_runs: number;
  first_runs: number;
  first_scammed: number;
  fall_rate: number;
  knew_rule_first: number;
  knew_but_fell: number;
  gap_pct: number | null;
  redrills: number;
  redrill_scammed: number;
  redrill_fall_rate: number | null;
}

export interface InsightsData {
  available: boolean;
  totals?: InsightsTotals;
  scenarios?: ScenarioInsight[];
}

/**
 * Server-side query for the insights view.
 * Computes totals and per-scenario metrics without throwing.
 */
export async function fetchInsights(): Promise<InsightsData> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { available: false };
    }

    const { data, error } = await supabase.from('insights').select('*');
    if (error || !data) {
      if (error) console.error('[insights]', error.message);
      return { available: false };
    }

    const rows = data as unknown as InsightsRow[];

    let sumFirstRuns = 0;
    let sumFirstScammed = 0;
    let sumKnewRuleFirst = 0;
    let sumKnewButFell = 0;
    let sumRedrills = 0;
    let sumRedrillScammed = 0;

    const scenarios: ScenarioInsight[] = rows.map(row => {
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
        first_scammed: firstScammed,
        fall_rate: firstRuns > 0 ? +(firstScammed / firstRuns).toFixed(2) : 0,
        knew_rule_first: knewRuleFirst,
        knew_but_fell: knewButFell,
        gap_pct:
          knewRuleFirst > 0
            ? Math.round((knewButFell / knewRuleFirst) * 100)
            : null,
        redrills,
        redrill_scammed: redrillScammed,
        redrill_fall_rate:
          redrills > 0 ? +(redrillScammed / redrills).toFixed(2) : null,
      };
    });

    const totals: InsightsTotals = {
      total_runs: sumFirstRuns + sumRedrills,
      first_runs: sumFirstRuns,
      first_scammed: sumFirstScammed,
      fall_rate:
        sumFirstRuns > 0 ? +(sumFirstScammed / sumFirstRuns).toFixed(2) : 0,
      knew_rule_first: sumKnewRuleFirst,
      knew_but_fell: sumKnewButFell,
      gap_pct:
        sumKnewRuleFirst > 0
          ? Math.round((sumKnewButFell / sumKnewRuleFirst) * 100)
          : null,
      redrills: sumRedrills,
      redrill_scammed: sumRedrillScammed,
      redrill_fall_rate:
        sumRedrills > 0 ? +(sumRedrillScammed / sumRedrills).toFixed(2) : null,
    };

    return {
      available: true,
      totals,
      scenarios,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[insights]', message);
    return { available: false };
  }
}
