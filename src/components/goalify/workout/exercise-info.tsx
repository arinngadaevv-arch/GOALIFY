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
  className,
}: {
  category: string;
  name: string;
  /** Omit once a set is actually running — the coaching cue moves onto the
   * video's own pill at that point, so this doesn't repeat the same line. */
  cue?: string;
  className?: string;
}) {
  return (
    <div className={clsx("text-center", className)}>
      <p
        className="text-xs font-bold tracking-[0.14em] uppercase"
        style={{ color: "var(--gf-gold)" }}
      >
        {category}
      </p>
      <h1 className="gf-display mt-1.5 text-3xl leading-[1.05] font-black text-ink sm:text-4xl">
        {name}
      </h1>
      {cue && <p className="mt-2 text-sm leading-relaxed text-mist sm:text-base">{cue}</p>}
    </div>
  );
}
