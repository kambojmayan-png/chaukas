'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { SCENARIOS } from '@/scenarios';
import { useLang } from '@/lib/useLang';
import { LangToggle } from '@/components/LangToggle';
import { t } from '@/lib/i18n';
import { unlockAudio, isFastMode } from '@/lib/speak';
import { SaralErrorBoundary } from './SaralErrorBoundary';

// Dynamically load the practice flow after Home
const SaralFlow = dynamic(
  () => import('./SaralFlow').then((mod) => mod.SaralFlow),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-[#FBF7F0] flex items-center justify-center font-bold text-xl text-[#1A1A1A]">
        {/* Instant loading placeholder during dynamic chunk load */}
      </div>
    ),
  }
);

function getDonePractices(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const val = localStorage.getItem('chaukas_saral_done');
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
}

export function SaralApp() {
  const [lang] = useLang();
  const [screen, setScreen] = useState<'home' | 'flow'>('home');
  const [practiceIdx, setPracticeIdx] = useState<number>(0);
  const [directStart, setDirectStart] = useState<boolean>(false);
  const [donePractices, setDonePractices] = useState<string[]>([]);
  const [isFamily, setIsFamily] = useState<boolean>(false);

  // Global navigation lock (600 ms after tap)
  const navLockUntilRef = useRef<number>(0);
  const isNavLocked = () => !isFastMode() && Date.now() < navLockUntilRef.current;
  const lockNav = () => {
    if (isFastMode()) return;
    navLockUntilRef.current = Date.now() + 600;
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('src') === 'family') {
        setIsFamily(true);
      }

      const practiceParam = params.get('practice');
      if (practiceParam) {
        const idx = SCENARIOS.findIndex((s) => s.id === practiceParam);
        setPracticeIdx(idx !== -1 ? idx : 0);
        setDirectStart(true);
        setScreen('flow');
      }

      setDonePractices(getDonePractices());

      // P2 2.2: Prefetch SaralFlow when the browser is idle
      const prefetchFlow = () => {
        import('./SaralFlow');
      };
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(prefetchFlow);
      } else {
        setTimeout(prefetchFlow, 1500);
      }
    }
  }, []);

  const handleStartHome = () => {
    if (isNavLocked()) return;
    lockNav();
    unlockAudio();
    setPracticeIdx(0);
    setDirectStart(false);
    setScreen('flow');
  };

  const handleStartPracticeDirect = (idx: number) => {
    if (isNavLocked()) return;
    lockNav();
    unlockAudio();
    setPracticeIdx(idx);
    setDirectStart(true);
    setScreen('flow');
  };

  if (screen === 'flow') {
    return (
      <SaralFlow
        initialPracticeIdx={practiceIdx}
        initialScreen={directStart ? 'precheck' : 'soundcheck'}
        initialSoundOn={!isFastMode()}
        isFamily={isFamily}
        onReturnHome={() => {
          setDirectStart(false);
          setScreen('home');
        }}
      />
    );
  }

  return (
    <SaralErrorBoundary lang={lang} soundOn={true}>
      <main className="min-h-screen bg-[#FBF7F0] text-[#1A1A1A] flex flex-col justify-between p-4 sm:p-6 w-full max-w-[480px] mx-auto min-w-0 box-border antialiased">
        {/* Top-Right Language Toggle */}
        <div className="w-full flex justify-end">
          <LangToggle />
        </div>

        {/* Home Content (P2 2.3 - strictly ordered top to bottom) */}
        <div className="flex-1 flex flex-col justify-center items-center py-6 text-center space-y-6 w-full max-w-[480px] mx-auto min-w-0 my-auto">
          {/* 1. The word "चौकस" */}
          <h1
            lang="hi"
            className="text-6xl sm:text-7xl font-black tracking-tight text-[#1A1A1A]"
          >
            चौकस
          </h1>

          {/* 2. home_tagline */}
          <p className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-[1.6]">
            {t('home_tagline', lang)}
          </p>

          {/* 3. Sound row with 🔊 icon and home_sound_line */}
          <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-bold text-[#1A1A1A] pt-2">
            <span className="text-xl shrink-0" aria-hidden="true">
              🔊
            </span>
            <span>{t('home_sound_line', lang)}</span>
          </div>

          {/* 4. Under it small line home_no_sound_ok */}
          <p className="text-xs sm:text-sm font-medium text-[#1A1A1A]/70">
            {t('home_no_sound_ok', lang)}
          </p>

          {/* 5. Big Start button */}
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={handleStartHome}
              className="w-full min-h-[68px] py-4 px-6 bg-[#E8590C] text-white text-2xl sm:text-3xl font-extrabold rounded-[16px] border-2 border-[#1A1A1A] shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{t('home_start', lang)}</span>
            </button>
          </div>

          {/* 6. (returning visitors) Three practice rows */}
          {donePractices.length > 0 && (
            <div className="w-full space-y-3 pt-2">
              {SCENARIOS.map((s, idx) => {
                const isDone = donePractices.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleStartPracticeDirect(idx)}
                    className="w-full min-h-[64px] py-3.5 px-4 bg-white border-2 border-[#1A1A1A] rounded-[14px] shadow-2xs hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-sm font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span
                        className={`text-base sm:text-lg font-bold truncate ${
                          isDone ? 'text-[#0F6B4F]' : 'text-[#1A1A1A]'
                        }`}
                      >
                        {s.title[lang] || s.title.en}
                      </span>
                    </div>
                    <span
                      className={`text-lg font-black shrink-0 ${
                        isDone ? 'text-[#0F6B4F]' : 'text-[#1A1A1A]/60'
                      }`}
                    >
                      {isDone ? '✓' : '→'}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. At the very bottom ONE link, in English only, grey, 48px tall: home_dev_link -> /about?lang=en */}
        <div className="w-full flex justify-center pt-4">
          <Link
            href="/about?lang=en"
            lang="en"
            className="min-h-[48px] inline-flex items-center justify-center text-base font-semibold text-[#1A1A1A]/75 hover:text-[#1A1A1A] hover:underline"
          >
            {t('home_dev_link', 'en')}
          </Link>
        </div>
      </main>
    </SaralErrorBoundary>
  );
}
