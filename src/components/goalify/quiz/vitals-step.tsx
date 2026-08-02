"use client";

import { useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ArrowRight, HelpCircle, Mars, Venus } from "lucide-react";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import type { QuizAnswers, Sex } from "@/lib/goalify/types";
import { fireBurst } from "./particle-burst";

const SEX_OPTIONS: { value: Sex; label: string; icon: typeof Venus }[] = [
  { value: "female", label: "Female", icon: Venus },
  { value: "male", label: "Male", icon: Mars },
  { value: "unspecified", label: "Rather not say", icon: HelpCircle },
];

/**
 * Every field the calorie/macro engine actually needs, on one roomy screen
 * instead of five separate ones. Direct-typing number cards throughout —
 * no sliders — so anyone who already knows their exact weight/age/height
 * can just type it instead of dragging a track to hunt for it.
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
      {/* Ambient backdrop — a full-bleed atmospheric wash behind every
          element on the step instead of competing with them. */}
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

        {/* -------------------------------------------------- Current weight */}
        <NumberField
          hero
          label="Current weight"
          value={weightKg}
          min={40}
          max={180}
          step={1}
          unit="kg"
          onChange={setWeightKg}
          onCommit={onTick}
          disabled={locked}
          className="mt-10"
        />

        {/* --------------------------------------------- Metric input grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <NumberField
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
          <NumberField
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
          <NumberField
            label="Target weight"
            value={targetWeightKg}
            min={40}
            max={180}
            step={1}
            unit="kg"
            onChange={setTargetWeightKg}
            onCommit={onTick}
            disabled={locked}
            className="col-span-2"
          />
        </div>

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

/**
 * A direct-typing metric card — a big gold number, a unit badge, and a
 * label, with no slider anywhere. Typing is completely free-form (the
 * draft is kept as a raw string while focused so clamping never fights
 * the cursor); the value is only stepped, clamped and committed back up
 * on blur/Enter, exactly like a slider's onCommit would fire.
 */
function NumberField({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  onCommit,
  disabled = false,
  hero = false,
  className,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (next: number) => void;
  onCommit: () => void;
  disabled?: boolean;
  hero?: boolean;
  className?: string;
}) {
  const [draft, setDraft] = useState(() => String(value));
  const [focused, setFocused] = useState(false);

  // `value` only ever changes as a direct result of this field's own
  // commit() below (which sets `draft` itself in the same breath), so
  // there's no external source to resync from — no effect needed.

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed === "") {
      setDraft(String(value));
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isNaN(parsed)) {
      setDraft(String(value));
      return;
    }
    const stepped = Math.round(parsed / step) * step;
    const clamped = Math.min(max, Math.max(min, stepped));
    setDraft(String(clamped));
    if (clamped !== value) {
      onChange(clamped);
      onCommit();
    }
  };

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-b from-[#161B26] to-[#0B0E14] transition-all duration-200",
        hero ? "p-7" : "p-5",
        focused
          ? "border-[#FFC700] shadow-[0_0_0_1px_#FFC700,0_0_36px_-10px_rgba(255,199,0,0.85)]"
          : "border-electric/25",
        className,
      )}
    >
      <label className="block text-[11px] font-black tracking-[0.14em] text-mist uppercase">
        {label}
      </label>
      <div className={clsx("flex items-baseline gap-2", hero ? "mt-3" : "mt-2")}>
        <input
          type="number"
          inputMode="numeric"
          value={draft}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(event) => {
            const next = event.target.value;
            // Allow free typing of a plain, unsigned, up-to-3-digit whole
            // number — blocks letters/decimals/negatives at the keystroke
            // level without ever fighting a valid in-progress number.
            if (next === "" || /^\d{0,3}$/.test(next)) setDraft(next);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            commit();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          aria-label={`${label} (${unit})`}
          className={clsx(
            "gf-numeric gf-number-plain min-w-0 flex-1 bg-transparent font-black text-[#FFC700] outline-none",
            hero ? "text-6xl" : "text-4xl",
          )}
        />
        <span
          className={clsx(
            "shrink-0 font-bold text-mist",
            hero ? "text-lg" : "text-sm",
          )}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}
