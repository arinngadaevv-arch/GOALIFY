"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";

/**
 * The commitment button's "you're in" moment: a glowing shockwave that
 * rings outward from the button's tap point and washes the screen in a
 * brief gold glow. Replaces an earlier curtain-cut overlay, which read as
 * an abrupt hard cut rather than a premium feeling of momentum — this
 * stays purely additive on top of the step's own zoom/fade transition
 * (see quiz-flow.tsx's zoomVariants) instead of covering it. Same
 * external-store pattern as particle-burst.tsx / confetti-burst.tsx so
 * CommitStep can fire it without prop drilling.
 */
type Shock = { x: number; y: number; key: number } | null;

let current: Shock = null;
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

const LIFETIME_MS = 750;

/** Fire a shockwave ring expanding outward from a viewport point. */
export function triggerShockwave(x: number, y: number) {
  seq += 1;
  current = { x, y, key: seq };
  emit();
  window.setTimeout(() => {
    current = null;
    emit();
  }, LIFETIME_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = (): Shock => null;

/** Mount once near the quiz root — renders whatever shockwave is live. */
export function ShockwaveLayer() {
  const shock = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!shock) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[75] overflow-hidden" aria-hidden>
      {/* Soft full-screen wash, right as the wave passes through. */}
      <motion.div
        key={`glow-${shock.key}`}
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${shock.x}px ${shock.y}px, rgba(232,179,44,0.38), transparent 60%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.55, times: [0, 0.3, 1], ease: "easeOut" }}
      />

      {/* Two staggered rings, expanding well past the viewport diagonal. */}
      {[0, 1].map((i) => (
        <motion.span
          key={`${shock.key}-ring-${i}`}
          className="absolute rounded-full"
          style={{
            left: shock.x,
            top: shock.y,
            width: 24,
            height: 24,
            marginLeft: -12,
            marginTop: -12,
            border: "2px solid rgba(232,179,44,0.9)",
            boxShadow: "0 0 24px 4px rgba(232,179,44,0.55)",
          }}
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 50, opacity: 0 }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
