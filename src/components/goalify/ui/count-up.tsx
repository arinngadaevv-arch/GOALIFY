"use client";

import { useEffect, useState } from "react";

/**
 * Ticks a number up from zero on mount. All state updates happen inside the
 * requestAnimationFrame callback, so this never triggers a synchronous
 * effect-body render cascade.
 */
export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / durationMs);
      // Ease-out cubic — fast off the line, gentle landing.
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}

/** A stat value that counts up into place, with optional prefix/suffix. */
export function CountUp({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
  durationMs = 1400,
  className,
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}) {
  const value = useCountUp(to, durationMs);
  const shown =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString();

  return (
    <span className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}
