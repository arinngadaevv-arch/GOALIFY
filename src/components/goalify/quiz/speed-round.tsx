"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Zap } from "lucide-react";

const ROUND_MS = 5000;
const TICK_MS = 100;

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

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between">
        <span
          className={clsx(
            "flex items-center gap-1.5 text-[11px] font-black tracking-[0.14em] uppercase",
            urgent ? "text-[#ff7a1a]" : "text-electric",
          )}
        >
          <Zap
            className={clsx("size-3.5", urgent && "gf-anim-urgent")}
            strokeWidth={3}
          />
          Instinct round
        </span>
        <span
          className={clsx(
            "gf-numeric text-sm font-black",
            urgent ? "gf-anim-urgent text-[#ff7a1a]" : "text-ink",
          )}
        >
          {expired ? "Go with your gut" : `${(msLeft / 1000).toFixed(1)}s`}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink/8">
        <div
          className={clsx(
            "h-full rounded-full transition-[width] duration-100 ease-linear",
            urgent
              ? "bg-[#ff7a1a]"
              : "bg-linear-to-r from-[#22d3ee] via-[#a855f7] to-[#ff7a1a]",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
