import clsx from "clsx";

/**
 * Category tag, exercise name, and a single line of coaching context —
 * the second thing the eye should land on after the video. Editorial, not
 * a dashboard: one subtle uppercase label, then a large, confident name.
 */
export function ExerciseInfo({
  category,
  name,
  cue,
  badge,
  className,
}: {
  category: string;
  name: string;
  /** Omit once a set is actually running — the coaching cue moves onto the
   * video's own pill at that point, so this doesn't repeat the same line. */
  cue?: string;
  /** A small, quiet note under the category row — currently only used to
   * flag the session's opening mobility move as "Warm-up" so a beginner
   * doesn't mistake its easier pace for the workout's real intensity. Never
   * shown alongside `cue` real estate — deliberately tiny, not a second
   * headline. */
  badge?: string;
  className?: string;
}) {
  return (
    <div className={clsx("text-center", className)}>
      <p
        className="flex items-center justify-center gap-2 text-[13px] font-black tracking-[0.22em] uppercase"
        style={{ color: "var(--gf-gold)" }}
      >
        <span
          className="h-[2px] w-4 rounded-full"
          style={{ backgroundColor: "var(--gf-gold)" }}
          aria-hidden
        />
        {category}
        <span
          className="h-[2px] w-4 rounded-full"
          style={{ backgroundColor: "var(--gf-gold)" }}
          aria-hidden
        />
      </p>
      {badge && (
        <p className="mt-1 text-[10px] font-semibold tracking-[0.1em] text-haze uppercase">
          {badge}
        </p>
      )}
      <h1 className="gf-display mt-2 text-4xl leading-[0.98] font-black tracking-tight text-ink uppercase sm:text-5xl">
        {name}
      </h1>
      {cue && <p className="mt-2.5 text-sm leading-relaxed text-mist sm:text-base">{cue}</p>}
    </div>
  );
}
