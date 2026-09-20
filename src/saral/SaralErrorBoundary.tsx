'use client';

import React, { Component, type ReactNode } from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';
import { playClip, stopSpeaking } from '@/lib/speak';

interface Props {
  children: ReactNode;
  lang?: Lang;
  soundOn?: boolean;
}

interface State {
  hasError: boolean;
}

export class SaralErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Saral Error caught by boundary:', error, errorInfo);
    const lang = this.props.lang || 'hi';
    const soundOn = this.props.soundOn !== false;
    if (soundOn) {
      playClip('narr__error_restart', t('error_text', lang), lang, soundOn);
    }
  }

  handleRestart = () => {
    stopSpeaking();
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const lang = this.props.lang || 'hi';
      return (
        <div className="min-h-screen bg-[#FBF7F0] text-[#1A1A1A] flex flex-col justify-center items-center p-4 sm:p-6 max-w-md mx-auto text-center">
          <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-6 sm:p-8 space-y-6 shadow-md">
            <div className="text-5xl">⚠️</div>
            <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-relaxed">
              {t('error_text', lang)}
            </p>
            <button
              type="button"
              onClick={this.handleRestart}
              className="w-full min-h-[64px] py-3.5 px-6 bg-[#E8590C] text-white text-xl sm:text-2xl font-extrabold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
            >
              {t('error_restart', lang)}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
