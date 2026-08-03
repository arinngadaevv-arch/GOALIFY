"use client";

import { useCallback } from "react";
import { useGoalify } from "./store";
import { HAPTIC_MILESTONE, HAPTIC_TAP, vibrate } from "./haptics";

/**
 * Settings-aware wrapper around the Vibration API — mirrors
 * use-workout-sounds.ts's pattern so call sites never need to check the
 * toggle themselves.
 */
export function useHaptics() {
  const { state } = useGoalify();
  const enabled = state.settings.haptics;

  const tap = useCallback(() => {
    if (enabled) vibrate(HAPTIC_TAP);
  }, [enabled]);

  const milestone = useCallback(() => {
    if (enabled) vibrate(HAPTIC_MILESTONE);
  }, [enabled]);

  return { tap, milestone };
}
