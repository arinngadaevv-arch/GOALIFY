import clsx from "clsx";

export type Ring = {
  /** 0–100. */
  value: number;
  color: string;
  label: string;
  trackColor?: string;
};

/**
 * Concentric SVG progress rings. Two rings drive the dashboard's dual
 * workout / nutrition widget; a single ring drives the live countdown timer.
 */
export function ProgressRing({
  rings,
  size = 200,
  thickness = 14,
  gap = 8,
  children,
  className,
  animate = true,
  /** Tuned for a discrete percentage snapping to a new value (dashboard
   * widgets). A per-second countdown instead wants `duration=1000` +
   * `easing="linear"` — that makes the ring travel the *exact* distance a
   * real second represents in a real second, so it reads as continuously
   * closing rather than easing in and visibly pausing before each tick. */
  transitionMs = 900,
  easing = "cubic-bezier(0.16, 1, 0.3, 1)",
}: {
  rings: Ring[];
  size?: number;
  thickness?: number;
  gap?: number;
  children?: React.ReactNode;
  className?: string;
  animate?: boolean;
  transitionMs?: number;
  easing?: string;
}) {
  const center = size / 2;

  return (
    <div
      className={clsx("relative shrink-0", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        {rings.map((ring, index) => {
          const radius = center - thickness / 2 - index * (thickness + gap);
          const circumference = 2 * Math.PI * radius;
          const clamped = Math.max(0, Math.min(100, ring.value));
          const offset = circumference * (1 - clamped / 100);

          return (
            <g key={ring.label}>
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                stroke={ring.trackColor ?? "rgba(10, 25, 70, 0.07)"}
                strokeLinecap="round"
              />
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                stroke={ring.color}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: animate
                    ? `stroke-dashoffset ${transitionMs}ms ${easing}`
                    : undefined,
                  filter: `drop-shadow(0 0 6px ${ring.color}66)`,
                }}
              />
            </g>
          );
        })}
      </svg>
      {children && (
        <div className="absolute inset-0 grid place-items-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}

export const RING_ELECTRIC = "#0052FF";
export const RING_LIME = "#39FF14";
