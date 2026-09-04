"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ArrowRight,
  Beef,
  Bell,
  Check,
  ChevronRight,
  Droplets,
  Flame as FlameIcon,
  Footprints,
  Library,
  Play,
  ShieldCheck,
  Timer,
  Video,
  Zap,
} from "lucide-react";
import {
  ACTIVE_MINUTES_GOAL,
  CALORIE_BURN_GOAL,
  STEP_GOAL,
  useGoalify,
} from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import { goalLabel, weeksToTarget } from "@/lib/goalify/plan";
import { currentWeekDays } from "@/lib/goalify/dates";
import { useHaptics } from "@/lib/goalify/use-haptics";
import { playCompletionCelebration } from "@/lib/goalify/sound";
import { useCountUp, useRevealOnMount } from "@/lib/goalify/use-count-up";
import { AppShell } from "./app-shell";
import { DailyCreed } from "./daily-creed";
import { GlassCard } from "./ui/glass-card";
import { GlowButton, GlowLink } from "./ui/glow-button";
import { VisualSlot } from "./ui/visual-slot";
import { ProgressRing } from "./ui/progress-ring";
import { ActivityRings, type ActivityMetric } from "./ui/activity-rings";
import { Pill, SectionHeading, Stat } from "./ui/stat";
import { fireBurst, ParticleBurstLayer } from "./quiz/particle-burst";

/** Elite-scope ring colors — literal hex since the shared RING_ELECTRIC/
 * RING_LIME constants are tuned for the light theme elsewhere in the app.
 * Gold stays the one hero/brand accent (the weekly goal ring); the three
 * activity rings each get their own real hue — a cool blue, a green, a
 * warm orange — so "steps vs. active minutes vs. calories" reads at a
 * glance instead of three shades of the same gold. */
const RING_GOLD = "#c9a227";
const RING_LIME = "#3ecf8e";
const RING_STEPS = "#5b9bd5";
const RING_CALORIES = "#e3844a";

/** Rough, commonly-cited energy cost per step — enough to make the calorie
 * ring feel alive without pretending to be a calibrated metabolic measure. */
const KCAL_PER_STEP = 0.04;

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
    setSteps,
  } = useGoalify();

  const workout = resolveWorkout(todaysWorkout, state.settings.kneeSafe);
  // Surfaced as a small secondary pick below today's hero card — see the
  // "Day 2 Pick" section below — rather than folded into today's single
  // spotlight slot, since the daily program still owns "today".
  const bonusWorkout = findWorkout("tar2");
  const weeksToGoal = weeksToTarget(answers);

  const weekDays = useMemo(() => currentWeekDays(), []);
  const weekCompletedCount = weekDays.filter((d) =>
    state.completedDays.includes(d.key),
  ).length;
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((weekCompletedCount / Math.max(1, answers.daysPerWeek)) * 100),
  );
  const nutritionPercent = Math.min(
    100,
    Math.round((waterGlasses / targets.waterGlasses) * 100),
  );

  // Arrival animation for the headline numbers — the ring value gets a
  // one-tick-delayed commit so ProgressRing's own CSS transition actually
  // has something to animate from, the paired text counts up independently
  // via rAF so the digits arrive in step with it instead of snapping in.
  const revealedWeeklyPercent = useRevealOnMount(weeklyGoalPercent);
  const displayedWeeklyPercent = useCountUp(weeklyGoalPercent);
  const displayedStreak = useCountUp(streak);

  const [stepInput, setStepInput] = useState("");
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
  // adds a quiet pop to the briefing's streak chip for landing back here
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

      {/* ------------------------------------------------------- Briefing
          One quiet line instead of a pulsing flame banner plus a scrolling
          hype ticker — the day, the plan, and today's one job, read in a
          glance. The streak still gets a moment (a small chip, not a
          section) so the number isn't lost, just no longer shouting. */}
      <div className="gf-reveal mb-7 flex flex-wrap items-start justify-between gap-3">
        <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink-soft">
          Day {state.programDay} of your {goalLabel(answers.goal).toLowerCase()}{" "}
          plan.{" "}
          {workoutDoneToday
            ? "Today's session is done — nice work."
            : `A ${workout.durationMinutes}-minute session is waiting for you.`}
        </p>
        {streak > 0 ? (
          <span
            className={clsx(
              "gf-streak-badge flex shrink-0 items-center gap-1.5 rounded-full border border-electric/25 bg-electric/8 px-3 py-1.5",
              streakJustPopped && "gf-anim-pop",
            )}
          >
            {/* A lucide icon instead of the 🔥 emoji — the emoji renders in
                its own native red-orange, which broke the single gold
                accent language everywhere else on this screen. */}
            <FlameIcon
              className="gf-anim-flicker-flame size-3.5 fill-current text-electric"
              aria-hidden
            />
            <span className="gf-numeric text-xs font-black text-ink">
              {Math.round(displayedStreak)}
            </span>
          </span>
        ) : (
          <Link
            href="/workout/launch"
            className="gf-press flex shrink-0 items-center gap-1.5 rounded-full border border-electric/25 bg-electric/8 px-3 py-1.5"
          >
            <FlameIcon className="size-3.5 fill-current text-electric" aria-hidden />
            <span className="text-[11px] font-black tracking-tight text-electric uppercase">
              Start your streak
            </span>
          </Link>
        )}
      </div>

      {/* --------------------------------------------------- Today's creed */}
      <div className="mb-8">
        <DailyCreed />
      </div>

      {/* ------------------------------------------------ Primary action
          The one thing today actually asks of the user, spanning full
          width — bigger, calmer presence than squeezed into a half-width
          column, and it means nothing sits crammed directly underneath it
          in a narrow column of its own. Everything else on this screen is
          context; this is the job. */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Today"
          title="Your Workout"
          action={
            state.settings.kneeSafe ? (
              <Pill tone="lime">
                <ShieldCheck className="size-3" strokeWidth={3} />
                Knee-safe
              </Pill>
            ) : null
          }
        />

        <div className="relative">
          {/* Ambient glow — a soft bloom behind the one card the whole
              screen is pointing at, so it reads as alive/clickable instead
              of just another box in a list. */}
          <div
            className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-electric/18 opacity-70 blur-3xl"
            aria-hidden
          />
          <GlassCard
            deep
            className="gf-reveal overflow-hidden p-0 lg:flex lg:items-stretch"
          >
          <div className="relative lg:w-2/5 lg:shrink-0">
            <VisualSlot
              label="Workout Preview"
              hint="3D coach loop for this session"
              src="/quiz/workout-preview-plank.png"
              rounded="rounded-none"
              className="h-44 w-full lg:h-full"
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

          <div className="p-6 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
            <h3 className="gf-display text-2xl font-black text-ink">
              {workout.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">
              {workout.subtitle}
            </p>

            <div className="mt-5 grid grid-cols-3 divide-x divide-ink/8 rounded-3xl bg-black/20 p-5">
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
              variant={workoutDoneToday ? "glass" : "electric"}
              className="mt-5 gap-2 tracking-tight"
            >
              {workoutDoneToday ? (
                <>
                  <Play className="size-5 fill-current" />
                  TRAIN AGAIN
                </>
              ) : (
                <>
                  START {workout.durationMinutes}-MIN SESSION
                  <ArrowRight className="size-5" />
                </>
              )}
            </GlowLink>
          </div>
          </GlassCard>
        </div>
      </section>

      {/* On phones this is just a plain vertical stack — the two column
          wrapper divs below just stack on top of each other, in the same
          order as their contents were always in. At lg+ it becomes two
          real columns, each stacking its own contents top-down with one
          consistent, generous gap. This used to be a CSS `columns-2`
          masonry flow, which balances *total height* across columns
          rather than filling each one from the top — with blocks this
          uneven in height that reliably left one column visibly shorter
          than the other, a ragged, unbalanced-looking gap at the bottom
          of the shorter one. Manually grouping into two explicit columns
          doesn't have that failure mode: each one just fills from the
          top. */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      <div className="flex flex-col gap-10">
      {/* ------------------------------------------------- Bonus workout pick
          A small, secondary card — deliberately not competing with the
          hero above, which still owns "today". Lets someone see there's a
          second workout worth trying without it stealing today's single
          spotlight slot. */}
      {bonusWorkout && (
        <section>
          <SectionHeading eyebrow="Also available" title="Day 2 Pick" />
          <Link href={`/workout/launch?workout=${bonusWorkout.id}`} className="block">
            <GlassCard deep interactive className="gf-reveal flex items-center gap-4 p-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-electric/10">
                <Video className="size-7 text-electric" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-[0.16em] text-electric uppercase">
                  Follow-along video
                </p>
                <p className="truncate text-base font-extrabold text-ink">
                  {bonusWorkout.title}
                </p>
                <p className="truncate text-xs text-mist">{bonusWorkout.subtitle}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-haze" />
            </GlassCard>
          </Link>
        </section>
      )}

      {/* ---------------------------------------------------- Your progress
          Replaces three separate cards (goal readout, dual today-rings,
          weekly ring) with one: streak, weight trend, and the week's shape
          all live here, one tap through to the full history on Progress. */}
      <section>
        <SectionHeading
          eyebrow="Your progress"
          title="This Week"
          action={
            <Pill tone={weekCompletedCount > 0 ? "lime" : "electric"}>
              {weekCompletedCount}/{answers.daysPerWeek} sessions
            </Pill>
          }
        />
        <Link href="/progress" className="block">
          <GlassCard deep interactive className="gf-reveal p-6">
            <div className="flex items-center gap-5">
              <ProgressRing
                size={88}
                thickness={9}
                rings={[
                  {
                    value: revealedWeeklyPercent,
                    color: RING_GOLD,
                    label: "Week",
                    // See activity-rings.tsx — ProgressRing's default track
                    // is a light-theme tint, nearly invisible on this
                    // scope's black canvas at 0%.
                    trackColor: `${RING_GOLD}26`,
                  },
                ]}
              >
                <div>
                  {weeklyGoalPercent > 0 ? (
                    <>
                      <p className="gf-numeric text-lg font-black text-ink">
                        {Math.round(displayedWeeklyPercent)}%
                      </p>
                      <p className="text-[8px] font-bold tracking-[0.06em] text-mist uppercase">
                        Weekly goal
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="gf-display text-xs font-black text-ink">
                        Let&apos;s go
                      </p>
                      <p className="text-[8px] font-bold tracking-[0.06em] text-mist uppercase">
                        This week
                      </p>
                    </>
                  )}
                </div>
              </ProgressRing>

              <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
                <Stat value={answers.weightKg} suffix="kg" label="Current" />
                <Stat
                  value={answers.targetWeightKg}
                  suffix="kg"
                  label="Target"
                  tone="lime"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-4">
              {weekDays.map((day) => {
                const done = state.completedDays.includes(day.key);
                return (
                  <div key={day.key} className="flex flex-col items-center gap-1">
                    <span
                      className={clsx(
                        "grid size-7 place-items-center rounded-full",
                        done
                          ? "gf-glow-electric bg-electric text-white"
                          : day.isToday
                            ? "gf-glow-electric border-2 border-electric text-electric"
                            : "bg-ink/6 text-haze",
                      )}
                    >
                      {done ? (
                        <Check className="size-3.5" strokeWidth={3.5} />
                      ) : (
                        <span className="text-[10px] font-bold">{day.label}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-3 text-center text-xs text-haze">
              {weeksToGoal > 0 ? `~${weeksToGoal} weeks to target` : "At target"}
              {" · "}see your full trendline &amp; trophy shelf →
            </p>
          </GlassCard>
        </Link>
      </section>

      {/* ------------------------------------------------------ Library link */}
      <Link href="/workouts" className="block">
        <GlassCard
          tone="lime"
          interactive
          className="gf-reveal relative flex items-center gap-4 overflow-hidden p-5"
        >
          <div
            className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-lime-neon/20 blur-3xl"
            aria-hidden
          />
          <span className="gf-glow-lime relative grid size-11 shrink-0 place-items-center rounded-2xl bg-lime-neon">
            <Library className="size-5 text-ink" />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">
              Explore more workouts
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Full Body Burn, Core Crusher, Lower Body &amp; Joints Safe.
            </p>
          </div>
          <ArrowRight className="relative size-4 shrink-0 text-lime-deep" />
        </GlassCard>
      </Link>

      {/* ------------------------------------------------------ Reminders link */}
      <Link href="/notifications" className="block">
        <GlassCard
          tone="electric"
          interactive
          className="gf-reveal relative flex items-center gap-4 overflow-hidden p-5"
        >
          <div
            className="pointer-events-none absolute -top-8 -right-8 size-28 rounded-full bg-electric/25 blur-3xl"
            aria-hidden
          />
          <span className="gf-glow-electric relative grid size-11 shrink-0 place-items-center rounded-2xl bg-electric">
            <Bell className="size-5 text-white" />
          </span>
          <div className="relative min-w-0 flex-1">
            <p className="text-sm font-extrabold text-ink">
              Your daily reminders
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">
              4 nudges a day — motivation, food, water, workout.
            </p>
          </div>
          <ArrowRight className="relative size-4 shrink-0 text-electric" />
        </GlassCard>
      </Link>
      </div>

      <div className="flex flex-col gap-10">
      {/* ----------------------------------------------------- Today's Activity
          Used to auto-track steps live via the phone's motion sensor, but
          iOS Safari makes you re-grant that permission on every single
          visit (no persisted per-site grant the way camera/mic get) — that
          read as "broken," not "needs a tap," so this is a quick manual
          update instead: copy the number your phone already has. */}
      <section>
        <SectionHeading eyebrow="From your phone" title="Today's Activity" />
        <GlassCard deep className="gf-reveal p-6">
          <ActivityRings metrics={activityMetrics} />

          {/* A real label instead of leaning on the input's own placeholder
              — a placeholder disappears the moment you start typing, so it
              can't double as the field's only description. */}
          <p className="mt-5 mb-2 text-[11px] font-bold tracking-[0.14em] text-mist uppercase">
            Log today&apos;s steps
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              value={stepInput}
              onChange={(event) => setStepInput(event.target.value)}
              placeholder={steps > 0 ? steps.toLocaleString() : "e.g. 6,234"}
              className="gf-glass min-w-0 flex-1 rounded-full px-5 py-3 text-sm font-bold text-ink placeholder:text-haze focus:outline-none"
            />
            <GlowButton
              variant="electric"
              size="md"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => {
                const parsed = Number(stepInput);
                if (Number.isFinite(parsed) && parsed >= 0) {
                  setSteps(parsed);
                  setStepInput("");
                }
              }}
            >
              <Footprints className="size-4" />
              Update
            </GlowButton>
          </div>

          {/* Quick taps for the common case — bumping today's count by a
              round number — without needing to type an exact figure. Equal-
              width grid instead of a packed inline row, so each target
              stays comfortably tappable on a narrow screen. */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[1000, 2500, 5000].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSteps(steps + amount);
                  setStepInput("");
                }}
                className="gf-press gf-glass rounded-full py-2 text-center text-[11px] font-bold text-ink-soft"
              >
                +{amount.toLocaleString()}
              </button>
            ))}
          </div>

          <p className="mt-3 text-center text-[11px] text-haze">
            Copy today&apos;s step count from your phone&apos;s Health app —
            nothing ever leaves this device.
          </p>
        </GlassCard>
      </section>

      {/* ----------------------------------------------- Nutrition targets card */}
      <section>
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

        <GlassCard deep className="gf-reveal p-6">
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
      </div>
      </div>

      <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-haze">
        <Timer className="size-3.5" />
        {answers.sessionLength} minute sessions · {answers.daysPerWeek} days a
        week
      </p>
    </AppShell>
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
