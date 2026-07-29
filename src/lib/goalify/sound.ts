"use client";

/**
 * Synthesized Web Audio cues for the Live Player — short oscillator blips
 * rather than audio files, so there's nothing to fetch and every sound
 * matches the app's tone exactly. One shared AudioContext is created lazily
 * on first use and resumed if the browser suspended it.
 */

let sharedContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedContext) {
    sharedContext = new AudioContextClass();
  }
  if (sharedContext.state === "suspended") {
    void sharedContext.resume();
  }
  return sharedContext;
}

type Tone = {
  frequency: number;
  /** Seconds from now the tone starts. */
  startOffset: number;
  duration: number;
  gain?: number;
  type?: OscillatorType;
};

function playTones(tones: readonly Tone[]) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  for (const tone of tones) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = tone.type ?? "sine";
    oscillator.frequency.value = tone.frequency;

    const start = now + tone.startOffset;
    const end = start + tone.duration;
    const peak = tone.gain ?? 0.16;

    // Quick linear attack then exponential decay — keeps every blip
    // click-free without needing a sample.
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + 0.012);
    gainNode.gain.exponentialRampToValueAtTime(0.001, end);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

/** 3-2-1 countdown blip — pitch rises as the count drops toward zero. */
export function playCountdownBeep(secondsLeft: 3 | 2 | 1) {
  const frequency = { 3: 660, 2: 780, 1: 920 }[secondsLeft];
  playTones([{ frequency, startOffset: 0, duration: 0.09, gain: 0.16 }]);
}

/** Two-note ascending chime for moving into a new exercise. */
export function playExerciseChime() {
  playTones([
    { frequency: 523.25, startOffset: 0, duration: 0.11, gain: 0.14 }, // C5
    { frequency: 783.99, startOffset: 0.09, duration: 0.17, gain: 0.15 }, // G5
  ]);
}

/** Short major arpeggio for finishing the whole session. */
export function playCompletionCelebration() {
  playTones([
    { frequency: 523.25, startOffset: 0, duration: 0.15, gain: 0.15 }, // C5
    { frequency: 659.25, startOffset: 0.1, duration: 0.15, gain: 0.15 }, // E5
    { frequency: 783.99, startOffset: 0.2, duration: 0.15, gain: 0.16 }, // G5
    { frequency: 1046.5, startOffset: 0.32, duration: 0.32, gain: 0.18 }, // C6
  ]);
}
