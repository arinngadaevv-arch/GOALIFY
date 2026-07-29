import type { Metadata } from "next";
import { WorkoutLibrary } from "@/components/goalify/workout-library";

export const metadata: Metadata = {
  title: "Workout Library",
  description:
    "Browse targeted workout tracks — Full Body Burn, Core Crusher, Lower Body & Joints Safe — and start any of them on demand.",
};

export default function WorkoutsPage() {
  return <WorkoutLibrary />;
}
