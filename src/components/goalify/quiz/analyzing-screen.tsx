"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, Cpu, Loader } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { COACH } from "@/lib/goalify/coach";
import {
  ProgressRing,
  RING_ELECTRIC,
  RING_LIME,
} from "@/components/goalify/ui/progress-ring";
import { ParticleField } from "@/components/goalify/ui/particles";
import { CoachBadge } from "@/components/goalify/coach/coach-bubble";

const STAGES = [
  {
    label: "Analyzing fat-burn potential…",
    badge: "Burn Profile Locked",
    icon: "flame",
  },
  {
    label: "Optimizing muscle tone trajectory…",
    badge: "Tone Curve Mapped",
    icon: "biceps",
  },
  {
    label: "Calibrating metabolic engine…",
    badge: "Metabolism Solved",
    icon: "gauge",
  },
  {
    label: "Balancing fuel to your goal…",
    badge: "Macros Dialled In",
    icon: "utensils",
  },
  {
    label: "Unlocking your custom plan…",
    badge: "Roadmap Unlocked",
    icon: "rocket",
  },
] as const;

const STAGE_MS = 900;

/** Live-looking metrics that spin while the "analysis" runs. */
function SpinningMetric({
  label,
  value,
  settled,
}: {
  label: string;
  value: string;
  settled: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={clsx(
          "gf-numeric text-lg font-black",
          settled ? "text-ink" : "gf-anim-flicker text-electric",
        )}
      >
        {value}
      </p>
      <p className="text-[9px] font-bold tracking-[0.1em] text-mist uppercase">
        {label}
      </p>
    </div>
  );
}

/** The perceived-effort screen between the last question and the offer. */
export function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const { answers, targets } = useGoalify();
  const [stage, setStage] = useState(0);
  // Scrambled digits until each metric "resolves".
  const [scramble, setScramble] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length) {
      const timer = setTimeout(onDone, 620);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(timer);
  }, [stage, onDone]);

  // Drives the flicker on unresolved metrics.
  useEffect(() => {
    const timer = setInterval(() => setScramble((s) => s + 1), 90);
    return () => clearInterval(timer);
  }, []);

  const percent = Math.min(100, Math.round((stage / STAGES.length) * 100));
  const noise = () => String(Math.floor(Math.abs(Math.sin(scramble) * 9000)) + 500);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 py-10 text-center">
      <ParticleField />

      <div className="relative flex items-center gap-2.5">
        <CoachBadge size="sm" />
        <p className="text-[11px] font-black tracking-[0.16em] text-electric uppercase">
          {COACH.name} is building your plan
        </p>
      </div>

      <div className="relative mt-6">
        {/* Outer pulse rings for raw energy. */}
        <span
          className="gf-anim-burst absolute inset-0 m-auto size-40 rounded-full border-2 border-electric/40"
          aria-hidden
        />
        <span
          className="gf-anim-burst absolute inset-0 m-auto size-40 rounded-full border-2 border-lime-neon/40"
          style={{ animationDelay: "0.7s" }}
          aria-hidden
        />
        <ProgressRing
          rings={[
            { value: percent, color: RING_ELECTRIC, label: "Analysis" },
            {
              value: Math.min(100, percent + 12),
              color: RING_LIME,
              label: "Plan",
            },
          ]}
          size={190}
          thickness={12}
          gap={6}
        >
          <div>
            <p className="gf-numeric text-4xl font-black text-ink">{percent}%</p>
            <p className="text-[10px] font-bold tracking-[0.14em] text-mist uppercase">
              <Cpu className="mr-0.5 inline size-3" />
              Analysing
            </p>
          </div>
        </ProgressRing>
      </div>

      <h1 className="gf-display relative mt-7 text-3xl font-black text-ink">
        Engineering your <span className="gf-text-hype">roadmap</span>
      </h1>
      <p className="relative mt-2 text-sm text-mist">
        Every number below comes from your own answers.
      </p>

      {/* Live metrics resolving one by one. */}
      <div className="gf-glass relative mt-6 grid w-full grid-cols-3 gap-2 rounded-2xl px-4 py-3">
        <SpinningMetric
          label="kcal / day"
          value={stage >= 3 ? targets.calories.toLocaleString() : noise()}
          settled={stage >= 3}
        />
        <SpinningMetric
          label="g protein"
          value={stage >= 4 ? String(targets.protein) : noise().slice(0, 3)}
          settled={stage >= 4}
        />
        <SpinningMetric
          label="days / week"
          value={stage >= 5 ? String(answers.daysPerWeek) : noise().slice(0, 1)}
          settled={stage >= 5}
        />
      </div>

      <ul className="relative mt-5 w-full space-y-2 text-left">
        {STAGES.map((item, index) => {
          const done = index < stage;
          const active = index === stage;
          return (
            <li
              key={item.label}
              className={clsx(
                "gf-glass flex items-center gap-3 rounded-2xl px-4 py-2.5 transition-all duration-500",
                done || active ? "opacity-100" : "opacity-35",
                active && "border-electric/40",
                done && "border-lime-neon/40",
              )}
            >
              <span
                className={clsx(
                  "grid size-7 shrink-0 place-items-center rounded-full transition-colors",
                  done ? "bg-lime-neon text-ink" : "bg-ink/6 text-mist",
                )}
              >
                {done ? (
                  <Check className="size-4" strokeWidth={3.5} />
                ) : (
                  <Loader
                    className={clsx("size-3.5", active && "gf-anim-spin-slow")}
                  />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold text-ink-soft">
                  {item.label}
                </span>
                {/* Live energy meter while this stage computes. */}
                {active && (
                  <span className="mt-1.5 block h-1 w-full overflow-hidden rounded-full bg-ink/8">
                    <span className="gf-anim-meter block h-full w-1/2 rounded-full bg-linear-to-r from-electric to-lime-neon" />
                  </span>
                )}
              </span>
              {/* Badge snaps in the moment its stage completes. */}
              {done && (
                <span className="gf-anim-unlock shrink-0 rounded-full bg-lime-neon/18 px-2.5 py-1 text-[9px] font-black tracking-[0.08em] text-lime-deep uppercase">
                  {item.badge}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
