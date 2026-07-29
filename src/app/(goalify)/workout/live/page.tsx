import type { Metadata } from "next";
import { Suspense } from "react";
import { LivePlayer } from "@/components/goalify/workout/live-player";
import { RouteLoading } from "@/components/goalify/ui/route-loading";

export const metadata: Metadata = {
  title: "Live workout",
  description:
    "Your guided session with 3D AI form coaching, countdown timers and rep tracking.",
};

export default function LiveWorkoutPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <LivePlayer />
    </Suspense>
  );
}
