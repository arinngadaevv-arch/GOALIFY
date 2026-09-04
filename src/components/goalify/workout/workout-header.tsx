"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { WorkoutProgress } from "./workout-progress";

/**
 * Minimal top bar for the launchpad — a back arrow, the workout's category
 * label, and a small position indicator. Nothing else: this screen's job
 * is to get out of the way of the hero visual right below it.
 */
export function WorkoutHeader({
  category,
  dayLabel,
  backHref = "/home",
}: {
  category: string;
  dayLabel: string;
  backHref?: string;
}) {
  return (
    <header className="gf-launch-rise flex items-center justify-between">
      <Link
        href={backHref}
        aria-label="Back"
        className="gf-press flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <p className="text-xs font-bold tracking-[0.22em] text-mist uppercase">
        {category}
      </p>
      <WorkoutProgress label={dayLabel} />
    </header>
  );
}
