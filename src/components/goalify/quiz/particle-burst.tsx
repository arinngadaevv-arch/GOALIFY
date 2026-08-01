"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny external store so any quiz control can fire a burst without prop
 * drilling — the same pattern coach-guide.tsx uses for `sayCoach`. Fixed
 * positions are viewport coordinates from the triggering click/drag, so the
 * burst always originates exactly where the user touched.
 */
type Burst = { x: number; y: number; key: number; gold: boolean } | null;

let current: Burst = null;
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Fire a micro-particle burst centered on a viewport point. */
export function fireBurst(x: number, y: number, gold = false) {
  seq += 1;
  current = { x, y, key: seq, gold };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => current;
const getServerSnapshot = (): Burst => null;

const PARTICLE_COUNT = 10;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (360 / PARTICLE_COUNT) * i + (i % 2 === 0 ? -8 : 8);
  const dist = 34 + ((i * 37) % 26);
  return { angle, dist };
});

/** Mount once near the root of the quiz — renders whatever burst is live. */
export function ParticleBurstLayer() {
  const burst = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!burst) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" aria-hidden>
      {PARTICLES.map((p, i) => (
        <span
          key={`${burst.key}-${i}`}
          className="gf-cyber-particle"
          style={
            {
              "--gf-p-x": `${burst.x}px`,
              "--gf-p-y": `${burst.y}px`,
              "--gf-p-angle": `${p.angle}deg`,
              "--gf-p-dist": `${p.dist}px`,
              "--gf-p-color": burst.gold ? "#e8b32c" : "#ff3b3b",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
