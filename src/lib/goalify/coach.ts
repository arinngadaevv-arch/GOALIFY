/**
 * The coach persona. Every line the coach says lives here so the voice
 * stays consistent across the landing page, the quiz and the app itself.
 */

export const COACH = {
  name: "NOVA",
  role: "Your Performance Coach",
  tagline: "I don't do generic. I build one plan — yours.",
} as const;

/** Rotating openers for the landing page hero. */
export const COACH_GREETINGS: readonly string[] = [
  "I'm NOVA. Give me 90 seconds and I'll build the plan you'll actually finish.",
  "You're here because something needs to change. Good. Let's get to work.",
  "No guesswork, no generic templates. Just your plan, built around you.",
];

/**
 * What the coach says the moment a quiz answer lands. Keyed by step id, then
 * by the chosen value — with a per-step fallback for numeric steps.
 */
const REACTIONS: Record<string, Record<string, string>> = {
  goal: {
    burn: "Boom! Fat loss it is. I'm locking a calorie deficit and muscle-sparing protein into your roadmap right now.",
    build: "Yes! Muscle is the goal. I'm building progressive overload into every single session.",
    tone: "Love it. Lean and defined — I'm dialling in volume and definition work.",
    athletic: "Now we're talking. Conditioning focus locked. Your engine is about to change.",
  },
  focusZones: {
    chest: "Chest, locked. Every push movement in your plan just moved up the priority list.",
    abs: "Abs, noted. Core work is now front-loaded into every single session.",
    arms: "Arms, got it. Expect visible pump work every week.",
    glutes: "Glutes, locked in. Your lower-body volume just went up.",
    legs: "Legs, noted — nothing changes a physique faster than strong legs.",
  },
  painTrigger: {
    time: "I hear you — time is the number one killer. That's exactly why your sessions are built to finish, not to impress.",
    motivation: "Week three is where most plans die. I'm engineering your streak so it doesn't.",
    confusion: "That ends today. You'll never open this app and wonder what to do again.",
    injury: "Thank you for telling me. Nothing in your plan will put you back on the sidelines.",
    restart: "Starting again takes more guts than starting the first time. Respect. Let's make this the last restart.",
  },
  vision: {
    confident: "That's the one. Confidence is built in the reps nobody sees. I'll be there for all of them.",
    strong: "Strength changes how you carry yourself everywhere. We're going after it.",
    energised: "Energy first — everything else follows. Your plan will feel like a battery, not a tax.",
    proud: "Pride in the mirror is earned. In 30 days you'll know exactly what you did to get it.",
  },
  level: {
    beginner: "Perfect place to start. Beginners make the fastest visible progress — I'll protect your form the whole way.",
    returning: "Comeback mode. Your body remembers more than you think. We'll ramp smart.",
    consistent: "Already showing up? Then we stop maintaining and start progressing.",
    advanced: "Elite input, elite output. I'm turning the intensity up for you.",
  },
  // "joints" now anchors the first yes-set commitment card, not the old
  // injury-shielding question — the fixed value it writes is "ready".
  joints: {
    ready: "That's the energy I needed. Let's keep this momentum going.",
  },
  bodyFatPercent: {
    shredded: "Already shredded? Then we're not cutting — we're sharpening. Every rep from here is about definition.",
    athletic: "Athletic base, visible potential. I'm calibrating your deficit to reveal what's already under there.",
    average: "Got it — that's exactly where most transformations start. Your calories just got precision-tuned for it.",
    soft: "Thank you for being honest — that's the hardest part. Your plan is about to become very deliberate.",
  },
  sessionLength: {
    "3-15": "Three short, brutal sessions a week. No filler, no wasted minutes.",
    "4-25": "Four days, 25 minutes — the sweet spot between results and real life.",
    "5-25": "Five days. That's a fast-track pace — I'll manage your recovery carefully.",
    "6-40": "Six days, full sessions. All in. I'll make sure you recover hard enough to keep up.",
  },
  commitment: {
    allin: "THAT'S what I wanted to hear. You just made this a partnership. I'm holding you to it.",
  },
};

/** Fallbacks for the numeric/vitals steps, where there's no discrete value to key on. */
const NUMERIC_REACTIONS: Record<string, string> = {
  weightKg: "Numbers locked in. That's what turns this from a generic plan into your exact calories and macros.",
};

/** The coach's live response to a just-submitted answer, if there is one. */
export function coachReaction(stepId: string, value: unknown): string | null {
  const byValue = REACTIONS[stepId];
  if (byValue) {
    // Multi-select steps hand back an array — react to the first meaningful pick.
    const key = Array.isArray(value) ? String(value[0]) : String(value);
    if (byValue[key]) return byValue[key];
  }
  return NUMERIC_REACTIONS[stepId] ?? null;
}

/** Encouragement shown as the funnel progresses, keyed by rough completion. */
export function coachProgressNudge(percent: number): string {
  if (percent < 25) return "Great start. Keep going — this is already shaping your plan.";
  if (percent < 50) return "You're a quarter in. I'm already seeing the shape of your program.";
  if (percent < 75) return "Halfway. This is where most people quit. Not you.";
  if (percent < 100) return "Almost there. Last few answers and your plan is built.";
  return "That's everything I need. Watch this.";
}
