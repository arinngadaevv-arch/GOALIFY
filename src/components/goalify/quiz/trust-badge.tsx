"use client";

import { ShieldCheck } from "lucide-react";

/**
 * Replaces the quiz's old floating streak badge — a brand-new user's
 * streak is always 0, which read as a bug rather than a stat worth
 * showing. This corner is better spent building confidence instead: a
 * quiet reminder that the plan taking shape is personalized, not
 * generic. Same position/sizing as the badge it replaces, so it still
 * sits clear of CoachGuide's floating avatar (bottom-4 right-4) and the
 * option cards above it.
 */
export function QuizTrustBadge() {
  return (
    <div
      className="gf-glass pointer-events-none fixed right-4 bottom-24 z-40 flex items-center gap-1.5 rounded-full border border-electric/35 px-3 py-2"
      aria-hidden
    >
      <ShieldCheck className="size-4 text-electric" strokeWidth={2.6} />
      <span className="text-xs font-black text-ink">AI Tailored</span>
    </div>
  );
}
