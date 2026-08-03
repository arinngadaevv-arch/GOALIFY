"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
    <div className="relative -mx-5 overflow-hidden bg-[#0b0e14]">
      {/* The uploaded design stays a single, uncut image — the whole hero
          section, exactly as delivered. Its own flat "START YOUR FREE
          ASSESSMENT" button isn't clickable, so instead of cutting the
          image apart, a real button is absolutely-positioned directly on
          top of it, sized and placed to the flat button's own pixel
          bounding box (as a % of the 853x1844 source, so it tracks the
          image at any viewport width). Same for the login link over the
          "Takes 2 minutes" line just below it. Nothing about the image's
          layout, spacing, or flow is touched. */}
      <Image
        src="/quiz/69f89e00-e3b4-45e8-bc05-6d6e77897ca2.png"
        alt="Transform your body, transform your life. GOALIFY — trusted by 50,000+ users, 4.9/5 average rating. Personalized for you, gym & home workouts, nutrition plan, track your progress."
        width={853}
        height={1844}
        priority
        sizes="100vw"
        className="block h-auto w-full"
      />

      <button
        type="button"
        onClick={(event) => {
          fireBurst(event.clientX, event.clientY, true);
          setAuthIntent("signup");
        }}
        className="gf-press gf-anim-pulse absolute inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#f0c14b] to-[#c8890f] font-bold tracking-tight text-[#1a1100] shadow-[0_0_0_1px_rgba(232,179,44,0.6),0_18px_44px_-10px_rgba(232,179,44,0.8)] transition-all duration-200 select-none hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(232,179,44,0.85),0_24px_54px_-8px_rgba(232,179,44,1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8b32c]"
        style={{
          left: "2.8%",
          width: "94.3%",
          top: "75.5%",
          height: "4.7%",
          fontSize: "clamp(0.65rem, 3.1vw, 1.05rem)",
        }}
      >
        GET MY PERSONALISED PLAN
        <ArrowRight className="size-[1em]" />
      </button>

      {/* Sits directly over the image's own "Takes 2 minutes" caption —
          a solid backdrop (not just text) is required here, otherwise the
          baked-in copy underneath shows through and garbles with this
          link's own text. */}
      <button
        type="button"
        onClick={() => setAuthIntent("signin")}
        className="gf-press absolute flex items-center justify-center rounded-full bg-[#0b0e14] font-bold text-white/80 underline-offset-4 hover:text-white hover:underline"
        style={{
          left: "12%",
          width: "76%",
          top: "80.9%",
          height: "2.3%",
          fontSize: "clamp(0.6rem, 2.6vw, 0.875rem)",
        }}
      >
        Already have an account? Log in
      </button>

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
