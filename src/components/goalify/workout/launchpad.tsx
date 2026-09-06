"use client";

import { useSearchParams } from "next/navigation";
import { useGoalify } from "@/lib/goalify/store";
import { findWorkout, resolveWorkout } from "@/lib/goalify/workouts";
import { introVideoUrl } from "@/lib/goalify/video";
import { poseForExercise } from "@/components/goalify/ui/pose-icon";
import { WorkoutHeader } from "./workout-header";
import { WorkoutHero } from "./workout-hero";
import { StartWorkoutButton } from "./start-workout-button";
import { WorkoutMeta } from "./workout-meta";
import { UpNext } from "./up-next";
import { AIGuideFeature } from "./ai-guide-feature";

/**
 * Pre-workout launchpad — "dark luxury" redesign. One job: in three
 * seconds flat, the user should know which workout this is, how long it
 * runs, what the first move is, and where to tap to begin. Everything
 * else (space checklist, hype-coach dialogue, four-stat grid) from the
 * previous version is gone — a premium fitness product doesn't open on a
 * dashboard, it opens on "let's go."
 */
export function Launchpad() {
  const { state, todaysWorkout } = useGoalify();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("workout");
  const baseWorkout = (selectedId && findWorkout(selectedId)) || todaysWorkout;
  const workout = resolveWorkout(baseWorkout, state.settings.kneeSafe);
  const isLibraryPick = baseWorkout.id !== todaysWorkout.id;
  const liveHref = isLibraryPick
    ? `/workout/live?workout=${baseWorkout.id}`
    : "/workout/live";

  const firstExercise = workout.exercises[0];
  const nextExercise = workout.exercises[1];
  const pose = poseForExercise(firstExercise.name, firstExercise.focus);

  return (
    <main className="gf-launch-scope min-h-dvh w-full">
      <div className="mx-auto flex w-full max-w-lg flex-col px-5 pt-6 pb-48 lg:max-w-6xl lg:flex-row lg:items-center lg:gap-16 lg:px-12 lg:py-16 lg:pb-16 2xl:max-w-7xl">
        {/* --------------------------------------------------- Header + hero */}
        <div className="lg:w-[46%] lg:shrink-0">
          <WorkoutHeader
            className="gf-launch-rise"
            category={workout.focus}
            dayLabel={
              isLibraryPick ? "Library pick" : `Day ${state.programDay}`
            }
          />
          <WorkoutHero
            className="mt-5 lg:mt-9"
            index={0}
            exerciseName={firstExercise.name}
            pose={pose}
            videoSrc={introVideoUrl()}
            durationMinutes={workout.durationMinutes}
            exerciseCount={workout.exercises.length}
          />
        </div>

        {/* ------------------------------------------------ Info, CTA, next */}
        <div className="mt-8 flex flex-1 flex-col lg:mt-0">
          {/* CTA — a fixed dock in the mobile thumb zone, a plain block once
              the two-column desktop layout gives it room to just sit in
              place next to the hero. */}
          <div className="fixed inset-x-0 bottom-0 z-40 gf-launch-cta-dock px-5 pt-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] lg:static lg:inset-auto lg:z-auto lg:p-0">
            <div className="gf-launch-rise gf-delay-2 mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
              <StartWorkoutButton href={liveHref} />
              <div className="mt-4">
                <WorkoutMeta
                  exerciseCount={workout.exercises.length}
                  durationMinutes={workout.durationMinutes}
                  intensity={workout.intensity}
                />
              </div>
            </div>
          </div>

          {nextExercise && (
            <div className="gf-launch-rise gf-delay-3 mt-10 lg:mt-12">
              <UpNext exercise={nextExercise} />
            </div>
          )}

          <div className="mt-6">
            <AIGuideFeature />
          </div>
        </div>
      </div>
    </main>
  );
}
