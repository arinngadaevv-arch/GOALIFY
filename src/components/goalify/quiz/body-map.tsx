"use client";

import { useMemo } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { fireBurst } from "./particle-burst";

/**
 * Percent-based hotspot rects over /quiz/bodymap-character-v2.png (410x842),
 * one entry per zone, some split into a left/right pair — measured against
 * that exact image, so keep them as [left, top, width, height] in % if the
 * source photo ever changes. Refined over several rounds of visual design
 * work: markers stay visible at rest (not just on selection) so the photo
 * reads as tappable without a label overlay, and brighten/quicken once a
 * zone is actually picked rather than swapping to a boxed checkmark.
 */
const ZONE_RECTS: Record<string, [number, number, number, number][]> = {
  chest: [[23, 21, 54, 13]],
  arms: [
    [2, 17, 22, 42],
    [76, 17, 22, 42],
  ],
  abs: [[18, 34, 55, 15]],
  glutes: [[22, 48, 53, 6]],
  legs: [
    [21, 70, 22, 20],
    [57, 70, 23, 20],
  ],
};

/**
 * The focus-area picker — a tappable photo of the body with a glowing
 * outline over each zone, not a list of rows. Selecting a zone brightens
 * and speeds up its glow and adds a small gold checkmark badge; the list
 * of zone names/descriptions from the step data still drives which
 * outlines exist and what each one is labeled (aria-label only — the
 * photo itself carries no on-screen text, by design).
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

  const hotspots = step.zones.flatMap((zone) =>
    (ZONE_RECTS[zone.value] ?? []).map((rect, i) => ({
      key: `${zone.value}-${i}`,
      zone,
      rect,
      active: selected.includes(zone.value),
    })),
  );

  return (
    <div>
      <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-black/40 p-3 shadow-[0_25px_50px_-18px_rgba(0,0,0,0.7)] backdrop-blur-xl">
        <div className="relative mx-auto aspect-[410/842] w-full max-w-60 overflow-hidden rounded-2xl bg-[#121316]">
          <Image
            src="/quiz/bodymap-character-v2.png"
            alt="Body diagram with tappable focus zones"
            fill
            unoptimized
            priority
            sizes="240px"
            className="object-contain object-top saturate-[.7] sepia-[.16]"
          />

          {hotspots.map(({ key, zone, rect, active }) => {
            const [left, top, width, height] = rect;
            return (
              <button
                key={key}
                type="button"
                aria-label={zone.label}
                aria-pressed={active}
                disabled={locked}
                onClick={(event) => {
                  fireBurst(event.clientX, event.clientY, active);
                  toggle(zone.value);
                }}
                className="absolute border-0 bg-transparent p-0"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: `${width}%`,
                  height: `${height}%`,
                }}
              >
                <span
                  className={clsx(
                    "pointer-events-none absolute inset-[6%] rounded-full border-[1.5px]",
                    active
                      ? "gf-anim-zone-glow-active"
                      : "gf-anim-zone-glow-idle",
                  )}
                />
                {active && (
                  <span className="absolute top-[10%] right-[10%] flex size-[22px] translate-x-[45%] -translate-y-[45%] items-center justify-center rounded-full bg-electric text-black shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                    <Check className="size-3" strokeWidth={3.5} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        disabled={selected.length === 0 || locked}
        onClick={(event) => {
          fireBurst(event.clientX, event.clientY, true);
          onPick({ [step.id]: selected } as Partial<QuizAnswers>, selected);
        }}
        className="group mt-8 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#f3ca5a] to-[#d9a52e] text-[15px] font-semibold text-[#1a1100] shadow-[0_12px_28px_-10px_rgba(232,179,44,0.55)] transition-all duration-200 hover:shadow-[0_16px_34px_-8px_rgba(232,179,44,0.65)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
      >
        Continue
        <ArrowRight className="size-4.5 transition-transform duration-150 group-active:translate-x-0.5" />
      </button>
    </div>
  );
}
