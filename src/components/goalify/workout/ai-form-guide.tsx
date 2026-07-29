import clsx from "clsx";
import { PoseIcon, type PoseKey } from "@/components/goalify/ui/pose-icon";

/**
 * Stand-in for the rendered 3D coach video: a tracked-frame treatment
 * (corner brackets, scanning sweep, mocap skeleton) so it reads as an
 * active AI analysis view rather than a static placeholder image. Drop
 * the real render in here later behind the same aspect box.
 */
export function AIFormGuide({
  pose,
  label,
  hint,
  className,
}: {
  pose: PoseKey;
  label: string;
  hint: string;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "gf-slot relative flex flex-col items-center justify-center gap-3 overflow-hidden",
        // Bottom room for the player's absolutely-positioned cue strip.
        "pb-16",
        className,
      )}
    >
      {/* Tracking scan sweep — reinforces "AI analysis in progress". */}
      <div
        className="gf-anim-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-transparent via-electric/12 to-transparent"
        aria-hidden
      />

      {/* Viewfinder corner brackets. */}
      {(["top-3 left-3", "top-3 right-3 rotate-90", "bottom-3 right-3 rotate-180", "bottom-3 left-3 -rotate-90"] as const).map(
        (position) => (
          <span
            key={position}
            className={clsx(
              "pointer-events-none absolute size-4 border-t-2 border-l-2 border-electric/50",
              position,
            )}
            aria-hidden
          />
        ),
      )}

      <PoseIcon
        pose={pose}
        className="gf-anim-float relative z-10 h-28 w-28 drop-shadow-[0_6px_10px_rgba(0,82,255,0.28)] sm:h-32 sm:w-32"
      />

      <div className="relative z-10 text-center">
        <p className="text-[11px] font-bold tracking-[0.16em] text-electric uppercase">
          {label}
        </p>
        <p className="mt-0.5 max-w-[22ch] text-[11px] leading-snug text-mist">
          {hint}
        </p>
      </div>
    </div>
  );
}
