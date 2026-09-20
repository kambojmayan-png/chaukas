'use client';

import React, { useState, useRef } from 'react';

interface PinPadProps {
  kind: 'pin' | 'otp';
  prompt: string;
  detail: string;
  practicePin: string;
  onSubmit: (len: number, hesitationMs: number) => void;
  onCancel: () => void;
}

export function PinPad({
  kind,
  prompt,
  detail,
  practicePin,
  onSubmit,
  onCancel,
}: PinPadProps) {
  // CRITICAL PRIVACY: Digits stay ONLY in local component state.
  // Never expose digits in props, context, storage, logs, URLs, or network calls.
  const [digits, setDigits] = useState<string>('');
  const mountedAtRef = useRef<number>(Date.now());
  const firstKeyAtRef = useRef<number | null>(null);

  const targetLen = kind === 'pin' ? 4 : 6;

  const handleDigit = (digit: string) => {
    if (firstKeyAtRef.current === null) {
      firstKeyAtRef.current = Date.now();
    }
    if (digits.length < targetLen) {
      setDigits(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setDigits(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (digits.length === targetLen) {
      const hesitationMs =
        firstKeyAtRef.current !== null
          ? firstKeyAtRef.current - mountedAtRef.current
          : 0;
      // Only report length and hesitationMs - NEVER digits
      onSubmit(digits.length, hesitationMs);
    }
  };

  const isReady = digits.length === targetLen;

  return (
    <div className="flex-1 flex flex-col justify-between bg-white p-4">
      {/* Top Bar with Cancel / Go back */}
      <div className="flex items-center justify-between border-b border-[#111111]/10 pb-2">
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[48px] px-3 -ml-3 text-sm font-semibold text-[#111111] hover:underline flex items-center gap-1"
        >
          <span>←</span>
          <span>Cancel / Go back</span>
        </button>
        <span className="text-xs font-mono text-[#111111]/60 uppercase">
          {kind === 'pin' ? 'UPI AUTH' : 'SMS OTP'}
        </span>
      </div>

      {/* Center Details & Prompt */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-4">
        {/* Detail: normal small type exactly like real UPI sheet, NOT highlighted */}
        <div className="text-center px-2">
          <p className="text-xs text-[#111111]/70 leading-normal font-normal">
            {detail}
          </p>
        </div>

        {/* Prompt */}
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold text-[#111111]">{prompt}</h2>
          {kind === 'pin' && (
            <div className="inline-block bg-[#F6F3EC] border border-[#111111] text-xs px-2.5 py-1 rounded-md font-mono text-[#111111]">
              Practice PIN: <strong>{practicePin}</strong>
            </div>
          )}
        </div>

        {/* PIN/OTP Dots */}
        <div className="flex items-center justify-center space-x-3 py-2">
          {Array.from({ length: targetLen }).map((_, i) => {
            const filled = i < digits.length;
            return (
              <div
                key={i}
                className={`w-3.5 h-3.5 rounded-full border-2 border-[#111111] transition-all ${
                  filled ? 'bg-[#111111]' : 'bg-transparent'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Keypad Grid */}
      <div className="border-t-2 border-[#111111] pt-3 pb-1">
        <div className="grid grid-cols-3 gap-2 max-w-[320px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="min-h-[52px] h-13 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-2xl font-bold tabular-nums flex items-center justify-center hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              {d}
            </button>
          ))}

          {/* Backspace */}
          <button
            type="button"
            onClick={handleBackspace}
            aria-label="Backspace"
            className="min-h-[52px] h-13 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-xl font-bold flex items-center justify-center hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            ⌫
          </button>

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="min-h-[52px] h-13 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-2xl font-bold tabular-nums flex items-center justify-center hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            0
          </button>

          {/* Submit (✓) */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReady}
            aria-label="Submit PIN"
            className={`min-h-[52px] h-13 border-2 border-[#111111] rounded-md shadow-hard-sm text-2xl font-bold flex items-center justify-center transition-all ${
              isReady
                ? 'bg-[#FF5A1F] text-white hover:opacity-95 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 border-neutral-300 cursor-not-allowed shadow-none'
            }`}
          >
            ✓
          </button>
        </div>
      </div>
    </div>
  );
}
