"use client";

import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ArrowRight, Check } from "lucide-react";
import type { QuizStep } from "@/lib/goalify/quiz";
import type { QuizAnswers } from "@/lib/goalify/types";
import { QUIZ_ICONS } from "./quiz-icons";
import { fireBurst } from "./particle-burst";

/**
 * The focus-area picker — a vertical list of rows (icon, label, one-line
 * description, a checkbox on the right), not a tappable photo. Two earlier
 * rounds of an interactive body illustration (a real photo with on-skin
 * outlines, then a plain silhouette) both still needed this same list
 * underneath just to carry the actual zone names — dropping the photo
 * altogether removes the duplication and gives each zone room for real
 * copy about what it actually targets.
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
      <div className="grid gap-3" role="group" aria-label="Focus areas">
        {step.zones.map((zone) => {
          const active = selected.includes(zone.value);
          const Icon = QUIZ_ICONS[zone.icon];
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
                "group flex items-center justify-between rounded-2xl border p-4 text-left transition-all duration-200",
                active
                  ? "border-electric/80 bg-electric/10 shadow-lg shadow-electric/10"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]",
              )}
            >
              <div className="flex items-center gap-4">
                <span
                  className={clsx(
                    "grid size-12 shrink-0 place-items-center rounded-xl transition-colors duration-200",
                    active ? "bg-electric text-black" : "bg-white/5 text-mist",
                  )}
                >
                  <Icon className="size-6" strokeWidth={2.4} />
                </span>
                <div className="min-w-0">
                  <h3
                    className={clsx(
                      "text-base font-bold transition-colors duration-200",
                      active ? "text-electric" : "text-ink",
                    )}
                  >
                    {zone.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-mist">{zone.description}</p>
                </div>
              </div>

              {/* Checkbox indicator */}
              <span
                className={clsx(
                  "grid size-6 shrink-0 place-items-center rounded-full border transition-all duration-200",
                  active
                    ? "scale-110 border-electric bg-electric text-black"
                    : "border-white/15 bg-white/5 group-hover:border-white/25",
                )}
              >
                {active && <Check className="size-3.5" strokeWidth={3} />}
              </span>
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
