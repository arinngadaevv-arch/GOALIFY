"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, TrendingUp } from "lucide-react";
import { QUIZ_STEPS, type QuizStep } from "@/lib/goalify/quiz";
import { DEFAULT_ANSWERS } from "@/lib/goalify/plan";
import { coachProgressNudge, coachReaction } from "@/lib/goalify/coach";
import type { JointStatus, QuizAnswers } from "@/lib/goalify/types";
import { useGoalify } from "@/lib/goalify/store";
import { Brand } from "@/components/goalify/brand";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { CoachBubble } from "@/components/goalify/coach/coach-bubble";
import { CoachGuide, sayCoach } from "@/components/goalify/coach/coach-guide";
import { ParticleField } from "@/components/goalify/ui/particles";
import { useUiSounds } from "@/components/goalify/use-ui-sounds";
import { AnalyzingScreen } from "./analyzing-screen";

/** Steps whose stored value is a number even though it's picked as a choice. */
const NUMERIC_CHOICE_IDS = new Set<keyof QuizAnswers>(["daysPerWeek"]);

/** How long the coach's reaction stays on screen before the next question. */
const REACTION_MS = 1050;

export function QuizFlow() {
  const router = useRouter();
  const { state, setDraft, completeQuiz } = useGoalify();
  const [index, setIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [pending, setPending] = useState<Partial<QuizAnswers> | null>(null);
  /** Badge that snaps in over the chosen card. */
  const [badge, setBadge] = useState<string | null>(null);
  const { clickPop, progressPowerUp } = useUiSounds();

  const step = QUIZ_STEPS[index];
  const isLast = index === QUIZ_STEPS.length - 1;
  const progress = (index / QUIZ_STEPS.length) * 100;

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

  /**
   * Writes the answer immediately (so the option shows as selected), fires the
   * coach's reaction, and queues the advance so the reaction has a beat to land.
   */
  const pick = useCallback(
    (patch: Partial<QuizAnswers>, value: unknown, wonBadge?: string) => {
      setDraft(patch);
      const line = coachReaction(String(step.id), value);
      setReaction(line);
      setBadge(wonBadge ?? null);
      setPending(patch);
      progressPowerUp();
      // Mirror the reaction into the floating coach so it stays in the corner
      // even once the question has scrolled away.
      if (line) sayCoach(line);
    },
    [setDraft, step.id, progressPowerUp],
  );

  // The advance itself happens in a timer callback, never synchronously in the
  // effect body, so this stays clear of cascading-render lint rules.
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      if (isLast) {
        finish(pending);
      } else {
        setIndex((i) => i + 1);
        setReaction(null);
        setBadge(null);
      }
      setPending(null);
    }, REACTION_MS);
    return () => clearTimeout(timer);
  }, [pending, isLast, finish]);

  if (analyzing) {
    return <AnalyzingScreen onDone={() => router.push("/plan")} />;
  }

  const coachMessage = reaction ?? coachProgressNudge(progress);

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-28">
      <ParticleField />

      <header className="relative flex items-center justify-between py-6">
        <Brand />
        <div className="text-right">
          <span className="gf-numeric block text-sm font-bold text-mist">
            {index + 1}
            <span className="text-haze"> / {QUIZ_STEPS.length}</span>
          </span>
          <span className="text-[10px] font-bold tracking-[0.14em] text-electric uppercase">
            {step.chapter}
          </span>
        </div>
      </header>

      <div
        className="relative h-2.5 w-full overflow-hidden rounded-full bg-ink/6"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Quiz progress"
      >
        <div
          className="h-full rounded-full bg-linear-to-r from-electric to-lime-neon shadow-[0_0_12px_rgba(57,255,20,0.6)] transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>

      {/* The coach speaks on every single step. */}
      <CoachBubble
        key={coachMessage}
        message={coachMessage}
        tone={reaction ? "lime" : "plain"}
        className="relative mt-6"
      />

      <div key={step.id} className="gf-anim-rise relative flex-1 pt-8">
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
              onPick={pick}
              onSetDraft={setDraft}
              locked={pending !== null}
              activeBadge={badge}
              onTap={clickPop}
            />
          ) : (
            <NumberStep
              step={step}
              value={typeof currentValue === "number" ? currentValue : undefined}
              onSubmit={pick}
              locked={pending !== null}
              onTap={clickPop}
            />
          )}
        </div>
      </div>

      <footer className="relative flex items-center justify-between pt-8">
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

      <CoachGuide autoOpen={false} />
    </main>
  );
}

/* ------------------------------------------------------------------ choice */

function ChoiceStep({
  step,
  value,
  onPick,
  onSetDraft,
  locked,
  activeBadge,
  onTap,
}: {
  step: Extract<QuizStep, { kind: "choice" }>;
  value: unknown;
  onPick: (
    patch: Partial<QuizAnswers>,
    value: unknown,
    badge?: string,
  ) => void;
  onSetDraft: (patch: Partial<QuizAnswers>) => void;
  locked: boolean;
  activeBadge: string | null;
  onTap: () => void;
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
              socialProof={option.socialProof}
              selected={selected.includes(option.value)}
              multi
              disabled={locked}
              onClick={() => {
                onTap();
                toggle(option.value);
              }}
            />
          ))}
        </div>
        <GlowButton
          size="lg"
          fullWidth
          className="mt-6"
          disabled={selected.length === 0 || locked}
          onClick={() =>
            onPick(
              { [step.id]: selected as JointStatus[] } as Partial<QuizAnswers>,
              selected,
              step.options.find((o) => o.value === selected[0])?.badge,
            )
          }
        >
          Lock it in
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
          socialProof={option.socialProof}
          selected={String(value) === option.value}
          wonBadge={String(value) === option.value ? activeBadge : null}
          disabled={locked}
          onClick={() => {
            const stored = NUMERIC_CHOICE_IDS.has(step.id)
              ? Number(option.value)
              : option.value;
            onPick(
              { [step.id]: stored } as Partial<QuizAnswers>,
              option.value,
              option.badge,
            );
          }}
        />
      ))}
    </div>
  );
}

function OptionCard({
  emoji,
  label,
  description,
  socialProof,
  selected,
  wonBadge = null,
  multi = false,
  disabled = false,
  onClick,
}: {
  emoji: string;
  label: string;
  description?: string;
  socialProof?: string;
  selected: boolean;
  wonBadge?: string | null;
  multi?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(
        "gf-glass gf-press relative rounded-3xl p-4 text-left transition-all duration-300",
        "flex items-center gap-4",
        !disabled && "hover:-translate-y-0.5 hover:border-electric/30",
        selected
          ? "gf-glow-border gf-glow-electric border-electric/50"
          : "disabled:opacity-45",
      )}
    >
      {/* Motivational badge snaps in the instant the card is chosen. */}
      {wonBadge && (
        <span className="gf-anim-unlock gf-glow-lime absolute -top-2.5 right-4 z-10 rounded-full bg-lime-neon px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-ink uppercase">
          {wonBadge}
        </span>
      )}
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
        {socialProof && (
          <span className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-lime-deep">
            <TrendingUp className="size-3 shrink-0" strokeWidth={3} />
            {socialProof}
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
  locked,
  onTap,
}: {
  step: Extract<QuizStep, { kind: "number" }>;
  value?: number;
  onSubmit: (patch: Partial<QuizAnswers>, value: unknown) => void;
  locked: boolean;
  onTap: () => void;
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
            onClick={() => {
              onTap();
              setLocal((v) => clamp(v - step.step));
            }}
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
            onClick={() => {
              onTap();
              setLocal((v) => clamp(v + step.step));
            }}
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
        disabled={locked}
        onClick={() =>
          onSubmit({ [step.id]: local } as Partial<QuizAnswers>, local)
        }
      >
        Lock it in
        <ArrowRight className="size-5" />
      </GlowButton>
    </>
  );
}
