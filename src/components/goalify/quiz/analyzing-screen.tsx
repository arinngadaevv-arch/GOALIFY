"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Check, Loader } from "lucide-react";
import { ProgressRing, RING_ELECTRIC } from "@/components/goalify/ui/progress-ring";

const STAGES = [
  "Reading your training history",
  "Mapping joint-safe movement patterns",
  "Calculating metabolic baseline",
  "Balancing macros to your goal",
  "Sequencing your first 30 days",
];

const STAGE_MS = 760;

/** The perceived-effort screen between the last question and the offer. */
export function AnalyzingScreen({ onDone }: { onDone: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length) {
      const timer = setTimeout(onDone, 500);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(timer);
  }, [stage, onDone]);

  const percent = Math.min(100, Math.round((stage / STAGES.length) * 100));

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-5 text-center">
      <ProgressRing
        rings={[{ value: percent, color: RING_ELECTRIC, label: "Analysis" }]}
        size={188}
        thickness={16}
      >
        <div>
          <p className="gf-numeric text-4xl font-black text-ink">{percent}%</p>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-mist">
            Building
          </p>
        </div>
      </ProgressRing>

      <h1 className="gf-display mt-9 text-3xl font-black text-ink">
        Engineering your plan
      </h1>
      <p className="mt-2 text-sm text-mist">
        Every number below comes from your own answers.
      </p>

      <ul className="mt-9 w-full space-y-2.5 text-left">
        {STAGES.map((label, index) => {
          const done = index < stage;
          const active = index === stage;
          return (
            <li
              key={label}
              className={clsx(
                "gf-glass flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-500",
                done || active ? "opacity-100" : "opacity-35",
                active && "border-electric/40",
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
              <span className="text-sm font-semibold text-ink-soft">
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
