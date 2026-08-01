"use client";

import Image from "next/image";
import { ArrowRight, ChevronLeft, ClipboardCheck, Home, PersonStanding } from "lucide-react";
import { useRouter } from "next/navigation";
import { COACH } from "@/lib/goalify/coach";
import { GlowButton } from "@/components/goalify/ui/glow-button";

const BADGES = [
  { icon: Home, text: "100% Home Based" },
  { icon: ClipboardCheck, text: "Custom Calorie & Workout Blueprint" },
  { icon: PersonStanding, text: "No Equipment Needed" },
];

/**
 * Step 0 — the trust-building beat before Question 1. Arriving straight
 * into a question with zero context reads as a cold, generic form; a real
 * face, a promise, and a single clear CTA earns the next 60 seconds.
 * Deliberately outside QUIZ_STEPS — it collects nothing, so it's not
 * counted in the "X/9" progress the rest of the funnel shows.
 */
export function WelcomeStep({ onStart }: { onStart: () => void }) {
  const router = useRouter();

  return (
    <div className="relative -mx-5 flex min-h-dvh flex-col overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/quiz/goal-athletic.png"
          alt=""
          fill
          priority
          className="object-cover object-top"
        />
      </div>
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black"
        aria-hidden
      />

      <button
        type="button"
        aria-label="Back"
        onClick={() => router.push("/")}
        className="gf-press relative z-10 mt-5 ml-5 grid size-9 shrink-0 place-items-center rounded-full bg-black/30 text-white"
      >
        <ChevronLeft className="size-6" strokeWidth={2.5} />
      </button>

      <div className="relative mt-auto flex flex-col items-center gap-5 px-6 pt-16 pb-10 text-center">
        <p className="text-[11px] font-black tracking-[0.2em] text-electric uppercase">
          {COACH.name} · {COACH.role}
        </p>
        <h1 className="gf-display text-4xl leading-[1.08] font-black text-white sm:text-5xl">
          WELCOME. I&apos;M YOUR PERSONAL PERFORMANCE COACH.
        </h1>
        <p className="max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
          Ready to transform your physique and reclaim your energy? In the
          next 60 seconds, we&apos;ll analyze your baseline and build your
          custom 30-day bodyweight roadmap.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {BADGES.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="gf-glass inline-flex items-center gap-1.5 rounded-full border border-electric/30 bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white/90"
            >
              <Icon className="size-3.5 text-electric" strokeWidth={2.5} />
              {text}
            </span>
          ))}
        </div>

        <GlowButton
          variant="cyber"
          size="xl"
          fullWidth
          pulse
          onClick={onStart}
          className="mt-2 max-w-sm text-lg tracking-tight shadow-[0_0_40px_-8px_rgba(232,179,44,0.75)]"
        >
          LET&apos;S BUILD MY PLAN ⚡
          <ArrowRight className="size-5" />
        </GlowButton>
      </div>
    </div>
  );
}
