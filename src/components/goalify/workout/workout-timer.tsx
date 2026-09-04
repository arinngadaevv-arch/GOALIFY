"use client";

import clsx from "clsx";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";

const GRADIENT_ID = "gf-live-timer-ring";

/**
 * The number is the hero; the ring is just supporting context for how much
 * of it is left. No button lives inside it anymore — Start/Pause moved to
 * WorkoutControls, directly below, so this stays a pure readout.
 */
export function WorkoutTimer({
  seconds,
  value,
  animated,
  variant,
  hint,
  urgent,
  className,
}: {
  /** The number actually shown — the live countdown once a set is running,
   * or a static preview of the target duration during "watch". */
  seconds: number;
  /** Ring fill, 0-100. */
  value: number;
  /** A real per-second countdown gets a linear, tick-synced sweep; the
   * static "watch" preview just sits full. */
  animated: boolean;
  /** "gold" during watch/work; "crimson" during rest — a held warning
   * rather than the screen's usual accent. */
  variant: "gold" | "crimson";
  /** Small caption under "seconds" — e.g. an approximate rep target for a
   * reps-based set, so the estimate doesn't read as an exact clock. */
  hint?: string;
  /** True in a countdown's last few seconds — a quiet pulse, not an alarm. */
  urgent: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("relative grid place-items-center", className)}>
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eed9ab" />
            <stop offset="45%" stopColor="#c9a961" />
            <stop offset="100%" stopColor="#8f7238" />
          </linearGradient>
        </defs>
      </svg>

      <ProgressRing
        size={140}
        thickness={5}
        gap={0}
        {...(animated ? { transitionMs: 1000, easing: "linear" } : {})}
        rings={[
          {
            value,
            color: variant === "crimson" ? "#ff3b3b" : `url(#${GRADIENT_ID})`,
            label: "Current",
            trackColor: "rgba(236, 228, 211, 0.1)",
          },
        ]}
      >
        <div className={clsx("text-center", urgent && "gf-timer-urgent")}>
          <p
            className={clsx(
              "gf-numeric text-[3.25rem] leading-none font-black sm:text-[3.75rem]",
              urgent ? "text-[#f2c879]" : "text-ink",
            )}
          >
            {seconds}
          </p>
          <p className="mt-2 text-[11px] font-bold tracking-[0.16em] text-mist uppercase">
            {hint ?? "seconds"}
          </p>
        </div>
      </ProgressRing>
    </div>
  );
}
