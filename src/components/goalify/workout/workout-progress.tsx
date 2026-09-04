/**
 * A tiny, reusable position indicator. Most callers (library, history) just
 * want a plain label like "Day 1". The live player wants something a
 * little more useful without dominating the header — a real fraction, with
 * the current position picked out and the total left quiet — so `current`/
 * `total` are accepted as an alternative to `label`.
 */
export function WorkoutProgress({
  label,
  current,
  total,
}: {
  label?: string;
  current?: number;
  total?: number;
}) {
  if (current != null && total != null) {
    return (
      <span className="gf-numeric flex items-baseline gap-1">
        <span className="text-sm font-black text-ink">
          {String(current).padStart(2, "0")}
        </span>
        <span className="text-xs font-bold text-haze">⁄</span>
        <span className="text-xs font-bold text-mist">{total}</span>
      </span>
    );
  }

  return (
    <span className="gf-numeric text-xs font-bold tracking-[0.14em] text-mist uppercase">
      {label}
    </span>
  );
}
