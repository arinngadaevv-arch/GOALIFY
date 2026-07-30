import type { QuizAnswers } from "./types";

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
  emoji: string;
  /**
   * Social-proof line rendered under the option.
   *
   * PLACEHOLDER MARKETING COPY — these figures are illustrative, not measured.
   * Replace every one of them with real, substantiated numbers (or delete the
   * field) before showing this funnel to paying customers.
   */
  socialProof?: string;
  /** Motivational badge that snaps in the instant this option is chosen. */
  badge?: string;
};

export type QuizStep =
  | {
      id: keyof QuizAnswers;
      kind: "choice";
      /** `multi` collects an array of values instead of a single one. */
      multi?: boolean;
      /** Short label shown in the coach's eyebrow above the question. */
      chapter: string;
      title: string;
      subtitle: string;
      options: ChoiceOption[];
    }
  | {
      id: keyof QuizAnswers;
      kind: "number";
      chapter: string;
      title: string;
      subtitle: string;
      unit: string;
      min: number;
      max: number;
      step: number;
      defaultValue: number;
    };

/**
 * Ordered as a conversion funnel rather than a form: desire first, then the
 * pain that has blocked it, then the feeling they're chasing — and only once
 * they're invested do we ask for the numbers. The final step is an explicit
 * commitment, so the last thing they do before seeing their plan is say yes.
 */
export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "goal",
    kind: "choice",
    chapter: "The dream",
    title:
      "What is the #1 body transformation you want to unlock before everyone else notices?",
    subtitle:
      "Not what sounds reasonable. The version of you that turns heads.",
    options: [
      {
        value: "burn",
        label: "Lean and cut",
        description: "Strip the fat, keep every ounce of muscle",
        emoji: "🔥",
        socialProof: "Chosen by 41% of members",
        badge: "SHREDDED MODE",
      },
      {
        value: "build",
        label: "Bigger and stronger",
        description: "Real size, real strength, visible power",
        emoji: "💪",
        socialProof: "Fastest strength gains in weeks 3–6",
        badge: "MASS MODE",
      },
      {
        value: "tone",
        label: "Toned and defined",
        description: "Sculpted definition without the bulk",
        emoji: "✨",
        socialProof: "Most popular first-time goal",
        badge: "SCULPT MODE",
      },
      {
        value: "athletic",
        label: "Athletic and unstoppable",
        description: "Move faster, last longer, hit harder",
        emoji: "⚡",
        socialProof: "Biggest reported energy jump",
        badge: "ATHLETE MODE",
      },
    ],
  },
  {
    id: "painTrigger",
    kind: "choice",
    chapter: "The block",
    title: "What has been standing between you and that body?",
    subtitle:
      "Name it and I'll engineer it out. This is the answer your whole plan is built around.",
    options: [
      {
        value: "time",
        label: "I never have the time",
        description: "Life fills up and training is the first thing cut",
        emoji: "⌛",
        socialProof: "Solved with 15-minute finishable sessions",
        badge: "TIME UNLOCKED",
      },
      {
        value: "motivation",
        label: "My motivation dies",
        description: "Strong start, then week three hits",
        emoji: "📉",
        socialProof: "Streak system keeps members going past week 8",
        badge: "STREAK ARMED",
      },
      {
        value: "confusion",
        label: "I never know what to do",
        description: "Too many plans, too much conflicting advice",
        emoji: "🤯",
        socialProof: "Every session is decided for you",
        badge: "CLARITY LOCKED",
      },
      {
        value: "injury",
        label: "Pain keeps stopping me",
        description: "Something always flares up and I lose weeks",
        emoji: "🩹",
        socialProof: "Joint-safe swaps built into every movement",
        badge: "SHIELD UP",
      },
      {
        value: "restart",
        label: "I keep starting over",
        description: "I've begun a dozen times and never finished one",
        emoji: "🔁",
        socialProof: "Built to be the last plan you start",
        badge: "FINAL RESTART",
      },
    ],
  },
  {
    id: "vision",
    kind: "choice",
    chapter: "The vision",
    title:
      "How will you feel when you look in the mirror 30 days from now and see your dream body?",
    subtitle:
      "Sit with it for a second. That feeling is the whole reason we're here.",
    options: [
      {
        value: "confident",
        label: "Completely confident",
        description: "Clothes fit right and I stand taller",
        emoji: "🔥",
        socialProof: "The #1 reported change at day 30",
        badge: "CONFIDENCE TARGET",
      },
      {
        value: "strong",
        label: "Genuinely strong",
        description: "Powerful, capable, hard to break",
        emoji: "🦾",
        socialProof: "Strength shows up before the mirror does",
        badge: "POWER TARGET",
      },
      {
        value: "energised",
        label: "Full of energy",
        description: "No 3pm crash, no dragging myself around",
        emoji: "⚡",
        socialProof: "Most members notice this in week 1",
        badge: "ENERGY TARGET",
      },
      {
        value: "proud",
        label: "Proud I finally did it",
        description: "I said I would, and this time I did",
        emoji: "🏆",
        socialProof: "The feeling that keeps members training",
        badge: "PRIDE TARGET",
      },
    ],
  },
  {
    id: "level",
    kind: "choice",
    chapter: "The launch point",
    title: "Where does your transformation begin?",
    subtitle:
      "Every great before-photo starts somewhere. Be honest and I'll pitch it perfectly.",
    options: [
      {
        value: "beginner",
        label: "Total beginner",
        description: "New to real, structured training",
        emoji: "🌱",
        socialProof: "Beginners see the fastest visible change",
        badge: "FRESH START",
      },
      {
        value: "returning",
        label: "Coming back after a break",
        description: "I trained before. Then life happened.",
        emoji: "🔄",
        socialProof: "Muscle memory kicks in within 2 weeks",
        badge: "COMEBACK ARC",
      },
      {
        value: "consistent",
        label: "Training fairly consistently",
        description: "I show up most weeks already",
        emoji: "📈",
        socialProof: "Time to stop maintaining and start progressing",
        badge: "MOMENTUM MODE",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Years in. Chasing the next level.",
        emoji: "🏆",
        socialProof: "Highest-intensity programming unlocked",
        badge: "ELITE TIER",
      },
    ],
  },
  {
    id: "joints",
    kind: "choice",
    multi: true,
    chapter: "Your armour",
    title: "What do I need to protect so nothing derails you?",
    subtitle:
      "I rebuild every single movement around this. Pick all that apply — or none.",
    options: [
      {
        value: "none",
        label: "Nothing hurts",
        description: "Full range of movement available",
        emoji: "✅",
        badge: "FULL RANGE",
      },
      {
        value: "knees",
        label: "My knees",
        description: "Auto-swaps every jump and deep bend",
        emoji: "🦵",
        socialProof: "Knee-safe mode keeps members training pain-free",
        badge: "KNEES GUARDED",
      },
      {
        value: "back",
        label: "My lower back",
        description: "Spine-neutral variations only",
        emoji: "🧘",
        badge: "SPINE GUARDED",
      },
      {
        value: "shoulders",
        label: "My shoulders",
        description: "No reckless overhead loading",
        emoji: "🫱",
        badge: "SHOULDERS GUARDED",
      },
    ],
  },
  {
    id: "sessionLength",
    kind: "choice",
    chapter: "Your window",
    title: "How much time will you claim for yourself each day?",
    subtitle:
      "This is your hour of power — even if it's fifteen minutes. I'll make every second count.",
    options: [
      {
        value: "15",
        label: "15 minutes",
        description: "Express, no equipment, no excuses",
        emoji: "⚡",
        socialProof: "Highest completion rate of any session length",
        badge: "EXPRESS POWER",
      },
      {
        value: "25",
        label: "25 minutes",
        description: "Balanced and complete",
        emoji: "⏱️",
        socialProof: "The sweet spot most members settle on",
        badge: "SWEET SPOT",
      },
      {
        value: "40",
        label: "40 minutes",
        description: "Full session with finishers",
        emoji: "🏋️",
        socialProof: "Fastest route to visible definition",
        badge: "FULL SEND",
      },
    ],
  },
  {
    id: "daysPerWeek",
    kind: "choice",
    chapter: "Your rhythm",
    title: "How often do you want to feel unstoppable?",
    subtitle:
      "Every session is a deposit. Pick the pace you'll genuinely keep.",
    options: [
      {
        value: "3",
        label: "3 days",
        description: "Steady and genuinely sustainable",
        emoji: "🗓️",
        socialProof: "Enough to change your body",
        badge: "STEADY CLIMB",
      },
      {
        value: "4",
        label: "4 days",
        description: "The sweet spot",
        emoji: "🎯",
        socialProof: "Best results-to-effort ratio",
        badge: "OPTIMAL PACE",
      },
      {
        value: "5",
        label: "5 days",
        description: "Fast-track results",
        emoji: "🚀",
        socialProof: "Fastest 30-day transformations",
        badge: "FAST TRACK",
      },
      {
        value: "6",
        label: "6 days",
        description: "All in",
        emoji: "🔥",
        socialProof: "Recovery managed automatically",
        badge: "MAXIMUM DRIVE",
      },
    ],
  },
  {
    id: "sex",
    kind: "choice",
    chapter: "The science",
    title: "Let's dial in your engine",
    subtitle:
      "Biological sex sets your metabolic baseline — it's pure maths, nothing else.",
    options: [
      { value: "female", label: "Female", emoji: "♀️" },
      { value: "male", label: "Male", emoji: "♂️" },
      {
        value: "unspecified",
        label: "Prefer not to say",
        description: "We'll use an average baseline",
        emoji: "•",
        badge: "ENGINE TUNED",
      },
    ],
  },
  {
    id: "age",
    kind: "number",
    chapter: "The science",
    title: "How many years of experience are we working with?",
    subtitle:
      "Age tunes your recovery windows and how fast I ramp your intensity.",
    unit: "years",
    min: 16,
    max: 80,
    step: 1,
    defaultValue: 30,
  },
  {
    id: "heightCm",
    kind: "number",
    chapter: "The science",
    title: "Your frame",
    subtitle: "This feeds straight into the calories and protein that build you.",
    unit: "cm",
    min: 140,
    max: 215,
    step: 1,
    defaultValue: 175,
  },
  {
    id: "weightKg",
    kind: "number",
    chapter: "The before",
    title: "This is your day-one number",
    subtitle:
      "Burn it into your memory. In four weeks you'll love how far it moved.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 78,
  },
  {
    id: "targetWeightKg",
    kind: "number",
    chapter: "The after",
    title: "Now show me the number you're chasing",
    subtitle:
      "I'll map the safe, realistic route there — and show you the exact curve.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 70,
  },
  {
    id: "commitment",
    kind: "choice",
    chapter: "The pact",
    title: "Final question. Are you ready to become that person?",
    subtitle:
      "If I hold you accountable every single day, will you give me your session?",
    options: [
      {
        value: "allin",
        label: "I'm all in. Let's go.",
        description: "Hold me to it. Every day.",
        emoji: "🔥",
        socialProof: "All-in members are the most likely to finish week 8",
        badge: "ALL IN 🔥",
      },
      {
        value: "most",
        label: "Most days, honestly",
        description: "Life happens, but I'll show up",
        emoji: "💪",
        socialProof: "Flexible streaks keep this realistic",
        badge: "REALISTIC WIN",
      },
      {
        value: "unsure",
        label: "Show me it works first",
        description: "Prove it in week one",
        emoji: "🤔",
        socialProof: "Most sceptics convert after session 3",
        badge: "CHALLENGE ACCEPTED",
      },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
