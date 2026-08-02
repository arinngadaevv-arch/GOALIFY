"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ArrowRight, HelpCircle, Mars, Venus } from "lucide-react";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import type { QuizAnswers, Sex } from "@/lib/goalify/types";
import { CompactSlider } from "./compact-slider";
import { TactileSlider } from "./tactile-slider";
import { fireBurst } from "./particle-burst";

const SEX_OPTIONS: { value: Sex; label: string; icon: typeof Venus }[] = [
  { value: "female", label: "Female", icon: Venus },
  { value: "male", label: "Male", icon: Mars },
  { value: "unspecified", label: "Rather not say", icon: HelpCircle },
];

/**
 * Every field the calorie/macro engine actually needs, on one roomy screen
 * instead of five separate ones. Weight gets the hero horizontal-ruler
 * treatment (it's the number the user cares most about, and the biggest
 * touch target); age, height and target weight are sliders stacked below
 * so the whole "science" chapter of the funnel is a single tap-through
 * instead of a slog.
 */
export function VitalsStep({
  draft,
  locked,
  onSubmit,
  onTick,
}: {
  draft: Partial<QuizAnswers>;
  locked: boolean;
  onSubmit: (patch: Partial<QuizAnswers>, value: unknown) => void;
  onTick: () => void;
}) {
  const [sex, setSex] = useState<Sex>(draft.sex ?? "unspecified");
  const [age, setAge] = useState(draft.age ?? 30);
  const [heightCm, setHeightCm] = useState(draft.heightCm ?? 175);
  const [weightKg, setWeightKg] = useState(draft.weightKg ?? 78);
  const [targetWeightKg, setTargetWeightKg] = useState(
    draft.targetWeightKg ?? 70,
  );

  const submit = (event: React.MouseEvent) => {
    fireBurst(event.clientX, event.clientY, true);
    const patch: Partial<QuizAnswers> = {
      sex,
      age,
      heightCm,
      weightKg,
      targetWeightKg,
    };
    onSubmit(patch, weightKg);
  };

  return (
    <div className="relative -mx-5 overflow-hidden">
      {/* Ambient backdrop — the same athletic photo that used to sit in an
          awkward inline banner, now a full-bleed atmospheric wash behind
          every element on the step instead of competing with them. */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/quiz/goal-burn.png"
          alt=""
          fill
          className="object-cover object-[center_18%] opacity-[0.16]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0e14]/40 via-[#0b0e14]/92 to-[#0b0e14]" />
      </div>

      <div className="relative px-5 pb-1">
        <div
          className="grid grid-cols-3 gap-3"
          role="radiogroup"
          aria-label="Biological sex"
        >
          {SEX_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = sex === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={locked}
                onClick={(event) => {
                  fireBurst(event.clientX, event.clientY);
                  setSex(option.value);
                }}
                className={clsx(
                  "gf-card gf-press flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 text-center transition-all duration-200",
                  active ? "gf-card-active text-electric" : "text-ink-soft",
                )}
              >
                <Icon className="size-6" strokeWidth={2.4} />
                <span className="text-xs leading-tight font-bold">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <GlassCard
          deep
          className="relative mt-10 rounded-3xl border border-electric/35 p-7 shadow-[0_0_0_1px_rgba(255,199,0,0.08),0_0_40px_-16px_rgba(255,199,0,0.55)]"
        >
          <TactileSlider
            value={weightKg}
            min={40}
            max={180}
            step={1}
            unit="kg"
            onChange={setWeightKg}
            onTick={onTick}
            disabled={locked}
          />
        </GlassCard>

        <GlassCard deep className="mt-10 space-y-8 rounded-3xl p-6">
          <CompactSlider
            label="Age"
            value={age}
            min={16}
            max={80}
            step={1}
            unit="yrs"
            onChange={setAge}
            onCommit={onTick}
            disabled={locked}
          />
          <CompactSlider
            label="Height"
            value={heightCm}
            min={140}
            max={215}
            step={1}
            unit="cm"
            onChange={setHeightCm}
            onCommit={onTick}
            disabled={locked}
          />
          <CompactSlider
            label="Target weight"
            value={targetWeightKg}
            min={40}
            max={180}
            step={1}
            unit="kg"
            onChange={setTargetWeightKg}
            onCommit={onTick}
            disabled={locked}
          />
        </GlassCard>

        <GlowButton
          variant="cyber"
          size="lg"
          fullWidth
          className="mt-10"
          disabled={locked}
          onClick={submit}
        >
          Continue
          <ArrowRight className="size-5" />
        </GlowButton>
      </div>
    </div>
  );
}
