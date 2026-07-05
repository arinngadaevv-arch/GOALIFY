import Link from "next/link";
import { Lock, TrendingUp } from "lucide-react";
import type { Insights } from "@/lib/diagnosis/insights";

/**
 * "מה עובד אצלך" - the Track Record patterns.
 * - Pro: real, honest numbers (or a "need a bit more data" state).
 * - Free: a locked teaser (the peek) that makes the value obvious and links to
 *   the upgrade. The teaser shows labels + blurred placeholders, never fake
 *   numbers dressed up as the user's real data.
 */
export function InsightsCard({
  unlocked,
  insights,
}: {
  unlocked: boolean;
  insights: Insights | null;
}) {
  if (!unlocked) return <LockedTeaser />;

  if (!insights) {
    return (
      <div className="rounded-2xl border border-border bg-surface/60 p-6">
        <Heading />
        <p className="mt-3 text-sm text-muted">
          עוד כמה מהלכים שנמדדו עד הסוף, ונתחיל לזהות מה באמת עובד אצלך — הערוץ
          החזק שלך, אחוז ההצלחה והמגמות.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-6">
      <Heading />
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="הערוץ שהכי עובד לך"
          value={insights.bestChannelLabel ?? "עדיין נבחן"}
        />
        <Stat label="אחוז ביצוע" value={`${pct(insights.executionRate)}%`} />
        <Stat label="מהלכים שהניבו תוצאה" value={`${pct(insights.positiveRate)}%`} />
      </div>
      <p className="mt-4 text-xs text-muted">
        מבוסס על {insights.movesMeasured} מהלכים שנמדדו עד הסוף. ככל שנצבור עוד,
        ההמלצות שלנו יתחדדו.
      </p>
    </div>
  );
}

function Heading() {
  return (
    <div className="flex items-center gap-2">
      <TrendingUp className="size-4 text-neon-purple" />
      <h2 className="text-lg font-bold">מה עובד אצלך</h2>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 px-4 py-3">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted">{label}</div>
    </div>
  );
}

function pct(x: number): number {
  return Math.round(x * 100);
}

function LockedTeaser() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6">
      {/* Blurred placeholder shapes - clearly a preview, not real numbers. */}
      <div aria-hidden className="pointer-events-none select-none blur-sm">
        <Heading />
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["הערוץ שהכי עובד לך", "אחוז ביצוע", "מהלכים שהניבו תוצאה"].map((l) => (
            <div
              key={l}
              className="rounded-xl border border-border bg-surface-2 px-4 py-3"
            >
              <div className="h-5 w-14 rounded bg-foreground/20" />
              <div className="mt-1.5 text-[11px] text-muted">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Upsell overlay */}
      <div className="absolute inset-0 grid place-items-center bg-background/40 p-6 text-center backdrop-blur-[2px]">
        <div>
          <div className="mx-auto grid size-11 place-items-center rounded-full gradient-brand">
            <Lock className="size-5 text-white" />
          </div>
          <p className="mt-3 font-bold">מה באמת עובד אצלך?</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Pro מזהה את הערוץ החזק שלך, את אחוז ההצלחה ואת המגמות — ואומר לך על מה
            כדאי להמר בהמשך.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-flex rounded-full gradient-brand px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/20 transition-transform hover:scale-105"
          >
            גלו עם Pro
          </Link>
        </div>
      </div>
    </div>
  );
}
