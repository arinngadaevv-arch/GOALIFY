import type { Metadata } from "next";
import { UnlockCelebration } from "@/components/goalify/unlock-celebration";

export const metadata: Metadata = {
  title: "Plan unlocked",
  description: "Your GOALIFY plan is unlocked. Day 1 starts now.",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return <UnlockCelebration />;
}
