"use client";

import Link from "next/link";
import { Bell, Flame, UserRound } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { VisualSlot } from "./ui/visual-slot";

export function TopBar({ title, subtitle }: { title?: string; subtitle?: string }) {
  const { answers, streak, state } = useGoalify();
  const name = state.profile?.name ?? "Athlete";

  return (
    <header className="mb-6 flex items-center gap-3">
      <Link
        href="/settings"
        aria-label="Your profile"
        className="gf-press shrink-0"
      >
        <VisualSlot
          label="Avatar"
          icon={UserRound}
          rounded="rounded-2xl"
          showChrome={false}
          className="size-11 border-electric/30"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-[10px] leading-tight font-bold uppercase tracking-[0.1em] text-mist sm:text-[11px] sm:tracking-[0.14em]">
          {subtitle ?? greeting()}
        </p>
        <h1 className="gf-display line-clamp-2 text-base leading-tight font-extrabold text-ink sm:text-lg">
          {title ?? `${name} · ${answers.daysPerWeek}-day plan`}
        </h1>
      </div>

      <Link
        href="/notifications"
        aria-label="Notification preview"
        className="gf-glass gf-press grid size-10 shrink-0 place-items-center rounded-2xl text-ink-soft"
      >
        <Bell className="size-4.5" />
      </Link>

      <div
        className="gf-glass gf-glass-lime gf-press flex shrink-0 items-center gap-1 rounded-2xl px-2.5 py-2.5"
        title={`${streak} day streak`}
      >
        <Flame className="size-4 text-lime-deep" strokeWidth={2.6} />
        <span className="gf-numeric text-sm font-extrabold text-ink">
          {streak}
        </span>
      </div>
    </header>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
