"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AVAILABLE_QUIZ_IMAGES } from "@/lib/goalify/quiz-images.generated";
import { QUIZ_ICONS, type QuizIconKey } from "./quiz-icons";

/**
 * The photo area of an answer card.
 *
 * Renders the real cut-out photograph when one has been dropped into
 * /public/quiz (see public/quiz/README.md). Which files exist is baked in at
 * build time by scripts/gen-quiz-images.mjs, so a card with no photo yet
 * shows a large illustrative glyph instead — never a request that 404s, and
 * never a small icon lost in a box. The onError guard is a second line of
 * defence if a file is removed later.
 *
 * This fallback is not photography — there's no image-generation tool
 * available here. It's the best placeholder until real photos are dropped
 * in per public/quiz/README.md.
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
  const showPhoto = src !== undefined && AVAILABLE_QUIZ_IMAGES.has(src) && !failed;
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
