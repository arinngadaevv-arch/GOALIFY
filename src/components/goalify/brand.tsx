import Link from "next/link";
import clsx from "clsx";
import { Zap } from "lucide-react";

export function Brand({
  href = "/",
  className,
}: {
  href?: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "flex shrink-0 items-center gap-2 font-extrabold tracking-[-0.04em]",
        className,
      )}
    >
      <span className="gf-glow-electric grid size-9 place-items-center rounded-xl bg-electric">
        <Zap className="size-5 text-lime-neon" strokeWidth={2.8} />
      </span>
      <span className="gf-display text-xl text-ink">GOALIFY</span>
    </Link>
  );
}
