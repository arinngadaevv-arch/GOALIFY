"use client";

import { useMemo } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { fireBurst } from "./particle-burst";

/**
 * Percentage-based hit-targets over the real photo background
 * (bodymap-character-v2.png) — a plain, unmarked photo (no baked-in panel
 * graphics or labels, unlike the previous asset), so every zone's outline
 * is real DOM here, not something the image already draws.
 */
// Measured directly against bodymap-character-v2.png at 1%-resolution:
// scanned every row of the image for background-vs-body pixels, took the
// min/max x per body part across its full y-range (not eyeballed), so
// these track that body's actual proportions — the outline drawn from
// each rect below is sized to the real part, not a generic marker.
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
 * (not an illustrated silhouette). Each zone draws an outline sized and
 * positioned to that actual body part (see ZONE_SHAPES) — not a generic
 * dot, and not text baked onto the skin either: two earlier rounds of
 * putting some form of label directly on the photo (a boxed outline with
 * text inside, then a pin with its own tag) both read as cluttered. The
 * real zone names live in the chip row rendered right below the photo,
 * wired to the same toggle so an outline and its chip always agree.
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
      {/* Plain, quiet card chrome — a bordered/blurred dark panel around
          the real interactive body, not a photo-driven glow. The card's
          own border/background/blur/shadow live here; the inner box right
          below still locks to the source photo's exact aspect ratio
          (410:842) so `object-contain` never has to letterbox it — the
          percentage-based zone hit-targets in ZONE_SHAPES are calibrated
          against that box's own bounds, not the outer card's. */}
      <div className="relative mx-auto w-full max-w-sm rounded-3xl border border-white/10 bg-neutral-950/60 p-3 shadow-2xl backdrop-blur-md">
        <div
          className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-2xl lg:max-w-[300px] 2xl:max-w-[360px]"
          style={{ aspectRatio: "410 / 842", backgroundColor: "#121316" }}
        >
          {/* Real athletic photo, head to shoes — plain, no baked-in
              zone graphics, so `contain` (never `cover`) is what keeps the
              whole figure on screen instead of letting a mismatched
              container aspect ratio crop the head or feet off. The
              container's aspect-ratio above already matches the source
              photo exactly, so this never has to letterbox in practice.
              The photo's own studio backdrop reads distinctly blue next to
              the rest of this app's warm gold/black palette (measured —
              its blacks run noticeably bluer than neutral), which is
              exactly what read as an off-brand, cheap-looking mismatch:
              a cool photo pasted into a warm app. The saturate+sepia
              filter neutralizes that cast (confirmed by resampling the
              same corner pixels post-filter) without meaningfully
              touching the already-warm skin tones. The container's own
              background-color above is resampled from those same
              corners post-filter, so it still matches exactly and no
              stray sliver reads as a second, different-colored
              background. No vignette/glow/shadow on top of this either —
              those faded toward a color the backdrop wasn't actually at,
              which is what read as a halo around the figure before. */}
          <Image
            src="/quiz/bodymap-character-v2.png"
            alt="Male body with target zones highlighted"
            fill
            unoptimized
            priority
            className="object-contain object-top [filter:saturate(0.7)_sepia(0.16)]"
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
                  className="absolute"
                  style={{
                    left: `${rect.left}%`,
                    top: `${rect.top}%`,
                    width: `${rect.width}%`,
                    height: `${rect.height}%`,
                  }}
                >
                  {/* Thin and nearly invisible at rest — a thick colored
                      ring read as a game HUD, not a premium product.
                      Inset from the tap area's own edges so the outline
                      hugs the limb/torso itself instead of the rect's raw
                      bounds. */}
                  <span
                    className={clsx(
                      "absolute inset-[8%] rounded-full border transition-all duration-200 ease-out",
                      active
                        ? "border-electric/70 bg-electric/12 shadow-[0_0_22px_-8px_rgba(232,179,44,0.65)]"
                        : "border-white/[0.09] hover:border-white/20",
                    )}
                  />
                  {active && (
                    <span className="absolute top-0.5 right-0.5 grid size-5 -translate-y-1/3 translate-x-1/3 place-items-center rounded-full bg-electric text-black shadow-sm transition-transform duration-200">
                      <Check className="size-3" strokeWidth={3.5} />
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>

      {/* The actual, legible zone names — a plain multi-select chip row,
          the same pattern used everywhere else a set of options needs
          real text next to it. Tapping a chip is exactly equivalent to
          tapping its outline on the photo above (same toggle, same state).
          A simple solid pill for the selected state — filled gold, dark
          text — rather than a translucent-tint outline. */}
      <div
        className="relative mt-8 flex flex-wrap justify-center gap-2.5"
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
                "rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "border-transparent bg-electric text-black shadow-lg shadow-electric/20"
                  : "border-white/10 bg-white/5 text-ink-soft hover:border-white/20",
              )}
            >
              {zone.label}
            </button>
          );
        })}
      </div>

      {/* Quiet helper text, not another pill competing with the CTA. */}
      <div className="relative mt-5 grid place-items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={selected.length}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-1 row-start-1 text-center text-xs text-ink-soft"
          >
            {selected.length === 0 ? (
              "Choose the areas that matter most to you"
            ) : (
              <>
                <span className="font-semibold text-electric">
                  {selected.length}
                </span>{" "}
                area{selected.length === 1 ? "" : "s"} selected
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </div>

      <button
        type="button"
        disabled={selected.length === 0 || locked}
        onClick={(event) => {
          fireBurst(event.clientX, event.clientY, true);
          onPick({ [step.id]: selected } as Partial<QuizAnswers>, selected);
        }}
        className="group mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-b from-[#f3ca5a] to-[#d9a52e] text-[15px] font-semibold text-[#1a1100] shadow-[0_12px_28px_-10px_rgba(232,179,44,0.55)] transition-all duration-200 hover:shadow-[0_16px_34px_-8px_rgba(232,179,44,0.65)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
      >
        Continue
        <ArrowRight className="size-4.5 transition-transform duration-150 group-active:translate-x-0.5" />
      </button>
    </div>
  );
}
