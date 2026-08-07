"use client";

import { useSyncExternalStore } from "react";
import clsx from "clsx";

/**
 * A bigger, more theatrical cousin of `particle-burst.tsx`'s tap sparkle —
 * reserved for the one moment in the funnel that earns a real confetti
 * explosion (the commitment step's firecracker button), rather than the
 * small per-tap burst every other control fires. Same external-store
 * pattern so it can be triggered without prop drilling.
 */
type Confetti = { x: number; y: number; key: number } | null;

let current: Confetti = null;
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Fire a big confetti explosion centered on a viewport point. */
export function fireConfetti(x: number, y: number) {
  seq += 1;
  current = { x, y, key: seq };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = (): Confetti => null;

const CONFETTI_COUNT = 28;
const COLORS = ["#e8b32c", "#f5cb5c", "#ff3b3b", "#ffffff"];
const PIECES = Array.from({ length: CONFETTI_COUNT }, (_, i) => {
  const angle = (360 / CONFETTI_COUNT) * i + (((i * 53) % 30) - 15);
  const dist = 74 + ((i * 41) % 100);
  const rotate = ((i * 97) % 360) - 180;
  const delay = (i % 6) * 0.012;
  const size = 5 + (i % 3) * 2;
  const rect = i % 2 === 0;
  return { angle, dist, rotate, delay, size, rect, color: COLORS[i % COLORS.length] };
});

/** Mount once near the commitment step — renders whatever confetti burst
 * is currently live. */
export function ConfettiBurstLayer() {
  const burst = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!burst) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[65]" aria-hidden>
      {PIECES.map((p, i) => (
        <span
          key={`${burst.key}-${i}`}
          className={clsx("gf-confetti-piece", p.rect ? "gf-confetti-rect" : "gf-confetti-dot")}
          style={
            {
              "--gf-c-x": `${burst.x}px`,
              "--gf-c-y": `${burst.y}px`,
              "--gf-c-angle": `${p.angle}deg`,
              "--gf-c-dist": `${p.dist}px`,
              "--gf-c-rotate": `${p.rotate}deg`,
              "--gf-c-delay": `${p.delay}s`,
              width: `${p.size}px`,
              height: `${p.rect ? p.size * 2.2 : p.size}px`,
            } as React.CSSProperties
          }
        >
          <span style={{ background: p.color }} />
        </span>
      ))}
    </div>
  );
}
