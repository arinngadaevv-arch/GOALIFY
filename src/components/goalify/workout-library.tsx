"use client";

import Link from "next/link";
import {
  ArrowRight,
  BicepsFlexed,
  Dumbbell,
  Flame,
  Play,
  ShieldCheck,
  Sparkles,
  Target,
  Video,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useGoalify } from "@/lib/goalify/store";
import { PROGRAM, LIBRARY } from "@/lib/goalify/workouts";
import type { Workout } from "@/lib/goalify/types";
import { AppShell } from "./app-shell";
import { GlassCard } from "./ui/glass-card";
import { IconBadge } from "./ui/icon-badge";
import { Pill, SectionHeading, Stat } from "./ui/stat";

const PROGRAM_ICONS: LucideIcon[] = [Dumbbell, BicepsFlexed, Zap];

const TRACK_ICON: Record<string, LucideIcon> = {
  "full-body-burn": Flame,
  "core-crusher": Target,
  "lower-body-joint-safe": ShieldCheck,
  tar2: Video,
};

export function WorkoutLibrary() {
  const { state, todaysWorkout } = useGoalify();

  return (
    <AppShell dark title="Workout Library" subtitle="Pick your track">
      <GlassCard tone="electric" className="gf-anim-rise flex items-center gap-3 p-4">
        <Zap className="size-4 shrink-0 text-electric" />
        <p className="text-xs leading-relaxed text-ink-soft">
          Your program keeps rotating on schedule. Anything you start from
          here still counts toward today&apos;s streak.
        </p>
      </GlassCard>

      <section className="gf-anim-rise gf-delay-2 mt-8">
        <SectionHeading eyebrow="On schedule" title="Your Program" />
        <div className="grid gap-3">
          {PROGRAM.map((workout, index) => (
            <TrackCard
              key={workout.id}
              workout={workout}
              icon={PROGRAM_ICONS[index] ?? Dumbbell}
              isToday={workout.id === todaysWorkout.id}
              kneeSafe={state.settings.kneeSafe}
            />
          ))}
        </div>
      </section>

      <section className="gf-anim-rise gf-delay-3 mt-8">
        <SectionHeading eyebrow="Train on demand" title="Workout Library" />
        <div className="grid gap-3">
          {LIBRARY.map((workout) => (
            <TrackCard
              key={workout.id}
              workout={workout}
              icon={TRACK_ICON[workout.id] ?? Sparkles}
              isToday={false}
              kneeSafe={state.settings.kneeSafe}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function TrackCard({
  workout,
  icon,
  isToday,
  kneeSafe,
}: {
  workout: Workout;
  icon: LucideIcon;
  isToday: boolean;
  kneeSafe: boolean;
}) {
  return (
    <Link href={`/workout/launch?workout=${workout.id}`} className="block">
      <GlassCard deep interactive className="overflow-hidden p-0">
        <div className="p-4">
          <div className="flex items-center gap-4">
            <IconBadge icon={icon} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-base font-extrabold text-ink">
                  {workout.title}
                </p>
                {isToday && (
                  <Pill tone="lime">
                    <Flame className="size-3" strokeWidth={3} />
                    Today
                  </Pill>
                )}
                {kneeSafe && workout.exercises.some((e) => e.kneeLoading) && (
                  <Pill tone="neutral">
                    <ShieldCheck className="size-3" strokeWidth={3} />
                    Safe-swapped
                  </Pill>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-mist">
                {workout.subtitle}
              </p>
            </div>
            <span className="gf-glow-electric grid size-10 shrink-0 place-items-center rounded-full bg-electric text-white">
              <Play className="size-4 fill-current" />
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3">
            <div className="flex items-center gap-5">
              <Stat value={workout.durationMinutes} suffix="m" label="Time" />
              <Stat value={workout.calories} suffix="kcal" label="Burn" />
              <Stat value={workout.intensity} label="Level" />
            </div>
            <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-electric">
              Start <ArrowRight className="size-3" />
            </span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
