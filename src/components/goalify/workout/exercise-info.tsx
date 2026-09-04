import clsx from "clsx";

/**
 * Category tag, exercise name, and a single line of coaching context —
 * the second thing the eye should land on after the video. Plain instead
 * of tracked-caps for the title itself; only the small category tag above
 * it uses the app's usual uppercase-label treatment.
 */
export function ExerciseInfo({
  category,
  name,
  cue,
  className,
}: {
  category: string;
  name: string;
  /** Omit once a set is actually running — the coaching cue moves to
   * FormTip at that point, so this doesn't show the same line twice. */
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
      <h1 className="gf-display mt-1.5 text-3xl leading-tight font-black text-ink sm:text-4xl">
        {name}
      </h1>
      {cue && <p className="mt-1.5 text-sm leading-relaxed text-mist">{cue}</p>}
    </div>
  );
}
