"use client";

import clsx from "clsx";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";

const GRADIENT_ID = "gf-live-timer-ring";

/** Gold at full time remaining, drifting toward the same red the rest
 * countdown already warns with — so the two states read as one consistent
 * "running out" language instead of a separate color invented just for
 * this. */
const GOLD_RGB: [number, number, number] = [226, 169, 48];
const RED_RGB: [number, number, number] = [255, 59, 59];

function mixRgb(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): string {
  const clamped = Math.max(0, Math.min(1, t));
  const [r, g, b] = from.map((c, i) => Math.round(c + (to[i] - c) * clamped));
  return `rgb(${r}, ${g}, ${b})`;
}

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
  live,
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
  /** True whenever a set is actually counting down (not paused) — a
   * quiet per-second pulse so the number reads as alive, not just digits
   * swapping. `urgent` (below) takes over for the last few seconds. */
  live: boolean;
  /** True in a countdown's last few seconds — a bigger, warmer pulse. */
  urgent: boolean;
  className?: string;
}) {
  // How far into "running out" this countdown is, 0 (just started/full) to
  // 1 (about to hit zero) — squared so the drift stays barely noticeable
  // early on and only really reads as red in roughly the last third,
  // rather than tinting the whole bar evenly from the first tick.
  const dangerT = Math.pow(Math.max(0, Math.min(1, 1 - value / 100)), 1.6);
  // Rest already runs solid red the entire time (its own held warning) —
  // only the work/watch ring actually drifts from gold toward it.
  const dangerColor = mixRgb(GOLD_RGB, RED_RGB, dangerT);

  return (
    <div
      className={clsx(
        "relative grid place-items-center",
        className,
        urgent && "gf-timer-blink",
      )}
    >
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f0c878" />
            <stop offset="45%" stopColor="#d9a94a" />
            <stop offset="100%" stopColor="#9c7530" />
          </linearGradient>
        </defs>
      </svg>

      <ProgressRing
        size={168}
        thickness={7}
        gap={0}
        {...(animated ? { transitionMs: 1000, easing: "linear" } : {})}
        rings={[
          {
            value,
            color:
              variant === "crimson"
                ? "#ff3b3b"
                : dangerT > 0
                  ? dangerColor
                  : `url(#${GRADIENT_ID})`,
            label: "Current",
            trackColor: "rgba(236, 228, 211, 0.08)",
          },
        ]}
      >
        <div
          className={clsx(
            "text-center",
            urgent ? "gf-timer-urgent" : live && "gf-timer-live",
          )}
        >
          <p
            className={clsx(
              "gf-numeric text-[4.25rem] leading-none font-black tracking-tight sm:text-[4.75rem]",
              variant === "crimson" && (urgent ? "text-[#f2c879]" : "text-ink"),
            )}
            style={variant === "gold" ? { color: dangerColor } : undefined}
          >
            {seconds}
          </p>
          <p className="mt-2.5 text-[11px] font-black tracking-[0.2em] text-mist uppercase">
            {hint ?? "seconds"}
          </p>
        </div>
      </ProgressRing>
    </div>
  );
}
