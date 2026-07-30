import type { QuizAnswers } from "./types";
import type { QuizIconKey } from "@/components/goalify/quiz/quiz-icons";

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
  /** Key into QUIZ_ICONS — replaces raw emoji glyphs with real SVG icons. */
  icon: QuizIconKey;
  /**
   * Social-proof line rendered under the option.
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
       * - `list` (default) — compact icon rows
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
 * Ordered as a funnel: goal first, then what's blocked it before, then the
 * outcome that matters most — and only once that's captured do we ask for
 * the numbers. The final step is an explicit commitment check.
 */
export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "goal",
    kind: "choice",
    layout: "wide",
    chapter: "Goal",
    title: "What's your primary goal?",
    subtitle:
      "This sets the direction for your entire program — exercise selection, volume, and calorie targets.",
    options: [
      {
        value: "burn",
        image: "/quiz/goal-burn.png",
        label: "Lean and cut",
        description: "Reduce body fat while preserving muscle",
        icon: "flame",
        socialProof: "Chosen by 41% of members",
      },
      {
        value: "build",
        image: "/quiz/goal-build.png",
        label: "Bigger and stronger",
        description: "Build noticeable size and strength",
        icon: "dumbbell",
        socialProof: "Fastest strength gains in weeks 3–6",
      },
      {
        value: "tone",
        image: "/quiz/goal-tone.png",
        label: "Toned and defined",
        description: "Visible definition without added bulk",
        icon: "sparkles",
        socialProof: "Most popular first-time goal",
      },
      {
        value: "athletic",
        image: "/quiz/goal-athletic.png",
        label: "Athletic performance",
        description: "Improve speed, endurance, and power",
        icon: "zap",
        socialProof: "Biggest reported energy increase",
      },
    ],
  },
  {
    id: "focusZones",
    kind: "bodyMap",
    chapter: "Body focus",
    title: "Select your body targets",
    subtitle:
      "Tap the areas you want to prioritize. Your program will emphasize these first.",
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
    layout: "tile",
    speedRound: true,
    chapter: "Obstacles",
    title: "What's held you back before?",
    subtitle:
      "This shapes how your program handles the thing that's derailed you in the past.",
    options: [
      {
        value: "time",
        image: "/quiz/painTrigger-time.png",
        label: "Not enough time",
        description: "Schedule fills up and training gets cut first",
        icon: "hourglass",
        socialProof: "Addressed with short, finishable sessions",
      },
      {
        value: "motivation",
        image: "/quiz/painTrigger-motivation.png",
        label: "Motivation fades",
        description: "Strong start, then momentum drops by week three",
        icon: "batteryLow",
        socialProof: "A streak system helps members stay consistent past week 8",
      },
      {
        value: "confusion",
        image: "/quiz/painTrigger-confusion.png",
        label: "Unclear what to do",
        description: "Too many conflicting plans and opinions",
        icon: "helpCircle",
        socialProof: "Every session is pre-decided for you",
      },
      {
        value: "injury",
        image: "/quiz/painTrigger-injury.png",
        label: "Pain or injury",
        description: "Flare-ups cause repeated setbacks",
        icon: "heartPulse",
        socialProof: "Joint-safe swaps built into every movement",
      },
      {
        value: "restart",
        image: "/quiz/painTrigger-restart.png",
        label: "Repeated false starts",
        description: "Started many times, never followed through",
        icon: "rotateCcw",
        socialProof: "Designed for long-term follow-through",
      },
    ],
  },
  {
    id: "vision",
    kind: "choice",
    layout: "tile",
    speedRound: true,
    chapter: "Outcome",
    title: "What result matters most?",
    subtitle: "This helps prioritize what your program optimizes for first.",
    options: [
      {
        value: "confident",
        image: "/quiz/vision-confident.png",
        label: "Confidence",
        description: "Clothes fit better, posture improves",
        icon: "crown",
        socialProof: "Most commonly reported change at day 30",
      },
      {
        value: "strong",
        image: "/quiz/vision-strong.png",
        label: "Strength",
        description: "Noticeably stronger and more capable",
        icon: "biceps",
        socialProof: "Strength gains typically show before visual change",
      },
      {
        value: "energised",
        image: "/quiz/vision-energised.png",
        label: "Energy",
        description: "Fewer energy crashes throughout the day",
        icon: "zap",
        socialProof: "Most members notice this within week 1",
      },
      {
        value: "proud",
        image: "/quiz/vision-proud.png",
        label: "Follow-through",
        description: "Completing what you set out to do",
        icon: "trophy",
        socialProof: "Reported as the top reason members stay consistent",
      },
    ],
  },
  {
    id: "level",
    kind: "choice",
    layout: "wide",
    chapter: "Experience",
    title: "What's your training experience?",
    subtitle: "This calibrates your starting intensity and how quickly it progresses.",
    options: [
      {
        value: "beginner",
        image: "/quiz/level-beginner.png",
        label: "Beginner",
        description: "New to structured training",
        icon: "sprout",
        socialProof: "Beginners typically see the fastest visible change",
      },
      {
        value: "returning",
        image: "/quiz/level-returning.png",
        label: "Returning",
        description: "Trained previously, took time off",
        icon: "refresh",
        socialProof: "Muscle memory typically returns within 2 weeks",
      },
      {
        value: "consistent",
        image: "/quiz/level-consistent.png",
        label: "Consistent",
        description: "Training most weeks already",
        icon: "award",
        socialProof: "Ready to move from maintenance to progression",
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
    chapter: "Safety",
    title: "Injury & Joint History",
    subtitle:
      "Exercises are automatically adjusted around any areas you select. Choose all that apply.",
    options: [
      {
        value: "none",
        label: "Nothing hurts",
        description: "Full range of movement available",
        icon: "checkCircle",
      },
      {
        value: "knees",
        label: "Knees",
        description: "Jumps and deep bends are automatically substituted",
        icon: "shieldCheck",
        socialProof: "Reported to reduce knee discomfort during training",
      },
      {
        value: "back",
        label: "Lower back",
        description: "Spine-neutral variations only",
        icon: "shield",
      },
      {
        value: "shoulders",
        label: "Shoulders",
        description: "Overhead loading is limited",
        icon: "shieldAlert",
      },
    ],
  },
  {
    id: "sessionLength",
    kind: "choice",
    layout: "list",
    chapter: "Session length",
    title: "Preferred session length",
    subtitle: "Sessions are built to fit fully within this window.",
    options: [
      {
        value: "15",
        label: "15 minutes",
        description: "Short, equipment-free sessions",
        icon: "zap",
        socialProof: "Highest completion rate of any session length",
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
        description: "Full sessions with additional finishing work",
        icon: "dumbbell",
        socialProof: "Fastest route to visible definition",
      },
    ],
  },
  {
    id: "daysPerWeek",
    kind: "choice",
    layout: "list",
    chapter: "Training frequency",
    title: "Training days per week",
    subtitle: "Choose a frequency you can realistically sustain.",
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
        description: "The most common balance of results and effort",
        icon: "calendarCheck",
        socialProof: "Best results-to-effort ratio",
      },
      {
        value: "5",
        label: "5 days",
        description: "Faster progress with recovery managed carefully",
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
    chapter: "Biometrics",
    title: "Biological sex",
    subtitle: "Used to calculate your metabolic rate accurately.",
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
    chapter: "Biometrics",
    title: "Your age",
    subtitle: "Used to calculate recovery time and intensity progression.",
    unit: "years",
    min: 16,
    max: 80,
    step: 1,
    defaultValue: 30,
  },
  {
    id: "heightCm",
    kind: "number",
    chapter: "Biometrics",
    title: "Your height",
    subtitle: "Used to calculate your calorie and protein targets.",
    unit: "cm",
    min: 140,
    max: 215,
    step: 1,
    defaultValue: 175,
  },
  {
    id: "weightKg",
    kind: "number",
    chapter: "Starting point",
    title: "Current weight",
    subtitle: "Your baseline for tracking progress over time.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 78,
  },
  {
    id: "targetWeightKg",
    kind: "number",
    chapter: "Target",
    title: "Target weight",
    subtitle: "We'll map a safe, realistic path to this number.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 70,
  },
  {
    id: "commitment",
    kind: "choice",
    layout: "tile",
    speedRound: true,
    chapter: "Commitment",
    title: "Training commitment",
    subtitle: "This calibrates how your program handles accountability and flexibility.",
    options: [
      {
        value: "allin",
        image: "/quiz/commitment-allin.png",
        label: "All in, every day",
        description: "Maximum accountability and structure",
        icon: "flame",
        socialProof: "All-in members are the most likely to finish week 8",
      },
      {
        value: "most",
        image: "/quiz/commitment-most.png",
        label: "Most days, honestly",
        description: "Consistent with some flexibility",
        icon: "thumbsUp",
        socialProof: "Flexible streaks keep this realistic",
      },
      {
        value: "unsure",
        image: "/quiz/commitment-unsure.png",
        label: "Show me it works first",
        description: "Wants to see results before committing further",
        icon: "helpCircle",
        socialProof: "Most sceptics convert after session 3",
      },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
