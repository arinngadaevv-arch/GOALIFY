"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, ChevronLeft, Lock, Star, Timer } from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst } from "./particle-burst";

/**
 * The true front door of the funnel — no auth wall in front of it. The
 * primary path starts the quiz immediately (auth is deferred to right
 * before the plan/paywall, once someone has already invested the 90
 * seconds); "Log in" is a quiet secondary path for a returning member who
 * just wants their dashboard back.
 */
export function WelcomeCtaStep({
  onStart,
  onLogin,
}: {
  onStart: () => void;
  onLogin: () => void;
}) {
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
      {/* A stronger, bottom-anchored fade — the photo stays legible up top,
          but every button and line of text sits on solid Obsidian Dark. */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-[#0b0e14]"
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/85 to-transparent"
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

      <div className="relative mt-auto flex flex-col items-center gap-4 px-6 pt-10 pb-10 text-center">
        <div className="mb-1">
          <Brand />
        </div>

        {/* ------------------------------------------------------ Social proof */}
        <div className="gf-glow-electric inline-flex items-center gap-1.5 rounded-full border border-[#FFC700]/40 bg-black/40 px-3.5 py-1.5 backdrop-blur-md">
          <span className="flex gap-0.5 text-[#FFC700]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-3.5 fill-current" />
            ))}
          </span>
          <span className="text-xs font-bold text-white">
            4.9/5 · rated by 50,000+ members
          </span>
        </div>

        <h1 className="gf-display text-4xl leading-[1.08] font-black text-white sm:text-5xl">
          Start Your <span className="text-[#FFC700]">Transformation</span>
        </h1>
        <p className="max-w-md text-base leading-relaxed font-semibold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-lg">
          Build your personalised 6-month training &amp; nutrition plan.
        </p>

        <GlowButton
          variant="cyber"
          size="xl"
          fullWidth
          pulse
          onClick={(event) => {
            fireBurst(event.clientX, event.clientY, true);
            onStart();
          }}
          className="mt-3 max-w-sm text-lg tracking-tight shadow-[0_0_40px_-8px_rgba(255,199,0,0.75)]"
        >
          GET MY PERSONALISED PLAN
          <ArrowRight className="size-5" />
        </GlowButton>

        <button
          type="button"
          onClick={onLogin}
          className="text-sm font-bold text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          Already have an account? Log in
        </button>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="gf-glass inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white/90">
            <Timer className="size-3.5 text-[#FFC700]" strokeWidth={2.5} />
            Takes 1 minute
          </span>
          <span className="gf-glass inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[11px] font-bold text-white/90">
            <Lock className="size-3.5 text-[#FFC700]" strokeWidth={2.5} />
            Privacy protected
          </span>
        </div>
      </div>
    </div>
  );
}
