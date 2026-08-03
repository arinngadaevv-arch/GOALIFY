"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2, ShieldAlert } from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";

/**
 * The one mandatory gate every account — Google or email, brand new or
 * pre-existing — must clear before anything in the app shell is usable.
 * Mounted once around the whole (goalify) layout so it catches every route,
 * not just the ones that happen to render after signup; there's no close
 * button and the backdrop doesn't dismiss it on purpose.
 */
export function TermsGate({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession();
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mustAccept =
    status === "authenticated" && session?.user && !session.user.hasAcceptedTerms;

  async function handleContinue() {
    if (!checked || submitting) return;
    setSubmitting(true);
    setError(null);

    // This is a liability waiver, not a preference toggle — the app can't
    // let someone through on the strength of a click alone, since the whole
    // point is a durable record that the write actually landed. What CAN be
    // cut is the redundant second round trip this used to cost: passing the
    // known new value straight into `update()` lets the jwt callback (see
    // auth.ts) trust it instead of re-querying the DB it was just told.
    // A hard timeout still guarantees the spinner can't hang forever — a
    // slow/dropped request surfaces as a clear, retryable error instead.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const res = await fetch("/api/user/accept-terms", {
        method: "POST",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("request failed");
      await update({ hasAcceptedTerms: true });
    } catch {
      setError(
        "That's taking longer than expected. Please check your connection and try again."
      );
      setSubmitting(false);
    } finally {
      clearTimeout(timeout);
    }
  }

  return (
    <>
      {children}
      {mustAccept && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" aria-hidden />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-gate-heading"
            className="gf-anim-rise relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#12151d] p-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] shadow-[0_-20px_60px_-20px_rgba(0,0,0,0.8)] sm:rounded-3xl sm:pb-6 sm:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
          >
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#FFC700]/12 text-[#FFC700]">
              <ShieldAlert className="size-6" strokeWidth={2.25} />
            </div>
            <h2
              id="terms-gate-heading"
              className="gf-display mt-4 text-center text-2xl leading-tight font-black text-white"
            >
              Before you start
            </h2>
            <p className="mt-2 text-center text-sm leading-relaxed text-white/65">
              One quick thing — please read and accept this to unlock your
              workouts.
            </p>

            <div className="mt-5 max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-white/70">
              <p>
                GOALIFY&apos;s workouts are performed at home, without
                supervision. By continuing, you agree that you perform every
                exercise, stretch and routine in this app entirely at your
                own risk. GOALIFY, its creators and staff are not liable for
                any personal injury, health complication, or property or
                home damage that may result from your use of the app. If you
                have any medical condition or injury, or are pregnant,
                consult a doctor before starting, and stop immediately if
                you feel pain, dizziness or discomfort.
              </p>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-red-500/15 px-3.5 py-2.5 text-xs font-semibold text-red-300">
                {error}
              </p>
            )}

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => setChecked(event.target.checked)}
                className="mt-0.5 size-5 shrink-0 accent-[#FFC700]"
              />
              <span className="text-sm font-semibold text-white/85">
                I agree to the Terms of Service &amp; Health Disclaimer
              </span>
            </label>

            <GlowButton
              type="button"
              variant="cyber"
              size="lg"
              fullWidth
              disabled={!checked || submitting}
              onClick={handleContinue}
              className="mt-5"
            >
              {submitting && <Loader2 className="size-4.5 animate-spin" />}
              Continue to App
            </GlowButton>
          </div>
        </div>
      )}
    </>
  );
}
