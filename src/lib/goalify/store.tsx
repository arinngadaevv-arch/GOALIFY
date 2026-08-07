"use client";

import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useSession } from "next-auth/react";
import type {
  GoalifyState,
  ProgressPhoto,
  QuizAnswers,
  Settings,
} from "./types";
import { DEFAULT_ANSWERS, nutritionTargets, toProfile } from "./plan";
import { workoutForDay } from "./workouts";

/**
 * Storage is partitioned per signed-in account so one browser can never
 * show one user's quiz answers, streak or photos on a different account —
 * each gets its own key, not a shared one. `GUEST_STORAGE_KEY` (the old,
 * unpartitioned key from before accounts existed) is only ever used for a
 * signed-out visitor mid-quiz; see `setActiveUser` for how it hands off to
 * a real account.
 */
const GUEST_STORAGE_KEY = "goalify.state.v1";

function userStorageKey(userId: string): string {
  return `goalify.state.v1.user.${userId}`;
}

/** Daily step target driving the Activity Rings' "Steps" ring. */
export const STEP_GOAL = 8000;
/** Daily "Move" calorie-burn target (steps + workout), Apple-Fitness style. */
export const CALORIE_BURN_GOAL = 500;
/** Daily active-minutes target — one completed session covers most days. */
export const ACTIVE_MINUTES_GOAL = 30;

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
  steps: 0,
  stepsUpdatedOn: todayKey(),
  quizSyncedAt: null,
  settings: {
    kneeSafe: false,
    soundEffects: true,
    haptics: true,
    pushMotivation: true,
    pushWater: true,
    pushWorkout: true,
    units: "metric",
  },
  photos: [],
  beforePhotoUrl: null,
  afterPhotoUrl: null,
};

/* -------------------------------------------------------------------------
   External store.

   Persisted state lives outside React so reading it never has to happen in
   an effect. `useSyncExternalStore` renders the server snapshot during
   hydration and swaps to the real localStorage snapshot immediately after,
   which avoids both a hydration mismatch and a cascading render.

   Unlike a typical single-key store, *which* key backs `currentState` isn't
   fixed — it switches per signed-in account (see `setActiveUser`), and
   nothing is ever eagerly loaded from any key before that's been resolved.
   That's deliberate: `currentState` starts at the safe, empty `INITIAL_STATE`
   and stays there until a component tells us (via `useSession()`, the only
   thing that actually knows who's signed in) which account's data to load,
   so there's never a window where one account's data is readable before
   we've confirmed whose turn it actually is.
   ------------------------------------------------------------------------- */

let currentState: GoalifyState = INITIAL_STATE;
/** Which storage key `currentState` currently reflects — null until
 * `setActiveUser` has resolved at least once. */
let activeStorageKey: string | null = null;
/** True once `currentState` reflects a real resolved account (or guest)
 * rather than just the placeholder `INITIAL_STATE`. */
let loaded = false;
const listeners = new Set<() => void>();

function readStorage(key: string): GoalifyState | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GoalifyState>;
    return {
      ...INITIAL_STATE,
      ...parsed,
      settings: { ...INITIAL_STATE.settings, ...parsed.settings },
    };
  } catch {
    return null;
  }
}

function writeStorage(key: string, state: GoalifyState) {
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Private browsing / quota — persistence is best effort.
  }
}

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Points the store at the right account's own data — called from
 * `GoalifyProvider` once `useSession()` has actually resolved (not during
 * its initial "loading" state, which is neither signed in nor signed out).
 * `userId` is null for a signed-out visitor, who gets the shared guest key
 * (there's no account yet to isolate them from).
 *
 * A brand-new account (no key of its own yet) claims whatever guest data
 * this *same browser tab* was actively using right before signing in —
 * e.g. a quiz just completed and then immediately signed up from — since
 * that's provably this session's own data, not a stranger's leftovers.
 * Anything sitting in the guest key from some earlier, unrelated tab is
 * never touched: only `currentState` already live as guest data in this
 * running session is eligible to carry over.
 */
export function setActiveUser(userId: string | null) {
  if (typeof window === "undefined") return;
  const nextKey = userId ? userStorageKey(userId) : GUEST_STORAGE_KEY;
  if (loaded && nextKey === activeStorageKey) return;

  let nextState: GoalifyState;
  if (userId) {
    const existing = readStorage(nextKey);
    if (existing) {
      nextState = existing;
    } else if (loaded && activeStorageKey === GUEST_STORAGE_KEY) {
      // This tab's own live guest session (e.g. a just-finished quiz)
      // becomes this brand-new account's starting data.
      nextState = currentState;
      window.localStorage.removeItem(GUEST_STORAGE_KEY);
    } else {
      nextState = INITIAL_STATE;
    }
  } else {
    nextState = readStorage(GUEST_STORAGE_KEY) ?? INITIAL_STATE;
  }

  writeStorage(nextKey, nextState);
  activeStorageKey = nextKey;
  loaded = true;
  currentState = nextState;
  emit();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): GoalifyState {
  return currentState;
}

function getServerSnapshot(): GoalifyState {
  return INITIAL_STATE;
}

function update(updater: (state: GoalifyState) => GoalifyState) {
  const next = updater(currentState);
  if (next === currentState) return;
  currentState = next;
  if (activeStorageKey) writeStorage(activeStorageKey, next);
  emit();
}

/**
 * Owns the boundary between "who's signed in" (`useSession`, real React
 * state) and the plain external store above (which has no way to know that
 * on its own) — every render where the session has actually resolved,
 * this points the store at that account's own data.
 */
export function GoalifyProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (status === "loading") return;
    setActiveUser(userId);
  }, [status, userId]);

  return <>{children}</>;
}

export function useGoalify() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // True once `setActiveUser` has resolved which account's data this is —
  // not just "past SSR hydration," which used to be all this checked.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => loaded,
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

  /** Called once per detected footfall by use-step-tracker.ts — accumulates
   * onto today's count, resetting first if the last write was a prior day. */
  const addSteps = useCallback((delta: number) => {
    update((s) => {
      const today = todayKey();
      const base = s.stepsUpdatedOn === today ? s.steps : 0;
      const next = Math.max(0, base + delta);
      if (next === s.steps && s.stepsUpdatedOn === today) return s;
      return { ...s, steps: next, stepsUpdatedOn: today };
    });
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

  /** Sets the fixed Before/After vault slot's photo (see progress.tsx) —
   * distinct from `photos`, which is the free-form weekly log. */
  const setVaultPhoto = useCallback((slot: "before" | "after", dataUrl: string) => {
    update((s) =>
      slot === "before" ? { ...s, beforePhotoUrl: dataUrl } : { ...s, afterPhotoUrl: dataUrl },
    );
  }, []);

  const reset = useCallback(() => {
    update(() => INITIAL_STATE);
  }, []);

  /** Marks the local quiz profile as synced to the server (see
   * api/user/quiz/route.ts) so terms-gate.tsx's sync effect doesn't retry
   * forever once it actually lands. */
  const markQuizSynced = useCallback(() => {
    update((s) => (s.quizSyncedAt ? s : { ...s, quizSyncedAt: new Date().toISOString() }));
  }, []);

  const answers = useMemo<QuizAnswers>(
    () => ({ ...DEFAULT_ANSWERS, ...state.draft, ...(state.profile ?? {}) }),
    [state.draft, state.profile],
  );

  // Hydration is derived, not stored, so a new day starts empty without a write.
  const waterGlasses =
    state.waterUpdatedOn === todayKey() ? state.waterGlasses : 0;
  const steps = state.stepsUpdatedOn === todayKey() ? state.steps : 0;

  return {
    state,
    hydrated,
    answers,
    waterGlasses,
    steps,
    streak: calculateStreak(state.completedDays),
    targets: nutritionTargets(answers),
    todaysWorkout: workoutForDay(state.programDay),
    workoutDoneToday: state.completedDays.includes(todayKey()),
    setDraft,
    completeQuiz,
    purchase,
    completeWorkout,
    setWater,
    addSteps,
    updateSettings,
    addPhoto,
    setVaultPhoto,
    reset,
    markQuizSynced,
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
