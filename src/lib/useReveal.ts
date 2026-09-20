'use client';
import { useEffect, useState } from 'react';

/** Reveals a node's messages one by one. StrictMode-safe: every effect run schedules its own timer and cleans up its own timer. */
export function useReveal(visitKey: string, delays: number[]) {
  const [st, setSt] = useState({ key: visitKey, shown: 0 });
  const shown = st.key === visitKey ? st.shown : 0;   // new node visit => starts from 0 without a reset effect
  const total = delays.length;
  useEffect(() => {
    if (shown >= total) return;
    const id = window.setTimeout(() => setSt({ key: visitKey, shown: shown + 1 }), delays[shown] ?? 900);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitKey, shown, total]);
  return { shown, typing: shown < total, done: shown >= total };
}
