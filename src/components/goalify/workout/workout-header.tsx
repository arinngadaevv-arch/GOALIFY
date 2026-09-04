"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { WorkoutProgress } from "./workout-progress";

/**
 * Minimal top bar shared by the launchpad and the live player — a back
 * arrow, a category label, and a small position indicator. Nothing else:
 * this screen's job is to get out of the way of whatever's right below
 * it. Entrance animation is left to the caller (the two screens use
 * different animation scopes), so nothing's hardcoded here.
 */
export function WorkoutHeader({
  category,
  dayLabel,
  current,
  total,
  backHref = "/home",
  backLabel = "Back",
  className,
}: {
  category: string;
  /** Plain label (e.g. "Day 1") — ignored when `current`/`total` are set. */
  dayLabel?: string;
  /** A real position within the workout (e.g. exercise 3 of 17) — renders
   * as a fraction instead of `dayLabel`. */
  current?: number;
  total?: number;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <header className={clsx("flex items-center justify-between", className)}>
      <Link
        href={backHref}
        aria-label={backLabel}
        className="gf-press flex size-11 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-5" />
      </Link>
      <p className="truncate px-3 text-xs font-bold tracking-[0.22em] text-mist uppercase">
        {category}
      </p>
      <WorkoutProgress label={dayLabel} current={current} total={total} />
    </header>
  );
}
