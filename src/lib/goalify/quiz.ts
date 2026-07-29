import type { QuizAnswers } from "./types";

export type ChoiceOption = {
  value: string;
  label: string;
  description?: string;
  emoji: string;
};

export type QuizStep =
  | {
      id: keyof QuizAnswers;
      kind: "choice";
      /** `multi` collects an array of values instead of a single one. */
      multi?: boolean;
      title: string;
      subtitle: string;
      options: ChoiceOption[];
    }
  | {
      id: keyof QuizAnswers;
      kind: "number";
      title: string;
      subtitle: string;
      unit: string;
      min: number;
      max: number;
      step: number;
      defaultValue: number;
    };

export const QUIZ_STEPS: QuizStep[] = [
  {
    id: "goal",
    kind: "choice",
    title: "What are you chasing?",
    subtitle: "Pick the outcome that would make the next 12 weeks a win.",
    options: [
      {
        value: "burn",
        label: "Burn fat",
        description: "Drop body fat, keep the muscle you have",
        emoji: "🔥",
      },
      {
        value: "build",
        label: "Build muscle",
        description: "Add visible size and raw strength",
        emoji: "💪",
      },
      {
        value: "tone",
        label: "Tone & sculpt",
        description: "Lean definition without bulk",
        emoji: "✨",
      },
      {
        value: "athletic",
        label: "Athletic conditioning",
        description: "Move faster, last longer, hit harder",
        emoji: "⚡",
      },
    ],
  },
  {
    id: "level",
    kind: "choice",
    title: "Where are you starting from?",
    subtitle: "Be honest — this sets your day-one intensity.",
    options: [
      {
        value: "beginner",
        label: "Total beginner",
        description: "New to structured training",
        emoji: "🌱",
      },
      {
        value: "returning",
        label: "Getting back into it",
        description: "Trained before, took a long break",
        emoji: "🔄",
      },
      {
        value: "consistent",
        label: "Fairly consistent",
        description: "Training most weeks already",
        emoji: "📈",
      },
      {
        value: "advanced",
        label: "Advanced",
        description: "Years of training, chasing the next level",
        emoji: "🏆",
      },
    ],
  },
  {
    id: "joints",
    kind: "choice",
    multi: true,
    title: "Any joints we should protect?",
    subtitle:
      "We rebuild every movement around this. Select all that apply — or none.",
    options: [
      {
        value: "none",
        label: "Nothing hurts",
        description: "Full range of movement available",
        emoji: "✅",
      },
      {
        value: "knees",
        label: "Sensitive knees",
        description: "Auto-swaps jumps and deep knee bends",
        emoji: "🦵",
      },
      {
        value: "back",
        label: "Lower back",
        description: "Spine-neutral variations only",
        emoji: "🧘",
      },
      {
        value: "shoulders",
        label: "Shoulders",
        description: "Limits overhead loading",
        emoji: "🫱",
      },
    ],
  },
  {
    id: "daysPerWeek",
    kind: "choice",
    title: "How many days a week?",
    subtitle: "Consistency beats intensity. Pick what you'll actually hit.",
    options: [
      { value: "3", label: "3 days", description: "Steady and sustainable", emoji: "🗓️" },
      { value: "4", label: "4 days", description: "The sweet spot", emoji: "🎯" },
      { value: "5", label: "5 days", description: "Fast-track results", emoji: "🚀" },
      { value: "6", label: "6 days", description: "All in", emoji: "🔥" },
    ],
  },
  {
    id: "sessionLength",
    kind: "choice",
    title: "How long per session?",
    subtitle: "Every plan is built to finish in the time you actually have.",
    options: [
      { value: "15", label: "15 minutes", description: "Express, no equipment", emoji: "⚡" },
      { value: "25", label: "25 minutes", description: "Balanced and complete", emoji: "⏱️" },
      { value: "40", label: "40 minutes", description: "Full session with finishers", emoji: "🏋️" },
    ],
  },
  {
    id: "sex",
    kind: "choice",
    title: "Biological sex",
    subtitle: "Used only to calculate your metabolic baseline accurately.",
    options: [
      { value: "female", label: "Female", emoji: "♀️" },
      { value: "male", label: "Male", emoji: "♂️" },
      { value: "unspecified", label: "Prefer not to say", description: "We'll use an average baseline", emoji: "•" },
    ],
  },
  {
    id: "age",
    kind: "number",
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
    title: "Current weight",
    subtitle: "Your starting point — this is where the graph begins.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 78,
  },
  {
    id: "targetWeightKg",
    kind: "number",
    title: "Target weight",
    subtitle: "We'll project a realistic, safe timeline to reach it.",
    unit: "kg",
    min: 40,
    max: 180,
    step: 1,
    defaultValue: 70,
  },
  {
    id: "blocker",
    kind: "choice",
    title: "What has stopped you before?",
    subtitle: "Your plan actively designs around this.",
    options: [
      { value: "time", label: "No time", description: "Sessions get cut short or skipped", emoji: "⌛" },
      { value: "motivation", label: "Motivation fades", description: "Strong start, week-three collapse", emoji: "📉" },
      { value: "confusion", label: "Not knowing what to do", description: "Too many conflicting plans", emoji: "🤔" },
      { value: "injury", label: "Pain or injury", description: "Progress kept getting interrupted", emoji: "🩹" },
    ],
  },
];

export const TOTAL_QUIZ_STEPS = QUIZ_STEPS.length;
