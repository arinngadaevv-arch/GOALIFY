import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";

/** The real logo (house/dumbbell/lightning mark + "GOALIFY" wordmark baked
 * into the artwork) — rendered as a single image rather than paired with a
 * separate text label, since the wordmark is already part of the file and
 * showing both would duplicate it. */
export function Brand({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link href={href} className={clsx("flex shrink-0 items-center", className)}>
      <Image
        src="/brand/logo.jpg"
        alt="GOALIFY — AI home fitness coach"
        width={224}
        height={224}
        priority
        className="size-11 rounded-xl"
      />
    </Link>
  );
}
