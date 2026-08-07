"use client";

import { useSyncExternalStore } from "react";
import { motion, type Easing } from "framer-motion";
import { Flame } from "lucide-react";

/**
 * The commitment step's "no going back" moment gets its own full-screen
 * curtain-cut instead of the quiz's usual left/right slide: two panels
 * slam shut over the viewport, hold just long enough to cover the ordinary
 * step swap happening underneath (quiz-flow's shared REACTION_MS advance,
 * ~550ms — well inside the hold window below), then split back open onto
 * the next question. Same external-store pattern as particle-burst.tsx /
 * coach-guide.tsx so CommitStep can fire it without prop drilling.
 */
let active = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

const TOTAL_MS = 1050;

export function triggerCommitSplit() {
  active = true;
  emit();
  window.setTimeout(() => {
    active = false;
    emit();
  }, TOTAL_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => active;
const getServerSnapshot = () => false;

const DURATION_S = TOTAL_MS / 1000;
/** Shared beat map: 0 → closing, 0.34 → fully shut, 0.58 → starts
 * reopening, 1 → fully open again. */
const PANEL_TIMES = [0, 0.34, 0.58, 1];
const PANEL_EASE: Easing[] = ["easeIn", "linear", "easeInOut"];

export function CommitSplitOverlay() {
  const isActive = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!isActive) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[75]" aria-hidden>
      {/* Impact flash right as the curtain slams shut. */}
      <motion.div
        className="absolute inset-0 bg-[#e8b32c]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.5, 0] }}
        transition={{ duration: DURATION_S, times: [0, 0.3, 0.38, 0.5], ease: "easeOut" }}
      />

      {/* Top curtain panel */}
      <motion.div
        className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#0b0e14] via-[#12151f] to-[#0b0e14]"
        style={{ boxShadow: "0 6px 44px -4px rgba(232,179,44,0.9)" }}
        initial={{ y: "-100%" }}
        animate={{ y: ["-100%", "0%", "0%", "-100%"] }}
        transition={{ duration: DURATION_S, times: PANEL_TIMES, ease: PANEL_EASE }}
      />

      {/* Bottom curtain panel */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0b0e14] via-[#12151f] to-[#0b0e14]"
        style={{ boxShadow: "0 -6px 44px -4px rgba(232,179,44,0.9)" }}
        initial={{ y: "100%" }}
        animate={{ y: ["100%", "0%", "0%", "100%"] }}
        transition={{ duration: DURATION_S, times: PANEL_TIMES, ease: PANEL_EASE }}
      />

      {/* Gold seam glow + emblem, visible only while fully covered. */}
      <motion.div
        className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 items-center justify-center gap-3"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.7, 0.7, 1, 1, 0.85] }}
        transition={{
          duration: DURATION_S,
          times: [0, 0.34, 0.42, 0.56, 0.64],
          ease: "easeOut",
        }}
      >
        <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#e8b32c]" />
        <Flame
          className="size-9 text-[#e8b32c]"
          strokeWidth={2.4}
          style={{ filter: "drop-shadow(0 0 14px rgba(232,179,44,0.9))" }}
        />
        <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#e8b32c]" />
      </motion.div>
    </div>
  );
}
