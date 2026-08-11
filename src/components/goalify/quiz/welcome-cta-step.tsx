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
 *
 * The hero is the same single uploaded image at every viewport width —
 * a from-scratch real-DOM desktop rebuild was tried and reverted (it
 * read as noticeably less polished than the designed mockup), so the
 * SEO-oriented text for search engines lives only in the sr-only <h1>
 * below and in SeoContent's own collapsed FAQ section further down the
 * page, not in a second visible hero.
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
      {/* The hero below is a single flattened image (see the comment on
          that <Image>), so it carries zero real text for a crawler — this
          is the page's actual <h1>, kept off-screen for search engines and
          screen readers while the visual hero (which says the same thing
          graphically) is what sighted visitors see. Not an SEO trick: the
          content matches the page 1:1, it's just not duplicated visibly on
          top of the image. */}
      <h1 className="sr-only">
        GOALIFY — Home Workout Plans for Overweight Men, No Gym or Equipment
        Needed
      </h1>

      {/* The uploaded design stays a single, uncut image — the whole hero
          section, exactly as delivered. Its own flat "START MY
          PERSONALIZED PLAN" button isn't clickable, so instead of cutting
          the image apart, a real button is absolutely-positioned directly
          on top of it, sized and placed to the flat button's own pixel
          bounding box, measured directly against the 852x1846 source
          (x 32-819px, y 1488-1577px, found via color-mask detection, not
          eyeballed) and expressed as a % so it tracks the image at any
          viewport width. That math only works if this relative wrapper's
          height equals the image's own rendered height — hence the
          dedicated div instead of sizing off the outer container, which
          also holds the "Log in" paragraph below the image. This image has
          no baked-in "log in" caption to overlay, so that link is real DOM
          content below the image instead of a coordinate-matched overlay.
          Nothing about the image's own layout is touched. */}
      <div className="relative">
        <Image
          src="/quiz/66a025e8-c605-48e2-9d8f-ac2a5848fd0a.png"
          alt="Meet your personal AI coach. GOALIFY — 4.9/5 from 3,290+ reviews, 30,000+ happy members. AI-powered plans, real-time adaptation, expert support, real before/after transformations."
          width={852}
          height={1846}
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
            left: "3.76%",
            width: "92.37%",
            top: "80.6%",
            height: "4.82%",
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
