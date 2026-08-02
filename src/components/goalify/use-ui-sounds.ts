"use client";

import { useCallback } from "react";
import { useGoalify } from "@/lib/goalify/store";
import {
  playGlassChime,
  playHypeSelect,
  playProgressPowerUp,
  playSliderTick,
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

  const glassChime = useCallback(() => {
    if (enabled) playGlassChime();
  }, [enabled]);

  const progressPowerUp = useCallback(() => {
    if (enabled) playProgressPowerUp();
  }, [enabled]);

  const hypeSelect = useCallback(() => {
    if (enabled) playHypeSelect();
  }, [enabled]);

  const unlockFanfare = useCallback(() => {
    if (enabled) playUnlockFanfare();
  }, [enabled]);

  const sliderTick = useCallback(() => {
    if (enabled) playSliderTick();
  }, [enabled]);

  return { glassChime, progressPowerUp, hypeSelect, unlockFanfare, sliderTick };
}
