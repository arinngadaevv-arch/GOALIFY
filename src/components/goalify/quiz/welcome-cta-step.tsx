"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Lock, Star, Timer } from "lucide-react";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { AuthModal } from "./auth-modal";
import { fireBurst } from "./particle-burst";

/**
 * The true front door of the funnel. Neither action here navigates away
 * for email/password — both the primary CTA and the quiet "Log in" link
 * open the same `AuthModal` in place (signup vs. signin), and only a
 * successful authentication actually advances: into question one for the
 * CTA, or to the dashboard for a returning member logging in. Google is
 * the exception (see AuthModal) — it's a real OAuth round trip, so success
 * there arrives back as a fresh page load, and `initialError` is how a
 * failed round trip reports itself back here.
 */
export function WelcomeCtaStep({
  onStart,
  onLogin,
  initialError,
}: {
  onStart: () => void;
  onLogin: () => void;
  /** Friendly message from a Google attempt that failed on a previous
   * page load (see QuizFlow, which parses the `?error=` NextAuth lands
   * on `/quiz` with). Reopens the modal immediately to surface it. */
  initialError?: string | null;
}) {
  const [authIntent, setAuthIntent] = useState<"signup" | "signin" | null>(null);

  useEffect(() => {
    if (!initialError) return;
    const timer = setTimeout(() => setAuthIntent("signup"), 0);
    return () => clearTimeout(timer);
  }, [initialError]);

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
      {/* One smooth bottom-to-top wash — nearly clear at the very top so the
          photo reads, solid Obsidian Dark by the lower third so the copy
          and CTA never fight the image for contrast. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/75 via-45% to-transparent"
        aria-hidden
      />

      <div className="relative mt-auto flex flex-col items-center gap-4 px-6 pt-10 pb-10 text-center">
        <div className="mb-1">
          <Brand />
        </div>

        {/* ------------------------------------------------------ Social proof */}
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 backdrop-blur-xl">
          <span className="flex gap-0.5 text-[#FFC700]">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="size-3.5 fill-current" />
            ))}
          </span>
          <span className="text-xs font-bold text-white">
            4.9/5 · rated by 50,000+ members
          </span>
        </div>

        <h1 className="gf-display text-5xl leading-[1.05] font-black text-white sm:text-6xl">
          Start Your{" "}
          <span className="gf-text-gold-glow bg-gradient-to-b from-[#FFE59A] to-[#FFC700] bg-clip-text text-transparent">
            Transformation
          </span>
        </h1>
        <p className="max-w-md text-base leading-relaxed font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)] sm:text-lg">
          Build your personalised 6-month training &amp; nutrition plan.
        </p>

        <GlowButton
          variant="cyber"
          size="xl"
          fullWidth
          pulse
          onClick={(event) => {
            fireBurst(event.clientX, event.clientY, true);
            setAuthIntent("signup");
          }}
          className="mt-3 h-[4.25rem] max-w-sm text-lg tracking-tight shadow-[0_0_50px_-6px_rgba(255,199,0,0.85)]"
        >
          GET MY PERSONALISED PLAN
          <ArrowRight className="size-5" />
        </GlowButton>

        <button
          type="button"
          onClick={() => setAuthIntent("signin")}
          className="text-sm font-bold text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          Already have an account? Log in
        </button>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-xl">
            <Timer className="size-3.5 text-[#FFC700]" strokeWidth={2.5} />
            Takes 1 minute
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold text-white/90 backdrop-blur-xl">
            <Lock className="size-3.5 text-[#FFC700]" strokeWidth={2.5} />
            Privacy protected
          </span>
        </div>
      </div>

      {authIntent && (
        <AuthModal
          initialMode={authIntent}
          initialError={authIntent === "signup" ? initialError : null}
          googleCallbackUrl={authIntent === "signin" ? "/home" : "/quiz?auth=start"}
          heading={authIntent === "signin" ? "Welcome back" : undefined}
          subheading={
            authIntent === "signin"
              ? "Sign in to pick up right where you left off."
              : undefined
          }
          onClose={() => setAuthIntent(null)}
          onAuthenticated={authIntent === "signin" ? onLogin : onStart}
        />
      )}
    </div>
  );
}
