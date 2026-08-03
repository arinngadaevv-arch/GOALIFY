"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import {
  ArrowRight,
  Check,
  Flame,
  Sparkles,
  Target,
  Trophy,
  Unlock,
  Zap,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { planName } from "@/lib/goalify/plan";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { IconBadge } from "@/components/goalify/ui/icon-badge";
import { CoachBubble } from "@/components/goalify/coach/coach-bubble";
import { Stat } from "@/components/goalify/ui/stat";

/** Fixed positions keep the burst identical on server and client. */
const PARTICLES = [
  { icon: Zap, left: "8%", top: "18%", delay: "0.15s" },
  { icon: Flame, left: "86%", top: "22%", delay: "0.35s" },
  { icon: Sparkles, left: "18%", top: "68%", delay: "0.55s" },
  { icon: Trophy, left: "78%", top: "72%", delay: "0.25s" },
  { icon: Target, left: "50%", top: "8%", delay: "0.45s" },
  { icon: Sparkles, left: "6%", top: "44%", delay: "0.65s" },
];

const UNLOCKED = [
  "Your full training program",
  "Daily calorie & protein targets",
  "3D AI form coach on every rep",
  "Progress tracking & photo vault",
];

export function UnlockCelebration() {
  const { answers, targets, purchase } = useGoalify();
  const { update } = useSession();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpened(true), 420);
    return () => clearTimeout(timer);
  }, []);

  // This screen is only ever reached one way now: Lemon Squeezy's own
  // redirect_url after a real checkout completes (see paywall.tsx) — there
  // is no other link or navigation into /success. `purchase()` is
  // idempotent (a no-op if already true), so this is safe to call on every
  // mount, including a page refresh here.
  useEffect(() => {
    const timer = setTimeout(() => purchase(), 0);
    return () => clearTimeout(timer);
  }, [purchase]);

  // The session's `hasActivePlan` (see auth.ts / proxy.ts) is only ever as
  // fresh as the last time the JWT actually re-read `users.plan` from the
  // DB — plain page navigation doesn't trigger that. Forcing an `update()`
  // here (no payload, so the jwt callback does a real DB refetch rather
  // than trusting a client-supplied value — payment status is exactly the
  // one thing a client can't be trusted to just assert) picks up whatever
  // the order_created webhook has written by now, so proxy.ts's plan gate
  // doesn't bounce a genuinely-just-paid user back to /plan the moment
  // they tap through to /home or /workout/launch below.
  useEffect(() => {
    const timer = setTimeout(() => update(), 0);
    return () => clearTimeout(timer);
  }, [update]);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-5 py-14 text-center">
      {/* Floating celebration particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="gf-anim-pop absolute"
            style={{
              left: particle.left,
              top: particle.top,
              animationDelay: particle.delay,
            }}
          >
            <IconBadge icon={particle.icon} size="sm" className="gf-anim-float" />
          </span>
        ))}
      </div>

      {/* ------------------------------------------------- 3D unlock medallion */}
      <div className="relative grid size-48 place-items-center">
        <span
          className="gf-anim-burst absolute size-32 rounded-full border-2 border-electric/40"
          aria-hidden
        />
        <span
          className="gf-anim-burst absolute size-32 rounded-full border-2 border-lime-neon/50"
          style={{ animationDelay: "0.7s" }}
          aria-hidden
        />
        <span
          className="gf-anim-spin-slow absolute size-44 rounded-full border-2 border-dashed border-electric/25"
          aria-hidden
        />
        <div
          className={clsx(
            "gf-glow-electric relative grid size-28 place-items-center rounded-full bg-electric",
            "transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            opened ? "scale-100 rotate-0" : "scale-75 -rotate-12",
          )}
        >
          <Unlock
            className={clsx(
              "size-12 text-lime-neon transition-all duration-500",
              opened ? "opacity-100 scale-100" : "opacity-0 scale-50",
            )}
            strokeWidth={2.4}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------ Message */}
      <p className="gf-anim-rise gf-delay-2 mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-lime-deep">
        <Sparkles className="mr-1 inline size-3.5" />
        Payment confirmed
      </p>
      <h1 className="gf-anim-rise gf-delay-3 gf-display mt-3 text-5xl font-black text-ink">
        You&apos;re <span className="gf-text-hype">in.</span>
      </h1>
      <p className="gf-anim-rise gf-delay-4 mt-4 max-w-sm text-base leading-relaxed text-ink-soft">
        The <strong className="text-ink">{planName(answers)}</strong> plan is
        unlocked. No more planning, no more waiting — Day 1 starts the second
        you hit that button.
      </p>

      <CoachBubble
        message="This is the part where most people close the app and 'start Monday'. Not you. Press it."
        tone="lime"
        avatarPhotoSrc="/quiz/coach-portrait.png"
        className="gf-anim-rise gf-delay-4 mt-6 w-full text-left"
      />

      <GlassCard deep className="gf-anim-rise gf-delay-5 mt-8 w-full p-6">
        <div className="grid grid-cols-3 gap-4">
          <Stat value={answers.daysPerWeek} label="days / week" tone="electric" />
          <Stat
            value={targets.calories.toLocaleString()}
            label="kcal / day"
            tone="ink"
          />
          <Stat value={targets.protein} label="g protein" tone="lime" />
        </div>

        <ul className="mt-6 space-y-2.5 border-t border-ink/8 pt-5 text-left">
          {UNLOCKED.map((item) => (
            <li key={item} className="flex items-center gap-3">
              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-lime-neon">
                <Check className="size-3.5 text-ink" strokeWidth={3.5} />
              </span>
              <span className="text-sm font-semibold text-ink-soft">{item}</span>
            </li>
          ))}
        </ul>
      </GlassCard>

      <GlowLink
        href="/workout/launch"
        size="xl"
        fullWidth
        pulse
        className="gf-anim-rise gf-delay-6 mt-8"
      >
        START DAY 1 NOW
        <ArrowRight className="size-5" />
      </GlowLink>

      <GlowLink href="/home" variant="ghost" size="sm" className="mt-3">
        Explore the app first
      </GlowLink>
    </main>
  );
}
