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
  bold,
  className,
}: {
  exercise: Exercise;
  /** Optional second line — e.g. "14 reps · Quads · Glutes". Omit for a
   * plain name-only row. */
  detail?: string;
  /** Live player only — a heavier, gold-accented treatment ("the next
   * challenge") to match that screen's more intense identity. Defaults to
   * the original quiet styling everywhere else (the launchpad). */
  bold?: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-4", className)}>
      <div
        className={clsx(
          "grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-white/[0.04]",
          bold ? "size-16 bg-white/[0.05]" : "size-14",
        )}
        style={
          bold
            ? { boxShadow: "inset 0 0 0 1.5px var(--gf-gold, transparent)" }
            : undefined
        }
      >
        <PoseIcon
          pose={poseForExercise(exercise.name, exercise.focus)}
          className={clsx(bold ? "size-10 opacity-95" : "size-9 opacity-90")}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={clsx(
            "uppercase",
            bold
              ? "text-[11px] font-black tracking-[0.2em]"
              : "text-[11px] font-bold tracking-[0.18em] text-mist",
          )}
          style={bold ? { color: "var(--gf-gold)" } : undefined}
        >
          Up next
        </p>
        <p
          className={clsx(
            "truncate",
            bold
              ? "text-lg leading-snug font-black tracking-tight text-ink uppercase"
              : "text-base font-bold text-ink",
          )}
        >
          {exercise.name}
        </p>
        {detail && (
          <p
            className={clsx(
              "truncate text-sm",
              bold ? "font-semibold text-mist" : "text-mist",
            )}
          >
            {detail}
          </p>
        )}
      </div>
      <ChevronRight
        className={clsx("shrink-0 text-haze", bold ? "size-5" : "size-4")}
      />
    </div>
  );
}
