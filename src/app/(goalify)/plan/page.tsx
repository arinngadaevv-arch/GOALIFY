import type { Metadata } from "next";
import { Paywall } from "@/components/goalify/paywall";

export const metadata: Metadata = {
  title: "Your personalised plan",
  description:
    "Your training blueprint, daily fuel targets and projected results — plus your launch offer.",
};

export default function PlanPage() {
  return <Paywall />;
}
