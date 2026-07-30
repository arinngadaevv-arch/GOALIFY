import clsx from "clsx";

const SIZE_CLASSES = {
  md: "size-12 rounded-2xl",
} as const;

/**
 * A minimal line-art figure with the relevant joint highlighted — the
 * distinct, purpose-built replacement for reusing the same shield icon on
 * every "what hurts" option. One shared silhouette, three highlight
 * positions, so knees/back/shoulders are visually unmistakable from each
 * other at a glance.
 */
export function JointGlyph({
  part,
  active = false,
  className,
}: {
  part: "knees" | "back" | "shoulders";
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative grid shrink-0 place-items-center",
        SIZE_CLASSES.md,
        active ? "gf-icon-flat-active" : "gf-icon-flat",
        className,
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 40 60"
        className="relative z-10 h-8 w-6"
        fill="none"
        stroke={active ? "#ffffff" : "var(--color-electric)"}
        strokeWidth={2}
        strokeLinecap="round"
      >
        <circle cx="20" cy="8" r="5" />
        <rect x="13" y="16" width="14" height="19" rx="6" />
        <line x1="13" y1="20" x2="7" y2="34" />
        <line x1="27" y1="20" x2="33" y2="34" />
        <line x1="17" y1="35" x2="15" y2="54" />
        <line x1="23" y1="35" x2="25" y2="54" />

        {part === "shoulders" && (
          <>
            <circle cx="13" cy="20" r="4" fill={active ? "#ffffff" : "var(--color-electric)"} stroke="none" />
            <circle cx="27" cy="20" r="4" fill={active ? "#ffffff" : "var(--color-electric)"} stroke="none" />
          </>
        )}
        {part === "back" && (
          <circle cx="20" cy="27" r="4.5" fill={active ? "#ffffff" : "var(--color-electric)"} stroke="none" />
        )}
        {part === "knees" && (
          <>
            <circle cx="15.6" cy="45" r="4" fill={active ? "#ffffff" : "var(--color-electric)"} stroke="none" />
            <circle cx="24.4" cy="45" r="4" fill={active ? "#ffffff" : "var(--color-electric)"} stroke="none" />
          </>
        )}
      </svg>
    </span>
  );
}
