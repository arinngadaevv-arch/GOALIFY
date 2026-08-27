"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Pause, Play, X } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { customVideoUrl } from "@/lib/goalify/video";
import {
  CompletionScreen,
  RING_CRIMSON,
  RING_GOLD,
} from "@/components/goalify/workout/live-player";
import { useWorkoutSounds } from "@/components/goalify/workout/use-workout-sounds";
import { useHaptics } from "@/lib/goalify/use-haptics";
import { ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { FloatingStreakBadge } from "@/components/goalify/ui/floating-streak-badge";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";
import { Pill, Stat } from "@/components/goalify/ui/stat";
import type { Workout } from "@/lib/goalify/types";

type Lap = "intro" | "main" | "outro" | "done";

const LAP_PILL_LABEL: Record<Lap, string> = {
  intro: "Get Ready",
  main: "Follow Along",
  outro: "Cool Down",
  done: "Done",
};

const LAP_HEADLINE: Record<Lap, string> = {
  intro: "Get Ready",
  main: "Follow Along",
  outro: "Cool Down",
  done: "Done",
};

const LAP_SUBTITLE: Record<Lap, string> = {
  intro: "Study the opening moves before the main set begins.",
  main: "Move with the video — full effort, every round.",
  outro: "Breathe. Shake it out. Nice work.",
  done: "",
};

/**
 * Plays one continuous uploaded clip end-to-end instead of the app's own
 * per-exercise timer — see `Workout["video"]` in lib/goalify/types.ts. The
 * clip's own first/last `introSeconds`/`outroSeconds` play once each; the
 * segment between them loops `loops` times before the outro plays out and
 * the workout is marked complete.
 *
 * Visually this borrows LivePlayer's exact grammar (glass header +
 * progress bar, video in a deep GlassCard, centered pill/headline/ring,
 * live stat pops, single floating bottom control) so a video-led workout
 * doesn't read as a bolted-on separate mode — only the ring's *meaning*
 * differs: instead of counting down a JS timer, it tracks the real
 * `<video>` element's own current time against intro/round/outro
 * boundaries, since there's no independent clock to read progress from.
 *
 * `lap`/`loopsDone` are mirrored into refs because `timeupdate` can fire
 * several times before a React re-render commits — reading/writing the
 * refs (not the state values) inside the handler is what keeps a fast
 * double-fire from looping twice or skipping straight past the outro.
 */
export function VideoLedPlayer({
  workout,
  video,
}: {
  workout: Workout;
  video: NonNullable<Workout["video"]>;
}) {
  const { state, completeWorkout } = useGoalify();
  const { completionCelebration } = useWorkoutSounds();
  const haptics = useHaptics();

  const src = customVideoUrl(video.bucket, video.fileName);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [lap, setLap] = useState<Lap>("intro");
  const lapRef = useRef<Lap>("intro");
  const [loopsDone, setLoopsDone] = useState(0);
  const loopsDoneRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // Real wall-clock session length — set once on mount (inside an effect,
  // since Date.now() can't run during render), read once on completion.
  // Mirrors LivePlayer's own CompletionScreen wiring exactly.
  const sessionStartRef = useRef(0);
  useEffect(() => {
    sessionStartRef.current = Date.now();
  }, []);
  const savedRef = useRef(false);
  const [completion, setCompletion] = useState<{
    title: string;
    calories: number;
    exercisesCompleted: number;
    elapsedSeconds: number;
    sessionsBefore: number;
  } | null>(null);

  const finish = () => {
    if (savedRef.current) return;
    savedRef.current = true;
    // Read before completeWorkout() writes today's date in, same ordering
    // LivePlayer's own completion effect uses, so CompletionScreen can
    // still tell a badge threshold was *just* crossed this session.
    setCompletion({
      title: workout.title,
      calories: workout.calories,
      exercisesCompleted: workout.exercises.length,
      elapsedSeconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
      sessionsBefore: state.completedDays.length,
    });
    completeWorkout();
    completionCelebration();
    haptics.milestone();
    lapRef.current = "done";
    setLap("done");
  };

  const handleTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || !duration) return;
    setCurrentTime(el.currentTime);
    const mainEnd = duration - video.outroSeconds;

    if (lapRef.current === "intro" && el.currentTime >= video.introSeconds - 0.05) {
      lapRef.current = "main";
      setLap("main");
      return;
    }

    if (lapRef.current === "main" && el.currentTime >= mainEnd - 0.05) {
      if (loopsDoneRef.current + 1 < video.loops) {
        loopsDoneRef.current += 1;
        setLoopsDone(loopsDoneRef.current);
        el.currentTime = video.introSeconds;
      } else {
        loopsDoneRef.current += 1;
        setLoopsDone(loopsDoneRef.current);
        lapRef.current = "outro";
        setLap("outro");
      }
    }
  };

  const handleEnded = () => {
    if (lapRef.current !== "done") finish();
  };

  const togglePause = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  };

  if (lap === "done") {
    // Falls back to the live workout data only for the single render
    // before `finish()`'s state update above has committed.
    const snapshot = completion ?? {
      title: workout.title,
      calories: workout.calories,
      exercisesCompleted: workout.exercises.length,
      elapsedSeconds: 0,
      sessionsBefore: state.completedDays.length,
    };
    return (
      <CompletionScreen
        workoutTitle={snapshot.title}
        calories={snapshot.calories}
        exercisesCompleted={snapshot.exercisesCompleted}
        elapsedSeconds={snapshot.elapsedSeconds}
        sessionsBefore={snapshot.sessionsBefore}
      />
    );
  }

  const overallProgress = duration ? Math.min(100, (currentTime / duration) * 100) : 0;
  const outroStart = duration != null ? Math.max(video.introSeconds, duration - video.outroSeconds) : 0;
  const mainSpan = duration != null ? Math.max(0.001, outroStart - video.introSeconds) : 0;

  let ringValue = 0;
  if (lap === "intro") {
    ringValue = video.introSeconds > 0 ? Math.min(100, (currentTime / video.introSeconds) * 100) : 100;
  } else if (lap === "main") {
    const roundProgress = Math.min(1, Math.max(0, (currentTime - video.introSeconds) / mainSpan));
    ringValue = Math.min(100, ((loopsDone + roundProgress) / video.loops) * 100);
  } else if (lap === "outro") {
    ringValue =
      video.outroSeconds > 0
        ? Math.min(100, ((currentTime - outroStart) / video.outroSeconds) * 100)
        : 100;
  }

  const secondsRemaining =
    lap === "intro"
      ? Math.max(0, Math.ceil(video.introSeconds - currentTime))
      : lap === "outro" && duration
        ? Math.max(0, Math.ceil(duration - currentTime))
        : 0;

  return (
    <main className="gf-cyber-scope mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-5 pb-48">
      <ParticleBurstLayer />
      <FloatingStreakBadge />

      {/* ------------------------------------------------------------ Top bar
          Same layout as LivePlayer's own — exit + title + progress bar —
          just with an overall video-percent readout instead of an
          exercise index, since there's no exercise list to count through. */}
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
            <span className="gf-numeric shrink-0">{Math.round(overallProgress)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/6">
            <div
              className="gf-progress-fill h-full rounded-full bg-linear-to-r from-electric to-lime-neon transition-[width] duration-500"
              style={{ width: `${Math.max(4, overallProgress)}%` }}
            />
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------- The video */}
      <GlassCard deep className="mt-5 overflow-hidden p-0">
        <div className="relative">
          {src ? (
            <video
              ref={videoRef}
              src={src}
              autoPlay
              playsInline
              className="mx-auto block max-h-[70vh] w-auto max-w-full bg-black"
              onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
          ) : (
            <div className="grid aspect-video w-full place-items-center bg-black px-6 text-center text-sm font-semibold text-white/70">
              Video not configured — set NEXT_PUBLIC_SUPABASE_URL and redeploy.
            </div>
          )}

          <div className="absolute top-3 left-3">
            <span className="gf-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tracking-[0.12em] text-electric uppercase">
              <span className="size-1.5 animate-pulse rounded-full bg-lime-neon shadow-[0_0_8px_var(--color-lime-neon)]" />
              Follow-Along Video
            </span>
          </div>

          {paused && (
            <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
              <div className="text-center">
                <Pause className="mx-auto size-10 text-electric" />
                <p className="gf-display mt-2 text-xl font-black text-ink">Paused</p>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* ------------------------------------------------------ Lap / counter */}
      <section className="mt-7 flex flex-col items-center">
        <Pill tone={lap === "outro" ? "lime" : "electric"}>{LAP_PILL_LABEL[lap]}</Pill>

        <h1 className="gf-display mt-3 text-center text-4xl leading-tight font-black text-ink sm:text-5xl">
          {LAP_HEADLINE[lap]}
        </h1>

        <p className="mt-2 max-w-xs text-center text-sm leading-snug font-semibold text-mist">
          {LAP_SUBTITLE[lap]}
        </p>

        <div className="relative mt-7 grid place-items-center">
          <div
            className={clsx(
              "absolute inset-0 -m-6 rounded-full blur-3xl",
              lap === "outro" ? "bg-[#ff3b3b]/25" : "bg-[#e8b32c]/25",
            )}
            aria-hidden
          />
          <ProgressRing
            className="relative"
            size={248}
            thickness={20}
            transitionMs={1000}
            easing="linear"
            rings={[
              {
                value: ringValue,
                color: lap === "outro" ? RING_CRIMSON : RING_GOLD,
                label: "Progress",
              },
            ]}
          >
            {lap === "main" ? (
              <div>
                <p className="gf-numeric text-6xl font-black text-ink">
                  {loopsDone + 1}
                  <span className="text-2xl text-mist">/{video.loops}</span>
                </p>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
                  rounds
                </p>
              </div>
            ) : (
              <div>
                <p className="gf-numeric text-6xl font-black text-ink">{secondsRemaining}</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
                  seconds
                </p>
              </div>
            )}
          </ProgressRing>
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-3">
          <div
            key={`cal-${Math.round((workout.calories * overallProgress) / 100)}`}
            className="gf-anim-pop"
          >
            <Stat
              value={Math.round((workout.calories * overallProgress) / 100)}
              suffix="kcal"
              label="Burned so far"
              tone="electric"
            />
          </div>
          <div key={`rounds-${loopsDone}`} className="gf-anim-pop">
            <Stat
              value={loopsDone}
              suffix={`/${video.loops}`}
              label="Rounds done"
              tone="lime"
            />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Floating control
          Just one control — play/pause — since there's nothing to skip
          between in a single continuous clip. Same size/placement as
          LivePlayer's own so the bottom thumb zone feels identical across
          both kinds of workout. */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="gf-glass gf-glass-deep flex items-center gap-3 rounded-full p-2.5">
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? "Resume workout" : "Pause workout"}
            className="gf-press gf-glow-electric grid size-19 place-items-center rounded-full bg-electric text-white [.gf-cyber-scope_&]:text-[#1a1100]"
          >
            {paused ? <Play className="size-8 fill-current" /> : <Pause className="size-8 fill-current" />}
          </button>
        </div>
      </div>
    </main>
  );
}
