'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { playClip, stopSpeaking } from '@/lib/speak';
import type { Lang } from '@/engine/engine';

export interface NarrationItem {
  key: string;
  text: string;
}

export interface UseNarrationOptions {
  lang: Lang;
  soundOn: boolean;
}

export function useNarration({ lang, soundOn }: UseNarrationOptions) {
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const currentItemsRef = useRef<NarrationItem[]>([]);
  const abortRef = useRef<boolean>(false);
  const runIdRef = useRef<number>(0);

  // Stop playback on unmount
  useEffect(() => {
    return () => {
      abortRef.current = true;
      stopSpeaking();
    };
  }, []);

  const stop = useCallback(() => {
    abortRef.current = true;
    runIdRef.current += 1;
    stopSpeaking();
    setSpeaking(false);
  }, []);

  const say = useCallback(
    async (items: NarrationItem[]) => {
      // Abort any active narration
      abortRef.current = true;
      runIdRef.current += 1;
      const currentRunId = runIdRef.current;
      stopSpeaking();

      if (!items || items.length === 0) {
        setSpeaking(false);
        setCurrentIndex(0);
        currentItemsRef.current = [];
        return;
      }

      currentItemsRef.current = items;
      abortRef.current = false;
      setSpeaking(true);
      setCurrentIndex(0);

      for (let i = 0; i < items.length; i++) {
        if (abortRef.current || runIdRef.current !== currentRunId) {
          break;
        }
        setCurrentIndex(i);
        const item = items[i];
        await playClip(item.key, item.text, lang, soundOn);
      }

      if (runIdRef.current === currentRunId) {
        setSpeaking(false);
      }
    },
    [lang, soundOn]
  );

  const replay = useCallback(() => {
    if (currentItemsRef.current.length > 0) {
      say([...currentItemsRef.current]);
    }
  }, [say]);

  const currentItem = currentItemsRef.current[currentIndex] || null;

  return {
    speaking,
    currentIndex,
    currentItem,
    say,
    replay,
    stop,
  };
}
