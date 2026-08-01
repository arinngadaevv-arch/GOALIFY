"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

/**
 * Floating "recent activity" corner badge.
 *
 * PLACEHOLDER MARKETING COPY — the count below drifts within a scripted
 * range, it is not read from real purchase events. Wire it to real
 * checkout events (or remove it) before charging customers, since
 * presenting scripted activity as a live count is deceptive.
 */
const MIN_COUNT = 9;
const MAX_COUNT = 17;
const TICK_MS = 9000;

export function LiveUrgencyBadge() {
  const [count, setCount] = useState(14);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => {
        const next = c + (Math.random() > 0.5 ? 1 : -1);
        return Math.min(MAX_COUNT, Math.max(MIN_COUNT, next));
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="gf-anim-rise fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-lime-neon/40 bg-black/70 px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md sm:max-w-xs"
      role="status"
      aria-live="polite"
    >
      <span className="relative grid size-5 shrink-0 place-items-center">
        <span className="absolute size-5 animate-ping rounded-full bg-lime-neon/40" />
        <Flame className="relative size-4 text-lime-neon" strokeWidth={2.8} />
      </span>
      <span className="truncate">
        <span className="gf-numeric font-black text-lime-neon">{count}</span>{" "}
        men unlocked their blueprint in the last 10 minutes
      </span>
    </div>
  );
}
