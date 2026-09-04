import clsx from "clsx";

/**
 * A small, quiet reinforcement of the exercise's cue — separate from the
 * short caption already overlaid on the video, this is the readable,
 * always-there version for anyone who wants to double-check their form
 * without staring at the clip.
 */
export function FormTip({ tip, className }: { tip: string; className?: string }) {
  return (
    <div className={clsx("text-center", className)}>
      <p
        className="text-[11px] font-bold tracking-[0.16em] uppercase"
        style={{ color: "var(--gf-gold)" }}
      >
        Form tip
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-mist">{tip}</p>
    </div>
  );
}
