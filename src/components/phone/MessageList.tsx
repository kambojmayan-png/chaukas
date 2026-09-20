'use client';

import React, { useEffect, useRef } from 'react';
import type { Message, Lang, Surface } from '@/engine/engine';
import { t } from '@/lib/i18n';

interface MessageListProps {
  messages: Message[];
  typing?: boolean;
  lang: Lang;
  skin?: Surface;
  from?: string;
  callSeconds?: number;
}

export function MessageList({
  messages,
  typing = false,
  lang,
  skin = 'chat',
  from,
  callSeconds = 0,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when messages or typing updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, typing]);

  // Messages with via !== 'sms' (SMS banner is rendered on phone frame)
  const surfaceMessages = messages.filter(m => m.via !== 'sms');

  // Format elapsed call time
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Surface 1: SMS (Flat grey cards with sender number on top) */}
      {skin === 'sms' && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth bg-[#F6F3EC]"
        >
          {surfaceMessages.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#E5E5E5] border-2 border-[#111111] shadow-hard-sm rounded-md p-3 text-left space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#111111]/80 border-b border-[#111111]/20 pb-1">
                <span>FROM: {from || '+91 82•••••391'}</span>
                <span>SMS</span>
              </div>
              <p className="text-sm md:text-base text-[#111111] leading-relaxed font-medium">
                {item.text[lang] || item.text.en}
              </p>
              <div className="text-[10px] font-mono text-[#111111]/60 text-right">
                {t('delivered', lang)}
              </div>
            </div>
          ))}

          {typing && (
            <div className="bg-[#E5E5E5] border-2 border-[#111111] shadow-hard-sm rounded-md px-3 py-2 w-fit flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#111111] animate-bounce"></span>
            </div>
          )}
        </div>
      )}

      {/* Surface 2: CALL (Dark screen, caller name, pulsing avatar, elapsed timer, captions) */}
      {skin === 'call' && (
        <div className="flex-1 flex flex-col justify-between p-4 bg-[#0E0E10] text-[#F6F3EC] select-none">
          {/* Top: Caller Info & Timer */}
          <div className="text-center space-y-1 pt-2">
            <h2 className="text-xl font-bold tracking-tight text-white">
              {from || t('officer_on_call', lang)}
            </h2>
            <div className="text-sm font-mono text-[#12B76A] font-semibold">
              ● {t('connected', lang)} · {formatTime(callSeconds)}
            </div>
          </div>

          {/* Center: Pulsing Audio Wave Avatar */}
          <div className="flex flex-col items-center justify-center my-auto py-4">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-[#111111] border-2 border-white/30 flex items-center justify-center text-3xl shadow-lg z-10">
                📞
              </div>
              <div className="absolute w-32 h-32 rounded-full border border-white/20 animate-ping opacity-30 pointer-events-none" />
              <div className="absolute w-40 h-40 rounded-full border border-white/10 animate-pulse pointer-events-none" />
            </div>
            <span className="text-xs font-mono text-white/60 mt-4 tracking-wider uppercase">
              {t('audio_call', lang)}
            </span>
          </div>

          {/* Bottom: Captions / Transcript */}
          <div
            ref={scrollRef}
            className="w-full max-h-40 overflow-y-auto space-y-2 bg-black/80 border border-white/20 rounded-md p-3"
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] text-center">
              {t('live_transcript_captions', lang)}
            </div>
            {surfaceMessages.map((item, idx) => (
              <p
                key={idx}
                className="text-sm md:text-base font-semibold text-yellow-300 text-center leading-snug"
              >
                "{item.text[lang] || item.text.en}"
              </p>
            ))}
            {typing && (
              <p className="text-xs font-mono text-white/70 text-center animate-pulse">
                {t('speaking', lang)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Surface 3: VIDEOCALL (Same as call + CSS camera tile with uniform avatar + small 'you' tile) */}
      {skin === 'videocall' && (
        <div className="flex-1 flex flex-col justify-between p-3 bg-[#0E0E10] text-[#F6F3EC] select-none space-y-3">
          {/* Main Video Camera Tile */}
          <div className="relative bg-slate-900 border-2 border-[#111111] rounded-md overflow-hidden flex-1 min-h-[220px] flex flex-col items-center justify-center shadow-inner">
            {/* Top Bar inside Camera */}
            <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20">
              <span className="bg-red-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>REC · LIVE</span>
              </span>
              <span className="text-xs font-mono text-white/90 bg-black/60 px-2 py-0.5 rounded">
                {formatTime(callSeconds)}
              </span>
            </div>

            {/* Uniform-Style Avatar */}
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-yellow-500/80 flex items-center justify-center text-4xl shadow-md relative">
                👮‍♂️
                <span className="absolute -bottom-1 bg-yellow-500 text-black text-[9px] font-mono font-extrabold px-1 rounded uppercase">
                  POLICE
                </span>
              </div>
              <div className="text-center px-2">
                <p className="text-xs font-bold text-white tracking-wide">
                  {from || t('cyber_crime_officer', lang)}
                </p>
                <p className="text-[10px] font-mono text-yellow-400">
                  {t('govt_cyber_police', lang)}
                </p>
              </div>
            </div>

            {/* Small 'You' Camera Tile (Picture-in-Picture) */}
            <div className="absolute bottom-2 right-2 w-16 h-20 bg-neutral-800 border border-white/40 rounded shadow-md flex flex-col items-center justify-center p-1 z-20">
              <span className="text-lg">👤</span>
              <span className="text-[8px] font-mono text-white/90 mt-0.5 text-center leading-none">
                {t('you', lang)}
              </span>
              <span className="text-[7px] font-mono text-green-400">{t('cam_on', lang)}</span>
            </div>
          </div>

          {/* Transcript Captions */}
          <div
            ref={scrollRef}
            className="w-full max-h-36 overflow-y-auto space-y-1.5 bg-black/85 border border-white/20 rounded-md p-2.5 shrink-0"
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#FF5A1F] text-center">
              {t('video_call_captions', lang)}
            </div>
            {surfaceMessages.map((item, idx) => (
              <p
                key={idx}
                className="text-sm font-semibold text-yellow-300 text-center leading-snug"
              >
                "{item.text[lang] || item.text.en}"
              </p>
            ))}
            {typing && (
              <p className="text-xs font-mono text-white/70 text-center animate-pulse">
                {t('officer_speaking', lang)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Surface 4: CHAT (Default chat bubbles) */}
      {(skin === 'chat' || skin === 'upi' || skin === 'system') && (
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth bg-[#F6F3EC]"
        >
          {surfaceMessages.map((item, idx) => (
            <div key={idx} className="flex justify-start">
              <div className="max-w-[85%] bg-white text-[#111111] border-2 border-[#111111] shadow-hard-sm rounded-md p-3 text-sm md:text-base leading-relaxed break-words">
                {item.text[lang] || item.text.en}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-[#111111] shadow-hard-sm rounded-md px-3 py-2 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#111111] animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#111111] animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#111111] animate-bounce"></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
