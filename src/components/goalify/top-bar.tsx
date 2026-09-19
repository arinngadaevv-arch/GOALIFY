"use client";

import Link from "next/link";
import clsx from "clsx";
import { Bell, Flame } from "lucide-react";
import { useSession } from "next-auth/react";
import { useGoalify } from "@/lib/goalify/store";
import { AvatarDisplay } from "./ui/profile-avatar";

export function TopBar({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) {
  const { streak, state } = useGoalify();
  const { data: session } = useSession();
  // Every other AppShell screen passes its own title/subtitle (Nutrition,
  // Progress, Settings, ...) — the default greeting+name heading below only
  // ever renders here, on Home, which is why it's the one spot that gets a
  // louder, "energetic" treatment instead of a plain label.
  const isHero = !title;
  // The real name collected at signup (both the credentials form and
  // Google OAuth set it) lives in the NextAuth session, not in this
  // client-only quiz profile — `state.profile.name` is never actually
  // written anywhere (toProfile defaults it to "Athlete" unconditionally),
  // so reading it first was silently showing the placeholder to everyone.
  // First name only, for a greeting that reads like one, not a form field.
  const sessionFirstName = session?.user?.name?.trim().split(/\s+/)[0];
  const name = sessionFirstName || state.profile?.name || "Athlete";

  return (
    <header className="mb-6 flex items-center gap-3">
      <Link
        href="/settings"
        aria-label="Your profile"
        className={clsx(
          "gf-press shrink-0 rounded-2xl",
          isHero && "gf-glow-electric",
        )}
      >
        <AvatarDisplay avatar={state.avatar} size="sm" />
      </Link>

      {/* Base (mobile) sizes stay conservative on purpose — a longer title
          ("Nutrition", "Progress" screens included their subtitle inline
          here before) at the larger size wrapped to 2 lines on ordinary
          375–390px phones, which read as the title colliding with the
          eyebrow line above it. The bump to a bigger, more premium size
          only kicks in at `sm:`, where this column has real width to
          spare rather than being the entire viewport. */}
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            "line-clamp-1 flex items-center gap-1.5 text-[11px] leading-tight font-bold tracking-[0.12em] uppercase sm:text-sm sm:tracking-[0.16em]",
            isHero ? "text-electric" : "text-mist",
          )}
        >
          {isHero && (
            <Flame
              className="gf-anim-flicker-flame size-3 shrink-0 fill-current"
              aria-hidden
            />
          )}
          {subtitle ?? greeting()}
        </p>
        <h1
          className={clsx(
            "gf-display line-clamp-1 text-base leading-tight sm:text-xl",
            isHero ? "gf-text-electric font-black" : "font-extrabold text-ink",
          )}
        >
          {title ?? name}
        </h1>
      </div>

      <Link
        href="/notifications"
        aria-label="Notification preview"
        className="gf-glass gf-press grid size-10 shrink-0 place-items-center rounded-2xl text-ink-soft"
      >
        <Bell className="size-4.5" />
      </Link>

      <Link
        href="/progress"
        aria-label={`${streak} day streak — view your progress`}
        title={`${streak} day streak`}
        className="gf-glass gf-glass-lime gf-press flex shrink-0 items-center gap-1 rounded-2xl px-2.5 py-2.5"
      >
        <Flame className="size-4 text-lime-deep" strokeWidth={2.6} />
        <span className="gf-numeric text-sm font-extrabold text-ink">
          {streak}
        </span>
      </Link>
    </header>
  );
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
