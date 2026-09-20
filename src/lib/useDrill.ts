'use client';
import { useCallback, useMemo, useState } from 'react';
import { start, step, result, type Scenario, type Action, type RunState, type RunResult } from '@/engine/engine';

export function useDrill(s: Scenario) {
  const [st, setSt] = useState<RunState>(() => start(s, Date.now()));
  const act = useCallback((a: Action) => setSt(p => (p.done ? p : step(s, p, a, Date.now()))), [s]);
  const res: RunResult | null = useMemo(() => (st.done ? result(s, st, Date.now()) : null), [s, st]);
  return { node: s.nodes[st.nodeId], state: st, act, result: res };
}
