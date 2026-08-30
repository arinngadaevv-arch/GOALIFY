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
 * sweeps across the card on a loop underneath them. A giant, barely-there
 * flame watermark sits behind everything — the beat this card is going
 * for ("this one line matters today") needs something to look at even in
 * a static instant between animation frames, not just motion carrying the
 * whole effect.
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
      className="gf-anim-rise relative isolate overflow-hidden p-6 text-center"
    >
      {/* Oversized watermark flame, cropped by the card's own edges — the
          one piece of visual interest that's there even before anything
          animates. */}
      <Flame
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-56 -translate-x-1/2 -translate-y-1/2 text-electric/[0.07]"
        strokeWidth={1}
      />

      {/* Slow sheen sweep — pure decoration, sits under the text. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-electric/20 to-transparent"
        animate={{ left: ["-33%", "133%"] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 2.5 }}
      />

      <div className="relative flex items-center justify-center gap-2">
        <span className="gf-glow-electric grid size-6 place-items-center rounded-full bg-electric">
          <Flame
            className="gf-anim-flicker-flame size-3.5 text-white"
            strokeWidth={2.8}
          />
        </span>
        <p className="text-[10px] font-black tracking-[0.18em] text-electric uppercase">
          Today&apos;s creed
        </p>
      </div>

      {/* Splitting into per-word spans is what makes the stagger possible,
          but it leaves no whitespace in the accessible name — the gap is
          purely visual (flex gap-x), so a screen reader would announce
          "SHOWUPTIRED". An explicit aria-label restores the real sentence
          and the spans are hidden from the tree.
          No `filter` in the per-word animation here — this heading also
          carries `gf-text-electric` (a `background-clip: text` gradient),
          and an animated `filter` on a descendant of a clipped-text
          element is a known Chromium/WebKit compositing bug: the text
          renders fully invisible for the element's whole lifetime, not
          just mid-transition. Opacity + a Y shift alone gets basically
          the same "settling into place" read without tripping it. */}
      <h2
        aria-label={creed.line}
        className="gf-text-electric gf-display relative mt-3 flex flex-wrap justify-center gap-x-2 text-3xl leading-tight font-black"
      >
        {words.map((word, i) => (
          <motion.span
            key={`${creed.line}-${i}`}
            aria-hidden
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
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
