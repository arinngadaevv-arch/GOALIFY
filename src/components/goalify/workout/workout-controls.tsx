"use client";

import clsx from "clsx";
import { Pause, Play } from "lucide-react";

/**
 * The screen's one interaction surface, directly under the timer. Two
 * shapes: before a set starts it's a single big Start button (nothing else
 * to adjust yet); once something's actually running, Pause takes the same
 * primary spot and ±15s flank it below — Skip stays a quiet last resort
 * either way, never competing with Pause for attention.
 */
export function WorkoutControls({
  phase,
  paused,
  onStart,
  onTogglePause,
  onAddSeconds,
  onSkip,
  className,
}: {
  phase: "watch" | "active";
  paused: boolean;
  onStart: () => void;
  onTogglePause: () => void;
  /** Positive or negative — the caller clamps at zero. */
  onAddSeconds: (delta: number) => void;
  onSkip: () => void;
  className?: string;
}) {
  if (phase === "watch") {
    return (
      <div className={clsx("flex flex-col items-center gap-2", className)}>
        <button
          type="button"
          onClick={onStart}
          aria-label="Start this exercise"
          className="gf-press gf-hub-button gf-hub-pulse grid size-20 shrink-0 place-items-center rounded-full"
        >
          <Play className="size-8 fill-current" />
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="text-xs font-bold tracking-wide text-haze underline underline-offset-4"
        >
          Skip exercise
        </button>
      </div>
    );
  }

  return (
    <div className={clsx("flex flex-col items-center gap-3.5", className)}>
      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Resume workout" : "Pause workout"}
        className={clsx(
          "gf-press gf-hub-button grid size-20 shrink-0 place-items-center rounded-full",
          !paused && "gf-hub-pulse",
        )}
      >
        {paused ? (
          <Play className="size-8 fill-current" />
        ) : (
          <Pause className="size-8 fill-current" />
        )}
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onAddSeconds(-15)}
          aria-label="Subtract 15 seconds"
          className="gf-press gf-time-adjust flex h-13 min-w-20 items-center justify-center rounded-full text-sm font-black tracking-wide"
        >
          −15s
        </button>
        <button
          type="button"
          onClick={() => onAddSeconds(15)}
          aria-label="Add 15 seconds"
          className="gf-press gf-time-adjust flex h-13 min-w-20 items-center justify-center rounded-full text-sm font-black tracking-wide"
        >
          +15s
        </button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="text-xs font-semibold text-haze underline underline-offset-4"
      >
        Skip exercise
      </button>
    </div>
  );
}
