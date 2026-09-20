import type { Lang } from '@/engine/engine';

export interface FlagLabel {
  en: string;
  hi: string;
}

export const RED_FLAG_LABELS: Record<string, FlagLabel> = {
  urgency: {
    en: 'Urgency / time pressure',
    hi: 'जल्दबाज़ी का दबाव',
  },
  fear: {
    en: 'Fear or threat',
    hi: 'डर या धमकी',
  },
  authority: {
    en: 'Claims authority',
    hi: 'अधिकारी होने का दावा',
  },
  secrecy: {
    en: 'Demands secrecy',
    hi: 'किसी को न बताने की शर्त',
  },
  too_good: {
    en: 'Too good to be true',
    hi: 'ज़रूरत से ज़्यादा अच्छा सौदा',
  },
  pin_to_receive: {
    en: "PIN to 'receive' money",
    hi: "पैसा 'लेने' के लिए PIN",
  },
  otp_request: {
    en: 'Asks for your OTP',
    hi: 'OTP माँगना',
  },
  remote_app: {
    en: 'Remote-access app',
    hi: 'स्क्रीन-शेयरिंग ऐप',
  },
  unofficial_contact: {
    en: 'Unofficial number',
    hi: 'ग़ैर-सरकारी नंबर',
  },
  pay_to_verify: {
    en: "Pay to 'verify'",
    hi: "'वेरिफ़िकेशन' के नाम पर भुगतान",
  },
  screen_says_pay: {
    en: 'The screen said PAYING',
    hi: "स्क्रीन पर 'भुगतान' लिखा था",
  },
  bad_link: {
    en: 'Suspicious link',
    hi: 'संदिग्ध लिंक',
  },
  money_request: {
    en: 'Asks you to send money',
    hi: 'पैसे भेजने को कहता है',
  },
  new_number: {
    en: 'Claims a new number or broken phone',
    hi: 'नया नंबर या फ़ोन ख़राब होने का दावा',
  },
};

export function getFlagLabel(flag: string, lang: Lang = 'en'): string {
  const entry = RED_FLAG_LABELS[flag];
  if (!entry) return flag;
  return entry[lang] || entry.en;
}

export const DICTIONARY: Record<string, { en: string; hi: string }> = {
  // Brand & Common UI
  brand: { en: 'CHAUKAS', hi: 'CHAUKAS' },
  brand_hindi: { en: 'चौकस', hi: 'चौकस' },
  home: { en: 'Home', hi: 'होम' },
  simulation: { en: 'SIMULATION', hi: 'सिमुलेशन' },
  yes: { en: 'Yes', hi: 'हाँ' },
  no: { en: 'No', hi: 'नहीं' },
  skip_questions: { en: 'skip questions', hi: 'सवाल छोड़ें' },
  accept: { en: 'Accept', hi: 'कॉल उठाएँ' },
  off: { en: 'Off', hi: 'बंद' },
  sound_on: { en: 'Sound on', hi: 'आवाज़ चालू' },
  sound_off: { en: 'Sound off', hi: 'आवाज़ बंद' },
  sound_muted: { en: 'Muted', hi: 'आवाज़ बंद' },
  caller_voice: { en: "Caller's voice:", hi: 'कॉल करने वाले की आवाज़:' },
  caller_speaks_hindi_note: {
    en: 'Caller speaks Hindi, as real scam calls do · captions in English',
    hi: 'कॉल करने वाला हिंदी बोलता है, जैसा असली स्कैम में होता है',
  },
  wallet: { en: 'Wallet:', hi: 'वॉलेट:' },
  zero_lost: { en: '₹0 lost', hi: '₹0 का नुक़सान' },
  cancel_go_back: { en: 'Cancel / Go back', hi: 'रद्द करें / वापस जाएँ' },
  hurry: { en: 'Hurry:', hi: 'जल्दी:' },
  active_now: { en: 'Active now', hi: 'अभी सक्रिय' },
  payapp_upi: { en: 'PayApp · UPI Payment', hi: 'PayApp · UPI भुगतान' },
  system_request: { en: 'System Request', hi: 'सिस्टम अनुरोध' },
  system_permission: { en: 'System Permission', hi: 'सिस्टम अनुमति' },
  seconds: { en: 'seconds', hi: 'सेकंड' },
  minutes: { en: 'minutes', hi: 'मिनट' },
  steps: { en: 'steps', hi: 'क़दम' },
  step: { en: 'step', hi: 'क़दम' },
  practice_money: { en: 'Practice money', hi: 'प्रैक्टिस के पैसे' },
  practice_pin: { en: 'Practice PIN', hi: 'प्रैक्टिस PIN' },

  // Landing Page (/)
  hero_tag: { en: 'BEHAVIOURAL SIMULATION', hi: 'व्यवहार की ड्रिल' },
  hero_title: { en: 'Get scammed here. Never out there.', hi: 'यहाँ फँसिए, ताकि बाहर कभी न फँसें।' },
  landing_stat_line: {
    en: '₹981 crore lost to UPI fraud in FY 2024-25, across 12.64 lakh incidents.',
    hi: 'FY 2024-25 में UPI धोखाधड़ी में ₹981 करोड़ गए, 12.64 लाख मामलों में।'
  },
  landing_stat_source: {
    en: 'Ministry of Finance, Lok Sabha reply, Dec 2025',
    hi: 'वित्त मंत्रालय, लोकसभा उत्तर, दिसंबर 2025'
  },
  landing_root_cause: {
    en: "Most victims send the money themselves. Warnings don't fix that. Practice does.",
    hi: 'ज़्यादातर लोग पैसा ख़ुद भेज देते हैं। चेतावनी से यह नहीं रुकता। अभ्यास से रुकता है।'
  },
  proof_drills_played: {
    en: '{runs} drills played',
    hi: '{runs} ड्रिल खेली गईं'
  },
  proof_gap_line: {
    en: '{runs} drills played · {gap}% who knew the rule still fell for it (n={n})',
    hi: '{runs} ड्रिल खेली गईं · नियम जानने वाले {gap}% लोग फिर भी फँस गए (n={n})'
  },
  judging_nav_link: {
    en: 'Judging this? →',
    hi: 'मूल्यांकन कर रहे हैं? →'
  },
  start_3min_drill: { en: 'Start the 3-minute drill', hi: '3 मिनट की ड्रिल शुरू करें' },
  check_a_message: { en: 'Check a message →', hi: 'मैसेज जाँचें →' },
  hero_disclaimer: {
    en: 'We never ask for your real PIN, OTP, phone number or bank. This is a simulation.',
    hi: 'हम कभी आपका असली PIN, OTP, फ़ोन नंबर या बैंक नहीं पूछते। यह सिर्फ़ एक सिमुलेशन है।'
  },
  landing_footer: {
    en: 'No login · no real credentials · anonymous stats only',
    hi: 'कोई लॉगिन नहीं · कोई असली जानकारी नहीं · सिर्फ़ बिना नाम के आँकड़े'
  },
  judging_link: { en: 'Judging this? Start here →', hi: 'जज कर रहे हैं? यहाँ से शुरू करें →' },
  message_checker_nav: { en: 'Message Checker', hi: 'मैसेज चेकर' },
  live_insights_nav: { en: 'Live Insights', hi: 'लाइव आँकड़े' },
  check_message_nav: { en: 'Check a Message →', hi: 'मैसेज जाँचें →' },
  fire_drill_1_badge: { en: 'FIRE-DRILL 1.0', hi: 'फ़ायर-ड्रिल 1.0' },
  footer_copy: { en: '© 2026 Chaukas · Tech for a Better Tomorrow', hi: '© 2026 Chaukas · Tech for a Better Tomorrow' },

  // Drill Intro & Keypad
  drill_n_of_3: { en: 'Drill {n} of 3', hi: 'ड्रिल {n} / 3' },
  targeted_practice: { en: 'Targeted Practice', hi: 'चुनी हुई ड्रिल' },
  precheck_title: { en: 'Pre-Check', hi: 'पहले 3 छोटे सवाल' },
  start_drill: { en: 'Start drill', hi: 'ड्रिल शुरू करें' },
  start_drill_n: { en: 'Start Drill {n}', hi: 'ड्रिल {n} शुरू करें' },
  never_type_real_pin: {
    en: 'Never type your real PIN anywhere but your UPI app.',
    hi: 'अपना असली PIN अपने UPI ऐप के अलावा कहीं न डालें।'
  },
  drill_safety_notice: {
    en: 'Practice money ₹60,000 · Practice PIN 4827 · Never type your real PIN anywhere but your UPI app.',
    hi: 'प्रैक्टिस के पैसे ₹60,000 · प्रैक्टिस PIN 4827 · अपना असली PIN अपने UPI ऐप के अलावा कहीं न डालें।'
  },
  incorrect_pin: {
    en: 'Incorrect PIN. Your practice PIN is 4827.',
    hi: 'ग़लत PIN। आपका प्रैक्टिस PIN 4827 है।'
  },
  incorrect_pin_subtext: {
    en: 'If you just typed your real UPI PIN: we did not store or send it. Never type it outside your UPI app.',
    hi: 'अगर आपने अभी अपना असली UPI PIN डाला है: हमने उसे न सेव किया, न कहीं भेजा। उसे UPI ऐप के बाहर कभी न डालें।'
  },
  incorrect_otp: {
    en: 'That is not the code in the SMS.',
    hi: 'यह SMS वाला कोड नहीं है।'
  },
  submit_pin: { en: 'Submit PIN', hi: 'PIN सबमिट करें' },
  submit_otp: { en: 'Submit OTP', hi: 'OTP सबमिट करें' },
  sms_banner_title: { en: 'SMS · BANK ALERT', hi: 'SMS · बैंक अलर्ट' },
  now: { en: 'NOW', hi: 'अभी' },
  incoming_call: { en: 'Incoming Call…', hi: 'इनकमिंग कॉल…' },
  incoming_videocall: { en: 'Incoming Video Call…', hi: 'इनकमिंग वीडियो कॉल…' },
  official_inquiry: { en: 'Official inquiry', hi: 'सरकारी पूछताछ' },
  camera_verification: { en: 'Camera verification requested', hi: 'कैमरा वेरिफ़िकेशन का अनुरोध' },
  scenario_not_found: { en: 'Scenario not found.', hi: 'ड्रिल नहीं मिली।' },

  // Debrief
  red_flag: { en: 'red flag', hi: 'ख़तरे का संकेत' },
  red_flags_walked_past: {
    en: 'Red flags you walked past: {n} of {total}',
    hi: 'ख़तरे के संकेत जो आपने अनदेखे किए: {n} / {total}'
  },
  you_paused_keypad: {
    en: 'You paused {x} s at the keypad',
    hi: 'कीपैड पर आप {x} सेकंड रुके'
  },
  the_rule: { en: 'The rule', hi: 'याद रखने वाला नियम' },
  if_this_happens_for_real: {
    en: 'If this happens for real',
    hi: 'अगर यह सच में हो जाए'
  },
  call_1930_immediately: {
    en: 'Call 1930 immediately',
    hi: 'तुरंत 1930 पर कॉल करें'
  },
  call_1930_helpline_desc: {
    en: 'immediately (National Cyber Crime Helpline).',
    hi: 'पर तुरंत कॉल करें (राष्ट्रीय साइबर अपराध हेल्पलाइन)।'
  },
  report_cybercrime: {
    en: 'Report at cybercrime.gov.in',
    hi: 'cybercrime.gov.in पर शिकायत दर्ज करें'
  },
  call_bank_official: {
    en: "Call your bank's official number",
    hi: 'अपने बैंक के आधिकारिक नंबर पर कॉल करें'
  },
  call_bank_official_desc: {
    en: "Call your bank's official helpline number immediately.",
    hi: 'अपने बैंक के आधिकारिक हेल्पलाइन नंबर पर तुरंत कॉल करें।'
  },
  report_sanchar_saathi: {
    en: 'Report the number/message on Sanchar Saathi (Chakshu)',
    hi: 'नंबर या मैसेज को Sanchar Saathi (चक्षु) पर रिपोर्ट करें'
  },
  you_answered_correctly: {
    en: "You answered this correctly {t} ago: '{q}' — and still did it.",
    hi: "आपने {t} पहले इसका सही जवाब दिया था: '{q}' — फिर भी आपने वही किया।"
  },
  next_drill: { en: 'Next drill', hi: 'अगली ड्रिल' },
  next_drill_n: { en: 'Next drill ({n} of {total})', hi: 'अगली ड्रिल ({n} / {total})' },
  redrill_this_one: { en: 'Re-drill this one', hi: 'यह ड्रिल दोबारा करें' },
  see_my_report: { en: 'See my report', hi: 'मेरी रिपोर्ट देखें' },
  timeline_replay: { en: 'Timeline Replay', hi: 'टाइमलाइन रीप्ले' },
  upi_pin_screen: { en: 'UPI PIN Screen', hi: 'UPI PIN स्क्रीन' },
  otp_verification_screen: { en: 'OTP Verification Screen', hi: 'OTP वेरिफ़िकेशन स्क्रीन' },
  keypad_label: { en: 'Keypad', hi: 'कीपैड' },
  knowledge_behaviour_gap_label: {
    en: 'Knowledge–Behaviour Gap',
    hi: 'जानकारी और व्यवहार का अंतर'
  },
  targeted_debrief: { en: 'Targeted Drill Debrief', hi: 'इस ड्रिल का विश्लेषण' },
  drill_debrief_n: { en: 'Drill {n} of {total} Debrief', hi: 'ड्रिल {n} / {total} का विश्लेषण' },
  play_full_drill_cta: { en: 'Play full 3-drill simulation →', hi: 'पूरी 3-ड्रिल सिमुलेशन खेलें →' },

  // Report
  you_knew_the_rule: {
    en: 'You knew the rule. You still did it.',
    hi: 'आपको नियम पता था। फिर भी आपने वही किया।'
  },
  knowledge: { en: 'Knowledge', hi: 'जानकारी' },
  behaviour: { en: 'Behaviour', hi: 'व्यवहार' },
  total_practice_money_lost: {
    en: 'Total practice money lost',
    hi: 'कुल प्रैक्टिस के पैसे गँवाए'
  },
  scammed: { en: 'scammed', hi: 'ठगे गए' },
  escaped_late: { en: 'escaped late', hi: 'देर से बचे' },
  escaped: { en: 'escaped', hi: 'बच निकले' },
  send_drill_to_mummy_papa: {
    en: 'Send this drill to Mummy-Papa',
    hi: 'यह ड्रिल मम्मी-पापा को भेजें'
  },
  check_suspicious_message: {
    en: 'Check a suspicious message',
    hi: 'कोई संदिग्ध मैसेज जाँचें'
  },
  live_numbers: { en: 'Live numbers', hi: 'लाइव आँकड़े' },
  start_over: { en: 'Start over', hi: 'फिर से शुरू करें' },
  final_report_tag: { en: 'FINAL REPORT', hi: 'अंतिम रिपोर्ट' },
  scorecard_title: { en: 'Your 3-Drill Scorecard', hi: 'आपका 3-ड्रिल स्कोरकार्ड' },
  knowledge_vs_behaviour: {
    en: 'Knowledge vs Actual Behaviour',
    hi: 'जानकारी बनाम वास्तविक व्यवहार'
  },
  rules_you_knew_broke: {
    en: 'Rules you knew but broke under pressure:',
    hi: 'नियम जो आपको पता थे, पर दबाव में भूल गए:'
  },
  drill_results: { en: 'Drill Results', hi: 'ड्रिल के नतीजे' },

  // /check
  example_electricity_sms: {
    en: '⚡ Electricity Disconnection SMS',
    hi: '⚡ बिजली कटने का SMS',
  },
  example_sbi_kyc_sms: {
    en: '🏦 SBI KYC Link SMS',
    hi: '🏦 SBI KYC लिंक SMS',
  },
  example_bank_otp_sms: {
    en: '🛡️ Genuine Bank OTP SMS',
    hi: '🛡️ असली बैंक OTP SMS',
  },
  paste_message_placeholder: {
    en: 'Paste an SMS or WhatsApp message',
    hi: 'SMS या WhatsApp मैसेज यहाँ पेस्ट करें'
  },
  paste_button: {
    en: '📋 Paste the message',
    hi: '📋 मैसेज चिपकाएँ'
  },
  paste_help: {
    en: 'Press and hold inside the box, then choose Paste.',
    hi: 'डिब्बे के अंदर उँगली दबाकर रखिए, फिर Paste चुनिए।'
  },
  check_empty: {
    en: 'First paste a message in the box above.',
    hi: 'पहले ऊपर वाले डिब्बे में मैसेज चिपकाइए।'
  },
  check_page_intro_btn: {
    en: '🔊 What does this page do?',
    hi: '🔊 यह पेज क्या करता है'
  },
  replay_advice: {
    en: '🔊 Replay advice',
    hi: '🔊 दोबारा सुनें'
  },
  practise_this_scam: {
    en: 'Practise this scam',
    hi: 'इस ठगी से बचने का अभ्यास करें'
  },
  check_message_button: { en: 'Check message', hi: 'मैसेज जाँचें' },
  try_an_example: { en: 'Try an example', hi: 'उदाहरण आज़माएँ' },
  practise_exact_scam: {
    en: 'Practise this exact scam',
    hi: 'इसी स्कैम की प्रैक्टिस करें'
  },
  check_privacy_notice: {
    en: 'Pasted text is checked on your device. Nothing you paste is sent anywhere.',
    hi: 'मैसेज आपके ही फ़ोन में जाँचा जाता है। कुछ भी कहीं नहीं भेजा जाता।'
  },
  likely_scam: { en: 'Likely a scam', hi: 'शायद यह स्कैम है' },
  suspicious: { en: 'Suspicious', hi: 'संदिग्ध' },
  no_red_flags_found: {
    en: 'No red flags found — that is not the same as safe',
    hi: "कोई ख़तरे का संकेत नहीं मिला — इसका मतलब 'सुरक्षित' नहीं है"
  },
  message_inspector_tag: { en: 'MESSAGE INSPECTOR', hi: 'मैसेज जाँच' },
  check_page_title: { en: 'Check a suspicious message', hi: 'कोई संदिग्ध मैसेज जाँचें' },
  check_page_desc: {
    en: 'Paste an SMS, WhatsApp message, or email to detect social engineering pressure tactics.',
    hi: 'कोई SMS या WhatsApp मैसेज पेस्ट करें और देखें उसमें दबाव बनाने की कौन-सी चालें हैं।'
  },
  verdict: { en: 'Verdict', hi: 'जाँच का नतीजा' },
  analysis_red_flags: { en: 'Analysis & Red Flags', hi: 'विश्लेषण और ख़तरे के संकेत' },
  try_full_3min_drill: { en: 'Try the full 3-minute drill', hi: '3 मिनट की पूरी ड्रिल करें' },
  check_footer_rules: {
    en: '© 2026 Chaukas · 100% Client-Side Rules Engine',
    hi: '© 2026 Chaukas · 100% Client-Side Rules Engine'
  },
  back_to_home: { en: '← Back to Home', hi: '← होम पर वापस' },

  // Advice lines
  advice_money_request: {
    en: 'Before sending anything, call the person on a number you ALREADY have saved. Never pay because a message told you to.',
    hi: 'पैसे भेजने से पहले उस व्यक्ति को उसी नंबर पर कॉल करें जो आपके पास पहले से सेव है। सिर्फ़ मैसेज के कहने पर कभी पैसे न भेजें।'
  },
  advice_digital_arrest: {
    en: 'No agency arrests or questions anyone over a call. Cut the call and dial 1930.',
    hi: 'कोई भी एजेंसी कॉल पर गिरफ़्तारी या पूछताछ नहीं करती। कॉल काटें और 1930 डायल करें।'
  },
  advice_utility_kyc_remote: {
    en: "Check only in the official app or office. Never install an app or share an OTP for a 'bill update' or KYC.",
    hi: "जानकारी सिर्फ़ आधिकारिक ऐप या दफ़्तर से लें। 'बिल अपडेट' या KYC के नाम पर कभी ऐप इंस्टॉल न करें, न OTP बताएँ।"
  },
  advice_receive_money_pin: {
    en: "You never need a PIN, a QR scan or an 'Approve' tap to RECEIVE money.",
    hi: "पैसा लेने के लिए कभी PIN, QR स्कैन या 'Approve' की ज़रूरत नहीं पड़ती।"
  },
  advice_other: {
    en: 'Do not reply, click or pay. Verify through an official channel you look up yourself.',
    hi: 'जवाब न दें, लिंक न खोलें, पैसे न भेजें। ख़ुद आधिकारिक तरीक़े से पता करें।'
  },

  // /insights
  drill_label_olx_qr: {
    en: 'Drill 1 · QR / UPI Receive (Buyer who never bargains)',
    hi: 'ड्रिल 1 · QR / UPI से पैसा लेना (बिना मोल-भाव वाला ख़रीदार)',
  },
  drill_label_bijli_remote: {
    en: 'Drill 2 · Electricity KYC Remote App & OTP',
    hi: 'ड्रिल 2 · बिजली बिल KYC, स्क्रीन-शेयरिंग ऐप और OTP',
  },
  drill_label_digital_arrest: {
    en: 'Drill 3 · Digital Arrest Video Call',
    hi: 'ड्रिल 3 · डिजिटल अरेस्ट वीडियो कॉल',
  },
  of_people_who_knew: {
    en: 'of people who knew the rule still fell for it',
    hi: 'नियम जानने वालों में से इतने लोग फिर भी फँस गए'
  },
  no_data_yet: { en: 'No data yet.', hi: 'अभी कोई डेटा नहीं।' },
  first_attempt_fall_rate: {
    en: 'First-attempt fall rate',
    hi: 'पहली कोशिश में फँसने की दर'
  },
  insights_caveat: {
    en: 'Self-selected sample collected during HACKDAY 1.0. Not a representative study.',
    hi: 'यह HACKDAY 1.0 के दौरान अपनी मर्ज़ी से खेलने वालों का सैंपल है। यह कोई प्रतिनिधि अध्ययन नहीं है।'
  },
  insights_tag: { en: 'LIVE TELEMETRY', hi: 'लाइव टेलीमेट्री' },
  no_data_desc: {
    en: 'No completed drills have been recorded yet. Complete the drill to publish the first live measurement.',
    hi: 'अभी कोई पूरी की गई ड्रिल रिकॉर्ड नहीं हुई है। पहला माप प्रकाशित करने के लिए ड्रिल पूरी करें।'
  },
  total_runs_recorded: { en: 'Total Runs Recorded', hi: 'कुल रिकॉर्ड की गई ड्रिल' },
  the_gap_tag: { en: 'THE KNOWLEDGE–BEHAVIOUR GAP', hi: 'जानकारी और व्यवहार का अंतर' },
  nobody_answered_note: {
    en: 'n = 0: nobody who answered the pre-check correctly has played yet',
    hi: 'n = 0: शुरुआती सवालों का सही जवाब देने वाले किसी व्यक्ति ने अभी तक ड्रिल नहीं खेली'
  },
  fall_rate_by_archetype: {
    en: 'First-Attempt Fall Rate by Scam Archetype',
    hi: 'स्कैम प्रकार के अनुसार पहली कोशिश में फँसने की दर'
  },
  fall_rate_desc: {
    en: 'Percentage of first-time players who authorized payments or permissions',
    hi: 'पहली बार खेलने वालों में से कितनों ने पैसे भेज दिए या अनुमति दे दी'
  },
  first_try: { en: 'First try', hi: 'पहली कोशिश' },
  redrill: { en: 'Re-drill', hi: 'दोबारा ड्रिल' },
  learning_effect_title: {
    en: 'Learning Effect: First Attempt vs Re-drill',
    hi: 'सीखने का असर: पहली कोशिश बनाम दोबारा ड्रिल'
  },
  learning_effect_desc: {
    en: 'Comparing initial fall rate with repeated practice runs',
    hi: 'पहली कोशिश और दोबारा अभ्यास की तुलना'
  },
  early_numbers: {
    en: 'Early numbers',
    hi: 'शुरुआती आँकड़े',
  },
  gap_meaning: {
    en: 'Percentage of people who knew the safety rule before the drill, yet still sent money or gave their OTP when pressured.',
    hi: 'उन लोगों का प्रतिशत जो ड्रिल से पहले नियम जानते थे, फिर भी दबाव में पैसे भेज दिए या OTP बता दिया।',
  },
  gap_how_measured_line1: {
    en: 'Before each practice, we ask a plain yes/no question testing the exact rule.',
    hi: 'हर अभ्यास से पहले, हम उसी नियम से जुड़ा एक सीधा हाँ/नहीं सवाल पूछते हैं।',
  },
  gap_how_measured_line2: {
    en: 'During the practice, we measure whether the player follows that rule when the scammer creates urgency.',
    hi: 'अभ्यास के दौरान, हम देखते हैं कि ठग द्वारा दबाव बनाने पर खिलाड़ी उस नियम का पालन करता है या नहीं।',
  },
  fall_rate_per_practice_title: {
    en: 'Fall rate per practice (first attempts)',
    hi: 'हर अभ्यास में फँसने की दर (पहली कोशिश)',
  },
  fall_rate_meaning: {
    en: 'The percentage of players who lost practice money on their very first attempt of each scenario.',
    hi: 'हर परिदृश्य में अपनी पहली ही कोशिश में नक़ली पैसे गँवाने वाले खिलाड़ियों का प्रतिशत।',
  },
  trap_olx_qr: {
    en: 'The scammer poses as an army officer and claims you must enter your PIN to receive money.',
    hi: 'ठग ख़ुद को फ़ौजी बताता है और कहता है कि पैसे लेने के लिए भी PIN डालना पड़ता है।',
  },
  trap_bijli_remote: {
    en: 'The scammer threatens an immediate power cut and tricks you into sharing your screen and OTP.',
    hi: 'ठग बिजली कटने का डर दिखाता है, स्क्रीन-शेयरिंग ऐप डलवाता है और OTP ले लेता है।',
  },
  trap_digital_arrest: {
    en: 'The scammer poses as a police officer on video call, demands total secrecy, and orders money transfer for "verification".',
    hi: 'ठग वीडियो कॉल पर पुलिस अफ़सर बनकर डराता है, बात छुपाने को कहता है और "जाँच" के नाम पर पैसे माँगता है।',
  },
  what_people_did_title: {
    en: 'What people did',
    hi: 'लोगों ने क्या किया',
  },
  what_people_did_meaning: {
    en: 'How each first attempt ended: scammed (lost money), escaped late (took risky steps before stopping), or escaped clean.',
    hi: 'पहली कोशिश का नतीजा: फँस गए (पैसे गँवाए), देर से बचे (ख़तरनाक क़दम उठाने के बाद संभले), या साफ़ बच निकले।',
  },
  hesitation_title: {
    en: 'Hesitation at the keypad',
    hi: 'कीपैड पर हिचकिचाहट',
  },
  hesitation_meaning: {
    en: 'Average pause at the PIN or OTP keypad before submitting, among people who were scammed.',
    hi: 'ठगी का शिकार होने वाले लोगों ने सबमिट करने से पहले कीपैड पर औसतन कितना समय सोचा।',
  },
  hesitation_stat_desc: {
    en: 'Players paused for {sec} seconds on average before making the critical mistake.',
    hi: 'ग़लती करने से पहले खिलाड़ी औसतन {sec} सेकंड तक रुके।',
  },
  flags_walked_past_title: {
    en: 'Red flags walked past',
    hi: 'अनदेखे किए गए ख़तरे के संकेत',
  },
  flags_walked_past_meaning: {
    en: 'The average number of scam warning signs encountered and ignored out of the total present.',
    hi: 'सामने आए ख़तरे के कुल संकेतों में से औसतन कितने संकेतों को अनदेखा किया गया।',
  },
  flags_stat_desc: {
    en: '{avg} out of {total} warning signs ignored on average',
    hi: 'औसतन {total} में से {avg} ख़तरे के संकेत अनदेखे किए गए',
  },
  does_practice_help_title: {
    en: 'Does practice help?',
    hi: 'क्या अभ्यास से मदद मिलती है?',
  },
  does_practice_help_meaning: {
    en: 'Comparing fall rates between someone\'s first attempt and their repeated practice runs.',
    hi: 'पहली कोशिश और उसी अभ्यास को दोबारा करने पर फँसने की दर में तुलना।',
  },
  first_attempt_label: {
    en: 'First attempt',
    hi: 'पहली कोशिश',
  },
  retry_label: {
    en: 'Re-try',
    hi: 'दोबारा अभ्यास',
  },
  no_retry_data: {
    en: 'No re-try data recorded yet.',
    hi: 'अभी दोबारा अभ्यास का कोई डेटा नहीं है।',
  },
  who_played_title: {
    en: 'Who played',
    hi: 'किसने खेला',
  },
  who_played_meaning: {
    en: 'Breakdown of user interfaces, language preferences, family shares, and 24-hour activity.',
    hi: 'इंटरफ़ेस के प्रकार, चुनी गई भाषा, पारिवारिक लिंक और 24 घंटों की गतिविधि का विवरण।',
  },
  simple_ui_label: {
    en: 'Simple interface (Home)',
    hi: 'सरल इंटरफ़ेस (होम)',
  },
  detailed_ui_label: {
    en: 'Detailed view (/drill)',
    hi: 'विस्तृत दृश्य (/drill)',
  },
  hindi_share_label: {
    en: 'Played in Hindi',
    hi: 'हिंदी में खेला',
  },
  family_share_label: {
    en: 'Came via family link',
    hi: 'पारिवारिक लिंक से आए',
  },
  last_24h_label: {
    en: 'Runs in last 24 hours',
    hi: 'पिछले 24 घंटों में कुल खेल',
  },
  method_and_limits_title: {
    en: 'Method and limits',
    hi: 'तरीक़ा और सीमाएँ',
  },
  method_and_limits_desc: {
    en: 'All telemetry is strictly anonymous and aggregate. This dataset comes from a self-selected hackathon sample and is not a representative national study. No personal identifiers, phone numbers, real credentials, or IP addresses are ever collected or stored.',
    hi: 'सभी आँकड़े पूरी तरह से अज्ञात और सामूहिक हैं। यह डेटा हैकाथॉन में भाग लेने वाले लोगों का है और पूरे देश का प्रतिनिधित्व नहीं करता। कोई भी व्यक्तिगत जानकारी, फ़ोन नंबर, असली पिन या IP एड्रेस कभी स्टोर नहीं किया जाता।',
  },
  insights_footer: { en: '© 2026 Chaukas · Anonymous Telemetry', hi: '© 2026 Chaukas · Anonymous Telemetry' },

  // /about and navigation
  detailed_view_banner: {
    en: 'Detailed view for judges and developers',
    hi: 'जजों और डेवलपर्स के लिए विस्तृत रूप',
  },
  about_project: {
    en: 'About this project',
    hi: 'इस प्रोजेक्ट के बारे में',
  },
  about_nav: {
    en: 'About',
    hi: 'परिचय',
  },

  // /judge
  judge_change_notice: {
    en: 'What changed at 2 pm: testers, including developers, found the first interface too complex. So the front door was rebuilt as a Hindi-first, voice-guided simple mode for older users (the home page). The detailed view (timeline replay, engine log) is still at /drill.',
    hi: 'दोपहर 2 बजे क्या बदला: परीक्षकों और डेवलपर्स ने पहले इंटरफ़ेस को बहुत जटिल पाया। इसलिए मुख्य पेज को बुजुर्गों के लिए हिंदी-प्रथम, आवाज़-निर्देशित सरल मोड (होम पेज) के रूप में फिर से बनाया गया। विस्तृत दृश्य (टाइमलाइन रीप्ले, इंजन लॉग) अभी भी /drill पर उपलब्ध है।',
  },
  step0_title: {
    en: 'Open the home page as an elder would: sound on, Hindi.',
    hi: 'होम पेज को एक बुजुर्ग की तरह खोलें: आवाज़ चालू, हिंदी।',
  },
  step0_desc: {
    en: 'Experience the Hindi-first, voice-guided simple mode with zero cognitive overload.',
    hi: 'बिना किसी उलझन के हिंदी-प्रथम, आवाज़-निर्देशित सरल मोड का अनुभव करें।',
  },
  step0_btn: {
    en: 'Open Home (/) →',
    hi: 'होम (/) खोलें →',
  },
  evaluation_guide_tag: { en: 'EVALUATION GUIDE', hi: 'मूल्यांकन गाइड' },
  two_minutes_title: { en: 'Two minutes? Do this:', hi: 'दो मिनट हैं? यह करें:' },
  two_minutes_desc: {
    en: 'A quick walkthrough to experience the behavioural gap, inspect real-time scoring, and verify deterministic rules.',
    hi: 'व्यवहार के अंतर को समझने, रियल-टाइम स्कोरिंग देखने और नियमों को जाँचने के लिए त्वरित गाइड।'
  },
  step1_title: { en: 'Play Drill 1 & Comply', hi: 'ड्रिल 1 खेलें और बात मानें' },
  step1_desc: {
    en: 'Play Drill 1 (OLX QR) and go along with the buyer. Enter the practice PIN (4827) and watch ₹4,500 leave your practice wallet. Observe the debrief and Glass Box event stream.',
    hi: 'ड्रिल 1 (OLX QR) खेलें और ख़रीदार की बात मानें। प्रैक्टिस PIN (4827) डालें और ₹4,500 कटते देखें। विश्लेषण और ग्लास बॉक्स देखें।'
  },
  step1_btn: { en: 'Play Drill 1 →', hi: 'ड्रिल 1 खेलें →' },
  step2_title: { en: 'Inspect a Suspicious Message', hi: 'संदिग्ध मैसेज की जाँच करें' },
  step2_desc: {
    en: 'Paste a spam SMS from your own phone into /check, or try the 3 built-in examples. See deterministic red-flag tagging and targeted archetype advice with 100% client-side privacy.',
    hi: 'अपने फ़ोन से कोई स्पैम SMS /check में पेस्ट करें या 3 उदाहरण देखें। 100% प्राइवेसी के साथ ख़तरे के संकेत और सलाह देखें।'
  },
  step2_btn: { en: 'Open /check →', hi: '/check खोलें →' },
  step3_title: { en: 'Inspect Live Metrics', hi: 'लाइव आँकड़े देखें' },
  step3_desc: {
    en: 'Open /insights to view the live Knowledge–Behaviour Gap metric, per-drill fall rates, and learning effect measured from real players.',
    hi: 'लाइव आँकड़े देखने के लिए /insights खोलें — जानकारी और व्यवहार का अंतर और सीखने का असर देखें।'
  },
  step3_btn: { en: 'Open /insights →', hi: '/insights खोलें →' },
  step4_title: { en: 'Inspect Tests & Architecture', hi: 'टेस्ट और आर्किटेक्चर देखें' },
  step4_desc: {
    en: 'Open the GitHub repository, inspect the pure deterministic engine in src/engine/engine.ts, and run the automated test suite.',
    hi: 'GitHub रिपॉजिटरी खोलें, src/engine/engine.ts में इंजन देखें और टेस्ट सूट चलाएँ।'
  },
  step4_btn: { en: 'View Repository →', hi: 'रिपॉजिटरी देखें →' },
  drills_nav: { en: 'Drills', hi: 'ड्रिल' },
  reality_ledger_title: { en: 'Reality Ledger', hi: 'Reality Ledger' },
  reality_ledger_desc: {
    en: 'Honest accounting of what is production-grade vs hackathon MVP shortcuts',
    hi: 'क्या पूरी तरह बना है और क्या हैकाथॉन का शॉर्टकट है, इसका ईमानदार हिसाब'
  },
  repo_card_title: { en: 'GitHub Repository & Automated Tests', hi: 'GitHub रिपॉजिटरी और ऑटोमेटेड टेस्ट' },
  repo_card_desc: {
    en: 'Inspect the zero-dependency deterministic engine, CI pipelines, and full behavioral test suite.',
    hi: 'इंजन, CI पाइपलाइन और व्यवहार परीक्षण सूट की जाँच करें।'
  },

  // Insights view strings
  runs_stat_label: {
    en: '{runs} runs ({first_runs} first attempts{redrill_part})',
    hi: '{runs} ड्रिल ({first_runs} पहली कोशिश{redrill_part})',
  },
  redrill_part: {
    en: ', {n} re-drills',
    hi: ', {n} दोबारा ड्रिल',
  },
  knew_but_fell_desc: {
    en: '{fell} of {total} participants correctly identified the scam rule in the pre-check, yet still complied when pressured in the simulator.',
    hi: '{fell} में से {total} खिलाड़ियों ने प्री-चेक में नियम सही बताया, फिर भी सिमुलेटर में दबाव में आकर पैसे भेज दिए।',
  },
  fell_on_first_attempt: {
    en: '{fell} of {total} fell on first attempt',
    hi: '{total} में से {fell} पहली कोशिश में फँस गए',
  },
  knew_but_fell_stat: {
    en: 'Knew-but-fell:',
    hi: 'जानते हुए भी फँसे:',
  },
  first_runs_count: {
    en: 'n = {n} first runs',
    hi: 'n = {n} पहली कोशिशें',
  },
  redrill_fall_rate_title: {
    en: 'Re-drill Fall Rate',
    hi: 'दोबारा ड्रिल में फँसने की दर',
  },
  redrills_count: {
    en: 'n = {n} re-drills',
    hi: 'n = {n} दोबारा अभ्यास',
  },

  // PhoneFrame & MessageList & PinPad strings
  sbi_account_subtext: {
    en: 'State Bank of India (•••4210)',
    hi: 'भारतीय स्टेट बैंक (•••4210)',
  },
  delivered: {
    en: '7:40 PM · Delivered',
    hi: '7:40 PM · डिलीवर हुआ',
  },
  officer_on_call: {
    en: 'Officer on Call',
    hi: 'कॉल पर अधिकारी',
  },
  connected: {
    en: 'Connected',
    hi: 'कनेक्टेड',
  },
  audio_call: {
    en: 'Audio Call',
    hi: 'ऑडियो कॉल',
  },
  live_transcript_captions: {
    en: 'Live Transcript Captions',
    hi: 'लाइव बातचीत के सबटाइटल्स',
  },
  speaking: {
    en: 'Speaking…',
    hi: 'बोल रहे हैं…',
  },
  cyber_crime_officer: {
    en: 'Cyber Crime Officer',
    hi: 'साइबर क्राइम अधिकारी',
  },
  govt_cyber_police: {
    en: 'Govt. of India · Cyber Police',
    hi: 'भारत सरकार · साइबर पुलिस',
  },
  you: {
    en: 'You',
    hi: 'आप',
  },
  cam_on: {
    en: 'Cam ON',
    hi: 'कैमरा चालू',
  },
  video_call_captions: {
    en: 'Video Call Captions',
    hi: 'वीडियो कॉल सबटाइटल्स',
  },
  officer_speaking: {
    en: 'Officer speaking…',
    hi: 'अधिकारी बोल रहे हैं…',
  },
  unknown_caller: {
    en: 'Unknown Caller',
    hi: 'अज्ञात कॉलर',
  },
  upi_auth_badge: {
    en: 'UPI AUTH',
    hi: 'UPI AUTH',
  },
  sms_otp_badge: {
    en: 'SMS OTP',
    hi: 'SMS OTP',
  },
  backspace: {
    en: 'Backspace',
    hi: 'हटाएँ',
  },
  judge_footer: {
    en: '© 2026 Chaukas · Judge Verification Kit',
    hi: '© 2026 Chaukas · जज सत्यापन किट',
  },
  precheck_n_of_total: {
    en: '{n} of {total}',
    hi: '{n} / {total}',
  },

  // GlassBox
  engine_recording_title: { en: 'What the engine is recording', hi: 'इंजन क्या रिकॉर्ड कर रहा है' },
  waiting_first_action: { en: 'Waiting for first action…', hi: 'पहले क़दम का इंतज़ार…' },
  show_engine_log: { en: 'Show engine log ▼', hi: 'इंजन लॉग देखें ▼' },
  hide_engine_log: { en: 'Hide engine log ▲', hi: 'इंजन लॉग छुपाएँ ▲' },
  glassbox_footnote: {
    en: 'PIN/OTP digits are never recorded — only that a PIN was entered.',
    hi: 'PIN/OTP के अंक कभी रिकॉर्ड नहीं किए जाते — सिर्फ़ यह कि PIN दर्ज किया गया था।'
  },
  event: { en: 'event', hi: 'इवेंट' },
  events: { en: 'events', hi: 'इवेंट्स' },

  // SARAL (Elder-first UI) strings
  home_tagline: {
    en: 'Practise staying safe from scams. It takes 3 minutes.',
    hi: 'ठगी से बचने का अभ्यास। बस 3 मिनट।',
  },
  home_start: {
    en: '▶ Start',
    hi: '▶ शुरू करें',
  },
  home_hint: {
    en: 'Press the button. A voice will explain everything.',
    hi: 'बटन दबाइए। आवाज़ आपको सब समझाएगी।',
  },
  home_sound_line: {
    en: "Turn your phone's volume up. I will explain everything aloud.",
    hi: "फ़ोन की आवाज़ बढ़ा लीजिए। मैं सब कुछ बोलकर समझाऊँगी।",
  },
  home_no_sound_ok: {
    en: "No sound? That's fine. Everything is also written on the screen.",
    hi: "आवाज़ न आए तो भी कोई बात नहीं। सब कुछ स्क्रीन पर लिखा भी रहेगा।",
  },
  home_dev_link: {
    en: "For judges & developers →",
    hi: "For judges & developers →",
  },
  sound_playing: {
    en: "Sound is playing",
    hi: "आवाज़ चल रही है",
  },
  sound_blocked: {
    en: "Your phone is not allowing sound. Please read along.",
    hi: "आपका फ़ोन आवाज़ नहीं चला पा रहा। कृपया पढ़ते हुए आगे बढ़ें।",
  },
  practice_chip: {
    en: 'This is practice, not real',
    hi: 'यह अभ्यास है, असली नहीं',
  },
  soundcheck_text: {
    en: 'Namaste! I am Chaukas Didi. Can you hear my voice?',
    hi: 'नमस्ते! मैं चौकस दीदी हूँ। क्या आपको मेरी आवाज़ सुनाई दे रही है?',
  },
  sound_yes: {
    en: '✓ Yes, I can hear you',
    hi: '✓ हाँ, सुनाई दे रही है',
  },
  sound_no: {
    en: 'No, I cannot',
    hi: 'नहीं सुनाई दे रही',
  },
  sound_help: {
    en: 'Press the volume button on the side of your phone to make it louder.',
    hi: 'फ़ोन के किनारे वाला बटन दबाकर आवाज़ बढ़ाइए।',
  },
  continue_without_sound: {
    en: 'Continue without sound',
    hi: 'बिना आवाज़ के आगे बढ़ें',
  },
  welcome_text: {
    en: 'This is a practice for staying safe from scams. It is not real. None of your real money will go anywhere, and we will never ask for your real PIN, OTP or bank details.',
    hi: 'यह ठगी से बचने का एक अभ्यास है। यह असली नहीं है। इसमें आपका कोई असली पैसा नहीं जाएगा, और हम आपसे कभी आपका असली PIN, OTP या बैंक की जानकारी नहीं पूछेंगे।',
  },
  howto_text: {
    en: "A pretend scammer will now message or call you. Do exactly what you would do in real life. I will read every message aloud. Then choose one of the big buttons below. To listen again, press 'Hear again'.",
    hi: "अभी आपके फ़ोन पर एक नक़ली ठग का मैसेज या कॉल आएगा। आपको वही करना है जो आप असल ज़िंदगी में करते। हर मैसेज मैं आपको पढ़कर सुनाऊँगी। फिर नीचे दिए बड़े बटनों में से एक चुनिए। दोबारा सुनना हो तो 'फिर से सुनें' दबाइए।",
  },
  next: {
    en: 'Continue ▶',
    hi: 'आगे बढ़ें ▶',
  },
  replay: {
    en: '🔊 Hear again',
    hi: '🔊 फिर से सुनें',
  },
  practice_pin_title: {
    en: 'Your practice PIN',
    hi: 'आपका नक़ली PIN',
  },
  practice_pin_chip: {
    en: 'Practice PIN: 4827',
    hi: 'नक़ली PIN: 4827',
  },
  practice_n: {
    en: 'Practice {n} of 3',
    hi: 'अभ्यास {n} / 3',
  },
  skip_question: {
    en: 'skip this question',
    hi: 'यह सवाल छोड़ें',
  },
  label_sms: {
    en: 'New SMS',
    hi: 'नया SMS',
  },
  label_bank_sms: {
    en: 'SMS from your bank',
    hi: 'आपके बैंक का SMS',
  },
  label_call: {
    en: 'On the call',
    hi: 'कॉल पर',
  },
  label_system: {
    en: 'Your phone is asking',
    hi: 'आपका फ़ोन पूछ रहा है',
  },
  what_will_you_do: {
    en: 'What will you do?',
    hi: 'आप क्या करेंगे?',
  },
  pick_up: {
    en: '📞 Pick up',
    hi: '📞 उठाएँ',
  },
  ok: {
    en: 'OK ✓',
    hi: 'ठीक है ✓',
  },
  go_back: {
    en: 'Go back',
    hi: 'वापस जाएँ',
  },
  wrong_pin_text: {
    en: 'That PIN is wrong. The practice PIN is 4827.',
    hi: 'यह PIN ग़लत है। नक़ली PIN 4827 है।',
  },
  leave_practice: {
    en: 'Leave this practice',
    hi: 'अभ्यास छोड़ें',
  },
  leave_confirm: {
    en: 'Leave this practice and go to the start?',
    hi: 'क्या यह अभ्यास छोड़कर शुरुआत पर जाना है?',
  },
  result_scammed: {
    en: 'You were scammed',
    hi: 'आप फँस गए',
  },
  result_escaped: {
    en: 'You stayed safe!',
    hi: 'आप बच गए!',
  },
  result_late: {
    en: 'A narrow escape',
    hi: 'बाल-बाल बचे',
  },
  lost_amount: {
    en: '₹{x} of practice money is gone',
    hi: 'नक़ली ₹{x} चले गए',
  },
  see_how: {
    en: 'See how ▶',
    hi: 'देखें कैसे ▶',
  },
  lesson_fell: {
    en: 'How the scammer trapped you',
    hi: 'ठग ने आपको कैसे फँसाया',
  },
  lesson_safe: {
    en: "The scammer's tricks",
    hi: 'ठग की चालें',
  },
  remember: {
    en: 'Remember',
    hi: 'याद रखिए',
  },
  helpline_card: {
    en: 'If this really happens: call 1930 at once, then call your bank.',
    hi: 'असल में ऐसा हो जाए तो तुरंत 1930 पर कॉल करें, फिर अपने बैंक को।',
  },
  another_yes: {
    en: '▶ One more practice',
    hi: '▶ एक और अभ्यास',
  },
  another_no: {
    en: "That's enough for today",
    hi: 'आज के लिए बस',
  },
  final_title: {
    en: 'You stayed safe {x} out of {y} times',
    hi: '{y} में से {x} बार आप बच गए',
  },
  send_family: {
    en: 'Send to family on WhatsApp',
    hi: 'परिवार को WhatsApp पर भेजें',
  },
  practice_again: {
    en: 'Practise again',
    hi: 'दोबारा अभ्यास करें',
  },
  share_text: {
    en: 'A 3-minute practice for staying safe from scams. Everything is explained aloud in Hindi. Please try it once:',
    hi: 'ठगी से बचने का 3 मिनट का अभ्यास। सब कुछ हिंदी में बोलकर समझाया जाता है। एक बार ज़रूर कीजिए:',
  },
  detailed_view: {
    en: 'See the detailed analysis',
    hi: 'पूरा विश्लेषण देखें',
  },
  check_msg_link: {
    en: 'Check a suspicious message',
    hi: 'कोई संदिग्ध मैसेज जाँचें',
  },
  for_judges: {
    en: 'For judges',
    hi: 'जजों के लिए',
  },
  error_text: {
    en: 'Something went wrong. Nothing was lost. Please start again.',
    hi: 'कुछ गड़बड़ हो गई। आपका कोई नुक़सान नहीं हुआ। कृपया फिर से शुरू करें।',
  },
  error_restart: {
    en: 'Start again',
    hi: 'फिर से शुरू करें',
  },
  flag_explain_urgency: {
    en: 'Here the scammer rushed you, so that you could not think.',
    hi: 'यहाँ ठग ने जल्दी मचाई, ताकि आप सोच न पाएँ।',
  },
  flag_explain_fear: {
    en: 'Here the scammer frightened you.',
    hi: 'यहाँ ठग ने आपको डराया।',
  },
  flag_explain_authority: {
    en: 'Here the scammer claimed to be an officer or someone you can trust.',
    hi: 'यहाँ ठग ने ख़ुद को अधिकारी या भरोसेमंद आदमी बताया।',
  },
  flag_explain_secrecy: {
    en: 'Here the scammer told you not to tell anyone. Real officers never say that.',
    hi: 'यहाँ ठग ने कहा कि किसी को मत बताना। असली अधिकारी ऐसा कभी नहीं कहते।',
  },
  flag_explain_too_good: {
    en: 'This deal was too good. A buyer who pays in full without bargaining is often a scammer.',
    hi: 'यह सौदा ज़रूरत से ज़्यादा अच्छा था। बिना मोल-भाव के पूरा पैसा देने वाला ख़रीदार अक्सर ठग होता है।',
  },
  flag_explain_pin_to_receive: {
    en: "Here the scammer asked for your PIN to 'receive' money. A PIN is only for sending money.",
    hi: 'यहाँ ठग ने पैसा लेने के लिए PIN माँगा। PIN सिर्फ़ पैसा भेजने के लिए होता है।',
  },
  flag_explain_otp_request: {
    en: 'Here the scammer asked for your OTP. Never tell your OTP to anyone.',
    hi: 'यहाँ ठग ने OTP माँगा। OTP कभी किसी को नहीं बताना चाहिए।',
  },
  flag_explain_remote_app: {
    en: 'Here the scammer made you install an app so that he could see your screen.',
    hi: 'यहाँ ठग ने एक ऐप इंस्टॉल करवाया, ताकि वह आपकी स्क्रीन देख सके।',
  },
  flag_explain_unofficial_contact: {
    en: 'This number did not belong to any government office. Always take the number from your bill or the official app.',
    hi: 'यह नंबर किसी सरकारी दफ़्तर का नहीं था। सही नंबर हमेशा अपने बिल या आधिकारिक ऐप से लीजिए।',
  },
  flag_explain_pay_to_verify: {
    en: "Here the scammer asked for money in the name of a 'check'. No real check ever asks for money.",
    hi: 'यहाँ ठग ने जाँच के नाम पर पैसे माँगे। कोई असली जाँच पैसे नहीं माँगती।',
  },
  flag_explain_screen_says_pay: {
    en: 'The screen clearly said you were PAYING, not receiving.',
    hi: 'स्क्रीन पर साफ़ लिखा था कि आप भुगतान कर रहे हैं, पैसा ले नहीं रहे।',
  },
  'flags_summary_olx-qr': {
    en: "This scammer used three tricks: he claimed to be a soldier, he rushed you, and he asked for your PIN to 'receive' money.",
    hi: 'इस ठग ने तीन चालें चलीं: ख़ुद को फ़ौजी बताया, जल्दी मचाई, और पैसा लेने के नाम पर PIN डलवाना चाहा।',
  },
  flags_summary_olx_qr: {
    en: "This scammer used three tricks: he claimed to be a soldier, he rushed you, and he asked for your PIN to 'receive' money.",
    hi: 'इस ठग ने तीन चालें चलीं: ख़ुद को फ़ौजी बताया, जल्दी मचाई, और पैसा लेने के नाम पर PIN डलवाना चाहा।',
  },
  'flags_summary_bijli-remote': {
    en: 'This scammer frightened you about a power cut, claimed to be an officer, made you install a screen-sharing app, and then asked for your OTP.',
    hi: 'इस ठग ने बिजली कटने का डर दिखाया, ख़ुद को अधिकारी बताया, स्क्रीन देखने वाला ऐप इंस्टॉल करवाया, और आख़िर में OTP माँगा।',
  },
  flags_summary_bijli_remote: {
    en: 'This scammer frightened you about a power cut, claimed to be an officer, made you install a screen-sharing app, and then asked for your OTP.',
    hi: 'इस ठग ने बिजली कटने का डर दिखाया, ख़ुद को अधिकारी बताया, स्क्रीन देखने वाला ऐप इंस्टॉल करवाया, और आख़िर में OTP माँगा।',
  },
  'flags_summary_digital-arrest': {
    en: 'This scammer frightened you, claimed to be a police officer, told you to tell no one, and then asked for money in the name of a check.',
    hi: 'इस ठग ने पहले डराया, ख़ुद को पुलिस अफ़सर बताया, कहा किसी को मत बताना, और आख़िर में जाँच के नाम पर पैसे माँगे।',
  },
  flags_summary_digital_arrest: {
    en: 'This scammer frightened you, claimed to be a police officer, told you to tell no one, and then asked for money in the name of a check.',
    hi: 'इस ठग ने पहले डराया, ख़ुद को पुलिस अफ़सर बताया, कहा किसी को मत बताना, और आख़िर में जाँच के नाम पर पैसे माँगे।',
  },
  back_to_practice: {
    en: '← Back to the practice',
    hi: '← अभ्यास पर वापस',
  },
  about_lead: {
    en: 'Chaukas lets people practise staying safe from phone and UPI scams, in a safe place where no real money is involved. It was made for our parents and grandparents.',
    hi: 'चौकस लोगों को फ़ोन और UPI की ठगी से बचने का अभ्यास कराता है, एक सुरक्षित जगह पर, जहाँ कोई असली पैसा नहीं लगता। यह हमारे माता-पिता और दादा-दादी के लिए बनाया गया है।',
  },
  how_it_works_title: {
    en: 'How it works',
    hi: 'यह कैसे काम करता है',
  },
  how_it_works_step1_title: {
    en: '1. A simulated scam call or message begins',
    hi: '1. नक़ली कॉल या मैसेज से शुरुआत',
  },
  how_it_works_step1_desc: {
    en: 'You see the screen and hear the caller, just like in a real fraud attempt.',
    hi: 'आप स्क्रीन देखते हैं और फ़ोन करने वाले की आवाज़ सुनते हैं, बिल्कुल असली ठगी की तरह।',
  },
  how_it_works_step2_title: {
    en: '2. You decide what to do at every step',
    hi: '2. हर क़दम पर आपका फ़ैसला',
  },
  how_it_works_step2_desc: {
    en: 'Pick an answer or enter practice PIN 4827. No real money can ever be lost.',
    hi: 'जवाब चुनिए या प्रैक्टिस PIN 4827 डालिए। आपका कोई असली पैसा नहीं लग सकता।',
  },
  how_it_works_step3_title: {
    en: '3. See the tricks and learn the rules',
    hi: '3. ठग की चालें और बचाव के नियम',
  },
  how_it_works_step3_desc: {
    en: 'We show the red flags you walked past and explain how to stay safe next time.',
    hi: 'हम दिखाते हैं कि आपने कौन से ख़तरे अनदेखे किए और अगली बार कैसे बचना है।',
  },
  why_practise_title: {
    en: 'Why practise',
    hi: 'अभ्यास क्यों ज़रूरी है',
  },
  for_judges_devs_title: {
    en: 'For judges & developers',
    hi: 'जजों और डेवलपर्स के लिए',
  },
  for_judges_devs_desc: {
    en: 'Technical details, evaluation guides, telemetry data, and source code.',
    hi: 'तकनीकी जानकारी, मूल्यांकन गाइड, डेटा और सोर्स कोड।',
  },
  judge_card_title: {
    en: 'Evaluation Guide & Reality Ledger',
    hi: 'मूल्यांकन गाइड और रियलिटी लेजर',
  },
  judge_card_desc: {
    en: 'A 2-minute walkthrough for hackathon judges and what is production vs demo.',
    hi: 'जजों के लिए 2 मिनट का वॉकथ्रू और क्या असली है, क्या डेमो।',
  },
  drill_card_title: {
    en: 'Behavioural Simulator (Drill)',
    hi: 'व्यवहार की ड्रिल (सिमुलेटर)',
  },
  drill_card_desc: {
    en: 'Interactive phone frames, synthetic Hindi voice, and glass-box engine log.',
    hi: 'फ़ोन फ़्रेम, हिंदी आवाज़ और ग्लास-बॉक्स इंजन लॉग के साथ ड्रिल।',
  },
  insights_card_title: {
    en: 'Live Telemetry & Learning Effects',
    hi: 'लाइव आँकड़े और सीखने का असर',
  },
  insights_card_desc: {
    en: 'The knowledge-behaviour gap, first-attempt vs re-try fall rates, and hesitation.',
    hi: 'नियम जानने के बाद भी फँसने का अंतर, दोबारा करने पर सुधार और कीपैड पर सोच।',
  },
  check_card_title: {
    en: 'Message Checker',
    hi: 'मैसेज चेकर',
  },
  check_card_desc: {
    en: 'Client-side red flag scanner checking suspicious messages against fraud archetypes.',
    hi: 'संदिग्ध मैसेज में धोखाधड़ी के संकेतों की तुरंत पहचान करने वाला टूल।',
  },
  github_card_title: {
    en: 'GitHub Repository',
    hi: 'GitHub रिपॉजिटरी',
  },
  github_card_desc: {
    en: 'Source code, deterministic engine, state machines, and Vitest test suite.',
    hi: 'ओपन-सोर्स कोड, स्टेट मशीन, इंजन और टेस्ट सूट।',
  },
};

export function t(key: string, lang: Lang = 'en', vars?: Record<string, string | number>): string {
  const item = DICTIONARY[key];
  let text = item ? item[lang] || item.en : key;

  if (vars) {
    for (const [vKey, val] of Object.entries(vars)) {
      text = text.replaceAll(`{${vKey}}`, String(val));
    }
  }

  return text;
}
