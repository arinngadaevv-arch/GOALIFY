"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { PartyPopper } from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import type { QuizAnswers } from "@/lib/goalify/types";
import { fireBurst } from "./particle-burst";

/**
 * A pure "yes-set" rhetorical commitment card — one giant button, no real
 * choice to weigh. Tapping it has to feel like unlocking something: a
 * bigger-than-usual particle burst, a badge snapping in, and the button
 * itself locking into a "done" state for a beat before the funnel advances.
 * A full-bleed athletic photo behind the moment raises the stakes further.
 */
export function CommitStep({
  buttonLabel,
  bgPhoto,
  patch,
  value,
  locked,
  onPick,
}: {
  buttonLabel: string;
  bgPhoto: string;
  patch: Partial<QuizAnswers>;
  value: unknown;
  locked: boolean;
  onPick: (patch: Partial<QuizAnswers>, value: unknown) => void;
}) {
  const [unlocked, setUnlocked] = useState(false);

  const commit = (event: React.MouseEvent) => {
    if (locked || unlocked) return;
    setUnlocked(true);
    // Two staggered bursts read as a bigger celebration than one.
    fireBurst(event.clientX, event.clientY, true);
    window.setTimeout(() => fireBurst(event.clientX, event.clientY, false), 90);
    // Best-effort haptic punch — silently unsupported on desktop/Safari.
    navigator.vibrate?.([30, 40, 60]);
    onPick(patch, value);
  };

  return (
    <div className="relative -mx-5 min-h-[62vh] overflow-hidden">
      <div className="absolute inset-0">
        <Image src={bgPhoto} alt="" fill priority className="object-cover object-top" />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/55 to-black"
        aria-hidden
      />

      <div className="relative flex min-h-[62vh] flex-col items-center justify-end gap-6 px-5 pt-10 pb-6 text-center">
        <span
          className={clsx(
            "gf-cyber-border grid size-20 place-items-center rounded-full bg-black/40 transition-transform duration-300",
            unlocked && "gf-anim-unlock",
          )}
          aria-hidden
        >
          <PartyPopper
            className={clsx(
              "size-9 transition-colors duration-300",
              unlocked ? "gf-cyber-glow-text" : "text-white/60",
            )}
            strokeWidth={2.2}
          />
        </span>

        <GlowButton
          variant="cyber"
          size="xl"
          fullWidth
          pulse={!unlocked}
          disabled={locked || unlocked}
          onClick={commit}
          className="text-lg tracking-tight shadow-[0_0_40px_-8px_rgba(232,179,44,0.75)]"
        >
          {buttonLabel}
        </GlowButton>

        <p className="text-xs font-semibold text-white/70">
          {unlocked ? "Locked in. Building your plan around it..." : "Tap to commit — no going back 😏"}
        </p>
      </div>
    </div>
  );
}
