import type { Metadata } from "next";
import { Progress } from "@/components/goalify/progress";

export const metadata: Metadata = {
  title: "Progress & Evolution",
  description:
    "Your weight trendline, 30-day completion grid, before/after photo vault and badge shelf.",
};

export default function ProgressPage() {
  return <Progress />;
}
