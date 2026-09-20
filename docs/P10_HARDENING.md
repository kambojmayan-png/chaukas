# CHAUKAS — P10 hardening (answers the code stress test)

One package. Work autonomously, do not ask questions, do not start the dev server.
When finished run, in this order: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:layout`. Fix what fails in the app (never by weakening a test), then report what you changed and stop.

## Files the owner already replaced — do NOT edit them
`src/engine/engine.ts` (now exports `isScenario()` and a stricter `validate()`), `src/check/rules.ts` (new flag `job_bait`), `tests/run-tests.mjs`, `tests/fixtures.mjs`. Also never edit `src/scenarios/*.json`.
The owner has run `supabase/p10_hardening.sql` (adds `drill_runs.run_id`, table `rate_hits`, function `hit_rate_limit`).

## 1. No blind cast on the scenarios
`src/scenarios/index.ts` currently does `as unknown as Scenario[]`. Replace it with the runtime type guard:
```ts
import { isScenario, validate, type Scenario } from '@/engine/engine';
const RAW: unknown[] = [olx, bijli, arrest];
export const SCENARIOS: Scenario[] = RAW.filter((s): s is Scenario => {
  const ok = isScenario(s);
  if (!ok) console.error('[scenarios] rejected', (s as { id?: string })?.id, validate(s as Scenario).slice(0, 3));
  return ok;
});
if (process.env.NODE_ENV !== 'production' && SCENARIOS.length !== RAW.length) {
  throw new Error('A scenario failed validation. Run npm test for details.');
}
```
Nothing in the UI may assume there are exactly three scenarios: use `SCENARIOS.length` and a `{total}` variable in every "n of 3" string.

## 2. Types are checked, not stripped
- Remove every `any` in `src/` (start with `useState<any>` in `src/app/drill/page.tsx`: it is `RunState | null`; then the `any` parameters in `src/saral/`). Use the engine's exported types.
- ESLint: `@typescript-eslint/no-explicit-any` = `error` for `src/**`.
- `package.json`: add `"typecheck": "tsc --noEmit"`.
- `.github/workflows/test.yml`: `actions/checkout`, `actions/setup-node` (Node 22, npm cache), `npm ci`, `npm run typecheck`, `npm run lint`, `npm test`. Keep the workflow name `tests` so the README badge keeps working.

## 3. The attempt counter must survive a closed tab
Create `src/lib/attempts.ts` with `getAttempt(scenarioId)` and `nextAttempt(scenarioId)` backed by **localStorage** key `chaukas_attempt_<scenarioId>` (migrate any value found in sessionStorage once, then delete it). Both interfaces (`src/saral` and `/drill`) use it; remove their private counters. First play on a device = 1; every later play of the same scenario on that device = previous + 1, across visits. The session id stays in sessionStorage.

## 4. Telemetry that does not silently drop runs
Rewrite `src/lib/telemetry.ts`:
- Every payload gets `run_id: crypto.randomUUID()`.
- `sendRun(payload)`: try `navigator.sendBeacon`; if it is missing or returns `false`, `fetch('/api/run', { method: 'POST', keepalive: true, ... })`; if that rejects or the browser is offline, push the payload to an outbox in localStorage (`chaukas_outbox`, newest 20 items, drop anything older than 7 days).
- `flushOutbox()`: called once on app load and on the window `online` event; resends each item and removes it on a 2xx/204. Never blocks the UI, never throws.
- `/api/run`: accept `run_id` (uuid, optional) in the zod schema and insert with `upsert(..., { onConflict: 'run_id', ignoreDuplicates: true })` so a retry can never double count.

## 5. A rate limit that survives cold starts
In `/api/run`, before inserting:
- `bucket = sha256( (process.env.RATE_SALT ?? 'chaukas') + '|' + ip + '|' + Math.floor(Date.now() / 600000) )` as hex (Node `crypto`). Never store or log the IP itself.
- `const { data: allowed, error } = await supabase.rpc('hit_rate_limit', { p_bucket: bucket, p_limit: 30, p_window_seconds: 600 })`. If `allowed === false` return 204 without inserting. If the RPC errors (function not installed), fall back to the existing in-memory limiter so nothing breaks.
- Per-session cap: if this `session_id` already has 12 rows in the last hour, return 204 without inserting.
- Add `RATE_SALT=` to `.env.example`.

## 6. One typed source of truth for archetypes on /check
Replace the two switch statements (`getAudioClips`, `getAdvice`) with one object typed `Record<Archetype, { adviceKey: string; clipKey: string }>` imported type `Archetype` from `@/check/rules`, so TypeScript fails the build when an archetype is added and not handled. Entries: `receive_money_pin` and `reward_refund` → `advice_receive_money_pin` / `check__advice_receive_money_pin`; `utility_kyc_remote`; `digital_arrest`; `money_request`; **`job_task` → `advice_job_task` / `check__advice_job_task`** (new clip is in `public/voice/hi/`); `unknown` → `advice_other` / `check__advice_other`.
New strings: `advice_job_task`: "No real job asks you to pay first, or pays you for liking videos. Never pay a 'registration' or 'task' fee." / "कोई भी असली नौकरी पहले पैसे नहीं माँगती, और वीडियो लाइक करने के पैसे नहीं देती। 'रजिस्ट्रेशन' या 'टास्क' के नाम पर कभी पैसे न भेजें।" · flag label `job_bait`: "Promises easy money for small tasks" / "छोटे काम के बदले आसान कमाई का वादा". Add one "try an example" chip with a job/task scam.

## 7. Leaving early must still teach the trick
Today a user who taps "block and report" at the first message reaches the same ending as one who resisted to the end, and learns nothing about the trap. In the practice lesson (`src/saral`) and in the `/drill` debrief: when the outcome is `escaped` and the user saw fewer than two flagged items, show the title `lesson_next_title`, play `<sid>__flags`, then show up to three cards built from the scenario's UNVISITED nodes, choosing the first message or input line that carries each of these flags in this order: pin_to_receive, screen_says_pay, otp_request, remote_app, pay_to_verify, secrecy. Each card = the scammer's words (or the input detail line) + the flag chip + `flag_explain_<id>`, with `flag__<id>` played for each. Then the rule as usual.
String `lesson_next_title`: "You left at once. Here is what he would have tried next." / "आप तुरंत निकल आए। देखिए, ठग आगे क्या चाल चलता।"

## 8. Say what the numbers mean
On `/insights`, under the first-attempt vs re-try section add the note `attempt_note`: "Attempts are counted per device, across visits." / "कोशिशें हर फ़ोन पर अलग गिनी जाती हैं, और दोबारा आने पर भी याद रहती हैं।"
