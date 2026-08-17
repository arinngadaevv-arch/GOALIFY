"use client";

import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { creedForDay } from "@/lib/goalify/motivation";
import { GlassCard } from "./ui/glass-card";

/**
 * Today's creed — the app's one loud moment. Deliberately not a carousel:
 * a line that rotates every few seconds reads as decoration and gets
 * tuned out, whereas a single line that's fixed for the whole day reads
 * as something addressed to you.
 *
 * The words animate in one at a time on mount, and a slow gold sheen
 * sweeps across the card on a loop underneath them.
 *
 * `creedForDay()` is date-derived rather than random so the server and
 * client render the same words — no hydration mismatch. Framer Motion
 * renders each `initial` state into the SSR markup and animates to
 * `animate` on hydration, so no manual mount gate is needed.
 */
export function DailyCreed() {
  const creed = creedForDay();
  const words = creed.line.split(" ");

  return (
    <GlassCard
      tone="electric"
      deep
      className="gf-anim-rise relative overflow-hidden p-6 text-center"
    >
      {/* Slow sheen sweep — pure decoration, sits under the text. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-electric/15 to-transparent"
        animate={{ left: ["-33%", "133%"] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
      />

      <div className="relative flex items-center justify-center gap-1.5 text-electric">
        <Flame className="gf-anim-flicker-flame size-3.5" strokeWidth={2.6} />
        <p className="text-[10px] font-black tracking-[0.18em] uppercase">
          Today&apos;s creed
        </p>
      </div>

      {/* Splitting into per-word spans is what makes the stagger possible,
          but it leaves no whitespace in the accessible name — the gap is
          purely visual (flex gap-x), so a screen reader would announce
          "SHOWUPTIRED". An explicit aria-label restores the real sentence
          and the spans are hidden from the tree. */}
      <h2
        aria-label={creed.line}
        className="gf-display relative mt-3 flex flex-wrap justify-center gap-x-2 text-2xl leading-tight font-black text-ink"
      >
        {words.map((word, i) => (
          <motion.span
            key={`${creed.line}-${i}`}
            aria-hidden
            initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              duration: 0.5,
              delay: 0.12 + i * 0.09,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
          </motion.span>
        ))}
      </h2>

      <motion.p
        className="relative mt-3 text-xs leading-relaxed text-mist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.15 + words.length * 0.09 }}
      >
        {creed.sub}
      </motion.p>
    </GlassCard>
  );
}
