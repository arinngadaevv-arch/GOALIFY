import { ChevronRight } from "lucide-react";
import { PoseIcon, poseForExercise } from "@/components/goalify/ui/pose-icon";
import type { Exercise } from "@/lib/goalify/types";

/**
 * A single quiet row previewing the second exercise — not a card, no
 * border, no background. The launchpad already has one card-shaped thing
 * on it (none, actually): everything here is meant to read as content on
 * the page, not UI chrome boxing it in.
 */
export function UpNext({ exercise }: { exercise: Exercise }) {
  return (
    <div className="gf-launch-rise gf-delay-3 flex items-center gap-4">
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
      </div>
      <ChevronRight className="size-4 shrink-0 text-haze" />
    </div>
  );
}
