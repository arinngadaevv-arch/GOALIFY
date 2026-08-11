"use client";

import { useState } from "react";
import {
  Apple,
  ArrowRight,
  Beef,
  Droplets,
  Egg,
  Flame,
  Info,
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

const RULES = [
  {
    when: "60–90 min before",
    title: "Pre-workout",
    body: "Carbs plus a little protein. Keep fat low so it clears your stomach before you move.",
    example: "Banana + Greek yoghurt",
    icon: Apple,
    tone: "electric" as const,
  },
  {
    when: "Within 60 min after",
    title: "Post-workout",
    body: "Protein first, then carbs to refill what you burned. This is the window that turns effort into muscle.",
    example: "Chicken + rice, or a shake",
    icon: Beef,
    tone: "lime" as const,
  },
];

export function Nutrition() {
  const { targets, answers } = useGoalify();
  const perMeal = Math.round(targets.protein / 3);
  const isDeficit = targets.deficitOrSurplus < 0;

  const meals = [
    {
      name: "Breakfast",
      kcal: Math.round(targets.calories * 0.28),
      icon: Egg,
      tone: "electric" as const,
    },
    {
      name: "Lunch",
      kcal: Math.round(targets.calories * 0.36),
      icon: Salad,
      tone: "lime" as const,
    },
    {
      name: "Dinner",
      kcal: Math.round(targets.calories * 0.36),
      icon: UtensilsCrossed,
      tone: "electric" as const,
    },
  ];

  const [selectedMeal, setSelectedMeal] = useState<(typeof meals)[number] | null>(null);

  return (
    <AppShell dark title="Nutrition & Daily Fuel" subtitle="Targets, not diaries">
      <ParticleBurstLayer />

      {/* ------------------------------------------------------ Headline card */}
      <GlassCard tone="electric" deep className="gf-anim-rise p-6 text-center">
        <Pill tone="electric">{goalLabel(answers.goal)}</Pill>
        <p className="gf-numeric mt-4 text-6xl font-black text-ink">
          {targets.calories.toLocaleString()}
        </p>
        <p className="mt-1 text-sm font-bold tracking-[0.14em] text-mist uppercase">
          kcal per day
        </p>
        <p className="mt-4 text-sm text-ink-soft">
          Maintenance is{" "}
          <strong className="text-ink">
            {targets.maintenance.toLocaleString()} kcal
          </strong>
          . You&apos;re running a{" "}
          <strong className={isDeficit ? "text-electric" : "text-lime-deep"}>
            {Math.abs(targets.deficitOrSurplus)} kcal{" "}
            {isDeficit ? "deficit" : "surplus"}
          </strong>
          .
        </p>
      </GlassCard>

      {/* See dashboard.tsx's matching comment — CSS-multicol, no reordering. */}
      <div className="lg:columns-2 lg:gap-6">
      {/* -------------------------------------------------------- Macro split */}
      <section className="gf-anim-rise gf-delay-2 mt-6 lg:break-inside-avoid">
        <SectionHeading eyebrow="Daily split" title="Your macros" />
        <div className="grid grid-cols-3 gap-3">
          <MacroCard
            Icon={Beef}
            value={targets.protein}
            label="Protein"
            note="Non-negotiable"
            tone="lime"
          />
          <MacroCard
            Icon={Wheat}
            value={targets.carbs}
            label="Carbs"
            note="Your fuel"
            tone="electric"
          />
          <MacroCard
            Icon={Salad}
            value={targets.fats}
            label="Fats"
            note="Hormones"
            tone="neutral"
          />
        </div>

        <GlassCard className="mt-3 flex items-start gap-3 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-electric" />
          <p className="text-xs leading-relaxed text-mist">
            No weighing, no logging. Hit roughly{" "}
            <strong className="text-ink">{perMeal}g of protein</strong> at each
            of three meals and let the rest of your appetite fill the gap.
          </p>
        </GlassCard>
      </section>

      {/* ------------------------------------------------------ Meal templates */}
      <section className="gf-anim-rise gf-delay-3 mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Tap for meal ideas" title="Your plate" />
        <div className="grid grid-cols-3 gap-3">
          {meals.map((meal) => (
            <button
              key={meal.name}
              type="button"
              onClick={() => setSelectedMeal(meal)}
              className="gf-press text-left"
            >
              <GlassCard
                tone={meal.tone}
                deep
                interactive
                className="gf-lift flex flex-col items-center gap-1 p-4 text-center"
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
              </GlassCard>
            </button>
          ))}
        </div>

        <GlassCard className="mt-3 flex items-start gap-3 p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-electric" />
          <p className="text-xs leading-relaxed text-mist">
            Rough splits, not rules — eat on your own schedule. Tap any meal
            for real food ideas that hit the target.
          </p>
        </GlassCard>
      </section>

      {selectedMeal && (
        <MealIdeasSheet
          mealName={selectedMeal.name}
          kcal={selectedMeal.kcal}
          icon={selectedMeal.icon}
          onClose={() => setSelectedMeal(null)}
        />
      )}

      {/* ------------------------------------------------- Pre / post workout */}
      <section className="gf-anim-rise gf-delay-4 mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Timing rules" title="Around your session" />
        <div className="grid gap-3">
          {RULES.map((rule) => (
            <GlassCard
              key={rule.title}
              tone={rule.tone}
              deep
              className="gf-lift flex gap-4 p-5"
            >
              <IconBadge icon={rule.icon} size="md" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">{rule.title}</p>
                  <span className="text-[10px] font-bold tracking-[0.1em] text-mist uppercase">
                    {rule.when}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-ink-soft">
                  {rule.body}
                </p>
                <p className="mt-2 text-xs font-bold text-electric">
                  e.g. {rule.example}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------ Water tracker */}
      <section className="gf-anim-rise gf-delay-5 mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Hydration" title="Daily water" />
        <WaterTracker />
      </section>

      {/* --------------------------------------------------------- Quick tips */}
      <section className="gf-anim-rise gf-delay-6 mt-8 lg:break-inside-avoid">
        <SectionHeading eyebrow="Make it stick" title="Three habits" />
        <div className="grid gap-3">
          <TipRow
            Icon={Beef}
            title="Protein at every meal"
            body={`${perMeal}g per meal keeps muscle while the weight moves.`}
          />
          <TipRow
            Icon={Droplets}
            title="Glass of water on waking"
            body="You dehydrate overnight. Fix it before coffee."
          />
          <TipRow
            Icon={Flame}
            title="Stop eating 2 hours before bed"
            body="Better sleep means better recovery and fewer cravings."
          />
        </div>
      </section>
      </div>
    </AppShell>
  );
}

function MacroCard({
  Icon,
  value,
  label,
  note,
  tone,
}: {
  Icon: LucideIcon;
  value: number;
  label: string;
  note: string;
  tone: "electric" | "lime" | "neutral";
}) {
  return (
    <GlassCard
      tone={tone === "neutral" ? "plain" : tone}
      deep
      className="gf-lift p-4 text-center"
    >
      <IconBadge icon={Icon} size="sm" className="mx-auto" />
      <p className="gf-numeric mt-2.5 text-2xl font-black text-ink">
        {value}
        <span className="text-sm font-bold text-mist">g</span>
      </p>
      <p className="text-[11px] font-extrabold text-ink">{label}</p>
      <p className="mt-0.5 text-[10px] font-semibold text-mist">{note}</p>
    </GlassCard>
  );
}

function TipRow({
  Icon,
  title,
  body,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <GlassCard deep className="gf-lift flex items-center gap-4 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-electric/8">
        <Icon className="size-4 text-electric" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-mist">{body}</p>
      </div>
    </GlassCard>
  );
}
