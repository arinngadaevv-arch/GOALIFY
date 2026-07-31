"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Zap } from "lucide-react";

const ROUND_MS = 5000;
const TICK_MS = 100;

/** A tiny full-circle ring gauge, normalized via pathLength so the dash
 * math stays in plain percentages instead of real-world circumference. */
const RING_R = 16;
const RING_CIRC = 2 * Math.PI * RING_R;

/**
 * A 5-second burning countdown shown above "instinct round" questions —
 * pure visual pressure. It never blocks or auto-picks; once it hits zero it
 * just keeps pulsing to keep the decision feeling urgent.
 *
 * Mount this with `key={step.id}` from the caller — that's what resets the
 * clock on a fresh question, rather than an effect reaching back into state.
 */
export function SpeedRound({ locked }: { locked: boolean }) {
  const [msLeft, setMsLeft] = useState(ROUND_MS);

  useEffect(() => {
    if (locked) return;
    const timer = setInterval(() => {
      setMsLeft((ms) => Math.max(0, ms - TICK_MS));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [locked]);

  const percent = (msLeft / ROUND_MS) * 100;
  const urgent = msLeft <= 1000;
  const expired = msLeft === 0;
  const dashOffset = RING_CIRC * (1 - percent / 100);

  return (
    <div className="gf-cyber-border mb-5 flex items-center gap-4 rounded-2xl bg-black/20 px-4 py-3">
      <div className="relative grid size-11 shrink-0 place-items-center">
        <svg viewBox="0 0 40 40" className="size-11 -rotate-90">
          <circle
            cx="20"
            cy="20"
            r={RING_R}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity={0.12}
            strokeWidth={4}
          />
          <circle
            cx="20"
            cy="20"
            r={RING_R}
            fill="none"
            stroke={urgent ? "#ffcc33" : "var(--color-electric)"}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={RING_CIRC}
            strokeDashoffset={dashOffset}
            className="gf-cyber-ring-fill"
          />
        </svg>
        <Zap
          className={clsx(
            "absolute size-4",
            urgent ? "gf-anim-urgent gf-cyber-gold-text" : "gf-cyber-glow-text",
          )}
          strokeWidth={3}
        />
      </div>

      <div className="min-w-0 flex-1">
        <span
          className={clsx(
            "flex items-center gap-1.5 text-[11px] font-black tracking-[0.14em] uppercase",
            urgent ? "gf-cyber-gold-text" : "gf-cyber-glow-text",
          )}
        >
          Instinct round
        </span>
        <span
          className={clsx(
            "gf-numeric block text-sm font-black",
            urgent ? "gf-anim-urgent gf-cyber-gold-text" : "text-ink",
          )}
        >
          {expired ? "Go with your gut" : `${(msLeft / 1000).toFixed(1)}s`}
        </span>
      </div>
    </div>
  );
}
