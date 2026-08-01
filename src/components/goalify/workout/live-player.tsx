"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  Check,
  ChevronRight,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import type { Exercise } from "@/lib/goalify/types";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { VisualSlot } from "@/components/goalify/ui/visual-slot";
import { poseForExercise } from "@/components/goalify/ui/pose-icon";
import { AIFormGuide } from "@/components/goalify/workout/ai-form-guide";
import { useWorkoutSounds } from "@/components/goalify/workout/use-workout-sounds";
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
  const { state, todaysWorkout, completeWorkout, updateSettings } = useGoalify();
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

  const exercise = workout.exercises[index];
  const nextExercise = workout.exercises[index + 1];
  const isTimed = exercise.kind === "time";
  const voiceOn = state.settings.voiceCues;
  const { countdownBeep, exerciseChime, completionCelebration, goCue } =
    useWorkoutSounds();

  /* ------------------------------------------------------------- narration */
  const speak = useCallback(
    (text: string) => {
      if (!voiceOn || typeof window === "undefined") return;
      try {
        const synth = window.speechSynthesis;
        if (!synth) return;
        synth.cancel();
        synth.speak(new SpeechSynthesisUtterance(text));
      } catch {
        // Speech synthesis is a bonus, never a requirement.
      }
    },
    [voiceOn],
  );

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
      speak(`${target.name}. ${target.cue}`);
      exerciseChime();
    },
    [workout.exercises, speak, setSeconds, exerciseChime],
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
      speak(`Rest. Next up, ${workout.exercises[index + 1].name}`);
      return;
    }
    goToExercise(index + 1);
  }, [index, exercise, workout.exercises, goToExercise, speak, setSeconds]);

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

  /* Announce the very first exercise's watch phase on mount (every later
   * one is already announced inside goToExercise). */
  const announcedFirstRef = useRef(false);
  useEffect(() => {
    if (announcedFirstRef.current) return;
    announcedFirstRef.current = true;
    speak(`${exercise.name}. ${exercise.cue}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------------------------------------ completion */
  const savedRef = useRef(false);
  useEffect(() => {
    if (phase === "done" && !savedRef.current) {
      savedRef.current = true;
      completeWorkout();
      speak("Session complete. Outstanding work.");
      completionCelebration();
    }
  }, [phase, completeWorkout, speak, completionCelebration]);

  if (phase === "done") {
    return <CompletionScreen workoutTitle={workout.title} calories={workout.calories} />;
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
          onClick={() => updateSettings({ voiceCues: !voiceOn })}
          aria-label={voiceOn ? "Mute voice cues" : "Unmute voice cues"}
          aria-pressed={voiceOn}
          className={clsx(
            "gf-glass gf-press grid size-10 shrink-0 place-items-center rounded-full transition-colors",
            voiceOn ? "text-electric" : "text-haze",
          )}
        >
          {voiceOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>

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

function CompletionScreen({
  workoutTitle,
  calories,
}: {
  workoutTitle: string;
  calories: number;
}) {
  const { streak, state } = useGoalify();

  return (
    <main className="gf-cyber-scope mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-14 text-center">
      <div className="relative grid size-40 place-items-center">
        <span
          className="gf-anim-burst absolute size-28 rounded-full border-2 border-lime-neon/60"
          aria-hidden
        />
        <div className="gf-glow-lime grid size-24 place-items-center rounded-full bg-lime-neon">
          <Check className="size-12 text-ink" strokeWidth={3} />
        </div>
      </div>

      <p className="gf-anim-rise mt-8 text-[11px] font-bold tracking-[0.2em] text-lime-deep uppercase">
        <Sparkles className="mr-1 inline size-3.5" />
        Session complete
      </p>
      <h1 className="gf-anim-rise gf-delay-2 gf-display mt-3 text-4xl font-black text-ink">
        {workoutTitle} <span className="gf-text-hype">done.</span>
      </h1>
      <p className="gf-anim-rise gf-delay-3 mt-3 text-base text-ink-soft">
        You showed up and finished. That&apos;s the whole game.
      </p>

      <GlassCard deep className="gf-anim-rise gf-delay-4 mt-8 w-full p-6">
        <div className="grid grid-cols-3 gap-4">
          <Stat value={calories} suffix="kcal" label="Burned" tone="electric" />
          <Stat value={streak} label="Day streak" tone="lime" />
          <Stat value={state.completedDays.length} label="Total sessions" />
        </div>
      </GlassCard>

      <GlowLink href="/home" size="xl" fullWidth className="gf-anim-rise gf-delay-5 mt-8">
        Back to my dashboard
      </GlowLink>
      <GlowLink href="/progress" variant="ghost" size="sm" className="mt-3">
        See my progress
      </GlowLink>
    </main>
  );
}
