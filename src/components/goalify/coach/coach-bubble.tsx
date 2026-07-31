"use client";

import clsx from "clsx";
import { Bot } from "lucide-react";
import { COACH } from "@/lib/goalify/coach";

/** The coach's face — a glowing avatar badge with a live activity dot. */
export function CoachBadge({
  size = "md",
  className,
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dimensions = {
    sm: "size-9 text-base",
    md: "size-12 text-xl",
    lg: "size-16 text-2xl",
  }[size];

  return (
    <span className={clsx("relative shrink-0", className)}>
      <span
        className={clsx(
          "gf-glow-electric grid place-items-center rounded-2xl bg-linear-to-br from-electric to-[#0038b0] [.gf-cyber-scope_&]:to-[#0a1440]",
          dimensions,
        )}
      >
        <Bot className="size-1/2 text-lime-neon" strokeWidth={2.4} />
      </span>
      {/* Live dot — signals the coach is "active", not a static illustration. */}
      <span className="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-white [.gf-cyber-scope_&]:bg-[#0a0d1c]">
        <span className="size-2.5 animate-pulse rounded-full bg-lime-neon shadow-[0_0_8px_#39FF14] [.gf-cyber-scope_&]:shadow-[0_0_8px_#ffcc33]" />
      </span>
    </span>
  );
}

/**
 * A speech bubble from the coach. `key`ing this on the message text makes the
 * entrance animation replay whenever the coach says something new.
 */
export function CoachBubble({
  message,
  tone = "plain",
  compact = false,
  className,
}: {
  message: string;
  tone?: "plain" | "electric" | "lime";
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "gf-anim-rise flex items-start gap-3",
        compact ? "gap-2.5" : "gap-3",
        className,
      )}
    >
      <CoachBadge size={compact ? "sm" : "md"} />
      <div
        className={clsx(
          "gf-glass relative rounded-2xl rounded-tl-sm px-4 py-3",
          tone === "electric" && "gf-glass-electric",
          tone === "lime" && "gf-glass-lime",
        )}
      >
        {!compact && (
          <p className="mb-0.5 text-[10px] font-black tracking-[0.16em] text-electric uppercase">
            {COACH.name} · {COACH.role}
          </p>
        )}
        <p
          className={clsx(
            "font-semibold text-ink",
            compact ? "text-xs leading-snug" : "text-sm leading-relaxed",
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}
