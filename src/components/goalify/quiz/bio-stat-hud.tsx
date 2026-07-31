import { Gauge, Zap, type LucideIcon } from "lucide-react";
import type { QuizAnswers } from "@/lib/goalify/types";

/**
 * How much each answer contributes to the two HUD meters, plus the hype
 * badge that pops the instant it's picked. Deltas sum a little past 100 on
 * purpose — both meters read as "maxed out" before the very last question,
 * which is the point.
 */
export const HUD_STEP_META: Record<
  keyof QuizAnswers,
  { burn: number; precision: number; hype: string }
> = {
  goal: { burn: 12, precision: 6, hype: "TARGET LOCKED 🔥" },
  focusZones: { burn: 10, precision: 6, hype: "ZONES MAPPED 🎯" },
  painTrigger: { burn: 6, precision: 10, hype: "WEAKNESS FOUND ⚡" },
  vision: { burn: 6, precision: 8, hype: "VISION SET 👁️" },
  level: { burn: 8, precision: 8, hype: "BASELINE SET 📊" },
  joints: { burn: 4, precision: 8, hype: "SAFETY LOCKED 🛡️" },
  sessionLength: { burn: 10, precision: 6, hype: "TEMPO SET ⏱️" },
  daysPerWeek: { burn: 10, precision: 8, hype: "VOLUME LOCKED 💪" },
  sex: { burn: 4, precision: 8, hype: "FORMULA SET 🧬" },
  age: { burn: 4, precision: 8, hype: "CURVE MAPPED 📈" },
  heightCm: { burn: 4, precision: 8, hype: "BODY SCANNED 📡" },
  weightKg: { burn: 8, precision: 8, hype: "BASELINE LOCKED ⚙️" },
  targetWeightKg: { burn: 8, precision: 8, hype: "TARGET MAPPED 🎯" },
  commitment: { burn: 12, precision: 8, hype: "COMMITMENT LOCKED 🔥" },
};

/** Persistent HUD readout — ticks up on every answer, hype badge on top. */
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
    <div className="gf-cyber-border relative mt-4 overflow-hidden rounded-2xl bg-black/25 p-4">
      {toast && (
        <span
          key={toast}
          className="gf-cyber-hype-badge pointer-events-none absolute top-1.5 right-4 z-20 rounded-full bg-gradient-to-r from-[#00c2e0] to-[#00e5ff] px-3 py-1 text-[10px] font-black tracking-[0.04em] text-[#02131a] uppercase shadow-[0_0_16px_-2px_rgba(0,229,255,0.6)]"
        >
          {toast}
        </span>
      )}

      <HudBar
        icon={Zap}
        label="Adrenaline"
        value={burn}
        from="#00e5ff"
        to="#7df9ff"
      />
      <HudBar
        icon={Gauge}
        label="Metabolism Score"
        value={precision}
        from="#e0a300"
        to="#ffcc33"
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
