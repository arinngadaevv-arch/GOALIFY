"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { goalLabel } from "@/lib/goalify/plan";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { centsToDollars, PRICING_TIERS } from "@/lib/goalify/pricing";

/**
 * A single, tightly-scoped conversion page: headline, one high-impact
 * visual, plan selection, and a sticky CTA. Everything that used to be a
 * separate box further down the page (value props, live stats, milestone
 * timeline, coach testimonial) has been cut — each of those competed with
 * the plan/CTA for attention instead of leading to it.
 */
export function Paywall() {
  const { answers, hydrated } = useGoalify();
  const [tier, setTier] = useState("quarterly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fire-and-forget — records that this account actually reached the
  // paywall, purely for the admin funnel (see api/user/paywall-view).
  // Never blocks rendering or the checkout flow either way.
  useEffect(() => {
    fetch("/api/user/paywall-view", { method: "POST" }).catch(() => {});
  }, []);

  const checkout = async (event: React.MouseEvent) => {
    if (loading) return;
    fireBurst(event.clientX, event.clientY, true);
    window.setTimeout(() => fireBurst(event.clientX, event.clientY, false), 90);
    navigator.vibrate?.([30, 40, 60]);

    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) {
        setError(
          body?.error ?? "Couldn't start checkout — please try again.",
        );
        setLoading(false);
        return;
      }
      // A real, hosted Lemon Squeezy checkout — this leaves the app
      // entirely. The plan only actually unlocks once Lemon Squeezy's
      // order_created webhook confirms payment and Lemon Squeezy redirects
      // back to /success; nothing here marks the purchase as complete.
      window.location.href = body.url;
    } catch {
      setError("Couldn't start checkout — please try again.");
      setLoading(false);
    }
  };

  return (
    <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-36">
      <ParticleBurstLayer />

      <header className="relative flex items-center justify-center py-6">
        <Brand />
      </header>

      {/* ------------------------------------------------------- Headline */}
      <section className="gf-anim-materialize relative text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon/18 px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] text-lime-deep uppercase">
          <Check className="size-3" strokeWidth={3} /> Analysis complete
        </span>
        <h1 className="gf-display mt-4 text-4xl leading-[1.05] font-black text-ink sm:text-5xl">
          YOUR <span className="gf-text-hype">TRANSFORMATION</span> IS READY 🔥
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Your personalised {goalLabel(answers.goal).toLowerCase()} blueprint is
          built and waiting — zero equipment, zero excuses.
        </p>
      </section>

      {/* ------------------------------------- The one big visual: trajectory */}
      <TransformationCard
        weightKg={answers.weightKg}
        targetWeightKg={answers.targetWeightKg}
        goal={goalLabel(answers.goal)}
      />

      {/* ------------------------------------------------------ Plan selection */}
      <section className="relative mt-8">
        <p className="text-center text-[11px] font-black tracking-[0.16em] text-mist uppercase">
          Choose your plan
        </p>
        <div className="mt-4 grid gap-3">
          {PRICING_TIERS.map((option) => {
            const active = option.id === tier;
            const price = centsToDollars(option.priceCents);
            const was = centsToDollars(option.wasCents);
            const saved = Math.round((1 - price / was) * 100);

            if (option.popular) {
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTier(option.id)}
                  aria-pressed={active}
                  className={clsx(
                    "gf-press relative flex flex-col gap-3 rounded-3xl border-2 border-[#FFC700]/70 bg-gradient-to-br from-[#FFC700]/18 via-[#FFC700]/6 to-transparent p-6 text-left transition-all duration-300",
                    "shadow-[0_0_0_1px_rgba(255,199,0,0.15),0_0_48px_-14px_rgba(255,199,0,0.7)]",
                    active &&
                      "shadow-[0_0_0_3px_#FFC700,0_0_48px_-10px_rgba(255,199,0,0.9)]",
                  )}
                >
                  <span className="gf-glow-electric absolute -top-3.5 right-5 rounded-full bg-[#FFC700] px-3 py-1 text-[10px] font-black tracking-[0.08em] whitespace-nowrap text-[#1a1100] uppercase">
                    {option.badge}
                  </span>
                  <span className="flex items-center gap-3">
                    <span
                      className={clsx(
                        "grid size-7 shrink-0 place-items-center rounded-full transition-all",
                        active ? "bg-[#FFC700] text-[#1a1100]" : "border-2 border-[#FFC700]/40",
                      )}
                      aria-hidden
                    >
                      {active && <Check className="size-4.5" strokeWidth={3.5} />}
                    </span>
                    <span className="text-lg font-extrabold whitespace-nowrap text-ink">
                      {option.label}
                    </span>
                  </span>
                  <span className="flex items-end justify-between gap-3">
                    <span className="inline-flex shrink-0 items-center rounded-full bg-[#FFC700]/20 px-2 py-0.5 text-[11px] font-black whitespace-nowrap text-[#FFC700]">
                      SAVE {saved}%
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="gf-numeric block text-3xl font-black whitespace-nowrap text-[#FFC700]">
                        ${price.toFixed(2)}
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold whitespace-nowrap text-ink-soft">
                        {option.billedLabel}
                      </span>
                    </span>
                  </span>
                </button>
              );
            }

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTier(option.id)}
                aria-pressed={active}
                className={clsx(
                  "gf-press flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300",
                  active
                    ? "border-electric/50 bg-electric/6"
                    : "border-ink/10 opacity-70 hover:opacity-100",
                )}
              >
                <span
                  className={clsx(
                    "grid size-6 shrink-0 place-items-center rounded-full border-2 transition-all",
                    active ? "border-electric bg-electric text-white" : "border-ink/15",
                  )}
                  aria-hidden
                >
                  {active && <Check className="size-4" strokeWidth={3.5} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-mist">
                    Save {saved}%
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="gf-numeric block text-lg font-extrabold text-ink">
                    ${price.toFixed(2)}
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-haze">
                    {option.billedLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------- Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-electric/20 bg-[#0b0e14]/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-2xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)]">
          {error && (
            <p className="mb-2 rounded-xl bg-red-500/15 px-3.5 py-2.5 text-center text-xs font-semibold text-red-300">
              {error}
            </p>
          )}

          <GlowButton
            variant="cyber"
            size="lg"
            fullWidth
            pulse
            className="text-base tracking-tight shadow-[0_0_44px_-8px_rgba(255,199,0,0.8)]"
            disabled={!hydrated || loading}
            onClick={checkout}
          >
            {loading ? (
              <Loader2 className="size-4.5 animate-spin" />
            ) : (
              <Lock className="size-4.5" />
            )}
            CLAIM MY DISCOUNT &amp; START PLAN ⚡
          </GlowButton>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
              <ShieldCheck className="size-3 text-electric" />
              30-Day Guarantee
            </span>
            <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
              <Lock className="size-3 text-electric" />
              Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * The page's one big visual: an AI-generated before/after example paired
 * with the user's own target numbers, replacing the old wall of separate
 * stat cards, a line chart, and a milestone timeline. The photo is a
 * stock illustrative example (not a specific member's result), so the
 * caption underneath says so rather than letting it read as a verified
 * case study.
 */
function TransformationCard({
  weightKg,
  targetWeightKg,
  goal,
}: {
  weightKg: number;
  targetWeightKg: number;
  goal: string;
}) {
  return (
    <div className="gf-anim-rise relative mt-6 overflow-hidden rounded-3xl border-2 border-[#FFC700]/45 bg-gradient-to-b from-[#FFC700]/12 via-[#161B26] to-[#0b0e14] p-6 shadow-[0_0_0_1px_rgba(255,199,0,0.12),0_0_54px_-16px_rgba(255,199,0,0.55)]">
      <p className="text-center text-[11px] font-black tracking-[0.18em] text-[#FFC700] uppercase">
        Your 6-month trajectory
      </p>

      <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#FFC700]/30">
        <Image
          src="/quiz/f20b9caa-72ee-4cd9-aeed-8019d57ba841.png"
          alt="Illustrative six-month before-and-after transformation example"
          width={1448}
          height={1086}
          sizes="(min-width: 640px) 512px, 100vw"
          className="h-auto w-full object-cover"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0e14]/55 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-extrabold text-ink">
        <span>{weightKg} kg</span>
        <svg
          viewBox="0 0 24 24"
          className="size-4 shrink-0 text-[#FFC700]"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <span>{targetWeightKg} kg</span>
      </div>
      <p className="mt-1 text-center text-xs font-bold text-ink-soft">
        {goal} · 6-month transformation (24 weeks)
      </p>
      <p className="mt-1 text-center text-[10px] text-haze">
        AI-generated illustrative example, not an actual member — real
        results depend on consistency.
      </p>
    </div>
  );
}
