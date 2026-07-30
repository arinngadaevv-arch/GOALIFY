"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AVAILABLE_QUIZ_IMAGES } from "@/lib/goalify/quiz-images.generated";
import { QUIZ_ICONS, type QuizIconKey } from "./quiz-icons";

/**
 * The photo area of an answer card.
 *
 * Renders a real photograph two ways:
 * - `src` starting with "http" — a remote URL (e.g. licensed stock
 *   photography). Trusted as-is; add the host to `images.remotePatterns`
 *   in next.config.ts first or next/image will refuse to load it.
 * - a local path — only rendered once the file actually exists in
 *   /public/quiz (see public/quiz/README.md), baked in at build time by
 *   scripts/gen-quiz-images.mjs, so a card with no photo yet never fires a
 *   request that 404s.
 *
 * Either way, a missing/failed photo falls back to a large illustrative
 * glyph — not a small icon lost in a box. That fallback is not
 * photography — there's no image-generation tool available here.
 */
export function OptionPhoto({
  src,
  alt,
  label,
  icon,
  className,
  imageClassName,
}: {
  src?: string;
  alt: string;
  label: string;
  icon: QuizIconKey;
  className?: string;
  imageClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const isRemote = src?.startsWith("http");
  const showPhoto =
    src !== undefined && (isRemote || AVAILABLE_QUIZ_IMAGES.has(src)) && !failed;
  const Icon = QUIZ_ICONS[icon];

  return (
    <div
      className={clsx("gf-photo-bed relative grid place-items-center overflow-hidden", className)}
      {...(showPhoto ? {} : { role: "img", "aria-label": `${label} — illustration placeholder` })}
    >
      {showPhoto ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 640px) 50vw, 240px"
          onError={() => setFailed(true)}
          className={clsx("object-contain object-bottom", imageClassName)}
        />
      ) : (
        <Icon
          className="gf-anim-float relative z-10 h-[80%] w-[80%] text-electric/80"
          strokeWidth={1.1}
          aria-hidden
        />
      )}
    </div>
  );
}
