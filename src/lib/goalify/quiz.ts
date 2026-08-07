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
      /** Full-bleed athletic photo behind the commitment moment. */
      bgPhoto: string;
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
    title: "Pick your dream physique",
    subtitle: "Every rep and calorie in your plan builds toward this.",
    hudPhrase: "PHYSICAL TARGET DIAGNOSIS",
    options: [
      {
        value: "burn",
        image: "/quiz/goal-burn.png",
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
        image: "/quiz/goal-tone.png",
        label: "Toned & defined",
        description: "Sculpted, visible definition — zero bulk",
        icon: "sparkles",
        socialProof: "Most popular first-time goal",
      },
      {
        value: "athletic",
        image: "/quiz/goal-athletic.png",
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
    title: "Ready to love the mirror in 30 days?",
    subtitle: "Total pride. Real energy. No more excuses.",
    hudPhrase: "COMMITMENT VERIFICATION",
    buttonLabel: "YES! I'M READY 🔥",
    bgPhoto: "/quiz/commit-workout-complete.png",
  },
  {
    id: "painTrigger",
    kind: "choice",
    layout: "wide",
    speedRound: true,
    chapter: "The obstacle",
    title: "What's really holding you back?",
    subtitle: "Name it — your plan is built to destroy it.",
    hudPhrase: "PERFORMANCE BARRIER ASSESSMENT",
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
    title: "Where do you carry the most fat?",
    subtitle: "Tap every zone you want transformed.",
    hudPhrase: "PRIORITY ZONE MAPPING",
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
    subtitle: "Be honest — I'll calibrate week one around it.",
    hudPhrase: "TRAINING BASELINE ASSESSMENT",
    options: [
      {
        value: "beginner",
        label: "Beginner",
        description: "New to structured training",
        icon: "sprout",
        socialProof: "Fastest visible results",
      },
      {
        value: "returning",
        label: "Returning",
        description: "Trained before, took time off",
        icon: "refresh",
        socialProof: "Rebuild the monster",
      },
      {
        value: "consistent",
        label: "Consistent",
        description: "Training most weeks already",
        icon: "award",
        socialProof: "Unlock the next level",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Years of consistent training",
        icon: "trophy",
        socialProof: "Peak performance protocol",
      },
    ],
  },
  {
    id: "bodyFatPercent",
    kind: "choice",
    layout: "tile",
    chapter: "The starting point",
    title: "Estimate your current body fat %",
    subtitle: "Pick the closest match — it tunes your calories from day one.",
    hudPhrase: "BODY COMPOSITION ESTIMATE",
    options: [
      {
        value: "daniel",
        image: "/quiz/bodyfat-daniel.png",
        label: "30%+",
        description: "High Body Fat / Full Transformation",
        icon: "shield",
      },
      {
        value: "ethan",
        image: "/quiz/bodyfat-ethan.png",
        label: "22–29%",
        description: "Soft / Moderate Fat",
        icon: "gauge",
      },
      {
        value: "liam",
        image: "/quiz/bodyfat-liam.png",
        label: "15–21%",
        description: "Average / Building Phase",
        icon: "biceps",
      },
      {
        value: "noah",
        image: "/quiz/bodyfat-noah.png",
        label: "11–14%",
        description: "Lean / Athletic",
        icon: "flame",
      },
      {
        value: "mason",
        image: "/quiz/bodyfat-mason.png",
        label: "8–10%",
        description: "Cut / Visible Abs",
        icon: "trophy",
      },
      {
        value: "jayden",
        image: "/quiz/bodyfat-jayden.png",
        label: "5–7%",
        description: "Shredded / Peak Stage",
        icon: "crown",
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
    subtitle: "Turns a generic plan into your exact numbers.",
    hudPhrase: "CALIBRATING METABOLIC POTENTIAL",
  },
  {
    id: "commitment",
    kind: "commit",
    chapter: "The pact",
    title: "Ready to stop making excuses?",
    subtitle: "Say yes and I'll build it right now.",
    hudPhrase: "PROGRAM AUTHORIZATION",
    buttonLabel: "ABSOLUTELY, LET'S DO THIS ⚡",
    bgPhoto: "/quiz/commit-workout-complete.png",
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
