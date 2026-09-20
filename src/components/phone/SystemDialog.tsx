'use client';

import React from 'react';
import type { Choice, Message, Lang } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface SystemDialogProps {
  title?: string;
  messages?: Message[];
  choices?: Choice[];
  lang: Lang;
  done: boolean;
  onChoose: (choiceId: string) => void;
}

export function SystemDialog({
  title,
  messages = [],
  choices = [],
  lang,
  done,
  onChoose,
}: SystemDialogProps) {
  const displayTitle = title || t('system_permission', lang);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-xs relative z-30">
      <div className="w-full max-w-[320px] bg-white border-2 border-[#111111] rounded-md shadow-hard p-5 space-y-4 text-center">
        {/* Warning / Remote Icon */}
        <div className="w-12 h-12 mx-auto rounded-full bg-[#F6F3EC] border-2 border-[#111111] flex items-center justify-center text-xl font-bold">
          📱
        </div>

        {/* Dialog Header */}
        <div>
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#FF5A1F] block">
            {t('system_request', lang)}
          </span>
          <h2 className="text-lg font-bold text-[#111111] leading-tight">
            {displayTitle}
          </h2>
        </div>

        {/* Messages */}
        <div className="space-y-2">
          {messages.map((m, idx) => (
            <p
              key={idx}
              className="text-sm text-[#111111] font-medium leading-normal bg-[#F6F3EC] p-3 rounded border border-[#111111] break-words [overflow-wrap:anywhere]"
            >
              {m.text[lang] || m.text.en}
            </p>
          ))}
        </div>

        {/* Choices as Dialog Buttons */}
        {done && choices.length > 0 && (
          <div className="pt-2 space-y-2">
            {choices.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChoose(c.id)}
                className="w-full min-h-[48px] py-2.5 px-4 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-sm font-bold hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                {c.label[lang] || c.label.en}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
