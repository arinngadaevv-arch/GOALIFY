"use client";

/**
 * Synthesized Web Audio cues — no audio files to fetch, and every sound is
 * tuned to the app's energy. Tones are layered and detuned rather than single
 * sine beeps, which is what keeps them feeling like a game power-up instead
 * of a microwave timer.
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
  /** Cents of detune — a little spread makes a tone feel wide and synthy. */
  detune?: number;
  /** Optional glide to this frequency over the tone's life. */
  glideTo?: number;
};

function playTones(tones: readonly Tone[]) {
  const ctx = getContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  // A shared lowpass keeps the square/saw layers warm rather than harsh.
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 5200;
  filter.connect(ctx.destination);

  for (const tone of tones) {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = tone.type ?? "sine";
    oscillator.frequency.value = tone.frequency;
    if (tone.detune) oscillator.detune.value = tone.detune;

    const start = now + tone.startOffset;
    const end = start + tone.duration;
    const peak = tone.gain ?? 0.16;

    if (tone.glideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(tone.glideTo, end);
    }

    // Fast attack, exponential decay — click-free without a sample.
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(peak, start + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, end);

    oscillator.connect(gainNode);
    gainNode.connect(filter);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

/** Layers a tone with a detuned twin for width. */
function wide(tone: Tone): Tone[] {
  return [tone, { ...tone, detune: (tone.detune ?? 0) + 9, gain: (tone.gain ?? 0.16) * 0.6 }];
}

/** 3-2-1 countdown blip — pitch rises as the count drops toward zero. */
export function playCountdownBeep(secondsLeft: 3 | 2 | 1) {
  const frequency = { 3: 660, 2: 784, 1: 988 }[secondsLeft];
  playTones([
    ...wide({
      frequency,
      startOffset: 0,
      duration: 0.11,
      gain: 0.15,
      type: "triangle",
    }),
  ]);
}

/** Bright two-note lift when a new exercise begins. */
export function playExerciseChime() {
  playTones([
    ...wide({
      frequency: 587.33,
      startOffset: 0,
      duration: 0.12,
      gain: 0.13,
      type: "triangle",
    }),
    ...wide({
      frequency: 880,
      startOffset: 0.085,
      duration: 0.2,
      gain: 0.14,
      type: "triangle",
    }),
  ]);
}

/** Rising power-up arpeggio for finishing a whole session. */
export function playCompletionCelebration() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
  playTones(
    notes.flatMap((frequency, index) =>
      wide({
        frequency,
        startOffset: index * 0.085,
        duration: index === notes.length - 1 ? 0.42 : 0.16,
        gain: 0.15,
        type: "triangle",
      }),
    ),
  );
}

/**
 * A soft, luxury "glass chime" for per-tap selection feedback (toggling a
 * body-map zone, picking a multi-select option) — pure sine fundamental with
 * a faint octave-up shimmer, slow enough attack/decay to read as premium
 * rather than a UI click. Deliberately calmer than playHypeSelect /
 * playUnlockFanfare, which stay reserved for bigger commit/unlock moments.
 */
export function playGlassChime() {
  playTones([
    { frequency: 1046.5, startOffset: 0, duration: 0.22, gain: 0.09, type: "sine" },
    { frequency: 2093, startOffset: 0.015, duration: 0.16, gain: 0.03, type: "sine" },
  ]);
}

/** Two-note "locked in" confirmation as the quiz advances. */
export function playProgressPowerUp() {
  playTones([
    ...wide({
      frequency: 659.25,
      startOffset: 0,
      duration: 0.1,
      gain: 0.12,
      type: "triangle",
    }),
    ...wide({
      frequency: 987.77,
      startOffset: 0.075,
      duration: 0.18,
      gain: 0.13,
      type: "triangle",
    }),
  ]);
}

/**
 * The quiz's "hype" selection cue — a bright impact transient followed by a
 * quick rising flick, tuned to land with the neon glow + particle burst.
 * Punchier than the plain click pop used on utility taps (steppers etc).
 */
export function playHypeSelect() {
  playTones([
    // Low thump for physical weight, right on the hit.
    {
      frequency: 180,
      startOffset: 0,
      duration: 0.09,
      gain: 0.14,
      type: "sine",
    },
    ...wide({
      frequency: 740,
      glideTo: 1180,
      startOffset: 0.005,
      duration: 0.14,
      gain: 0.15,
      type: "triangle",
    }),
    ...wide({
      frequency: 1480,
      startOffset: 0.09,
      duration: 0.1,
      gain: 0.09,
      type: "triangle",
    }),
  ]);
}

/** Minimum time between slider ticks — a fast drag can fire dozens of
 * value-change events per second, and without this a "click-clack" per
 * pixel stacks into a stuttering wall of noise instead of a tick. */
const SLIDER_TICK_MIN_INTERVAL_MS = 45;
let lastSliderTickAt = 0;

/**
 * A soft, low-frequency "luxury" tick for slider drags — a single warm sine
 * knock with a barely-there shimmer overtone, quiet and short enough to
 * disappear under a fast drag rather than a mechanical click-clack. Calls
 * faster than SLIDER_TICK_MIN_INTERVAL_MS apart are silently dropped so
 * rapid dragging never overlaps or stutters.
 */
export function playSliderTick() {
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - lastSliderTickAt < SLIDER_TICK_MIN_INTERVAL_MS) return;
  lastSliderTickAt = now;

  playTones([
    { frequency: 340, startOffset: 0, duration: 0.05, gain: 0.055, type: "sine" },
    { frequency: 680, startOffset: 0.006, duration: 0.03, gain: 0.018, type: "sine" },
  ]);
}

/**
 * Explosive "GO!" hit for the watch-then-do transition — a single sharp
 * low-end punch under a rising bright stab, tuned to land like a starting
 * gun rather than a countdown blip.
 */
export function playGoCue() {
  playTones([
    { frequency: 110, startOffset: 0, duration: 0.14, gain: 0.22, type: "sine" },
    ...wide({
      frequency: 660,
      glideTo: 1320,
      startOffset: 0,
      duration: 0.16,
      gain: 0.18,
      type: "sawtooth",
    }),
    ...wide({
      frequency: 1760,
      startOffset: 0.02,
      duration: 0.12,
      gain: 0.1,
      type: "triangle",
    }),
  ]);
}

/** Big triumphant flourish for the plan-unlock moment. */
export function playUnlockFanfare() {
  playTones([
    ...wide({ frequency: 392, startOffset: 0, duration: 0.16, gain: 0.14, type: "triangle" }),
    ...wide({ frequency: 523.25, startOffset: 0.1, duration: 0.16, gain: 0.14, type: "triangle" }),
    ...wide({ frequency: 659.25, startOffset: 0.2, duration: 0.16, gain: 0.15, type: "triangle" }),
    ...wide({ frequency: 1046.5, startOffset: 0.3, duration: 0.55, gain: 0.17, type: "triangle" }),
    {
      frequency: 1567.98,
      startOffset: 0.34,
      duration: 0.5,
      gain: 0.07,
      type: "sine",
    },
  ]);
}
