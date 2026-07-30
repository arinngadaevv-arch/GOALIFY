"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AVAILABLE_QUIZ_IMAGES } from "@/lib/goalify/quiz-images.generated";
import { QuizIconBadge, type QuizIconKey } from "./quiz-icons";

/**
 * The photo area of an answer card.
 *
 * Renders the real cut-out photograph when one has been dropped into
 * /public/quiz (see public/quiz/README.md). Which files exist is baked in at
 * build time by scripts/gen-quiz-images.mjs, so a card with no photo yet
 * shows a premium icon badge instead — never a request that 404s. The
 * onError guard is a second line of defence if a file is removed later.
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

  return (
    <div
      className={clsx("gf-photo-bed relative grid place-items-center", className)}
      {...(showPhoto ? {} : { role: "img", "aria-label": `${label} — icon placeholder` })}
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
        <QuizIconBadge icon={icon} size="lg" className="gf-anim-float" />
      )}
    </div>
  );
}
