/**
 * A tiny, reusable position indicator — "Day 1" today, but kept as its own
 * component (rather than inlined text in WorkoutHeader) since a workout's
 * position within a program is exactly the kind of label other screens
 * (library, history) will want to render the same way.
 */
export function WorkoutProgress({ label }: { label: string }) {
  return (
    <span className="gf-numeric text-xs font-bold tracking-[0.14em] text-mist uppercase">
      {label}
    </span>
  );
}
