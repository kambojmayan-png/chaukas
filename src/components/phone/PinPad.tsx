'use client';

import React, { useState, useRef } from 'react';
import type { Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface PinPadProps {
  kind: 'pin' | 'otp';
  purpose?: 'enter_own_pin' | 'share_otp';
  prompt: string;
  detail: string;
  practicePin: string;
  expectedCode?: string;
  lang?: Lang;
  onSubmit: (len: number, hesitationMs: number) => void;
  onCancel: () => void;
}

export function PinPad({
  kind,
  purpose,
  prompt,
  detail,
  practicePin,
  expectedCode,
  lang = 'en',
  onSubmit,
  onCancel,
}: PinPadProps) {
  // CRITICAL PRIVACY: Digits stay ONLY in local component state.
  // Never expose digits in props, context, storage, logs, URLs, or network calls.
  const [digits, setDigits] = useState<string>('');
  const [error, setError] = useState<{ message: string; subtext?: string } | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // hesitationMs = time from keypad mount to the first key press of the FIRST attempt.
  // Never reset or overwrite on subsequent attempts.
  const mountedAtRef = useRef<number>(Date.now());
  const firstKeyAtRef = useRef<number | null>(null);

  const effectivePurpose = purpose ?? (kind === 'otp' ? 'share_otp' : 'enter_own_pin');
  const targetLen = effectivePurpose === 'enter_own_pin' && kind === 'pin' ? 4 : 6;

  const validateAndSubmit = (codeToTest: string) => {
    const hesitationMs =
      firstKeyAtRef.current !== null
        ? firstKeyAtRef.current - mountedAtRef.current
        : 0;

    if (effectivePurpose === 'share_otp') {
      if (codeToTest.length === targetLen) {
        setError(null);
        // Privacy rule: Only report length and hesitationMs - NEVER digits
        onSubmit(codeToTest.length, hesitationMs);
      }
      return;
    }

    const expected = expectedCode ?? (kind === 'pin' ? practicePin : '');

    if (codeToTest === expected) {
      setError(null);
      // Only report length and hesitationMs - NEVER digits
      onSubmit(codeToTest.length, hesitationMs);
    } else {
      // Wrong entry -> do NOT dispatch anything. Shake dots, clear them, and show error.
      setIsShaking(true);
      setDigits('');
      if (kind === 'pin') {
        setError({
          message: t('incorrect_pin', lang),
          subtext: t('incorrect_pin_subtext', lang),
        });
      } else {
        setError({
          message: t('incorrect_otp', lang),
        });
      }

      setTimeout(() => {
        setIsShaking(false);
      }, 500);
    }
  };

  const handleDigit = (digit: string) => {
    // Record first key press of the first attempt only
    if (firstKeyAtRef.current === null) {
      firstKeyAtRef.current = Date.now();
    }

    // Clear error once user starts typing a new attempt
    if (error) {
      setError(null);
    }

    if (digits.length < targetLen) {
      const next = digits + digit;
      setDigits(next);

      // In share_otp mode, do NOT auto-submit! The user must press the confirm button.
      if (effectivePurpose !== 'share_otp' && kind === 'otp' && next.length === 6) {
        setTimeout(() => {
          validateAndSubmit(next);
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    if (error) setError(null);
    setDigits(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (digits.length === targetLen) {
      validateAndSubmit(digits);
    }
  };

  const isReady = digits.length === targetLen;

  return (
    <div className="flex-1 flex flex-col justify-between bg-white p-2.5 min-[480px]:p-4 min-h-0 overflow-y-auto">
      {/* Top Bar with Cancel / Go back */}
      <div className="flex items-center justify-between border-b border-[#111111]/10 pb-1.5 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[40px] px-2 -ml-2 text-xs min-[480px]:text-sm font-semibold text-[#111111] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>←</span>
          <span>{effectivePurpose === 'share_otp' ? t('go_back', lang) : t('cancel_go_back', lang)}</span>
        </button>
        <span className="text-[10px] min-[480px]:text-xs font-mono text-[#111111]/60 uppercase font-semibold">
          {kind === 'pin' ? t('upi_auth_badge', lang) : t('sms_otp_badge', lang)}
        </span>
      </div>

      {/* Center Details & Prompt */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-2 min-h-0">
        {/* Detail: normal small type exactly like real UPI sheet, NOT highlighted */}
        {detail && (
          <div className="text-center px-2">
            <p className="text-[11px] min-[480px]:text-xs text-[#111111]/70 leading-tight font-normal">
              {detail}
            </p>
          </div>
        )}

        {/* Prompt */}
        <div className="text-center space-y-1 px-2">
          <h2 className="text-base min-[480px]:text-lg font-bold text-[#111111] leading-tight">
            {effectivePurpose === 'share_otp' ? t('otp_share_title', lang) : prompt}
          </h2>
          {effectivePurpose === 'share_otp' && (
            <p className="text-[11px] min-[480px]:text-xs text-[#111111]/80 leading-snug">
              {t('otp_share_helper', lang)}
            </p>
          )}
          {effectivePurpose === 'enter_own_pin' && kind === 'pin' && (
            <div className="inline-block bg-[#F6F3EC] border border-[#111111] text-[11px] min-[480px]:text-xs px-2 py-0.5 rounded-md font-mono text-[#111111]">
              {t('practice_pin', lang)}: <strong>{practicePin}</strong>
            </div>
          )}
        </div>

        {/* PIN/OTP Dots with Shake Animation on Error */}
        <div
          className={`flex items-center justify-center space-x-2.5 py-1 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {Array.from({ length: targetLen }).map((_, i) => {
            const filled = i < digits.length;
            return (
              <div
                key={i}
                className={`w-3 h-3 min-[480px]:w-3.5 min-[480px]:h-3.5 rounded-full border-2 border-[#111111] transition-all ${
                  filled ? 'bg-[#111111]' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>

        {/* Local Validation Error Notice */}
        {error && (
          <div className="text-center px-2 space-y-0.5 max-w-[320px]">
            <p className="text-xs font-bold text-[#D92D20] leading-tight">
              {error.message}
            </p>
            {error.subtext && (
              <p className="text-[10px] min-[480px]:text-[11px] text-neutral-500 leading-tight">
                {error.subtext}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Keypad Grid */}
      <div className="border-t-2 border-[#111111] pt-2 pb-1 shrink-0">
        <div className="grid grid-cols-3 gap-1.5 min-[480px]:gap-2 max-w-[320px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="min-h-[44px] h-11 min-[480px]:min-h-[52px] min-[480px]:h-13 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-xl min-[480px]:text-2xl font-bold tabular-nums flex items-center justify-center hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              {d}
            </button>
          ))}

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            aria-label={t('backspace', lang)}
            className="min-h-[44px] h-11 min-[480px]:min-h-[52px] min-[480px]:h-13 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-lg min-[480px]:text-xl font-bold flex items-center justify-center hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            ⌫
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="min-h-[44px] h-11 min-[480px]:min-h-[52px] min-[480px]:h-13 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-xl min-[480px]:text-2xl font-bold tabular-nums flex items-center justify-center hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            0
          </button>

          {/* Submit (✓ or Read it out) */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReady}
            aria-label={
              effectivePurpose === 'share_otp'
                ? t('otp_read_out', lang)
                : kind === 'pin'
                ? t('submit_pin', lang)
                : t('submit_otp', lang)
            }
            className={`min-h-[44px] h-11 min-[480px]:min-h-[52px] min-[480px]:h-13 border-2 border-[#111111] rounded-md shadow-hard-sm ${
              effectivePurpose === 'share_otp'
                ? 'text-xs min-[480px]:text-sm px-1 leading-tight'
                : 'text-xl min-[480px]:text-2xl'
            } font-bold flex items-center justify-center transition-all ${
              isReady
                ? 'bg-[#FF5A1F] text-white hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none'
            }`}
          >
            {effectivePurpose === 'share_otp' ? t('otp_read_out', lang) : '✓'}
          </button>
        </div>
      </div>
    </div>
  );
}
