"use client";

import { useMemo } from "react";
import clsx from "clsx";
import { ArrowRight } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst } from "./particle-burst";

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

/** Decorative skeleton connectors — pure line art, not interactive targets,
 * that tie the floating zone panels together into a readable HUD figure. */
const SKELETON_LINES: {
  left: number;
  top: number;
  width: number;
  height: number;
}[] = [
  { left: 49.5, top: 13.95, width: 1, height: 1.86 }, // neck
  { left: 10.08, top: 16.9, width: 79.84, height: 0.6 }, // shoulder line
  { left: 49.5, top: 15.81, width: 1, height: 38.14 }, // spine
  { left: 37.15, top: 48.7, width: 25.7, height: 0.6 }, // hip line
];

const SKELETON_NODES: { left: number; top: number }[] = [
  { left: 50, top: 13.95 },
  { left: 10.83, top: 17.2 },
  { left: 89.17, top: 17.2 },
  { left: 37.9, top: 49 },
  { left: 62.08, top: 49 },
  { left: 50, top: 49 },
];

/**
 * The interactive body-target selector: a stylized humanoid built from
 * plain positioned divs (not SVG artwork) so every zone can reuse the same
 * glow, hover, and particle-burst treatment as the rest of the quiz. A
 * skeleton of glowing connector lines ties the floating panels together
 * into a single scannable HUD figure.
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
          className="absolute inset-0 -z-10 rounded-full bg-electric/16 blur-3xl"
          aria-hidden
        />

        <div className="relative" style={{ aspectRatio: "240 / 430" }}>
          {/* Head — decorative, not a target zone. */}
          <div
            className="absolute rounded-full border border-electric/40 bg-electric/10 shadow-[0_0_18px_-2px_rgba(0,229,255,0.6)]"
            style={{ left: "39.17%", top: "1.86%", width: "21.67%", height: "12.09%" }}
            aria-hidden
          />

          {SKELETON_LINES.map((line, i) => (
            <span
              key={i}
              className="gf-cyber-skeleton-line absolute"
              style={{
                left: `${line.left}%`,
                top: `${line.top}%`,
                width: `${line.width}%`,
                height: `${line.height}%`,
              }}
              aria-hidden
            />
          ))}
          {SKELETON_NODES.map((node, i) => (
            <span
              key={i}
              className="gf-cyber-skeleton-node absolute size-1.5 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${node.left}%`, top: `${node.top}%` }}
              aria-hidden
            />
          ))}

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
                onClick={(event) => {
                  fireBurst(event.clientX, event.clientY);
                  toggle(zone.value);
                }}
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
        variant="cyber"
        size="lg"
        fullWidth
        className="mt-6"
        disabled={selected.length === 0 || locked}
        onClick={(event) => {
          fireBurst(event.clientX, event.clientY, true);
          onPick({ [step.id]: selected } as Partial<QuizAnswers>, selected);
        }}
      >
        Continue
        <ArrowRight className="size-5" />
      </GlowButton>
    </div>
  );
}
