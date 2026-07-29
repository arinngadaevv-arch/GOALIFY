import type { Metadata } from "next";
import { Launchpad } from "@/components/goalify/workout/launchpad";

export const metadata: Metadata = {
  title: "Get ready",
  description: "Your pre-workout launchpad. Check your space and go.",
};

export default function LaunchPage() {
  return <Launchpad />;
}
