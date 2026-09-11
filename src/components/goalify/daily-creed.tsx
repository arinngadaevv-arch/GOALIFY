"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";
import { CREEDS } from "@/lib/goalify/motivation";

const ROTATE_MS = 8000;

/**
 * A rotating toxic-motivation callout — a roast, not encouragement. Cycles
 * to the next line every `ROTATE_MS` on a plain interval; which line is
 * showing isn't part of any persisted state, so a remount (tab switch,
 * navigation back to Home) just starts again from index 0 — that's fine,
 * this is background noise, not something that needs to survive a
 * hydration boundary.
 *
 * Visually harder than the rest of this screen on purpose: a solid black
 * card with a thick border and a hazard-stripe top edge instead of the
 * soft translucent `GlassCard` used everywhere else, a stark white
 * headline instead of a gold gradient, and a fast hard-cut transition
 * between lines instead of a gentle staggered word reveal — this card is
 * supposed to read as blunt, not polished.
 */
export function DailyCreed() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CREEDS.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const creed = CREEDS[index];

  return (
    <div className="relative isolate overflow-hidden rounded-2xl border-2 border-electric bg-black p-6 text-center shadow-[0_18px_40px_-18px_rgba(232,179,44,0.5)]">
      {/* Hazard-stripe top edge — the one piece of texture that reads as
          "warning label," not "premium glass panel." */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(135deg,var(--color-electric)_0px,var(--color-electric)_9px,#000_9px,#000_18px)]"
      />

      <div className="relative flex items-center justify-center gap-2 pt-1.5">
        <Flame className="size-4 text-electric" strokeWidth={3} />
        <p className="text-[10px] font-black tracking-[0.22em] text-electric uppercase">
          Reality check
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          <h2
            aria-label={creed.line}
            className="gf-display relative mt-3 text-3xl leading-tight font-black text-white uppercase"
          >
            {creed.line}
          </h2>
          <p className="relative mt-3 text-xs leading-relaxed text-mist">
            {creed.sub}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
