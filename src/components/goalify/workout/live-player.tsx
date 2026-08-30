"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
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
import { useGoalify } from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import { BADGES } from "@/lib/goalify/badges";
import { currentWeekDays } from "@/lib/goalify/dates";
import type { Exercise } from "@/lib/goalify/types";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { IconBadge } from "@/components/goalify/ui/icon-badge";
import { ReviewPrompt } from "@/components/goalify/review-prompt";
import { PoseIcon, poseForExercise } from "@/components/goalify/ui/pose-icon";
import { AIFormGuide } from "@/components/goalify/workout/ai-form-guide";
import { useWorkoutSounds } from "@/components/goalify/workout/use-workout-sounds";
import { useHaptics } from "@/lib/goalify/use-haptics";
import {
  exerciseVideoUrl,
  introVideoUrl,
  restVideoUrl,
} from "@/lib/goalify/video";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";
import { Pill, Stat } from "@/components/goalify/ui/stat";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { FloatingStreakBadge } from "@/components/goalify/ui/floating-streak-badge";

type Phase = "watch" | "work" | "rest" | "done";

/** Obsidian-scope ring colors — literal hex since RING_ELECTRIC/RING_LIME
 * are shared constants tuned for the light theme elsewhere in the app.
 * Exported and reused by video-led-player.tsx, so these stay on the
 * original gold/crimson pair — the industrial restyle below is local to
 * this file's own LivePlayer() only. */
export const RING_GOLD = "#e8b32c";
export const RING_CRIMSON = "#ff3b3b";

/** Brushed-steel ring gradient for LivePlayer's "Masculine Tech" restyle —
 * an SVG-only id, injected via a zero-size <svg><defs> in the component
 * (see HUB_GRADIENT_ID below), never touching the exported RING_GOLD. */
const HUB_GRADIENT_ID = "gf-live-hub-ring";

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
      setReps(0);
      exerciseChime();
    },
    [workout.exercises, exerciseChime],
  );

  /** The explosive hand-off from "watch" to "work" — triggered only by the
   * user tapping Start, never automatically. */
  const startExercise = useCallback(() => {
    setPhase("work");
    setSeconds(isTimed ? exercise.amount : 0);
    goCue();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 700);
  }, [isTimed, exercise, setSeconds, goCue]);

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
    // "watch" now waits on a Start tap (see startExercise) instead of
    // auto-counting down, and rep-based work has no clock at all — it
    // advances when the user taps through.
    if (phase === "watch") return;
    if (phase === "work" && !isTimed) return;

    const timer = setInterval(() => {
      if (secondsRef.current <= 1) {
        clearInterval(timer);
        if (phase === "work" && isTimed) {
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
  // The only phase with no clock behind it — reps advance on a tap, not a
  // tick, so the ring for it should pop to its new value rather than sweep
  // like a countdown (see the ProgressRing transitionMs/easing override below).
  const isRepCounting = phase === "work" && !isTimed;
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
  // "watch" has no clock anymore (waits on the Start tap below) — the ring
  // just sits fully charged, reading as "ready to go" rather than counting
  // down to nothing.
  const ringValue = phase === "rest"
    ? (secondsLeft / Math.max(1, exercise.restSeconds)) * 100
    : phase === "watch"
      ? 100
      : isTimed
        ? (secondsLeft / Math.max(1, exercise.amount)) * 100
        : (reps / Math.max(1, exercise.amount)) * 100;

  return (
    <main className="gf-cyber-scope gf-live-industrial mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-5 pb-48">
      {/* Zero-size — exists only so the brushed-steel ring gradient below
          has a <defs> to live in; ProgressRing's `color` prop passes
          straight into an SVG `stroke`, so `url(#...)` resolves fine even
          though the gradient itself is declared in a sibling <svg>. */}
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id={HUB_GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e7ebee" />
            <stop offset="45%" stopColor="#aab2ba" />
            <stop offset="100%" stopColor="#565b61" />
          </linearGradient>
        </defs>
      </svg>
      <ParticleBurstLayer />
      <FloatingStreakBadge />

      {/* ------------------------------------------------------------ Top bar
          Just exit + progress here — pause/resume lives in exactly one
          place, the big control at the bottom thumb zone, so there's never
          a moment with two different buttons claiming to do the same thing. */}
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
              className="gf-progress-fill h-full rounded-full bg-linear-to-r from-[#c7ced4] to-[#6e747a] transition-[width] duration-500"
              style={{ width: `${Math.max(4, totalProgress)}%` }}
            />
          </div>
        </div>
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
                  ? "Study the form, then tap Start below when you're ready"
                  : `${exercise.name} demonstration loop`
            }
            videoSrc={videoSrc}
            // Scales with viewport *height*, not just width — on a short
            // phone (or a two-line exercise name pushing everything below
            // it down further) a flat h-64 left the ring's own countdown/
            // Start button sitting in the same screen band as the fixed
            // bottom transport controls, visually fusing into one
            // confusing cluster. Shrinking this first (it's the single
            // biggest, purely decorative block above the ring) buys back
            // that clearance automatically, in proportion to how short the
            // viewport actually is, instead of a fixed breakpoint that
            // only covers the phone sizes tested against.
            className="h-[clamp(5rem,14dvh,16rem)] w-full rounded-none sm:h-72"
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
        </div>
      </GlassCard>

      {/* ------------------------------------------------------ Timer / counter
          Single, unambiguous focal point: phase pill, then the exercise
          name — big and centered, so it's the first thing read — then one
          line of coaching context, then the ring. Nothing else competes for
          attention here; the cue text that used to float on top of the
          video above now lives in exactly one place. */}
      <section className="mt-4 flex flex-col items-center">
        <Pill tone={phase === "rest" ? "lime" : "electric"}>
          {phase === "rest" ? "Rest" : phase === "watch" ? "Watch & Prepare" : exercise.focus}
        </Pill>

        <h1 className="gf-display mt-2 text-center text-4xl leading-tight font-black text-ink sm:text-5xl">
          {phase === "rest" ? "Recover" : exercise.name}
        </h1>

        <p className="mt-1 max-w-xs text-center text-sm leading-snug font-semibold text-mist">
          {phase === "rest"
            ? "Breathe. Shake it out. Stay standing."
            : phase === "watch"
              ? "Watch the form, then tap Start when you're ready."
              : exercise.cue}
        </p>

        {/* Soft ambient halo behind the ring, colored to match its phase —
            makes the ring itself read as the dominant, spotlit element on
            the screen instead of just another UI control, without adding
            any extra shapes/icons that would clutter it. */}
        <div className="relative mt-1 grid place-items-center">
          <div
            className={clsx(
              "absolute inset-0 -m-6 rounded-full blur-3xl",
              phase === "rest" ? "bg-[#ff3b3b]/25" : "bg-[#aab2ba]/20",
            )}
            aria-hidden
          />
          <ProgressRing
            className="relative"
            size={180}
            thickness={14}
            // A real per-second countdown (rest / timed work) gets a linear,
            // tick-synced sweep so the ring visibly closes in step with the
            // clock; "watch" is static (waiting on the Start tap) and
            // rep-based work has no clock, so both just pop with the
            // default snappy easing instead.
            {...(isRepCounting || phase === "watch"
              ? {}
              : { transitionMs: 1000, easing: "linear" })}
            rings={[
              {
                value: ringValue,
                color: phase === "rest" ? RING_CRIMSON : `url(#${HUB_GRADIENT_ID})`,
                label: "Current",
              },
            ]}
          >
            {phase === "watch" ? (
              <button
                type="button"
                onClick={startExercise}
                aria-label="Start this exercise"
                className="gf-press gf-hub-button flex flex-col items-center gap-1.5 rounded-full px-8 py-7"
              >
                <Play className="size-9 fill-current" />
                <span className="text-sm font-black tracking-[0.08em] uppercase">
                  Start
                </span>
              </button>
            ) : phase === "rest" || isTimed ? (
              <div>
                <p className="gf-numeric text-6xl font-black text-ink">
                  {secondsLeft}
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
                  seconds
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
        </div>

        {/* Live calorie / exercise tracking — each value pops on change (the
            `key` remount replays `gf-anim-pop`) so ticking up reads as a
            live, alive counter rather than a static number that jumps. */}
        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div key={`cal-${Math.round((workout.calories * totalProgress) / 100)}`} className="gf-anim-pop">
            <Stat
              value={Math.round((workout.calories * totalProgress) / 100)}
              suffix="kcal"
              label="Burned so far"
              tone="electric"
            />
          </div>
          <div key={`done-${index + (phase === "rest" ? 1 : 0)}`} className="gf-anim-pop">
            <Stat
              value={index + (phase === "rest" ? 1 : 0)}
              suffix={`/${workout.exercises.length}`}
              label="Exercises done"
              tone="lime"
            />
          </div>
        </div>

        {phase === "work" && !isTimed && (
          <div className="mt-6 flex w-full flex-col items-center gap-3">
            <button
              type="button"
              onClick={(event) => {
                fireBurst(event.clientX, event.clientY);
                setReps((r) => Math.min(exercise.amount, r + 1));
              }}
              className="gf-press gf-glow-electric w-full rounded-full bg-electric py-4 text-base font-black tracking-tight text-white [.gf-cyber-scope_&]:text-[#1a1100]"
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
          {/* Same pose-icon language as the big AIFormGuide preview above,
              just smaller — a real preview of the next movement instead of
              a generic "next" glyph. */}
          <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-electric/10">
            <PoseIcon
              pose={poseForExercise(nextExercise.name, nextExercise.focus)}
              className="size-10"
            />
          </div>
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

      {/* --------------------------------------------------- Floating controls
          The one control surface in the whole screen — big, centered,
          squarely in the bottom thumb zone. Play/pause is the largest and
          most central target since it's the one you'll reach for mid-rep,
          sweaty and not looking; prev/next flank it, still comfortably
          above the 44px touch-target minimum. */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="gf-glass gf-glass-deep flex items-center gap-3 rounded-full p-2.5">
          <ControlButton
            label="Previous exercise"
            onClick={() => goToExercise(Math.max(0, index - 1))}
            disabled={index === 0}
          >
            <SkipBack className="size-5.5 fill-current" />
          </ControlButton>

          {/* Before Start is tapped there's nothing to pause yet — a Pause
              icon here (as if a session were already running) read as a
              second control arguing with the ring's own Start button right
              above it. Rather than swap in a matching Play icon (still two
              buttons claiming the same job), "watch" simply doesn't render
              this one at all — the ring's Start button is the one action
              on screen until there's an actual session for this control to
              transport. */}
          {phase !== "watch" && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Resume workout" : "Pause workout"}
              className="gf-press gf-hub-button grid size-19 place-items-center rounded-full"
            >
              {paused ? (
                <Play className="size-8 fill-current" />
              ) : (
                <Pause className="size-8 fill-current" />
              )}
            </button>
          )}

          <ControlButton
            label="Skip exercise"
            // Always jumps straight to the next exercise, from any phase —
            // distinct from finishCurrent() (used by "Set complete" and a
            // timed set's own countdown), which correctly still routes
            // through a rest period first. Previously this only did that
            // for phase === "rest"; from "watch"/"work" it called
            // finishCurrent() instead, which — whenever the exercise has
            // restSeconds > 0 — just entered rest for the *same* exercise
            // without changing `index`, so one tap on Skip looked like it
            // did nothing.
            onClick={() => goToExercise(index + 1)}
          >
            <SkipForward className="size-5.5 fill-current" />
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
      className="gf-press grid size-14 place-items-center rounded-full text-ink-soft transition-colors hover:text-electric disabled:opacity-30"
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
