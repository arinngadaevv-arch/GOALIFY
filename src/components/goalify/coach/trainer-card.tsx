import clsx from "clsx";
import Image from "next/image";
import { PoseIcon, type PoseKey } from "@/components/goalify/ui/pose-icon";

export type Trainer = {
  id: string;
  name: string;
  speciality: string;
  quote: string;
  pose: PoseKey;
  accent: "electric" | "lime";
  /** Real photo, served from /public. Falls back to the illustrated pose. */
  photoSrc?: string;
};

/**
 * GOALIFY has exactly one coach persona, shown identically everywhere —
 * the landing page hero, the coaches section, and every floating coach
 * widget across the app (see COACH in lib/goalify/coach.ts, which mirrors
 * this name/tagline). There is no roster to rotate through.
 */
export const TRAINER: Trainer = {
  id: "atlas",
  name: "ATLAS",
  speciality: "Strength & mass",
  quote: "Add one rep. Then do it again tomorrow. That's the whole secret.",
  pose: "pushup",
  accent: "lime",
  photoSrc: "/quiz/workout-preview-pushup-closeup.png",
};

export function TrainerCard({
  trainer,
  photoSrc,
  className,
  compact = false,
  asHeading = false,
}: {
  trainer: Trainer;
  photoSrc?: string;
  className?: string;
  compact?: boolean;
  /** Renders the coach's name as an `<h3>` instead of a `<p>` — only correct
   * when this card sits directly under an `<h2>` (the "Meet your coaches"
   * grid). The hero slideshow reuses this same component above any heading
   * at all, so it must keep the default `<p>` to avoid an orphaned h3. */
  asHeading?: boolean;
}) {
  const accentText =
    trainer.accent === "lime" ? "text-lime-deep" : "text-electric";
  const resolvedPhotoSrc = photoSrc ?? trainer.photoSrc;
  const NameTag = asHeading ? "h3" : "p";

  return (
    <div
      className={clsx(
        "gf-glass gf-glass-deep gf-lift relative overflow-hidden rounded-glass",
        className,
      )}
    >
      {/* Energy wash behind the figure. */}
      <div
        className={clsx(
          "gf-gradient-pulse relative grid place-items-center",
          compact ? "h-28" : "h-44",
        )}
      >
        {resolvedPhotoSrc ? (
          <Image
            src={resolvedPhotoSrc}
            alt={trainer.name}
            fill
            className="object-cover object-top"
          />
        ) : (
          <PoseIcon
            pose={trainer.pose}
            className={clsx(
              "gf-anim-float drop-shadow-[0_8px_14px_rgba(232,179,44,0.35)]",
              compact ? "h-20 w-20" : "h-28 w-28",
            )}
          />
        )}
      </div>

      <div className={clsx(compact ? "p-3" : "p-5")}>
        <p
          className={clsx(
            "font-black tracking-[0.14em] uppercase",
            accentText,
            compact ? "text-[10px]" : "text-[11px]",
          )}
        >
          {trainer.speciality}
        </p>
        <NameTag
          className={clsx(
            "gf-display font-extrabold text-ink",
            compact ? "mt-0.5 text-base" : "mt-1 text-xl",
          )}
        >
          Coach {trainer.name}
        </NameTag>
        {!compact && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            &ldquo;{trainer.quote}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
