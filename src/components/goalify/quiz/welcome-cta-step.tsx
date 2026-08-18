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
 * The hero is a flattened image at every viewport width — a from-scratch
 * real-DOM desktop rebuild was tried and reverted (it read as noticeably
 * less polished than a designed mockup), so mobile and desktop each get
 * their own purpose-designed flat image instead (see the two <Image>s
 * below) rather than one image stretched across both. SEO-oriented text
 * for search engines lives only in the sr-only <h1> below and in
 * SeoContent's own collapsed FAQ section further down the page, not in
 * either hero.
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

      {/* Mobile hero — a single, uncut image, the whole hero section exactly
          as delivered (the source was cropped to just its dark hero band —
          863x1341 — dropping its own trailing light-background marketing
          section, which duplicated what SeoContent below already covers).
          Its own flat "START MY PERSONALIZED PLAN" button isn't clickable,
          so instead of cutting the image apart, a real button is
          absolutely-positioned directly on top of it, sized and placed to
          the flat button's own pixel bounding box, measured directly
          against the 863x1341 source (x 36-761px, y 851-940px, found via
          color-mask detection, not eyeballed) and expressed as a % so it
          tracks the image at any viewport width. That math only works if
          this relative wrapper's height equals the image's own rendered
          height — hence the dedicated div instead of sizing off the outer
          container, which also holds the "Log in" paragraph below both
          images. Nothing about the image's own layout is touched. This
          design has no baked-in before/after gallery slot (unlike the
          previous hero), so there's no photo overlay here. */}
      <div className="relative lg:hidden">
        <Image
          src="/quiz/1c31555e-1c18-41a2-bd3f-07c92a1de8e6.png"
          alt="Meet your personal AI coach. GOALIFY — your body, your plan, AI-powered. Custom workouts, smart nutrition guidance, plans that adapt as you progress."
          width={863}
          height={1341}
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
            left: "4.17%",
            width: "84.01%",
            top: "63.46%",
            height: "6.64%",
            fontSize: "clamp(0.65rem, 3.1vw, 1.05rem)",
          }}
        >
          START MY PERSONALIZED PLAN
          <ArrowRight className="size-[1em]" />
        </button>
      </div>

      {/* Desktop hero — same technique as the mobile image above: its own
          purpose-designed 1536x756 flat image (source cropped to just its
          dark hero band, same reasoning as the mobile crop above — the
          light "How It Works" section below it duplicated SeoContent).
          This design bakes in two gold CTAs — a small one in its top nav
          bar and the large one in the hero copy — so both get a real
          button on top rather than leaving one dead, each measured via the
          same color-mask technique against the 1536x756 source: nav button
          x 1296-1472px/y 23-65px, hero button x 57-541px/y 509-571px. No
          before/after gallery overlay here — unlike the previous desktop
          image, this design has no baked-in photo slot to swap onto. */}
      <div className="relative hidden lg:block">
        <Image
          src="/quiz/cf886129-3b24-4c4d-96a3-67d91a1642df.png"
          alt="Meet your personal AI coach. GOALIFY — your body, your plan, AI-powered. Custom workouts, smart nutrition guidance, plans that adapt as you progress."
          width={1536}
          height={756}
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
            left: "84.38%",
            width: "11.46%",
            top: "3.04%",
            height: "5.56%",
            fontSize: "clamp(0.6rem, 0.85vw, 0.85rem)",
          }}
        >
          START MY PLAN
          <ArrowRight className="size-[1em]" />
        </button>

        <button
          type="button"
          onClick={(event) => {
            fireBurst(event.clientX, event.clientY, true);
            onStart();
          }}
          className="gf-press gf-anim-pulse absolute inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#f0c14b] to-[#c8890f] font-bold tracking-tight text-[#1a1100] shadow-[0_0_0_1px_rgba(232,179,44,0.6),0_18px_44px_-10px_rgba(232,179,44,0.8)] transition-all duration-200 select-none hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(232,179,44,0.85),0_24px_54px_-8px_rgba(232,179,44,1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8b32c]"
          style={{
            left: "3.71%",
            width: "31.51%",
            top: "67.33%",
            height: "8.2%",
            fontSize: "clamp(0.8rem, 1.1vw, 1.1rem)",
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
