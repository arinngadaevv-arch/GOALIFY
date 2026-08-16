"use client";

import { useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  PersonStanding,
  Sparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import {
  EQUIPMENT_OPTIONS,
  FEELING_OPTIONS,
  FOCUS_OPTIONS,
  TIME_OPTIONS,
  recommendWorkout,
  type CoachAnswers,
  type CoachEquipment,
} from "@/lib/goalify/smart-coach";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { GlowButton, GlowLink } from "./ui/glow-button";
import { IconBadge } from "./ui/icon-badge";
import { ParticleField } from "./ui/particles";
import { fireBurst, ParticleBurstLayer } from "./quiz/particle-burst";
import { Pill, Stat } from "./ui/stat";
import { useUiSounds } from "./use-ui-sounds";

const QUESTIONS = [
  {
    eyebrow: "Step 1 of 4",
    title: "What do you want to do today?",
    hint: "Pick what matches your mood — we'll handle the rest.",
  },
  {
    eyebrow: "Step 2 of 4",
    title: "How much time do you have?",
    hint: "We'll match the pace and intensity to your window.",
  },
  {
    eyebrow: "Step 3 of 4",
    title: "What equipment do you have?",
    hint: "Every Goalify session works bodyweight-only — this just fine-tunes the pick.",
  },
  {
    eyebrow: "Step 4 of 4",
    title: "How are you feeling today?",
    hint: "Be honest — today's session should match today's energy.",
  },
];

const EQUIPMENT_ICONS: Record<CoachEquipment, LucideIcon> = {
  none: PersonStanding,
  dumbbells: Dumbbell,
  bands: Waves,
  gym: Building2,
};

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
};

const listContainer = {
  center: { transition: { staggerChildren: 0.05 } },
};

const listItem = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0 },
};

/**
 * Goalify Smart Coach — a free, rule-based 4-step questionnaire that
 * recommends a real workout from the app's existing data. No AI API, no
 * network call: `recommendWorkout` (smart-coach.ts) is a pure scoring
 * function over PROGRAM + LIBRARY.
 *
 * -1 = welcome beat, 0-3 = questions, 4 = result.
 */
export function SmartCoach() {
  const [step, setStep] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Partial<CoachAnswers>>({});
  const [pending, setPending] = useState<unknown>(null);
  const { glassChime, unlockFanfare } = useUiSounds();

  const totalSteps = QUESTIONS.length;
  const started = step >= 0;
  const done = step >= totalSteps;
  const progress = (Math.min(Math.max(step, 0), totalSteps) / totalSteps) * 100;

  function begin() {
    setDirection(1);
    setStep(0);
  }

  function pick<K extends keyof CoachAnswers>(key: K, value: CoachAnswers[K]) {
    if (pending !== null) return;
    glassChime();
    setPending(value);
    const next = { ...answers, [key]: value };
    window.setTimeout(() => {
      setAnswers(next);
      setPending(null);
      setDirection(1);
      if (step === totalSteps - 1) {
        unlockFanfare();
        fireBurst(window.innerWidth / 2, window.innerHeight / 2 - 80, true);
      }
      setStep((s) => s + 1);
    }, 260);
  }

  function goBack() {
    if (step <= 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
  }

  function restart() {
    setDirection(-1);
    setAnswers({});
    setPending(null);
    setStep(-1);
  }

  const recommendation =
    done && isComplete(answers) ? recommendWorkout(answers) : null;

  return (
    <AppShell
      dark
      title="Smart Coach"
      subtitle="Free · rule-based · picks from your real workouts"
    >
      <div className="relative">
        <ParticleField className="opacity-70" />
        <ParticleBurstLayer />

        {started && !done && (
          <div className="gf-anim-rise relative mb-8">
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
          {!started ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center pt-6 pb-4 text-center"
            >
              <IconBadge icon={Sparkles} size="lg" className="gf-anim-pulse" />
              <h1 className="gf-display mt-5 text-3xl leading-tight font-black text-ink">
                Let&apos;s find your
                <br />
                perfect workout
              </h1>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-mist">
                Four quick questions. Goalify Smart Coach matches them against
                your real workout library and hands you one to start right
                now — no guessing, no scrolling.
              </p>
              <GlowButton
                variant="cyber"
                size="xl"
                pulse
                className="mt-8 gap-2 tracking-tight"
                onClick={begin}
              >
                Let&apos;s Go <ArrowRight className="size-5" />
              </GlowButton>
              <p className="mt-4 text-[11px] font-semibold text-haze">
                Takes about 15 seconds
              </p>
            </motion.div>
          ) : !done ? (
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <h2 className="gf-display mb-1.5 text-2xl leading-tight font-black text-ink">
                {QUESTIONS[step].title}
              </h2>
              <p className="mb-6 text-xs leading-relaxed text-mist">
                {QUESTIONS[step].hint}
              </p>

              {step === 0 && (
                <ListOptions>
                  {FOCUS_OPTIONS.map((opt, i) => (
                    <ListOption
                      key={opt.value}
                      index={i}
                      selected={pending === opt.value}
                      onClick={() => pick("focus", opt.value)}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      {opt.label}
                    </ListOption>
                  ))}
                </ListOptions>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {TIME_OPTIONS.map((opt, i) => (
                    <GridOption
                      key={opt.value}
                      index={i}
                      selected={pending === opt.value}
                      onClick={() => pick("time", opt.value)}
                    >
                      <span className="gf-numeric gf-text-electric text-3xl font-black">
                        {opt.label.replace(/\D/g, "")}
                        {opt.value === 45 && "+"}
                      </span>
                      <span className="text-[11px] font-bold tracking-wide text-mist uppercase">
                        minutes
                      </span>
                    </GridOption>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {EQUIPMENT_OPTIONS.map((opt, i) => (
                    <GridOption
                      key={opt.value}
                      index={i}
                      selected={pending === opt.value}
                      onClick={() => pick("equipment", opt.value)}
                    >
                      <IconBadge icon={EQUIPMENT_ICONS[opt.value]} size="sm" />
                      <span>{opt.label}</span>
                    </GridOption>
                  ))}
                </div>
              )}

              {step === 3 && (
                <ListOptions>
                  {FEELING_OPTIONS.map((opt, i) => (
                    <ListOption
                      key={opt.value}
                      index={i}
                      selected={pending === opt.value}
                      onClick={() => pick("feeling", opt.value)}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      {opt.label}
                    </ListOption>
                  ))}
                </ListOptions>
              )}
            </motion.div>
          ) : recommendation ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="mb-5 flex items-center gap-2 text-electric">
                <Sparkles className="size-4" />
                <p className="text-xs font-black tracking-[0.14em] uppercase">
                  Your Perfect Workout
                </p>
              </div>

              <div className="relative">
                <div
                  className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.5rem] bg-electric/18 opacity-70 blur-3xl"
                  aria-hidden
                />
                <GlassCard deep tone="electric" className="p-6">
                <h2 className="gf-display text-2xl font-black text-ink">
                  {recommendation.workout.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">
                  {recommendation.workout.subtitle}
                </p>

                <div className="mt-5 grid grid-cols-3 divide-x divide-ink/8 rounded-3xl bg-black/20 p-4">
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
                  variant="electric"
                  className="mt-6 gap-2 tracking-tight"
                >
                  START WORKOUT <ArrowRight className="size-5" />
                </GlowLink>
                </GlassCard>
              </div>

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
      </div>
    </AppShell>
  );
}

function isComplete(answers: Partial<CoachAnswers>): answers is CoachAnswers {
  return Boolean(
    answers.focus && answers.time && answers.equipment && answers.feeling,
  );
}

function ListOptions({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={listContainer}
      initial="enter"
      animate="center"
      className="flex flex-col gap-2.5"
    >
      {children}
    </motion.div>
  );
}

function ListOption({
  children,
  index,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={listItem}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={onClick}
      className={clsx(
        "gf-glass gf-press flex items-center gap-3.5 rounded-2xl px-5 py-4 text-left text-sm font-bold text-ink transition-all duration-200",
        selected
          ? "gf-glow-electric scale-[1.015] border border-electric/60 bg-electric/10"
          : "border border-transparent hover:border-electric/30",
      )}
    >
      {children}
      <ChevronRight
        className={clsx(
          "ml-auto size-4 shrink-0 transition-transform duration-200",
          selected ? "translate-x-0.5 text-electric" : "text-haze",
        )}
      />
    </motion.button>
  );
}

function GridOption({
  children,
  index,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  index: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      onClick={onClick}
      className={clsx(
        "gf-glass gf-press flex flex-col items-center justify-center gap-2 rounded-2xl p-5 text-center text-sm font-bold text-ink transition-all duration-200",
        selected
          ? "gf-glow-electric scale-[1.03] border border-electric/60 bg-electric/10"
          : "border border-transparent hover:border-electric/30",
      )}
    >
      {children}
    </motion.button>
  );
}
