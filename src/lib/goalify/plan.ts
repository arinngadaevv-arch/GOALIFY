import { Search, Trophy, Zap, type LucideIcon } from "lucide-react";
import type { NutritionTargets, Profile, QuizAnswers } from "./types";

const ACTIVITY_BY_DAYS: Record<number, number> = {
  3: 1.375,
  4: 1.465,
  5: 1.55,
  6: 1.64,
};

/** Mifflin–St Jeor. The "unspecified" case averages the two constants. */
function basalRate(p: Pick<QuizAnswers, "sex" | "weightKg" | "heightCm" | "age">) {
  const base = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age;
  if (p.sex === "male") return base + 5;
  if (p.sex === "female") return base - 161;
  return base - 78;
}

const GOAL_ADJUSTMENT: Record<QuizAnswers["goal"], number> = {
  burn: -0.19,
  build: 0.12,
  tone: -0.09,
  athletic: 0.03,
};

/** Grams of protein per kg of bodyweight, by goal. */
const PROTEIN_PER_KG: Record<QuizAnswers["goal"], number> = {
  burn: 2.0,
  build: 2.2,
  tone: 1.9,
  athletic: 1.8,
};

export function nutritionTargets(p: QuizAnswers): NutritionTargets {
  const maintenance = Math.round(
    basalRate(p) * (ACTIVITY_BY_DAYS[p.daysPerWeek] ?? 1.465),
  );
  const adjustment = Math.round(maintenance * GOAL_ADJUSTMENT[p.goal]);
  const calories = Math.round((maintenance + adjustment) / 10) * 10;

  const protein = Math.round(p.weightKg * PROTEIN_PER_KG[p.goal]);
  const fats = Math.round((calories * 0.27) / 9);
  const carbs = Math.max(
    0,
    Math.round((calories - protein * 4 - fats * 9) / 4),
  );

  const waterMl = Math.round((p.weightKg * 35 + p.daysPerWeek * 90) / 50) * 50;

  return {
    calories,
    protein,
    carbs,
    fats,
    waterMl,
    waterGlasses: Math.max(6, Math.round(waterMl / 250)),
    maintenance,
    deficitOrSurplus: adjustment,
  };
}

export type WeightProjection = {
  week: number;
  weight: number;
};

/**
 * Projects weight toward the target at a safe rate — capped at 0.75% of
 * bodyweight per week — so the trendline never promises something unhealthy.
 */
export function projectWeight(p: QuizAnswers, weeks = 12): WeightProjection[] {
  const direction = p.targetWeightKg < p.weightKg ? -1 : 1;
  const totalChange = Math.abs(p.targetWeightKg - p.weightKg);
  const weeklyCap = p.weightKg * 0.0075;

  const points: WeightProjection[] = [];
  let current = p.weightKg;
  let remaining = totalChange;

  for (let week = 0; week <= weeks; week++) {
    points.push({ week, weight: Math.round(current * 10) / 10 });
    // Change tapers as the target approaches, mirroring real adaptation.
    const taper = remaining > weeklyCap ? weeklyCap : remaining;
    const step = taper * (week === 0 ? 0.6 : 1);
    current += direction * step;
    remaining = Math.max(0, remaining - step);
  }

  return points;
}

export function weeksToTarget(p: QuizAnswers): number {
  const totalChange = Math.abs(p.targetWeightKg - p.weightKg);
  if (totalChange < 0.5) return 0;
  return Math.max(2, Math.ceil(totalChange / (p.weightKg * 0.0075)));
}

const GOAL_LABEL: Record<QuizAnswers["goal"], string> = {
  burn: "Fat Burn",
  build: "Muscle Build",
  tone: "Lean Sculpt",
  athletic: "Athletic Engine",
};

const LEVEL_LABEL: Record<QuizAnswers["level"], string> = {
  beginner: "Foundation",
  returning: "Comeback",
  consistent: "Momentum",
  advanced: "Elite",
};

export function planName(p: QuizAnswers): string {
  return `${LEVEL_LABEL[p.level]} ${GOAL_LABEL[p.goal]}`;
}

export function goalLabel(goal: QuizAnswers["goal"]): string {
  return GOAL_LABEL[goal];
}

export function levelLabel(level: QuizAnswers["level"]): string {
  return LEVEL_LABEL[level];
}

/** Headline claims shown on the paywall, derived from the user's own answers. */
export function planHighlights(p: QuizAnswers): string[] {
  const targets = nutritionTargets(p);
  const weeks = weeksToTarget(p);
  const highlights = [
    `${p.daysPerWeek} sessions a week, ${p.sessionLength} minutes each`,
    `${targets.calories.toLocaleString()} kcal and ${targets.protein}g protein a day`,
  ];

  if (weeks > 0) {
    highlights.push(
      `${Math.abs(p.targetWeightKg - p.weightKg).toFixed(1)}kg target mapped over ${weeks} weeks`,
    );
  }

  const protective = p.joints.filter((j) => j !== "none");
  if (protective.length > 0) {
    highlights.push(
      `Every movement rebuilt around your ${protective.join(", ")}`,
    );
  } else {
    highlights.push("Full-range programming with progressive overload");
  }

  highlights.push(`Built around your #1 blocker: ${painLabel(p.painTrigger)}`);
  highlights.push("3D AI form coach on every single rep");
  return highlights;
}

const PAIN_LABEL: Record<QuizAnswers["painTrigger"], string> = {
  time: "never having enough time",
  motivation: "motivation fading",
  confusion: "not knowing what to do",
  injury: "pain interrupting progress",
  restart: "starting over and over",
};

export function painLabel(trigger: QuizAnswers["painTrigger"]): string {
  return PAIN_LABEL[trigger];
}

const VISION_LABEL: Record<QuizAnswers["vision"], string> = {
  confident: "totally confident",
  strong: "genuinely strong",
  energised: "full of energy",
  proud: "proud you finally did it",
};

export function visionLabel(vision: QuizAnswers["vision"]): string {
  return VISION_LABEL[vision];
}

export type Milestone = {
  week: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

/**
 * The transformation timeline sold on the paywall. Framing adapts to the
 * user's goal so the promise matches what they actually asked for.
 */
export function milestones(p: QuizAnswers): Milestone[] {
  const definition =
    p.goal === "build"
      ? "Strength climbing — you'll add reps to every movement"
      : "Visible definition starting to show, especially in the mirror";

  return [
    {
      week: "Week 1",
      title: "Energy Boost",
      body: "Sleep improves, the 3pm crash fades, and showing up stops feeling like a fight.",
      icon: Zap,
    },
    {
      week: "Week 2",
      title: "Visible Definition",
      body: definition,
      icon: Search,
    },
    {
      week: "Week 4",
      title: "Total Transformation",
      body: `Clothes fit differently and you feel ${VISION_LABEL[p.vision]} looking back at yourself.`,
      icon: Trophy,
    },
  ];
}

export const DEFAULT_ANSWERS: QuizAnswers = {
  goal: "burn",
  focusZones: [],
  level: "returning",
  joints: ["none"],
  daysPerWeek: 4,
  sessionLength: "25",
  sex: "unspecified",
  age: 30,
  heightCm: 175,
  weightKg: 78,
  targetWeightKg: 70,
  painTrigger: "motivation",
  vision: "confident",
  commitment: "allin",
};

export function toProfile(answers: QuizAnswers, name = "Athlete"): Profile {
  return { ...answers, name, completedAt: new Date().toISOString() };
}
