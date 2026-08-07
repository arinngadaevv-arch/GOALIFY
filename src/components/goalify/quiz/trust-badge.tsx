"use client";

import { ShieldCheck } from "lucide-react";

/**
 * Sits inline in the quiz's HUD readout row (see quiz-flow.tsx, the same
 * slot `HypeToast` uses when there's no toast to show) — not floating over
 * a viewport corner. Its first version, and the streak badge it replaced
 * before that, were both `position: fixed` in the bottom-right corner
 * alongside CoachGuide's floating avatar; on short viewports whose content
 * barely exceeds one screen, that corner sits directly on top of the last
 * grid row with no way to scroll it clear — a real, permanent overlap over
 * option-card text (see the "tile" layout's 2nd row on `level` /
 * `bodyFatPercent` / `weightKg`). Rendering in normal flow instead means
 * it can never cover interactive content, on any viewport.
 */
export function QuizTrustBadge() {
  return (
    <span className="gf-glass inline-flex shrink-0 items-center gap-1.5 rounded-full border border-electric/35 px-2.5 py-1">
      <ShieldCheck className="size-3.5 text-electric" strokeWidth={2.6} />
      <span className="text-[10px] font-black text-ink">AI Tailored</span>
    </span>
  );
}
