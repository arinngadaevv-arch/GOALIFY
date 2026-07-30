import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

const SIZE_CLASSES = {
  xs: "size-5 rounded-lg",
  sm: "size-9 rounded-xl",
  md: "size-12 rounded-2xl",
  lg: "size-16 rounded-2xl",
} as const;

const ICON_SIZE_CLASSES = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
} as const;

/**
 * The premium replacement for emoji glyphs. Two tones:
 * - `neon` (default) — gradient-lit badge used across the app.
 * - `flat` — a pale electric-blue tint the quiz uses instead, so the icon
 *   shape (not a colourful blob) is what tells options apart.
 */
export function IconBadge({
  icon: Icon,
  size = "md",
  active = false,
  tone = "neon",
  className,
}: {
  icon: LucideIcon;
  size?: keyof typeof SIZE_CLASSES;
  active?: boolean;
  tone?: "neon" | "flat";
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative grid shrink-0 place-items-center",
        SIZE_CLASSES[size],
        tone === "neon" && ["gf-icon-badge", active && "gf-icon-badge-active"],
        tone === "flat" && ["gf-icon-flat", active && "gf-icon-flat-active"],
        className,
      )}
      aria-hidden
    >
      <Icon
        className={clsx(
          "relative z-10",
          ICON_SIZE_CLASSES[size],
          tone === "neon" && "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
          tone === "flat" && (active ? "text-white" : "text-electric"),
        )}
        strokeWidth={2.4}
      />
    </span>
  );
}
