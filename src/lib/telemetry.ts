'use client';

/**
 * Fire-and-forget telemetry beacon. Never blocks the drill.
 */
export function sendRun(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon(
        '/api/run',
        new Blob([body], { type: 'application/json' })
      );
    } else if (typeof fetch !== 'undefined') {
      fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* never block the drill */
  }
}
