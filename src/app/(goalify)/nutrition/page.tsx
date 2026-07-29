import type { Metadata } from "next";
import { Nutrition } from "@/components/goalify/nutrition";

export const metadata: Metadata = {
  title: "Nutrition & Daily Fuel",
  description:
    "Your daily calorie and protein targets, pre and post workout rules, and hydration tracking. No food logging.",
};

export default function NutritionPage() {
  return <Nutrition />;
}
