"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Pause, Play, X } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { customVideoUrl } from "@/lib/goalify/video";
import { CompletionScreen } from "@/components/goalify/workout/live-player";
import { useWorkoutSounds } from "@/components/goalify/workout/use-workout-sounds";
import { useHaptics } from "@/lib/goalify/use-haptics";
import { ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { FloatingStreakBadge } from "@/components/goalify/ui/floating-streak-badge";
import { Pill } from "@/components/goalify/ui/stat";
import type { Workout } from "@/lib/goalify/types";

type Lap = "intro" | "main" | "outro" | "done";

const LAP_LABEL: Record<Lap, string> = {
  intro: "Get ready",
  main: "Follow along",
  outro: "Cool down",
  done: "Done",
};

/**
 * Plays one continuous uploaded clip end-to-end instead of the app's own
 * per-exercise timer — see `Workout["video"]` in lib/goalify/types.ts. The
 * clip's own first/last `introSeconds`/`outroSeconds` play once each; the
 * segment between them loops `loops` times before the outro plays out and
 * the workout is marked complete.
 *
 * Everything here is driven by the real `<video>` element's own clock
 * (`timeupdate`/`onEnded`) rather than an independent JS countdown like
 * LivePlayer's exercise-by-exercise timer uses — there's no way to know a
 * timestamp inside a single-move exercise, only inside this one clip, so
 * the video itself is the source of truth for progress.
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

  const src = useMemo(
    () => customVideoUrl(video.bucket, video.fileName),
    [video.bucket, video.fileName],
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [lap, setLap] = useState<Lap>("intro");
  const lapRef = useRef<Lap>("intro");
  const [loopsDone, setLoopsDone] = useState(0);
  const loopsDoneRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

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

  return (
    <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-5 pb-10">
      <ParticleBurstLayer />
      <FloatingStreakBadge />

      <header className="flex items-center gap-3">
        <Link
          href="/home"
          aria-label="End workout"
          className="gf-glass gf-press grid size-10 shrink-0 place-items-center rounded-full text-ink-soft"
        >
          <X className="size-5" />
        </Link>
        <p className="min-w-0 flex-1 truncate text-[11px] font-bold text-mist">
          {workout.title}
        </p>
      </header>

      <div className="relative mt-5 overflow-hidden rounded-3xl bg-black">
        {src ? (
          <video
            ref={videoRef}
            src={src}
            autoPlay
            playsInline
            className="block h-auto w-full"
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
          />
        ) : (
          <div className="grid aspect-9/16 w-full place-items-center px-6 text-center text-sm font-semibold text-white/70">
            Video not configured — set NEXT_PUBLIC_SUPABASE_URL and redeploy.
          </div>
        )}

        {src && (
          <button
            type="button"
            onClick={togglePause}
            aria-label={paused ? "Resume" : "Pause"}
            className="gf-glass gf-press absolute right-3 bottom-3 grid size-11 place-items-center rounded-full text-white"
          >
            {paused ? <Play className="size-5 fill-current" /> : <Pause className="size-5" />}
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center text-center">
        <Pill tone={lap === "outro" ? "lime" : "electric"}>{LAP_LABEL[lap]}</Pill>
        {lap === "main" && (
          <p className="mt-3 text-sm font-semibold text-mist">
            Round {loopsDone + 1} of {video.loops}
          </p>
        )}
      </div>
    </main>
  );
}
