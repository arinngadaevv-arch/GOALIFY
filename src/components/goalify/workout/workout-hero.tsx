"use client";

import { useState } from "react";
import clsx from "clsx";
import { PoseIcon, type PoseKey } from "@/components/goalify/ui/pose-icon";

/**
 * The dominant element on the launchpad — a large, cinematic preview of the
 * first exercise. Plays the real intro clip when one resolves (see
 * lib/goalify/video.ts); falls back to the pose-icon placeholder on a
 * plain dark gradient otherwise, same resilience pattern as AIFormGuide in
 * the live player, just without any of that component's tracking-frame
 * chrome — this screen wants one clean, quiet visual, not an "analysis in
 * progress" HUD.
 */
export function WorkoutHero({
  index,
  exerciseName,
  pose,
  videoSrc,
  durationMinutes,
  exerciseCount,
  className,
}: {
  index: number;
  exerciseName: string;
  pose: PoseKey;
  videoSrc?: string | null;
  durationMinutes: number;
  exerciseCount: number;
  className?: string;
}) {
  // `videoSrc` never changes across this component's lifetime (it's
  // resolved once by the caller from a static helper), so plain initial
  // state is enough — no effect needed to "reset" it for a clip swap that
  // can't happen here.
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const attempting = Boolean(videoSrc) && !failed;

  return (
    <div
      className={clsx(
        "gf-launch-rise gf-delay-1 relative aspect-[4/5] w-full overflow-hidden rounded-[22px] sm:aspect-[16/11] lg:aspect-[3/4] lg:h-full",
        className,
      )}
    >
      {attempting && (
        <video
          key={videoSrc}
          src={videoSrc ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setReady(true)}
          onError={() => setFailed(true)}
          className={clsx(
            "gf-hero-scale absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
      )}

      {!ready && (
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-b from-[#1c1a15] to-[#0b0b0a]">
          <PoseIcon pose={pose} className="h-32 w-32 opacity-80 sm:h-40 sm:w-40" />
        </div>
      )}

      {/* Scrim so the overlaid name/meta stay legible over any footage. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-transparent"
        aria-hidden
      />

      <span className="gf-numeric absolute top-5 left-5 text-sm font-bold tracking-[0.12em] text-[color:var(--gf-champagne)]">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
        <h1 className="gf-display text-3xl leading-tight font-black text-ink sm:text-4xl lg:text-5xl">
          {exerciseName}
        </h1>
        <p className="mt-2 text-sm font-semibold text-ink-soft sm:text-base">
          {durationMinutes} min · {exerciseCount} exercises
        </p>
      </div>
    </div>
  );
}
