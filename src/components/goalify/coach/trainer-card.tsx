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
 * The coaching roster shown across the landing page and workout headers.
 *
 * Each trainer renders a real photo when `photoSrc` is set (either here or
 * passed as a prop to `TrainerCard`); otherwise it falls back to a
 * stylised mocap figure on an energy gradient.
 */
export const TRAINERS: Trainer[] = [
  {
    id: "nova",
    name: "NOVA",
    speciality: "Fat burn & conditioning",
    quote: "You don't need more time. You need a plan that fits the time you have.",
    pose: "jack",
    accent: "electric",
    photoSrc: "/quiz/goal-athletic.png",
  },
  {
    id: "atlas",
    name: "ATLAS",
    speciality: "Strength & mass",
    quote: "Add one rep. Then do it again tomorrow. That's the whole secret.",
    pose: "pushup",
    accent: "lime",
    photoSrc: "/quiz/goal-build.png",
  },
  {
    id: "vera",
    name: "VERA",
    speciality: "Joint-safe training",
    quote: "Pain is information, not a stop sign. We train around it.",
    pose: "bridge",
    accent: "electric",
    photoSrc: "/quiz/goal-tone.png",
  },
  {
    id: "kai",
    name: "KAI",
    speciality: "Core & definition",
    quote: "Definition is built in the last three reps nobody wants to do.",
    pose: "core",
    accent: "lime",
    photoSrc: "/quiz/goal-burn.png",
  },
];

export function TrainerCard({
  trainer,
  photoSrc,
  className,
  compact = false,
}: {
  trainer: Trainer;
  photoSrc?: string;
  className?: string;
  compact?: boolean;
}) {
  const accentText =
    trainer.accent === "lime" ? "text-lime-deep" : "text-electric";
  const resolvedPhotoSrc = photoSrc ?? trainer.photoSrc;

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
            className="object-cover"
          />
        ) : (
          <PoseIcon
            pose={trainer.pose}
            className={clsx(
              "gf-anim-float drop-shadow-[0_8px_14px_rgba(0,82,255,0.3)]",
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
        <p
          className={clsx(
            "gf-display font-extrabold text-ink",
            compact ? "mt-0.5 text-base" : "mt-1 text-xl",
          )}
        >
          Coach {trainer.name}
        </p>
        {!compact && (
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            &ldquo;{trainer.quote}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
