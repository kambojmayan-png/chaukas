import type { RedFlag, Lang } from '@/engine/engine';

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
  // Additional flags from /check
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
