import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { PoseIcon, poseForExercise } from "@/components/goalify/ui/pose-icon";
import type { Exercise } from "@/lib/goalify/types";

/**
 * A single quiet row previewing the next exercise — not a card, no border,
 * no background, so it reads as supporting content rather than another
 * major surface competing with whatever the screen's actual focus is.
 * Shared between the launchpad and the live player; entrance animation is
 * left to the caller rather than baked in, since the two screens use
 * different animation scopes.
 */
export function UpNext({
  exercise,
  detail,
  className,
}: {
  exercise: Exercise;
  /** Optional second line — e.g. "14 reps · Quads · Glutes". Omit for a
   * plain name-only row. */
  detail?: string;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <div className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/[0.04]">
        <PoseIcon
          pose={poseForExercise(exercise.name, exercise.focus)}
          className="size-9 opacity-90"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold tracking-[0.18em] text-mist uppercase">
          Up next
        </p>
        <p className="truncate text-base font-bold text-ink">{exercise.name}</p>
        {detail && <p className="truncate text-sm text-mist">{detail}</p>}
      </div>
      <ChevronRight className="size-4 shrink-0 text-haze" />
    </div>
  );
}
