"use client";

import clsx from "clsx";
import { Pause, Sparkles } from "lucide-react";
import { AIFormGuide } from "@/components/goalify/workout/ai-form-guide";
import type { PoseKey } from "@/components/goalify/ui/pose-icon";

/**
 * The screen's hero — large, cinematic, and the first thing the eye lands
 * on. One small floating pill is the only chrome: it reads "AI Form Guide ·
 * Active" while the user is just watching, then quietly becomes the actual
 * coaching cue once a set is running, rather than adding a second label
 * elsewhere for the same information.
 */
export function ExerciseMedia({
  pose,
  videoSrc,
  formTip,
  paused,
  flash,
  className,
}: {
  pose: PoseKey;
  videoSrc?: string | null;
  /** Present only while a set is actually running — swaps the pill from
   * the idle "watching" state to this exercise's coaching cue. */
  formTip?: string;
  paused: boolean;
  /** Briefly true right as "watch" flips to "work". */
  flash: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("relative overflow-hidden rounded-[24px]", className)}>
      <AIFormGuide pose={pose} videoSrc={videoSrc} className="h-full w-full rounded-none" />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/72 via-black/0 to-black/15"
        aria-hidden
      />

      <div key={formTip ?? "guide"} className="gf-anim-materialize absolute right-4 bottom-4 left-4">
        <div className="gf-glass inline-flex max-w-full items-start gap-2 rounded-2xl px-3.5 py-2.5">
          <Sparkles
            className="mt-0.5 size-3.5 shrink-0"
            style={{ color: "var(--gf-gold)" }}
            strokeWidth={2.2}
          />
          <div className="min-w-0">
            <p
              className="text-[10px] font-black tracking-[0.12em] uppercase"
              style={{ color: "var(--gf-gold)" }}
            >
              {formTip ? "Form tip" : "AI Form Guide · Active"}
            </p>
            {formTip && (
              <p className="mt-0.5 text-xs leading-snug text-ink-soft">{formTip}</p>
            )}
          </div>
        </div>
      </div>

      {paused && (
        <div className="absolute inset-0 grid place-items-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <Pause className="mx-auto size-9 text-ink" />
            <p className="gf-display mt-2 text-lg font-black text-ink">Paused</p>
          </div>
        </div>
      )}

      {/* Watch -> work hand-off — a quick, quiet fade, not a flashbang. */}
      {flash && (
        <div
          className="gf-anim-materialize absolute inset-0 z-20 grid place-items-center bg-black/60 backdrop-blur-[2px]"
          aria-hidden
        >
          <p className="gf-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Your turn — go
          </p>
        </div>
      )}
    </div>
  );
}
