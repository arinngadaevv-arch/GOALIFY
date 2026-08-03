"use client";

/**
 * Thin Web Vibration API wrapper — supported on Android Chrome/Firefox, a
 * silent no-op everywhere else (all of iOS Safari, desktop). There's no
 * feature-detect workaround for iOS; this degrades to sound/visual-only
 * feedback there rather than throwing.
 */
export function vibrate(pattern: number | number[]) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return;
  }
  navigator.vibrate(pattern);
}

/** Short double-tap for a lightweight per-action confirmation. */
export const HAPTIC_TAP = 15;
/** Bigger buzz-pause-buzz for a real milestone — step goal, workout finish. */
export const HAPTIC_MILESTONE = [20, 60, 20, 60, 40];
