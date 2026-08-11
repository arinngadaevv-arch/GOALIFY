"use client";

import { createPortal } from "react-dom";
import { X, type LucideIcon } from "lucide-react";

/**
 * Real food ideas per meal slot, not a recipe database — a handful of
 * realistic options with a rough protein figure, in keeping with the app's
 * "targets, not diaries" stance (see nutrition.tsx): plenty to point
 * someone toward a real meal, nothing that pretends to track what they
 * actually ate.
 */
const MEAL_IDEAS: Record<string, { name: string; body: string; protein: string }[]> = {
  Breakfast: [
    { name: "Greek yogurt bowl", body: "Greek yogurt, berries, granola, a drizzle of honey.", protein: "~30g protein" },
    { name: "Veggie egg scramble", body: "3–4 eggs, spinach, a slice of whole-grain toast.", protein: "~28g protein" },
    { name: "Protein oats", body: "Oats, a scoop of protein powder, banana, peanut butter.", protein: "~35g protein" },
    { name: "Cottage cheese toast", body: "Cottage cheese, whole-grain toast, sliced tomato.", protein: "~25g protein" },
  ],
  Lunch: [
    { name: "Chicken & rice bowl", body: "Grilled chicken breast, rice, mixed roasted veggies.", protein: "~45g protein" },
    { name: "Tuna salad wrap", body: "Tuna, whole-wheat wrap, greens, avocado.", protein: "~35g protein" },
    { name: "Turkey & quinoa bowl", body: "Ground turkey, quinoa, roasted vegetables.", protein: "~40g protein" },
    { name: "Lentil & chicken soup", body: "Lentils, shredded chicken, mixed vegetables.", protein: "~38g protein" },
  ],
  Dinner: [
    { name: "Salmon & sweet potato", body: "Baked salmon, sweet potato, broccoli.", protein: "~40g protein" },
    { name: "Lean beef stir-fry", body: "Lean beef strips, mixed veggies, brown rice.", protein: "~42g protein" },
    { name: "Grilled chicken & greens", body: "Chicken breast, a big salad, olive oil dressing.", protein: "~45g protein" },
    { name: "Baked tofu & veggies", body: "Tofu, roasted vegetables, quinoa — vegetarian.", protein: "~30g protein" },
  ],
};

export function MealIdeasSheet({
  mealName,
  kcal,
  icon: Icon,
  onClose,
}: {
  mealName: string;
  kcal: number;
  icon: LucideIcon;
  onClose: () => void;
}) {
  const ideas = MEAL_IDEAS[mealName] ?? [];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="meal-sheet-heading"
        className="gf-anim-rise relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#12151d] p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] sm:rounded-3xl sm:pb-6 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="gf-press absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
        >
          <X className="size-4.5" strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-electric/15 text-electric">
            <Icon className="size-5" strokeWidth={2.2} />
          </span>
          <div>
            <h2 id="meal-sheet-heading" className="gf-display text-lg font-extrabold text-white">
              {mealName} ideas
            </h2>
            <p className="text-xs font-semibold text-white/50">
              Roughly {kcal.toLocaleString("en-US")} kcal for this meal
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2.5">
          {ideas.map((idea) => (
            <div
              key={idea.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-white">{idea.name}</p>
                <span className="shrink-0 text-[10px] font-bold text-electric">
                  {idea.protein}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/60">{idea.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-white/40">
          Swap ingredients freely — hitting roughly this much protein matters
          more than any single recipe.
        </p>
      </div>
    </div>,
    document.body,
  );
}
