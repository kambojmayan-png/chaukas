// /check — deterministic red-flag finder for a pasted SMS / WhatsApp message.
// Code decides the verdict. An LLM (optional) may only add a plain-language explanation.
// Honesty rule: we never say "safe". The best verdict is "no red flags found".

export type Flag =
  | 'urgency' | 'fear' | 'authority' | 'secrecy' | 'too_good' | 'pin_to_receive'
  | 'otp_request' | 'remote_app' | 'unofficial_contact' | 'pay_to_verify' | 'bad_link'
  | 'money_request' | 'new_number' | 'job_bait';
export type Archetype = 'receive_money_pin' | 'utility_kyc_remote' | 'digital_arrest' | 'reward_refund' | 'job_task' | 'money_request' | 'unknown';
export interface Finding { flag: Flag; start: number; end: number; match: string }
export interface CheckResult {
  verdict: 'likely_scam' | 'suspicious' | 'no_red_flags_found';
  score: number; archetype: Archetype; drillId: string | null; findings: Finding[]; flags: Flag[];
}

const W: Record<Flag, number> = {
  otp_request: 4, pin_to_receive: 4, remote_app: 4, pay_to_verify: 4, secrecy: 3, bad_link: 3,
  unofficial_contact: 2, fear: 2, urgency: 1, authority: 1, too_good: 3, money_request: 3, new_number: 2, job_bait: 3,
};

// English + Hinglish + Devanagari. No \b around Devanagari (JS \b is ASCII-only).
const P: [Flag, RegExp][] = [
  ['urgency', /\b(immediately|urgent(ly)?|right now|within \d+ ?(min|minutes|hrs?|hours)|tonight|today only|last chance|expire[sd]?|turant|abhi|jaldi|aaj raat)\b|तुरंत|अभी|जल्दी|आज रात|आख़िरी मौक़ा|आखिरी मौका|अंतिम (मौक़ा|मौका|चेतावनी)/gi],
  ['fear', /\b(disconnect(ed|ion)?|block(ed)?|suspend(ed)?|deactivat(ed|ion)|seized|arrest(ed)?|warrant|legal action|fir|penalty|kat jayeg[ai]|band ho jayeg[ai])\b|काट दी जाएगी|कट जाएग[ीा]|बंद हो जाएग[ाी]|गिरफ़्तार|गिरफ्तार|वारंट|कानूनी कार्रवाई|ज़ब्त/gi],
  ['authority', /\b(cbi|ed|customs?|trai|rbi|police|cyber ?crime|income tax|court|officer|army|narcotics|ncb)\b|पुलिस|अधिकारी|कस्टम|अदालत|सीबीआई/gi],
  ['secrecy', /\b(do ?n[o']t (tell|inform|call|contact) (anyone|anybody|family|police)|keep (it|this) (secret|confidential)|stay on (the )?(call|camera)|digital arrest|kisi ko (mat|na) bata)/gi],
  ['secrecy', /(परिवार|पुलिस|घर ?वालों|किसी) को (मत|न) बता|किसी को (फ़ोन|फोन|कॉल) (मत|न)|डिजिटल अरेस्ट|कैमरा (चालू|ऑन) रख/g],
  ['too_good', /\b(won|winner|lottery|lucky draw|cashback of|prize|reward of|kbc|free gift|refund of ?(rs|₹|inr))\b|लॉटरी|इनाम|जीत(ा|े) है|कैशबैक/gi],
  ['pin_to_receive', /\b(enter|put|type|daal\w*)\b[^.!?\n]{0,40}\b(upi )?pin\b[^.!?\n]{0,50}\b(receive|credit(ed)?|get|refund|cashback|aa jayeg\w*|mil jayeg\w*)\b/gi],
  ['pin_to_receive', /\b(receive|credit(ed)?|refund|cashback)\b[^.!?\n]{0,50}\b(scan|enter|approve)\b[^.!?\n]{0,30}\b(qr|pin|request)\b/gi],
  ['pin_to_receive', /(पैसा|पैसे|रक़म|रकम|रिफंड)[^।.!?\n]{0,40}(पाने|लेने|आने)[^।.!?\n]{0,40}(PIN|पिन|QR|स्कैन)/gi],
  ['remote_app', /\b(any ?desk|team ?viewer|quick ?support|rust ?desk|screen ?shar(e|ing)|remote (access|support) app|install (the |this |an? )?(apk|app from (this|the) link))\b|स्क्रीन शेयर/gi],
  ['pay_to_verify', /\b(test|token|verification|refundable|security) (payment|deposit|amount|fee)\b|\b(pay|transfer|send)\b[^.!?\n]{0,30}\b(to verify|for verification|safe account|secure account|rbi account)\b|टेस्ट पेमेंट|वेरिफिकेशन (के लिए|अकाउंट)/gi],
  // Someone asking YOU to send money. Alone = "suspicious" (verify on a number you already know), never "likely scam".
  ['money_request', /\b(send|transfer|pay|deposit|gpay|paytm|phonepe|lend|give)\s+(me|us|him|her)\b[^.!?\n]{0,40}(₹|rs\.?|inr|\$|usd|rupees?|rupaye|paise|paisa|money|amount|cash|\d{3,})/gi],
  ['money_request', /\b(send|transfer|deposit|pay)\b[^.!?\n]{0,30}(₹|rs\.?\s?|inr\s?|\$)\s?\d[\d,]*[^.!?\n]{0,40}\b(to|on|at|in)\b[^.!?\n]{0,25}\b(number|no\.?|upi|account|a\/c|qr|wallet|id)\b/gi],
  ['money_request', /\b(paise|paisa|rupaye|rupay|amount|payment)\b[^.!?\n]{0,30}\b(bhej\w*|daal\w*|transfer kar\w*|send kar\w*|de do|dedo)\b/gi],
  ['money_request', /(पैसे|पैसा|रुपये|रुपए|रक़म|रकम)[^।.!?\n]{0,30}(भेज|ट्रांसफर|डाल|दे दो)/g],
  // Task / easy-money job bait. "Part-time" or "work from home" alone never counts: only a promised payout or paid likes do.
  ['job_bait', /\b(earn|kamao|kamaye|kamaiye|income)\b[^.!?\n]{0,25}(₹|rs\.?|inr)?\s?\d[\d,]*\s*(\/|per|a|har|prati)\s*(day|din|hour|ghanta|week)\b|\b(like|subscribe|rate|review)\b[^.!?\n]{0,30}\b(earn|paid|payment|commission)\b|\b(telegram|whatsapp)\b[^.!?\n]{0,20}\b(task|job)\b|\bprepaid task\b/gi],
  ['job_bait', /घर बैठे[^।\n]{0,20}कमा|रोज़? ?\d[\d,]* ?(रुपये|रु\.?|₹)[^।\n]{0,15}कमा/g],
  // "Hi mum, this is my new number" impersonation opener.
  ['new_number', /\b(this is my new (number|no\.?)|my new (number|no\.?)|new (number|no\.?) (hai|he)|changed my (number|no\.?)|(my )?phone (is |got )?(broken|lost|damaged|stolen|dead)|lost my phone|naya (number|no\.?)|mera phone (kharab|toot\w*|kho\w*))\b|नया नंबर|फ़ोन (ख़राब|खराब|टूट|खो)/gi],
  ['unofficial_contact', /\b(call|contact|whats ?app|sampark)\b[^.!?\n]{0,40}(\+?91[\s-]?)?[6-9]\d[\d•xX*\s-]{7,11}\d|संपर्क करें[^।\n]{0,30}[6-9]\d[\d•xX*\s-]{7,11}\d/gi],
];
const OTP_ASK = /\b(share|send|tell|give|provide|read out|forward|bata\w*|bhej\w*)\b[^.!?\n]{0,40}\b(otp|pin|cvv|password|code)\b|\b(otp|pin|cvv|code)\b[^.!?\n]{0,30}\b(share|send|tell|batao|bataiye|bata do|bhejo|bhejiye)\b|(OTP|ओटीपी|पिन|कोड)[^।.!?\n]{0,30}(बताइए|बताओ|बता दीजिए|भेजिए|भेजो)/gi;
const OTP_NEG = /(do ?n[o']t|never|not)\s+(to\s+)?(share|disclose|tell)|kisi (ko|se) (bhi )?(na|mat|share na)|न बताएं|मत बताएं|न बताएँ|साझा न करें|share na kare/i;

const SHORTENERS = /^(bit\.ly|tinyurl\.com|t\.co|cutt\.ly|rb\.gy|is\.gd|shorturl\.at|tiny\.cc|ow\.ly|rebrand\.ly)$/i;
const RISKY_TLD = /\.(top|click|buzz|tk|ml|ga|cf|gq|rest|cam|icu|cyou)$/i;
const BRANDS = /(sbi|hdfc|icici|axis|kotak|pnb|paytm|phonepe|gpay|upi|npci|kyc|bank|bijli|electricity|aadhaar|uidai|incometax|rbi)/i;
const OFFICIAL = /(^|\.)(gov\.in|nic\.in|bank\.in|sbi\.co\.in|onlinesbi\.sbi|sbi|hdfcbank\.com|icicibank\.com|axisbank\.com|kotak\.com|pnbindia\.in|paytm\.com|phonepe\.com|npci\.org\.in|rbi\.org\.in|uidai\.gov\.in)$/i;

const ARCH: [Archetype, RegExp, string | null][] = [
  ['digital_arrest', /digital arrest|\bparcel\b|\bcourier\b|\bcustoms?\b|narcotics|\bmdma\b|money.?launder|\bwarrant\b|\bcbi\b|aadhaar (is )?(linked|misused)|डिजिटल अरेस्ट|पार्सल|कस्टम|वारंट/i, 'digital-arrest'],
  ['utility_kyc_remote', /electricity|bijli|power (will be )?(cut|disconnect)|kyc|pan (card )?(update|link)|sim (will be )?block|account (will be )?(block|suspend)|any ?desk|quick ?support|बिजली|केवाईसी|खाता बंद/i, 'bijli-remote'],
  ['receive_money_pin', /olx|buyer|army|qr|scan|collect request|receive (the )?(money|payment)|refund.*pin|approve.*request|क्यूआर|स्कैन/i, 'olx-qr'],
  ['reward_refund', /lottery|lucky draw|kbc|cashback|prize|winner|लॉटरी|इनाम/i, 'olx-qr'],
  ['job_task', /part.?time|work from home|per day|daily (income|earning)|telegram|like (and|&) (earn|subscribe)|task|घर बैठे/i, null],
  ['money_request', /\b(send|transfer|lend|give)\s+(me|us)\b|new number|naya number|paise bhej|पैसे भेज|नया नंबर/i, null],
];

export function checkMessage(text: string): CheckResult {
  const findings: Finding[] = [];
  const push = (flag: Flag, m: RegExpExecArray | { index: number; 0: string }) => findings.push({ flag, start: m.index, end: m.index + m[0].length, match: m[0] });
  const sentenceAt = (i: number, len: number) => {
    const s = Math.max(text.lastIndexOf('.', i), text.lastIndexOf('\n', i), text.lastIndexOf('।', i)) + 1;
    const stops = ['.', '\n', '।'].map(c => text.indexOf(c, i + len)).filter(x => x >= 0);
    return text.slice(s, stops.length ? Math.min(...stops) : text.length);
  };
  const CRED = /(otp|pin|cvv|password|ओटीपी|पिन|कोड)/i;
  for (const [flag, re] of P) { re.lastIndex = 0; let m: RegExpExecArray | null;
    while ((m = re.exec(text))) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (flag === 'secrecy' && CRED.test(text.slice(Math.max(0, m.index - 80), m.index + m[0].length + 40))) continue; // "OTP ... किसी को न बताएं" is the bank's genuine advice
      push(flag, m);
    } }
  // OTP: only a REQUEST to share counts. "Do not share this OTP" (every genuine bank SMS) must not fire.
  OTP_ASK.lastIndex = 0; let o: RegExpExecArray | null;
  while ((o = OTP_ASK.exec(text))) {
    if (!OTP_NEG.test(sentenceAt(o.index, o[0].length))) push('otp_request', o);
  }
  // Links: shorteners, risky TLDs, raw IPs, punycode, brand word on a non-official domain.
  const URL = /\b((?:https?:\/\/)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s]*)?)/gi; let u: RegExpExecArray | null;
  while ((u = URL.exec(text))) {
    const host = u[1].replace(/^https?:\/\//i, '').split(/[/?#]/)[0].toLowerCase();
    if (/@/.test(text.slice(Math.max(0, u.index - 1), u.index + 1))) continue; // skip emails / UPI ids
    const bad = SHORTENERS.test(host) || RISKY_TLD.test(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes('xn--') || (BRANDS.test(host) && !OFFICIAL.test(host));
    if (bad) push('bad_link', u);
  }
  const flags = [...new Set(findings.map(f => f.flag))];
  const score = flags.reduce((a, f) => a + W[f], 0);
  let archetype: Archetype = 'unknown'; let drillId: string | null = null;
  for (const [a, re, d] of ARCH) if (re.test(text)) { archetype = a; drillId = d; break; }
  if (archetype === 'unknown' && flags.includes('money_request')) archetype = 'money_request';
  const hard = flags.some(f => W[f] >= 4); // one hard flag (OTP ask, PIN-to-receive, remote app, pay-to-verify) is enough
  const verdict = score >= 5 || hard ? 'likely_scam' : score >= 3 ? 'suspicious' : 'no_red_flags_found';
  if (verdict === 'no_red_flags_found') { archetype = 'unknown'; drillId = null; }
  findings.sort((a, b) => a.start - b.start);
  return { verdict, score, archetype, drillId, findings, flags };
}
