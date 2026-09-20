'use client';

const OUTBOX_KEY = 'chaukas_outbox';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface OutboxItem {
  payload: Record<string, unknown>;
  createdAt: number;
}

function getOutbox(): OutboxItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    if (!raw) return [];
    const items: OutboxItem[] = JSON.parse(raw);
    const now = Date.now();
    return items.filter(
      it => it && typeof it.createdAt === 'number' && now - it.createdAt <= SEVEN_DAYS_MS
    );
  } catch {
    return [];
  }
}

function saveOutbox(items: OutboxItem[]) {
  if (typeof window === 'undefined') return;
  try {
    const now = Date.now();
    const valid = items
      .filter(it => it && typeof it.createdAt === 'number' && now - it.createdAt <= SEVEN_DAYS_MS)
      .slice(-20);
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(valid));
  } catch {
    /* ignore */
  }
}

function pushToOutbox(payload: Record<string, unknown>) {
  try {
    const outbox = getOutbox();
    outbox.push({ payload, createdAt: Date.now() });
    saveOutbox(outbox);
  } catch {
    /* ignore */
  }
}

export async function flushOutbox(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const outbox = getOutbox();
    if (outbox.length === 0) return;

    const remaining: OutboxItem[] = [];
    for (const item of outbox) {
      try {
        const res = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
          keepalive: true,
        });
        if (!res.ok && res.status !== 204) {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }
    saveOutbox(remaining);
  } catch {
    /* never blocks UI, never throws */
  }
}

// Initialize on app load and on online event
if (typeof window !== 'undefined') {
  flushOutbox().catch(() => {});
  window.addEventListener('online', () => {
    flushOutbox().catch(() => {});
  });
}

/**
 * Fire-and-forget telemetry beacon with localStorage fallback outbox. Never blocks the drill.
 */
export function sendRun(payload: Record<string, unknown>) {
  try {
    if (!payload.run_id) {
      payload.run_id = crypto.randomUUID();
    }

    const body = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      pushToOutbox(payload);
      return;
    }

    let sent = false;
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      sent = navigator.sendBeacon(
        '/api/run',
        new Blob([body], { type: 'application/json' })
      );
    }

    if (!sent) {
      if (typeof fetch !== 'undefined') {
        fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        })
          .then(res => {
            if (!res.ok && res.status !== 204) {
              pushToOutbox(payload);
            }
          })
          .catch(() => {
            pushToOutbox(payload);
          });
      } else {
        pushToOutbox(payload);
      }
    }
  } catch {
    /* never block the drill */
  }
}
