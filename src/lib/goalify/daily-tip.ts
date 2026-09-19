import { todayKey } from "./store";

export type CoachTipCategory = "Nutrition" | "Hydration" | "Recovery";

export type CoachTip = {
  category: CoachTipCategory;
  line: string;
};

type TipTemplate = {
  category: CoachTipCategory;
  /** `proteinGramsPerMeal` is the one figure worth personalizing — it's
   * already computed for the Daily Fuel Targets card right above this tip,
   * so reusing it costs nothing and reads as coaching, not a canned line. */
  line: (proteinGramsPerMeal: number) => string;
};

const TEMPLATES: TipTemplate[] = [
  {
    category: "Nutrition",
    line: (protein) =>
      `Put ${protein}g of protein in each main meal. Hitting protein is what protects your muscle while the weight moves.`,
  },
  {
    category: "Hydration",
    line: () =>
      "A full glass of water the moment you wake up beats the coffee you're about to reach for — your body's been fasting on fluid for 8 hours.",
  },
  {
    category: "Recovery",
    line: () =>
      "Sore isn't the same as injured. Light movement — a walk, a stretch — clears soreness faster than sitting still ever will.",
  },
  {
    category: "Nutrition",
    line: () =>
      "Protein at breakfast, not just dinner. Front-loading it keeps you full for hours and cuts the 3pm urge to snack.",
  },
  {
    category: "Hydration",
    line: () =>
      "Thirsty already means behind. Sip through the day instead of chugging one glass right before your workout.",
  },
  {
    category: "Recovery",
    line: () =>
      "Sleep is where the muscle actually gets built — the workout just gives it a reason to. Protect the 7-8 hours as hard as you protect the session.",
  },
  {
    category: "Nutrition",
    line: () =>
      "A slower fork works: it takes about 20 minutes for your brain to register full. Wolf it down and you'll overshoot every time.",
  },
  {
    category: "Hydration",
    line: () =>
      "What feels like hunger an hour after eating is often just thirst. Try water first before you reach for food.",
  },
  {
    category: "Recovery",
    line: () =>
      "A 5-minute stretch right after training, while the muscle is still warm, does more for tomorrow's soreness than any amount of stretching cold.",
  },
];

/** A small, order-independent hash — good enough to spread days across the
 * template list without the visible pattern a plain char-sum would leave on
 * consecutive dates ("2026-09-19" and "2026-09-20" landing suspiciously
 * close together). Not cryptographic, just decorrelates neighboring days. */
function hashDateKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (Math.imul(hash, 31) + key.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Today's coach tip — same for every user on a given calendar day, rotating
 * to the next one at local midnight (see todayKey). Gives the dashboard a
 * reason to get glanced at on a rest day, not just a workout day.
 */
export function dailyCoachTip(
  proteinTarget: number,
  date = todayKey(),
): CoachTip {
  const template = TEMPLATES[hashDateKey(date) % TEMPLATES.length];
  return {
    category: template.category,
    line: template.line(Math.round(proteinTarget / 3)),
  };
}
