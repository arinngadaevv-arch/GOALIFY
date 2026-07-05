import { TrendingUp } from "lucide-react";

const NICHE_LABELS: Record<string, string> = {
  cosmetology: "קוסמטיקה ואסתטיקה",
};

function nicheLabel(niche: string): string {
  return NICHE_LABELS[niche] ?? niche;
}

function firstName(name: string | null | undefined): string | null {
  if (!name) return null;
  const first = name.trim().split(/\s+/)[0];
  return first || null;
}

type Stats = {
  /** Moves that actually reached the owner (status SENT). */
  movesSent: number;
  /** Of those, how many she reported doing. */
  executed: number;
  /** Fully-closed learning loops (outcome + 48h follow-up answered). */
  loopsClosed: number;
};

/**
 * Warm, first-person header. The copy speaks as the business's partner and the
 * numbers are all real, counted from the decision/outcome stream - never
 * fabricated - so momentum is honest (the Track Record principle).
 */
export function BusinessHeader({
  name,
  niche,
  ownerName,
  stats,
}: {
  name: string;
  niche: string;
  ownerName: string | null;
  stats: Stats;
}) {
  const greetingName = firstName(ownerName);
  const isNew = stats.movesSent === 0;

  const partnerLine = isNew
    ? "נעים להכיר. אני כאן כדי לעזור לך להפסיק לנחש — כל שבוע נזהה יחד את הדבר האחד שהכי משתלם לעסק שלך לעשות עכשיו."
    : `כבר עברנו יחד ${stats.movesSent} מהלכים. אני זוכר מה עבד אצלך ומה פחות — וממשיך לחדד את מה שאני ממליץ.`;

  return (
    <header className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 sm:p-8">
      <div className="pointer-events-none absolute -left-20 -top-20 size-48 rounded-full bg-neon-purple/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 -bottom-20 size-44 rounded-full bg-neon-pink/15 blur-3xl" />

      <div className="relative">
        {greetingName && (
          <p className="text-sm text-muted">היי {greetingName},</p>
        )}
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">{name}</h1>
        <p className="mt-0.5 text-sm text-muted">{nicheLabel(niche)}</p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-foreground/90">
          {partnerLine}
        </p>

        {!isNew && (
          <div className="mt-6 flex flex-wrap gap-3">
            <StatTile value={stats.movesSent} label="מהלכים יחד" />
            <StatTile value={stats.executed} label="ביצעת בפועל" />
            <StatTile value={stats.loopsClosed} label="נמדדו עד הסוף" />
          </div>
        )}
      </div>
    </header>
  );
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-4 py-2.5">
      <TrendingUp className="size-4 text-neon-purple" />
      <div className="leading-tight">
        <div className="text-lg font-extrabold">{value}</div>
        <div className="text-[11px] text-muted">{label}</div>
      </div>
    </div>
  );
}
