import { todayKey } from "./store";

/**
 * Mon-Sun of the current calendar week — shared by live-player.tsx's
 * post-workout weekly-progress card and dashboard.tsx's "This week" strip
 * so the two can't drift on what counts as "this week."
 */
export function currentWeekDays(): {
  key: string;
  label: string;
  isToday: boolean;
  isFuture: boolean;
}[] {
  const now = new Date();
  const jsDay = now.getDay(); // 0 = Sunday
  const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const todayStr = todayKey(now);

  return labels.map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = todayKey(d);
    return { key, label, isToday: key === todayStr, isFuture: key > todayStr };
  });
}
