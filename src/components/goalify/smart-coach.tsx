"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Flame,
  Sparkles,
} from "lucide-react";
import {
  EQUIPMENT_OPTIONS,
  FEELING_OPTIONS,
  FOCUS_OPTIONS,
  TIME_OPTIONS,
  recommendWorkout,
  type CoachAnswers,
} from "@/lib/goalify/smart-coach";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { GlowLink } from "./ui/glow-button";
import { Pill, Stat } from "./ui/stat";
import { useUiSounds } from "./use-ui-sounds";

const QUESTIONS = [
  { eyebrow: "Step 1 of 4", title: "What do you want to do today?" },
  { eyebrow: "Step 2 of 4", title: "How much time do you have?" },
  { eyebrow: "Step 3 of 4", title: "What equipment do you have?" },
  { eyebrow: "Step 4 of 4", title: "How are you feeling today?" },
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

/**
 * Goalify Smart Coach — a free, rule-based 4-step questionnaire that
 * recommends a real workout from the app's existing data. No AI API, no
 * network call: `recommendWorkout` (smart-coach.ts) is a pure scoring
 * function over PROGRAM + LIBRARY.
 */
export function SmartCoach() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<CoachAnswers>>({});
  const [pending, setPending] = useState<unknown>(null);
  const { glassChime, unlockFanfare } = useUiSounds();

  const totalSteps = QUESTIONS.length;
  const done = step >= totalSteps;
  const progress = (Math.min(step, totalSteps) / totalSteps) * 100;

  function pick<K extends keyof CoachAnswers>(key: K, value: CoachAnswers[K]) {
    if (pending !== null) return;
    glassChime();
    setPending(value);
    const next = { ...answers, [key]: value };
    window.setTimeout(() => {
      setAnswers(next);
      setPending(null);
      setDirection(1);
      if (step === totalSteps - 1) unlockFanfare();
      setStep((s) => s + 1);
    }, 260);
  }

  function goBack() {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function restart() {
    setDirection(-1);
    setAnswers({});
    setPending(null);
    setStep(0);
  }

  const recommendation =
    done && isComplete(answers) ? recommendWorkout(answers) : null;

  return (
    <AppShell
      dark
      title="Smart Coach"
      subtitle="Free · rule-based · picks from your real workouts"
    >
      {!done && (
        <div className="gf-anim-rise mb-8">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goBack}
              disabled={step === 0}
              className={clsx(
                "flex items-center gap-1 text-[11px] font-bold text-mist transition-opacity",
                step === 0 ? "opacity-0" : "hover:text-ink",
              )}
            >
              <ArrowLeft className="size-3.5" /> Back
            </button>
            <p className="text-[11px] font-bold tracking-[0.14em] text-electric uppercase">
              {QUESTIONS[step].eyebrow}
            </p>
          </div>
          <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Smart Coach progress"
            className="h-1.5 w-full overflow-hidden rounded-full bg-ink/8"
          >
            <div
              className="h-full rounded-full bg-electric transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <AnimatePresence mode="wait" custom={direction} initial={false}>
        {!done ? (
          <motion.div
            key={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="gf-display mb-6 text-2xl leading-tight font-black text-ink">
              {QUESTIONS[step].title}
            </h1>

            {step === 0 && (
              <div className="grid grid-cols-2 gap-3">
                {FOCUS_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={pending === opt.value}
                    onClick={() => pick("focus", opt.value)}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </OptionButton>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {TIME_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={pending === opt.value}
                    onClick={() => pick("time", opt.value)}
                  >
                    <Clock className="size-5 text-electric" />
                    <span>{opt.label}</span>
                  </OptionButton>
                ))}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-2 gap-3">
                {EQUIPMENT_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={pending === opt.value}
                    onClick={() => pick("equipment", opt.value)}
                  >
                    <Dumbbell className="size-5 text-electric" />
                    <span>{opt.label}</span>
                  </OptionButton>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-3 gap-3">
                {FEELING_OPTIONS.map((opt) => (
                  <OptionButton
                    key={opt.value}
                    selected={pending === opt.value}
                    onClick={() => pick("feeling", opt.value)}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </OptionButton>
                ))}
              </div>
            )}
          </motion.div>
        ) : recommendation ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-5 flex items-center gap-2 text-electric">
              <Sparkles className="size-4" />
              <p className="text-xs font-black tracking-[0.14em] uppercase">
                Your Perfect Workout
              </p>
            </div>

            <GlassCard deep tone="electric" className="p-6">
              <h2 className="gf-display text-2xl font-black text-ink">
                {recommendation.workout.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">
                {recommendation.workout.subtitle}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-3 border-y border-ink/8 py-4">
                <Stat
                  value={recommendation.workout.durationMinutes}
                  suffix="min"
                  label="Duration"
                />
                <Stat
                  value={recommendation.workout.exercises.length}
                  label="Exercises"
                />
                <Stat value={recommendation.workout.intensity} label="Level" />
              </div>

              <Pill tone="lime" className="mt-4">
                <Check className="size-3" strokeWidth={3} />
                No equipment needed
              </Pill>

              <ul className="mt-4 space-y-1.5">
                {recommendation.reasons.map((reason) => (
                  <li
                    key={reason}
                    className="flex items-start gap-2 text-xs text-mist"
                  >
                    <Flame className="mt-0.5 size-3 shrink-0 text-electric" />
                    {reason}
                  </li>
                ))}
              </ul>

              <GlowLink
                href={`/workout/launch?workout=${recommendation.workout.id}`}
                size="lg"
                fullWidth
                pulse
                variant="cyber"
                className="mt-6 gap-2 tracking-tight"
              >
                START WORKOUT <ArrowRight className="size-5" />
              </GlowLink>
            </GlassCard>

            <button
              type="button"
              onClick={restart}
              className="gf-press mt-5 w-full text-center text-xs font-bold text-mist hover:text-ink"
            >
              Ask Smart Coach again
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppShell>
  );
}

function isComplete(answers: Partial<CoachAnswers>): answers is CoachAnswers {
  return Boolean(
    answers.focus && answers.time && answers.equipment && answers.feeling,
  );
}

function OptionButton({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "gf-glass gf-press flex flex-col items-center justify-center gap-2 rounded-2xl p-5 text-center text-sm font-bold text-ink transition-all duration-200",
        selected
          ? "gf-glow-electric scale-[1.03] border border-electric/60 bg-electric/10"
          : "border border-transparent hover:border-electric/30",
      )}
    >
      {children}
    </button>
  );
}
