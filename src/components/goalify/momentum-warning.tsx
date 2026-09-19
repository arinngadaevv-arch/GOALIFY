"use client";

import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, TrendingDown } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { daysSinceLastWorkout, weeklyMomentum } from "@/lib/goalify/momentum";
import { GlassCard } from "./ui/glass-card";

/** Below this, it's just "hasn't trained today yet" — the normal state of
 * every day before the session happens, not a slip worth flagging. */
const MIN_DAYS_TO_WARN = 2;

/**
 * The "what happens if this keeps going" nudge — shown only once an actual
 * gap exists (never for a brand-new user who simply hasn't started yet,
 * see daysSinceLastWorkout's null case), and built entirely from real
 * numbers already on the account: days since the last completed session,
 * and each of the last 4 weeks' completion rate against the user's own
 * weekly target. No guilt copy, just the trend line and a way back in.
 */
export function MomentumWarning() {
  const { state, answers } = useGoalify();
  const daysSince = daysSinceLastWorkout(state.completedDays);

  if (daysSince === null || daysSince < MIN_DAYS_TO_WARN) return null;

  const bars = weeklyMomentum(state.completedDays, answers.daysPerWeek);
  const thisWeekPercent = bars[bars.length - 1];

  return (
    // No `gf-reveal` here on purpose — that class is only ever picked up by
    // useRevealOnScroll's one-time querySelectorAll at the *dashboard's*
    // mount (see that hook's own comment), which runs before this card's
    // condition (real, hydrated completedDays) can even be known. A card
    // that only starts existing after hydration would sit at opacity 0
    // forever, never having been there for the observer to find.
    <GlassCard deep className="border border-electric/25 p-5">
      <div className="flex items-center gap-2">
        <TrendingDown className="size-4 text-electric" />
        <p className="text-[11px] font-bold tracking-[0.14em] text-electric uppercase">
          {daysSince}-day gap
        </p>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        {daysSince} days since your last session. Keep this pace and this week
        lands at {thisWeekPercent}% of your own goal — that&apos;s how a month
        quietly resets to zero, one skipped day at a time.
      </p>

      <div className="mt-4 flex h-10 items-end gap-1.5">
        {bars.map((value, index) => (
          <div
            key={index}
            className={clsx(
              "w-full rounded-t-md transition-[height]",
              index === bars.length - 1 ? "bg-electric" : "bg-ink/15",
            )}
            style={{ height: `${Math.max(4, Math.round(value * 0.4))}px` }}
          />
        ))}
      </div>

      <Link
        href="/workout/launch?quick=1"
        className="gf-press mt-4 flex items-center justify-center gap-1.5 rounded-full bg-electric px-4 py-2.5 text-xs font-bold text-white"
      >
        Restart today — even the short version
        <ArrowRight className="size-3.5" />
      </Link>
    </GlassCard>
  );
}
