"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import type {
  GoalifyState,
  ProgressPhoto,
  QuizAnswers,
  Settings,
} from "./types";
import { DEFAULT_ANSWERS, nutritionTargets, toProfile } from "./plan";
import { workoutForDay } from "./workouts";

const STORAGE_KEY = "goalify.state.v1";

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

const INITIAL_STATE: GoalifyState = {
  profile: null,
  draft: {},
  purchased: false,
  completedDays: [],
  programDay: 1,
  waterGlasses: 0,
  waterUpdatedOn: todayKey(),
  settings: {
    kneeSafe: false,
    // Off by default — the workout flow leans on chime cues and visual
    // countdown flashes instead; users who want spoken narration can still
    // switch this on in Settings.
    voiceCues: false,
    soundEffects: true,
    pushMotivation: true,
    pushWater: true,
    pushWorkout: true,
    units: "metric",
  },
  photos: [],
};

/* -------------------------------------------------------------------------
   External store.

   Persisted state lives outside React so reading it never has to happen in
   an effect. `useSyncExternalStore` renders the server snapshot during
   hydration and swaps to the real localStorage snapshot immediately after,
   which avoids both a hydration mismatch and a cascading render.
   ------------------------------------------------------------------------- */

let currentState: GoalifyState = INITIAL_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function loadOnce() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<GoalifyState>;
    currentState = {
      ...INITIAL_STATE,
      ...parsed,
      settings: { ...INITIAL_STATE.settings, ...parsed.settings },
    };
  } catch {
    // A corrupt or unavailable store should never block the app.
  }
}

function subscribe(listener: () => void): () => void {
  loadOnce();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): GoalifyState {
  loadOnce();
  return currentState;
}

function getServerSnapshot(): GoalifyState {
  return INITIAL_STATE;
}

function update(updater: (state: GoalifyState) => GoalifyState) {
  const next = updater(currentState);
  if (next === currentState) return;
  currentState = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Private browsing / quota — persistence is best effort.
  }
  for (const listener of listeners) listener();
}

/**
 * Kept as a component so the tree has an obvious ownership boundary and so
 * server-provided initial state can be threaded through here later.
 */
export function GoalifyProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useGoalify() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const setDraft = useCallback((patch: Partial<QuizAnswers>) => {
    update((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  }, []);

  const completeQuiz = useCallback((answers: QuizAnswers) => {
    update((s) => ({ ...s, profile: toProfile(answers), draft: answers }));
  }, []);

  const purchase = useCallback(() => {
    update((s) => (s.purchased ? s : { ...s, purchased: true }));
  }, []);

  const completeWorkout = useCallback(() => {
    update((s) => {
      const today = todayKey();
      if (s.completedDays.includes(today)) return s;
      return {
        ...s,
        completedDays: [...s.completedDays, today].sort(),
        programDay: s.programDay + 1,
      };
    });
  }, []);

  const setWater = useCallback((glasses: number) => {
    update((s) => ({
      ...s,
      waterGlasses: Math.max(0, glasses),
      waterUpdatedOn: todayKey(),
    }));
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    update((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  const addPhoto = useCallback((photo: Omit<ProgressPhoto, "id">) => {
    update((s) => ({
      ...s,
      photos: [...s.photos, { ...photo, id: crypto.randomUUID() }],
    }));
  }, []);

  const reset = useCallback(() => {
    update(() => INITIAL_STATE);
  }, []);

  const answers = useMemo<QuizAnswers>(
    () => ({ ...DEFAULT_ANSWERS, ...state.draft, ...(state.profile ?? {}) }),
    [state.draft, state.profile],
  );

  // Hydration is derived, not stored, so a new day starts empty without a write.
  const waterGlasses =
    state.waterUpdatedOn === todayKey() ? state.waterGlasses : 0;

  return {
    state,
    hydrated,
    answers,
    waterGlasses,
    streak: calculateStreak(state.completedDays),
    targets: nutritionTargets(answers),
    todaysWorkout: workoutForDay(state.programDay),
    workoutDoneToday: state.completedDays.includes(todayKey()),
    setDraft,
    completeQuiz,
    purchase,
    completeWorkout,
    setWater,
    updateSettings,
    addPhoto,
    reset,
  };
}

/**
 * Counts back from today (or yesterday, so an unfinished day doesn't
 * immediately zero the streak) while days remain consecutive.
 */
export function calculateStreak(completedDays: string[]): number {
  if (completedDays.length === 0) return 0;
  const days = new Set(completedDays);

  const cursor = new Date();
  if (!days.has(todayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(todayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
