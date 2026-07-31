import type { Metadata, Viewport } from "next";
import { QuizFlow } from "@/components/goalify/quiz/quiz-flow";

export const metadata: Metadata = {
  title: "Build your plan",
  description:
    "Answer 11 questions about your goals, training history and joints to get a personalised training and nutrition plan.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function QuizPage() {
  return <QuizFlow />;
}
