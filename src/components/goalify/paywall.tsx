"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  Check,
  Cpu,
  Loader2,
  Lock,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { goalLabel } from "@/lib/goalify/plan";
import type { NutritionTargets, QuizAnswers, Workout } from "@/lib/goalify/types";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";
import { DesktopAmbientBackdrop } from "@/components/goalify/quiz/desktop-ambient-backdrop";
import { centsToDollars, PRICING_TIERS, type CheckoutTier } from "@/lib/goalify/pricing";

/** Roughly how many days each billing period actually covers — used only
 * to derive the "$X/week" framing shown on every pricing card. The exact
 * total (and what actually gets charged) always stays visible right next
 * to it; this never replaces that number, only sits above it. */
const PERIOD_DAYS: Record<CheckoutTier, number> = {
  monthly: 30,
  quarterly: 91,
  annual: 365,
};

function centsToWeekly(cents: number, tier: CheckoutTier): number {
  const weeks = PERIOD_DAYS[tier] / 7;
  return cents / 100 / weeks;
}

/**
 * A single, tightly-scoped conversion page: headline, the plan actually
 * built for this person, pricing, then supporting proof, then a sticky
 * CTA. Pricing sits high — right after the personalized plan summary, not
 * buried below a big hero image — so someone doesn't have to scroll to
 * find out what this costs. But it isn't the very first thing either: the
 * plan summary comes first on purpose, so the page reads as "here's what
 * we built for you" before it reads as "here's the price" — leading with
 * three dollar amounts straight off the headline looked like a landing
 * page for a subscription, not a coach who actually looked at your answers.
 */
export function Paywall() {
  const { answers, targets, todaysWorkout, hydrated } = useGoalify();
  const [tier, setTier] = useState("quarterly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read out for the sticky footer's price line, kept in sync with
  // whichever card the user has tapped in the "Choose your plan" section.
  const selectedTier = PRICING_TIERS.find((option) => option.id === tier) ?? PRICING_TIERS[0];
  const selectedPrice = centsToDollars(selectedTier.priceCents);

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
      const res = await fetch("/api/checkout/whop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok || !body?.url) {
        setError(body?.error ?? "Couldn't start checkout — please try again.");
        setLoading(false);
        return;
      }
      // A real, per-user hosted Whop checkout (see api/checkout/whop) —
      // this leaves the app entirely. Nothing here marks the purchase as
      // complete: the plan only actually unlocks once Whop's
      // payment.succeeded webhook confirms payment (see
      // api/webhooks/whop), which reads the userId this checkout was
      // created with back out of the payment's metadata.
      window.location.href = body.url;
    } catch {
      setError("Couldn't start checkout — please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <DesktopAmbientBackdrop />
      <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-36">
      <ParticleBurstLayer />

      {/* ------------------------------------------------------------ Hero
          Edge-to-edge photo instead of a plain centered logo header — the
          page should open on the aspiration, not a wordmark. The brand and
          the real trust signal (never a fabricated "X just subscribed"
          ticker — see CheckoutTrustBadge's own comment) float on top of it,
          the same position a native paywall's logo/social-proof pill
          usually sits, so the pattern carries over without inventing data. */}
      <div className="gf-anim-materialize relative -mx-5 h-[46dvh] max-h-96 min-h-64 w-[calc(100%+2.5rem)] overflow-hidden">
        <Image
          src="/quiz/vision-hero-flex-back.png"
          alt="Athletic build — the physique this plan is built to get you toward"
          fill
          priority
          sizes="(min-width: 640px) 640px, 100vw"
          className="object-cover object-top"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/10 to-transparent"
          aria-hidden
        />
        <div className="absolute inset-x-5 top-4 flex items-center justify-between">
          <Brand />
        </div>
        <div className="absolute inset-x-5 bottom-4">
          <div className="gf-glass inline-flex rounded-full px-3.5 py-2">
            <CheckoutTrustBadge />
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------- Headline */}
      <section className="relative -mt-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-neon/18 px-3 py-1.5 text-[11px] font-bold tracking-[0.1em] text-lime-deep uppercase">
          <Check className="size-3" strokeWidth={3} /> Analysis complete
        </span>
        <h1 className="gf-display mt-3 text-5xl leading-[0.98] font-black tracking-tight text-ink sm:text-6xl">
          GET YOUR <span className="gf-text-hype">PLAN</span>
        </h1>
        <span
          className="mx-auto mt-3 block h-1 w-14 rounded-full bg-[#FFC700]"
          aria-hidden
        />
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
          A {goalLabel(answers.goal).toLowerCase()} program built around your
          goal, schedule, and starting point — no equipment required.
        </p>
      </section>

      {/* ------------------------------------------------- The "why": what's
          inside. Comes before pricing on purpose — see the file-level
          comment above. */}
      <PlanSummaryCard answers={answers} targets={targets} todaysWorkout={todaysWorkout} />

      {/* ------------------------------------------------------ Plan selection
          Right after the plan summary — see the file-level comment above. */}
      <section className="gf-anim-rise relative mt-6">
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
                    {option.trialDays ? `FREE ${option.trialDays}-DAY TRIAL` : option.badge}
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
                      {option.trialDays ? (
                        // The trial itself leads — that's the actual point of
                        // tapping this card — with what it becomes afterward
                        // spelled out underneath, never hidden.
                        <>
                          <span className="gf-numeric block text-3xl font-black whitespace-nowrap text-[#FFC700]">
                            FREE
                          </span>
                          <span className="mt-1 block text-[11px] font-semibold whitespace-nowrap text-ink-soft">
                            then ${centsToWeekly(option.priceCents, option.id).toFixed(2)}/wk
                            (${price.toFixed(2)} {option.billedLabel})
                          </span>
                        </>
                      ) : (
                        // Weekly-equivalent leads, same real total right
                        // underneath it in full — reframes the number
                        // without ever hiding what actually gets charged.
                        <>
                          <span className="gf-numeric block text-3xl font-black whitespace-nowrap text-[#FFC700]">
                            ${centsToWeekly(option.priceCents, option.id).toFixed(2)}
                            <span className="text-base font-bold">/wk</span>
                          </span>
                          <span className="mt-1 block text-[11px] font-semibold whitespace-nowrap text-ink-soft">
                            ${price.toFixed(2)} {option.billedLabel}
                          </span>
                        </>
                      )}
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
                    ${centsToWeekly(option.priceCents, option.id).toFixed(2)}
                    <span className="text-xs font-bold text-mist">/wk</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-haze">
                    ${price.toFixed(2)} {option.billedLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------- The one big visual: trajectory */}
      <TransformationCard
        weightKg={answers.weightKg}
        targetWeightKg={answers.targetWeightKg}
        goal={goalLabel(answers.goal)}
      />

      {/* ----------------------------------------------------------- Sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-electric/20 bg-[#0b0e14]/95 backdrop-blur-md">
        <div className="mx-auto w-full max-w-2xl px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.65rem)]">
          {error && (
            <p className="mb-2 rounded-xl bg-red-500/15 px-3.5 py-2.5 text-center text-xs font-semibold text-red-300">
              {error}
            </p>
          )}

          {/* Same reassurance-line pattern a native paywall puts right
              above its CTA — kept honest to how GOALIFY actually bills.
              Deliberately NOT "cancel anytime from Settings": that screen's
              cancel button isn't wired to anything yet. Whop gives every
              buyer their own whop.com account to manage/cancel a
              membership directly — that's what "manage at whop.com" below
              actually points to, not an in-app flow that doesn't exist. */}
          <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-lime-deep">
            {selectedTier.trialDays ? (
              <>
                <Check className="size-3.5" strokeWidth={3} />
                No payment now — {selectedTier.trialDays}-day free trial
              </>
            ) : (
              <>
                <Lock className="size-3.5" strokeWidth={3} />
                Secure checkout · Instant access
              </>
            )}
          </p>

          {/* The price, front and center in the one part of the page that's
              visible on the very first frame — no scrolling required to
              see what this actually costs. */}
          <p className="mt-1 text-center">
            {selectedTier.trialDays ? (
              <>
                <span className="gf-numeric text-lg font-black text-[#FFC700]">
                  Free for {selectedTier.trialDays} days
                </span>{" "}
                <span className="text-[11px] font-bold text-ink-soft">
                  then ${selectedPrice.toFixed(2)} {selectedTier.billedLabel}
                </span>
              </>
            ) : (
              <>
                <span className="gf-numeric text-lg font-black text-[#FFC700]">
                  ${selectedPrice.toFixed(2)}
                </span>{" "}
                <span className="text-[11px] font-bold text-ink-soft">
                  {selectedTier.billedLabel}
                </span>
              </>
            )}
          </p>

          <GlowButton
            variant="cyber"
            size="lg"
            fullWidth
            pulse
            className="mt-2 text-base tracking-tight shadow-[0_0_44px_-8px_rgba(255,199,0,0.8)]"
            disabled={!hydrated || loading}
            onClick={checkout}
          >
            {loading ? (
              <Loader2 className="size-4.5 animate-spin" />
            ) : (
              <Lock className="size-4.5" />
            )}
            {selectedTier.trialDays ? "START MY FREE TRIAL" : "START MY PLAN"}
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

          {/* The actual billing terms, spelled out — the fine-print
              disclosure a real subscription checkout carries, not buried
              or omitted. Only states what this checkout actually does
              today (see the comment above the reassurance line, above). */}
          <p className="mt-2 text-center text-[10px] leading-snug text-haze">
            {selectedTier.trialDays ? (
              <>
                Your {selectedTier.trialDays}-day free trial starts today —
                you won&apos;t be charged until it ends. After that,
                you&apos;ll be charged ${selectedPrice.toFixed(2)},{" "}
                {selectedTier.billedLabel}, until you cancel. Manage or
                cancel anytime at whop.com.
              </>
            ) : (
              <>
                You&apos;ll be charged ${selectedPrice.toFixed(2)} today,{" "}
                {selectedTier.billedLabel}.
              </>
            )}
          </p>
        </div>
      </div>
      </main>
    </>
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
    <div className="gf-anim-rise relative mt-4 overflow-hidden rounded-3xl border-2 border-[#FFC700]/45 bg-gradient-to-b from-[#FFC700]/12 via-[#161B26] to-[#0b0e14] p-5 shadow-[0_0_0_1px_rgba(255,199,0,0.12),0_0_54px_-16px_rgba(255,199,0,0.55)]">
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
          className="h-auto w-full object-contain"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b0e14]/55 via-transparent to-transparent"
          aria-hidden
        />
      </div>

      <div className="mt-3 flex items-center justify-center gap-2 text-sm font-extrabold text-ink">
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

/**
 * The "why" bridge between the quiz and the offer — every tag and number
 * here is read straight off the user's real answers/computed targets, not
 * invented copy, so it reads as an actual plan rather than a sales page.
 */
function PlanSummaryCard({
  answers,
  targets,
  todaysWorkout,
}: {
  answers: QuizAnswers;
  targets: NutritionTargets;
  todaysWorkout: Workout;
}) {
  const highlights = [goalLabel(answers.goal)];
  if (answers.joints.some((joint) => joint !== "none")) {
    highlights.push("Joint-friendly approach");
  }
  highlights.push(`${answers.sessionLength}-min sessions`);
  highlights.push(`${answers.daysPerWeek} days/week`);

  return (
    <div className="gf-glass gf-anim-rise relative mt-3 rounded-3xl p-5">
      <p className="text-center text-[11px] font-black tracking-[0.16em] text-electric uppercase">
        Your custom plan
      </p>

      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {highlights.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-electric/10 px-3 py-1 text-[11px] font-bold text-electric"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/8 pt-4">
        <div className="text-center">
          <p className="gf-numeric text-xl font-black text-ink">
            {targets.calories.toLocaleString()}
          </p>
          <p className="text-[10px] font-bold tracking-[0.1em] text-mist uppercase">
            Daily target
          </p>
        </div>
        <div className="text-center">
          <p className="gf-numeric text-xl font-black text-ink">
            {todaysWorkout.durationMinutes} min
          </p>
          <p className="text-[10px] font-bold tracking-[0.1em] text-mist uppercase">
            First session
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
        First up: <span className="font-bold text-ink">{todaysWorkout.title}</span> —{" "}
        {todaysWorkout.exercises.length} exercises, zero equipment.
      </p>
    </div>
  );
}

/** The same honest real-review pattern used on the analyzing screen's
 * TrustCard — never a fabricated "1,250+ members" number. Before any
 * review exists, it shows an honest fallback instead of an invented one. */
function CheckoutTrustBadge() {
  const [summary, setSummary] = useState<{ count: number; average: number | null } | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/reviews/summary")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setSummary(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const hasReviews = summary && summary.count > 0 && summary.average !== null;

  return (
    <div className="flex items-center justify-center gap-1.5">
      {hasReviews ? (
        <>
          <div className="flex items-center gap-0.5 text-electric">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-3 fill-current" />
            ))}
          </div>
          <span className="text-[11px] font-bold text-ink-soft">
            {summary!.average!.toFixed(1)} · {summary!.count}+ review
            {summary!.count === 1 ? "" : "s"}
          </span>
        </>
      ) : (
        <>
          <Cpu className="size-3.5 text-electric" />
          <span className="text-[11px] font-bold text-ink-soft">
            AI-Personalized Plan
          </span>
        </>
      )}
    </div>
  );
}
