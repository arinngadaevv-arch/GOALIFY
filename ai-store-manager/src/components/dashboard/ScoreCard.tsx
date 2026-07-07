function scoreColor(value: number): string {
  if (value >= 75) return "var(--good)";
  if (value >= 50) return "var(--warn)";
  return "var(--bad)";
}

export function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = scoreColor(value);
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-end gap-1">
        <span className="text-2xl font-semibold" style={{ color }}>
          {value}
        </span>
        <span className="pb-0.5 text-xs text-muted">/100</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
