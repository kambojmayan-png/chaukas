'use client';

/**
 * Tracks scenario attempt count per device across visits via localStorage.
 * Migrates legacy sessionStorage counters once, then clears them.
 */
export function getAttempt(scenarioId: string): number {
  if (typeof window === 'undefined') return 1;
  try {
    const localKey = `chaukas_attempt_${scenarioId}`;
    const sessionKey = `chaukas_attempt_${scenarioId}`;

    // Migrate from sessionStorage once if present
    const sessionVal = sessionStorage.getItem(sessionKey);
    if (sessionVal !== null) {
      if (localStorage.getItem(localKey) === null) {
        localStorage.setItem(localKey, sessionVal);
      }
      sessionStorage.removeItem(sessionKey);
    }

    const val = localStorage.getItem(localKey);
    return val ? Math.max(1, parseInt(val, 10) || 1) : 1;
  } catch {
    return 1;
  }
}

export function nextAttempt(scenarioId: string): number {
  if (typeof window === 'undefined') return 2;
  try {
    const current = getAttempt(scenarioId);
    const next = current + 1;
    localStorage.setItem(`chaukas_attempt_${scenarioId}`, String(next));
    return next;
  } catch {
    return 2;
  }
}
