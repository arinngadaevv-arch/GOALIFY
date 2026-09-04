"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";

/**
 * A small, sophisticated feature row — not the launchpad's own advertising
 * banner. Named AIGuideFeature rather than the requested "AIFormGuide" to
 * avoid colliding with the existing `AIFormGuide` component in
 * workout/ai-form-guide.tsx, which renders the actual tracked video view
 * inside the live player — a completely different job (a real view vs. a
 * feature teaser), so giving them the same name would make imports
 * ambiguous and risk one accidentally breaking the other down the line.
 */
export function AIGuideFeature() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="gf-launch-rise gf-delay-4 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[color:var(--gf-champagne)]/12 text-[color:var(--gf-champagne)]">
        <Sparkles className="size-4" strokeWidth={2.4} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold tracking-[0.14em] text-ink uppercase">
          AI Form Guide
        </p>
        <p className="mt-0.5 text-xs text-mist">
          Real-time feedback during your workout
        </p>
      </div>
      <button
        type="button"
        onClick={() => setEnabled((value) => !value)}
        aria-pressed={enabled}
        aria-label="Toggle AI form guide"
        className={clsx(
          "gf-press relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300",
          enabled ? "bg-[color:var(--gf-champagne)]" : "bg-white/10",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 size-5 rounded-full bg-[#0b0b0a] transition-transform duration-300",
            enabled ? "translate-x-[18px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}
