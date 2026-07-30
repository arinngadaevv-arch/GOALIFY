import { Gauge, Zap, type LucideIcon } from "lucide-react";
import type { QuizAnswers } from "@/lib/goalify/types";

/**
 * How much each answer contributes to the two HUD meters, plus the label
 * shown in the floating "+N%" toast the instant it's picked. Deltas sum a
 * little past 100 on purpose — both bars read as "maxed out" before the
 * very last question, which is the point.
 */
export const HUD_STEP_META: Record<
  keyof QuizAnswers,
  { burn: number; precision: number; label: string }
> = {
  goal: { burn: 12, precision: 6, label: "Metabolism Drive" },
  focusZones: { burn: 10, precision: 6, label: "Target Lock" },
  painTrigger: { burn: 6, precision: 10, label: "Adherence Engine" },
  vision: { burn: 6, precision: 8, label: "Motivation Index" },
  level: { burn: 8, precision: 8, label: "Baseline Calibration" },
  joints: { burn: 4, precision: 8, label: "Safety Protocol" },
  sessionLength: { burn: 10, precision: 6, label: "Burn Efficiency" },
  daysPerWeek: { burn: 10, precision: 8, label: "Volume Capacity" },
  sex: { burn: 4, precision: 8, label: "Metabolic Formula" },
  age: { burn: 4, precision: 8, label: "Recovery Curve" },
  heightCm: { burn: 4, precision: 8, label: "Body Composition" },
  weightKg: { burn: 8, precision: 8, label: "Baseline Locked" },
  targetWeightKg: { burn: 8, precision: 8, label: "Target Mapped" },
  commitment: { burn: 12, precision: 8, label: "Plan Precision" },
};

/** Persistent 2K/FIFA-style stat HUD — ticks up on every answer. */
export function BioStatHud({
  burn,
  precision,
  toast,
}: {
  burn: number;
  precision: number;
  toast: string | null;
}) {
  return (
    <div className="gf-card relative mt-4 overflow-hidden rounded-2xl p-4">
      {toast && (
        <span
          key={toast}
          className="gf-anim-hud-toast pointer-events-none absolute top-1.5 right-4 z-20 rounded-full bg-electric px-2.5 py-1 text-[10px] font-black text-white uppercase shadow-md"
        >
          {toast}
        </span>
      )}

      <HudBar
        icon={Zap}
        label="Burn Potential"
        value={burn}
        from="#0052ff"
        to="#4d85ff"
      />
      <HudBar
        icon={Gauge}
        label="Plan Precision"
        value={precision}
        from="#1faa06"
        to="#39ff14"
        className="mt-3"
      />
    </div>
  );
}

function HudBar({
  icon: Icon,
  label,
  value,
  from,
  to,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  from: string;
  to: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] font-black tracking-[0.12em] text-ink-soft uppercase">
          <Icon className="size-3" strokeWidth={3} />
          {label}
        </span>
        <span className="gf-numeric text-xs font-black text-ink">
          {Math.round(clamped)}%
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/8">
        <div
          className="h-full rounded-full transition-[width] duration-700 ease-out"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${from}, ${to})`,
            boxShadow: `0 0 10px ${to}`,
          }}
        />
      </div>
    </div>
  );
}
