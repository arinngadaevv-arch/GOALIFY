"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import {
  ArrowRight,
  Calendar,
  HelpCircle,
  Mars,
  Minus,
  Plus,
  Ruler,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
  Venus,
} from "lucide-react";
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
 * instead of five separate ones. Weight fields are still direct-typing
 * number cards (a slider alone is too coarse for someone who already
 * knows their exact weight down to the kilo) but now also carry a range
 * track underneath for anyone who'd rather drag than type; age/height use
 * a wheel-picker instead, since scrolling to a rough age or height reads
 * as faster and more natural than typing two digits.
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
              // The glow lives on a wrapper, not the button itself — a
              // blurred sibling can bleed past the button's own edge for a
              // real ambient backlight instead of a shadow squeezed tight
              // against the border.
              <div key={option.value} className="relative">
                <div
                  aria-hidden
                  className={clsx(
                    "pointer-events-none absolute -inset-2 -z-10 rounded-[28px] bg-electric/45 blur-lg transition-opacity duration-300 ease-out",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  disabled={locked}
                  onClick={(event) => {
                    fireBurst(event.clientX, event.clientY);
                    setSex(option.value);
                  }}
                  className={clsx(
                    "gf-card gf-press flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-2xl px-2 py-4 text-center transition-all duration-200",
                    active ? "gf-card-active text-electric" : "text-ink-soft",
                  )}
                >
                  <Icon className="size-6" strokeWidth={2.4} />
                  <span className="text-xs leading-tight font-bold">
                    {option.label}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* -------------------------------------------------- Current weight */}
        <NumberField
          hero
          icon={Scale}
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
          slider
          compareChart={
            <WeightCompareChart
              currentKg={weightKg}
              targetKg={targetWeightKg}
              min={40}
              max={180}
            />
          }
        />

        {/* --------------------------------------------- Metric input grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <WheelField
            icon={Calendar}
            label="Age"
            value={age}
            min={16}
            max={80}
            unit="yrs"
            onChange={setAge}
            onCommit={onTick}
            disabled={locked}
          />
          <WheelField
            icon={Ruler}
            label="Height"
            value={heightCm}
            min={140}
            max={215}
            unit="cm"
            onChange={setHeightCm}
            onCommit={onTick}
            disabled={locked}
          />
          <NumberField
            icon={Target}
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
            slider
            badge={
              <WeightGoalBadge currentKg={weightKg} targetKg={targetWeightKg} />
            }
          />
        </div>

        <GlowButton
          variant="cyber"
          size="lg"
          fullWidth
          className="mt-10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-10px_rgba(232,179,44,0.9)]"
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
 * label. Typing is completely free-form (the draft is kept as a raw
 * string while focused so clamping never fights the cursor); the value is
 * only stepped, clamped and committed back up on blur/Enter, exactly like
 * a slider's onCommit would fire. The +/- steppers and the optional range
 * track (`slider`) are the other two ways to change it — a quick tap or a
 * drag for anyone who'd rather not bring up a keyboard for a one-off
 * adjustment — and all three go through the exact same clamp-and-commit
 * path as typing does.
 */
function NumberField({
  icon: Icon,
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
  badge,
  compareChart,
  slider = false,
  // Off by default in the half-width grid cells: a card that narrow can't
  // fit icon + label + both steppers + a 3-digit number without the
  // second button getting clipped by the card's own overflow-hidden edge —
  // confirmed by actually rendering it, not assumed. The hero and
  // full-width cards have the room; those don't.
  steppers = true,
}: {
  icon?: typeof Scale;
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
  badge?: React.ReactNode;
  /** Rendered to the right of the number row, not the label row — only
   * the current-weight hero card uses this. */
  compareChart?: React.ReactNode;
  /** A range track underneath the number row — kept in sync with the same
   * value/onChange/onCommit contract as typing and the steppers. */
  slider?: boolean;
  steppers?: boolean;
}) {
  const [draft, setDraft] = useState(() => String(value));
  const [focused, setFocused] = useState(false);

  // `value` only ever changes as a direct result of this field's own
  // commit()/step() below (which set `draft` itself in the same breath),
  // so there's no external source to resync from — no effect needed.

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

  const stepBy = (delta: number) => {
    const clamped = Math.min(max, Math.max(min, value + delta));
    setDraft(String(clamped));
    if (clamped !== value) {
      onChange(clamped);
      onCommit();
    }
  };

  const percent = ((value - min) / (max - min)) * 100;

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
      <div className="flex items-center justify-between gap-2">
        <label className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.14em] text-mist uppercase">
          {Icon && (
            <Icon className="size-3.5 text-electric/70" strokeWidth={2.4} />
          )}
          {label}
        </label>
        {badge}
      </div>
      <div
        className={clsx(
          "flex items-center",
          hero ? "mt-3" : "mt-2",
          compareChart ? "justify-between gap-4" : "gap-2",
        )}
      >
        <div className={clsx("flex items-center gap-2", !steppers && "flex-1")}>
          {steppers && (
            <button
              type="button"
              disabled={disabled || value <= min}
              onClick={(event) => {
                fireBurst(event.clientX, event.clientY);
                stepBy(-step);
              }}
              aria-label={`Decrease ${label}`}
              className={clsx(
                "gf-press grid shrink-0 place-items-center rounded-full border border-electric/25 text-mist transition-colors hover:border-electric/60 hover:text-electric disabled:pointer-events-none disabled:opacity-30",
                hero ? "size-9" : "size-7",
              )}
            >
              <Minus
                className={hero ? "size-4" : "size-3.5"}
                strokeWidth={2.6}
              />
            </button>
          )}
          <div
            className={clsx(
              "flex flex-1 items-baseline gap-2",
              steppers ? "justify-center" : "justify-start",
            )}
          >
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
                // Allow free typing of a plain, unsigned, up-to-3-digit
                // whole number — blocks letters/decimals/negatives at the
                // keystroke level without ever fighting a valid
                // in-progress number.
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
                "gf-numeric gf-number-plain shrink-0 bg-transparent text-center font-black text-[#FFC700] outline-none",
                hero ? "w-32 text-6xl" : "w-16 text-4xl",
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
          {steppers && (
            <button
              type="button"
              disabled={disabled || value >= max}
              onClick={(event) => {
                fireBurst(event.clientX, event.clientY);
                stepBy(step);
              }}
              aria-label={`Increase ${label}`}
              className={clsx(
                "gf-press grid shrink-0 place-items-center rounded-full border border-electric/25 text-mist transition-colors hover:border-electric/60 hover:text-electric disabled:pointer-events-none disabled:opacity-30",
                hero ? "size-9" : "size-7",
              )}
            >
              <Plus
                className={hero ? "size-4" : "size-3.5"}
                strokeWidth={2.6}
              />
            </button>
          )}
        </div>
        {compareChart}
      </div>
      {slider && (
        <input
          type="range"
          className="gf-range mt-4"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          style={{
            background: `linear-gradient(to right, var(--color-electric) 0%, var(--color-electric) ${percent}%, rgba(255,255,255,0.1) ${percent}%, rgba(255,255,255,0.1) 100%)`,
          }}
          onChange={(event) => {
            const next = Number(event.target.value);
            setDraft(String(next));
            onChange(next);
          }}
          onPointerUp={onCommit}
          onKeyUp={onCommit}
          aria-label={`${label} (${unit})`}
        />
      )}
    </div>
  );
}

/**
 * A tiny two-bar comparison — current weight vs. target weight, scaled
 * proportionally within the field's own min/max range — sitting next to
 * the current-weight number rather than just stating the gap as text
 * (see WeightGoalBadge, which does that for the target-weight card).
 * Genuine data, not decoration: both bars move live as either number
 * changes.
 */
function WeightCompareChart({
  currentKg,
  targetKg,
  min,
  max,
}: {
  currentKg: number;
  targetKg: number;
  min: number;
  max: number;
}) {
  const barHeight = (v: number) => {
    const pct = (v - min) / (max - min);
    return 10 + pct * 30;
  };
  const deltaKg = currentKg - targetKg;

  return (
    <div className="flex shrink-0 flex-col items-center gap-1.5">
      <div className="flex h-10 items-end gap-1.5" aria-hidden>
        <div
          className="w-2.5 rounded-full bg-mist/30 transition-[height] duration-300 ease-out"
          style={{ height: barHeight(currentKg) }}
        />
        <div
          className="w-2.5 rounded-full bg-electric shadow-[0_0_10px_-2px_rgba(232,179,44,0.9)] transition-[height] duration-300 ease-out"
          style={{ height: barHeight(targetKg) }}
        />
      </div>
      <span className="text-[9px] font-bold whitespace-nowrap text-mist">
        {deltaKg === 0 ? "At goal" : `${Math.abs(deltaKg)}kg to go`}
      </span>
    </div>
  );
}

/**
 * The age/height picker — a big value in the center with its two
 * neighbors shown faded directly above and below, like a stopped scroll
 * wheel. Three ways to move it: scroll/trackpad over the widget, tap
 * either faded neighbor to jump straight to it, or arrow keys once
 * focused — no free-typing here, unlike the weight cards, since a rough
 * age or height is exactly what someone would rather scroll to than type.
 */
function WheelField({
  icon: Icon,
  label,
  value,
  min,
  max,
  unit,
  onChange,
  onCommit,
  disabled = false,
}: {
  icon?: typeof Scale;
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (next: number) => void;
  onCommit: () => void;
  disabled?: boolean;
}) {
  const stepTo = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next));
    if (clamped !== value) {
      onChange(clamped);
      onCommit();
    }
  };

  const prevValue = value - 1;
  const nextValue = value + 1;

  // React attaches its synthetic wheel listener as `passive: true` (for
  // scroll-perf reasons, same as the DOM default) — `preventDefault()`
  // inside a plain `onWheel` prop is a silent no-op there, so scrolling
  // over the wheel would scroll the whole page instead of stepping the
  // value. A real, manually-attached `{ passive: false }` listener is the
  // only way to actually stop that.
  const wheelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wheelRef.current;
    if (!el || disabled) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      stepTo(value + (event.deltaY > 0 ? -1 : 1));
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-binds whenever `value` moves so the closure's step always starts from the latest value.
  }, [value, disabled, min, max]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-electric/25 bg-gradient-to-b from-[#161B26] to-[#0B0E14] p-5">
      <label className="flex items-center gap-1.5 text-[11px] font-black tracking-[0.14em] text-mist uppercase">
        {Icon && (
          <Icon className="size-3.5 text-electric/70" strokeWidth={2.4} />
        )}
        {label}
      </label>

      <div
        ref={wheelRef}
        role="spinbutton"
        aria-label={`${label} (${unit})`}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "ArrowUp") {
            event.preventDefault();
            stepTo(value + 1);
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            stepTo(value - 1);
          }
        }}
        className="mt-2 flex cursor-ns-resize flex-col items-center gap-0.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
      >
        <button
          type="button"
          disabled={disabled || prevValue < min}
          onClick={() => stepTo(prevValue)}
          aria-label={
            prevValue >= min ? `Set ${label} to ${prevValue}` : undefined
          }
          aria-hidden={prevValue < min}
          className="gf-numeric h-6 text-lg font-bold text-mist/35 transition-colors hover:text-electric disabled:pointer-events-none disabled:opacity-30"
        >
          {prevValue >= min ? prevValue : ""}
        </button>
        <span className="gf-numeric flex items-baseline gap-1 text-4xl font-black text-[#FFC700]">
          {value}
          <span className="text-sm font-bold text-mist">{unit}</span>
        </span>
        <button
          type="button"
          disabled={disabled || nextValue > max}
          onClick={() => stepTo(nextValue)}
          aria-label={
            nextValue <= max ? `Set ${label} to ${nextValue}` : undefined
          }
          aria-hidden={nextValue > max}
          className="gf-numeric h-6 text-lg font-bold text-mist/35 transition-colors hover:text-electric disabled:pointer-events-none disabled:opacity-30"
        >
          {nextValue <= max ? nextValue : ""}
        </button>
      </div>
    </div>
  );
}

/**
 * The one piece of real insight this screen can offer beyond raw inputs —
 * how far current weight actually is from the stated goal, updating live
 * as either number changes. Genuine data, not decoration: it goes quiet
 * (no badge at all) right when current equals target, since "0 kg to go"
 * reads as a glitch rather than a milestone this early in the funnel.
 */
function WeightGoalBadge({
  currentKg,
  targetKg,
}: {
  currentKg: number;
  targetKg: number;
}) {
  const deltaKg = currentKg - targetKg;
  if (deltaKg === 0) return null;

  const losing = deltaKg > 0;
  const Icon = losing ? TrendingDown : TrendingUp;

  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-electric/12 px-2.5 py-1 text-[11px] font-black whitespace-nowrap text-electric">
      <Icon className="size-3" strokeWidth={3} />
      {Math.abs(deltaKg)} kg to {losing ? "go" : "gain"}
    </span>
  );
}
