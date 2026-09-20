'use client';

import React, { useState, useRef } from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface SaralKeypadProps {
  kind: 'pin' | 'otp';
  prompt: string;
  detail: string;
  practicePin: string;
  expectedCode: string;
  lang: Lang;
  onSubmit: (len: number, hesitationMs: number) => void;
  onCancel: () => void;
  onWrongEntry: () => void;
}

export function SaralKeypad({
  kind,
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

  const targetLen = kind === 'pin' ? 4 : 6;

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
    if (digits.length === 0) return;

    const hesitationMs =
      firstKeyAtRef.current !== null
        ? firstKeyAtRef.current - mountedAtRef.current
        : 0;

    const expected = expectedCode || (kind === 'pin' ? practicePin : '');

    if (digits === expected) {
      setErrorMsg(null);
      onSubmit(digits.length, hesitationMs);
    } else {
      // Wrong entry: show wrong_pin_text, clear digits, play narr__wrong_pin
      setErrorMsg(t('wrong_pin_text', lang));
      setDigits('');
      onWrongEntry();
    }
  };

  const isReady = digits.length === targetLen;

  return (
    <div className="w-full bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 sm:p-6 shadow-sm space-y-4 text-center">
      {/* Detail: normal plain text, NOT highlighted, NOT read aloud */}
      {detail && (
        <div className="text-left bg-neutral-50 p-3 rounded-[12px] border border-[#1A1A1A]/20">
          <p className="text-base text-[#1A1A1A]/80 leading-normal font-normal">
            {detail}
          </p>
        </div>
      )}

      {/* PIN Practice Chip */}
      {kind === 'pin' && (
        <div className="inline-block bg-[#FBF7F0] border-2 border-[#1A1A1A]/30 text-[#1A1A1A] px-3.5 py-1 rounded-full text-base font-bold leading-normal">
          {t('practice_pin_chip', lang)}
        </div>
      )}

      {/* Prompt */}
      <div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-snug">
          {prompt}
        </h3>
      </div>

      {/* PIN/OTP Dots */}
      <div className="flex items-center justify-center gap-3 py-1">
        {Array.from({ length: targetLen }).map((_, i) => {
          const filled = i < digits.length;
          return (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-[#1A1A1A] transition-all ${
                filled ? 'bg-[#1A1A1A]' : 'bg-transparent'
              }`}
            />
          );
        })}
      </div>

      {/* Error Notice */}
      {errorMsg && (
        <div className="bg-red-50 border-2 border-[#C92A2A] rounded-[12px] p-2.5">
          <p className="text-base font-bold text-[#C92A2A] leading-snug">
            {errorMsg}
          </p>
        </div>
      )}

      {/* Keypad Grid (keys >= 64px) */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[340px] mx-auto pt-1">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
          <button
            key={d}
            type="button"
            onClick={() => handleDigit(d)}
            className="min-h-[64px] h-16 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-2xl sm:text-3xl font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
          >
            {d}
          </button>
        ))}

        {/* Backspace */}
        <button
          type="button"
          onClick={handleBackspace}
          aria-label="Backspace"
          className="min-h-[64px] h-16 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-2xl font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          ⌫
        </button>

        {/* Zero */}
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="min-h-[64px] h-16 bg-[#FBF7F0] text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-2xl sm:text-3xl font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
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
          className="min-h-[64px] h-16 bg-[#FBF7F0] text-[#1A1A1A]/70 border-2 border-[#1A1A1A] rounded-[14px] text-base font-bold flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          C
        </button>
      </div>

      {/* Row for Go Back and OK ✓ */}
      <div className="grid grid-cols-2 gap-3 pt-2 max-w-[340px] mx-auto">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[64px] py-3 px-4 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[14px] text-lg sm:text-xl font-bold hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer"
        >
          {t('go_back', lang)}
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady}
          className={`min-h-[64px] py-3 px-4 text-lg sm:text-xl font-bold rounded-[14px] border-2 transition-all ${
            isReady
              ? 'bg-[#E8590C] text-white border-[#1A1A1A] hover:opacity-95 active:scale-95 cursor-pointer shadow-sm'
              : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed'
          }`}
        >
          {t('ok', lang)}
        </button>
      </div>
    </div>
  );
}
