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
import type { QuizAnswers, SessionLength } from "@/lib/goalify/types";
import { useGoalify } from "@/lib/goalify/store";
import { GlowButton } from "@/components/goalify/ui/glow-button";
import { CoachBadge } from "@/components/goalify/coach/coach-bubble";
import { CoachGuide, sayCoach } from "@/components/goalify/coach/coach-guide";
import { useUiSounds } from "@/components/goalify/use-ui-sounds";
import { hasRealPhoto, OptionPhoto } from "./option-photo";
import { QuizIconBadge, type QuizIconKey } from "./quiz-icons";
import { AnalyzingScreen } from "./analyzing-screen";
import { BodyMapStep } from "./body-map";
import { SpeedRound } from "./speed-round";
import { HUD_STEP_META, HypeToast } from "./hype-toast";
import { CommitStep } from "./commit-step";
import { VitalsStep } from "./vitals-step";
import { fireBurst, ParticleBurstLayer } from "./particle-burst";

/** Wraps a click handler so every tap also fires a micro-particle burst
 * from the exact point of contact. */
function withBurst(handler: () => void, gold = false) {
  return (event: React.MouseEvent) => {
    fireBurst(event.clientX, event.clientY, gold);
    handler();
  };
}

/**
 * The merged "time commitment" step packs two fields into one option
 * value ("4-25" -> 4 days a week, 25-minute sessions). Every other choice
 * step still writes its single `id` field directly.
 */
function parseTimeCombo(raw: string): { daysPerWeek: number; sessionLength: SessionLength } {
  const [days, minutes] = raw.split("-");
  return { daysPerWeek: Number(days), sessionLength: minutes as SessionLength };
}

/** Fixed patches for the two rhetorical "yes-set" commitment cards. */
const COMMIT_PATCHES: Partial<Record<keyof QuizAnswers, Partial<QuizAnswers>>> = {
  joints: { joints: ["none"] },
  commitment: { commitment: "allin" },
};
const COMMIT_VALUES: Partial<Record<keyof QuizAnswers, unknown>> = {
  joints: "ready",
  commitment: "allin",
};

/** How long the coach's reaction stays on screen before the next question. */
const REACTION_MS = 1050;

export function QuizFlow() {
  const router = useRouter();
  const { state, setDraft, completeQuiz } = useGoalify();
  const [index, setIndex] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [pending, setPending] = useState<Partial<QuizAnswers> | null>(null);
  /** The celebration pill that pops the instant an answer lands. */
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
    (patch: Partial<QuizAnswers>, value: unknown) => {
      setDraft(patch);
      const line = coachReaction(String(step.id), value);
      setReaction(line);
      setPending(patch);
      hypeSelect();
      // Mirror the reaction into the floating coach so it stays in the corner
      // even once the question has scrolled away.
      if (line) sayCoach(line);

      const meta = HUD_STEP_META[step.id];
      if (meta) setHudToast(meta.hype);
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
    <main className="gf-cyber-scope relative mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-28">
      <ParticleBurstLayer />
      <header className="relative flex items-center gap-4 py-5">
        <button
          type="button"
          aria-label="Back"
          onClick={() => (index === 0 ? router.push("/") : setIndex((i) => i - 1))}
          className="gf-press -ml-1 grid size-9 shrink-0 place-items-center rounded-full text-ink"
        >
          <ChevronLeft className="size-6" strokeWidth={2.5} />
        </button>

        {/* Sleek single-line progress bar — no more per-step segments. */}
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="gf-charge h-full rounded-full bg-electric transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="gf-numeric shrink-0 text-xs font-bold text-haze">
          {index + 1}/{QUIZ_STEPS.length}
        </span>
      </header>

      {/* --------------------------------------------- Live diagnostic readout */}
      <div className="relative flex items-center justify-between">
        <p className="gf-anim-flicker gf-cyber-gold-text text-[10px] font-black tracking-[0.14em] uppercase">
          {step.hudPhrase} {Math.round(((index + 1) / QUIZ_STEPS.length) * 100)}% MATCH
        </p>
        {hudToast && <HypeToast text={hudToast} />}
      </div>

      {/* ------------------------------------------------------- Big headline */}
      <div key={step.id} className="gf-anim-swoop relative pt-2">
        <div className="flex items-center gap-2">
          <span className="gf-accent-line" aria-hidden />
          <p className="gf-cyber-glow-text text-[11px] font-black tracking-[0.16em] uppercase">
            {step.chapter}
          </p>
        </div>
        <h1 className="gf-slash gf-display relative mt-2 text-4xl leading-[1.05] font-black text-ink sm:text-5xl">
          {step.title}
        </h1>
      </div>

      {/* The coach speaks on every single step. */}
      <div
        key={coachMessage}
        className="gf-tip gf-anim-rise relative mt-6 flex items-center gap-4 px-5 py-4"
      >
        <CoachBadge size="lg" />
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
          ) : step.kind === "vitals" ? (
            <VitalsStep
              key={step.id}
              draft={draft}
              locked={pending !== null}
              onSubmit={pick}
              onTick={sliderTick}
            />
          ) : (
            <CommitStep
              key={step.id}
              buttonLabel={step.buttonLabel}
              patch={COMMIT_PATCHES[step.id] ?? {}}
              value={COMMIT_VALUES[step.id]}
              locked={pending !== null}
              onPick={pick}
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
  onTap,
}: {
  step: Extract<QuizStep, { kind: "choice" }>;
  value: unknown;
  onPick: (patch: Partial<QuizAnswers>, value: unknown) => void;
  onSetDraft: (patch: Partial<QuizAnswers>) => void;
  locked: boolean;
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
        <div className="grid grid-cols-2 gap-3">
          {step.options.map((option) => (
            <OptionCard
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
              socialProof={option.socialProof}
              selected={selected.includes(option.value)}
              disabled={locked}
              onClick={() => {
                onTap();
                toggle(option.value);
              }}
            />
          ))}
        </div>
        <GlowButton
          variant="cyber"
          size="lg"
          fullWidth
          className="mt-6"
          disabled={selected.length === 0 || locked}
          onClick={withBurst(() => {
            onPick({ [step.id]: selected } as Partial<QuizAnswers>, selected);
          }, true)}
        >
          Continue
          <ArrowRight className="size-5" />
        </GlowButton>
      </>
    );
  }

  const layout = step.layout ?? "list";
  const main = step.options.filter((o) => !o.aside);
  const asides = step.options.filter((o) => o.aside);

  const choose = (option: (typeof step.options)[number]) => {
    // The merged time-commitment step packs two fields into one value
    // ("4-25" -> 4 days a week, 25-minute sessions).
    if (step.id === "sessionLength" && option.value.includes("-")) {
      const combo = parseTimeCombo(option.value);
      onPick(combo, option.value);
      return;
    }
    onPick({ [step.id]: option.value } as Partial<QuizAnswers>, option.value);
  };

  return (
    <div>
      <div
        className={clsx(
          "grid gap-3",
          layout !== "wide" && "grid-cols-2",
          (layout === "portrait" || layout === "tile") && "gap-4",
          layout === "portrait" && "mt-14",
        )}
      >
        {main.map((option) => (
          <PhotoOptionCard
            key={option.value}
            option={option}
            layout={layout}
            selected={String(value) === option.value}
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
              onClick={withBurst(() => choose(option))}
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
  disabled,
  onClick,
}: {
  option: ChoiceOption;
  layout: "portrait" | "wide" | "tile" | "list";
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const checkBadge = selected && (
    <span className="absolute top-3 right-3 z-20 grid size-6 place-items-center rounded-full bg-electric text-white shadow-md">
      <Check className="size-3.5" strokeWidth={3.5} />
    </span>
  );

  if (layout === "list") {
    return (
      <OptionCard
        icon={option.icon}
        label={option.label}
        description={option.description}
        socialProof={option.socialProof}
        selected={selected}
        disabled={disabled}
        onClick={onClick}
      />
    );
  }

  const base = clsx(
    "gf-card gf-card-hover gf-press relative text-left transition-all duration-300",
    selected && "gf-card-active scale-[1.015]",
    disabled && !selected && "opacity-50",
  );
  const hasPhoto = hasRealPhoto(option.image);

  if (layout === "wide") {
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex items-stretch overflow-hidden")}
      >
        {checkBadge}
        <span
          className={clsx(
            "flex min-w-0 flex-1 flex-col justify-center py-7 pl-6",
            !hasPhoto && "pr-6",
          )}
        >
          <span className="gf-display text-2xl leading-tight font-extrabold text-ink">
            {option.label}
          </span>
          {option.description && (
            <span className="mt-1 text-xs leading-snug text-mist">
              {option.description}
            </span>
          )}
          {option.socialProof && (
            <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-lime-neon/14 px-2 py-1 text-[10px] leading-none font-bold text-lime-deep">
              <TrendingUp className="size-3 shrink-0" strokeWidth={3} />
              {option.socialProof}
            </span>
          )}
        </span>
        {hasPhoto ? (
          <OptionPhoto
            src={option.image}
            alt={option.label}
            label={option.label}
            icon={option.icon}
            className="h-full min-h-44 w-40 shrink-0"
          />
        ) : (
          <span className="mr-6 flex shrink-0 items-center">
            <QuizIconBadge icon={option.icon} size="md" active={selected} />
          </span>
        )}
      </button>
    );
  }

  if (layout === "portrait") {
    if (!hasPhoto) {
      return (
        <button
          type="button"
          onClick={withBurst(onClick)}
          disabled={disabled}
          aria-pressed={selected}
          className={clsx(base, "flex flex-col items-center gap-3 px-4 py-8")}
        >
          {checkBadge}
          <QuizIconBadge icon={option.icon} size="md" active={selected} />
          <span className="gf-display text-lg font-extrabold text-ink">
            {option.label}
          </span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex flex-col items-center px-3 pt-0 pb-5")}
      >
        {checkBadge}
        {/* The cut-out breaks above the card, exactly like the reference. */}
        <OptionPhoto
          src={option.image}
          alt={option.label}
          label={option.label}
          icon={option.icon}
          className="-mt-14 h-64 w-full"
        />
        <span className="gf-display mt-2 text-xl font-extrabold text-ink">
          {option.label}
        </span>
      </button>
    );
  }

  // tile
  if (!hasPhoto) {
    return (
      <button
        type="button"
        onClick={withBurst(onClick)}
        disabled={disabled}
        aria-pressed={selected}
        className={clsx(base, "flex flex-col items-center gap-2 p-5 text-center")}
      >
        {checkBadge}
        <QuizIconBadge icon={option.icon} size="md" active={selected} />
        <span className="gf-display text-base leading-tight font-extrabold text-ink">
          {option.label}
        </span>
        {option.socialProof && (
          <span className="mx-auto mt-0.5 inline-flex w-fit items-center gap-1 rounded-full bg-lime-neon/14 px-2 py-1 text-[10px] leading-none font-bold text-lime-deep">
            <TrendingUp className="size-3 shrink-0" strokeWidth={3} />
            {option.socialProof}
          </span>
        )}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={withBurst(onClick)}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(base, "flex flex-col overflow-hidden pb-4")}
    >
      {checkBadge}
      <OptionPhoto
        src={option.image}
        alt={option.label}
        label={option.label}
        icon={option.icon}
        className="h-44 w-full"
      />
      <span className="gf-display mt-2 px-3 text-center text-base leading-tight font-extrabold text-ink">
        {option.label}
      </span>
      {option.socialProof && (
        <span className="mx-auto mt-1.5 inline-flex w-fit items-center gap-1 rounded-full bg-lime-neon/14 px-2 py-1 text-[10px] leading-none font-bold text-lime-deep">
          <TrendingUp className="size-3 shrink-0" strokeWidth={3} />
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
  disabled = false,
  onClick,
}: {
  icon: QuizIconKey;
  label: string;
  description?: string;
  socialProof?: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={withBurst(onClick)}
      disabled={disabled}
      aria-pressed={selected}
      className={clsx(
        "gf-glass gf-card-hover gf-press relative flex flex-col items-center rounded-3xl p-4 text-center transition-all duration-300",
        selected ? "gf-card-active scale-[1.015]" : "disabled:opacity-45",
      )}
    >
      {selected && (
        <span className="absolute top-3 right-3 z-20 grid size-6 place-items-center rounded-full bg-electric text-white shadow-md">
          <Check className="size-3.5" strokeWidth={3.5} />
        </span>
      )}
      <QuizIconBadge icon={icon} size="md" active={selected} />
      <span className="mt-3 block text-sm leading-tight font-extrabold tracking-tight text-ink">
        {label}
      </span>
      {description && (
        <span className="mt-1 block text-xs leading-snug text-mist">
          {description}
        </span>
      )}
      {socialProof && (
        <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-lime-neon/14 px-2 py-1 text-[10px] leading-none font-bold text-lime-deep">
          <TrendingUp className="size-3 shrink-0" strokeWidth={3} />
          {socialProof}
        </span>
      )}
    </button>
  );
}

