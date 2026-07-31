"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { AVAILABLE_QUIZ_IMAGES } from "@/lib/goalify/quiz-images.generated";
import { QuizIconBadge, type QuizIconKey } from "./quiz-icons";

/**
 * Whether a real photo is actually available for this src — either a
 * remote `https://` URL, or a local file confirmed to exist in
 * /public/quiz at build time (see public/quiz/README.md). Callers use this
 * to decide whether to reserve a photo slot at all, rather than falling
 * back to an icon inside one.
 */
export function hasRealPhoto(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("http")) return true;
  return AVAILABLE_QUIZ_IMAGES.has(src);
}

/**
 * The photo area of an answer card. Only ever call this once `hasRealPhoto`
 * is true — callers without a real photo should render a small icon badge
 * inline instead of reserving this slot (see PhotoOptionCard in
 * quiz-flow.tsx). The modest icon fallback here only fires on a genuine
 * runtime load failure (the onError guard), and stays deliberately small —
 * never a large glyph filling the card.
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
  const showPhoto = hasRealPhoto(src) && !failed;
  // Skip Next's server-side image-optimization proxy entirely, for both
  // remote and local photos. Remote CDNs (Unsplash included) rate-limit or
  // block that proxy-to-proxy traffic even when a browser loading the same
  // URL directly is fine, and locally these are already pre-sized static
  // assets, so there's nothing to gain from server-side re-encoding.
  // `unoptimized` makes the browser fetch the file straight from the source.

  return (
    <div
      className={clsx("gf-photo-bed relative grid place-items-center overflow-hidden", className)}
      {...(showPhoto ? {} : { role: "img", "aria-label": `${label} — placeholder` })}
    >
      {showPhoto ? (
        <Image
          src={src as string}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 640px) 50vw, 240px"
          onError={() => setFailed(true)}
          className={clsx("object-cover object-center", imageClassName)}
        />
      ) : (
        <QuizIconBadge icon={icon} size="md" />
      )}
    </div>
  );
}
