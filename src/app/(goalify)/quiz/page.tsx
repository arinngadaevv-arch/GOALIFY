import type { Metadata } from "next";
import { QuizFlow } from "@/components/goalify/quiz/quiz-flow";

export const metadata: Metadata = {
  title: "Build your plan",
  description:
    "Answer 11 questions about your goals, training history and joints to get a personalised training and nutrition plan.",
};

export default function QuizPage() {
  return <QuizFlow />;
}
