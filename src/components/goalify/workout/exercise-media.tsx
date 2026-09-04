"use client";

import clsx from "clsx";
import { Pause } from "lucide-react";
import { AIFormGuide } from "@/components/goalify/workout/ai-form-guide";
import type { PoseKey } from "@/components/goalify/ui/pose-icon";

/**
 * The dominant element on the active-workout screen — a large, cinematic
 * video/pose view with exactly one small status pill and, while a set is
 * actually running, a short coaching line overlaid at the bottom. Wraps
 * AIFormGuide (which stays focused purely on the video/placeholder itself)
 * with the chrome this screen specifically needs, so AIFormGuide itself
 * doesn't have to know or care which screen is using it.
 */
export function ExerciseMedia({
  pose,
  videoSrc,
  cue,
  paused,
  flash,
  className,
}: {
  pose: PoseKey;
  videoSrc?: string | null;
  /** Short live coaching line overlaid at the bottom of the clip — omit
   * (e.g. during "watch") when there's nothing worth captioning yet. */
  cue?: string;
  paused: boolean;
  /** Briefly true right as "watch" flips to "work". */
  flash: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("relative overflow-hidden rounded-[22px]", className)}>
      <AIFormGuide pose={pose} videoSrc={videoSrc} className="h-full w-full rounded-none" />

      {/* Scrim so the badge and coaching line stay legible over any footage. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-black/25"
        aria-hidden
      />

      <div className="absolute top-4 left-4">
        <span className="gf-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black tracking-[0.1em] text-electric uppercase">
          <span className="size-1.5 animate-pulse rounded-full bg-lime-neon shadow-[0_0_8px_var(--color-lime-neon)]" />
          AI Form Guide · Active
        </span>
      </div>

      {cue && (
        <p className="absolute right-5 bottom-4 left-5 text-sm leading-snug font-semibold text-ink-soft">
          {cue}
        </p>
      )}

      {paused && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <Pause className="mx-auto size-10 text-electric" />
            <p className="gf-display mt-2 text-xl font-black text-ink">Paused</p>
          </div>
        </div>
      )}

      {/* Explosive watch -> work hand-off. */}
      {flash && (
        <div
          className="gf-anim-rise absolute inset-0 z-20 grid place-items-center bg-electric/90 backdrop-blur-sm"
          aria-hidden
        >
          <p className="gf-anim-pop gf-display text-4xl font-black text-white italic sm:text-5xl">
            YOUR TURN — GO!
          </p>
        </div>
      )}
    </div>
  );
}
