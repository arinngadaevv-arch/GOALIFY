"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst } from "./particle-burst";

/**
 * Percentage-based hit-targets over the real photo background
 * (bodymap-character-v2.png) — a plain, unmarked photo (no baked-in panel
 * graphics or labels, unlike the previous asset), so every zone's outline
 * and label is real DOM here, not something the image already draws.
 */
// Measured directly against bodymap-character-v2.png at 1%-resolution:
// scanned every row of the image for background-vs-body pixels, took the
// min/max x per body part across its full y-range (not eyeballed), so
// these track the new photo's actual proportions rather than reused
// coordinates from the old asset. A hairline 1–2pt overlap at a couple of
// seams (e.g. chest/arms, arms/legs) is intentional and harmless —
// later-in-DOM zones win those pixels, and the seam itself falls on a
// curved, un-rectangular body contour anyway.
const ZONE_SHAPES: Record<string, { left: number; top: number; width: number; height: number }[]> = {
  chest: [{ left: 23, top: 21, width: 54, height: 13 }],
  arms: [
    { left: 2, top: 17, width: 22, height: 42 },
    { left: 76, top: 17, width: 22, height: 42 },
  ],
  abs: [{ left: 18, top: 34, width: 65, height: 15 }],
  glutes: [{ left: 22, top: 48, width: 53, height: 6 }],
  legs: [
    { left: 21, top: 70, width: 22, height: 20 },
    { left: 57, top: 70, width: 23, height: 20 },
  ],
};

/**
 * The interactive body-target selector, laid over a real athletic photo
 * (not an illustrated silhouette). Unlike the previous photo asset, this
 * one carries no baked-in panel/label graphics, so each zone renders its
 * own outline + label as real DOM at rest, in addition to the bright
 * ring + check badge it already got once selected.
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
      <div className="relative mx-auto w-full max-w-[185px]">
        {/* Soft ambient glow behind the silhouette. */}
        <div
          className="absolute inset-0 -z-10 rounded-full bg-electric/16 blur-3xl"
          aria-hidden
        />

        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{ aspectRatio: "410 / 842" }}
        >
          {/* Real athletic photo, head to shoes — plain, no baked-in
              zone graphics, so `contain` (never `cover`) is what keeps the
              whole figure on screen instead of letting a mismatched
              container aspect ratio crop the head or feet off. The
              container's aspect-ratio above already matches the source
              photo exactly, so this never has to letterbox in practice —
              it's the safety net if that ever drifts. */}
          <Image
            src="/quiz/bodymap-character-v2.png"
            alt="Male body with target zones highlighted"
            fill
            unoptimized
            priority
            className="object-contain object-top"
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
                onClick={(event) => {
                  fireBurst(event.clientX, event.clientY, true);
                  toggle(zone.value);
                }}
                className={clsx(
                  "gf-press gf-glow-hover absolute grid place-items-center overflow-hidden rounded-[14px] border transition-all duration-200",
                  active
                    ? "border-transparent"
                    : "border-electric/45 bg-electric/10",
                )}
                style={{
                  left: `${rect.left}%`,
                  top: `${rect.top}%`,
                  width: `${rect.width}%`,
                  height: `${rect.height}%`,
                }}
              >
                {!active && (
                  <span className="gf-display relative text-[10px] leading-tight font-black tracking-[0.08em] text-white uppercase [text-shadow:0_1px_4px_rgba(0,0,0,0.9)]">
                    {zone.label}
                  </span>
                )}
                {active && (
                  <>
                    {/* Fresh element every false→true transition, so the
                        flash replays on every tap rather than only once. */}
                    <span
                      className="gf-zone-flash absolute inset-0 rounded-[14px]"
                      aria-hidden
                    />
                    <span
                      className="gf-anim-pop absolute inset-0 rounded-[14px] ring-2 ring-electric shadow-[0_0_24px_-2px_rgba(232,179,44,0.9),inset_0_0_20px_-4px_rgba(255,255,255,0.35)]"
                      aria-hidden
                    />
                    <span
                      className="gf-anim-pop absolute top-1.5 right-1.5 grid size-5 place-items-center rounded-full bg-electric text-white shadow-md"
                      aria-hidden
                    >
                      <Check className="size-3" strokeWidth={4} />
                    </span>
                  </>
                )}
              </button>
            ));
          })}
        </div>
      </div>

      <div className="relative mt-4 grid place-items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={selected.length}
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-1 row-start-1 text-center text-xs font-semibold text-mist"
          >
            {selected.length === 0 ? (
              "Tap the areas you want to prioritize"
            ) : (
              <>
                <span className="gf-numeric text-sm font-black text-electric">
                  {selected.length}
                </span>{" "}
                area{selected.length === 1 ? "" : "s"} selected
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      <GlowButton
        variant="cyber"
        size="lg"
        fullWidth
        className="mt-4"
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
