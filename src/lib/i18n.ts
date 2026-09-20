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
  sound_on: { en: 'Sound', hi: 'आवाज़' },
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
  steps: { en: 'steps', hi: 'कदम' },
  step: { en: 'step', hi: 'कदम' },
  practice_money: { en: 'Practice money', hi: 'प्रैक्टिस के पैसे' },
  practice_pin: { en: 'Practice PIN', hi: 'प्रैक्टिस PIN' },

  // Landing Page (/)
  hero_tag: { en: 'BEHAVIOURAL SIMULATION', hi: 'व्यवहार सिमुलेशन' },
  hero_title: { en: 'Get scammed here. Never out there.', hi: 'यहाँ फँसिए, ताकि बाहर कभी न फँसें।' },
  start_3min_drill: { en: 'Start the 3-minute drill', hi: '3 मिनट की ड्रिल शुरू करें' },
  check_a_message: { en: 'Check a message →', hi: 'मैसेज जाँचें →' },
  hero_disclaimer: {
    en: 'We never ask for your real PIN, OTP, phone number or bank. This is a simulation.',
    hi: 'हम कभी आपका असली PIN, OTP, फ़ोन नंबर या बैंक नहीं पूछते। यह सिर्फ़ एक सिमुलेशन है।'
  },
  landing_footer: {
    en: 'No login · no real credentials · anonymous stats only',
    hi: 'कोई लॉगिन नहीं · कोई असली जानकारी नहीं · केवल अनाम आंकड़े'
  },
  judging_link: { en: 'Judging this? Start here →', hi: 'जज कर रहे हैं? यहाँ से शुरू करें →' },
  message_checker_nav: { en: 'Message Checker', hi: 'मैसेज चेकर' },
  live_insights_nav: { en: 'Live Insights', hi: 'लाइव आँकड़े' },
  check_message_nav: { en: 'Check a Message →', hi: 'मैसेज जाँचें →' },
  fire_drill_1_badge: { en: 'FIRE-DRILL 1.0', hi: 'फ़ायर-ड्रिल 1.0' },
  footer_copy: { en: '© 2026 Chaukas · Tech for a Better Tomorrow', hi: '© 2026 Chaukas · Tech for a Better Tomorrow' },

  // Drill Intro & Keypad
  drill_n_of_3: { en: 'Drill {n} of 3', hi: 'ड्रिल {n} / 3' },
  targeted_practice: { en: 'Targeted Practice', hi: 'लक्षित प्रैक्टिस' },
  precheck_title: { en: 'Pre-Check', hi: 'त्वरित जाँच' },
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
  camera_verification: { en: 'Camera verification requested', hi: 'कैमरा वेरिफिकेशन का अनुरोध' },
  scenario_not_found: { en: 'Scenario not found.', hi: 'परिदृश्य नहीं मिला।' },

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
    hi: 'अपने बैंक के official नंबर पर कॉल करें'
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
  otp_verification_screen: { en: 'OTP Verification Screen', hi: 'OTP वेरिफिकेशन स्क्रीन' },
  keypad_label: { en: 'Keypad', hi: 'कीपैड' },
  knowledge_behaviour_gap_label: {
    en: 'Knowledge–Behaviour Gap',
    hi: 'जानकारी और व्यवहार का अंतर'
  },
  targeted_debrief: { en: 'Targeted Drill Debrief', hi: 'लक्षित ड्रिल का विश्लेषण' },
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
  paste_message_placeholder: {
    en: 'Paste an SMS or WhatsApp message',
    hi: 'SMS या WhatsApp मैसेज यहाँ पेस्ट करें'
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
    hi: 'सोशल इंजीनियरिंग के दबाव को पकड़ने के लिए SMS, WhatsApp मैसेज यहाँ पेस्ट करें।'
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
    hi: "जानकारी सिर्फ़ official ऐप या दफ़्तर से लें। 'बिल अपडेट' या KYC के नाम पर कभी ऐप इंस्टॉल न करें, न OTP बताएँ।"
  },
  advice_receive_money_pin: {
    en: "You never need a PIN, a QR scan or an 'Approve' tap to RECEIVE money.",
    hi: "पैसा लेने के लिए कभी PIN, QR स्कैन या 'Approve' की ज़रूरत नहीं पड़ती।"
  },
  advice_other: {
    en: 'Do not reply, click or pay. Verify through an official channel you look up yourself.',
    hi: 'जवाब न दें, लिंक न खोलें, पैसे न भेजें। ख़ुद official तरीक़े से पता करें।'
  },

  // /insights
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
    hi: 'n = 0: प्री-चेक का सही उत्तर देने वाले किसी व्यक्ति ने अभी तक नहीं खेला है'
  },
  fall_rate_by_archetype: {
    en: 'First-Attempt Fall Rate by Scam Archetype',
    hi: 'स्कैम प्रकार के अनुसार पहली कोशिश में फँसने की दर'
  },
  fall_rate_desc: {
    en: 'Percentage of first-time players who authorized payments or permissions',
    hi: 'पहली बार खेलने वालों का प्रतिशत जिन्होंने भुगतान या अनुमति स्वीकृत की'
  },
  first_try: { en: 'First try', hi: 'पहली कोशिश' },
  redrill: { en: 'Re-drill', hi: 'दोबारा ड्रिल' },
  learning_effect_title: {
    en: 'Learning Effect: First Attempt vs Re-drill',
    hi: 'सीखने का असर: पहली कोशिश बनाम दोबारा ड्रिल'
  },
  learning_effect_desc: {
    en: 'Comparing initial fall rate with repeated practice runs',
    hi: 'प्रारंभिक दर की तुलना दोहराए गए अभ्यास से'
  },
  insights_footer: { en: '© 2026 Chaukas · Anonymous Telemetry', hi: '© 2026 Chaukas · Anonymous Telemetry' },

  // /judge
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
  step3_title: { en: 'Inspect Live Metrics', hi: 'लाइव आंकड़े देखें' },
  step3_desc: {
    en: 'Open /insights to view the live Knowledge–Behaviour Gap metric, per-drill fall rates, and learning effect measured from real players.',
    hi: 'लाइव आंकड़े देखने के लिए /insights खोलें — जानकारी और व्यवहार का अंतर और सीखने का असर देखें।'
  },
  step3_btn: { en: 'Open /insights →', hi: '/insights खोलें →' },
  step4_title: { en: 'Inspect Tests & Architecture', hi: 'टेस्ट और आर्किटेक्चर देखें' },
  step4_desc: {
    en: 'Open the GitHub repository, inspect the pure deterministic engine in src/engine/engine.ts, and run the automated test suite.',
    hi: 'GitHub रिपॉजिटरी खोलें, src/engine/engine.ts में इंजन देखें और टेस्ट सूट चलाएँ।'
  },
  step4_btn: { en: 'View Repository →', hi: 'रिपॉजिटरी देखें →' },
  drills_nav: { en: 'Drills', hi: 'ड्रिल्स' },
  reality_ledger_title: { en: 'Reality Ledger', hi: 'Reality Ledger' },
  reality_ledger_desc: {
    en: 'Honest accounting of what is production-grade vs hackathon MVP shortcuts',
    hi: 'Honest accounting of what is production-grade vs hackathon MVP shortcuts'
  },
  repo_card_title: { en: 'GitHub Repository & Automated Tests', hi: 'GitHub रिपॉजिटरी और ऑटोमेटेड टेस्ट' },
  repo_card_desc: {
    en: 'Inspect the zero-dependency deterministic engine, CI pipelines, and full behavioral test suite.',
    hi: 'इंजन, CI पाइपलाइन और व्यवहार परीक्षण सूट की जाँच करें।'
  },

  // GlassBox
  engine_recording_title: { en: 'What the engine is recording', hi: 'इंजन क्या रिकॉर्ड कर रहा है' },
  waiting_first_action: { en: 'Waiting for first action…', hi: 'पहली कार्रवाई की प्रतीक्षा…' },
  show_engine_log: { en: 'Show engine log ▼', hi: 'इंजन लॉग देखें ▼' },
  hide_engine_log: { en: 'Hide engine log ▲', hi: 'इंजन लॉग छुपाएँ ▲' },
  glassbox_footnote: {
    en: 'PIN/OTP digits are never recorded — only that a PIN was entered.',
    hi: 'PIN/OTP के अंक कभी रिकॉर्ड नहीं किए जाते — सिर्फ़ यह कि PIN दर्ज किया गया था।'
  },
  event: { en: 'event', hi: 'इवेंट' },
  events: { en: 'events', hi: 'इवेंट्स' },
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
