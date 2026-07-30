import Image from "next/image";
import clsx from "clsx";
import { PersonStanding, type LucideIcon } from "lucide-react";
import { IconBadge } from "./icon-badge";

/**
 * Drop-in container for 3D artwork that has not been produced yet — coach
 * avatars, meal renders, badge trophies. Pass `src` once the real asset
 * exists (anything under /public) and the placeholder treatment disappears.
 * Until then, pass `icon` for the premium gradient badge treatment (the
 * emoji fallback stays for any spot not yet migrated).
 */
export function VisualSlot({
  label,
  hint,
  icon,
  emoji,
  src,
  alt,
  className,
  rounded = "rounded-glass",
  showChrome = true,
}: {
  label: string;
  hint?: string;
  icon?: LucideIcon;
  emoji?: string;
  src?: string;
  alt?: string;
  className?: string;
  rounded?: string;
  showChrome?: boolean;
}) {
  if (src) {
    return (
      <div className={clsx("relative overflow-hidden", rounded, className)}>
        <Image src={src} alt={alt ?? label} fill className="object-cover" />
      </div>
    );
  }

  const Icon = icon ?? (emoji ? null : PersonStanding);

  return (
    <div
      className={clsx(
        "gf-slot grid place-items-center text-center",
        rounded,
        className,
      )}
      role="img"
      aria-label={`${label} — artwork placeholder`}
    >
      <div className="relative z-10 flex flex-col items-center gap-2 px-4 py-6">
        {Icon ? (
          <IconBadge icon={Icon} size="lg" className="gf-anim-float" />
        ) : (
          <span className="gf-anim-float text-4xl drop-shadow-sm" aria-hidden>
            {emoji}
          </span>
        )}
        {showChrome && (
          <>
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-electric">
              {label}
            </span>
            {hint && (
              <span className="max-w-[22ch] text-[11px] leading-snug text-mist">
                {hint}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/** The hero coach avatar — a taller, more theatrical version of the slot. */
export function CoachAvatar({
  label = "3D Coach Avatar",
  hint = "Drop the rendered coach here",
  src,
  className,
}: {
  label?: string;
  hint?: string;
  src?: string;
  className?: string;
}) {
  return (
    <div className={clsx("relative", className)}>
      {/* Floor glow so the avatar reads as standing in the scene. */}
      <div
        className="absolute inset-x-6 bottom-0 h-10 rounded-[50%] bg-electric/25 blur-2xl"
        aria-hidden
      />
      <VisualSlot
        label={label}
        hint={hint}
        icon={PersonStanding}
        src={src}
        className="h-full w-full"
      />
    </div>
  );
}
