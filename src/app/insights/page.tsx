import React from 'react';
import { fetchInsights } from '@/lib/supabaseAdmin';
import { InsightsView } from '@/components/InsightsView';

export const dynamic = 'force-dynamic';

export default async function InsightsPage() {
  const data = await fetchInsights();
  return <InsightsView data={data} />;
}
