'use client';

import voiceManifest from './voiceManifest.json';

export type VoiceChoice = 'hi' | 'en' | 'off';

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

export type AudioPlaybackState = 'idle' | 'playing' | 'paused' | 'ended' | 'blocked';
type AudioStateListener = (state: AudioPlaybackState) => void;
const audioStateListeners = new Set<AudioStateListener>();
let currentAudioState: AudioPlaybackState = 'idle';

export function getAudioState(): AudioPlaybackState {
  return currentAudioState;
}

export function subscribeAudioState(listener: AudioStateListener): () => void {
  audioStateListeners.add(listener);
  listener(currentAudioState);
  return () => {
    audioStateListeners.delete(listener);
  };
}

export function notifyAudioState(state: AudioPlaybackState) {
  currentAudioState = state;
  for (const listener of audioStateListeners) {
    try {
      listener(state);
    } catch {
      /* ignore */
    }
  }
}

// Shared HTMLAudioElement for all pre-recorded clips
let sharedAudio: HTMLAudioElement | null = null;
let audioQueue: string[] = [];
let isPlayingAudio = false;

function onClipEnded() {
  if (audioQueue.length > 0) {
    const nextSrc = audioQueue.shift()!;
    if (sharedAudio) {
      sharedAudio.src = nextSrc;
      sharedAudio.currentTime = 0;
      const playPromise = sharedAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          notifyAudioState('blocked');
          onClipEnded();
        });
      }
    }
  } else {
    isPlayingAudio = false;
    notifyAudioState('ended');
  }
}

function onClipError() {
  notifyAudioState('ended');
  onClipEnded();
}

function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.addEventListener('playing', () => notifyAudioState('playing'));
    sharedAudio.addEventListener('pause', () => notifyAudioState('paused'));
    sharedAudio.addEventListener('ended', onClipEnded);
    sharedAudio.addEventListener('error', onClipError);
  }
  return sharedAudio;
}

/**
 * Unlock shared HTMLAudioElement inside first user tap (Start drill / Accept call)
 * with play() then pause(), enabling playback on iOS Safari.
 */
export function unlockAudio() {
  try {
    const audio = getSharedAudio();
    if (!audio) return;
    if (!audio.src) {
      // 1-sample silent WAV so play() doesn't throw unsupported source error
      audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
    }
    const p = audio.play();
    if (p !== undefined) {
      p.then(() => {
        audio.pause();
      }).catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

let activeClipResolver: (() => void) | null = null;
let activeWaitTimer: ReturnType<typeof setTimeout> | null = null;

function enqueueAudioSrc(src: string) {
  const audio = getSharedAudio();
  if (!audio) return;

  if (isPlayingAudio) {
    audioQueue.push(src);
  } else {
    isPlayingAudio = true;
    audio.src = src;
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        notifyAudioState('blocked');
        onClipEnded();
      });
    }
  }
}

/**
 * Play a narration or dialogue clip by key, or fallback to TTS / wait.
 * Resolves when the clip ends OR stopSpeaking() is called.
 */
export function playClip(
  key: string,
  fallbackText: string,
  lang: 'en' | 'hi',
  soundOn: boolean = true
): Promise<void> {
  return new Promise<void>((resolve) => {
    // Stop any current speaking/waiting first
    stopSpeaking();

    activeClipResolver = resolve;

    // If sound is off -> wait clamp(text.length * 70, 1500, 8000) ms
    if (!soundOn || key === 'off') {
      const waitMs = Math.min(Math.max(fallbackText.length * 70, 1500), 8000);
      activeWaitTimer = setTimeout(() => {
        activeWaitTimer = null;
        if (activeClipResolver === resolve) {
          activeClipResolver = null;
          resolve();
        }
      }, waitMs);
      return;
    }

    // Look for pre-recorded clip in manifest
    const manifest = voiceManifest as Record<string, string>;
    const directKey = key.includes('/') ? key : `${lang}/${key}`;
    const hiKey = key.includes('/') ? key : `hi/${key}`;
    const clipUrl = manifest[directKey] || (lang === 'hi' ? manifest[hiKey] : undefined);

    if (lang === 'hi' && clipUrl) {
      const audio = getSharedAudio();
      if (!audio) {
        resolve();
        return;
      }
      isPlayingAudio = true;
      audio.src = clipUrl;
      audio.currentTime = 0;

      const finishAudio = () => {
        audio.removeEventListener('ended', finishAudio);
        audio.removeEventListener('error', finishAudio);
        isPlayingAudio = false;
        if (activeClipResolver === resolve) {
          activeClipResolver = null;
          resolve();
        }
      };

      audio.addEventListener('ended', finishAudio, { once: true });
      audio.addEventListener('error', finishAudio, { once: true });

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          notifyAudioState('blocked');
          finishAudio();
        });
      }
      return;
    }

    // English or missing clip -> browser TTS with fallbackText
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      const waitMs = Math.min(Math.max(fallbackText.length * 70, 1500), 8000);
      activeWaitTimer = setTimeout(() => {
        activeWaitTimer = null;
        if (activeClipResolver === resolve) {
          activeClipResolver = null;
          resolve();
        }
      }, waitMs);
      return;
    }

    const voice = getBestVoice(lang);
    if (lang === 'hi' && !voice) {
      // No TTS voice on device for Hindi -> just wait clamp(...)
      const waitMs = Math.min(Math.max(fallbackText.length * 70, 1500), 8000);
      activeWaitTimer = setTimeout(() => {
        activeWaitTimer = null;
        if (activeClipResolver === resolve) {
          activeClipResolver = null;
          resolve();
        }
      }, waitMs);
      return;
    }

    try {
      const u = new SpeechSynthesisUtterance(fallbackText);
      if (voice) {
        u.voice = voice;
        u.lang = voice.lang;
      } else {
        u.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      }
      u.rate = 0.95;
      u.pitch = 0.9;

      let completed = false;
      const finishTTS = () => {
        if (completed) return;
        completed = true;
        if (activeWaitTimer) {
          clearTimeout(activeWaitTimer);
          activeWaitTimer = null;
        }
        if (activeClipResolver === resolve) {
          activeClipResolver = null;
          resolve();
        }
      };

      u.onstart = () => notifyAudioState('playing');
      u.onpause = () => notifyAudioState('paused');
      u.onresume = () => notifyAudioState('playing');
      u.onend = () => {
        notifyAudioState('ended');
        finishTTS();
      };
      u.onerror = () => {
        notifyAudioState('blocked');
        finishTTS();
      };

      // Fallback timeout in case speech synthesis hangs
      const maxMs = Math.max(fallbackText.length * 150, 10000);
      activeWaitTimer = setTimeout(finishTTS, maxMs);

      window.speechSynthesis.speak(u);
    } catch {
      notifyAudioState('blocked');
      resolve();
    }
  });
}

export interface PlayLineOptions {
  scenarioId: string;
  nodeId: string;
  index: number;
  voiceLang: VoiceChoice;
  text: string;
  uiLang?: 'en' | 'hi';
  uiText?: string;
}

/**
 * Plays a pre-recorded clip if present in manifest, else falls back to TTS speak().
 * If a Hindi clip is missing for a line, falls back to TTS in the UI language.
 * If voiceLang === 'off', stays silent.
 */
export function playLine({ scenarioId, nodeId, index, voiceLang, text, uiLang, uiText }: PlayLineOptions) {
  if (voiceLang === 'off') return;

  const key = `${voiceLang}/${scenarioId}__${nodeId}__${index}`;
  const clipUrl = (voiceManifest as Record<string, string>)[key];

  if (clipUrl) {
    enqueueAudioSrc(clipUrl);
  } else {
    // If a Hindi clip is missing for a line, fall back to TTS in the UI language.
    const targetLang = (voiceLang === 'hi' && uiLang) ? uiLang : (voiceLang as 'en' | 'hi');
    const targetText = (voiceLang === 'hi' && uiText) ? uiText : text;
    speak(targetText, targetLang);
  }
}

/**
 * Preload only the specified clips (e.g. next two clips)
 */
export function preloadClips(clipKeys: string[], voiceLang: VoiceChoice = 'hi') {
  if (typeof window === 'undefined' || voiceLang === 'off') return;
  const manifest = voiceManifest as Record<string, string>;
  for (const key of clipKeys) {
    const directKey = key.includes('/') ? key : `${voiceLang}/${key}`;
    const url = manifest[directKey];
    if (url) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = url;
    }
  }
}

/**
 * Preload scenario clips for chosen voice language on drill start
 */
export function preloadScenarioClips(scenarioId: string, voiceLang: VoiceChoice) {
  if (typeof window === 'undefined' || voiceLang === 'off') return;
  const prefix = `${voiceLang}/${scenarioId}__`;
  for (const [k, url] of Object.entries(voiceManifest as Record<string, string>)) {
    if (k.startsWith(prefix)) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = url;
    }
  }
}

/**
 * Stops all currently speaking and queued speech and pre-recorded clips.
 * Called on every action, node change, mute, tab hidden and result screen.
 */
export function stopSpeaking() {
  audioQueue = [];
  isPlayingAudio = false;
  notifyAudioState('idle');
  if (activeWaitTimer) {
    clearTimeout(activeWaitTimer);
    activeWaitTimer = null;
  }
  if (sharedAudio) {
    try {
      sharedAudio.pause();
      sharedAudio.removeAttribute('src');
    } catch {
      /* ignore */
    }
  }
  try {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch {
    /* ignore */
  }
  if (activeClipResolver) {
    const res = activeClipResolver;
    activeClipResolver = null;
    res();
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
