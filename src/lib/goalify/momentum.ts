import { todayKey } from "./store";

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Calendar days since the most recently completed workout — `null` if
 * nothing has ever been completed (a brand-new user hasn't "slipped," they
 * just haven't started, which is a different message entirely). */
export function daysSinceLastWorkout(completedDays: string[]): number | null {
  if (completedDays.length === 0) return null;
  // Sorted ascending on every write (see store.tsx's completeWorkout).
  const latest = completedDays[completedDays.length - 1];
  const diff =
    parseDateKey(todayKey()).getTime() - parseDateKey(latest).getTime();
  return Math.round(diff / MS_PER_DAY);
}

/** The Monday-start week `weeksAgo` weeks back from today (0 = this week),
 * as its 7 date keys — same Mon-Sun convention as dates.ts's
 * currentWeekDays, generalized to reach past weeks too. */
function weekKeys(weeksAgo: number): string[] {
  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset - weeksAgo * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return todayKey(d);
  });
}

/**
 * Each of the last `count` weeks' completion rate against the user's own
 * weekly target, oldest first and this week last — the small trend
 * Dashboard's momentum card draws as a bar row. 100 means "hit the weekly
 * goal," not "trained every day," since the goal itself (daysPerWeek) is
 * usually fewer than 7.
 */
export function weeklyMomentum(
  completedDays: string[],
  daysPerWeek: number,
  count = 4,
): number[] {
  const done = new Set(completedDays);
  const weeks: number[] = [];
  for (let weeksAgo = count - 1; weeksAgo >= 0; weeksAgo--) {
    const completed = weekKeys(weeksAgo).filter((key) => done.has(key)).length;
    weeks.push(
      Math.min(100, Math.round((completed / Math.max(1, daysPerWeek)) * 100)),
    );
  }
  return weeks;
}
