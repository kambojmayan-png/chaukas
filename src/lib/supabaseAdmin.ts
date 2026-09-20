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

export interface ScenarioInsight {
  scenario_id: string;
  first_runs: number;
  first_scammed: number;
  first_escaped_late: number;
  first_escaped: number;
  fall_rate: number;
  knew_rule_first: number;
  knew_but_fell: number;
  gap_pct: number | null;
  redrills: number;
  redrill_scammed: number;
  redrill_fall_rate: number | null;
  avg_hesitation_ms_scammed: number | null;
  avg_flags_walked_past: number | null;
  flags_total: number;
  avg_duration_ms: number | null;
  first_runs_simple_ui: number;
  first_scammed_simple_ui: number;
  first_runs_hindi: number;
  first_runs_family_link: number;
  runs_last_24h: number;
}

export interface InsightsTotals {
  total_runs: number;
  first_runs: number;
  first_scammed: number;
  first_escaped_late: number;
  first_escaped: number;
  fall_rate: number;
  knew_rule_first: number;
  knew_but_fell: number;
  gap_pct: number | null;
  redrills: number;
  redrill_scammed: number;
  redrill_fall_rate: number | null;
  avg_hesitation_ms_scammed: number | null;
  avg_flags_walked_past: number | null;
  flags_total: number;
  first_runs_simple_ui: number;
  first_scammed_simple_ui: number;
  first_runs_hindi: number;
  first_runs_family_link: number;
  runs_last_24h: number;
}

export interface InsightsData {
  available: boolean;
  is_v2?: boolean;
  totals?: InsightsTotals;
  scenarios?: ScenarioInsight[];
}

/**
 * Server-side query for the insights view.
 * Reads insights_v2 first, falls back to insights if not found.
 * Computes totals and per-scenario metrics without throwing.
 */
export async function fetchInsights(): Promise<InsightsData> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return { available: false };
    }

    // Try reading insights_v2 first, fallback to insights
    let data: Record<string, unknown>[] | null = null;
    let isV2 = false;

    const resV2 = await supabase.from('insights_v2').select('*');
    if (!resV2.error && resV2.data && resV2.data.length > 0) {
      data = resV2.data as Record<string, unknown>[];
      isV2 = true;
    } else {
      const resV1 = await supabase.from('insights').select('*');
      if (!resV1.error && resV1.data) {
        data = resV1.data as Record<string, unknown>[];
        isV2 = false;
      } else {
        if (resV2.error) console.error('[insights_v2]', resV2.error.message);
        if (resV1.error) console.error('[insights_v1]', resV1.error.message);
        return { available: false };
      }
    }

    let sumFirstRuns = 0;
    let sumFirstScammed = 0;
    let sumFirstEscapedLate = 0;
    let sumFirstEscaped = 0;
    let sumKnewRuleFirst = 0;
    let sumKnewButFell = 0;
    let sumRedrills = 0;
    let sumRedrillScammed = 0;
    let sumHesitationWeighted = 0;
    let hesitationScammedCount = 0;
    let sumFlagsWeighted = 0;
    let flagsRunsCount = 0;
    let maxFlagsTotal = 0;
    let sumSimpleUi = 0;
    let sumScammedSimpleUi = 0;
    let sumHindi = 0;
    let sumFamilyLink = 0;
    let sumRuns24h = 0;

    const scenarios: ScenarioInsight[] = (data || []).map((row: Record<string, unknown>) => {
      const firstRuns = Number(row.first_runs || 0);
      const firstScammed = Number(row.first_scammed || 0);
      const firstEscapedLate = Number(row.first_escaped_late || 0);
      const firstEscaped =
        row.first_escaped !== undefined && row.first_escaped !== null
          ? Number(row.first_escaped)
          : Math.max(0, firstRuns - firstScammed - firstEscapedLate);
      const knewRuleFirst = Number(row.knew_rule_first || 0);
      const knewButFell = Number(row.knew_but_fell || 0);
      const redrills = Number(row.redrills || 0);
      const redrillScammed = Number(row.redrill_scammed || 0);
      const avgHesitation =
        row.avg_hesitation_ms_scammed !== undefined && row.avg_hesitation_ms_scammed !== null
          ? Number(row.avg_hesitation_ms_scammed)
          : null;
      const avgFlags =
        row.avg_flags_walked_past !== undefined && row.avg_flags_walked_past !== null
          ? Number(row.avg_flags_walked_past)
          : null;
      const flagsTotal = Number(
        row.flags_total ||
          (row.scenario_id === 'bijli-remote'
            ? 8
            : row.scenario_id === 'digital-arrest'
            ? 6
            : 5)
      );
      const avgDuration =
        row.avg_duration_ms !== undefined && row.avg_duration_ms !== null
          ? Number(row.avg_duration_ms)
          : null;
      const simpleUi = Number(row.first_runs_simple_ui || 0);
      const scammedSimpleUi = Number(row.first_scammed_simple_ui || 0);
      const hindi = Number(row.first_runs_hindi || 0);
      const familyLink = Number(row.first_runs_family_link || 0);
      const runs24h = Number(row.runs_last_24h || 0);

      sumFirstRuns += firstRuns;
      sumFirstScammed += firstScammed;
      sumFirstEscapedLate += firstEscapedLate;
      sumFirstEscaped += firstEscaped;
      sumKnewRuleFirst += knewRuleFirst;
      sumKnewButFell += knewButFell;
      sumRedrills += redrills;
      sumRedrillScammed += redrillScammed;
      if (avgHesitation !== null && firstScammed > 0) {
        sumHesitationWeighted += avgHesitation * firstScammed;
        hesitationScammedCount += firstScammed;
      }
      if (avgFlags !== null && firstRuns > 0) {
        sumFlagsWeighted += avgFlags * firstRuns;
        flagsRunsCount += firstRuns;
      }
      maxFlagsTotal += flagsTotal;
      sumSimpleUi += simpleUi;
      sumScammedSimpleUi += scammedSimpleUi;
      sumHindi += hindi;
      sumFamilyLink += familyLink;
      sumRuns24h += runs24h;

      return {
        scenario_id: String(row.scenario_id || ''),
        first_runs: firstRuns,
        first_scammed: firstScammed,
        first_escaped_late: firstEscapedLate,
        first_escaped: firstEscaped,
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
        avg_hesitation_ms_scammed: avgHesitation,
        avg_flags_walked_past: avgFlags,
        flags_total: flagsTotal,
        avg_duration_ms: avgDuration,
        first_runs_simple_ui: simpleUi,
        first_scammed_simple_ui: scammedSimpleUi,
        first_runs_hindi: hindi,
        first_runs_family_link: familyLink,
        runs_last_24h: runs24h,
      };
    });

    const totals: InsightsTotals = {
      total_runs: sumFirstRuns + sumRedrills,
      first_runs: sumFirstRuns,
      first_scammed: sumFirstScammed,
      first_escaped_late: sumFirstEscapedLate,
      first_escaped: sumFirstEscaped,
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
      avg_hesitation_ms_scammed:
        hesitationScammedCount > 0
          ? Math.round(sumHesitationWeighted / hesitationScammedCount)
          : null,
      avg_flags_walked_past:
        flagsRunsCount > 0
          ? +(sumFlagsWeighted / flagsRunsCount).toFixed(1)
          : null,
      flags_total: maxFlagsTotal,
      first_runs_simple_ui: sumSimpleUi,
      first_scammed_simple_ui: sumScammedSimpleUi,
      first_runs_hindi: sumHindi,
      first_runs_family_link: sumFamilyLink,
      runs_last_24h: sumRuns24h,
    };

    return {
      available: true,
      is_v2: isV2,
      totals,
      scenarios,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[insights]', message);
    return { available: false };
  }
}
