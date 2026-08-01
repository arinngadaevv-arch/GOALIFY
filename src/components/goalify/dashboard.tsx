"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Beef,
  Bell,
  Check,
  Dumbbell,
  Droplets,
  Library,
  Play,
  ShieldCheck,
  Timer,
  Zap,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { resolveWorkout } from "@/lib/goalify/workouts";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { GlowLink } from "./ui/glow-button";
import { VisualSlot } from "./ui/visual-slot";
import { ProgressRing } from "./ui/progress-ring";
import { Pill, SectionHeading, Stat } from "./ui/stat";
import { fireBurst, ParticleBurstLayer } from "./quiz/particle-burst";

/** Obsidian-scope ring colors — literal hex since RING_ELECTRIC/RING_LIME
 * are shared constants tuned for the light theme elsewhere in the app. */
const RING_GOLD = "#e8b32c";
const RING_CRIMSON = "#ff3b3b";

const MOTIVATION_QUOTES = [
  "NO ZERO DAYS",
  "BUILD THE ALPHA WITHIN",
  "DISCIPLINE OVER EXCUSES",
  "EARN IT TODAY",
  "OUTWORK YESTERDAY",
];

export function Dashboard() {
  const {
    state,
    answers,
    targets,
    todaysWorkout,
    workoutDoneToday,
    setWater,
    waterGlasses,
    streak,
  } = useGoalify();

  const workout = resolveWorkout(todaysWorkout, state.settings.kneeSafe);
  const workoutPercent = workoutDoneToday ? 100 : 0;
  const nutritionPercent = Math.min(
    100,
    Math.round((waterGlasses / targets.waterGlasses) * 100),
  );

  return (
    <AppShell dark>
      <ParticleBurstLayer />

      {/* ------------------------------------------------------- Streak badge */}
      <StreakBadge day={state.programDay} streak={streak} />

      {/* --------------------------------------------------- Motivation ticker */}
      <MotivationTicker />

      {/* ------------------------------------------------ Dual progress rings */}
      <GlassCard deep className="gf-anim-rise gf-delay-1 flex items-center gap-6 p-6">
        <ProgressRing
          size={148}
          thickness={13}
          gap={7}
          rings={[
            { value: workoutPercent, color: RING_GOLD, label: "Workout" },
            { value: nutritionPercent, color: RING_CRIMSON, label: "Nutrition" },
          ]}
        >
          <div>
            <p className="gf-numeric text-3xl font-black text-ink">
              {Math.round((workoutPercent + nutritionPercent) / 2)}%
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-mist">
              Today
            </p>
          </div>
        </ProgressRing>

        <div className="min-w-0 flex-1 space-y-4">
          <RingLegend
            color={RING_GOLD}
            label="Workout"
            value={`${workoutPercent}%`}
            detail={workoutDoneToday ? "Session complete" : "Not started yet"}
          />
          <RingLegend
            color={RING_CRIMSON}
            label="Nutrition"
            value={`${nutritionPercent}%`}
            detail={`${waterGlasses}/${targets.waterGlasses} glasses`}
          />
        </div>
      </GlassCard>

      {/* ------------------------------------------------ Today's workout card */}
      <section className="mt-8">
        <SectionHeading
          eyebrow={`Day ${state.programDay}`}
          title="Today's Workout"
          action={
            state.settings.kneeSafe ? (
              <Pill tone="lime">
                <ShieldCheck className="size-3" strokeWidth={3} />
                Knee-safe
              </Pill>
            ) : null
          }
        />

        <GlassCard
          deep
          className="gf-anim-rise gf-delay-2 overflow-hidden p-0"
        >
          <div className="relative">
            <VisualSlot
              label="Workout Preview"
              hint="3D coach loop for this session"
              icon={Dumbbell}
              rounded="rounded-none"
              className="h-44 w-full"
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <Pill tone="electric">{workout.intensity}</Pill>
              {workoutDoneToday && (
                <Pill tone="lime">
                  <Check className="size-3" strokeWidth={3} /> Done
                </Pill>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="gf-display text-2xl font-black text-ink">
              {workout.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">
              {workout.subtitle}
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3 border-y border-ink/8 py-4">
              <Stat
                value={workout.durationMinutes}
                suffix="min"
                label="Duration"
              />
              <Stat value={workout.calories} suffix="kcal" label="Burn" />
              <Stat value={workout.exercises.length} label="Moves" />
            </div>

            <GlowLink
              href="/workout/launch"
              size="lg"
              fullWidth
              pulse={!workoutDoneToday}
              variant={workoutDoneToday ? "glass" : "cyber"}
              className="mt-5 gap-2 tracking-tight"
            >
              {workoutDoneToday ? (
                <>
                  <Play className="size-5 fill-current" />
                  TRAIN AGAIN
                </>
              ) : (
                <>
                  ⚡ START {workout.durationMinutes}-MIN WORKOUT NOW ➔ ➔
                </>
              )}
            </GlowLink>
          </div>
        </GlassCard>
      </section>

      {/* ------------------------------------------------------ Library link */}
      <Link href="/workouts" className="mt-5 block">
        <GlassCard
          tone="lime"
          interactive
          className="gf-anim-rise gf-delay-3 flex items-center gap-4 p-5"
        >
          <span className="gf-glow-lime grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-neon">
            <Library className="size-5 text-ink" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">
              Explore more workouts
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Full Body Burn, Core Crusher, Lower Body &amp; Joints Safe.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-lime-deep" />
        </GlassCard>
      </Link>

      {/* ----------------------------------------------- Nutrition targets card */}
      <section className="mt-8">
        <SectionHeading
          eyebrow="No food logging"
          title="Daily Fuel Targets"
          action={
            <Link
              href="/nutrition"
              className="flex items-center gap-1 text-xs font-bold text-electric"
            >
              Details <ArrowRight className="size-3.5" />
            </Link>
          }
        />

        <GlassCard deep className="gf-anim-rise gf-delay-4 p-6">
          <div className="grid grid-cols-3 gap-3">
            <MacroTile
              Icon={Zap}
              value={targets.calories.toLocaleString()}
              unit="kcal"
              label="Calories"
            />
            <MacroTile
              Icon={Beef}
              value={targets.protein}
              unit="g"
              label="Protein"
            />
            <MacroTile
              Icon={Droplets}
              value={(targets.waterMl / 1000).toFixed(1)}
              unit="L"
              label="Water"
            />
          </div>

          <div className="mt-5 rounded-2xl bg-electric/6 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-electric">
              Today&apos;s tip
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
              Put {Math.round(targets.protein / 3)}g of protein in each main
              meal. Hitting protein is what protects your muscle while the
              weight moves.
            </p>
          </div>

          {/* Quick water action — the one thing worth tapping from home. */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/6">
              <div
                className="gf-progress-fill h-full rounded-full bg-linear-to-r from-electric to-lime-neon transition-[width] duration-500"
                style={{ width: `${nutritionPercent}%` }}
              />
            </div>
            <button
              type="button"
              onClick={(event) => {
                fireBurst(event.clientX, event.clientY);
                setWater(waterGlasses + 1);
              }}
              className="gf-glass gf-press flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-electric"
            >
              <Droplets className="size-4" />+ Glass
            </button>
          </div>
        </GlassCard>
      </section>

      {/* ------------------------------------------------------ Reminders link */}
      <Link href="/notifications" className="mt-5 block">
        <GlassCard
          tone="electric"
          interactive
          className="gf-anim-rise gf-delay-5 flex items-center gap-4 p-5"
        >
          <span className="gf-glow-electric grid size-11 shrink-0 place-items-center rounded-2xl bg-electric">
            <Bell className="size-5 text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">
              Your daily reminders
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              3 nudges a day — motivation, water, workout.
            </p>
          </div>
          <ArrowRight className="size-4 shrink-0 text-electric" />
        </GlassCard>
      </Link>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-haze">
        <Timer className="size-3.5" />
        {answers.sessionLength} minute sessions · {answers.daysPerWeek} days a
        week
      </p>
    </AppShell>
  );
}

/** Prominent top-of-dashboard streak callout — pulsing flame glow. */
function StreakBadge({ day, streak }: { day: number; streak: number }) {
  return (
    <div className="gf-anim-rise gf-streak-badge mb-5 flex items-center justify-center gap-3 rounded-full border border-lime-deep/30 bg-linear-to-r from-lime-neon/10 via-electric/8 to-lime-neon/10 px-5 py-3">
      <span className="gf-anim-flicker-flame text-2xl" aria-hidden>
        🔥🔥
      </span>
      <div className="text-center leading-tight">
        <p className="gf-display text-sm font-black tracking-tight text-ink">
          DAY {day}
        </p>
        <p className="text-[10px] font-black tracking-[0.16em] text-lime-deep uppercase">
          Streak: {streak} day{streak === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

/** Cycling high-octane motivation quote banner. */
function MotivationTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MOTIVATION_QUOTES.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="gf-glass gf-anim-rise gf-delay-1 mb-6 overflow-hidden rounded-full px-5 py-2.5 text-center">
      <p
        key={index}
        className="gf-anim-materialize gf-display text-xs font-black tracking-[0.14em] text-electric uppercase"
      >
        ⚡ {MOTIVATION_QUOTES[index]} ⚡
      </p>
    </div>
  );
}

function RingLegend({
  color,
  label,
  value,
  detail,
}: {
  color: string;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span className="text-xs font-bold uppercase tracking-[0.1em] text-mist">
          {label}
        </span>
        <span className="gf-numeric ml-auto text-sm font-extrabold text-ink">
          {value}
        </span>
      </div>
      <p className="mt-0.5 pl-4.5 text-xs text-haze">{detail}</p>
    </div>
  );
}

function MacroTile({
  Icon,
  value,
  unit,
  label,
}: {
  Icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  unit: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl bg-ink/3 p-3.5 text-center">
      <Icon className="mx-auto size-4 text-electric" />
      <p className="gf-numeric mt-2 text-xl font-black text-ink">
        {value}
        <span className="ml-0.5 text-xs font-bold text-mist">{unit}</span>
      </p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-mist">
        {label}
      </p>
    </div>
  );
}
