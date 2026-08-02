"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Bolt,
  Calculator,
  Check,
  CreditCard,
  Lock,
  ScanFace,
  ShieldCheck,
  Star,
  TrendingDown,
  Trophy,
  Zap,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import {
  goalLabel,
  levelLabel,
  milestones,
  painLabel,
  planHighlights,
  planName,
  projectWeight,
  visionLabel,
  weeksToTarget,
} from "@/lib/goalify/plan";
import { COACH } from "@/lib/goalify/coach";
import { Brand } from "@/components/goalify/brand";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { IconBadge } from "@/components/goalify/ui/icon-badge";
import { CoachAvatar } from "@/components/goalify/ui/visual-slot";
import { CoachBubble } from "@/components/goalify/coach/coach-bubble";
import { ParticleField } from "@/components/goalify/ui/particles";
import { CountUp } from "@/components/goalify/ui/count-up";
import { BuyerTicker } from "@/components/goalify/buyer-ticker";
import { Pill, Stat } from "@/components/goalify/ui/stat";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";

const OFFER_SECONDS = 10 * 60;

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

const VALUE_PROPS = [
  {
    icon: Calculator,
    label: "Personalized Daily Calorie & Macro Target",
  },
  {
    icon: Bolt,
    label: "15-Min No-Equipment Burn Routines",
  },
  {
    icon: ScanFace,
    label: "AI Form Correction",
  },
  {
    icon: ShieldCheck,
    label: "Guaranteed Visible Results — or your money back",
  },
];

export function Paywall() {
  const router = useRouter();
  const { answers, targets, purchase, hydrated } = useGoalify();
  const [tier, setTier] = useState("quarterly");
  const [remaining, setRemaining] = useState(OFFER_SECONDS);

  // Countdown starts on mount so server and client render the same first frame.
  useEffect(() => {
    const timer = setInterval(
      () => setRemaining((value) => (value > 0 ? value - 1 : 0)),
      1000,
    );
    return () => clearInterval(timer);
  }, []);

  const projection = useMemo(() => projectWeight(answers), [answers]);
  const highlights = useMemo(() => planHighlights(answers), [answers]);
  const weeks = weeksToTarget(answers);
  const losing = answers.targetWeightKg < answers.weightKg;

  const checkout = (event: React.MouseEvent) => {
    fireBurst(event.clientX, event.clientY, true);
    window.setTimeout(() => fireBurst(event.clientX, event.clientY, false), 90);
    navigator.vibrate?.([30, 40, 60]);
    purchase();
    router.push("/success");
  };

  return (
    <main className="gf-cyber-scope relative mx-auto w-full max-w-2xl px-5 pb-40">
      {/* Sleek sticky countdown — replaces the old boxed-in alarm timer.
          Sticks to the top of the viewport the instant it's scrolled to,
          so the urgency never disappears without shouting for attention. */}
      <div className="sticky top-0 z-50 -mx-5 flex items-center justify-center gap-2 border-b border-electric/25 bg-[#0b0e14]/95 px-4 py-2.5 backdrop-blur-md">
        <Zap className="size-3.5 shrink-0 text-electric" strokeWidth={2.6} />
        <p className="gf-numeric text-[11px] font-bold text-ink-soft sm:text-xs">
          <span className="font-black text-electric">SPECIAL 80% DISCOUNT</span>{" "}
          reserved for{" "}
          <span
            className={clsx(
              "font-black text-electric",
              remaining > 0 && remaining < 120 && "gf-anim-flicker text-lime-neon",
            )}
          >
            {formatCountdown(remaining)}
          </span>
        </p>
      </div>

      <ParticleField />
      <ParticleBurstLayer />

      <header className="relative flex items-center justify-between py-6">
        <Brand />
        <Pill tone="lime">
          <Check className="size-3" strokeWidth={3} /> Analysis complete
        </Pill>
      </header>

      {/* --------------------------------------- Compact victory / unlock beat */}
      <section className="gf-anim-materialize relative text-center">
        <div className="relative mx-auto grid size-16 place-items-center">
          <span
            className="gf-anim-burst absolute size-14 rounded-full border-2 border-lime-neon/50"
            aria-hidden
          />
          <IconBadge
            icon={Trophy}
            size="md"
            className="gf-glow-lime relative rounded-full"
          />
        </div>
        <p className="mt-3 text-[11px] font-black tracking-[0.2em] text-lime-deep uppercase">
          {planName(answers)} plan — ready
        </p>
      </section>

      {/* --------------------------------------------------- The offer, up top */}
      <section className="relative mt-4 text-center">
        <h1 className="gf-display text-4xl leading-[1.05] font-black text-ink sm:text-5xl">
          YOUR <span className="gf-text-hype">TRANSFORMATION</span> IS READY 🔥
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-soft">
          Your bodyweight blueprint — built for a{" "}
          {levelLabel(answers.level).toLowerCase()}-stage athlete chasing{" "}
          {goalLabel(answers.goal).toLowerCase()}, designed around{" "}
          {painLabel(answers.painTrigger)} — is locked in and waiting. Zero
          equipment. Zero excuses.
        </p>

        {/* ------------------------------------------------- What you unlock */}
        <div className="gf-anim-rise mt-6 grid grid-cols-2 gap-3 text-left">
          {VALUE_PROPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="gf-glass flex items-start gap-3 rounded-2xl p-4"
            >
              <span className="gf-glow-electric grid size-9 shrink-0 place-items-center rounded-xl bg-electric/15 text-electric">
                <Icon className="size-4.5" strokeWidth={2.4} />
              </span>
              <span className="mt-0.5 text-xs leading-snug font-bold text-ink">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 text-left">
          {TIERS.map((option) => {
            const active = option.id === tier;
            const saved = Math.round((1 - option.price / option.was) * 100);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTier(option.id)}
                aria-pressed={active}
                className={clsx(
                  "gf-glass gf-press relative flex items-center gap-4 rounded-3xl text-left transition-all duration-300",
                  option.popular
                    ? clsx(
                        "mt-4 border-2 border-[#FFC700]/70 bg-gradient-to-br from-[#FFC700]/16 via-[#FFC700]/6 to-transparent p-6 shadow-[0_0_0_1px_rgba(255,199,0,0.15),0_0_44px_-14px_rgba(255,199,0,0.65)]",
                        active &&
                          "shadow-[0_0_0_3px_#FFC700,0_0_44px_-10px_rgba(255,199,0,0.85)]",
                      )
                    : clsx(
                        "p-5",
                        active
                          ? "border-electric/50 gf-glow-electric"
                          : "hover:border-electric/25",
                      ),
                )}
              >
                {option.badge && (
                  <span
                    className={clsx(
                      "absolute rounded-full px-3 py-1 text-[10px] font-black whitespace-nowrap uppercase tracking-[0.08em]",
                      option.popular
                        ? "gf-glow-electric -top-3.5 right-5 bg-[#FFC700] text-[#1a1100]"
                        : "-top-2.5 right-5 bg-lime-neon text-ink",
                    )}
                  >
                    {option.badge}
                  </span>
                )}
                <span
                  className={clsx(
                    "grid shrink-0 place-items-center rounded-full transition-all",
                    option.popular ? "size-7" : "size-6",
                    active ? "bg-lime-neon text-ink" : "border-2 border-ink/12",
                  )}
                  aria-hidden
                >
                  {active && (
                    <Check
                      className={option.popular ? "size-4.5" : "size-4"}
                      strokeWidth={3.5}
                    />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={clsx(
                      "block font-extrabold text-ink",
                      option.popular ? "text-lg" : "text-base",
                    )}
                  >
                    {option.label}
                  </span>
                  <span className="mt-1 block text-[11px] font-bold text-lime-deep">
                    Save {saved}%
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span
                    className={clsx(
                      "gf-numeric block font-black text-electric",
                      option.popular ? "text-3xl" : "text-2xl",
                    )}
                  >
                    ${option.perWeek.toFixed(2)}
                    <span className="ml-0.5 text-xs font-bold text-electric/70">
                      /wk
                    </span>
                  </span>
                  <span className="mt-1 block text-[11px] font-semibold text-ink-soft">
                    ${option.price.toFixed(2)} {option.billedLabel}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Fixed CTA bar — pinned to the bottom of the viewport at every
            scroll position on the page (not just within this section), so
            the primary action is never more than a thumb's reach away no
            matter how far the user scrolls. Deliberately slim (no repeated
            price line — that's already on the card above) so it doesn't
            eat so much of a normal phone's viewport that it covers the
            tier cards themselves before the user has scrolled at all. */}
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

            {/* ----------------------------------- Trust badges & risk reversal */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
                <ShieldCheck className="size-3 text-electric" />
                Money-back guarantee
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
                <Lock className="size-3 text-electric" />
                256-bit encrypted
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-ink-soft">
                <CreditCard className="size-3 text-electric" />
                Visa · Mastercard · Apple Pay
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1 text-lime-deep">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-4 fill-current" />
          ))}
          <span className="ml-2 text-sm font-semibold text-ink-soft">
            4.9 from 21,480 members
          </span>
        </div>
      </section>

      <CoachBubble
        message={`I've got everything I need. This plan is built to make you feel ${visionLabel(answers.vision)} in 30 days — but it only works if you start today.`}
        tone="electric"
        className="relative mt-10"
      />

      <GlassCard
        deep
        className="gf-anim-rise gf-delay-1 relative mt-6 grid grid-cols-3 gap-4 p-6"
      >
        <div className="text-center">
          <p className="gf-numeric text-2xl font-extrabold text-electric">
            <CountUp to={targets.calories} />
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">
            kcal / day
          </p>
        </div>
        <div className="text-center">
          <p className="gf-numeric text-2xl font-extrabold text-lime-deep">
            <CountUp to={targets.protein} />
          </p>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-mist uppercase">
            g protein
          </p>
        </div>
        <Stat
          value={weeks > 0 ? weeks : "—"}
          label="weeks to target"
          tone="ink"
        />
      </GlassCard>

      {/* ------------------------------------------------ Live proof ticker */}
      <div className="relative mt-4">
        <BuyerTicker />
      </div>

      {/* ------------------------------------------------------- Projection */}
      <section className="gf-anim-rise gf-delay-2 mt-8">
        <div className="text-center">
          <Pill tone="lime">30-day transformation</Pill>
          <h2 className="gf-display mt-3 text-2xl font-black text-ink">
            YOUR 30-DAY TRANSFORMATION
          </h2>
        </div>

        <GlassCard deep className="mt-5 overflow-hidden p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="gf-display text-lg font-extrabold text-ink">
                Projected weight curve
              </h3>
              <p className="mt-1 text-xs text-mist">
                Bodyweight training only — capped at a safe 0.75% of
                bodyweight per week.
              </p>
            </div>
            <Pill tone={losing ? "lime" : "electric"}>
              <TrendingDown
                className={clsx("size-3", !losing && "rotate-180")}
                strokeWidth={3}
              />
              {answers.weightKg} → {answers.targetWeightKg} kg
            </Pill>
          </div>
          <ProjectionChart points={projection} />

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-ink/8 pt-6">
            <SculptIndicator label="Day 1" sublabel="Today" intensity={0.16} />
            <SculptIndicator
              label={`Day ${weeks > 0 ? weeks * 7 : 30}`}
              sublabel={goalLabel(answers.goal)}
              intensity={0.42}
              lit
            />
          </div>
          <p className="mt-3 text-center text-[11px] text-haze">
            Illustrated projection, not a photo — your real results depend on
            consistency.
          </p>
        </GlassCard>
      </section>

      {/* ---------------------------------------------------------- Includes */}
      <GlassCard deep className="gf-anim-rise gf-delay-3 mt-5 p-6">
        <h2 className="gf-display text-lg font-extrabold text-ink">
          What unlocks today
        </h2>
        <ul className="mt-4 space-y-3">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-lime-neon">
                <Check className="size-3.5 text-ink" strokeWidth={3.5} />
              </span>
              <span className="text-sm leading-relaxed text-ink-soft">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </GlassCard>

      {/* --------------------------------------------- Transformation timeline */}
      <section className="gf-anim-rise gf-delay-4 relative mt-8">
        <div className="text-center">
          <Pill tone="lime">Your transformation timeline</Pill>
          <h2 className="gf-display mt-3 text-2xl font-black text-ink">
            What happens once you start
          </h2>
        </div>

        <div className="relative mt-6">
          {/* Spine connecting the milestones. */}
          <span
            className="absolute top-6 bottom-6 left-[1.65rem] w-0.5 bg-linear-to-b from-electric via-electric/40 to-lime-neon"
            aria-hidden
          />
          <div className="grid gap-3">
            {milestones(answers).map((milestone, index) => (
              <GlassCard
                key={milestone.week}
                deep
                className={`gf-anim-rise gf-delay-${index + 1} relative flex items-start gap-4 p-5`}
              >
                <IconBadge icon={milestone.icon} size="md" className="gf-glow-electric relative z-10" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black tracking-[0.14em] text-electric uppercase">
                    {milestone.week}
                  </p>
                  <p className="gf-display mt-0.5 text-lg font-extrabold text-ink">
                    {milestone.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                    {milestone.body}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Coach hype */}
      <GlassCard
        tone="electric"
        deep
        className="gf-anim-rise gf-delay-5 relative mt-8 flex items-center gap-5 p-6"
      >
        <CoachAvatar
          label="Coach"
          hint=""
          className="size-28 shrink-0"
        />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-electric">
            {COACH.name} · {COACH.role}
          </p>
          <p className="gf-display mt-1 text-xl font-extrabold text-ink">
            &ldquo;I&apos;ll count you in on every single rep.&rdquo;
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Live 3D form guidance, voice cues, and a session that adapts the
            second something hurts. You bring the effort. I&apos;ll bring
            everything else.
          </p>
        </div>
      </GlassCard>
    </main>
  );
}

/**
 * An honest, clearly-illustrated "before/after" pair — never a real photo
 * (there's no such data), just a stylized silhouette with more definition
 * lines and a tighter waist at higher `intensity`, explicitly captioned as
 * a projection so it can't be mistaken for a genuine transformation photo.
 */
function SculptIndicator({
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
  // Interpolates the waist inset and definition-line opacity between the
  // "day 1" and "goal" states so the two cards read as one progression.
  const waistInset = 6 * intensity;
  return (
    <div className="text-center">
      <div
        className={clsx(
          "gf-photo-bed relative mx-auto grid h-28 place-items-center overflow-hidden rounded-2xl",
          lit && "gf-glow-electric",
        )}
      >
        <svg viewBox="0 0 60 90" className="h-24 w-16 text-electric" aria-hidden>
          <path
            d={`M14,10 L46,10 Q49,10 47,14 L${42 + waistInset},32 Q${40 + waistInset},40 ${34 - waistInset},44 L${26 + waistInset},44 Q${20 - waistInset},40 ${18 - waistInset},32 L13,14 Q11,10 14,10 Z`}
            fill="currentColor"
            fillOpacity={0.14 + intensity * 0.3}
            stroke="currentColor"
            strokeOpacity={0.4 + intensity * 0.4}
            strokeWidth={0.8}
          />
          <path
            d="M16,46 L44,46 L41,86 Q41,88 38,88 L33,88 Q31,88 31,86 L30,58 L29,86 Q29,88 27,88 L22,88 Q19,88 19,86 Z"
            fill="currentColor"
            fillOpacity={0.14 + intensity * 0.3}
            stroke="currentColor"
            strokeOpacity={0.4 + intensity * 0.4}
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
      <p className="text-[11px] font-semibold text-mist">{sublabel}</p>
    </div>
  );
}

function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function ProjectionChart({
  points,
}: {
  points: { week: number; weight: number }[];
}) {
  const width = 520;
  const height = 150;
  const padding = 10;

  const weights = points.map((p) => p.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const span = max - min || 1;

  const coords = points.map((point, index) => {
    const x = padding + (index / (points.length - 1)) * (width - padding * 2);
    const y =
      padding + ((max - point.weight) / span) * (height - padding * 2);
    return { x, y };
  });

  const line = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height} L${coords[0].x.toFixed(1)},${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-5 w-full"
      role="img"
      aria-label={`Projected weight from ${points[0].weight} to ${points[points.length - 1].weight} kilograms over ${points.length - 1} weeks`}
    >
      <defs>
        <linearGradient id="gf-projection" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8b32c" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#e8b32c" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gf-projection)" />
      <path
        d={line}
        fill="none"
        stroke="#e8b32c"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="6"
        fill="#ff3b3b"
        stroke="#0b0e14"
        strokeWidth="3"
      />
    </svg>
  );
}
