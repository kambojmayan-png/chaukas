'use client';

import React, { useState, useRef } from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface SaralKeypadProps {
  kind: 'pin' | 'otp';
  purpose?: 'enter_own_pin' | 'share_otp';
  prompt: string;
  detail: string;
  practicePin: string;
  expectedCode?: string;
  lang: Lang;
  onSubmit: (len: number, hesitationMs: number) => void;
  onCancel: () => void;
  onWrongEntry?: () => void;
}

export function SaralKeypad({
  kind,
  purpose,
  prompt,
  detail,
  practicePin,
  expectedCode,
  lang,
  onSubmit,
  onCancel,
  onWrongEntry,
}: SaralKeypadProps) {
  // CRITICAL PRIVACY: Digits stay ONLY in local component state.
  // Never expose digits in props, storage, logs, URLs, or network calls.
  const [digits, setDigits] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mountedAtRef = useRef<number>(Date.now());
  const firstKeyAtRef = useRef<number | null>(null);

  const effectivePurpose = purpose ?? (kind === 'otp' ? 'share_otp' : 'enter_own_pin');
  const targetLen = effectivePurpose === 'enter_own_pin' && kind === 'pin' ? 4 : 6;

  const handleDigit = (digit: string) => {
    if (firstKeyAtRef.current === null) {
      firstKeyAtRef.current = Date.now();
    }
    if (errorMsg) setErrorMsg(null);

    if (digits.length < targetLen) {
      const next = digits + digit;
      setDigits(next);
    }
  };

  const handleBackspace = () => {
    if (errorMsg) setErrorMsg(null);
    setDigits(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (digits.length !== targetLen) return;

    const hesitationMs =
      firstKeyAtRef.current !== null
        ? firstKeyAtRef.current - mountedAtRef.current
        : 0;

    if (effectivePurpose === 'share_otp') {
      setErrorMsg(null);
      // Privacy rule: report only length and hesitationMs - never the digits
      onSubmit(digits.length, hesitationMs);
      return;
    }

    const expected = expectedCode || (kind === 'pin' ? practicePin : '');

    if (digits === expected) {
      setErrorMsg(null);
      onSubmit(digits.length, hesitationMs);
    } else {
      // Wrong entry: show wrong_pin_text, clear digits, play narr__wrong_pin
      setErrorMsg(t('wrong_pin_text', lang));
      setDigits('');
      onWrongEntry?.();
    }
  };

  const isReady = digits.length === targetLen;

  return (
    <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-3 sm:p-5 shadow-sm space-y-2 sm:space-y-3.5 text-center">
      {/* Detail: normal plain text, NOT highlighted, NOT read aloud */}
      {detail && (
        <div className="text-left bg-neutral-50 p-2 sm:p-3 rounded-[12px] border border-[#1A1A1A]/20">
          <p className="text-xs sm:text-base text-[#1A1A1A]/80 leading-normal font-normal">
            {detail}
          </p>
        </div>
      )}

      {/* PIN Practice Chip (only for entering own PIN) */}
      {effectivePurpose === 'enter_own_pin' && kind === 'pin' && (
        <div className="inline-block bg-[#FBF7F0] border-2 border-[#1A1A1A]/30 text-[#1A1A1A] px-3 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-sm sm:text-base font-bold leading-normal">
          {t('practice_pin_chip', lang)}
        </div>
      )}

      {/* Prompt / Title & Helper */}
      <div className="space-y-1">
        <h3 className="text-lg sm:text-2xl font-bold text-[#1A1A1A] leading-snug">
          {effectivePurpose === 'share_otp' ? t('otp_share_title', lang) : prompt}
        </h3>
        {effectivePurpose === 'share_otp' && (
          <p className="text-xs sm:text-sm text-[#1A1A1A]/80 leading-snug">
            {t('otp_share_helper', lang)}
          </p>
        )}
      </div>

      {/* PIN/OTP Dots */}
      <div
        role="status"
        aria-live="polite"
        aria-label={`${digits.length} of ${targetLen} digits entered`}
        className="flex items-center justify-center gap-2.5 py-0.5"
      >
        {Array.from({ length: targetLen }).map((_, i) => {
          const filled = i < digits.length;
          return (
            <div
              key={i}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-[#1A1A1A] transition-all ${
                filled ? 'bg-[#1A1A1A]' : 'bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div role="alert" aria-live="assertive" className="bg-red-50 border-2 border-[#C92A2A] rounded-[12px] p-2">
          <p className="text-xs sm:text-base font-bold text-[#C92A2A] leading-snug">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Keypad Grid (keys responsive for mobile) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full max-w-[288px] mx-auto pt-0.5">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="min-h-[46px] h-12 sm:min-h-[60px] sm:h-14 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-xl sm:text-3xl font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
          >
            {d}
          </button>
        ))}

        {/* Backspace */}
        <button
          type="button"
          onClick={handleBackspace}
          aria-label={lang === 'hi' ? 'हटाएँ' : 'Backspace'}
          className="min-h-[46px] h-12 sm:min-h-[60px] sm:h-14 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-xl sm:text-2xl font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          ⌫
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="min-h-[46px] h-12 sm:min-h-[60px] sm:h-14 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-xl sm:text-3xl font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          0
        </button>

        {/* Clear */}
        <button
          type="button"
          onClick={() => {
            if (errorMsg) setErrorMsg(null);
            setDigits('');
          }}
          aria-label={lang === 'hi' ? 'साफ़ करें' : 'Clear'}
          className="min-h-[46px] h-12 sm:min-h-[60px] sm:h-14 bg-[#FBF7F0] text-[#1A1A1A]/70 border-2 border-[#1A1A1A] rounded-[14px] text-sm sm:text-base font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          C
        </button>
      </div>

      {/* Row for Go Back and OK / Read it out */}
      <div className="grid grid-cols-2 gap-2.5 pt-1 w-full max-w-[288px] mx-auto">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] sm:min-h-[56px] py-2 sm:py-3 px-3 sm:px-4 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-base sm:text-xl font-bold hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          {t('go_back', lang)}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          className={`min-h-[48px] sm:min-h-[56px] py-2 sm:py-3 px-2 sm:px-3 text-base sm:text-xl font-bold rounded-[14px] border-2 transition-all ${
            isReady
              ? 'bg-[#E8590C] text-white border-[#1A1A1A] hover:opacity-95 active:scale-95 cursor-pointer shadow-sm'
              : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
          }`}
        >
          {effectivePurpose === 'share_otp' ? t('otp_read_out', lang) : t('ok', lang)}
        </button>
      </div>
    </div>
  );
}
