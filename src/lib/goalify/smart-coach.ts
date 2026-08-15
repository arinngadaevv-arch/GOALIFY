import type { Workout } from "./types";
import { PROGRAM, LIBRARY } from "./workouts";

/**
 * Goalify Smart Coach — a free, rule-based recommendation engine. No AI
 * API, no network call: it scores the app's existing real workouts
 * (PROGRAM + LIBRARY) against four guided answers and returns the closest
 * match, with a short honest explanation of why.
 *
 * Every workout in the app is bodyweight-only (see workouts.ts — there is
 * no `equipment` field anywhere in the data). The equipment question is
 * kept because it makes the flow feel complete and sets real expectations,
 * but it never filters anything out: whatever gets recommended is always
 * genuinely equipment-free, so "No equipment" is never a false claim.
 */

export type CoachFocus = "full" | "upper" | "lower" | "quick" | "cardio";
export type CoachTime = 10 | 20 | 30 | 45;
export type CoachEquipment = "none" | "dumbbells" | "bands" | "gym";
export type CoachFeeling = "easy" | "normal" | "challenging";

export type CoachAnswers = {
  focus: CoachFocus;
  time: CoachTime;
  equipment: CoachEquipment;
  feeling: CoachFeeling;
};

export const FOCUS_OPTIONS: { value: CoachFocus; emoji: string; label: string }[] = [
  { value: "full", emoji: "🔥", label: "Full Workout" },
  { value: "upper", emoji: "💪", label: "Upper Body" },
  { value: "lower", emoji: "🦵", label: "Lower Body" },
  { value: "quick", emoji: "⚡", label: "Quick Workout" },
  { value: "cardio", emoji: "🏃", label: "Cardio" },
];

export const TIME_OPTIONS: { value: CoachTime; label: string }[] = [
  { value: 10, label: "10 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45+ min" },
];

export const EQUIPMENT_OPTIONS: { value: CoachEquipment; label: string }[] = [
  { value: "none", label: "No equipment" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "bands", label: "Resistance Bands" },
  { value: "gym", label: "Full Gym" },
];

export const FEELING_OPTIONS: { value: CoachFeeling; emoji: string; label: string }[] = [
  { value: "easy", emoji: "😌", label: "Easy" },
  { value: "normal", emoji: "🙂", label: "Normal" },
  { value: "challenging", emoji: "🔥", label: "Challenging" },
];

/** Which of the five Step-1 focus buckets each real workout satisfies. */
const FOCUS_TAGS: Record<string, CoachFocus[]> = {
  "day-1": ["full", "cardio"], // Full Body Ignition
  "day-2": ["upper"], // Upper Body Sculpt
  "day-3": ["cardio", "quick"], // Core & Conditioning Peak
  "full-body-burn": ["full", "cardio", "quick"],
  "core-crusher": ["quick"],
  "lower-body-joint-safe": ["lower"],
};

const INTENSITY_RANK: Record<Workout["intensity"], number> = {
  Ignite: 1,
  Build: 2,
  Peak: 3,
  Restore: 1,
};

const FEELING_RANK: Record<CoachFeeling, number> = {
  easy: 1,
  normal: 2,
  challenging: 3,
};

function score(workout: Workout, answers: CoachAnswers) {
  const tags = FOCUS_TAGS[workout.id] ?? [];
  const focusScore = tags.includes(answers.focus) ? 50 : 0;
  const timeScore = Math.max(0, 30 - Math.abs(workout.durationMinutes - answers.time));
  const intensityScore =
    15 - Math.abs(FEELING_RANK[answers.feeling] - INTENSITY_RANK[workout.intensity]) * 7;
  return focusScore + timeScore + intensityScore;
}

export type CoachRecommendation = {
  workout: Workout;
  reasons: string[];
};

/** Deterministic, explainable — the whole point of "rule-based." */
export function recommendWorkout(answers: CoachAnswers): CoachRecommendation {
  const candidates = [...PROGRAM, ...LIBRARY];
  const ranked = candidates
    .map((workout) => ({ workout, points: score(workout, answers) }))
    .sort((a, b) => b.points - a.points);

  const best = ranked[0].workout;
  const focusLabel = FOCUS_OPTIONS.find((f) => f.value === answers.focus)?.label ?? "";
  const feelingLabel = FEELING_OPTIONS.find((f) => f.value === answers.feeling)?.label ?? "";

  const reasons = [
    FOCUS_TAGS[best.id]?.includes(answers.focus)
      ? `Matches your ${focusLabel.toLowerCase()} focus`
      : `Closest match to ${focusLabel.toLowerCase()}`,
    `~${best.durationMinutes} min, close to your ${answers.time}-min window`,
    `${feelingLabel} effort level`,
  ];

  return { workout: best, reasons };
}
