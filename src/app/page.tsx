import type { Metadata } from 'next';
import { SaralApp } from '@/saral/SaralApp';

export const metadata: Metadata = {
  title: 'चौकस — सरल अभ्यास',
  description: 'ठगी से बचने का सरल अभ्यास — बुजुर्गों के लिए विशेष रूप से डिज़ाइन किया गया।',
};

export default function HomePage() {
  return <SaralApp />;
}
