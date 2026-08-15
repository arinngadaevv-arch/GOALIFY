import type { Metadata } from "next";
import { SmartCoach } from "@/components/goalify/smart-coach";

export const metadata: Metadata = {
  title: "Smart Coach",
  description:
    "Answer four quick questions and Goalify Smart Coach picks the right workout for right now — free, rule-based, no AI subscription required.",
};

export default function CoachPage() {
  return <SmartCoach />;
}
