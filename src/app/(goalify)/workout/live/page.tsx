import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { LivePlayer } from "@/components/goalify/workout/live-player";
import { VideoLedPlayer } from "@/components/goalify/workout/video-led-player";
import { RouteLoading } from "@/components/goalify/ui/route-loading";
import { findWorkout } from "@/lib/goalify/workouts";

export const metadata: Metadata = {
  title: "Live workout",
  description:
    "Your guided session with 3D AI form coaching, countdown timers and rep tracking.",
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

// Only a workout picked from the library (never today's default program
// workout) can be video-led, and it's only ever reached via `?workout=id`
// — so a plain server-side lookup here is enough to decide which player to
// mount, no client-side hook needed for the branch itself.
export default async function LiveWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ workout?: string }>;
}) {
  const { workout: workoutId } = await searchParams;
  const workout = workoutId ? findWorkout(workoutId) : undefined;

  return (
    <Suspense fallback={<RouteLoading />}>
      {workout?.video ? (
        <VideoLedPlayer workout={workout} video={workout.video} />
      ) : (
        <LivePlayer />
      )}
    </Suspense>
  );
}
