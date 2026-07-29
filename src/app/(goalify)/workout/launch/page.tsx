import type { Metadata } from "next";
import { Suspense } from "react";
import { Launchpad } from "@/components/goalify/workout/launchpad";
import { RouteLoading } from "@/components/goalify/ui/route-loading";

export const metadata: Metadata = {
  title: "Get ready",
  description: "Your pre-workout launchpad. Check your space and go.",
};

export default function LaunchPage() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Launchpad />
    </Suspense>
  );
}
