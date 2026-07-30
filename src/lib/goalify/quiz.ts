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
    chapter: "The goal",
    title: "What body are you actually after?",
    subtitle: "Not what sounds good. What you genuinely want to see.",
    options: [
      {
        value: "burn",
        label: "Lean and cut",
        description: "Strip the fat, keep every ounce of muscle",
        emoji: "🔥",
        socialProof: "Chosen by 41% of members",
      },
      {
        value: "build",
        label: "Bigger and stronger",
        description: "Real size, real strength, visible power",
        emoji: "💪",
        socialProof: "Fastest strength gains in weeks 3–6",
      },
      {
        value: "tone",
        label: "Toned and defined",
        description: "Sculpted definition without the bulk",
        emoji: "✨",
        socialProof: "Most popular first-time goal",
      },
      {
        value: "athletic",
        label: "Athletic and unstoppable",
        description: "Move faster, last longer, hit harder",
        emoji: "⚡",
        socialProof: "Biggest reported energy jump",
      },
    ],
  },
  {
    id: "painTrigger",
    kind: "choice",
    chapter: "The blocker",
    title: "What's been holding you back from your dream body?",
    subtitle: "Be brutally honest. I build your plan around this answer.",
    options: [
      {
        value: "time",
        label: "I never have the time",
        description: "Life fills up and training is the first thing cut",
        emoji: "⌛",
        socialProof: "Solved with 15-minute finishable sessions",
      },
      {
        value: "motivation",
        label: "My motivation dies",
        description: "Strong start, then week three hits",
        emoji: "📉",
        socialProof: "Streak system keeps members going past week 8",
      },
      {
        value: "confusion",
        label: "I never know what to do",
        description: "Too many plans, too much conflicting advice",
        emoji: "🤯",
        socialProof: "Every session is decided for you",
      },
      {
        value: "injury",
        label: "Pain keeps stopping me",
        description: "Something always flares up and I lose weeks",
        emoji: "🩹",
        socialProof: "Joint-safe swaps built into every movement",
      },
      {
        value: "restart",
        label: "I keep starting over",
        description: "I've begun a dozen times and never finished one",
        emoji: "🔁",
        socialProof: "Built to be the last plan you start",
      },
    ],
  },
  {
    id: "vision",
    kind: "choice",
    chapter: "The vision",
    title: "30 days from now, you look in the mirror. What do you feel?",
    subtitle: "Close your eyes for a second. This is what we're building toward.",
    options: [
      {
        value: "confident",
        label: "Completely confident",
        description: "Clothes fit right and I stand taller",
        emoji: "🔥",
        socialProof: "The #1 reported change at day 30",
      },
      {
        value: "strong",
        label: "Genuinely strong",
        description: "Powerful, capable, hard to break",
        emoji: "🦾",
        socialProof: "Strength shows up before the mirror does",
      },
      {
        value: "energised",
        label: "Full of energy",
        description: "No 3pm crash, no dragging myself around",
        emoji: "⚡",
        socialProof: "Most members notice this in week 1",
      },
      {
        value: "proud",
        label: "Proud I finally did it",
        description: "I said I would, and this time I did",
        emoji: "🏆",
        socialProof: "The feeling that keeps members training",
      },
    ],
  },
  {
    id: "level",
    kind: "choice",
    chapter: "The starting line",
    title: "Where are you starting from — honestly?",
    subtitle: "No judgement here. This sets your day-one intensity.",
    options: [
      {
        value: "beginner",
        label: "Total beginner",
        description: "New to real, structured training",
        emoji: "🌱",
        socialProof: "Beginners see the fastest visible change",
      },
      {
        value: "returning",
        label: "Coming back after a break",
        description: "I trained before. Then life happened.",
        emoji: "🔄",
        socialProof: "Muscle memory kicks in within 2 weeks",
      },
      {
        value: "consistent",
        label: "Training fairly consistently",
        description: "I show up most weeks already",
        emoji: "📈",
        socialProof: "Time to stop maintaining and start progressing",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Years in. Chasing the next level.",
        emoji: "🏆",
        socialProof: "Highest-intensity programming unlocked",
      },
    ],
  },
  {
    id: "joints",
    kind: "choice",
    multi: true,
    chapter: "Your safety",
    title: "Anything I need to protect?",
    subtitle:
      "I rebuild every single movement around this. Pick all that apply — or none.",
    options: [
      {
        value: "none",
        label: "Nothing hurts",
        description: "Full range of movement available",
        emoji: "✅",
      },
      {
        value: "knees",
        label: "My knees",
        description: "Auto-swaps every jump and deep bend",
        emoji: "🦵",
        socialProof: "Knee-safe mode keeps members training pain-free",
      },
      {
        value: "back",
        label: "My lower back",
        description: "Spine-neutral variations only",
        emoji: "🧘",
      },
      {
        value: "shoulders",
        label: "My shoulders",
        description: "No reckless overhead loading",
        emoji: "🫱",
      },
    ],
  },
  {
    id: "sessionLength",
    kind: "choice",
    chapter: "Your time",
    title: "How long can you realistically give me?",
    subtitle: "Every plan is built to finish in the time you actually have.",
    options: [
      {
        value: "15",
        label: "15 minutes",
        description: "Express, no equipment, no excuses",
        emoji: "⚡",
        socialProof: "Highest completion rate of any session length",
      },
      {
        value: "25",
        label: "25 minutes",
        description: "Balanced and complete",
        emoji: "⏱️",
        socialProof: "The sweet spot most members settle on",
      },
      {
        value: "40",
        label: "40 minutes",
        description: "Full session with finishers",
        emoji: "🏋️",
        socialProof: "Fastest route to visible definition",
      },
    ],
  },
  {
    id: "daysPerWeek",
    kind: "choice",
    chapter: "Your rhythm",
    title: "How many days a week will you show up?",
    subtitle: "Consistency beats intensity. Pick what you'll actually hit.",
    options: [
      {
        value: "3",
        label: "3 days",
        description: "Steady and genuinely sustainable",
        emoji: "🗓️",
        socialProof: "Enough to change your body",
      },
      {
        value: "4",
        label: "4 days",
        description: "The sweet spot",
        emoji: "🎯",
        socialProof: "Best results-to-effort ratio",
      },
      {
        value: "5",
        label: "5 days",
        description: "Fast-track results",
        emoji: "🚀",
        socialProof: "Fastest 30-day transformations",
      },
      {
        value: "6",
        label: "6 days",
        description: "All in",
        emoji: "🔥",
        socialProof: "Recovery managed automatically",
      },
    ],
  },
  {
    id: "sex",
    kind: "choice",
    chapter: "The maths",
    title: "Biological sex",
    subtitle: "Used only to calculate your metabolic baseline accurately.",
    options: [
      { value: "female", label: "Female", emoji: "♀️" },
      { value: "male", label: "Male", emoji: "♂️" },
      {
        value: "unspecified",
        label: "Prefer not to say",
        description: "We'll use an average baseline",
        emoji: "•",
      },
    ],
  },
  {
    id: "age",
    kind: "number",
    chapter: "The maths",
    title: "How old are you?",
    subtitle: "Recovery windows and intensity ramps scale with age.",
    unit: "years",
    min: 16,
    max: 80,
    step: 1,
    defaultValue: 30,
  },
  {
    id: "heightCm",
    kind: "number",
    chapter: "The maths",
    title: "Your height",
    subtitle: "Feeds directly into your calorie and protein targets.",
    unit: "cm",
    min: 140,
    max: 215,
    step: 1,
    defaultValue: 175,
  },
  {
    id: "weightKg",
    kind: "number",
    chapter: "The starting line",
    title: "Where are you starting today?",
    subtitle: "This is the number we're about to change. Write it down.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 78,
  },
  {
    id: "targetWeightKg",
    kind: "number",
    chapter: "The target",
    title: "Where do you want to be?",
    subtitle: "I'll map a realistic, safe route there — and show you the curve.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 70,
  },
  {
    id: "commitment",
    kind: "choice",
    chapter: "The deal",
    title: "Last question. Are you in?",
    subtitle:
      "If I hold you accountable every single day, will you give me your session?",
    options: [
      {
        value: "allin",
        label: "I'm all in. Let's go.",
        description: "Hold me to it. Every day.",
        emoji: "🔥",
        socialProof: "All-in members are the most likely to finish week 8",
      },
      {
        value: "most",
        label: "Most days, honestly",
        description: "Life happens, but I'll show up",
        emoji: "💪",
        socialProof: "Flexible streaks keep this realistic",
      },
      {
        value: "unsure",
        label: "Show me it works first",
        description: "Prove it in week one",
        emoji: "🤔",
        socialProof: "Most sceptics convert after session 3",
      },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
