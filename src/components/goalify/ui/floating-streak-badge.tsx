"use client";

import { Flame } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";

/**
 * A permanently-visible streak counter — unlike TopBar's inline chip (which
 * scrolls away with the header), this is `position: fixed` so it stays on
 * screen no matter how far the user scrolls. Sits at bottom-right, clear of
 * BottomDock's centered nav and TopBar's own top-right chip.
 */
export function FloatingStreakBadge() {
  const { streak } = useGoalify();

  return (
    <div
      className="gf-glass gf-streak-badge pointer-events-none fixed right-4 bottom-24 z-40 flex items-center gap-1.5 rounded-full border border-lime-deep/30 px-3 py-2"
      aria-hidden
    >
      <Flame className="size-4 text-lime-deep" strokeWidth={2.6} />
      <span className="gf-numeric text-sm font-black text-ink">{streak}</span>
    </div>
  );
}
