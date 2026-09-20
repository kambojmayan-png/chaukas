'use client';

import React, { useEffect, useRef } from 'react';
import type { Message, Lang, Surface } from '@/engine/engine';

interface MessageListProps {
  messages: Message[];
  typing?: boolean;
  lang: Lang;
  skin?: Surface;
}

export function MessageList({
  messages,
  typing = false,
  lang,
  skin = 'chat',
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on messages or typing update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, typing]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-3 space-y-3 scroll-smooth"
    >
      {/* Messages */}
      {messages.map((item, idx) => (
        <div key={idx} className="flex justify-start">
          <div className="max-w-[85%] bg-white text-[#111111] border-2 border-[#111111] shadow-hard-sm rounded-md p-3 text-sm md:text-base leading-relaxed break-words">
            {item.text[lang] || item.text.en}
          </div>
        </div>
      ))}

      {/* Typing Indicator */}
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
  );
}
