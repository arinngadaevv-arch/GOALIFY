import type { QuizAnswers } from "@/lib/goalify/types";

/** The hype badge that pops the instant each answer lands. */
export const HUD_STEP_META: Record<keyof QuizAnswers, { hype: string }> = {
  goal: { hype: "TARGET LOCKED 🔥" },
  lastIdealBody: { hype: "TIMELINE MAPPED ⏳" },
  focusZones: { hype: "ZONES MAPPED 🎯" },
  vision: { hype: "VISION SET 👁️" },
  level: { hype: "BASELINE SET 📊" },
  joints: { hype: "COMMITMENT LOCKED 🔥" },
  bodyFatPercent: { hype: "PRECISION CALIBRATED 🎯" },
  sessionLength: { hype: "SCHEDULE SET ⏱️" },
  daysPerWeek: { hype: "VOLUME LOCKED 💪" },
  sex: { hype: "FORMULA SET 🧬" },
  age: { hype: "CURVE MAPPED 📈" },
  heightCm: { hype: "BODY SCANNED 📡" },
  weightKg: { hype: "NUMBERS LOCKED ⚙️" },
  targetWeightKg: { hype: "TARGET MAPPED 🎯" },
  commitment: { hype: "PLAN UNLOCKED ⚡" },
};

/** A floating, self-dismissing celebration pill — no persistent panel. */
export function HypeToast({ text }: { text: string }) {
  return (
    <span
      key={text}
      className="gf-cyber-hype-badge pointer-events-none absolute top-1 right-0 z-20 rounded-full bg-gradient-to-r from-[#e8b32c] to-[#ffd666] px-3 py-1 text-[10px] font-black tracking-[0.04em] text-[#1a1100] uppercase shadow-[0_0_16px_-2px_rgba(232,179,44,0.65)]"
    >
      {text}
    </span>
  );
}
