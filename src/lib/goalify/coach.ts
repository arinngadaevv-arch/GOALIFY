/**
 * The AI coach persona. Every line the coach says lives here so the voice
 * stays consistent across the landing page, the quiz and the app itself.
 */

export const COACH = {
  name: "NOVA",
  role: "Your AI Performance Coach",
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
  joints: {
    none: "Full range unlocked. We'll use all of it.",
    knees: "Knees noted. Every jump and deep bend just got rebuilt — same results, zero flare-ups.",
    back: "Spine-neutral from here on out. Nothing that puts your back at risk.",
    shoulders: "No reckless overhead loading. Your shoulders will thank me later.",
  },
  sessionLength: {
    "15": "15 focused minutes beats 60 distracted ones. No filler in your plan.",
    "25": "25 minutes — the sweet spot. Enough to work, short enough to keep.",
    "40": "Full sessions with finishers. You came to work.",
  },
  daysPerWeek: {
    "3": "Three days, done properly, changes bodies. Sustainable wins.",
    "4": "Four days is the sweet spot between results and real life. Great call.",
    "5": "Five days. That's a fast-track pace — I'll manage your recovery carefully.",
    "6": "Six days. All in. I'll make sure you recover hard enough to keep up.",
  },
  commitment: {
    allin: "THAT'S what I wanted to hear. You just made this a partnership. I'm holding you to it.",
    most: "Honest answer — and honest beats perfect. I'll build in the flexibility to keep your streak alive.",
    unsure: "Fair enough. Let me prove it's worth it in week one, and we'll talk again.",
  },
};

/** Fallbacks for the numeric steps, where there's no discrete value to key on. */
const NUMERIC_REACTIONS: Record<string, string> = {
  age: "Locked in. I'm scaling your intensity ramp and recovery windows to match.",
  heightCm: "Got it. That feeds straight into your calorie and protein maths.",
  weightKg: "This is your starting line. In four weeks you'll be glad we wrote it down.",
  targetWeightKg: "Target set. I'm mapping a safe, realistic route there — no crash nonsense.",
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
