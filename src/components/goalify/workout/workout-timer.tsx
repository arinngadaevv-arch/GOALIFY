"use client";

import clsx from "clsx";
import { Play } from "lucide-react";
import { ProgressRing } from "@/components/goalify/ui/progress-ring";

const GRADIENT_ID = "gf-live-timer-ring";

/**
 * The screen's primary interaction — a calm, minimal ring around a large,
 * unambiguous number (or the Start button, before a set actually begins).
 * Self-contained: owns its own gradient `<defs>`, so nothing else on the
 * page needs to know the gradient id exists.
 */
export function WorkoutTimer({
  mode,
  value,
  animated,
  variant,
  secondsLeft,
  reps,
  amount,
  onStart,
}: {
  /** "start" — waiting on a tap; "countdown" — a running clock; "reps" —
   * advances on a tap, no clock. */
  mode: "start" | "countdown" | "reps";
  /** Ring fill, 0-100. */
  value: number;
  /** A real per-second countdown gets a linear, tick-synced sweep; "start"
   * and rep-based work have no clock, so both just pop instead. */
  animated: boolean;
  /** "gold" during watch/work; "crimson" during rest — a held warning
   * rather than the screen's usual accent. */
  variant: "gold" | "crimson";
  secondsLeft: number;
  reps: number;
  amount: number;
  onStart: () => void;
}) {
  return (
    <div className="relative grid place-items-center">
      <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
          <linearGradient id={GRADIENT_ID} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eed9ab" />
            <stop offset="45%" stopColor="#c9a961" />
            <stop offset="100%" stopColor="#8f7238" />
          </linearGradient>
        </defs>
      </svg>

      {/* Ambient halo behind the ring — breathes gently during watch/work,
       * held static during rest. */}
      <div
        className={clsx(
          "absolute inset-0 -m-8 rounded-full blur-3xl",
          variant === "crimson" ? "bg-[#ff3b3b]/25" : "gf-ring-halo-active bg-[#c9a961]/25",
        )}
        aria-hidden
      />

      <ProgressRing
        className="relative"
        size={180}
        thickness={12}
        {...(animated ? { transitionMs: 1000, easing: "linear" } : {})}
        rings={[
          {
            value,
            color: variant === "crimson" ? "#ff3b3b" : `url(#${GRADIENT_ID})`,
            label: "Current",
          },
        ]}
      >
        {mode === "start" ? (
          <button
            type="button"
            onClick={onStart}
            aria-label="Start this exercise"
            className="gf-press gf-hub-button flex flex-col items-center gap-1 rounded-full px-7 py-6"
          >
            <Play className="size-6 fill-current" />
            <span className="text-xs font-black tracking-[0.08em] uppercase">Start</span>
          </button>
        ) : mode === "countdown" ? (
          <div>
            <p className="gf-numeric text-7xl font-black text-ink">{secondsLeft}</p>
            <p className="text-[11px] font-bold tracking-[0.16em] text-mist uppercase">
              seconds
            </p>
          </div>
        ) : (
          <div>
            <p className="gf-numeric text-7xl font-black text-ink">
              {reps}
              <span className="text-2xl text-mist">/{amount}</span>
            </p>
            <p className="text-[11px] font-bold tracking-[0.16em] text-mist uppercase">
              reps
            </p>
          </div>
        )}
      </ProgressRing>
    </div>
  );
}
