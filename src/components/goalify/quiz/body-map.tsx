"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst } from "./particle-burst";

/**
 * Percentage-based hit-targets over the real photo background
 * (bodymap-full-body.png). The photo already renders the glowing gold
 * zone panels and labels baked into the image itself, so these rects are
 * invisible click targets, not drawn UI — see the comment on the button
 * below for why nothing is painted here until a zone is selected.
 */
// Measured directly against bodymap-full-body.png's own baked-in panel
// outlines using a 1%-resolution pixel grid overlaid on the source PNG,
// read edge-by-edge per zone (not eyeballed) — re-measured again after the
// glutes rect was found running ~6pt past the panel's actual right edge
// (68% vs. the panel's real ~62%), with chest/arms tightened similarly.
// Every rect below is that direct-measurement pass; a hairline 1–2pt
// overlap at a couple of seams (e.g. chest/arms, arms/legs) is intentional
// and harmless — later-in-DOM zones win those pixels, and the seam itself
// falls on a curved, un-rectangular body contour anyway.
const ZONE_SHAPES: Record<string, { left: number; top: number; width: number; height: number }[]> = {
  chest: [{ left: 19, top: 19, width: 46, height: 11 }],
  arms: [
    { left: 2, top: 18, width: 20, height: 34 },
    { left: 63, top: 18, width: 17, height: 34 },
  ],
  abs: [{ left: 20, top: 30, width: 45, height: 14 }],
  glutes: [{ left: 22, top: 45, width: 40, height: 5 }],
  legs: [
    { left: 17, top: 50, width: 28, height: 44 },
    { left: 55, top: 50, width: 27, height: 44 },
  ],
};

/**
 * The interactive body-target selector, laid over a real athletic photo
 * (not an illustrated silhouette) — the photo itself already carries the
 * glowing gold zone panels and labels, so each button here is an
 * invisible hit-target that only paints something once its zone is
 * selected (a bright ring + check badge), rather than redrawing a second
 * copy of the panel/label the photo already shows.
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

        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{ aspectRatio: "540 / 814" }}
        >
          {/* Real athletic photo, neck to feet — the glowing gold zone
              panels and labels are already part of the image itself, so
              the buttons below are click targets only, not a second layer
              of UI drawn on top. */}
          <Image
            src="/quiz/bodymap-full-body.png"
            alt="Male athletic body with target zones highlighted"
            fill
            unoptimized
            priority
            className="object-cover object-top"
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
                className="gf-press absolute grid place-items-center rounded-[18px] transition-all duration-200"
                style={{
                  left: `${rect.left}%`,
                  top: `${rect.top}%`,
                  width: `${rect.width}%`,
                  height: `${rect.height}%`,
                }}
              >
                {active && (
                  <>
                    {/* Fresh element every false→true transition, so the
                        flash replays on every tap rather than only once. */}
                    <span
                      className="gf-zone-flash absolute inset-0 rounded-[18px]"
                      aria-hidden
                    />
                    <span
                      className="gf-anim-pop absolute inset-0 rounded-[18px] ring-2 ring-electric shadow-[0_0_24px_-2px_rgba(232,179,44,0.9),inset_0_0_20px_-4px_rgba(255,255,255,0.35)]"
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

      <div className="relative mt-6 grid place-items-center overflow-hidden">
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
