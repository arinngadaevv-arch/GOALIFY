"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { fireBurst } from "./particle-burst";

/**
 * The true front door of the funnel. The primary CTA goes straight into
 * the quiz with zero auth interaction — no account exists yet, nothing to
 * sign in to. The only mandatory account gate is later, after the quiz
 * finishes (see QuizFlow's `showResultsGate`, which renders `AuthPanel`
 * once there's an actual plan worth saving).
 *
 * The quiet "Log in" link is the one exception: it's for someone who
 * already has an account and would rather resume than redo the quiz, so
 * it opens `AuthModal` in signin mode. Google is different from the
 * email/password form there — the same button click could complete a
 * fresh signup or an existing account's login (Google decides that
 * invisibly based on email match), so it goes through the `/quiz?auth=start`
 * round trip and lets QuizFlow decide where to land based on the real
 * session that comes back, not which button was clicked.
 * `initialErrorCode` is how a failed Google round trip reports itself
 * back here on the next page load — passed through to AuthModal raw
 * (not pre-formatted) so it can react specifically to
 * "OAuthAccountNotLinked" with its own inline linking flow instead of
 * just a red banner. It can only ever originate from the Log in link
 * now, since Google is never offered before the quiz.
 */
export function WelcomeCtaStep({
  onStart,
  onLogin,
  initialErrorCode,
}: {
  onStart: () => void;
  onLogin: () => void;
  /** NextAuth's raw error code from a Google attempt that failed on a
   * previous page load (see QuizFlow, which parses the `?error=`
   * NextAuth lands on `/quiz` with). Reopens the modal immediately to
   * surface it. */
  initialErrorCode?: string | null;
}) {
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!initialErrorCode) return;
    const timer = setTimeout(() => setShowLogin(true), 0);
    return () => clearTimeout(timer);
  }, [initialErrorCode]);

  return (
    <div className="relative -mx-5 overflow-hidden bg-[#0b0e14]">
      {/* The uploaded design stays a single, uncut image — the whole hero
          section, exactly as delivered. Its own flat "START MY
          PERSONALIZED PLAN" button isn't clickable, so instead of cutting
          the image apart, a real button is absolutely-positioned directly
          on top of it, sized and placed to the flat button's own pixel
          bounding box, measured directly against the 862x1824 source
          (x 31-831px, y 1584-1651px) and expressed as a % so it tracks the
          image at any viewport width. That math only works if this
          relative wrapper's height equals the image's own rendered height
          — hence the dedicated div instead of sizing off the outer
          container, which also holds the "Log in" paragraph below the
          image. Unlike the previous image, this one has no baked-in "log
          in" caption to overlay, so that link is real DOM content below
          the image instead of a coordinate-matched overlay. Nothing about
          the image's own layout is touched. */}
      <div className="relative">
        <Image
          src="/quiz/d71b1b7e-3748-4102-a818-8d5758effdb6.png"
          alt="Meet your personal AI coach. GOALIFY — 4.9/5 from 3,200+ reviews, 50,000+ happy members. Follow step-by-step workouts, get a plan personalized to your goals, track your progress, real before/after transformations."
          width={862}
          height={1824}
          priority
          sizes="100vw"
          className="block h-auto w-full"
        />

        <button
          type="button"
          onClick={(event) => {
            fireBurst(event.clientX, event.clientY, true);
            onStart();
          }}
          className="gf-press gf-anim-pulse absolute inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#f0c14b] to-[#c8890f] font-bold tracking-tight text-[#1a1100] shadow-[0_0_0_1px_rgba(232,179,44,0.6),0_18px_44px_-10px_rgba(232,179,44,0.8)] transition-all duration-200 select-none hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(232,179,44,0.85),0_24px_54px_-8px_rgba(232,179,44,1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8b32c]"
          style={{
            left: "3.6%",
            width: "92.8%",
            top: "86.8%",
            height: "3.7%",
            fontSize: "clamp(0.65rem, 3.1vw, 1.05rem)",
          }}
        >
          START MY PERSONALIZED PLAN
          <ArrowRight className="size-[1em]" />
        </button>
      </div>

      <p className="relative mt-4 mb-2 text-center text-xs font-semibold text-white/60">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => setShowLogin(true)}
          className="font-black text-[#FFC700] underline-offset-4 hover:underline"
        >
          Log in
        </button>
      </p>

      {showLogin && (
        <AuthModal
          initialMode="signin"
          initialErrorCode={initialErrorCode}
          googleCallbackUrl="/quiz?auth=start"
          heading="Welcome back"
          subheading="Sign in to pick up right where you left off."
          onClose={() => setShowLogin(false)}
          onAuthenticated={onLogin}
        />
      )}
    </div>
  );
}
