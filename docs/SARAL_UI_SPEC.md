# CHAUKAS — the elder-first interface (v2, supersedes every earlier UI brief)

## Who this is for
A 55–75-year-old who reads Hindi, uses WhatsApp, may or may not use UPI, has weak eyesight, is afraid of pressing the wrong thing, and opened this link because their son or daughter forwarded it. If a developer finds a screen confusing, this person cannot use it at all. Judges are NOT the audience of this interface.

## Ten rules every screen must obey
1. Hindi first, on every visit. English is a choice the user makes, per visit.
2. A guide voice ("चौकस दीदी") explains every screen. Captions always show what she is saying.
3. ONE thing per screen. At most 3 buttons. The main button is always at the bottom, always visible without scrolling.
4. Buttons: full width, min-height 64px, 20px bold text, at least 12px apart. Choices are numbered with a big badge (1, 2, 3) to match the spoken "पहला, दूसरा, तीसरा".
5. Text: base 20px, headings 28–32px, line-height 1.7. No ALL CAPS, no letter-spacing, no monospace, no English jargon. Never show the words: drill, simulation, pre-check, archetype, telemetry, engine.
6. A calm, familiar look: warm paper background #FBF7F0, ink #1A1A1A, guide green #0F6B4F (guide bubble background #E6F3EE), main button saffron #E8590C with white text, choice buttons white with a 2px ink border (never colour-code choices), result colours red #C92A2A / green #2B8A3E / amber #E67700. Radius 16px, soft shadows. Emoji icons are fine (🔊 ▶ ✓ 📞 💬 ✉️).
7. No visible timers, no countdowns, no pressure from the interface itself. The pressure comes from the scammer's words and voice only.
8. It is always obvious WHO is speaking: the guide (green bubble, 👩 avatar, name "चौकस दीदी") or the other person (white bubble, their name and initial).
9. A persistent reassurance chip in the top bar: "यह अभ्यास है, असली नहीं".
10. Tapping anything stops the voice at once. "🔊 फिर से सुनें" is on every screen.

## Hard engineering rules
- Do NOT modify `src/engine`, `src/check`, `src/scenarios/*.json` or `tests`. Do not start the dev server.
- Do NOT edit or delete the existing pages (`/drill`, `/check`, `/insights`, `/judge`, current landing). Build the new interface as a fresh UI layer in **`src/saral/`**, served at the NEW route **`/saral`**. Do not reuse the old visual components (PhoneFrame, MessageList, ChoiceBar, GlassBox, Debrief, Report). DO reuse the logic: `engine.ts` (start, step, result, knowledgeBehaviourGap), `useDrill`, the scenario JSON, `PRACTICE_PIN`, `sendRun`, `i18n.ts` / `t()`, the shared audio element + queue in `speak.ts`, `voiceManifest.json`, `voiceDurations.json`, and the keypad's validation + privacy logic (digits never leave the keypad component; only `{ len, hesitationMs }` go up).
- Everything must still work with sound off, in English, at 320px width, and with every network request failing.
- Never make 1930 a `tel:` link. This is a practice app; an accidental real call to the helpline is not acceptable.

## Language
Inside `/saral` the language starts as **Hindi on every visit**: keep it in `sessionStorage` only (key `chaukas_saral_lang`), ignore the old localStorage value, still honour `?lang=en`. One small pill at the top right: shows "English" while in Hindi and "हिंदी" while in English.

## Audio
79 new Hindi clips are in `public/voice/hi/` (the manifest script picks them up; durations are in `voiceDurations.json`). Manifest keys are `hi/<key>`:
- Guide: `narr__soundcheck`, `narr__welcome`, `narr__howto`, `narr__practice_pin`, `narr__one_question`, `narr__call_incoming`, `narr__keypad_pin`, `narr__keypad_otp`, `narr__wrong_pin`, `narr__lesson_fell`, `narr__lesson_safe`, `narr__if_real`, `narr__another_or_stop`, `narr__next_drill`, `narr__bye`, `narr__knew_but_fell`, `narr__final_all_safe`, `narr__final_some`
- Per scenario (`<sid>` = olx-qr | bijli-remote | digital-arrest): `<sid>__setup`, `<sid>__precheck`, `<sid>__rule`, `<sid>__flags`, `<sid>__end_scammed`, `<sid>__end_escaped`, `<sid>__end_late`
- EVERY message of EVERY node: `<sid>__<nodeId>__<index>`
- EVERY decision: `<sid>__<nodeId>__choices` (the guide reads the options in order)
- One explanation per trick: `flag__urgency`, `flag__fear`, `flag__authority`, `flag__secrecy`, `flag__too_good`, `flag__pin_to_receive`, `flag__otp_request`, `flag__remote_app`, `flag__unofficial_contact`, `flag__pay_to_verify`, `flag__screen_says_pay`

Add to `speak.ts`: `playClip(key, fallbackText, lang): Promise<void>`. Hindi + key in manifest → play through the shared audio element and queue. English or missing clip → browser TTS with `fallbackText`; no TTS voice → just wait. Sound off → play nothing and wait `clamp(text.length * 70, 1500, 8000)` ms so captions are still readable, but let the user tap "आगे बढ़ें" to skip. The promise resolves when the clip ends OR `stopSpeaking()` is called. Unlock the shared audio element inside the very first tap.
Write `src/saral/useNarration.ts`: `say(items: { key, text }[])` plays items in order and exposes `{ speaking, currentIndex, replay(), stop() }`; the screen shows the text of the item being spoken as a caption.

## Screens, in order (one client component with a small state machine)

**0. Home** (nothing else on the page): the word "चौकस" large, `home_tagline`, ONE huge saffron button `home_start`, the hint `home_hint` under it. Tiny links at the very bottom: `for_judges` → /judge, `detailed_view` → /drill. Returning visitor (localStorage `chaukas_saral_done` has entries): under the button show three small rows, one per practice, with ✓ on finished ones; Start begins at the first unfinished practice.

**1. Sound check.** Guide bubble with `soundcheck_text`; play `narr__soundcheck`. Buttons: green `sound_yes`, white `sound_no`. If no → card `sound_help` with buttons `replay` and `continue_without_sound` (turns sound off).

**2. What this is.** Play `narr__welcome`, caption `welcome_text`. Button `next`.

**3. How it works.** Play `narr__howto`, caption `howto_text`, plus a tiny static illustration of two numbered buttons and the "🔊 फिर से सुनें" button. Button `next`.

**4. Practice PIN.** "4 8 2 7" very large under `practice_pin_title`; play `narr__practice_pin`. Button `next`.

**Then, for each practice (olx-qr → bijli-remote → digital-arrest):**

**5. One question.** Play `narr__one_question` then `<sid>__precheck`; show `scenario.precheck.q[lang]` large. Two equal neutral buttons हाँ / नहीं side by side (min-height 72px). Tiny link `skip_question`. Save exactly as /drill does (knew = answer === precheck.correct; null if skipped; timestamp; same sessionStorage structure).

**6. The situation.** Guide bubble with `scenario.setup[lang]`; play `<sid>__setup`. Button `next`.

**7. The conversation** (driven by `useDrill`):
- Incoming call: when a node's surface is call/videocall and the previous node was not → full-screen call card (big round avatar with the caller's initial, `node.from`, `incoming_call`), play `narr__call_incoming` and the existing ring, ONE green button `pick_up`.
- Messages appear ONE AT A TIME. The current message is large; earlier messages of this practice stay above it, smaller and greyed, in a scrollable area that auto-scrolls. Bubble label by type: chat → the sender's name; SMS → `label_sms`; message with `via: 'sms'` during a call → `label_bank_sms`; system dialog → `label_system`; on a call the text is shown as live captions under the caller's avatar with label `label_call`. For each message: `await playClip('<sid>__<nodeId>__<i>', text, lang)`. A small `next` button skips ahead.
- After the last message, if the node has choices: guide bubble `what_will_you_do`, then the numbered buttons (enabled immediately), then play `<sid>__<nodeId>__choices`. A tap stops audio and dispatches `{ type: 'choose', choiceId }`.
- If the node has `input`: large keypad (keys ≥ 64px, one row for ✓ `ok` and `go_back`). PIN pads show the chip `practice_pin_chip`. Show `input.detail[lang]` in normal plain text: not highlighted, not read aloud (the user has to notice it, as in real life). Play `narr__keypad_pin` / `narr__keypad_otp` once. Wrong entry → message `wrong_pin_text` + `narr__wrong_pin`, clear, retry.
- `timerSec` nodes: no visible timer. After the choices audio ends, 30 s with no tap → dispatch `{ type: 'timeout' }`.
- A small link `leave_practice` at the very top asks `leave_confirm` and returns Home.

**8. Result.** Full-width colour band, big icon, title: scammed → red `result_scammed`; escaped → green `result_escaped`; escaped_late → amber `result_late`. If money was lost: `lost_amount`. Play `<sid>__end_scammed|escaped|late`. Send telemetry here exactly as /drill does, with `source` = 'saral' (or 'saral_family' when `?src=family`). Mark the practice done in localStorage. Button `see_how`.

**9. The lesson, explained.** Title `lesson_fell` or `lesson_safe`; play `narr__lesson_fell` / `narr__lesson_safe`. Build up to 3 "trick cards" from the messages and input screens the user actually saw that carry red flags: one card per distinct flag, in this priority: pin_to_receive, otp_request, remote_app, pay_to_verify, screen_says_pay, secrecy, unofficial_contact, authority, fear, urgency, too_good. Each card = the scammer's words (or the input detail line) in a white bubble + a red chip with the flag label + the sentence `flag_explain_<id>`. Play `flag__<id>` for each card in turn, highlighting the card being explained. If the user saw fewer than 2 flagged items (they left at once), skip the cards and play `<sid>__flags` with the caption `flags_summary_<sid>`.
Then the rule in a big bordered card under `remember`; play `<sid>__rule`.
The first time the user is scammed in this visit, also show `helpline_card` and play `narr__if_real`.
Button `next`.

**10. Another one?** (only if practices remain) Play `narr__another_or_stop`. Buttons: saffron `another_yes`, white `another_no`. Yes → play `narr__next_drill` → screen 5 of the next practice. No → screen 11.

**11. The end.** Title `final_title` (x = practices not scammed, y = practices done). If `knowledgeBehaviourGap(...).knewButFell > 0`: bordered box `you_knew_the_rule` + play `narr__knew_but_fell`. Then play `narr__final_all_safe` (nothing lost and all 3 done), else `narr__final_some`; if the user stopped early play `narr__bye` instead. Always show `helpline_card`. Buttons: green `send_family` → `https://wa.me/?text=` + encodeURIComponent(t('share_text') + ' ' + origin + '/?src=family'); white `practice_again` → Home. Small links: `detailed_view`, `check_msg_link`, `for_judges`.

## Top bar (all screens except Home)
Left: "चौकस". Centre: chip `practice_chip`. Right: language pill, sound button (56px, 🔊/🔇, labels `sound_on` / `sound_off`). Under it, only inside a practice: progress text `practice_n` and the `leave_practice` link.

## Strings: add to i18n.ts exactly (en / hi)
home_tagline: "Practise staying safe from scams. It takes 3 minutes." / "ठगी से बचने का अभ्यास। बस 3 मिनट।"
home_start: "▶ Start" / "▶ शुरू करें"
home_hint: "Press the button. A voice will explain everything." / "बटन दबाइए। आवाज़ आपको सब समझाएगी।"
practice_chip: "This is practice, not real" / "यह अभ्यास है, असली नहीं"
soundcheck_text: "Namaste! I am Chaukas Didi. Can you hear my voice?" / "नमस्ते! मैं चौकस दीदी हूँ। क्या आपको मेरी आवाज़ सुनाई दे रही है?"
sound_yes: "✓ Yes, I can hear you" / "✓ हाँ, सुनाई दे रही है" · sound_no: "No, I cannot" / "नहीं सुनाई दे रही"
sound_help: "Press the volume button on the side of your phone to make it louder." / "फ़ोन के किनारे वाला बटन दबाकर आवाज़ बढ़ाइए।"
continue_without_sound: "Continue without sound" / "बिना आवाज़ के आगे बढ़ें"
welcome_text: "This is a practice for staying safe from scams. It is not real. None of your real money will go anywhere, and we will never ask for your real PIN, OTP or bank details." / "यह ठगी से बचने का एक अभ्यास है। यह असली नहीं है। इसमें आपका कोई असली पैसा नहीं जाएगा, और हम आपसे कभी आपका असली PIN, OTP या बैंक की जानकारी नहीं पूछेंगे।"
howto_text: "A pretend scammer will now message or call you. Do exactly what you would do in real life. I will read every message aloud. Then choose one of the big buttons below. To listen again, press 'Hear again'." / "अभी आपके फ़ोन पर एक नक़ली ठग का मैसेज या कॉल आएगा। आपको वही करना है जो आप असल ज़िंदगी में करते। हर मैसेज मैं आपको पढ़कर सुनाऊँगी। फिर नीचे दिए बड़े बटनों में से एक चुनिए। दोबारा सुनना हो तो 'फिर से सुनें' दबाइए।"
next: "Continue ▶" / "आगे बढ़ें ▶" · replay: "🔊 Hear again" / "🔊 फिर से सुनें"
sound_on: "Sound on" / "आवाज़ चालू" · sound_off: "Sound off" / "आवाज़ बंद"
practice_pin_title: "Your practice PIN" / "आपका नक़ली PIN" · practice_pin_chip: "Practice PIN: 4827" / "नक़ली PIN: 4827"
practice_n: "Practice {n} of 3" / "अभ्यास {n} / 3"
skip_question: "skip this question" / "यह सवाल छोड़ें"
label_sms: "New SMS" / "नया SMS" · label_bank_sms: "SMS from your bank" / "आपके बैंक का SMS" · label_call: "On the call" / "कॉल पर" · label_system: "Your phone is asking" / "आपका फ़ोन पूछ रहा है"
what_will_you_do: "What will you do?" / "आप क्या करेंगे?"
incoming_call: "Incoming call…" / "कॉल आ रही है…" · pick_up: "📞 Pick up" / "📞 उठाएँ"
ok: "OK ✓" / "ठीक है ✓" · go_back: "Go back" / "वापस जाएँ"
wrong_pin_text: "That PIN is wrong. The practice PIN is 4827." / "यह PIN ग़लत है। नक़ली PIN 4827 है।"
leave_practice: "Leave this practice" / "अभ्यास छोड़ें" · leave_confirm: "Leave this practice and go to the start?" / "क्या यह अभ्यास छोड़कर शुरुआत पर जाना है?"
result_scammed: "You were scammed" / "आप फँस गए" · result_escaped: "You stayed safe!" / "आप बच गए!" · result_late: "A narrow escape" / "बाल-बाल बचे"
lost_amount: "₹{x} of practice money is gone" / "नक़ली ₹{x} चले गए"
see_how: "See how ▶" / "देखें कैसे ▶"
lesson_fell: "How the scammer trapped you" / "ठग ने आपको कैसे फँसाया" · lesson_safe: "The scammer's tricks" / "ठग की चालें"
remember: "Remember" / "याद रखिए"
helpline_card: "If this really happens: call 1930 at once, then call your bank." / "असल में ऐसा हो जाए तो तुरंत 1930 पर कॉल करें, फिर अपने बैंक को।"
another_yes: "▶ One more practice" / "▶ एक और अभ्यास" · another_no: "That's enough for today" / "आज के लिए बस"
final_title: "You stayed safe {x} out of {y} times" / "{y} में से {x} बार आप बच गए"
send_family: "Send to family on WhatsApp" / "परिवार को WhatsApp पर भेजें" · practice_again: "Practise again" / "दोबारा अभ्यास करें"
share_text: "A 3-minute practice for staying safe from scams. Everything is explained aloud in Hindi. Please try it once:" / "ठगी से बचने का 3 मिनट का अभ्यास। सब कुछ हिंदी में बोलकर समझाया जाता है। एक बार ज़रूर कीजिए:"
detailed_view: "See the detailed analysis" / "पूरा विश्लेषण देखें" · check_msg_link: "Check a suspicious message" / "कोई संदिग्ध मैसेज जाँचें" · for_judges: "For judges" / "जजों के लिए"
flag_explain_urgency: "Here the scammer rushed you, so that you could not think." / "यहाँ ठग ने जल्दी मचाई, ताकि आप सोच न पाएँ।"
flag_explain_fear: "Here the scammer frightened you." / "यहाँ ठग ने आपको डराया।"
flag_explain_authority: "Here the scammer claimed to be an officer or someone you can trust." / "यहाँ ठग ने ख़ुद को अधिकारी या भरोसेमंद आदमी बताया।"
flag_explain_secrecy: "Here the scammer told you not to tell anyone. Real officers never say that." / "यहाँ ठग ने कहा कि किसी को मत बताना। असली अधिकारी ऐसा कभी नहीं कहते।"
flag_explain_too_good: "This deal was too good. A buyer who pays in full without bargaining is often a scammer." / "यह सौदा ज़रूरत से ज़्यादा अच्छा था। बिना मोल-भाव के पूरा पैसा देने वाला ख़रीदार अक्सर ठग होता है।"
flag_explain_pin_to_receive: "Here the scammer asked for your PIN to 'receive' money. A PIN is only for sending money." / "यहाँ ठग ने पैसा लेने के लिए PIN माँगा। PIN सिर्फ़ पैसा भेजने के लिए होता है।"
flag_explain_otp_request: "Here the scammer asked for your OTP. Never tell your OTP to anyone." / "यहाँ ठग ने OTP माँगा। OTP कभी किसी को नहीं बताना चाहिए।"
flag_explain_remote_app: "Here the scammer made you install an app so that he could see your screen." / "यहाँ ठग ने एक ऐप इंस्टॉल करवाया, ताकि वह आपकी स्क्रीन देख सके।"
flag_explain_unofficial_contact: "This number did not belong to any government office. Always take the number from your bill or the official app." / "यह नंबर किसी सरकारी दफ़्तर का नहीं था। सही नंबर हमेशा अपने बिल या आधिकारिक ऐप से लीजिए।"
flag_explain_pay_to_verify: "Here the scammer asked for money in the name of a 'check'. No real check ever asks for money." / "यहाँ ठग ने जाँच के नाम पर पैसे माँगे। कोई असली जाँच पैसे नहीं माँगती।"
flag_explain_screen_says_pay: "The screen clearly said you were PAYING, not receiving." / "स्क्रीन पर साफ़ लिखा था कि आप भुगतान कर रहे हैं, पैसा ले नहीं रहे।"
flags_summary_olx-qr: "This scammer used three tricks: he claimed to be a soldier, he rushed you, and he asked for your PIN to 'receive' money." / "इस ठग ने तीन चालें चलीं: ख़ुद को फ़ौजी बताया, जल्दी मचाई, और पैसा लेने के नाम पर PIN डलवाना चाहा।"
flags_summary_bijli-remote: "This scammer frightened you about a power cut, claimed to be an officer, made you install a screen-sharing app, and then asked for your OTP." / "इस ठग ने बिजली कटने का डर दिखाया, ख़ुद को अधिकारी बताया, स्क्रीन देखने वाला ऐप इंस्टॉल करवाया, और आख़िर में OTP माँगा।"
flags_summary_digital-arrest: "This scammer frightened you, claimed to be a police officer, told you to tell no one, and then asked for money in the name of a check." / "इस ठग ने पहले डराया, ख़ुद को पुलिस अफ़सर बताया, कहा किसी को मत बताना, और आख़िर में जाँच के नाम पर पैसे माँगे।"

## Done means
- `/saral` works from Home to The end, in Hindi with sound on: every screen speaks, every message is read aloud, every decision is read aloud, every lesson is explained, and any tap stops the voice at once.
- It also works with sound off, in English (browser voice), offline after the first load, and at 320px with the main button always visible without scrolling.
- Telemetry rows arrive with `source = 'saral'` and the correct `knew_rule`.
- No old visual component is imported by anything in `src/saral/`.
- `npm run build` and `npm test` pass. Tell me exactly what to verify.
