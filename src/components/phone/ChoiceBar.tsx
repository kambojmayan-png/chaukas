'use client';

import React from 'react';
import type { Choice, Lang } from '@/engine/engine';

interface ChoiceBarProps {
  choices?: Choice[];
  lang: Lang;
  onChoose: (choiceId: string) => void;
}

export function ChoiceBar({ choices, lang, onChoose }: ChoiceBarProps) {
  if (!choices || choices.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t-2 border-[#111111] p-3 space-y-2 shrink-0">
      {choices.map(choice => (
        <button
          key={choice.id}
          type="button"
          onClick={() => onChoose(choice.id)}
          className="w-full min-h-[48px] py-3 px-3.5 bg-[#F6F3EC] text-[#111111] border-2 border-[#111111] rounded-md shadow-hard-sm text-left text-sm md:text-base font-semibold hover:bg-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-between"
        >
          <span>{choice.label[lang] || choice.label.en}</span>
          <span className="text-xs font-mono ml-2 opacity-60">→</span>
        </button>
      ))}
    </div>
  );
}
