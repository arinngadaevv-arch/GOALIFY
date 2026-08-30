"use client";

import { useState } from "react";
import {
  Apple,
  ArrowRight,
  Beef,
  Droplets,
  Egg,
  Flame,
  Salad,
  UtensilsCrossed,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { goalLabel } from "@/lib/goalify/plan";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { IconBadge } from "./ui/icon-badge";
import { WaterTracker } from "./water-tracker";
import { Pill, SectionHeading } from "./ui/stat";
import { ParticleBurstLayer } from "./quiz/particle-burst";
import { MealIdeasSheet } from "./meal-ideas-sheet";

const HABITS = [
  {
    title: "Pre-workout",
    when: "60–90 min before",
    body: "Carbs plus a little protein. Keep fat low so it clears your stomach before you move.",
    icon: Apple,
  },
  {
    title: "Post-workout",
    when: "Within 60 min after",
    body: "Protein first, then carbs to refill what you burned — the window that turns effort into muscle.",
    icon: Beef,
  },
  {
    title: "Protein at every meal",
    when: "All day",
    body: "Even splits keep muscle protected while the weight moves.",
    icon: Flame,
  },
  {
    title: "Glass of water on waking",
    when: "Morning",
    body: "You dehydrate overnight — fix it before coffee.",
    icon: Droplets,
  },
];

export function Nutrition() {
  const { targets, answers } = useGoalify();
  const perMeal = Math.round(targets.protein / 3);
  const isDeficit = targets.deficitOrSurplus < 0;

  const meals = [
    { name: "Breakfast", kcal: Math.round(targets.calories * 0.28), icon: Egg },
    { name: "Lunch", kcal: Math.round(targets.calories * 0.36), icon: Salad },
    { name: "Dinner", kcal: Math.round(targets.calories * 0.36), icon: UtensilsCrossed },
  ];

  const [selectedMeal, setSelectedMeal] = useState<(typeof meals)[number] | null>(null);

  return (
    <AppShell dark title="Nutrition & Daily Fuel" subtitle="Targets, not diaries">
      <ParticleBurstLayer />

      {/* --------------------------------------------------------- Hero card
          One layered surface instead of a headline card + three separate
          macro boxes + an info box: the number, the "why", and the split
          all live in one place, the macro row floating on the same
          surface rather than boxed into a panel of its own. */}
      <div className="relative">
        <div
          className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-electric/16 opacity-70 blur-3xl"
          aria-hidden
        />
        <GlassCard tone="electric" deep className="gf-reveal p-6 text-center">
          <Pill tone="electric">{goalLabel(answers.goal)}</Pill>
          <p className="gf-numeric mt-4 text-6xl font-black text-ink">
            {targets.calories.toLocaleString()}
          </p>
          <p className="mt-1 text-sm font-bold tracking-[0.14em] text-mist uppercase">
            kcal per day
          </p>
          <p className="mt-3 text-sm text-ink-soft">
            Maintenance is{" "}
            <strong className="text-ink">
              {targets.maintenance.toLocaleString()} kcal
            </strong>
            . You&apos;re running a{" "}
            <strong className="text-electric">
              {Math.abs(targets.deficitOrSurplus)} kcal{" "}
              {isDeficit ? "deficit" : "surplus"}
            </strong>
            .
          </p>

          {/* The three macros float directly on the hero's own surface —
              separated by grid gap alone, no inset panel or divider lines
              boxing them in on top of it. */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            <MacroColumn Icon={Beef} value={targets.protein} label="Protein" />
            <MacroColumn Icon={Wheat} value={targets.carbs} label="Carbs" />
            <MacroColumn Icon={Salad} value={targets.fats} label="Fats" />
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-haze">
            No weighing, no logging — roughly {perMeal}g of protein at each of
            three meals, and let the rest of your appetite fill the gap.
          </p>
        </GlassCard>
      </div>

      {/* See dashboard.tsx's matching comment — CSS-multicol, no reordering. */}
      <div className="lg:columns-2 lg:gap-6">
      {/* ------------------------------------------------------ Meal templates
          No card background at rest — three boxed cubes in a row read as
          heavy for what's really just a picker. A soft wash only appears
          on hover/focus, so the row feels like one continuous, elegant
          choice instead of three separate boxes competing for attention. */}
      <section className="gf-reveal mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Tap for real food ideas" title="Your plate" />
        <div className="grid grid-cols-3 gap-2">
          {meals.map((meal) => (
            <button
              key={meal.name}
              type="button"
              onClick={() => setSelectedMeal(meal)}
              className="gf-press flex flex-col items-center gap-1 rounded-glass p-4 text-center transition-colors duration-300 hover:bg-white/6"
            >
              <IconBadge icon={meal.icon} size="lg" />
              <p className="mt-1.5 text-xs font-extrabold text-ink">
                {meal.name}
              </p>
              <p className="gf-numeric text-sm font-bold text-electric">
                {meal.kcal} kcal
              </p>
              <p className="text-[10px] font-semibold text-mist">
                {perMeal}g protein
              </p>
              <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-electric/10 px-2.5 py-1 text-[10px] font-bold text-electric">
                Ideas
                <ArrowRight className="size-3" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {selectedMeal && (
        <MealIdeasSheet
          mealName={selectedMeal.name}
          kcal={selectedMeal.kcal}
          icon={selectedMeal.icon}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {/* ---------------------------------------------------- Habits, in one
          list — replaces five separate cards (two timing rules, three tip
          rows) with clean floating rows instead of one more frame around
          all four: real vertical gap does the separating, and each icon
          carries its own glow instead of leaning on a boxed container to
          read as distinct. */}
      <section className="gf-reveal mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Make it stick" title="Habits that matter" />
        <div className="flex flex-col gap-5">
          {HABITS.map((habit) => (
            <div key={habit.title} className="flex gap-4">
              <IconBadge icon={habit.icon} size="md" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">{habit.title}</p>
                  <span className="text-[10px] font-bold tracking-[0.1em] text-mist uppercase">
                    {habit.when}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {habit.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Water tracker */}
      <section className="gf-reveal mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Hydration" title="Daily water" />
        <WaterTracker />
      </section>
      </div>
    </AppShell>
  );
}

function MacroColumn({
  Icon,
  value,
  label,
}: {
  Icon: LucideIcon;
  value: number;
  label: string;
}) {
  return (
    <div className="px-2 text-center first:pl-0 last:pr-0">
      <Icon className="mx-auto size-4 text-electric" />
      <p className="gf-numeric mt-2 text-xl font-black text-ink">
        {value}
        <span className="text-xs font-bold text-mist">g</span>
      </p>
      <p className="mt-0.5 text-[10px] font-bold tracking-[0.08em] text-mist uppercase">
        {label}
      </p>
    </div>
  );
}
