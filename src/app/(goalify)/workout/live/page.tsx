import type { Metadata } from "next";
import { LivePlayer } from "@/components/goalify/workout/live-player";

export const metadata: Metadata = {
  title: "Live workout",
  description:
    "Your guided session with 3D AI form coaching, countdown timers and rep tracking.",
};

export default function LiveWorkoutPage() {
  return <LivePlayer />;
}
