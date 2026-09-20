# CHAUKAS — Quality pass v3

Work through the packages **in order, one package per prompt**. After each package: `npm run build`, `npm test`, tell the owner exactly what to verify, then stop.

## Rules for every package
- Do NOT modify `src/engine`, `src/check/rules.ts`, `src/scenarios/*.json` or `tests`. Do not start the dev server.
- Keypad privacy never changes: digits stay inside the keypad component; only `{ len, hesitationMs }` leave it.
- The practices must still complete with sound off, in English, at 320px width, and with every network request failing.
- All user-visible strings go through `t()` in `src/lib/i18n.ts` with `en` and `hi`. Use the Hindi given here exactly; for anything not given, write simple spoken Hindi in Devanagari (keep PIN, OTP, UPI, QR, SMS, WhatsApp in Latin).
- The user is 55–75, reads Hindi, has weak eyesight, double-taps by accident, and is on a cheap Android on a slow network. Every decision is judged against that person.

---

## P1 — Bugs that break the practice (do this first)

**1.1 Practice 2 is skipped (1 → 3).** Cause: `handleAnotherYes` awaits an audio clip and then does `setPracticeIdx(i => i + 1)`; a second tap during the clip runs the handler twice and increments twice.
Fix: never `await` audio inside a navigation handler. Compute `const next = practiceIdx + 1` from the current value, call `setPracticeIdx(next)` and `setScreen('precheck')` immediately, and let the pre-check screen's narration begin with `narr__next_drill`. Apply the same pattern to every handler in `SaralApp` (no awaited audio before a state change).

**1.2 A double tap chooses an option on the NEXT screen.** Choice ids are `a`, `b`, `c` on every node, so a second tap lands on the new node's option `a`.
Fix: give every node visit a `visitKey = state.path.length + ':' + node.id`. Each rendered choice button carries the `visitKey` it was rendered for; `dispatchAction` ignores a tap if that key is not the current one, or if less than 600 ms have passed since the node was entered. Add a global "navigation lock": after ANY button that changes screen or node, ignore all taps for 600 ms. The tapped button shows a pressed state at once.

**1.3 Taps while the guide is speaking do odd things.** Cause: the conversation effect is an async `for` loop with a stale `revealedMsgIndex`, and the skip button both stops the audio (which advances the loop) and increments the index (advancing twice).
Fix: replace the loop with a small deterministic player. State: `{ phase: 'messages' | 'choices' | 'input', msgIndex }`, reset on every new `visitKey`. ONE effect keyed on `[visitKey, phase, msgIndex, lang, soundOn]` plays exactly one clip, then advances once, guarded by a token so a stale continuation can never advance. The skip button only calls `stopSpeaking()`. The choice buttons appear, enabled, as soon as the LAST message starts being read (do not make the user wait for it to finish); the options clip `<sid>__<nodeId>__choices` plays after the last message ends. Any tap stops all audio first.

**1.4 Leaked timer.** The 30-second `timerSec` timeout is created inside an async function and never cleared. Keep it in a ref; clear it on every node change, on every tap, and on unmount.

**1.5 OTP looked like the PIN.** The owner replaced `src/scenarios/bijli-remote.json`: the OTP is now **739165** (the practice PIN stays 4827, one PIN for all three practices, as with a real UPI PIN). Do not hardcode either value anywhere; keep reading the OTP from the SMS message text.

**1.6 Predictable order.** Start always begins with practice 1 and goes 1 → 2 → 3. Remove "resume at the first unfinished practice". On Home, for a returning visitor, show the three practices as three large tappable rows (title from the scenario, ✓ if done) that start that practice directly.

**1.7 Never a blank page.** Wrap the app in an error boundary: a friendly card `error_text` with one button `error_restart` that reloads the page; play `narr__error_restart` when sound is on.

**1.8** Remove every `select-none`.

Strings: `error_text`: "Something went wrong. Nothing was lost. Please start again." / "कुछ गड़बड़ हो गई। आपका कोई नुक़सान नहीं हुआ। कृपया फिर से शुरू करें।" · `error_restart`: "Start again" / "फिर से शुरू करें"

Done when: tapping any button twice quickly never skips anything; 1 → 2 → 3 always; skip advances exactly one message; hanging up mid-sentence is instant; `npm test` passes.

---

## P2 — The first five seconds

**2.1 Server-render the home screen.** Today the home page shows "नमस्ते…" until JavaScript loads. The brand, tagline, sound line and Start button must be in the HTML the server sends. `src/app/page.tsx` stays a server component and renders the static Home markup itself; the client app hydrates over it. Remove the `<Suspense>` fallback. The initial language on both server and client is `'hi'`; read `?lang=` / storage in `useEffect` only (no hydration mismatch). Set `<html lang="hi">` in `layout.tsx`.

**2.2 Ship less.** Load everything after Home with `next/dynamic` when Start is tapped (prefetch it when the browser is idle). Fetch NO audio before Start; after Start, preload only the next two clips. Noto Sans Devanagari: weights 400 and 700 only, `display: 'swap'`. Do not load Space Grotesk on the home page.

**2.3 Home content, top to bottom:** the word "चौकस"; `home_tagline`; a sound row with a 🔊 icon and `home_sound_line`; under it the small line `home_no_sound_ok`; the big Start button; (returning visitors) the three practice rows; at the very bottom ONE link, in English only, grey, 48px tall: `home_dev_link` → `/about?lang=en`. Remove the other footer links from Home.

**2.4 Sound check that actually helps.** Show `sound_help` under the question from the start (not only after "No"). While the audio element is really playing (`playing` / `pause` / `ended` events) show animated equaliser bars and `sound_playing`; if `audio.play()` rejects, show `sound_blocked` and carry on with captions.

Strings: `home_sound_line`: "Turn your phone's volume up. I will explain everything aloud." / "फ़ोन की आवाज़ बढ़ा लीजिए। मैं सब कुछ बोलकर समझाऊँगी।" · `home_no_sound_ok`: "No sound? That's fine. Everything is also written on the screen." / "आवाज़ न आए तो भी कोई बात नहीं। सब कुछ स्क्रीन पर लिखा भी रहेगा।" · `home_dev_link`: "For judges & developers →" (same in both languages) · `sound_playing`: "Sound is playing" / "आवाज़ चल रही है" · `sound_blocked`: "Your phone is not allowing sound. Please read along." / "आपका फ़ोन आवाज़ नहीं चला पा रहा। कृपया पढ़ते हुए आगे बढ़ें।"

Done when: with JavaScript disabled the home page still shows brand, tagline, sound line and button; Lighthouse mobile on `/`: Performance ≥ 90, Accessibility ≥ 95 (proposed targets); no audio request before the first tap.

---

## P3 — One language for the whole site

One `LangProvider` (client, mounted in `layout.tsx`) owns the language: stored in `sessionStorage` key `chaukas_lang`, **default `'hi'` on every new visit**, `?lang=` overrides, and it updates `document.documentElement.lang`. Delete Saral's private language state and the old localStorage logic; every page and component reads the same context. The toggle is one component, in the same top-right place on every page. Links from the elder pages to judge/developer pages add `?lang=en`. Wrap any Hindi shown inside an English page (and the reverse) in an element with the right `lang` attribute.

Done when: switching language on any page carries to every other page in that visit; a new visit starts in Hindi; `<html lang>` always matches.

---

## P4 — One design system

Create `src/ui/`: design tokens as CSS variables in `globals.css` (paper `#FBF7F0`, ink `#1A1A1A`, guide green `#0F6B4F` / `#E6F3EE`, saffron `#E8590C`, red `#C92A2A`, green `#2B8A3E`, amber `#E67700`, radius 16px, soft shadow) and components `AppShell`, `TopBar`, `BackButton`, `Button` (primary | secondary | choice), `Card`, `Chip`, `PageTitle`. Rebuild `/about`, `/judge`, `/insights`, `/check` and the chrome of `/drill` with them. Remove monospace, uppercase, letter-spacing and hard offset shadows everywhere except the engine-log lines and JSON in the Glass Box. The simulated phone inside `/drill` keeps its own look.

Every page except Home has the same top bar: brand (→ `/`), a large `back_to_practice` button, the language toggle. Base font 18px on these pages (20px in the practice flow), tap targets ≥ 48px, no link smaller than 16px.

`/about` opens warmly, in the visitor's language, in this order: `about_lead`; "How it works" in three short steps; "Why practise" (the fraud figures with their source, then the root cause); "For judges & developers" (links to `/judge`, `/drill`, `/insights`, `/check`, GitHub).

Strings: `back_to_practice`: "← Back to the practice" / "← अभ्यास पर वापस" · `about_lead`: "Chaukas lets people practise staying safe from phone and UPI scams, in a safe place where no real money is involved. It was made for our parents and grandparents." / "चौकस लोगों को फ़ोन और UPI की ठगी से बचने का अभ्यास कराता है, एक सुरक्षित जगह पर, जहाँ कोई असली पैसा नहीं लगता। यह हमारे माता-पिता और दादा-दादी के लिए बनाया गया है।"

Done when: all pages look like one product; an elder who lands on any page can see a big way back.

---

## P5 — An /insights page worth opening

The owner has run `supabase/insights_v2.sql`. Read the `insights_v2` view in `/api/insights` (fall back to the old `insights` view if it does not exist). Build the page from these sections, each with its **n** and one plain sentence explaining what it means; when n < 30 add the chip `early_numbers`:
1. The Knowledge–Behaviour Gap: `sum(knew_but_fell) / sum(knew_rule_first)`, with a two-line "how this is measured".
2. Fall rate per practice (first attempts), each with its one-line trap.
3. What people did: scammed / escaped late / escaped, as one stacked bar per practice.
4. Hesitation: average pause at the keypad among people who were scammed.
5. Red flags walked past, on average, out of the total.
6. Does practice help: first-attempt vs re-try fall rate.
7. Who played: simple interface vs detailed view, Hindi share, family-link share, runs in the last 24 hours.
8. Method and limits: anonymous, self-selected hackathon sample, not representative, no personal data stored.
Plain CSS bars, no chart library, never a placeholder number; if there is no data say so. Link to `/insights` only from `/about` and `/judge`.

String: `early_numbers`: "Early numbers" / "शुरुआती आँकड़े"

---

## P6 — A message checker an elder can use

Rebuild `/check` on the shared shell. A large text box; above it one big button `paste_button` that calls `navigator.clipboard.readText()` and fills the box (if the browser refuses, show `paste_help`). The Check button is ALWAYS enabled: when the box is empty show `check_empty` next to it and play `check__empty`. The result is one big card: icon + colour + verdict, the matched phrases highlighted with plain-language labels, then the advice line. When sound is on, play `check__likely_scam` | `check__suspicious` | `check__none`, then `check__advice_<archetype>` (`money_request`, `digital_arrest`, `utility_kyc_remote`, `receive_money_pin` (also for `reward_refund`), `other`). A `replay` button repeats it. A "🔊 यह पेज क्या करता है" button plays `check__intro` (never autoplay). "Practise this scam" goes to `/?practice=<scenarioId>` (the practice flow starts that practice directly), not to `/drill`. Keep `checkMessage()` client-side; nothing pasted leaves the device.

Strings: `paste_button`: "📋 Paste the message" / "📋 मैसेज चिपकाएँ" · `paste_help`: "Press and hold inside the box, then choose Paste." / "डिब्बे के अंदर उँगली दबाकर रखिए, फिर Paste चुनिए।" · `check_empty`: "First paste a message in the box above." / "पहले ऊपर वाले डिब्बे में मैसेज चिपकाइए।"

---

## P7 — Accessibility sweep
Sizes in `rem` so the phone's font-size setting is respected; visible focus rings; `aria-live="polite"` on captions and results; every icon-only button has an `aria-label`; contrast AA; `prefers-reduced-motion` respected; tap targets ≥ 48px (≥ 64px in the practice flow) with ≥ 12px between them; correct `lang` attributes on mixed-language text. Test the home page and one full practice once with TalkBack switched on and fix what is unreadable.
