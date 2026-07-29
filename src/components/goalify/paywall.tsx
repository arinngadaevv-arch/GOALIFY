"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Check,
  Flame,
  Lock,
  ShieldCheck,
  Sparkles,
  Star,
  Timer,
  TrendingDown,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import {
  goalLabel,
  levelLabel,
  planHighlights,
  planName,
  projectWeight,
  weeksToTarget,
} from "@/lib/goalify/plan";
import { Brand } from "@/components/goalify/brand";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { CoachAvatar } from "@/components/goalify/ui/visual-slot";
import { Pill, Stat } from "@/components/goalify/ui/stat";

const OFFER_SECONDS = 15 * 60;

const TIERS = [
  {
    id: "monthly",
    label: "1 Month",
    price: 29.99,
    perWeek: 6.92,
    was: 39.99,
  },
  {
    id: "quarterly",
    label: "3 Months",
    price: 49.99,
    perWeek: 3.84,
    was: 89.99,
    badge: "Most popular",
    popular: true,
  },
  {
    id: "annual",
    label: "12 Months",
    price: 119.99,
    perWeek: 2.3,
    was: 239.99,
    badge: "Best value",
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
  const selected = TIERS.find((t) => t.id === tier) ?? TIERS[1];
  const losing = answers.targetWeightKg < answers.weightKg;

  const checkout = () => {
    purchase();
    router.push("/success");
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-40">
      <header className="flex items-center justify-between py-6">
        <Brand />
        <Pill tone="lime">
          <Check className="size-3" strokeWidth={3} /> Analysis complete
        </Pill>
      </header>

      {/* ------------------------------------------------- Personalised result */}
      <section className="gf-anim-materialize text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-electric">
          Your personalised blueprint
        </p>
        <h1 className="gf-display mt-3 text-4xl font-black text-ink sm:text-5xl">
          The <span className="gf-text-hype">{planName(answers)}</span> plan
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-soft">
          Built for a {levelLabel(answers.level).toLowerCase()}-stage athlete
          chasing {goalLabel(answers.goal).toLowerCase()}, training{" "}
          {answers.daysPerWeek} days a week for {answers.sessionLength} minutes.
        </p>
      </section>

      <GlassCard
        deep
        className="gf-anim-rise gf-delay-1 mt-8 grid grid-cols-3 gap-4 p-6"
      >
        <Stat
          value={targets.calories.toLocaleString()}
          label="kcal / day"
          tone="electric"
        />
        <Stat value={targets.protein} label="g protein" suffix="" tone="lime" />
        <Stat
          value={weeks > 0 ? weeks : "—"}
          label="weeks to target"
          tone="ink"
        />
      </GlassCard>

      {/* ------------------------------------------------------- Projection */}
      <GlassCard deep className="gf-anim-rise gf-delay-2 mt-5 overflow-hidden p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="gf-display text-lg font-extrabold text-ink">
              Your projected curve
            </h2>
            <p className="mt-1 text-xs text-mist">
              Capped at a safe 0.75% of bodyweight per week.
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
      </GlassCard>

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

      {/* -------------------------------------------------------- Coach hype */}
      <GlassCard
        tone="electric"
        deep
        className="gf-anim-rise gf-delay-4 mt-5 flex items-center gap-5 p-6"
      >
        <CoachAvatar
          label="Coach"
          hint=""
          className="size-28 shrink-0"
        />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-electric">
            Your coach
          </p>
          <p className="gf-display mt-1 text-xl font-extrabold text-ink">
            &ldquo;I&apos;ll count you in on every rep.&rdquo;
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Live 3D form guidance, voice cues and a session that adapts when
            something hurts.
          </p>
        </div>
      </GlassCard>

      {/* ------------------------------------------------------------- Offer */}
      <section className="gf-anim-rise gf-delay-5 mt-10">
        <GlassCard tone="lime" deep className="p-5 text-center">
          <div className="flex items-center justify-center gap-2">
            <Flame className="size-4 text-lime-deep" strokeWidth={2.8} />
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-deep">
              Launch offer — 50% off
            </p>
          </div>
          <p className="gf-numeric mt-2 text-4xl font-black text-ink">
            {formatCountdown(remaining)}
          </p>
          <p className="mt-1 text-xs font-semibold text-ink-soft">
            {remaining > 0
              ? "Your discount is held while this timer runs"
              : "Offer expired — refresh to check availability"}
          </p>
        </GlassCard>

        <div className="mt-5 grid gap-3">
          {TIERS.map((option) => {
            const active = option.id === tier;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTier(option.id)}
                aria-pressed={active}
                className={clsx(
                  "gf-glass gf-press relative flex items-center gap-4 rounded-3xl p-5 text-left transition-all duration-300",
                  active
                    ? "border-electric/50 gf-glow-electric"
                    : "hover:border-electric/25",
                )}
              >
                {option.badge && (
                  <span
                    className={clsx(
                      "absolute -top-2.5 right-5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]",
                      option.popular
                        ? "bg-electric text-white"
                        : "bg-lime-neon text-ink",
                    )}
                  >
                    {option.badge}
                  </span>
                )}
                <span
                  className={clsx(
                    "grid size-6 shrink-0 place-items-center rounded-full transition-all",
                    active
                      ? "bg-lime-neon text-ink"
                      : "border-2 border-ink/12",
                  )}
                  aria-hidden
                >
                  {active && <Check className="size-4" strokeWidth={3.5} />}
                </span>
                <span className="flex-1">
                  <span className="block text-base font-extrabold text-ink">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-xs font-semibold text-mist">
                    <s className="text-haze">${option.was.toFixed(2)}</s>{" "}
                    <span className="text-lime-deep">
                      ${option.price.toFixed(2)} total
                    </span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="gf-numeric block text-2xl font-black text-ink">
                    ${option.perWeek.toFixed(2)}
                  </span>
                  <span className="block text-[11px] font-semibold text-mist">
                    per week
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <GlowButton
          size="xl"
          fullWidth
          pulse
          className="mt-6"
          disabled={!hydrated}
          onClick={checkout}
        >
          <Lock className="size-5" />
          Unlock my plan — ${selected.price.toFixed(2)}
        </GlowButton>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-mist">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-electric" />
            30-day money-back guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <Timer className="size-4 text-electric" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-4 text-electric" />
            Instant access
          </span>
        </div>

        <div className="mt-8 flex items-center justify-center gap-1 text-lime-deep">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="size-4 fill-current" />
          ))}
          <span className="ml-2 text-sm font-semibold text-ink-soft">
            4.9 from 21,480 members
          </span>
        </div>
      </section>
    </main>
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
          <stop offset="0%" stopColor="#0052FF" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0052FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#gf-projection)" />
      <path
        d={line}
        fill="none"
        stroke="#0052FF"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={coords[coords.length - 1].x}
        cy={coords[coords.length - 1].y}
        r="6"
        fill="#39FF14"
        stroke="#fff"
        strokeWidth="3"
      />
    </svg>
  );
}
