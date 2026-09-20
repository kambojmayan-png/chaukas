import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SaralApp } from '@/saral/SaralApp';

export const metadata: Metadata = {
  title: 'चौकस — सरल अभ्यास',
  description: 'ठगी से बचने का सरल अभ्यास — बुजुर्गों के लिए विशेष रूप से डिज़ाइन किया गया।',
};

export default function SaralPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center font-bold text-xl">नमस्ते…</div>}>
      <SaralApp />
    </Suspense>
  );
}
