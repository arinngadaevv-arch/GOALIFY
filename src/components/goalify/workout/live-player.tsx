"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  Dumbbell,
  Flame,
  Sparkles,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import { BADGES } from "@/lib/goalify/badges";
import { currentWeekDays } from "@/lib/goalify/dates";
import type { Exercise } from "@/lib/goalify/types";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { IconBadge } from "@/components/goalify/ui/icon-badge";
import { ReviewPrompt } from "@/components/goalify/review-prompt";
import { poseForExercise } from "@/components/goalify/ui/pose-icon";
import { useWorkoutSounds } from "@/components/goalify/workout/use-workout-sounds";
import { useHaptics } from "@/lib/goalify/use-haptics";
import {
  exerciseVideoUrl,
  introVideoUrl,
  restVideoUrl,
} from "@/lib/goalify/video";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { FloatingStreakBadge } from "@/components/goalify/ui/floating-streak-badge";
import { WorkoutHeader } from "@/components/goalify/workout/workout-header";
import { ExerciseMedia } from "@/components/goalify/workout/exercise-media";
import { ExerciseInfo } from "@/components/goalify/workout/exercise-info";
import { WorkoutTimer } from "@/components/goalify/workout/workout-timer";
import { WorkoutControls } from "@/components/goalify/workout/workout-controls";
import { WorkoutStats } from "@/components/goalify/workout/workout-stats";
import { UpNext } from "@/components/goalify/workout/up-next";

type Phase = "watch" | "work" | "rest" | "done";

/** A rep-based set has no clock of its own — this is a deliberate estimate
 * (a controlled tempo, roughly) so it can still run through the same
 * countdown/auto-advance machinery as a timed set instead of needing a
 * separate manual tap-per-rep interaction, which is unusable while your
 * hands are actually busy doing the exercise. WorkoutTimer's `hint` makes
 * clear this is an approximation, not a tracked rep count. */
const SECONDS_PER_REP = 3;

/** Obsidian-scope ring colors — literal hex since RING_ELECTRIC/RING_LIME
 * are shared constants tuned for the light theme elsewhere in the app.
 * Exported and reused by video-led-player.tsx, so these stay on the
 * original gold/crimson pair even though LivePlayer() itself now sources
 * its own ring colors through WorkoutTimer instead of these. */
export const RING_GOLD = "#e8b32c";
export const RING_CRIMSON = "#ff3b3b";

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
  const [secondsLeft, setSecondsLeft] = useState(0);
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
  // The number the "work" countdown actually runs on — a real clock for a
  // timed set, an estimate for a rep-based one (see SECONDS_PER_REP).
  const workSeconds = isTimed
    ? exercise.amount
    : Math.max(10, Math.round(exercise.amount * SECONDS_PER_REP));
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
    sessionsBefore: number;
  } | null>(null);

  /* ----------------------------------------------------------- transitions */
  // Every set opens on a "watch" preview of the trainer demonstration and
  // waits there — no auto-countdown — until the user taps Start (see
  // startExercise below), so nothing ever begins without the user
  // deliberately choosing to begin it.
  const goToExercise = useCallback(
    (nextIndex: number) => {
      const target = workout.exercises[nextIndex];
      if (!target) {
        setPhase("done");
        return;
      }
      setIndex(nextIndex);
      setPhase("watch");
      exerciseChime();
    },
    [workout.exercises, exerciseChime],
  );

  /** The explosive hand-off from "watch" to "work" — triggered only by the
   * user tapping Start, never automatically. */
  const startExercise = useCallback(() => {
    setPhase("work");
    setSeconds(workSeconds);
    goCue();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  }, [workSeconds, setSeconds, goCue]);

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

  /** Nudges the running clock — the interval reads `secondsRef` fresh on
   * its next tick, so this doesn't need to touch the interval itself. */
  const addSeconds = useCallback(
    (delta: number) => setSeconds(Math.max(0, secondsRef.current + delta)),
    [setSeconds],
  );

  /* ------------------------------------------------------------------ tick */
  // The countdown and the phase transition it triggers both live inside the
  // interval callback (not the effect body), so state changes here are a
  // response to the timer firing rather than a synchronous effect cascade.
  useEffect(() => {
    if (phase === "done" || paused) return;
    // "watch" waits on a Start tap (see startExercise) instead of
    // auto-counting down — everything past that point (both timed and
    // estimated-from-reps work, plus rest) runs the same real countdown.
    if (phase === "watch") return;

    const timer = setInterval(() => {
      if (secondsRef.current <= 1) {
        clearInterval(timer);
        if (phase === "work") {
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
    index,
    finishCurrent,
    goToExercise,
    setSeconds,
    countdownBeep,
  ]);

  /* ------------------------------------------------------------ completion */
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase === "done" && !savedRef.current) {
      savedRef.current = true;
      // Read before completeWorkout() writes today's date in, so
      // CompletionScreen can tell a badge threshold was *just* crossed
      // (state.completedDays.length going e.g. 6 -> 7) apart from one
      // that was already earned on an earlier day this streak.
      setCompletion({
        title: workout.title,
        calories: workout.calories,
        exerciseCount: workout.exercises.length,
        elapsedSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
        sessionsBefore: state.completedDays.length,
      });
      completeWorkout();
      completionCelebration();
      haptics.milestone();
    }
  }, [phase, workout, state.completedDays.length, completeWorkout, completionCelebration, haptics]);

  if (phase === "done") {
    // Falls back to the live `workout` only for the single render before
    // the effect above has run — completion is always populated by the
    // time the user can actually see this screen.
    const snapshot = completion ?? {
      title: workout.title,
      calories: workout.calories,
      exerciseCount: workout.exercises.length,
      elapsedSeconds: 0,
      sessionsBefore: state.completedDays.length,
    };
    return (
      <CompletionScreen
        workoutTitle={snapshot.title}
        calories={snapshot.calories}
        exercisesCompleted={snapshot.exerciseCount}
        elapsedSeconds={snapshot.elapsedSeconds}
        sessionsBefore={snapshot.sessionsBefore}
      />
    );
  }

  const totalProgress = ((index + (phase === "rest" ? 1 : 0)) / workout.exercises.length) * 100;
  // Real clips from Supabase Storage (see lib/goalify/video.ts): the
  // very first watch beat gets the workout's intro, rest breaks get the
  // water clip, and every other watch/work beat gets whichever uploaded
  // clip matches this exercise's name/focus (only a handful of named clips
  // exist, not one per exercise — exerciseVideoUrl resolves to null for
  // anything unmatched). Also resolves to null whenever
  // NEXT_PUBLIC_SUPABASE_URL isn't configured — either way the pose-icon
  // placeholder is the fallback.
  const videoSrc =
    phase === "rest"
      ? restVideoUrl()
      : phase === "watch" && index === 0
        ? introVideoUrl()
        : exerciseVideoUrl(exercise.name, exercise.focus);
  // "watch" has no clock (waits on the Start tap below) — the ring just
  // sits fully charged, reading as "ready to go." Work and rest are both
  // real countdowns now (work's target is workSeconds, timed or estimated).
  const ringValue =
    phase === "rest"
      ? (secondsLeft / Math.max(1, exercise.restSeconds)) * 100
      : phase === "watch"
        ? 100
        : (secondsLeft / Math.max(1, workSeconds)) * 100;
  // The number shown: a live countdown once something's running, or a
  // static preview of the target duration while still on "watch".
  const displaySeconds = phase === "watch" ? workSeconds : secondsLeft;
  // A rep-based set's countdown is an estimate, not a tracked count — this
  // keeps that honest instead of presenting it as an exact clock.
  const timerHint =
    phase !== "rest" && !isTimed ? `~${exercise.amount} reps` : undefined;
  // The last few seconds of a running countdown get a quiet pulse — never
  // during "watch" (nothing's actually counting down yet) or while paused.
  const urgent =
    (phase === "work" || phase === "rest") &&
    !paused &&
    secondsLeft > 0 &&
    secondsLeft <= 5;

  return (
    <main className="gf-cyber-scope gf-live-industrial mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-2 pb-12 lg:max-w-5xl lg:pb-16 xl:max-w-6xl 2xl:max-w-7xl">
      <FloatingStreakBadge />

      {/* ------------------------------------------------------------ Top bar
          Just exit + position — everything else about transport (pause,
          skip, +15s) now lives with the timer, not up here. */}
      <WorkoutHeader
        category={workout.title}
        current={index + 1}
        total={workout.exercises.length}
        backHref="/home"
        backLabel="End workout"
      />
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-ink/6">
        <div
          className="gf-progress-fill h-full rounded-full bg-linear-to-r from-[#f0c878] to-[#9c7530] transition-[width] duration-500"
          style={{ width: `${Math.max(4, totalProgress)}%` }}
        />
      </div>

      <div className="mt-5 lg:flex lg:items-start lg:gap-12">
        {/* The dominant element on the screen — bled to the screen edges
            on mobile, cinematic and unmissable, the first thing the eye
            lands on at every breakpoint. */}
        <ExerciseMedia
          className="-mx-5 h-[clamp(11rem,29dvh,18rem)] w-[calc(100%+2.5rem)] min-[390px]:h-[clamp(15rem,42dvh,27rem)] lg:mx-0 lg:h-[min(76dvh,44rem)] lg:w-[63%] lg:shrink-0"
          pose={
            phase === "rest"
              ? "mobility"
              : poseForExercise(exercise.name, exercise.focus)
          }
          videoSrc={videoSrc}
          formTip={phase === "work" ? exercise.cue : undefined}
          paused={paused}
          flash={flash}
        />

        {/* Everything else — title, timer, controls, supporting info — in
            one column, mirrored to the right of the video at `lg+`. */}
        <div className="mt-4 flex flex-col items-center lg:mt-0 lg:flex-1 lg:items-stretch lg:justify-center lg:self-stretch lg:text-left">
          <ExerciseInfo
            className="lg:text-left"
            category={phase === "rest" ? "Rest" : phase === "watch" ? "Watch & prepare" : exercise.focus}
            name={phase === "rest" ? "Recover" : exercise.name}
            cue={
              phase === "rest"
                ? "Breathe. Shake it out. Stay standing."
                : phase === "watch"
                  ? index === 0
                    ? // Only on the very first exercise of the session —
                      // once someone's been through the watch -> start ->
                      // auto-advance loop once, repeating it before every
                      // single exercise would just be noise.
                      "Tap below to begin — we'll guide you through automatically."
                    : "Watch the form, then tap below when you're ready."
                  : undefined
            }
          />

          <WorkoutTimer
            className="mt-3"
            seconds={displaySeconds}
            value={ringValue}
            animated={phase !== "watch"}
            variant={phase === "rest" ? "crimson" : "gold"}
            hint={timerHint}
            live={phase !== "watch" && !paused}
            urgent={urgent}
          />

          <WorkoutControls
            className="mt-3"
            phase={phase === "watch" ? "watch" : "active"}
            paused={paused}
            onStart={startExercise}
            onTogglePause={() => setPaused((p) => !p)}
            onAddSeconds={addSeconds}
            onSkip={() => goToExercise(index + 1)}
          />

          <WorkoutStats
            className="mt-9"
            calories={Math.round((workout.calories * totalProgress) / 100)}
            completed={index + (phase === "rest" ? 1 : 0)}
            total={workout.exercises.length}
          />

          {nextExercise && (
            <UpNext
              className="mt-5 w-full"
              exercise={nextExercise}
              detail={describeAmount(nextExercise)}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function describeAmount(exercise: Exercise): string {
  return exercise.kind === "time"
    ? `${exercise.amount} seconds · ${exercise.focus}`
    : `${exercise.amount} reps · ${exercise.focus}`;
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

export function CompletionScreen({
  workoutTitle,
  calories,
  exercisesCompleted,
  elapsedSeconds,
  sessionsBefore,
}: {
  workoutTitle: string;
  calories: number;
  exercisesCompleted: number;
  elapsedSeconds: number;
  sessionsBefore: number;
}) {
  const { streak, state, answers } = useGoalify();

  // completedDays only ever grows by one entry per calendar day, so at
  // most a single threshold in BADGES can sit in the (sessionsBefore,
  // completedSessions] range this session just crossed.
  const completedSessions = state.completedDays.length;
  const newBadge = BADGES.find(
    (badge) => badge.requirement > sessionsBefore && badge.requirement <= completedSessions,
  );

  // Decided once, on mount, rather than read live off `state` on every
  // render — ReviewPrompt's own submit handler flips
  // state.reviewPromptDismissed the instant it succeeds, which would
  // otherwise unmount this the same instant and skip straight past its
  // "Thanks" confirmation before the user ever sees it.
  const [showReviewPrompt] = useState(
    () => completedSessions >= 3 && !state.reviewPromptDismissed,
  );

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

      {/* ------------------------------------------------ New badge unlock
          The trophy shelf on the Progress screen already shows every badge
          earned, but nothing ever told the user *when* they crossed one —
          the reward landed silently on a screen they might not open for
          days. Surfacing it here, at the exact moment of the dopamine hit
          the workout just gave them, is what actually reinforces the habit
          (only ever renders for the single session that crossed a new
          threshold, never retroactively on a later one). */}
      {newBadge && (
        <GlassCard
          tone="electric"
          className="gf-anim-rise gf-anim-pulse gf-delay-4 flex items-center gap-3 p-4 text-left"
        >
          <IconBadge icon={newBadge.icon} size="md" active />
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black tracking-[0.14em] text-electric uppercase">
              New badge unlocked
            </p>
            <p className="text-sm leading-snug font-bold text-ink">
              {newBadge.name} — {newBadge.requirement} session
              {newBadge.requirement === 1 ? "" : "s"} logged.
            </p>
          </div>
        </GlassCard>
      )}

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
            rings={[
              {
                value: weeklyGoalPercent,
                color: "#e8b32c",
                label: "Week",
                // See activity-rings.tsx — ProgressRing's default track is
                // a light-theme tint, nearly invisible on this obsidian
                // scope's black canvas at 0%.
                trackColor: "#e8b32c26",
              },
            ]}
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

      {showReviewPrompt && <ReviewPrompt />}

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
