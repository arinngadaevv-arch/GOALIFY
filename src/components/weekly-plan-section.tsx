"use client";

import { useState } from "react";
import { CalendarDays, Loader2, Image as ImageIcon, Video, Film } from "lucide-react";
import {
  CONTENT_TYPE_LABELS,
  GOAL_LABELS,
  type PlanDayContentType,
  type PlanDayGoal,
} from "@/lib/ai/types";

const DAY_LABELS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

const TYPE_ICON: Record<PlanDayContentType, typeof Video> = {
  VIDEO: Video,
  IMAGE: ImageIcon,
  REEL: Film,
};

const GOAL_CLASSES: Record<PlanDayGoal, string> = {
  REACH: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  SALES: "bg-neon-pink/10 text-neon-pink border-neon-pink/30",
  ENGAGEMENT: "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
};

interface PlanDay {
  dayIndex: number;
  idea: string;
  contentType: PlanDayContentType;
  goal: PlanDayGoal;
}

export function WeeklyPlanSection({
  projectId,
  initialDays,
}: {
  projectId: string;
  initialDays: PlanDay[];
}) {
  const [days, setDays] = useState<PlanDay[]>(initialDays);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generatePlan() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "משהו השתבש, נסו שוב");
        return;
      }
      setDays(
        (data.days as PlanDay[]).sort((a, b) => a.dayIndex - b.dayIndex)
      );
    } catch {
      setError("משהו השתבש, נסו שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <CalendarDays className="size-5 text-neon-blue" />
          מתכנן תוכן שבועי
        </h2>
        <button
          onClick={generatePlan}
          disabled={loading}
          className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {days.length > 0 ? "יצירת תוכנית חדשה" : "יצירת תוכנית שבועית"}
        </button>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {days.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          עדיין לא נוצרה תוכנית שבועית לפרויקט הזה.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => {
            const Icon = TYPE_ICON[day.contentType];
            return (
              <div
                key={day.dayIndex}
                className="rounded-2xl border border-border bg-surface/60 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">
                    יום {DAY_LABELS[day.dayIndex]}
                  </span>
                  <Icon className="size-4 text-muted" />
                </div>
                <p className="mt-2 text-sm">{day.idea}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                    {CONTENT_TYPE_LABELS[day.contentType]}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${GOAL_CLASSES[day.goal]}`}
                  >
                    {GOAL_LABELS[day.goal]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
