import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createHash } from 'crypto';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Soft in-memory rate limit fallback: 30 requests / 10 min per bucket
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function isMemoryRateLimited(bucket: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const limit = 30;

  const entry = rateLimitMap.get(bucket);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(bucket, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count++;
  return false;
}

const runSchema = z.object({
  run_id: z.string().uuid().optional(),
  session_id: z.string().min(1),
  scenario_id: z.enum(['olx-qr', 'bijli-remote', 'digital-arrest']),
  lang: z.enum(['en', 'hi']),
  outcome: z.enum(['scammed', 'escaped', 'escaped_late']),
  loss_inr: z.number().int().min(0),
  knew_rule: z.boolean().nullable().optional(),
  risky_actions: z.number().int().min(0).default(0),
  flags_walked_past: z.number().int().min(0).default(0),
  flags_total: z.number().int().min(0).default(0),
  duration_ms: z.number().int().min(2000).max(1800000),
  hesitation_ms: z.number().int().min(0).nullable().optional(),
  attempt: z.number().int().min(1).default(1),
  age_band: z.enum(['<18', '18-30', '31-50', '51+']).nullable().optional(),
  source: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 1. Compute bucket: sha256( (process.env.RATE_SALT ?? 'chaukas') + '|' + ip + '|' + Math.floor(Date.now() / 600000) )
    const salt = process.env.RATE_SALT ?? 'chaukas';
    const windowSlot = Math.floor(Date.now() / 600000);
    const bucket = createHash('sha256')
      .update(`${salt}|${ip}|${windowSlot}`)
      .digest('hex');

    const supabase = getSupabaseAdmin();
    // If either env var is missing, return 204 without throwing
    if (!supabase) {
      return new Response(null, { status: 204 });
    }

    // 2. RPC rate limit: hit_rate_limit(p_bucket, p_limit, p_window_seconds)
    const { data: allowed, error: rpcError } = await supabase.rpc('hit_rate_limit', {
      p_bucket: bucket,
      p_limit: 30,
      p_window_seconds: 600,
    });

    if (rpcError) {
      // Fall back to in-memory rate limiter
      if (isMemoryRateLimited(bucket)) {
        return new Response(null, { status: 204 });
      }
    } else if (allowed === false) {
      return new Response(null, { status: 204 });
    }

    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return new Response(null, { status: 204 });
    }

    const parsed = runSchema.safeParse(json);
    if (!parsed.success) {
      console.error('[run]', parsed.error.message);
      return new Response(null, { status: 204 });
    }

    // 3. Per-session cap: if this session_id already has 12 rows in the last hour, return 204 without inserting
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: sessionCount, error: sessionError } = await supabase
      .from('drill_runs')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', parsed.data.session_id)
      .gte('created_at', oneHourAgo);

    if (!sessionError && sessionCount !== null && sessionCount >= 12) {
      return new Response(null, { status: 204 });
    }

    // 4. Upsert with onConflict: 'run_id', ignoreDuplicates: true
    const { error } = await supabase
      .from('drill_runs')
      .upsert([parsed.data], { onConflict: 'run_id', ignoreDuplicates: true });

    if (error) {
      if (error.message.includes('ON CONFLICT')) {
        await supabase.from('drill_runs').insert([parsed.data]);
      } else {
        console.error('[run]', error.message);
      }
    }

    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[run]', message);
    return new Response(null, { status: 204 });
  }
}
