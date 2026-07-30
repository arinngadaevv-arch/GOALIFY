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
  /** Motivational badge that snaps in the instant this option is chosen. */
  badge?: string;
  /**
   * Cut-out photo for this option, served from /public (see
   * public/quiz/README.md for the exact filenames each option expects).
   * Falls back to an illustrated figure until the photo is dropped in.
   */
  image?: string;
  /** Renders as a understated full-width pill under the main options. */
  aside?: boolean;
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
    layout: "wide",
    chapter: "The dream",
    title: "What's your dream body?",
    subtitle:
      "The #1 transformation you want to unlock before everyone else notices. Not what sounds reasonable — the version of you that turns heads.",
    options: [
      {
        value: "burn",
        image: "/quiz/goal-burn.png",
        label: "Lean and cut",
        description: "Strip the fat, keep every ounce of muscle",
        icon: "flame",
        socialProof: "Chosen by 41% of members",
        badge: "SHREDDED MODE",
      },
      {
        value: "build",
        image: "/quiz/goal-build.png",
        label: "Bigger and stronger",
        description: "Real size, real strength, visible power",
        icon: "dumbbell",
        socialProof: "Fastest strength gains in weeks 3–6",
        badge: "MASS MODE",
      },
      {
        value: "tone",
        image: "/quiz/goal-tone.png",
        label: "Toned and defined",
        description: "Sculpted definition without the bulk",
        icon: "sparkles",
        socialProof: "Most popular first-time goal",
        badge: "SCULPT MODE",
      },
      {
        value: "athletic",
        image: "/quiz/goal-athletic.png",
        label: "Athletic and unstoppable",
        description: "Move faster, last longer, hit harder",
        icon: "zap",
        socialProof: "Biggest reported energy jump",
        badge: "ATHLETE MODE",
      },
    ],
  },
  {
    id: "painTrigger",
    kind: "choice",
    layout: "tile",
    chapter: "The block",
    title: "What's been stopping you?",
    subtitle:
      "Name it and I'll engineer it out. This is the answer your whole plan is built around.",
    options: [
      {
        value: "time",
        image: "/quiz/painTrigger-time.png",
        label: "I never have the time",
        description: "Life fills up and training is the first thing cut",
        icon: "hourglass",
        socialProof: "Solved with 15-minute finishable sessions",
        badge: "TIME UNLOCKED",
      },
      {
        value: "motivation",
        image: "/quiz/painTrigger-motivation.png",
        label: "My motivation dies",
        description: "Strong start, then week three hits",
        icon: "batteryLow",
        socialProof: "Streak system keeps members going past week 8",
        badge: "STREAK ARMED",
      },
      {
        value: "confusion",
        image: "/quiz/painTrigger-confusion.png",
        label: "I never know what to do",
        description: "Too many plans, too much conflicting advice",
        icon: "helpCircle",
        socialProof: "Every session is decided for you",
        badge: "CLARITY LOCKED",
      },
      {
        value: "injury",
        image: "/quiz/painTrigger-injury.png",
        label: "Pain keeps stopping me",
        description: "Something always flares up and I lose weeks",
        icon: "heartPulse",
        socialProof: "Joint-safe swaps built into every movement",
        badge: "SHIELD UP",
      },
      {
        value: "restart",
        image: "/quiz/painTrigger-restart.png",
        label: "I keep starting over",
        description: "I've begun a dozen times and never finished one",
        icon: "rotateCcw",
        socialProof: "Built to be the last plan you start",
        badge: "FINAL RESTART",
      },
    ],
  },
  {
    id: "vision",
    kind: "choice",
    layout: "tile",
    chapter: "The vision",
    title: "How do you want to feel?",
    subtitle:
      "Picture the mirror 30 days from now, looking at your dream body. Sit with that feeling — it's the whole reason we're here.",
    options: [
      {
        value: "confident",
        image: "/quiz/vision-confident.png",
        label: "Completely confident",
        description: "Clothes fit right and I stand taller",
        icon: "crown",
        socialProof: "The #1 reported change at day 30",
        badge: "CONFIDENCE TARGET",
      },
      {
        value: "strong",
        image: "/quiz/vision-strong.png",
        label: "Genuinely strong",
        description: "Powerful, capable, hard to break",
        icon: "biceps",
        socialProof: "Strength shows up before the mirror does",
        badge: "POWER TARGET",
      },
      {
        value: "energised",
        image: "/quiz/vision-energised.png",
        label: "Full of energy",
        description: "No 3pm crash, no dragging myself around",
        icon: "zap",
        socialProof: "Most members notice this in week 1",
        badge: "ENERGY TARGET",
      },
      {
        value: "proud",
        image: "/quiz/vision-proud.png",
        label: "Proud I finally did it",
        description: "I said I would, and this time I did",
        icon: "trophy",
        socialProof: "The feeling that keeps members training",
        badge: "PRIDE TARGET",
      },
    ],
  },
  {
    id: "level",
    kind: "choice",
    layout: "wide",
    chapter: "The launch point",
    title: "Where do you start?",
    subtitle:
      "Every great before-photo starts somewhere. Be honest and I'll pitch your first week perfectly.",
    options: [
      {
        value: "beginner",
        image: "/quiz/level-beginner.png",
        label: "Total beginner",
        description: "New to real, structured training",
        icon: "sprout",
        socialProof: "Beginners see the fastest visible change",
        badge: "FRESH START",
      },
      {
        value: "returning",
        image: "/quiz/level-returning.png",
        label: "Coming back after a break",
        description: "I trained before. Then life happened.",
        icon: "refresh",
        socialProof: "Muscle memory kicks in within 2 weeks",
        badge: "COMEBACK ARC",
      },
      {
        value: "consistent",
        image: "/quiz/level-consistent.png",
        label: "Training fairly consistently",
        description: "I show up most weeks already",
        icon: "award",
        socialProof: "Time to stop maintaining and start progressing",
        badge: "MOMENTUM MODE",
      },
      {
        value: "advanced",
        image: "/quiz/level-advanced.png",
        label: "Advanced",
        description: "Years in. Chasing the next level.",
        icon: "trophy",
        socialProof: "Highest-intensity programming unlocked",
        badge: "ELITE TIER",
      },
    ],
  },
  {
    id: "joints",
    kind: "choice",
    layout: "list",
    multi: true,
    chapter: "Your armour",
    title: "Anything to protect?",
    subtitle:
      "I rebuild every single movement around this. Pick all that apply — or none.",
    options: [
      {
        value: "none",
        label: "Nothing hurts",
        description: "Full range of movement available",
        icon: "checkCircle",
        badge: "FULL RANGE",
      },
      {
        value: "knees",
        label: "My knees",
        description: "Auto-swaps every jump and deep bend",
        icon: "shieldCheck",
        socialProof: "Knee-safe mode keeps members training pain-free",
        badge: "KNEES GUARDED",
      },
      {
        value: "back",
        label: "My lower back",
        description: "Spine-neutral variations only",
        icon: "shield",
        badge: "SPINE GUARDED",
      },
      {
        value: "shoulders",
        label: "My shoulders",
        description: "No reckless overhead loading",
        icon: "shieldAlert",
        badge: "SHOULDERS GUARDED",
      },
    ],
  },
  {
    id: "sessionLength",
    kind: "choice",
    layout: "list",
    chapter: "Your window",
    title: "How much time?",
    subtitle:
      "This is your hour of power — even if it's fifteen minutes. I'll make every second count.",
    options: [
      {
        value: "15",
        label: "15 minutes",
        description: "Express, no equipment, no excuses",
        icon: "zap",
        socialProof: "Highest completion rate of any session length",
        badge: "EXPRESS POWER",
      },
      {
        value: "25",
        label: "25 minutes",
        description: "Balanced and complete",
        icon: "timer",
        socialProof: "The sweet spot most members settle on",
        badge: "SWEET SPOT",
      },
      {
        value: "40",
        label: "40 minutes",
        description: "Full session with finishers",
        icon: "dumbbell",
        socialProof: "Fastest route to visible definition",
        badge: "FULL SEND",
      },
    ],
  },
  {
    id: "daysPerWeek",
    kind: "choice",
    layout: "list",
    chapter: "Your rhythm",
    title: "How often?",
    subtitle:
      "Every session is a deposit into the body you want. Pick the pace you'll genuinely keep.",
    options: [
      {
        value: "3",
        label: "3 days",
        description: "Steady and genuinely sustainable",
        icon: "calendar",
        socialProof: "Enough to change your body",
        badge: "STEADY CLIMB",
      },
      {
        value: "4",
        label: "4 days",
        description: "The sweet spot",
        icon: "calendarCheck",
        socialProof: "Best results-to-effort ratio",
        badge: "OPTIMAL PACE",
      },
      {
        value: "5",
        label: "5 days",
        description: "Fast-track results",
        icon: "calendarClock",
        socialProof: "Fastest 30-day transformations",
        badge: "FAST TRACK",
      },
      {
        value: "6",
        label: "6 days",
        description: "All in",
        icon: "calendarDays",
        socialProof: "Recovery managed automatically",
        badge: "MAXIMUM DRIVE",
      },
    ],
  },
  {
    id: "sex",
    kind: "choice",
    layout: "portrait",
    chapter: "The science",
    title: "What's your gender?",
    subtitle:
      "This helps me tailor your plan to match your metabolic rate perfectly.",
    options: [
      { value: "female", label: "Female", icon: "venus" },
      { value: "male", label: "Male", icon: "mars" },
      {
        value: "unspecified",
        label: "Other / I'd rather not say",
        aside: true,
        description: "We'll use an average baseline",
        icon: "helpCircle",
        badge: "ENGINE TUNED",
      },
    ],
  },
  {
    id: "age",
    kind: "number",
    chapter: "The science",
    title: "How old are you?",
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
    title: "How tall are you?",
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
    title: "Your weight today",
    subtitle:
      "Burn this number into your memory. In four weeks you'll love how far it moved.",
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
    layout: "tile",
    chapter: "The pact",
    title: "Are you in?",
    subtitle:
      "If I hold you accountable every single day, will you give me your session?",
    options: [
      {
        value: "allin",
        image: "/quiz/commitment-allin.png",
        label: "I'm all in. Let's go.",
        description: "Hold me to it. Every day.",
        icon: "flame",
        socialProof: "All-in members are the most likely to finish week 8",
        badge: "ALL IN 🔥",
      },
      {
        value: "most",
        image: "/quiz/commitment-most.png",
        label: "Most days, honestly",
        description: "Life happens, but I'll show up",
        icon: "thumbsUp",
        socialProof: "Flexible streaks keep this realistic",
        badge: "REALISTIC WIN",
      },
      {
        value: "unsure",
        image: "/quiz/commitment-unsure.png",
        label: "Show me it works first",
        description: "Prove it in week one",
        icon: "helpCircle",
        socialProof: "Most sceptics convert after session 3",
        badge: "CHALLENGE ACCEPTED",
      },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
