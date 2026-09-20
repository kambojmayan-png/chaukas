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
  onReplay?: () => void;
}

function getHeaderContent(msg: DisplayMessage, lang: Lang): { kind: 'call'; label: string; caller: string } | { kind: 'single'; text: string } {
  const isSmsDuringCall = msg.via === 'sms' && (msg.isOnCall || msg.surface === 'call' || msg.surface === 'videocall');
  if (isSmsDuringCall) {
    return { kind: 'single', text: t('label_bank_sms', lang) };
  }
  if (msg.surface === 'call' || msg.surface === 'videocall' || (msg.isOnCall && msg.via !== 'sms')) {
    return { kind: 'call', label: t('label_call', lang), caller: msg.from || 'Caller' };
  }
  if (msg.surface === 'sms' || msg.via === 'sms') {
    return { kind: 'single', text: t('label_sms', lang) };
  }
  if (msg.surface === 'system') {
    return { kind: 'single', text: t('label_system', lang) };
  }
  // For chat: sender name (node.from)
  return { kind: 'single', text: msg.from || 'Chat' };
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
  onReplay,
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
        {pastMessages.map((msg, i) => {
          const header = getHeaderContent(msg, lang);
          return (
            <div
              key={i}
              className="w-full bg-white/70 border border-[#1A1A1A]/30 rounded-[12px] p-3 text-left space-y-1 shadow-2xs"
            >
              <div className="text-xs font-bold text-[#1A1A1A]/60 pb-1 border-b border-[#1A1A1A]/10 min-w-0 break-words">
                {header.kind === 'call' ? (
                  <div>
                    <span className="block">{header.label}</span>
                    <span className="block text-[#1A1A1A]/80 font-bold">{header.caller}</span>
                  </div>
                ) : (
                  <span className="block">{header.text}</span>
                )}
              </div>
              <p className="text-base text-[#1A1A1A]/75 leading-relaxed font-medium break-words">
                {msg.text}
              </p>
            </div>
          );
        })}

        {/* Current Active Message: Large and prominent */}
        {currentMessage && (
          <div className="space-y-3 animate-in fade-in duration-200">
            {(() => {
              const header = getHeaderContent(currentMessage, lang);

              if (currentMessage.isOnCall) {
                return (
                  /* On a call: caller avatar with live captions */
                  <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 sm:p-5 shadow-sm text-center space-y-3">
                    <div className="flex items-center justify-center gap-3 pb-2 border-b border-[#1A1A1A]/10 min-w-0 break-words">
                      <div className="w-12 h-12 rounded-full bg-[#E6F3EE] border-2 border-[#0F6B4F] text-[#0F6B4F] flex items-center justify-center text-xl font-black shrink-0">
                        {callerInitial}
                      </div>
                      <div className="text-left min-w-0 break-words">
                        {header.kind === 'call' ? (
                          <>
                            <span className="text-xs font-bold uppercase tracking-wider text-[#E8590C] block break-words">
                              {header.label}
                            </span>
                            <span className="text-lg font-bold text-[#1A1A1A] block break-words">
                              {header.caller}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-bold uppercase tracking-wider text-[#E8590C] block break-words">
                            {header.text}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-[1.7] break-words" aria-live="polite">
                      "{currentMessage.text}"
                    </p>
                  </div>
                );
              }

              return (
                /* Regular Message: Chat, SMS, Bank SMS, or System */
                <div className="bg-white border-2 border-[#1A1A1A] rounded-[16px] p-4 sm:p-5 shadow-sm text-left space-y-2">
                  <div className="text-sm font-bold text-[#1A1A1A]/70 pb-1.5 border-b border-[#1A1A1A]/10 min-w-0 break-words">
                    {header.kind === 'call' ? (
                      <div>
                        <span className="text-[#E8590C] font-extrabold block break-words">
                          {header.label}
                        </span>
                        <span className="text-[#1A1A1A] font-bold block break-words">
                          {header.caller}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[#E8590C] font-extrabold block break-words">
                        {header.text}
                      </span>
                    )}
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-[#1A1A1A] leading-[1.7] break-words" aria-live="polite">
                    {currentMessage.text}
                  </p>
                </div>
              );
            })()}

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
                  <span className="text-lg sm:text-xl font-bold text-[#1A1A1A] leading-snug break-words">
                    {c.label[lang] || c.label.en}
                  </span>
                </button>
              ))}
            </div>

            {/* Replay button under choices */}
            {onReplay && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onReplay}
                  className="w-full min-h-[56px] py-3 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer text-center"
                >
                  {t('replay', lang)}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Replay button while messages are being read */}
        {!showingChoices && onReplay && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onReplay}
              className="w-full min-h-[56px] py-3 px-4 bg-white text-[#1A1A1A] text-lg font-bold rounded-[16px] border-2 border-[#1A1A1A] shadow-sm hover:bg-neutral-50 active:scale-95 transition-all cursor-pointer text-center"
            >
              {t('replay', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
