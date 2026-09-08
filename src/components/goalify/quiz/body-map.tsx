"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, Plus, Target } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { fireBurst } from "./particle-burst";

/**
 * Percentage-based hit-targets over the real photo background
 * (bodymap-character-v2.png) — a plain, unmarked photo (no baked-in panel
 * graphics or labels, unlike the previous asset), so every zone's marker
 * and label is real DOM here, not something the image already draws.
 */
// Measured directly against bodymap-character-v2.png at 1%-resolution:
// scanned every row of the image for background-vs-body pixels, took the
// min/max x per body part across its full y-range (not eyeballed), so
// these track the new photo's actual proportions rather than reused
// coordinates from the old asset. Only each rect's own center is used now
// (a small pin marker there, not a box drawn at its edges — see the
// render below), so the old overlap concerns between neighboring
// rects (e.g. abs/glutes) no longer matter: nothing is drawn at the
// rect's actual bounds any more, just its midpoint.
const ZONE_SHAPES: Record<
  string,
  { left: number; top: number; width: number; height: number }[]
> = {
  chest: [{ left: 23, top: 21, width: 54, height: 13 }],
  arms: [
    { left: 2, top: 17, width: 22, height: 42 },
    { left: 76, top: 17, width: 22, height: 42 },
  ],
  abs: [{ left: 18, top: 34, width: 55, height: 15 }],
  glutes: [{ left: 22, top: 48, width: 53, height: 6 }],
  legs: [
    { left: 21, top: 70, width: 22, height: 20 },
    { left: 57, top: 70, width: 23, height: 20 },
  ],
};

/**
 * The interactive body-target selector, laid over a real athletic photo
 * (not an illustrated silhouette). Each zone is a small map-pin-style
 * marker with its own label chip, not a big outlined box drawn on top of
 * the skin — that read as a cluttered infographic, especially where
 * neighboring zones (abs/glutes) sat close together. Tapping fills the
 * pin gold with a check mark; the label chip follows the same fill.
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
      <div className="relative isolate mx-auto w-full max-w-[240px] lg:max-w-[300px] 2xl:max-w-[360px]">
        {/* A soft bloom sitting entirely outside the card's own rounded
            edges — not blended into the photo the way the old ambient glow
            was (see the comment below on the card's flat background),
            which is exactly what caused the visible color-mismatch halo
            that got stripped out before. This one never touches a single
            photo pixel: the card in front of it is fully opaque, so the
            glow only ever shows as depth in the empty space around the
            card, not on it. */}
        <div
          className="absolute -inset-3 -z-10 rounded-[40px] bg-electric/14 blur-2xl"
          aria-hidden
        />
        <div
          className="relative overflow-hidden rounded-[28px]"
          style={{ aspectRatio: "410 / 842", backgroundColor: "#0f131c" }}
        >
          {/* Real athletic photo, head to shoes — plain, no baked-in
              zone graphics, so `contain` (never `cover`) is what keeps the
              whole figure on screen instead of letting a mismatched
              container aspect ratio crop the head or feet off. The
              container's aspect-ratio above already matches the source
              photo exactly, so this never has to letterbox in practice —
              it's the safety net if that ever drifts, and the container's
              own background-color above is set to the photo's own sampled
              backdrop tone (not the page's canvas color) so a stray sliver
              never reads as a second, different-colored background.
              No vignette, glow, or shadow sits on top of this any more —
              those all faded toward a color the photo's own flat backdrop
              wasn't actually at, which is exactly what read as a halo
              around the figure. A flat background this close to the
              photo's real tone needs no fade to disappear into it. */}
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
            return rects.map((rect, index) => {
              // A small pin marker at the zone's center, not a big outlined
              // box with a label baked onto the skin — the boxes read as a
              // cluttered infographic (abs/glutes visibly touching) and
              // never looked premium no matter how the frame itself was
              // styled. This is the same tap area (still generously sized,
              // see the comment on ZONE_SHAPES below), just a lighter-touch
              // visual on top of it: a map-pin-style marker plus a small
              // floating label, both centered in that area.
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              return (
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
                  className="gf-press absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5"
                  style={{ left: `${cx}%`, top: `${cy}%` }}
                >
                  <span
                    className={clsx(
                      "relative grid place-items-center rounded-full transition-all duration-300",
                      active
                        ? "size-10 bg-electric shadow-[0_0_22px_-2px_rgba(232,179,44,0.95)]"
                        : "size-8 border-2 border-electric bg-black/45 backdrop-blur-sm",
                    )}
                  >
                    {!active && (
                      <span
                        className="gf-anim-pulse absolute inset-0 rounded-full border-2 border-electric/70"
                        aria-hidden
                      />
                    )}
                    {active ? (
                      <span className="gf-anim-pop absolute inset-0 grid place-items-center">
                        <Check
                          className="size-4.5 text-black"
                          strokeWidth={3.5}
                        />
                      </span>
                    ) : (
                      <Plus
                        className="relative size-3.5 text-electric"
                        strokeWidth={3}
                      />
                    )}
                  </span>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-[9.5px] leading-tight font-black tracking-[0.06em] uppercase backdrop-blur-sm transition-colors duration-200",
                      active
                        ? "bg-electric text-black"
                        : "bg-black/55 text-white",
                    )}
                  >
                    {zone.label}
                  </span>
                </button>
              );
            });
          })}
        </div>
      </div>

      {/* A self-contained chip instead of bare text floating in empty
          space — gives the caption the same quiet-but-designed weight as
          the corner tags on the goal-picker tiles, rather than reading as
          an afterthought under a mostly-empty card. */}
      <div className="relative mt-4 grid place-items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={selected.length}
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.92 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-1 row-start-1 inline-flex items-center gap-1.5 rounded-full border border-electric/30 bg-electric/10 px-3.5 py-1.5 text-xs font-bold text-mist"
          >
            {selected.length === 0 ? (
              <>
                <Target
                  className="size-3.5 text-electric/70"
                  strokeWidth={2.4}
                />
                Tap the areas you want to prioritize
              </>
            ) : (
              <>
                <span className="gf-numeric text-sm font-black text-electric">
                  {selected.length}
                </span>
                area{selected.length === 1 ? "" : "s"} selected
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <GlowButton
        variant="cyber"
        size="lg"
        fullWidth
        className="group mt-2"
        disabled={selected.length === 0 || locked}
        onClick={(event) => {
          fireBurst(event.clientX, event.clientY, true);
          onPick({ [step.id]: selected } as Partial<QuizAnswers>, selected);
        }}
      >
        Continue
        <ArrowRight className="size-5 transition-transform duration-150 group-active:translate-x-1" />
      </GlowButton>
    </div>
  );
}
