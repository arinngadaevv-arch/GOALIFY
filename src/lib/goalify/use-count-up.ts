"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a displayed number from its previous value up (or down) to
 * `target` via requestAnimationFrame — no extra animation-library
 * dependency, since a plain number span isn't something CSS can tween on
 * its own. Ease-out cubic, so it settles rather than overshooting.
 * Re-fires on every `target` change, not just on mount, so a number that
 * updates later (e.g. finishing a workout) counts up again from wherever
 * it last landed.
 */
export function useCountUp(target: number, durationMs = 900) {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);
  const firstRef = useRef(true);

  useEffect(() => {
    // First mount always animates in from 0 — that's the "arriving" beat.
    const from = firstRef.current ? 0 : fromRef.current;
    firstRef.current = false;
    const delta = target - from;
    if (delta === 0) {
      setDisplay(target);
      return;
    }
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
        setDisplay(target);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return display;
}

/**
 * For values fed into something that already CSS-transitions on its own
 * (ProgressRing's stroke-dashoffset) — starts at 0 and commits to `target`
 * one tick after mount, so the ring's existing transition actually has a
 * change to animate instead of painting straight at its final position.
 */
export function useRevealOnMount(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setValue(target));
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}
