'use client';

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  cachedVoices = window.speechSynthesis.getVoices();
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
}

/**
 * Voice selection matching PRD / M1 rules:
 * - hi prefers hi-IN
 * - en prefers en-IN, then en-GB, then en-US
 * - Score: /natural|neural|online/i +4, /google/i +3, exact lang match +2, non-local service +1
 * - If hi has no Hindi voice on the device: return null (do not speak, never read Hindi with English voice).
 */
function getBestVoice(lang: 'en' | 'hi'): SpeechSynthesisVoice | null {
  loadVoices();
  if (!cachedVoices || cachedVoices.length === 0) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      cachedVoices = window.speechSynthesis.getVoices();
    }
  }
  if (!cachedVoices || cachedVoices.length === 0) return null;

  if (lang === 'hi') {
    const hindiVoices = cachedVoices.filter(v =>
      v.lang.toLowerCase().startsWith('hi')
    );
    if (hindiVoices.length === 0) {
      // No Hindi voice on device -> return null (text only)
      return null;
    }

    return hindiVoices
      .map(v => {
        let score = 0;
        const name = v.name.toLowerCase();
        const vLang = v.lang.toLowerCase();
        if (vLang === 'hi-in' || vLang === 'hi_in') score += 2;
        if (/natural|neural|online/i.test(name)) score += 4;
        if (/google/i.test(name)) score += 3;
        if (!v.localService) score += 1;
        return { voice: v, score };
      })
      .sort((a, b) => b.score - a.score)[0].voice;
  }

  // lang === 'en'
  const englishVoices = cachedVoices.filter(v =>
    v.lang.toLowerCase().startsWith('en')
  );
  if (englishVoices.length === 0) return null;

  return englishVoices
    .map(v => {
      let score = 0;
      const name = v.name.toLowerCase();
      const vLang = v.lang.toLowerCase();

      // Language preference: en-IN (+10), en-GB (+6), en-US (+4), other en (+2)
      if (vLang === 'en-in' || vLang === 'en_in') score += 10;
      else if (vLang === 'en-gb' || vLang === 'en_gb') score += 6;
      else if (vLang === 'en-us' || vLang === 'en_us') score += 4;
      else score += 2;

      if (/natural|neural|online/i.test(name)) score += 4;
      if (/google/i.test(name)) score += 3;
      if (!v.localService) score += 1;

      return { voice: v, score };
    })
    .sort((a, b) => b.score - a.score)[0].voice;
}

/**
 * Speech synthesis helper.
 * Queues utterances without canceling existing ones.
 * Fails silently if unsupported or blocked.
 */
export function speak(text: string, lang: 'en' | 'hi') {
  try {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const voice = getBestVoice(lang);
    // If lang is 'hi' and no Hindi voice exists on device: do not speak at all
    if (lang === 'hi' && !voice) {
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else {
      u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    }
    u.rate = 0.95;
    u.pitch = 0.9;

    // QUEUE utterance: do NOT call cancel() inside speak()
    window.speechSynthesis.speak(u);
  } catch {
    /* voice is garnish */
  }
}

/**
 * Stops all currently speaking and queued speech.
 */
export function stopSpeaking() {
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
}

let activeRingCleanup: (() => void) | null = null;

/**
 * Stops any active WebAudio ringtone.
 */
export function stopRing() {
  if (activeRingCleanup) {
    try {
      activeRingCleanup();
    } catch {
      /* ignore */
    }
    activeRingCleanup = null;
  }
}

/**
 * WebAudio 2-tone ring (440 Hz / 480 Hz) gain-gated 0.4s on / 0.2s off for ~2 seconds.
 * No audio files, 100% WebAudio oscillator synthesis.
 * Returns a stop function to silence immediately if answered early.
 */
export function playRingtone(): () => void {
  stopRing(); // Stop previous ring if still active

  try {
    if (typeof window === 'undefined') return () => {};
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return () => {};

    const ctx = new AudioCtx();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.value = 440;
    osc2.type = 'sine';
    osc2.frequency.value = 480;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    // ~2s two-tone ring: 0.4s on / 0.2s off
    gain.gain.setValueAtTime(0, now);
    for (let t = 0; t < 2.0; t += 0.6) {
      gain.gain.setValueAtTime(0.15, now + t);
      gain.gain.setValueAtTime(0, now + t + 0.4);
    }

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.0);
    osc2.stop(now + 2.0);

    try {
      navigator.vibrate?.([300, 150, 300]);
    } catch {
      /* vibrate is garnish */
    }

    const cleanup = () => {
      try {
        osc1.stop();
        osc2.stop();
        ctx.close();
      } catch {
        /* ignore */
      }
    };

    activeRingCleanup = cleanup;

    return () => {
      cleanup();
      if (activeRingCleanup === cleanup) {
        activeRingCleanup = null;
      }
    };
  } catch {
    return () => {};
  }
}
