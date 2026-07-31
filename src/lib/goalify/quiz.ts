import type { QuizAnswers } from "./types";
import type { QuizIconKey } from "@/components/goalify/quiz/quiz-icons";

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
  /** Key into QUIZ_ICONS — replaces raw emoji glyphs with real SVG icons. */
  icon: QuizIconKey;
  /**
   * Social-proof / stat callout rendered under the option.
   *
   * PLACEHOLDER MARKETING COPY — these figures are illustrative, not measured.
   * Replace every one of them with real, substantiated numbers (or delete the
   * field) before showing this funnel to paying customers.
   */
  socialProof?: string;
  /**
   * Cut-out photo for this option, served from /public (see
   * public/quiz/README.md for the exact filenames each option expects).
   * Falls back to an illustrated figure until the photo is dropped in.
   */
  image?: string;
  /** Renders as a understated full-width pill under the main options. */
  aside?: boolean;
};

export type BodyZone = {
  value: string;
  label: string;
};

export type QuizStep =
  | {
      id: keyof QuizAnswers;
      kind: "choice";
      /** `multi` collects an array of values instead of a single one. */
      multi?: boolean;
      /**
       * Card presentation:
       * - `portrait` — two columns, photo bleeding above the card top
       * - `wide` — full-width rows, label left and photo bleeding right
       * - `tile` — two columns, photo inside the card above the label
       * - `list` (default) — compact two-column icon tiles
       */
      layout?: "portrait" | "wide" | "tile" | "list";
      /** Short label shown in the coach's eyebrow above the question. */
      chapter: string;
      title: string;
      subtitle: string;
      options: ChoiceOption[];
      /** Renders as a 5-second "instinct round" with a burning countdown. */
      speedRound?: boolean;
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
    }
  | {
      id: keyof QuizAnswers;
      kind: "bodyMap";
      chapter: string;
      title: string;
      subtitle: string;
      zones: BodyZone[];
    };

/**
 * Ordered as a conversion funnel: the target outcome first, then the
 * obstacle that's blocked it, then the payoff that matters most — and only
 * once that's captured do we ask for the numbers. The final step is an
 * explicit commitment check, so the last thing they do before the plan
 * unlocks is say yes.
 */
export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "goal",
    kind: "choice",
    layout: "wide",
    chapter: "The target",
    title: "Select your 30-day target physique",
    subtitle:
      "Every rep, every calorie in your program is engineered around this one choice. Pick the outcome you actually want.",
    options: [
      {
        value: "burn",
        image: "/quiz/lean.jpg",
        label: "Lean & shredded",
        description: "Strip fat fast while locking in every ounce of muscle",
        icon: "flame",
        socialProof: "41% choose this — the #1 goal on GOALIFY",
      },
      {
        value: "build",
        image: "/quiz/muscle.jpg",
        label: "Bigger & stronger",
        description: "Pack on visible size and raw strength, week over week",
        icon: "dumbbell",
        socialProof: "Fastest strength gains land in weeks 3–6",
      },
      {
        value: "tone",
        image: "/quiz/toned.jpg",
        label: "Toned & defined",
        description: "Sculpted, visible definition — zero bulk",
        icon: "sparkles",
        socialProof: "Most popular first-time goal",
      },
      {
        value: "athletic",
        image: "/quiz/athletic.jpg",
        label: "Athletic & unstoppable",
        description: "Move faster, last longer, hit harder than ever",
        icon: "zap",
        socialProof: "Biggest reported energy jump in week 1",
      },
    ],
  },
  {
    id: "focusZones",
    kind: "bodyMap",
    chapter: "The blueprint",
    title: "Where do you want results first?",
    subtitle:
      "Tap every zone you want transformed. Your program locks in and prioritizes these areas from day one.",
    zones: [
      { value: "chest", label: "Chest" },
      { value: "arms", label: "Arms" },
      { value: "abs", label: "Abs" },
      { value: "glutes", label: "Glutes" },
      { value: "legs", label: "Legs" },
    ],
  },
  {
    id: "painTrigger",
    kind: "choice",
    layout: "wide",
    speedRound: true,
    chapter: "The obstacle",
    title: "What's your biggest obstacle to total confidence?",
    subtitle: "Name it. This is exactly what your plan is engineered to destroy.",
    options: [
      {
        value: "time",
        image: "/quiz/no-time.jpg",
        label: "No time",
        description: "Schedule fills up and training gets cut first",
        icon: "hourglass",
        socialProof: "Solved: 92% finish our 15-minute sessions",
      },
      {
        value: "motivation",
        image: "/quiz/motivation.jpg",
        label: "Fading motivation",
        description: "Strong start, then momentum drops by week three",
        icon: "batteryLow",
        socialProof: "Our streak system keeps members going past week 8",
      },
      {
        value: "confusion",
        image: "/quiz/no-plan.jpg",
        label: "No clear plan",
        description: "Too many conflicting plans and opinions",
        icon: "helpCircle",
        socialProof: "Every session is pre-decided — zero guesswork",
      },
      {
        value: "injury",
        image: "/quiz/injury.jpg",
        label: "Pain or injury",
        description: "Flare-ups cause repeated setbacks",
        icon: "heartPulse",
        socialProof: "Joint-safe swaps built into every single movement",
      },
      {
        value: "restart",
        image: "/quiz/false-starts.jpg",
        label: "Repeated false starts",
        description: "Started many times, never followed through",
        icon: "rotateCcw",
        socialProof: "Engineered to be the last plan you ever start",
      },
    ],
  },
  {
    id: "vision",
    kind: "choice",
    layout: "wide",
    speedRound: true,
    chapter: "The payoff",
    title: "What will finally make you feel unstoppable?",
    subtitle:
      "Picture it 30 days from now. This is what we're building toward — together.",
    options: [
      {
        value: "confident",
        image: "/quiz/vision-confident.png",
        label: "Total confidence",
        description: "Clothes fit better, posture improves",
        icon: "crown",
        socialProof: "#1 reported change at day 30",
      },
      {
        value: "strong",
        image: "/quiz/vision-strong.png",
        label: "Real strength",
        description: "Noticeably stronger and more capable",
        icon: "biceps",
        socialProof: "Strength gains show up before the mirror does",
      },
      {
        value: "energised",
        image: "/quiz/vision-energised.png",
        label: "Nonstop energy",
        description: "No 3pm crash, no dragging yourself around",
        icon: "zap",
        socialProof: "Most members notice this within week 1",
      },
      {
        value: "proud",
        image: "/quiz/vision-proud.png",
        label: "Proof you followed through",
        description: "You said you would — and this time you did",
        icon: "trophy",
        socialProof: "The #1 reason members stay consistent",
      },
    ],
  },
  {
    id: "level",
    kind: "choice",
    layout: "wide",
    chapter: "Your starting line",
    title: "Where are you starting from?",
    subtitle: "Be honest — I'll calibrate your first week to guarantee early wins.",
    options: [
      {
        value: "beginner",
        image: "/quiz/level-beginner.png",
        label: "Beginner",
        description: "New to structured training",
        icon: "sprout",
        socialProof: "Beginners see the fastest visible change",
      },
      {
        value: "returning",
        image: "/quiz/level-returning.png",
        label: "Returning",
        description: "Trained before, took time off",
        icon: "refresh",
        socialProof: "Muscle memory kicks back in within 2 weeks",
      },
      {
        value: "consistent",
        image: "/quiz/level-consistent.png",
        label: "Consistent",
        description: "Training most weeks already",
        icon: "award",
        socialProof: "Ready to move from maintaining to progressing",
      },
      {
        value: "advanced",
        image: "/quiz/level-advanced.png",
        label: "Advanced",
        description: "Years of consistent training",
        icon: "trophy",
        socialProof: "Highest-intensity programming unlocked",
      },
    ],
  },
  {
    id: "joints",
    kind: "choice",
    layout: "list",
    multi: true,
    chapter: "Injury shielding",
    title: "Anything we need to protect?",
    subtitle:
      "Flag it and I'll auto-engineer every movement around it. Zero flare-ups, zero excuses.",
    options: [
      {
        value: "none",
        label: "Nothing hurts",
        description: "Full range of movement available",
        icon: "checkCircle",
        socialProof: "Full-intensity programming unlocked",
      },
      {
        value: "knees",
        label: "Knees",
        description: "Jumps and deep bends auto-substituted",
        icon: "shieldCheck",
        socialProof: "Reported to cut knee discomfort fast",
      },
      {
        value: "back",
        label: "Lower back",
        description: "Spine-neutral variations only",
        icon: "shield",
        socialProof: "Zero-risk movement patterns, guaranteed",
      },
      {
        value: "shoulders",
        label: "Shoulders",
        description: "Overhead loading limited automatically",
        icon: "shieldAlert",
        socialProof: "Built-in protection, every session",
      },
    ],
  },
  {
    id: "sessionLength",
    kind: "choice",
    layout: "list",
    chapter: "Your window",
    title: "How much time can you give me?",
    subtitle:
      "Even 15 minutes, done right, changes everything. I'll make every second count.",
    options: [
      {
        value: "15",
        label: "15 minutes",
        description: "Short, equipment-free, brutally efficient",
        icon: "zap",
        socialProof: "92% completion rate — our highest",
      },
      {
        value: "25",
        label: "25 minutes",
        description: "Balanced and complete",
        icon: "timer",
        socialProof: "The most common choice among members",
      },
      {
        value: "40",
        label: "40 minutes",
        description: "Full sessions with extra finishing work",
        icon: "dumbbell",
        socialProof: "Fastest route to visible definition",
      },
    ],
  },
  {
    id: "daysPerWeek",
    kind: "choice",
    layout: "list",
    chapter: "Your rhythm",
    title: "How many days a week?",
    subtitle: "Pick the pace you'll actually keep — consistency beats intensity every time.",
    options: [
      {
        value: "3",
        label: "3 days",
        description: "Steady, sustainable pace",
        icon: "calendar",
        socialProof: "Enough to change your body",
      },
      {
        value: "4",
        label: "4 days",
        description: "The results-to-effort sweet spot",
        icon: "calendarCheck",
        socialProof: "Best results-to-effort ratio",
      },
      {
        value: "5",
        label: "5 days",
        description: "Faster progress, recovery managed carefully",
        icon: "calendarClock",
        socialProof: "Fastest 30-day transformations",
      },
      {
        value: "6",
        label: "6 days",
        description: "Maximum training volume",
        icon: "calendarDays",
        socialProof: "Recovery managed automatically",
      },
    ],
  },
  {
    id: "sex",
    kind: "choice",
    layout: "portrait",
    chapter: "The science",
    title: "What's your biological sex?",
    subtitle: "This locks in your exact metabolic rate — no generic guesswork.",
    options: [
      { value: "female", label: "Female", icon: "venus" },
      { value: "male", label: "Male", icon: "mars" },
      {
        value: "unspecified",
        label: "Other / I'd rather not say",
        aside: true,
        description: "We'll use an average baseline",
        icon: "helpCircle",
      },
    ],
  },
  {
    id: "age",
    kind: "number",
    chapter: "The science",
    title: "How old are you?",
    subtitle: "Age tunes your recovery windows and how fast I ramp your intensity.",
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
    title: "How tall are you?",
    subtitle: "Feeds straight into the exact calories and protein that build you.",
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
    title: "Your weight today",
    subtitle: "Remember this number. In 4 weeks you'll love how far it's moved.",
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
    title: "Your target weight",
    subtitle: "I'll map the exact, safe route there — and show you the curve.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 70,
  },
  {
    id: "commitment",
    kind: "choice",
    layout: "wide",
    speedRound: true,
    chapter: "The pact",
    title: "Are you ready to commit?",
    subtitle: "If I hold you accountable every single day, will you show up?",
    options: [
      {
        value: "allin",
        image: "/quiz/commitment-allin.png",
        label: "All in, every day",
        description: "Maximum accountability and structure",
        icon: "flame",
        socialProof: "All-in members are most likely to finish week 8",
      },
      {
        value: "most",
        image: "/quiz/commitment-most.png",
        label: "Most days, honestly",
        description: "Consistent, with room to breathe",
        icon: "thumbsUp",
        socialProof: "Flexible streaks keep this realistic",
      },
      {
        value: "unsure",
        image: "/quiz/commitment-unsure.png",
        label: "Show me it works first",
        description: "Wants proof before committing further",
        icon: "helpCircle",
        socialProof: "Most sceptics convert by session 3",
      },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
