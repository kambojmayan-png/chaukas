'use client';

import Link from 'next/link';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';

export default function Home() {
  const [lang] = useLang();

  return (
    <main className="min-h-screen bg-[#F6F3EC] text-[#111111] flex flex-col justify-between p-6 md:p-12 max-w-4xl mx-auto">
      {/* Brand Header */}
      <header className="flex flex-wrap items-center justify-between border-b-2 border-[#111111] pb-4 gap-3">
        <div className="flex items-center space-x-2">
          <span className="font-mono font-bold tracking-tight text-xl bg-[#111111] text-[#F6F3EC] px-2 py-0.5 rounded-sm">
            CHAUKAS
          </span>
          <span className="font-hindi text-sm font-semibold text-[#111111]/70">
            चौकस
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <LangToggle />
          <Link
            href="/check"
            className="text-xs md:text-sm font-bold text-[#111111] hover:underline whitespace-nowrap"
          >
            {t('check_message_nav', lang)}
          </Link>
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#FF5A1F] border border-[#FF5A1F] px-2 py-1 rounded whitespace-nowrap">
            {t('fire_drill_1_badge', lang)}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="my-auto py-12 flex flex-col items-start space-y-8 max-w-2xl">
        <div className="space-y-4">
          <div className="inline-block bg-[#111111] text-[#F6F3EC] text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-sm">
            {t('hero_tag', lang)}
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#111111] leading-[1.1]">
            {t('hero_title', lang)}
          </h1>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href="/drill"
            className="inline-flex items-center justify-center min-h-[56px] px-8 py-4 bg-[#FF5A1F] text-white text-lg md:text-xl font-bold border-2 border-[#111111] rounded-md shadow-hard hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {t('start_3min_drill', lang)}
          </Link>
          <Link
            href="/check"
            className="inline-flex items-center justify-center min-h-[56px] px-6 py-4 bg-white text-[#111111] text-base md:text-lg font-bold border-2 border-[#111111] rounded-md shadow-hard hover:bg-[#F6F3EC] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {t('check_a_message', lang)}
          </Link>
        </div>

        {/* Security / Privacy line */}
        <p className="text-sm md:text-base text-[#111111]/80 font-medium max-w-lg border-l-2 border-[#111111] pl-3">
          {t('hero_disclaimer', lang)}
        </p>
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-[#111111] pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-[#111111]/70 font-mono gap-3">
        <span>{t('footer_copy', lang)}</span>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/judge" className="hover:underline font-bold text-[#FF5A1F]">
            {t('judging_link', lang)}
          </Link>
          <Link href="/check" className="hover:underline font-bold">
            {t('message_checker_nav', lang)}
          </Link>
          <Link href="/insights" className="hover:underline font-bold">
            {t('live_insights_nav', lang)}
          </Link>
          <span>{t('landing_footer', lang)}</span>
        </div>
      </footer>
    </main>
  );
}
