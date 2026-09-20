import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabaseAdmin';

// Soft in-memory rate limit: 30 requests / 10 min per IP
interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const limit = 30;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (entry.count >= limit) {
    return true;
  }

  entry.count++;
  return false;
}

const runSchema = z.object({
  session_id: z.string().min(1),
  scenario_id: z.enum(['olx-qr', 'bijli-remote', 'digital-arrest']),
  lang: z.enum(['en', 'hi']),
  outcome: z.enum(['scammed', 'escaped', 'escaped_late']),
  loss_inr: z.number().int().min(0),
  knew_rule: z.boolean().nullable().optional(),
  risky_actions: z.number().int().min(0).default(0),
  flags_walked_past: z.number().int().min(0).default(0),
  flags_total: z.number().int().min(0).default(0),
  duration_ms: z.number().int().min(5000).max(1800000),
  hesitation_ms: z.number().int().min(0).nullable().optional(),
  attempt: z.number().int().min(1).default(1),
  age_band: z.enum(['<18', '18-30', '31-50', '51+']).nullable().optional(),
  source: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Soft rate-limit check
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
    if (isRateLimited(ip)) {
      return new Response(null, { status: 204 });
    }

    const supabase = getSupabaseAdmin();
    // If either env var is missing, return 204 without throwing
    if (!supabase) {
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

    const { error } = await supabase.from('drill_runs').insert([parsed.data]);
    if (error) {
      console.error('[run]', error.message);
    }

    return new Response(null, { status: 204 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'unknown error';
    console.error('[run]', message);
    return new Response(null, { status: 204 });
  }
}
