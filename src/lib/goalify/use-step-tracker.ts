"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useGoalify } from "./store";

export type MotionPermission = "unknown" | "granted" | "denied" | "unsupported";

/**
 * Real, on-device pedometer — there is no Apple Health or Google Fit API a
 * website can call (HealthKit is native-only, and Google Fit's REST API
 * needs a server-side OAuth flow and is being retired in favor of Health
 * Connect, which is Android-app-only). What a browser genuinely has is raw
 * accelerometer data via `devicemotion`, so steps are detected locally from
 * it — a real, standard technique, not a simulation. Every reading stays on
 * the device; only the resulting step *count* ever reaches the store.
 *
 * Detection is simple peak-picking on acceleration magnitude: a walking
 * footfall shows up as a sharp spike above a slow-moving baseline (which
 * tracks gravity + posture so it works whether the phone is in a pocket or
 * held flat), and a step is counted on each rising edge that clears the
 * threshold, throttled to the fastest plausible cadence so one footfall's
 * spike is never double-counted.
 */
const STEP_MIN_INTERVAL_MS = 260;
const STEP_ACCEL_THRESHOLD = 1.15;
const BASELINE_SMOOTHING = 0.05;

type RequestableDeviceMotionEvent = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export function useStepTracker() {
  const { addSteps } = useGoalify();
  const [permission, setPermission] = useState<MotionPermission>("unknown");
  const [isTracking, setIsTracking] = useState(false);

  const baselineRef = useRef(9.8);
  const lastStepAtRef = useRef(0);
  const risingRef = useRef(false);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      const g = event.accelerationIncludingGravity;
      if (!g || g.x == null || g.y == null || g.z == null) return;
      const magnitude = Math.sqrt(g.x ** 2 + g.y ** 2 + g.z ** 2);

      baselineRef.current += (magnitude - baselineRef.current) * BASELINE_SMOOTHING;
      const deviation = magnitude - baselineRef.current;

      if (deviation > STEP_ACCEL_THRESHOLD && !risingRef.current) {
        risingRef.current = true;
        const now = Date.now();
        if (now - lastStepAtRef.current > STEP_MIN_INTERVAL_MS) {
          lastStepAtRef.current = now;
          addSteps(1);
        }
      } else if (deviation < STEP_ACCEL_THRESHOLD * 0.3) {
        risingRef.current = false;
      }
    },
    [addSteps],
  );

  const stop = useCallback(() => {
    window.removeEventListener("devicemotion", handleMotion);
    setIsTracking(false);
  }, [handleMotion]);

  /** Must be called directly from a user gesture (button click) — iOS 13+
   * only grants the motion-sensor prompt in response to one. */
  const start = useCallback(async () => {
    if (isTracking) return;
    if (typeof window === "undefined" || typeof DeviceMotionEvent === "undefined") {
      setPermission("unsupported");
      return;
    }

    const requestable = DeviceMotionEvent as RequestableDeviceMotionEvent;
    if (typeof requestable.requestPermission === "function") {
      try {
        const result = await requestable.requestPermission();
        setPermission(result);
        if (result !== "granted") return;
      } catch {
        setPermission("denied");
        return;
      }
    } else {
      // Android / desktop browsers with a motion sensor expose the event
      // directly, no prompt gate.
      setPermission("granted");
    }

    baselineRef.current = 9.8;
    lastStepAtRef.current = 0;
    window.addEventListener("devicemotion", handleMotion);
    setIsTracking(true);
  }, [isTracking, handleMotion]);

  useEffect(() => {
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [handleMotion]);

  return { permission, isTracking, start, stop };
}
