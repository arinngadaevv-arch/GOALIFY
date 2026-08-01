import type { Metadata, Viewport } from "next";
import { Dashboard } from "@/components/goalify/dashboard";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Your daily hub: workout and nutrition progress rings, today's session and your fuel targets.",
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

export default function HomePage() {
  return <Dashboard />;
}
