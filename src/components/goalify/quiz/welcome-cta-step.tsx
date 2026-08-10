"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Heart, Sparkles, Star, TrendingUp } from "lucide-react";
import { AuthModal } from "./auth-modal";
import { fireBurst } from "./particle-burst";

/** Mirrors the flattened mobile hero's own copy (see that <Image>'s alt
 * text) — same three value props, same numbers, just real DOM instead of
 * baked-in pixels, so the desktop hero (see DesktopHero below) needs no
 * separate content decisions to stay consistent with the mobile one. */
const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Plans",
    body: "Plans made just for you and your goals.",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Adaptation",
    body: "Your plan evolves with you, every day.",
  },
  {
    icon: Heart,
    title: "Expert Support",
    body: "We're here for you, whenever you need.",
  },
] as const;

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

  const handleStart = (event: React.MouseEvent) => {
    fireBurst(event.clientX, event.clientY, true);
    onStart();
  };

  return (
    <div className="relative -mx-5 overflow-hidden bg-[#0b0e14]">
      {/* Phone-width visitors get the original flattened mockup below,
          untouched. `lg+` gets DesktopHero instead — real DOM, a wide
          two-column layout, its own <h1> (see that component). Both blocks
          share `showLogin`/`AuthModal` below so "already have an account"
          works identically either way. */}
      <div className="lg:hidden">
        {/* The hero below is a single flattened image (see the comment on
            that <Image>), so it carries zero real text for a crawler — this
            is the page's actual <h1> on phone-width viewports, kept
            off-screen for search engines and screen readers while the
            visual hero (which says the same thing graphically) is what
            sighted visitors see. Not an SEO trick: the content matches the
            page 1:1, it's just not duplicated visibly on top of the image. */}
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
            onClick={handleStart}
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
      </div>

      <DesktopHero onStart={handleStart} onLogin={() => setShowLogin(true)} />

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

/**
 * `lg+` hero — real headline, real paragraphs, a real photo, laid out as
 * two columns instead of the mobile flattened mockup. Same copy, same
 * numbers, same CTA behavior as the mobile hero (see FEATURES above and
 * the alt text on the mobile <Image>), just actual DOM so it can use the
 * width a phone screen never had.
 */
function DesktopHero({
  onStart,
  onLogin,
}: {
  onStart: (event: React.MouseEvent) => void;
  onLogin: () => void;
}) {
  return (
    <div className="hidden lg:block lg:px-12 lg:py-16 xl:px-16">
      <div className="mx-auto grid max-w-7xl grid-cols-[3fr_2fr] items-center gap-12">
        <div className="py-6">
          {/* The real, visible headline for `lg+` — the mobile block above
              carries its own sr-only <h1> with the same message, so exactly
              one <h1> is ever meaningful at a given viewport width. */}
          <h1 className="gf-display text-4xl leading-[1.1] font-black text-white xl:text-5xl">
            Meet Your Personal{" "}
            <span className="text-[#FFC700]">AI Coach</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
            Smart. Adaptive. 100% for you. Your AI coach builds the perfect
            home workout plan, adapts in real time, and pushes you to become
            your best self — no gym, no equipment, no judgment.
          </p>

          <div className="mt-6 flex items-center gap-2">
            <div className="flex text-[#FFC700]" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-5 fill-current" />
              ))}
            </div>
            <span className="text-sm font-semibold text-white/70">
              4.9/5 from 3,290+ reviews
            </span>
          </div>

          <div className="mt-9 flex items-center gap-4">
            <button
              type="button"
              onClick={onStart}
              className="gf-press gf-anim-pulse inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f0c14b] to-[#c8890f] px-8 py-4 text-base font-bold tracking-tight text-[#1a1100] shadow-[0_0_0_1px_rgba(232,179,44,0.6),0_18px_44px_-10px_rgba(232,179,44,0.8)] transition-all duration-200 select-none hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(232,179,44,0.85),0_24px_54px_-8px_rgba(232,179,44,1)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#e8b32c]"
            >
              START MY PERSONALIZED PLAN
              <ArrowRight className="size-5" />
            </button>
            <button
              type="button"
              onClick={onLogin}
              className="text-sm font-black text-[#FFC700] underline-offset-4 hover:underline"
            >
              Log in
            </button>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon className="size-6 text-[#FFC700]" strokeWidth={2.2} />
                <p className="mt-2.5 text-sm font-extrabold text-white">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div
            className="absolute inset-0 -m-6 rounded-full bg-[#e8b32c]/20 blur-3xl"
            aria-hidden
          />
          <Image
            src="/quiz/coach-portrait.png"
            alt=""
            width={333}
            height={390}
            priority
            sizes="(min-width: 1280px) 30vw, 35vw"
            className="relative aspect-[4/5] w-full rounded-[2.5rem] border-2 border-[#FFC700]/40 object-cover shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
          />
        </div>
      </div>
    </div>
  );
}
