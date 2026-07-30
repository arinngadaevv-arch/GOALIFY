"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { ArrowRight, Check, ChevronLeft, TrendingUp } from "lucide-react";
import {
  QUIZ_STEPS,
  type ChoiceOption,
  type QuizStep,
} from "@/lib/goalify/quiz";
import { DEFAULT_ANSWERS } from "@/lib/goalify/plan";
import { coachProgressNudge, coachReaction } from "@/lib/goalify/coach";
import type { JointStatus, QuizAnswers } from "@/lib/goalify/types";
import { useGoalify } from "@/lib/goalify/store";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { CoachBadge } from "@/components/goalify/coach/coach-bubble";
import { CoachGuide, sayCoach } from "@/components/goalify/coach/coach-guide";
import { useUiSounds } from "@/components/goalify/use-ui-sounds";
import { OptionPhoto } from "./option-photo";
import { QuizIconBadge, type QuizIconKey } from "./quiz-icons";
import { SelectionBurst } from "./selection-burst";
import { AnalyzingScreen } from "./analyzing-screen";
import { BodyMapStep } from "./body-map";
import { SpeedRound } from "./speed-round";
import { BioStatHud, HUD_STEP_META } from "./bio-stat-hud";
import { TactileSlider } from "./tactile-slider";

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
  /** The persistent gamification HUD — ticks up as questions land. */
  const [hud, setHud] = useState({ burn: 0, precision: 0 });
  const [hudToast, setHudToast] = useState<string | null>(null);
  const { clickPop, hypeSelect, sliderTick } = useUiSounds();

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
      hypeSelect();
      // Mirror the reaction into the floating coach so it stays in the corner
      // even once the question has scrolled away.
      if (line) sayCoach(line);

      const meta = HUD_STEP_META[step.id];
      if (meta) {
        setHud((prev) => ({
          burn: Math.min(100, prev.burn + meta.burn),
          precision: Math.min(100, prev.precision + meta.precision),
        }));
        setHudToast(`+${meta.burn}% ${meta.label}`);
      }
    },
    [setDraft, step.id, hypeSelect],
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
        setHudToast(null);
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
      <header className="relative flex items-center gap-4 py-5">
        <button
          type="button"
          aria-label="Back"
          onClick={() => (index === 0 ? router.push("/") : setIndex((i) => i - 1))}
          className="gf-press -ml-1 grid size-9 shrink-0 place-items-center rounded-full text-ink"
        >
          <ChevronLeft className="size-6" strokeWidth={2.5} />
        </button>

        {/* Segmented progress — one bar per third of the funnel. */}
        <div
          className="flex flex-1 items-center gap-2"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          {[0, 1, 2].map((segment) => {
            const filled = Math.max(
              0,
              Math.min(1, progress / 100 * 3 - segment),
            );
            return (
              <span
                key={segment}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/8"
              >
                <span
                  className="block h-full rounded-full bg-electric transition-[width] duration-500 ease-out"
                  style={{ width: `${filled * 100}%` }}
                />
              </span>
            );
          })}
        </div>

        <span className="gf-numeric shrink-0 text-xs font-bold text-haze">
          {index + 1}/{QUIZ_STEPS.length}
        </span>
      </header>

      {/* ------------------------------------------------- Persistent stat HUD */}
      <BioStatHud burn={hud.burn} precision={hud.precision} toast={hudToast} />

      {/* ------------------------------------------------------- Big headline */}
      <div key={step.id} className="gf-anim-swoop relative pt-4">
        <p className="text-[11px] font-black tracking-[0.16em] text-electric uppercase">
          {step.chapter}
        </p>
        <h1 className="gf-slash gf-display gf-text-neon relative mt-2 text-4xl leading-[1.05] font-black sm:text-5xl">
          {step.title}
        </h1>
      </div>

      {/* The coach speaks on every single step. */}
      <div
        key={coachMessage}
        className="gf-tip gf-anim-rise relative mt-6 flex items-center gap-4 px-5 py-4"
      >
        <CoachBadge size="md" />
        <p className="relative z-10 text-sm leading-snug font-semibold text-ink-soft">
          {coachMessage}
        </p>
      </div>

      <div className="relative flex-1 pt-7">
        <p className="mb-6 text-sm leading-relaxed text-mist">
          {step.subtitle}
        </p>

        {step.kind === "choice" && step.speedRound && (
          <SpeedRound key={step.id} locked={pending !== null} />
        )}

        <div>
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
          ) : step.kind === "bodyMap" ? (
            <BodyMapStep
              step={step}
              value={currentValue}
              onSetDraft={setDraft}
              onPick={pick}
              locked={pending !== null}
              onTap={clickPop}
            />
          ) : (
            <NumberStep
              key={step.id}
              step={step}
              value={typeof currentValue === "number" ? currentValue : undefined}
              onSubmit={pick}
              locked={pending !== null}
              onTick={sliderTick}
            />
          )}
        </div>
      </div>

      <footer className="relative pt-8 text-center">
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
              icon={option.icon}
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

  const layout = step.layout ?? "list";
  const main = step.options.filter((o) => !o.aside);
  const asides = step.options.filter((o) => o.aside);

  const choose = (option: (typeof step.options)[number]) => {
    const stored = NUMERIC_CHOICE_IDS.has(step.id)
      ? Number(option.value)
      : option.value;
    onPick(
      { [step.id]: stored } as Partial<QuizAnswers>,
      option.value,
      option.badge,
    );
  };

  return (
    <div>
      <div
        className={clsx(
          "grid gap-3",
          (layout === "portrait" || layout === "tile") && "grid-cols-2 gap-4",
          layout === "portrait" && "mt-14",
        )}
      >
        {main.map((option) => (
          <PhotoOptionCard
            key={option.value}
            option={option}
            layout={layout}
            selected={String(value) === option.value}
            wonBadge={String(value) === option.value ? activeBadge : null}
            disabled={locked}
            onClick={() => choose(option)}
          />
        ))}
      </div>

      {asides.length > 0 && (
        <div className="mt-4 flex justify-center">
          {asides.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={locked}
              aria-pressed={String(value) === option.value}
              onClick={() => choose(option)}
              className={clsx(
                "gf-card gf-press rounded-full px-7 py-3.5 text-sm font-semibold transition-all",
                String(value) === option.value
                  ? "gf-card-active text-electric"
                  : "text-ink-soft hover:text-ink",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One answer card. The three photo layouts mirror the onboarding reference:
 * a portrait pair with the cut-out breaking above the card, full-width rows
 * with the photo bleeding off the right edge, and a plain image-above-label
 * tile. `list` keeps the compact icon row for the quick utility questions.
 */
function PhotoOptionCard({
  option,
  layout,
  selected,
  wonBadge,
  disabled,
  onClick,
}: {
  option: ChoiceOption;
  layout: "portrait" | "wide" | "tile" | "list";
  selected: boolean;
  wonBadge: string | null;
  disabled: boolean;
  onClick: () => void;
}) {
  const badge = wonBadge && (
    <span className="gf-anim-unlock absolute -top-2.5 right-3 z-20 rounded-full bg-linear-to-r from-[#22d3ee] via-[#a855f7] to-[#ff7a1a] px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-white uppercase shadow-md">
      {wonBadge}
    </span>
  );
  const burst = selected && <SelectionBurst />;

  if (layout === "list") {
    return (
      <OptionCard
        icon={option.icon}
        label={option.label}
        description={option.description}
        socialProof={option.socialProof}
        selected={selected}
        wonBadge={wonBadge}
        disabled={disabled}
        onClick={onClick}
      />
    );
  }

  const base = clsx(
    "gf-card gf-card-hover gf-neon-ring gf-press relative text-left transition-all",
    selected && "gf-neon-ring-active gf-anim-select-pop",
    disabled && !selected && "opacity-50",
  );

  if (layout === "wide") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex items-stretch overflow-hidden")}
      >
        {badge}
        {burst}
        <span className="flex min-w-0 flex-1 flex-col justify-center py-7 pl-6">
          <span className="gf-display text-2xl leading-tight font-extrabold text-ink">
            {option.label}
          </span>
          {option.description && (
            <span className="mt-1 text-xs leading-snug text-mist">
              {option.description}
            </span>
          )}
          {option.socialProof && (
            <span className="mt-2 text-[11px] font-bold text-lime-deep">
              {option.socialProof}
            </span>
          )}
        </span>
        <OptionPhoto
          src={option.image}
          alt={option.label}
          label={option.label}
          icon={option.icon}
          className="h-36 w-40 shrink-0 self-end"
        />
      </button>
    );
  }

  if (layout === "portrait") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex flex-col items-center px-3 pt-0 pb-5")}
      >
        {badge}
        {burst}
        {/* The cut-out breaks above the card, exactly like the reference. */}
        <OptionPhoto
          src={option.image}
          alt={option.label}
          label={option.label}
          icon={option.icon}
          className="-mt-14 h-56 w-full"
        />
        <span className="gf-display mt-2 text-xl font-extrabold text-ink">
          {option.label}
        </span>
      </button>
    );
  }

  // tile
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(base, "flex flex-col overflow-hidden pb-4")}
    >
      {badge}
      <OptionPhoto
        src={option.image}
        alt={option.label}
        label={option.label}
        icon={option.icon}
        className="h-36 w-full"
      />
      <span className="gf-display mt-2 px-3 text-center text-base leading-tight font-extrabold text-ink">
        {option.label}
      </span>
      {option.socialProof && (
        <span className="mt-1 px-3 text-center text-[10px] font-bold text-lime-deep">
          {option.socialProof}
        </span>
      )}
    </button>
  );
}

function OptionCard({
  icon,
  label,
  description,
  socialProof,
  selected,
  wonBadge = null,
  multi = false,
  disabled = false,
  onClick,
}: {
  icon: QuizIconKey;
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
        "gf-glass gf-neon-ring gf-press relative rounded-3xl p-4 text-left transition-all duration-300",
        "flex items-center gap-4",
        !disabled && "hover:-translate-y-0.5",
        selected
          ? "gf-neon-ring-active gf-anim-select-pop"
          : "disabled:opacity-45",
      )}
    >
      {selected && <SelectionBurst />}

      {/* Motivational badge snaps in the instant the card is chosen. */}
      {wonBadge && (
        <span className="gf-anim-unlock absolute -top-2.5 right-4 z-20 rounded-full bg-linear-to-r from-[#22d3ee] via-[#a855f7] to-[#ff7a1a] px-2.5 py-1 text-[9px] font-black tracking-[0.12em] text-white uppercase shadow-md">
          {wonBadge}
        </span>
      )}
      <QuizIconBadge icon={icon} size="md" active={selected} />
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
  onTick,
}: {
  step: Extract<QuizStep, { kind: "number" }>;
  value?: number;
  onSubmit: (patch: Partial<QuizAnswers>, value: unknown) => void;
  locked: boolean;
  onTick: () => void;
}) {
  const [local, setLocal] = useState(value ?? step.defaultValue);

  return (
    <>
      <GlassCard deep className="p-8">
        <TactileSlider
          value={local}
          min={step.min}
          max={step.max}
          step={step.step}
          unit={step.unit}
          onChange={setLocal}
          onTick={onTick}
          disabled={locked}
        />
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
