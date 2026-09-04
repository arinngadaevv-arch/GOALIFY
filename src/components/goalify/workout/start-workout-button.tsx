"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";

/**
 * The single most important element on the screen after the hero — a wide,
 * unmistakable champagne-gold CTA. Deliberately not reusing the app's
 * generic GlowLink: this needed its own gradient/glow tuned to the
 * launchpad's near-black canvas rather than another variant bolted onto a
 * component built for the light/obsidian scopes.
 */
export function StartWorkoutButton({
  href,
  onClick,
  className,
}: {
  href: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "gf-press gf-start-btn group flex w-full items-center justify-center gap-3 rounded-full py-5 text-base font-black tracking-[0.08em] text-[#241a06] uppercase transition-transform duration-300 hover:scale-[1.015] sm:text-lg",
        className,
      )}
    >
      Start Workout
      <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
