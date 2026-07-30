"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

/**
 * Rotating "someone just joined" proof strip.
 *
 * PLACEHOLDER MARKETING COPY — this is a scripted rotation, not a live feed.
 * Wire it to real signup events (or remove it) before charging customers,
 * since presenting scripted activity as live purchases is deceptive.
 */
const RECENT = [
  { name: "Maya R.", city: "Tel Aviv", plan: "3-month plan" },
  { name: "Daniel K.", city: "Berlin", plan: "12-month plan" },
  { name: "Priya S.", city: "London", plan: "3-month plan" },
  { name: "Tom A.", city: "Haifa", plan: "1-month plan" },
  { name: "Lena M.", city: "Madrid", plan: "3-month plan" },
  { name: "Yusuf D.", city: "Istanbul", plan: "12-month plan" },
];

const ROTATE_MS = 3800;

export function BuyerTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % RECENT.length),
      ROTATE_MS,
    );
    return () => clearInterval(timer);
  }, []);

  const entry = RECENT[index];

  return (
    <div
      className="gf-glass gf-glass-lime flex items-center gap-3 rounded-2xl px-4 py-3"
      aria-live="polite"
    >
      <span className="relative grid size-8 shrink-0 place-items-center rounded-full bg-lime-neon/25">
        <Flame className="size-4 text-lime-deep" strokeWidth={2.8} />
        <span className="absolute -top-0.5 -right-0.5 size-2.5 animate-pulse rounded-full bg-lime-neon shadow-[0_0_8px_#39FF14]" />
      </span>
      <p key={index} className="gf-anim-rise min-w-0 flex-1 text-xs text-ink-soft">
        <strong className="font-extrabold text-ink">{entry.name}</strong> from{" "}
        {entry.city} just started the{" "}
        <strong className="font-bold text-lime-deep">{entry.plan}</strong>
      </p>
    </div>
  );
}
