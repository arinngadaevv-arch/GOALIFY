"use client";

import { useState } from "react";
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
 */
export function CommitStep({
  buttonLabel,
  patch,
  value,
  locked,
  onPick,
}: {
  buttonLabel: string;
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
    onPick(patch, value);
  };

  return (
    <div className="flex flex-col items-center gap-6 pt-4 pb-2 text-center">
      <span
        className={clsx(
          "gf-cyber-border grid size-20 place-items-center rounded-full bg-black/10 transition-transform duration-300",
          unlocked && "gf-anim-unlock",
        )}
        aria-hidden
      >
        <PartyPopper
          className={clsx(
            "size-9 transition-colors duration-300",
            unlocked ? "gf-cyber-glow-text" : "text-haze",
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
        className="text-lg tracking-tight"
      >
        {buttonLabel}
      </GlowButton>

      <p className="text-xs font-semibold text-haze">
        {unlocked ? "Locked in. Building your plan around it..." : "Tap to commit — no going back 😏"}
      </p>
    </div>
  );
}
