import type { Metadata, Viewport } from "next";
import { QuizFlow } from "@/components/goalify/quiz/quiz-flow";

export const metadata: Metadata = {
  title: "Build your plan",
  description:
    "Answer 8 fast questions about your goals, obstacles and training level to get a personalised training and nutrition plan.",
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

export default function QuizPage() {
  return <QuizFlow />;
}
