"use client";

import { Pause, Play, SkipForward } from "lucide-react";

/**
 * Sits directly under the timer, in the page's own flow — no more fixed
 * bottom pill. Pause is the largest, most central target; skip and +15s
 * flank it. The +15s spacer keeps Pause visually centered even on a
 * rep-based set, where there's no clock to extend.
 */
export function WorkoutControls({
  paused,
  onTogglePause,
  onSkip,
  onAddSeconds,
  showAddSeconds,
  className,
}: {
  paused: boolean;
  onTogglePause: () => void;
  onSkip: () => void;
  onAddSeconds: () => void;
  showAddSeconds: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-4 ${className ?? ""}`}>
      <button
        type="button"
        onClick={onSkip}
        aria-label="Skip exercise"
        className="gf-glass gf-press grid size-14 shrink-0 place-items-center rounded-full text-ink-soft transition-colors hover:text-ink"
      >
        <SkipForward className="size-5 fill-current" />
      </button>

      <button
        type="button"
        onClick={onTogglePause}
        aria-label={paused ? "Resume workout" : "Pause workout"}
        className="gf-press gf-hub-button grid size-18 shrink-0 place-items-center rounded-full"
      >
        {paused ? (
          <Play className="size-7 fill-current" />
        ) : (
          <Pause className="size-7 fill-current" />
        )}
      </button>

      {showAddSeconds ? (
        <button
          type="button"
          onClick={onAddSeconds}
          aria-label="Add 15 seconds"
          className="gf-glass gf-press grid size-14 shrink-0 place-items-center rounded-full text-xs font-black text-ink-soft transition-colors hover:text-ink"
        >
          +15s
        </button>
      ) : (
        <div className="size-14 shrink-0" aria-hidden />
      )}
    </div>
  );
}
