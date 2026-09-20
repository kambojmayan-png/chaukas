'use client';

import React, { useEffect, useRef } from 'react';
import type { Choice, Lang, Surface } from '@/engine/engine';
import { t } from '@/lib/i18n';
import { SaralGuideBubble } from './SaralGuideBubble';

export interface DisplayMessage {
  from: string;
  text: string;
  label: string;
  surface?: Surface;
  via?: string;
  isOnCall?: boolean;
}

interface SaralConversationProps {
  visitKey: string;
  pastMessages: DisplayMessage[];
  currentMessage: DisplayMessage | null;
  showingChoices: boolean;
  choices?: Choice[];
  lang: Lang;
  onChoose: (choiceId: string, visitKey: string) => void;
  onSkipMessage?: () => void;
  canSkip?: boolean;
}

export function SaralConversation({
  visitKey,
  pastMessages,
  currentMessage,
  showingChoices,
  choices = [],
  lang,
  onChoose,
  onSkipMessage,
  canSkip = false,
}: SaralConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [pastMessages.length, currentMessage, showingChoices]);

  const callerInitial = currentMessage?.from?.trim()?.charAt(0)?.toUpperCase() || '📞';

  return (
    <div className="w-full flex-1 flex flex-col justify-between max-w-xl mx-auto space-y-4 min-h-0 overflow-hidden">
      {/* Scrollable Conversation History */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3.5 pr-1 min-h-0 scroll-smooth"
      >
        {/* Past Messages: Smaller and greyed out */}
        {pastMessages.map((msg, i) => (
          <div
            key={i}
            className="w-full bg-white/70 border border-[#1A1A1A]/30 rounded-[12px] p-3 text-left space-y-1 shadow-2xs"
          >
            <div className="flex items-center justify-between text-xs font-bold text-[#1A1A1A]/60 pb-1 border-b border-[#1A1A1A]/10">
              <span>{msg.label}</span>
              <span>{msg.from}</span>
            </div>
            <p className="text-base text-[#1A1A1A]/75 leading-relaxed font-medium">
              {msg.text}
            </p>
          </div>
        ))}

        {/* Current Active Message: Large and prominent */}
        {currentMessage && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {currentMessage.isOnCall ? (
              /* On a call: caller avatar with live captions */
              <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 sm:p-5 shadow-sm text-center space-y-3">
                <div className="flex items-center justify-center gap-3 pb-2 border-b border-[#1A1A1A]/10">
                  <div className="w-12 h-12 rounded-full bg-[#E6F3EE] border-2 border-[#0F6B4F] text-[#0F6B4F] flex items-center justify-center text-xl font-black">
                    {callerInitial}
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#E8590C] block">
                      {currentMessage.label}
                    </span>
                    <span className="text-lg font-bold text-[#1A1A1A]">
                      {currentMessage.from}
                    </span>
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-[1.7]" aria-live="polite">
                  "{currentMessage.text}"
                </p>
              </div>
            ) : (
              /* Regular Message: Chat, SMS, Bank SMS, or System */
              <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 sm:p-5 shadow-sm text-left space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-[#1A1A1A]/70 pb-1.5 border-b border-[#1A1A1A]/10">
                  <span className="text-[#E8590C] font-extrabold">
                    {currentMessage.label}
                  </span>
                  <span>{currentMessage.from}</span>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-[1.7]" aria-live="polite">
                  {currentMessage.text}
                </p>
              </div>
            )}

            {/* Small Next button to skip ahead */}
            {canSkip && !showingChoices && onSkipMessage && (
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={onSkipMessage}
                  className="min-h-[48px] px-4 py-2 bg-white text-[#1A1A1A] text-sm font-bold border-2 border-[#1A1A1A] rounded-full shadow-xs hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{t('next', lang)}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Choices Area */}
        {showingChoices && choices.length > 0 && (
          <div className="space-y-3 pt-2 animate-in fade-in duration-300">
            {/* Guide Bubble: "आप क्या करेंगे?" */}
            <SaralGuideBubble text={t('what_will_you_do', lang)} />

            {/* Choice Buttons: Numbered with big badges (1, 2, 3), min-height 64px, 20px bold */}
            <div className="space-y-3 pt-1">
              {choices.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onChoose(c.id, visitKey)}
                  className="w-full min-h-[64px] py-3.5 px-4 bg-white text-[#1A1A1A] border-2 border-[#1A1A1A] rounded-[16px] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer flex items-center gap-3.5 text-left"
                >
                  <span className="w-11 h-11 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center text-xl font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug">
                    {c.label[lang] || c.label.en}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
