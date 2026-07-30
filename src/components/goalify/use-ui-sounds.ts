"use client";

import { useCallback } from "react";
import { useGoalify } from "@/lib/goalify/store";
import {
  playClickPop,
  playProgressPowerUp,
  playUnlockFanfare,
} from "@/lib/goalify/sound";

/**
 * Interface sounds for the funnel (quiz taps, progression, plan unlock).
 * No-ops whenever the user has sound effects switched off, so call sites
 * never have to check the setting themselves.
 */
export function useUiSounds() {
  const { state } = useGoalify();
  const enabled = state.settings.soundEffects;

  const clickPop = useCallback(() => {
    if (enabled) playClickPop();
  }, [enabled]);

  const progressPowerUp = useCallback(() => {
    if (enabled) playProgressPowerUp();
  }, [enabled]);

  const unlockFanfare = useCallback(() => {
    if (enabled) playUnlockFanfare();
  }, [enabled]);

  return { clickPop, progressPowerUp, unlockFanfare };
}
