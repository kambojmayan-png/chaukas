import { NextResponse } from 'next/server';
import { fetchInsights } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await fetchInsights();
  return NextResponse.json(data);
}
