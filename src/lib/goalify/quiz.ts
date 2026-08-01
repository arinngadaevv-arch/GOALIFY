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

export type QuizStep = {
  /**
   * Always a real QuizAnswers key, even for "commit" steps (which just
   * write a fixed value) and "vitals" (which writes several fields at
   * once but anchors HUD/meta lookups on one of them) — nothing here is
   * a synthetic id, so every step stays indexable the same way.
   */
  id: keyof QuizAnswers;
  /** Short label shown in the coach's eyebrow above the question. */
  chapter: string;
  title: string;
  subtitle: string;
  /** The rotating "diagnostic" line rendered above the headline. */
  hudPhrase: string;
} & (
  | {
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
      options: ChoiceOption[];
      /** Renders as a 5-second "instinct round" with a burning countdown. */
      speedRound?: boolean;
    }
  | {
      kind: "bodyMap";
      zones: BodyZone[];
    }
  | {
      kind: "vitals";
    }
  | {
      /**
       * A single-button "yes-set" commitment card — pure rhetorical
       * agreement, no real choice. Answering always writes the same
       * value; the point is the felt "yes", not the data.
       */
      kind: "commit";
      buttonLabel: string;
    }
);

/**
 * A short, high-energy "yes-ladder": the target outcome first, an
 * immediate emotional commitment, the obstacle that's blocked them, the
 * interactive blueprint, a fast benchmark, then only the numbers that are
 * actually load-bearing for the plan — closing on a second, bigger yes
 * right before the plan unlocks. Every question either sells the outcome
 * or captures something the calorie/macro engine truly needs; nothing
 * "dry" survives just to feel thorough.
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
    hudPhrase: "CALIBRATING PHYSIQUE MATCH...",
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
        image: "/quiz/goal-build.png",
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
    // Reuses the "joints" slot — full injury customization got cut from the
    // funnel (it defaults to "no restrictions"), but the field still exists
    // on QuizAnswers, so this yes-set card anchors here instead of needing
    // a synthetic id.
    id: "joints",
    kind: "commit",
    chapter: "The commitment",
    title: "Do you want to wake up 30 days from now and actually love the mirror?",
    subtitle:
      "Total pride. Real energy. No more talking yourself out of it. Say it with me.",
    hudPhrase: "LOCKING MENTAL COMMITMENT...",
    buttonLabel: "YES! I'M READY 🔥",
  },
  {
    id: "painTrigger",
    kind: "choice",
    layout: "wide",
    speedRound: true,
    chapter: "The obstacle",
    title: "What's your biggest obstacle to total confidence?",
    subtitle: "Name it. This is exactly what your plan is engineered to destroy.",
    hudPhrase: "SCANNING FOR WEAK POINTS...",
    options: [
      {
        value: "time",
        image: "/quiz/no-time.png",
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
        image: "/quiz/no-plan.png",
        label: "No clear plan",
        description: "Too many conflicting plans and opinions",
        icon: "helpCircle",
        socialProof: "Every session is pre-decided — zero guesswork",
      },
      {
        value: "injury",
        image: "/quiz/injury.png",
        label: "Pain or injury",
        description: "Flare-ups cause repeated setbacks",
        icon: "heartPulse",
        socialProof: "Joint-safe swaps built into every single movement",
      },
      {
        value: "restart",
        image: "/quiz/false-starts.png",
        label: "Repeated false starts",
        description: "Started many times, never followed through",
        icon: "rotateCcw",
        socialProof: "Engineered to be the last plan you ever start",
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
    hudPhrase: "MAPPING TARGET ZONES...",
    zones: [
      { value: "chest", label: "Chest" },
      { value: "arms", label: "Arms" },
      { value: "abs", label: "Abs" },
      { value: "glutes", label: "Glutes" },
      { value: "legs", label: "Legs" },
    ],
  },
  {
    id: "level",
    kind: "choice",
    layout: "tile",
    chapter: "The benchmark",
    title: "Where are you starting from?",
    subtitle: "Be honest — I'll calibrate your first week to guarantee early wins.",
    hudPhrase: "BENCHMARKING TRAINING LEVEL...",
    options: [
      {
        value: "beginner",
        image: "/quiz/level-beginner.png",
        label: "Beginner",
        description: "New to structured training",
        icon: "sprout",
        socialProof: "Fastest visible change",
      },
      {
        value: "returning",
        image: "/quiz/level-returning.png",
        label: "Returning",
        description: "Trained before, took time off",
        icon: "refresh",
        socialProof: "Back in 2 weeks",
      },
      {
        value: "consistent",
        image: "/quiz/level-consistent.png",
        label: "Consistent",
        description: "Training most weeks already",
        icon: "award",
        socialProof: "Ready to progress",
      },
      {
        value: "advanced",
        image: "/quiz/level-advanced.png",
        label: "Advanced",
        description: "Years of consistent training",
        icon: "trophy",
        socialProof: "Elite programming",
      },
    ],
  },
  {
    // Anchors the merged days/session-length "power choice" — one 2x2 grid
    // instead of two separate screens, each option writing both fields at
    // once (see quiz-flow.tsx's TIME_COMBOS handling).
    id: "sessionLength",
    kind: "choice",
    layout: "tile",
    chapter: "The rhythm",
    title: "How much time can you give me?",
    subtitle: "Pick the pace you'll actually keep. I'll make every minute count.",
    hudPhrase: "SYNCING TRAINING FREQUENCY...",
    options: [
      {
        value: "3-15",
        label: "3 days · 15 min",
        description: "Short, brutally efficient",
        icon: "hourglass",
        socialProof: "92% completion rate",
      },
      {
        value: "4-25",
        label: "4 days · 25 min",
        description: "The results-to-effort sweet spot",
        icon: "calendarCheck",
        socialProof: "Most popular pick",
      },
      {
        value: "5-25",
        label: "5 days · 25 min",
        description: "Faster progress, recovery managed",
        icon: "calendarClock",
        socialProof: "Fastest transformations",
      },
      {
        value: "6-40",
        label: "6 days · 40 min",
        description: "Maximum training volume",
        icon: "calendarDays",
        socialProof: "For the all-in athlete",
      },
    ],
  },
  {
    // Anchors the merged vitals screen (sex + age + height + weight +
    // target weight) — one dense, slider-driven step instead of five.
    id: "weightKg",
    kind: "vitals",
    chapter: "The science",
    title: "Lock in your numbers",
    subtitle: "This is what turns a generic plan into your exact calories and macros.",
    hudPhrase: "CALCULATING METABOLIC BASELINE...",
  },
  {
    id: "commitment",
    kind: "commit",
    chapter: "The pact",
    title: "Are you ready to stop making excuses and follow a plan built just for you?",
    subtitle: "Say yes, and I'll build it right now — no more thinking about it.",
    hudPhrase: "UNLOCKING CUSTOM ROADMAP...",
    buttonLabel: "ABSOLUTELY, LET'S DO THIS ⚡",
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
