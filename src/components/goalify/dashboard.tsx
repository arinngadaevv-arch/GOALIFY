"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  Beef,
  Bell,
  Check,
  Droplets,
  Flame as FlameIcon,
  Footprints,
  Library,
  Play,
  ShieldCheck,
  Timer,
  Zap,
} from "lucide-react";
import {
  ACTIVE_MINUTES_GOAL,
  CALORIE_BURN_GOAL,
  STEP_GOAL,
  useGoalify,
} from "@/lib/goalify/store";
import { resolveWorkout } from "@/lib/goalify/workouts";
import { useStepTracker } from "@/lib/goalify/use-step-tracker";
import { useHaptics } from "@/lib/goalify/use-haptics";
import { playCompletionCelebration } from "@/lib/goalify/sound";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { GlowLink } from "./ui/glow-button";
import { VisualSlot } from "./ui/visual-slot";
import { ProgressRing } from "./ui/progress-ring";
import { ActivityRings, type ActivityMetric } from "./ui/activity-rings";
import { Pill, SectionHeading, Stat } from "./ui/stat";
import { fireBurst, ParticleBurstLayer } from "./quiz/particle-burst";

/** Obsidian-scope ring colors — literal hex since RING_ELECTRIC/RING_LIME
 * are shared constants tuned for the light theme elsewhere in the app. */
const RING_GOLD = "#e8b32c";
const RING_CRIMSON = "#ff3b3b";
const RING_LIME = "#39FF14";
const RING_STEPS = "#0052FF";
const RING_CALORIES = "#ff6a3b";

/** Rough, commonly-cited energy cost per step — enough to make the calorie
 * ring feel alive without pretending to be a calibrated metabolic measure. */
const KCAL_PER_STEP = 0.04;

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
    steps,
  } = useGoalify();

  const workout = resolveWorkout(todaysWorkout, state.settings.kneeSafe);
  const workoutPercent = workoutDoneToday ? 100 : 0;
  const nutritionPercent = Math.min(
    100,
    Math.round((waterGlasses / targets.waterGlasses) * 100),
  );

  const stepTracker = useStepTracker();
  const haptics = useHaptics();
  const soundsEnabled = state.settings.soundEffects;

  const activeMinutesToday = workoutDoneToday ? workout.durationMinutes : 0;
  const caloriesToday =
    (workoutDoneToday ? workout.calories : 0) + Math.round(steps * KCAL_PER_STEP);

  const activityMetrics: ActivityMetric[] = [
    { key: "steps", label: "Steps", value: steps, goal: STEP_GOAL, unit: "", color: RING_STEPS, icon: Footprints },
    { key: "active", label: "Active min", value: activeMinutesToday, goal: ACTIVE_MINUTES_GOAL, unit: "min", color: RING_LIME, icon: Timer },
    { key: "calories", label: "Calories", value: caloriesToday, goal: CALORIE_BURN_GOAL, unit: "kcal", color: RING_CALORIES, icon: FlameIcon },
  ];

  // Fires once per crossing, not once per render — a ref-tracked previous
  // value means the celebration only plays the moment a ring actually fills,
  // never again just because the dashboard remounts while it's still full.
  const celebratedRef = useRef({ steps: false, workout: false });
  useEffect(() => {
    const c = celebratedRef.current;
    if (steps >= STEP_GOAL && !c.steps) {
      c.steps = true;
      fireBurst(window.innerWidth / 2, 160, true);
      if (soundsEnabled) playCompletionCelebration();
      haptics.milestone();
    } else if (steps < STEP_GOAL) {
      c.steps = false;
    }
  }, [steps, soundsEnabled, haptics]);

  // Sound + haptic for finishing a workout already fire once, right on the
  // live-player's own completion screen (see live-player.tsx) — this only
  // adds a quiet visual flourish on the streak badge for landing back here
  // with today's session freshly done, not a second buzz for the same event.
  const [streakJustPopped, setStreakJustPopped] = useState(false);
  useEffect(() => {
    const c = celebratedRef.current;
    if (!(workoutDoneToday && !c.workout)) {
      if (!workoutDoneToday) c.workout = false;
      return;
    }
    c.workout = true;
    const showTimer = setTimeout(() => setStreakJustPopped(true), 0);
    const hideTimer = setTimeout(() => setStreakJustPopped(false), 1600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [workoutDoneToday]);

  return (
    <AppShell dark>
      <ParticleBurstLayer />

      {/* ------------------------------------------------------- Streak badge */}
      <StreakBadge streak={streak} pulse={streakJustPopped} />

      {/* --------------------------------------------------- Motivation ticker */}
      <MotivationTicker />

      {/* On phones this is just a plain vertical stack. At lg+ it flows into
          two CSS-multicol columns — no DOM reordering, no JS masonry lib,
          each top-level block just gets `lg:break-inside-avoid` so it never
          splits mid-card across the column break. */}
      <div className="lg:columns-2 lg:gap-6">
      {/* ------------------------------------------------- Live Activity rings */}
      <section className="gf-anim-rise mb-6 lg:break-inside-avoid">
        <SectionHeading
          eyebrow="Real-time · on-device"
          title="Live Activity"
          action={
            stepTracker.isTracking ? (
              <Pill tone="lime">
                <span className="gf-anim-pulse size-1.5 rounded-full bg-lime-neon" />
                Live
              </Pill>
            ) : null
          }
        />
        <GlassCard deep className="p-6">
          <ActivityRings metrics={activityMetrics} />

          {!stepTracker.isTracking && (
            <button
              type="button"
              onClick={() => void stepTracker.start()}
              className="gf-glass gf-press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold text-electric"
            >
              <Footprints className="size-4" />
              {stepTracker.permission === "denied"
                ? "Motion access denied — enable it in your browser/OS settings"
                : stepTracker.permission === "unsupported"
                  ? "No motion sensor on this device"
                  : "Enable step tracking"}
            </button>
          )}
          {stepTracker.permission === "unsupported" && (
            <p className="mt-2 text-center text-[11px] text-haze">
              Steps track live from your phone&apos;s own motion sensor — no
              Apple Health or Google Fit account needed, and the readings
              never leave this device.
            </p>
          )}
        </GlassCard>
      </section>

      {/* ------------------------------------------------ Dual progress rings */}
      <GlassCard deep className="gf-anim-rise gf-delay-1 flex items-center gap-6 p-6 lg:break-inside-avoid">
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
      <section className="mt-8 lg:break-inside-avoid">
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
              src="/quiz/workout-preview-plank.png"
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
      <Link href="/workouts" className="mt-5 block lg:break-inside-avoid">
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
      <section className="mt-8 lg:break-inside-avoid">
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
      <Link href="/notifications" className="mt-5 block lg:break-inside-avoid">
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
      </div>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-haze">
        <Timer className="size-3.5" />
        {answers.sessionLength} minute sessions · {answers.daysPerWeek} days a
        week
      </p>
    </AppShell>
  );
}

/** Prominent top-of-dashboard streak callout — pulsing flame glow. Pops with
 * a brief scale animation the moment today's workout is freshly completed.
 * Shows only the streak itself — the program day ("Day N" of the plan) is a
 * different, unrelated counter already shown as its own eyebrow on the
 * Today's Workout card below, so pairing the two numbers in one pill read
 * as one broken stat instead of two separate ones. */
function StreakBadge({ streak, pulse = false }: { streak: number; pulse?: boolean }) {
  return (
    <div
      className={clsx(
        "gf-anim-rise gf-streak-badge mb-5 flex items-center justify-center gap-2.5 rounded-full border border-lime-deep/30 bg-linear-to-r from-lime-neon/10 via-electric/8 to-lime-neon/10 px-5 py-3",
        pulse && "gf-anim-pop",
      )}
    >
      <span className="gf-anim-flicker-flame text-2xl" aria-hidden>
        🔥
      </span>
      {streak > 0 ? (
        <p className="gf-display text-sm font-black tracking-tight text-ink">
          <span className="gf-numeric text-lime-deep">{streak}</span>-day streak
        </p>
      ) : (
        <p className="text-[11px] font-black tracking-[0.1em] text-lime-deep uppercase">
          Start your streak today
        </p>
      )}
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
