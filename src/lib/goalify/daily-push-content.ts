/**
 * The four daily push categories — shared between api/cron/daily-push
 * (which actually sends these) and api/admin/push-diagnostics (which lets
 * the owner preview any one of them on demand without waiting for its
 * scheduled time). Kept in one place so the two can never drift apart.
 *
 * Copy matches the mock lock-screen preview in notifications-preview.tsx's
 * SLOTS, minus "motivation"'s specific workout name — this sends to every
 * eligible user regardless of which program day they're actually on, and
 * the server has no reliable way to know that (programDay lives client-
 * side only, same as the rest of GoalifyState).
 */
export type DailyPushSlot = "motivation" | "nutrition" | "water" | "workout";

export const DAILY_PUSH_CONTENT: Record<
  DailyPushSlot,
  { title: string; body: string }
> = {
  motivation: {
    title: "Nobody's doing this for you 🔥",
    body: "Today's session is loaded and waiting. Press start before excuses show up.",
  },
  nutrition: {
    title: "It's not just the workout 🍳",
    body: "You can't out-train what's on your plate. What are you actually eating today?",
  },
  water: {
    title: "Still on pace? 💧",
    body: "You're behind on water. Grab a glass — now, not in an hour.",
  },
  workout: {
    title: "Did you think it'd do itself? ⚡",
    body: "Your session's been sitting there all day. Press start — you vs. you.",
  },
};

export function isDailyPushSlot(value: string | null): value is DailyPushSlot {
  return value !== null && value in DAILY_PUSH_CONTENT;
}
