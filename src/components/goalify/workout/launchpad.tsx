"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  ArrowRight,
  Check,
  Droplets,
  Flame,
  Library,
  Ruler,
  ShieldCheck,
  Smartphone,
  Timer,
  Volume2,
  X,
  type LucideIcon,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import { GlassCard } from "@/components/goalify/ui/glass-card";
import { GlowLink } from "@/components/goalify/ui/glow-button";
import { CoachAvatar } from "@/components/goalify/ui/visual-slot";
import { Pill, Stat } from "@/components/goalify/ui/stat";
import { FloatingStreakBadge } from "@/components/goalify/ui/floating-streak-badge";
import { fireBurst, ParticleBurstLayer } from "@/components/goalify/quiz/particle-burst";

const CHECKLIST: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "space", label: "2×2 metres of clear floor", icon: Ruler },
  { id: "water", label: "Water within reach", icon: Droplets },
  { id: "sound", label: "Sound on for voice cues", icon: Volume2 },
  { id: "phone", label: "Phone propped where you can see it", icon: Smartphone },
];

export function Launchpad() {
  const { state, todaysWorkout } = useGoalify();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("workout");
  const baseWorkout =
    (selectedId && findWorkout(selectedId)) || todaysWorkout;
  const isLibraryPick = baseWorkout.id !== todaysWorkout.id;
  const workout = resolveWorkout(baseWorkout, state.settings.kneeSafe);
  const liveHref = isLibraryPick
    ? `/workout/live?workout=${baseWorkout.id}`
    : "/workout/live";
  const [checked, setChecked] = useState<string[]>([]);

  const toggle = (id: string) =>
    setChecked((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );

  return (
    <main className="gf-cyber-scope mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 pt-6 pb-10">
      <ParticleBurstLayer />
      <FloatingStreakBadge />

      <header className="flex items-center justify-between">
        <Pill tone="electric">
          {isLibraryPick ? (
            <>
              <Library className="size-3" strokeWidth={3} />
              Library pick
            </>
          ) : (
            <>
              <Flame className="size-3" strokeWidth={3} />
              Day {state.programDay}
            </>
          )}
        </Pill>
        <Link
          href="/home"
          aria-label="Close and go home"
          className="gf-glass gf-press grid size-10 place-items-center rounded-full text-ink-soft"
        >
          <X className="size-5" />
        </Link>
      </header>

      {/* ------------------------------------------------------- Hype headline */}
      <div className="gf-anim-rise mt-8 text-center">
        <h1 className="gf-display text-5xl font-black text-ink sm:text-6xl">
          YOU VS. <span className="gf-text-hype">YOU</span>
          <br />
          TODAY!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-soft">
          {workout.title} — {workout.focus}
        </p>
      </div>

      {/* ---------------------------------------------------------- Coach hype */}
      <div className="gf-anim-materialize relative mt-8">
        <CoachAvatar
          label="Hype Coach"
          hint="Looping 3D hype animation"
          className="mx-auto aspect-square w-full max-w-xs"
        />
        <GlassCard
          tone="lime"
          deep
          className="gf-anim-float absolute right-0 bottom-4 max-w-[62%] p-4"
        >
          <p className="text-sm leading-snug font-extrabold text-ink">
            &ldquo;{workout.durationMinutes} minutes. That&apos;s all I&apos;m
            asking for. Let&apos;s go.&rdquo;
          </p>
        </GlassCard>
      </div>

      {/* --------------------------------------------------------- Stat preview */}
      <GlassCard deep className="gf-anim-rise gf-delay-2 mt-8 p-6">
        <div className="grid grid-cols-4 gap-2">
          <Stat
            value={workout.durationMinutes}
            suffix="m"
            label="Time"
            tone="electric"
          />
          <Stat value={workout.calories} label="kcal" tone="ink" />
          <Stat value={workout.exercises.length} label="Moves" tone="ink" />
          <Stat value={workout.intensity} label="Level" tone="lime" />
        </div>

        {state.settings.kneeSafe && (
          <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-lime-neon/12 p-3.5">
            <ShieldCheck className="size-4 shrink-0 text-lime-deep" strokeWidth={2.6} />
            <p className="text-xs font-semibold text-ink-soft">
              Knee-safe mode is on — jumps and deep bends are already swapped.
            </p>
          </div>
        )}
      </GlassCard>

      {/* ----------------------------------------------------------- Checklist */}
      <section className="gf-anim-rise gf-delay-3 mt-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-mist">
          Quick space check
        </p>
        <div className="grid gap-2">
          {CHECKLIST.map((item) => {
            const active = checked.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={(event) => {
                  if (!active) fireBurst(event.clientX, event.clientY);
                  toggle(item.id);
                }}
                aria-pressed={active}
                className={clsx(
                  "gf-glass gf-press flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all",
                  active ? "border-lime-neon/50" : "hover:border-electric/25",
                )}
              >
                <span
                  className={clsx(
                    "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
                    active ? "bg-lime-neon/20 text-lime-deep" : "bg-electric/8 text-electric",
                  )}
                  aria-hidden
                >
                  <item.icon className="size-4" strokeWidth={2.4} />
                </span>
                <span className="flex-1 text-sm font-semibold text-ink-soft">
                  {item.label}
                </span>
                <span
                  className={clsx(
                    "grid size-5 shrink-0 place-items-center rounded-full transition-all",
                    active
                      ? "bg-lime-neon text-ink"
                      : "border-2 border-ink/12",
                  )}
                  aria-hidden
                >
                  {active && <Check className="size-3" strokeWidth={4} />}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ----------------------------------------------------------------- CTA */}
      <div className="gf-anim-rise gf-delay-4 mt-8">
        <GlowLink href={liveHref} size="xl" fullWidth pulse variant="cyber">
          I&apos;M READY — LET&apos;S CRUSH IT!
          <ArrowRight className="size-5" />
        </GlowLink>

        <div className="mt-4 flex items-center justify-center gap-5 text-xs font-semibold text-mist">
          <span className="flex items-center gap-1.5">
            <Timer className="size-3.5" />
            {workout.durationMinutes} minutes
          </span>
          <span className="flex items-center gap-1.5">
            <Volume2 className="size-3.5" />
            {state.settings.soundEffects ? "Sound on" : "Sound off"}
          </span>
        </div>
      </div>
    </main>
  );
}
