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
 * A glossy, gradient-lit icon badge — the premium replacement for emoji
 * glyphs across the whole app. Cyan-to-purple-to-orange rim with a soft
 * glow that intensifies once `active` is set. Same treatment the quiz's
 * answer icons use, shared here so every screen speaks the same visual
 * language.
 */
export function IconBadge({
  icon: Icon,
  size = "md",
  active = false,
  className,
}: {
  icon: LucideIcon;
  size?: keyof typeof SIZE_CLASSES;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "gf-icon-badge relative grid shrink-0 place-items-center",
        SIZE_CLASSES[size],
        active && "gf-icon-badge-active",
        className,
      )}
      aria-hidden
    >
      <Icon
        className={clsx(
          "relative z-10 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.25)]",
          ICON_SIZE_CLASSES[size],
        )}
        strokeWidth={2.4}
      />
    </span>
  );
}
