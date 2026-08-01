import type { Metadata, Viewport } from "next";
import { Paywall } from "@/components/goalify/paywall";

export const metadata: Metadata = {
  title: "Your personalised plan",
  description:
    "Your training blueprint, daily fuel targets and projected results — plus your launch offer.",
};

export const viewport: Viewport = {
  themeColor: "#0b0e14",
  colorScheme: "dark",
};

export default function PlanPage() {
  return <Paywall />;
}
