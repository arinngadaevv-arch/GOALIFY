"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Lock, ShieldCheck } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { goalLabel } from "@/lib/goalify/plan";
import { Brand } from "@/components/goalify/brand";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";

const TIERS = [
  {
    id: "monthly",
    label: "1 Month",
    price: 29.99,
    perWeek: 6.92,
    was: 39.99,
    billedLabel: "billed monthly",
  },
  {
    id: "quarterly",
    label: "3 Months",
    price: 49.99,
    perWeek: 3.84,
    was: 89.99,
    billedLabel: "billed every 3 months",
    badge: "MOST POPULAR",
    popular: true,
  },
  {
    id: "annual",
    label: "12 Months",
    price: 119.99,
    perWeek: 2.3,
    was: 239.99,
    billedLabel: "billed annually",
    badge: "BEST VALUE",
  },
];

/**
 * A single, tightly-scoped conversion page: headline, one high-impact
 * visual, plan selection, and a sticky CTA. Everything that used to be a
 * separate box further down the page (value props, live stats, milestone
 * timeline, coach testimonial) has been cut — each of those competed with
 * the plan/CTA for attention instead of leading to it.
 */
export function Paywall() {
  const router = useRouter();
  const { answers, purchase, hydrated } = useGoalify();
  const [tier, setTier] = useState("quarterly");

  const checkout = (event: React.MouseEvent) => {
    fireBurst(event.clientX, event.clientY, true);
    window.setTimeout(() => fireBurst(event.clientX, event.clientY, false), 90);
    navigator.vibrate?.([30, 40, 60]);
    purchase();
    router.push("/success");
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
          {TIERS.map((option) => {
            const active = option.id === tier;
            const saved = Math.round((1 - option.price / option.was) * 100);

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
                        ${option.perWeek.toFixed(2)}
                        <span className="ml-0.5 text-xs font-bold text-[#FFC700]/70">
                          /wk
                        </span>
                      </span>
                      <span className="mt-1 block text-[11px] font-semibold whitespace-nowrap text-ink-soft">
                        ${option.price.toFixed(2)} {option.billedLabel}
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
                    ${option.perWeek.toFixed(2)}
                    <span className="ml-0.5 text-[10px] font-bold text-mist">/wk</span>
                  </span>
                  <span className="mt-0.5 block text-[10px] font-semibold text-haze">
                    ${option.price.toFixed(2)} {option.billedLabel}
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
          <GlowButton
            variant="cyber"
            size="lg"
            fullWidth
            pulse
            className="text-base tracking-tight shadow-[0_0_44px_-8px_rgba(255,199,0,0.8)]"
            disabled={!hydrated}
            onClick={checkout}
          >
            <Lock className="size-4.5" />
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
 * The page's one big visual: an illustrated "today" vs. "goal" silhouette
 * pair with the actual target numbers, replacing the old wall of separate
 * stat cards, a line chart, and a milestone timeline. Deliberately labeled
 * as illustrated, never a photo — there's no real before/after data to show.
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
      <div className="mt-5 flex items-center justify-center gap-3 sm:gap-6">
        <SilhouettePanel label="Today" sublabel={`${weightKg} kg`} intensity={0.16} />
        <svg
          viewBox="0 0 24 24"
          className="size-7 shrink-0 text-[#FFC700]"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <SilhouettePanel
          label="Month 6"
          sublabel={`${targetWeightKg} kg`}
          intensity={0.85}
          lit
        />
      </div>
      <p className="mt-4 text-center text-xs font-bold text-ink-soft">
        {goal} · 6-month transformation (24 weeks)
      </p>
      <p className="mt-1 text-center text-[10px] text-haze">
        Illustrated projection, not a photo — real results depend on
        consistency.
      </p>
    </div>
  );
}

function SilhouettePanel({
  label,
  sublabel,
  intensity,
  lit = false,
}: {
  label: string;
  sublabel: string;
  intensity: number;
  lit?: boolean;
}) {
  const waistInset = 6 * intensity;
  return (
    <div className="text-center">
      <div
        className={clsx(
          "gf-photo-bed relative mx-auto grid h-32 w-24 place-items-center overflow-hidden rounded-2xl sm:h-40 sm:w-28",
          lit && "gf-glow-electric",
        )}
      >
        <svg viewBox="0 0 60 90" className="h-4/5 w-3/5 text-[#FFC700]" aria-hidden>
          <path
            d={`M14,10 L46,10 Q49,10 47,14 L${42 + waistInset},32 Q${40 + waistInset},40 ${34 - waistInset},44 L${26 + waistInset},44 Q${20 - waistInset},40 ${18 - waistInset},32 L13,14 Q11,10 14,10 Z`}
            fill="currentColor"
            fillOpacity={0.16 + intensity * 0.3}
            stroke="currentColor"
            strokeOpacity={0.45 + intensity * 0.4}
            strokeWidth={0.8}
          />
          <path
            d="M16,46 L44,46 L41,86 Q41,88 38,88 L33,88 Q31,88 31,86 L30,58 L29,86 Q29,88 27,88 L22,88 Q19,88 19,86 Z"
            fill="currentColor"
            fillOpacity={0.16 + intensity * 0.3}
            stroke="currentColor"
            strokeOpacity={0.45 + intensity * 0.4}
            strokeWidth={0.8}
          />
          {intensity > 0.3 && (
            <g stroke="currentColor" strokeOpacity={0.5} strokeWidth={0.5} strokeLinecap="round">
              <path d="M30,16 L30,32" />
              <path d="M20,20 Q30,23 40,20" />
            </g>
          )}
        </svg>
      </div>
      <p className="gf-display mt-2 text-sm font-extrabold text-ink">{label}</p>
      <p className="gf-numeric text-[11px] font-bold text-mist">{sublabel}</p>
    </div>
  );
}
