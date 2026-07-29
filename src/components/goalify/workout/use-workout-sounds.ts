"use client";

import { useCallback } from "react";
import { useGoalify } from "@/lib/goalify/store";
import {
  playCompletionCelebration,
  playCountdownBeep,
  playExerciseChime,
} from "@/lib/goalify/sound";

/**
 * Settings-aware wrappers around the Web Audio cues — no-ops whenever the
 * user has sound effects turned off, so call sites never need to check.
 */
export function useWorkoutSounds() {
  const { state } = useGoalify();
  const enabled = state.settings.soundEffects;

  const countdownBeep = useCallback(
    (secondsLeft: 3 | 2 | 1) => {
      if (enabled) playCountdownBeep(secondsLeft);
    },
    [enabled],
  );

  const exerciseChime = useCallback(() => {
    if (enabled) playExerciseChime();
  }, [enabled]);

  const completionCelebration = useCallback(() => {
    if (enabled) playCompletionCelebration();
  }, [enabled]);

  return { countdownBeep, exerciseChime, completionCelebration };
}
