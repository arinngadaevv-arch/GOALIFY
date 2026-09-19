"use client";

import clsx from "clsx";
import { BatteryLow, Flame, Meh } from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import type { EnergyLevel } from "@/lib/goalify/types";
import { GlassCard } from "./ui/glass-card";

const OPTIONS: {
  level: EnergyLevel;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { level: "fire", label: "Fired up", Icon: Flame },
  { level: "soso", label: "So-so", Icon: Meh },
  { level: "empty", label: "Running on empty", Icon: BatteryLow },
];

/** One line per pick — kept short since "empty" no longer needs to explain
 * itself in words: the actual effect is visible right below, on today's
 * own workout card (see dashboard.tsx's isEnergyQuickFix), which is what
 * makes this an answer instead of small talk. */
const REACTIONS: Record<EnergyLevel, string> = {
  fire: "Good. Don't waste it sitting here — go put it into today's session.",
  soso: "So-so still gets the session done. Show up, decide how you feel after.",
  empty: "Noted — today's session below just got shorter.",
};

/**
 * A one-tap morning self-report, not a survey — three buttons, one pick,
 * done. Deliberately not a modal: it sits in the normal scroll of the
 * dashboard so it never blocks getting to the workout, and it stays
 * visible (highlighted choice + reaction) after answering rather than
 * vanishing, so the tap visibly registered. Overwritable all day — see
 * setEnergyLevel — since changing your mind before training isn't wrong.
 */
export function EnergyCheckin() {
  const { energyLevel, setEnergyLevel } = useGoalify();

  return (
    <GlassCard deep className="gf-reveal p-5">
      <p className="text-[11px] font-bold tracking-[0.14em] text-mist uppercase">
        Quick check-in
      </p>
      <p className="mt-1 text-sm font-extrabold text-ink">
        How&apos;s your energy today?
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {OPTIONS.map(({ level, label, Icon }) => (
          <button
            key={level}
            type="button"
            onClick={() => setEnergyLevel(level)}
            className={clsx(
              "gf-press flex flex-col items-center gap-1.5 rounded-2xl border py-3 text-center transition-colors",
              energyLevel === level
                ? "border-electric bg-electric/10 text-electric"
                : "border-ink/10 bg-ink/3 text-ink-soft hover:border-electric/40",
            )}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-bold">{label}</span>
          </button>
        ))}
      </div>

      {energyLevel && (
        <p className="mt-4 border-t border-ink/8 pt-4 text-xs leading-relaxed text-ink-soft">
          {REACTIONS[energyLevel]}
        </p>
      )}
    </GlassCard>
  );
}
