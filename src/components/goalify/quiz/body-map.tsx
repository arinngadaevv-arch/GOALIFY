"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check, Target } from "lucide-react";
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
 * (not an illustrated silhouette). The photo itself only ever carries a
 * bare dot per zone — no text on the skin at all, after two rounds of
 * putting some form of label directly on the photo (a boxed outline, then
 * a pin with its own tag) both read as cluttered. The actual zone names
 * live in the chip row rendered right below the photo instead, wired to
 * the same toggle so a dot and its chip always agree.
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

          {/* A bare dot on the body — no text riding on the skin at all.
              Every earlier version (an outlined box with a label baked
              onto it, then a pin with a label chip underneath) kept
              putting text directly on top of the photo, which is exactly
              what kept reading as cluttered/amateurish no matter how that
              text itself was styled. The names live in the chip row below
              instead — a plain, well-understood list, not an infographic
              overlay — and stay perfectly in sync with these dots since
              both drive the exact same toggle(). */}
          {step.zones.map((zone) =>
            (ZONE_SHAPES[zone.value] ?? []).map((rect, index) => {
              const active = selected.includes(zone.value);
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
                  className="gf-press absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${cx}%`, top: `${cy}%` }}
                >
                  <span
                    className={clsx(
                      "relative grid place-items-center rounded-full transition-all duration-300",
                      active
                        ? "size-8 bg-electric shadow-[0_0_20px_-2px_rgba(232,179,44,0.95)]"
                        : // No fill behind the ring at rest — a filled dark
                          // disc sat on the skin like a smudge rather than a
                          // clean marker. Just the ring itself, with a soft
                          // drop shadow (not a background) so it still
                          // reads clearly against lighter skin tones too.
                          "size-6 border-2 border-electric shadow-[0_1px_5px_rgba(0,0,0,0.65)]",
                    )}
                  >
                    {!active && (
                      <span
                        className="gf-anim-pulse absolute inset-0 rounded-full border-2 border-electric/60"
                        aria-hidden
                      />
                    )}
                    {active && (
                      <span className="gf-anim-pop absolute inset-0 grid place-items-center">
                        <Check
                          className="size-3.5 text-black"
                          strokeWidth={4}
                        />
                      </span>
                    )}
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* The actual, legible zone names — a plain multi-select chip row,
          the same pattern used everywhere else a set of options needs
          real text next to it. Tapping a chip is exactly equivalent to
          tapping its dot on the photo above (same toggle, same state). */}
      <div
        className="relative mt-4 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Focus areas"
      >
        {step.zones.map((zone) => {
          const active = selected.includes(zone.value);
          return (
            <button
              key={zone.value}
              type="button"
              aria-pressed={active}
              disabled={locked}
              onClick={(event) => {
                fireBurst(event.clientX, event.clientY, active);
                toggle(zone.value);
              }}
              className={clsx(
                "gf-press inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-black tracking-[0.02em] uppercase transition-all duration-200",
                active
                  ? "border-electric bg-electric text-black shadow-[0_6px_18px_-6px_rgba(232,179,44,0.85)]"
                  : "border-electric/30 bg-white/[0.04] text-mist",
              )}
            >
              {active && <Check className="size-3.5" strokeWidth={3.5} />}
              {zone.label}
            </button>
          );
        })}
      </div>

      <div className="relative mt-3 grid place-items-center overflow-hidden">
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
