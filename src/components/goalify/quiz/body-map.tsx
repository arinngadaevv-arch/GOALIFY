"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { GlowButton } from "@/components/goalify/ui/glow-button";

/** Percentage-based rects so the figure scales cleanly at any width. */
const ZONE_SHAPES: Record<string, { left: number; top: number; width: number; height: number }[]> = {
  chest: [{ left: 22.92, top: 15.81, width: 54.17, height: 13.49 }],
  arms: [
    { left: 3.33, top: 16.74, width: 15, height: 30.7 },
    { left: 81.67, top: 16.74, width: 15, height: 30.7 },
  ],
  abs: [{ left: 28.33, top: 30.7, width: 43.33, height: 12.56 }],
  glutes: [{ left: 25.83, top: 44.65, width: 48.33, height: 9.3 }],
  legs: [
    { left: 28.33, top: 55.35, width: 19.17, height: 40.93 },
    { left: 52.5, top: 55.35, width: 19.17, height: 40.93 },
  ],
};

/**
 * The interactive body-target selector: a stylized humanoid built from
 * plain positioned divs (not SVG artwork) so every zone can reuse the same
 * glow, hover, and particle-burst treatment as the rest of the quiz.
 */
export function BodyMapStep({
  step,
  value,
  onSetDraft,
  onPick,
  locked,
  onTap,
}: {
  step: Extract<QuizStep, { kind: "bodyMap" }>;
  value: unknown;
  onSetDraft: (patch: Partial<QuizAnswers>) => void;
  onPick: (patch: Partial<QuizAnswers>, value: unknown) => void;
  locked: boolean;
  onTap: () => void;
}) {
  const selected = useMemo(
    () => (Array.isArray(value) ? (value as string[]) : []),
    [value],
  );

  const toggle = (zone: string) => {
    if (locked) return;
    onTap();
    const next = selected.includes(zone)
      ? selected.filter((v) => v !== zone)
      : [...selected, zone];
    onSetDraft({ [step.id]: next } as Partial<QuizAnswers>);
  };

  return (
    <div>
      <div className="relative mx-auto w-full max-w-[280px]">
        {/* Soft ambient glow behind the silhouette. */}
        <div
          className="absolute inset-0 -z-10 rounded-full bg-electric/12 blur-3xl"
          aria-hidden
        />

        <div className="relative" style={{ aspectRatio: "240 / 430" }}>
          {/* Head — decorative, not a target zone. */}
          <div
            className="absolute rounded-full bg-ink/8"
            style={{ left: "39.17%", top: "1.86%", width: "21.67%", height: "12.09%" }}
            aria-hidden
          />

          {step.zones.map((zone) => {
            const active = selected.includes(zone.value);
            const rects = ZONE_SHAPES[zone.value] ?? [];
            return rects.map((rect, index) => (
              <button
                key={`${zone.value}-${index}`}
                type="button"
                aria-pressed={active}
                aria-label={zone.label}
                disabled={locked}
                onClick={() => toggle(zone.value)}
                className={clsx(
                  "gf-zone gf-press absolute grid place-items-center rounded-[22px]",
                  active && "gf-zone-active",
                )}
                style={{
                  left: `${rect.left}%`,
                  top: `${rect.top}%`,
                  width: `${rect.width}%`,
                  height: `${rect.height}%`,
                }}
              >
                <span
                  className={clsx(
                    "relative z-10 text-center text-[9px] leading-tight font-black tracking-[0.08em] uppercase transition-colors",
                    active ? "text-white" : "text-ink-soft/70",
                  )}
                >
                  {zone.label}
                </span>
              </button>
            ));
          })}
        </div>
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-mist">
        {selected.length === 0
          ? "Tap the areas you want to prioritize"
          : `${selected.length} area${selected.length === 1 ? "" : "s"} selected`}
      </p>

      <GlowButton
        size="lg"
        fullWidth
        className="mt-6"
        disabled={selected.length === 0 || locked}
        onClick={() =>
          onPick(
            { [step.id]: selected } as Partial<QuizAnswers>,
            selected,
          )
        }
      >
        Continue
        <ArrowRight className="size-5" />
      </GlowButton>
    </div>
  );
}
