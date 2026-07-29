"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, Minus, Plus } from "lucide-react";
import { QUIZ_STEPS, type QuizStep } from "@/lib/goalify/quiz";
import { DEFAULT_ANSWERS } from "@/lib/goalify/plan";
import type { JointStatus, QuizAnswers } from "@/lib/goalify/types";
import { useGoalify } from "@/lib/goalify/store";
import { Brand } from "@/components/goalify/brand";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { AnalyzingScreen } from "./analyzing-screen";

/** Steps whose stored value is a number even though it's picked as a choice. */
const NUMERIC_CHOICE_IDS = new Set<keyof QuizAnswers>(["daysPerWeek"]);

export function QuizFlow() {
  const router = useRouter();
  const { state, setDraft, completeQuiz } = useGoalify();
  const [index, setIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);

  const step = QUIZ_STEPS[index];
  const isLast = index === QUIZ_STEPS.length - 1;
  const progress = ((index + (analyzing ? 1 : 0)) / QUIZ_STEPS.length) * 100;

  const draft = state.draft;
  const currentValue = draft[step.id];

  const finish = useCallback(
    (patch: Partial<QuizAnswers>) => {
      const answers = { ...DEFAULT_ANSWERS, ...draft, ...patch } as QuizAnswers;
      completeQuiz(answers);
      setAnalyzing(true);
    },
    [draft, completeQuiz],
  );

  const advance = useCallback(
    (patch: Partial<QuizAnswers>) => {
      setDraft(patch);
      if (isLast) {
        finish(patch);
        return;
      }
      setIndex((i) => i + 1);
    },
    [setDraft, isLast, finish],
  );

  if (analyzing) {
    return <AnalyzingScreen onDone={() => router.push("/plan")} />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-16">
      <header className="flex items-center justify-between py-6">
        <Brand />
        <span className="gf-numeric text-sm font-bold text-mist">
          {index + 1}
          <span className="text-haze"> / {QUIZ_STEPS.length}</span>
        </span>
      </header>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-ink/6"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quiz progress"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-electric to-lime-neon transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(6, progress)}%` }}
        />
      </div>

      <div key={step.id} className="gf-anim-rise flex-1 pt-10">
        <h1 className="gf-display text-3xl font-black text-ink sm:text-4xl">
          {step.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-mist">
          {step.subtitle}
        </p>

        <div className="mt-8">
          {step.kind === "choice" ? (
            <ChoiceStep
              step={step}
              value={currentValue}
              onPick={advance}
              onSetDraft={setDraft}
            />
          ) : (
            <NumberStep
              step={step}
              value={typeof currentValue === "number" ? currentValue : undefined}
              onSubmit={advance}
            />
          )}
        </div>
      </div>

      <footer className="flex items-center justify-between pt-8">
        <GlowButton
          variant="ghost"
          size="sm"
          onClick={() => (index === 0 ? router.push("/") : setIndex((i) => i - 1))}
        >
          <ArrowLeft className="size-4" />
          Back
        </GlowButton>
        <p className="text-xs text-haze">Your answers stay on this device</p>
      </footer>
    </main>
  );
}

/* ------------------------------------------------------------------ choice */

function ChoiceStep({
  step,
  value,
  onPick,
  onSetDraft,
}: {
  step: Extract<QuizStep, { kind: "choice" }>;
  value: unknown;
  onPick: (patch: Partial<QuizAnswers>) => void;
  onSetDraft: (patch: Partial<QuizAnswers>) => void;
}) {
  const selected = useMemo(
    () => (Array.isArray(value) ? (value as string[]) : []),
    [value],
  );

  if (step.multi) {
    const toggle = (option: string) => {
      // "Nothing hurts" is exclusive — it can't coexist with a joint flag.
      let next: string[];
      if (option === "none") {
        next = selected.includes("none") ? [] : ["none"];
      } else {
        const withoutNone = selected.filter((v) => v !== "none");
        next = withoutNone.includes(option)
          ? withoutNone.filter((v) => v !== option)
          : [...withoutNone, option];
      }
      onSetDraft({ [step.id]: next } as Partial<QuizAnswers>);
    };

    return (
      <>
        <div className="grid gap-3">
          {step.options.map((option) => (
            <OptionCard
              key={option.value}
              emoji={option.emoji}
              label={option.label}
              description={option.description}
              selected={selected.includes(option.value)}
              multi
              onClick={() => toggle(option.value)}
            />
          ))}
        </div>
        <GlowButton
          size="lg"
          fullWidth
          className="mt-6"
          disabled={selected.length === 0}
          onClick={() =>
            onPick({ [step.id]: selected as JointStatus[] } as Partial<QuizAnswers>)
          }
        >
          Continue
          <ArrowRight className="size-5" />
        </GlowButton>
      </>
    );
  }

  return (
    <div className="grid gap-3">
      {step.options.map((option) => (
        <OptionCard
          key={option.value}
          emoji={option.emoji}
          label={option.label}
          description={option.description}
          selected={String(value) === option.value}
          onClick={() =>
            onPick({
              [step.id]: NUMERIC_CHOICE_IDS.has(step.id)
                ? Number(option.value)
                : option.value,
            } as Partial<QuizAnswers>)
          }
        />
      ))}
    </div>
  );
}

function OptionCard({
  emoji,
  label,
  description,
  selected,
  multi = false,
  onClick,
}: {
  emoji: string;
  label: string;
  description?: string;
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={clsx(
        "gf-glass gf-press rounded-3xl p-4 text-left transition-all duration-300",
        "flex items-center gap-4 hover:-translate-y-0.5",
        selected
          ? "border-electric/50 gf-glow-electric"
          : "hover:border-electric/25",
      )}
    >
      <span
        className={clsx(
          "grid size-12 shrink-0 place-items-center rounded-2xl text-2xl transition-colors",
          selected ? "bg-electric/12" : "bg-ink/4",
        )}
        aria-hidden
      >
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-extrabold tracking-tight text-ink">
          {label}
        </span>
        {description && (
          <span className="mt-0.5 block text-sm leading-snug text-mist">
            {description}
          </span>
        )}
      </span>
      <span
        className={clsx(
          "grid size-6 shrink-0 place-items-center transition-all duration-300",
          multi ? "rounded-lg" : "rounded-full",
          selected
            ? "bg-lime-neon text-ink scale-100"
            : "scale-90 border-2 border-ink/12",
        )}
        aria-hidden
      >
        {selected && <Check className="size-4" strokeWidth={3.5} />}
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------ number */

function NumberStep({
  step,
  value,
  onSubmit,
}: {
  step: Extract<QuizStep, { kind: "number" }>;
  value?: number;
  onSubmit: (patch: Partial<QuizAnswers>) => void;
}) {
  const [local, setLocal] = useState(value ?? step.defaultValue);
  const clamp = (next: number) =>
    Math.min(step.max, Math.max(step.min, Math.round(next)));

  return (
    <>
      <GlassCard deep className="p-8 text-center">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            aria-label={`Decrease ${step.title}`}
            onClick={() => setLocal((v) => clamp(v - step.step))}
            className="gf-glass gf-press grid size-12 place-items-center rounded-full text-ink-soft hover:text-electric"
          >
            <Minus className="size-5" strokeWidth={3} />
          </button>

          <p className="gf-numeric min-w-36 text-6xl font-black text-ink">
            {local}
            <span className="ml-1 text-xl font-bold text-mist">{step.unit}</span>
          </p>

          <button
            type="button"
            aria-label={`Increase ${step.title}`}
            onClick={() => setLocal((v) => clamp(v + step.step))}
            className="gf-glass gf-press grid size-12 place-items-center rounded-full text-ink-soft hover:text-electric"
          >
            <Plus className="size-5" strokeWidth={3} />
          </button>
        </div>

        <input
          type="range"
          min={step.min}
          max={step.max}
          step={step.step}
          value={local}
          aria-label={step.title}
          onChange={(event) => setLocal(Number(event.target.value))}
          className="mt-8 w-full accent-[#0052FF]"
        />
        <div className="mt-2 flex justify-between text-xs font-semibold text-haze">
          <span>
            {step.min} {step.unit}
          </span>
          <span>
            {step.max} {step.unit}
          </span>
        </div>
      </GlassCard>

      <GlowButton
        size="lg"
        fullWidth
        className="mt-6"
        onClick={() => onSubmit({ [step.id]: local } as Partial<QuizAnswers>)}
      >
        Continue
        <ArrowRight className="size-5" />
      </GlowButton>
    </>
  );
}
