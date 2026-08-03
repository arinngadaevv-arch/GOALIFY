"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  Target,
  Timer,
  Trophy,
  X,
} from "lucide-react";
import { useGoalify, todayKey } from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import type { Exercise } from "@/lib/goalify/types";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { VisualSlot } from "@/components/goalify/ui/visual-slot";
import { poseForExercise } from "@/components/goalify/ui/pose-icon";
import { AIFormGuide } from "@/components/goalify/workout/ai-form-guide";
import { useWorkoutSounds } from "@/components/goalify/workout/use-workout-sounds";
import { useHaptics } from "@/lib/goalify/use-haptics";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";
import { Pill, Stat } from "@/components/goalify/ui/stat";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { FloatingStreakBadge } from "@/components/goalify/ui/floating-streak-badge";

type Phase = "watch" | "work" | "rest" | "done";

/** How long the "watch the trainer" preview holds before each set. */
const WATCH_SECONDS = 5;

/** Obsidian-scope ring colors — literal hex since RING_ELECTRIC/RING_LIME
 * are shared constants tuned for the light theme elsewhere in the app. */
const RING_GOLD = "#e8b32c";
const RING_CRIMSON = "#ff3b3b";

export function LivePlayer() {
  const { state, todaysWorkout, completeWorkout } = useGoalify();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("workout");
  const baseWorkout = useMemo(
    () => (selectedId && findWorkout(selectedId)) || todaysWorkout,
    [selectedId, todaysWorkout],
  );
  const workout = useMemo(
    () => resolveWorkout(baseWorkout, state.settings.kneeSafe),
    [baseWorkout, state.settings.kneeSafe],
  );

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("watch");
  const [paused, setPaused] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(WATCH_SECONDS);
  const [reps, setReps] = useState(0);
  /** Briefly true right as "watch" flips to "work" — drives the flash cue. */
  const [flash, setFlash] = useState(false);

  // Mirrors `secondsLeft` so the interval callback can read the live value
  // without re-subscribing every tick. Only ever written outside render.
  const secondsRef = useRef(secondsLeft);
  const setSeconds = useCallback((value: number) => {
    secondsRef.current = value;
    setSecondsLeft(value);
  }, []);

  // `workout` is re-derived from the live store, and completeWorkout()
  // (fired from the completion effect below) advances programDay — which
  // changes todaysWorkout, and therefore this workout's own exercise list,
  // while this component is still mounted showing the "done" screen. The
  // fallback keeps `index` (now possibly stale/out-of-range for the new
  // list) from reading past the end of a shorter next-day workout.
  const exercise = workout.exercises[index] ?? workout.exercises[0];
  const nextExercise = workout.exercises[index + 1];
  const isTimed = exercise.kind === "time";
  const { countdownBeep, exerciseChime, completionCelebration, goCue } =
    useWorkoutSounds();
  const haptics = useHaptics();

  // Real wall-clock session length — set once on mount (inside an effect,
  // since Date.now() can't run during render), read once on completion, so
  // the summary screen shows an actual elapsed time rather than the
  // workout's static planned duration.
  const sessionStartRef = useRef(0);
  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, []);
  // Snapshot of the just-finished session, captured once when phase flips
  // to "done" (see the completion effect below) — completeWorkout() there
  // advances programDay, which flows back through todaysWorkout ->
  // baseWorkout -> this component's `workout`, so reading `workout` live
  // on the completion screen would silently show *tomorrow's* workout's
  // numbers instead of the one the user actually just finished.
  const [completion, setCompletion] = useState<{
    title: string;
    calories: number;
    exerciseCount: number;
    elapsedSeconds: number;
  } | null>(null);

  /* ----------------------------------------------------------- transitions */
  // Every set opens on a WATCH_SECONDS preview of the trainer demonstration
  // before work starts — see the tick effect below for the watch -> work flip.
  const goToExercise = useCallback(
    (nextIndex: number) => {
      const target = workout.exercises[nextIndex];
      if (!target) {
        setPhase("done");
        return;
      }
      setIndex(nextIndex);
      setPhase("watch");
      setReps(0);
      setSeconds(WATCH_SECONDS);
      exerciseChime();
    },
    [workout.exercises, setSeconds, exerciseChime],
  );

  const finishCurrent = useCallback(() => {
    const isLast = index === workout.exercises.length - 1;
    if (isLast) {
      setPhase("done");
      return;
    }
    if (exercise.restSeconds > 0) {
      setPhase("rest");
      setSeconds(exercise.restSeconds);
      return;
    }
    goToExercise(index + 1);
  }, [index, exercise, workout.exercises, goToExercise, setSeconds]);

  /* ------------------------------------------------------------------ tick */
  // The countdown and the phase transition it triggers both live inside the
  // interval callback (not the effect body), so state changes here are a
  // response to the timer firing rather than a synchronous effect cascade.
  useEffect(() => {
    if (phase === "done" || paused) return;
    // Rep-based work has no clock — it advances when the user taps through.
    if (phase === "work" && !isTimed) return;

    const timer = setInterval(() => {
      if (secondsRef.current <= 1) {
        clearInterval(timer);
        if (phase === "watch") {
          // The explosive hand-off — flash + "GO!" cue, then the real set begins.
          setPhase("work");
          setSeconds(isTimed ? exercise.amount : 0);
          goCue();
          setFlash(true);
          window.setTimeout(() => setFlash(false), 700);
        } else if (phase === "work" && isTimed) {
          finishCurrent();
        } else if (phase === "rest") {
          goToExercise(index + 1);
        }
        return;
      }
      const next = secondsRef.current - 1;
      setSeconds(next);
      if (next === 3 || next === 2 || next === 1) countdownBeep(next);
    }, 1000);
    return () => clearInterval(timer);
  }, [
    phase,
    paused,
    isTimed,
    index,
    exercise,
    finishCurrent,
    goToExercise,
    setSeconds,
    countdownBeep,
    goCue,
  ]);

  /* ------------------------------------------------------------ completion */
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase === "done" && !savedRef.current) {
      savedRef.current = true;
      setCompletion({
        title: workout.title,
        calories: workout.calories,
        exerciseCount: workout.exercises.length,
        elapsedSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
      });
      completeWorkout();
      completionCelebration();
      haptics.milestone();
    }
  }, [phase, workout, completeWorkout, completionCelebration, haptics]);

  if (phase === "done") {
    // Falls back to the live `workout` only for the single render before
    // the effect above has run — completion is always populated by the
    // time the user can actually see this screen.
    const snapshot = completion ?? {
      title: workout.title,
      calories: workout.calories,
      exerciseCount: workout.exercises.length,
      elapsedSeconds: 0,
    };
    return (
      <CompletionScreen
        workoutTitle={snapshot.title}
        calories={snapshot.calories}
        exercisesCompleted={snapshot.exerciseCount}
        elapsedSeconds={snapshot.elapsedSeconds}
      />
    );
  }

  const totalProgress = ((index + (phase === "rest" ? 1 : 0)) / workout.exercises.length) * 100;
  const ringValue = phase === "rest"
    ? (secondsLeft / Math.max(1, exercise.restSeconds)) * 100
    : phase === "watch"
      ? (secondsLeft / WATCH_SECONDS) * 100
      : isTimed
        ? (secondsLeft / Math.max(1, exercise.amount)) * 100
        : (reps / Math.max(1, exercise.amount)) * 100;

  return (
    <main className="gf-cyber-scope mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-5 pb-32">
      <ParticleBurstLayer />
      <FloatingStreakBadge />

      {/* ------------------------------------------------------------ Top bar */}
      <header className="flex items-center gap-3">
        <Link
          href="/home"
          aria-label="End workout"
          className="gf-glass gf-press grid size-10 shrink-0 place-items-center rounded-full text-ink-soft"
        >
          <X className="size-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-mist">
            <span className="truncate">{workout.title}</span>
            <span className="gf-numeric shrink-0">
              {index + 1}/{workout.exercises.length}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/6">
            <div
              className="gf-progress-fill h-full rounded-full bg-linear-to-r from-electric to-lime-neon transition-[width] duration-500"
              style={{ width: `${Math.max(4, totalProgress)}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Resume" : "Pause"}
          className="gf-glass gf-press grid size-10 shrink-0 place-items-center rounded-full text-ink-soft"
        >
          {paused ? (
            <Play className="size-5 fill-current" />
          ) : (
            <Pause className="size-5 fill-current" />
          )}
        </button>
      </header>

      {/* --------------------------------------------- Form guide / animation */}
      <GlassCard deep className="mt-5 overflow-hidden p-0">
        <div className="relative">
          <AIFormGuide
            pose={
              phase === "rest"
                ? "mobility"
                : poseForExercise(exercise.name, exercise.focus)
            }
            label={
              phase === "rest"
                ? "Recovery"
                : phase === "watch"
                  ? "Watch & Prepare"
                  : "3D Coach Demonstration"
            }
            hint={
              phase === "rest"
                ? "Coach idle / breathing loop"
                : phase === "watch"
                  ? "Study the form — you're up in a few seconds"
                  : `Looping ${exercise.name.toLowerCase()} demonstration renders here`
            }
            className="h-64 w-full rounded-none sm:h-72"
          />

          <div className="absolute top-3 left-3">
            <span className="gf-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-electric uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-lime-neon shadow-[0_0_8px_var(--color-lime-neon)]" />
              AI Form Guide Active
            </span>
          </div>

          {paused && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
              <div className="text-center">
                <Pause className="mx-auto size-10 text-electric" />
                <p className="gf-display mt-2 text-xl font-black text-ink">
                  Paused
                </p>
              </div>
            </div>
          )}

          {/* Explosive watch -> work hand-off. */}
          {flash && (
            <div
              className="gf-anim-rise absolute inset-0 z-20 grid place-items-center bg-electric/90 backdrop-blur-sm"
              aria-hidden
            >
              <p className="gf-anim-pop gf-display text-4xl font-black text-white italic sm:text-5xl [.gf-cyber-scope_&]:text-[#1a1100]">
                YOUR TURN — GO!
              </p>
            </div>
          )}

          {/* Subtitle cue strip */}
          <div className="absolute inset-x-3 bottom-3">
            <div className="gf-glass rounded-2xl px-4 py-2.5">
              <p className="text-center text-sm leading-snug font-semibold text-ink">
                {phase === "rest"
                  ? "Breathe. Shake it out. Stay standing."
                  : phase === "watch"
                    ? "Watch the form, then it's your turn."
                    : exercise.cue}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* ------------------------------------------------------ Timer / counter */}
      <section className="mt-6 flex flex-col items-center">
        <Pill tone={phase === "rest" ? "lime" : "electric"}>
          {phase === "rest" ? "Rest" : phase === "watch" ? "Watch & Prepare" : exercise.focus}
        </Pill>

        <h1 className="gf-display mt-3 text-center text-3xl font-black text-ink">
          {phase === "rest" ? "Recover" : exercise.name}
        </h1>

        <ProgressRing
          className="mt-6"
          size={216}
          thickness={16}
          rings={[
            {
              value: ringValue,
              color: phase === "rest" ? RING_CRIMSON : RING_GOLD,
              label: "Current",
            },
          ]}
        >
          {phase === "rest" || phase === "watch" || isTimed ? (
            <div>
              <p className="gf-numeric text-6xl font-black text-ink">
                {secondsLeft}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
                {phase === "watch" ? "get ready" : "seconds"}
              </p>
            </div>
          ) : (
            <div>
              <p className="gf-numeric text-6xl font-black text-ink">
                {reps}
                <span className="text-2xl text-mist">/{exercise.amount}</span>
              </p>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
                reps
              </p>
            </div>
          )}
        </ProgressRing>

        {/* Live calorie / exercise tracking — ticks up as the session runs. */}
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <Stat
            value={Math.round((workout.calories * totalProgress) / 100)}
            suffix="kcal"
            label="Burned so far"
            tone="electric"
          />
          <Stat
            value={index + (phase === "rest" ? 1 : 0)}
            suffix={`/${workout.exercises.length}`}
            label="Exercises done"
            tone="lime"
          />
        </div>

        {phase === "work" && !isTimed && (
          <div className="mt-6 flex w-full flex-col items-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                fireBurst(event.clientX, event.clientY);
                setReps((r) => Math.min(exercise.amount, r + 1));
              }}
              className="gf-glass gf-press gf-glow-electric w-full rounded-full bg-electric py-4 text-base font-black tracking-tight text-white [.gf-cyber-scope_&]:text-[#1a1100]"
            >
              COUNT A REP
            </button>
            <button
              type="button"
              onClick={finishCurrent}
              className="text-xs font-bold text-mist underline underline-offset-4"
            >
              Set complete
            </button>
          </div>
        )}
      </section>

      {/* ------------------------------------------------------- Up next card */}
      {nextExercise && (
        <GlassCard className="mt-7 flex items-center gap-4 p-4">
          <VisualSlot
            label="Next"
            emoji="⏭️"
            rounded="rounded-2xl"
            showChrome={false}
            className="size-14 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-electric">
              Up next
            </p>
            <p className="truncate text-sm font-extrabold text-ink">
              {nextExercise.name}
            </p>
            <p className="text-xs text-mist">{describeAmount(nextExercise)}</p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-haze" />
        </GlassCard>
      )}

      {/* --------------------------------------------------- Floating controls */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="gf-glass gf-glass-deep flex items-center gap-2 rounded-full p-2">
          <ControlButton
            label="Previous exercise"
            onClick={() => goToExercise(Math.max(0, index - 1))}
            disabled={index === 0}
          >
            <SkipBack className="size-5 fill-current" />
          </ControlButton>

          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Resume workout" : "Pause workout"}
            className="gf-press gf-glow-electric grid size-16 place-items-center rounded-full bg-electric text-white [.gf-cyber-scope_&]:text-[#1a1100]"
          >
            {paused ? (
              <Play className="size-7 fill-current" />
            ) : (
              <Pause className="size-7 fill-current" />
            )}
          </button>

          <ControlButton
            label="Skip exercise"
            onClick={() =>
              phase === "rest" ? goToExercise(index + 1) : finishCurrent()
            }
          >
            <SkipForward className="size-5 fill-current" />
          </ControlButton>
        </div>
      </div>
    </main>
  );
}

function ControlButton({
  children,
  label,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="gf-press grid size-12 place-items-center rounded-full text-ink-soft transition-colors hover:text-electric disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function describeAmount(exercise: Exercise): string {
  return exercise.kind === "time"
    ? `${exercise.amount} seconds · ${exercise.focus}`
    : `${exercise.amount} reps · ${exercise.focus}`;
}

/** Monday-first week strip so "3/7 done" reads left-to-right like a
 * calendar, independent of the JS Date week (which starts on Sunday). */
function currentWeekDays(): { key: string; label: string; isToday: boolean; isFuture: boolean }[] {
  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayStr = todayKey(now);

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = todayKey(d);
    return { key, label, isToday: key === todayStr, isFuture: key > todayStr };
  });
}

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function SummaryCard({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string | number;
  label: string;
  tone: "electric" | "lime";
}) {
  return (
    <GlassCard deep className="flex flex-col items-start gap-2 p-4">
      <span
        className={
          tone === "electric"
            ? "gf-glow-electric grid size-9 place-items-center rounded-xl bg-electric/15 text-electric"
            : "gf-glow-lime grid size-9 place-items-center rounded-xl bg-lime-neon/15 text-lime-deep"
        }
      >
        <Icon className="size-4.5" strokeWidth={2.4} />
      </span>
      <p className="gf-numeric gf-display text-2xl font-black text-ink">{value}</p>
      <p className="text-[11px] font-bold tracking-[0.08em] text-mist uppercase">
        {label}
      </p>
    </GlassCard>
  );
}

function CompletionScreen({
  workoutTitle,
  calories,
  exercisesCompleted,
  elapsedSeconds,
}: {
  workoutTitle: string;
  calories: number;
  exercisesCompleted: number;
  elapsedSeconds: number;
}) {
  const { streak, state, answers } = useGoalify();

  const weekDays = useMemo(() => currentWeekDays(), []);
  const weekCompletedCount = weekDays.filter((d) =>
    state.completedDays.includes(d.key),
  ).length;
  const weeklyGoalPercent = Math.min(
    100,
    Math.round((weekCompletedCount / Math.max(1, answers.daysPerWeek)) * 100),
  );
  // Every exercise in today's plan was finished to reach this screen at
  // all, so "goal completed" for the session itself is always full —
  // still derived from the real count rather than a hardcoded 100.
  const goalPercent = exercisesCompleted > 0 ? 100 : 0;

  return (
    <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-14 text-center">
      <ParticleBurstLayer />

      {/* --------------------------------------------------- Hero header */}
      <div className="relative -mx-5 min-h-64 overflow-hidden px-5 pt-12 pb-8">
        {/* `.gf-cyber-scope::before` paints the page's ambient glow at
         * z-index: -2 in the isolated stacking context this `<main>`
         * establishes — a negative z-index here (e.g. -z-10) would paint
         * *behind* that layer and be fully hidden, so this stays at the
         * implicit auto/0 stacking order instead and relies on DOM order
         * (painted first, below the trophy/headline siblings after it). */}
        <div className="absolute inset-0 bg-[#0b0e14]" aria-hidden>
          <div className="absolute top-0 right-0 h-full w-[70%] opacity-100">
            <Image
              src="/quiz/goal-burn.png"
              alt=""
              fill
              priority
              className="[mask-image:linear-gradient(115deg,transparent_2%,black_28%,black_100%)] object-cover object-[62%_18%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/25 via-40% to-transparent" />
        </div>

        <div className="relative mx-auto grid size-20 place-items-center">
          <span
            className="gf-anim-burst absolute size-24 rounded-full border-2 border-electric/50"
            aria-hidden
          />
          <div className="gf-glow-electric grid size-16 place-items-center rounded-full bg-electric">
            <Trophy className="size-8 text-white" strokeWidth={2.3} />
          </div>
        </div>

        <h1 className="gf-anim-rise gf-delay-2 gf-display relative mt-5 text-4xl font-black text-ink drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          Workout Complete!
        </h1>
        <p className="gf-anim-rise gf-delay-3 relative mt-2 text-sm font-bold text-electric drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          You showed up. You pushed. You&apos;re stronger.
        </p>
      </div>

      {/* ----------------------------------------------------- Badge card */}
      <GlassCard
        deep
        className="gf-anim-rise gf-delay-4 flex items-center gap-3 p-4 text-left"
      >
        <span className="gf-glow-electric grid size-11 shrink-0 place-items-center rounded-2xl bg-electric">
          <Trophy className="size-5 text-white" strokeWidth={2.4} />
        </span>
        <p className="text-sm leading-snug font-bold text-ink">
          <span className="text-electric">AWESOME WORK!</span> You completed{" "}
          {workoutTitle} like a beast.
        </p>
      </GlassCard>

      {/* -------------------------------------------------- Summary cards */}
      <section className="mt-7 text-left">
        <p className="mb-3 text-[11px] font-black tracking-[0.16em] text-electric uppercase">
          Today&apos;s summary
        </p>
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard icon={Flame} value={calories} label="Calories burned" tone="electric" />
          <SummaryCard icon={Dumbbell} value={exercisesCompleted} label="Exercises" tone="lime" />
          <SummaryCard icon={Timer} value={formatElapsed(elapsedSeconds)} label="Duration" tone="electric" />
          <SummaryCard icon={Target} value={`${goalPercent}%`} label="Goal completed" tone="lime" />
        </div>
      </section>

      {/* --------------------------------------------- Motivation banner */}
      <div className="gf-anim-rise gf-delay-5 relative mt-7 overflow-hidden rounded-3xl p-6">
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-[#3a1a05] via-[#5c2a0a]/70 to-transparent"
          aria-hidden
        />
        <div className="gf-glass absolute inset-0 -z-20" aria-hidden />
        <Sparkles className="mx-auto size-5 text-electric" />
        <p className="gf-display mt-3 text-base leading-relaxed font-bold text-ink">
          &ldquo;Discipline today. Freedom tomorrow. The only bad workout is
          the one you didn&apos;t do.&rdquo;
        </p>
      </div>

      {/* ------------------------------------------------ Weekly progress */}
      <section className="mt-7 text-left">
        <p className="mb-3 text-[11px] font-black tracking-[0.16em] text-electric uppercase">
          Your progress
        </p>
        <GlassCard deep className="flex items-center gap-5 p-5">
          <ProgressRing
            size={96}
            thickness={9}
            rings={[{ value: weeklyGoalPercent, color: "#e8b32c", label: "Week" }]}
          >
            <div>
              <p className="gf-numeric text-xl font-black text-ink">
                {weeklyGoalPercent}%
              </p>
              <p className="text-[8px] font-bold tracking-[0.06em] text-mist uppercase">
                Weekly goal
              </p>
            </div>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-ink-soft">
              {`${weekCompletedCount} of ${answers.daysPerWeek} sessions this week · ${streak} day streak`}
            </p>
            <div className="mt-3 flex justify-between gap-1">
              {weekDays.map((day) => {
                const done = state.completedDays.includes(day.key);
                return (
                  <div key={day.key} className="flex flex-col items-center gap-1">
                    <span
                      className={
                        done
                          ? "gf-glow-electric grid size-7 place-items-center rounded-full bg-electric text-white"
                          : day.isToday
                            ? "grid size-7 place-items-center rounded-full border-2 border-electric/60 text-electric"
                            : "grid size-7 place-items-center rounded-full bg-ink/6 text-haze"
                      }
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
          </div>
        </GlassCard>
      </section>

      {/* --------------------------------------------------------- CTAs */}
      <GlowLink
        href="/home"
        variant="cyber"
        size="xl"
        fullWidth
        pulse
        className="gf-anim-rise gf-delay-6 mt-8 text-lg tracking-tight"
        onClick={(event) => {
          fireBurst(event.clientX, event.clientY, true);
          window.setTimeout(() => fireBurst(event.clientX, event.clientY, false), 90);
        }}
      >
        Keep going <ArrowRight className="size-5" />
      </GlowLink>
      <GlowLink href="/progress" variant="glass" size="md" fullWidth className="mt-3">
        <Calendar className="size-4" /> View workout history <ArrowRight className="size-4" />
      </GlowLink>
    </main>
  );
}
