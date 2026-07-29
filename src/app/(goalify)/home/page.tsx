import type { Metadata } from "next";
import { Dashboard } from "@/components/goalify/dashboard";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily hub: workout and nutrition progress rings, today's session and your fuel targets.",
};

export default function HomePage() {
  return <Dashboard />;
}
