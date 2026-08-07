import type { Metadata, Viewport } from "next";
import { QuizFlow } from "@/components/goalify/quiz/quiz-flow";

// Landing and the quiz's welcome screen used to be two separate fronts —
// the marketing page here, then another "start" screen at /quiz before
// question one actually showed. QuizFlow's own pre-quiz state (see
// WelcomeCtaStep) already *is* a complete landing page (hero, reviews,
// before/after, CTA — all one uploaded image), so root now renders it
// directly: one screen, one CTA, straight into question one. /quiz still
// renders the same component for any existing links to it.
export const metadata: Metadata = {
  title: "Home Workouts for Overweight Men — No Gym",
  description:
    "Overweight, out of shape, and dread the gym? GOALIFY builds a private, bodyweight-only home plan for men — 24 minutes a day, zero equipment, zero judgment.",
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

export default function LandingPage() {
  return <QuizFlow />;
}
