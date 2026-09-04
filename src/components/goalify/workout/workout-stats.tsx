import { Flame } from "lucide-react";
import clsx from "clsx";

/**
 * Calories and completed-exercise count, kept deliberately small and
 * muted — the user shouldn't feel like they need to monitor either while
 * they're mid-set. A quiet inline row, not the pair of prominent cards
 * this used to be.
 */
export function WorkoutStats({
  calories,
  completed,
  total,
  className,
}: {
  calories: number;
  completed: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center justify-center gap-2 text-xs font-semibold text-mist",
        className,
      )}
    >
      <Flame className="size-3.5" strokeWidth={2.4} />
      <span className="gf-numeric">{calories}</span>
      <span>kcal</span>
      <span className="text-haze">·</span>
      <span className="gf-numeric">{completed}</span>
      <span>/ {total} completed</span>
    </div>
  );
}
