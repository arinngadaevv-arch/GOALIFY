"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
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
    <div className="relative -mx-5 flex flex-col overflow-hidden bg-[#0b0e14]">
      {/* The uploaded design is a complete hero mockup — headline, brand
          mark, rating, feature icons and its own CTA/footer copy are all
          already drawn into the image. Showing it as a `w-full h-auto`
          block (not an absolutely-positioned `fill` background) means it
          renders at its own aspect ratio, uncropped and unstretched, and
          the page simply scrolls if it's taller than the viewport — no
          zooming, no cover-crop. Only a real, clickable CTA + login link
          are still rendered by the app below it; everything else the old
          version duplicated in React on top of the photo's own baked-in
          copy has been removed. */}
      <Image
        src="/quiz/69f89e00-e3b4-45e8-bc05-6d6e77897ca2.png"
        alt="Transform your body, transform your life. GOALIFY — trusted by 50,000+ users, 4.9/5 average rating. Personalized for you, gym & home workouts, nutrition plan, track your progress."
        width={853}
        height={1844}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />

      <div className="relative flex flex-col items-center gap-3 px-6 pt-6 pb-10 text-center">
        <GlowButton
          variant="cyber"
          size="xl"
          fullWidth
          pulse
          onClick={(event) => {
            fireBurst(event.clientX, event.clientY, true);
            setAuthIntent("signup");
          }}
          className="h-[4.25rem] max-w-sm text-lg tracking-tight shadow-[0_0_50px_-6px_rgba(255,199,0,0.85)]"
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
